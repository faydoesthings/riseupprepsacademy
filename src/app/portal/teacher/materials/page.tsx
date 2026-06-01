import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import MaterialFormModal from "@/components/portal/forms/MaterialFormModal";
import { ExternalLink, FileText, Video, Link as LinkIcon, File } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "PDF": return <FileText className="w-4 h-4 text-red-500" />;
    case "VIDEO": return <Video className="w-4 h-4 text-blue-500" />;
    case "LINK": return <LinkIcon className="w-4 h-4 text-green-500" />;
    default: return <File className="w-4 h-4 text-gray-500" />;
  }
};

export default async function TeacherMaterialsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email } },
    include: { classes: true, subjects: true }
  });

  if (!teacher) return <div className="p-8 text-center text-red-600">Unauthorized</div>;

  const materials = await prisma.material.findMany({
    where: { uploadedBy: teacher.id },
    include: { class: true, subject: true },
    orderBy: { createdAt: "desc" }
  });

  const classes = await prisma.class.findMany({ orderBy: { grade: "asc" } });
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Study Materials"
        description="Upload and manage learning resources for your assigned classes."
        customAction={<MaterialFormModal classes={classes} subjects={subjects} teacherId={teacher.id} />}
      />

      <DataTable headers={["Type", "Title", "Class", "Subject", "Chapter", "Link", "Date"]} isEmpty={materials.length === 0}>
        {materials.map(m => (
          <tr key={m.id} className="hover:bg-gray-50">
            <td className="px-6 py-4"><TypeIcon type={m.type} /></td>
            <td className="px-6 py-4 font-bold text-[#05335C]">{m.title}</td>
            <td className="px-6 py-4 text-sm"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{m.class.grade}</span></td>
            <td className="px-6 py-4 text-sm text-gray-600">{m.subject.name}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{m.chapter || "-"}</td>
            <td className="px-6 py-4">
              <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                View <ExternalLink className="w-3 h-3" />
              </a>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">{m.createdAt.toLocaleDateString()}</td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
