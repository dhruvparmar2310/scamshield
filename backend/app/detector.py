
"""Offline, rule-based message and URL analysis for CyberMentis (Python 3.9+).

No DNS lookups, HTTP requests, or live reputation checks are performed.
The score measures matched warning signs; it is not a fraud probability.
"""

import ipaddress
import re
from typing import Optional
from urllib.parse import urlsplit

DISCLAIMER = (
    "This check highlights possible warning signs, not proof of fraud. "
    "A low score does not guarantee safety. Links are checked as text only; "
    "websites and senders are not verified."
)

# Scores are educational weights, not calibrated probabilities.
RISK_WEIGHTS = {
    "urgent_language": 10,
    "sensitive_information": 30,
    "unexpected_reward": 15,
    "authority_impersonation": 20,
    "legal_threat": 30,
    "forced_video_verification": 20,
    "isolation_pressure": 15,
    "personal_data_claim": 10,
    "suspicious_verification_link": 15,
    "no_https": 10,
    "url_userinfo": 25,
    "invalid_url": 10,
    "ip_address_url": 10,
    "private_ip_url": 0,
    "loopback_ip_url": 0,
    "link_local_ip_url": 0,
    "special_use_ip_url": 0,
    "local_hostname_url": 0,
    "deep_subdomain": 5,
    "punycode_domain": 15,

    # Domain-language indicators are contextual and do not prove a site is fraudulent.
    "government_identity_domain": 35,
    "official_verification_domain": 25,
    "identity_kyc_domain": 25,
}

# Findings are written for everyday users: what we noticed, why it matters,
# and what they can do. Do not claim a scam has been conclusively proven.
FINDING_CONTENT = {
    "urgent_language": (
        "The message pressures you to act quickly. This can make it harder to check whether the request is genuine.",
        "Take your time. Check the request through a trusted official source."
    ),
    "sensitive_information": (
        "The message asks for a password, OTP, PIN, or similar secret. Sharing it could put your account at risk.",
        "Do not share passwords, OTPs, or PINs in response to unexpected messages."
    ),
    "unexpected_reward": (
        "The message promises an unexpected prize or reward. Fake offers sometimes try to collect money or personal details.",
        "Check the offer independently. Do not pay a fee or share private details to claim it."
    ),
    "authority_impersonation": (
        "The sender claims to represent police, a cybercrime unit, or another authority. A claim in a message does not prove who sent it.",
        "Contact the agency using contact details from an official government website, not from this message."
    ),
    "legal_threat": (
        "The message threatens arrest or legal action to frighten you into responding. This pressure is a common scam tactic.",
        "Do not panic or follow instructions in the message. Verify any legal claim through official channels."
    ),
    "forced_video_verification": (
        "The message tells you to join an urgent video call to verify your identity. Scammers may use calls to pressure people into sharing documents or money.",
        "Do not join the call or show identity documents until you have independently verified the request."
    ),
    "isolation_pressure": (
        "The sender tells you to stay in the chat or keep your device on. This can be an attempt to stop you from seeking help.",
        "You can end the conversation. Speak to someone you trust and verify the claim independently."
    ),
    "personal_data_claim": (
        "The message claims your Aadhaar, phone number, or identity is linked to a crime. Such claims can be used to frighten people, even without proof.",
        "Do not send identity documents or personal details. Check the claim through official channels."
    ),
    "suspicious_verification_link": (
        "The message directs you to a website for an urgent official or legal verification. A professional-looking link does not prove it belongs to an authority.",
        "Do not enter details through this link. Find the agency's official website yourself."
    ),
    "no_https": (
        "This link does not use HTTPS, so information sent through it may not have normal connection protection.",
        "Do not enter passwords or payment details on this link."
    ),
    "url_userinfo": (
        "This link contains an @ symbol that can disguise the real website destination.",
        "Check the actual website address after the @ symbol; avoid the link if unsure."
    ),
    "invalid_url": (
        "This website address appears incomplete or incorrectly formatted.",
        "Find the official website yourself instead of relying on this link."
    ),
    "ip_address_url": (
        "This link uses a number-based address instead of a website name. That is not automatically unsafe, but the destination is harder to recognize.",
        "Only use it if you know and trust the destination."
    ),
    "private_ip_url": (
        "This link points to a private network address, often used inside a home or workplace.",
        "Open it only if you recognize the local device or service."
    ),
    "loopback_ip_url": (
        "This link points to the device opening it, not a public website.",
        "Avoid unexpected links to your own device."
    ),
    "link_local_ip_url": (
        "This address is intended for devices on the same local network.",
        "Check that you recognize the device or service."
    ),
    "special_use_ip_url": (
        "This link uses a network address reserved for a special purpose.",
        "Check why the link uses this address before opening it."
    ),
    "local_hostname_url": (
        "This link may point to a service on your local network rather than a public website.",
        "Open it only if you recognize the destination."
    ),
    "deep_subdomain": (
        "The website address has several sections. A familiar name inside a long address does not prove who owns it.",
        "Read the full website name and verify it independently."
    ),
    "punycode_domain": (
        "This website uses a special format for international domain names. It can be legitimate, but sometimes hides lookalike names.",
        "Compare it with the official website before trusting it."
    ),

    # New findings for potentially misleading domain names.
    "government_identity_domain": (
        "This website name combines government or law-enforcement terms with words that can suggest an official service. The name alone does not prove it belongs to an agency.",
        "Find the agency's real website independently. Do not share identity documents or payment details based only on this address."
    ),
    "official_verification_domain": (
        "The website name combines verification or security terms with an official-sounding service. These words can be used by anyone registering a domain.",
        "Check the destination through an independently found official website before entering any information."
    ),
    "identity_kyc_domain": (
        "The website name refers to KYC or identity checks alongside official or security-related wording. It could be designed to appear trustworthy.",
        "Do not upload Aadhaar documents, enter OTPs, or share bank details unless you independently confirm the service."
    ),
}

