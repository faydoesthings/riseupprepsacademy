import { ClipboardList, Phone, School } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const admissionSteps = [
  {
    step: "01",
    title: "Submit application",
    description: "Share student and parent details — takes about five minutes.",
  },
  {
    step: "02",
    title: "Team review",
    description: "Our admissions office reviews fit, grade level, and availability.",
  },
  {
    step: "03",
    title: "Family call",
    description: "We contact you within 3–5 business days with next steps.",
  },
] as const;

/** Stored in DB as human-readable grade strings (e.g. "Grade 6"). */
export const gradeOptionGroups = [
  {
    label: "Primary",
    options: [1, 2, 3, 4, 5].map((n) => ({
      value: `Grade ${n}`,
      label: `Grade ${n}`,
    })),
  },
  {
    label: "Middle",
    options: [6, 7, 8].map((n) => ({
      value: `Grade ${n}`,
      label: `Grade ${n}`,
    })),
  },
  {
    label: "Secondary",
    options: [9, 10, 11, 12].map((n) => ({
      value: `Grade ${n}`,
      label: `Grade ${n}`,
    })),
  },
  {
    label: "Need help choosing",
    options: [
      {
        value: "Placement assessment",
        label: "Not sure — schedule placement assessment",
      },
    ],
  },
] as const;

/** Flat list for validation / lookups */
export const allGradeOptionValues = gradeOptionGroups.flatMap((g) =>
  g.options.map((o) => o.value)
);

const legacyGradeLabels: Record<string, string> = {
  "1": "Grade 1",
  "2": "Grade 2",
  "3": "Grade 3",
  "4": "Grade 4",
  "5": "Grade 5",
  "6": "Grade 6",
  "7": "Grade 7",
  "8": "Grade 8",
  "9": "Grade 9",
  "10": "Grade 10",
  "11": "Grade 11",
  "12": "Grade 12",
  primary: "Primary (Grades 1–5)",
  middle: "Middle (Grades 6–8)",
  secondary: "Secondary (Grades 9–12)",
  assessment: "Placement assessment",
};

/** Display label for admin tables and dashboards */
export function formatGradeApplying(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  const trimmed = value.trim();
  if (trimmed.startsWith("Grade ")) return trimmed;
  return legacyGradeLabels[trimmed] ?? trimmed;
}

export const admissionsHighlights: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: School,
    title: "All grades welcome",
    description:
      "We place students by age, ability, and goals — focused on maths, English, and digital readiness.",
  },
  {
    icon: ClipboardList,
    title: "Simple process",
    description: "One online form. Documents can be shared during your campus visit.",
  },
  {
    icon: Phone,
    title: "Personal follow-up",
    description: "A real conversation with our team — not an automated rejection email.",
  },
];
