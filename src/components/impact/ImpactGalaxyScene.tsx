"use client";

import { useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import {
  BookOpen,
  Clock,
  Coins,
  GraduationCap,
  Link2,
} from "lucide-react";
import { formatPKR } from "@/lib/format";
import type { ImpactPageData } from "@/lib/stats";

type SceneProps = {
  data: ImpactPageData;
  spin: boolean;
  hovered: string | null;
  onHover: (id: string | null) => void;
  tilt: { x: number; y: number };
};

type PlanetVariant = "earth" | "gas" | "mars" | "moon" | "moon-sm";
type AccentTone = "teal" | "amber" | "coral" | "pearl";

type PlanetTheme = {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  roughness: number;
  metalness: number;
  atmosphere: string;
  atmosphereOpacity: number;
  accent: AccentTone;
};

const PLANET_THEMES: Record<PlanetVariant, PlanetTheme> = {
  earth: {
    color: "#125864",
    emissive: "#0ABFBC",
    emissiveIntensity: 0.42,
    roughness: 0.32,
    metalness: 0.14,
    atmosphere: "#4ee8dc",
    atmosphereOpacity: 0.24,
    accent: "teal",
  },
  gas: {
    color: "#7a5618",
    emissive: "#F78C1F",
    emissiveIntensity: 0.36,
    roughness: 0.26,
    metalness: 0.2,
    atmosphere: "#ffcc66",
    atmosphereOpacity: 0.18,
    accent: "amber",
  },
  mars: {
    color: "#6e3024",
    emissive: "#e06848",
    emissiveIntensity: 0.3,
    roughness: 0.4,
    metalness: 0.1,
    atmosphere: "#ff8860",
    atmosphereOpacity: 0.14,
    accent: "coral",
  },
  moon: {
    color: "#5c6570",
    emissive: "#98a8b8",
    emissiveIntensity: 0.14,
    roughness: 0.62,
    metalness: 0.22,
    atmosphere: "#c8d4e4",
    atmosphereOpacity: 0.1,
    accent: "pearl",
  },
  "moon-sm": {
    color: "#4a525c",
    emissive: "#8898a8",
    emissiveIntensity: 0.1,
    roughness: 0.68,
    metalness: 0.18,
    atmosphere: "#b0bcc8",
    atmosphereOpacity: 0.08,
    accent: "pearl",
  },
};

/* Widely spaced concentric rings */
const R_ATTENDANCE = 3.9;
const R_PASSRATE = 5.8;
const R_TEACHERS = 7.6;
const R_FUNDS = 9.2;

/* Fixed angles — ≥ ~55° apart to prevent overlap */
const A_ATTENDANCE = Math.PI / 2;
const A_PASSRATE = -0.92;
const A_TEACHERS = 3.75;
const A_FUNDS = 0.22;

/** Locked camera — tuned via debug panel (~21° elevation) */
const CAMERA_X = -1.5;
const CAMERA_Y = 7.5;
const CAMERA_Z = 19;
const CAMERA_LOOK_AT_Y = -2.5;
const CAMERA_FOV = 37;
const PLANE_TILT_X = 0.18;

function GalaxyCamera() {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.set(CAMERA_X, CAMERA_Y, CAMERA_Z);
    camera.lookAt(0, CAMERA_LOOK_AT_Y, 0);
    const persp = camera as THREE.PerspectiveCamera;
    if (persp.fov !== CAMERA_FOV) {
      persp.fov = CAMERA_FOV;
      persp.updateProjectionMatrix();
    }
  });

  return null;
}

function planetTheme(variant: PlanetVariant): PlanetTheme {
  return PLANET_THEMES[variant];
}

