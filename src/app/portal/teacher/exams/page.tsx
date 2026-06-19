import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import ListPageError from "@/components/ui/ListPageError";
import ExamResultFormModal from "@/components/portal/forms/ExamResultFormModal";
import TeacherProfileMissing from "@/components/portal/TeacherProfileMissing";
import { requirePortalRole } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function TeacherExamsPage() {
  try {
    const session = await requirePortalRole("TEACHER");
    const teacher = await prisma.teacher.findFirst({
      where: { user: { email: session.user?.email ?? "" } },
    });

    if (!teacher) return <TeacherProfileMissing />;

    const subjects = await prisma.subject.findMany({ where: { teacherId: teacher.id } });
    const subjectIds = subjects.map((s) => s.id);

    const results = await prisma.examResult.findMany({
      where: { subjectId: { in: subjectIds } },
      include: { student: { include: { user: true, class: true } }, subject: true },
      orderBy: { createdAt: "desc" },
    });

    const classIds = (
      await prisma.class.findMany({ where: { teacherId: teacher.id }, select: { id: true } })
    ).map((c) => c.id);

    const students =
      classIds.length > 0
        ? await prisma.student.findMany({
            where: { classId: { in: classIds } },
            include: { user: true },
          })
        : [];

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Teacher portal"
          title="Exam results"
          description="Log and manage exam marks for your students."
          customAction={<ExamResultFormModal students={students} subjects={subjects} />}
        />

        <DataTable
          headers={["Exam", "Student", "Class", "Subject", "Score", "Grade"]}
          isEmpty={results.length === 0}
          emptyMessage="No exam results recorded yet."
        >
          {results.map((r) => (
            <tr key={r.id}>
              <td className="font-bold text-white text-sm">{r.examName}</td>
              <td className="text-sm text-white">{r.student.user.name}</td>
              <td className="text-sm text-white/50">
                {r.student.class?.grade} {r.student.class?.section}
              </td>
              <td className="text-sm text-white/70">{r.subject.name}</td>
              <td className="text-sm text-white">
                {r.marks} <span className="text-white/30">/ {r.totalMarks}</span>
              </td>
              <td>
                <span className="badge badge-success">{r.grade}</span>
              </td>
            </tr>
          ))}
        </DataTable>
      </PortalListPage>
    );
  } catch (error) {
    console.error("TeacherExamsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
