# GOTA AERO FLOW TIA (MVP)

Small MVP web app for drone video upload and **car-only counting**.

## Scope (this phase only)
- Create project
- Upload one `.mp4` video
- Process video in backend
- Detect/count **cars only** via an ML counting service
- Detect **cars only** (COCO class `car`)
- Track cars and count unique track IDs to reduce double counting
- Show processing status and final count in frontend

> Not included yet: school mode, queues, pedestrians, parking, GIS, complex dashboard, reports.

## Tech stack
- Frontend: Next.js + TypeScript + Tailwind
- Backend: FastAPI + Python + PostgreSQL
- ML integration: optional external car-counting endpoint (`ML_SERVICE_URL`)

## Why lightweight backend
This backend is optimized for constrained deploy environments by removing heavy in-process CV/ML dependencies (`opencv`, `ultralytics`, `torch`).

Recommended architecture for production:
1. Keep this API service lightweight.
2. Run CV/ML in a separate worker/service (GPU or optimized CPU image).
3. API calls ML service and stores returned `car_count`.
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
# optional external inference endpoint returning JSON: {"car_count": <int>}
export ML_SERVICE_URL=http://localhost:9000/count-cars
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
- `GET /projects/{id}/status` - status + summary path + count
- `GET /projects/{id}/count` - final count payload

## Counting approach (MVP)
- Default lightweight fallback: returns `0` if no `ML_SERVICE_URL` is configured
- External mode: POST raw mp4 bytes to `ML_SERVICE_URL` and expect JSON with `car_count`
- This keeps API deploy small while allowing real car counting through a dedicated ML service

## TODOs for v2
- Add dedicated ML worker service template (YOLO + tracker + queue)
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
