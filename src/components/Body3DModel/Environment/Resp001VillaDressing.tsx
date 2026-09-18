import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { archetypeMeshVisible, resp001VillaMeshVisible, SCENE_ARCHETYPES } from './sceneProfile';
import { extractSceneAnchors, type SceneAnchorSet } from '@/lib/sceneAnchors';

const VILLA_DRESSING_URL = '/models/scenes/resp-001-villa-dressing.glb';
const NO_RAYCAST = () => null;
const RESP001_ENTRY = SCENE_ARCHETYPES.find(entry => entry.profile === 'resp-001-villa')!;

function ancestorNames(object: THREE.Object3D): string[] {
  const names: string[] = [];
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current.name) names.push(current.name);
    current = current.parent;
  }
  return names;
}

/**
 * Case-specific furniture and narrative dressing for severe asthma.
 *
 * The asset is authored at room scale in Blender. It includes a padded chair
 * at the shared seat plant but excludes the room shell, so floor registration,
 * orbit bounds and adaptive shadows remain under the shared environment. The
 * chair's named meshes hide when the patient moves to another support surface.
 *
 * Named empties (`PatientRestAnchor`, `KitStagingAnchor`, `FirstAidFindAnchor`)
 * are synthesised from live furniture when a Jutsu drop has not authored them.
 */
export function Resp001VillaDressing({
  shadowsEnabled,
  showPatientSeat,
  onAnchorsReady,
}: {
  shadowsEnabled: boolean;
  showPatientSeat: boolean;
  onAnchorsReady?: (anchors: SceneAnchorSet) => void;
}) {
  const { scene } = useGLTF(VILLA_DRESSING_URL);
  const dressing = useMemo(() => {
    const clone = scene.clone(true);
    clone.name = 'resp-001-villa-dressing';
    clone.traverse(object => {
      object.raycast = NO_RAYCAST;
      if (object instanceof THREE.Mesh) {
        const keepSeat = resp001VillaMeshVisible(object.name, showPatientSeat);
        const keepShell = archetypeMeshVisible(ancestorNames(object), RESP001_ENTRY);
        object.visible = keepSeat && keepShell;
        object.castShadow = shadowsEnabled;
        object.receiveShadow = true;
      }
    });
    return clone;
  }, [scene, shadowsEnabled, showPatientSeat]);

  const anchors = useMemo(() => extractSceneAnchors(dressing), [dressing]);

  useEffect(() => {
    onAnchorsReady?.(anchors);
  }, [anchors, onAnchorsReady]);

  return <primitive object={dressing} />;
}
