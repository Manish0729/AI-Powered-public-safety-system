from sqlalchemy import Column, String, Integer, DateTime, JSON, Index
from sqlalchemy.sql import func
from .base import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)

class EventLog(Base):
    __tablename__ = "event_logs"
    id = Column(String, primary_key=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    camera_hash = Column(String, index=True, nullable=False)
    event_type = Column(String, index=True, nullable=False)
    severity = Column(String, nullable=False)
    count = Column(Integer, nullable=True)
    event_metadata = Column(JSON, nullable=True)

Index("idx_event_camera_time", EventLog.camera_hash, EventLog.timestamp)
