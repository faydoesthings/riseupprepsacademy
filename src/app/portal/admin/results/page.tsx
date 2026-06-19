import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import { requirePortalRole } from "@/lib/portal-auth";
import { paginationArgs, parsePageParam } from "@/lib/list-query";

export const dynamic = "force-dynamic";

export default async function AdminResultsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  try {
    await requirePortalRole("SUPER_ADMIN");
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);

    const [results, total] = await Promise.all([
      prisma.examResult.findMany({
        include: {
          student: { include: { user: true, class: true } },
          subject: { include: { teacher: { include: { user: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.examResult.count(),
    ]);

    return (
      <PortalListPage>
        <PageHeader
          title="Exam results"
          description="Academy-wide exam marks and grades across all classes and subjects."
        />

        <DataTable
          headers={["Exam", "Student", "Class", "Subject", "Teacher", "Score", "Grade"]}
          isEmpty={results.length === 0}
          emptyMessage="No exam results recorded yet."
        >
          {results.map((r) => (
            <tr key={r.id}>
              <td className="font-bold text-white text-sm">{r.examName}</td>
              <td className="text-sm text-white">{r.student.user.name}</td>
              <td className="text-sm text-white/50">
                {r.student.class?.grade} {r.student.class?.section}
              </td>
              <td className="text-sm text-white/70">{r.subject.name}</td>
              <td className="text-sm text-white/60">
                {r.subject.teacher?.user.name ?? "—"}
              </td>
              <td className="text-sm text-white">
                {r.marks} <span className="text-white/30">/ {r.totalMarks}</span>
              </td>
              <td>
                <span className="badge badge-success">{r.grade}</span>
              </td>
            </tr>
          ))}
        </DataTable>

        <Pagination page={page} total={total} basePath="/portal/admin/results" />
      </PortalListPage>
    );
  } catch (error) {
    console.error("AdminResultsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
