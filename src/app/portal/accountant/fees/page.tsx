import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import FeeStructureFormModal from "@/components/portal/forms/FeeStructureFormModal";
import FeePaymentFormModal from "@/components/portal/forms/FeePaymentFormModal";
import { redirect } from "next/navigation";
import { Coins, CheckCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountantFeesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const feeStructures = await prisma.feeStructure.findMany({
    include: { class: true },
    orderBy: { createdAt: "desc" }
  });

  const payments = await prisma.feePayment.findMany({
    include: { student: { include: { user: true, class: true } }, feeStructure: true },
    orderBy: { createdAt: "desc" }
  });

  const classes = await prisma.class.findMany({ orderBy: { grade: "asc" } });
  const students = await prisma.student.findMany({ include: { user: true, class: true }, orderBy: { user: { name: "asc" } } });

  const totalCollected = payments.filter(p => p.status === "CONFIRMED").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mb-8">
        <PageHeader
          title="Fee Management"
          description="Create fee structures and collect student payments."
          customAction={<FeeStructureFormModal classes={classes} />}
        />
        
        <div className="flex items-center gap-4 -mt-8">
          <div className="card-elevated p-4 bg-green-50 border-green-100 min-w-[200px]">
            <p className="text-green-700 text-xs font-bold uppercase tracking-wider mb-1">Total Collected</p>
            <h3 className="text-2xl font-black text-green-700">Rs {totalCollected.toLocaleString()}</h3>
          </div>
          <FeePaymentFormModal students={students} feeStructures={feeStructures} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-bold text-[#05335C] mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#F78C1F]" /> Active Fee Plans
          </h3>
          <div className="space-y-4">
            {feeStructures.map(f => (
              <div key={f.id} className="card-elevated p-5">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-[#05335C]">{f.name}</h4>
                  <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded uppercase">{f.frequency}</span>
                </div>
                <div className="text-2xl font-black text-gray-800 mb-2">Rs {f.amount.toLocaleString()}</div>
                <div className="text-sm text-gray-500">
                  {f.class ? `Applied to: ${f.class.grade} ${f.class.section}` : 'General Plan'}
                </div>
              </div>
            ))}
            {feeStructures.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500 text-sm">No fee structures defined.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-[#05335C] mb-4">Recent Transactions</h3>
          <DataTable headers={["Student", "Plan", "Amount", "Method", "Date", "Status"]} isEmpty={payments.length === 0}>
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{p.student.user.name}</div>
                  <div className="text-xs text-gray-500">{p.student.class?.grade}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.feeStructure.name}</td>
                <td className="px-6 py-4 font-bold text-green-600">Rs {p.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-xs font-semibold text-gray-500">{p.method}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.paidAt?.toLocaleDateString() || p.createdAt.toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  {p.status === "CONFIRMED" ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded w-max">
                      <CheckCircle className="w-3 h-3" /> Paid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded w-max">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      </div>
    </div>
  );
}
