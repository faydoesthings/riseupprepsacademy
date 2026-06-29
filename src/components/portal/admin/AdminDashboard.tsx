"use client";

import Link from "next/link";
import {
  GraduationCap,
  DollarSign,
  AlertTriangle,
  Users,
  UserPlus,
  Receipt,
  ClipboardCheck,
  CalendarDays,
  ChevronRight,
  Heart,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { AdminCharts } from "@/components/portal/AdminCharts";
import type { AdminActivityItem, AdminChartData, KpiCard } from "@/lib/dashboard-types";

const activityIconMap = {
  UserPlus,
  DollarSign,
} as const;

const kpiIconMap = {
  GraduationCap,
  DollarSign,
  AlertTriangle,
  Users,
} as const;

const quickActions = [
  { label: "Add Student", href: "/portal/admin/students", icon: UserPlus, description: "Enroll a new learner" },
  { label: "Manage Timetable", href: "/portal/admin/timetable", icon: CalendarDays, description: "Update class schedules" },
  { label: "Review Admissions", href: "/portal/admin/admissions", icon: Receipt, description: "Process applications" },
  { label: "View Attendance", href: "/portal/admin/attendance", icon: ClipboardCheck, description: "Today's class records" },
] as const;

type Props = {
  firstName: string;
  pendingAdmissions: number;
  kpiCards: KpiCard[];
  recentActivities: AdminActivityItem[];
  chartData: AdminChartData;
  dbUnavailable?: boolean;
  dbUnavailableTitle?: string;
  dbUnavailableText?: string;
  lmsStats?: {
    publishedCourses: number;
    activeEnrollments: number;
    completedEnrollments: number;
    certificatesIssued: number;
    upcomingVivas: number;
  };
};

export default function AdminDashboard({
  firstName,
  pendingAdmissions,
  kpiCards,
  recentActivities,
  chartData,
  dbUnavailable = false,
  dbUnavailableTitle = "Database offline",
  dbUnavailableText = "Live stats could not load.",
  lmsStats,
}: Props) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="admin-dashboard animate-fade-in">
      {dbUnavailable && (
        <div className="portal-db-alert" role="status">
          <AlertCircle className="w-5 h-5 shrink-0" aria-hidden />
          <div>
            <p className="portal-db-alert__title">{dbUnavailableTitle}</p>
            <p className="portal-db-alert__text">{dbUnavailableText}</p>
          </div>
        </div>
      )}

      <header className="admin-dashboard__hero">
        <div className="admin-dashboard__hero-copy">
          <p className="admin-dashboard__eyebrow">Admin portal</p>
          <h1 className="admin-dashboard__title">Dashboard</h1>
          <p className="admin-dashboard__subtitle">
            Welcome back, <span className="text-white/90">{firstName}</span>. Here&apos;s your
            academy overview for today.
          </p>
          <p className="admin-dashboard__date">{today}</p>
        </div>
        <div className="admin-dashboard__hero-actions">
          {pendingAdmissions > 0 && (
            <Link href="/portal/admin/admissions" className="portal-btn portal-btn--ghost">
              <Receipt className="w-4 h-4" aria-hidden />
              {pendingAdmissions} pending admission{pendingAdmissions === 1 ? "" : "s"}
            </Link>
          )}
          <Link href="/portal/admin/students" className="portal-btn portal-btn--primary">
            <UserPlus className="w-4 h-4" aria-hidden />
            Add student
          </Link>
        </div>
      </header>

      <section className="admin-dashboard__kpis" aria-label="Key metrics">
        {kpiCards.map((card) => {
          const KpiIcon = kpiIconMap[card.iconName];
          return (
            <article key={card.label} className={`portal-kpi portal-kpi--${card.tone}`}>
              <div className="portal-kpi__icon" aria-hidden>
                <KpiIcon className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="portal-kpi__body">
                <p className="portal-kpi__label">{card.label}</p>
                <p className="portal-kpi__value">{card.value}</p>
                <p className="portal-kpi__hint">{card.hint}</p>
              </div>
            </article>
          );
        })}
      </section>

      {lmsStats && (
        <section className="portal-panel mb-6" aria-label="LMS overview">
          <header className="portal-panel__header portal-panel__header--compact">
            <div>
              <h2 className="portal-panel__title">Learning platform</h2>
              <p className="portal-panel__desc">Self-paced courses, enrollments, and certificates.</p>
            </div>
            <Link href="/portal/admin/courses" className="portal-panel__link">
              Manage courses
            </Link>
          </header>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="lms-stat">
              <p className="lms-stat__value">{lmsStats.publishedCourses}</p>
              <p className="lms-stat__label">Published courses</p>
            </div>
            <div className="lms-stat">
              <p className="lms-stat__value">{lmsStats.activeEnrollments}</p>
              <p className="lms-stat__label">Active enrollments</p>
            </div>
            <div className="lms-stat">
              <p className="lms-stat__value">{lmsStats.certificatesIssued}</p>
              <p className="lms-stat__label">Certificates</p>
            </div>
            <div className="lms-stat">
              <p className="lms-stat__value">{lmsStats.upcomingVivas}</p>
              <p className="lms-stat__label">Upcoming vivas</p>
            </div>
          </div>
        </section>
      )}

      <div className="admin-dashboard__grid">
        <section className="portal-panel admin-dashboard__activity" aria-labelledby="admin-recent-activity">
          <div className="portal-panel__header">
            <div>
              <h2 id="admin-recent-activity" className="portal-panel__title">
                Recent activity
              </h2>
              <p className="portal-panel__desc">Latest admissions and fee payments</p>
            </div>
            <Link href="/portal/admin/admissions" className="portal-panel__link">
              View all
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <div className="portal-empty">
              <Inbox className="w-8 h-8 text-white/25" aria-hidden />
              <p>No recent activity yet.</p>
            </div>
          ) : (
            <ul className="portal-activity-list">
              {recentActivities.map((item, i) => {
                const Icon = activityIconMap[item.iconName];
                return (
                  <li key={`${item.action}-${i}`}>
                    <div className={`portal-activity-row portal-activity-row--${item.tone}`}>
                      <div className="portal-activity-row__icon" aria-hidden>
                        <Icon className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <div className="portal-activity-row__body">
                        <p className="portal-activity-row__title">{item.action}</p>
                        <p className="portal-activity-row__detail">{item.detail}</p>
                      </div>
                      <time className="portal-activity-row__time">{item.time}</time>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="portal-panel admin-dashboard__actions" aria-labelledby="admin-quick-actions">
          <div className="portal-panel__header">
            <div>
              <h2 id="admin-quick-actions" className="portal-panel__title">
                Quick actions
              </h2>
              <p className="portal-panel__desc">Common admin tasks</p>
            </div>
          </div>
          <ul className="portal-action-list">
            {quickActions.map((action) => (
              <li key={action.href}>
                <Link href={action.href} className="portal-action-link">
                  <span className="portal-action-link__icon" aria-hidden>
                    <action.icon className="w-[1.125rem] h-[1.125rem]" strokeWidth={2} />
                  </span>
                  <span className="portal-action-link__text">
                    <span className="portal-action-link__label">{action.label}</span>
                    <span className="portal-action-link__desc">{action.description}</span>
                  </span>
                  <ChevronRight className="portal-action-link__chevron w-4 h-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/portal/admin/donors" className="portal-inline-cta">
            <Heart className="w-4 h-4 text-[#F78C1F]" aria-hidden />
            <span>View donor records</span>
            <ChevronRight className="w-4 h-4 opacity-50" aria-hidden />
          </Link>
        </section>
      </div>

      <div className="admin-dashboard__charts">
        <AdminCharts data={chartData} />
      </div>
    </div>
  );
}
