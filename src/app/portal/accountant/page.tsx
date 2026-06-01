import { DollarSign, Wallet, Receipt, ArrowUpRight, ArrowDownRight, AlertTriangle, Download } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAccountantDashboardStats } from "@/lib/stats";
import { formatPKR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountantDashboard() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "ACCOUNTANT") {
    redirect("/login");
  }

  const stats = await getAccountantDashboardStats();
  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const transactions = [
    ...stats.recentPayments.map((p) => ({
      date: p.createdAt,
      desc: `Fee — ${p.student.user.name}`,
      type: "Income" as const,
      amount: p.amount,
      status: p.status,
    })),
    ...stats.recentExpenses.map((e) => ({
      date: e.date,
      desc: e.description ?? e.category,
      type: "Expense" as const,
      amount: e.amount,
      status: "Paid",
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#05335C]">Accountant Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Financial overview for {monthLabel}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Monthly Income", value: formatPKR(stats.monthlyIncome), trend: "up" as const, icon: DollarSign, color: "from-green-500 to-emerald-500" },
          { label: "Monthly Expenses", value: formatPKR(stats.monthlyExpenses), trend: "neutral" as const, icon: Wallet, color: "from-red-500 to-pink-500" },
          { label: "Net Position", value: formatPKR(stats.net), trend: stats.net >= 0 ? ("up" as const) : ("down" as const), icon: Receipt, color: "from-blue-500 to-cyan-500" },
          { label: "Pending Fees", value: String(stats.pendingFees.length), trend: "down" as const, icon: AlertTriangle, color: "from-orange-500 to-amber-500" },
        ].map((stat, i) => (
          <div key={i} className="kpi-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-[#05335C] mt-1">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === "up" && <ArrowUpRight className="w-3 h-3 text-green-500" />}
                  {stat.trend === "down" && <ArrowDownRight className="w-3 h-3 text-red-500" />}
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-[#05335C] mb-6">Recent Transactions</h2>
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-500">No transactions recorded yet.</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn, i) => (
                      <tr key={i}>
                        <td className="text-sm">{txn.date.toLocaleDateString()}</td>
                        <td className="text-sm font-medium">{txn.desc}</td>
                        <td>
                          <span className={`badge ${txn.type === "Income" ? "badge-success" : "badge-error"}`}>
                            {txn.type}
                          </span>
                        </td>
                        <td className={`text-sm font-medium ${txn.type === "Income" ? "text-green-600" : "text-red-600"}`}>
                          {txn.type === "Income" ? "+" : "-"}
                          {formatPKR(txn.amount)}
                        </td>
                        <td>
                          <span className="badge badge-info">{txn.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-[#05335C] mb-4">P&amp;L Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Income</span>
                <span className="text-sm font-bold text-green-600">{formatPKR(stats.monthlyIncome)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Expenses</span>
                <span className="text-sm font-bold text-red-600">{formatPKR(stats.monthlyExpenses)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-[#05335C]">Net</span>
                <span className={`text-sm font-bold ${stats.net >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.net >= 0 ? "+" : ""}
                  {formatPKR(stats.net)}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-[#05335C] mb-4">Outstanding Fees</h2>
            {stats.pendingFees.length === 0 ? (
              <p className="text-sm text-gray-500">All fees are up to date.</p>
            ) : (
              <div className="space-y-3">
                {stats.pendingFees.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-orange-50">
                    <div>
                      <p className="text-sm font-medium text-[#05335C]">{item.student.user.name}</p>
                      <p className="text-xs text-gray-400">
                        {item.student.class?.grade ?? "—"}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#F78C1F]">{formatPKR(item.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6 bg-gradient-to-br from-[#05335C] to-[#0A4A82] text-white">
            <h2 className="font-bold mb-2">Reports</h2>
            <p className="text-sm text-white/70 mb-4">Export financial summaries from the reports section.</p>
            <button type="button" className="btn btn-primary btn-sm w-full opacity-90 cursor-not-allowed" disabled>
              <Download className="w-4 h-4" />
              Coming soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
