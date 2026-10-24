import Head from "next/head";
import ScanHistory from "../components/scan-history/ScanHistory";

export default function ScanHistoryPage() {
  return (
    <>
      <Head>
        <title>Scan History | CyberMentis</title>
        <meta
          name="description"
          content="Review saved message and URL scan summaries in CyberMentis."
        />
      </Head>

      <main className="feature-page scan-history-page">
        <div className="feature-page-intro">
          <span className="section-kicker">YOUR RECENT ACTIVITY</span>
          <h1>Scan history.</h1>
          <p>
            Review saved scan summaries by category. Your history stays in this
            browser and is not synchronized across devices.
          </p>
        </div>

        <ScanHistory />
      </main>
    </>
  );
}