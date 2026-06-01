"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1A2744",
            color: "#FFFFFF",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />
      {children}
    </SessionProvider>
  );
}
