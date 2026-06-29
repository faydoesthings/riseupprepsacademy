import type { Prisma } from "@prisma/client";

export const PAGE_SIZE = 20;

export function parseSearchParam(
  value: string | string[] | undefined
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, 100);
}

export function parsePageParam(
  value: string | string[] | undefined
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = parseInt(raw ?? "1", 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

export function paginationArgs(page: number) {
  const safePage = Math.max(1, page);
  return {
    page: safePage,
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  };
}

export function totalPages(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

/** Case-insensitive substring match (PostgreSQL) */
export function containsInsensitive(
  term: string
): { contains: string; mode: Prisma.QueryMode } {
  return { contains: term, mode: "insensitive" };
}

export function buildStudentListWhere(
  search: string
): Prisma.StudentWhereInput {
  if (!search) return {};
  return {
    OR: [
      { user: { name: containsInsensitive(search) } },
      { user: { email: containsInsensitive(search) } },
      { rollNumber: containsInsensitive(search) },
      { parentName: containsInsensitive(search) },
    ],
  };
}

export function buildTeacherListWhere(
  search: string
): Prisma.TeacherWhereInput {
  if (!search) return {};
  return {
    OR: [
      { user: { name: containsInsensitive(search) } },
      { user: { email: containsInsensitive(search) } },
      { specialization: containsInsensitive(search) },
      { subjects: { some: { name: containsInsensitive(search) } } },
    ],
  };
}

export function buildSubjectListWhere(
  search: string
): Prisma.SubjectWhereInput {
  if (!search) return {};
  return {
    OR: [
      { name: containsInsensitive(search) },
      { class: { grade: containsInsensitive(search) } },
      { class: { section: containsInsensitive(search) } },
      { teacher: { user: { name: containsInsensitive(search) } } },
    ],
  };
}

export function buildAttendanceListWhere(
  search: string,
  dateStart: Date,
  dateEnd: Date
): Prisma.AttendanceWhereInput {
  const base: Prisma.AttendanceWhereInput = {
    date: { gte: dateStart, lte: dateEnd },
  };
  if (!search) return base;
  return {
    AND: [
      base,
      {
        OR: [
          { student: { user: { name: containsInsensitive(search) } } },
          { period: { subject: { name: containsInsensitive(search) } } },
        ],
      },
    ],
  };
}

export function buildFeePaymentListWhere(
  search: string
): Prisma.FeePaymentWhereInput {
  if (!search) return {};
  return {
    OR: [
      { student: { user: { name: containsInsensitive(search) } } },
      { feeStructure: { name: containsInsensitive(search) } },
      { month: containsInsensitive(search) },
    ],
  };
}

export function buildClassListWhere(search: string): Prisma.ClassWhereInput {
  if (!search) return {};
  return {
    OR: [
      { name: containsInsensitive(search) },
      { grade: containsInsensitive(search) },
      { section: containsInsensitive(search) },
      { academicYear: containsInsensitive(search) },
      { teacher: { user: { name: containsInsensitive(search) } } },
    ],
  };
}

export function buildExpenseListWhere(search: string): Prisma.ExpenseWhereInput {
  if (!search) return {};
  return {
    OR: [
      { category: containsInsensitive(search) },
      { description: containsInsensitive(search) },
    ],
  };
}

export function buildPayrollListWhere(search: string): Prisma.PayrollWhereInput {
  if (!search) return {};
  return {
    OR: [
      { month: containsInsensitive(search) },
      { teacher: { user: { name: containsInsensitive(search) } } },
    ],
  };
}

export function buildRegistrationListWhere(
  search: string
): Prisma.RegistrationRequestWhereInput {
  if (!search) return {};
  return {
    OR: [
      { name: containsInsensitive(search) },
      { email: containsInsensitive(search) },
      { phone: containsInsensitive(search) },
      { roleRequested: containsInsensitive(search) },
    ],
  };
}

export function buildAdmissionListWhere(
  search: string
): Prisma.AdmissionApplicationWhereInput {
  if (!search) return {};
  return {
    OR: [
      { studentName: containsInsensitive(search) },
      { parentName: containsInsensitive(search) },
      { parentPhone: containsInsensitive(search) },
      { gradeApplying: containsInsensitive(search) },
    ],
  };
}

export function buildDonationListWhere(
  search: string
): Prisma.DonationWhereInput {
  if (!search) return {};
  return {
    OR: [
      { donor: { user: { name: containsInsensitive(search) } } },
      { type: containsInsensitive(search) },
    ],
  };
}

export function parseDateRangeParams(params: {
  from?: string;
  to?: string;
}): { from: Date; to: Date; error?: string } {
  const today = new Date().toISOString().split("T")[0];
  const fromStr = params.from || today;
  const toStr = params.to || fromStr;

  const fromParts = fromStr.split("-").map(Number);
  const toParts = toStr.split("-").map(Number);
  if (fromParts.length !== 3 || toParts.length !== 3) {
    return {
      from: new Date(),
      to: new Date(),
      error: "Invalid date range",
    };
  }

  const from = new Date(
    Date.UTC(fromParts[0], fromParts[1] - 1, fromParts[2], 0, 0, 0, 0)
  );
  const to = new Date(
    Date.UTC(toParts[0], toParts[1] - 1, toParts[2], 23, 59, 59, 999)
  );

  if (from.getTime() > to.getTime()) {
    return { from, to, error: "Start date must be on or before end date" };
  }

  return { from, to };
}
