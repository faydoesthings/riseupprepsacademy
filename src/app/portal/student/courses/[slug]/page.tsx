import Link from "next/link";
import ListPageError from "@/components/ui/ListPageError";
import { requirePortalRole } from "@/lib/portal-auth";
import { getStudentCourseDetail } from "@/lib/lms/student-course";
import { formatDifficulty, formatLessonType, formatQuizType } from "@/lib/lms/display";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronDown,
  Circle,
  HelpCircle,
  Lock,
  PlayCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentCourseOverviewPage({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const session = await requirePortalRole("STUDENT", "SUPER_ADMIN");
    const userId = session.user!.id!;

    const result = await getStudentCourseDetail(params.slug, userId);
    if (!result.success) {
      return <ListPageError message={result.error} />;
    }

    const course = result.data;
    if (!course.enrolled && !course.canAccessFull) {
      return (
        <ListPageError message="You are not enrolled in this course. Contact an administrator." />
      );
    }

    const { completion } = course;

    return (
      <div className="animate-fade-in-up lms-page space-y-6">
        <Link href="/portal/student/courses" className="lms-back-link">
          <ArrowLeft className="w-4 h-4" aria-hidden />
          My courses
        </Link>

        <section className="portal-panel">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#F78C1F] mb-2">
            {formatDifficulty(course.difficulty)}
          </p>
          <h1 className="lms-hero__title font-display">{course.title}</h1>
          <p className="lms-hero__meta mt-3 max-w-2xl">{course.description}</p>
          <div className="mt-6 max-w-md">
            <div className="lms-course-card__progress-label">
              <span>Your progress</span>
              <span>{course.progressPercent}%</span>
            </div>
            <div className="lms-course-card__progress-bar">
              <div
                className="lms-course-card__progress-fill"
                style={{ width: `${course.progressPercent}%` }}
              />
            </div>
          </div>
        </section>

        {completion.certificate && (
          <section className="portal-panel flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="lms-empty__icon !w-10 !h-10">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <p className="portal-panel__title !text-base">Certificate earned</p>
                <p className="portal-panel__desc">You completed this course.</p>
              </div>
            </div>
            <Link
              href={`/portal/student/courses/${course.slug}/certificate`}
              className="portal-btn portal-btn--primary"
            >
              View certificate
            </Link>
          </section>
        )}

        {course.requiresViva && completion.vivaEligible.eligible && !completion.certificate && (
          <section className="portal-panel flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="portal-panel__title !text-base">Ready for viva</p>
              <p className="portal-panel__desc">You&apos;re eligible for your oral examination.</p>
            </div>
            <Link href="/portal/student/viva" className="portal-btn portal-btn--primary">
              View viva schedule
            </Link>
          </section>
        )}

        <section>
          <header className="mb-4">
            <h2 className="portal-panel__title">Course curriculum</h2>
            <p className="portal-panel__desc">Work through each module at your own pace.</p>
          </header>

          {course.modules.map((mod, index) => (
            <details key={mod.id} className="lms-curriculum-module" open={index === 0}>
              <summary className="lms-curriculum-module__summary">
                <span className="lms-module__index">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="lms-module__title">{mod.title}</span>
                  {mod.description && (
                    <p className="lms-module__subtitle">{mod.description}</p>
                  )}
                </span>
                <ChevronDown className="lms-curriculum-module__chevron w-4 h-4" aria-hidden />
              </summary>

              {mod.lessons.map((lesson) => {
                const done = lesson.progress?.completed;
                const started = lesson.progress?.started;
                const StatusIcon = done ? CheckCircle2 : started ? PlayCircle : Circle;
                return (
                  <Link
                    key={lesson.id}
                    href={`/portal/student/courses/${course.slug}/lessons/${lesson.id}`}
                    className="lms-curriculum-item"
                  >
                    <StatusIcon
                      className={`lms-curriculum-item__status w-5 h-5 ${
                        done ? "text-[#0ABFBC]" : started ? "text-[#F78C1F]" : "text-white/28"
                      }`}
                      aria-hidden
                    />
                    <span className="lms-curriculum-item__title">{lesson.title}</span>
                    <span className="lms-curriculum-item__type">
                      {lesson.isPreview ? "Preview" : formatLessonType(lesson.type)}
                    </span>
                  </Link>
                );
              })}

              {mod.quizzes.map((quiz) =>
                quiz.eligibility.eligible ? (
                  <Link
                    key={quiz.id}
                    href={`/portal/student/courses/${course.slug}/quiz/${quiz.id}`}
                    className="lms-curriculum-item"
                  >
                    <HelpCircle className="lms-curriculum-item__status w-5 h-5 text-[#F78C1F]/70" aria-hidden />
                    <span className="lms-curriculum-item__title">{quiz.title}</span>
                    <span className="lms-curriculum-item__type">{formatQuizType(quiz.type)}</span>
                  </Link>
                ) : (
                  <div key={quiz.id} className="lms-curriculum-item opacity-60 cursor-not-allowed">
                    <Lock className="lms-curriculum-item__status w-5 h-5 text-white/28" aria-hidden />
                    <span className="lms-curriculum-item__title">{quiz.title}</span>
                    <span className="lms-curriculum-item__type text-[10px] max-w-[8rem] truncate">
                      {quiz.eligibility.reason}
                    </span>
                  </div>
                )
              )}
            </details>
          ))}

          {course.finalExams.map((quiz) =>
            quiz.eligibility.eligible ? (
              <Link
                key={quiz.id}
                href={`/portal/student/courses/${course.slug}/quiz/${quiz.id}`}
                className="lms-curriculum-item lms-curriculum-module mt-3 rounded-xl border border-[#F78C1F]/20"
              >
                <HelpCircle className="lms-curriculum-item__status w-5 h-5 text-[#F78C1F]" aria-hidden />
                <span className="lms-curriculum-item__title">{quiz.title}</span>
                <span className="lms-curriculum-item__type">Final exam</span>
              </Link>
            ) : (
              <div
                key={quiz.id}
                className="lms-curriculum-item lms-curriculum-module mt-3 rounded-xl opacity-60"
              >
                <Lock className="lms-curriculum-item__status w-5 h-5 text-white/28" aria-hidden />
                <span className="lms-curriculum-item__title">{quiz.title}</span>
                <span className="lms-curriculum-item__type text-[10px]">{quiz.eligibility.reason}</span>
              </div>
            )
          )}
        </section>
      </div>
    );
  } catch (error) {
    console.error("StudentCourseOverviewPage:", error);
    return <ListPageError />;
  }
}
