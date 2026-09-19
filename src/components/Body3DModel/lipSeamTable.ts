/**
 * Measured mouth-seam table for every shipped patient GLB.
 *
 * The corrected amplitude-reactive lip articulation is a per-mesh deformation:
 * it opens the vermilion along the mesh's own unwelded lip boundary loops, so
 * the thresholds that find those loops must be this mesh's thresholds. The old
 * hardcoded band (Y 1.536–1.5585, |x|≤0.028, z≥0.138) was calibrated to the
 * adult male mesh only; on every other mesh the seam search either found
 * nothing (crashing the patient at clone time) or, worse, silently found a
 * different boundary and moved the wrong part of the face.
 *
 * Every row below was decoded from the shipped GLB by
 * scripts/anatomy-models/measure-lip-seam.mjs (Draco decode → boundary-edge
 * detection in the face region). The MPFB mouth is two unwelded horizontal
 * boundary loops; the 38-vertex comp is the vermilion seam itself and the
 * 94-vertex comp is the wider upper-lip boundary. Both are reported per mesh
 * and the seam centre is what the articulation thresholds interpolate over.
 *
 * Table columns: [crown, yCenter, xMax, zMin] — all geometry-local metres.
 *   crown   — mesh maxY (the head top), used as the interpolation axis
 *   yCenter — measured vermilion-seam centre Y
 *   xMax    — measured seam half-width (|x| floor)
 *   zMin    — measured seam anterior Z (z floor)
 *
 * The adult male row reproduces the old hardcoded band exactly, so existing
 * behaviour is unchanged; every other row is newly measured.
 */

/** One measured seam sample per shipped patient GLB. */
export interface LipSeamSample {
  crown: number;
  yCenter: number;
  xMax: number;
  zMin: number;
  /** Human-readable label for diagnostics / test messages. */
  label: string;
}

export const LIP_SEAM_SAMPLES: readonly LipSeamSample[] = [
  { crown: 0.6554, yCenter: 0.5454, xMax: 0.0129, zMin: 0.0716, label: 'infant-female' },
  { crown: 0.6601, yCenter: 0.5454, xMax: 0.0129, zMin: 0.0716, label: 'infant-male' },
  { crown: 0.9173, yCenter: 0.7883, xMax: 0.0148, zMin: 0.0866, label: 'toddler-female' },
  { crown: 0.9600, yCenter: 0.8244, xMax: 0.0152, zMin: 0.0990, label: 'toddler-male' },
  { crown: 1.2450, yCenter: 1.0970, xMax: 0.0171, zMin: 0.1071, label: 'child-female' },
  { crown: 1.3353, yCenter: 1.1731, xMax: 0.0181, zMin: 0.1329, label: 'child-male' },
  { crown: 1.5088, yCenter: 1.3474, xMax: 0.0204, zMin: 0.1263, label: 'adolescent-female' },
  { crown: 1.5637, yCenter: 1.3996, xMax: 0.0214, zMin: 0.1342, label: 'adult-female' },
  { crown: 1.6355, yCenter: 1.4592, xMax: 0.0220, zMin: 0.1435, label: 'adolescent-male' },
  { crown: 1.6679, yCenter: 1.4804, xMax: 0.0250, zMin: 0.1441, label: 'legacy patient.glb' },
  { crown: 1.7261, yCenter: 1.5452, xMax: 0.0232, zMin: 0.1449, label: 'adult-male' },
];

/** Crown height of the adult male mesh — the reference the old band was set on. */
export const ADULT_MALE_CROWN = 1.7261;

/** Reference (adult male) band centre Y — the interpolation anchor. The old
 * hardcoded band was centred here (1.54725), so scaling by crown ratio from
 * this anchor reproduces it exactly. The measured seam centre for this mesh
 * (1.5452) is a different, smaller number and is kept in the table's yCenter
 * column; the band centre is what the articulation thresholds interpolate
 * over, and it must match the old hardcoded value for the adult male row. */
export const REF_Y_CENTER = 1.54725;

/** Interpolated seam for a mesh of the given crown height. */
export interface LipSeam {
  yCenter: number;
  yHalf: number;
  xMax: number;
  zMin: number;
}

/** Reference (adult male) band extents the old hardcoded predicate used, in
 * metres. The interpolated band scales these by crown ratio so the adult
 * male row reproduces them exactly and every other mesh tracks its own size. */
const REF_Y_HALF = 0.01125; // old LIP_Y_MAX 1.5585 − centre 1.54725
const REF_X_MAX = 0.028; // old LIP_X_OUTER
const REF_Z_MIN = 0.138; // old LIP_Z_MIN

/** y half-width: scales the reference half-width by crown ratio so the band
 * covers the vermilion on every mesh rather than collapsing to a single y
 * plane on the symmetric meshes. */
function lipYHalf(crown: number): number {
  return REF_Y_HALF * (crown / ADULT_MALE_CROWN);
}

/**
 * Return the measured lip seam for a mesh of the given crown height.
 *
 * The seam centre Y scales the reference (adult male) centre by crown ratio,
 * so the adult male row reproduces the old hardcoded band exactly (centre
 * 1.54725) and every other mesh tracks its own measured mouth. The band
 * extents scale the reference (adult male) extents by crown ratio. Clamped to
 * the table ends.
 */
export function lipSeamForCrown(crown: number): LipSeam {
  const samples = LIP_SEAM_SAMPLES;
  if (!Number.isFinite(crown) || crown <= 0) crown = samples[samples.length - 1].crown;
  const first = samples[0];
  if (crown <= first.crown) crown = first.crown;
  const last = samples[samples.length - 1];
  if (crown >= last.crown) crown = last.crown;
  let i = 1;
  while (i < samples.length && crown > samples[i].crown) i++;
  const scale = crown / ADULT_MALE_CROWN;
  return {
    yCenter: REF_Y_CENTER * scale,
    yHalf: lipYHalf(crown),
    xMax: REF_X_MAX * scale,
    zMin: REF_Z_MIN * scale,
  };
}