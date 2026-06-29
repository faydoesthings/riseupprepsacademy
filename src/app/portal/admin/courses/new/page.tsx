import { requirePortalRole } from "@/lib/portal-auth";
import NewCourseForm from "@/components/portal/lms/NewCourseForm";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  await requirePortalRole("SUPER_ADMIN");
  return (
    <div className="animate-fade-in-up">
      <NewCourseForm />
    </div>
  );
}
