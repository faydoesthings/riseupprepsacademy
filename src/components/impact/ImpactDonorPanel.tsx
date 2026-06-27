"use client";

import { motion } from "framer-motion";
import { Award, Heart } from "lucide-react";
import type { ImpactPageData } from "@/lib/stats";
import { formatPKR } from "@/lib/format";
import { getFadeUp } from "@/lib/motion";

type Props = {
  data: ImpactPageData;
  reduceMotion: boolean | null;
};

export default function ImpactDonorPanel({ data, reduceMotion }: Props) {
  const fadeUp = getFadeUp(reduceMotion, 16);
  const viewport = { once: true, margin: "-48px" as const };
  const donors = data.topDonors.slice(0, 5);

  return (
    <motion.aside
      initial={false}
      whileInView="show"
      viewport={viewport}
      variants={fadeUp}
      className="impact-donors landing-card"
      aria-labelledby="impact-donors-title"
    >
      <div className="impact-donors__head">
        <span className="landing-card__icon" aria-hidden>
          <Heart strokeWidth={2} />
        </span>
        <div>
          <h3 id="impact-donors-title" className="impact-donors__title">
            Community champions
          </h3>
          <p className="impact-donors__desc">Top confirmed supporters · names published with permission</p>
        </div>
      </div>

      {donors.length === 0 ? (
        <p className="impact-donors__empty">Donor recognition will appear as gifts are confirmed.</p>
      ) : (
        <ol className="impact-donors__list">
          {donors.map((donor) => (
            <li key={`${donor.rank}-${donor.name}`} className="impact-donors__row">
              <span className="impact-donors__rank" aria-hidden>
                {donor.rank === 1 ? <Award className="w-4 h-4" /> : donor.rank}
              </span>
              <span className="impact-donors__name">{donor.name}</span>
              <span className="impact-donors__amount">PKR {formatPKR(donor.amount)}</span>
            </li>
          ))}
        </ol>
      )}

      <p className="impact-donors__footnote">
        {data.donorCount}+ donors have supported RiseUp to date.
      </p>
    </motion.aside>
  );
}
