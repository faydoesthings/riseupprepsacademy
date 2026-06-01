"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "teal";

interface ButtonProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const variants: Record<Variant, string> = {
    primary: cn(
      "bg-[#F78C1F] text-white",
      "shadow-[0_0_20px_rgba(247,140,31,0.3)]",
      "hover:shadow-[0_0_40px_rgba(247,140,31,0.5)]",
      "hover:bg-[#ff9a2e]"
    ),
    secondary: cn(
      "bg-transparent border border-[#F78C1F]/50 text-[#F78C1F]",
      "hover:bg-[#F78C1F]/10 hover:border-[#F78C1F]"
    ),
    ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/10",
    danger: cn(
      "bg-[#C0392B] text-white",
      "shadow-[0_0_20px_rgba(192,57,43,0.3)]",
      "hover:shadow-[0_0_40px_rgba(192,57,43,0.5)]"
    ),
    teal: cn(
      "bg-[#0ABFBC] text-white",
      "hover:shadow-[0_0_30px_rgba(10,191,188,0.4)]"
    ),
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "inline-flex items-center gap-2 px-6 py-3 rounded-xl",
        "font-semibold text-sm tracking-wide",
        "transition-all duration-300 cursor-pointer",
        variants[variant],
        className
      )}
      disabled={props.disabled}
      type={props.type}
      onClick={props.onClick}
    >
      {children}
    </motion.button>
  );
}
