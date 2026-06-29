import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { listPublishedCoursesCatalog } from "@/app/actions/lms/enrollment-actions";
import { formatDifficulty } from "@/lib/lms/display";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Online Courses | RiseUp Preps Academy",
  description: "Self-paced digital literacy and skills courses from RiseUp Preps Academy.",
};

export default async function PublicCoursesPage() {
  const result = await listPublishedCoursesCatalog();
  const courses = result.success ? result.data : [];

  return (
    <main className="site-section">
      <div className="site-container max-w-6xl">
        <header className="text-center mb-12">
          <p className="site-eyebrow">Self-paced learning</p>
          <h1 className="site-heading font-display">Online courses</h1>
          <p className="site-lead max-w-2xl mx-auto">
            Build practical skills with structured modules, quizzes, and certificates — designed for students across Pakistan.
          </p>
        </header>

        {courses.length === 0 ? (
          <div className="site-card text-center py-16">
            <GraduationCap className="w-10 h-10 mx-auto text-[#F78C1F]/60 mb-4" />
            <p className="text-lg font-semibold text-[#0D1B2A]">Courses coming soon</p>
            <p className="text-[#0D1B2A]/60 mt-2">We&apos;re preparing new learning tracks. Check back shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const hours = course.estimatedDuration
                ? Math.round(course.estimatedDuration / 60)
                : null;
              return (
                <article key={course.id} id={course.slug} className="site-card flex flex-col">
                  <div className="aspect-video rounded-lg bg-[#0D1B2A]/5 mb-4 flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-[#0D1B2A]/15" />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {course.difficulty && (
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#4A9CC7]">
                        {formatDifficulty(course.difficulty)}
                      </span>
                    )}
                    {course.requiresPayment && course.pricePKR && (
                      <span className="text-xs font-semibold text-[#F78C1F]">
                        PKR {course.pricePKR.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-[#0D1B2A] mb-2">{course.title}</h2>
                  <p className="text-[#0D1B2A]/65 text-sm flex-1 line-clamp-4">{course.description}</p>
                  <p className="text-xs text-[#0D1B2A]/45 mt-3">
                    {course._count.modules} modules{hours ? ` · ~${hours} hours` : ""}
                  </p>
                  <div className="mt-5 flex gap-3">
                    <Link href="/login" className="btn btn-primary flex-1 text-center">
                      Enroll via portal
                    </Link>
                    <Link href="/admissions" className="btn btn-secondary flex-1 text-center">
                      Contact us
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
