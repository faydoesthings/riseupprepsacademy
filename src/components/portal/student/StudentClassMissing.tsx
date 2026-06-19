import { School } from "lucide-react";
import PortalListPage from "@/components/portal/PortalListPage";
import PageHeader from "@/components/ui/PageHeader";

export default function StudentClassMissing({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <PortalListPage>
      <PageHeader
        eyebrow="Student portal"
        title={title}
        description={description ?? "You need a class assignment to access this page."}
      />
      <div className="portal-empty-state">
        <School className="w-12 h-12 text-[#F78C1F]/40 mx-auto mb-4" aria-hidden />
        <h3 className="text-lg font-bold text-white mb-2">Class not assigned</h3>
        <p className="text-white/45 text-sm max-w-sm mx-auto">
          You must be assigned to a class before you can view this page. Please contact the academy
          office.
        </p>
      </div>
    </PortalListPage>
  );
}
