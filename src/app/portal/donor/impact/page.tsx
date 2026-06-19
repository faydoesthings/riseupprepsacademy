import PortalListPage from "@/components/portal/PortalListPage";
import PageHeader from "@/components/ui/PageHeader";
import ListPageError from "@/components/ui/ListPageError";
import DonorProfileMissing from "@/components/portal/donor/DonorProfileMissing";
import { requirePortalRole } from "@/lib/portal-auth";
import { donorConfirmedTotal, getDonorForPortal } from "@/lib/donor-portal";
import { getPublicStats } from "@/lib/stats";
import { formatPKR } from "@/lib/format";
import Link from "next/link";
import { ArrowRight, GraduationCap, Heart, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DonorImpactPage() {
  try {
    const session = await requirePortalRole("DONOR");
    const [donor, publicStats] = await Promise.all([
      getDonorForPortal(session.user?.email ?? ""),
      getPublicStats().catch(() => null),
    ]);

    if (!donor) return <DonorProfileMissing />;

    const yourTotal = donorConfirmedTotal(donor.donations, donor.totalDonated);
    const academyStudents = publicStats?.students ?? "—";
    const communityRaised = publicStats ? formatPKR(publicStats.totalDonated) : "—";

    const kpiCards = [
      {
        label: "Your giving",
        value: formatPKR(yourTotal),
        icon: Heart,
        tone: "orange" as const,
      },
      {
        label: "Students sponsored",
        value: String(donor.sponsoredStudents.length),
        icon: Users,
        tone: "teal" as const,
      },
      {
        label: "Academy students",
        value: String(academyStudents),
        icon: GraduationCap,
        tone: "neutral" as const,
      },
      {
        label: "Community raised",
        value: communityRaised,
        icon: Heart,
        tone: "teal" as const,
      },
    ];

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Donor portal"
          title="Impact report"
          description="How your support contributes to education in Sindh."
        />

        <section className="portal-stat-grid portal-stat-grid--4 mb-6" aria-label="Impact metrics">
          {kpiCards.map((card) => {
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

        <section className="portal-impact-callout">
          <p className="portal-impact-callout__title">Your gift in action</p>
          <p className="portal-impact-callout__text">
            Every rupee helps provide quality schooling, materials, and daily support for students
            who would otherwise lack access. Direct sponsorship connects you to a student&apos;s
            journey at RiseUp Preps Academy — from classroom learning to exam results and beyond.
          </p>
          <div className="portal-impact-callout__actions">
            <Link href="/portal/donor/sponsored" className="portal-btn portal-btn--primary portal-btn--sm">
              View sponsored students <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link href="/impact" className="portal-btn portal-btn--ghost portal-btn--sm">
              Public impact page
            </Link>
          </div>
        </section>
      </PortalListPage>
    );
  } catch (error) {
    console.error("DonorImpactPage:", error);
    return <ListPageError />;
  }
}
