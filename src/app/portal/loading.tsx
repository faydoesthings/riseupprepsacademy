export default function PortalLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-64 bg-white/[0.06] rounded-xl" />
      <div className="h-4 w-96 max-w-full bg-white/[0.04] rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white/[0.04] rounded-2xl border border-white/[0.06]" />
        ))}
      </div>
      <div className="h-80 bg-white/[0.04] rounded-2xl border border-white/[0.06]" />
    </div>
  );
}
