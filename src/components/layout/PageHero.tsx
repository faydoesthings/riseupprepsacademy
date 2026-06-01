import { ReactNode } from "react";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
};

export default function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="relative pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden border-b border-white/[0.06]">
      <div className="absolute inset-0 bg-[#0A0E1A]" />
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% -20%, rgba(5,51,92,0.5) 0%, transparent 55%), radial-gradient(ellipse 40% 30% at 100% 100%, rgba(247,140,31,0.06) 0%, transparent 50%)",
        }}
      />
      <div className="container-main relative z-10 text-center max-w-3xl mx-auto">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F78C1F] mb-4">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight font-display">
          {title}
        </h1>
        {description && (
          <p className="mt-5 text-base md:text-lg text-white/50 leading-relaxed">{description}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
