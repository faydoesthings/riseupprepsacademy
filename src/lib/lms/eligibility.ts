import prisma from "@/lib/prisma";
import { isEnrolled } from "@/lib/lms/progress";
import { isEligibleForFinalExam, isEligibleForModuleQuiz } from "@/app/actions/lms/enrollment-actions";

export type QuizEligibility = {
  eligible: boolean;
  reason?: string;
};

export async function getModuleQuizEligibility(
  moduleId: string,
  userId: string
): Promise<QuizEligibility> {
  const ok = await isEligibleForModuleQuiz(moduleId, userId);
  if (ok) return { eligible: true };
  return { eligible: false, reason: "Complete all lessons in this module first" };
}

export async function getFinalExamEligibility(
  courseId: string,
  userId: string
): Promise<QuizEligibility> {
  const ok = await isEligibleForFinalExam(courseId, userId);
  if (ok) return { eligible: true };
  return { eligible: false, reason: "Complete all modules and quizzes first" };
}

export async function getVivaEligibility(
  courseId: string,
  userId: string
): Promise<QuizEligibility> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { requiresViva: true },
  });
  if (!course?.requiresViva) {
    return { eligible: false, reason: "This course does not require a viva" };
  }

  const enrolled = await isEnrolled(courseId, userId);
  if (!enrolled) {
    return { eligible: false, reason: "Enroll in this course first" };
  }

  const finalExam = await prisma.quiz.findFirst({
    where: { courseId, type: "FINAL_EXAM" },
  });

  if (finalExam) {
    const passed = await prisma.quizAttempt.findFirst({
      where: { quizId: finalExam.id, userId, passed: true },
    });
    if (!passed) {
      return { eligible: false, reason: "Pass the final exam before scheduling a viva" };
    }
  } else {
    const examOk = await isEligibleForFinalExam(courseId, userId);
    if (!examOk) {
      return { eligible: false, reason: "Complete all course content first" };
    }
  }

  const existingCert = await prisma.certificate.findUnique({
    where: { courseId_userId: { courseId, userId } },
  });
  if (existingCert && !existingCert.revokedAt) {
    return { eligible: false, reason: "Certificate already issued" };
  }

  return { eligible: true };
}

export async function getCourseCompletionState(courseId: string, userId: string) {
  const [enrolled, vivaEligible, certificate] = await Promise.all([
    isEnrolled(courseId, userId),
    getVivaEligibility(courseId, userId),
    prisma.certificate.findUnique({
      where: { courseId_userId: { courseId, userId } },
      select: { id: true, verificationCode: true, revokedAt: true },
    }),
  ]);

  const vivaSession = enrolled
    ? await prisma.vivaSession.findFirst({
        where: { courseId, studentId: userId, status: { not: "CANCELLED" } },
        orderBy: { scheduledAt: "desc" },
        include: { examiner: { select: { name: true } } },
      })
    : null;

  return {
    enrolled,
    vivaEligible,
    vivaSession,
    certificate: certificate && !certificate.revokedAt ? certificate : null,
  };
}
