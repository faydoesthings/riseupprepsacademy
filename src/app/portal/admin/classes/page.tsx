import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import ClassFormModal from "@/components/portal/forms/ClassFormModal";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const teachers = await prisma.teacher.findMany({
    include: { user: true },
    where: { status: "ACTIVE" },
  });

  const classes = await prisma.class.findMany({
    include: {
      teacher: { include: { user: true } },
      _count: {
        select: { students: true, subjects: true },
      },
    },
    orderBy: [{ grade: "asc" }, { section: "asc" }],
  });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Class Configuration"
        description="Manage academic classes, sections, and assigned class teachers."
        customAction={<ClassFormModal teachers={teachers} />}
      />

      <DataTable
        headers={["Class Name", "Grade & Section", "Class Teacher", "Total Students", "Subjects", "Academic Year"]}
        isEmpty={classes.length === 0}
      >
        {classes.map((cls) => (
          <tr key={cls.id} className="hover:bg-gray-50/50 transition-colors">
            <td className="px-6 py-4">
              <span className="font-bold text-[#05335C]">{cls.name}</span>
            </td>
            <td className="px-6 py-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                {cls.grade} {cls.section ? `- ${cls.section}` : ""}
              </span>
            </td>
            <td className="px-6 py-4 text-sm">
              {cls.teacher ? (
                <span className="font-medium text-gray-700">{cls.teacher.user.name}</span>
              ) : (
                <span className="text-gray-400 italic">Unassigned</span>
              )}
            </td>
            <td className="px-6 py-4 text-sm font-medium text-gray-700">
              {cls._count.students}
            </td>
            <td className="px-6 py-4 text-sm font-medium text-gray-700">
              {cls._count.subjects}
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {cls.academicYear}
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
