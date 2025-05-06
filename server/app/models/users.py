from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.infra.database.session import Base
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"
    id: int | None = Column(Integer, primary_key=True, index=True)
    email: str = Column(String(50), nullable=False)
    create_at: DateTime = Column(DateTime, default=datetime.now)

    user_projects = relationship("UserProject", back_populates="user")
    troubles = relationship("Trouble", back_populates="creator")

    # 읽기 전용 다대다 관계
    projects = relationship(
        "Project", secondary="user_project", back_populates="users", viewonly=True
    )
