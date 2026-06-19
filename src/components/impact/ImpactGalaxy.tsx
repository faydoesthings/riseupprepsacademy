"use client";

import { Component, useRef, useState, useCallback, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { ImpactPageData } from "@/lib/stats";

const ImpactGalaxyScene = dynamic(() => import("@/components/impact/ImpactGalaxyScene"), {
  ssr: false,
  loading: () => <div className="gox-arena gox-arena--loading" aria-busy="true" />,
});

type Props = {
  data: ImpactPageData;
  reduceMotion: boolean | null;
};

type BoundaryState = { failed: boolean };

class GalaxyErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function GalaxyFallback({ data }: { data: ImpactPageData }) {
  return (
    <div className="gox-fallback" role="region" aria-label="Impact statistics">
      <div className="gox-fallback__core">
        <span className="gox-fallback__eyebrow">Core mission</span>
        <p className="gox-fallback__value">{data.students}+</p>
        <p className="gox-fallback__label">Students enrolled</p>
      </div>
      <div className="gox-fallback__grid">
        <div className="gox-fallback__stat">
          <strong>{data.attendanceRate}%</strong>
          <span>Attendance</span>
        </div>
        <div className="gox-fallback__stat">
          <strong>{data.passRate}%</strong>
          <span>Pass rate</span>
        </div>
        <div className="gox-fallback__stat">
          <strong>{data.teachers}</strong>
          <span>Teachers</span>
        </div>
        <div className="gox-fallback__stat">
          <strong>{data.donorCount}+</strong>
          <span>Supporters</span>
        </div>
      </div>
    </div>
  );
}

export default function ImpactGalaxy({ data, reduceMotion }: Props) {
  const arenaRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const spin = !reduceMotion;

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const el = arenaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -0.06, y: px * 0.08 });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setHovered(null);
  }, []);

  return (
    <div
      ref={arenaRef}
      className="gox-arena"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label="Galaxy of Impact — interactive 3D visualization"
    >
      <div className="gox-nebula gox-nebula--teal" aria-hidden />
      <div className="gox-nebula gox-nebula--amber" aria-hidden />
      <div className="gox-nebula gox-nebula--indigo" aria-hidden />
      <div className="gox-aurora-band" aria-hidden />
      <div className="gox-stars-dust" aria-hidden />
      <div className="gox-vignette" aria-hidden />

      <GalaxyErrorBoundary fallback={<GalaxyFallback data={data} />}>
        <ImpactGalaxyScene
          data={data}
          spin={spin}
          hovered={hovered}
          onHover={setHovered}
          tilt={tilt}
        />
      </GalaxyErrorBoundary>
    </div>
  );
}
