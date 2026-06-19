"use client";

import { useState } from "react";
import { X, Loader2, Heart } from "lucide-react";
import { createDonation } from "@/app/actions/donor-actions";
import toast from "react-hot-toast";
import type { DonorOption } from "@/lib/form-types";

export default function DonationFormModal({ donors }: { donors: DonorOption[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await createDonation(formData);
    if (result.success) {
      toast.success("Donation recorded successfully");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to record donation");
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary py-2.5 min-h-[44px]">
        <Heart className="w-4 h-4" /> Log donation
      </button>

      {isOpen && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-panel max-w-md mx-4">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-white">Record donation</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg p-1.5 transition-all" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="modal-body space-y-5">
              <div>
                <label className="form-label-caps">Select donor <span className="text-[#F78C1F]">*</span></label>
                <select name="donorId" required className="form-select">
                  <option value="">Choose...</option>
                  {donors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-caps">Amount (PKR) <span className="text-[#F78C1F]">*</span></label>
                  <input type="number" name="amount" required min="1" className="form-input" />
                </div>
                <div>
                  <label className="form-label-caps">Payment method</label>
                  <select name="method" className="form-select" defaultValue="CASH">
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank transfer</option>
                    <option value="JAZZCASH">JazzCash</option>
                    <option value="EASYPAISA">EasyPaisa</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label-caps">Donation type</label>
                <select name="type" className="form-select" defaultValue="ONE_TIME">
                  <option value="ONE_TIME">One time</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="ANNUAL">Annual</option>
                </select>
              </div>
              <div>
                <label className="form-label-caps">Note (optional)</label>
                <input type="text" name="note" className="form-input" placeholder="Any additional notes..." />
              </div>
              <div className="modal-footer !px-0 !pb-0 !border-0">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline flex-1 min-h-[44px]">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 min-h-[44px] disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save donation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
