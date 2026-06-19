import type { Metadata } from "next";
import ContactPage from "@/components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact — RiseUp Preps Academy",
  description:
    "Contact RiseUp Preps Academy in Sukkur for admissions, campus visits, donations, and general inquiries.",
};

export default function Page() {
  return <ContactPage />;
}
