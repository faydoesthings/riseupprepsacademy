import { Clock, FileText, Bell, TrendingUp, ClipboardCheck, DollarSign } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStudentDashboardData } from "@/lib/stats";
import { formatPKR } from "@/lib/format";

export const dynamic = "force-dynamic";

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

export default async function StudentDashboard() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const data = await getStudentDashboardData(session.user.email);
  if (!data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-[16px] p-8 text-center text-white/40">
        <p>Your student profile is not set up yet. Please contact the academy office.</p>
      </div>
    );
  }

  const { student, periods, attendancePct, avgPct, latestFee, pendingAssignments, recentResults } = data;
  const firstName = student.user.name.split(" ")[0];

  return (
    <div>
      <div className="mb-8">
        <p className="text-white/40 text-sm">
          Welcome back, {firstName}!{" "}
          {student.class
            ? `${student.class.grade}${student.class.section ? ` · ${student.class.section}` : ""}`
            : "Class not assigned yet"}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Attendance", value: attendancePct !== null ? `${attendancePct}%` : "—", icon: ClipboardCheck, color: "#0ABFBC", sub: "This month" },
          { label: "Avg Score", value: avgPct !== null ? `${avgPct}%` : "—", icon: TrendingUp, color: "#F78C1F", sub: "Recent exams" },
          { label: "Pending Work", value: String(pendingAssignments.length), icon: FileText, color: "#C0392B", sub: "Assignments" },
          { label: "Fee Status", value: latestFee?.status === "CONFIRMED" ? "Paid" : "Pending", icon: DollarSign, color: latestFee?.status === "CONFIRMED" ? "#0ABFBC" : "#C0392B", sub: latestFee ? formatPKR(latestFee.amount) : "No records" },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-[16px] p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/40">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1 font-mono">{stat.value}</p>
                <p className="text-[11px] text-white/20 mt-1">{stat.sub}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Schedule */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-[16px] p-6">
          <h2 className="text-base font-bold text-white mb-6">Today&apos;s Schedule</h2>
          {periods.length === 0 ? (
            <p className="text-sm text-white/30">No classes scheduled for today.</p>
          ) : (
            <div className="space-y-2">
              {periods.map((period) => {
                const status = periodStatus(period.startTime);
                return (
                  <div key={period.id} className={`flex items-center gap-4 p-3 rounded-xl border ${
                    status === "active" ? "bg-[#F78C1F]/5 border-[#F78C1F]/30" : status === "completed" ? "bg-[#0ABFBC]/5 border-[#0ABFBC]/20" : "border-white/5 hover:bg-white/[0.03]"
                  }`}>
                    <Clock className={`w-4 h-4 ${status === "active" ? "text-[#F78C1F]" : status === "completed" ? "text-[#0ABFBC]" : "text-white/20"}`} />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-white">{period.subject.name}</span>
                      <span className="text-xs text-white/30 ml-2">{period.teacher?.user.name ?? "TBA"}</span>
                    </div>
                    <span className="text-xs text-white/20 font-mono">{period.startTime} – {period.endTime}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Assignments */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-[16px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Pending Assignments</h2>
              <Link href="/portal/student/assignments" className="text-xs text-[#F78C1F] font-medium hover:underline">View all</Link>
            </div>
            {pendingAssignments.length === 0 ? (
              <p className="text-sm text-white/30">You&apos;re all caught up!</p>
            ) : (
              <div className="space-y-2">
                {pendingAssignments.map((sub) => (
                  <div key={sub.id} className="p-3 rounded-xl border-l-2 border-l-[#F78C1F] bg-white/[0.02] border border-white/5">
                    <p className="text-sm font-medium text-white">{sub.assignment.title}</p>
                    <p className="text-xs text-white/30 mt-1 font-mono">{sub.assignment.subject.name} · Due {sub.assignment.dueDate.toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Results */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-[16px] p-6">
            <h2 className="text-base font-bold text-white mb-4">Recent Results</h2>
            {recentResults.length === 0 ? (
              <p className="text-sm text-white/30">No exam results yet.</p>
            ) : (
              <div className="space-y-2">
                {recentResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <p className="text-sm font-medium text-white">{result.subject.name}</p>
                      <p className="text-xs text-white/30 font-mono">{result.marks}/{result.totalMarks} · {result.examName}</p>
                    </div>
                    <span className="text-lg font-bold text-[#0ABFBC] font-mono">
                      {result.grade ?? `${Math.round((result.marks / result.totalMarks) * 100)}%`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help card */}
          <div className="rounded-2xl border border-[#F78C1F]/20 bg-gradient-to-br from-[#F78C1F]/5 to-[#C0392B]/5 backdrop-blur-[16px] p-6">
            <div className="flex items-center gap-3 mb-3">
              <Bell className="w-5 h-5 text-[#F78C1F]" />
              <h2 className="font-bold text-white">Need help?</h2>
            </div>
            <p className="text-sm text-white/40 mb-4">View your full timetable, fees, and attendance from the sidebar menu.</p>
            <Link href="/portal/student/timetable" className="btn btn-primary btn-sm w-full">Open Timetable</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
