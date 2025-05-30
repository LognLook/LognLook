from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc
from typing import Optional, List, Tuple
from datetime import datetime

from app.models.trouble import Trouble
from app.models.trouble_log import TroubleLog
from app.models.user_project import UserProject
from app.models.user import User
from app.schemas.trouble import TroubleCreate, TroubleUpdate, TroubleListQuery


def create_trouble(db: Session, trouble: TroubleCreate, created_by: int, report_name: str, content: str) -> Trouble:
    """새로운 trouble을 생성합니다."""
    db_trouble = Trouble(
        project_id=trouble.project_id,
        created_by=created_by,
        report_name=report_name,
        content=content,
        is_shared=trouble.is_shared,
        user_query=trouble.user_query
    )
    db.add(db_trouble)
    db.commit()
    db.refresh(db_trouble)
    return db_trouble


def get_trouble_by_id(db: Session, trouble_id: int) -> Optional[Trouble]:
    """ID로 trouble을 조회합니다."""
    return db.query(Trouble).filter(Trouble.id == trouble_id).first()


def update_trouble(db: Session, trouble: Trouble, update_data: dict) -> Trouble:
    """기존 trouble을 업데이트합니다."""
    for key, value in update_data.items():
        if hasattr(trouble, key) and value is not None:
            setattr(trouble, key, value)
    
    db.commit()
    db.refresh(trouble)
    return trouble


def delete_trouble(db: Session, trouble: Trouble) -> None:
    """trouble을 삭제합니다."""
    # 연관된 trouble_logs도 함께 삭제됨 (cascade 설정 필요)
    db.delete(trouble)
    db.commit()


def get_project_troubles_paginated(
    db: Session, 
    project_id: int,
    query_params: TroubleListQuery,
    user_id: int
) -> Tuple[List[Trouble], int]:
    """프로젝트의 trouble 목록을 페이지네이션과 함께 조회합니다."""
    
    # 기본 쿼리 - 프로젝트별 + 접근 권한 확인
    query = db.query(Trouble).filter(
        and_(
            Trouble.project_id == project_id,
            or_(
                Trouble.created_by == user_id,  # 생성자
                Trouble.is_shared == True       # 공유된 trouble
            )
        )
    )
    
    # 검색어 필터
    if query_params.search:
        search_filter = or_(
            Trouble.report_name.ilike(f"%{query_params.search}%"),
            Trouble.user_query.ilike(f"%{query_params.search}%")
        )
        query = query.filter(search_filter)
    
    # 공유 여부 필터
    if query_params.is_shared is not None:
        query = query.filter(Trouble.is_shared == query_params.is_shared)
    
    # 생성자 필터
    if query_params.created_by is not None:
        query = query.filter(Trouble.created_by == query_params.created_by)
    
    # 전체 개수 계산
    total = query.count()
    
    # 페이지네이션 적용
    offset = (query_params.page - 1) * query_params.size
    troubles = (
        query
        .order_by(desc(Trouble.created_at))
        .offset(offset)
        .limit(query_params.size)
        .all()
    )
    
    return troubles, total


def check_user_project_access(db: Session, project_id: int, user_id: int) -> bool:
    """사용자가 프로젝트에 접근 권한이 있는지 확인합니다."""
    user_project = (
        db.query(UserProject)
        .filter(
            and_(
                UserProject.project_id == project_id,
                UserProject.user_id == user_id
            )
        )
        .first()
    )
    return user_project is not None


def save_trouble_logs(db: Session, trouble_id: int, log_ids: List[str]) -> None:
    """trouble과 연관된 로그 ID들을 저장합니다."""
    # 기존 로그들 삭제
    db.query(TroubleLog).filter(TroubleLog.trouble_id == trouble_id).delete()
    
    # 새로운 로그들 추가
    for log_id in log_ids:
        trouble_log = TroubleLog(trouble_id=trouble_id, log_id=log_id)
        db.add(trouble_log)
    
    db.commit()


def get_creator_email(db: Session, trouble_id: int) -> Optional[str]:
    """trouble 생성자의 이메일을 조회합니다."""
    result = (
        db.query(User.email)
        .join(Trouble, Trouble.created_by == User.id)
        .filter(Trouble.id == trouble_id)
        .first()
    )
    return result[0] if result else None
