import Link from "next/link";
import {
  ArrowLeft,
  ClipboardCheck,
  FileText,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import DataTable from "@/components/ui/DataTable";

type AttendanceRow = {
  id: string;
  date: Date;
  status: string;
  subjectName: string;
};

type ExamRow = {
  id: string;
  examName: string;
  subjectName: string;
  marks: number;
  totalMarks: number;
  grade: string | null;
  percentage: number | null;
  createdAt: Date;
};

type SubmissionRow = {
  id: string;
  title: string;
  subjectName: string;
  submittedAt: Date;
  grade: string | null;
  marks: number | null;
};

type Props = {
  name: string;
  classLabel: string | null;
  rollNumber: string | null;
  status: string;
  admissionDate: Date;
  attendancePct: number | null;
  avgExamPct: number | null;
  assignmentsDue: number;
  assignmentsSubmitted: number;
  gradedCount: number;
  attendances: AttendanceRow[];
  examResults: ExamRow[];
  submissions: SubmissionRow[];
};

function attendanceBadge(status: string) {
  if (status === "PRESENT") return "badge-success";
  if (status === "LATE") return "badge-warning";
  return "badge-error";
}

export default function DonorSponsoredStudentDetail({
  name,
  classLabel,
  rollNumber,
  status,
  admissionDate,
  attendancePct,
  avgExamPct,
  assignmentsDue,
  assignmentsSubmitted,
  gradedCount,
  attendances,
  examResults,
  submissions,
}: Props) {
  const assignmentPct =
    assignmentsDue > 0 ? Math.round((assignmentsSubmitted / assignmentsDue) * 100) : null;

  return (
    <div className="portal-sponsored-detail animate-fade-in">
      <Link href="/portal/donor/sponsored" className="portal-sponsored-detail__back">
        <ArrowLeft className="w-4 h-4" aria-hidden />
        Back to sponsored students
      </Link>

      <header className="portal-sponsored-detail__hero portal-panel">
        <div className="portal-sponsored-detail__profile">
          <span className="portal-sponsored-card__avatar portal-sponsored-card__avatar--lg" aria-hidden>
            {name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="portal-sponsored-detail__name font-display">{name}</h1>
            <p className="portal-sponsored-detail__meta">
              <GraduationCap className="w-4 h-4 shrink-0" aria-hidden />
              {classLabel ?? "Class pending"}
              {rollNumber ? ` · Roll ${rollNumber}` : ""}
            </p>
            <p className="portal-sponsored-detail__since">
              Sponsored since {admissionDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <span className={`badge ${status === "ACTIVE" ? "badge-success" : "badge-warning"}`}>
          {status}
        </span>
      </header>

      <section className="portal-stat-grid portal-stat-grid--4" aria-label="Progress overview">
        <article className="portal-kpi portal-kpi--teal">
          <div className="portal-kpi__icon" aria-hidden>
            <ClipboardCheck className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="portal-kpi__body">
            <p className="portal-kpi__label">Attendance this month</p>
            <p className="portal-kpi__value">{attendancePct !== null ? `${attendancePct}%` : "—"}</p>
            <p className="portal-kpi__hint">Present & late days</p>
          </div>
        </article>
        <article className="portal-kpi portal-kpi--orange">
          <div className="portal-kpi__icon" aria-hidden>
            <TrendingUp className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="portal-kpi__body">
            <p className="portal-kpi__label">Average exam score</p>
            <p className="portal-kpi__value">{avgExamPct !== null ? `${avgExamPct}%` : "—"}</p>
            <p className="portal-kpi__hint">{examResults.length} exam records</p>
          </div>
        </article>
        <article className="portal-kpi portal-kpi--neutral">
          <div className="portal-kpi__icon" aria-hidden>
            <FileText className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="portal-kpi__body">
            <p className="portal-kpi__label">Assignments submitted</p>
            <p className="portal-kpi__value">
              {assignmentsDue > 0 ? `${assignmentsSubmitted}/${assignmentsDue}` : assignmentsSubmitted}
            </p>
            <p className="portal-kpi__hint">
              {assignmentPct !== null ? `${assignmentPct}% of due work` : "No due assignments yet"}
            </p>
          </div>
        </article>
        <article className="portal-kpi portal-kpi--teal">
          <div className="portal-kpi__icon" aria-hidden>
            <TrendingUp className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="portal-kpi__body">
            <p className="portal-kpi__label">Graded submissions</p>
            <p className="portal-kpi__value">{gradedCount}</p>
            <p className="portal-kpi__hint">Teacher feedback received</p>
          </div>
        </article>
      </section>

      <div className="portal-sponsored-detail__grid">
        <section className="portal-panel" aria-label="Exam results">
          <header className="portal-panel__header portal-panel__header--compact">
            <div>
              <h2 className="portal-panel__title">Exam results</h2>
              <p className="portal-panel__desc">Scores across subjects at RiseUp.</p>
            </div>
          </header>
          <DataTable
            embedded
            headers={["Exam", "Subject", "Score", "Grade"]}
            isEmpty={examResults.length === 0}
            emptyMessage="No exam results recorded yet."
          >
            {examResults.map((exam) => {
              const pct =
                exam.percentage ??
                (exam.totalMarks > 0 ? Math.round((exam.marks / exam.totalMarks) * 100) : null);
              return (
                <tr key={exam.id}>
                  <td className="text-sm text-white">{exam.examName}</td>
                  <td className="text-sm text-white/55">{exam.subjectName}</td>
                  <td className="text-sm font-mono font-bold text-[#F78C1F]">
                    {exam.marks}/{exam.totalMarks}
                    {pct !== null && <span className="text-white/40 font-normal"> ({pct}%)</span>}
                  </td>
                  <td>
                    {exam.grade ? (
                      <span className="badge badge-info">{exam.grade}</span>
                    ) : (
                      <span className="text-sm text-white/35">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </section>

        <section className="portal-panel" aria-label="Monthly attendance">
          <header className="portal-panel__header portal-panel__header--compact">
            <div>
              <h2 className="portal-panel__title">Attendance this month</h2>
              <p className="portal-panel__desc">Daily presence by subject.</p>
            </div>
          </header>
          <DataTable
            embedded
            headers={["Date", "Subject", "Status"]}
            isEmpty={attendances.length === 0}
            emptyMessage="No attendance marked this month yet."
          >
            {attendances.map((row) => (
              <tr key={row.id}>
                <td className="text-sm text-white/50 font-mono">
                  {row.date.toLocaleDateString()}
                </td>
                <td className="text-sm text-white">{row.subjectName}</td>
                <td>
                  <span className={`badge ${attendanceBadge(row.status)}`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </DataTable>
        </section>
      </div>

      <section className="portal-panel" aria-label="Assignment progress">
        <header className="portal-panel__header portal-panel__header--compact">
          <div>
            <h2 className="portal-panel__title">Assignment progress</h2>
            <p className="portal-panel__desc">Submitted work and grading status.</p>
          </div>
        </header>
        <DataTable
          embedded
          headers={["Assignment", "Subject", "Submitted", "Result"]}
          isEmpty={submissions.length === 0}
          emptyMessage="No assignments submitted yet."
        >
          {submissions.map((sub) => (
            <tr key={sub.id}>
              <td className="text-sm text-white">{sub.title}</td>
              <td className="text-sm text-white/55">{sub.subjectName}</td>
              <td className="text-sm text-white/50 font-mono">
                {sub.submittedAt.toLocaleDateString()}
              </td>
              <td>
                {sub.grade ? (
                  <span className="badge badge-success">{sub.grade}</span>
                ) : sub.marks != null ? (
                  <span className="text-sm font-mono text-[#0ABFBC]">{sub.marks} marks</span>
                ) : (
                  <span className="badge badge-warning">Awaiting grade</span>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </section>
    </div>
  );
}
