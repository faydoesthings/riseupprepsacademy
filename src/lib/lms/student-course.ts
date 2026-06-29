import prisma from "@/lib/prisma";
import { getCourseProgressPercent } from "@/lib/lms/progress";
import {
  getCourseCompletionState,
  getFinalExamEligibility,
  getModuleQuizEligibility,
} from "@/lib/lms/eligibility";
import { getCourseBySlug } from "@/app/actions/lms/course-actions";

export async function getStudentCourseDetail(slug: string, userId: string) {
  const base = await getCourseBySlug(slug);
  if (!base.success) return base;

  const progressRows = await prisma.lessonProgress.findMany({
    where: {
      userId,
      lesson: { module: { courseId: base.data.id } },
    },
  });
  const progressMap = new Map(progressRows.map((p) => [p.lessonId, p]));
  const progressPercent = await getCourseProgressPercent(base.data.id, userId);
  const completion = await getCourseCompletionState(base.data.id, userId);

  const modules = await Promise.all(
    base.data.modules.map(async (mod) => {
      const lessons = mod.lessons.map((lesson) => ({
        ...lesson,
        progress: progressMap.get(lesson.id) ?? null,
      }));

      const quizzes = await Promise.all(
        mod.quizzes.map(async (quiz) => ({
          ...quiz,
          eligibility: await getModuleQuizEligibility(mod.id, userId),
        }))
      );

      return { ...mod, lessons, quizzes };
    })
  );

  const finalExams = await Promise.all(
    base.data.quizzes.map(async (quiz) => ({
      ...quiz,
      eligibility: await getFinalExamEligibility(base.data.id, userId),
    }))
  );

  return {
    success: true as const,
    data: {
      ...base.data,
      modules,
      finalExams,
      progressPercent,
      completion,
    },
  };
}
