"""CyberMentis's shared, offline message and URL analysis engine.

Both the Message Checker and URL Checker import functions from this module.
No DNS requests, HTTP requests, or external threat intelligence calls occur here.
Compatible with Python 3.9+.
"""

import ipaddress  # Python's built-in library for IPv4 and IPv6 addresses.
import re  # Regular expressions: match words and patterns in message text.
from typing import Optional  # Optional[str] means a string or None.
from urllib.parse import urlsplit  # Separates a URL into scheme, host, path, etc.


# A regex (regular expression) describes a text pattern to search for.
# \b matches a word boundary; re.IGNORECASE ignores uppercase/lowercase.
URGENT_PATTERNS = [
    r"\bimmediately\b",
    r"\bact now\b",
    r"\bwithin \d+ minutes?\b",
    r"\bwill be blocked\b",
    r"\baccount.{0,30}\bsuspended\b",
]

# These patterns focus on requests to DISCLOSE credentials, rather than
# flagging every harmless mention of the words "password" or "OTP".
SENSITIVE_PATTERNS = [
    (
        r"\b(?:share|send|provide|tell|enter|submit|confirm|verify)"
        r"\s+(?:me\s+)?(?:your\s+)?"
        r"(?:otp|one[- ]time password|password|pin|verification code)\b"
    ),
    (
        r"\b(?:otp|one[- ]time password|password|pin|verification code)"
        r"\b.{0,30}\b(?:share|send|provide|reply|enter|submit)\b"
    ),
]

REWARD_PATTERNS = [
    r"\byou have won\b",
    r"\byou won\b",
    r"\bclaim your prize\b",
    r"\bfree cash\b",
]

# Find http:// or https:// links inside messages. The regex stops at spaces,
# quotation marks, and HTML-like angle brackets.
URL_PATTERN = re.compile(r'''https?://[^\s<>"']+''', re.IGNORECASE)
URL_TRAILING_CHARACTERS = ".,!?;:)"

# Each distinct finding type adds its weight ONCE to the heuristic score.
# These numbers are educational rules, not calibrated scam probabilities.
RISK_WEIGHTS = {
    "urgent_language": 15,
    "unexpected_reward": 15,
    "no_https": 10,
    "url_userinfo": 25,
    "sensitive_information": 35,
    "invalid_url": 10,
    "ip_address_url": 10,
    "private_ip_url": 0,  # Information, not automatically malicious.
    "loopback_ip_url": 0,
    "link_local_ip_url": 0,
    "special_use_ip_url": 0,
    "local_hostname_url": 0,
    "deep_subdomain": 5,
    "punycode_domain": 15,
}

# Each finding includes a practical action that the frontend can display.
FINDING_ACTIONS = {
    "urgent_language": (
        "Pause before acting. Verify the request through an official website "
        "or a contact method you already trust."
    ),
    "sensitive_information": (
        "Never share an OTP, password, PIN, or verification code in response "
        "to an unexpected message. Use the official app or website instead."
    ),
    "unexpected_reward": (
        "Verify the offer independently. Do not pay an unexpected fee or "
        "share personal information to claim a prize."
    ),
    "no_https": (
        "Avoid entering passwords or payment details over plain HTTP. "
        "Check the official destination independently."
    ),
    "url_userinfo": (
        "Inspect the actual hostname after the '@' symbol. Text before "
        "it can make a link appear to lead somewhere else."
    ),
    "invalid_url": (
        "Do not rely on a malformed link. Find the official website independently."
    ),
    "ip_address_url": (
        "Confirm that you expected an IP-based link. An IP address alone "
        "does not indicate whether a website is trustworthy."
    ),
    "private_ip_url": (
        "This address belongs to a private network. Only access it if "
        "you recognize the local device or service."
    ),
    "loopback_ip_url": (
        "This address points to the device opening the link, not a "
        "public website. Do not open unexpected localhost links."
    ),
    "link_local_ip_url": (
        "This address is intended for a local network segment. "
        "Verify that the device or service is expected."
    ),
    "special_use_ip_url": (
        "This address has a special networking purpose or is not globally "
        "reachable. Verify why the link uses it."
    ),
    "local_hostname_url": (
        "This hostname may refer to a device or service on your local "
        "network. Only access it if you recognize the destination."
    ),
    "deep_subdomain": (
        "Read the full hostname carefully. A familiar brand name in a "
        "subdomain does not prove that the website belongs to that brand."
    ),
    "punycode_domain": (
        "Check the domain for lookalike characters and verify the "
        "organization's real website independently."
    ),
}

