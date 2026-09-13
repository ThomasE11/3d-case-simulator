/**
 * Treatment-bay environment — the room the patient is treated in.
 *
 * Everything here is procedural Three.js primitives (no external assets):
 * a lino-floored bay with walls, a side window, wall cabinets replaced by
 * real props (IV stand, monitor on a stand, oxygen tank, crash cart), a
 * shadow-casting surgical key light, a cool window rim light, dust motes
 * drifting through the beam, and a radial-gradient soft shadow grounding
 * the patient.
 *
 * Rules inherited from the old inline PatientSceneEnvironment:
 * - every mesh sets raycast={() => null} so region clicks pass through
 * - hideOverhead: the supine-bay orbit camera lives ABOVE the patient, so
 *   ceiling/lamp geometry would sit between camera and anatomy
 * - hideBed: floor-staged patients are treated where they were found
 * - the stretcher footprint ([0, 0.45, 0.02], 1.18 x 2.38) is load-bearing —
 *   BodyMesh stages the patient against it. Do not move it.
 */
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getBayTextures } from './textures';
import { SceneVariantEnvironment } from './SceneVariant';
import { KenneyPatientChair } from './KenneyPatientChair';
import type { EnvironmentVariant } from '@/lib/sceneEnvironment';
import { isResp001VillaProfile, type SceneProfile } from './sceneProfile';
import type { PatientSeatKind, PatientSupportSurface } from '@/lib/patientStaging';
import { focusRig, resetFocusRig, FOCUS_REST, FOCUS_WIDE } from '@/lib/focusRig';

const NO_RAYCAST = () => null;

/** Shared brushed-steel material props — the near-white metal map is tinted
 *  by each mesh's existing color. Reflections come from the scene HDRI. */
function steelProps(): {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughness: number;
  metalness: number;
} {
  const { metal } = getBayTextures();
  return { map: metal.map, normalMap: metal.normalMap, roughness: 0.4, metalness: 0.8 };
}

// ---------------------------------------------------------------------------
// Palette — one fixed clinical palette. The room lives behind ACES tone
// mapping and its own lighting; it no longer follows the DOM theme class.
// ---------------------------------------------------------------------------
const PALETTE = {
  floor: '#242f3a',
  wall: '#2e3d4b',
  wallBack: '#1c2733',
  ceiling: '#131b25',
  metal: '#8fa1b1',
  steel: '#b6c2cc',
  bed: '#d9e2e8',
  sheet: '#f1f5f9',
  screenGlow: '#22d3ee',
};

