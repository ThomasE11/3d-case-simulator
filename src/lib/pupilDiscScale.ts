/**
 * Pupil diameter (mm) -> pupil disc scale factor.
 *
 * The patient's 3D pupil discs (`pupilL` / `pupilR`) and the texture-level
 * iris backing in `EyesLayer` both describe the SAME physical pupil, so they
 * must use one function. They used to each clamp independently:
 *
 *   3D disc      Math.min(1.8, Math.max(0.4, mm / 5))   -> floor 0.4
 *   texture disc Math.max(irisR*.32, Math.min(irisR*.9, irisR * mm/5))
 *
 * Both clamps flatten the clinical range. A 1 mm pinpoint pupil (opioid OD,
 * pontine haemorrhage, organophosphate) and a 2 mm small-normal pupil both
 * rendered at the 0.4 floor — identical discs, indistinguishable on the body
 * and in the close-up loupe. A 6 mm blown pupil was capped at 0.9 of the iris
 * in the texture while the 3D disc ran to 1.2, so the two paths disagreed at
 * the abnormal end as well as the small end.
 *
 * The only honest floor is the one the geometry forces: a pupil disc authored
 * at 5 mm diameter drops below ~1 mm world-space below 0.2x scale, where it
 * becomes sub-millimetre and invisible. Everything above 1 mm scales linearly
 * with the authored diameter, so 1/2/3/4/5/6 mm all render visibly distinct.
 */

/** Authored pupil disc diameter in millimetres, before scaling. */
export const PUPIL_DISC_BASE_MM = 5;

/** Soft floor: below this the disc is sub-millimetre in world space. */
export const PUPIL_DISC_MIN_SCALE = 0.2;

/** Hard ceiling: a pupil never grows past this multiple of its authored disc. */
export const PUPIL_DISC_MAX_SCALE = 1.8;

/**
 * Case pupil mm -> pupil disc scale. Linear in the authored diameter, floored
 * only where the geometry becomes invisible, capped so a blown pupil never
 * eats the iris.
 */
export function pupilDiscScale(mm: number): number {
  if (!Number.isFinite(mm)) return PUPIL_DISC_MIN_SCALE;
  return Math.min(PUPIL_DISC_MAX_SCALE, Math.max(PUPIL_DISC_MIN_SCALE, mm / PUPIL_DISC_BASE_MM));
}

/** The texture-level pupil radius, expressed as a fraction of the iris radius.
 *  Shares the linear scale with the 3D disc so the backing disc and the live
 *  pupil agree, but clamps to the iris: a pupil is a hole IN the iris, so it
 *  can fill it (1.0, blown) but never exceed it. The 3D disc has no such
 *  constraint because it is a child of the iris mesh and scales off its own
 *  authored diameter. */
export function pupilTextureRadiusFraction(mm: number): number {
  return Math.min(1, pupilDiscScale(mm));
}