import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Users, ChevronRight } from "lucide-react";
import PageHero from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Programs — RiseUp Preps Academy",
  description:
    "Explore our academic programs from Grade 6 to Grade 8, featuring comprehensive subjects taught by dedicated educators.",
};

const programs = [
  {
    grade: "Grade 6",
    description:
      "Building strong foundations in core subjects with a focus on developing critical thinking and study habits.",
    students: 10,
    teacher: "Fatima Shaikh",
    subjects: [
      { name: "Mathematics", topics: "Number systems, geometry, basic algebra" },
      { name: "English", topics: "Grammar, comprehension, creative writing" },
      { name: "Science", topics: "Living things, matter, energy, earth science" },
      { name: "Urdu", topics: "Nazm, nasr, grammar, composition" },
      { name: "Social studies", topics: "Pakistan history, geography, civics" },
      { name: "Computer science", topics: "Basics, MS Office, internet safety" },
    ],
  },
  {
    grade: "Grade 7",
    description:
      "Advancing knowledge with deeper subject exploration and analytical problem-solving.",
    students: 10,
    teacher: "Muhammad Ali",
    subjects: [
      { name: "Mathematics", topics: "Algebra, ratio, geometry, statistics" },
      { name: "English", topics: "Literature, essays, presentation skills" },
      { name: "Science", topics: "Physics basics, chemistry, biology" },
      { name: "Urdu", topics: "Literature, advanced grammar, writing" },
      { name: "Social studies", topics: "World history, economics, citizenship" },
      { name: "Computer science", topics: "Programming basics, web literacy" },
    ],
  },
  {
    grade: "Grade 8",
    description: "Preparing students for secondary education and board exam readiness.",
    students: 10,
    teacher: "Saima Parveen",
    subjects: [
      { name: "Mathematics", topics: "Advanced algebra, trigonometry, data" },
      { name: "English", topics: "Advanced literature, research, debate" },
      { name: "Science", topics: "Physics, chemistry, biology — board prep" },
      { name: "Urdu", topics: "Classical literature, advanced composition" },
      { name: "Social studies", topics: "Pakistan studies, world affairs" },
      { name: "Computer science", topics: "Python basics, web development" },
    ],
  },
];

export default function ProgramsPage() {
  return (
    <main className="bg-[#0A0E1A]">
      <PageHero
        eyebrow="Academics"
        title="Our programs"
        description="Comprehensive curriculum for Grades 6–8, designed to build knowledge, character, and confidence."
      />

      <section className="py-16 md:py-20">
        <div className="container-main space-y-8">
          {programs.map((program, i) => (
            <article key={i} className="glass-card overflow-hidden">
              <div className="p-6 md:p-8 border-b border-white/[0.06]">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{program.grade}</h2>
                    <p className="text-white/50 mt-2 max-w-xl text-sm leading-relaxed">{program.description}</p>
                  </div>
                  <div className="flex gap-6 text-sm shrink-0">
                    <div>
                      <p className="text-2xl font-bold text-[#F78C1F] font-mono">{program.students}</p>
                      <p className="text-white/40 text-xs mt-0.5">Students</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#0ABFBC] font-mono">6</p>
                      <p className="text-white/40 text-xs mt-0.5">Subjects</p>
                    </div>
                  </div>
                </div>
                <p className="flex items-center gap-2 mt-4 text-sm text-white/40">
                  <Users className="w-4 h-4 text-[#F78C1F]" />
                  Class teacher: <span className="text-white/70">{program.teacher}</span>
                </p>
              </div>
              <div className="p-6 md:p-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {program.subjects.map((subject, j) => (
                  <div
                    key={j}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.1] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#0ABFBC] shrink-0" />
                      <h3 className="font-semibold text-white text-sm">{subject.name}</h3>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed pl-6">{subject.topics}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}

          <div className="glass-card p-8 md:p-10 text-center max-w-2xl mx-auto mt-12">
            <h3 className="text-xl font-bold text-white mb-3">Ready to enroll?</h3>
            <p className="text-sm text-white/45 mb-6 leading-relaxed">
              Applications are open for the current academic year.
            </p>
            <Link href="/admissions" className="btn btn-primary min-h-[48px]">
              Apply now <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
