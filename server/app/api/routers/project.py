from fastapi import APIRouter, Depends
from app.schemas.project import (
    ProjectBase,
    Project,
    ProjectCreate,
    ProjectKeywordsUpdate,
    ProjectKeywordsBase,
)

from app.api.deps import get_project_service, get_current_username
from app.services.project import ProjectService

router = APIRouter()


@router.post("/project", response_model=Project)
def create_projects(
    project_dto: ProjectCreate,
    service: ProjectService = Depends(get_project_service),
    username: str = Depends(get_current_username)
):
    return service.create_project(project_dto=project_dto, username=username)


@router.get("/project", response_model=list[Project])
def get_project(
    service: ProjectService = Depends(get_project_service),
    username: str = Depends(get_current_username)
):
    return service.get_projects_by_user(username=username)


@router.get("/project/{project_id}/keyword", response_model=ProjectKeywordsBase)
def get_project_keyword(
    project_id: int, service: ProjectService = Depends(get_project_service)
):
    return service.get_project_keywords(project_id=project_id)


@router.patch("/project/{project_id}/keywords", response_model=ProjectKeywordsUpdate)
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


@router.delete("/project/{project_id}")
def delete_project(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    username: str = Depends(get_current_username)
):
    return service.delete_project(project_id=project_id, username=username)
