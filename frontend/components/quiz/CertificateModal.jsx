import { useEffect, useRef, useState } from "react";
import { Award, Download, X } from "lucide-react";
import CertificatePreview from "./CertificatePreview";

import {
    generateQuizCertificate,
} from "../../services/generateQuizCertificate";

export default function CertificateModal ({
    open,
    onClose,
    result,
    difficulty = "easy",
    completedAt,
}) {
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const nameRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        nameRef.current?.focus();

        const onEscape = (event) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onEscape);

        return () => window.removeEventListener("keydown", onEscape);
    }, [open, onClose]);

    if (!open) return null;

    const handleDownload = async (event) => {
        event.preventDefault();

        if (isGenerating) return;

        setError("");
        setIsGenerating(true);

        try {
            generateQuizCertificate({
                recipientName: fullName,
                result,
                difficulty,
                completedAt,
            });

            onClose();
        } catch (err) {
            setError(err.message || "Unable to generate certificate.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div
            className="quiz-certificate-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="quiz-certificate-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="certificate-modal-title"
            >
                <button
                    type="button"
                    className="quiz-certificate-close"
                    aria-label="Close certificate dialog"
                    onClick={onClose}
                >
                    <X size={19} />
                </button>

                <div className="quiz-certificate-icon">
                    <Award size={25} />
                </div>

                <span className="quiz-eyebrow">
                    Certificate of achievement
                </span>

                <h2 id="certificate-modal-title">
                    Your achievement deserves recognition.
                </h2>

                <p>
                    Enter your full name exactly as you want it to appear
                    on your certificate.
                </p>

                <CertificatePreview
                    fullName={fullName}
                    percentage={result.percentage}
                    difficulty={difficulty}
                    completedAt={completedAt}
                />

                <form onSubmit={handleDownload}>
                    <label htmlFor="certificate-full-name">
                        Full name (as it should appear on the certificate)
                    </label>

                    <input
                        id="certificate-full-name"
                        type="text"
                        autoComplete="name"
                        value={fullName}
                        maxLength={70}
                        required
                        placeholder="e.g. Alex Morgan"
                        onChange={(event) => {
                            setFullName(event.target.value);
                            setError("");
                        }}
                    />

                    {error && (
                        <p className="quiz-certificate-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="quiz-primary-button"
                        disabled={isGenerating}
                    >
                        <Download size={17} />
                        {isGenerating
                            ? "Generating certificate..."
                            : "Download PDF Certificate"}
                    </button>
                </form>

                <p className="quiz-certificate-note">
                    Your name is used locally to generate the PDF.
                    No account or payment is required.
                </p>
            </div>
        </div>
    );
}