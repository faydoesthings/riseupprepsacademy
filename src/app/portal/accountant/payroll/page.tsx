import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import PayrollFormModal from "@/components/portal/forms/PayrollFormModal";
import { requirePortalRole } from "@/lib/portal-auth";
import {
  buildPayrollListWhere,
  paginationArgs,
  parsePageParam,
  parseSearchParam,
} from "@/lib/list-query";
import { Users } from "lucide-react";
import { formatPKR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountantPayrollPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  try {
    await requirePortalRole("ACCOUNTANT", "SUPER_ADMIN");
    const search = parseSearchParam(searchParams.search);
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);
    const where = buildPayrollListWhere(search);

    const [payrolls, total, totalAgg, teachers] = await Promise.all([
      prisma.payroll.findMany({
        where,
        include: { teacher: { include: { user: true } } },
        orderBy: { processedAt: "desc" },
        skip,
        take,
      }),
      prisma.payroll.count({ where }),
      prisma.payroll.aggregate({ where, _sum: { amount: true } }),
      prisma.teacher.findMany({
        include: { user: true },
        where: { status: "ACTIVE" },
      }),
    ]);

    const totalPayroll = totalAgg._sum.amount ?? 0;

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Accountant portal"
          title="Staff payroll"
          description="Manage teacher salaries and process monthly payroll."
          searchPlaceholder="Search payroll records..."
          customAction={<PayrollFormModal teachers={teachers} />}
        />

        <section className="portal-stat-grid" aria-label="Payroll summary">
          <article className="portal-kpi portal-kpi--neutral">
            <div className="portal-kpi__icon" aria-hidden>
              <Users className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="portal-kpi__body">
              <p className="portal-kpi__label">Total processed</p>
              <p className="portal-kpi__value portal-kpi__value--text">
                {formatPKR(totalPayroll)}
              </p>
              <p className="portal-kpi__hint">
                {search ? "Matching current search" : "All payroll records"}
              </p>
            </div>
          </article>
        </section>

        <DataTable
          headers={["Teacher", "Period", "Amount", "Processed", "Status"]}
          isEmpty={payrolls.length === 0}
          emptyMessage={
            search ? "No payroll records match your search." : "No payroll processed yet."
          }
        >
          {payrolls.map((payroll) => (
            <tr key={payroll.id}>
              <td className="font-bold text-white text-sm">{payroll.teacher.user.name}</td>
              <td className="font-medium text-white/80 text-sm">
                {payroll.month} {payroll.year}
              </td>
              <td className="font-bold text-[#0ABFBC] text-sm">{formatPKR(payroll.amount)}</td>
              <td className="text-sm text-white/40">
                {payroll.processedAt?.toLocaleDateString() ?? "—"}
              </td>
              <td>
                <span className="badge badge-success">{payroll.status}</span>
              </td>
            </tr>
          ))}
        </DataTable>

        <Pagination
          page={page}
          total={total}
          basePath="/portal/accountant/payroll"
          searchParams={{ search: search || undefined }}
        />
      </PortalListPage>
    );
  } catch (error) {
    console.error("AccountantPayrollPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
