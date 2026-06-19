"use client";

import ArtDirectedImage from "@/components/media/ArtDirectedImage";
import { academyPhotos, type AcademyPhoto } from "@/data/academy-photos";

type Props = {
  photoIds: string[];
};

function GridCell({ photo, variant }: { photo: AcademyPhoto; variant: "wide" | "tall" | "standard" }) {
  return (
    <figure className={`media-impact-grid__cell media-impact-grid__cell--${variant}`}>
      <ArtDirectedImage
        src={photo.src}
        alt={photo.alt}
        treatment={photo.treatment}
        objectPosition={photo.objectPosition}
        focalZoom={photo.focalZoom}
        sizes={
          variant === "wide"
            ? "(max-width: 768px) 100vw, 640px"
            : "(max-width: 768px) 50vw, 320px"
        }
        className="media-impact-grid__image"
      />
      <figcaption className="media-impact-grid__label">{photo.caption}</figcaption>
    </figure>
  );
}

/** Mosaic grid for impact & about pages — varied cell sizes avoid uniform blocks */
export default function ImpactPhotoGrid({ photoIds }: Props) {
  const photos = photoIds
    .map((id) => academyPhotos.find((p) => p.id === id))
    .filter((p): p is AcademyPhoto => Boolean(p));

  if (photos.length === 0) return null;

  const variants: Array<"wide" | "tall" | "standard"> = ["wide", "tall", "standard", "standard"];

  return (
    <div className="media-impact-grid" role="group" aria-label="Academy life in photographs">
      {photos.map((photo, i) => (
        <GridCell key={photo.id} photo={photo} variant={variants[i] ?? "standard"} />
      ))}
    </div>
  );
}
