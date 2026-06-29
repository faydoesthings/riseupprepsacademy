import prisma from "@/lib/prisma";

export async function getCourseLessonCount(courseId: string): Promise<number> {
  return prisma.lesson.count({
    where: { module: { courseId } },
  });
}

export async function getCompletedLessonCount(courseId: string, userId: string): Promise<number> {
  return prisma.lessonProgress.count({
    where: {
      completed: true,
      userId,
      lesson: { module: { courseId } },
    },
  });
}

export async function getCourseProgressPercent(courseId: string, userId: string): Promise<number> {
  const total = await getCourseLessonCount(courseId);
  if (total === 0) return 0;
  const completed = await getCompletedLessonCount(courseId, userId);
  return Math.round((completed / total) * 100);
}

export async function isEnrolled(courseId: string, userId: string): Promise<boolean> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId, userId } },
    select: { status: true },
  });
  return enrollment?.status === "ACTIVE" || enrollment?.status === "COMPLETED";
}

export async function moduleLessonsComplete(moduleId: string, userId: string): Promise<boolean> {
  const lessons = await prisma.lesson.findMany({
    where: { moduleId },
    select: { id: true },
  });
  if (lessons.length === 0) return false;

  const completed = await prisma.lessonProgress.count({
    where: {
      userId,
      completed: true,
      lessonId: { in: lessons.map((l) => l.id) },
    },
  });
  return completed >= lessons.length;
}
