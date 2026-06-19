import { ReactNode } from "react";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
  compact?: boolean;
};

export default function PageHero({ eyebrow, title, description, children, compact }: PageHeroProps) {
  return (
    <section
      className={`page-hero relative overflow-hidden border-b border-white/[0.06]${compact ? " page-hero--compact" : ""}`}
    >
      <div className="absolute inset-0 bg-[#0A0E1A]" />
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% -20%, rgba(5,51,92,0.5) 0%, transparent 55%), radial-gradient(ellipse 40% 30% at 100% 100%, rgba(247,140,31,0.06) 0%, transparent 50%)",
        }}
      />
      <div className="container-main relative z-10 grid place-items-center">
        <header className="page-hero__content">
          {eyebrow && <p className="page-hero__eyebrow">{eyebrow}</p>}
          <h1 className="page-hero__title font-display">{title}</h1>
          {description && <p className="page-hero__desc">{description}</p>}
          {children && <div className="page-hero__children">{children}</div>}
        </header>
      </div>
    </section>
  );
}
