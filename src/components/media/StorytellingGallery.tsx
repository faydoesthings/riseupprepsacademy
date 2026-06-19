"use client";

import ArtDirectedImage from "@/components/media/ArtDirectedImage";
import { academyPhotos, type AcademyPhoto } from "@/data/academy-photos";

type Props = {
  photoIds: string[];
  title?: string;
  description?: string;
};

function GalleryTile({ photo, index }: { photo: AcademyPhoto; index: number }) {
  const layoutClass =
    index === 0
      ? "media-story-gallery__tile--lead"
      : index === 1
        ? "media-story-gallery__tile--secondary"
        : "media-story-gallery__tile--tertiary";

  return (
    <figure className={`media-story-gallery__tile ${layoutClass}`}>
      <ArtDirectedImage
        src={photo.src}
        alt={photo.alt}
        treatment={photo.treatment}
        objectPosition={photo.objectPosition}
        focalZoom={photo.focalZoom}
        sizes={
          index === 0
            ? "(max-width: 768px) 100vw, 560px"
            : "(max-width: 768px) 50vw, 280px"
        }
        className="media-story-gallery__image"
      />
      <figcaption className="media-story-gallery__caption">
        <span className="media-story-gallery__caption-title">{photo.caption}</span>
        {photo.story && <span className="media-story-gallery__caption-story">{photo.story}</span>}
      </figcaption>
    </figure>
  );
}

/** Asymmetric collage — elevates medium-quality photos through layout & masking */
export default function StorytellingGallery({ photoIds, title, description }: Props) {
  const photos = photoIds
    .map((id) => academyPhotos.find((p) => p.id === id))
    .filter((p): p is AcademyPhoto => Boolean(p));

  if (photos.length === 0) return null;

  return (
    <section className="media-story-gallery" aria-label={title ?? "Campus life gallery"}>
      {(title || description) && (
        <header className="media-story-gallery__header">
          {title && <h2 className="media-story-gallery__title">{title}</h2>}
          {description && <p className="media-story-gallery__desc">{description}</p>}
        </header>
      )}
      <div className="media-story-gallery__grid">
        {photos.map((photo, i) => (
          <GalleryTile key={photo.id} photo={photo} index={i} />
        ))}
      </div>
    </section>
  );
}
