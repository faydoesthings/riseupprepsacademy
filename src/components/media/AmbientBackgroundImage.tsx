import ArtDirectedImage from "@/components/media/ArtDirectedImage";
import { getAcademyPhoto } from "@/data/academy-photos";

type Props = {
  photoId?: string;
  className?: string;
};

/** Low-opacity, blurred campus photo for section backgrounds */
export default function AmbientBackgroundImage({
  photoId = "outdoor-study",
  className,
}: Props) {
  const photo = getAcademyPhoto(photoId);
  if (!photo) return null;

  return (
    <div className={className ?? "media-ambient"} aria-hidden>
      <ArtDirectedImage
        src={photo.src}
        alt=""
        treatment="ambient"
        objectPosition={photo.objectPosition ?? "center"}
        sizes="100vw"
      />
    </div>
  );
}
