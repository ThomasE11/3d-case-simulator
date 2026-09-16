/**
 * RegionAssessmentPanel
 *
 * When a student clicks a body region on the 3D model, this panel opens
 * showing detailed clinical assessment actions for that specific region.
 *
 * Each region has sub-areas and examination techniques (inspect, palpate,
 * percuss, auscultate) that reveal case-specific findings.
 */

import { useState, useMemo } from 'react';
import type { CaseScenario } from '@/types';
import { usePatientVoice } from '@/hooks/usePatientVoice';
import { hasPainfulPalpationFinding } from './palpationReaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Eye, Hand, Activity, X,
  Stethoscope, Brain, Heart, Wind,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface ExamAction {
  id: string;
  label: string;
  technique: 'inspect' | 'palpate' | 'percuss' | 'auscultate';
  icon: typeof Eye;
}

interface SubRegion {
  id: string;
  label: string;
  actions: ExamAction[];
}

interface RegionConfig {
  title: string;
  icon: typeof Brain;
  subRegions: SubRegion[];
}

interface RegionAssessmentPanelProps {
  regionId: string;
  caseData: CaseScenario;
  onClose: () => void;
  onFindingRevealed: (regionId: string, subRegionId: string, actionId: string) => void;
  revealedFindings: Set<string>; // "regionId:subRegionId:actionId"
  isStudentView?: boolean;
}

// ============================================================================
// Examination technique icons
// ============================================================================

const TECHNIQUE_ICONS: Record<string, typeof Eye> = {
  inspect: Eye,
  palpate: Hand,
  percuss: Activity,
  auscultate: Stethoscope,
};

const TECHNIQUE_LABELS: Record<string, string> = {
  inspect: 'Inspect',
  palpate: 'Palpate',
  percuss: 'Percuss',
  auscultate: 'Auscultate',
};

// ============================================================================
// Region configurations — what you can examine in each body region
// ============================================================================

