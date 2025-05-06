from fastapi import APIRouter, Depends, HTTPException
from app.schemas.users import UserCreate
from sqlalchemy.orm import Session
from server.app.infra.database.session import get_db
from app.crud.user import get_user_by_email, create_user


router = APIRouter()


@router.post("/user")
def create_users(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db=db, user=user)
