from sqlalchemy.orm import Session
from datetime import datetime

from app.repositories import project as ProjectRepository
from app.services.project import ProjectService
from app.services.user import UserService


class LogService:
    def __init__(self, db: Session):
        self.db = db

    def get_logs(
        self, user_email: str, project_id: int, log_time: str
    ) -> list:
        """로그 조회 서비스"""
        db_user = UserService.get_user_by_email(self, email=user_email)
        db_project = ProjectService.get_project_by_id(self, project_id=project_id)

        print(log_time)

        # return LogRepository.get_log(self.db, user_email, log_level, log_time)
    def get_logs_by_date_range(
        self, user_email: str, project_id: int, start_date: datetime, end_date: datetime, log_level: str
    ) -> list:
        """날짜 범위 로그 조회 서비스"""
        db_user = UserService.get_user_by_email(self, email=user_email)
        db_project = ProjectService.get_project_by_id(self, project_id=project_id)

        print(start_date, end_date, log_level)