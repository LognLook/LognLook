from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TroubleBase(BaseModel):
    project_id: int
    report_name: str
    is_shared: bool = False


class TroubleCreate(TroubleBase):
    """Trouble 생성용 스키마 - created_by는 인증된 사용자에서 가져옴"""
    pass


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
    pass