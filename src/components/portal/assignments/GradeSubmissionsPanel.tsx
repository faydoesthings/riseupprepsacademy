"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { gradeSubmission } from "@/app/actions/academic-actions";

type SubmissionRow = {
  id: string;
  studentName: string;
  fileUrl: string | null;
  marks: number | null;
  grade: string | null;
  totalMarks: number | null;
};

export default function GradeSubmissionsPanel({
  assignmentId,
  assignmentTitle,
  submissions,
  onClose,
}: {
  assignmentId: string;
  assignmentTitle: string;
  submissions: SubmissionRow[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, { marks: string; total: string; feedback: string }>>(
    () => {
      const initial: Record<string, { marks: string; total: string; feedback: string }> = {};
      submissions.forEach((s) => {
        initial[s.id] = {
          marks: s.marks != null ? String(s.marks) : "",
          total: s.totalMarks != null ? String(s.totalMarks) : "100",
          feedback: "",
        };
      });
      return initial;
    }
  );

  async function submitGrade(submissionId: string) {
    const form = forms[submissionId];
    const marks = parseFloat(form.marks);
    const totalMarks = parseFloat(form.total);
    if (Number.isNaN(marks) || Number.isNaN(totalMarks) || totalMarks <= 0) {
      toast.error("Enter valid marks and total marks");
      return;
    }

    setGradingId(submissionId);
    const result = await gradeSubmission(
      submissionId,
      marks,
      totalMarks,
      form.feedback
    );
    if (result.success) {
      toast.success("Grade saved");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to save grade");
    }
    setGradingId(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 modal-backdrop">
      <div className="modal-panel w-full max-w-2xl max-h-[90vh] flex flex-col mx-0">
        <div className="modal-header shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">Grade submissions</h2>
            <p className="text-xs text-white/40 mt-0.5">{assignmentTitle}</p>
          </div>
          <button type="button" onClick={onClose} className="text-white/30 hover:text-white p-1.5 rounded-lg" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-body overflow-y-auto space-y-4">
          {submissions.length === 0 ? (
            <p className="portal-panel-empty">No submissions yet for this assignment.</p>
          ) : (
            submissions.map((s) => (
              <div key={s.id} className="glass-card p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <p className="font-medium text-white text-sm">{s.studentName}</p>
                  {s.grade && (
                    <span className="badge badge-success text-xs">Graded: {s.grade}</span>
                  )}
                </div>
                {s.fileUrl && (
                  <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-[#F78C1F] hover:underline">
                    View submission
                  </a>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="form-label-caps">Marks</label>
                    <input
                      type="number"
                      min={0}
                      className="form-input py-2"
                      value={forms[s.id]?.marks ?? ""}
                      onChange={(e) =>
                        setForms((prev) => ({
                          ...prev,
                          [s.id]: { ...prev[s.id], marks: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label-caps">Out of</label>
                    <input
                      type="number"
                      min={1}
                      className="form-input py-2"
                      value={forms[s.id]?.total ?? "100"}
                      onChange={(e) =>
                        setForms((prev) => ({
                          ...prev,
                          [s.id]: { ...prev[s.id], total: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      disabled={gradingId === s.id}
                      onClick={() => submitGrade(s.id)}
                      className="btn btn-primary w-full py-2 min-h-[40px] disabled:opacity-70"
                    >
                      {gradingId === s.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Feedback (optional)"
                  className="form-input py-2 text-sm"
                  value={forms[s.id]?.feedback ?? ""}
                  onChange={(e) =>
                    setForms((prev) => ({
                      ...prev,
                      [s.id]: { ...prev[s.id], feedback: e.target.value },
                    }))
                  }
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
