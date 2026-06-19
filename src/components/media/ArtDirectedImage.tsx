"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PhotoTreatment } from "@/data/academy-photos";

export type ArtDirectedImageProps = {
  src: string;
  alt: string;
  treatment?: PhotoTreatment;
  objectPosition?: string;
  focalZoom?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
};

const treatmentClass: Record<PhotoTreatment, string> = {
  ambient: "media-art--ambient",
  "hero-masked": "media-art--hero-masked",
  "focal-card": "media-art--focal-card",
  "glass-story": "media-art--glass-story",
  "duotone-warm": "media-art--duotone-warm",
  "duotone-teal": "media-art--duotone-teal",
  "mono-soft": "media-art--mono-soft",
  "collage-offset": "media-art--collage-offset",
  "edge-fade": "media-art--edge-fade",
};

export default function ArtDirectedImage({
  src,
  alt,
  treatment = "focal-card",
  objectPosition = "center",
  focalZoom = 1,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className,
  fill = true,
  width,
  height,
}: ArtDirectedImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn("media-art media-art--fallback", treatmentClass[treatment], className)}
        role="img"
        aria-label={alt}
      />
    );
  }

  const imageStyle: CSSProperties = {
    objectPosition,
    transform:
      focalZoom !== 1 && treatment !== "ambient" ? `scale(${focalZoom})` : undefined,
    transformOrigin: objectPosition,
  };

  return (
    <div className={cn("media-art", treatmentClass[treatment], className)}>
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="media-art__img"
          style={imageStyle}
          onError={() => setFailed(true)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width ?? 800}
          height={height ?? 600}
          sizes={sizes}
          priority={priority}
          className="media-art__img media-art__img--static"
          style={imageStyle}
          onError={() => setFailed(true)}
        />
      )}
      <div className="media-art__veil" aria-hidden />
    </div>
  );
}
