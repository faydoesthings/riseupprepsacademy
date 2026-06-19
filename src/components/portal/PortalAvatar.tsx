import Image from "next/image";

type PortalAvatarProps = {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

function initialsFromName(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

const sizeMap = {
  sm: { box: "portal-avatar--sm", px: 32, text: "text-[10px]" },
  md: { box: "portal-avatar--md", px: 36, text: "text-xs" },
  lg: { box: "portal-avatar--lg", px: 72, text: "text-lg" },
  xl: { box: "portal-avatar--xl", px: 96, text: "text-xl" },
};

export default function PortalAvatar({
  name,
  image,
  size = "md",
  className = "",
}: PortalAvatarProps) {
  const config = sizeMap[size];
  const initials = initialsFromName(name);

  if (image) {
    return (
      <span className={`portal-avatar ${config.box} ${className}`}>
        <Image
          src={image}
          alt=""
          width={config.px}
          height={config.px}
          className="portal-avatar__image"
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      className={`portal-avatar portal-avatar--fallback ${config.box} ${config.text} ${className}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}
