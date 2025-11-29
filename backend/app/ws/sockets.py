from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

router = APIRouter()

clients: List[WebSocket] = []

@router.websocket("/ws/alerts")
async def alerts_ws(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in clients:
            clients.remove(websocket)

async def notify_all(message: str):
    for client in list(clients):
        try:
            await client.send_text(message)
        except Exception:
            if client in clients:
                clients.remove(client)
