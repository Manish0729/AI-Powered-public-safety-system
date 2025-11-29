from typing import Generator, Optional, Dict, Any, Iterable
import os
import time
import json
import cv2
from ..core.redis_client import get_sync_redis

try:
    from ultralytics import YOLO  # type: ignore
except Exception:
    YOLO = None  # fallback for environments without ultralytics installed

class InferenceEngine:
    def __init__(self, model_path: str = "yolov8n.pt", device: Optional[str] = None) -> None:
        self.model_path = model_path
        self.device = device
        self.model = YOLO(model_path) if YOLO is not None else None

    def frames(self, source: int | str = 0) -> Generator[Any, None, None]:
        cap = cv2.VideoCapture(source)
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                yield frame
        finally:
            cap.release()

    def predict(self, frame) -> Optional[Dict[str, Any]]:
        if self.model is None:
            return None
        results = self.model(frame)
        # Extract person detections for crowd count if available
        count = 0
        try:
            for r in results:  # ultralytics returns iterable
                names = r.names if hasattr(r, 'names') else {}
                boxes = r.boxes if hasattr(r, 'boxes') else None
                if boxes is None:
                    continue
                for b in boxes:
                    cls = int(b.cls)
                    label = names.get(cls, str(cls))
                    if label == 'person' or cls == 0:
                        count += 1
        except Exception:
            pass
        return {"count": count}


def run_crowd_worker() -> None:
    """Continuously reads frames, counts people, and publishes Redis alerts."""
    source = os.getenv("VIDEO_SOURCE", "0")
    try:
        src: int | str = int(source)
    except ValueError:
        src = source
    model_path = os.getenv("YOLO_MODEL", "yolov8n.pt")
    camera_id = os.getenv("CAMERA_ID", "default")
    interval_s = float(os.getenv("CROWD_PUBLISH_INTERVAL", "1.0"))

    engine = InferenceEngine(model_path=model_path)
    redis = get_sync_redis()

    last_publish = 0.0
    for frame in engine.frames(src):
        pred = engine.predict(frame) or {}
        now = time.time()
        if now - last_publish >= interval_s:
            payload = {
                "id": f"crowd-{int(now)}",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now)),
                "camera_id": camera_id,
                "event_type": "crowd_count",
                "severity": "info",
                "count": int(pred.get("count", 0)),
                "metadata": {},
            }
            try:
                redis.publish("alerts", json.dumps(payload))
            except Exception:
                pass
            last_publish = now
