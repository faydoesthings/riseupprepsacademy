import { getAdminDashboardStats, getAdminChartData, getEmptyAdminChartData, getEmptyAdminDashboardStats } from "@/lib/stats";
import { getLmsAdminStats } from "@/lib/lms/stats";
import { requirePortalRole } from "@/lib/portal-auth";
import { getDbUnavailableCopy } from "@/lib/db-environment";
import { formatPKR } from "@/lib/format";
import { formatGradeApplying } from "@/data/admissions";
import AdminDashboard from "@/components/portal/admin/AdminDashboard";
import type { AdminActivityItem } from "@/lib/dashboard-types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requirePortalRole("SUPER_ADMIN");

  let dbUnavailable = false;
  let stats = getEmptyAdminDashboardStats();
  let chartData = getEmptyAdminChartData();
  let lmsStats = {
    publishedCourses: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    certificatesIssued: 0,
    upcomingVivas: 0,
  };

  try {
    [stats, chartData, lmsStats] = await Promise.all([
      getAdminDashboardStats(),
      getAdminChartData(),
      getLmsAdminStats(),
    ]);
  } catch (error) {
    dbUnavailable = true;
    console.error("Admin dashboard data unavailable:", error);
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? "Admin";

  const kpiCards = [
    {
      label: "Total Students",
      value: String(stats.students),
      hint: "Currently enrolled",
      iconName: "GraduationCap" as const,
      tone: "orange" as const,
    },
    {
      label: "Monthly Revenue",
      value: formatPKR(stats.monthlyRevenue),
      hint: "Confirmed fees this month",
      iconName: "DollarSign" as const,
      tone: "teal" as const,
    },
    {
      label: "Outstanding Fees",
      value: formatPKR(stats.outstandingFees),
      hint: `${stats.outstandingCount} payment${stats.outstandingCount === 1 ? "" : "s"} pending`,
      iconName: "AlertTriangle" as const,
      tone: "crimson" as const,
    },
    {
      label: "Active Teachers",
      value: String(stats.teachers),
      hint: "On staff today",
      iconName: "Users" as const,
      tone: "neutral" as const,
    },
  ];

  const recentActivities: AdminActivityItem[] = [
    ...stats.recentAdmissions.map((app) => ({
      action: "New admission application",
      detail: `${app.studentName} — ${formatGradeApplying(app.gradeApplying)}`,
      time: app.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      iconName: "UserPlus" as const,
      tone: "teal" as const,
    })),
    ...stats.recentPayments.map((payment) => ({
      action: "Fee payment received",
      detail: `${payment.student.user.name} — ${formatPKR(payment.amount)}`,
      time: payment.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      iconName: "DollarSign" as const,
      tone: "orange" as const,
    })),
  ].slice(0, 6);

  const dbCopy = getDbUnavailableCopy();

  return (
    <AdminDashboard
      firstName={firstName}
      pendingAdmissions={stats.pendingAdmissions}
      kpiCards={kpiCards}
      recentActivities={recentActivities}
      chartData={chartData}
      dbUnavailable={dbUnavailable}
      dbUnavailableTitle={dbCopy.title}
      dbUnavailableText={dbCopy.text}
      lmsStats={lmsStats}
    />
  );
}
