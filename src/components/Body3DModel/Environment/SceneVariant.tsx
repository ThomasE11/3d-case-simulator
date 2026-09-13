/**
 * Scene-contextual environment variants — home, public, roadside, worksite,
 * fire, water rescue and heat exposure. The clinic variant stays in index.tsx
 * (Room + BayLighting); these are the alternates swapped in by
 * TreatmentBayEnvironment from the case's complete scene contract.
 *
 * Same rules as the clinic bay:
 * - every mesh sets raycast={() => null} so region clicks pass through
 * - hideOverhead removes ceiling geometry when the orbit camera is above
 * - exactly ONE shadow-casting light per variant (iPad budget)
 * - primitives by default; license-clean GLBs live under public/models/props/
 * - medical equipment (IV stand, monitor, crash cart, O2) is composed by
 *   index.tsx in every variant — the paramedic brings it to the scene
 */
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import type { EnvironmentVariant } from '@/lib/sceneEnvironment';
import type { PatientSeatKind } from '@/lib/patientStaging';
import { RESP001_VILLA_SHELL } from '@/lib/cameraOrbitSafety';
import { getVillaTextures } from './textures';
import { KenneyPatientChair } from './KenneyPatientChair';
import { Resp001VillaDressing } from './Resp001VillaDressing';
import { isResp001VillaProfile, type SceneProfile } from './sceneProfile';

const NO_RAYCAST = () => null;

// RectAreaLight needs its LTC uniforms initialised once for WebGLRenderer.
// No-op after the first call; safe at module scope in the browser build.
let rectAreaLightUniformsReady = false;
function ensureRectAreaLightUniforms(): void {
  if (rectAreaLightUniformsReady) return;
  RectAreaLightUniformsLib.init();
  rectAreaLightUniformsReady = true;
}

/** Shadow-casting key spot aimed at the patient — shared rig, per-scene color. */
function KeyLight({
  color,
  intensity,
  position,
  shadowsEnabled,
  angle = 0.55,
}: {
  color: string;
  intensity: number;
  position: [number, number, number];
  shadowsEnabled: boolean;
  angle?: number;
}) {
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0.45, 0);
    return o;
  }, []);
  return (
    <>
      <primitive object={target} />
      <spotLight
        position={position}
        target={target}
        angle={angle}
        penumbra={0.7}
        intensity={intensity}
        distance={10}
        decay={2}
        color={color}
        castShadow={shadowsEnabled}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
    </>
  );
}

/**
 * Lightweight daylight dome for open-air scenes. The Canvas is deliberately
 * transparent so the cockpit can frame it, but that used to expose the dark
 * HUD background beyond the floor plane and made heat/water/worksite calls
 * look as though they happened at night. One back-faced sphere restores a
 * readable horizon without an HDR sky texture or another network asset.
 */
