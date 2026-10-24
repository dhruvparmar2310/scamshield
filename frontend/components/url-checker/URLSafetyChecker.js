import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Search,
  Download,
  Globe2,
  Network,
  LockKeyhole,
  LockKeyholeOpen,
  AlertTriangle,
  Activity,
  Terminal,
  CheckCircle2,
  Info,
  ArrowRight,
  Fingerprint,
  FileSearch,
  Eye,
  Crosshair,
  Server,
  SlidersHorizontal,
  AlertCircle,
  Zap,
} from "lucide-react";

import { checkUrl } from "../../services/scamshieldApi";
import { saveScan } from "../../services/scanHistory";
import { generateUrlReport } from "../../services/generateUrlReport";

const IP_CATEGORY_DETAILS = {
  private: {
    label: "Private network",
    description:
      "This IP address is generally used inside a home, office, or private network.",
    advice:
      "Verify that you expected to access a device or service on your local network.",
  },
  public: {
    label: "Public address",
    description:
      "This address may identify an endpoint accessible through the public internet.",
    advice:
      "Public IP addresses are not automatically trustworthy or malicious.",
  },
  loopback: {
    label: "Loopback address",
    description:
      "This address refers to the device opening the link, commonly used for local development.",
    advice:
      "Be cautious with unexpected links targeting locally running services.",
  },
  link_local: {
    label: "Link-local address",
    description:
      "This address is intended for communication on a local network segment.",
    advice:
      "Verify that this is an expected local device or service.",
  },
  multicast: {
    label: "Multicast address",
    description:
      "This address is intended for communication with groups of devices.",
    advice:
      "This is not a typical public website destination.",
  },
  unspecified: {
    label: "Unspecified address",
    description:
      "This address represents an unspecified network endpoint.",
    advice:
      "It is not a typical website destination.",
  },
  shared_address: {
    label: "Shared address space",
    description:
      "This address belongs to shared space often associated with carrier-grade NAT.",
    advice:
      "Its reachability depends on the network.",
  },
  special_use: {
    label: "Special-use address",
    description:
      "This address belongs to a reserved or special-purpose range.",
    advice:
      "Its intended use depends on the specific address range.",
  },
};

function getVerdict(verdict) {
  switch (verdict) {
    case "potentially_suspicious":
      return {
        label: "Potentially suspicious",
        shortLabel: "ELEVATED RISK",
        tone: "danger",
        Icon: ShieldAlert,
        description:
          "Multiple structural warning signs were detected. Verify the destination independently before interacting with it.",
      };

    case "needs_review":
      return {
        label: "Requires investigation",
        shortLabel: "REVIEW REQUIRED",
        tone: "warning",
        Icon: ShieldQuestion,
        description:
          "One or more URL characteristics need closer inspection. This does not establish that the website is malicious.",
      };

    default:
      return {
        label: "No obvious indicators",
        shortLabel: "NO RULE MATCHES",
        tone: "success",
        Icon: ShieldCheck,
        description:
          "No current structural rules were triggered. The website itself and its live reputation have not been verified.",
      };
  }
}

function formatFindingType(type = "") {
  return String(type)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function normalizeSeverity(severity) {
  return ["high", "medium", "low"].includes(severity) ? severity : "medium";
}

function getScore(score) {
  const numericScore = Number(score);

  return Number.isFinite(numericScore)
    ? Math.max(0, Math.min(100, numericScore))
    : 0;
}

// This meter is a visual representation of the backend's
// heuristic score, not a probability of malicious activity.
function ThreatMeter({ score, tone }) {
  const normalizedScore = getScore(score);
  const filledSegments = Math.ceil(normalizedScore / 5);

  return (
    <div className={`soc-threat-meter tone-${tone}`}>
      <div className="soc-meter-header">
        <div>
          <span className="soc-micro-label">
            HEURISTIC RISK INDEX
          </span>

          <p>Structural indicators</p>
        </div>

        <div className="soc-meter-value">
          <strong>{normalizedScore}</strong>
          <span>/ 100</span>
        </div>
      </div>

      <div
        className="soc-meter-segments"
        role="progressbar"
        aria-label="Heuristic risk score"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalizedScore}
      >
        {Array.from({ length: 20 }, (_, index) => (
          <span
            key={index}
            className={index < filledSegments ? "is-active" : ""}
          />
        ))}
      </div>

      <div className="soc-meter-scale">
        <span>0 / MIN</span>
        <span>50 / MID</span>
        <span>100 / MAX</span>
      </div>

      <p className="soc-meter-disclaimer">
        Rule-based score only. Not a fraud probability.
      </p>
    </div>
  );
}

