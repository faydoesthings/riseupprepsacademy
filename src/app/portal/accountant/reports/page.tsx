import Link from "next/link";
import { ArrowRight, DollarSign, Wallet, Receipt, Download } from "lucide-react";
import PortalListPage from "@/components/portal/PortalListPage";
import PageHeader from "@/components/ui/PageHeader";
import ListPageError from "@/components/ui/ListPageError";
import { requirePortalRole } from "@/lib/portal-auth";
import { getAccountantDashboardStats, getMonthlyFinanceExportRows } from "@/lib/stats";
import MonthlyFinanceCsvExport from "@/components/portal/accountant/MonthlyFinanceCsvExport";
import { formatPKR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountantReportsPage() {
  try {
    await requirePortalRole("ACCOUNTANT", "SUPER_ADMIN");
    const [stats, exportRows] = await Promise.all([
      getAccountantDashboardStats(),
      getMonthlyFinanceExportRows(),
    ]);
    const monthLabel = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const csvFilename = `riseup-finance-${new Date().toISOString().slice(0, 7)}.csv`;

    const cards = [
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
    ];

    const moduleLinks = [
      {
        href: "/portal/accountant/fees",
        title: "Fee collection",
        desc: "Structures, payments, and pending fee confirmations.",
      },
      {
        href: "/portal/accountant/expenses",
        title: "Expenses",
        desc: "Operational costs and expenditure register.",
      },
      {
        href: "/portal/accountant/payroll",
        title: "Payroll",
        desc: "Teacher salary processing history.",
      },
      {
        href: "/portal/accountant/donations",
        title: "Donations",
        desc: "Philanthropic contributions and sponsorships.",
      },
    ];

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Accountant portal"
          title="Financial reports"
          description={`Summary for ${monthLabel}. Export detailed ledgers or open each module.`}
        />

        <section className="portal-stat-grid" aria-label="Monthly summary">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.label} className={`portal-kpi portal-kpi--${card.tone}`}>
                <div className="portal-kpi__icon" aria-hidden>
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="portal-kpi__body">
                  <p className="portal-kpi__label">{card.label}</p>
                  <p className="portal-kpi__value portal-kpi__value--text">{card.value}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="portal-panel mb-6">
          <header className="portal-panel__header portal-panel__header--compact">
            <div>
              <h2 className="portal-panel__title flex items-center gap-2">
                <Download className="w-4 h-4 text-[#F78C1F]" aria-hidden />
                Monthly export
              </h2>
              <p className="portal-panel__desc">
                Download this month&apos;s fees, expenses, payroll, and confirmed donations as CSV.
              </p>
            </div>
            <MonthlyFinanceCsvExport rows={exportRows} filename={csvFilename} />
          </header>
        </section>

        <div className="grid md:grid-cols-2 gap-4">
          {moduleLinks.map((link) => (
            <Link key={link.href} href={link.href} className="portal-link-card">
              <h3 className="portal-link-card__title">{link.title}</h3>
              <p className="portal-link-card__desc">{link.desc}</p>
              <span className="portal-link-card__cta">
                Open module <ArrowRight className="w-4 h-4" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </PortalListPage>
    );
  } catch (error) {
    console.error("AccountantReportsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
