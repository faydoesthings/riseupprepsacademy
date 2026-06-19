import { Suspense } from "react";
import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import DateFilter from "@/components/ui/DateFilter";
import { attendanceDateRange } from "@/lib/auth-utils";
import { requirePortalRole } from "@/lib/portal-auth";
import {
  buildAttendanceListWhere,
  paginationArgs,
  parsePageParam,
  parseSearchParam,
} from "@/lib/list-query";
import { Users, CheckCircle, XCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: { date?: string; search?: string; page?: string };
}) {
  try {
    await requirePortalRole("SUPER_ADMIN");

    const dateString = searchParams.date || new Date().toISOString().split("T")[0];
    const { start, end } = attendanceDateRange(dateString);
    const search = parseSearchParam(searchParams.search);
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);
    const where = buildAttendanceListWhere(search, start, end);

    const [attendances, total, statusGroups] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          student: { include: { user: true, class: true } },
          period: { include: { subject: true } },
        },
        orderBy: { markedAt: "desc" },
        skip,
        take,
      }),
      prisma.attendance.count({ where }),
      prisma.attendance.groupBy({
        by: ["status"],
        where: { date: { gte: start, lte: end } },
        _count: true,
      }),
    ]);

    const countByStatus = (status: string) =>
      statusGroups.find((g) => g.status === status)?._count ?? 0;
    const present = countByStatus("PRESENT");
    const absent = countByStatus("ABSENT");
    const late = countByStatus("LATE");
    const dayTotal = present + absent + late;
    const presentPercentage = dayTotal > 0 ? Math.round((present / dayTotal) * 100) : 0;

    const statCards = [
      { label: "Total records", value: String(dayTotal), icon: Users, tone: "orange" as const },
      { label: `Present (${presentPercentage}%)`, value: String(present), icon: CheckCircle, tone: "teal" as const },
      { label: "Late", value: String(late), icon: Clock, tone: "orange" as const },
      { label: "Absent", value: String(absent), icon: XCircle, tone: "crimson" as const },
    ];

    return (
      <PortalListPage>
        <PageHeader
          title="Attendance"
          description="Monitor daily attendance metrics across all classes."
          searchPlaceholder="Search by student or subject..."
          customAction={
            <Suspense fallback={null}>
              <DateFilter defaultValue={dateString} />
            </Suspense>
          }
        />

        <section className="portal-stat-grid portal-stat-grid--4" aria-label="Attendance summary">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.label} className={`portal-kpi portal-kpi--${card.tone}`}>
                <div className="portal-kpi__icon" aria-hidden>
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="portal-kpi__body">
                  <p className="portal-kpi__label">{card.label}</p>
                  <p className="portal-kpi__value">{card.value}</p>
                </div>
              </article>
            );
          })}
        </section>

        <DataTable
          headers={["Student", "Class", "Period / subject", "Time marked", "Status"]}
          isEmpty={attendances.length === 0}
          emptyMessage={
            search
              ? "No attendance records match your search for this date."
              : "No attendance marked for this date yet."
          }
        >
          {attendances.map((record) => (
            <tr key={record.id}>
              <td className="font-medium text-white text-sm">{record.student.user.name}</td>
              <td>
                <span className="badge badge-info">
                  {record.student.class?.grade} {record.student.class?.section}
                </span>
              </td>
              <td className="text-sm text-white/70">
                {record.period.subject.name}{" "}
                <span className="text-white/30">({record.period.startTime})</span>
              </td>
              <td className="text-sm text-white/40">
                {record.markedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td>
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

        <Pagination
          page={page}
          total={total}
          basePath="/portal/admin/attendance"
          searchParams={{
            search: search || undefined,
            date: dateString !== new Date().toISOString().split("T")[0] ? dateString : undefined,
          }}
        />
      </PortalListPage>
    );
  } catch (error) {
    console.error("AdminAttendancePage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
