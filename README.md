# GOTA AERO FLOW TIA (MVP)

Small MVP web app for drone video upload and **car-only counting**.

## Scope (this phase only)
- Create project
- Upload one `.mp4` video
- Process video in backend
- Detect **cars only** (COCO class `car`)
- Track cars and count unique track IDs to reduce double counting
- Show processing status and final count in frontend

> Not included yet: school mode, queues, pedestrians, parking, GIS, complex dashboard, reports.

## Tech stack
- Frontend: Next.js + TypeScript + Tailwind
- Backend: FastAPI + Python + PostgreSQL
- CV: OpenCV + Ultralytics YOLOv8 tracker

## Local run (recommended with Docker)
1. Copy env file:
   ```bash
   cp .env.example .env
   ```
2. Start services:
   ```bash
   docker compose up --build
   ```
3. Open frontend: `http://localhost:3000`
4. Backend docs: `http://localhost:8000/docs`

## Manual run (without Docker)
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql+psycopg2://gota:gota@localhost:5432/gota
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

## API endpoints (MVP)
- `POST /projects` - create project
- `POST /projects/{id}/upload` - upload one `.mp4`
- `POST /projects/{id}/process` - start background processing
- `GET /projects/{id}/status` - status + preview + count
- `GET /projects/{id}/count` - final count payload

## Counting approach (MVP)
- Detector/tracker: `YOLO("yolov8n.pt").track(..., persist=True)`
- Filter detections to COCO class id `2` (`car`) only
- Counting strategy: unique tracker IDs across frames
- This is simple and practical for MVP; it is not lane-direction aware yet.

## TODOs for v2
- Add robust line-crossing direction logic
- Add camera calibration and lane-level analytics
- Add role-based auth and proper user/project ownership
- Add async queue workers and retries for large videos