function OutdoorSky({ zenith, horizon }: { zenith: string; horizon: string }) {
  const uniforms = useMemo(() => ({
    zenithColour: { value: new THREE.Color(zenith) },
    horizonColour: { value: new THREE.Color(horizon) },
  }), [horizon, zenith]);

  return (
    <mesh renderOrder={-1000} frustumCulled={false} raycast={NO_RAYCAST}>
      <sphereGeometry args={[18, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying float vSkyHeight;
          void main() {
            vSkyHeight = normalize(position).y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 zenithColour;
          uniform vec3 horizonColour;
          varying float vSkyHeight;
          void main() {
            float blend = smoothstep(-0.12, 0.72, vSkyHeight);
            gl_FragColor = vec4(mix(horizonColour, zenithColour, blend), 1.0);
          }
        `}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Home — villa/apartment living room with a visible adjoining hallway. The
// first procedural version stopped at a full-width back wall and read like a
// furnished display box. The open doorway, continued floor and deeper hall
// give the student a believable home beyond the immediate treatment area.
// The shared version keeps its camera-facing side open. The resp-001 profile
// extends that shell around the supported orbit with a physical front wall.
// ---------------------------------------------------------------------------

const ROOM = {
  halfW: 3.25,
  backZ: -2.6,
  frontZ: 2.8,
  height: 2.75,
} as const;

const HALL = {
  leftX: 0.75,
  rightX: 2.45,
  backZ: -5.4,
  openingHeight: 2.2,
} as const;

/** Window daylight far-plane. Uses the case scene photo as an emissive image
 *  behind the glass — parallax view of the UAE villa exterior. Suspends while
 *  the PNG loads; the caller wraps it in Suspense with a plain-glow fallback. */
function WindowView() {
  const tex = useTexture('/scene-assets/asthma-villa-male-uae.png');
  return (
    <mesh raycast={NO_RAYCAST}>
      <planeGeometry args={[1.9, 1.25]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

/** Profile-specific exterior assembled from lightweight geometry. It avoids
 * projecting the resp-001 incident photograph back into the room while still
 * giving the window a legible UAE courtyard, neighbouring villa and palm. */
function VillaCourtyardView() {
  return (
    <group>
      <mesh position={[0, 0, -0.03]} raycast={NO_RAYCAST}>
        <planeGeometry args={[1.9, 1.25]} />
        <meshBasicMaterial color="#9dcadf" toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.42, -0.015]} raycast={NO_RAYCAST}>
        <planeGeometry args={[1.9, 0.42]} />
        <meshBasicMaterial color="#d8c39d" toneMapped={false} />
      </mesh>
      <group position={[0.45, -0.16, 0]}>
        <mesh raycast={NO_RAYCAST}>
          <planeGeometry args={[0.76, 0.48]} />
          <meshBasicMaterial color="#f0dfbe" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.28, 0.006]} raycast={NO_RAYCAST}>
          <coneGeometry args={[0.54, 0.18, 4]} />
          <meshBasicMaterial color="#b88b5d" toneMapped={false} />
        </mesh>
        {[-0.21, 0.21].map(x => (
          <mesh key={`courtyard-window-${x}`} position={[x, 0.02, 0.008]} raycast={NO_RAYCAST}>
            <planeGeometry args={[0.16, 0.22]} />
            <meshBasicMaterial color="#527282" toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group position={[-0.58, -0.12, 0.012]}>
        <mesh position={[0, -0.12, 0]} raycast={NO_RAYCAST}>
          <planeGeometry args={[0.055, 0.55]} />
          <meshBasicMaterial color="#795332" toneMapped={false} />
        </mesh>
        {[-0.48, -0.24, 0, 0.24, 0.48].map((rotation, index) => (
          <mesh key={`courtyard-palm-${index}`} position={[Math.sin(rotation) * 0.15, 0.16 + Math.abs(rotation) * 0.04, 0.005]} rotation={[0, 0, rotation]} scale={[1.8, 0.55, 1]} raycast={NO_RAYCAST}>
            <circleGeometry args={[0.16, 10]} />
            <meshBasicMaterial color="#315d39" toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Warm UAE daylight entering through the villa window. A RectAreaLight gives
 *  the broad, soft window wash; the existing spot remains the single shadow
 *  caster so the patient still gets a readable key shadow on the floor. */
function WindowAreaLight() {
  const ref = useRef<THREE.RectAreaLight>(null);
  useEffect(() => {
    ensureRectAreaLightUniforms();
    // RectAreaLight is a Light, so lookAt points its emitting face (-Z) at
    // the patient rather than out through the glass.
    ref.current?.lookAt(0, 0.9, 0);
  }, []);
  return (
    <rectAreaLight
      ref={ref}
      args={['#ffd7a6', 4.2, 1.9, 1.25]}
      position={[-1.45, 1.58, ROOM.backZ + 0.1]}
    />
  );
}

// Dust motes drifting through the window beam. Kept separate from the bay
// motes so the villa beam reads as daylight, not surgical-light dust.
const HOME_DUST_HEIGHT = 1.9;
function HomeDustMotes({ count = 90, opacity = 0.26, size = 0.012 }: { count?: number; opacity?: number; size?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const base = new Float32Array(count * 3);
    const seed = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      base[i * 3] = -1.45 + (Math.random() - 0.5) * 1.5;
      base[i * 3 + 1] = 0.25 + Math.random() * HOME_DUST_HEIGHT;
      base[i * 3 + 2] = ROOM.backZ + 0.35 + Math.random() * 1.8;
      seed[i * 2] = Math.random() * Math.PI * 2;
      seed[i * 2 + 1] = 0.01 + Math.random() * 0.03;
    }
    return { base, seed, positions: base.slice() };
  }, [count]);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (!points) return;
    const attr = points.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = clock.elapsedTime;
    const { base, seed } = data;
    for (let i = 0; i < count; i++) {
      const phase = seed[i * 2];
      const fall = seed[i * 2 + 1];
      const y = base[i * 3 + 1] - t * fall;
      arr[i * 3 + 1] = 0.25 + ((y % HOME_DUST_HEIGHT) + HOME_DUST_HEIGHT) % HOME_DUST_HEIGHT;
      arr[i * 3] = base[i * 3] + Math.sin(t * 0.25 + phase) * 0.045;
      arr[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.2 + phase) * 0.05;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} raycast={NO_RAYCAST}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        sizeAttenuation
        color="#ffe9c4"
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function HomeScene({
  hideOverhead,
  shadowsEnabled,
  showPatientSeat,
  patientSeatKind,
  sceneProfile,
}: {
  hideOverhead: boolean;
  shadowsEnabled: boolean;
  showPatientSeat: boolean;
  patientSeatKind?: PatientSeatKind;
  sceneProfile?: SceneProfile;
}) {
  const tex = getVillaTextures();
  const hasResp001Dressing = isResp001VillaProfile(sceneProfile);
  const roomFrontZ = hasResp001Dressing ? RESP001_VILLA_SHELL.frontZ : ROOM.frontZ;
  // The original shared shell is intentionally centred at z=0. Preserve it
  // exactly for other cases; only the pilot gets the extended physical room.
  const roomDepth = hasResp001Dressing ? roomFrontZ - ROOM.backZ : ROOM.frontZ - ROOM.backZ;
  const roomCentreZ = hasResp001Dressing ? (ROOM.backZ + roomFrontZ) / 2 : 0;
  return (
    <group>
      {/* Oak floor */}
      <mesh name={hasResp001Dressing ? 'resp001-villa-floor' : undefined} position={[0, -0.05, roomCentreZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[ROOM.halfW * 2, roomDepth]} />
        <meshStandardMaterial
          map={tex.wood.map}
          normalMap={tex.wood.normalMap}
          normalScale={[0.7, 0.7]}
          roughness={0.45}
          metalness={0.05}
        />
      </mesh>

      {hasResp001Dressing ? (
        <Suspense fallback={null}>
          <Resp001VillaDressing shadowsEnabled={shadowsEnabled} showPatientSeat={showPatientSeat} />
        </Suspense>
      ) : (
        <>
          {/* Shared home rug. The case profile replaces this with its authored weave. */}
          <mesh position={[0, -0.043, 0.15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
            <planeGeometry args={[3.7, 2.6]} />
            <meshStandardMaterial color="#8c4436" roughness={0.98} />
          </mesh>
          <mesh position={[0, -0.042, 0.15]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
            <planeGeometry args={[3.15, 2.1]} />
            <meshStandardMaterial color="#a15a44" roughness={0.98} />
          </mesh>
        </>
      )}

      {/* Back wall split around an open hallway. A real opening is important:
          painting a dark rectangle on the old wall preserved the stage-box
          silhouette and supplied no parallax when the student orbited. */}
      {([
        [(-ROOM.halfW + HALL.leftX) / 2, HALL.leftX + ROOM.halfW],
        [(HALL.rightX + ROOM.halfW) / 2, ROOM.halfW - HALL.rightX],
      ] as const).map(([x, width]) => (
        <mesh key={`back-wall-${x}`} position={[x, ROOM.height / 2 - 0.05, ROOM.backZ]} receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[width, ROOM.height, 0.06]} />
          <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.5, 0.5]} roughness={0.92} />
        </mesh>
      ))}
      <mesh
        position={[(HALL.leftX + HALL.rightX) / 2, HALL.openingHeight + (ROOM.height - HALL.openingHeight) / 2 - 0.05, ROOM.backZ]}
        receiveShadow
        raycast={NO_RAYCAST}
      >
        <boxGeometry args={[HALL.rightX - HALL.leftX, ROOM.height - HALL.openingHeight, 0.06]} />
        <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.5, 0.5]} roughness={0.92} />
      </mesh>
      {/* Side walls */}
      {[-ROOM.halfW, ROOM.halfW].map((x) => (
        <mesh key={`wall-${x}`} name={hasResp001Dressing ? `resp001-villa-side-wall-${x < 0 ? 'left' : 'right'}` : undefined} position={[x, ROOM.height / 2 - 0.05, roomCentreZ]} receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.06, ROOM.height, roomDepth]} />
          <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.5, 0.5]} roughness={0.92} />
        </mesh>
      ))}

      {hasResp001Dressing && (
        <group name="resp001-villa-front-envelope">
          <mesh name="resp001-villa-front-wall" position={[0, ROOM.height / 2 - 0.05, roomFrontZ]} receiveShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[ROOM.halfW * 2, ROOM.height, RESP001_VILLA_SHELL.wallDepth]} />
            <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.5, 0.5]} roughness={0.92} />
          </mesh>
          <mesh name="resp001-villa-front-skirting" position={[0, 0.05, roomFrontZ - 0.04]} raycast={NO_RAYCAST}>
            <boxGeometry args={[ROOM.halfW * 2, 0.14, 0.02]} />
            <meshStandardMaterial color="#e8ddc8" roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* Skirting boards — broken around the doorway rather than bridging it. */}
      {([
        [(-ROOM.halfW + HALL.leftX) / 2, HALL.leftX + ROOM.halfW],
        [(HALL.rightX + ROOM.halfW) / 2, ROOM.halfW - HALL.rightX],
      ] as const).map(([x, width]) => (
        <mesh key={`back-skirt-${x}`} position={[x, 0.05, ROOM.backZ + 0.04]} raycast={NO_RAYCAST}>
          <boxGeometry args={[width, 0.14, 0.02]} />
          <meshStandardMaterial color="#e8ddc8" roughness={0.7} />
        </mesh>
      ))}
      {[-ROOM.halfW + 0.04, ROOM.halfW - 0.04].map((x) => (
        <mesh key={`skirt-${x}`} position={[x, 0.05, roomCentreZ]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.02, 0.14, roomDepth]} />
          <meshStandardMaterial color="#e8ddc8" roughness={0.7} />
        </mesh>
      ))}

      {/* Adjoining hallway: continued timber floor, side walls and a distant
          interior door create real depth instead of a flat scenic backdrop. */}
      <mesh
        position={[(HALL.leftX + HALL.rightX) / 2, -0.049, (ROOM.backZ + HALL.backZ) / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        raycast={NO_RAYCAST}
      >
        <planeGeometry args={[HALL.rightX - HALL.leftX, ROOM.backZ - HALL.backZ]} />
        <meshStandardMaterial map={tex.wood.map} normalMap={tex.wood.normalMap} normalScale={[0.55, 0.55]} roughness={0.5} />
      </mesh>
      {[HALL.leftX, HALL.rightX].map((x) => (
        <mesh
          key={`hall-wall-${x}`}
          position={[x, ROOM.height / 2 - 0.05, (ROOM.backZ + HALL.backZ) / 2]}
          receiveShadow
          raycast={NO_RAYCAST}
        >
          <boxGeometry args={[0.06, ROOM.height, ROOM.backZ - HALL.backZ]} />
          <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.45, 0.45]} roughness={0.92} />
        </mesh>
      ))}
      <mesh
        position={[(HALL.leftX + HALL.rightX) / 2, ROOM.height / 2 - 0.05, HALL.backZ]}
        receiveShadow
        raycast={NO_RAYCAST}
      >
        <boxGeometry args={[HALL.rightX - HALL.leftX, ROOM.height, 0.06]} />
        <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.45, 0.45]} roughness={0.92} />
      </mesh>
      <group position={[(HALL.leftX + HALL.rightX) / 2, 1.02, HALL.backZ + 0.05]}>
        <mesh castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.86, 2.04, 0.08]} />
          <meshStandardMaterial color="#8b684c" roughness={0.62} />
        </mesh>
        {[0.34, -0.34].map((y) => (
          <mesh key={`door-panel-${y}`} position={[0, y, 0.05]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.68, 0.5, 0.025]} />
            <meshStandardMaterial color="#9c7656" roughness={0.66} />
          </mesh>
        ))}
        <mesh position={[0.31, 0, 0.1]} raycast={NO_RAYCAST}>
          <sphereGeometry args={[0.035, 12, 8]} />
          <meshStandardMaterial color="#c9a86a" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
      {([HALL.leftX, HALL.rightX] as const).map((x) => (
        <group key={`door-trim-${x}`}>
          <mesh position={[x, HALL.openingHeight / 2, ROOM.backZ + 0.055]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.09, HALL.openingHeight, 0.08]} />
            <meshStandardMaterial color="#eee1cf" roughness={0.66} />
          </mesh>
        </group>
      ))}
      <mesh position={[(HALL.leftX + HALL.rightX) / 2, HALL.openingHeight, ROOM.backZ + 0.055]} raycast={NO_RAYCAST}>
        <boxGeometry args={[HALL.rightX - HALL.leftX + 0.18, 0.09, 0.08]} />
        <meshStandardMaterial color="#eee1cf" roughness={0.66} />
      </mesh>

      {/* Window on the back wall — glass + parallax exterior + frame.
          The far-plane sits a little behind the glass so it reads as depth. */}
      <group position={[-1.45, 1.5, ROOM.backZ + 0.04]}>
        {/* Exterior view (emissive photo). Falls back to a warm glow plane. */}
        <group position={[0, 0, -0.12]}>
          {hasResp001Dressing ? (
            <VillaCourtyardView />
          ) : (
            <Suspense
              fallback={
                <mesh raycast={NO_RAYCAST}>
                  <planeGeometry args={[1.9, 1.25]} />
                  <meshBasicMaterial color="#ffe9c4" toneMapped={false} />
                </mesh>
              }
            >
              <WindowView />
            </Suspense>
          )}
        </group>
        {/* Glass pane — faint, slightly reflective */}
        <mesh raycast={NO_RAYCAST}>
          <planeGeometry args={[1.9, 1.25]} />
          <meshStandardMaterial color="#eaf3ff" transparent opacity={0.12} roughness={0.05} metalness={0.1} />
        </mesh>
        {/* Frame: outer border + cross mullions */}
        {([[0, 0.66, 2.02, 0.08], [0, -0.66, 2.02, 0.08], [-0.99, 0, 0.08, 1.34], [0.99, 0, 0.08, 1.34], [0, 0, 0.05, 1.3], [0, 0, 2.0, 0.05]] as const).map(
          ([fx, fy, fw, fh], i) => (
            <mesh key={`frame-${i}`} position={[fx, fy, 0.02]} raycast={NO_RAYCAST}>
              <boxGeometry args={[fw, fh, 0.05]} />
              <meshStandardMaterial color="#f5efe2" roughness={0.5} />
            </mesh>
          ),
        )}
      </group>

      {/* Wall-mounted AC unit — top of the back wall, right side */}
      <group position={[1.6, 2.42, ROOM.backZ + 0.09]}>
        <mesh castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.95, 0.3, 0.18]} />
          <meshStandardMaterial color="#f4f6f8" roughness={0.55} metalness={0.05} />
        </mesh>
        {/* Vent louvre strip */}
        <mesh position={[0, -0.11, 0.07]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.82, 0.05, 0.06]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
      </group>

      {/* Generic sofa stays unchanged for every unprofiled home case. */}
      {!hasResp001Dressing && <group position={[-1.65, 0, ROOM.backZ + 0.55]}>
        {/* Seat base */}
        <mesh position={[0, 0.24, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.7, 0.34, 0.75]} />
          <meshStandardMaterial map={tex.sofa.map} normalMap={tex.sofa.normalMap} normalScale={[0.6, 0.6]} roughness={0.98} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, 0.6, -0.3]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.7, 0.55, 0.16]} />
          <meshStandardMaterial map={tex.sofa.map} normalMap={tex.sofa.normalMap} normalScale={[0.6, 0.6]} roughness={0.98} />
        </mesh>
        {/* Arms */}
        {[-0.82, 0.82].map((x) => (
          <mesh key={`arm-${x}`} position={[x, 0.42, 0]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.16, 0.46, 0.75]} />
            <meshStandardMaterial map={tex.sofa.map} normalMap={tex.sofa.normalMap} normalScale={[0.6, 0.6]} roughness={0.98} />
          </mesh>
        ))}
        {/* Seat cushions */}
        {[-0.42, 0.42].map((x) => (
          <mesh key={`cush-${x}`} position={[x, 0.44, 0.03]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.72, 0.14, 0.66]} />
            <meshStandardMaterial color="#6b7758" roughness={0.98} />
          </mesh>
        ))}
      </group>}

      {/* Kenney dining chair, scaled onto the seated pelvis plant. The
          previous box-pan + slab backrest read as a crate, not furniture. */}
      {showPatientSeat && !hasResp001Dressing && (
        <Suspense fallback={null}>
          <KenneyPatientChair kind={patientSeatKind ?? 'dining'} name="home-patient-chair" />
        </Suspense>
      )}

      {/* Generic table stays unchanged for every unprofiled home case. */}
      {!hasResp001Dressing && <group position={[-1.75, 0, 1.3]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 0.33, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.95, 0.05, 0.55]} />
          <meshStandardMaterial color="#5a3d25" roughness={0.35} metalness={0.05} />
        </mesh>
        {([[-0.42, -0.22], [0.42, -0.22], [-0.42, 0.22], [0.42, 0.22]] as const).map(([x, z]) => (
          <mesh key={`ct-leg-${x}-${z}`} position={[x, 0.16, z]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.05, 0.32, 0.05]} />
            <meshStandardMaterial color="#3f2a19" roughness={0.5} />
          </mesh>
        ))}
      </group>}

      {/* Floor lamp in the far corner — pole + emissive shade, own point light */}
      <group position={[2.78, 0, -1.8]}>
        <mesh position={[0, 0.02, 0]} raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.16, 0.18, 0.04, 16]} />
          <meshStandardMaterial color="#3f3a33" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.75, 0]} raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.016, 0.016, 1.5, 10]} />
          <meshStandardMaterial color="#4a453d" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 1.55, 0]} raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.16, 0.22, 0.28, 20, 1, true]} />
          <meshStandardMaterial color="#fff2d4" emissive="#ffe6ad" emissiveIntensity={1.3} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <pointLight position={[0, 1.5, 0]} intensity={2.4} distance={4} decay={2} color="#ffdca0" />
      </group>

      {(!hideOverhead || hasResp001Dressing) && (
        <mesh name={hasResp001Dressing ? 'resp001-villa-ceiling' : undefined} position={[0, ROOM.height - 0.05, roomCentreZ]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
          <planeGeometry args={[ROOM.halfW * 2, roomDepth]} />
          <meshStandardMaterial color="#f1e9da" roughness={0.9} />
        </mesh>
      )}

      {/* Light rig — window daylight does the soft wash (RectAreaLight) while
          a warm spot remains the single shadow caster; the floor lamp adds a
          practical pool and the AC gives a cool top-fill so the room reads
          like a villa interior instead of a clinic bay. */}
      <WindowAreaLight />
      {hasResp001Dressing
        ? <HomeDustMotes count={24} opacity={0.08} size={0.006} />
        : <HomeDustMotes />}
      <KeyLight color="#ffe0b8" intensity={5.6} position={[-1.45, 2.35, ROOM.backZ + 0.55]} shadowsEnabled={shadowsEnabled} />
      <pointLight position={[-1.45, 1.6, ROOM.backZ + 0.3]} intensity={2.6} distance={6} decay={2} color="#fff0d2" />
      <pointLight position={[1.6, 2.18, ROOM.backZ + 0.35]} intensity={1.15} distance={4.5} decay={2} color="#cfe0ff" />
      <pointLight position={[1.6, 1.8, HALL.backZ + 0.45]} intensity={1.1} distance={4} decay={2} color="#ffe5bf" />
      <pointLight position={[1.0, 1.0, 1.6]} intensity={0.85} distance={4.5} decay={2} color="#ffd9b0" />
      <hemisphereLight args={['#fff1dc', '#4a382c', 0.16]} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Public — mall/office space. Polished pale floor, glass storefront backdrop,
// columns, bright fluorescent ceiling.
// ---------------------------------------------------------------------------
function PublicScene({
  hideOverhead,
  shadowsEnabled,
  showPatientSeat,
}: {
  hideOverhead: boolean;
  shadowsEnabled: boolean;
  showPatientSeat: boolean;
}) {
  // A supine patient extends to roughly z=-1.15 at the head. Keep every
  // storefront element behind a generous examination clearance plane so the
  // centre mullion cannot pass through the skull from the arrival camera.
  const backdropZ = -2.7;
  // Enclosed office shell — the old build floated one dark-glass storefront
  // panel on an open floor, so the transparent canvas bled the dark HUD in
  // from every side and the public scene read as a void. A full back + side
  // wall envelope with a lit window grounds it as a real interior.
  const halfW = 3.6;
  const frontZ = 2.8;
  const height = 2.75;
  const wallColour = '#e8ecef';
  return (
    <group>
      {/* Polished stone floor — low roughness picks up the lights */}
      <mesh position={[0, -0.05, 0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[halfW * 2, frontZ - backdropZ]} />
        <meshStandardMaterial color="#cdd4da" roughness={0.38} metalness={0.08} />
      </mesh>

      {/* Back wall — office partition */}
      <mesh position={[0, height / 2 - 0.05, backdropZ]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[halfW * 2, height, 0.06]} />
        <meshStandardMaterial color={wallColour} roughness={0.9} />
      </mesh>
      {/* Side walls — enclose the interior so no dark HUD bleeds in */}
      {[-halfW, halfW].map((x) => (
        <mesh key={`public-side-wall-${x}`} position={[x, height / 2 - 0.05, (backdropZ + frontZ) / 2]} receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.06, height, frontZ - backdropZ]} />
          <meshStandardMaterial color={wallColour} roughness={0.9} />
        </mesh>
      ))}

      {/* Storefront window on the back wall — lit blue glass reads as a window
          onto the street, not a black void. Emissive so it stays bright even
          without direct light. */}
      <mesh position={[0, 1.05, backdropZ + 0.04]} raycast={NO_RAYCAST}>
        <boxGeometry args={[3.4, 1.7, 0.02]} />
        <meshStandardMaterial color="#7fb2d8" roughness={0.08} metalness={0.25} emissive="#2e5678" emissiveIntensity={0.55} />
      </mesh>
      {/* Window mullions */}
      {[-1.13, 0, 1.13].map((x) => (
        <mesh key={`public-mullion-${x}`} position={[x, 1.05, backdropZ + 0.05]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.05, 1.7, 0.05]} />
          <meshStandardMaterial color="#8fa1b1" roughness={0.35} metalness={0.7} />
        </mesh>
      ))}
      {/* Lit signage band above the window */}
      <mesh position={[0, 2.08, backdropZ + 0.04]} raycast={NO_RAYCAST}>
        <boxGeometry args={[3.4, 0.24, 0.03]} />
        <meshStandardMaterial color="#dbeafe" emissive="#cfe8ff" emissiveIntensity={0.8} roughness={0.3} />
      </mesh>

      {/* Columns framing the open sides */}
      {[-2.0, 2.0].map((x) => (
        <mesh key={`col-${x}`} position={[x, 1.1, 0.9]} castShadow raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.14, 0.14, 2.4, 16]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.35} metalness={0.2} />
        </mesh>
      ))}

      {/* Office task chair + ottoman — only when a patient actually sits. A
          dining chair made Business Bay read as a restaurant, and hanging
          shins contradicted "sitting with legs elevated". Keep the seat narrow
          so thighs, chest and pulse sites stay inspectable. */}
      {showPatientSeat && (
        <>
          <Suspense fallback={null}>
            <KenneyPatientChair kind="desk" name="public-patient-chair" />
          </Suspense>
          <group name="public-patient-ottoman" position={[0, 0, 1.02]}>
            {/* Top at ~0.24 m — matches the 0.26 m sole lift on pose_legs_elevated
                after the seated pelvis plant, so calves rest instead of hover. */}
            <mesh position={[0, 0.19, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
              <boxGeometry args={[0.62, 0.10, 0.42]} />
              <meshStandardMaterial color="#5b6574" roughness={0.9} />
            </mesh>
            {([-0.24, 0.24] as const).flatMap(x =>
              ([-0.14, 0.14] as const).map(z => (
                <mesh key={`public-ottoman-leg-${x}-${z}`} position={[x, 0.07, z]} castShadow raycast={NO_RAYCAST}>
                  <boxGeometry args={[0.04, 0.14, 0.04]} />
                  <meshStandardMaterial color="#d5dbe3" roughness={0.3} metalness={0.55} />
                </mesh>
              )),
            )}
          </group>
        </>
      )}

      {/* Always-on office furniture — a desk, a filing cabinet and a potted
          plant sit out of the treatment lane so the room reads as an office
          even when a supine patient lies on the floor and no seat is needed. */}
      <group name="public-office-desk" position={[1.45, 0, 0.15]}>
        <mesh position={[0, 0.74, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.15, 0.05, 0.68]} />
          <meshStandardMaterial color="#d7dbe2" roughness={0.42} metalness={0.08} />
        </mesh>
        {([-0.48, 0.48] as const).flatMap(x =>
          ([-0.26, 0.26] as const).map(z => (
            <mesh key={`public-desk-leg-${x}-${z}`} position={[x, 0.36, z]} castShadow raycast={NO_RAYCAST}>
              <boxGeometry args={[0.045, 0.72, 0.045]} />
              <meshStandardMaterial color="#9aa3ad" roughness={0.32} metalness={0.5} />
            </mesh>
          )),
        )}
        <mesh position={[-0.18, 0.80, -0.04]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.38, 0.018, 0.26]} />
          <meshStandardMaterial color="#1f2937" roughness={0.45} metalness={0.2} />
        </mesh>
        <mesh position={[-0.18, 0.95, -0.14]} rotation={[-0.18, 0, 0]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.36, 0.24, 0.012]} />
          <meshStandardMaterial color="#111827" roughness={0.35} emissive="#1e3a5f" emissiveIntensity={0.35} />
        </mesh>
      </group>

      {/* Filing cabinet — left of the lane, out of the patient's way */}
      <group name="public-filing-cabinet" position={[-1.6, 0, 0.9]}>
        <mesh position={[0, 0.55, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.48, 1.1, 0.6]} />
          <meshStandardMaterial color="#7b8794" roughness={0.5} metalness={0.35} />
        </mesh>
        {[0.28, 0.0, -0.28].map((y) => (
          <mesh key={`public-cabinet-drawer-${y}`} position={[0, 0.15 + 0.28 + y, 0.31]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.42, 0.05, 0.02]} />
            <meshStandardMaterial color="#4a5568" roughness={0.4} metalness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Potted plant — a soft silhouette to break the box, far right of lane */}
      <group name="public-office-plant" position={[1.9, 0, 1.4]}>
        <mesh position={[0, 0.16, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.16, 0.12, 0.32, 16]} />
          <meshStandardMaterial color="#b99b6b" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow raycast={NO_RAYCAST}>
          <sphereGeometry args={[0.34, 16, 12]} />
          <meshStandardMaterial color="#3f6d4a" roughness={0.95} />
        </mesh>
      </group>

      {!hideOverhead && (
        <>
          <mesh position={[0, 2.3, 0.1]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
            <planeGeometry args={[halfW * 2, frontZ - backdropZ]} />
            <meshStandardMaterial color="#dde3e9" roughness={0.8} />
          </mesh>
          {[-1.2, -0.4, 0.4, 1.2].map((x) => (
            <mesh key={`fluoro-${x}`} position={[x, 2.28, backdropZ + 0.85]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
              <boxGeometry args={[0.35, 1.6, 0.02]} />
              <meshStandardMaterial color="#f0f7ff" roughness={0.2} emissive="#e3f0ff" emissiveIntensity={0.9} />
            </mesh>
          ))}
        </>
      )}
      {/* Cool fluorescent lighting — flatter and brighter than the bay */}
      {/* Public/office scenes must enclose their space like every other
          variant. The old build only had a key + 3 point lights aimed at the
          floor/patient, so the storefront wall and any open backdrop fell to
          near-black and the transparent canvas bled the dark HUD through —
          reading as a void. Hemisphere + ambient ground the whole shell. */}
      <hemisphereLight args={['#e8f0f6', '#4a4a52', 0.55]} />
      <ambientLight intensity={0.5} color="#e6edf3" />
      <KeyLight color="#f2f7ff" intensity={7.5} position={[0, 2.6, 0.2]} shadowsEnabled={shadowsEnabled} angle={0.65} />
      <pointLight position={[-1.5, 2.0, 0.8]} intensity={2.2} distance={6} decay={2} color="#eaf4ff" />
      <pointLight position={[1.5, 2.0, 0.8]} intensity={2.2} distance={6} decay={2} color="#eaf4ff" />
      <pointLight position={[0, 1.2, 1.6]} intensity={0.9} distance={4.5} decay={2} color="#f5faff" />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Industrial — construction, warehouse, machinery and farm incidents. The
// central treatment lane remains clear while scaffold, materials and access
// control make this read as a worksite instead of a road collision.
// ---------------------------------------------------------------------------
function IndustrialScene({ shadowsEnabled }: { shadowsEnabled: boolean }) {
  return (
    <group>
      <OutdoorSky zenith="#9fc8e7" horizon="#e8dcc4" />
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial color="#777b7d" roughness={0.96} metalness={0.04} />
      </mesh>

      {/* Corrugated site wall and steel frame. */}
      <mesh position={[0, 1.15, -2.7]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[7.5, 2.4, 0.08]} />
        <meshStandardMaterial color="#6f7b82" roughness={0.62} metalness={0.55} />
      </mesh>
      {[-3.2, -2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4, 3.2].map(x => (
        <mesh key={`corrugation-${x}`} position={[x, 1.15, -2.64]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.035, 2.35, 0.045]} />
          <meshStandardMaterial color="#9aa3a8" roughness={0.5} metalness={0.68} />
        </mesh>
      ))}
      {[-2.65, 2.65].map(x => (
        <group key={`scaffold-${x}`} position={[x, 0, -0.55]}>
          {[-0.45, 0.45].map(z => (
            <mesh key={`upright-${z}`} position={[0, 1.35, z]} castShadow raycast={NO_RAYCAST}>
              <cylinderGeometry args={[0.035, 0.035, 2.7, 10]} />
              <meshStandardMaterial color="#c8ced2" roughness={0.36} metalness={0.78} />
            </mesh>
          ))}
          {[0.45, 1.35, 2.25].map(y => (
            <mesh key={`rail-${y}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
              <cylinderGeometry args={[0.028, 0.028, 0.9, 10]} />
              <meshStandardMaterial color="#c8ced2" roughness={0.36} metalness={0.78} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Hazard-striped exclusion line around the clear treatment lane. */}
      {[-1.9, 1.9].map(x => (
        <mesh key={`hazard-line-${x}`} position={[x, -0.042, 0.35]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
          <planeGeometry args={[0.12, 4.8]} />
          <meshStandardMaterial color="#f5c518" roughness={0.72} />
        </mesh>
      ))}

      {/* Palletised materials remain to the side, preserving anatomy access. */}
      <group position={[2.85, 0, 1.55]}>
        <mesh position={[0, 0.08, 0]} receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.35, 0.16, 0.9]} />
          <meshStandardMaterial color="#745035" roughness={0.88} />
        </mesh>
        {[-0.38, 0, 0.38].map(x => (
          <mesh key={`material-${x}`} position={[x, 0.48, 0]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.34, 0.7, 0.68]} />
            <meshStandardMaterial color="#b89361" roughness={0.9} />
          </mesh>
        ))}
      </group>
      <group position={[-2.85, 0, 1.45]}>
        <mesh position={[0, 0.85, 0]} castShadow raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.33, 0.33, 1.7, 18]} />
          <meshStandardMaterial color="#d8a51f" roughness={0.7} metalness={0.15} />
        </mesh>
        <mesh position={[0, 0.95, 0.31]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.36, 0.22, 0.025]} />
          <meshStandardMaterial color="#111827" emissive="#fbbf24" emissiveIntensity={0.45} roughness={0.5} />
        </mesh>
      </group>

      <hemisphereLight args={['#d9e5ed', '#4d4538', 0.48]} />
      <ambientLight intensity={0.52} color="#e8eef2" />
      <KeyLight color="#fff0cf" intensity={7.2} position={[2.8, 4.2, 2.2]} shadowsEnabled={shadowsEnabled} angle={0.58} />
      <pointLight position={[-2.6, 2.1, 1.6]} intensity={2.4} distance={7} decay={2} color="#ffd27a" />
      <pointLight position={[0, 1.7, 3.2]} intensity={3.2} distance={7} decay={2} color="#f1f5f9" />
    </group>
  );
}

