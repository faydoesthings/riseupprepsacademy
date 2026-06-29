import PageHeader from "@/components/ui/PageHeader";
import ListPageError from "@/components/ui/ListPageError";
import VivaSessionsPanel from "@/components/portal/lms/VivaSessionsPanel";
import { requirePortalRole } from "@/lib/portal-auth";
import { listVivaSessions } from "@/app/actions/lms/viva-actions";

export const dynamic = "force-dynamic";

export default async function StudentVivaPage() {
  try {
    const session = await requirePortalRole("STUDENT");
    const userId = session.user!.id!;

    const sessionsRes = await listVivaSessions("student", userId);
    if (!sessionsRes.success) return <ListPageError message={sessionsRes.error} />;

    return (
      <div className="animate-fade-in-up lms-page">
        <PageHeader
          title="Viva sessions"
          description="Your scheduled oral examinations and results."
          eyebrow="Student portal"
        />
        <VivaSessionsPanel sessions={sessionsRes.data} role="student" />
      </div>
    );
  } catch (error) {
    console.error("StudentVivaPage:", error);
    return <ListPageError />;
  }
}
