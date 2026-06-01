"use client";

import { useState } from "react";
import { X, Loader2, UserPlus } from "lucide-react";
import { createSponsorship } from "@/app/actions/donor-actions";
import toast from "react-hot-toast";

export default function SponsorshipFormModal({ donors, students }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await createSponsorship(formData);
    if (result.success) {
      toast.success("Sponsorship linked successfully");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to create sponsorship");
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary py-2.5 min-h-[44px]">
        <UserPlus className="w-4 h-4" /> Match sponsorship
      </button>

      {isOpen && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-panel max-w-md mx-4">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-white">Link sponsor & student</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg p-1.5 transition-all" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={onSubmit} className="modal-body space-y-5">
              <div>
                <label className="form-label-caps">Select donor / sponsor <span className="text-[#F78C1F]">*</span></label>
                <select name="donorId" required className="form-select">
                  <option value="">Choose sponsor...</option>
                  {donors.map((d: any) => <option key={d.id} value={d.id}>{d.user.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label-caps">Select student <span className="text-[#F78C1F]">*</span></label>
                <select name="studentId" required className="form-select">
                  <option value="">Choose student to sponsor...</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.user.name} ({s.class?.grade || "No class"})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label-caps">Monthly amount (PKR) <span className="text-[#F78C1F]">*</span></label>
                <input type="number" name="amount" required min="1" className="form-input" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-caps">Start date <span className="text-[#F78C1F]">*</span></label>
                  <input type="date" name="startDate" required defaultValue={new Date().toISOString().split("T")[0]} className="form-input" />
                </div>
                <div>
                  <label className="form-label-caps">End date (optional)</label>
                  <input type="date" name="endDate" className="form-input" />
                </div>
              </div>
              <div className="modal-footer !px-0 !pb-0 !border-0">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline flex-1 min-h-[44px]">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 min-h-[44px] disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
