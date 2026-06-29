import prisma from "@/lib/prisma";

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function uniqueCourseSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugifyTitle(title) || "course";
  let slug = base;
  let suffix = 0;

  while (true) {
    const existing = await prisma.course.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return slug;
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}