function OrbitRing({
  radius,
  coreColor,
  glowColor,
  opacity = 0.4,
}: {
  radius: number;
  coreColor: string;
  glowColor: string;
  opacity?: number;
}) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.032, 8, 220]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={opacity * 0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.009, 14, 220]} />
        <meshBasicMaterial color={coreColor} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function SphereMesh({
  radius,
  variant,
  active,
  onPointerOver,
  onPointerOut,
}: {
  radius: number;
  variant: PlanetVariant;
  active: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
}) {
  const theme = planetTheme(variant);
  const scale = active ? 1.08 : 1;

  return (
    <group scale={scale}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onPointerOver();
        }}
        onPointerOut={onPointerOut}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          color={theme.color}
          emissive={theme.emissive}
          emissiveIntensity={active ? theme.emissiveIntensity + 0.18 : theme.emissiveIntensity}
          roughness={theme.roughness}
          metalness={theme.metalness}
        />
      </mesh>

      <mesh scale={1.018}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          color={theme.atmosphere}
          transparent
          opacity={active ? theme.atmosphereOpacity + 0.06 : theme.atmosphereOpacity}
          roughness={1}
          metalness={0}
          depthWrite={false}
        />
      </mesh>

      {variant === "gas" && (
        <mesh scale={[1.04, 0.92, 1.04]} rotation={[0.4, 0.6, 0]}>
          <sphereGeometry args={[radius, 40, 40]} />
          <meshStandardMaterial
            color="#c49228"
            transparent
            opacity={0.12}
            roughness={0.9}
            metalness={0}
            depthWrite={false}
          />
        </mesh>
      )}

      {active && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.35, radius * 1.52, 48]} />
          <meshBasicMaterial
            color={theme.emissive}
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

type SolarNodeProps = {
  id: string;
  radius: number;
  variant: PlanetVariant;
  icon: ReactNode;
  primary: string;
  secondary?: string;
  orbitRadius: number;
  startAngle: number;
  speed: number;
  reverse?: boolean;
  spin: boolean;
  paused: boolean;
  hovered: string | null;
  onHover: (id: string | null) => void;
  labelFactor?: number;
};

function SolarNode({
  id,
  radius,
  variant,
  icon,
  primary,
  secondary,
  orbitRadius,
  startAngle,
  speed,
  reverse,
  spin,
  paused,
  hovered,
  onHover,
  labelFactor = 11,
}: SolarNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(startAngle);
  const active = hovered === id;
  const labelZ = radius + 1.1;
  const accent = planetTheme(variant).accent;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (spin && !paused) {
      angleRef.current += delta * speed * (reverse ? -1 : 1);
    }
    const a = angleRef.current;
    groupRef.current.position.set(
      Math.cos(a) * orbitRadius,
      0,
      Math.sin(a) * orbitRadius,
    );
  });

  return (
    <group ref={groupRef}>
      <SphereMesh
        radius={radius}
        variant={variant}
        active={active}
        onPointerOver={() => onHover(id)}
        onPointerOut={() => onHover(null)}
      />
      <Html
        transform
        center
        distanceFactor={radius * 9}
        style={{ pointerEvents: "none" }}
      >
        <div
          className={`gox-sphere-icon gox-sphere-icon--${accent}${active ? " gox-sphere-icon--active" : ""}`}
        >
          {icon}
        </div>
      </Html>
      <Html
        position={[0, -0.12, labelZ]}
        center
        distanceFactor={labelFactor}
        style={{ pointerEvents: "none" }}
      >
        <div
          className={`gox-node-label gox-node-label--${accent}${active ? " gox-node-label--active" : ""}`}
        >
          <p className="gox-node-label__primary">{primary}</p>
          {secondary && <p className="gox-node-label__secondary">{secondary}</p>}
        </div>
      </Html>
    </group>
  );
}

