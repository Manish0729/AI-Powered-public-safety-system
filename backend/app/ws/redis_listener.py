import asyncio
import json
from .sockets import notify_all
from ..core.redis_client import get_async_redis

async def alerts_listener() -> None:
    redis = get_async_redis()
    pubsub = redis.pubsub()
    await pubsub.subscribe("alerts")
    async for message in pubsub.listen():
        if message is None:
            continue
        if message.get("type") != "message":
            continue
        data = message.get("data")
        try:
            if isinstance(data, bytes):
                data = data.decode("utf-8")
            await notify_all(data)
        except Exception:
            # ignore malformed
            pass
