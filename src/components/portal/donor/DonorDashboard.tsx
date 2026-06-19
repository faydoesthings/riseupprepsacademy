import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  Heart,
  HeartHandshake,
  Receipt,
  Users,
} from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import DonorSponsoredList from "@/components/portal/donor/DonorSponsoredList";
import { formatPKR } from "@/lib/format";
import { donationStatusBadge, type SponsoredStudentSummary } from "@/lib/donor-portal";

type Donation = {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
};

type Props = {
  firstName: string;
  totalGiving: number;
  donationCount: number;
  preferAnonymous: boolean;
  recentDonations: Donation[];
  sponsoredStudents: SponsoredStudentSummary[];
};

export default function DonorDashboard({
  firstName,
  totalGiving,
  donationCount,
  preferAnonymous,
  recentDonations,
  sponsoredStudents,
}: Props) {
  const kpiCards = [
    {
      label: "Total giving",
      value: formatPKR(totalGiving),
      hint: "Confirmed contributions",
      icon: Heart,
      tone: "orange" as const,
    },
    {
      label: "Sponsored students",
      value: String(sponsoredStudents.length),
      hint: sponsoredStudents.length ? "Direct sponsorships" : "None yet",
      icon: Users,
      tone: "teal" as const,
    },
    {
      label: "Donations",
      value: String(donationCount),
      hint: "All time",
      icon: HeartHandshake,
      tone: "neutral" as const,
    },
    {
      label: "Recognition",
      value: preferAnonymous ? "Private" : "Public",
      hint: preferAnonymous ? "Anonymous donor" : "Listed supporter",
      icon: preferAnonymous ? EyeOff : Eye,
      tone: "neutral" as const,
    },
  ];

  const quickLinks = [
    { href: "/portal/donor/donations", title: "My donations" },
    { href: "/portal/donor/sponsored", title: "Sponsored students" },
    { href: "/portal/donor/receipts", title: "Receipts" },
    { href: "/portal/donor/impact", title: "Impact report" },
  ];

  return (
    <div className="admin-dashboard animate-fade-in">
      <header className="admin-dashboard__hero">
        <div>
          <p className="admin-dashboard__eyebrow">Donor portal</p>
          <h1 className="admin-dashboard__title">Dashboard</h1>
          <p className="admin-dashboard__subtitle">
            Thank you, {firstName}. Your generosity helps students across Sukkur and Rohri.
          </p>
        </div>
        <div className="admin-dashboard__hero-actions">
          <Link href="/donate" className="portal-btn portal-btn--primary">
            Make a gift <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </header>

      <section className="portal-stat-grid portal-stat-grid--4" aria-label="Giving overview">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className={`portal-kpi portal-kpi--${card.tone}`}>
              <div className="portal-kpi__icon" aria-hidden>
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="portal-kpi__body">
                <p className="portal-kpi__label">{card.label}</p>
                <p
                  className={
                    card.label === "Recognition"
                      ? "portal-kpi__value portal-kpi__value--text"
                      : "portal-kpi__value"
                  }
                >
                  {card.value}
                </p>
                <p className="portal-kpi__hint">{card.hint}</p>
              </div>
            </article>
          );
        })}
      </section>

      <div className="portal-donor-dashboard-grid">
        <section className="portal-panel" aria-label="Recent donations">
          <header className="portal-panel__header portal-panel__header--compact">
            <div>
              <h2 className="portal-panel__title">Recent donations</h2>
              <p className="portal-panel__desc">Your latest contributions to RiseUp.</p>
            </div>
            <Link href="/portal/donor/donations" className="portal-panel__link">
              View all <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </header>

          <DataTable
            embedded
            headers={["Date", "Amount", "Status"]}
            isEmpty={recentDonations.length === 0}
            emptyMessage="No donations recorded yet."
          >
            {recentDonations.map((donation) => (
              <tr key={donation.id}>
                <td className="text-sm text-white/50 font-mono">
                  {donation.createdAt.toLocaleDateString()}
                </td>
                <td className="font-bold text-sm font-mono text-[#F78C1F]">
                  {formatPKR(donation.amount)}
                </td>
                <td>
                  <span className={`badge ${donationStatusBadge(donation.status)}`}>
                    {donation.status}
                  </span>
                </td>
              </tr>
            ))}
          </DataTable>
        </section>

        <div className="portal-donor-dashboard-sidebar">
          <section className="portal-panel" aria-label="Sponsored students">
            <header className="portal-panel__header portal-panel__header--compact">
              <div>
                <h2 className="portal-panel__title">Sponsored students</h2>
                <p className="portal-panel__desc">Students connected to your giving.</p>
              </div>
              <Link href="/portal/donor/sponsored" className="portal-panel__link">
                View all <ArrowRight className="w-3.5 h-3.5" aria-hidden />
              </Link>
            </header>
            <DonorSponsoredList students={sponsoredStudents.slice(0, 4)} compact />
          </section>

          <section className="portal-panel" aria-label="Quick links">
            <header className="portal-panel__header portal-panel__header--compact">
              <div>
                <h2 className="portal-panel__title">Quick links</h2>
                <p className="portal-panel__desc">Receipts, impact, and more.</p>
              </div>
            </header>
            <nav className="space-y-2" aria-label="Donor navigation">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="portal-finance-link">
                  <span className="portal-finance-link__title">{link.title}</span>
                  <ArrowRight className="w-4 h-4 text-[#F78C1F] shrink-0" aria-hidden />
                </Link>
              ))}
            </nav>
          </section>

          <section className="portal-impact-callout">
            <BarChart3 className="w-5 h-5 text-[#0ABFBC] mb-2" aria-hidden />
            <p className="portal-impact-callout__title">See your impact</p>
            <p className="portal-impact-callout__text">
              Compare your giving with academy-wide outcomes and student reach.
            </p>
            <div className="portal-impact-callout__actions">
              <Link href="/portal/donor/impact" className="portal-btn portal-btn--ghost portal-btn--sm">
                Open impact report <Receipt className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
