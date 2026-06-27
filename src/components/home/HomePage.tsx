"use client";

import { type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  Heart,
  ArrowRight,
  Target,
  Shield,
  Users,
  TrendingUp,
  BookOpen,
  ChevronRight,
  Quote,
  Calculator,
  Sparkles,
} from "lucide-react";
import { focusAreas } from "@/data/programs";
import { getFadeUp, getStagger } from "@/lib/motion";
import StorytellingGallery from "@/components/media/StorytellingGallery";
import HomeImpactGlance from "@/components/home/HomeImpactGlance";
import { getAcademyPhoto } from "@/data/academy-photos";

type HomeStats = {
  students: number;
  teachers: number;
  subjects: number;
  totalDonated: number;
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

const focusIcons = [Calculator, BookOpen, Sparkles];

const testimonials = [
  {
    quote:
      "Seeing the direct impact of my donation on students' education has been the most rewarding experience.",
    name: "Hamza Merchant",
    role: "Donor",
    initials: "HM",
    accent: "#F78C1F",
  },
  {
    quote:
      "Teaching here is a mission. The students' hunger for knowledge inspires me every single day.",
    name: "Fatima Shaikh",
    role: "Teacher",
    initials: "FS",
    accent: "#0ABFBC",
  },
  {
    quote:
      "My son's confidence and grades have improved dramatically. The teachers truly care.",
    name: "Parent of Hassan",
    role: "Parent",
    initials: "PH",
    accent: "#4A9EE8",
  },
];

const featureAccents = ["#F78C1F", "#0ABFBC", "#4A9EE8", "#F78C1F"];

function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  id?: string;
}) {
  const wrapClass =
    align === "center"
      ? "section-header--center max-w-2xl w-full"
      : "max-w-2xl w-full text-left";

  return (
    <div className={wrapClass}>
      {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
      <h2
        id={id}
        className="text-2xl md:text-3xl lg:text-[2rem] font-bold text-white font-display tracking-tight leading-tight w-full"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 md:mt-5 text-base text-white/55 leading-relaxed max-w-xl w-full">
          {description}
        </p>
      )}
    </div>
  );
}

