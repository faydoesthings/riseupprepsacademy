import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import SubjectFormModal from "@/components/portal/forms/SubjectFormModal";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const classes = await prisma.class.findMany({
    orderBy: [{ grade: "asc" }, { section: "asc" }],
  });

  const teachers = await prisma.teacher.findMany({
    include: { user: true },
    where: { status: "ACTIVE" },
  });

  const subjects = await prisma.subject.findMany({
    include: {
      class: true,
      teacher: { include: { user: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Subjects Directory"
        description="Manage all academic subjects and assign them to classes and teachers."
        customAction={<SubjectFormModal classes={classes} teachers={teachers} />}
        searchPlaceholder="Search subjects..."
      />

      <DataTable
        headers={["Subject Name", "Assigned Class", "Subject Teacher", "Actions"]}
        isEmpty={subjects.length === 0}
      >
        {subjects.map((subject) => (
          <tr key={subject.id} className="hover:bg-gray-50/50 transition-colors">
            <td className="px-6 py-4">
              <span className="font-bold text-[#05335C]">{subject.name}</span>
            </td>
            <td className="px-6 py-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                {subject.class.grade} {subject.class.section ? `- ${subject.class.section}` : ""}
              </span>
            </td>
            <td className="px-6 py-4 text-sm">
              {subject.teacher ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] font-bold">
                    {subject.teacher.user.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-700">{subject.teacher.user.name}</span>
                </div>
              ) : (
                <span className="text-gray-400 italic">Unassigned</span>
              )}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-gray-400 hover:text-[#05335C] hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
