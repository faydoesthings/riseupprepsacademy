"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ImpactMonthlyPoint } from "@/lib/stats";

import { MOTION_EASE } from "@/lib/motion";

function formatBarLabel(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}K`;
  return amount > 0 ? String(Math.round(amount)) : "0";
}

type Props = {
  data: ImpactMonthlyPoint[];
  periodTotal: number;
};

export default function ImpactChart({ data, periodTotal }: Props) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const maxAmount = useMemo(
    () => Math.max(...data.map((d) => d.amount), 1),
    [data]
  );

  const hasAnyGiving = data.some((d) => d.amount > 0);

  return (
    <div className="impact-chart landing-card">
      <div className="impact-chart__header">
        <div>
          <p className="impact-chart__label">Last 6 months</p>
          <p className="impact-chart__total" aria-live="polite">
            {hasAnyGiving ? (
              <>
                <span className="impact-chart__total-value">
                  PKR {periodTotal.toLocaleString("en-PK")}
                </span>
                <span className="impact-chart__total-caption"> confirmed in this period</span>
              </>
            ) : (
              <span className="impact-chart__total-caption">
                Giving data will appear as donations are confirmed.
              </span>
            )}
          </p>
        </div>
        {activeIndex !== null && data[activeIndex] && (
          <motion.div
            key={activeIndex}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="impact-chart__tooltip"
            role="status"
          >
            <span className="impact-chart__tooltip-month">{data[activeIndex].month}</span>
            <span className="impact-chart__tooltip-amount">
              PKR {data[activeIndex].amount.toLocaleString("en-PK")}
            </span>
          </motion.div>
        )}
      </div>

      <div
        className="impact-chart__plot"
        role="img"
        aria-label="Bar chart of monthly confirmed donations in Pakistani rupees"
      >
        {data.map((point, i) => {
          const heightPct = hasAnyGiving ? Math.max((point.amount / maxAmount) * 100, 4) : 4;
          const isActive = activeIndex === i;

          return (
            <div
              key={`${point.month}-${i}`}
              className="impact-chart__bar-col"
              tabIndex={0}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(i)}
              onBlur={() => setActiveIndex(null)}
            >
              <span className="impact-chart__bar-value">{formatBarLabel(point.amount)}</span>
              <div className="impact-chart__bar-track">
                <motion.div
                  className={`impact-chart__bar-fill${isActive ? " impact-chart__bar-fill--active" : ""}`}
                  style={{ height: `${heightPct}%` }}
                  initial={reduceMotion ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.65, delay: i * 0.06, ease: MOTION_EASE }}
                />
              </div>
              <span className="impact-chart__bar-month">{point.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
