/**
 * Living scene props — the inhabited details that stop a room reading as a
 * stage box. Presentational only: every mesh is raycast-transparent so the
 * patient stays clickable through furniture and clutter.
 *
 * Design rules (game bay, not museum):
 * - one story beat per cluster (someone lived here / worked here / crashed here)
 * - micro-motion only where it sells life (fan, TV, embers, steam, heat shimmer)
 * - keep mesh counts modest — iPad adaptive ladder is a hard contract
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const NO_RAYCAST = () => null;

/* ------------------------------------------------------------------ */
/* Shared tiny builders                                                */
/* ------------------------------------------------------------------ */

function Mat({
  color,
  roughness = 0.8,
  metalness = 0.05,
  emissive,
  emissiveIntensity = 0,
  transparent,
  opacity,
  side,
}: {
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  side?: THREE.Side;
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      emissive={emissive ?? color}
      emissiveIntensity={emissiveIntensity}
      transparent={transparent}
      opacity={opacity}
      side={side}
    />
  );
}

/** Seeded scatter so reloads place clutter identically. */
function scatter(seed: number, count: number): Array<{ x: number; z: number; rot: number; s: number }> {
  const out: Array<{ x: number; z: number; rot: number; s: number }> = [];
  let a = seed >>> 0;
  for (let i = 0; i < count; i++) {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    a = (a + 0x6d2b79f5) | 0;
    let t2 = Math.imul(a ^ (a >>> 15), 1 | a);
    t2 = (t2 + Math.imul(t2 ^ (t2 >>> 7), 61 | t2)) ^ t2;
    const r2 = ((t2 ^ (t2 >>> 14)) >>> 0) / 4294967296;
    out.push({
      x: (r - 0.5) * 2,
      z: (r2 - 0.5) * 2,
      rot: r2 * Math.PI * 2,
      s: 0.7 + r * 0.6,
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Atmosphere — motes, shimmer, embers, steam                          */
/* ------------------------------------------------------------------ */

/** Slow drifting dust catching the key light. */
export function DustMotes({
  count = 28,
  bounds = [2.4, 1.8, 2.4] as [number, number, number],
  centre = [0, 1.0, 0] as [number, number, number],
  color = '#fff2d8',
  size = 0.007,
  opacity = 0.35,
}: {
  count?: number;
  bounds?: [number, number, number];
  centre?: [number, number, number];
  color?: string;
  size?: number;
  opacity?: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    const pts = scatter(77, count);
    for (let i = 0; i < count; i++) {
      values[i * 3] = centre[0] + pts[i].x * bounds[0];
      values[i * 3 + 1] = centre[1] + (pts[i].s - 0.7) * bounds[1];
      values[i * 3 + 2] = centre[2] + pts[i].z * bounds[2];
    }
    return values;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, bounds[0], bounds[1], bounds[2], centre[0], centre[1], centre[2]]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += Math.sin(t * 0.15 + i) * 0.00035;
      arr[i * 3 + 1] += Math.cos(t * 0.11 + i * 0.7) * 0.00025;
      arr[i * 3 + 2] += Math.sin(t * 0.09 + i * 0.3) * 0.0003;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref} raycast={NO_RAYCAST}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.slice(), 3]} />
      </bufferGeometry>
      <pointsMaterial size={size} color={color} transparent opacity={opacity} depthWrite={false} />
    </points>
  );
}

/** Rising embers + glow flicker for fire scenes. */
export function FireEmbers({ count = 36 }: { count?: number }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      values[i * 3] = -2.4 + (i % 12) * 0.42;
      values[i * 3 + 1] = 0.15 + ((i * 0.17) % 2.2);
      values[i * 3 + 2] = -2.2 + ((i * 0.23) % 1.4);
    }
    return values;
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (lightRef.current) {
      lightRef.current.intensity = 3.2 + Math.sin(t * 7.3) * 0.5 + Math.sin(t * 13.1) * 0.25;
    }
    if (!ref.current) return;
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += Math.sin(t * 0.6 + i) * 0.002;
      arr[i * 3 + 1] = 0.12 + ((arr[i * 3 + 1] + 0.01 + (i % 3) * 0.0008) % 2.4);
      arr[i * 3 + 2] += Math.cos(t * 0.5 + i) * 0.0015;
    }
    attr.needsUpdate = true;
  });

  return (
    <group>
      <points ref={ref} raycast={NO_RAYCAST}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions.slice(), 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.035} color="#ff9a3c" transparent opacity={0.85} depthWrite={false} />
      </points>
      <pointLight ref={lightRef} position={[-1.2, 0.5, -2.0]} color="#ff6b35" intensity={3.2} distance={6} decay={2} />
    </group>
  );
}