// ---------------------------------------------------------------------------
// Room shell
// ---------------------------------------------------------------------------
function Room({ hideOverhead }: { hideOverhead: boolean }) {
  const tex = getBayTextures();
  return (
    <group>
      {/* Floor — large enough that the orbit camera never sees its edge.
          Linoleum map carries the hue; slight gloss picks up the key light. */}
      <mesh position={[0, -0.05, 0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[7.2, 7.2]} />
        <meshStandardMaterial
          map={tex.floor.map}
          normalMap={tex.floor.normalMap}
          normalScale={[0.7, 0.7]}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.05, -1.05]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[4.2, 2.3, 0.05]} />
        <meshStandardMaterial
          map={tex.wallBack.map}
          normalMap={tex.wallBack.normalMap}
          normalScale={[0.5, 0.5]}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      {/* Side walls */}
      {[-2.05, 2.05].map((x) => (
        <mesh key={`side-${x}`} position={[x, 1.05, 0.4]} receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.05, 2.3, 3.0]} />
          <meshStandardMaterial
            map={tex.wall.map}
            normalMap={tex.wall.normalMap}
            normalScale={[0.5, 0.5]}
            roughness={0.9}
            metalness={0}
          />
        </mesh>
      ))}

      {/* Skirting — a bright steel kick-line where wall meets floor reads
          "hospital corridor" instantly. */}
      {[-2.02, 2.02].map((x) => (
        <mesh key={`skirt-${x}`} position={[x, 0.03, 0.4]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.02, 0.12, 3.0]} />
          <meshStandardMaterial color={PALETTE.metal} {...steelProps()} />
        </mesh>
      ))}
      <mesh position={[0, 0.03, -1.02]} raycast={NO_RAYCAST}>
        <boxGeometry args={[4.2, 0.12, 0.02]} />
        <meshStandardMaterial color={PALETTE.metal} {...steelProps()} />
      </mesh>

      {/* Window on the left wall — motivates the cool rim light. */}
      <group position={[-2.02, 1.35, 0.55]}>
        <mesh raycast={NO_RAYCAST}>
          <boxGeometry args={[0.03, 0.85, 1.25]} />
          <meshStandardMaterial
            color="#9db8d6"
            emissive="#a9c8e8"
            emissiveIntensity={0.65}
            roughness={0.15}
            metalness={0.1}
          />
        </mesh>
        {/* Frame + mullions */}
        {[[-0.46, 0], [0.46, 0], [0, 0]].map(([y], i) => (
          <mesh key={`mull-h-${i}`} position={[0.015, y, 0]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.035, 0.05, 1.3]} />
            <meshStandardMaterial color={PALETTE.wallBack} roughness={0.5} metalness={0.3} />
          </mesh>
        ))}
        {[-0.66, 0, 0.66].map((z) => (
          <mesh key={`mull-v-${z}`} position={[0.015, 0, z]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.035, 0.95, 0.05]} />
            <meshStandardMaterial color={PALETTE.wallBack} roughness={0.5} metalness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Wall-mounted vitals repeater on the back wall — a lit panel. */}
      <mesh position={[0.85, 1.42, -1.01]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.44, 0.28, 0.03]} />
        <meshStandardMaterial
          color="#020617"
          roughness={0.4}
          metalness={0.15}
          emissive={PALETTE.screenGlow}
          emissiveIntensity={0.22}
        />
      </mesh>

      {/* Ceiling, panel lights and the surgical lamp head hide when the
          camera orbits above the patient. */}
      {!hideOverhead && (
        <>
          <mesh position={[0, 2.3, 0.1]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
            <planeGeometry args={[4.2, 3.2]} />
            <meshStandardMaterial
              map={tex.ceiling.map}
              normalMap={tex.ceiling.normalMap}
              normalScale={[0.5, 0.5]}
              roughness={0.7}
              metalness={0.05}
            />
          </mesh>
          {[-0.85, 0.85].map((x) => (
            <mesh key={`panel-${x}`} position={[x, 2.28, -0.2]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
              <boxGeometry args={[0.5, 1.1, 0.02]} />
              <meshStandardMaterial color="#dbeafe" roughness={0.2} emissive="#bae6fd" emissiveIntensity={0.6} />
            </mesh>
          ))}
          <SurgicalLampHead />
        </>
      )}
    </group>
  );
}

/** Visible surgical lamp: arm from the ceiling + emissive dish. The actual
 *  illumination comes from the shadow-casting spotlight in BayLighting. */
