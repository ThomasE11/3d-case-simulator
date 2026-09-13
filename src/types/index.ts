// Student Year Levels
export type StudentYear = '1st-year' | '2nd-year' | '3rd-year' | '4th-year' | 'diploma';

// Case Categories - Expanded with Subcategories
export type CaseCategory =
  | 'cardiac'
  | 'respiratory'
  | 'trauma'
  | 'neurological'
  | 'metabolic'
  | 'environmental'
  | 'psychiatric'
  | 'obstetric'
  | 'pediatric'
  | 'general'
  | 'post-discharge'
  | 'anxiety-related'
  | 'rule-out'
  | 'elderly-fall'
  | 'toxicology'
  | 'obstetrics-gynecology'
  | 'burns'
  | 'multiple-patients'
  | 'disaster'
  | 'clinical-procedures'
  | 'thoracic'
  | 'critical-care'
  | 'cardiac-ecg'
  | 'toxicological'
  | 'procedural';

// Cardiac Subcategories
export type CardiacSubcategory =
  | 'stem-anterior'
  | 'stem-inferior'
  | 'stem-lateral'
  | 'stem-posterior'
  | 'nstemi'
  | 'unstable-angina'
  | 'cardiac-arrest'
  | 'arrhythmia-af'
  | 'arrhythmia-flutter'
  | 'arrhythmia-svt'
  | 'arrhythmia-vt'
  | 'heart-failure'
  | 'cardiomyopathy'
  | 'valvular'
  | 'pericardial'
  | 'aortic-dissection';

// Respiratory Subcategories
export type RespiratorySubcategory =
  | 'asthma'
  | 'copd'
  | 'pneumothorax-tension'
  | 'pneumothorax-simple'
  | 'hemothorax'
  | 'hemopneumothorax'
  | 'pulmonary-embolism'
  | 'pneumonia'
  | 'ards'
  | 'upper-airway-obstruction';

// Trauma Subcategories
export type TraumaSubcategory =
  | 'blunt-chest'
  | 'penetrating-chest'
  | 'flail-chest'
  | 'cardiac-tamponade-trauma'
  | 'traumatic-brain-injury'
  | 'spinal-cord-injury'
  | 'pelvic-fracture'
  | 'long-bone-fracture'
  | 'massive-hemorrhage'
  | 'polytrauma'
  | 'burns-thermal'
  | 'burns-electrical'
  | 'blast-injury';

// Thoracic Subcategories (Critical Care)
export type ThoracicSubcategory =
  | 'cardiac-tamponade'
  | 'tension-pneumothorax'
  | 'massive-hemothorax'
  | 'flail-chest-thoracic'
  | 'traumatic-aortic-injury'
  | 'diaphragmatic-rupture'
  | 'esophageal-injury'
  | 'bronchial-injury';

// Case Priority
export type CasePriority = 'critical' | 'high' | 'moderate' | 'low';

// Case Complexity Level - Enhanced
export type ComplexityLevel = 'basic' | 'intermediate' | 'advanced' | 'expert';

// Detail Level for Progressive Disclosure
export type DetailLevel = 'minimal' | 'standard' | 'detailed' | 'comprehensive';

// Critical Action - Must-pass items
export interface CriticalAction {
  id: string;
  description: string;
  failureReason: string;
  timeframe?: string;
  consequence?: string;
  alternativeActions?: string[];
}

// Time of Day
export type TimeOfDay =
  | 'early-morning'
  | 'morning'
  | 'afternoon'
  | 'evening';

// Gender
export type Gender = 'male' | 'female';

// Detailed Intervention
export interface Intervention {
  id: string;
  description: string;
  indication: string;
  contraindications?: string[];
  dosage?: string;
  route?: string;
  expectedOutcome?: string;
  monitoring?: string[];
  complications?: string[];
}

