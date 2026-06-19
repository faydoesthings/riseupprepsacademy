"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0A0E1A", color: "#fff" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ maxWidth: "24rem", textAlign: "center" }}>
            <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Application error</h1>
            <p style={{ fontSize: "0.875rem", opacity: 0.6, marginBottom: "1.5rem", lineHeight: 1.5 }}>
              RiseUp Preps Academy could not load. Refresh the page or restart the dev server.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "0.625rem 1.25rem",
                borderRadius: "0.75rem",
                border: "none",
                background: "#F78C1F",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
