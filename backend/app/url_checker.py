
from typing import Dict, List
from urllib.parse import urlsplit

from app.detector import analyze_url, calculate_risk_score


URL_CHECK_DISCLAIMER = (
    "This report checks URL structure for known warning signs. "
    "It does not visit the website or check a live threat-intelligence "
    "database. No detected warning signs does not guarantee that a "
    "website is safe."
)


def normalize_url(raw_url: str) -> str:
    """
    Normalize user input into an HTTP(S) URL.

    A missing scheme defaults to HTTPS. This function never visits
    the supplied URL.
    """
    value = raw_url.strip()

    if not value:
        raise ValueError("Enter a URL to check.")

    # Do not accept embedded whitespace in a URL.
    if any(character.isspace() for character in value):
        raise ValueError("The URL must not contain spaces.")

    # Allow users to enter example.com without typing a scheme.
    if "://" not in value:
        value = "https://" + value

    try:
        parsed = urlsplit(value)
        hostname = parsed.hostname

        # Accessing .port validates the port syntax.
        _ = parsed.port
    except ValueError:
        raise ValueError("Enter a valid URL.")

    if parsed.scheme.lower() not in {"http", "https"}:
        raise ValueError("Only HTTP and HTTPS URLs are supported.")

    if not hostname:
        raise ValueError("The URL must include a hostname.")

    # Reject hostnames containing malformed authority syntax.
    if "@" in parsed.netloc and parsed.username is None:
        raise ValueError("Enter a valid URL.")

    return value


def check_url(raw_url: str) -> Dict:
    """
    Produce a structured URL safety report using existing detector rules.
    """
    normalized_url = normalize_url(raw_url)
    parsed = urlsplit(normalized_url)

    findings: List[dict] = analyze_url(normalized_url)
    risk_score = calculate_risk_score(findings)

    if risk_score >= 60:
        verdict = "potentially_suspicious"
    elif risk_score > 0:
        verdict = "needs_review"
    else:
        verdict = "no_obvious_indicators"

    return {
        "url": normalized_url,
        "hostname": parsed.hostname,
        "scheme": parsed.scheme.lower(),
        "uses_https": parsed.scheme.lower() == "https",
        "verdict": verdict,
        "risk_score": risk_score,
        "findings": findings,
        "disclaimer": URL_CHECK_DISCLAIMER,
    }
