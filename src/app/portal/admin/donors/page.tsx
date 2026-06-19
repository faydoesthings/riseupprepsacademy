import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import DonationFormModal from "@/components/portal/forms/DonationFormModal";
import SponsorshipFormModal from "@/components/portal/forms/SponsorshipFormModal";
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

export default async function AdminDonorsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  try {
    await requirePortalRole("SUPER_ADMIN");
    const search = parseSearchParam(searchParams.search);
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);
    const donationWhere = buildDonationListWhere(search);

    const [
      donors,
      donations,
      donationTotal,
      totalDonationsAgg,
      sponsorships,
      students,
    ] = await Promise.all([
      prisma.donor.findMany({ include: { user: true } }),
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
      prisma.student.findMany({
        include: { user: true, class: true },
        where: { status: "ACTIVE", isSponsored: false },
        take: 200,
      }),
    ]);

    const totalDonations = totalDonationsAgg._sum.amount ?? 0;

    return (
      <PortalListPage>
        <PageHeader
          title="Donors"
          description="Track donations, manage philanthropic relations, and link sponsors to students."
          searchPlaceholder="Search donations..."
          customAction={
            <div className="flex flex-col sm:flex-row gap-2">
              <DonationFormModal donors={donors} />
              <SponsorshipFormModal donors={donors} students={students} />
            </div>
          }
        />

        <section className="portal-stat-grid" aria-label="Donor summary">
          <article className="portal-kpi portal-kpi--orange">
            <div className="portal-kpi__icon" aria-hidden>
              <HeartHandshake className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="portal-kpi__body">
              <p className="portal-kpi__label">Total funds raised</p>
              <p className="portal-kpi__value">{formatPKR(totalDonations)}</p>
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
              headers={["Donor", "Amount", "Type", "Date"]}
              isEmpty={donations.length === 0}
              emptyMessage={
                search ? "No donations match your search." : "No donations recorded yet."
              }
            >
              {donations.map((d) => (
                <tr key={d.id}>
                  <td className="font-bold text-white text-sm">{d.donor.user.name}</td>
                  <td className="font-bold text-[#0ABFBC] text-sm">
                    {formatPKR(d.amount)}
                  </td>
                  <td>
                    <span className="text-xs font-semibold px-2 py-1 bg-white/5 text-white/60 rounded-full">
                      {d.type}
                    </span>
                  </td>
                  <td className="text-sm text-white/40">
                    {d.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </DataTable>
            <Pagination
              page={page}
              total={donationTotal}
              basePath="/portal/admin/donors"
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
              {sponsorships.map((s) => (
                <tr key={s.id}>
                  <td className="font-bold text-white text-sm">{s.sponsor?.user.name}</td>
                  <td className="font-medium text-white/80 text-sm">{s.user.name}</td>
                  <td className="text-xs text-white/40">
                    {s.class?.grade || "No class"}
                  </td>
                </tr>
              ))}
            </DataTable>
          </section>
        </div>
      </PortalListPage>
    );
  } catch (error) {
    console.error("AdminDonorsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
