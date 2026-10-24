import Head from "next/head";
import URLSafetyChecker from "../components/url-checker/URLSafetyChecker";

export default function URLCheckerPage() {
  return (
    <>
      <Head>
        <title>Free URL Safety Checker | CyberMentis</title>

        <meta
          name="description"
          content="Check suspicious links for phishing warning signs, misleading domains, private IP addresses, and unsafe URL structures. Understand potential risks before clicking."
        />
      </Head>

      <main className="feature-page">
        <div className="feature-page-intro">
          <span className="section-kicker">
            LINK SECURITY & AWARENESS
          </span>

          <h1>URL Safety Checker.</h1>

          <p>
            Received a suspicious link? Check its structure
            without opening the website. CyberMentis helps
            you identify warning signs, understand potential
            risks, and learn how to protect your information.
          </p>
        </div>

        <URLSafetyChecker />
      </main>
    </>
  );
}