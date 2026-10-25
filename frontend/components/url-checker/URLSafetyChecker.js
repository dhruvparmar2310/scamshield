import { useState } from "react";

import {

  Activity, AlertCircle, AlertTriangle, CheckCircle2, Download, CalendarClock, Database, Server,

  Globe2, Info, LockKeyhole, LockKeyholeOpen, Network, Search,

  ShieldAlert, ShieldCheck, ShieldQuestion, Terminal,

} from "lucide-react";

import { checkUrl, deepCheckUrl } from "../../services/scamshieldApi";

import { saveScan } from "../../services/scanHistory";

import { generateUrlReport } from "../../services/generateUrlReport";



const FINDING_LABELS = {

  government_identity_domain: "Possible government identity impersonation",
  official_verification_domain: "Unverified official-looking verification portal",
  identity_kyc_domain: "Potentially misleading KYC or identity domain",
  brand_impersonation: "Possible brand impersonation",
  brand_typosquatting: "Possible lookalike domain",
  url_userinfo: "The link may hide its real destination",

  no_https: "This link uses HTTP instead of HTTPS",

  ip_address_url: "The link uses an IP address",

  private_ip_url: "This link points to a private network",

  loopback_ip_url: "This link points to your own device",

  link_local_ip_url: "This link points to a local network address",

  deep_subdomain: "The website address has many subdomains",

  punycode_domain: "The domain uses an internationalized name",

  invalid_url: "The link's format looks unusual",

  localhost_url: "This link refers to a local device",

  local_domain_url: "This link uses a local network name",

  special_use_ip_url: "This IP address has a special purpose",

};



const IP_DETAILS = {

  private: ["Private network", "Common on home and office networks. It does not automatically mean the address is dangerous."],

  public: ["Public IP address", "This address can represent an internet endpoint. Its reputation has not been checked."],

  loopback: ["Your own device", "A loopback address refers to the device opening the link, often for development or testing."],

  link_local: ["Nearby network", "This address is intended for communication on the same local network segment."],

  multicast: ["Multicast address", "Usually used for communication with groups of devices, not an ordinary public website."],

  unspecified: ["Unspecified address", "This is not a typical website destination."],

  shared_address: ["Shared address range", "Often associated with carrier-grade NAT. Accessibility depends on the network."],

  special_use: ["Special-use address", "This range has a special purpose. Its behavior depends on the network configuration."],

};



function verdictDetails(value) {

if (value === "potentially_suspicious") {

return {

      tone: "danger", Icon: ShieldAlert, badge: "More caution needed",

      title: "This link has several warning signs",

      description: "The URL matches patterns that can sometimes appear in misleading links. This does not prove the website is malicious, but you should verify the destination independently.",

    };

  }

if (value === "needs_review") {

return {

      tone: "warning", Icon: ShieldQuestion, badge: "Review recommended",

      title: "This link deserves a closer look",

      description: "We found one or more details worth checking. Some of these patterns also occur in legitimate links, so consider the context before deciding whether to trust it.",

    };

  }

return {

    tone: "success", Icon: ShieldCheck, badge: "No warnings found",

    title: "No obvious warning signs were found",

    description: "The URL did not trigger the rules checked by CyberMentis. This is not confirmation that the website is safe or legitimate.",

  };

}



function readableFinding(type) {

return FINDING_LABELS[type] ||

    String(type || "URL warning").replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

}



function FindingCard({ finding, index }) {

const severity = ["high", "medium", "low", "info"].includes(finding.severity)

? finding.severity : "info";

return (

    <article className={`url-result-finding severity-${severity}`}>

      <div className="url-result-finding-top">

        <div className="url-result-finding-icon"><AlertCircle size={19} /></div>

        <div className="url-result-finding-heading">

          <span className="url-result-eyebrow">Observation {index + 1}</span>

          <h4>{readableFinding(finding.type)}</h4>

        </div>

        <span className={`url-result-priority priority-${severity}`}>

          {severity === "high" ? "Important" : severity === "medium" ? "Worth checking" : "Information"}

        </span>

      </div>



      {finding.message && <p className="url-result-finding-summary">{finding.message}</p>}



      <div className="url-result-explanation">

        <div>

          <h5>Why did we notice this?</h5>

          <p>{finding.reason || "This URL contains a pattern that may need a closer look."}</p>

        </div>

        <div>

          <h5>Why could it matter?</h5>

          <p>{finding.potential_harm || "The link may need independent verification. This observation alone does not establish that it is malicious."}</p>

        </div>

      </div>



      <div className="url-result-action">

        <CheckCircle2 size={18} aria-hidden="true" />

        <div>

          <strong>What you can do</strong>

          <p>{finding.action || "Verify the address using a source you already trust before sharing sensitive information."}</p>

        </div>

      </div>

    </article>

  );

}



