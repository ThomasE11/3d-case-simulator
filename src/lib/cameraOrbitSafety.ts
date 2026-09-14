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
  halfWidth: 3.25,
  backZ: -2.6,
  frontZ: 5.25,
  floorY: -0.05,
  ceilingY: 2.7,
  wallDepth: 0.06,
  overviewTarget: { x: 0, y: 0.751, z: 0.78 },
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

const OPEN_SCENE: CameraOrbitSafety = {
  minAzimuthAngle: -Infinity,
  maxAzimuthAngle: Infinity,
  maxDistance: 8.5,
  minPolarAngle: Math.PI / 2 - 0.28,
  maxPolarAngle: Math.PI / 2 + 0.22,
};

// Shared villa room front is open at z=+2.8. The resp-001 profile adds a
// physical front wall at RESP001_VILLA_SHELL.frontZ, beyond the camera orbit.
// Back wall: z=-2.6; hall: z=-5.4; side walls: x=±3.25.

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
      maxDistance: 3.7,
      minPolarAngle: Math.PI / 2 - 0.1,
      maxPolarAngle: Math.PI / 2 + 0.1,
    };
  }
  if (variant === 'home') {
    // Shared villa front: z=+2.8. The resp-001 shell extends to z=+5.25.
    // Clamp azimuth to room width and polar angle to floor/ceiling clearance.
    return {
      minAzimuthAngle: -Math.PI / 4,
      maxAzimuthAngle: Math.PI / 4,
      maxDistance: 4.0,
      minPolarAngle: Math.PI / 2 - 0.12, // slightly below eye level but with buffer
      maxPolarAngle: Math.PI / 2 + 0.1,  // above floor plane
    };
  }
  if (variant === 'public') {
    // The venue has open sides but a storefront wall behind the patient.
    return {
      minAzimuthAngle: -Math.PI / 3,
      maxAzimuthAngle: Math.PI / 3,
      maxDistance: 6,
      minPolarAngle: Math.PI / 2 - 0.15,
      maxPolarAngle: Math.PI / 2 + 0.1,
    };
  }
  // Agricultural/farm field = open scene like outdoor road/industrial
  return OPEN_SCENE;
}