// ABCDE Assessment - Enhanced with more detail
export interface ABCDEAssessment {
  airway: {
    patent: boolean;
    findings: string[];
    interventions: string[];
    adjunctsNeeded?: string[];
    difficulty?: string;
  };
  breathing: {
    rate: number;
    rhythm: string;
    depth: string;
    spo2: number;
    findings: string[];
    interventions: string[];
    auscultation?: string[];
    percussion?: string[];
  };
  circulation: {
    pulseRate: number;
    pulseQuality: string;
    bp: { systolic: number; diastolic: number };
    capillaryRefill: number;
    skin: string;
    findings: string[];
    interventions: string[];
    ecgFindings?: string[];
    ivAccess?: string[];
  };
  disability: {
    avpu: 'A' | 'V' | 'P' | 'U';
    gcs: { eye: number; verbal: number; motor: number; total: number };
    pupils: string | string[];
    bloodGlucose?: number;
    findings: string[];
    interventions: string[];
    focalDeficits?: string[];
    seizureActivity?: string;
  };
  exposure: {
    temperature?: number;
    findings: string[];
    interventions: string[];
    wounds?: string[];
    rashes?: string[];
    deformities?: string[];
  };
}

// Secondary Survey - Enhanced
export interface SecondarySurvey {
  head: string[];
  neck: string[];
  chest: string[];
  abdomen: string[];
  pelvis: string[];
  extremities: string[];
  posterior: string[];
  neurological: string[];
  // Additional detail fields
  headDetailed?: {
    scalp: string[];
    face: string[];
    eyes: string[];
    ears: string[];
    nose: string[];
    mouth: string[];
  };
  spine?: string[];
}

// Medication - Enhanced
export interface Medication {
  name: string;
  dose?: string;
  frequency?: string;
  indication?: string;
  route?: string;
  sideEffects?: string[];
  interactions?: string[];
}

// Social History
export interface SocialHistory {
  smoking?: string;
  alcohol?: string;
  drugs?: string;
  occupation?: string;
  livingSituation?: string;
  supportSystem?: string;
}

// Family History
export interface FamilyHistory {
  conditions: string[];
  relevantToPresentation?: string[];
}

// Patient History - Enhanced
export interface PatientHistory {
  medications: Medication[];
  allergies: string[];
  medicalConditions: string[];
  surgicalHistory: string[];
  lastMeal: string;
  eventsLeading: string;
  socialHistory?: SocialHistory;
  familyHistory?: FamilyHistory;
  previousSimilarEpisodes?: string[];
  immunizations?: string[];
}

// Investigation/Procedure
export interface Investigation {
  name: string;
  indication: string;
  findings?: string;
  interpretation?: string;
  urgency: 'immediate' | 'urgent' | 'routine';
}

// Individual Patient Profile (for MCI scenarios)
export interface IndividualPatient {
  id: string;
  priority: 'red' | 'yellow' | 'green' | 'black';
  age: number;
  gender: Gender;
  name?: string;
  patientInfo: {
    age: number;
    gender: Gender;
    weight: number;
    occupation?: string;
    language: string;
    medicalConditions?: string[];
    medications?: string[];
    allergies?: string[];
  };
  presentation: {
    generalImpression: string;
    position: string;
    appearance: string;
    consciousness: string;
    complaints: string[];
  };
  vitals: VitalSigns;
  abcde: ABCDEAssessment;
  secondarySurvey: SecondarySurvey;
  injuries: {
    head?: string[];
    neck?: string[];
    chest?: string[];
    abdomen?: string[];
    pelvis?: string[];
    extremities?: string[];
    posterior?: string[];
  };
  interventions: string[];
  transportPriority: 'immediate' | 'urgent' | 'delayed' | 'expectant';
  destination?: string;
  specialConsiderations?: string[];
}

// MCI (Mass Casualty Incident) Structure
export interface MCIScenario {
  isMCI: true;
  totalPatients: number;
  patients: IndividualPatient[];
  triageCategories: {
    red: number;
    yellow: number;
    green: number;
    black: number;
  };
  resources: {
    ambulancesNeeded: number;
    helicopters?: number;
    fireRescue: boolean;
    police: boolean;
    additionalParamedics: number;
  };
  commandStructure: {
    incidentCommander?: string;
    triageOfficer?: string;
    treatmentOfficer?: string;
    transportOfficer?: string;
  };
}

