import type { Metadata } from "next";
import RegisterPage from "@/components/auth/RegisterPage";

export const metadata: Metadata = {
  title: "Request Portal Access — RiseUp Preps Academy",
  description:
    "Apply for a RiseUp Preps Academy portal account. Students, teachers, and donors can request access for admin approval.",
};

export default function Page() {
  return <RegisterPage />;
}
