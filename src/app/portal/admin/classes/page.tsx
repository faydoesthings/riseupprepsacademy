import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import ClassFormModal from "@/components/portal/forms/ClassFormModal";
import { requirePortalRole } from "@/lib/portal-auth";
import {
  buildClassListWhere,
  paginationArgs,
  parsePageParam,
  parseSearchParam,
} from "@/lib/list-query";

export const dynamic = "force-dynamic";

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  try {
    await requirePortalRole("SUPER_ADMIN");
    const search = parseSearchParam(searchParams.search);
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);
    const where = buildClassListWhere(search);

    const [teachers, classes, total] = await Promise.all([
      prisma.teacher.findMany({
        include: { user: true },
        where: { status: "ACTIVE" },
      }),
      prisma.class.findMany({
        where,
        include: {
          teacher: { include: { user: true } },
          _count: { select: { students: true, subjects: true } },
        },
        orderBy: [{ grade: "asc" }, { section: "asc" }],
        skip,
        take,
      }),
      prisma.class.count({ where }),
    ]);

    return (
      <div className="animate-fade-in-up">
        <PageHeader
          title="Class Configuration"
          description="Manage academic classes, sections, and assigned class teachers."
          customAction={<ClassFormModal teachers={teachers} />}
          searchPlaceholder="Search classes..."
        />

        <DataTable
          headers={[
            "Class Name",
            "Grade & Section",
            "Class Teacher",
            "Students",
            "Subjects",
            "Academic Year",
          ]}
          isEmpty={classes.length === 0}
          emptyMessage={search ? "No classes match your search." : "No classes configured yet."}
        >
          {classes.map((cls) => (
            <tr key={cls.id} className="hover:bg-white/[0.03] transition-colors">
              <td className="px-6 py-4">
                <span className="font-bold text-white">{cls.name}</span>
              </td>
              <td className="px-6 py-4">
                <span className="badge badge-info">
                  {cls.grade} {cls.section ? `- ${cls.section}` : ""}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                {cls.teacher ? (
                  <span className="font-medium text-white/80">{cls.teacher.user.name}</span>
                ) : (
                  <span className="text-white/40 italic">Unassigned</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-white/80">
                {cls._count.students}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-white/80">
                {cls._count.subjects}
              </td>
              <td className="px-6 py-4 text-sm text-white/60">{cls.academicYear}</td>
            </tr>
          ))}
        </DataTable>

        <Pagination
          page={page}
          total={total}
          basePath="/portal/admin/classes"
          searchParams={{ search: search || undefined }}
        />
      </div>
    );
  } catch (error) {
    console.error("ClassesPage:", error);
    return (
      <div className="animate-fade-in-up">
        <ListPageError />
      </div>
    );
  }
}
