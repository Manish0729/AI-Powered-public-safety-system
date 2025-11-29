import hashlib
from .config import PRIVACY_SALT


def hash_identifier(value: str) -> str:
    data = f"{PRIVACY_SALT}:{value}".encode("utf-8")
    return hashlib.sha256(data).hexdigest()
