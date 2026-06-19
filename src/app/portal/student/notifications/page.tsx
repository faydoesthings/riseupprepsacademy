import NotificationsPage from "@/components/portal/NotificationsPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <NotificationsPage
      roles={["STUDENT"]}
      eyebrow="Student portal"
      title="Notifications"
      description="Announcements and updates for students."
    />
  );
}
