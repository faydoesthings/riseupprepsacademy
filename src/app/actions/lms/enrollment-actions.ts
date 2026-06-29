"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAction, requireAuthAction, requireRoleAction, getRoleFromSession } from "@/lib/auth-utils";
import { getCourseProgressPercent, isEnrolled, moduleLessonsComplete } from "@/lib/lms/progress";
import { checkPrerequisitesMet } from "@/lib/lms/prerequisites";
import { sendLmsNotification } from "@/lib/lms/notifications";
import type { EnrollmentType } from "@/lib/lms/types";

const enrollmentTypes = ["MANUAL", "PAYMENT", "COUPON", "SCHOLARSHIP", "BULK"] as const;

export async function enrollStudent(
  courseId: string,
  userId: string,
  type: EnrollmentType = "MANUAL"
) {
  const auth = await requireAuthAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const role = getRoleFromSession(auth.session);
  const isAdmin = role === "SUPER_ADMIN";
  const isSelf = auth.session.user!.id === userId;

  if (!isAdmin && !(isSelf && role === "STUDENT" && type === "MANUAL")) {
    return { success: false as const, error: "You do not have permission to enroll" };
  }

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return { success: false as const, error: "Course not found" };
    }
    if (!course.isPublished && !isAdmin) {
      return { success: false as const, error: "Course is not available for enrollment" };
    }

    if (course.requiresPayment && type !== "PAYMENT" && !isAdmin) {
      return {
        success: false as const,
        error: "This course requires payment. Contact the academy to enroll.",
      };
    }

    if (!isAdmin) {
      const prereqs = await checkPrerequisitesMet(courseId, userId);
      if (!prereqs.met) {
        return {
          success: false as const,
          error: `Complete prerequisite course(s) first: ${prereqs.missing.join(", ")}`,
        };
      }
    }

    const enrollment = await prisma.enrollment.upsert({
      where: { courseId_userId: { courseId, userId } },
      create: { courseId, userId, type, status: "ACTIVE" },
      update: { status: "ACTIVE", type, enrolledAt: new Date() },
    });

    revalidatePath("/portal/student/courses");
    return { success: true as const, data: enrollment };
  } catch (error) {
    console.error("enrollStudent:", error);
    return { success: false as const, error: "Failed to enroll student" };
  }
}

export async function unenrollStudent(courseId: string, userId: string) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    await prisma.enrollment.update({
      where: { courseId_userId: { courseId, userId } },
      data: { status: "DROPPED" },
    });
    revalidatePath("/portal/student/courses");
    return { success: true as const };
  } catch (error) {
    console.error("unenrollStudent:", error);
    return { success: false as const, error: "Failed to unenroll student" };
  }
}

export async function getEnrolledCourses(userId: string) {
  const auth = await requireAuthAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const role = getRoleFromSession(auth.session);
  if (role !== "SUPER_ADMIN" && auth.session.user!.id !== userId) {
    return { success: false as const, error: "Forbidden" };
  }

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
      include: {
        course: {
          include: { _count: { select: { modules: true } } },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const data = await Promise.all(
      enrollments.map(async (e) => ({
        ...e,
        progressPercent: await getCourseProgressPercent(e.courseId, userId),
      }))
    );

    return { success: true as const, data };
  } catch (error) {
    console.error("getEnrolledCourses:", error);
    return { success: false as const, error: "Failed to load courses" };
  }
}

export async function bulkEnroll(courseId: string, userIds: string[], type: EnrollmentType = "BULK") {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true, slug: true },
    });

    await prisma.$transaction(
      userIds.map((userId) =>
        prisma.enrollment.upsert({
          where: { courseId_userId: { courseId, userId } },
          create: { courseId, userId, type, status: "ACTIVE" },
          update: { status: "ACTIVE", type },
        })
      )
    );
    revalidatePath("/portal/student/courses");
    if (course) {
      for (const userId of userIds) {
        await sendLmsNotification(
          userId,
          "Course enrollment",
          `You have been enrolled in "${course.title}".`,
          `/portal/student/courses/${course.slug}`,
          "SUCCESS"
        );
      }
    }
    return { success: true as const };
  } catch (error) {
    console.error("bulkEnroll:", error);
    return { success: false as const, error: "Failed to bulk enroll" };
  }
}

export async function checkEnrollment(courseId: string, userId: string) {
  return isEnrolled(courseId, userId);
}

export async function isEligibleForModuleQuiz(moduleId: string, userId: string) {
  return moduleLessonsComplete(moduleId, userId);
}

export async function isEligibleForFinalExam(courseId: string, userId: string) {
  const enrolled = await isEnrolled(courseId, userId);
  if (!enrolled) return false;

  const modules = await prisma.module.findMany({
    where: { courseId },
    select: { id: true },
  });

  for (const mod of modules) {
    const complete = await moduleLessonsComplete(mod.id, userId);
    if (!complete) return false;

    const quiz = await prisma.quiz.findFirst({
      where: { moduleId: mod.id, type: "MODULE_QUIZ" },
    });
    if (quiz) {
      const passed = await prisma.quizAttempt.findFirst({
        where: { quizId: quiz.id, userId, passed: true },
      });
      if (!passed) return false;
    }
  }
  return true;
}

export async function enrollStudentAsPaid(courseId: string, userId: string) {
  return enrollStudent(courseId, userId, "PAYMENT");
}

export async function selfEnrollInCourse(courseSlug: string) {
  const auth = await requireAuthAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const role = getRoleFromSession(auth.session);
  if (role !== "STUDENT") {
    return { success: false as const, error: "Only students can self-enroll" };
  }

  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course?.isPublished) {
    return { success: false as const, error: "Course is not available" };
  }

  return enrollStudent(course.id, auth.session.user!.id!, "MANUAL");
}

export async function listPublishedCoursesCatalog(search?: string) {
  try {
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
      },
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        difficulty: true,
        thumbnail: true,
        estimatedDuration: true,
        requiresPayment: true,
        pricePKR: true,
        tags: true,
        _count: { select: { modules: true, enrollments: true } },
      },
    });
    return { success: true as const, data: courses };
  } catch (error) {
    console.error("listPublishedCoursesCatalog:", error);
    return { success: false as const, error: "Failed to load courses" };
  }
}

export async function getStudentCatalogCourses(userId: string) {
  const auth = await requireAuthAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const catalog = await listPublishedCoursesCatalog();
  if (!catalog.success) return catalog;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
    select: { courseId: true, status: true },
  });
  const enrolledMap = new Map(enrollments.map((e) => [e.courseId, e.status]));

  const withMeta = await Promise.all(
    catalog.data.map(async (course) => {
      const prereqs = await checkPrerequisitesMet(course.id, userId);
      return {
        ...course,
        enrolled: enrolledMap.has(course.id),
        enrollmentStatus: enrolledMap.get(course.id) ?? null,
        prerequisitesMet: prereqs.met,
        missingPrerequisites: prereqs.missing,
      };
    })
  );

  return { success: true as const, data: withMeta };
}

export async function listStudentsForEnroll(search?: string) {
  const auth = await requireRoleAction("SUPER_ADMIN", "TEACHER");
  if (!auth.ok) return { success: false as const, error: auth.error };

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      status: "ACTIVE",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: { id: true, name: true, email: true },
    take: 50,
    orderBy: { name: "asc" },
  });

  return { success: true as const, data: students };
}
