from datetime import datetime, timedelta
from app.core.enums.log_filter import LogTimeFilter
from typing import Tuple


def get_start_time(time_filter: LogTimeFilter) -> Tuple[str, str]:
    """시간 필터에 따른 시작 시간과 현재 시간을 반환하는 함수

    Args:
        time_filter (LogTimeFilter): 시간 필터 타입

    Returns:
        Tuple[str, str]: (시작 시간, 현재 시간) ISO 형식의 시간 문자열 튜플
    """
    now = datetime.now()

    if time_filter == LogTimeFilter.DAY:
        start_time = now - timedelta(days=1)
    elif time_filter == LogTimeFilter.WEEK:
        start_time = now - timedelta(days=7)
    elif time_filter == LogTimeFilter.MONTH:
        start_time = now - timedelta(days=30)
    else:
        raise ValueError(f"Invalid time filter: {time_filter}")

    return start_time.isoformat(), now.isoformat()


def get_log_time_by_count(count: int) -> Tuple[str, str]:
    """최근 로그 시간 조회 함수

    Args:
        count (int): 조회할 로그 개수

    Returns:
        Tuple[str, str]: (시작 시간, 현재 시간) ISO 형식의 시간 문자열 튜플
    """
    now = datetime.now()
    start_time = now - timedelta(days=count * 3)
    end_time = now - timedelta(days=(count - 1) * 3)

    return start_time.isoformat(), end_time.isoformat()
