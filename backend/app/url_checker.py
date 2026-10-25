

"""CyberMentis standalone URL safety checker.

What this file does:

1. Accepts a URL entered by the user.

2. Validates and normalizes the URL.

3. Uses detector.py to identify structural warning signs.

4. Adds beginner-friendly explanations about each warning.

5. Calculates a heuristic risk score.

6. Returns a structured JSON-compatible dictionary to the frontend.

IMPORTANT:

- This tool does not visit the website.

- It does not make DNS requests.

- It does not check live malware or phishing databases.

- A warning does not prove that a URL is malicious.

"""

# Dict and List are type hints.

# They describe the expected structure of Python values.

from typing import Dict, List
import re
from difflib import SequenceMatcher

# urlsplit separates a URL into scheme, hostname, path, etc.

from urllib.parse import urlsplit

# Import the shared detection functions from detector.py.

from app.detector import (

    analyze_url,

    calculate_risk_score,

    classify_ip_address,

)

# This disclaimer is included in every URL analysis response.

URL_CHECK_DISCLAIMER = (

    "This report checks URL structure for known warning signs. "

    "It does not visit the website or consult live threat-intelligence "

    "databases. IP classifications are based on literal IP addresses, "

    "not DNS resolution. No detected warnings does not guarantee safety."

)

# A dictionary stores information using key-value pairs.

#

# Each finding type has:

# - reason: Why CyberMentis detected the warning.

# - potential_harm: What could happen in certain circumstances.

#

# These explanations describe possible risks, not confirmed attacks.

FINDING_EXPLANATIONS = {
    # These explanations are shown dynamically for new domain-language findings.
    "government_identity_domain": {
        "reason": "This address combines government or agency-related words with verification or identity-related terms. That can make an unrelated site appear official.",
        "potential_harm": "Someone could mistake the address for a government service and share private documents or information. Its actual owner has not been checked.",
    },
    "official_verification_domain": {
        "reason": "The domain uses several official-sounding verification and security words together. These words are not evidence of official ownership.",
        "potential_harm": "A convincing-looking portal might ask visitors to enter sensitive information. Verify the site through an independent official source.",
    },
    "identity_kyc_domain": {
        "reason": "The address combines KYC or identity-related language with government or verification wording.",
        "potential_harm": "An impersonating site could ask for Aadhaar details, OTPs, or other sensitive data. The domain wording alone does not prove fraud.",
    },


    "url_userinfo": {

        "reason": (

            "The URL contains an '@' symbol in its authority section. "

            "Text before '@' is user information, not the actual hostname. "

            "This can make a link appear to belong to a trusted website."

        ),

        "potential_harm": (

            "If the destination is a phishing website, it could attempt "

            "to collect passwords, OTPs, payment information, or other "

            "personal details."

        ),

    },

    "no_https": {

        "reason": (

            "The URL uses HTTP instead of HTTPS. HTTP does not provide "

            "the encrypted connection that HTTPS normally provides."

        ),

        "potential_harm": (

            "Information transmitted over an unencrypted HTTP connection "

            "may be intercepted or modified by someone with access to "

            "the network path. This is especially concerning when "

            "entering passwords or payment information."

        ),

    },

    "ip_address_url": {

        "reason": (

            "The URL uses a numerical IP address instead of a regular "

            "domain name. This can be legitimate, especially for "

            "network equipment or development services."

        ),

        "potential_harm": (

            "An unfamiliar IP-based link may lead to an unexpected "

            "service or website. If that service is malicious, it "

            "could attempt phishing or other harmful activity."

        ),

    },

    "private_ip_url": {

        "reason": (

            "The URL points to a private IP address normally used "

            "inside a local network, such as a home or office network."

        ),

        "potential_harm": (

            "If opened while connected to the relevant network, "

            "the link may reach an internal device or service. "

            "An unexpected destination could expose a login page "

            "or interact with a local service."

        ),

    },

    "loopback_ip_url": {

        "reason": (

            "The URL points to a loopback address, which refers "

            "to the device opening the link rather than a remote website."

        ),

        "potential_harm": (

            "If a local service is running, the link may interact "

            "with that service. An unexpected link could target "

            "a development server or another locally running application."

        ),

    },

    "link_local_ip_url": {

        "reason": (

            "The URL uses a link-local IP address, which is intended "

            "for communication on a local network segment."

        ),

        "potential_harm": (

            "The link could reach a nearby device or service when "

            "the network configuration allows it. Verify that "

            "the destination is expected."

        ),

    },

    "deep_subdomain": {

        "reason": (

            "The hostname contains several levels of subdomains. "

            "Long hostnames can make the actual registered domain "

            "harder to recognize."

        ),

        "potential_harm": (

            "An attacker could use a misleading hostname to imitate "

            "a trusted service and encourage users to enter "

            "sensitive information on an unrelated website."

        ),

    },

    "punycode_domain": {

        "reason": (

            "The hostname contains a punycode label beginning with "

            "'xn--'. Punycode is a legitimate way to represent "

            "internationalized domain names."

        ),

        "potential_harm": (

            "Some phishing websites use visually similar characters "

            "to imitate trusted domains. Punycode alone does not "

            "mean a website is malicious."

        ),

    },

    "invalid_url": {

        "reason": (

            "The URL could not be reliably interpreted because "

            "its structure appears invalid or incomplete."

        ),

        "potential_harm": (

            "An incorrectly formatted or misleading link may not "

            "lead to the destination the user expects."

        ),

    },

}

