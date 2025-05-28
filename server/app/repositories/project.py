from typing import List
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.project_setting import ProjectSetting
from app.models.user_project import UserProject
from app.schemas.project import ProjectCreate
from app.repositories.user import get_user_by_id
from fastapi import HTTPException
import uuid


def _create_unique_elastic_name(db: Session, max_retries=5):
    for _ in range(max_retries):
        index = uuid.uuid4().hex[:8]
        if not db.query(Project).filter_by(index=index).first():
            return index
    raise HTTPException(status_code=500, detail="이름 중복이 너무 많습니다.")


def create_project(db: Session, project: ProjectCreate, user: int) -> Project:
    db_project = Project(
        name=project.name,
        description=project.description,
        create_by=user,
        index=_create_unique_elastic_name(db),
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
        user_project = UserProject(user_id=user, project_id=db_project.id)
        db.add(user_project)
        db.commit()

    return db_project


def get_project_by_user(db: Session, user_id: int) -> list[Project]:
    db_user = get_user_by_id(db, id=user_id)
    return db_user.projects


def get_project_by_id(db: Session, project_id: int) -> Project | None:
    return db.query(Project).filter(Project.id == project_id).first()


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
