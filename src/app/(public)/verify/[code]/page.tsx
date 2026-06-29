import Link from "next/link";
import { Award, CheckCircle2, XCircle } from "lucide-react";
import { verifyCertificate } from "@/app/actions/lms/certificate-actions";

export const dynamic = "force-dynamic";

export default async function VerifyCertificatePage({
  params,
}: {
  params: { code: string };
}) {
  const result = await verifyCertificate(params.code);

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-sm text-white/45 hover:text-[#F78C1F]">
            RiseUp Preps Academy
          </Link>
        </div>

        <div className="portal-panel text-center py-10">
          {result.success ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-[#0ABFBC] mx-auto mb-4" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-wider text-[#0ABFBC] mb-2">
                Verified certificate
              </p>
              <h1 className="text-2xl font-bold font-display mb-6">Certificate is authentic</h1>
              <div className="text-left space-y-4 max-w-sm mx-auto">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Student</p>
                  <p className="text-white font-medium">{result.data.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Course</p>
                  <p className="text-white font-medium">{result.data.courseTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Certificate number</p>
                  <p className="text-white font-mono text-sm">{result.data.certificateNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Issued</p>
                  <p className="text-white/70 text-sm">
                    {new Date(result.data.issuedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-12 h-12 text-red-400/80 mx-auto mb-4" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-wider text-red-400/80 mb-2">
                Verification failed
              </p>
              <h1 className="text-xl font-bold mb-2">Certificate not found</h1>
              <p className="text-sm text-white/45">{result.error}</p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-white/30 mt-6 flex items-center justify-center gap-1.5">
          <Award className="w-3.5 h-3.5" aria-hidden />
          RiseUp Preps Academy certificate verification
        </p>
      </div>
    </div>
  );
}
