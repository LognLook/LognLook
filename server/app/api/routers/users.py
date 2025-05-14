from fastapi import APIRouter, Depends

from app.schemas.user import UserCreate
from app.services.user import UserService
from app.core.config.dependencies import get_user_service

router = APIRouter()


@router.post("/user")
def create_users(user: UserCreate, service: UserService = Depends(get_user_service)):
    return service.create_user(user)
