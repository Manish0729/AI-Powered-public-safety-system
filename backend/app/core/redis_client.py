import os
from typing import Optional
from redis import Redis as SyncRedis
from redis.asyncio import Redis as AsyncRedis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

_sync_client: Optional[SyncRedis] = None
_async_client: Optional[AsyncRedis] = None


def get_sync_redis() -> SyncRedis:
    global _sync_client
    if _sync_client is None:
        _sync_client = SyncRedis.from_url(REDIS_URL)
    return _sync_client


def get_async_redis() -> AsyncRedis:
    global _async_client
    if _async_client is None:
        _async_client = AsyncRedis.from_url(REDIS_URL)
    return _async_client
