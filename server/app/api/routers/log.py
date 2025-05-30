from typing import Optional
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


@router.get("/log/date-range")
def get_logs_by_date_range(
    project_id: int,
    start_date: datetime = Query(..., description="시작 날짜 (YYYY-MM-DD 형식)"),
    end_date: datetime = Query(..., description="종료 날짜 (YYYY-MM-DD 형식)"),
    log_level: Optional[LogLevelFilter] = None,
    log_time: Optional[LogTimeFilter] = None,
    service: LogService = Depends(get_log_service),
    x_user_id: int = Header(..., description="클라이언트에서 전달받은 사용자 ID"),
):
    return service.get_logs_by_date_range(
        user_id=x_user_id,
        project_id=project_id,
        start_date=start_date,
        end_date=end_date,
        log_level=log_level,
    )
