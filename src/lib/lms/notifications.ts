import prisma from "@/lib/prisma";

export async function sendLmsNotification(
  userId: string,
  title: string,
  message: string,
  link?: string,
  type = "INFO"
) {
  await prisma.notification.create({
    data: { userId, title, message, link: link ?? null, type },
  });
}

export async function notifyLmsStaff(
  title: string,
  message: string,
  link?: string,
  type = "INFO"
) {
  const staff = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "TEACHER"] }, status: "ACTIVE" },
    select: { id: true },
  });
  await prisma.notification.createMany({
    data: staff.map((u) => ({
      userId: u.id,
      title,
      message,
      link: link ?? null,
      type,
    })),
  });
}
