import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import ExamResultFormModal from "@/components/portal/forms/ExamResultFormModal";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeacherExamsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } },
    include: { classes: true, subjects: true }
  });

  if (!teacher) return <div className="p-8 text-center text-red-600">Unauthorized</div>;

  // Since we don't have a direct link from ExamResult to Teacher, we find exam results for subjects this teacher teaches
  const subjects = await prisma.subject.findMany({ where: { teacherId: teacher.id } });
  const subjectIds = subjects.map(s => s.id);

  const results = await prisma.examResult.findMany({
    where: { subjectId: { in: subjectIds } },
    include: { student: { include: { user: true, class: true } }, subject: true },
    orderBy: { createdAt: "desc" }
  });

  // Get all students in classes taught by this teacher for the dropdown
  const classIds = await prisma.class.findMany({ where: { teacherId: teacher.id } }).then(c => c.map(x => x.id));
  const students = await prisma.student.findMany({
    where: { classId: { in: classIds } },
    include: { user: true }
  });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Exam Results"
        description="Log and manage exam marks for your students."
        customAction={<ExamResultFormModal students={students} subjects={subjects} />}
      />

      <DataTable headers={["Exam Name", "Student", "Class", "Subject", "Score", "Grade"]} isEmpty={results.length === 0}>
        {results.map(r => (
          <tr key={r.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 font-bold text-[#05335C]">{r.examName}</td>
            <td className="px-6 py-4">{r.student.user.name}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{r.student.class?.grade} {r.student.class?.section}</td>
            <td className="px-6 py-4 text-sm">{r.subject.name}</td>
            <td className="px-6 py-4">
              <span className="font-bold text-gray-800">{r.marks}</span> <span className="text-gray-400 text-xs">/ {r.totalMarks}</span>
              <div className="text-xs font-semibold text-gray-500">{r.percentage?.toFixed(1)}%</div>
            </td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                r.grade?.includes('A') ? 'bg-green-100 text-green-700' :
                r.grade?.includes('B') ? 'bg-blue-100 text-blue-700' :
                r.grade?.includes('C') ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>{r.grade}</span>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
