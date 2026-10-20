
import { useState } from "react";
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
];

function getVerdict(verdict) {
  switch (verdict) {
    case "potentially_suspicious":
      return {
        label: "Potentially suspicious",
        description:
          "Multiple warning signs were found. Verify the sender before taking action.",
        className: "danger",
      };

    case "needs_review":
      return {
        label: "Needs a closer look",
        description:
          "Some warning signs were found. Review the findings below.",
        className: "warning",
      };

    case "no_obvious_indicators":
      return {
        label: "No obvious warning signs",
        description:
          "Our current checks did not find obvious indicators. This does not mean the message is safe.",
        className: "neutral",
      };

    default:
      return {
        label: "Analysis complete",
        description:
          "Review the findings carefully. Automated checks can miss scams.",
        className: "neutral",
      };
  }
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
        console.warn("Could not save scan history:", storageError);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleExample(example) {
    setMessage(example.message);
    setResult(null);
    setError("");
  }

  const verdict = result ? getVerdict(result.verdict) : null;

  return (
    <main className="home-container feature-page">
      <section className="feature-page-intro">
        <span className="section-kicker">MESSAGE ANALYZER</span>
        <h1>What looks suspicious?</h1>
        <p>
          Paste a suspicious SMS, WhatsApp message, email text, or unexpected
          offer. Review the warning signs before you respond.
        </p>
      </section>

      <section
        className="analyzer-section"
        aria-labelledby="analyzer-title"
      >
        <div className="analyzer-heading">
          <div>
            <span className="section-kicker">MESSAGE CHECKER</span>
            <h2 id="analyzer-title">Analyze a suspicious message.</h2>
            <p>Paste the message exactly as you received it.</p>
          </div>

          <div className="input-type-badge">
            <span aria-hidden="true">↳</span> Text analysis
          </div>
        </div>

        <form onSubmit={handleAnalyze}>
          <label className="sr-only" htmlFor="message-input">
            Suspicious message
          </label>

          <textarea
            id="message-input"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setError("");
            }}
            placeholder="Paste a suspicious SMS, WhatsApp message, email text, or URL here..."
            maxLength={10000}
            rows={6}
            disabled={loading}
            aria-describedby="input-hint"
          />

          <div className="input-footer">
            <span id="input-hint">
              Avoid including passwords, OTPs, or private account information.
            </span>
            <span className="character-count">
              {message.length.toLocaleString()} / 10,000
            </span>
          </div>

          {error && (
            <p className="form-error" role="alert">
              <span aria-hidden="true">!</span> {error}
            </p>
          )}

          <button
            className="analyze-button"
            type="submit"
            disabled={loading || !message.trim()}
          >
            {loading ? (
              <>
                <span className="loading-spinner" />
                Analyzing message...
              </>
            ) : (
              <>
                Analyze message <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>

        <div className="examples">
          <span className="examples-label">TRY AN EXAMPLE</span>
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

      {result && verdict && (
        <section
          className="results-section"
          aria-labelledby="results-title"
          aria-live="polite"
        >
          <div className="results-topline">
            <div>
              <span className="section-kicker">ANALYSIS REPORT</span>
              <h2 id="results-title">Here&apos;s what we found.</h2>
              {Number.isFinite(result.risk_score) && (
                <p className="risk-score">
                  Risk score: <strong>{result.risk_score}/100</strong>
                </p>
              )}
            </div>

            <span className="results-count">
              {result.findings?.length ?? 0}{" "}
              {(result.findings?.length ?? 0) === 1 ? "finding" : "findings"}
            </span>
          </div>

          <div className={`verdict-card verdict-${verdict.className}`}>
            <div className="verdict-symbol" aria-hidden="true">
              {verdict.className === "danger"
                ? "!"
                : verdict.className === "warning"
                  ? "?"
                  : "i"}
            </div>
            <div className="verdict-copy">
              <span className="verdict-label">INITIAL ASSESSMENT</span>
              <h3>{verdict.label}</h3>
              <p>{verdict.description}</p>
            </div>
          </div>

          <div className="findings-list">
            <h3>Detected indicators</h3>

            {result.findings?.length > 0 ? (
              result.findings.map((finding, index) => (
                <article
                  className="finding-card"
                  key={`${finding.type}-${index}`}
                >
                  <span
                    className={`finding-indicator finding-${finding.severity || "medium"}`}
                    aria-hidden="true"
                  >
                    !
                  </span>

                  <div className="finding-copy">
                    <h4>
                      {finding.type
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </h4>
                    <p>{finding.message}</p>

                    {finding.url && (
                      <code className="finding-url">{finding.url}</code>
                    )}

                    {finding.action && (
                      <div className="finding-action">
                        <strong>Recommended action</strong>
                        <p>{finding.action}</p>
                      </div>
                    )}
                  </div>

                  <span className="finding-severity">
                    {finding.severity || "Review"}
                  </span>
                </article>
              ))
            ) : (
              <div className="empty-findings">
                <span aria-hidden="true">✓</span>
                <div>
                  <h4>No obvious indicators detected</h4>
                  <p>
                    Our current rules did not identify a warning sign. New or
                    sophisticated scams may still go undetected.
                  </p>
                </div>
              </div>
            )}
          </div>

          {result.urls?.length > 0 && (
            <div className="url-results">
              <h3>URLs found in your message</h3>
              {result.urls.map((url, index) => {
                const urlFindings = (result.findings || []).filter(
                  (finding) => finding.url === url
                );

                return (
                  <div className="url-result" key={`${url}-${index}`}>
                    <code>{url}</code>
                    <span>
                      {urlFindings.length > 0
                        ? `${urlFindings.length} indicator(s)`
                        : "No URL warning from current checks"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="recommendation-card">
            <span className="recommendation-icon" aria-hidden="true">
              ↗
            </span>
            <div>
              <h3>What should you do next?</h3>
              <p>
                Never share passwords, PINs, or OTPs in response to a message.
                Verify unexpected requests using an independently obtained
                official contact or website.
              </p>
            </div>
          </div>

          <p className="results-disclaimer">
            {result.disclaimer ||
              "This automated analysis is not proof that a message is safe or malicious."}
          </p>

          <button
            className="reset-button"
            type="button"
            onClick={() => {
              setMessage("");
              setResult(null);
              setError("");
              document.getElementById("message-input")?.focus();
            }}
          >
            Analyze another message <span aria-hidden="true">↗</span>
          </button>
        </section>
      )}

      <p className="feature-page-note">
        Analysis uses rule-based checks. A low score does not guarantee safety.
      </p>
    </main>
  );
}