/** Heat-haze shimmer band above hot ground. */
export function HeatShimmer({ y = 0.35, z = -1.2 }: { y?: number; z?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const m = ref.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.05 + Math.sin(t * 1.7) * 0.02;
    ref.current.scale.x = 1 + Math.sin(t * 0.9) * 0.02;
    ref.current.position.y = y + Math.sin(t * 1.3) * 0.01;
  });
  return (
    <mesh ref={ref} position={[0, y, z]} rotation={[-Math.PI / 2.4, 0, 0]} raycast={NO_RAYCAST}>
      <planeGeometry args={[6, 1.4]} />
      <meshBasicMaterial color="#fff0c4" transparent opacity={0.07} depthWrite={false} />
    </mesh>
  );
}

/** Soft steam / breath-vent plume. */
export function SteamVent({
  position = [0, 0, 0] as [number, number, number],
  count = 14,
  color = '#e8eef2',
}: {
  position?: [number, number, number];
  count?: number;
  color?: string;
}) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      values[i * 3] = ((i * 0.13) % 0.3) - 0.15;
      values[i * 3 + 1] = (i * 0.07) % 0.8;
      values[i * 3 + 2] = ((i * 0.11) % 0.2) - 0.1;
    }
    return values;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] = (arr[i * 3 + 1] + 0.004) % 0.9;
      arr[i * 3] += Math.sin(t + i) * 0.0004;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref} position={position} raycast={NO_RAYCAST}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.slice(), 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={color} transparent opacity={0.28} depthWrite={false} />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Living fixtures                                                     */
/* ------------------------------------------------------------------ */

/** Slow ceiling fan — sells air movement in Gulf interiors. */
export function CeilingFan({
  position = [0, 2.55, 0] as [number, number, number],
  bladeCount = 4,
}: {
  position?: [number, number, number];
  bladeCount?: number;
}) {
  const blades = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!blades.current) return;
    blades.current.rotation.y = clock.elapsedTime * 2.4;
  });
  return (
    <group position={position} raycast={NO_RAYCAST}>
      <mesh raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.05, 0.08, 0.12, 12]} />
        <Mat color="#c8c2b4" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[0, -0.08, 0]} raycast={NO_RAYCAST}>
        <sphereGeometry args={[0.07, 12, 8]} />
        <Mat color="#e8e2d4" emissive="#ffe6ad" emissiveIntensity={0.35} roughness={0.5} />
      </mesh>
      <group ref={blades} position={[0, -0.02, 0]}>
        {Array.from({ length: bladeCount }, (_, i) => (
          <mesh
            key={i}
            position={[Math.cos((i / bladeCount) * Math.PI * 2) * 0.42, 0, Math.sin((i / bladeCount) * Math.PI * 2) * 0.42]}
            rotation={[0, (i / bladeCount) * Math.PI * 2, 0]}
            raycast={NO_RAYCAST}
          >
            <boxGeometry args={[0.55, 0.012, 0.14]} />
            <Mat color="#8b7355" roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Wall clock — always 10:09, like a showroom, readable at a glance. */
export function WallClock({
  position = [0, 1.8, -2.4] as [number, number, number],
  rotation = [0, 0, 0] as [number, number, number],
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation} raycast={NO_RAYCAST}>
      <mesh rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.14, 0.14, 0.03, 24]} />
        <Mat color="#f5f0e6" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0, 0.02]} raycast={NO_RAYCAST}>
        <circleGeometry args={[0.12, 24]} />
        <Mat color="#faf7f0" roughness={0.7} />
      </mesh>
      <mesh position={[0.02, 0.04, 0.03]} rotation={[0, 0, -0.5]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.01, 0.07, 0.005]} />
        <Mat color="#222" />
      </mesh>
      <mesh position={[-0.03, 0.02, 0.03]} rotation={[0, 0, 0.9]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.008, 0.05, 0.005]} />
        <Mat color="#222" />
      </mesh>
    </group>
  );
}