function getRegionConfig(regionId: string): RegionConfig | null {
  switch (regionId) {
    case 'head':
      return {
        title: 'Head Assessment',
        icon: Brain,
        subRegions: [
          {
            id: 'scalp',
            label: 'Scalp',
            actions: [
              { id: 'scalp-inspect', label: 'Look for wounds, bleeding, swelling', technique: 'inspect', icon: Eye },
              { id: 'scalp-palpate', label: 'Feel for depressions, step deformity, boggy swelling', technique: 'palpate', icon: Hand },
            ],
          },
          {
            id: 'pupils',
            label: 'Pupils',
            actions: [
              { id: 'pupils-inspect', label: 'PERRL — size, equality, reactivity to light', technique: 'inspect', icon: Eye },
            ],
          },
          {
            id: 'ears',
            label: 'Ears',
            actions: [
              { id: 'ears-inspect', label: "Battle's sign, CSF otorrhoea, blood in canal", technique: 'inspect', icon: Eye },
            ],
          },
        ],
      };

    case 'face':
      return {
        title: 'Face Assessment',
        icon: Eye,
        subRegions: [
          {
            id: 'facial-symmetry',
            label: 'Facial Symmetry',
            actions: [
              { id: 'face-inspect', label: 'Droop, asymmetry, smile, raise eyebrows', technique: 'inspect', icon: Eye },
            ],
          },
          {
            id: 'mouth-airway',
            label: 'Mouth & Airway',
            actions: [
              { id: 'mouth-inspect', label: 'Open mouth — blood, vomit, foreign body, swelling, burns', technique: 'inspect', icon: Eye },
              { id: 'airway-listen', label: 'Listen for stridor, gurgling, snoring, hoarseness', technique: 'auscultate', icon: Stethoscope },
            ],
          },
          {
            id: 'jaw-nose',
            label: 'Jaw & Nose',
            actions: [
              { id: 'jaw-palpate', label: 'Jaw stability, crepitus, midface mobility', technique: 'palpate', icon: Hand },
              { id: 'nose-inspect', label: 'CSF rhinorrhoea, epistaxis, septal haematoma', technique: 'inspect', icon: Eye },
            ],
          },
        ],
      };

    case 'neck-cspine':
      return {
        title: 'Neck & C-Spine Assessment',
        icon: Activity,
        subRegions: [
          {
            id: 'trachea',
            label: 'Trachea',
            actions: [
              { id: 'trachea-palpate', label: 'Position — midline or deviated (tension PTX)', technique: 'palpate', icon: Hand },
            ],
          },
          {
            id: 'jvp',
            label: 'Jugular Veins',
            actions: [
              { id: 'jvd-inspect', label: 'JVD — elevated (tamponade, tension PTX, CHF) or flat (hypovolaemia)', technique: 'inspect', icon: Eye },
            ],
          },
          {
            id: 'cspine',
            label: 'Cervical Spine',
            actions: [
              { id: 'cspine-palpate', label: 'Midline tenderness, step deformity, muscle spasm', technique: 'palpate', icon: Hand },
              { id: 'cspine-inspect', label: 'Subcutaneous emphysema, wounds, haematoma', technique: 'inspect', icon: Eye },
            ],
          },
        ],
      };

    case 'chest':
      return {
        title: 'Chest Assessment',
        icon: Wind,
        subRegions: [
          {
            id: 'chest-wall',
            label: 'Chest Wall',
            actions: [
              { id: 'chest-inspect', label: 'Symmetry, movement, wounds, bruising, flail, paradoxical movement', technique: 'inspect', icon: Eye },
              { id: 'chest-palpate', label: 'Tenderness, crepitus, subcutaneous emphysema, rib fractures', technique: 'palpate', icon: Hand },
            ],
          },
          {
            id: 'lung-right-upper',
            label: 'Right Upper Lung Field',
            actions: [
              { id: 'rul-percuss', label: 'Percussion note — resonant / hyper-resonant / dull', technique: 'percuss', icon: Activity },
              { id: 'rul-auscultate', label: 'Breath sounds — vesicular / wheeze / crackles / absent', technique: 'auscultate', icon: Stethoscope },
            ],
          },
          {
            id: 'lung-right-lower',
            label: 'Right Lower Lung Field',
            actions: [
              { id: 'rll-percuss', label: 'Percussion note', technique: 'percuss', icon: Activity },
              { id: 'rll-auscultate', label: 'Breath sounds', technique: 'auscultate', icon: Stethoscope },
            ],
          },
          {
            id: 'lung-left-upper',
            label: 'Left Upper Lung Field',
            actions: [
              { id: 'lul-percuss', label: 'Percussion note', technique: 'percuss', icon: Activity },
              { id: 'lul-auscultate', label: 'Breath sounds', technique: 'auscultate', icon: Stethoscope },
            ],
          },
          {
            id: 'lung-left-lower',
            label: 'Left Lower Lung Field',
            actions: [
              { id: 'lll-percuss', label: 'Percussion note', technique: 'percuss', icon: Activity },
              { id: 'lll-auscultate', label: 'Breath sounds', technique: 'auscultate', icon: Stethoscope },
            ],
          },
          {
            id: 'heart-sounds',
            label: 'Heart Sounds',
            actions: [
              { id: 'heart-aortic', label: 'Aortic area (right 2nd ICS)', technique: 'auscultate', icon: Heart },
              { id: 'heart-pulm', label: 'Pulmonary area (left 2nd ICS)', technique: 'auscultate', icon: Heart },
              { id: 'heart-tricusp', label: 'Tricuspid area (left lower sternal)', technique: 'auscultate', icon: Heart },
              { id: 'heart-mitral', label: 'Mitral area (apex, 5th ICS MCL)', technique: 'auscultate', icon: Heart },
            ],
          },
        ],
      };

    case 'abdomen':
      return {
        title: 'Abdominal Assessment',
        icon: Activity,
        subRegions: [
          {
            id: 'abd-inspection',
            label: 'Inspection & Auscultation',
            actions: [
              { id: 'abd-inspect', label: 'Inspect — distension, bruising (Cullen / Grey Turner), scars, pulsating mass', technique: 'inspect', icon: Eye },
              { id: 'abd-auscultate', label: 'Auscultate bowel sounds (4 quadrants)', technique: 'auscultate', icon: Stethoscope },
            ],
          },
          {
            id: 'abd-palpation',
            label: 'Palpation & Percussion',
            actions: [
              { id: 'abd-palpate-light', label: 'Light palpation — soft vs rigid, tenderness, guarding', technique: 'palpate', icon: Hand },
              { id: 'abd-palpate-deep', label: 'Deep palpation — masses, organomegaly, rebound tenderness', technique: 'palpate', icon: Hand },
              { id: 'abd-percuss', label: 'Percuss — tympanic vs dull (ascites, organomegaly)', technique: 'percuss', icon: Activity },
            ],
          },
        ],
      };

    case 'pelvis':
      return {
        title: 'Pelvis Assessment',
        icon: Activity,
        subRegions: [
          {
            id: 'pelvis-stability',
            label: 'Pelvic Stability',
            actions: [
              { id: 'pelvis-inspect', label: 'Deformity, bruising, leg length discrepancy', technique: 'inspect', icon: Eye },
              { id: 'pelvis-palpate', label: 'Spring test — compress iliac crests ONCE only', technique: 'palpate', icon: Hand },
            ],
          },
          {
            id: 'perineum',
            label: 'Perineum',
            actions: [
              { id: 'perineum-inspect', label: 'Bleeding, priapism (spinal injury sign)', technique: 'inspect', icon: Eye },
            ],
          },
        ],
      };

    case 'right-arm':
      return {
        title: 'Right Arm Assessment',
        icon: Hand,
        subRegions: [
          {
            id: 'right-upper',
            label: 'Right Arm',
            actions: [
              { id: 'rarm-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'rarm-palpate', label: 'Pulses, sensation, motor, compartments, crepitus', technique: 'palpate', icon: Hand },
            ],
          },
        ],
      };
    case 'left-arm':
      return {
        title: 'Left Arm Assessment',
        icon: Hand,
        subRegions: [
          {
            id: 'left-upper',
            label: 'Left Arm',
            actions: [
              { id: 'larm-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'larm-palpate', label: 'Pulses, sensation, motor, compartments, crepitus', technique: 'palpate', icon: Hand },
            ],
          },
        ],
      };
    case 'right-leg':
      return {
        title: 'Right Leg Assessment',
        icon: Hand,
        subRegions: [
          {
            id: 'right-lower',
            label: 'Right Leg',
            actions: [
              { id: 'rleg-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'rleg-palpate', label: 'Pulses (dorsalis pedis, posterior tibial), sensation, motor, compartments', technique: 'palpate', icon: Hand },
            ],
          },
        ],
      };
    case 'left-leg':
      return {
        title: 'Left Leg Assessment',
        icon: Hand,
        subRegions: [
          {
            id: 'left-lower',
            label: 'Left Leg',
            actions: [
              { id: 'lleg-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'lleg-palpate', label: 'Pulses, sensation, motor, compartments', technique: 'palpate', icon: Hand },
            ],
          },
        ],
      };
    // Legacy fallback: if 'extremities' is passed, show all limbs
    case 'extremities':
      return {
        title: 'Extremities Assessment',
        icon: Hand,
        subRegions: [
          {
            id: 'right-upper',
            label: 'Right Arm',
            actions: [
              { id: 'rarm-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'rarm-palpate', label: 'Pulses, sensation, motor, compartments, crepitus', technique: 'palpate', icon: Hand },
            ],
          },
          {
            id: 'left-upper',
            label: 'Left Arm',
            actions: [
              { id: 'larm-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'larm-palpate', label: 'Pulses, sensation, motor, compartments, crepitus', technique: 'palpate', icon: Hand },
            ],
          },
          {
            id: 'right-lower',
            label: 'Right Leg',
            actions: [
              { id: 'rleg-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'rleg-palpate', label: 'Pulses (dorsalis pedis, posterior tibial), sensation, motor, compartments', technique: 'palpate', icon: Hand },
            ],
          },
          {
            id: 'left-lower',
            label: 'Left Leg',
            actions: [
              { id: 'lleg-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'lleg-palpate', label: 'Pulses, sensation, motor, compartments', technique: 'palpate', icon: Hand },
            ],
          },
        ],
      };

    case 'posterior-logroll':
      return {
        title: 'Posterior Assessment (Log Roll)',
        icon: Activity,
        subRegions: [
          {
            id: 'log-roll',
            label: 'Log Roll Procedure',
            actions: [
              { id: 'logroll-inspect', label: 'Maintain manual in-line C-spine. Roll on command.', technique: 'inspect', icon: Eye },
            ],
          },
          {
            id: 'spine',
            label: 'Spine',
            actions: [
              { id: 'spine-palpate', label: 'Each spinous process — tenderness, step deformity, swelling', technique: 'palpate', icon: Hand },
              { id: 'spine-inspect', label: 'Bruising, wounds, haematoma along spine', technique: 'inspect', icon: Eye },
            ],
          },
          {
            id: 'flanks-buttocks',
            label: 'Flanks & Buttocks',
            actions: [
              { id: 'flanks-inspect', label: 'Bruising (Grey Turner sign), wounds', technique: 'inspect', icon: Eye },
              { id: 'buttocks-inspect', label: 'Wounds, bleeding, sacral oedema', technique: 'inspect', icon: Eye },
            ],
          },
        ],
      };

    default:
      return null;
  }
}

// ============================================================================
// Finding generator — produces case-specific findings for each action
// ============================================================================

function getFindings(
  caseData: CaseScenario,
  regionId: string,
  subRegionId: string,
  actionId: string,
): string {
  // Pull from case data where possible
  const breathing = caseData.abcde?.breathing;
  const circ = caseData.abcde?.circulation;
  const disability = caseData.abcde?.disability;
  const ss = caseData.secondarySurvey;

  // Chest — lung auscultation
  if (actionId.includes('auscultate') && subRegionId.startsWith('lung-')) {
    if (breathing?.auscultation?.length) {
      return breathing.auscultation.join('. ');
    }
    const findings = breathing?.findings?.filter(f =>
      f.toLowerCase().includes('wheez') || f.toLowerCase().includes('crackle') ||
      f.toLowerCase().includes('air entry') || f.toLowerCase().includes('diminished')
    );
    if (findings?.length) return findings.join('. ');
    return 'Vesicular breath sounds. Normal air entry.';
  }

  // Chest — heart sounds
  if (actionId.startsWith('heart-')) {
    if (circ?.ecgFindings?.length) {
      return `Heart sounds: S1 S2 present. ${circ.ecgFindings[0]}`;
    }
    return 'Heart sounds: S1 S2 present. No murmurs.';
  }

  // Chest — percussion
  if (actionId.includes('percuss') && subRegionId.startsWith('lung-')) {
    if (breathing?.findings?.some(f => f.toLowerCase().includes('pneumothorax')))
      return 'Hyper-resonant percussion note';
    if (breathing?.findings?.some(f => f.toLowerCase().includes('effusion') || f.toLowerCase().includes('haemothorax')))
      return 'Dull percussion note — fluid';
    return 'Resonant percussion note — normal';
  }

  // Chest wall
  if (subRegionId === 'chest-wall') {
    const chestFindings = ss?.chest || [];
    if (chestFindings.length) return chestFindings.join('. ');
    if (actionId === 'chest-inspect') return 'Equal chest expansion. No wounds or bruising. No flail segment.';
    return 'No tenderness. No crepitus. No subcutaneous emphysema.';
  }

  // Abdomen — bowel sounds
  if (actionId.includes('auscultate') && (subRegionId === 'ruq' || subRegionId === 'luq' || subRegionId === 'rlq' || subRegionId === 'llq')) {
    const abdFindings = ss?.abdomen || [];
    if (abdFindings.some(f => f.toLowerCase().includes('absent bowel'))) return 'Absent bowel sounds';
    if (abdFindings.some(f => f.toLowerCase().includes('hyperactive'))) return 'Hyperactive bowel sounds — high-pitched, frequent';
    if (abdFindings.some(f => f.toLowerCase().includes('tinkling'))) return 'Tinkling bowel sounds — suggests obstruction';
    return 'Normal bowel sounds present';
  }

  // Abdomen — palpation
  if (actionId.includes('palpate') && (subRegionId === 'ruq' || subRegionId === 'luq' || subRegionId === 'rlq' || subRegionId === 'llq')) {
    const abdFindings = ss?.abdomen || [];
    if (abdFindings.length) return abdFindings.join('. ');
    return 'Soft, non-tender. No guarding or rigidity.';
  }

  // Abdomen — general inspection
  if (subRegionId === 'abd-general') {
    const abdFindings = ss?.abdomen || [];
    const inspectFindings = abdFindings.filter(f =>
      f.toLowerCase().includes('distend') || f.toLowerCase().includes('bruis') ||
      f.toLowerCase().includes('scar') || f.toLowerCase().includes('visible')
    );
    if (inspectFindings.length) return inspectFindings.join('. ');
    return 'Abdomen not distended. No bruising or scars. No visible peristalsis.';
  }

  // Head
  if (regionId === 'head') {
    const headFindings = ss?.head || [];
    if (subRegionId === 'pupils') {
      const pupils = disability?.pupils;
      return typeof pupils === 'string' ? pupils : Array.isArray(pupils) ? pupils.join('. ') : 'Equal and reactive';
    }
    if (subRegionId === 'ears') {
      const earFindings = ss?.headDetailed?.ears || [];
      return earFindings.length ? earFindings.join('. ') : 'No Battle sign. No CSF otorrhoea. Canals clear.';
    }
    if (headFindings.length) return headFindings.join('. ');
    return 'No wounds. No depressions. No haematoma.';
  }

  // Face / airway
  if (regionId === 'face') {
    if (subRegionId === 'mouth-airway') {
      const airway = caseData.abcde?.airway;
      if (actionId === 'mouth-inspect') {
        if (airway?.findings?.length) return airway.findings.join('. ');
        return airway?.patent ? 'Airway patent. No blood, vomit, or foreign body.' : 'AIRWAY COMPROMISED — blood/secretions present.';
      }
      // airway listen
      if (airway?.findings?.some(f => f.toLowerCase().includes('stridor'))) return 'Stridor audible — upper airway obstruction';
      if (airway?.findings?.some(f => f.toLowerCase().includes('gurgling'))) return 'Gurgling — fluid in airway. Suction required.';
      if (airway?.findings?.some(f => f.toLowerCase().includes('snoring'))) return 'Snoring — partial obstruction by tongue. Reposition.';
      return 'No abnormal airway sounds.';
    }
    if (subRegionId === 'facial-symmetry') {
      const faceFindings = ss?.headDetailed?.face || [];
      if (faceFindings.length) return faceFindings.join('. ');
      return 'Face symmetrical. No droop.';
    }
    const noseFindings = ss?.headDetailed?.nose || [];
    if (noseFindings.length) return noseFindings.join('. ');
    return 'No CSF rhinorrhoea. No epistaxis.';
  }

  // Neck
  if (regionId === 'neck-cspine') {
    const neckFindings = ss?.neck || [];
    if (subRegionId === 'jvp') {
      const jvdFinding = neckFindings.find(f => f.toLowerCase().includes('jvd') || f.toLowerCase().includes('jugular'));
      return jvdFinding || 'No JVD. Normal jugular venous pressure.';
    }
    if (subRegionId === 'trachea') {
      const tracheaFinding = neckFindings.find(f => f.toLowerCase().includes('trachea'));
      return tracheaFinding || 'Trachea central and midline.';
    }
    if (neckFindings.length) return neckFindings.join('. ');
    return 'No midline tenderness. No step deformity. No subcutaneous emphysema.';
  }

  // Pelvis
  if (regionId === 'pelvis') {
    const pelvisFindings = ss?.pelvis || [];
    if (pelvisFindings.length) return pelvisFindings.join('. ');
    return 'Pelvis stable on spring test. No deformity.';
  }

  // Extremities (individual limb IDs or legacy 'extremities')
  if (regionId === 'extremities' || regionId === 'right-arm' || regionId === 'left-arm' || regionId === 'right-leg' || regionId === 'left-leg') {
    const extFindings = ss?.extremities || [];
    if (extFindings.length) return extFindings.join('. ');
    return 'No deformity. Pulses present. Sensation and motor intact.';
  }

  // Posterior
  if (regionId === 'posterior-logroll') {
    const postFindings = ss?.posterior || [];
    if (postFindings.length) return postFindings.join('. ');
    return 'No spinal tenderness. No step deformity. No bruising.';
  }

  return 'No abnormalities detected.';
}

// ============================================================================
// Component
// ============================================================================

export function RegionAssessmentPanel({
  regionId,
  caseData,
  onClose,
  onFindingRevealed,
  revealedFindings,
}: RegionAssessmentPanelProps) {
  const config = useMemo(() => getRegionConfig(regionId), [regionId]);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const patientVoice = usePatientVoice(caseData);

  if (!config) return null;

  const Icon = config.icon;
  const totalActions = config.subRegions.reduce((sum, sr) => sum + sr.actions.length, 0);
  const completedActions = config.subRegions.reduce((sum, sr) =>
    sum + sr.actions.filter(a => revealedFindings.has(`${regionId}:${sr.id}:${a.id}`)).length, 0);

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-white/5 dark:border-white/[0.06] bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-950/80 dark:via-slate-900/50 dark:to-slate-950/80 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_50px_-16px_rgba(0,0,0,0.75)] backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Teal accent hairline — matches the Physical Examination container */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />

      <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 ring-1 ring-teal-500/15">
              <Icon className="h-4 w-4 text-teal-500/80" />
            </div>
            <div>
              <p className="text-[9px] font-medium tracking-[0.25em] uppercase text-muted-foreground/60">Regional Exam</p>
              <h3 className="text-base font-light tracking-tight text-foreground/90 mt-0.5">{config.title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Completion progress pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5">
              <span className={`h-1.5 w-1.5 rounded-full ${completedActions === totalActions ? 'bg-emerald-400 shadow-[0_0_6px_rgb(52_211_153/0.8)]' : 'bg-white/20'}`} />
              <span className="text-[10px] font-mono tabular-nums text-muted-foreground">{completedActions}<span className="text-muted-foreground/40">/{totalActions}</span></span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-xl hover:bg-white/5">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 pt-0 space-y-2">
        {config.subRegions.map(subRegion => {
          const isExpanded = expandedSub === subRegion.id;
          const subCompleted = subRegion.actions.filter(a =>
            revealedFindings.has(`${regionId}:${subRegion.id}:${a.id}`)
          ).length;
          const subTotal = subRegion.actions.length;
          const allDone = subCompleted === subTotal;

          return (
            <div key={subRegion.id} className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${isExpanded ? 'border-white/10 bg-white/40 dark:bg-slate-900/40 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.5)]' : 'border-slate-200/50 dark:border-white/[0.04] bg-white/20 dark:bg-slate-900/20 hover:border-white/10'}`}>
              {/* Sub-region header — no chevron; expand via area tap */}
              <button
                onClick={() => setExpandedSub(isExpanded ? null : subRegion.id)}
                className="flex items-center justify-between w-full text-left px-4 py-3 group"
              >
                <div className="flex items-center gap-3">
                  {/* Expansion indicator — hairline bar that grows when active */}
                  <span className={`h-4 w-0.5 rounded-full bg-gradient-to-b from-teal-400 to-cyan-500 transition-all duration-300 ${isExpanded ? 'opacity-100' : allDone ? 'opacity-50' : 'opacity-20 group-hover:opacity-60'}`} />
                  <span className="text-xs font-medium tracking-tight text-foreground/80">{subRegion.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {subCompleted > 0 && (
                    <span className={`text-[10px] font-mono tabular-nums ${allDone ? 'text-emerald-500' : 'text-muted-foreground/60'}`}>
                      {subCompleted}<span className="text-muted-foreground/30">/{subTotal}</span>
                    </span>
                  )}
                  <span className={`h-1 w-1 rounded-full transition-colors ${allDone ? 'bg-emerald-400' : isExpanded ? 'bg-teal-400' : 'bg-white/10'}`} />
                </div>
              </button>

              {/* Exam actions — animated reveal */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                  {subRegion.actions.map(action => {
                    const findingKey = `${regionId}:${subRegion.id}:${action.id}`;
                    const isRevealed = revealedFindings.has(findingKey);
                    const TechIcon = TECHNIQUE_ICONS[action.technique] || Eye;
                    // Jewel-tone per technique
                    const technique = action.technique;
                    const tone =
                      technique === 'inspect'     ? { rail: 'from-sky-400 to-blue-500',     bg: 'hover:bg-sky-500/5',     text: 'text-sky-500' } :
                      technique === 'palpate'     ? { rail: 'from-rose-400 to-red-500',     bg: 'hover:bg-rose-500/5',    text: 'text-rose-500' } :
                      technique === 'percuss'     ? { rail: 'from-amber-400 to-orange-500', bg: 'hover:bg-amber-500/5',   text: 'text-amber-500' } :
                                                    { rail: 'from-violet-400 to-fuchsia-500', bg: 'hover:bg-violet-500/5',text: 'text-violet-500' };

                    return (
                      <div key={action.id} className="space-y-1.5">
                        <button
                          onClick={() => {
                            if (isRevealed) return;
                            onFindingRevealed(regionId, subRegion.id, action.id);
                            // Auscultation and percussion play a synthesised
                            // clinical sound. An in-flight patient line would
                            // play straight over it, so silence the patient
                            // before the sound the student is meant to hear.
                            if (technique === 'auscultate' || technique === 'percuss') {
                              patientVoice.stop();
                              return;
                            }
                            // Patient reacts audibly to provocative
                            // examinations. Gate on the REVEALED FINDING, not
                            // the action label: "Tenderness, crepitus, rib
                            // fractures" is the list of things to look FOR, so
                            // matching the label made every patient cry out on
                            // every chest palpation regardless of pathology.
                            // Hook silently no-ops if patient is unconscious.
                            if (technique === 'palpate') {
                              const finding = getFindings(caseData, regionId, subRegion.id, action.id);
                              if (!hasPainfulPalpationFinding(finding)) return;
                              const movement = /\b(?:move|moved|moving|movement|range of motion|rom|flex\w*|extend\w*|rotat\w*)\b/i.test(finding);
                              patientVoice.react(movement ? 'movement-pain' : 'tender-palpation');
                            }
                          }}
                          disabled={isRevealed}
                          className={`relative flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg border border-slate-200/50 dark:border-white/[0.04] transition-all duration-300 ${
                            isRevealed
                              ? 'bg-emerald-500/5 border-emerald-500/20 cursor-default'
                              : `${tone.bg} hover:border-white/10 hover:-translate-y-0.5`
                          }`}
                        >
                          {/* Left rail */}
                          <span className={`absolute left-0 inset-y-2 w-0.5 rounded-full bg-gradient-to-b ${isRevealed ? 'from-emerald-400 to-emerald-500' : tone.rail} ${isRevealed ? 'opacity-100' : 'opacity-60'}`} />
                          <TechIcon className={`h-4 w-4 shrink-0 ${isRevealed ? 'text-emerald-500' : tone.text}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-[9px] font-medium tracking-[0.2em] uppercase ${isRevealed ? 'text-emerald-500/60' : 'text-muted-foreground/50'}`}>
                              {TECHNIQUE_LABELS[technique]}
                            </p>
                            <p className="text-xs font-medium tracking-tight text-foreground/80 mt-0.5">{action.label}</p>
                          </div>
                          {!isRevealed && (
                            <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/40 shrink-0">Tap</span>
                          )}
                          {isRevealed && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgb(52_211_153/0.9)] shrink-0" />
                          )}
                        </button>

                        {/* Revealed finding — chapter-style clinical note */}
                        {isRevealed && (
                          <div className="ml-6 relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-transparent border border-emerald-500/10 animate-in fade-in slide-in-from-top-1 duration-500">
                            <div className="px-3 py-2.5">
                              <p className="text-[9px] font-medium tracking-[0.25em] uppercase text-emerald-500/70 mb-1">Finding</p>
                              <p className="font-mono text-[11px] sm:text-xs text-foreground/80 leading-relaxed">
                                {getFindings(caseData, regionId, subRegion.id, action.id)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
