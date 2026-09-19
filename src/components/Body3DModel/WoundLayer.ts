/**
 * WoundLayer — case-driven wound decals painted onto the patient's skin.
 *
 * "There is a surgical wound, red and draining — you should be able to go
 * onto the body and SEE it." Each skin-visible injury from the case
 * (inferInjuries) is drawn once into the patient's diffuse atlas at the
 * injury's anatomical site, using the procedural art in woundSprites.ts.
 *
 * Pipeline position: runs right after paintEyesOnTexture stashed the clean
 * open/closed atlases on the mesh's userData. We draw INTO those canvases
 * (not copies) because wounds are constant for the whole case — that way the
 * blink swap (LifeSigns) and the mottling twins (MottlingLayer, built later
 * from these same atlases) inherit the wounds for free.
 *
 * Site targeting: never guess the UV layout — classify each vertex in bind
 * (rest) space into a body region and paint at the UV of a deterministically
 * picked matching vertex. Posed world matrices would map a supine patient
 * onto the wrong limb. Works on any atlas packing.
 */

import * as THREE from 'three';
import { classifyBodyPoint } from '@/lib/regionClassifier';
import { drawWound, type WoundKind } from './woundSprites';
import type { BodyInjury, InjuryLaterality } from '@/lib/injuryMap';

/** Map an inferred injury to a drawable sprite kind — null = not skin art
 * (deformity/swelling/etc. are shape findings handled by morphs and pips). */
export function spriteKindFor(injury: Pick<BodyInjury, 'kind' | 'detail' | 'label'>): WoundKind | null {
  const text = `${injury.label} ${injury.detail}`.toLowerCase();
  switch (injury.kind) {
    case 'burn': return 'burn';
    case 'rash': return 'urticaria';
    case 'soot': return 'soot';
    case 'bruising': return 'bruise';
    case 'bleeding': return /abrasion|graze|road rash/.test(text) ? 'abrasion' : 'active-bleeding';
    case 'wound':
      if (/infect|drain|pus|purulent|erythema|red and/.test(text)) return 'infected-incision';
      if (/surgic|incision|post-op|postoperative|sutur/.test(text)) return 'surgical-incision';
      if (/abrasion|graze|road rash/.test(text)) return 'abrasion';
      return 'laceration';
    default: return null;
  }
}

