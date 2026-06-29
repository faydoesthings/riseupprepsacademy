import prisma from "@/lib/prisma";

export async function checkPrerequisitesMet(
  courseId: string,
  userId: string
): Promise<{ met: boolean; missing: string[] }> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { prerequisites: true },
  });

  const prereqIds = (course?.prerequisites as string[] | null) ?? [];
  if (prereqIds.length === 0) return { met: true, missing: [] };

  const missing: string[] = [];
  for (const prereqId of prereqIds) {
    const completed = await prisma.enrollment.findFirst({
      where: { courseId: prereqId, userId, status: "COMPLETED" },
    });
    if (!completed) {
      const prereq = await prisma.course.findUnique({
        where: { id: prereqId },
        select: { title: true },
      });
      missing.push(prereq?.title ?? "Required course");
    }
  }

  return { met: missing.length === 0, missing };
}
