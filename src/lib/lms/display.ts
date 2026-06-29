const LESSON_TYPE_LABELS: Record<string, string> = {
  VIDEO: "Video",
  PDF: "PDF document",
  SLIDES: "Slides",
  READING: "Reading",
  EXTERNAL_LINK: "External link",
  DOWNLOAD: "Download",
  PRACTICE: "Practice",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const QUIZ_TYPE_LABELS: Record<string, string> = {
  MODULE_QUIZ: "Module quiz",
  FINAL_EXAM: "Final exam",
  PRACTICE: "Practice quiz",
};

export function formatLessonType(type: string): string {
  return LESSON_TYPE_LABELS[type] ?? type.replace(/_/g, " ").toLowerCase();
}

export function formatDifficulty(difficulty: string | null | undefined): string {
  if (!difficulty) return "Course";
  return DIFFICULTY_LABELS[difficulty] ?? difficulty;
}

export function formatQuizType(type: string): string {
  return QUIZ_TYPE_LABELS[type] ?? type.replace(/_/g, " ").toLowerCase();
}

export function formatDuration(seconds: number | null | undefined): string | null {
  if (!seconds || seconds <= 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs}s`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}
