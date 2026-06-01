"use server";

import prisma from "@/lib/prisma";

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
