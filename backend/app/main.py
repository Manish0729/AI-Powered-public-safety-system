from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import routes
from .api import auth as auth_routes
from .api import stream as stream_routes
from .ws import sockets
from .ws.redis_listener import alerts_listener
import asyncio
import os
import time
from sqlalchemy import text
from .db.session import engine
from .db.base import Base

app = FastAPI(title="AI-Powered Public Safety System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api")
app.include_router(auth_routes.router, prefix="/api")
app.include_router(stream_routes.router, prefix="/api")
app.include_router(sockets.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.on_event("startup")
def on_startup() -> None:
    # Wait for DB to be ready (avoid crash loops on startup)
    for _ in range(60):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            break
        except Exception:
            time.sleep(1)
    Base.metadata.create_all(bind=engine)
    # Start Redis alerts listener
    loop = asyncio.get_event_loop()
    loop.create_task(alerts_listener())
    if os.getenv("RUN_CROWD_WORKER", "false").lower() == "true":
        from .ml.yolo_inference import run_crowd_worker  # type: ignore
        loop.run_in_executor(None, run_crowd_worker)
