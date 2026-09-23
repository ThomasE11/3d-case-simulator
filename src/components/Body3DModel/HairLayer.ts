import * as THREE from 'three';
import { hairHexFor, type HairStyleId, type PatientAppearance } from '@/lib/patientAppearance';

type PatientGender = 'male' | 'female' | undefined;

function hairColour(gender: PatientGender, age?: number, appearance?: PatientAppearance | null): THREE.Color {
  if (appearance) return new THREE.Color(hairHexFor(appearance.hairColour));
  if ((age ?? 35) >= 70) return new THREE.Color('#8a857e');
  if ((age ?? 35) >= 55) return new THREE.Color('#5d554e');
  return new THREE.Color(gender === 'female' ? '#30231f' : '#29211d');
}

function attachBodyDeformation(
  mesh: THREE.Mesh,
  geometry: THREE.BufferGeometry,
  body: THREE.Mesh,
  sourceVertexForTarget: number[],
): THREE.Mesh {
  const bodyGeometry = body.geometry as THREE.BufferGeometry;
  const bodyPositions = bodyGeometry.getAttribute('position') as THREE.BufferAttribute;
  const bodySkinIndex = bodyGeometry.getAttribute('skinIndex') as THREE.BufferAttribute | undefined;
  const bodySkinWeight = bodyGeometry.getAttribute('skinWeight') as THREE.BufferAttribute | undefined;
  const skinnedBody = body as THREE.SkinnedMesh;

  if (skinnedBody.isSkinnedMesh && bodySkinIndex && bodySkinWeight) {
    const skinIndex = new Uint16Array(sourceVertexForTarget.length * 4);
    const skinWeight = new Float32Array(sourceVertexForTarget.length * 4);
    sourceVertexForTarget.forEach((source, target) => {
      skinIndex[target * 4] = bodySkinIndex.getX(source);
      skinIndex[target * 4 + 1] = bodySkinIndex.getY(source);
      skinIndex[target * 4 + 2] = bodySkinIndex.getZ(source);
      skinIndex[target * 4 + 3] = bodySkinIndex.getW(source);
      skinWeight[target * 4] = bodySkinWeight.getX(source);
      skinWeight[target * 4 + 1] = bodySkinWeight.getY(source);
      skinWeight[target * 4 + 2] = bodySkinWeight.getZ(source);
      skinWeight[target * 4 + 3] = bodySkinWeight.getW(source);
    });
    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));
  }

  const bodyMorphs = bodyGeometry.morphAttributes.position ?? [];
  const targetPositions = geometry.getAttribute('position') as THREE.BufferAttribute;
  if (bodyMorphs.length) {
    geometry.morphTargetsRelative = bodyGeometry.morphTargetsRelative;
    geometry.morphAttributes.position = bodyMorphs.map((morph) => {
      const values = new Float32Array(sourceVertexForTarget.length * 3);
      sourceVertexForTarget.forEach((source, target) => {
        if (bodyGeometry.morphTargetsRelative) {
          values[target * 3] = morph.getX(source);
          values[target * 3 + 1] = morph.getY(source);
          values[target * 3 + 2] = morph.getZ(source);
        } else {
          values[target * 3] = targetPositions.getX(target) + morph.getX(source) - bodyPositions.getX(source);
          values[target * 3 + 1] = targetPositions.getY(target) + morph.getY(source) - bodyPositions.getY(source);
          values[target * 3 + 2] = targetPositions.getZ(target) + morph.getZ(source) - bodyPositions.getZ(source);
        }
      });
      return new THREE.BufferAttribute(values, 3);
    });
  }

  let result = mesh;
  if (skinnedBody.isSkinnedMesh && geometry.getAttribute('skinIndex') && geometry.getAttribute('skinWeight')) {
    result = new THREE.SkinnedMesh(geometry, mesh.material);
    (result as THREE.SkinnedMesh).bindMode = skinnedBody.bindMode;
    (result as THREE.SkinnedMesh).bind(skinnedBody.skeleton, skinnedBody.bindMatrix);
  }

  if (body.morphTargetDictionary && bodyMorphs.length) {
    result.morphTargetDictionary = { ...body.morphTargetDictionary };
    result.morphTargetInfluences = new Array(bodyMorphs.length).fill(0);
    result.onBeforeRender = () => {
      const source = body.morphTargetInfluences;
      const target = result.morphTargetInfluences;
      if (!source || !target) return;
      for (let i = 0; i < target.length; i++) target[i] = source[i] ?? 0;
    };
  }

  return result;
}


