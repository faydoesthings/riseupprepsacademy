"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { markAllNotificationsRead } from "@/app/actions/notification-actions";

export default function MarkAllReadButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await markAllNotificationsRead();
    if (result.success) {
      toast.success("All notifications marked as read");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update");
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="portal-btn portal-btn--ghost min-h-[44px] disabled:opacity-70"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark all as read"}
    </button>
  );
}
