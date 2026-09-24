import * as THREE from 'three';
import type { LipSeam } from './lipSeamTable';

/**
 * Resp-001-only replacement geometry for the shipped `viseme_open` target.
 *
 * This is amplitude-reactive articulation: one measured audio envelope opens
 * the lips through the existing morph slot. It does not claim
 * phoneme, word, or syllable alignment; there is no transcript timing input.
 *
 * The vermilion band is derived from each mesh's own measured mouth seam
 * (lipSeamForCrown), so the articulation lands on the real mouth of whatever
 * GLB is loaded — adult male, adult female, adolescent, child, toddler or
 * infant, male or female. The adult male row reproduces the old hardcoded
 * band exactly, so existing behaviour is unchanged.
 */
export const RESP001_LIP_ARTICULATION_MORPH = 'viseme_open';

export type Resp001LipSide = -1 | 0 | 1;

/**
 * The corrected amplitude-reactive articulation is calibrated to the adult
 * male patient mesh (`patient-male.glb`, crown ~1.726 m) — its vermilion band,
 * seam topology and measured 5.8 mm excursion. Apply it only to that mesh.
 *
 * Pediatric male meshes (`patient-adolescent/child/infant/toddler-male.glb`,
 * crown 0.66–1.64 m) have proportionally lower mouths whose seam loops fall
 * entirely outside the calibrated band, so classifyResp001LipSeamSides finds
 * no boundary and the articulation would crash the patient at clone time.
 * They keep their shipped morph until each band is calibrated. Female and
 * legacy meshes likewise keep their shipped morph (their lip coordinates
 * differ, so reusing the male band would land the movement on the wrong part
 * of the face).
 */
/** The ten shipped patient meshes whose mouth seam was measured. The
 * legacy `patient.glb` is excluded even though it shares the adult male
 * crown, because its seam was never calibrated. */
const MEASURED_SEAM_MODELS = new Set([
  '/models/patient-male.glb',
  '/models/patient-female.glb',
  '/models/patient-adolescent-male.glb',
  '/models/patient-adolescent-female.glb',
  '/models/patient-child-male.glb',
  '/models/patient-child-female.glb',
  '/models/patient-toddler-male.glb',
  '/models/patient-toddler-female.glb',
  '/models/patient-infant-male.glb',
  '/models/patient-infant-female.glb',
]);

/**
 * Whether the corrected articulation should replace the shipped `viseme_open`
 * target for this mesh. The gate is crown-aware: every Patient mesh whose
 * mouth seam was measured gets the corrected morph, and every mesh without a
 * measured seam (no Patient node, no viseme_open, or an uncalibrated crown)
 * keeps its shipped morph. The adult male row reproduces the old hardcoded
 * band exactly, so its behaviour is unchanged.
 */
export function shouldApplyCorrectedLipArticulation(
  modelPath: string,
  meshName: string,
  crown: number,
): boolean {
  return MEASURED_SEAM_MODELS.has(modelPath)
    && meshName === 'Patient'
    && Number.isFinite(crown)
    && crown > 0;
}

/** Reference (adult male) band extents, in the mesh's own local frame. The
 * deformation thresholds scale these by the band's crown ratio, so the adult
 * male row reproduces them exactly and every other mesh tracks its own size.
 *
 * These are the OLD hardcoded band, kept verbatim so the adult male mesh
 * behaves exactly as before this change. The centre (1.54725) is exported from
 * lipSeamTable as REF_Y_CENTER; the extents below are the old LIP_Y_MIN/MAX,
 * LIP_X_OUTER, LIP_Z_MIN and the support/full thresholds authored as fixed
 * offsets around that centre. */
const REF_Y_MIN = 1.536;
const REF_Y_MAX = 1.5585;
const REF_Y_CENTER = 1.54725;
const REF_Y_HALF = (REF_Y_MAX - REF_Y_MIN) / 2; // 0.01125
const REF_X_OUTER = 0.028;
const REF_X_FULL = 0.020;
const REF_Z_MIN = 0.138;
const REF_Z_FULL = 0.145;
const REF_SUPPORT_Y_MIN = 1.518;
const REF_FULL_MIN = 1.538;
const REF_FULL_MAX = 1.5485;
const REF_SPLIT_LOW = 1.5425;
const REF_SPLIT_HIGH = 1.544;

