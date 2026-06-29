import PageHeader from "@/components/ui/PageHeader";
import CourseCatalogGrid from "@/components/portal/lms/CourseCatalogGrid";
import { requirePortalRole } from "@/lib/portal-auth";
import { getStudentCatalogCourses } from "@/app/actions/lms/enrollment-actions";
import ListPageError from "@/components/ui/ListPageError";

export const dynamic = "force-dynamic";

export default async function StudentBrowseCoursesPage() {
  try {
    const session = await requirePortalRole("STUDENT");
    const result = await getStudentCatalogCourses(session.user!.id!);
    if (!result.success) return <ListPageError message={result.error} />;

    return (
      <div className="animate-fade-in-up lms-page">
        <PageHeader
          title="Browse courses"
          description="Explore published courses and enroll in free tracks."
          eyebrow="Student portal"
        />
        <CourseCatalogGrid courses={result.data} studentPortal />
      </div>
    );
  } catch (error) {
    console.error("StudentBrowseCoursesPage:", error);
    return <ListPageError />;
  }
}
