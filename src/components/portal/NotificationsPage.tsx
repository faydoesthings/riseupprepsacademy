import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import ListPageError from "@/components/ui/ListPageError";
import { requirePortalRole } from "@/lib/portal-auth";
import type { UserRole } from "@/lib/roles";
import MarkAllReadButton from "@/components/portal/MarkAllReadButton";
import { Bell } from "lucide-react";

export default async function NotificationsPage({
  roles,
  title,
  description,
  eyebrow = "Admin portal",
}: {
  roles: UserRole[];
  title?: string;
  description?: string;
  eyebrow?: string;
}) {
  try {
    const session = await requirePortalRole(...roles);
    const userId = session.user?.id;
    if (!userId) throw new Error("Invalid session");

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const hasUnread = notifications.some((n) => !n.isRead);

    return (
      <PortalListPage>
        <PageHeader
          eyebrow={eyebrow}
          title={title ?? "Notifications"}
          description={description ?? "Updates and alerts from the academy."}
          customAction={hasUnread ? <MarkAllReadButton /> : undefined}
        />

        {notifications.length === 0 ? (
          <div className="portal-empty-state">
            <Bell className="w-12 h-12 text-[#F78C1F]/40 mx-auto mb-4" aria-hidden />
            <h3 className="text-lg font-bold text-white mb-2">No notifications</h3>
            <p className="text-white/45 text-sm max-w-sm mx-auto">
              You&apos;re all caught up. New alerts will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <article
                key={n.id}
                className={`portal-notification ${!n.isRead ? "portal-notification--unread" : ""}`}
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{n.title}</p>
                    <p className="text-sm text-white/50 mt-1">{n.message}</p>
                  </div>
                  <time
                    dateTime={n.createdAt.toISOString()}
                    className="text-xs text-white/25 font-mono shrink-0"
                  >
                    {n.createdAt.toLocaleDateString()}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </PortalListPage>
    );
  } catch (error) {
    console.error("NotificationsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
