"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deletePeriod } from "@/app/actions/timetable-actions";

export default function DeletePeriodButton({ periodId }: { periodId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this scheduled period?")) return;

    setLoading(true);
    const result = await deletePeriod(periodId);
    setLoading(false);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to delete period");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
      title="Delete period"
      aria-label="Delete period"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}
