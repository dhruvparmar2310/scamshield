
const API_URL =
process.env.NEXT_PUBLIC_SCAMSHIELD_API_URL ||
  "http://127.0.0.1:8000";

async function postJson(path, payload, fallbackMessage) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Unable to connect to CyberMentis. Make sure the backend is running."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(", ")
      : detail;

    throw new Error(message || fallbackMessage);
  }

  return data;
}

export function analyzeMessage(message) {
  return postJson(
    "/api/analyze",
    { message },
    "Unable to analyze this message. Please try again."
  );
}

export function checkUrl(url) {
  return postJson(
    "/api/url-check",
    { url },
    "Unable to check this URL. Please try again."
  );
}

/**
 * Run CyberMentis Deep Scan.
 *
 * Smart Scan checks are performed by the Python backend,
 * along with optional DNS and WHOIS lookups.
 */
export async function deepCheckUrl(url) {
  const response = await fetch("/api/url-check/deep", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ url }),
  });

  // Prevent HTML responses from causing JSON parsing errors.
  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(
      `Deep Scan returned an unexpected response (HTTP ${response.status}).`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Unable to complete Deep Scan."
    );
  }

  return data;
}