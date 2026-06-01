export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020D1A]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#F78C1F]/30 border-t-[#F78C1F] animate-spin" />
        <p className="text-sm text-white/30 font-medium">Loading...</p>
      </div>
    </div>
  );
}
