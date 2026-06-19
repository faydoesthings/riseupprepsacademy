import NotificationsPage from "@/components/portal/NotificationsPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <NotificationsPage
      roles={["TEACHER"]}
      eyebrow="Teacher portal"
      title="Announcements"
      description="Academy announcements and alerts for faculty."
    />
  );
}
