import { easyQuestions } from "../data/quiz/easy";

export const QUIZ_CONFIG = {
  easy: {
    label: "Easy",
    questions: easyQuestions,
  },
};

const shuffle = (items) => {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

export const createQuiz = ({
    difficulty = "easy",
    count = 5,
  } = {}) => {
    const config = QUIZ_CONFIG[difficulty];
  
    if (!config) {
      throw new Error("Unsupported quiz difficulty.");
    }
  
    if (
      !Number.isInteger(count) ||
      count < 3 ||
      count > config.questions.length
    ) {
      throw new Error("Invalid question count.");
    }
  
    const pool = shuffle(config.questions);
    const selected = [];
    const usedIds = new Set();
  
    const addQuestion = (predicate) => {
      const question = pool.find(
        (item) => !usedIds.has(item.id) && predicate(item)
      );
  
      if (!question) {
        throw new Error("Question bank lacks a required question type.");
      }
  
      selected.push(question);
      usedIds.add(question.id);
    };
  
    // Include a scenario that requires multiple answers.
    addQuestion(
      (item) =>
        item.type === "scenario" &&
        item.selectionMode === "multiple"
    );
  
    // Include a standard multi-select question.
    addQuestion((item) => item.type === "multiple");
  
    // Include a standard single-select question.
    addQuestion((item) => item.type === "single");
  
    // Fill the remaining slots with random, unused questions.
    for (const question of pool) {
      if (selected.length >= count) break;
  
      if (!usedIds.has(question.id)) {
        selected.push(question);
        usedIds.add(question.id);
      }
    }
  
    return shuffle(selected).map((question) => ({
      ...question,
      options: shuffle(question.options),
    }));
  };

  export const isAnswerCorrect = (question, selected = []) => {
    const expected = question.correctAnswers || [];
  
    if (!Array.isArray(selected) || !Array.isArray(expected)) {
      return false;
    }
  
    const selectedSet = new Set(selected);
    const expectedSet = new Set(expected);
  
    return (
      selectedSet.size === selected.length &&
      selectedSet.size === expectedSet.size &&
      [...selectedSet].every((id) => expectedSet.has(id))
    );
  };
  
  export const calculateQuizResult = (questions, answers) => {
    const details = questions.map((question) => {
      const selected = answers[question.id] || [];
  
      return {
        question,
        selected,
        correctAnswers: question.correctAnswers,
        isCorrect: isAnswerCorrect(question, selected),
      };
    });
  
    const correct = details.filter((item) => item.isCorrect).length;
  
    const unanswered = details.filter(
      (item) => item.selected.length === 0
    ).length;
  
    const total = questions.length;
    const incorrect = total - correct - unanswered;
  
    const percentage =
      total > 0 ? Math.round((correct / total) * 100) : 0;
  
    return {
      total,
      correct,
      incorrect,
      unanswered,
      percentage,
      passed: percentage >= 75,
      details,
    };
  };

const HISTORY_KEY = "scamshield_quiz_history";

export const saveQuizHistory = (result, difficulty) => {
  if (typeof window === "undefined") return;

  try {
    const previous = JSON.parse(
      window.localStorage.getItem(HISTORY_KEY) || "[]"
    );

    const history = Array.isArray(previous) ? previous : [];

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      difficulty,
      percentage: result.percentage,
      correct: result.correct,
      total: result.total,
      completedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([entry, ...history].slice(0, 30))
    );
  } catch (error) {
    console.warn("Quiz history could not be saved.", error);
  }
};