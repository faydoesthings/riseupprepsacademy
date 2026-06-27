"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth-utils";
import { logAudit } from "@/lib/audit-log";
import { allGradeOptionValues } from "@/data/admissions";

export async function submitAdmissionApplication(formData: FormData) {
  try {
    const studentName = (formData.get("studentName") as string)?.trim();
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const gradeApplying = (formData.get("gradeApplying") as string)?.trim();
    const parentName = (formData.get("parentName") as string)?.trim();
    const parentPhone = (formData.get("parentPhone") as string)?.trim();
    const parentEmail = (formData.get("parentEmail") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const currentSchool = (formData.get("currentSchool") as string)?.trim();

    if (!studentName || !dateOfBirth || !gradeApplying || !parentName || !parentPhone) {
      return { success: false, error: "Please fill in all required fields" };
    }

    if (!(allGradeOptionValues as readonly string[]).includes(gradeApplying)) {
      return { success: false, error: "Please select a valid grade from the list" };
    }

    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
      return { success: false, error: "Invalid date of birth" };
    }

    await prisma.admissionApplication.create({
      data: {
        studentName,
        dateOfBirth: dob,
        gradeApplying,
        parentName,
        parentPhone,
        parentEmail: parentEmail || null,
        address: address || null,
        previousSchool: currentSchool || null,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to submit admission:", error);
    return {
      success: false,
      error: "Failed to submit application. Please try again later.",
    };
  }
}

export async function reviewAdmissionApplication(
  applicationId: string,
  status: "APPROVED" | "REJECTED",
  reviewNote?: string
) {
  const authResult = await requireAdminAction();
  if (!authResult.ok) {
    return { success: false, error: authResult.error };
  }

  if (!applicationId || !["APPROVED", "REJECTED"].includes(status)) {
    return { success: false, error: "Invalid review request" };
  }

  try {
    await prisma.admissionApplication.update({
      where: { id: applicationId },
      data: {
        status,
        reviewNote: reviewNote?.trim() || null,
        updatedAt: new Date(),
      },
    });

    const adminId = authResult.session.user?.id;
    if (adminId) {
      await logAudit({
        userId: adminId,
        action: status,
        module: "ADMISSION",
        recordId: applicationId,
        details: reviewNote?.trim() || undefined,
      });
    }

    revalidatePath("/portal/admin/admissions");
    return { success: true };
  } catch (error: unknown) {
    console.error("reviewAdmissionApplication:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update application",
    };
  }
}
