import * as THREE from 'three';
import type { SceneArchetypeEntry } from './sceneRegistry';

function nodeMatchesPrefix(name: string, prefix: string): boolean {
  return name === prefix || name.startsWith(prefix);
}

function subtreeVisibleMeshBox(root: THREE.Object3D): THREE.Box3 | null {
  const box = new THREE.Box3();
  let any = false;
  root.traverse(child => {
    if (!(child instanceof THREE.Mesh) || !child.visible) return;
    const meshBox = new THREE.Box3().setFromObject(child);
    if (!any) {
      box.copy(meshBox);
      any = true;
    } else {
      box.union(meshBox);
    }
  });
  return any ? box : null;
}

/**
 * Unroll exported-on-side catalog props, then snap named parents so their
 * visible mesh sits on the bay floor. Mutates `root` in place.
 */
export function applyArchetypePlacement(
  root: THREE.Object3D,
  entry: Pick<SceneArchetypeEntry, 'unrollNodeNames' | 'groundNodePrefixes' | 'rootOffset' | 'nodeOffsets'>,
): void {
  if (entry.rootOffset) {
    root.position.set(entry.rootOffset[0], entry.rootOffset[1], entry.rootOffset[2]);
  }

  if (entry.unrollNodeNames?.length) {
    const names = new Set(entry.unrollNodeNames);
    root.traverse(object => {
      if (!names.has(object.name)) return;
      object.quaternion.identity();
      object.rotation.set(0, 0, 0);
    });
  }

  root.updateMatrixWorld(true);

  const prefixes = entry.groundNodePrefixes;
  if (!prefixes?.length) return;

  const targets: THREE.Object3D[] = [];
  root.traverse(object => {
    if (!object.name) return;
    if (prefixes.some(prefix => nodeMatchesPrefix(object.name, prefix))) {
      targets.push(object);
    }
  });

  for (const target of targets) {
    target.updateMatrixWorld(true);
    const box = subtreeVisibleMeshBox(target);
    if (!box || !Number.isFinite(box.min.y)) continue;
    const dy = -box.min.y;
    if (Math.abs(dy) < 1e-4) continue;
    target.position.y += dy;
    target.updateMatrixWorld(true);
  }

  const extras = entry.nodeOffsets;
  if (!extras) return;
  for (const [name, offset] of Object.entries(extras)) {
    const target = root.getObjectByName(name);
    if (!target) continue;
    target.position.x += offset[0];
    target.position.y += offset[1];
    target.position.z += offset[2];
    target.updateMatrixWorld(true);
  }
}
