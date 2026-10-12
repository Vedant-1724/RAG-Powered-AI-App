from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.ask import router as ask_router
from app.api.upload import router as upload_router
from app.core.config import get_allowed_origins


app = FastAPI(
    title="AI-C1 RAG-Powered AI App",
    description="Upload a PDF and ask questions grounded in its content.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(upload_router, prefix="/api")
app.include_router(ask_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "AI-C1 RAG API is running.",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}