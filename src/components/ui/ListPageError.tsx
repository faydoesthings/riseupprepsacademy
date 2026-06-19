import { AlertCircle } from "lucide-react";

export default function ListPageError({
  message = "Something went wrong loading this data. Please refresh the page or try again later.",
}: {
  message?: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-10 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#C0392B]/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-[#C0392B]" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">Unable to load data</h2>
      <p className="text-sm text-white/40 max-w-md">{message}</p>
    </div>
  );
}
