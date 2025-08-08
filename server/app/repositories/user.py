from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate


def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(email=user.email, password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str):
    db_user = db.query(User).filter(User.email == email).first()
    return db_user

def get_user_by_id(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    return db_user