DISCLAIMER = (
    "This analysis identifies possible warning signs, not proof of a scam. "
    "A message or URL without detected indicators may still be malicious. "
    "URLs are analyzed as text; no website is visited."
)


def _finding(
    finding_type: str,
    severity: str,
    message: str,
    url: Optional[str] = None,
) -> dict:
    """Create a finding in the format expected by the React frontend.

    The leading underscore in _finding is a Python naming convention:
    this function is a helper intended mainly for use inside this file.
    """
    result = {
        "type": finding_type,
        "severity": severity,
        "message": message,
        "action": FINDING_ACTIONS.get(
            finding_type,
            "Verify this information independently before taking action.",
        ),
    }
    if url is not None:
        result["url"] = url
    return result


def extract_urls(message: str) -> list[str]:
    """Find unique HTTP(S) links inside a message without opening them."""
    matches = URL_PATTERN.findall(message)
    urls = []
    for match in matches:
        # A sentence's final period often isn't part of its URL.
        url = match.rstrip(URL_TRAILING_CHARACTERS)
        if url and url not in urls:
            urls.append(url)
    return urls


def classify_ip_address(hostname: str) -> Optional[dict]:
    """Classify a literal IPv4 or IPv6 address (not a domain name).

    Returns None for hostnames like example.com. This function does NOT
    resolve domain names or make any network requests.
    """
    try:
        ip = ipaddress.ip_address(hostname)
    except ValueError:
        return None  # It is not a valid literal IP address.

    # Order matters: loopback and link-local are also non-global addresses.
    if ip.is_loopback:
        category = "loopback"
    elif ip.is_link_local:
        category = "link_local"
    elif ip.is_multicast:
        category = "multicast"
    elif ip.is_unspecified:
        category = "unspecified"
    elif ip.version == 4 and ip in ipaddress.ip_network("100.64.0.0/10"):
        category = "shared_address"  # Carrier-grade NAT range.
    elif (
        ip.version == 4
        and any(
            ip in network
            for network in (
                ipaddress.ip_network("10.0.0.0/8"),
                ipaddress.ip_network("172.16.0.0/12"),
                ipaddress.ip_network("192.168.0.0/16"),
            )
        )
    ) or (ip.version == 6 and ip in ipaddress.ip_network("fc00::/7")):
        category = "private"
    elif ip.is_global:
        category = "public"
    else:
        category = "special_use"

    return {
        "ip": str(ip),
        "version": ip.version,  # 4 means IPv4; 6 means IPv6.
        "category": category,
        "is_global": ip.is_global,
    }


