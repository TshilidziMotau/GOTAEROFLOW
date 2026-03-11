from datetime import datetime
from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str


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
