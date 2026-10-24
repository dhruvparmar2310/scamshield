
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
