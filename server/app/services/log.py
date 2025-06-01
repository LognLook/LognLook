from typing import List
from sqlalchemy.orm import Session
from datetime import datetime
import re

from app.core.utils.time_utils import get_start_time
from app.services.project import ProjectService
from app.repositories import user as UserRepository
from app.repositories import elasticsearch as ElasticsearchRepository


class LogService:
    def __init__(self, db: Session):
        self.db = db

    def _extract_timestamp_from_message(self, message: str) -> str:
        """
        로그 메시지에서 타임스탬프를 추출합니다.

        Args:
            message (str): 로그 메시지

        Returns:
            str: 추출된 타임스탬프 (YYYY-MM-DD HH:MM:SS 형식)
        """
        # 정규표현식 패턴: YYYY-MM-DD HH:MM:SS 형식
        pattern = r"\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}"
        match = re.search(pattern, message)

        if match:
            return match.group()
        return None

    def _extract_log_level(self, message: str) -> str:
        """
        로그 메시지에서 로그 레벨(INFO, WARN, ERROR)을 추출합니다.

        Args:
            message (str): 로그 메시지

        Returns:
            str: 추출된 로그 레벨 (INFO, WARN, ERROR 중 하나)
        """
        log_levels = ["INFO", "WARN", "ERROR"]
        for level in log_levels:
            if level in message:
                return level
        return None

    def get_logs(self, user_id: int, project_id: int, log_time: str) -> list:
        """로그 조회 서비스"""
        project_service = ProjectService(self.db)

        db_user = UserRepository.get_user_by_id(self.db, user_id=user_id)
        db_project = project_service.get_project_by_id(project_id=project_id)

        start_time, end_time = get_start_time(log_time)
        logs = ElasticsearchRepository.get_logs_by_datetime(
            index_name=db_project.index,
            start_time=start_time,
            end_time=end_time,
        )

        # 각 로그에서 메시지의 타임스탬프와 로그 레벨 추출
        processed_logs = []
        if not isinstance(logs, list):
            return []

        for log in logs:
            new_log = {}
            if "message" in log:
                timestamp = self._extract_timestamp_from_message(log["message"])
                log_level = self._extract_log_level(log["message"])
                if timestamp:
                    new_log["extracted_timestamp"] = timestamp
                if log_level:
                    new_log["log_level"] = log_level
            processed_logs.append(new_log)

        return processed_logs

    def get_logs_by_date_range(
        self,
        user_id: int,
        project_id: int,
        start_date: datetime,
        end_date: datetime,
        log_level: str,
    ) -> list:
        """날짜 범위 로그 조회 서비스"""
        project_service = ProjectService(self.db)

        db_user = UserRepository.get_user_by_id(self.db, user_id=user_id)
        db_project = project_service.get_project_by_id(project_id=project_id)

        print(start_date, end_date, log_level)

    def get_log_detail(self, project_id: int, log_ids: List[int]) -> list:
        db_project = ProjectService.get_project_by_id(self, project_id=project_id)

        log_details = ElasticsearchRepository.get_logs_by_id(
            index_name=db_project.index,
            ids=log_ids,
        )
        # embedding 삭제
        if isinstance(log_details, list):
            for log in log_details:
                if isinstance(log, dict) and "embedding" in log:
                    del log["embedding"]

        return log_details
