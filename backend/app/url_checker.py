
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

    # strip() removes whitespace at the beginning and end.
    value = raw_url.strip()

    # An empty string cannot be analyzed.
    if not value:
        raise ValueError("Enter a URL to check.")

    # Reject spaces, tabs, or newline characters inside a URL.
    if any(character.isspace() for character in value):
        raise ValueError("The URL must not contain spaces.")

    # If the user omits the scheme, assume HTTPS for parsing.
    if "://" not in value:

        # Inspect the hostname/port portion before the first slash.
        first_part = value.split("/")[0]

        # A colon might represent a port or an unsupported scheme.
        if ":" in first_part and not value.startswith("["):

            # Example: example.com:8000 -> "8000"
            last_part = first_part.rsplit(":", 1)[-1]

            # Reject unsupported scheme-like input.
            if not last_part.isdigit():
                raise ValueError(
                    "Only HTTP and HTTPS URLs are supported."
                )

        value = "https://" + value

    try:
        # Parse the URL into its components.
        parsed = urlsplit(value)

        # Example: https://example.com/login
        # hostname = "example.com"
        hostname = parsed.hostname

        # Accessing .port validates the port number.
        _ = parsed.port

    except ValueError:
        raise ValueError("Enter a valid URL.")

    # Only HTTP and HTTPS URLs are supported.
    if parsed.scheme.lower() not in {"http", "https"}:
        raise ValueError(
            "Only HTTP and HTTPS URLs are supported."
        )

    # A hostname is required for meaningful analysis.
    if not hostname:
        raise ValueError(
            "The URL must include a hostname."
        )

    # Reject malformed authority syntax.
    if "@" in parsed.netloc and parsed.username is None:
        raise ValueError("Enter a valid URL.")

    return value


def enrich_finding(finding: dict, ip_info: dict = None) -> dict:
    """Add educational explanations to a detector finding.

    The detector already provides:
        type
        severity
        message
        action
        url

    This function adds:
        reason
        potential_harm

    It preserves existing fields, so the frontend remains compatible.
    """

    # dict() creates a copy so the original finding is not modified.
    enriched = dict(finding)

    # get() returns None if the key does not exist.
    finding_type = enriched.get("type")

    # Look up explanations for this finding type.
    explanation = FINDING_EXPLANATIONS.get(finding_type, {})

    # If this is an IP-address warning, prefer its specific category.
    if finding_type == "ip_address_url" and ip_info:
        category = ip_info.get("category")

        explanation = IP_CATEGORY_EXPLANATIONS.get(
            category,
            explanation,
        )

    # setdefault() adds a value only when the key is missing.
    # This also preserves any explanations added later in detector.py.
    enriched.setdefault(
        "reason",
        explanation.get(
            "reason",
            enriched.get(
                "message",
                "A URL warning sign was detected."
            ),
        ),
    )

    enriched.setdefault(
        "potential_harm",
        explanation.get(
            "potential_harm",
            (
                "The destination may require additional verification. "
                "This warning alone does not prove malicious activity."
            ),
        ),
    )

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

    # Step 1: Validate and normalize the URL.
    normalized_url = normalize_url(raw_url)

    # Step 2: Extract the parsed URL components.
    parsed = urlsplit(normalized_url)

    # Step 3: Classify literal IP addresses.
    #
    # For example:
    # 192.168.1.1 -> private
    # 8.8.8.8 -> public
    # 127.0.0.1 -> loopback
    #
    # Returns None for normal domain names.
    ip_info = classify_ip_address(parsed.hostname)

    # Step 4: Run the existing detection rules.
    #
    # analyze_url() returns a list of finding dictionaries.
    raw_findings: List[dict] = analyze_url(normalized_url)

    # Step 5: Add beginner-friendly explanations.
    #
    # A list comprehension creates a new list by applying
    # enrich_finding() to every finding.
    findings: List[dict] = [
        enrich_finding(finding, ip_info)
        for finding in raw_findings
    ]

    # Step 6: Calculate the heuristic risk score.
    #
    # Adding explanations does not change the score.
    risk_score = calculate_risk_score(findings)

    # Choose a verdict based on the existing thresholds.
    if risk_score >= 60:
        verdict = "potentially_suspicious"

    elif risk_score > 0:
        verdict = "needs_review"

    else:
        verdict = "no_obvious_indicators"

    # Determine whether HTTPS was explicitly entered.
    #
    # If the user entered "example.com", HTTPS was assumed.
    # We should not imply that HTTPS availability was verified.
    original_input = raw_url.strip()

    scheme_was_assumed = "://" not in original_input

    # Step 7: Return the final JSON-compatible dictionary.
    #
    # FastAPI automatically serializes this into JSON.
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
