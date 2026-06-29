import prisma from "@/lib/prisma";
import { isEligibleForFinalExam } from "@/app/actions/lms/enrollment-actions";
import { issueCertificate } from "@/app/actions/lms/certificate-actions";
import { sendLmsNotification } from "@/lib/lms/notifications";

export async function tryIssueCertificateAfterCompletion(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { requiresViva: true, slug: true, title: true },
  });
  if (!course || course.requiresViva) return;

  const eligible = await isEligibleForFinalExam(courseId, userId);
  if (!eligible) return;

  const existing = await prisma.certificate.findUnique({
    where: { courseId_userId: { courseId, userId } },
  });
  if (existing && !existing.revokedAt) return;

  const finalExam = await prisma.quiz.findFirst({
    where: { courseId, type: "FINAL_EXAM" },
  });
  if (finalExam) {
    const passed = await prisma.quizAttempt.findFirst({
      where: { quizId: finalExam.id, userId, passed: true },
    });
    if (!passed) return;
  }

  const result = await issueCertificate(courseId, userId);
  if (result.success) {
    await sendLmsNotification(
      userId,
      "Certificate issued",
      `Congratulations! Your certificate for "${course.title}" is ready to view.`,
      `/portal/student/courses/${course.slug}/certificate`,
      "SUCCESS"
    );
  }
}

export async function resolveCourseIdFromQuiz(quizId: string): Promise<string | null> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      courseId: true,
      module: { select: { courseId: true } },
    },
  });
  return quiz?.courseId ?? quiz?.module?.courseId ?? null;
}
