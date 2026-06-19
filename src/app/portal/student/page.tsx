import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStudentDashboardData } from "@/lib/stats";
import StudentDashboard from "@/components/portal/student/StudentDashboard";
import StudentProfileMissing from "@/components/portal/student/StudentProfileMissing";
import { formatPKR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const data = await getStudentDashboardData(session.user.email);
  if (!data) return <StudentProfileMissing />;

  const { student, periods, attendancePct, avgPct, latestFee, pendingAssignments, recentResults } =
    data;
  const firstName = student.user.name.split(" ")[0];
  const classLabel = student.class
    ? `${student.class.grade}${student.class.section ? ` · ${student.class.section}` : ""}`
    : null;

  return (
    <StudentDashboard
      firstName={firstName}
      classLabel={classLabel}
      periods={periods}
      attendancePct={attendancePct}
      avgPct={avgPct}
      pendingCount={pendingAssignments.length}
      feeStatus={latestFee?.status === "CONFIRMED" ? "Paid" : "Pending"}
      feeAmount={latestFee ? formatPKR(latestFee.amount) : null}
      pendingAssignments={pendingAssignments}
      recentResults={recentResults}
    />
  );
}
