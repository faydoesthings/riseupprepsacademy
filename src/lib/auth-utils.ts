import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import type { UserRole } from "@/lib/roles";

export type { UserRole } from "@/lib/roles";

export function getRoleFromSession(session: Session | null): UserRole | undefined {
  return (session?.user as { role?: UserRole } | undefined)?.role;
}

export function validatePassword(password: string): string | null {
  if (!password || password.length < 8) {
    return "Password must be at least 8 characters";
  }
  return null;
}

export function parseAttendanceDate(dateString: string): Date {
  const [y, m, d] = dateString.split("-").map(Number);
  if (!y || !m || !d) {
    throw new Error("Invalid date");
  }
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

export function attendanceDateRange(dateString: string) {
  const [y, m, d] = dateString.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
  return { date: parseAttendanceDate(dateString), start, end };
}

type AuthResult =
  | { ok: true; session: Session }
  | { ok: false; error: string };

export async function requireAuthAction(): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "You must be signed in to perform this action" };
  }
  return { ok: true, session };
}

export async function requireRoleAction(...roles: UserRole[]): Promise<AuthResult> {
  const authResult = await requireAuthAction();
  if (!authResult.ok) return authResult;

  const role = getRoleFromSession(authResult.session);
  if (!role || !roles.includes(role)) {
    return { ok: false, error: "You do not have permission for this action" };
  }
  return authResult;
}

export async function requireAdminAction(): Promise<AuthResult> {
  return requireRoleAction("SUPER_ADMIN");
}
