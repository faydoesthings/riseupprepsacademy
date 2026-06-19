import PortalListPage from "@/components/portal/PortalListPage";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import ListPageError from "@/components/ui/ListPageError";
import DonorProfileMissing from "@/components/portal/donor/DonorProfileMissing";
import { requirePortalRole } from "@/lib/portal-auth";
import {
  donationStatusBadge,
  donorConfirmedTotal,
  formatDonationType,
  getDonorForPortal,
} from "@/lib/donor-portal";
import { formatPKR } from "@/lib/format";
import { HeartHandshake, Gift } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DonorDonationsPage() {
  try {
    const session = await requirePortalRole("DONOR");
    const donor = await getDonorForPortal(session.user?.email ?? "");
    if (!donor) return <DonorProfileMissing />;

    const confirmed = donor.donations.filter((d) => d.status === "CONFIRMED");
    const total = donorConfirmedTotal(donor.donations, donor.totalDonated);
    const pending = donor.donations.filter((d) => d.status === "PENDING").length;

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Donor portal"
          title="My donations"
          description="Your complete giving history at RiseUp Preps Academy."
        />

        <section className="portal-stat-grid mb-6" aria-label="Donation summary">
          <article className="portal-kpi portal-kpi--orange">
            <div className="portal-kpi__icon" aria-hidden>
              <HeartHandshake className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="portal-kpi__body">
              <p className="portal-kpi__label">Total confirmed</p>
              <p className="portal-kpi__value portal-kpi__value--text">{formatPKR(total)}</p>
            </div>
          </article>
          <article className="portal-kpi portal-kpi--teal">
            <div className="portal-kpi__icon" aria-hidden>
              <Gift className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="portal-kpi__body">
              <p className="portal-kpi__label">Confirmed gifts</p>
              <p className="portal-kpi__value">{confirmed.length}</p>
              {pending > 0 && <p className="portal-kpi__hint">{pending} pending</p>}
            </div>
          </article>
        </section>

        <DataTable
          headers={["Date", "Amount", "Type", "Status"]}
          isEmpty={donor.donations.length === 0}
          emptyMessage="No donations on your account yet."
        >
          {donor.donations.map((donation) => (
            <tr key={donation.id}>
              <td className="text-sm text-white/50 font-mono">
                {donation.createdAt.toLocaleDateString()}
              </td>
              <td className="font-bold text-sm font-mono text-[#F78C1F]">
                {formatPKR(donation.amount)}
              </td>
              <td className="text-sm text-white/60">{formatDonationType(donation.type)}</td>
              <td>
                <span className={`badge ${donationStatusBadge(donation.status)}`}>
                  {donation.status}
                </span>
              </td>
            </tr>
          ))}
        </DataTable>
      </PortalListPage>
    );
  } catch (error) {
    console.error("DonorDonationsPage:", error);
    return <ListPageError />;
  }
}
