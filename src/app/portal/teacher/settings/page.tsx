import PortalSettingsPage from "@/components/portal/PortalSettingsPage";
import { requirePortalRole } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function TeacherSettingsPage() {
  await requirePortalRole("TEACHER");
  return <PortalSettingsPage backLabel="Teacher" eyebrow="Teacher portal" />;
}
