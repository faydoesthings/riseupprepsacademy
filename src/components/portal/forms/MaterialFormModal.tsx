"use client";

import { useState } from "react";
import { X, Loader2, Plus, Link as LinkIcon } from "lucide-react";
import { createMaterial } from "@/app/actions/academic-actions";
import toast from "react-hot-toast";
import type { ClassOption, SubjectOption } from "@/lib/form-types";

export default function MaterialFormModal({
  classes,
  subjects,
  teacherId,
}: {
  classes: ClassOption[];
  subjects: SubjectOption[];
  teacherId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await createMaterial(formData, teacherId);
    if (result.success) {
      toast.success("Material uploaded successfully");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to upload material");
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary py-2.5 min-h-[44px]">
        <Plus className="w-4 h-4" /> Add material
      </button>

      {isOpen && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-panel max-w-md mx-4">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-white">Upload material</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg p-1.5 transition-all" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={onSubmit} className="modal-body space-y-5">
              <div>
                <label className="form-label-caps">Title <span className="text-[#F78C1F]">*</span></label>
                <input type="text" name="title" required className="form-input" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-caps">Type <span className="text-[#F78C1F]">*</span></label>
                  <select name="type" required className="form-select">
                    <option value="PDF">PDF</option>
                    <option value="VIDEO">Video</option>
                    <option value="DOC">Document</option>
                    <option value="LINK">Link</option>
                  </select>
                </div>
                <div>
                  <label className="form-label-caps">Chapter</label>
                  <input type="text" name="chapter" className="form-input" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-caps">Class <span className="text-[#F78C1F]">*</span></label>
                  <select name="classId" required className="form-select">
                    <option value="">Select class</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.grade} {c.section}</option>)}
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
              <div>
                <label className="form-label-caps flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> URL / drive link <span className="text-[#F78C1F]">*</span>
                </label>
                <input type="url" name="url" required placeholder="https://" className="form-input" />
              </div>
              <div className="modal-footer !px-0 !pb-0 !border-0">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline flex-1 min-h-[44px]">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 min-h-[44px] disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
