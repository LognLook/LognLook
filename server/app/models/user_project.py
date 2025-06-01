from datetime import datetime
from sqlalchemy import Column, ForeignKey, Integer, String, Boolean
from app.infra.database.session import Base
from sqlalchemy.orm import relationship


class UserProject(Base):
    __tablename__ = "user_project"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    project_id = Column(
        Integer, ForeignKey("project.id", ondelete="CASCADE"), nullable=False
    )
    role: str | None = Column(String(20))
    email_notification: bool = Column(Boolean, nullable=False, default=True)

    user = relationship("User", back_populates="user_projects", passive_deletes=True)
    project = relationship(
        "Project", back_populates="user_projects", passive_deletes=True
    )
