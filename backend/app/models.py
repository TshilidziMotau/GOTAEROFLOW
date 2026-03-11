from sqlalchemy import Column, DateTime, Enum, Integer, String, func
import enum

from .database import Base


class ProjectStatus(str, enum.Enum):
    uploaded = "uploaded"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    video_path = Column(String, nullable=True)
    preview_path = Column(String, nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.uploaded, nullable=False)
    car_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
