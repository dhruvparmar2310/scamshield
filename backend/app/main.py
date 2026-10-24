
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.detector import analyze_message
from app.url_checker import check_url


app = FastAPI(
    title="CyberMentis API",
    description="Rule-based scam message and URL analysis.",
    version="1.1.0",
)

# Local development origins
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Production frontend origins from Render environment
production_origins = os.getenv("FRONTEND_ORIGINS", "")

allowed_origins.extend(
    origin.strip().rstrip("/")
    for origin in production_origins.split(",")
    if origin.strip()
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


class AnalyzeRequest(BaseModel):
    message: str = Field(..., max_length=10000)


class URLCheckRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/analyze")
def analyze(request: AnalyzeRequest):
    message = request.message.strip()

    if not message:
        return {
            "verdict": "invalid_input",
            "risk_score": 0,
            "findings": [],
            "urls": [],
            "disclaimer": (
                "Enter a message to analyze. Automated checks cannot "
                "guarantee that a message is safe."
            ),
        }

    return analyze_message(message)


@app.post("/api/url-check")
def url_check(request: URLCheckRequest):
    try:
        return check_url(request.url)
    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error
