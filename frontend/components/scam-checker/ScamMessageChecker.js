
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Gift,
  Globe2,
  Info,
  KeyRound,
  Link2,
  LockKeyhole,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { analyzeMessage } from "../../services/scamshieldApi";
import { saveScan } from "../../services/scanHistory";

const examples = [
  {
    label: "Bank alert",
    message:
      "Your account will be blocked today. Act now and send your OTP to verify your account.",
  },
  {
    label: "Prize message",
    message:
      "Congratulations! You have won a prize. Claim your prize immediately!",
  },
  {
    label: "Suspicious link",
    message:
      "Please review your account immediately at http://192.0.2.10/login",
  },
];

const FINDING_CONTENT = {
  urgent_language: {
    title: "Pressure to act quickly",
    reason:
      "The message uses urgent wording. Scammers sometimes create pressure so people act without checking the facts.",
    advice:
      "Take your time. Contact the organization using its official website or a number you already trust.",
    icon: Clock3,
  },

  sensitive_information: {
    title: "Request for private information",
    reason:
      "The message appears to ask for a password, OTP, PIN, or verification code. Sharing these details could put your account at risk.",
    advice:
      "Do not share these details in response to an unexpected message. Use the official app or website.",
    icon: KeyRound,
  },

  unexpected_reward: {
    title: "Unexpected prize or reward",
    reason:
      "The message mentions a prize or reward. Fake offers are sometimes used to collect personal information or money.",
    advice:
      "Check whether the offer is genuine. Do not pay unexpected fees or share private information to claim it.",
    icon: Gift,
  },

  no_https: {
    title: "The link does not use HTTPS",
    reason:
      "The link does not use the connection protection normally provided by HTTPS. Information sent through it may be exposed.",
    advice:
      "Do not enter passwords or payment details through this link. Find the official website yourself.",
    icon: LockKeyhole,
  },

  url_userinfo: {
    title: "The link may hide its real destination",
    reason:
      "The link contains an @ symbol that can make one website name appear to be the destination when the link actually points elsewhere.",
    advice:
      "Do not trust the name shown before the @ symbol. Check the real destination independently.",
    icon: Link2,
  },

  invalid_url: {
    title: "The link has an unusual format",
    reason:
      "The website address appears incomplete or incorrectly formatted, so its destination may not be clear.",
    advice:
      "Avoid using this link. Find the official website through a trusted source.",
    icon: Link2,
  },

  ip_address_url: {
    title: "The link uses a number instead of a website name",
    reason:
      "The link uses an IP address rather than a familiar domain name. This can be legitimate, but the destination may be harder to recognize.",
    advice:
      "Make sure you expected this type of link. An IP address alone does not mean a website is unsafe.",
    icon: Globe2,
  },

  private_ip_url: {
    title: "The link points to a private network",
    reason:
      "This address is normally used inside a private network, such as a home or workplace network.",
    advice:
      "Only use it if you recognize the device or service.",
    icon: Globe2,
  },

  loopback_ip_url: {
    title: "The link points to your own device",
    reason:
      "This address refers to the device opening the link, rather than a public website.",
    advice:
      "Do not open it unless you know why a local service is being requested.",
    icon: Globe2,
  },

  link_local_ip_url: {
    title: "The link points to a nearby network device",
    reason:
      "This address is normally used for communication within a local network.",
    advice:
      "Check that you recognize the device or service before using it.",
    icon: Globe2,
  },

  special_use_ip_url: {
    title: "The link uses a special network address",
    reason:
      "This address has a special networking purpose and may not work like a normal public website.",
    advice:
      "Check why the link uses this address before opening it.",
    icon: Globe2,
  },

  local_hostname_url: {
    title: "The link may open a local service",
    reason:
      "The website name may refer to a device or service on your local network rather than a public website.",
    advice:
      "Only use it if you recognize the destination.",
    icon: Globe2,
  },

  deep_subdomain: {
    title: "The website address is unusually long",
    reason:
      "The link contains several levels in its website name. A familiar brand name inside a long address does not prove the link belongs to that brand.",
    advice:
      "Check the full website address carefully. Visit the official website independently if unsure.",
    icon: Link2,
  },

  punycode_domain: {
    title: "The website name needs a closer look",
    reason:
      "The address uses a special format for international website names. This can be legitimate, but it may also be used in lookalike links.",
    advice:
      "Compare the address with the organization's official website before trusting it.",
    icon: Globe2,
  },
};

