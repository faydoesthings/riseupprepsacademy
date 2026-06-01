"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth-utils";

export async function createClass(formData: FormData) {
  const authResult = await requireAdminAction();
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  try {
    const name = formData.get("name") as string;
    const grade = formData.get("grade") as string;
    const section = formData.get("section") as string;
    const academicYear = formData.get("academicYear") as string;
    const teacherId = formData.get("teacherId") as string;

    if (!name || !grade || !academicYear) {
      return { success: false, error: "Missing required fields" };
    }

    await prisma.class.create({
      data: {
        name,
        grade,
        section: section || null,
        academicYear,
        teacherId: teacherId || null,
      },
    });

    revalidatePath("/portal/admin/classes");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to create class:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create class",
    };
  }
}
