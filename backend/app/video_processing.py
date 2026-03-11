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
