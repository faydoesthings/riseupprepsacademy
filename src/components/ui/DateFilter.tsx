"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function DateFilter({
  paramName = "date",
  defaultValue,
}: {
  paramName?: string;
  defaultValue: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = searchParams.get(paramName) || defaultValue;

  function handleChange(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextValue) {
      params.set(paramName, nextValue);
    } else {
      params.delete(paramName);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="glass-card px-4 py-2 flex flex-col sm:flex-row sm:items-center gap-2 shrink-0 rounded-xl">
      <label className="form-label-caps mb-0">Select date</label>
      <input
        type="date"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="form-input py-2 text-sm min-h-[44px] max-w-[200px]"
        aria-label="Filter by date"
      />
    </div>
  );
}
