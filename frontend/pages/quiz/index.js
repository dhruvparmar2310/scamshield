import Head from "next/head";
import CyberQuiz from "../../components/quiz/CyberQuiz";

export default function CyberQuizPage() {
  return (
    <>
      <Head>
        <title>Free Cybersecurity Quiz | CyberMentis</title>

        <meta
          name="description"
          content="Test your cybersecurity knowledge with free interactive quizzes, real-world phishing scenarios, multi-select questions, and instant percentage-based results."
        />
      </Head>

      <main className="feature-page">
        <div className="feature-page-intro">
          <span className="section-kicker">
            CYBERSECURITY LEARNING & AWARENESS
          </span>

          <h1>Cybersecurity Quiz.</h1>

          <p>
            Learn to identify phishing attempts, scams, and
            everyday security risks. Test your knowledge through
            interactive questions and realistic scenarios.
          </p>
        </div>

        <CyberQuiz />
      </main>
    </>
  );
}