import type { Metadata } from "next";
import ImpactPage from "@/components/impact/ImpactPage";
import { getEmptyImpactPageData, getImpactPageData } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Impact — RiseUp Preps Academy",
  description:
    "Transparent impact metrics — enrollment, attendance, exam results, and confirmed community giving at RiseUp Preps Academy in Sukkur.",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  let data = getEmptyImpactPageData();
  try {
    data = await getImpactPageData();
  } catch (error) {
    console.error("Impact page data unavailable:", error);
  }
  return <ImpactPage data={data} />;
}
