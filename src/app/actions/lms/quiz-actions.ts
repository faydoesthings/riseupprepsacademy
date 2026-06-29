"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRoleAction, requireAuthAction, getRoleFromSession } from "@/lib/auth-utils";
import type { GradedAnswerRow, QuizOption, SubmittedAnswer } from "@/lib/lms/types";
import { isEligibleForModuleQuiz, isEligibleForFinalExam } from "./enrollment-actions";
import { tryIssueCertificateAfterCompletion, resolveCourseIdFromQuiz } from "@/lib/lms/completion";
import { notifyLmsStaff, sendLmsNotification } from "@/lib/lms/notifications";

const quizSchema = z.object({
  title: z.string().min(2).max(200),
  type: z.enum(["MODULE_QUIZ", "FINAL_EXAM"]),
  moduleId: z.string().optional(),
  courseId: z.string().optional(),
  timeLimit: z.number().int().min(1).optional(),
  passingScore: z.number().min(0).max(100).optional(),
  maxAttempts: z.number().int().min(1).optional(),
  randomizeQuestions: z.boolean().optional(),
  randomizeOptions: z.boolean().optional(),
  negativeMarking: z.boolean().optional(),
  negativePenalty: z.number().min(0).optional(),
  showResultsImmediately: z.boolean().optional(),
});

const questionSchema = z.object({
  text: z.string().min(2).max(2000),
  type: z.enum(["MCQ", "TRUE_FALSE", "MULTI_SELECT", "SHORT_ANSWER"]),
  options: z.array(z.object({ id: z.string(), text: z.string() })).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string()), z.null()]).optional(),
  marks: z.number().min(0).max(100).optional(),
  explanation: z.string().max(2000).optional(),
});

async function staffAuth() {
  return requireRoleAction("SUPER_ADMIN", "TEACHER");
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function gradeAnswer(
  type: string,
  correctAnswer: unknown,
  selected: string | string[] | null,
  marks: number,
  negativeMarking: boolean,
  penalty: number
): { isCorrect: boolean | null; marksAwarded: number } {
  if (type === "SHORT_ANSWER") {
    return { isCorrect: null, marksAwarded: 0 };
  }

  if (type === "MCQ" || type === "TRUE_FALSE") {
    const correct = String(correctAnswer ?? "");
    const selectedStr = String(selected ?? "");
    const isCorrect = correct === selectedStr;
    if (isCorrect) return { isCorrect: true, marksAwarded: marks };
    if (negativeMarking) return { isCorrect: false, marksAwarded: -penalty };
    return { isCorrect: false, marksAwarded: 0 };
  }

  if (type === "MULTI_SELECT") {
    const correct = Array.isArray(correctAnswer) ? [...correctAnswer].sort() : [];
    const sel = Array.isArray(selected) ? [...selected].sort() : [];
    const isCorrect =
      correct.length === sel.length && correct.every((v, i) => v === sel[i]);
    if (isCorrect) return { isCorrect: true, marksAwarded: marks };
    if (negativeMarking) return { isCorrect: false, marksAwarded: -penalty };
    return { isCorrect: false, marksAwarded: 0 };
  }

  return { isCorrect: false, marksAwarded: 0 };
}

export async function createQuiz(input: z.infer<typeof quizSchema>) {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = quizSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  if (data.type === "MODULE_QUIZ" && !data.moduleId) {
    return { success: false as const, error: "Module quiz requires moduleId" };
  }
  if (data.type === "FINAL_EXAM" && !data.courseId) {
    return { success: false as const, error: "Final exam requires courseId" };
  }

  try {
    const quiz = await prisma.quiz.create({
      data: {
        title: data.title,
        type: data.type,
        moduleId: data.moduleId ?? null,
        courseId: data.courseId ?? null,
        timeLimit: data.timeLimit ?? null,
        passingScore: data.passingScore ?? 60,
        maxAttempts: data.maxAttempts ?? null,
        randomizeQuestions: data.randomizeQuestions ?? false,
        randomizeOptions: data.randomizeOptions ?? false,
        negativeMarking: data.negativeMarking ?? false,
        negativePenalty: data.negativePenalty ?? null,
        showResultsImmediately: data.showResultsImmediately ?? true,
      },
    });
    return { success: true as const, data: quiz };
  } catch (error) {
    console.error("createQuiz:", error);
    return { success: false as const, error: "Failed to create quiz" };
  }
}

export async function updateQuiz(id: string, input: Partial<z.infer<typeof quizSchema>>) {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.timeLimit !== undefined ? { timeLimit: input.timeLimit } : {}),
        ...(input.passingScore !== undefined ? { passingScore: input.passingScore } : {}),
        ...(input.maxAttempts !== undefined ? { maxAttempts: input.maxAttempts } : {}),
        ...(input.randomizeQuestions !== undefined
          ? { randomizeQuestions: input.randomizeQuestions }
          : {}),
        ...(input.randomizeOptions !== undefined ? { randomizeOptions: input.randomizeOptions } : {}),
        ...(input.negativeMarking !== undefined ? { negativeMarking: input.negativeMarking } : {}),
        ...(input.negativePenalty !== undefined ? { negativePenalty: input.negativePenalty } : {}),
        ...(input.showResultsImmediately !== undefined
          ? { showResultsImmediately: input.showResultsImmediately }
          : {}),
      },
    });
    return { success: true as const, data: quiz };
  } catch (error) {
    console.error("updateQuiz:", error);
    return { success: false as const, error: "Failed to update quiz" };
  }
}

