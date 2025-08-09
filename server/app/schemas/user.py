from pydantic import BaseModel

class UserBase(BaseModel): 
    username: str
    
    
class User(UserBase):
    id: int
    model_config = { # SQLAlchemy 객체를 Pydantic 모델로 자동 변환해주는 설정
        "from_attributes": True
    } 

class UserCreate(UserBase):
    password: str

class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None
