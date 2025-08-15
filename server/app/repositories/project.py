from typing import List
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.project_setting import ProjectSetting
from app.models.user_project import UserProject
from app.schemas.project import ProjectCreate
from app.repositories.user import get_user_by_id
from fastapi import HTTPException
import uuid
import secrets


def _create_uuid(db: Session, max_retries=5):
    for _ in range(max_retries):
        index = uuid.uuid4().hex
        if not db.query(Project).filter_by(index=index).first():
            return index
    raise HTTPException(status_code=500, detail="이름 중복이 너무 많습니다.")


def create_project(db: Session, project: ProjectCreate, user: int) -> Project:
    db_project = Project(
        name=project.name,
        description=project.description,
        create_by=user,
        index=_create_uuid(db),
        api_key=_create_uuid(db),
        invite_code=secrets.token_urlsafe(16),
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    # ProjectSetting 생성
    if not db.query(ProjectSetting).filter_by(project_id=db_project.id).first():
        setting = ProjectSetting(project_id=db_project.id)
        db.add(setting)
        db.commit()

    # UserProject 연결
    if (
        not db.query(UserProject)
        .filter_by(user_id=user, project_id=db_project.id)
        .first()
    ):
        user_project = UserProject(
            user_id=user, project_id=db_project.id, role="master"
        )
        db.add(user_project)
        db.commit()

    return db_project


def get_project_by_user(db: Session, user_id: int) -> list[Project]:
    db_user = get_user_by_id(db, user_id)
    return db_user.projects


def get_project_by_id(db: Session, project_id: int) -> Project | None:
    return db.query(Project).filter(Project.id == project_id).first()


def get_project_by_invite_code(db: Session, invite_code: str) -> Project | None:
    """초대코드로 프로젝트 조회"""
    return db.query(Project).filter(Project.invite_code == invite_code).first()


def get_project_keyword(db: Session, project: Project) -> dict:
    keywords = project.setting.log_keywords
    if keywords is None:
        keywords = []
    return {"keywords": keywords}


def update_project_keyword(
    db: Session, project: Project, keywords: List[str]
) -> Project | None:

    project.setting.log_keywords = keywords
    db.commit()
    db.refresh(project)
    return project


def get_user_role_in_project(db: Session, user_id: int, project_id: int) -> str | None:
    """프로젝트에서 사용자의 역할 조회"""
    user_project = (
        db.query(UserProject)
        .filter(UserProject.user_id == user_id, UserProject.project_id == project_id)
        .first()
    )
    return user_project.role if user_project else None


def get_project_members_count(db: Session, project_id: int) -> int:
    """프로젝트 멤버 수 조회"""
    return db.query(UserProject).filter(UserProject.project_id == project_id).count()


def add_user_to_project(db: Session, user_id: int, project_id: int, role: str = "member") -> bool:
    """프로젝트에 사용자 추가"""
    try:
        # 이미 프로젝트 멤버인지 확인
        existing_user_project = (
            db.query(UserProject)
            .filter(UserProject.user_id == user_id, UserProject.project_id == project_id)
            .first()
        )
        
        if existing_user_project:
            return False  # 이미 멤버임
            
        user_project = UserProject(user_id=user_id, project_id=project_id, role=role)
        db.add(user_project)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(f"Error adding user to project: {e}")
        return False


def delete_user_project(db: Session, user_id: int, project_id: int) -> bool:
    """프로젝트에서 사용자 제거"""
    try:
        user_project = (
            db.query(UserProject)
            .filter(
                UserProject.user_id == user_id, UserProject.project_id == project_id
            )
            .first()
        )

        if not user_project:
            return False

        db.delete(user_project)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(f"Error removing user from project: {e}")
        return False


def delete_project(db: Session, project_id: int, user_id: int) -> bool:
    """프로젝트 삭제"""
    try:
        # 프로젝트가 사용자에게 속해있는지 확인
        user_project = (
            db.query(UserProject)
            .filter(
                UserProject.user_id == user_id, UserProject.project_id == project_id
            )
            .first()
        )

        if not user_project:
            return False

        # 프로젝트 조회
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return False

        # 관련 데이터 삭제 (UserProject, ProjectSetting)
        db.query(UserProject).filter(UserProject.project_id == project_id).delete()

        db.query(ProjectSetting).filter(
            ProjectSetting.project_id == project_id
        ).delete()

        # 프로젝트 삭제
        db.delete(project)
        db.commit()

        return True

    except Exception as e:
        db.rollback()
        print(f"Error deleting project: {e}")
        return False