export async function deleteQuiz(id: string) {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    await prisma.quiz.delete({ where: { id } });
    return { success: true as const };
  } catch (error) {
    console.error("deleteQuiz:", error);
    return { success: false as const, error: "Failed to delete quiz" };
  }
}

export async function addQuestion(quizId: string, input: z.infer<typeof questionSchema>) {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = questionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const maxOrder = await prisma.question.aggregate({
      where: { quizId },
      _max: { order: true },
    });

    const question = await prisma.question.create({
      data: {
        quizId,
        text: parsed.data.text,
        type: parsed.data.type,
        options: parsed.data.options ?? undefined,
        correctAnswer: parsed.data.correctAnswer ?? undefined,
        marks: parsed.data.marks ?? 1,
        explanation: parsed.data.explanation ?? null,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });
    return { success: true as const, data: question };
  } catch (error) {
    console.error("addQuestion:", error);
    return { success: false as const, error: "Failed to add question" };
  }
}

export async function deleteQuestion(id: string) {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    await prisma.question.delete({ where: { id } });
    return { success: true as const };
  } catch (error) {
    console.error("deleteQuestion:", error);
    return { success: false as const, error: "Failed to delete question" };
  }
}

export async function updateQuestion(
  id: string,
  input: Partial<z.infer<typeof questionSchema>>
) {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = questionSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const data: Record<string, unknown> = {};
    if (parsed.data.text !== undefined) data.text = parsed.data.text;
    if (parsed.data.type !== undefined) data.type = parsed.data.type;
    if (parsed.data.options !== undefined) data.options = parsed.data.options;
    if (parsed.data.correctAnswer !== undefined) data.correctAnswer = parsed.data.correctAnswer;
    if (parsed.data.marks !== undefined) data.marks = parsed.data.marks;
    if (parsed.data.explanation !== undefined) data.explanation = parsed.data.explanation ?? null;

    const question = await prisma.question.update({
      where: { id },
      data: data as Parameters<typeof prisma.question.update>[0]["data"],
    });
    return { success: true as const, data: question };
  } catch (error) {
    console.error("updateQuestion:", error);
    return { success: false as const, error: "Failed to update question" };
  }
}

export async function reorderQuestions(quizId: string, orderedIds: string[]) {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.question.update({ where: { id, quizId }, data: { order: index + 1 } })
      )
    );
    return { success: true as const };
  } catch (error) {
    console.error("reorderQuestions:", error);
    return { success: false as const, error: "Failed to reorder questions" };
  }
}

export async function getQuizWithQuestions(quizId: string) {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!quiz) return { success: false as const, error: "Quiz not found" };
    return { success: true as const, data: quiz };
  } catch (error) {
    console.error("getQuizWithQuestions:", error);
    return { success: false as const, error: "Failed to load quiz" };
  }
}

