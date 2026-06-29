import Link from "next/link";
import ListPageError from "@/components/ui/ListPageError";
import CertificateView from "@/components/portal/lms/CertificateView";
import { requirePortalRole } from "@/lib/portal-auth";
import { getCertificateForStudent } from "@/app/actions/lms/certificate-actions";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentCertificatePage({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const session = await requirePortalRole("STUDENT", "SUPER_ADMIN");
    const userId = session.user!.id!;

    const result = await getCertificateForStudent(params.slug, userId);
    if (!result.success) {
      return <ListPageError message={result.error} />;
    }

    const cert = result.data;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    return (
      <div className="animate-fade-in-up lms-page">
        <Link href={`/portal/student/courses/${params.slug}`} className="lms-back-link">
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Back to course
        </Link>

        <header className="mb-6">
          <h1 className="lms-hero__title font-display">Your certificate</h1>
          <p className="lms-hero__meta mt-2">Download or share your verification code.</p>
        </header>

        <CertificateView
          studentName={cert.user.name}
          courseTitle={cert.course.title}
          certificateNumber={cert.certificateNumber}
          verificationCode={cert.verificationCode}
          issuedAt={cert.issuedAt}
          appUrl={appUrl}
        />
      </div>
    );
  } catch (error) {
    console.error("StudentCertificatePage:", error);
    return <ListPageError />;
  }
}
