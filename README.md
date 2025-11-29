# 🛡️ AI-Powered Public Safety System

An advanced **real-time surveillance and threat detection system** that uses **YOLOv8** computer vision and **WebSockets** to power a futuristic command-center dashboard.

The system continuously analyzes live CCTV / webcam feeds to detect **weapons, crowd surges, and suspicious activity**, and instantly pushes alerts to a **React-based SecureAI dashboard** with audio cues and incident logs.

---

## ✨ Key Features

- **🔫 Weapon Detection**  
  Detects dangerous objects such as **knives, pistols, bats, and similar threats** using YOLOv8.

- **👥 Crowd Surge Alerts**  
  Counts people and raises **RED ALERTS** when crowd density crosses a configurable safety threshold.

- **📡 Real-Time AI + WebSockets**  
  Frame-by-frame video analysis in Python, with **instant incident broadcast** to the frontend over **Socket.IO**.

- **📊 Live Command Dashboard**  
  Glassmorphism-style **dashboard UI** with:
  - Live camera feed
  - Live incident log
  - System diagnostics (CPU, memory, latency indicators)
  - Status cards for cameras and threat levels

- **🔐 Secure Login Portal**  
  Dashboard access is protected behind a **login screen** intended for authorized operators (command center staff / admins).

---

## 🧱 Tech Stack

### 🎨 Frontend
- **React** (Vite)
- **Tailwind CSS** for modern dashboard styling
- **Lucide Icons** for clean, high-quality iconography
- **Socket.IO client** for real-time alert updates

### 🤖 Backend / AI
- **Python 3.11**
- **FastAPI** (HTTP API + streaming endpoints)
- **YOLOv8 (Ultralytics)** for object detection
- **OpenCV** for video capture and frame processing
- **Socket.IO (python-socketio)** for WebSocket-based alert streaming

---

## 🧩 Project Structure (High Level)

```txt
AI-Powered Public Safety System/
├── backend/
│   ├── ai_server.py        # FastAPI + YOLOv8 + Socket.IO server
│   ├── requirements.txt    # Python dependencies
│   └── Procfile            # Render (backend) process definition
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # SecureAI dashboard UI
│   │   └── components/     # Layout, AlertsFeed, etc.
│   ├── index.html
│   ├── vite.config.js
│   └── package.json        # React/Vite dependencies
└── README.md               # You are here
```

---

## 💻 Running the Project Locally

> Prerequisites:  
> - Python **3.11+** installed  
> - Node.js **18+** and npm installed  
> - A webcam or video source available on your machine

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Manish0729/AI-Powered-public-safety-system.git
cd "AI-Powered Public Safety System"
```

---

### 2️⃣ Backend Setup (FastAPI + YOLOv8)

From the project root:

```bash
cd backend

# (Optional but recommended) create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

#### Start the AI Server

For local development you can run the server directly with Python:

```bash
python ai_server.py
```

or, if you prefer using Uvicorn explicitly:

```bash
uvicorn ai_server:socket_app --host 0.0.0.0 --port 8000 --reload
```

This will:
- Open the default camera (`VideoCapture(0)`)
- Run YOLOv8 detection on each frame
- Stream the annotated video at: `http://localhost:8000/video_feed`
- Expose WebSocket / Socket.IO events for real-time alerts

Keep this terminal **running**.

---

### 3️⃣ Frontend Setup (React + Vite + Tailwind)

Open a **new terminal** and from the project root run:

```bash
cd frontend
npm install
```

Create a local `.env` file inside `frontend/` to point the UI to your backend:

```env
VITE_API_URL=http://localhost:8000
```

#### Start the Dashboard

```bash
npm run dev
```

Vite will print a local URL, typically:

```text
http://localhost:5173
```

Open this URL in your browser to access the **SecureAI Command Center**:

- Log in using the demo credentials shown on the login screen
- View the live camera feed
- Watch real-time alerts populate the incident log when threats are detected

---

## ☁️ Deployment (Overview)

The project is designed for a **hybrid deployment**:

- **Backend on Render**
  - Uses `backend/requirements.txt` and `Procfile`
  - Start command (Render): `uvicorn ai_server:socket_app --host 0.0.0.0 --port $PORT`

- **Frontend on Vercel**
  - Root: `frontend/`
  - Build: `npm run build`
  - Output: `dist`
  - Env var: `VITE_API_URL=https://your-backend.onrender.com`

---

## 📌 Disclaimer

This project is intended for **educational and prototype use**. Any real-world public safety deployment must follow:

- Local privacy and CCTV regulations
- Data protection laws
- Ethics and bias evaluation of AI models

Use responsibly and test thoroughly before using in production environments.
