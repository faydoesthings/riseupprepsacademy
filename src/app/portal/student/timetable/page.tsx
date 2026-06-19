import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import TimetableView from "@/components/portal/TimetableView";
import ListPageError from "@/components/ui/ListPageError";
import StudentClassMissing from "@/components/portal/student/StudentClassMissing";
import StudentProfileMissing from "@/components/portal/student/StudentProfileMissing";
import { requirePortalRole } from "@/lib/portal-auth";
import { getStudentForPortal } from "@/lib/student-portal";

export const dynamic = "force-dynamic";

export default async function StudentTimetablePage() {
  try {
    const session = await requirePortalRole("STUDENT");
    const student = await getStudentForPortal(session.user?.email ?? "");
    if (!student) return <StudentProfileMissing />;
    if (!student.classId) {
      return (
        <StudentClassMissing title="Timetable" description="Your weekly class schedule." />
      );
    }

    const periods = await prisma.period.findMany({
      where: { classId: student.classId },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        class: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Student portal"
          title="Timetable"
          description="Your weekly class schedule."
        />
        <TimetableView periods={periods} />
      </PortalListPage>
    );
  } catch (error) {
    console.error("StudentTimetablePage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
