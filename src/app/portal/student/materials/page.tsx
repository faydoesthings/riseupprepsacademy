import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import { ExternalLink, FileText, Video, Link as LinkIcon, File } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "PDF": return <FileText className="w-5 h-5 text-red-500" />;
    case "VIDEO": return <Video className="w-5 h-5 text-blue-500" />;
    case "LINK": return <LinkIcon className="w-5 h-5 text-green-500" />;
    default: return <File className="w-5 h-5 text-gray-500" />;
  }
};

export default async function StudentMaterialsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const student = await prisma.student.findFirst({
    where: { user: { email: session.user.email } },
    include: { class: true }
  });

  if (!student || !student.classId) return <div className="p-8 text-center text-red-600">You must be assigned to a class to view materials.</div>;

  const materials = await prisma.material.findMany({
    where: { classId: student.classId },
    include: { subject: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Study Materials"
        description={`View and download resources for ${student.class?.grade} ${student.class?.section || ''}.`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map(m => (
          <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="block card-elevated p-6 hover:border-[#05335C]/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TypeIcon type={m.type} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {m.type}
              </span>
            </div>
            <h3 className="font-bold text-[#05335C] mb-1 line-clamp-2">{m.title}</h3>
            <p className="text-sm font-medium text-[#F78C1F] mb-3">{m.subject.name}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 mt-auto">
              <span>{m.chapter ? `Chapter: ${m.chapter}` : 'General Resource'}</span>
              <span className="flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                Open <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </a>
        ))}
        
        {materials.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No Materials Yet</h3>
            <p className="text-gray-500">Your teachers haven't uploaded any resources for your class.</p>
          </div>
        )}
      </div>
    </div>
  );
}
