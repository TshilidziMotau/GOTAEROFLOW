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
