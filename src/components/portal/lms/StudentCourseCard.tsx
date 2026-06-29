import Link from "next/link";
import { BookOpen } from "lucide-react";
import { formatDifficulty } from "@/lib/lms/display";

type CourseCardProps = {
  slug: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  difficulty: string | null;
  progressPercent: number;
  status: string;
};

export default function StudentCourseCard({
  slug,
  title,
  description,
  thumbnail,
  difficulty,
  progressPercent,
  status,
}: CourseCardProps) {
  return (
    <article className="lms-course-card">
      <div className="lms-course-card__media">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt="" />
        ) : (
          <div className="lms-course-card__media-fallback">
            <BookOpen className="w-8 h-8 opacity-30" aria-hidden />
          </div>
        )}
      </div>
      <div className="lms-course-card__body">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[#F78C1F] mb-1">
            {formatDifficulty(difficulty)}
          </p>
          <h2 className="lms-course-card__title">{title}</h2>
          <p className="lms-course-card__desc mt-1.5">{description ?? "Self-paced course content"}</p>
        </div>
        <div>
          <div className="lms-course-card__progress-label">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="lms-course-card__progress-bar">
            <div className="lms-course-card__progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className="lms-course-card__footer">
          {status === "COMPLETED" ? (
            <span className="badge badge-success">Completed</span>
          ) : (
            <span className="badge badge-info">In progress</span>
          )}
          <Link href={`/portal/student/courses/${slug}`} className="portal-btn portal-btn--primary portal-btn--sm">
            {progressPercent > 0 ? "Continue" : "Start course"}
          </Link>
        </div>
      </div>
    </article>
  );
}