export async function startAttempt(quizId: string) {
  const auth = await requireAuthAction();
  if (!auth.ok) return { success: false as const, error: auth.error };
  const userId = auth.session.user!.id!;

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { order: "asc" } }, module: true, course: true },
    });
    if (!quiz) return { success: false as const, error: "Quiz not found" };

    if (quiz.type === "MODULE_QUIZ" && quiz.moduleId) {
      const ok = await isEligibleForModuleQuiz(quiz.moduleId, userId);
      if (!ok) return { success: false as const, error: "Complete all lessons in this module first" };
    } else if (quiz.type === "FINAL_EXAM" && quiz.courseId) {
      const ok = await isEligibleForFinalExam(quiz.courseId, userId);
      if (!ok) return { success: false as const, error: "Complete all modules and quizzes first" };
    }

    if (quiz.maxAttempts) {
      const count = await prisma.quizAttempt.count({ where: { quizId, userId } });
      if (count >= quiz.maxAttempts) {
        return { success: false as const, error: "Maximum attempts reached" };
      }
    }

    const attempt = await prisma.quizAttempt.create({
      data: { quizId, userId },
    });

    let questions = quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      marks: q.marks,
      options: q.options as QuizOption[] | null,
    }));

    if (quiz.randomizeQuestions) questions = shuffle(questions);
    if (quiz.randomizeOptions) {
      questions = questions.map((q) => ({
        ...q,
        options: q.options ? shuffle(q.options) : null,
      }));
    }

    return {
      success: true as const,
      data: {
        attemptId: attempt.id,
        questions,
        timeLimit: quiz.timeLimit,
        title: quiz.title,
        type: quiz.type,
      },
    };
  } catch (error) {
    console.error("startAttempt:", error);
    return { success: false as const, error: "Failed to start quiz" };
  }
}

export async function submitAttempt(attemptId: string, answers: SubmittedAnswer[]) {
  const auth = await requireAuthAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: { include: { questions: true } },
      },
    });
    if (!attempt) return { success: false as const, error: "Attempt not found" };
    if (attempt.userId !== auth.session.user!.id) {
      return { success: false as const, error: "Forbidden" };
    }
    if (attempt.submittedAt) {
      return { success: false as const, error: "Attempt already submitted" };
    }

    const quiz = attempt.quiz;
    const questionMap = new Map(quiz.questions.map((q) => [q.id, q]));
    let totalMarks = 0;
    let earned = 0;
    const graded: GradedAnswerRow[] = [];

    for (const q of quiz.questions) {
      totalMarks += q.marks;
    }

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;
      const result = gradeAnswer(
        q.type,
        q.correctAnswer,
        ans.selectedAnswer,
        q.marks,
        quiz.negativeMarking,
        quiz.negativePenalty ?? 0
      );
      earned += result.marksAwarded;
      graded.push({
        questionId: ans.questionId,
        selectedAnswer: ans.selectedAnswer,
        isCorrect: result.isCorrect,
        marksAwarded: result.marksAwarded,
      });
    }

    earned = Math.max(0, earned);
    const percentage = totalMarks > 0 ? (earned / totalMarks) * 100 : 0;
    const passed = percentage >= (quiz.passingScore ?? 60);
    const hasPendingShort = quiz.questions.some(
      (q) => q.type === "SHORT_ANSWER" && answers.some((a) => a.questionId === q.id)
    );

    const updated = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        submittedAt: new Date(),
        score: earned,
        percentage,
        passed: hasPendingShort ? null : passed,
        answers: graded,
      },
    });

    if (hasPendingShort) {
      await notifyLmsStaff(
        "Quiz needs grading",
        `A short-answer submission for "${quiz.title}" needs review.`,
        "/portal/admin/lms/grading",
        "WARNING"
      );
    } else if (passed) {
      const courseId = await resolveCourseIdFromQuiz(quiz.id);
      if (courseId) {
        await tryIssueCertificateAfterCompletion(courseId, attempt.userId);
      }
    }

    return {
      success: true as const,
      data: {
        attempt: updated,
        graded,
        questions: quiz.questions,
        showResults: quiz.showResultsImmediately,
        passed: hasPendingShort ? null : passed,
      },
    };
  } catch (error) {
    console.error("submitAttempt:", error);
    return { success: false as const, error: "Failed to submit quiz" };
  }
}

