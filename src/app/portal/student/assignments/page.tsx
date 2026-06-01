import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import SubmissionFormModal from "@/components/portal/forms/SubmissionFormModal";
import { ExternalLink, CheckCircle, Clock } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StudentAssignmentsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const student = await prisma.student.findFirst({
    where: { user: { email: session.user.email } },
  });

  if (!student || !student.classId) return <div className="p-8 text-center text-red-600">You must be assigned to a class to view assignments.</div>;

  const assignments = await prisma.assignment.findMany({
    where: { classId: student.classId },
    include: { 
      subject: true,
      teacher: { include: { user: true } },
      submissions: { where: { studentId: student.id } }
    },
    orderBy: { dueDate: "asc" }
  });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="My Assignments"
        description="View your homework, submit your work, and check your grades."
      />

      <div className="space-y-6">
        {assignments.map(a => {
          const submission = a.submissions[0];
          const isSubmitted = !!submission;
          const isOverdue = new Date() > new Date(a.dueDate) && !isSubmitted;

          return (
            <div key={a.id} className="card-elevated p-0 overflow-hidden flex flex-col md:flex-row">
              {/* Left Details */}
              <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F78C1F] bg-[#F78C1F]/10 px-2 py-1 rounded">
                    {a.subject.name}
                  </span>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${
                    isSubmitted ? "text-green-700 bg-green-50" : 
                    isOverdue ? "text-red-700 bg-red-50" : "text-blue-700 bg-blue-50"
                  }`}>
                    {isSubmitted ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {isSubmitted ? "Submitted" : `Due ${a.dueDate.toLocaleDateString()}`}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-[#05335C] mb-2">{a.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{a.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Assigned by: {a.teacher.user.name}</span>
                  {a.fileUrl && (
                    <a href={a.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      Resource Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right Action / Status */}
              <div className="p-6 md:w-64 bg-gray-50 flex flex-col justify-center items-center text-center">
                {isSubmitted ? (
                  <div className="space-y-2 w-full">
                    <p className="text-xs font-medium text-green-600 mb-2">Work Submitted on {submission.submittedAt.toLocaleDateString()}</p>
                    {submission.grade ? (
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="text-2xl font-black text-[#05335C] mb-1">{submission.marks}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase">Score / Grade {submission.grade}</div>
                        {submission.feedback && <p className="text-xs text-gray-600 mt-2 italic">"{submission.feedback}"</p>}
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 text-yellow-700 text-xs font-medium">
                        Waiting for Teacher to grade
                      </div>
                    )}
                    <a href={submission.fileUrl || "#"} target="_blank" className="text-xs text-blue-600 hover:underline inline-block mt-2">
                      View My Submission
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3 w-full">
                    {isOverdue && <p className="text-xs font-bold text-red-600">This assignment is overdue!</p>}
                    <SubmissionFormModal assignmentId={a.id} studentId={student.id} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {assignments.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Assignments</h3>
            <p className="text-gray-500">You're all caught up! There are no assignments for your class right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
