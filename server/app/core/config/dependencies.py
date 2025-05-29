from fastapi import Depends
from sqlalchemy.orm import Session
from app.infra.database.session import get_db
from app.services.project import ProjectService
from app.services.user import UserService
from app.services.pipeline import PipelineService
from app.services.log import LogService
from app.services.trouble import TroubleService

def get_user_service(
    db: Session = Depends(get_db),
) -> UserService:
    return UserService(db)

def get_project_service(
    db: Session = Depends(get_db),
) -> ProjectService:
    return ProjectService(db)

def get_pipeline_service(
    db: Session = Depends(get_db),
) -> PipelineService:
    return PipelineService(db)

def get_log_service(
    db: Session = Depends(get_db),
) -> LogService:
    return LogService(db)

def get_trouble_service(
    db: Session = Depends(get_db),
) -> TroubleService:
    return TroubleService(db)

def get_current_user_id() -> int:
    """현재 인증된 사용자 ID를 반환 (TODO: 실제 인증 로직으로 교체)"""
    # TODO: JWT 토큰이나 세션에서 실제 사용자 ID 추출
    return 1  # 임시로 하드코딩