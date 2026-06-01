import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import ExpenseFormModal from "@/components/portal/forms/ExpenseFormModal";
import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountantExpensesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" }
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <PageHeader
          title="Expense Register"
          description="Log and monitor academy expenditures and operational costs."
          customAction={<ExpenseFormModal userId={session.user.id} />}
        />
        <div className="card-elevated p-4 bg-gradient-to-br from-[#05335C] to-[#0A4A82] text-white flex items-center gap-4 -mt-8 min-w-[250px]">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-[#F78C1F]" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Total Expenditures</p>
            <h3 className="text-2xl font-black">Rs {totalExpenses.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <DataTable headers={["Date", "Category", "Description", "Amount"]} isEmpty={expenses.length === 0}>
        {expenses.map(e => (
          <tr key={e.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm text-gray-600">{e.date.toLocaleDateString()}</td>
            <td className="px-6 py-4">
              <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-700 rounded uppercase tracking-wider">
                {e.category}
              </span>
            </td>
            <td className="px-6 py-4 font-medium text-[#05335C]">{e.description || "-"}</td>
            <td className="px-6 py-4 font-bold text-red-600">Rs {e.amount.toLocaleString()}</td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