function getVerdict(verdict) {
  switch (verdict) {
    case "potentially_suspicious":
      return {
        label: "Potentially suspicious",
        heading: "Be careful with this message",
        description:
          "Our checks found stronger warning signs. Avoid following its instructions until you verify the request.",
        className: "danger",
        icon: ShieldAlert,
      };

    case "needs_review":
      return {
        label: "Review recommended",
        heading: "This message needs a closer look",
        description:
          "We noticed a few things worth checking before you trust this message or open its links.",
        className: "warning",
        icon: AlertTriangle,
      };

    case "no_obvious_indicators":
      return {
        label: "No obvious signs found",
        heading: "No common warning signs detected",
        description:
          "The message did not match our current warning rules. This does not guarantee that it is safe.",
        className: "neutral",
        icon: ShieldCheck,
      };

    default:
      return {
        label: "Check complete",
        heading: "Your message has been checked",
        description:
          "Review the information below before deciding what to do.",
        className: "neutral",
        icon: Info,
      };
  }
}

function formatFinding(finding) {
  const content = FINDING_CONTENT[finding.type];

  if (content) {
    return {
      ...content,
      severity: finding.severity || "info",
    };
  }

  return {
    title: String(finding.type || "Additional observation")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    reason:
      finding.message ||
      "Our checks found something worth reviewing.",
    advice:
      finding.action ||
      "Verify this information before taking action.",
    icon: Info,
    severity: finding.severity || "info",
  };
}

function FindingItem({ finding }) {
  const content = formatFinding(finding);
  const Icon = content.icon;

  return (
    <article className="message-report-finding">
      <div
        className={`message-report-finding-icon is-${content.severity}`}
        aria-hidden="true"
      >
        <Icon size={18} strokeWidth={1.8} />
      </div>

      <div className="message-report-finding-body">
        <h4>{content.title}</h4>

        <p>{content.reason}</p>

        {finding.url && (
          <code className="message-report-finding-url">
            {finding.url}
          </code>
        )}

        <p className="message-report-finding-advice">
          <strong>What to do:</strong>{" "}
          {content.advice}
        </p>
      </div>
    </article>
  );
}