# Additional explanations based on the category of an IP address.

#

# These categories come from classify_ip_address() in detector.py.

IP_CATEGORY_EXPLANATIONS = {

    "private": {

        "reason": (

            "This address belongs to a private IP range commonly "

            "used inside home, office, or other internal networks."

        ),

        "potential_harm": (

            "The link could reach an internal device or application "

            "when the user is connected to the relevant network. "

            "Private IP addresses are not inherently malicious."

        ),

    },

    "public": {

        "reason": (

            "This is a globally routable IP address. It may identify "

            "a publicly accessible server or network endpoint."

        ),

        "potential_harm": (

            "The destination could host a legitimate or malicious "

            "service. The IP address alone cannot establish whether "

            "the destination is trustworthy."

        ),

    },

    "loopback": {

        "reason": (

            "This address refers to the device opening the link. "

            "It is commonly used for local development and testing."

        ),

        "potential_harm": (

            "The link could interact with a locally running service. "

            "Unexpected local-service links should be treated carefully."

        ),

    },

    "link_local": {

        "reason": (

            "This address is intended for communication on a "

            "local network segment."

        ),

        "potential_harm": (

            "It may reach a nearby network device or service. "

            "Verify the destination before interacting with it."

        ),

    },

    "multicast": {

        "reason": (

            "This address belongs to a multicast range, which "

            "is used for communication with groups of devices."

        ),

        "potential_harm": (

            "It is not a normal public website destination. "

            "The URL may be unusable or unexpected."

        ),

    },

    "unspecified": {

        "reason": (

            "This is an unspecified IP address, generally used "

            "to represent an unknown or unassigned local address."

        ),

        "potential_harm": (

            "It is not a normal website destination and may "

            "behave differently across systems."

        ),

    },

    "shared_address": {

        "reason": (

            "This address belongs to a shared address range "

            "commonly associated with carrier-grade NAT."

        ),

        "potential_harm": (

            "It is not normally a publicly reachable website "

            "destination. Its reachability depends on the network."

        ),

    },

    "special_use": {

        "reason": (

            "This address belongs to a special-use IP range "

            "rather than a normal globally routable address."

        ),

        "potential_harm": (

            "Its behavior and reachability depend on the "

            "specific address range and network configuration."

        ),

    },

}


# Original inline learning comments, retained verbatim from the uploaded source:
# strip() removes whitespace at the beginning and end.
# An empty string cannot be analyzed.
# Reject spaces, tabs, or newline characters inside a URL.
# If the user omits the scheme, assume HTTPS for parsing.
# Inspect the hostname/port portion before the first slash.
# A colon might represent a port or an unsupported scheme.
# Example: example.com:8000 -> "8000"
# Reject unsupported scheme-like input.
# Parse the URL into its components.
# Example: https://example.com/login
# hostname = "example.com"
# Accessing .port validates the port number.
# Only HTTP and HTTPS URLs are supported.
# A hostname is required for meaningful analysis.
# Reject malformed authority syntax.
# dict() creates a copy so the original finding is not modified.
# get() returns None if the key does not exist.
# Look up explanations for this finding type.
# If this is an IP-address warning, prefer its specific category.
# setdefault() adds a value only when the key is missing.
# This also preserves any explanations added later in detector.py.
# Step 1: Validate and normalize the URL.
# Step 2: Extract the parsed URL components.
# Step 3: Classify literal IP addresses.
#
# For example:
# 192.168.1.1 -> private
# 8.8.8.8 -> public
# 127.0.0.1 -> loopback
#
# Returns None for normal domain names.
# Step 4: Run the existing detection rules.
#
# analyze_url() returns a list of finding dictionaries.
# Step 5: Add beginner-friendly explanations.
#
# A list comprehension creates a new list by applying
# enrich_finding() to every finding.
# Step 6: Calculate the heuristic risk score.
#
# Adding explanations does not change the score.
# Choose a verdict based on the existing thresholds.
# Determine whether HTTPS was explicitly entered.
#
# If the user entered "example.com", HTTPS was assumed.
# We should not imply that HTTPS availability was verified.
# Step 7: Return the final JSON-compatible dictionary.
#
# FastAPI automatically serializes this into JSON.

