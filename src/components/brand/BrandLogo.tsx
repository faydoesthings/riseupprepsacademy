import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  /** Full logo includes wordmark; icon crops to the mark for compact UI */
  variant?: "full" | "icon";
  href?: string;
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({
  variant = "full",
  href = "/",
  className,
  priority = false,
}: BrandLogoProps) {
  const image =
    variant === "icon" ? (
      <span
        className={cn(
          "relative block h-10 w-10 shrink-0 overflow-hidden rounded-lg",
          className
        )}
      >
        <Image
          src="/images/logo.png"
          alt="RiseUp Preps Academy"
          width={120}
          height={120}
          priority={priority}
          className="absolute left-1/2 top-0 h-[180%] w-[180%] max-w-none -translate-x-1/2 object-contain object-top"
        />
      </span>
    ) : (
      <Image
        src="/images/logo.png"
        alt="RiseUp Preps Academy"
        width={200}
        height={64}
        priority={priority}
        className={cn("h-10 w-auto sm:h-11", className)}
      />
    );

  if (!href) {
    return image;
  }

  return (
    <Link href={href} className="inline-flex shrink-0 items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F78C1F]/50 rounded-lg">
      {image}
    </Link>
  );
}
