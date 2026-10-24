
import Head from "next/head";
import Link from "next/link";

const LAST_UPDATED = "October 24, 2026";

const policySections = [
  {
    id: "information-we-process",
    title: "01. Information We Process",
    paragraphs: [
      "CyberMentis provides cybersecurity awareness and analysis tools that help users identify potential warning signs in suspicious messages, links, and other digital content.",
      "When you use a tool, the information you choose to submit may be transmitted to our backend for analysis. We do not require your name, password, banking credentials, OTP, or other sensitive personal information to use our current analysis tools.",
      "Please do not submit passwords, OTPs, payment card details, government identification numbers, private account information, or other confidential data.",
    ],
  },
  {
    id: "how-tools-work",
    title: "02. How Our Security Tools Work",
    paragraphs: [
      "Our current message and URL checking tools use rule-based analysis to identify possible warning signs, such as suspicious wording, requests for sensitive information, unusual URL structures, and insecure connections.",
      "Analysis results are generated for informational and educational purposes. They are not a definitive determination of whether a message, website, sender, or activity is legitimate, malicious, or safe.",
      "Unless a particular tool explicitly states otherwise, CyberMentis does not verify website ownership, inspect remote website content, or consult live threat intelligence or reputation databases.",
    ],
  },
  {
    id: "storage-and-history",
    title: "03. Data Storage and Scan History",
    paragraphs: [
      "Our current analysis tools do not intentionally save submitted messages or URLs to a persistent application database on our server.",
      "If you use Scan History, limited information such as a shortened preview, scan type, risk score, findings, and scan date may be saved in your browser's local storage. This information remains on your device unless you or your browser remove it.",
      "You can delete individual history entries or clear your scan history using the controls provided by CyberMentis. Clearing browser storage may also remove saved history.",
      "Browser local storage is not encrypted by CyberMentis. Avoid analyzing sensitive or confidential content, especially on shared devices.",
    ],
  },
  {
    id: "security",
    title: "04. Security and Responsible Use",
    paragraphs: [
      "We aim to minimize the information required to provide our tools and apply reasonable safeguards within the application's design.",
      "No website, internet transmission, or automated analysis system can guarantee complete security. Network infrastructure, hosting providers, browsers, and other technical services may process limited technical information required to operate the website.",
      "You should never provide login credentials, OTPs, recovery codes, banking PINs, or other authentication secrets to CyberMentis.",
    ],
  },
  {
    id: "accuracy-and-limitations",
    title: "05. Accuracy, Limitations and Disclaimer",
    paragraphs: [
      "CyberMentis is an educational cybersecurity awareness platform. Its results may contain false positives, false negatives, incomplete findings, or outdated indicators.",
      "A low risk score or a result showing no obvious warning signs does not mean that a message, link, website, or sender is safe. Likewise, a high risk score does not conclusively establish that something is fraudulent.",
      "Always independently verify suspicious communications through official websites, trusted contact information, or appropriate authorities. Do not rely exclusively on CyberMentis to make financial, legal, security, or personal safety decisions.",
    ],
  },
  {
    id: "third-party-services",
    title: "06. Third-Party Services",
    paragraphs: [
      "CyberMentis may use third-party hosting, infrastructure, and delivery services to operate the website. These services may process technical information, such as IP addresses and request metadata, according to their own practices.",
      "If we introduce third-party integrations, automated email analysis, advertising, analytics, or other services that affect how personal information is processed, we will update this policy to describe those practices.",
      "Links to external websites, including official cybercrime reporting resources, are provided for convenience. Their content and privacy practices are outside CyberMentis's control.",
    ],
  },
  {
    id: "cookies",
    title: "07. Cookies and Browser Storage",
    paragraphs: [
      "Our current Scan History functionality uses browser local storage to remember previous analysis results on your device.",
      "This policy does not claim that all infrastructure providers or future integrations are cookie-free. If analytics, advertising, or other technologies requiring additional disclosures or consent are introduced, we will update the relevant notices and controls.",
    ],
  },
  {
    id: "children",
    title: "08. Children's Privacy",
    paragraphs: [
      "CyberMentis provides general cybersecurity education. Children should use online safety tools with appropriate parental or guardian guidance.",
      "We do not intentionally request personal information from children through our current checking tools.",
    ],
  },
  {
    id: "changes",
    title: "09. Changes to This Policy",
    paragraphs: [
      "We may revise this Privacy Policy when CyberMentis introduces new tools, changes its data handling practices, or updates its infrastructure.",
      "The latest version will be published on this page with a revised last-updated date. Significant changes to data processing may require additional notices or user choices.",
    ],
  },
  {
    id: "contact",
    title: "10. Contact and Privacy Questions",
    paragraphs: [
      "For questions about this Privacy Policy, the operation of CyberMentis, or concerns about data handling, please use the contact information published on our website.",
      "We encourage users to report unexpected tool behavior without including passwords, OTPs, or other confidential information.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy | CyberMentis</title>
        <meta
          name="description"
          content="Understand how CyberMentis processes information, stores local scan history, and provides educational cybersecurity analysis tools."
        />
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="privacy-policy-page">
        <div className="privacy-policy-container">
          <div className="privacy-policy-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Privacy Policy</span>
          </div>

          <header className="privacy-policy-hero">
            <span className="privacy-policy-eyebrow">
              TRANSPARENCY & DIGITAL TRUST
            </span>

            <h1>
              Your privacy.
              <br />
              <span>Our responsibility.</span>
            </h1>

            <p>
              Learn how CyberMentis handles information, protects user
              awareness, and explains the limitations of its cybersecurity
              tools.
            </p>

            <div className="privacy-policy-meta">
              <span>Last updated: {LAST_UPDATED}</span>
              <span className="privacy-policy-meta-divider" />
              <span>Applies to all CyberMentis tools</span>
            </div>
          </header>

          <div className="privacy-policy-highlights">
            <article className="privacy-policy-highlight">
              <span className="privacy-policy-highlight-icon">01</span>
              <h3>No account required</h3>
              <p>
                Our current analysis tools can be used without creating
                an account.
              </p>
            </article>

            <article className="privacy-policy-highlight">
              <span className="privacy-policy-highlight-icon">02</span>
              <h3>Local scan history</h3>
              <p>
                Saved scan previews and results remain in your browser's
                local storage.
              </p>
            </article>

            <article className="privacy-policy-highlight">
              <span className="privacy-policy-highlight-icon">03</span>
              <h3>Educational analysis</h3>
              <p>
                Tool findings highlight potential risks, not guarantees
                of safety.
              </p>
            </article>
          </div>

          <div className="privacy-policy-layout">
            <aside className="privacy-policy-sidebar">
              <div className="privacy-policy-sidebar-inner">
                <h2>On this page</h2>
                <nav aria-label="Privacy policy sections">
                  {policySections.map((section) => (
                    <a key={section.id} href={`#${section.id}`}>
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="privacy-policy-content">
              <div className="privacy-policy-introduction">
                <h2>Our commitment to transparency</h2>
                <p>
                  CyberMentis is built to help people recognize potential
                  online scams and develop safer digital habits. We believe
                  that users should understand what information a tool
                  processes, where information may be stored, and what its
                  results can and cannot tell them.
                </p>
                <p>
                  This policy applies to CyberMentis's website and current
                  cybersecurity checking tools. Additional services may
                  require updates to this policy before they are launched.
                </p>
              </div>

              {policySections.map((section) => (
                <section
                  className="privacy-policy-section"
                  id={section.id}
                  key={section.id}
                >
                  <h2>{section.title}</h2>

                  {section.paragraphs.map((paragraph, index) => (
                    <p key={`${section.id}-${index}`}>
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}

              <div className="privacy-policy-notice">
                <span className="privacy-policy-notice-label">
                  IMPORTANT SAFETY REMINDER
                </span>
                <h3>Never rely on a scan result alone.</h3>
                <p>
                  A message or URL can appear harmless while still being
                  dangerous. Verify independently before clicking links,
                  sending money, downloading files, or sharing personal
                  information.
                </p>
              </div>

              <div className="privacy-policy-bottom">
                <h2>Explore CyberMentis safely</h2>
                <p>
                  Return to our tools and continue learning about
                  cybersecurity with a better understanding of how
                  your information is handled.
                </p>
                <Link href="/" className="privacy-policy-home-link">
                  Back to homepage <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