// Student Expectation/Checklist Item - Enhanced
export interface ChecklistItem {
  id: string;
  category: 'abcde' | 'secondary' | 'history' | 'intervention' | 'communication' | 'documentation' |
  'safety' | 'procedural' | 'medication' | 'equipment' | 'clinical-reasoning' | 'team-lead';
  description: string;
  points: number;
  yearLevel: StudentYear[];
  complexity: ComplexityLevel[];
  critical?: boolean;
  timeframe?: string;
  details?: string[];
  rationale?: string;
  commonErrors?: string[];
  hints?: string[];
}

// Case Variation - Different presentations of same condition
export interface CaseVariation {
  id: string;
  name: string;
  description: string;
  difficultyModifier: number;
  changes: {
    presentation?: Partial<CaseScenario['initialPresentation']>;
    vitals?: Partial<VitalSigns>;
    findings?: Partial<CaseScenario['expectedFindings']>;
  };
}

// Case Scenario - Enhanced
export interface CaseScenario {
  id: string;
  title: string;
  category: CaseCategory;
  subcategory?: string;
  /**
   * Explicit initial ECG rhythm — overrides keyword-based rhythm detection.
   * Use this whenever the narrative's primary rhythm could be ambiguous
   * from the free-text fields (e.g. asystole arrests where a differential
   * list mentions "VF"). Accepts the same strings the monitor renders:
   * 'Asystole', 'Ventricular Fibrillation', 'Ventricular Tachycardia',
   * 'PEA', 'Sinus Tachycardia', 'Normal Sinus Rhythm', etc.
   */
  initialRhythm?: string;
  priority: CasePriority;
  complexity: ComplexityLevel;
  yearLevels: StudentYear[];
  estimatedDuration?: number;
  criticalActions?: CriticalAction[];

  // Variations
  variations?: CaseVariation[];

  // Dispatch Information
  dispatchInfo: {
    callReason: string;
    timeOfDay: TimeOfDay;
    location: string;
    callerInfo: string;
    dispatchCode?: string;
    additionalInfo?: string[];
  };

  // Patient Information
  patientInfo: {
    age: number;
    gender: Gender;
    weight: number;
    occupation?: string;
    language: string;
    culturalConsiderations?: string[];
  };

  // Scene Information
  sceneInfo: {
    description: string;
    hazards: string[];
    bystanders: string;
    environment: string;
    accessIssues?: string[];
    extricationNeeded?: boolean;
    /**
     * Visual the student sees when the scene loads — the 3D environment
     * should match this backdrop. Optional so existing cases stay valid.
     */
    sceneImagePath?: string;
    sceneImageCaption?: string;
    /**
     * Optional animated arrival clip (muted/looping) shown in place of the
     * static scene image. When absent, the static image renders. Optional so
     * existing cases stay valid.
     */
    sceneVideoPath?: string;
    /** Explicit environment override so the 3D scene matches the authored incident. */
    environmentVariant?:
      | 'clinic'
      | 'home'
      | 'public'
      | 'roadside'
      | 'industrial'
      | 'fire'
      | 'water'
      | 'heat'
      | 'agricultural';
    /** Explicit furniture supporting the patient before crew transfer. */
    patientSupportSurface?: 'bed' | 'sofa' | 'seat' | 'stretcher';
  };

  // Initial Presentation
  initialPresentation: {
    generalImpression: string;
    position: string;
    appearance: string;
    consciousness: string;
    odor?: string[];
    sounds?: string[];
  };

  // Assessments
  abcde: ABCDEAssessment;
  secondarySurvey: SecondarySurvey;
  history: PatientHistory;
  investigations?: Investigation[];

  // Vital Signs Progression
  vitalSignsProgression: {
    initial: VitalSigns;
    afterIntervention?: VitalSigns;
    enRoute?: VitalSigns;
    deterioration?: VitalSigns;
  };