/** Flat TV / monitor with a living glow flicker. */
export function LivingTelevision({
  position = [0, 1.1, -2.3] as [number, number, number],
  width = 1.1,
  height = 0.62,
  tint = '#6eb6ff',
}: {
  position?: [number, number, number];
  width?: number;
  height?: number;
  tint?: string;
}) {
  const screen = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!screen.current) return;
    const t = clock.elapsedTime;
    const m = screen.current.material as THREE.MeshStandardMaterial;
    // Slow channel-flicker: brightness wanders like a sports broadcast cut.
    m.emissiveIntensity = 0.85 + Math.sin(t * 3.1) * 0.08 + Math.sin(t * 11.7) * 0.04;
  });
  return (
    <group position={position} raycast={NO_RAYCAST}>
      <mesh raycast={NO_RAYCAST}>
        <boxGeometry args={[width + 0.06, height + 0.06, 0.04]} />
        <Mat color="#1a1d22" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh ref={screen} position={[0, 0, 0.025]} raycast={NO_RAYCAST}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#0b1220" emissive={tint} emissiveIntensity={0.9} roughness={0.35} />
      </mesh>
    </group>
  );
}

/** Framed photo / print — lived-in wall dressing. */
export function PhotoFrame({
  position = [0, 1.6, -2.4] as [number, number, number],
  w = 0.22,
  h = 0.28,
  tint = '#c4a574',
}: {
  position?: [number, number, number];
  w?: number;
  h?: number;
  tint?: string;
}) {
  return (
    <group position={position} raycast={NO_RAYCAST}>
      <mesh raycast={NO_RAYCAST}>
        <boxGeometry args={[w + 0.03, h + 0.03, 0.02]} />
        <Mat color="#3f2a19" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.015]} raycast={NO_RAYCAST}>
        <planeGeometry args={[w, h]} />
        <Mat color={tint} roughness={0.85} />
      </mesh>
    </group>
  );
}

/** Soft cloth curtain panel with a gentle sway. */
export function Curtain({
  position = [0, 1.4, -2.3] as [number, number, number],
  width = 0.45,
  height = 1.7,
  color = '#e8ddc8',
}: {
  position?: [number, number, number];
  width?: number;
  height?: number;
  color?: string;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.03;
    mesh.current.position.x = position[0] + Math.sin(clock.elapsedTime * 0.28) * 0.01;
  });
  return (
    <mesh ref={mesh} position={position} raycast={NO_RAYCAST}>
      <boxGeometry args={[width, height, 0.03]} />
      <Mat color={color} roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Potted plant — soft organic silhouette. */
export function PottedPlant({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale} raycast={NO_RAYCAST}>
      <mesh position={[0, 0.16, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.15, 0.11, 0.32, 14]} />
        <Mat color="#b99b6b" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.48, 0]} castShadow raycast={NO_RAYCAST}>
        <sphereGeometry args={[0.3, 12, 10]} />
        <Mat color="#3f6d4a" roughness={0.95} />
      </mesh>
      <mesh position={[0.12, 0.62, 0.08]} raycast={NO_RAYCAST}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <Mat color="#4d8558" roughness={0.95} />
      </mesh>
      <mesh position={[-0.1, 0.55, -0.1]} raycast={NO_RAYCAST}>
        <sphereGeometry args={[0.14, 10, 8]} />
        <Mat color="#355f3d" roughness={0.95} />
      </mesh>
    </group>
  );
}

/** Ceiling / wall AC unit with a faint cool vent glow. */
export function AirConditioner({
  position = [0, 2.3, -2.35] as [number, number, number],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position} raycast={NO_RAYCAST}>
      <mesh castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.95, 0.3, 0.2]} />
        <Mat color="#f4f6f8" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.12, 0.08]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.82, 0.05, 0.06]} />
        <Mat color="#334155" roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.08, 0.02]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.7, 0.02, 0.01]} />
        <Mat color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.55} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Home story props                                                    */
/* ------------------------------------------------------------------ */

