"use client";

import { useState } from "react";
import { X, Loader2, DollarSign } from "lucide-react";
import { processPayroll } from "@/app/actions/finance-actions";
import toast from "react-hot-toast";
import type { TeacherOption } from "@/lib/form-types";

export default function PayrollFormModal({ teachers }: { teachers: TeacherOption[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await processPayroll(formData);
    if (result.success) {
      toast.success("Payroll generated successfully");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to generate payroll");
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary py-2">
        <DollarSign className="w-4 h-4" /> Process Salary
      </button>

      {isOpen && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-panel max-w-md mx-4">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-white">Process salary</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg p-1.5 transition-all" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={onSubmit} className="modal-body space-y-5">
              <div>
                <label className="form-label-caps">Select teacher <span className="text-[#F78C1F]">*</span></label>
                <select name="teacherId" required className="form-select">
                  <option value="">Select...</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.user.name} (Base: Rs {t.salary})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-caps">Month <span className="text-[#F78C1F]">*</span></label>
                  <select name="month" required className="form-select">
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label-caps">Year <span className="text-[#F78C1F]">*</span></label>
                  <input type="number" name="year" required defaultValue={new Date().getFullYear()} className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label-caps">Amount to pay (PKR) <span className="text-[#F78C1F]">*</span></label>
                <input type="number" name="amount" required min="1" className="form-input" />
              </div>
              <div className="modal-footer !px-0 !pb-0 !border-0">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline flex-1 min-h-[44px]">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 min-h-[44px] disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Process payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
