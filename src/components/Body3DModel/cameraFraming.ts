import type { EnvironmentVariant } from '@/lib/sceneEnvironment';

export type CameraPoint3 = [number, number, number];

const TREATMENT_BAY_ACTION_RADIUS_SCALE = 1.6;

const INDOOR_FLOOR_PRESENTATIONS = new Set<EnvironmentVariant>(['clinic', 'home', 'public']);

/**
 * The overview for a patient found on the floor must begin above the care
 * plane. An oblique, feet-first camera makes injuries and landmark markers
 * compete with the body itself, and leaves no intuitive route to a clinical
 * hover view. Indoor offsets stay below the authored room ceiling; outdoor
 * scenes can use a higher observation angle.
 */
export function treatmentBayFloorOverviewOffset(variant: EnvironmentVariant): CameraPoint3 {
  return INDOOR_FLOOR_PRESENTATIONS.has(variant)
    ? [0.35, 2.35, 2.0]
    : [0.45, 3.45, 2.15];
}

/**
 * Keep manual orbit useful after the overhead landing without allowing an
 * indoor camera to escape through its ceiling. The open-scene limit preserves
 * a genuine overhead inspection angle for road, worksite, water and fire
 * patients; indoor scenes retain enough ceiling clearance for the same task.
 */
export function floorOverviewMinPolarAngle(variant: EnvironmentVariant): number {
  return INDOOR_FLOOR_PRESENTATIONS.has(variant) ? 0.6 : 0.32;
}

/**
 * The indoor hover is deliberately closer than an outdoor scene. Together
 * with the indoor polar limit this keeps the camera below a 2.7 m shell even
 * when the student zooms out, rather than letting a useful top view escape
 * into the ceiling.
 */
export function floorOverviewMaxDistance(variant: EnvironmentVariant): number | null {
  return INDOOR_FLOOR_PRESENTATIONS.has(variant) ? 3.05 : null;
}

/**
 * A floor patient needs the whole body above the persistent care ribbon.
 * Widen the clinical lens a little instead of increasing the camera radius
 * through an indoor shell.
 */
export function floorOverviewFov(variant: EnvironmentVariant): number {
  return INDOOR_FLOOR_PRESENTATIONS.has(variant) ? 40 : 38;
}

/**
 * Surface samples in the treatment presentation are already world-space.
 * Only authored clinical coordinates need the treatment-bay projection.
 * Keeping this boundary explicit prevents a second root transform from
 * throwing a focused face/chest action back toward a full-body view.
 */
export function resolveTreatmentBayActionTarget(
  sampledWorld: CameraPoint3 | null,
  authoredClinical: CameraPoint3,
  projectClinicalToWorld: (point: CameraPoint3) => CameraPoint3,
): CameraPoint3 {
  return sampledWorld ?? projectClinicalToWorld(authoredClinical);
}

/**
 * The narrow patient viewport already feeds its live aspect ratio into the
 * camera fit. A small margin is enough for the surrounding anatomy; the old
 * 4.2 multiplier counteracted that fit and reduced a lip exam to a torso shot.
 */
export function treatmentBayActionFramingRadius(
  clinicalRadius: number,
  patientScale: number,
): number {
  return clinicalRadius * Math.max(0.5, patientScale) * TREATMENT_BAY_ACTION_RADIUS_SCALE;
}
