"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Plus } from "lucide-react";
import { createClass } from "@/app/actions/class-actions";
import toast from "react-hot-toast";

interface Teacher {
  id: string;
  user: { name: string };
}

export default function ClassFormModal({ teachers }: { teachers: Teacher[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createClass(formData);

    if (result.success) {
      toast.success("Class saved successfully");
      setIsOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to save class");
      setError(result.error || "An error occurred");
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary py-2.5 min-h-[44px] whitespace-nowrap">
        <Plus className="w-4 h-4" />
        Add class
      </button>

      {isOpen && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-panel max-w-md mx-4">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-white">Create new class</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg p-1.5 transition-all" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="modal-body space-y-5">
              {error && <div className="alert-error">{error}</div>}

              <div>
                <label className="form-label-caps">Class name <span className="text-[#F78C1F]">*</span></label>
                <input type="text" name="name" required placeholder="e.g. Grade 8 - Alpha" className="form-input" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-caps">Grade <span className="text-[#F78C1F]">*</span></label>
                  <input type="text" name="grade" required placeholder="e.g. Grade 8" className="form-input" />
                </div>
                <div>
                  <label className="form-label-caps">Section</label>
                  <input type="text" name="section" placeholder="e.g. Alpha" className="form-input" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-caps">Academic year <span className="text-[#F78C1F]">*</span></label>
                  <input type="text" name="academicYear" required defaultValue="2026-2027" className="form-input" />
                </div>
                <div>
                  <label className="form-label-caps">Class teacher</label>
                  <select name="teacherId" className="form-select">
                    <option value="">Unassigned</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer !px-0 !pb-0 !border-0">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline flex-1 min-h-[44px]">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 min-h-[44px] disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
