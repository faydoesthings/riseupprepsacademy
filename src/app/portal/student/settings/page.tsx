import PortalSettingsPage from "@/components/portal/PortalSettingsPage";
import { requirePortalRole } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function StudentSettingsPage() {
  await requirePortalRole("STUDENT");
  return <PortalSettingsPage backLabel="Student" eyebrow="Student portal" />;
}
