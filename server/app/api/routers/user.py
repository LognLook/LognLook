from fastapi import APIRouter, Depends

from app.schemas.user import UserCreate, UserRegister, UserLogin, Token, User
from app.services.user import UserService
from app.api.deps import get_user_service, get_current_user_email
from app.models.user import User as UserModel

router = APIRouter()


@router.post("/user")
def create_users(user: UserCreate, service: UserService = Depends(get_user_service)):
    return service.create_user(user)


@router.post("/auth/register", response_model=User)
def register(user_data: UserRegister, service: UserService = Depends(get_user_service)):
    """사용자 회원가입"""
    return service.register_user(user_data)


@router.post("/auth/login", response_model=Token)
def login(login_data: UserLogin, service: UserService = Depends(get_user_service)):
    """사용자 로그인"""
    return service.authenticate_user(login_data)


@router.get("/auth/me", response_model=User)
def get_current_user_info(
    email: str = Depends(get_current_user_email), service: UserService = Depends(get_user_service)):
    """현재 로그인한 사용자 정보 조회"""
    return service.get_user_by_email(email)
