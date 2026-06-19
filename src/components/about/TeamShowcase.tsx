"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Crown } from "lucide-react";
import type { TeamMember } from "@/data/about";
import TeamPhoto from "@/components/about/TeamPhoto";
import { getFadeUp } from "@/lib/motion";

type Tier = "hero" | "tier-1" | "tier-2";
type CascadeSlot = "left-outer" | "left-inner" | "right-inner" | "right-outer";

const CASCADE_ORDER: CascadeSlot[] = [
  "left-outer",
  "left-inner",
  "right-inner",
  "right-outer",
];

const SLOT_TIER: Record<CascadeSlot, Tier> = {
  "left-outer": "tier-2",
  "left-inner": "tier-1",
  "right-inner": "tier-1",
  "right-outer": "tier-2",
};

function MemberCard({
  member,
  tier,
  isFounder = false,
}: {
  member: TeamMember;
  tier: Tier;
  isFounder?: boolean;
}) {
  return (
    <article
      className={`team-card team-card--${tier}`}
      style={{ "--team-accent": member.accent } as React.CSSProperties}
    >
      {isFounder && (
        <span className="team-card__badge">
          <Crown className="w-3.5 h-3.5" aria-hidden />
          Founder
        </span>
      )}
      <TeamPhoto
        name={member.name}
        initials={member.initials}
        photo={member.photo}
        photoZoom={member.photoZoom}
        photoPosition={member.photoPosition}
        accent={member.accent}
        tier={tier}
      />
      <div className="team-card__body">
        <h3 className="team-card__name">{member.name}</h3>
        <p className="team-card__role">{member.role}</p>
      </div>
    </article>
  );
}

function CascadeSlot({
  member,
  slot,
  delay,
}: {
  member: TeamMember;
  slot: CascadeSlot;
  delay: number;
}) {
  const reduceMotion = useReducedMotion();
  const fade = getFadeUp(reduceMotion);
  const tier = SLOT_TIER[slot];

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={fade}
      transition={{ delay: reduceMotion ? 0 : delay }}
      className={`team-showcase__slot team-showcase__slot--${slot} team-showcase__slot--${tier}`}
    >
      <MemberCard member={member} tier={tier} />
    </motion.div>
  );
}

export default function TeamShowcase({ members }: { members: TeamMember[] }) {
  const reduceMotion = useReducedMotion();
  const founder = members.find((m) => m.isFounder)!;
  const rest = members.filter((m) => !m.isFounder);
  const bySlot = Object.fromEntries(
    rest.map((member) => [member.cascade, member])
  ) as Record<CascadeSlot, TeamMember>;
  const fade = getFadeUp(reduceMotion);

  return (
    <div className="team-showcase">
      <div className="team-showcase__cascade" aria-label="Leadership team">
        {CASCADE_ORDER.map((slot, index) => (
          <CascadeSlot
            key={slot}
            member={bySlot[slot]}
            slot={slot}
            delay={0.04 * (index + 1)}
          />
        ))}

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={fade}
          className="team-showcase__hero"
        >
          <MemberCard member={founder} tier="hero" isFounder />
        </motion.div>
      </div>

      <div className="team-showcase__mobile" aria-label="Leadership team">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={fade}
          className="team-showcase__mobile-hero"
        >
          <MemberCard member={founder} tier="hero" isFounder />
        </motion.div>
        <div className="team-showcase__mobile-grid">
          {[bySlot["right-inner"], ...rest.filter((m) => m.cascade !== "right-inner")].map(
            (member, index) => (
              <motion.div
                key={member.slug}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                variants={fade}
                transition={{ delay: reduceMotion ? 0 : 0.04 * (index + 1) }}
              >
                <MemberCard member={member} tier="tier-1" />
              </motion.div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
