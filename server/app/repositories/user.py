from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate


def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(username=user.username, password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_username(db: Session, username: str):
    db_user = db.query(User).filter(User.username == username).first()
    return db_user

def get_user_by_id(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    return db_user
