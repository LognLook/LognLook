from fastapi import APIRouter, Depends
from app.schemas.project import (
    Project,
    ProjectCreate,
    ProjectKeywordsUpdate,
    ProjectKeywordsBase,
    ProjectInvite,
    ProjectMembers,
    RoleChange,
)

from app.api.deps import get_project_service, get_current_username
from app.services.project import ProjectService

router = APIRouter()


@router.post("/projects", response_model=Project)
def create_projects(
    project_dto: ProjectCreate,
    service: ProjectService = Depends(get_project_service),
    username: str = Depends(get_current_username),
):
    return service.create_project(project_dto=project_dto, username=username)


@router.post("/projects/invite")
def join_project_by_invite(
    invite_dto: ProjectInvite,
    service: ProjectService = Depends(get_project_service),
    username: str = Depends(get_current_username),
):
    return service.join_project_by_invite(invite_dto=invite_dto, username=username)


@router.get("/projects", response_model=list[Project])
def get_project(
    service: ProjectService = Depends(get_project_service),
    username: str = Depends(get_current_username),
):
    return service.get_projects_by_user(username=username)


@router.get("/projects/{project_id}/keywords", response_model=ProjectKeywordsBase)
def get_project_keyword(
    project_id: int, service: ProjectService = Depends(get_project_service)
):
    return service.get_project_keywords(project_id=project_id)


@router.patch("/projects/{project_id}/keywords", response_model=ProjectKeywordsUpdate)
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


@router.delete("/projects/{project_id}")
def delete_project(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    username: str = Depends(get_current_username)
):
    return service.delete_project(project_id=project_id, username=username)


@router.get("/projects/{project_id}/invite-code")
def get_project_invite_code(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    username: str = Depends(get_current_username)
):
    return service.get_project_invite_code(project_id=project_id, username=username)


@router.get("/projects/{project_id}/members", response_model=list[ProjectMembers])
def get_project_members(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    username: str = Depends(get_current_username),
):
    return service.get_project_members(project_id=project_id, username=username)


@router.patch("/projects/{project_id}/role")
def change_user_role(
    project_id: int,
    role_change: RoleChange,
    service: ProjectService = Depends(get_project_service),
    username: str = Depends(get_current_username),
):
    return service.change_user_role(
        project_id=project_id, role_change=role_change, username=username
    )