/** Sofa with cushions slightly disordered — someone got up in a hurry. */
export function LivedInSofa({
  position = [0, 0, 0] as [number, number, number],
  rotation = 0,
  fabric = '#6b7758',
  hide = false,
}: {
  position?: [number, number, number];
  rotation?: number;
  fabric?: string;
  hide?: boolean;
}) {
  if (hide) return null;
  return (
    <group position={position} rotation={[0, rotation, 0]} raycast={NO_RAYCAST}>
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[1.75, 0.36, 0.78]} />
        <Mat color={fabric} roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.62, -0.3]} castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[1.75, 0.58, 0.18]} />
        <Mat color={fabric} roughness={0.96} />
      </mesh>
      {[-0.86, 0.86].map((x) => (
        <mesh key={`arm-${x}`} position={[x, 0.44, 0]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.18, 0.48, 0.78]} />
          <Mat color={fabric} roughness={0.96} />
        </mesh>
      ))}
      {[-0.4, 0.4].map((x, i) => (
        <mesh key={`cush-${x}`} position={[x, 0.46 + i * 0.01, 0.04]} rotation={[0.05 * (i + 1), 0.04 * i, 0.03 * (i ? -1 : 1)]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.7, 0.15, 0.62]} />
          <Mat color="#8a966f" roughness={0.98} />
        </mesh>
      ))}
      {/* Throw cushion knocked askew */}
      <mesh position={[0.72, 0.5, 0.18]} rotation={[0.4, 0.8, 0.35]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.32, 0.12, 0.32]} />
        <Mat color="#c47b5a" roughness={0.98} />
      </mesh>
    </group>
  );
}

/** Coffee table with tea tray, remote, and a dropped tissue. */
export function CoffeeTable({
  position = [0, 0, 0] as [number, number, number],
  rotation = 0,
}: {
  position?: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} raycast={NO_RAYCAST}>
      <mesh position={[0, 0.36, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[1.05, 0.05, 0.58]} />
        <Mat color="#5a3d25" roughness={0.4} metalness={0.08} />
      </mesh>
      {([[-0.44, -0.22], [0.44, -0.22], [-0.44, 0.22], [0.44, 0.22]] as const).map(([x, z]) => (
        <mesh key={`leg-${x}-${z}`} position={[x, 0.18, z]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.05, 0.36, 0.05]} />
          <Mat color="#3f2a19" roughness={0.5} />
        </mesh>
      ))}
      {/* Tea tray */}
      <group position={[-0.22, 0.4, 0.02]}>
        <mesh raycast={NO_RAYCAST}>
          <boxGeometry args={[0.3, 0.015, 0.22]} />
          <Mat color="#8b684c" roughness={0.55} />
        </mesh>
        {[[-0.07, 0.03], [0.07, -0.03]].map(([x, z]) => (
          <mesh key={`cup-${x}`} position={[x, 0.04, z]} raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.03, 0.025, 0.06, 10]} />
            <Mat color="#f5f0e6" roughness={0.45} />
          </mesh>
        ))}
      </group>
      {/* Remote */}
      <mesh position={[0.28, 0.4, 0.1]} rotation={[0, 0.4, 0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.05, 0.015, 0.14]} />
        <Mat color="#222" roughness={0.7} />
      </mesh>
      {/* Tissue on the floor beside the table */}
      <mesh position={[0.55, 0.005, 0.35]} rotation={[-Math.PI / 2, 0, 0.6]} raycast={NO_RAYCAST}>
        <planeGeometry args={[0.12, 0.1]} />
        <Mat color="#faf7f0" roughness={0.98} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Side table with medication bottles + inhaler + water glass. */