/** Deterministic 32-bit hash so a given injury always lands on the same spot. */
export function hashInjury(id: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function woundRotationFor(kind: WoundKind, hash: number): number {
  // Surgical incisions have an authored anatomical direction; random rotation
  // can turn a midline incision into a diagonal cross when the focused layer
  // is revealed over the atlas decal.
  if (kind === 'infected-incision' || kind === 'surgical-incision') return Math.PI / 2;
  return ((hash >>> 8) % 628) / 100 - Math.PI;
}

const SEVERITY_SIZE: Record<BodyInjury['severity'], number> = {
  critical: 0.068, // fraction of atlas width
  major: 0.054,
  minor: 0.04,
};

/** Does a world-space vertex belong to the injury's region? Anterior regions
 * additionally require a camera-facing (front) vertex so the wound is where
 * the student actually looks; 'back' wants posterior torso.
 * Laterality is the patient's own left/right (positive X = patient left). */
export function vertexMatchesRegion(
  x: number,
  y: number,
  z: number,
  region3d: string,
  laterality?: InjuryLaterality,
): boolean {
  if (region3d === 'posterior-logroll') {
    return z < -0.01 && y > 0.8 && y < 1.45;
  }
  // Anterior wounds: accept any non-posterior vertex (z > -0.05) so wounds
  // render reliably on all patient models regardless of rest pose depth.
  if (z < -0.05) return false;
  const hit = classifyBodyPoint(x, y, z);
  const regionOk = region3d === 'head'
    ? hit.region === 'head' || hit.region === 'face'
    : hit.region === region3d;
  if (!regionOk) return false;
  if (laterality === 'left' && x < 0.02) return false;
  if (laterality === 'right' && x > -0.02) return false;
  return true;
}

/**
 * Paint every skin-visible case injury onto the stashed atlases.
 * Returns the number of wounds painted (0 = nothing visible / no atlases —
 * never throws; a geometry surprise must not break the exam).
 */
export function applyWoundsToTextures(
  body: THREE.Mesh,
  injuries: Array<Pick<BodyInjury, 'id' | 'kind' | 'label' | 'detail' | 'severity' | 'region' | 'laterality'>>,
  regionTo3D: (region: BodyInjury['region']) => string,
): number {
  try {
    const openTex = body.userData?.eyesOpenTex as THREE.CanvasTexture | undefined;
    const closedTex = (body.userData?.eyesClosedTex as THREE.CanvasTexture | null | undefined) ?? null;
    const openCanvas = openTex?.image as HTMLCanvasElement | undefined;
    if (!openTex || !openCanvas?.width) return 0;

    const geom = body.geometry as THREE.BufferGeometry;
    const pos = geom.attributes.position as THREE.BufferAttribute | undefined;
    const uv = geom.attributes.uv as THREE.BufferAttribute | undefined;
    if (!pos || !uv) return 0;

    const tw = openCanvas.width;
    const th = openCanvas.height;
    const flipY = openTex.flipY;

    body.updateWorldMatrix(true, false);
    // Classify in bind/rest space, not the posed world matrix. A seated or
    // recovery patient has already been rotated onto the support surface, so
    // world Y no longer maps to the standing atlas the region classifier
    // expects — wounds then land on the wrong limb or vanish entirely.
    const skinned = body as THREE.SkinnedMesh;
    const toBind = skinned.isSkinnedMesh
      ? skinned.bindMatrix.clone()
      : new THREE.Matrix4();
    const v = new THREE.Vector3();

    let painted = 0;
    const targets: Array<{ kind: WoundKind; px: number; py: number; size: number; rot: number }> = [];

    for (const injury of injuries) {
      const kind = spriteKindFor(injury);
      if (!kind) continue;
      const region3d = regionTo3D(injury.region);

      // Collect matching vertex UVs. Sampling stride keeps this fast on the
      // ~15-27k vertex meshes (~milliseconds, runs once per case).
      type Cand = { u: number; v: number; x: number };
      const collect = (withSide: boolean): Cand[] => {
        const out: Cand[] = [];
        for (let i = 0; i < pos.count; i += 2) {
          v.fromBufferAttribute(pos, i).applyMatrix4(toBind);
          if (!vertexMatchesRegion(v.x, v.y, v.z, region3d, withSide ? injury.laterality : undefined)) continue;
          out.push({ u: uv.getX(i), v: uv.getY(i), x: v.x });
        }
        return out;
      };
      let candidates = collect(true);
      // Never drop a authored wound because the mesh is skinny at rest —
      // fall back to the whole region rather than painting nothing.
      if (candidates.length === 0 && injury.laterality) candidates = collect(false);
      if (candidates.length === 0) continue;

      const h = hashInjury(injury.id);
      let pick: Cand;
      if (injury.laterality) {
        const targetX = injury.laterality === 'left' ? 0.07 : -0.07;
        candidates.sort((a, b) => Math.abs(a.x - targetX) - Math.abs(b.x - targetX) || a.u - b.u);
        pick = candidates[0];
      } else {
        // Middle of the candidate list (sorted for determinism) keeps the wound
        // away from region borders; the hash spreads multiple wounds apart.
        candidates.sort((a, b) => a.u - b.u || a.v - b.v);
        pick = candidates[(h % Math.max(1, candidates.length - 2)) + 1] ?? candidates[0];
      }
      targets.push({
        kind,
        px: pick.u * tw,
        py: (flipY ? 1 - pick.v : pick.v) * th,
        size: SEVERITY_SIZE[injury.severity] * tw,
        rot: woundRotationFor(kind, h),
      });
    }
    if (targets.length === 0) return 0;

    const paintInto = (tex: THREE.CanvasTexture | null) => {
      const canvas = tex?.image as HTMLCanvasElement | undefined;
      const ctx = canvas?.getContext('2d');
      if (!tex || !ctx) return;
      for (const t of targets) drawWound(ctx, t.kind, t.px, t.py, t.size, t.rot);
      tex.needsUpdate = true;
    };
    paintInto(openTex);
    paintInto(closedTex);
    painted = targets.length;
    return painted;
  } catch {
    return 0; // decals are polish — never let them break the patient
  }
}
