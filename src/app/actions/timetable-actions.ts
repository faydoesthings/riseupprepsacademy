"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth-utils";

export async function createPeriod(formData: FormData) {
  const authResult = await requireAdminAction();
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  try {
    const classId = formData.get("classId") as string;
    const subjectId = formData.get("subjectId") as string;
    const teacherId = formData.get("teacherId") as string;
    const dayOfWeek = parseInt(formData.get("dayOfWeek") as string, 10);
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;

    if (!classId || !subjectId || !teacherId || isNaN(dayOfWeek) || !startTime || !endTime) {
      return { success: false, error: "Missing required fields" };
    }

    if (startTime >= endTime) {
      return { success: false, error: "End time must be after start time" };
    }

    await prisma.period.create({
      data: {
        classId,
        subjectId,
        teacherId,
        dayOfWeek,
        startTime,
        endTime,
      },
    });

    revalidatePath("/portal/admin/timetable");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to create period:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create period",
    };
  }
}

export async function deletePeriod(periodId: string) {
  const authResult = await requireAdminAction();
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  if (!periodId) {
    return { success: false, error: "Period ID is required" };
  }

  try {
    await prisma.period.delete({
      where: { id: periodId },
    });
    revalidatePath("/portal/admin/timetable");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete period:", error);
    return { success: false, error: "Failed to delete period" };
  }
}
