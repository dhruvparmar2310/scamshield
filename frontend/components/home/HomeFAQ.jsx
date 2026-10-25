
import { useState } from "react";
import Link from "next/link";

import {
    ArrowUpRight,
    CheckCircle2,
    ChevronRight,
    CircleHelp,
    GraduationCap,
    Headphones,
    LockKeyhole,
    MessageSquareWarning,
    Minus,
    Plus,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

// ============================================================
// CYBERMENTIS — HOME FAQ
// ============================================================

const FAQ_ITEMS = [
    {
        id: "faq-01",
        category: "General",
        question: "What is CyberMentis?",
        answer:
            "CyberMentis is a cybersecurity awareness platform designed to help you make safer decisions online. It offers tools for analyzing suspicious messages and URLs, along with an interactive assessment to test your cybersecurity knowledge.",
    },
    {
        id: "faq-02",
        category: "Tools",
        question: "How does CyberMentis help identify suspicious messages?",
        answer:
            "CyberMentis analyzes the text of suspicious messages and highlights potential warning signs, such as phishing attempts, urgent requests, deceptive wording, and common scam patterns. The results are intended to help you recognize risks and make more informed decisions.",
    },
    {
        id: "faq-03",
        category: "Tools",
        question: "Can the URL Safety Checker tell me if a website is safe?",
        answer:
            "The URL Safety Checker examines suspicious links for potential security indicators and provides insights to help you assess their risks. However, no automated tool can guarantee that a website is completely safe. Always verify unfamiliar websites independently before entering sensitive information.",
    },
    {
        id: "faq-04",
        category: "General",
        question: "Is CyberMentis free to use?",
        answer:
            "Yes. CyberMentis provides free access to its cybersecurity awareness tools and knowledge assessment. You can explore the platform, analyze suspicious content, and test your understanding without purchasing a course.",
    },
    {
        id: "faq-05",
        category: "Assessment",
        question: "What is the Foundations of Cybersecurity Awareness assessment?",
        answer:
            "It is an interactive knowledge assessment designed to test your understanding of cybersecurity fundamentals, phishing, online scams, digital threats, and safe online practices. It combines questions of varying difficulty and practical scenarios to help you evaluate your awareness.",
    },
    {
        id: "faq-06",
        category: "Certificate",
        question: "Will I receive a certificate after completing the assessment?",
        answer:
            "Yes. If you achieve the required passing score of 75% or higher, you can generate a personalized Certificate of Achievement titled 'Foundations of Cybersecurity Awareness.' It recognizes your demonstrated knowledge and can be shared as a personal learning milestone. It is not a professional certification or evidence of completing a course.",
    },
    {
        id: "faq-07",
        category: "Privacy",
        question: "Should I paste personal or sensitive information into the tools?",
        answer:
            "For your safety, avoid submitting passwords, OTPs, banking details, private identification numbers, or other confidential information. Remove or mask sensitive details before analyzing a suspicious message or link.",
    },
    {
        id: "faq-08",
        category: "Assessment",
        question: "Do I need cybersecurity experience to take the quiz?",
        answer:
            "Not at all. The assessment includes foundational concepts as well as more challenging questions. Whether you are a student, beginner, or someone interested in digital safety, it is a useful way to test your existing knowledge and identify areas for further learning.",
    },
];

// ============================================================
// FAQ ITEM
// ============================================================

function FAQItem({ item, index, isOpen, onToggle }) {
    const panelId = `home-faq-panel-${index}`;
    const buttonId = `home-faq-button-${index}`;

    return (
        <article
            className={`home-faq-item ${
                isOpen ? "is-open" : ""
            }`}
        >
            <h3 className="home-faq-question-heading">
                <button
                    id={buttonId}
                    type="button"
                    className="home-faq-question"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={onToggle}
                >
                    <span className="home-faq-question-content">
                        <span className="home-faq-number">
                            {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="home-faq-question-text">
                            {item.question}
                        </span>
                    </span>

                    <span
                        className="home-faq-toggle-icon"
                        aria-hidden="true"
                    >
                        {isOpen ? (
                            <Minus size={18} />
                        ) : (
                            <Plus size={18} />
                        )}
                    </span>
                </button>
            </h3>

            <div
                id={panelId}
                className="home-faq-answer-wrapper"
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
            >
                <div className="home-faq-answer">
                    <p>{item.answer}</p>

                    <span className="home-faq-category">
                        {item.category}
                    </span>
                </div>
            </div>
        </article>
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function HomeFAQ() {
    const [activeFAQ, setActiveFAQ] = useState(0);

    const toggleFAQ = (index) => {
        setActiveFAQ((current) =>
            current === index ? null : index
        );
    };

    return (
        <section
            id="faq"
            className="home-faq"
            aria-labelledby="home-faq-title"
        >
            {/* BACKGROUND DECORATION */}

            <div
                className="home-faq-background-glow"
                aria-hidden="true"
            />

            <div className="home-faq-container">
                <div className="home-faq-layout">
                    {/* ====================================
                        LEFT: INTRODUCTION
                    ==================================== */}

                    <div className="home-faq-intro">
                        <span className="home-faq-eyebrow">
                            <Sparkles size={14} />

                            FREQUENTLY ASKED QUESTIONS
                        </span>

                        <h2 id="home-faq-title">
                            Questions?
                            <br />
                            <span>
                                We&apos;ve got answers.
                            </span>
                        </h2>

                        <p className="home-faq-description">
                            Everything you need to know about
                            CyberMentis, our security tools,
                            and your journey toward better
                            cybersecurity awareness.
                        </p>

                        {/* TRUST POINTS */}

                        <div className="home-faq-highlights">
                            <div>
                                <CheckCircle2 size={17} />

                                <span>
                                    Simple, clear explanations
                                </span>
                            </div>

                            <div>
                                <ShieldCheck size={17} />

                                <span>
                                    Security awareness first
                                </span>
                            </div>

                            <div>
                                <GraduationCap size={17} />

                                <span>
                                    Learn through assessment
                                </span>
                            </div>
                        </div>

                        {/* INFORMATION CARD */}

                        <div className="home-faq-info-card">
                            <div className="home-faq-info-icon">
                                <CircleHelp size={21} />
                            </div>

                            <div className="home-faq-info-content">
                                <h3>
                                    New to cybersecurity?
                                </h3>

                                <p>
                                    Start by exploring common
                                    digital threats, then test
                                    what you know with our
                                    awareness assessment.
                                </p>

                                <Link href="/quiz">
                                    Explore the assessment

                                    <ArrowUpRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* ====================================
                        RIGHT: FAQ ACCORDION
                    ==================================== */}

                    <div className="home-faq-content">
                        <div className="home-faq-list-heading">
                            <div>
                                <span className="home-faq-list-eyebrow">
                                    HELP CENTER
                                </span>

                                <h3>
                                    Common questions
                                </h3>
                            </div>

                            <span className="home-faq-count">
                                {String(
                                    FAQ_ITEMS.length
                                ).padStart(2, "0")}{" "}
                                FAQs
                            </span>
                        </div>

                        <div className="home-faq-list">
                            {FAQ_ITEMS.map((item, index) => (
                                <FAQItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    isOpen={
                                        activeFAQ === index
                                    }
                                    onToggle={() =>
                                        toggleFAQ(index)
                                    }
                                />
                            ))}
                        </div>

                        {/* BOTTOM MESSAGE */}

                        <div className="home-faq-bottom-note">
                            <LockKeyhole size={16} />

                            <p>
                                Remember: security tools
                                provide guidance, but staying
                                alert and verifying suspicious
                                requests is always important.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ====================================
                    BOTTOM CTA
                ==================================== */}

                <div className="home-faq-cta">
                    <div className="home-faq-cta-icon">
                        <MessageSquareWarning size={23} />
                    </div>

                    <div className="home-faq-cta-content">
                        <span>
                            STAY INFORMED. STAY SECURE.
                        </span>

                        <h3>
                            Ready to explore CyberMentis?
                        </h3>

                        <p>
                            Discover our tools and take the
                            next step toward smarter digital
                            safety.
                        </p>
                    </div>

                    <Link
                        href="/#how-it-works"
                        className="home-faq-cta-button"
                    >
                        Explore Our Tools

                        <ArrowUpRight size={17} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
