import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { kenneyChairPlant, KENNEY_CHAIR_NATIVE, type KenneyChairKind } from '@/lib/kenneyChairPlant';

const NO_RAYCAST = () => null;

/**
 * A seated patient is never perfectly still — they shift their weight, and a
 * chair that never moves reads as a prop someone forgot to animate. One
 * useFrame drives every chair in the scene from a single loop (the chair is
 * a 12 k-vert mesh; 24 of them at 60 fps is fine, but three chairs across
 * home/public/heat still cost one loop, not three). The rock is tiny: ±0.035
 * rad of roll and ±8 mm of sway, phased off the chair's name so two chairs in
 * the same room never rock in lock.
 */
function ChairIdle({ name, children }: { name: string; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  // Deterministic phase from the name so the motion is stable across remounts
  // and two chairs in one scene desync without a shared clock seed.
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const phase = (h % 1000) / 1000 * Math.PI * 2;
  const hz = 0.28 + (h % 7) * 0.02; // 0.28–0.40 Hz — a weight shift, not a fidget
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const rock = Math.sin(t * hz * Math.PI * 2 + phase) * 0.035;
    const sway = Math.cos(t * hz * Math.PI * 2 * 0.5 + phase) * 0.008;
    g.rotation.z = rock;
    // Sway is additive on the authored plant position, which the child
    // primitive carries. Never overwrite position here or the chair drifts
    // off the seated patient's pelvis.
    g.position.x = sway;
  });
  return <group ref={ref}>{children}</group>;
}

/**
 * License-clean Kenney CC0 chair, scaled and recentred onto the seated
 * patient plant. Corner-origin GLBs would otherwise read as a tiny crate
 * sitting beside the patient.
 */
export function KenneyPatientChair({
  kind,
  name,
  idle = true,
  finish = 'default',
}: {
  kind: KenneyChairKind;
  name: string;
  /** A chair under a conscious patient rocks with their weight shift. */
  idle?: boolean;
  /** Industrial scenes use a neutral metal finish, not the office chair pink. */
  finish?: 'default' | 'industrial';
}) {
  const plant = kenneyChairPlant(kind);
  const { scene } = useGLTF(plant.url);
  const clone = useMemo(() => {
    const next = scene.clone(true);
    next.traverse(object => {
      object.raycast = NO_RAYCAST;
      object.castShadow = true;
      object.receiveShadow = true;
      if (finish === 'industrial' && object instanceof THREE.Mesh) {
        const tint = (material: THREE.Material) => {
          const copy = material.clone();
          if (copy instanceof THREE.MeshStandardMaterial) copy.color.set('#47545a');
          return copy;
        };
        object.material = Array.isArray(object.material)
          ? object.material.map(tint)
          : tint(object.material);
      }
    });
    return next;
  }, [scene, finish]);
  const chair = (
    <primitive name={name} object={clone} position={plant.position} scale={plant.scale} />
  );
  return idle ? <ChairIdle name={name}>{chair}</ChairIdle> : chair;
}

(Object.values(KENNEY_CHAIR_NATIVE) as Array<(typeof KENNEY_CHAIR_NATIVE)[KenneyChairKind]>).forEach(entry => {
  useGLTF.preload(entry.url);
});
