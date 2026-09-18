import * as THREE from 'three';
import { RESP001_SEATED_SUPPORT_LIFT } from '@/components/Body3DModel/BodyMesh';

export type SceneAnchorPoint = { x: number; y: number; z: number };

export type SceneAnchorSet = {
  rest: SceneAnchorPoint;
  kit: SceneAnchorPoint;
  firstAid: SceneAnchorPoint;
  restSource: string;
  kitSource: string;
  firstAidSource: string;
};

/**
 * Calibrated against the chair-kit `asthma_chair_seat_cushion` that ships in
 * `public/models/scenes/resp-001-villa-dressing.glb`. Named empties from a
 * later Jutsu drop (PatientRestAnchor at cushion top ≈ 0.91 m) override these
 * at runtime without a second wiring pass.
 */
export const RESP001_CALIBRATED_REST: SceneAnchorPoint = { x: 0, y: 0.541, z: 0.5 };
export const RESP001_CALIBRATED_KIT: SceneAnchorPoint = { x: 1.28, y: 0.58, z: 0.05 };
export const RESP001_CALIBRATED_FIRST_AID: SceneAnchorPoint = { x: 2.91, y: 0.38, z: -0.35 };
export const RESP001_CALIBRATED_ROOT_Z = 0.78;
export const RESP001_SEAT_FORWARD = RESP001_CALIBRATED_ROOT_Z - RESP001_CALIBRATED_REST.z;

const REST_NAMES = [
  'PatientRestAnchor',
  'Sofa cushion 1',
  'asthma_chair_seat_cushion',
  'villa_sofa_seat_1',
] as const;

const KIT_NAMES = [
  'KitStagingAnchor',
  'side_table',
  'side_table_top',
] as const;

const FIRST_AID_NAMES = [
  'FirstAidFindAnchor',
  'first_aid_cabinet',
  'villa_media_console',
] as const;

function worldPoint(object: THREE.Object3D): SceneAnchorPoint {
  object.updateWorldMatrix(true, false);
  const point = new THREE.Vector3();
  object.getWorldPosition(point);
  return { x: point.x, y: point.y, z: point.z };
}

function findNamed(root: THREE.Object3D, names: readonly string[]): { object: THREE.Object3D; name: string } | null {
  for (const name of names) {
    const object = root.getObjectByName(name);
    if (object) return { object, name };
  }
  return null;
}

function ensureEmpty(root: THREE.Object3D, name: string, point: SceneAnchorPoint): THREE.Object3D {
  const existing = root.getObjectByName(name);
  if (existing) return existing;
  const empty = new THREE.Object3D();
  empty.name = name;
  empty.position.set(point.x, point.y, point.z);
  empty.userData.ps_role = name;
  empty.userData.ps_case = 'resp-001';
  root.add(empty);
  return empty;
}

export function fallbackSceneAnchors(): SceneAnchorSet {
  return {
    rest: { ...RESP001_CALIBRATED_REST },
    kit: { ...RESP001_CALIBRATED_KIT },
    firstAid: { ...RESP001_CALIBRATED_FIRST_AID },
    restSource: 'calibrated-chair-cushion',
    kitSource: 'calibrated-side-table',
    firstAidSource: 'calibrated-media-console',
  };
}

/** Pull rest / kit / first-aid points from a loaded villa GLB. */
export function extractSceneAnchors(root: THREE.Object3D): SceneAnchorSet {
  const restHit = findNamed(root, REST_NAMES);
  const kitHit = findNamed(root, KIT_NAMES);
  const firstAidHit = findNamed(root, FIRST_AID_NAMES);
  const rest = restHit ? worldPoint(restHit.object) : { ...RESP001_CALIBRATED_REST };
  const kit = kitHit ? worldPoint(kitHit.object) : { ...RESP001_CALIBRATED_KIT };
  const firstAid = firstAidHit ? worldPoint(firstAidHit.object) : { ...RESP001_CALIBRATED_FIRST_AID };

  ensureEmpty(root, 'PatientRestAnchor', rest);
  ensureEmpty(root, 'KitStagingAnchor', kit);
  ensureEmpty(root, 'FirstAidFindAnchor', firstAid);

  return {
    rest,
    kit,
    firstAid,
    restSource: restHit?.name ?? 'calibrated-chair-cushion',
    kitSource: kitHit?.name ?? 'calibrated-side-table',
    firstAidSource: firstAidHit?.name ?? 'calibrated-media-console',
  };
}

export function plantFromRestAnchor(rest: SceneAnchorPoint): {
  x: number;
  z: number;
  seatedSupportLift: number;
} {
  return {
    x: rest.x,
    z: rest.z + RESP001_SEAT_FORWARD,
    seatedSupportLift: RESP001_SEATED_SUPPORT_LIFT + (rest.y - RESP001_CALIBRATED_REST.y),
  };
}

/** ABC jump bags staged on the kit table instead of the clinic floor pile. */
export function kitBagLayout(kit: SceneAnchorPoint): Array<{
  key: 'airway' | 'breathing' | 'circulation';
  label: string;
  color: string;
  position: [number, number, number];
  rotation: number;
}> {
  return [
    { key: 'airway', label: 'A', color: '#f59e0b', position: [kit.x - 0.16, kit.y, kit.z - 0.06], rotation: 0.35 },
    { key: 'breathing', label: 'B', color: '#0ea5e9', position: [kit.x + 0.02, kit.y, kit.z + 0.10], rotation: -0.15 },
    { key: 'circulation', label: 'C', color: '#f43f5e', position: [kit.x + 0.18, kit.y, kit.z - 0.04], rotation: 0.45 },
  ];
}

export function firstAidMarkerPosition(firstAid: SceneAnchorPoint): [number, number, number] {
  return [firstAid.x, firstAid.y + 0.32, firstAid.z];
}
