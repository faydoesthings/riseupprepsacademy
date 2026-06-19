import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import ExpenseFormModal from "@/components/portal/forms/ExpenseFormModal";
import { requirePortalRole } from "@/lib/portal-auth";
import {
  buildExpenseListWhere,
  paginationArgs,
  parsePageParam,
  parseSearchParam,
} from "@/lib/list-query";
import { Wallet } from "lucide-react";
import { formatPKR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountantExpensesPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  try {
    const session = await requirePortalRole("ACCOUNTANT", "SUPER_ADMIN");
    const search = parseSearchParam(searchParams.search);
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);
    const where = buildExpenseListWhere(search);

    const [expenses, total, totalAgg] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take,
      }),
      prisma.expense.count({ where }),
      prisma.expense.aggregate({ where, _sum: { amount: true } }),
    ]);

    const totalExpenses = totalAgg._sum.amount ?? 0;

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Accountant portal"
          title="Expense register"
          description="Log and monitor academy expenditures and operational costs."
          searchPlaceholder="Search expenses..."
          customAction={<ExpenseFormModal userId={session.user?.id ?? ""} />}
        />

        <section className="portal-stat-grid" aria-label="Expense summary">
          <article className="portal-kpi portal-kpi--orange">
            <div className="portal-kpi__icon" aria-hidden>
              <Wallet className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="portal-kpi__body">
              <p className="portal-kpi__label">Total (filtered)</p>
              <p className="portal-kpi__value portal-kpi__value--text">
                {formatPKR(totalExpenses)}
              </p>
              <p className="portal-kpi__hint">
                {search ? "Matching current search" : "All recorded expenses"}
              </p>
            </div>
          </article>
        </section>

        <DataTable
          headers={["Date", "Category", "Description", "Amount"]}
          isEmpty={expenses.length === 0}
          emptyMessage={search ? "No expenses match your search." : "No expenses logged yet."}
        >
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td className="text-sm text-white/70">{expense.date.toLocaleDateString()}</td>
              <td>
                <span className="badge badge-navy text-xs">{expense.category}</span>
              </td>
              <td className="font-medium text-white text-sm">{expense.description || "—"}</td>
              <td className="font-bold text-[#C0392B] text-sm">{formatPKR(expense.amount)}</td>
            </tr>
          ))}
        </DataTable>

        <Pagination
          page={page}
          total={total}
          basePath="/portal/accountant/expenses"
          searchParams={{ search: search || undefined }}
        />
      </PortalListPage>
    );
  } catch (error) {
    console.error("AccountantExpensesPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
