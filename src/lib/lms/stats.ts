import prisma from "@/lib/prisma";

export async function getLmsAdminStats() {
  const [publishedCourses, activeEnrollments, completedEnrollments, certificatesIssued] =
    await Promise.all([
      prisma.course.count({ where: { isPublished: true } }),
      prisma.enrollment.count({ where: { status: "ACTIVE" } }),
      prisma.enrollment.count({ where: { status: "COMPLETED" } }),
      prisma.certificate.count({ where: { revokedAt: null } }),
    ]);

  const upcomingVivas = await prisma.vivaSession.count({
    where: { status: "SCHEDULED", scheduledAt: { gte: new Date() } },
  });

  return {
    publishedCourses,
    activeEnrollments,
    completedEnrollments,
    certificatesIssued,
    upcomingVivas,
  };
}

export async function getStudentContinueLearning(userId: string) {
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { course: true },
    orderBy: { enrolledAt: "desc" },
  });

  if (!enrollment) return null;

  const totalLessons = await prisma.lesson.count({
    where: { module: { courseId: enrollment.courseId } },
  });
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId,
      completed: true,
      lesson: { module: { courseId: enrollment.courseId } },
    },
  });

  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    courseTitle: enrollment.course.title,
    courseSlug: enrollment.course.slug,
    progressPercent,
  };
}
