
import { easyQuestions } from "../data/quiz/easy";
import { mediumQuestions } from "../data/quiz/medium";
import { hardQuestions } from "../data/quiz/hard";

// ============================================================
// CONFIGURATION
// ============================================================

export const QUIZ_QUESTION_COUNT = 20;
export const QUIZ_PASS_PERCENTAGE = 75;

const QUIZ_DISTRIBUTION = {
    easy: 5,
    medium: 8,
    hard: 7,
};

const HISTORY_KEY = "scamshield_quiz_history";
const QUESTION_HISTORY_KEY = "cybermentis_used_questions_v2";

// ============================================================
// UTILITIES
// ============================================================

const shuffle = (items) => {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [
            result[j],
            result[i],
        ];
    }

    return result;
};

const normalizeText = (value) =>
    String(value || "")
        .normalize("NFKC")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

const getQuestionKey = (question) =>
    normalizeText(question.question);

// ============================================================
// DEDUPLICATE QUESTION BANK
// ============================================================

const rawGroups = {
    easy: easyQuestions,
    medium: mediumQuestions,
    hard: hardQuestions,
};

const deduplicateBank = () => {
    const usedIds = new Set();
    const usedTexts = new Set();

    const groups = {
        easy: [],
        medium: [],
        hard: [],
    };

    for (const [level, questions] of Object.entries(rawGroups)) {
        for (const question of questions) {
            if (
                !question ||
                !question.id ||
                !question.question ||
                !Array.isArray(question.options) ||
                question.options.length === 0 ||
                !Array.isArray(question.correctAnswers) ||
                question.correctAnswers.length === 0
            ) {
                console.warn(
                    "Skipping invalid quiz question:",
                    question?.id || "unknown"
                );
                continue;
            }

            const textKey = getQuestionKey(question);

            if (
                usedIds.has(question.id) ||
                usedTexts.has(textKey)
            ) {
                console.warn(
                    "Skipping duplicate quiz question:",
                    question.id
                );
                continue;
            }

            usedIds.add(question.id);
            usedTexts.add(textKey);

            groups[level].push(question);
        }
    }

    return groups;
};

const questionGroups = deduplicateBank();

const allQuestions = [
    ...questionGroups.easy,
    ...questionGroups.medium,
    ...questionGroups.hard,
];

export const QUIZ_BANK_LIMITS = {
    easy: questionGroups.easy.length,
    medium: questionGroups.medium.length,
    hard: questionGroups.hard.length,
};

export const QUIZ_TOTAL_QUESTIONS = allQuestions.length;

export const QUIZ_CONFIG = {
    mixed: {
        label: "Cybersecurity Awareness",
        questions: allQuestions,
    },
};

// ============================================================
// QUESTION HISTORY
// ============================================================

const readUsedQuestions = () => {
    if (typeof window === "undefined") {
        return new Set();
    }

    try {
        const stored = window.localStorage.getItem(
            QUESTION_HISTORY_KEY
        );

        const parsed = stored ? JSON.parse(stored) : [];

        return new Set(
            Array.isArray(parsed) ? parsed : []
        );
    } catch {
        return new Set();
    }
};

const saveUsedQuestions = (usedQuestions) => {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(
        QUESTION_HISTORY_KEY,
        JSON.stringify([...usedQuestions])
    );
};

// ============================================================
// CREATE QUIZ
// ============================================================

