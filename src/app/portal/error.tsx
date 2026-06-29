"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { getDbErrorCopy } from "@/lib/db-environment";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Portal error:", error);
  }, [error]);

  const isDb =
    error.message.includes("database server") ||
    error.message.includes("Can't reach database") ||
    error.message.includes("P1001");

  return (
    <div className="portal-error">
      <div className="portal-error__card">
        <AlertCircle className="w-10 h-10 text-[#F78C1F] mb-4 mx-auto" aria-hidden />
        <h1 className="portal-error__title">Portal unavailable</h1>
        <p className="portal-error__text">
          {isDb ? getDbErrorCopy() : "This portal page could not load. Please try again."}
        </p>
        <div className="portal-error__actions">
          <button type="button" onClick={() => reset()} className="portal-btn portal-btn--primary">
            <RefreshCw className="w-4 h-4" aria-hidden />
            Try again
          </button>
          <Link href="/login" className="portal-btn portal-btn--ghost">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
