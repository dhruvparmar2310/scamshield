"""CyberMentis optional Deep Scan.

Adds DNS and WHOIS context using NetworkCalc.

Important:
- Deep Scan never visits the submitted website.
- Only public DNS hostnames are sent to NetworkCalc.
- DNS resolution is not proof of safety.
- WHOIS information is not proof of ownership or legitimacy.
- Network failures must not erase local security warnings.
- Risk scores remain heuristic indicators, not fraud probabilities.
"""

import ipaddress
import json
import re
import threading
import time

from datetime import datetime, timezone
from typing import Dict, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen

from app.url_checker import check_url


# ---------------------------------------------------------
# NETWORKCALC CONFIGURATION
# ---------------------------------------------------------

NETWORKCALC_BASE_URL = "https://networkcalc.com/api"
REQUEST_TIMEOUT_SECONDS = 5
CACHE_TTL_SECONDS = 900
MAX_CACHE_ENTRIES = 256
MAX_RESPONSE_BYTES = 256 * 1024

# A small in-memory cache avoids repeating external requests.
# For multiple production workers, use Redis instead.
_CACHE = {}
_CACHE_LOCK = threading.Lock()


def _get_cached(hostname: str) -> Optional[dict]:
    """Return a cached report when it has not expired."""

    with _CACHE_LOCK:
        entry = _CACHE.get(hostname)

        if not entry:
            return None

        expires_at, value = entry

        if time.monotonic() >= expires_at:
            del _CACHE[hostname]
            return None

        return value


def _set_cached(hostname: str, value: dict) -> None:
    """Cache an intelligence report for a short period."""

    with _CACHE_LOCK:
        if len(_CACHE) >= MAX_CACHE_ENTRIES:
            oldest_key = next(iter(_CACHE))
            _CACHE.pop(oldest_key, None)

        _CACHE[hostname] = (
            time.monotonic() + CACHE_TTL_SECONDS,
            value,
        )


def _is_public_hostname(hostname: str) -> bool:
    """Allow external DNS lookups only for plausible public domain names."""

    if not hostname:
        return False

    hostname = hostname.lower().rstrip(".")

    if len(hostname) > 253:
        return False

    # Do not send literal IP addresses to the external service.
    try:
        ipaddress.ip_address(hostname)
        return False
    except ValueError:
        pass

    if hostname in {"localhost", "local"}:
        return False

    if hostname.endswith((
        ".localhost",
        ".local",
        ".internal",
        ".test",
        ".invalid",
        ".example",
        ".home",
        ".lan",
        ".onion",
    )):
        return False

    if "." not in hostname:
        return False

    # Each label must follow ordinary ASCII DNS hostname rules.
    labels = hostname.split(".")

    for label in labels:
        if not re.fullmatch(
            r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?",
            label,
        ):
            return False

    # Avoid sending unusual numeric or internal-looking TLDs.
    if not re.fullmatch(r"[a-z]{2,63}|xn--[a-z0-9-]+", labels[-1]):
        return False

    return True


def _networkcalc_get(endpoint: str) -> dict:
    """Request JSON from a fixed NetworkCalc API endpoint."""

    url = NETWORKCALC_BASE_URL + endpoint

    request = Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "CyberMentis-DeepScan/1.0",
        },
        method="GET",
    )

    try:
        with urlopen(
            request,
            timeout=REQUEST_TIMEOUT_SECONDS,
        ) as response:
            # Bound the amount of data read from a third-party service.
            raw = response.read(MAX_RESPONSE_BYTES + 1)

            if len(raw) > MAX_RESPONSE_BYTES:
                return {
                    "ok": False,
                    "error": "Response exceeded size limit.",
                }

            payload = json.loads(raw.decode("utf-8"))

            if not isinstance(payload, dict):
                return {
                    "ok": False,
                    "error": "Unexpected API response format.",
                }

            return {
                "ok": True,
                "data": payload,
            }

    except HTTPError as exc:
        return {
            "ok": False,
            "error": "NetworkCalc returned HTTP {}.".format(exc.code),
        }

    except (URLError, TimeoutError):
        return {
            "ok": False,
            "error": "NetworkCalc request failed or timed out.",
        }

    except (ValueError, UnicodeError, OSError):
        return {
            "ok": False,
            "error": "Unable to read NetworkCalc response.",
        }


def _api_reported_error(payload: dict) -> bool:
    """Recognize explicit API errors without guessing from missing fields."""

    if payload.get("success") is False:
        return True

    if payload.get("status") in ("error", "failed"):
        return True

    if payload.get("error"):
        return True

    return False


def _extract_dns_records(payload: dict) -> dict:
    """Extract commonly used DNS records from different JSON layouts."""

    # NetworkCalc responses may contain a nested records object.
    # Keep the parser conservative: unknown structures are not
    # interpreted as successful DNS resolution.
    sources = [payload]

    for key in ("records", "data", "result", "answer"):
        value = payload.get(key)

        if isinstance(value, dict):
            sources.append(value)

    records = {}

    for record_type in ("A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA"):
        values = None

        for source in sources:
            values = source.get(record_type)

            if values is None:
                values = source.get(record_type.lower())

            if values is not None:
                break

        if isinstance(values, list):
            records[record_type] = values

        elif isinstance(values, (str, dict)) and values:
            records[record_type] = [values]

    return records


