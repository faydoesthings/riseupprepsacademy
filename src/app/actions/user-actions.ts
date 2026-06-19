"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireAuthAction, validatePassword } from "@/lib/auth-utils";
import { deleteAvatarFile, saveAvatarFile } from "@/lib/avatar-upload";

export async function updateProfileImage(formData: FormData) {
  const authResult = await requireAuthAction();
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  const userId = authResult.session.user?.id;
  if (!userId) {
    return { success: false, error: "Session is invalid. Please sign in again." };
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return { success: false, error: "Choose an image to upload." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "User account not found" };
    }

    const saved = await saveAvatarFile(userId, file);
    if ("error" in saved) {
      return { success: false, error: saved.error };
    }

    await deleteAvatarFile(user.image);
    await prisma.user.update({
      where: { id: userId },
      data: { image: saved.url },
    });

    revalidatePath("/portal");
    return { success: true, imageUrl: saved.url };
  } catch (error: unknown) {
    console.error("updateProfileImage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile photo",
    };
  }
}

export async function removeProfileImage() {
  const authResult = await requireAuthAction();
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  const userId = authResult.session.user?.id;
  if (!userId) {
    return { success: false, error: "Session is invalid. Please sign in again." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "User account not found" };
    }

    await deleteAvatarFile(user.image);
    await prisma.user.update({
      where: { id: userId },
      data: { image: null },
    });

    revalidatePath("/portal");
    return { success: true, imageUrl: null };
  } catch (error: unknown) {
    console.error("removeProfileImage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove profile photo",
    };
  }
}

export async function changePassword(formData: FormData) {
  const authResult = await requireAuthAction();
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "All password fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New passwords do not match" };
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    return { success: false, error: passwordError };
  }

  const userId = authResult.session.user?.id;
  if (!userId) {
    return { success: false, error: "Session is invalid. Please sign in again." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "User account not found" };
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return { success: false, error: "Current password is incorrect" };
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    revalidatePath("/portal");
    return { success: true };
  } catch (error: unknown) {
    console.error("changePassword:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update password",
    };
  }
}
