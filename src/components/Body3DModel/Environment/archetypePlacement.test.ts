import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { applyArchetypePlacement } from './archetypePlacement';

function boxMesh(name: string, size: [number, number, number], position: [number, number, number]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size));
  mesh.name = name;
  mesh.position.set(...position);
  return mesh;
}

describe('applyArchetypePlacement', () => {
  it('zeros a rolled parent quaternion then snaps its mesh to y=0', () => {
    const root = new THREE.Group();
    const parent = new THREE.Group();
    parent.name = 'CarSedan01';
    parent.position.set(2.5, 1.2, 0);
    parent.quaternion.set(0, 0, Math.SQRT1_2, Math.SQRT1_2);
    const body = boxMesh('car_sedan_01', [1.2, 0.96, 3.0], [3, 0.48, 1]);
    parent.add(body);
    root.add(parent);

    applyArchetypePlacement(root, {
      unrollNodeNames: ['CarSedan01'],
      groundNodePrefixes: ['CarSedan01'],
      rootOffset: [-4.2, 0, -1.6],
    });

    expect(parent.quaternion.z).toBeCloseTo(0, 5);
    expect(parent.quaternion.w).toBeCloseTo(1, 5);
    expect(root.position.x).toBeCloseTo(-4.2, 5);
    expect(root.position.z).toBeCloseTo(-1.6, 5);

    const box = new THREE.Box3().setFromObject(body);
    expect(box.min.y).toBeCloseTo(0, 2);
    expect(box.max.y).toBeGreaterThan(0.5);
  });

  it('drops a floating bed parent onto the floor without moving the desk', () => {
    const root = new THREE.Group();
    const bed = new THREE.Group();
    bed.name = 'IntBed01';
    const mattress = boxMesh('int_bed_01', [1.4, 1.1, 2.1], [0.7, 1.1, 1.05]);
    bed.add(mattress);
    const desk = boxMesh('StudentDesk', [1, 0.05, 0.5], [-1.1, 0.375, 1.1]);
    root.add(bed, desk);

    applyArchetypePlacement(root, {
      groundNodePrefixes: ['IntBed01'],
      nodeOffsets: { IntBed01: [-0.7, 0, -1.58] },
    });

    const bedBox = new THREE.Box3().setFromObject(mattress);
    const deskBox = new THREE.Box3().setFromObject(desk);
    expect(bedBox.min.y).toBeCloseTo(0, 2);
    expect(deskBox.min.y).toBeCloseTo(0.35, 2);
    expect(bed.position.x).toBeCloseTo(-0.7, 2);
    expect(bed.position.z).toBeCloseTo(-1.58, 2);
  });
});
