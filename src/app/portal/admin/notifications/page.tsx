import NotificationsPage from "@/components/portal/NotificationsPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <NotificationsPage
      roles={["SUPER_ADMIN"]}
      title="Notifications"
      description="System notifications for administrators."
    />
  );
}
