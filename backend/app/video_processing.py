import json
import os
from pathlib import Path
from urllib import request


class ProcessingError(RuntimeError):
    pass


def _call_external_ml_service(video_path: str, ml_url: str, timeout_s: int) -> int:
    with open(video_path, "rb") as f:
        payload = f.read()

    req = request.Request(
        ml_url,
        data=payload,
        headers={
            "Content-Type": "video/mp4",
            "Accept": "application/json",
        },
        method="POST",
    )

    with request.urlopen(req, timeout=timeout_s) as response:
        raw = response.read().decode("utf-8")
        data = json.loads(raw)

    if "car_count" not in data:
        raise ProcessingError("ML service response missing 'car_count'")

    return int(data["car_count"])


def process_video(video_path: str, preview_out: str) -> int:
    """
    Lightweight processing path for constrained deployments.

    Behavior:
    - If ML_SERVICE_URL is configured, delegate counting to external ML service.
    - Otherwise return 0 in safe fallback mode.

    TODO(v2): run native detector/tracker in separate worker service with GPU/optimized runtime.
    """
    if not Path(video_path).exists():
        raise ProcessingError("Uploaded video was not found on disk")

    ml_service_url = os.getenv("ML_SERVICE_URL")
    timeout_s = int(os.getenv("ML_SERVICE_TIMEOUT", "120"))

    if ml_service_url:
        count = _call_external_ml_service(video_path, ml_service_url, timeout_s)
    else:
        count = 0

    # Keep output contract: write a tiny text summary instead of heavy image preview generation.
    preview_file = Path(preview_out)
    preview_file.parent.mkdir(parents=True, exist_ok=True)
    preview_file.write_text(
        "MVP summary: preview image generation disabled in lightweight mode. "
        "Set ML_SERVICE_URL to use external car counting service."
    )

    return count
from pathlib import Path
import cv2
from ultralytics import YOLO

# TODO(v2): make model path configurable and support hardware acceleration tuning.
MODEL = YOLO("yolov8n.pt")
CAR_CLASS_ID = 2


def process_video(video_path: str, preview_out: str) -> int:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError("Could not open uploaded video")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    target_frame = max(total_frames // 2, 0)
    frame_idx = 0
    snapshot_saved = False
    unique_track_ids: set[int] = set()

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        frame_idx += 1
        results = MODEL.track(frame, persist=True, verbose=False)
        if not results:
            continue

        boxes = results[0].boxes
        if boxes is not None and boxes.id is not None and boxes.cls is not None:
            ids = boxes.id.int().tolist()
            classes = boxes.cls.int().tolist()
            for obj_id, obj_cls in zip(ids, classes):
                if obj_cls == CAR_CLASS_ID:
                    unique_track_ids.add(obj_id)

        if not snapshot_saved and frame_idx >= target_frame:
            annotated = results[0].plot()
            Path(preview_out).parent.mkdir(parents=True, exist_ok=True)
            cv2.imwrite(preview_out, annotated)
            snapshot_saved = True

    cap.release()

    if not snapshot_saved:
        Path(preview_out).parent.mkdir(parents=True, exist_ok=True)
        fallback = cv2.VideoCapture(video_path)
        ok, frame = fallback.read()
        if ok:
            cv2.imwrite(preview_out, frame)
        fallback.release()

    return len(unique_track_ids)