function TelemetryItem({ icon: Icon, label, value, tone = "" }) {
  return (
    <div className={`soc-telemetry-item ${tone}`}>
      <div className="soc-telemetry-icon">
        <Icon size={17} strokeWidth={1.8} />
      </div>

      <div className="soc-telemetry-copy">
        <span>{label}</span>
        <strong title={String(value ?? "")}>
          {value || "Unknown"}
        </strong>
      </div>
    </div>
  );
}

function IPInformation({ ipInfo }) {
  if (!ipInfo) return null;

  const details =
    IP_CATEGORY_DETAILS[ipInfo.category] ||
    IP_CATEGORY_DETAILS.special_use;

  return (
    <section className="soc-network-panel">
      <div className="soc-panel-heading">
        <div className="soc-heading-icon">
          <Network size={18} />
        </div>

        <div>
          <span className="soc-micro-label">
            NETWORK INTELLIGENCE
          </span>
          <h3>IP address classification</h3>
        </div>

        <span className="soc-panel-tag">
          IPv{ipInfo.version}
        </span>
      </div>

      <div className="soc-ip-data">
        <div>
          <span>ADDRESS</span>
          <strong>{ipInfo.ip}</strong>
        </div>

        <div>
          <span>CLASSIFICATION</span>
          <strong>{details.label}</strong>
        </div>

        <div>
          <span>GLOBALLY ROUTABLE</span>
          <strong>{ipInfo.is_global ? "Yes" : "No"}</strong>
        </div>
      </div>

      <p className="soc-ip-description">
        {details.description}
      </p>

      <div className="soc-ip-advice">
        <Info size={16} />
        <p>{details.advice}</p>
      </div>
    </section>
  );
}

