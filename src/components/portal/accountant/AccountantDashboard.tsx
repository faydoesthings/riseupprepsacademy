import {
  DollarSign,
  Wallet,
  Receipt,
  AlertTriangle,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import DataTable from "@/components/ui/DataTable";
import { formatPKR } from "@/lib/format";

type PendingFee = {
  id: string;
  amount: number;
  student: {
    user: { name: string };
    class: { grade: string; section: string | null } | null;
  };
};

type RecentPayment = {
  id: string;
  amount: number;
  createdAt: Date;
  student: { user: { name: string } };
};

type RecentExpense = {
  id: string;
  amount: number;
  date: Date;
  description: string | null;
  category: string;
};

export type AccountantDashboardStats = {
  monthlyIncome: number;
  monthlyExpenses: number;
  net: number;
  pendingFees: PendingFee[];
  recentPayments: RecentPayment[];
  recentExpenses: RecentExpense[];
};

type Props = {
  firstName: string;
  monthLabel: string;
  stats: AccountantDashboardStats;
};

export default function AccountantDashboard({ firstName, monthLabel, stats }: Props) {
  const transactions = [
    ...stats.recentPayments.map((p) => ({
      id: `pay-${p.id}`,
      date: p.createdAt,
      desc: `Fee — ${p.student.user.name}`,
      type: "Income" as const,
      amount: p.amount,
    })),
    ...stats.recentExpenses.map((e) => ({
      id: `exp-${e.id}`,
      date: e.date,
      desc: e.description ?? e.category,
      type: "Expense" as const,
      amount: e.amount,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);

  const kpiCards = [
    {
      label: "Monthly income",
      value: formatPKR(stats.monthlyIncome),
      icon: DollarSign,
      tone: "teal" as const,
    },
    {
      label: "Monthly expenses",
      value: formatPKR(stats.monthlyExpenses),
      icon: Wallet,
      tone: "crimson" as const,
    },
    {
      label: "Net position",
      value: formatPKR(stats.net),
      icon: Receipt,
      tone: stats.net >= 0 ? ("orange" as const) : ("crimson" as const),
    },
    {
      label: "Pending fees",
      value: String(stats.pendingFees.length),
      icon: AlertTriangle,
      tone: "neutral" as const,
      hint: stats.pendingFees.length > 0 ? "Awaiting confirmation" : "All clear",
    },
  ];

  const quickLinks = [
    {
      href: "/portal/accountant/fees",
      title: "Fee collection",
      desc: "Manage fee structures and record student payments.",
    },
    {
      href: "/portal/accountant/expenses",
      title: "Expenses",
      desc: "Log and monitor academy operational costs.",
    },
    {
      href: "/portal/accountant/payroll",
      title: "Payroll",
      desc: "Process teacher salaries and payroll records.",
    },
    {
      href: "/portal/accountant/donations",
      title: "Donations",
      desc: "View philanthropic contributions and sponsorships.",
    },
    {
      href: "/portal/accountant/reports",
      title: "Reports",
      desc: "Monthly summaries and CSV exports.",
    },
  ];

  return (
    <div className="admin-dashboard animate-fade-in">
      <header className="admin-dashboard__hero">
        <div>
          <p className="admin-dashboard__eyebrow">Accountant portal</p>
          <h1 className="admin-dashboard__title">Dashboard</h1>
          <p className="admin-dashboard__subtitle">
            Welcome back, {firstName}. Financial overview for {monthLabel}.
          </p>
        </div>
        {stats.pendingFees.length > 0 && (
          <div className="admin-dashboard__hero-actions">
            <Link href="/portal/accountant/fees" className="portal-btn portal-btn--primary">
              Review pending fees <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        )}
      </header>

      <section className="portal-stat-grid portal-stat-grid--4" aria-label="Finance overview">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className={`portal-kpi portal-kpi--${card.tone}`}>
              <div className="portal-kpi__icon" aria-hidden>
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="portal-kpi__body">
                <p className="portal-kpi__label">{card.label}</p>
                <p className="portal-kpi__value">{card.value}</p>
                {"hint" in card && card.hint && (
                  <p className="portal-kpi__hint">{card.hint}</p>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <div className="portal-accountant-dashboard-grid">
        <section className="portal-panel portal-table-wrap" aria-label="Recent transactions">
          <header className="portal-panel__header portal-panel__header--compact">
            <div>
              <h2 className="portal-panel__title">Recent transactions</h2>
              <p className="portal-panel__desc">
                Latest confirmed fee payments and recorded expenses.
              </p>
            </div>
            <Link href="/portal/accountant/reports" className="portal-panel__link">
              Full reports <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </header>

          <DataTable
            headers={["Date", "Description", "Type", "Amount"]}
            isEmpty={transactions.length === 0}
            emptyMessage="No transactions recorded yet."
          >
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="text-sm text-white/50 font-mono">
                  {t.date.toLocaleDateString()}
                </td>
                <td className="text-sm text-white">{t.desc}</td>
                <td>
                  <span
                    className={`badge ${t.type === "Income" ? "badge-success" : "badge-error"}`}
                  >
                    {t.type}
                  </span>
                </td>
                <td
                  className={`font-bold text-sm font-mono ${
                    t.type === "Income" ? "text-[#0ABFBC]" : "text-[#C0392B]"
                  }`}
                >
                  {formatPKR(t.amount)}
                </td>
              </tr>
            ))}
          </DataTable>
        </section>

        <div className="portal-accountant-dashboard-sidebar">
          {stats.pendingFees.length > 0 && (
            <section className="portal-panel">
              <header className="portal-panel__header portal-panel__header--compact">
                <div>
                  <h2 className="portal-panel__title">Pending fees</h2>
                  <p className="portal-panel__desc">
                    {stats.pendingFees.length} payment
                    {stats.pendingFees.length === 1 ? "" : "s"} awaiting confirmation.
                  </p>
                </div>
                <Link href="/portal/accountant/fees" className="portal-panel__link">
                  Manage <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </Link>
              </header>
              <div className="space-y-2">
                {stats.pendingFees.map((fee) => (
                  <div key={fee.id} className="portal-dashboard-list-item portal-dashboard-list-item--row">
                    <div>
                      <p className="portal-dashboard-list-item__title">
                        {fee.student.user.name}
                      </p>
                      <p className="portal-dashboard-list-item__meta">
                        {fee.student.class
                          ? `${fee.student.class.grade}${fee.student.class.section ? ` ${fee.student.class.section}` : ""}`
                          : "No class"}{" "}
                        · <Clock className="w-3 h-3 inline" aria-hidden /> Pending
                      </p>
                    </div>
                    <span className="portal-dashboard-list-item__score text-[#F78C1F]">
                      {formatPKR(fee.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="portal-panel">
            <header className="portal-panel__header portal-panel__header--compact">
              <div>
                <h2 className="portal-panel__title">Quick links</h2>
                <p className="portal-panel__desc">Jump to finance modules.</p>
              </div>
            </header>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="portal-finance-link">
                  <span className="portal-finance-link__title">{link.title}</span>
                  <ArrowRight className="w-4 h-4 text-[#F78C1F] shrink-0" aria-hidden />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
