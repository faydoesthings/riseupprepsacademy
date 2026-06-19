import ListPageError from "@/components/ui/ListPageError";
import DonorDashboard from "@/components/portal/donor/DonorDashboard";
import DonorProfileMissing from "@/components/portal/donor/DonorProfileMissing";
import { requirePortalRole } from "@/lib/portal-auth";
import { donorConfirmedTotal, getDonorForPortal, getSponsoredStudentSummaries } from "@/lib/donor-portal";

export const dynamic = "force-dynamic";

export default async function DonorDashboardPage() {
  try {
    const session = await requirePortalRole("DONOR");
    const donor = await getDonorForPortal(session.user?.email ?? "");

    if (!donor) return <DonorProfileMissing />;

    const firstName = donor.user.name.split(" ")[0] ?? donor.user.name;
    const totalGiving = donorConfirmedTotal(donor.donations, donor.totalDonated);
    const sponsoredSummaries = await getSponsoredStudentSummaries(donor.id);

    return (
      <DonorDashboard
        firstName={firstName}
        totalGiving={totalGiving}
        donationCount={donor.donations.length}
        preferAnonymous={donor.preferAnonymous}
        recentDonations={donor.donations.slice(0, 6)}
        sponsoredStudents={sponsoredSummaries}
      />
    );
  } catch (error) {
    console.error("DonorDashboardPage:", error);
    return <ListPageError />;
  }
}
