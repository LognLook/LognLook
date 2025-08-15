from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging
from app.repositories import elasticsearch as ElasticsearchRepository
from app.repositories import project as ProjectRepository
from app.repositories import user as UserRepository
from app.schemas.project import (
    ProjectCreate,
    ProjectKeywordsUpdate,
    Project,
    ProjectInvite,
    ProjectMembers,
    RoleChange,
)
from app.core.enums.roles import (
    ProjectRole,
    Permission,
)
from app.core.utils.roles_utils import has_permission, can_manage_role


class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    def create_project(self, project_dto: ProjectCreate, username: str) -> Project:
        """프로젝트 생성 서비스"""
        db_user = UserRepository.get_user_by_username(db=self.db, username=username)
        if not db_user:
            raise HTTPException(status_code=400, detail="Can't find user")

        db_project = ProjectRepository.create_project(
            db=self.db, project=project_dto, user=db_user.id
        )
        ElasticsearchRepository.create_project_index(index_name=db_project.index)

        return db_project

    def get_project_by_id(self, project_id: int) -> Project:
        """프로젝트 조회 서비스"""
        return ProjectRepository.get_project_by_id(self.db, project_id=project_id)

    def get_projects_by_user(self, username: str) -> list:
        """사용자의 프로젝트 목록 조회 서비스"""
        db_user = UserRepository.get_user_by_username(db=self.db, username=username)
        if not db_user:
            raise HTTPException(status_code=400, detail="Can't find user")

        return ProjectRepository.get_project_by_user(db=self.db, user_id=db_user.id)

    def get_project_keywords(self, project_id: int) -> dict:
        """프로젝트 키워드 조회 서비스"""
        db_project = ProjectRepository.get_project_by_id(self.db, project_id=project_id)

        if not db_project:
            raise HTTPException(status_code=400, detail="Can't find project")

        return ProjectRepository.get_project_keyword(db=self.db, project=db_project)

    def update_project_keywords(
        self, project_id: int, keywords_update: ProjectKeywordsUpdate
    ) -> dict:
        """프로젝트 키워드 업데이트 서비스"""
        project = ProjectRepository.get_project_by_id(self.db, project_id=project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        updated_project = ProjectRepository.update_project_keyword(
            db=self.db, project=project, keywords=keywords_update.keywords
        )

        if not updated_project:
            raise HTTPException(
                status_code=400, detail="Failed to update project keywords"
            )

        return keywords_update

    def delete_project(self, project_id: int, username: str) -> dict:
        """프로젝트 삭제 서비스"""
        # 프로젝트 존재 여부 확인
        db_project = ProjectRepository.get_project_by_id(self.db, project_id=project_id)
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")

        # 사용자 확인
        db_user = UserRepository.get_user_by_username(db=self.db, username=username)
        if not db_user:
            raise HTTPException(status_code=400, detail="Can't find user")

        # 사용자의 프로젝트 내 역할 확인
        user_role = ProjectRepository.get_user_role_in_project(
            db=self.db, user_id=db_user.id, project_id=project_id
        )

        if not user_role:
            raise HTTPException(
                status_code=403, detail="You are not a member of this project"
            )

        # 프로젝트 멤버 수 확인
        members_count = ProjectRepository.get_project_members_count(
            db=self.db, project_id=project_id
        )

        if user_role == "master":
            if members_count > 1:
                raise HTTPException(
                    status_code=400, detail="The master cannot leave the project."
                )
            else:
                # 마스터가 유일한 멤버인 경우 프로젝트 전체 삭제
                success = ProjectRepository.delete_project(
                    db=self.db, project_id=project_id, user_id=db_user.id
                )

                if not success:
                    raise HTTPException(
                        status_code=400, detail="Failed to delete project"
                    )

                # Elasticsearch 인덱스도 삭제
                try:
                    ElasticsearchRepository.delete_project_index(
                        index_name=db_project.index
                    )
                except Exception as e:
                    logging.error(f"Failed to delete Elasticsearch index: {e}")

                return {"message": "Project deleted successfully"}
        else:
            # 멤버인 경우 프로젝트에서 자신만 제거
            success = ProjectRepository.delete_user_project(
                db=self.db, user_id=db_user.id, project_id=project_id
            )

            if not success:
                raise HTTPException(status_code=400, detail="Failed to leave project")

            return {"message": "Successfully left the project"}

    def get_project_invite_code(self, project_id: int, username: str) -> dict:
        """프로젝트 초대코드 조회 서비스"""
        # 프로젝트 존재 여부 확인
        db_project = ProjectRepository.get_project_by_id(self.db, project_id=project_id)
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")

        # 사용자 확인
        db_user = UserRepository.get_user_by_username(db=self.db, username=username)
        if not db_user:
            raise HTTPException(status_code=400, detail="Can't find user")

        # 사용자가 프로젝트 멤버인지 확인
        user_role = ProjectRepository.get_user_role_in_project(
            db=self.db, user_id=db_user.id, project_id=project_id
        )

        if not user_role:
            raise HTTPException(
                status_code=403, detail="You are not a member of this project"
            )

        return {"invite_code": db_project.invite_code}

    def join_project_by_invite(self, invite_dto: ProjectInvite, username: str) -> dict:
        """초대코드로 프로젝트 참여 서비스"""
        db_user = UserRepository.get_user_by_username(db=self.db, username=username)
        if not db_user:
            raise HTTPException(status_code=400, detail="Can't find user")

        # 초대코드로 프로젝트 찾기
        db_project = ProjectRepository.get_project_by_invite_code(
            db=self.db, invite_code=invite_dto.invite_code
        )
        if not db_project:
            raise HTTPException(status_code=404, detail="Invalid invite code")

        # 사용자를 프로젝트에 멤버로 추가
        success = ProjectRepository.add_user_to_project(
            db=self.db, user_id=db_user.id, project_id=db_project.id, role="member"
        )

        if not success:
            raise HTTPException(
                status_code=400, detail="Failed to join project or already a member"
            )

        return {
            "message": "Successfully joined the project",
            "project_id": db_project.id,
            "project_name": db_project.name,
        }

    def get_project_members(self, project_id: int, username: str) -> List[dict]:
        """프로젝트 역할 조회 서비스"""
        db_project = ProjectRepository.get_project_by_id(self.db, project_id=project_id)
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")

        # 사용자 확인
        db_user = UserRepository.get_user_by_username(db=self.db, username=username)
        if not db_user:
            raise HTTPException(status_code=400, detail="Can't find user")

        # 사용자가 프로젝트 멤버인지 확인
        user_role = ProjectRepository.get_user_role_in_project(
            db=self.db, user_id=db_user.id, project_id=project_id
        )

        if not user_role:
            raise HTTPException(
                status_code=403, detail="You are not a member of this project"
            )

        return ProjectRepository.get_project_members(db=self.db, project_id=project_id)

    def change_user_role(
        self, project_id: int, role_change: RoleChange, username: str
    ) -> dict:
        """사용자 역할 변경 서비스"""
        # 프로젝트 존재 여부 확인
        db_project = ProjectRepository.get_project_by_id(self.db, project_id=project_id)
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")

        # 요청자 확인
        db_user = UserRepository.get_user_by_username(db=self.db, username=username)
        if not db_user:
            raise HTTPException(status_code=400, detail="Can't find user")

        # 요청자의 역할 확인
        requester_role = ProjectRepository.get_user_role_in_project(
            db=self.db, user_id=db_user.id, project_id=project_id
        )

        if not requester_role:
            raise HTTPException(
                status_code=403, detail="You are not a member of this project"
            )

        # 역할 변경 권한 확인 (master, manager, moderator만 가능)
        requester_project_role = ProjectRole(requester_role)
        if not has_permission(requester_project_role, Permission.CHANGE_ROLE):
            raise HTTPException(
                status_code=403, detail="You don't have permission to change roles"
            )

        # 대상 사용자의 현재 역할 확인
        target_role = ProjectRepository.get_user_role_in_project(
            db=self.db, user_id=role_change.user_id, project_id=project_id
        )

        if not target_role:
            raise HTTPException(
                status_code=400, detail="Target user is not a member of this project"
            )

        target_project_role = ProjectRole(target_role)

        # 계층 구조 확인 (상위 역할만 하위 역할을 관리할 수 있음)
        if not can_manage_role(requester_project_role, target_project_role):
            raise HTTPException(
                status_code=403, detail="You can only manage lower-level roles"
            )

        # 역할 변경 실행
        success = ProjectRepository.update_user_role_in_project(
            db=self.db,
            user_id=role_change.user_id,
            project_id=project_id,
            new_role=role_change.new_role.value,
        )

        if not success:
            raise HTTPException(status_code=400, detail="Failed to change user role")

        return {"message": "User role changed successfully"}
