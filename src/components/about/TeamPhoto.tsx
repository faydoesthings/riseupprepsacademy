"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Tier = "hero" | "tier-1" | "tier-2";

type TeamPhotoProps = {
  name: string;
  initials: string;
  photo?: string;
  photoZoom?: number;
  photoPosition?: string;
  accent: string;
  tier?: Tier;
  className?: string;
};

const tierHeights: Record<Tier, string> = {
  hero: "h-[18rem] sm:h-[22rem] lg:h-[26rem]",
  "tier-1": "h-[12rem] sm:h-[14rem] lg:h-[16rem]",
  "tier-2": "h-[10rem] sm:h-[11rem] lg:h-[13rem]",
};

export default function TeamPhoto({
  name,
  initials,
  photo,
  photoZoom = 1,
  photoPosition = "top center",
  accent,
  tier = "tier-1",
  className,
}: TeamPhotoProps) {
  const [failed, setFailed] = useState(false);
  const showImage = photo && !failed;

  return (
    <div
      className={cn("team-photo-frame relative w-full overflow-hidden", tierHeights[tier], className)}
      style={{ "--team-accent": accent } as CSSProperties}
    >
      {showImage ? (
        <Image
          src={photo}
          alt={name}
          fill
          sizes={
            tier === "hero"
              ? "(max-width: 768px) 100vw, 420px"
              : tier === "tier-1"
                ? "(max-width: 768px) 50vw, 240px"
                : "(max-width: 768px) 45vw, 200px"
          }
          className="object-cover"
          style={{
            objectPosition: photoPosition,
            transform: photoZoom !== 1 ? `scale(${photoZoom})` : undefined,
            transformOrigin: photoPosition,
          }}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center text-white font-display font-bold tracking-tight"
          style={{
            background: `linear-gradient(145deg, ${accent}33 0%, #05335C 55%, #0A0E1A 100%)`,
            fontSize: tier === "hero" ? "3rem" : tier === "tier-1" ? "2rem" : "1.5rem",
          }}
          aria-hidden
        >
          {initials}
        </div>
      )}
      <div className="team-photo-frame__shine" aria-hidden />
    </div>
  );
}
