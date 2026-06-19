export type PhotoQuality = "high" | "medium" | "low";

export type PhotoTreatment =
  | "ambient"
  | "hero-masked"
  | "focal-card"
  | "glass-story"
  | "duotone-warm"
  | "duotone-teal"
  | "mono-soft"
  | "collage-offset"
  | "edge-fade";

export type AcademyPhoto = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  story?: string;
  quality: PhotoQuality;
  /** Art-direction notes — informs treatment, not shown in UI */
  assessment: string[];
  treatment: PhotoTreatment;
  objectPosition?: string;
  focalZoom?: number;
};

/** Authentic campus photography — treatments chosen per asset quality & storytelling role */
export const academyPhotos: AcademyPhoto[] = [
  {
    id: "outdoor-study",
    src: "/images/academy/outdoor-study-session.png",
    alt: "Students writing in notebooks during an outdoor study session beside the campus wall",
    caption: "Learning beyond the desk",
    story: "When classrooms fill up, students keep studying — focused, together, and determined.",
    quality: "medium",
    assessment: [
      "medium quality",
      "harsh natural light",
      "visually distracting brick background",
      "compositionally weak — cluttered chairs",
    ],
    treatment: "duotone-teal",
    objectPosition: "45% 55%",
    focalZoom: 1.08,
  },
  {
    id: "classroom-community",
    src: "/images/academy/classroom-community.png",
    alt: "Mixed classroom with students seated and a teacher guiding the lesson",
    caption: "A classroom built on trust",
    story: "Small groups, attentive faces, and teachers who know every student by name.",
    quality: "medium",
    assessment: [
      "medium quality",
      "poorly lit overhead light",
      "visually distracting ceiling tiles",
      "compositionally weak — excess wall space",
    ],
    treatment: "edge-fade",
    objectPosition: "50% 62%",
    focalZoom: 1.05,
  },
  {
    id: "students-writing",
    src: "/images/academy/students-writing-session.png",
    alt: "Students seated in rows, heads down, writing diligently in their notebooks",
    caption: "Quiet focus, real effort",
    story: "Exam season or daily practice — our students show up and put pen to paper.",
    quality: "medium",
    assessment: [
      "medium quality",
      "low-resolution feel at large scale",
      "compositionally weak — high angle clutter",
    ],
    treatment: "mono-soft",
    objectPosition: "50% 45%",
    focalZoom: 1.06,
  },
  {
    id: "whiteboard-math",
    src: "/images/academy/classroom-whiteboard-math.png",
    alt: "Students working while mathematical notes fill the whiteboard behind them",
    caption: "Rigorous academics in action",
    story: "Mathematics on the board, notebooks open — the daily rhythm of RiseUp Preps.",
    quality: "medium",
    assessment: [
      "medium quality",
      "visually distracting doors and whiteboard clutter",
      "compositionally weak — busy background",
    ],
    treatment: "glass-story",
    objectPosition: "55% 40%",
    focalZoom: 1.04,
  },
  {
    id: "teacher-instruction",
    src: "/images/academy/teacher-instruction.png",
    alt: "Teacher writing English lesson notes on the whiteboard while students follow along",
    caption: "Teachers who show up every day",
    story: "Live instruction at the board — English, structure, and the confidence to speak up.",
    quality: "medium",
    assessment: [
      "medium quality",
      "functional indoor lighting",
      "compositionally weak — doorway and stairs visible",
    ],
    treatment: "hero-masked",
    objectPosition: "58% 42%",
    focalZoom: 1.03,
  },
];

export function getAcademyPhoto(id: string): AcademyPhoto | undefined {
  return academyPhotos.find((p) => p.id === id);
}
