"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  Video,
  Download,
  X,
} from "lucide-react";
import { publishCourse, updateCourse } from "@/app/actions/lms/course-actions";
import { createModule, deleteModule, moveModule, reorderModules } from "@/app/actions/lms/module-actions";
import {
  createLesson,
  deleteLesson,
  moveLesson,
  reorderLessons,
  updateLesson,
} from "@/app/actions/lms/lesson-actions";
import { createQuiz, addQuestion } from "@/app/actions/lms/quiz-actions";
import {
  enrollStudent,
  enrollStudentAsPaid,
  unenrollStudent,
  listStudentsForEnroll,
  bulkEnroll,
} from "@/app/actions/lms/enrollment-actions";
import { formatLessonType, pluralize } from "@/lib/lms/display";
import FileUploadField from "@/components/portal/lms/FileUploadField";
import SortableList from "@/components/portal/lms/SortableList";

type LessonRow = {
  id: string;
  title: string;
  type: string;
  order: number;
  isPreview: boolean;
  content: string | null;
  duration: number | null;
};

type ModuleRow = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: LessonRow[];
  quizzes: { id: string; title: string; _count: { questions: number } }[];
};

type EnrollmentRow = {
  id: string;
  userId: string;
  user: { id: string; name: string | null; email: string };
};

type CourseData = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  requiresPayment: boolean;
  pricePKR: number | null;
  requiresViva: boolean;
  prerequisites: string[];
  modules: ModuleRow[];
  finalExams: { id: string; title: string; _count: { questions: number } }[];
};

const lessonTypes = [
  "VIDEO",
  "PDF",
  "SLIDES",
  "READING",
  "EXTERNAL_LINK",
  "DOWNLOAD",
  "PRACTICE",
] as const;

function lessonIcon(type: string) {
  switch (type) {
    case "VIDEO":
      return Video;
    case "EXTERNAL_LINK":
      return ExternalLink;
    case "DOWNLOAD":
      return Download;
    default:
      return FileText;
  }
}

