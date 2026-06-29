"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";

export default function CourseListActions({
  courseId,
  isPublished,
  publishAction,
  deleteAction,
}: {
  courseId: string;
  isPublished: boolean;
  publishAction: (id: string, publish: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="lms-table-actions">
      <Link
        href={`/portal/admin/courses/${courseId}`}
        className="lms-icon-btn"
        aria-label="Edit course"
        title="Edit course"
      >
        <Pencil className="w-4 h-4" />
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await publishAction(courseId, !isPublished);
            router.refresh();
          })
        }
        className="lms-icon-btn"
        aria-label={isPublished ? "Unpublish course" : "Publish course"}
        title={isPublished ? "Unpublish" : "Publish"}
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this course? This cannot be undone.")) return;
          startTransition(async () => {
            const res = await deleteAction(courseId);
            if (!res.success) alert(res.error);
            router.refresh();
          });
        }}
        className="lms-icon-btn lms-icon-btn--danger"
        aria-label="Delete course"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