const FIRE_SMOKE_COUNT = 72;
function FireSmoke() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(FIRE_SMOKE_COUNT * 3);
    for (let i = 0; i < FIRE_SMOKE_COUNT; i++) {
      const band = i % 12;
      values[i * 3] = -3 + band * 0.5 + Math.sin(i * 2.17) * 0.18;
      values[i * 3 + 1] = 0.25 + ((i * 0.31) % 2.6);
      values[i * 3 + 2] = -2.35 + Math.cos(i * 1.73) * 0.35;
    }
    return values;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const attribute = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const values = attribute.array as Float32Array;
    for (let i = 0; i < FIRE_SMOKE_COUNT; i++) {
      values[i * 3] += Math.sin(clock.elapsedTime * 0.18 + i) * 0.0008;
      values[i * 3 + 1] = 0.2 + ((positions[i * 3 + 1] + clock.elapsedTime * 0.035) % 2.75);
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={ref} raycast={NO_RAYCAST}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.slice(), 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.16} color="#4b5563" transparent opacity={0.25} depthWrite={false} />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Fire — smoke-stained structure with cordon, extinguishing equipment and
// animated residual smoke. There are no decorative open flames beside the
// patient: the scene represents the safe treatment zone after extraction.
// ---------------------------------------------------------------------------
function FireScene({ shadowsEnabled }: { shadowsEnabled: boolean }) {
  return (
    <group>
      <OutdoorSky zenith="#596979" horizon="#a78b78" />
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial color="#252728" roughness={0.97} />
      </mesh>
      <mesh position={[0, 1.2, -2.65]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[7.8, 2.5, 0.1]} />
        <meshStandardMaterial color="#383536" roughness={0.94} />
      </mesh>
      {[-2.8, -1.4, 0, 1.4, 2.8].map((x, index) => (
        <mesh key={`charred-stud-${x}`} position={[x, 1.25, -2.52]} rotation={[0, 0, index % 2 ? 0.035 : -0.025]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.16, 2.5, 0.16]} />
          <meshStandardMaterial color="#161617" roughness={0.99} />
        </mesh>
      ))}
      <mesh position={[0, 0.55, -2.46]} raycast={NO_RAYCAST}>
        <planeGeometry args={[5.8, 0.9]} />
        <meshStandardMaterial color="#151516" transparent opacity={0.55} roughness={1} />
      </mesh>

      {/* Fire service exclusion tape and extinguisher. */}
      {[-2.1, 2.1].map(x => (
        <group key={`cordon-${x}`} position={[x, 0, 1.7]}>
          <mesh position={[0, 0.62, 0]} raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.035, 0.045, 1.24, 10]} />
            <meshStandardMaterial color="#d6d8da" metalness={0.6} roughness={0.38} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.72, 1.7]} raycast={NO_RAYCAST}>
        <boxGeometry args={[4.2, 0.08, 0.025]} />
        <meshStandardMaterial color="#f5c518" emissive="#f59e0b" emissiveIntensity={0.18} roughness={0.62} />
      </mesh>
      <group position={[2.75, 0, 0.9]}>
        <mesh position={[0, 0.45, 0]} castShadow raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.16, 0.19, 0.8, 18]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.5} metalness={0.26} />
        </mesh>
        <mesh position={[0, 0.92, 0]} rotation={[0, 0, -0.3]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.28, 0.1, 0.08]} />
          <meshStandardMaterial color="#111827" metalness={0.55} roughness={0.4} />
        </mesh>
      </group>
      <FireSmoke />
      <hemisphereLight args={['#7f8fa6', '#2b211f', 0.32]} />
      <ambientLight intensity={0.42} color="#b8c3cf" />
      <KeyLight color="#f8dcc4" intensity={6.1} position={[2.4, 3.4, 2.0]} shadowsEnabled={shadowsEnabled} angle={0.62} />
      <pointLight position={[-2.4, 1.1, -1.7]} intensity={2.8} distance={6} decay={2} color="#ff6b35" />
      <pointLight position={[2.6, 1.5, 1.6]} intensity={1.5} distance={5} decay={2} color="#3b82f6" />
      <pointLight position={[0, 1.7, 3.1]} intensity={2.8} distance={7} decay={2} color="#f8fafc" />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Water rescue — wet treatment apron beside visible water, with rescue ring,