export function MedicationClutter({
  position = [0, 0, 0] as [number, number, number],
  variant = 'asthma',
}: {
  position?: [number, number, number];
  variant?: 'asthma' | 'cardiac' | 'generic';
}) {
  return (
    <group position={position} raycast={NO_RAYCAST}>
      <mesh position={[0, 0.4, 0]} castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.42, 0.04, 0.36]} />
        <Mat color="#5a3d25" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.36, 0.4, 0.3]} />
        <Mat color="#6b4a2e" roughness={0.6} />
      </mesh>
      {/* Pill bottles */}
      {[-0.1, 0.02].map((x, i) => (
        <mesh key={`bottle-${x}`} position={[x, 0.5, 0.04 * i]} raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.028, 0.028, 0.09, 10]} />
          <Mat color={i ? '#e8e4d8' : '#d4a017'} roughness={0.5} />
        </mesh>
      ))}
      {/* Condition-specific */}
      {variant === 'asthma' && (
        <group position={[0.1, 0.48, -0.06]} rotation={[0, 0.5, Math.PI / 2]}>
          <mesh raycast={NO_RAYCAST}>
            <boxGeometry args={[0.03, 0.1, 0.03]} />
            <Mat color="#2f80c9" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.06, 0]} raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.018, 0.018, 0.03, 8]} />
            <Mat color="#222" />
          </mesh>
        </group>
      )}
      {variant === 'cardiac' && (
        <mesh position={[0.1, 0.48, -0.06]} rotation={[0, 0.3, 0]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.04, 0.02, 0.1]} />
          <Mat color="#c0392b" roughness={0.45} />
        </mesh>
      )}
      {/* Water glass */}
      <mesh position={[-0.12, 0.5, -0.08]} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.03, 0.028, 0.1, 10]} />
        <Mat color="#cfe8f5" roughness={0.15} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

/** Walking stick leaning on furniture — mobility cue. */
export function WalkingStick({
  position = [0, 0, 0] as [number, number, number],
  rotation = [0, 0, 0.18] as [number, number, number],
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation} raycast={NO_RAYCAST}>
      <mesh position={[0, 0.45, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.015, 0.018, 0.9, 8]} />
        <Mat color="#5a3d25" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.92, 0]} rotation={[0, 0, Math.PI / 2]} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.014, 0.014, 0.14, 8]} />
        <Mat color="#3f2a19" roughness={0.5} />
      </mesh>
    </group>
  );
}

/** Slippers kicked off by the sofa. */
export function Slippers({
  position = [0, 0, 0] as [number, number, number],
}: {
  position?: [number, number, number];
}) {
  const spots = scatter(19, 2);
  return (
    <group position={position} raycast={NO_RAYCAST}>
      {spots.map((p, i) => (
        <mesh key={i} position={[p.x * 0.12, 0.01, p.z * 0.1]} rotation={[0, p.rot, 0]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.08, 0.03, 0.2]} />
          <Mat color={i ? '#8b4513' : '#a0522d'} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Public / office story props                                         */
/* ------------------------------------------------------------------ */

/** Reception / shop counter with a lit POS screen. */
export function ServiceCounter({
  position = [0, 0, 0] as [number, number, number],
  rotation = 0,
  width = 1.6,
}: {
  position?: [number, number, number];
  rotation?: number;
  width?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} raycast={NO_RAYCAST}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[width, 1.0, 0.55]} />
        <Mat color="#d7dbe2" roughness={0.45} metalness={0.08} />
      </mesh>
      <mesh position={[0, 1.02, 0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[width + 0.08, 0.05, 0.62]} />
        <Mat color="#9aa3ad" roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0.35, 1.2, -0.08]} rotation={[-0.25, 0, 0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.28, 0.2, 0.02]} />
        <Mat color="#111827" emissive="#1e3a5f" emissiveIntensity={0.55} roughness={0.35} />
      </mesh>
    </group>
  );
}

/** Wall AED / first-aid cabinet — reads instantly as a public building. */
export function AedCabinet({
  position = [0, 0, 0] as [number, number, number],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position} raycast={NO_RAYCAST}>
      <mesh raycast={NO_RAYCAST}>
        <boxGeometry args={[0.36, 0.44, 0.14]} />
        <Mat color="#e8f5e9" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.02, 0.08]} raycast={NO_RAYCAST}>
        <planeGeometry args={[0.28, 0.32]} />
        <Mat color="#c8e6c9" emissive="#66bb6a" emissiveIntensity={0.25} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.3, 0.02]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.2, 0.06, 0.02]} />
        <Mat color="#2e7d32" emissive="#2e7d32" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

