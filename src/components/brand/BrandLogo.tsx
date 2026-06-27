import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  /** Full = emblem + wordmark; icon = emblem only */
  variant?: "full" | "icon";
  /** sm = portal, md = header, lg = footer & auth */
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  priority?: boolean;
};

const sizeClass = {
  sm: "brand-logo--sm",
  md: "brand-logo--md",
  lg: "brand-logo--lg",
} as const;

function LogoEmblem({ priority }: { priority?: boolean }) {
  return (
    <span className="brand-logo__emblem" aria-hidden>
      <Image
        src="/images/logo.png"
        alt=""
        width={160}
        height={160}
        priority={priority}
        className="brand-logo__emblem-img"
      />
    </span>
  );
}

function LogoWordmark() {
  return (
    <span className="brand-logo__wordmark">
      <span className="brand-logo__title">Rise Up</span>
      <span className="brand-logo__subtitle">Preps Academy</span>
    </span>
  );
}

export default function BrandLogo({
  variant = "full",
  size = "md",
  href = "/",
  className,
  priority = false,
}: BrandLogoProps) {
  const content = (
    <>
      <LogoEmblem priority={priority} />
      {variant === "full" && <LogoWordmark />}
    </>
  );

  const rootClass = cn(
    "brand-logo",
    sizeClass[size],
    variant === "icon" && "brand-logo--icon-only",
    className
  );

  if (!href) {
    return <span className={rootClass}>{content}</span>;
  }

  return (
    <Link href={href} className={rootClass} aria-label="RiseUp Preps Academy home">
      {content}
    </Link>
  );
}
