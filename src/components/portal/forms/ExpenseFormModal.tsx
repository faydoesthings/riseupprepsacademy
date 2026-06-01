"use client";

import { useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import { createExpense } from "@/app/actions/finance-actions";
import toast from "react-hot-toast";

export default function ExpenseFormModal({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await createExpense(formData, userId);
    if (result.success) {
      toast.success("Expense recorded successfully");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to record expense");
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary py-2.5 min-h-[44px]">
        <Plus className="w-4 h-4" /> Log expense
      </button>

      {isOpen && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-panel max-w-md mx-4">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-white">Record expense</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg p-1.5 transition-all" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="modal-body space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-caps">Category <span className="text-[#F78C1F]">*</span></label>
                  <select name="category" required className="form-select">
                    <option value="UTILITIES">Utilities</option>
                    <option value="RENT">Rent</option>
                    <option value="SUPPLIES">Supplies</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="EVENTS">Events</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label-caps">Amount (PKR) <span className="text-[#F78C1F]">*</span></label>
                  <input type="number" name="amount" required min="1" className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label-caps">Description</label>
                <input type="text" name="description" placeholder="e.g. Electricity bill" className="form-input" />
              </div>
              <div>
                <label className="form-label-caps">Date <span className="text-[#F78C1F]">*</span></label>
                <input type="date" name="date" required defaultValue={new Date().toISOString().split("T")[0]} className="form-input" />
              </div>
              <div className="modal-footer !px-0 !pb-0 !border-0">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline flex-1 min-h-[44px]">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 min-h-[44px] disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
