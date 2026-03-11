import os
from pathlib import Path
from uuid import uuid4

from fastapi import BackgroundTasks, Depends, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Project, ProjectStatus
from .schemas import ProcessResponse, ProjectCreate, ProjectResponse
from .video_processing import process_video

Base.metadata.create_all(bind=engine)

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "backend/uploads"))
PROCESSED_DIR = Path(os.getenv("PROCESSED_DIR", "backend/processed"))
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv"}
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="GOTA AERO FLOW TIA MVP")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/processed", StaticFiles(directory=PROCESSED_DIR), name="processed")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


def serialize_project(project: Project) -> dict:
    uploaded_video_url = f"/uploads/{Path(project.video_path).name}" if project.video_path else None
    return {
        "id": project.id,
        "name": project.name,
        "status": project.status,
        "car_count": project.car_count,
        "preview_path": project.preview_path,
        "uploaded_video_url": uploaded_video_url,
        "created_at": project.created_at,
    }


@app.get("/health")
def healthcheck():
    return {"status": "ok"}


@app.get("/projects", response_model=list[ProjectResponse])
def list_projects(limit: int = Query(default=20, ge=1, le=100), db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).limit(limit).all()
    return [serialize_project(project) for project in projects]


def create_project_record(payload: ProjectCreate, db: Session) -> dict:
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Project name cannot be empty")

    project = Project(name=name, status=ProjectStatus.uploaded)
    db.add(project)
    db.commit()
    db.refresh(project)
    return serialize_project(project)


@app.post("/projects", response_model=ProjectResponse)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    return create_project_record(payload, db)


@app.post("/api/projects", response_model=ProjectResponse)
def create_project_api(payload: ProjectCreate, db: Session = Depends(get_db)):
    return create_project_record(payload, db)


@app.post("/projects/{project_id}/upload", response_model=ProjectResponse)
def upload_video(project_id: int, video: UploadFile = File(...), db: Session = Depends(get_db)):
    ext = Path(video.filename).suffix.lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only .mp4, .avi, .mov, .mkv files are supported")

    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    filename = f"{project_id}-{uuid4().hex}{ext}"
    dest = UPLOAD_DIR / filename
    with dest.open("wb") as f:
        f.write(video.file.read())

    project.video_path = str(dest)
    project.status = ProjectStatus.uploaded
    db.commit()
    db.refresh(project)
    return serialize_project(project)


def run_processing(project_id: int):
    db = next(get_db())
    try:
        project = db.get(Project, project_id)
        if not project or not project.video_path:
            return

        project.status = ProjectStatus.processing
        db.commit()

        preview_path = PROCESSED_DIR / f"summary-{project_id}.txt"
        car_count = process_video(project.video_path, str(preview_path))

        project.car_count = car_count
        project.preview_path = f"/processed/{preview_path.name}"
        project.status = ProjectStatus.completed
        db.commit()
    except Exception:
        project = db.get(Project, project_id)
        if project:
            project.status = ProjectStatus.failed
            db.commit()
    finally:
        db.close()


@app.post("/projects/{project_id}/process", response_model=ProcessResponse)
def start_processing(project_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not project.video_path:
        raise HTTPException(status_code=400, detail="Upload a video first")

    background_tasks.add_task(run_processing, project_id)
    return ProcessResponse(message="Processing started", project_id=project_id)


@app.get("/projects/{project_id}/status", response_model=ProjectResponse)
def get_status(project_id: int, db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return serialize_project(project)


@app.get("/projects/{project_id}/count")
def get_count(project_id: int, db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {
        "project_id": project.id,
        "status": project.status,
        "car_count": project.car_count,
        "preview_path": project.preview_path,
    }
