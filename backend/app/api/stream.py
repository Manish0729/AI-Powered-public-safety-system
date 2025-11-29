from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import cv2

router = APIRouter(tags=["stream"])


def mjpeg_generator(source: int | str = 0):
    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        def _error_stream():
            yield b""
        return _error_stream()

    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            ok, buf = cv2.imencode('.jpg', frame)
            if not ok:
                continue
            frame_bytes = buf.tobytes()
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n")
    finally:
        cap.release()


@router.get("/stream/mjpeg")
def stream_mjpeg(source: str = "0"):
    src: int | str
    try:
        src = int(source)
    except ValueError:
        src = source
    return StreamingResponse(
        mjpeg_generator(src),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )
