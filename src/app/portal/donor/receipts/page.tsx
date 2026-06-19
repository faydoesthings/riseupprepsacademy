import PortalListPage from "@/components/portal/PortalListPage";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import ListPageError from "@/components/ui/ListPageError";
import DonorProfileMissing from "@/components/portal/donor/DonorProfileMissing";
import { requirePortalRole } from "@/lib/portal-auth";
import { getDonorForPortal } from "@/lib/donor-portal";
import { formatPKR } from "@/lib/format";
import { ExternalLink, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DonorReceiptsPage() {
  try {
    const session = await requirePortalRole("DONOR");
    const donor = await getDonorForPortal(session.user?.email ?? "");
    if (!donor) return <DonorProfileMissing />;

    const confirmed = donor.donations.filter((d) => d.status === "CONFIRMED");
    const withReceipt = confirmed.filter((d) => d.receiptUrl);

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Donor portal"
          title="Receipts"
          description="Download receipts for your confirmed donations."
        />

        <section className="portal-stat-grid mb-6" aria-label="Receipt summary">
          <article className="portal-kpi portal-kpi--teal">
            <div className="portal-kpi__icon" aria-hidden>
              <FileText className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="portal-kpi__body">
              <p className="portal-kpi__label">Available receipts</p>
              <p className="portal-kpi__value">{withReceipt.length}</p>
              <p className="portal-kpi__hint">Of {confirmed.length} confirmed gifts</p>
            </div>
          </article>
        </section>

        <DataTable
          headers={["Date", "Amount", "Receipt"]}
          isEmpty={confirmed.length === 0}
          emptyMessage="Receipts appear here after your donations are confirmed."
        >
          {confirmed.map((donation) => (
            <tr key={donation.id}>
              <td className="text-sm text-white/50 font-mono">
                {donation.createdAt.toLocaleDateString()}
              </td>
              <td className="font-bold text-sm font-mono text-white">
                {formatPKR(donation.amount)}
              </td>
              <td>
                {donation.receiptUrl ? (
                  <a
                    href={donation.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="portal-inline-link"
                  >
                    View receipt <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                  </a>
                ) : (
                  <span className="text-sm text-white/35">Processing</span>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </PortalListPage>
    );
  } catch (error) {
    console.error("DonorReceiptsPage:", error);
    return <ListPageError />;
  }
}
