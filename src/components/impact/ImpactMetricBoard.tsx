"use client";

import { type CSSProperties } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Shield, TrendingUp, Users } from "lucide-react";
import type { ImpactPageData } from "@/lib/stats";
import { formatPKR } from "@/lib/format";
import { getFadeUp } from "@/lib/motion";

type Props = {
  data: ImpactPageData;
  reduceMotion: boolean | null;
};

function ProgressRing({
  value,
  accent,
  label,
}: {
  value: number;
  accent: string;
  label: string;
}) {
  return (
    <div className="impact-ring-wrap">
      <div
        className="impact-ring"
        style={{ "--ring-pct": value, "--ring-accent": accent } as CSSProperties}
        role="img"
        aria-label={`${label}: ${value}%`}
      >
        <span className="impact-ring__value">{value}%</span>
      </div>
      <p className="impact-ring__label">{label}</p>
    </div>
  );
}

export default function ImpactMetricBoard({ data, reduceMotion }: Props) {
  const fadeUp = getFadeUp(reduceMotion, 18);
  const viewport = { once: true, margin: "-64px" as const };

  return (
    <section
      id="impact-board"
      className="impact-section impact-section--board scroll-mt-24"
      aria-labelledby="impact-board-title"
    >
      <div className="container-main">
        <motion.header
          initial={false}
          whileInView="show"
          viewport={viewport}
          variants={fadeUp}
          className="impact-board__head"
        >
          <div>
            <span className="section-eyebrow">Live dashboard</span>
            <h2 id="impact-board-title" className="impact-section__title">
              The numbers we publish
            </h2>
          </div>
          <p className="impact-board__lede">
            Updated from academy records — the same metrics we share with donors and families.
          </p>
        </motion.header>

        <motion.div
          initial={false}
          whileInView="show"
          viewport={viewport}
          variants={fadeUp}
          className="impact-board"
          aria-label="Impact metrics"
        >
          <article className="impact-board__cell impact-board__cell--hero">
            <div className="impact-board__hero-top">
              <span className="impact-board__icon" aria-hidden>
                <GraduationCap strokeWidth={2} />
              </span>
              <span className="impact-board__live">
                <span className="impact-board__live-dot" aria-hidden />
                Live
              </span>
            </div>
            <p className="impact-board__value impact-board__value--hero">{data.students}</p>
            <p className="impact-board__label">Students enrolled</p>
            <p className="impact-board__detail">
              {data.teachers} teachers · small classes · Sukkur & Rohri
            </p>
          </article>

          <article className="impact-board__cell impact-board__cell--ring impact-board__cell--ring-a">
            <ProgressRing value={data.attendanceRate} accent="#0ABFBC" label="Monthly attendance" />
          </article>

          <article className="impact-board__cell impact-board__cell--ring impact-board__cell--ring-b">
            <ProgressRing value={data.passRate} accent="#4A9EE8" label="Exam pass rate" />
          </article>

          <article className="impact-board__cell impact-board__cell--stat impact-board__cell--donors">
            <Users className="impact-board__mini-icon text-[#F78C1F]" aria-hidden />
            <p className="impact-board__value">{data.donorCount}+</p>
            <p className="impact-board__label">Active donors</p>
          </article>

          <article className="impact-board__cell impact-board__cell--raised">
            <TrendingUp className="impact-board__mini-icon text-[#0ABFBC]" aria-hidden />
            <p className="impact-board__value impact-board__value--raised">
              PKR {formatPKR(data.totalDonated)}
            </p>
            <p className="impact-board__label">Total confirmed giving</p>
          </article>

          <div className="impact-board__trust">
            <Shield className="w-4 h-4 shrink-0 text-[#0ABFBC]" aria-hidden />
            <p>
              100% of published figures come from confirmed records — attendance logs, exam results,
              and verified donations.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
