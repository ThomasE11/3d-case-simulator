import * as THREE from 'three';

export type PilotRespiratoryMaskMode = 'nonrebreather' | 'nebulizer';
export type Point3 = [number, number, number];

export interface PilotRespiratoryMaskGeometrySpec {
  seal: Point3[];
  connector: Point3[];
  accessoryLink: Point3[];
  shellDepth: number;
  accessory: 'reservoir' | 'medication-cup';
  faceCentreY: number;
  strapAnchors: [Point3, Point3];
}

export function pilotRespiratoryMaskGeometry(mode: PilotRespiratoryMaskMode, width: number, height: number, tubeExitOffset: Point3): PilotRespiratoryMaskGeometrySpec {
  // The source image height includes the reservoir/cup. Its face-contact mask
  // occupies only the upper ~40%, centred roughly one quarter-image above the
  // asset origin. Use those observed boundaries instead of fitting the whole
  // photographed silhouette over the patient's face.
  // The two photographed assets have different origins. Match both face
  // pieces at clinical Y=1.63 rather than seating the nebuliser 19mm lower.
  const faceCentreY = height * (mode === 'nonrebreather' ? 0.25 : 1 / 3);
  const faceWidth = width * (mode === 'nonrebreather' ? 0.74 : 0.68);
  const faceHeight = height * (mode === 'nonrebreather' ? 0.40 : 0.42);
  const halfW = faceWidth * 0.5;
  const halfH = faceHeight * 0.5;
  const knots = [
    new THREE.Vector3(0, faceCentreY + halfH, 0.004),
    new THREE.Vector3(-halfW * 0.78, faceCentreY + halfH * 0.62, 0.004),
    new THREE.Vector3(-halfW, faceCentreY + halfH * 0.06, 0.004),
    new THREE.Vector3(-halfW * 0.54, faceCentreY - halfH * 0.72, 0.004),
    new THREE.Vector3(0, faceCentreY - halfH, 0.004),
    new THREE.Vector3(halfW * 0.54, faceCentreY - halfH * 0.72, 0.004),
    new THREE.Vector3(halfW, faceCentreY + halfH * 0.06, 0.004),
    new THREE.Vector3(halfW * 0.78, faceCentreY + halfH * 0.62, 0.004),
  ];
  const sealCurve = new THREE.CatmullRomCurve3(knots, true, 'centripetal');
  const seal: Point3[] = Array.from({ length: 48 }, (_, index) => sealCurve.getPoint(index / 48).toArray() as Point3);
  const leftAnchor = seal.reduce((left, point) => point[0] < left[0] ? point : left, seal[0]);
  const rightAnchor = seal.reduce((right, point) => point[0] > right[0] ? point : right, seal[0]);
  const strapAnchors: [Point3, Point3] = [[...leftAnchor], [...rightAnchor]];
  const shellDepth = mode === 'nonrebreather' ? 0.058 : 0.052;
  // Mount hardware on the lowest vertex of the front shell ring. Independent
  // width/height guesses left the elbow floating below the tapered shell.
  const bottomSeal = seal.reduce((bottom, point) => point[1] < bottom[1] ? point : bottom, seal[0]);
  const outlet: Point3 = [bottomSeal[0] * .30, (bottomSeal[1] - faceCentreY) * .30 + faceCentreY, bottomSeal[2] + shellDepth];
  if (mode === 'nonrebreather') {
    return {
      seal, shellDepth, faceCentreY, strapAnchors, accessory: 'reservoir',
      accessoryLink: [outlet, [-width * 0.035, height * 0.09, shellDepth + 0.004], [-width * 0.035, height * 0.07, 0.049]],
      connector: [outlet, [width * 0.28, height * 0.02, shellDepth + 0.01], [...tubeExitOffset]],
    };
  }
  const cupTop: Point3 = [width * 0.04, -height * 0.03, 0.062];
  const cupBottom: Point3 = [width * 0.04, -height * 0.27, 0.062];
  return {
    seal, shellDepth, faceCentreY, strapAnchors, accessory: 'medication-cup',
    accessoryLink: [outlet, [width * 0.13, height * 0.05, shellDepth + 0.012], cupTop],
    connector: [cupBottom, [width * 0.15, -height * 0.32, 0.07], [...tubeExitOffset]],
  };
}

/** Ruled teardrop shell whose skin edge is the exact seal loop. */
export function createPilotMaskShellGeometry(spec: PilotRespiratoryMaskGeometrySpec): THREE.BufferGeometry {
  const scales = [1, 0.72, 0.30];
  const depths = [0, spec.shellDepth * 0.58, spec.shellDepth];
  const positions: number[] = [];
  for (let ring = 0; ring < scales.length; ring++) {
    for (const [x, y, z] of spec.seal) positions.push(
      x * scales[ring],
      (y - spec.faceCentreY) * scales[ring] + spec.faceCentreY,
      z + depths[ring],
    );
  }
  const count = spec.seal.length;
  const indices: number[] = [];
  for (let ring = 0; ring < scales.length - 1; ring++) {
    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      const a = ring * count + i;
      const b = ring * count + next;
      const c = (ring + 1) * count + next;
      const d = (ring + 1) * count + i;
      indices.push(a, b, c, a, c, d);
    }
  }
  const frontCentre = positions.length / 3;
  positions.push(0, spec.faceCentreY, spec.shellDepth + 0.005);
  const frontStart = (scales.length - 1) * count;
  for (let i = 0; i < count; i++) indices.push(frontStart + i, frontStart + ((i + 1) % count), frontCentre);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  return geometry;
}

export function createPilotReservoirGeometry(width: number, height: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  // A reservoir should hang below the chin without reading as a second torso.
  // The first volume used 54% of the full mask width and 46% of its source
  // image height, which made a 600–1000 mL bag look adult-head sized in a
  // face close-up. These dimensions preserve a visibly pre-inflated belly
  // while keeping the bag materially smaller than the fitted face interface.
  const w = width * 0.22;
  const h = height * 0.18;
  shape.moveTo(-w * 0.72, h);
  shape.quadraticCurveTo(-w, h * 0.72, -w, 0);
  shape.quadraticCurveTo(-w, -h, 0, -h);
  shape.quadraticCurveTo(w, -h, w, 0);
  shape.quadraticCurveTo(w, h * 0.72, w * 0.72, h);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.020,
    bevelEnabled: true,
    bevelSize: 0.003,
    bevelThickness: 0.004,
    bevelSegments: 3,
    curveSegments: 12,
  });
  geometry.center();
  geometry.computeBoundingBox();
  return geometry;
}
