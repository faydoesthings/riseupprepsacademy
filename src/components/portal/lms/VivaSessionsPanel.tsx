"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle2, Video } from "lucide-react";
import { completeViva, cancelViva } from "@/app/actions/lms/viva-actions";

type SessionRow = {
  id: string;
  scheduledAt: Date | string;
  durationMinutes: number;
  meetingLink: string | null;
  status: string;
  score: number | null;
  passed: boolean | null;
  notes: string | null;
  course: { title: string; slug: string };
  student: { name: string; email: string };
  examiner: { name: string; email: string } | null;
};

export default function VivaSessionsPanel({
  sessions,
  role,
}: {
  sessions: SessionRow[];
  role: "admin" | "teacher" | "student";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function handleComplete(e: React.FormEvent<HTMLFormElement>, sessionId: string) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await completeViva({
        sessionId,
        score: Number(fd.get("score")),
        passed: fd.get("passed") === "true",
        notes: (fd.get("notes") as string) || undefined,
      });
      if (!res.success) setError(res.error ?? "Failed");
      else {
        setGradingId(null);
        router.refresh();
      }
    });
  }

  if (sessions.length === 0) {
    return (
      <div className="portal-panel">
        <div className="lms-empty">
          <div className="lms-empty__icon">
            <Video className="w-5 h-5" />
          </div>
          <p className="lms-empty__title">No viva sessions</p>
          <p className="lms-empty__text">
            {role === "student"
              ? "Complete your course and pass the final exam to become eligible for a viva."
              : "Scheduled oral exams will appear here."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <div className="alert-error text-sm">{error}</div>}
      {sessions.map((session) => {
        const when = new Date(session.scheduledAt).toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        const isPast = new Date(session.scheduledAt) < new Date();

        return (
          <article key={session.id} className="portal-panel">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#F78C1F] mb-1">
                  {session.course.title}
                </p>
                <h2 className="portal-panel__title">
                  {role === "student" ? "Your viva session" : session.student.name}
                </h2>
                <p className="portal-panel__desc flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5" aria-hidden />
                  {when} · {session.durationMinutes} min
                </p>
                {role !== "student" && (
                  <p className="text-xs text-white/42 mt-1">{session.student.email}</p>
                )}
                {session.examiner && role !== "teacher" && (
                  <p className="text-xs text-white/42 mt-1">Examiner: {session.examiner.name}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {session.status === "COMPLETED" && session.passed === true && (
                  <span className="badge badge-success">Passed</span>
                )}
                {session.status === "COMPLETED" && session.passed === false && (
                  <span className="badge badge-error">Not passed</span>
                )}
                {session.status === "SCHEDULED" && (
                  <span className="badge badge-info">{isPast ? "Due" : "Scheduled"}</span>
                )}
              </div>
            </div>

            {session.meetingLink && session.status === "SCHEDULED" && (
              <div className="mt-4">
                <a
                  href={session.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portal-btn portal-btn--primary portal-btn--sm"
                >
                  Join meeting
                </a>
              </div>
            )}

            {session.status === "COMPLETED" && session.score != null && (
              <p className="text-sm text-white/55 mt-4">
                Score: {Math.round(session.score)}%
                {session.notes ? ` · ${session.notes}` : ""}
              </p>
            )}

            {role === "admin" && session.status === "SCHEDULED" && (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await cancelViva(session.id);
                    router.refresh();
                  })
                }
                className="portal-btn portal-btn--ghost portal-btn--sm mt-4 text-red-400/80"
              >
                Cancel session
              </button>
            )}

            {(role === "teacher" || role === "admin") && session.status === "SCHEDULED" && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                {gradingId === session.id ? (
                  <form onSubmit={(e) => handleComplete(e, session.id)} className="space-y-3 max-w-md">
                    <div>
                      <label className="form-label-caps">Score (%)</label>
                      <input name="score" type="number" min={0} max={100} required className="form-input" />
                    </div>
                    <div>
                      <label className="form-label-caps">Result</label>
                      <select name="passed" required className="form-select" defaultValue="true">
                        <option value="true">Pass — issue certificate</option>
                        <option value="false">Did not pass</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label-caps">Notes (optional)</label>
                      <textarea name="notes" rows={2} className="form-textarea" />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setGradingId(null)} className="portal-btn portal-btn--ghost flex-1">
                        Cancel
                      </button>
                      <button type="submit" disabled={pending} className="portal-btn portal-btn--primary flex-1">
                        Submit result
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setGradingId(session.id)}
                    className="portal-btn portal-btn--primary portal-btn--sm gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" aria-hidden />
                    Mark complete
                  </button>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
