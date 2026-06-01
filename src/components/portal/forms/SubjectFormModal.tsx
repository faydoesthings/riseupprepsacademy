"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Plus } from "lucide-react";
import { createSubject } from "@/app/actions/subject-actions";
import toast from "react-hot-toast";

interface ClassType {
  id: string;
  grade: string;
  section: string | null;
}

interface Teacher {
  id: string;
  user: { name: string };
}

export default function SubjectFormModal({ classes, teachers }: { classes: ClassType[]; teachers: Teacher[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createSubject(formData);

    if (result.success) {
      toast.success("Subject saved successfully");
      setIsOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to save subject");
      setError(result.error || "An error occurred");
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary py-2.5 min-h-[44px] whitespace-nowrap">
        <Plus className="w-4 h-4" />
        Add subject
      </button>

      {isOpen && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-panel max-w-md mx-4">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-white">Create new subject</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg p-1.5 transition-all" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="modal-body space-y-5">
              {error && <div className="alert-error">{error}</div>}

              <div>
                <label className="form-label-caps">Subject name <span className="text-[#F78C1F]">*</span></label>
                <input type="text" name="name" required placeholder="e.g. Advanced mathematics" className="form-input" />
              </div>

              <div>
                <label className="form-label-caps">Assign to class <span className="text-[#F78C1F]">*</span></label>
                <select name="classId" required className="form-select">
                  <option value="">Select a class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.grade} {c.section ? `- ${c.section}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label-caps">Subject teacher</label>
                <select name="teacherId" className="form-select">
                  <option value="">Unassigned</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.user.name}</option>
                  ))}
                </select>
              </div>

              <div className="modal-footer !px-0 !pb-0 !border-0">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline flex-1 min-h-[44px]">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 min-h-[44px] disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
