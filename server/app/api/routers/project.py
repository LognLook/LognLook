from fastapi import APIRouter, Depends, Header
import json
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.project import (
    ProjectBase,
    Project,
    ProjectKeywordsUpdate,
    ProjectKeywordsBase,
)
from sqlalchemy.orm import Session
from app.infra.database.session import get_db

from app.core.config.dependencies import get_project_service
from app.services.project import ProjectService

router = APIRouter()


@router.post("/project", response_model=Project)
def create_projects(
    project_dto: ProjectCreate, service: ProjectService = Depends(get_project_service)
):
    return service.create_project(project_dto=project_dto, user_id=x_user_id)


@router.get("/project", response_model=list[Project])
def get_project(
    user_email: str, service: ProjectService = Depends(get_project_service)
):
    return service.get_projects_by_user(user_id=x_user_id)


@router.get("/project/{project_id}/keyword", response_model=ProjectKeywordsBase)
def get_project_keyword(
    project_id: int, service: ProjectService = Depends(get_project_service)
):
    return service.get_project_keywords(project_id=project_id)


@router.patch("/{project_id}/keywords", response_model=ProjectKeywordsUpdate)
def update_project_keyword(
    project_id: int,
    keywords_update: ProjectKeywordsUpdate,
    service: ProjectService = Depends(get_project_service),
):
    # 키워드 업데이트
    updated_project = service.update_project_keywords(
        project_id=project_id, keywords_update=keywords_update
    )
    return updated_project
