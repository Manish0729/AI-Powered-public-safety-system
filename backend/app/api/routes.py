from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import uuid
from ..db.session import SessionLocal
from ..db import models_sql
from ..core.privacy import hash_identifier
from ..core.redis_client import get_sync_redis
from ..ws.sockets import notify_all
import json

router = APIRouter(tags=["events"])

class Alert(BaseModel):
    id: str
    timestamp: str
    camera_hash: str
    event_type: str
    severity: str
    count: Optional[int] = None
    metadata: dict


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/alerts", response_model=List[Alert])
def list_alerts(limit: int = 50, db: Session = Depends(get_db)):
    rows = (
        db.query(models_sql.EventLog)
        .order_by(models_sql.EventLog.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        Alert(
            id=r.id,
            timestamp=r.timestamp.isoformat() if r.timestamp else "",
            camera_hash=r.camera_hash,
            event_type=r.event_type,
            severity=r.severity,
            count=r.count,
            metadata=r.event_metadata or {},
        )
        for r in rows
    ]

@router.post("/alerts", response_model=Alert)
def create_alert(
    camera_id: str,
    event_type: str,
    severity: str,
    count: Optional[int] = None,
    metadata: Optional[dict] = None,
    db: Session = Depends(get_db),
):
    camera_hash = hash_identifier(camera_id)
    evt = models_sql.EventLog(
        id=str(uuid.uuid4()),
        camera_hash=camera_hash,
        event_type=event_type,
        severity=severity,
        count=count,
        event_metadata=metadata or {},
    )
    db.add(evt)
    db.commit()
    db.refresh(evt)
    alert = Alert(
        id=evt.id,
        timestamp=evt.timestamp.isoformat() if evt.timestamp else "",
        camera_hash=evt.camera_hash,
        event_type=evt.event_type,
        severity=evt.severity,
        count=evt.count,
        metadata=evt.event_metadata or {},
    )
    try:
        redis = get_sync_redis()
        redis.publish("alerts", json.dumps(alert.model_dump()))
    except Exception:
        pass
    return alert

@router.get("/status")
def status():
    return {"service": "backend", "status": "running"}
