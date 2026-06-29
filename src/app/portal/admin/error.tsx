"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { getDbErrorCopy } from "@/lib/db-environment";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin portal error:", error);
  }, [error]);

  const isDb =
    error.message.includes("database server") ||
    error.message.includes("Can't reach database") ||
    error.message.includes("P1001");

  return (
    <div className="portal-error">
      <div className="portal-error__card">
        <AlertCircle className="w-10 h-10 text-[#F78C1F] mb-4" aria-hidden />
        <h1 className="portal-error__title">Something went wrong</h1>
        <p className="portal-error__text">
          {isDb ? getDbErrorCopy() : "The admin dashboard could not load. Try again or return to the home page."}
        </p>
        <div className="portal-error__actions">
          <button type="button" onClick={() => reset()} className="portal-btn portal-btn--primary">
            <RefreshCw className="w-4 h-4" aria-hidden />
            Try again
          </button>
          <Link href="/" className="portal-btn portal-btn--ghost">
            Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
