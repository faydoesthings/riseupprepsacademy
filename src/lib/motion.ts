import type { Variants } from "framer-motion";

export const MOTION_EASE = [0.23, 1, 0.32, 1] as const;

const visible = { opacity: 1, y: 0 } as const;

export function getFadeUp(reduceMotion: boolean | null, y = 20): Variants {
  if (reduceMotion) {
    return { hidden: visible, show: visible };
  }
  return {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: MOTION_EASE },
    },
  };
}

export function getStagger(
  reduceMotion: boolean | null,
  staggerChildren = 0.08,
  delayChildren = 0,
): Variants {
  if (reduceMotion) {
    return { hidden: {}, show: { transition: { staggerChildren: 0 } } };
  }
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren,
        ...(delayChildren > 0 ? { delayChildren } : {}),
      },
    },
  };
}
