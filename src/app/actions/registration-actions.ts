"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth-utils";
import { logAudit } from "@/lib/audit-log";
import { generateInitialPassword, hashPassword } from "@/lib/provision-user";

const ALLOWED_ROLES = ["TEACHER", "STUDENT", "DONOR"] as const;

export async function submitRegistrationRequest(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const phone = (formData.get("phone") as string)?.trim();
    const roleRequested = formData.get("roleRequested") as string;
    const reason = (formData.get("reason") as string)?.trim();

    if (!name || !email || !roleRequested) {
      return { success: false, error: "Name, email, and role are required" };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    if (!ALLOWED_ROLES.includes(roleRequested as (typeof ALLOWED_ROLES)[number])) {
      return { success: false, error: "Invalid role selected" };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    const pending = await prisma.registrationRequest.findFirst({
      where: { email, status: "PENDING" },
    });
    if (pending) {
      return {
        success: false,
        error: "A pending request for this email already exists",
      };
    }

    await prisma.registrationRequest.create({
      data: {
        name,
        email,
        phone: phone || null,
        roleRequested,
        reason: reason || null,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to submit registration request:", error);
    return {
      success: false,
      error: "Failed to submit request. Please try again later.",
    };
  }
}

export async function reviewRegistrationRequest(
  requestId: string,
  status: "APPROVED" | "REJECTED",
  rejectionNote?: string
) {
  const authResult = await requireAdminAction();
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  if (!requestId || !["APPROVED", "REJECTED"].includes(status)) {
    return { success: false, error: "Invalid review request" };
  }

  try {
    let provisionedRecordId: string | undefined;
    let provisionedModule: "STUDENT" | "TEACHER" | "DONOR" | undefined;

    await prisma.$transaction(async (tx) => {
      const request = await tx.registrationRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new Error("Registration request not found");
      }

      if (request.status !== "PENDING") {
        throw new Error("This request has already been reviewed");
      }

      if (status === "APPROVED") {
        const existingUser = await tx.user.findUnique({
          where: { email: request.email },
        });

        if (existingUser) {
          throw new Error("An account with this email already exists");
        }

        const password = generateInitialPassword();
        const user = await tx.user.create({
          data: {
            name: request.name,
            email: request.email,
            phone: request.phone,
            password: await hashPassword(password),
            role: request.roleRequested,
          },
        });

        if (request.roleRequested === "STUDENT") {
          const student = await tx.student.create({
            data: { userId: user.id },
          });
          provisionedRecordId = student.id;
          provisionedModule = "STUDENT";
        } else if (request.roleRequested === "TEACHER") {
          const teacher = await tx.teacher.create({
            data: { userId: user.id },
          });
          provisionedRecordId = teacher.id;
          provisionedModule = "TEACHER";
        } else if (request.roleRequested === "DONOR") {
          const donor = await tx.donor.create({
            data: { userId: user.id },
          });
          provisionedRecordId = donor.id;
          provisionedModule = "DONOR";
        }
      }

      await tx.registrationRequest.update({
        where: { id: requestId },
        data: {
          status,
          rejectionNote: status === "REJECTED" ? rejectionNote?.trim() || null : null,
          reviewedAt: new Date(),
          reviewedBy: authResult.session.user?.id ?? null,
        },
      });
    });

    const adminId = authResult.session.user?.id;
    if (adminId) {
      await logAudit({
        userId: adminId,
        action: status,
        module: "REGISTRATION",
        recordId: requestId,
        details: rejectionNote?.trim() || undefined,
      });

      if (provisionedRecordId && provisionedModule) {
        await logAudit({
          userId: adminId,
          action: "CREATE",
          module: provisionedModule,
          recordId: provisionedRecordId,
          details: "Provisioned from approved portal registration request",
        });
      }
    }

    revalidatePath("/portal/admin/registrations");
    revalidatePath("/portal/admin/students");
    revalidatePath("/portal/admin/teachers");
    revalidatePath("/portal/admin/donors");

    return { success: true };
  } catch (error: unknown) {
    console.error("reviewRegistrationRequest:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update registration request",
    };
  }
}
