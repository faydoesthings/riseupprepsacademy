import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import PeriodFormModal from "@/components/portal/forms/PeriodFormModal";
import { Clock } from "lucide-react";
import DeletePeriodButton from "@/components/portal/timetable/DeletePeriodButton";
import { requirePortalRole } from "@/lib/portal-auth";
import ListPageError from "@/components/ui/ListPageError";

export const dynamic = "force-dynamic";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function TimetablePage() {
  try {
    await requirePortalRole("SUPER_ADMIN");

    const [classes, teachers, periods] = await Promise.all([
      prisma.class.findMany({
        include: { subjects: true },
        orderBy: [{ grade: "asc" }, { section: "asc" }],
      }),
      prisma.teacher.findMany({
        include: { user: true },
        where: { status: "ACTIVE" },
      }),
      prisma.period.findMany({
        include: {
          class: true,
          subject: true,
          teacher: { include: { user: true } },
        },
        orderBy: [{ classId: "asc" }, { dayOfWeek: "asc" }, { startTime: "asc" }],
      }),
    ]);

    return (
      <PortalListPage>
        <PageHeader
          title="Timetable"
          description="Schedule classes, assign teachers, and manage the weekly academy timetable."
          customAction={<PeriodFormModal classes={classes} teachers={teachers} />}
        />

        {classes.map((cls) => {
          const classPeriods = periods.filter((p) => p.classId === cls.id);
          if (classPeriods.length === 0) return null;

          return (
            <section key={cls.id} className="portal-list-section">
              <h2 className="portal-list-section__title">
                <span className="portal-list-section__badge">
                  {cls.grade.replace(/[^0-9]/g, "") || "C"}
                </span>
                {cls.grade} {cls.section ? `— ${cls.section}` : ""}
              </h2>

              <DataTable headers={["Day", "Time slot", "Subject", "Teacher", "Actions"]}>
                {classPeriods.map((period) => (
                  <tr key={period.id}>
                    <td className="font-medium text-white/80 text-sm">
                      {DAYS[period.dayOfWeek]}
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-[#F78C1F] text-xs font-medium border border-white/10">
                        <Clock className="w-3 h-3" aria-hidden />
                        {period.startTime} – {period.endTime}
                      </span>
                    </td>
                    <td className="font-semibold text-white text-sm">{period.subject.name}</td>
                    <td className="text-sm text-white/50">
                      {period.teacher?.user.name || "Unassigned"}
                    </td>
                    <td>
                      <DeletePeriodButton periodId={period.id} />
                    </td>
                  </tr>
                ))}
              </DataTable>
            </section>
          );
        })}

        {periods.length === 0 && (
          <div className="portal-empty-state">
            <Clock className="w-12 h-12 text-[#F78C1F]/40 mx-auto mb-4" aria-hidden />
            <h3 className="text-lg font-bold text-white mb-2">No periods scheduled</h3>
            <p className="text-white/45 text-sm max-w-sm mx-auto">
              Click &quot;Schedule period&quot; to start building the timetable.
            </p>
          </div>
        )}
      </PortalListPage>
    );
  } catch (error) {
    console.error("TimetablePage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
