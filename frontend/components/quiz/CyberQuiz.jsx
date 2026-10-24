import { useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    RotateCcw,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    CircleHelp,
    BookOpen,
    AlertTriangle,
    Trophy,
    Check,
    Award, Download
} from "lucide-react";

import {
    createQuiz,
    calculateQuizResult,
    saveQuizHistory,
} from "../../services/quizEngine";
import CertificateModal from "./CertificateModal";

const CERTIFICATE_PASS_PERCENTAGE = 75;
const QUESTION_COUNT = 5;
const DIFFICULTY = "easy";

const getQuestionType = (question) => {
    if (question.type === "scenario") return "Scenario";
    if (question.selectionMode === "multiple") return "Multi-select";
    return "Single-select";
};

const getPerformanceMessage = (percentage) => {
    if (percentage === 100) {
        return "Excellent! You answered every question correctly.";
    }

    if (percentage >= 80) {
        return "Great work! You have a strong understanding of the basics.";
    }

    if (percentage >= 60) {
        return "Good progress. Review the missed questions to improve.";
    }

    return "Keep learning. Review the explanations and try again.";
};

export default function CyberQuiz () {
    const [phase, setPhase] = useState("setup");
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [showReview, setShowReview] = useState(false);
    const [confirmSubmit, setConfirmSubmit] = useState(false);

    const [certificateOpen, setCertificateOpen] = useState(false);
    const [completedAt, setCompletedAt] = useState(null);

    const startQuiz = () => {
        const newQuestions = createQuiz({
            difficulty: DIFFICULTY,
            count: QUESTION_COUNT,
        });

        setQuestions(newQuestions);
        setCurrentIndex(0);
        setAnswers({});
        setResult(null);
        setShowReview(false);
        setConfirmSubmit(false);
        setPhase("quiz");

        setCertificateOpen(false);
        setCompletedAt(null);
    };

    const selectAnswer = (question, optionId) => {
        setAnswers((previous) => {
            const existing = previous[question.id] || [];

            if (question.selectionMode === "multiple") {
                const updated = existing.includes(optionId)
                    ? existing.filter((id) => id !== optionId)
                    : [...existing, optionId];

                return {
                    ...previous,
                    [question.id]: updated,
                };
            }

            return {
                ...previous,
                [question.id]: [optionId],
            };
        });
    };

    const submitQuiz = () => {
        const calculated = calculateQuizResult(questions, answers);

        console.table(
            calculated.details.map((item) => ({
                questionId: item.question.id,
                selectionMode: item.question.selectionMode,
                selected: item.selected.join(", "),
                expected: item.question.correctAnswers.join(", "),
                isCorrect: item.isCorrect,
            }))
        );

        console.log("Final quiz result:", {
            correct: calculated.correct,
            incorrect: calculated.incorrect,
            unanswered: calculated.unanswered,
            percentage: calculated.percentage,
        });

        setResult(calculated);
        setCompletedAt(new Date().toISOString());

        saveQuizHistory(calculated, DIFFICULTY);

        setConfirmSubmit(false);
        setShowReview(false);
        setCertificateOpen(false);
        setPhase("result");
    };

    const answeredCount = questions.filter(
        (question) => (answers[question.id] || []).length > 0
    ).length;

    const currentQuestion = questions[currentIndex];

    // --------------------------------------------------
    // QUIZ SETUP
    // --------------------------------------------------

    if (phase === "setup") {
        return (
            <section className="quiz-shell">
                <div className="quiz-setup">
                    <div className="quiz-setup-icon">
                        <ShieldCheck size={28} />
                    </div>

                    <span className="quiz-eyebrow">Cybersecurity training</span>

                    <h2>Test your security awareness.</h2>

                    <p>
                        Practice identifying scams, phishing attempts,
                        suspicious links, and common online security risks
                        through real-world scenarios.
                    </p>

                    <div className="quiz-setup-meta">
                        <div>
                            <span>Difficulty</span>
                            <strong>Easy</strong>
                        </div>

                        <div>
                            <span>Questions</span>
                            <strong>05</strong>
                        </div>

                        <div>
                            <span>Question formats</span>
                            <strong>Mixed</strong>
                        </div>

                        <div>
                            <span>Cost</span>
                            <strong>Free</strong>
                        </div>
                    </div>

                    <div className="quiz-setup-info">
                        <CircleHelp size={17} />
                        <p>
                            Questions are randomly selected. Some require one
                            answer, while others require multiple correct answers.
                            You can review explanations after submitting.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="quiz-primary-button"
                        onClick={startQuiz}
                    >
                        Start quiz
                        <ArrowRight size={17} />
                    </button>
                </div>
            </section>
        );
    }

    // --------------------------------------------------
    // QUIZ IN PROGRESS
    // --------------------------------------------------

    if (phase === "quiz" && currentQuestion) {
        const selected = answers[currentQuestion.id] || [];
        const progress = ((currentIndex + 1) / questions.length) * 100;
        const isMultiple = currentQuestion.selectionMode === "multiple";

        return (
            <section className="quiz-shell">
                <div className="quiz-workspace">
                    <div className="quiz-workspace-header">
                        <div>
                            <span className="quiz-eyebrow">
                                Cybersecurity awareness
                            </span>

                            <h2>Knowledge assessment</h2>
                        </div>

                        <span className="quiz-level">Easy level</span>
                    </div>

                    <div className="quiz-progress">
                        <div className="quiz-progress-labels">
                            <span>
                                Question {currentIndex + 1} of {questions.length}
                            </span>

                            <span>{answeredCount} answered</span>
                        </div>

                        <div
                            className="quiz-progress-track"
                            role="progressbar"
                            aria-label="Quiz progress"
                            aria-valuenow={currentIndex + 1}
                            aria-valuemin={0}
                            aria-valuemax={questions.length}
                        >
                            <span style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    <div className="quiz-question">
                        <div className="quiz-question-meta">
                            <span>{getQuestionType(currentQuestion)}</span>
                            <span>{currentQuestion.category}</span>
                        </div>

                        {currentQuestion.scenario && (
                            <div className="quiz-scenario">
                                <div className="quiz-scenario-heading">
                                    <AlertTriangle size={16} />
                                    <strong>
                                        {currentQuestion.title || "Security scenario"}
                                    </strong>
                                </div>

                                <p>{currentQuestion.scenario}</p>
                            </div>
                        )}

                        <h3>{currentQuestion.question}</h3>

                        <p className="quiz-answer-hint">
                            {isMultiple
                                ? "Select all correct answers."
                                : "Select one answer."}
                        </p>

                        <div className="quiz-options">
                            {currentQuestion.options.map((option) => {
                                const isSelected = selected.includes(option.id);

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        className={`quiz-option ${isSelected ? "is-selected" : ""
                                            }`}
                                        onClick={() =>
                                            selectAnswer(currentQuestion, option.id)
                                        }
                                        aria-pressed={isSelected}
                                    >
                                        <span
                                            className={`quiz-option-indicator ${isMultiple ? "is-checkbox" : "is-radio"
                                                }`}
                                        >
                                            {isSelected && <Check size={13} />}
                                        </span>

                                        <span>{option.text}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="quiz-navigation">
                        <button
                            type="button"
                            className="quiz-secondary-button"
                            disabled={currentIndex === 0}
                            onClick={() =>
                                setCurrentIndex((index) => index - 1)
                            }
                        >
                            <ArrowLeft size={16} />
                            Previous
                        </button>

                        {currentIndex < questions.length - 1 ? (
                            <button
                                type="button"
                                className="quiz-primary-button"
                                onClick={() =>
                                    setCurrentIndex((index) => index + 1)
                                }
                            >
                                Next question
                                <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="quiz-primary-button"
                                onClick={() => setConfirmSubmit(true)}
                            >
                                Submit quiz
                                <CheckCircle2 size={16} />
                            </button>
                        )}
                    </div>

                    <div className="quiz-question-dots">
                        {questions.map((question, index) => {
                            const answered = (answers[question.id] || []).length > 0;

                            return (
                                <button
                                    key={question.id}
                                    type="button"
                                    className={[
                                        "quiz-question-dot",
                                        index === currentIndex ? "is-active" : "",
                                        answered ? "is-answered" : "",
                                    ].join(" ")}
                                    onClick={() => setCurrentIndex(index)}
                                    aria-label={`Go to question ${index + 1}${answered ? ", answered" : ", unanswered"
                                        }`}
                                    aria-current={
                                        index === currentIndex ? "step" : undefined
                                    }
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {confirmSubmit && (
                    <div className="quiz-modal-backdrop">
                        <div
                            className="quiz-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="quiz-confirm-title"
                        >
                            <h3 id="quiz-confirm-title">Submit your answers?</h3>

                            <p>
                                You have answered {answeredCount} of {questions.length}
                                {" "}questions.
                                {answeredCount < questions.length &&
                                    " Unanswered questions will receive zero points."}
                            </p>

                            <div className="quiz-modal-actions">
                                <button
                                    type="button"
                                    className="quiz-secondary-button"
                                    onClick={() => setConfirmSubmit(false)}
                                >
                                    Continue quiz
                                </button>

                                <button
                                    type="button"
                                    className="quiz-primary-button"
                                    onClick={submitQuiz}
                                >
                                    Confirm submission
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        );
    }

    // --------------------------------------------------
    // RESULTS AND ANSWER REVIEW
    // --------------------------------------------------

    if (phase === "result" && result) {
        return (
            <section className="quiz-shell">
                <div className="quiz-result">
                    <div className="quiz-result-heading">
                        <span className="quiz-eyebrow">
                            Assessment completed
                        </span>

                        <span
                            className={`quiz-result-status ${result.passed ? "is-passed" : "is-failed"
                                }`}
                        >
                            {result.passed ? "Passed" : "Keep practicing"}
                        </span>
                    </div>

                    <div className="quiz-result-main">
                        <div
                            className="quiz-score-ring"
                            style={{
                                "--quiz-score": `${result.percentage}%`,
                                "--quiz-score-color": result.passed
                                    ? "var(--quiz-success)"
                                    : "var(--quiz-warning)",
                            }}
                        >
                            <div>
                                <strong>{result.percentage}%</strong>
                                <span>Final score</span>
                            </div>
                        </div>

                        <div className="quiz-result-summary">
                            <Trophy size={23} />

                            <h2>
                                {result.percentage === 100
                                    ? "Perfect score!"
                                    : result.passed
                                        ? "Well done!"
                                        : "Keep improving!"}
                            </h2>

                            <p>{getPerformanceMessage(result.percentage)}</p>

                            <span>
                                Easy level · {result.total} questions
                            </span>
                        </div>
                    </div>

                    <div className="quiz-result-stats">
                        <div>
                            <CheckCircle2 size={18} />
                            <strong>{result.correct}</strong>
                            <span>Correct</span>
                        </div>

                        <div>
                            <XCircle size={18} />
                            <strong>{result.incorrect}</strong>
                            <span>Incorrect</span>
                        </div>

                        <div>
                            <CircleHelp size={18} />
                            <strong>{result.unanswered}</strong>
                            <span>Unanswered</span>
                        </div>
                    </div>

                    <div className="quiz-result-actions">
                        <button
                            type="button"
                            className="quiz-primary-button"
                            onClick={() => setShowReview((value) => !value)}
                        >
                            <BookOpen size={17} />
                            {showReview ? "Hide review" : "Review answers"}
                        </button>

                        <button
                            type="button"
                            className="quiz-secondary-button"
                            onClick={startQuiz}
                        >
                            <RotateCcw size={17} />
                            Try another quiz
                        </button>
                    </div>

                    {result.percentage >= CERTIFICATE_PASS_PERCENTAGE && (
                        <div className="quiz-certificate-unlocked">
                            <div className="quiz-certificate-unlocked-icon">
                                <Award size={24} />
                            </div>

                            <div className="quiz-certificate-unlocked-content">
                                <span>Certificate unlocked</span>

                                <h3>Congratulations! You've earned a certificate.</h3>

                                <p>
                                    You achieved <strong>{result.percentage}%</strong> in the
                                    Fundamental Quiz of CyberSecurity Awareness.
                                    Download your personalized certificate below.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="quiz-certificate-download"
                                onClick={() => setCertificateOpen(true)}
                            >
                                <Download size={18} />
                                Download Certificate
                            </button>
                        </div>
                    )}

                    {result.percentage < CERTIFICATE_PASS_PERCENTAGE && (
                        <div className="quiz-certificate-locked">
                            <Award size={19} />

                            <p>
                                Score at least {CERTIFICATE_PASS_PERCENTAGE}% to unlock
                                your certificate. Review your answers and try again.
                            </p>
                        </div>
                    )}

                    {showReview && (
                        <div className="quiz-review">
                            <div className="quiz-review-heading">
                                <h3>Answer review</h3>
                                <p>
                                    Understand each question and learn from your
                                    answers.
                                </p>
                            </div>

                            {result.details.map((item, index) => {
                                const { question, selected, isCorrect } = item;

                                return (
                                    <article
                                        key={question.id}
                                        className="quiz-review-item"
                                    >
                                        <div className="quiz-review-top">
                                            <span>Question {index + 1}</span>

                                            <span
                                                className={
                                                    isCorrect
                                                        ? "quiz-review-correct"
                                                        : "quiz-review-incorrect"
                                                }
                                            >
                                                {isCorrect ? "Correct" : "Incorrect"}
                                            </span>
                                        </div>

                                        {question.scenario && (
                                            <p className="quiz-review-scenario">
                                                {question.scenario}
                                            </p>
                                        )}

                                        <h4>{question.question}</h4>

                                        <div className="quiz-review-options">
                                            {question.options.map((option) => {
                                                const isExpected = question.correctAnswers.includes(option.id);
                                                const isChosen = selected.includes(option.id);

                                                return (
                                                    <div
                                                        key={option.id}
                                                        className={[
                                                            "quiz-review-option",
                                                            isExpected ? "is-correct" : "",
                                                            isChosen && !isExpected ? "is-wrong" : "",
                                                        ].join(" ")}
                                                    >
                                                        <span>{option.text}</span>

                                                        <div className="quiz-review-option-status">
                                                            {isChosen && (
                                                                <span className="quiz-review-selected-label">
                                                                    Your choice
                                                                </span>
                                                            )}

                                                            {isExpected && (
                                                                <span className="quiz-review-correct-label">
                                                                    Correct answer
                                                                </span>
                                                            )}

                                                            {isExpected && <CheckCircle2 size={16} />}

                                                            {isChosen && !isExpected && <XCircle size={16} />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="quiz-review-explanation">
                                            <strong>Explanation</strong>
                                            <p>{question.explanation}</p>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
                <CertificateModal
                    open={certificateOpen}
                    onClose={() => setCertificateOpen(false)}
                    result={result}
                    difficulty={DIFFICULTY}
                    completedAt={completedAt}
                />
            </section>
        );
    }

    return null;
}