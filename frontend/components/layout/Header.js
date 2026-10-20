import Link from "next/link";
import { useRouter } from "next/router";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/scam-checker", label: "Message Checker" },
  { href: "/url-checker", label: "URL Checker" },
  { href: "/scan-history", label: "Scan History" },
];

export default function Header() {
  const router = useRouter();

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="ScamShield home">
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

      <nav className="header-nav" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? router.pathname === "/"
              : router.pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "nav-link-active" : ""}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}