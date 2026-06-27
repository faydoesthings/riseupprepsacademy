"use client";

import { type CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarCheck,
  GraduationCap,
  Heart,
  TrendingUp,
  Users,
} from "lucide-react";
import { getFadeUp, getStagger } from "@/lib/motion";

type HomeStats = {
  students: number;
  totalDonated: number;
};

function formatPKR(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}K`;
  return String(amount);
}

type MosaicCell = {
  id: string;
  value: string;
  label: string;
  detail?: string;
  accent: string;
  icon: typeof Users;
  area: "hero" | "attendance" | "pass" | "donors" | "raised";
};

export default function HomeImpactGlance({ stats }: { stats: HomeStats }) {
  const reduceMotion = useReducedMotion();
  const fadeUp = getFadeUp(reduceMotion, 20);
  const stagger = getStagger(reduceMotion, 0.07, 0.04);
  const viewport = { once: true, margin: "-80px" as const };

  const cells: MosaicCell[] = [
    {
      id: "students",
      value: `${stats.students}+`,
      label: "Students enrolled",
      detail: "Small classes, personal attention every day",
      accent: "#F78C1F",
      icon: Users,
      area: "hero",
    },
    {
      id: "attendance",
      value: "94%",
      label: "Monthly attendance",
      accent: "#0ABFBC",
      icon: CalendarCheck,
      area: "attendance",
    },
    {
      id: "pass",
      value: "92%",
      label: "Exam pass rate",
      accent: "#0ABFBC",
      icon: GraduationCap,
      area: "pass",
    },
    {
      id: "donors",
      value: "12",
      label: "Active donors",
      accent: "#F78C1F",
      icon: Heart,
      area: "donors",
    },
    {
      id: "raised",
      value: `PKR ${formatPKR(stats.totalDonated)}`,
      label: "Total raised",
      detail: "Every rupee tracked and published",
      accent: "#4A9EE8",
      icon: TrendingUp,
      area: "raised",
    },
  ];

  return (
    <section className="home-impact" aria-labelledby="impact-heading">
      <div className="home-impact__glow" aria-hidden />
      <div className="home-impact__grid-bg" aria-hidden />

      <div className="container-main home-impact__inner">
        <motion.header
          initial={false}
          whileInView="show"
          viewport={viewport}
          variants={fadeUp}
          className="home-impact__head"
        >
          <div className="home-impact__head-copy">
            <span className="section-eyebrow">Our impact</span>
            <h2
              id="impact-heading"
              className="home-impact__title font-display font-bold text-white tracking-tight"
            >
              Proof in the numbers
            </h2>
          </div>
          <p className="home-impact__lede">
            Live enrollment, attendance, and giving — the same metrics we publish on our full impact
            report.
          </p>
        </motion.header>

        <motion.ul
          initial={false}
          whileInView="show"
          viewport={viewport}
          variants={stagger}
          className="home-impact__mosaic"
          aria-label="Academy impact metrics"
        >
          {cells.map((cell) => {
            const Icon = cell.icon;
            const isHero = cell.area === "hero";
            const isRaised = cell.area === "raised";

            const content = (
              <>
                <div className="home-impact__cell-top">
                  <span
                    className="home-impact__icon"
                    style={
                      {
                        "--cell-accent": cell.accent,
                      } as CSSProperties
                    }
                    aria-hidden
                  >
                    <Icon strokeWidth={2} />
                  </span>
                  {!isHero && (
                    <span className="home-impact__spark" style={{ color: cell.accent }} aria-hidden>
                      ●
                    </span>
                  )}
                </div>
                <p
                  className={`home-impact__value${isHero ? " home-impact__value--hero" : ""}`}
                  style={{ color: cell.accent }}
                >
                  {cell.value}
                </p>
                <p className="home-impact__label">{cell.label}</p>
                {cell.detail && (
                  <p className={`home-impact__detail${isRaised ? " home-impact__detail--raised" : ""}`}>
                    {cell.detail}
                  </p>
                )}
                {isRaised && (
                  <span className="home-impact__cta">
                    Explore full impact
                    <ArrowUpRight className="w-4 h-4" aria-hidden />
                  </span>
                )}
                {isHero && (
                  <div className="home-impact__orbit" aria-hidden>
                    <span className="home-impact__orbit-ring" />
                    <span className="home-impact__orbit-dot home-impact__orbit-dot--1" />
                    <span className="home-impact__orbit-dot home-impact__orbit-dot--2" />
                    <span className="home-impact__orbit-dot home-impact__orbit-dot--3" />
                  </div>
                )}
              </>
            );

            const itemClass = `home-impact__mosaic-item home-impact__mosaic-item--${cell.area}`;
            const cellClass = "home-impact__cell";

            if (isRaised) {
              return (
                <motion.li key={cell.id} variants={fadeUp} className={itemClass}>
                  <Link
                    href="/impact"
                    className={`${cellClass} home-impact__cell--raised`}
                    style={{ "--cell-accent": cell.accent } as CSSProperties}
                  >
                    {content}
                  </Link>
                </motion.li>
              );
            }

            return (
              <motion.li
                key={cell.id}
                variants={fadeUp}
                className={itemClass}
              >
                <div
                  className={`${cellClass}${isHero ? " home-impact__cell--hero" : ""}`}
                  style={{ "--cell-accent": cell.accent } as CSSProperties}
                >
                  {content}
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
