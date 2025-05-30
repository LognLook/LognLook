from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories import elasticsearch as ElasticsearchRepository
from app.repositories import project as ProjectRepository
from app.repositories import user as UserRepository
from app.schemas.project import ProjectCreate, ProjectKeywordsUpdate, Project


class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    def create_project(self, project_dto: ProjectCreate) -> Project:
        """프로젝트 생성 서비스"""
        db_user = UserRepository.get_user_by_email(
            db=self.db, email=project_dto.user_email
        )
        if not db_user:
            raise HTTPException(status_code=400, detail="Can't find user")

        db_project = ProjectRepository.create_project(
            db=self.db, project=project_dto, user=db_user.id
        )
        ElasticsearchRepository.create_project_index(index_name=db_project.index)

        print("===")
        return db_project

    def get_project_by_id(self, project_id: int) -> Project:
        """프로젝트 조회 서비스"""
        return ProjectRepository.get_project_by_id(self.db, project_id=project_id)

    def get_projects_by_user(self, user_email: str) -> list:
        """사용자의 프로젝트 목록 조회 서비스"""
        db_user = UserRepository.get_user_by_email(db=self.db, email=user_email)
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