/** Indoor mall/office trash + plant + bench cluster. */
export function PublicStreetFurniture({
  position = [0, 0, 0] as [number, number, number],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position} raycast={NO_RAYCAST}>
      {/* Bin */}
      <mesh position={[-0.55, 0.28, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.16, 0.14, 0.55, 12]} />
        <Mat color="#4a5568" roughness={0.55} metalness={0.3} />
      </mesh>
      {/* Bench */}
      <group position={[0.35, 0, 0]} rotation={[0, -0.2, 0]}>
        <mesh position={[0, 0.42, 0]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.1, 0.06, 0.4]} />
          <Mat color="#8b7355" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.65, -0.18]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.1, 0.28, 0.05]} />
          <Mat color="#8b7355" roughness={0.75} />
        </mesh>
        {[-0.4, 0.4].map((x) => (
          <mesh key={`bleg-${x}`} position={[x, 0.2, 0]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.05, 0.4, 0.35]} />
            <Mat color="#2c3340" roughness={0.5} metalness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Industrial / worksite story props                                   */
/* ------------------------------------------------------------------ */

export function HardHat({
  position = [0, 0, 0] as [number, number, number],
  color = '#f5c518',
}: {
  position?: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position} raycast={NO_RAYCAST}>
      <mesh position={[0, 0.06, 0]} castShadow raycast={NO_RAYCAST}>
        <sphereGeometry args={[0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Mat color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.04, 0]} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 14]} />
        <Mat color={color} roughness={0.55} />
      </mesh>
    </group>
  );
}

export function HazardDrum({
  position = [0, 0, 0] as [number, number, number],
  color = '#d8a51f',
}: {
  position?: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position} raycast={NO_RAYCAST}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.3, 0.3, 0.9, 16]} />
        <Mat color={color} roughness={0.65} metalness={0.2} />
      </mesh>
      {[0.15, 0.75].map((y) => (
        <mesh key={y} position={[0, y, 0]} raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.31, 0.31, 0.04, 16]} />
          <Mat color="#333" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 0.31]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.28, 0.18, 0.01]} />
        <Mat color="#111" emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export function ToolCrate({
  position = [0, 0, 0] as [number, number, number],
  rotation = 0,
}: {
  position?: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} raycast={NO_RAYCAST}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.7, 0.4, 0.4]} />
        <Mat color="#c45c26" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.42, 0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.72, 0.04, 0.42]} />
        <Mat color="#9a3412" roughness={0.65} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0.48, 0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.18, 0.04, 0.04]} />
        <Mat color="#292524" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
}

export function WorkLight({
  position = [0, 0, 0] as [number, number, number],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position} raycast={NO_RAYCAST}>
      <mesh position={[0, 0.04, 0]} castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.3, 0.06, 0.22]} />
        <Mat color="#292524" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.02, 0.03, 1.7, 8]} />
        <Mat color="#d6d3d1" roughness={0.35} metalness={0.7} />
      </mesh>
      <mesh position={[0, 1.7, 0.08]} rotation={[-0.5, 0, 0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.35, 0.22, 0.08]} />
        <Mat color="#fef3c7" emissive="#fde68a" emissiveIntensity={1.4} roughness={0.3} />
      </mesh>
      <pointLight position={[0, 1.6, 0.3]} intensity={1.6} distance={4} decay={2} color="#fde68a" />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Roadside story props                                                */
/* ------------------------------------------------------------------ */

