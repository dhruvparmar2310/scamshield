
# Import the function we want to test.
from app.detector import analyze_message, extract_urls, analyze_url, calculate_risk_score


def test_detects_urgent_language():
    # Arrange: prepare a suspicious example.
    message = "Act now! Your account will be blocked immediately."

    # Act: run our detector.
    result = analyze_message(message)

    # Assert: verify the expected result.
    assert result["verdict"] == "needs_review"
    assert any(
        finding["type"] == "urgent_language"
        for finding in result["findings"]
    )


def test_detects_sensitive_information():
    message = "Send your OTP and password to restore access."

    result = analyze_message(message)

    assert any(
        finding["type"] == "sensitive_information"
        for finding in result["findings"]
    )


def test_detects_unexpected_reward():
    message = "You have won a prize. Claim your prize today."

    result = analyze_message(message)

    assert any(
        finding["type"] == "unexpected_reward"
        for finding in result["findings"]
    )


def test_detects_http_url():
    message = "Check this link: http://example.com"

    result = analyze_message(message)

    assert len(result["urls"]) == 1
    assert any(
        finding["type"] == "no_https"
        for finding in result["findings"]
    )


def test_normal_message_has_no_findings():
    message = (
        "Our team meeting is tomorrow at 10 AM. "
        "Please bring your project updates."
    )

    result = analyze_message(message)

    assert result["verdict"] == "no_obvious_indicators"
    assert result["findings"] == []


def test_extracts_multiple_unique_urls():
    message = (
        "Visit https://example.com and "
        "https://example.com or http://test.com"
    )

    urls = extract_urls(message)

    assert len(urls) == 2
    assert "https://example.com" in urls
    assert "http://test.com" in urls


def test_url_with_user_information_is_flagged():
    result = analyze_url("https://example.com@attacker.test/login")

    assert any(
        finding["type"] == "url_userinfo"
        for finding in result
    )


def test_password_maintenance_message_is_not_flagged():
    # Mentioning a password alone should not trigger a finding.
    message = (
        "Remember to update your password "
        "in your account settings."
    )

    result = analyze_message(message)

    assert not any(
        finding["type"] == "sensitive_information"
        for finding in result["findings"]
    )

def test_risk_score_for_sensitive_information():
    findings = [
        {"type": "sensitive_information", "severity": "medium"}
    ]

    assert calculate_risk_score(findings) == 35


def test_risk_score_does_not_double_count_same_type():
    findings = [
        {"type": "urgent_language", "severity": "medium"},
        {"type": "urgent_language", "severity": "medium"},
    ]

    assert calculate_risk_score(findings) == 15


def test_https_url_has_no_url_security_finding():
    """An HTTPS URL should not trigger a no_https finding."""
    result = analyze_message(
        "Please visit https://example.com for details."
    )

    assert "https://example.com" in result["urls"]

    assert not any(
        finding["type"] in {
            "no_https",
            "url_userinfo",
            "invalid_url",
            "ip_address_url",
            "deep_subdomain",
            "punycode_domain",
        }
        for finding in result["findings"]
    )


def test_multiple_http_urls_count_once_toward_risk_score():
    """Repeated findings of the same type should not inflate the score."""
    result = analyze_message(
        "Visit http://first.test and http://second.test"
    )

    assert len(result["urls"]) == 2
    assert sum(
        finding["type"] == "no_https"
        for finding in result["findings"]
    ) == 2
    assert result["risk_score"] == 10


def test_risk_score_is_capped_at_100():
    """The calculated risk score must never exceed 100."""
    findings = [
        {"type": "urgent_language"},
        {"type": "unexpected_reward"},
        {"type": "no_https"},
        {"type": "url_userinfo"},
        {"type": "sensitive_information"},
        {"type": "invalid_url"},
    ]

    assert calculate_risk_score(findings) == 100


def test_clean_message_has_zero_risk_score():
    result = analyze_message(
        "Our meeting is tomorrow at 10 AM."
    )

    assert result["risk_score"] == 0
    assert result["verdict"] == "no_obvious_indicators"


def test_risk_score_is_included_in_analysis_response():
    result = analyze_message("Visit http://example.com")

    assert "risk_score" in result
    assert result["risk_score"] == 10
    assert result["verdict"] == "needs_review"


