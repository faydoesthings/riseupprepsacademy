"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart,
  ArrowRight,
  Target,
  Shield,
  Users,
  TrendingUp,
  BookOpen,
  ChevronRight,
} from "lucide-react";

type HomeStats = {
  students: number;
  teachers: number;
  subjects: number;
  totalDonated: number;
};

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
};

const features = [
  {
    icon: Target,
    title: "Personalized learning",
    description: "Small classes and attention tailored to how each student learns best.",
  },
  {
    icon: Shield,
    title: "Safe environment",
    description: "A calm, supportive campus where children can focus on growth.",
  },
  {
    icon: Users,
    title: "Community powered",
    description: "Families, teachers, and donors working together for every child.",
  },
  {
    icon: TrendingUp,
    title: "Proven outcomes",
    description: "Strong attendance and exam results through consistent, caring instruction.",
  },
];

const programs = [
  {
    grade: "Grade 6",
    summary: "Core foundations in maths, sciences, languages, and digital literacy.",
    subjects: 6,
  },
  {
    grade: "Grade 7",
    summary: "Deeper subject work with more analysis, writing, and lab-style learning.",
    subjects: 6,
  },
  {
    grade: "Grade 8",
    summary: "Board-ready preparation with advanced concepts across the curriculum.",
    subjects: 6,
  },
];

const testimonials = [
  {
    quote:
      "Seeing the direct impact of my donation on students' education has been the most rewarding experience.",
    name: "Hamza Merchant",
    role: "Donor",
  },
  {
    quote:
      "Teaching here is a mission. The students' hunger for knowledge inspires me every single day.",
    name: "Fatima Shaikh",
    role: "Teacher",
  },
  {
    quote:
      "My son's confidence and grades have improved dramatically. The teachers truly care.",
    name: "Parent of Hassan",
    role: "Grade 7 family",
  },
];

function formatPKR(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}K`;
  return String(amount);
}

export default function HomePage({ stats }: { stats?: HomeStats }) {
  const data = stats ?? { students: 30, teachers: 3, subjects: 18, totalDonated: 900000 };

  const impactStats = [
    { value: `${data.students}+`, label: "Students enrolled", accent: "#F78C1F" },
    { value: "94%", label: "Monthly attendance", accent: "#0ABFBC" },
    { value: "92%", label: "Exam pass rate", accent: "#0ABFBC" },
    { value: "12", label: "Active donors", accent: "#F78C1F" },
    { value: `PKR ${formatPKR(data.totalDonated)}`, label: "Total raised", accent: "#F78C1F" },
  ];

  return (
    <main className="bg-[#0A0E1A]">
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[#0A0E1A]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 20% 30%, rgba(5,51,92,0.45) 0%, transparent 60%)",
          }}
        />

        <div className="container-main relative z-10 py-28 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
              <motion.p variants={fade} className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F78C1F] mb-6">
                Sukkur · Sindh · Pakistan
              </motion.p>

              <motion.h1
                variants={fade}
                className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-white leading-[1.1] tracking-tight font-display max-w-xl"
              >
                Quality education for students who deserve more.
              </motion.h1>

              <motion.p variants={fade} className="mt-6 text-lg text-white/50 leading-relaxed max-w-lg">
                RiseUp Preps Academy is a not-for-profit school building futures through rigorous academics,
                mentorship, and community support.
              </motion.p>

              <motion.div variants={fade} className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link href="/donate" className="btn btn-primary min-h-[48px] px-8 text-base">
                  <Heart className="w-5 h-5" />
                  Sponsor a student
                </Link>
                <Link href="/about" className="btn btn-secondary min-h-[48px] px-8 text-base">
                  Our story
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#F78C1F]/10 blur-3xl scale-110" />
                <Image
                  src="/images/logo.png"
                  alt="RiseUp Preps Academy"
                  width={420}
                  height={420}
                  priority
                  className="relative w-full max-w-[340px] h-auto drop-shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact — single clean stats row */}
      <section className="border-y border-white/[0.06] bg-[#070B14]">
        <div className="container-main py-14 md:py-16">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-display">Our impact at a glance</h2>
            <p className="mt-3 text-sm text-white/40 max-w-md mx-auto">
              Real numbers from our academy — updated as students grow and community support continues.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-0 lg:divide-x lg:divide-white/[0.06]">
            {impactStats.map((stat, i) => (
              <div key={i} className="text-center lg:px-6 first:lg:pl-0 last:lg:pr-0">
                <p
                  className="text-3xl md:text-4xl font-bold font-mono tracking-tight"
                  style={{ color: stat.accent }}
                >
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wider text-white/40">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why RiseUp */}
      <section className="py-20 md:py-24">
        <div className="container-main">
          <div className="max-w-2xl mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-display">Why families choose RiseUp</h2>
            <p className="mt-3 text-white/50 leading-relaxed">
              We combine structure, care, and community so every child can learn with confidence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 hover:border-white/[0.12] transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-[#F78C1F]/10 flex items-center justify-center mb-5">
                  <f.icon className="w-5 h-5 text-[#F78C1F]" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 md:py-24 border-t border-white/[0.06] bg-[#0D1B2A]/50">
        <div className="container-main">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white font-display">Academic programs</h2>
              <p className="mt-3 text-white/50 max-w-lg">Grades 6–8 with a full core curriculum and dedicated teachers.</p>
            </div>
            <Link
              href="/programs"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#F78C1F] hover:text-[#E07B0E] transition-colors shrink-0"
            >
              View all programs
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {programs.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{p.grade}</h3>
                  <span className="text-xs text-white/40 font-medium">{p.subjects} subjects</span>
                </div>
                <p className="text-sm text-white/45 leading-relaxed flex-1">{p.summary}</p>
                <Link
                  href="/programs"
                  className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[#F78C1F] hover:gap-2 transition-all"
                >
                  Learn more <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-24">
        <div className="container-main">
          <h2 className="text-2xl md:text-3xl font-bold text-white font-display text-center mb-12">
            From our community
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <blockquote
                key={i}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 flex flex-col"
              >
                <p className="text-sm text-white/60 leading-relaxed italic flex-1">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-6 pt-6 border-t border-white/[0.06]">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/35 mt-0.5">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 border-t border-white/[0.06]">
        <div className="container-main">
          <div className="rounded-3xl border border-[#F78C1F]/20 bg-gradient-to-br from-[#F78C1F]/10 via-[#0D1B2A] to-[#0A0E1A] px-8 py-12 md:px-16 md:py-16 text-center max-w-3xl mx-auto">
            <BookOpen className="w-10 h-10 text-[#F78C1F] mx-auto mb-6 opacity-80" />
            <h2 className="text-2xl md:text-4xl font-bold text-white font-display leading-tight">
              PKR 2,500 sponsors one month of school for a child.
            </h2>
            <p className="mt-4 text-white/50 text-sm md:text-base leading-relaxed max-w-md mx-auto">
              Your gift covers tuition, supplies, and the daily support that keeps students in class.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/donate" className="btn btn-primary min-h-[48px] px-10 w-full sm:w-auto">
                <Heart className="w-5 h-5" />
                Donate now
              </Link>
              <Link href="/admissions" className="btn btn-secondary min-h-[48px] px-10 w-full sm:w-auto">
                Apply for admission
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
