"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { startAttempt, submitAttempt } from "@/app/actions/lms/quiz-actions";
import type { SubmittedAnswer } from "@/lib/lms/types";
import { formatQuizType } from "@/lib/lms/display";

type Question = {
  id: string;
  text: string;
  type: string;
  marks: number;
  options: { id: string; text: string }[] | null;
};

type HistoryRow = {
  id: string;
  percentage: number | null;
  passed: boolean | null;
  submittedAt: string | null;
};

export default function QuizRunner({
  courseSlug,
  quizId,
  quizMeta,
  history,
}: {
  courseSlug: string;
  quizId: string;
  quizMeta: {
    title: string;
    type: string;
    timeLimit: number | null;
    passingScore: number | null;
    maxAttempts: number | null;
    questionCount: number;
  };
  history: HistoryRow[];
}) {
  const [screen, setScreen] = useState<"start" | "quiz" | "results">("start");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<{ percentage: number | null; passed: boolean | null } | null>(
    null
  );
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const attemptsUsed = history.filter((h) => h.submittedAt).length;
  const attemptsLeft =
    quizMeta.maxAttempts != null ? quizMeta.maxAttempts - attemptsUsed : null;
  const canStart = attemptsLeft === null || attemptsLeft > 0;

  function handleStart() {
    setError("");
    startTransition(async () => {
      const res = await startAttempt(quizId);
      if (!res.success) {
        setError(res.error);
        return;
      }
      setAttemptId(res.data.attemptId);
      setQuestions(res.data.questions as Question[]);
      setAnswers({});
      setCurrent(0);
      setScreen("quiz");
    });
  }

  function setAnswer(questionId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleSubmit() {
    if (!attemptId) return;
    if (!confirm("Submit your answers? You cannot change them after submitting.")) return;

    const payload: SubmittedAnswer[] = questions.map((q) => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] ?? null,
    }));

    startTransition(async () => {
      const res = await submitAttempt(attemptId, payload);
      if (!res.success) {
        setError(res.error);
        return;
      }
      setResults({
        percentage: res.data.attempt.percentage,
        passed: res.data.passed,
      });
      setScreen("results");
    });
  }

  const q = questions[current];
  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;

  if (screen === "start") {
    return (
      <div className="lms-quiz-shell">
        <Link href={`/portal/student/courses/${courseSlug}`} className="lms-back-link">
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Back to course
        </Link>

        <div className="portal-panel text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#F78C1F] mb-2">
            {formatQuizType(quizMeta.type)}
          </p>
          <h1 className="text-2xl font-bold text-white font-display mb-2">{quizMeta.title}</h1>
          <p className="text-sm text-white/45 mb-6">Read each question carefully before submitting.</p>

          <div className="lms-quiz-meta-list text-left">
            <div className="lms-quiz-meta-item">
              <strong>Questions</strong>
              {quizMeta.questionCount}
            </div>
            {quizMeta.timeLimit != null && (
              <div className="lms-quiz-meta-item">
                <strong>Time limit</strong>
                {quizMeta.timeLimit} min
              </div>
            )}
            {quizMeta.passingScore != null && (
              <div className="lms-quiz-meta-item">
                <strong>Passing score</strong>
                {quizMeta.passingScore}%
              </div>
            )}
            {attemptsLeft != null && (
              <div className="lms-quiz-meta-item">
                <strong>Attempts left</strong>
                {attemptsLeft}
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="mb-6 text-left border-t border-white/[0.08] pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/45 mb-3">Previous attempts</p>
              <ul className="space-y-2">
                {history.slice(0, 3).map((h) => (
                  <li key={h.id} className="flex items-center justify-between text-sm text-white/60">
                    <span>{h.percentage != null ? `${Math.round(h.percentage)}%` : "Pending"}</span>
                    {h.passed === true && <span className="badge badge-success">Passed</span>}
                    {h.passed === false && <span className="badge badge-error">Failed</span>}
                    {h.passed === null && <span className="badge badge-warning">Review</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <p className="alert-error mb-4 text-sm text-left">{error}</p>}

          <button
            type="button"
            disabled={!canStart || pending}
            onClick={handleStart}
            className="portal-btn portal-btn--primary min-h-[48px] px-8 w-full sm:w-auto"
          >
            {canStart ? "Start quiz" : "No attempts remaining"}
          </button>
        </div>
      </div>
    );
  }

  if (screen === "results" && results) {
    return (
      <div className="lms-quiz-shell">
        <div className="portal-panel text-center py-10">
          {results.passed === true && (
            <CheckCircle2 className="w-12 h-12 text-[#0ABFBC] mx-auto mb-4" aria-hidden />
          )}
          {results.passed === false && (
            <XCircle className="w-12 h-12 text-red-400/80 mx-auto mb-4" aria-hidden />
          )}
          <h1 className="text-2xl font-bold text-white mb-2">Quiz submitted</h1>
          <p className="text-4xl font-bold text-[#F78C1F] mb-3">
            {results.percentage != null ? `${Math.round(results.percentage)}%` : "—"}
          </p>
          {results.passed === true && <span className="badge badge-success">Passed</span>}
          {results.passed === false && <span className="badge badge-error">Did not pass</span>}
          {results.passed === null && <span className="badge badge-warning">Awaiting review</span>}
          <div className="mt-8">
            <Link href={`/portal/student/courses/${courseSlug}`} className="portal-btn portal-btn--primary min-h-[44px] px-6">
              Back to course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="lms-quiz-shell space-y-5">
      <div className="flex items-center justify-between text-sm text-white/50">
        <span>Question {current + 1} of {questions.length}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="lms-quiz-progress" aria-hidden>
        <div className="lms-quiz-progress__fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="portal-panel">
        <h2 className="text-lg font-semibold text-white mb-5 leading-snug">{q.text}</h2>

        {q.type === "MCQ" && q.options && (
          <div className="space-y-2">
            {q.options.map((opt) => (
              <label
                key={opt.id}
                className={`lms-option${answers[q.id] === opt.id ? " lms-option--selected" : ""}`}
              >
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === opt.id}
                  onChange={() => setAnswer(q.id, opt.id)}
                />
                <span className="lms-option__text">{opt.text}</span>
              </label>
            ))}
          </div>
        )}

        {q.type === "TRUE_FALSE" && (
          <div className="grid grid-cols-2 gap-3">
            {["true", "false"].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAnswer(q.id, val)}
                className={`lms-option justify-center capitalize${answers[q.id] === val ? " lms-option--selected" : ""}`}
              >
                {val}
              </button>
            ))}
          </div>
        )}

        {q.type === "MULTI_SELECT" && q.options && (
          <div className="space-y-2">
            <p className="text-xs text-white/42 mb-3">Select all that apply</p>
            {q.options.map((opt) => {
              const selected = (answers[q.id] as string[] | undefined) ?? [];
              const checked = selected.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  className={`lms-option${checked ? " lms-option--selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? selected.filter((x) => x !== opt.id)
                        : [...selected, opt.id];
                      setAnswer(q.id, next);
                    }}
                  />
                  <span className="lms-option__text">{opt.text}</span>
                </label>
              );
            })}
          </div>
        )}

        {q.type === "SHORT_ANSWER" && (
          <textarea
            className="form-textarea w-full"
            rows={4}
            value={(answers[q.id] as string) ?? ""}
            onChange={(e) => setAnswer(q.id, e.target.value)}
            placeholder="Type your answer here"
          />
        )}
      </div>

      <div className="flex justify-between gap-3">
        <button
          type="button"
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
          className="portal-btn portal-btn--ghost min-h-[44px] px-4"
        >
          Previous
        </button>
        {current < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrent((c) => c + 1)}
            className="portal-btn portal-btn--primary min-h-[44px] px-6"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={handleSubmit}
            className="portal-btn portal-btn--primary min-h-[44px] px-6"
          >
            Submit quiz
          </button>
        )}
      </div>
    </div>
  );
}