def test_detects_ip_address_url():
    result = analyze_message(
        "Please visit http://192.0.2.1/login"
    )

    assert any(
        finding["type"] == "ip_address_url"
        for finding in result["findings"]
    )

    assert result["risk_score"] == 20


def test_https_ip_address_gets_only_ip_warning():
    result = analyze_message(
        "Please visit https://192.0.2.1/login"
    )

    assert any(
        finding["type"] == "ip_address_url"
        for finding in result["findings"]
    )

    assert not any(
        finding["type"] == "no_https"
        for finding in result["findings"]
    )

    assert result["risk_score"] == 10


def test_regular_domain_is_not_flagged_as_ip_address():
    result = analyze_message(
        "Please visit https://example.com/login"
    )

    assert not any(
        finding["type"] == "ip_address_url"
        for finding in result["findings"]
    )

    assert result["risk_score"] == 0


def test_detects_deep_subdomain():
    result = analyze_message(
        "Visit https://login.verify.account.example.com"
    )

    assert any(
        finding["type"] == "deep_subdomain"
        for finding in result["findings"]
    )

    assert result["risk_score"] == 5


def test_normal_domain_is_not_flagged_as_deep_subdomain():
    result = analyze_message(
        "Visit https://example.com"
    )

    assert not any(
        finding["type"] == "deep_subdomain"
        for finding in result["findings"]
    )

    assert result["risk_score"] == 0


def test_legitimate_nested_domain_below_threshold_is_not_flagged():
    result = analyze_message(
        "Visit https://api.eu.example.com"
    )

    assert not any(
        finding["type"] == "deep_subdomain"
        for finding in result["findings"]
    )

    assert result["risk_score"] == 0


def test_ip_address_is_not_flagged_as_deep_subdomain():
    result = analyze_message(
        "Visit https://192.0.2.1/login"
    )

    assert any(
        finding["type"] == "ip_address_url"
        for finding in result["findings"]
    )

    assert not any(
        finding["type"] == "deep_subdomain"
        for finding in result["findings"]
    )

    assert result["risk_score"] == 10


def test_detects_punycode_domain():
    result = analyze_message("Check https://xn--pple-43d.com/login")

    assert any(
        finding["type"] == "punycode_domain"
        for finding in result["findings"]
    )
    assert result["risk_score"] == 15


def test_regular_domain_is_not_flagged_as_punycode():
    result = analyze_message("Visit https://example.com")

    assert not any(
        finding["type"] == "punycode_domain"
        for finding in result["findings"]
    )
    assert result["risk_score"] == 0


def test_detects_trusted_looking_text_before_at_symbol():
    result = analyze_message(
        "Sign in here: https://paypal.com@evil.example/login"
    )

    assert any(
        finding["type"] == "url_userinfo"
        for finding in result["findings"]
    )
    assert "https://paypal.com@evil.example/login" in result["urls"]


def test_punycode_domain_can_be_combined_with_http_warning():
    result = analyze_message("Visit http://xn--pple-43d.com/login")

    finding_types = {
        finding["type"] for finding in result["findings"]
    }

    assert "punycode_domain" in finding_types
    assert "no_https" in finding_types
    assert result["risk_score"] == 25


def test_every_finding_includes_recommended_action():
    result = analyze_message(
        "Act now! You have won free cash. "
        "Send your OTP immediately: http://192.0.2.1/login"
    )

    assert result["findings"]

    for finding in result["findings"]:
        assert "action" in finding
        assert isinstance(finding["action"], str)
        assert finding["action"].strip()


def test_sensitive_information_finding_has_specific_action():
    result = analyze_message("Please send your OTP to claim access.")

    finding = next(
        finding
        for finding in result["findings"]
        if finding["type"] == "sensitive_information"
    )

    assert "Do not share an OTP" in finding["action"]


def test_url_userinfo_finding_has_destination_guidance():
    result = analyze_message(
        "Check https://paypal.com@evil.example/login"
    )

    finding = next(
        finding
        for finding in result["findings"]
        if finding["type"] == "url_userinfo"
    )

    assert "verify its destination" in finding["action"]
