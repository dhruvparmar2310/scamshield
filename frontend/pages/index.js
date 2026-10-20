import Head from "next/head";
import Hero from "../components/home/Hero";
import ToolCards from "../components/home/ToolCards";
import PrivacyNotice from "../components/home/PrivacyNotice";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>ScamShield | Cybersecurity Awareness Toolkit</title>
        <meta
          name="description"
          content="Analyze suspicious messages, inspect URLs, and review scan history with ScamShield, an educational cybersecurity awareness tool."
        />
      </Head>

      <div className="home-container">
        <Hero />
        <ToolCards />
        <PrivacyNotice />
      </div>
    </>
  );
}