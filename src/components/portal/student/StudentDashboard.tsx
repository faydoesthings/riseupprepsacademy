import {
  ClipboardCheck,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  ArrowRight,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { formatPKR } from "@/lib/format";

type Period = {
  id: string;
  startTime: string;
  endTime: string;
  subject: { name: string };
  teacher?: { user: { name: string } } | null;
};

type PendingAssignment = {
  id: string;
  assignment: {
    title: string;
    dueDate: Date;
    subject: { name: string };
  };
};

type ExamResult = {
  id: string;
  examName: string;
  marks: number;
  totalMarks: number;
  grade: string | null;
  subject: { name: string };
};

type Props = {
  firstName: string;
  classLabel: string | null;
  periods: Period[];
  attendancePct: number | null;
  avgPct: number | null;
  pendingCount: number;
  feeStatus: "Paid" | "Pending";
  feeAmount: string | null;
  pendingAssignments: PendingAssignment[];
  recentResults: ExamResult[];
  continueLearning?: {
    courseTitle: string;
    courseSlug: string;
    progressPercent: number;
  } | null;
};

function periodStatus(startTime: string): "completed" | "active" | "upcoming" {
  const now = new Date();
  const [h, m] = startTime.split(":").map(Number);
  const start = new Date();
  start.setHours(h, m, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 45);
  if (now > end) return "completed";
  if (now >= start && now <= end) return "active";
  return "upcoming";
}

export default function StudentDashboard({
  firstName,
  classLabel,
  periods,
  attendancePct,
  avgPct,
  pendingCount,
  feeStatus,
  feeAmount,
  pendingAssignments,
  recentResults,
  continueLearning,
}: Props) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const activePeriod = periods.find((p) => periodStatus(p.startTime) === "active");

  const kpiCards = [
    {
      label: "Attendance",
      value: attendancePct !== null ? `${attendancePct}%` : "—",
      sub: "This month",
      icon: ClipboardCheck,
      tone: "teal" as const,
    },
    {
      label: "Avg score",
      value: avgPct !== null ? `${avgPct}%` : "—",
      sub: "Recent exams",
      icon: TrendingUp,
      tone: "orange" as const,
    },
    {
      label: "Pending work",
      value: String(pendingCount),
      sub: "Assignments",
      icon: FileText,
      tone: "crimson" as const,
    },
    {
      label: "Fee status",
      value: feeStatus,
      sub: feeAmount ?? "No records",
      icon: DollarSign,
      tone: feeStatus === "Paid" ? ("teal" as const) : ("crimson" as const),
    },
  ];

  return (
    <div className="admin-dashboard animate-fade-in">
      <header className="admin-dashboard__hero">
        <div>
          <p className="admin-dashboard__eyebrow">Student portal</p>
          <h1 className="admin-dashboard__title">Dashboard</h1>
          <p className="admin-dashboard__subtitle">
            Welcome back, {firstName}. Here&apos;s your day at a glance
            {classLabel ? ` · ${classLabel}` : ""}.
          </p>
          <p className="admin-dashboard__date">{today}</p>
        </div>
        {pendingCount > 0 && (
          <div className="admin-dashboard__hero-actions">
            <Link href="/portal/student/assignments" className="portal-btn portal-btn--primary">
              View assignments <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        )}
      </header>

      {continueLearning && (
        <section className="portal-panel mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F78C1F] mb-1">Continue learning</p>
            <p className="portal-panel__title !text-base">{continueLearning.courseTitle}</p>
            <div className="mt-3 max-w-xs">
              <div className="lms-course-card__progress-label">
                <span>Progress</span>
                <span>{continueLearning.progressPercent}%</span>
              </div>
              <div className="lms-course-card__progress-bar">
                <div className="lms-course-card__progress-fill" style={{ width: `${continueLearning.progressPercent}%` }} />
              </div>
            </div>
          </div>
          <Link
            href={`/portal/student/courses/${continueLearning.courseSlug}`}
            className="portal-btn portal-btn--primary shrink-0 gap-1.5"
          >
            Continue
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </section>
      )}

      <section className="portal-stat-grid portal-stat-grid--4" aria-label="Overview">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className={`portal-kpi portal-kpi--${card.tone}`}>
              <div className="portal-kpi__icon" aria-hidden>
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="portal-kpi__body">
                <p className="portal-kpi__label">{card.label}</p>
                <p className="portal-kpi__value">{card.value}</p>
                <p className="portal-kpi__hint">{card.sub}</p>
              </div>
            </article>
          );
        })}
      </section>

      {activePeriod && (
        <div className="portal-active-banner">
          <div>
            <p className="portal-active-banner__eyebrow">Class in progress</p>
            <p className="portal-active-banner__title">{activePeriod.subject.name}</p>
            <p className="portal-active-banner__time">
              {activePeriod.teacher?.user.name ?? "Teacher TBA"} · {activePeriod.startTime} –{" "}
              {activePeriod.endTime}
            </p>
          </div>
          <Link href="/portal/student/timetable" className="portal-btn portal-btn--primary">
            Full timetable <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      )}

      <div className="portal-student-dashboard-grid">
        <section className="portal-panel" aria-label="Today's schedule">
          <header className="portal-panel__header portal-panel__header--compact">
            <div>
              <h2 className="portal-panel__title">Today&apos;s schedule</h2>
              <p className="portal-panel__desc">
                {periods.length === 0
                  ? "No classes scheduled for today."
                  : `${periods.length} class${periods.length === 1 ? "" : "es"} on your timetable.`}
              </p>
            </div>
            <Link href="/portal/student/timetable" className="portal-panel__link">
              Full timetable <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </header>

          {periods.length === 0 ? (
            <div className="portal-empty-state portal-empty-state--inline">
              <Clock className="w-10 h-10 text-[#F78C1F]/40 mx-auto mb-3" aria-hidden />
              <p className="text-white/45 text-sm">You have no classes scheduled for today.</p>
            </div>
          ) : (
            <div className="portal-schedule-list">
              {periods.map((period) => {
                const status = periodStatus(period.startTime);
                return (
                  <div
                    key={period.id}
                    className={`portal-schedule-row portal-schedule-row--${status}`}
                  >
                    <Clock className="portal-schedule-row__icon w-4 h-4 shrink-0" aria-hidden />
                    <div className="portal-schedule-row__body">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="portal-schedule-row__title">{period.subject.name}</span>
                        <span
                          className={`badge ${
                            status === "active"
                              ? "badge-orange"
                              : status === "completed"
                                ? "badge-teal"
                                : "badge-navy"
                          }`}
                        >
                          {status === "active"
                            ? "In progress"
                            : status === "completed"
                              ? "Done"
                              : "Upcoming"}
                        </span>
                      </div>
                      <p className="portal-schedule-row__meta">
                        {period.teacher?.user.name ?? "TBA"} · {period.startTime} – {period.endTime}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="portal-student-dashboard-sidebar">
          <section className="portal-panel">
            <header className="portal-panel__header portal-panel__header--compact">
              <div>
                <h2 className="portal-panel__title">Pending assignments</h2>
                <p className="portal-panel__desc">
                  {pendingAssignments.length === 0
                    ? "You're all caught up."
                    : `${pendingAssignments.length} awaiting submission.`}
                </p>
              </div>
              <Link href="/portal/student/assignments" className="portal-panel__link">
                View all <ArrowRight className="w-3.5 h-3.5" aria-hidden />
              </Link>
            </header>

            {pendingAssignments.length === 0 ? (
              <p className="portal-panel-empty">No pending work right now.</p>
            ) : (
              <div className="space-y-2">
                {pendingAssignments.map((sub) => (
                  <div key={sub.id} className="portal-dashboard-list-item">
                    <p className="portal-dashboard-list-item__title">{sub.assignment.title}</p>
                    <p className="portal-dashboard-list-item__meta">
                      {sub.assignment.subject.name} · Due{" "}
                      {sub.assignment.dueDate.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="portal-panel">
            <header className="portal-panel__header portal-panel__header--compact">
              <div>
                <h2 className="portal-panel__title">Recent results</h2>
                <p className="portal-panel__desc">Your latest exam scores.</p>
              </div>
              <Link href="/portal/student/exams" className="portal-panel__link">
                View all <ArrowRight className="w-3.5 h-3.5" aria-hidden />
              </Link>
            </header>

            {recentResults.length === 0 ? (
              <p className="portal-panel-empty">No exam results yet.</p>
            ) : (
              <div className="space-y-2">
                {recentResults.map((result) => (
                  <div key={result.id} className="portal-dashboard-list-item portal-dashboard-list-item--row">
                    <div>
                      <p className="portal-dashboard-list-item__title">{result.subject.name}</p>
                      <p className="portal-dashboard-list-item__meta">
                        {result.marks}/{result.totalMarks} · {result.examName}
                      </p>
                    </div>
                    <span className="portal-dashboard-list-item__score">
                      {result.grade ??
                        `${Math.round((result.marks / result.totalMarks) * 100)}%`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="portal-help-banner">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-5 h-5 text-[#F78C1F]" aria-hidden />
              <h2 className="font-bold text-white text-sm">Need help?</h2>
            </div>
            <p className="text-sm text-white/40 mb-4">
              View your full timetable, fees, and attendance from the sidebar menu.
            </p>
            <Link href="/portal/student/timetable" className="portal-btn portal-btn--primary w-full">
              Open timetable
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