  // Expected Findings for Instructor
  expectedFindings: {
    keyObservations: string[];
    redFlags: string[];
    differentialDiagnoses: string[];
    mostLikelyDiagnosis: string;
    supportingEvidence?: string[];
    contradictingEvidence?: string[];
  };

  // Management Pathway
  managementPathway?: {
    immediate: string[];
    definitive: string[];
    monitoring: string[];
    transportConsiderations?: string[];
  };

  // Student Checklist
  studentChecklist: ChecklistItem[];

  // Teaching Points
  teachingPoints: string[];

  // Pitfalls
  commonPitfalls?: string[];

  // References
  references?: string[];

  // Visual Resources for Teaching
  visualResources?: VisualResources;

  // Equipment Needed for Case
  equipmentNeeded?: string[];

  // UAE-Specific Protocols and Guidelines
  uaeProtocols?: {
    applicableGuidelines: string[];
    receivingFacilities?: {
      name: string;
      location: string;
      capabilities: string[];
      contact?: string;
      distance?: string;
    }[];
    localConsiderations?: string[];
  };

  // MCI (Mass Casualty Incident) - Multiple Patients
  mci?: MCIScenario;

  // Metadata
  createdAt: string;
  updatedAt: string;
  version: number;
  author?: string;
  reviewedBy?: string[];
}

// Vital Signs
export interface VitalSigns {
  time?: string;
  bp: string;
  pulse: number;
  respiration: number;
  spo2: number;
  temperature?: number;
  gcs?: number;
  bloodGlucose?: number;
  etco2?: number;
  painScore?: number;
}

// Generated Case Session - Enhanced
export interface CaseSession {
  id: string;
  caseId: string;
  variationId?: string;
  studentYear: StudentYear;
  generatedAt: string;
  completedItems: string[];
  notes: string;
  score: number;
  totalPossible: number;
  instructorName?: string;
  studentName?: string;
  startTime?: string;
  endTime?: string;
  timeTaken?: number;
  interventionsPerformed?: string[];
  simulationObjective?: SimulationObjective;
  isConditionSelected?: boolean;
  selectedCondition?: string;
  preBriefingCompleted?: boolean;
  preBriefingTime?: number;
  debriefingResources?: DebriefingResource[];
}

// Applied Treatment Tracking
export interface AppliedTreatment {
  id: string;
  name?: string;
  description: string;
  appliedAt: string;
  effects: {
    vitalSign: string;
    oldValue: number | string;
    newValue: number | string;
    unit: string;
  }[];
  category: 'abcde' | 'intervention' | 'documentation' | 'communication' | 'procedural' | 'secondary' | 'history' | 'safety' | 'medication' | 'equipment' | 'clinical-reasoning' | 'team-lead' | 'airway' | 'breathing' | 'circulation' | 'procedure' | 'comfort' | 'positioning' | 'psychological';
  isActive: boolean;
}

// Filter Options
export interface CaseFilter {
  yearLevel?: StudentYear;
  category?: CaseCategory;
  priority?: CasePriority;
  complexity?: ComplexityLevel;
  searchQuery?: string;
  duration?: 'short' | 'medium' | 'long';
}

// Case Summary for Display
export interface CaseSummary {
  id: string;
  title: string;
  category: CaseCategory;
  priority: CasePriority;
  complexity: ComplexityLevel;
  patientAge: number;
  patientGender: Gender;
  dispatchReason: string;
  suitableFor: StudentYear[];
  estimatedDuration?: number;
  hasVariations?: boolean;
}

// Progress Tracking
export interface StudentProgress {
  studentId: string;
  totalCases: number;
  averageScore: number;
  casesByCategory: Record<CaseCategory, number>;
  improvementTrend: 'improving' | 'stable' | 'declining';
  weakAreas: string[];
  strongAreas: string[];
}

// Case Statistics
export interface CaseStatistics {
  caseId: string;
  timesUsed: number;
  averageScore: number;
  averageCompletionTime: number;
  mostMissedItems: string[];
  difficultyRating: number;
}

// ============================================================================
// ECG TYPES
// ============================================================================