/** Reference (adult male) band, used by the 2-arg predicate form. */
const REF_BAND: LipSeam = {
  yCenter: REF_Y_CENTER,
  yHalf: REF_Y_HALF,
  xMax: REF_X_OUTER,
  zMin: REF_Z_MIN,
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Relative morph delta for a vertex, in the mesh's own local frame.
 *
 * The thresholds are the reference (adult male) extents scaled by the band's
 * crown ratio, so the same deformation lands on the vermilion of whatever
 * GLB is loaded. The adult male band reproduces the old hardcoded values
 * exactly; every other mesh tracks its own measured mouth.
 *
 * The vermilion and the skin immediately beneath it move together. Distant
 * cheek, philtrum, chin, and neck vertices remain at the authored positions.
 */
export function resp001LipArticulationDelta(
  x: number,
  y: number,
  z: number,
  seamSide: Resp001LipSide = 0,
  band: LipSeam = REF_BAND,
): readonly [x: number, y: number, z: number] {
  const scale = band.yHalf / REF_BAND.yHalf;
  // Scale the reference thresholds around the measured seam centre, not around
  // world zero. The pediatric meshes live at y≈0.54–1.40; multiplying the
  // adult absolute thresholds by the crown ratio pushed those mouths outside
  // the band and silently disabled lip movement.
  const yAt = (referenceY: number) => band.yCenter + (referenceY - REF_Y_CENTER) * scale;
  const xFull = band.xMax * (REF_X_FULL / REF_X_OUTER);
  const lateral = 1 - smoothstep(xFull, band.xMax, Math.abs(x));
  const vertical = smoothstep(yAt(REF_SUPPORT_Y_MIN), yAt(REF_FULL_MIN), y)
    * (1 - smoothstep(yAt(REF_FULL_MAX), yAt(REF_Y_MAX), y));
  const anterior = smoothstep(band.zMin, band.zMin + (REF_Z_FULL - REF_Z_MIN) * scale, z);
  const coverage = lateral * vertical * anterior;
  if (coverage <= 0) return [0, 0, 0];

  // A single open/close articulation, not a guessed vowel. Upper vermilion
  // lifts slightly; lower vermilion drops more and recedes a fraction. At full
  // influence the central separation is 5.8 mm, while the chin displacement
  // remains zero. The axis-bugged shipped jaw morph stays disabled for resp-001.
  const upper = seamSide > 0
    ? 1
    : seamSide < 0
      ? 0
      : smoothstep(yAt(REF_SPLIT_LOW), yAt(REF_SPLIT_HIGH), y);
  const yDelta = (-0.0042 + upper * 0.0058) * coverage;
  const zDelta = (-0.0008 + upper * 0.0013) * coverage;
  return [0, yDelta, zDelta];
}

interface EdgeUse {
  a: number;
  b: number;
  count: number;
  thirds: number[];
}

function edgeKey(a: number, b: number): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function isMouthSeamCandidate(position: THREE.BufferAttribute, index: number, band: LipSeam): boolean {
  return Math.abs(position.getX(index)) <= band.xMax
    && position.getY(index) >= band.yCenter - band.yHalf
    && position.getY(index) <= band.yCenter + band.yHalf
    && position.getZ(index) >= band.zMin;
}

function correctedNormalDelta(
  geometry: THREE.BufferGeometry,
  positionDelta: THREE.BufferAttribute,
): THREE.Float32BufferAttribute {
  const sourcePosition = geometry.getAttribute('position');
  const sourceNormal = geometry.getAttribute('normal');
  if (!sourcePosition || !sourceNormal) {
    throw new Error('resp-001 lip articulation requires position and normal attributes');
  }

  // Compare topology-derived normals before/after the corrected deformation.
  // Subtracting the authored normal directly would introduce a full-body delta
  // when Blender's custom smoothing differs from computeVertexNormals().
  const base = geometry.clone();
  base.morphAttributes = {};
  base.deleteAttribute('normal');
  base.computeVertexNormals();

  const deformed = base.clone();
  const deformedPositions = new Float32Array(sourcePosition.count * 3);
  for (let index = 0; index < sourcePosition.count; index++) {
    const offset = index * 3;
    deformedPositions[offset] = sourcePosition.getX(index) + positionDelta.getX(index);
    deformedPositions[offset + 1] = sourcePosition.getY(index) + positionDelta.getY(index);
    deformedPositions[offset + 2] = sourcePosition.getZ(index) + positionDelta.getZ(index);
  }
  deformed.setAttribute('position', new THREE.Float32BufferAttribute(deformedPositions, 3));
  deformed.deleteAttribute('normal');
  deformed.computeVertexNormals();

  const baseNormal = base.getAttribute('normal');
  const deformedNormal = deformed.getAttribute('normal');
  const deltas = new Float32Array(sourceNormal.count * 3);
  for (let index = 0; index < sourceNormal.count; index++) {
    const offset = index * 3;
    deltas[offset] = deformedNormal.getX(index) - baseNormal.getX(index);
    deltas[offset + 1] = deformedNormal.getY(index) - baseNormal.getY(index);
    deltas[offset + 2] = deformedNormal.getZ(index) - baseNormal.getZ(index);
  }
  return new THREE.Float32BufferAttribute(deltas, 3);
}

/**
 * The MPFB mouth has two coincident but unwelded boundary loops: one belongs
 * to the upper lip, one to the lower. Coordinates alone cannot tell them
 * apart. The adjacent triangle identifies each boundary loop. Propagate that
 * identity through the local lip surface by distance along connected edges:
 * the curled lower lip can sit above its seam in Y, so height alone would
 * pull neighbouring vertices in opposite directions and invert their faces.
 */
export function classifyResp001LipSeamSides(
  geometry: THREE.BufferGeometry,
  band: LipSeam = REF_BAND,
): Int8Array {
  const position = geometry.getAttribute('position');
  const index = geometry.getIndex();
  if (!position || position.itemSize !== 3 || !index) {
    throw new Error('resp-001 lip seam classification requires indexed vec3 geometry');
  }

  const edges = new Map<string, EdgeUse>();
  const addEdge = (a: number, b: number, third: number) => {
    const key = edgeKey(a, b);
    const current = edges.get(key);
    if (current) {
      current.count++;
      current.thirds.push(third);
    } else {
      edges.set(key, { a: Math.min(a, b), b: Math.max(a, b), count: 1, thirds: [third] });
    }
  };
  for (let offset = 0; offset + 2 < index.count; offset += 3) {
    const a = Math.round(index.getX(offset));
    const b = Math.round(index.getX(offset + 1));
    const c = Math.round(index.getX(offset + 2));
    addEdge(a, b, c);
    addEdge(b, c, a);
    addEdge(c, a, b);
  }

  const boundary = [...edges.values()].filter(edge => (
    edge.count === 1
    && isMouthSeamCandidate(position as THREE.BufferAttribute, edge.a, band)
    && isMouthSeamCandidate(position as THREE.BufferAttribute, edge.b, band)
  ));
  const neighbours = new Map<number, Set<number>>();
  for (const edge of boundary) {
    if (!neighbours.has(edge.a)) neighbours.set(edge.a, new Set());
    if (!neighbours.has(edge.b)) neighbours.set(edge.b, new Set());
    neighbours.get(edge.a)?.add(edge.b);
    neighbours.get(edge.b)?.add(edge.a);
  }

  const components: number[][] = [];
  const remaining = new Set(neighbours.keys());
  while (remaining.size > 0) {
    const seed = remaining.values().next().value as number;
    remaining.delete(seed);
    const component = [seed];
    const stack = [seed];
    while (stack.length > 0) {
      const current = stack.pop() as number;
      for (const neighbour of neighbours.get(current) ?? []) {
        if (!remaining.delete(neighbour)) continue;
        component.push(neighbour);
        stack.push(neighbour);
      }
    }
    components.push(component);
  }

  const scored = components
    .map(vertices => {
      const membership = new Set(vertices);
      const componentEdges = boundary.filter(edge => membership.has(edge.a) && membership.has(edge.b));
      const biases = componentEdges.flatMap(edge => edge.thirds.map(third => (
        position.getY(third) - (position.getY(edge.a) + position.getY(edge.b)) * 0.5
      )));
      const xs = vertices.map(vertex => position.getX(vertex));
      return {
        vertices,
        bias: biases.length > 0 ? biases.reduce((sum, value) => sum + value, 0) / biases.length : 0,
        span: Math.max(...xs) - Math.min(...xs),
      };
    })
    .filter(component => component.vertices.length >= 2 && component.span >= 0.030);

  const upper = scored.reduce<(typeof scored)[number] | null>(
    (best, component) => !best || component.bias > best.bias ? component : best,
    null,
  );
  const lower = scored.reduce<(typeof scored)[number] | null>(
    (best, component) => !best || component.bias < best.bias ? component : best,
    null,
  );
  if (!upper || !lower || upper === lower || upper.bias <= 0 || lower.bias >= 0) {
    throw new Error('resp-001 upper and lower lip boundary loops were not found');
  }

  const sides = new Int8Array(position.count);
  const surface = new Map<number, Set<number>>();
  // Seed discovery stays restricted to the measured aperture. The curled lip
  // surface extends above it: carry its identity through the full 10 mm top
  // support taper instead of switching back to a height guess at the seed ROI.
  const scale = band.yHalf / REF_BAND.yHalf;
  const isLipSupport = (vertex: number) => Math.abs(position.getX(vertex)) <= REF_X_OUTER * scale
    && position.getY(vertex) >= REF_Y_MIN * scale
    && position.getY(vertex) <= REF_Y_MAX * scale
    && position.getZ(vertex) >= REF_Z_MIN * scale;
  for (const edge of edges.values()) {
    if (!isLipSupport(edge.a) || !isLipSupport(edge.b)) continue;
    if (!surface.has(edge.a)) surface.set(edge.a, new Set());
    if (!surface.has(edge.b)) surface.set(edge.b, new Set());
    surface.get(edge.a)!.add(edge.b);
    surface.get(edge.b)!.add(edge.a);
  }
  const distancesFrom = (seeds: number[]) => {
    const distances = new Float64Array(position.count).fill(Infinity);
    const queue = seeds.map(vertex => ({ vertex, distance: 0 }));
    for (const vertex of seeds) distances[vertex] = 0;
    // A few hundred local vertices, evaluated once when cloning the patient.
    while (queue.length > 0) {
      queue.sort((a, b) => b.distance - a.distance);
      const current = queue.pop()!;
      if (current.distance > distances[current.vertex]) continue;
      for (const neighbour of surface.get(current.vertex) ?? []) {
        const distance = current.distance + Math.hypot(
          position.getX(neighbour) - position.getX(current.vertex),
          position.getY(neighbour) - position.getY(current.vertex),
          position.getZ(neighbour) - position.getZ(current.vertex),
        );
        if (distance >= distances[neighbour]) continue;
        distances[neighbour] = distance;
        queue.push({ vertex: neighbour, distance });
      }
    }
    return distances;
  };
  const upperDistance = distancesFrom(upper.vertices);
  const lowerDistance = distancesFrom(lower.vertices);
  for (const vertex of surface.keys()) {
    if (upperDistance[vertex] < lowerDistance[vertex]) sides[vertex] = 1;
    if (lowerDistance[vertex] < upperDistance[vertex]) sides[vertex] = -1;
  }
  return sides;
}

/**
 * Clone a geometry and replace only its existing `viseme_open` delta without
 * changing topology, UVs, skin attributes, indices, or morph order/name.
 * Keeping the original target slot preserves the existing audio and evidence
 * contract (`viseme_open` influence follows actual patient playback).
 */
export function withResp001LipArticulationMorph(
  source: THREE.BufferGeometry,
  explicitVisemeIndex?: number,
  band: LipSeam = REF_BAND,
): THREE.BufferGeometry {
  const position = source.getAttribute('position');
  if (!position || position.itemSize !== 3) {
    throw new Error('resp-001 lip articulation requires a vec3 position attribute');
  }

  const existing = source.morphAttributes.position ?? [];
  if (!source.morphTargetsRelative) {
    throw new Error('resp-001 lip articulation requires relative morph targets');
  }
  const visemeIndex = explicitVisemeIndex ?? existing.findIndex(
    attribute => attribute.name === RESP001_LIP_ARTICULATION_MORPH,
  );
  if (!Number.isInteger(visemeIndex) || visemeIndex < 0 || visemeIndex >= existing.length) {
    // No viseme_open target to replace: nothing to articulate. Return the
    // source unchanged so the caller keeps the shipped morph rather than
    // cloning and painting on an empty slot.
    return source;
  }

  const geometry = source.clone();
  let seamSides: Int8Array;
  try {
    seamSides = classifyResp001LipSeamSides(geometry, band);
  } catch {
    // The mouth seam was not found in the calibrated band (for example a
    // pediatric or otherwise uncalibrated mesh slipped past the caller's gate).
    // Return the source unchanged so the patient keeps its shipped morph
    // rather than crashing the whole render. Articulation is cosmetic; the
    // exam wins.
    return source;
  }
  const deltas = new Float32Array(position.count * 3);
  for (let index = 0; index < position.count; index++) {
    const [dx, dy, dz] = resp001LipArticulationDelta(
      position.getX(index),
      position.getY(index),
      position.getZ(index),
      seamSides[index] as Resp001LipSide,
      band,
    );
    const offset = index * 3;
    deltas[offset] = dx;
    deltas[offset + 1] = dy;
    deltas[offset + 2] = dz;
  }

  const attribute = new THREE.Float32BufferAttribute(deltas, 3);
  // GLTFLoader gets semantic target names from mesh.extras.targetNames and
  // may leave BufferAttribute.name blank. Preserve that source attribute name;
  // the caller's existing morphTargetDictionary remains the name authority.
  attribute.name = existing[visemeIndex]?.name ?? '';
  geometry.morphAttributes.position = existing.map((current, index) => (
    index === visemeIndex ? attribute : current
  ));

  // The shipped target also contains an axis-bugged NORMAL delta. Keeping it
  // after fixing POSITION still makes the static chin/neck relight and bulge.
  // Replace the corresponding normal slot from the corrected deformation.
  const normalMorphs = geometry.morphAttributes.normal;
  if (normalMorphs && visemeIndex < normalMorphs.length) {
    const normalDelta = correctedNormalDelta(geometry, attribute);
    normalDelta.name = normalMorphs[visemeIndex]?.name ?? '';
    geometry.morphAttributes.normal = normalMorphs.map((current, index) => (
      index === visemeIndex ? normalDelta : current
    ));
  }
  return geometry;
}
