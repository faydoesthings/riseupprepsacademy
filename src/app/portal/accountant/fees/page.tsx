import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import FeeStructureFormModal from "@/components/portal/forms/FeeStructureFormModal";
import FeePaymentFormModal from "@/components/portal/forms/FeePaymentFormModal";
import { requirePortalRole } from "@/lib/portal-auth";
import {
  buildFeePaymentListWhere,
  paginationArgs,
  parsePageParam,
  parseSearchParam,
} from "@/lib/list-query";
import { Coins, DollarSign } from "lucide-react";
import { formatPKR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountantFeesPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  try {
    await requirePortalRole("ACCOUNTANT", "SUPER_ADMIN");
    const search = parseSearchParam(searchParams.search);
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);
    const paymentWhere = buildFeePaymentListWhere(search);

    const [feeStructures, payments, paymentTotal, totalCollectedAgg, classes, students] =
      await Promise.all([
        prisma.feeStructure.findMany({
          include: { class: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.feePayment.findMany({
          where: paymentWhere,
          include: {
            student: { include: { user: true, class: true } },
            feeStructure: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.feePayment.count({ where: paymentWhere }),
        prisma.feePayment.aggregate({
          where: { status: "CONFIRMED" },
          _sum: { amount: true },
        }),
        prisma.class.findMany({ orderBy: { grade: "asc" } }),
        prisma.student.findMany({
          include: { user: true, class: true },
          orderBy: { user: { name: "asc" } },
          take: 500,
        }),
      ]);

    const totalCollected = totalCollectedAgg._sum.amount ?? 0;

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Accountant portal"
          title="Fee management"
          description="Create fee structures and collect student payments."
          searchPlaceholder="Search payments..."
          customAction={
            <div className="flex flex-col sm:flex-row gap-2">
              <FeeStructureFormModal classes={classes} />
              <FeePaymentFormModal students={students} feeStructures={feeStructures} />
            </div>
          }
        />

        <section className="portal-stat-grid" aria-label="Fee summary">
          <article className="portal-kpi portal-kpi--teal">
            <div className="portal-kpi__icon" aria-hidden>
              <DollarSign className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="portal-kpi__body">
              <p className="portal-kpi__label">Total collected</p>
              <p className="portal-kpi__value portal-kpi__value--text">
                {formatPKR(totalCollected)}
              </p>
              <p className="portal-kpi__hint">All confirmed payments</p>
            </div>
          </article>
        </section>

        <div className="portal-settings-grid">
          <section className="portal-list-section">
            <h2 className="portal-list-section__title">
              <span className="portal-list-section__badge">
                <Coins className="w-4 h-4" aria-hidden />
              </span>
              Active fee plans
            </h2>

            {feeStructures.length === 0 ? (
              <div className="portal-empty-state portal-empty-state--inline">
                <p className="text-white/45 text-sm">No fee structures defined yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {feeStructures.map((plan) => (
                  <article key={plan.id} className="portal-fee-plan-card">
                    <div className="portal-fee-plan-card__header">
                      <h3 className="portal-fee-plan-card__title">{plan.name}</h3>
                      <span className="badge badge-navy text-xs">{plan.frequency}</span>
                    </div>
                    <p className="portal-fee-plan-card__amount">{formatPKR(plan.amount)}</p>
                    <p className="portal-fee-plan-card__meta">
                      {plan.class
                        ? `Class ${plan.class.grade}${plan.class.section ? ` ${plan.class.section}` : ""}`
                        : "General plan"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="portal-list-section">
            <h2 className="portal-list-section__title">
              <span className="portal-list-section__badge">
                <DollarSign className="w-4 h-4" aria-hidden />
              </span>
              Payment transactions
            </h2>

            <DataTable
              headers={["Student", "Plan", "Amount", "Method", "Date", "Status"]}
              isEmpty={payments.length === 0}
              emptyMessage={
                search ? "No payments match your search." : "No fee payments recorded yet."
              }
            >
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <span className="font-bold text-white text-sm block">
                      {payment.student.user.name}
                    </span>
                    <span className="text-xs text-white/40">
                      {payment.student.class?.grade ?? "—"}
                    </span>
                  </td>
                  <td className="text-sm text-white/70">{payment.feeStructure.name}</td>
                  <td className="font-bold text-[#0ABFBC] text-sm">
                    {formatPKR(payment.amount)}
                  </td>
                  <td className="text-xs font-semibold text-white/50">{payment.method}</td>
                  <td className="text-sm text-white/40">
                    {payment.paidAt?.toLocaleDateString() || payment.createdAt.toLocaleDateString()}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        payment.status === "CONFIRMED" ? "badge-success" : "badge-warning"
                      }`}
                    >
                      {payment.status === "CONFIRMED" ? "Paid" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </DataTable>

            <Pagination
              page={page}
              total={paymentTotal}
              basePath="/portal/accountant/fees"
              searchParams={{ search: search || undefined }}
            />
          </section>
        </div>
      </PortalListPage>
    );
  } catch (error) {
    console.error("AccountantFeesPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
