from sqlalchemy import Column, Integer, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.infra.database.session import Base


class ProjectSetting(Base):
    __tablename__ = "project_settings"

    id: int | None = Column(Integer, primary_key=True, index=True)
    project_id: int = Column(
        Integer, ForeignKey("project.id"), nullable=False, unique=True
    )
    logstash_config: JSON | None = Column(JSON, nullable=False, default=list)
    log_keywords: JSON | None = Column(JSON, nullable=False, default=list)
    updated_at: DateTime = Column(
        DateTime, default=datetime.now, onupdate=datetime.now, nullable=False
    )

    # Relationships
    project = relationship("Project", back_populates="setting", uselist=False)
