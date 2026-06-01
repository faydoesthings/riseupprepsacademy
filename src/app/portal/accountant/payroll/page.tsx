import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import PayrollFormModal from "@/components/portal/forms/PayrollFormModal";
import { redirect } from "next/navigation";
import { Users, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountantPayrollPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const payrolls = await prisma.payroll.findMany({
    include: { teacher: { include: { user: true } } },
    orderBy: { processedAt: "desc" }
  });

  const teachers = await prisma.teacher.findMany({
    include: { user: true },
    where: { status: "ACTIVE" }
  });

  const totalPayroll = payrolls.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <PageHeader
          title="Staff Payroll"
          description="Manage teacher salaries and process monthly payroll."
          customAction={<PayrollFormModal teachers={teachers} />}
        />
        <div className="card-elevated p-4 bg-gradient-to-br from-indigo-800 to-indigo-900 text-white flex items-center gap-4 -mt-8 min-w-[250px]">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-200" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Total Processed</p>
            <h3 className="text-2xl font-black">Rs {totalPayroll.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <DataTable headers={["Teacher", "Period", "Amount", "Processed Date", "Status"]} isEmpty={payrolls.length === 0}>
        {payrolls.map(p => (
          <tr key={p.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 font-bold text-[#05335C]">{p.teacher.user.name}</td>
            <td className="px-6 py-4 font-medium text-gray-700">{p.month} {p.year}</td>
            <td className="px-6 py-4 font-bold text-green-600">Rs {p.amount.toLocaleString()}</td>
            <td className="px-6 py-4 text-sm text-gray-500">{p.processedAt?.toLocaleDateString() || "-"}</td>
            <td className="px-6 py-4">
              <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded w-max">
                <CheckCircle className="w-3 h-3" /> {p.status}
              </span>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
