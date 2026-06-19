"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuthAction } from "@/lib/auth-utils";

export async function getNotificationsForUser() {
  const authResult = await requireAuthAction();
  if (!authResult.ok) {
    return { success: false as const, error: authResult.error };
  }

  const userId = authResult.session.user?.id;
  if (!userId) {
    return { success: false as const, error: "Invalid session" };
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { success: true as const, notifications, unreadCount };
}

export async function markNotificationRead(notificationId: string) {
  const authResult = await requireAuthAction();
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  const userId = authResult.session.user?.id;
  if (!userId) return { success: false, error: "Invalid session" };

  try {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
    revalidatePath("/portal");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update notification",
    };
  }
}

export async function markAllNotificationsRead() {
  const authResult = await requireAuthAction();
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  const userId = authResult.session.user?.id;
  if (!userId) return { success: false, error: "Invalid session" };

  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/portal");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update notifications",
    };
  }
}
