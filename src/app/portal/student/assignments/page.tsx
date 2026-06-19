import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import SubmissionFormModal from "@/components/portal/forms/SubmissionFormModal";
import ListPageError from "@/components/ui/ListPageError";
import SubjectFilterNav from "@/components/portal/student/SubjectFilterNav";
import StudentClassMissing from "@/components/portal/student/StudentClassMissing";
import StudentProfileMissing from "@/components/portal/student/StudentProfileMissing";
import { ExternalLink, CheckCircle, Clock } from "lucide-react";
import { requirePortalRole } from "@/lib/portal-auth";
import { getStudentForPortal, parseSubjectParam } from "@/lib/student-portal";

export const dynamic = "force-dynamic";

export default async function StudentAssignmentsPage({
  searchParams,
}: {
  searchParams: { subject?: string };
}) {
  try {
    const session = await requirePortalRole("STUDENT");
    const student = await getStudentForPortal(session.user?.email ?? "");
    if (!student) return <StudentProfileMissing />;
    if (!student.classId) {
      return (
        <StudentClassMissing
          title="Assignments"
          description="View homework, submit your work, and check your grades."
        />
      );
    }

    const subjects = student.class?.subjects ?? [];
    const subjectId = parseSubjectParam(searchParams.subject);
    const selectedSubject = subjects.find((s) => s.id === subjectId);

    const assignments = await prisma.assignment.findMany({
      where: {
        classId: student.classId,
        ...(subjectId ? { subjectId } : {}),
      },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        submissions: { where: { studentId: student.id } },
      },
      orderBy: { dueDate: "asc" },
    });

    const counts = await prisma.assignment.groupBy({
      by: ["subjectId"],
      where: { classId: student.classId },
      _count: { _all: true },
    });
    const countMap = Object.fromEntries(
      counts.map((row) => [row.subjectId, row._count._all])
    );

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Student portal"
          title="Assignments"
          description={
            selectedSubject
              ? `Homework and tasks for ${selectedSubject.name}.`
              : "View homework, submit your work, and check your grades."
          }
        />

        <div className="portal-subject-layout">
          <aside className="portal-panel portal-subject-layout__sidebar">
            <SubjectFilterNav
              subjects={subjects}
              basePath="/portal/student/assignments"
              currentSubjectId={subjectId}
              counts={countMap}
            />
          </aside>

          <div className="portal-subject-layout__main space-y-4">
            {assignments.length === 0 ? (
              <div className="portal-empty-state portal-empty-state--inline">
                <h3 className="text-lg font-bold text-white mb-2">No assignments</h3>
                <p className="text-white/45 text-sm">
                  {selectedSubject
                    ? `No assignments for ${selectedSubject.name} right now.`
                    : "You're all caught up for now."}
                </p>
              </div>
            ) : (
              assignments.map((assignment) => {
                const submission = assignment.submissions[0];
                const isSubmitted = !!submission;
                const isOverdue = new Date() > new Date(assignment.dueDate) && !isSubmitted;

                return (
                  <article key={assignment.id} className="portal-assignment-card">
                    <div className="portal-assignment-card__main">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="badge badge-orange text-xs">{assignment.subject.name}</span>
                        <span
                          className={`portal-assignment-card__status ${
                            isSubmitted
                              ? "portal-assignment-card__status--done"
                              : isOverdue
                                ? "portal-assignment-card__status--overdue"
                                : ""
                          }`}
                        >
                          {isSubmitted ? (
                            <CheckCircle className="w-3 h-3" aria-hidden />
                          ) : (
                            <Clock className="w-3 h-3" aria-hidden />
                          )}
                          {isSubmitted
                            ? "Submitted"
                            : `Due ${assignment.dueDate.toLocaleDateString()}`}
                        </span>
                      </div>

                      <h3 className="portal-assignment-card__title">{assignment.title}</h3>
                      {assignment.description && (
                        <p className="portal-assignment-card__desc">{assignment.description}</p>
                      )}

                      <div className="portal-assignment-card__meta">
                        <span>Assigned by {assignment.teacher.user.name}</span>
                        {assignment.fileUrl && (
                          <a
                            href={assignment.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#F78C1F] hover:underline inline-flex items-center gap-1"
                          >
                            Resource <ExternalLink className="w-3 h-3" aria-hidden />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="portal-assignment-card__side">
                      {isSubmitted ? (
                        <div className="space-y-2 w-full text-center">
                          <p className="text-xs text-[#0ABFBC]">
                            Submitted {submission.submittedAt.toLocaleDateString()}
                          </p>
                          {submission.grade ? (
                            <div className="portal-assignment-card__grade">
                              <div className="portal-assignment-card__grade-value">
                                {submission.marks}
                              </div>
                              <div className="text-xs text-white/40 uppercase">
                                Grade {submission.grade}
                              </div>
                              {submission.feedback && (
                                <p className="text-xs text-white/50 mt-2 italic">
                                  &quot;{submission.feedback}&quot;
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-[#F78C1F] p-3 rounded-lg bg-[#F78C1F]/10">
                              Waiting for teacher to grade
                            </p>
                          )}
                          {submission.fileUrl && (
                            <a
                              href={submission.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-[#F78C1F] hover:underline inline-block"
                            >
                              View my submission
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3 w-full">
                          {isOverdue && (
                            <p className="text-xs font-bold text-[#C0392B] text-center">Overdue</p>
                          )}
                          <SubmissionFormModal
                            assignmentId={assignment.id}
                            studentId={student.id}
                          />
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </PortalListPage>
    );
  } catch (error) {
    console.error("StudentAssignmentsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
