import Link from "next/link";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import ListPageError from "@/components/ui/ListPageError";
import StudentCourseCard from "@/components/portal/lms/StudentCourseCard";
import { requirePortalRole } from "@/lib/portal-auth";
import { getCourseProgressPercent } from "@/lib/lms/progress";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentCoursesPage() {
  try {
    const session = await requirePortalRole("STUDENT");
    const userId = session.user!.id!;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
      include: { course: true },
      orderBy: { enrolledAt: "desc" },
    });

    const courses = await Promise.all(
      enrollments.map(async (e) => ({
        ...e,
        progressPercent: await getCourseProgressPercent(e.courseId, userId),
      }))
    );

    return (
      <div className="animate-fade-in-up lms-page">
        <PageHeader
          title="My Courses"
          description="Self-paced learning tracks assigned to you."
          eyebrow="Student portal"
          customAction={
            <Link href="/portal/student/courses/browse" className="portal-btn portal-btn--primary">
              Browse courses
            </Link>
          }
        />

        {courses.length === 0 ? (
          <div className="portal-panel">
            <div className="lms-empty">
              <div className="lms-empty__icon">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="lms-empty__title">No courses yet</p>
              <p className="lms-empty__text">
                You haven&apos;t been enrolled in any courses yet.{" "}
                <Link href="/portal/student/courses/browse" className="text-[#F78C1F] hover:underline">
                  Browse available courses
                </Link>{" "}
                or ask an administrator for access.
              </p>
            </div>
          </div>
        ) : (
          <div className="lms-course-grid">
            {courses.map(({ course, progressPercent, status }) => (
              <StudentCourseCard
                key={course.id}
                slug={course.slug}
                title={course.title}
                description={course.description}
                thumbnail={course.thumbnail}
                difficulty={course.difficulty}
                progressPercent={progressPercent}
                status={status}
              />
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("StudentCoursesPage:", error);
    return <ListPageError />;
  }
}
