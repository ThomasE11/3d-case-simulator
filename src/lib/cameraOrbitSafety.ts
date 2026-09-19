import type { EnvironmentVariant } from '@/lib/sceneEnvironment';

export interface CameraOrbitSafety {
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
}

/**
 * Physical shell used by the resp-001 villa profile. The front wall is beyond
 * the most distant supported camera position, so it encloses the room without
 * becoming a scenic card in the patient-facing view.
 */
export const RESP001_VILLA_SHELL = {
  // Rev7 sofa / kit / first-aid sit outside the shared 3.25 m home box
  // (PatientRest x=-1.1, kit x=3.6, first-aid x=4.2 z=-3.2, ficus x=-4.65).
  halfWidth: 5.6,
  backZ: -4.2,
  frontZ: 5.25,
  floorY: -0.05,
  ceilingY: 2.85,
  wallDepth: 0.06,
  overviewTarget: { x: -1.1, y: 1.12, z: -0.24 },
} as const;

/**
 * The resp-001 arrival is a real opening in the villa's front envelope, not
 * a camera starting point in a sealed wall.  Keep this geometry in one place
 * so the scene shell, camera dolly and regression checks cannot drift apart.
 */
export const RESP001_VILLA_ENTRY = {
  x: 0,
  openingWidth: 1.45,
  openingHeight: 2.22,
  /** Camera begins on the small exterior landing, just beyond the threshold. */
  arrivalZ: RESP001_VILLA_SHELL.frontZ + 0.58,
  landingDepth: 0.92,
} as const;

/**
 * Architectural limits for the profile-specific exterior threshold.
 *
 * This is intentionally a compact arrival forecourt rather than an open world:
 * it makes the doorway dolly read as entering a villa, while keeping the
 * patient and interior as the instructional focal point and avoiding an
 * additional streamed scene asset on iPad. The protected centre lane is
 * wider than the doorway, so the first camera frame never starts inside a
 * planter, gate, or facade prop.
 */
export const RESP001_VILLA_EXTERIOR = {
  approachEndZ: RESP001_VILLA_ENTRY.arrivalZ + 2.15,
  approachWidth: RESP001_VILLA_ENTRY.openingWidth + 1.25,
  protectedHalfWidth: RESP001_VILLA_ENTRY.openingWidth / 2 + 0.32,
  facadeDepth: 1.12,
  planterX: 1.82,
} as const;

const OPEN_SCENE: CameraOrbitSafety = {
  minAzimuthAngle: -Infinity,
  maxAzimuthAngle: Infinity,
  maxDistance: 8.5,
  // Let the clinician rise above a floor patient to inspect wounds, airway
  // alignment and device placement. Stop just above the support plane so the
  // camera never reveals the underside of the road/floor.
  minPolarAngle: Math.PI * 0.18,
  maxPolarAngle: Math.PI / 2 - 0.03,
};

// Shared villa room front is open at z=+2.8. The resp-001 profile adds a
// physical front wall at RESP001_VILLA_SHELL.frontZ, beyond the camera orbit.
// Back wall: z=-4.2; hall: z=-6.2 on the right; side walls: x=±5.6.

/**
 * Keep a first-person camera inside authored indoor shells.
 *
 * Indoor care is viewed from the same side a crew entered. Posterior
 * examination is a patient movement (the Log Roll workflow), not a 180°
 * camera orbit through the back wall.
 */
export function cameraOrbitSafetyForEnvironment(variant: EnvironmentVariant): CameraOrbitSafety {
  if (variant === 'clinic') {
    // Clinic side walls sit at x=±2.05. A smaller arc and tighter bounds.
    return {
      minAzimuthAngle: -Math.PI / 6,
      maxAzimuthAngle: Math.PI / 6,
      maxDistance: 4.0,
      minPolarAngle: Math.PI * 0.22,
      maxPolarAngle: Math.PI / 2 - 0.04,
    };
  }
  if (variant === 'home') {
    // Shared villa front: z=+2.8. The resp-001 shell extends to z=+5.25.
    // Clamp azimuth to room width and polar angle to floor/ceiling clearance.
    return {
      minAzimuthAngle: -Math.PI / 4,
      maxAzimuthAngle: Math.PI / 4,
      // The former 4 m / 11-degree vertical slot made the patient feel fixed
      // behind glass: the lower limbs were cropped and a top-down examination
      // was impossible. The treatment view removes the overhead plane, so the
      // orbit can now rise naturally while remaining on the patient-facing
      // side of the room and above the support surface.
      maxDistance: 4.6,
      minPolarAngle: Math.PI * 0.20,
      maxPolarAngle: Math.PI / 2 - 0.04,
    };
  }
  if (variant === 'public') {
    // The venue has open sides but a storefront wall behind the patient.
    return {
      minAzimuthAngle: -Math.PI / 3,
      maxAzimuthAngle: Math.PI / 3,
      maxDistance: 6,
      minPolarAngle: Math.PI * 0.20,
      maxPolarAngle: Math.PI / 2 - 0.04,
    };
  }
  // Agricultural/farm field = open scene like outdoor road/industrial
  return OPEN_SCENE;
}
