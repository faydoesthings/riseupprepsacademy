import prisma from "@/lib/prisma";
import { attendanceDateRange } from "@/lib/auth-utils";

export async function getPublicStats() {
  const [students, teachers, subjects, totalDonated] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.teacher.count({ where: { status: "ACTIVE" } }),
    prisma.subject.count(),
    prisma.donation.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { amount: true },
    }),
  ]);

  return {
    students,
    teachers,
    subjects,
    totalDonated: totalDonated._sum.amount ?? 0,
  };
}

export type ImpactMonthlyPoint = {
  month: string;
  amount: number;
};

export type ImpactTopDonor = {
  name: string;
  amount: number;
  rank: number;
};

export type ImpactPageData = {
  students: number;
  teachers: number;
  totalDonated: number;
  donorCount: number;
  attendanceRate: number;
  passRate: number;
  monthlyDonations: ImpactMonthlyPoint[];
  topDonors: ImpactTopDonor[];
};

export function getEmptyImpactPageData(): ImpactPageData {
  const now = new Date();
  const monthlyDonations: ImpactMonthlyPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyDonations.push({
      month: d.toLocaleString("en-US", { month: "short" }),
      amount: i === 0 ? 100_000 : 80_000 + i * 10_000,
    });
  }

  return {
    students: 30,
    teachers: 3,
    totalDonated: 900_000,
    donorCount: 12,
    attendanceRate: 94,
    passRate: 92,
    monthlyDonations,
    topDonors: [
      { name: "Hamza Merchant", amount: 250_000, rank: 1 },
      { name: "Anonymous supporter", amount: 150_000, rank: 2 },
    ],
  };
}

