import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { inferSceneImage, inferSceneVideo, sceneImageNeedsPatientOverlay, sceneImagePatientGender } from './sceneImageSelection';

describe('scene image demographic consistency', () => {
  it('never selects a visibly gendered patient who contradicts the case', () => {
    const mismatches: string[] = [];

    for (const caseData of allCases) {
      const expected = caseData.patientInfo?.gender;
      const image = inferSceneImage(caseData);
      const visible = sceneImagePatientGender(image);
      if (visible && expected && visible !== expected) {
        mismatches.push(`${caseData.id}: ${expected} patient resolved to ${visible} asset ${image}`);
      }
    }

    expect(mismatches, mismatches.join('\n')).toEqual([]);
  });

  it('keeps the LITFL STEMI pre-brief and survey on the same male scene', () => {
    const caseData = allCases.find(({ id }) => id === 'litfl-001');
    expect(caseData).toBeDefined();
    const image = inferSceneImage(caseData!);
    expect(image).toBe('/scene-assets/y2-009-construction-office-arrest.png');
    expect(sceneImagePatientGender(image)).toBe('male');
  });

  it.each([
    ['resp-012', '/scene-assets/resp-012-mall-restaurant-anaphylaxis-male.png', 'male'],
    ['sepsis-001', '/scene-assets/sepsis-001-assisted-living-urosepsis.png', 'female'],
    ['y1-020', '/scene-assets/y1-020-school-football-tibial-fracture-male.png', 'male'],
    // Dedicated plates that were generated but never routed by the resolver.
    ['litfl-003', '/scene-assets/litfl-003-renal-failure-hyperkalemia-apartment.png', 'male'],
    ['trauma-004', '/scene-assets/trauma-004-park-stabbing-tamponade.png', 'male'],
    ['trauma-008', '/scene-assets/pedestrian-road-night-female-45.png', 'female'],
    ['cardiac-005', '/scene-assets/mall-foodcourt-chestpain-male-65.png', 'male'],
    ['litfl-001', '/scene-assets/y2-009-construction-office-arrest.png', 'male'],
    ['litfl-012', '/scene-assets/staff-accommodation-collapse-sharjah.png', 'male'],
    ['y1-017', '/scene-assets/office-medical-dubai.png', 'male'],
    ['trauma-009', '/scene-assets/construction-fall-male-29-dubaihills.png', 'male'],
    ['y2-004', '/scene-assets/y2-004-workshop-flash-burn.png', 'male'],
    ['y2-009', '/scene-assets/y2-009-construction-office-arrest.png', 'male'],
    ['fall-002', '/scene-assets/home-medical-male-dubai-apartment.png', 'male'],
    ['y2-005', '/scene-assets/y2-005-office-ectopic-lower-abdo.png', 'female'],
    ['cardiac-009', '/scene-assets/cardiac-009-elderly-female-aflutter-retirement-home.png', 'female'],
    ['cardiac-012', '/scene-assets/cardiac-012-rehab-dizziness-pacemaker.png', 'male'],
    ['fall-001', '/scene-assets/elderly-fall-bathroom-female-uae.png', 'female'],
    ['obs-001', '/scene-assets/obstetric-home-female-uae.png', 'female'],
  ] as const)('uses the exact patient and location plate for %s', (caseId, expectedImage, expectedGender) => {
    const caseData = allCases.find(({ id }) => id === caseId);
    expect(caseData).toBeDefined();

    const image = inferSceneImage(caseData!);
    expect(image).toBe(expectedImage);
    expect(sceneImagePatientGender(image)).toBe(expectedGender);
  });

  it.each([
    ['y1-010', '/scene-assets/y1-010-park-bicycle-wrist-fall.png'],
    ['cardiac-014', '/scene-assets/paediatric-pool-rescue-environment.png'],
    ['trauma-012', '/scene-assets/paediatric-pool-rescue-environment.png'],
    ['cardiac-017', '/scene-assets/infant-nursery-environment.png'],
  ])('uses an age-safe scene plate for %s', (caseId, expectedImage) => {
    const caseData = allCases.find(({ id }) => id === caseId);
    expect(caseData).toBeDefined();

    const image = inferSceneImage(caseData!);
    expect(image).toBe(expectedImage);
    expect(sceneImageNeedsPatientOverlay(image)).toBe(true);
  });

  it('keeps the toddler ingestion case on a paediatric home plate, not a kitchen scald', () => {
    const caseData = allCases.find(({ id }) => id === 'y1-009');
    expect(caseData).toBeDefined();
    const image = inferSceneImage(caseData!);
    expect(image).toBe('/scene-assets/home-pediatric-uae-family.png');
    expect(sceneImageNeedsPatientOverlay(image)).toBe(false);
  });
});

describe('animated arrival clips', () => {
  it('resolves the registered arrival clip for trauma-001', () => {
    const caseData = allCases.find(({ id }) => id === 'trauma-001');
    expect(caseData).toBeDefined();
    expect(inferSceneVideo(caseData!)).toBe('/scene-assets/arrival-trauma-001-rtc.mp4');
  });

  it('falls back to null when a case has no registered clip', () => {
    const caseData = allCases.find(({ id }) => id === 'resp-001');
    expect(caseData).toBeDefined();
    expect(inferSceneVideo(caseData!)).toBeNull();
  });
});