# Regex patterns are intentionally narrow enough to reduce false positives.
MESSAGE_RULES = (
    ("urgent_language", "medium", (
        r"\b(?:immediately|act now|urgent(?:ly)?|right now|without delay)\b",
        r"\bwithin\s+\d+\s+(?:minutes?|hours?)\b",
        r"\b(?:will be blocked|account.{0,30}suspended)\b",
    )),
    ("sensitive_information", "high", (
        r"\b(?:share|send|provide|tell|enter|submit|confirm|verify)\s+(?:(?:me|us|your)\s+){0,2}(?:otp|one[- ]time password|password|pin|verification code)\b",
        r"\b(?:otp|one[- ]time password|password|pin|verification code)\b.{0,35}\b(?:share|send|provide|reply|enter|submit)\b",
    )),
    ("unexpected_reward", "medium", (
        r"\b(?:you have won|you won|claim your prize|free cash|lottery winner)\b",
    )),
    ("authority_impersonation", "high", (
        r"\b(?:cyber\s*(?:crime|cell)|crime branch|police department|duty officer|investigation division|enforcement directorate|central bureau of investigation|\bCBI\b|\bED\b|\bMHA\b)\b",
        r"\b(?:government|police|officer|authorit(?:y|ies))\b.{0,55}\b(?:case|investigation|verify|verification|warrant|notice)\b",
    )),
    ("legal_threat", "high", (
        r"\b(?:arrest warrant|immediate arrest|arrested|legal action|criminal charges?|police custody)\b",
        r"\b(?:money laundering|illegal parcel|drug parcel|narcotics|criminal syndicate)\b",
        r"\b(?:authorities|police|officers?)\b.{0,65}\b(?:dispatch|arrive|arrest|visit)\b",
    )),
    ("forced_video_verification", "high", (
        r"\b(?:video call|video conference|verification room|digital verification room)\b.{0,90}\b(?:verify|verification|identity|statement|officer|documents?)\b",
        r"\b(?:join|enter|attend)\b.{0,65}\b(?:verification|video)\s+(?:room|call|meeting)\b",
        r"\b(?:verify|record)\b.{0,65}\b(?:identity documents?|statement)\b.{0,65}\bvideo call\b",
    )),
    ("isolation_pressure", "medium", (
        r"\bdo not (?:close|leave|end|disconnect|hang up|turn off)\b",
        r"\b(?:stay|remain)\s+(?:on|in)\s+(?:this|the)\s+(?:call|chat|line)\b",
        r"\b(?:do not|don't)\s+(?:tell|inform|contact)\s+(?:anyone|family|friends|police)\b",
    )),
    ("personal_data_claim", "medium", (
        r"\b(?:aadhaar|aadhar|mobile number|phone number|identity documents?|personal details)\b.{0,100}\b(?:linked|connected|involved|associated)\b.{0,80}\b(?:crime|case|investigation|money laundering|syndicate|illegal|parcel)\b",
        r"\b(?:linked|connected|associated)\b.{0,75}\b(?:aadhaar|aadhar|mobile number|phone number)\b.{0,80}\b(?:crime|case|investigation|illegal)\b",
    )),
)

