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
    <div className="portal-list-date-filter">
      <label className="portal-list-date-filter__label" htmlFor="portal-date-filter">
        Attendance date
      </label>
      <input
        id="portal-date-filter"
        type="date"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="form-input portal-list-date-filter__input"
        aria-label="Select attendance date"
      />
    </div>
  );
}
