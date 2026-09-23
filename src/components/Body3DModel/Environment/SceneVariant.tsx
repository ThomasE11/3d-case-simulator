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
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import type { EnvironmentVariant } from '@/lib/sceneEnvironment';
import type { PatientSeatKind } from '@/lib/patientStaging';
import { RESP001_VILLA_ENTRY, RESP001_VILLA_EXTERIOR, RESP001_VILLA_SHELL } from '@/lib/cameraOrbitSafety';
import { getVillaTextures } from './textures';
import { KenneyPatientChair } from './KenneyPatientChair';
import {
  AirConditioner,
  AedCabinet,
  BeachTowel,
  CeilingFan,
  CoffeeTable,
  CrashScatter,
  Curtain,
  DustMotes,
  FireEmbers,
  FruitBowl,
  HardHat,
  HazardDrum,
  HeatShimmer,
  LivedInSofa,
  LivingTelevision,
  MedicationClutter,
  PesticideTank,
  PhotoFrame,
  PottedPlant,
  PrayerMat,
  ProduceCrate,
  PublicStreetFurniture,
  RescueTube,
  ServiceCounter,
  SkidMarks,
  Slippers,
  SteamVent,
  StreetLamp,
  SunHat,
  ToolCrate,
  TrafficBarrier,
  WalkingStick,
  WallArtCluster,
  WallClock,
  WaterBottleCluster,
  WorkLight,
} from './SceneLivingProps';
import { Resp001VillaDressing } from './Resp001VillaDressing';
import {
  isResp001VillaProfile,
  isY2007OdBedroomProfile,
  isTrauma008RoadsideProfile,
  isBathroomFallProfile,
  type SceneProfile,
} from './sceneProfile';
import { ArchetypeSceneDressing } from './ArchetypeSceneDressing';
import { SCENE_ARCHETYPES } from './sceneRegistry';
import type { SceneAnchorSet } from '@/lib/sceneAnchors';
import { getBystanderEnvelope, layoutBystanders, type BystanderPosture } from '@/lib/bystanderLayout';
import { parseBystanders } from '@/lib/bystanderCount';

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
/**
 * Professional clinical key — tight pool on the patient, soft penumbra,
 * slightly cool white (5600K-ish) so skin and blood read honestly. Practical
 * lamps stay warm so rooms feel lived-in, not like an operating-theatre flood.
 */
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
  const cloudRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!cloudRef.current) return;
    cloudRef.current.rotation.y = clock.elapsedTime * 0.01;
  });

  return (
    <group>
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
      {/* Sun disc — a hard light source the eye can find, like a game skybox. */}
      <mesh position={[6.5, 7.2, -4.0]} renderOrder={-999} raycast={NO_RAYCAST}>
        <sphereGeometry args={[0.55, 16, 12]} />
        <meshBasicMaterial color="#fff4c8" toneMapped={false} />
      </mesh>
      <mesh position={[6.5, 7.2, -4.0]} renderOrder={-998} raycast={NO_RAYCAST}>
        <sphereGeometry args={[1.1, 16, 12]} />
        <meshBasicMaterial color="#ffe9a0" transparent opacity={0.22} toneMapped={false} depthWrite={false} />
      </mesh>
      {/* Slow-drifting cloud bank near the horizon. */}
      <group ref={cloudRef}>
        {([[-4.5, 3.2, -9], [2.5, 3.8, -10], [7.5, 2.9, -8.5], [-8, 3.5, -7.5], [0.5, 4.4, -11]] as const).map(([x, y, z], i) => (
          <mesh key={`cloud-${i}`} position={[x, y, z]} scale={[1.6 + (i % 3) * 0.4, 0.35, 0.8]} raycast={NO_RAYCAST}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshBasicMaterial color="#f4f7fa" transparent opacity={0.55} toneMapped={false} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
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

/**
 * The case-profiled exterior arrival threshold.
 *
 * The front facade is deliberately procedural project-authored geometry (no
 * hidden third-party download): it stays light enough for the adaptive iPad
 * tier and remains reproducible alongside the authored dressing GLB. Nothing
 * occupies the protected centre lane; it is an architectural beat for the
 * entry dolly, not another clinical interaction surface.
 */
function Resp001VillaArrivalExterior() {
  const entryHalfWidth = RESP001_VILLA_ENTRY.openingWidth / 2;
  const approachDepth = RESP001_VILLA_EXTERIOR.approachEndZ - RESP001_VILLA_SHELL.frontZ;
  const approachCentreZ = (RESP001_VILLA_EXTERIOR.approachEndZ + RESP001_VILLA_SHELL.frontZ) / 2;
  const doorWidth = RESP001_VILLA_ENTRY.openingWidth - 0.11;
  const doorHeight = RESP001_VILLA_ENTRY.openingHeight - 0.12;

  return (
    <group name="resp001-villa-arrival-exterior">
      {/* A broad paved path carries the camera from the gate-side landing to
          the threshold. Its centre stays clear for the approach animation. */}
      <mesh name="resp001-villa-approach-paving" position={[0, -0.055, approachCentreZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[RESP001_VILLA_EXTERIOR.approachWidth, approachDepth]} />
        <meshStandardMaterial color="#b8aa94" roughness={0.88} metalness={0.02} />
      </mesh>
      {/* Offset expansion joints give the paving scale without another texture
          fetch or high-frequency geometry. */}
      {[-0.32, 0.32].map(x => (
        <mesh key={`resp001-villa-paving-joint-${x}`} position={[x, -0.051, approachCentreZ]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
          <planeGeometry args={[0.018, approachDepth - 0.08]} />
          <meshBasicMaterial color="#91836f" transparent opacity={0.48} toneMapped={false} />
        </mesh>
      ))}
      {[RESP001_VILLA_SHELL.frontZ + 1.2, RESP001_VILLA_SHELL.frontZ + 1.92].map(z => (
        <mesh key={`resp001-villa-paving-cross-joint-${z}`} position={[0, -0.051, z]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
          <planeGeometry args={[RESP001_VILLA_EXTERIOR.approachWidth - 0.08, 0.018]} />
          <meshBasicMaterial color="#91836f" transparent opacity={0.48} toneMapped={false} />
        </mesh>
      ))}

      {/* Exterior eave and entry surround make the otherwise thin room shell
          read as a real villa facade from the first camera frame. */}
      <mesh name="resp001-villa-exterior-eave" position={[0, RESP001_VILLA_SHELL.ceilingY + 0.12, RESP001_VILLA_SHELL.frontZ + RESP001_VILLA_EXTERIOR.facadeDepth / 2]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[RESP001_VILLA_SHELL.halfWidth * 2 + 0.22, 0.16, RESP001_VILLA_EXTERIOR.facadeDepth]} />
        <meshStandardMaterial color="#584c43" roughness={0.72} />
      </mesh>
      {[-(entryHalfWidth + 0.38), entryHalfWidth + 0.38].map(x => (
        <mesh key={`resp001-villa-facade-pilaster-${x}`} name={`resp001-villa-facade-pilaster-${x < 0 ? 'left' : 'right'}`} position={[x, RESP001_VILLA_ENTRY.openingHeight / 2, RESP001_VILLA_SHELL.frontZ + 0.08]} receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.18, RESP001_VILLA_ENTRY.openingHeight + 0.08, 0.22]} />
          <meshStandardMaterial color="#d6c6af" roughness={0.76} />
        </mesh>
      ))}
      {[-1.22, 1.22].map(x => (
        <group key={`resp001-villa-entry-sconce-${x}`} position={[x, 1.65, RESP001_VILLA_SHELL.frontZ + 0.14]}>
          <mesh raycast={NO_RAYCAST}>
            <boxGeometry args={[0.14, 0.22, 0.08]} />
            <meshStandardMaterial color="#3d362f" roughness={0.42} metalness={0.45} />
          </mesh>
          <mesh position={[0, -0.02, 0.05]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.07, 0.11, 0.025]} />
            <meshStandardMaterial color="#fff0c6" emissive="#ffdda0" emissiveIntensity={1.25} roughness={0.42} />
          </mesh>
        </group>
      ))}

      {/* Door hangs open into the left interior wall. The clear central lane
          means the camera can pass the threshold without clipping it. */}
      <group name="resp001-villa-open-entry-door" position={[-entryHalfWidth + 0.045, doorHeight / 2, RESP001_VILLA_SHELL.frontZ - 0.075]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[doorWidth / 2, 0, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[doorWidth, doorHeight, 0.055]} />
          <meshStandardMaterial color="#755239" roughness={0.58} metalness={0.04} />
        </mesh>
        {[-0.28, 0.28].map(y => (
          <mesh key={`resp001-villa-door-panel-${y}`} position={[doorWidth * 0.52, y, 0.033]} raycast={NO_RAYCAST}>
            <boxGeometry args={[doorWidth * 0.68, 0.42, 0.025]} />
            <meshStandardMaterial color="#8a6346" roughness={0.62} />
          </mesh>
        ))}
        <mesh name="resp001-villa-door-handle" position={[doorWidth * 0.84, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.028, 0.028, 0.16, 12]} />
          <meshStandardMaterial color="#c9a86a" roughness={0.26} metalness={0.72} />
        </mesh>
      </group>

      {/* Two restrained courtyard planters sit beyond the protected approach
          lane. Fronds are primitive low-poly silhouettes, intentionally below
          the patient-facing view and free of click raycasts. */}
      {([-RESP001_VILLA_EXTERIOR.planterX, RESP001_VILLA_EXTERIOR.planterX] as const).map(x => (
        <group key={`resp001-villa-courtyard-planter-${x}`} position={[x, 0, RESP001_VILLA_SHELL.frontZ + 1.22]}>
          <mesh position={[0, 0.18, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.25, 0.19, 0.36, 14]} />
            <meshStandardMaterial color="#8b5a3d" roughness={0.86} />
          </mesh>
          <mesh position={[0, 0.6, 0]} raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.04, 0.055, 0.56, 10]} />
            <meshStandardMaterial color="#69553d" roughness={0.88} />
          </mesh>
          {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map(rotation => (
            <mesh key={`resp001-villa-courtyard-frond-${rotation}`} position={[Math.cos(rotation) * 0.13, 0.82, Math.sin(rotation) * 0.13]} rotation={[0.5, 0, -rotation]} raycast={NO_RAYCAST}>
              <coneGeometry args={[0.14, 0.62, 5]} />
              <meshStandardMaterial color="#345d3b" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Warm UAE daylight entering through the villa window. A RectAreaLight gives
 *  the broad, soft window wash; the existing spot remains the single shadow
 *  caster so the patient still gets a readable key shadow on the floor. */
function WindowAreaLight({
  backZ = ROOM.backZ,
  lookAtTarget = [0, 0.9, 0],
}: {
  backZ?: number;
  lookAtTarget?: readonly [number, number, number];
}) {
  const ref = useRef<THREE.RectAreaLight>(null);
  useEffect(() => {
    ensureRectAreaLightUniforms();
    // RectAreaLight is a Light, so lookAt points its emitting face (-Z) at
    // the patient rather than out through the glass.
    ref.current?.lookAt(lookAtTarget[0], lookAtTarget[1], lookAtTarget[2]);
  }, [lookAtTarget]);
  return (
    <rectAreaLight
      ref={ref}
      args={['#ffd7a6', 4.2, 1.9, 1.25]}
      position={[-1.45, 1.58, backZ + 0.1]}
    />
  );
}

// Dust motes drifting through the window beam. Kept separate from the bay
// motes so the villa beam reads as daylight, not surgical-light dust.
const HOME_DUST_HEIGHT = 1.9;
function HomeDustMotes({
  count = 90,
  opacity = 0.26,
  size = 0.012,
  backZ = ROOM.backZ,
}: {
  count?: number;
  opacity?: number;
  size?: number;
  backZ?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const base = new Float32Array(count * 3);
    const seed = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      base[i * 3] = -1.45 + (Math.random() - 0.5) * 1.5;
      base[i * 3 + 1] = 0.25 + Math.random() * HOME_DUST_HEIGHT;
      base[i * 3 + 2] = backZ + 0.35 + Math.random() * 1.8;
      seed[i * 2] = Math.random() * Math.PI * 2;
      seed[i * 2 + 1] = 0.01 + Math.random() * 0.03;
    }
    return { base, seed, positions: base.slice() };
  }, [backZ, count]);

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

/**
 * Ceiling cornice — a room with no cornice reads as a stage set. The old
 * ceiling was one flat plane at the wall head, so the wall-ceiling junction
 * was a hairline with nothing to catch the light and no shadow for the
 * orbit camera to read as depth. A cornice is a small extrusion that:
 *   - gives the top of every wall a soft occlusion line (the ambient term
 *     darkens the cove, which is what makes a ceiling read as a ceiling),
 *   - throws a narrow shadow band onto the plaster below it from the key
 *     light, so the room has a crown instead of a lid,
 *   - is a real mesh the camera can slide behind, which is what makes the
 *     villa orbit feel enclosed rather than open-topped.
 *
 * It runs the full perimeter as four boxes (no mitre math), each 0.06 deep
 * and 0.09 tall, sitting just under the slab. The villa variant carries the
 * plaster texture so the cornice matches the wall; the generic home ceiling
 * keeps its warm off-white.
 */
function CeilingCornice({
  x,
  y,
  z,
  width,
  depth,
  hasResp001Dressing,
  tex,
}: {
  x: number;
  y: number;
  z: number;
  width: number;
  depth: number;
  hasResp001Dressing: boolean;
  tex: ReturnType<typeof getVillaTextures> | null;
}) {
  const halfW = width / 2;
  const halfD = depth / 2;
  const corniceH = 0.09;
  const corniceD = 0.06;
  const innerW = width - 2 * corniceD;
  const innerD = depth - 2 * corniceD;
  const CorniceMaterial = () => hasResp001Dressing && tex ? (
    <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.5, 0.5]} roughness={0.9} />
  ) : (
    <meshStandardMaterial color="#f1e9da" roughness={0.9} />
  );
  const segs: Array<{ key: string; position: [number, number, number]; args: [number, number, number] }> = [
    { key: 'front', position: [x, y - corniceH / 2, z + halfD - corniceD / 2], args: [width, corniceH, corniceD] },
    { key: 'back', position: [x, y - corniceH / 2, z - halfD + corniceD / 2], args: [width, corniceH, corniceD] },
    { key: 'left', position: [x - halfW + corniceD / 2, y - corniceH / 2, z], args: [corniceD, corniceH, innerD] },
    { key: 'right', position: [x + halfW - corniceD / 2, y - corniceH / 2, z], args: [corniceD, corniceH, innerD] },
  ];
  return (
    <group name="ceiling-cornice">
      {segs.map(s => (
        <mesh key={s.key} position={s.position} raycast={NO_RAYCAST}>
          <boxGeometry args={s.args} />
          <CorniceMaterial />
        </mesh>
      ))}
      {/* The slab itself, dropped just below the cornice so the cove reads as a
          recess rather than the cornice floating in front of a lit plane.
          Rotated to lie in the XZ plane like the ceiling it replaces — a
          default plane faces +Z, so without this the slab stood on edge and
          the room had a vertical fin for a lid.
          Geometry: the wall boxes are centred at roomHeight/2-0.05, so every
          wall top lands at roomHeight-0.05. The cornice band spans
          [roomHeight-0.14, roomHeight-0.05] (its segments are centred at
          y-corniceH/2), i.e. flush with the wall top and BELOW it. So a slab
          anywhere inside or under the band left the air above the wall head
          uncapped and every room rendered as a black-void open-topped box —
          the audit caught it from a corner wide shot. The slab has to clear
          the wall top: at y+0.02 it sits 20 mm above the wall head, caps the
          room, and the band hangs 40 mm below it as the cove shadow that makes
          the ceiling read as a ceiling. */}
      <mesh position={[x, y + 0.02, z]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <planeGeometry args={[innerW, innerD]} />
        <CorniceMaterial />
      </mesh>
    </group>
  );
}

function HomeScene({
  variant,
  hideOverhead,
  shadowsEnabled,
  showPatientSeat,
  patientSeatKind,
  sceneProfile,
  onAnchorsReady,
}: {
  variant: EnvironmentVariant;
  hideOverhead: boolean;
  shadowsEnabled: boolean;
  showPatientSeat: boolean;
  patientSeatKind?: PatientSeatKind;
  sceneProfile?: SceneProfile;
  onAnchorsReady?: (anchors: SceneAnchorSet) => void;
}) {
  const tex = getVillaTextures();
  const hasResp001Dressing = isResp001VillaProfile(sceneProfile);
  const archetype =
    (isY2007OdBedroomProfile(sceneProfile) || isBathroomFallProfile(sceneProfile))
      ? SCENE_ARCHETYPES.find(e => e.profile === sceneProfile)
      : undefined;
  const hideGenericHomeFurniture = hasResp001Dressing || Boolean(archetype);
  const roomHalfW = hasResp001Dressing ? RESP001_VILLA_SHELL.halfWidth : ROOM.halfW;
  const roomBackZ = hasResp001Dressing ? RESP001_VILLA_SHELL.backZ : ROOM.backZ;
  const roomFrontZ = hasResp001Dressing ? RESP001_VILLA_SHELL.frontZ : ROOM.frontZ;
  const roomHeight = hasResp001Dressing ? RESP001_VILLA_SHELL.ceilingY : ROOM.height;
  // The original shared shell is intentionally centred at z=0. Preserve it
  // exactly for other cases; only the pilot gets the extended physical room
  // that encloses the rev7 sofa / kit table / first-aid cabinet.
  const roomDepth = roomFrontZ - roomBackZ;
  const roomCentreZ = hasResp001Dressing ? (roomBackZ + roomFrontZ) / 2 : 0;
  const entryHalfWidth = RESP001_VILLA_ENTRY.openingWidth / 2;
  const frontWallHeight = roomHeight;
  const windowLookAt = hasResp001Dressing
    ? ([RESP001_VILLA_SHELL.overviewTarget.x, 0.9, RESP001_VILLA_SHELL.overviewTarget.z] as const)
    : ([0, 0.9, 0] as const);
  return (
    <group>
      <BystanderCrowd variant={variant} bystanders={null} />
      {/* Oak floor */}
      <mesh name={hasResp001Dressing ? 'resp001-villa-floor' : undefined} position={[0, -0.05, roomCentreZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[roomHalfW * 2, roomDepth]} />
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
          <Resp001VillaDressing
            shadowsEnabled={shadowsEnabled}
            showPatientSeat={showPatientSeat}
            onAnchorsReady={onAnchorsReady}
          />
        </Suspense>
      ) : archetype ? (
        <Suspense fallback={null}>
          <ArchetypeSceneDressing entry={archetype} shadowsEnabled={shadowsEnabled} />
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
        [(-roomHalfW + HALL.leftX) / 2, HALL.leftX + roomHalfW],
        [(HALL.rightX + roomHalfW) / 2, roomHalfW - HALL.rightX],
      ] as const).map(([x, width]) => (
        <mesh key={`back-wall-${x}`} position={[x, roomHeight / 2 - 0.05, roomBackZ]} receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[width, roomHeight, 0.06]} />
          <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.5, 0.5]} roughness={0.92} />
        </mesh>
      ))}
      <mesh
        position={[(HALL.leftX + HALL.rightX) / 2, HALL.openingHeight + (roomHeight - HALL.openingHeight) / 2 - 0.05, roomBackZ]}
        receiveShadow
        raycast={NO_RAYCAST}
      >
        <boxGeometry args={[HALL.rightX - HALL.leftX, roomHeight - HALL.openingHeight, 0.06]} />
        <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.5, 0.5]} roughness={0.92} />
      </mesh>
      {/* Side walls */}
      {[-roomHalfW, roomHalfW].map((x) => (
        <mesh key={`wall-${x}`} name={hasResp001Dressing ? `resp001-villa-side-wall-${x < 0 ? 'left' : 'right'}` : undefined} position={[x, roomHeight / 2 - 0.05, roomCentreZ]} receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.06, roomHeight, roomDepth]} />
          <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.5, 0.5]} roughness={0.92} />
        </mesh>
      ))}

      {hasResp001Dressing && (
        <group name="resp001-villa-front-envelope">
          {/* The camera arrives through this genuine opening. The old full-width
              front plane made a sealed box, with the arrival origin stranded
              in an unexplained void beyond it. */}
          {([
            [-(roomHalfW + entryHalfWidth) / 2, roomHalfW - entryHalfWidth],
            [(roomHalfW + entryHalfWidth) / 2, roomHalfW - entryHalfWidth],
          ] as const).map(([x, width], index) => (
            <mesh
              key={`resp001-villa-front-wall-${index}`}
              name={index === 0 ? 'resp001-villa-front-wall' : undefined}
              position={[x, frontWallHeight / 2 - 0.05, roomFrontZ]}
              receiveShadow
              raycast={NO_RAYCAST}
            >
              <boxGeometry args={[width, frontWallHeight, RESP001_VILLA_SHELL.wallDepth]} />
              <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.5, 0.5]} roughness={0.92} />
            </mesh>
          ))}
          <mesh name="resp001-villa-entry-lintel" position={[RESP001_VILLA_ENTRY.x, RESP001_VILLA_ENTRY.openingHeight + (frontWallHeight - RESP001_VILLA_ENTRY.openingHeight) / 2 - 0.05, roomFrontZ]} receiveShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[RESP001_VILLA_ENTRY.openingWidth, frontWallHeight - RESP001_VILLA_ENTRY.openingHeight, RESP001_VILLA_SHELL.wallDepth]} />
            <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.5, 0.5]} roughness={0.92} />
          </mesh>
          {[-entryHalfWidth, entryHalfWidth].map((x) => (
            <mesh key={`resp001-villa-entry-jamb-${x}`} name={`resp001-villa-entry-jamb-${x < 0 ? 'left' : 'right'}`} position={[x, RESP001_VILLA_ENTRY.openingHeight / 2, roomFrontZ - 0.01]} raycast={NO_RAYCAST}>
              <boxGeometry args={[0.1, RESP001_VILLA_ENTRY.openingHeight, 0.12]} />
              <meshStandardMaterial color="#eee1cf" roughness={0.66} />
            </mesh>
          ))}
          <mesh name="resp001-villa-entry-head" position={[RESP001_VILLA_ENTRY.x, RESP001_VILLA_ENTRY.openingHeight, roomFrontZ - 0.01]} raycast={NO_RAYCAST}>
            <boxGeometry args={[RESP001_VILLA_ENTRY.openingWidth + 0.18, 0.1, 0.12]} />
            <meshStandardMaterial color="#eee1cf" roughness={0.66} />
          </mesh>
          {([
            [-(roomHalfW + entryHalfWidth) / 2, roomHalfW - entryHalfWidth],
            [(roomHalfW + entryHalfWidth) / 2, roomHalfW - entryHalfWidth],
          ] as const).map(([x, width], index) => (
            <mesh key={`resp001-villa-front-skirting-${index}`} position={[x, 0.05, roomFrontZ - 0.04]} raycast={NO_RAYCAST}>
              <boxGeometry args={[width, 0.14, 0.02]} />
              <meshStandardMaterial color="#e8ddc8" roughness={0.7} />
            </mesh>
          ))}
          {/* A shallow, lit landing supplies physical depth during the entrance
              dolly without widening the student orbit or adding an exterior
              scene that would compete with the patient's presentation. */}
          <mesh name="resp001-villa-entry-landing" position={[RESP001_VILLA_ENTRY.x, -0.06, roomFrontZ + RESP001_VILLA_ENTRY.landingDepth / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
            <planeGeometry args={[RESP001_VILLA_ENTRY.openingWidth + 0.86, RESP001_VILLA_ENTRY.landingDepth]} />
            <meshStandardMaterial color="#b4a997" roughness={0.84} />
          </mesh>
          <mesh name="resp001-villa-entry-canopy" position={[RESP001_VILLA_ENTRY.x, RESP001_VILLA_ENTRY.openingHeight + 0.16, roomFrontZ + RESP001_VILLA_ENTRY.landingDepth / 2]} receiveShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[RESP001_VILLA_ENTRY.openingWidth + 0.35, 0.12, RESP001_VILLA_ENTRY.landingDepth]} />
            <meshStandardMaterial color="#61564d" roughness={0.72} />
          </mesh>
          <Resp001VillaArrivalExterior />
        </group>
      )}

      {/* Skirting boards — broken around the doorway rather than bridging it. */}
      {([
        [(-roomHalfW + HALL.leftX) / 2, HALL.leftX + roomHalfW],
        [(HALL.rightX + roomHalfW) / 2, roomHalfW - HALL.rightX],
      ] as const).map(([x, width]) => (
        <mesh key={`back-skirt-${x}`} position={[x, 0.05, roomBackZ + 0.04]} raycast={NO_RAYCAST}>
          <boxGeometry args={[width, 0.14, 0.02]} />
          <meshStandardMaterial color="#e8ddc8" roughness={0.7} />
        </mesh>
      ))}
      {[-roomHalfW + 0.04, roomHalfW - 0.04].map((x) => (
        <mesh key={`skirt-${x}`} position={[x, 0.05, roomCentreZ]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.02, 0.14, roomDepth]} />
          <meshStandardMaterial color="#e8ddc8" roughness={0.7} />
        </mesh>
      ))}

      {/* Adjoining hallway: continued timber floor, side walls and a distant
          interior door create real depth instead of a flat scenic backdrop. */}
      <mesh
        position={[(HALL.leftX + HALL.rightX) / 2, -0.049, (roomBackZ + HALL.backZ) / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        raycast={NO_RAYCAST}
      >
        <planeGeometry args={[HALL.rightX - HALL.leftX, roomBackZ - HALL.backZ]} />
        <meshStandardMaterial map={tex.wood.map} normalMap={tex.wood.normalMap} normalScale={[0.55, 0.55]} roughness={0.5} />
      </mesh>
      {[HALL.leftX, HALL.rightX].map((x) => (
        <mesh
          key={`hall-wall-${x}`}
          position={[x, roomHeight / 2 - 0.05, (roomBackZ + HALL.backZ) / 2]}
          receiveShadow
          raycast={NO_RAYCAST}
        >
          <boxGeometry args={[0.06, roomHeight, roomBackZ - HALL.backZ]} />
          <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.45, 0.45]} roughness={0.92} />
        </mesh>
      ))}
      <mesh
        position={[(HALL.leftX + HALL.rightX) / 2, roomHeight / 2 - 0.05, HALL.backZ]}
        receiveShadow
        raycast={NO_RAYCAST}
      >
        <boxGeometry args={[HALL.rightX - HALL.leftX, roomHeight, 0.06]} />
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
          <mesh position={[x, HALL.openingHeight / 2, roomBackZ + 0.055]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.09, HALL.openingHeight, 0.08]} />
            <meshStandardMaterial color="#eee1cf" roughness={0.66} />
          </mesh>
        </group>
      ))}
      <mesh position={[(HALL.leftX + HALL.rightX) / 2, HALL.openingHeight, roomBackZ + 0.055]} raycast={NO_RAYCAST}>
        <boxGeometry args={[HALL.rightX - HALL.leftX + 0.18, 0.09, 0.08]} />
        <meshStandardMaterial color="#eee1cf" roughness={0.66} />
      </mesh>

      {/* Window on the back wall — glass + parallax exterior + frame.
          The far-plane sits a little behind the glass so it reads as depth. */}
      <group position={[-1.45, 1.5, roomBackZ + 0.04]}>
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
      <group position={[1.6, 2.42, roomBackZ + 0.09]}>
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

      {/* Lived-in sofa: cushions askew, throw knocked over — someone got up fast. */}
      {!hideGenericHomeFurniture && (
        <LivedInSofa position={[-1.65, 0, ROOM.backZ + 0.55]} fabric="#6b7758" />
      )}
      {/* Profile homes keep their authored GLB furniture but still need life:
          asthma inhaler on a side table, prayer mat, wall art, a fan turning. */}
      {hasResp001Dressing && (
        <>
          <MedicationClutter position={[2.55, 0, -1.55]} variant="asthma" />
          <WalkingStick position={[-2.55, 0, 0.55]} />
          <PrayerMat position={[2.7, 0.04, 0.9]} rotation={0.2} />
          <FruitBowl position={[-1.1, 0.48, 0.2]} />
          <WallArtCluster position={[-1.9, 1.65, roomBackZ + 0.08]} />
          <WallClock position={[0.4, 1.9, roomBackZ + 0.08]} rotation={[Math.PI / 2, 0, 0]} />
          <LivingTelevision position={[2.4, 1.2, roomBackZ + 0.12]} width={0.95} height={0.54} tint="#6eb6ff" />
          <CeilingFan position={[0.3, roomHeight - 0.2, 0.3]} />
          <Curtain position={[-2.15, 1.35, roomBackZ + 0.1]} color="#f0e6d2" />
          <Curtain position={[-0.75, 1.35, roomBackZ + 0.1]} color="#f0e6d2" />
          <PottedPlant position={[2.7, 0, -1.0]} scale={0.85} />
          <Slippers position={[-0.9, 0, 0.7]} />
          <DustMotes count={24} bounds={[2.4, 1.6, 2.2]} centre={[0, 1.1, 0]} />
        </>
      )}

      {/* Kenney dining chair, scaled onto the seated pelvis plant. The
          previous box-pan + slab backrest read as a crate, not furniture. */}
      {showPatientSeat && !hideGenericHomeFurniture && (
        <Suspense fallback={null}>
          <KenneyPatientChair kind={patientSeatKind ?? 'dining'} name="home-patient-chair" />
        </Suspense>
      )}

      {/* Coffee table with tea tray + remote + dropped tissue. */}
      {!hideGenericHomeFurniture && <CoffeeTable position={[-1.55, 0, 1.15]} rotation={0.35} />}
      {!hideGenericHomeFurniture && (
        <MedicationClutter position={[2.2, 0, -1.4]} variant="generic" />
      )}
      {!hideGenericHomeFurniture && (
        <>
          <WalkingStick position={[-2.5, 0, 0.4]} />
          <Slippers position={[-1.2, 0, 0.85]} />
          <PrayerMat position={[2.5, 0.04, 0.6]} rotation={0.3} />
          <FruitBowl position={[-1.55, 0.4, 1.15]} />
          <PottedPlant position={[2.55, 0, -1.2]} scale={0.9} />
          <WallArtCluster position={[-1.2, 1.7, roomBackZ + 0.08]} />
          <WallClock position={[1.1, 1.85, roomBackZ + 0.08]} rotation={[Math.PI / 2, 0, 0]} />
          <LivingTelevision position={[2.35, 1.15, roomBackZ + 0.1]} width={1.0} height={0.56} tint="#7aa7ff" />
          <CeilingFan position={[0, roomHeight - 0.18, 0.2]} />
          <Curtain position={[-2.3, 1.35, roomBackZ + 0.1]} color="#e8ddc8" />
          <Curtain position={[-0.6, 1.35, roomBackZ + 0.1]} color="#e8ddc8" />
          <DustMotes count={22} bounds={[2.2, 1.5, 2.0]} centre={[0, 1.1, 0]} />
        </>
      )}

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

      {!hideOverhead && (
        <CeilingCornice
          x={0}
          y={roomHeight - 0.05}
          z={roomCentreZ}
          width={roomHalfW * 2}
          depth={roomDepth}
          hasResp001Dressing={hasResp001Dressing}
          tex={tex}
        />
      )}

      {/* Light rig — window daylight does the soft wash (RectAreaLight) while
          a warm spot remains the single shadow caster; the floor lamp adds a
          practical pool and the AC gives a cool top-fill so the room reads
          like a villa interior instead of a clinic bay. */}
      <WindowAreaLight backZ={roomBackZ} lookAtTarget={windowLookAt} />
      {hasResp001Dressing
        ? <HomeDustMotes count={24} opacity={0.08} size={0.006} backZ={roomBackZ} />
        : <HomeDustMotes />}
      <KeyLight color="#ffe0b8" intensity={5.6} position={[-1.45, 2.35, roomBackZ + 0.55]} shadowsEnabled={shadowsEnabled} />
      <pointLight position={[-1.45, 1.6, roomBackZ + 0.3]} intensity={2.6} distance={6} decay={2} color="#fff0d2" />
      <pointLight position={[1.6, 2.18, roomBackZ + 0.35]} intensity={1.15} distance={4.5} decay={2} color="#cfe0ff" />
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
  bystanders,
}: {
  hideOverhead: boolean;
  shadowsEnabled: boolean;
  showPatientSeat: boolean;
  bystanders?: string | null;
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
      <BystanderCrowd variant="public" bystanders={bystanders} />
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

      {/* Lived-in public interior: plant, street furniture, AED, counter. */}
      <PottedPlant position={[1.9, 0, 1.4]} scale={1.05} />
      <PublicStreetFurniture position={[-1.3, 0, 1.7]} />
      <AedCabinet position={[-2.2, 1.35, backdropZ + 0.12]} />
      <ServiceCounter position={[1.7, 0, -1.6]} rotation={Math.PI} width={1.5} />
      <LivingTelevision position={[0, 2.15, backdropZ + 0.12]} width={1.3} height={0.28} tint="#dbeafe" />
      <AirConditioner position={[2.0, 2.35, backdropZ + 0.15]} />
      <PhotoFrame position={[-2.4, 1.7, backdropZ + 0.08]} w={0.24} h={0.3} tint="#9db8c9" />
      <PhotoFrame position={[2.4, 1.7, backdropZ + 0.08]} w={0.2} h={0.26} tint="#b0c4d4" />
      <DustMotes count={18} bounds={[3.0, 1.6, 2.5]} centre={[0, 1.1, 0]} color="#e8f0f6" opacity={0.22} />

      {/* Cornice — the office ceiling is a bare plane like every other variant
          was before this pass, so the wall-ceiling junction was a hairline with
          nothing to catch light and no shadow for the camera to read as depth.
          A 0.06 × 0.09 extrusion around the perimeter gives the shell a crown,
          throws a narrow shadow band onto the partition below the key light,
          and is a real mesh the orbit camera can slide behind. */}
      {!hideOverhead && (
        <CeilingCornice
          x={0}
          y={height - 0.05}
          z={(backdropZ + frontZ) / 2}
          width={halfW * 2}
          depth={frontZ - backdropZ}
          hasResp001Dressing={false}
          tex={null}
        />
      )}
      {/* Recessed fluorescent troffers sit just under the cornice so the
          office ceiling reads as a dropped panel grid rather than a bare
          slab. The old build hung them at y=2.28 in open air; with the
          cornice at the wall head they now tuck into the cove. */}
      {[-1.2, -0.4, 0.4, 1.2].map((x) => (
        <mesh key={`fluoro-${x}`} position={[x, height - 0.105, backdropZ + 0.85]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.35, 1.6, 0.02]} />
          <meshStandardMaterial color="#f0f7ff" roughness={0.2} emissive="#e3f0ff" emissiveIntensity={0.9} />
        </mesh>
      ))}
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
function IndustrialScene({ shadowsEnabled, bystanders }: { shadowsEnabled: boolean; bystanders?: string | null }) {
  return (
    <group>
      <OutdoorAtmosphere enabled />
      <BystanderCrowd variant="industrial" bystanders={bystanders} />
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

      <HazardDrum position={[-2.85, 0, 1.45]} color="#d8a51f" />
      <HazardDrum position={[-2.4, 0, 2.1]} color="#c2410c" />
      <ToolCrate position={[2.3, 0, 0.4]} rotation={0.3} />
      <HardHat position={[-1.6, 0.02, 1.1]} color="#f5c518" />
      <HardHat position={[1.1, 0.02, 1.8]} color="#f97316" />
      <WorkLight position={[2.0, 0, -1.2]} />
      <SteamVent position={[0.8, 0.3, -1.5]} count={12} color="#c5cdd3" />
      <DustMotes count={26} bounds={[3.2, 1.8, 2.8]} centre={[0, 1.0, 0]} color="#e8dcc4" opacity={0.3} />

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
function FireScene({ shadowsEnabled, bystanders }: { shadowsEnabled: boolean; bystanders?: string | null }) {
  return (
    <group>
      <OutdoorAtmosphere enabled />
      <BystanderCrowd variant="fire" bystanders={bystanders} />
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
      <FireEmbers />
      <HazardDrum position={[2.2, 0, -1.4]} color="#9a3412" />
      <ToolCrate position={[-2.4, 0, 1.0]} rotation={-0.4} />
      <HardHat position={[-1.5, 0.02, 1.4]} color="#f8fafc" />
      <WorkLight position={[1.6, 0, 1.8]} />
      <DustMotes count={20} bounds={[3.0, 1.6, 2.4]} centre={[0, 0.9, -0.5]} color="#9ca3af" opacity={0.35} />
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
function WaterScene({ shadowsEnabled, bystanders }: { shadowsEnabled: boolean; bystanders?: string | null }) {
  return (
    <group>
      <OutdoorAtmosphere enabled />
      <BystanderCrowd variant="water" bystanders={bystanders} />
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
      <BeachTowel position={[-1.6, 0.01, 1.1]} rotation={0.4} color="#38bdf8" />
      <BeachTowel position={[1.2, 0.01, 0.6]} rotation={-0.3} color="#f97316" />
      {/* Extra dry towels + wet deck sheen — hotel poolside drowning. */}
      <BeachTowel position={[-0.4, 0.012, 1.55]} rotation={1.1} color="#f8fafc" />
      <BeachTowel position={[0.7, 0.012, -0.4]} rotation={-0.8} color="#e2e8f0" />
      <mesh position={[0.2, -0.032, 0.4]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <circleGeometry args={[1.4, 28]} />
        <meshStandardMaterial color="#8ec8d8" roughness={0.12} metalness={0.15} transparent opacity={0.35} />
      </mesh>
      <RescueTube position={[2.5, 0.1, 0.2]} rotation={[0, 0.2, 0.5]} />
      <WaterBottleCluster position={[1.8, 0, 1.3]} count={3} />
      <SteamVent position={[0.2, 0.1, -1.6]} count={10} color="#dff7ff" />
      <DustMotes count={14} bounds={[3.0, 1.2, 2.5]} centre={[0, 0.6, 0]} color="#b9efff" opacity={0.2} />

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
function HeatScene({ shadowsEnabled, showPatientSeat, bystanders }: { shadowsEnabled: boolean; showPatientSeat: boolean; bystanders?: string | null }) {
  return (
    <group>
      <OutdoorAtmosphere enabled />
      <BystanderCrowd variant="heat" bystanders={bystanders} />
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
      <WaterBottleCluster position={[-2.3, 0, 1.4]} count={5} />
      <SunHat position={[-1.4, 0.02, 0.9]} />
      <SunHat position={[1.8, 0.02, -1.1]} color="#f5e6c8" />
      <HeatShimmer y={0.4} z={-1.6} />
      <DustMotes count={18} bounds={[3.5, 1.5, 3.0]} centre={[0, 0.9, 0]} color="#fff0c4" opacity={0.28} />

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
function AgriculturalScene({ shadowsEnabled, showPatientSeat: _showPatientSeat, bystanders }: { shadowsEnabled: boolean; showPatientSeat: boolean; bystanders?: string | null }) {
  return (
    <group>
      <OutdoorAtmosphere enabled />
      <BystanderCrowd variant="agricultural" bystanders={bystanders} />
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
      <PesticideTank position={[-1.8, 0, 1.2]} />
      <ProduceCrate position={[1.5, 0, 0.8]} rotation={0.3} fill="#84cc16" />
      <ProduceCrate position={[1.9, 0, 1.15]} rotation={-0.2} fill="#f97316" />
      <SunHat position={[-0.9, 0.02, 0.5]} color="#e8d9a0" />
      <HardHat position={[0.6, 0.02, 1.6]} color="#84cc16" />
      <HeatShimmer y={0.3} z={-1.0} />
      <DustMotes count={22} bounds={[3.4, 1.5, 3.0]} centre={[0, 0.8, 0]} color="#e8dcc4" opacity={0.32} />

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

/**
 * A single crowd figure. The GLB is decimated to ~1.5 k verts and normalised
 * to 1.72 m by the Blender pipeline, so each instance is cheap and the layout
 * owns the spacing. The figure stands on the floor plane (min-Y = 0) and is
 * yawed to face the treatment lane; the layout passes the yaw as a Z rotation.
 */
/**
 * Standing height a bystander is normalised to, in the figure's own local
 * units, calibrated so the crowd renders at the patient's scale.
 *
 * Do not trust the asset: the shipped GLBs measure 2.39 m (male) and 1.30 m
 * (female), so a mixed crowd stood 2.5 m giants beside 1.3 m children and
 * neither was adult scale.
 *
 * These are local units rather than metres because the environment tree sits
 * under its own transform chain. The numbers are calibrated against the
 * patient as rendered — a standing patient measures 1.62 head-to-toe in world
 * space, and these land the crowd beside them. Re-measure both together if the
 * scene scale ever moves; the male/female ratio is the part that must hold.
 */
/**
 * Floor for the crowd's depth fade. Anything much lower and a distant figure's
 * legs vanish into the ground and the bystander reads as a hovering ghost.
 */
export const BYSTANDER_MIN_OPACITY = 0.82;

export const BYSTANDER_HEIGHT_MALE = 1.39;
export const BYSTANDER_HEIGHT_FEMALE = 1.36;

function BystanderFigure({
  url,
  position,
  yaw,
  posture,
  onReady,
  depth01 = 1,
}: {
  url: string;
  position: [number, number, number];
  yaw: number;
  posture: BystanderPosture;
  /** Called once with the mounted group so the crowd can drive the idle
   *  animation from a single useFrame instead of one per figure. */
  onReady?: (ref: THREE.Group | null) => void;
  /** 0..1 — distance from the crowd centroid, for a soft depth fade. */
  depth01?: number;
}) {
  const { scene } = useGLTF(url);
  const isFemaleFigure = url.endsWith('bystander-female.glb');
  const clone = useMemo(() => {
    const next = scene.clone(true);
    const isFemale = isFemaleFigure;
    next.traverse(object => {
      object.raycast = NO_RAYCAST;
      object.castShadow = true;
      object.receiveShadow = true;
      // Deep clone gives each figure its own material set, so a depth fade
      // on one witness never bleeds onto another.
      if (object instanceof THREE.Mesh) {
        const m = object.material;
        const mats = Array.isArray(m) ? m : [m];
        mats.forEach(mat => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            // Far figures sit back a little so the crowd reads as a depth
            // field rather than a wall of identical cutouts. The fade is
            // baked into the clone — keyed on depth01 so each distance band
            // gets its own material set.
            //
            // It used to bottom out at 0.35, which was far too see-through:
            // a distant bystander's legs dissolved into the dark roadway and
            // only the lighter torso carried, so the figure read as an
            // apparition hovering over the scene rather than a person
            // standing on it. Keep the cue, lose the ghost.
            const fade = BYSTANDER_MIN_OPACITY + (1 - BYSTANDER_MIN_OPACITY) * depth01;
            // Only pay for transparency when the figure is actually
            // translucent; a fully opaque mesh with depthWrite off sorts badly
            // against the scene behind it.
            mat.transparent = fade < 0.995;
            mat.depthWrite = !mat.transparent;
            mat.opacity = fade;
            // The bystander GLB ships ONE untextured material (flat grey
            // 0.55,0.52,0.48, no maps, one primitive, no per-part split) —
            // without a tint it renders as a white plastic mannequin, which
            // is exactly the ghost the audit flagged on trauma-005. A warm,
            // gendered tone is the whole fix available at this mesh: there is
            // no separate hair/garment material to darken, so any
            // luminance-based "skin vs clothing" split paints the entire
            // figure one colour (verified in Blender — the single material
            // sits at lum 0.52, above any threshold). The real fix is a
            // clothed bystander GLB with per-part materials; this buys the
            // tone in the meantime. baseColorFactor multiplies any future
            // texture, so it stays correct if maps are added later.
            mat.color.set(
              isFemale ? 0.52 : 0.46,
              isFemale ? 0.37 : 0.33,
              isFemale ? 0.30 : 0.27,
            );
            mat.roughness = Math.max(mat.roughness, 0.75);
          }
        });
      }
    });
    return next;
  }, [isFemaleFigure, scene, depth01]);

  // Posture drives a grounded silhouette. The bystander GLB is a single
  // standing mesh normalised to min-Y = 0, so a non-authored posture is a
  // Y-scale that squats the figure onto the floor — never a lift, which would
  // float a "kneeling" bystander 0.18 m in the air.
  //   standing  1.00  full height, feet on the floor
  //   kneeling  0.72  squat — knees on the ground, torso still upright
  //   crouching 0.62  deeper crouch
  //   sitting   0.55  seated height, still grounded on the floor plane
  //   lying     0.30  low silhouette, reads as a figure on the ground
  const scaleByPosture: Record<BystanderPosture, number> = {
    standing: 1.0,
    kneeling: 0.72,
    crouching: 0.62,
    sitting: 0.55,
    lying: 0.3,
  };
  const s = scaleByPosture[posture];

  // Normalise the figure to a human height instead of trusting the asset.
  // Measured from the shipped GLBs: the male is 2.39 m tall and the female
  // 1.30 m, so a mixed crowd put 2.5 m giants beside 1.3 m children and
  // neither was adult scale. Deriving the factor from the mesh's own bounds
  // keeps the crowd human whatever the asset is re-exported at.
  const heightScale = useMemo(() => {
    // Measure with matrices resolved. Box3.setFromObject walks matrixWorld, and
    // an unmounted clone has stale ones — which silently measured the figure
    // short and left the crowd oversized by the difference.
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const height = box.max.y - box.min.y;
    if (!Number.isFinite(height) || height <= 0.01) return 1;
    return (isFemaleFigure ? BYSTANDER_HEIGHT_FEMALE : BYSTANDER_HEIGHT_MALE) / height;
  }, [clone, isFemaleFigure]);

  const groupRef = useRef<THREE.Group>(null);
  useEffect(() => {
    const g = groupRef.current;
    if (g) onReady?.(g);
    return () => { onReady?.(null); };
  }, [onReady]);


  return (
    <group ref={groupRef} position={[position[0], 0, position[2]]} rotation={[0, yaw, 0]}>
      <primitive
        name={`bystander-${posture}`}
        object={clone}
        scale={[heightScale, heightScale * s, heightScale]}
      />
    </group>
  );
}

/** A static crowd reads as a line of mannequins. One useFrame drives every
 *  figure instead of N callbacks, so a 24-strong crowd costs one loop on the
 *  iPad tier rather than 24. Each figure gets a small, deterministic idle — a
 *  slow chest rise (breathing) and a gentle head turn, phased off its index
 *  so adjacent figures never move in lock. The amplitude is tiny: this is a
 *  witness shifting their weight, not a turbulence generator.
 */
function BystanderIdle({
  refs,
  baseYaws,
}: {
  refs: React.MutableRefObject<THREE.Group[]>;
  baseYaws: number[];
}) {
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const arr = refs.current;
    for (let i = 0; i < arr.length; i++) {
      const g = arr[i];
      if (!g) continue;
      // Phase each figure off its index so adjacent figures desync.
      const phase = (i * 2.65) % (Math.PI * 2);
      const breathHz = 0.26 + (i % 3) * 0.02;
      const breath = Math.sin(t * breathHz * Math.PI * 2 + phase) * 0.012;
      const sway = Math.sin(t * 0.42 + phase * 0.5) * 0.016;
      const base = baseYaws[i] ?? 0;
      g.rotation.z = base + sway;
      g.scale.set(1, g.scale.y + breath, 1);
    }
  });
  return null;
}

/**
 * The crowd. Renders outside the treatment lane, behind and to the sides of
 * the patient, facing inward. Driven by the pure layout so the placement is
 * testable and deterministic. Outdoor variants get a bigger, more dispersed
 * crowd; indoor public scenes keep it tight against the back wall so the
 * storefront reads as populated without blocking the exam lane.
 */
function BystanderCrowd({
  variant,
  bystanders,
}: {
  variant: EnvironmentVariant;
  /** Authored case bystander sentence; parsed into count + posture. */
  bystanders?: string | null;
}) {
  const envelope = getBystanderEnvelope(variant);
  const parsed = useMemo(() => parseBystanders(bystanders), [bystanders]);
  const placements = useMemo(() => {
    const count = parsed.count > 0 ? parsed.count : envelope.count;
    if (count === 0) return [];
    const posture = parsed.count > 0 ? parsed.posture : envelope.posture;
    return layoutBystanders(count, { ...envelope, posture }, envelope.seed);
  }, [envelope, parsed]);
  const refs = useRef<THREE.Group[]>([]);
  const yaws = useRef<number[]>([]);
  refs.current = [];
  yaws.current = [];
  if (placements.length === 0) return null;
  return (
    <group name="bystander-crowd">
      {placements.map((p, i) => {
        const url = p.gender === 'female'
          ? '/models/bystander-female.glb'
          : '/models/bystander-male.glb';
        return (
          <BystanderFigure
            key={`bystander-${i}`}
            url={url}
            position={[p.x, 0, p.z]}
            yaw={p.yaw}
            posture={p.posture}
            depth01={p.depth01}
            onReady={ref => {
              if (ref) { refs.current.push(ref); yaws.current.push(p.yaw); }
            }}
          />
        );
      })}
      <BystanderIdle refs={refs} baseYaws={yaws.current} />
    </group>
  );
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
      {/* Crushed bonnet + hanging wheel arch — silhouette reads as impact. */}
      <mesh position={[0.2, 0.55, 1.15]} rotation={[0.35, 0.1, 0.15]} castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[1.4, 0.18, 0.55]} />
        <meshStandardMaterial color="#5a6270" roughness={0.55} metalness={0.45} />
      </mesh>
      <mesh position={[-1.1, 0.35, 0.4]} rotation={[0.2, 0, 1.1]} castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.5, 0.12, 0.7]} />
        <meshStandardMaterial color="#6b7280" roughness={0.6} metalness={0.4} />
      </mesh>
    </group>
  );
}

function RoadsideScene({ shadowsEnabled, showPatientSeat, sceneProfile, bystanders, vehicleImpact }: { shadowsEnabled: boolean; showPatientSeat: boolean; sceneProfile?: SceneProfile; bystanders?: string | null; vehicleImpact?: boolean; }) {
  const traumaDressing = isTrauma008RoadsideProfile(sceneProfile)
    ? SCENE_ARCHETYPES.find(e => e.profile === 'trauma-008-roadside')
    : undefined;
  // The wrecked car, debris shards, broken glass, fuel spill and downed
  // motorcycle belong to a vehicle impact — a pedestrian struck by a car, a
  // cyclist hit by a van. A generic roadside (moped spill, dropped groceries,
  // fall from a kerb, twisted leg on a pitch) has no car in it, so all of that
  // stays off unless the case text actually describes a struck vehicle.
  const hasWreck = Boolean(vehicleImpact);
  return (
    <group>
      <OutdoorAtmosphere enabled />
      <OutdoorSky zenith="#8cb6d4" horizon="#e8d3ba" />
      {showPatientSeat && <Suspense fallback={null}><VehiclePatientSeat /></Suspense>}
      <BystanderCrowd variant="roadside" bystanders={bystanders} />
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
      {/* Street furniture + personal scatter + skid marks — a real crash site. */}
      <StreetLamp position={[-3.2, 0, -1.8]} lit />
      <StreetLamp position={[3.4, 0, 1.4]} lit={false} />
      <TrafficBarrier position={[0, 0, 2.6]} rotation={0.08} />
      <CrashScatter position={[0.3, 0, 0.6]} />
      <SkidMarks position={[1.8, 0, -0.4]} rotation={0.25} />
      <DustMotes count={16} bounds={[3.5, 1.4, 3.0]} centre={[0, 0.8, 0]} color="#d4d8dc" opacity={0.2} />
      {/* The wrecked car, debris, broken glass, fuel spill and downed motorcycle
          belong to a vehicle impact — a pedestrian struck by a car, a cyclist
          hit by a van. A generic roadside (moped spill, fall from a kerb) has
          no car in it, so all of that stays off unless the case text actually
          describes a struck vehicle. */}
      {hasWreck && (
        <Suspense fallback={null}>
          {traumaDressing ? (
            <ArchetypeSceneDressing entry={traumaDressing} shadowsEnabled={shadowsEnabled} />
          ) : (
            <WreckedSedan />
          )}
        </Suspense>
      )}

      {/* Downed motorcycle — generic roadside only. Pedestrian MVC already has the sedan. */}
      {hasWreck && !traumaDressing && <group name="downed-motorcycle" position={[-3.6, 0, 1.6]} rotation={[0, 1.1, Math.PI / 2 - 0.1]}>
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
      </group>}

      {/* Debris scattered across the road — small low-poly shards */}
      {hasWreck && [
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
      {hasWreck && [
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
      {hasWreck && <mesh position={[1.6, -0.045, -0.3]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <circleGeometry args={[1.1, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.08} metalness={0.6} transparent opacity={0.7} />
      </mesh>}

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
/**
 * Atmospheric depth for outdoor scenes — a thin fog band near the horizon so
 * the world has a readable falloff (game skybox behaviour) without hiding the
 * patient. Indoor scenes stay clear so clinical colour stays accurate.
 */
function OutdoorAtmosphere({ enabled }: { enabled: boolean }) {
  const { scene } = useThree();
  useEffect(() => {
    if (!enabled) {
      if (scene.fog) scene.fog = null;
      return;
    }
    scene.fog = new THREE.Fog('#c5d4de', 6, 18);
    return () => { scene.fog = null; };
  }, [enabled, scene]);
  return null;
}

export function SceneVariantEnvironment({
  variant,
  hideOverhead,
  shadowsEnabled,
  showPatientSeat,
  patientSeatKind,
  sceneProfile,
  bystanders,
  onAnchorsReady,
  vehicleImpact,
}: {
  variant: Exclude<EnvironmentVariant, 'clinic'>;
  hideOverhead: boolean;
  shadowsEnabled: boolean;
  showPatientSeat: boolean;
  patientSeatKind?: PatientSeatKind;
  sceneProfile?: SceneProfile;
  bystanders?: string | null;
  onAnchorsReady?: (anchors: SceneAnchorSet) => void;
  /** Roadside only: whether the case text describes a struck/damaged vehicle. */
  vehicleImpact?: boolean;
}) {
  if (variant === 'home') return <HomeScene variant={variant} hideOverhead={hideOverhead} shadowsEnabled={shadowsEnabled} showPatientSeat={showPatientSeat} patientSeatKind={patientSeatKind} sceneProfile={sceneProfile} onAnchorsReady={onAnchorsReady} />;
  if (variant === 'public') return <PublicScene hideOverhead={hideOverhead} shadowsEnabled={shadowsEnabled} showPatientSeat={showPatientSeat} bystanders={bystanders} />;
  if (variant === 'industrial') return <IndustrialScene shadowsEnabled={shadowsEnabled} bystanders={bystanders} />;
  if (variant === 'fire') return <FireScene shadowsEnabled={shadowsEnabled} bystanders={bystanders} />;
  if (variant === 'water') return <WaterScene shadowsEnabled={shadowsEnabled} bystanders={bystanders} />;
  if (variant === 'heat') return <HeatScene shadowsEnabled={shadowsEnabled} showPatientSeat={showPatientSeat} bystanders={bystanders} />;
  if (variant === 'agricultural') return <AgriculturalScene shadowsEnabled={shadowsEnabled} showPatientSeat={showPatientSeat} bystanders={bystanders} />;
  return <RoadsideScene shadowsEnabled={shadowsEnabled} showPatientSeat={showPatientSeat} sceneProfile={sceneProfile} bystanders={bystanders} vehicleImpact={vehicleImpact} />;
}

useGLTF.preload('/models/props/kenney-sedan.glb');
useGLTF.preload('/models/props/kenney-debris-bumper.glb');
useGLTF.preload('/models/props/kenney-debris-door.glb');
useGLTF.preload('/models/vehicle-patient-seat.glb');
SCENE_ARCHETYPES.forEach(e => useGLTF.preload(e.glbUrl));
