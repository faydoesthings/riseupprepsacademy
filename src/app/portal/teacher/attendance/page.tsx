import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import AttendanceMarker from "@/components/portal/attendance/AttendanceMarker";
import { redirect } from "next/navigation";
import { Calendar, Clock, BookOpen } from "lucide-react";
import { attendanceDateRange } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export default async function TeacherAttendancePage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  if ((session.user as { role?: string }).role !== "TEACHER") {
    redirect("/login");
  }

  // Get teacher profile
  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } },
  });

  if (!teacher) {
    return (
      <div className="p-8 text-center text-red-600">
        You must be registered as a Teacher to access this page.
      </div>
    );
  }

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday...
  const dateString = today.toISOString().split("T")[0];

  // Get today's schedule
  const todayPeriods = await prisma.period.findMany({
    where: { 
      teacherId: teacher.id,
      dayOfWeek: dayOfWeek
    },
    include: {
      class: true,
      subject: true,
    },
    orderBy: { startTime: "asc" }
  });

  const selectedPeriodId = searchParams.period || (todayPeriods.length > 0 ? todayPeriods[0].id : undefined);
  const activePeriod = todayPeriods.find(p => p.id === selectedPeriodId);

  const { start: attendanceStart, end: attendanceEnd } = attendanceDateRange(dateString);

  // Fetch students for the active period
  let studentsData: Array<{
    id: string;
    name: string;
    rollNumber: string | null;
    existingStatus?: "PRESENT" | "ABSENT" | "LATE";
  }> = [];
  if (activePeriod) {
    const rawStudents = await prisma.student.findMany({
      where: { classId: activePeriod.classId },
      include: {
        user: true,
        attendances: {
          where: {
            periodId: activePeriod.id,
            date: { gte: attendanceStart, lte: attendanceEnd },
          },
        },
      },
      orderBy: { user: { name: "asc" } }
    });

    studentsData = rawStudents.map(s => ({
      id: s.id,
      name: s.user.name,
      rollNumber: s.rollNumber,
      existingStatus:
        s.attendances.length > 0
          ? (s.attendances[0].status as "PRESENT" | "ABSENT" | "LATE")
          : undefined,
    }));
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Daily Attendance"
        description="Mark student attendance for your scheduled classes today."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Today's Schedule */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-white flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#F78C1F]" />
            Today&apos;s schedule
          </h3>
          
          {todayPeriods.length === 0 ? (
            <div className="p-4 border border-white/[0.08] rounded-xl text-center text-white/40 text-sm bg-white/[0.02]">
              You have no classes scheduled for today.
            </div>
          ) : (
            <div className="space-y-3">
              {todayPeriods.map(period => (
                <a
                  key={period.id}
                  href={`?period=${period.id}`}
                  className={`block p-4 rounded-xl border transition-all ${
                    selectedPeriodId === period.id 
                      ? "border-[#F78C1F]/40 bg-[#F78C1F]/10" 
                      : "border-white/[0.08] bg-white/[0.02] hover:border-[#F78C1F]/30 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${
                      selectedPeriodId === period.id ? "text-[#F78C1F] border-[#F78C1F]/30 bg-[#F78C1F]/10" : "text-white/50 border-white/10"
                    }`}>
                      {period.class.grade} {period.class.section}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-white/40 font-mono">
                      <Clock className="w-3 h-3" />
                      {period.startTime}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-[#F78C1F]" />
                    {period.subject.name}
                  </h4>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right Content: Attendance Marker */}
        <div className="lg:col-span-3">
          {activePeriod ? (
            <AttendanceMarker 
              periodId={activePeriod.id}
              dateString={dateString}
              teacherId={teacher.id}
              students={studentsData}
            />
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-white/40 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02] p-6 text-center text-sm">
              <Calendar className="w-12 h-12 mb-3 text-[#F78C1F]/50" />
              <p>Select a period from your schedule to mark attendance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
