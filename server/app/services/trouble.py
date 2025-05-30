from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import Optional, List

from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage

from app.core.llm.base import LLMFactory
from app.core.llm.prompts import TROUBLESHOOTING_TEMPLATE, TroubleContent
from app.repositories.project import get_project_by_id
from app.repositories.elasticsearch import get_logs_by_ids
from app.repositories import trouble as trouble_repo
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
        self.llm = LLMFactory.create_mini_chat_model()
    
    def create_trouble(
        self, 
        create_trouble_dto: TroubleCreate, 
        created_by: int
    ) -> Trouble:
        """
        새로운 trouble을 생성합니다.
        
        Args:
            create_trouble_dto: 생성할 trouble 데이터
            created_by: 생성자 ID (인증된 사용자)
        
        Returns:
            생성된 Trouble 객체
        
        Raises:
            HTTPException: 프로젝트가 존재하지 않거나 권한이 없는 경우
        """
        # 1. 프로젝트 존재 여부 및 접근 권한 확인
        project = get_project_by_id(self.db, create_trouble_dto.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
        
        # 사용자가 해당 프로젝트에 접근 권한이 있는지 확인
        if not trouble_repo.check_user_project_access(self.db, create_trouble_dto.project_id, created_by):
            raise HTTPException(status_code=403, detail="프로젝트에 접근 권한이 없습니다")
        
        # 2. 로그 데이터 조회 및 AI 분석
        try:
            # TODO: 프로젝트별 실제 인덱스명 사용
            project_index = "index_name"  # 임시 인덱스명
            
            # 연관된 로그들의 실제 내용 가져오기
            log_contents = get_logs_by_ids(
                index_name=project_index,
                ids=create_trouble_dto.related_logs
            )
            
            # AI를 사용해 트러블슈팅 내용 생성
            ai_content = self._gen_ai_content(
                create_trouble_dto.user_query, 
                log_contents
            )
            
        except Exception as e:
            # 로그 조회나 AI 분석 실패 시 기본 내용으로 대체
            ai_content = TroubleContent(
                title=f"사용자 질의에 대한 분석을 진행 중입니다: {create_trouble_dto.user_query}",
                content=f"사용자 질의에 대한 분석을 진행 중입니다: {create_trouble_dto.user_query}"
            )
        
        # 3. DB에 trouble 저장
        trouble = trouble_repo.create_trouble(
            self.db, 
            create_trouble_dto, 
            created_by, 
            ai_content.title, 
            ai_content.content
        )
        
        # 4. 연관된 로그 ID들 저장
        if create_trouble_dto.related_logs:
            trouble_repo.save_trouble_logs(
                self.db, 
                trouble.id, 
                create_trouble_dto.related_logs
            )
        
        return trouble

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
        # 1. trouble 존재 여부 확인
        trouble = trouble_repo.get_trouble_by_id(self.db, trouble_id)
        if not trouble:
            raise HTTPException(status_code=404, detail="요청한 trouble을 찾을 수 없습니다")
        
        # 2. 접근 권한 확인 (생성자이거나 공유된 trouble만 조회 가능)
        if not self._check_trouble_access(trouble, user_id):
            raise HTTPException(status_code=403, detail="이 trouble에 접근할 권한이 없습니다")
        
        # 3. trouble 반환
        return trouble
    
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
        # 1. trouble 존재 여부 확인
        trouble = trouble_repo.get_trouble_by_id(self.db, trouble_id)
        if not trouble:
            raise HTTPException(status_code=404, detail="요청한 trouble을 찾을 수 없습니다")
        
        # 2. 삭제 권한 확인 (생성자만 삭제 가능)
        if trouble.created_by != user_id:
            raise HTTPException(status_code=403, detail="이 trouble을 삭제할 권한이 없습니다. 생성자만 삭제할 수 있습니다")
        
        # 3. trouble 삭제 (연관된 trouble_logs도 cascade로 함께 삭제됨)
        trouble_repo.delete_trouble(self.db, trouble)
        
        # 삭제 완료 (반환값 없음)
    
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
        # 생성자인 경우 접근 허용
        if trouble.created_by == user_id:
            return True
        
        # 공유된 trouble인 경우 접근 허용
        if trouble.is_shared:
            return True
        
        # 위 조건에 해당하지 않으면 접근 거부
        return False
    
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

    def _gen_ai_content(self, user_query: str, log_contents: List[str]) -> TroubleContent:
        """
        AI로 트러블슈팅 내용을 생성합니다.
        
        Args:
            user_query: 사용자 질의
            log_contents: 연관된 로그 내용들
        
        Returns:
            AI가 생성한 트러블슈팅 분석 내용
        """
        prompt = PromptTemplate(
            template=TROUBLESHOOTING_TEMPLATE,
            input_variables=["user_query", "log_contents"]
        )
        
        # 로그 내용들을 하나의 문자열로 결합
        log_contents_str = "\n".join(
            f"<log_content>\n{log_content}\n</log_content>\n" 
            for log_content in log_contents
        )
        
        # 프롬프트 포맷팅 및 AI 호출
        formatted_prompt = prompt.format(
            user_query=user_query, 
            log_contents=log_contents_str
        )
        
        chain = self.llm.with_structured_output(TroubleContent)
        return chain.invoke([HumanMessage(content=formatted_prompt)])