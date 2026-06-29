import Link from "next/link";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import ListPageError from "@/components/ui/ListPageError";
import { requirePortalRole } from "@/lib/portal-auth";
import { publishCourse, deleteCourse } from "@/app/actions/lms/course-actions";
import CourseListActions from "@/components/portal/lms/CourseListActions";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  try {
    await requirePortalRole("SUPER_ADMIN");
    const search = searchParams.search?.trim() ?? "";

    const courses = await prisma.course.findMany({
      where: search ? { title: { contains: search, mode: "insensitive" } } : undefined,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { modules: true, enrollments: true } },
        modules: { select: { _count: { select: { lessons: true } } } },
      },
    });

    return (
      <div className="animate-fade-in-up">
        <PageHeader
          title="Courses"
          description="Build and manage self-paced LMS courses for students."
          customAction={
            <Link href="/portal/admin/courses/new" className="portal-btn portal-btn--primary">
              Create course
            </Link>
          }
          searchPlaceholder="Search courses..."
        />

        <DataTable
          headers={["Course", "Status", "Modules", "Lessons", "Enrolled", ""]}
          isEmpty={courses.length === 0}
          emptyMessage={
            search ? "No courses match your search." : "Create your first course to get started."
          }
        >
          {courses.map((course) => {
            const lessonCount = course.modules.reduce((s, m) => s + m._count.lessons, 0);
            return (
              <tr key={course.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-6 py-4">
                  <Link
                    href={`/portal/admin/courses/${course.id}`}
                    className="font-semibold text-white hover:text-[#F78C1F] transition-colors"
                  >
                    {course.title}
                  </Link>
                  <p className="text-xs text-white/38 mt-0.5">
                    {course.isPublished ? "Live for students" : "Draft — not visible to students"}
                  </p>
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
                  <CourseListActions
                    courseId={course.id}
                    isPublished={course.isPublished}
                    publishAction={publishCourse}
                    deleteAction={deleteCourse}
                  />
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    );
  } catch (error) {
    console.error("AdminCoursesPage:", error);
    return <ListPageError />;
  }
}
