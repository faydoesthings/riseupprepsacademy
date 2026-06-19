import PortalSettingsPage from "@/components/portal/PortalSettingsPage";
import { requirePortalRole } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function AccountantSettingsPage() {
  await requirePortalRole("ACCOUNTANT");
  return <PortalSettingsPage backLabel="Accountant" eyebrow="Accountant portal" />;
}