export function FindingsConsole({ findings = [] }) {

const items = Array.isArray(findings) ? findings : [];

return (

    <section className="url-result-findings" aria-labelledby="url-findings-heading">

      <div className="url-result-section-head">

        <div>

          <span className="url-result-eyebrow">UNDERSTAND THE RESULTS</span>

          <h3 id="url-findings-heading">What did we notice?</h3>

          <p>Each observation explains what we found, why it matters, and what you can do.</p>

        </div>

        <span className="url-result-count">{items.length} {items.length === 1 ? "observation" : "observations"}</span>

      </div>

      {items.length ? (

        <div className="url-result-finding-list">

          {items.map((finding, index) => (

            <FindingCard key={`${finding.type || "finding"}-${index}`} finding={finding} index={index} />

          ))}

        </div>

      ) : (

        <div className="url-result-empty">

          <ShieldCheck size={24} />

          <div>

            <h4>No warning patterns detected</h4>

            <p>None of the URL patterns checked by this tool were found. A website can still be unsafe even when its address looks normal.</p>

          </div>

        </div>

      )}

    </section>

  );

}



// DNS information is supplementary evidence, not a safety certificate.
// NetworkCalc records may be missing, delayed, or unavailable.
const DNS_RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA"];

const DNS_STATUS_TEXT = {
  resolved: "Records found",
  unknown: "Not confirmed",
  unavailable: "Service unavailable",
  skipped: "Lookup skipped",
  not_checked: "Not checked",
};

function formatDnsValue(value) {
  // Keep API objects readable instead of rendering [object Object].
  if (typeof value === "string" || typeof value === "number") return String(value);
  try { return JSON.stringify(value, null, 2); }
  catch { return "Unable to display record"; }
}

