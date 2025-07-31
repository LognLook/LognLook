from pydantic import BaseModel, EmailStr

class UserBase(BaseModel): 
    email: EmailStr #이메일 형식 체크
    
    
class User(UserBase):
    id: int
    model_config = { # SQLAlchemy 객체를 Pydantic 모델로 자동 변환해주는 설정
        "from_attributes": True
    } 

class UserCreate(UserBase):
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None
