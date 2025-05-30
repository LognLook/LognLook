from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from app.infra.database.session import Base


class TroubleLog(Base):
    __tablename__ = "trouble_logs"

    id = Column(Integer, primary_key=True, index=True)
    trouble_id = Column(Integer, ForeignKey("troubles.id"), nullable=False)
    log_id = Column(String, nullable=False)  # Elasticsearch 로그 ID

    # Relationships
    trouble = relationship("Trouble", back_populates="logs")
