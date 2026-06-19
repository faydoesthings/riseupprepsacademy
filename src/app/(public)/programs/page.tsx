import type { Metadata } from "next";
import ProgramsPage from "@/components/programs/ProgramsPage";

export const metadata: Metadata = {
  title: "Programs — RiseUp Preps Academy",
  description:
    "Mathematics, English, and digital & AI readiness for students across grades at RiseUp Preps Academy in Sukkur.",
};

export default function Page() {
  return <ProgramsPage />;
}
