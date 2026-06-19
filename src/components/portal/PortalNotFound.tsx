import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function PortalNotFound({
  attemptedPath,
  backHref,
}: {
  attemptedPath: string;
  backHref: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in-up">
      <div className="w-20 h-20 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mb-6">
        <FileQuestion className="w-10 h-10 text-[#F78C1F]" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-sm text-white/40 max-w-md mb-2">
        There is no portal page at this address.
      </p>
      <p className="text-xs font-mono text-white/25 mb-8 break-all">{attemptedPath}</p>
      <Link href={backHref} className="btn btn-primary min-h-[44px]">
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>
    </div>
  );
}
