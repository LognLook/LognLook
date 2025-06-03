from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.infra.database.session import Base


class Trouble(Base):
    __tablename__ = "troubles"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(
        Integer, ForeignKey("project.id", ondelete="CASCADE"), nullable=False
    )
    created_by = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    report_name = Column(String(1000), nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    is_shared = Column(Boolean, default=False, nullable=False)
    user_query = Column(String(1000), nullable=False)
    content = Column(String(10000), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="troubles", passive_deletes=True)
    creator = relationship("User", back_populates="troubles", passive_deletes=True)
    logs = relationship(
        "TroubleLog",
        back_populates="trouble",
        lazy="joined",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
