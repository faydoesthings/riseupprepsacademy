import prisma from "@/lib/prisma";

export async function getStudentForPortal(email: string) {
  return prisma.student.findFirst({
    where: { user: { email } },
    include: {
      user: true,
      class: { include: { subjects: { orderBy: { name: "asc" } } } },
    },
  });
}

export function parseSubjectParam(subject?: string) {
  return subject && subject !== "all" ? subject : undefined;
}
