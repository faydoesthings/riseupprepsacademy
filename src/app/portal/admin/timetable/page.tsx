import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import PeriodFormModal from "@/components/portal/forms/PeriodFormModal";
import { Clock } from "lucide-react";
import DeletePeriodButton from "@/components/portal/timetable/DeletePeriodButton";

export const dynamic = "force-dynamic";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function TimetablePage() {
  const classes = await prisma.class.findMany({
    include: { subjects: true },
    orderBy: [{ grade: "asc" }, { section: "asc" }],
  });

  const teachers = await prisma.teacher.findMany({
    include: { user: true },
    where: { status: "ACTIVE" },
  });

  const periods = await prisma.period.findMany({
    include: {
      class: true,
      subject: true,
      teacher: { include: { user: true } },
    },
    orderBy: [
      { classId: "asc" },
      { dayOfWeek: "asc" },
      { startTime: "asc" },
    ],
  });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Timetable Builder"
        description="Schedule classes, assign teachers, and manage the weekly academy timetable."
        customAction={<PeriodFormModal classes={classes} teachers={teachers} />}
      />

      {classes.map(cls => {
        const classPeriods = periods.filter(p => p.classId === cls.id);
        if (classPeriods.length === 0) return null;

        return (
          <div key={cls.id} className="mb-10 last:mb-0">
            <h3 className="text-xl font-bold text-[#05335C] mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded bg-[#F78C1F]/10 text-[#F78C1F] flex items-center justify-center text-sm">
                {cls.grade.replace(/[^0-9]/g, '') || "C"}
              </span>
              {cls.grade} {cls.section ? `- ${cls.section}` : ""}
            </h3>
            
            <DataTable
              headers={["Day", "Time Slot", "Subject", "Teacher", "Actions"]}
            >
              {classPeriods.map(period => (
                <tr key={period.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-700">
                    {DAYS[period.dayOfWeek]}
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                      <Clock className="w-3 h-3" />
                      {period.startTime} - {period.endTime}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-semibold text-[#05335C]">
                    {period.subject.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {period.teacher?.user.name || "Unassigned"}
                  </td>
                  <td className="px-6 py-3">
                    <DeletePeriodButton periodId={period.id} />
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>
        );
      })}

      {periods.length === 0 && (
        <div className="card-elevated p-12 text-center border-dashed border-2 border-gray-200">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No Periods Scheduled</h3>
          <p className="text-gray-500">Click "Schedule Period" to start building the timetable.</p>
        </div>
      )}
    </div>
  );
}
