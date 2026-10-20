import Head from "next/head";
import ScamMessageChecker from "../components/scam-checker/ScamMessageChecker";

export default function ScamCheckerPage() {
  return (
    <>
      <Head>
        <title>Scam Message Checker | ScamShield</title>
        <meta
          name="description"
          content="Analyze suspicious messages for common scam warning signs with ScamShield."
        />
      </Head>

      <main className="feature-page">
        <ScamMessageChecker />
      </main>
    </>
  );
}