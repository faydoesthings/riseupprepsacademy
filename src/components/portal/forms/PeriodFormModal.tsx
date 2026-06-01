"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Plus } from "lucide-react";
import { createPeriod } from "@/app/actions/timetable-actions";
import toast from "react-hot-toast";

interface Subject {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  user: { name: string };
}

interface ClassData {
  id: string;
  grade: string;
  section: string | null;
  subjects: Subject[];
}

export default function PeriodFormModal({
  classes,
  teachers,
}: {
  classes: ClassData[];
  teachers: Teacher[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const availableSubjects = selectedClass ? selectedClass.subjects : [];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createPeriod(formData);

    if (result.success) {
      toast.success("Period scheduled successfully");
      setIsOpen(false);
      setSelectedClassId("");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to schedule period");
      setError(result.error || "An error occurred");
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary py-2.5 min-h-[44px] whitespace-nowrap">
        <Plus className="w-4 h-4" />
        Schedule period
      </button>

      {isOpen && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-panel max-w-md mx-4">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-white">Schedule new period</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg p-1.5 transition-all" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="modal-body space-y-5">
              {error && <div className="alert-error">{error}</div>}

              <div>
                <label className="form-label-caps">Select class <span className="text-[#F78C1F]">*</span></label>
                <select
                  name="classId"
                  required
                  className="form-select"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                >
                  <option value="">Choose class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.grade} {c.section ? `- ${c.section}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label-caps">Subject <span className="text-[#F78C1F]">*</span></label>
                <select name="subjectId" required className="form-select" disabled={!selectedClassId}>
                  <option value="">Select a subject</option>
                  {availableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label-caps">Teacher <span className="text-[#F78C1F]">*</span></label>
                <select name="teacherId" required className="form-select">
                  <option value="">Assign teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.user.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-caps">Day of week <span className="text-[#F78C1F]">*</span></label>
                  <select name="dayOfWeek" required className="form-select">
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
                <div>
                  <label className="form-label-caps">Time slot <span className="text-[#F78C1F]">*</span></label>
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <input type="time" name="startTime" required className="form-input px-2" />
                    <span>to</span>
                    <input type="time" name="endTime" required className="form-input px-2" />
                  </div>
                </div>
              </div>

              <div className="modal-footer !px-0 !pb-0 !border-0">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline flex-1 min-h-[44px]">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 min-h-[44px] disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
