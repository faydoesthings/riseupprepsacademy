import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import ListPageError from "@/components/ui/ListPageError";
import StudentFormModal from "@/components/portal/forms/StudentFormModal";
import { requirePortalRole } from "@/lib/portal-auth";
import {
  buildStudentListWhere,
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
    case "SUSPENDED":
      return <span className="badge badge-warning">Suspended</span>;
    default:
      return <span className="badge badge-navy">{status}</span>;
  }
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  try {
    await requirePortalRole("SUPER_ADMIN");
    const search = parseSearchParam(searchParams.search);
    const page = parsePageParam(searchParams.page);
    const { skip, take } = paginationArgs(page);
    const where = buildStudentListWhere(search);

    const [classes, students, total] = await Promise.all([
      prisma.class.findMany({
        orderBy: [{ grade: "asc" }, { section: "asc" }],
      }),
      prisma.student.findMany({
        where,
        include: { user: true, class: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.student.count({ where }),
    ]);

    return (
      <div className="animate-fade-in-up">
        <PageHeader
          title="Students Management"
          description="View and manage all enrolled students across all classes."
          searchPlaceholder="Search students by name, email, or roll no..."
          customAction={<StudentFormModal classes={classes} />}
        />

        <DataTable
          headers={["Student", "Roll No", "Class", "Admission Date", "Status"]}
          isEmpty={students.length === 0}
          emptyMessage={
            search
              ? "No students match your search."
              : "No students enrolled yet."
          }
        >
          {students.map((student) => {
            const initials = student.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <tr key={student.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#05335C] to-[#0A4A82] flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{student.user.name}</p>
                      <p className="text-xs text-white/40">{student.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-white/80">
                  {student.rollNumber || "N/A"}
                </td>
                <td className="px-6 py-4">
                  {student.class ? (
                    <span className="badge badge-info">
                      {student.class.grade}{" "}
                      {student.class.section ? `- ${student.class.section}` : ""}
                    </span>
                  ) : (
                    <span className="text-sm text-white/40">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-white/80">
                  {student.admissionDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-6 py-4">{getStatusBadge(student.status)}</td>
              </tr>
            );
          })}
        </DataTable>

        <Pagination
          page={page}
          total={total}
          basePath="/portal/admin/students"
          searchParams={{ search: search || undefined }}
        />
      </div>
    );
  } catch (error) {
    console.error("StudentsPage:", error);
    return (
      <div className="animate-fade-in-up">
        <ListPageError />
      </div>
    );
  }
}
