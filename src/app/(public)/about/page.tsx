import type { Metadata } from "next";
import AboutPage from "@/components/about/AboutPage";

export const metadata: Metadata = {
  title: "About Us — RiseUp Preps Academy",
  description:
    "Learn about RiseUp Preps Academy's mission to educate Sindh, our team, vision, and the story behind our academy in Sukkur/Rohri.",
};

export default function Page() {
  return <AboutPage />;
}
