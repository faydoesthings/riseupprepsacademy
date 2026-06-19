"use client";

import { useState } from "react";
import { X, Loader2, DollarSign } from "lucide-react";
import { collectFee } from "@/app/actions/finance-actions";
import toast from "react-hot-toast";
import type { StudentOption, FeeStructureOption } from "@/lib/form-types";

export default function FeePaymentFormModal({
  students,
  feeStructures,
}: {
  students: StudentOption[];
  feeStructures: FeeStructureOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await collectFee(formData);
    if (result.success) {
      toast.success("Payment recorded successfully");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to record payment");
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary py-2 px-4 shadow-md hover:shadow-lg transition-shadow">
        <DollarSign className="w-4 h-4" /> Collect Payment
      </button>

      {isOpen && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-panel max-w-md mx-4">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-white">Collect fee</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg p-1.5 transition-all" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={onSubmit} className="modal-body space-y-5">
              <div>
                <label className="form-label-caps">Select student <span className="text-[#F78C1F]">*</span></label>
                <select name="studentId" required className="form-select">
                  <option value="">Search Student...</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.user.name} ({s.class?.grade || 'No Class'})</option>)}
                </select>
              </div>
              <div>
                <label className="form-label-caps">Fee structure <span className="text-[#F78C1F]">*</span></label>
                <select name="feeStructureId" required className="form-select">
                  <option value="">Select Fee Plan</option>
                  {feeStructures.map((f) => <option key={f.id} value={f.id}>{f.name} - Rs {f.amount}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-caps">Amount paid <span className="text-[#F78C1F]">*</span></label>
                  <input type="number" name="amount" required min="1" className="form-input" />
                </div>
                <div>
                  <label className="form-label-caps">Billing month</label>
                  <input type="month" name="month" defaultValue={new Date().toISOString().slice(0,7)} className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label-caps">Payment method <span className="text-[#F78C1F]">*</span></label>
                <select name="method" required className="form-select">
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="JAZZCASH">JazzCash</option>
                  <option value="EASYPAISA">EasyPaisa</option>
                </select>
              </div>
              <div className="modal-footer !px-0 !pb-0 !border-0">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline flex-1 min-h-[44px]">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 min-h-[44px] disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
