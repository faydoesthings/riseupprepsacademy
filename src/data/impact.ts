import {
  BookOpen,
  GraduationCap,
  HeartHandshake,
  LineChart,
  School,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type OutcomeStory = {
  id: string;
  title: string;
  description: string;
  metric: string;
  icon: LucideIcon;
  accent: string;
};

/** Narrative chain for donors: enrollment → outcomes → funding */
export const outcomeStories: OutcomeStory[] = [
  {
    id: "students",
    title: "Students in the classroom",
    description:
      "Every enrolled child receives structured instruction, mentorship, and a safe place to learn — not just a seat on a roster.",
    metric: "Active enrollment",
    icon: GraduationCap,
    accent: "#F78C1F",
  },
  {
    id: "outcomes",
    title: "Measurable progress",
    description:
      "Attendance and exam results show whether our model is working — so donors and families can trust what they see.",
    metric: "Attendance & exams",
    icon: LineChart,
    accent: "#0ABFBC",
  },
  {
    id: "community",
    title: "Community investment",
    description:
      "Confirmed donations fund teachers, materials, and campus operations — with giving trends published here for transparency.",
    metric: "Confirmed giving",
    icon: HeartHandshake,
    accent: "#4A9EE8",
  },
];

export const fundJourneySteps = [
  {
    id: "gift",
    step: "01",
    title: "Gift confirmed",
    description: "Every donation is logged and verified before it appears on this page.",
    icon: HeartHandshake,
    accent: "#F78C1F",
  },
  {
    id: "teachers",
    step: "02",
    title: "Teachers & mentorship",
    description: "Salaries and daily instruction for the educators who know students by name.",
    icon: Users,
    accent: "#0ABFBC",
  },
  {
    id: "supplies",
    step: "03",
    title: "Books & supplies",
    description: "Notebooks, whiteboard materials, and the basics that keep classrooms running.",
    icon: BookOpen,
    accent: "#4A9EE8",
  },
  {
    id: "campus",
    step: "04",
    title: "Safe campus",
    description: "Rent, utilities, and operations that keep RiseUp open every school day.",
    icon: School,
    accent: "#F78C1F",
  },
  {
    id: "outcomes",
    step: "05",
    title: "Outcomes published",
    description: "Attendance, exams, and enrollment updated here — no hidden numbers.",
    icon: Sparkles,
    accent: "#0ABFBC",
  },
] as const;

export const impactRibbon = [
  "Transparency",
  "Enrollment",
  "Attendance",
  "Exam results",
  "Confirmed giving",
  "Sukkur",
  "Every rupee counted",
] as const;
