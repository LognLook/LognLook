import json
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.project_setting import ProjectSetting
from app.models.user_project import UserProject
from app.schemas.project import ProjectCreate, ProjectKeywordsUpdate
from app.crud.user import get_user_by_id


def create_project(db:Session, project:ProjectCreate,  user:int):
    
    db_project = Project(
        name = project.name,
        description = project.description,
        create_by = user
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    # 중복 연결 방지 (이미 연결된 경우 체크)
    exists_1 = db.query(ProjectSetting).filter_by(project_id=db_project.id).first()
    if not exists_1:
        setting = ProjectSetting(
            project_id=db_project.id
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
    
    # 중복 연결 방지 (이미 연결된 경우 체크)
    exists_2 = db.query(UserProject).filter_by(user_id=user, project_id=db_project.id).first()
    if not exists_2:
        user_project = UserProject(
            user_id=user, 
            project_id=db_project.id
            )
        db.add(user_project)
        db.commit()
        db.refresh(user_project)
        return user_project

    return db_project


def get_project_by_user(db:Session, user:int):
    user = get_user_by_id(db, user)  
    return user.projects 

def get_project_by_id(db:Session, project_id:int):
    return db.query(Project).filter_by(id=project_id).first()

def get_project_keyword(db:Session, project:Project):
    keywords = project.setting.log_keywords
    if keywords is None:
        keywords = []
    return {"keywords": keywords}

def update_project_keyword(db: Session, project_id: int, keywords_update: ProjectKeywordsUpdate):

    db_project = get_project_by_id(db, project_id)
    if not db_project:
        return None
    
    # keywords를 JSON 형태로 저장
    db_project.setting.log_keywords = keywords_update.keywords
    db.commit()
    db.refresh(db_project)
    return db_project
    