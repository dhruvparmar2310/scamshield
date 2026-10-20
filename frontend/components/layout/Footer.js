import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand-block">
        <Link href="/" className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>

          <span>ScamShield</span>
        </Link>

        <p>Built to help people think before they click.</p>
      </div>

      <div className="footer-credit">
        <p>
          Developed by{" "}
          <a
            href="https://dhanparmar.netlify.app"
            target="_blank"
            rel="noreferrer"
          >
            Dhruv Parmar
          </a>
        </p>

        <span>
          Created for educational purposes to support cybersecurity awareness.
          ScamShield is not a guarantee that a message or URL is safe.
        </span>
      </div>

      <p className="footer-disclaimer">
        Educational use only · Stay alert online.
      </p>
    </footer>
  );
}