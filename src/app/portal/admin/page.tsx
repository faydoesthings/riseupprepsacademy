import {
  Users, GraduationCap, DollarSign, Heart, AlertTriangle, Receipt,
  UserPlus, ArrowUpRight, ArrowDownRight, ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminDashboardStats } from "@/lib/stats";
import { formatPKR } from "@/lib/format";
import { AdminCharts } from "@/components/portal/AdminCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const stats = await getAdminDashboardStats();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Admin";

  const kpiCards = [
    { label: "Total Students", value: String(stats.students), icon: GraduationCap, glow: "text-[#F78C1F]", glowBg: "bg-[#F78C1F]/10", trend: "up" as const, change: "Enrolled" },
    { label: "Monthly Revenue", value: formatPKR(stats.monthlyRevenue), icon: DollarSign, glow: "text-[#0ABFBC]", glowBg: "bg-[#0ABFBC]/10", trend: "up" as const, change: "This month" },
    { label: "Outstanding Fees", value: formatPKR(stats.outstandingFees), icon: AlertTriangle, glow: "text-[#C0392B]", glowBg: "bg-[#C0392B]/10", trend: "down" as const, change: `${stats.outstandingCount} pending` },
    { label: "Active Teachers", value: String(stats.teachers), icon: Users, glow: "text-white/60", glowBg: "bg-white/5", trend: "up" as const, change: "On staff" },
  ];

  const recentActivities = [
    ...stats.recentAdmissions.map((app) => ({
      action: "New admission application",
      detail: `${app.studentName} — Grade ${app.gradeApplying}`,
      time: app.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      icon: UserPlus,
      color: "text-[#0ABFBC]",
      bg: "bg-[#0ABFBC]/10",
    })),
    ...stats.recentPayments.map((payment) => ({
      action: "Fee payment received",
      detail: `${payment.student.user.name} — ${formatPKR(payment.amount)}`,
      time: payment.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      icon: DollarSign,
      color: "text-[#F78C1F]",
      bg: "bg-[#F78C1F]/10",
    })),
  ].slice(0, 6);

  return (
    <div>
      <div className="mb-8">
        <p className="text-white/40 text-sm">Welcome back, {firstName}! Here&apos;s your academy overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card, i) => (
          <div key={i} className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-[16px] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/40 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-white font-mono tracking-tight">{card.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {card.trend === "up" && <ArrowUpRight className="w-3 h-3 text-[#0ABFBC]" />}
                  {card.trend === "down" && <ArrowDownRight className="w-3 h-3 text-[#C0392B]" />}
                  <span className="text-xs text-white/30">{card.change}</span>
                </div>
              </div>
              <div className={`w-11 h-11 rounded-xl ${card.glowBg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.glow}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity + Chart */}
      <div className="grid lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-[16px] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-white">Recent Activity</h2>
            <Link href="/portal/admin/admissions" className="text-xs text-[#F78C1F] font-medium hover:underline">View all</Link>
          </div>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">No recent activity yet.</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((a, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center shrink-0`}>
                    <a.icon className={`w-4 h-4 ${a.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{a.action}</p>
                    <p className="text-xs text-white/40 mt-0.5">{a.detail}</p>
                  </div>
                  <span className="text-xs text-white/20 font-mono shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-[16px] p-6">
          <h2 className="text-base font-bold text-white mb-6">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Add Student", href: "/portal/admin/students", icon: UserPlus },
              { label: "Manage Timetable", href: "/portal/admin/timetable", icon: ClipboardCheck },
              { label: "Review Admissions", href: "/portal/admin/admissions", icon: Receipt },
              { label: "View Attendance", href: "/portal/admin/attendance", icon: ClipboardCheck },
            ].map((action, i) => (
              <Link key={i} href={action.href} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-[#F78C1F]/30 hover:bg-[#F78C1F]/5 transition-all">
                <action.icon className="w-4 h-4 text-white/30" />
                <span className="text-sm font-medium text-white/70">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <AdminCharts />
    </div>
  );
}
