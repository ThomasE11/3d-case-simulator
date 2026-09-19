import { describe, expect, it } from 'vitest';
import { cameraOrbitSafetyForEnvironment, RESP001_VILLA_ENTRY, RESP001_VILLA_EXTERIOR, RESP001_VILLA_SHELL } from './cameraOrbitSafety';

describe('cameraOrbitSafetyForEnvironment', () => {
  it('keeps clinic and home cameras on the open, patient-facing side of walls', () => {
    const clinic = cameraOrbitSafetyForEnvironment('clinic');
    const home = cameraOrbitSafetyForEnvironment('home');

    expect(clinic.minAzimuthAngle).toBe(-Math.PI / 6);
    expect(clinic.maxAzimuthAngle).toBe(Math.PI / 6);
    expect(clinic.maxDistance * Math.sin(clinic.maxAzimuthAngle)).toBeLessThan(2.05);

    expect(home.minAzimuthAngle).toBe(-Math.PI / 4);
    expect(home.maxAzimuthAngle).toBe(Math.PI / 4);
    expect(home.maxDistance * Math.sin(home.maxAzimuthAngle)).toBeLessThan(RESP001_VILLA_SHELL.halfWidth);
  });

  it('fits the resp-001 overview orbit inside its physical villa shell', () => {
    const home = cameraOrbitSafetyForEnvironment('home');
    const { overviewTarget, halfWidth, frontZ, floorY, wallDepth } = RESP001_VILLA_SHELL;
    // Horizontal reach contracts as the camera rises. The treatment view hides
    // the ceiling so a top-down examination is possible without clipping it.
    const maxCameraZ = overviewTarget.z + home.maxDistance;
    const maxCameraX = overviewTarget.x + home.maxDistance * Math.sin(home.maxAzimuthAngle);
    const minCameraY = overviewTarget.y + home.maxDistance * Math.cos(home.maxPolarAngle);

    expect(maxCameraZ).toBeLessThan(frontZ - wallDepth / 2);
    expect(Math.abs(maxCameraX)).toBeLessThan(halfWidth - wallDepth / 2);
    expect(minCameraY).toBeGreaterThan(floorY);
    expect(home.minPolarAngle).toBeLessThan(Math.PI / 4);
    expect(home.maxPolarAngle).toBeLessThan(Math.PI / 2);
  });

  it('keeps the resp-001 arrival landing outside the shell without widening the student orbit', () => {
    const home = cameraOrbitSafetyForEnvironment('home');
    expect(RESP001_VILLA_ENTRY.arrivalZ).toBeGreaterThan(RESP001_VILLA_SHELL.frontZ);
    expect(RESP001_VILLA_ENTRY.openingWidth).toBeLessThan(RESP001_VILLA_SHELL.halfWidth * 2);
    expect(RESP001_VILLA_ENTRY.openingHeight).toBeLessThan(RESP001_VILLA_SHELL.ceilingY);
    expect(RESP001_VILLA_SHELL.overviewTarget.z + home.maxDistance).toBeLessThan(RESP001_VILLA_SHELL.frontZ);
  });

  it('gives the exterior approach a clear, bounded threshold lane', () => {
    expect(RESP001_VILLA_EXTERIOR.approachEndZ).toBeGreaterThan(RESP001_VILLA_ENTRY.arrivalZ);
    expect(RESP001_VILLA_ENTRY.arrivalZ).toBeGreaterThan(RESP001_VILLA_SHELL.frontZ);
    expect(RESP001_VILLA_EXTERIOR.protectedHalfWidth).toBeGreaterThan(RESP001_VILLA_ENTRY.openingWidth / 2);
    expect(RESP001_VILLA_EXTERIOR.planterX).toBeGreaterThan(RESP001_VILLA_EXTERIOR.protectedHalfWidth);
    expect(RESP001_VILLA_EXTERIOR.approachWidth / 2).toBeGreaterThan(RESP001_VILLA_EXTERIOR.protectedHalfWidth);
  });

  it('leaves outdoor incident scenes unrestricted', () => {
    for (const variant of ['roadside', 'industrial', 'fire', 'water', 'heat', 'agricultural'] as const) {
      const safety = cameraOrbitSafetyForEnvironment(variant);
      expect(safety.minAzimuthAngle).toBe(-Infinity);
      expect(safety.maxAzimuthAngle).toBe(Infinity);
      expect(safety.maxDistance).toBe(8.5);
    }
  });
});
