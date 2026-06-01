import { ClipboardCheck, Calendar, FileText, Users, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTeacherDashboardData } from "@/lib/stats";

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

export default async function TeacherDashboard() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const data = await getTeacherDashboardData(session.user.email);
  if (!data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-[16px] p-8 text-center text-white/40">
        <p>Your teacher profile is not set up yet. Please contact the administrator.</p>
      </div>
    );
  }

  const { teacher, periods, studentCount, pendingGrading } = data;
  const firstName = teacher.user.name.split(" ")[0];
  const activePeriod = periods.find((p) => periodStatus(p.startTime) === "active");

  return (
    <div>
      <div className="mb-8">
        <p className="text-white/40 text-sm">Good morning, {firstName}! Here&apos;s your day at a glance.</p>
      </div>

      {/* KPI pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's Classes", value: String(periods.length), icon: Calendar, color: "#0ABFBC" },
          { label: "Students Today", value: String(studentCount), icon: Users, color: "#F78C1F" },
          { label: "To Grade", value: String(pendingGrading), icon: FileText, color: "#C0392B" },
          { label: "Specialization", value: teacher.specialization?.split(" ")[0] ?? "—", icon: ClipboardCheck, color: "#05335C" },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-[16px] p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/40">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1 font-mono">{stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active period banner */}
      {activePeriod && (
        <div className="mb-6 p-4 rounded-2xl bg-[#F78C1F]/5 border border-[#F78C1F]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#F78C1F]">Class in progress</p>
            <p className="text-lg font-bold text-white mt-1">
              {activePeriod.subject.name} · {activePeriod.class.grade}
            </p>
            <p className="text-sm text-white/40 font-mono">{activePeriod.startTime} – {activePeriod.endTime}</p>
          </div>
          <Link href="/portal/teacher/attendance" className="btn btn-primary">
            Mark Attendance <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Schedule */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-[16px] p-6">
        <h2 className="text-base font-bold text-white mb-6">Today&apos;s Schedule</h2>
        {periods.length === 0 ? (
          <p className="text-sm text-white/30">You have no classes scheduled for today.</p>
        ) : (
          <div className="space-y-2">
            {periods.map((period) => {
              const status = periodStatus(period.startTime);
              return (
                <div
                  key={period.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    status === "active"
                      ? "border-[#F78C1F] bg-[#F78C1F]/5 animate-pulse-glow"
                      : status === "completed"
                        ? "border-[#0ABFBC]/30 bg-[#0ABFBC]/5"
                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <Clock className={`w-4 h-4 ${status === "active" ? "text-[#F78C1F]" : status === "completed" ? "text-[#0ABFBC]" : "text-white/20"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{period.subject.name}</span>
                      <span className={`badge ${status === "active" ? "badge-orange" : status === "completed" ? "badge-teal" : "badge-navy"}`}>
                        {status === "active" ? "In Progress" : status === "completed" ? "Done" : "Upcoming"}
                      </span>
                    </div>
                    <p className="text-xs text-white/30 mt-0.5 font-mono">
                      {period.class.grade} {period.class.section ?? ""} · {period.startTime} – {period.endTime}
                    </p>
                  </div>
                  {status === "active" && (
                    <Link href="/portal/teacher/attendance" className="text-xs text-[#F78C1F] font-medium hover:underline whitespace-nowrap">
                      Mark now →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
