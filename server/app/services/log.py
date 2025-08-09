from typing import List
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.utils.time_utils import get_start_time, get_log_time_by_count
from app.core.utils.log_utils import extract_basic_logs, extract_full_logs, remove_vector_from_logs
from app.services.project import ProjectService
from app.repositories import user as UserRepository
from app.repositories import elasticsearch as ElasticsearchRepository
from app.core.enums.log_filter import LogLevelFilter


class LogService:
    def __init__(self, db: Session):
        self.db = db

    def get_logs(self, username: str, project_id: int, log_time: str, size: int = 100) -> list:
        """로그 조회 서비스"""
        project_service = ProjectService(self.db)

        db_user = UserRepository.get_user_by_username(self.db, username=username)
        db_project = project_service.get_project_by_id(project_id=project_id)

        start_time, end_time = get_start_time(log_time)
        logs = ElasticsearchRepository.get_logs_by_datetime(
            index_name=db_project.index,
            start_time=start_time,
            end_time=end_time,
            size=size,
        )

        return extract_basic_logs(logs)

    def get_recent_logs(
        self,
        username: str,
        project_id: int,
        count: int,
        size: int = 100,
    ) -> list:
        """날짜 범위 로그 조회 서비스"""
        project_service = ProjectService(self.db)

        db_user = UserRepository.get_user_by_username(self.db, username=username)
        db_project = project_service.get_project_by_id(project_id=project_id)

        start_time, end_time = get_log_time_by_count(count)
        logs = ElasticsearchRepository.get_logs_by_datetime(
            index_name=db_project.index,
            start_time=start_time,
            end_time=end_time,
            size=size,
        )

        return extract_full_logs(logs)

    def get_log_detail(self, project_id: int, log_ids: List[int]) -> list:
        db_project = ProjectService.get_project_by_id(self, project_id=project_id)

        log_details = ElasticsearchRepository.get_logs_by_ids(
            index_name=db_project.index,
            ids=log_ids,
        )

        return remove_vector_from_logs(log_details)

    def get_retrieve_logs(self, project_id: int, query: str, keyword: str = None, log_level: LogLevelFilter = None, start_time: str = None, end_time: str = None, k: int = 10) -> list:
        db_project = ProjectService.get_project_by_id(self, project_id=project_id)

        logs = ElasticsearchRepository.retrieve_logs(
            index_name=db_project.index,
            query=query,
            keyword=keyword,
            log_level=log_level,
            start_time=start_time,
            end_time=end_time,
            k=k,
        )
        
        return extract_full_logs(logs)