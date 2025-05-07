import json
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.project import (
    ProjectCreate,
    Project,
    ProjectKeywordsUpdate,
    ProjectKeywordsBase,
)
from sqlalchemy.orm import Session
from app.infra.database.session import get_db
from app.crud.project import (
    create_project,
    get_project_by_user,
    get_project_by_id,
    get_project_keyword as get_project_keywords,
    update_project_keyword as update_project_keywords,
)
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

    return get_project_by_user(db=db, user=db_user.id)


@router.get("/project/{project_id}/keyword", response_model=ProjectKeywordsBase)
def get_project_keyword(project_id: int, db: Session = Depends(get_db)):
    db_project = get_project_by_id(db=db, project_id=project_id)
    if not db_project:
        raise HTTPException(status_code=400, detail="Can't find project")
    return get_project_keywords(db=db, project=db_project)


@router.patch("/{project_id}/keywords", response_model=ProjectKeywordsUpdate)
def update_project_keyword(
    project_id: int,
    keywords_update: ProjectKeywordsUpdate,
    db: Session = Depends(get_db),
):
    # 키워드 업데이트
    updated_project = update_project_keywords(
        db=db, project_id=project_id, keywords_update=keywords_update
    )

    if not updated_project:
        raise HTTPException(status_code=400, detail="Failed to update project keywords")

    return keywords_update

@router.get("/project/{project_id}/keyword", response_model=ProjectKeywordsBase)
def get_project_keyword(project_id: int, db: Session = Depends(get_db)):
    db_project = get_project_by_id(db=db, project_id=project_id)
    if not db_project:
        raise HTTPException(status_code=400, detail="Can't find project")
    return get_project_keywords(db=db, project=db_project)