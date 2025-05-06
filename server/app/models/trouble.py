from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from server.app.infra.database.session import Base


class Trouble(Base):
    __tablename__ = "troubles"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_name = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    is_shared = Column(Boolean, default=False, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="troubles")
    creator = relationship("User", back_populates="troubles")
    logs = relationship("TroubleLog", back_populates="trouble")
