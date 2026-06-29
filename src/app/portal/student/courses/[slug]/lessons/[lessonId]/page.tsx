import ListPageError from "@/components/ui/ListPageError";
import { requirePortalRole } from "@/lib/portal-auth";
import { getLessonForPlayer } from "@/app/actions/lms/lesson-actions";
import LessonPlayer from "@/components/portal/lms/LessonPlayer";

export const dynamic = "force-dynamic";

export default async function StudentLessonPage({
  params,
}: {
  params: { slug: string; lessonId: string };
}) {
  try {
    const session = await requirePortalRole("STUDENT", "SUPER_ADMIN");
    const userId = session.user!.id!;

    const result = await getLessonForPlayer(params.lessonId, userId);
    if (!result.success) {
      return <ListPageError message={result.error} />;
    }

    const { lesson, progress, course, moduleLessons } = result.data;

    if (course.slug !== params.slug) {
      return <ListPageError message="Lesson not found in this course" />;
    }

    return (
      <div className="animate-fade-in-up">
        <LessonPlayer
          courseSlug={course.slug}
          courseTitle={course.title}
          moduleTitle={lesson.module.title}
          lesson={{
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            content: lesson.content,
            duration: lesson.duration,
          }}
          moduleLessons={moduleLessons}
          initialProgress={
            progress ? { completed: progress.completed, percentage: progress.percentage } : null
          }
        />
      </div>
    );
  } catch (error) {
    console.error("StudentLessonPage:", error);
    return <ListPageError />;
  }
}
