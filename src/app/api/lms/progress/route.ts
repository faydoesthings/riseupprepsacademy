import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { markLessonProgress } from "@/app/actions/lms/lesson-actions";
import { isEnrolled } from "@/lib/lms/progress";
import { z } from "zod";

const bodySchema = z.object({
  lessonId: z.string(),
  percentage: z.number().min(0).max(100),
  timeSpent: z.number().int().min(0),
  completed: z.boolean().optional(),
  started: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { lessonId, percentage, timeSpent, completed, started } = parsed.data;
  const userId = session.user.id;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      isPreview: true,
      module: { select: { courseId: true } },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const courseId = lesson.module.courseId;
  const enrolled = await isEnrolled(courseId, userId);
  const role = (session.user as { role?: string }).role;

  if (!lesson.isPreview && !enrolled && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await markLessonProgress(lessonId, userId, {
    percentage,
    timeSpent,
    completed,
    started,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: result.data });
}
