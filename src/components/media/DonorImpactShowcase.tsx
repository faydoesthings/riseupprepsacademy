"use client";

import { type ReactNode } from "react";
import ArtDirectedImage from "@/components/media/ArtDirectedImage";
import { getAcademyPhoto } from "@/data/academy-photos";

type Props = {
  photoId: string;
  eyebrow?: string;
  title: string;
  description: string;
  stats?: { label: string; value: string }[];
  children?: ReactNode;
};

/** Glass-overlay showcase for donors — photo stays visible but text remains legible */
export default function DonorImpactShowcase({
  photoId,
  eyebrow,
  title,
  description,
  stats,
  children,
}: Props) {
  const photo = getAcademyPhoto(photoId);
  if (!photo) return null;

  return (
    <article className="media-donor-showcase">
      <div className="media-donor-showcase__media">
        <ArtDirectedImage
          src={photo.src}
          alt={photo.alt}
          treatment="glass-story"
          objectPosition={photo.objectPosition}
          focalZoom={photo.focalZoom}
          sizes="(max-width: 900px) 100vw, 720px"
          className="media-donor-showcase__image"
        />
      </div>
      <div className="media-donor-showcase__glass">
        {eyebrow && <span className="media-donor-showcase__eyebrow">{eyebrow}</span>}
        <h2 className="media-donor-showcase__title">{title}</h2>
        <p className="media-donor-showcase__desc">{description}</p>
        {stats && stats.length > 0 && (
          <ul className="media-donor-showcase__stats">
            {stats.map((stat) => (
              <li key={stat.label}>
                <span className="media-donor-showcase__stat-value">{stat.value}</span>
                <span className="media-donor-showcase__stat-label">{stat.label}</span>
              </li>
            ))}
          </ul>
        )}
        {children}
      </div>
    </article>
  );
}
