import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { redirect } from "next/navigation";
import { Heart, Users, Calendar, Award } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DonorDashboard() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const donor = await prisma.donor.findFirst({
    where: { user: { email: session.user.email } },
    include: {
      user: true,
      donations: { orderBy: { createdAt: "desc" } },
      sponsoredStudents: { 
        include: { 
          user: true, 
          class: true
        }
      }
    }
  });

  if (!donor) return <div className="p-8 text-center text-red-600">You must be registered as a Donor to view this dashboard.</div>;

  const totalDonated = donor.donations.reduce((sum, d) => sum + d.amount, 0) + donor.totalDonated;
  const activeSponsorships = donor.sponsoredStudents.length;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title={`Welcome, ${donor.user.name}`}
        description="Thank you for supporting RiseUp Preps Academy. Your generosity makes education possible."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-elevated p-6 bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center gap-6">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Heart className="w-7 h-7 text-white" fill="currentColor" />
          </div>
          <div>
            <p className="text-white/80 font-medium text-sm mb-1 uppercase tracking-wider">Total Impact</p>
            <h2 className="text-3xl font-black">Rs {totalDonated.toLocaleString()}</h2>
          </div>
        </div>

        <div className="card-elevated p-6 flex items-center gap-6 border-l-4 border-blue-500">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
            <Users className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1 uppercase tracking-wider">Sponsored Students</p>
            <h2 className="text-3xl font-black text-[#05335C]">{activeSponsorships}</h2>
          </div>
        </div>
        
        <div className="card-elevated p-6 flex items-center gap-6">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
            <Award className="w-7 h-7 text-orange-500" />
          </div>
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1 uppercase tracking-wider">Donor Status</p>
            <h2 className="text-2xl font-black text-gray-800">{donor.preferAnonymous ? "Anonymous" : "Public"}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-bold text-[#05335C] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> My Sponsored Students
          </h3>
          <div className="space-y-4">
            {donor.sponsoredStudents.map(s => (
              <div key={s.id} className="card-elevated p-5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-500">
                    {s.user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#05335C]">{s.user.name}</h4>
                    <p className="text-sm text-gray-500">{s.class?.grade || 'Unassigned Class'}</p>
                  </div>
                </div>
              </div>
            ))}
            {donor.sponsoredStudents.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <p className="text-gray-500">You are not currently sponsoring any students directly.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#05335C] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" /> Donation History
          </h3>
          <DataTable headers={["Date", "Amount", "Type", "Status"]} isEmpty={donor.donations.length === 0}>
            {donor.donations.map(d => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-600 font-medium">{d.createdAt.toLocaleDateString()}</td>
                <td className="px-6 py-4 font-bold text-red-600">Rs {d.amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {d.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-green-600">{d.status}</td>
              </tr>
            ))}
          </DataTable>
        </div>
      </div>
    </div>
  );
}
