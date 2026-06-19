import PortalListPage from "@/components/portal/PortalListPage";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import ListPageError from "@/components/ui/ListPageError";
import MaterialFormModal from "@/components/portal/forms/MaterialFormModal";
import TeacherProfileMissing from "@/components/portal/TeacherProfileMissing";
import { ExternalLink, FileText, Video, Link as LinkIcon, File } from "lucide-react";
import { requirePortalRole } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "PDF":
      return <FileText className="w-4 h-4 text-[#C0392B]" aria-hidden />;
    case "VIDEO":
      return <Video className="w-4 h-4 text-[#0ABFBC]" aria-hidden />;
    case "LINK":
      return <LinkIcon className="w-4 h-4 text-[#F78C1F]" aria-hidden />;
    default:
      return <File className="w-4 h-4 text-white/40" aria-hidden />;
  }
}

export default async function TeacherMaterialsPage() {
  try {
    const session = await requirePortalRole("TEACHER");
    const teacher = await prisma.teacher.findFirst({
      where: { user: { email: session.user?.email ?? "" } },
      include: { classes: true, subjects: true },
    });

    if (!teacher) return <TeacherProfileMissing />;

    const materials = await prisma.material.findMany({
      where: { uploadedBy: teacher.id },
      include: { class: true, subject: true },
      orderBy: { createdAt: "desc" },
    });

    return (
      <PortalListPage>
        <PageHeader
          eyebrow="Teacher portal"
          title="Study materials"
          description="Upload and manage learning resources for your assigned classes."
          customAction={
            <MaterialFormModal
              classes={teacher.classes}
              subjects={teacher.subjects}
              teacherId={teacher.id}
            />
          }
        />

        <DataTable
          headers={["Type", "Title", "Class", "Subject", "Chapter", "Link", "Date"]}
          isEmpty={materials.length === 0}
          emptyMessage="No materials uploaded yet."
        >
          {materials.map((m) => (
            <tr key={m.id}>
              <td>
                <TypeIcon type={m.type} />
              </td>
              <td className="font-bold text-white text-sm">{m.title}</td>
              <td>
                <span className="badge badge-info text-xs">{m.class.grade}</span>
              </td>
              <td className="text-sm text-white/60">{m.subject.name}</td>
              <td className="text-sm text-white/40">{m.chapter || "—"}</td>
              <td>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#F78C1F] hover:underline flex items-center gap-1 text-sm"
                >
                  View <ExternalLink className="w-3 h-3" aria-hidden />
                </a>
              </td>
              <td className="text-sm text-white/40">{m.createdAt.toLocaleDateString()}</td>
            </tr>
          ))}
        </DataTable>
      </PortalListPage>
    );
  } catch (error) {
    console.error("TeacherMaterialsPage:", error);
    return (
      <PortalListPage>
        <ListPageError />
      </PortalListPage>
    );
  }
}
