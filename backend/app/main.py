import os

from fastapi import FastAPI, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.detector import analyze_message
from app.url_checker import check_url

# Import the Deep Scan functionality.
# Deep Scan uses the existing URL checker and adds
# DNS and WHOIS intelligence through NetworkCalc.
from app.deep_scan import deep_check_url


app = FastAPI(
    title="CyberMentis API",
    description=(
        "Rule-based scam message and URL analysis "
        "with optional DNS and WHOIS deep scanning."
    ),
    version="1.2.0",
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


# Configure Cross-Origin Resource Sharing (CORS).
# This allows the Next.js frontend to communicate
# with the FastAPI backend from approved origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


# ---------------------------------------------------------
# REQUEST MODELS
# ---------------------------------------------------------

class AnalyzeRequest(BaseModel):
    """Request body for the scam message analyzer."""

    message: str = Field(
        ...,
        max_length=10000,
    )


class URLCheckRequest(BaseModel):
    """Request body for the existing Smart URL Checker."""

    url: str = Field(
        ...,
        min_length=1,
        max_length=2048,
    )


# Deep Scan accepts the same URL input format as Smart Scan.
# Keeping a separate request model makes it easier to add
# optional Deep Scan settings in the future.
class DeepScanRequest(BaseModel):
    """Request body for the optional URL Deep Scan."""

    url: str = Field(
        ...,
        min_length=1,
        max_length=2048,
    )


# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------

@app.get("/api/health")
def health_check():
    """Check whether the CyberMentis API is running."""

    return {
        "status": "ok",
    }


# ---------------------------------------------------------
# MESSAGE CHECKER
# ---------------------------------------------------------

@app.post("/api/analyze")
def analyze(request: AnalyzeRequest):
    """Analyze a message for potential scam warning signs."""

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


# ---------------------------------------------------------
# SMART URL CHECKER
# ---------------------------------------------------------

@app.post("/api/url-check")
def url_check(request: URLCheckRequest):
    """Run the existing offline URL security analysis.

    This includes:
    - URL structure analysis.
    - HTTP and HTTPS checks.
    - IP address classification.
    - Suspicious subdomain detection.
    - Punycode detection.
    - Government impersonation indicators.
    - Brand impersonation and typosquatting checks,
      when supported by url_checker.py.

    No external DNS or WHOIS requests are made.
    """

    try:
        return check_url(request.url)

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error


# ---------------------------------------------------------
# DEEP URL CHECKER
# ---------------------------------------------------------

@app.post("/api/url-check/deep")
async def deep_url_check(request: DeepScanRequest):
    """Run CyberMentis Deep Scan.

    Deep Scan performs:

    1. Existing Smart Scan analysis.
    2. DNS lookup using NetworkCalc.
    3. WHOIS lookup using NetworkCalc.
    4. Domain intelligence enrichment.
    5. Combined JSON report generation.

    IMPORTANT:
    - DNS resolution does not prove a domain is safe.
    - WHOIS information does not prove official ownership.
    - API failures must not erase existing URL warnings.
    - The existing risk score is preserved.
    """

    try:
        # NetworkCalc requests use synchronous network operations.
        #
        # Running the function in a threadpool prevents these
        # requests from blocking FastAPI's asynchronous event loop.
        result = await run_in_threadpool(
            deep_check_url,
            request.url,
        )

        # Return the complete Deep Scan report.
        #
        # The response includes existing URL Checker fields:
        # - url
        # - hostname
        # - scheme
        # - uses_https
        # - scheme_was_assumed
        # - verdict
        # - risk_score
        # - findings
        # - ip_info
        # - disclaimer
        #
        # Additional Deep Scan fields:
        # - scan_mode
        # - domain_intelligence
        # - deep_scan_complete
        return result

    except ValueError as error:
        # Return the same validation error status used
        # by the existing Smart URL Checker.
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error