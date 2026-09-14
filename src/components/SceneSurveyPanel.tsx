/**
 * SceneSurveyPanel
 *
 * Guided scene size-up phase between Pre-Brief and Active Case. Mirrors the
 * real paramedic Scene Survey / DRSABCD "D" step that students are scored
 * on in HAAD/NREMT practical exams but tend to skip in simulation.
 *
 * Hard gate: Enter Scene is disabled until the student completes hazard
 * identification, PPE selection, and forms a general impression. The case
 * timer doesn't start until Enter Scene is pressed - scene survey is
 * pre-arrival and shouldn't eat case clock.
 *
 * Each step plays a short Supertonic-backed narration cue (narrator F2 +
 * dispatcher M2) so the phase feels like rolling up on a real call.
 */

import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { CaseScenario } from '@/types';
import { inferAnatomy, inferInjuries, type BodyInjury } from '@/lib/injuryMap';
import { getSceneTimeLabel, getScenePatientDescriptor } from '@/lib/sceneNarrative';
import { SceneSensoryStrip } from '@/components/SceneSensoryStrip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';
import { caseSceneNeedsPatientOverlay, inferSceneImage } from '@/lib/sceneImageSelection';
import { patientAgeBand, patientAgeScale } from '@/lib/patientAgePresentation';
import { dispatchAccessNotes, mandatoryScenePpe, visibleSceneHazards } from '@/lib/sceneSafety';
import {
  Shield, AlertTriangle, Eye, HardHat, Stethoscope, ArrowRight,
  ArrowLeft, CheckCircle2, Volume2, VolumeX, Flame, Zap, CloudRain,
  ShieldAlert, Biohazard, Building2, Construction, Car, Bug,
  MapPin, Users, Radio, Footprints, Search,
} from 'lucide-react';

interface SceneSurveyPanelProps {
  caseData: CaseScenario;
  onEnterScene: (survey: SceneSurveyResult) => void;
  onBack: () => void;
}

export interface SceneSurveyResult {
  hazardsIdentified: string[];
  sceneDeclaredSafe: boolean;
  additionalResourcesRequested: string[];
  ppeSelected: string[];
  generalImpression: string[];
  completedAt: number;
}

// Scene survey collapsed to two steps: arrive (approach) then a combined
// hazards + PPE step, after which the student enters the scene. The old
// standalone 'ppe' and 'impression' steps were removed — PPE folds into the
// hazards step and the general-impression step was dropped as redundant.
type Step = 'approach' | 'hazards';

const HAZARD_OPTIONS: Array<{ id: string; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: 'none', label: 'None identified', icon: CheckCircle2 },
  { id: 'traffic', label: 'Traffic', icon: Car },
  { id: 'fire', label: 'Fire / heat', icon: Flame },
  { id: 'electrical', label: 'Electrical', icon: Zap },
  { id: 'violence', label: 'Violence / weapons', icon: ShieldAlert },
  { id: 'biohazard', label: 'Biohazard', icon: Biohazard },
  { id: 'weather', label: 'Weather', icon: CloudRain },
  { id: 'structural', label: 'Structural', icon: Building2 },
  { id: 'access', label: 'Access / extrication', icon: Construction },
  { id: 'animals', label: 'Animals / pests', icon: Bug },
];

const PPE_OPTIONS: Array<{ id: string; label: string }> = [
  { id: 'gloves', label: 'Gloves' },
  { id: 'mask', label: 'Surgical mask' },
  { id: 'n95', label: 'N95 respirator' },
  { id: 'eye', label: 'Eye protection' },
  { id: 'gown', label: 'Gown / apron' },
  { id: 'helmet', label: 'Helmet' },
  { id: 'hivis', label: 'Hi-vis vest' },
];

const RESOURCE_OPTIONS = [
  'Fire', 'Police', 'Additional ambulance', 'HazMat', 'Rescue / extrication', 'Air ambulance',
];

type SceneTone = {
  gradient: string;
  accent: string;
  floor: string;
  patientPose: string;
  responderLine: string;
  setting: 'road' | 'industrial' | 'agricultural' | 'public' | 'venue' | 'water' | 'home' | 'fire' | 'heat' | 'medical';
};

type HazardHotspot = {
  id: string;
  label: string;
  kind: string;
  icon: ComponentType<{ className?: string }>;
  x: number;
  y: number;
};

type SceneCallout = {
  id: string;
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  x: number;
  y: number;
  align?: 'left' | 'right';
};

const HOTSPOT_POSITIONS = [
  { x: 18, y: 68 },
  { x: 74, y: 30 },
  { x: 58, y: 73 },
  { x: 36, y: 36 },
  { x: 85, y: 62 },
  { x: 47, y: 20 },
  { x: 26, y: 48 },
  { x: 66, y: 48 },
];

type TemporalTreatment = {
  label: string;
  note: string;
  chipClass: string;
  overlayClass: string;
};

function inferTemporalTreatment(caseData: CaseScenario): TemporalTreatment {
  const label = getSceneTimeLabel(caseData);
  const text = [
    label,
    caseData.dispatchInfo?.timeOfDay,
    caseData.sceneInfo?.environment,
    caseData.sceneInfo?.description,
  ].filter(Boolean).join(' ').toLowerCase();

  if (/night|dark|poor lighting|low light|evening|late/.test(text)) {
    return {
      label,
      note: 'Low-light scene: hazards and patient colour are harder to read.',
      chipClass: 'border-sky-200/30 bg-sky-950/65 text-sky-50',
      overlayClass: 'bg-[radial-gradient(circle_at_58%_34%,rgba(125,211,252,0.22),transparent_24%),linear-gradient(120deg,rgba(2,6,23,0.72),rgba(15,23,42,0.34),rgba(2,6,23,0.68))]',
    };
  }

  if (/morning|dawn|early/.test(text)) {
    return {
      label,
      note: 'Morning light: softer shadows, indoor/outdoor contrast matters.',
      chipClass: 'border-amber-100/35 bg-amber-200/18 text-amber-50',
      overlayClass: 'bg-[linear-gradient(120deg,rgba(251,191,36,0.18),rgba(255,255,255,0.04),rgba(15,23,42,0.16))]',
    };
  }

  if (/afternoon|midday|hot|sun|heat|desert/.test(text)) {
    return {
      label,
      note: 'Daylight/heat scene: look for sun exposure, dehydration, hot surfaces.',
      chipClass: 'border-orange-100/35 bg-orange-400/18 text-orange-50',
      overlayClass: 'bg-[radial-gradient(circle_at_70%_18%,rgba(251,146,60,0.22),transparent_22%),linear-gradient(120deg,rgba(251,191,36,0.10),transparent,rgba(15,23,42,0.10))]',
    };
  }

  return {
    label,
    note: 'Lighting should match the dispatch time and environment.',
    chipClass: 'border-white/20 bg-black/45 text-white',
    overlayClass: 'bg-transparent',
  };
}

function getInjuryScenePosition(injury: BodyInjury, index: number): { x: number; y: number } {
  const fallback = HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  switch (injury.region) {
    case 'head':
    case 'face':
      return { x: 53, y: 37 };
    case 'neck':
    case 'airway':
      return { x: 53, y: 43 };
    case 'chest':
      return { x: 55, y: 51 };
    case 'abdomen':
      return { x: 54, y: 60 };
    case 'pelvis':
      return { x: 54, y: 68 };
    case 'left-arm':
      return { x: 68, y: 54 };
    case 'right-arm':
      return { x: 41, y: 54 };
    case 'left-leg':
      return { x: 62, y: 76 };
    case 'right-leg':
      return { x: 46, y: 76 };
    case 'back':
      return { x: 53, y: 57 };
    default:
      return fallback;
  }
}

/**
 * Shorten a dispatch call-reason to the core presenting complaint — drops the
 * mechanism/location tail and any second clause. E.g.
 *   "difficulty breathing after eating at restaurant, swollen face"
 *     → "difficulty breathing"
 */
// Leading demographic / filler tokens to peel off a complaint clause. Looped
// so multi-word leads ("Elderly man …", "32-year-old female …") fully clear.
const COMPLAINT_LEAD_STRIPPERS: RegExp[] = [
  /^\s*\d+\s*[-\s]?\s*(?:year|yr|month|mo)s?[-\s]?old\b\s*/i,
  /^\s*\d+\s*(?:yo|y\/o|y)\b\s*/i,
  /^\s*(?:male|female|man|woman|boy|girl|patient|pt|adult|elderly|young|older|old|teenage|teenager|infant|toddler|child|baby|son|daughter|parents?|mother|father|caller)\b\s*/i,
  // grammatical fillers that would double up with the sentence's "with"
  /^\s*(?:with|having|complaining of|c\/o|reports?|reporting|presents? with|presenting with|now|new|sudden onset of)\b\s*/i,
];

