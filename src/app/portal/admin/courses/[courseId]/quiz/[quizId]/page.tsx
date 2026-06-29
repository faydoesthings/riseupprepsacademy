import prisma from "@/lib/prisma";
import ListPageError from "@/components/ui/ListPageError";
import { requirePortalRole } from "@/lib/portal-auth";
import QuizEditor from "@/components/portal/lms/QuizEditor";

export const dynamic = "force-dynamic";

export default async function AdminQuizEditorPage({
  params,
}: {
  params: { courseId: string; quizId: string };
}) {
  try {
    await requirePortalRole("SUPER_ADMIN", "TEACHER");

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: params.quizId,
        OR: [
          { courseId: params.courseId },
          { module: { courseId: params.courseId } },
        ],
      },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    if (!quiz) return <ListPageError message="Quiz not found" />;

    return (
      <div className="animate-fade-in-up">
        <QuizEditor
          courseId={params.courseId}
          quiz={{
            ...quiz,
            questions: quiz.questions.map((q) => ({
              ...q,
              options: q.options as { id: string; text: string }[] | null,
            })),
          }}
        />
      </div>
    );
  } catch (error) {
    console.error("AdminQuizEditorPage:", error);
    return <ListPageError />;
  }
}
