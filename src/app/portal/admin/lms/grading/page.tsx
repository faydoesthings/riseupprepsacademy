import PageHeader from "@/components/ui/PageHeader";
import ListPageError from "@/components/ui/ListPageError";
import QuizGradingPanel from "@/components/portal/lms/QuizGradingPanel";
import { listPendingGradingAttempts } from "@/app/actions/lms/quiz-actions";
import { requirePortalRole } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function LmsGradingPage() {
  try {
    await requirePortalRole("SUPER_ADMIN", "TEACHER");
    const result = await listPendingGradingAttempts();
    if (!result.success) return <ListPageError message={result.error} />;

    return (
      <div className="animate-fade-in-up lms-page">
        <PageHeader
          title="Quiz grading"
          description="Review and score short-answer submissions."
          eyebrow="LMS"
        />
        <QuizGradingPanel attempts={result.data} />
      </div>
    );
  } catch (error) {
    console.error("LmsGradingPage:", error);
    return <ListPageError />;
  }
}
