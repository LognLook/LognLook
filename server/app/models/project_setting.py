from sqlalchemy import Column, Integer, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base


class ProjectSetting(Base):
    __tablename__ = "project_settings"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False, unique=True)
    logstash_config = Column(JSON, nullable=True)
    log_keywords = Column(JSON, nullable=True)
    updated_at = Column(
        DateTime, default=datetime.now, onupdate=datetime.now, nullable=False
    )

    # Relationships
    project = relationship("Project", back_populates="setting", uselist=False)