# Curated reference domains for common services used in India.
# These are comparison hints, NOT a complete registry or a live verification.
# Add or review entries as official domains change. A recognized domain can
# still contain compromised pages, misleading user content, or unsafe links.
OFFICIAL_BRANDS = {
    "Amazon": ("amazon.in", "amazon.com", "amazonpay.in"),
    "Flipkart": ("flipkart.com",),
    "WhatsApp": ("whatsapp.com", "whatsapp.net"),
    "Instagram": ("instagram.com",),
    "Facebook": ("facebook.com", "fb.com", "messenger.com"),
    "YouTube": ("youtube.com", "youtu.be"),
    "Google": ("google.com", "google.co.in"),
    "Gmail": ("gmail.com",),
    "X / Twitter": ("x.com", "twitter.com", "t.co"),
    "LinkedIn": ("linkedin.com",),
    "Snapchat": ("snapchat.com",),
    "Telegram": ("telegram.org", "t.me"),
    "Reddit": ("reddit.com",),
    "Pinterest": ("pinterest.com",),
    "Discord": ("discord.com", "discord.gg"),
    "Microsoft": ("microsoft.com", "live.com", "outlook.com"),
    "Apple": ("apple.com", "icloud.com"),
    "Netflix": ("netflix.com",),
    "Paytm": ("paytm.com",),
    "PhonePe": ("phonepe.com",),
    "Google Pay": ("pay.google.com",),
    "IRCTC": ("irctc.co.in",),
    "SBI": ("sbi.co.in", "onlinesbi.sbi"),
    "HDFC": ("hdfcbank.com",),
    "ICICI": ("icicibank.com",),
    "Axis Bank": ("axisbank.com",),
}

# Exact government reference domains and recognized Indian government
# namespaces. A domain ending in .gov.in is not equivalent to one merely
# containing "gov" (for example, gov-verify.com is not under .gov.in).
INDIA_GOVERNMENT_DOMAINS = {
    "cybercrime.gov.in", "mha.gov.in", "ncrb.gov.in", "cbi.gov.in",
    "ncb.gov.in", "india.gov.in", "mygov.in", "digilocker.gov.in",
    "uidai.gov.in", "incometax.gov.in", "gst.gov.in", "epfindia.gov.in",
    "passportindia.gov.in", "parivahan.gov.in", "nic.in",
}
INDIA_GOVERNMENT_SUFFIXES = ("gov.in", "nic.in", "ac.in")

# Tokens are compared against the hostname, never the path or query string.
# Avoid matching short ambiguous aliases such as X, ED, or SBI by fuzzy rules.
BRAND_ALIASES = {
    "Amazon": ("amazon",), "Flipkart": ("flipkart",),
    "WhatsApp": ("whatsapp",), "Instagram": ("instagram",),
    "Facebook": ("facebook",), "YouTube": ("youtube",),
    "Google": ("google",), "Gmail": ("gmail",),
    "X / Twitter": ("twitter",), "LinkedIn": ("linkedin",),
    "Snapchat": ("snapchat",), "Telegram": ("telegram",),
    "Reddit": ("reddit",), "Pinterest": ("pinterest",),
    "Discord": ("discord",), "Microsoft": ("microsoft",),
    "Apple": ("apple",), "Netflix": ("netflix",),
    "Paytm": ("paytm",), "PhonePe": ("phonepe",),
    "IRCTC": ("irctc",), "HDFC": ("hdfc", "hdfcbank"),
    "ICICI": ("icici", "icicibank"),
    "Axis Bank": ("axisbank",),
}
GOVERNMENT_ALIASES = (
    "cybercrime", "cybercell", "cyber-cell", "gov", "govt", "government",
    "ncb", "cbi", "ncrb", "mha", "uidai", "aadhaar", "digilocker",
    "incometax", "passportindia", "parivahan", "mygov",
)
VERIFICATION_TERMS = {
    "verify", "verification", "secure", "security", "login", "signin",
    "portal", "update", "reward", "rewards", "offer", "offers", "kyc",
    "account", "support", "claim", "download", "festive", "lucky", "draw",
    "order", "bill", "billion", "days", "web",
}

