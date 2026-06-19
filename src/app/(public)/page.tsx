import HomePage from "@/components/home/HomePage";
import { getPublicStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function Page() {
  let stats;
  try {
    stats = await getPublicStats();
  } catch (error) {
    console.error("Homepage stats unavailable:", error);
  }
  return <HomePage stats={stats} />;
}
