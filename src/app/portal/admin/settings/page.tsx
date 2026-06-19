import PortalSettingsPage from "@/components/portal/PortalSettingsPage";
import { requirePortalRole } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requirePortalRole("SUPER_ADMIN");
  return <PortalSettingsPage backLabel="Administrator" eyebrow="Admin portal" />;
}
