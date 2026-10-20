
const STORAGE_KEY = "scamshield.scanHistory";
const MAX_HISTORY_ITEMS = 50;

function redactText(value = "") {
  return value
    .replace(/\b\d{4,8}\b/g, "[code]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]")
    .replace(/\b(?:\+?\d[\d\s().-]{7,}\d)\b/g, "[phone]")
    .replace(/https?:\/\/[^\s]+/gi, "[link]");
}

function safeUrlPreview(value = "") {
  try {
    const url = new URL(
      value.includes("://") ? value : `https://${value}`
    );

    return `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`
      .slice(0, 100);
  } catch {
    return "[URL]";
  }
}

function sanitizeFindings(findings = []) {
  return findings.map((finding) => ({
    type: finding.type || "unknown",
    severity: finding.severity || "medium",
    message: finding.message || "",
    action: finding.action || "",
    ...(finding.url
      ? { url: safeUrlPreview(finding.url) }
      : {}),
  }));
}

function readHistory() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(items) {
    if (typeof window === "undefined") return;
  
    try {
      const history = items.slice(0, MAX_HISTORY_ITEMS);
  
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(history)
      );
  
      // Notify components in the current tab.
      window.dispatchEvent(new Event("scamshield:history-updated"));
    } catch (error) {
      console.error("Could not update scan history:", error);
    }
  }
  
export function getScanHistory() {
  return readHistory();
}


export function clearScanType(type) {
    const history = getScanHistory();
    const safeHistory = Array.isArray(history) ? history : [];
    const remaining = safeHistory.filter(
      (item) => item.type !== type
    );
  
    // Use the same internal write function used by save/delete/clear.
    writeHistory(remaining);
  
    return remaining;
  }
  

export function saveScan({
  type,
  input,
  result,
}) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    createdAt: new Date().toISOString(),
    preview:
      type === "url"
        ? safeUrlPreview(input)
        : redactText(input).slice(0, 120),
    verdict: result.verdict || "unknown",
    riskScore: Number.isFinite(result.risk_score)
      ? result.risk_score
      : 0,
    findings: sanitizeFindings(result.findings),
    disclaimer: result.disclaimer || "",
  };

  writeHistory([entry, ...readHistory()]);
  return entry;
}

export function deleteScan(id) {
  writeHistory(readHistory().filter((item) => item.id !== id));
}

export function clearScanHistory() {
  writeHistory([]);
}
