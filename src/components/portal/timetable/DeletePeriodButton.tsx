"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deletePeriod } from "@/app/actions/timetable-actions";

export default function DeletePeriodButton({ periodId }: { periodId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this scheduled period? This cannot be undone.")) return;
    setLoading(true);
    const result = await deletePeriod(periodId);
    if (result.success) {
      toast.success("Period removed");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete period");
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-white/30 hover:text-[#C0392B] hover:bg-[#C0392B]/10 rounded-md transition-colors disabled:opacity-50"
      title="Delete period"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
