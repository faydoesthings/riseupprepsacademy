"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAction, requireAuthAction, requireRoleAction, getRoleFromSession } from "@/lib/auth-utils";
import { uniqueCourseSlug } from "@/lib/lms/slug";
import { getCourseProgressPercent } from "@/lib/lms/progress";

const createCourseSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10).max(5000),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  estimatedDurationHours: z.number().min(0).max(500).optional(),
  thumbnail: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).max(20).optional(),
  prerequisites: z.array(z.string()).max(10).optional(),
  requiresPayment: z.boolean().optional(),
  pricePKR: z.number().int().min(0).optional(),
  requiresViva: z.boolean().optional(),
});

const updateCourseSchema = createCourseSchema.partial();

export async function createCourse(input: z.infer<typeof createCourseSchema>) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = createCourseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const slug = await uniqueCourseSlug(data.title);
  const userId = auth.session.user!.id!;

  try {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        difficulty: data.difficulty ?? null,
        estimatedDuration: data.estimatedDurationHours
          ? Math.round(data.estimatedDurationHours * 60)
          : null,
        thumbnail: data.thumbnail || null,
        tags: data.tags ?? [],
        prerequisites: data.prerequisites ?? [],
        requiresPayment: data.requiresPayment ?? false,
        pricePKR: data.pricePKR ?? null,
        requiresViva: data.requiresViva ?? false,
        createdById: userId,
      },
    });

    revalidatePath("/portal/admin/courses");
    return { success: true as const, data: course };
  } catch (error) {
    console.error("createCourse:", error);
    return { success: false as const, error: "Failed to create course" };
  }
}

async function staffOrAdminAuth() {
  return requireRoleAction("SUPER_ADMIN", "TEACHER");
}

export async function updateCourse(id: string, input: z.infer<typeof updateCourseSchema>) {
  const auth = await staffOrAdminAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = updateCourseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  try {
    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.difficulty !== undefined ? { difficulty: data.difficulty } : {}),
        ...(data.estimatedDurationHours !== undefined
          ? { estimatedDuration: Math.round(data.estimatedDurationHours * 60) }
          : {}),
        ...(data.thumbnail !== undefined ? { thumbnail: data.thumbnail || null } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.prerequisites !== undefined ? { prerequisites: data.prerequisites } : {}),
        ...(data.requiresPayment !== undefined ? { requiresPayment: data.requiresPayment } : {}),
        ...(data.pricePKR !== undefined ? { pricePKR: data.pricePKR } : {}),
        ...(data.requiresViva !== undefined ? { requiresViva: data.requiresViva } : {}),
      },
    });

    revalidatePath("/portal/admin/courses");
    revalidatePath(`/portal/admin/courses/${id}`);
    return { success: true as const, data: course };
  } catch (error) {
    console.error("updateCourse:", error);
    return { success: false as const, error: "Failed to update course" };
  }
}

export async function deleteCourse(id: string) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const active = await prisma.enrollment.count({
      where: { courseId: id, status: "ACTIVE" },
    });
    if (active > 0) {
      return { success: false as const, error: "Cannot delete a course with active enrollments" };
    }

    await prisma.course.delete({ where: { id } });
    revalidatePath("/portal/admin/courses");
    return { success: true as const };
  } catch (error) {
    console.error("deleteCourse:", error);
    return { success: false as const, error: "Failed to delete course" };
  }
}

export async function publishCourse(id: string, publish: boolean) {
  const auth = await staffOrAdminAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  if (publish) {
    const moduleCount = await prisma.module.count({ where: { courseId: id } });
    const lessonCount = await prisma.lesson.count({ where: { module: { courseId: id } } });
    if (moduleCount < 1 || lessonCount < 1) {
      return {
        success: false as const,
        error: "Add at least one module with one lesson before publishing",
      };
    }
  }

  try {
    const course = await prisma.course.update({
      where: { id },
      data: { isPublished: publish },
    });
    revalidatePath("/portal/admin/courses");
    revalidatePath(`/portal/admin/courses/${id}`);
    return { success: true as const, data: course };
  } catch (error) {
    console.error("publishCourse:", error);
    return { success: false as const, error: "Failed to update publish status" };
  }
}

