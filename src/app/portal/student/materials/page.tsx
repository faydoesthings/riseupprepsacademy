import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import ListPageError from "@/components/ui/ListPageError";
import SubjectFilterNav from "@/components/portal/student/SubjectFilterNav";
import StudentClassMissing from "@/components/portal/student/StudentClassMissing";
import StudentProfileMissing from "@/components/portal/student/StudentProfileMissing";
import { requirePortalRole } from "@/lib/portal-auth";
import { getStudentForPortal, parseSubjectParam } from "@/lib/student-portal";
import { ExternalLink, FileText, Video, File } from "lucide-react";

export const dynamic = "force-dynamic";

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "VIDEO":
      return <Video className="w-5 h-5 text-[#0ABFBC]" aria-hidden />;
    case "PDF":
      return <FileText className="w-5 h-5 text-[#C0392B]" aria-hidden />;
    default:
      return <File className="w-5 h-5 text-[#F78C1F]" aria-hidden />;
  }
}

export default async function StudentMaterialsPage({
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
          title="Study material"
          description="Resources shared by your teachers."
        />
      );
    }

    const subjects = student.class?.subjects ?? [];
    const subjectId = parseSubjectParam(searchParams.subject);
    const selectedSubject = subjects.find((s) => s.id === subjectId);

    const materials = await prisma.material.findMany({
      where: {
        classId: student.classId,
        ...(subjectId ? { subjectId } : {}),
      },
      include: { subject: true },
      orderBy: { createdAt: "desc" },
    });

    const counts = await prisma.material.groupBy({
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
          title="Study material"
          description={
            selectedSubject
              ? `Resources for ${selectedSubject.name}.`
              : "Resources shared by your teachers, organized by subject."
          }
        />

        <div className="portal-subject-layout">
          <aside className="portal-panel portal-subject-layout__sidebar">
            <SubjectFilterNav
              subjects={subjects}
              basePath="/portal/student/materials"
              currentSubjectId={subjectId}
              counts={countMap}
            />
          </aside>

          <div className="portal-subject-layout__main">
            {materials.length === 0 ? (
              <div className="portal-empty-state portal-empty-state--inline">
                <FileText className="w-12 h-12 text-[#F78C1F]/40 mx-auto mb-4" aria-hidden />
                <h3 className="text-lg font-bold text-white mb-2">No materials yet</h3>
                <p className="text-white/45 text-sm max-w-sm mx-auto">
                  {selectedSubject
                    ? `No resources uploaded for ${selectedSubject.name} yet.`
                    : "Your teachers haven't uploaded resources for your class yet."}
                </p>
              </div>
            ) : (
              <div className="portal-material-grid">
                {materials.map((material) => (
                  <a
                    key={material.id}
                    href={material.url}
                    target="_blank"
                    rel="noreferrer"
                    className="portal-material-card"
                  >
                    <div className="portal-material-card__header">
                      <div className="portal-material-card__icon">
                        <TypeIcon type={material.type} />
                      </div>
                      <span className="portal-material-card__type">{material.type}</span>
                    </div>
                    <h3 className="portal-material-card__title">{material.title}</h3>
                    <p className="portal-material-card__subject">{material.subject.name}</p>
                    <div className="portal-material-card__footer">
                      <span>{material.chapter || "General"}</span>
                      <span className="portal-material-card__link">
                        Open <ExternalLink className="w-3 h-3" aria-hidden />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </PortalListPage>
    );
  } catch (error) {
    console.error("StudentMaterialsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
