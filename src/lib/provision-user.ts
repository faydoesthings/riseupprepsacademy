import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export function generateInitialPassword(): string {
  const code = crypto.randomInt(100000, 999999);
  return `RiseUp${code}!`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 32);
}

export async function resolveUniqueStudentEmail(
  db: DbClient,
  preferred: string | null | undefined,
  fallbackBase: string,
  uniqueSuffix: string
): Promise<string> {
  const normalizedPreferred = preferred?.trim().toLowerCase();
  if (normalizedPreferred) {
    const taken = await db.user.findUnique({ where: { email: normalizedPreferred } });
    if (!taken) return normalizedPreferred;
  }

  const base = slugify(fallbackBase) || "student";
  const suffix = uniqueSuffix.replace(/[^a-z0-9]/gi, "").slice(-8).toLowerCase() || crypto.randomInt(1000, 9999).toString();

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${base}.${suffix}${attempt > 0 ? `.${attempt}` : ""}@student.riseuppreps.local`;
    const taken = await db.user.findUnique({ where: { email: candidate } });
    if (!taken) return candidate;
  }

  return `${base}.${crypto.randomUUID().slice(0, 8)}@student.riseuppreps.local`;
}

export async function findClassIdForGrade(
  db: DbClient,
  gradeApplying: string | null | undefined
): Promise<string | null> {
  const grade = gradeApplying?.trim();
  if (!grade || grade === "Placement assessment") return null;

  const match = await db.class.findFirst({
    where: { grade },
    orderBy: { createdAt: "asc" },
  });
  return match?.id ?? null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
