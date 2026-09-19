import { describe, expect, it } from 'vitest';
import {
  archetypeMeshVisible,
  isBathroomFallProfile,
  isResp001VillaProfile,
  isTrauma008RoadsideProfile,
  isY2007OdBedroomProfile,
  resolveSceneProfile,
  resp001VillaMeshVisible,
  SCENE_ARCHETYPES,
  type SceneProfile,
} from './sceneProfile';

describe('sceneProfile', () => {
  it('recognises resp-001 villa profile', () => {
    const profile: SceneProfile = 'resp-001-villa';
    expect(isResp001VillaProfile(profile)).toBe(true);
    expect(isResp001VillaProfile(undefined)).toBe(false);
  });

  it('hides vacated asthma chair meshes after transfer', () => {
    expect(resp001VillaMeshVisible('asthma_chair_seat', false)).toBe(false);
    expect(resp001VillaMeshVisible('asthma_chair_seat', true)).toBe(true);
    expect(resp001VillaMeshVisible('asthma_rug', false)).toBe(true);
  });

  it('hides Jutsu room-shell meshes so HomeScene walls are not doubled', () => {
    const villa = SCENE_ARCHETYPES.find(entry => entry.profile === 'resp-001-villa');
    expect(villa).toBeDefined();
    expect(villa!.revision).toBe(7);
    expect(archetypeMeshVisible(['Sofa_cushion_1'], villa!)).toBe(true);
    expect(archetypeMeshVisible(['side_table'], villa!)).toBe(true);
    expect(archetypeMeshVisible(['first_aid_cabinet'], villa!)).toBe(true);
    expect(archetypeMeshVisible(['Coffee_table_top'], villa!)).toBe(false);
    expect(archetypeMeshVisible(['Coffee_table_leg002'], villa!)).toBe(false);
    expect(archetypeMeshVisible(['Back_plaster'], villa!)).toBe(false);
    expect(archetypeMeshVisible(['Travertine_floor'], villa!)).toBe(false);
    expect(archetypeMeshVisible(['Left_return'], villa!)).toBe(false);
  });

  it('resolves P0 archetypes by case id', () => {
    expect(resolveSceneProfile({ id: 'resp-001' } as any)).toBe('resp-001-villa');
    expect(resolveSceneProfile({ id: 'y2-007' } as any)).toBe('y2-007-od-bedroom');
    expect(resolveSceneProfile({ id: 'trauma-008' } as any)).toBe('trauma-008-roadside');
    expect(resolveSceneProfile({ id: 'fall-001' } as any)).toBe('bathroom-fall');
    expect(resolveSceneProfile({ id: 'fall-003' } as any)).toBe('bathroom-fall');
    expect(resolveSceneProfile({ id: 'litfl-012' } as any)).toBe('bathroom-fall');
    expect(isY2007OdBedroomProfile('y2-007-od-bedroom')).toBe(true);
    expect(isTrauma008RoadsideProfile('trauma-008-roadside')).toBe(true);
    expect(isBathroomFallProfile('bathroom-fall')).toBe(true);
  });

  it('does not dress a living-room fall as a bathroom', () => {
    expect(
      resolveSceneProfile({
        id: 'y1-001',
        sceneInfo: { description: 'Ground floor apartment, patient on living room floor' },
      } as any),
    ).toBeUndefined();
  });

  it('keeps sedan Cube children when an ancestor matches the include prefix', () => {
    const roadside = SCENE_ARCHETYPES.find(entry => entry.profile === 'trauma-008-roadside');
    expect(roadside).toBeDefined();
    expect(archetypeMeshVisible(['Cube.008', 'BumperDeformProxy'], roadside!)).toBe(true);
    expect(archetypeMeshVisible(['Cube', 'car_sedan_01', 'CarSedan01'], roadside!)).toBe(true);
    expect(archetypeMeshVisible(['Cube', 'RoadAsphalt'], roadside!)).toBe(false);
  });

  it('hides bedroom shell meshes but keeps the bed', () => {
    const bedroom = SCENE_ARCHETYPES.find(entry => entry.profile === 'y2-007-od-bedroom');
    expect(bedroom).toBeDefined();
    expect(archetypeMeshVisible(['int_bed_01', 'IntBed01'], bedroom!)).toBe(true);
    expect(archetypeMeshVisible(['Cube', 'BedroomFloor'], bedroom!)).toBe(false);
    expect(archetypeMeshVisible(['Cube.002', 'BedroomWall_Back'], bedroom!)).toBe(false);
    expect(bedroom!.groundNodePrefixes).toEqual(['IntBed01']);
    expect(bedroom!.nodeOffsets).toEqual({ IntBed01: [-0.7, 0, -1.58] });
  });

  it('unrolls and grounds the roadside sedan, and grounds the bedroom bed', () => {
    const roadside = SCENE_ARCHETYPES.find(entry => entry.profile === 'trauma-008-roadside');
    expect(roadside?.unrollNodeNames).toEqual(['CarSedan01']);
    expect(roadside?.groundNodePrefixes).toEqual(['CarSedan01']);
    expect(roadside?.rootOffset).toEqual([-4.2, 0, -1.6]);
  });
});
