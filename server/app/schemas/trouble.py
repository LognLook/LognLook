from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TroubleBase(BaseModel):
    project_id: int
    report_name: str
    is_shared: bool = False


class TroubleCreate(TroubleBase):
    """Trouble 생성용 스키마 - 사용자 질의와 연관 로그들을 포함"""
    user_query: str = Field(..., description="사용자의 자연어 질의", min_length=1, max_length=1000)
    related_logs: List[str] = Field(..., description="트러블슈팅과 연관된 로그 id들", min_items=1)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "project_id": 1,
                "report_name": "로그인 실패 분석",
                "is_shared": False,
                "user_query": "왜 사용자들이 로그인에 계속 실패하고 있나요?",
                "related_logs": ["log_id_1", "log_id_2", "log_id_3"]
            }
        }
    }


class TroubleUpdate(BaseModel):
    """Trouble 업데이트용 스키마 - 선택적 필드들"""
    report_name: Optional[str] = None
    is_shared: Optional[bool] = None


class Trouble(TroubleBase):
    """Trouble 응답용 스키마"""
    id: int
    created_by: int
    created_at: datetime
    user_query: str
    content: str
    
    model_config = {
        "from_attributes": True,    # SQLAlchemy 객체 → Pydantic 모델 자동 변환
        "json_schema_extra": {      # OpenAPI 문서에 표시될 예시 데이터
            "example": {
                "id": 1,
                "project_id": 1,
                "created_by": 1,
                "report_name": "로그인 오류 분석",
                "created_at": "2024-01-01T10:00:00Z",
                "is_shared": False,
                "user_query": "왜 사용자들이 로그인에 계속 실패하고 있나요?",
                "content": "분석 결과, 비밀번호 검증 로직에서 문제가 발생하고 있습니다."
            }
        }
    }


class TroubleSummary(BaseModel):
    """목록 조회용 요약 스키마 - 필수 정보만 포함"""
    id: int
    report_name: str
    created_at: datetime
    is_shared: bool
    creator_email: Optional[str] = Field(None, description="생성자 이메일")
    logs_count: Optional[int] = Field(None, description="연관된 로그 개수")
    
    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "report_name": "로그인 오류 분석",
                "created_at": "2024-01-01T10:00:00Z",
                "is_shared": False,
                "creator_email": "user@example.com",
                "logs_count": 5
            }
        }
    }


class TroubleListQuery(BaseModel):
    """목록 조회용 쿼리 파라미터"""
    page: int = Field(1, ge=1, description="페이지 번호")
    size: int = Field(10, ge=1, le=100, description="페이지 크기")
    search: Optional[str] = Field(None, description="검색어 (report_name, user_query 대상)")
    is_shared: Optional[bool] = Field(None, description="공유 여부 필터")
    created_by: Optional[int] = Field(None, description="생성자 ID 필터")


class TroubleListResponse(BaseModel):
    """페이지네이션된 목록 응답"""
    items: List[TroubleSummary]
    total: int = Field(..., description="전체 아이템 수")
    page: int = Field(..., description="현재 페이지")
    size: int = Field(..., description="페이지 크기")
    pages: int = Field(..., description="전체 페이지 수")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "items": [
                    {
                        "id": 1,
                        "report_name": "로그인 오류 분석",
                        "created_at": "2024-01-01T10:00:00Z",
                        "is_shared": False,
                        "creator_email": "user@example.com",
                        "logs_count": 5
                    }
                ],
                "total": 25,
                "page": 1,
                "size": 10,
                "pages": 3
            }
        }
    }