export interface ECGFinding {
  location: string;
  description: string;
  significance: 'critical' | 'important' | 'supportive';
}

export interface ECGInterpretation {
  rhythm: string;
  rate: number;
  axis: string;
  prInterval: string;
  qrsDuration: string;
  qtInterval: string;
  stSegment: string;
  tWave: string;
  other?: string[];
}

export interface ECGCase {
  id: string;
  title: string;
  category: 'STEMI' | 'NSTEMI' | 'Arrhythmia' | 'Conduction' | 'Metabolic' | 'Toxic' | 'Normal';
  interpretation: ECGInterpretation;
  keyFindings: ECGFinding[];
  clinicalContext: string;
  differentials: string[];
  teachingPoints: string[];
  pitfalls: string[];
  associatedConditions: string[];
  referenceUrl?: string;
}

// ============================================================================
// CLINICAL GUIDELINES TYPES
// ============================================================================

export interface GuidelineReference {
  id: string;
  source: 'ATLS' | 'ACLS' | 'ERC' | 'ILCOR' | 'RCUK' | 'AHA' | 'JRCALC' | 'ALS';
  title: string;
  year: number;
  url?: string;
  keyPoints: string[];
}

export interface GuidelineChecklistItem {
  guidelineId: string;
  requirement: string;
  timeframe?: string;
  criticalAction: boolean;
  rationale: string;
  commonErrors: string[];
  evidenceLevel: 'A' | 'B' | 'C' | 'Expert Opinion';
}

// ============================================================================
// ENHANCED CHECKLIST TYPES
// ============================================================================

export type ChecklistCategory =
  | 'abcde'
  | 'secondary'
  | 'history'
  | 'intervention'
  | 'communication'
  | 'documentation'
  | 'safety'
  | 'procedural'
  | 'medication'
  | 'equipment'
  | 'clinical-reasoning'
  | 'team-lead'
  | 'neurological-assessment'
  | 'perfusion-assessment'
  | 'ecg-interpretation'
  | 'guideline-adherence';

export interface EnhancedChecklistItem {
  id: string;
  category: ChecklistCategory;
  description: string;
  points: number;
  yearLevel: StudentYear[];
  complexity: ComplexityLevel[];
  critical?: boolean;
  timeframe?: string;
  details?: string[];
  rationale?: string;
  commonErrors?: string[];
  hints?: string[];
  guidelineReference?: string;
  assessmentTechnique?: string;
  expectedFindings?: string[];
  abnormalFindings?: string[];
}

// ============================================================================
// SUBCATEGORY TYPES
// ============================================================================

export interface CaseSubcategory {
  id: string;
  category: CaseCategory;
  subcategory: string;
  label: string;
  description: string;
  icon?: string;
  color: string;
  caseCount: number;
}

export interface SubcategoryFilter {
  category: CaseCategory;
  subcategory?: string;
}

// ============================================================================
// LEARNING OUTCOME TYPES
// ============================================================================

export interface LearningOutcome {
  id: string;
  category: string;
  outcome: string;
  criteria: string[];
  assessmentMethods: string[];
  yearLevel: StudentYear[];
}

export interface ModuleLearningOutcomes {
  moduleId: string;
  moduleName: string;
  outcomes: LearningOutcome[];
  prerequisites?: string[];
  resources: string[];
}

// ============================================================================
// VISUAL RESOURCES TYPES
// ============================================================================

export interface VisualResource {
  id: string;
  type: 'image' | 'video' | 'article' | 'infographic' | 'animation' | 'podcast' | 'case-study';
  title: string;
  url: string;
  thumbnail?: string;
  source: string;
  caption?: string;
  duration?: string;
  category?: string;
  relevance: 'essential' | 'important' | 'supplementary';
  tags?: string[];
  usageContext?: 'prebriefing' | 'debriefing' | 'both';
}

export interface VisualResources {
  images?: VisualResource[];
  videos?: VisualResource[];
  articles?: VisualResource[];
  procedures?: VisualResource[];
  assessment?: VisualResource[];
  management?: VisualResource[];
}

