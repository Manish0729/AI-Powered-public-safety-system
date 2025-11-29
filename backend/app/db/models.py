from pydantic import BaseModel
from typing import Optional, Dict

# Placeholder Pydantic models; can be replaced with SQLModel/SQLAlchemy schemas later
class EventLog(BaseModel):
    id: str
    timestamp: str
    camera_id: str
    event_type: str
    severity: str
    metadata: Dict[str, str]

class User(BaseModel):
    id: str
    email: str
    role: str  # admin, guard, viewer
    hashed_password: Optional[str] = None
