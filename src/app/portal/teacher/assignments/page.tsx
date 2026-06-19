import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import AssignmentFormModal from "@/components/portal/forms/AssignmentFormModal";
import GradeAssignmentLauncher from "@/components/portal/assignments/GradeAssignmentLauncher";
import TeacherProfileMissing from "@/components/portal/TeacherProfileMissing";
import { ExternalLink, Users } from "lucide-react";
import Link from "next/link";
import { requirePortalRole } from "@/lib/portal-auth";
import { paginationArgs, parsePageParam } from "@/lib/list-query";

export const dynamic = "force-dynamic";

export default async function TeacherAssignmentsPage({
  searchParams,
}: {
  searchParams: { page?: string; grade?: string };
}) {
  try {
    const session = await requirePortalRole("TEACHER");
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);

    const teacher = await prisma.teacher.findFirst({
      where: { user: { email: session.user?.email ?? "" } },
    });

    if (!teacher) return <TeacherProfileMissing />;

    const where = { teacherId: teacher.id };

    const [assignments, total, classes, subjects, gradingAssignment] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          class: true,
          subject: true,
          _count: { select: { submissions: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.assignment.count({ where }),
      prisma.class.findMany({
        where: { teacherId: teacher.id },
        orderBy: { grade: "asc" },
      }),
      prisma.subject.findMany({
        where: { teacherId: teacher.id },
        orderBy: { name: "asc" },
      }),
      searchParams.grade
        ? prisma.assignment.findFirst({
            where: { id: searchParams.grade, teacherId: teacher.id },
            include: {
              submissions: {
                include: { student: { include: { user: true } } },
              },
            },
          })
        : null,
    ]);

    const gradingSubmissions =
      gradingAssignment?.submissions.map((s) => ({
        id: s.id,
        studentName: s.student.user.name,
        fileUrl: s.fileUrl,
        marks: s.marks,
        grade: s.grade,
        totalMarks: null,
      })) ?? [];

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Teacher portal"
          title="Assignments"
          description="Create and grade homework and assignments for your classes."
          customAction={
            <AssignmentFormModal classes={classes} subjects={subjects} teacherId={teacher.id} />
          }
        />

        <DataTable
          headers={["Title", "Class & subject", "Due date", "Submissions", "Resource", "Actions"]}
          isEmpty={assignments.length === 0}
          emptyMessage="No assignments created yet."
        >
          {assignments.map((a) => (
            <tr key={a.id}>
              <td>
                <span className="font-bold text-white block text-sm">{a.title}</span>
                {a.description && (
                  <span className="text-xs text-white/40 line-clamp-1">{a.description}</span>
                )}
              </td>
              <td>
                <span className="badge badge-info text-xs mb-1">{a.class.grade}</span>
                <span className="text-xs text-white/50 block">{a.subject.name}</span>
              </td>
              <td className="text-sm text-white/60">{a.dueDate.toLocaleDateString()}</td>
              <td>
                <span className="flex items-center gap-1 text-sm font-semibold text-[#0ABFBC]">
                  <Users className="w-4 h-4" aria-hidden /> {a._count.submissions}
                </span>
              </td>
              <td>
                {a.fileUrl ? (
                  <a
                    href={a.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#F78C1F] hover:underline flex items-center gap-1 text-sm"
                  >
                    View <ExternalLink className="w-3 h-3" aria-hidden />
                  </a>
                ) : (
                  <span className="text-white/30 text-sm">—</span>
                )}
              </td>
              <td>
                <Link
                  href={`/portal/teacher/assignments?grade=${a.id}`}
                  className="portal-btn portal-btn--ghost text-xs px-3 py-1.5 min-h-[36px]"
                >
                  Grade
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>

        <Pagination page={page} total={total} basePath="/portal/teacher/assignments" />

        {gradingAssignment && (
          <GradeAssignmentLauncher
            assignmentId={gradingAssignment.id}
            assignmentTitle={gradingAssignment.title}
            submissions={gradingSubmissions}
          />
        )}
      </PortalListPage>
    );
  } catch (error) {
    console.error("TeacherAssignmentsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
