"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { gradeShortAnswerAttempt } from "@/app/actions/lms/quiz-actions";
import type { GradedAnswerRow } from "@/lib/lms/types";

type PendingAttempt = {
  id: string;
  submittedAt: Date | null;
  answers: unknown;
  user: { id: string; name: string | null; email: string };
  quiz: {
    id: string;
    title: string;
    type: string;
    passingScore: number | null;
    questions: {
      id: string;
      text: string;
      type: string;
      marks: number;
    }[];
    module?: { course: { title: string } } | null;
  };
};

function AttemptGrader({ attempt, disabled }: { attempt: PendingAttempt; disabled: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const shortQuestions = attempt.quiz.questions.filter((q) => q.type === "SHORT_ANSWER");
  const graded = (attempt.answers as GradedAnswerRow[]) ?? [];
  const [marks, setMarks] = useState<Record<string, number>>(() =>
    Object.fromEntries(shortQuestions.map((q) => [q.id, q.marks]))
  );

  function submit() {
    setError("");
    const grades = shortQuestions.map((q) => {
      const marksAwarded = Math.min(q.marks, Math.max(0, marks[q.id] ?? 0));
      return {
        questionId: q.id,
        marksAwarded,
        isCorrect: marksAwarded >= q.marks * 0.5,
      };
    });

    startTransition(async () => {
      const res = await gradeShortAnswerAttempt({ attemptId: attempt.id, grades });
      if (!res.success) setError(res.error ?? "Failed to grade");
      else router.refresh();
    });
  }

  return (
    <article className="portal-panel">
      <header className="portal-panel__header portal-panel__header--compact mb-4">
        <div>
          <h2 className="portal-panel__title">{attempt.quiz.title}</h2>
          <p className="portal-panel__desc">
            {attempt.user.name ?? "Student"} · {attempt.user.email}
            {attempt.quiz.module?.course ? ` · ${attempt.quiz.module.course.title}` : ""}
          </p>
        </div>
      </header>

      {error && <div className="alert-error mb-4 text-sm">{error}</div>}

      <ul className="space-y-4 mb-6">
        {shortQuestions.map((q) => {
          const answer = graded.find((a) => a.questionId === q.id);
          return (
            <li key={q.id} className="lms-lesson-row flex-col items-stretch !py-4">
              <p className="lms-lesson-row__title">{q.text}</p>
              <p className="lms-lesson-row__meta mb-2">
                Short answer · max {q.marks} mark{q.marks === 1 ? "" : "s"}
              </p>
              <p className="text-sm text-white/70 whitespace-pre-wrap rounded-lg bg-white/[0.03] p-3 border border-white/[0.06]">
                {String(answer?.selectedAnswer ?? "—")}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs text-white/50 uppercase tracking-wide">Marks awarded</label>
                <input
                  type="number"
                  min={0}
                  max={q.marks}
                  step={0.5}
                  value={marks[q.id] ?? 0}
                  onChange={(e) =>
                    setMarks((prev) => ({ ...prev, [q.id]: Number(e.target.value) }))
                  }
                  className="form-input w-24"
                />
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        disabled={disabled || pending}
        onClick={submit}
        className="portal-btn portal-btn--primary"
      >
        Submit grade
      </button>
    </article>
  );
}

export default function QuizGradingPanel({ attempts }: { attempts: PendingAttempt[] }) {
  if (attempts.length === 0) {
    return (
      <div className="portal-panel">
        <p className="portal-panel-empty">No submissions waiting for manual grading.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {attempts.map((attempt) => (
        <AttemptGrader key={attempt.id} attempt={attempt} disabled={false} />
      ))}
    </div>
  );
}
