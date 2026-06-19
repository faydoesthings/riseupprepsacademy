import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import SubjectFormModal from "@/components/portal/forms/SubjectFormModal";
import { requirePortalRole } from "@/lib/portal-auth";
import {
  buildSubjectListWhere,
  paginationArgs,
  parsePageParam,
  parseSearchParam,
} from "@/lib/list-query";

export const dynamic = "force-dynamic";

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  try {
    await requirePortalRole("SUPER_ADMIN");
    const search = parseSearchParam(searchParams.search);
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);
    const where = buildSubjectListWhere(search);

    const [classes, teachers, subjects, total] = await Promise.all([
      prisma.class.findMany({
        orderBy: [{ grade: "asc" }, { section: "asc" }],
      }),
      prisma.teacher.findMany({
        include: { user: true },
        where: { status: "ACTIVE" },
      }),
      prisma.subject.findMany({
        where,
        include: { class: true, teacher: { include: { user: true } } },
        orderBy: { name: "asc" },
        skip,
        take,
      }),
      prisma.subject.count({ where }),
    ]);

    return (
      <PortalListPage>
        <PageHeader
          title="Subjects"
          description="Manage all academic subjects and assign them to classes and teachers."
          customAction={<SubjectFormModal classes={classes} teachers={teachers} />}
          searchPlaceholder="Search subjects..."
        />

        <DataTable
          headers={["Subject Name", "Assigned Class", "Subject Teacher"]}
          isEmpty={subjects.length === 0}
          emptyMessage={
            search ? "No subjects match your search." : "No subjects created yet."
          }
        >
          {subjects.map((subject) => (
            <tr key={subject.id} className="hover:bg-white/[0.03] transition-colors">
              <td className="px-6 py-4">
                <span className="font-bold text-white">{subject.name}</span>
              </td>
              <td className="px-6 py-4">
                <span className="badge badge-info">
                  {subject.class.grade}{" "}
                  {subject.class.section ? `- ${subject.class.section}` : ""}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                {subject.teacher ? (
                  <span className="font-medium text-white/80">{subject.teacher.user.name}</span>
                ) : (
                  <span className="text-white/40 italic">Unassigned</span>
                )}
              </td>
            </tr>
          ))}
        </DataTable>

        <Pagination
          page={page}
          total={total}
          basePath="/portal/admin/subjects"
          searchParams={{ search: search || undefined }}
        />
      </PortalListPage>
    );
  } catch (error) {
    console.error("SubjectsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