function shortComplaint(callReason?: string): string {
  if (!callReason) return '';
  // A clause is "demographic only" when nothing meaningful remains after
  // removing ages and gender/role words — e.g. "Female", "42", "32yo male".
  // Dispatch reasons come in many shapes: "32-year-old female difficulty
  // breathing…" (inline) AND "Female, 42, breathing difficulty…" (comma-led
  // demographics). The latter broke the old split(',')[0] → "Female".
  const isDemographicOnly = (clause: string): boolean => {
    const words = clause.toLowerCase().replace(/[^a-z0-9/]+/g, ' ').split(/\s+/).filter(Boolean);
    if (!words.length) return true;
    const demo = /^(?:\d+(?:yo|y\/o|y|yr|yrs)?|male|female|man|woman|boy|girl|m|f|patient|pt|adult|elderly|year|years|old)$/;
    return words.every(w => demo.test(w));
  };
  // Gestational status ("39 weeks pregnant") is a descriptor, not the presenting
  // complaint — skip it so we surface "contractions…" instead.
  const isGestational = (clause: string): boolean => /\bweeks?\s+pregnant\b/i.test(clause) || /^\s*g\d+\s*p\d+/i.test(clause);

  const clauses = callReason.split(',').map(c => c.trim()).filter(Boolean);
  let s = clauses.find(c => !isDemographicOnly(c) && !isGestational(c))
    ?? clauses.find(c => !isDemographicOnly(c))
    ?? '';
  if (!s) return '';
  // Drop a mechanism/location tail ("… after a fall", "… while running").
  s = s.split(/\s+(?:after|while|whilst|at|following|during)\s+/i)[0];
  // Loop-strip leading demographics + fillers until nothing more peels off, so
  // "Elderly man struggling…" → "struggling…" and "2-year-old with cough" →
  // "cough" (no leftover "with" that would double the sentence's own "with").
  let prev: string;
  do {
    prev = s;
    for (const re of COMPLAINT_LEAD_STRIPPERS) s = s.replace(re, '');
  } while (s !== prev);
  return s.replace(/["“”]/g, '').replace(/[.!?]+$/, '').trim();
}

/**
 * Is the complaint verb-led ("fell off bicycle", "struggling to breathe",
 * "taken overdose")? Those don't read as "a patient WITH fell off bicycle", so
 * the arrival sentence uses an em-dash for them instead of "with".
 */
function isVerbLedComplaint(complaint: string): boolean {
  const first = (complaint.split(/\s+/)[0] || '').toLowerCase();
  const verbs = new Set(['fell', 'fallen', 'collapsed', 'took', 'taken', 'struck', 'hit', 'stabbed', 'burned', 'burnt', 'found', 'cut', 'crashed', 'ingested', 'overdosed', 'swallowed', 'choking', 'choked', 'struggling', 'passed', 'slipped', 'tripped', 'fitting', 'seizing', 'unable', 'cannot', 'can’t', 'feels', 'feeling']);
  const stateLed = /^(?:increasingly|progressively|suddenly|acutely|becoming|appears?|unwell|confused|drowsy|lethargic|unresponsive|agitated|not breathing)\b/i.test(complaint);
  return verbs.has(first) || stateLed || (/ed$/.test(first) && first.length > 3);
}

/**
 * Minimal on-arrival sentence: "On arrival, you find a 32-year-old female with
 * difficulty breathing." This is what the student should SEE and HEAR on
 * arrival — not a wall of scene metadata.
 */
export function buildArrivalSentence(c: CaseScenario): string {
  const detailedWho = getScenePatientDescriptor(c);
  // The visual arrival narration already shows the exact infant age in the
  // patient summary. Keep the spoken sentence natural ("a female infant")
  // while the scene brief and clinical handovers retain "8-month-old".
  const who = detailedWho === 'multiple patients'
    ? detailedWho
    : detailedWho.replace(/^\d+-month-old\s+/, '');
  const complaint = shortComplaint(c.dispatchInfo?.callReason);
  if (!complaint) return `On arrival, you find a ${who} on scene.`;
  // "with" for symptom phrases, "who" for negative ability clauses, and an
  // em-dash for other verb-led ones so dispatch shorthand remains grammatical.
  const connector = /^(?:cannot|can’t|unable)\b/i.test(complaint)
    ? 'who'
    : isVerbLedComplaint(complaint) ? '—' : 'with';
  return `On arrival, you find a ${who} ${connector} ${complaint.toLowerCase()}.`;
}

/**
 * The spoken arrival narration. Deliberately minimal — the presenting patient,
 * the location, and who's present. No environment/scene-description dump and
 * no hazard list (hazards are for the student to scan, not to be told).
 */
function buildApproachNarration(c: CaseScenario): string {
  const parts: string[] = [buildArrivalSentence(c)];
  if (c.dispatchInfo?.location) parts.push(`You're at ${c.dispatchInfo.location.replace(/\.$/, '')}.`);
  // bystanders strings already read as a sentence ("Partner and restaurant
  // staff present, other diners observing") — emit as-is, don't append "present".
  if (c.sceneInfo?.bystanders) parts.push(`${c.sceneInfo.bystanders.trim().replace(/\.$/, '')}.`);
  parts.push('Size up the scene before you approach.');
  return parts.join(' ');
}

export function sceneSurveySetting(caseData: CaseScenario): SceneTone['setting'] | null {
  switch (caseData.sceneInfo?.environmentVariant) {
    case 'roadside':
      return 'road';
    case 'industrial':
      return 'industrial';
    case 'agricultural':
      return 'agricultural';
    case 'home':
      return 'home';
    case 'fire':
      return 'fire';
    case 'heat':
      return 'heat';
    case 'public':
      return 'public';
    case 'water':
      return 'water';
    case 'clinic':
      return 'medical';
    default:
      return null;
  }
}

export function inferSceneTone(caseData: CaseScenario): SceneTone {
  const authoredSetting = sceneSurveySetting(caseData);
  const haystack = [
    caseData.category,
    caseData.subcategory,
    caseData.dispatchInfo?.callReason,
    caseData.sceneInfo?.environment,
    caseData.sceneInfo?.description,
    caseData.sceneInfo?.hazards?.join(' '),
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.position,
  ].join(' ').toLowerCase();

  if (authoredSetting === 'road' || (!authoredSetting && /traffic|road|street|vehicle|mvc|collision/.test(haystack))) {
    return {
      gradient: 'from-slate-950 via-blue-950 to-slate-900',
      accent: 'bg-blue-400',
      floor: 'bg-blue-500/15',
      patientPose: 'rotate-[7deg]',
      responderLine: 'Traffic flow, police cordon, limited working space.',
      setting: 'road',
    };
  }
  if (authoredSetting === 'agricultural') {
    return {
      gradient: 'from-emerald-950 via-lime-950 to-stone-900',
      accent: 'bg-lime-300',
      floor: 'bg-lime-500/15',
      patientPose: 'rotate-[4deg]',
      responderLine: 'Open ground, chemical drift, machinery and remote access.',
      setting: 'agricultural',
    };
  }
  if (authoredSetting === 'industrial' || (!authoredSetting && /construction|industrial|factory|warehouse|machinery|worksite/.test(haystack))) {
    return {
      gradient: 'from-stone-950 via-zinc-950 to-slate-900',
      accent: 'bg-yellow-300',
      floor: 'bg-yellow-500/15',
      patientPose: 'rotate-[5deg]',
      responderLine: 'Worksite access, machinery, overhead and ground hazards.',
      setting: 'industrial',
    };
  }
  if (authoredSetting === 'heat') {
    return {
      gradient: 'from-orange-950 via-amber-950 to-stone-900',
      accent: 'bg-amber-300',
      floor: 'bg-orange-500/15',
      patientPose: 'rotate-[-4deg]',
      responderLine: 'Radiant heat, hot surfaces, shade and cooling access.',
      setting: 'heat',
    };
  }
  if (authoredSetting === 'fire' || (!authoredSetting && /\b(fire|burn|heat|smoke|scald)\b/.test(haystack))) {
    return {
      gradient: 'from-orange-950 via-slate-950 to-slate-900',
      accent: 'bg-orange-400',
      floor: 'bg-orange-500/15',
      patientPose: 'rotate-[-10deg]',
      responderLine: 'Heat shimmer, smoke risk, rapid scene control.',
      setting: 'fire',
    };
  }
  if (authoredSetting === 'water') {
    return {
      gradient: 'from-cyan-950 via-sky-950 to-slate-900',
      accent: 'bg-cyan-200',
      floor: 'bg-cyan-500/20',
      patientPose: 'rotate-[-1deg]',
      responderLine: 'Wet surfaces, water access, cold exposure and scene edges.',
      setting: 'water',
    };
  }
  // A benign public venue (golf clubhouse, gym, office, mall, restaurant,
  // school hall) is not a hostile scene. Only genuine violence/weapon/police/
  // threat cues warrant the amber "dynamic safety assessment" dressing. The
  // authored `public` variant is ambiguous — it names a venue type, not a
  // safety posture — so we resolve it from the case's own scene words.
  if (
    authoredSetting === 'public'
    && /violence|weapon|police|threat|shouting|agitated|psychiatric|assailant|knife|shooter|gunshot|gsw|stab|not secure|unsafe|fled the scene/.test(haystack)
  ) {
    return {
      gradient: 'from-slate-950 via-amber-950 to-stone-950',
      accent: 'bg-amber-400',
      floor: 'bg-amber-500/15',
      patientPose: 'rotate-[3deg]',
      responderLine: 'Dynamic safety assessment before patient contact.',
      setting: 'public',
    };
  }
  if (authoredSetting === 'public') {
    return {
      gradient: 'from-slate-950 via-slate-900 to-stone-900',
      accent: 'bg-sky-300',
      floor: 'bg-sky-500/15',
      patientPose: 'rotate-[0deg]',
      responderLine: 'Manage bystanders, secure privacy, and clear working space.',
      setting: 'venue',
    };
  }
  if (!authoredSetting && /violence|weapon|police|threat|shouting|agitated|psychiatric/.test(haystack)) {
    return {
      gradient: 'from-slate-950 via-amber-950 to-stone-950',
      accent: 'bg-amber-400',
      floor: 'bg-amber-500/15',
      patientPose: 'rotate-[3deg]',
      responderLine: 'Dynamic safety assessment before patient contact.',
      setting: 'public',
    };
  }
  if (authoredSetting === 'medical' || (!authoredSetting && /drowsy|lethargic|slumped|altered|unresponsive|confused/.test(haystack))) {
    return {
      gradient: 'from-slate-950 via-teal-950 to-slate-900',
      accent: 'bg-teal-300',
      floor: 'bg-teal-500/15',
      patientPose: 'rotate-[-3deg]',
      responderLine: 'Altered patient: airway, breathing, medication clues, and collateral history.',
      setting: 'medical',
    };
  }
  if (!authoredSetting && /respiratory|breathless|short of breath|difficulty breathing|asthma|copd|cyanotic|tripod|wheeze/.test(haystack)) {
    return {
      gradient: 'from-cyan-950 via-slate-950 to-slate-900',
      accent: 'bg-cyan-300',
      floor: 'bg-cyan-500/15',
      patientPose: 'rotate-[-2deg]',
      responderLine: 'Listen before touching: work of breathing, speech, posture.',
      setting: 'medical',
    };
  }
  if (authoredSetting === 'home' || (!authoredSetting && /home|apartment|villa|room|bed/.test(haystack))) {
    return {
      gradient: 'from-slate-950 via-violet-950 to-slate-900',
      accent: 'bg-violet-300',
      floor: 'bg-violet-500/15',
      patientPose: 'rotate-[0deg]',
      responderLine: 'Confined scene, family present, preserve dignity.',
      setting: 'home',
    };
  }
  return {
    gradient: 'from-slate-950 via-slate-900 to-slate-800',
    accent: 'bg-emerald-300',
    floor: 'bg-emerald-500/15',
    patientPose: 'rotate-[0deg]',
    responderLine: 'Build a mental model before you step in.',
    setting: 'medical',
  };
}

// Detect anatomical findings the procedural patient should visibly reflect.
// We scan free-text fields (scene description, secondary survey, exposure,
// presentation) for the textual cues a paramedic would actually see on
// approach. Returning structured flags so the renderer doesn't have to
// re-parse strings.
// inferAnatomy + PatientAnatomy now live in src/lib/injuryMap.ts so the
// active-case InjuryMap and the 3D body pips share the same detection.
// Imported at the top of this file.

function buildSceneCallouts(caseData: CaseScenario, tone: SceneTone, sceneImage: string | null): SceneCallout[] {
  if (!sceneImage) return [];

  const position = caseData.initialPresentation?.position || 'Patient location';
  const patientCue = inferPatientVisualCue(caseData);
  const appearance = caseData.initialPresentation?.appearance || caseData.initialPresentation?.generalImpression || 'First look';
  const bystanders = caseData.sceneInfo?.bystanders || 'Bystanders';
  const hazards = (caseData.sceneInfo?.hazards || []).filter(h => !isNoHazardLabel(h));

  if (sceneImage.includes('y1-020-school-football')) {
    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, x: 58, y: 66, align: 'right' },
      { id: 'injury', label: 'Right lower leg', value: appearance, icon: Search, x: 52, y: 74 },
      { id: 'bystanders', label: 'PE teacher / teammates', value: bystanders, icon: Users, x: 22, y: 47 },
      { id: 'mechanism', label: 'Football / artificial turf', value: caseData.sceneInfo?.environment || 'Warm evening pitch', icon: AlertTriangle, x: 78, y: 35, align: 'right' },
    ];
  }

  if (caseData.id === 'cardiac-017') {
    return [
      { id: 'patient', label: 'Patient', value: position, icon: Eye, x: 31, y: 37 },
      { id: 'family', label: 'Mother', value: bystanders, icon: Users, x: 18, y: 54 },
      { id: 'cot', label: 'Cot and access', value: caseData.sceneInfo?.environment || 'Warm nursery', icon: Search, x: 68, y: 54, align: 'right' },
    ];
  }

  if (caseSceneNeedsPatientOverlay(caseData, sceneImage)) {
    const patientPosition = sceneImage.includes('y1-010-park-bicycle')
      ? { x: 62, y: 57 }
      : sceneImage.includes('paediatric-pool-rescue')
        ? { x: 63, y: 62 }
        : { x: 66, y: 54 };
    const mechanismLabel = sceneImage.includes('y1-010-park-bicycle')
      ? 'Bicycle / pathway'
      : sceneImage.includes('paediatric-pool-rescue')
        ? 'Pool / wet deck'
        : 'Cot / access';

    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, ...patientPosition, align: 'right' },
      { id: 'mechanism', label: mechanismLabel, value: hazards[0] || caseData.sceneInfo?.environment || 'Inspect the immediate scene', icon: AlertTriangle, x: 29, y: 38 },
      { id: 'first-look', label: 'First look', value: appearance, icon: Search, x: 76, y: 23, align: 'right' },
      { id: 'bystanders', label: 'Bystanders', value: bystanders, icon: Users, x: 24, y: 70 },
    ];
  }

  if (sceneImage.includes('sepsis-001-assisted-living-urosepsis')) {
    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, x: 80, y: 49, align: 'right' },
      { id: 'first-look', label: 'First look', value: appearance, icon: Search, x: 77, y: 27, align: 'right' },
      { id: 'carer', label: 'Care assistant', value: bystanders, icon: Users, x: 53, y: 31 },
      { id: 'room', label: 'Care room', value: caseData.sceneInfo?.environment || 'Warm assisted-living bedroom', icon: Building2, x: 24, y: 69 },
    ];
  }

  if (sceneImage.includes('y2-009-construction-office-arrest')) {
    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, x: 54, y: 63, align: 'right' },
      { id: 'worksite', label: 'Active worksite', value: hazards[0] || 'Hard-hat zone beyond the site office', icon: Construction, x: 46, y: 18 },
      { id: 'coworkers', label: 'Colleagues', value: bystanders, icon: Users, x: 78, y: 33, align: 'right' },
      { id: 'first-look', label: 'First look', value: appearance, icon: Search, x: 61, y: 48, align: 'right' },
    ];
  }

  if (sceneImage.includes('restaurant-anaphylaxis')) {
    return [
      {
        id: 'patient',
        label: 'Patient',
        value: patientCue || position,
        icon: Eye,
        x: 56,
        y: 47,
        align: 'right',
      },
      {
        id: 'airway-swelling',
        label: 'Airway swelling',
        value: 'Swollen lips/eyes, throat tightness',
        icon: Stethoscope,
        x: 54,
        y: 33,
        align: 'right',
      },
      {
        id: 'urticaria',
        label: 'Urticaria',
        value: appearance,
        icon: Search,
        x: 45,
        y: 68,
      },
      {
        id: 'allergen',
        label: 'Shellfish exposure',
        value: 'Prawns and seafood on table',
        icon: AlertTriangle,
        x: 67,
        y: 84,
        align: 'right',
      },
      {
        id: 'bystanders',
        label: 'Crowd / access',
        value: bystanders,
        icon: Users,
        x: 82,
        y: 38,
        align: 'right',
      },
    ];
  }

  if (sceneImage.includes('construction-anaphylaxis')) {
    return [
      {
        id: 'patient',
        label: 'Patient',
        value: patientCue || position,
        icon: Eye,
        x: 28,
        y: 54,
      },
      {
        id: 'airway-swelling',
        label: 'Critical airway',
        value: 'Face/neck angioedema, stridor',
        icon: Stethoscope,
        x: 29,
        y: 35,
      },
      {
        id: 'sting-site',
        label: 'Bee sting site',
        value: 'Right forearm swelling',
        icon: Bug,
        x: 62,
        y: 64,
      },
      {
        id: 'skin-shock',
        label: 'Urticaria / shock',
        value: appearance,
        icon: Search,
        x: 39,
        y: 58,
      },
      {
        id: 'site-hazards',
        label: 'Overhead hazards',
        value: hazards.find(h => /construction|overhead|site/i.test(h)) || 'Overhead and ground hazards',
        icon: Construction,
        x: 43,
        y: 16,
      },
      {
        id: 'crew',
        label: 'Crew / access',
        value: bystanders,
        icon: Users,
        x: 67,
        y: 27,
        align: 'right',
      },
      {
        id: 'heat',
        label: 'Heat',
        value: 'Outdoor 42C, limited shade',
        icon: Flame,
        x: 83,
        y: 22,
        align: 'right',
      },
    ];
  }

  if (sceneImage.includes('resp-009-restaurant-choking')) {
    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, x: 55, y: 47, align: 'right' },
      { id: 'airway', label: 'Airway obstruction', value: 'Hands to throat, unable to speak', icon: Stethoscope, x: 55, y: 35, align: 'right' },
      { id: 'food', label: 'Food trigger', value: 'Meal still on table', icon: AlertTriangle, x: 61, y: 76, align: 'right' },
      { id: 'bystander', label: 'Companion / staff', value: bystanders, icon: Users, x: 82, y: 37, align: 'right' },
      { id: 'first-look', label: 'First look', value: appearance, icon: Search, x: 72, y: 24, align: 'right' },
    ];
  }

  if (sceneImage.includes('burn-001') || sceneImage.includes('y2-004-workshop-flash-burn')) {
    const majorFire = sceneImage.includes('burn-001');
    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, x: majorFire ? 55 : 57, y: majorFire ? 52 : 48, align: 'right' },
      { id: 'airway-soot', label: 'Airway cue', value: 'Soot near nose/mouth, cough risk', icon: Stethoscope, x: majorFire ? 49 : 56, y: majorFire ? 33 : 30, align: 'right' },
      { id: 'burns', label: 'Burns / cooling', value: appearance, icon: Flame, x: majorFire ? 58 : 50, y: majorFire ? 62 : 58, align: 'right' },
      { id: 'source', label: majorFire ? 'Smoke source' : 'Welding source', value: caseData.sceneInfo?.environment || 'Workshop hazard', icon: AlertTriangle, x: majorFire ? 27 : 33, y: majorFire ? 35 : 38 },
      { id: 'workers', label: 'Coworkers', value: bystanders, icon: Users, x: majorFire ? 83 : 78, y: majorFire ? 35 : 34, align: 'right' },
    ];
  }

  if (sceneImage.includes('trauma-011-industrial-hand-amputation')) {
    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, x: 55, y: 52, align: 'right' },
      { id: 'dressing', label: 'Pressure dressing', value: 'Wrapped hand/wrist, bleeding controlled', icon: Shield, x: 42, y: 54 },
      { id: 'machine', label: 'Machine hazard', value: hazards.find(h => /machine|machinery|equipment/i.test(h)) || 'Industrial machinery stopped', icon: Construction, x: 26, y: 29 },
      { id: 'shock', label: 'First look', value: appearance, icon: Search, x: 63, y: 35, align: 'right' },
      { id: 'crew', label: 'Coworkers', value: bystanders, icon: Users, x: 82, y: 35, align: 'right' },
    ];
  }

  if (sceneImage.includes('trauma-005-trapped-driver-flail-chest')) {
    return [
      { id: 'patient', label: 'Trapped driver', value: patientCue || position, icon: Eye, x: 46, y: 47, align: 'right' },
      { id: 'breathing', label: 'Chest injury', value: 'Clutching chest, accessory muscle use', icon: Stethoscope, x: 48, y: 58, align: 'right' },
      { id: 'vehicle', label: 'Vehicle damage', value: 'Extrication and access risk', icon: Car, x: 28, y: 33 },
      { id: 'traffic', label: 'Road scene', value: hazards.find(h => /traffic|road|vehicle/i.test(h)) || 'Traffic control required', icon: AlertTriangle, x: 83, y: 57, align: 'right' },
      { id: 'rescue', label: 'Rescue crew', value: bystanders, icon: Users, x: 83, y: 31, align: 'right' },
    ];
  }

  if (sceneImage.includes('resp-002-construction-tension-pneumothorax')) {
    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, x: 54, y: 52, align: 'right' },
      { id: 'breathing', label: 'Respiratory distress', value: 'Chest splinting, cyanosis, tachypnoea', icon: Stethoscope, x: 55, y: 39, align: 'right' },
      { id: 'mechanism', label: 'Fall mechanism', value: 'Ladder/scaffold nearby', icon: Construction, x: 37, y: 29 },
      { id: 'crew', label: 'Coworkers', value: bystanders, icon: Users, x: 84, y: 39, align: 'right' },
      { id: 'heat-access', label: 'Access / heat', value: caseData.sceneInfo?.environment || 'Hot active worksite', icon: AlertTriangle, x: 83, y: 72, align: 'right' },
    ];
  }

  if (sceneImage.includes('resp-008-female-pulmonary-oedema')) {
    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, x: 59, y: 48, align: 'right' },
      { id: 'breathing', label: 'Orthopnoea', value: 'Bolt upright, cannot lie flat', icon: Stethoscope, x: 60, y: 36, align: 'right' },
      { id: 'sputum', label: 'Pulmonary oedema cue', value: appearance, icon: Search, x: 59, y: 30, align: 'right' },
      { id: 'meds', label: 'Home meds / oxygen', value: 'Medicines and oxygen nearby', icon: Shield, x: 86, y: 70, align: 'right' },
      { id: 'family', label: 'Family', value: bystanders, icon: Users, x: 42, y: 28 },
    ];
  }

  if (sceneImage.includes('env-002-heat-stroke')) {
    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, x: 54, y: 53, align: 'right' },
      { id: 'heat', label: 'Heat exposure', value: 'Hot, altered, worksite sun exposure', icon: Flame, x: 80, y: 25, align: 'right' },
      { id: 'cooling', label: 'Cooling started', value: 'Damp towels, water, shade', icon: CloudRain, x: 57, y: 30, align: 'right' },
      { id: 'crew', label: 'Coworkers', value: bystanders, icon: Users, x: 33, y: 34 },
      { id: 'site', label: 'Construction site', value: caseData.sceneInfo?.environment || 'Outdoor hot worksite', icon: Construction, x: 83, y: 62, align: 'right' },
    ];
  }

  if (sceneImage.includes('mall-foodcourt')) {
    return [
      {
        id: 'patient',
        label: 'Patient',
        value: patientCue || position,
        icon: Eye,
        x: 76,
        y: 45,
        align: 'right',
      },
      {
        id: 'security',
        label: 'Security',
        value: bystanders,
        icon: Users,
        x: 27,
        y: 25,
      },
      {
        id: 'environment',
        label: 'Scene safety',
        value: caseData.sceneInfo?.environment || 'Safe public area',
        icon: Shield,
        x: 38,
        y: 64,
      },
      {
        id: 'first-look',
        label: 'First look',
        value: appearance,
        icon: Search,
        x: 88,
        y: 23,
        align: 'right',
      },
    ];
  }

  if (sceneImage.includes('home-copd')) {
    return [
      {
        id: 'patient',
        label: 'Patient',
        value: patientCue || position,
        icon: Eye,
        x: 69,
        y: 38,
        align: 'right',
      },
      {
        id: 'oxygen',
        label: 'Oxygen source',
        value: hazards.find(h => /oxygen/i.test(h)) || 'Oxygen cylinder present',
        icon: Flame,
        x: 93,
        y: 43,
        align: 'right',
      },
      {
        id: 'bystander',
        label: 'Wife',
        value: bystanders,
        icon: Users,
        x: 31,
        y: 36,
      },
      {
        id: 'first-look',
        label: 'First look',
        value: appearance,
        icon: Search,
        x: 82,
        y: 18,
        align: 'right',
      },
    ];
  }

  if (sceneImage.includes('construction-fall')) {
    return [
      {
        id: 'patient',
        label: 'Patient',
        value: patientCue || position,
        icon: Eye,
        x: 53,
        y: 61,
        align: 'right',
      },
      {
        id: 'scaffold',
        label: 'Fall hazard',
        value: caseData.sceneInfo?.description || 'Scaffolding nearby',
        icon: Construction,
        x: 20,
        y: 26,
      },
      {
        id: 'ground',
        label: 'Ground / debris',
        value: hazards.find(h => /uneven|debris/i.test(h)) || 'Uneven ground',
        icon: AlertTriangle,
        x: 20,
        y: 72,
      },
      {
        id: 'workers',
        label: 'Workers',
        value: bystanders,
        icon: Users,
        x: 82,
        y: 27,
        align: 'right',
      },
      {
        id: 'first-look',
        label: 'First look',
        value: appearance,
        icon: Search,
        x: 78,
        y: 62,
        align: 'right',
      },
    ];
  }

  if (sceneImage.includes('farm-toxicology')) {
    return [
      {
        id: 'patient',
        label: 'Patient',
        value: patientCue || position,
        icon: Eye,
        x: 73,
        y: 58,
        align: 'right',
      },
      {
        id: 'chemical',
        label: 'Chemical source',
        value: hazards.find(h => /chemical|contamination|pesticide/i.test(h)) || 'Pesticide equipment',
        icon: Biohazard,
        x: 19,
        y: 42,
      },
      {
        id: 'ppe',
        label: 'PPE cue',
        value: 'Gloves, mask, eye protection',
        icon: Shield,
        x: 23,
        y: 78,
      },
      {
        id: 'workers',
        label: 'Other workers',
        value: bystanders,
        icon: Users,
        x: 58,
        y: 33,
        align: 'right',
      },
      {
        id: 'first-look',
        label: 'First look',
        value: appearance,
        icon: Search,
        x: 92,
        y: 28,
        align: 'right',
      },
    ];
  }

  if (sceneImage.includes('elderly-fall')) {
    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, x: 58, y: 58, align: 'right' },
      { id: 'floor', label: 'Trip hazard', value: hazards.find(h => /rug|floor|slip|trip/i.test(h)) || 'Bathroom floor and loose rug', icon: AlertTriangle, x: 34, y: 72 },
      { id: 'bystander', label: 'Family', value: bystanders, icon: Users, x: 18, y: 36 },
      { id: 'first-look', label: 'First look', value: appearance, icon: Search, x: 87, y: 24, align: 'right' },
    ];
  }

  if (sceneImage.includes('asthma-villa')) {
    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, x: 58, y: 44, align: 'right' },
      { id: 'breathing', label: 'Breathing cue', value: 'Tripod posture, accessory muscle use', icon: Stethoscope, x: 77, y: 31, align: 'right' },
      { id: 'bystander', label: 'Family', value: bystanders, icon: Users, x: 24, y: 36 },
      { id: 'first-look', label: 'First look', value: appearance, icon: Search, x: 86, y: 63, align: 'right' },
    ];
  }

  if (sceneImage.includes('seizure-bedroom')) {
    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, x: 57, y: 64, align: 'right' },
      { id: 'airway', label: 'Airway space', value: 'Protect head, clear nearby hazards', icon: Shield, x: 33, y: 70 },
      { id: 'bystander', label: 'Witness', value: bystanders, icon: Users, x: 24, y: 35 },
      { id: 'first-look', label: 'First look', value: appearance, icon: Search, x: 85, y: 28, align: 'right' },
    ];
  }

  if (sceneImage.includes('psychiatric-apartment')) {
    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, x: 59, y: 46, align: 'right' },
      { id: 'safety', label: 'Safety stance', value: 'Keep exit route, do not crowd patient', icon: ShieldAlert, x: 27, y: 68 },
      { id: 'support', label: 'Support', value: bystanders, icon: Users, x: 79, y: 27, align: 'right' },
      { id: 'first-look', label: 'First look', value: appearance, icon: Search, x: 86, y: 62, align: 'right' },
    ];
  }

  if (sceneImage.includes('cardiac-arrest')) {
    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, x: 57, y: 66, align: 'right' },
      { id: 'bystanders', label: 'Bystanders', value: bystanders, icon: Users, x: 25, y: 33 },
      { id: 'access', label: 'Working space', value: hazards.find(h => /crowd|access|security/i.test(h)) || 'Clear space for CPR and AED', icon: Shield, x: 82, y: 45, align: 'right' },
      { id: 'first-look', label: 'First look', value: appearance, icon: Search, x: 84, y: 22, align: 'right' },
    ];
  }

  if (sceneImage.includes('kitchen-scald')) {
    return [
      { id: 'patient', label: 'Patient', value: patientCue || position, icon: Eye, x: 57, y: 56, align: 'right' },
      { id: 'heat-source', label: 'Heat source', value: hazards.find(h => /hot|water|kettle|burn|scald/i.test(h)) || 'Hot water / kitchen surface', icon: Flame, x: 27, y: 44 },
      { id: 'burn', label: 'Burn area', value: appearance, icon: Search, x: 84, y: 40, align: 'right' },
      { id: 'bystander', label: 'Bystander', value: bystanders, icon: Users, x: 24, y: 72 },
    ];
  }

  if (tone.setting === 'road') {
    const femalePedestrian = sceneImage.includes('female-45');
    return [
      {
        id: 'patient',
        label: 'Patient',
        value: patientCue || position,
        icon: Eye,
        x: femalePedestrian ? 70 : 62,
        y: 66,
        align: femalePedestrian ? 'right' : undefined,
      },
      {
        id: 'vehicle',
        label: 'Impact / vehicle',
        value: 'Stopped traffic hazard',
        icon: Car,
        x: femalePedestrian ? 39 : 46,
        y: femalePedestrian ? 35 : 36,
      },
      {
        id: 'bystanders',
        label: 'Bystanders',
        value: bystanders,
        icon: Users,
        x: 96,
        y: femalePedestrian ? 28 : 18,
        align: 'right',
      },
      {
        id: 'scene-light',
        label: 'Lighting / access',
        value: hazards.find(h => /light|dark|night/i.test(h)) || caseData.sceneInfo?.environment || 'Check visibility',
        icon: AlertTriangle,
        x: femalePedestrian ? 18 : 96,
        y: femalePedestrian ? 18 : 42,
        align: femalePedestrian ? undefined : 'right',
      },
      {
        id: 'first-look',
        label: 'First look',
        value: appearance,
        icon: Search,
        x: 96,
        y: femalePedestrian ? 62 : 66,
        align: 'right',
      },
    ];
  }

  return [
    {
      id: 'patient',
      label: 'Patient',
      value: patientCue || position,
      icon: Eye,
      x: 50,
      y: 52,
    },
    {
      id: 'first-look',
      label: 'First look',
      value: appearance,
      icon: Search,
      x: 72,
      y: 22,
      align: 'right',
    },
    {
      id: 'body-cue',
      label: 'Body cue',
      value: patientCue,
      icon: Footprints,
      x: 58,
      y: 74,
      align: 'right',
    },
    {
      id: 'bystanders',
      label: 'Bystanders',
      value: bystanders,
      icon: Users,
      x: 22,
      y: 34,
    },
  ];
}

