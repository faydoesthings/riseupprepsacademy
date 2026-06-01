import { Suspense } from "react";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import DateFilter from "@/components/ui/DateFilter";
import { attendanceDateRange } from "@/lib/auth-utils";
import { Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const dateString = searchParams.date || new Date().toISOString().split("T")[0];
  const { start, end } = attendanceDateRange(dateString);

  const attendances = await prisma.attendance.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    include: {
      student: { include: { user: true, class: true } },
      period: { include: { subject: true } },
    },
    orderBy: { markedAt: "desc" },
  });

  const total = attendances.length;
  const present = attendances.filter((a) => a.status === "PRESENT").length;
  const absent = attendances.filter((a) => a.status === "ABSENT").length;
  const late = attendances.filter((a) => a.status === "LATE").length;
  const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <PageHeader
          title="Attendance Overview"
          description="Monitor daily attendance metrics across all classes."
        />
        <Suspense fallback={null}>
          <DateFilter defaultValue={dateString} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card-elevated p-6 bg-gradient-to-br from-[#05335C] to-[#0A4A82] text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-white/80 text-sm font-medium">Total Records Today</p>
          <h3 className="text-3xl font-bold">{total}</h3>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xl font-bold text-green-600">{presentPercentage}%</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Present</p>
          <h3 className="text-2xl font-bold text-gray-800">{present}</h3>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">Late</p>
          <h3 className="text-2xl font-bold text-gray-800">{late}</h3>
        </div>

        <div className="card-elevated p-6 border-b-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">Absent</p>
          <h3 className="text-2xl font-bold text-gray-800">{absent}</h3>
        </div>
      </div>

      <div className="card-elevated p-6">
        <h3 className="text-lg font-bold text-[#05335C] mb-4">Recent Attendance Logs</h3>
        <DataTable
          headers={["Student", "Class", "Period / Subject", "Time Marked", "Status"]}
          isEmpty={attendances.length === 0}
        >
          {attendances.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-800">
                {record.student.user.name}
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">
                  {record.student.class?.grade} {record.student.class?.section}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {record.period.subject.name}{" "}
                <span className="text-gray-400">({record.period.startTime})</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {record.markedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-6 py-4">
                {record.status === "PRESENT" && (
                  <span className="badge badge-success">Present</span>
                )}
                {record.status === "LATE" && (
                  <span className="badge badge-warning">Late</span>
                )}
                {record.status === "ABSENT" && (
                  <span className="badge badge-error">Absent</span>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