function FundsCluster({
  data,
  spin,
  paused,
  hovered,
  onHover,
}: {
  data: ImpactPageData;
  spin: boolean;
  paused: boolean;
  hovered: string | null;
  onHover: (id: string | null) => void;
}) {
  const hubRef = useRef<THREE.Group>(null);
  const hubAngleRef = useRef(A_FUNDS);
  const satAngleRef = useRef(0);
  const satRefs = useRef<(THREE.Group | null)[]>([]);

  const donors = data.topDonors.slice(0, 2);
  const satellites: {
    id: string;
    label: string;
    variant: PlanetVariant;
  }[] = [
    ...donors.map((d) => ({
      id: `donor-${d.rank}`,
      label: `Major donor: ${d.name} (${formatPKR(d.amount)})`,
      variant: "moon-sm" as const,
    })),
    {
      id: "supporters-sat",
      label: `${data.donorCount}+ foundation supporters`,
      variant: "moon-sm" as const,
    },
  ];

  const satOrbit = 2.1;

  useFrame((_, delta) => {
    if (!hubRef.current) return;
    if (spin && !paused) {
      hubAngleRef.current += delta * 0.045;
      satAngleRef.current += delta * 0.22;
    }
    const ha = hubAngleRef.current;
    hubRef.current.position.set(
      Math.cos(ha) * R_FUNDS,
      0,
      Math.sin(ha) * R_FUNDS,
    );

    const sa = satAngleRef.current;
    const count = satellites.length;
    satRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const angle = sa + (i / count) * Math.PI * 2;
      ref.position.set(
        Math.cos(angle) * satOrbit,
        Math.sin(angle) * 0.12,
        Math.sin(angle) * satOrbit * 0.7,
      );
    });
  });

  const hubActive = hovered === "funds-hub";

  return (
    <group ref={hubRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[satOrbit, 0.022, 8, 96]} />
        <meshBasicMaterial
          color="#F78C1F"
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[satOrbit, 0.006, 10, 96]} />
        <meshBasicMaterial color="#c9a855" transparent opacity={0.32} />
      </mesh>

      <group>
        <SphereMesh
          radius={0.95}
          variant="moon"
          active={hubActive}
          onPointerOver={() => onHover("funds-hub")}
          onPointerOut={() => onHover(null)}
        />
        <Html
          transform
          center
          distanceFactor={10}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`gox-sphere-icon gox-sphere-icon--hub gox-sphere-icon--amber${hubActive ? " gox-sphere-icon--active" : ""}`}
          >
            <Link2 className="gox-lucide gox-lucide--lg" strokeWidth={2} />
            <Coins className="gox-lucide gox-lucide--sm gox-sphere-icon__accent" strokeWidth={2} />
          </div>
        </Html>
        <Html position={[0, -0.1, 1.95]} center distanceFactor={10.5} style={{ pointerEvents: "none" }}>
          <div
            className={`gox-node-label gox-node-label--hub gox-node-label--amber${hubActive ? " gox-node-label--active" : ""}`}
          >
            <p className="gox-node-label__primary">
              Total funds raised: {formatPKR(data.totalDonated)}
            </p>
          </div>
        </Html>
      </group>

      {satellites.map((sat, i) => {
        const active = hovered === sat.id;
        return (
          <group
            key={sat.id}
            ref={(el) => {
              satRefs.current[i] = el;
            }}
          >
            <SphereMesh
              radius={0.36}
              variant={sat.variant}
              active={active}
              onPointerOver={() => onHover(sat.id)}
              onPointerOut={() => onHover(null)}
            />
            <Html
              position={[0, -0.08, 0.72]}
              center
              distanceFactor={14}
              style={{ pointerEvents: "none" }}
            >
              <p
                className={`gox-satellite-label gox-satellite-label--pearl${active ? " gox-satellite-label--active" : ""}`}
              >
                {sat.label}
              </p>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function EnergySun({
  students,
  spin,
  hovered,
  onHover,
}: {
  students: number;
  spin: boolean;
  hovered: string | null;
  onHover: (id: string | null) => void;
}) {
  const coronaRef = useRef<THREE.Mesh>(null);
  const swirlRef = useRef<THREE.Mesh>(null);
  const active = hovered === "core";
  const sunR = 1.95;

  useFrame((_, delta) => {
    if (!spin) return;
    if (coronaRef.current) coronaRef.current.rotation.z += delta * 0.12;
    if (swirlRef.current) swirlRef.current.rotation.y += delta * 0.4;
  });

  return (
    <group>
      <mesh ref={coronaRef}>
        <sphereGeometry args={[sunR * 1.55, 32, 32]} />
        <meshBasicMaterial
          color="#F78C1F"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={swirlRef}>
        <sphereGeometry args={[sunR * 1.22, 48, 48]} />
        <meshBasicMaterial
          color="#ffcc66"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[sunR * 1.15, sunR * 1.45, 64]} />
        <meshBasicMaterial
          color="#F78C1F"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        scale={active ? 1.04 : 1}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover("core");
        }}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[sunR, 72, 72]} />
        <meshStandardMaterial
          color="#c86812"
          emissive="#F78C1F"
          emissiveIntensity={active ? 1.05 : 0.88}
          roughness={0.14}
          metalness={0.32}
        />
      </mesh>
      <pointLight intensity={10} color="#F78C1F" distance={32} decay={2} />
      <pointLight intensity={2.5} color="#ffeebb" distance={14} decay={2} />

      <Html position={[0, 0.2, sunR + 0.65]} center distanceFactor={9} style={{ pointerEvents: "none" }}>
        <div className="gox-sun-cap" aria-hidden>
          <GraduationCap className="gox-lucide gox-lucide--sun" strokeWidth={2} />
        </div>
      </Html>

      <Html transform center distanceFactor={7.5} style={{ pointerEvents: "none" }}>
        <div className={`gox-sun-text${active ? " gox-sun-text--active" : ""}`}>
          <span className="gox-sun-text__eyebrow">Core mission</span>
          <p className="gox-sun-text__headline">{students}+ students enrolled</p>
          <p className="gox-sun-text__sub">(and counting…)</p>
        </div>
      </Html>
    </group>
  );
}