function FindingDetail({ finding, index, total }) {
  const severity = normalizeSeverity(finding.severity);

  return (
    <article className={`soc-evidence tone-${severity}`}>
      <header className="soc-evidence-header">
        <div className="soc-evidence-meta">
          <span className="soc-evidence-badge">
            <Terminal size={12} />
            <span>FINDING #{String(index + 1).padStart(2, "0")}</span>
          </span>
          <span className="soc-evidence-total">OF {String(total).padStart(2, "0")}</span>
        </div>

        <span className={`soc-severity severity-${severity}`}>
          <span className="soc-status-dot" />
          {severity.toUpperCase()} RISK
        </span>
      </header>

      <div className="soc-evidence-intro">
        <h4>{formatFindingType(finding.type)}</h4>
        <p>{finding.message}</p>
      </div>

      <div className="soc-analysis-grid">
        <div className="soc-analysis-card">
          <div className="soc-card-head">
            <div className="soc-card-icon">
              <AlertCircle size={16} />
            </div>
            <h5>Detection Reason</h5>
          </div>
          <p>
            {finding.reason ||
              "This URL contains a structural characteristic that requires closer inspection."}
          </p>
        </div>

        <div className="soc-analysis-card">
          <div className="soc-card-head">
            <div className="soc-card-icon harm">
              <Zap size={16} />
            </div>
            <h5>Potential Impact</h5>
          </div>
          <p>
            {finding.potential_harm ||
              "An unexpected destination may expose users to misleading content or unverified protocols."}
          </p>
        </div>
      </div>

      <div className="soc-mitigation">
        <div className="soc-mitigation-content">
          <div className="soc-mitigation-icon">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h6>RECOMMENDED MITIGATION</h6>
            <p>
              {finding.action ||
                "Verify the destination independently before entering sensitive credentials."}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function FindingsConsole({ findings }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeIndex = Math.min(
    selectedIndex,
    Math.max(0, findings.length - 1)
  );

  if (!findings.length) {
    return (
      <section className="soc-findings-console">
        <div className="soc-section-heading">
          <div>
            <span className="soc-micro-label">ANALYSIS RESULTS</span>
            <h3>Investigation Findings</h3>
          </div>
        </div>

        <div className="soc-empty-state">
          <ShieldCheck size={28} />
          <h4>No Structural Risks Detected</h4>
          <p>
            The structural scan completed without triggering any warning heuristics.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="soc-findings-console">
      <div className="soc-section-heading">
        <div>
          <span className="soc-micro-label">THREAT INTELLIGENCE</span>
          <h3>Investigation Findings</h3>
          <p>Detailed heuristic analysis and recommended mitigation steps.</p>
        </div>

        <span className="soc-findings-count">
          <SlidersHorizontal size={13} />
          {findings.length} INDICATORS
        </span>
      </div>

      <div className="soc-investigation-layout">
        <nav className="soc-findings-nav" aria-label="Detected URL indicators">
          <div className="soc-nav-heading">
            <span>DETECTED ANOMALIES</span>
            <span className="soc-nav-pill">{String(findings.length).padStart(2, "0")}</span>
          </div>

          <div className="soc-nav-list">
            {findings.map((finding, index) => {
              const severity = normalizeSeverity(finding.severity);
              const isSelected = activeIndex === index;

              return (
                <button
                  key={`${finding.type}-${index}`}
                  type="button"
                  className={`soc-finding-tab severity-${severity} ${
                    isSelected ? "is-selected" : ""
                  }`}
                  onClick={() => setSelectedIndex(index)}
                  aria-pressed={isSelected}
                >
                  <span className="soc-finding-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="soc-finding-tab-copy">
                    <strong>{formatFindingType(finding.type)}</strong>
                    <small className={`tag-${severity}`}>{severity} priority</small>
                  </span>

                  <ArrowRight size={14} className="soc-tab-arrow" aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <div className="soc-nav-footer">
            <span className="soc-status-dot" />
            <span>HEURISTIC ENGINE V2</span>
          </div>
        </nav>

        <FindingDetail
          finding={findings[activeIndex]}
          index={activeIndex}
          total={findings.length}
        />
      </div>
    </section>
  );
}

export default function URLSafetyChecker() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const submittedUrl = url.trim();

    if (!submittedUrl) {
      setError("Enter a URL before starting the check.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await checkUrl(submittedUrl);

      setResult(data);

      try {
        saveScan({
          type: "url",
          input: submittedUrl,
          result: data,
        });
      } catch (storageError) {
        console.warn(
          "Could not save scan history:",
          storageError
        );
      }
    } catch (err) {
      setError(err.message || "Unable to check this URL.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadReport() {
    if (!result || generatingPdf) return;

    setGeneratingPdf(true);
    setError("");

    try {
      await generateUrlReport(result);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Unable to generate the PDF report.");
    } finally {
      setGeneratingPdf(false);
    }
  }

  const verdict = result ? getVerdict(result.verdict) : null;
  const findings = Array.isArray(result?.findings)
    ? result.findings
    : [];

  return (
    <section
      className="url-checker-section soc-url-checker"
      id="url-checker"
      aria-labelledby="url-checker-title"
    >
      {/* SCAN WORKSPACE */}
      <div className="soc-workspace">
        <div className="soc-workspace-topbar">
          <div className="soc-workspace-brand">
            <div className="soc-brand-symbol">
              <Terminal size={18} />
            </div>

            <div>
              <span className="soc-micro-label">
                CyberMentis / SECURITY TOOLS
              </span>

              <h2 id="url-checker-title">
                URL Investigation
              </h2>
            </div>
          </div>

          <span className="soc-engine-status">
            <span className="soc-status-dot" />
            STRUCTURAL ENGINE
          </span>
        </div>

        <div className="soc-workspace-intro">
          <span className="soc-micro-label">
            INVESTIGATION / 01
          </span>

          <h3>Analyze a suspicious destination.</h3>

          <p>
            Inspect the structure of a link without opening
            the website. Understand warning signs and
            potential risks before taking action.
          </p>
        </div>

        <form
          className="soc-scan-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="url-checker-input">
            TARGET URL
          </label>

          <div className="soc-input-row">
            <div className="soc-input-shell">
              <Globe2 size={19} />

              <input
                id="url-checker-input"
                type="text"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setError("");
                }}
                placeholder="https://example.com/login"
                maxLength={2048}
                disabled={loading}
                autoComplete="url"
                spellCheck={false}
                autoCapitalize="off"
                aria-describedby="soc-input-help"
              />
            </div>

            <button
              type="submit"
              className="soc-scan-button"
              disabled={loading || !url.trim()}
            >
              {loading ? (
                <Activity size={18} />
              ) : (
                <Search size={18} />
              )}

              {loading ? "Analyzing..." : "Analyze URL"}
            </button>
          </div>

          <div className="soc-input-footer">
            <span id="soc-input-help">
              <LockKeyhole size={14} />
              No website visit or DNS lookup
            </span>

            <span>HTTP / HTTPS</span>
          </div>
        </form>

        {error && (
          <p className="soc-error" role="alert">
            <AlertTriangle size={17} />
            {error}
          </p>
        )}
      </div>

      {/* INVESTIGATION RESULTS */}
      {result && verdict && (
        <div className="soc-results" aria-live="polite">
          <div className="soc-report-header">
            <div className="soc-report-heading">
              <span className="soc-micro-label">
                INVESTIGATION / COMPLETE
              </span>

              <h3>Security analysis</h3>

              <p>
                Structural assessment generated by CyberMentis.
              </p>
            </div>

            <button
              type="button"
              className="soc-export-button"
              onClick={handleDownloadReport}
              disabled={generatingPdf}
            >
              <Download size={17} />

              {generatingPdf
                ? "Generating..."
                : "Export PDF"}
            </button>
          </div>

          <div className={`soc-assessment tone-${verdict.tone}`}>
            <div className="soc-assessment-primary">
              <div className="soc-assessment-status">
                <verdict.Icon size={23} strokeWidth={1.8} />

                <span>{verdict.shortLabel}</span>
              </div>

              <h3>{verdict.label}</h3>

              <p>{verdict.description}</p>

              <div className="soc-assessment-meta">
                <span>
                  <FileSearch size={15} />
                  {findings.length} indicators
                </span>

                <span>
                  <Eye size={15} />
                  Passive inspection
                </span>
              </div>
            </div>

            <ThreatMeter
              score={result.risk_score}
              tone={verdict.tone}
            />
          </div>

          <section className="soc-destination-section">
            <div className="soc-section-heading">
              <div>
                <span className="soc-micro-label">
                  DESTINATION TELEMETRY
                </span>

                <h3>Target information</h3>

                <p>
                  Parsed URL information. Not independently
                  verified.
                </p>
              </div>

              <Server size={20} />
            </div>

            <div className="soc-telemetry-grid">
              <TelemetryItem
                icon={Globe2}
                label="DESTINATION HOST"
                value={result.hostname}
              />

              <TelemetryItem
                icon={
                  result.uses_https
                    ? LockKeyhole
                    : LockKeyholeOpen
                }
                label="URL PROTOCOL"
                value={(result.scheme || "Unknown").toUpperCase()}
                tone={result.uses_https ? "secure" : "caution"}
              />

              <TelemetryItem
                icon={Network}
                label="HTTPS IN PARSED URL"
                value={result.uses_https ? "YES" : "NO"}
                tone={result.uses_https ? "secure" : "caution"}
              />
            </div>

            {result.scheme_was_assumed && (
              <div className="soc-inline-notice">
                <Info size={17} />

                <p>
                  HTTPS was assumed because the submitted
                  URL had no protocol. This does not verify
                  HTTPS availability or certificate validity.
                </p>
              </div>
            )}
          </section>

          <IPInformation ipInfo={result.ip_info} />

          <FindingsConsole
            key={result.url || result.hostname}
            findings={findings}
          />

          <section className="soc-safety-panel">
            <div className="soc-safety-icon">
              <ShieldCheck size={22} />
            </div>

            <div>
              <span className="soc-micro-label">
                SECURITY GUIDANCE
              </span>

              <h3>Before interacting with this destination</h3>

              <div className="soc-safety-grid">
                {[
                  "Verify the actual hostname independently.",
                  "Never share passwords, OTPs, or payment details on unverified websites.",
                  "Use official apps or known website addresses for important services.",
                  "Remember that HTTPS alone does not establish legitimacy.",
                ].map((tip) => (
                  <div key={tip} className="soc-safety-item">
                    <CheckCircle2 size={16} />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="soc-report-footer">
            <Info size={16} />

            <p>
              {result.disclaimer ||
                "This tool analyzes URL structure only. It does not visit the website, resolve DNS, or verify live reputation."}
            </p>
          </div>
        </div>
      )}

      {!result && (
        <div className="soc-idle-footer">
          <span>
            <Activity size={15} />
            AWAITING TARGET INPUT
          </span>

          <span>CyberMentis / URL SECURITY</span>
        </div>
      )}
    </section>
  );
}