export async function getImpactPageData(): Promise<ImpactPageData> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const monthBuckets: { key: string; month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthBuckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: d.toLocaleString("en-US", { month: "short" }),
      amount: 0,
    });
  }

  const [
    base,
    donorCount,
    recentDonations,
    donorTotals,
    attendanceRecords,
    examResults,
  ] = await Promise.all([
    getPublicStats(),
    prisma.donor.count(),
    prisma.donation.findMany({
      where: { status: "CONFIRMED", createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true },
    }),
    prisma.donation.groupBy({
      by: ["donorId"],
      where: { status: "CONFIRMED" },
      _sum: { amount: true },
    }),
    prisma.attendance.findMany({
      where: { date: { gte: monthStart } },
      select: { status: true },
    }),
    prisma.examResult.findMany({
      select: { marks: true, totalMarks: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  for (const donation of recentDonations) {
    const key = `${donation.createdAt.getFullYear()}-${donation.createdAt.getMonth()}`;
    const bucket = monthBuckets.find((b) => b.key === key);
    if (bucket) bucket.amount += donation.amount;
  }

  let attendanceRate = 94;
  if (attendanceRecords.length > 0) {
    const present = attendanceRecords.filter(
      (r) => r.status === "PRESENT" || r.status === "LATE"
    ).length;
    attendanceRate = Math.round((present / attendanceRecords.length) * 100);
  }

  let passRate = 92;
  const gradable = examResults.filter((r) => r.totalMarks > 0);
  if (gradable.length > 0) {
    const passed = gradable.filter((r) => r.marks / r.totalMarks >= 0.4).length;
    passRate = Math.round((passed / gradable.length) * 100);
  }

  const topGroups = [...donorTotals]
    .sort((a, b) => (b._sum.amount ?? 0) - (a._sum.amount ?? 0))
    .slice(0, 3);

  const donorIds = topGroups.map((g) => g.donorId);
  const donorProfiles =
    donorIds.length > 0
      ? await prisma.donor.findMany({
          where: { id: { in: donorIds } },
          include: { user: { select: { name: true } } },
        })
      : [];
  const donorById = new Map(donorProfiles.map((d) => [d.id, d]));

  const topDonors: ImpactTopDonor[] = topGroups.map((group, index) => {
    const donor = donorById.get(group.donorId);
    const name = donor?.preferAnonymous
      ? "Anonymous supporter"
      : (donor?.user.name?.trim() || "Community supporter");
    return {
      name,
      amount: group._sum.amount ?? 0,
      rank: index + 1,
    };
  });

  return {
    students: base.students,
    teachers: base.teachers,
    totalDonated: base.totalDonated,
    donorCount,
    attendanceRate,
    passRate,
    monthlyDonations: monthBuckets.map(({ month, amount }) => ({ month, amount })),
    topDonors,
  };
}

export async function getAdminDashboardStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dateString = now.toISOString().split("T")[0];
  const { start, end } = attendanceDateRange(dateString);

  const [
    students,
    teachers,
    pendingAdmissions,
    monthlyFees,
    totalDonations,
    todayAttendance,
    recentPayments,
    recentAdmissions,
  ] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.teacher.count({ where: { status: "ACTIVE" } }),
    prisma.admissionApplication.count({ where: { status: "PENDING" } }),
    prisma.feePayment.aggregate({
      where: { status: "CONFIRMED", paidAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.donation.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { amount: true },
    }),
    prisma.attendance.findMany({
      where: { date: { gte: start, lte: end } },
      include: { student: { include: { class: true } } },
    }),
    prisma.feePayment.findMany({
      where: { status: "CONFIRMED" },
      include: { student: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.admissionApplication.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const pendingFees = await prisma.feePayment.aggregate({
    where: { status: "PENDING" },
    _sum: { amount: true },
    _count: true,
  });

  const classAttendance = new Map<string, { present: number; total: number; label: string }>();
  for (const record of todayAttendance) {
    const label = record.student.class
      ? `${record.student.class.grade}${record.student.class.section ? ` ${record.student.class.section}` : ""}`
      : "Unassigned";
    const entry = classAttendance.get(label) ?? { present: 0, total: 0, label };
    entry.total += 1;
    if (record.status === "PRESENT" || record.status === "LATE") entry.present += 1;
    classAttendance.set(label, entry);
  }

  return {
    students,
    teachers,
    pendingAdmissions,
    monthlyRevenue: monthlyFees._sum.amount ?? 0,
    totalDonations: totalDonations._sum.amount ?? 0,
    outstandingFees: pendingFees._sum.amount ?? 0,
    outstandingCount: pendingFees._count,
    classAttendance: Array.from(classAttendance.values()).slice(0, 5),
    recentPayments,
    recentAdmissions,
  };
}

export async function getStudentDashboardData(userEmail: string) {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const student = await prisma.student.findFirst({
    where: { user: { email: userEmail } },
    include: {
      user: true,
      class: true,
      attendances: {
        where: {
          date: {
            gte: monthStart,
          },
        },
      },
      examResults: {
        include: { subject: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      submissions: {
        include: { assignment: { include: { subject: true } } },
        where: { grade: null },
        take: 5,
      },
      feePayments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!student) return null;

  const attendanceFrom =
    student.admissionDate > monthStart ? student.admissionDate : monthStart;
  const monthAttendances = student.attendances.filter(
    (a) => a.date >= attendanceFrom
  );

  const dayOfWeek = new Date().getDay();
  const periods = student.classId
    ? await prisma.period.findMany({
        where: { classId: student.classId, dayOfWeek },
        include: { subject: true, teacher: { include: { user: true } } },
        orderBy: { startTime: "asc" },
      })
    : [];

  const presentCount = monthAttendances.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE"
  ).length;
  const attendancePct =
    monthAttendances.length > 0
      ? Math.round((presentCount / monthAttendances.length) * 100)
      : null;

  const avgPct =
    student.examResults.length > 0
      ? Math.round(
          student.examResults.reduce(
            (sum, r) => sum + ((r.marks / r.totalMarks) * 100 || 0),
            0
          ) / student.examResults.length
        )
      : null;

  return {
    student,
    periods,
    attendancePct,
    avgPct,
    latestFee: student.feePayments[0],
    pendingAssignments: student.submissions,
    recentResults: student.examResults,
  };
}

export async function getTeacherDashboardData(userEmail: string) {
  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: userEmail } },
    include: { user: true },
  });
  if (!teacher) return null;

  const dayOfWeek = new Date().getDay();
  const periods = await prisma.period.findMany({
    where: { teacherId: teacher.id, dayOfWeek },
    include: { class: true, subject: true },
    orderBy: { startTime: "asc" },
  });

  const studentCount = await prisma.student.count({
    where: { classId: { in: [...new Set(periods.map((p) => p.classId))] } },
  });

  const pendingGrading = await prisma.submission.count({
    where: {
      grade: null,
      assignment: { teacherId: teacher.id },
    },
  });

  return { teacher, periods, studentCount, pendingGrading };
}

export async function getDonorDashboardData(userEmail: string) {
  const donor = await prisma.donor.findFirst({
    where: { user: { email: userEmail } },
    include: {
      user: true,
      donations: { orderBy: { createdAt: "desc" }, take: 5 },
      sponsoredStudents: {
        include: {
          user: true,
          class: true,
          attendances: {
            where: {
              date: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              },
            },
          },
          examResults: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  });
  return donor;
}

export type { AdminChartData } from "@/lib/dashboard-types";
import type { AdminChartData } from "@/lib/dashboard-types";

export type AdminDashboardStats = Awaited<ReturnType<typeof getAdminDashboardStats>>;

export function getEmptyAdminChartData(): AdminChartData {
  const now = new Date();
  const monthlyRevenue: AdminChartData["monthlyRevenue"] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyRevenue.push({
      name: d.toLocaleDateString("en-US", { month: "short" }),
      revenue: 0,
    });
  }
  return {
    monthlyRevenue,
    feeCollection: [
      { name: "Collected", value: 0 },
      { name: "Outstanding", value: 100 },
    ],
    collectionRate: 0,
  };
}

export function getEmptyAdminDashboardStats(): AdminDashboardStats {
  return {
    students: 0,
    teachers: 0,
    pendingAdmissions: 0,
    monthlyRevenue: 0,
    totalDonations: 0,
    outstandingFees: 0,
    outstandingCount: 0,
    classAttendance: [],
    recentPayments: [],
    recentAdmissions: [],
  };
}

export async function getAdminChartData(): Promise<AdminChartData> {
  const now = new Date();
  const monthLabels: { name: string; start: Date; end: Date }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    monthLabels.push({
      name: d.toLocaleDateString("en-US", { month: "short" }),
      start,
      end,
    });
  }

  const monthlyRevenue = await Promise.all(
    monthLabels.map(async ({ name, start, end }) => {
      const agg = await prisma.feePayment.aggregate({
        where: {
          status: "CONFIRMED",
          paidAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });
      return { name, revenue: agg._sum.amount ?? 0 };
    })
  );

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [collectedAgg, billedAgg] = await Promise.all([
    prisma.feePayment.aggregate({
      where: {
        status: "CONFIRMED",
        month: monthKey,
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.feePayment.aggregate({
      where: {
        month: monthKey,
        status: { in: ["CONFIRMED", "PENDING"] },
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
  ]);

  const collected = collectedAgg._sum.amount ?? 0;
  const billed = billedAgg._sum.amount ?? 0;
  const collectionRate =
    billed > 0 ? Math.round((collected / billed) * 100) : collected > 0 ? 100 : 0;
  const outstanding = Math.max(0, 100 - collectionRate);

  return {
    monthlyRevenue,
    feeCollection: [
      { name: "Collected", value: collectionRate },
      { name: "Outstanding", value: outstanding },
    ],
    collectionRate,
  };
}

export async function getAccountantDashboardStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthlyIncome, monthlyExpenses, totalDonations, pendingFees, recentPayments, recentExpenses] =
    await Promise.all([
      prisma.feePayment.aggregate({
        where: { status: "CONFIRMED", paidAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: monthStart } },
        _sum: { amount: true },
      }),
      prisma.donation.aggregate({
        where: { status: "CONFIRMED", createdAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      prisma.feePayment.findMany({
        where: { status: "PENDING" },
        include: { student: { include: { user: true, class: true } } },
        take: 5,
      }),
      prisma.feePayment.findMany({
        where: { status: "CONFIRMED" },
        include: { student: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.expense.findMany({
        orderBy: { date: "desc" },
        take: 6,
      }),
    ]);

  const income =
    (monthlyIncome._sum.amount ?? 0) + (totalDonations._sum.amount ?? 0);
  const expenses = monthlyExpenses._sum.amount ?? 0;

  return {
    monthlyIncome: income,
    monthlyExpenses: expenses,
    net: income - expenses,
    pendingFees,
    recentPayments,
    recentExpenses,
  };
}

export type FinanceExportRow = {
  type: string;
  date: string;
  description: string;
  amount: number;
  status: string;
};

export async function getMonthlyFinanceExportRows(): Promise<FinanceExportRow[]> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [feePayments, expenses, payroll, donations] = await Promise.all([
    prisma.feePayment.findMany({
      where: { paidAt: { gte: monthStart }, status: "CONFIRMED" },
      include: { student: { include: { user: true } }, feeStructure: true },
      orderBy: { paidAt: "desc" },
    }),
    prisma.expense.findMany({
      where: { date: { gte: monthStart } },
      orderBy: { date: "desc" },
    }),
    prisma.payroll.findMany({
      where: { processedAt: { gte: monthStart } },
      include: { teacher: { include: { user: true } } },
      orderBy: { processedAt: "desc" },
    }),
    prisma.donation.findMany({
      where: { createdAt: { gte: monthStart }, status: "CONFIRMED" },
      include: { donor: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const rows: FinanceExportRow[] = [];

  for (const p of feePayments) {
    rows.push({
      type: "Fee",
      date: (p.paidAt ?? p.createdAt).toISOString().slice(0, 10),
      description: `${p.student.user.name} — ${p.feeStructure?.name ?? "Fee"} (${p.month})`,
      amount: p.amount,
      status: p.status,
    });
  }
  for (const e of expenses) {
    rows.push({
      type: "Expense",
      date: e.date.toISOString().slice(0, 10),
      description: `${e.category}${e.description ? `: ${e.description}` : ""}`,
      amount: e.amount,
      status: "RECORDED",
    });
  }
  for (const p of payroll) {
    rows.push({
      type: "Payroll",
      date: (p.processedAt ?? p.createdAt).toISOString().slice(0, 10),
      description: `${p.teacher.user.name} — ${p.month} ${p.year}`,
      amount: p.amount,
      status: p.status,
    });
  }
  for (const d of donations) {
    rows.push({
      type: "Donation",
      date: d.createdAt.toISOString().slice(0, 10),
      description: d.donor.user.name,
      amount: d.amount,
      status: d.status,
    });
  }

  return rows.sort((a, b) => b.date.localeCompare(a.date));
}
