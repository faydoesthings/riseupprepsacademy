import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import TeacherFormModal from "@/components/portal/forms/TeacherFormModal";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

function getStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return <span className="badge badge-success">Active</span>;
    case "INACTIVE":
      return <span className="badge badge-error">Inactive</span>;
    case "ON_LEAVE":
      return <span className="badge badge-warning">On Leave</span>;
    default:
      return <span className="badge bg-gray-100 text-gray-700">{status}</span>;
  }
}

export default async function TeachersPage() {
  const teachers = await prisma.teacher.findMany({
    include: {
      user: true,
      subjects: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Faculty Management"
        description="View and manage all academy teachers and their assigned subjects."
        customAction={<TeacherFormModal />}
        searchPlaceholder="Search by name or subject..."
      />

      <DataTable
        headers={["Teacher", "Specialization", "Subjects", "Joining Date", "Status", "Actions"]}
        isEmpty={teachers.length === 0}
      >
        {teachers.map((teacher) => {
          const initials = teacher.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F78C1F] to-[#F9A54E] flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-[#05335C]">{teacher.user.name}</p>
                    <p className="text-xs text-gray-500">{teacher.user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {teacher.specialization || "N/A"}
              </td>
              <td className="px-6 py-4">
                {teacher.subjects && teacher.subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.slice(0, 2).map((sub) => (
                      <span key={sub.id} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                        {sub.name}
                      </span>
                    ))}
                    {teacher.subjects.length > 2 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-400">
                        +{teacher.subjects.length - 2}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">None</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {teacher.joiningDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(teacher.status)}
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
          );
        })}
      </DataTable>
    </div>
  );
}
