import { notFound } from "next/navigation";
import PortalListPage from "@/components/portal/PortalListPage";
import ListPageError from "@/components/ui/ListPageError";
import DonorProfileMissing from "@/components/portal/donor/DonorProfileMissing";
import DonorSponsoredStudentDetail from "@/components/portal/donor/DonorSponsoredStudentDetail";
import { requirePortalRole } from "@/lib/portal-auth";
import { getDonorForPortal, getSponsoredStudentDetail } from "@/lib/donor-portal";

export const dynamic = "force-dynamic";

export default async function DonorSponsoredStudentPage({
  params,
}: {
  params: { studentId: string };
}) {
  try {
    const session = await requirePortalRole("DONOR");
    const donor = await getDonorForPortal(session.user?.email ?? "");
    if (!donor) return <DonorProfileMissing />;

    const detail = await getSponsoredStudentDetail(donor.id, params.studentId);
    if (!detail) notFound();

    const classLabel = detail.student.class
      ? `${detail.student.class.grade}${detail.student.class.section ? ` · ${detail.student.class.section}` : ""}`
      : null;

    return (
      <PortalListPage>
        <DonorSponsoredStudentDetail
          name={detail.student.user.name}
          classLabel={classLabel}
          rollNumber={detail.student.rollNumber}
          status={detail.student.status}
          admissionDate={detail.student.admissionDate}
          attendancePct={detail.attendancePct}
          avgExamPct={detail.avgExamPct}
          assignmentsDue={detail.assignmentsDue}
          assignmentsSubmitted={detail.assignmentsSubmitted}
          gradedCount={detail.gradedCount}
          attendances={detail.monthAttendances.map((a) => ({
            id: a.id,
            date: a.date,
            status: a.status,
            subjectName: a.period.subject.name,
          }))}
          examResults={detail.student.examResults.map((e) => ({
            id: e.id,
            examName: e.examName,
            subjectName: e.subject.name,
            marks: e.marks,
            totalMarks: e.totalMarks,
            grade: e.grade,
            percentage: e.percentage,
            createdAt: e.createdAt,
          }))}
          submissions={detail.student.submissions.map((s) => ({
            id: s.id,
            title: s.assignment.title,
            subjectName: s.assignment.subject.name,
            submittedAt: s.submittedAt,
            grade: s.grade,
            marks: s.marks,
          }))}
        />
      </PortalListPage>
    );
  } catch (error) {
    console.error("DonorSponsoredStudentPage:", error);
    return <ListPageError />;
  }
}
