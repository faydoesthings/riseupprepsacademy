import prisma from "@/lib/prisma";
import ListPageError from "@/components/ui/ListPageError";
import { requirePortalRole } from "@/lib/portal-auth";
import CourseBuilder from "@/components/portal/lms/CourseBuilder";
import QuizEditor from "@/components/portal/lms/QuizEditor";

export const dynamic = "force-dynamic";

export default async function TeacherQuizEditorPage({
  params,
}: {
  params: { courseId: string; quizId: string };
}) {
  try {
    await requirePortalRole("TEACHER");

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: params.quizId,
        OR: [{ courseId: params.courseId }, { module: { courseId: params.courseId } }],
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
          basePath="/portal/teacher/courses"
        />
      </div>
    );
  } catch (error) {
    console.error("TeacherQuizEditorPage:", error);
    return <ListPageError />;
  }
}
