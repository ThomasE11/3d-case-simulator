import { describe, expect, it } from 'vitest';
import { deriveSceneEnvironment, isRoadsideVehicleImpact } from './sceneEnvironment';
import type { CaseScenario } from '@/types';
import { allCases } from '@/data/cases';

function fakeCase(location: string, description = ''): CaseScenario {
  return {
    dispatchInfo: { location, callReason: 'Emergency call' },
    sceneInfo: { description, environment: '' },
  } as unknown as CaseScenario;
}

describe('deriveSceneEnvironment', () => {
  it('maps domestic scenes to home', () => {
    expect(deriveSceneEnvironment(fakeCase('Private villa in Al Barsha, Dubai'))).toBe('home');
    expect(deriveSceneEnvironment(fakeCase('Apartment in Deira, Dubai'))).toBe('home');
    expect(deriveSceneEnvironment(fakeCase('Hotel room, Dubai Marina'))).toBe('home');
  });

  it('maps commercial/public scenes to public', () => {
    expect(deriveSceneEnvironment(fakeCase('Office in Downtown Dubai'))).toBe('public');
    expect(deriveSceneEnvironment(fakeCase('Dubai Mall food court'))).toBe('public');
  });

  it('keeps vehicle incidents roadside — and roadside wins over home', () => {
    expect(deriveSceneEnvironment(fakeCase('Sheikh Zayed Road, Dubai'))).toBe('roadside');
    expect(deriveSceneEnvironment(fakeCase('Street in Deira, Dubai'))).toBe('roadside');
    expect(deriveSceneEnvironment(fakeCase('Villa in Jumeirah', 'RTA outside the villa gate'))).toBe('roadside');
  });

  it('separates construction and machinery scenes from roads', () => {
    expect(deriveSceneEnvironment(fakeCase('Construction site office, Al Quoz'))).toBe('industrial');
    expect(deriveSceneEnvironment(fakeCase('Warehouse in Jebel Ali', 'Worker trapped in machinery'))).toBe('industrial');
    // Farm scenes (barn/pesticide/sprayer) now get agricultural, not industrial
    expect(deriveSceneEnvironment(fakeCase('Cotton farm in Northern Emirates', 'Pesticide spraying incident'))).toBe('agricultural');
  });

  it('gives fire, water, and heat incidents their own environments', () => {
    expect(deriveSceneEnvironment(fakeCase('Warehouse in Jebel Ali', 'Smoke inhalation after warehouse fire'))).toBe('fire');
    expect(deriveSceneEnvironment(fakeCase('Jumeirah Beach', 'Near-drowning after sea rescue'))).toBe('water');
    expect(deriveSceneEnvironment(fakeCase('Desert worksite', 'Heatstroke during outdoor work'))).toBe('heat');
    expect(deriveSceneEnvironment(fakeCase('Construction site office', 'Patient was outside in heat prior to collapse'))).toBe('industrial');
  });

  it('honours an explicit authored environment', () => {
    const caseData = fakeCase('Office in Downtown Dubai');
    caseData.sceneInfo.environmentVariant = 'industrial';
    expect(deriveSceneEnvironment(caseData)).toBe('industrial');

    // Agricultural farm cases get authoritative authoring
    const farmCase = fakeCase('Al Ain Countryside');
    farmCase.sceneInfo.environmentVariant = 'agricultural';
    expect(deriveSceneEnvironment(farmCase)).toBe('agricultural');
  });

  it('migrates stale generic overrides when the incident is unambiguous', () => {
    const drowning = fakeCase('Hotel poolside', 'Child pulled from water');
    drowning.title = 'Hypothermic drowning';
    drowning.sceneInfo.environmentVariant = 'roadside';
    expect(deriveSceneEnvironment(drowning)).toBe('water');

    const office = fakeCase('Construction site office', 'Patient inside the portacabin office');
    office.sceneInfo.environmentVariant = 'public';
    expect(deriveSceneEnvironment(office)).toBe('public');
  });

  it('keeps representative authored cases in a coherent scene avenue', () => {
    const variantFor = (id: string) => deriveSceneEnvironment(allCases.find(item => item.id === id)!);
    expect(variantFor('litfl-001')).toBe('public');
    expect(variantFor('y2-009')).toBe('public');
    expect(variantFor('cardiac-014')).toBe('water');
    expect(variantFor('trauma-012')).toBe('water');
    expect(variantFor('env-001')).toBe('heat');
    expect(variantFor('burn-002')).toBe('industrial');
    // Verify agricultural variant is present in derived cases
    const agriEnvVariant = (id: string) => deriveSceneEnvironment(allCases.find(item => item.id === id)!);
    if (agriEnvVariant('tox-001')) {
      expect(agriEnvVariant('tox-001')).toBe('agricultural');
    }
  });

  it('falls back to clinic for ambiguous or missing scene info', () => {
    expect(deriveSceneEnvironment(fakeCase('Dubai Healthcare City'))).toBe('clinic');
    expect(deriveSceneEnvironment({} as CaseScenario)).toBe('clinic');
  });

  it('does not misclassify a haemorrhagic road incident as a water rescue', () => {
    // "blood pool" is bleeding under the patient and "Beach Road" is a street
    // name, yet a pedestrian struck by a car must stay a road incident.
    expect(
      deriveSceneEnvironment(
        fakeCase('Mamzar Beach Road, Dubai', 'Pedestrian struck by car, small blood pool forming'),
      ),
    ).toBe('roadside');
  });

  it('keeps a boiling-water scald in the kitchen instead of a water rescue', () => {
    expect(
      deriveSceneEnvironment(
        fakeCase('Residential kitchen', 'boiling water spill on arm'),
      ),
    ).toBe('home');
  });

  it('does not render a sports injury as heat exposure', () => {
    // A twisted leg on a school pitch is a location, not a heat illness.
    expect(
      deriveSceneEnvironment(
        fakeCase('School sports field, Dubai', 'twisted leg in football'),
      ),
    ).not.toBe('heat');
  });

  it('does not turn a gym in an "Industrial Area" district into a worksite', () => {
    // "Industrial Area" is an address district, not the incident setting; a
    // cardiac arrest in the gym is a public venue.
    expect(
      deriveSceneEnvironment(
        fakeCase('FitLife Gym, Al Quoz Industrial Area, Dubai', 'collapsed at gym'),
      ),
    ).toBe('public');
  });

  it('authors an environmentVariant for every distinctive derived scene', () => {
    // Distinctive outdoor/rescue variants (industrial/fire/water/heat/
    // agricultural/roadside) drive the 3D bay, survey tone and entry-dolly
    // origin, so they must be authored rather than left to keyword heuristics
    // that a wording tweak could silently flip back to clinic.
    const DISTINCTIVE = new Set(['industrial', 'fire', 'water', 'heat', 'agricultural', 'roadside']);
    const unauthored: string[] = [];
    for (const caseData of allCases) {
      if (caseData.sceneInfo?.environmentVariant) continue;
      const derived = deriveSceneEnvironment(caseData);
      if (DISTINCTIVE.has(derived)) unauthored.push(`${caseData.id}: ${derived}`);
    }
    expect(unauthored, unauthored.join('\n')).toEqual([]);
  });

  it('does not dress a generic roadside with a struck vehicle', () => {
    // A moped spill, a fall from a kerb, a twisted leg on a pitch: roadside,
    // but no car, so the wrecked sedan must not render.
    const roadside = allCases.filter(c => deriveSceneEnvironment(c) === 'roadside');
    const nonImpact = roadside.filter(c => !isRoadsideVehicleImpact(c));
    expect(nonImpact.length).toBeGreaterThan(0);
    for (const c of nonImpact) {
      expect(isRoadsideVehicleImpact(c)).toBe(false);
    }
  });

  it('every vehicle-impacted case is roadside', () => {
    const impacted = allCases.filter(c => isRoadsideVehicleImpact(c));
    expect(impacted.length).toBeGreaterThan(0);
    for (const c of impacted) {
      expect(deriveSceneEnvironment(c)).toBe('roadside');
    }
  });
});
