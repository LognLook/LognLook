from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from sqlalchemy.orm import Session
from app.infra.database.session import get_db
from app.services.project import ProjectService
from app.services.user import UserService
from app.services.pipeline import PipelineService
from app.services.log import LogService
from app.services.trouble import TroubleService
from app.core.utils.auth import verify_token
from app.models.user import User


security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)

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

def get_current_username(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """JWT 토큰에서 현재 사용자 username을 추출"""
    token = credentials.credentials
    username = verify_token(token)
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 토큰입니다",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return username