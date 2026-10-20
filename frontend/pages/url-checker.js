import Head from "next/head";
import URLSafetyChecker from "../components/url-checker/URLSafetyChecker";

export default function URLCheckerPage() {
  return (
    <>
      <Head>
        <title>URL Safety Checker | ScamShield</title>
        <meta
          name="description"
          content="Inspect URLs for common structural warning signs with ScamShield."
        />
      </Head>

      <main className="feature-page">
        <div className="feature-page-intro">
          <span className="section-kicker">LINK INSPECTION</span>
          <h1>URL Safety Checker.</h1>
          <p>
            Inspect a link for common warning signs before opening it. This
            check does not guarantee that a website is safe or malicious.
          </p>
        </div>

        <URLSafetyChecker />
      </main>
    </>
  );
}