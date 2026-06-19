"use client";

import { type CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Heart, Shield, Users, TrendingUp, ChevronDown } from "lucide-react";
import ImpactChart from "@/components/impact/ImpactChart";
import ImpactGalaxy from "@/components/impact/ImpactGalaxy";
import ArtDirectedImage from "@/components/media/ArtDirectedImage";
import ImpactPhotoGrid from "@/components/media/ImpactPhotoGrid";
import { outcomeStories } from "@/data/impact";
import { getAcademyPhoto } from "@/data/academy-photos";
import { formatPKR } from "@/lib/format";
import type { ImpactPageData } from "@/lib/stats";
import { getFadeUp } from "@/lib/motion";

const impactRibbon = [
  "Transparency",
  "Enrollment",
  "Attendance",
  "Exam results",
  "Confirmed giving",
  "Sukkur",
  "Every rupee counted",
];

type Props = {
  data: ImpactPageData;
};

export default function ImpactPage({ data }: Props) {
  const reduceMotion = useReducedMotion();
  const periodTotal = data.monthlyDonations.reduce((sum, m) => sum + m.amount, 0);
  const fadeUp = getFadeUp(reduceMotion);
  const viewport = { once: true, margin: "-48px" as const };

  const showcasePhoto = getAcademyPhoto("whiteboard-math");

  return (
    <main className="impact-page">
      {/* ── Cinematic hero ── */}
      <section className="impact-hero" aria-labelledby="impact-hero-title">
        <div className="impact-hero__stars" aria-hidden />
        <div className="impact-hero__mesh" aria-hidden />
        <div className="container-main impact-hero__inner">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="section-eyebrow">Transparency</span>
            <h1 id="impact-hero-title" className="impact-hero__title">
              Impact you can
              <span className="impact-hero__title-accent"> verify</span>
            </h1>
            <p className="impact-hero__desc">
              Real enrollment, attendance, exam results, and confirmed giving — published so donors
              and partners see exactly where support goes.
            </p>
          </motion.div>
          <a href="#impact-galaxy" className="impact-hero__scroll" aria-label="Explore the galaxy">
            <ChevronDown className="w-5 h-5" aria-hidden />
          </a>
        </div>
      </section>

      {/* ── Scrolling ribbon ── */}
      <div className="impact-ribbon" aria-hidden>
        <div className="impact-ribbon__track">
          {[...impactRibbon, ...impactRibbon].map((word, i) => (
            <span key={`${word}-${i}`} className="impact-ribbon__word">
              {word}
              <span className="impact-ribbon__dot" />
            </span>
          ))}
        </div>
      </div>

      {/* ── Galaxy of Impact (full-viewport cosmic scene) ── */}
      <section id="impact-galaxy" className="impact-section impact-section--galaxy scroll-mt-20">
        <ImpactGalaxy data={data} reduceMotion={reduceMotion} />

        <div className="container-main">
          <motion.p
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="impact-trust-note impact-trust-note--galaxy"
          >
            <Shield className="w-4 h-4 shrink-0 text-[#0ABFBC]" aria-hidden />
            Hover any world to pause its orbit · {data.teachers} teachers supporting{" "}
            {data.students} students · {data.donorCount}+ foundation supporters
          </motion.p>
        </div>
      </section>

      {/* ── Scrollytelling journey rail ── */}
      <section className="impact-section impact-section--story">
        <div className="container-main">
          <div className="impact-story">
            <div className="impact-story__visual">
              {showcasePhoto && (
                <motion.div
                  initial={false}
                  whileInView="show"
                  viewport={viewport}
                  variants={fadeUp}
                  className="impact-story__photo-wrap"
                >
                  <ArtDirectedImage
                    src={showcasePhoto.src}
                    alt={showcasePhoto.alt}
                    treatment="glass-story"
                    objectPosition={showcasePhoto.objectPosition}
                    focalZoom={showcasePhoto.focalZoom}
                    sizes="(max-width: 900px) 100vw, 480px"
                    className="impact-story__photo"
                  />
                  <div className="impact-story__photo-glass">
                    <span className="section-eyebrow">Your gift in action</span>
                    <p className="impact-story__photo-quote">
                      Real students. Real notebooks. Real progress.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="impact-story__rail" aria-label="How support works">
              <motion.div
                initial={false}
                whileInView="show"
                viewport={viewport}
                variants={fadeUp}
                className="impact-story__rail-header"
              >
                <span className="section-eyebrow">How support works</span>
                <h2 className="impact-section__title">From enrollment to outcomes</h2>
              </motion.div>

              <div className="impact-rail">
                <div className="impact-rail__line" aria-hidden />
                {outcomeStories.map((story, i) => {
                  const Icon = story.icon;
                  return (
                    <motion.article
                      key={story.id}
                      initial={false}
                      whileInView="show"
                      viewport={{ once: true, margin: "-20%" }}
                      variants={fadeUp}
                      transition={{ delay: reduceMotion ? 0 : i * 0.1 }}
                      className="impact-rail__step"
                    >
                      <div
                        className="impact-rail__node"
                        style={{ "--node-accent": story.accent } as CSSProperties}
                      >
                        <Icon className="w-4 h-4" style={{ color: story.accent }} strokeWidth={2} />
                      </div>
                      <div className="impact-rail__body">
                        <p className="impact-rail__metric" style={{ color: story.accent }}>
                          {story.metric}
                        </p>
                        <h3 className="impact-rail__title">{story.title}</h3>
                        <p className="impact-rail__text">{story.description}</p>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Photo constellation ── */}
      <section className="impact-section impact-section--photos">
        <div className="container-main">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="impact-section__intro impact-section__intro--center"
          >
            <span className="section-eyebrow">On campus</span>
            <h2 className="impact-section__title">Where your support lands</h2>
          </motion.div>
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="impact-photos-wrap"
          >
            <ImpactPhotoGrid
              photoIds={[
                "teacher-instruction",
                "students-writing",
                "outdoor-study",
                "classroom-community",
              ]}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Giving pulse ── */}
      <section className="impact-section impact-section--giving" aria-labelledby="giving-heading">
        <div className="container-main">
          <div className="impact-giving">
            <motion.div
              initial={false}
              whileInView="show"
              viewport={viewport}
              variants={fadeUp}
              className="impact-giving__copy"
            >
              <span className="section-eyebrow">Giving trends</span>
              <h2 id="giving-heading" className="impact-section__title">
                Community support over time
              </h2>
              <p className="impact-section__desc">
                Confirmed donations by month (PKR). Hover a bar for the exact amount.
              </p>
              <div className="impact-giving__orb" aria-hidden>
                <span className="impact-giving__orb-label font-mono">6 mo.</span>
                <span className="impact-giving__orb-value">
                  {periodTotal > 0 ? formatPKR(periodTotal) : "—"}
                </span>
              </div>
            </motion.div>
            <motion.div
              initial={false}
              whileInView="show"
              viewport={viewport}
              variants={fadeUp}
              className="impact-giving__chart"
            >
              <ImpactChart data={data.monthlyDonations} periodTotal={periodTotal} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="impact-section impact-section--cta">
        <div className="container-main">
          <motion.div
            initial={false}
            whileInView="show"
            viewport={viewport}
            variants={fadeUp}
            className="impact-cta"
          >
            <div className="impact-cta__glow" aria-hidden />
            <div className="impact-cta__icon" aria-hidden>
              <Heart className="w-8 h-8 text-[#F78C1F]" strokeWidth={1.75} />
            </div>
            <h2 className="impact-cta__title font-display">Fuel the next chapter</h2>
            <p className="impact-cta__desc">
              Sponsor a student or make a one-time gift — every confirmed rupee supports teachers,
              learning materials, and campus operations.
            </p>
            <Link href="/donate" className="btn btn-primary min-h-[52px] px-8 group">
              Sponsor a student
              <ArrowRight
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
            <p className="impact-cta-footnote">
              <Users className="w-4 h-4 shrink-0" aria-hidden />
              <TrendingUp className="w-4 h-4 shrink-0 text-[#0ABFBC]" aria-hidden />
              Join {data.donorCount > 0 ? `${data.donorCount}+` : "our"} supporters ·{" "}
              {formatPKR(data.totalDonated)} raised to date
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
