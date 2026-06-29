"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth-utils";
import { logAudit } from "@/lib/audit-log";
import { allGradeOptionValues } from "@/data/admissions";
import {
  findClassIdForGrade,
  generateInitialPassword,
  hashPassword,
  resolveUniqueStudentEmail,
} from "@/lib/provision-user";

export async function submitAdmissionApplication(formData: FormData) {
  try {
    const studentName = (formData.get("studentName") as string)?.trim();
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const gradeApplying = (formData.get("gradeApplying") as string)?.trim();
    const parentName = (formData.get("parentName") as string)?.trim();
    const parentPhone = (formData.get("parentPhone") as string)?.trim();
    const parentEmail = (formData.get("parentEmail") as string)?.trim().toLowerCase();
    const address = (formData.get("address") as string)?.trim();
    const currentSchool = (formData.get("currentSchool") as string)?.trim();

    if (!studentName || !dateOfBirth || !gradeApplying || !parentName || !parentPhone || !parentEmail) {
      return { success: false, error: "Please fill in all required fields" };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
      return { success: false, error: "Please enter a valid email address" };
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
        parentEmail,
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
    let newStudentId: string | undefined;

    await prisma.$transaction(async (tx) => {
      const application = await tx.admissionApplication.findUnique({
        where: { id: applicationId },
      });

      if (!application) {
        throw new Error("Application not found");
      }

      if (application.status !== "PENDING") {
        throw new Error("This application has already been reviewed");
      }

      if (status === "APPROVED") {
        const email = await resolveUniqueStudentEmail(
          tx,
          application.parentEmail,
          application.studentName,
          application.id
        );

        const existingUser = await tx.user.findUnique({ where: { email } });
        if (existingUser) {
          const existingStudent = await tx.student.findUnique({
            where: { userId: existingUser.id },
          });
          if (!existingStudent) {
            await tx.student.create({
              data: {
                userId: existingUser.id,
                classId: await findClassIdForGrade(tx, application.gradeApplying),
                parentName: application.parentName,
                parentPhone: application.parentPhone,
                parentEmail: application.parentEmail,
                dateOfBirth: application.dateOfBirth,
                address: application.address,
                previousSchool: application.previousSchool,
              },
            });
          }
        } else {
          const password = generateInitialPassword();
          const user = await tx.user.create({
            data: {
              name: application.studentName,
              email,
              phone: application.parentPhone,
              password: await hashPassword(password),
              role: "STUDENT",
            },
          });

          const student = await tx.student.create({
            data: {
              userId: user.id,
              classId: await findClassIdForGrade(tx, application.gradeApplying),
              parentName: application.parentName,
              parentPhone: application.parentPhone,
              parentEmail: application.parentEmail,
              dateOfBirth: application.dateOfBirth,
              address: application.address,
              previousSchool: application.previousSchool,
            },
          });
          newStudentId = student.id;
        }
      }

      await tx.admissionApplication.update({
        where: { id: applicationId },
        data: {
          status,
          reviewNote: reviewNote?.trim() || null,
          updatedAt: new Date(),
        },
      });
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
      if (newStudentId) {
        await logAudit({
          userId: adminId,
          action: "CREATE",
          module: "STUDENT",
          recordId: newStudentId,
          details: "Provisioned from approved admission application",
        });
      }
    }

    revalidatePath("/portal/admin/admissions");
    revalidatePath("/portal/admin/students");
    return { success: true };
  } catch (error: unknown) {
    console.error("reviewAdmissionApplication:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update application",
    };
  }
}
