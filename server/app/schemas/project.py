from pydantic import BaseModel, EmailStr
from typing import List


# Project
class ProjectBase(BaseModel):
    name: str
    description: str


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    id: int
    model_config = {  # SQLAlchemy 객체를 Pydantic 모델로 자동 변환해주는 설정
        "from_attributes": True
    }


# UserProject
class UserProjectBase(BaseModel):
    user_id: int
    project_id: int


# ProjectSetting
class ProjectKeywordsBase(BaseModel):
    keywords: List[str]


class ProjectKeywordsUpdate(ProjectKeywordsBase):
    model_config = {  # SQLAlchemy 객체를 Pydantic 모델로 자동 변환해주는 설정
        "from_attributes": True,
        "json_schema_extra": {  # OpenAPI에 포함될 예시
            "example": {"keywords": ["error", "warning", "critical"]}
        },
    }
