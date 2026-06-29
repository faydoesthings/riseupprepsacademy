import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import { requirePortalRole } from "@/lib/portal-auth";
import {
  buildRegistrationListWhere,
  paginationArgs,
  parsePageParam,
  parseSearchParam,
} from "@/lib/list-query";
import { ClipboardList, Clock, CheckCircle, UserPlus } from "lucide-react";
import ReviewRegistrationButtons from "@/components/portal/registrations/ReviewRegistrationButtons";

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

function roleBadge(role: string) {
  switch (role) {
    case "STUDENT":
      return <span className="badge badge-info">Student</span>;
    case "TEACHER":
      return <span className="badge badge-navy">Teacher</span>;
    case "DONOR":
      return <span className="badge badge-warning">Donor</span>;
    default:
      return <span className="badge badge-navy">{role}</span>;
  }
}

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  try {
    await requirePortalRole("SUPER_ADMIN");
    const search = parseSearchParam(searchParams.search);
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);
    const where = buildRegistrationListWhere(search);

    const [requests, total, allCount, pendingCount, approvedCount] = await Promise.all([
      prisma.registrationRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.registrationRequest.count({ where }),
      prisma.registrationRequest.count(),
      prisma.registrationRequest.count({ where: { status: "PENDING" } }),
      prisma.registrationRequest.count({ where: { status: "APPROVED" } }),
    ]);

    const statCards = [
      { label: "Total requests", value: String(allCount), icon: ClipboardList, tone: "orange" as const },
      { label: "Pending review", value: String(pendingCount), icon: Clock, tone: "neutral" as const },
      { label: "Approved", value: String(approvedCount), icon: CheckCircle, tone: "teal" as const },
    ];

    return (
      <PortalListPage>
        <PageHeader
          title="Portal registrations"
          description={`Review sign-up requests from the public registration page. ${pendingCount} pending review.`}
          searchPlaceholder="Search by name, email, or role..."
        />

        <section className="portal-stat-grid" aria-label="Registration summary">
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
          headers={["Applicant", "Role", "Phone", "Submitted", "Status", "Actions"]}
          isEmpty={requests.length === 0}
          emptyMessage={
            search
              ? "No registration requests match your search."
              : "No portal registration requests yet."
          }
        >
          {requests.map((req) => (
            <tr key={req.id}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#05335C] to-[#0A4A82] flex items-center justify-center text-white text-xs font-bold">
                    <UserPlus className="w-4 h-4" aria-hidden />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{req.name}</p>
                    <p className="text-xs text-white/40">{req.email}</p>
                  </div>
                </div>
              </td>
              <td>{roleBadge(req.roleRequested)}</td>
              <td className="text-sm text-white/80">{req.phone || "—"}</td>
              <td className="text-sm text-white/40">
                {req.createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td>{statusBadge(req.status)}</td>
              <td>
                <ReviewRegistrationButtons requestId={req.id} status={req.status} />
              </td>
            </tr>
          ))}
        </DataTable>

        <Pagination
          page={page}
          total={total}
          basePath="/portal/admin/registrations"
          searchParams={{ search: search || undefined }}
        />
      </PortalListPage>
    );
  } catch (error) {
    console.error("AdminRegistrationsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
