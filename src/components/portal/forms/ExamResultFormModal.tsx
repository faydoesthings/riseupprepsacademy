"use client";

import { useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import { createExamResult } from "@/app/actions/academic-actions";
import toast from "react-hot-toast";
import type { StudentOption, SubjectOption } from "@/lib/form-types";

export default function ExamResultFormModal({
  students,
  subjects,
}: {
  students: StudentOption[];
  subjects: SubjectOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await createExamResult(formData);
    if (result.success) {
      toast.success("Result recorded successfully");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to record result");
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary py-2.5 min-h-[44px]">
        <Plus className="w-4 h-4" /> Log exam result
      </button>

      {isOpen && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-panel max-w-md mx-4">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-white">Log result</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg p-1.5 transition-all" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={onSubmit} className="modal-body space-y-5">
              <div>
                <label className="form-label-caps">Exam name <span className="text-[#F78C1F]">*</span></label>
                <input type="text" name="examName" placeholder="e.g. Mid-term 2026" required className="form-input" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-caps">Student <span className="text-[#F78C1F]">*</span></label>
                  <select name="studentId" required className="form-select">
                    <option value="">Select student</option>
                    {students.map((s) => <option key={s.id} value={s.id}>{s.user.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label-caps">Subject <span className="text-[#F78C1F]">*</span></label>
                  <select name="subjectId" required className="form-select">
                    <option value="">Select subject</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-caps">Obtained marks <span className="text-[#F78C1F]">*</span></label>
                  <input type="number" name="marks" required className="form-input" />
                </div>
                <div>
                  <label className="form-label-caps">Total marks <span className="text-[#F78C1F]">*</span></label>
                  <input type="number" name="totalMarks" required defaultValue="100" className="form-input" />
                </div>
              </div>
              <div className="modal-footer !px-0 !pb-0 !border-0">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline flex-1 min-h-[44px]">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 min-h-[44px] disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save result"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
