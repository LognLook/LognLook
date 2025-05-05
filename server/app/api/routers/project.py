from fastapi import APIRouter, Depends, HTTPException
from schemas.project import ProjectCreate, Project
from schemas.users import UserBase
from sqlalchemy.orm import Session
from db.session import get_db
from crud.project import create_project, get_project
from crud.user import get_user_by_email



router = APIRouter()


@router.post("/project")
def create_projects(project: ProjectCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=project.user_email)
    if not db_user:
        raise HTTPException(status_code=400, detail="Can't find user")
    
    return create_project(db=db, project=project, user=db_user.id)

@router.get("/project", response_model=list[Project])
def get_project(user: UserBase, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if not db_user:
        raise HTTPException(status_code=400, detail="Can't find user")
    
    return get_project(db=db, user=db_user.id)