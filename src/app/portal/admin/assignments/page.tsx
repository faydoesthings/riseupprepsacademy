import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import { ExternalLink, Users } from "lucide-react";
import { requirePortalRole } from "@/lib/portal-auth";
import { paginationArgs, parsePageParam } from "@/lib/list-query";

export const dynamic = "force-dynamic";

export default async function AdminAssignmentsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  try {
    await requirePortalRole("SUPER_ADMIN");
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        include: {
          class: true,
          subject: true,
          teacher: { include: { user: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.assignment.count(),
    ]);

    return (
      <PortalListPage>
        <PageHeader
          title="Assignments"
          description="Academy-wide view of homework and assignments across all teachers and classes."
        />

        <DataTable
          headers={["Title", "Teacher", "Class", "Subject", "Due", "Submissions", "Resource"]}
          isEmpty={assignments.length === 0}
          emptyMessage="No assignments have been created yet."
        >
          {assignments.map((a) => (
            <tr key={a.id}>
              <td>
                <span className="font-bold text-white block text-sm">{a.title}</span>
                {a.description && (
                  <span className="text-xs text-white/40 line-clamp-1">{a.description}</span>
                )}
              </td>
              <td className="text-sm text-white/80">{a.teacher.user.name}</td>
              <td>
                <span className="badge badge-info text-xs">
                  {a.class.grade}
                  {a.class.section ? ` ${a.class.section}` : ""}
                </span>
              </td>
              <td className="text-sm text-white/70">{a.subject.name}</td>
              <td className="text-sm text-white/60">{a.dueDate.toLocaleDateString()}</td>
              <td>
                <span className="flex items-center gap-1 text-sm font-semibold text-[#0ABFBC]">
                  <Users className="w-4 h-4" aria-hidden /> {a._count.submissions}
                </span>
              </td>
              <td>
                {a.fileUrl ? (
                  <a
                    href={a.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#F78C1F] hover:underline flex items-center gap-1 text-sm"
                  >
                    View <ExternalLink className="w-3 h-3" aria-hidden />
                  </a>
                ) : (
                  <span className="text-white/30 text-sm">—</span>
                )}
              </td>
            </tr>
          ))}
        </DataTable>

        <Pagination page={page} total={total} basePath="/portal/admin/assignments" />
      </PortalListPage>
    );
  } catch (error) {
    console.error("AdminAssignmentsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
