"use client";

import { useState } from "react";
import { X, Loader2, UploadCloud } from "lucide-react";
import { submitAssignment } from "@/app/actions/academic-actions";
import toast from "react-hot-toast";

export default function SubmissionFormModal({
  assignmentId,
  studentId,
}: {
  assignmentId: string;
  studentId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("assignmentId", assignmentId);
    const result = await submitAssignment(formData, studentId);
    if (result.success) {
      toast.success("Assignment submitted successfully");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to submit assignment");
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary py-2 min-h-[44px] text-xs">
        <UploadCloud className="w-3 h-3" /> Submit work
      </button>

      {isOpen && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-panel max-w-md mx-4">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-white">Submit assignment</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg p-1.5 transition-all" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={onSubmit} className="modal-body space-y-5">
              <div>
                <label className="form-label-caps">Work link (Google Doc, PDF URL) <span className="text-[#F78C1F]">*</span></label>
                <input type="url" name="fileUrl" required placeholder="https://" className="form-input" />
              </div>
              <div className="modal-footer !px-0 !pb-0 !border-0">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline flex-1 min-h-[44px]">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 min-h-[44px] disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
