import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import ListPageError from "@/components/ui/ListPageError";
import StudentProfileMissing from "@/components/portal/student/StudentProfileMissing";
import { requirePortalRole } from "@/lib/portal-auth";
import { getStudentForPortal } from "@/lib/student-portal";
import { formatPKR } from "@/lib/format";
import { DollarSign, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentFeesPage() {
  try {
    const session = await requirePortalRole("STUDENT");
    const student = await getStudentForPortal(session.user?.email ?? "");
    if (!student) return <StudentProfileMissing />;

    const payments = await prisma.feePayment.findMany({
      where: { studentId: student.id },
      include: { feeStructure: true },
      orderBy: { createdAt: "desc" },
    });

    const totalPaid = payments
      .filter((p) => p.status === "CONFIRMED")
      .reduce((sum, p) => sum + p.amount, 0);
    const pending = payments.filter((p) => p.status === "PENDING");

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Student portal"
          title="Fee status"
          description="View your tuition payments and outstanding balances."
        />

        <section className="portal-stat-grid mb-6" aria-label="Fee summary">
          <article className="portal-kpi portal-kpi--teal">
            <div className="portal-kpi__icon" aria-hidden>
              <DollarSign className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="portal-kpi__body">
              <p className="portal-kpi__label">Total paid</p>
              <p className="portal-kpi__value portal-kpi__value--text">{formatPKR(totalPaid)}</p>
            </div>
          </article>
          <article className="portal-kpi portal-kpi--orange">
            <div className="portal-kpi__icon" aria-hidden>
              <Clock className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="portal-kpi__body">
              <p className="portal-kpi__label">Pending payments</p>
              <p className="portal-kpi__value">{pending.length}</p>
            </div>
          </article>
        </section>

        <DataTable
          headers={["Plan", "Amount", "Month", "Status", "Date"]}
          isEmpty={payments.length === 0}
          emptyMessage="No fee records on your account yet."
        >
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="text-white text-sm">{payment.feeStructure.name}</td>
              <td className="font-bold text-white">{formatPKR(payment.amount)}</td>
              <td className="text-sm text-white/50">{payment.month ?? "—"}</td>
              <td>
                <span
                  className={`badge ${
                    payment.status === "CONFIRMED" ? "badge-success" : "badge-warning"
                  }`}
                >
                  {payment.status}
                </span>
              </td>
              <td className="text-sm text-white/40">
                {(payment.paidAt ?? payment.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </DataTable>
      </PortalListPage>
    );
  } catch (error) {
    console.error("StudentFeesPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
