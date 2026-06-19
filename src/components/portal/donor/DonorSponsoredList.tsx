import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";
import type { SponsoredStudentSummary } from "@/lib/donor-portal";

export default function DonorSponsoredList({
  students,
  compact = false,
}: {
  students: SponsoredStudentSummary[];
  compact?: boolean;
}) {
  if (students.length === 0) {
    return (
      <div className="portal-empty-state portal-empty-state--inline">
        <Users className="w-10 h-10 text-[#F78C1F]/40 mx-auto mb-3" aria-hidden />
        <p className="text-white/45 text-sm">
          No direct sponsorships yet. Contact the academy to sponsor a student.
        </p>
      </div>
    );
  }

  return (
    <ul className={compact ? "portal-sponsored-list" : "portal-sponsored-grid"}>
      {students.map((student) => {
        const initial = student.name.charAt(0).toUpperCase();
        const { metrics } = student;

        return (
          <li key={student.id}>
            <Link
              href={`/portal/donor/sponsored/${student.id}`}
              className="portal-sponsored-card portal-sponsored-card--link"
            >
              <span className="portal-sponsored-card__avatar" aria-hidden>
                {initial}
              </span>
              <div className="portal-sponsored-card__body">
                <p className="portal-sponsored-card__name">{student.name}</p>
                <p className="portal-sponsored-card__meta">
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  {student.classLabel ?? "Class pending"}
                  {student.rollNumber ? ` · Roll ${student.rollNumber}` : ""}
                </p>
                {!compact && (
                  <div className="portal-sponsored-card__stats">
                    <span>
                      <ClipboardCheck className="w-3 h-3" aria-hidden />
                      {metrics.attendancePct !== null ? `${metrics.attendancePct}% attendance` : "No attendance yet"}
                    </span>
                    <span>
                      <TrendingUp className="w-3 h-3" aria-hidden />
                      {metrics.avgExamPct !== null ? `${metrics.avgExamPct}% avg score` : "No exams yet"}
                    </span>
                  </div>
                )}
              </div>
              <ArrowRight className="portal-sponsored-card__chevron w-4 h-4 shrink-0" aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
