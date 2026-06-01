"use client";

import { useSpring, animated } from "@react-spring/web";
import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";

interface StatCardProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  glow?: "orange" | "crimson" | "teal" | "none";
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
}

export function StatCard({
  value,
  label,
  prefix = "",
  suffix = "",
  glow = "none",
  icon,
  trend,
}: StatCardProps) {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { mass: 1, tension: 30, friction: 10 },
  });

  return (
    <GlassCard glow={glow} className="p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="text-white/40 text-2xl">{icon}</div>
        {trend && (
          <span
            className={cn(
              "text-xs font-mono font-bold px-2 py-1 rounded-full",
              trend.positive
                ? "text-[#0ABFBC] bg-[#0ABFBC]/10"
                : "text-[#C0392B] bg-[#C0392B]/10"
            )}
          >
            {trend.positive ? "+" : "-"}
            {trend.value}%
          </span>
        )}
      </div>
      <div className="font-display text-4xl lg:text-5xl font-bold text-white tracking-tight">
        {prefix}
        <animated.span>
          {number.to((n) => Math.floor(n).toLocaleString())}
        </animated.span>
        {suffix}
      </div>
      <p className="text-white/50 text-sm">{label}</p>
    </GlassCard>
  );
}
