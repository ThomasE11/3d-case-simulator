/**
 * Student Panel
 *
 * Streamlined student-facing interface with guided case flow:
 * 1. Pre-Briefing: Select/generate a case, review pre-briefing info
 * 2. Case Presentation: Dispatch info, scene, patient presentation
 * 3. Vitals & Treatment: Monitor, treatments, interventions
 * 4. Transport / End Care: Decision point
 * 5. Post-Case Report: Performance feedback, resources, learning points
 */

import { useState, useCallback, useMemo, lazy, Suspense, useEffect, useRef } from 'react';
import type { CaseScenario, StudentYear, CaseSession, VitalSigns, AppliedTreatment } from '@/types';

/**
 * Build a radio-call style dispatch narration for voice playback.
 * Mimics the cadence of a real paramedic radio dispatch:
 *   "Control to responding unit. Priority one job for you. Caller reports…
 *    Patient is a… On arrival you'll find…"
 * The pauses and phrasing give the humanised voice engine natural beats.
 */
function buildDispatchNarration(caseData: CaseScenario): string {
  // `priority` isn't part of the typed dispatchInfo shape (no case data sets
  // it yet) — widen the local so the defensive runtime read still compiles.
  const dispatch = caseData.dispatchInfo as (CaseScenario['dispatchInfo'] & { priority?: string | number }) | undefined;
  const priorityWord = dispatch?.priority
    ? (String(dispatch.priority).includes('1') ? 'priority one' : String(dispatch.priority).includes('2') ? 'priority two' : 'priority three')
    : 'priority one';

  // PUNCHY by design. The whole narration is synthesised in ONE continuous TTS
  // request (no inter-sentence gaps), and this server is ~50ms/char, so a short
  // script = a short wait before the seamless read. We speak just the priority
  // + the CORE call reason (mechanism/secondary clauses and location are
  // dropped from the audio — they're all shown on the brief card).
  const core = (dispatch?.callReason || '')
    .split(/,|\bafter\b|\bwhile\b|\bwhilst\b/i)[0]
    .replace(/[.!?]+$/, '')
    .trim();
  const parts: string[] = [`Control to responding unit, ${priorityWord}.`];
  if (core) parts.push(`${core}.`);
  parts.push(`Acknowledge when you're on scene.`);
  return parts.join(' ');
}

function seededShuffle<T>(array: T[], seed: string): T[] {
  const shuffled = [...array];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = ((hash << 5) - hash + i) | 0;
    const j = Math.abs(hash) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
import { loadAllCases } from '@/data/caseLibrary';
import { getScenePresentationDescription } from '@/lib/sceneNarrative';
import { yearLevels, caseCategories, isCaseAvailableForCohort, isStudentYear, type CohortMode } from '@/data/caseFilters';
import { pickRandomFromPool, skillFocusForCategory } from '@/lib/missionCasePick';
import { ensureCompleteVitals, vitalsEqual, buildInitialVitalsFromCase } from '@/data/treatmentEffects';
import { type Treatment, TREATMENTS } from '@/data/enhancedTreatmentEffects';
import {
  type PatientState,
  type DefibrillationParams,
  createInitialPatientState,
  applyDynamicTreatment,
  applyDeterioration,
} from '@/data/dynamicTreatmentEngine';
import {
  assessProtocolCompliance,
  findProtocol,
  determineSeverityFromVitals,
} from '@/data/treatmentProtocols';
import { checkRuntimeContraindications } from '@/lib/runtimeContraindications';
import { isActionAllowedForRole, getRoleBadgeStyle, CLINICAL_ROLES, type ClinicalRole } from '@/lib/classroomRoles';
import type {
  ClassroomInject, VitalsChangePayload, RhythmChangePayload,
  BystanderUpdatePayload, HospitalRadioPayload, EquipmentFailurePayload,
  PatientRefusalPayload, NewFindingPayload, EnvironmentalPayload,
} from '@/lib/classroomInjects';
// patientRealism.ts was removed in the merge; evaluateTreatmentRealism now lives in clinicalRealism.
import { evaluateTreatmentRealism } from '@/data/clinicalRealism';
import { deriveLivePatientAppearance, deriveRealismDirectorState, type RealismDirectorState } from '@/lib/patientRealismDirector';
import {
  deriveClinicalManagementDebrief,
  deriveTreatmentReassessmentMatches,
  deriveReassessmentStepForTreatment,
  deriveFindingTreatmentSuggestions,
  type FindingTreatmentSuggestion,
} from '@/lib/caseManagementRealism';
import { derivePatientVisualState } from '@/lib/patientVisualState';
import { phaseMotionVariant, phaseTransitionKey, type CinematicPhase } from '@/lib/cinematicPhase';
import { deduplicateCareFeedItems } from '@/lib/careFeed';
import { deriveSceneEnvironment, sceneEnvironmentLabel } from '@/lib/sceneEnvironment';
import { SceneSensoryStrip } from '@/components/SceneSensoryStrip';
import { sceneArrivalCopy } from '@/lib/sceneArrival';
import { getSceneIntroduction } from '@/lib/sceneIntroductions';
import { matchRealismScenarios } from '@/lib/patientRealismScenarios';
import {
  buildReactionForTreatment,
  projectReactionVitals,
  isDefinitiveRescue,
  type AdverseReaction,
} from '@/data/adverseReactions';
import { computeSmartGrade } from '@/data/smartGrader';
import { computeAbcdeScore, deriveAbcdeCaseFlags, applyAbcdeToAssessmentScore } from '@/lib/abcdeScoring';
import { useAuth } from '@/lib/auth';
import { saveStudentResult } from '@/lib/studentResults';
import { useGradualVitalChanges } from '@/hooks/useGradualVitalChanges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AmbientBackground } from '@/components/AmbientBackground';
import {
  Stethoscope, GraduationCap, Activity, Clock, ArrowLeft, ArrowRight,
  Sparkles, CheckCircle2, AlertTriangle, FileText, Loader2, BookOpen,
  Ambulance, XCircle, Heart, Shield, ChevronRight, BarChart3,
  ClipboardCheck, Star, TrendingUp, TrendingDown, Minus, ExternalLink,
  RotateCcw, Zap, Phone, ChevronDown, ChevronUp,
  Wind, Brain, Syringe, Search, Shuffle, Target,
  Flame, Baby, FlaskConical, ListChecks, HeartPulse, Gauge,
  Eye, Mic, MicOff, Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
// AuscultationPanel removed — sounds now play inline from 3D Physical Examination
import { DebriefingResourcesPanel } from '@/components/DebriefingResourcesPanel';
import { DebriefReplay } from '@/components/DebriefReplay';
import { SceneSurveyPanel, type SceneSurveyResult } from '@/components/SceneSurveyPanel';
import { VoiceHistoryPanel } from '@/components/VoiceHistoryPanel';
import {
  TreatmentJumpBagPanel,
  managementTabForBayEquipment,
  searchHintForBayEquipment,
  type BayEquipmentFocus,
  bagKeyForTreatment,
  recommendedManagementTabForCase,
  type ManagementTab,
} from '@/components/TreatmentJumpBagPanel';
import { HUDValue } from '@/components/hud/HUDPanel';
import { HUDVitals } from '@/components/hud/HUDVitals';
import { HUDTreatmentBags } from '@/components/hud/HUDTreatmentBags';
import { HUDAssessment } from '@/components/hud/HUDAssessment';
import { SceneArrivalChyron } from '@/components/hud/SceneArrivalChyron';
import type { HistoryCategory } from '@/lib/historyTaking';
// InjuryMap retained for a future debrief/instructor summary — not shown in
// the student exam view (findings must be discovered, not listed up front).
import { OnboardingTour, useOnboardingTour } from '@/components/OnboardingTour';
import { NarrationButton, VoiceToggleButton } from '@/components/NarrationButton';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';
import { VoiceCommandButton } from '@/components/VoiceCommandButton';
import type { VoiceMatch } from '@/hooks/useVoiceInput';
import { buildVoiceIntents, type VoiceIntent, type VoicePhase } from '@/lib/voiceIntents';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { MedicalControlDialog } from '@/components/MedicalControlDialog';
import { generateNarrativeReport } from '@/lib/narrativeReport';
import { generateEDOutcome } from '@/lib/edOutcome';
import { exportSessionToPDF } from '@/lib/pdf-export';
import { getResourcesForDebriefing } from '@/data/diversifiedResources';
import { inferSceneImage, inferSceneVideo } from '@/lib/sceneImageSelection';
import { patientAgeShortLabel } from '@/lib/patientAgePresentation';
import {
  estimatedBvmTidalVolumeLitres,
  projectedEtco2Target,
  targetMinuteVentilationLitres,
} from '@/lib/ventilationPhysiology';

/**
 * Generate a student-friendly case title that doesn't reveal the diagnosis.
 * Uses dispatch reason and patient demographics instead.
 */
function getStudentCaseTitle(caseData: CaseScenario): string {
  const age = caseData.patientInfo?.age;
  const gender = caseData.patientInfo?.gender;
  const reason = caseData.dispatchInfo?.callReason;

  // Build patient description
  let patient = '';
  if (age != null && gender) {
    patient = `${patientAgeShortLabel(age)} ${gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Patient'}`;
  } else {
    patient = 'Patient';
  }

  // Use dispatch reason as the case title
  if (reason) {
    // Strip redundant age/gender from callReason to avoid duplication with patient description
    let cleanReason = reason;
    if (age) {
      // Pattern 1: "32-year-old female difficulty breathing" or "45-year-old diabetic feeling..."
      // Strips "N-year-old" + optional gender/descriptor word
      cleanReason = cleanReason.replace(
        /^\d{1,3}[- ]?(?:year[- ]?old|yo|y\.?o\.?)\s+(?:male|female|man|woman|patient|child|boy|girl)\b[,\s-]*/i,
        ''
      );
      // Pattern 1b: "N-year-old" followed by non-gender word (e.g., "45-year-old diabetic")
      // Only strip the age part, keep the descriptor
      cleanReason = cleanReason.replace(
        /^\d{1,3}[- ]?(?:year[- ]?old|yo|y\.?o\.?)\s+/i,
        ''
      );
      // Pattern 2: "Male, 64, difficulty breathing" or "Female, 32, ..."
      cleanReason = cleanReason.replace(
        /^(?:male|female|man|woman|patient|child|boy|girl)[,\s]+\d{1,3}[,\s]+/i,
        ''
      );
      // Pattern 3: "64 male ..." or "32 female ..."
      cleanReason = cleanReason.replace(
        /^\d{1,3}[,\s]+(?:male|female|man|woman|patient|child|boy|girl)[,\s-]*/i,
        ''
      );
    }
    cleanReason = cleanReason.charAt(0).toUpperCase() + cleanReason.slice(1);
    return `${patient} — ${cleanReason}`;
  }

  // Fallback to category-based generic title
  const cat = caseData.category?.toLowerCase() || '';
  if (cat.includes('cardiac')) return `${patient} — Chest Pain / Cardiac Complaint`;
  if (cat.includes('respiratory')) return `${patient} — Breathing Difficulty`;
  if (cat.includes('trauma')) return `${patient} — Trauma / Injury`;
  if (cat.includes('neurological')) return `${patient} — Neurological Complaint`;
  if (cat.includes('medical')) return `${patient} — Medical Emergency`;

  return `${patient} — Emergency Call`;
}

type MissionSkillFocus = 'any' | 'assessment' | 'airway' | 'breathing' | 'circulation' | 'medication' | 'trauma';
type MissionEquipmentFocus = 'any' | 'oxygen' | 'monitoring' | 'medications' | 'immobilisation' | 'ventilation';
type MissionTimebox = 'untimed' | '10' | '15' | '20';

const missionSkillKeywords: Record<MissionSkillFocus, string[]> = {
  any: [],
  assessment: ['assessment', 'primary survey', 'secondary survey', 'history', 'opqrst', 'samps', 'examine', 'inspect', 'palpate'],
  airway: ['airway', 'choking', 'stridor', 'suction', 'foreign body', 'gurgling', 'anaphylaxis', 'opa', 'npa'],
  breathing: ['breathing', 'respiratory', 'asthma', 'copd', 'pneumothorax', 'wheeze', 'oxygen', 'spo2', 'nebul'],
  circulation: ['cardiac', 'chest pain', 'shock', 'bleeding', 'haemorrhage', 'hemorrhage', 'arrhythmia', 'stemi', 'pulse'],
  medication: ['drug', 'medication', 'overdose', 'poison', 'toxic', 'anaphylaxis', 'diabetic', 'hypoglycaemia', 'hypoglycemia'],
  trauma: ['trauma', 'fall', 'fracture', 'burn', 'collision', 'immobilisation', 'immobilization', 'splint', 'spinal'],
};

const missionEquipmentKeywords: Record<MissionEquipmentFocus, string[]> = {
  any: [],
  oxygen: ['oxygen', 'hypoxia', 'spo2', 'breathing', 'respiratory', 'asthma', 'copd', 'pneumothorax'],
  monitoring: ['ecg', 'monitor', 'cardiac', 'arrhythmia', 'chest pain', 'blood pressure', 'spo2', 'vitals'],
  medications: ['drug', 'medication', 'adrenaline', 'epinephrine', 'salbutamol', 'aspirin', 'gtn', 'naloxone', 'glucose'],
  immobilisation: ['trauma', 'spinal', 'fracture', 'fall', 'collision', 'splint', 'cervical', 'long board', 'scoop'],
  ventilation: ['ventilation', 'bvm', 'bag-valve', 'respiratory failure', 'apnoea', 'apnea', 'airway', 'intubation'],
};

function buildCaseSearchText(caseData: CaseScenario): string {
  return [
    caseData.title,
    caseData.category,
    caseData.subcategory,
    caseData.priority,
    caseData.complexity,
    caseData.dispatchInfo?.callReason,
    caseData.sceneInfo?.description,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.consciousness,
    ...(caseData.expectedFindings?.keyObservations ?? []),
    ...(caseData.expectedFindings?.redFlags ?? []),
    ...(caseData.expectedFindings?.differentialDiagnoses ?? []),
    caseData.expectedFindings?.mostLikelyDiagnosis,
    ...(caseData.managementPathway?.immediate ?? []),
    ...(caseData.managementPathway?.monitoring ?? []),
    ...(caseData.criticalActions?.map(action => action.description) ?? []),
    ...(caseData.teachingPoints ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function matchesMissionKeywords(caseData: CaseScenario, keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  const text = buildCaseSearchText(caseData);
  return keywords.some(keyword => text.includes(keyword));
}

function getCaseCompetencyTags(caseData: CaseScenario, focus: MissionSkillFocus): string[] {
  const tags = ['Primary survey', 'Clinical reasoning'];
  const text = buildCaseSearchText(caseData);

  if (focus !== 'any') tags.push(focus === 'medication' ? 'Medication safety' : `${focus.charAt(0).toUpperCase()}${focus.slice(1)} focus`);
  if (caseData.category === 'cardiac' || text.includes('ecg') || text.includes('chest pain')) tags.push('ECG + monitor');
  if (caseData.category === 'respiratory' || text.includes('breathing') || text.includes('spo2')) tags.push('Oxygenation');
  if (caseData.category === 'trauma' || text.includes('fracture') || text.includes('bleeding')) tags.push('Trauma survey');
  if (caseData.priority === 'critical' || caseData.complexity === 'expert') tags.push('Escalation');

  return [...new Set(tags)].slice(0, 5);
}

function getCaseEquipmentTags(caseData: CaseScenario, equipmentFocus: MissionEquipmentFocus): string[] {
  const text = buildCaseSearchText(caseData);
  const tags = ['Monitor', 'PPE'];

  if (equipmentFocus !== 'any') {
    const focusLabel = equipmentFocus === 'immobilisation' ? 'Immobilisation' : equipmentFocus.charAt(0).toUpperCase() + equipmentFocus.slice(1);
    tags.push(focusLabel);
  }
  if (text.includes('oxygen') || text.includes('spo2') || text.includes('breathing') || caseData.category === 'respiratory') tags.push('Oxygen kit');
  if (text.includes('ecg') || text.includes('chest pain') || caseData.category === 'cardiac') tags.push('12-lead ECG');
  if (text.includes('bleeding') || text.includes('shock') || text.includes('trauma')) tags.push('Circulation bag');
  if (text.includes('fracture') || text.includes('spinal') || caseData.category === 'trauma') tags.push('Splints');
  if (text.includes('medication') || text.includes('overdose') || text.includes('anaphylaxis')) tags.push('Medication bag');

  return [...new Set(tags)].slice(0, 5);
}

function getCohortScopeLabel(year: StudentYear): string {
  if (year === '1st-year') return 'current cohort only';
  if (year === 'diploma') return 'diploma + Year 1/2 fundamentals';
  return `${year} + prerequisite review`;
}
import { DefibrillationDialog } from '@/components/DefibrillationDialog';
import { HandsOnProcedureDialog } from '@/components/HandsOnProcedureDialog';
import {
  isHandsOnTreatment,
  procedureIncludesIntegratedReassessment,
  procedureSiteToken,
  type ProcedureTarget,
} from '@/lib/handsOnProcedures';
import { hasAttachedDefibrillatorPads } from '@/lib/defibrillatorSafety';
import { isBleedRegionControlled } from '@/lib/bleedControl';
import { assessTractionSplintSafety } from '@/lib/tractionSplintSafety';
import { assessLimbSplintSafety, type LimbSplintTreatmentId } from '@/lib/limbSplintSafety';
import { assessPulseAtSite, derivePulseReassessedTreatmentIds, parsePulseSite, type PulseAssessmentResult } from '@/lib/pulseAssessment';
import { assessAmbulationSafety } from '@/lib/ambulationSafety';
import { VentilatorSetupDialog, type VentilatorSettings } from '@/components/VentilatorSetupDialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// ClinicalAssessmentPanel removed — replaced by inline ABCDE Primary Survey + 3D Physical Exam
import {
  type AssessmentStepId,
  type AssessmentFinding,
  type AssessmentTracker,
  createAssessmentTracker,
  performAssessment as performAssessmentStep,
  generateAssessmentDebrief,
  SPECIAL_STEPS,
  ALL_STEPS,
} from '@/data/assessmentFramework';
import {
  evaluateTreatmentQuality,
  getResourcesForCase,
  generateYearAwareGuidance,
  assessTreatmentTiming,
  type TreatmentQualityResult,
  type FeedbackResource,
} from '@/data/clinicalRealism';

// Lazy load heavy components
const CaseDisplay = lazy(() => import('@/components/CaseDisplay').then(m => ({ default: m.CaseDisplay })));
const VitalSignsMonitor = lazy(() => import('@/components/VitalSignsMonitor').then(m => ({ default: m.VitalSignsMonitor })));
const Body3DModel = lazy(() => import('@/components/Body3DModel').then(m => ({ default: m.Body3DModel })));

function LoadingCard() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted/60 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted/50 animate-pulse" />
          <div className="h-3 w-5/6 rounded bg-muted/40 animate-pulse" />
          <div className="h-3 w-2/3 rounded bg-muted/30 animate-pulse" />
        </div>
        <div className="flex items-center justify-center pt-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
        </div>
      </CardContent>
    </Card>
  );
}

const realismSeverityStyles: Record<RealismDirectorState['severity'], {
  rail: string;
  icon: string;
  badge: string;
  panel: string;
}> = {
  normal: {
    rail: 'from-emerald-400 to-cyan-400',
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    badge: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    panel: 'border-emerald-400/30 bg-emerald-950/55',
  },
  observe: {
    rail: 'from-cyan-400 to-blue-400',
    icon: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
    badge: 'border-cyan-400/40 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200',
    panel: 'border-cyan-400/30 bg-cyan-950/55',
  },
  warning: {
    rail: 'from-amber-400 to-orange-500',
    icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    badge: 'border-amber-400/50 bg-amber-500/10 text-amber-800 dark:text-amber-200',
    panel: 'border-amber-400/35 bg-amber-950/55',
  },
  critical: {
    rail: 'from-rose-400 to-red-500',
    icon: 'bg-red-500/10 text-red-700 dark:text-red-300',
    badge: 'border-red-400/50 bg-red-500/10 text-red-800 dark:text-red-200',
    panel: 'border-red-400/35 bg-red-950/58',
  },
};

function RealismDirectorCard({ state }: { state: RealismDirectorState }) {
  const style = realismSeverityStyles[state.severity];
  const sceneItems = state.sceneConstraints.slice(0, 2);
  const cueItems = state.visibleCues.slice(0, 3);
  const treatmentItems = state.treatmentEvidence.slice(0, 2);
  const reassessmentItems = state.reassessmentPrompts.slice(0, 3);
  const pendingTreatmentLoops = state.treatmentLoopStates
    .filter(loop => loop.state === 'applied')
    .slice(0, 3);
  const completedTreatmentLoops = state.treatmentLoopStates
    .filter(loop => loop.state === 'reassessed')
    .slice(0, 2);

  return (
    <Card className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-[0_8px_32px_-20px_rgba(15,23,42,0.35)] ${style.panel}`}>
      <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${style.rail}`} />
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/30 ${style.icon}`}>
              <Activity className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                Clinical reality
              </p>
              <h3 className="mt-1 text-sm font-semibold leading-snug text-white">
                {state.headline}
              </h3>
            </div>
          </div>
          <Badge variant="outline" className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] ${style.badge}`}>
            {state.caseFamily} - {state.severity}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          <div className="rounded-xl border border-slate-200 bg-white/90 p-3 dark:border-slate-700 dark:bg-slate-800/90">
            <div className="mb-2 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
              <Shield className="h-3.5 w-3.5" />
              Scene
            </div>
            <div className="space-y-1.5">
              {(sceneItems.length ? sceneItems : ['No special access constraints documented']).map(item => (
                <p key={item} className="text-[11px] leading-relaxed text-slate-900 dark:text-slate-100">{item}</p>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white/90 p-3 dark:border-slate-700 dark:bg-slate-800/90">
            <div className="mb-2 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
              <Target className="h-3.5 w-3.5" />
              Patient cues
            </div>
            <div className="space-y-1.5">
              {cueItems.map(item => (
                <div key={item.id} className="flex gap-2">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    item.severity === 'critical' ? 'bg-red-500' :
                    item.severity === 'warning' ? 'bg-amber-500' :
                    item.severity === 'observe' ? 'bg-cyan-500' :
                    'bg-emerald-500'
                  }`} />
                  <p className="text-[11px] leading-relaxed text-slate-900 dark:text-slate-100">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{item.label}:</span> {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white/90 p-3 dark:border-slate-700 dark:bg-slate-800/90">
            <div className="mb-2 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Reassess
            </div>
            <div className="space-y-1.5">
              {pendingTreatmentLoops.length > 0 ? (
                <>
                  {pendingTreatmentLoops.map(loop => (
                    <div key={loop.treatmentId} className="rounded-lg border border-amber-300/40 bg-amber-50/70 px-2.5 py-2 dark:border-amber-400/20 dark:bg-amber-950/20">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-semibold text-amber-950 dark:text-amber-100">{loop.categoryLabel}</p>
                        <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-amber-800 dark:text-amber-200">
                          pending
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-amber-950/75 dark:text-amber-100/75">{loop.reassessmentPrompt}</p>
                    </div>
                  ))}
                  {completedTreatmentLoops.length > 0 && (
                    <p className="text-[10px] leading-relaxed text-emerald-700 dark:text-emerald-300">
                      {completedTreatmentLoops.length} treatment follow-up{completedTreatmentLoops.length === 1 ? '' : 's'} closed.
                    </p>
                  )}
                </>
              ) : completedTreatmentLoops.length > 0 ? (
                completedTreatmentLoops.map(loop => (
                  <div key={loop.treatmentId} className="rounded-lg border border-emerald-300/40 bg-emerald-50/70 px-2.5 py-2 dark:border-emerald-400/20 dark:bg-emerald-950/20">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-semibold text-emerald-950 dark:text-emerald-100">{loop.categoryLabel}</p>
                      <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-emerald-800 dark:text-emerald-200">
                        reassessed
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-emerald-950/75 dark:text-emerald-100/75">{loop.reassessmentPrompt}</p>
                  </div>
                ))
              ) : (
                [...treatmentItems, ...reassessmentItems].slice(0, 4).map(item => (
                  <p key={item} className="line-clamp-2 text-[11px] leading-relaxed text-foreground/75">{item}</p>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type StudentPhase = 'select' | 'prebriefing' | 'scene-survey' | 'case' | 'vitals' | 'postcase';
interface StudentPanelProps {
  onExit: () => void;
  /**
   * If set, the panel skips the case-selection phase and runs this case
   * directly. Used by the classroom-host route so an instructor can drive
   * the exact same full case experience (LIFEPAK, 3D body, ABCDE,
   * treatments, etc.) that students see in single-player mode.
   */
  /** Landing-page category cards pass this so Trauma (etc.) is already selected. */
  initialCategory?: string;
  preloadedCase?: CaseScenario;
  /**
   * Optional banner rendered above the case header — typically the
   * classroom broadcast toolbar. Kept as a ReactNode slot so the panel
   * doesn't need to know anything about classroom state or Supabase.
   */
  topBanner?: React.ReactNode;
  /**
   * When set, the panel broadcasts its observable state (vitals,
   * applied treatments, completed checklist items, performed assessment
   * steps, revealed monitor vitals) whenever they change. Used by the
   * classroom host so every watching student sees the instructor's
   * actions in real time. No-op for single-player mode.
   */
  onClassroomStateChange?: (patch: {
    vitals?: Partial<Record<string, number | string>>;
    appliedTreatments?: Array<{ id: string; name: string; detail?: string; appliedAt: string }>;
    completedItems?: string[];
    assessmentPerformed?: string[];
    caseStartedAt?: string;
    monitorRevealedVitals?: string[];
    currentRhythm?: string;
    isInArrest?: boolean;
    arrestState?: {
      cprRunning?: boolean;
      shockCount?: number;
      adrenalineDoses?: number;
      amiodaroneDoses?: number;
      cycleNumber?: number;
    };
    ventilatorSettings?: {
      mode: string;
      tidalVolumeMl: number;
      respiratoryRate: number;
      fio2Percent: number;
      peepCmH2O: number;
      ieRatio: string;
    } | undefined;
    bvmVentilationRate?: number | undefined;
    arrestTimeline?: Array<{ time: number; event: string; type: string }>;
    transportDecision?: {
      priority?: string;
      position?: string;
      preAlert?: boolean;
      destination?: string;
      provisionalDiagnosis?: string;
    };
    pacerState?: { active: boolean; rate: number; output: number };
  }) => void;
  /**
   * Spectator mode — disable every interactive control. Students who are
   * watching (but not currently driving) a classroom case use this so
   * they see the full clinical interface but can't mutate it.
   */
  readOnly?: boolean;
  /**
   * When provided, the panel mirrors this state into its local state on
   * every update. Used by the classroom spectator flow so incoming
   * state_patch broadcasts flow through into the LIFEPAK monitor,
   * treatment list, assessment ticks, etc. — without the spectator ever
   * clicking anything.
   */
  externalState?: {
    vitals?: Record<string, number | string | undefined>;
    appliedTreatments?: Array<{ id: string; name: string; detail?: string; appliedAt: string }>;
    completedItems?: string[];
    assessmentPerformed?: string[];
    caseStartedAt?: string;
    monitorRevealedVitals?: string[];
    currentRhythm?: string;
    isInArrest?: boolean;
    arrestState?: {
      cprRunning?: boolean;
      shockCount?: number;
      adrenalineDoses?: number;
      amiodaroneDoses?: number;
      cycleNumber?: number;
    };
    ventilatorSettings?: {
      mode: string;
      tidalVolumeMl: number;
      respiratoryRate: number;
      fio2Percent: number;
      peepCmH2O: number;
      ieRatio: string;
    };
    bvmVentilationRate?: number | null;
    arrestTimeline?: Array<{ time: number; event: string; type: string }>;
    transportDecision?: {
      priority?: string;
      position?: string;
      preAlert?: boolean;
      destination?: string;
      provisionalDiagnosis?: string;
    };
    pacerState?: { active: boolean; rate: number; output: number };
  };
  /**
   * Instructor-side live override. Every commit bumps `nonce`; whenever
   * the nonce changes, the panel merges the payload into its local
   * patientState and vitals, then the existing broadcast effects carry
   * the change to every student. See InstructorLiveControls.
   */
  instructorOverride?: {
    nonce: number;
    vitals?: Partial<{
      bp: string; pulse: number; respiration: number;
      spo2: number; temperature: number; gcs: number; bloodGlucose: number;
    }>;
    currentRhythm?: string;
    isInArrest?: boolean;
    reason?: string;
  };
  /**
   * Classroom clinical role assigned to this participant (lead / airway /
   * circulation / medication / scribe), or null when unassigned. Drives a
   * role badge in the header and *soft* action warnings — never a hard
   * block. Undefined in single-player mode.
   */
  clinicalRole?: ClinicalRole | null;
  /**
   * Classroom injects fired by the instructor this case (append-only, from
   * sharedState.activeInjects). The panel watches for new entries and renders
   * notification overlays; vitals_change / rhythm_change payloads also patch
   * the live monitor. Undefined in single-player mode.
   */
  activeInjects?: ClassroomInject[];
}

interface TreatmentPracticalityContext {
  treatment: Treatment;
  currentVitals: VitalSigns;
  currentCase: CaseScenario;
  patientState: PatientState;
  appliedTreatmentIds: string[];
  hasRosc: boolean;
}

interface TreatmentChallenge {
  level: 'block' | 'challenge';
  title: string;
  clinicalReason: string;
  patientQuote?: string;
  proceedLabel?: string;
}

interface PendingTreatmentChallenge {
  treatment: Treatment;
  challenge: TreatmentChallenge;
  defibParams?: DefibrillationParams;
}

interface TacticalCareFeedItem {
  id: string;
  label: string;
  detail: string;
  tone: 'critical' | 'warning' | 'normal' | 'loop' | 'visual';
  /** One-tap game actions: jump to the treatment that answers this finding,
   *  or perform the assessment step that closes this treatment loop. */
  treatSuggestion?: FindingTreatmentSuggestion;
  reassessStepId?: AssessmentStepId;
}

interface TacticalTimelineItem {
  id: string;
  time: string;
  title: string;
  detail: string;
  tone: 'assessment' | 'treatment' | 'vitals' | 'alert' | 'reassess';
}

function formatClinicalToken(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function TacticalCareFeed({
  items,
  onTreat,
  onReassess,
}: {
  items: TacticalCareFeedItem[];
  onTreat?: (suggestion: FindingTreatmentSuggestion) => void;
  onReassess?: (stepId: AssessmentStepId) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="tactical-care-feed" aria-live="polite">
      <div className="tactical-care-feed-head">
        <Activity className="h-3.5 w-3.5" />
        <span>Live care feed</span>
      </div>
      <div className="tactical-care-feed-grid">
        {items.map(item => {
          const Icon =
            item.tone === 'critical' ? AlertTriangle
              : item.tone === 'loop' ? ClipboardCheck
                : item.tone === 'normal' ? CheckCircle2
                  : Activity;
          return (
            <div key={item.id} className="tactical-care-feed-item" data-tone={item.tone}>
              <Icon className="h-3.5 w-3.5" />
              <div className="min-w-0">
                <p>{item.label}</p>
                <span>{item.detail}</span>
                {item.treatSuggestion && onTreat && (
                  <button
                    type="button"
                    className="tactical-care-feed-action"
                    onClick={() => onTreat(item.treatSuggestion!)}
                  >
                    → Treat: {item.treatSuggestion.treatmentName}
                  </button>
                )}
                {item.reassessStepId && onReassess && (
                  <button
                    type="button"
                    className="tactical-care-feed-action"
                    onClick={() => onReassess(item.reassessStepId!)}
                  >
                    → Reassess now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TacticalBayTimeline({
  items,
  elapsed,
}: {
  items: TacticalTimelineItem[];
  elapsed: string;
}) {
  return (
    <div className="tactical-bay-timeline">
      <div className="tactical-bay-timeline-head">
        <div>
          <p>Case narrative</p>
          <strong>{elapsed}</strong>
        </div>
        <span>assess {'->'} treat {'->'} reassess</span>
      </div>
      <div className="tactical-bay-timeline-track">
        {items.length > 0 ? items.map(item => {
          const Icon =
            item.tone === 'assessment' ? Stethoscope
              : item.tone === 'treatment' ? Syringe
                : item.tone === 'alert' ? AlertTriangle
                  : item.tone === 'reassess' ? ClipboardCheck
                    : Activity;
          return (
            <div key={item.id} className="tactical-bay-timeline-item" data-tone={item.tone}>
              <div className="tactical-bay-timeline-time">{item.time}</div>
              <div className="tactical-bay-timeline-dot">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p>{item.title}</p>
                <span>{item.detail}</span>
              </div>
            </div>
          );
        }) : (
          <div className="tactical-bay-timeline-empty">
            <Activity className="h-3.5 w-3.5" />
            <span>Start with a focused look at the patient, then build the story through assessment and treatment.</span>
          </div>
        )}
      </div>
    </div>
  );
}


function RoadmapStepBadge({ index }: { index: number }) {
  return <span className="roadmap-step-badge">{index}</span>;
}

function RoadmapAnatomyPanel({
  visualState,
  activeFindings,
  assessedCount,
}: {
  visualState: ReturnType<typeof derivePatientVisualState> | null;
  activeFindings: { stepId: AssessmentStepId; findings: AssessmentFinding[] } | null;
  assessedCount: number;
}) {
  const eyeDetail = visualState?.eyeEffects.kind !== 'normal'
    ? `${formatClinicalToken(visualState?.eyeEffects.kind ?? '')} pupils`
    : 'Pupils';
  const chestDetail = visualState?.chestRiseAsymmetry?.detail || 'Chest';
  const abdomenFinding = activeFindings?.stepId === 'abdomen'
    ? activeFindings.findings[0]?.value
    : 'Abdomen';
  const limbFinding = visualState?.woundOverlays[0]?.detail || 'Limbs';

  return (
    <section className="roadmap-panel roadmap-anatomy-panel">
      <div className="roadmap-panel-title">
        <RoadmapStepBadge index={2} />
        <h3>Anatomy assessment</h3>
      </div>
      <div className="roadmap-anatomy-grid">
        {[
          { label: 'Eyes', detail: eyeDetail, Icon: Eye },
          { label: 'Chest', detail: chestDetail, Icon: Stethoscope },
          { label: 'Abdomen', detail: abdomenFinding, Icon: Activity },
          { label: 'Limbs', detail: limbFinding, Icon: Target },
        ].map(item => {
          const Icon = item.Icon;
          return (
            <div key={item.label} className="roadmap-anatomy-tile">
              <Icon className="h-4 w-4" />
              <div>
                <p>{item.label}</p>
                <span>{item.detail}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="roadmap-anatomy-progress">
        <span>{assessedCount} regions assessed</span>
        <strong>{visualState?.equipmentAnchors.length ?? 0} attached devices</strong>
      </div>
    </section>
  );
}


function RoadmapDebriefPanel({
  items,
  currentVitals,
  appliedTreatments,
  assessmentTracker,
}: {
  items: TacticalTimelineItem[];
  currentVitals: VitalSigns | null;
  appliedTreatments: AppliedTreatment[];
  assessmentTracker: AssessmentTracker | null;
}) {
  const assessmentRatio = assessmentTracker
    ? assessmentTracker.performed.length / Math.max(assessmentTracker.required.length || 1, 1)
    : 0;
  const score = Math.max(8, Math.min(100, Math.round(
    assessmentRatio * 55
    + Math.min(appliedTreatments.length, 4) * 8
    + (currentVitals?.spo2 && currentVitals.spo2 >= 94 ? 12 : 0)
  )));

  return (
    <section className="roadmap-panel roadmap-debrief-panel">
      <div className="roadmap-panel-title">
        <RoadmapStepBadge index={4} />
        <h3>Debrief timeline</h3>
      </div>
      <div className="roadmap-mini-timeline">
        {(items.length ? items : [{ id: 'start', time: '00:00', title: 'Scene arrival', detail: 'Case started', tone: 'assessment' as const }]).slice(-5).map(item => (
          <div key={item.id} className="roadmap-mini-event" data-tone={item.tone}>
            <span>{item.time}</span>
            <p>{item.title}</p>
          </div>
        ))}
      </div>
      <div className="roadmap-debrief-grid">
        <div className="roadmap-key-actions">
          <p>Key actions</p>
          {[
            assessmentTracker?.performed.length ? 'Assessment started' : 'Assessment pending',
            appliedTreatments[0]?.name || 'Treatment pending',
            appliedTreatments.length > 1 ? `${appliedTreatments.length} interventions` : 'Ongoing monitoring',
          ].map(action => (
            <span key={action}><CheckCircle2 className="h-3.5 w-3.5" /> {action}</span>
          ))}
        </div>
        <div className="roadmap-outcome-score">
          <strong>{score}</strong>
          <span>/100</span>
          <p>{score >= 80 ? 'Strong trajectory' : score >= 55 ? 'Developing' : 'Early phase'}</p>
        </div>
      </div>
    </section>
  );
}

function getVitalGcsTotal(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value && typeof value === 'object' && 'total' in value) {
    const total = Number((value as { total?: unknown }).total);
    return Number.isFinite(total) ? total : null;
  }
  return null;
}

function getPatientGcsTotal(currentVitals: VitalSigns, currentCase: CaseScenario, patientState: PatientState): number {
  return getVitalGcsTotal(currentVitals.gcs)
    ?? getVitalGcsTotal(patientState.vitals?.gcs)
    ?? getVitalGcsTotal(currentCase.abcde?.disability?.gcs)
    ?? getVitalGcsTotal(currentCase.vitalSignsProgression?.initial?.gcs)
    ?? 15;
}

function getCaseClinicalText(caseData: CaseScenario): string {
  return [
    caseData.title,
    caseData.dispatchInfo?.callReason,
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.position,
    caseData.abcde?.airway?.patent === false ? 'airway not patent' : '',
    ...(caseData.abcde?.airway?.findings ?? []),
    ...(caseData.abcde?.breathing?.findings ?? []),
    ...(caseData.abcde?.disability?.findings ?? []),
    ...(caseData.expectedFindings?.keyObservations ?? []),
    ...(caseData.secondarySurvey?.headDetailed?.face ?? []),
    ...(caseData.secondarySurvey?.chest ?? []),
  ].filter(Boolean).join(' ').toLowerCase();
}

function canPatientVocalize(currentVitals: VitalSigns, currentCase: CaseScenario, patientState: PatientState): boolean {
  if (patientState.isInArrest) return false;
  const gcs = getPatientGcsTotal(currentVitals, currentCase, patientState);
  const rr = currentVitals.respiration ?? patientState.vitals?.respiration ?? 0;
  const text = getCaseClinicalText(currentCase);
  if (gcs < 13 || rr <= 0) return false;
  if (/(unconscious|unresponsive|obtunded|seizing|actively seizing|agonal|apnoeic|apneic|cardiac arrest|unable to speak)/.test(text)) return false;
  return true;
}

function hasAirwayCompromise(currentVitals: VitalSigns, currentCase: CaseScenario, patientState: PatientState): boolean {
  const text = getCaseClinicalText(currentCase);
  const rr = currentVitals.respiration ?? patientState.vitals?.respiration ?? 0;
  const spo2 = currentVitals.spo2 ?? patientState.vitals?.spo2 ?? 100;
  return currentCase.abcde?.airway?.patent === false
    || rr <= 8
    || spo2 < 90
    || /(stridor|gurgling|snoring|obstruct|vomit|secretions|foreign body|airway compromise|unable to protect airway|silent chest|cyanosis|apnoeic|apneic|agonal)/.test(text);
}

function assessTreatmentPracticality({
  treatment,
  currentVitals,
  currentCase,
  patientState,
  appliedTreatmentIds,
  hasRosc,
}: TreatmentPracticalityContext): TreatmentChallenge | null {
  const id = treatment.id;
  const gcs = getPatientGcsTotal(currentVitals, currentCase, patientState);
  const rr = currentVitals.respiration ?? patientState.vitals?.respiration ?? 0;
  const spo2 = currentVitals.spo2 ?? patientState.vitals?.spo2 ?? 100;
  const text = getCaseClinicalText(currentCase);
  const vocal = canPatientVocalize(currentVitals, currentCase, patientState);
  const airwayCompromise = hasAirwayCompromise(currentVitals, currentCase, patientState);
  const respiratoryDistress = spo2 < 94 || rr >= 26 || /severe distress|accessory|tripod|wheeze|cyanosis|pulmonary oedema|pulmonary edema/.test(text);

  if (id === 'airway_open' && vocal && !airwayCompromise) {
    return {
      level: 'block',
      title: 'Airway manoeuvre not indicated',
      clinicalReason: 'The patient is alert, speaking and currently maintaining their own airway. Continue assessment and intervene only if patency or protective reflexes deteriorate.',
      patientQuote: 'I can speak and breathe. Please tell me what you need to check.',
    };
  }

  if (id === 'pericardiocentesis') {
    const systolic = Number.parseInt(String(currentVitals.bp ?? patientState.vitals?.bp ?? '').split('/')[0], 10);
    const tamponadeEvidence = /cardiac tamponade|pericardial effusion|haemopericard|hemopericard|pericardial fluid|beck.?s triad|right ventricular collapse/.test(text);
    if (/aortic dissection|dissecting aortic/.test(text)) {
      return {
        level: 'block',
        title: 'Needle drainage unsafe in suspected aortic dissection',
        clinicalReason: 'Rapid pericardial decompression can worsen bleeding from aortic rupture. Prioritise controlled perfusion and immediate surgical transfer; only an expert-directed minimal bridge drainage strategy is considered when the patient cannot reach surgery alive.',
      };
    }
    if (!tamponadeEvidence) {
      return {
        level: 'block',
        title: 'No tamponade to drain',
        clinicalReason: 'Pericardiocentesis is a high-risk rescue procedure. Confirm pericardial fluid with focused cardiac ultrasound and correlate it with obstructive shock or arrest before puncturing the chest.',
        patientQuote: vocal ? 'Why are you preparing a needle for my chest?' : undefined,
      };
    }
    if (!patientState.isInArrest && Number.isFinite(systolic) && systolic >= 100 && (currentVitals.pulse ?? 0) < 120) {
      return {
        level: 'block',
        title: 'No current haemodynamic compromise',
        clinicalReason: 'An effusion alone is not an emergency needle-drainage indication. Continue monitored ultrasound assessment and arrange expert definitive management unless tamponade physiology develops.',
        patientQuote: vocal ? 'Please explain why this cannot wait for the specialist team.' : undefined,
      };
    }
  }

  if (id === 'targeted_temp_mgmt') {
    if (patientState.isInArrest || !hasRosc) {
      return {
        level: 'block',
        title: 'ROSC not established',
        clinicalReason: 'Temperature control is post-resuscitation care. Continue the cardiac-arrest algorithm until a sustained pulse and organised circulation are present.',
      };
    }
    if (gcs > 8 && !/comatose|unconscious|unresponsive/.test(text)) {
      return {
        level: 'block',
        title: 'Patient is awake after ROSC',
        clinicalReason: 'Active post-ROSC fever-prevention devices are recommended for patients who remain comatose. Continue temperature observation and treat fever through the appropriate clinical pathway.',
        patientQuote: vocal ? 'I am awake. Why are you putting cooling pads on me?' : undefined,
      };
    }
  }

  if (id === 'post_rosc_bundle' && (patientState.isInArrest || !hasRosc)) {
    return {
      level: 'block',
      title: 'ROSC not established',
      clinicalReason: 'A post-ROSC bundle cannot be completed during cardiac arrest. Continue high-quality CPR, rhythm management and treatment of reversible causes until sustained circulation is confirmed.',
    };
  }

  if (id === 'traction_splint') {
    const decision = assessTractionSplintSafety(currentCase, appliedTreatmentIds);
    if (!decision.allowed) {
      return {
        level: 'block',
        title: decision.title,
        clinicalReason: decision.reason,
        patientQuote: vocal ? decision.code === 'uncontrolled-haemorrhage'
          ? 'Please stop the bleeding before you move my leg.'
          : 'That is not where my injury is. Please check me again.' : undefined,
      };
    }
  }

  if (['splinting', 'sam_splint', 'box_splint', 'vacuum_limb_splint', 'air_splint'].includes(id)) {
    const decision = assessLimbSplintSafety(currentCase, id as LimbSplintTreatmentId, appliedTreatmentIds);
    if (!decision.allowed) {
      return {
        level: 'block',
        title: decision.title,
        clinicalReason: decision.reason,
        patientQuote: vocal ? decision.code === 'uncontrolled-haemorrhage'
          ? 'Please stop the bleeding before you wrap my limb.'
          : 'That device does not feel right for this injury. Please check it again.' : undefined,
      };
    }
  }

  if (id === 'assisted_ambulation') {
    const decision = assessAmbulationSafety({
      caseData: currentCase,
      vitals: currentVitals,
      isInArrest: patientState.isInArrest,
    });
    if (!decision.allowed) {
      return {
        level: 'block',
        title: 'Patient is not safe to walk',
        clinicalReason: decision.reason,
        patientQuote: vocal ? 'I feel too unwell to stand safely.' : undefined,
      };
    }
  }

  if (id === 'back_blows' || id === 'abdominal_thrusts') {
    const severeFbao = /(unable to speak|cannot speak|ineffective cough|absent cough|complete obstruction|severe.*obstruction|universal choking|cyanosis|apnoeic|apneic)/.test(text);
    const unresponsive = patientState.isInArrest || /(unconscious|unresponsive)/.test(text);
    if (unresponsive) {
      return {
        level: 'block',
        title: 'Patient is unresponsive',
        clinicalReason: 'Do not continue standing choking manoeuvres. Lower the patient safely, begin CPR with compressions, and look only for a visible object before breaths.',
      };
    }
    if (!severeFbao) {
      return {
        level: 'challenge',
        title: 'Confirm severe airway obstruction',
        clinicalReason: 'Back blows and thrusts are for an ineffective cough or inability to speak/breathe. If the cough is effective, encourage coughing and monitor closely.',
        patientQuote: vocal ? 'I can still cough. Let me try to clear it.' : undefined,
        proceedLabel: 'Treat as severe obstruction',
      };
    }
  }

  if (id === 'abdominal_thrusts') {
    if ((currentCase.patientInfo?.age ?? 99) < 1) {
      return {
        level: 'block',
        title: 'No abdominal thrusts for an infant',
        clinicalReason: 'For severe foreign-body airway obstruction in an infant, alternate five back blows with five chest thrusts. Abdominal thrusts can injure abdominal organs.',
      };
    }
    if (/late pregnancy|third trimester|heavily pregnant/.test(text)) {
      return {
        level: 'block',
        title: 'Use chest thrusts in late pregnancy',
        clinicalReason: 'When the abdomen should not or cannot be encircled, alternate five back blows with five chest thrusts instead.',
        patientQuote: vocal ? 'Please be careful — I am pregnant.' : undefined,
      };
    }
    if (!appliedTreatmentIds.includes('back_blows')) {
      return {
        level: 'block',
        title: 'Give back blows first',
        clinicalReason: 'For a conscious adult with severe foreign-body airway obstruction, begin with five back blows, then give five abdominal thrusts if the obstruction persists.',
      };
    }
  }

  if (id === 'opa_insert' && !patientState.isInArrest && (gcs > 8 || vocal)) {
    return {
      level: 'block',
      title: 'Patient rejects OPA',
      clinicalReason: 'The patient appears conscious enough to have a gag reflex. An oropharyngeal airway is for an unconscious patient without a gag reflex.',
      patientQuote: vocal ? 'No, stop. That is making me gag.' : undefined,
    };
  }

  if ((id === 'intubation' || id === 'rsi_intubation') && !patientState.isInArrest && gcs > 8 && !airwayCompromise) {
    return {
      level: 'block',
      title: 'Airway escalation not justified',
      clinicalReason: 'This patient is not showing a current airway failure or GCS threshold for intubation. Escalate only if they cannot protect the airway, cannot oxygenate/ventilate, or deteriorate.',
      patientQuote: vocal ? 'Wait, I can breathe. What are you doing?' : undefined,
    };
  }

  if (id === 'magill_forceps') {
    const unresponsive = patientState.isInArrest || gcs <= 8 || /(unconscious|unresponsive)/.test(text);
    if (!unresponsive) {
      return {
        level: 'block',
        title: 'Direct laryngoscopy is not tolerated',
        clinicalReason: 'Magill forceps removal requires an unresponsive patient and a directly visualised foreign body. Continue conscious choking manoeuvres while the patient remains responsive.',
        patientQuote: vocal ? 'Stop — I am still awake.' : undefined,
      };
    }
    if (!airwayCompromise) {
      return {
        level: 'block',
        title: 'No current airway obstruction',
        clinicalReason: 'Do not instrument the airway without evidence of obstruction and a directly visible retrieval target.',
      };
    }
  }

  if (id === 'surgical_cric') {
    if ((currentCase.patientInfo?.age ?? 99) < 12) {
      return {
        level: 'block',
        title: 'Surgical cricothyrotomy not appropriate for this age',
        clinicalReason: 'This simulator reserves scalpel–bougie–tube front-of-neck access for patients aged 12 years or older. Use the age-specific paediatric failed-airway pathway.',
      };
    }
    const attemptedUpperAirway = appliedTreatmentIds.some(treatmentId => [
      'intubation', 'rsi_intubation', 'endotracheal_intubation', 'magill_forceps',
    ].includes(treatmentId));
    const attemptedOxygenation = appliedTreatmentIds.includes('bvm_ventilation');
    const cannotOxygenate = spo2 < 90 || rr <= 0;
    if (!attemptedUpperAirway || !attemptedOxygenation || !cannotOxygenate) {
      return {
        level: 'block',
        title: 'Cannot-intubate/cannot-oxygenate not established',
        clinicalReason: 'Emergency front-of-neck access is a last-resort rescue. Attempt and optimise upper-airway oxygenation and an appropriate advanced-airway strategy first; proceed only if oxygenation still fails.',
      };
    }
  }

  if (id === 'bvm_ventilation' && vocal && rr >= 10 && spo2 >= 90 && !airwayCompromise) {
    return {
      level: 'block',
      title: 'Patient fights the BVM',
      clinicalReason: 'An awake, talking patient with spontaneous ventilation will not tolerate bag-mask ventilation. Coach breathing, apply appropriate oxygen, and reassess.',
      patientQuote: 'I am breathing. Please do not put that over my face.',
    };
  }

  if (id === 'cpap_niv' && !patientState.isInArrest && (gcs <= 8 || /vomit|facial trauma|unconscious|unresponsive/.test(text))) {
    return {
      level: 'block',
      title: 'CPAP unsafe',
      clinicalReason: 'Non-invasive ventilation requires a cooperative patient who can protect their airway. Reduced consciousness, vomiting, or facial trauma makes CPAP unsafe.',
      patientQuote: vocal ? 'I cannot tolerate that mask.' : undefined,
    };
  }

  if (id === 'cpap_niv' && vocal && !respiratoryDistress) {
    return {
      level: 'challenge',
      title: 'Question CPAP indication',
      clinicalReason: 'The patient is speaking and does not currently look like they need positive-pressure support. CPAP is usually reserved for significant respiratory distress, pulmonary oedema, COPD, or persistent hypoxia.',
      patientQuote: 'Do I really need that tight mask?',
      proceedLabel: 'Apply CPAP anyway',
    };
  }

  if (id === 'oxygen_nonrebreather' && vocal && spo2 >= 94 && !respiratoryDistress) {
    return {
      level: 'challenge',
      title: 'High-flow oxygen may be excessive',
      clinicalReason: 'SpO2 is already acceptable and the patient is able to speak. Consider titrated oxygen or no oxygen unless clinical context demands high-flow therapy.',
      patientQuote: 'Why do I need the big mask? I can talk to you.',
      proceedLabel: 'Use high-flow anyway',
    };
  }

  if (id === 'suction' && vocal && !/(secretions|vomit|blood in airway|gurgling|foreign body)/.test(text)) {
    return {
      level: 'challenge',
      title: 'No obvious suction target',
      clinicalReason: 'The patient is speaking and there is no documented blood, vomit, gurgling, or secretions. Suction may distress them without benefit.',
      patientQuote: 'No, please do not put that in my mouth.',
      proceedLabel: 'Suction anyway',
    };
  }

  return null;
}

export function StudentPanel({
  onExit,
  initialCategory,
  preloadedCase,
  topBanner,
  onClassroomStateChange,
  readOnly = false,
  externalState,
  instructorOverride,
  clinicalRole,
  activeInjects,
}: StudentPanelProps) {
  const { t, i18n } = useTranslation();
  const reducedMotion = useReducedMotion();
  // Onboarding tour for first-time users
  const { showTour, dismissTour } = useOnboardingTour();

  // Voice narration for dispatch/scene/patient info
  const { speak: speakNarration, isSpeaking: isDispatchSpeaking, stop: stopNarration } = useVoiceNarration();

  // Medical control dialog
  const [showMedicalControl, setShowMedicalControl] = useState(false);

  // Core state
  const [phase, _setPhase] = useState<StudentPhase>('select');
  const [phaseHistory, setPhaseHistory] = useState<StudentPhase[]>([]);
  // Scene survey result — captured pre-arrival, surfaced in the debrief so
  // students can see whether they verbalised safety, picked appropriate PPE,
  // and formed an early impression. Reset when a new case loads.
  const [sceneSurvey, setSceneSurvey] = useState<SceneSurveyResult | null>(null);

  // Wrap setPhase to track history for back navigation
  const setPhase = useCallback((newPhase: StudentPhase) => {
    _setPhase(prev => {
      if (prev !== newPhase) {
        setPhaseHistory(h => [...h, prev]);
      }
      return newPhase;
    });
  }, []);

  const canGoBack = phaseHistory.length > 0 && phase !== 'select' && phase !== 'postcase';
  const goBack = useCallback(() => {
    if (phaseHistory.length === 0) return;
    const prev = phaseHistory[phaseHistory.length - 1];
    setPhaseHistory(h => h.slice(0, -1));
    _setPhase(prev);
  }, [phaseHistory]);
  const [currentCase, setCurrentCase] = useState<CaseScenario | null>(null);
  const sceneEnvironment = useMemo(
    () => currentCase ? deriveSceneEnvironment(currentCase) : null,
    [currentCase],
  );
  // Pre-brief and Scene Survey must use the same demographic-aware resolver.
  // Rendering sceneInfo.sceneImagePath directly here previously let a stale
  // female image contradict a male patient before the next phase corrected it.
  const prebriefSceneImage = useMemo(
    () => currentCase ? inferSceneImage(currentCase) : null,
    [currentCase],
  );
  // Animated arrival clip (opt-in). Null unless this case has a registered
  // video, in which case it replaces the static image in the Scene Brief.
  const prebriefSceneVideo = useMemo(
    () => currentCase ? inferSceneVideo(currentCase) : null,
    [currentCase],
  );
  // Case bundle streams in lazily (see caseLibrary.loadAllCases). Until it
  // resolves, allCases is empty and the mission board shows its skeleton.
  const [allCases, setAllCases] = useState<CaseScenario[]>([]);
  const [casesLoaded, setCasesLoaded] = useState(false);
  useEffect(() => {
    let alive = true;
    void loadAllCases().then(cases => {
      if (!alive) return;
      setAllCases(cases);
      setCasesLoaded(true);
    });
    return () => { alive = false; };
  }, []);
  const [selectedYear, setSelectedYear] = useState<StudentYear>('3rd-year');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory && initialCategory !== 'all' ? initialCategory : 'all',
  );
  const [selectionMode, setSelectionMode] = useState<'standard' | 'random-category' | 'condition'>('standard');
  const [skillFocus, setSkillFocus] = useState<MissionSkillFocus>(
    (initialCategory && skillFocusForCategory[initialCategory]) || 'any',
  );
  const [equipmentFocus, setEquipmentFocus] = useState<MissionEquipmentFocus>('any');
  const [timebox, setTimebox] = useState<MissionTimebox>('15');
  const [conditionSearch, setConditionSearch] = useState('');
  const [, setSelectedCondition] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [missionPreviewCase, setMissionPreviewCase] = useState<CaseScenario | null>(null);
  const [previewEpoch, setPreviewEpoch] = useState(0);
  const lastLaunchedCaseIdRef = useRef<string | null>(null);

  // Session tracking
  const [session, setSession] = useState<CaseSession | null>(null);
  const [currentVitals, setCurrentVitals] = useState<VitalSigns | null>(null);
  // Live mirror of currentVitals for reading inside timer callbacks (which
  // would otherwise capture a stale value).
  const currentVitalsRef = useRef<VitalSigns | null>(null);
  const [previousVitals, setPreviousVitals] = useState<VitalSigns | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<VitalSigns[]>([]);
  // Recording throttle: the monitor emits vitals at tween speed (~12/s) and
  // every emitted object carries the case template's STALE `time` — a session
  // once recorded 7.7k same-timestamp entries. History needs ~1Hz with a real
  // clock: throttle at the recording site and stamp fresh ISO time on append.
  const lastVitalsRecordAtRef = useRef(0);
  const recordVitalsSample = useCallback((v: VitalSigns, force = false) => {
    const now = Date.now();
    if (!force && now - lastVitalsRecordAtRef.current < 1000) return;
    lastVitalsRecordAtRef.current = now;
    setVitalsHistory(prev => [...prev, { ...v, time: new Date(now).toISOString() }]);
  }, []);
  const [appliedTreatments, setAppliedTreatments] = useState<AppliedTreatment[]>([]);
  const [appliedTreatmentIds, setAppliedTreatmentIds] = useState<string[]>([]);
  const [reassessedTreatmentIds, setReassessedTreatmentIds] = useState<string[]>([]);
  const [applyingTreatmentId, setApplyingTreatmentId] = useState<string | null>(null);

  // Dynamic treatment engine state
  const [patientState, setPatientState] = useState<PatientState | null>(null);
  const realismDirector = useMemo(() => {
    if (!currentCase) return null;
    return deriveRealismDirectorState({
      caseData: currentCase,
      vitals: currentVitals,
      patientState,
      appliedTreatmentIds,
      appliedTreatments,
      reassessedTreatmentIds,
    });
  }, [currentCase, currentVitals, patientState, appliedTreatmentIds, appliedTreatments, reassessedTreatmentIds]);
  const patientVisualState = useMemo(
    () => realismDirector ? derivePatientVisualState(realismDirector) : null,
    [realismDirector],
  );
  const [showDefibDialog, setShowDefibDialog] = useState(false);
  const [pendingDefibTreatment, setPendingDefibTreatment] = useState<Treatment | null>(null);
  const [pendingHandsOnTreatment, setPendingHandsOnTreatment] = useState<Treatment | null>(null);
  const handsOnProcedureBypassRef = useRef<Set<string>>(new Set());
  // Pacing is awarded only by the physical monitor after the student has
  // started TCP and palpated a pulse. This one-use proof prevents the
  // treatment drawer from bypassing pads, output titration and capture.
  const pacingCaptureBypassRef = useRef(false);
  const [showVentilatorDialog, setShowVentilatorDialog] = useState(false);
  const [ventilatorSettings, setVentilatorSettings] = useState<VentilatorSettings | null>(null);
  // The settings dialog confirms asynchronously, then re-enters the normal
  // treatment engine. A ref carries that one confirmed configuration through
  // the callback without reopening the dialog or replaying the circuit setup.
  const confirmedVentilatorSettingsRef = useRef<VentilatorSettings | null>(null);
  // BVM bag-valve-mask ventilation rate the student picked (breaths / min).
  // Separate from full mechanical ventilation because BVM is the common
  // prehospital airway intervention and deserves a lighter-weight picker.
  const [bvmVentilationRate, setBvmVentilationRate] = useState<number | null>(null);
  const bvmVentilationRateRef = useRef<number | null>(null);
  const [showBvmRateDialog, setShowBvmRateDialog] = useState(false);
  const [pendingBvmTreatment, setPendingBvmTreatment] = useState<Treatment | null>(null);
  // LUCAS prompt — offered ONCE when CPR has been running for ≥4 min and
  // no LUCAS has been applied yet. Tracked here so it can't re-nag.
  const [lucasPromptShown, setLucasPromptShown] = useState(false);
  // Medication safety confirmation (replaces window.confirm which auto-dismisses on re-render)
  const [pendingMedConfirm, setPendingMedConfirm] = useState<{ treatment: Treatment; allergyText: string; contraText: string } | null>(null);
  const [pendingTreatmentChallenge, setPendingTreatmentChallenge] = useState<PendingTreatmentChallenge | null>(null);
  const [pendingIVTreatment, setPendingIVTreatment] = useState<Treatment | null>(null);
  const deteriorationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const medicationConfirmedRef = useRef<Set<string>>(new Set());
  const treatmentChallengeConfirmedRef = useRef<Set<string>>(new Set());

  // ── Adverse drug reaction (allergy) cascade ──────────────────────────────
  // Set when the student administers a drug the patient is allergic to.
  // `activeReaction` drives the on-screen banner; the refs let timer callbacks
  // and applyTreatment read the live state without stale closures.
  const [activeReaction, setActiveReaction] = useState<AdverseReaction | null>(null);
  const activeReactionRef = useRef<AdverseReaction | null>(null);
  const reactionTimersRef = useRef<number[]>([]);
  // One record per allergen administered — consumed by the grader (per-case).
  const adverseEventsRef = useRef<Array<{
    reactionId: string; treatmentId: string; treatmentName: string;
    kind: AdverseReaction['kind']; allergy: string;
    administeredAt: number; recognizedRescueAt: number | null; reachedArrest: boolean;
  }>>([]);

  // Optional signed-in account (magic link) — used to persist graded results.
  const auth = useAuth();
  const savedResultRef = useRef(false);

  // Assessment tracking
  const [assessmentTracker, setAssessmentTracker] = useState<AssessmentTracker | null>(null);
  const [activeFindings, setActiveFindings] = useState<{ stepId: AssessmentStepId; findings: AssessmentFinding[] } | null>(null);
  const tacticalCareFeedItems = useMemo<TacticalCareFeedItem[]>(() => {
    const items: TacticalCareFeedItem[] = [];

    (realismDirector?.treatmentLoopStates ?? [])
      .filter(loop => loop.state === 'applied')
      .slice(0, 2)
      .forEach(loop => {
        items.push({
          id: `loop-${loop.treatmentId}`,
          label: `${loop.categoryLabel} follow-up`,
          detail: loop.reassessmentPrompt,
          tone: 'loop',
          reassessStepId: deriveReassessmentStepForTreatment(loop.treatmentId) ?? undefined,
        });
      });

    if (activeReaction) {
      items.push({
        id: `reaction-${activeReaction.id}`,
        label: activeReaction.headline,
        detail: activeReaction.kind === 'anaphylaxis'
          ? 'Airway, breathing, circulation and rescue treatment now matter.'
          : 'Watch skin, airway, BP and patient tolerance.',
        tone: activeReaction.kind === 'anaphylaxis' ? 'critical' : 'warning',
      });
    }

    if (activeFindings?.findings.length) {
      const finding =
        activeFindings.findings.find(item => item.severity === 'critical')
        ?? activeFindings.findings.find(item => item.severity === 'abnormal')
        ?? activeFindings.findings[0];
      const stepLabel = ALL_STEPS[activeFindings.stepId]?.shortLabel
        || ALL_STEPS[activeFindings.stepId]?.label
        || formatClinicalToken(activeFindings.stepId);
      // Finding→treatment bridge (Treatment Bay Review R2): an actionable
      // abnormal finding carries a one-tap chip to the treatment that answers
      // it. Normal findings never suggest — no diagnosis spoilers.
      // Auscultation findings are deliberately text-hidden (the student must
      // listen), so once they have examined the chest/breathing the authored
      // auscultation truth counts as revealed for coaching purposes.
      const auscultationTexts = activeFindings.stepId === 'chest' || activeFindings.stepId === 'breathing'
        ? [
            ...(currentCase?.abcde?.breathing?.auscultation ?? []),
            ...(currentCase?.abcde?.breathing?.findings ?? []),
            ...(currentCase?.secondarySurvey?.chest ?? []),
          ]
        : [];
      const treatSuggestion = finding.severity !== 'normal' || auscultationTexts.length > 0
        ? deriveFindingTreatmentSuggestions({
            findingTexts: [
              ...activeFindings.findings
                .filter(item => item.severity !== 'normal')
                .map(item => `${item.label} ${item.value}`),
              ...auscultationTexts,
            ],
            // The director's treatmentResponses only cover APPLIED treatments;
            // the bridge needs the matched scenario's full rule catalogue to
            // suggest what to reach for next.
            treatmentResponses: currentCase
              ? matchRealismScenarios(currentCase).flatMap(scenario => scenario.treatmentResponses)
              : [],
            appliedTreatmentIds,
            availableTreatments: TREATMENTS,
          })[0]
        : undefined;
      items.push({
        id: `finding-${activeFindings.stepId}-${finding.label}`,
        label: `${stepLabel}: ${finding.label}`,
        detail: finding.value,
        tone: finding.severity === 'critical' ? 'critical' : finding.severity === 'abnormal' ? 'warning' : 'normal',
        treatSuggestion,
      });
    }

    const chestRise = patientVisualState?.chestRiseAsymmetry;
    if (chestRise?.present) {
      items.push({
        id: 'visual-chest-rise',
        label: 'Visible breathing change',
        detail: chestRise.detail,
        tone: 'visual',
      });
    }

    const woundPriority: Record<string, number> = {
      active_bleeding: 0,
      open_wound: 1,
      deformity: 2,
      burn_pattern: 3,
      blood_pool: 4,
    };
    const seenWoundDetails = new Set<string>();
    [...(patientVisualState?.woundOverlays ?? [])]
      .sort((a, b) => (woundPriority[a.kind] ?? 9) - (woundPriority[b.kind] ?? 9))
      .filter(overlay => overlay.kind !== 'active_bleeding' || !isBleedRegionControlled(appliedTreatmentIds, overlay.region))
      .filter(overlay => {
        const fingerprint = `${overlay.region}:${overlay.detail}`.toLowerCase();
        if (seenWoundDetails.has(fingerprint)) return false;
        seenWoundDetails.add(fingerprint);
        return true;
      })
      .slice(0, 2)
      .forEach((overlay, index) => {
        items.push({
          id: `visual-wound-${overlay.kind}-${index}`,
          label: formatClinicalToken(overlay.kind),
          detail: overlay.detail,
          tone: overlay.kind === 'active_bleeding' || overlay.kind === 'blood_pool' ? 'critical' : 'visual',
        });
      });

    patientVisualState?.skinEffects.slice(0, 2).forEach((effect, index) => {
      items.push({
        id: `visual-skin-${effect.kind}-${index}`,
        label: formatClinicalToken(effect.kind),
        detail: effect.detail,
        tone: effect.intensity > 0.8 ? 'warning' : 'visual',
      });
    });

    if (patientVisualState?.eyeEffects.kind && patientVisualState.eyeEffects.kind !== 'normal') {
      items.push({
        id: `visual-eyes-${patientVisualState.eyeEffects.kind}`,
        label: `${formatClinicalToken(patientVisualState.eyeEffects.kind)} pupils`,
        detail: patientVisualState.eyeEffects.detail || 'Confirm with focused pupil assessment.',
        tone: 'visual',
      });
    }

    return deduplicateCareFeedItems(items).slice(0, 4);
  }, [activeFindings, activeReaction, appliedTreatmentIds, currentCase, patientVisualState, realismDirector]);
  const [monitorRevealedVitals, setMonitorRevealedVitals] = useState<Set<string>>(new Set());

  // Scene time warnings & coaching
  const [sceneTimeWarnings, setSceneTimeWarnings] = useState<Set<string>>(new Set());
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    bvmVentilationRateRef.current = bvmVentilationRate;
  }, [bvmVentilationRate]);
  const [hintVisible, setHintVisible] = useState(false);
  const [currentHint, setCurrentHint] = useState<string>('');

  // ---- Classroom injects (instructor-fired complications) ----
  // Equipment-failure injects stay on screen as a red banner until the
  // student dismisses them; everything else is a transient toast.
  const [injectBanner, setInjectBanner] = useState<ClassroomInject | null>(null);
  const [injectFeedOpen, setInjectFeedOpen] = useState(false);

  // Scene toggle & ABCDE row states
  const [showScene, setShowScene] = useState(false);
  const [activePrimarySurvey, setActivePrimarySurvey] = useState<'scene-safety' | 'airway' | 'breathing' | 'circulation' | 'disability' | 'exposure' | null>(null);
  const [, setActiveHistoryStep] = useState<'signs-symptoms' | 'allergies' | 'medications' | 'past-medical' | 'last-meal' | 'events-leading' | null>(null);
  const [activeManagementTab, setActiveManagementTab] = useState<ManagementTab>('airway');
  const [openManagementBag, setOpenManagementBag] = useState<ManagementTab | null>('airway');
  const [careRailMode, setCareRailMode] = useState<'treat' | 'assess' | 'history'>('assess');
  const [medSearch, setMedSearch] = useState('');

  // Voice-first mode (senior students) — run the whole case hands-free.
  // Persisted so a student who prefers it doesn't re-toggle every case.
  const [voiceFirstMode, setVoiceFirstMode] = useState<boolean>(() => {
    try { return localStorage.getItem('voice-first-mode') === 'true'; } catch { return false; }
  });
  const toggleVoiceFirst = useCallback(() => {
    setVoiceFirstMode(prev => {
      const next = !prev;
      try { localStorage.setItem('voice-first-mode', String(next)); } catch { /* private mode */ }
      return next;
    });
  }, []);
  // Only 3rd/4th year get voice-first — juniors need the tactile checklist.
  const voiceFirstAllowed = selectedYear === '3rd-year' || selectedYear === '4th-year';
  // Pending drug confirmation — set when a `requiresConfirm` intent fires.
  const [pendingVoiceDrug, setPendingVoiceDrug] = useState<{ treatmentId: string; name: string } | null>(null);
  // Care-feed "→ Treat" chip: open the right jump bag with the suggested
  // treatment already in the search box, and bring the kit into view.
  const openSuggestedTreatment = useCallback((suggestion: FindingTreatmentSuggestion) => {
    const treatment = TREATMENTS.find(item => item.id === suggestion.treatmentId);
    if (!treatment) return;
    setCareRailMode('treat');
    const bagKey = bagKeyForTreatment(treatment);
    setActiveManagementTab(bagKey);
    setOpenManagementBag(bagKey);
    setMedSearch(treatment.name);
    requestAnimationFrame(() => {
      document.querySelector('.tactical-management-options')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  // Transport decision wizard — step-by-step flow
  const [showTransportDecision, setShowTransportDecision] = useState(false);
  const [transportStep, setTransportStep] = useState<1 | 2 | 3 | 4 | 5>(1); // 1=priority, 2=position, 3=preAlert+destination, 4=diagnosis, 5=confirm
  const [transportDecisions, setTransportDecisions] = useState<{
    priority: string;
    position: string;
    preAlert: boolean;
    destination: string;
    provisionalDiagnosis: string;
  } | null>(null);

  // Cardiac arrest management — integrated into existing flow
  // arrestConfirmed: student has explicitly confirmed the arrest (via pulse check + button)
  // arrestActive: the full arrest workflow (CPR timer, drug tracking) is running
  const [arrestConfirmed, setArrestConfirmed] = useState(false);
  const [arrestActive, setArrestActive] = useState(false);
  // Pulse check state
  const [pulseCheckInProgress, setPulseCheckInProgress] = useState(false);
  const [lastPulseAssessment, setLastPulseAssessment] = useState<PulseAssessmentResult | null>(null);
  // Pulse check — now triggered by tapping the carotid (neck) / radial (wrist)
  // points on the mannequin. 2s palpation interval with immediate feedback;
  // present iff a perfusing pulse exists and the patient isn't in arrest.
  const runPulseCheck = useCallback((site?: string) => {
    if (pulseCheckInProgress || !currentCase || !currentVitals) return;
    setPulseCheckInProgress(true);
    setLastPulseAssessment(null);
    lastActivityRef.current = Date.now();
    const pulseSite = parsePulseSite(site ?? 'pulse-carotid-right');
    const assessment = assessPulseAtSite({
      site: pulseSite,
      caseData: currentCase,
      vitals: currentVitals,
      rhythm: patientState?.currentRhythm,
      isInArrest: patientState?.isInArrest,
      appliedTreatmentIds,
    });
    toast(`Checking ${assessment.label.toLowerCase()} pulse…`, {
      description: 'Maintain fingertip contact while assessing rate, rhythm and character.',
      duration: 1800,
    });
    setTimeout(() => {
      setPulseCheckInProgress(false);
      setLastPulseAssessment(assessment);
      const pulseReassessedTreatmentIds = derivePulseReassessedTreatmentIds(
        assessment.site,
        appliedTreatmentIds,
      );
      if (pulseReassessedTreatmentIds.length > 0) {
        setReassessedTreatmentIds(previous => [
          ...new Set([...previous, ...pulseReassessedTreatmentIds]),
        ]);
      }
      if (assessment.palpable) {
        toast.success(`${assessment.label} pulse present`, { description: assessment.summary, duration: 7000 });
      } else if (assessment.site.startsWith('carotid')) {
        toast.error(`${assessment.label} pulse absent`, { description: assessment.summary, duration: 9000 });
      } else if (pulseReassessedTreatmentIds.length > 0) {
        toast.success('Tourniquet reassessment documented', {
          description: assessment.summary,
          duration: 9000,
        });
      } else {
        toast.warning(`${assessment.label} pulse absent`, { description: assessment.summary, duration: 9000 });
      }
    }, 2000);
  }, [appliedTreatmentIds, pulseCheckInProgress, currentVitals, patientState, currentCase]);
  const [cprCycleTimer, setCprCycleTimer] = useState(120); // 2 min countdown
  const [cprCycleNumber, setCprCycleNumber] = useState(0);
  const [cprRunning, setCprRunning] = useState(false);
  const [shockCount, setShockCount] = useState(0);
  const [lastAdrenalineTime, setLastAdrenalineTime] = useState<number | null>(null);
  const [adrenalineDoses, setAdrenalineDoses] = useState(0);
  const [amiodaroneDoses, setAmiodaroneDoses] = useState(0);
  const [arrestStartTime, setArrestStartTime] = useState<number | null>(null);
  const [arrestTimeline, setArrestTimeline] = useState<Array<{time: number; event: string; type: string}>>([]);
  const cprTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Ref always holds latest tracker — prevents stale closure when handlePerformAssessment is called rapidly
  const assessmentTrackerRef = useRef(assessmentTracker);

  // CPR Metronome — Web Audio API beep at 110 bpm (100-120 range)
  const metronomeRef = useRef<{
    audioCtx: AudioContext | null;
    intervalId: ReturnType<typeof setInterval> | null;
    isRunning: boolean;
  }>({ audioCtx: null, intervalId: null, isRunning: false });

  const startMetronome = useCallback(() => {
    if (metronomeRef.current.isRunning) return;
    
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    metronomeRef.current.audioCtx = audioCtx;
    metronomeRef.current.isRunning = true;

    const bpm = 110; // Target middle of 100-120 range
    const intervalMs = 60000 / bpm;

    const playBeep = () => {
      if (!metronomeRef.current.isRunning) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.value = 800; // Hz — audible tick
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.05);
    };

    playBeep(); // First beat immediately
    metronomeRef.current.intervalId = setInterval(playBeep, intervalMs);
  }, []);

  const stopMetronome = useCallback(() => {
    if (metronomeRef.current.intervalId) {
      clearInterval(metronomeRef.current.intervalId);
      metronomeRef.current.intervalId = null;
    }
    if (metronomeRef.current.audioCtx) {
      metronomeRef.current.audioCtx.close();
      metronomeRef.current.audioCtx = null;
    }
    metronomeRef.current.isRunning = false;
  }, []);

  // Timer
  const [caseStartTime, setCaseStartTime] = useState<number | null>(null);
  const [caseEndTime, setCaseEndTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Cinematic arrival chyron: when the student enters the scene (and the
  // CameraEntrance dollies them into the room), show a broadcast lower-third
  // announcing where they've arrived. Timed to the ~3.3s scene-entrance dolly,
  // then auto-dismisses; never blocks interaction (pointer-events none).
  const [arrivalChyronActive, setArrivalChyronActive] = useState(false);
  // Keep the lower-third tied to a live encounter, rather than to the
  // incidental object identity of `currentCase`. Case-management updates can
  // replace that object while the 3D room is streaming; previously that
  // cleanup cancelled the lower-third early, often before the first useful
  // patient frame had rendered on a cold load.
  const arrivalChyronEncounterRef = useRef<string | null>(null);
  const arrivalCaseId = currentCase?.id ?? null;
  // The arrival chyron fires for any case that describes a place — either an
  // authored scene-image caption OR a generated arrival layer (arrival
  // narrative / sensory cues). Previously this gated on the caption alone,
  // so the cases with a rich generated arrival layer but no authored caption
  // never got a broadcast lower-third at all.
  const hasSceneArrival = Boolean(
    currentCase?.sceneInfo?.sceneImageCaption?.trim() ||
      (arrivalCaseId ? getSceneIntroduction(arrivalCaseId)?.arrivalNarrative?.trim() : false),
  );
  const isArrivalLivePhase = phase === 'vitals' || phase === 'case';
  const [sceneReadyForCase, setSceneReadyForCase] = useState<string | null>(null);
  const handlePatientSceneReady = useCallback(() => {
    if (arrivalCaseId) setSceneReadyForCase(arrivalCaseId);
  }, [arrivalCaseId]);

  // Treatment effects
  const {
    currentVitals: animatedVitals,
    startGradualChange,
  } = useGradualVitalChanges();

  useEffect(() => {
    if (animatedVitals) {
      setCurrentVitals(animatedVitals);
    }
  }, [animatedVitals]);

  // Keep refs in step with state so timer callbacks read live values.
  useEffect(() => { currentVitalsRef.current = currentVitals; }, [currentVitals]);
  useEffect(() => { activeReactionRef.current = activeReaction; }, [activeReaction]);

  // Timer effect
  useEffect(() => {
    if (!caseStartTime || caseEndTime) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - caseStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [caseStartTime, caseEndTime]);

  // CPR Metronome — start/stop with CPR state
  useEffect(() => {
    if (cprRunning && arrestActive) {
      startMetronome();
      toast.info('CPR Metronome started', {
        description: '110 bpm — Follow the beep for optimal compression rate',
        icon: <Activity className="h-4 w-4" />,
        duration: 3000,
      });
    } else {
      stopMetronome();
    }
    return () => stopMetronome();
  }, [cprRunning, arrestActive, startMetronome, stopMetronome]);

  // Scene time warnings — paramedic standard is 15 minutes on scene
  useEffect(() => {
    if (!caseStartTime || caseEndTime || phase !== 'vitals') return;
    const minutes = elapsedSeconds / 60;

    if (minutes >= 10 && !sceneTimeWarnings.has('10min')) {
      toast.warning('Scene time: 10 minutes', {
        description: 'Consider your transport decision. Most patients should be en route to hospital by now.',
        duration: 8000,
      });
      setSceneTimeWarnings(prev => new Set(prev).add('10min'));
    }
    if (minutes >= 13 && !sceneTimeWarnings.has('13min')) {
      toast.error('Scene time extended: 13 minutes', {
        description: 'You have exceeded standard scene time. Justify any delay — is there a clinical reason to stay on scene?',
        duration: 10000,
      });
      setSceneTimeWarnings(prev => new Set(prev).add('13min'));
    }
    if (minutes >= 15 && !sceneTimeWarnings.has('15min')) {
      toast.error('⚠️ 15 minutes on scene — patient may be deteriorating', {
        description: 'Prolonged scene time is associated with worse patient outcomes. Consider immediate transport.',
        duration: 12000,
      });
      setSceneTimeWarnings(prev => new Set(prev).add('15min'));
    }
  }, [elapsedSeconds, caseStartTime, caseEndTime, phase, sceneTimeWarnings]);

  // Cardiac arrest activation — only when student confirms (not automatic)
  // The arrest workflow activates when arrestConfirmed is set to true (via the Confirm button)
  useEffect(() => {
    if (!patientState) return;
    if (arrestConfirmed && !arrestActive) {
      setArrestActive(true);
      setArrestStartTime(Date.now());
      setCprCycleNumber(0);
      setCprCycleTimer(120);
      setShockCount(0);
      setAdrenalineDoses(0);
      setAmiodaroneDoses(0);
      setLastAdrenalineTime(null);
      setArrestTimeline([{ time: Date.now(), event: 'Cardiac arrest confirmed by student', type: 'arrest-start' }]);
      toast.error('CARDIAC ARREST CONFIRMED', {
        description: 'Start high-quality CPR immediately. Apply defibrillator. Follow ALS algorithm.',
        duration: 10000,
      });
    } else if (!patientState.isInArrest && arrestActive) {
      // ROSC achieved
      setArrestActive(false);
      setArrestConfirmed(false);
      setCprRunning(false);
      setLastPulseAssessment(null);
      if (cprTimerRef.current) clearInterval(cprTimerRef.current);
      setArrestTimeline(prev => [...prev, { time: Date.now(), event: 'ROSC achieved', type: 'rosc' }]);
      // ROSC EtCO2 spike — a classic sign of return of spontaneous circulation:
      // pulmonary blood flow resumes abruptly, EtCO2 jumps to ~40+ then settles.
      setCurrentVitals(prev => prev ? { ...prev, etco2: 45 } : prev);
      toast.success('ROSC ACHIEVED', {
        description: 'Return of spontaneous circulation. Begin post-ROSC care: maintain SpO2 94-98%, avoid hyperventilation, 12-lead ECG, temperature management.',
        duration: 15000,
      });
    }
  }, [arrestConfirmed, patientState, arrestActive]);

  // CPR 2-minute cycle countdown
  useEffect(() => {
    if (!cprRunning) {
      if (cprTimerRef.current) clearInterval(cprTimerRef.current);
      return;
    }
    cprTimerRef.current = setInterval(() => {
      setCprCycleTimer(prev => {
        if (prev <= 1) {
          // Cycle complete — prompt rhythm check; CPR continues automatically
          setCprCycleNumber(n => n + 1);
          toast.warning('2 minutes — RHYTHM CHECK', {
            description: 'Pause CPR briefly (<10 sec) to check rhythm. Rotate compressor. Shock if indicated, then resume CPR immediately.',
            duration: 8000,
          });
          setArrestTimeline(prev => [...prev, { time: Date.now(), event: `CPR Cycle complete — rhythm check`, type: 'rhythm-check' }]);
          return 120; // Reset for next cycle; CPR timer keeps running
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (cprTimerRef.current) clearInterval(cprTimerRef.current); };
  }, [cprRunning]);

  // CPR-quality → EtCO2 bump. Effective compressions produce EtCO2 ~35-40
  // (cardiac output ~25% of normal → pulmonary blood flow → CO2 delivery to
  // lungs). When CPR stops, EtCO2 collapses back toward the arrest-stage
  // baseline (~15-20). On ROSC, EtCO2 spikes >40 then settles — a classic
  // ROSC sign. We lerp currentVitals.etco2 toward these targets every 2s so
  // the capnography waveform on the monitor responds to CPR quality in real
  // time. Scoped to arrest cases only in v1 (per realism plan workstream 2b).
  useEffect(() => {
    if (!arrestActive) return;
    const etco2Timer = setInterval(() => {
      setCurrentVitals(prev => {
        if (!prev) return prev;
        const target = cprRunning ? 35 : 18;
        const cur = prev.etco2 ?? 18;
        const next = cur + (target - cur) * 0.25; // ~half-way in ~4s
        return { ...prev, etco2: Math.round(next * 10) / 10 };
      });
    }, 2000);
    return () => clearInterval(etco2Timer);
  }, [arrestActive, cprRunning]);

  // Adrenaline timing check — warn when overdue
  useEffect(() => {
    if (!arrestActive || !cprRunning) return;
    const checkInterval = setInterval(() => {
      if (lastAdrenalineTime) {
        const secsSinceAdr = (Date.now() - lastAdrenalineTime) / 1000;
        if (secsSinceAdr >= 300 && secsSinceAdr < 305) {
          toast.error('ADRENALINE OVERDUE', {
            description: 'Adrenaline is due every 3-5 minutes. Consider giving 1mg IV/IO now.',
            duration: 8000,
          });
        }
      } else if (adrenalineDoses === 0 && shockCount >= 2) {
        // After 2nd shock in shockable rhythm, adrenaline is due
        toast.warning('Consider Adrenaline', {
          description: 'AHA 2025: Adrenaline 1mg IV after 2nd shock (shockable rhythm) or immediately (non-shockable).',
          duration: 6000,
        });
      }
    }, 5000);
    return () => clearInterval(checkInterval);
  }, [arrestActive, cprRunning, lastAdrenalineTime, adrenalineDoses, shockCount]);

  // Cleanup deterioration interval on unmount
  useEffect(() => {
    return () => {
      if (deteriorationIntervalRef.current) {
        clearInterval(deteriorationIntervalRef.current);
        deteriorationIntervalRef.current = null;
      }
      reactionTimersRef.current.forEach(id => window.clearTimeout(id));
      reactionTimersRef.current = [];
      if (cprTimerRef.current) {
        clearInterval(cprTimerRef.current);
        cprTimerRef.current = null;
      }
    };
  }, []);

  // ------------------------------------------------------------------------
  // Classroom-host: broadcast state mutations so every spectator sees live
  // what the driver is doing. These effects are gated by
  // `onClassroomStateChange` — in single-player mode they're no-ops.
  // ------------------------------------------------------------------------

  // Vitals — the most important live signal for spectators (they watch
  // the LIFEPAK change as the driver treats the patient).
  useEffect(() => {
    if (!onClassroomStateChange || !currentVitals) return;
    onClassroomStateChange({
      vitals: {
        bp: currentVitals.bp as string | undefined,
        pulse: currentVitals.pulse as number | undefined,
        respiration: currentVitals.respiration as number | undefined,
        spo2: currentVitals.spo2 as number | undefined,
        temperature: currentVitals.temperature as number | undefined,
        gcs: (currentVitals.gcs && typeof currentVitals.gcs === 'object' ? (currentVitals.gcs as { total?: number }).total : currentVitals.gcs) as number | undefined,
        bloodGlucose: currentVitals.bloodGlucose as number | undefined,
      },
    });
  }, [currentVitals, onClassroomStateChange]);

  // Applied treatments — ordered action log. Spectators see every
  // medication / intervention the driver applies.
  useEffect(() => {
    if (!onClassroomStateChange) return;
    onClassroomStateChange({
      appliedTreatments: appliedTreatments.map(t => ({
        id: t.id,
        name: (t.description || t.name || t.id) as string,
        detail: typeof t.description === 'string' && t.description !== t.name ? t.description : undefined,
        appliedAt: typeof t.appliedAt === 'string' ? t.appliedAt : new Date(t.appliedAt).toISOString(),
      })),
    });
  }, [appliedTreatments, onClassroomStateChange]);

  // Checklist completion — spectators see critical-action ticks in real time.
  useEffect(() => {
    if (!onClassroomStateChange || !session) return;
    onClassroomStateChange({ completedItems: session.completedItems });
  }, [session?.completedItems, onClassroomStateChange, session]);

  // Primary / secondary survey steps — spectators see the assessment pattern.
  useEffect(() => {
    if (!onClassroomStateChange || !assessmentTracker) return;
    onClassroomStateChange({
      assessmentPerformed: assessmentTracker.performed.map(p => p.stepId),
    });
  }, [assessmentTracker, onClassroomStateChange]);

  // Case start time + revealed monitor vitals.
  useEffect(() => {
    if (!onClassroomStateChange) return;
    const iso = caseStartTime ? new Date(caseStartTime).toISOString() : undefined;
    onClassroomStateChange({
      caseStartedAt: iso,
      monitorRevealedVitals: Array.from(monitorRevealedVitals),
    });
  }, [caseStartTime, monitorRevealedVitals, onClassroomStateChange]);

  // Rhythm + arrest flags — this is what makes the spectator LIFEPAK draw
  // the same waveform the instructor sees. Without it, the student's
  // monitor falls back to static case-inferred rhythm and won't update
  // through shock → ROSC / deterioration transitions.
  useEffect(() => {
    if (!onClassroomStateChange) return;
    onClassroomStateChange({
      currentRhythm: patientState?.currentRhythm,
      isInArrest: patientState?.isInArrest,
    });
  }, [patientState?.currentRhythm, patientState?.isInArrest, onClassroomStateChange]);

  // Arrest-run state — lets students see the CPR clock, shock count,
  // adrenaline doses their instructor is tracking.
  useEffect(() => {
    if (!onClassroomStateChange) return;
    onClassroomStateChange({
      arrestState: {
        cprRunning,
        shockCount,
        adrenalineDoses,
        amiodaroneDoses,
        cycleNumber: cprCycleNumber,
      },
    });
  }, [cprRunning, shockCount, adrenalineDoses, amiodaroneDoses, cprCycleNumber, onClassroomStateChange]);

  // Ventilator settings + BVM rate — pipe into the shared state so the
  // spectator's SpO2 tick uses the same FiO2/PEEP trajectory as the
  // driver. Previously these were driver-only, and student monitors
  // silently diverged from what the instructor was actually doing.
  useEffect(() => {
    if (!onClassroomStateChange) return;
    onClassroomStateChange({
      ventilatorSettings: ventilatorSettings ?? undefined,
      bvmVentilationRate: bvmVentilationRate ?? undefined,
    });
  }, [ventilatorSettings, bvmVentilationRate, onClassroomStateChange]);

  // Arrest timeline — broadcast the full ordered event log so spectators
  // see the CPR / shock / drug events in the same sequence the driver
  // logged them. Append-only on the driver side; the mirror just replaces.
  useEffect(() => {
    if (!onClassroomStateChange) return;
    if (arrestTimeline.length === 0) return;
    onClassroomStateChange({ arrestTimeline });
  }, [arrestTimeline, onClassroomStateChange]);

  // Transport decision — the priority / position / pre-alert /
  // destination / provisional-dx the driver picked. Spectators need this
  // so the transport-wizard UI shows the right state, and so the debrief
  // receipts (pre-alert given? destination chosen?) converge.
  useEffect(() => {
    if (!onClassroomStateChange) return;
    if (!transportDecisions) return;
    onClassroomStateChange({
      transportDecision: {
        priority: transportDecisions.priority,
        position: transportDecisions.position,
        preAlert: transportDecisions.preAlert,
        destination: transportDecisions.destination,
        provisionalDiagnosis: transportDecisions.provisionalDiagnosis,
      },
    });
  }, [transportDecisions, onClassroomStateChange]);

  // ------------------------------------------------------------------------
  // Classroom-spectator: mirror incoming state from the driver into local
  // state so the full UI renders the driver's live actions. This makes the
  // student's screen a live reflection of whatever the instructor's doing.
  // ------------------------------------------------------------------------
  useEffect(() => {
    if (!externalState) return;

    // Vitals — merge into current vitals so we preserve fields the driver
    // hasn't touched yet.
    if (externalState.vitals) {
      setCurrentVitals(prev => {
        const base = (prev || {}) as VitalSigns;
        const incoming = externalState.vitals as Record<string, unknown>;
        const merged: VitalSigns = { ...base };
        if (incoming.bp !== undefined) merged.bp = incoming.bp as string;
        if (incoming.pulse !== undefined) merged.pulse = incoming.pulse as number;
        if (incoming.respiration !== undefined) merged.respiration = incoming.respiration as number;
        if (incoming.spo2 !== undefined) merged.spo2 = incoming.spo2 as number;
        if (incoming.temperature !== undefined) merged.temperature = incoming.temperature as number;
        if (incoming.bloodGlucose !== undefined) merged.bloodGlucose = incoming.bloodGlucose as number;
        if (incoming.gcs !== undefined && typeof incoming.gcs === 'number') {
          merged.gcs = { total: incoming.gcs as number } as unknown as VitalSigns['gcs'];
        }
        return merged;
      });
    }

    // Applied treatments — full replace so the spectator's list stays in
    // lock-step with the driver's. Map the compact broadcast shape back
    // into the full AppliedTreatment shape the UI expects.
    if (externalState.appliedTreatments) {
      setAppliedTreatments(
        externalState.appliedTreatments.map(t => ({
          id: t.id,
          name: t.name,
          description: t.detail ?? t.name,
          appliedAt: t.appliedAt,
          effects: [],
        }) as unknown as AppliedTreatment),
      );
      setAppliedTreatmentIds([...new Set(externalState.appliedTreatments.map(t => t.id))]);
    }

    // Revealed monitor vitals — as the driver reveals them via ABCDE
    // assessment, spectators' monitors light up too.
    if (externalState.monitorRevealedVitals) {
      setMonitorRevealedVitals(new Set(externalState.monitorRevealedVitals));
    }

    // Case start time — keeps the ticking timer in sync.
    if (externalState.caseStartedAt && !caseStartTime) {
      setCaseStartTime(new Date(externalState.caseStartedAt).getTime());
    }

    // Session.completedItems — for the student-checklist ticks.
    if (externalState.completedItems && session) {
      setSession(prev => prev ? { ...prev, completedItems: externalState.completedItems ?? prev.completedItems } : prev);
    }

    // Rhythm + arrest flags — feed them into patientState so the LIFEPAK
    // monitor's `overrideRhythm` prop picks them up, the arrest UI reflects
    // the instructor's state, and heart-sound selection can follow rhythm.
    if (externalState.currentRhythm !== undefined || externalState.isInArrest !== undefined) {
      setPatientState(prev => {
        const base = prev ?? (currentCase ? createInitialPatientState(currentCase) : null);
        if (!base) return prev;
        const next = { ...base, vitals: { ...base.vitals } };
        if (externalState.currentRhythm && next.currentRhythm !== externalState.currentRhythm) {
          next.currentRhythm = externalState.currentRhythm;
        }
        if (externalState.isInArrest !== undefined && next.isInArrest !== externalState.isInArrest) {
          next.isInArrest = externalState.isInArrest;
        }
        return next;
      });
    }

    // Arrest-run UI state (CPR clock, shock count, drug counts).
    if (externalState.arrestState) {
      const a = externalState.arrestState;
      if (a.cprRunning !== undefined) setCprRunning(a.cprRunning);
      if (a.shockCount !== undefined) setShockCount(a.shockCount);
      if (a.adrenalineDoses !== undefined) setAdrenalineDoses(a.adrenalineDoses);
      if (a.amiodaroneDoses !== undefined) setAmiodaroneDoses(a.amiodaroneDoses);
      if (a.cycleNumber !== undefined) setCprCycleNumber(a.cycleNumber);
    }

    // Ventilator settings mirrored so the spectator's SpO2 tick uses the
    // same FiO2/PEEP trajectory the instructor set. Without this, the
    // spectator's SpO2 climbs slower than the instructor's.
    if (externalState.ventilatorSettings !== undefined) {
      const v = externalState.ventilatorSettings;
      // Narrow to our local VentilatorSettings shape (mode is a union).
      setVentilatorSettings(v ? {
        mode: v.mode as VentilatorSettings['mode'],
        tidalVolumeMl: v.tidalVolumeMl,
        respiratoryRate: v.respiratoryRate,
        fio2Percent: v.fio2Percent,
        peepCmH2O: v.peepCmH2O,
        ieRatio: v.ieRatio,
      } : null);
    }
    if (externalState.bvmVentilationRate !== undefined) {
      setBvmVentilationRate(externalState.bvmVentilationRate);
    }

    // Arrest timeline mirror — wholesale replace so driver's authoritative
    // sequence wins. Skip if the incoming list is shorter than ours (a
    // stale patch arriving out of order shouldn't erase newer events).
    if (externalState.arrestTimeline) {
      setArrestTimeline(prev => (
        externalState.arrestTimeline!.length >= prev.length
          ? externalState.arrestTimeline!
          : prev
      ));
    }

    // Transport decision mirror — the wizard shape on the driver side
    // uses required strings; the broadcast shape uses optional strings.
    // Fill missing fields with '' so the shape matches and the wizard
    // renders consistently on spectators.
    if (externalState.transportDecision) {
      const td = externalState.transportDecision;
      setTransportDecisions({
        priority: td.priority ?? '',
        position: td.position ?? '',
        preAlert: td.preAlert ?? false,
        destination: td.destination ?? '',
        provisionalDiagnosis: td.provisionalDiagnosis ?? '',
      });
    }

    // assessmentPerformed mirror — students see ABCDE ticks as the
    // instructor assesses. Previously broadcast but never mirrored.
    // We use the same pure performAssessmentStep the driver uses and
    // replay any missing steps so the tracker state converges.
    if (externalState.assessmentPerformed && assessmentTracker && currentCase) {
      const incoming = externalState.assessmentPerformed;
      const already = new Set<string>(assessmentTracker.performed.map(p => p.stepId));
      const missing = incoming.filter(id => !already.has(id));
      if (missing.length > 0) {
        let tracker = assessmentTracker;
        for (const stepId of missing) {
          const { tracker: next } = performAssessmentStep(tracker, stepId as AssessmentStepId, currentCase, caseStartTime ?? Date.now());
          tracker = next;
        }
        setAssessmentTracker(tracker);
      }
    }
  }, [externalState, caseStartTime, session, currentCase, assessmentTracker]);

  // ---------------- Instructor live override ------------------------------
  // When the instructor pushes a change via InstructorLiveControls, the
  // parent bumps `instructorOverride.nonce`. Merge the payload into local
  // patientState + currentVitals. The existing broadcast effects on
  // patientState.currentRhythm / isInArrest / currentVitals will then
  // propagate the change to every watching student.
  const lastOverrideNonceRef = useRef<number | null>(null);
  useEffect(() => {
    if (!instructorOverride) return;
    if (lastOverrideNonceRef.current === instructorOverride.nonce) return;
    lastOverrideNonceRef.current = instructorOverride.nonce;

    // Apply vital overrides directly to the animated display state and the
    // underlying patientState so the engine agrees with the monitor.
    if (instructorOverride.vitals) {
      setCurrentVitals(prev => {
        const base = (prev || {}) as VitalSigns;
        const v = instructorOverride.vitals ?? {};
        const merged: VitalSigns = { ...base };
        if (v.bp !== undefined) merged.bp = v.bp;
        if (v.pulse !== undefined) merged.pulse = v.pulse;
        if (v.respiration !== undefined) merged.respiration = v.respiration;
        if (v.spo2 !== undefined) merged.spo2 = v.spo2;
        if (v.temperature !== undefined) merged.temperature = v.temperature;
        if (v.bloodGlucose !== undefined) merged.bloodGlucose = v.bloodGlucose;
        if (v.gcs !== undefined) merged.gcs = { total: v.gcs } as unknown as VitalSigns['gcs'];
        return merged;
      });
    }

    if (instructorOverride.vitals || instructorOverride.currentRhythm !== undefined || instructorOverride.isInArrest !== undefined) {
      setPatientState(prev => {
        const base = prev ?? (currentCase ? createInitialPatientState(currentCase) : null);
        if (!base) return prev;
        const next = { ...base, vitals: { ...base.vitals } };
        if (instructorOverride.vitals) {
          Object.assign(next.vitals, instructorOverride.vitals);
        }
        if (instructorOverride.currentRhythm) next.currentRhythm = instructorOverride.currentRhythm;
        if (instructorOverride.isInArrest !== undefined) next.isInArrest = instructorOverride.isInArrest;
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorOverride?.nonce]);

  // ---------------- Classroom injects -------------------------------------
  // Watch sharedState.activeInjects for NEW entries and react: transient
  // toasts for most types, a sticky red banner for equipment failures, and
  // a silent monitor patch (plus subtle toast) for vitals/rhythm changes.
  // A ref of already-seen ids means we only ever fire an inject once, even
  // though the effect re-runs whenever the list grows.
  const seenInjectIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!activeInjects || activeInjects.length === 0) return;
    for (const inject of activeInjects) {
      if (seenInjectIdsRef.current.has(inject.id)) continue;
      seenInjectIdsRef.current.add(inject.id);

      switch (inject.type) {
        case 'bystander_update': {
          const p = inject.payload as BystanderUpdatePayload;
          toast.info(inject.title, { description: p.message, duration: 8000 });
          break;
        }
        case 'hospital_radio': {
          const p = inject.payload as HospitalRadioPayload;
          toast.info(`📻 ${p.hospitalName}`, { description: p.message, duration: 8000 });
          break;
        }
        case 'patient_refusal': {
          const p = inject.payload as PatientRefusalPayload;
          toast.warning(inject.title, { description: p.reason, duration: 8000 });
          break;
        }
        case 'environmental': {
          const p = inject.payload as EnvironmentalPayload;
          toast.info(p.event, { description: p.impact, duration: 8000 });
          break;
        }
        case 'new_finding': {
          const p = inject.payload as NewFindingPayload;
          toast.info(inject.title, { description: `${p.finding} (${p.region})`, duration: 10000 });
          break;
        }
        case 'equipment_failure': {
          // Sticky — sets a banner that persists until dismissed.
          setInjectBanner(inject);
          break;
        }
        case 'vitals_change': {
          const p = inject.payload as VitalsChangePayload;
          const v = p.vitals;
          setCurrentVitals(prev => {
            const base = (prev || {}) as VitalSigns;
            const merged: VitalSigns = { ...base };
            if (v.bp !== undefined) merged.bp = v.bp;
            if (v.pulse !== undefined) merged.pulse = v.pulse;
            if (v.respiration !== undefined) merged.respiration = v.respiration;
            if (v.spo2 !== undefined) merged.spo2 = v.spo2;
            if (v.temperature !== undefined) merged.temperature = v.temperature;
            if (v.bloodGlucose !== undefined) merged.bloodGlucose = v.bloodGlucose;
            if (v.gcs !== undefined) merged.gcs = { total: v.gcs } as unknown as VitalSigns['gcs'];
            return merged;
          });
          setPatientState(prev => {
            const b = prev ?? (currentCase ? createInitialPatientState(currentCase) : null);
            if (!b) return prev;
            return { ...b, vitals: { ...b.vitals, ...v } };
          });
          toast.warning(t('classroom.injects.vitalsChanged', 'Vitals changed'), { description: p.reason });
          break;
        }
        case 'rhythm_change': {
          const p = inject.payload as RhythmChangePayload;
          setPatientState(prev => {
            const b = prev ?? (currentCase ? createInitialPatientState(currentCase) : null);
            if (!b) return prev;
            const arrestish = ['Asystole', 'PEA', 'Ventricular Fibrillation'].includes(p.rhythm);
            return { ...b, currentRhythm: p.rhythm, isInArrest: arrestish ? true : b.isInArrest };
          });
          toast.warning(t('classroom.injects.rhythmChanged', 'Rhythm changed'), { description: p.reason });
          break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeInjects]);

  // Inactivity coaching — nudge students who are stuck
  useEffect(() => {
    if (!caseStartTime || caseEndTime || phase !== 'vitals') return;
    const checkInactivity = setInterval(() => {
      const inactiveSecs = (Date.now() - lastActivityRef.current) / 1000;
      const abcdePerformed = assessmentTracker?.performed?.length || 0;

      if (inactiveSecs >= 120 && abcdePerformed === 0) {
        setCurrentHint('Have you assessed the patient? Start with Scene Safety, then work through Airway, Breathing, Circulation, Disability, Exposure.');
        setHintVisible(true);
      } else if (inactiveSecs >= 120 && abcdePerformed < 4) {
        const missing = ['Scene', 'Airway', 'Breathing', 'Circulation', 'Disability', 'Exposure']
          .filter(s => !assessmentTracker?.performed?.some(p => p.stepId.toLowerCase().includes(s.toLowerCase().slice(0, 4))));
        if (missing.length > 0) {
          setCurrentHint(`Consider completing your primary survey. You haven't assessed: ${missing.join(', ')}.`);
          setHintVisible(true);
        }
      } else if (inactiveSecs >= 180 && appliedTreatments.length === 0 && abcdePerformed >= 4) {
        setCurrentHint('You\'ve completed your assessment. Based on your findings, does the patient need any treatment? Check the treatment panel.');
        setHintVisible(true);
      }
    }, 15000); // Check every 15 seconds
    return () => clearInterval(checkInactivity);
  }, [caseStartTime, caseEndTime, phase, assessmentTracker, appliedTreatments.length]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const tacticalTimelineItems = useMemo(() => {
    const items: Array<TacticalTimelineItem & { sort: number }> = [];

    assessmentTracker?.performed.slice(-3).forEach(performed => {
      const step = ALL_STEPS[performed.stepId];
      const critical = performed.findings.find(f => f.severity === 'critical');
      const abnormal = performed.findings.find(f => f.severity === 'abnormal');
      const finding = critical ?? abnormal ?? performed.findings[0];
      items.push({
        id: `assessment-${performed.stepId}-${performed.order}`,
        time: formatTime(performed.elapsedSeconds),
        title: step?.label || formatClinicalToken(performed.stepId),
        detail: finding ? `${finding.label}: ${finding.value}` : 'Assessment documented.',
        tone: critical ? 'alert' : 'assessment',
        sort: performed.elapsedSeconds,
      });
    });

    appliedTreatments.slice(-3).forEach((treatment, index) => {
      const appliedAt = new Date(treatment.appliedAt).getTime();
      const seconds = caseStartTime ? Math.max(0, Math.floor((appliedAt - caseStartTime) / 1000)) : elapsedSeconds;
      items.push({
        id: `treatment-${treatment.id}-${treatment.appliedAt}-${index}`,
        time: formatTime(seconds),
        title: treatment.name || formatClinicalToken(treatment.id),
        detail: treatment.description || 'Treatment applied to patient.',
        tone: 'treatment',
        sort: seconds + 0.05,
      });
    });

    arrestTimeline.slice(-2).forEach((event, index) => {
      const seconds = caseStartTime ? Math.max(0, Math.floor((event.time - caseStartTime) / 1000)) : elapsedSeconds;
      items.push({
        id: `arrest-${event.type}-${event.time}-${index}`,
        time: formatTime(seconds),
        title: formatClinicalToken(event.type),
        detail: event.event,
        tone: 'alert',
        sort: seconds + 0.1,
      });
    });

    (realismDirector?.treatmentLoopStates ?? [])
      .filter(loop => loop.state === 'applied')
      .slice(0, 2)
      .forEach((loop, index) => {
        items.push({
          id: `reassess-${loop.treatmentId}-${index}`,
          time: 'now',
          title: `${loop.categoryLabel} reassessment`,
          detail: loop.reassessmentPrompt,
          tone: 'reassess',
          sort: elapsedSeconds + 0.2 + index / 100,
        });
      });

    if (vitalsHistory.length >= 2) {
      const first = vitalsHistory[0];
      const latest = vitalsHistory[vitalsHistory.length - 1];
      const pulseDelta = (Number(latest.pulse) || 0) - (Number(first.pulse) || 0);
      const spo2Delta = (Number(latest.spo2) || 0) - (Number(first.spo2) || 0);
      if (pulseDelta !== 0 || spo2Delta !== 0) {
        const parts = [
          pulseDelta ? `HR ${pulseDelta > 0 ? '+' : ''}${pulseDelta}` : '',
          spo2Delta ? `SpO2 ${spo2Delta > 0 ? '+' : ''}${spo2Delta}` : '',
        ].filter(Boolean);
        items.push({
          id: 'vitals-trend',
          time: formatTime(elapsedSeconds),
          title: 'Vitals trend',
          detail: parts.join(' · '),
          tone: 'vitals',
          sort: elapsedSeconds + 0.15,
        });
      }
    }

    return items
      .sort((a, b) => a.sort - b.sort)
      .slice(-7)
      .map(({ sort: _sort, ...item }) => item);
  }, [appliedTreatments, arrestTimeline, assessmentTracker, caseStartTime, elapsedSeconds, realismDirector, vitalsHistory]);

  // Condition index derived from the loaded bundle (was a module-level const
  // in cases.ts — rebuilt here now that cases stream in lazily).
  const conditionsIndex = useMemo(() => {
    const index = new Map<string, string[]>();
    for (const c of allCases) {
      const diagnoses: string[] = [];
      if (c.expectedFindings?.mostLikelyDiagnosis) diagnoses.push(c.expectedFindings.mostLikelyDiagnosis);
      if (c.expectedFindings?.differentialDiagnoses) diagnoses.push(...c.expectedFindings.differentialDiagnoses);
      for (const dx of diagnoses) {
        const normalized = dx.trim();
        if (!normalized) continue;
        const existing = index.get(normalized) || [];
        if (!existing.includes(c.id)) existing.push(c.id);
        index.set(normalized, existing);
      }
    }
    return index;
  }, [allCases]);

  const allConditionNames = useMemo(
    () => [...conditionsIndex.keys()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
    [conditionsIndex],
  );

  const getCasesByCondition = useCallback((
    condition: string,
    yearLevel?: string,
    options?: { cohortMode?: CohortMode },
  ): CaseScenario[] => {
    const caseIds = conditionsIndex.get(condition) || [];
    let cases = caseIds.map(id => allCases.find(c => c.id === id)).filter(Boolean) as CaseScenario[];
    if (yearLevel) {
      if (isStudentYear(yearLevel)) {
        cases = cases.filter(c => isCaseAvailableForCohort(c.yearLevels, yearLevel, options?.cohortMode ?? 'exact'));
      } else {
        cases = [];
      }
    }
    return cases;
  }, [allCases, conditionsIndex]);

  const getRandomCase = useCallback((filters?: { yearLevel?: string; category?: string; complexity?: string; subcategory?: string; cohortMode?: CohortMode }) => {
    let cases = allCases;
    if (filters?.yearLevel && isStudentYear(filters.yearLevel)) {
      cases = allCases.filter(c => isCaseAvailableForCohort(c.yearLevels, filters.yearLevel as StudentYear, filters.cohortMode ?? 'exact'));
    }
    if (filters?.category) {
      const matches = cases.filter(c => c.category === filters.category);
      if (matches.length === 0) return null as unknown as CaseScenario;
      cases = matches;
    }
    if (filters?.complexity) {
      const matches = cases.filter(c => c.complexity === filters.complexity);
      if (matches.length > 0) cases = matches;
    }
    if (filters?.subcategory) {
      const sub = filters.subcategory;
      const matches = cases.filter(c =>
        c.title.toLowerCase().includes(sub.toLowerCase()) || c.id.includes(sub) || c.category === sub);
      if (matches.length > 0) cases = matches;
    }
    if (cases.length === 0) return null as unknown as CaseScenario;
    return cases[Math.floor(Math.random() * cases.length)];
  }, [allCases]);

  // Filtered conditions list for search dropdown
  // Prioritise conditions that actually have cases for the selected year —
  // otherwise 1st-year students see a mostly-disabled alphabetical list.
  const filteredConditions = useMemo(() => {
    const q = conditionSearch.trim().toLowerCase();
    const pool = q
      ? allConditionNames.filter(c => c.toLowerCase().includes(q))
      : allConditionNames;
    const withCases = pool.filter(c => getCasesByCondition(c, selectedYear, { cohortMode: 'progressive' }).length > 0);
    const withoutCases = pool.filter(c => getCasesByCondition(c, selectedYear, { cohortMode: 'progressive' }).length === 0);
    // The list scrolls (max-h-52 container), so don't cap the browse: a
    // `.slice(0, 30)` over the ALPHABETICAL condition list meant only "A…"
    // conditions ever appeared when no search was typed. When browsing (no
    // query) show every playable condition; when searching, keep a generous cap.
    return q ? [...withCases, ...withoutCases].slice(0, 50) : withCases;
  }, [conditionSearch, selectedYear, allConditionNames, getCasesByCondition]);

  const availableCategories = useMemo(() => (
    caseCategories.filter(cat =>
      allCases.some(c => c.category === cat.value && isCaseAvailableForCohort(c.yearLevels, selectedYear))
    )
  ), [selectedYear, allCases]);

  useEffect(() => {
    if (selectedCategory === 'all') return;
    if (!casesLoaded) return;
    if (!availableCategories.some(cat => cat.value === selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [availableCategories, selectedCategory, casesLoaded]);

  const baseMissionCases = useMemo(() => (
    allCases.filter(c => {
      if (!isCaseAvailableForCohort(c.yearLevels, selectedYear)) return false;
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      return true;
    })
  ), [selectedYear, selectedCategory, allCases]);

  const strictMissionCases = useMemo(() => {
    return baseMissionCases.filter(c => (
      matchesMissionKeywords(c, missionSkillKeywords[skillFocus]) &&
      matchesMissionKeywords(c, missionEquipmentKeywords[equipmentFocus])
    ));
  }, [baseMissionCases, skillFocus, equipmentFocus]);

  const missionCandidateCases = strictMissionCases.length > 0 ? strictMissionCases : baseMissionCases;

  useEffect(() => {
    setMissionPreviewCase(pickRandomFromPool(missionCandidateCases, {
      excludeId: lastLaunchedCaseIdRef.current,
    }));
  }, [missionCandidateCases, previewEpoch]);
  const missionCategoryLabel = selectedCategory === 'all'
    ? 'all presentations'
    : caseCategories.find(cat => cat.value === selectedCategory)?.label.toLowerCase() ?? selectedCategory;
  const cohortScopeLabel = getCohortScopeLabel(selectedYear);
  const missionDurationLabel = timebox === 'untimed' ? 'Untimed practice' : `${timebox} min target`;
  const missionDurationShortLabel = timebox === 'untimed' ? 'Untimed' : `${timebox} min`;
  const missionFilterFallback = strictMissionCases.length === 0 && baseMissionCases.length > 0 && (skillFocus !== 'any' || equipmentFocus !== 'any');
  const missionCompetencies = missionPreviewCase ? getCaseCompetencyTags(missionPreviewCase, skillFocus) : [];
  const missionEquipment = missionPreviewCase ? getCaseEquipmentTags(missionPreviewCase, equipmentFocus) : [];

  /** Stop / remove a treatment the student started. Masks come off, lines
   *  come out, devices detach — the body visual state follows because it is
   *  derived from appliedTreatmentIds. */
  const discontinueTreatment = useCallback((treatmentId: string) => {
    if (readOnly) {
      toast.info('You are watching — the driver is treating this case.', { duration: 1800 });
      return;
    }
    setAppliedTreatments(prev => prev.filter(t => t.id !== treatmentId));
    setAppliedTreatmentIds(prev => prev.filter(id => id !== treatmentId));
    setReassessedTreatmentIds(prev => prev.filter(id => id !== treatmentId));
    toast.success('Treatment discontinued', {
      description: 'The device has been removed from the patient.',
      duration: 2200,
    });
  }, [readOnly]);

  // Shared case initialization helper
  const initializeCase = useCallback((newCase: CaseScenario, conditionMode: boolean, condition?: string) => {
    stopNarration();
    setCurrentCase(newCase);
    const recommendedBag = recommendedManagementTabForCase(newCase);
    setActiveManagementTab(recommendedBag);
    setOpenManagementBag(recommendedBag);
    setCareRailMode('assess');
    setMedSearch('');
    const initialVitals = buildInitialVitalsFromCase(newCase);
    setCurrentVitals(initialVitals);
    setVitalsHistory([initialVitals]);
    setAppliedTreatments([]);
    setAppliedTreatmentIds([]);
    setReassessedTreatmentIds([]);
    medicationConfirmedRef.current = new Set();
    treatmentChallengeConfirmedRef.current = new Set();
    setPendingTreatmentChallenge(null);
    setCaseStartTime(null);
    setCaseEndTime(null);
    setElapsedSeconds(0);
    setSceneTimeWarnings(new Set());
    setSceneSurvey(null);
    setHintVisible(false);
    setCurrentHint('');
    lastActivityRef.current = Date.now();
    // Reset all cardiac arrest state for fresh case
    setArrestConfirmed(false);
    setArrestActive(false);
    setPulseCheckInProgress(false);
    setLastPulseAssessment(null);
    setCprCycleTimer(120);
    setCprCycleNumber(0);
    setCprRunning(false);
    setShockCount(0);
    setLastAdrenalineTime(null);
    setAdrenalineDoses(0);
    setAmiodaroneDoses(0);
    setArrestStartTime(null);
    setArrestTimeline([]);

    // Clear any adverse reaction carried over from a previous case
    reactionTimersRef.current.forEach(id => window.clearTimeout(id));
    reactionTimersRef.current = [];
    activeReactionRef.current = null;
    setActiveReaction(null);
    adverseEventsRef.current = [];

    const initialPatientState = createInitialPatientState(newCase);
    setPatientState(initialPatientState);

    const initialTracker = createAssessmentTracker(newCase, selectedYear);
    setAssessmentTracker(initialTracker);
    setActiveFindings(null);

    const newSession: CaseSession = {
      id: Date.now().toString(),
      caseId: newCase.id,
      studentYear: selectedYear,
      generatedAt: new Date().toISOString(),
      completedItems: [],
      notes: '',
      score: 0,
      totalPossible: (newCase.studentChecklist || [])
        .filter(item => item.yearLevel?.includes(selectedYear))
        .reduce((sum, item) => sum + (item.points || 0), 0),
      isConditionSelected: conditionMode,
      selectedCondition: condition,
    };
    setSession(newSession);
    setPhase('prebriefing');
  }, [selectedYear, setPhase, stopNarration]);

  // Classroom-host: when a preloaded case is passed in (e.g. the instructor
  // just picked a case in the classroom lobby), bootstrap it directly and
  // skip the select/prebriefing phases so the instructor lands in the live
  // case view with LIFEPAK, 3D body, and all management functions.
  const preloadInitializedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!preloadedCase) return;
    if (preloadInitializedRef.current === preloadedCase.id) return;
    preloadInitializedRef.current = preloadedCase.id;
    initializeCase(preloadedCase, false);
  }, [preloadedCase, initializeCase]);

  // Once the case is bootstrapped (phase landed on 'prebriefing' from
  // initializeCase), advance automatically into the live case phase so
  // the instructor's view is the full running-case UI with LIFEPAK,
  // 3D body, ABCDE, and treatments. The live phase is named 'vitals'
  // in the student flow (phase 'case' is a separate case-details
  // reference tab accessible during the live case). Also start the
  // case timer so the case clock begins immediately. Separate effect
  // from the initialize call above so the React cleanup/re-run dance
  // doesn't cancel this state transition.
  useEffect(() => {
    if (!preloadedCase) return;
    if (!currentCase || currentCase.id !== preloadedCase.id) return;
    if (phase === 'prebriefing') {
      if (caseStartTime == null) setCaseStartTime(Date.now());
      setPhase('vitals');
    }
  }, [preloadedCase, currentCase, phase, setPhase, caseStartTime]);

  // Auto-play the dispatch radio call when a new case lands in Pre-Brief.
  // This mirrors the real workflow: the radio crackles to life on the way
  // to scene, the crew listens, then decides their approach — they don't
  // hear dispatch info for the first time after stepping out of the truck.
  // Keyed on the case ID so each new case fires exactly once (re-entering
  // Pre-Brief for the same case won't re-trigger it).
  const dispatchPlayedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentCase) return;
    if (phase !== 'prebriefing') return;
    if (dispatchPlayedForRef.current === currentCase.id) return;
    dispatchPlayedForRef.current = currentCase.id;
    const t = setTimeout(() => {
      speakNarration(buildDispatchNarration(currentCase), { role: 'dispatcher' });
    }, 600);
    return () => clearTimeout(t);
    // speakNarration intentionally omitted — its identity is stable and
    // including it would re-fire when the hook re-rendered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCase, phase]);

  // Generate case — standard mode
  const generateCase = useCallback(async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      // The launch preview is a clinical handover, not a generic example. Launch
      // the exact case the student has just reviewed so demographics, dispatch
      // details, scene and expected presentation remain continuous.
      const newCase = missionPreviewCase;

      if (!newCase) {
        setIsGenerating(false);
        toast.error('No cases available', {
          description: `No ${selectedCategory !== 'all' ? selectedCategory : ''} cases are available for ${selectedYear} level. Try a different category.`,
        });
        return;
      }

      lastLaunchedCaseIdRef.current = newCase.id;
      initializeCase(newCase, false);
      setIsGenerating(false);
      toast.success(`Smart case generated: ${getStudentCaseTitle(newCase)}`, {
        description: `Matched ${cohortScopeLabel}, ${missionCategoryLabel}, ${missionDurationLabel.toLowerCase()}.`,
      });
    } catch (err) {
      console.error('Case generation error:', err);
      setIsGenerating(false);
      toast.error('Failed to generate case', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred. Try a different category.',
      });
    }
  }, [missionPreviewCase, selectedYear, selectedCategory, cohortScopeLabel, missionCategoryLabel, missionDurationLabel, initializeCase]);

  // Generate case — random by category mode
  const generateCaseByCategory = useCallback(async (category: string) => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      const newCase = getRandomCase({ yearLevel: selectedYear, category, cohortMode: 'progressive' });
      if (!newCase) {
        setIsGenerating(false);
        toast.error('No cases available', {
          description: `No ${category} cases are available for ${selectedYear} level.`,
        });
        return;
      }

      lastLaunchedCaseIdRef.current = newCase.id;
      setSelectedCategory(category);
      initializeCase(newCase, false);
      setIsGenerating(false);
      toast.success(`Random ${category} case: ${getStudentCaseTitle(newCase)}`);
    } catch (err) {
      console.error('Case generation error:', err);
      setIsGenerating(false);
      toast.error('Failed to generate case');
    }
  }, [selectedYear, initializeCase, getRandomCase]);

  // Generate case — practice specific condition mode
  const generateCaseByCondition = useCallback(async (condition: string) => {
    setIsGenerating(true);
    setSelectedCondition(condition);
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      const matchingCases = getCasesByCondition(condition, selectedYear, { cohortMode: 'progressive' });
      if (matchingCases.length === 0) {
        setIsGenerating(false);
        toast.error('No cases available', {
          description: `No cases featuring "${condition}" are available for ${selectedYear} level.`,
        });
        return;
      }

      const newCase = matchingCases[Math.floor(Math.random() * matchingCases.length)];
      initializeCase(newCase, true, condition);
      setIsGenerating(false);
      toast.success(`Condition practice: ${getStudentCaseTitle(newCase)}`);
    } catch (err) {
      console.error('Case generation error:', err);
      setIsGenerating(false);
      toast.error('Failed to generate case');
    }
  }, [selectedYear, initializeCase, getCasesByCondition]);

  // Start case (from pre-briefing) — routes to Scene Survey first.
  // The timer doesn't start yet; scene survey is "pre-arrival" and
  // shouldn't eat into the student's case time.
  const startCase = useCallback(() => {
    if (readOnly) return;
    stopNarration();
    toast.dismiss();
    setPhase('scene-survey');
  }, [readOnly, setPhase, stopNarration]);

  // Enter the scene (from scene survey) — this is where the real case
  // clock starts and deterioration begins ticking. The dispatch radio
  // call no longer plays here — it's been moved upstream to fire once
  // when the case first lands in Pre-Brief (see the useEffect below)
  // so the workflow matches reality: dispatch arrives → review → scene
  // survey → on-scene. Called by SceneSurveyPanel.onComplete.
  const enterScene = useCallback(() => {
    if (readOnly) return;
    stopNarration();
    const startedAt = Date.now();
    setCaseStartTime(startedAt);
    lastActivityRef.current = startedAt;

    // The scene survey happens before the live-case clock starts, so routing
    // it through handlePerformAssessment would silently discard it while
    // caseStartTime is still null. Credit the completed survey at time zero.
    if (assessmentTrackerRef.current && currentCase) {
      const { tracker: updatedTracker } = performAssessmentStep(
        assessmentTrackerRef.current,
        'scene-safety',
        currentCase,
        startedAt,
      );
      assessmentTrackerRef.current = updatedTracker;
      setAssessmentTracker(updatedTracker);
    }

    setPhase('vitals');
    toast.success('Case started — begin your assessment', { duration: 3000 });
  }, [currentCase, readOnly, setPhase, stopNarration]);

  // Cinematic arrival chyron — fires once when the student enters the scene,
  // holds through the doorway dolly (~3.3s), then slides back out. Only for
  // scene-visualised cases (a plain clinic bay has no "arrival"). Treat both
  // live subviews as one encounter so opening Case Details cannot abruptly
  // dismiss the arrival context.
  useEffect(() => {
    if (!arrivalCaseId) {
      arrivalChyronEncounterRef.current = null;
      setArrivalChyronActive(false);
      return;
    }
    if (!isArrivalLivePhase) return;
    if (!hasSceneArrival) return;
    // The room and GLB stream independently from the encounter shell. Start
    // the arrival beat only once the patient has actually painted, so a slow
    // device never spends the full animation on an empty canvas.
    if (sceneReadyForCase !== arrivalCaseId) return;
    if (arrivalChyronEncounterRef.current === arrivalCaseId) return;
    arrivalChyronEncounterRef.current = arrivalCaseId;

    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    const showTimer = setTimeout(() => {
      setArrivalChyronActive(true);
      // The scene and its authored dressing stream independently of the UI
      // phase. On a cold load the old 3.4 s hold could finish before the
      // first useful 3D frame appeared, so students never saw the arrival
      // context at all. Keep the lower-third through the entrance dolly and
      // a short settled beat; it still clears itself and remains non-modal.
      hideTimer = setTimeout(() => setArrivalChyronActive(false), 5000);
    }, 260);
    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
      setArrivalChyronActive(false);
    };
  }, [isArrivalLivePhase, arrivalCaseId, hasSceneArrival, sceneReadyForCase]);

  // The live encounter owns this timer, not the scene-survey button. Loaded
  // classroom/dev encounters enter the same live phase without clicking that
  // button and previously never deteriorated at all.
  const encounterRunning = caseStartTime != null && (phase === 'vitals' || phase === 'case');
  useEffect(() => {
    if (!encounterRunning || readOnly || !currentCase) return;
    const interval = setInterval(() => {
      setPatientState(prev => {
        if (!prev || !currentCase) return prev;
        if (activeReactionRef.current) return prev; // reaction owns vitals — pause deterioration
        const newState = applyDeterioration(prev, currentCase, 30);
        // Treatment-aware deterioration. applyDeterioration models the UNTREATED
        // decline and can drag a vital BELOW what active treatment is currently
        // holding it at. That fight — treatment pushes SpO2 up, the next
        // deterioration tick slams it back down, treatment pushes up again — was
        // the SpO2/BP "sawtooth" that read as a buggy, flickering monitor. While
        // the sustaining treatment for a vital is running, hold the line (don't
        // let deterioration worsen it). Arrest still progresses (SpO2 must fall).
        const tx = Object.keys(prev.treatmentCounts || {}).join(' ').toLowerCase();
        if (!prev.isInArrest) {
          if (/oxygen|rebreather|nasal|_mask|cpap|bipap|bvm|ventilat|nebuli[sz]|salbutamol|ipratropium|high.?flow/.test(tx)) {
            newState.vitals.spo2 = Math.max(newState.vitals.spo2, prev.vitals.spo2);
          }
          if (/fluid|saline|hartmann|crystalloid|bolus|blood|plasma/.test(tx)) {
            const sysOf = (b: string) => parseInt(String(b).split('/')[0], 10) || 0;
            if (sysOf(newState.vitals.bp) < sysOf(prev.vitals.bp)) newState.vitals.bp = prev.vitals.bp;
          }
        }
        if (/glucose|dextrose|glucagon/.test(tx) && prev.vitals.bloodGlucose != null && newState.vitals.bloodGlucose != null) {
          newState.vitals.bloodGlucose = Math.max(newState.vitals.bloodGlucose, prev.vitals.bloodGlucose);
        }
        if (JSON.stringify(newState.vitals) !== JSON.stringify(prev.vitals)) {
          setCurrentVitals(ensureCompleteVitals(newState.vitals));
        }
        return newState;
      });
    }, 30000); // Check every 30 seconds
    deteriorationIntervalRef.current = interval;
    return () => {
      clearInterval(interval);
      if (deteriorationIntervalRef.current === interval) deteriorationIntervalRef.current = null;
    };
  }, [currentCase, encounterRunning, readOnly]);

  // LUCAS device nudge — if CPR has been running for ≥4 minutes and no
  // mechanical CPR device has been applied yet, offer one via a single,
  // dismissible toast. Deliberately low-friction: no blocking dialog,
  // no repeat nagging — the student can ignore it and keep compressing.
  useEffect(() => {
    if (!cprRunning || lucasPromptShown) return;
    if (appliedTreatmentIds.includes('lucas_device')) return;
    const id = window.setTimeout(() => {
      setLucasPromptShown(true);
      toast('Consider LUCAS mechanical CPR?', {
        description: 'CPR has been running for 4 minutes. A LUCAS device can maintain high-quality compressions and free a team member.',
        duration: 10000,
        action: {
          label: 'Apply LUCAS',
          onClick: () => {
            const lucas = TREATMENTS.find(t => t.id === 'lucas_device');
            if (lucas) applyTreatment(lucas);
          },
        },
      });
    }, 4 * 60 * 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cprRunning, lucasPromptShown, appliedTreatmentIds]);

  // Continuous-effect tick — simulates ongoing physiology from active
  // treatments so vitals keep responding between one-shot `applyTreatment`
  // calls. Previously the engine applied a single vital bump on treatment
  // apply and then nothing: if the student hit BVM once on an apnoeic
  // patient, SpO2 never climbed over time, and after ROSC the RR / SpO2
  // would sit frozen. This closes that loop every 5 s.
  //
  // Rules (minimal and explainable):
  //  - If oxygen (NRB / nasal / BVM / ventilator) was applied AND SpO2 < 96
  //    → SpO2 climbs toward 96-98 by 2/tick (slower over 92).
  //  - If CPR is running AND patient is in arrest → maintain pseudo-pulse
  //    between 50-65 (compression-generated perfusion). Engine's ROSC path
  //    remains the ONLY way to clear `isInArrest`.
  //  - If RR is 0 (apnoeic) AND BVM/vent is active AND ventilationRate is
  //    set → show that assisted rate on the monitor so the student can see
  //    they're ventilating at X/min rather than a flat 0.
  //  - Otherwise no-op. Deterioration timer (30 s) continues to run and
  //    wins if both fire — so a student walking away still sees decline.
  useEffect(() => {
    if (phase !== 'vitals' || readOnly) return;
    const id = window.setInterval(() => {
      setPatientState(prev => {
        if (!prev) return prev;
        if (activeReactionRef.current) return prev; // adverse reaction owns the monitor
        const v = { ...prev.vitals };
        let changed = false;
        let roscTriggered = false;

        // Match the ACTUAL oxygen/ventilation treatment IDs defined in
        // enhancedTreatmentEffects.ts — earlier revisions of this block
        // checked `oxygen_nrb` / `oxygen_15l` which don't exist, so the
        // SpO2 tick never fired when a student applied NRB or CPAP. That
        // was the "patient at 89% stays 89% no matter what I do" bug.
        const hasO2 =
          appliedTreatmentIds.includes('oxygen_nonrebreather') ||
          appliedTreatmentIds.includes('oxygen_mask') ||
          appliedTreatmentIds.includes('oxygen_nasal') ||
          appliedTreatmentIds.includes('oxygen_venturi') ||
          appliedTreatmentIds.includes('cpap_niv') ||
          appliedTreatmentIds.includes('bvm_ventilation') ||
          appliedTreatmentIds.includes('mechanical_ventilation') ||
          (appliedTreatmentIds.includes('ventilator_setup') && !!ventilatorSettings);
        // CPAP/NIV physiologically reverses hypoxia faster than passive
        // O2 because it recruits alveoli — bump the per-tick step.
        const hasCpap = appliedTreatmentIds.includes('cpap_niv');
        const hasControlledVenturi = appliedTreatmentIds.includes('oxygen_venturi');

        // SpO2 recovery toward target while O2 therapy is active. CPAP
        // climbs faster than simple O2 because it recruits collapsed
        // alveoli (cardiogenic pulm oedema, severe asthma, etc.).
        // Mechanical ventilation scales further with FiO2 + PEEP: 100%
        // FiO2 + 10 PEEP is a very different patient from 40% + 5.
        const oxygenTarget = hasControlledVenturi ? 92 : 98;
        if (hasO2 && (v.spo2 ?? 0) < oxygenTarget) {
          let step = (v.spo2 ?? 70) < 92 ? 3 : 2;
          if (hasCpap) step += 2;
          // Mechanical ventilator bonus — scales with FiO2 and PEEP.
          if (ventilatorSettings) {
            const fio2Bonus = Math.max(0, (ventilatorSettings.fio2Percent - 40) / 30); // 0 at 40%, 2 at 100%
            const peepBonus = Math.max(0, (ventilatorSettings.peepCmH2O - 5) / 5);     // 0 at 5, 3 at 20
            step += Math.round(fio2Bonus + peepBonus);
          }
          v.spo2 = Math.min(oxygenTarget, (v.spo2 ?? 70) + step);
          changed = true;
        }

        // Ventilator side-effects — high PEEP + high tidal volume can
        // drop BP via increased intrathoracic pressure (preload
        // reduction). Start to manifest > 10 min of vent if settings
        // are aggressive.
        if (ventilatorSettings && ventilatorSettings.peepCmH2O >= 12) {
          const bpStr = String(v.bp ?? '120/80');
          const [sys, dia] = bpStr.split('/').map(x => parseInt(x, 10));
          if (!isNaN(sys) && sys > 90) {
            const newSys = Math.max(85, sys - 2);
            v.bp = `${newSys}/${Math.max(55, (dia || 80) - 1)}`;
            changed = true;
          }
        }

        // CPR compression-generated pulse while CPR is running in arrest.
        if (cprRunning && prev.isInArrest) {
          if ((v.pulse ?? 0) < 50) { v.pulse = 55; changed = true; }
          // BP during good CPR typically peaks ~60-70 systolic.
          // Force override any existing BP to realistic CPR values.
          const bpStr = String(v.bp ?? '120/80');
          const [sys] = bpStr.split('/').map(x => parseInt(x, 10));
          if (!sys || sys > 75) {
            v.bp = '60/40';
            changed = true;
          }
        }

        // Assisted ventilation rate — surface the student-set rate on the
        // monitor while ventilation is active. A patient on a mechanical
        // ventilator (paralysed / heavily sedated) has an RR dictated by
        // the ventilator — the monitor should read that rate, not the
        // patient's own drive. For BVM, the ventilator-provided rate is
        // what the monitor sees since the provider is setting the cadence.
        // Previously this gate was `v.respiration === 0`, so once the
        // patient regained any spontaneous drive post-ROSC the monitor
        // showed the intrinsic rate and the student had no way to see
        // whether their set ventilator rate had been accepted.
        const onVentilator = appliedTreatmentIds.includes('mechanical_ventilation') && !!ventilatorSettings;
        const onBvm = appliedTreatmentIds.includes('bvm_ventilation') && !!bvmVentilationRate;
        const ventRate =
          (onVentilator ? ventilatorSettings!.respiratoryRate : null) ??
          (onBvm ? bvmVentilationRate : null);
        if (ventRate && ventRate > 0 && (onVentilator || onBvm)) {
          if (v.respiration !== ventRate) {
            v.respiration = ventRate;
            changed = true;
          }
        }

        // EtCO2 physiology driven by minute ventilation. Target EtCO2
        // range is 35–45 mmHg. Minute volume = TV × RR. Inadequate MV
        // → CO2 climbs (hypercapnia); over-ventilation → CO2 falls
        // (hypocapnia — reduces cerebral perfusion, bad post-arrest).
        // Previously EtCO2 was set once by the treatment's static
        // effect and never moved, so students saw it stuck low forever
        // despite normalised ventilation.
        const weightKg = currentCase?.patientInfo?.weight ?? 70;
        const targetMv = targetMinuteVentilationLitres(weightKg);
        let providedMv: number | null = null;
        if (onVentilator) {
          providedMv = (ventilatorSettings!.tidalVolumeMl / 1000) * ventilatorSettings!.respiratoryRate;
        } else if (onBvm) {
          // A visible chest-rise breath scales with the patient. A fixed
          // 250 mL "paediatric" squeeze is dangerously excessive for a
          // newborn and made the simulated EtCO₂ response meaningless.
          const assumedTvLitres = estimatedBvmTidalVolumeLitres(weightKg);
          providedMv = assumedTvLitres * bvmVentilationRate!;
        }
        if (providedMv != null) {
          const currentEtco2 = v.etco2 ?? 35;
          // Ratio of delivered MV to target MV predicts EtCO2 steady state.
          // Over-ventilated patient drifts EtCO2 toward 25; under-ventilated
          // drifts toward 55. Tick moves EtCO2 one step per second toward
          // the predicted steady state.
          const targetEtco2 = projectedEtco2Target(providedMv, targetMv);
          if (Math.abs(currentEtco2 - targetEtco2) > 0.5) {
            const step = currentEtco2 < targetEtco2 ? 1 : -1;
            v.etco2 = Math.max(15, Math.min(80, currentEtco2 + step));
            changed = true;
          }
        }

        // ---- CONTINUOUS ROSC EVALUATOR (non-shockable rhythms) ----
        // Real ACLS doesn't require the student to press "apply adrenaline"
        // for ROSC to happen — if they're running high-quality CPR,
        // ventilating properly, AND the pharmacologic picture the
        // guidelines actually call for, the rhythm can convert at any
        // time. Previously ROSC was locked to the moment the engine saw
        // applyTreatment('adrenaline_1mg'), which felt unresponsive.
        //
        // Two parallel pathways based on core temperature, matching
        // ERC 2021 / JRCALC / AHA hypothermic-arrest guidance:
        //
        //  • Normothermic (temp ≥ 30°C) — requires at least one
        //    adrenaline dose. Standard ACLS.
        //
        //  • Severe hypothermia (temp < 30°C) — adrenaline is
        //    CONTRAINDICATED (impaired metabolism, toxic accumulation
        //    on rewarming). Requires active rewarming intervention
        //    instead. Drugs would never be given here, so we must
        //    recognise the hypothermic resuscitation as complete when
        //    rewarming + CPR + ventilation are in flight.
        //
        // Per-tick probability is modest (~6% every 5s = ~50% by 1 min,
        // ~90% by 3 min in normothermic; slower in hypothermic because
        // rewarming takes longer to physiologically reverse the arrest).
        const isNonShockable =
          prev.currentRhythm === 'Asystole' || prev.currentRhythm === 'PEA';
        const arrestDurationMs = caseStartTime ? Date.now() - caseStartTime : 0;
        const coreTemp = prev.vitals.temperature ?? 37;
        const isSevereHypothermia = coreTemp < 30;
        const hasRewarming = appliedTreatmentIds.some(id =>
          /warm|blanket|hypotherm/i.test(id),
        );

        // Normothermic ACLS — needs adrenaline.
        const canRoscNormothermic =
          !isSevereHypothermia &&
          adrenalineDoses >= 1;

        // Hypothermic ACLS — needs active rewarming, NOT adrenaline.
        // Guideline basis: ERC 2021 §5.3 (Hypothermic cardiac arrest) —
        // withhold IV drugs <30°C, focus on CPR + active rewarming.
        const canRoscHypothermic =
          isSevereHypothermia &&
          hasRewarming;

        const canRoscTick =
          prev.isInArrest &&
          isNonShockable &&
          cprRunning &&
          hasO2 &&
          arrestDurationMs > 90_000 &&
          (canRoscNormothermic || canRoscHypothermic);

        if (canRoscTick) {
          // Normothermic: base 6% + 4% per extra adrenaline dose (cap 25%).
          // Hypothermic: base 3% — slower because rewarming needs time to
          // physiologically reverse drug-refractory cold myocardium.
          const perTickChance = canRoscHypothermic
            ? 0.03
            : Math.min(0.25, 0.06 + Math.max(0, adrenalineDoses - 1) * 0.04);

          if (Math.random() < perTickChance) {
            // ROSC — restore a modest post-arrest rhythm. Hypothermic
            // patients typically come back with a lower HR initially
            // (cold sinus rather than sinus tachy).
            if (canRoscHypothermic) {
              v.pulse = 60 + Math.floor(Math.random() * 15); // 60-75
              v.bp = '95/60';
              v.spo2 = Math.max(v.spo2 ?? 85, 88);
              v.respiration = ventRate || 8;
              // Small rewarming bump on conversion so the patient is above
              // the drug-withholding threshold for post-ROSC care.
              v.temperature = Math.max(v.temperature ?? 28, 30.5);
            } else {
              v.pulse = 95 + Math.floor(Math.random() * 15); // 95-110
              v.bp = '95/60';
              v.spo2 = Math.max(v.spo2 ?? 85, 90);
              v.respiration = ventRate || 10;
            }
            roscTriggered = true;
            changed = true;
          }
        }

        if (!changed) return prev;
        setCurrentVitals(ensureCompleteVitals(v));
        const next = { ...prev, vitals: v };
        if (roscTriggered) {
          next.isInArrest = false;
          // Hypothermic comes back with cold sinus (lower rate); normo
          // comes back with sinus tachy. Matches the physiology of the
          // respective conversions.
          next.currentRhythm = isSevereHypothermia ? 'Normal Sinus Rhythm' : 'Sinus Tachycardia';
          next.deteriorationLevel = 2;
          toast.success('ROSC — Return of Spontaneous Circulation', {
            description: isSevereHypothermia
              ? 'Sinus rhythm restored with rewarming. Continue controlled rewarming toward normothermia, titrate O2 to 94–98%, obtain a 12-lead ECG and handle gently (arrhythmia risk).'
              : 'Sinus tachycardia restored. Begin post-ROSC care: 12-lead ECG, titrate O2 to 94–98%, continuously monitor core temperature and prevent fever.',
            duration: 12000,
          });
        }
        return next;
      });
    }, 5000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, readOnly, appliedTreatmentIds, cprRunning, ventilatorSettings, bvmVentilationRate, adrenalineDoses, caseStartTime]);

  // Apply treatment — uses dynamic treatment engine
  // ── Adverse reaction cascade helpers ─────────────────────────────────────
  // Administering an allergen kicks off a time-evolving reaction. We reuse the
  // existing vitals animation (startGradualChange → animatedVitals → monitor),
  // pause deterioration/continuous-O2 while it runs (guards above), and — for
  // anaphylaxis left untreated — escalate into the normal arrest workflow.
  // In a classroom session the vitals + arrest mirrors broadcast it to
  // spectators automatically, so students watching see the same cascade.
  const clearReactionTimers = useCallback(() => {
    reactionTimersRef.current.forEach(id => window.clearTimeout(id));
    reactionTimersRef.current = [];
  }, []);

  const triggerAdverseReaction = useCallback((reaction: AdverseReaction) => {
    clearReactionTimers();
    activeReactionRef.current = reaction;
    setActiveReaction(reaction);
    adverseEventsRef.current.push({
      reactionId: reaction.id,
      treatmentId: reaction.treatmentId,
      treatmentName: reaction.treatmentName,
      kind: reaction.kind,
      allergy: reaction.match.allergy,
      administeredAt: Date.now(),
      recognizedRescueAt: null,
      reachedArrest: false,
    });

    toast.error(reaction.headline, {
      description: `${reaction.findings.onset[0]}. Recognise it and treat — IM adrenaline is the priority.`,
      duration: 10000,
    });

    const animateTo = (stage: 'onset' | 'peak' | 'arrest') => {
      const from = currentVitalsRef.current;
      if (!from) return;
      const target = ensureCompleteVitals(projectReactionVitals(from, reaction.kind, stage));
      setPreviousVitals(from);
      if (startGradualChange) startGradualChange(from, target, 3000);
      else setCurrentVitals(target);
    };

    // Onset → peak → (if untreated) peri-arrest.
    reactionTimersRef.current.push(window.setTimeout(() => animateTo('onset'), reaction.onsetMs));
    reactionTimersRef.current.push(window.setTimeout(() => {
      if (!activeReactionRef.current) return;
      animateTo('peak');
      toast.error('Reaction worsening', {
        description: reaction.findings.peak.slice(0, 2).join('. '),
        duration: 8000,
      });
    }, reaction.onsetMs + 8000));

    if (reaction.canProgressToArrest) {
      reactionTimersRef.current.push(window.setTimeout(() => {
        if (!activeReactionRef.current) return; // rescued in time
        animateTo('arrest');
        setPatientState(prev => prev ? { ...prev, isInArrest: true, currentRhythm: 'PEA' } : prev);
        setArrestConfirmed(true);
        const ev = adverseEventsRef.current.find(e => e.reactionId === reaction.id);
        if (ev) ev.reachedArrest = true;
        toast.error('CARDIAC ARREST — untreated anaphylaxis', {
          description: 'PEA arrest. Begin CPR, adrenaline 1mg IV, IV fluids, treat the cause.',
          duration: 12000,
        });
      }, reaction.escalateMs));
    }
  }, [clearReactionTimers, startGradualChange]);

  const resolveAdverseReaction = useCallback(() => {
    const reaction = activeReactionRef.current;
    if (!reaction) return;
    clearReactionTimers();
    activeReactionRef.current = null;
    setActiveReaction(null);
    const ev = adverseEventsRef.current.find(e => e.reactionId === reaction.id && e.recognizedRescueAt == null);
    if (ev) ev.recognizedRescueAt = Date.now();

    // Adrenaline reverses it — animate recovery and stand down any arrest.
    const from = currentVitalsRef.current;
    const recovered = from ? ensureCompleteVitals(projectReactionVitals(from, reaction.kind, 'recovery')) : null;
    if (from && recovered) {
      setPreviousVitals(from);
      if (startGradualChange) startGradualChange(from, recovered, 6000);
      else setCurrentVitals(recovered);
    }
    // Clear the arrest AND restore a perfusing rhythm + synced pulse. The
    // monitor forces HR 0 for any 'arrest'-category rhythm (PEA/asystole)
    // even after ROSC — so if we only flip isInArrest the monitor keeps
    // showing HR 0 while a pulse is present. Move the rhythm back to a
    // perfusing one and sync patientState.vitals to the recovered values.
    setPatientState(prev => {
      if (!prev) return prev;
      const wasArrestRhythm = prev.isInArrest
        || prev.currentRhythm === 'PEA'
        || prev.currentRhythm === 'Asystole';
      return {
        ...prev,
        isInArrest: false,
        currentRhythm: wasArrestRhythm ? 'Sinus Tachycardia' : prev.currentRhythm,
        vitals: recovered ? { ...prev.vitals, ...recovered } : prev.vitals,
      };
    });
    setArrestConfirmed(false);

    toast.success('Anaphylaxis treated — adrenaline working', {
      description: 'BP and SpO2 recovering. Continue high-flow O2 and IV fluids; add chlorphenamine + hydrocortisone. Reassess.',
      duration: 7000,
    });
  }, [clearReactionTimers, startGradualChange]);

  const applyTreatment = useCallback((treatment: Treatment, defibParams?: DefibrillationParams) => {
    if (readOnly) {
      toast.info('You are watching — the driver is treating this case.', { duration: 1800 });
      return;
    }
    // Soft classroom-role gating — warn but never block. The instructor is
    // always in charge and may override a role's remit. Only warns once the
    // instructor has actually assigned a role to this student.
    if (clinicalRole && !isActionAllowedForRole(clinicalRole, treatment.category)) {
      toast.warning(
        t('classroom.roles.actionReserved', {
          role: t(`classroom.roles.${clinicalRole}.label`, CLINICAL_ROLES[clinicalRole].label),
          defaultValue: `This action is reserved for the ${CLINICAL_ROLES[clinicalRole].label} role`,
        }),
        { duration: 2600 },
      );
      // Fall through — advisory only.
    }
    if (!currentVitals || !currentCase || !patientState) return;
    lastActivityRef.current = Date.now();
    setHintVisible(false);

    // Defibrillation is a separate action from pad placement. Never open the
    // energy selector (or deliver a shock) without physically attached pads.
    if (treatment.id === 'defibrillation') {
      const padsAttached = hasAttachedDefibrillatorPads(appliedTreatmentIds);
      if (!padsAttached) {
        const pads = TREATMENTS.find(item => item.id === 'monitor_pads');
        if (pads) setPendingHandsOnTreatment(pads);
        toast.error('Attach defibrillator pads first', {
          description: 'Expose and prepare the chest, place both pads, connect the lead, then analyse the rhythm.',
          duration: 6000,
        });
        return;
      }
    }

    // Active anaphylaxis + adrenaline = the rescue. Resolve the reaction
    // (animate recovery, stand down any arrest) instead of the normal effect.
    if (activeReactionRef.current && isDefinitiveRescue(treatment.id)) {
      setAppliedTreatments(prev => [...prev, {
        id: treatment.id, name: treatment.name,
        description: `${treatment.name} — anaphylaxis rescue`,
        appliedAt: new Date().toISOString(), effects: [],
        category: treatment.category, isActive: true,
      }]);
      setAppliedTreatmentIds(prev => prev.includes(treatment.id) ? prev : [...prev, treatment.id]);
      resolveAdverseReaction();
      return;
    }

    const hasRosc = arrestTimeline.some(event => event.type === 'rosc')
      || /post.?rosc|return of spontaneous circulation|resuscitated after cardiac arrest/.test(getCaseClinicalText(currentCase));
    const practicalChallenge = assessTreatmentPracticality({
      treatment,
      currentVitals,
      currentCase,
      patientState,
      appliedTreatmentIds,
      hasRosc,
    });
    if (practicalChallenge && !treatmentChallengeConfirmedRef.current.has(treatment.id)) {
      if (practicalChallenge.patientQuote) {
        speakNarration(practicalChallenge.patientQuote, { role: 'patient' });
      }
      if (practicalChallenge.level === 'block') {
        toast.error(practicalChallenge.title, {
          description: practicalChallenge.clinicalReason,
          duration: 8000,
        });
        return;
      }
      setPendingTreatmentChallenge({ treatment, challenge: practicalChallenge, defibParams });
      return;
    }

    if (treatment.id === 'post_rosc_bundle') {
      const performed = new Set(assessmentTrackerRef.current?.performed.map(item => item.stepId) ?? []);
      const gcs = getPatientGcsTotal(currentVitals, currentCase, patientState);
      const needsAdvancedAirway = gcs <= 8;
      const hasAdvancedAirway = appliedTreatmentIds.some(id => ['intubation', 'rsi_intubation', 'endotracheal_intubation', 'surgical_cric'].includes(id));
      const hasVentilationSupport = appliedTreatmentIds.some(id => ['bvm_ventilation', 'mechanical_ventilation', 'ventilator_setup'].includes(id));
      const hasOxygenSupport = hasVentilationSupport || appliedTreatmentIds.some(id => ['oxygen_nasal', 'oxygen_mask', 'oxygen_venturi', 'oxygen_nonrebreather'].includes(id));
      const hasAccess = appliedTreatmentIds.includes('iv_access') || appliedTreatmentIds.includes('io_access');
      const missing: string[] = [];
      if (needsAdvancedAirway && !hasAdvancedAirway) missing.push('protect and confirm the airway');
      if (needsAdvancedAirway && !hasVentilationSupport) missing.push('establish controlled ventilation with waveform EtCO₂');
      if ((currentVitals.spo2 ?? 0) < 94 && !hasOxygenSupport) missing.push('support and titrate oxygenation');
      if (!hasAccess) missing.push('establish IV or IO access');
      if (!performed.has('12-lead-ecg')) missing.push('acquire a 12-lead ECG');
      if (needsAdvancedAirway && !appliedTreatmentIds.includes('targeted_temp_mgmt')) missing.push('start feedback-controlled fever prevention');
      if (missing.length > 0) {
        toast.error('Post-ROSC bundle is incomplete', {
          description: `Complete the outstanding care first: ${missing.join('; ')}.`,
          duration: 8500,
        });
        return;
      }
    }

    if (treatment.id === 'pacing_transcutaneous') {
      if (!pacingCaptureBypassRef.current) {
        if (!hasAttachedDefibrillatorPads(appliedTreatmentIds)) {
          const pads = TREATMENTS.find(item => item.id === 'monitor_pads');
          if (pads) setPendingHandsOnTreatment(pads);
          toast.error('Attach multifunction pads first', {
            description: 'Expose the chest, apply and connect the anterior/lateral pads before transcutaneous pacing.',
            duration: 6000,
          });
          return;
        }
        toast.info('Use the physical PACER controls', {
          description: 'Select PACER on the monitor, set the rate, increase mA until electrical capture, then press CHECK PULSE to confirm mechanical capture.',
          duration: 7500,
        });
        return;
      }
      pacingCaptureBypassRef.current = false;
    }

    const hasVascularAccess = appliedTreatmentIds.includes('iv_access') || appliedTreatmentIds.includes('io_access');
    if (treatment.id.startsWith('fluids_') && !hasVascularAccess) {
      const access = TREATMENTS.find(item => item.id === 'iv_access');
      if (access) setPendingHandsOnTreatment(access);
      toast.error('Establish vascular access first', {
        description: 'A fluid bag can be prepared, but it cannot be connected or infused until IV or IO placement is confirmed.',
        duration: 5500,
      });
      return;
    }
    const hasSecuredAirway = appliedTreatmentIds.some(id => [
      'intubation',
      'rsi_intubation',
      'endotracheal_intubation',
      'surgical_cric',
    ].includes(id));
    const hasEndotrachealTube = appliedTreatmentIds.some(id => [
      'intubation',
      'rsi_intubation',
      'endotracheal_intubation',
    ].includes(id));
    if (treatment.id === 'ett_confirmation' && !hasEndotrachealTube) {
      toast.error('No endotracheal tube to confirm', {
        description: 'Place a cuffed tracheal tube first, then confirm depth, sustained waveform capnography, bilateral ventilation and security.',
        duration: 5500,
      });
      return;
    }
    if (['ventilator_setup', 'mechanical_ventilation'].includes(treatment.id) && !hasSecuredAirway) {
      toast.error('Secure and confirm the airway first', {
        description: 'Do not connect a ventilator circuit until ETT position is confirmed with sustained waveform capnography.',
        duration: 5500,
      });
      return;
    }
    if (treatment.id === 'orogastric_tube' && !hasSecuredAirway) {
      toast.error('Secure the airway before gastric decompression', {
        description: 'This workflow is for post-airway-control decompression. Confirm a cuffed tracheal or front-of-neck airway first.',
        duration: 5500,
      });
      return;
    }
    if (treatment.id === 'head_blocks') {
      const hasCollar = appliedTreatmentIds.includes('cervical_collar');
      const hasBase = appliedTreatmentIds.some(id => ['spinal_board', 'vacuum_mattress'].includes(id));
      if (!hasCollar || !hasBase) {
        toast.error('Collar and support surface required first', {
          description: 'Head blocks are fitted after a sized cervical collar, once the patient is on a board or vacuum mattress.',
          duration: 5500,
        });
        return;
      }
    }

    // Physical procedures are not instant menu effects. Practicality and
    // prerequisite checks happen first; only a completed hands-on sequence
    // can re-enter this callback through the one-use bypass.
    const isReconfiguringConnectedVentilator = treatment.id === 'mechanical_ventilation'
      && appliedTreatmentIds.includes('mechanical_ventilation');
    if (isHandsOnTreatment(treatment.id)
      && !isReconfiguringConnectedVentilator
      && !handsOnProcedureBypassRef.current.has(treatment.id)) {
      setPendingHandsOnTreatment(treatment);
      return;
    }
    if (handsOnProcedureBypassRef.current.has(treatment.id)) {
      handsOnProcedureBypassRef.current.delete(treatment.id);
    }

    // Defibrillation requires energy/mode selection
    if (treatment.id === 'defibrillation' && !defibParams) {
      setPendingDefibTreatment(treatment);
      setShowDefibDialog(true);
      return;
    }

    // The secured-airway gate above runs before the hands-on circuit sequence.
    // Once the sequence is complete, open the settings dialog. Re-selecting
    // the treatment reopens it so settings can be adjusted without repeating
    // intubation or pretending the circuit has been removed.
    if (treatment.id === 'mechanical_ventilation') {
      if (!confirmedVentilatorSettingsRef.current) {
        setShowVentilatorDialog(true);
        return;
      }
      confirmedVentilatorSettingsRef.current = null;
    }

    // BVM needs a ventilation rate — light-weight prompt (10/12/20) so the
    // student picks an age-appropriate cadence. Once set, the monitor
    // surfaces the assisted RR to make the intervention visible.
    // Re-clicking bvm_ventilation reopens the rate dialog so the student
    // can change the rate (e.g. switching from 10/min CPR-sync to 12/min
    // normoventilation post-ROSC).
    if (treatment.id === 'bvm_ventilation' && bvmVentilationRateRef.current == null) {
      setPendingBvmTreatment(treatment);
      setShowBvmRateDialog(true);
      return;
    }

    // IV prerequisite check — student must establish IV access before giving IV drugs/fluids
    if (treatment.requiresIVAccess && !hasVascularAccess) {
      setPendingIVTreatment(treatment);
      return;
    }

    // Runtime contraindication checker — evaluates the drug against the
    // CURRENT vitals/rhythm/findings, not just the static list. Blocks
    // hard contras (GTN in SBP<90, beta-blocker in CHB, aspirin in ICH)
    // and folds soft warnings into the med-confirm dialog so the
    // student sees the concrete reason, not a generic string.
    const runtimeContras = checkRuntimeContraindications(treatment, {
      bp: String(currentVitals?.bp ?? ''),
      pulse: typeof currentVitals?.pulse === 'number' ? currentVitals.pulse : undefined,
      spo2: typeof currentVitals?.spo2 === 'number' ? currentVitals.spo2 : undefined,
      respiration: typeof currentVitals?.respiration === 'number' ? currentVitals.respiration : undefined,
      temperature: typeof currentVitals?.temperature === 'number' ? currentVitals.temperature : undefined,
      gcs: typeof currentVitals?.gcs === 'number' ? currentVitals.gcs : undefined,
      currentRhythm: patientState?.currentRhythm,
      isInArrest: patientState?.isInArrest,
      findings: [
        ...(currentCase.abcde?.circulation?.findings ?? []),
        ...(currentCase.expectedFindings?.keyObservations ?? []),
        ...(currentCase.expectedFindings?.differentialDiagnoses ?? []),
        currentCase.expectedFindings?.mostLikelyDiagnosis ?? '',
        currentCase.title ?? '',
      ],
      caseSubcategory: currentCase.subcategory,
    });
    // Hard blocks: refuse + surface the reason. No override here — the
    // blocked list is deliberately short (only the most dangerous combos).
    const hardBlocks = runtimeContras.filter(c => c.severity === 'block');
    if (hardBlocks.length > 0 && !medicationConfirmedRef.current.has(treatment.id)) {
      const primary = hardBlocks[0];
      toast.error(`Blocked: ${treatment.name}`, {
        description: primary.alternative
          ? `${primary.reason}\n\nAlternative: ${primary.alternative}`
          : primary.reason,
        duration: 10000,
      });
      return;
    }

    // Medication safety check — show React dialog (window.confirm auto-dismisses on re-render)
    if (treatment.category === 'medication' && !medicationConfirmedRef.current.has(treatment.id)) {
      const allergies = currentCase.history?.allergies || [];
      const allergyText = allergies.length > 0 && allergies[0] !== 'NKDA' && !allergies[0]?.toLowerCase().includes('no known')
        ? `Patient allergies: ${allergies.map(a => typeof a === 'string' ? a : (a as { name?: string }).name || a).join(', ')}`
        : 'No known drug allergies (NKDA)';
      // Concrete contraindication lines (smart) take priority over the
      // static list on the treatment.
      const smartContraLines = runtimeContras.map(c =>
        c.alternative ? `${c.reason} — ${c.alternative}` : c.reason,
      );
      const contraText = smartContraLines.length > 0
        ? `Contraindications flagged: ${smartContraLines.slice(0, 3).join(' | ')}`
        : treatment.contraindications?.length
          ? `Contraindications: ${treatment.contraindications.slice(0, 3).join('; ')}`
          : '';
      setPendingMedConfirm({ treatment, allergyText, contraText });
      return; // Wait for dialog confirmation
    }

    // Allergy violation — giving a drug the patient is allergic to triggers a
    // real, time-evolving adverse reaction instead of the therapeutic effect.
    const reaction = buildReactionForTreatment(treatment, {
      vitals: currentVitals,
      allergies: currentCase.history?.allergies,
    });
    if (reaction) {
      setAppliedTreatments(prev => [...prev, {
        id: treatment.id, name: treatment.name,
        description: `${treatment.name} — administered despite documented allergy`,
        appliedAt: new Date().toISOString(), effects: [],
        category: treatment.category, isActive: true,
      }]);
      setAppliedTreatmentIds(prev => prev.includes(treatment.id) ? prev : [...prev, treatment.id]);
      triggerAdverseReaction(reaction);
      return; // an allergen provides no therapeutic benefit
    }

    setApplyingTreatmentId(treatment.id);

    // Use dynamic treatment engine
    const { newState, response } = applyDynamicTreatment(
      treatment,
      patientState,
      currentCase,
      defibParams,
    );
    const realismResponse = evaluateTreatmentRealism({
      treatment,
      caseData: currentCase,
      vitals: currentVitals,
      appliedTreatmentIds,
    });
    if (realismResponse.patientQuote) {
      speakNarration(realismResponse.patientQuote, { role: 'patient' });
    }

    // Update patient state
    setPatientState(newState);

    // Build applied treatment record
    const newTreatment: AppliedTreatment = {
      id: treatment.id,
      name: treatment.name,
      description: `${response.description}${realismResponse.debriefNote ? ` — ${realismResponse.debriefNote}` : ''}`,
      appliedAt: new Date().toISOString(),
      effects: response.vitalChanges.map(vc => ({
        vitalSign: vc.vital,
        oldValue: vc.oldValue,
        newValue: vc.newValue,
        unit: '',
      })),
      category: treatment.category,
      isActive: true,
    };

    setAppliedTreatments(prev => [...prev, newTreatment]);
    setAppliedTreatmentIds(prev => prev.includes(treatment.id) ? prev : [...prev, treatment.id]);

    // Animate vital sign changes
    const targetVitals = ensureCompleteVitals(newState.vitals);
    setPreviousVitals(currentVitals);
    // Animate over the treatment's own onset duration (adrenaline ~1s,
    // oxygen/fluids ~60s) rather than a flat 8s — matches enhancedTreatmentEffects
    // Treatment.durationSeconds metadata.
    if (startGradualChange) {
      const animMs = Math.max(1000, (treatment.durationSeconds ?? 8) * 1000);
      startGradualChange(currentVitals, targetVitals, animMs);
    } else {
      setCurrentVitals(targetVitals);
    }
    // Treatment moments always land in history (bypass the 1Hz throttle).
    recordVitalsSample(targetVitals, true);

    setTimeout(() => setApplyingTreatmentId(null), 1500);

    // Show appropriate toast — strip vital change numbers from student view
    // Student should monitor the patient to observe effects, not be told the numbers
    const studentDesc = (response.description || '')
      .replace(/\s*[—–-]+\s*(?:[A-Za-z][A-Za-z\d /]*:\s*[\d./%]+\s*(?:→|->)\s*[\d./%]+(?:\s*,\s*)?)+\.?/g, '.')
      .replace(/\s*(?:HR|SpO2|BP|RR|GCS|Temp|EtCO2|BGL):\s*[\d./%]+\s*(?:→|->)\s*[\d./%]+\.?/gi, '')
      .replace(/\d+\s*vitals?\s*improving\.?\s*(?:Consider\s*repeat\s*dose\.?)?/g, '')
      .replace(/\.{2,}/g, '.').replace(/\.\s*$/, '').trim();

    if (response.criticalEvent) {
      toast.error(response.criticalEvent.description, {
        description: response.warningMessage,
        duration: 8000,
      });
    } else if (realismResponse.status === 'harmful') {
      toast.error(realismResponse.title, {
        description: realismResponse.clinicalFeedback,
        duration: 8500,
      });
    } else if (realismResponse.status === 'mismatch' || response.warningMessage) {
      toast.warning(realismResponse.status === 'mismatch' ? realismResponse.title : `${treatment.name} applied`, {
        description: realismResponse.status === 'mismatch'
          ? realismResponse.clinicalFeedback
          : 'Monitor the patient to assess response.',
        duration: 6500,
      });
    } else if (realismResponse.status === 'partial' || response.isPartialResponse) {
      toast.info(realismResponse.status === 'partial' ? realismResponse.title : `${treatment.name} applied`, {
        description: realismResponse.status === 'partial'
          ? realismResponse.clinicalFeedback
          : 'Monitor the patient — reassess vitals to evaluate response.',
        duration: 5200,
      });
    } else if (realismResponse.status === 'matched') {
      toast.success(realismResponse.title, {
        description: realismResponse.clinicalFeedback,
        duration: 4500,
      });
    } else {
      toast.success(`Applied: ${treatment.name}`, {
        description: studentDesc.includes('applied') ? 'Treatment applied. Monitor the patient.' : studentDesc || 'Treatment applied. Monitor the patient.',
        duration: 3000,
      });
    }

    // Track arrest-specific drug timing
    if (arrestActive) {
      const adrenalineIds = ['adrenaline_1mg', 'adrenaline_im', 'adrenaline_im_child', 'adrenaline_im_older', 'adrenaline_im_infant', 'adrenaline_infusion'];
      if (adrenalineIds.includes(treatment.id)) {
        setLastAdrenalineTime(Date.now());
        setAdrenalineDoses(prev => prev + 1);
        const doseLabel = treatment.id === 'adrenaline_im_child' ? '0.15mg IM' :
                         treatment.id === 'adrenaline_im_older' ? '0.3mg IM' :
                         treatment.id === 'adrenaline_im_infant' ? '0.1mg IM' :
                         treatment.id === 'adrenaline_im' ? '0.5mg IM' :
                         treatment.id === 'adrenaline_infusion' ? 'infusion' : '1mg IV';
        setArrestTimeline(prev => [...prev, { time: Date.now(), event: `Adrenaline ${doseLabel} (dose #${adrenalineDoses + 1})`, type: 'drug' }]);
      }
      if (treatment.id === 'amiodarone_300mg' || treatment.id === 'amiodarone_150mg') {
        setAmiodaroneDoses(prev => prev + 1);
        const dose = treatment.id === 'amiodarone_300mg' ? '300mg' : '150mg';
        setArrestTimeline(prev => [...prev, { time: Date.now(), event: `Amiodarone ${dose} IV`, type: 'drug' }]);
      }
      if (treatment.id === 'defibrillation') {
        setShockCount(prev => prev + 1);
        setArrestTimeline(prev => [...prev, {
          time: Date.now(),
          event: `Shock #${shockCount + 1} delivered (${defibParams?.energy || '?'}J)`,
          type: 'shock',
        }]);
      }
      if (treatment.id === 'lucas_device') {
        setArrestTimeline(prev => [...prev, { time: Date.now(), event: 'LUCAS mechanical CPR device applied', type: 'lucas' }]);
      }
      // Track any other treatment
      if (!adrenalineIds.includes(treatment.id) && !['amiodarone_300mg', 'amiodarone_150mg', 'defibrillation', 'lucas_device'].includes(treatment.id)) {
        setArrestTimeline(prev => [...prev, { time: Date.now(), event: `${treatment.name} applied`, type: 'treatment' }]);
      }
    }
    // readOnly must be in deps — when control is handed to this student
    // the callback needs to be rebuilt so applyTreatment can actually run
    // instead of hitting the stale "you are watching" toast branch.
	  }, [currentVitals, currentCase, patientState, startGradualChange, arrestActive, arrestTimeline, adrenalineDoses, shockCount, readOnly, triggerAdverseReaction, resolveAdverseReaction, speakNarration, appliedTreatmentIds, recordVitalsSample, clinicalRole, t]);

  // Handle defibrillation dialog confirmation
  const handleDefibConfirm = useCallback((params: DefibrillationParams) => {
    if (pendingDefibTreatment) {
      applyTreatment(pendingDefibTreatment, params);
      setPendingDefibTreatment(null);
    }
  }, [pendingDefibTreatment, applyTreatment]);

  const handleHandsOnProcedureComplete = useCallback((target: ProcedureTarget | null) => {
    const treatment = pendingHandsOnTreatment;
    if (!treatment) return;
    if (target) {
      const token = procedureSiteToken(treatment.id, target.id);
      setAppliedTreatmentIds(previous => previous.includes(token) ? previous : [...previous, token]);
    }
    if (procedureIncludesIntegratedReassessment(treatment.id)) {
      setReassessedTreatmentIds(previous => previous.includes(treatment.id)
        ? previous
        : [...previous, treatment.id]);
    }
    handsOnProcedureBypassRef.current.add(treatment.id);
    setPendingHandsOnTreatment(null);
    applyTreatment(treatment);
  }, [applyTreatment, pendingHandsOnTreatment]);

  // Keep ref in sync with state so rapid calls always read the latest tracker
  useEffect(() => { assessmentTrackerRef.current = assessmentTracker; }, [assessmentTracker]);

  // Handle assessment step
  const handlePerformAssessment = useCallback((stepId: AssessmentStepId) => {
    if (readOnly) {
      toast.info('You are watching — the driver is running this case.', { duration: 1800 });
      return;
    }
    if (!assessmentTrackerRef.current || !currentCase || !caseStartTime) return;
    lastActivityRef.current = Date.now();
    setHintVisible(false);

    const { tracker: updatedTracker, findings } = performAssessmentStep(
      assessmentTrackerRef.current,
      stepId,
      currentCase,
      caseStartTime,
      currentVitals,
    );

    // Update ref immediately so back-to-back calls read the right state
    assessmentTrackerRef.current = updatedTracker;
    setAssessmentTracker(updatedTracker);
    setActiveFindings({ stepId, findings });

    // An abnormal finding is not evidence of pain. This callback also covers
    // looking at cyanotic lips, listening and taking a history, not only
    // palpation. Physical reactions belong to the specific interaction; the
    // reported pain score must come from the patient/case and treatment state.

    // Opening an ABCDE section is not a glucose test or a temperature
    // measurement. Only the specific completed assessment reveals a value;
    // the bedside monitor keeps its own request/acquisition state.
    const assessedVitalByStep: Partial<Record<AssessmentStepId, string>> = {
      'blood-glucose': 'bloodGlucose',
      temperature: 'temperature',
      'pain-assessment': 'painScore',
    };
    const assessedVital = assessedVitalByStep[stepId];
    if (assessedVital) {
      setMonitorRevealedVitals(previous => new Set([...previous, assessedVital]));
    }

    const newlyReassessedTreatmentIds = deriveTreatmentReassessmentMatches(stepId, appliedTreatmentIds)
      .filter(treatmentId => !reassessedTreatmentIds.includes(treatmentId));
    if (newlyReassessedTreatmentIds.length > 0) {
      setReassessedTreatmentIds(prev => [...new Set([...prev, ...newlyReassessedTreatmentIds])]);
      const treatmentNames = newlyReassessedTreatmentIds
        .map(treatmentId => appliedTreatments.find(treatment => treatment.id === treatmentId)?.name
          || appliedTreatments.find(treatment => treatment.id === treatmentId)?.description
          || treatmentId.replace(/_/g, ' '))
        .slice(0, 2);
      toast.success('Treatment reassessed', {
        description: `${treatmentNames.join(', ')} now has clinical follow-up documented.`,
        duration: 2800,
      });
    }

    // Show toast based on findings severity
    const hasCritical = findings.some(f => f.severity === 'critical');
    const hasAbnormal = findings.some(f => f.severity === 'abnormal');

    if (hasCritical) {
      toast.error(`Critical finding!`, {
        description: findings.filter(f => f.severity === 'critical').map(f => f.value).join('; '),
        duration: 6000,
      });
    } else if (hasAbnormal) {
      toast.warning(`Abnormal finding`, {
        description: findings.filter(f => f.severity === 'abnormal').map(f => f.value).join('; '),
        duration: 4000,
      });
    } else {
      // Normal findings — no toast needed, findings panel shows them
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCase, caseStartTime, currentVitals, readOnly, monitorRevealedVitals, appliedTreatmentIds, reassessedTreatmentIds, appliedTreatments]); // assessmentTracker read via ref — always current. readOnly MUST stay in deps so handing control to a student rebuilds this callback with readOnly=false; otherwise every click silently hits the "you are watching" toast from the stale closure.

  // Hands-free voice-command mic removed (2026-06-18) — it was unused and
  // cluttered the assessment view. The kept voice feature is patient
  // communication during history taking (VoiceHistoryPanel / usePatientVoice).

  // --------------------------------------------------------------------------
  // Voice-first mode — full hands-free intent registry
  // --------------------------------------------------------------------------
  // Map the student flow's phase onto the voice-intent phase vocabulary.
  const voicePhase: VoicePhase =
    phase === 'prebriefing' ? 'briefing'
    : phase === 'scene-survey' ? 'scene'
    : phase === 'postcase' ? 'debrief'
    : 'treatment'; // 'case' / 'vitals' are the live treatment surface

  const voiceIntents: VoiceIntent[] = useMemo(() => {
    if (!currentCase) return [];
    return buildVoiceIntents(currentCase, TREATMENTS, voicePhase, {
      // Exclude any treatment the clinical grader rates 'harmful' for this
      // patient right now — a student must never be able to voice it.
      isHarmful: (tx) =>
        currentVitals != null &&
        evaluateTreatmentQuality(tx.id, currentVitals, currentCase, selectedYear)?.level === 'harmful',
    });
  }, [currentCase, voicePhase, currentVitals, selectedYear]);

  const handleVoiceIntent = useCallback((match: VoiceMatch) => {
    const intent = voiceIntents.find(i => i.id === match.command.id);
    if (!intent) return;
    const { action } = intent;

    switch (action.type) {
      case 'assess':
      case 'listen':
      case 'vital': {
        const stepId = (action.type === 'assess'
          ? action.payload.stepId
          : action.type === 'listen'
          ? action.payload.region
          : action.payload.vital) as AssessmentStepId;
        toast.success(`🎙 ${intent.label}`, { description: match.rawTranscript, duration: 2400 });
        if (currentCase && caseStartTime && assessmentTrackerRef.current) {
          handlePerformAssessment(stepId);
        }
        return;
      }
      case 'treatment': {
        const tx = TREATMENTS.find(t => t.id === action.payload.treatmentId);
        if (!tx) return;
        if (intent.requiresConfirm) {
          // Confirm beat — hold the drug until the student confirms.
          setPendingVoiceDrug({ treatmentId: tx.id, name: tx.name });
          return;
        }
        toast.success(`🎙 ${intent.label}`, { description: match.rawTranscript, duration: 2400 });
        applyTreatment(tx);
        return;
      }
      case 'nav': {
        const { target, open } = action.payload;
        if (open && target === 'jump-bag') {
          setActiveManagementTab('airway');
          setOpenManagementBag('airway');
        }
        toast.success(`🎙 ${intent.label}`, { description: match.rawTranscript, duration: 1800 });
        return;
      }
    }
  }, [voiceIntents, currentCase, caseStartTime, handlePerformAssessment, applyTreatment]);

  const confirmVoiceDrug = useCallback(() => {
    setPendingVoiceDrug(prev => {
      if (prev) {
        const tx = TREATMENTS.find(t => t.id === prev.treatmentId);
        if (tx) applyTreatment(tx);
      }
      return null;
    });
  }, [applyTreatment]);

  // Sync assessmentTracker.performed step IDs into session.completedItems
  // so that checklist-based scoring (12-lead ECG, pain assessment, etc.) works
  // during gameplay — not only on PDF export.
  useEffect(() => {
    if (!assessmentTracker || !session) return;
    const performedStepIds = assessmentTracker.performed.map(p => p.stepId);
    // Only update if there are new items not yet in completedItems
    const newItems = performedStepIds.filter(id => !session.completedItems.includes(id));
    if (newItems.length > 0) {
      setSession(prev => prev ? {
        ...prev,
        completedItems: [...new Set([...prev.completedItems, ...performedStepIds])],
      } : prev);
    }
  }, [assessmentTracker, session]);

  // Bridge: keyword-match student actions to loose-text checklist items.
  //
  // The `studentChecklist` is free-text (e.g. "Pre-alert stroke center",
  // "Establish exact time last known well") whereas the assessment tracker
  // only knows discrete step IDs (`airway`, `circulation`, `sample-history`).
  // Without a bridge, several checklist items can NEVER be credited:
  //   - "Pre-alert …" → captured by transportDecisions.preAlert=true
  //   - "Last known well / time of onset" → captured by sample-history / events-leading
  //   - "Do NOT give food or drink" → there's no discrete step; infer from
  //     the fact that the student reached transport without performing it
  //     (pragmatic — credit if case is transported).
  // This effect walks the checklist whenever one of those signals changes
  // and adds matching item IDs to completedItems. Also auto-credits items
  // whose description is satisfied by assessment steps already performed.
  useEffect(() => {
    if (!currentCase || !session) return;
    const checklist = currentCase.studentChecklist || [];
    if (checklist.length === 0) return;
    const already = new Set(session.completedItems);
    const performed = new Set<string>(assessmentTracker?.performed?.map(p => p.stepId) || []);
    const toCredit: string[] = [];

    // Pre-alert — any checklist item mentioning "pre-alert" / "pre alert" /
    // "alert hospital" / "alert receiving" credits if the student chose to
    // pre-alert during transport decisions.
    if (transportDecisions?.preAlert === true) {
      for (const item of checklist) {
        if (already.has(item.id)) continue;
        if (/pre[- ]?alert|alert (the )?(hospital|receiving|stroke|cardiac|trauma)/i.test(item.description)) {
          toCredit.push(item.id);
        }
      }
    }

    // Last known well / time of onset — credited by doing sample-history or
    // events-leading assessment. Those steps already pull the "events" field
    // which in every stroke / seizure / ACS case contains the time reference.
    if (performed.has('sample-history') || performed.has('events-leading') || performed.has('opqrst')) {
      for (const item of checklist) {
        if (already.has(item.id)) continue;
        if (/last known well|time of onset|onset time|time last seen|exact time/i.test(item.description)) {
          toCredit.push(item.id);
        }
      }
    }

    // Destination choice — any checklist item about choosing a stroke /
    // cardiac / trauma centre.
    if (transportDecisions?.destination) {
      for (const item of checklist) {
        if (already.has(item.id)) continue;
        if (/transport to.*(centre|center|unit|hospital)|bypass.*hospital|destination|specialist centre/i.test(item.description)) {
          toCredit.push(item.id);
        }
      }
    }

    // Provisional diagnosis — credit documentation items that reference a
    // working dx / ATMIST.
    if (transportDecisions?.provisionalDiagnosis) {
      for (const item of checklist) {
        if (already.has(item.id)) continue;
        if (/provisional|working diagnosis|atmist|handover/i.test(item.description)) {
          toCredit.push(item.id);
        }
      }
    }

    // Assessment-step-backed credits: e.g. "Perform FAST assessment" is
    // satisfied by doing disability/face steps. "Check blood glucose" is
    // satisfied by the blood-glucose step.
    const stepCreditMap: Array<{ pattern: RegExp; steps: string[] }> = [
      { pattern: /fast assessment|fast positive/i, steps: ['disability', 'face', 'head'] },
      { pattern: /blood glucose|bgl|bm\b/i, steps: ['blood-glucose', 'disability'] },
      { pattern: /iv access|establish iv/i, steps: ['iv-access'] },
      { pattern: /gcs|glasgow/i, steps: ['disability'] },
      { pattern: /pupils?/i, steps: ['disability'] },
      { pattern: /temperature|temp check/i, steps: ['temperature', 'exposure'] },
      { pattern: /pain (score|assessment)|ocqrsta|pqrst/i, steps: ['pain-assessment', 'opqrst'] },
      { pattern: /allerg/i, steps: ['allergies', 'sample-history'] },
      { pattern: /medicat/i, steps: ['medications', 'sample-history'] },
      { pattern: /sample history/i, steps: ['sample-history'] },
      { pattern: /document.*gcs|document.*neuro/i, steps: ['disability', 'neurological'] },
    ];
    for (const item of checklist) {
      if (already.has(item.id)) continue;
      for (const { pattern, steps } of stepCreditMap) {
        if (pattern.test(item.description) && steps.some(s => performed.has(s))) {
          toCredit.push(item.id);
          break;
        }
      }
    }

    if (toCredit.length > 0) {
      setSession(prev => prev ? {
        ...prev,
        completedItems: [...new Set([...prev.completedItems, ...toCredit])],
      } : prev);
    }
    // Dependency list intentionally includes the action signals; session
    // is read via a functional setter so the effect doesn't re-run on every
    // checklist credit it just performed.
  }, [currentCase, assessmentTracker, transportDecisions, session]);

  // End case — show transport decision wizard from step 1.
  // readOnly in deps so hand-off to a student rebuilds the callback.
  const endCase = useCallback((_action: 'transport' | 'end') => {
    if (readOnly) return;
    setTransportStep(1);
    setShowTransportDecision(true);
  }, [readOnly]);

  // Finalize case after transport decisions are made
  const finalizeCase = useCallback(() => {
    setCaseEndTime(Date.now());
    setShowTransportDecision(false);
    setPhase('postcase');
    if (deteriorationIntervalRef.current) {
      clearInterval(deteriorationIntervalRef.current);
      deteriorationIntervalRef.current = null;
    }
    toast.info('Care ended — generating report...');
  }, [setPhase]);

  // Calculate performance metrics for post-case
  const performanceMetrics = useMemo(() => {
    if (!currentCase || !session) return null;

    const checklist = (currentCase.studentChecklist || []).filter(
      item => item.yearLevel?.includes(selectedYear)
    );
    const completed = checklist.filter(item => session.completedItems.includes(item.id));
    const criticalItems = checklist.filter(item => item.critical);
    const criticalCompleted = criticalItems.filter(item => session.completedItems.includes(item.id));

    // Use assessment tracker score if available (primary scoring system), fall back to checklist
    const debrief = assessmentTracker ? generateAssessmentDebrief(assessmentTracker) : null;
    // Weighted ABCDE spine (Body Interact pattern): the survey share of the
    // assessment points is scaled by WHAT was assessed, WHEN, and in what
    // ORDER — not just completeness. History-taking points keep raw value.
    const abcdeScore = assessmentTracker
      ? computeAbcdeScore({
          performed: assessmentTracker.performed,
          required: assessmentTracker.required,
          recommended: assessmentTracker.recommended,
          studentYear: session.studentYear,
          caseFlags: deriveAbcdeCaseFlags(currentCase),
        })
      : null;
    const assessmentScore = debrief
      ? (assessmentTracker && abcdeScore
          ? applyAbcdeToAssessmentScore(assessmentTracker, abcdeScore.overall)
          : debrief.score)
      : completed.reduce((sum, item) => sum + (item.points || 0), 0);
    const assessmentTotal = debrief ? debrief.totalPossible : checklist.reduce((sum, item) => sum + (item.points || 0), 0);

    const initialVitalsForRealism = buildInitialVitalsFromCase(currentCase);
    const uniqueAppliedTreatmentIds = [...new Set(appliedTreatments.map(t => t.id))];
    const treatmentRealism = uniqueAppliedTreatmentIds.flatMap(id => {
      const treatment = TREATMENTS.find(item => item.id === id);
      if (!treatment) return [];
      return [{
        treatment,
        result: evaluateTreatmentRealism({
          treatment,
          caseData: currentCase,
          vitals: initialVitalsForRealism,
          appliedTreatmentIds: uniqueAppliedTreatmentIds,
        }),
      }];
    });
    const mismatchTreatments = treatmentRealism.filter(item => item.result.status === 'mismatch');
    const harmfulTreatments = treatmentRealism.filter(item => item.result.status === 'harmful');
    const bonusEligibleTreatmentCount = treatmentRealism.filter(
      item => item.result.status !== 'mismatch' && item.result.status !== 'harmful',
    ).length;
    const managementDebrief = deriveClinicalManagementDebrief(realismDirector?.treatmentLoopStates ?? []);

    // Treatment bonus: protocol-covered cases reward completion of the
    // condition/severity pathway, not the raw number of things applied. This
    // prevents the scoring model from nudging students into unnecessary care
    // just to fill a treatment-count quota. Cases without a protocol retain the
    // conservative appropriate-treatment fallback.
    const treatmentBonusCap = Math.round(assessmentTotal * 0.3);
    let treatmentBonus = 0;
    const matchedProtocol = findProtocol(currentCase.subcategory || '', currentCase.category || '');
    const protocolSeverity = matchedProtocol
      ? determineSeverityFromVitals(matchedProtocol, initialVitalsForRealism)
      : null;
    if (protocolSeverity) {
      const protocolCompliance = assessProtocolCompliance(protocolSeverity, uniqueAppliedTreatmentIds);
      treatmentBonus = Math.round(treatmentBonusCap * (protocolCompliance.completionPercent / 100));
    } else if (bonusEligibleTreatmentCount > 0) {
      treatmentBonus = Math.min(bonusEligibleTreatmentCount * 5, treatmentBonusCap);
      // For cases without an authored executable protocol, retain quality
      // bonuses so appropriate early care and meaningful improvement count.
      const initialSpO2Check = parseInt(String(vitalsHistory[0]?.spo2)) || 0;
      const finalSpO2Check = parseInt(String(vitalsHistory[vitalsHistory.length - 1]?.spo2)) || 0;
      if (finalSpO2Check > initialSpO2Check + 5) treatmentBonus = Math.min(treatmentBonus + 10, treatmentBonusCap);
      // Bonus for early treatment (within 2 minutes)
      const firstTx = caseStartTime && appliedTreatments[0]?.appliedAt
        ? Math.round((new Date(appliedTreatments[0].appliedAt).getTime() - caseStartTime) / 1000)
        : null;
      if (firstTx !== null && firstTx <= 120) treatmentBonus = Math.min(treatmentBonus + 5, treatmentBonusCap);
    }

    const scoreEarned = assessmentScore + treatmentBonus;
    const totalPossible = assessmentTotal + treatmentBonusCap;
    const basePercentage = totalPossible > 0 ? Math.round((scoreEarned / totalPossible) * 100) : 0;

    // Penalty system: deduct for critical omissions and unresolved dangerous vitals
    // Use assessment debrief critical missed (primary) OR checklist critical missed (fallback)
    const checklistCriticalMissed = criticalItems.filter(item => !session.completedItems.includes(item.id));
    const debriefCriticalItems = debrief?.items.filter(item => item.critical) || [];
    const debriefCriticalCompleted = debriefCriticalItems.filter(item => item.status === 'completed').length;
    // The assessment tracker is the authoritative scoring system whenever it
    // exists. The legacy free-text checklist remains a fallback for older
    // sessions, but its IDs are not a reliable proxy for live interactions.
    const criticalMissedCount = debrief
      ? debrief.criticalMissed.length
      : checklistCriticalMissed.length;
    const penaltyReasons: { label: string; amount: number }[] = [];
    let penaltyTotal = 0;

    if (criticalMissedCount > 0) {
      const amt = Math.min(criticalMissedCount * 5, 25);
      penaltyReasons.push({ label: `${criticalMissedCount} critical action${criticalMissedCount > 1 ? 's' : ''} missed`, amount: amt });
      penaltyTotal += amt;
    }

    const finalVitals = vitalsHistory[vitalsHistory.length - 1];
    if (finalVitals) {
      const fSpO2 = parseInt(String(finalVitals.spo2)) || 0;
      const fRR = parseInt(String(finalVitals.respiration)) || 0;
      const fHR = parseInt(String(finalVitals.pulse)) || 0;
      if (fSpO2 > 0 && fSpO2 < 90) {
        penaltyReasons.push({ label: `SpO2 critically low at ${fSpO2}%`, amount: 10 });
        penaltyTotal += 10;
      } else if (fSpO2 > 0 && fSpO2 < 94) {
        penaltyReasons.push({ label: `SpO2 still below target at ${fSpO2}%`, amount: 5 });
        penaltyTotal += 5;
      }
      if (fRR > 0 && (fRR > 30 || fRR < 8)) {
        penaltyReasons.push({ label: `Respiratory rate dangerous at ${fRR}/min`, amount: 5 });
        penaltyTotal += 5;
      }
      if (fHR > 0 && (fHR > 150 || fHR < 40)) {
        penaltyReasons.push({ label: `Heart rate dangerous at ${fHR} bpm`, amount: 5 });
        penaltyTotal += 5;
      }
    }

    // Cardiac arrest & hypothermia-specific penalties
    const sub = (currentCase.subcategory || '').toLowerCase();
    const isArrestCase = sub.includes('cardiac-arrest') || sub.includes('arrest') || sub.includes('vfib') || sub.includes('asystole')
      || patientState?.isInArrest || appliedTreatmentIds.includes('cpr');
    const isSevereHypothermiaCase = (currentCase.vitalSignsProgression?.initial?.temperature ?? 37) < 30;

    if (isArrestCase) {
      // CPR is started via the CPR button (cprRunning + timeline entry) —
      // not via applyTreatment — so checking `appliedTreatmentIds` alone
      // falsely flagged "no CPR". Treat any of these as proof CPR happened:
      // an 'cpr-start' arrest-timeline entry, cprRunning being true now,
      // or a manually-applied cpr treatment (belt-and-braces).
      const hasCPR =
        appliedTreatmentIds.includes('cpr') ||
        appliedTreatmentIds.includes('cpr_compressions') ||
        cprRunning ||
        arrestTimeline.some(e => e.type === 'cpr-start' || /cpr/i.test(e.event));
      const hasAdrenaline = appliedTreatmentIds.includes('adrenaline_1mg');
      const hasDefib =
        appliedTreatmentIds.includes('defibrillation') ||
        arrestTimeline.some(e => e.type === 'shock');
      const hasBVM =
        appliedTreatmentIds.includes('bvm_ventilation') ||
        appliedTreatmentIds.includes('mechanical_ventilation') ||
        appliedTreatmentIds.includes('oxygen_nonrebreather') ||
        appliedTreatmentIds.includes('oxygen_mask') ||
        appliedTreatmentIds.includes('cpap_niv');
      const isShockableCase = currentCase.abcde?.circulation?.ecgFindings?.some(
        (f: string) => f.toLowerCase().includes('vf') || f.toLowerCase().includes('ventricular fibrillation')
      );

      if (!hasCPR) {
        penaltyReasons.push({ label: 'CPR not started — critical in cardiac arrest', amount: 15 });
        penaltyTotal += 15;
      }
      if (!hasBVM) {
        penaltyReasons.push({ label: 'No ventilation provided during arrest', amount: 10 });
        penaltyTotal += 10;
      }
      if (!hasAdrenaline && !isSevereHypothermiaCase) {
        penaltyReasons.push({ label: 'Adrenaline not given in cardiac arrest', amount: 10 });
        penaltyTotal += 10;
      }
      if (isShockableCase && !hasDefib) {
        penaltyReasons.push({ label: 'Shockable rhythm not defibrillated', amount: 15 });
        penaltyTotal += 15;
      }
    }
    if (isSevereHypothermiaCase) {
      const checkedTemp = assessmentTracker?.performed.some(p => p.stepId === 'temperature');
      if (!checkedTemp) {
        penaltyReasons.push({ label: 'Core temperature not assessed in hypothermia case', amount: 10 });
        penaltyTotal += 10;
      }
    }

    // ---- CONTRAINDICATED MEDICATION PENALTIES ----
    // Until now, giving the wrong drug had no score consequence. This wires
    // the existing `contraindicatedTreatments` table (per-severity) into the
    // grade: each contraindicated treatment the student applied burns 12
    // points and surfaces a named penalty in the session summary. The
    // engine's `applyCrossSystemPhysiology` separately handles the physio-
    // logical consequence (e.g. GTN in inferior STEMI → BP crash); this is
    // the accountability half of that feedback loop.
    let contraindicationCount = 0;
    const contraindicatedGivenIds = new Set<string>();
    try {
      const protocol = findProtocol(currentCase.subcategory || '', currentCase.category || '');
      if (protocol && currentCase.vitalSignsProgression?.initial) {
        const initialVitals = {
          pulse: currentCase.vitalSignsProgression.initial.pulse ?? 80,
          respiration: currentCase.vitalSignsProgression.initial.respiration ?? 16,
          spo2: currentCase.vitalSignsProgression.initial.spo2 ?? 98,
          gcs: currentCase.vitalSignsProgression.initial.gcs ?? 15,
          bp: currentCase.vitalSignsProgression.initial.bp ?? '120/80',
          temperature: currentCase.vitalSignsProgression.initial.temperature ?? 37,
        } as const;
        const severity = determineSeverityFromVitals(protocol, initialVitals as unknown as Parameters<typeof determineSeverityFromVitals>[1]);
        const contraindicatedGiven = (severity.contraindicatedTreatments ?? []).filter(
          t => appliedTreatmentIds.includes(t),
        );
        contraindicationCount = contraindicatedGiven.length;
        contraindicatedGiven.forEach(id => contraindicatedGivenIds.add(id));
        if (contraindicatedGiven.length > 0) {
          // Resolve friendlier names where available so the summary reads
          // "GTN given in inferior STEMI" rather than "gtn_spray given".
          const nameFor = (id: string) =>
            TREATMENTS.find(tr => tr.id === id)?.name ?? id.replace(/_/g, ' ');
          for (const id of contraindicatedGiven) {
            penaltyReasons.push({
              label: `Contraindicated: ${nameFor(id)} — should NOT be given in this presentation`,
              amount: 12,
            });
            penaltyTotal += 12;
          }
        }
      }
    } catch (e) {
      // Non-fatal — don't let a scoring edge case break the summary.
      console.warn('[scoring] contraindication check failed', e);
    }

    // ---- CLINICAL-REALISM PENALTIES ----
    // The treatment engine already evaluates whether an intervention fits the
    // presentation. Previously that result was feedback-only, so a clearly
    // inappropriate intervention could still help produce a 100% score.
    // Deduplicate by treatment ID and avoid charging a second penalty when the
    // protocol has already classified the same action as contraindicated.
    const unaccountedMismatchTreatments = mismatchTreatments.filter(
      item => !contraindicatedGivenIds.has(item.treatment.id),
    );
    const unaccountedHarmfulTreatments = harmfulTreatments.filter(
      item => !contraindicatedGivenIds.has(item.treatment.id),
    );
    for (const item of unaccountedMismatchTreatments) {
      penaltyReasons.push({
        label: `Inappropriate: ${item.treatment.name} — ${item.result.debriefNote}`,
        amount: 5,
      });
      penaltyTotal += 5;
    }
    for (const item of unaccountedHarmfulTreatments) {
      penaltyReasons.push({
        label: `Harmful: ${item.treatment.name} — ${item.result.debriefNote}`,
        amount: 12,
      });
      penaltyTotal += 12;
    }

    for (const reason of managementDebrief.penaltyReasons) {
      penaltyReasons.push(reason);
      penaltyTotal += reason.amount;
    }

    // ---- ALLERGY / ADVERSE-REACTION PENALTIES ----
    // Administering a drug the patient is documented allergic to is a serious
    // safety error. Inducing anaphylaxis is heavily penalised; letting it
    // progress to arrest more so. Recognising it and giving adrenaline
    // mitigates the penalty — the student recovered the situation.
    const adverseEvents = adverseEventsRef.current;
    let anaphylaxisInduced = 0;
    let anaphylaxisRescued = 0;
    for (const ev of adverseEvents) {
      let amt = ev.kind === 'anaphylaxis' ? 25 : 12;
      let label = `${ev.kind === 'anaphylaxis' ? 'Anaphylaxis induced' : 'Allergic reaction caused'}: ${ev.treatmentName} given despite documented “${ev.allergy}” allergy`;
      if (ev.reachedArrest) { amt += 15; label += ' — progressed to cardiac arrest'; }
      if (ev.recognizedRescueAt) {
        amt = Math.round(amt * 0.4);
        label += ' (recognised & treated with IM adrenaline)';
        anaphylaxisRescued += 1;
      }
      anaphylaxisInduced += 1;
      penaltyReasons.push({ label, amount: amt });
      penaltyTotal += amt;
    }

    const percentage = Math.max(0, basePercentage - penaltyTotal);

    // Treatment analysis
    const treatmentCount = appliedTreatments.length;
    const timeToFirstTreatment = appliedTreatments.length > 0 && caseStartTime
      ? Math.round((new Date(appliedTreatments[0].appliedAt).getTime() - caseStartTime) / 1000)
      : null;

    // Vital sign trend
    const initialHR = parseInt(String(vitalsHistory[0]?.pulse)) || 0;
    const finalHR = parseInt(String(vitalsHistory[vitalsHistory.length - 1]?.pulse)) || 0;
    const initialSpO2 = parseInt(String(vitalsHistory[0]?.spo2)) || 0;
    const finalSpO2 = parseInt(String(vitalsHistory[vitalsHistory.length - 1]?.spo2)) || 0;

    const finalV = vitalsHistory[vitalsHistory.length - 1];
    const finalVitalsDangerous = !!finalV && (
      ((parseInt(String(finalV.spo2)) || 100) < 94) ||
      ((parseInt(String(finalV.respiration)) || 16) > 30) ||
      ((parseInt(String(finalV.respiration)) || 16) < 8) ||
      ((parseInt(String(finalV.pulse)) || 80) > 150) ||
      ((parseInt(String(finalV.pulse)) || 80) < 40)
    );
    const smartGrade = computeSmartGrade({
      overall: percentage,
      assessmentScore,
      assessmentTotal,
      criticalItems: debrief ? debriefCriticalItems.length : criticalItems.length,
      criticalCompleted: debrief ? debriefCriticalCompleted : criticalCompleted.length,
      treatmentCount,
      timeToFirstTreatmentSec: timeToFirstTreatment,
      totalTimeSec: elapsedSeconds,
      estimatedDurationMin: currentCase.estimatedDuration || 30,
      spo2Improved: finalSpO2 > initialSpO2,
      contraindicationCount,
      inappropriateTreatmentCount: unaccountedMismatchTreatments.length,
      harmfulTreatmentCount: unaccountedHarmfulTreatments.length,
      unreassessedTreatmentCount: managementDebrief.pendingCount,
      adverseInduced: anaphylaxisInduced,
      adverseRescued: anaphylaxisRescued,
      adverseArrests: adverseEventsRef.current.filter(e => e.reachedArrest).length,
      finalVitalsDangerous,
    });

    return {
      checklist,
      completed,
      criticalItems,
      criticalCompleted,
      smartGrade,
      scoreEarned,
      totalPossible,
      basePercentage,
      percentage,
      penaltyTotal,
      penaltyReasons,
      managementDebrief,
      treatmentCount,
      timeToFirstTreatment,
      totalTime: elapsedSeconds,
      vitalsTrend: {
        hrImproved: Math.abs(finalHR - 75) < Math.abs(initialHR - 75),
        spo2Improved: finalSpO2 > initialSpO2,
        initialHR, finalHR, initialSpO2, finalSpO2
      },
      // Assessment debrief (reuse already-computed debrief)
      assessmentDebrief: debrief,
      // Weighted ABCDE spine breakdown (completeness / sequence / timeliness)
      abcdeScore,
    };
  }, [currentCase, session, selectedYear, appliedTreatments, vitalsHistory, elapsedSeconds, caseStartTime, assessmentTracker, cprRunning, arrestTimeline, patientState, appliedTreatmentIds, realismDirector]);

  // Persist the graded result for a signed-in student (best-effort, once per
  // completed case). Anonymous PIN play simply skips this — saveStudentResult
  // no-ops without a user or Supabase config.
  useEffect(() => {
    if (phase !== 'postcase') { savedResultRef.current = false; return; }
    if (savedResultRef.current || !auth.user || !currentCase || !session) return;
    const grade = performanceMetrics?.smartGrade;
    if (!grade) return;
    savedResultRef.current = true;
    void saveStudentResult({
      studentId: auth.user.id,
      studentName: auth.displayName,
      caseId: currentCase.id,
      caseTitle: currentCase.title,
      category: currentCase.category,
      studentYear: session.studentYear,
      score: performanceMetrics.percentage,
      grade,
      adverseEvents: adverseEventsRef.current,
    });
  }, [phase, auth.user, auth.displayName, performanceMetrics, currentCase, session]);

  // AI-style narrative report — only computed when the case is complete
  const narrativeReport = useMemo(() => {
    if (!currentCase || !performanceMetrics || phase !== 'postcase') return null;
    return generateNarrativeReport({
      caseData: currentCase,
      appliedTreatments,
      appliedTreatmentIds,
      vitalsHistory,
      caseStartTime,
      assessmentPerformedIds: assessmentTracker?.performed.map(p => p.stepId) ?? [],
      transportDecision: transportDecisions ? 'transport' : null,
      totalScore: performanceMetrics.percentage,
      pendingTreatmentFollowUps: performanceMetrics.managementDebrief.pendingItems.map(item =>
        `${item.label} (${item.reassessmentPrompt})`,
      ),
    });
  }, [currentCase, performanceMetrics, phase, appliedTreatments, appliedTreatmentIds, vitalsHistory, caseStartTime, assessmentTracker, transportDecisions]);

  // ED outcome / continuity of care — only when transported
  const edOutcome = useMemo(() => {
    if (!currentCase || !performanceMetrics || phase !== 'postcase') return null;
    if (!transportDecisions) return null; // Only generate if patient was transported
    const finalVitals = vitalsHistory[vitalsHistory.length - 1] || currentVitals;
    if (!finalVitals) return null;
    return generateEDOutcome({
      caseData: currentCase,
      finalVitals,
      appliedTreatmentIds,
      totalScore: performanceMetrics.percentage,
      transportPreAlert: transportDecisions.preAlert,
      transportDestination: transportDecisions.destination,
      suspectedDiagnosis: transportDecisions.provisionalDiagnosis,
    });
  }, [currentCase, performanceMetrics, phase, appliedTreatmentIds, vitalsHistory, currentVitals, transportDecisions]);

  // Reset to start
  const resetToStart = useCallback(() => {
    stopNarration();
    setCurrentCase(null);
    setSession(null);
    setCurrentVitals(null);
    setVitalsHistory([]);
    setAppliedTreatments([]);
    setAppliedTreatmentIds([]);
    setReassessedTreatmentIds([]);
    setCaseStartTime(null);
    setCaseEndTime(null);
    setElapsedSeconds(0);
    setAssessmentTracker(null);
    setActiveFindings(null);
    setMonitorRevealedVitals(new Set());
    setPhase('select');
    lastLaunchedCaseIdRef.current = currentCase?.id ?? lastLaunchedCaseIdRef.current;
    setPreviewEpoch(epoch => epoch + 1);
    medicationConfirmedRef.current = new Set();
    treatmentChallengeConfirmedRef.current = new Set();
    setPendingTreatmentChallenge(null);
    // Reset transport / patient state
    setShowTransportDecision(false);
    setPatientState(null);
    // Clear any active adverse reaction + its timers
    reactionTimersRef.current.forEach(id => window.clearTimeout(id));
    reactionTimersRef.current = [];
    activeReactionRef.current = null;
    setActiveReaction(null);
    adverseEventsRef.current = [];
    setSceneTimeWarnings(new Set());
    // Clear deterioration timer
    if (deteriorationIntervalRef.current) {
      clearInterval(deteriorationIntervalRef.current);
      deteriorationIntervalRef.current = null;
    }
    // Reset all cardiac arrest state
    setArrestConfirmed(false);
    setArrestActive(false);
    setPulseCheckInProgress(false);
    setLastPulseAssessment(null);
    setCprCycleTimer(120);
    setCprCycleNumber(0);
    setCprRunning(false);
    setShockCount(0);
    setLastAdrenalineTime(null);
    setAdrenalineDoses(0);
    setAmiodaroneDoses(0);
    setArrestStartTime(null);
    setArrestTimeline([]);
  }, [currentCase?.id, setPhase, stopNarration]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const phaseLabels: Record<StudentPhase, string> = {
    select: 'Select',
    prebriefing: 'Pre-Brief',
    'scene-survey': 'Scene Survey',
    vitals: 'Assess & Treat',
    case: 'Case Detail',
    postcase: 'Report',
  };
  const phaseOrder: StudentPhase[] = ['prebriefing', 'scene-survey', 'vitals', 'case', 'postcase'];

  // D3: phase-specific framer-motion variants (cinematic transitions)
  const phaseMotion = phaseMotionVariant(phase as CinematicPhase, reducedMotion);

  // `educationalResources` isn't part of the CaseScenario type (no case data
  // defines it yet) — read it defensively so the Further Reading card can
  // render if a future case supplies it.
  const educationalResources = (currentCase as (CaseScenario & { educationalResources?: Array<{ title: string; url: string; source?: string; type?: string }> }) | null)?.educationalResources;
  const selectionModeOptions = [
    { mode: 'standard' as const, label: 'Full scenario', desc: 'Smart random mission', icon: Sparkles },
    { mode: 'random-category' as const, label: 'Category drill', desc: 'Focused presentation', icon: Shuffle },
    { mode: 'condition' as const, label: 'Condition practice', desc: 'Search a diagnosis', icon: Target },
  ];
  const skillFocusOptions = [
    { value: 'any' as const, label: 'Balanced', desc: 'ABCDE flow', icon: ListChecks },
    { value: 'assessment' as const, label: 'Assessment', desc: 'Findings first', icon: Stethoscope },
    { value: 'airway' as const, label: 'Airway', desc: 'Patency decisions', icon: Wind },
    { value: 'breathing' as const, label: 'Breathing', desc: 'Oxygenation', icon: Activity },
    { value: 'circulation' as const, label: 'Circulation', desc: 'Perfusion + ECG', icon: HeartPulse },
    { value: 'medication' as const, label: 'Medication', desc: 'Drug safety', icon: Syringe },
    { value: 'trauma' as const, label: 'Trauma', desc: 'Mechanism + injury', icon: Shield },
  ];
  const equipmentFocusOptions = [
    { value: 'any' as const, label: 'Any kit', icon: Ambulance },
    { value: 'oxygen' as const, label: 'Oxygen', icon: Wind },
    { value: 'monitoring' as const, label: 'Monitor', icon: Gauge },
    { value: 'medications' as const, label: 'Meds', icon: Syringe },
    { value: 'immobilisation' as const, label: 'Splints', icon: Shield },
    { value: 'ventilation' as const, label: 'Ventilation', icon: Activity },
  ];
  const timeboxOptions = [
    { value: '10' as const, label: '10 min', desc: 'rapid drill' },
    { value: '15' as const, label: '15 min', desc: 'standard' },
    { value: '20' as const, label: '20 min', desc: 'full flow' },
    { value: 'untimed' as const, label: 'Untimed', desc: 'learning' },
  ];

  return (
    <div className="clinical-shell min-h-screen relative overflow-x-hidden">
      {/* Shared clinical wash across the student, educator, and classroom shells. */}
      <AmbientBackground />

      {/* Onboarding Tour */}
      {showTour && phase === 'select' && <OnboardingTour onDismiss={dismissTour} />}

      {/* Student Header — promoted to nav-blur over the ambient bg */}
      <header className="sticky top-0 z-50 nav-blur border-b border-black/5 safe-top">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div
              data-student-header-brand
              className={`flex items-center gap-2 sm:gap-3 min-w-0 ${phase !== 'select' ? 'max-[439px]:hidden' : ''}`}
            >
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 shadow-md shadow-cyan-500/20 shrink-0">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1
                    className="text-xs sm:text-sm font-bold tracking-tight heading-premium whitespace-nowrap"
                    aria-label={t('role.student')}
                    title={t('role.student')}
                  >
                    <span className="lg:hidden">{t('role.studentBadge')}</span>
                    <span className="hidden lg:inline">{t('role.student')}</span>
                  </h1>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-medium shrink-0 hidden lg:inline-flex">{t('role.studentBadge')}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground hidden lg:block">{t('app.name')}</p>
              </div>
            </div>

            <div data-student-header-controls className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Language switcher */}
              <LanguageSwitcher />
              {/* Voice toggle */}
              <VoiceToggleButton />
              {/* Back button */}
              {canGoBack && (
                <button
                  onClick={goBack}
                  className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg glass-control active:bg-muted transition-colors touch-manipulation"
                  title={t('header.back')}
                >
                  <ArrowLeft className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                </button>
              )}
              {/* Phase indicator - compact on mobile, full on desktop */}
              {phase !== 'select' && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {phaseOrder.map((p, i) => {
                    const currentIdx = phaseOrder.indexOf(phase);
                    const isActive = phase === p;
                    const isComplete = currentIdx > i;
                    return (
                      <div key={p} className="flex items-center gap-0.5 sm:gap-1">
                        <div className={`flex items-center justify-center transition-all duration-300 ${
                          isActive ? 'w-auto px-1.5 sm:px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] sm:text-[10px] font-semibold ring-1 ring-primary/30' :
                          isComplete ? 'w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500/15 ring-1 ring-green-500/30' :
                          'w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-muted'
                        }`}>
                          {isActive ? (
                            <span className="hidden sm:inline">{phaseLabels[p]}</span>
                          ) : isComplete ? (
                            <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500" />
                          ) : (
                            <span className="text-[8px] sm:text-[9px] text-muted-foreground">{i + 1}</span>
                          )}
                          {isActive && <span className="sm:hidden text-[9px]">{i + 1}</span>}
                        </div>
                        {i < phaseOrder.length - 1 && (
                          <div className={`w-2 sm:w-4 h-px ${isComplete ? 'bg-green-500/50' : 'bg-border'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Timer */}
              {caseStartTime && !caseEndTime && (
                <Badge variant="outline" className="font-mono gap-1 sm:gap-1.5 text-[10px] sm:text-xs border-primary/30 bg-primary/5 px-1.5 sm:px-2">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                  {formatTime(elapsedSeconds)}
                </Badge>
              )}

              <Button variant="ghost" size="sm" onClick={() => { stopNarration(); onExit(); }} className="text-[10px] sm:text-xs gap-1 text-muted-foreground hover:text-foreground h-7 sm:h-8 px-2 sm:px-3">
                <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 safe-bottom relative z-10">
        {/* Optional top banner slot — used by classroom-host for the
            broadcast toolbar. Rendered above every phase so it stays
            visible whether the instructor is pre-briefing, running the
            case, or on the post-case summary. */}
        {topBanner}

        {/* Sticky equipment-failure inject banner — stays until dismissed. */}
        {injectBanner && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 animate-pulse" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{injectBanner.title}</p>
              <p className="text-xs opacity-90">
                {(injectBanner.payload as EquipmentFailurePayload).equipment}: {(injectBanner.payload as EquipmentFailurePayload).cause}
              </p>
            </div>
            <button
              onClick={() => setInjectBanner(null)}
              className="shrink-0 text-red-600 hover:text-red-800 dark:hover:text-red-100"
              aria-label={t('classroom.injects.dismiss', 'Dismiss')}
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Collapsible inject feed — every complication fired this case. */}
        {activeInjects && activeInjects.length > 0 && (
          <div className="mb-3 rounded-lg border border-border/60 bg-muted/30">
            <button
              onClick={() => setInjectFeedOpen(o => !o)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left"
            >
              <ListChecks className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold">
                {t('classroom.injects.feedTitle', 'Case updates')} ({activeInjects.length})
              </span>
              {injectFeedOpen
                ? <ChevronUp className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                : <ChevronDown className="h-3.5 w-3.5 ml-auto text-muted-foreground" />}
            </button>
            {injectFeedOpen && (
              <ul className="px-3 pb-2 space-y-1.5">
                {activeInjects.slice().sort((a, b) => b.timestamp - a.timestamp).map((inj) => (
                  <li key={inj.id} className="flex items-start gap-2 text-xs">
                    <span
                      className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                        inj.severity === 'critical' ? 'bg-red-500'
                          : inj.severity === 'warn' ? 'bg-amber-500' : 'bg-sky-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <span className="font-medium">{inj.title}</span>
                      <span className="text-muted-foreground"> · {new Date(inj.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Classroom clinical-role badge — shown when the instructor has
            assigned this student a team role. Colour-coded per role. */}
        {clinicalRole && (
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${getRoleBadgeStyle(clinicalRole).bg} ${getRoleBadgeStyle(clinicalRole).text} ${getRoleBadgeStyle(clinicalRole).border}`}
              title={t(`classroom.roles.${clinicalRole}.description`, CLINICAL_ROLES[clinicalRole].description)}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              {t('classroom.roles.yourRole', 'Your role')}: {t(`classroom.roles.${clinicalRole}.label`, CLINICAL_ROLES[clinicalRole].label)}
            </span>
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE SUBTREES (animated transition) */}
        {/* ================================================================ */}
        {/* ponytail: phase-specific motion — prebriefing scale-blurs out,
            scene-survey slides up tall, live-treatment eases in slow so the 3D
            camera entrance has room. Collapses to instant under reduced-motion. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={phaseTransitionKey(phase as CinematicPhase)}
            data-testid="cinematic-phase"
            data-cinematic-phase={phaseTransitionKey(phase as CinematicPhase)}
            initial={phaseMotion.initial}
            animate={phaseMotion.animate}
            exit={phaseMotion.exit}
            transition={phaseMotion.transition}
            className="w-full"
          >
            {/* PHASE 1: Case Selection */}
            {phase === 'select' && (
          <div className="mx-auto max-w-6xl animate-fade-in space-y-4 sm:space-y-5">
            <div className="flex flex-col gap-4 rounded-[24px] border border-white/60 bg-white/75 p-4 shadow-[0_22px_70px_-50px_rgba(15,23,42,0.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-brand-700 dark:text-brand-300">
                  <Activity className="h-3.5 w-3.5" />
                  Mission setup
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Choose the next patient encounter</h2>
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {t('encounter.setup', 'Set the challenge, review the dispatch, then enter the scene.')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 lg:min-w-[390px]" aria-label="Mission setup progress">
                {[
                  { step: '01', label: 'Mode', value: selectionModeOptions.find(option => option.mode === selectionMode)?.label ?? 'Full scenario' },
                  { step: '02', label: 'Level', value: yearLevels.find(year => year.value === selectedYear)?.label ?? '3rd Year' },
                  { step: '03', label: 'Cases', value: `${baseMissionCases.length} ready` },
                ].map(item => (
                  <div key={item.step} className="rounded-2xl border border-border/45 bg-white/65 px-3 py-2.5 dark:bg-white/[0.05]">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      <span className="text-brand-600 dark:text-brand-300">{item.step}</span>
                      {item.label}
                    </div>
                    <div className="mt-1 truncate text-xs font-bold text-foreground">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(350px,0.86fr)]">
              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/60 bg-white/70 p-4 shadow-[0_18px_70px_-55px_rgba(15,23,42,0.5)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50 sm:p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Build your mission</p>
                      <h3 className="mt-1 text-lg font-bold tracking-tight">How do you want to practise?</h3>
                    </div>
                    {isGenerating && <Loader2 className="h-5 w-5 animate-spin text-brand-500" />}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {selectionModeOptions.map(({ mode, label, icon: ModeIcon, desc }) => (
                      <button
                        key={mode}
                        aria-pressed={selectionMode === mode}
                        onClick={() => setSelectionMode(mode)}
                        className={`group flex min-h-[88px] flex-col items-start justify-between rounded-2xl border p-3 text-left transition-all duration-300 ${
                          selectionMode === mode
                            ? 'border-brand-500/70 bg-brand-500/10 text-brand-700 shadow-lg shadow-brand-500/10 ring-2 ring-brand-500/15 dark:text-brand-300'
                            : 'border-border/50 bg-white/50 text-muted-foreground hover:border-brand-400/50 hover:bg-white/80 hover:text-foreground dark:bg-white/[0.04] dark:hover:bg-white/[0.08]'
                        }`}
                      >
                        <span className="flex w-full items-start justify-between gap-2">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${selectionMode === mode ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground group-hover:bg-brand-500/10 group-hover:text-brand-600'}`}>
                            <ModeIcon className="h-4 w-4" />
                          </span>
                          {mode === 'standard' && (
                            <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">Recommended</span>
                          )}
                        </span>
                        <span>
                          <span className="block text-sm font-bold">{label}</span>
                          <span className="mt-0.5 block text-xs opacity-75">{desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="my-4 h-px bg-border/45" />
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-brand-500" />
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Training level</p>
                        <p className="text-xs text-muted-foreground">Cases include prerequisite skills from earlier years.</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {yearLevels.map(year => (
                      <button
                        key={year.value}
                        aria-pressed={selectedYear === year.value}
                        onClick={() => setSelectedYear(year.value as StudentYear)}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
                          selectedYear === year.value
                            ? 'border-brand-500 bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                            : 'border-border/50 bg-white/55 text-muted-foreground hover:border-brand-400/50 hover:bg-white/80 hover:text-foreground dark:bg-white/[0.04]'
                        }`}
                      >
                        <GraduationCap className="h-4 w-4 shrink-0" />
                        <span>{year.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectionMode === 'standard' && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="rounded-[24px] border border-white/60 bg-white/70 p-4 shadow-[0_18px_70px_-55px_rgba(15,23,42,0.5)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Presentation</p>
                          <h3 className="text-base font-bold tracking-tight">Choose the clinical challenge</h3>
                        </div>
                        <Badge variant="secondary" className="rounded-full px-3">{baseMissionCases.length} cases ready</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          aria-pressed={selectedCategory === 'all'}
                          onClick={() => {
                            setSelectedCategory('all');
                            setSkillFocus('any');
                          }}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-all ${
                            selectedCategory === 'all'
                              ? 'border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/20'
                              : 'border-border/50 bg-white/55 text-muted-foreground hover:border-brand-400/50 hover:text-foreground dark:bg-white/[0.04]'
                          }`}
                        >
                          <Sparkles className="h-4 w-4" />
                          All presentations
                        </button>
                        {availableCategories.map(cat => {
                          const count = allCases.filter(c => c.category === cat.value && isCaseAvailableForCohort(c.yearLevels, selectedYear)).length;
                          const isSelected = selectedCategory === cat.value;
                          return (
                            <button
                              key={cat.value}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => {
                                setSelectedCategory(cat.value);
                                const alignedSkill = skillFocusForCategory[cat.value];
                                if (alignedSkill) setSkillFocus(alignedSkill);
                                if (isSelected) setPreviewEpoch(epoch => epoch + 1);
                              }}
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-all ${
                                isSelected
                                  ? 'border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/20'
                                  : 'border-border/50 bg-white/55 text-muted-foreground hover:border-brand-400/50 hover:text-foreground dark:bg-white/[0.04]'
                              }`}
                            >
                              <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-white' : cat.color}`} />
                              {cat.label}
                              <span className="text-[10px] opacity-65">{count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <details className="practice-customisation rounded-2xl border border-border/60 p-4">
                      <summary className="cursor-pointer py-2 text-sm font-semibold">{t('encounter.customise', 'Customise practice')} <span className="font-normal text-muted-foreground">· {missionDurationShortLabel}</span></summary>
                    <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
                      <div className="rounded-[24px] border border-white/60 bg-white/65 p-4 shadow-[0_18px_70px_-55px_rgba(15,23,42,0.5)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50 sm:p-5">
                        <div className="mb-3">
                          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Core skill</p>
                          <h3 className="text-base font-bold tracking-tight">What should the case stress?</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                          {skillFocusOptions.map(({ value, label, desc, icon: SkillIcon }) => (
                            <button
                              key={value}
                              aria-pressed={skillFocus === value}
                              onClick={() => setSkillFocus(value)}
                              className={`min-h-[86px] rounded-2xl border p-3 text-left transition-all duration-300 ${
                                skillFocus === value
                                  ? 'border-emerald-400 bg-emerald-500/10 text-emerald-700 shadow-md shadow-emerald-500/10 dark:text-emerald-300'
                                  : 'border-border/50 bg-white/50 text-muted-foreground hover:border-emerald-400/50 hover:bg-white/80 hover:text-foreground dark:bg-white/[0.04]'
                              }`}
                            >
                              <SkillIcon className="mb-2 h-4 w-4" />
                              <span className="block text-sm font-bold">{label}</span>
                              <span className="mt-0.5 block text-[11px] opacity-70">{desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-[24px] border border-white/60 bg-white/65 p-4 shadow-[0_18px_70px_-55px_rgba(15,23,42,0.5)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50">
                          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Kit focus</p>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {equipmentFocusOptions.map(({ value, label, icon: EquipmentIcon }) => (
                              <button
                                key={value}
                                aria-pressed={equipmentFocus === value}
                                onClick={() => setEquipmentFocus(value)}
                                className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-xs font-bold transition-all ${
                                  equipmentFocus === value
                                    ? 'border-cyan-400 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                                    : 'border-border/50 bg-white/50 text-muted-foreground hover:border-cyan-400/50 hover:text-foreground dark:bg-white/[0.04]'
                                }`}
                              >
                                <EquipmentIcon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-[24px] border border-white/60 bg-white/65 p-4 shadow-[0_18px_70px_-55px_rgba(15,23,42,0.5)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50">
                          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Time target</p>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {timeboxOptions.map(option => (
                              <button
                                key={option.value}
                                aria-pressed={timebox === option.value}
                                onClick={() => setTimebox(option.value)}
                                className={`rounded-xl border px-2.5 py-2 text-left transition-all ${
                                  timebox === option.value
                                    ? 'border-amber-400 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                    : 'border-border/50 bg-white/50 text-muted-foreground hover:border-amber-400/50 hover:text-foreground dark:bg-white/[0.04]'
                                }`}
                              >
                                <span className="block text-xs font-bold">{option.label}</span>
                                <span className="block text-[10px] opacity-70">{option.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    </details>
                  </div>
                )}

                {selectionMode === 'random-category' && (
                  <div className="rounded-[24px] border border-white/60 bg-white/65 p-4 shadow-[0_18px_70px_-55px_rgba(15,23,42,0.5)] backdrop-blur-2xl animate-fade-in dark:border-white/10 dark:bg-slate-950/50 sm:p-5">
                    <div className="mb-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Category drill</p>
                      <h3 className="text-base font-bold tracking-tight">Tap a bag to launch a presentation family</h3>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {availableCategories.map(cat => {
                        const count = allCases.filter(c => c.category === cat.value && isCaseAvailableForCohort(c.yearLevels, selectedYear)).length;
                        return (
                          <button
                            key={cat.value}
                            onClick={() => generateCaseByCategory(cat.value)}
                            disabled={isGenerating}
                            className="group flex min-h-[108px] flex-col justify-between rounded-2xl border border-border/50 bg-white/55 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400/50 hover:bg-white/85 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/[0.04]"
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span className={`h-2 w-12 rounded-full ${cat.color}`} />
                              <Shuffle className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-brand-500" />
                            </span>
                            <span>
                              <span className="block text-sm font-bold text-foreground">{cat.label}</span>
                              <span className="mt-1 block text-xs text-muted-foreground">{count} case{count !== 1 ? 's' : ''} for this cohort</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectionMode === 'condition' && (
                  <div className="rounded-[24px] border border-white/60 bg-white/65 p-4 shadow-[0_18px_70px_-55px_rgba(15,23,42,0.5)] backdrop-blur-2xl animate-fade-in dark:border-white/10 dark:bg-slate-950/50 sm:p-5">
                    <div className="mb-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Condition practice</p>
                      <h3 className="text-base font-bold tracking-tight">Search a condition or presentation</h3>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={conditionSearch}
                        onChange={(e) => { setConditionSearch(e.target.value); setSelectedCondition(null); }}
                        placeholder="STEMI, asthma, pneumothorax, anaphylaxis..."
                        className="w-full rounded-2xl border border-border/50 bg-white/70 py-3 pl-10 pr-4 text-sm shadow-inner outline-none transition-all placeholder:text-muted-foreground/50 focus:border-brand-500/60 focus:ring-4 focus:ring-brand-500/10 dark:bg-white/[0.05]"
                      />
                    </div>
                    <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-border/40 bg-white/45 divide-y divide-border/25 dark:bg-white/[0.03]">
                      {filteredConditions.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">No matching conditions found.</p>
                      ) : (
                        filteredConditions.map(condition => {
                          const matchCount = getCasesByCondition(condition, selectedYear, { cohortMode: 'progressive' }).length;
                          return (
                            <button
                              key={condition}
                              onClick={() => generateCaseByCondition(condition)}
                              disabled={isGenerating || matchCount === 0}
                              className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm transition-colors hover:bg-brand-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <Target className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                                <span className="truncate font-semibold text-foreground">{condition}</span>
                              </span>
                              <Badge variant="secondary" className="shrink-0 rounded-full text-[10px]">
                                {matchCount} case{matchCount !== 1 ? 's' : ''}
                              </Badge>
                            </button>
                          );
                        })
                      )}
                    </div>
                    {conditionSearch.trim() === '' && (
                      <p className="mt-3 text-center text-[11px] text-muted-foreground/60">
                        Showing 30 of {allConditionNames.length} indexed conditions.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <aside className="overflow-hidden rounded-[28px] border border-white/60 bg-slate-950 text-white shadow-[0_24px_90px_-45px_rgba(15,23,42,0.75)] dark:border-white/10 lg:sticky lg:top-24 lg:self-start">
                <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-cyan-400/15 via-transparent to-emerald-400/10 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/80">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                    </span>
                    Dispatch ready
                  </div>
                  <span className="text-[10px] font-semibold text-white/45">Matched to your selections</span>
                </div>
                <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-200/70">Dispatch preview</p>
                    <h3 className="mt-1 text-xl font-bold tracking-tight">Review before responding</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectionMode === 'standard' && missionCandidateCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPreviewEpoch(epoch => epoch + 1)}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-100 ring-1 ring-white/15 transition-colors hover:bg-white/15"
                        aria-label="Shuffle to another matching case"
                        title="Shuffle to another matching case"
                      >
                        <Shuffle className="h-5 w-5" />
                      </button>
                    )}
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/20">
                      <Ambulance className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {missionPreviewCase ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-inner">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">{missionPreviewCase.priority}</span>
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">{missionPreviewCase.complexity}</span>
                        <span className="rounded-full bg-cyan-300/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100">{missionDurationLabel}</span>
                      </div>
                      <h4 className="text-lg font-bold leading-tight text-white">{getStudentCaseTitle(missionPreviewCase)}</h4>
                      <div className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-slate-200">
                        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200/80" />
                        <span>{missionPreviewCase.dispatchInfo?.location}</span>
                      </div>
                    </div>

                    {selectionMode === 'standard' ? (
                      <Button
                        onClick={generateCase}
                        disabled={isGenerating || missionCandidateCases.length === 0}
                        size="lg"
                        className="w-full gap-2 rounded-2xl border-0 bg-cyan-400 py-6 text-base font-bold text-slate-950 shadow-xl shadow-cyan-950/40 transition-all hover:-translate-y-0.5 hover:bg-cyan-300 focus-visible:ring-4 focus-visible:ring-cyan-200/40"
                      >
                        {isGenerating ? (
                          <><Loader2 className="h-5 w-5 animate-spin" /> Building mission...</>
                        ) : (
                          <><Ambulance className="h-5 w-5" /> Start this case <ArrowRight className="h-4 w-4" /></>
                        )}
                      </Button>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-sm text-white/65">
                        {selectionMode === 'random-category'
                          ? 'Category drill ready. Choose one presentation family to launch.'
                          : 'Condition practice ready. Choose one indexed condition to launch.'}
                      </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                          <ClipboardCheck className="h-3.5 w-3.5" />
                          Competencies
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {missionCompetencies.map(tag => (
                            <span key={tag} className="rounded-full bg-emerald-300/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                          <Ambulance className="h-3.5 w-3.5" />
                          Expected kit
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {missionEquipment.map(tag => (
                            <span key={tag} className="rounded-full bg-cyan-300/15 px-2.5 py-1 text-[11px] font-semibold text-cyan-100">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-xs leading-relaxed text-white/65">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
                      <span><span className="font-semibold text-white">Why this case:</span> matched to {cohortScopeLabel}, {missionCategoryLabel}, {skillFocus === 'any' ? 'balanced clinical skills' : skillFocus}, and {equipmentFocus === 'any' ? 'the full kit range' : equipmentFocus}.</span>
                      {missionFilterFallback && <span className="block pt-2 text-amber-100/90">No exact kit/skill match was found, so the pool safely widened to the selected cohort and presentation.</span>}
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {[
                        { label: 'Radio', icon: Phone },
                        { label: 'Scene', icon: Shield },
                        { label: 'Treat', icon: Stethoscope },
                        { label: 'Debrief', icon: FileText },
                      ].map(({ label, icon: StepIcon }) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.05] px-2 py-2 text-center">
                          <StepIcon className="mx-auto h-3.5 w-3.5 text-cyan-100/80" />
                          <div className="mt-1 text-[10px] font-semibold text-white/55">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : !casesLoaded ? (
                  <div className="mt-5 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.07] p-5 text-sm leading-relaxed text-white/70">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-100/80" />
                    Loading case library…
                  </div>
                ) : (
                  <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.07] p-5 text-sm leading-relaxed text-white/70">
                    No cases match this cohort yet. Choose another year level or presentation.
                  </div>
                )}
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 2: Pre-Briefing */}
        {/* ================================================================ */}
        {phase === 'prebriefing' && currentCase && (
          <div className="max-w-4xl mx-auto animate-fade-in space-y-4">
            {/* ---- DISPATCH HERO ----
                Dark gradient panel that reads as a radio-room moment, not a
                form. Matches the Scene Survey's "Dispatch Arrival" vocab so
                the visual continuity from Pre-Brief → Scene Survey is
                seamless. The voice you hear playing is dispatched from this
                very card — the "Now reading…" pill ties the audio to the
                visual so the student understands the radio is in their ear. */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.65)]">
              {/* ambient radio-blue glow */}
              <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-sky-500/20 blur-[100px]" />
              <div className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-[100px]" />
              {/* scanline */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />

              <div className="relative p-5 sm:p-7">
                {/* Channel header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${isDispatchSpeaking ? 'opacity-90 animate-ping' : 'opacity-0'}`} />
                      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isDispatchSpeaking ? 'bg-emerald-400 shadow-[0_0_10px_rgb(74_222_128/0.8)]' : 'bg-slate-500'}`} />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.28em] text-white/70 font-medium">
                      {isDispatchSpeaking ? 'Dispatch · live' : 'Incoming case'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/40 font-medium">Channel 998</span>
                    <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/70 capitalize">
                      {currentCase.category}
                    </span>
                    {currentCase.dispatchInfo.dispatchCode && (
                      <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-amber-200">
                        {currentCase.dispatchInfo.dispatchCode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Case title — read-aloud hero */}
                <h2 className="mt-4 text-xl sm:text-3xl font-semibold tracking-tight leading-tight text-white">
                  {getStudentCaseTitle(currentCase)}
                </h2>

                {/* Dispatch tiles — only what the radio actually tells you */}
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: 'Location',  value: currentCase.dispatchInfo.location },
                    { label: 'Time',      value: String(currentCase.dispatchInfo.timeOfDay) },
                    { label: 'Caller',    value: currentCase.dispatchInfo.callerInfo },
                    { label: 'Priority',  value: currentCase.dispatchInfo.dispatchCode || currentCase.priority || '—' },
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      data-testid={`dispatch-field-${item.label.toLowerCase()}`}
                      className="animate-fade-in-up rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md px-3 py-2.5"
                      style={{ animationDelay: `${120 + index * 90}ms` }}
                    >
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/45 font-semibold">{item.label}</p>
                      <p className="mt-0.5 text-xs sm:text-sm font-medium text-white/90 capitalize line-clamp-2">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Additional dispatch info (en-route updates) */}
                {currentCase.dispatchInfo.additionalInfo && currentCase.dispatchInfo.additionalInfo.length > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-300/25 bg-amber-300/[0.06] p-3.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/85 font-semibold mb-2">En-route updates</p>
                    <ul className="space-y-1.5">
                      {currentCase.dispatchInfo.additionalInfo.map((info, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-amber-50/85">
                          <ChevronRight className="h-3 w-3 text-amber-300/70 mt-0.5 shrink-0" />
                          <span>{info}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Replay narration */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (isDispatchSpeaking) { stopNarration(); return; }
                      speakNarration(buildDispatchNarration(currentCase), { role: 'dispatcher' });
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-white/60 hover:text-white transition-colors"
                  >
                    <Activity className="h-3 w-3" />
                    {isDispatchSpeaking ? 'Stop replay' : 'Replay dispatch'}
                  </button>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                    Clock starts after Scene Survey
                  </p>
                </div>
              </div>
            </div>

            {/* ---- ONE SCENE BRIEF ----
                Dispatch facts live in the hero above. This card adds only new
                information: the canonical scene visual, expected first look,
                and useful patient context. Keeping it together avoids the old
                three-card repetition and the empty fourth grid cell. */}
            <Card className="rounded-2xl border border-border/60 bg-card overflow-hidden">
              <CardHeader className="px-4 sm:px-5 pt-4 pb-3 border-b border-border/40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">Scene brief</p>
                    {currentCase.sceneInfo?.sceneImageCaption && (
                      <p className="mt-1 text-xs text-muted-foreground leading-snug">{currentCase.sceneInfo.sceneImageCaption}</p>
                    )}
                  </div>
                  <ImageIcon className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                {/* Additive first-person arrival layer — sensory cues, access /
                    extrication, bystander detail — when a case has a generated
                    scene introduction. Renders nothing otherwise, so plain
                    clinic-bay cases keep their current brief untouched. */}
                <SceneSensoryStrip caseData={currentCase} />
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.9fr)]">
                  {/* Always fill the media cell. A missing plate used to leave a
                      tall empty white gap in the Scene Brief — the student saw
                      blank card. Now: real mp4 → animated still → dusk gradient. */}
                  <div className="relative h-full max-h-[23rem] min-h-[15rem] w-full overflow-hidden rounded-xl border border-border/40 bg-slate-900">
                    {prebriefSceneVideo ? (
                      <video
                        src={prebriefSceneVideo}
                        autoPlay
                        muted
                        loop
                        playsInline
                        aria-label={currentCase.sceneInfo?.sceneImageCaption || 'Scene overview'}
                        className="h-full w-full object-cover"
                      />
                    ) : prebriefSceneImage ? (
                      <>
                        <img
                          src={prebriefSceneImage}
                          alt={currentCase.sceneInfo?.sceneImageCaption || 'Scene overview'}
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{
                            animation: 'dispatch-kenburns 18s ease-in-out infinite alternate',
                            transformOrigin: '55% 45%',
                          }}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
                        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                          Dispatch replay
                        </span>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Scene loading…</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 rounded-xl bg-muted/25 p-4">
                    {currentCase.initialPresentation && (
                      <section>
                        <div className="flex items-center gap-2 mb-2">
                          <Stethoscope className="h-3.5 w-3.5 text-primary/70" />
                          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Expected on arrival</p>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground/90">{currentCase.initialPresentation.generalImpression}</p>
                        {currentCase.initialPresentation.position && (
                          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                            <span className="font-medium text-foreground/70">Position:</span> {currentCase.initialPresentation.position}
                          </p>
                        )}
                      </section>
                    )}

                    <section className="border-t border-border/50 pt-3">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Heart className="h-3.5 w-3.5 text-primary/70" />
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Patient context</p>
                      </div>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                        <div>
                          <dt className="text-[9px] uppercase tracking-wider text-muted-foreground/70">Language</dt>
                          <dd className="mt-0.5 font-medium">{currentCase.patientInfo.language}</dd>
                        </div>
                        <div>
                          <dt className="text-[9px] uppercase tracking-wider text-muted-foreground/70">Weight</dt>
                          <dd className="mt-0.5 font-medium">{currentCase.patientInfo.weight} kg</dd>
                        </div>
                        {currentCase.patientInfo.occupation && (
                          <div className="col-span-2">
                            <dt className="text-[9px] uppercase tracking-wider text-muted-foreground/70">Occupation</dt>
                            <dd className="mt-0.5 font-medium">{currentCase.patientInfo.occupation}</dd>
                          </div>
                        )}
                      </dl>
                      {currentCase.patientInfo.culturalConsiderations && currentCase.patientInfo.culturalConsiderations.length > 0 && (
                        <p className="mt-3 border-t border-border/40 pt-2.5 text-[11px] leading-relaxed text-muted-foreground">
                          <span className="font-medium text-foreground/70">Cultural note —</span> {currentCase.patientInfo.culturalConsiderations.join('. ')}
                        </p>
                      )}
                    </section>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ---- ACTION BAR ----
                Single dominant CTA + subtle secondary back link. The Begin
                Scene Survey button is the only thing the student should be
                looking for after the dispatch tile reads. */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={resetToStart}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Different case
              </button>
              <Button
                onClick={startCase}
                size="lg"
                className="gap-2 rounded-full px-6 sm:px-8 h-11 sm:h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-0.5 text-sm sm:text-base"
              >
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                Begin Scene Survey
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 2.5: Scene Survey (between Pre-Brief and Active Case)
            Hard-gated walkthrough — hazard ID, scene safety declaration,
            PPE selection, general impression. Pre-arrival, so case clock
            doesn't start until "Enter Scene" is pressed. */}
        {/* ================================================================ */}
        {phase === 'scene-survey' && currentCase && (
          <SceneSurveyPanel
            caseData={currentCase}
            onBack={() => setPhase('prebriefing')}
            onEnterScene={(survey) => {
              setSceneSurvey(survey);
              enterScene();
            }}
          />
        )}

        {/* ================================================================ */}
        {/* PHASE 3: Vitals & Treatment (Active Case)
            Rendered whenever a case is live (vitals OR case-details phase)
            and hidden with CSS when the student jumps to Case Details —
            keeps the monitor mounted so its internal power/boot/visible-
            vitals state doesn't reset on tab switch. Returning to the
            monitor view then feels instant, not like a cold boot. */}
        {/* ================================================================ */}
        {(phase === 'vitals' || phase === 'case') && currentCase && (
          <div className={`live-management-shell animate-fade-in space-y-3 sm:space-y-4 ${phase !== 'vitals' ? 'hidden' : ''}`}>
            {/* ===== TOP: Patient Banner (full width) ===== */}
            <div className="live-patient-banner glass-panel p-3 sm:p-4 rounded-xl space-y-3 overflow-hidden shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/15 to-emerald-500/10 shrink-0 border border-cyan-300/30">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">{getStudentCaseTitle(currentCase)}</h2>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {currentCase.dispatchInfo.location}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <NarrationButton
                    role="dispatcher"
                    size="md"
                    label="Replay dispatch briefing"
                    text={buildDispatchNarration(currentCase)}
                  />
                  {/* Persistent pain readout - once scored under SAMPLE,
                      carries through the case on the header for handover. */}
                  {currentVitals?.painScore !== undefined && (
                    <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border shrink-0 ${
                      currentVitals.painScore >= 7
                        ? 'bg-red-500/10 dark:bg-red-500/15 border-red-500/30'
                        : currentVitals.painScore >= 4
                          ? 'bg-orange-500/10 dark:bg-orange-500/15 border-orange-500/30'
                          : currentVitals.painScore > 0
                            ? 'bg-yellow-500/10 dark:bg-yellow-500/15 border-yellow-500/30'
                            : 'bg-green-500/10 dark:bg-green-500/15 border-green-500/30'
                    }`} title="Pain score - reassess periodically">
                      <span className="text-[9px] sm:text-[10px] font-mono font-semibold opacity-70">PAIN</span>
                      <span className={`font-mono text-[11px] sm:text-sm font-bold ${
                        currentVitals.painScore >= 7 ? 'text-red-600 dark:text-red-400'
                        : currentVitals.painScore >= 4 ? 'text-orange-600 dark:text-orange-400'
                        : currentVitals.painScore > 0 ? 'text-yellow-700 dark:text-yellow-400'
                        : 'text-green-700 dark:text-green-400'
                      }`}>{currentVitals.painScore}/10</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-primary/10 dark:bg-primary/15 border border-primary/20 shrink-0">
                    <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                    <span className="font-mono text-[11px] sm:text-sm font-semibold text-primary">{formatTime(elapsedSeconds)}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPhase('case')}
                  className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg h-8 dark:border-slate-700"
                >
                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Case </span>Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMedicalControl(true)}
                  className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg h-8 border-cyan-500/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10"
                >
                  <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Call </span>Med Control
                </Button>
                <Button
                  size="sm"
                  onClick={() => endCase('transport')}
                  className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm h-8"
                >
                  <Ambulance className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Transport
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => endCase('end')}
                  className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg shadow-sm h-8"
                >
                  <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">End </span>Care
                </Button>
              </div>
            </div>

            {/* ===== Scene Toggle ===== */}
            <button
              onClick={() => setShowScene(!showScene)}
              className={`live-scene-toggle w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-xl border transition-all font-semibold ${
                showScene
                  ? 'border-cyan-400/50 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200'
                  : 'border-border/70 bg-white/50 text-foreground hover:border-amber-400/60 hover:bg-amber-50/60 dark:bg-white/[0.04] dark:hover:bg-amber-950/20'
              }`}
            >
              <Shield className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="flex-1 text-left">
                <span className="block text-xs sm:text-sm">{showScene ? 'Hide scene details' : 'Review scene details'}</span>
                <span className="block text-[10px] font-normal text-muted-foreground">
                  Scene survey complete. Timer is running.
                </span>
              </span>
              {showScene ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showScene && (
              <div className="live-scene-details glass-panel p-3 rounded-xl text-xs space-y-2 animate-fade-in">
                <p className="leading-relaxed">{getScenePresentationDescription(currentCase)}</p>
                {sceneSurvey && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-border/40 bg-white/55 p-2 dark:bg-white/[0.05]">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">PPE</p>
                      <p className="mt-0.5 truncate text-[11px]">{sceneSurvey.ppeSelected.join(', ') || 'Not documented'}</p>
                    </div>
                    <div className="rounded-lg border border-border/40 bg-white/55 p-2 dark:bg-white/[0.05]">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Resources</p>
                      <p className="mt-0.5 truncate text-[11px]">{sceneSurvey.additionalResourcesRequested.join(', ') || 'None requested'}</p>
                    </div>
                    <div className="rounded-lg border border-border/40 bg-white/55 p-2 dark:bg-white/[0.05]">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Impression</p>
                      <p className="mt-0.5 truncate text-[11px]">{sceneSurvey.generalImpression.join(', ') || 'Not documented'}</p>
                    </div>
                  </div>
                )}
                {currentCase.sceneInfo.hazards && currentCase.sceneInfo.hazards.length > 0 && (
                  <div className="bg-red-500/8 border border-red-500/15 rounded-lg p-2.5">
                    <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 mb-1 uppercase tracking-wider">Hazards</p>
                    <ul className="space-y-0.5">
                      {currentCase.sceneInfo.hazards.map((h, i) => (
                        <li key={i} className="text-red-700 dark:text-red-400 flex items-start gap-1.5">
                          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />{h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {currentCase.sceneInfo.bystanders && (
                  <p className="text-muted-foreground">Bystanders: {currentCase.sceneInfo.bystanders}</p>
                )}
              </div>
            )}

            <div className="live-progress-grid grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([
                {
                  label: 'Primary survey',
                  value: `${['airway', 'breathing', 'circulation', 'disability', 'exposure'].filter(stepId => assessmentTracker?.performed.some(p => p.stepId === stepId)).length}/5`,
                  hint: 'ABCDE',
                  Icon: Shield,
                },
                {
                  label: 'Anatomy exam',
                  value: `${assessmentTracker?.performed.filter(p => p.phase === 'secondary').length || 0} regions`,
                  hint: '3D patient',
                  Icon: Stethoscope,
                },
                {
                  label: 'Monitor',
                  value: `${monitorRevealedVitals.size} revealed`,
                  hint: 'Reassess',
                  Icon: Activity,
                },
                {
                  label: 'Treatment',
                  value: `${appliedTreatments.length} applied`,
                  hint: 'Treat and check',
                  Icon: Syringe,
                },
              ]).map(item => (
                <div key={item.label} className="live-progress-card flex items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-3 py-2 shadow-sm">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <item.Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold">{item.label}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{item.value} - {item.hint}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Transport Decision Dialog */}
            {/* Transport Decision Wizard — Step-by-step */}
            {showTransportDecision && (
              <div className="transport-decision-backdrop" role="dialog" aria-modal="true" aria-label="Transport and end-care decision">
              <Card className="transport-decision-dialog border-2 border-amber-400 bg-amber-50 dark:bg-amber-950 rounded-2xl overflow-y-auto animate-fade-in">
                <CardHeader className="pb-2 border-b border-amber-200 dark:border-amber-800">
                  <CardTitle className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-base sm:text-lg font-bold">
                      <Ambulance className="h-5 w-5 text-amber-600" />
                      Transport & Handover
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                      {[
                        { step: 1, label: 'Priority' },
                        { step: 2, label: 'Position' },
                        { step: 3, label: 'Pre-Alert' },
                        { step: 4, label: 'Diagnosis' },
                        { step: 5, label: 'Confirm' },
                      ].map(({ step: s, label }, idx) => (
                        <div key={s} className="flex items-center gap-1 sm:gap-1.5">
                          <div className="flex flex-col items-center gap-0.5">
                            <div className={`h-2 w-7 sm:w-8 rounded-full transition-all ${
                              s < transportStep ? 'bg-green-500'
                              : s === transportStep ? 'bg-amber-500'
                              : 'bg-border/40'
                            }`} />
                            <span className={`text-xs sm:text-sm leading-tight transition-colors ${
                              s === transportStep ? 'text-amber-600 dark:text-amber-400 font-bold' : s < transportStep ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground/60'
                            }`}>{label}</span>
                          </div>
                          {idx < 4 && (
                            <span className={`text-xs sm:text-sm mt-[-0.5rem] ${
                              s < transportStep ? 'text-green-500' : 'text-muted-foreground/40'
                            }`}>›</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">

                  {/* Mini-summary bar — shows completed decisions at a glance */}
                  {transportStep > 1 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 px-2.5 py-1.5 rounded-lg bg-white/60 dark:bg-black/20 border border-border/30 text-[10px] text-muted-foreground animate-fade-in">
                      {transportDecisions?.priority && (
                        <span>
                          <span className="font-semibold text-foreground/80">Priority:</span>{' '}
                          {transportDecisions.priority === 'lights' ? 'Lights & Sirens' : transportDecisions.priority === 'urgent' ? 'Urgent' : 'Routine'}
                        </span>
                      )}
                      {transportDecisions?.position && (
                        <span>
                          <span className="font-semibold text-foreground/80">Position:</span>{' '}
                          {transportDecisions.position}
                        </span>
                      )}
                      {transportStep > 3 && transportDecisions?.preAlert !== undefined && transportDecisions?.priority && (
                        <span>
                          <span className="font-semibold text-foreground/80">Pre-Alert:</span>{' '}
                          {transportDecisions.preAlert ? 'Yes' : 'No'}
                        </span>
                      )}
                      {transportDecisions?.destination && (
                        <span>
                          <span className="font-semibold text-foreground/80">Dest:</span>{' '}
                          {transportDecisions.destination}
                        </span>
                      )}
                      {transportDecisions?.provisionalDiagnosis && (
                        <span>
                          <span className="font-semibold text-foreground/80">Dx:</span>{' '}
                          {transportDecisions.provisionalDiagnosis}
                        </span>
                      )}
                    </div>
                  )}

                  {/* STEP 1: Transport Priority */}
                  {transportStep === 1 && (
                    <div className="animate-fade-in">
                      <p className="text-base sm:text-xl font-bold mb-1">How do you want to transport this patient?</p>
                      <p className="text-xs text-muted-foreground mb-3">Select the transport priority based on the patient's condition.</p>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { value: 'lights', label: '🚨 Lights & Sirens', desc: 'Time-critical — life-threatening condition requiring immediate hospital intervention', color: 'border-red-400 bg-red-50 dark:bg-red-950/20' },
                          { value: 'urgent', label: '⚡ Urgent (No L&S)', desc: 'Serious condition requiring prompt transport but stable enough for normal driving', color: 'border-amber-400 bg-amber-50 dark:bg-amber-950/20' },
                          { value: 'routine', label: '🟢 Routine', desc: 'Stable patient — standard safe transport, no time pressure', color: 'border-green-400 bg-green-50 dark:bg-green-950/20' },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setTransportDecisions(prev => ({ ...prev || { priority: '', position: '', preAlert: false, destination: '', provisionalDiagnosis: '' }, priority: opt.value }));
                              setTransportStep(2);
                            }}
                            className={`p-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${opt.color}`}
                          >
                            <p className="text-sm font-semibold">{opt.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Patient Position */}
                  {transportStep === 2 && (
                    <div className="animate-fade-in">
                      <p className="text-sm font-bold mb-1">What position should the patient be transported in?</p>
                      <p className="text-xs text-muted-foreground mb-3">Choose the most appropriate position for this patient's condition.</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { pos: 'Supine', desc: 'Flat on back — trauma, spinal precautions' },
                          { pos: 'Semi-Fowlers (30-45°)', desc: 'Head elevated — cardiac, respiratory' },
                          { pos: 'Left Lateral', desc: 'On left side — pregnancy, unconscious' },
                          { pos: 'Sitting Upright', desc: 'Fully upright — severe dyspnoea, CHF' },
                          { pos: 'Recovery Position', desc: 'Unconscious, breathing, no spinal risk' },
                          { pos: 'Trendelenburg', desc: 'Legs elevated — shock, hypotension' },
                        ].map(({ pos, desc }) => (
                          <button
                            key={pos}
                            onClick={() => {
                              setTransportDecisions(prev => ({ ...prev || { priority: '', position: '', preAlert: false, destination: '', provisionalDiagnosis: '' }, position: pos }));
                              setTransportStep(3);
                            }}
                            className="p-2.5 rounded-xl border-2 border-border/30 text-left transition-all hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:shadow-md"
                          >
                            <p className="text-xs font-semibold">{pos}</p>
                            <p className="text-[9px] text-muted-foreground">{desc}</p>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setTransportStep(1)} className="text-[10px] text-muted-foreground mt-2 hover:underline">← Back</button>
                    </div>
                  )}

                  {/* STEP 3: Pre-Alert & Destination */}
                  {transportStep === 3 && (
                    <div className="animate-fade-in space-y-4">
                      <div>
                        <p className="text-sm font-bold mb-1">Will you pre-alert the hospital?</p>
                        <p className="text-xs text-muted-foreground mb-3">Pre-alerting gives the receiving team time to prepare.</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setTransportDecisions(prev => ({ ...prev || { priority: '', position: '', preAlert: false, destination: '', provisionalDiagnosis: '' }, preAlert: true }))}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              transportDecisions?.preAlert === true ? 'border-red-400 bg-red-50 dark:bg-red-950/20 ring-2 ring-red-400/30' : 'border-border/30 hover:border-red-400'
                            }`}
                          >
                            <p className="text-xs font-semibold">📞 Yes — Pre-Alert</p>
                            <p className="text-[9px] text-muted-foreground">Notify hospital of incoming patient</p>
                          </button>
                          <button
                            onClick={() => setTransportDecisions(prev => ({ ...prev || { priority: '', position: '', preAlert: false, destination: '', provisionalDiagnosis: '' }, preAlert: false }))}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              transportDecisions?.preAlert === false && transportDecisions?.priority ? 'border-green-400 bg-green-50 dark:bg-green-950/20 ring-2 ring-green-400/30' : 'border-border/30 hover:border-green-400'
                            }`}
                          >
                            <p className="text-xs font-semibold">No Pre-Alert</p>
                            <p className="text-[9px] text-muted-foreground">Standard arrival, no advance notice</p>
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold mb-1">Where are you transporting to?</p>
                        <div className="grid grid-cols-2 gap-2">
                          {['Nearest ED', 'Trauma Centre', 'Cardiac Centre (PCI)', 'Stroke Centre', 'Burns Unit', 'Paediatric ED'].map(dest => (
                            <button
                              key={dest}
                              onClick={() => setTransportDecisions(prev => ({ ...prev || { priority: '', position: '', preAlert: false, destination: '', provisionalDiagnosis: '' }, destination: dest }))}
                              className={`p-2 rounded-lg border text-xs text-left transition-all ${
                                transportDecisions?.destination === dest ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20 font-semibold ring-1 ring-amber-400/30' : 'border-border/30 hover:border-amber-400'
                              }`}
                            >
                              {dest}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <button onClick={() => setTransportStep(2)} className="text-[10px] text-muted-foreground hover:underline">← Back</button>
                        <Button
                          size="sm"
                          onClick={() => setTransportStep(4)}
                          disabled={!transportDecisions?.destination}
                          className="rounded-lg gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs"
                        >
                          Next <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Provisional Diagnosis */}
                  {transportStep === 4 && (
                    <div className="animate-fade-in">
                      <p className="text-sm font-bold mb-1">
                        {session?.isConditionSelected && session?.selectedCondition
                          ? `What is the underlying cause of this ${session.selectedCondition}?`
                          : 'What is your provisional diagnosis?'}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {session?.isConditionSelected
                          ? 'You know the general condition — now identify the specific underlying cause.'
                          : 'Based on your assessment, what do you think is wrong with this patient?'}
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {currentCase.expectedFindings?.differentialDiagnoses
                          ? [...seededShuffle(currentCase.expectedFindings.differentialDiagnoses.slice(0, 5), currentCase.id),
                             'Other / Undifferentiated'
                          ].map(dx => (
                            <button
                              key={dx}
                              onClick={() => {
                                setTransportDecisions(prev => ({ ...prev || { priority: '', position: '', preAlert: false, destination: '', provisionalDiagnosis: '' }, provisionalDiagnosis: dx }));
                                setTransportStep(5);
                              }}
                              className="p-2.5 rounded-lg border text-xs text-left transition-all border-border/30 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                            >
                              {dx}
                            </button>
                          ))
                          : <p className="text-xs text-muted-foreground">No options available</p>
                        }
                      </div>
                      <button onClick={() => setTransportStep(3)} className="text-[10px] text-muted-foreground mt-2 hover:underline">← Back</button>
                    </div>
                  )}

                  {/* STEP 5: Confirm Summary */}
                  {transportStep === 5 && (
                    <div className="animate-fade-in space-y-3">
                      <p className="text-sm font-bold mb-2">Confirm your decisions</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/60 dark:bg-black/20 border border-border/30 text-xs">
                          <span className="text-muted-foreground">Priority:</span>
                          <span className="font-semibold">{transportDecisions?.priority === 'lights' ? '🚨 Lights & Sirens' : transportDecisions?.priority === 'urgent' ? '⚡ Urgent' : '🟢 Routine'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/60 dark:bg-black/20 border border-border/30 text-xs">
                          <span className="text-muted-foreground">Position:</span>
                          <span className="font-semibold">{transportDecisions?.position}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/60 dark:bg-black/20 border border-border/30 text-xs">
                          <span className="text-muted-foreground">Pre-Alert:</span>
                          <span className="font-semibold">{transportDecisions?.preAlert ? '📞 Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/60 dark:bg-black/20 border border-border/30 text-xs">
                          <span className="text-muted-foreground">Destination:</span>
                          <span className="font-semibold">{transportDecisions?.destination}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-xs">
                          <span className="text-muted-foreground">Diagnosis:</span>
                          <span className="font-semibold text-blue-700 dark:text-blue-300">{transportDecisions?.provisionalDiagnosis}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <button onClick={() => setTransportStep(4)} className="text-[10px] text-muted-foreground hover:underline">← Back</button>
                        <Button
                          onClick={finalizeCase}
                          className="rounded-xl gap-2 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Confirm & End Case
                        </Button>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
              </div>
            )}

            {/* ===== SPLIT LAYOUT =====
                Mobile order: Primary Survey -> Anatomy -> Monitor -> Treatment.
                Desktop: 2-col grid with Monitor + PulseCheck sticky top-right,
                Management bottom-right, and Assessment spanning the left.
            */}
            <div className="tactical-treatment-bay" data-scene-environment={sceneEnvironment ?? undefined}>
              <div className="tactical-corner tactical-corner-tl" aria-hidden="true" />
              <div className="tactical-corner tactical-corner-tr" aria-hidden="true" />
              <div className="tactical-corner tactical-corner-bl" aria-hidden="true" />
              <div className="tactical-corner tactical-corner-br" aria-hidden="true" />

              <div className="tactical-bay-command relative z-10 border-b border-cyan-300/15 px-3 py-3 sm:px-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-white">Assess & treat</h2>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="tactical-monitor-shortcut h-7 text-xs text-cyan-100"
                        onClick={() => document.querySelector('[aria-label="Vital signs monitor"]')?.scrollIntoView({ block: 'start' })}
                      >
                        View bedside monitor
                      </Button>
                      {sceneEnvironment && (
                        <Badge variant="outline" className="border-amber-300/30 bg-amber-300/10 text-[9px] uppercase tracking-[0.16em] text-amber-100">
                          {currentCase ? sceneEnvironmentLabel(currentCase, sceneEnvironment) : null}
                        </Badge>
                      )}
                      {/* Voice-first toggle — senior students only. Junior years
                          see it disabled with an explanatory tooltip. */}
                      <button
                        type="button"
                        onClick={toggleVoiceFirst}
                        disabled={!voiceFirstAllowed}
                        aria-pressed={voiceFirstMode}
                        aria-label={
                          voiceFirstAllowed
                            ? t('voice.firstMode', { defaultValue: 'Voice-first mode' })
                            : t('voice.firstModeGated', { defaultValue: 'Available for 3rd and 4th year students' })
                        }
                        title={
                          voiceFirstAllowed
                            ? t('voice.firstMode', { defaultValue: 'Voice-first mode' })
                            : t('voice.firstModeGated', { defaultValue: 'Available for 3rd and 4th year students' })
                        }
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] transition-colors',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-1',
                          !voiceFirstAllowed
                            ? 'cursor-not-allowed border-white/10 bg-white/5 text-white/30'
                            : voiceFirstMode
                            ? 'border-cyan-300/60 bg-cyan-400/20 text-cyan-100'
                            : 'border-cyan-300/25 bg-cyan-300/5 text-cyan-100/70 hover:bg-cyan-300/10',
                        )}
                      >
                        {voiceFirstMode ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                        {t('voice.firstModeShort', { defaultValue: 'Voice-first' })}
                      </button>
                    </div>
                  </div>

                  {/* Header vitals strip — gated. These are bedside monitor
                      readings (HR/SpO2/RR numbers), not impressions a student
                      can see at a glance. They only count once the student has
                      applied the corresponding measurement, and this summary
                      only exists below 1440px anyway (the full monitor sits
                      beside the patient at wide widths). Until then we show
                      the clinical first-look instead. */}
                  {(() => {
                    const hrGained = readOnly || monitorRevealedVitals.has('pulse') || !!lastPulseAssessment;
                    const spo2Gained = readOnly || monitorRevealedVitals.has('spo2');
                    const rrGained = readOnly || monitorRevealedVitals.has('respiration');
                    const vitalsWon = hrGained && spo2Gained && rrGained;
                    return (
                      <div className="tactical-bay-vitals grid grid-cols-3 gap-2" role="group" aria-label={vitalsWon ? 'Live vital signs summary' : 'Initial impressions — power on the monitor to measure vital signs'}>
                        <div className="tactical-hud-tile" data-channel="hr">
                          <HUDValue
                            label={vitalsWon ? 'HR' : (lastPulseAssessment ? 'Pulse' : 'Look')}
                            value={vitalsWon ? (currentVitals?.pulse ?? '--') : (lastPulseAssessment ? (lastPulseAssessment.palpable ? `~${Math.round(currentVitals?.pulse ?? 0)}` : 'Absent') : 'Observe')}
                            unit={vitalsWon ? 'bpm' : ''}
                            critical={vitalsWon && currentVitals != null && (currentVitals.pulse < 50 || currentVitals.pulse > 130)}
                          />
                        </div>
                        <div className="tactical-hud-tile" data-channel="spo2">
                          <HUDValue
                            label={vitalsWon ? 'SpO2' : 'Breathing'}
                            value={vitalsWon ? (currentVitals?.spo2 ?? '--') : 'Listen'}
                            unit={vitalsWon ? '%' : ''}
                            critical={vitalsWon && currentVitals != null && currentVitals.spo2 < 90}
                            warning={vitalsWon && currentVitals != null && currentVitals.spo2 < 94}
                          />
                        </div>
                        <div className="tactical-hud-tile">
                          <HUDValue
                            label={vitalsWon ? 'RR' : 'Measure'}
                            value={vitalsWon ? (currentVitals?.respiration ?? '--') : 'Monitor'}
                            unit={vitalsWon ? '/min' : ''}
                            critical={vitalsWon && currentVitals != null && (currentVitals.respiration < 8 || currentVitals.respiration > 30)}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>

	                <div className="mt-2 text-[11px]">
	                  <div className="tactical-objective-chip">
	                    <Shield className="h-3.5 w-3.5" />
                    <span>{deriveLivePatientAppearance(currentCase, currentVitals, patientState)}</span>
                  </div>
	                </div>

	                {/* Coaching hint — compact in-bay comms strip, so it supports the
	                    first-person treatment flow without pushing the patient stage
	                    down the page. */}
	                {hintVisible && currentHint && (
	                  <details className="mt-2 text-xs text-cyan-100/85">
	                    <summary className="w-fit cursor-pointer rounded px-1 py-1 focus-visible:outline focus-visible:outline-2">Clinical coaching hint</summary>
	                    <p className="mt-1 max-w-3xl leading-relaxed">{currentHint}</p>
	                  </details>
	                )}

		              </div>

              <div className="tactical-bay-workspace relative z-10">

              {/* ===== FIRST-PERSON PATIENT VIEWPORT ===== */}
              {assessmentTracker && (
                <div className="tactical-patient-viewport tactical-patient-stage order-1">
                  <div className="tactical-reticle" aria-hidden="true" />
	                  <div className="tactical-viewport-label" aria-hidden="true">
	                    <span>body cam</span>
	                    <strong>{activeManagementTab.toUpperCase()}</strong>
	                  </div>
	                  <Suspense fallback={<LoadingCard />}>
                    <Body3DModel
                      key={currentCase.id}
                      onRegionClick={handlePerformAssessment}
                      assessedRegions={new Set(
                        assessmentTracker.performed
                          .filter(p => p.phase === 'secondary')
                          .map(p => p.stepId)
                      )}
                      caseData={currentCase}
                      patientSounds={patientState?.sounds}
                      isStudentView={true}
                      caseCategory={currentCase.category}
                      appliedTreatmentIds={appliedTreatmentIds}
                      patientVisualState={patientVisualState}
                      isInArrest={patientState?.isInArrest ?? false}
                      vitals={currentVitals ?? undefined}
                      onSceneReady={handlePatientSceneReady}
                      onPulse={runPulseCheck}
                      treatmentBayMode
                      onRequestTreat={(hint) => {
                        // FIND EQUIPMENT: open the matching jump bag. Scene kit
                        // taps show the open inventory; O₂ / search hints stage
                        // the device so find → bag → treat stays one gesture.
                        setCareRailMode('treat');
                        const reason = hint?.reason ?? '';
                        const tab = hint?.managementTab;
                        const requestedBag = tab === 'breathing' || tab === 'airway' || tab === 'circulation' || tab === 'disability' || tab === 'exposure' || tab === 'medications' || tab === 'transport'
                          ? tab
                          : reason.startsWith('bay:')
                            ? managementTabForBayEquipment(reason.slice(4) as BayEquipmentFocus)
                            : currentCase
                              ? recommendedManagementTabForCase(currentCase)
                              : 'breathing';
                        setActiveManagementTab(requestedBag);
                        setOpenManagementBag(requestedBag);

                        if (typeof hint?.search === 'string' && hint.search.length > 0) {
                          setMedSearch(hint.search);
                        } else if (reason.startsWith('bay:')) {
                          setMedSearch(searchHintForBayEquipment(reason.slice(4) as BayEquipmentFocus));
                        } else if (reason === 'scene-kit') {
                          setMedSearch('');
                        } else if (
                          (tab === 'breathing' || !tab)
                          && currentCase
                          && (currentCase.category === 'respiratory' || currentCase.category === 'thoracic')
                        ) {
                          // Stage first-line bronchodilator; oxygen remains one tap away in Find in kit.
                          setMedSearch('Salbutamol');
                        }

                        requestAnimationFrame(() => {
                          document.querySelector('.tactical-management-options')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          if (!(typeof hint?.search === 'string' && hint.search.length > 0)) {
                            document.querySelector('[data-equipment-inventory="true"]')
                              ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }
                        });
                      }}
                    />
                  </Suspense>
                </div>
              )}

              {/* ===== MANAGEMENT SUPPORT COLUMN (Treatment first, then assessment) ===== */}
              <div className="tactical-assessment-rail order-3 space-y-4">
                <div className="care-rail-mode-switch" role="tablist" aria-label="Patient management mode">
                  {([
                    ['assess', 'Assess'],
                    ['treat', 'Treat'],
                    ['history', 'History'],
                  ] as const).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      role="tab"
                      aria-selected={careRailMode === mode}
                      onClick={() => setCareRailMode(mode)}
                      className={careRailMode === mode ? 'care-rail-mode-active' : ''}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {/* Voice-first mode hides the tap-based jump bag — the student
                    treats hands-free via the mic. */}
                {!voiceFirstMode && careRailMode === 'treat' && (
                <HUDTreatmentBags className="tactical-loadout-dock tactical-management-options">
                  <TreatmentJumpBagPanel
                    caseData={currentCase}
                    currentVitals={currentVitals}
                    appliedTreatments={appliedTreatments}
                    appliedTreatmentIds={appliedTreatmentIds}
                    applyingTreatmentId={applyingTreatmentId}
                    patientState={patientState}
                    activeManagementTab={activeManagementTab}
                    setActiveManagementTab={setActiveManagementTab}
                    openManagementBag={openManagementBag}
                    setOpenManagementBag={setOpenManagementBag}
                    medSearch={medSearch}
                    setMedSearch={setMedSearch}
                    applyTreatment={applyTreatment}
                  />
                </HUDTreatmentBags>
                )}

                {careRailMode === 'assess' && (
                  <>
                {/* PRIMARY SURVEY FIRST — the ABCDE grid is the clinical spine
                    of the assessment and must be the first thing the student
                    sees; the anatomy reference panel is a map, secondary, and
                    renders beneath it. */}
                {!voiceFirstMode && (
                <HUDAssessment
                  title="Primary Survey — tap A–E to assess"
                  code="ABCDE"
                  progress={`${['airway', 'breathing', 'circulation', 'disability', 'exposure'].filter(stepId => assessmentTracker?.performed.some(p => p.stepId === stepId)).length}/5`}
                  className="primary-survey-priority"
                >
                  <div className="p-3 sm:p-4 space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { label: 'First Look', value: currentCase.initialPresentation?.generalImpression || currentCase.dispatchInfo?.callReason || 'Form a general impression' },
                        { label: 'Position', value: currentCase.initialPresentation?.position || 'Observe patient position' },
                        { label: 'Visible Cues', value: currentCase.initialPresentation?.appearance || 'Scan skin, work of breathing, bleeding' },
                      ].map(item => (
                        <div key={item.label} className="rounded-xl border border-slate-600/70 bg-slate-900/90 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-cyan-200">{item.label}</p>
                          <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {/* ABCDE grid — Scene Safety/BSI is intentionally
                        absent here because it's already performed and
                        scored in the Scene Survey phase before the case
                        clock starts. Duplicating it as an in-case action
                        would reward the same skill twice and contradict
                        real practice (you don't reassess scene safety
                        from inside the back of the truck). */}
                    <div className="primary-survey-compact-grid grid grid-cols-5 gap-1.5 sm:gap-2">
                      {([
                        { key: 'airway' as const,       letter: 'A', label: 'Airway',     stepId: 'airway' as AssessmentStepId,       rail: 'from-amber-400 to-orange-500',  glow: 'shadow-[0_0_20px_-4px_rgb(251_146_60/0.45)]', text: 'text-amber-700 dark:text-amber-300' },
                        { key: 'breathing' as const,    letter: 'B', label: 'Breathing',  stepId: 'breathing' as AssessmentStepId,    rail: 'from-sky-400 to-cyan-500',      glow: 'shadow-[0_0_20px_-4px_rgb(56_189_248/0.45)]', text: 'text-sky-700 dark:text-sky-300' },
                        { key: 'circulation' as const,  letter: 'C', label: 'Circulation',stepId: 'circulation' as AssessmentStepId,  rail: 'from-rose-400 to-red-500',      glow: 'shadow-[0_0_20px_-4px_rgb(251_113_133/0.45)]',text: 'text-rose-700 dark:text-rose-300' },
                        { key: 'disability' as const,   letter: 'D', label: 'Disability', stepId: 'disability' as AssessmentStepId,   rail: 'from-indigo-400 to-blue-500', glow: 'shadow-[0_0_20px_-4px_rgb(96_165_250/0.45)]',text: 'text-blue-700 dark:text-blue-300' },
                        { key: 'exposure' as const,     letter: 'E', label: 'Exposure',   stepId: 'exposure' as AssessmentStepId,     rail: 'from-emerald-400 to-teal-500',  glow: 'shadow-[0_0_20px_-4px_rgb(52_211_153/0.45)]', text: 'text-emerald-700 dark:text-emerald-300' },
                      ]).map(item => {
                        const isAssessed = assessmentTracker?.performed.some(p => p.stepId === item.stepId);
                        const isActive = activePrimarySurvey === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => {
                              handlePerformAssessment(item.stepId);
                              setActivePrimarySurvey(isActive ? null : item.key);
                            }}
                            className={`primary-survey-button group relative flex flex-col items-center justify-center min-h-[58px] sm:min-h-[70px] pt-3 pb-2 px-1 rounded-xl bg-slate-900/95 backdrop-blur-sm border transition-all duration-300 touch-manipulation hover:-translate-y-0.5 hover:border-cyan-300/70 ${isActive ? `${item.glow} border-cyan-300/90 bg-slate-800 ring-1 ring-cyan-300/40` : isAssessed ? 'border-emerald-400/50' : 'border-cyan-300/30'}`}
                          >
                            {/* Jewel-tone rail: visible at low opacity at rest, bright when active */}
                            <span className={`absolute inset-x-3 top-0 h-[3px] rounded-full bg-gradient-to-r ${item.rail} transition-opacity duration-300 ${isActive ? 'opacity-100' : isAssessed ? 'opacity-90' : 'opacity-75 group-hover:opacity-100'}`} />
                            {/* Status LED */}
                            <span className={`absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full transition-colors ${isAssessed ? 'bg-emerald-400 shadow-[0_0_6px_rgb(52_211_153/0.8)]' : 'bg-white/20'}`} />
                             {/* Letter — thin, large, premium */}
                             <span className={`primary-survey-letter text-xl sm:text-2xl font-light tracking-tight leading-none ${isActive ? item.text : 'text-white'}`}>
                               {item.letter}
                             </span>
                             {/* Label — tiny spaced-out uppercase */}
                             <span className={`primary-survey-label text-[8px] sm:text-[9px] font-semibold tracking-[0.12em] uppercase mt-1 ${isActive ? item.text : 'text-slate-50'}`}>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {/* Chapter-style findings reveal */}
                    {activePrimarySurvey && activeFindings && activeFindings.stepId === activePrimarySurvey && (
                      <div className="relative overflow-hidden rounded-xl border border-cyan-300/25 bg-slate-950/82 backdrop-blur-sm shadow-inner animate-in slide-in-from-top-2 fade-in-50 duration-500">
                        <div className="border-b border-cyan-300/15 bg-cyan-950/20 px-4 py-3">
                          <p className="text-[9px] font-semibold tracking-[0.25em] uppercase text-cyan-200">Findings</p>
                          <h3 className="mt-0.5 text-base font-semibold tracking-tight text-white capitalize">
                            {activePrimarySurvey.replace(/-/g, ' ')}
                          </h3>
                        </div>
                        <div className="p-4 space-y-2">
                          {activeFindings.findings.map((f, i) => (
                            <div key={i} className="group relative pl-3">
                              <span className="absolute left-0 top-1.5 h-1 w-1 rounded-full bg-cyan-300/70" />
                              <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-slate-300">{f.label}</p>
                              <p className="mt-0.5 font-mono text-[11px] leading-relaxed text-white sm:text-xs">{f.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </HUDAssessment>
                )}

                <RoadmapAnatomyPanel
                  visualState={patientVisualState}
                  activeFindings={activeFindings}
                  assessedCount={assessmentTracker?.performed.filter(p => p.phase === 'secondary').length ?? 0}
                />

                {realismDirector && (
                  <details className="clinical-reality-disclosure">
                    <summary>Clinical reality and reassessment cues</summary>
                    <div className="mt-2">
                      <RealismDirectorCard state={realismDirector} />
                    </div>
                  </details>
                )}
                  </>
                )}

                {/* Injury Map (up-front findings list) intentionally REMOVED
                    from the student view — listing findings before assessment
                    spoils the discovery that IS the assessment skill. Findings
                    now reveal ON the 3D body only once the student examines the
                    region (see RevealedFindingMarkers in Body3DModel). The
                    InjuryMap component is retained for a future debrief/
                    instructor summary surface. */}

                {/* 3D physical examination is rendered above in the tactical
                    viewport (single Body3DModel instance) — the older inline
                    placement here was removed to avoid a duplicate 3D model. */}
                {/* --- HISTORY (voice-driven) ---
                    The old SAMPLE letter grid was replaced with a live
                    spoken conversation: student presses mic, asks any
                    history question, classifier maps it to SAMPLE/OPQRST,
                    patient (or bystander when unconscious) answers via
                    Supertonic. Coverage chips track which SAMPLE letters
                    have been obtained for debrief scoring. */}
                <div hidden={careRailMode !== 'history'}>
                {currentCase && (
                  <VoiceHistoryPanel
                    key={`${currentCase.id}-${caseStartTime}`}
                    caseData={currentCase}
                    currentVitals={currentVitals}
                    isInArrest={patientState?.isInArrest}
                    appliedTreatmentIds={appliedTreatmentIds}
                    isActive={careRailMode === 'history'}
                    onCategoryObtained={(cat: HistoryCategory) => {
                      // Map voice categories back to the legacy tracker step IDs
                      // so the existing scoring / progress logic keeps working.
                      const stepId: AssessmentStepId | null = (() => {
                        switch (cat) {
                          case 'signs-symptoms': return 'signs-symptoms';
                          case 'allergies': return 'allergies';
                          case 'medications': return 'medications';
                          case 'past-medical': return 'past-medical';
                          case 'last-meal': return 'last-meal';
                          case 'events': return 'events-leading';
                          // All OPQRST categories roll up under signs-symptoms
                          case 'opqrst-onset':
                          case 'opqrst-provocation':
                          case 'opqrst-quality':
                          case 'opqrst-region':
                          case 'opqrst-radiation':
                          case 'opqrst-severity':
                          case 'opqrst-time':
                          case 'pain-current':
                            return 'signs-symptoms';
                          default:
                            return null;
                        }
                      })();
                      if (stepId) handlePerformAssessment(stepId);
                    }}
                    footer={(voiceApi) => (
                      // Pain severity (OPQRST "S") folded INTO history-taking —
                      // a compact row in the history card footer rather than a
                      // separate card. Asking MUST drive patient speech + jaw
                      // (viseme_open) — silent score reveal failed Criterion 4.
                      <div className="border-t border-border/40 px-4 py-3">
                        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">Pain · OPQRST severity</p>
                        {(() => {
                          // Pain is HISTORY, not a dial: ask the patient and they report
                          // it (revealing the case's authored severity). If they can't
                          // self-report (reduced GCS), prompt non-verbal assessment instead.
                          const gcs = currentVitals?.gcs ?? 15;
                          const canSelfReport = voiceApi.canVocalize;
                          const revealed = monitorRevealedVitals.has('painScore');
                          const p = currentVitals?.painScore;
                          if (revealed && p !== undefined) {
                            const sev = p === 0 ? 'no pain' : p <= 3 ? 'mild' : p <= 6 ? 'moderate' : 'severe';
                            return (
                              <p className="text-[11px] text-foreground/75">
                                Patient reports <span className="font-semibold tabular-nums">{p}/10</span> — {sev}.
                              </p>
                            );
                          }
                          if (revealed && p === undefined) {
                            return (
                              <p className="text-[11px] text-foreground/75">
                                {voiceApi.responseContext.breathless
                                  ? 'Patient too breathless to give a clear number — single words / gasping only.'
                                  : 'Patient could not give a numeric pain score.'}
                              </p>
                            );
                          }
                          if (!canSelfReport) {
                            return (
                              <p className="text-[11px] text-slate-300">
                                Patient cannot self-report pain (GCS {gcs}). Look for non-verbal cues — guarding, grimacing, restlessness.
                              </p>
                            );
                          }
                          return (
                            <button
                              onClick={() => {
                                if (readOnly || !currentCase) return;
                                const authored = currentVitals?.painScore
                                  ?? currentCase.vitalSignsProgression?.initial?.painScore;
                                // Full history pipeline: bubble + broken speech + viseme.
                                voiceApi.askQuestion('What is your pain out of 10?');
                                if (typeof authored === 'number') {
                                  setCurrentVitals(prev => prev ? { ...prev, painScore: authored } : prev);
                                }
                                handlePerformAssessment('pain-assessment');
                              }}
                              className="w-full rounded-md border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-slate-900/40 px-3 py-2 text-[11px] font-medium text-foreground/75 transition-colors hover:border-primary/40 hover:text-foreground touch-manipulation"
                            >
                              Ask the patient to rate their pain (0–10)
                            </button>
                          );
                        })()}
                      </div>
                    )}
                  />
                )}

                {/* ===== SPECIAL ASSESSMENTS (contextual, driven by assessment framework) ===== */}
                {assessmentTracker && (() => {
                  // Build list of special assessment steps that are in required or recommended but not yet performed
                  const performedIds = new Set(assessmentTracker.performed.map(p => p.stepId));
                  const specialStepIds = new Set([
                    ...assessmentTracker.required.filter(id => SPECIAL_STEPS.some(s => s.id === id)),
                    ...assessmentTracker.recommended.filter(id => SPECIAL_STEPS.some(s => s.id === id)),
                  ]);
                  // Filter to only the 6 special steps that have no other UI path
                  const specialOnlyIds = new Set<AssessmentStepId>([
                    'reversible-causes', 'pediatric-assessment', 'stroke-screen',
                    'burns-assessment', 'psychiatric-assessment', 'toxicology-screen',
                  ]);
                  const visibleSteps = SPECIAL_STEPS.filter(
                    s => specialOnlyIds.has(s.id) && specialStepIds.has(s.id),
                  );
                  if (visibleSteps.length === 0) return null;

                  const iconMap: Record<string, React.ReactNode> = {
                    'Search': <ListChecks className="h-3.5 w-3.5" />,
                    'Brain': <Brain className="h-3.5 w-3.5" />,
                    'Flame': <Flame className="h-3.5 w-3.5" />,
                    'Baby': <Baby className="h-3.5 w-3.5" />,
                    'Flask': <FlaskConical className="h-3.5 w-3.5" />,
                    'HeartPulse': <HeartPulse className="h-3.5 w-3.5" />,
                    'Gauge': <Gauge className="h-3.5 w-3.5" />,
                  };

                  return (
                    <Card className="border-amber-500/30 bg-amber-500/5">
                      <CardHeader className="pb-1 pt-2 px-3">
                        <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                          <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-amber-500/15">
                            <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500" />
                          </div>
                          Special Assessments
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-2 sm:p-3">
                        <div className="flex flex-wrap gap-1.5">
                          {visibleSteps.map(step => {
                            const isPerformed = performedIds.has(step.id);
                            const isRequired = assessmentTracker.required.includes(step.id);
                            return (
                              <button
                                key={step.id}
                                onClick={() => {
                                  handlePerformAssessment(step.id);
                                  setActiveHistoryStep(null);
                                }}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 transition-all text-xs sm:text-sm ${
                                  isPerformed
                                    ? 'border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400'
                                    : 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500 hover:bg-amber-500/15 text-foreground'
                                }`}
                              >
                                <span className={isPerformed ? 'text-green-500' : 'text-amber-500'}>
                                  {iconMap[step.icon] || <Target className="h-3.5 w-3.5" />}
                                </span>
                                <span className="font-medium">{step.shortLabel}</span>
                                {isRequired && !isPerformed && (
                                  <Badge variant="outline" className="text-[8px] px-1 py-0 border-amber-500/50 text-amber-600 dark:text-amber-400">
                                    Required
                                  </Badge>
                                )}
                                {isPerformed && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                              </button>
                            );
                          })}
                        </div>
                        {/* Show findings for last clicked special assessment */}
                        {activeFindings && SPECIAL_STEPS.some(s => s.id === activeFindings.stepId && specialOnlyIds.has(s.id) && specialStepIds.has(s.id)) && (
                          <div className="mt-2 p-2.5 rounded-xl bg-muted/30 border border-border/30 animate-fade-in">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                              {ALL_STEPS[activeFindings.stepId]?.label || activeFindings.stepId} Findings
                            </p>
                            <div className="space-y-1">
                              {activeFindings.findings.map((f, i) => (
                                <div key={i} className={`text-xs p-1.5 rounded-lg border bg-muted/20 text-foreground ${
                                  f.severity === 'critical' ? 'border-red-500/40 bg-red-500/5' :
                                  f.severity === 'abnormal' ? 'border-amber-500/40 bg-amber-500/5' :
                                  'border-border/30'
                                }`}>
                                  <span className="font-medium">{f.label}:</span> {f.value}
                                  {f.significance && (
                                    <p className="text-[10px] text-muted-foreground mt-0.5 italic">{f.significance}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })()}
                </div>

                {/* Clinical Assessment Panel removed — replaced by inline ABCDE Primary Survey + 3D Physical Exam above */}
              </div>

              {/* ===== MONITOR + PULSE CHECK (sticky top-right on desktop, first on mobile) ===== */}
              <div className="tactical-monitor-rail order-2 mt-1 space-y-4 lg:mt-0 lg:sticky lg:top-16 lg:self-start">

                {/* --- LIFEPAK MONITOR --- */}
                <HUDVitals className="tactical-monitor-card" alarm={patientState?.isInArrest ?? false}>
                  <Suspense fallback={<LoadingCard />}>
                    <VitalSignsMonitor
                      physiologyMode="external"
                      initialVitals={currentVitals || buildInitialVitalsFromCase(currentCase)}
                      previousVitals={previousVitals}
                      deteriorationVitals={currentCase.vitalSignsProgression.deterioration ? ensureCompleteVitals(currentCase.vitalSignsProgression.deterioration) : undefined}
                      onVitalChange={(vitals) => {
                        const completeVitals = ensureCompleteVitals(vitals);
                        // Ignore echoes that don't change the displayed numbers —
                        // otherwise every tween frame mints a new object, re-renders
                        // the monitor, and grows vitalsHistory without bound.
                        setCurrentVitals(prev => (vitalsEqual(prev, completeVitals) ? prev : completeVitals));
                        recordVitalsSample(completeVitals);
                      }}
                      onAssessmentPerformed={(stepId) => handlePerformAssessment(stepId as AssessmentStepId)}
                      onPacerStateChange={(state) => {
                        if (onClassroomStateChange) onClassroomStateChange({ pacerState: state });
                      }}
                      onPacingCaptureConfirmed={(state) => {
                        if (readOnly) return;
                        if (appliedTreatmentIds.includes('pacing_transcutaneous')) {
                          toast.success('Mechanical capture reconfirmed', {
                            description: `${state.rate}/min palpable at ${state.output} mA. Continue BP and perfusion reassessment.`,
                            duration: 3500,
                          });
                          return;
                        }
                        const pacing = TREATMENTS.find(treatment => treatment.id === 'pacing_transcutaneous');
                        if (!pacing) return;
                        pacingCaptureBypassRef.current = true;
                        applyTreatment(pacing);
                      }}
                      overridePacerState={externalState?.pacerState}
                      // The management bay is a live working station, but the
                      // bedside monitor is a real device: it must NOT arrive
                      // already on. The student powers it on and then applies
                      // each measurement (SpO2, NIBP, ECG) themselves — the
                      // monitor's own tap-to-connect gates enforce that.
                      // Only classroom spectators (readOnly) get a lit monitor,
                      // since they cannot press the ON button.
                      autoPowerOn={readOnly}
                      caseCategory={currentCase.category}
                      caseSubcategory={currentCase.subcategory}
                      caseTitle={currentCase.title}
                      ecgFindings={currentCase.abcde?.circulation?.ecgFindings}
                      appliedTreatments={appliedTreatmentIds}
                      overrideRhythm={patientState?.currentRhythm}
                      revealedVitals={monitorRevealedVitals}
                      cprState={arrestActive ? {
                        active: arrestActive,
                        running: cprRunning,
                        timerSeconds: cprCycleTimer,
                        cycleNumber: cprCycleNumber,
                        shockCount,
                        adrenalineDoses,
                        amiodaroneDoses,
                        lastAdrenalineTime,
                        onStartCPR: () => {
                          setCprRunning(true);
                          if (cprCycleTimer <= 0) setCprCycleTimer(120);
                          setArrestTimeline(prev => [...prev, { time: Date.now(), event: 'CPR started', type: 'cpr-start' }]);
                          lastActivityRef.current = Date.now();
                        },
                        onPauseCPR: () => {
                          setCprRunning(false);
                          setArrestTimeline(prev => [...prev, { time: Date.now(), event: 'CPR paused', type: 'cpr-pause' }]);
                        },
                        onDefibrillate: (delivery) => {
                          const treatment = TREATMENTS.find(item => item.id === 'defibrillation');
                          if (treatment) applyTreatment(treatment, delivery);
                          lastActivityRef.current = Date.now();
                        },
                      } : undefined}
                    />
                  </Suspense>
                </HUDVitals>

                {/* --- PULSE CHECK + CONFIRM ARREST BUTTONS --- */}
                <div className="flex flex-col gap-2">
                  {/* Pulse is now checked on the mannequin — tap the carotid
                      (neck) or radial (wrist) point. This shows the status; the
                      arrest-confirm prompt below still triggers on 'absent'. */}
                  <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] ${
                    pulseCheckInProgress ? 'border-amber-500/50 text-amber-600'
                    : lastPulseAssessment && !lastPulseAssessment.palpable ? 'border-red-500/50 text-red-600'
                    : lastPulseAssessment?.palpable ? 'border-green-500/50 text-green-600'
                    : 'border-border/60 text-muted-foreground'
                  }`}>
                    <Heart className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {pulseCheckInProgress ? 'Checking pulse…'
                        : lastPulseAssessment ? lastPulseAssessment.summary
                        : 'Tap a labelled carotid, radial or pedal point on the patient to compare pulses'}
                    </span>
                  </div>

                  {/* Confirm Cardiac Arrest — only appears when pulse check shows absent AND arrest not yet confirmed */}
                  {lastPulseAssessment && !lastPulseAssessment.palpable && lastPulseAssessment.site.startsWith('carotid') && !arrestConfirmed && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2 text-xs font-bold animate-pulse"
                      onClick={() => {
                        setArrestConfirmed(true);
                        lastActivityRef.current = Date.now();
                      }}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Confirm Cardiac Arrest — Start Protocol
                    </Button>
                  )}
                </div>

                <TacticalCareFeed
                  items={tacticalCareFeedItems}
                  onTreat={openSuggestedTreatment}
                  onReassess={handlePerformAssessment}
                />

                {/* Live interventions — stop anything the patient is still
                    wearing/connected to. Removing it drops the device visual. */}
                {appliedTreatments.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 px-1 pt-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">In use</span>
                    {appliedTreatments.map((t) => (
                      <span
                        key={t.id}
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-800 dark:text-emerald-200"
                      >
                        {t.name || t.id}
                        <button
                          type="button"
                          aria-label={`Discontinue ${t.name || t.id}`}
                          title="Discontinue / remove"
                          className="rounded-full p-0.5 hover:bg-emerald-500/20"
                          onClick={() => discontinueTreatment(t.id)}
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <RoadmapDebriefPanel
                  items={tacticalTimelineItems}
                  currentVitals={currentVitals}
                  appliedTreatments={appliedTreatments}
                  assessmentTracker={assessmentTracker}
                />

                {/* --- Cardiac Arrest Status Bar --- */}
                {arrestActive && (
                  <div className="p-3 rounded-xl bg-red-500/10 border-2 border-red-500/30 animate-pulse-slow">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <Zap className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Cardiac Arrest Active</span>
                      <Badge variant="destructive" className="ml-auto text-[10px]">
                        {cprRunning ? `CPR ${formatTime(cprCycleTimer)}` : 'CPR Paused'}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Auscultation integrated into 3D Physical Exam — click lung/heart regions to listen */}

              <TacticalBayTimeline
                items={tacticalTimelineItems}
                elapsed={formatTime(elapsedSeconds)}
              />
              </div>
            </div>

            {pendingHandsOnTreatment && currentCase && (
              <HandsOnProcedureDialog
                open
                treatment={pendingHandsOnTreatment}
                caseData={currentCase}
                appliedTreatmentIds={appliedTreatmentIds}
                onCancel={() => setPendingHandsOnTreatment(null)}
                onComplete={handleHandsOnProcedureComplete}
              />
            )}

            {/* Defibrillation Dialog */}
            {showDefibDialog && patientState && (
              <DefibrillationDialog
                open={showDefibDialog}
                onClose={() => {
                  setShowDefibDialog(false);
                  setPendingDefibTreatment(null);
                }}
                onConfirm={handleDefibConfirm}
                currentRhythm={patientState.currentRhythm}
                currentPulse={currentVitals?.pulse || 0}
                isInArrest={patientState.isInArrest}
                padsAttached={hasAttachedDefibrillatorPads(appliedTreatmentIds)}
              />
            )}

            {/* BVM rate picker — compact, three-button. Paeds / adult / arrest. */}
            {showBvmRateDialog && (
              <Dialog open={showBvmRateDialog} onOpenChange={(o) => { if (!o) { setShowBvmRateDialog(false); setPendingBvmTreatment(null); } }}>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-primary" /> BVM ventilation rate
                    </DialogTitle>
                    <DialogDescription>
                      Choose the breaths/min you'll deliver. You can change this any time.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-2 py-2">
                    {[
                      { rate: 10, label: '10 / min — arrest (asynchronous with CPR)', sub: 'Adult in cardiac arrest; 1 breath every 6 s.' },
                      { rate: 12, label: '12 / min — adult respiratory failure', sub: 'Apnoeic adult with pulse; 1 breath every 5 s.' },
                      { rate: 20, label: '20 / min — paediatric starting rate', sub: 'Infant / child range 20–30/min; reassess pulse and visible chest rise.' },
                      { rate: 50, label: '50 / min — neonate / newborn', sub: 'Newborn range 30–60/min; reassess chest rise and heart rate.' },
                    ].map(opt => (
                      <button
                        key={opt.rate}
                        onClick={() => {
                          bvmVentilationRateRef.current = opt.rate;
                          setBvmVentilationRate(opt.rate);
                          setShowBvmRateDialog(false);
                          const t = pendingBvmTreatment;
                          setPendingBvmTreatment(null);
                          if (t) {
                            // The completed physical BVM sequence handed off to
                            // this rate picker. Preserve that one-use proof for
                            // the resumed apply call, otherwise the treatment
                            // loops back to step one instead of ventilating.
                            handsOnProcedureBypassRef.current.add(t.id);
                            setTimeout(() => applyTreatment(t), 0);
                          }
                          toast.success(`Ventilating at ${opt.rate}/min`, { duration: 2500 });
                        }}
                        className="text-left px-3 py-2 rounded-md border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <div className="font-medium text-sm">{opt.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Mechanical Ventilator Setup Dialog */}
            {showVentilatorDialog && currentCase && (
              <VentilatorSetupDialog
                open={showVentilatorDialog}
                onClose={() => setShowVentilatorDialog(false)}
                onConfirm={(settings) => {
                  setVentilatorSettings(settings);
                  confirmedVentilatorSettingsRef.current = settings;
                  setShowVentilatorDialog(false);
                  // Re-enter once with a confirmed configuration. The bypass
                  // is required on first connection; later setting changes are
                  // recognised as reconfiguration and also skip the procedure.
                  const ventTreatment = TREATMENTS.find(t => t.id === 'mechanical_ventilation');
                  if (ventTreatment) {
                    handsOnProcedureBypassRef.current.add(ventTreatment.id);
                    setTimeout(() => applyTreatment(ventTreatment), 0);
                  }
                  toast.success('Ventilator initiated', {
                    description: `${settings.mode} • Vt ${settings.tidalVolumeMl} mL • RR ${settings.respiratoryRate} • FiO2 ${settings.fio2Percent}% • PEEP ${settings.peepCmH2O}`,
                  });
                }}
                patientWeightKg={currentCase.patientInfo?.weight}
                context={
                  currentCase.subcategory?.includes('arrest') ? 'arrest' :
                  currentCase.subcategory?.includes('copd') ? 'copd' :
                  currentCase.subcategory?.includes('ards') || currentCase.title?.toLowerCase().includes('ards') ? 'ards' :
                  currentCase.category === 'pediatric' ? 'pediatric' : 'default'
                }
                initialSettings={ventilatorSettings}
              />
            )}

            {/* Medical Control Dialog */}
            {currentCase && currentVitals && (
              <MedicalControlDialog
                open={showMedicalControl}
                onClose={() => setShowMedicalControl(false)}
                caseData={currentCase}
                currentVitals={currentVitals}
                appliedTreatmentIds={appliedTreatmentIds}
                isInArrest={patientState?.isInArrest ?? false}
              />
            )}

            {/* Practicality challenge — patient/context pushes back before the treatment is applied. */}
            {pendingTreatmentChallenge && (
              <Dialog open={!!pendingTreatmentChallenge} onOpenChange={(open) => { if (!open) setPendingTreatmentChallenge(null); }}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-5 w-5" />
                      {pendingTreatmentChallenge.challenge.title}
                    </DialogTitle>
                    <DialogDescription>
                      The patient and clinical context are challenging this treatment choice.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    {pendingTreatmentChallenge.challenge.patientQuote && (
                      <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-100">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">Patient says</p>
                        <p className="mt-1 italic">"{pendingTreatmentChallenge.challenge.patientQuote}"</p>
                      </div>
                    )}
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-100">
                      {pendingTreatmentChallenge.challenge.clinicalReason}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Treatment selected: <span className="font-semibold text-foreground">{pendingTreatmentChallenge.treatment.name}</span>
                    </p>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setPendingTreatmentChallenge(null)}>
                      Reconsider
                    </Button>
                    <Button
                      className="bg-amber-600 hover:bg-amber-700"
                      onClick={() => {
                        const pending = pendingTreatmentChallenge;
                        if (!pending) return;
                        treatmentChallengeConfirmedRef.current.add(pending.treatment.id);
                        setPendingTreatmentChallenge(null);
                        applyTreatment(pending.treatment, pending.defibParams);
                      }}
                    >
                      {pendingTreatmentChallenge.challenge.proceedLabel || 'Proceed anyway'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Medication Safety Confirmation Dialog */}
            {/* Live adverse-reaction banner — appears when an allergen has been
                administered, until adrenaline rescues the patient. */}
            {activeReaction && (
              <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] w-[min(92vw,560px)] rounded-xl border border-red-500/40 bg-red-950/90 px-4 py-3 shadow-2xl backdrop-blur animate-fade-in">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-300 shrink-0 mt-0.5 animate-pulse" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-red-100">
                      {activeReaction.kind === 'anaphylaxis' ? 'ANAPHYLAXIS in progress' : 'Allergic reaction in progress'}
                    </p>
                    <p className="text-xs text-red-200/90 mt-0.5">
                      {activeReaction.treatmentName} given despite documented “{activeReaction.match.allergy}” allergy — give IM adrenaline now, plus high-flow O₂ and IV fluids.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {pendingMedConfirm && (
              <Dialog open={!!pendingMedConfirm} onOpenChange={(open) => { if (!open) setPendingMedConfirm(null); }}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-5 w-5" />
                      Medication Safety Check
                    </DialogTitle>
                    <DialogDescription>
                      Confirm allergies and appropriateness before administering.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-sm font-semibold">{pendingMedConfirm.treatment.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{pendingMedConfirm.allergyText}</p>
                      {pendingMedConfirm.contraText && (
                        <p className="text-xs text-amber-600 mt-1">{pendingMedConfirm.contraText}</p>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Have you checked allergies and confirmed this medication is appropriate?
                    </p>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setPendingMedConfirm(null)}>Cancel</Button>
                    <Button onClick={() => {
                      const t = pendingMedConfirm.treatment;
                      medicationConfirmedRef.current.add(t.id);
                      setPendingMedConfirm(null);
                      applyTreatment(t);
                    }}>
                      Confirm &amp; Administer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* IV Access Prerequisite Dialog */}
            {pendingIVTreatment && (
              <Dialog open={!!pendingIVTreatment} onOpenChange={(open) => { if (!open) setPendingIVTreatment(null); }}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-blue-600">
                      <AlertTriangle className="h-5 w-5" />
                      IV Access Required
                    </DialogTitle>
                    <DialogDescription>
                      IV access must be established before administering IV medications or fluids.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-sm font-semibold">{pendingIVTreatment.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This treatment requires intravenous access. You have not yet established an IV line.
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Do you want to set up an IV first?
                    </p>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setPendingIVTreatment(null)}>Cancel</Button>
                    <Button onClick={() => {
                      const pendingTreatment = pendingIVTreatment;
                      setPendingIVTreatment(null);
                      // Find the iv_access treatment and apply it first
                      const ivAccessTreatment = TREATMENTS.find(t => t.id === 'iv_access');
                      if (ivAccessTreatment) {
                        applyTreatment(ivAccessTreatment);
                        // Then apply the originally intended treatment after a short delay
                        setTimeout(() => applyTreatment(pendingTreatment), 500);
                      }
                    }}>
                      Yes, Set Up IV
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 3b: Case Details (accessible during active case) */}
        {/* ================================================================ */}
        {phase === 'case' && currentCase && (
          <div className="animate-fade-in space-y-4">
            <Button variant="outline" size="sm" onClick={() => setPhase('vitals')} className="gap-1.5 rounded-lg shadow-sm">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Monitor
            </Button>
            <Suspense fallback={<LoadingCard />}>
              <CaseDisplay caseData={currentCase} studentYear={selectedYear} isStudentView={true} />
            </Suspense>
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 4: Post-Case Report */}
        {/* ================================================================ */}
        {phase === 'postcase' && currentCase && performanceMetrics && (
          <div className="max-w-3xl mx-auto animate-fade-in space-y-4 sm:space-y-6">
            {/* Hero header */}
            <div className="text-center mb-1 sm:mb-2 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent rounded-3xl -mx-3 sm:-mx-4 -mt-3 sm:-mt-4 h-32 sm:h-40" />
              <div className="relative">
                <div className={`mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl shadow-sm ring-4 ${
                  performanceMetrics.percentage >= 80
                    ? 'bg-green-600 ring-green-500/10'
                    : performanceMetrics.percentage >= 50
                    ? 'bg-amber-600 ring-amber-500/10'
                    : 'bg-red-600 ring-red-500/10'
                }`}>
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="heading-clean text-xl sm:text-2xl">Case Complete</h2>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate px-2">{getStudentCaseTitle(currentCase)}</p>
              </div>
            </div>

            {/* Overall Score */}
            <Card className="bg-card border border-border rounded-2xl border-primary/15 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent pointer-events-none" />
              <CardContent className="p-4 sm:p-6 relative">
                <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className={`text-2xl sm:text-3xl font-bold ${
                      performanceMetrics.percentage >= 80 ? 'text-green-500' :
                      performanceMetrics.percentage >= 50 ? 'text-amber-500' : 'text-red-500'
                    }`}>{performanceMetrics.percentage}%</div>
                    <p className="text-[9px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Score</p>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 border-x border-border/30">
                    <div className="text-2xl sm:text-3xl font-bold font-mono">{formatTime(performanceMetrics.totalTime)}</div>
                    <p className="text-[9px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Duration</p>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className="text-2xl sm:text-3xl font-bold">{performanceMetrics.treatmentCount}</div>
                    <p className="text-[9px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Treatments</p>
                  </div>
                </div>
                <Progress value={performanceMetrics.percentage} className="mt-4 sm:mt-5 h-2" />
              </CardContent>
            </Card>

            {/* AI-Style Narrative Debrief */}
            {narrativeReport && (
              <Card className={`bg-card border-2 rounded-2xl overflow-hidden ${
                narrativeReport.clinicalVerdict === 'excellent' ? 'border-green-500/40' :
                narrativeReport.clinicalVerdict === 'good' ? 'border-blue-500/40' :
                narrativeReport.clinicalVerdict === 'acceptable' ? 'border-amber-500/40' :
                'border-red-500/40'
              }`}>
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                      narrativeReport.clinicalVerdict === 'excellent' ? 'bg-green-500/15' :
                      narrativeReport.clinicalVerdict === 'good' ? 'bg-blue-500/15' :
                      narrativeReport.clinicalVerdict === 'acceptable' ? 'bg-amber-500/15' :
                      'bg-red-500/15'
                    }`}>
                      <Sparkles className={`h-3.5 w-3.5 ${
                        narrativeReport.clinicalVerdict === 'excellent' ? 'text-green-500' :
                        narrativeReport.clinicalVerdict === 'good' ? 'text-blue-500' :
                        narrativeReport.clinicalVerdict === 'acceptable' ? 'text-amber-500' :
                        'text-red-500'
                      }`} />
                    </div>
                    Clinical Debrief
                    <NarrationButton
                      size="sm"
                      label="Read debrief aloud"
                      role="narrator"
                      text={`${narrativeReport.summary} What went well: ${narrativeReport.whatWentWell.join('. ')}. Timing observations: ${narrativeReport.timingObservations.join('. ')}. Patterns to develop: ${narrativeReport.patternsToImprove.join('. ')}`}
                      className="ml-auto"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4 text-sm">
                  {/* Summary paragraph */}
                  <p className="leading-relaxed text-foreground/90 italic">
                    {narrativeReport.summary}
                  </p>

                  {/* What went well */}
                  {narrativeReport.whatWentWell.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> What Went Well
                      </h4>
                      <ul className="space-y-1.5">
                        {narrativeReport.whatWentWell.map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-xs sm:text-sm leading-relaxed">
                            <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                            <span className="text-foreground/85">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Timing observations */}
                  {narrativeReport.timingObservations.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Timing Observations
                      </h4>
                      <ul className="space-y-1.5">
                        {narrativeReport.timingObservations.map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-xs sm:text-sm leading-relaxed">
                            <span className="text-blue-500 shrink-0 mt-0.5">◆</span>
                            <span className="text-foreground/85">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Patterns to improve */}
                  {narrativeReport.patternsToImprove.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" /> Patterns to Develop
                      </h4>
                      <ul className="space-y-1.5">
                        {narrativeReport.patternsToImprove.map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-xs sm:text-sm leading-relaxed">
                            <span className="text-amber-500 shrink-0 mt-0.5">→</span>
                            <span className="text-foreground/85">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ED Outcome / Continuity of Care */}
            {edOutcome && (
              <Card className="bg-card border-2 border-indigo-500/30 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30 bg-indigo-500/5">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15">
                      <HeartPulse className="h-3.5 w-3.5 text-indigo-500" />
                    </div>
                    What Happened Next — ED Continuity
                    <NarrationButton
                      size="sm"
                      label="Read ED outcome aloud"
                      role="narrator"
                      text={`${edOutcome.edAssessment} ${edOutcome.confirmedDiagnosis}. Disposition: ${edOutcome.dispositionLabel}. 24-hour outcome: ${edOutcome.twentyFourHourOutcome}`}
                      className="ml-auto"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4 text-sm">
                  {/* ED assessment */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">ED Physician's Note</h4>
                    <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed bg-muted/30 rounded-xl p-3 border border-border/30">
                      {edOutcome.edAssessment}
                    </p>
                  </div>

                  {/* Confirmed diagnosis */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Confirmed Diagnosis</h4>
                    <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                      <p className="text-xs sm:text-sm font-medium">{edOutcome.confirmedDiagnosis}</p>
                    </div>
                  </div>

                  {/* Your suspicion accuracy */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Your Working Diagnosis</h4>
                    <div className={`rounded-xl p-3 border ${
                      edOutcome.suspicionAccuracy === 'correct' ? 'bg-green-500/5 border-green-500/30' :
                      edOutcome.suspicionAccuracy === 'partial' ? 'bg-amber-500/5 border-amber-500/30' :
                      'bg-red-500/5 border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-[9px] ${
                          edOutcome.suspicionAccuracy === 'correct' ? 'bg-green-500' :
                          edOutcome.suspicionAccuracy === 'partial' ? 'bg-amber-500' :
                          'bg-red-500'
                        } text-white`}>
                          {edOutcome.suspicionAccuracy === 'correct' ? 'CORRECT' :
                           edOutcome.suspicionAccuracy === 'partial' ? 'PARTIAL' :
                           'INCORRECT'}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/85 leading-relaxed">{edOutcome.suspicionComment}</p>
                    </div>
                  </div>

                  {/* Pre-alert impact */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Pre-Alert Impact</h4>
                    <div className={`rounded-xl p-3 border ${
                      edOutcome.preAlertImpact === 'helpful' ? 'bg-green-500/5 border-green-500/30' :
                      edOutcome.preAlertImpact === 'neutral' ? 'bg-muted/30 border-border/30' :
                      'bg-amber-500/5 border-amber-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-[9px] ${
                          edOutcome.preAlertImpact === 'helpful' ? 'bg-green-500' :
                          edOutcome.preAlertImpact === 'neutral' ? 'bg-slate-500' :
                          'bg-amber-500'
                        } text-white`}>
                          {edOutcome.preAlertImpact === 'helpful' ? 'HELPFUL' :
                           edOutcome.preAlertImpact === 'neutral' ? 'NEUTRAL' :
                           'MISSED OPPORTUNITY'}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/85 leading-relaxed">{edOutcome.preAlertComment}</p>
                    </div>
                  </div>

                  {/* ED treatment */}
                  {edOutcome.treatmentInED.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Treatment in ED</h4>
                      <ul className="space-y-1">
                        {edOutcome.treatmentInED.map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-xs text-foreground/85">
                            <span className="text-indigo-500 shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Disposition */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Disposition</h4>
                    <div className="bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/30">
                      <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{edOutcome.dispositionLabel}</p>
                    </div>
                  </div>

                  {/* 24-hour outcome */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">24-Hour Outcome</h4>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic bg-muted/30 rounded-xl p-3 border border-border/30">
                      {edOutcome.twentyFourHourOutcome}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Penalty Breakdown */}
            {performanceMetrics.penaltyTotal > 0 && (
              <Card className="bg-card border-2 border-orange-400 dark:border-orange-500/50 rounded-2xl overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-sm text-orange-700 dark:text-orange-300">Score Penalties Applied</span>
                  </div>
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base score</span>
                      <span className="font-medium">{performanceMetrics.basePercentage}%</span>
                    </div>
                    {performanceMetrics.penaltyReasons.map((reason: { label: string; amount: number }, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-orange-700 dark:text-orange-400">{reason.label}</span>
                        <span className="font-medium text-red-500">-{reason.amount}%</span>
                      </div>
                    ))}
                    <div className="border-t border-orange-300 dark:border-orange-700 pt-1.5 mt-1.5 flex justify-between font-bold">
                      <span>Adjusted score</span>
                      <span>{performanceMetrics.percentage}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clinical Management Loop */}
            {performanceMetrics.managementDebrief.totalCount > 0 && (
              <Card className="bg-card border border-border rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                        performanceMetrics.managementDebrief.pendingCount > 0 ? 'bg-amber-500/15' : 'bg-emerald-500/15'
                      }`}>
                        <ClipboardCheck className={`h-3.5 w-3.5 ${
                          performanceMetrics.managementDebrief.pendingCount > 0 ? 'text-amber-500' : 'text-emerald-500'
                        }`} />
                      </div>
                      Clinical Management Loop
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${
                      performanceMetrics.managementDebrief.pendingCount > 0
                        ? 'border-amber-400 text-amber-600'
                        : 'border-emerald-400 text-emerald-600'
                    }`}>
                      {performanceMetrics.managementDebrief.pendingCount > 0 ? `${performanceMetrics.managementDebrief.pendingCount} pending` : 'closed'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{performanceMetrics.managementDebrief.summary}</p>

                  {performanceMetrics.managementDebrief.pendingItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Pending follow-up</h4>
                      {performanceMetrics.managementDebrief.pendingItems.map(item => (
                        <div key={item.treatmentId} className="rounded-xl border border-amber-300/40 bg-amber-50/60 p-3 dark:border-amber-500/20 dark:bg-amber-950/20">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                            <div>
                              <p className="text-xs font-semibold text-foreground">{item.label}</p>
                              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.reassessmentPrompt}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {performanceMetrics.managementDebrief.reassessedItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Closed loop</h4>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {performanceMetrics.managementDebrief.reassessedItems.slice(0, 6).map(item => (
                          <div key={item.treatmentId} className="rounded-xl border border-emerald-300/35 bg-emerald-50/50 p-2.5 dark:border-emerald-500/20 dark:bg-emerald-950/20">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                              <p className="truncate text-xs font-medium">{item.label}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Performance Assessment — deterministic dimension breakdown */}
            {performanceMetrics.smartGrade && (
              <Card className="bg-card border border-border rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      </div>
                      Performance Assessment
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${
                      performanceMetrics.smartGrade.band.tone === 'excellent' ? 'border-emerald-400 text-emerald-600'
                      : performanceMetrics.smartGrade.band.tone === 'good' ? 'border-blue-400 text-blue-600'
                      : performanceMetrics.smartGrade.band.tone === 'fair' ? 'border-amber-400 text-amber-600'
                      : 'border-red-400 text-red-600'
                    }`}>{performanceMetrics.smartGrade.band.label}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{performanceMetrics.smartGrade.narrative}</p>

                  <div className="space-y-2.5">
                    {performanceMetrics.smartGrade.dimensions.map((d) => (
                      <div key={d.key}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium">{d.label}</span>
                          <span className="font-mono text-muted-foreground">{d.score}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${
                            d.score >= 80 ? 'bg-emerald-500' : d.score >= 60 ? 'bg-blue-500' : d.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                          }`} style={{ width: `${d.score}%` }} />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{d.summary}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    {performanceMetrics.smartGrade.strengths.length > 0 && (
                      <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-1.5">Strengths</p>
                        <ul className="space-y-1">
                          {performanceMetrics.smartGrade.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-xs flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">✓</span><span>{s}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-1.5">Focus Next</p>
                      <ul className="space-y-1">
                        {performanceMetrics.smartGrade.improvements.map((s: string, i: number) => (
                          <li key={i} className="text-xs flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">→</span><span>{s}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transport & Clinical Decisions */}
            {transportDecisions && (
              <Card className="bg-card border border-border rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15">
                      <Ambulance className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    Transport & Clinical Decisions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Transport Priority</span>
                      <p className="font-semibold mt-1">{transportDecisions.priority === 'lights' ? '🚨 Lights & Sirens' : transportDecisions.priority === 'urgent' ? '⚡ Urgent' : '🟢 Routine'}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Patient Position</span>
                      <p className="font-semibold mt-1">{transportDecisions.position || 'Not selected'}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Pre-Alert</span>
                      <p className="font-semibold mt-1">{transportDecisions.preAlert ? '✓ Yes — hospital notified' : '✗ No pre-alert'}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Destination</span>
                      <p className="font-semibold mt-1">{transportDecisions.destination || 'Not specified'}</p>
                    </div>
                  </div>
                  {transportDecisions.provisionalDiagnosis && (
                    <div className={`mt-3 p-3 rounded-xl border ${
                      transportDecisions.provisionalDiagnosis === currentCase.expectedFindings?.mostLikelyDiagnosis
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-300'
                        : 'bg-amber-50 dark:bg-amber-950/20 border-amber-300'
                    }`}>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Your Provisional Diagnosis</span>
                      <p className="font-semibold text-sm mt-1">{transportDecisions.provisionalDiagnosis}</p>
                      {transportDecisions.provisionalDiagnosis === currentCase.expectedFindings?.mostLikelyDiagnosis ? (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Correct — matches the most likely diagnosis</p>
                      ) : (
                        <p className="text-xs text-amber-600 mt-1">The most likely diagnosis for this case was: <strong>{currentCase.expectedFindings?.mostLikelyDiagnosis}</strong></p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Performance Feedback */}
            <Card className="bg-card border border-border rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/30">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15">
                    <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                {/* Timing */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Response Timing</h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
                    <div className="p-2.5 sm:p-3.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Arrival on scene</span>
                      <p className="font-bold text-base sm:text-lg mt-0.5 sm:mt-1 font-mono">{caseStartTime ? new Date(caseStartTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}</p>
                    </div>
                    <div className="p-2.5 sm:p-3.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Departed (handover)</span>
                      <p className="font-bold text-base sm:text-lg mt-0.5 sm:mt-1 font-mono">{caseEndTime ? new Date(caseEndTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}</p>
                    </div>
                    <div className="p-2.5 sm:p-3.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium">On-scene time</span>
                      <p className="font-bold text-base sm:text-lg mt-0.5 sm:mt-1 font-mono">{formatTime(performanceMetrics.totalTime)}</p>
                    </div>
                    <div className="p-2.5 sm:p-3.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Time to first Rx</span>
                      <p className="font-bold text-base sm:text-lg mt-0.5 sm:mt-1 font-mono">
                        {performanceMetrics.timeToFirstTreatment
                          ? formatTime(performanceMetrics.timeToFirstTreatment)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {performanceMetrics.timeToFirstTreatment && performanceMetrics.timeToFirstTreatment > 120 && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/8 border border-amber-500/15 p-3 rounded-xl flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      Consider beginning treatment sooner — early intervention is key to patient outcomes.
                    </div>
                  )}
                  {performanceMetrics.timeToFirstTreatment && performanceMetrics.timeToFirstTreatment <= 60 && (
                    <div className="text-xs text-green-600 dark:text-green-400 bg-green-500/8 border border-green-500/15 p-3 rounded-xl flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      Excellent — you identified the need for treatment quickly and initiated care promptly.
                    </div>
                  )}
                </div>

                <Separator className="bg-border/30" />

                {/* Vital Signs Trend */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vital Signs Trend</h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
                    <div className="p-2.5 sm:p-3.5 rounded-xl bg-muted/30 border border-border/30 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Heart Rate</span>
                        <p className="font-bold mt-0.5">{performanceMetrics.vitalsTrend.initialHR} <ArrowRight className="h-3 w-3 inline-block text-muted-foreground" /> {performanceMetrics.vitalsTrend.finalHR} <span className="text-xs font-normal text-muted-foreground">bpm</span></p>
                      </div>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        performanceMetrics.vitalsTrend.hrImproved ? 'bg-green-500/15' : 'bg-muted'
                      }`}>
                        {performanceMetrics.vitalsTrend.hrImproved ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : performanceMetrics.vitalsTrend.initialHR === performanceMetrics.vitalsTrend.finalHR ? (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">SpO2</span>
                        <p className="font-bold mt-0.5">{performanceMetrics.vitalsTrend.initialSpO2} <ArrowRight className="h-3 w-3 inline-block text-muted-foreground" /> {performanceMetrics.vitalsTrend.finalSpO2}<span className="text-xs font-normal text-muted-foreground">%</span></p>
                      </div>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        performanceMetrics.vitalsTrend.spo2Improved ? 'bg-green-500/15' : 'bg-muted'
                      }`}>
                        {performanceMetrics.vitalsTrend.spo2Improved ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : performanceMetrics.vitalsTrend.initialSpO2 === performanceMetrics.vitalsTrend.finalSpO2 ? (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/30" />

                {/* Treatments Applied */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Treatments Applied ({performanceMetrics.treatmentCount})
                  </h4>
                  {appliedTreatments.length > 0 ? (
                    <div className="space-y-2">
                      {appliedTreatments.map((t, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">{t.name}</span>
                            <span className="text-muted-foreground ml-2">
                              {(() => {
                                const desc = t.description || '';
                                return desc
                                  .replace(/\s*—\s*(?:[A-Z][A-Za-z\d]+:\s*[\d./]+[%°]?[A-Za-z]?\s*→\s*[\d./]+[%°]?[A-Za-z]?(?:,\s*)?)+\.?/g, '.')
                                  .replace(/\s*—\s*\d+\s*vitals?\s*improving\.?\s*(?:Consider\s*repeat\s*dose\.?)?/g, '.')
                                  .replace(/\.{2,}/g, '.')
                                  .trim();
                              })()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/8 border border-amber-500/15 p-3 rounded-xl">
                      No treatments were applied during this case. Consider whether interventions were needed.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Assessment Debrief */}
            {performanceMetrics.assessmentDebrief && (
              <Card className="bg-card border border-border rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15">
                      <ClipboardCheck className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    Clinical Assessment Review
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      {performanceMetrics.assessmentDebrief.score}/{performanceMetrics.assessmentDebrief.totalPossible} pts
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-4">
                  {/* Summary badges */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <Badge variant={performanceMetrics.assessmentDebrief.abcdeCompleted ? 'default' : 'destructive'} className={`text-[9px] sm:text-[10px] ${performanceMetrics.assessmentDebrief.abcdeCompleted ? 'bg-green-500' : ''}`}>
                      {performanceMetrics.assessmentDebrief.abcdeCompleted ? 'ABCDE Complete' : 'ABCDE Incomplete'}
                    </Badge>
                    <Badge variant={performanceMetrics.assessmentDebrief.historyTaken ? 'default' : 'secondary'} className={`text-[9px] sm:text-[10px] ${performanceMetrics.assessmentDebrief.historyTaken ? 'bg-green-500' : ''}`}>
                      {performanceMetrics.assessmentDebrief.historyTaken ? 'History Taken' : 'History Incomplete'}
                    </Badge>
                    <Badge variant={performanceMetrics.assessmentDebrief.secondarySurveyCompleted ? 'default' : 'secondary'} className={`text-[9px] sm:text-[10px] ${performanceMetrics.assessmentDebrief.secondarySurveyCompleted ? 'bg-green-500' : ''}`}>
                      {performanceMetrics.assessmentDebrief.secondarySurveyCompleted ? '2nd Survey Done' : '2nd Survey Incomplete'}
                    </Badge>
                  </div>

                  {/* Assessment order */}
                  {performanceMetrics.assessmentDebrief.assessmentOrder.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your Assessment Order</h4>
                      <div className="flex flex-wrap gap-1">
                        {performanceMetrics.assessmentDebrief.assessmentOrder.map((label, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <Badge variant="outline" className="text-[10px]">
                              {i + 1}. {label}
                            </Badge>
                            {i < performanceMetrics.assessmentDebrief!.assessmentOrder.length - 1 && (
                              <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timing issues */}
                  {performanceMetrics.assessmentDebrief.timingIssues.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Timing Issues</h4>
                      {performanceMetrics.assessmentDebrief.timingIssues.map((issue, i) => (
                        <div key={i} className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/8 border border-amber-500/15 p-2.5 rounded-xl flex items-start gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          {issue}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Critical missed */}
                  {performanceMetrics.assessmentDebrief.criticalMissed.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">Critical Assessments Missed</h4>
                      {performanceMetrics.assessmentDebrief.criticalMissed.map((item, i) => (
                        <div key={i} className="text-xs text-red-700 dark:text-red-300 bg-red-500/8 border border-red-500/15 p-2.5 rounded-xl">
                          <div className="flex items-start gap-2">
                            <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold">{item.label}</span>
                              <p className="opacity-80 mt-0.5">{item.rationale}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator className="bg-border/30" />

                  {/* Detailed breakdown */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detailed Breakdown</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {performanceMetrics.assessmentDebrief.items.map((item, i) => (
                        <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
                          item.status === 'completed' ? 'bg-green-500/5' :
                          item.status === 'missed-required' ? 'bg-red-500/5' :
                          item.status === 'missed-recommended' ? 'bg-muted/30' :
                          'bg-blue-500/5'
                        }`}>
                          {item.status === 'completed' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          ) : item.status === 'missed-required' ? (
                            <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          ) : item.status === 'missed-recommended' ? (
                            <Minus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          ) : (
                            <Star className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          )}
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.order && (
                            <Badge variant="outline" className="text-[9px] py-0 h-4">#{item.order}</Badge>
                          )}
                          {item.performedAt !== undefined && (
                            <span className="text-muted-foreground/60 text-[10px]">{formatTime(item.performedAt)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event-synced case replay — scrub the timeline, watch vitals evolve, jump to markers */}
            <DebriefReplay
              caseStartTime={caseStartTime}
              caseEndTime={caseEndTime}
              vitalsHistory={vitalsHistory}
              appliedTreatments={appliedTreatments}
              performedAssessments={assessmentTracker?.performed}
              arrestEvents={arrestTimeline}
              adverseEvents={adverseEventsRef.current}
            />

            {/* Cardiac Arrest Timeline */}
            {arrestTimeline.length > 0 && (
              <Card className="bg-card border border-border rounded-2xl overflow-hidden border-red-200 dark:border-red-800">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/15">
                      <Heart className="h-3.5 w-3.5 text-red-500" />
                    </div>
                    Cardiac Arrest Timeline
                    <Badge variant="destructive" className="ml-auto text-[10px]">
                      {cprCycleNumber} cycles | {shockCount} shocks | {adrenalineDoses} adrenaline
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-1.5">
                    {arrestTimeline.map((event, i) => {
                      const elapsed = arrestStartTime ? Math.floor((event.time - arrestStartTime) / 1000) : 0;
                      const mins = Math.floor(elapsed / 60);
                      const secs = elapsed % 60;
                      const typeColors: Record<string, string> = {
                        'arrest-start': 'text-red-600 bg-red-50',
                        'cpr-start': 'text-green-600 bg-green-50',
                        'cpr-pause': 'text-amber-600 bg-amber-50',
                        'rhythm-check': 'text-blue-600 bg-blue-50',
                        'shock': 'text-yellow-600 bg-yellow-50',
                        'drug': 'text-cyan-700 bg-cyan-50',
                        'rosc': 'text-emerald-600 bg-emerald-50',
                        'lucas': 'text-slate-600 bg-slate-50',
                        'treatment': 'text-cyan-600 bg-cyan-50',
                      };
                      return (
                        <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${typeColors[event.type] || 'bg-muted/30'}`}>
                          <span className="font-mono text-[10px] w-10 shrink-0">{mins}:{String(secs).padStart(2, '0')}</span>
                          <span className="flex-1">{event.event}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* AHA Compliance Summary */}
                  <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">AHA 2025 Compliance</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        {shockCount > 0 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                        Defibrillation attempted
                      </div>
                      <div className="flex items-center gap-1.5">
                        {adrenalineDoses > 0 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                        Adrenaline administered
                      </div>
                      <div className="flex items-center gap-1.5">
                        {amiodaroneDoses > 0 && shockCount >= 3 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : shockCount < 3 ? <Minus className="h-3 w-3 text-muted-foreground" /> : <XCircle className="h-3 w-3 text-red-500" />}
                        Amiodarone protocol
                      </div>
                      <div className="flex items-center gap-1.5">
                        {cprCycleNumber >= 1 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                        CPR cycles completed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Treatment Quality Analysis — Year-Aware */}
            {appliedTreatments.length > 0 && (() => {
              const qualityResults: { treatmentName: string; result: TreatmentQualityResult; timingNote?: string }[] = [];
              for (const tx of appliedTreatments) {
                const result = evaluateTreatmentQuality(tx.id, currentCase.vitalSignsProgression.initial, currentCase, selectedYear);
                if (result) {
                  const timing = tx.appliedAt
                    ? assessTreatmentTiming(tx.id, Math.round((new Date(tx.appliedAt).getTime() - (caseStartTime || Date.now())) / 1000), currentCase)
                    : null;
                  qualityResults.push({ treatmentName: tx.name || tx.description, result, timingNote: timing?.feedback });
                }
              }
              if (qualityResults.length === 0) return null;

              const levelColors: Record<string, string> = {
                optimal: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
                acceptable: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
                suboptimal: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
                inappropriate: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
                harmful: 'border-red-500 bg-red-50 dark:bg-red-950/20',
              };
              const levelLabels: Record<string, string> = {
                optimal: 'Optimal', acceptable: 'Acceptable', suboptimal: 'Suboptimal',
                inappropriate: 'Inappropriate', harmful: 'Harmful',
              };

              return (
                <Card className="border border-border rounded-2xl overflow-hidden">
                  <CardHeader className="pb-3 border-b border-border/30">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/15">
                        <Activity className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" />
                      </div>
                      Treatment Quality Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    {qualityResults.map((qr, i) => (
                      <div key={i} className={`rounded-xl border-l-4 p-3 ${levelColors[qr.result.level]}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{qr.treatmentName}</span>
                          <Badge variant="outline" className="text-[10px]">{levelLabels[qr.result.level]} ({qr.result.score}%)</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{qr.result.feedback}</p>
                        {qr.result.yearLevelNote && (
                          <p className="text-xs mt-2 p-2 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg text-cyan-800 dark:text-cyan-200 italic">
                            {qr.result.yearLevelNote}
                          </p>
                        )}
                        {qr.timingNote && (
                          <p className="text-xs mt-1 flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {qr.timingNote}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Year-Level Guidance & Resources */}
            {performanceMetrics.assessmentDebrief && performanceMetrics.assessmentDebrief.criticalMissed.length > 0 && (() => {
              const missedCategories = [...new Set(performanceMetrics.assessmentDebrief!.criticalMissed.map(m => (m as typeof m & { category?: string }).category || 'assessment'))];
              const resources: FeedbackResource[] = getResourcesForCase(currentCase, missedCategories, selectedYear);
              const guidanceItems = missedCategories.slice(0, 3).map(cat => {
                const desc = cat === 'assessment' ? 'clinical assessment gaps' : `${cat} assessment gaps`;
                return generateYearAwareGuidance(desc, cat, selectedYear);
              });

              if (guidanceItems.length === 0 && resources.length === 0) return null;

              return (
                <Card className="bg-card border border-border rounded-2xl overflow-hidden">
                  <CardHeader className="pb-3 border-b border-border/30">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                      </div>
                      Year-Level Guidance ({selectedYear})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    {guidanceItems.map((guidance, i) => (
                      <div key={i} className="text-xs p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 leading-relaxed">
                        {guidance}
                      </div>
                    ))}
                    {resources.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommended Resources</h4>
                        {resources.slice(0, 5).map((res, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs p-2.5 rounded-xl bg-muted/30 border border-border/30">
                            <Badge variant="outline" className="text-[9px] shrink-0 mt-0.5">{res.type}</Badge>
                            <div>
                              <span className="font-medium">{res.title}</span>
                              <p className="text-muted-foreground mt-0.5">{res.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Key Learning Points */}
            {currentCase.expectedFindings && (
              <Card className="bg-card border border-border rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15">
                      <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    Key Learning Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1">Most Likely Diagnosis</p>
                    <p className="text-base font-bold">{currentCase.expectedFindings.mostLikelyDiagnosis}</p>
                  </div>
                  {currentCase.expectedFindings.keyObservations && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Observations</p>
                      <ul className="space-y-1.5">
                        {currentCase.expectedFindings.keyObservations.map((obs, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                            {obs}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {currentCase.expectedFindings.redFlags && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Red Flags</p>
                      <ul className="space-y-1.5">
                        {currentCase.expectedFindings.redFlags.map((flag, i) => (
                          <li key={i} className="text-sm flex items-start gap-2 text-red-600 dark:text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Further Study Resources — same as instructor debrief */}
            <DebriefingResourcesPanel caseData={currentCase} />

            {/* Additional Resources */}
            {educationalResources && educationalResources.length > 0 && (
              <Card className="bg-card border border-border rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15">
                      <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    Further Reading
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="space-y-1">
                    {educationalResources.slice(0, 6).map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm p-3 rounded-xl hover:bg-accent/40 transition-all duration-200 group"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors shrink-0">
                          <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium group-hover:text-blue-500 transition-colors truncate">{res.title}</p>
                          {res.source && <p className="text-[11px] text-muted-foreground">{res.source}</p>}
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0 border-border/50">{res.type}</Badge>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 pb-6 sm:pb-8">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2 rounded-xl text-sm sm:text-base h-11 sm:h-12"
                onClick={async () => {
                  if (!currentCase || !session) return;
                  try {
                    toast.loading('Generating PDF report...');
                    await exportSessionToPDF({
                      session: {
                        ...session,
                        score: performanceMetrics.scoreEarned ?? session.score,
                        totalPossible: performanceMetrics.totalPossible ?? session.totalPossible,
                        completedItems: assessmentTracker?.performed?.map(p => p.stepId) ?? session.completedItems,
                      },
                      caseData: currentCase,
                      elapsedTime: formatTime(performanceMetrics.totalTime),
                      appliedTreatments,
                      vitalsHistory,
                      debriefingResources: getResourcesForDebriefing(currentCase),
                      scoreSummary: {
                        basePercentage: performanceMetrics.basePercentage,
                        percentage: performanceMetrics.percentage,
                        penaltyReasons: performanceMetrics.penaltyReasons,
                      },
                      assessmentItems: performanceMetrics.assessmentDebrief?.items,
                      managementDebrief: performanceMetrics.managementDebrief,
                      smartGrade: performanceMetrics.smartGrade,
                      transport: transportDecisions ?? undefined,
                      times: {
                        arrival: caseStartTime ? new Date(caseStartTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : null,
                        departed: caseEndTime ? new Date(caseEndTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : null,
                        onScene: formatTime(performanceMetrics.totalTime),
                        firstIntervention: performanceMetrics.timeToFirstTreatment ? formatTime(performanceMetrics.timeToFirstTreatment) : null,
                      },
                    });
                    toast.dismiss();
                    toast.success('PDF report downloaded');
                  } catch (err) {
                    console.error('PDF generation error:', err);
                    toast.dismiss();
                    toast.error('Failed to generate PDF: ' + (err instanceof Error ? err.message : 'Unknown error'));
                  }
                }}
              >
                <FileText className="h-4 w-4" /> Download Report
              </Button>
              <Button variant="outline" onClick={resetToStart} size="lg" className="flex-1 gap-2 rounded-xl text-sm sm:text-base h-11 sm:h-12">
                <RotateCcw className="h-4 w-4" /> Start New Case
              </Button>
            </div>
          </div>
        )}
          </motion.div>
        </AnimatePresence>

        {/* D3 cinematic: scene-arrival lower-third chyron, timed to the
            CameraEntrance doorway dolly. Renders outside the phase subtree so
            it can overlay the live 3D scene without being crossfaded out by
            AnimatePresence. */}
        {(() => {
          const arrival = sceneArrivalCopy(currentCase);
          return arrival ? (
            <SceneArrivalChyron
              active={arrivalChyronActive}
              kicker={arrival.kicker}
              title={arrival.title}
              sub={arrival.sub}
            />
          ) : null;
        })()}

        {/* Hands-free voice-first mic — the legacy tap-to-command mic was
            removed (origin), so this surfaces ONLY in voice-first mode, where
            the full intent set (treatments + navigation) is the primary
            control surface for 3rd/4th-year students. */}
        {voiceFirstMode && (phase === 'case' || phase === 'vitals') && currentCase && (
          <VoiceCommandButton
            commands={voiceIntents}
            onCommand={handleVoiceIntent}
            lang={i18n.language === 'ar' ? 'ar-AE' : 'en-GB'}
            listeningLabel={t('voice.listening', { defaultValue: 'Listening' })}
            idleLabel={t('voice.talk', { defaultValue: 'Voice' })}
            transcriptPlaceholder={
              t('voice.transcriptPlaceholder', { defaultValue: 'Say a command — e.g. "check airway", "give adrenaline"' })
            }
          />
        )}

        {/* Drug-administration confirm beat — voice-first requires an explicit
            confirmation before a medication is pushed. */}
        <Dialog open={pendingVoiceDrug != null} onOpenChange={(open) => { if (!open) setPendingVoiceDrug(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('voice.confirmDrugTitle', { defaultValue: 'Confirm administration' })}
              </DialogTitle>
              <DialogDescription>
                {t('voice.confirmDrugPrompt', {
                  drug: pendingVoiceDrug?.name ?? '',
                  defaultValue: `Confirm: administer ${pendingVoiceDrug?.name ?? ''}?`,
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPendingVoiceDrug(null)}>
                {t('common.cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button onClick={confirmVoiceDrug}>
                {t('voice.confirmDrugConfirm', { defaultValue: 'Confirm' })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

// Re-export for lazy loading
export default StudentPanel;
