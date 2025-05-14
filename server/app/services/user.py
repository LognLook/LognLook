from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories import user as UserRepository
from app.schemas.user import UserCreate, User


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user: UserCreate) -> User:
        """사용자 생성 서비스"""
        # 이메일 중복 체크
        db_user = UserRepository.get_user_by_email(self.db, email=user.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        return UserRepository.create_user(self.db, user=user)

    def get_user_by_email(self, email: str) -> User:
        """이메일로 사용자 조회 서비스"""
        db_user = UserRepository.get_user_by_email(self.db, email=email)
        if not db_user:
            raise HTTPException(status_code=400, detail="User not found")
        return db_user