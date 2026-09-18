import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { applyArchetypePlacement } from './archetypePlacement';
import { archetypeMeshVisible, type SceneArchetypeEntry } from './sceneRegistry';

const NO_RAYCAST = () => null;

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
 * Generic GLB dressing for Higgsfield / Blender archetype scenes.
 * Filters mesh names so room shells do not double the shared bay environment.
 */
export function ArchetypeSceneDressing({
  entry,
  shadowsEnabled,
}: {
  entry: SceneArchetypeEntry;
  shadowsEnabled: boolean;
}) {
  const { scene } = useGLTF(entry.glbUrl);
  const dressing = useMemo(() => {
    const clone = scene.clone(true);
    clone.name = `archetype-${entry.profile}`;
    clone.traverse(object => {
      object.raycast = NO_RAYCAST;
      if (object instanceof THREE.Mesh) {
        object.visible = archetypeMeshVisible(ancestorNames(object), entry);
        object.castShadow = shadowsEnabled;
        object.receiveShadow = true;
      }
    });
    applyArchetypePlacement(clone, entry);
    return clone;
  }, [scene, entry, shadowsEnabled]);

  return <primitive object={dressing} />;
}

export function preloadArchetypeScenes(entries: readonly SceneArchetypeEntry[] = []): void {
  for (const entry of entries) {
    useGLTF.preload(entry.glbUrl);
  }
}