export async function getAttemptHistory(quizId: string, userId: string) {
  const auth = await requireAuthAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId, userId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true as const, data: attempts };
  } catch (error) {
    console.error("getAttemptHistory:", error);
    return { success: false as const, error: "Failed to load attempts" };
  }
}

export async function getStudentQuizMeta(quizId: string, userId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { _count: { select: { questions: true } } },
  });
  if (!quiz) return { success: false as const, error: "Quiz not found" };

  const history = await prisma.quizAttempt.findMany({
    where: { quizId, userId },
    orderBy: { createdAt: "desc" },
  });

  const attemptsUsed = history.length;
  const attemptsRemaining = quiz.maxAttempts ? quiz.maxAttempts - attemptsUsed : null;

  return {
    success: true as const,
    data: { quiz, history, attemptsRemaining },
  };
}

export async function listPendingGradingAttempts() {
  const auth = await requireRoleAction("SUPER_ADMIN", "TEACHER");
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { passed: null, submittedAt: { not: null } },
      orderBy: { submittedAt: "desc" },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            type: true,
            passingScore: true,
            courseId: true,
            module: { select: { courseId: true, course: { select: { id: true, title: true } } } },
            questions: true,
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
      take: 100,
    });

    return { success: true as const, data: attempts };
  } catch (error) {
    console.error("listPendingGradingAttempts:", error);
    return { success: false as const, error: "Failed to load pending attempts" };
  }
}

const gradeSchema = z.object({
  attemptId: z.string(),
  grades: z.array(
    z.object({
      questionId: z.string(),
      marksAwarded: z.number().min(0),
      isCorrect: z.boolean(),
    })
  ),
});

export async function gradeShortAnswerAttempt(input: z.infer<typeof gradeSchema>) {
  const auth = await requireRoleAction("SUPER_ADMIN", "TEACHER");
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = gradeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: parsed.data.attemptId },
      include: { quiz: { include: { questions: true } } },
    });
    if (!attempt?.submittedAt) {
      return { success: false as const, error: "Attempt not found or not submitted" };
    }

    const existingAnswers = (attempt.answers as GradedAnswerRow[]) ?? [];
    const gradeMap = new Map(parsed.data.grades.map((g) => [g.questionId, g]));

    let earned = 0;
    let totalMarks = 0;
    const updatedAnswers: GradedAnswerRow[] = existingAnswers.map((row) => {
      const q = attempt.quiz.questions.find((qu) => qu.id === row.questionId);
      if (q) totalMarks += q.marks;
      const grade = gradeMap.get(row.questionId);
      if (grade) {
        earned += grade.marksAwarded;
        return {
          ...row,
          isCorrect: grade.isCorrect,
          marksAwarded: grade.marksAwarded,
        };
      }
      earned += row.marksAwarded ?? 0;
      return row;
    });

    for (const q of attempt.quiz.questions) {
      if (!existingAnswers.some((a) => a.questionId === q.id)) {
        totalMarks += q.marks;
      }
    }

    earned = Math.max(0, earned);
    const percentage = totalMarks > 0 ? (earned / totalMarks) * 100 : 0;
    const passed = percentage >= (attempt.quiz.passingScore ?? 60);

    const updated = await prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: { score: earned, percentage, passed, answers: updatedAnswers },
    });

    await sendLmsNotification(
      attempt.userId,
      "Quiz graded",
      `Your submission for "${attempt.quiz.title}" has been graded. ${passed ? "You passed!" : "Review your results."}`,
      undefined,
      passed ? "SUCCESS" : "INFO"
    );

    if (passed) {
      const courseId = await resolveCourseIdFromQuiz(attempt.quizId);
      if (courseId) {
        await tryIssueCertificateAfterCompletion(courseId, attempt.userId);
      }
    }

    revalidatePath("/portal/admin/lms/grading");
    revalidatePath("/portal/teacher/lms/grading");
    return { success: true as const, data: updated };
  } catch (error) {
    console.error("gradeShortAnswerAttempt:", error);
    return { success: false as const, error: "Failed to grade attempt" };
  }
}