URL_PATTERN = re.compile(r'''https?://[^\s<>"'`]+''', re.IGNORECASE)
URL_TRAILING_CHARACTERS = ".,!?;:)]}>\\"

VERIFICATION_CONTEXT = re.compile(
    r"\b(?:verification|verify|identity|digital verification room|case ref|duty officer|cyber\s*cell)\b",
    re.IGNORECASE,
)

CALL_TO_ACTION = re.compile(
    r"\b(?:tap|click|open|visit|follow|enter|join|use)\b.{0,110}\b(?:link|portal|website|room|verification)\b",
    re.IGNORECASE | re.DOTALL,
)


def _finding(
    finding_type: str,
    severity: str,
    message: Optional[str] = None,
    url: Optional[str] = None,
) -> dict:
    default_message, action = FINDING_CONTENT[finding_type]

    result = {
        "type": finding_type,
        "severity": severity,
        "message": message or default_message,
        "action": action,
    }

    if url is not None:
        result["url"] = url

    return result


def extract_urls(message: str) -> list[str]:
    """Extract unique HTTP(S) links without opening them."""
    urls = []

    for match in URL_PATTERN.findall(message):
        url = match.rstrip(URL_TRAILING_CHARACTERS)

        if url and url not in urls:
            urls.append(url)

    return urls


def classify_ip_address(hostname: str) -> Optional[dict]:
    try:
        ip = ipaddress.ip_address(hostname)
    except ValueError:
        return None

    if ip.is_loopback:
        category = "loopback"

    elif ip.is_link_local:
        category = "link_local"

    elif ip.is_multicast or ip.is_unspecified:
        category = "special_use"

    elif ip.version == 4 and ip in ipaddress.ip_network("100.64.0.0/10"):
        category = "special_use"

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
    ) or (
        ip.version == 6
        and ip in ipaddress.ip_network("fc00::/7")
    ):
        category = "private"

    elif ip.is_global:
        category = "public"

    else:
        category = "special_use"

    return {
        "ip": str(ip),
        "version": ip.version,
        "category": category,
        "is_global": ip.is_global,
    }


# These checks inspect the hostname only, never page content or live ownership.
# Match meaningful word combinations, not single common words like "secure".
# In particular, a name containing "gov" is not automatically a government site.
GOVERNMENT_TERMS = {
    "gov", "govt", "government", "ncb", "cbi", "mha",
    "cybercell", "cybercrime", "police", "enforcement",
}

OFFICIAL_SERVICE_TERMS = {
    "verification", "verify", "portal", "official",
    "secure", "security", "investigation", "case",
}

IDENTITY_TERMS = {
    "kyc", "aadhaar", "aadhar", "identity", "idverify",
}


def _domain_language_findings(hostname: str, url: str) -> list[dict]:
    """Look for potentially misleading combinations in the hostname only."""

    # Separate words on hyphens and dots, so "government" does not match
    # an unrelated longer word. Treat a few familiar compound names explicitly.
    words = set(re.split(r"[.\-_]+", hostname.lower()))

    if "cybercell" in hostname.lower():
        words.add("cybercell")

    if "cybercrime" in hostname.lower():
        words.add("cybercrime")

    # Avoid language-based impersonation warnings for known government namespaces.
    # This is only a suffix check, not proof of site ownership or safety.
    if (
        hostname == "gov.in"
        or hostname.endswith(".gov.in")
        or hostname == "nic.in"
        or hostname.endswith(".nic.in")
    ):
        return []

    has_government = bool(words & GOVERNMENT_TERMS)
    has_service = bool(words & OFFICIAL_SERVICE_TERMS)
    has_identity = bool(words & IDENTITY_TERMS)

    results = []

    if has_government and (has_service or has_identity):
        results.append(
            _finding("government_identity_domain", "high", url=url)
        )

    if (
        has_service
        and len(words & OFFICIAL_SERVICE_TERMS) >= 2
        and (has_government or has_identity)
    ):
        results.append(
            _finding("official_verification_domain", "medium", url=url)
        )

    if has_identity and (has_government or has_service):
        results.append(
            _finding("identity_kyc_domain", "medium", url=url)
        )

    return results


