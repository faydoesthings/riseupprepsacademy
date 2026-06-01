"use client";

import { useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import { createFeeStructure } from "@/app/actions/finance-actions";
import toast from "react-hot-toast";

export default function FeeStructureFormModal({ classes }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await createFeeStructure(formData);
    if (result.success) {
      toast.success("Fee structure created successfully");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to create fee structure");
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-navy py-2">
        <Plus className="w-4 h-4" /> Create Fee Plan
      </button>

      {isOpen && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-panel max-w-md mx-4">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-white">New fee structure</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg p-1.5 transition-all" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={onSubmit} className="modal-body space-y-5">
              <div>
                <label className="form-label-caps">Plan name <span className="text-[#F78C1F]">*</span></label>
                <input type="text" name="name" required placeholder="e.g. Standard Tuition Grade 8" className="form-input" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-caps">Amount (PKR) <span className="text-[#F78C1F]">*</span></label>
                  <input type="number" name="amount" required min="0" className="form-input" />
                </div>
                <div>
                  <label className="form-label-caps">Frequency <span className="text-[#F78C1F]">*</span></label>
                  <select name="frequency" required className="form-select">
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUAL">Annual</option>
                    <option value="ONE_TIME">One Time</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label-caps">Assign to class</label>
                <select name="classId" className="form-select">
                  <option value="">Apply to specific student later</option>
                  {classes.map((c: any) => <option key={c.id} value={c.id}>{c.grade} {c.section}</option>)}
                </select>
                <p className="text-xs text-white/30 mt-1">If a class is selected, this fee applies to all students in that class.</p>
              </div>
              <div className="modal-footer !px-0 !pb-0 !border-0">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline flex-1 min-h-[44px]">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 min-h-[44px] disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
