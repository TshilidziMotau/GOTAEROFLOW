from datetime import datetime
from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class ProjectResponse(BaseModel):
    id: int
    name: str
    status: str
    car_count: int
    preview_path: str | None
    uploaded_video_url: str | None
    created_at: datetime


class ProcessResponse(BaseModel):
    message: str
    project_id: int
