"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAction, requireRoleAction, requireAuthAction, getRoleFromSession } from "@/lib/auth-utils";
import { getVivaEligibility } from "@/lib/lms/eligibility";
import { issueCertificate } from "@/app/actions/lms/certificate-actions";
import { sendLmsNotification } from "@/lib/lms/notifications";

const scheduleSchema = z.object({
  courseId: z.string(),
  studentId: z.string(),
  examinerId: z.string().optional(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(180).optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
});

const completeSchema = z.object({
  sessionId: z.string(),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  notes: z.string().max(2000).optional(),
});

export async function scheduleViva(input: z.infer<typeof scheduleSchema>) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = scheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const eligible = await getVivaEligibility(data.courseId, data.studentId);
  if (!eligible.eligible) {
    return { success: false as const, error: eligible.reason ?? "Student not eligible for viva" };
  }

  try {
    const session = await prisma.vivaSession.create({
      data: {
        courseId: data.courseId,
        studentId: data.studentId,
        examinerId: data.examinerId ?? null,
        scheduledAt: new Date(data.scheduledAt),
        durationMinutes: data.durationMinutes ?? 30,
        meetingLink: data.meetingLink || null,
        status: "SCHEDULED",
      },
      include: {
        course: { select: { title: true, slug: true } },
        examiner: { select: { name: true } },
      },
    });

    await sendLmsNotification(
      data.studentId,
      "Viva scheduled",
      `Your viva for "${session.course.title}" is scheduled for ${new Date(data.scheduledAt).toLocaleString()}.`,
      "/portal/student/viva",
      "INFO"
    );

    if (data.examinerId) {
      await sendLmsNotification(
        data.examinerId,
        "Viva assigned",
        `You are assigned to examine a viva for "${session.course.title}".`,
        "/portal/teacher/viva",
        "INFO"
      );
    }

    revalidatePath("/portal/admin/viva");
    revalidatePath("/portal/student/viva");
    revalidatePath("/portal/teacher/viva");
    return { success: true as const, data: session };
  } catch (error) {
    console.error("scheduleViva:", error);
    return { success: false as const, error: "Failed to schedule viva" };
  }
}

export async function cancelViva(sessionId: string) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    await prisma.vivaSession.update({
      where: { id: sessionId },
      data: { status: "CANCELLED" },
    });
    revalidatePath("/portal/admin/viva");
    return { success: true as const };
  } catch (error) {
    console.error("cancelViva:", error);
    return { success: false as const, error: "Failed to cancel viva" };
  }
}

export async function completeViva(input: z.infer<typeof completeSchema>) {
  const auth = await requireRoleAction("SUPER_ADMIN", "TEACHER");
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = completeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { sessionId, score, passed, notes } = parsed.data;
  const userId = auth.session.user!.id!;

  try {
    const session = await prisma.vivaSession.findUnique({
      where: { id: sessionId },
      include: { course: { select: { requiresViva: true } } },
    });
    if (!session) return { success: false as const, error: "Session not found" };

    if (getRoleFromSession(auth.session) === "TEACHER" && session.examinerId && session.examinerId !== userId) {
      return { success: false as const, error: "You are not assigned to this viva" };
    }

    const updated = await prisma.vivaSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        score,
        passed,
        notes: notes ?? null,
        completedAt: new Date(),
      },
    });

    if (passed) {
      await issueCertificate(session.courseId, session.studentId, sessionId);
    }

    revalidatePath("/portal/admin/viva");
    revalidatePath("/portal/teacher/viva");
    revalidatePath("/portal/student/viva");
    return { success: true as const, data: updated };
  } catch (error) {
    console.error("completeViva:", error);
    return { success: false as const, error: "Failed to complete viva" };
  }
}

export async function listVivaSessions(role: "admin" | "teacher" | "student", userId: string) {
  const auth = await requireAuthAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const where =
      role === "admin"
        ? {}
        : role === "teacher"
          ? { examinerId: userId, status: { in: ["SCHEDULED", "COMPLETED"] } }
          : { studentId: userId, status: { in: ["SCHEDULED", "COMPLETED", "NO_SHOW"] } };

    const sessions = await prisma.vivaSession.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      include: {
        course: { select: { title: true, slug: true } },
        student: { select: { name: true, email: true } },
        examiner: { select: { name: true, email: true } },
      },
      take: 50,
    });

    return { success: true as const, data: sessions };
  } catch (error) {
    console.error("listVivaSessions:", error);
    return { success: false as const, error: "Failed to load viva sessions" };
  }
}

export async function listTeachersForViva() {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER", status: "ACTIVE" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return { success: true as const, data: teachers };
}
