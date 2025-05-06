from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.infra.database.session import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False)
    type = Column(String(50), nullable=False)
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.now, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="notifications")
