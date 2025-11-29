import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@db:5432/safety",
)
JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
PRIVACY_SALT = os.getenv("PRIVACY_SALT", "set-a-strong-random-salt")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
