from datetime import datetime
from sqlalchemy import Column, ForeignKey, Integer, String, Boolean
from app.infra.database.session import Base
from sqlalchemy.orm import relationship


class UserProject(Base):
    __tablename__ = "user_project"
    user_id: int | None = Column(Integer, ForeignKey("users.id"), primary_key=True)
    project_id: int | None = Column(Integer, ForeignKey("project.id"), primary_key=True)
    role: str | None = Column(String(20))
    email_notification: bool = Column(Boolean, nullable=False, default=True)

    user = relationship("User", back_populates="user_projects")
    project = relationship("Project", back_populates="user_projects")
