"use client";

import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import ArtDirectedImage from "@/components/media/ArtDirectedImage";
import { academyPhotos, type AcademyPhoto } from "@/data/academy-photos";

type Props = {
  photoIds?: string[];
};

function MarqueeSlide({ photo }: { photo: AcademyPhoto }) {
  return (
    <figure className="media-marquee__slide">
      <ArtDirectedImage
        src={photo.src}
        alt={photo.alt}
        treatment="focal-card"
        objectPosition={photo.objectPosition}
        focalZoom={photo.focalZoom}
        sizes="(max-width: 768px) 78vw, 420px"
        className="media-marquee__image"
      />
      <figcaption className="media-marquee__caption">
        <span className="media-marquee__caption-title">{photo.caption}</span>
        {photo.story && <span className="media-marquee__caption-story">{photo.story}</span>}
      </figcaption>
    </figure>
  );
}

/** Infinite horizontal catalog — auto-scrolls right with uniform slide sizes */
export default function CampusPhotoMarquee({
  photoIds = academyPhotos.map((p) => p.id),
}: Props) {
  const reduceMotion = useReducedMotion();

  const photos = useMemo(
    () =>
      photoIds
        .map((id) => academyPhotos.find((p) => p.id === id))
        .filter((p): p is AcademyPhoto => Boolean(p)),
    [photoIds]
  );

  if (photos.length === 0) return null;

  const loop = [...photos, ...photos];

  return (
    <div
      className={`media-marquee${reduceMotion ? " media-marquee--static" : ""}`}
      aria-label="Campus photo gallery"
    >
      <div className="media-marquee__edge media-marquee__edge--left" aria-hidden />
      <div className="media-marquee__edge media-marquee__edge--right" aria-hidden />

      <div className="media-marquee__viewport">
        <div className="media-marquee__track">
          {loop.map((photo, index) => (
            <MarqueeSlide key={`${photo.id}-${index}`} photo={photo} />
          ))}
        </div>
      </div>
    </div>
  );
}