function SurgicalLampHead() {
  return (
    <group position={[0.25, 0, 0.3]}>
      <mesh position={[0, 2.05, 0]} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 10]} />
        <meshStandardMaterial color={PALETTE.metal} {...steelProps()} />
      </mesh>
      <mesh position={[0, 1.78, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.19, 0.24, 0.09, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.25} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.73, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <circleGeometry args={[0.2, 24]} />
        <meshStandardMaterial color="#fff7e6" emissive="#fff2d9" emissiveIntensity={1.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Stretcher — same footprint as the old translucent bed, now solid with a
// frame, undercarriage and wheels.
// ---------------------------------------------------------------------------
function Stretcher() {
  const { fabric } = getBayTextures();
  return (
    <group position={[0, 0, 0.02]}>
      {/* Mattress + sheet (footprint is load-bearing — see file header) */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[1.18, 0.08, 2.38]} />
        <meshStandardMaterial
          map={fabric.map}
          normalMap={fabric.normalMap}
          normalScale={[0.6, 0.6]}
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      <mesh position={[0, 0.495, 0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[1.0, 0.015, 2.14]} />
        <meshStandardMaterial color={PALETTE.sheet} roughness={0.92} />
      </mesh>
      {/* Side rails */}
      {[-0.62, 0.62].map((x) => (
        <mesh key={`rail-${x}`} position={[x, 0.56, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.013, 0.013, 1.9, 12]} />
          <meshStandardMaterial color={PALETTE.steel} {...steelProps()} />
        </mesh>
      ))}
      {/* Undercarriage + legs + wheels */}
      <mesh position={[0, 0.36, 0]} castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.9, 0.05, 2.0]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.45} metalness={0.35} />
      </mesh>
      {([[-0.45, -0.95], [0.45, -0.95], [-0.45, 0.95], [0.45, 0.95]] as const).map(([x, z]) => (
        <group key={`leg-${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.2, 0]} castShadow raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.016, 0.016, 0.34, 10]} />
            <meshStandardMaterial color={PALETTE.steel} {...steelProps()} />
          </mesh>
          <mesh position={[0, 0.0, 0]} rotation={[0, 0, Math.PI / 2]} raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.045, 0.045, 0.03, 14]} />
            <meshStandardMaterial color="#1e293b" roughness={0.55} metalness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Kenney desk chair for tripod/seated presentations in the bay, worksite,
 * fire and water scenes. Seat pan is planted at 0.53 m so the pelvis stays
 * on the pan; rolling base + backrest read as a chair, not a crate. */
function ClinicalPatientSeat({ kind = 'desk' }: { kind?: 'cushion' | 'desk' | 'dining' }) {
  return (
    <Suspense fallback={null}>
      <KenneyPatientChair kind={kind} name="clinical-patient-seat" />
    </Suspense>
  );
}

/** Scene-authored patient support. Recumbent supports keep the stretcher's
 * 0.5025 m top plane. A seated sofa uses the chair plant's 0.53 m seat height
 * and faces across the patient's shoulders; the lengthwise recumbent version
 * otherwise places an armrest through an upright patient's torso. */
function ScenePatientSupport({ kind, seated = false }: { kind: 'bed' | 'sofa'; seated?: boolean }) {
  if (kind === 'sofa' && seated) {
    return (
      <group name="scene-patient-support-sofa-seated" position={[0, 0, 0.62]}>
        <mesh position={[0, 0.44, 0.02]} castShadow receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.72, 0.18, 0.18]} />
          <meshStandardMaterial color="#647052" roughness={0.96} />
        </mesh>
        <mesh position={[0, 0.80, -0.08]} rotation={[-0.18, 0, 0]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.72, 0.60, 0.15]} />
          <meshStandardMaterial color="#566247" roughness={0.98} />
        </mesh>
        {[-0.86, 0.86].map(x => (
          <mesh key={`seated-sofa-arm-${x}`} position={[x, 0.62, 0.02]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.15, 0.38, 0.18]} />
            <meshStandardMaterial color="#566247" roughness={0.98} />
          </mesh>
        ))}
        {[-0.41, 0.41].map(x => (
          <mesh key={`seated-sofa-cushion-${x}`} position={[x, 0.53, 0.03]} castShadow receiveShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.72, 0.02, 0.16]} />
            <meshStandardMaterial color="#7a8568" roughness={0.98} />
          </mesh>
        ))}
        {[-0.68, 0.68].flatMap(x => [-0.08, 0.10].map(z => (
          <mesh key={`seated-sofa-leg-${x}-${z}`} position={[x, 0.16, z]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.055, 0.32, 0.055]} />
            <meshStandardMaterial color="#3f2f22" roughness={0.55} metalness={0.08} />
          </mesh>
        )))}
      </group>
    );
  }

  if (kind === 'bed' && seated) {
    return (
      <group name="scene-patient-support-bed-seated" position={[0, 0, 0.62]}>
        {/* Mattress seat — the seated patient's buttocks rest on this plane. */}
        <mesh position={[0, 0.44, 0.02]} castShadow receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.38, 0.18, 0.18]} />
          <meshStandardMaterial color="#d9e2e8" roughness={0.96} />
        </mesh>
        {/* Raised backrest the patient leans against. */}
        <mesh position={[0, 0.82, -0.08]} rotation={[-0.30, 0, 0]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.38, 1.0, 0.10]} />
          <meshStandardMaterial color="#6b4f38" roughness={0.7} />
        </mesh>
        {/* Headboard behind the backrest. */}
        <mesh position={[0, 0.90, -0.18]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.48, 0.62, 0.08]} />
          <meshStandardMaterial color="#6b4f38" roughness={0.66} />
        </mesh>
        {[-0.58, 0.58].flatMap(x => [-0.08, 0.10].map(z => (
          <mesh key={`seated-bed-leg-${x}-${z}`} position={[x, 0.18, z]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.07, 0.36, 0.07]} />
            <meshStandardMaterial color="#3e2f25" roughness={0.58} />
          </mesh>
        )))}
      </group>
    );
  }

  if (kind === 'sofa') {
    return (
      <group name="scene-patient-support-sofa" position={[0, 0, 0.02]}>
        <mesh position={[0, 0.40, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.18, 0.20, 2.32]} />
          <meshStandardMaterial color="#647052" roughness={0.96} />
        </mesh>
        <mesh position={[0.55, 0.69, 0]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.18, 0.48, 2.32]} />
          <meshStandardMaterial color="#566247" roughness={0.98} />
        </mesh>
        {[-1.10, 1.10].map(z => (
          <mesh key={`sofa-arm-${z}`} position={[0, 0.58, z]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[1.18, 0.34, 0.16]} />
            <meshStandardMaterial color="#566247" roughness={0.98} />
          </mesh>
        ))}
        {[-0.72, 0, 0.72].map(z => (
          <mesh key={`sofa-seam-${z}`} position={[-0.03, 0.503, z]} raycast={NO_RAYCAST}>
            <boxGeometry args={[1.0, 0.008, 0.015]} />
            <meshStandardMaterial color="#879175" roughness={0.92} />
          </mesh>
        ))}
        {[-0.43, 0.43].flatMap(x => [-0.92, 0.92].map(z => (
          <mesh key={`sofa-leg-${x}-${z}`} position={[x, 0.16, z]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.055, 0.30, 0.055]} />
            <meshStandardMaterial color="#3f2f22" roughness={0.55} metalness={0.08} />
          </mesh>
        )))}
      </group>
    );
  }

  const { fabric } = getBayTextures();
  return (
    <group name="scene-patient-support-bed" position={[0, 0, 0.02]}>
      <mesh position={[0, 0.31, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[1.38, 0.28, 2.34]} />
        <meshStandardMaterial color="#7c5f45" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.455, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[1.30, 0.09, 2.26]} />
        <meshStandardMaterial map={fabric.map} normalMap={fabric.normalMap} normalScale={[0.5, 0.5]} roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.503, 0]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[1.22, 0.012, 2.18]} />
        <meshStandardMaterial color="#e8eef2" roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.73, -1.14]} castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[1.48, 0.68, 0.08]} />
        <meshStandardMaterial color="#6b4f38" roughness={0.66} />
      </mesh>
      {[-0.58, 0.58].flatMap(x => [-0.96, 0.96].map(z => (
        <mesh key={`bed-leg-${x}-${z}`} position={[x, 0.12, z]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.07, 0.24, 0.07]} />
          <meshStandardMaterial color="#3e2f25" roughness={0.58} />
        </mesh>
      )))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Props — monitor stand, oxygen tank, crash cart. All placed
// outside the patient/stretcher footprint, all castShadow.
// ---------------------------------------------------------------------------
function MonitorStand() {
  return (
    <group position={[1.3, 0, 0.7]} rotation={[0, -0.5, 0]}>
      <mesh position={[0, 0.02, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.18, 0.2, 0.03, 5]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.02, 0.02, 1.05, 10]} />
        <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.6} />
      </mesh>
      <group position={[0, 1.18, 0]} rotation={[-0.15, 0, 0]}>
        <mesh castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.38, 0.28, 0.05]} />
          <meshStandardMaterial color="#0f172a" roughness={0.45} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.027]} raycast={NO_RAYCAST}>
          <planeGeometry args={[0.34, 0.24]} />
          <meshStandardMaterial
            color="#020617"
            emissive={PALETTE.screenGlow}
            emissiveIntensity={0.9}
            roughness={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}

/** Rugged portable monitor/defibrillator for pre-hospital scenes. Unlike the
 * clinic stand, this sits beside the jump bags and stays below the patient's
 * limbs throughout the orbit camera. */
function PortableMonitor() {
  return (
    <group position={[1.75, 0, -0.82]} rotation={[0, -0.35, 0]}>
      {/* Rubberised chassis and feet */}
      <mesh position={[0, 0.2, 0]} castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.5, 0.34, 0.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.72} metalness={0.18} />
      </mesh>
      {[-0.18, 0.18].map(x => (
        <mesh key={`portable-monitor-foot-${x}`} position={[x, 0.035, 0]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.1, 0.07, 0.16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
      ))}

      {/* Carry handle */}
      {[-0.17, 0.17].map(x => (
        <mesh key={`portable-monitor-handle-upright-${x}`} position={[x, 0.47, 0]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.035, 0.22, 0.045]} />
          <meshStandardMaterial color="#334155" roughness={0.48} metalness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 0.57, 0]} castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.37, 0.045, 0.045]} />
        <meshStandardMaterial color="#334155" roughness={0.48} metalness={0.35} />
      </mesh>

      {/* Recessed waveform display */}
      <mesh position={[-0.055, 0.23, 0.106]} raycast={NO_RAYCAST}>
        <planeGeometry args={[0.31, 0.2]} />
        <meshStandardMaterial
          color="#020617"
          emissive={PALETTE.screenGlow}
          emissiveIntensity={0.72}
          roughness={0.28}
        />
      </mesh>
      {[0.12, 0.19, 0.26, 0.33].map((y, index) => (
        <mesh
          key={`portable-monitor-control-${y}`}
          position={[0.18, y, 0.111]}
          rotation={[Math.PI / 2, 0, 0]}
          raycast={NO_RAYCAST}
        >
          <cylinderGeometry args={[0.018 + (index === 3 ? 0.005 : 0), 0.018 + (index === 3 ? 0.005 : 0), 0.012, 12]} />
          <meshStandardMaterial
            color={index === 3 ? '#f59e0b' : '#cbd5e1'}
            roughness={0.48}
            metalness={0.18}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Floor jump bags the crew brings to every scene. Visual anchors for
 *  FIND EQUIPMENT — the interactive open-kit controls live in the bay
 *  hotspot strip (DOM) so OrbitControls never fight bag clicks. */
function SceneJumpBags() {
  const bags: Array<{ key: string; label: string; color: string; position: [number, number, number]; rotation: number }> = [
    { key: 'airway', label: 'A', color: '#f59e0b', position: [1.35, 0, -1.05], rotation: 0.35 },
    { key: 'breathing', label: 'B', color: '#0ea5e9', position: [1.62, 0, -1.18], rotation: -0.15 },
    { key: 'circulation', label: 'C', color: '#f43f5e', position: [1.90, 0, -1.05], rotation: 0.45 },
  ];
  return (
    <group name="scene-jump-bags">
      {bags.map(bag => (
        <group key={bag.key} position={bag.position} rotation={[0, bag.rotation, 0]}>
          {/* Soft case body */}
          <mesh position={[0, 0.11, 0]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.34, 0.18, 0.22]} />
            <meshStandardMaterial color={bag.color} roughness={0.72} metalness={0.08} />
          </mesh>
          {/* Lid seam */}
          <mesh position={[0, 0.205, 0]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.34, 0.02, 0.22]} />
            <meshStandardMaterial color="#0f172a" roughness={0.55} metalness={0.15} />
          </mesh>
          {/* Carry handle */}
          <mesh position={[0, 0.255, 0]} raycast={NO_RAYCAST}>
            <torusGeometry args={[0.07, 0.012, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#1e293b" roughness={0.45} metalness={0.25} />
          </mesh>
          {/* Kit letter badge */}
          <mesh position={[0, 0.14, 0.112]} raycast={NO_RAYCAST}>
            <planeGeometry args={[0.08, 0.08]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.55} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function OxygenTank() {
  return (
    <group position={[1.55, 0, -0.6]}>
      <mesh position={[0, 0.31, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.075, 0.075, 0.62, 18]} />
        <meshStandardMaterial color="#0e7490" roughness={0.3} metalness={0.65} />
      </mesh>
      <mesh position={[0, 0.62, 0]} raycast={NO_RAYCAST}>
        <sphereGeometry args={[0.075, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.65} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.018, 0.018, 0.09, 10]} />
        <meshStandardMaterial color={PALETTE.steel} roughness={0.25} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.77, 0]} rotation={[0, 0, Math.PI / 2]} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.012, 0.012, 0.08, 8]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  );
}

function CrashCart() {
  return (
    <group position={[-1.55, 0, -0.5]} rotation={[0, 0.35, 0]}>
      <mesh position={[0, 0.47, 0]} castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.52, 0.78, 0.42]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.5} metalness={0.15} />
      </mesh>
      {/* Drawer faces + handles */}
      {[0.68, 0.5, 0.32, 0.14].map((y) => (
        <group key={`drawer-${y}`} position={[0, y, 0.215]}>
          <mesh raycast={NO_RAYCAST}>
            <boxGeometry args={[0.46, 0.14, 0.015]} />
            <meshStandardMaterial color="#dc2626" roughness={0.45} metalness={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.015]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.3, 0.02, 0.015]} />
            <meshStandardMaterial color={PALETTE.steel} {...steelProps()} />
          </mesh>
        </group>
      ))}
      {/* Top tray rim */}
      <mesh position={[0, 0.88, 0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.54, 0.03, 0.44]} />
        <meshStandardMaterial color={PALETTE.steel} {...steelProps()} />
      </mesh>
      {([[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.15], [0.2, 0.15]] as const).map(([x, z]) => (
        <mesh key={`wheel-${x}-${z}`} position={[x, 0.035, z]} rotation={[0, 0, Math.PI / 2]} raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.035, 0.035, 0.025, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.55} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Lighting — surgical key spot (shadow-casting), cool window rim, warm fill.
// ---------------------------------------------------------------------------
function BayLighting({ shadowsEnabled }: { shadowsEnabled: boolean }) {
  const lampTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0.45, 0);
    return o;
  }, []);
  return (
    <group>
      <primitive object={lampTarget} />
      {/* Surgical key light. Warm, tight, and the only shadow caster —
          the patient mesh already sets castShadow (BodyMesh). */}
      <spotLight
        position={[0.25, 2.6, 0.3]}
        target={lampTarget}
        angle={0.55}
        penumbra={0.7}
        intensity={8}
        distance={8}
        decay={2}
        color="#fff0dd"
        castShadow={shadowsEnabled}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
      {/* Cool rim from the window — silhouette separation on the far side. */}
      <pointLight position={[-1.85, 1.45, 0.55]} intensity={3.5} distance={6} decay={2} color="#bcd7ff" />
      {/* Low warm fill from the camera side so shadow sides never go dead. */}
      <pointLight position={[1.2, 1.0, 1.5]} intensity={1.1} distance={4.5} decay={2} color="#ffd9b0" />
      {/* Equipment glow accents (carried over from the old bay). */}
      <pointLight position={[1.3, 1.2, 0.7]} intensity={0.5} distance={2.2} decay={2} color={PALETTE.screenGlow} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Dust motes drifting through the key-light beam. ~140 points, positions
// mutated in place — trivial per-frame cost, huge atmosphere payoff.
// ---------------------------------------------------------------------------
const DUST_COUNT = 140;
const DUST_HEIGHT = 2.1;

function DustMotes() {
  const pointsRef = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const base = new Float32Array(DUST_COUNT * 3);
    const seed = new Float32Array(DUST_COUNT * 2); // phase, fall speed
    for (let i = 0; i < DUST_COUNT; i++) {
      base[i * 3] = 0.25 + (Math.random() - 0.5) * 1.7;
      base[i * 3 + 1] = 0.15 + Math.random() * DUST_HEIGHT;
      base[i * 3 + 2] = 0.3 + (Math.random() - 0.5) * 1.7;
      seed[i * 2] = Math.random() * Math.PI * 2;
      seed[i * 2 + 1] = 0.015 + Math.random() * 0.04;
    }
    return { base, seed, positions: base.slice() };
  }, []);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (!points) return;
    const attr = points.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = clock.elapsedTime;
    const { base, seed } = data;
    for (let i = 0; i < DUST_COUNT; i++) {
      const phase = seed[i * 2];
      const fall = seed[i * 2 + 1];
      // Slow settle with wrap-around, plus a lazy horizontal waft.
      const y = base[i * 3 + 1] - t * fall;
      arr[i * 3 + 1] = 0.15 + ((y % DUST_HEIGHT) + DUST_HEIGHT) % DUST_HEIGHT;
      arr[i * 3] = base[i * 3] + Math.sin(t * 0.3 + phase) * 0.05;
      arr[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.22 + phase) * 0.04;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} raycast={NO_RAYCAST}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.013}
        sizeAttenuation
        color="#ffedd5"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Soft grounding shadow — a radial-gradient disc under the patient. Softer
// and cheaper than pushing ContactShadows resolution up; the two layer.
// ---------------------------------------------------------------------------
function SoftGroundShadow() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(128, 128, 12, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(0,0,0,0.5)');
      gradient.addColorStop(0.55, 'rgba(0,0,0,0.22)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, -0.045, 0.02]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
      <planeGeometry args={[3.2, 1.6]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Public: the composed environment.
// ---------------------------------------------------------------------------
export function TreatmentBayEnvironment({
  hideOverhead = false,
  patientSupportSurface = 'stretcher',
  showPatientSeat = false,
  patientSeated = false,
  patientSeatKind = null,
  shadowsEnabled = true,
  variant = 'clinic',
  sceneProfile,
}: {
  hideOverhead?: boolean;
  patientSupportSurface?: PatientSupportSurface;
  showPatientSeat?: boolean;
  patientSeated?: boolean;
  patientSeatKind?: PatientSeatKind;
  shadowsEnabled?: boolean;
  variant?: EnvironmentVariant;
  sceneProfile?: SceneProfile;
}) {
  const isClinic = variant === 'clinic';
  return (
    <group>
      {/* Scene shell + lighting swap per variant: non-clinic variants replace
          the room box entirely so outdoor/home/public scenes don't render
          hospital walls behind the scene. */}
      {isClinic ? (
        <>
          <Room hideOverhead={hideOverhead} />
          <BayLighting shadowsEnabled={shadowsEnabled} />
        </>
      ) : (
        <SceneVariantEnvironment
          variant={variant}
          hideOverhead={hideOverhead}
          shadowsEnabled={shadowsEnabled}
          showPatientSeat={showPatientSeat}
          patientSeatKind={patientSeatKind}
          sceneProfile={sceneProfile}
        />
      )}
      {/* Arrival scenes hide the trolley until the crew loads the patient —
          including outdoor variants, otherwise stretcher-load is invisible. */}
      {patientSupportSurface === 'stretcher' && <Stretcher />}
      {/* Home/public/heat and road scenes author their own seating. Other
          locations still need a support under a seated patient's pelvis. */}
      {showPatientSeat && (isClinic || variant === 'industrial' || variant === 'fire' || variant === 'water') && (
        <ClinicalPatientSeat kind={patientSeatKind ?? 'desk'} />
      )}
      {(patientSupportSurface === 'bed' || patientSupportSurface === 'sofa') && (
        <ScenePatientSupport kind={patientSupportSurface} seated={patientSeated} />
      )}
      {/* Medical equipment is brought by the paramedic in every scene, but the
          red crash cart and O2 tank belong inside a bay — hide them for
          outdoor roadside variants so the wrecked car + motorcycle aren't visually
          buried under clinic furniture. */}
      {isClinic ? <MonitorStand /> : <PortableMonitor />}
      {/* Crew jump bags — always on scene so clinicians can spot gear before
          opening the Treat rail kit panel (FIND EQUIPMENT path). */}
      <SceneJumpBags />
      {isClinic && (
        <>
          <OxygenTank />
          <CrashCart />
        </>
      )}
      {!isResp001VillaProfile(sceneProfile) && <DustMotes />}
      <SoftGroundShadow />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Camera entrance — easing into the bay with a slight dutch tilt instead of
// snapping to the preset. Runs once each time the bay presentation activates;
// any pointer interaction cancels it instantly (the student always wins).
// ---------------------------------------------------------------------------
interface EntranceControls {
  object: THREE.Camera & { up: THREE.Vector3; position: THREE.Vector3 };
  target: THREE.Vector3;
  update: () => void;
}

const ENTRANCE_MS = 1500;
const DUTCH_TILT_RAD = 0.07; // ~4 degrees of roll, eased out to level
const SCENE_ENTRANCE_MS = ENTRANCE_MS * 2.2;

export function CameraEntrance({
  active,
  once = false,
  focus,
  controlsRef,
  origin,
}: {
  active: boolean;
  /** Keep case-specific bedside/exam changes from replaying the doorway dolly. */
  once?: boolean;
  focus: { pos: [number, number, number]; target: [number, number, number] };
  controlsRef: React.RefObject<EntranceControls | null>;
  origin?: [number, number, number];
}) {
  const gl = useThree((s) => s.gl);
  const hasEntered = useRef(false);
  const focusRef = useRef(focus);
  focusRef.current = focus;
  const originRef = useRef<[number, number, number] | null>(null);
  originRef.current = origin ?? null;

  useEffect(() => {
    if (!active) return;
    if (once && hasEntered.current) return;
    let raf = 0;
    let cancelled = false;
    const start = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const finish = (controls: EntranceControls) => {
      controls.object.up.set(0, 1, 0);
      controls.update();
      // Rack focus lands on the resting portrait focus with the camera.
      resetFocusRig();
    };

    const cancel = () => {
      if (cancelled) return;
      cancelled = true;
      cancelAnimationFrame(raf);
      const controls = controlsRef.current;
      if (controls) finish(controls);
    };

    const step = () => {
      if (cancelled) return;
      const controls = controlsRef.current;
      if (!controls) {
        raf = requestAnimationFrame(step);
        return;
      }
      hasEntered.current = true;
      const { pos, target } = focusRef.current;
      const origin = originRef.current;
      const duration = origin ? SCENE_ENTRANCE_MS : ENTRANCE_MS;
      const rawT = Math.min((performance.now() - start) / duration, 1);
      const t = easeOutCubic(rawT);
      // Rack focus (Phase D2): start with a deep, soft doorway focus and pull
      // down onto the patient as the camera settles. Written into the shared
      // focusRig; DofDriver in the composer flushes it to the DoF uniforms
      // every render frame. When the composer is unmounted (degraded tier)
      // these writes are harmlessly unread.
      focusRig.worldDistance = FOCUS_WIDE.worldDistance + (FOCUS_REST.worldDistance - FOCUS_WIDE.worldDistance) * t;
      focusRig.range = FOCUS_WIDE.range + (FOCUS_REST.range - FOCUS_WIDE.range) * t;
      focusRig.bokehScale = FOCUS_WIDE.bokehScale + (FOCUS_REST.bokehScale - FOCUS_WIDE.bokehScale) * t;
      if (origin) {
        // Full scene-entry dolly: start outside the room at `origin`, looking
        // at the patient the whole way, glide onto the resting preset.
        controls.object.position.lerpVectors(
          new THREE.Vector3(...origin),
          new THREE.Vector3(pos[0], pos[1], pos[2]),
          t,
        );
        controls.target.set(target[0], target[1], target[2]);
      } else {
        // Start pulled back and slightly high, ease down onto the preset.
        const pullback = 1 + 0.3 * (1 - t);
        controls.object.position.set(
          target[0] + (pos[0] - target[0]) * pullback,
          pos[1] + 0.35 * (1 - t) + (pos[1] - target[1]) * (pullback - 1),
          target[2] + (pos[2] - target[2]) * pullback,
        );
        controls.target.set(target[0], target[1], target[2]);
      }
      // Dutch tilt: roll the up-vector, easing back to vertical.
      const roll = DUTCH_TILT_RAD * (1 - t);
      controls.object.up.set(Math.sin(roll), Math.cos(roll), 0);
      controls.update();
      if (rawT < 1) {
        raf = requestAnimationFrame(step);
      } else {
        finish(controls);
        cancelled = true;
      }
    };

    raf = requestAnimationFrame(step);
    const dom = gl.domElement;
    dom.addEventListener('pointerdown', cancel);
    return () => {
      dom.removeEventListener('pointerdown', cancel);
      cancel();
    };
    // `origin` is commonly supplied as a tuple literal. Depending on its
    // object identity restarted this effect on every parent render, sending
    // the camera back to the doorway over and over while live vitals changed.
    // originRef already carries the latest coordinates without restarting the
    // entrance; only an actual active-state transition should replay it.
  }, [active, controlsRef, gl, once]);

  return null;
}
