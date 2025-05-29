from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import Optional, List

from app.schemas.trouble import (
    TroubleCreate, 
    TroubleUpdate, 
    TroubleListQuery, 
    TroubleListResponse,
    TroubleSummary
)
from app.models.trouble import Trouble
from app.models.trouble_log import TroubleLog


class TroubleService:
    """Trouble 관련 비즈니스 로직을 처리하는 서비스 클래스"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_trouble(
        self, 
        create_trouble_dto: TroubleCreate, 
        created_by: int
    ) -> Trouble:
        """
        새로운 trouble을 생성합니다.
        
        Args:
            trouble_data: 생성할 trouble 데이터
            created_by: 생성자 ID (인증된 사용자)
        
        Returns:
            생성된 Trouble 객체
        
        Raises:
            HTTPException: 프로젝트가 존재하지 않거나 권한이 없는 경우
        """
        pass
    
    def get_trouble_by_id(self, trouble_id: int, user_id: int) -> Trouble:
        """
        ID로 trouble을 조회합니다.
        
        Args:
            trouble_id: 조회할 trouble ID
            user_id: 요청한 사용자 ID (권한 확인용)
        
        Returns:
            조회된 Trouble 객체
        
        Raises:
            HTTPException: trouble이 존재하지 않거나 접근 권한이 없는 경우
        """
        pass
    
    def update_trouble(
        self, 
        trouble_id: int, 
        trouble_update_dto: TroubleUpdate, 
        user_id: int
    ) -> Trouble:
        """
        기존 trouble을 업데이트합니다.
        
        Args:
            trouble_id: 업데이트할 trouble ID
            trouble_update: 업데이트할 데이터
            user_id: 요청한 사용자 ID (권한 확인용)
        
        Returns:
            업데이트된 Trouble 객체
        
        Raises:
            HTTPException: trouble이 존재하지 않거나 수정 권한이 없는 경우
        """
        pass
    
    def delete_trouble(self, trouble_id: int, user_id: int) -> None:
        """
        trouble을 삭제합니다.
        
        Args:
            trouble_id: 삭제할 trouble ID
            user_id: 요청한 사용자 ID (권한 확인용)
        
        Raises:
            HTTPException: trouble이 존재하지 않거나 삭제 권한이 없는 경우
        """
        pass
    
    def get_project_troubles(
        self, 
        project_id: int, 
        query_params: TroubleListQuery,
        user_id: int
    ) -> TroubleListResponse:
        """
        프로젝트의 trouble 목록을 페이지네이션과 함께 조회합니다.
        
        Args:
            project_id: 프로젝트 ID
            query_params: 페이지네이션 및 필터 파라미터
            user_id: 요청한 사용자 ID (권한 확인용)
        
        Returns:
            페이지네이션된 trouble 목록
        
        Raises:
            HTTPException: 프로젝트가 존재하지 않거나 접근 권한이 없는 경우
        """
        pass
    
    def _save_trouble_logs(self, trouble_id: int, log_ids: List[str]) -> None:
        """
        trouble과 연관된 로그 ID들을 저장합니다.
        
        Args:
            trouble_id: trouble ID
            log_ids: 연관된 로그 ID 리스트
        """
        pass
    
    def _check_project_access(self, project_id: int, user_id: int) -> bool:
        """
        사용자가 해당 프로젝트에 접근 권한이 있는지 확인합니다.
        
        Args:
            project_id: 프로젝트 ID
            user_id: 사용자 ID
        
        Returns:
            접근 권한 여부
        """
        pass
    
    def _check_trouble_access(self, trouble: Trouble, user_id: int) -> bool:
        """
        사용자가 해당 trouble에 접근 권한이 있는지 확인합니다.
        (생성자이거나 공유된 trouble인 경우)
        
        Args:
            trouble: Trouble 객체
            user_id: 사용자 ID
        
        Returns:
            접근 권한 여부
        """
        pass
    
    def _build_trouble_query_filters(
        self, 
        query_params: TroubleListQuery, 
        project_id: int
    ):
        """
        trouble 목록 조회용 필터 쿼리를 구성합니다.
        
        Args:
            query_params: 쿼리 파라미터
            project_id: 프로젝트 ID
        
        Returns:
            SQLAlchemy 쿼리 객체
        """
        pass
