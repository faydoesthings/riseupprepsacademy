"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Plus } from "lucide-react";
import { createTeacher } from "@/app/actions/teacher-actions";
import toast from "react-hot-toast";

export default function TeacherFormModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createTeacher(formData);

    if (result.success) {
      toast.success("Teacher saved successfully");
      setIsOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to save teacher");
      setError(result.error || "An error occurred");
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary py-2.5 min-h-[44px] whitespace-nowrap">
        <Plus className="w-4 h-4" />
        Add teacher
      </button>

      {isOpen && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-panel max-w-lg mx-4">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-white">Register new teacher</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg p-1.5 transition-all" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body">
              <form id="teacher-form" onSubmit={onSubmit} className="space-y-5">
                {error && <div className="alert-error">{error}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label-caps">Full name <span className="text-[#F78C1F]">*</span></label>
                    <input type="text" name="name" required placeholder="John Doe" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label-caps">Email <span className="text-[#F78C1F]">*</span></label>
                    <input type="email" name="email" required placeholder="john@example.com" className="form-input" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label-caps">Phone</label>
                    <input type="text" name="phone" placeholder="+92 300 1234567" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label-caps">Base salary (PKR)</label>
                    <input type="number" name="salary" placeholder="50000" className="form-input" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label-caps">Specialization</label>
                    <input type="text" name="specialization" placeholder="e.g. Mathematics" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label-caps">Qualification</label>
                    <input type="text" name="qualification" placeholder="e.g. M.Sc Physics" className="form-input" />
                  </div>
                </div>

                <div>
                  <label className="form-label-caps">Initial password <span className="text-[#F78C1F]">*</span></label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    className="form-input"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-white/30 mt-1">Share this securely with the teacher for first login.</p>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline flex-1 min-h-[44px]">
                Cancel
              </button>
              <button type="submit" form="teacher-form" disabled={isSubmitting} className="btn btn-primary flex-1 min-h-[44px] disabled:opacity-70">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Register teacher"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
