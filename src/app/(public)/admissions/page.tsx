import type { Metadata } from "next";
import AdmissionsPage from "@/components/admissions/AdmissionsPage";

export const metadata: Metadata = {
  title: "Admissions — RiseUp Preps Academy",
  description:
    "Apply to RiseUp Preps Academy in Sukkur. Open to students across grades — maths, English, and digital readiness with a caring admissions process.",
};

export default function Page() {
  return <AdmissionsPage />;
}
