"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E1A] p-6">
      <div className="portal-error__card max-w-md w-full">
        <AlertCircle className="w-10 h-10 text-[#F78C1F] mx-auto mb-4" aria-hidden />
        <h1 className="portal-error__title">Something went wrong</h1>
        <p className="portal-error__text">
          The page hit an error. Try refreshing, or return to the home page.
        </p>
        <div className="portal-error__actions">
          <button type="button" onClick={() => reset()} className="portal-btn portal-btn--primary">
            <RefreshCw className="w-4 h-4" aria-hidden />
            Try again
          </button>
          <Link href="/" className="portal-btn portal-btn--ghost">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