def lookup_dns(hostname: str) -> dict:
    """Check available DNS records without contacting the target website."""

    endpoint = "/dns/lookup/{}".format(quote(hostname, safe=""))
    response = _networkcalc_get(endpoint)

    if not response["ok"]:
        return {
            "status": "unavailable",
            "records": {},
            "error": response["error"],
        }

    payload = response["data"]

    if _api_reported_error(payload):
        return {
            "status": "unavailable",
            "records": {},
            "error": "The DNS API reported an error.",
        }

    records = _extract_dns_records(payload)

    if records:
        return {
            "status": "resolved",
            "records": records,
            "error": None,
        }

    # An empty or unfamiliar JSON response is not sufficient
    # evidence that the domain has no DNS records.
    return {
        "status": "unknown",
        "records": {},
        "error": "No recognized DNS records were returned.",
    }


def _extract_registration_date(payload: dict) -> Optional[str]:
    """Find a registration date only when a recognizable field exists."""

    sources = [payload]

    for key in ("data", "result", "whois", "domain"):
        nested = payload.get(key)

        if isinstance(nested, dict):
            sources.append(nested)

    keys = (
        "creation_date",
        "created_date",
        "created",
        "registered",
        "registration_date",
        "createdDate",
    )

    for source in sources:
        for key in keys:
            value = source.get(key)

            if isinstance(value, str) and value.strip():
                return value.strip()

    return None


def _calculate_domain_age(date_string: Optional[str]) -> Optional[int]:
    """Calculate age only for recognized ISO-style registration dates."""

    if not date_string:
        return None

    try:
        parsed = datetime.fromisoformat(
            date_string.replace("Z", "+00:00")
        )

        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)

        age = (
            datetime.now(timezone.utc) - parsed
        ).days

        if age < 0:
            return None

        return age

    except ValueError:
        return None


def lookup_whois(hostname: str) -> dict:
    """Fetch optional WHOIS information from NetworkCalc."""

    endpoint = "/dns/whois/{}".format(quote(hostname, safe=""))
    response = _networkcalc_get(endpoint)

    if not response["ok"]:
        return {
            "status": "unavailable",
            "creation_date": None,
            "domain_age_days": None,
            "error": response["error"],
        }

    payload = response["data"]

    if _api_reported_error(payload):
        return {
            "status": "unavailable",
            "creation_date": None,
            "domain_age_days": None,
            "error": "The WHOIS API reported an error.",
        }

    creation_date = _extract_registration_date(payload)

    return {
        "status": "available" if creation_date else "unknown",
        "creation_date": creation_date,
        "domain_age_days": _calculate_domain_age(creation_date),
        "error": None,
    }


def get_domain_intelligence(hostname: str) -> dict:
    """Collect external domain information with caching and safeguards."""

    hostname = hostname.lower().rstrip(".")

    if not _is_public_hostname(hostname):
        return {
            "dns_status": "skipped",
            "dns_records": {},
            "whois_status": "skipped",
            "creation_date": None,
            "domain_age_days": None,
            "verification_status": "unverified",
            "errors": [],
            "message": (
                "External lookups were skipped for this address."
            ),
        }

    cached = _get_cached(hostname)

    if cached is not None:
        return cached

    dns = lookup_dns(hostname)
    whois = lookup_whois(hostname)

    errors = []

    if dns["error"]:
        errors.append(dns["error"])

    if whois["error"]:
        errors.append(whois["error"])

    intelligence = {
        "dns_status": dns["status"],
        "dns_records": dns["records"],
        "whois_status": whois["status"],
        "creation_date": whois["creation_date"],
        "domain_age_days": whois["domain_age_days"],

        # DNS/WHOIS cannot authenticate the website operator.
        "verification_status": "unverified",
        "errors": errors,
        "message": (
            "DNS and WHOIS results provide technical context, "
            "not confirmation that a website is safe or official."
        ),
    }

    _set_cached(hostname, intelligence)

    return intelligence


def deep_check_url(raw_url: str) -> Dict:
    """Combine existing CyberMentis URL checks with external intelligence."""

    # Reuse all existing Smart Scan checks.
    # This preserves brand impersonation and government lookalike findings.
    result = check_url(raw_url)

    hostname = result["hostname"]

    intelligence = get_domain_intelligence(hostname)

    # Keep DNS and WHOIS results separate from the existing score.
    # A successful DNS lookup must never lower a phishing warning.
    # An unavailable DNS response must never be treated as proof of fraud.
    result["scan_mode"] = "deep"
    result["domain_intelligence"] = intelligence

    # The risk score and verdict remain unchanged in this initial version.
    # Future age-based rules can be added only after validating the
    # reliability of WHOIS dates and their false-positive behavior.
    result["deep_scan_complete"] = (
        intelligence["dns_status"] not in ("unavailable", "skipped")
        and intelligence["whois_status"] not in ("unavailable", "skipped")
    )

    return result