export default function HomePage({ stats }: { stats?: HomeStats }) {
  const reduceMotion = useReducedMotion();
  const data = stats ?? { students: 30, teachers: 3, subjects: 18, totalDonated: 900000 };

  const fadeUp = getFadeUp(reduceMotion, 24);
  const stagger = getStagger(reduceMotion, 0.08, 0.05);
  const heroPhoto = getAcademyPhoto("teacher-instruction");

  const viewport = { once: true, margin: "-80px" as const };

  return (
    <main className="home-page overflow-x-hidden">
      {/* Hero */}
      <section className="home-hero bg-slate-900" aria-labelledby="home-hero-heading">
        {heroPhoto && (
          <div className="home-hero__banner" aria-hidden>
            <Image
              src={heroPhoto.src}
              alt=""
              fill
              priority
              quality={90}
              sizes="100vw"
              className="home-hero__banner-img"
              style={{ objectPosition: "72% 38%" }}
            />
            <div className="home-hero__banner-scrim" />
          </div>
        )}
        <div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"
          aria-hidden
        />

        <div className="container-main home-hero__inner relative z-10">
          <div className="home-hero__content flex flex-col justify-center">
              <p className="hero-eyebrow text-xs sm:text-sm tracking-widest text-orange-400/80">
                Sukkur · Sindh · Pakistan
              </p>

              <h1
                id="home-hero-heading"
                className="hero-headline text-[2rem] sm:text-4xl lg:text-[3.125rem] font-bold text-white leading-[1.12] tracking-tight font-display mb-6"
              >
                Quality education for students who deserve&nbsp;more.
              </h1>

              <p className="hero-subtitle">
                RiseUp Preps Academy is a not-for-profit school building futures through rigorous
                academics, mentorship, and community support.
              </p>

              <div className="home-hero__actions flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-5 sm:items-center">
                <Link
                  href="/donate"
                  className="btn btn-primary min-h-[44px] px-8 text-base w-full sm:w-auto"
                >
                  <Heart className="w-5 h-5 shrink-0" aria-hidden />
                  Sponsor a student
                </Link>
                <Link href="/about" className="hero-story-link group">
                  <span>Our story</span>
                  <ArrowRight
                    className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </div>

              <ul className="hero-trust-bar" aria-label="Academy at a glance">
                <li className="hero-trust-bar__item">
                  <span className="hero-trust-bar__value">{data.students}+</span>
                  <span className="hero-trust-bar__label">Students</span>
                </li>
                <li className="hero-trust-bar__divider" aria-hidden />
                <li className="hero-trust-bar__item">
                  <span className="hero-trust-bar__value">{data.teachers}</span>
                  <span className="hero-trust-bar__label">Teachers</span>
                </li>
                <li className="hero-trust-bar__divider" aria-hidden />
                <li className="hero-trust-bar__item">
                  <span className="hero-trust-bar__value">2025</span>
                  <span className="hero-trust-bar__label">Founded</span>
                </li>
              </ul>
          </div>
        </div>

        <a href="#impact-heading" className="home-hero__scroll-hint" aria-label="Scroll to impact section">
          <span className="home-hero__scroll-hint-label">Our impact</span>
          <ChevronRight className="home-hero__scroll-hint-icon" aria-hidden />
        </a>
      </section>

      {/* Impact */}
      <HomeImpactGlance stats={{ students: data.students, totalDonated: data.totalDonated }} />

      {/* Campus life */}
      <section
        className="section-padding border-b border-white/[0.06] bg-[#070B14]/60"
        aria-labelledby="campus-life-heading"
      >
        <div className="container-main section-centered">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="flex justify-center section-header-block w-full mb-10 md:mb-12"
          >
            <SectionHeader
              id="campus-life-heading"
              eyebrow="Real classrooms"
              title="Where your support shows up"
              description="These are our students and teachers — not stock photography. Every gift helps keep moments like these happening every day."
              align="center"
            />
          </motion.div>
          <motion.div initial={false} whileInView="show" viewport={viewport} variants={fadeUp}>
            <StorytellingGallery
              photoIds={["teacher-instruction", "students-writing", "outdoor-study"]}
            />
          </motion.div>
        </div>
      </section>

      {/* Why RiseUp */}
      <section className="section-padding" aria-labelledby="why-heading">
        <div className="container-main">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="flex justify-center section-header-block w-full"
          >
            <SectionHeader
              id="why-heading"
              eyebrow="Why RiseUp"
              title="Why families choose us"
              description="We combine structure, care, and community so every child can learn with confidence."
              align="center"
            />
          </motion.div>

          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
          >
            {features.map((f, i) => {
              const Icon = f.icon;
              const accent = featureAccents[i] ?? "#F78C1F";
              return (
              <motion.article
                key={f.title}
                variants={fadeUp}
                className="landing-card landing-card--center home-feature-card flex flex-col items-center h-full text-center"
                style={{ "--feature-accent": accent } as CSSProperties}
              >
                <div className="landing-card__icon home-feature-card__icon" aria-hidden>
                  <Icon className="w-[1.375rem] h-[1.375rem]" strokeWidth={2} />
                </div>
                <h3 className="mt-6 text-base font-semibold text-white mb-3 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-sm text-white/55 leading-relaxed">{f.description}</p>
              </motion.article>
            );
            })}
          </motion.div>
        </div>
      </section>

      {/* Programs */}
      <section
        className="section-padding border-t border-white/[0.06] bg-[#0D1B2A]/40"
        aria-labelledby="programs-heading"
      >
        <div className="container-main section-centered">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="section-centered__header section-header-block flex flex-col items-center"
          >
            <SectionHeader
              id="programs-heading"
              eyebrow="Academics"
              title="Three pillars of learning"
              description="Mathematics and English, plus digital fluency and responsible AI skills — open to students across grades."
              align="center"
            />
            <Link href="/programs" className="landing-link mt-6">
              View all programs
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
          </motion.div>

          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={stagger}
            className="programs-pillars w-full max-w-5xl mx-auto"
          >
            {focusAreas.map((area, i) => {
              const Icon = focusIcons[i];
              return (
                <motion.article
                  key={area.id}
                  variants={fadeUp}
                  className="landing-card programs-pillar flex flex-col h-full"
                  style={{ "--pillar-accent": area.accent } as CSSProperties}
                >
                  <div
                    className="programs-pillar__icon"
                    style={{ borderColor: `${area.accent}40`, background: `${area.accent}14` }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: area.accent, stroke: area.accent }}
                      strokeWidth={2}
                      aria-hidden
                    />
                  </div>
                  <p className="programs-pillar__tagline" style={{ color: area.accent }}>
                    {area.tagline}
                  </p>
                  <h3 className="text-xl font-bold text-white tracking-tight mb-3">{area.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed flex-1">{area.description}</p>
                  <Link href="/programs" className="landing-link mt-8">
                    Learn more
                    <ChevronRight className="w-4 h-4" aria-hidden />
                  </Link>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding" aria-labelledby="testimonials-heading">
        <div className="container-main">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="flex justify-center section-header-block w-full"
          >
            <SectionHeader
              id="testimonials-heading"
              eyebrow="Community"
              title="From our community"
              description="Voices from donors, teachers, and families who believe in our mission."
              align="center"
            />
          </motion.div>

          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={stagger}
            className="grid md:grid-cols-3 gap-5 md:gap-6"
          >
            {testimonials.map((t) => (
              <motion.blockquote
                key={t.name}
                variants={fadeUp}
                className="landing-card landing-card--center home-testimonial flex flex-col items-center h-full"
              >
                <div
                  className="home-testimonial__avatar"
                  style={{ "--avatar-accent": t.accent } as CSSProperties}
                  aria-hidden
                >
                  {t.initials}
                </div>
                <Quote className="w-7 h-7 text-[#F78C1F]/25 mb-5 shrink-0" aria-hidden />
                <p className="text-sm text-white/65 leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-8 pt-6 border-t border-white/[0.08] w-full text-center">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <span className="home-testimonial__role">{t.role}</span>
                </footer>
              </motion.blockquote>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-white/[0.06] pb-20 md:pb-28">
        <div className="container-main section-centered">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="section-centered__cta landing-cta-card relative overflow-hidden rounded-3xl border border-[#F78C1F]/25 bg-gradient-to-br from-[#F78C1F]/12 via-[#0D1B2A] to-[#0A0E1A] text-center"
          >
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, rgba(247,140,31,0.2) 0%, transparent 55%)",
              }}
              aria-hidden
            />
            <div className="relative flex flex-col items-center w-full mx-auto">
              <div className="flex flex-col items-center w-full gap-5 md:gap-6">
                <span className="home-cta-badge">Monthly sponsorship</span>
                <div className="landing-card__icon landing-card__icon--lg border-white/15 bg-white/[0.06]" aria-hidden>
                  <BookOpen className="text-white/80" strokeWidth={2} />
                </div>
                <h2 className="w-full text-2xl sm:text-3xl md:text-[2rem] font-bold text-white font-display leading-tight tracking-tight text-center px-2">
                  PKR 2,500 sponsors one month of school for a child.
                </h2>
                <p className="w-full max-w-lg text-white/55 text-sm sm:text-base leading-relaxed text-center px-3 sm:px-4">
                  Your gift covers tuition, supplies, and the daily support that keeps students in
                  class.
                </p>
              </div>
              <div className="landing-cta-actions flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 w-full max-w-md">
                <Link href="/donate" className="btn btn-primary min-h-[44px] px-10 w-full sm:w-auto">
                  <Heart className="w-5 h-5" aria-hidden />
                  Donate now
                </Link>
                <Link href="/admissions" className="btn btn-outline min-h-[44px] px-10 w-full sm:w-auto">
                  Apply for admission
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
