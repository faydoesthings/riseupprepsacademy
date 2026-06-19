"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
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

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);

  async function load() {
    setLoading(true);
    const result = await getNotificationsForUser();
    if (result.success) {
      setUnreadCount(result.unreadCount);
      setItems(
        result.notifications.map((n) => ({
          ...n,
          createdAt: n.createdAt,
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  useEffect(() => {
    load();
  }, []);

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
      toast.success("All notifications marked as read");
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative bg-transparent hover:bg-white/[0.06] text-white/40 hover:text-white rounded-xl p-2 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C0392B] ring-2 ring-[#070B14]" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,360px)] z-40 glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-sm font-semibold text-white">Notifications</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  className="text-xs text-[#F78C1F] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white/30" />
                </div>
              ) : items.length === 0 ? (
                <p className="portal-panel-empty px-4 py-6">
                  No notifications yet. Updates from the academy will appear here.
                </p>
              ) : (
                <ul className="divide-y divide-white/5">
                  {items.map((n) => (
                    <li
                      key={n.id}
                      className={`px-4 py-3 ${!n.isRead ? "bg-[#F78C1F]/5" : ""}`}
                    >
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{n.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-white/25 font-mono">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(n.id)}
                            className="text-[10px] text-[#0ABFBC] hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
