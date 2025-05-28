from typing import Optional
from fastapi import APIRouter, Depends, Query
from datetime import datetime

from app.core.enums.log_filter import LogLevelFilter, LogTimeFilter
from app.core.config.dependencies import get_log_service
from app.services.log import LogService


router = APIRouter()


# 메인보드 로그 그래프 조회
@router.get("/log/mainboard")
def get_log(
    user_email: str,
    project_id: int,
    log_time: LogTimeFilter = LogTimeFilter.DAY,
    service: LogService = Depends(get_log_service),
):
    return service.get_logs(user_email, project_id, log_time)



@router.get("/log/date-range")
def get_logs_by_date_range(
    user_email: str,
    project_id: int,
    start_date: datetime = Query(..., description="시작 날짜 (YYYY-MM-DD 형식)"),
    end_date: datetime = Query(..., description="종료 날짜 (YYYY-MM-DD 형식)"),
    log_level: Optional[LogLevelFilter] = None,
    log_time: Optional[LogTimeFilter] = None,
    service: LogService = Depends(get_log_service),
):
    return service.get_logs_by_date_range(
        user_email=user_email,
        project_id=project_id,
        start_date=start_date,
        end_date=end_date,
        log_level=log_level,
    )
