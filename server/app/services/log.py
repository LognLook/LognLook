from typing import List
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.utils.time_utils import get_start_time, get_log_time_by_count
from app.core.utils.log_utils import extract_logs, remove_vector_from_logs
from app.services.project import ProjectService
from app.repositories import user as UserRepository
from app.repositories import elasticsearch as ElasticsearchRepository


class LogService:
    def __init__(self, db: Session):
        self.db = db

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

        return extract_logs(logs)

    def get_recent_logs(
        self,
        user_id: int,
        project_id: int,
        count: int,
    ) -> list:
        """날짜 범위 로그 조회 서비스"""
        project_service = ProjectService(self.db)

        db_user = UserRepository.get_user_by_id(self.db, user_id=user_id)
        db_project = project_service.get_project_by_id(project_id=project_id)

        start_time, end_time = get_log_time_by_count(count)
        print(start_time, end_time)
        logs = ElasticsearchRepository.get_logs_by_datetime(
            index_name=db_project.index,
            start_time=start_time,
            end_time=end_time,
        )

        return extract_logs(logs)

    def get_log_detail(self, project_id: int, log_ids: List[int]) -> list:
        db_project = ProjectService.get_project_by_id(self, project_id=project_id)

        log_details = ElasticsearchRepository.get_logs_by_ids(
            index_name=db_project.index,
            ids=log_ids,
        )

        return remove_vector_from_logs(log_details)