export const createQuiz = ({
    difficulty = "mixed",
    count = QUIZ_QUESTION_COUNT,
} = {}) => {
    if (difficulty !== "mixed") {
        throw new Error(
            "Only the mixed quiz is supported."
        );
    }

    if (count !== QUIZ_QUESTION_COUNT) {
        throw new Error(
            `Quiz must contain exactly ${QUIZ_QUESTION_COUNT} questions.`
        );
    }

    if (allQuestions.length < count) {
        throw new Error(
            `Only ${allQuestions.length} unique questions are available. At least ${count} are required.`
        );
    }

    const usedQuestions = readUsedQuestions();

    const unseenQuestions = allQuestions.filter(
        (question) =>
            !usedQuestions.has(getQuestionKey(question))
    );

    if (unseenQuestions.length < count) {
        throw new Error(
            `Only ${unseenQuestions.length} unseen questions remain. A new 20-question quiz cannot be created without repeating previous questions.`
        );
    }

    const selected = [];
    const selectedKeys = new Set();

    const selectQuestions = (pool, required) => {
        const available = shuffle(pool).filter(
            (question) =>
                !selectedKeys.has(getQuestionKey(question))
        );

        const picked = available.slice(0, required);

        for (const question of picked) {
            selected.push(question);
            selectedKeys.add(getQuestionKey(question));
        }
    };

    // First, aim for the preferred distribution.
    for (const [level, required] of Object.entries(
        QUIZ_DISTRIBUTION
    )) {
        const levelPool = unseenQuestions.filter(
            (question) =>
                questionGroups[level].includes(question)
        );

        selectQuestions(levelPool, required);
    }

    // Fill remaining slots from all unseen questions.
    if (selected.length < count) {
        selectQuestions(
            unseenQuestions,
            count - selected.length
        );
    }

    if (selected.length !== count) {
        throw new Error(
            "Unable to create a complete quiz."
        );
    }

    // Reserve selected questions so the next attempt
    // does not reuse them.
    for (const question of selected) {
        usedQuestions.add(getQuestionKey(question));
    }

    saveUsedQuestions(usedQuestions);

    return shuffle(selected).map((question) => ({
        ...question,
        options: shuffle(question.options),
    }));
};

// ============================================================
// ANSWER VALIDATION
// ============================================================

export const isAnswerCorrect = (
    question,
    selected = []
) => {
    const expected = question.correctAnswers || [];

    if (
        !Array.isArray(selected) ||
        !Array.isArray(expected)
    ) {
        return false;
    }

    const selectedSet = new Set(selected);
    const expectedSet = new Set(expected);

    return (
        selectedSet.size === selected.length &&
        selectedSet.size === expectedSet.size &&
        [...selectedSet].every((id) =>
            expectedSet.has(id)
        )
    );
};

// ============================================================
// CALCULATE QUIZ RESULT
// ============================================================

export const calculateQuizResult = (
    questions,
    answers
) => {
    const details = questions.map((question) => {
        const selected = answers[question.id] || [];

        return {
            question,
            selected,
            correctAnswers: question.correctAnswers,
            isCorrect: isAnswerCorrect(
                question,
                selected
            ),
        };
    });

    const correct = details.filter(
        (item) => item.isCorrect
    ).length;

    const unanswered = details.filter(
        (item) => item.selected.length === 0
    ).length;

    const total = questions.length;

    const incorrect = total - correct - unanswered;

    const percentage = total
        ? Math.round((correct / total) * 100)
        : 0;

    return {
        total,
        correct,
        incorrect,
        unanswered,
        percentage,
        passed: percentage >= QUIZ_PASS_PERCENTAGE,
        details,
    };
};

// ============================================================
// SAVE QUIZ HISTORY
// ============================================================

export const saveQuizHistory = (
    result,
    difficulty = "mixed"
) => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        const stored = window.localStorage.getItem(
            HISTORY_KEY
        );

        const parsed = stored ? JSON.parse(stored) : [];

        const history = Array.isArray(parsed)
            ? parsed
            : [];

        const entry = {
            id: `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 9)}`,
            difficulty,
            percentage: result.percentage,
            correct: result.correct,
            total: result.total,
            passed: result.passed,
            completedAt: new Date().toISOString(),
        };

        window.localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(
                [entry, ...history].slice(0, 30)
            )
        );
    } catch (error) {
        console.warn(
            "Unable to save quiz history:",
            error
        );
    }
};