/** Personal belongings thrown clear — phone, shoe, bag. */
export function CrashScatter({
  position = [0, 0, 0] as [number, number, number],
}: {
  position?: [number, number, number];
}) {
  const bits = useMemo(() => ([
    { x: -0.3, z: 0.2, rot: 0.8, kind: 'phone' as const },
    { x: 0.45, z: -0.15, rot: 1.4, kind: 'shoe' as const },
    { x: 0.1, z: 0.5, rot: 0.3, kind: 'bag' as const },
    { x: -0.55, z: -0.35, rot: 2.1, kind: 'shoe' as const },
    { x: 0.7, z: 0.35, rot: 0.5, kind: 'bottle' as const },
  ]), []);
  return (
    <group position={position} raycast={NO_RAYCAST}>
      {bits.map((b, i) => (
        <group key={i} position={[b.x, 0.01, b.z]} rotation={[0, b.rot, 0]}>
          {b.kind === 'phone' && (
            <mesh raycast={NO_RAYCAST}>
              <boxGeometry args={[0.07, 0.01, 0.14]} />
              <Mat color="#1a1a1a" roughness={0.4} metalness={0.3} />
            </mesh>
          )}
          {b.kind === 'shoe' && (
            <mesh raycast={NO_RAYCAST}>
              <boxGeometry args={[0.09, 0.06, 0.24]} />
              <Mat color="#292524" roughness={0.85} />
            </mesh>
          )}
          {b.kind === 'bag' && (
            <mesh position={[0, 0.06, 0]} castShadow raycast={NO_RAYCAST}>
              <boxGeometry args={[0.28, 0.14, 0.18]} />
              <Mat color="#7c2d12" roughness={0.8} />
            </mesh>
          )}
          {b.kind === 'bottle' && (
            <mesh rotation={[0, 0, Math.PI / 2]} raycast={NO_RAYCAST}>
              <cylinderGeometry args={[0.03, 0.03, 0.18, 8]} />
              <Mat color="#bce9f4" transparent opacity={0.6} roughness={0.2} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

/** Skid marks painted on asphalt. */
export function SkidMarks({
  position = [0, 0, 0] as [number, number, number],
  rotation = 0,
}: {
  position?: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} raycast={NO_RAYCAST}>
      {[-0.35, 0.35].map((x) => (
        <mesh key={x} position={[x, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
          <planeGeometry args={[0.18, 3.2]} />
          <meshBasicMaterial color="#141414" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

/** Roadwork barrier / water-filled barrier. */
export function TrafficBarrier({
  position = [0, 0, 0] as [number, number, number],
  rotation = 0,
}: {
  position?: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} raycast={NO_RAYCAST}>
      <mesh position={[0, 0.35, 0]} castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[1.2, 0.7, 0.35]} />
        <Mat color="#f2662a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.35, 0.18]} raycast={NO_RAYCAST}>
        <boxGeometry args={[1.0, 0.18, 0.02]} />
        <Mat color="#f8fafc" roughness={0.5} />
      </mesh>
    </group>
  );
}

/** Street lamp with a warm pool of light. */
export function StreetLamp({
  position = [0, 0, 0] as [number, number, number],
  lit = true,
}: {
  position?: [number, number, number];
  lit?: boolean;
}) {
  return (
    <group position={position} raycast={NO_RAYCAST}>
      <mesh position={[0, 0.05, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.12, 0.14, 0.1, 10]} />
        <Mat color="#4b5563" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.04, 0.05, 4.0, 10]} />
        <Mat color="#6b7280" roughness={0.4} metalness={0.65} />
      </mesh>
      <mesh position={[0.2, 3.9, 0]} rotation={[0, 0, -0.3]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.5, 0.08, 0.18]} />
        <Mat color="#4b5563" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0.4, 3.82, 0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.22, 0.08, 0.16]} />
        <Mat color="#fff7d6" emissive="#ffe6a0" emissiveIntensity={lit ? 1.8 : 0} roughness={0.3} />
      </mesh>
      {lit && <pointLight position={[0.4, 3.7, 0]} intensity={1.8} distance={6} decay={2} color="#ffe0a0" />}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Heat / agricultural / water helpers                                 */
/* ------------------------------------------------------------------ */

export function WaterBottleCluster({
  position = [0, 0, 0] as [number, number, number],
  count = 4,
}: {
  position?: [number, number, number];
  count?: number;
}) {
  const spots = useMemo(() => scatter(31, count), [count]);
  return (
    <group position={position} raycast={NO_RAYCAST}>
      {spots.map((p, i) => (
        <mesh key={i} position={[p.x * 0.15, 0.12, p.z * 0.12]} rotation={[0, p.rot, i % 2 ? 0.05 : -0.04]} castShadow raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.035, 0.04, 0.24, 10]} />
          <Mat color="#bce9f4" transparent opacity={0.65} roughness={0.18} />
        </mesh>
      ))}
    </group>
  );
}

export function SunHat({
  position = [0, 0, 0] as [number, number, number],
  color = '#e8d9a0',
}: {
  position?: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position} raycast={NO_RAYCAST}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <circleGeometry args={[0.16, 16]} />
        <Mat color={color} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.04, 0]} raycast={NO_RAYCAST}>
        <sphereGeometry args={[0.08, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Mat color={color} roughness={0.9} />
      </mesh>
    </group>
  );
}

export function ProduceCrate({
  position = [0, 0, 0] as [number, number, number],
  rotation = 0,
  fill = '#c45c26',
}: {
  position?: [number, number, number];
  rotation?: number;
  fill?: string;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} raycast={NO_RAYCAST}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.5, 0.3, 0.35]} />
        <Mat color="#a16207" roughness={0.9} />
      </mesh>
      {scatter(43, 5).map((p, i) => (
        <mesh key={i} position={[p.x * 0.15, 0.32 + (i % 2) * 0.03, p.z * 0.1]} raycast={NO_RAYCAST}>
          <sphereGeometry args={[0.05 * p.s, 8, 6]} />
          <Mat color={fill} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

export function PesticideTank({
  position = [0, 0, 0] as [number, number, number],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position} raycast={NO_RAYCAST}>
      <mesh position={[0, 0.35, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.18, 0.18, 0.7, 14]} />
        <Mat color="#2a6f97" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.74, 0]} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.08, 0.1, 0.1, 10]} />
        <Mat color="#292524" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.4, 0.19]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.18, 0.14, 0.01]} />
        <Mat color="#fef3c7" emissive="#fbbf24" emissiveIntensity={0.45} />
      </mesh>
      {/* Coiled hose */}
      <mesh position={[0.3, 0.08, 0.15]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <torusGeometry args={[0.18, 0.025, 8, 16]} />
        <Mat color="#1f2937" roughness={0.7} />
      </mesh>
    </group>
  );
}

