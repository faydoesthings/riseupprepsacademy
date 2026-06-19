import { requirePortalRole } from "@/lib/portal-auth";
import { getAccountantDashboardStats } from "@/lib/stats";
import AccountantDashboard from "@/components/portal/accountant/AccountantDashboard";
import ListPageError from "@/components/ui/ListPageError";

export const dynamic = "force-dynamic";

export default async function AccountantDashboardPage() {
  try {
    const session = await requirePortalRole("ACCOUNTANT", "SUPER_ADMIN");
    const stats = await getAccountantDashboardStats();
    const monthLabel = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const firstName = session.user?.name?.split(" ")[0] ?? "there";

    return (
      <AccountantDashboard firstName={firstName} monthLabel={monthLabel} stats={stats} />
    );
  } catch (error) {
    console.error("AccountantDashboardPage:", error);
    return <ListPageError />;
  }
}
