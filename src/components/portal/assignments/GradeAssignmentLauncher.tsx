"use client";

import { useRouter } from "next/navigation";
import GradeSubmissionsPanel from "@/components/portal/assignments/GradeSubmissionsPanel";

export default function GradeAssignmentLauncher({
  assignmentId,
  assignmentTitle,
  submissions,
}: {
  assignmentId: string;
  assignmentTitle: string;
  submissions: Array<{
    id: string;
    studentName: string;
    fileUrl: string | null;
    marks: number | null;
    grade: string | null;
    totalMarks: number | null;
  }>;
}) {
  const router = useRouter();

  return (
    <GradeSubmissionsPanel
      assignmentId={assignmentId}
      assignmentTitle={assignmentTitle}
      submissions={submissions}
      onClose={() => router.push("/portal/teacher/assignments")}
    />
  );
}
