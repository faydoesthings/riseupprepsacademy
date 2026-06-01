import Link from "next/link";
import { Construction, ArrowLeft, Sparkles } from "lucide-react";

export default function ComingSoon({
  moduleName,
  backHref,
}: {
  moduleName: string;
  backHref: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in-up px-4">
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#05335C] to-[#0A4A82] flex items-center justify-center shadow-2xl">
          <Construction className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-[#F78C1F] to-[#F9A54E] flex items-center justify-center border-4 border-[#F8FAFC] shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-[#05335C] mb-3">{moduleName}</h1>
      <p className="text-lg text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
        This section is coming soon. Your dashboard and core tools are ready — we&apos;re expanding
        the platform module by module.
      </p>

      <Link href={backHref} className="btn btn-navy">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
