"use client";

import { type ReactNode } from "react";
import ArtDirectedImage from "@/components/media/ArtDirectedImage";
import { getAcademyPhoto } from "@/data/academy-photos";

type Props = {
  photoId: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  reverse?: boolean;
  priority?: boolean;
};

/** Split storytelling block — copy + art-directed focal image (no giant raw rectangles) */
export default function HeroImageSection({
  photoId,
  eyebrow,
  title,
  description,
  children,
  reverse = false,
  priority = false,
}: Props) {
  const photo = getAcademyPhoto(photoId);
  if (!photo) return null;

  return (
    <div className={`media-hero-section${reverse ? " media-hero-section--reverse" : ""}`}>
      <div className="media-hero-section__copy">
        {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
        <h2 className="media-hero-section__title">{title}</h2>
        {description && <p className="media-hero-section__desc">{description}</p>}
        {children}
      </div>
      <figure className="media-hero-section__figure">
        <ArtDirectedImage
          src={photo.src}
          alt={photo.alt}
          treatment={photo.treatment}
          objectPosition={photo.objectPosition}
          focalZoom={photo.focalZoom}
          priority={priority}
          sizes="(max-width: 900px) 100vw, 540px"
          className="media-hero-section__image"
        />
        {photo.caption && (
          <figcaption className="media-hero-section__caption">{photo.caption}</figcaption>
        )}
      </figure>
    </div>
  );
}
