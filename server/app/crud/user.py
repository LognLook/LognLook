from sqlalchemy.orm import Session
from app.models.users import User
from app.schemas.users import UserCreate


def create_user(db:Session, user:UserCreate):
    db_user = User(
        email=user.email
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db:Session, email: str):
    db_user = db.query(User).filter(User.email == email).first()
    return db_user

def get_user_by_id(db:Session, id: int):
    db_user = db.query(User).filter(User.id == id).first()
    return db_user