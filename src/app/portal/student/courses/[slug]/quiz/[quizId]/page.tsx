import prisma from "@/lib/prisma";
import ListPageError from "@/components/ui/ListPageError";
import { requirePortalRole } from "@/lib/portal-auth";
import QuizRunner from "@/components/portal/lms/QuizRunner";

export const dynamic = "force-dynamic";

export default async function StudentQuizPage({
  params,
}: {
  params: { slug: string; quizId: string };
}) {
  try {
    const session = await requirePortalRole("STUDENT", "SUPER_ADMIN");
    const userId = session.user!.id!;

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.quizId },
      include: {
        _count: { select: { questions: true } },
        course: { select: { slug: true } },
        module: { select: { course: { select: { slug: true } } } },
      },
    });

    if (!quiz) return <ListPageError message="Quiz not found" />;

    const courseSlug = quiz.course?.slug ?? quiz.module?.course.slug;
    if (courseSlug !== params.slug) {
      return <ListPageError message="Quiz not found in this course" />;
    }

    const history = await prisma.quizAttempt.findMany({
      where: { quizId: params.quizId, userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        percentage: true,
        passed: true,
        submittedAt: true,
      },
    });

    return (
      <div className="animate-fade-in-up py-4">
        <QuizRunner
          courseSlug={params.slug}
          quizId={params.quizId}
          quizMeta={{
            title: quiz.title,
            type: quiz.type,
            timeLimit: quiz.timeLimit,
            passingScore: quiz.passingScore,
            maxAttempts: quiz.maxAttempts,
            questionCount: quiz._count.questions,
          }}
          history={history.map((h) => ({
            ...h,
            submittedAt: h.submittedAt?.toISOString() ?? null,
          }))}
        />
      </div>
    );
  } catch (error) {
    console.error("StudentQuizPage:", error);
    return <ListPageError />;
  }
}