function DomainIntelligence({ intelligence, complete }) {
  if (!intelligence) return null;

  const records = intelligence.dns_records && typeof intelligence.dns_records === "object"
    ? intelligence.dns_records : {};
  const availableTypes = DNS_RECORD_TYPES.filter(
    (type) => Array.isArray(records[type]) && records[type].length > 0
  );
  const errors = Array.isArray(intelligence.errors) ? intelligence.errors : [];
  const dnsStatus = intelligence.dns_status || "unknown";
  const whoisStatus = intelligence.whois_status || "unknown";
  const age = intelligence.domain_age_days;

  return (
    <section className="url-result-intelligence" aria-labelledby="url-dns-heading">
      <div className="url-result-section-head">
        <div>
          <span className="url-result-eyebrow">DEEP SCAN / DOMAIN INTELLIGENCE</span>
          <h3 id="url-dns-heading">DNS &amp; registration details</h3>
          <p>Technical details collected without opening the submitted website.</p>
        </div>
        <Database size={21} aria-hidden="true" />
      </div>

      <div className="url-dns-summary">
        <div className="url-dns-stat">
          <span><Server size={15} /> DNS status</span>
          <strong>{DNS_STATUS_TEXT[dnsStatus] || "Unknown"}</strong>
        </div>
        <div className="url-dns-stat">
          <span><Globe2 size={15} /> WHOIS status</span>
          <strong>{whoisStatus === "available" ? "Registration data found" :
            whoisStatus === "skipped" ? "Lookup skipped" :
            whoisStatus === "unavailable" ? "Service unavailable" : "Not confirmed"}</strong>
        </div>
        <div className="url-dns-stat">
          <span><CalendarClock size={15} /> Domain age</span>
          <strong>{Number.isFinite(Number(age)) && age !== null && age !== undefined
            ? `${Number(age).toLocaleString()} days` : "Not available"}</strong>
        </div>
      </div>

      {intelligence.creation_date && (
        <p className="url-dns-created">Reported registration date: <strong>{intelligence.creation_date}</strong></p>
      )}

      <div className="url-dns-records">
        <h4>DNS records</h4>
        {availableTypes.length ? availableTypes.map((type) => (
          <div className="url-dns-record" key={type}>
            <span className="url-dns-type">{type}</span>
            <div className="url-dns-values">
              {records[type].map((value, index) => (
                <code key={`${type}-${index}`}>{formatDnsValue(value)}</code>
              ))}
            </div>
          </div>
        )) : (
          <p className="url-dns-empty">No recognized DNS records are available in this response. This does not prove that the domain is inactive or safe.</p>
        )}
      </div>

      {errors.length > 0 && (
        <div className="url-dns-errors" role="status">
          <AlertCircle size={17} aria-hidden="true" />
          <p>Some checks could not be completed: {errors.join(" ")}</p>
        </div>
      )}

      <div className="url-result-notice">
        <Info size={18} aria-hidden="true" />
        <p>{complete ? "Deep Scan completed its available lookups." : "Some Deep Scan information is incomplete."} DNS records and WHOIS data do not verify who operates a website or prove that it is trustworthy. The warning score is calculated independently.</p>
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

const [scanMode, setScanMode] = useState("smart");

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

const data = scanMode === "deep"
      ? await deepCheckUrl(submittedUrl)
      : await checkUrl(submittedUrl);

      setResult(data);

try {

        saveScan({ type: "url", input: submittedUrl, result: data });

      } catch (storageError) {

        console.warn("Could not save scan history:", storageError);

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



const verdict = result ? verdictDetails(result.verdict) : null;

const findings = Array.isArray(result?.findings) ? result.findings : [];

const score = Math.min(100, Math.max(0, Number(result?.risk_score) || 0));

const ip = result?.ip_info;

const ipDetails = ip ? (IP_DETAILS[ip.category] || ["IP address", "This address has not been checked against live reputation sources."]) : null;



return (

    <section className="url-checker-section soc-url-checker" id="url-checker" aria-labelledby="url-checker-title">

      {/* Existing scan workspace: class names and API behavior retained */}

      <div className="soc-workspace">

        <div className="soc-workspace-topbar">

          <div className="soc-workspace-brand">

            <div className="soc-brand-symbol"><Terminal size={18} /></div>

            <div>

              <span className="soc-micro-label">CyberMentis / SECURITY TOOLS</span>

              <h2 id="url-checker-title">URL Investigation</h2>

            </div>

          </div>

          <span className="soc-engine-status"><span className="soc-status-dot" />{scanMode === "deep" ? "DOMAIN INTELLIGENCE" : "STRUCTURAL ENGINE"}</span>

        </div>

        <div className="soc-workspace-intro">

          <span className="soc-micro-label">INVESTIGATION / 01</span>

          <h3>Analyze a suspicious destination.</h3>

          <p>Inspect the structure of a link without opening the website. Understand warning signs and potential risks before taking action.</p>

        </div>

        <form className="soc-scan-form" onSubmit={handleSubmit}>

          <label htmlFor="url-checker-input">TARGET URL</label>

          {/* Scan modes preserve the existing Smart Scan as the default. */}
        <div className="soc-scan-modes" role="group" aria-label="URL scan mode">
          <button type="button" className={`soc-mode-button ${scanMode === "smart" ? "is-active" : ""}`}
            aria-pressed={scanMode === "smart"} disabled={loading} onClick={() => setScanMode("smart")}>
            <ShieldCheck size={16} /> Smart Scan
          </button>
          <button type="button" className={`soc-mode-button ${scanMode === "deep" ? "is-active" : ""}`}
            aria-pressed={scanMode === "deep"} disabled={loading} onClick={() => setScanMode("deep")}>
            <Database size={16} /> Deep Scan
          </button>
        </div>
        <div className="soc-input-row">

            <div className="soc-input-shell">

              <Globe2 size={19} />

              <input

                id="url-checker-input"

                type="text"

                value={url}

                onChange={(event) => { setUrl(event.target.value); setError(""); }}

                placeholder="https\://example.com/login"

                maxLength={2048}

                disabled={loading}

                autoComplete="url"

                spellCheck={false}

                autoCapitalize="off"

                aria-describedby="soc-input-help"

              />

            </div>

            <button type="submit" className="soc-scan-button" disabled={loading || !url.trim()}>

              {loading ? <Activity size={18} /> : <Search size={18} />}

              {loading ? "Analyzing..." : scanMode === "deep" ? "Run Deep Scan" : "Analyze URL"}

            </button>

          </div>

          <div className="soc-input-footer">

            <span id="soc-input-help"><LockKeyhole size={14} />{scanMode === "deep" ? "No website visit · DNS/WHOIS checked via NetworkCalc" : "No website visit or DNS lookup"}</span>

            <span>HTTP / HTTPS</span>

          </div>

        </form>

        {error && <p className="soc-error" role="alert"><AlertTriangle size={17} />{error}</p>}

      </div>



      {/* Redesigned results begin here */}

      {result && verdict && (

        <div className="url-results" aria-live="polite">

          <div className="url-results-heading">

            <div>

              <span className="url-result-eyebrow">INVESTIGATION / COMPLETE</span>

              <h3>Your link check results</h3>

              <p>Here's what we found in the address you entered, explained in plain language.</p>

            </div>

            <button type="button" className="url-result-export" onClick={handleDownloadReport} disabled={generatingPdf}>

              <Download size={17} />{generatingPdf ? "Generating..." : "Download PDF"}

            </button>

          </div>



          <section className={`url-result-overview tone-${verdict.tone}`}>

            <div className="url-result-overview-main">

              <div className="url-result-verdict-icon"><verdict.Icon size={25} /></div>

              <div className="url-result-verdict-copy">

                <span className="url-result-badge">{verdict.badge}</span>

                <h3>{verdict.title}</h3>

                <p>{verdict.description}</p>

              </div>

            </div>

            <div className="url-result-score">

              <span className="url-result-eyebrow">WARNING SCORE</span>

              <div className="url-result-score-number"><strong>{score}</strong><span>/100</span></div>

              <div className="url-result-score-track"><span style={{ width: `${score}%` }} /></div>

              <p>This score adds up matched warning rules. It is not the chance that this link is a scam.</p>

            </div>

          </section>



          <section className="url-result-address" aria-label="Checked link details">

            <div className="url-result-section-head">

              <div>

                <span className="url-result-eyebrow">THE ADDRESS YOU ENTERED</span>

                <h3>About this link</h3>

              </div>

              <Globe2 size={20} aria-hidden="true" />

            </div>

            <div className="url-result-address-value">{result.url || url.trim()}</div>

            <div className="url-result-facts">

              <div>

                <span>Website address (hostname)</span>

                <strong>{result.hostname || "Not available"}</strong>

              </div>

              <div>

                <span>Connection type in the URL</span>

                <strong className="url-result-protocol">

                  {result.uses_https ? <LockKeyhole size={16} /> : <LockKeyholeOpen size={16} />}

                  {result.scheme_was_assumed ? "HTTPS assumed for analysis" : result.uses_https ? "HTTPS specified" : "HTTP specified"}

                </strong>

              </div>

              <div>

                <span>How the check works</span>

                <strong>Address text only — website not opened</strong>

              </div>

            </div>

            {result.scheme_was_assumed && (

              <div className="url-result-notice">

                <Info size={18} />

                <p>You didn't include <code>http\://</code> or <code>https\://</code>, so CyberMentis added HTTPS to interpret the address. This does <strong>not</strong> mean the website supports HTTPS or has a valid certificate.</p>

              </div>

            )}

            {!result.scheme_was_assumed && result.uses_https && (

              <div className="url-result-notice">

                <Info size={18} />

                <p>The link specifies HTTPS, which normally encrypts the connection. We haven't connected to the website to confirm its certificate, and HTTPS alone doesn't prove a website is trustworthy.</p>

              </div>

            )}

          </section>



          {ip && (

            <section className="url-result-ip" aria-label="IP address explanation">

              <div className="url-result-ip-icon"><Network size={20} /></div>

              <div>

                <span className="url-result-eyebrow">ADDITIONAL ADDRESS INFORMATION</span>

                <h3>{ipDetails[0]}</h3>

                <p>{ipDetails[1]}</p>

                <div className="url-result-ip-meta">

                  <span>Address: <strong>{ip.ip || result.hostname}</strong></span>

                  {ip.version && <span>IPv{ip.version}</span>}

                  <span>{ip.is_global ? "Globally routable range" : "Not globally routable"}</span>

                </div>

                <small>This classification is based on the IP address written in the URL, not a DNS lookup.</small>

              </div>

            </section>

          )}



          {/* Deep Scan details appear only when the API returns domain intelligence. */}
        {result.domain_intelligence && (
          <DomainIntelligence intelligence={result.domain_intelligence} complete={result.deep_scan_complete} />
        )}

        <FindingsConsole findings={findings} />



          <section className="url-result-guidance">

            <div className="url-result-section-head">

              <div>

                <span className="url-result-eyebrow">PRACTICAL SAFETY TIPS</span>

                <h3>What should you do next?</h3>

                <p>These steps are useful whether or not the tool detected a warning.</p>

              </div>

              <ShieldCheck size={22} aria-hidden="true" />

            </div>

            <div className="url-result-tips">

              {[

                "Check the full website address carefully, especially the name immediately before the first slash.",

                "For banking, payments, or account sign-ins, open the official app or type the known address yourself.",

                "Don't enter passwords, OTPs, or card details on a website you haven't independently verified.",

                "Remember that a padlock or HTTPS connection does not guarantee a website is genuine.",

              ].map((tip) => (

                <div key={tip} className="url-result-tip"><CheckCircle2 size={18} /><p>{tip}</p></div>

              ))}

            </div>

          </section>



          <div className="url-result-disclaimer">

            <Info size={18} />

            <p>{result.disclaimer || "CyberMentis analyzes URL warning patterns. Deep Scan additionally queries third-party DNS/WHOIS services, but does not visit the submitted website. No warnings does not guarantee safety."}</p>

          </div>

        </div>

      )}



      {!result && (

        <div className="soc-idle-footer">

          <span><Activity size={15} />AWAITING TARGET INPUT</span>

          <span>CyberMentis / URL SECURITY</span>

        </div>

      )}

    </section>

  );

}