export function BeachTowel({
  position = [0, 0, 0] as [number, number, number],
  rotation = 0,
  color = '#38bdf8',
}: {
  position?: [number, number, number];
  rotation?: number;
  color?: string;
}) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, rotation]} raycast={NO_RAYCAST}>
      <planeGeometry args={[0.7, 1.4]} />
      <Mat color={color} roughness={0.98} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function RescueTube({
  position = [0, 0, 0] as [number, number, number],
  rotation = [0, 0, 0.4] as [number, number, number],
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} raycast={NO_RAYCAST}>
      <capsuleGeometry args={[0.07, 0.9, 4, 10]} />
      <Mat color="#f97316" roughness={0.55} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Wall art / lived-in collage                                         */
/* ------------------------------------------------------------------ */

/** A small cluster of framed prints — instantly "someone's home". */
export function WallArtCluster({
  position = [0, 0, 0] as [number, number, number],
  rotation = [0, 0, 0] as [number, number, number],
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation} raycast={NO_RAYCAST}>
      <PhotoFrame position={[-0.28, 0.08, 0]} w={0.2} h={0.26} tint="#c4a574" />
      <PhotoFrame position={[0.02, -0.05, 0]} w={0.16} h={0.2} tint="#8fad9a" />
      <PhotoFrame position={[0.28, 0.1, 0]} w={0.18} h={0.18} tint="#b8956c" />
    </group>
  );
}

/** Prayer mat rolled in the corner — Gulf domestic cue. */
export function PrayerMat({
  position = [0, 0, 0] as [number, number, number],
  rotation = 0,
}: {
  position?: [number, number, number];
  rotation?: number;
}) {
  return (
    <mesh position={position} rotation={[0, rotation, 0]} raycast={NO_RAYCAST}>
      <boxGeometry args={[0.5, 0.08, 0.18]} />
      <Mat color="#1e3a5f" roughness={0.95} />
    </mesh>
  );
}

/** Fruit bowl — small warm accent on a table. */
export function FruitBowl({
  position = [0, 0, 0] as [number, number, number],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position} raycast={NO_RAYCAST}>
      <mesh raycast={NO_RAYCAST}>
        <sphereGeometry args={[0.1, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <Mat color="#e7e5e4" roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      {scatter(55, 4).map((p, i) => (
        <mesh key={i} position={[p.x * 0.05, 0.04, p.z * 0.05]} raycast={NO_RAYCAST}>
          <sphereGeometry args={[0.035, 8, 6]} />
          <Mat color={['#f97316', '#ef4444', '#84cc16', '#eab308'][i % 4]} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
