from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from server.app.infra.database.session import Base
from sqlalchemy.orm import relationship


class Project(Base):
    __tablename__ = "project"
    id: int | None = Column(Integer, primary_key=True, index=True)
    name: str = Column(String(20), nullable=False)
    description: str = Column(String(50))
    create_by: int = Column(Integer)
    create_at: DateTime = Column(DateTime, default=datetime.now)

    user_projects = relationship("UserProject", back_populates="project")
    troubles = relationship("Trouble", back_populates="project")
    setting = relationship("ProjectSetting", back_populates="project", uselist=False)
    notifications = relationship("Notification", back_populates="project")

    # 읽기 전용 다대다 관계
    users = relationship(
        "User", secondary="user_project", back_populates="projects", viewonly=True
    )
