import re
from typing import Optional, List, Dict, Any
from datetime import datetime


def extract_timestamp_from_message(message: str) -> Optional[str]:
    """
    로그 메시지에서 타임스탬프를 추출하고 ISO 형식으로 변환합니다.

    Args:
        message (str): 로그 메시지

    Returns:
        Optional[str]: ISO 형식으로 변환된 타임스탬프 (YYYY-MM-DDTHH:MM:SS.SSSSSS) 또는 None
    """
    # 정규표현식 패턴: YYYY-MM-DD HH:MM:SS.SSS 형식
    pattern = r"\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}(?:\.\d{3})?"
    match = re.search(pattern, message)

    if match:
        ts = match.group()
        try:
            # datetime 객체로 파싱
            dt = datetime.strptime(
                ts, "%Y-%m-%d %H:%M:%S.%f" if "." in ts else "%Y-%m-%d %H:%M:%S"
            )
            # ISO 포맷 문자열로 변환
            return dt.isoformat()
        except ValueError:
            return None
    return None


def extract_log_level(message: str) -> Optional[str]:
    """
    로그 메시지에서 로그 레벨(INFO, WARN, ERROR)을 추출합니다.

    Args:
        message (str): 로그 메시지

    Returns:
        Optional[str]: 추출된 로그 레벨 (INFO, WARN, ERROR 중 하나) 또는 None
    """
    log_levels = ["INFO", "WARN", "ERROR"]
    for level in log_levels:
        if level in message:
            return level
    return None


def extract_logs(logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    로그 목록을 처리하여 타임스탬프와 로그 레벨을 추출합니다.

    Args:
        logs (List[Dict[str, Any]]): 처리할 로그 목록

    Returns:
        List[Dict[str, Any]]: 처리된 로그 목록
    """
    if not isinstance(logs, list):
        return []
    # message_timestamp, log_level 추출
    processed_logs = []
    for log in logs:
        new_log = {}
        if "_id" in log:
            new_log["id"] = log["_id"]
        if "message_timestamp" in log["_source"]:
            new_log["message_timestamp"] = log["_source"]["message_timestamp"]
        if "log_level" in log["_source"]:
            new_log["log_level"] = log["_source"]["log_level"]
        if "keyword" in log["_source"]:
            new_log["keyword"] = log["_source"]["keyword"]
        processed_logs.append(new_log)

    return processed_logs


def remove_vector_from_logs(logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    로그 목록에서 vector 필드를 제거합니다.

    Args:
        logs (List[Dict[str, Any]]): 처리할 로그 목록

    Returns:
        List[Dict[str, Any]]: vector이 제거된 로그 목록
    """
    if isinstance(logs, list):
        for log in logs:
            if isinstance(log, dict) and "vector" in log["_source"]:
                del log["_source"]["vector"]
    return logs
