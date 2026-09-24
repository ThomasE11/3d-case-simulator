import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  extractSceneAnchors,
  fallbackSceneAnchors,
  firstAidMarkerPosition,
  kitBagLayout,
  plantFromRestAnchor,
  RESP001_CALIBRATED_FIRST_AID,
  RESP001_CALIBRATED_KIT,
  RESP001_CALIBRATED_REST,
  RESP001_CALIBRATED_ROOT_Z,
  RESP001_SOFA_ROOT_DROP,
} from './sceneAnchors';
import { RESP001_SEATED_SUPPORT_LIFT, getTreatmentBayTransform } from '@/components/Body3DModel/BodyMesh';

function namedEmpty(name: string, x: number, y: number, z: number) {
  const object = new THREE.Object3D();
  object.name = name;
  object.position.set(x, y, z);
  return object;
}

describe('resp-001 scene anchors', () => {
  it('plants the patient on the authored sofa rest, not the old chair origin', () => {
    const plant = plantFromRestAnchor(RESP001_CALIBRATED_REST);
    expect(plant.x).toBeCloseTo(RESP001_CALIBRATED_REST.x);
    expect(plant.z).toBeCloseTo(RESP001_CALIBRATED_ROOT_Z);
    expect(plant.seatedSupportLift).toBeCloseTo(
      RESP001_SEATED_SUPPORT_LIFT + (RESP001_CALIBRATED_REST.y - 0.541) - RESP001_SOFA_ROOT_DROP,
    );

    const transform = getTreatmentBayTransform('floor', 'tripod', 'seated', 1, plant.seatedSupportLift, plant);
    expect(transform.position[0]).toBeCloseTo(RESP001_CALIBRATED_REST.x);
    expect(transform.position[2]).toBeCloseTo(RESP001_CALIBRATED_ROOT_Z);
    expect(transform.position[1]).toBeCloseTo(-0.3672 + plant.seatedSupportLift);
  });

  it('synthesises named empties from live furniture when Jutsu empties are absent', () => {
    const root = new THREE.Group();
    root.add(namedEmpty('asthma_chair_seat_cushion', 0, 0.541, 0.5));
    root.add(namedEmpty('side_table_top', 1.28, 0.58, 0.05));
    root.add(namedEmpty('villa_media_console', 2.91, 0.38, -0.35));

    const anchors = extractSceneAnchors(root);
    expect(anchors.restSource).toBe('asthma_chair_seat_cushion');
    expect(anchors.kitSource).toBe('side_table_top');
    expect(anchors.firstAidSource).toBe('villa_media_console');
    expect(root.getObjectByName('PatientRestAnchor')).toBeTruthy();
    expect(root.getObjectByName('KitStagingAnchor')).toBeTruthy();
    expect(root.getObjectByName('FirstAidFindAnchor')).toBeTruthy();
  });

  it('lets a later PatientRestAnchor override the chair-kit cushion', () => {
    const root = new THREE.Group();
    root.add(namedEmpty('asthma_chair_seat_cushion', 0, 0.541, 0.5));
    root.add(namedEmpty('PatientRestAnchor', 0.12, 0.91, 0.42));
    root.add(namedEmpty('KitStagingAnchor', 1.4, 0.62, 0.1));
    root.add(namedEmpty('FirstAidFindAnchor', 2.4, 1.1, -0.8));

    const anchors = extractSceneAnchors(root);
    expect(anchors.restSource).toBe('PatientRestAnchor');
    expect(anchors.rest.y).toBeCloseTo(0.91);
    const plant = plantFromRestAnchor(anchors.rest);
    expect(plant.x).toBeCloseTo(0.12);
    expect(plant.seatedSupportLift).toBeCloseTo(RESP001_SEATED_SUPPORT_LIFT + (0.91 - 0.541) - RESP001_SOFA_ROOT_DROP);
  });

  it('stages ABC bags on the kit table and a first-aid marker above the cabinet', () => {
    const bags = kitBagLayout(RESP001_CALIBRATED_KIT);
    expect(bags).toHaveLength(3);
    expect(bags[0].position[0]).toBeCloseTo(RESP001_CALIBRATED_KIT.x - 0.16);
    expect(bags[0].position[1]).toBeCloseTo(RESP001_CALIBRATED_KIT.y);
    expect(firstAidMarkerPosition(RESP001_CALIBRATED_FIRST_AID)[1]).toBeCloseTo(RESP001_CALIBRATED_FIRST_AID.y + 0.32);
  });

  it('falls back to the chair-kit calibration when the GLB has no furniture names', () => {
    const anchors = extractSceneAnchors(new THREE.Group());
    expect(anchors).toEqual(fallbackSceneAnchors());
    expect(anchors.restSource).toBe('calibrated-patient-rest');
  });
});
