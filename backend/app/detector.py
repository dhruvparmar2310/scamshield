
import ipaddress
import re
from typing import Optional
from urllib.parse import urlsplit


URGENT_PATTERNS = [
    r"\bimmediately\b",
    r"\bact now\b",
    r"\bwithin \d+ minutes?\b",
    r"\bwill be blocked\b",
    r"\baccount.{0,30}\bsuspended\b",
]

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

URL_PATTERN = re.compile(r"""https?://[^\s<>"']+""", re.IGNORECASE)

URL_TRAILING_CHARACTERS = ".,!?;:)"

RISK_WEIGHTS = {
    "urgent_language": 15,
    "unexpected_reward": 15,
    "no_https": 10,
    "url_userinfo": 25,
    "sensitive_information": 35,
    "invalid_url": 10,
    "ip_address_url": 10,
    "deep_subdomain": 5,
    "punycode_domain": 15,
}

# Practical guidance for each kind of warning.
# These recommendations are safety guidance, not proof of a scam.
FINDING_ACTIONS = {
    "urgent_language": (
        "Pause before acting. Verify the request through the "
        "organization's official website or a contact method you "
        "already trust."
    ),
    "sensitive_information": (
        "Do not share an OTP, password, PIN, or verification code "
        "in response to an unexpected message. Open the official "
        "app or website directly if you need to check your account."
    ),
    "unexpected_reward": (
        "Verify the offer through the company's official website "
        "or app. Do not pay a fee or provide personal information "
        "just to claim an unexpected prize."
    ),
    "no_https": (
        "Avoid entering passwords, payment details, or other "
        "sensitive information on this link. Find the official "
        "website independently and check whether it uses HTTPS."
    ),
    "url_userinfo": (
        "Do not open the link until you verify its destination. "
        "Text before the '@' symbol can be misleading; inspect "
        "the actual hostname after it."
    ),
    "invalid_url": (
        "Do not rely on this link until its address is verified. "
        "If necessary, visit the service's official website by "
        "typing its known address yourself."
    ),
    "ip_address_url": (
        "Check whether you expected a link to this IP address. "
        "When in doubt, navigate to the service's official website "
        "instead of following the link."
    ),
    "deep_subdomain": (
        "Inspect the full hostname from right to left and identify "
        "the actual domain before proceeding. Verify it using an "
        "independent, trusted source."
    ),
    "punycode_domain": (
        "Check the domain carefully for lookalike characters. "
        "Find the organization's official domain independently "
        "rather than trusting the link in the message."
    ),
}

DISCLAIMER = (
    "This analysis identifies warning signs, not proof of a scam. "
    "A message without detected indicators may still be malicious."
)


def _finding(
    finding_type: str,
    severity: str,
    message: str,
    url: Optional[str] = None,
) -> dict:
    """Create a consistent finding with a recommended next step."""
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
    """Extract unique HTTP(S) URLs from a message."""
    matches = URL_PATTERN.findall(message)
    urls = []

    for match in matches:
        url = match.rstrip(URL_TRAILING_CHARACTERS)

        if url and url not in urls:
            urls.append(url)

    return urls


def _is_ip_address(hostname: str) -> bool:
    """Return True when hostname is a valid IPv4 or IPv6 address."""
    try:
        ipaddress.ip_address(hostname)
        return True
    except ValueError:
        return False


def analyze_url(url: str) -> list[dict]:
    """Identify potentially suspicious URL characteristics."""
    findings = []

    try:
        parsed = urlsplit(url)
        hostname = parsed.hostname

        if not parsed.scheme or not hostname:
            return [
                _finding(
                    "invalid_url",
                    "low",
                    "This link has an invalid or incomplete URL structure.",
                    url,
                )
            ]

        # Accessing .port can raise ValueError for malformed ports.
        _ = parsed.port

    except ValueError:
        return [
            _finding(
                "invalid_url",
                "low",
                "This link has an invalid URL structure.",
                url,
            )
        ]

    hostname = hostname.rstrip(".").lower()

    if not hostname:
        return [
            _finding(
                "invalid_url",
                "low",
                "This link does not contain a valid destination hostname.",
                url,
            )
        ]

    if parsed.scheme.lower() != "https":
        findings.append(
            _finding(
                "no_https",
                "medium",
                "This link does not use HTTPS. Check the destination "
                "carefully before sharing information.",
                url,
            )
        )

    # Example: https://paypal.com@evil.example/login
    if parsed.username is not None or parsed.password is not None:
        findings.append(
            _finding(
                "url_userinfo",
                "medium",
                "This URL contains user-information text before the "
                "'@' symbol. The actual destination may differ from "
                "the trusted-looking text.",
                url,
            )
        )

    if _is_ip_address(hostname):
        findings.append(
            _finding(
                "ip_address_url",
                "low",
                "This link uses an IP address instead of a regular "
                "domain name. Verify that the destination is expected.",
                url,
            )
        )
    else:
        labels = hostname.split(".")

        if len(labels) > 4:
            findings.append(
                _finding(
                    "deep_subdomain",
                    "low",
                    "This link contains several subdomain levels. "
                    "Check the registered domain and full destination.",
                    url,
                )
            )

        if any(label.startswith("xn--") for label in labels):
            findings.append(
                _finding(
                    "punycode_domain",
                    "medium",
                    "This domain contains a punycode label used for "
                    "internationalized domain names. Inspect the "
                    "domain carefully.",
                    url,
                )
            )

    return findings


def calculate_risk_score(findings: list[dict]) -> int:
    """
    Calculate a heuristic score from 0 to 100.

    Each finding type contributes at most once. This is not a
    probability that a message is malicious.
    """
    score = 0
    seen_types = set()

    for finding in findings:
        finding_type = finding.get("type")

        if finding_type in seen_types:
            continue

        seen_types.add(finding_type)
        score += RISK_WEIGHTS.get(finding_type, 0)

    return min(score, 100)


def analyze_message(message: str) -> dict:
    """Analyze a message using rule-based heuristics."""
    normalized_message = message.strip()
    lowered_message = normalized_message.lower()

    if not normalized_message:
        return {
            "verdict": "invalid_input",
            "risk_score": 0,
            "findings": [],
            "urls": [],
            "disclaimer": DISCLAIMER,
        }

    findings = []

    if any(
        re.search(pattern, lowered_message, re.IGNORECASE)
        for pattern in URGENT_PATTERNS
    ):
        findings.append(
            _finding(
                "urgent_language",
                "medium",
                "This message uses urgent language that may pressure "
                "you to act before checking whether the request is genuine.",
            )
        )

    if any(
        re.search(pattern, lowered_message, re.IGNORECASE)
        for pattern in SENSITIVE_PATTERNS
    ):
        findings.append(
            _finding(
                "sensitive_information",
                "high",
                "This message appears to ask for sensitive information "
                "such as a password, PIN, or one-time password. "
                "Be cautious about sharing these details.",
            )
        )

    if any(
        re.search(pattern, lowered_message, re.IGNORECASE)
        for pattern in REWARD_PATTERNS
    ):
        findings.append(
            _finding(
                "unexpected_reward",
                "medium",
                "This message mentions a prize or unexpected reward. "
                "Verify the offer independently before responding.",
            )
        )

    urls = extract_urls(normalized_message)

    for url in urls:
        findings.extend(analyze_url(url))

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
        "urls": urls,
        "disclaimer": DISCLAIMER,
    }
