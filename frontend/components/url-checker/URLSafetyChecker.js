
import { useState } from "react";
import { checkUrl } from "../../services/scamshieldApi";
import { saveScan } from "../../services/scanHistory";

function getVerdict(verdict) {
  switch (verdict) {
    case "potentially_suspicious":
      return {
        label: "Potentially suspicious",
        className: "danger",
      };

    case "needs_review":
      return {
        label: "Needs a closer look",
        className: "warning",
      };

    default:
      return {
        label: "No obvious URL warning signs",
        className: "neutral",
      };
  }
}

export default function URLSafetyChecker() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!url.trim()) {
      setError("Enter a URL before starting the check.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
        const data = await checkUrl(url.trim());
        setResult(data);
        
        try {
          saveScan({
            type: "url",
            input: url.trim(),
            result: data,
          });
        } catch (storageError) {
          console.warn("Could not save scan history:", storageError);
        }
    } catch (err) {
      setError(err.message || "Unable to check this URL.");
    } finally {
      setLoading(false);
    }
  }

  const verdict = result ? getVerdict(result.verdict) : null;

  return (
    <section className="url-checker-section" id="url-checker">
      <div className="url-checker-heading">
        <span className="section-kicker">URL SAFETY CHECKER</span>
        <h2>Check a suspicious link.</h2>
        <p>
          Inspect a URL for common structural warning signs before
          deciding whether to trust it.
        </p>
      </div>

      <form className="url-checker-form" onSubmit={handleSubmit}>
        <label htmlFor="url-checker-input">
          Website URL
        </label>

        <input
          id="url-checker-input"
          type="text"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setError("");
          }}
          placeholder="example.com or https://example.com/login"
          maxLength={2048}
          disabled={loading}
          autoComplete="url"
        />

        <button
          className="url-checker-button"
          type="submit"
          disabled={loading || !url.trim()}
        >
          {loading ? "Checking URL..." : "Check URL"}
          {!loading && <span aria-hidden="true"> →</span>}
        </button>
      </form>

      {error && (
        <p className="url-checker-error" role="alert">
          {error}
        </p>
      )}

      {result && verdict && (
        <div className="url-checker-results" aria-live="polite">
          <div className={`url-checker-verdict verdict-${verdict.className}`}>
            <span className="section-kicker">URL ASSESSMENT</span>
            <h3>{verdict.label}</h3>
            <p>
              Risk score: <strong>{result.risk_score}/100</strong>
            </p>
          </div>

          <dl className="url-checker-details">
            <div>
              <dt>Hostname</dt>
              <dd>{result.hostname}</dd>
            </div>

            <div>
              <dt>Protocol</dt>
              <dd>{result.scheme.toUpperCase()}</dd>
            </div>

            <div>
              <dt>HTTPS</dt>
              <dd>{result.uses_https ? "Yes" : "No"}</dd>
            </div>
          </dl>

          <div className="url-checker-findings">
            <h3>Detected indicators</h3>

            {result.findings.length > 0 ? (
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
                        .replaceAll("_", " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </h4>

                    <p>{finding.message}</p>

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
                    The URL structure did not trigger our current rules.
                    This does not guarantee the website is safe.
                  </p>
                </div>
              </div>
            )}
          </div>

          <p className="url-checker-disclaimer">
            {result.disclaimer}
          </p>
        </div>
      )}

      <p className="url-checker-note">
        This tool inspects the URL structure only. It does not open the
        website or verify its live reputation.
      </p>
    </section>
  );
}
