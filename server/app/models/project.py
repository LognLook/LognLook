from datetime import datetime
from sqlalchemy import UUID, Column, Integer, String, DateTime
from app.core.enums.language import Language
from app.infra.database.session import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Enum as SqlEnum


class Project(Base):
    __tablename__ = "project"
    id: int | None = Column(Integer, primary_key=True, index=True)
    name: str = Column(String(20), nullable=False)
    description: str = Column(String(50))
    index: UUID = Column(String(36), nullable=False)
    api_key: UUID = Column(String(36), nullable=False)
    invite_code: str = Column(String(22), nullable=False)
    language: str = Column(
        SqlEnum(Language), nullable=False, default=Language.KOREAN
    )

    create_by: int = Column(Integer)
    create_at: DateTime = Column(DateTime, default=datetime.now)

    user_projects = relationship(
        "UserProject",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="joined",
        passive_deletes=True,
    )
    troubles = relationship(
        "Trouble",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="joined",
        passive_deletes=True,
    )
    setting = relationship(
        "ProjectSetting",
        back_populates="project",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="joined",
        passive_deletes=True,
    )
    notifications = relationship(
        "Notification",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="joined",
        passive_deletes=True,
    )

    # 읽기 전용 다대다 관계
    users = relationship(
        "User", secondary="user_project", back_populates="projects", viewonly=True
    )
