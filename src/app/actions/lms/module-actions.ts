"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAction, requireRoleAction } from "@/lib/auth-utils";

const moduleSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
});

async function staffAuth() {
  return requireRoleAction("SUPER_ADMIN", "TEACHER");
}

export async function createModule(courseId: string, input: z.infer<typeof moduleSchema>) {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = moduleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const maxOrder = await prisma.module.aggregate({
      where: { courseId },
      _max: { order: true },
    });

    const mod = await prisma.module.create({
      data: {
        courseId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });

    revalidatePath(`/portal/admin/courses/${courseId}`);
    return { success: true as const, data: mod };
  } catch (error) {
    console.error("createModule:", error);
    return { success: false as const, error: "Failed to create module" };
  }
}

export async function updateModule(id: string, input: z.infer<typeof moduleSchema>) {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const parsed = moduleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const mod = await prisma.module.update({
      where: { id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
      },
    });
    revalidatePath(`/portal/admin/courses/${mod.courseId}`);
    return { success: true as const, data: mod };
  } catch (error) {
    console.error("updateModule:", error);
    return { success: false as const, error: "Failed to update module" };
  }
}

export async function deleteModule(id: string) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const mod = await prisma.module.delete({ where: { id } });
    revalidatePath(`/portal/admin/courses/${mod.courseId}`);
    return { success: true as const };
  } catch (error) {
    console.error("deleteModule:", error);
    return { success: false as const, error: "Failed to delete module" };
  }
}

export async function reorderModules(courseId: string, orderedIds: string[]) {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.module.update({ where: { id, courseId }, data: { order: index + 1 } })
      )
    );
    revalidatePath(`/portal/admin/courses/${courseId}`);
    return { success: true as const };
  } catch (error) {
    console.error("reorderModules:", error);
    return { success: false as const, error: "Failed to reorder modules" };
  }
}

export async function moveModule(courseId: string, moduleId: string, direction: "up" | "down") {
  const auth = await staffAuth();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    select: { id: true },
  });
  const idx = modules.findIndex((m) => m.id === moduleId);
  if (idx < 0) return { success: false as const, error: "Module not found" };

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= modules.length) {
    return { success: true as const };
  }

  const ordered = modules.map((m) => m.id);
  [ordered[idx], ordered[swapIdx]] = [ordered[swapIdx], ordered[idx]];
  return reorderModules(courseId, ordered);
}
