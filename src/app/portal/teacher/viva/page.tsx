import PageHeader from "@/components/ui/PageHeader";
import ListPageError from "@/components/ui/ListPageError";
import VivaSessionsPanel from "@/components/portal/lms/VivaSessionsPanel";
import { requirePortalRole } from "@/lib/portal-auth";
import { listVivaSessions } from "@/app/actions/lms/viva-actions";

export const dynamic = "force-dynamic";

export default async function TeacherVivaPage() {
  try {
    const session = await requirePortalRole("TEACHER");
    const userId = session.user!.id!;

    const sessionsRes = await listVivaSessions("teacher", userId);
    if (!sessionsRes.success) return <ListPageError message={sessionsRes.error} />;

    return (
      <div className="animate-fade-in-up lms-page">
        <PageHeader
          title="Viva sessions"
          description="Conduct oral exams and submit results for your assigned students."
          eyebrow="Teacher portal"
        />
        <VivaSessionsPanel sessions={sessionsRes.data} role="teacher" />
      </div>
    );
  } catch (error) {
    console.error("TeacherVivaPage:", error);
    return <ListPageError />;
  }
}