// ============================================================================
// INSTRUCTOR NOTES & FEEDBACK TYPES
// ============================================================================

export interface InstructorAssessmentNote {
  id: string;
  timestamp: string;
  category: 'omitted' | 'incomplete' | 'excellent' | 'critical-miss' | 'communication' | 'safety' | 'clinical-reasoning';
  phase: 'dispatch' | 'scene-safety' | 'primary-survey' | 'secondary-survey' | 'history-taking' | 'intervention' | 'packaging' | 'handover';
  finding: string;
  whatWasMissed: string;
  whyItMatters: string;
  improvementAction: string;
  severity: 'critical' | 'important' | 'learning-point';
}

export interface YearSpecificExpectations {
  yearLevel: StudentYear;
  focusAreas: string[];
  assessmentEmphasis: {
    primarySurvey: string[];
    historyTaking: string[];
    secondarySurvey: string[];
    documentation: string[];
  };
  skillsExpected: string[];
  skillsIntroduced: string[];
  commonOmissions: string[];
  teachingPriorities: string[];
}

export interface AssessmentDomain {
  domain: string;
  description: string;
  weight: number;
  criteria: {
    excellent: string;
    satisfactory: string;
    needsImprovement: string;
    unsafe: string;
  };
}

export interface YearLevelRubric {
  yearLevel: StudentYear;
  domains: AssessmentDomain[];
  criticalActions: string[];
  assessmentFocus: string;
  expectationsSummary: string;
}

export interface InstructorFeedbackSession {
  sessionId: string;
  caseId: string;
  studentYear: StudentYear;
  instructorName?: string;
  studentName?: string;
  date: string;
  overallScore: number;
  totalScore: number;
  assessmentNotes: InstructorAssessmentNote[];
  strengths: string[];
  areasForImprovement: string[];
  actionPlan: string[];
  instructorNotes: string;
  followUpNeeded: boolean;
  followUpNotes?: string;
}

export interface QuickAssessmentTag {
  id: string;
  label: string;
  category: 'positive' | 'negative' | 'critical' | 'instruction';
  description: string;
  yearLevels: StudentYear[];
}

// ============================================================================
// CASE TESTING & FEEDBACK TYPES
// ============================================================================

export interface CaseTestResult {
  caseId: string;
  testCaseId: string;
  date: string;
  testerRole: 'instructor' | 'peer' | 'student';
  difficultyRating: number;
  clarityRating: number;
  relevanceRating: number;
  timeToComplete: number;
  issues: string[];
  suggestions: string[];
  approved: boolean;
}

export interface CaseVersion {
  version: number;
  date: string;
  changes: string[];
  author: string;
  feedback: CaseTestResult[];
}

export interface CaseFeedback {
  caseId: string;
  timestamp: string;
  feedbackType: 'bug' | 'improvement' | 'content' | 'clarity' | 'relevance';
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'deferred';
}

// ============================================================================
// SIMULATION OBJECTIVE TYPES (INACSL-aligned)
// ============================================================================

export interface SimulationObjective {
  id: string;
  primaryObjective: string;
  skillsFocus: string[];
  learningDomain: 'cognitive' | 'psychomotor' | 'affective';
  relatedCategories: CaseCategory[];
  relatedKeywords: string[];
}

export interface PreBriefingContent {
  objectives: string[];
  keyConceptReview: string[];
  relevantResources: VisualResource[];
  relevantArticles: VisualResource[];
  expectedSkills: string[];
  orientationNotes: string[];
  safetyBriefing: string[];
}

export interface DebriefingResource {
  id: string;
  title: string;
  url: string;
  type: 'article' | 'video' | 'guideline' | 'image' | 'case-study' | 'podcast';
  source: string;
  relevance: 'essential' | 'important' | 'supplementary';
  category: string;
}

export interface ResourceSource {
  id: string;
  name: string;
  baseUrl: string;
  type: 'foamed' | 'guideline' | 'imaging' | 'education' | 'government';
  categories: CaseCategory[];
}
