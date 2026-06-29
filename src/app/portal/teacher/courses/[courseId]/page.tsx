import prisma from "@/lib/prisma";
import ListPageError from "@/components/ui/ListPageError";
import { requirePortalRole } from "@/lib/portal-auth";
import CourseBuilder from "@/components/portal/lms/CourseBuilder";

export const dynamic = "force-dynamic";

export default async function TeacherCourseBuilderPage({
  params,
}: {
  params: { courseId: string };
}) {
  try {
    await requirePortalRole("TEACHER");

    const [course, allCourses] = await Promise.all([
      prisma.course.findUnique({
        where: { id: params.courseId },
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: { orderBy: { order: "asc" } },
              quizzes: { include: { _count: { select: { questions: true } } } },
            },
          },
          quizzes: {
            where: { type: "FINAL_EXAM" },
            include: { _count: { select: { questions: true } } },
          },
          enrollments: {
            where: { status: { in: ["ACTIVE", "COMPLETED"] } },
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { enrolledAt: "desc" },
          },
        },
      }),
      prisma.course.findMany({
        where: { id: { not: params.courseId } },
        select: { id: true, title: true },
        orderBy: { title: "asc" },
      }),
    ]);

    if (!course) return <ListPageError message="Course not found" />;

    const { enrollments, quizzes: finalExams, ...courseData } = course;

    return (
      <div className="animate-fade-in-up">
        <CourseBuilder
          course={{
            ...courseData,
            finalExams,
            prerequisites: (course.prerequisites as string[]) ?? [],
          }}
          enrollments={enrollments}
          allCourses={allCourses}
          basePath="/portal/teacher/courses"
          canManageEnrollments={false}
        />
      </div>
    );
  } catch (error) {
    console.error("TeacherCourseBuilderPage:", error);
    return <ListPageError />;
  }
}
