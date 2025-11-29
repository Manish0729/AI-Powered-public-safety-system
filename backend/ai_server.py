import cv2
import math
import time
import asyncio
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import uvicorn
import socketio

# 1. Server & Socket Setup
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI(title="AI Public Safety Brain")
socket_app = socketio.ASGIApp(sio, app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Load AI Model (OPTIMIZED)
# 'yolov8s.pt' (Small) is the SWEET SPOT for Laptops.
# Fast like Nano, Smart like Medium.
print("🧠 Loading OPTIMIZED AI MODEL (Small)...")
model = YOLO('yolov8s.pt') 
print("✅ AI SYSTEM READY & SUPER FAST!")

# --- CONFIGURATION ---
# Strict Class Filtering
WEAPON_CLASSES = [34, 43, 76, 86] # Bat, Knife, Scissors, Chainsaw
PERSON_CLASS = [0]
SUSPICIOUS_CLASSES = [24, 26, 28, 39, 25] # Bags, Bottle, Umbrella
ALL_ALLOWED = WEAPON_CLASSES + PERSON_CLASS + SUSPICIOUS_CLASSES

last_alert_time = {}
AI_ACTIVE = True 

@sio.on('toggle_ai')
async def handle_ai_toggle(sid, data):
    global AI_ACTIVE
    AI_ACTIVE = data
    print(f"STATUS: {'ACTIVE' if AI_ACTIVE else 'STANDBY'}")

async def generate_frames():
    camera = cv2.VideoCapture(0) 
    if not camera.isOpened():
        print("❌ Error: Could not open Webcam.")
        return

    # INPUT: HD Resolution (Taaki insan ko saaf dikhe)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    # FPS Calculation Variables
    prev_frame_time = 0
    new_frame_time = 0

    while True:
        success, frame = camera.read()
        if not success:
            break
            
        if AI_ACTIVE:
            # PROCESSING: imgsz=640 (Taaki AI TEZ chale)
            # conf=0.25: Balanced sensitivity (Not too low, not too high)
            results = model(frame, verbose=False, conf=0.25, iou=0.45, imgsz=640, classes=ALL_ALLOWED)
            annotated_frame = frame.copy()
            
            person_count = 0
            current_time = time.time()
            
            # --- 1. COUNTING LOGIC ---
            for r in results:
                for box in r.boxes:
                    if int(box.cls[0]) == 0 and float(box.conf[0]) > 0.50:
                        person_count += 1
            
            is_crowd_danger = person_count >= 5

            # --- 2. ALERT LOGIC (CROWD) ---
            if is_crowd_danger:
                if current_time - last_alert_time.get("crowd", 0) > 5:
                    await sio.emit('new_alert', {
                        'id': int(current_time),
                        'type': 'CROWD SURGE',
                        'location': 'Main Camera',
                        'severity': 'high',
                        'time': time.strftime("%H:%M:%S")
                    })
                    last_alert_time["crowd"] = current_time

            # --- 3. DRAWING & WEAPON LOGIC ---
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    label = model.names[cls]

                    # A. WEAPONS (RED & ALERT)
                    if cls in WEAPON_CLASSES:
                        cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 0, 255), 3)
                        
                        # Alert Text on Screen
                        if int(time.time() * 5) % 2 == 0:
                            cv2.putText(annotated_frame, f"THREAT: {label.upper()}", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,255), 2)
                        else:
                            cv2.putText(annotated_frame, f"THREAT: {label.upper()}", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)
                        
                        # Send Socket Alert
                        if current_time - last_alert_time.get(label, 0) > 5:
                            print(f"🚀 DETECTED: {label}")
                            await sio.emit('new_alert', {
                                'id': int(current_time),
                                'type': f"WEAPON: {label.upper()}", 
                                'location': 'Main Gate',
                                'severity': 'high',
                                'time': time.strftime("%H:%M:%S")
                            })
                            last_alert_time[label] = current_time

                    # B. SUSPICIOUS (YELLOW)
                    elif cls in SUSPICIOUS_CLASSES:
                        cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 255, 255), 2)
                        cv2.putText(annotated_frame, f"{label}", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)

                    # C. PERSON (GREEN/RED)
                    elif cls == 0:
                         if conf > 0.50: # Only confident detections
                             if is_crowd_danger:
                                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                                cv2.putText(annotated_frame, "PERSON", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                             else:
                                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                                cv2.putText(annotated_frame, "PERSON", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            # Crowd Overlay
            if is_crowd_danger:
                cv2.rectangle(annotated_frame, (0, 0), (500, 50), (0, 0, 200), -1)
                cv2.putText(annotated_frame, f"CROWD ALERT: {person_count}", (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

            # Calculate FPS (To check speed)
            new_frame_time = time.time()
            fps = 1/(new_frame_time-prev_frame_time)
            prev_frame_time = new_frame_time
            cv2.putText(annotated_frame, f"FPS: {int(fps)}", (1150, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            final_image = annotated_frame
        else:
            # AI OFF Mode
            final_image = frame

        ret, buffer = cv2.imencode('.jpg', final_image)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        await asyncio.sleep(0.001) # Small sleep to prevent CPU maxing out

@app.get("/")
def home(): return {"status": "Online"}
@app.get("/video_feed")
def video_feed(): return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)