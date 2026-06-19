import { GraduationCap, LineChart, HeartHandshake } from "lucide-react";
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
