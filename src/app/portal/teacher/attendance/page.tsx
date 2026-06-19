import { Suspense } from "react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PortalListPage from "@/components/portal/PortalListPage";
import PageHeader from "@/components/ui/PageHeader";
import DateFilter from "@/components/ui/DateFilter";
import AttendanceMarker from "@/components/portal/attendance/AttendanceMarker";
import TeacherProfileMissing from "@/components/portal/TeacherProfileMissing";
import { redirect } from "next/navigation";
import { Calendar, Clock, BookOpen } from "lucide-react";
import { attendanceDateRange } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default async function TeacherAttendancePage({
  searchParams,
}: {
  searchParams: { period?: string; date?: string };
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  if ((session.user as { role?: string }).role !== "TEACHER") {
    redirect("/login");
  }

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } },
  });

  if (!teacher) return <TeacherProfileMissing />;

  const todayString = new Date().toISOString().split("T")[0];
  const dateString = searchParams.date || todayString;
  const selectedDate = new Date(`${dateString}T12:00:00`);
  const dayOfWeek = selectedDate.getDay();
  const isToday = dateString === todayString;
  const dayLabel = DAY_NAMES[dayOfWeek];

  const schedulePeriods = await prisma.period.findMany({
    where: {
      teacherId: teacher.id,
      dayOfWeek: dayOfWeek,
    },
    include: {
      class: true,
      subject: true,
    },
    orderBy: { startTime: "asc" },
  });

  const selectedPeriodId =
    searchParams.period ||
    (schedulePeriods.length > 0 ? schedulePeriods[0].id : undefined);
  const activePeriod = schedulePeriods.find((p) => p.id === selectedPeriodId);

  const { start: attendanceStart, end: attendanceEnd } = attendanceDateRange(dateString);

  let studentsData: Array<{
    id: string;
    name: string;
    rollNumber: string | null;
    existingStatus?: "PRESENT" | "ABSENT" | "LATE";
    markedAt?: Date;
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
      orderBy: { user: { name: "asc" } },
    });

    studentsData = rawStudents.map((s) => ({
      id: s.id,
      name: s.user.name,
      rollNumber: s.rollNumber,
      existingStatus:
        s.attendances.length > 0
          ? (s.attendances[0].status as "PRESENT" | "ABSENT" | "LATE")
          : undefined,
      markedAt: s.attendances[0]?.markedAt,
    }));
  }

  const alreadyMarkedCount = studentsData.filter((s) => s.existingStatus).length;
  const lastMarkedAt = studentsData
    .map((s) => s.markedAt)
    .filter((d): d is Date => !!d)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const querySuffix = (periodId: string) => {
    const params = new URLSearchParams();
    params.set("period", periodId);
    if (dateString !== todayString) {
      params.set("date", dateString);
    }
    return `?${params.toString()}`;
  };

  return (
    <PortalListPage>
      <PageHeader
        eyebrow="Teacher portal"
        title="Attendance"
        description={
          isToday
            ? "Mark student attendance for today's scheduled classes."
            : `Viewing ${dayLabel}'s schedule for the selected date.`
        }
        customAction={
          <Suspense fallback={null}>
            <DateFilter defaultValue={dateString} />
          </Suspense>
        }
      />

      <div className="portal-attendance-layout">
        <aside className="portal-panel">
          <header className="portal-panel__header portal-panel__header--compact">
            <div>
              <h2 className="portal-panel__title flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F78C1F]" aria-hidden />
                {isToday ? "Today's schedule" : `${dayLabel} schedule`}
              </h2>
              <p className="portal-panel__desc">
                {schedulePeriods.length === 0
                  ? `No classes on ${dayLabel.toLowerCase()}s.`
                  : "Select a period to mark attendance."}
              </p>
            </div>
          </header>

          {schedulePeriods.length === 0 ? (
            <div className="portal-empty-state portal-empty-state--inline">
              <p className="text-white/45 text-sm">
                You have no classes scheduled for this day of the week.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {schedulePeriods.map((period) => (
                <a
                  key={period.id}
                  href={querySuffix(period.id)}
                  className={`portal-period-card ${
                    selectedPeriodId === period.id ? "portal-period-card--active" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="portal-period-card__badge">
                      {period.class.grade} {period.class.section}
                    </span>
                    <span className="portal-period-card__time">
                      <Clock className="w-3 h-3" aria-hidden />
                      {period.startTime}
                    </span>
                  </div>
                  <p className="portal-period-card__subject flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#F78C1F]" aria-hidden />
                    {period.subject.name}
                  </p>
                </a>
              ))}
            </div>
          )}
        </aside>

        <div className="portal-attendance-layout__main">
          {activePeriod ? (
            <AttendanceMarker
              key={`${activePeriod.id}-${dateString}`}
              periodId={activePeriod.id}
              dateString={dateString}
              teacherId={teacher.id}
              students={studentsData}
              periodLabel={`${activePeriod.subject.name} · ${activePeriod.class.grade}${
                activePeriod.class.section ? ` ${activePeriod.class.section}` : ""
              } · ${activePeriod.startTime}`}
              isToday={isToday}
              alreadyMarkedCount={alreadyMarkedCount}
              lastMarkedAt={lastMarkedAt?.toISOString()}
            />
          ) : (
            <div className="portal-empty-state">
              <Calendar className="w-12 h-12 text-[#F78C1F]/40 mx-auto mb-4" aria-hidden />
              <h3 className="text-lg font-bold text-white mb-2">Select a period</h3>
              <p className="text-white/45 text-sm max-w-sm mx-auto">
                Choose a class from the schedule to mark attendance for the selected date.
              </p>
            </div>
          )}
        </div>
      </div>
    </PortalListPage>
  );
}
