import PageHeader from "@/components/ui/PageHeader";
import ListPageError from "@/components/ui/ListPageError";
import CertificatesPanel from "@/components/portal/lms/CertificatesPanel";
import { listCertificatesForAdmin } from "@/app/actions/lms/certificate-actions";
import { requirePortalRole } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function AdminCertificatesPage() {
  try {
    await requirePortalRole("SUPER_ADMIN");
    const result = await listCertificatesForAdmin();
    if (!result.success) return <ListPageError message={result.error} />;

    return (
      <div className="animate-fade-in-up lms-page">
        <PageHeader
          title="Certificates"
          description="View and manage issued course certificates."
          eyebrow="LMS"
        />
        <CertificatesPanel certificates={result.data} />
      </div>
    );
  } catch (error) {
    console.error("AdminCertificatesPage:", error);
    return <ListPageError />;
  }
}
