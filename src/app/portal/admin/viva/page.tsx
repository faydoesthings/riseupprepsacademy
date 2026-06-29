import PageHeader from "@/components/ui/PageHeader";
import ListPageError from "@/components/ui/ListPageError";
import VivaScheduleForm from "@/components/portal/lms/VivaScheduleForm";
import VivaSessionsPanel from "@/components/portal/lms/VivaSessionsPanel";
import { requirePortalRole } from "@/lib/portal-auth";
import { listVivaSessions, listTeachersForViva } from "@/app/actions/lms/viva-actions";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminVivaPage() {
  try {
    const session = await requirePortalRole("SUPER_ADMIN");
    const userId = session.user!.id!;

    const [sessionsRes, teachersRes, courses] = await Promise.all([
      listVivaSessions("admin", userId),
      listTeachersForViva(),
      prisma.course.findMany({
        where: { requiresViva: true },
        select: { id: true, title: true },
        orderBy: { title: "asc" },
      }),
    ]);

    if (!sessionsRes.success) return <ListPageError message={sessionsRes.error} />;

    return (
      <div className="animate-fade-in-up lms-page">
        <PageHeader
          title="Viva sessions"
          description="Schedule and manage oral examinations for certificate courses."
        />

        <VivaScheduleForm
          courses={courses}
          teachers={teachersRes.success ? teachersRes.data : []}
        />

        <header className="mb-4">
          <h2 className="portal-panel__title">All sessions</h2>
        </header>
        <VivaSessionsPanel sessions={sessionsRes.data} role="admin" />
      </div>
    );
  } catch (error) {
    console.error("AdminVivaPage:", error);
    return <ListPageError />;
  }
}
