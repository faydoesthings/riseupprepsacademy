import { ClipboardCheck, Calendar, FileText, Users, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

type Period = {
  id: string;
  startTime: string;
  endTime: string;
  subject: { name: string };
  class: { grade: string; section: string | null };
};

type Props = {
  firstName: string;
  specialization: string | null;
  periods: Period[];
  studentCount: number;
  pendingGrading: number;
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

export default function TeacherDashboard({
  firstName,
  specialization,
  periods,
  studentCount,
  pendingGrading,
}: Props) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const activePeriod = periods.find((p) => periodStatus(p.startTime) === "active");

  const kpiCards = [
    { label: "Today's classes", value: String(periods.length), icon: Calendar, tone: "teal" as const },
    { label: "Students today", value: String(studentCount), icon: Users, tone: "orange" as const },
    { label: "To grade", value: String(pendingGrading), icon: FileText, tone: "crimson" as const },
    {
      label: "Specialization",
      value: specialization ?? "—",
      icon: ClipboardCheck,
      tone: "neutral" as const,
      isText: true,
    },
  ];

  return (
    <div className="admin-dashboard animate-fade-in">
      <header className="admin-dashboard__hero">
        <div>
          <p className="admin-dashboard__eyebrow">Teacher portal</p>
          <h1 className="admin-dashboard__title">Dashboard</h1>
          <p className="admin-dashboard__subtitle">
            Welcome back, {firstName}. Here&apos;s your day at a glance.
          </p>
          <p className="admin-dashboard__date">{today}</p>
        </div>
        {pendingGrading > 0 && (
          <div className="admin-dashboard__hero-actions">
            <Link href="/portal/teacher/assignments" className="portal-btn portal-btn--primary">
              Grade submissions <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        )}
      </header>

      <section className="portal-stat-grid portal-stat-grid--4" aria-label="Today's overview">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className={`portal-kpi portal-kpi--${card.tone}`}>
              <div className="portal-kpi__icon" aria-hidden>
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="portal-kpi__body">
                <p className="portal-kpi__label">{card.label}</p>
                <p
                  className={`portal-kpi__value ${"isText" in card && card.isText ? "portal-kpi__value--text" : ""}`}
                  title={"isText" in card && card.isText ? card.value : undefined}
                >
                  {card.value}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      {activePeriod && (
        <div className="portal-active-banner">
          <div>
            <p className="portal-active-banner__eyebrow">Class in progress</p>
            <p className="portal-active-banner__title">
              {activePeriod.subject.name} · {activePeriod.class.grade}
            </p>
            <p className="portal-active-banner__time">
              {activePeriod.startTime} – {activePeriod.endTime}
            </p>
          </div>
          <Link href="/portal/teacher/attendance" className="portal-btn portal-btn--primary">
            Mark attendance <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      )}

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
          <Link href="/portal/teacher/timetable" className="portal-panel__link">
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
                  <Clock
                    className="portal-schedule-row__icon w-4 h-4 shrink-0"
                    aria-hidden
                  />
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
                      {period.class.grade} {period.class.section ?? ""} · {period.startTime} –{" "}
                      {period.endTime}
                    </p>
                  </div>
                  {status === "active" && (
                    <Link
                      href="/portal/teacher/attendance"
                      className="portal-schedule-row__action"
                    >
                      Mark now →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
