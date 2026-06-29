"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createCourse } from "@/app/actions/lms/course-actions";

export default function NewCourseForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createCourse({
        title: fd.get("title") as string,
        description: fd.get("description") as string,
        difficulty: (fd.get("difficulty") as "BEGINNER" | "INTERMEDIATE" | "ADVANCED") || undefined,
        estimatedDurationHours: fd.get("hours") ? Number(fd.get("hours")) : undefined,
        thumbnail: (fd.get("thumbnail") as string) || undefined,
        tags,
      });

      if (res.success) {
        router.push(`/portal/admin/courses/${res.data.id}`);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="lms-page max-w-2xl">
      <Link href="/portal/admin/courses" className="lms-back-link">
        <ArrowLeft className="w-4 h-4" aria-hidden />
        All courses
      </Link>

      <header className="mb-6">
        <p className="admin-dashboard__eyebrow mb-2">Admin portal</p>
        <h1 className="lms-hero__title font-display">Create course</h1>
        <p className="lms-hero__meta mt-2">Set up the basics, then add modules and lessons in the builder.</p>
      </header>

      {error && (
        <div className="alert-error mb-4 text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="portal-panel space-y-6">
        <div>
          <p className="form-section-title">Course details</p>
          <div className="space-y-4 mt-3">
            <div>
              <label className="form-label-caps" htmlFor="title">
                Title
              </label>
              <input id="title" name="title" required className="form-input" placeholder="Digital Literacy Foundations" />
            </div>
            <div>
              <label className="form-label-caps" htmlFor="description">
                Description
              </label>
              <textarea id="description" name="description" required rows={4} className="form-textarea" placeholder="What will students learn in this course?" />
            </div>
          </div>
        </div>

        <div>
          <p className="form-section-title">Settings</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="form-label-caps" htmlFor="difficulty">
                Difficulty
              </label>
              <select id="difficulty" name="difficulty" className="form-select" defaultValue="BEGINNER">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="form-label-caps" htmlFor="hours">
                Estimated hours
              </label>
              <input id="hours" name="hours" type="number" min={0} step={0.5} className="form-input" placeholder="10" />
            </div>
          </div>
        </div>

        <div>
          <p className="form-section-title">Optional</p>
          <div className="space-y-4 mt-3">
            <div>
              <label className="form-label-caps" htmlFor="thumbnail">
                Thumbnail URL
              </label>
              <input id="thumbnail" name="thumbnail" type="url" className="form-input" placeholder="https://..." />
            </div>
            <div>
              <label className="form-label-caps">Tags</label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="form-input flex-1"
                  placeholder="Type a tag and press Enter"
                />
                <button type="button" onClick={addTag} className="portal-btn portal-btn--ghost shrink-0">
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((t) => (
                    <span key={t} className="badge badge-info">
                      {t}
                      <button
                        type="button"
                        className="ml-1 opacity-70 hover:opacity-100"
                        onClick={() => setTags(tags.filter((x) => x !== t))}
                        aria-label={`Remove tag ${t}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={pending} className="portal-btn portal-btn--primary min-h-[48px] px-8">
            {pending ? "Creating…" : "Create & open builder"}
          </button>
        </div>
      </form>
    </div>
  );
}
