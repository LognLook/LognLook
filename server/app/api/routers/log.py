from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Header
from datetime import datetime

from app.core.enums.log_filter import LogLevelFilter, LogTimeFilter
from app.core.config.dependencies import get_log_service
from app.services.log import LogService

router = APIRouter()


# 메인보드 로그 그래프 조회
@router.get("/log/mainboard")
def get_log(
    project_id: int,
    log_time: LogTimeFilter = LogTimeFilter.DAY,
    service: LogService = Depends(get_log_service),
    x_user_id: int = Header(..., description="클라이언트에서 전달받은 사용자 ID"),
):
    return service.get_logs(x_user_id, project_id, log_time)


@router.get("/log/recent")
def get_recent_logs(
    project_id: int,
    x_user_id: int = Header(..., description="클라이언트에서 전달받은 사용자 ID"),
    count: int = Query(..., description="무한 스크롤 조회 횟수, 1부터 시작"),
    service: LogService = Depends(get_log_service),
):
    return service.get_recent_logs(
        user_id=x_user_id,
        project_id=project_id,
        count=count,
    )


@router.get("/log/detail", response_model=List[dict])
def get_log_detail(
    project_id: int = Query(..., description="프로젝트 ID"),
    log_ids: Optional[List[str]] = Query(..., description="로그 ID 리스트"),
    service: LogService = Depends(get_log_service),
):
    return service.get_log_detail(project_id, log_ids)
