from typing import List
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.project_setting import ProjectSetting
from app.models.user_project import UserProject
from app.schemas.project import ProjectCreate
from app.repositories.user import get_user_by_id


def create_project(db: Session, project: ProjectCreate, user: int) -> Project:
    db_project = Project(
        name=project.name, description=project.description, create_by=user
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    # ProjectSetting 생성
    exists_1 = db.query(ProjectSetting).filter_by(project_id=db_project.id).first()
    if not exists_1:
        setting = ProjectSetting(project_id=db_project.id)
        db.add(setting)
        db.commit()
        db.refresh(setting)

    # UserProject 연결
    exists_2 = (
        db.query(UserProject).filter_by(user_id=user, project_id=db_project.id).first()
    )
    if not exists_2:
        user_project = UserProject(user_id=user, project_id=db_project.id)
        db.add(user_project)
        db.commit()
        db.refresh(user_project)
        return user_project

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
