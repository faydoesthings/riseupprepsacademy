"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  attendanceDateRange,
  getRoleFromSession,
  requireAuthAction,
  requireRoleAction,
} from "@/lib/auth-utils";

interface AttendanceRecord {
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  note?: string;
}

export async function submitAttendance(
  periodId: string,
  dateString: string,
  records: AttendanceRecord[],
  teacherId: string
) {
  const authResult = await requireRoleAction("TEACHER", "SUPER_ADMIN");
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  if (!periodId || !dateString || records.length === 0) {
    return { success: false, error: "Missing attendance data" };
  }

  const role = getRoleFromSession(authResult.session);

  if (role === "TEACHER") {
    const teacher = await prisma.teacher.findFirst({
      where: { user: { email: authResult.session.user?.email ?? "" } },
    });
    if (!teacher || teacher.id !== teacherId) {
      return { success: false, error: "You can only mark attendance for your own classes" };
    }

    const period = await prisma.period.findFirst({
      where: { id: periodId, teacherId: teacher.id },
    });
    if (!period) {
      return { success: false, error: "This period is not assigned to you" };
    }
  }

  try {
    const { date } = attendanceDateRange(dateString);

    await prisma.$transaction(
      records.map((record) =>
        prisma.attendance.upsert({
          where: {
            studentId_periodId_date: {
              studentId: record.studentId,
              periodId,
              date,
            },
          },
          update: {
            status: record.status,
            note: record.note,
            markedById: teacherId,
          },
          create: {
            studentId: record.studentId,
            periodId,
            date,
            status: record.status,
            note: record.note,
            markedById: teacherId,
          },
        })
      )
    );

    revalidatePath("/portal/teacher/attendance");
    revalidatePath("/portal/admin/attendance");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to submit attendance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit attendance",
    };
  }
}
