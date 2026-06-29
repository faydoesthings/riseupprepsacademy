"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { selfEnrollInCourse } from "@/app/actions/lms/enrollment-actions";
import { formatDifficulty } from "@/lib/lms/display";
import { BookOpen, Lock } from "lucide-react";

type CatalogCourse = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: string | null;
  thumbnail: string | null;
  estimatedDuration: number | null;
  requiresPayment: boolean;
  pricePKR: number | null;
  enrolled: boolean;
  enrollmentStatus: string | null;
  prerequisitesMet: boolean;
  missingPrerequisites: string[];
  _count: { modules: number };
};

export default function CourseCatalogGrid({
  courses,
  studentPortal = false,
}: {
  courses: CatalogCourse[];
  studentPortal?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function handleEnroll(slug: string) {
    setMessage("");
    startTransition(async () => {
      const res = await selfEnrollInCourse(slug);
      if (!res.success) setMessage(res.error ?? "Enrollment failed");
      else {
        router.push(`/portal/student/courses/${slug}`);
        router.refresh();
      }
    });
  }

  if (courses.length === 0) {
    return (
      <div className="portal-panel">
        <div className="lms-empty">
          <div className="lms-empty__icon">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="lms-empty__title">No courses available</p>
          <p className="lms-empty__text">Check back soon for new learning tracks.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {message && <div className="alert-error mb-4 text-sm">{message}</div>}
      <div className="lms-course-grid">
        {courses.map((course) => {
          const hours = course.estimatedDuration
            ? Math.round(course.estimatedDuration / 60)
            : null;
          const canEnroll =
            studentPortal &&
            !course.enrolled &&
            course.prerequisitesMet &&
            !course.requiresPayment;

          return (
            <article key={course.id} className="lms-course-card">
              <div className="lms-course-card__media">
                {course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/[0.04]">
                    <BookOpen className="w-8 h-8 text-white/20" />
                  </div>
                )}
              </div>
              <div className="lms-course-card__body">
                <div className="flex flex-wrap gap-2 mb-2">
                  {course.difficulty && (
                    <span className="badge badge-info">{formatDifficulty(course.difficulty)}</span>
                  )}
                  {course.requiresPayment && (
                    <span className="badge badge-warning">
                      {course.pricePKR ? `PKR ${course.pricePKR.toLocaleString()}` : "Paid"}
                    </span>
                  )}
                  {course.enrolled && <span className="badge badge-success">Enrolled</span>}
                </div>
                <h2 className="lms-course-card__title">{course.title}</h2>
                <p className="lms-course-card__desc line-clamp-3">{course.description}</p>
                <p className="lms-course-card__meta">
                  {course._count.modules} modules
                  {hours ? ` · ~${hours}h` : ""}
                </p>
                {!course.prerequisitesMet && course.missingPrerequisites.length > 0 && (
                  <p className="text-xs text-amber-400/80 mt-2 flex items-start gap-1.5">
                    <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    Complete: {course.missingPrerequisites.join(", ")}
                  </p>
                )}
                <div className="lms-course-card__actions mt-4">
                  {course.enrolled ? (
                    <Link
                      href={`/portal/student/courses/${course.slug}`}
                      className="portal-btn portal-btn--primary w-full justify-center"
                    >
                      Continue learning
                    </Link>
                  ) : studentPortal && canEnroll ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleEnroll(course.slug)}
                      className="portal-btn portal-btn--primary w-full justify-center"
                    >
                      Enroll free
                    </button>
                  ) : studentPortal && course.requiresPayment ? (
                    <p className="text-xs text-white/50 text-center py-2">
                      Contact the academy for paid enrollment.
                    </p>
                  ) : (
                    <Link
                      href={studentPortal ? `/login` : `/courses#${course.slug}`}
                      className="portal-btn portal-btn--ghost w-full justify-center"
                    >
                      {studentPortal ? "Sign in to enroll" : "Learn more"}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
