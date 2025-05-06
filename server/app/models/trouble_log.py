from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class TroubleLog(Base):
    __tablename__ = "trouble_logs"

    id = Column(Integer, primary_key=True, index=True)
    trouble_id = Column(Integer, ForeignKey("troubles.id"), nullable=False)

    # Relationships
    trouble = relationship("Trouble", back_populates="logs")
