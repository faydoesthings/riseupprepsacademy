import { auth } from "@/lib/auth";
import { getRoleFromSession, type UserRole } from "@/lib/auth-utils";
import { getDashboardPath } from "@/lib/roles";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

export async function requirePortalRole(
  ...roles: UserRole[]
): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = getRoleFromSession(session);
  if (!role || !roles.includes(role)) {
    redirect(getDashboardPath(role ?? ""));
  }

  const accountStatus = (session.user as { accountStatus?: string }).accountStatus;
  if (accountStatus && accountStatus !== "ACTIVE") {
    redirect("/login?error=AccountInactive");
  }

  const profileStatus = (session.user as { profileStatus?: string }).profileStatus;
  if (profileStatus && profileStatus !== "ACTIVE") {
    redirect("/login?error=ProfileInactive");
  }

  return session;
}
