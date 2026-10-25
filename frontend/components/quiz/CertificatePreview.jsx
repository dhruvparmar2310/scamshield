
import { ShieldCheck, Award, CheckCircle2 } from "lucide-react";

export default function CertificatePreview ({
    fullName = "",
    percentage = 0,
    difficulty = "easy",
    completedAt,
}) {
    const date = completedAt
        ? new Date(completedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "—";

    const displayName = fullName.trim() || "Your Full Name";

    const displayDifficulty =
        difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    return (
        <div className="certificate-design">
            <div className="certificate-design-inner">
                <header className="certificate-top">
                    <div className="certificate-brand">
                        <ShieldCheck size={17} strokeWidth={1.8} />
                        <strong>CyberMentis</strong>
                    </div>

                    <span className="certificate-type">
                        Cybersecurity Awareness
                    </span>
                </header>

                <div className="certificate-main">
                    <div className="certificate-emblem">
                        <Award size={26} strokeWidth={1.5} />
                    </div>

                    <span className="certificate-overline">
                        CERTIFICATE OF ACHIEVEMENT
                    </span>

                    <h2 className="certificate-title">
                        Certificate of Completion
                    </h2>

                    <p className="certificate-intro">
                        This certificate is proudly presented to
                    </p>

                    <h3 className="certificate-name">
                        {displayName}
                    </h3>

                    <div className="certificate-name-divider" />

                    <p className="certificate-description">
                        For successfully completing the
                    </p>

                    <h4 className="certificate-course">
                        Foundations of Cybersecurity Awareness
                    </h4>

                    <p className="certificate-description certificate-description-bottom">
                        In recognition of successfully demonstrating cybersecurity awareness, identifying digital threats, and understanding safe online practices. This achievement marks a meaningful step toward a safer digital world and a continued journey of learning in cybersecurity.
                    </p>
                </div>

                <div className="certificate-achievement">
                    <div className="certificate-achievement-item">
                        <span>ASSESSMENT SCORE</span>
                        <strong>{percentage}%</strong>
                    </div>

                    <div className="certificate-achievement-separator" />

                    <div className="certificate-achievement-item">
                        <span>DIFFICULTY LEVEL</span>
                        <strong>{displayDifficulty}</strong>
                    </div>

                    <div className="certificate-achievement-separator" />

                    <div className="certificate-achievement-item">
                        <span>STATUS</span>
                        <strong className="certificate-completed">
                            <CheckCircle2 size={14} />
                            Completed
                        </strong>
                    </div>
                </div>

                <footer className="certificate-bottom">
                    <div className="certificate-date">
                        <strong>{date}</strong>
                        <span>DATE OF COMPLETION</span>
                    </div>

                    <div className="certificate-issuer">
                        <strong>CyberMentis</strong>
                        <span>ISSUED BY CyberMentis</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
