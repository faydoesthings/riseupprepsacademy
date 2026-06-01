"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  glow?: "orange" | "crimson" | "teal" | "none";
  hover?: boolean;
  ajrak?: boolean;
}

export function GlassCard({
  children,
  className,
  glow = "none",
  hover = true,
  ajrak = true,
  ...props
}: GlassCardProps) {
  const glowMap = {
    orange: "hover:shadow-[0_0_40px_rgba(247,140,31,0.25)]",
    crimson: "hover:shadow-[0_0_40px_rgba(192,57,43,0.3)]",
    teal: "hover:shadow-[0_0_40px_rgba(10,191,188,0.25)]",
    none: "",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "relative rounded-2xl border border-white/10",
        "bg-gradient-to-br from-white/[0.08] to-white/[0.02]",
        "backdrop-blur-[16px]",
        "shadow-[0_4px_32px_rgba(0,0,0,0.3)]",
        "transition-all duration-500",
        glowMap[glow],
        className
      )}
      {...props}
    >
      {/* Ajrak geometric corner accent */}
      {ajrak && (
        <div
          className="absolute top-0 right-0 w-16 h-16 opacity-10 pointer-events-none"
          style={{ backgroundImage: "url(/patterns/ajrak-corner.svg)" }}
        />
      )}
      {children}
    </motion.div>
  );
}
