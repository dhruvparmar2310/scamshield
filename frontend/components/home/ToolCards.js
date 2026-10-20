import Link from "next/link";

const tools = [
  {
    number: "01",
    icon: "✳",
    title: "Scam Message Checker",
    description:
      "Analyze suspicious SMS messages, emails, and other text for urgency, sensitive-information requests, and common scam warning signs.",
    href: "/scam-checker",
    action: "Analyze a message",
  },
  {
    number: "02",
    icon: "↗",
    title: "URL Safety Checker",
    description:
      "Inspect a URL for common structural warning signs, including insecure protocols, unusual domain patterns, and suspicious URL formatting.",
    href: "/url-checker",
    action: "Check a URL",
  },
  {
    number: "03",
    icon: "◷",
    title: "Scan History",
    description:
      "Review saved message and URL scan summaries, check findings, and remove individual records or clear your history.",
    href: "/scan-history",
    action: "Review scan history",
  },
];

export default function ToolCards() {
  return (
    <section className="tools-section" aria-labelledby="tools-title">
      <div className="tools-intro">
        <span className="section-kicker">YOUR SECURITY WORKSPACE</span>
        <h2 id="tools-title">Choose your tool.</h2>
        <p className="hero-description">
          Start with the check that matches what you want to investigate.
        </p>
      </div>

      <div className="tools-grid">
        {tools.map((tool) => (
          <Link href={tool.href} className="tool-card" key={tool.href}>
            <div className="tool-card-top">
              <span className="tool-icon" aria-hidden="true">
                {tool.icon}
              </span>
              <span className="tool-number">{tool.number}</span>
            </div>

            <h3>{tool.title}</h3>
            <p>{tool.description}</p>

            <div className="tool-card-action">
              {tool.action}
              <span aria-hidden="true">↗</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}