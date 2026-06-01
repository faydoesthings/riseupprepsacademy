export type UserRole =
  | "SUPER_ADMIN"
  | "ACCOUNTANT"
  | "TEACHER"
  | "STUDENT"
  | "DONOR";

export function getDashboardPath(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/portal/admin";
    case "ACCOUNTANT":
      return "/portal/accountant";
    case "TEACHER":
      return "/portal/teacher";
    case "STUDENT":
      return "/portal/student";
    case "DONOR":
      return "/portal/donor";
    default:
      return "/portal";
  }
}

export function getPortalPrefixForRole(role: string): string {
  return getDashboardPath(role);
}
