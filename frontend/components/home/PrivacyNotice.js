export default function PrivacyNotice() {
    return (
      <section className="dashboard-privacy" aria-labelledby="privacy-title">
        <div className="privacy-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            <path d="M12 14v3" />
          </svg>
        </div>
  
        <div>
          <h2 id="privacy-title">Your safety includes your privacy.</h2>
          <p>
            Scan history is saved in this browser's local storage. Message and URL
            analysis requests are sent to the configured backend. Avoid submitting
            passwords, OTPs, financial details, or other sensitive information.
            Local storage is not encrypted, and saved history may be accessible to
            anyone using your browser profile.
          </p>
        </div>
      </section>
    );
  }