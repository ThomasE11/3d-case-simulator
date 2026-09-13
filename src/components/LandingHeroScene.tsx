import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

/**
 * LandingHeroScene — a lightweight, "alive" clinical-pulse backdrop for the
 * landing page hero.
 *
 * Three cheap, self-contained layers (no postprocessing, no shadows, no heavy
 * patient model — the landing page must stay instant):
 *   1. A looping cardiac EKG trace (P–QRS–T) that sweeps left→right.
 *   2. A field of slow-floating "oxygen/plasma" particles (teal → cyan).
 *   3. Subtle pointer-tilt parallax so the whole scene leans toward the cursor
 *      like a game menu.
 *
 * Everything is additive over a transparent canvas, so the existing hero
 * background gradient still shows through.
 */

// ---------------------------------------------------------------------------
// Cardiac waveform shape (unit space, one full cycle). Modelled on a normal
// sinus beat: flat baseline → P wave → PR segment → QRS complex → ST segment
// → T wave → return to baseline.
// ---------------------------------------------------------------------------
function cardiacWaveform(t: number): number {
  // t in [0, 1) across one beat; returns a deflection in [-1, 1].
  const pt = (a: number, b: number, x: number) => {
    // local normalised position inside [a, b]
    const u = (x - a) / (b - a);
    return u < 0 || u > 1 ? 0 : u;
  };
  // P wave (atrial depolarisation) — gentle rise/fall around t≈0.16
  const p = pt(0.08, 0.24, t);
  const pWave = Math.sin(p * Math.PI) * 0.14;
  // QRS complex — sharp tall spike around t≈0.34
  const qrs = pt(0.30, 0.40, t);
  let qrsWave = 0;
  if (qrs > 0) {
    const q = Math.sin(Math.min(qrs * 1.6, 1) * Math.PI);
    qrsWave = q * 0.85; // tall narrow R, with the Q/S troughs implied by edges
  }
  // T wave (ventricular repolarisation) — broad, around t≈0.66
  const tWaveT = pt(0.56, 0.78, t);
  const tWave = Math.sin(tWaveT * Math.PI) * 0.22;

  return pWave + qrsWave + tWave;
}

function buildCardiacPath(beatCount: number, pointsPerBeat: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const width = 24; // world units across
  const height = 1.1;
  for (let i = 0; i <= beatCount * pointsPerBeat; i++) {
    const u = i / (beatCount * pointsPerBeat); // 0..1 across all beats
    const x = u * width - width / 2;
    const beatT = (i % pointsPerBeat) / pointsPerBeat; // 0..1 within beat
    const y = cardiacWaveform(beatT) * height;
    pts.push(new THREE.Vector3(x, y, 0));
  }
  return pts;
}

function EkgTrace() {
  const points = useMemo(() => buildCardiacPath(6, 200), []);
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    // Sweep the whole trace leftward and wrap, giving a monitor-drift feel.
    // Also drive a bright "sweep head" that travels ahead of the trace.
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      const speed = 1.1; // units/sec
      const width = 24;
      const offset = (t * speed) % width;
      groupRef.current.position.x = offset - width / 2;
    }
    if (headRef.current) {
      // A tall thin quad marking the live edge, moving right-to-left.
      headRef.current.position.x = 12 - ((clock.getElapsedTime() * 1.1) % 24) + 0.4;
    }
  });

  return (
    <group>
      {/* The trace, positioned in the lower third so it reads as a monitor strip
          and never crosses the patient's face. */}
      <group ref={groupRef} position={[0, -3.2, 0]}>
        {/* Soft glow pass behind the trace */}
        <Line
          points={points}
          color="#22d3ee"
          lineWidth={9}
          transparent
          opacity={0.28}
        />
        {/* Sharp front trace */}
        <Line
          points={points}
          color="#a5f3fc"
          lineWidth={2.2}
          transparent
          opacity={0.95}
        />
      </group>
      {/* Bright sweep head */}
      <mesh ref={headRef} position={[12, -3.2, 0]}>
        <planeGeometry args={[0.06, 2.2]} />
        <meshBasicMaterial color="#e0fbff" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function ParticleField({ count = 90 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      speeds[i] = 0.15 + Math.random() * 0.45;
    }
    return { positions, speeds };
  }, [count]);

  useFrame(({ clock }) => {
    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const pos = geom.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      // Slow upward drift with a gentle sine sway; wrap on the top edge.
      let y = pos[i * 3 + 1] + Math.sin(t * 0.6 + i) * 0.0012 + speeds[i] * 0.0035;
      if (y > 6.5) y = -6.5;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 0] += Math.sin(t * 0.5 + i * 0.7) * 0.0008;
    }
    geom.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.13}
        color="#9be8ff"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function TiltRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ pointer }) => {
    if (!group.current) return;
    // Pointer is already normalised to [-1, 1]; ease toward it.
    const targetX = pointer.y * 0.10;
    const targetY = pointer.x * 0.14;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.06;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.06;
  });
  return <group ref={group}>{children}</group>;
}

export function LandingHeroScene() {
  return (
    <Canvas
      dpr={Math.min(window.devicePixelRatio, 2)}
      frameloop="always"
      camera={{ position: [0, 0, 11], fov: 40, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden="true"
    >
      <TiltRig>
        <EkgTrace />
        <ParticleField count={90} />
      </TiltRig>
    </Canvas>
  );
}
