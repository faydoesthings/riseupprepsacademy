import type { Metadata } from "next";
import LoginPage from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Sign in — RiseUp Preps Academy",
  description: "Sign in to the RiseUp Preps Academy portal.",
};

export default function Page() {
  return <LoginPage />;
}
