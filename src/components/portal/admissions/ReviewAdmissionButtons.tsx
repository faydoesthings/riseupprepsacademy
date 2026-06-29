"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { reviewAdmissionApplication } from "@/app/actions/admission-actions";

export default function ReviewAdmissionButtons({
  applicationId,
  status,
}: {
  applicationId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"APPROVED" | "REJECTED" | null>(null);

  if (status !== "PENDING") return null;

  async function handleReview(next: "APPROVED" | "REJECTED") {
    const label = next === "APPROVED" ? "approve" : "reject";
    if (!window.confirm(`Are you sure you want to ${label} this application?`)) return;

    setLoading(next);
    const result = await reviewAdmissionApplication(applicationId, next);
    if (result.success) {
      toast.success(
        next === "APPROVED"
          ? "Application approved — student enrolled"
          : "Application rejected"
      );
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update application");
    }
    setLoading(null);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => handleReview("APPROVED")}
        disabled={!!loading}
        className="p-1.5 rounded-lg text-[#0ABFBC] hover:bg-[#0ABFBC]/10 disabled:opacity-50"
        title="Approve"
      >
        {loading === "APPROVED" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
      </button>
      <button
        type="button"
        onClick={() => handleReview("REJECTED")}
        disabled={!!loading}
        className="p-1.5 rounded-lg text-[#C0392B] hover:bg-[#C0392B]/10 disabled:opacity-50"
        title="Reject"
      >
        {loading === "REJECTED" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <X className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
