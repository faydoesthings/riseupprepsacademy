"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import {
  addQuestion,
  deleteQuestion,
  updateQuestion,
  updateQuiz,
  reorderQuestions,
} from "@/app/actions/lms/quiz-actions";
import { formatQuizType } from "@/lib/lms/display";
import SortableList from "@/components/portal/lms/SortableList";

type QuestionRow = {
  id: string;
  text: string;
  type: string;
  marks: number;
  options: { id: string; text: string }[] | null;
  correctAnswer: unknown;
  explanation: string | null;
  order: number;
};

type QuizData = {
  id: string;
  title: string;
  type: string;
  passingScore: number | null;
  timeLimit: number | null;
  maxAttempts: number | null;
  questions: QuestionRow[];
};

const questionTypes = ["MCQ", "TRUE_FALSE", "MULTI_SELECT", "SHORT_ANSWER"] as const;

export default function QuizEditor({
  courseId,
  quiz,
  basePath = "/portal/admin/courses",
}: {
  courseId: string;
  quiz: QuizData;
  basePath?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState<QuestionRow | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  function refresh() {
    router.refresh();
  }

  function handleUpdateQuiz(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateQuiz(quiz.id, {
        title: fd.get("title") as string,
        passingScore: Number(fd.get("passingScore")),
        timeLimit: fd.get("timeLimit") ? Number(fd.get("timeLimit")) : undefined,
        maxAttempts: fd.get("maxAttempts") ? Number(fd.get("maxAttempts")) : undefined,
      });
      if (!res.success) setError(res.error ?? "Failed");
      else {
        setSuccess("Quiz settings saved");
        refresh();
      }
    });
  }

  function handleSaveQuestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const type = fd.get("type") as (typeof questionTypes)[number];
    const optionsRaw = (fd.get("options") as string)?.trim();
    const options =
      type === "MCQ" || type === "MULTI_SELECT"
        ? optionsRaw
            .split("\n")
            .filter(Boolean)
            .map((line, i) => {
              const [id, ...rest] = line.split("|");
              return { id: id.trim() || String.fromCharCode(97 + i), text: rest.join("|").trim() || line.trim() };
            })
        : undefined;

    let correctAnswer: string | string[] | null = null;
    const correctRaw = (fd.get("correctAnswer") as string)?.trim();
    if (type === "MULTI_SELECT" && correctRaw) {
      correctAnswer = correctRaw.split(",").map((s) => s.trim());
    } else if (correctRaw) {
      correctAnswer = correctRaw;
    }

    const payload = {
      text: fd.get("text") as string,
      type,
      options,
      correctAnswer,
      marks: Number(fd.get("marks") || 1),
      explanation: (fd.get("explanation") as string) || undefined,
    };

    startTransition(async () => {
      const res = editing
        ? await updateQuestion(editing.id, payload)
        : await addQuestion(quiz.id, payload);
      if (!res.success) setError(res.error ?? "Failed");
      else {
        setEditing(null);
        setShowAdd(false);
        setSuccess(editing ? "Question updated" : "Question added");
        refresh();
      }
    });
  }

  return (
    <div className="lms-page">
      <Link href={`${basePath}/${courseId}`} className="lms-back-link">
        <ArrowLeft className="w-4 h-4" aria-hidden />
        Back to course builder
      </Link>

      <header className="lms-hero">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#F78C1F] mb-2">
            {formatQuizType(quiz.type)}
          </p>
          <h1 className="lms-hero__title font-display">{quiz.title}</h1>
          <p className="lms-hero__meta">{quiz.questions.length} questions</p>
        </div>
      </header>

      {(error || success) && (
        <div className={error ? "alert-error mb-4 text-sm" : "alert-success mb-4 text-sm"} role="status">
          {error || success}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        <section>
          <header className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="portal-panel__title">Questions</h2>
              <p className="portal-panel__desc">Add and edit assessment questions.</p>
            </div>
            <button type="button" onClick={() => { setShowAdd(true); setEditing(null); }} className="portal-btn portal-btn--primary">
              <Plus className="w-4 h-4" aria-hidden />
              Add question
            </button>
          </header>

          {quiz.questions.length === 0 ? (
            <div className="portal-panel">
              <p className="portal-panel-empty">No questions yet. Add your first question above.</p>
            </div>
          ) : (
            <SortableList
              items={quiz.questions}
              disabled={pending}
              onReorder={(orderedIds) => {
                startTransition(async () => {
                  await reorderQuestions(quiz.id, orderedIds);
                  refresh();
                });
              }}
              renderItem={(q, index) => (
                <li key={q.id} className="lms-module list-none">
                  <div className="lms-lesson-row">
                    <span className="lms-module__index">{index + 1}</span>
                    <div className="lms-lesson-row__body">
                      <p className="lms-lesson-row__title">{q.text}</p>
                      <p className="lms-lesson-row__meta">{q.type} · {q.marks} mark{q.marks === 1 ? "" : "s"}</p>
                    </div>
                    <div className="lms-lesson-row__actions">
                      <button type="button" onClick={() => { setEditing(q); setShowAdd(true); }} className="portal-btn portal-btn--ghost portal-btn--sm">
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          if (!confirm("Delete this question?")) return;
                          startTransition(async () => {
                            await deleteQuestion(q.id);
                            refresh();
                          });
                        }}
                        className="lms-icon-btn lms-icon-btn--danger"
                        aria-label="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              )}
            />
          )}
        </section>

        <aside className="portal-panel h-fit">
          <h2 className="portal-panel__title mb-4">Quiz settings</h2>
          <form onSubmit={handleUpdateQuiz} className="space-y-4">
            <div>
              <label className="form-label-caps" htmlFor="quiz-title">Title</label>
              <input id="quiz-title" name="title" defaultValue={quiz.title} required className="form-input" />
            </div>
            <div>
              <label className="form-label-caps" htmlFor="passingScore">Passing score (%)</label>
              <input id="passingScore" name="passingScore" type="number" min={0} max={100} defaultValue={quiz.passingScore ?? 60} className="form-input" />
            </div>
            <div>
              <label className="form-label-caps" htmlFor="timeLimit">Time limit (minutes)</label>
              <input id="timeLimit" name="timeLimit" type="number" min={1} defaultValue={quiz.timeLimit ?? ""} className="form-input" placeholder="Optional" />
            </div>
            <div>
              <label className="form-label-caps" htmlFor="maxAttempts">Max attempts</label>
              <input id="maxAttempts" name="maxAttempts" type="number" min={1} defaultValue={quiz.maxAttempts ?? ""} className="form-input" placeholder="Unlimited" />
            </div>
            <button type="submit" disabled={pending} className="portal-btn portal-btn--primary w-full">
              Save settings
            </button>
          </form>
        </aside>
      </div>

      {showAdd && (
        <div className="modal-backdrop animate-fade-in" onClick={() => { setShowAdd(false); setEditing(null); }}>
          <div className="modal-panel max-w-lg" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-white">{editing ? "Edit question" : "Add question"}</h2>
              <button type="button" onClick={() => { setShowAdd(false); setEditing(null); }} className="lms-icon-btn" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveQuestion}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="form-label-caps">Question text</label>
                  <textarea name="text" required rows={3} defaultValue={editing?.text} className="form-textarea" />
                </div>
                <div>
                  <label className="form-label-caps">Type</label>
                  <select name="type" defaultValue={editing?.type ?? "MCQ"} className="form-select">
                    {questionTypes.map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label-caps">Options (one per line: id|text)</label>
                  <textarea
                    name="options"
                    rows={4}
                    className="form-textarea font-mono text-xs"
                    placeholder={"a|First option\nb|Second option"}
                    defaultValue={
                      editing?.options?.map((o) => `${o.id}|${o.text}`).join("\n") ?? ""
                    }
                  />
                </div>
                <div>
                  <label className="form-label-caps">Correct answer (id or true/false)</label>
                  <input
                    name="correctAnswer"
                    className="form-input"
                    defaultValue={
                      Array.isArray(editing?.correctAnswer)
                        ? (editing.correctAnswer as string[]).join(", ")
                        : String(editing?.correctAnswer ?? "")
                    }
                  />
                </div>
                <div>
                  <label className="form-label-caps">Marks</label>
                  <input name="marks" type="number" min={0} step={0.5} defaultValue={editing?.marks ?? 1} className="form-input" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setShowAdd(false); setEditing(null); }} className="btn btn-secondary flex-1 min-h-[44px]">Cancel</button>
                <button type="submit" disabled={pending} className="btn btn-primary flex-1 min-h-[44px]">Save question</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
