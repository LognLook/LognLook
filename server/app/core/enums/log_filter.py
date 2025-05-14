from enum import Enum


class LogLeverFilter(str, Enum):
    """로그 필터 타입을 정의하는 enum"""

    ERROR = "error"  # 에러 로그
    WARNING = "warning"  # 경고 로그
    INFO = "info"  # 정보 로그
    DEBUG = "debug"  # 디버그 로그
    CRITICAL = "critical"  # 심각한 에러 로그
    CUSTOM = "custom"  # 사용자 정의 필터


class LogTimeFilter(str, Enum):
    """로그 시간 필터를 정의하는 enum"""

    DAY = "day"  # 오늘
    WEEK = "week"  # 이번 주
    MONTH = "month"  # 이번 달
