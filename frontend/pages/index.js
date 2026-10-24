import Head from "next/head";
import Hero from "../components/home/Hero";
import ToolCards from "../components/home/ToolCards";
import PrivacyNotice from "../components/home/PrivacyNotice";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>
          CyberMentis | Cybersecurity Awareness Toolkit
        </title>

        <meta
          name="description"
          content="Analyze suspicious messages, inspect URLs, test your cybersecurity knowledge with interactive quizzes, and review scan history using CyberMentis's free security awareness toolkit."
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