# These weights are local to the standalone URL checker. The shared message
# detector and its existing scoring weights remain unchanged.
URL_ONLY_WEIGHTS = {
    "brand_impersonation_domain": 60,
    "brand_typosquatting_domain": 60,
    "government_lookalike_domain": 60,
}


def _within_domain(hostname: str, domain: str) -> bool:
    """Match the exact domain or a dot-separated subdomain, never a suffix trick."""
    return hostname == domain or hostname.endswith("." + domain)


def _reference_domain(hostname: str) -> bool:
    """Recognize reference domains without claiming that a URL is safe."""
    return any(
        _within_domain(hostname, domain)
        for domains in OFFICIAL_BRANDS.values()
        for domain in domains
    ) or any(
        _within_domain(hostname, domain)
        for domain in INDIA_GOVERNMENT_DOMAINS
    ) or any(
        _within_domain(hostname, suffix)
        for suffix in INDIA_GOVERNMENT_SUFFIXES
    )


def _hostname_tokens(hostname: str) -> set:
    """Break domain labels into words for conservative matching."""
    return set(filter(None, re.split(r"[.\-_]+", hostname.lower())))


def _url_finding(kind: str, url: str, brand: str = "") -> dict:
    """Create findings compatible with the existing frontend report."""
    if kind == "brand_typosquatting_domain":
        message = (
            "This address closely resembles the name of {} but differs in spelling. "
            "It may be a lookalike domain.".format(brand)
        )
    elif kind == "brand_impersonation_domain":
        message = (
            "This address mentions {} but is not within the reference domains "
            "listed for that service.".format(brand)
        )
    else:
        message = (
            "This address combines an Indian government or agency-related name "
            "with wording that could suggest an official service."
        )
    return {
        "type": kind,
        "severity": "high",
        "message": message,
        "action": (
            "Do not enter passwords, OTPs, identity documents, or payment details. "
            "Open the organization's official website independently."
        ),
        "url": url,
        "reason": (
            "The hostname resembles a familiar service or authority, but the "
            "domain spelling or location does not match our curated references. "
            "This is a text-only warning, not proof of impersonation."
        ),
        "potential_harm": (
            "A deceptive lookalike website could collect credentials, OTPs, "
            "identity documents, or payment information."
        ),
    }


def analyze_domain_identity(url: str, hostname: str) -> List[dict]:
    """Detect brand and Indian government lookalikes without network requests."""
    host = hostname.lower().rstrip(".")
    if _reference_domain(host):
        return []

    # Check domain labels and a joined version for hyphenated brand names.
    labels = host.split(".")
    tokens = _hostname_tokens(host)
    joined = "".join(re.split(r"[-_]", labels[0]))
    # Join split brand names such as flip-kart, including before a suffix.
    joined_prefixes = {"".join(parts[:n]) for parts in [re.split(r"[-_]", labels[0])] for n in range(2, len(parts) + 1)}
    words = set(tokens)
    words.add(joined)
    words.update(joined_prefixes)
    findings = []

    for brand, aliases in BRAND_ALIASES.items():
        # A brand appearing in the actual hostname, not just a path, can be
        # misleading when it is outside the service's known domains.
        exact = any(
            alias in words or any(label.startswith(alias + "-") or
                                  label.endswith("-" + alias) or
                                  ("-" + alias + "-") in label
                                  for label in labels)
            for alias in aliases
        )
        if exact:
            findings.append(_url_finding("brand_impersonation_domain", url, brand))
            break

        # Limit typo matching to longer names and the first domain label.
        # This reduces accidental matches in unrelated subdomains or words.
        for alias in aliases:
            if len(alias) < 6:
                continue
            candidates = set(re.split(r"[-_]", labels[0]))
            candidates.add(joined)
            candidates.update(joined_prefixes)
            # Common visual confusion: adjacent "rn" can resemble "m".
            candidates.update(candidate.replace("rn", "m") for candidate in list(candidates))
            if any(
                len(candidate) >= 5
                and abs(len(candidate) - len(alias)) <= 2
                and SequenceMatcher(None, candidate, alias).ratio() >= 0.78
                and (candidate != alias or "rn" in labels[0])
                for candidate in candidates
            ):
                findings.append(_url_finding("brand_typosquatting_domain", url, brand))
                break
        if findings:
            break

    # Flag official-looking government names only when combined with
    # verification/security context; do not flag every occurrence of "gov".
    government_match = any(
        alias in tokens or alias in labels[0].split("-")
        for alias in GOVERNMENT_ALIASES
    ) or any(
        alias in host for alias in ("cybercell", "cybercrime", "digilocker", "passportindia")
    )
    has_context = bool(tokens & VERIFICATION_TERMS)
    if government_match and has_context:
        findings.append(_url_finding("government_lookalike_domain", url))

    return findings


