import re
from typing import Optional, List, Dict, Any


def extract_timestamp_from_message(message: str) -> Optional[str]:
    """
    로그 메시지에서 타임스탬프를 추출합니다.

    Args:
        message (str): 로그 메시지

    Returns:
        Optional[str]: 추출된 타임스탬프 (YYYY-MM-DD HH:MM:SS 형식) 또는 None
    """
    # 정규표현식 패턴: YYYY-MM-DD HH:MM:SS 형식
    pattern = r"\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}"
    match = re.search(pattern, message)

    if match:
        return match.group()
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


def process_logs(logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    로그 목록을 처리하여 타임스탬프와 로그 레벨을 추출합니다.

    Args:
        logs (List[Dict[str, Any]]): 처리할 로그 목록

    Returns:
        List[Dict[str, Any]]: 처리된 로그 목록
    """
    if not isinstance(logs, list):
        return []

    processed_logs = []
    for log in logs:
        new_log = {}
        if "message" in log:
            timestamp = extract_timestamp_from_message(log["message"])
            log_level = extract_log_level(log["message"])
            if timestamp:
                new_log["extracted_timestamp"] = timestamp
            if log_level:
                new_log["log_level"] = log_level
        processed_logs.append(new_log)

    return processed_logs


def remove_embedding_from_logs(logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    로그 목록에서 embedding 필드를 제거합니다.

    Args:
        logs (List[Dict[str, Any]]): 처리할 로그 목록

    Returns:
        List[Dict[str, Any]]: embedding이 제거된 로그 목록
    """
    if isinstance(logs, list):
        for log in logs:
            if isinstance(log, dict) and "embedding" in log:
                del log["embedding"]
    return logs
