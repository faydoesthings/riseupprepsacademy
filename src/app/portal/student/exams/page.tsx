import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import { redirect } from "next/navigation";
import { GraduationCap, TrendingUp, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentExamsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const student = await prisma.student.findFirst({
    where: { user: { email: session.user.email } },
    include: { class: true }
  });

  if (!student) return <div className="p-8 text-center text-red-600">Unauthorized</div>;

  const results = await prisma.examResult.findMany({
    where: { studentId: student.id },
    include: { subject: true },
    orderBy: { createdAt: "desc" }
  });

  // Calculate some basic stats
  const totalExams = results.length;
  let averagePercentage = 0;
  if (totalExams > 0) {
    const sum = results.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
    averagePercentage = sum / totalExams;
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="My Exam Results"
        description="Track your academic performance and exam scores."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card-elevated p-6 flex items-center gap-6 bg-gradient-to-r from-[#05335C] to-[#0A4A82] text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-8 h-8 text-[#F78C1F]" />
          </div>
          <div>
            <p className="text-white/80 font-medium mb-1">Overall Average</p>
            <h2 className="text-4xl font-black">{averagePercentage.toFixed(1)}%</h2>
          </div>
        </div>

        <div className="card-elevated p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Total Exams Taken</p>
            <h2 className="text-4xl font-black text-[#05335C]">{totalExams}</h2>
          </div>
        </div>
      </div>

      <div className="card-elevated p-0 overflow-hidden">
        <div className="bg-[#F8FAFC] px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-[#05335C] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-400" /> Official Transcript
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Exam Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Score</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Percentage</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold text-[#05335C]">{r.examName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{r.subject.name}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    {r.marks} <span className="text-gray-400 font-normal text-xs">/ {r.totalMarks}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">
                    {r.percentage?.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-black ${
                      r.grade?.includes('A') ? 'bg-green-100 text-green-700 border border-green-200' :
                      r.grade?.includes('B') ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      r.grade?.includes('C') ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {r.grade}
                    </span>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <GraduationCap className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                    No exam results have been published yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
