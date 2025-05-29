from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
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
                "related_logs": [
                    {
                        "timestamp": "2024-01-01T10:30:00Z",
                        "message": "Authentication failed for user john@example.com",
                        "category": "로그인 에러",
                        "comment": "사용자가 잘못된 비밀번호를 입력했습니다.",
                        "host": {"name": "web-server-01"},
                        "log_file_path": "/var/log/auth.log",
                        "tags": ["auth", "error"]
                    }
                ]
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
    
    model_config = {
        "from_attributes": True,    # SQLAlchemy 객체 → Pydantic 모델 자동 변환
        "json_schema_extra": {      # OpenAPI 문서에 표시될 예시 데이터
            "example": {
                "id": 1,
                "project_id": 1,
                "created_by": 1,
                "report_name": "로그인 오류 분석",
                "created_at": "2024-01-01T10:00:00Z",
                "is_shared": False
            }
        }
    }


class TroubleWithDetails(Trouble):
    """관계 데이터까지 포함한 상세 Trouble 스키마"""
    # 필요시 project, creator 정보도 포함 가능