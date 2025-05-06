from pydantic import BaseModel, EmailStr

# Project
class ProjectBase(BaseModel):
    name: str
    description: str
    

class ProjectCreate(ProjectBase):
    user_email: EmailStr


class Project(ProjectBase):
    id: int
    model_config = { # SQLAlchemy 객체를 Pydantic 모델로 자동 변환해주는 설정
        "from_attributes": True
    } 
    
# UserProject 
class UserProjectBase(BaseModel):
    user_id: int
    project_id: int