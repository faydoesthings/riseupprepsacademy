import PortalSettingsPage from "@/components/portal/PortalSettingsPage";
import { requirePortalRole } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function DonorSettingsPage() {
  await requirePortalRole("DONOR");
  return <PortalSettingsPage backLabel="Donor" eyebrow="Donor portal" />;
}
