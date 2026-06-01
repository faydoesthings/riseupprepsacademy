"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireAdminAction, validatePassword } from "@/lib/auth-utils";

export async function createTeacher(formData: FormData) {
  const authResult = await requireAdminAction();
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const specialization = formData.get("specialization") as string;
    const qualification = formData.get("qualification") as string;
    const salary = parseFloat((formData.get("salary") as string) || "0");
    const password = formData.get("password") as string;

    if (!name || !email) {
      return { success: false, error: "Name and email are required" };
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return { success: false, error: passwordError };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "Email already in use" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          password: hashedPassword,
          role: "TEACHER",
        },
      });

      await tx.teacher.create({
        data: {
          userId: user.id,
          specialization: specialization || null,
          qualification: qualification || null,
          salary,
        },
      });
    });

    revalidatePath("/portal/admin/teachers");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to create teacher:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create teacher",
    };
  }
}
