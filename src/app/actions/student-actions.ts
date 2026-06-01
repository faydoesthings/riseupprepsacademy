"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireAdminAction, validatePassword } from "@/lib/auth-utils";

export async function createStudent(formData: FormData) {
  const authResult = await requireAdminAction();
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const classId = formData.get("classId") as string;
    const rollNumber = formData.get("rollNumber") as string;
    const parentName = formData.get("parentName") as string;
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
          role: "STUDENT",
        },
      });

      await tx.student.create({
        data: {
          userId: user.id,
          classId: classId || null,
          rollNumber: rollNumber || null,
          parentName: parentName || null,
        },
      });
    });

    revalidatePath("/portal/admin/students");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to create student:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create student",
    };
  }
}
