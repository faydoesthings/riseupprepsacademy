"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRoleAction } from "@/lib/auth-utils";
import {
  getCourseLessonCount,
  getCompletedLessonCount,
  getCourseProgressPercent,
} from "@/lib/lms/progress";
import { tryIssueCertificateAfterCompletion } from "@/lib/lms/completion";

const lessonTypes = [
  "VIDEO",
  "PDF",
  "SLIDES",
  "READING",
  "EXTERNAL_LINK",
  "DOWNLOAD",
  "PRACTICE",
] as const;

const lessonSchema = z.object({
  title: z.string().min(2).max(200),
  type: z.enum(lessonTypes),
  content: z.string().max(10000).optional(),
  duration: z.number().int().min(0).optional(),
  isPreview: z.boolean().optional(),
});

async function staffAuth() {
  return requireRoleAction("SUPER_ADMIN", "TEACHER");
}

export async function createLesson(moduleId: string, input: z.infer<typeof lessonSchema>) {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = lessonSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const mod = await prisma.module.findUnique({ where: { id: moduleId }, select: { courseId: true } });
    if (!mod) return { success: false as const, error: "Module not found" };

    const maxOrder = await prisma.lesson.aggregate({
      where: { moduleId },
      _max: { order: true },
    });

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title: parsed.data.title,
        type: parsed.data.type,
        content: parsed.data.content ?? null,
        duration: parsed.data.duration ?? null,
        isPreview: parsed.data.isPreview ?? false,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });

    revalidatePath(`/portal/admin/courses/${mod.courseId}`);
    return { success: true as const, data: lesson };
  } catch (error) {
    console.error("createLesson:", error);
    return { success: false as const, error: "Failed to create lesson" };
  }
}

export async function updateLesson(id: string, input: z.infer<typeof lessonSchema>) {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = lessonSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title: parsed.data.title,
        type: parsed.data.type,
        content: parsed.data.content ?? null,
        duration: parsed.data.duration ?? null,
        isPreview: parsed.data.isPreview ?? false,
      },
      include: { module: { select: { courseId: true } } },
    });
    revalidatePath(`/portal/admin/courses/${lesson.module.courseId}`);
    return { success: true as const, data: lesson };
  } catch (error) {
    console.error("updateLesson:", error);
    return { success: false as const, error: "Failed to update lesson" };
  }
}

export async function deleteLesson(id: string) {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const lesson = await prisma.lesson.delete({
      where: { id },
      include: { module: { select: { courseId: true } } },
    });
    revalidatePath(`/portal/admin/courses/${lesson.module.courseId}`);
    return { success: true as const };
  } catch (error) {
    console.error("deleteLesson:", error);
    return { success: false as const, error: "Failed to delete lesson" };
  }
}

export async function reorderLessons(moduleId: string, orderedIds: string[]) {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const mod = await prisma.module.findUnique({ where: { id: moduleId }, select: { courseId: true } });
    if (!mod) return { success: false as const, error: "Module not found" };

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.lesson.update({ where: { id, moduleId }, data: { order: index + 1 } })
      )
    );
    revalidatePath(`/portal/admin/courses/${mod.courseId}`);
    return { success: true as const };
  } catch (error) {
    console.error("reorderLessons:", error);
    return { success: false as const, error: "Failed to reorder lessons" };
  }
}

export async function moveLesson(moduleId: string, lessonId: string, direction: "up" | "down") {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const lessons = await prisma.lesson.findMany({
    where: { moduleId },
    orderBy: { order: "asc" },
    select: { id: true },
  });
  const idx = lessons.findIndex((l) => l.id === lessonId);
  if (idx < 0) return { success: false as const, error: "Lesson not found" };

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= lessons.length) return { success: true as const };

  const ordered = lessons.map((l) => l.id);
  [ordered[idx], ordered[swapIdx]] = [ordered[swapIdx], ordered[idx]];
  return reorderLessons(moduleId, ordered);
}

const progressSchema = z.object({
  percentage: z.number().min(0).max(100),
  timeSpent: z.number().int().min(0),
  completed: z.boolean().optional(),
  started: z.boolean().optional(),
});

export async function markLessonProgress(
  lessonId: string,
  userId: string,
  input: z.infer<typeof progressSchema>
) {
  const parsed = progressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid progress data" };
  }

  const { percentage, timeSpent, completed, started } = parsed.data;
  const isComplete = completed === true || percentage >= 90;

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { select: { courseId: true } } },
    });
    if (!lesson) return { success: false as const, error: "Lesson not found" };

    const row = await prisma.lessonProgress.upsert({
      where: { lessonId_userId: { lessonId, userId } },
      create: {
        lessonId,
        userId,
        started: started ?? true,
        completed: isComplete,
        percentage: Math.min(100, percentage),
        timeSpent,
        lastViewed: new Date(),
      },
      update: {
        started: true,
        completed: isComplete,
        percentage: Math.min(100, Math.max(percentage, 0)),
        timeSpent: { increment: timeSpent },
        lastViewed: new Date(),
      },
    });

    if (isComplete) {
      const courseId = lesson.module.courseId;
      const total = await getCourseLessonCount(courseId);
      const done = await getCompletedLessonCount(courseId, userId);
      if (total > 0 && done >= total) {
        await prisma.enrollment.updateMany({
          where: { courseId, userId, status: "ACTIVE" },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
        await tryIssueCertificateAfterCompletion(courseId, userId);
      }
    }

    return { success: true as const, data: row };
  } catch (error) {
    console.error("markLessonProgress:", error);
    return { success: false as const, error: "Failed to save progress" };
  }
}

export { getCourseLessonCount, getCompletedLessonCount, getCourseProgressPercent };

export async function getLessonForPlayer(lessonId: string, userId: string) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: { select: { id: true, slug: true, title: true, isPublished: true } },
            lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true } },
          },
        },
        progress: { where: { userId } },
      },
    });
    if (!lesson) return { success: false as const, error: "Lesson not found" };

    const courseId = lesson.module.course.id;
    const enrollment = await prisma.enrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    const enrolled = enrollment?.status === "ACTIVE" || enrollment?.status === "COMPLETED";

    if (!lesson.isPreview && !enrolled) {
      return { success: false as const, error: "Enroll to access this lesson" };
    }

    return {
      success: true as const,
      data: {
        lesson,
        progress: lesson.progress[0] ?? null,
        course: lesson.module.course,
        moduleLessons: lesson.module.lessons,
      },
    };
  } catch (error) {
    console.error("getLessonForPlayer:", error);
    return { success: false as const, error: "Failed to load lesson" };
  }
}
