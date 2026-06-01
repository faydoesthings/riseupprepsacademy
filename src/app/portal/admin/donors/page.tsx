import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import DonationFormModal from "@/components/portal/forms/DonationFormModal";
import SponsorshipFormModal from "@/components/portal/forms/SponsorshipFormModal";
import { redirect } from "next/navigation";
import { HeartHandshake, Gift, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDonorsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const donors = await prisma.donor.findMany({
    include: { user: true }
  });

  const donations = await prisma.donation.findMany({
    include: { donor: { include: { user: true } } },
    orderBy: { createdAt: "desc" }
  });

  const sponsorships = await prisma.student.findMany({
    where: { isSponsored: true, sponsorId: { not: null } },
    include: { 
      sponsor: { include: { user: true } },
      user: true, 
      class: true 
    },
    orderBy: { updatedAt: "desc" }
  });

  const students = await prisma.student.findMany({
    include: { user: true, class: true },
    where: { status: "ACTIVE", isSponsored: false }
  });

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mb-8">
        <PageHeader
          title="Donor Management"
          description="Track donations, manage philanthropic relations, and link sponsors to students."
        />
        
        <div className="flex items-center gap-4 -mt-8">
          <div className="card-elevated p-4 bg-red-50 border-red-100 min-w-[200px]">
            <p className="text-red-700 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <HeartHandshake className="w-4 h-4" /> Total Funds Raised
            </p>
            <h3 className="text-2xl font-black text-red-700">Rs {totalDonations.toLocaleString()}</h3>
          </div>
          <div className="flex flex-col gap-2">
            <DonationFormModal donors={donors} />
            <SponsorshipFormModal donors={donors} students={students} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-bold text-[#05335C] mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#F78C1F]" /> Recent Donations
          </h3>
          <DataTable headers={["Donor", "Amount", "Type", "Date"]} isEmpty={donations.length === 0}>
            {donations.map(d => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-[#05335C]">{d.donor.user.name}</div>
                </td>
                <td className="px-6 py-4 font-bold text-red-600">Rs {d.amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {d.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{d.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </DataTable>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#05335C] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> Active Sponsorships
          </h3>
          <DataTable headers={["Sponsor", "Student", "Grade"]} isEmpty={sponsorships.length === 0}>
            {sponsorships.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-[#05335C]">{s.sponsor?.user.name}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-800">{s.user.name}</div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">{s.class?.grade || 'No Class'}</td>
              </tr>
            ))}
          </DataTable>
        </div>
      </div>
    </div>
  );
}