function getHotspotPosition(
  hotspot: HazardHotspot,
  index: number,
  tone: SceneTone,
  sceneImage: string | null,
): { x: number; y: number } {
  if (!sceneImage) return { x: hotspot.x, y: hotspot.y };

  if (sceneImage.includes('y2-009-construction-office-arrest')) {
    if (/construction|active site|hard hat|worksite/i.test(hotspot.label)) return { x: 45, y: 17 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('y1-020-school-football')) {
    if (/player|teammate|bystander|crowd/i.test(hotspot.label)) return { x: 21, y: 47 };
    if (/light|floodlight|evening/i.test(hotspot.label)) return { x: 63, y: 17 };
    if (/access|pitch|turf|ground/i.test(hotspot.label)) return { x: 55, y: 78 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('mall-foodcourt')) {
    if (hotspot.kind === 'access') return { x: 36, y: 68 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('home-copd')) {
    if (/oxygen/i.test(hotspot.label)) return { x: 89, y: 50 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('restaurant-anaphylaxis')) {
    if (/crowd|bystander|staff/i.test(hotspot.label)) return { x: 82, y: 38 };
    if (/limited|space|access|table/i.test(hotspot.label)) return { x: 60, y: 75 };
    if (/food|allergen|prawn|seafood/i.test(hotspot.label)) return { x: 67, y: 84 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('construction-anaphylaxis')) {
    if (/bee|sting|insect|pest/i.test(hotspot.label)) return { x: 62, y: 64 };
    if (/overhead|structural/i.test(hotspot.label)) return { x: 43, y: 13 };
    if (/construction|active site/i.test(hotspot.label)) return { x: 43, y: 20 };
    if (/heat|hot|temperature|environment/i.test(hotspot.label)) return { x: 83, y: 22 };
    if (/access|gate/i.test(hotspot.label)) return { x: 67, y: 27 };
    if (/stretcher|uneven|ground/i.test(hotspot.label)) return { x: 58, y: 82 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('resp-009-restaurant-choking')) {
    if (/crowd|bystander|staff/i.test(hotspot.label)) return { x: 82, y: 38 };
    if (/limited|space|access|table/i.test(hotspot.label)) return { x: 60, y: 75 };
    if (/food|chok|meal/i.test(hotspot.label)) return { x: 61, y: 76 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('burn-001') || sceneImage.includes('y2-004-workshop-flash-burn')) {
    if (/smoke|fire|heat|burn|welding|flash/i.test(hotspot.label)) return { x: sceneImage.includes('burn-001') ? 27 : 33, y: sceneImage.includes('burn-001') ? 35 : 38 };
    if (/water|cool|wet|floor/i.test(hotspot.label)) return { x: 55, y: 76 };
    if (/worker|crowd|access/i.test(hotspot.label)) return { x: 80, y: 36 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('trauma-011-industrial-hand-amputation')) {
    if (/machine|machinery|equipment|industrial/i.test(hotspot.label)) return { x: 26, y: 29 };
    if (/blood|bleeding|body fluid|biohazard/i.test(hotspot.label)) return { x: 42, y: 54 };
    if (/access|space|worker/i.test(hotspot.label)) return { x: 82, y: 35 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('trauma-005-trapped-driver-flail-chest')) {
    if (/traffic|road|vehicle/i.test(hotspot.label)) return { x: 83, y: 57 };
    if (/extrication|trapped|access|wreckage/i.test(hotspot.label)) return { x: 31, y: 34 };
    if (/glass|debris/i.test(hotspot.label)) return { x: 76, y: 80 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('resp-002-construction-tension-pneumothorax')) {
    if (/construction|ladder|scaffold|site/i.test(hotspot.label)) return { x: 37, y: 29 };
    if (/access|uneven|ground|stretcher/i.test(hotspot.label)) return { x: 83, y: 72 };
    if (/heat|hot|sun/i.test(hotspot.label)) return { x: 78, y: 22 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('resp-008-female-pulmonary-oedema')) {
    if (/oxygen|medication|equipment/i.test(hotspot.label)) return { x: 86, y: 70 };
    if (/family|bystander|access|space/i.test(hotspot.label)) return { x: 42, y: 28 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('env-002-heat-stroke')) {
    if (/heat|hot|sun|temperature|environment/i.test(hotspot.label)) return { x: 80, y: 25 };
    if (/construction|site|overhead|structural/i.test(hotspot.label)) return { x: 83, y: 62 };
    if (/access|gate|stretcher|uneven|ground/i.test(hotspot.label)) return { x: 72, y: 78 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('construction-fall')) {
    if (/machinery|equipment/i.test(hotspot.label)) return { x: 88, y: 38 };
    if (/uneven|ground/i.test(hotspot.label)) return { x: 22, y: 78 };
    if (/debris/i.test(hotspot.label)) return { x: 78, y: 76 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('farm-toxicology')) {
    if (/chemical|contamination|pesticide/i.test(hotspot.label)) return { x: 19, y: 50 };
    if (/worker|affected/i.test(hotspot.label)) return { x: 49, y: 37 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('elderly-fall')) {
    if (/rug|floor|slip|trip|bathroom/i.test(hotspot.label)) return { x: 34, y: 73 };
    if (/access|space|narrow/i.test(hotspot.label)) return { x: 77, y: 68 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('asthma-villa')) {
    if (/oxygen|inhaler|nebul/i.test(hotspot.label)) return { x: 73, y: 54 };
    if (/access|crowd|family/i.test(hotspot.label)) return { x: 23, y: 42 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('seizure-bedroom')) {
    if (/bed|furniture|space|object|injury/i.test(hotspot.label)) return { x: 36, y: 68 };
    if (/vomit|secretion|airway/i.test(hotspot.label)) return { x: 58, y: 55 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('psychiatric-apartment')) {
    if (/violence|weapon|aggressive|police|security|threat/i.test(hotspot.label)) return { x: 61, y: 42 };
    if (/access|exit|bystander|crowd/i.test(hotspot.label)) return { x: 27, y: 72 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('cardiac-arrest')) {
    if (/crowd|bystander|access|space/i.test(hotspot.label)) return { x: 81, y: 48 };
    if (/traffic|public|security/i.test(hotspot.label)) return { x: 24, y: 34 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (sceneImage.includes('kitchen-scald')) {
    if (/hot|fire|heat|water|scald|burn|kettle/i.test(hotspot.label)) return { x: 27, y: 44 };
    if (/slip|wet|floor/i.test(hotspot.label)) return { x: 47, y: 76 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  if (tone.setting === 'road') {
    const femalePedestrian = sceneImage.includes('female-45');
    if (hotspot.kind === 'traffic') return femalePedestrian ? { x: 38, y: 45 } : { x: 43, y: 48 };
    if (hotspot.label.toLowerCase().includes('light')) return femalePedestrian ? { x: 19, y: 28 } : { x: 18, y: 24 };
    if (hotspot.kind === 'weather') return { x: 18, y: 24 };
    if (hotspot.kind === 'access') return { x: 72, y: 48 };
    if (hotspot.kind === 'structural') return { x: 78, y: 34 };
    return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
  }

  return HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
}

function isNoHazardLabel(label: string): boolean {
  return /^(none|none identified|no obvious hazards?|no hazards?|none -|clean home)/i.test(label.trim());
}

function classifyHazard(label: string): string {
  const h = label.toLowerCase();
  if (/traffic|vehicle|car|bus|road|highway|motorcycle|collision|passing/.test(h)) return 'traffic';
  if (/fire|flame|heat|hot|burn|smoke|fuel|oxygen/.test(h)) return 'fire';
  if (/electric|wire|powered|welding|light|shock/.test(h)) return 'electrical';
  if (/weapon|assailant|violence|police|shouting|agitated|aggressive|knife|shooter|panic/.test(h)) return 'violence';
  if (/blood|body fluid|needle|vomit|contamination|chemical|hazmat|solvent|substance/.test(h)) return 'biohazard';
  if (/weather|sun|cold|hot environment|hypothermia|altitude|visibility|rain|ice|water/.test(h)) return 'weather';
  if (/structural|collapse|unstable|wreckage|overhead|building|debris|glass|metal/.test(h)) return 'structural';
  if (/access|extrication|trapped|limited space|narrow|crowd|bystander|equipment|machinery|construction|uneven|ladder/.test(h)) return 'access';
  if (/animal|dog|cat|bee|insect|pest/.test(h)) return 'animals';
  return 'access';
}

export function hasReviewedEveryHazard(hazardIds: string[], selectedHazards: string[]): boolean {
  if (hazardIds.length === 0) return selectedHazards.includes('none');
  return hazardIds.every(id => selectedHazards.includes(id));
}

export function sceneSurveyGateHint({
  hazardIds,
  selectedHazards,
  sceneSafe,
  resourcesRequested,
  mandatoryPpe,
  ppeSelected,
}: {
  hazardIds: string[];
  selectedHazards: string[];
  sceneSafe: boolean | null;
  resourcesRequested: string[];
  mandatoryPpe: string[];
  ppeSelected: string[];
}): string {
  if (!hasReviewedEveryHazard(hazardIds, selectedHazards)) {
    return hazardIds.length > 0
      ? 'Identify every visible hazard on this scene.'
      : 'Complete the visual sweep before declaring the scene safe.';
  }
  if (sceneSafe === null) return 'Declare scene safety to continue.';
  if (hazardIds.length > 0 && sceneSafe === true) {
    return 'Visible hazards remain — declare the scene unsafe and request support.';
  }
  if (sceneSafe === false && resourcesRequested.length === 0) {
    return 'Request at least one additional resource.';
  }
  if (mandatoryPpe.some(id => !ppeSelected.includes(id))) {
    return 'Select every scene-required PPE item.';
  }
  return '';
}

function buildHazardHotspots(caseData: CaseScenario): HazardHotspot[] {
  return visibleSceneHazards(caseData)
    .map((hazard, index) => {
      const kind = classifyHazard(hazard);
      const option = HAZARD_OPTIONS.find(o => o.id === kind) || HAZARD_OPTIONS[0];
      const position = HOTSPOT_POSITIONS[index % HOTSPOT_POSITIONS.length];
      return {
        id: hazard,
        label: hazard,
        kind,
        icon: option.icon,
        x: position.x,
        y: position.y,
      };
    });
}

function buildInspectionCues(caseData: CaseScenario): Array<{ label: string; value: string }> {
  const cues = [
    { label: 'First look', value: caseData.initialPresentation?.generalImpression },
    { label: 'Visible cue', value: inferPatientVisualCue(caseData) },
    { label: 'Position', value: caseData.initialPresentation?.position },
    { label: 'Appearance', value: caseData.initialPresentation?.appearance },
    { label: 'Consciousness', value: caseData.initialPresentation?.consciousness },
    { label: 'Sounds', value: caseData.initialPresentation?.sounds?.join(', ') },
    { label: 'Odor', value: caseData.initialPresentation?.odor?.join(', ') },
  ];

  return cues.filter((cue): cue is { label: string; value: string } => Boolean(cue.value));
}

function inferPatientVisualCue(caseData: CaseScenario): string {
  const text = [
    caseData.title,
    caseData.category,
    caseData.subcategory,
    caseData.dispatchInfo?.callReason,
    caseData.sceneInfo?.description,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.position,
    caseData.initialPresentation?.appearance,
    caseData.secondarySurvey?.chest?.join(' '),
    caseData.secondarySurvey?.abdomen?.join(' '),
    caseData.secondarySurvey?.pelvis?.join(' '),
    caseData.secondarySurvey?.extremities?.join(' '),
    caseData.abcde?.breathing?.findings?.join(' '),
    caseData.abcde?.circulation?.findings?.join(' '),
    caseData.abcde?.disability?.findings?.join(' '),
  ].filter(Boolean).join(' ').toLowerCase();

  if (/cardiac arrest|not breathing(?!\s+properly)|no normal breathing|apneic|apnoeic|pulseless/.test(text)) {
    return 'Supine and unresponsive; no normal breathing visible';
  }
  if (/right upper quadrant|ruq|liver|paracetamol|acetaminophen/.test(text)) {
    return 'Guarding right upper abdomen; watch for pain on movement';
  }
  if (/right lower quadrant|rlq|right iliac fossa|ectopic|lower abdominal|abdominal pain|abdomen/.test(text)) {
    return /knees drawn|foetal|fetal/.test(text)
      ? 'Knees drawn up, hands guarding lower abdomen'
      : 'Hand guarding abdomen at the painful area';
  }
  if (/psychosis|psychotic|agitated|aggressive|behaviou?r|talking to unseen|hallucinat|paranoid/.test(text)) {
    return 'Keep distance; patient behaviour and exit route matter';
  }
  if (/panic|anxiety|hyperventilat/.test(text)) {
    return 'Anxious posture; pacing or seated low, rapid breathing, reassurance needed';
  }
  if (/chest pain|central chest|pressure-like|stemi|acs|angina/.test(text)) {
    return 'One hand over centre-left chest; pale or sweaty if described';
  }
  if (/drowsy|lethargic|slumped|confused|altered|reduced loc|reduced level|unresponsive/.test(text)) {
    return 'Slumped or hard to rouse; check airway, breathing, and medication clues';
  }
  if (/asthma|copd|wheeze|short of breath|difficulty breathing|respiratory distress|tripod|accessory muscle/.test(text)) {
    return 'Upright or tripod posture; shoulders working with each breath';
  }
  if (/seizure|postictal|post-ictal|tonic|convulsion|jerking/.test(text)) {
    return 'Protect head and airway; lateral/recovery position when able';
  }
  if (/burn|scald|hot water|flash/.test(text)) {
    return 'Protecting burned area; keep clothing/jewellery cues visible';
  }
  if (/pelvic|hip fracture|neck of femur|shortened|externally rotated/.test(text)) {
    return 'Guarding pelvis or hip; leg alignment is an important cue';
  }
  if (/stroke|facial droop|weak arm|hemipar|slurred|aphasia/.test(text)) {
    return 'Face/arm asymmetry should be visible before detailed exam';
  }
  if (/fall|collapsed|lying on floor/.test(text)) {
    return 'Still on floor; check head, hip, limb position, and mechanism';
  }

  return caseData.initialPresentation?.position
    || caseData.initialPresentation?.appearance
    || 'Use posture, hands, skin colour, and breathing effort to form first impression';
}

// Procedural patient figure that mirrors the case's actual injuries — leg
// rotation, deformity, pallor, etc. Falls back to a generic posture when no
// anatomical findings are present in the case data.
function ProceduralPatient({
  caseData,
  tone,
  sceneImage = null,
}: {
  caseData: CaseScenario;
  tone: SceneTone;
  sceneImage?: string | null;
}) {
  const anatomy = inferAnatomy(caseData);
  const ageBand = patientAgeBand(caseData.patientInfo?.age);
  const ageScale = patientAgeScale(caseData.patientInfo?.age);
  const headSize = ageBand === 'infant'
    ? 'h-14 w-14 -top-11'
    : ageBand === 'toddler'
      ? 'h-12 w-12 -top-9'
      : ageBand === 'child'
        ? 'h-11 w-11 -top-8'
        : ageBand === 'adolescent'
          ? 'h-10 w-10 -top-8'
          : 'h-9 w-9 -top-7';
  const presentationText = [
    caseData.initialPresentation?.position,
    caseData.initialPresentation?.generalImpression,
  ].filter(Boolean).join(' ');
  const recumbent = /supine|lying|on (?:the )?(?:ground|floor|deck|towel|bed|cot)|unresponsive/i.test(presentationText);
  const placement = sceneImage?.includes('y1-010-park-bicycle')
    ? { left: '62%', bottom: '11%' }
    : sceneImage?.includes('paediatric-pool-rescue')
      ? { left: '63%', bottom: '28%' }
      : sceneImage?.includes('infant-nursery')
        ? { left: '66%', bottom: '42%' }
        : { left: '50%', bottom: '3rem' };

  // Skin tone reflects pallor / cyanosis when reported
  const torsoSkin = anatomy.cyanotic
    ? 'from-[#9bb4c4] to-[#647a8c]'
    : anatomy.pale
      ? 'from-[#e5d2c4] to-[#b39687]'
      : 'from-[#d2a284] to-[#8f5d4c]';

  // Drive a subtle chest-rise animation at the case's actual respiratory
  // rate. RR=12 → 5s cycle, RR=32 → 1.875s, RR=8 → 7.5s (agonal). When
  // RR is missing or zero we still want the patient to "be there" so we
  // fall back to a calm 5s cycle. Apnea (rate === 0) stops the animation
  // entirely — visually conveys "this patient isn't breathing".
  const rr = caseData.abcde?.breathing?.rate
    ?? caseData.vitalSignsProgression?.initial?.respiration
    ?? 12;
  const apneic = typeof rr === 'number' && rr === 0;
  const cycleSec = apneic ? 0 : Math.max(1.2, 60 / Math.max(6, rr));
  // Shallow breathing (rapid + distressed) gets a smaller amplitude so it
  // reads as "fast shallow" not "fast deep". Standard breathing is fuller.
  const breathAmplitude = rr >= 28 ? 1.025 : rr <= 10 ? 1.05 : 1.04;
  const breathStyle: React.CSSProperties = apneic
    ? { animation: 'none' }
    : {
        animation: `paramedic-breathe ${cycleSec.toFixed(2)}s ease-in-out infinite`,
        transformOrigin: 'bottom center',
        // Set CSS var so the keyframes can interpolate to the right scale
        ['--breathe-peak' as string]: String(breathAmplitude),
      };

  // Leg styling reacts to detected deformities. External rotation pushes the
  // foot outward; shortening pulls the limb up; deformity adds a bend +
  // angled accent stroke. These are stylised, not anatomically literal —
  // intent is "you can SEE something is wrong with that leg" at a glance.
  const legStyle = (side: 'left' | 'right') => {
    const l = side === 'left' ? anatomy.leftLeg : anatomy.rightLeg;
    const baseX = side === 'left' ? '-translate-x-[18px]' : 'translate-x-[18px]';
    const rotate = l.externallyRotated
      ? (side === 'left' ? 'rotate-[-32deg]' : 'rotate-[32deg]')
      : l.deformed
        ? (side === 'left' ? 'rotate-[-14deg]' : 'rotate-[14deg]')
        : 'rotate-0';
    const height = l.shortened ? 'h-16' : 'h-24';
    const origin = 'origin-top';
    return { baseX, rotate, height, origin, injured: l.deformed || l.shortened || l.externallyRotated, bleeding: l.bleeding, externallyRotated: l.externallyRotated, shortened: l.shortened };
  };

  const leftL = legStyle('left');
  const rightL = legStyle('right');

  return (
    <div
      className="absolute z-[6]"
      data-patient-age-band={ageBand}
      style={{
        left: placement.left,
        bottom: placement.bottom,
        transform: `translateX(-50%) rotate(${recumbent ? 88 : 0}deg) scale(${ageScale})`,
        transformOrigin: 'bottom center',
      }}
    >
      <div className={`relative ${tone.patientPose}`}>
      {/* Torso — breathes at the case's respiratory rate. Apneic patients
          stay perfectly still, which reads as "something is very wrong"
          even before the student reads the vitals. */}
      <div
        className={`relative h-28 w-16 rounded-t-full bg-gradient-to-b ${torsoSkin} shadow-2xl`}
        style={breathStyle}
      >
        {/* Head */}
        <div className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b ${torsoSkin} ${headSize} ${anatomy.facialInjury ? 'ring-2 ring-rose-500/70 ring-offset-1 ring-offset-transparent' : ''}`} />
        {/* Arms */}
        <div className={`absolute -left-7 top-7 h-3 w-12 rounded-full ${tone.accent} opacity-70 rotate-[-22deg] ${anatomy.leftArm.deformed ? 'ring-2 ring-rose-500/70' : ''}`} />
        <div className={`absolute -right-7 top-7 h-3 w-12 rounded-full ${tone.accent} opacity-70 rotate-[22deg] ${anatomy.rightArm.deformed ? 'ring-2 ring-rose-500/70' : ''}`} />
      </div>
      {/* Apnea annotation — only shown when the patient isn't breathing.
          Placed near the head to draw the eye toward the missing motion. */}
      {apneic && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 rounded-full bg-rose-600/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-lg ring-1 ring-rose-200/40">
          Apneic
        </div>
      )}
      {/* Legs container — anchored to torso base, each leg rotates independently */}
      <div className="absolute left-1/2 top-[112px] flex -translate-x-1/2 gap-1">
        <div className={`${leftL.height} w-3 origin-top rounded-full bg-gradient-to-b ${torsoSkin} ${leftL.rotate} ${leftL.injured ? 'ring-2 ring-rose-500/60' : ''}`} />
        <div className={`${rightL.height} w-3 origin-top rounded-full bg-gradient-to-b ${torsoSkin} ${rightL.rotate} ${rightL.injured ? 'ring-2 ring-rose-500/60' : ''}`} />
      </div>
      {/* Injury annotation pip — placed near the injured side to draw the eye */}
      {(leftL.injured || rightL.injured) && (
        <div className={`absolute top-[120px] ${leftL.injured ? '-left-10' : '-right-10'} flex items-center gap-1 rounded-full bg-rose-500/85 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white shadow-lg`}>
          <AlertTriangle className="h-3 w-3" />
          {leftL.externallyRotated || rightL.externallyRotated ? 'Ext. rotation' : leftL.shortened || rightL.shortened ? 'Shortened' : 'Deformity'}
        </div>
      )}
      </div>
    </div>
  );
}

function SceneSettingDetail({ tone }: { tone: SceneTone }) {
  if (tone.setting === 'road') {
    return (
      <>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-slate-950/60" />
        <div className="absolute bottom-8 left-0 right-0 h-1 bg-yellow-300/60" />
        <div className="absolute bottom-14 left-8 h-16 w-32 rounded-lg border border-white/10 bg-blue-500/25 shadow-xl" />
        <div className="absolute bottom-16 left-16 h-8 w-16 rounded-md bg-white/10" />
        <div className="absolute bottom-8 right-10 h-20 w-28 rotate-[-5deg] rounded-lg border border-white/10 bg-red-500/20" />
      </>
    );
  }

  if (tone.setting === 'agricultural') {
    return (
      <>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-lime-950/70" />
        <div className="absolute bottom-24 left-0 right-0 h-8 bg-emerald-500/10 blur-md" />
        <div className="absolute bottom-12 left-7 h-20 w-36 -skew-x-6 rounded-t bg-lime-500/20" />
        <div className="absolute bottom-10 right-8 h-20 w-24 rounded border border-amber-100/15 bg-amber-500/15" />
        <div className="absolute bottom-28 right-16 h-20 w-2 rounded bg-white/20" />
      </>
    );
  }

  if (tone.setting === 'industrial') {
    return (
      <>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-zinc-900/70" />
        <div className="absolute bottom-12 left-7 h-24 w-12 rounded-t bg-yellow-500/20" />
        <div className="absolute bottom-28 left-4 h-3 w-40 rotate-[-10deg] rounded bg-yellow-300/30" />
        <div className="absolute bottom-10 right-8 h-16 w-28 rounded border border-white/10 bg-white/10" />
        <div className="absolute bottom-24 right-14 h-14 w-4 rotate-12 rounded bg-white/10" />
      </>
    );
  }

  if (tone.setting === 'home') {
    return (
      <>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-violet-500/10" />
        <div className="absolute bottom-14 left-8 h-20 w-28 rounded-lg border border-white/10 bg-white/10 shadow-xl" />
        <div className="absolute bottom-16 left-12 h-12 w-20 rounded-md bg-white/8" />
        <div className="absolute bottom-12 right-10 h-24 w-20 rounded-t-full border border-white/10 bg-white/10" />
        <div className="absolute bottom-[72px] right-[70px] h-7 w-7 rounded-full bg-white/20" />
      </>
    );
  }

  if (tone.setting === 'water') {
    return (
      <>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-cyan-700/25" />
        <div className="absolute bottom-16 left-0 right-0 h-1 bg-cyan-100/50" />
        <div className="absolute bottom-20 left-8 h-20 w-36 rounded-[50%] border border-cyan-100/30 bg-sky-500/15" />
        <div className="absolute bottom-12 right-10 h-5 w-24 rotate-6 rounded bg-white/25" />
        <div className="absolute right-6 top-7 h-24 w-24 rounded-full bg-cyan-200/15 blur-xl" />
      </>
    );
  }

  if (tone.setting === 'heat') {
    return (
      <>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-orange-900/35" />
        <div className="absolute left-8 top-8 h-28 w-28 rounded-full bg-amber-300/25 blur-xl" />
        <div className="absolute bottom-14 left-14 h-3 w-40 -rotate-3 rounded-full bg-amber-100/15 blur-sm" />
        <div className="absolute bottom-10 right-8 h-16 w-28 rounded border border-white/10 bg-stone-900/30" />
      </>
    );
  }

  if (tone.setting === 'fire') {
    return (
      <>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-orange-500/10" />
        <div className="absolute bottom-8 left-8 h-20 w-20 rounded bg-orange-600/20 blur-sm" />
        <div className="absolute bottom-9 left-14 h-24 w-10 rounded-full bg-orange-400/30 blur-md" />
        <div className="absolute right-8 top-8 h-28 w-28 rounded-full bg-slate-300/10 blur-xl" />
        <div className="absolute bottom-12 right-10 h-24 w-20 rounded border border-white/10 bg-white/10" />
      </>
    );
  }

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-emerald-500/10" />
      <div className="absolute bottom-14 left-8 h-20 w-28 rounded-lg border border-white/10 bg-white/10 shadow-xl" />
      <div className="absolute bottom-16 left-12 h-12 w-20 rounded-md bg-white/8" />
      <div className="absolute bottom-12 right-10 h-24 w-20 rounded-t-full border border-white/10 bg-white/10" />
      <div className="absolute bottom-[72px] right-[70px] h-7 w-7 rounded-full bg-white/20" />
    </>
  );
}

/**
 * A short, non-blocking visual bridge between dispatch and the scene image.
 *
 * The image remains the clinical source of truth; the crew figures are only a
 * point-of-view cue. Keeping this in the approach step means students can
 * still inspect or advance immediately, while the first two seconds make the
 * hand-off feel like an arrival rather than a static photograph appearing.
 */
function DispatchApproachBeat({ caseData }: { caseData: CaseScenario }) {
  const reducedMotion = useReducedMotion();
  const [beat, setBeat] = useState<'dispatch' | 'approach' | 'patient'>('dispatch');

  useEffect(() => {
    if (reducedMotion) {
      setBeat('patient');
      return;
    }
    setBeat('dispatch');
    const approachTimer = window.setTimeout(() => setBeat('approach'), 850);
    const patientTimer = window.setTimeout(() => setBeat('patient'), 2350);
    return () => {
      window.clearTimeout(approachTimer);
      window.clearTimeout(patientTimer);
    };
  }, [caseData.id, reducedMotion]);

  const priority = caseData.dispatchInfo?.dispatchCode || caseData.priority || 'Emergency response';
  const location = caseData.dispatchInfo?.location || 'scene location';
  const message = beat === 'dispatch'
    ? { label: 'Dispatch acknowledged', value: `${priority} · ${location}` }
    : beat === 'approach'
      ? { label: 'Crew approaching', value: 'Maintain a safe view of the patient and scene.' }
      : { label: 'Patient first look', value: 'Observe before making contact.' };

  return (
    <div
      data-testid={`dispatch-approach-${beat}`}
      aria-live="polite"
      className={`absolute inset-x-4 top-4 z-20 flex items-start justify-between gap-3 transition-opacity duration-300 ${beat === 'patient' ? 'pointer-events-none opacity-0 sm:opacity-100 sm:[&>div]:scale-[0.94]' : ''}`}
    >
      <div className="max-w-[min(21rem,calc(100%-2.75rem))] rounded-xl border border-cyan-200/30 bg-slate-950/75 px-3 py-2.5 text-white shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-cyan-200/35 bg-cyan-300/10 text-cyan-100">
            {beat === 'dispatch' ? <Radio className="h-3 w-3" /> : beat === 'approach' ? <Footprints className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-100/90">{message.label}</span>
        </div>
        <p className="mt-1 text-[10px] leading-snug text-white/75">{message.value}</p>
      </div>
      {beat === 'approach' && (
        <div aria-hidden="true" className="paramedic-arrival-crew absolute bottom-1 left-0 flex items-end gap-1.5 text-white/90">
          <span className="relative block h-10 w-4 rounded-t-full bg-slate-900/95 shadow-[0_0_0_1px_rgba(125,211,252,0.35)] before:absolute before:-top-2 before:left-0.5 before:h-2.5 before:w-2.5 before:rounded-full before:bg-amber-100 after:absolute after:bottom-1 after:left-0 after:h-2 after:w-4 after:rounded-full after:bg-cyan-300/90" />
          <span className="relative mb-0.5 block h-8 w-3.5 rounded-t-full bg-slate-800/95 shadow-[0_0_0_1px_rgba(125,211,252,0.25)] before:absolute before:-top-2 before:left-0.5 before:h-2.5 before:w-2.5 before:rounded-full before:bg-amber-100 after:absolute after:bottom-1 after:left-0 after:h-1.5 after:w-3.5 after:rounded-full after:bg-cyan-300/90" />
        </div>
      )}
    </div>
  );
}

function SceneArrivalVisual({
  caseData,
  hazardHotspots,
  selectedHazards = [],
  onHazardToggle,
  focus = 'approach',
}: {
  caseData: CaseScenario;
  hazardHotspots: HazardHotspot[];
  selectedHazards?: string[];
  onHazardToggle?: (id: string) => void;
  focus?: 'approach' | 'hazards' | 'impression';
}) {
  const tone = inferSceneTone(caseData);
  const sceneImage = inferSceneImage(caseData);
  const temporal = inferTemporalTreatment(caseData);
  const bystanders = caseData.sceneInfo?.bystanders;
  const inspectionCues = buildInspectionCues(caseData);
  const sceneCallouts = buildSceneCallouts(caseData, tone, sceneImage);
  // Injuries are findings the student must DISCOVER during assessment — never
  // pre-label them on the arrival scene. Only surface them on the post-survey
  // 'impression' view (first hands-on contact); never on approach or hazards.
  const injuryOverlays = focus === 'impression' ? inferInjuries(caseData).slice(0, 5) : [];
  const showHazardHotspots = focus === 'hazards' || (!sceneImage && focus !== 'impression');
  // Approach is deliberately minimal — mark only the patient so the student
  // sees who and where, with no clinical callouts. The hazards view belongs to
  // hazard hotspots alone; repeating the patient callout there competes with
  // the scan and can obscure the photograph. The full labelled callout set is
  // reserved for the hands-on impression view.
  const visibleCallouts = focus === 'impression'
    ? sceneCallouts
    : focus === 'approach'
      ? sceneCallouts.filter(c => c.id === 'patient')
      : [];
  const visualModeLabel = focus === 'hazards'
    ? 'Hazard scan'
    : focus === 'impression'
      ? 'First contact view'
      : 'On scene';

  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${tone.gradient} p-4 text-white shadow-2xl`}>
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className={`relative z-10 grid gap-4 ${sceneImage ? 'lg:grid-cols-[minmax(260px,0.82fr)_minmax(520px,1.55fr)]' : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]'}`}>
        <div className="min-w-0 space-y-3 self-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
            <Radio className="h-3 w-3" />
            On Arrival
          </div>
          {/* The minimal arrival statement — what the student sees + hears.
              No scene-metadata dump, no hazard list (hazards are scanned, not
              told), no image-fidelity checklist. */}
          <h3 className="text-lg font-semibold leading-snug">{buildArrivalSentence(caseData)}</h3>
          {/* Additive first-person arrival layer (sensory cues, access/extrication,
              bystander micro-behaviour). Renders only when a case has generated
              scene-introduction enrichment; otherwise leaves the minimal view intact. */}
          <SceneSensoryStrip caseData={caseData} />
          <div className="grid gap-2 text-[11px]">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-3 py-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-white/60" />
              <span className="truncate">{caseData.dispatchInfo?.location || 'Location pending'}</span>
            </div>
            {bystanders && (
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-3 py-2">
                <Users className="h-3.5 w-3.5 shrink-0 text-white/60" />
                <span className="truncate">{bystanders}</span>
              </div>
            )}
          </div>
        </div>

        <div className={`relative min-w-0 min-h-[260px] overflow-hidden rounded-2xl border border-white/10 bg-black/20 ${sceneImage ? 'lg:min-h-[330px]' : ''}`}>
          {sceneImage ? (
            <>
              {/* On the approach view the image is the focus, so keep it bright
                  and clean. The darker gradients/tint/vignette are only needed
                  on the hazards/impression views to keep callouts legible. */}
              <img
                src={sceneImage}
                alt=""
                aria-hidden="true"
                className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015] ${
                  focus === 'approach' ? 'brightness-[1.0] contrast-[1.04] saturate-[1.06]' : 'brightness-[0.88] contrast-[1.05] saturate-[1.04]'
                }`}
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${focus === 'approach' ? 'from-black/20 via-transparent to-black/5' : 'from-black/45 via-black/10 to-black/20'}`} />
              <div className={`absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t to-transparent ${focus === 'approach' ? 'from-black/35' : 'from-black/65'}`} />
              <div className={`absolute inset-0 ${focus === 'approach' ? 'shadow-[inset_0_0_60px_rgba(2,6,23,0.18)]' : 'shadow-[inset_0_0_90px_rgba(2,6,23,0.42)]'}`} />
            </>
          ) : (
            <>
              <div className={`absolute bottom-0 left-0 right-0 h-24 ${tone.floor}`} />
              <div className={`absolute inset-0 ${temporal.overlayClass}`} />
              <SceneSettingDetail tone={tone} />
              <ProceduralPatient caseData={caseData} tone={tone} />
            </>
          )}
          {focus === 'approach' && <DispatchApproachBeat caseData={caseData} />}
          {caseSceneNeedsPatientOverlay(caseData, sceneImage) && (
            <ProceduralPatient caseData={caseData} tone={tone} sceneImage={sceneImage} />
          )}
          {sceneImage && (
            <div className="absolute left-4 top-4 z-10 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85 shadow-xl backdrop-blur-md">
              {visualModeLabel}
            </div>
          )}
          {focus !== 'approach' && !sceneImage && (
            <div className={`absolute right-4 top-4 z-10 max-w-[210px] rounded-xl border px-3 py-2 text-[10px] leading-tight shadow-xl backdrop-blur-md ${temporal.chipClass}`}>
              <span className="block font-semibold uppercase tracking-[0.16em]">Lighting</span>
              <span className="mt-1 block text-white/75">{temporal.note}</span>
            </div>
          )}
          {visibleCallouts.map(({ id, label, value, icon: Icon, x, y, align }) => (
            <div
              key={id}
              className={`absolute z-10 max-w-[155px] ${align === 'right' ? '-translate-x-full' : ''}`}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="flex items-start gap-2 rounded-xl border border-white/15 bg-black/55 px-2.5 py-1.5 text-[9px] leading-tight text-white/90 shadow-xl backdrop-blur-md">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/12 text-cyan-100">
                  <Icon className="h-3 w-3" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold uppercase tracking-[0.14em] text-cyan-100/90">{label}</span>
                  <span className="mt-0.5 block max-w-[110px] truncate text-white/75">{value}</span>
                </span>
              </div>
              <span className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border border-white/80 bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.75)] ${align === 'right' ? '-right-4' : '-left-4'}`} />
            </div>
          ))}
          {focus !== 'hazards' && injuryOverlays.map((injury, index) => {
            const pos = getInjuryScenePosition(injury, index);
            const isBleeding = injury.kind === 'bleeding' || injury.kind === 'wound' || injury.kind === 'amputation';
            return (
              <div
                key={injury.id}
                className="absolute z-20 max-w-[170px] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div className={`rounded-xl border px-2.5 py-1.5 text-[10px] leading-tight shadow-xl backdrop-blur-md ${
                  isBleeding
                    ? 'border-rose-200/70 bg-rose-600/90 text-white'
                    : 'border-orange-200/70 bg-orange-500/85 text-slate-950'
                }`}>
                  <span className="flex items-start gap-1.5">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      <span className="block font-bold uppercase tracking-[0.12em]">{injury.label}</span>
                      <span className="mt-0.5 block line-clamp-2 opacity-85">{injury.detail}</span>
                    </span>
                  </span>
                </div>
                <span className={`absolute left-1/2 top-full mt-1 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white ${
                  isBleeding ? 'bg-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.85)]' : 'bg-orange-300 shadow-[0_0_18px_rgba(251,146,60,0.85)]'
                }`} />
              </div>
            );
          })}
          {focus === 'impression' && inspectionCues.slice(0, 3).map((cue, index) => (
            <div
              key={cue.label}
              className="absolute left-1/2 rounded-full border border-cyan-300/50 bg-cyan-300/15 px-2.5 py-1 text-[10px] font-medium text-cyan-50 shadow-lg shadow-cyan-950/30"
              style={{
                top: `${18 + index * 13}%`,
                transform: `translateX(${index === 1 ? '-25%' : '-55%'})`,
              }}
            >
              {cue.label}
            </div>
          ))}
          {showHazardHotspots && hazardHotspots.map(({ id, label, icon: Icon, x, y }) => {
            const selected = selectedHazards.includes(id);
            const isClickable = Boolean(onHazardToggle);
            const position = getHotspotPosition({ id, label, kind: classifyHazard(label), icon: Icon, x, y }, hazardHotspots.findIndex(h => h.id === id), tone, sceneImage);
            // Unacknowledged hotspots pulse with an outward amber glow so
            // the eye is drawn to them; once the student clicks one, the
            // animation stops and the chip locks confirmed. This reinforces
            // the action ("you saw this hazard, it's logged") and stops the
            // screen from feeling like static painted UI.
            const hotspotStyle: React.CSSProperties = {
              left: `${position.x}%`,
              top: `${position.y}%`,
              ...(selected || !isClickable
                ? {}
                : { animation: 'paramedic-hazard-pulse 2s ease-out infinite' }),
            };
            return (
              <button
                key={id}
                type="button"
                onClick={() => onHazardToggle?.(id)}
                disabled={!isClickable}
                aria-pressed={isClickable ? selected : undefined}
                aria-label={`${selected ? 'Acknowledged' : 'Identify hazard'}: ${label}`}
                className={`absolute z-20 max-w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-xl border px-2.5 py-1.5 text-left text-[10px] leading-tight shadow-xl transition-all ${
                  selected
                    ? 'border-amber-200 bg-amber-300 text-slate-950'
                    : 'border-amber-300/60 bg-black/55 text-amber-50'
                } ${isClickable ? 'cursor-pointer hover:scale-105 hover:bg-amber-200 hover:text-slate-950' : 'cursor-default'}`}
                style={hotspotStyle}
                title={label}
              >
                <span className="flex items-start gap-1.5">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-2">{label}</span>
                </span>
              </button>
            );
          })}
          {focus === 'hazards' && sceneImage && hazardHotspots.length > 0 && (
            <div className="absolute bottom-4 left-4 z-10 rounded-xl border border-amber-200/25 bg-black/55 px-3 py-2 text-[10px] leading-tight text-amber-50 shadow-xl backdrop-blur-md">
              <span className="block font-semibold uppercase tracking-[0.14em] text-amber-100">Scan the image</span>
              <span className="text-white/70">Select visible hazards before declaring the scene safe.</span>
            </div>
          )}
          {showHazardHotspots && !hazardHotspots.length && (
            <div className={`absolute z-10 rounded-full border border-emerald-300/40 bg-black/55 px-3 py-1.5 text-[10px] text-emerald-50 shadow-xl backdrop-blur-md ${sceneImage ? 'right-4 top-4' : 'left-5 top-5'}`}>
              No obvious hazards visible
            </div>
          )}
          {!sceneImage && (
            <>
              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[10px] text-white/85 backdrop-blur-sm">
                <span className={`h-2 w-2 rounded-full ${tone.accent} shadow-[0_0_12px_currentColor]`} />
                {caseData.initialPresentation?.position || 'Patient position unknown'}
              </div>
              <div className="absolute right-4 top-4 max-w-[210px] rounded-xl border border-white/10 bg-black/45 p-3 text-[10px] leading-relaxed text-white/85 shadow-xl backdrop-blur-sm">
                {caseData.initialPresentation?.appearance || caseData.sceneInfo?.description || 'Observe from a distance before entering.'}
              </div>
            </>
          )}
        </div>
      </div>
      {sceneImage && focus === 'impression' && (
        <div className="relative z-10 mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {sceneCallouts.map(({ id, label, value, icon: Icon }) => (
            <div key={`${id}-summary`} className="flex min-w-0 items-start gap-2 rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-[10px] leading-tight">
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-100/80" />
              <span className="min-w-0">
                <span className="block font-semibold uppercase tracking-[0.14em] text-white/80">{label}</span>
                <span className="mt-0.5 block truncate text-white/60">{value}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SceneSurveyPanel({ caseData, onEnterScene, onBack }: SceneSurveyPanelProps) {
  const { speak, stop, enabled: voiceEnabled, toggleEnabled: toggleVoice, isSpeaking } = useVoiceNarration();

  const hazardHotspots = useMemo(() => buildHazardHotspots(caseData), [caseData]);
  const accessNotes = useMemo(() => dispatchAccessNotes(caseData), [caseData]);
  const mandatoryPpe = useMemo(() => mandatoryScenePpe(caseData), [caseData]);
  const [step, setStep] = useState<Step>('approach');
  const [hazardsIdentified, setHazardsIdentified] = useState<string[]>([]);
  const [sceneSafe, setSceneSafe] = useState<boolean | null>(null);
  const [resourcesRequested, setResourcesRequested] = useState<string[]>([]);
  // PPE is a learner decision, not an automatic answer. Required items are
  // labelled in the interface but must be deliberately donned before entry.
  const [ppeSelected, setPpeSelected] = useState<string[]>([]);

  // Narrate each step on entry. Dep array gates re-runs to step/caseData
  // changes only - state changes within a step won't re-fire. StrictMode's
  // double-mount in dev fires this twice; the cleanup cancels the first
  // setTimeout so the user only hears one playthrough.
  useEffect(() => {
    const cue = (() => {
      switch (step) {
        case 'approach':
          return { text: buildApproachNarration(caseData), role: 'narrator' as const };
        case 'hazards':
          return { text: 'Look around. What hazards can you identify, and what protection will you don before you make contact?', role: 'dispatcher' as const };
      }
    })();
    const t = setTimeout(() => speak(cue.text, { role: cue.role }), 250);
    return () => clearTimeout(t);
    // speak intentionally omitted - its identity is stable enough and
    // including it re-triggers the effect on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, caseData]);

  // Stop narration when the user leaves the survey entirely
  useEffect(() => () => { stop(); }, [stop]);

  const toggleHazard = (id: string) => {
    setHazardsIdentified(prev => {
      // "None" is mutually exclusive with the rest
      if (id === 'none') return prev.includes('none') ? [] : ['none'];
      const without = prev.filter(h => h !== 'none');
      return without.includes(id) ? without.filter(h => h !== id) : [...without, id];
    });
  };

  const togglePpe = (id: string) => {
    setPpeSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const toggleResource = (label: string) => {
    setResourcesRequested(prev => prev.includes(label) ? prev.filter(r => r !== label) : [...prev, label]);
  };

  // Per-step gating - Next/Enter disabled until requirements met
  const canAdvance = useMemo(() => {
    switch (step) {
      case 'approach':
        return true;
      case 'hazards': {
        // Combined hazards + PPE gate: every scene-mandatory PPE item is on,
        // AND the scene has either been declared safe after review or declared
        // unsafe with a hazard identified and extra resources requested.
        if (!mandatoryPpe.every((id) => ppeSelected.includes(id))) return false;
        // A single click must not satisfy a multi-hazard scene. Require the
        // learner to sweep and acknowledge every authored visual hotspot.
        const hazardsReviewed = hasReviewedEveryHazard(hazardHotspots.map(hazard => hazard.id), hazardsIdentified);
        if (!hazardsReviewed) return false;
        // Authored hazards cannot be reconciled with a "safe" declaration.
        // The learner must declare the scene unsafe and request support.
        if (sceneSafe === true) return hazardHotspots.length === 0;
        if (sceneSafe === false) return hazardHotspots.length > 0 && resourcesRequested.length > 0;
        return false;
      }
    }
  }, [step, hazardHotspots, hazardsIdentified, sceneSafe, resourcesRequested, ppeSelected, mandatoryPpe]);

  const gateHint = useMemo(() => sceneSurveyGateHint({
    hazardIds: hazardHotspots.map(hazard => hazard.id),
    selectedHazards: hazardsIdentified,
    sceneSafe,
    resourcesRequested,
    mandatoryPpe,
    ppeSelected,
  }), [hazardHotspots, hazardsIdentified, sceneSafe, resourcesRequested, mandatoryPpe, ppeSelected]);

  const goNext = () => {
    if (!canAdvance) return;
    stop();
    if (step === 'approach') { setStep('hazards'); return; }
    // hazards is the terminal step — entering the scene completes the survey.
    onEnterScene({
      hazardsIdentified,
      sceneDeclaredSafe: sceneSafe === true,
      additionalResourcesRequested: resourcesRequested,
      ppeSelected,
      generalImpression: [],
      completedAt: Date.now(),
    });
  };

  const goBack = () => {
    stop();
    if (step === 'approach') { onBack(); return; }
    setStep('approach');
  };

  const stepOrder: Step[] = ['approach', 'hazards'];
  const STEP_LABELS: Record<Step, string> = { approach: 'Approach', hazards: 'Hazards & PPE' };
  const stepIndex = stepOrder.indexOf(step);

  return (
    <div className="animate-fade-in space-y-4 max-w-6xl mx-auto">
      {/* Keyframes powering the "alive" animations (procedural-patient
          chest rise + unacknowledged-hazard pulse). Injected here rather
          than in tailwind.config so the panel is self-contained — if it's
          ever extracted, the animations move with it. */}
      <style>{`
        @keyframes paramedic-breathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(var(--breathe-peak, 1.04)); }
        }
        @keyframes paramedic-hazard-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(252, 211, 77, 0.55), 0 6px 16px -4px rgba(0,0,0,0.35);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(252, 211, 77, 0), 0 6px 16px -4px rgba(0,0,0,0.35);
          }
        }
        @keyframes paramedic-crew-arrival {
          0% { transform: translate3d(-8rem, 0.4rem, 0) scale(0.86); opacity: 0; }
          12% { opacity: 0.92; }
          58% { transform: translate3d(46vw, -0.2rem, 0) scale(1); opacity: 0.96; }
          100% { transform: translate3d(62vw, 0, 0) scale(0.96); opacity: 0; }
        }
        .paramedic-arrival-crew {
          animation: paramedic-crew-arrival 1.45s cubic-bezier(.22, 1, .36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .paramedic-arrival-crew { animation: none; }
        }
      `}</style>
      {/* Stepper + voice toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {stepOrder.map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                i < stepIndex
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : i === stepIndex
                    ? 'bg-primary/10 border-primary/40 text-primary'
                    : 'bg-muted/50 border-border text-muted-foreground'
              }`}
            >
              <span className="font-mono">{i + 1}</span>
              <span className="hidden sm:inline">{STEP_LABELS[s]}</span>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { if (isSpeaking) stop(); toggleVoice(); }}
          className="gap-1.5"
          aria-label={voiceEnabled ? 'Disable voice narration' : 'Enable voice narration'}
          aria-pressed={voiceEnabled}
          title={voiceEnabled ? 'Disable voice narration' : 'Enable voice narration'}
        >
          {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </div>

      {step === 'approach' && (
        <Card className="border-border">
          <CardHeader className="pb-3 border-b border-border/30">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15">
                <Eye className="h-4 w-4 text-blue-500" />
              </div>
              Approach the Scene
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-sm leading-relaxed">
            <SceneArrivalVisual
              caseData={caseData}
              hazardHotspots={hazardHotspots}
              selectedHazards={hazardsIdentified}
              onHazardToggle={toggleHazard}
              focus="approach"
            />
            <p className="text-xs text-muted-foreground">
              Take in the scene, then move on to scan for hazards.
            </p>
          </CardContent>
        </Card>
      )}

      {step === 'hazards' && (
        <Card className="border-border">
          <CardHeader className="pb-3 border-b border-border/30">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              Scene Hazards &amp; PPE
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Inspect the scene and select every visible hazard hotspot. Pick <strong>None identified</strong> only when the scene is genuinely clear.
            </p>
            <SceneArrivalVisual
              caseData={caseData}
              hazardHotspots={hazardHotspots}
              selectedHazards={hazardsIdentified}
              onHazardToggle={toggleHazard}
              focus="hazards"
            />
            {accessNotes.length > 0 && (
              <div className="rounded-xl border border-sky-200/60 bg-sky-50/70 px-3.5 py-3 dark:border-sky-900/60 dark:bg-sky-950/20">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-900 dark:text-sky-100">
                  <Radio className="h-3.5 w-3.5" /> Dispatch access notes
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Known before arrival; these are not visual hazard hotspots.</p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {accessNotes.map((note) => (
                    <li key={note} className="flex items-start gap-1.5 text-xs text-foreground/80">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-sky-600" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hazardHotspots.length > 0 && (
              <div className="rounded-xl border border-amber-200/70 bg-amber-50/55 px-3.5 py-3 dark:border-amber-900/55 dark:bg-amber-950/15">
                <p className="text-xs font-semibold text-amber-950 dark:text-amber-100">
                  Confirm hazards on the photograph
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Select the amber markers above; confirmed findings appear here.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5" aria-live="polite">
                  {hazardsIdentified.filter(id => id !== 'none').length > 0 ? (
                    hazardsIdentified.filter(id => id !== 'none').map(id => (
                      <span key={id} className="inline-flex items-center gap-1 rounded-full border border-amber-300/70 bg-amber-100 px-2.5 py-1 text-xs text-amber-950 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-100">
                        <CheckCircle2 className="h-3 w-3" />
                        {id}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-amber-900/70 dark:text-amber-100/70">No markers confirmed yet</span>
                  )}
                </div>
              </div>
            )}
            {hazardHotspots.length === 0 && (
              <button
                type="button"
                onClick={() => toggleHazard('none')}
                aria-pressed={hazardsIdentified.includes('none')}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                  hazardsIdentified.includes('none')
                    ? 'border-emerald-500 bg-emerald-500/10 text-foreground'
                    : 'border-border text-muted-foreground hover:border-emerald-400 hover:bg-emerald-500/5'
                }`}
              >
                <CheckCircle2 className={`h-4 w-4 shrink-0 ${hazardsIdentified.includes('none') ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                <span>No obvious hazards after visual sweep</span>
              </button>
            )}

            <div className="rounded-2xl border border-border bg-muted/20 p-3 space-y-3">
              <p className="text-sm font-semibold">Commit your scene safety decision</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => { setSceneSafe(true); setResourcesRequested([]); }}
                  aria-pressed={sceneSafe === true}
                  style={sceneSafe === true ? { background: '#059669', borderColor: '#047857', color: '#ffffff' } : undefined}
                  className={`flex-1 gap-2 border-2 py-5 font-semibold ${
                    sceneSafe === true
                      ? '!border-emerald-600 !bg-emerald-600 !text-white shadow-md hover:!bg-emerald-700 hover:!text-white [&_svg]:!text-white'
                      : 'border-emerald-300 bg-emerald-50/70 text-emerald-900 hover:border-emerald-500 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-100'
                  }`}
                >
                  <Shield className="h-4 w-4" /> Scene is safe - proceed
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSceneSafe(false)}
                  aria-pressed={sceneSafe === false}
                  style={sceneSafe === false ? { background: '#d97706', borderColor: '#b45309', color: '#ffffff' } : undefined}
                  className={`flex-1 gap-2 border-2 py-5 font-semibold ${
                    sceneSafe === false
                      ? '!border-amber-600 !bg-amber-600 !text-white shadow-md hover:!bg-amber-700 hover:!text-white [&_svg]:!text-white'
                      : 'border-amber-300 bg-amber-50/70 text-amber-950 hover:border-amber-500 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-100'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" /> Scene is unsafe - request resources
                </Button>
              </div>

              {sceneSafe === false && (
                <div className="animate-fade-in space-y-2 pt-1">
                  <p className="text-xs text-muted-foreground">Request additional resources (one or more):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {RESOURCE_OPTIONS.map(r => {
                      const selected = resourcesRequested.includes(r);
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => toggleResource(r)}
                          className={`px-2.5 py-1 rounded-full text-xs border ${
                            selected ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* PPE — merged into the hazards step. Pick what you'll don
                before patient contact; gloves are the minimum. */}
            <div className="pt-3 border-t border-border/40 space-y-2.5">
              <div className="flex items-center gap-2">
                <HardHat className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-medium">Don personal protective equipment</p>
              </div>
              <p className="text-xs text-muted-foreground">Select your PPE before patient contact. Required items reflect this scene, not only the clinical category.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PPE_OPTIONS.map(({ id, label }) => {
                  const selected = ppeSelected.includes(id);
                  const required = mandatoryPpe.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => togglePpe(id)}
                      aria-pressed={selected}
                      className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                        selected
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-border hover:border-border/80 hover:bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {selected && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                        {label}
                      </span>
                      {required && <Badge variant="outline" className="text-[10px] py-0 px-1.5">Required</Badge>}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action bar */}
      <div className="flex gap-2 sm:gap-3 pt-1">
        <Button variant="outline" onClick={goBack} className="gap-1.5 rounded-xl">
          <ArrowLeft className="h-4 w-4" />
          {step === 'approach' ? 'Back to Pre-Brief' : 'Previous'}
        </Button>
        <Button
          onClick={goNext}
          disabled={!canAdvance}
          variant={step === 'hazards' ? 'outline' : 'default'}
          size="lg"
          style={step === 'hazards'
            ? canAdvance
              ? { background: '#16a34a', borderColor: '#15803d', color: '#ffffff' }
              : { background: '#e2e8f0', borderColor: '#cbd5e1', color: '#475569' }
            : undefined}
          className={`flex-1 gap-2 rounded-xl shadow-sm transition-all ${
            step === 'hazards' && canAdvance
              ? '!bg-green-600 !text-white hover:!bg-green-700 hover:-translate-y-0.5 [&_svg]:!text-white'
              : step === 'hazards'
                ? '!border !border-slate-300 !bg-slate-100 !text-slate-500 shadow-none opacity-70 dark:!border-slate-700 dark:!bg-slate-900 dark:!text-slate-400'
                : ''
          }`}
        >
          {step === 'hazards' ? 'Enter Scene' : 'Next'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Gating hint */}
      {!canAdvance && step === 'hazards' && (
        <p className="text-xs text-muted-foreground text-center" role="status">
          {gateHint}
        </p>
      )}
    </div>
  );
}