export default function MessageChecker() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAnalyze(event) {
    event.preventDefault();

    if (!message.trim()) {
      setError("Paste a message before starting the analysis.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await analyzeMessage(message.trim());
      setResult(data);

      try {
        saveScan({
          type: "message",
          input: message.trim(),
          result: data,
        });
      } catch (storageError) {
        console.warn(
          "Could not save scan history:",
          storageError
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleExample(example) {
    setMessage(example.message);
    setResult(null);
    setError("");
  }

  function handleReset() {
    setMessage("");
    setResult(null);
    setError("");

    document.getElementById("message-input")?.focus();
  }

  const verdict = result
    ? getVerdict(result.verdict)
    : null;

  const findings = Array.isArray(result?.findings)
    ? result.findings
    : [];

  const urls = Array.isArray(result?.urls)
    ? result.urls
    : [];

  const riskScore = Number.isFinite(result?.risk_score)
    ? Math.max(0, Math.min(100, result.risk_score))
    : null;

  return (
    <main className="home-container feature-page">
      {/* INTRODUCTION */}

      <section className="feature-page-intro">
        <span className="section-kicker">
          MESSAGE CHECKER
        </span>

        <h1>Not sure if a message is genuine?</h1>

        <p>
          Check suspicious SMS, WhatsApp messages,
          emails, or unexpected offers. CyberMentis
          helps you spot common warning signs and
          understand what to do next.
        </p>
      </section>

      {/* INPUT FORM — EXISTING FUNCTIONALITY */}

      <section
        className="analyzer-section"
        aria-labelledby="analyzer-title"
      >
        <div className="analyzer-heading">
          <div>
            <span className="section-kicker">
              MESSAGE ANALYSIS
            </span>

            <h2 id="analyzer-title">
              Check a suspicious message
            </h2>

            <p>
              Paste the message below to look for
              common scam warning signs.
            </p>
          </div>

          <div className="input-type-badge">
            <span aria-hidden="true">↳</span>
            Text analysis
          </div>
        </div>

        <form onSubmit={handleAnalyze}>
          <label
            className="sr-only"
            htmlFor="message-input"
          >
            Suspicious message
          </label>

          <textarea
            id="message-input"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setError("");
            }}
            placeholder="Paste a suspicious SMS, WhatsApp message, email, or website link here..."
            maxLength={10000}
            rows={6}
            disabled={loading}
            aria-describedby="input-hint"
          />

          <div className="input-footer">
            <span id="input-hint">
              Remove passwords, OTPs, and private
              information before checking.
            </span>

            <span className="character-count">
              {message.length.toLocaleString()} / 10,000
            </span>
          </div>

          {error && (
            <p className="form-error" role="alert">
              <span aria-hidden="true">!</span>{" "}
              {error}
            </p>
          )}

          <button
            className="analyze-button"
            type="submit"
            disabled={loading || !message.trim()}
          >
            {loading ? (
              <>
                <span
                  className="loading-spinner"
                  aria-hidden="true"
                />
                Checking message...
              </>
            ) : (
              <>
                Check message
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div className="examples">
          <span className="examples-label">
            TRY AN EXAMPLE
          </span>

          {examples.map((example) => (
            <button
              key={example.label}
              type="button"
              className="example-chip"
              onClick={() => handleExample(example)}
              disabled={loading}
            >
              {example.label}
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </section>

      {/* REDESIGNED RESULTS */}

      {result && verdict && (
        <section
          className="results-section message-report"
          aria-labelledby="results-title"
          aria-live="polite"
        >
          <div className="message-report-header">
            <div>
              <span className="section-kicker">
                MESSAGE CHECK RESULTS
              </span>

              <h2 id="results-title">
                Here's what we found
              </h2>
            </div>

            <span
              className={`message-report-status is-${verdict.className}`}
            >
              {verdict.label}
            </span>
          </div>

          {/* SUMMARY */}

          <div
            className={`message-report-summary is-${verdict.className}`}
          >
            <div className="message-report-summary-top">
              <span
                className="message-report-summary-icon"
                aria-hidden="true"
              >
                <verdict.icon size={23} strokeWidth={1.8} />
              </span>

              <div>
                <h3>{verdict.heading}</h3>
                <p>{verdict.description}</p>
              </div>
            </div>

            {riskScore !== null && (
              <div className="message-report-score">
                <div className="message-report-score-label">
                  <span>
                    Warning sign score
                    <small>
                      Not a scam probability
                    </small>
                  </span>

                  <strong>
                    {riskScore}
                    <span> / 100</span>
                  </strong>
                </div>

                <div
                  className="message-report-score-track"
                  role="progressbar"
                  aria-label="Rule-based warning sign score"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={riskScore}
                >
                  <span
                    style={{ width: `${riskScore}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* FINDINGS */}

          <div className="message-report-findings">
            <div className="message-report-section-heading">
              <div>
                <h3>
                  {findings.length > 0
                    ? "What caught our attention"
                    : "What our checks found"}
                </h3>

                <p>
                  {findings.length > 0
                    ? "Here's why these details matter and what you can do."
                    : "No common warning signs matched our current checks."}
                </p>
              </div>

              {findings.length > 0 && (
                <span className="message-report-count">
                  {findings.length}{" "}
                  {findings.length === 1
                    ? "observation"
                    : "observations"}
                </span>
              )}
            </div>

            {findings.length > 0 ? (
              <div className="message-report-finding-list">
                {findings.map((finding, index) => (
                  <FindingItem
                    key={`${finding.type}-${index}`}
                    finding={finding}
                  />
                ))}
              </div>
            ) : (
              <div className="message-report-empty">
                <CheckCircle2 size={20} />

                <p>
                  We did not find warning signs covered
                  by our current rules. However, a
                  message can still be misleading or
                  harmful, so verify unexpected requests.
                </p>
              </div>
            )}
          </div>

          {/* FOUND LINKS */}

          {urls.length > 0 && (
            <div className="message-report-links">
              <div className="message-report-section-heading">
                <div>
                  <h3>Links in this message</h3>
                  <p>
                    These links were checked by
                    examining their text and structure.
                  </p>
                </div>
              </div>

              <div className="message-report-link-list">
                {urls.map((url, index) => {
                  const count = findings.filter(
                    (finding) => finding.url === url
                  ).length;

                  return (
                    <div
                      className="message-report-link"
                      key={`${url}-${index}`}
                    >
                      <Link2
                        size={17}
                        aria-hidden="true"
                      />

                      <code>{url}</code>

                      <span>
                        {count > 0
                          ? `${count} ${
                              count === 1
                                ? "observation"
                                : "observations"
                            }`
                          : "No warning found"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="message-report-link-note">
                <Info size={15} />
                We do not open these websites or check
                whether they are currently safe.
              </p>
            </div>
          )}

          {/* FINAL GUIDANCE */}

          <div className="message-report-guidance">
            <div className="message-report-guidance-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h3>Before you take action</h3>

              <p>
                If a message feels unexpected,
                asks for private information,
                or contains an unfamiliar link,
                verify it through the organization's
                official website, app, or trusted
                contact number.
              </p>
            </div>
          </div>

          {/* DISCLAIMER */}

          <div className="message-report-disclaimer">
            <Info size={17} />

            <p>
              <strong>Good to know:</strong>{" "}
              CyberMentis identifies possible warning
              signs, not confirmed scams. A low score
              does not guarantee safety.
            </p>
          </div>

          <button
            className="reset-button"
            type="button"
            onClick={handleReset}
          >
            <RotateCcw size={16} />
            Check another message
          </button>
        </section>
      )}

      <p className="feature-page-note">
        This tool uses rule-based checks to support
        cybersecurity awareness. Always verify
        suspicious messages independently.
      </p>
    </main>
  );
}
