"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatLessonType } from "@/lib/lms/display";

function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m?.[1] ?? null;
}

function extractVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m?.[1] ?? null;
}

export default function LessonPlayer({
  courseSlug,
  lesson,
  moduleLessons,
  courseTitle,
  moduleTitle,
  initialProgress,
}: {
  courseSlug: string;
  courseTitle: string;
  moduleTitle: string;
  lesson: {
    id: string;
    title: string;
    type: string;
    content: string | null;
    duration: number | null;
  };
  moduleLessons: { id: string; title: string; order: number }[];
  initialProgress: { completed: boolean; percentage: number } | null;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialProgress?.completed ?? false);
  const [pending, startTransition] = useTransition();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);

  const sendProgress = useCallback(
    async (payload: { percentage: number; timeSpent: number; completed?: boolean; started?: boolean }) => {
      await fetch("/api/lms/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, ...payload }),
      });
    },
    [lesson.id]
  );

  useEffect(() => {
    void sendProgress({ percentage: initialProgress?.percentage ?? 0, timeSpent: 0, started: true });

    intervalRef.current = setInterval(() => {
      secondsRef.current += 30;
      void sendProgress({ percentage: Math.min(90, secondsRef.current), timeSpent: 30 });
    }, 30000);

    const onUnload = () => {
      void sendProgress({
        percentage: completed ? 100 : Math.min(90, secondsRef.current),
        timeSpent: 0,
        completed,
      });
    };
    window.addEventListener("beforeunload", onUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [completed, initialProgress?.percentage, sendProgress]);

  const idx = moduleLessons.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? moduleLessons[idx - 1] : null;
  const next = idx < moduleLessons.length - 1 ? moduleLessons[idx + 1] : null;

  function markComplete() {
    startTransition(async () => {
      await sendProgress({ percentage: 100, timeSpent: 0, completed: true });
      setCompleted(true);
      router.refresh();
    });
  }

  function renderContent() {
    const content = lesson.content ?? "";

    if (lesson.type === "VIDEO") {
      const yt = extractYouTubeId(content);
      if (yt) {
        return (
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black/40">
            <iframe
              src={`https://www.youtube.com/embed/${yt}`}
              title={lesson.title}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        );
      }
      const vimeo = extractVimeoId(content);
      if (vimeo) {
        return (
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black/40">
            <iframe
              src={`https://player.vimeo.com/video/${vimeo}`}
              title={lesson.title}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        );
      }
      if (content.match(/\.(mp4|webm)(\?|$)/i)) {
        return (
          <video src={content} controls className="w-full rounded-xl border border-white/10" />
        );
      }
      return (
        <div className="portal-panel portal-panel-empty text-sm">
          Video URL is missing or invalid. Contact your instructor.
        </div>
      );
    }

    if (lesson.type === "PDF" || lesson.type === "SLIDES") {
      return (
        <iframe
          src={content}
          title={lesson.title}
          className="w-full h-[min(70vh,36rem)] rounded-xl border border-white/10 bg-white"
        />
      );
    }

    if (lesson.type === "READING" || lesson.type === "PRACTICE") {
      return (
        <div className="portal-panel">
          <div className="prose prose-invert max-w-none text-white/78 whitespace-pre-wrap leading-relaxed text-[0.9375rem]">
            {content}
          </div>
        </div>
      );
    }

    if (lesson.type === "EXTERNAL_LINK") {
      return (
        <div className="portal-panel text-center py-10">
          <p className="text-sm text-white/55 mb-5 max-w-md mx-auto">Open the linked resource in a new tab to continue.</p>
          <a
            href={content}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markComplete()}
            className="portal-btn portal-btn--primary min-h-[48px] px-8 inline-flex"
          >
            Open resource
          </a>
        </div>
      );
    }

    if (lesson.type === "DOWNLOAD") {
      return (
        <div className="portal-panel text-center py-10">
          <p className="text-sm text-white/55 mb-5">Download the file to complete this lesson.</p>
          <a
            href={content}
            download
            onClick={() => markComplete()}
            className="portal-btn portal-btn--primary min-h-[48px] px-8 inline-flex"
          >
            Download file
          </a>
        </div>
      );
    }

    return <p className="portal-panel-empty text-sm">This lesson type is not supported yet.</p>;
  }

  return (
    <div className="lms-page">
      <Link href={`/portal/student/courses/${courseSlug}`} className="lms-back-link">
        <ArrowLeft className="w-4 h-4" aria-hidden />
        {courseTitle}
      </Link>

      <div className="lms-player-layout">
        <div className="lms-player-content">
          <header className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">{moduleTitle}</p>
            <h1 className="text-xl md:text-2xl font-bold text-white font-display leading-tight">{lesson.title}</h1>
            <p className="text-sm text-white/45 mt-1">{formatLessonType(lesson.type)}</p>
          </header>

          {renderContent()}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!completed && lesson.type !== "EXTERNAL_LINK" && lesson.type !== "DOWNLOAD" && (
              <button
                type="button"
                disabled={pending}
                onClick={markComplete}
                className="portal-btn portal-btn--primary min-h-[44px] gap-2"
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden />
                Mark complete
              </button>
            )}
            {completed && (
              <p className="text-sm text-[#0ABFBC] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" aria-hidden />
                Lesson completed
              </p>
            )}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.08]">
            {prev ? (
              <Link
                href={`/portal/student/courses/${courseSlug}/lessons/${prev.id}`}
                className="portal-btn portal-btn--ghost min-h-[40px] gap-1"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden />
                Previous
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/portal/student/courses/${courseSlug}/lessons/${next.id}`}
                className="portal-btn portal-btn--primary min-h-[40px] gap-1"
              >
                Next lesson
                <ChevronRight className="w-4 h-4" aria-hidden />
              </Link>
            ) : (
              <Link
                href={`/portal/student/courses/${courseSlug}`}
                className="portal-btn portal-btn--ghost min-h-[40px]"
              >
                Back to course
              </Link>
            )}
          </div>
        </div>

        <aside className="lms-player-sidebar">
          <p className="lms-player-sidebar__head">{moduleTitle}</p>
          <nav aria-label="Lessons in this module">
            {moduleLessons.map((l) => (
              <Link
                key={l.id}
                href={`/portal/student/courses/${courseSlug}/lessons/${l.id}`}
                className={`lms-player-nav-item${l.id === lesson.id ? " lms-player-nav-item--active" : ""}`}
              >
                {l.title}
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
