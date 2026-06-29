"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserX, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import { setStudentStatus } from "@/app/actions/student-actions";

export default function StudentStatusButton({
  studentId,
  status,
  studentName,
}: {
  studentId: string;
  status: string;
  studentName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isActive = status === "ACTIVE";

  async function handleToggle() {
    const next = isActive ? "INACTIVE" : "ACTIVE";
    const verb = isActive ? "deactivate" : "reactivate";
    if (!window.confirm(`${verb.charAt(0).toUpperCase() + verb.slice(1)} ${studentName}?`)) return;

    setLoading(true);
    const result = await setStudentStatus(studentId, next);
    if (result.success) {
      toast.success(`Student ${isActive ? "deactivated" : "reactivated"}`);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update student");
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`p-1.5 rounded-lg disabled:opacity-50 ${
        isActive
          ? "text-[#C0392B] hover:bg-[#C0392B]/10"
          : "text-[#0ABFBC] hover:bg-[#0ABFBC]/10"
      }`}
      title={isActive ? "Deactivate student" : "Reactivate student"}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isActive ? (
        <UserX className="w-4 h-4" />
      ) : (
        <UserCheck className="w-4 h-4" />
      )}
    </button>
  );
}
