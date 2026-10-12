import os

from dotenv import load_dotenv


load_dotenv()


def get_allowed_origins() -> list[str]:
    """Read allowed frontend origins from the environment."""
    raw_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000",
    )

    origins = [
        origin.strip().rstrip("/")
        for origin in raw_origins.split(",")
        if origin.strip()
    ]

    return origins


def get_gemini_model() -> str:
    """Return the configured Gemini model."""
    return os.getenv("GEMINI_MODEL", "gemini-2.5-flash")