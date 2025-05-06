from fastapi import APIRouter, Depends, HTTPException
from app.schemas.project import ProjectCreate, Project
from sqlalchemy.orm import Session
from server.app.infra.database.session import get_db
from app.crud.project import create_project, get_project as get_projects
from app.crud.user import get_user_by_email



router = APIRouter()


@router.post("/project")
def create_projects(project: ProjectCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=project.user_email)
    if not db_user:
        raise HTTPException(status_code=400, detail="Can't find user")
    
    return create_project(db=db, project=project, user=db_user.id)

@router.get("/project/{user_email}", response_model=list[Project])
def get_project(user_email: str, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user_email)
    if not db_user:
        raise HTTPException(status_code=400, detail="Can't find user")

    return get_projects(db=db, user=db_user.id)