export default function CourseBuilder({
  course,
  enrollments: initialEnrollments,
  allCourses = [],
  basePath = "/portal/admin/courses",
  canManageEnrollments = true,
}: {
  course: CourseData;
  enrollments: EnrollmentRow[];
  allCourses?: { id: string; title: string }[];
  basePath?: string;
  canManageEnrollments?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<"content" | "students" | "assessments" | "settings">("content");
  const [expandedModule, setExpandedModule] = useState<string | null>(course.modules[0]?.id ?? null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [moduleModal, setModuleModal] = useState(false);
  const [lessonModal, setLessonModal] = useState<{ moduleId: string; lesson?: LessonRow } | null>(null);
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState<{ id: string; name: string | null; email: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [lessonContentUrl, setLessonContentUrl] = useState("");
  const [prerequisiteIds, setPrerequisiteIds] = useState<string[]>(course.prerequisites ?? []);

  const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  function refresh() {
    router.refresh();
  }

  function clearFeedback() {
    setError("");
    setSuccess("");
  }

  function handlePublish(publish: boolean) {
    clearFeedback();
    startTransition(async () => {
      const res = await publishCourse(course.id, publish);
      if (!res.success) setError(res.error ?? "Failed to update status");
      else {
        setSuccess(publish ? "Course published" : "Course moved to draft");
        refresh();
      }
    });
  }

  const searchStudents = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setStudentResults([]);
      return;
    }
    const res = await listStudentsForEnroll(query.trim());
    if (res.success) {
      const enrolledIds = new Set(enrollments.map((e) => e.userId));
      setStudentResults(res.data.filter((s) => !enrolledIds.has(s.id)));
    }
  }, [enrollments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void searchStudents(studentQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [studentQuery, searchStudents]);

  function handleAddModule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearFeedback();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createModule(course.id, {
        title: fd.get("title") as string,
        description: (fd.get("description") as string) || undefined,
      });
      if (!res.success) setError(res.error ?? "Failed to add module");
      else {
        setModuleModal(false);
        setSuccess("Module added");
        refresh();
      }
    });
  }

  function handleSaveLesson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lessonModal) return;
    clearFeedback();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string,
      type: fd.get("type") as (typeof lessonTypes)[number],
      content: (fd.get("content") as string) || undefined,
      duration: fd.get("duration") ? Number(fd.get("duration")) : undefined,
      isPreview: fd.get("isPreview") === "on",
    };

    startTransition(async () => {
      const res = lessonModal.lesson
        ? await updateLesson(lessonModal.lesson.id, payload)
        : await createLesson(lessonModal.moduleId, payload);
      if (!res.success) setError(res.error ?? "Failed to save lesson");
      else {
        setLessonModal(null);
        setSuccess(lessonModal.lesson ? "Lesson updated" : "Lesson added");
        refresh();
      }
    });
  }

  function handleCreateModuleQuiz(moduleId: string) {
    clearFeedback();
    startTransition(async () => {
      const mod = course.modules.find((m) => m.id === moduleId);
      const res = await createQuiz({
        title: `${mod?.title ?? "Module"} quiz`,
        type: "MODULE_QUIZ",
        moduleId,
        passingScore: 60,
      });
      if (!res.success) {
        setError(res.error ?? "Failed to create quiz");
        return;
      }
      await addQuestion(res.data.id, {
        text: "Sample question — edit in quiz builder (Phase 2)",
        type: "MCQ",
        options: [
          { id: "a", text: "Option A" },
          { id: "b", text: "Option B" },
        ],
        correctAnswer: "a",
        marks: 1,
      });
      setSuccess("Module quiz created");
      refresh();
    });
  }

  function handleCreateFinalExam() {
    clearFeedback();
    startTransition(async () => {
      const res = await createQuiz({
        title: `${course.title} — Final exam`,
        type: "FINAL_EXAM",
        courseId: course.id,
        passingScore: 70,
      });
      if (!res.success) {
        setError(res.error ?? "Failed to create final exam");
        return;
      }
      await addQuestion(res.data.id, {
        text: "Sample final exam question — edit in quiz builder",
        type: "MCQ",
        options: [
          { id: "a", text: "Option A" },
          { id: "b", text: "Option B" },
        ],
        correctAnswer: "a",
        marks: 1,
      });
      setSuccess("Final exam created");
      refresh();
    });
  }

  function handleUpdateSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearFeedback();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateCourse(course.id, {
        requiresPayment: fd.get("requiresPayment") === "on",
        pricePKR: fd.get("pricePKR") ? Number(fd.get("pricePKR")) : undefined,
        requiresViva: fd.get("requiresViva") === "on",
        prerequisites: prerequisiteIds,
      });
      if (!res.success) setError(res.error ?? "Failed");
      else {
        setSuccess("Course settings saved");
        refresh();
      }
    });
  }

  function handleEnrollStudent(userId: string, name: string | null, asPaid = false) {
    clearFeedback();
    startTransition(async () => {
      const res = asPaid
        ? await enrollStudentAsPaid(course.id, userId)
        : await enrollStudent(course.id, userId, "MANUAL");
      if (!res.success) {
        setError(res.error ?? "Failed to enroll student");
        return;
      }
      setStudentQuery("");
      setShowResults(false);
      setSuccess(`${name ?? "Student"} enrolled`);
      refresh();
    });
  }

  function handleUnenroll(userId: string, name: string | null) {
    if (!confirm(`Remove ${name ?? "this student"} from the course?`)) return;
    clearFeedback();
    startTransition(async () => {
      const res = await unenrollStudent(course.id, userId);
      if (!res.success) setError(res.error ?? "Failed to remove student");
      else {
        setEnrollments((prev) => prev.filter((e) => e.userId !== userId));
        setSuccess(`${name ?? "Student"} removed`);
        refresh();
      }
    });
  }

  function handleBulkEnroll() {
    if (bulkSelected.length === 0) return;
    clearFeedback();
    const count = bulkSelected.length;
    startTransition(async () => {
      const res = await bulkEnroll(course.id, bulkSelected);
      if (!res.success) setError(res.error ?? "Bulk enroll failed");
      else {
        setBulkSelected([]);
        setStudentQuery("");
        setShowResults(false);
        setSuccess(`${count} students enrolled`);
        refresh();
      }
    });
  }

  function toggleBulkStudent(id: string) {
    setBulkSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  useEffect(() => {
    setPrerequisiteIds(course.prerequisites ?? []);
  }, [course.prerequisites]);

  useEffect(() => {
    setEnrollments(initialEnrollments);
  }, [initialEnrollments]);

  return (
    <div className="lms-page">
      <Link href={basePath} className="lms-back-link">
        <ArrowLeft className="w-4 h-4" aria-hidden />
        All courses
      </Link>

      <header className="lms-hero">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {course.isPublished ? (
              <span className="badge badge-success">Published</span>
            ) : (
              <span className="badge badge-warning">Draft</span>
            )}
          </div>
          <h1 className="lms-hero__title font-display">{course.title}</h1>
          <p className="lms-hero__meta">{pluralize(course.modules.length, "module")} · {pluralize(lessonCount, "lesson")} · {pluralize(enrollments.length, "student", "students")} enrolled</p>
        </div>
        <div className="lms-hero__actions">
          <Link
            href={`/portal/student/courses/${course.slug}`}
            className="portal-btn portal-btn--ghost"
          >
            <Eye className="w-4 h-4" aria-hidden />
            Preview
          </Link>
          <button
            type="button"
            disabled={pending}
            onClick={() => handlePublish(!course.isPublished)}
            className="portal-btn portal-btn--primary"
          >
            {course.isPublished ? "Unpublish" : "Publish course"}
          </button>
        </div>
      </header>

      {(error || success) && (
        <div className={error ? "alert-error mb-4 text-sm" : "alert-success mb-4 text-sm"} role="status">
          {error || success}
        </div>
      )}

      <div className="lms-stat-row">
        <div className="lms-stat">
          <p className="lms-stat__value">{course.modules.length}</p>
          <p className="lms-stat__label">Modules</p>
        </div>
        <div className="lms-stat">
          <p className="lms-stat__value">{lessonCount}</p>
          <p className="lms-stat__label">Lessons</p>
        </div>
        <div className="lms-stat">
          <p className="lms-stat__value">{enrollments.length}</p>
          <p className="lms-stat__label">Enrolled</p>
        </div>
      </div>

      <nav className="lms-tabs" aria-label="Course builder sections">
        <button
          type="button"
          className={`lms-tab${tab === "content" ? " lms-tab--active" : ""}`}
          onClick={() => setTab("content")}
        >
          Course content
        </button>
        {canManageEnrollments && (
        <button
          type="button"
          className={`lms-tab${tab === "students" ? " lms-tab--active" : ""}`}
          onClick={() => setTab("students")}
        >
          Students ({enrollments.length})
        </button>
        )}
        <button
          type="button"
          className={`lms-tab${tab === "assessments" ? " lms-tab--active" : ""}`}
          onClick={() => setTab("assessments")}
        >
          Assessments
        </button>
        <button
          type="button"
          className={`lms-tab${tab === "settings" ? " lms-tab--active" : ""}`}
          onClick={() => setTab("settings")}
        >
          Settings
        </button>
      </nav>

      {tab === "content" && (
        <section>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="portal-panel__title">Modules & lessons</h2>
              <p className="portal-panel__desc">Organize your course into modules, then add lessons and quizzes.</p>
            </div>
            <button
              type="button"
              onClick={() => setModuleModal(true)}
              className="portal-btn portal-btn--primary shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden />
              Add module
            </button>
          </div>

          {course.modules.length === 0 ? (
            <div className="portal-panel">
              <div className="lms-empty">
                <div className="lms-empty__icon">
                  <BookOpen className="w-5 h-5" />
                </div>
                <p className="lms-empty__title">No modules yet</p>
                <p className="lms-empty__text">Start by adding a module — for example &ldquo;Getting started&rdquo; or &ldquo;Week 1&rdquo;.</p>
                <button type="button" onClick={() => setModuleModal(true)} className="portal-btn portal-btn--primary">
                  <Plus className="w-4 h-4" aria-hidden />
                  Add first module
                </button>
              </div>
            </div>
          ) : (
            <div className="lms-module-list">
              <SortableList
                items={course.modules}
                disabled={pending}
                onReorder={(orderedIds) => {
                  startTransition(async () => {
                    await reorderModules(course.id, orderedIds);
                    refresh();
                  });
                }}
                renderItem={(mod, index) => {
                const expanded = expandedModule === mod.id;
                return (
                  <article key={mod.id} className="lms-module">
                    <div className="lms-module__head">
                      <button
                        type="button"
                        className="lms-module__toggle"
                        onClick={() => setExpandedModule(expanded ? null : mod.id)}
                        aria-expanded={expanded}
                      >
                        <span className="lms-module__index">{index + 1}</span>
                        <span className="min-w-0">
                          <span className="lms-module__title">{mod.title}</span>
                          <p className="lms-module__subtitle">
                            {pluralize(mod.lessons.length, "lesson")}
                            {mod.quizzes.length > 0 ? ` · ${mod.quizzes[0].title}` : ""}
                          </p>
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 text-white/35 transition-transform ${expanded ? "rotate-180" : ""}`}
                          aria-hidden
                        />
                      </button>
                      <div className="lms-module__tools">
                        <button
                          type="button"
                          disabled={pending || index === 0}
                          onClick={() =>
                            startTransition(async () => {
                              await moveModule(course.id, mod.id, "up");
                              refresh();
                            })
                          }
                          className="lms-icon-btn"
                          aria-label="Move module up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={pending || index === course.modules.length - 1}
                          onClick={() =>
                            startTransition(async () => {
                              await moveModule(course.id, mod.id, "down");
                              refresh();
                            })
                          }
                          className="lms-icon-btn"
                          aria-label="Move module down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => {
                            if (!confirm("Delete this module and all its lessons?")) return;
                            startTransition(async () => {
                              await deleteModule(mod.id);
                              refresh();
                            });
                          }}
                          className="lms-icon-btn lms-icon-btn--danger"
                          aria-label="Delete module"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="lms-lesson-list">
                        <SortableList
                          items={mod.lessons}
                          disabled={pending}
                          onReorder={(orderedIds) => {
                            startTransition(async () => {
                              await reorderLessons(mod.id, orderedIds);
                              refresh();
                            });
                          }}
                          renderItem={(lesson) => {
                          const Icon = lessonIcon(lesson.type);
                          return (
                            <div key={lesson.id} className="lms-lesson-row">
                              <span className="lms-lesson-row__icon">
                                <Icon className="w-3.5 h-3.5" />
                              </span>
                              <div className="lms-lesson-row__body">
                                <p className="lms-lesson-row__title">{lesson.title}</p>
                                <p className="lms-lesson-row__meta">
                                  {formatLessonType(lesson.type)}
                                  {lesson.isPreview ? " · Free preview" : ""}
                                </p>
                              </div>
                              <div className="lms-lesson-row__actions">
                                <button
                                  type="button"
                                  onClick={() => setLessonModal({ moduleId: mod.id, lesson })}
                                  className="portal-btn portal-btn--ghost portal-btn--sm"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          );
                        }}
                        />

                        <div className="px-4 py-3 border-t border-white/[0.05] flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setLessonModal({ moduleId: mod.id })}
                            className="portal-btn portal-btn--ghost portal-btn--sm"
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden />
                            Add lesson
                          </button>
                          {mod.quizzes.length === 0 ? (
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => handleCreateModuleQuiz(mod.id)}
                              className="portal-btn portal-btn--ghost portal-btn--sm"
                            >
                              <HelpCircle className="w-3.5 h-3.5" aria-hidden />
                              Add quiz
                            </button>
                          ) : (
                            <Link
                              href={`${basePath}/${course.id}/quiz/${mod.quizzes[0].id}`}
                              className="portal-btn portal-btn--ghost portal-btn--sm"
                            >
                              <HelpCircle className="w-3.5 h-3.5" aria-hidden />
                              Edit quiz · {mod.quizzes[0]._count.questions} questions
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              }}
              />
            </div>
          )}
        </section>
      )}

      {tab === "students" && canManageEnrollments && (
        <section className="portal-panel">
          <header className="portal-panel__header portal-panel__header--compact">
            <div>
              <h2 className="portal-panel__title">Enrolled students</h2>
              <p className="portal-panel__desc">Search by name or email to grant course access. Select multiple for bulk enroll.</p>
            </div>
            {bulkSelected.length > 0 && (
              <button
                type="button"
                disabled={pending}
                onClick={handleBulkEnroll}
                className="portal-btn portal-btn--primary portal-btn--sm shrink-0"
              >
                Enroll {bulkSelected.length} selected
              </button>
            )}
          </header>

          <div className="lms-enroll-search">
            <input
              type="search"
              value={studentQuery}
              onChange={(e) => {
                setStudentQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Search students by name or email…"
              className="form-input"
              aria-label="Search students"
            />
            {showResults && studentResults.length > 0 && (
              <div className="lms-enroll-results">
                {studentResults.map((student) => (
                  <div key={student.id} className="lms-enroll-result flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={bulkSelected.includes(student.id)}
                      onChange={() => toggleBulkStudent(student.id)}
                      aria-label={`Select ${student.name ?? student.email}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="lms-enroll-result__name">{student.name ?? "Unnamed student"}</p>
                      <p className="lms-enroll-result__email">{student.email}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleEnrollStudent(student.id, student.name)}
                        className="portal-btn portal-btn--ghost portal-btn--sm"
                      >
                        Enroll
                      </button>
                      {course.requiresPayment && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleEnrollStudent(student.id, student.name, true)}
                          className="portal-btn portal-btn--primary portal-btn--sm"
                        >
                          Paid
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {enrollments.length === 0 ? (
            <p className="portal-panel-empty">No students enrolled yet. Search above to add learners.</p>
          ) : (
            <ul className="divide-y divide-white/[0.06] -mx-1">
              {enrollments.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3 px-1">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{row.user.name ?? "Student"}</p>
                    <p className="text-xs text-white/42 truncate">{row.user.email}</p>
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleUnenroll(row.userId, row.user.name)}
                    className="portal-btn portal-btn--ghost portal-btn--sm text-red-400/80 hover:text-red-400"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "assessments" && (
        <section className="portal-panel space-y-6">
          <div>
            <h2 className="portal-panel__title">Final exam</h2>
            <p className="portal-panel__desc">Course-level exam students take after completing all modules.</p>
            {course.finalExams.length === 0 ? (
              <button type="button" onClick={handleCreateFinalExam} disabled={pending} className="portal-btn portal-btn--primary mt-4">
                <Plus className="w-4 h-4" aria-hidden />
                Create final exam
              </button>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-sm text-white/70">{course.finalExams[0].title}</p>
                <Link
                  href={`${basePath}/${course.id}/quiz/${course.finalExams[0].id}`}
                  className="portal-btn portal-btn--primary portal-btn--sm"
                >
                  Edit final exam
                </Link>
              </div>
            )}
          </div>
          <div className="border-t border-white/[0.06] pt-6">
            <h2 className="portal-panel__title">Module quizzes</h2>
            <p className="portal-panel__desc">Edit quizzes from each module in the Course content tab.</p>
          </div>
        </section>
      )}

      {tab === "settings" && (
        <section className="portal-panel max-w-xl">
          <h2 className="portal-panel__title mb-4">Course settings</h2>
          <form onSubmit={handleUpdateSettings} className="space-y-5">
            <label className="flex items-center gap-3 text-sm text-white/75">
              <input name="requiresViva" type="checkbox" defaultChecked={course.requiresViva} />
              Require viva for certificate
            </label>
            <label className="flex items-center gap-3 text-sm text-white/75">
              <input name="requiresPayment" type="checkbox" defaultChecked={course.requiresPayment} />
              Paid course (students need admin payment enrollment)
            </label>
            <div>
              <label className="form-label-caps" htmlFor="pricePKR">Price (PKR)</label>
              <input id="pricePKR" name="pricePKR" type="number" min={0} defaultValue={course.pricePKR ?? ""} className="form-input" placeholder="Optional" />
            </div>
            {allCourses.length > 0 && (
              <div>
                <p className="form-label-caps mb-2">Prerequisites</p>
                <p className="text-xs text-white/45 mb-3">Students must complete these courses before enrolling.</p>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {allCourses.map((c) => (
                    <li key={c.id}>
                      <label className="flex items-center gap-2 text-sm text-white/75">
                        <input
                          type="checkbox"
                          checked={prerequisiteIds.includes(c.id)}
                          onChange={() =>
                            setPrerequisiteIds((prev) =>
                              prev.includes(c.id)
                                ? prev.filter((id) => id !== c.id)
                                : [...prev, c.id]
                            )
                          }
                        />
                        {c.title}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button type="submit" disabled={pending} className="portal-btn portal-btn--primary">
              Save settings
            </button>
          </form>
        </section>
      )}

      {moduleModal && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setModuleModal(false)}>
          <div
            className="modal-panel max-w-md"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="module-modal-title"
          >
            <div className="modal-header">
              <h2 id="module-modal-title" className="text-lg font-semibold text-white">Add module</h2>
              <button type="button" onClick={() => setModuleModal(false)} className="lms-icon-btn" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddModule}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="form-label-caps" htmlFor="module-title">Module title</label>
                  <input id="module-title" name="title" required placeholder="e.g. Week 1 — Foundations" className="form-input" />
                </div>
                <div>
                  <label className="form-label-caps" htmlFor="module-desc">Description (optional)</label>
                  <textarea id="module-desc" name="description" rows={3} className="form-textarea" placeholder="Brief overview of this module" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModuleModal(false)} className="btn btn-secondary flex-1 min-h-[44px]">
                  Cancel
                </button>
                <button type="submit" disabled={pending} className="btn btn-primary flex-1 min-h-[44px]">
                  Add module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lessonModal && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setLessonModal(null)}>
          <div
            className="modal-panel max-w-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="lesson-modal-title"
          >
            <div className="modal-header">
              <h2 id="lesson-modal-title" className="text-lg font-semibold text-white">
                {lessonModal.lesson ? "Edit lesson" : "Add lesson"}
              </h2>
              <button type="button" onClick={() => setLessonModal(null)} className="lms-icon-btn" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveLesson}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="form-label-caps" htmlFor="lesson-title">Title</label>
                  <input id="lesson-title" name="title" required defaultValue={lessonModal.lesson?.title} className="form-input" />
                </div>
                <div>
                  <label className="form-label-caps" htmlFor="lesson-type">Content type</label>
                  <select id="lesson-type" name="type" defaultValue={lessonModal.lesson?.type ?? "VIDEO"} className="form-select">
                    {lessonTypes.map((t) => (
                      <option key={t} value={t}>{formatLessonType(t)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label-caps" htmlFor="lesson-content">Content URL or text</label>
                  <textarea
                    id="lesson-content"
                    name="content"
                    rows={4}
                    defaultValue={lessonModal.lesson?.content ?? lessonContentUrl}
                    key={lessonContentUrl || lessonModal.lesson?.id}
                    className="form-textarea"
                    placeholder="YouTube URL, PDF link, or reading text"
                  />
                  <div className="mt-3">
                    <FileUploadField
                      onUploaded={(url) => {
                        setLessonContentUrl(url);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label-caps" htmlFor="lesson-duration">Duration (seconds, video only)</label>
                  <input
                    id="lesson-duration"
                    name="duration"
                    type="number"
                    min={0}
                    defaultValue={lessonModal.lesson?.duration ?? ""}
                    className="form-input"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input name="isPreview" type="checkbox" defaultChecked={lessonModal.lesson?.isPreview} />
                  Free preview (no enrollment required)
                </label>
              </div>
              <div className="modal-footer flex-col sm:flex-row">
                {lessonModal.lesson && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (!confirm("Delete this lesson?")) return;
                      startTransition(async () => {
                        await deleteLesson(lessonModal.lesson!.id);
                        setLessonModal(null);
                        refresh();
                      });
                    }}
                    className="btn btn-secondary min-h-[44px] text-red-400/90 sm:mr-auto sm:flex-none sm:px-4"
                  >
                    Delete
                  </button>
                )}
                <button type="button" onClick={() => setLessonModal(null)} className="btn btn-secondary flex-1 min-h-[44px]">
                  Cancel
                </button>
                <button type="submit" disabled={pending} className="btn btn-primary flex-1 min-h-[44px]">
                  Save lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
