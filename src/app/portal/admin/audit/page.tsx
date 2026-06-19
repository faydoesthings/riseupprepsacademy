import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import { requirePortalRole } from "@/lib/portal-auth";
import { paginationArgs, parsePageParam } from "@/lib/list-query";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  try {
    await requirePortalRole("SUPER_ADMIN");
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: { user: true },
        orderBy: { timestamp: "desc" },
        skip,
        take,
      }),
      prisma.auditLog.count(),
    ]);

    return (
      <PortalListPage>
        <PageHeader
          title="Audit log"
          description="Track administrative actions across the platform."
        />

        <DataTable
          headers={["Time", "User", "Action", "Module", "Details"]}
          isEmpty={logs.length === 0}
          emptyMessage="No audit entries recorded yet."
        >
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="text-xs text-white/40 font-mono whitespace-nowrap">
                {log.timestamp.toLocaleString()}
              </td>
              <td className="text-sm text-white">{log.user.name}</td>
              <td className="text-sm text-white/80">{log.action}</td>
              <td>
                <span className="badge badge-navy">{log.module}</span>
              </td>
              <td className="text-xs text-white/40 max-w-xs truncate">
                {log.details ?? "—"}
              </td>
            </tr>
          ))}
        </DataTable>

        <Pagination page={page} total={total} basePath="/portal/admin/audit" />
      </PortalListPage>
    );
  } catch (error) {
    console.error("AdminAuditPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
