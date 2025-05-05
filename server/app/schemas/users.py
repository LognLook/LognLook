from pydantic import BaseModel, EmailStr

class UserBase(BaseModel): 
    email: EmailStr #이메일 형식 체크
    
    
class User(UserBase):
    id: int
    model_config = { # SQLAlchemy 객체를 Pydantic 모델로 자동 변환해주는 설정
        "from_attributes": True
    } 
class UserCreate(User):
    pass
