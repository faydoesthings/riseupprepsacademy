"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAction, requireAuthAction } from "@/lib/auth-utils";
import { sendLmsNotification } from "@/lib/lms/notifications";

function generateVerificationCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function uniqueCertificateNumber() {
  const year = new Date().getFullYear();
  const prefix = `RUP-${year}-`;
  const latest = await prisma.certificate.findFirst({
    where: { certificateNumber: { startsWith: prefix } },
    orderBy: { certificateNumber: "desc" },
    select: { certificateNumber: true },
  });
  const lastNum = latest ? parseInt(latest.certificateNumber.split("-").pop() ?? "0", 10) : 0;
  return `${prefix}${String(lastNum + 1).padStart(4, "0")}`;
}

export async function issueCertificate(
  courseId: string,
  userId: string,
  vivaSessionId?: string
) {
  try {
    const existing = await prisma.certificate.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    if (existing && !existing.revokedAt) {
      return { success: true as const, data: existing };
    }

    let verificationCode = generateVerificationCode();
    for (let i = 0; i < 5; i++) {
      const clash = await prisma.certificate.findUnique({ where: { verificationCode } });
      if (!clash) break;
      verificationCode = generateVerificationCode();
    }

    const certificateNumber = await uniqueCertificateNumber();

    const cert = await prisma.certificate.create({
      data: {
        courseId,
        userId,
        vivaSessionId: vivaSessionId ?? null,
        certificateNumber,
        verificationCode,
      },
    });

    await prisma.enrollment.updateMany({
      where: { courseId, userId, status: "ACTIVE" },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    revalidatePath("/portal/student/courses");
    revalidatePath("/portal/admin/certificates");

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true, slug: true },
    });
    if (course) {
      await sendLmsNotification(
        userId,
        "Certificate issued",
        `Your certificate for "${course.title}" is ready.`,
        `/portal/student/courses/${course.slug}/certificate`,
        "SUCCESS"
      );
    }

    return { success: true as const, data: cert };
  } catch (error) {
    console.error("issueCertificate:", error);
    return { success: false as const, error: "Failed to issue certificate" };
  }
}

export async function getCertificateForStudent(courseSlug: string, userId: string) {
  const auth = await requireAuthAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
    if (!course) return { success: false as const, error: "Course not found" };

    const cert = await prisma.certificate.findUnique({
      where: { courseId_userId: { courseId: course.id, userId } },
      include: {
        course: { select: { title: true, slug: true, difficulty: true } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!cert || cert.revokedAt) {
      return { success: false as const, error: "No certificate found for this course" };
    }

    return { success: true as const, data: cert };
  } catch (error) {
    console.error("getCertificateForStudent:", error);
    return { success: false as const, error: "Failed to load certificate" };
  }
}

export async function verifyCertificate(code: string) {
  try {
    const cert = await prisma.certificate.findUnique({
      where: { verificationCode: code.toUpperCase() },
      include: {
        course: { select: { title: true, difficulty: true } },
        user: { select: { name: true } },
      },
    });

    if (!cert) return { success: false as const, error: "Certificate not found" };
    if (cert.revokedAt) {
      return { success: false as const, error: "This certificate has been revoked" };
    }

    return {
      success: true as const,
      data: {
        certificateNumber: cert.certificateNumber,
        studentName: cert.user.name,
        courseTitle: cert.course.title,
        difficulty: cert.course.difficulty,
        issuedAt: cert.issuedAt,
        verificationCode: cert.verificationCode,
      },
    };
  } catch (error) {
    console.error("verifyCertificate:", error);
    return { success: false as const, error: "Verification failed" };
  }
}

export async function listCertificatesForAdmin(search?: string) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const certificates = await prisma.certificate.findMany({
      where: search
        ? {
            OR: [
              { certificateNumber: { contains: search, mode: "insensitive" } },
              { verificationCode: { contains: search, mode: "insensitive" } },
              { user: { name: { contains: search, mode: "insensitive" } } },
              { course: { title: { contains: search, mode: "insensitive" } } },
            ],
          }
        : undefined,
      orderBy: { issuedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
      take: 100,
    });
    return { success: true as const, data: certificates };
  } catch (error) {
    console.error("listCertificatesForAdmin:", error);
    return { success: false as const, error: "Failed to load certificates" };
  }
}

export async function revokeCertificate(certificateId: string) {
  const auth = await requireAdminAction();
  if (!auth.ok) return { success: false as const, error: auth.error };

  try {
    const cert = await prisma.certificate.update({
      where: { id: certificateId },
      data: { revokedAt: new Date() },
      include: { course: { select: { title: true } } },
    });

    await sendLmsNotification(
      cert.userId,
      "Certificate revoked",
      `Your certificate for "${cert.course.title}" has been revoked. Contact the academy for details.`,
      undefined,
      "WARNING"
    );

    revalidatePath("/portal/admin/certificates");
    return { success: true as const };
  } catch (error) {
    console.error("revokeCertificate:", error);
    return { success: false as const, error: "Failed to revoke certificate" };
  }
}
