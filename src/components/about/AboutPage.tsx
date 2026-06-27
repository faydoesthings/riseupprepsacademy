"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Target, Eye, Heart, Users, Award, Star, MapPin } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import TeamShowcase from "@/components/about/TeamShowcase";
import CampusPhotoMarquee from "@/components/media/CampusPhotoMarquee";
import { teamMembers, timeline, values } from "@/data/about";
import BackToTop from "@/components/ui/BackToTop";
import { getFadeUp } from "@/lib/motion";

const valueIcons = [Heart, Star, Users, Award];

const aboutSections = [
  { id: "about-vision", label: "Vision" },
  { id: "about-journey", label: "Journey" },
  { id: "about-values", label: "Values" },
  { id: "about-team", label: "Team" },
  { id: "about-campus", label: "Campus" },
] as const;

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-header--center max-w-2xl w-full mx-auto text-center section-header-block">
      {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
      <h2 className="text-2xl md:text-3xl font-bold text-white font-display tracking-tight leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 md:mt-5 text-base text-white/55 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

export default function AboutPage() {
  const reduceMotion = useReducedMotion();

  const fadeUp = getFadeUp(reduceMotion);

  const viewport = { once: true, margin: "-64px" as const };

  return (
    <main className="bg-[#0A0E1A] overflow-x-hidden">
      <PageHero
        compact
        eyebrow="Our story"
        title="About RiseUp Preps"
        description="A not-for-profit academy in Sukkur — rigorous academics, mentorship, and community support."
      />

      <nav className="about-page-nav" aria-label="On this page">
        <div className="container-main about-page-nav__inner">
          <ul className="about-page-nav__list">
            {aboutSections.map(({ id, label }) => (
              <li key={id}>
                <a href={`#${id}`} className="about-page-nav__link">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mission & vision */}
      <section
        id="about-vision"
        className="about-section about-section--tight border-b border-white/[0.06] scroll-mt-24"
      >
        <div className="container-main">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="about-vision-mission"
          >
            <article className="about-vision-mission__card about-vision-mission__card--vision">
              <div className="about-vision-mission__icon about-vision-mission__icon--vision">
                <Eye className="w-5 h-5 text-blue-400" strokeWidth={2} aria-hidden />
              </div>
              <h2 className="about-vision-mission__heading">Vision</h2>
              <p className="about-vision-mission__text">
                Transform education in rural Sindh — developing leaders who uplift their communities.
              </p>
            </article>
            <article className="about-vision-mission__card about-vision-mission__card--mission">
              <div className="about-vision-mission__icon about-vision-mission__icon--mission">
                <Target className="w-5 h-5 text-orange-400" strokeWidth={2} aria-hidden />
              </div>
              <h2 className="about-vision-mission__heading">Mission</h2>
              <p className="about-vision-mission__text">
                Accessible, quality schooling in Sukkur and Rohri through dedicated teaching and
                transparent partnerships.
              </p>
            </article>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section
        id="about-journey"
        className="about-section about-journey section-padding border-b border-white/[0.06] bg-[#070B14]/50 scroll-mt-24"
      >
        <div className="container-main section-centered">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="about-journey__header w-full mt-16 mb-8"
          >
            <SectionIntro
              eyebrow="Milestones"
              title="Our journey"
              description="From a vision to a thriving academy — every step driven by purpose."
            />
          </motion.div>
          <div className="about-journey__divider" aria-hidden />
          <div className="about-timeline-wrap w-full mt-8">
            <ol className="about-timeline">
              {timeline.map((item, i) => (
                <motion.li
                  key={item.year}
                  initial={false}
                  whileInView="show"
                  viewport={viewport}
                  variants={fadeUp}
                  transition={{ delay: reduceMotion ? 0 : i * 0.08 }}
                  className="about-timeline__item"
                >
                  <span className="about-timeline__dot" aria-hidden />
                  <span className="about-timeline__year">{item.year}</span>
                  <h3 className="about-timeline__title">{item.title}</h3>
                  <p className="about-timeline__text">{item.description}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Values */}
      <section
        id="about-values"
        className="about-section about-values section-padding border-b border-white/[0.06] scroll-mt-24"
      >
        <div className="container-main section-centered">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="w-full"
          >
            <SectionIntro eyebrow="What guides us" title="Core values" />
          </motion.div>
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="about-values__grid grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 w-full max-w-5xl mx-auto mt-10 md:mt-12"
          >
            {values.map((value, i) => {
              const Icon = valueIcons[i];
              return (
                <article
                  key={value.title}
                  className="landing-card landing-card--center flex flex-col items-center text-center h-full"
                >
                  <div
                    className="landing-card__icon mb-6"
                    style={{ borderColor: `${value.accent}40`, background: `${value.accent}18` }}
                  >
                    <Icon
                      className="w-[1.375rem] h-[1.375rem]"
                      style={{ color: value.accent, stroke: value.accent }}
                      strokeWidth={2}
                    />
                  </div>
                  <h3 className="font-semibold text-white mb-3">{value.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{value.description}</p>
                </article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section
        id="about-team"
        className="about-section section-padding border-b border-white/[0.06] bg-[#0D1B2A]/30 scroll-mt-24"
      >
        <div className="container-main">
          <motion.div initial={false} whileInView="show" viewport={viewport} variants={fadeUp}>
            <SectionIntro
              eyebrow="Leadership"
              title="Meet our team"
              description="Educators and leaders committed to every child in our care."
            />
          </motion.div>
          <TeamShowcase members={teamMembers} />
        </div>
      </section>

      {/* Campus life */}
      <section
        id="about-campus-life"
        className="about-section section-padding border-b border-white/[0.06] bg-[#070B14]/40 scroll-mt-24 overflow-hidden"
      >
        <div className="container-main section-centered">
          <motion.div initial={false} whileInView="show" viewport={viewport} variants={fadeUp}>
            <SectionIntro
              eyebrow="On campus"
              title="Learning in Sukkur"
              description="Modest rooms, plastic chairs, and whiteboards — and students who show up ready to work."
            />
          </motion.div>
        </div>
        <motion.div
          initial={false}
          whileInView="show"
          viewport={viewport}
          variants={fadeUp}
          className="mt-10 md:mt-12"
        >
          <CampusPhotoMarquee />
        </motion.div>
      </section>

      {/* Campus */}
      <section id="about-campus" className="about-section section-padding scroll-mt-24">
        <div className="container-main max-w-5xl mx-auto">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="landing-card overflow-hidden p-0"
          >
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-center">
                <div className="landing-card__icon mb-6">
                  <MapPin className="w-[1.375rem] h-[1.375rem] text-[#F78C1F]" strokeWidth={2} />
                </div>
                <h2 className="text-xl font-bold text-white mb-3 tracking-tight">Our campus</h2>
                <p className="text-sm text-white/55 leading-relaxed mb-5">
                  Sukkur / Rohri, Sindh — a safe, inspiring place to learn.
                </p>
                <p className="text-sm text-white/45">Monday – Saturday · 8:00 AM – 2:00 PM</p>
                <Link href="/contact" className="landing-link mt-6 w-fit">
                  Get directions & contact
                </Link>
              </div>
              <div className="md:col-span-3 min-h-[260px] md:min-h-[320px] bg-[#0D1B2A]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56640.42047147098!2d68.82!3d27.71!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3935f5ff7c6e7b41%3A0xb45e8f2d4a93c7a!2sSukkur%2C%20Sindh%2C%20Pakistan!5e0!3m2!1sen!2s!4v1"
                  width="100%"
                  height="100%"
                  className="min-h-[260px] md:min-h-full w-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="RiseUp Academy location on map"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <BackToTop />
    </main>
  );
}