function GalaxySystem({
  data,
  spin,
  hovered,
  onHover,
  tilt,
}: SceneProps) {
  const systemRef = useRef<THREE.Group>(null);
  const paused = hovered !== null;

  useFrame(() => {
    if (!systemRef.current) return;
    systemRef.current.rotation.x = THREE.MathUtils.lerp(
      systemRef.current.rotation.x,
      PLANE_TILT_X + tilt.x,
      0.06,
    );
    systemRef.current.rotation.z = THREE.MathUtils.lerp(
      systemRef.current.rotation.z,
      tilt.y,
      0.06,
    );
  });

  return (
    <group ref={systemRef}>
      <OrbitRing radius={R_ATTENDANCE} coreColor="#0ABFBC" glowColor="#0ABFBC" opacity={0.58} />
      <OrbitRing radius={R_PASSRATE} coreColor="#F78C1F" glowColor="#F78C1F" opacity={0.46} />
      <OrbitRing radius={R_TEACHERS} coreColor="#e06848" glowColor="#F78C1F" opacity={0.38} />
      <OrbitRing radius={R_FUNDS} coreColor="#c9a855" glowColor="#F78C1F" opacity={0.3} />

      <EnergySun
        students={data.students}
        spin={spin}
        hovered={hovered}
        onHover={onHover}
      />

      <SolarNode
        id="attendance"
        radius={0.78}
        variant="earth"
        icon={<Clock className="gox-lucide" strokeWidth={2} />}
        primary={`${data.attendanceRate}% attendance`}
        secondary="Daily engagement"
        orbitRadius={R_ATTENDANCE}
        startAngle={A_ATTENDANCE}
        speed={0.06}
        spin={spin}
        paused={paused}
        hovered={hovered}
        onHover={onHover}
        labelFactor={12}
      />

      <SolarNode
        id="passrate"
        radius={0.82}
        variant="gas"
        icon={<BookOpen className="gox-lucide" strokeWidth={2} />}
        primary={`High pass rate (${data.passRate}%)`}
        secondary="Academic excellence"
        orbitRadius={R_PASSRATE}
        startAngle={A_PASSRATE}
        speed={0.05}
        reverse
        spin={spin}
        paused={paused}
        hovered={hovered}
        onHover={onHover}
        labelFactor={12}
      />

      <SolarNode
        id="teachers"
        radius={0.8}
        variant="mars"
        icon={<GraduationCap className="gox-lucide" strokeWidth={2} />}
        primary={`${data.teachers} dedicated teachers`}
        orbitRadius={R_TEACHERS}
        startAngle={A_TEACHERS}
        speed={0.04}
        spin={spin}
        paused={paused}
        hovered={hovered}
        onHover={onHover}
        labelFactor={12}
      />

      <FundsCluster
        data={data}
        spin={spin}
        paused={paused}
        hovered={hovered}
        onHover={onHover}
      />
    </group>
  );
}

export default function ImpactGalaxyScene({
  data,
  spin,
  hovered,
  onHover,
  tilt,
}: SceneProps) {
  return (
    <Canvas
      className="gox-canvas"
      style={{ width: "100%", height: "100%" }}
      camera={{ fov: CAMERA_FOV, near: 0.1, far: 220 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      shadows
    >
      <GalaxyCamera />
      <color attach="background" args={["#050810"]} />
      <fog attach="fog" args={["#0a1020", 28, 88]} />
      <hemisphereLight args={["#1a2848", "#050810", 0.38]} />
      <ambientLight intensity={0.16} color="#7a9cff" />
      <directionalLight position={[3, 16, 10]} intensity={0.72} color="#fff4e6" castShadow />
      <directionalLight position={[-10, 8, -8]} intensity={0.2} color="#0ABFBC" />
      <Sparkles count={70} scale={22} size={2.2} speed={0.18} opacity={0.32} color="#0ABFBC" />
      <Sparkles count={45} scale={16} size={1.6} speed={0.12} opacity={0.22} color="#F78C1F" />
      <Stars radius={90} depth={55} count={4500} factor={3.8} saturation={0.12} fade speed={0.18} />
      <GalaxySystem
        data={data}
        spin={spin}
        hovered={hovered}
        onHover={onHover}
        tilt={tilt}
      />
    </Canvas>
  );
}
