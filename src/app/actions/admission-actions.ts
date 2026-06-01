"use server";

import prisma from "@/lib/prisma";

export async function submitAdmissionApplication(formData: FormData) {
  try {
    const studentName = (formData.get("studentName") as string)?.trim();
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const gradeApplying = (formData.get("gradeApplying") as string)?.trim();
    const parentName = (formData.get("parentName") as string)?.trim();
    const parentPhone = (formData.get("parentPhone") as string)?.trim();
    const parentEmail = (formData.get("parentEmail") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const previousSchool = (formData.get("previousSchool") as string)?.trim();

    if (!studentName || !dateOfBirth || !gradeApplying || !parentName || !parentPhone) {
      return { success: false, error: "Please fill in all required fields" };
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
        previousSchool: previousSchool || null,
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
