import prisma from "@/lib/prisma";

export async function getDonorForPortal(email: string) {
  return prisma.donor.findFirst({
    where: { user: { email } },
    include: {
      user: true,
      donations: { orderBy: { createdAt: "desc" } },
      sponsoredStudents: {
        include: { user: true, class: true },
        orderBy: { user: { name: "asc" } },
      },
    },
  });
}

function monthStartFromAdmission(admissionDate: Date) {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  return admissionDate > monthStart ? admissionDate : monthStart;
}

export type SponsoredStudentProgressMetrics = {
  attendancePct: number | null;
  avgExamPct: number | null;
  recentExamCount: number;
  assignmentsDue: number;
  assignmentsSubmitted: number;
};

export async function getSponsoredStudentProgressMetrics(
  studentId: string,
  admissionDate: Date,
  classId: string | null
): Promise<SponsoredStudentProgressMetrics> {
  const from = monthStartFromAdmission(admissionDate);

  const [attendances, examResults, submissions, assignmentsDue] = await Promise.all([
    prisma.attendance.findMany({
      where: { studentId, date: { gte: from } },
      select: { status: true },
    }),
    prisma.examResult.findMany({
      where: { studentId },
      select: { marks: true, totalMarks: true, percentage: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.submission.count({ where: { studentId } }),
    classId
      ? prisma.assignment.count({
          where: { classId, dueDate: { lte: new Date() } },
        })
      : Promise.resolve(0),
  ]);

  const present = attendances.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
  const attendancePct =
    attendances.length > 0 ? Math.round((present / attendances.length) * 100) : null;

  const avgExamPct =
    examResults.length > 0
      ? Math.round(
          examResults.reduce(
            (sum, r) =>
              sum + (r.percentage ?? (r.totalMarks > 0 ? (r.marks / r.totalMarks) * 100 : 0)),
            0
          ) / examResults.length
        )
      : null;

  return {
    attendancePct,
    avgExamPct,
    recentExamCount: examResults.length,
    assignmentsDue,
    assignmentsSubmitted: submissions,
  };
}

export type SponsoredStudentSummary = {
  id: string;
  name: string;
  classLabel: string | null;
  rollNumber: string | null;
  status: string;
  admissionDate: Date;
  metrics: SponsoredStudentProgressMetrics;
};

export async function getSponsoredStudentSummaries(
  donorId: string
): Promise<SponsoredStudentSummary[]> {
  const students = await prisma.student.findMany({
    where: { sponsorId: donorId },
    include: { user: true, class: true },
    orderBy: { user: { name: "asc" } },
  });

  return Promise.all(
    students.map(async (student) => {
      const metrics = await getSponsoredStudentProgressMetrics(
        student.id,
        student.admissionDate,
        student.classId
      );
      return {
        id: student.id,
        name: student.user.name,
        classLabel: student.class
          ? `${student.class.grade}${student.class.section ? ` · ${student.class.section}` : ""}`
          : null,
        rollNumber: student.rollNumber,
        status: student.status,
        admissionDate: student.admissionDate,
        metrics,
      };
    })
  );
}

export async function getSponsoredStudentDetail(donorId: string, studentId: string) {
  const from = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const student = await prisma.student.findFirst({
    where: { id: studentId, sponsorId: donorId },
    include: {
      user: { select: { name: true } },
      class: true,
      attendances: {
        where: { date: { gte: from } },
        include: { period: { include: { subject: true } } },
        orderBy: { date: "desc" },
        take: 30,
      },
      examResults: {
        include: { subject: true },
        orderBy: { createdAt: "desc" },
      },
      submissions: {
        include: {
          assignment: { include: { subject: true } },
        },
        orderBy: { submittedAt: "desc" },
        take: 20,
      },
    },
  });

  if (!student) return null;

  const admissionFrom = monthStartFromAdmission(student.admissionDate);
  const monthAttendances = student.attendances.filter((a) => a.date >= admissionFrom);
  const present = monthAttendances.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE"
  ).length;
  const attendancePct =
    monthAttendances.length > 0 ? Math.round((present / monthAttendances.length) * 100) : null;

  const avgExamPct =
    student.examResults.length > 0
      ? Math.round(
          student.examResults.reduce(
            (sum, r) =>
              sum + (r.percentage ?? (r.totalMarks > 0 ? (r.marks / r.totalMarks) * 100 : 0)),
            0
          ) / student.examResults.length
        )
      : null;

  const assignmentsDue = student.classId
    ? await prisma.assignment.count({
        where: { classId: student.classId, dueDate: { lte: new Date() } },
      })
    : 0;

  const gradedCount = student.submissions.filter((s) => s.grade != null || s.marks != null).length;

  return {
    student,
    attendancePct,
    avgExamPct,
    assignmentsDue,
    assignmentsSubmitted: student.submissions.length,
    gradedCount,
    monthAttendances,
  };
}

export function donorConfirmedTotal(
  donations: { amount: number; status: string }[],
  legacyTotal = 0
) {
  const fromRecords = donations
    .filter((d) => d.status === "CONFIRMED")
    .reduce((sum, d) => sum + d.amount, 0);
  return fromRecords + legacyTotal;
}

export function donationStatusBadge(status: string) {
  if (status === "CONFIRMED") return "badge-success";
  if (status === "PENDING") return "badge-warning";
  return "badge-error";
}

export function formatDonationType(type: string) {
  return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
