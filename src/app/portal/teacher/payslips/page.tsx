import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import ListPageError from "@/components/ui/ListPageError";
import TeacherProfileMissing from "@/components/portal/TeacherProfileMissing";
import { requirePortalRole } from "@/lib/portal-auth";
import { formatPKR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TeacherPayslipsPage() {
  try {
    const session = await requirePortalRole("TEACHER");
    const teacher = await prisma.teacher.findFirst({
      where: { user: { email: session.user?.email ?? "" } },
    });
    if (!teacher) return <TeacherProfileMissing />;

    const payrolls = await prisma.payroll.findMany({
      where: { teacherId: teacher.id },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Teacher portal"
          title="Payslips"
          description="Your salary payment history from the academy."
        />

        <DataTable
          headers={["Period", "Amount", "Status", "Processed"]}
          isEmpty={payrolls.length === 0}
          emptyMessage="No payroll records yet. Payments appear here after processing."
        >
          {payrolls.map((p) => (
            <tr key={p.id}>
              <td className="font-medium text-white text-sm">
                {p.month} {p.year}
              </td>
              <td className="font-bold text-[#0ABFBC] text-sm">{formatPKR(p.amount)}</td>
              <td>
                <span className="badge badge-success">{p.status}</span>
              </td>
              <td className="text-sm text-white/40">
                {p.processedAt?.toLocaleDateString() ?? "—"}
              </td>
            </tr>
          ))}
        </DataTable>
      </PortalListPage>
    );
  } catch (error) {
    console.error("TeacherPayslipsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
