import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return <span className="badge badge-success">Approved</span>;
    case "REJECTED":
      return <span className="badge badge-error">Rejected</span>;
    default:
      return <span className="badge badge-warning">Pending</span>;
  }
}

export default async function AdminAdmissionsPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const applications = await prisma.admissionApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = applications.filter((a) => a.status === "PENDING").length;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Admission Applications"
        description={`Review and manage student admission requests. ${pendingCount} pending review.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total applications", value: applications.length },
          { label: "Pending review", value: pendingCount },
          { label: "Approved", value: applications.filter((a) => a.status === "APPROVED").length },
        ].map((card, i) => (
          <div key={i} className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-[16px] border border-white/[0.08] rounded-2xl p-6">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">{card.label}</p>
            <p className="text-3xl font-bold text-white font-mono">{card.value}</p>
          </div>
        ))}
      </div>

      <DataTable
        headers={["Student", "Grade", "Parent", "Phone", "Submitted", "Status"]}
        isEmpty={applications.length === 0}
        emptyMessage="No admission applications yet. They will appear here when families apply online."
      >
        {applications.map((app) => (
          <tr key={app.id} className="hover:bg-white/[0.03] transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#05335C] to-[#0A4A82] flex items-center justify-center text-white text-xs font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{app.studentName}</p>
                  <p className="text-xs text-white/40">
                    DOB: {app.dateOfBirth.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-white/80">Grade {app.gradeApplying}</td>
            <td className="px-6 py-4 text-sm text-white/80">{app.parentName}</td>
            <td className="px-6 py-4 text-sm text-white/80">{app.parentPhone}</td>
            <td className="px-6 py-4 text-sm text-white/40">
              {app.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </td>
            <td className="px-6 py-4">{statusBadge(app.status)}</td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
