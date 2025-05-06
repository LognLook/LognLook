from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.user_project import UserProject
from app.schemas.project import ProjectCreate
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
    
    # 3. 중복 연결 방지 (이미 연결된 경우 체크)
    exists = db.query(UserProject).filter_by(user_id=user, project_id=db_project.id).first()
    if not exists:
        user_project = UserProject(
            user_id=user, 
            project_id=db_project.id
            )
        db.add(user_project)
        db.commit()
        db.refresh(user_project)
        return user_project

    return db_project


def get_project(db:Session, user:int):
    user = get_user_by_id(db, user)  
    print(user.projects)  
    print("dfdf")
    return user.projects 