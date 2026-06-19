import Link from "next/link";
import { ArrowRight, DollarSign, AlertTriangle } from "lucide-react";
import PortalListPage from "@/components/portal/PortalListPage";
import PageHeader from "@/components/ui/PageHeader";
import { requirePortalRole } from "@/lib/portal-auth";
import { getAdminDashboardStats } from "@/lib/stats";
import { formatPKR } from "@/lib/format";
import ListPageError from "@/components/ui/ListPageError";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  try {
    await requirePortalRole("SUPER_ADMIN");
    const stats = await getAdminDashboardStats();

    const cards = [
      { label: "Monthly revenue", value: formatPKR(stats.monthlyRevenue), icon: DollarSign, tone: "orange" as const },
      { label: "Outstanding fees", value: formatPKR(stats.outstandingFees), icon: AlertTriangle, tone: "crimson" as const },
      { label: "Total donations", value: formatPKR(stats.totalDonations), icon: DollarSign, tone: "teal" as const },
      { label: "Pending fee count", value: String(stats.outstandingCount), icon: AlertTriangle, tone: "navy" as const },
    ];

    return (
      <PortalListPage>
        <PageHeader
          title="Finance"
          description="Summary of academy revenue, fees, and donations."
        />

        <section className="portal-stat-grid portal-stat-grid--4" aria-label="Finance metrics">
          {cards.map((card) => {
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

        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/portal/accountant/fees" className="portal-link-card">
            <h3 className="portal-link-card__title">Fee collection</h3>
            <p className="portal-link-card__desc">
              Manage structures and payments in the accountant portal.
            </p>
            <span className="portal-link-card__cta">
              Open fees <ArrowRight className="w-4 h-4" aria-hidden />
            </span>
          </Link>
          <Link href="/portal/admin/donors" className="portal-link-card">
            <h3 className="portal-link-card__title">Donors & sponsorships</h3>
            <p className="portal-link-card__desc">
              Track philanthropic support and sponsored students.
            </p>
            <span className="portal-link-card__cta">
              View donors <ArrowRight className="w-4 h-4" aria-hidden />
            </span>
          </Link>
        </div>
      </PortalListPage>
    );
  } catch (error) {
    console.error("AdminFinancePage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
