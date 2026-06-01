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
  const student = await prisma.student.findFirst({
    where: { user: { email: userEmail } },
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

  const dayOfWeek = new Date().getDay();
  const periods = student.classId
    ? await prisma.period.findMany({
        where: { classId: student.classId, dayOfWeek },
        include: { subject: true, teacher: { include: { user: true } } },
        orderBy: { startTime: "asc" },
      })
    : [];

  const presentCount = student.attendances.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE"
  ).length;
  const attendancePct =
    student.attendances.length > 0
      ? Math.round((presentCount / student.attendances.length) * 100)
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
