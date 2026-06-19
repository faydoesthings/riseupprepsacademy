import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTeacherDashboardData } from "@/lib/stats";
import TeacherDashboard from "@/components/portal/teacher/TeacherDashboard";
import TeacherProfileMissing from "@/components/portal/TeacherProfileMissing";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const data = await getTeacherDashboardData(session.user.email);
  if (!data) return <TeacherProfileMissing />;

  const { teacher, periods, studentCount, pendingGrading } = data;
  const firstName = teacher.user.name.split(" ")[0];

  return (
    <TeacherDashboard
      firstName={firstName}
      specialization={teacher.specialization}
      periods={periods}
      studentCount={studentCount}
      pendingGrading={pendingGrading}
    />
  );
}
