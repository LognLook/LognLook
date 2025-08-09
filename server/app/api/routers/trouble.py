from fastapi import APIRouter, Depends
from app.schemas.trouble import (
    TroubleCreate, 
    Trouble, 
    TroubleUpdate, 
    TroubleListQuery, 
    TroubleListResponse,
    TroubleWithLogs
)
from app.services.trouble import TroubleService
from app.api.deps import get_trouble_service, get_current_username

router = APIRouter()


@router.post("/trouble", response_model=Trouble)
def create_trouble(
    create_trouble_dto: TroubleCreate, 
    service: TroubleService = Depends(get_trouble_service),
    username: str = Depends(get_current_username)
):
    """새로운 trouble을 생성합니다."""
    return service.create_trouble(create_trouble_dto, username)


@router.get("/trouble/{trouble_id}", response_model=TroubleWithLogs)
def get_trouble(
    trouble_id: int, 
    service: TroubleService = Depends(get_trouble_service),
    username: str = Depends(get_current_username)
):
    """특정 trouble을 조회합니다."""
    return service.get_trouble_by_id(trouble_id, username)


@router.put("/trouble/{trouble_id}", response_model=Trouble)
def update_trouble(
    trouble_id: int, 
    trouble_update_dto: TroubleUpdate, 
    service: TroubleService = Depends(get_trouble_service),
    username: str = Depends(get_current_username)
):
    """기존 trouble을 업데이트합니다."""
    return service.update_trouble(trouble_id, trouble_update_dto, username)


@router.delete("/trouble/{trouble_id}")
def delete_trouble(
    trouble_id: int, 
    service: TroubleService = Depends(get_trouble_service),
    username: str = Depends(get_current_username)
):
    """trouble을 삭제합니다."""
    service.delete_trouble(trouble_id, username)
    return {"message": "Trouble deleted successfully"}


@router.get("/project/{project_id}/troubles", response_model=TroubleListResponse)
def get_project_troubles(
    project_id: int,
    query_params: TroubleListQuery = Depends(),
    service: TroubleService = Depends(get_trouble_service),
    username: str = Depends(get_current_username)
):
    """프로젝트의 trouble 목록을 조회합니다."""
    return service.get_project_troubles(project_id, query_params, username)