export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  initials: string;
  bio: string;
  isFounder?: boolean;
  /** Add photos under public/images/team/{slug}.jpg */
  photo?: string;
  /** Crop tuning — scale > 1 zooms in; position sets object-position */
  photoZoom?: number;
  photoPosition?: string;
  /** Desktop cascade position (founder is always center) */
  cascade?: "left-outer" | "left-inner" | "right-inner" | "right-outer";
  accent: string;
};

export const teamMembers: TeamMember[] = [
  {
    slug: "barkat-ali-palh",
    name: "Barkat Ali Palh",
    role: "Founder & Director",
    initials: "BAP",
    bio: "Visionary leader committed to transforming education in Sindh through technology and community support.",
    isFounder: true,
    photo: "/images/team/barkat-ali-palh.jpg?v=2",
    photoPosition: "center 18%",
    accent: "#F78C1F",
  },
  {
    slug: "ameer-hamza",
    name: "Ameer Hamza",
    role: "Head of Academics",
    initials: "AH",
    bio: "M.Ed graduate with 8+ years of experience in mathematics and curriculum development.",
    photo: "/images/team/ameer-hamza.png?v=1",
    photoPosition: "center 12%",
    cascade: "left-inner",
    accent: "#0ABFBC",
  },
  {
    slug: "muhammad-raffay",
    name: "Muhammad Raffay",
    role: "Strategic Advisor — Finance & Donor Relations",
    initials: "MRF",
    bio: "Advises on fundraising strategy, donor partnerships, and transparent stewardship so every contribution reaches students with accountability.",
    photo: "/images/team/muhammad-raffay.png?v=2",
    photoPosition: "center 14%",
    cascade: "right-inner",
    accent: "#0ABFBC",
  },
  {
    slug: "saima-parveen",
    name: "Saima Parveen",
    role: "IT & Science Faculty",
    initials: "SP",
    bio: "BSc Computer Science, bringing technology literacy and scientific inquiry to students.",
    cascade: "right-outer",
    accent: "#F78C1F",
  },
  {
    slug: "ahmed-khan",
    name: "Ahmed Khan",
    role: "Finance & Operations",
    initials: "AK",
    bio: "Transparent financial operations and accountable stewardship of every donation received.",
    cascade: "left-outer",
    accent: "#F78C1F",
  },
];

export const timeline = [
  {
    year: "2024",
    title: "The vision",
    description:
      "RiseUp Preps Academy was conceived to provide quality education to underprivileged children in Sindh.",
  },
  {
    year: "2025",
    title: "Foundation",
    description:
      "Established in Sukkur/Rohri with our first cohort of students and a dedicated teaching team.",
  },
  {
    year: "2026",
    title: "Digital platform",
    description:
      "Integrated portal launched — connecting families, teachers, and donors in one transparent system.",
  },
];

export const values = [
  {
    title: "Compassion",
    description: "Every decision is guided by genuine care for our students' well-being and future.",
    accent: "#F78C1F",
  },
  {
    title: "Excellence",
    description: "High standards in teaching, administration, and measurable student outcomes.",
    accent: "#0ABFBC",
  },
  {
    title: "Community",
    description: "Education thrives through partnerships with families, teachers, and donors.",
    accent: "#4A9EE8",
  },
  {
    title: "Integrity",
    description: "Transparent operations and accountable use of every gift we receive.",
    accent: "#F78C1F",
  },
];