def normalize_url(raw_url: str) -> str:
    """Clean and validate a URL without contacting the destination.

    Examples:
        example.com -> https://example.com
        http://example.com -> http://example.com

    A missing scheme is assumed to be HTTPS for parsing only.
    This does not confirm that the website supports HTTPS.

    Raises:
        ValueError: When the input cannot be interpreted as an HTTP(S) URL.
    """
    value = raw_url.strip()
    if not value:
        raise ValueError("Enter a URL to check.")
    if any(character.isspace() for character in value):
        raise ValueError("The URL must not contain spaces.")
    if "://" not in value:
        first_part = value.split("/")[0]
        if ":" in first_part and not value.startswith("["):
            last_part = first_part.rsplit(":", 1)[-1]
            if not last_part.isdigit():
                raise ValueError("Only HTTP and HTTPS URLs are supported.")
        value = "https://" + value
    try:
        parsed = urlsplit(value)
        hostname = parsed.hostname
        _ = parsed.port
    except ValueError:
        raise ValueError("Enter a valid URL.")
    if parsed.scheme.lower() not in {"http", "https"}:
        raise ValueError("Only HTTP and HTTPS URLs are supported.")
    if not hostname:
        raise ValueError("The URL must include a hostname.")
    if "@" in parsed.netloc and parsed.username is None:
        raise ValueError("Enter a valid URL.")
    return value


def enrich_finding(finding: dict, ip_info: dict = None) -> dict:
    """Add educational explanations to a detector finding.

    The detector already provides: type, severity, message, action, url.
    This function adds: reason, potential_harm.
    It preserves existing fields, so the frontend remains compatible.
    """
    enriched = dict(finding)
    finding_type = enriched.get("type")
    explanation = FINDING_EXPLANATIONS.get(finding_type, {})
    if finding_type == "ip_address_url" and ip_info:
        category = ip_info.get("category")
        explanation = IP_CATEGORY_EXPLANATIONS.get(category, explanation)
    enriched.setdefault("reason", explanation.get("reason", enriched.get("message", "A URL warning sign was detected.")))
    enriched.setdefault("potential_harm", explanation.get("potential_harm", "The destination may require additional verification. This warning alone does not prove malicious activity."))
    return enriched


def check_url(raw_url: str) -> Dict:
    """Analyze a URL and return a user-friendly security report.

    Steps:
        1. Normalize the submitted URL.
        2. Extract its hostname.
        3. Classify a literal IP address, if present.
        4. Run the shared URL detection rules.
        5. Add reasons and possible consequences.
        6. Calculate the heuristic risk score.
        7. Return the result to the frontend.
    """
    normalized_url = normalize_url(raw_url)
    parsed = urlsplit(normalized_url)
    ip_info = classify_ip_address(parsed.hostname)
    raw_findings: List[dict] = analyze_url(normalized_url)
    findings: List[dict] = [enrich_finding(finding, ip_info) for finding in raw_findings]

    # Add standalone brand and government lookalike detection without changing
    # the shared detector used by the Message Checker.
    identity_findings = analyze_domain_identity(normalized_url, parsed.hostname)
    findings.extend(identity_findings)

    # Avoid stacking duplicate government-language penalties from the shared
    # detector when the more specific standalone warning is already present.
    if any(f["type"] == "government_lookalike_domain" for f in identity_findings):
        findings = [
            f for f in findings
            if f["type"] not in {
                "government_identity_domain", "official_verification_domain",
                "identity_kyc_domain",
            }
        ]

    risk_score = min(100, calculate_risk_score(findings) + sum(
        URL_ONLY_WEIGHTS.get(kind, 0)
        for kind in {f["type"] for f in identity_findings}
    ))
    if risk_score >= 60:
        verdict = "potentially_suspicious"
    elif risk_score > 0:
        verdict = "needs_review"
    else:
        verdict = "no_obvious_indicators"
    original_input = raw_url.strip()
    scheme_was_assumed = "://" not in original_input
    return {
        "url": normalized_url,
        "hostname": parsed.hostname,
        "scheme": parsed.scheme.lower(),
        "uses_https": parsed.scheme.lower() == "https",
        "scheme_was_assumed": scheme_was_assumed,
        "verdict": verdict,
        "risk_score": risk_score,
        "findings": findings,
        "ip_info": ip_info,
        "disclaimer": URL_CHECK_DISCLAIMER,
    }