def analyze_url(url: str) -> list[dict]:
    """Check a URL's text for warning signs; never visit the website.

    Both checkers call this same function, so they use consistent rules.
    """
    findings = []
    try:
        parsed = urlsplit(url)
        hostname = parsed.hostname
        # Reading .port checks malformed port values (such as :abc).
        _ = parsed.port
        if parsed.scheme.lower() not in {"http", "https"} or not hostname:
            raise ValueError("Missing HTTP(S) scheme or hostname")
    except ValueError:
        return [_finding("invalid_url", "low", "Invalid or incomplete URL structure.", url)]

    hostname = hostname.rstrip(".").lower()
    if not hostname:
        return [_finding("invalid_url", "low", "Missing destination hostname.", url)]

    if parsed.scheme.lower() != "https":
        findings.append(_finding(
            "no_https", "medium",
            "This link does not use HTTPS. Data may be transmitted without "
            "the protection provided by HTTPS.", url,
        ))

    # Example: https://bank.example@attacker.example/login
    # The actual hostname is attacker.example, NOT bank.example.
    if parsed.username is not None or parsed.password is not None:
        findings.append(_finding(
            "url_userinfo", "medium",
            "The URL contains user-information text before '@', which can "
            "mislead readers about its actual destination.", url,
        ))

    ip_info = classify_ip_address(hostname)
    if ip_info is not None:
        findings.append(_finding(
            "ip_address_url", "low",
            "This link uses an IP address instead of a domain name.", url,
        ))

        # These extra classifications are informational, with zero added
        # score. A home router's private IP is not inherently suspicious.
        category = ip_info["category"]
        classification_findings = {
            "private": ("private_ip_url", "This URL points to a private network address."),
            "loopback": ("loopback_ip_url", "This URL points to the local device (loopback)."),
            "link_local": ("link_local_ip_url", "This URL points to a link-local address."),
            "multicast": ("special_use_ip_url", "This URL uses a multicast address."),
            "unspecified": ("special_use_ip_url", "This URL uses an unspecified address."),
            "shared_address": ("special_use_ip_url", "This URL uses a shared carrier-grade NAT address."),
            "special_use": ("special_use_ip_url", "This URL uses a special-use or non-global address."),
        }
        if category in classification_findings:
            finding_type, description = classification_findings[category]
            findings.append(_finding(finding_type, "info", description, url))
    else:
        # localhost and *.localhost refer to local development environments.
        # *.local is commonly used for local-network name discovery.
        if hostname == "localhost" or hostname.endswith((".localhost", ".local")):
            findings.append(_finding(
                "local_hostname_url", "info",
                "This hostname may resolve to a local device or service.", url,
            ))

        labels = hostname.split(".")
        if len(labels) > 4:
            findings.append(_finding(
                "deep_subdomain", "low",
                "This link contains several subdomain levels. Verify the "
                "actual destination carefully.", url,
            ))
        if any(label.startswith("xn--") for label in labels):
            findings.append(_finding(
                "punycode_domain", "medium",
                "This hostname contains punycode, which can be used for "
                "internationalized domains or lookalike addresses.", url,
            ))

    return findings


def calculate_risk_score(findings: list[dict]) -> int:
    """Add unique warning weights and limit the score to 100.

    A set stores each type once, so repeating the same warning does not
    unfairly increase the score. This is NOT a probability of fraud.
    """
    seen_types = set()
    score = 0
    for finding in findings:
        finding_type = finding.get("type")
        if finding_type in seen_types:
            continue
        seen_types.add(finding_type)
        score += RISK_WEIGHTS.get(finding_type, 0)
    return min(score, 100)


def analyze_message(message: str) -> dict:
    """Analyze text and any embedded URLs, returning a frontend-ready report."""
    normalized_message = message.strip()
    if not normalized_message:
        return {
            "verdict": "invalid_input", "risk_score": 0,
            "findings": [], "urls": [], "disclaimer": DISCLAIMER,
        }

    findings = []
    checks = [
        (URGENT_PATTERNS, "urgent_language", "medium",
         "This message uses urgent or pressuring language."),
        (SENSITIVE_PATTERNS, "sensitive_information", "high",
         "This message appears to request sensitive credentials or codes."),
        (REWARD_PATTERNS, "unexpected_reward", "medium",
         "This message mentions a potentially unexpected prize or reward."),
    ]

    # any(...) returns True if at least one pattern in a group matches.
    for patterns, finding_type, severity, description in checks:
        if any(re.search(pattern, normalized_message, re.IGNORECASE) for pattern in patterns):
            findings.append(_finding(finding_type, severity, description))

    urls = extract_urls(normalized_message)
    for url in urls:
        findings.extend(analyze_url(url))  # Reuse URL Checker logic.

    risk_score = calculate_risk_score(findings)
    if risk_score >= 60:
        verdict = "potentially_suspicious"
    elif risk_score > 0:
        verdict = "needs_review"
    else:
        verdict = "no_obvious_indicators"

    return {
        "verdict": verdict,
        "risk_score": risk_score,
        "findings": findings,
        "urls": urls,  # Keep the existing list-of-strings API contract.
        "disclaimer": DISCLAIMER,
    }
