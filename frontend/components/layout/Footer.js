import Link from "next/link";
import logo from '../../public/logo.png'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand-block">
        <Link href="/" className="brand footer-brand">
          <img src={logo.src} alt='CyberMentis | CyberSecurity Awareness Platform' />
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
          CyberMentis is not a guarantee that a message or URL is safe.
        </span>
      </div>

      <Link href="/privacy-policy">Privacy Policy</Link>
    </footer>
  );
}