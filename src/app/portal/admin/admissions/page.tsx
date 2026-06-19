import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import { requirePortalRole } from "@/lib/portal-auth";
import {
  buildAdmissionListWhere,
  paginationArgs,
  parsePageParam,
  parseSearchParam,
} from "@/lib/list-query";
import { GraduationCap, ClipboardList, Clock, CheckCircle } from "lucide-react";
import ReviewAdmissionButtons from "@/components/portal/admissions/ReviewAdmissionButtons";
import { formatGradeApplying } from "@/data/admissions";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return <span className="badge badge-success">Approved</span>;
    case "REJECTED":
      return <span className="badge badge-error">Rejected</span>;
    default:
      return <span className="badge badge-warning">Pending</span>;
  }
}

export default async function AdminAdmissionsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  try {
    await requirePortalRole("SUPER_ADMIN");
    const search = parseSearchParam(searchParams.search);
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);
    const where = buildAdmissionListWhere(search);

    const [applications, total, allCount, pendingCount, approvedCount] =
      await Promise.all([
        prisma.admissionApplication.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.admissionApplication.count({ where }),
        prisma.admissionApplication.count(),
        prisma.admissionApplication.count({ where: { status: "PENDING" } }),
        prisma.admissionApplication.count({ where: { status: "APPROVED" } }),
      ]);

    const statCards = [
      { label: "Total applications", value: String(allCount), icon: ClipboardList, tone: "orange" as const },
      { label: "Pending review", value: String(pendingCount), icon: Clock, tone: "neutral" as const },
      { label: "Approved", value: String(approvedCount), icon: CheckCircle, tone: "teal" as const },
    ];

    return (
      <PortalListPage>
        <PageHeader
          title="Admissions"
          description={`Review and manage student admission requests. ${pendingCount} pending review.`}
          searchPlaceholder="Search applications..."
        />

        <section className="portal-stat-grid" aria-label="Admission summary">
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
          headers={["Student", "Grade", "Parent", "Phone", "Submitted", "Status", "Actions"]}
          isEmpty={applications.length === 0}
          emptyMessage={
            search
              ? "No applications match your search."
              : "No admission applications yet. They will appear here when families apply online."
          }
        >
          {applications.map((app) => (
            <tr key={app.id}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#05335C] to-[#0A4A82] flex items-center justify-center text-white text-xs font-bold">
                    <GraduationCap className="w-4 h-4" aria-hidden />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{app.studentName}</p>
                    <p className="text-xs text-white/40">
                      DOB: {app.dateOfBirth.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </td>
              <td className="text-sm text-white/80">
                {formatGradeApplying(app.gradeApplying)}
              </td>
              <td className="text-sm text-white/80">{app.parentName}</td>
              <td className="text-sm text-white/80">{app.parentPhone}</td>
              <td className="text-sm text-white/40">
                {app.createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td>{statusBadge(app.status)}</td>
              <td>
                <ReviewAdmissionButtons applicationId={app.id} status={app.status} />
              </td>
            </tr>
          ))}
        </DataTable>

        <Pagination
          page={page}
          total={total}
          basePath="/portal/admin/admissions"
          searchParams={{ search: search || undefined }}
        />
      </PortalListPage>
    );
  } catch (error) {
    console.error("AdminAdmissionsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
