import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import AssignmentFormModal from "@/components/portal/forms/AssignmentFormModal";
import { ExternalLink, Users } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TeacherAssignmentsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } },
  });

  if (!teacher) return <div className="p-8 text-center text-red-600">Unauthorized</div>;

  const assignments = await prisma.assignment.findMany({
    where: { teacherId: teacher.id },
    include: { 
      class: true, 
      subject: true,
      _count: { select: { submissions: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const classes = await prisma.class.findMany({ orderBy: { grade: "asc" } });
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Assignments"
        description="Create and grade homework and assignments for your classes."
        customAction={<AssignmentFormModal classes={classes} subjects={subjects} teacherId={teacher.id} />}
      />

      <DataTable headers={["Title", "Class & Subject", "Due Date", "Submissions", "Resource", "Actions"]} isEmpty={assignments.length === 0}>
        {assignments.map(a => (
          <tr key={a.id} className="hover:bg-gray-50">
            <td className="px-6 py-4">
              <span className="font-bold text-[#05335C] block">{a.title}</span>
              <span className="text-xs text-gray-500">{a.description?.substring(0, 50)}...</span>
            </td>
            <td className="px-6 py-4">
              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs block w-max mb-1">{a.class.grade}</span>
              <span className="text-xs text-gray-600">{a.subject.name}</span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {a.dueDate.toLocaleDateString()}
            </td>
            <td className="px-6 py-4">
              <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                <Users className="w-4 h-4" /> {a._count.submissions}
              </span>
            </td>
            <td className="px-6 py-4">
              {a.fileUrl ? (
                <a href={a.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                  View <ExternalLink className="w-3 h-3" />
                </a>
              ) : <span className="text-gray-400 text-sm">-</span>}
            </td>
            <td className="px-6 py-4">
              <button className="text-xs font-semibold bg-[#F78C1F]/10 text-[#F78C1F] px-3 py-1.5 rounded hover:bg-[#F78C1F]/20">
                Grade Submissions
              </button>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
