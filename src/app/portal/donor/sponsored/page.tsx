import PortalListPage from "@/components/portal/PortalListPage";
import PageHeader from "@/components/ui/PageHeader";
import ListPageError from "@/components/ui/ListPageError";
import DonorProfileMissing from "@/components/portal/donor/DonorProfileMissing";
import DonorSponsoredList from "@/components/portal/donor/DonorSponsoredList";
import { requirePortalRole } from "@/lib/portal-auth";
import { getDonorForPortal, getSponsoredStudentSummaries } from "@/lib/donor-portal";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DonorSponsoredPage() {
  try {
    const session = await requirePortalRole("DONOR");
    const donor = await getDonorForPortal(session.user?.email ?? "");
    if (!donor) return <DonorProfileMissing />;

    const summaries = await getSponsoredStudentSummaries(donor.id);

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Donor portal"
          title="Sponsored students"
          description="Track attendance, exam results, and assignment progress for each student you support."
        />

        <section className="portal-panel">
          <DonorSponsoredList students={summaries} />
        </section>

        {summaries.length === 0 && (
          <div className="portal-impact-callout mt-6">
            <p className="portal-impact-callout__title">Interested in sponsoring?</p>
            <p className="portal-impact-callout__text">
              PKR 2,500 covers one month of school for a child. Contact the academy or make a gift
              to get started.
            </p>
            <div className="portal-impact-callout__actions">
              <Link href="/donate" className="portal-btn portal-btn--primary portal-btn--sm">
                Donate now <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <Link href="/contact" className="portal-btn portal-btn--ghost portal-btn--sm">
                Contact academy
              </Link>
            </div>
          </div>
        )}
      </PortalListPage>
    );
  } catch (error) {
    console.error("DonorSponsoredPage:", error);
    return <ListPageError />;
  }
}
