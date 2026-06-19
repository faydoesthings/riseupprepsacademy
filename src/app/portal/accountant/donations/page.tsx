import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import { requirePortalRole } from "@/lib/portal-auth";
import {
  buildDonationListWhere,
  paginationArgs,
  parsePageParam,
  parseSearchParam,
} from "@/lib/list-query";
import { HeartHandshake, Gift, Users } from "lucide-react";
import { formatPKR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountantDonationsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  try {
    await requirePortalRole("ACCOUNTANT", "SUPER_ADMIN");
    const search = parseSearchParam(searchParams.search);
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);
    const donationWhere = buildDonationListWhere(search);

    const [donations, donationTotal, totalDonationsAgg, sponsorships, monthlyDonationsAgg] =
      await Promise.all([
        prisma.donation.findMany({
          where: donationWhere,
          include: { donor: { include: { user: true } } },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.donation.count({ where: donationWhere }),
        prisma.donation.aggregate({
          where: { status: "CONFIRMED" },
          _sum: { amount: true },
        }),
        prisma.student.findMany({
          where: { isSponsored: true, sponsorId: { not: null } },
          include: {
            sponsor: { include: { user: true } },
            user: true,
            class: true,
          },
          orderBy: { updatedAt: "desc" },
          take: 20,
        }),
        prisma.donation.aggregate({
          where: {
            status: "CONFIRMED",
            createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
          _sum: { amount: true },
        }),
      ]);

    const totalDonations = totalDonationsAgg._sum.amount ?? 0;
    const monthlyDonations = monthlyDonationsAgg._sum.amount ?? 0;

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Accountant portal"
          title="Donations"
          description="View philanthropic contributions and active student sponsorships."
          searchPlaceholder="Search donations..."
        />

        <section className="portal-stat-grid" aria-label="Donation summary">
          <article className="portal-kpi portal-kpi--teal">
            <div className="portal-kpi__icon" aria-hidden>
              <HeartHandshake className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="portal-kpi__body">
              <p className="portal-kpi__label">Total funds raised</p>
              <p className="portal-kpi__value portal-kpi__value--text">
                {formatPKR(totalDonations)}
              </p>
              <p className="portal-kpi__hint">All confirmed donations</p>
            </div>
          </article>
          <article className="portal-kpi portal-kpi--orange">
            <div className="portal-kpi__icon" aria-hidden>
              <Gift className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="portal-kpi__body">
              <p className="portal-kpi__label">This month</p>
              <p className="portal-kpi__value portal-kpi__value--text">
                {formatPKR(monthlyDonations)}
              </p>
              <p className="portal-kpi__hint">Confirmed this calendar month</p>
            </div>
          </article>
        </section>

        <div className="portal-settings-grid">
          <section className="portal-list-section">
            <h2 className="portal-list-section__title">
              <span className="portal-list-section__badge">
                <Gift className="w-4 h-4" aria-hidden />
              </span>
              Recent donations
            </h2>
            <DataTable
              headers={["Donor", "Amount", "Type", "Status", "Date"]}
              isEmpty={donations.length === 0}
              emptyMessage={
                search ? "No donations match your search." : "No donations recorded yet."
              }
            >
              {donations.map((donation) => (
                <tr key={donation.id}>
                  <td className="font-bold text-white text-sm">{donation.donor.user.name}</td>
                  <td className="font-bold text-[#0ABFBC] text-sm">
                    {formatPKR(donation.amount)}
                  </td>
                  <td>
                    <span className="badge badge-navy text-xs">{donation.type}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        donation.status === "CONFIRMED" ? "badge-success" : "badge-warning"
                      }`}
                    >
                      {donation.status}
                    </span>
                  </td>
                  <td className="text-sm text-white/40">
                    {donation.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </DataTable>
            <Pagination
              page={page}
              total={donationTotal}
              basePath="/portal/accountant/donations"
              searchParams={{ search: search || undefined }}
            />
          </section>

          <section className="portal-list-section">
            <h2 className="portal-list-section__title">
              <span className="portal-list-section__badge">
                <Users className="w-4 h-4" aria-hidden />
              </span>
              Active sponsorships
            </h2>
            <DataTable
              headers={["Sponsor", "Student", "Grade"]}
              isEmpty={sponsorships.length === 0}
              emptyMessage="No active sponsorships yet."
            >
              {sponsorships.map((student) => (
                <tr key={student.id}>
                  <td className="font-bold text-white text-sm">{student.sponsor?.user.name}</td>
                  <td className="font-medium text-white/80 text-sm">{student.user.name}</td>
                  <td className="text-xs text-white/40">{student.class?.grade ?? "No class"}</td>
                </tr>
              ))}
            </DataTable>
          </section>
        </div>
      </PortalListPage>
    );
  } catch (error) {
    console.error("AccountantDonationsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
