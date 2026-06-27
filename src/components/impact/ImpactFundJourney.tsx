"use client";

import { type CSSProperties } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fundJourneySteps } from "@/data/impact";
import { getFadeUp } from "@/lib/motion";

type Props = {
  reduceMotion: boolean | null;
};

export default function ImpactFundJourney({ reduceMotion }: Props) {
  const fadeUp = getFadeUp(reduceMotion, 16);
  const viewport = { once: true, margin: "-48px" as const };

  return (
    <section className="impact-section impact-section--journey" aria-labelledby="impact-journey-title">
      <div className="container-main">
        <motion.header
          initial={false}
          whileInView="show"
          viewport={viewport}
          variants={fadeUp}
          className="impact-journey__head"
        >
          <div>
            <span className="section-eyebrow">Follow the rupee</span>
            <h2 id="impact-journey-title" className="impact-section__title">
              Where your support travels
            </h2>
          </div>
          <p className="impact-journey__hint">
            Scroll the journey
            <ArrowRight className="w-4 h-4" aria-hidden />
          </p>
        </motion.header>
      </div>

      <motion.div
        initial={false}
        whileInView="show"
        viewport={viewport}
        variants={fadeUp}
        className="impact-journey__track-wrap"
      >
        <div className="impact-journey__track" role="list" aria-label="How donations support students">
          {fundJourneySteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <article
                key={step.id}
                className="impact-journey__card landing-card"
                style={{ "--journey-accent": step.accent } as CSSProperties}
                role="listitem"
              >
                <div className="impact-journey__card-top">
                  <span className="impact-journey__step">{step.step}</span>
                  <span className="impact-journey__icon" aria-hidden>
                    <Icon strokeWidth={2} />
                  </span>
                </div>
                <h3 className="impact-journey__title">{step.title}</h3>
                <p className="impact-journey__text">{step.description}</p>
                {i < fundJourneySteps.length - 1 && (
                  <span className="impact-journey__connector" aria-hidden />
                )}
              </article>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