export async function getCourses(search?: string) {
  const auth = await staffOrAdminAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const courses = await prisma.course.findMany({
      where: search
        ? { title: { contains: search, mode: "insensitive" } }
        : undefined,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { modules: true, enrollments: true } },
        modules: { select: { _count: { select: { lessons: true } } } },
      },
    });

    const data = courses.map((c) => ({
      ...c,
      lessonCount: c.modules.reduce((sum, m) => sum + m._count.lessons, 0),
    }));

    return { success: true as const, data };
  } catch (error) {
    console.error("getCourses:", error);
    return { success: false as const, error: "Failed to load courses" };
  }
}

export async function getCourseById(courseId: string) {
  const auth = await staffOrAdminAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: { orderBy: { order: "asc" } },
            quizzes: { include: { _count: { select: { questions: true } } } },
          },
        },
        quizzes: { where: { type: "FINAL_EXAM" }, include: { _count: { select: { questions: true } } } },
      },
    });
    if (!course) return { success: false as const, error: "Course not found" };
    return { success: true as const, data: course };
  } catch (error) {
    console.error("getCourseById:", error);
    return { success: false as const, error: "Failed to load course" };
  }
}

export async function getCourseBySlug(slug: string) {
  try {
    const auth = await requireAuthAction();
    const userId = auth.ok ? auth.session.user!.id! : null;
    const role = auth.ok ? getRoleFromSession(auth.session) : null;
    const isAdmin = role === "SUPER_ADMIN";

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        createdBy: { select: { name: true } },
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: { orderBy: { order: "asc" } },
            quizzes: { select: { id: true, title: true, type: true } },
          },
        },
        quizzes: { where: { type: "FINAL_EXAM" }, select: { id: true, title: true, type: true } },
      },
    });

    if (!course) return { success: false as const, error: "Course not found" };
    if (!course.isPublished && !isAdmin) {
      return { success: false as const, error: "Course not available" };
    }

    let enrolled = false;
    if (userId) {
      const en = await prisma.enrollment.findUnique({
        where: { courseId_userId: { courseId: course.id, userId } },
      });
      enrolled = en?.status === "ACTIVE" || en?.status === "COMPLETED";
    }

    const canAccessFull = isAdmin || enrolled;

    const modules = course.modules.map((mod) => ({
      ...mod,
      lessons: mod.lessons
        .filter((lesson) => canAccessFull || lesson.isPreview)
        .map((lesson) => ({
          ...lesson,
          content: canAccessFull || lesson.isPreview ? lesson.content : null,
        })),
    }));

    return {
      success: true as const,
      data: {
        ...course,
        modules,
        enrolled,
        canAccessFull,
      },
    };
  } catch (error) {
    console.error("getCourseBySlug:", error);
    return { success: false as const, error: "Failed to load course" };
  }
}

export async function getCourseWithProgress(slug: string, userId: string) {
  const base = await getCourseBySlug(slug);
  if (!base.success) return base;

  const progressRows = await prisma.lessonProgress.findMany({
    where: {
      userId,
      lesson: { module: { courseId: base.data.id } },
    },
  });

  const progressMap = new Map(progressRows.map((p) => [p.lessonId, p]));
  const percent = await getCourseProgressPercent(base.data.id, userId);

  const modules = base.data.modules.map((mod) => ({
    ...mod,
    lessons: mod.lessons.map((lesson) => ({
      ...lesson,
      progress: progressMap.get(lesson.id) ?? null,
    })),
  }));

  return {
    success: true as const,
    data: { ...base.data, modules, progressPercent: percent },
  };
}