/**
 * Simple cloth head cover for patients whose cultural dress includes a hijab.
 * Reads as a soft cap + shoulder drape derived from the head surface scale —
 * not a fashion mesh, but unmistakably not a bald mannequin.
 */
function buildHijab(body: THREE.Mesh, appearance?: PatientAppearance | null): THREE.Mesh | null {
  const source = body.geometry as THREE.BufferGeometry;
  const positions = source.getAttribute('position') as THREE.BufferAttribute | undefined;
  if (!positions) return null;
  let minY = Infinity, maxY = -Infinity, maxR = 0;
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    const r = Math.hypot(positions.getX(i), positions.getZ(i));
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    if (y > minY + (maxY - minY) * 0.8) maxR = Math.max(maxR, r);
  }
  const height = maxY - minY;
  if (!Number.isFinite(height) || height <= 0) return null;
  const headY = minY + height * 0.9;
  const radius = Math.max(0.08, maxR * 1.12);
  const colour = new THREE.Color(hairHexFor(appearance?.hairColour ?? 'black')).multiplyScalar(1.15);
  const mat = new THREE.MeshStandardMaterial({ color: colour, roughness: 0.92, metalness: 0 });
  const geo = new THREE.SphereGeometry(radius, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.62);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'patient-hijab';
  mesh.position.set(0, headY - radius * 0.15, 0);
  mesh.scale.set(1.05, 1.0, 1.15);
  return mesh;
}

