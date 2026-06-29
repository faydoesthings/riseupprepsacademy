import Link from "next/link";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import ListPageError from "@/components/ui/ListPageError";
import { requirePortalRole } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function TeacherCoursesPage() {
  try {
    await requirePortalRole("TEACHER");

    const courses = await prisma.course.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { modules: true, enrollments: true } },
        modules: { select: { _count: { select: { lessons: true } } } },
      },
    });

    return (
      <div className="animate-fade-in-up lms-page">
        <PageHeader
          title="Courses"
          description="Manage course content, quizzes, and student progress."
          eyebrow="Teacher portal"
        />

        <DataTable
          headers={["Course", "Status", "Modules", "Lessons", "Enrolled", ""]}
          isEmpty={courses.length === 0}
          emptyMessage="No courses available yet."
        >
          {courses.map((course) => {
            const lessonCount = course.modules.reduce((s, m) => s + m._count.lessons, 0);
            return (
              <tr key={course.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-6 py-4">
                  <Link
                    href={`/portal/teacher/courses/${course.id}`}
                    className="font-semibold text-white hover:text-[#F78C1F] transition-colors"
                  >
                    {course.title}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  {course.isPublished ? (
                    <span className="badge badge-success">Published</span>
                  ) : (
                    <span className="badge badge-warning">Draft</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-white/70">{course._count.modules}</td>
                <td className="px-6 py-4 text-sm text-white/70">{lessonCount}</td>
                <td className="px-6 py-4 text-sm text-white/70">{course._count.enrollments}</td>
                <td className="px-6 py-4">
                  <Link
                    href={`/portal/teacher/courses/${course.id}`}
                    className="portal-btn portal-btn--ghost portal-btn--sm"
                  >
                    Open builder
                  </Link>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    );
  } catch (error) {
    console.error("TeacherCoursesPage:", error);
    return <ListPageError />;
  }
}
