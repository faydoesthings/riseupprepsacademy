import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import ListPageError from "@/components/ui/ListPageError";
import SubjectFilterNav from "@/components/portal/student/SubjectFilterNav";
import StudentProfileMissing from "@/components/portal/student/StudentProfileMissing";
import { requirePortalRole } from "@/lib/portal-auth";
import { getStudentForPortal, parseSubjectParam } from "@/lib/student-portal";
import { ClipboardCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentAttendancePage({
  searchParams,
}: {
  searchParams: { subject?: string };
}) {
  try {
    const session = await requirePortalRole("STUDENT");
    const student = await getStudentForPortal(session.user?.email ?? "");
    if (!student) return <StudentProfileMissing />;

    const subjects = student.class?.subjects ?? [];
    const subjectId = parseSubjectParam(searchParams.subject);
    const selectedSubject = subjects.find((s) => s.id === subjectId);

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const attendanceFrom =
      student.admissionDate > monthStart ? student.admissionDate : monthStart;

    const records = await prisma.attendance.findMany({
      where: {
        studentId: student.id,
        date: { gte: attendanceFrom },
        ...(subjectId ? { period: { subjectId } } : {}),
      },
      include: { period: { include: { subject: true } } },
      orderBy: { date: "desc" },
      take: 60,
    });

    const allRecords = await prisma.attendance.findMany({
      where: { studentId: student.id, date: { gte: attendanceFrom } },
      include: { period: { select: { subjectId: true } } },
    });
    const countMap: Record<string, number> = {};
    for (const record of allRecords) {
      const sid = record.period.subjectId;
      countMap[sid] = (countMap[sid] ?? 0) + 1;
    }

    const present = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
    const pct = records.length > 0 ? Math.round((present / records.length) * 100) : null;

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Student portal"
          title="Attendance"
          description={
            selectedSubject
              ? `Your attendance record for ${selectedSubject.name} this month.`
              : "Your attendance record for the current month."
          }
        />

        <div className="portal-subject-layout">
          <aside className="portal-panel portal-subject-layout__sidebar">
            <SubjectFilterNav
              subjects={subjects}
              basePath="/portal/student/attendance"
              currentSubjectId={subjectId}
              counts={countMap}
            />
          </aside>

          <div className="portal-subject-layout__main">
            {pct !== null && (
              <section className="portal-stat-grid mb-6" aria-label="Attendance summary">
                <article className="portal-kpi portal-kpi--teal">
                  <div className="portal-kpi__icon" aria-hidden>
                    <ClipboardCheck className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="portal-kpi__body">
                    <p className="portal-kpi__label">This month</p>
                    <p className="portal-kpi__value">{pct}%</p>
                    <p className="portal-kpi__hint">
                      {present} present / late of {records.length} marked
                    </p>
                  </div>
                </article>
              </section>
            )}

            <DataTable
              headers={["Date", "Subject", "Status"]}
              isEmpty={records.length === 0}
              emptyMessage={
                selectedSubject
                  ? `No attendance marked for ${selectedSubject.name} this month yet.`
                  : "No attendance marked for you this month yet."
              }
            >
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="text-sm text-white/80">{record.date.toLocaleDateString()}</td>
                  <td className="text-sm text-white">{record.period.subject.name}</td>
                  <td>
                    <span
                      className={`badge ${
                        record.status === "PRESENT"
                          ? "badge-success"
                          : record.status === "LATE"
                            ? "badge-warning"
                            : "badge-error"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>
        </div>
      </PortalListPage>
    );
  } catch (error) {
    console.error("StudentAttendancePage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
