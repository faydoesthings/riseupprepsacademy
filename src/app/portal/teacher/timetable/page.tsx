import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import TimetableView from "@/components/portal/TimetableView";
import ListPageError from "@/components/ui/ListPageError";
import TeacherProfileMissing from "@/components/portal/TeacherProfileMissing";
import { requirePortalRole } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function TeacherTimetablePage() {
  try {
    const session = await requirePortalRole("TEACHER");
    const teacher = await prisma.teacher.findFirst({
      where: { user: { email: session.user?.email ?? "" } },
    });
    if (!teacher) return <TeacherProfileMissing />;

    const periods = await prisma.period.findMany({
      where: { teacherId: teacher.id },
      include: { subject: true, class: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Teacher portal"
          title="Timetable"
          description="Your weekly teaching schedule across all assigned classes."
        />
        <TimetableView periods={periods} />
      </PortalListPage>
    );
  } catch (error) {
    console.error("TeacherTimetablePage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
