from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories import user as UserRepository
from app.schemas.user import UserCreate, User, UserRegister, UserLogin, Token
from app.core.utils.auth import get_password_hash, verify_password, create_access_token


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user: UserCreate) -> User:
        """사용자 생성 서비스"""
        # username 중복 체크
        db_user = UserRepository.get_user_by_username(self.db, username=user.username)
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")

        return UserRepository.create_user(self.db, user=user)

    def get_user_by_username(self, username: str) -> User:
        """username으로 사용자 조회 서비스"""
        db_user = UserRepository.get_user_by_username(self.db, username=username)
        if not db_user:
            raise HTTPException(status_code=400, detail="User not found")
        return db_user

    def register_user(self, user_data: UserRegister) -> User:
        """사용자 회원가입"""
        # username 중복 체크
        if UserRepository.get_user_by_username(self.db, username=user_data.username):
            raise HTTPException(status_code=400, detail="이미 사용 중인 아이디입니다")
        
        # 비밀번호 해싱
        hashed_password = get_password_hash(user_data.password)
        
        # UserCreate 스키마로 변환
        user_create = UserCreate(
            username=user_data.username,
            password=hashed_password
        )
        
        return UserRepository.create_user(self.db, user=user_create)

    def authenticate_user(self, login_data: UserLogin) -> Token:
        """사용자 로그인 인증"""
        # 사용자 조회
        user = UserRepository.get_user_by_username(self.db, username=login_data.username)
        if not user:
            raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 잘못되었습니다")
        
        # 비밀번호 검증
        if not verify_password(login_data.password, user.password):
            raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 잘못되었습니다")
        
        # JWT 토큰 생성
        access_token = create_access_token(data={"sub": user.username})
        
        return Token(access_token=access_token, token_type="bearer")