def analyze_url(url: str) -> list[dict]:
    """Analyze URL text only. No network activity."""
    findings = []

    try:
        parsed = urlsplit(url)
        hostname = parsed.hostname
        _ = parsed.port  # Reject invalid ports.

        if parsed.scheme.lower() not in ("http", "https") or not hostname:
            raise ValueError("Invalid URL")

    except ValueError:
        return [_finding("invalid_url", "low", url=url)]

    hostname = hostname.rstrip(".").lower()

    if not hostname or any(char.isspace() for char in hostname):
        return [_finding("invalid_url", "low", url=url)]

    if parsed.scheme.lower() != "https":
        findings.append(
            _finding("no_https", "medium", url=url)
        )

    if parsed.username is not None or parsed.password is not None:
        findings.append(
            _finding("url_userinfo", "medium", url=url)
        )

    ip_info = classify_ip_address(hostname)

    if ip_info is not None:
        findings.append(
            _finding("ip_address_url", "low", url=url)
        )

        category_type = {
            "private": "private_ip_url",
            "loopback": "loopback_ip_url",
            "link_local": "link_local_ip_url",
            "special_use": "special_use_ip_url",
        }.get(ip_info["category"])

        if category_type:
            findings.append(
                _finding(category_type, "info", url=url)
            )

    else:
        if hostname == "localhost" or hostname.endswith(
            (".localhost", ".local")
        ):
            findings.append(
                _finding("local_hostname_url", "info", url=url)
            )

        labels = hostname.split(".")

        if len(labels) > 4:
            findings.append(
                _finding("deep_subdomain", "low", url=url)
            )

        if any(label.startswith("xn--") for label in labels):
            findings.append(
                _finding("punycode_domain", "medium", url=url)
            )

        # Examine combinations that could suggest a false official identity.
        findings.extend(
            _domain_language_findings(hostname, url)
        )

    return findings


def calculate_risk_score(findings: list[dict]) -> int:
    """Count each warning type once and cap at 100; not a probability."""
    return min(
        100,
        sum(
            RISK_WEIGHTS.get(kind, 0)
            for kind in {item.get("type") for item in findings}
        ),
    )


def analyze_message(message: str) -> dict:
    """Return the existing FastAPI/frontend-compatible result structure."""
    normalized_message = message.strip()

    if not normalized_message:
        return {
            "verdict": "invalid_input",
            "risk_score": 0,
            "findings": [],
            "urls": [],
            "disclaimer": DISCLAIMER,
        }

    # Keep matching separate from extracted URLs so a domain name alone cannot
    # trigger a law-enforcement impersonation finding.
    urls = extract_urls(normalized_message)

    text_only = normalized_message

    for url in urls:
        text_only = text_only.replace(url, " ")

    findings = []

    for finding_type, severity, patterns in MESSAGE_RULES:
        if any(
            re.search(pattern, text_only, re.IGNORECASE | re.DOTALL)
            for pattern in patterns
        ):
            findings.append(
                _finding(finding_type, severity)
            )

    # A verification link is a contextual concern when the message directs
    # the recipient to use it. This is not a reputation verdict on the domain.
    if (
        urls
        and VERIFICATION_CONTEXT.search(text_only)
        and CALL_TO_ACTION.search(text_only)
        and any(
            f["type"] in (
                "authority_impersonation",
                "legal_threat",
                "forced_video_verification",
            )
            for f in findings
        )
    ):
        findings.append(
            _finding(
                "suspicious_verification_link",
                "medium",
                url=urls[0],
            )
        )

    for url in urls:
        findings.extend(analyze_url(url))

    risk_score = calculate_risk_score(findings)

    verdict = (
        "potentially_suspicious"
        if risk_score >= 60
        else "needs_review"
        if risk_score > 0
        else "no_obvious_indicators"
    )

    return {
        "verdict": verdict,
        "risk_score": risk_score,
        "findings": findings,
        "urls": urls,
        "disclaimer": DISCLAIMER,
    }
