
import pytest

from app.url_checker import check_url, normalize_url


def test_adds_https_when_scheme_is_missing():
    result = check_url("example.com")

    assert result["url"] == "https://example.com"
    assert result["hostname"] == "example.com"
    assert result["uses_https"] is True
    assert result["risk_score"] == 0


def test_accepts_http_and_reports_missing_https():
    result = check_url("http://example.com/login")

    assert result["scheme"] == "http"
    assert result["uses_https"] is False
    assert any(
        finding["type"] == "no_https"
        for finding in result["findings"]
    )


def test_detects_url_userinfo():
    result = check_url("https://paypal.com@evil.example/login")

    assert result["hostname"] == "evil.example"
    assert any(
        finding["type"] == "url_userinfo"
        for finding in result["findings"]
    )


def test_detects_ip_address_url():
    result = check_url("https://192.0.2.1/login")

    assert any(
        finding["type"] == "ip_address_url"
        for finding in result["findings"]
    )


def test_detects_punycode_domain():
    result = check_url("https://xn--pple-43d.com")

    assert any(
        finding["type"] == "punycode_domain"
        for finding in result["findings"]
    )


def test_rejects_empty_url():
    with pytest.raises(ValueError):
        check_url("   ")


def test_rejects_unsupported_protocol():
    with pytest.raises(ValueError):
        check_url("ftp://example.com/file")


def test_rejects_url_with_spaces():
    with pytest.raises(ValueError):
        check_url("https://example .com")


def test_includes_disclaimer_and_actions():
    result = check_url("http://example.com")

    assert result["disclaimer"]
    assert result["findings"]

    for finding in result["findings"]:
        assert finding["action"].strip()


def test_normalize_url_rejects_missing_hostname():
    with pytest.raises(ValueError):
        normalize_url("https://")
