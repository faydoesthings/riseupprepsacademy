"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Bell,
  Loader2,
  X,
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  ClipboardCheck,
  Inbox,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/actions/notification-actions";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date | string;
  link: string | null;
};

const TYPE_CONFIG: Record<
  string,
  { icon: typeof Info; tone: string; label: string }
> = {
  INFO: { icon: Info, tone: "teal", label: "Info" },
  WARNING: { icon: AlertTriangle, tone: "orange", label: "Alert" },
  SUCCESS: { icon: CheckCircle2, tone: "green", label: "Success" },
  ERROR: { icon: AlertCircle, tone: "crimson", label: "Important" },
  FEE_REMINDER: { icon: DollarSign, tone: "gold", label: "Fees" },
  ATTENDANCE: { icon: ClipboardCheck, tone: "blue", label: "Attendance" },
};

function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function notificationsHref(role?: string): string | null {
  switch (role) {
    case "SUPER_ADMIN":
      return "/portal/admin/notifications";
    case "TEACHER":
      return "/portal/teacher/notifications";
    case "STUDENT":
      return "/portal/student/notifications";
    default:
      return null;
  }
}

export default function NotificationsBell() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const allHref = notificationsHref(role);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [panelStyle, setPanelStyle] = useState<{ top: number; right: number }>({
    top: 64,
    right: 16,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getNotificationsForUser();
    if (result.success) {
      setUnreadCount(result.unreadCount);
      setItems(result.notifications.map((n) => ({ ...n, createdAt: n.createdAt })));
    }
    setLoading(false);
  }, []);

  const updatePanelPosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const gap = 10;
    setPanelStyle({
      top: rect.bottom + gap,
      right: Math.max(12, window.innerWidth - rect.right),
    });
  }, []);

  useEffect(() => {
    setMounted(true);
    load();
  }, [load]);

  useEffect(() => {
    if (!open) return;
    updatePanelPosition();
    load();
    const onResize = () => updatePanelPosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, load, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  async function handleMarkRead(id: string) {
    const result = await markNotificationRead(id);
    if (result.success) {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  }

  async function handleMarkAll() {
    const result = await markAllNotificationsRead();
    if (result.success) {
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All caught up");
    }
  }

  const panel =
    open && mounted
      ? createPortal(
          <>
            <div className="notif-bell-backdrop" aria-hidden />
            <div
              ref={panelRef}
              className="notif-bell-panel"
              style={{ top: panelStyle.top, right: panelStyle.right }}
              role="dialog"
              aria-label="Notifications"
            >
              <header className="notif-bell-panel__header">
                <div className="notif-bell-panel__title-row">
                  <div>
                    <p className="notif-bell-panel__title">Notifications</p>
                    {unreadCount > 0 && (
                      <p className="notif-bell-panel__subtitle">
                        {unreadCount} unread
                      </p>
                    )}
                  </div>
                  <div className="notif-bell-panel__header-actions">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAll}
                        className="notif-bell-panel__mark-all"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="notif-bell-panel__close"
                      aria-label="Close notifications"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </header>

              <div className="notif-bell-panel__body">
                {loading ? (
                  <div className="notif-bell-panel__loading">
                    <Loader2 className="w-6 h-6 animate-spin" aria-hidden />
                    <span>Loading updates…</span>
                  </div>
                ) : items.length === 0 ? (
                  <div className="notif-bell-panel__empty">
                    <div className="notif-bell-panel__empty-icon" aria-hidden>
                      <Inbox className="w-7 h-7" />
                    </div>
                    <p className="notif-bell-panel__empty-title">All caught up</p>
                    <p className="notif-bell-panel__empty-text">
                      New academy updates will show up here.
                    </p>
                  </div>
                ) : (
                  <ul className="notif-bell-panel__list">
                    {items.map((n) => {
                      const config = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.INFO;
                      const Icon = config.icon;
                      return (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => !n.isRead && handleMarkRead(n.id)}
                            className={`notif-bell-item ${!n.isRead ? "notif-bell-item--unread" : ""}`}
                          >
                            <span
                              className={`notif-bell-item__icon notif-bell-item__icon--${config.tone}`}
                              aria-hidden
                            >
                              <Icon className="w-4 h-4" />
                            </span>
                            <span className="notif-bell-item__content">
                              <span className="notif-bell-item__meta">
                                <span className="notif-bell-item__type">{config.label}</span>
                                <time dateTime={new Date(n.createdAt).toISOString()}>
                                  {formatRelativeTime(n.createdAt)}
                                </time>
                              </span>
                              <span className="notif-bell-item__title">{n.title}</span>
                              <span className="notif-bell-item__message">{n.message}</span>
                            </span>
                            {!n.isRead && (
                              <span className="notif-bell-item__dot" aria-label="Unread" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {allHref && items.length > 0 && (
                <footer className="notif-bell-panel__footer">
                  <Link
                    href={allHref}
                    onClick={() => setOpen(false)}
                    className="notif-bell-panel__view-all"
                  >
                    View all notifications
                    <ChevronRight className="w-4 h-4" aria-hidden />
                  </Link>
                </footer>
              )}
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`notif-bell-trigger ${open ? "notif-bell-trigger--open" : ""}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="notif-bell-trigger__badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {panel}
    </>
  );
}
