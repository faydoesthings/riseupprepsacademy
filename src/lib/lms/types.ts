export type LessonType =
  | "VIDEO"
  | "PDF"
  | "SLIDES"
  | "READING"
  | "EXTERNAL_LINK"
  | "DOWNLOAD"
  | "PRACTICE";

export type QuizType = "MODULE_QUIZ" | "FINAL_EXAM";

export type QuestionType = "MCQ" | "TRUE_FALSE" | "MULTI_SELECT" | "SHORT_ANSWER";

export type EnrollmentType = "MANUAL" | "PAYMENT" | "COUPON" | "SCHOLARSHIP" | "BULK";

export type CourseDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type QuizOption = { id: string; text: string };

export type SubmittedAnswer = {
  questionId: string;
  selectedAnswer: string | string[] | null;
};

export type GradedAnswerRow = {
  questionId: string;
  selectedAnswer: string | string[] | null;
  isCorrect: boolean | null;
  marksAwarded: number;
};