// throw line and drainage. The patient remains on dry ground after extraction.
// ---------------------------------------------------------------------------
function WaterScene({ shadowsEnabled }: { shadowsEnabled: boolean }) {
  return (
    <group>
      <OutdoorSky zenith="#7bc7e3" horizon="#d9f2ed" />
      <mesh position={[0, -0.05, 0.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[9, 8]} />
        <meshStandardMaterial color="#c8b48f" roughness={0.86} />
      </mesh>
      <mesh position={[0, -0.035, -2.45]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <planeGeometry args={[9, 2.4]} />
        <meshStandardMaterial color="#1886a7" emissive="#0e7490" emissiveIntensity={0.18} roughness={0.13} metalness={0.18} transparent opacity={0.9} />
      </mesh>
      {[-3, -1.5, 0, 1.5, 3].map((x, index) => (
        <mesh key={`water-ripple-${x}`} position={[x, -0.025, -2.15 - (index % 2) * 0.4]} rotation={[-Math.PI / 2, 0, 0.08]} raycast={NO_RAYCAST}>
          <planeGeometry args={[0.9, 0.035]} />
          <meshBasicMaterial color="#b9efff" transparent opacity={0.46} />
        </mesh>
      ))}
      <mesh position={[0, 0.01, -1.28]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[9, 0.14, 0.32]} />
        <meshStandardMaterial color="#e6e2da" roughness={0.74} />
      </mesh>

      <group position={[2.75, 0.62, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow raycast={NO_RAYCAST}>
          <torusGeometry args={[0.38, 0.1, 12, 28]} />
          <meshStandardMaterial color="#f97316" roughness={0.58} />
        </mesh>
        {[0, Math.PI / 2].map(rotation => (
          <mesh key={`ring-band-${rotation}`} rotation={[0, 0, rotation]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.2, 0.74, 0.12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.45} />
          </mesh>
        ))}
      </group>
      <mesh position={[-2.8, 0.02, 1.5]} rotation={[-Math.PI / 2, 0, -0.18]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[1.4, 0.75]} />
        <meshStandardMaterial color="#f3f4f6" roughness={0.98} />
      </mesh>
      <mesh position={[2.35, 0.01, 1.5]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <circleGeometry args={[0.72, 24]} />
        <meshStandardMaterial color="#698491" roughness={0.2} metalness={0.16} transparent opacity={0.42} />
      </mesh>

      <hemisphereLight args={['#caefff', '#735f42', 0.72]} />
      <ambientLight intensity={0.62} color="#dff7ff" />
      <KeyLight color="#fff6dd" intensity={7.8} position={[-2.7, 4.2, 2.4]} shadowsEnabled={shadowsEnabled} angle={0.55} />
      <pointLight position={[0, 0.8, -2.0]} intensity={1.4} distance={7} decay={2} color="#66d9ff" />
      <pointLight position={[0, 1.6, 3.2]} intensity={3.4} distance={7} decay={2} color="#e6f7ff" />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Heat/outdoor — desert or exposed sports/work scene, with shade canopy,
// hydration station and high-contrast sun. This avoids placing heat illness
// beside traffic wreckage merely because it happened outdoors.
// ---------------------------------------------------------------------------
function HeatScene({ shadowsEnabled, showPatientSeat }: { shadowsEnabled: boolean; showPatientSeat: boolean }) {
  return (
    <group>
      <OutdoorSky zenith="#78b9e4" horizon="#dbe8ea" />
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#cda66d" roughness={0.99} />
      </mesh>
      {[[-3.2, -2.6], [-2.5, 2.6], [2.9, -2.8], [3.4, 2.5]].map(([x, z], index) => (
        <mesh key={`desert-stone-${index}`} position={[x, 0.02, z]} rotation={[0, index * 0.8, 0]} castShadow raycast={NO_RAYCAST}>
          <dodecahedronGeometry args={[0.18 + (index % 2) * 0.08, 0]} />
          <meshStandardMaterial color="#9a744a" roughness={0.98} />
        </mesh>
      ))}

      {/* The case presentation says the worker is sitting in shade. Centre the
          canopy over the treatment lane, with four corner uprights outside
          the examination silhouette so no pole projects through the patient. */}
      {([[-2.8, -2], [2.8, -2], [-2.8, 2], [2.8, 2]] as const).map(([x, z]) => (
        <mesh key={`canopy-pole-${x}-${z}`} position={[x, 1.35, z]} castShadow raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.035, 0.045, 2.7, 10]} />
          <meshStandardMaterial color="#d7dde1" metalness={0.72} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 2.64, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[5.75, 0.045, 4.15]} />
        <meshStandardMaterial color="#e8dfc8" roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      {/* Kenney dining chair under the canopy — four legs and a backrest so
          the shade-station plant reads as a chair, not a field crate. */}
      {showPatientSeat && (
        <Suspense fallback={null}>
          <KenneyPatientChair kind="dining" name="heat-patient-chair" />
        </Suspense>
      )}
      {/* Cooler and bottled water on the crew side. */}
      <group position={[2.75, 0, 1.5]}>
        <mesh position={[0, 0.28, 0]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.8, 0.56, 0.52]} />
          <meshStandardMaterial color="#e5edf2" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.58, 0]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.84, 0.08, 0.56]} />
          <meshStandardMaterial color="#38a6c9" roughness={0.48} />
        </mesh>
        {[-0.22, 0, 0.22].map(x => (
          <mesh key={`water-bottle-${x}`} position={[x, 0.88, 0]} castShadow raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.045, 0.055, 0.46, 12]} />
            <meshStandardMaterial color="#bce9f4" transparent opacity={0.62} roughness={0.18} />
          </mesh>
        ))}
      </group>

      {/* A broad, front-biased field light keeps skin and assessment targets
          legible beneath the canopy. The warm hemisphere still carries the
          desert palette without turning clinical findings into silhouettes. */}
      <hemisphereLight args={['#d7edff', '#8b6336', 0.7]} />
      <ambientLight intensity={1.15} color="#fff1d6" />
      <KeyLight color="#fff0c4" intensity={8.4} position={[0, 3.1, 1.8]} shadowsEnabled={shadowsEnabled} angle={0.72} />
      <pointLight position={[-1.5, 2.0, 1.2]} intensity={3.2} distance={7} decay={2} color="#fff4dc" />
      <pointLight position={[1.5, 2.0, 1.2]} intensity={3.2} distance={7} decay={2} color="#fff4dc" />
      <pointLight position={[0, 1.2, 2.4]} intensity={2.2} distance={6} decay={2} color="#e8f4ff" />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Agricultural — farm/field with open sky, crops or irrigation, machinery,
// and dusty ground for pesticide/toxicology cases. This distinguishes from
// generic roadside by adding crop textures, farm equipment silhouettes, and
// an earthy palette that matches pesticide poisoning presentations.
// ---------------------------------------------------------------------------
function AgriculturalScene({ shadowsEnabled, showPatientSeat: _showPatientSeat }: { shadowsEnabled: boolean; showPatientSeat: boolean }) {
  return (
    <group>
      {/* Open sky day lighting for outdoor farm */}
      <OutdoorSky zenith="#8ac2d6" horizon="#e3f4eb" />
      
      {/* Dusty brown earth with scattered crop debris */}
      <mesh position={[0, -0.05, 0.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[8.5, 7.5]} />
        <meshStandardMaterial color="#9c7c48" roughness={0.92} />
      </mesh>
      
      {/* Row crops along the sides - tall green stalks to frame the treatment area */}
      {[[ -3.2, -2.5], [ 3.1, -2.5], [-3.2, 2.5], [ 3.1, 2.5]].map(([x, z], i) => (
        <group key={`crop-row-${i}`} position={[x, 0.01, z]} rotation={[Math.PI / 2, 0, 0]}>
          {[ -2.8, -2.2, -1.5, -0.8, 0.8, 1.5, 2.2, 2.8].map((cz, j) => (
            <mesh 
              key={`crops-${i}-${j}`} 
              position={[0, 0.05 + (j % 3) * 0.12, cz]} 
              castShadow 
              raycast={NO_RAYCAST}
            >
              <cylinderGeometry args={[0.04, 0.06, 1.2 + (j % 2) * 0.3, 8]} />
              <meshStandardMaterial color="#5a7e46" roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Farm machinery silhouette - pesticide sprayer on truck */}
      <group position={[2.2, 0.1, -1.8]}>
        <mesh position={[0, 0.65, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.6, 0.3, 1.2]} />
          <meshStandardMaterial color="#2a3d54" roughness={0.4} metalness={0.35} />
        </mesh>
      </group>

      {/* Safety signage - pesticide warning sign on post */}
      <group position={[-2.5, 1.85, -0.6]}>
        <mesh position={[0, 0.4, 0]} castShadow raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.06, 0.06, 3.5, 12]} />
          <meshStandardMaterial color="#8b7355" roughness={0.5} metalness={0.2} />
        </mesh>
      </group>

      {/* Hydration point - water tank on wheel */}
      <group position={[2.3, 0.15, 1.4]}>
        <mesh position={[0, 0.65, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.5, 0.5, 1.1, 20]} />
          <meshStandardMaterial color="#e8f4f8" roughness={0.3} metalness={0.2} />
        </mesh>
      </group>

      {/* Hemisphere light - warm desert daylight */}
      <hemisphereLight args={['#d4e2df', '#9c7a4f', 0.68]} />
      <ambientLight intensity={1.05} color="#fff3dc" />
      
      {/* Key spotlight - high sun angle, creating harsh shadows */}
      <KeyLight color="#fdf5e6" intensity={9.2} position={[0.8, 4.5, 2.8]} shadowsEnabled={shadowsEnabled} angle={0.4} />
      
      {/* Fill lights */}
      <pointLight position={[-1.8, 2.6, 0.6]} intensity={2.0} distance={7} decay={2} color="#e0f0ff" />
      <pointLight position={[1.8, 2.6, -0.4]} intensity={2.0} distance={7} decay={2} color="#e0f0ff" />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Roadside — open air. Asphalt with lane markings, kerb, traffic cones, the
// ambulance's headlights raking in from behind the scene. No walls/ceiling.
// ---------------------------------------------------------------------------
function VehiclePatientSeat() {
  const { scene } = useGLTF('/models/vehicle-patient-seat.glb');
  const seat = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse(object => {
      object.raycast = NO_RAYCAST;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    return clone;
  }, [scene]);
  return <primitive name="vehicle-patient-seat" object={seat} />;
}

/** License-clean Kenney CC0 GLB, cloned so each mount is independent. */
function PropGltf({
  url,
  name,
  position,
  rotation,
  scale = 1,
}: {
  url: string;
  name: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => {
    const next = scene.clone(true);
    next.traverse(object => {
      object.raycast = NO_RAYCAST;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    return next;
  }, [scene]);
  return <primitive name={name} object={clone} position={position} rotation={rotation} scale={scale} />;
}

function WreckedSedan() {
  return (
    <group name="wrecked-car" position={[3.6, 0, -1.7]} rotation={[0, -0.55, 0]}>
      <PropGltf url="/models/props/kenney-sedan.glb" name="kenney-sedan" scale={1.8} />
      <PropGltf
        url="/models/props/kenney-debris-bumper.glb"
        name="kenney-debris-bumper"
        position={[-1.7, 0.12, 0.35]}
        rotation={[0.4, 0.8, 0.2]}
        scale={1.4}
      />
      <PropGltf
        url="/models/props/kenney-debris-door.glb"
        name="kenney-debris-door"
        position={[-0.4, 0.08, 1.15]}
        rotation={[1.2, 0.3, 0.4]}
        scale={1.3}
      />
    </group>
  );
}

function RoadsideScene({ shadowsEnabled, showPatientSeat }: { shadowsEnabled: boolean; showPatientSeat: boolean }) {
  return (
    <group>
      <OutdoorSky zenith="#8cb6d4" horizon="#e8d3ba" />
      {showPatientSeat && <Suspense fallback={null}><VehiclePatientSeat /></Suspense>}
      {/* Asphalt */}
      <mesh position={[0, -0.05, 0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial color="#2c2e33" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Dashed lane markings */}
      {[-1.2, 0.4, 2.0].map((z) => (
        <mesh key={`lane-${z}`} position={[-2.4, -0.045, z]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
          <planeGeometry args={[0.14, 0.9]} />
          <meshStandardMaterial color="#cfd2d6" roughness={0.85} />
        </mesh>
      ))}
      {/* Kerb along the right edge */}
      <mesh position={[3.1, 0.02, 0.1]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.25, 0.14, 9]} />
        <meshStandardMaterial color="#6b7178" roughness={0.9} />
      </mesh>
      {/* Traffic cones securing the scene */}
      {([[-1.7, 1.6], [1.9, -1.3]] as const).map(([x, z]) => (
        <group key={`cone-${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.01, 0]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.3, 0.03, 0.3]} />
            <meshStandardMaterial color="#e05a1e" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.24, 0]} castShadow raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.03, 0.12, 0.44, 12]} />
            <meshStandardMaterial color="#f2662a" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.28, 0]} raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.065, 0.085, 0.1, 12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        </group>
      ))}
      {/* Ambulance headlights behind the scene — two emissive discs */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={`headlight-${x}`} position={[x, 0.75, 3.4]} rotation={[0, Math.PI, 0]} raycast={NO_RAYCAST}>
          <circleGeometry args={[0.13, 20]} />
          <meshStandardMaterial color="#fffbe8" emissive="#fff6d0" emissiveIntensity={2.2} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Kenney CC0 sedan + debris — reads as a vehicle, not a grey box. */}
      <Suspense fallback={null}>
        <WreckedSedan />
      </Suspense>

      {/* Downed motorcycle — lying on its side, left of the patient */}
      <group name="downed-motorcycle" position={[-3.6, 0, 1.6]} rotation={[0, 1.1, Math.PI / 2 - 0.1]}>
        {/* Frame */}
        <mesh position={[0, 0.15, 0]} castShadow raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.06, 0.06, 1.8, 10]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Seat */}
        <mesh position={[0.5, 0.22, 0]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.6, 0.12, 0.22]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
        </mesh>
        {/* Wheels */}
        {[-0.7, 0.7].map(wx => (
          <mesh key={`moto-wheel-${wx}`} position={[wx, 0.15, 0]} castShadow raycast={NO_RAYCAST} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.06, 8, 20]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
          </mesh>
        ))}
        {/* Handlebar */}
        <mesh position={[-0.75, 0.35, 0]} castShadow raycast={NO_RAYCAST} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Debris scattered across the road — small low-poly shards */}
      {[
        [-0.4, 0.01, -0.8], [0.3, 0.01, -1.4], [0.8, 0.01, 0.6],
        [-0.9, 0.01, 1.2], [1.2, 0.01, -1.6], [0.1, 0.01, 1.8],
      ].map(([dx, dy, dz], i) => (
        <mesh
          key={`debris-${i}`}
          position={[dx, dy, dz]}
          rotation={[i * 0.73, i * 1.17, i * 0.41]}
          castShadow
          raycast={NO_RAYCAST}
        >
          <boxGeometry args={[0.12 + (i % 3) * 0.035, 0.02, 0.08 + (i % 2) * 0.04]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.8} metalness={0.3} />
        </mesh>
      ))}

      {/* Broken glass shards — translucent sparkles near the car */}
      {[
        [1.2, 0.0, -0.6], [1.5, 0.0, -0.9], [2.1, 0.0, -0.4], [1.0, 0.0, -1.1],
      ].map(([gx, gy, gz], i) => (
        <mesh
          key={`glass-${i}`}
          position={[gx, gy + 0.005, gz]}
          rotation={[-Math.PI / 2, 0, i * 0.83]}
          raycast={NO_RAYCAST}
        >
          <planeGeometry args={[0.1 + (i % 3) * 0.025, 0.1 + (i % 2) * 0.035]} />
          <meshStandardMaterial
            color="#a8c0d8"
            transparent
            opacity={0.5}
            roughness={0.05}
            metalness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Fuel spill — dark glossy patch under the car */}
      <mesh position={[1.6, -0.045, -0.3]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <circleGeometry args={[1.1, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.08} metalness={0.6} transparent opacity={0.7} />
      </mesh>

      {/* Daylight: blue sky ambient + sun key. The headlights add warm rake. */}
      <hemisphereLight args={['#bcd7ff', '#3a3d42', 0.75]} />
      <KeyLight color="#fff4de" intensity={7} position={[2.2, 3.2, 1.6]} shadowsEnabled={shadowsEnabled} angle={0.5} />
      <pointLight position={[0, 0.8, 3.2]} intensity={3} distance={7} decay={2} color="#fff2cc" />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Variant switch. 'clinic' is handled by index.tsx.
// ---------------------------------------------------------------------------
export function SceneVariantEnvironment({
  variant,
  hideOverhead,
  shadowsEnabled,
  showPatientSeat,
  patientSeatKind,
  sceneProfile,
}: {
  variant: Exclude<EnvironmentVariant, 'clinic'>;
  hideOverhead: boolean;
  shadowsEnabled: boolean;
  showPatientSeat: boolean;
  patientSeatKind?: PatientSeatKind;
  sceneProfile?: SceneProfile;
}) {
  if (variant === 'home') return <HomeScene hideOverhead={hideOverhead} shadowsEnabled={shadowsEnabled} showPatientSeat={showPatientSeat} patientSeatKind={patientSeatKind} sceneProfile={sceneProfile} />;
  if (variant === 'public') return <PublicScene hideOverhead={hideOverhead} shadowsEnabled={shadowsEnabled} showPatientSeat={showPatientSeat} />;
  if (variant === 'industrial') return <IndustrialScene shadowsEnabled={shadowsEnabled} />;
  if (variant === 'fire') return <FireScene shadowsEnabled={shadowsEnabled} />;
  if (variant === 'water') return <WaterScene shadowsEnabled={shadowsEnabled} />;
  if (variant === 'heat') return <HeatScene shadowsEnabled={shadowsEnabled} showPatientSeat={showPatientSeat} />;
  if (variant === 'agricultural') return <AgriculturalScene shadowsEnabled={shadowsEnabled} showPatientSeat={showPatientSeat} />;
  return <RoadsideScene shadowsEnabled={shadowsEnabled} showPatientSeat={showPatientSeat} />;
}

useGLTF.preload('/models/props/kenney-sedan.glb');
useGLTF.preload('/models/props/kenney-debris-bumper.glb');
useGLTF.preload('/models/props/kenney-debris-door.glb');
useGLTF.preload('/models/vehicle-patient-seat.glb');
