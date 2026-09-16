import { writeFile } from 'node:fs/promises';
import { allCases } from '../src/data/cases';
import { getResourcesForDebriefing } from '../src/data/diversifiedResources';
import { exportSessionToPDF } from '../src/lib/pdf-export';
import type { AppliedTreatment, CaseSession, InstructorAssessmentNote, SimulationObjective, VitalSigns } from '../src/types';
import type { AssessmentDebriefItem } from '../src/data/assessmentFramework';

async function main() {
const caseData = allCases.find(item => item.id === 'y1-015');
if (!caseData) throw new Error('PDF verification case y1-015 was not found');

const session: CaseSession = {
  id: 'pdf-verification-anaphylaxis',
  caseId: caseData.id,
  studentYear: '1st-year',
  generatedAt: new Date().toISOString(),
  completedItems: [],
  notes: '',
  score: 125,
  totalPossible: 125,
  studentName: 'PDF Verification Student',
  selectedCondition: 'Anaphylaxis (most likely)',
};

const treatment = (
  id: string,
  name: string,
  description: string,
  category: AppliedTreatment['category'],
): AppliedTreatment => ({
  id,
  name,
  description,
  category,
  appliedAt: new Date().toISOString(),
  effects: [],
  isActive: true,
});

const appliedTreatments: AppliedTreatment[] = [
  treatment('adrenaline_05mg_im', 'Adrenaline 0.5mg IM', 'IM adrenaline matched to anaphylaxis.', 'medication'),
  treatment('oxygen_nonrebreather', 'Non-Rebreather Mask', 'Oxygen matched to hypoxia.', 'breathing'),
  treatment('salbutamol_nebulizer', 'Salbutamol Nebulizer', 'Bronchodilator matched to wheeze.', 'medication'),
  treatment('naloxone_04mg', 'Naloxone 0.4mg', 'Naloxone used without clear opioid physiology.', 'medication'),
];

const assessmentItems: AssessmentDebriefItem[] = [
  {
    stepId: 'scene-safety',
    label: 'Scene Safety & BSI',
    phase: 'primary',
    status: 'completed',
    performedAt: 0,
    order: 1,
    points: 5,
    rationale: 'Protects the patient and crew before contact.',
    critical: true,
  },
  {
    stepId: 'airway-patency',
    label: 'Assess airway patency',
    phase: 'primary',
    status: 'completed',
    performedAt: 20,
    order: 2,
    points: 5,
    rationale: 'Identifies immediate airway compromise.',
    critical: true,
  },
  {
    stepId: 'breathing-rate',
    label: 'Assess breathing rate',
    phase: 'primary',
    status: 'completed',
    performedAt: 35,
    order: 3,
    points: 5,
    rationale: 'Identifies respiratory distress.',
    critical: true,
  },
];

const vitalsHistory: VitalSigns[] = [
  { ...caseData.vitalSignsProgression.initial, time: new Date().toISOString() },
  {
    ...caseData.vitalSignsProgression.afterIntervention,
    time: new Date().toISOString(),
  },
];

const simulationObjective: SimulationObjective = {
  id: 'pdf-layout-objective',
  primaryObjective: 'Recognise life-threatening anaphylaxis, give intramuscular adrenaline without delay, and reassess airway, breathing, circulation and response after every intervention.',
  skillsFocus: ['Structured ABCDE assessment', 'IM adrenaline site and dose', 'High-flow oxygen and monitoring', 'Closed-loop reassessment and hospital pre-alert'],
  learningDomain: 'psychomotor',
  relatedCategories: ['respiratory'],
  relatedKeywords: ['anaphylaxis'],
};

const instructorAssessmentNotes: InstructorAssessmentNote[] = [{
  id: 'pdf-layout-note',
  timestamp: new Date().toISOString(),
  category: 'clinical-reasoning',
  phase: 'primary-survey',
  finding: 'You recognised the multi-system allergic reaction and correctly prioritised intramuscular adrenaline, oxygenation and repeat airway assessment.',
  whatWasMissed: 'The post-treatment reassessment did not explicitly document whether the facial swelling, work of breathing and blood pressure had improved before packaging.',
  whyItMatters: 'Documented reassessment confirms that the intervention is working and guides whether a repeat adrenaline dose or escalation is required.',
  improvementAction: 'After every treatment, repeat and document a focused ABC assessment, including the airway, respiratory effort, oxygen saturation, pulse and blood pressure.',
  severity: 'important',
}];

const blob = await exportSessionToPDF({
  session,
  caseData,
  elapsedTime: '08:42',
  appliedTreatments,
  vitalsHistory,
  simulationObjective,
  instructorAssessmentNotes,
  debriefingResources: getResourcesForDebriefing(caseData),
  scoreSummary: {
    basePercentage: 100,
    percentage: 95,
    penaltyReasons: [{
      label: 'Inappropriate: Naloxone 0.4mg — Naloxone used without clear opioid physiology.',
      amount: 5,
    }],
  },
  assessmentItems,
  smartGrade: {
    overall: 95,
    band: { label: 'Excellent', tone: 'excellent' },
    dimensions: [
      { key: 'assessment', label: 'Assessment & Recognition', score: 96, summary: 'Systematic ABCDE; key findings identified.' },
      { key: 'management', label: 'Clinical Management', score: 94, summary: 'Adrenaline-first, oxygen and fluids supported.' },
      { key: 'timing', label: 'Timing & Efficiency', score: 90, summary: 'Prompt first intervention.' },
      { key: 'safety', label: 'Patient Safety', score: 100, summary: 'No contraindicated or allergenic drugs given.' },
    ],
    strengths: ['Strong systematic assessment (ABCDE).', 'Interventions improved oxygenation.'],
    improvements: ['Reassess after each intervention.'],
    narrative: 'Excellent performance. Systematic, thorough assessment with the decisive intervention given early.',
  },
  transport: {
    priority: 'lights',
    position: 'Sitting Upright',
    preAlert: true,
    destination: 'Nearest ED',
    provisionalDiagnosis: 'Anaphylaxis',
  },
  times: {
    arrival: '00:18:05',
    departed: '00:26:47',
    onScene: '08:42',
    firstIntervention: '1:12',
  },
  download: false,
});

const outputPath = process.argv[2] || '/tmp/paramedic-pdf-verification.pdf';
await writeFile(outputPath, Buffer.from(await blob.arrayBuffer()));
console.log(outputPath);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
