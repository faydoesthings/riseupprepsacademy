"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRoleAction, getRoleFromSession } from "@/lib/auth-utils";
import { logAudit } from "@/lib/audit-log";
import { z } from "zod";

const MaterialSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["PDF", "VIDEO", "IMAGE", "PPT", "DOC", "LINK"]),
  url: z.string().url("Must be a valid URL"),
  classId: z.string().cuid("Invalid Class ID"),
  subjectId: z.string().cuid("Invalid Subject ID"),
  chapter: z.string().optional(),
});

export async function createMaterial(formData: FormData, teacherId: string) {
  try {
    const auth = await requireRoleAction("TEACHER", "SUPER_ADMIN");
    if (!auth.ok) throw new Error(auth.error);

    // Security: Only allow teachers to upload as themselves, unless Super Admin
    if (getRoleFromSession(auth.session) !== "SUPER_ADMIN") {
      const teacher = await prisma.teacher.findFirst({ where: { user: { email: auth.session.user?.email ?? "" } } });
      if (!teacher || teacher.id !== teacherId) throw new Error("Unauthorized to upload on behalf of another teacher");
    }

    const data = {
      title: formData.get("title") as string,
      type: formData.get("type") as string,
      url: formData.get("url") as string,
      classId: formData.get("classId") as string,
      subjectId: formData.get("subjectId") as string,
      chapter: formData.get("chapter") as string || undefined,
    };

    const validated = MaterialSchema.parse(data);

    await prisma.material.create({
      data: {
        ...validated,
        uploadedBy: teacherId
      }
    });

    revalidatePath("/portal/teacher/materials");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create material",
    };
  }
}

const AssignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid Date"),
  classId: z.string().cuid("Invalid Class ID"),
  subjectId: z.string().cuid("Invalid Subject ID"),
  fileUrl: z.union([z.literal(""), z.string().url()]).optional(),
});

export async function createAssignment(formData: FormData, teacherId: string) {
  try {
    const auth = await requireRoleAction("TEACHER", "SUPER_ADMIN");
    if (!auth.ok) throw new Error(auth.error);

    if (getRoleFromSession(auth.session) !== "SUPER_ADMIN") {
      const teacher = await prisma.teacher.findFirst({ where: { user: { email: auth.session.user?.email ?? "" } } });
      if (!teacher || teacher.id !== teacherId) throw new Error("Unauthorized");
    }

    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      dueDate: formData.get("dueDate") as string,
      classId: formData.get("classId") as string,
      subjectId: formData.get("subjectId") as string,
      fileUrl: formData.get("fileUrl") as string || undefined,
    };

    const validated = AssignmentSchema.parse(data);

    await prisma.assignment.create({
      data: {
        title: validated.title,
        description: validated.description,
        dueDate: new Date(validated.dueDate),
        classId: validated.classId,
        subjectId: validated.subjectId,
        teacherId,
        fileUrl: validated.fileUrl || null,
      }
    });

    revalidatePath("/portal/teacher/assignments");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create assignment",
    };
  }
}

const SubmitAssignmentSchema = z.object({
  assignmentId: z.string().cuid(),
  fileUrl: z.string().url("Must be a valid URL linking to your work"),
});

export async function submitAssignment(formData: FormData, studentId: string) {
  try {
    const auth = await requireRoleAction("STUDENT");
    if (!auth.ok) throw new Error(auth.error);

    const student = await prisma.student.findFirst({ where: { user: { email: auth.session.user?.email ?? "" } } });
    if (!student || student.id !== studentId) throw new Error("Unauthorized student");

    const validated = SubmitAssignmentSchema.parse({
      assignmentId: formData.get("assignmentId") as string,
      fileUrl: formData.get("fileUrl") as string,
    });

    await prisma.submission.upsert({
      where: { assignmentId_studentId: { assignmentId: validated.assignmentId, studentId } },
      update: { fileUrl: validated.fileUrl, submittedAt: new Date() },
      create: { assignmentId: validated.assignmentId, studentId, fileUrl: validated.fileUrl }
    });

    revalidatePath("/portal/student/assignments");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit assignment",
    };
  }
}

const GradeSubmissionSchema = z.object({
  marks: z.number().min(0),
  totalMarks: z.number().min(1),
  feedback: z.string().optional(),
});

export async function gradeSubmission(submissionId: string, marks: number, totalMarks: number, feedback: string) {
  try {
    const auth = await requireRoleAction("TEACHER", "SUPER_ADMIN");
    if (!auth.ok) throw new Error(auth.error);

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });
    if (!submission) throw new Error("Submission not found");

    if (getRoleFromSession(auth.session) === "TEACHER") {
      const teacher = await prisma.teacher.findFirst({
        where: { user: { email: auth.session.user?.email ?? "" } },
      });
      if (!teacher || submission.assignment.teacherId !== teacher.id) {
        throw new Error("You can only grade submissions for your own assignments");
      }
    }

    const validated = GradeSubmissionSchema.parse({ marks, totalMarks, feedback });
    if (validated.marks > validated.totalMarks) throw new Error("Marks cannot exceed Total Marks");

    const percentage = (validated.marks / validated.totalMarks) * 100;
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        marks: validated.marks,
        grade,
        feedback: validated.feedback,
        gradedAt: new Date()
      }
    });

    const uid = auth.session.user?.id;
    if (uid) {
      await logAudit({
        userId: uid,
        action: "GRADE",
        module: "SUBMISSION",
        recordId: submissionId,
        details: `${validated.marks}/${validated.totalMarks} (${grade})`,
      });
    }

    revalidatePath("/portal/teacher/assignments");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to grade submission",
    };
  }
}

const ExamResultSchema = z.object({
  studentId: z.string().cuid(),
  subjectId: z.string().cuid(),
  examName: z.string().min(1),
  marks: z.number().min(0),
  totalMarks: z.number().min(1),
});

export async function createExamResult(formData: FormData) {
  try {
    const auth = await requireRoleAction("TEACHER", "SUPER_ADMIN");
    if (!auth.ok) throw new Error(auth.error);

    const data = {
      studentId: formData.get("studentId") as string,
      subjectId: formData.get("subjectId") as string,
      examName: formData.get("examName") as string,
      marks: parseFloat(formData.get("marks") as string),
      totalMarks: parseFloat(formData.get("totalMarks") as string),
    };

    const validated = ExamResultSchema.parse(data);
    if (validated.marks > validated.totalMarks) throw new Error("Marks cannot exceed total marks");

    if (getRoleFromSession(auth.session) === "TEACHER") {
      const teacher = await prisma.teacher.findFirst({
        where: { user: { email: auth.session.user?.email ?? "" } },
      });
      if (!teacher) throw new Error("Teacher profile not found");
      const subject = await prisma.subject.findFirst({
        where: { id: validated.subjectId, teacherId: teacher.id },
      });
      if (!subject) throw new Error("You can only add results for your assigned subjects");
    }

    const percentage = (validated.marks / validated.totalMarks) * 100;
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";

    await prisma.examResult.create({
      data: {
        studentId: validated.studentId,
        subjectId: validated.subjectId,
        examName: validated.examName,
        marks: validated.marks,
        totalMarks: validated.totalMarks,
        percentage,
        grade
      }
    });

    revalidatePath("/portal/teacher/exams");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create exam result",
    };
  }
}
