import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import ListPageError from "@/components/ui/ListPageError";
import SubjectFilterNav from "@/components/portal/student/SubjectFilterNav";
import StudentProfileMissing from "@/components/portal/student/StudentProfileMissing";
import { requirePortalRole } from "@/lib/portal-auth";
import { getStudentForPortal, parseSubjectParam } from "@/lib/student-portal";
import { GraduationCap, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentExamsPage({
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

    const results = await prisma.examResult.findMany({
      where: {
        studentId: student.id,
        ...(subjectId ? { subjectId } : {}),
      },
      include: { subject: true },
      orderBy: { createdAt: "desc" },
    });

    const allResults = await prisma.examResult.findMany({
      where: { studentId: student.id },
      select: { subjectId: true, percentage: true },
    });
    const countMap: Record<string, number> = {};
    for (const result of allResults) {
      countMap[result.subjectId] = (countMap[result.subjectId] ?? 0) + 1;
    }

    const totalExams = results.length;
    const averagePercentage =
      totalExams > 0
        ? results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalExams
        : 0;

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Student portal"
          title="Exam results"
          description={
            selectedSubject
              ? `Performance in ${selectedSubject.name}.`
              : "Track your academic performance and exam scores."
          }
        />

        <div className="portal-subject-layout">
          <aside className="portal-panel portal-subject-layout__sidebar">
            <SubjectFilterNav
              subjects={subjects}
              basePath="/portal/student/exams"
              currentSubjectId={subjectId}
              counts={countMap}
            />
          </aside>

          <div className="portal-subject-layout__main">
            <section className="portal-stat-grid mb-6" aria-label="Exam summary">
              <article className="portal-kpi portal-kpi--teal">
                <div className="portal-kpi__icon" aria-hidden>
                  <TrendingUp className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="portal-kpi__body">
                  <p className="portal-kpi__label">
                    {selectedSubject ? `${selectedSubject.name} average` : "Overall average"}
                  </p>
                  <p className="portal-kpi__value">
                    {totalExams > 0 ? `${averagePercentage.toFixed(1)}%` : "—"}
                  </p>
                </div>
              </article>
              <article className="portal-kpi portal-kpi--orange">
                <div className="portal-kpi__icon" aria-hidden>
                  <GraduationCap className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="portal-kpi__body">
                  <p className="portal-kpi__label">Total exams</p>
                  <p className="portal-kpi__value">{totalExams}</p>
                </div>
              </article>
            </section>

            <DataTable
              headers={["Exam", "Subject", "Score", "Percentage", "Grade"]}
              isEmpty={results.length === 0}
              emptyMessage={
                selectedSubject
                  ? `No exam results published for ${selectedSubject.name} yet.`
                  : "No exam results have been published yet."
              }
            >
              {results.map((result) => (
                <tr key={result.id}>
                  <td className="font-bold text-white text-sm">{result.examName}</td>
                  <td className="text-sm text-white/70">{result.subject.name}</td>
                  <td className="text-sm text-white">
                    {result.marks} <span className="text-white/30">/ {result.totalMarks}</span>
                  </td>
                  <td className="text-sm text-white/60">{result.percentage?.toFixed(1)}%</td>
                  <td>
                    <span className="badge badge-success">{result.grade}</span>
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>
        </div>
      </PortalListPage>
    );
  } catch (error) {
    console.error("StudentExamsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
