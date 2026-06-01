import HomePage from "@/components/home/HomePage";
import { getPublicStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function Page() {
  const stats = await getPublicStats();
  return <HomePage stats={stats} />;
}
