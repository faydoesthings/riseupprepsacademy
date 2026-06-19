import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import TeacherFormModal from "@/components/portal/forms/TeacherFormModal";
import { requirePortalRole } from "@/lib/portal-auth";
import {
  buildTeacherListWhere,
  paginationArgs,
  parsePageParam,
  parseSearchParam,
} from "@/lib/list-query";

export const dynamic = "force-dynamic";

function getStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return <span className="badge badge-success">Active</span>;
    case "INACTIVE":
      return <span className="badge badge-error">Inactive</span>;
    case "ON_LEAVE":
      return <span className="badge badge-warning">On Leave</span>;
    default:
      return <span className="badge badge-navy">{status}</span>;
  }
}

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  try {
    await requirePortalRole("SUPER_ADMIN");
    const search = parseSearchParam(searchParams.search);
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);
    const where = buildTeacherListWhere(search);

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        include: { user: true, subjects: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.teacher.count({ where }),
    ]);

    return (
      <div className="animate-fade-in-up">
        <PageHeader
          title="Faculty Management"
          description="View and manage all academy teachers and their assigned subjects."
          customAction={<TeacherFormModal />}
          searchPlaceholder="Search by name or subject..."
        />

        <DataTable
          headers={["Teacher", "Specialization", "Subjects", "Joining Date", "Status"]}
          isEmpty={teachers.length === 0}
          emptyMessage={
            search ? "No teachers match your search." : "No teachers registered yet."
          }
        >
          {teachers.map((teacher) => {
            const initials = teacher.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <tr key={teacher.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F78C1F] to-[#F9A54E] flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{teacher.user.name}</p>
                      <p className="text-xs text-white/40">{teacher.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-white/70">
                  {teacher.specialization || "N/A"}
                </td>
                <td className="px-6 py-4">
                  {teacher.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.slice(0, 2).map((sub) => (
                        <span
                          key={sub.id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/60"
                        >
                          {sub.name}
                        </span>
                      ))}
                      {teacher.subjects.length > 2 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.03] text-white/30">
                          +{teacher.subjects.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-white/40">None</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-white/70">
                  {teacher.joiningDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-6 py-4">{getStatusBadge(teacher.status)}</td>
              </tr>
            );
          })}
        </DataTable>

        <Pagination
          page={page}
          total={total}
          basePath="/portal/admin/teachers"
          searchParams={{ search: search || undefined }}
        />
      </div>
    );
  } catch (error) {
    console.error("TeachersPage:", error);
    return (
      <div className="animate-fade-in-up">
        <ListPageError />
      </div>
    );
  }
}