function buildScalp(body: THREE.Mesh, colour: THREE.Color, gender: PatientGender, style: HairStyleId = 'short'): THREE.Mesh | null {
  // Coverage: bald = brows only (caller skips scalp), short = tight cap,
  // long/medium/curly = fuller sides. Used to bias the hairline threshold.
  const coverage = style === 'bald' ? 0 : style === 'short' ? 0.86 : style === 'curly' ? 0.8 : 0.82;
  const source = body.geometry as THREE.BufferGeometry;
  const positions = source.getAttribute('position') as THREE.BufferAttribute | undefined;
  if (!positions) return null;
  const index = source.index;
  const triangleCount = (index ? index.count : positions.count) / 3;
  const vertexAt = (triangle: number, corner: number) => (
    index ? index.getX(triangle * 3 + corner) : triangle * 3 + corner
  );

  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < positions.count; i++) {
    minY = Math.min(minY, positions.getY(i));
    maxY = Math.max(maxY, positions.getY(i));
  }
  const height = maxY - minY;
  if (!Number.isFinite(height) || height <= 0) return null;

  // Measure depth only across the head. The forehead gets a slightly higher
  // hairline than the crown/back, avoiding a horizontal helmet rim while the
  // female variant retains a little more side coverage.
  let headMinZ = Infinity;
  let headMaxZ = -Infinity;
  for (let i = 0; i < positions.count; i++) {
    if (positions.getY(i) < minY + height * coverage) continue;
    headMinZ = Math.min(headMinZ, positions.getZ(i));
    headMaxZ = Math.max(headMaxZ, positions.getZ(i));
  }
  const headDepth = Math.max(0.001, headMaxZ - headMinZ);
  const keep = new Uint8Array(positions.count);
  for (let i = 0; i < positions.count; i++) {
    const depth = (positions.getZ(i) - headMinZ) / headDepth;
    // On the active MPFB shell the orbital line is ~0.90 body height and the
    // anatomical forehead hairline is ~0.94-0.97. Starting at 0.89 covered the
    // eyes like a mask; keep the cap entirely on the scalp, with a slightly
    // lower/rounder female hairline and modest male frontal recession.
    const base = gender === 'female' ? 0.925 : 0.94;
    const frontRecession = gender === 'female' ? 0.024 : 0.027;
    const cutoff = minY + height * (base + Math.max(0, depth) * frontRecession);
    if (positions.getY(i) >= cutoff) keep[i] = 1;
  }

  const retained: number[] = [];
  for (let triangle = 0; triangle < triangleCount; triangle++) {
    const a = vertexAt(triangle, 0);
    const b = vertexAt(triangle, 1);
    const c = vertexAt(triangle, 2);
    if (keep[a] && keep[b] && keep[c]) retained.push(a, b, c);
  }
  if (retained.length < 120) return null;

  const remap = new Map<number, number>();
  const indices = new Uint32Array(retained.length);
  for (let i = 0; i < retained.length; i++) {
    const original = retained[i];
    let target = remap.get(original);
    if (target === undefined) {
      target = remap.size;
      remap.set(original, target);
    }
    indices[i] = target;
  }

  const points = new Float32Array(remap.size * 3);
  const sourceForTarget = new Array<number>(remap.size);
  remap.forEach((target, original) => {
    points[target * 3] = positions.getX(original);
    points[target * 3 + 1] = positions.getY(original);
    points[target * 3 + 2] = positions.getZ(original);
    sourceForTarget[target] = original;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  const sourceNormals = source.getAttribute('normal') as THREE.BufferAttribute | undefined;
  if (sourceNormals) {
    const copiedNormals = new Float32Array(remap.size * 3);
    sourceForTarget.forEach((original, target) => {
      copiedNormals[target * 3] = sourceNormals.getX(original);
      copiedNormals[target * 3 + 1] = sourceNormals.getY(original);
      copiedNormals[target * 3 + 2] = sourceNormals.getZ(original);
    });
    geometry.setAttribute('normal', new THREE.BufferAttribute(copiedNormals, 3));
  } else {
    geometry.computeVertexNormals();
  }
  const normals = geometry.getAttribute('normal') as THREE.BufferAttribute;
  const clearance = height * 0.0025;
  for (let i = 0; i < remap.size; i++) {
    // Position-derived noise gives UV-seam duplicates the same displacement;
    // index-derived jitter pulled duplicate crown vertices apart into a bright
    // vertical crack.
    const strandNoise = (Math.sin(
      points[i * 3] * 127.1 + points[i * 3 + 1] * 311.7 + points[i * 3 + 2] * 74.7,
    ) * 43758.5453) % 1;
    const lift = clearance * (0.9 + Math.abs(strandNoise) * 0.35);
    points[i * 3] += normals.getX(i) * lift;
    points[i * 3 + 1] += normals.getY(i) * lift;
    points[i * 3 + 2] += normals.getZ(i) * lift;
  }
  (geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;

  const vertexColours = new Float32Array(remap.size * 3);
  for (let i = 0; i < remap.size; i++) {
    const variation = 0.78 + 0.2 * Math.abs(Math.sin(i * 2.417));
    vertexColours[i * 3] = colour.r * variation;
    vertexColours[i * 3 + 1] = colour.g * variation;
    vertexColours[i * 3 + 2] = colour.b * variation;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(vertexColours, 3));

  const material = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    vertexColors: true,
    roughness: 0.82,
    metalness: 0,
    sheen: 0.28,
    sheenRoughness: 0.82,
    sheenColor: colour.clone().multiplyScalar(1.25),
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  material.userData.skipRecolor = true;
  const mesh = attachBodyDeformation(new THREE.Mesh(geometry, material), geometry, body, sourceForTarget);
  mesh.name = 'patient-hair';
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.raycast = () => {};
  mesh.userData.skipRecolor = true;
  return mesh;
}

function buildEyebrow(body: THREE.Mesh, colour: THREE.Color, side: -1 | 1): THREE.Mesh | null {
  const source = body.geometry as THREE.BufferGeometry;
  const positions = source.getAttribute('position') as THREE.BufferAttribute | undefined;
  if (!positions) return null;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < positions.count; i++) {
    minY = Math.min(minY, positions.getY(i));
    maxY = Math.max(maxY, positions.getY(i));
  }
  const height = maxY - minY;
  const scale = height / 1.8;
  // Orbital measurements on the shipped mesh put the brows at ~0.91 body
  // height. The previous 0.872 anchor landed below the eyes after the seated
  // posture morph and visibly read as two lines on the neck.
  const browY = minY + height * 0.94;
  const centreX = side * 0.036 * scale;
  const halfWidth = 0.02 * scale;

  const surfaceZ = (x: number, y: number) => {
    let best = -Infinity;
    let fallback = -Infinity;
    for (let i = 0; i < positions.count; i++) {
      const py = positions.getY(i);
      if (py < minY + height * 0.82) continue;
      fallback = Math.max(fallback, positions.getZ(i));
      if (Math.abs(positions.getX(i) - x) <= 0.01 * scale
        && Math.abs(py - y) <= 0.012 * scale) {
        best = Math.max(best, positions.getZ(i));
      }
    }
    return Number.isFinite(best) ? best : fallback;
  };

  const points = [
    new THREE.Vector3(centreX - halfWidth, browY - 0.002 * scale, 0),
    new THREE.Vector3(centreX, browY + 0.004 * scale, 0),
    new THREE.Vector3(centreX + halfWidth, browY, 0),
  ];
  for (const point of points) point.z = surfaceZ(point.x, point.y) + 0.003 * scale;
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, 10, 0.0011 * scale, 5, false);
  const browPositions = geometry.getAttribute('position') as THREE.BufferAttribute;

  // Nearest upper-face vertex supplies each generated point's exact skin and
  // morph deformation, so brows remain attached during seated/supine posture,
  // speech, gait and head movement rather than floating in front of the face.
  const candidates: number[] = [];
  for (let i = 0; i < positions.count; i++) {
    if (positions.getY(i) >= minY + height * 0.81) candidates.push(i);
  }
  const sourceForTarget = new Array<number>(browPositions.count);
  for (let target = 0; target < browPositions.count; target++) {
    let nearest = candidates[0] ?? 0;
    let distance = Infinity;
    for (const candidate of candidates) {
      const dx = positions.getX(candidate) - browPositions.getX(target);
      const dy = positions.getY(candidate) - browPositions.getY(target);
      const dz = positions.getZ(candidate) - browPositions.getZ(target);
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < distance) {
        distance = d2;
        nearest = candidate;
      }
    }
    sourceForTarget[target] = nearest;
  }

  const material = new THREE.MeshStandardMaterial({ color: colour, roughness: 0.9, metalness: 0 });
  material.userData.skipRecolor = true;
  const mesh = attachBodyDeformation(new THREE.Mesh(geometry, material), geometry, body, sourceForTarget);
  mesh.name = side > 0 ? 'patient-brow-left' : 'patient-brow-right';
  mesh.castShadow = true;
  mesh.raycast = () => {};
  mesh.userData.skipRecolor = true;
  return mesh;
}

/** Add body-derived hair and attached eyebrows without an independent rig. */
export function buildHairLayer(
  body: THREE.Mesh,
  gender: PatientGender,
  age?: number,
  appearance?: PatientAppearance | null,
): THREE.Group | null {
  const colour = hairColour(gender, age, appearance);
  const style: HairStyleId = appearance?.hairStyle ?? (gender === 'female' ? 'medium' : 'short');
  const scalp = style === 'hijab'
    ? buildHijab(body, appearance)
    : buildScalp(body, colour, gender, style);
  const leftBrow = buildEyebrow(body, colour.clone().multiplyScalar(0.82), 1);
  const rightBrow = buildEyebrow(body, colour.clone().multiplyScalar(0.82), -1);
  if (!scalp && !leftBrow && !rightBrow) return null;
  const group = new THREE.Group();
  group.name = 'patient-hair-layer';
  if (scalp) group.add(scalp);
  if (leftBrow) group.add(leftBrow);
  if (rightBrow) group.add(rightBrow);
  return group;
}
