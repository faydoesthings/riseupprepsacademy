"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Calculator,
  BookOpen,
  Sparkles,
  Users,
  HeartHandshake,
  GraduationCap,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import ArtDirectedImage from "@/components/media/ArtDirectedImage";
import { focusAreas, learningApproach } from "@/data/programs";
import { getAcademyPhoto } from "@/data/academy-photos";
import { getFadeUp, getStagger } from "@/lib/motion";

const focusIcons = [Calculator, BookOpen, Sparkles];
const teachIcons = [Users, HeartHandshake, GraduationCap];

const marqueeWords = [
  "Mathematics",
  "English",
  "Digital literacy",
  "AI readiness",
  "Small groups",
  "Live instruction",
  "Sukkur",
  "Every seat matters",
];

function ProgMethodOrbit({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div className="prog-method" aria-label="The RiseUp teaching method">
      <div className="prog-method__system">
        <div className="prog-method__path" aria-hidden />
        <div className="prog-method__core">
          <span className="prog-method__core-label font-mono">RiseUp</span>
          <span className="prog-method__core-sub">method</span>
        </div>
        <div className={`prog-method__ring${reduceMotion ? "" : " prog-method__ring--spin"}`}>
          {learningApproach.map((item, i) => {
            const Icon = teachIcons[i];
            return (
              <div
                key={item.title}
                className="prog-method__node"
                style={{ "--i": i } as CSSProperties}
                title={`${item.title}: ${item.description}`}
              >
                <div
                  className={`prog-method__sphere${reduceMotion ? "" : " prog-method__sphere--counter"}`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#F78C1F]" strokeWidth={2} aria-hidden />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ProgramsPage() {
  const reduceMotion = useReducedMotion();
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const fadeUp = getFadeUp(reduceMotion);
  const stagger = getStagger(reduceMotion);
  const viewport = { once: true, margin: "-48px" as const };

  const teacherPhoto = getAcademyPhoto("teacher-instruction");
  const mathPhoto = getAcademyPhoto("whiteboard-math");

  return (
    <main className="prog-page">
      {/* ── Cinematic hero ── */}
      <section className="prog-hero" aria-labelledby="prog-hero-title">
        <div className="prog-hero__mesh" aria-hidden />
        <div className="prog-hero__glow prog-hero__glow--orange" aria-hidden />
        <div className="prog-hero__glow prog-hero__glow--teal" aria-hidden />

        <div className="container-main prog-hero__inner">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="prog-hero__copy"
          >
            <span className="section-eyebrow">Academics</span>
            <h1 id="prog-hero-title" className="prog-hero__title">
              <span className="prog-hero__title-line">Three paths.</span>
              <span className="prog-hero__title-line prog-hero__title-line--accent">
                One destination.
              </span>
            </h1>
            <p className="prog-hero__desc">
              Mathematics, English, and digital fluency — woven together in classrooms where
              every learner gets a seat at the table.
            </p>
            <div className="prog-hero__actions">
              <a href="#prog-curriculum" className="btn btn-primary min-h-[48px] px-6">
                Explore curriculum
                <ChevronRight className="w-4 h-4" aria-hidden />
              </a>
              <Link href="/admissions" className="btn btn-secondary min-h-[48px] px-6">
                Apply now
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={false}
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="prog-hero__orbit"
            aria-label="Program areas"
          >
            {focusAreas.map((area, i) => {
              const Icon = focusIcons[i];
              return (
                <motion.a
                  key={area.id}
                  href={`#prog-${area.id}`}
                  variants={fadeUp}
                  className={`prog-orbit-pill${activeSubject === area.id ? " prog-orbit-pill--active" : ""}`}
                  style={{ "--pill-accent": area.accent } as CSSProperties}
                  onMouseEnter={() => setActiveSubject(area.id)}
                  onMouseLeave={() => setActiveSubject(null)}
                  onFocus={() => setActiveSubject(area.id)}
                  onBlur={() => setActiveSubject(null)}
                >
                  <span className="prog-orbit-pill__ring" aria-hidden />
                  <Icon className="w-4 h-4" strokeWidth={2} aria-hidden />
                  <span>{area.title}</span>
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Scrolling ribbon ── */}
      <div className="prog-ribbon" aria-hidden>
        <div className="prog-ribbon__track">
          {[...marqueeWords, ...marqueeWords].map((word, i) => (
            <span key={`${word}-${i}`} className="prog-ribbon__word">
              {word}
              <span className="prog-ribbon__dot" />
            </span>
          ))}
        </div>
      </div>

      {/* ── Bento curriculum mosaic ── */}
      <section id="prog-curriculum" className="prog-section prog-section--bento scroll-mt-24">
        <div className="container-main">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="prog-section__intro"
          >
            <span className="section-eyebrow">What we teach</span>
            <h2 className="prog-section__title">The RiseUp curriculum</h2>
            <p className="prog-section__desc">
              Not three copy-paste subjects — a deliberately layered stack built for rural
              Sindh, growing with our students.
            </p>
          </motion.div>

          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={stagger}
            className="prog-bento"
          >
            {focusAreas.map((area, i) => {
              const Icon = focusIcons[i];
              const isDigital = area.id === "digital";
              const isMath = area.id === "mathematics";
              return (
                <motion.article
                  key={area.id}
                  id={`prog-${area.id}`}
                  variants={fadeUp}
                  className={`prog-bento__cell prog-bento__cell--${area.id}${
                    activeSubject === area.id ? " prog-bento__cell--highlight" : ""
                  }`}
                  style={{ "--cell-accent": area.accent } as CSSProperties}
                  onMouseEnter={() => setActiveSubject(area.id)}
                  onMouseLeave={() => setActiveSubject(null)}
                >
                  <span className="prog-bento__index font-mono" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {isMath && mathPhoto && (
                    <div className="prog-bento__photo" aria-hidden>
                      <ArtDirectedImage
                        src={mathPhoto.src}
                        alt=""
                        treatment={mathPhoto.treatment}
                        objectPosition={mathPhoto.objectPosition}
                        focalZoom={mathPhoto.focalZoom}
                        sizes="280px"
                        className="prog-bento__photo-img"
                      />
                    </div>
                  )}

                  <div className="prog-bento__head">
                    <div className="prog-bento__icon">
                      <Icon className="w-5 h-5" strokeWidth={2} aria-hidden />
                    </div>
                    <p className="prog-bento__tagline">{area.tagline}</p>
                  </div>

                  <h3 className="prog-bento__title">{area.title}</h3>
                  <p className="prog-bento__text">{area.description}</p>

                  <ul className="prog-bento__list">
                    {area.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  {isDigital && (
                    <div className="prog-bento__tech" aria-hidden>
                      <span className="font-mono text-[10px] tracking-wider opacity-40">
                        learn · research · create · responsibly
                      </span>
                    </div>
                  )}
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Classroom immersion ── */}
      {teacherPhoto && (
        <section className="prog-classroom" aria-labelledby="prog-classroom-title">
          <div className="prog-classroom__frame">
            <ArtDirectedImage
              src={teacherPhoto.src}
              alt={teacherPhoto.alt}
              treatment={teacherPhoto.treatment}
              objectPosition={teacherPhoto.objectPosition}
              focalZoom={teacherPhoto.focalZoom}
              priority
              sizes="100vw"
              className="prog-classroom__image"
            />
            <div className="prog-classroom__scrim" aria-hidden />
          </div>

          <div className="container-main prog-classroom__content">
            <motion.div
              initial={false}
              whileInView="show"
              viewport={viewport}
              variants={fadeUp}
              className="prog-classroom__card"
            >
              <span className="section-eyebrow">Live instruction</span>
              <h2 id="prog-classroom-title" className="prog-classroom__title">
                Teachers at the board.
                <br />
                <span className="text-white/70">Students in the room.</span>
              </h2>
              <p className="prog-classroom__desc">{teacherPhoto.story}</p>
              <p className="prog-classroom__caption font-mono">{teacherPhoto.caption}</p>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Method orbit (compact) ── */}
      <section className="prog-section prog-section--method">
        <div className="container-main prog-method-bar">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="prog-method-bar__copy"
          >
            <span className="section-eyebrow">How we teach</span>
            <h2 className="prog-section__title">More than a timetable</h2>
            <ul className="prog-method-bar__list">
              {learningApproach.map((item) => (
                <li key={item.title}>{item.title}</li>
              ))}
            </ul>
          </motion.div>
          <ProgMethodOrbit reduceMotion={reduceMotion} />
        </div>
      </section>

      {/* ── Split CTA ── */}
      <section className="prog-section prog-section--cta">
        <div className="container-main">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="prog-cta"
          >
            <div className="prog-cta__panel prog-cta__panel--primary">
              <h2 className="prog-cta__title font-display">Ready to join RiseUp?</h2>
              <p className="prog-cta__desc">
                Tell us about your child — we&apos;ll guide you through admissions and find the
                right fit.
              </p>
              <Link href="/admissions" className="btn btn-primary min-h-[52px] px-8">
                Apply for admission
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
            <div className="prog-cta__panel prog-cta__panel--secondary">
              <p className="prog-cta__secondary-label font-mono">Have questions?</p>
              <p className="prog-cta__secondary-text">
                Not sure which program fits? Our team is happy to walk you through options.
              </p>
              <Link href="/contact" className="btn btn-secondary min-h-[52px] px-8">
                Ask a question
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
