"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth-utils";

export async function createSubject(formData: FormData) {
  const authResult = await requireAdminAction();
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  try {
    const name = formData.get("name") as string;
    const classId = formData.get("classId") as string;
    const teacherId = formData.get("teacherId") as string;

    if (!name || !classId) {
      return { success: false, error: "Missing required fields" };
    }

    const existing = await prisma.subject.findFirst({
      where: { classId, name },
    });
    if (existing) {
      return { success: false, error: "This subject already exists for the selected class" };
    }

    await prisma.subject.create({
      data: {
        name,
        classId,
        teacherId: teacherId || null,
      },
    });

    revalidatePath("/portal/admin/subjects");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to create subject:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create subject",
    };
  }
}
