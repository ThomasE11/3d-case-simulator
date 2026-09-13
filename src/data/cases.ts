import type { CaseScenario } from '@/types';

// Import enhanced cases
import { enhancedCaseDatabase } from './enhancedCases';
import { additionalCaseDatabase } from './additionalCases';
import { firstYearCases } from './firstYearCases';
import { secondYearCases } from './secondYearCases';
import { litflCaseDatabase } from './litflCases';
import { severityVariantCases } from './severityVariantCases';

// Cohort rule + year metadata live in caseFilters.ts (pure, bundle-free).
import { isCaseAvailableForCohort, isStudentYear, type CohortMode } from './caseFilters';

// Import visual resources
import { getTraumaResourcesByCondition } from './traumaVisualResources';

// Helper function to create a case with enhanced structure
const createCase = (caseData: Partial<CaseScenario> & { id: string; title: string }): CaseScenario => ({
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...caseData,
} as CaseScenario);

// Comprehensive Case Database - 50+ Scenarios with Enhanced Detail
export const caseDatabase: CaseScenario[] = [
  // ==================== CARDIAC CASES (8 cases) ====================
  createCase({
    id: 'cardiac-001',
    title: 'Acute Anterior STEMI',
    category: 'cardiac',
    subcategory: 'stem-anterior',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Severe chest pain, patient called 998 himself',
      timeOfDay: 'morning',
      location: 'Private villa in Al Barsha, Dubai',
      callerInfo: 'Patient (45-year-old male)',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient sounds distressed', 'No history of this pain before']
    },
    patientInfo: {
      age: 45,
      gender: 'male',
      weight: 85,
      occupation: 'Business executive',
      language: 'English, Arabic',
      culturalConsiderations: ['Prefers male healthcare providers']
    },
    sceneInfo: {
      description: 'Well-maintained villa, patient sitting on living room sofa',
      hazards: [],
      bystanders: 'Wife present, anxious',
      environment: 'Air-conditioned, comfortable temperature',
      sceneImagePath: '/scene-assets/home-medical-male-dubai-apartment.png',
      sceneImageCaption: 'Private villa apartment — Al Barsha, Dubai',
      accessIssues: ['Security gate - code provided'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, diaphoretic, clutching chest',
      position: 'Sitting upright, leaning forward',
      appearance: 'Pale, sweaty, distressed',
      consciousness: 'Alert and oriented',
      sounds: ['Groaning with pain']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'No stridor', 'Able to speak in short sentences'],
        interventions: ['Maintain patent airway'],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 24,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 94,
        findings: ['Tachypneic', 'Bilateral air entry', 'Bibasal fine crackles'],
        interventions: ['Titrate oxygen to SpO2 94-98% (only supplement if <94% per NICE CG95 / ESC ACS 2023 — routine high-flow O2 in ACS may increase infarct size: AVOID / DETO2X-AMI)'],
        auscultation: ['Clear air entry bilaterally', 'Bibasal fine crackles', 'No wheeze']
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Weak, thready',
        bp: { systolic: 90, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Pale, clammy, diaphoretic',
        findings: ['Tachycardic', 'Borderline hypotensive', 'Poor perfusion'],
        interventions: ['IV access x2', 'Aspirin 300mg', 'GTN spray — use with caution if SBP remains above 90'],
        ecgFindings: ['ST elevation V1-V4', 'Tombstone ST segments', 'Reciprocal ST depression in II, III, aVF'],
        ivAccess: ['16G cannula right AC fossa']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive to light',
        bloodGlucose: 5.4,
        findings: ['No focal neurological deficits'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['No rashes', 'No external bleeding'],
        interventions: ['Keep warm']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['No JVD', 'Trachea central', 'No subcutaneous emphysema'],
      chest: ['Equal chest expansion', 'Heart sounds S1S2 present'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['Equal pulses bilaterally', 'No peripheral oedema'],
      posterior: ['No bruising'],
      neurological: ['GCS 15', 'No deficits']
    },
    history: {
      medications: [
        { name: 'Atorvastatin', dose: '40mg', frequency: 'Once daily', indication: 'High cholesterol', route: 'PO' },
        { name: 'Amlodipine', dose: '5mg', frequency: 'Once daily', indication: 'Hypertension', route: 'PO' }
      ],
      allergies: ['None known'],
      medicalConditions: ['Hypertension', 'Hyperlipidemia', 'Smoker (20 pack-years)'],
      surgicalHistory: ['Appendectomy 2010'],
      lastMeal: 'Breakfast 2 hours ago',
      eventsLeading: 'Chest pain started 30 minutes ago while at rest, described as crushing pressure radiating to left arm and jaw',
      socialHistory: {
        smoking: '20 pack-years, currently smoking',
        alcohol: 'Social',
        occupation: 'Business executive - high stress'
      }
    },
    investigations: [
      { name: '12-lead ECG', indication: 'Chest pain', findings: 'ST elevation V1-V4 with reciprocal ST depression in II, III, aVF', interpretation: 'Acute anterior STEMI', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '90/60', pulse: 110, respiration: 24, spo2: 94, gcs: 15, bloodGlucose: 5.4 },
      afterIntervention: { bp: '88/58', pulse: 98, respiration: 15, spo2: 99, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Crushing chest pain', 'Diaphoresis', 'Radiation to arm/jaw', 'Hypotension'],
      redFlags: ['STEMI presentation', 'Cardiogenic shock risk'],
      differentialDiagnoses: ['Acute MI', 'Acute Pericarditis', 'Aortic dissection', 'Pulmonary embolism'],
      mostLikelyDiagnosis: 'Acute Anterior STEMI',
      supportingEvidence: ['ST elevation V1-V4', 'Reciprocal ST depression II, III, aVF', 'Typical chest pain', 'Diaphoresis']
    },
    managementPathway: {
      immediate: ['Aspirin 300mg', 'GTN spray', 'IV access', '12-lead ECG'],
      definitive: ['Primary PCI', 'Thrombolysis if PCI not available within 120 min'],
      monitoring: ['Continuous ECG', 'BP monitoring', 'SpO2'],
      transportConsiderations: ['Pre-alert cardiac center', 'Priority 1 transport', 'Consider HEMS']
    },
    studentChecklist: [
      { id: 'c1-1', category: 'abcde', description: 'Assess airway patency', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], rationale: 'Airway is first priority in ABCDE approach' },
      { id: 'c1-2', category: 'abcde', description: 'Titrate oxygen to SpO2 94–98% (avoid routine high-flow O2 in ACS — DETO2X-AMI)', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], rationale: 'Hyperoxia in ACS is associated with worse outcomes (DETO2X-AMI 2017); titrate only if SpO2 < 94%' },
      { id: 'c1-3', category: 'abcde', description: 'Establish IV access', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'c1-4', category: 'intervention', description: 'Give Aspirin 300mg', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true, timeframe: 'Within 5 minutes', rationale: 'Antiplatelet therapy reduces mortality in STEMI' },
      { id: 'c1-5', category: 'intervention', description: 'Administer GTN (if BP allows)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], rationale: 'GTN contraindicated if SBP < 90 mmHg' },
      { id: 'c1-6', category: 'communication', description: 'Pre-alert cardiac center', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c1-7', category: 'documentation', description: 'Obtain 12-lead ECG within 10 minutes', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true, timeframe: 'Within 10 minutes of arrival', rationale: 'Time is muscle - rapid ECG essential' }
    ],
    teachingPoints: [
      'Time is muscle - rapid recognition and transport is crucial in STEMI management',
      'Obtain 12-lead ECG within 10 minutes of arrival per DCAS protocol',
      'Aspirin 300mg should be given immediately unless contraindicated (allergy, active bleeding)',
      'GTN is contraindicated if SBP < 90 mmHg, RV infarct, or recent PDE5 inhibitor use',
      'Door-to-balloon time target is 90 minutes, door-to-needle is 30 minutes for thrombolysis',
      'Morphine 2-4mg IV may be given for ongoing chest pain after GTN if BP allows',
      'Clopidogrel 300mg loading dose if PCI planned (per DCAS ACS protocol)',
      'In Dubai, Rashid Hospital, American Hospital, and Mediclinic City Hospital have 24/7 PCI capability',
      'Consider HEMS activation for rural areas or traffic delays to achieve timely reperfusion'
    ],
    commonPitfalls: [
      'Delaying ECG acquisition to obtain full history - ECG should be obtained immediately',
      'Administering GTN when patient is hypotensive (SBP < 90 mmHg)',
      'Failing to pre-alert receiving cardiac center with STEMI notification',
      'Not recognizing posterior MI when ST depression V1-V3 with tall R waves present',
      'Overlooking right ventricular infarct which contraindicates GTN use',
      'Delaying transport waiting for pain relief - transport should not be delayed',
      'Forgetting to document time of onset and first medical contact for quality metrics'
    ],
    equipmentNeeded: [
      'Monitor/defibrillator with 12-lead ECG capability',
      'High-flow oxygen with non-rebreather mask',
      'IV cannulation kit (14G or 16G)',
      'Aspirin 300mg chewable',
      'GTN spray or sublingual tablets',
      'Morphine sulfate 10mg/1ml ampoules',
      'Clopidogrel 75mg tablets',
      'Atropine 1mg (for bradycardia if develops)',
      'Defibrillation pads (in case of deterioration to VF)',
      'Transport stretcher with Trendelenburg capability'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Acute Coronary Syndrome Protocol v4.2',
        'DCAS 12-Lead ECG Acquisition Standards',
        'Dubai Hospital STEMI Pathway - Prehospital Phase'
      ],
      receivingFacilities: [
        { name: 'Rashid Hospital', location: 'Dubai', capabilities: ['24/7 PCI', 'Cardiac Surgery'], contact: '04 219 3000', distance: '25km from Al Barsha' },
        { name: 'American Hospital Dubai', location: 'Dubai', capabilities: ['24/7 PCI'], contact: '04 377 5500', distance: '15km from Al Barsha' },
        { name: 'Mediclinic City Hospital', location: 'Dubai Healthcare City', capabilities: ['24/7 PCI'], contact: '04 435 9999', distance: '20km from Al Barsha' }
      ],
      localConsiderations: [
        'Traffic patterns on Sheikh Zayed Road can significantly impact transport times - consider alternative routes via Al Khail Road',
        'Many villa communities have gated access - obtain gate codes from dispatch',
        'Dubai summer temperatures can exacerbate patient distress - keep patient cool but not cold',
        'Cultural sensitivity: many patients prefer same-gender providers when available'
      ]
    },
    visualResources: {
      images: [],
      videos: [
        {
          id: 'stemi-ecg-recognition',
          type: 'video',
          title: '12-Lead ECG Interpretation in STEMI',
          url: 'https://www.youtube.com/watch?v=uqNQvKxAiuo',
          source: 'Armando Hasudungan',
          duration: '15:30',
          caption: 'Comprehensive review of ECG findings in STEMI including anterior, inferior, and posterior locations',
          relevance: 'important',
          tags: ['STEMI', 'ECG', '12-lead', 'interpretation']
        },
        {
          id: 'acs-management',
          type: 'video',
          title: 'Acute Coronary Syndrome Prehospital Management',
          url: 'https://www.youtube.com/watch?v=D2ZpsgfhQUU',
          source: 'MedCram',
          duration: '22:15',
          caption: 'Evidence-based prehospital management of ACS including medication administration and transport decisions',
          relevance: 'essential',
          tags: ['ACS', 'STEMI', 'prehospital', 'management']
        }
      ],
      articles: [
        {
          id: 'stemi-pathophysiology',
          type: 'article',
          title: 'STEMI: Pathophysiology and Prehospital Management',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4568835/',
          source: 'Journal of Emergency Medical Services',
          caption: 'Detailed review of STEMI pathophysiology and evidence-based prehospital care',
          relevance: 'important',
          tags: ['STEMI', 'pathophysiology', 'management']
        },
        {
          id: 'door-to-balloon',
          type: 'article',
          title: 'Door-to-Balloon Time: Why Every Minute Matters',
          url: 'https://www.ahajournals.org/doi/10.1161/CIRCULATIONAHA.107.742833',
          source: 'Circulation',
          caption: 'Landmark study demonstrating mortality benefit of rapid reperfusion in STEMI',
          relevance: 'important',
          tags: ['STEMI', 'reperfusion', 'time-critical']
        }
      ]
    }
  }),

  createCase({
    id: 'cardiac-002',
    title: 'Out-of-Hospital Cardiac Arrest',
    category: 'cardiac',
    subcategory: 'asystole',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 35,
    dispatchInfo: {
      callReason: 'Husband not breathing, wife found him unconscious in bed',
      timeOfDay: 'early-morning',
      location: 'Apartment in Deira, Dubai',
      callerInfo: 'Wife (distressed)',
      dispatchCode: 'Delta-1',
      additionalInfo: ['Patient last seen 4 hours ago', 'Wife unable to move patient']
    },
    patientInfo: {
      age: 62,
      gender: 'male',
      weight: 78,
      occupation: 'Retired engineer',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Small apartment, patient in bedroom',
      hazards: ['Cluttered floor'],
      bystanders: 'Wife and adult son present',
      environment: 'Dim lighting, warm',
      sceneImagePath: '/scene-assets/cardiac-002-home-cardiac-arrest-deira.png',
      sceneImageCaption: 'Apartment interior — Deira, Dubai',
      accessIssues: ['Narrow hallway', 'Patient on bed']
    },
    initialPresentation: {
      generalImpression: 'Elderly male, supine in bed, unresponsive',
      position: 'Supine',
      appearance: 'Cyanotic around lips, no visible breathing',
      consciousness: 'Unresponsive'
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Airway obstructed by tongue', 'No gag reflex'],
        interventions: ['Head tilt chin lift', 'Insert oropharyngeal airway'],
        adjunctsNeeded: ['OPA size 90mm', 'Suction']
      },
      breathing: {
        rate: 0,
        rhythm: 'None',
        depth: 'None',
        spo2: 0,
        findings: ['Apneic', 'No chest movement'],
        interventions: ['BVM ventilation', 'Consider advanced airway']
      },
      circulation: {
        pulseRate: 0,
        pulseQuality: 'None',
        bp: { systolic: 0, diastolic: 0 },
        capillaryRefill: 0,
        skin: 'Pale, mottled',
        findings: ['No carotid pulse', 'Asystole on monitor'],
        interventions: ['Immediate CPR', 'Defibrillation if indicated']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 1, total: 3 },
        pupils: 'Dilated, fixed',
        findings: ['Unresponsive', 'No brainstem reflexes'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['No obvious trauma', 'Medical alert bracelet - Diabetes'],
        interventions: ['Full exposure for assessment']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['No JVD'],
      chest: ['No scars'],
      abdomen: ['Soft'],
      pelvis: ['Stable'],
      extremities: ['No peripheral oedema'],
      posterior: ['No pressure sores'],
      neurological: ['Unresponsive']
    },
    history: {
      medications: [
        { name: 'Metformin', dose: '500mg', frequency: 'Twice daily', indication: 'Diabetes' },
        { name: 'Insulin', dose: 'Variable', frequency: 'As directed', indication: 'Diabetes' },
        { name: 'Aspirin', dose: '75mg', frequency: 'Once daily', indication: 'Heart protection' }
      ],
      allergies: ['Penicillin'],
      medicalConditions: ['Type 2 Diabetes', 'Hypertension', 'Previous MI (2019)'],
      surgicalHistory: ['CABG 2019'],
      lastMeal: 'Dinner 8 hours ago',
      eventsLeading: 'Wife woke up to find husband unresponsive, last seen normal 4 hours ago'
    },
    vitalSignsProgression: {
      initial: { bp: '0/0', pulse: 0, respiration: 0, spo2: 0, gcs: 3 },
      afterIntervention: { bp: '0/0', pulse: 0, respiration: 10, spo2: 95, gcs: 3 },
      deterioration: { bp: '0/0', pulse: 0, respiration: 0, spo2: 0, gcs: 3 }
    },
    expectedFindings: {
      keyObservations: ['Unresponsive', 'Apneic', 'Pulseless', 'Asystole/PEA/VF', 'Downtime approximately 4 hours', 'Previous cardiac history (CABG 2019)'],
      redFlags: ['Prolonged cardiac arrest', 'Downtime unknown but likely significant', 'Previous MI and CABG', 'Poor prognostic factors'],
      differentialDiagnoses: ['Cardiac arrest - recurrent MI', 'Cardiac arrest - fatal arrhythmia', 'Cardiac arrest - PE', 'Hypoglycemia', 'Tension pneumothorax'],
      mostLikelyDiagnosis: 'Cardiac arrest secondary to recurrent myocardial infarction'
    },
    managementPathway: {
      immediate: ['Immediate CPR on firm surface - 30:2 ratio, depth 5-6cm, rate 100-120/min, optimize hand position and body position (AHA 2025)', 'AED/defibrillator application and rhythm analysis', 'Defibrillation if VF/pVT (150-200J biphasic)', 'Adrenaline 1mg IV every 3-5 minutes (Either IV or IO — AHA 2024 focused update weakly prefers IV when rapidly achievable without interrupting compressions; IO remains equally valid (PARAMEDIC-2, IVIO trials show equivalence). Do not delay CPR for access.)', 'Amiodarone 300mg IV/IO bolus after 3rd shock in refractory VF/pVT (further 150mg after 5th shock if still refractory)', 'Airway management with OPA/LMA/ETT', 'IV or IO access — either acceptable (AHA 2024 focused update; do NOT delay CPR for access)', 'Reversible causes assessment (Hs and Ts)'],
      definitive: ['24/7 Cardiac Catheterization Lab for PCI', 'Temperature control post-ROSC: target 32-36°C for at least 36 hours in adults who remain unresponsive (AHA 2025)', 'ECMO support if available', 'Cardiac surgery if indicated'],
      monitoring: ['Continuous ECG monitoring', 'End-tidal CO2 (ETCO2) - target >10mmHg', 'Blood pressure monitoring', 'SpO2 monitoring', 'Temperature monitoring', 'Blood glucose monitoring'],
      transportConsiderations: ['Pre-alert receiving hospital with ETA and clinical status', 'Do not delay transport for prolonged resuscitation on scene', 'Consider HEMS for rural areas or long transport times', 'Family notification and counseling', 'Continue CPR during transport unless ROSC achieved']
    },
    studentChecklist: [
      { id: 'c2-1', category: 'safety', description: 'Scene safety assessment - ensure safe to approach', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'c2-2', category: 'abcde', description: 'Confirm cardiac arrest - check responsiveness, breathing, and carotid pulse (within 10 seconds)', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c2-3', category: 'abcde', description: 'Initiate immediate high-quality CPR - 30:2 ratio, depth 5-6cm, rate 100-120/min', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c2-4', category: 'intervention', description: 'Apply AED/defibrillator and analyze rhythm immediately', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c2-5', category: 'intervention', description: 'If rhythm reveals VF/pVT, defibrillate 150-200J biphasic and resume CPR immediately. This patient presents in ASYSTOLE — defibrillation is NOT indicated. Continue compressions and adrenaline.', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: false, rationale: 'Defibrillation is only for shockable rhythms (VF/pVT). Shocking asystole is contraindicated and wastes time off the chest.' },
      { id: 'c2-6', category: 'intervention', description: 'Establish vascular access — AHA 2024 focused update: IV is preferred as first-attempt route; IO is acceptable backup if IV not achievable without prolonged compression interruption.', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c2-7', category: 'intervention', description: 'Administer adrenaline 1mg IV/IO every 3-5 minutes', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c2-8', category: 'intervention', description: 'Secure airway with OPA, LMA, or ETT - minimize CPR interruptions', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c2-9', category: 'intervention', description: 'Check blood glucose - rule out hypoglycemia as reversible cause', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'c2-10', category: 'abcde', description: 'Consider and treat reversible causes (Hs and Ts) throughout resuscitation', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c2-11', category: 'communication', description: 'Coordinate team roles - compressor, airway, medications, documentation', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c2-12', category: 'communication', description: 'Communicate with family - provide updates, explain procedures sensitively', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c2-13', category: 'documentation', description: 'Document arrest time, downtime, interventions, and response to treatment', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c2-amio', category: 'intervention', description: 'Amiodarone 300mg IV after 3rd shock — ONLY if rhythm becomes VF/pVT. NOT indicated for asystole or PEA (the patient is in asystole here).', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: false, rationale: 'Amiodarone is reserved for refractory shockable rhythms. It has no role in non-shockable arrests and giving it for asystole reflects a flawed mental model of the ACLS algorithm.' }
    ],
    teachingPoints: [
      'High-quality CPR is the most important intervention - depth 5-6cm, rate 100-120/min, full recoil, minimal interruptions (<10 seconds). AHA 2025 emphasizes optimizing hand position, body position, and patient positioning on a firm surface',
      'Early defibrillation is critical for shockable rhythms (VF/pVT) - every minute delay reduces survival by 7-10%',
      'Minimize interruptions to chest compressions - aim for >80% compression fraction',
      'AHA 2025: Breaths WITH compressions recommended (30:2 ratio) for both HCPs and trained lay rescuers who are willing and capable',
      'The 4 Hs: Hypoxia, Hypovolemia, Hypo/hyperkalemia, Hypothermia',
      'The 4 Ts: Tension pneumothorax, Tamponade, Thrombosis (MI/PE), Toxins',
      'AHA 2025: IV access is recommended OVER IO access for adult cardiac arrest. IO is second-line when IV is not achievable. Adrenaline 1mg IV every 3-5 minutes',
      'Advanced airway (ETT/LMA) should not delay CPR - basic airway adjuncts acceptable initially',
      'AHA 2025: Single unified Chain of Survival for all ages and settings (replaces separate IHCA/OHCA chains)',
      'Team coordination is essential - clear roles, closed-loop communication, regular updates',
      'Prognostic factors: downtime, initial rhythm, witnessed arrest, bystander CPR, ROSC achieved',
      'Termination of resuscitation: Consider after 20 minutes if no ROSC, no shockable rhythm, and no reversible causes identified',
      'Recognition of death: Prolonged unwitnessed downtime (>15-20 min), fixed dilated pupils, asystole, and no reversible cause may warrant withholding resuscitation per local guidelines',
      'Family presence during resuscitation: Can be beneficial with appropriate support and explanation',
      'Post-resuscitation care (AHA 2025): Temperature control at 32-36°C for at least 36 hours in adults who remain unresponsive after ROSC. Hemodynamic optimization, neurological assessment',
      'Documentation: Accurate timing of all interventions, drug doses, rhythm changes, and clinical decisions',
      'Debriefing: Critical incident stress management for team after traumatic arrest'
    ],
    commonPitfalls: [
      'Delayed recognition of cardiac arrest - spending too long checking pulse',
      'Poor quality CPR - inadequate depth, too fast/slow, leaning on chest',
      'Prolonged interruptions for rhythm checks or intubation',
      'Failure to use AED/defibrillator promptly',
      'Forgetting to check reversible causes (glucose, tension pneumothorax)',
      'Poor team coordination - no clear leader, chaotic approach',
      'Inadequate documentation of times and interventions',
      'Not communicating with family - leaving them uninformed',
      'Continuing futile resuscitation beyond reasonable timeframe',
      'Failure to plan for post-resuscitation care if ROSC achieved'
    ],
    visualResources: {
      images: [],
      videos: [
        {
          id: 'vid-cpr-001',
          type: 'video',
          title: 'High-Quality CPR Technique',
          url: 'https://www.youtube.com/watch?v=uqNQvKxAiuo',
          source: 'Armando Hasudungan',
          caption: 'Understanding syncope and near-syncope for EMS providers',
          duration: '18:30',
          relevance: 'essential',
          tags: ['syncope', 'EMS', 'assessment', 'vasovagal']
        }
      ],
      articles: [
        {
          id: 'art-cpr-001',
          type: 'article',
          title: 'Adult Advanced Life Support Guidelines (updated with AHA 2025)',
          url: 'https://www.resus.org.uk/library/2021-resuscitation-guidelines/adult-advanced-life-support-guidelines',
          source: 'Resuscitation Council UK / AHA 2025',
          caption: 'Guidelines for adult advanced life support and cardiac arrest management — cross-reference with AHA 2025 Guidelines for CPR and ECC',
          relevance: 'essential',
          tags: ['CPR', 'cardiac-arrest', 'resuscitation', 'ACLS']
        },
        {
          id: 'art-acls-001',
          type: 'article',
          title: 'ACLS Guidelines - Cardiac Arrest Algorithm',
          url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/advanced-cardiovascular-life-support-acls',
          source: 'American Heart Association',
          caption: 'Official AHA ACLS guidelines for cardiac arrest management',
          relevance: 'essential',
          tags: ['ACLS', 'AHA', 'guidelines', 'algorithm']
        },
        {
          id: 'art-erc-001',
          type: 'article',
          title: 'ERC Guidelines - Adult Advanced Life Support',
          url: 'https://www.cprguidelines.eu/',
          source: 'European Resuscitation Council',
          caption: 'European resuscitation guidelines for cardiac arrest',
          relevance: 'essential',
          tags: ['ERC', 'guidelines', 'ALS', 'resuscitation']
        }
      ],
      procedures: [
        {
          id: 'proc-airway-001',
          type: 'video',
          title: 'Airway Management in Cardiac Arrest',
          url: 'https://www.youtube.com/watch?v=D2ZpsgfhQUU',
          source: 'MedCram',
          caption: 'Techniques for airway management during CPR with minimal interruptions',
          duration: '12:30',
          relevance: 'important',
          tags: ['airway', 'intubation', 'LMA', 'cardiac-arrest']
        }
      ]
    },
    equipmentNeeded: [
      'Defibrillator/monitor with pacing capability',
      'CPR face shield or pocket mask',
      'Bag-valve-mask (BVM) with oxygen reservoir',
      'Oropharyngeal airways (sizes 80-100mm)',
      'Supraglottic airway (LMA/i-gel) sizes 3-5',
      'Endotracheal tubes (sizes 7.0-8.0mm)',
      'Laryngoscope with blades (Mac 3-4)',
      'Suction unit with Yankauer catheter',
      'IV cannulation kit (14G-18G)',
      'Intraosseous access kit (EZ-IO)',
      'Adrenaline 1:10,000 (1mg/10ml) prefilled syringes',
      'Amiodarone 300mg for refractory VF/VT',
      'Sodium bicarbonate 8.4% (for prolonged arrest)',
      'Normal saline 0.9% 500ml bags',
      'Blood glucose testing kit',
      'Temperature monitoring device',
      'Transport stretcher with backboard',
      'AED/defibrillation pads (adult)',
      'CPR feedback device (if available)',
      'Stopwatch/timer for rhythm checks'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Cardiac Arrest Protocol v5.1',
        'DCAS Advanced Airway Management Guidelines',
        'Dubai Resuscitation Council - Adult BLS/ALS Standards',
        'UAE National Ambulance Service Clinical Guidelines'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Emergency Department',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Cardiac Catheterization', 'ECMO', 'Targeted Temperature Management'],
          contact: '04 219 3000',
          distance: '10 minutes from Deira'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Emergency Cardiac Care', 'Cardiac Surgery'],
          contact: '04 222 1211',
          distance: '8 minutes from Deira'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha',
          capabilities: ['24/7 PCI', 'Advanced Cardiac Life Support'],
          contact: '04 377 5500',
          distance: '15 minutes from Deira'
        }
      ],
      localConsiderations: [
        'Deira has narrow streets and heavy traffic - use GPS for optimal routing',
        'Many older apartments lack elevators - be prepared for stair carry',
        'Cultural sensitivity: family members may want to pray - provide quiet space if possible',
        'Dubai Police forensic team may attend if death pronounced on scene',
        'Document exact downtime carefully - UAE law requires specific intervals for death certification',
        'Bystander CPR rates in UAE improving but still low - emphasize public CPR training programs',
        'Language barriers common in Deira - use translation apps or bilingual crew members',
        'Summer temperatures can affect team performance - rotate compressors every 2 minutes and ensure hydration',
        'Post-resuscitation cooling may be initiated by ambulance crews per DCAS protocol',
        'Family notification: Cultural norms may require senior family member to be contacted first'
      ]
    }
  }),

  createCase({
    id: 'cardiac-003',
    title: 'Atrial Fibrillation with Rapid Ventricular Response',
    category: 'cardiac',
    subcategory: 'afib',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    dispatchInfo: {
      callReason: 'Palpitations and dizziness',
      timeOfDay: 'afternoon',
      location: 'Office in Downtown Dubai',
      callerInfo: 'Colleague',
      dispatchCode: 'Charlie-1'
    },
    patientInfo: {
      age: 58,
      gender: 'female',
      weight: 70,
      occupation: 'Accountant',
      language: 'English'
    },
    sceneInfo: {
      description: 'Office environment, patient at desk',
      hazards: [],
      bystanders: 'Several colleagues',
      environment: 'Air-conditioned office',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/office-female-palpitations-syncope-dubai.png',
      sceneImageCaption: 'Scene — Air-conditioned office',
    },
    initialPresentation: {
      generalImpression: 'Middle-aged female, anxious, uncomfortable',
      position: 'Sitting',
      appearance: 'Pale, anxious',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['Mild tachypnea'],
        interventions: ['Oxygen if symptomatic']
      },
      circulation: {
        pulseRate: 150,
        pulseQuality: 'Irregularly irregular',
        bp: { systolic: 110, diastolic: 70 },
        capillaryRefill: 2,
        skin: 'Warm, dry',
        findings: ['Tachycardic', 'Irregular pulse'],
        interventions: ['IV access', 'ECG monitoring'],
        ecgFindings: ['Irregularly irregular rhythm', 'No P waves', 'Narrow QRS']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['No abnormalities'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['No JVD'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['No peripheral oedema', 'Peripheral pulses present'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Warfarin', dose: '5mg', frequency: 'Daily', indication: 'AF anticoagulation' }
      ],
      allergies: ['None'],
      medicalConditions: ['Atrial fibrillation', 'Hypertension'],
      surgicalHistory: [],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Sudden onset of palpitations while working at desk'
    },
    vitalSignsProgression: {
      initial: { bp: '110/70', pulse: 150, respiration: 22, spo2: 96, gcs: 15, bloodGlucose: 5.4 },
      afterIntervention: { bp: '98/62', pulse: 130, respiration: 15, spo2: 99, gcs: 15 },
      deterioration: { bp: '90/60', pulse: 165, respiration: 28, spo2: 92, gcs: 13 }
    },
    expectedFindings: {
      keyObservations: ['Irregularly irregular pulse', 'Rate 150 bpm', 'On warfarin anticoagulation', 'Hemodynamically stable', 'No chest pain'],
      redFlags: ['Hypotension (SBP <90)', 'Chest pain', 'Acute heart failure', 'Altered mental status', 'Signs of shock'],
      differentialDiagnoses: ['AF with RVR', 'Atrial flutter with variable block', 'Multifocal atrial tachycardia', 'Thyrotoxicosis', 'PE', 'Hypovolemia', 'Infection/sepsis'],
      mostLikelyDiagnosis: 'Atrial Fibrillation with Rapid Ventricular Response'
    },
    managementPathway: {
      immediate: [
        'Assess hemodynamic stability — BP, GCS, chest pain, signs of shock',
        'Obtain 12-lead ECG to confirm rhythm',
        'IV access x1 (18G)',
        'If UNSTABLE (SBP <90, chest pain, GCS <14): Synchronized cardioversion 100-200J biphasic with procedural sedation',
        'If STABLE: prehospital focus is continuous monitoring, IV access, identifying precipitants (infection, PE, dehydration, thyroid, alcohol). IV rate-control agents (metoprolol 5mg IV or diltiazem 0.25mg/kg IV) are administered in ED under cardiac monitoring — not routinely within UK JRCALC / UAE DCAS paramedic scope.',
        'Oxygen if SpO2 <94%',
        'Check anticoagulation status — warfarin/DOAC compliance'
      ],
      definitive: [
        'Rate control target: HR <110 bpm (lenient) or <80 bpm (strict)',
        'Hospital admission for rhythm management and electrophysiology review',
        'Identify and treat trigger (infection, PE, dehydration, thyroid disease)'
      ],
      monitoring: [
        'Continuous ECG monitoring',
        'BP every 5 minutes after rate-control medications',
        'SpO2 continuous',
        'Monitor for deterioration — be prepared to cardiovert if haemodynamic compromise'
      ],
      transportConsiderations: [
        'Transport to facility with cardiology capabilities — American Hospital Dubai or Dubai Hospital',
        'Pre-alert with rate, rhythm, haemodynamic status, and anticoagulation history',
        'Continuous monitoring during transport — be prepared for cardioversion en route'
      ]
    },
    studentChecklist: [
      { id: 'c3-1', category: 'abcde', description: 'Assess hemodynamic stability - BP, mental status, signs of shock, chest pain', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c3-2', category: 'intervention', description: 'Obtain 12-lead ECG immediately to confirm rhythm', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c3-3', category: 'intervention', description: 'Establish IV access for medication administration', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'c3-4', category: 'intervention', description: 'Recognise that IV rate-control (metoprolol / diltiazem) is an in-hospital decision under continuous monitoring — prehospital paramedic role is monitoring, IV access, precipitant identification, and pre-alert.', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c3-5', category: 'intervention', description: 'Check INR if on warfarin - assess stroke risk', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c3-6', category: 'intervention', description: 'Administer fluids if hypovolemic - consider dehydration as trigger', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c3-7', category: 'history', description: 'Identify triggers: infection, thyroid, alcohol, dehydration, PE', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c3-8', category: 'abcde', description: 'Monitor for deterioration: ongoing tachycardia, hypotension, chest pain', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c3-9', category: 'communication', description: 'Transport to hospital with continuous monitoring', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c3-10', category: 'documentation', description: 'Document rhythm, rate, ECG findings, interventions, and response', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'AF with RVR: Irregularly irregular rhythm with rate >100 bpm - no discernible P waves, fibrillatory waves may be present',
      'Hemodynamic stability assessment is CRITICAL first step - check BP, mental status, chest pain, signs of shock',
      'UNSTABLE AF (hypotension, chest pain, altered mental status, acute heart failure): Requires immediate synchronized cardioversion - 100-200J biphasic',
      'STABLE AF: Rate control with beta-blockers (Metoprolol 5mg IV q5min x3) or calcium channel blockers (Diltiazem 0.25mg/kg IV)',
      'Avoid beta-blockers if hypotensive or signs of shock - use fluids first',
      'CHADS2-VASc score: Assess stroke risk - anticoagulation crucial if score ≥2 (men) or ≥3 (women)',
      'Common triggers: Infection/fever, dehydration, thyroid disease, alcohol binge, PE, hypoxia, electrolyte imbalance',
      'Prehospital management focus: Rate control, anticoagulation status assessment, identify triggers, monitor for deterioration',
      'Target heart rate <110 bpm at rest (lenient rate control) or <80 bpm (strict control)',
      'Rate control medications take 5-15 minutes to work - reassess frequently',
      'DC cardioversion if unstable: Sync with R wave, start 100-200J biphasic, have sedation ready',
      'Complications to monitor: Stroke (if not anticoagulated), heart failure, cardiogenic shock, myocardial ischemia',
      'Patient education: Importance of medication compliance, avoiding triggers, regular follow-up',
      'Transport considerations: Continuous monitoring essential, be prepared for deterioration en route'
    ],
    commonPitfalls: [
      'Failing to assess hemodynamic stability before treatment - unstable patients need cardioversion not drugs',
      'Giving rate-control drugs to hypotensive patients - will worsen shock',
      'Forgetting to check anticoagulation status - high stroke risk in AF',
      'Missing reversible triggers like infection or thyroid disease',
      'Not monitoring for deterioration after giving medications',
      'Delayed transport waiting for rate control to work',
      'Poor documentation of rhythm and rate changes',
      'Not preparing for potential cardioversion if patient deteriorates'
    ],
    visualResources: {
      images: [
        {
          id: 'ecg-afib',
          type: 'image',
          title: 'Atrial Fibrillation ECG',
          url: 'https://radiopaedia.org/cases/atrial-fibrillation-ecg',
          source: 'Radiopaedia',
          caption: 'Irregularly irregular rhythm with no discernible P waves, fibrillatory baseline',
          relevance: 'essential',
          tags: ['AF', 'atrial-fibrillation', 'ECG', 'arrhythmia']
        }
      ],
      videos: [
        {
          id: 'vid-afib-001',
          type: 'video',
          title: 'Atrial Fibrillation Management',
          url: 'https://www.youtube.com/watch?v=69-GmO4GmEY',
          source: 'Armando Hasudungan',
          caption: 'Management of atrial fibrillation including rate control and cardioversion',
          duration: '14:30',
          relevance: 'essential',
          tags: ['AF', 'atrial-fibrillation', 'rate-control', 'cardioversion']
        }
      ],
      articles: [
        {
          id: 'art-afib-001',
          type: 'article',
          title: 'Atrial Fibrillation - Emergency Management',
          url: 'https://wikem.org/wiki/Atrial_fibrillation',
          source: 'WikEM',
          caption: 'ECG features and emergency management of atrial fibrillation',
          relevance: 'essential',
          tags: ['AF', 'atrial-fibrillation', 'ECG', 'diagnosis']
        },
        {
          id: 'art-afib-esc',
          type: 'article',
          title: 'ESC Guidelines - Atrial Fibrillation Management',
          url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Atrial-Fibrillation-Management',
          source: 'European Society of Cardiology',
          caption: 'Comprehensive guidelines for AF diagnosis and management',
          relevance: 'essential',
          tags: ['AF', 'ESC', 'guidelines', 'management']
        },
        {
          id: 'art-afib-chads2',
          type: 'article',
          title: 'CHADS2-VASc Score for Stroke Risk',
          url: 'https://www.mdcalc.com/chads2-vasc-score-atrial-fibrillation-stroke-risk',
          source: 'MDCalc',
          caption: 'Calculate stroke risk in patients with atrial fibrillation',
          relevance: 'essential',
          tags: ['AF', 'CHADS2-VASc', 'stroke-risk', 'anticoagulation']
        }
      ],
      procedures: [
        {
          id: 'proc-cardioversion-001',
          type: 'video',
          title: 'Synchronized Cardioversion Technique',
          url: 'https://www.youtube.com/watch?v=bHWOBtfvFOY',
          source: 'Osmosis from Elsevier',
          caption: 'Step-by-step guide to synchronized cardioversion for unstable AF',
          duration: '8:45',
          relevance: 'important',
          tags: ['cardioversion', 'synchronized', 'AF', 'unstable']
        }
      ]
    },
    equipmentNeeded: [
      'Monitor/defibrillator with 12-lead ECG capability',
      'Defibrillation pads for potential cardioversion',
      'IV cannulation kit (18G-20G)',
      'Metoprolol 5mg ampoules (for rate control)',
      'Diltiazem 25mg/5ml ampoules (alternative rate control)',
      'Normal saline 0.9% 500ml bags',
      'Blood glucose testing kit',
      'Oxygen with nasal cannula/mask',
      'Sedation medications (Midazolam 5mg) if cardioversion needed',
      'Transport stretcher with monitoring capabilities'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Tachyarrhythmia Management Protocol v3.1',
        'DCAS Synchronized Cardioversion Guidelines',
        'ESC Guidelines on Atrial Fibrillation Management'
      ],
      receivingFacilities: [
        {
          name: 'Dubai Hospital Cardiology Department',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Cardiac Monitoring', 'Electrophysiology Services'],
          contact: '04 222 1211',
          distance: '15 minutes from Downtown'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha',
          capabilities: ['Cardiac Catheterization', 'Arrhythmia Management'],
          contact: '04 377 5500',
          distance: '10 minutes from Downtown'
        }
      ],
      localConsiderations: [
        'Downtown Dubai traffic can be heavy during rush hours - plan alternative routes',
        'Many office buildings require access cards - contact security in advance',
        'Cultural consideration: Female patients may prefer female providers when available',
        'Document any pre-existing anticoagulation carefully - affects stroke risk stratification',
        'Dubai heat can exacerbate dehydration - consider this as trigger for AF',
        'Transport to facility with cardiology capabilities for potential electrophysiology consultation'
      ]
    }
  }),

  createCase({
    id: 'cardiac-004',
    title: 'Hypertensive Emergency',
    category: 'cardiac',
    subcategory: 'hypertensive-emergency',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'], // 2nd-year stretch: recognition of hypertensive emergency signs
    dispatchInfo: {
      callReason: 'Severe headache, vision changes',
      timeOfDay: 'evening',
      location: 'Villa in Jumeirah, Dubai',
      callerInfo: 'Housekeeper',
      dispatchCode: 'Echo-1'
    },
    patientInfo: {
      age: 52,
      gender: 'male',
      weight: 95,
      occupation: 'CEO',
      language: 'English'
    },
    sceneInfo: {
      description: 'Luxury villa, patient in study',
      hazards: [],
      bystanders: 'Housekeeper',
      environment: 'Well-lit, comfortable',
      sceneImagePath: '/scene-assets/cardiac-004-hypertensive-headache-villa.png',
      sceneImageCaption: 'Family villa — Jumeirah, Dubai',
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, distressed, holding head',
      position: 'Sitting',
      appearance: 'Flushed, diaphoretic',
      consciousness: 'Alert but confused'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 95,
        pulseQuality: 'Bounding',
        bp: { systolic: 240, diastolic: 130 },
        capillaryRefill: 2,
        skin: 'Warm, flushed',
        findings: ['Severely hypertensive', 'Bounding pulse'],
        interventions: ['IV access', 'BP monitoring'],
        ecgFindings: ['LVH pattern', 'ST-T wave changes']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal, sluggish',
        findings: ['Confused', 'Papilledema on fundoscopy'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['No edema'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Severe headache', 'Papilledema'],
      neck: ['No JVD'],
      chest: ['Heart sounds normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['No peripheral oedema', 'Peripheral pulses present'],
      posterior: ['Normal'],
      neurological: ['Confused', 'Cranial nerves intact']
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '10mg', frequency: 'Daily', indication: 'Hypertension' }
      ],
      allergies: ['None'],
      medicalConditions: ['Hypertension', 'CKD Stage 3'],
      surgicalHistory: [],
      lastMeal: 'Dinner 3 hours ago',
      eventsLeading: 'Severe headache developed over 2 hours, ran out of BP medication 3 days ago'
    },
    vitalSignsProgression: {
      initial: { bp: '240/130', pulse: 95, respiration: 20, spo2: 98, gcs: 14 },
      // Prehospital management is monitoring + calm transport (no BP-lowering
      // agents in the field for hypertensive emergency — labetalol is ED-only).
      // Vitals stay broadly static; mild improvement reflects anxiolysis + analgesia.
      afterIntervention: { bp: '224/120', pulse: 85, respiration: 15, spo2: 99, gcs: 14 },
      deterioration: { bp: '260/140', pulse: 110, respiration: 26, spo2: 94, gcs: 12 }
    },
    expectedFindings: {
      keyObservations: ['Severe hypertension BP 240/130', 'Headache', 'Confusion', 'Papilledema', 'Vision changes', 'End-organ dysfunction present'],
      redFlags: ['Hypertensive encephalopathy', 'Acute kidney injury', 'Acute heart failure', 'Aortic dissection risk', 'Intracranial hemorrhage risk'],
      differentialDiagnoses: ['Hypertensive emergency', 'Hypertensive urgency', 'Acute stroke', 'Pheochromocytoma', 'Renal artery stenosis', 'Medication non-compliance'],
      mostLikelyDiagnosis: 'Hypertensive Emergency with Encephalopathy'
    },
    managementPathway: {
      immediate: ['Confirm BP in both arms', 'Establish IV access', 'Continuous BP monitoring', 'ECG monitoring', 'Neurological assessment (GCS, pupils)', 'Gentle transport — prehospital paramedic focus is recognition, IV access, monitoring and pre-alert. IV labetalol 20mg or nicardipine infusion is ED-administered under invasive BP monitoring (not routine UK JRCALC / UAE DCAS paramedic scope; uncontrolled rapid BP reduction → stroke / MI).', 'Target BP reduction: 10-20% in first hour (ED-level, not prehospital)'],
      definitive: ['ICU admission for invasive BP monitoring', 'IV antihypertensive infusion (Labetalol/Nicardipine)', 'Brain CT/MRI to rule out stroke/bleed', 'Ophthalmology consult for papilledema', 'Renal function monitoring'],
      monitoring: ['BP every 5-10 minutes initially', 'Continuous ECG monitoring', 'Neurological status (GCS)', 'Urine output', 'Oxygen saturation', 'Cardiac monitoring for ischemia/arrhythmias'],
      transportConsiderations: ['Continuous BP monitoring en route', 'IV access maintained', 'Cardiac monitoring', 'Avoid rapid BP reduction during transport', 'Pre-alert receiving hospital with BP readings and end-organ damage', 'Consider stroke center if neurological deficits']
    },
    studentChecklist: [
      { id: 'c4-1', category: 'intervention', description: 'Confirm BP in both arms - check for significant difference', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c4-2', category: 'intervention', description: 'Establish IV access for antihypertensive medications', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'c4-3', category: 'abcde', description: 'Assess for end-organ damage: neuro exam, chest auscultation, urine output', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'c4-4', category: 'intervention', description: 'Recognise that IV antihypertensives (labetalol, nicardipine) are ED-administered under invasive monitoring — prehospital role is monitoring, IV access, pre-alert, and avoiding rapid BP reduction', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c4-5', category: 'intervention', description: 'Obtain 12-lead ECG - assess for LVH, ischemia, arrhythmias', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c4-6', category: 'intervention', description: 'Check serum creatinine and electrolytes if available', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c4-7', category: 'intervention', description: 'Monitor BP every 5-10 minutes', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c4-8', category: 'history', description: 'Identify cause: medication compliance, renal disease, recreational drugs', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c4-9', category: 'communication', description: 'Rapid transport to hospital with continuous monitoring', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c4-10', category: 'documentation', description: 'Document BP readings, neurological status, medication given, response', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Hypertensive emergency = severely elevated BP (usually >180/120) WITH acute end-organ damage',
      'Hypertensive urgency = elevated BP WITHOUT end-organ damage - can be managed orally',
      'End-organ damage signs: Encephalopathy (confusion, headache, seizures), Vision changes (papilledema), Heart failure (pulmonary edema), Acute kidney injury (oliguria, elevated creatinine)',
      'CRITICAL: Do NOT lower BP too rapidly in hypertensive emergency - risk of cerebral hypoperfusion, stroke, coronary ischemia',
      'Target BP reduction: 10-20% in first hour, then 5-15% over next 23 hours',
      'Exception: Acute aortic dissection - lower SBP to <120 mmHg immediately',
      'First-line medications: Labetalol (20mg IV, then 40-80mg q10min), Hydralazine (10-20mg IV/IM), Nitroglycerin (if CAD)',
      'Avoid sublingual nifedipine - unpredictable drop, risk of stroke',
      'Monitor for complications: Stroke, MI, renal failure, aortic dissection',
      'Common causes: Medication non-compliance (most common), Renal disease, Endocrine (pheochromocytoma, Cushing\'s), Drug use (cocaine, amphetamines)',
      'Prehospital focus: Gradual controlled reduction, identify end-organ damage, rapid transport',
      'ECG findings: LVH with strain pattern, ST-T wave changes, may show prior MI',
      'Papilledema on fundoscopy = hypertensive encephalopathy - ophthalmologic emergency',
      'Transport: Continuous BP monitoring essential, IV access, cardiac monitoring, pulse oximetry'
    ],
    commonPitfalls: [
      'Lowering BP too rapidly - causes cerebral hypoperfusion and stroke',
      'Missing end-organ damage - not performing thorough neuro exam',
      'Giving sublingual nifedipine - unpredictable and dangerous BP drop',
      'Not identifying underlying cause - missing medication non-compliance',
      'Failing to monitor BP frequently after giving antihypertensives',
      'Not obtaining ECG to assess for LVH or ischemia',
      'Delayed transport waiting for BP to normalize',
      'Not recognizing aortic dissection presentation - requires immediate BP control'
    ],
    visualResources: {
      images: [
        {
          id: 'ecg-lvh',
          type: 'image',
          title: 'LVH with Strain Pattern',
          url: 'https://radiopaedia.org/cases/left-ventricular-hypertrophy-ecg',
          source: 'Radiopaedia',
          caption: 'Left ventricular hypertrophy with ST-T wave changes typical of severe hypertension',
          relevance: 'essential',
          tags: ['ECG', 'LVH', 'hypertension', 'strain']
        }
      ],
      videos: [
        {
          id: 'vid-htn-001',
          type: 'video',
          title: 'Hypertensive Emergency Management',
          url: 'https://www.youtube.com/watch?v=xmafdsADGi0',
          source: 'Osmosis from Elsevier',
          caption: 'Management of hypertensive emergency including medication selection and BP targets',
          duration: '16:20',
          relevance: 'essential',
          tags: ['hypertension', 'emergency', 'BP-management']
        },
        {
          id: 'vid-htn-osmosis',
          type: 'video',
          title: 'Hypertensive Crisis - Pathophysiology and Treatment',
          url: 'https://www.youtube.com/watch?v=EVbaPfHx_3I',
          source: 'MedCram',
          caption: 'Pathophysiology of hypertensive crisis and end-organ damage mechanisms',
          duration: '12:45',
          relevance: 'important',
          tags: ['hypertension', 'pathophysiology', 'crisis', 'end-organ']
        }
      ],
      articles: [
        {
          id: 'art-htn-001',
          type: 'article',
          title: 'Hypertensive Emergency',
          url: 'https://wikem.org/wiki/Hypertensive_emergency',
          source: 'WikEM',
          caption: 'Recognition and management of hypertensive crisis with end-organ damage',
          relevance: 'essential',
          tags: ['hypertension', 'emergency', 'end-organ-damage']
        },
        {
          id: 'art-htn-esc',
          type: 'article',
          title: 'ESC Guidelines - Arterial Hypertension',
          url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Arterial-Hypertension-Management',
          source: 'European Society of Cardiology',
          caption: 'Guidelines for management of arterial hypertension and hypertensive emergencies',
          relevance: 'essential',
          tags: ['hypertension', 'ESC', 'guidelines', 'management']
        }
      ],
      procedures: [
        {
          id: 'art-htn-meds',
          type: 'article',
          title: 'Antihypertensive Medications in Emergency',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK513351/',
          source: 'StatPearls',
          caption: 'Medication selection and dosing for hypertensive emergencies',
          relevance: 'essential',
          tags: ['hypertension', 'medications', 'dosing', 'emergency']
        },
        {
          id: 'art-htn-nice',
          type: 'article',
          title: 'NICE Hypertension Management Guideline',
          url: 'https://www.nice.org.uk/guidance/ng136',
          source: 'NICE',
          caption: 'UK evidence-based guideline on hypertension management including emergencies',
          relevance: 'important',
          tags: ['hypertension', 'NICE', 'guidelines', 'management']
        }
      ]
    },
    equipmentNeeded: [
      'Monitor/defibrillator with BP monitoring',
      '12-lead ECG machine',
      'IV cannulation kit (18G)',
      'Labetalol 100mg/20ml ampoules',
      'Hydralazine 20mg/1ml ampoules',
      'Nitroglycerin sublingual spray',
      'Normal saline 0.9% 500ml bags',
      'Blood glucose testing kit',
      'Ophthalmoscope (for fundoscopy)',
      'Transport stretcher with continuous monitoring'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Hypertensive Emergency Protocol v2.8',
        'ESC/ESH Guidelines for Arterial Hypertension Management',
        'American Heart Association Hypertensive Crisis Guidelines'
      ],
      receivingFacilities: [
        {
          name: 'Dubai Hospital Emergency Department',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Emergency Cardiac Care', 'Neurology Consultation', 'Advanced Imaging'],
          contact: '04 222 1211',
          distance: '25 minutes from Jumeirah'
        },
        {
          name: 'Rashid Hospital',
          location: 'Bur Dubai',
          capabilities: ['24/7 Emergency Care', 'Stroke Center', 'Cardiac Surgery'],
          contact: '04 219 3000',
          distance: '20 minutes from Jumeirah'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Emergency Medicine', 'Neurology', 'Cardiology'],
          contact: '04 435 9999',
          distance: '30 minutes from Jumeirah'
        }
      ],
      localConsiderations: [
        'Jumeirah villas often have security gates - obtain codes from dispatch',
        'Evening traffic on Jumeirah Beach Road can be heavy - consider Al Wasl Road alternative',
        'High-stress occupations common in Dubai - medication compliance issues frequent',
        'Cultural consideration: Male CEOs may have specific privacy expectations',
        'Document medication history carefully - many patients see multiple specialists',
        'Hypertensive emergencies during Ramadan may be related to medication timing changes',
        'Heat exposure in summer can exacerbate hypertension - consider dehydration',
        'Rapid transport to facility with neuroimaging capabilities if encephalopathy suspected'
      ]
    }
  }),

  // ==================== RESPIRATORY CASES (7 cases) ====================
  createCase({
    id: 'resp-001',
    title: 'Life-Threatening Asthma Attack',
    category: 'respiratory',
    subcategory: 'asthma',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    dispatchInfo: {
      callReason: 'Son cannot breathe, using inhaler repeatedly',
      timeOfDay: 'evening',
      location: 'Villa in Al Ain',
      callerInfo: 'Mother',
      dispatchCode: 'Echo-2'
    },
    patientInfo: {
      age: 19,
      gender: 'male',
      weight: 65,
      occupation: 'University student',
      language: 'Arabic, English'
    },
    sceneInfo: {
      description: 'Bedroom, patient sitting on edge of bed',
      hazards: [],
      bystanders: 'Parents present',
      environment: 'Dust visible, carpeted room',
      sceneImagePath: '/scene-assets/asthma-villa-male-uae.png',
      sceneImageCaption: 'Villa living room — Al Ain',
    },
    initialPresentation: {
      generalImpression: 'Young male, tripod position, severe respiratory distress',
      position: 'Sitting upright, leaning forward (tripod)',
      appearance: 'Diaphoretic, anxious, unable to speak in sentences',
      consciousness: 'Alert but distressed'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent but compromised', 'Inspiratory and expiratory wheeze audible'],
        interventions: ['High-flow oxygen']
      },
      breathing: {
        rate: 32,
        rhythm: 'Labored',
        depth: 'Shallow',
        spo2: 88,
        findings: ['Severe tachypnea', 'Accessory muscle use', 'Intercostal recession', 'Prolonged expiratory phase', 'Widespread wheeze'],
        interventions: ['Salbutamol nebulizer', 'Ipratropium bromide', 'Consider magnesium'],
        auscultation: ['Widespread polyphonic wheeze', 'Reduced air entry', 'Prolonged expiratory phase']
      },
      circulation: {
        pulseRate: 120,
        pulseQuality: 'Bounding',
        bp: { systolic: 130, diastolic: 80 },
        capillaryRefill: 2,
        skin: 'Warm, diaphoretic',
        findings: ['Tachycardia', 'Pulsus paradoxus'],
        interventions: ['IV access', 'Fluids if dehydrated']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious', 'Unable to complete sentences'],
        interventions: ['Reassurance']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Multiple inhalers visible', 'Peak flow meter on table'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Trachea central', 'No lymphadenopathy'],
      chest: ['Hyperexpanded', 'Widespread wheeze', 'Reduced air entry bilaterally'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Anxious but oriented']
    },
    history: {
      medications: [
        { name: 'Salbutamol inhaler', dose: '100mcg', frequency: 'PRN', indication: 'Asthma' },
        { name: 'Beclomethasone inhaler', dose: '200mcg', frequency: 'Twice daily', indication: 'Asthma preventer' },
        { name: 'Montelukast', dose: '10mg', frequency: 'Daily', indication: 'Asthma' }
      ],
      allergies: ['Dust', 'Pollen', 'Cat dander'],
      medicalConditions: ['Severe asthma since childhood', 'Multiple hospital admissions', 'Previous ICU admission 2 years ago'],
      surgicalHistory: [],
      lastMeal: 'Dinner 2 hours ago',
      eventsLeading: 'Started feeling tight chest after cleaning dusty room, used inhaler 10 times with no relief'
    },
    vitalSignsProgression: {
      initial: { bp: '130/80', pulse: 120, respiration: 32, spo2: 88, gcs: 14, bloodGlucose: 5.4 },
      afterIntervention: { bp: '140/86', pulse: 128, respiration: 15, spo2: 98, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: ['Severe respiratory distress', 'Peak flow <50% predicted', 'Silent chest warning sign'],
      redFlags: ['Life-threatening asthma', 'Exhaustion risk', 'Respiratory arrest imminent'],
      differentialDiagnoses: ['Severe acute asthma', 'Anaphylaxis', 'Pulmonary embolism'],
      mostLikelyDiagnosis: 'Life-threatening Asthma Exacerbation'
    },
    managementPathway: {
      immediate: ['High-flow oxygen 15L/min via non-rebreather (aim SpO2 94-98%)', 'Continuous salbutamol nebulizer (5mg every 15-20 min, back-to-back if life-threatening)', 'Ipratropium bromide 500mcg nebulizer (added for severe / life-threat features)', 'IV hydrocortisone 200mg early (or methylprednisolone 80mg)', 'IV access establishment (large-bore)', 'Magnesium sulfate 2g IV over 20 min for severe / life-threatening features', 'IM Adrenaline 500mcg (0.5mL 1:1000, anterolateral thigh) if life-threatening / peri-arrest / not responding to nebulisers — GINA 2024 / BTS 2019 / JRCALC. Repeat every 5 min as needed.'],
      definitive: ['ICU admission for potential intubation', 'Mechanical ventilation if respiratory failure', 'Continuous beta-agonist infusion', 'Systemic corticosteroids', 'Chest X-ray to rule out pneumothorax'],
      monitoring: ['Continuous SpO2 monitoring', 'Respiratory rate and pattern', 'Auscultation for silent chest', 'Peak expiratory flow if cooperative', 'Heart rate and rhythm', 'Level of consciousness', 'Accessory muscle use'],
      transportConsiderations: ['Pre-alert hospital for potential intubation', 'Continuous nebulized therapy during transport', 'Continuous monitoring of SpO2 and respiratory rate', 'Have intubation equipment ready', 'Transport to facility with ICU capabilities', 'Minimize transport time - do not delay for full stabilization']
    },
    studentChecklist: [
      { id: 'r1-1', category: 'abcde', description: 'Recognize life-threatening asthma', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'r1-2', category: 'intervention', description: 'High-flow oxygen immediately', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'r1-3', category: 'intervention', description: 'Salbutamol nebulizer continuously', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'r1-4', category: 'intervention', description: 'Ipratropium bromide nebulizer', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r1-5', category: 'intervention', description: 'IV hydrocortisone early', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r1-6', category: 'intervention', description: 'Consider magnesium sulfate', points: 5, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'r1-7', category: 'communication', description: 'Pre-alert hospital for possible intubation', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Silent chest in asthma is a pre-arrest sign - absent breath sounds indicate critical obstruction',
      'Continuous nebulized beta-agonists (salbutamol 5mg every 15-20 min) in severe cases via oxygen-driven nebulizer',
      'Early IV steroids (hydrocortisone 200mg) improve outcomes - onset of action 4-6 hours but start immediately',
      'Have intubation equipment ready if patient is tiring - reduced conscious level is pre-terminal sign',
      'Magnesium sulfate 2g IV over 20 minutes may help in severe cases - bronchodilator and anti-inflammatory',
      'Avoid sedation in severe asthma - risk of respiratory depression',
      'Al Ain has desert dust - common trigger for asthma exacerbations',
      'Peak expiratory flow <33% predicted = life-threatening episode',
      'In UAE, sandstorms and high humidity can trigger severe asthma attacks',
      'Monitor for pneumothorax - severe asthma can cause barotrauma',
      'Heliox (helium-oxygen mixture) may help in some centers if available',
      'Consider non-invasive ventilation as bridge to intubation in selected patients',
      'Family education about asthma action plans is crucial in UAE multicultural setting',
      'Transport to facility with ICU capabilities for potential mechanical ventilation'
    ],
    commonPitfalls: [
      'Underestimating severity - silent chest is an ominous sign',
      'Insufficient oxygen delivery during nebulizer therapy',
      'Delaying IV steroids waiting for oral absorption',
      'Not recognizing exhaustion - falling respiratory rate is dangerous',
      'Giving sedatives to relieve anxiety - can cause respiratory arrest',
      'Not preparing for intubation early',
      'Inadequate reassessment after initial treatment',
      'Not considering alternative diagnoses (anaphylaxis, PE, pneumonia)',
      'Poor communication with receiving hospital about severity'
    ],
    equipmentNeeded: [
      'High-flow oxygen with nebulizer capability (8-10 L/min)',
      'Salbutamol nebulizer solution (5mg/2.5ml)',
      'Ipratropium bromide nebulizer solution (500mcg/2ml)',
      'Hydrocortisone 100mg powder for injection',
      'Magnesium sulfate 50% injection (2g ampoules)',
      'IV cannulation kit (18G)',
      'Normal saline 0.9% 500ml bags',
      'Peak flow meter (if patient cooperative)',
      'Stethoscope for auscultation',
      'Pulse oximeter',
      'Endotracheal tubes (sizes 7.0-8.0)',
      'Laryngoscope and airway adjuncts',
      'Bag-valve-mask with reservoir',
      'Transport stretcher with O2 mount'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Respiratory Emergency Protocol v4.0',
        'UAE National Asthma Guidelines for Emergency Care',
        'British Thoracic Society/SIGN Asthma Guidelines'
      ],
      receivingFacilities: [
        {
          name: 'Al Ain Hospital',
          location: 'Al Ain',
          capabilities: ['Emergency Department', 'ICU', 'Respiratory Support'],
          contact: '03 702 2000',
          distance: '15 minutes from most locations'
        },
        {
          name: 'Tawam Hospital',
          location: 'Al Ain',
          capabilities: ['Emergency Department', 'ICU', 'Pediatric ICU'],
          contact: '03 702 2000',
          distance: '20 minutes'
        },
        {
          name: 'Sheikh Khalifa Medical City',
          location: 'Abu Dhabi',
          capabilities: ['Emergency Department', 'ICU', 'Respiratory Medicine'],
          contact: '02 819 0000',
          distance: '90 minutes from Al Ain'
        }
      ],
      localConsiderations: [
        'Al Ain is inland desert city - sandstorms (shamal) common in summer',
        'Dust storms can trigger severe asthma attacks - check recent weather',
        'Many villas have carpeted rooms that trap dust mites and allergens',
        'Family may be hesitant to call 998 (ambulance) - emphasize importance of early intervention',
        'Language barriers common - use translation apps or bilingual crew',
        'Cultural consideration: Male providers may be preferred for male patients in some families',
        'Summer temperatures can reach 50°C - ensure ambulance AC is functioning',
        'Transport to Al Ain Hospital or Tawam Hospital depending on proximity',
        'Document trigger factors - helps receiving hospital with management',
        'In UAE, asthma is common in young adults - often undiagnosed or poorly controlled'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-asthma-severe',
          type: 'image',
          title: 'Severe Asthma Clinical Features',
          url: 'https://www.brit-thoracic.org.uk/quality-improvement/guidelines/asthma/',
          source: 'British Thoracic Society',
          caption: 'Clinical signs of life-threatening asthma including accessory muscle use and silent chest',
          relevance: 'essential',
          tags: ['asthma', 'severe', 'respiratory', 'clinical']
        }
      ],
      videos: [
        {
          id: 'vid-asthma-mgmt',
          type: 'video',
          title: 'Acute Severe Asthma Management',
          url: 'https://www.youtube.com/watch?v=Thj4EiFPyNA',
          source: 'Osmosis from Elsevier',
          caption: 'Comprehensive prehospital management of severe asthma exacerbation',
          duration: '18:45',
          relevance: 'essential',
          tags: ['asthma', 'management', 'prehospital', 'severe']
        },
        {
          id: 'vid-asthma-brittle',
          type: 'video',
          title: 'Brittle Asthma and Near-Fatal Attacks',
          url: 'https://www.youtube.com/watch?v=AKRr2PMl4zE',
          source: 'MedCram',
          caption: 'Recognition and management of near-fatal asthma attacks',
          duration: '14:20',
          relevance: 'important',
          tags: ['asthma', 'brittle', 'near-fatal', 'critical']
        }
      ],
      articles: [
        {
          id: 'art-asthma-001',
          type: 'article',
          title: 'Acute Severe Asthma - Emergency Management',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK526070/',
          source: 'StatPearls',
          caption: 'Recognition and management of acute severe asthma',
          relevance: 'essential',
          tags: ['asthma', 'respiratory', 'emergency']
        },
        {
          id: 'art-asthma-gina',
          type: 'article',
          title: 'GINA Report - Global Strategy for Asthma Management',
          url: 'https://ginasthma.org/gina-reports/',
          source: 'Global Initiative for Asthma',
          caption: 'International evidence-based guideline for asthma management and prevention',
          relevance: 'essential',
          tags: ['asthma', 'GINA', 'guidelines', 'global']
        },
        {
          id: 'art-asthma-nice',
          type: 'article',
          title: 'NICE Guideline: Asthma Diagnosis and Management',
          url: 'https://www.nice.org.uk/guidance/ng80',
          source: 'NICE',
          caption: 'UK national guideline on asthma diagnosis, monitoring and management',
          relevance: 'important',
          tags: ['asthma', 'NICE', 'guidelines', 'UK']
        },
        {
          id: 'art-asthma-bts',
          type: 'article',
          title: 'BTS/SIGN British Guideline on Asthma Management',
          url: 'https://www.brit-thoracic.org.uk/quality-improvement/guidelines/asthma/',
          source: 'British Thoracic Society',
          caption: 'Evidence-based guidelines for asthma management',
          relevance: 'essential',
          tags: ['asthma', 'guidelines', 'BTS', 'SIGN']
        },
        {
          id: 'art-asthma-who',
          type: 'article',
          title: 'WHO Asthma Guidelines',
          url: 'https://www.who.int/news-room/fact-sheets/detail/asthma',
          source: 'World Health Organization',
          caption: 'Global asthma burden and management strategies',
          relevance: 'important',
          tags: ['asthma', 'WHO', 'global', 'guidelines']
        }
      ]
    }
  }),

  createCase({
    id: 'resp-002',
    title: 'Pneumothorax - Tension',
    category: 'respiratory',
    subcategory: 'pneumothorax-tension',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    dispatchInfo: {
      callReason: 'Sudden chest pain, difficulty breathing after fall',
      timeOfDay: 'afternoon',
      location: 'Construction site, Dubai',
      callerInfo: 'Supervisor',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 34,
      gender: 'male',
      weight: 80,
      occupation: 'Construction worker',
      language: 'Hindi, Basic English'
    },
    sceneInfo: {
      description: 'Outdoor construction site',
      hazards: ['Heavy machinery', 'Uneven ground'],
      bystanders: 'Coworkers',
      environment: 'Hot, dusty',
      environmentVariant: 'industrial',
      sceneImagePath: '/scene-assets/resp-002-construction-tension-pneumothorax.png',
      sceneImageCaption: 'Construction site — Dubai',
    },
    initialPresentation: {
      generalImpression: 'Young male, severe distress, cyanotic',
      position: 'Sitting upright',
      appearance: 'Cyanotic, distressed, diaphoretic',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 36,
        rhythm: 'Labored',
        depth: 'Shallow',
        spo2: 82,
        findings: ['Severe respiratory distress', 'Tracheal deviation to left', 'Absent breath sounds right', 'Hyperresonant percussion right'],
        interventions: ['High-flow oxygen', 'Immediate needle decompression'],
        auscultation: ['Absent breath sounds right hemithorax', 'Normal left side']
      },
      circulation: {
        pulseRate: 135,
        pulseQuality: 'Weak, thready',
        bp: { systolic: 80, diastolic: 50 },
        capillaryRefill: 4,
        skin: 'Pale, clammy, cyanosed',
        findings: ['Hypotensive', 'Tachycardic', 'JVD present'],
        interventions: ['IV access', 'Fluid resuscitation']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious', 'Agitated'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Bruising over right chest wall', 'No open wounds'],
        interventions: ['Expose chest']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Tracheal deviation to left', 'JVD present', 'No subcutaneous emphysema'],
      chest: ['Right side hyperexpanded', 'Absent breath sounds', 'Tenderness over ribs 4-6'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Right-sided bruising'],
      neurological: ['Oriented']
    },
    history: {
      medications: [],
      allergies: ['None known'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Fell from scaffolding approximately 3 meters, landed on right side, sudden onset chest pain and breathlessness'
    },
    vitalSignsProgression: {
      initial: { bp: '80/50', pulse: 135, respiration: 36, spo2: 82, gcs: 14, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Tracheal deviation', 'Absent breath sounds', 'Hypotension', 'JVD'],
      redFlags: ['Tension pneumothorax - immediate decompression required'],
      differentialDiagnoses: ['Tension pneumothorax', 'Massive hemothorax', 'Cardiac tamponade'],
      mostLikelyDiagnosis: 'Tension Pneumothorax'
    },
    managementPathway: {
      immediate: ['High-flow oxygen 15L/min', 'Immediate needle decompression — PREFERRED site is 4th-5th ICS anterior-to-mid axillary line per TCCC 2022 (2nd ICS mid-clavicular fails in >30% of adults due to chest-wall thickness and risks vessel injury)', 'Use 14G x 8cm catheter (5cm catheters demonstrably fail in ~1/3 of adults)', 'IV access + small-volume fluid challenges titrated to radial pulse (avoid large crystalloid boluses)', 'Continuous monitoring — reassess after decompression for recurrence'],
      definitive: ['Formal chest drain insertion (28-32F)', 'Chest X-ray to confirm lung re-expansion', 'Thoracic surgery consult if ongoing air leak', 'Pain management', 'Antibiotics if traumatic'],
      monitoring: ['Continuous SpO2 monitoring', 'Respiratory rate and effort', 'Blood pressure', 'Heart rate', 'Breath sounds after decompression', 'Tracheal position', 'Monitor for re-tensioning'],
      transportConsiderations: ['Immediate transport after decompression', 'Pre-alert trauma center', 'Continue high-flow oxygen', 'Monitor for deterioration or re-tensioning', 'Chest drain should be inserted at receiving facility', 'Do NOT delay transport for chest drain insertion in prehospital setting']
    },
    studentChecklist: [
      { id: 'r2-1', category: 'abcde', description: 'Recognize tension pneumothorax', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'r2-2', category: 'intervention', description: 'Immediate needle decompression', points: 25, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true, timeframe: 'Within 2 minutes' },
      { id: 'r2-3', category: 'intervention', description: 'High-flow oxygen', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'r2-4', category: 'intervention', description: 'IV access and fluids', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r2-5', category: 'abcde', description: 'Auscultate chest bilaterally for absent breath sounds', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r2-6', category: 'abcde', description: 'Percuss chest for hyperresonance on affected side', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r2-7', category: 'abcde', description: 'Assess for tracheal deviation away from affected side', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'r2-8', category: 'abcde', description: 'Check for JVD and hemodynamic compromise', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'r2-9', category: 'intervention', description: 'Position patient sitting upright to aid breathing', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'r2-10', category: 'abcde', description: 'Monitor vital signs every 2-3 minutes', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r2-11', category: 'communication', description: 'Pre-alert trauma center for chest drain preparation', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'r2-12', category: 'documentation', description: 'Document time of decompression and patient response', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Tension pneumothorax is a CLINICAL diagnosis - do NOT wait for chest X-ray',
      'Immediate needle decompression is life-saving - use 14G or 16G cannula, 2nd intercostal space mid-clavicular line OR 4th/5th intercostal space mid-axillary line',
      'Classic signs: hypotension, tracheal deviation AWAY from affected side, JVD, absent breath sounds on affected side',
      'Tension pneumothorax can occur without trauma - consider in any patient with respiratory distress and shock',
      'After needle decompression, insert formal chest drain as soon as possible',
      'Construction sites in Dubai have high risk of chest trauma - maintain high index of suspicion',
      'Consider bilateral needle decompression if uncertainty about side or patient deteriorating',
      'If needle decompression fails, repeat on same side or try alternative site',
      'Monitor for re-tensioning after initial decompression',
      'Prehospital needle thoracostomy has high failure rate - be prepared to repeat or advance technique',
      'Use 5cm+ angiocath for obese patients or those with significant chest wall thickness',
      'Document time of decompression and patient response carefully',
      'Consider tension pneumothorax in any trauma patient with shock and respiratory distress',
      'Transport to trauma center even after successful decompression'
    ],
    commonPitfalls: [
      'Waiting for X-ray confirmation - this is a clinical emergency',
      'Needle placement too medial - risk of mediastinal injury',
      'Using too short a needle in obese patients',
      'Only decompressing one side when bilateral tension is possible',
      'Not following through with chest drain insertion',
      'Missing tension pneumothorax in ventilated patients',
      'Inadequate monitoring after decompression',
      'Not documenting the procedure properly',
      'Failing to transport to appropriate facility',
      'Not recognizing re-tensioning en route'
    ],
    equipmentNeeded: [
      '14G or 16G IV cannula — 8cm length preferred (5cm cannulas fail to reach the pleural space in >30% of adults, especially at the 2nd ICS midclavicular site)',
      'Antiseptic swabs (chlorhexidine)',
      'Gloves and sterile drapes',
      'High-flow oxygen with reservoir mask',
      'IV cannulation kit (14G-16G)',
      'Normal saline 0.9% 500ml bags',
      'Chest drain insertion kit (if trained)',
      'Underwater seal drainage system',
      'Suture material for securing drain',
      'Dressings and tape',
      'Suction unit available',
      'Defibrillator/monitor for ongoing assessment',
      'Transport stretcher capable of managing chest drain',
      'Oxygen cylinders for extended transport'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Thoracic Trauma Protocol v3.2',
        'DCAS Needle Thoracostomy Guidelines',
        'ATLS Guidelines for Chest Trauma'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Trauma Center',
          location: 'Dubai',
          capabilities: ['Level I Trauma Center', '24/7 Thoracic Surgery', 'ICU'],
          contact: '04 219 3000',
          distance: '20 minutes from central Dubai'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Emergency Department', 'Thoracic Surgery', 'ICU'],
          contact: '04 222 1211',
          distance: '25 minutes'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Emergency Department', 'Cardiothoracic Surgery'],
          contact: '04 435 9999',
          distance: '30 minutes'
        }
      ],
      localConsiderations: [
        'Dubai construction sites - high incidence of traumatic pneumothorax',
        'Heat stress can worsen respiratory distress - keep patient cool',
        'Construction workers often work long hours - fatigue increases injury risk',
        'Language barriers common on multi-national construction sites',
        'Site supervisors should have first aid training - may have already attempted intervention',
        'Heavy machinery creates access challenges - may need fire service assistance',
        'Document safety incidents per UAE labor laws',
        'Transport to designated trauma center regardless of distance',
        'Dubai Police may attend work-related injuries - cooperate with investigation',
        'Worker may be concerned about job security - reassure about UAE labor protections'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-tension-px',
          type: 'image',
          title: 'Tension Pneumothorax Clinical',
          url: 'https://radiopaedia.org/cases/tension-pneumothorax',
          source: 'Radiopaedia',
          caption: 'Clinical signs of tension pneumothorax including tracheal deviation and JVD',
          relevance: 'essential',
          tags: ['tension-pneumothorax', 'respiratory', 'emergency']
        }
      ],
      videos: [
        {
          id: 'vid-needle-decomp',
          type: 'video',
          title: 'Needle Thoracostomy Technique',
          url: 'https://www.youtube.com/watch?v=rfLKwFO5gUY',
          source: 'EMSWorld.com',
          caption: 'Proper technique for needle decompression including site selection and procedure',
          duration: '12:30',
          relevance: 'essential',
          tags: ['needle-decompression', 'tension-pneumothorax', 'procedure']
        },
        {
          id: 'vid-chest-tube',
          type: 'video',
          title: 'Chest Tube Insertion',
          url: 'https://www.youtube.com/watch?v=1AlFaLuuPVs',
          source: 'PrepMedic',
          caption: 'Step-by-step chest tube insertion following needle decompression',
          duration: '15:20',
          relevance: 'important',
          tags: ['chest-tube', 'thoracostomy', 'procedure']
        }
      ],
      procedures: [],
      articles: [
        {
          id: 'art-tension-px',
          type: 'article',
          title: 'Tension Pneumothorax',
          url: 'https://wikem.org/wiki/Tension_pneumothorax',
          source: 'WikEM',
          caption: 'Clinical features and emergency management of tension pneumothorax',
          relevance: 'essential',
          tags: ['tension-pneumothorax', 'respiratory', 'emergency']
        },
        {
          id: 'art-tension-px-statpearls',
          type: 'article',
          title: 'Tension Pneumothorax - Pathophysiology and Management',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK559090/',
          source: 'StatPearls',
          caption: 'Comprehensive review of tension pneumothorax pathophysiology and treatment',
          relevance: 'important',
          tags: ['tension-pneumothorax', 'pathophysiology', 'StatPearls']
        },
        {
          id: 'art-needle-decomp-atls',
          type: 'article',
          title: 'ATLS Guidelines - Thoracic Trauma',
          url: 'https://www.facs.org/quality-programs/trauma/atls/',
          source: 'American College of Surgeons',
          caption: 'Official ATLS guidelines for thoracic trauma management',
          relevance: 'essential',
          tags: ['ATLS', 'thoracic', 'trauma', 'guidelines']
        }
      ]
    }
  }),

  createCase({
    id: 'resp-003',
    title: 'COPD Exacerbation',
    category: 'respiratory',
    subcategory: 'copd',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    dispatchInfo: {
      callReason: 'Increased breathlessness, using oxygen at home',
      timeOfDay: 'morning',
      location: 'Apartment in Sharjah',
      callerInfo: 'Wife',
      dispatchCode: 'Charlie-1'
    },
    patientInfo: {
      age: 68,
      gender: 'male',
      weight: 70,
      occupation: 'Retired taxi driver',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Small apartment, patient in armchair',
      hazards: ['Oxygen cylinder present'],
      bystanders: 'Wife',
      environment: 'Warm, stuffy',
      sceneImagePath: '/scene-assets/home-copd-male-68-sharjah.png',
      sceneImageCaption: 'Apartment — Sharjah',
    },
    initialPresentation: {
      generalImpression: 'Elderly male, barrel chest, using accessory muscles',
      position: 'Sitting forward, tripod',
      appearance: 'Cyanotic, breathless, anxious',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Shallow',
        spo2: 85,
        findings: ['Barrel chest', 'Prolonged expiratory phase', 'Diffuse wheeze', 'Reduced air entry'],
        interventions: ['Controlled oxygen 24-28%', 'Nebulized bronchodilators'],
        auscultation: ['Reduced air entry bilaterally', 'Diffuse wheeze', 'Prolonged expiration']
      },
      circulation: {
        pulseRate: 105,
        pulseQuality: 'Regular',
        bp: { systolic: 150, diastolic: 85 },
        capillaryRefill: 2,
        skin: 'Warm, cyanosed',
        findings: ['Tachycardic', 'Hypertensive'],
        interventions: ['IV access']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Alert'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Home oxygen concentrator present', 'Inhalers on table'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Barrel chest', 'Hyperresonant'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Peripheral oedema — bilateral pitting to ankles (cor pulmonale)', 'Tar staining fingers'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Salbutamol inhaler', dose: '100mcg', frequency: 'PRN', indication: 'COPD' },
        { name: 'Tiotropium', dose: '18mcg', frequency: 'Daily', indication: 'COPD' },
        { name: 'Prednisolone', dose: '5mg', frequency: 'Daily', indication: 'COPD maintenance' }
      ],
      allergies: ['None'],
      medicalConditions: ['COPD (GOLD Stage 3)', 'Type 2 respiratory failure', 'Pulmonary hypertension'],
      surgicalHistory: [],
      lastMeal: 'Breakfast 1 hour ago',
      eventsLeading: 'Increased breathlessness over 3 days, cough with green sputum, using home oxygen more frequently',
      socialHistory: {
        smoking: '40 pack-years, quit 5 years ago'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '150/85', pulse: 105, respiration: 28, spo2: 85, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Barrel chest', 'Type 2 RF history', 'Infective exacerbation'],
      redFlags: ['CO2 retention risk', 'Respiratory failure'],
      differentialDiagnoses: ['COPD exacerbation', 'Pneumonia', 'Pulmonary embolism', 'Heart failure'],
      mostLikelyDiagnosis: 'COPD Exacerbation (infective)'
    },
    managementPathway: {
      immediate: ['Controlled oxygen 24-28% via Venturi mask (target SpO2 88-92%)', 'Nebulized bronchodilators: Salbutamol 5mg + Ipratropium 500mcg', 'IV hydrocortisone 100mg', 'IV access', 'Position upright with tripod posture'],
      definitive: ['Continuous bronchodilator therapy', 'Systemic corticosteroids', 'Antibiotics if bacterial infection suspected', 'NIV/BiPAP if acidotic or hypercapnic (pH <7.35)', 'Respiratory physiotherapy'],
      monitoring: ['SpO2 continuously (target 88-92%)', 'Respiratory rate and pattern', 'Heart rate and blood pressure', 'Level of consciousness (for CO2 retention)', 'Auscultation for wheeze/air entry', 'Work of breathing assessment', 'Signs of CO2 retention: bounding pulse, confusion, headache'],
      transportConsiderations: ['Continue controlled oxygen during transport', 'Use Venturi mask for precise FiO2 delivery', 'Do NOT use high-flow oxygen (>4L) without medical direction', 'Transport to facility with NIV capability', 'Pre-alert if patient requiring NIV or showing CO2 retention signs', 'Air-conditioned ambulance essential']
    },
    studentChecklist: [
      { id: 'r3-1', category: 'abcde', description: 'Controlled oxygen 24-28%', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'r3-2', category: 'intervention', description: 'Nebulized bronchodilators', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r3-3', category: 'intervention', description: 'IV hydrocortisone', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r3-4', category: 'abcde', description: 'Check for CO2 retention signs', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'r3-5', category: 'history', description: 'Obtain smoking history and pack-years', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r3-6', category: 'history', description: 'Ask about baseline oxygen requirements', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r3-7', category: 'abcde', description: 'Assess work of breathing and accessory muscle use', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r3-8', category: 'intervention', description: 'Position patient upright with tripod posture', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'r3-9', category: 'abcde', description: 'Check for fever and assess sputum characteristics', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r3-10', category: 'intervention', description: 'Consider NIV/BiPAP if available and indicated', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'r3-11', category: 'communication', description: 'Transport to facility with respiratory support', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r3-12', category: 'documentation', description: 'Document oxygen delivery method and patient response', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Controlled oxygen in COPD - target SpO2 88-92% to avoid CO2 retention',
      'High-flow oxygen can cause CO2 retention in chronic type 2 respiratory failure',
      'Nebulized beta-agonists (salbutamol) and anticholinergics (ipratropium) are first-line',
      'Systemic steroids (prednisolone 30-40mg PO or hydrocortisone 100mg IV) reduce inflammation',
      'Consider non-invasive ventilation (NIV/BiPAP) if acidotic (pH <7.35) or hypercapnic',
      'Signs of CO2 retention: bounding pulse, confusion, headache, warm peripheries',
      'PE is a common differential in COPD - maintain high index of suspicion',
      'Pneumonia can trigger exacerbation - check for fever and purulent sputum',
      'Antibiotics indicated if bacterial infection suspected (2+ Anthonisen criteria)',
      'Barrel chest, pursed-lip breathing, and tripod position are classic COPD signs',
      'Smoking history is crucial - calculate pack-years',
      'Prehospital focus: Controlled oxygen, bronchodilators, steroids, transport for definitive care'
    ],
    commonPitfalls: [
      'Giving high-flow oxygen (>4L) without recognizing type 2 respiratory failure risk',
      'Not asking about baseline oxygen requirements and target SpO2',
      'Missing signs of CO2 retention (bounding pulse, confusion, vasodilation)',
      'Not considering pneumonia as trigger for exacerbation',
      'Delaying steroid administration - give early',
      'Forgetting to assess for PE which can mimic COPD exacerbation',
      'Inadequate reassessment after interventions',
      'Not preparing for potential respiratory arrest',
      'Poor documentation of baseline status and oxygen requirements',
      'Transporting to inappropriate facility without respiratory support',
      'AVOID opioids (morphine, fentanyl) in COPD exacerbation — they cause respiratory depression on top of hypercapnic failure and can precipitate arrest. If the patient is in severe distress/agitation, treat the cause (hypoxia, bronchospasm) rather than sedating. If opioid is unavoidable (e.g. trauma with COPD), use smallest dose, have naloxone ready, and monitor RR/EtCO2 continuously.',
    ],
    equipmentNeeded: [
      'Controlled oxygen delivery device (Venturi mask 24-28%)',
      'Nebulizer with oxygen-driven capability (4-6 L/min)',
      'Salbutamol nebulizer solution (5mg/2.5ml)',
      'Ipratropium bromide nebulizer solution (500mcg/2ml)',
      'Hydrocortisone 100mg powder for injection',
      'IV cannulation kit (18G)',
      'Pulse oximeter (continuous monitoring)',
      'Peak flow meter (if patient cooperative)',
      'Blood glucose testing kit',
      'Cardiac monitor (assess for arrhythmias)',
      'Transport stretcher with oxygen mount',
      'Suction equipment',
      'Bag-valve-mask with reservoir'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Respiratory Emergency Protocol v4.0',
        'GOLD Guidelines for COPD Management',
        'British Thoracic Society COPD Guidelines'
      ],
      receivingFacilities: [
        {
          name: 'Al Zahra Hospital Sharjah',
          location: 'Sharjah',
          capabilities: ['Emergency Department', 'Respiratory Unit', 'NIV Support'],
          contact: '06 561 3333',
          distance: '10 minutes from most Sharjah locations'
        },
        {
          name: 'Kuwait Hospital',
          location: 'Sharjah',
          capabilities: ['Emergency Department', 'Respiratory Care'],
          contact: '06 543 1111',
          distance: '15 minutes'
        },
        {
          name: 'University Hospital Sharjah',
          location: 'Sharjah University City',
          capabilities: ['Emergency Department', 'Respiratory Medicine', 'ICU'],
          contact: '06 505 8555',
          distance: '20 minutes'
        }
      ],
      localConsiderations: [
        'Sharjah has significant smoking population - COPD common',
        'Home oxygen therapy common in elderly COPD patients - check concentrator settings',
        'Document baseline oxygen requirements and target saturation carefully',
        'Many apartments in Sharjah have stairs only - plan for stair carry',
        'Cultural consideration: Elderly patients command respect - involve family',
        'Language barriers common - ensure patient understands oxygen mask use',
        'Dust and air quality can trigger exacerbations - check recent weather',
        'Family often primary caregivers - educate about exacerbation signs',
        'Transport to facility with respiratory support and NIV capability',
        'Ramadan fasting can affect medication compliance in COPD patients'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-copd-barrel-chest',
          type: 'image',
          title: 'Barrel Chest in COPD',
          url: 'https://radiopaedia.org/cases/barrel-chest',
          source: 'Radiopaedia',
          caption: 'Clinical appearance of barrel chest in severe COPD',
          relevance: 'essential',
          tags: ['COPD', 'barrel-chest', 'clinical', 'examination']
        }
      ],
      videos: [
        {
          id: 'vid-copd-exacerbation',
          type: 'video',
          title: 'COPD Exacerbation: Prehospital Management',
          url: 'https://www.youtube.com/watch?v=JhzUUn9YiMM',
          source: 'Osmosis from Elsevier',
          caption: 'Evidence-based management of acute COPD exacerbation in prehospital setting',
          duration: '14:20',
          relevance: 'essential',
          tags: ['COPD', 'exacerbation', 'prehospital', 'management']
        },
        {
          id: 'vid-controlled-oxygen',
          type: 'video',
          title: 'COPD Pathophysiology and Oxygen Therapy',
          url: 'https://www.youtube.com/watch?v=kUNxXRqDBWs',
          source: 'Ninja Nerd',
          caption: 'Pathophysiology of Type 2 respiratory failure and controlled oxygen therapy',
          duration: '22:30',
          relevance: 'essential',
          tags: ['COPD', 'oxygen', 'type-2-respiratory-failure', 'pathophysiology']
        }
      ],
      articles: [
        {
          id: 'art-copd-001',
          type: 'article',
          title: 'COPD Exacerbation Management',
          url: 'https://www.nice.org.uk/guidance/ng115',
          source: 'NICE',
          caption: 'UK national guideline on COPD diagnosis and management including acute exacerbations',
          relevance: 'essential',
          tags: ['COPD', 'respiratory', 'exacerbation', 'NICE']
        },
        {
          id: 'art-copd-wikem',
          type: 'article',
          title: 'COPD Exacerbation - Emergency Management',
          url: 'https://wikem.org/wiki/COPD_exacerbation',
          source: 'WikEM',
          caption: 'Quick reference for emergency management of acute COPD exacerbation',
          relevance: 'important',
          tags: ['COPD', 'WikEM', 'emergency', 'exacerbation']
        },
        {
          id: 'art-gold-copd',
          type: 'article',
          title: 'GOLD Guidelines - COPD Management',
          url: 'https://goldcopd.org/gold-reports/',
          source: 'Global Initiative for Chronic Obstructive Lung Disease',
          caption: 'International guidelines for COPD diagnosis and management',
          relevance: 'essential',
          tags: ['COPD', 'GOLD', 'guidelines', 'management']
        },
        {
          id: 'art-copd-oxygen',
          type: 'article',
          title: 'Oxygen Therapy in COPD: Risks and Benefits',
          url: 'https://www.brit-thoracic.org.uk/document-library/clinical-information/copd/oxygen-guideline/',
          source: 'British Thoracic Society',
          caption: 'BTS guidelines on oxygen therapy in COPD patients',
          relevance: 'important',
          tags: ['COPD', 'oxygen', 'BTS', 'guidelines']
        }
      ]
    }
  }),

  createCase({
    id: 'resp-004',
    title: 'Pulmonary Embolism',
    category: 'respiratory',
    subcategory: 'pulmonary-embolism',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'], // 2nd-year stretch: PE presentation recognition and risk factors
    dispatchInfo: {
      callReason: 'Sudden shortness of breath, chest pain',
      timeOfDay: 'morning',
      location: 'Hotel room, Dubai Marina',
      callerInfo: 'Colleague',
      dispatchCode: 'Echo-1'
    },
    patientInfo: {
      age: 42,
      gender: 'female',
      weight: 75,
      occupation: 'Business traveler',
      language: 'English'
    },
    sceneInfo: {
      description: 'Hotel room, patient on bed',
      hazards: [],
      bystanders: 'Colleague',
      environment: 'Air-conditioned',
      sceneImagePath: '/scene-assets/hotel-room-medical-uae.png',
      sceneImageCaption: 'Hotel room — Dubai Marina, business traveller'
    },
    initialPresentation: {
      generalImpression: 'Middle-aged female, anxious, dyspneic',
      position: 'Sitting upright',
      appearance: 'Pale, tachypneic, distressed',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 89,
        findings: ['Tachypneic', 'Pleuritic chest pain', 'Clear chest'],
        interventions: ['High-flow oxygen'],
        auscultation: ['Clear air entry', 'No added sounds']
      },
      circulation: {
        pulseRate: 115,
        pulseQuality: 'Regular',
        bp: { systolic: 100, diastolic: 65 },
        capillaryRefill: 2,
        skin: 'Warm, pale',
        findings: ['Tachycardic', 'Borderline-low SBP (100) for a 42-year-old — watch for haemodynamic collapse as PE clot burden shifts'],
        interventions: ['IV access', 'Frequent BP — recheck every 3 minutes; PE patients can drop catastrophically without warning']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Right calf swollen and tender'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Tender right lower chest', 'Clear auscultation'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Right calf swollen, tender, warm — DVT', 'Pitting oedema unilateral right leg', 'Left leg normal — no oedema'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Combined oral contraceptive', dose: 'Standard', frequency: 'Daily', indication: 'Contraception' }
      ],
      allergies: ['None'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Breakfast 1 hour ago',
      eventsLeading: 'Long-haul flight from London 2 days ago, sudden onset pleuritic chest pain and breathlessness this morning',
      socialHistory: {
        smoking: 'Non-smoker'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '100/65', pulse: 115, respiration: 28, spo2: 89, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Recent long-haul flight', 'Pleuritic chest pain', 'Tachypnea', 'DVT signs'],
      redFlags: ['Massive PE', 'Hemodynamic compromise'],
      differentialDiagnoses: ['Pulmonary embolism', 'Pneumothorax', 'MI', 'Pneumonia'],
      mostLikelyDiagnosis: 'Pulmonary Embolism'
    },
    managementPathway: {
      immediate: ['High-flow oxygen 15L/min via non-rebreather', 'IV access x2 (16-18G)', '12-lead ECG (assess for S1Q3T3, right heart strain)', 'Fluid resuscitation if hypotensive (250-500ml crystalloid bolus)', 'Position semi-upright if comfortable'],
      definitive: ['CT pulmonary angiography (CTPA) for definitive diagnosis', 'Anticoagulation with heparin/LMWH', 'Thrombolysis for massive PE (hypotension/shock) - do NOT wait for imaging', 'Surgical embolectomy or catheter-based intervention if thrombolysis contraindicated', 'ICU admission for monitoring'],
      monitoring: ['Continuous SpO2 and cardiac monitoring', 'Blood pressure every 15 minutes', 'Respiratory rate and effort', 'Heart rate and rhythm (tachycardia common)', 'ECG monitoring for right heart strain progression', 'Hemodynamic stability assessment', 'Prepare for deterioration/massive PE'],
      transportConsiderations: ['Rapid transport to facility with CT angiography 24/7', 'Pre-alert for possible thrombolysis if hemodynamically unstable', 'Do NOT massage or excessively examine DVT (risk of further embolization)', 'Continue oxygen during transport', 'Monitor closely for hemodynamic collapse', 'Massive PE: consider thrombolysis en route if protocols allow']
    },
    studentChecklist: [
      { id: 'r4-1', category: 'abcde', description: 'High-flow oxygen', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'r4-2', category: 'intervention', description: 'IV access', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'r4-3', category: 'history', description: 'Assess PE risk factors', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'r4-4', category: 'intervention', description: 'Check for DVT', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'r4-5', category: 'abcde', description: 'Obtain 12-lead ECG to assess for right heart strain', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'r4-6', category: 'abcde', description: 'Assess hemodynamic stability and shock signs', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'r4-7', category: 'intervention', description: 'Position patient comfortably semi-upright', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'r4-8', category: 'abcde', description: 'Monitor vital signs continuously', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r4-9', category: 'intervention', description: 'Fluid resuscitation if hypotensive', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'r4-10', category: 'communication', description: 'Pre-alert receiving hospital for possible thrombolysis', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'r4-11', category: 'documentation', description: 'Document risk factors and clinical probability', points: 5, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'r4-12', category: 'safety', description: 'Prepare for deterioration and cardiac arrest', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'Classic triad: dyspnea, chest pain, tachypnea - but PE can present with any combination or none',
      'Risk factors: Virchow\'s triad - stasis (immobility, long flights), hypercoagulability (OCP, cancer, pregnancy), endothelial injury (surgery, trauma)',
      'Well\'s score for pre-test probability: Clinical signs of DVT (+3), alternative diagnosis less likely (+3), HR >100 (+1.5), immobilization/surgery (+1.5), previous DVT/PE (+1.5), hemoptysis (+1), malignancy (+1)',
      'Massive PE (hypotension, shock) requires thrombolysis - do NOT wait for definitive imaging',
      'ECG findings: S1Q3T3 (McGinn-White sign), sinus tachycardia, right heart strain (T wave inversions V1-V4), RAD',
      'Signs of right heart strain on ECG indicate hemodynamically significant PE',
      'D-dimer not helpful in high pre-test probability - proceed to imaging',
      'Prehospital management: Oxygen, IV access, hemodynamic support, rapid transport',
      'Consider underlying DVT — gently examine calves for asymmetric swelling, tenderness, warmth. (The popular "do not touch the calf" myth is not evidence-based per NICE NG158/BMJ Best Practice; gentle examination is safe. Just avoid vigorous squeezing / DVT-massage manoeuvres.)',
      'High suspicion in postpartum women, long-haul travelers, post-surgical patients, cancer patients',
      'Dubai is major travel hub - high index of suspicion in recent arrivals',
      'Pregnancy and postpartum period significantly increase PE risk',
      'Oral contraceptives increase PE risk 3-4 fold, especially with smoking or age >35',
      'Prehospital heparin not typically given - defer to hospital for risk stratification',
      'Massive PE with cardiac arrest: Consider thrombolysis during CPR if no contraindications'
    ],
    commonPitfalls: [
      'Missing PE because patient lacks all three classic symptoms',
      'Not assessing risk factors - long-haul flight is major clue',
      'Over-relying on D-dimer - not useful in high clinical probability',
      'Not checking for signs of DVT - calf examination is crucial',
      'Forgetting that PE can present with syncope only, especially in elderly',
      'Not recognizing signs of right heart strain on ECG',
      'Delaying transport waiting for improvement - PE can rapidly deteriorate',
      'Massaging or excessively examining DVT - risk of embolization',
      'Not preparing for potential hemodynamic collapse',
      'Attributing symptoms to anxiety without proper assessment',
      'Missing pregnancy/postpartum status in women of childbearing age',
      'Not considering thrombolysis for massive PE'
    ],
    equipmentNeeded: [
      'High-flow oxygen with non-rebreather mask',
      'IV cannulation kit (16G or 18G) x2',
      'Normal saline 0.9% 1000ml bags',
      'Blood pressure monitor',
      'Cardiac monitor/12-lead ECG',
      'Pulse oximeter',
      'Transport stretcher with monitoring',
      'Defibrillator pads (in case of arrest)',
      'Thrombolytic medications kit (if protocols allow)',
      'Blood glucose testing kit',
      'Measuring tape (for calf circumference comparison)',
      'Doppler ultrasound (if available)',
      'Emergency medications (adrenaline, atropine)',
      'Suction equipment'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Respiratory Emergency Protocol v4.0',
        'European Society of Cardiology PE Guidelines',
        'American College of Chest Physicians PE Guidelines'
      ],
      receivingFacilities: [
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['CT Angiography 24/7', 'Thrombolysis', 'ICU', 'Interventional Radiology'],
          contact: '04 435 9999',
          distance: '15 minutes from Dubai Marina'
        },
        {
          name: 'Rashid Hospital',
          location: 'Bur Dubai',
          capabilities: ['Emergency Department', 'CT Scan', 'Thrombolysis', 'ICU'],
          contact: '04 219 3000',
          distance: '20 minutes'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha',
          capabilities: ['Emergency Department', 'CT Angiography', 'ICU'],
          contact: '04 377 5500',
          distance: '25 minutes'
        }
      ],
      localConsiderations: [
        'Dubai is major international travel hub - high incidence of travel-related PE',
        'Dubai Marina popular with business travelers and tourists',
        'Hotel staff can provide access and language assistance',
        'Document flight history and travel dates carefully',
        'Many visitors may not have UAE health insurance - stabilize first, bill later',
        'Language barriers common with international visitors',
        'Consider time zone changes affecting symptom onset timing',
        'Cultural sensitivity: Female patients may prefer female providers',
        'Tourists may be traveling alone - obtain emergency contacts',
        'Long-haul flights from Europe/Americas common - 8+ hour flights high risk',
        'Postpartum women visiting from abroad - high PE risk period',
        'Transport to facility with CT angiography capability 24/7',
        'In UAE, PE is common in post-surgical patients and postpartum women',
        'Document thrombolysis contraindications if considering prehospital'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'ecg-pe-s1q3t3',
          type: 'image',
          title: 'Pulmonary Embolism - S1Q3T3 Pattern',
          url: 'https://radiopaedia.org/cases/pulmonary-embolism-ecg-changes',
          source: 'Radiopaedia',
          caption: 'Classic S1Q3T3 pattern and right heart strain in pulmonary embolism',
          relevance: 'essential',
          tags: ['PE', 'pulmonary-embolism', 'ECG', 'S1Q3T3']
        },
        {
          id: 'img-pe-ecg',
          type: 'image',
          title: 'S1Q3T3 Pattern in Pulmonary Embolism',
          url: 'https://litfl.com/wp-content/uploads/2018/08/ECG-S1-Q3-T3-pattern.jpg',
          source: 'Life in the Fast Lane',
          caption: 'Classic S1Q3T3 ECG pattern seen in pulmonary embolism',
          relevance: 'essential',
          tags: ['pulmonary-embolism', 'ECG', 'S1Q3T3', 'McGinn-White']
        },
        {
          id: 'vid-pe-ecg',
          type: 'video',
          title: 'ECG in Pulmonary Embolism',
          url: 'https://www.youtube.com/watch?v=q7aN10XUhvI',
          source: 'JAMA Network',
          caption: 'ECG findings in PE including S1Q3T3 and right heart strain patterns',
          duration: '11:20',
          relevance: 'essential',
          tags: ['PE', 'ECG', 'S1Q3T3', 'right-heart-strain']
        },
        {
          id: 'vid-massive-pe',
          type: 'video',
          title: 'Massive Pulmonary Embolism Management',
          url: 'https://www.youtube.com/watch?v=dxFOYVUlY2U',
          source: 'Strong Medicine',
          caption: 'Emergency management of massive PE including thrombolysis',
          duration: '13:45',
          relevance: 'important',
          tags: ['PE', 'massive', 'thrombolysis', 'emergency']
        }
      ],
      articles: [
        {
          id: 'art-pe-001',
          type: 'article',
          title: 'Pulmonary Embolism: Diagnosis and Management',
          url: 'https://bestpractice.bmj.com/topics/en-gb/116',
          source: 'BMJ Best Practice',
          caption: 'Comprehensive guide to PE diagnosis and management',
          relevance: 'essential',
          tags: ['PE', 'pulmonary-embolism', 'emergency']
        },
        {
          id: 'art-pe-nice',
          type: 'article',
          title: 'NICE Guideline: Venous Thromboembolic Diseases',
          url: 'https://www.nice.org.uk/guidance/ng158',
          source: 'NICE',
          caption: 'UK national guideline for diagnosis, management and thrombophilia testing for VTE',
          relevance: 'important',
          tags: ['PE', 'VTE', 'NICE', 'guidelines']
        },
        {
          id: 'art-wells-score',
          type: 'article',
          title: 'Well\'s Criteria for Pulmonary Embolism',
          url: 'https://www.mdcalc.com/wells-criteria-pulmonary-embolism',
          source: 'MDCalc',
          caption: 'Clinical prediction rule for PE probability',
          relevance: 'essential',
          tags: ['PE', 'wells-score', 'risk-stratification']
        },
        {
          id: 'art-esc-pe',
          type: 'article',
          title: 'ESC Guidelines on Pulmonary Embolism',
          url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Acute-Pulmonary-Embolism',
          source: 'European Society of Cardiology',
          caption: 'International guidelines for PE diagnosis and management',
          relevance: 'important',
          tags: ['PE', 'ESC', 'guidelines', 'management']
        }
      ]
    }
  }),

  // ==================== TRAUMA CASES (6 cases) ====================
  createCase({
    id: 'trauma-001',
    title: 'Multi-Trauma from RTC - Motorcycle vs Car',
    category: 'trauma',
    subcategory: 'multi-trauma',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['3rd-year', '4th-year'],
    dispatchInfo: {
      callReason: 'Motorcycle accident, rider on ground not moving',
      timeOfDay: 'afternoon',
      location: 'Sheikh Zayed Road, Dubai',
      callerInfo: 'Bystander',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 28,
      gender: 'male',
      weight: 75,
      occupation: 'Delivery driver',
      language: 'Urdu, Basic English'
    },
    sceneInfo: {
      description: 'Busy highway, motorcycle lying on side, car with front damage',
      hazards: ['Traffic', 'Fuel leak', 'Broken glass', 'Unstable motorcycle'],
      bystanders: 'Several people gathered, police arriving',
      environment: 'Hot weather, asphalt surface',
      environmentVariant: 'roadside',
      sceneImagePath: '/scene-assets/road-traffic-male-dubai.png',
      sceneImageCaption: 'Motorcycle vs car collision on Sheikh Zayed Road',
      sceneVideoPath: '/scene-assets/arrival-trauma-001-rtc.mp4',
    },
    initialPresentation: {
      generalImpression: 'Young male, supine on road, helmet removed by bystanders',
      position: 'Supine, head turned to side',
      appearance: 'Blood on face, right leg deformed, unconscious',
      consciousness: 'Unresponsive'
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Gurgling sounds', 'Blood in oropharynx', 'Facial fractures suspected'],
        interventions: ['Suction', 'Jaw thrust', 'Consider OPA']
      },
      breathing: {
        rate: 8,
        rhythm: 'Irregular',
        depth: 'Shallow',
        spo2: 85,
        findings: ['Bradypneic', 'Reduced air entry right side', 'Chest wall tenderness', 'Possible flail segment'],
        interventions: ['High-flow oxygen', 'BVM assistance', 'Seal open chest wound if present']
      },
      circulation: {
        pulseRate: 125,
        pulseQuality: 'Weak, thready',
        bp: { systolic: 80, diastolic: 50 },
        capillaryRefill: 4,
        skin: 'Pale, clammy',
        findings: ['Hypotensive', 'Tachycardic', 'Signs of shock', 'Right femur fracture with bleeding'],
        interventions: ['Control external bleeding', 'IV access x2', 'TXA 1g', 'Fluid bolus']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 3, total: 5 },
        pupils: 'Right dilated, left reactive',
        findings: ['Unequal pupils suggest head injury', 'Decorticate posturing (abnormal flexion)'],
        interventions: ['Spinal immobilization', 'Monitor GCS']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Open right femur fracture', 'Chest contusions', 'Facial lacerations', 'Road rash'],
        interventions: ['Expose to assess', 'Prevent hypothermia']
      }
    },
    secondarySurvey: {
      head: ['Facial lacerations', 'Periorbital bruising', 'Battle sign suspected'],
      neck: ['C-spine tenderness', 'Trachea central'],
      chest: ['Right chest tenderness', 'Decreased breath sounds right', 'Possible rib fractures'],
      abdomen: ['Soft, non-distended', 'Tender RUQ'],
      pelvis: ['Stable on compression'],
      extremities: ['Open femur fracture right', 'Distal pulses present', 'Deformity'],
      posterior: ['Road rash', 'No step-off'],
      neurological: ['GCS 5', 'Unequal pupils']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Unknown',
      eventsLeading: 'Motorcycle collided with car at intersection, thrown 5 meters'
    },
    vitalSignsProgression: {
      initial: { bp: '80/50', pulse: 125, respiration: 8, spo2: 85, gcs: 5 },
      afterIntervention: { bp: '96/62', pulse: 95, respiration: 12, spo2: 96, gcs: 5 }
    },
    expectedFindings: {
      keyObservations: ['Multiple trauma', 'Head injury with unequal pupils', 'Hypovolemic shock', 'Chest injury'],
      redFlags: ['Tension pneumothorax risk', 'Intracranial hemorrhage', 'Exsanguination'],
      differentialDiagnoses: ['Multi-trauma', 'TBI', 'Hemothorax/Pneumothorax', 'Pelvic fracture'],
      mostLikelyDiagnosis: 'Multi-trauma with TBI'
    },
    managementPathway: {
      immediate: ['Scene safety and PPE', 'CATASTROPHIC HAEMORRHAGE FIRST — CAT tourniquet 5-7cm proximal to open femur bleed (not over joint), note time; wound-pack arterial bleeds — this is step 1 of MARCH, before airway (exsanguination kills faster than airway failure in first minutes)', 'Manual C-spine stabilisation (selective — rigid collar only if mechanism + midline tenderness + neuro deficit)', 'Airway management (suction, jaw thrust, OPA/LMA/ETT)', 'High-flow oxygen and BVM if needed — aim SpO2 ≥94% (TBI protective)', 'Needle decompression if tension pneumothorax suspected (5th ICS AAL, 14G x 8cm preferred per TCCC 2022)', 'IV access x2 large bore (14-16G)', 'Small-volume Hartmann\'s aliquots (250mL) titrated — target SBP ≥110 mmHg if TBI (BTF 4th Ed; old SBP >90 is outdated), SBP 80-90 if penetrating without TBI', 'TXA 1g IV slow push within 3 hours of injury (CRASH-2 / CRASH-3)', 'Pelvic binder EMPIRICALLY at greater trochanters (NOT iliac crests) in high-mechanism polytrauma with shock — DO NOT spring/compress pelvis (outdated, disrupts clot)', 'Long bone fracture splinting', 'Activate Major Haemorrhage Protocol early for blood products'],
      definitive: ['Damage control surgery', 'CT imaging of head/chest/abdomen/pelvis', 'Neurosurgical intervention if indicated', 'Chest tube insertion if pneumothorax/hemothorax', 'Operative fixation of fractures', 'Massive transfusion protocol if ongoing bleeding', 'ICU admission for multi-system support'],
      monitoring: ['Continuous SpO2 and cardiac monitoring', 'Blood pressure monitoring', 'GCS and pupillary response', 'Capillary refill and peripheral perfusion', 'Urinary output (catheterize if indicated)', 'Temperature monitoring', 'Hemorrhage reassessment'],
      transportConsiderations: ['Rapid transport to Level I Trauma Center', 'Load and go approach', 'Consider HEMS activation for GCS <9 or hemodynamic instability', 'Pre-alert trauma team with mechanism and injuries', 'Continue resuscitation en route', 'Minimize scene time to <10 minutes', 'Bypass closer hospitals for trauma center']
    },
    studentChecklist: [
      { id: 't1-1', category: 'abcde', description: 'Scene safety and PPE', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 't1-2', category: 'abcde', description: 'Manual C-spine stabilization', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 't1-3', category: 'abcde', description: 'Airway management with trauma precautions', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 't1-4', category: 'abcde', description: 'Assess and treat breathing issues', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 't1-5', category: 'intervention', description: 'Control catastrophic hemorrhage', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 't1-6', category: 'intervention', description: 'IV access and fluid resuscitation', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 't1-7', category: 'intervention', description: 'Administer TXA if indicated', points: 5, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 't1-8', category: 'intervention', description: 'Splint femur fracture with traction', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 't1-9', category: 'communication', description: 'Request HEMS/trauma center', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'C-spine immobilization in all trauma patients',
      'Address catastrophic hemorrhage before airway in exsanguination',
      'TXA within 3 hours of injury',
      'Rapid transport to trauma center - load and go'
    ],
    visualResources: getTraumaResourcesByCondition('multi-trauma polytrauma chest hemothorax pneumothorax'),
    commonPitfalls: [
      'Failing to recognize and control catastrophic hemorrhage before addressing airway',
      'Neglecting C-spine immobilization during patient movement',
      'Delaying TXA administration beyond 3-hour window',
      'Over-resuscitating with crystalloids causing dilutional coagulopathy',
      'Missing tension pneumothorax due to focus on more obvious injuries',
      'Inadequate splinting of long bone fractures before transport',
      'Delaying HEMS activation for prolonged scene times',
      'Failing to perform log roll and assess the back',
      'Not securing adequate IV access (minimum 2 large-bore) before transport',
      'Prematurely removing tourniquets without surgical capability available'
    ],
    equipmentNeeded: [
      'Cervical collar and spinal immobilization devices',
      'Trauma tourniquets (CAT or SOFTT)',
      'Hemostatic gauze (Celox or QuikClot)',
      'Occlusive chest seals (vented and non-vented)',
      'Chest decompression needle (14G x 3.25")',
      'Pelvic binder',
      'Traction splint for femur fractures',
      'Rapid sequence intubation kit',
      'Tranexamic acid (TXA) 1g/10ml vials',
      'Blood products (O-negative if available)',
      'Thermal blanket for hypothermia prevention',
      'Portable ventilator'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Trauma Protocol - Multi-System Trauma',
        'DCAS Trauma Protocol - Hemorrhage Control',
        'PHTLS - Prehospital Trauma Life Support (9th Edition)',
        'ATLS - Advanced Trauma Life Support',
        'DCAS HEMS Activation Criteria'
      ],
      receivingFacilities: [
        { name: 'Rashid Hospital Trauma Center', location: 'Dubai', capabilities: ['Level I Trauma', 'Surgery', 'ICU', 'Cardiothoracic', 'Neurosurgery'], contact: '04-219-3000', distance: 'Varies by location' },
        { name: 'Dubai Hospital Trauma Center', location: 'Dubai', capabilities: ['Trauma Surgery', 'ICU', 'Orthopedics'], contact: '04-219-1000', distance: 'Varies by location' },
        { name: 'Sheikh Khalifa Medical City', location: 'Abu Dhabi', capabilities: ['Level I Trauma', 'Surgery', 'Neurosurgery', 'Cardiothoracic'], contact: '02-610-2000', distance: 'Varies by location' },
        { name: 'Al Ain Hospital Trauma Center', location: 'Al Ain', capabilities: ['Trauma Surgery', 'ICU', 'Orthopedics'], contact: '03-702-2000', distance: 'Varies by location' },
        { name: 'Sharjah University Hospital', location: 'Sharjah', capabilities: ['Trauma Surgery', 'ICU', 'Emergency Medicine'], contact: '06-558-2111', distance: 'Varies by location' },
        { name: 'Tawam Hospital', location: 'Al Ain', capabilities: ['Neurosurgery', 'Trauma Surgery', 'ICU backup'], contact: '03-767-7444', distance: 'Varies by location' }
      ],
      localConsiderations: [
        'Construction sites account for 40% of occupational trauma in UAE',
        'Summer heat (40°C+) increases risk of heat stress in responders',
        'Dubai has highest motorcycle trauma rate in Gulf region',
        'HEMS activation requires specific criteria (GCS <9, SBP <90, penetrating trauma)',
        'Cultural considerations: obtain consent from male family member when possible',
        'Language barriers common - use translation apps or bilingual crews',
        'Desert terrain may delay extrication - plan for prolonged scene times',
        'Ramadan considerations: reduced staffing may affect response times',
        'Multi-trauma patients should bypass closer hospitals for trauma centers'
      ]
    }
  }),

  createCase({
    id: 'trauma-002',
    title: 'Head Injury with Skull Fracture',
    category: 'trauma',
    subcategory: 'head-injury',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    dispatchInfo: {
      callReason: 'Fall from height, head injury, unconscious',
      timeOfDay: 'afternoon',
      location: 'Construction site, Dubai',
      callerInfo: 'Site supervisor',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 35,
      gender: 'male',
      weight: 80,
      occupation: 'Construction worker',
      language: 'Hindi'
    },
    sceneInfo: {
      description: 'Construction site, patient on ground',
      hazards: ['Heavy machinery', 'Uneven ground', 'Construction materials'],
      bystanders: 'Coworkers',
      environment: 'Outdoor, hot',
      environmentVariant: 'industrial',
      sceneImagePath: '/scene-assets/construction-fall-male-29-dubaihills.png',
      sceneImageCaption: 'Construction site fall — Dubai Hills',
    },
    initialPresentation: {
      generalImpression: 'Young male, supine, blood around head',
      position: 'Supine',
      appearance: 'Blood on face, unconscious',
      consciousness: 'Unresponsive'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent', 'Blood in mouth'],
        interventions: ['Suction', 'Recovery position if C-spine cleared']
      },
      breathing: {
        rate: 8,
        rhythm: 'Irregular — Cheyne-Stokes pattern',
        depth: 'Variable',
        spo2: 92,
        findings: ['Cushing triad feature — irregular respirations', 'Periodic apnoea episodes'],
        interventions: ['Assisted BVM ventilation targeting ETCO2 35-40', 'High-flow O2']
      },
      circulation: {
        pulseRate: 48,
        pulseQuality: 'Bounding',
        bp: { systolic: 190, diastolic: 110 },
        capillaryRefill: 2,
        skin: 'Normal',
        findings: ['Cushing triad — hypertension + bradycardia + irregular respirations = impending herniation'],
        interventions: ['IV access', 'Avoid hypotension (SBP > 110 target)']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 3, total: 5 },
        pupils: 'Right dilated, non-reactive (blown pupil — uncal herniation)',
        findings: ['GCS 5', 'Unilateral dilated pupil', 'Decerebrate posturing', 'Full Cushing triad present'],
        interventions: ['Spinal precautions', 'Hyperventilation if signs of herniation']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Scalp laceration right parietal', 'Battle sign', 'Raccoon eyes'],
        interventions: ['Dressing to wound']
      }
    },
    secondarySurvey: {
      head: ['Scalp laceration', 'Battle sign', 'Raccoon eyes', 'Periorbital bruising'],
      neck: ['C-spine precautions maintained'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['GCS 5', 'Right blown pupil', 'Decerebrate posturing']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown'],
      surgicalHistory: [],
      lastMeal: 'Unknown',
      eventsLeading: 'Fell from scaffolding approximately 4 meters, struck head on concrete'
    },
    vitalSignsProgression: {
      initial: { bp: '190/110', pulse: 48, respiration: 8, spo2: 92, gcs: 5 }
    },
    expectedFindings: {
      keyObservations: ['GCS 5', 'Blown pupil', 'Basal skull fracture signs'],
      redFlags: ['Signs of herniation', 'Expanding extradural hematoma'],
      differentialDiagnoses: ['Severe TBI', 'Extradural hematoma', 'Subdural hematoma'],
      mostLikelyDiagnosis: 'Severe TBI with signs of herniation'
    },
    managementPathway: {
      immediate: ['C-spine immobilization with rigid collar and blocks', 'Airway management with cervical spine precautions (suction, jaw thrust)', 'High-flow oxygen', 'IV access x2 with isotonic fluids (Normal Saline only)', 'Hyperventilation (ETCO2 30-35 mmHg) if signs of herniation', 'Head elevated 30 degrees', 'Mannitol 0.25-1g/kg or hypertonic saline if herniation suspected'],
      definitive: ['Emergency CT head', 'Neurosurgical intervention (craniotomy/craniectomy)', 'ICU admission with intracranial pressure monitoring', 'Mechanical ventilation with neuroprotective strategy', 'Avoid hypoxia (SpO2 ≥94%) and hypotension — TBI BP target SBP ≥110 mmHg and MAP ≥80 mmHg per BTF 4th Ed / NICE NG232 (SBP >90 is outdated; even a single episode of SBP <110 doubles mortality)'],
      monitoring: ['GCS every 5-10 minutes', 'Pupillary response (size, equality, reactivity)', 'Vital signs (BP, HR, RR, SpO2)', 'Watch for Cushing triad (HTN, bradycardia, irregular resp)', 'Signs of increasing ICP or herniation', 'Airway patency if GCS declining'],
      transportConsiderations: ['Immediate transport to neurosurgical center', 'Rapid sequence intubation if GCS <8 or airway compromise', 'Maintain C-spine immobilization throughout', 'Pre-alert neurosurgical team with GCS and mechanism', 'Airway equipment ready for deterioration', 'Do NOT delay for IV access if deteriorating']
    },
    studentChecklist: [
      { id: 't2-1', category: 'abcde', description: 'C-spine immobilization', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 't2-2', category: 'abcde', description: 'Assess GCS and pupils', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 't2-3', category: 'intervention', description: 'Recognize signs of herniation', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 't2-4', category: 'communication', description: 'Priority transport to neurosurgical center', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'Basal skull fracture signs: Battle sign, raccoon eyes, CSF leak',
      'Blown pupil indicates uncal herniation',
      'Cushing triad: hypertension, bradycardia, irregular breathing',
      'Rapid transport to neurosurgical center'
    ],
    visualResources: getTraumaResourcesByCondition('head injury TBI brain skull fracture'),
    commonPitfalls: [
      'Failing to maintain C-spine immobilization during patient movement',
      'Missing basal skull fracture signs (Battle sign, raccoon eyes, CSF leak)',
      'Delaying recognition of Cushing triad (hypertension, bradycardia, irregular resp)',
      'Not hyperventilating when signs of herniation are present',
      'Administering hypotonic fluids which worsen cerebral edema',
      'Allowing hypoxia or hypotension which worsens secondary brain injury',
      'Missing contralateral blown pupil indicating uncal herniation',
      'Failing to identify and document mechanism of injury',
      'Delaying transport to neurosurgical center beyond golden hour',
      'Not securing airway early in patients with GCS deteriorating below 8'
    ],
    equipmentNeeded: [
      'Rigid cervical collar and head blocks',
      'Vacuum mattress for spinal immobilization',
      'Rapid sequence intubation kit with neuroprotective agents',
      'Hyperventilation capability with end-tidal CO2 monitoring',
      'Manometer for controlled ventilation',
      'Nasogastric tube for gastric decompression',
      'Intravenous fluids (isotonic only - Normal Saline)',
      'Mannitol or hypertonic saline for suspected herniation',
      'Portable suction unit with Yankauer tip',
      'Oropharyngeal and nasopharyngeal airways',
      'GCS assessment card with pupil chart',
      'Thermal blanket to prevent hypothermia'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Trauma Protocol - Head Injury and Traumatic Brain Injury',
        'DCAS Trauma Protocol - Spinal Cord Injury',
        'ATLS - Advanced Trauma Life Support',
        'Brain Trauma Foundation Guidelines',
        'DCAS Neurosurgical Referral Pathway'
      ],
      receivingFacilities: [
        { name: 'Rashid Hospital Trauma Center', location: 'Dubai', capabilities: ['Level I Trauma', 'Neurosurgery', 'Surgery', 'ICU'], contact: '04-219-3000', distance: 'Varies by location' },
        { name: 'Latifa Hospital', location: 'Dubai', capabilities: ['Neurosurgery', 'Pediatric Neurosurgery', 'ICU'], contact: '04-219-1000', distance: 'Varies by location' },
        { name: 'Sheikh Khalifa Medical City', location: 'Abu Dhabi', capabilities: ['Neurosurgery', 'Level I Trauma', 'ICU'], contact: '02-610-2000', distance: 'Varies by location' },
        { name: 'Tawam Hospital', location: 'Al Ain', capabilities: ['Neurosurgery', 'Trauma Surgery', 'ICU'], contact: '03-767-7444', distance: 'Varies by location' },
        { name: 'Cleveland Clinic Abu Dhabi', location: 'Abu Dhabi', capabilities: ['Neurosurgery', 'Spine Surgery', 'ICU'], contact: '02-501-8000', distance: 'Varies by location' },
        { name: 'Saudi German Hospital', location: 'Dubai', capabilities: ['Neurosurgery', 'Trauma Surgery', 'ICU'], contact: '04-389-0000', distance: 'Varies by location' }
      ],
      localConsiderations: [
        'Construction falls account for 30% of severe TBI in UAE',
        'Heat stress may worsen neurological outcomes - cool patients aggressively',
        'Dubai construction sites require 3-meter scaffolding fall protection',
        'Many workers lack health insurance - may delay seeking care',
        'Language barriers require interpreter services or apps',
        'Neurosurgical beds limited - pre-alert hospitals early',
        'Ramadan working hours reduced but heat stress still prevalent',
        'Cultural: family notification may be required before treatment',
        'Private ambulance services may transport to private hospitals first'
      ]
    }
  }),

  createCase({
    id: 'trauma-003',
    title: 'Penetrating Chest Wound',
    category: 'trauma',
    subcategory: 'chest-trauma',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    dispatchInfo: {
      callReason: 'Stab wound to chest, bleeding heavily',
      timeOfDay: 'evening',
      location: 'Street in Deira, Dubai',
      callerInfo: 'Bystander',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 30,
      gender: 'male',
      weight: 75,
      occupation: 'Unknown',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Street corner, police present',
      hazards: ['Police incident'],
      bystanders: 'Police officers',
      environment: 'Outdoor',
      environmentVariant: 'roadside',
      sceneImagePath: '/scene-assets/trauma-003-deira-chest-wound.png',
      sceneImageCaption: 'Stab wound — Deira street',
    },
    initialPresentation: {
      generalImpression: 'Young male, sitting, holding chest',
      position: 'Sitting, leaning forward',
      appearance: 'Pale, distressed, blood on chest',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 26,
        rhythm: 'Labored',
        depth: 'Shallow',
        spo2: 90,
        findings: ['Sucking chest wound left side', 'Tachypnea', 'Reduced air entry left'],
        interventions: ['Apply vented chest seal (HyFin Vent / Russell / SAM) — current TCCC 2022 / PHTLS 10 standard; non-vented only as fallback, monitoring closely for tension', 'High-flow oxygen']
      },
      circulation: {
        pulseRate: 115,
        pulseQuality: 'Weak',
        bp: { systolic: 95, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Pale, clammy',
        findings: ['Tachycardic', 'Hypotensive', 'Signs of shock'],
        interventions: ['IV access x2', 'Fluid resuscitation']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Alert', 'Anxious'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['2cm stab wound 5th intercostal space left anterior chest', 'Moderate bleeding'],
        interventions: ['Expose', 'Control bleeding']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Stab wound left anterior', 'Tenderness', 'Crepitus'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Unknown',
      eventsLeading: 'Involved in altercation, stabbed in chest'
    },
    vitalSignsProgression: {
      initial: { bp: '95/60', pulse: 115, respiration: 26, spo2: 90, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Sucking chest wound', 'Hemodynamic compromise', 'Open pneumothorax'],
      redFlags: ['Tension pneumothorax risk', 'Cardiac tamponade risk'],
      differentialDiagnoses: ['Open pneumothorax', 'Hemothorax', 'Cardiac tamponade'],
      mostLikelyDiagnosis: 'Open Pneumothorax (Sucking Chest Wound)'
    },
    managementPathway: {
      immediate: ['Apply vented chest seal (HyFin Vent / Russell / SAM) — TCCC 2022 / PHTLS 10 standard. Improvised 3-sided taped dressings are unreliable (fail when wet/bloody) and no longer first-line.', 'High-flow oxygen 15L/min', 'IV access x2 large-bore (14-16G)', 'PERMISSIVE HYPOTENSION target SBP 80-90 mmHg (penetrating, no TBI): 250mL Hartmann\'s aliquots titrated to radial pulse / mentation — avoid large crystalloid volumes (dilutional coagulopathy). Activate Major Haemorrhage Protocol for blood products.', 'TRANEXAMIC ACID 1g IV slow push over 10 min within 3h of injury (CRASH-2, JRCALC 2024) — then 1g infusion over 8h in-hospital.', 'Position patient with injured side down if possible', 'Prepare for tension pneumothorax development — be ready to burp the seal or needle-decompress'],
      definitive: ['Chest X-ray to assess for pneumothorax/hemothorax', 'Chest tube insertion (if trained) or at hospital', 'Surgical exploration if ongoing air leak or bleeding', 'Blood transfusion if significant blood loss', 'Thoracic surgery consultation'],
      monitoring: ['Continuous SpO2 monitoring', 'Respiratory rate and effort', 'Blood pressure and heart rate', 'Breath sounds bilaterally', 'Signs of tension pneumothorax (remove dressing if develops)', 'Tracheal deviation', 'Signs of cardiac tamponade (Beck triad)'],
      transportConsiderations: ['Immediate transport to trauma center', 'Do NOT remove occlusive dressing unless tension develops', 'Pre-alert trauma team with mechanism and injuries', 'Continue oxygen during transport', 'Monitor closely for tension pneumothorax', 'Position injured side down if tolerated']
    },
    studentChecklist: [
      { id: 't3-1', category: 'intervention', description: 'Apply vented chest seal (HyFin Vent / Russell / SAM) — current TCCC 2022 / PHTLS 10 standard; non-vented only as fallback, monitoring closely for tension', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 't3-2', category: 'intervention', description: 'High-flow oxygen', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 't3-3', category: 'intervention', description: 'IV access and fluids', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 't3-4', category: 'abcde', description: 'Monitor for tension pneumothorax', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'Vented chest seal (HyFin Vent / Russell) is the current TCCC 2022 / PHTLS 10 standard. The improvised 3-sided taped dressing fails in ~1/3 of field uses (wet/bloody environment, inadvertent 4-sided seal) and is no longer first-line.',
      'If tension develops, remove dressing temporarily',
      'Position injured side down if possible',
      'Rapid transport to trauma center'
    ],
    visualResources: getTraumaResourcesByCondition('penetrating chest trauma pneumothorax hemothorax tamponade'),
    commonPitfalls: [
      'Completely sealing occlusive dressing on all sides causing tension pneumothorax',
      'Failing to monitor for tension pneumothorax development after sealing wound',
      'Delaying needle decompression when tension pneumothorax is suspected',
      'Positioning patient supine instead of injured-side-down',
      'Missing cardiac tamponade signs (Beck triad, pulsus paradoxus)',
      'Inadequate IV access for rapid fluid resuscitation',
      'Not checking for exit wound on the back',
      'Over-relying on SpO2 readings which may lag behind clinical deterioration',
      'Delaying transport attempting to stabilize in the field',
      'Failing to perform FAST exam if ultrasound available'
    ],
    equipmentNeeded: [
      'Occlusive chest seals (vented preferred, non-vented backup)',
      'Asherman chest seal or similar commercial device',
      '14G x 3.25" angiocatheter for needle decompression',
      'Chest tube kit (if trained and protocol allows)',
      'High-flow oxygen delivery system',
      'Large-bore IV catheters (14G-16G) x 4',
      'Blood products (O-negative) and fluid warmer',
      'Tranexamic acid (TXA) for penetrating trauma',
      'Chest drainage bag and underwater seal system',
      'Ultrasound with phased array probe (if available)',
      'Surgical airway kit (cricothyroidotomy)',
      'Trauma shears for rapid exposure'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Trauma Protocol - Penetrating Chest Trauma',
        'DCAS Trauma Protocol - Thoracic Trauma',
        'DCAS Trauma Protocol - Tension Pneumothorax',
        'PHTLS - Chest Trauma Management',
        'ATLS - Thoracic Trauma Guidelines',
        'DCAS Massive Hemorrhage Protocol'
      ],
      receivingFacilities: [
        { name: 'Rashid Hospital Trauma Center', location: 'Dubai', capabilities: ['Level I Trauma', 'Cardiothoracic Surgery', 'Surgery', 'ICU'], contact: '04-219-3000', distance: 'Varies by location' },
        { name: 'Dubai Hospital Trauma Center', location: 'Dubai', capabilities: ['Trauma Surgery', 'Thoracic Surgery', 'ICU'], contact: '04-219-1000', distance: 'Varies by location' },
        { name: 'Sheikh Khalifa Medical City', location: 'Abu Dhabi', capabilities: ['Cardiothoracic Surgery', 'Level I Trauma', 'ICU'], contact: '02-610-2000', distance: 'Varies by location' },
        { name: 'Cleveland Clinic Abu Dhabi', location: 'Abu Dhabi', capabilities: ['Cardiothoracic Surgery', 'Thoracic Surgery', 'ICU'], contact: '02-501-8000', distance: 'Varies by location' },
        { name: 'Mediclinic City Hospital', location: 'Dubai', capabilities: ['Cardiothoracic Surgery', 'Trauma Surgery', 'ICU'], contact: '04-435-9999', distance: 'Varies by location' },
        { name: 'Saudi German Hospital', location: 'Dubai', capabilities: ['Cardiothoracic Surgery', 'Trauma Surgery', 'ICU'], contact: '04-389-0000', distance: 'Varies by location' }
      ],
      localConsiderations: [
        'Penetrating trauma less common than blunt in UAE but increasing',
        'Knife wounds more common than gunshot wounds in civilian settings',
        'Police presence required at all penetrating trauma scenes - coordinate early',
        'Forensic evidence preservation required - do not remove weapon if embedded',
        'Chain of custody documentation for all medical interventions',
        'Rashid Hospital has 24/7 cardiothoracic surgery coverage',
        'Language barriers with South Asian workers common',
        'Summer heat increases metabolic demand and complicates shock management',
        'Cultural sensitivity required - male providers preferred for male patients'
      ]
    }
  }),

  // ==================== NEUROLOGICAL CASES (6 cases) ====================
  createCase({
    id: 'neuro-001',
    title: 'Acute Ischemic Stroke - FAST Positive',
    category: 'neurological',
    subcategory: 'stroke',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    dispatchInfo: {
      callReason: 'Husband suddenly cannot speak or move right side',
      timeOfDay: 'morning',
      location: 'Apartment in Downtown Dubai',
      callerInfo: 'Wife',
      dispatchCode: 'Echo-1'
    },
    patientInfo: {
      age: 67,
      gender: 'male',
      weight: 80,
      occupation: 'Retired banker',
      language: 'English'
    },
    sceneInfo: {
      description: 'Living room, patient in armchair',
      hazards: [],
      bystanders: 'Wife',
      environment: 'Clean, well-lit apartment',
      sceneImagePath: '/scene-assets/home-stroke-elderly-male-uae.png',
      sceneImageCaption: 'Home — elderly patient',
    },
    initialPresentation: {
      generalImpression: 'Elderly male, slumped in chair, facial droop obvious',
      position: 'Sitting, leaning to right',
      appearance: 'Alert but unable to communicate',
      consciousness: 'Confused - expressive aphasia'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent', 'Drooling from right side'],
        interventions: ['Position to protect airway']
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['Normal breath sounds'],
        interventions: ['Oxygen if hypoxic']
      },
      circulation: {
        pulseRate: 88,
        pulseQuality: 'Regular',
        bp: { systolic: 180, diastolic: 100 },
        capillaryRefill: 2,
        skin: 'Warm, dry',
        findings: ['Hypertensive'],
        interventions: ['Monitor BP', 'IV access']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 2, motor: 4, total: 10 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Facial droop right', 'Arm drift right', 'Slurred speech', 'Last known well 45 minutes ago'],
        interventions: ['Document exact time of onset', 'Blood glucose']
      },
      exposure: {
        temperature: 36.8,
        findings: ['No injuries'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Facial asymmetry — right-sided droop', 'Right nasolabial fold flattened', 'Unable to smile symmetrically'],
      neck: ['Supple, no meningismus', 'Carotids palpable, no bruit'],
      chest: ['Clear bilaterally', 'Regular rhythm'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: [
        'Right arm: decreased tone, weak grip (1/5 strength), pronator drift on outstretched arms',
        'Right leg: decreased tone, weak hip flexion (2/5 strength), unable to resist gravity',
        'Left side: normal strength (5/5), normal tone',
        'No peripheral oedema',
        'Peripheral pulses equal and strong bilaterally',
      ],
      posterior: ['Not examined — patient transferred supine'],
      neurological: [
        'FAST positive — Face droop right, Arm drift right, Speech abnormal (expressive aphasia), Time critical',
        'Expressive (Broca\'s) aphasia — comprehension intact, speech non-fluent',
        'Right hemiparesis — upper limb > lower limb weakness (MCA territory pattern)',
        'Right-sided hyperreflexia',
        'Babinski sign present on the right',
        'Conjugate gaze deviation to the LEFT (patient looks toward the side of the lesion)',
        'No visual field cut identified on crude confrontation (limited by aphasia)',
      ]
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '5mg', frequency: 'Daily', indication: 'Hypertension' },
        { name: 'Atorvastatin', dose: '20mg', frequency: 'Daily', indication: 'Cholesterol' },
        { name: 'Aspirin', dose: '75mg', frequency: 'Daily', indication: 'Stroke prevention' }
      ],
      allergies: ['None'],
      medicalConditions: ['Hypertension', 'Atrial fibrillation', 'Previous TIA 2022'],
      surgicalHistory: [],
      lastMeal: 'Breakfast 30 minutes ago',
      eventsLeading: 'Wife noticed husband slumped while reading newspaper, unable to speak clearly'
    },
    vitalSignsProgression: {
      initial: { bp: '180/100', pulse: 88, respiration: 18, spo2: 96, gcs: 10, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['FAST positive', 'Clear time of onset', 'On anticoagulation'],
      redFlags: ['Acute stroke', 'Potential contraindication to thrombolysis'],
      differentialDiagnoses: ['Acute ischemic stroke', 'Hemorrhagic stroke', 'Todd paralysis', 'Hypoglycemia'],
      mostLikelyDiagnosis: 'Acute Ischemic Stroke'
    },
    managementPathway: {
      immediate: ['Perform FAST assessment', 'Establish exact time last known well (critical for thrombolysis)', 'Check blood glucose to rule out hypoglycemia', 'IV access (18-20G)', 'NPO - do not give food or drink', 'Continuous cardiac and SpO2 monitoring', 'Document baseline GCS and neurological findings'],
      definitive: ['Non-contrast CT head within 25 minutes of arrival', 'IV thrombolysis (alteplase/tenecteplase) if within 4.5 hours and no contraindications', 'Mechanical thrombectomy if large vessel occlusion', 'Blood pressure management (<185/110 mmHg before thrombolysis)', 'Neuro ICU admission'],
      monitoring: ['Continuous neurological assessment (GCS)', 'Blood pressure every 15 minutes', 'Cardiac monitoring for arrhythmias (especially AF)', 'SpO2 monitoring', 'Blood glucose monitoring'],
      transportConsiderations: ['Rapid transport to stroke center - do not delay for IV access if stroke center <30 min away', 'Pre-alert stroke center with ETA and last known well time', 'Bypass closer non-stroke hospitals', 'Time is brain - every minute counts', 'Document exact last known well time precisely']
    },
    studentChecklist: [
      { id: 'n1-1', category: 'abcde', description: 'Perform FAST assessment', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'n1-2', category: 'history', description: 'Establish exact time last known well', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'n1-3', category: 'intervention', description: 'Check blood glucose', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'n1-4', category: 'intervention', description: 'IV access', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'n1-5', category: 'intervention', description: 'Do NOT give food or drink', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'n1-6', category: 'communication', description: 'Pre-alert stroke center', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'n1-7', category: 'documentation', description: 'Document GCS and neuro findings', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Time is brain - every minute counts',
      'Establish last known well time precisely',
      'Check for contraindications to thrombolysis',
      'Do not give aspirin until hemorrhage excluded'
    ],
    commonPitfalls: [
      'Delaying transport to obtain detailed history - "Time is brain" principle applies',
      'Failing to establish exact time last known well - critical for thrombolysis eligibility',
      'Giving aspirin before CT excludes hemorrhage - can worsen bleeding',
      'Overlooking atrial fibrillation as stroke cause in this patient on anticoagulation',
      'Not checking blood glucose - hypoglycemia mimics stroke (hypoglycemic hemiparesis)',
      'Administering food or drink - aspiration risk with dysphagia',
      'Missing contraindications to thrombolysis (recent surgery, bleeding risk)',
      'Failing to pre-alert stroke center - delays door-to-needle time',
      'Not documenting baseline NIHSS or GCS - essential for monitoring progression',
      'Assuming stroke is too mild for thrombolysis - minor strokes can still benefit'
    ],
    equipmentNeeded: [
      'Glucometer with strips',
      'BP cuff and pulse oximeter',
      '12-lead ECG machine',
      'IV cannulation kit (14G-18G)',
      'Normal saline 0.9% 500ml bags',
      'Oxygen delivery devices (nasal cannula, non-rebreather mask)',
      'Suction equipment',
      'Glasgow Coma Scale chart',
      'Stroke severity scale (NIHSS) reference',
      'Transport monitor/defibrillator',
      'Protective equipment for airway management'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'Time window: 4.5 hours for IV thrombolysis (alteplase/tenecteplase)',
        'Door-to-needle target: <60 minutes at comprehensive stroke center',
        'Minimum assessment: BP, glucose, 12-lead ECG, CT head (non-contrast)',
        'Do NOT delay transport for IV access if stroke center <30 min away',
        'Blood pressure management: <185/110 mmHg before thrombolysis',
        'Document "Last Known Well" time precisely - this is the zero time',
        'Pre-hospital notification mandatory for all suspected strokes',
        'NIHSS score should be performed by trained personnel',
        'Airway protection priority if GCS <8 or aspiration risk',
        'Avoid dextrose-containing fluids unless hypoglycemic'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital',
          location: 'Dubai',
          capabilities: ['24/7 thrombolysis', 'Endovascular thrombectomy', 'Neurosurgery', 'ICU'],
          contact: 'Emergency: 800 424',
          distance: '15-20 minutes from Downtown Dubai'
        },
        {
          name: 'Dubai Hospital',
          location: 'Dubai',
          capabilities: ['24/7 thrombolysis', 'Stroke unit', 'CT/MRI'],
          contact: 'Emergency: 800 424',
          distance: '10-15 minutes from Deira'
        },
        {
          name: 'Cleveland Clinic Abu Dhabi',
          location: 'Abu Dhabi',
          capabilities: ['24/7 thrombolysis', 'Mechanical thrombectomy', 'Neuro ICU'],
          contact: 'Emergency: 800 822',
          distance: '20-25 minutes from city center'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Dubai (Oud Metha)',
          capabilities: ['24/7 thrombolysis', 'Neurology consultation', 'Advanced imaging'],
          contact: 'Emergency: 04 336 6000',
          distance: '10-15 minutes from Bur Dubai'
        }
      ],
      localConsiderations: [
        'UAE has multiple certified stroke centers - know your local receiving hospitals',
        'Dubai Ambulance has stroke-specific dispatch protocols - use code Stroke',
        'Language barriers common - use interpretation services or family for consent',
        'Cultural considerations: family decision-making may delay consent for thrombolysis',
        'Traffic congestion in Dubai can significantly impact transport times',
        'Many expatriates lack detailed medical history - check for anticoagulant use',
        'Ramadan fasting may complicate medication timing and last meal documentation',
        'Summer heat may affect patient presentation and staff performance',
        'Insurance pre-authorization NOT required for emergency stroke care in UAE',
        'Transfer agreements between facilities exist - use stroke center bypass if appropriate'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-stroke-fast-001',
          type: 'image',
          title: 'FAST Assessment Diagram',
          url: 'https://www.stroke.org/en/about-stroke/stroke-symptoms',
          source: 'American Stroke Association',
          caption: 'Face drooping, Arm weakness, Speech difficulty, Time to call - FAST mnemonic',
          relevance: 'essential',
          tags: ['stroke', 'FAST', 'assessment', 'neurological']
        },
        {
          id: 'img-nihss-001',
          type: 'image',
          title: 'NIH Stroke Scale Score Sheet',
          url: 'https://www.ninds.nih.gov/sites/default/files/NIH_Stroke_Scale_Booklet.pdf',
          source: 'National Institutes of Health',
          caption: 'Standardized NIHSS scoring form for stroke severity assessment',
          relevance: 'essential',
          tags: ['stroke', 'NIHSS', 'assessment', 'scale']
        }
      ],
      videos: [
        {
          id: 'vid-stroke-medcram-001',
          type: 'video',
          title: 'Stroke: Risk Factors, Symptoms, and Treatment',
          url: 'https://www.youtube.com/watch?v=ZDhzCIi0_wA',
          source: 'Osmosis from Elsevier',
          caption: 'Comprehensive stroke pathophysiology and emergency management',
          duration: '14:52',
          relevance: 'essential',
          tags: ['stroke', 'pathophysiology', 'emergency', 'thrombolysis']
        },
        {
          id: 'vid-nihss-001',
          type: 'video',
          title: 'NIH Stroke Scale Training - Full Certification Course',
          url: 'https://www.youtube.com/watch?v=WKGs9qbVugk',
          source: 'Osmosis from Elsevier',
          caption: 'Official NIHSS training video for certification',
          duration: '18:30',
          relevance: 'essential',
          tags: ['stroke', 'NIHSS', 'assessment', 'certification']
        },
        {
          id: 'vid-stroke-lancet-001',
          type: 'video',
          title: 'Acute Stroke Management',
          url: 'https://www.youtube.com/watch?v=vJPTM8bXJmA',
          source: 'Ninja Nerd',
          caption: 'Clinical assessment and management of acute stroke',
          duration: '12:45',
          relevance: 'important',
          tags: ['stroke', 'assessment', 'management', 'emergency']
        }
      ],
      articles: [
        {
          id: 'art-stroke-001',
          type: 'article',
          title: 'Acute Stroke Management',
          url: 'https://www.nice.org.uk/guidance/ng128',
          source: 'NICE',
          caption: 'UK national guideline for stroke and transient ischaemic attack in adults',
          relevance: 'essential',
          tags: ['stroke', 'neurological', 'NICE', 'guidelines']
        },
        {
          id: 'art-stroke-aha-001',
          type: 'article',
          title: 'AHA/ASA Guidelines for Early Management of Acute Ischemic Stroke',
          url: 'https://professional.heart.org/en/guidelines-and-statements/search-guidelines-statements#q=acute%20ischemic%20stroke&sort=relevancy',
          source: 'American Heart Association/American Stroke Association',
          caption: 'Evidence-based guidelines for acute stroke management',
          relevance: 'essential',
          tags: ['stroke', 'guidelines', 'AHA', 'ASA', 'evidence-based']
        },
        {
          id: 'art-stroke-eso-001',
          type: 'article',
          title: 'ESO Guidelines on Thrombolysis for Acute Ischaemic Stroke',
          url: 'https://eso-stroke.org/eso-guidelines/',
          source: 'European Stroke Organisation',
          caption: 'European guidelines for stroke thrombolysis',
          relevance: 'important',
          tags: ['stroke', 'thrombolysis', 'ESO', 'guidelines']
        },
        {
          id: 'art-stroke-window-001',
          type: 'article',
          title: 'Ischemic Stroke - Emergency Management',
          url: 'https://wikem.org/wiki/Ischemic_stroke',
          source: 'WikEM',
          caption: 'Quick reference guide for ischemic stroke emergency assessment and management',
          relevance: 'essential',
          tags: ['stroke', 'ischemic', 'emergency', 'WikEM']
        },
        {
          id: 'art-stroke-statpearls',
          type: 'article',
          title: 'Acute Stroke Assessment and Treatment',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK535369/',
          source: 'StatPearls',
          caption: 'Comprehensive review of acute stroke pathophysiology and treatment options',
          relevance: 'important',
          tags: ['stroke', 'StatPearls', 'assessment', 'treatment']
        }
      ]
    }
  }),

  createCase({
    id: 'neuro-002',
    title: 'Generalized Tonic-Clonic Seizure',
    category: 'neurological',
    subcategory: 'seizure',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    dispatchInfo: {
      callReason: 'Daughter having a seizure, just stopped',
      timeOfDay: 'evening',
      location: 'Villa in Al Ain',
      callerInfo: 'Mother',
      dispatchCode: 'Charlie-1'
    },
    patientInfo: {
      age: 22,
      gender: 'female',
      weight: 60,
      occupation: 'Student',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Bedroom, patient on bed',
      hazards: [],
      bystanders: 'Parents',
      environment: 'Normal bedroom'
    },
    initialPresentation: {
      generalImpression: 'Young female, post-ictal, confused',
      position: 'Lying on side',
      appearance: 'Tachypneic, confused, bitten tongue',
      consciousness: 'Post-ictal confusion'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent', 'Blood in mouth from tongue bite'],
        interventions: ['Suction if needed', 'Recovery position']
      },
      breathing: {
        rate: 24,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 94,
        findings: ['Post-ictal tachypnea'],
        interventions: ['Oxygen']
      },
      circulation: {
        pulseRate: 105,
        pulseQuality: 'Regular',
        bp: { systolic: 130, diastolic: 80 },
        capillaryRefill: 2,
        skin: 'Warm, diaphoretic',
        findings: ['Tachycardic'],
        interventions: ['IV access']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 3, verbal: 3, motor: 5, total: 11 },
        pupils: 'Equal, sluggish',
        findings: ['Post-ictal confusion', 'Gradually improving'],
        interventions: ['Monitor', 'Protect from injury']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Tongue laceration', 'No other injuries'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Tongue bite'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Post-ictal', 'Gradually improving']
    },
    history: {
      medications: [
        { name: 'Levetiracetam', dose: '500mg', frequency: 'Twice daily', indication: 'Epilepsy' }
      ],
      allergies: ['None'],
      medicalConditions: ['Epilepsy diagnosed 5 years ago'],
      surgicalHistory: [],
      lastMeal: 'Dinner 4 hours ago',
      eventsLeading: 'Mother heard noise, found daughter having generalized seizure lasting approximately 2 minutes'
    },
    vitalSignsProgression: {
      initial: { bp: '130/80', pulse: 105, respiration: 24, spo2: 94, gcs: 11 }
    },
    expectedFindings: {
      keyObservations: ['Post-ictal state', 'Known epilepsy', 'Tongue bite confirms seizure'],
      redFlags: ['Status epilepticus if >5 min', 'First seizure needs workup'],
      differentialDiagnoses: ['Epileptic seizure', 'Syncope', 'Psychogenic non-epileptic seizure', 'Hypoglycemia'],
      mostLikelyDiagnosis: 'Generalized Tonic-Clonic Seizure (Post-ictal)'
    },
    managementPathway: {
      immediate: ['Position in recovery (lateral) position to protect airway', 'Suction oropharynx if blood/secretions present', 'High-flow oxygen via non-rebreather mask', 'Check blood glucose immediately', 'IV access (18-20G)', 'Monitor vital signs', 'Midazolam 5-10mg IV/IM/IN if seizure recurs or >5 min (status epilepticus)'],
      definitive: ['Neurology consultation', 'Brain imaging (CT/MRI) if first seizure or atypical features', 'EEG monitoring', 'Review and optimize antiepileptic medications', 'Investigate triggers (infection, missed meds, sleep deprivation)'],
      monitoring: ['Airway patency and breathing pattern', 'GCS and neurological status', 'Vital signs (BP, HR, SpO2)', 'Blood glucose', 'Seizure recurrence', 'Signs of head trauma from fall'],
      transportConsiderations: ['Transport to hospital even if seizure has stopped', 'Position in recovery position during transport', 'Monitor closely for recurrent seizures', 'Continue oxygen en route', 'Have midazolam ready for breakthrough seizures', 'Airway equipment readily available']
    },
    studentChecklist: [
      { id: 'n2-1', category: 'abcde', description: 'Airway protection in recovery position', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'n2-2', category: 'abcde', description: 'Check blood glucose', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'n2-3', category: 'intervention', description: 'Oxygen if hypoxic', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'n2-4', category: 'intervention', description: 'IV access', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'n2-5', category: 'intervention', description: 'Midazolam if seizure recurs', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'n2-6', category: 'history', description: 'Establish seizure duration and type', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Protect airway in post-ictal phase',
      'Check glucose - hypoglycemia can cause seizure',
      'Status epilepticus = >5 min or recurrent without recovery',
      'Midazolam first-line for prolonged seizures'
    ],
    commonPitfalls: [
      'Assuming post-ictal confusion will resolve quickly without monitoring - may indicate ongoing seizure',
      'Failing to check blood glucose immediately - hypoglycemia is a common seizure mimic and cause',
      'Not asking about seizure duration - >5 minutes = status epilepticus requiring immediate treatment',
      'Giving food or drink during post-ictal phase - aspiration risk with altered consciousness',
      'Missing subtle signs of ongoing seizure activity in post-ictal patient',
      'Not establishing IV access early - seizure may recur requiring urgent medication',
      'Failing to protect patient from injury during transport - restraints may be needed',
      'Not documenting seizure type and duration - essential for hospital handover',
      'Overlooking first seizure red flags in known epileptic - may indicate new pathology',
      'Delaying transport for detailed history - status epilepticus is time-critical emergency'
    ],
    equipmentNeeded: [
      'Glucometer with strips',
      'Pulse oximeter',
      'Suction equipment',
      'Oropharyngeal airways (various sizes)',
      'Bag-valve-mask (BVM) with reservoir',
      'Oxygen delivery devices',
      'IV cannulation kit (16G-18G)',
      'Normal saline 0.9%',
      'Midazolam 5mg/ml ampoules',
      'Diazepam rectal tubes (alternative)',
      'Glasgow Coma Scale chart',
      'Seizure timer/stopwatch',
      'Padding/protection for limbs',
      'Restraints (soft) for safety'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'Status epilepticus: defined as >5 minutes continuous seizure or recurrent without recovery',
        'First-line benzodiazepine: Midazolam 0.1-0.2mg/kg IV/IM/IN (max 10mg)',
        'Alternative if no IV: Midazolam 5-10mg IN or Diazepam 10-20mg PR',
        'Monitor airway and breathing continuously during and after seizure',
        'Check glucose immediately - treat hypoglycemia with IV dextrose if <3.5 mmol/L',
        'Position in recovery position post-ictal to protect airway',
        'Do NOT place anything in patient\'s mouth during seizure',
        'Protect from injury - move away hazardous objects',
        'Document seizure type, duration, and characteristics',
        'Transport to hospital even if seizure stops - risk of recurrence and need for workup'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital',
          location: 'Dubai',
          capabilities: ['24/7 neurology', 'EEG monitoring', 'ICU', 'MRI/CT'],
          contact: 'Emergency: 800 424',
          distance: '15-20 minutes'
        },
        {
          name: 'Al Zahra Hospital Dubai',
          location: 'Dubai',
          capabilities: ['Neurology', 'ICU', 'Advanced imaging', 'Epilepsy monitoring'],
          contact: 'Emergency: 04 377 5500',
          distance: '15-25 minutes'
        },
        {
          name: 'Cleveland Clinic Abu Dhabi',
          location: 'Abu Dhabi',
          capabilities: ['Level 3 epilepsy center', 'Video EEG', 'Epilepsy surgery program'],
          contact: 'Emergency: 800 822',
          distance: '20-25 minutes'
        }
      ],
      localConsiderations: [
        'UAE has neurologists available at major hospitals - early consultation recommended',
        'Epilepsy affects approximately 0.5-1% of UAE population - similar to global rates',
        'Cultural sensitivity: seizures may carry stigma - maintain patient dignity',
        'Medication adherence issues common - ask about missed doses of antiepileptics',
        'Heat exposure and dehydration can trigger seizures in UAE climate',
        'Ramadan fasting may affect medication timing and seizure threshold',
        'Many AEDs (antiepileptic drugs) available in UAE - check if patient has rescue medication',
        'Traffic accidents secondary to seizures - mandatory reporting to traffic department',
        'Insurance coverage varies for chronic epilepsy care - emergency treatment always covered',
        'Pediatric epilepsy common - specialized centers at Al Jalila and Sheikh Khalifa Medical City'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-seizure-recovery-001',
          type: 'image',
          title: 'Recovery Position for Post-Ictal Patient',
          url: 'https://www.resus.org.uk/library/recovery-position',
          source: 'Resuscitation Council UK',
          caption: 'Proper positioning to maintain airway and prevent aspiration',
          relevance: 'essential',
          tags: ['seizure', 'recovery-position', 'airway', 'post-ictal']
        },
        {
          id: 'img-seizure-types-001',
          type: 'image',
          title: 'Types of Seizures Classification',
          url: 'https://www.epilepsy.com/sites/default/files/styles/article_featured_image/public/2021-01/Seizure-Types-Infographic.png',
          source: 'Epilepsy Foundation',
          caption: 'ILAE classification of seizure types',
          relevance: 'important',
          tags: ['seizure', 'classification', 'epilepsy', 'types']
        }
      ],
      videos: [
        {
          id: 'vid-seizure-medcram-001',
          type: 'video',
          title: 'Seizures and Epilepsy: Causes and Treatment',
          url: 'https://www.youtube.com/watch?v=sKxBQNABVws',
          source: 'Ninja Nerd',
          caption: 'Pathophysiology of seizures and emergency management',
          duration: '15:30',
          relevance: 'essential',
          tags: ['seizure', 'epilepsy', 'pathophysiology', 'management']
        },
        {
          id: 'vid-status-001',
          type: 'video',
          title: 'Status Epilepticus Management',
          url: 'https://www.youtube.com/watch?v=bgczmh4Rc6o',
          source: 'Osmosis from Elsevier',
          caption: 'Step-by-step management of status epilepticus',
          duration: '11:20',
          relevance: 'essential',
          tags: ['status-epilepticus', 'seizure', 'emergency', 'benzodiazepine']
        },
        {
          id: 'vid-first-aid-seizure-001',
          type: 'video',
          title: 'Seizure First Aid',
          url: 'https://www.youtube.com/watch?v=Ovsw7tdneqE',
          source: 'MedCram',
          caption: 'Basic first aid for witnessed seizures',
          duration: '4:15',
          relevance: 'important',
          tags: ['seizure', 'first-aid', 'bystander', 'safety']
        }
      ],
      articles: [
        {
          id: 'art-seizure-litfl-001',
          type: 'article',
          title: 'Seizure - Emergency Management',
          url: 'https://wikem.org/wiki/Seizure',
          source: 'WikEM',
          caption: 'Quick reference guide for seizure assessment and emergency management',
          relevance: 'essential',
          tags: ['seizure', 'emergency', 'WikEM', 'management']
        },
        {
          id: 'art-status-nice-001',
          type: 'article',
          title: 'NICE Guideline: Epilepsies - Diagnosis and Management',
          url: 'https://www.nice.org.uk/guidance/ng217',
          source: 'NICE',
          caption: 'UK national guideline for epilepsy and status epilepticus management',
          relevance: 'essential',
          tags: ['status-epilepticus', 'seizure', 'NICE', 'guidelines']
        },
        {
          id: 'art-seizure-statpearls',
          type: 'article',
          title: 'Status Epilepticus - Pathophysiology and Treatment',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK430765/',
          source: 'StatPearls',
          caption: 'Comprehensive review of status epilepticus pathophysiology and treatment',
          relevance: 'important',
          tags: ['status-epilepticus', 'StatPearls', 'treatment']
        },
        {
          id: 'art-seizure-ilae-001',
          type: 'article',
          title: 'ILAE Classification of Seizures',
          url: 'https://www.ilae.org/guidelines/definition-and-classification/classification-of-seizures',
          source: 'International League Against Epilepsy',
          caption: 'Official international seizure classification system',
          relevance: 'important',
          tags: ['seizure', 'classification', 'ILAE', 'epilepsy']
        },
        {
          id: 'art-seizure-mimics-001',
          type: 'article',
          title: 'Seizure Mimics and Differential Diagnosis',
          url: 'https://bestpractice.bmj.com/topics/en-gb/161',
          source: 'BMJ Best Practice',
          caption: 'Conditions that mimic seizures and how to differentiate',
          relevance: 'important',
          tags: ['seizure', 'mimics', 'differential', 'BMJ']
        }
      ]
    }
  }),

  createCase({
    id: 'neuro-003',
    title: 'Meningitis',
    category: 'neurological',
    subcategory: 'meningitis',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'], // 2nd-year stretch: meningitis presentation recognition
    dispatchInfo: {
      callReason: 'Fever, severe headache, neck stiffness',
      timeOfDay: 'morning',
      location: 'Apartment in Dubai Marina',
      callerInfo: 'Roommate',
      dispatchCode: 'Echo-1'
    },
    patientInfo: {
      age: 25,
      gender: 'male',
      weight: 72,
      occupation: 'Marketing executive',
      language: 'English'
    },
    sceneInfo: {
      description: 'Bedroom, patient in bed',
      hazards: [],
      bystanders: 'Roommate',
      environment: 'Dim lighting'
    },
    initialPresentation: {
      generalImpression: 'Young male, photophobia, uncomfortable',
      position: 'Lying still',
      appearance: 'Febrile, distressed, photophobic',
      consciousness: 'Alert but irritable'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 97,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Regular',
        bp: { systolic: 110, diastolic: 70 },
        capillaryRefill: 2,
        skin: 'Warm, flushed',
        findings: ['Tachycardic', 'Fever'],
        interventions: ['IV access']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Neck stiffness', 'Photophobia', 'Kernig sign positive'],
        interventions: []
      },
      exposure: {
        temperature: 39.2,
        findings: ['Fever', 'Non-blanching rash on legs - petechiae'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Photophobia', 'Severe headache'],
      neck: ['Stiff neck', 'Positive Kernig sign'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Petechial rash on lower limbs'],
      posterior: ['Normal'],
      neurological: ['Meningeal signs positive']
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Breakfast - poor appetite',
      eventsLeading: 'Fever and headache for 2 days, rapidly worsening, rash appeared this morning'
    },
    vitalSignsProgression: {
      initial: { bp: '110/70', pulse: 110, respiration: 20, spo2: 97, temperature: 39.2, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Fever', 'Headache', 'Neck stiffness', 'Rash'],
      redFlags: ['Meningococcal septicemia', 'Septic shock risk'],
      differentialDiagnoses: ['Bacterial meningitis', 'Viral meningitis', 'Subarachnoid hemorrhage', 'Malaria'],
      mostLikelyDiagnosis: 'Bacterial Meningitis (Meningococcal)'
    },
    managementPathway: {
      immediate: ['Benzylpenicillin 1.2g IM/IV (adult) — UK JRCALC / NICE CG102 prehospital first-line for suspected meningococcal disease with non-blanching rash (in every UK ambulance drug bag; ceftriaxone 2g IV reserved for hospital or penicillin-allergic alternative). Do NOT delay transport to give antibiotics.', 'IV access with large-bore cannula', 'Fluid resuscitation 30ml/kg if septic shock', 'High-flow oxygen (target SpO2 ≥94%)', 'Check blood glucose', 'Dexamethasone 10mg IV WITH or JUST BEFORE the first antibiotic dose (blunts cytokine response at bacterial lysis — loses benefit if given after)', 'Droplet precautions (FFP3 mask, eye protection, gloves)'],
      definitive: ['Urgent CT head (if indicated) followed by lumbar puncture', 'Continue IV antibiotics (Ceftriaxone + Vancomycin)', 'ICU admission for monitoring', 'Contact tracing and prophylaxis for close contacts', 'Isolation for 24 hours after antibiotics started'],
      monitoring: ['Vital signs every 15 minutes', 'Glasgow Coma Scale', 'Skin for progression of rash (petechiae to purpura)', 'Signs of septic shock (hypotension, tachycardia)', 'Neurological status', 'Response to antibiotics'],
      transportConsiderations: ['Rapid transport to hospital with infectious disease capability', 'Pre-alert with droplet precautions required', 'Continue antibiotics during transport if started', 'Monitor for deterioration', 'Minimize time - antibiotics within 1 hour is critical', 'Use droplet precautions throughout transport']
    },
    studentChecklist: [
      { id: 'n3-1', category: 'abcde', description: 'Recognize meningitis triad', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'n3-2', category: 'abcde', description: 'Check for non-blanching rash', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'n3-3', category: 'intervention', description: 'IV access and fluids', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'n3-4', category: 'intervention', description: 'Antibiotics within 1 hour', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'n3-5', category: 'communication', description: 'Isolation precautions', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'Classic triad: fever, headache, neck stiffness',
      'Non-blanching rash suggests meningococcal',
      'Antibiotics within 1 hour of recognition',
      'Isolation precautions for meningococcal'
    ],
    commonPitfalls: [
      'Waiting for CT scan before giving antibiotics - "Don\'t let the scan delay the penicillin"',
      'Failing to recognize that meningitis triad is present in only 44% of cases',
      'Not checking for non-blanching rash - glass test essential for meningococcal',
      'Delaying transport for lumbar puncture - LP is not a prehospital procedure',
      'Missing early signs of septic shock - tachycardia and hypotension may be subtle initially',
      'Not using droplet precautions immediately - healthcare worker exposure risk',
      'Overlooking petechiae on dark skin - examine carefully under good lighting',
      'Giving steroids AFTER antibiotics — dexamethasone should be given WITH or IMMEDIATELY BEFORE the first antibiotic dose to blunt the inflammatory cascade at bacterial lysis (NICE NG240 / IDSA). Delayed dex loses its benefit.',
      'Not asking about sick contacts or recent travel - important epidemiological data',
      'Attributing altered mental status solely to fever - may indicate encephalitis'
    ],
    equipmentNeeded: [
      'Glucometer with strips',
      'Thermometer (tympanic/temporal)',
      'Pulse oximeter',
      'BP cuff',
      '12-lead ECG machine',
      'IV cannulation kit (14G-18G)',
      'Normal saline 0.9% 500ml bags',
      'Wide-bore giving sets',
      'Ceftriaxone 2g vials',
      'Vancomycin 1g vials (if available)',
      'Dexamethasone 10mg vials (give with/after antibiotics)',
      'Oxygen delivery devices',
      'Personal protective equipment (N95 masks, gloves, gowns)',
      'Suction equipment',
      'Glass slide or clear object for blanching test',
      'Glasgow Coma Scale chart'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'Antibiotics within 1 hour of hospital arrival - do not delay for imaging',
        'Prehospital antibiotics if transport time >30 minutes or patient unstable',
        'Ceftriaxone 2g IV (preferred) or Cefotaxime 2g IV',
        'Add Vancomycin 1g IV if penicillin-resistant pneumococcus suspected',
        'Dexamethasone 10mg IV (give with or just after first antibiotic dose)',
        'Aggressive fluid resuscitation if signs of septic shock (30ml/kg crystalloid)',
        'Droplet precautions until 24 hours of appropriate antibiotics completed',
        'Notify infection control immediately for suspected meningococcal disease',
        'Prophylaxis for close contacts required for meningococcal disease',
        'Document Glasgow Coma Scale and monitor for deterioration'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital',
          location: 'Dubai',
          capabilities: ['24/7 infectious disease', 'ICU', 'CT/MRI', 'Isolation facilities'],
          contact: 'Emergency: 800 424',
          distance: '15-20 minutes from Dubai Marina'
        },
        {
          name: 'Dubai Hospital',
          location: 'Dubai',
          capabilities: ['Infectious disease', 'ICU', 'Neurology', 'Isolation units'],
          contact: 'Emergency: 800 424',
          distance: '20-30 minutes from Dubai Marina'
        },
        {
          name: 'Sheikh Khalifa Medical City',
          location: 'Abu Dhabi',
          capabilities: ['Infectious disease', 'ICU', 'Advanced isolation', 'Research center'],
          contact: 'Emergency: 800 555',
          distance: '20-25 minutes'
        },
        {
          name: 'Al Zahra Hospital Dubai',
          location: 'Dubai',
          capabilities: ['Infectious disease', 'ICU', 'Modern isolation facilities'],
          contact: 'Emergency: 04 377 5500',
          distance: '25-35 minutes from Dubai Marina'
        }
      ],
      localConsiderations: [
        'UAE has mandatory meningococcal vaccination for Hajj and Umrah pilgrims',
        'Meningococcal disease requires immediate notification to public health authorities',
        'Close contact prophylaxis available through health centers - usually ciprofloxacin or rifampicin',
        'High expatriate population increases risk of imported infections',
        'Summer heat increases risk of dehydration - fluid resuscitation critical',
        'Healthcare workers and family require prophylaxis for meningococcal exposure',
        'Dubai and Abu Dhabi have isolation facilities for infectious diseases',
        'Infection control hotline available for guidance: Dubai 800 342',
        'University students in shared accommodation at higher risk',
        'No major outbreaks in UAE in recent years due to vaccination programs'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-meningitis-rash-001',
          type: 'image',
          title: 'Meningococcal Rash - Petechiae and Purpura',
          url: 'https://www.meningitis.org/sites/default/files/2020-05/meningococcal-rash.jpg',
          source: 'Meningitis Research Foundation',
          caption: 'Characteristic non-blanching rash of meningococcal disease',
          relevance: 'essential',
          tags: ['meningitis', 'rash', 'meningococcal', 'petechiae']
        },
        {
          id: 'img-glass-test-001',
          type: 'image',
          title: 'Glass Test for Meningococcal Rash',
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Glass_test.jpg/640px-Glass_test.jpg',
          source: 'Wikimedia Commons',
          caption: 'Using a glass to check if rash blanches under pressure',
          relevance: 'essential',
          tags: ['meningitis', 'glass-test', 'rash', 'diagnosis']
        },
        {
          id: 'img-kernig-sign-001',
          type: 'image',
          title: 'Kernig and Brudzinski Signs',
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/12_lead_ECG.PNG/640px-12_lead_ECG.PNG',
          source: 'Wikimedia Commons',
          caption: 'Physical exam maneuvers for meningeal irritation',
          relevance: 'important',
          tags: ['meningitis', 'Kernig', 'Brudzinski', 'physical-exam']
        }
      ],
      videos: [
        {
          id: 'vid-meningitis-001',
          type: 'video',
          title: 'Meningitis: Recognition and Emergency Management',
          url: 'https://www.youtube.com/watch?v=gIHUJs2eTHA',
          source: 'Osmosis from Elsevier',
          caption: 'Clinical features and emergency management of meningitis',
          duration: '14:25',
          relevance: 'essential',
          tags: ['meningitis', 'emergency', 'recognition', 'management']
        },
        {
          id: 'vid-meningococcal-001',
          type: 'video',
          title: 'Meningococcal Disease: Early Recognition',
          url: 'https://www.youtube.com/watch?v=IaQdv_dBDqM',
          source: 'MedCram',
          caption: 'Early signs and symptoms of meningococcal disease',
          duration: '6:30',
          relevance: 'essential',
          tags: ['meningococcal', 'meningitis', 'recognition', 'early-signs']
        },
        {
          id: 'vid-rash-glass-001',
          type: 'video',
          title: 'How to Do the Glass Test',
          url: 'https://www.youtube.com/watch?v=ZEQNx4BZk_k',
          source: 'Ninja Nerd',
          caption: 'Demonstration of the glass test for meningococcal rash',
          duration: '2:15',
          relevance: 'important',
          tags: ['meningitis', 'glass-test', 'rash', 'demonstration']
        }
      ],
      articles: [
        {
          id: 'art-meningitis-litfl-001',
          type: 'article',
          title: 'Meningitis - Emergency Management',
          url: 'https://wikem.org/wiki/Meningitis',
          source: 'WikEM',
          caption: 'Quick reference for meningitis diagnosis and emergency management',
          relevance: 'essential',
          tags: ['meningitis', 'emergency', 'WikEM', 'management']
        },
        {
          id: 'art-meningococcal-nice',
          type: 'article',
          title: 'NICE Guideline: Meningitis and Meningococcal Septicaemia',
          url: 'https://www.nice.org.uk/guidance/cg102',
          source: 'NICE',
          caption: 'UK national guideline on bacterial meningitis and meningococcal disease management',
          relevance: 'essential',
          tags: ['meningococcal', 'meningitis', 'NICE', 'guidelines']
        },
        {
          id: 'art-meningitis-statpearls',
          type: 'article',
          title: 'Bacterial Meningitis - Pathophysiology and Treatment',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK459360/',
          source: 'StatPearls',
          caption: 'Comprehensive review of bacterial meningitis pathophysiology and treatment',
          relevance: 'important',
          tags: ['meningitis', 'StatPearls', 'bacterial', 'treatment']
        },
        {
          id: 'art-meningitis-idsa-001',
          type: 'article',
          title: 'IDSA Guidelines for Management of Bacterial Meningitis',
          url: 'https://www.idsociety.org/practice-guideline/bacterial-meningitis/',
          source: 'Infectious Diseases Society of America',
          caption: 'Evidence-based guidelines for bacterial meningitis',
          relevance: 'important',
          tags: ['meningitis', 'guidelines', 'IDSA', 'bacterial']
        },
        {
          id: 'art-meningitis-rash-001',
          type: 'article',
          title: 'The Glass Test for Meningococcal Disease',
          url: 'https://www.meningitisnow.org/meningitis-explained/symptoms/glass-test/',
          source: 'Meningitis Now',
          caption: 'How to perform and interpret the glass test',
          relevance: 'essential',
          tags: ['meningitis', 'glass-test', 'rash', 'meningococcal']
        }
      ]
    }
  }),

  // ==================== METABOLIC CASES (5 cases) ====================
  createCase({
    id: 'metab-001',
    title: 'Severe Hypoglycemia',
    category: 'metabolic',
    subcategory: 'hypoglycemia',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
    dispatchInfo: {
      callReason: 'Father confused and sweating, not responding properly',
      timeOfDay: 'early-morning',
      location: 'Villa in Abu Dhabi',
      callerInfo: 'Son',
      dispatchCode: 'Charlie-1'
    },
    patientInfo: {
      age: 58,
      gender: 'male',
      weight: 75,
      occupation: 'Accountant',
      language: 'Arabic, English'
    },
    sceneInfo: {
      description: 'Bedroom, patient on floor beside bed',
      hazards: [],
      bystanders: 'Wife and son',
      environment: 'Normal bedroom',
      sceneImagePath: '/scene-assets/metab-001-hypoglycemia-male-villa.png',
      sceneImageCaption: 'Villa — hypoglycaemic episode',
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, diaphoretic, confused',
      position: 'Sitting on floor, leaning against bed',
      appearance: 'Pale, profuse sweating, trembling',
      consciousness: 'Confused, drowsy'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent', 'Gag reflex present'],
        interventions: []
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 95,
        pulseQuality: 'Regular',
        bp: { systolic: 130, diastolic: 80 },
        capillaryRefill: 2,
        skin: 'Pale, diaphoretic',
        findings: ['Tachycardic'],
        interventions: ['IV access'],
        ecgFindings: ['Sinus rhythm', 'No acute ST changes']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 3, verbal: 4, motor: 6, total: 13 },
        pupils: 'Equal and reactive',
        bloodGlucose: 1.8,
        findings: ['Confused', 'Agitated when stimulated', 'Tremors'],
        interventions: ['Oral glucose if able', 'IV dextrose if not']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Insulin pen on bedside table', 'Medic alert bracelet - Diabetes'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Tremor in hands', 'No peripheral oedema'],
      posterior: ['Normal'],
      neurological: ['Confused', 'Oriented to person only']
    },
    history: {
      medications: [
        { name: 'Insulin glargine', dose: '24 units', frequency: 'Daily', indication: 'Diabetes' },
        { name: 'Insulin aspart', dose: 'Variable', frequency: 'With meals', indication: 'Diabetes' },
        { name: 'Metformin', dose: '1g', frequency: 'Twice daily', indication: 'Diabetes' }
      ],
      allergies: ['None'],
      medicalConditions: ['Type 1 Diabetes (30 years)', 'Diabetic retinopathy', 'Peripheral neuropathy'],
      surgicalHistory: [],
      lastMeal: 'Dinner 10 hours ago, skipped breakfast',
      eventsLeading: 'Son heard noise, found father confused on floor, patient took usual insulin but did not eat breakfast'
    },
    vitalSignsProgression: {
      initial: { bp: '130/80', pulse: 95, respiration: 18, spo2: 98, bloodGlucose: 1.8, gcs: 13 },
      afterIntervention: { bp: '135/82', pulse: 85, respiration: 16, spo2: 98, bloodGlucose: 4.5, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Blood glucose 1.8 mmol/L', 'Altered consciousness', 'Skipped meal after insulin'],
      redFlags: ['Severe hypoglycemia', 'Risk of seizure/coma'],
      differentialDiagnoses: ['Hypoglycemia', 'Stroke', 'Seizure post-ictal', 'Intoxication'],
      mostLikelyDiagnosis: 'Severe Hypoglycemia'
    },
    managementPathway: {
      immediate: ['Check blood glucose immediately (do not delay for history)', 'If conscious and cooperative: Oral glucose 15-20g (glucose tablets, sugary drink)', 'If impaired consciousness or unable to swallow: IV dextrose 10% 200-250ml or D50 50ml', 'If no IV access: Glucagon 1mg IM/SC', 'Recheck glucose in 10-15 minutes'],
      definitive: ['Continue IV dextrose until glucose normalizes and patient can eat', 'Investigate precipitating cause (missed meal, excess insulin, alcohol, infection)', 'Diabetes specialist review', 'Patient education on hypoglycemia recognition and prevention'],
      monitoring: ['Blood glucose every 10-15 minutes until stable', 'Level of consciousness', 'Vital signs', 'Response to treatment', 'Signs of seizure'],
      transportConsiderations: ['Transport to hospital if glucose does not normalize', 'If glucose normalized and patient alert with good support: may not need transport if no concerning features', 'Continue monitoring during transport', 'Have IV dextrose ready for recurrent hypoglycemia', 'Patient should not drive or operate machinery']
    },
    studentChecklist: [
      { id: 'm1-1', category: 'abcde', description: 'Check blood glucose immediately', points: 15, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'm1-2', category: 'intervention', description: 'Administer oral glucose if conscious', points: 10, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'm1-3', category: 'intervention', description: 'IV dextrose 10% if impaired consciousness', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'm1-4', category: 'intervention', description: 'Glucagon IM if no IV access', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'm1-5', category: 'abcde', description: 'Reassess glucose after treatment', points: 5, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'm1-6', category: 'history', description: 'Identify precipitating cause', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Never delay glucose check in altered consciousness',
      'IV dextrose for impaired consciousness',
      'Glucagon alternative if no IV access',
      'Always look for precipitating cause'
    ],
    visualResources: {
      images: [],
      videos: [
        {
          id: 'vid-hypoglycemia-medcram',
          type: 'video',
          title: 'Hypoglycemia: Causes, Symptoms, and Treatment',
          url: 'https://www.youtube.com/watch?v=2biZNLgT70U',
          source: 'Osmosis from Elsevier',
          caption: 'Comprehensive review of hypoglycemia pathophysiology and emergency management',
          duration: '14:30',
          relevance: 'essential',
          tags: ['hypoglycemia', 'pathophysiology', 'treatment', 'diabetes']
        },
        {
          id: 'vid-hypoglycemia-ninja',
          type: 'video',
          title: 'Hypoglycemia Emergency Management',
          url: 'https://www.youtube.com/watch?v=uRlhWFpbbcQ',
          source: 'MedCram',
          caption: 'Detailed lecture on recognizing and treating severe hypoglycemia',
          duration: '18:20',
          relevance: 'important',
          tags: ['hypoglycemia', 'emergency', 'management', 'glucose']
        }
      ],
      articles: [
        {
          id: 'art-hypoglycemia-001',
          type: 'article',
          title: 'Hypoglycemia - Emergency Management',
          url: 'https://wikem.org/wiki/Hypoglycemia',
          source: 'WikEM',
          caption: 'Quick reference for recognition and emergency management of hypoglycemia',
          relevance: 'essential',
          tags: ['hypoglycemia', 'glucose', 'diabetes', 'emergency']
        },
        {
          id: 'art-hypoglycemia-ada',
          type: 'article',
          title: 'ADA Standards of Care - Hypoglycemia Management',
          url: 'https://diabetes.org/about-diabetes/hypoglycemia',
          source: 'American Diabetes Association',
          caption: 'ADA guidance on hypoglycemia recognition, treatment and prevention',
          relevance: 'essential',
          tags: ['hypoglycemia', 'ADA', 'diabetes', 'standards']
        },
        {
          id: 'art-hypoglycemia-statpearls',
          type: 'article',
          title: 'Hypoglycemia - Pathophysiology and Treatment',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK534841/',
          source: 'StatPearls',
          caption: 'Comprehensive review of hypoglycemia causes, pathophysiology and treatment',
          relevance: 'important',
          tags: ['hypoglycemia', 'StatPearls', 'pathophysiology', 'treatment']
        },
        {
          id: 'art-hypoglycemia-diabetes-uk',
          type: 'article',
          title: 'Hypos - What to Do',
          url: 'https://www.diabetes.org.uk/guide-to-diabetes/complications/hypos',
          source: 'Diabetes UK',
          caption: 'Patient and provider guidance on managing hypoglycemic episodes',
          relevance: 'important',
          tags: ['hypoglycemia', 'Diabetes-UK', 'management']
        }
      ],
      procedures: []
    },
    commonPitfalls: [
      'Delaying glucose check while obtaining full history - check immediately in altered consciousness',
      'Giving oral glucose to unconscious or semi-conscious patient - aspiration risk',
      'Not rechecking glucose after treatment to ensure response',
      'Failing to establish IV access early in case of deterioration',
      'Not identifying precipitating cause (missed meal, excess insulin, alcohol, infection)',
      'Administering glucagon when IV access is available - IV dextrose works faster',
      'Over-treating with excessive glucose leading to rebound hyperglycemia',
      'Not considering hypoglycemia in patients with atypical presentations (stroke-like symptoms, behavioral changes)',
      'Failing to educate patient/family on prevention after recovery',
      'Not documenting exact glucose levels and response to treatment'
    ],
    equipmentNeeded: [
      'Blood glucose meter with test strips',
      'IV cannulation kit (18-20G)',
      'Dextrose 10% or 50% solution',
      'Glucagon 1mg kit (IM/SC injection)',
      'Normal saline 0.9% 500ml bags',
      'Oral glucose gel or tablets',
      'Nasogastric tube (if oral route needed for unconscious patient)',
      'Cardiac monitor',
      'Pulse oximeter',
      'Blood pressure cuff',
      'Blankets for warmth',
      'Sharps container',
      'Alcohol swabs',
      'Gloves and PPE'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Hypoglycemia Management Protocol v3.2',
        'DCAS Diabetic Emergency Guidelines',
        'ADA Standards of Medical Care in Diabetes - Emergency Management',
        'Dubai Diabetes Center Emergency Protocols'
      ],
      receivingFacilities: [
        {
          name: 'Dubai Diabetes Center',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['24/7 Endocrine Emergency Services', 'Diabetes Specialist On-call', 'Continuous Glucose Monitoring'],
          contact: '04 435 9999',
          distance: '25 minutes from Al Barsha'
        },
        {
          name: 'Rashid Hospital Endocrine Department',
          location: 'Deira, Dubai',
          capabilities: ['Emergency Endocrine Care', 'Diabetic Ketoacidosis Management', 'Hypoglycemia Expertise'],
          contact: '04 219 3000',
          distance: '30 minutes from Al Barsha'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['Emergency Department', 'Endocrinology Consultation', 'Diabetes Management'],
          contact: '04 377 5500',
          distance: '15 minutes from Al Barsha'
        }
      ],
      localConsiderations: [
        'Ramadan fasting can increase hypoglycemia risk in diabetic patients - check recent fasting patterns',
        'High prevalence of Type 2 diabetes in UAE (approximately 19% of population) - maintain high index of suspicion',
        'Many patients may be on newer glucose-lowering agents (SGLT2 inhibitors, GLP-1 agonists) - hypoglycemia risk varies',
        'Cultural considerations: family members may want to feed patient sweets immediately - educate about appropriate glucose administration',
        'Language barriers common with South Asian expatriate population - use translation apps if needed',
        'Ensure patient has glucagon kit prescribed for home use before discharge',
        'Document thoroughly for endocrinology follow-up at specialized diabetes centers'
      ]
    }
  }),

  createCase({
    id: 'metab-002',
    title: 'Diabetic Ketoacidosis (DKA)',
    category: 'metabolic',
    subcategory: 'dka',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    dispatchInfo: {
      callReason: 'Vomiting, abdominal pain, breathing fast',
      timeOfDay: 'afternoon',
      location: 'Apartment in Dubai',
      callerInfo: 'Friend',
      dispatchCode: 'Echo-1'
    },
    patientInfo: {
      age: 24,
      gender: 'female',
      weight: 60,
      occupation: 'Student',
      language: 'English'
    },
    sceneInfo: {
      description: 'Living room, patient on sofa',
      hazards: [],
      bystanders: 'Friend',
      environment: 'Normal apartment',
      sceneImagePath: '/scene-assets/home-abdominal-female-uae.png',
      sceneImageCaption: 'Living room — apartment, young female on sofa'
    },
    initialPresentation: {
      generalImpression: 'Young female, Kussmaul breathing, drowsy',
      position: 'Sitting, leaning forward',
      appearance: 'Flushed, dry skin, acetone breath odor',
      consciousness: 'Drowsy but rousable',
      odor: ['Acetone/fruity breath']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 30,
        rhythm: 'Regular',
        depth: 'Deep',
        spo2: 96,
        findings: ['Kussmaul respiration', 'Deep rapid breathing'],
        interventions: ['Monitor']
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Weak',
        bp: { systolic: 95, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Warm, dry',
        findings: ['Tachycardic', 'Hypotensive', 'Dehydrated'],
        interventions: ['IV access', 'Fluid resuscitation'],
        ecgFindings: ['Sinus tachycardia ~110 bpm', 'Check for peaked T waves (hyperkalaemia risk in DKA)']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        bloodGlucose: 28.5,
        findings: ['Drowsy', 'Confused', 'Oriented to person only — responds to voice (AVPU = V)', 'Severe hyperglycaemia — BGL 28.5 mmol/L'],
        interventions: []
      },
      exposure: {
        temperature: 37.5,
        findings: ['Dry mucous membranes', 'Poor skin turgor'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Diffuse tenderness', 'Non-specific'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Drowsy', 'Oriented to person only']
    },
    history: {
      medications: [
        { name: 'Insulin glargine', dose: '20 units', frequency: 'Daily', indication: 'Type 1 DM' },
        { name: 'Insulin aspart', dose: 'Variable', frequency: 'With meals', indication: 'Type 1 DM' }
      ],
      allergies: ['None'],
      medicalConditions: ['Type 1 Diabetes (12 years)'],
      surgicalHistory: [],
      lastMeal: 'Skipped meals for 2 days due to vomiting',
      eventsLeading: 'Vomiting for 2 days, stopped insulin, progressive drowsiness'
    },
    vitalSignsProgression: {
      initial: { bp: '95/60', pulse: 110, respiration: 30, spo2: 96, temperature: 37.5, gcs: 14, bloodGlucose: 28.5 }
    },
    expectedFindings: {
      keyObservations: ['Kussmaul breathing', 'Hyperglycemia', 'Ketones', 'Dehydration'],
      redFlags: ['Severe DKA', 'Risk of cerebral edema'],
      differentialDiagnoses: ['Diabetic ketoacidosis', 'HHS', 'Sepsis', 'AKI'],
      mostLikelyDiagnosis: 'Diabetic Ketoacidosis'
    },
    managementPathway: {
      immediate: ['IV access with large-bore cannula (14-16G)', 'Fluid resuscitation: 0.9% NaCl 1L over first hour (fluid FIRST, then insulin). Second litre over next 2h.', 'Check and document blood glucose and ketones (capillary + urine)', 'DO NOT give insulin bolus prehospital. Hospital pathway: fixed-rate insulin INFUSION 0.1 units/kg/hr ONLY after first litre of saline is running (UK JBDS 2023 — bolus insulin is associated with cerebral oedema, especially in young patients). Do not start insulin prehospital if transport <30 min.', 'Potassium replacement when K+ is 3.5-5.5 mmol/L (add 40 mmol KCl to fluids); if K+ <3.5, senior review (UK JBDS threshold, not <5.3)', 'Continuous cardiac monitoring for hypokalaemia-related arrhythmia'],
      definitive: ['ICU admission for close monitoring', 'Continue fluid resuscitation with 0.9% NaCl', 'Insulin infusion until ketosis resolves and anion gap closes', 'Transition to subcutaneous insulin when eating', 'Identify and treat precipitating cause'],
      monitoring: ['Blood glucose hourly', 'Vital signs every 15-30 minutes', 'Neurological status - monitor for cerebral edema (headache, altered mental status, bradycardia, hypertension)', 'Fluid balance and urine output', 'Electrolytes (especially potassium)', 'ECG monitoring for arrhythmias'],
      transportConsiderations: ['Rapid transport to hospital with endocrinology/ICU capabilities', 'Continue fluid resuscitation en route', 'Do not delay for detailed history - fluids are life-saving', 'Monitor airway and neurological status closely', 'Air-conditioned transport essential']
    },
    studentChecklist: [
      { id: 'm2-1', category: 'abcde', description: 'Check blood glucose and ketones', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'm2-2', category: 'intervention', description: 'IV access and fluid resuscitation', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'm2-3', category: 'intervention', description: 'Recognise that insulin is given as a FIXED-RATE IV INFUSION (0.1 units/kg/hr) only AFTER the first litre of saline is running — NO bolus (UK JBDS 2023: bolus insulin → cerebral oedema risk). Paramedic role is fluid resuscitation first; insulin is hospital-initiated.', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'm2-4', category: 'abcde', description: 'Monitor for cerebral edema', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'DKA: Hyperglycemia + Ketosis + Metabolic acidosis',
      'Fluid resuscitation is priority',
      'Insulin after fluids started',
      'Monitor for cerebral edema in children/young adults'
    ],
    visualResources: {
      images: [],
      videos: [
        {
          id: 'vid-dka-osmosis',
          type: 'video',
          title: 'Diabetic Ketoacidosis: Pathophysiology and Management',
          url: 'https://www.youtube.com/watch?v=xkD5aBtshlk',
          source: 'Lecturio Nursing',
          caption: 'Clear explanation of DKA pathophysiology and step-by-step management',
          duration: '12:15',
          relevance: 'essential',
          tags: ['DKA', 'pathophysiology', 'management', 'diabetes']
        },
        {
          id: 'vid-dka-icuadvantage',
          type: 'video',
          title: 'DKA Management in Critical Care',
          url: 'https://www.youtube.com/watch?v=IxrCVf3ZSRs',
          source: 'RegisteredNurseRN',
          caption: 'Critical care approach to DKA including fluid management and insulin protocols',
          duration: '22:30',
          relevance: 'important',
          tags: ['DKA', 'critical-care', 'insulin', 'fluid-management']
        }
      ],
      articles: [
        {
          id: 'art-dka-001',
          type: 'article',
          title: 'Diabetic Ketoacidosis - Emergency Management',
          url: 'https://wikem.org/wiki/Diabetic_ketoacidosis',
          source: 'WikEM',
          caption: 'Quick reference for DKA diagnosis and emergency management',
          relevance: 'essential',
          tags: ['DKA', 'diabetes', 'ketoacidosis', 'emergency']
        },
        {
          id: 'art-dka-ada',
          type: 'article',
          title: 'ADA Consensus Statement: DKA Management',
          url: 'https://diabetes.org/about-diabetes/dka-ketoacidosis',
          source: 'American Diabetes Association',
          caption: 'ADA consensus guidelines on DKA recognition and treatment',
          relevance: 'essential',
          tags: ['DKA', 'ADA', 'guidelines', 'consensus']
        },
        {
          id: 'art-dka-bmj',
          type: 'article',
          title: 'DKA - Diagnosis and Management',
          url: 'https://bestpractice.bmj.com/topics/en-gb/162',
          source: 'BMJ Best Practice',
          caption: 'Evidence-based approach to DKA diagnosis and management',
          relevance: 'important',
          tags: ['DKA', 'BMJ', 'diagnosis', 'management']
        },
        {
          id: 'art-dka-statpearls',
          type: 'article',
          title: 'Diabetic Ketoacidosis - Pathophysiology',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK534848/',
          source: 'StatPearls',
          caption: 'Comprehensive review of DKA pathophysiology, diagnosis and treatment',
          relevance: 'important',
          tags: ['DKA', 'StatPearls', 'pathophysiology', 'treatment']
        }
      ]
    },
    commonPitfalls: [
      'Delaying fluid resuscitation while attempting to obtain detailed history - fluids are life-saving in DKA',
      'Starting insulin before adequate fluid resuscitation - can worsen hypotension and precipitate cerebral edema',
      'Not monitoring for cerebral edema in pediatric and young adult patients (headache, altered mental status, bradycardia, hypertension)',
      'Failing to check potassium levels before starting insulin - insulin drives K+ intracellularly and can cause fatal hypokalemia',
      'Using hypotonic fluids too early - start with isotonic (0.9% NaCl)',
      'Not recognizing precipitating causes (infection, missed insulin doses, MI, new-onset diabetes)',
      'Bicarbonate administration inappropriately - only for severe acidosis (pH < 6.9) with hemodynamic compromise',
      'Insufficient monitoring of glucose and electrolytes - check hourly initially',
      'Not calculating anion gap to confirm diagnosis and monitor resolution',
      'Discontinuing insulin when glucose normalizes - continue until ketosis resolves and patient eating'
    ],
    equipmentNeeded: [
      'IV cannulation kit (16-18G large bore for rapid fluid administration)',
      '0.9% Normal Saline 1000ml bags (multiple)',
      '0.45% Normal Saline 1000ml bags (for later phase)',
      'Dextrose 5% solution (for when glucose < 14 mmol/L)',
      'Regular insulin (rapid-acting)',
      'IV infusion pumps',
      'Blood glucose meter',
      'Blood ketone meter or urine ketone strips',
      'Cardiac monitor with 12-lead ECG capability',
      'Pulse oximeter',
      'Blood pressure monitor',
      'Urinary catheter (for accurate output monitoring)',
      'Blood gas analyzer or i-STAT device',
      'Suction equipment',
      'Airway management equipment (LMA, ETT)',
      'Oxygen delivery devices',
      'Potassium chloride ampoules (for replacement when K+ < 5.3)',
      'Sodium bicarbonate 8.4% (rarely used, for pH < 6.9)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Diabetic Ketoacidosis Protocol v4.1',
        'DCAS Hyperglycemic Emergency Guidelines',
        'ADA Standards of Care - DKA Management',
        'Dubai Hospital Endocrine Emergency Pathways',
        'ISPAD Clinical Practice Consensus Guidelines (for young adults)'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Emergency Department',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Emergency Care', 'Endocrinology On-call', 'ICU', 'DKA Management Protocol'],
          contact: '04 219 3000',
          distance: '15 minutes from Downtown Dubai'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Emergency Department', 'Endocrinology', 'Critical Care', 'Diabetes Center'],
          contact: '04 222 1211',
          distance: '20 minutes from Downtown Dubai'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['Emergency Department', 'Endocrinology', 'ICU', 'Diabetes Management'],
          contact: '04 377 5500',
          distance: '10 minutes from Downtown Dubai'
        },
        {
          name: 'Dubai Diabetes Center',
          location: 'Dubai Healthcare City',
          capabilities: ['Specialized Diabetes Care', 'DKA Expertise', 'Diabetes Education'],
          contact: '04 435 9999',
          distance: '15 minutes from Downtown Dubai'
        }
      ],
      localConsiderations: [
        'High prevalence of diabetes in UAE population - maintain high index of suspicion for DKA',
        'Ramadan fasting can precipitate DKA if insulin adjustments not made properly - ask about recent fasting',
        'Many young adults with Type 1 diabetes may have poor glycemic control due to lifestyle factors',
        'Cultural factors: family may not understand insulin requirements - education needed',
        'Cost of insulin and supplies can affect compliance - check access to medications',
        'Transport in air-conditioned ambulance important - prevents further dehydration',
        'Document precipitating factors thoroughly for endocrinology follow-up',
        'Many patients may have comorbidities common in UAE (obesity, hypertension, dyslipidemia)'
      ]
    }
  }),

  // ==================== PSYCHIATRIC/ANXIETY CASES (3 cases) ====================
  createCase({
    id: 'psych-001',
    title: 'Panic Attack with Hyperventilation',
    category: 'anxiety-related',
    subcategory: 'panic-attack',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
    dispatchInfo: {
      callReason: 'Wife having panic attack, cannot breathe, chest pain',
      timeOfDay: 'evening',
      location: 'Apartment in Jumeirah, Dubai',
      callerInfo: 'Husband',
      dispatchCode: 'Alpha-2'
    },
    patientInfo: {
      age: 34,
      gender: 'female',
      weight: 60,
      occupation: 'Marketing manager',
      language: 'English'
    },
    sceneInfo: {
      description: 'Living room, patient pacing',
      hazards: [],
      bystanders: 'Husband and two children',
      environment: 'Normal apartment, slightly cluttered'
    },
    initialPresentation: {
      generalImpression: 'Young female, hyperventilating, distressed',
      position: 'Pacing, unable to sit still',
      appearance: 'Flushed, trembling, tearful',
      consciousness: 'Alert, anxious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent', 'Talking in short phrases'],
        interventions: ['Reassurance']
      },
      breathing: {
        rate: 30,
        rhythm: 'Irregular',
        depth: 'Deep',
        spo2: 99,
        findings: ['Tachypneic', 'Deep sighing respirations', 'No wheeze'],
        interventions: ['Coach breathing', 'Paper bag NOT recommended']
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Bounding',
        bp: { systolic: 130, diastolic: 85 },
        capillaryRefill: 1,
        skin: 'Warm, flushed',
        findings: ['Tachycardic'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Tingling in fingers', 'Carpal spasm'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['No injuries', 'No medical alert'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Carpal spasm bilaterally', 'No peripheral oedema'],
      posterior: ['Normal'],
      neurological: ['Anxious but oriented']
    },
    history: {
      medications: [
        { name: 'Sertraline', dose: '50mg', frequency: 'Daily', indication: 'Anxiety' },
        { name: 'Alprazolam', dose: '0.25mg', frequency: 'PRN', indication: 'Panic attacks' }
      ],
      allergies: ['None'],
      medicalConditions: ['Panic disorder', 'Generalized anxiety disorder'],
      surgicalHistory: [],
      lastMeal: 'Dinner 2 hours ago',
      eventsLeading: 'Argument with husband, sudden onset of chest tightness, fear of dying'
    },
    vitalSignsProgression: {
      initial: { bp: '130/85', pulse: 110, respiration: 30, spo2: 99, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Classic panic attack presentation', 'Carpal spasm from hypocapnia', 'Must rule out medical causes'],
      redFlags: ['First presentation needs medical exclusion', 'Atypical features need workup'],
      differentialDiagnoses: ['Panic attack', 'MI', 'Pulmonary embolism', 'Hyperthyroidism', 'Hypoglycemia'],
      mostLikelyDiagnosis: 'Panic Attack'
    },
    managementPathway: {
      immediate: [
        'Ensure scene safety and remove from stressors if possible',
        'Calm, reassuring communication — steady voice, slow breathing coaching',
        'Full vital signs including SpO2 and blood glucose',
        '12-lead ECG — mandatory for first presentation or atypical features to exclude cardiac cause',
        'Coach controlled breathing — 4 counts in, hold 2, 6 counts out',
        'Do NOT use paper bag — risk of dangerous hypoxia',
        'IV access and oxygen only if organic cause not excluded'
      ],
      definitive: [
        'Medical exclusion of organic causes (PE, ACS, pneumothorax) before accepting panic diagnosis',
        'Benzodiazepines are NOT first-line for panic attack prehospital (NICE CG113 / WHO mhGAP 2.0) — they mask symptoms, carry dependence risk, and blunt future CBT efficacy. If the patient already has prescribed PRN alprazolam / lorazepam they may self-administer under paramedic observation after full vital signs + ECG. Avoid paramedic-administered benzos. Continue breathing coaching and therapeutic communication. Complete structured suicide risk screen (Columbia-SSRS principles) — ideation, plan, means, intent, prior attempts, protective factors.',
        'Refer to GP or mental health services for ongoing anxiety management'
      ],
      monitoring: [
        'SpO2 continuous — should be normal in panic attack',
        'Respiratory rate — goal is reduction to <20/min',
        'Reassess ECG if any atypical features develop',
        'Monitor for carpo-pedal spasm resolution (indicates hypocapnia correcting)'
      ],
      transportConsiderations: [
        'Transport to ED for medical exclusion if first presentation, risk factors, or atypical features',
        'Patient may refuse transport if symptoms resolve — document refusal thoroughly',
        'Keep environment calm — reduce stimuli, ask bystanders to step back',
        'Rashid Hospital or American Hospital Dubai for first-time presentations with atypical features'
      ]
    },
    studentChecklist: [
      { id: 'p1-1', category: 'abcde', description: 'Rule out life-threatening causes first', points: 15, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'p1-2', category: 'abcde', description: 'Obtain 12-lead ECG', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'p1-3', category: 'intervention', description: 'Check vital signs including SpO2', points: 5, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'p1-4', category: 'intervention', description: 'Calm, reassuring approach', points: 10, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'p1-5', category: 'intervention', description: 'Coach controlled breathing', points: 10, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'p1-6', category: 'history', description: 'Assess for suicidal ideation', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Always rule out medical causes first',
      'ECG for first presentation or atypical features',
      'Rebreathing techniques can help',
      'Avoid paper bag (risk of hypoxia)'
    ],
    commonPitfalls: [
      'Dismissing symptoms as "just anxiety" without ruling out organic causes such as PE, MI, or pneumothorax',
      'Failing to check blood glucose - hypoglycaemia can mimic or trigger panic attacks',
      'Over-sedating with benzodiazepines before completing a thorough medical assessment',
      'Not performing an ECG to exclude cardiac causes, especially in first presentations or patients with risk factors',
      'Missing pulmonary embolism which can present with acute dyspnoea, tachycardia, and anxiety',
      'Anchoring on psychiatric diagnosis without systematic exclusion of life-threatening differentials'
    ],
    visualResources: {
      images: [],
      articles: [
        {
          id: 'art-panic-001',
          type: 'article',
          title: 'Panic Disorder - Diagnosis and Management',
          url: 'https://www.nice.org.uk/guidance/cg113',
          source: 'NICE',
          caption: 'UK national guideline on generalised anxiety disorder and panic disorder management',
          relevance: 'essential',
          tags: ['panic attack', 'anxiety', 'NICE', 'guidelines']
        },
        {
          id: 'art-hypervent-001',
          type: 'article',
          title: 'Hyperventilation Syndrome',
          url: 'https://wikem.org/wiki/Hyperventilation_syndrome',
          source: 'WikEM',
          caption: 'Emergency management of hyperventilation and respiratory alkalosis',
          relevance: 'essential',
          tags: ['hyperventilation', 'respiratory alkalosis', 'anxiety']
        },
        {
          id: 'art-panic-bmj',
          type: 'article',
          title: 'Panic Disorder - Clinical Overview',
          url: 'https://bestpractice.bmj.com/topics/en-gb/121',
          source: 'BMJ Best Practice',
          caption: 'Evidence-based approach to panic disorder assessment and management',
          relevance: 'important',
          tags: ['panic disorder', 'BMJ', 'assessment', 'management']
        }
      ],
      videos: [
        {
          id: 'vid-panic-001',
          type: 'video',
          title: 'Panic Attack Emergency Management',
          url: 'https://www.youtube.com/watch?v=Thj4EiFPyNA',
          source: 'Osmosis from Elsevier',
          caption: 'Approach to panic attacks in the emergency setting',
          duration: '8:45',
          relevance: 'essential',
          tags: ['panic attack', 'anxiety', 'EMS', 'management']
        },
        {
          id: 'vid-panic-osmosis',
          type: 'video',
          title: 'Panic Disorder: Pathophysiology and Treatment',
          url: 'https://www.youtube.com/watch?v=AKRr2PMl4zE',
          source: 'MedCram',
          caption: 'Understanding panic disorder pathophysiology and treatment approaches',
          duration: '10:30',
          relevance: 'important',
          tags: ['panic disorder', 'pathophysiology', 'treatment']
        }
      ]
    }
  }),

  // ==================== ELDERLY FALL CASES (3 cases) ====================
  createCase({
    id: 'fall-001',
    title: 'Elderly Fall with Hip Fracture',
    category: 'elderly-fall',
    // ROUTING NOTE: subcategory added so findProtocol() reaches the 'fall'
    // treatment protocol (moderate/NOF tier) — the case previously had no
    // subcategory and was unreachable by the treatment engine. Same pattern
    // as the trauma-004 → 'tamponade' fix.
    subcategory: 'fall',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
    dispatchInfo: {
      callReason: 'Mother fell in bathroom, cannot get up, leg looks wrong',
      timeOfDay: 'morning',
      location: 'Apartment in Sharjah',
      callerInfo: 'Daughter',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 78,
      gender: 'female',
      weight: 55,
      occupation: 'Retired',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Bathroom floor, wet surface',
      hazards: ['Wet floor', 'Narrow space'],
      bystanders: 'Daughter',
      environment: 'Small bathroom, rug bunched up',
      environmentVariant: 'home',
    },
    initialPresentation: {
      generalImpression: 'Elderly female, supine on bathroom floor, distressed',
      position: 'Supine, left leg externally rotated and shortened',
      appearance: 'Pale, in pain',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 95,
        findings: ['Mild tachypnea from pain'],
        interventions: ['Oxygen if needed']
      },
      circulation: {
        pulseRate: 95,
        pulseQuality: 'Regular',
        bp: { systolic: 140, diastolic: 85 },
        capillaryRefill: 2,
        skin: 'Pale, cool',
        findings: ['Hemodynamically stable'],
        interventions: ['IV access', 'Analgesia']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['No neuro deficits'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Left hip deformity', 'No skin breaks'],
        interventions: ['Keep warm', 'Cover with blanket']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Left hip tender', 'External rotation', 'Shortened leg'],
      extremities: ['Left leg shortened and externally rotated', 'Left hip tenderness on palpation', 'Distal pulses present', 'No neuro deficit', 'No peripheral oedema'],
      posterior: ['No bruising'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '5mg', frequency: 'Daily', indication: 'Hypertension' },
        { name: 'Alendronate', dose: '70mg', frequency: 'Weekly', indication: 'Osteoporosis' },
        { name: 'Paracetamol', dose: '1g', frequency: 'PRN', indication: 'Pain' }
      ],
      allergies: ['None'],
      medicalConditions: ['Osteoporosis', 'Hypertension', 'Previous fall 6 months ago'],
      surgicalHistory: ['Cataract surgery 2021'],
      lastMeal: 'Breakfast 1 hour ago',
      eventsLeading: 'Slipped on wet bathroom floor while getting out of shower'
    },
    vitalSignsProgression: {
      initial: { bp: '140/85', pulse: 95, respiration: 20, spo2: 95, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Classic hip fracture deformity', 'Osteoporosis risk', 'Fall risk factors present'],
      redFlags: ['#NOF fracture', 'Risk of pressure sores', 'DVT risk'],
      differentialDiagnoses: ['Neck of femur fracture', 'Intertrochanteric fracture', 'Hip dislocation'],
      mostLikelyDiagnosis: 'Neck of Femur Fracture'
    },
    managementPathway: {
      immediate: [
        'Scene safety and request additional resources if needed for extrication from bathroom',
        'Primary survey — check airway, breathing, circulation; assess for head injury from fall',
        'Do not move patient until injury assessed — logroll or spinal precautions if indicated',
        'Analgesia early — morphine 2-5mg IV titrated or consider fascia iliaca compartment block (FICB)',
        'IV access (18G)',
        'Immobilise fracture in position found — traction splint contraindicated for NOF fractures',
        'Full exposure and secondary survey — check for other injuries (wrist, ribs, head)',
        'Document anticoagulant use — warfarin/DOAC patients at elevated intracranial haemorrhage risk'
      ],
      definitive: [
        'Hip fracture repair within 36 hours (operative delay increases mortality significantly)',
        'Rashid Hospital or Mediclinic City Hospital for orthopaedic trauma',
        'Geriatric and falls assessment during admission',
        'Osteoporosis optimisation and falls prevention review'
      ],
      monitoring: [
        'Pain score every 5 minutes after analgesia — target VAS <4',
        'BP and pulse — haemorrhage into hip can be significant (up to 1L)',
        'Monitor neurovascular status of affected limb (pulses, sensation, warmth)',
        'SpO2 continuous'
      ],
      transportConsiderations: [
        'Gentle handling to minimise pain and prevent fat embolism',
        'Padded splinting for comfort during transport',
        'Pre-alert: "78-year-old female, NOF fracture, no anticoagulation, on amlodipine for hypertension — analgesia given"',
        'Transport to orthopaedic trauma-capable facility with geriatric services'
      ]
    },
    studentChecklist: [
      { id: 'f1-1', category: 'abcde', description: 'Assess for head injury', points: 10, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'f1-2', category: 'intervention', description: 'Analgesia (consider fascia iliaca block)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'f1-3', category: 'intervention', description: 'IV access', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'f1-4', category: 'intervention', description: 'Splint/immobilize leg', points: 10, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'f1-5', category: 'intervention', description: 'Gentle handling to prevent fat embolism', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'f1-6', category: 'history', description: 'Assess fall risk factors', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Hip fractures common in elderly falls',
      'Fascia iliaca block excellent analgesia',
      'Gentle handling prevents complications',
      'Assess for osteoporosis and fall prevention'
    ],
    commonPitfalls: [
      'Not asking about anticoagulant or antiplatelet use - patients on warfarin or DOACs are at high risk of intracranial haemorrhage even from minor head strikes',
      'Failing to assess for concomitant cervical spine injury, especially if mechanism or history of head injury is unclear',
      'Inadequate pain management in elderly patients due to fear of over-sedation - undertreated pain causes delirium and complications',
      'Not performing a thorough head injury assessment in patients on anticoagulants, where intracranial bleeding can be delayed',
      'Missing other injuries such as wrist fractures, rib fractures, or pelvic injuries sustained during the fall',
      'Not considering the cause of the fall - cardiac syncope, postural hypotension, medication side effects, or neurological causes'
    ],
    visualResources: {
      images: [
        {
          id: 'img-hip-001',
          type: 'image',
          title: 'Hip Fracture Deformity',
          url: 'https://radiopaedia.org/cases/hip-fracture',
          source: 'Radiopaedia',
          caption: 'Classic signs of hip fracture - external rotation and shortening',
          relevance: 'essential',
          tags: ['hip fracture', 'NOF', 'deformity', 'elderly']
        }
      ],
      articles: [
        {
          id: 'art-hip-001',
          type: 'article',
          title: 'Hip Fracture - Emergency Management',
          url: 'https://wikem.org/wiki/Hip_fracture',
          source: 'WikEM',
          caption: 'Quick reference for assessment and management of hip fractures',
          relevance: 'essential',
          tags: ['hip fracture', 'NOF', 'elderly', 'WikEM']
        },
        {
          id: 'art-falls-nice',
          type: 'article',
          title: 'NICE Guideline: Falls in Older People',
          url: 'https://www.nice.org.uk/guidance/cg161',
          source: 'NICE',
          caption: 'UK national guideline on assessment and prevention of falls in older people',
          relevance: 'essential',
          tags: ['falls', 'elderly', 'NICE', 'guidelines']
        },
        {
          id: 'art-hip-statpearls',
          type: 'article',
          title: 'Hip Fracture - Overview and Management',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK557514/',
          source: 'StatPearls',
          caption: 'Comprehensive review of hip fracture types, diagnosis and management',
          relevance: 'important',
          tags: ['hip fracture', 'StatPearls', 'management']
        }
      ],
      videos: [
        {
          id: 'vid-fascia-001',
          type: 'video',
          title: 'Fascia Iliaca Block for Hip Fracture',
          url: 'https://www.youtube.com/watch?v=h2SIN7Mn0YA',
          source: 'Brainbook',
          caption: 'Step-by-step fascia iliaca block procedure',
          duration: '12:30',
          relevance: 'important',
          tags: ['fascia iliaca', 'nerve block', 'hip fracture', 'analgesia']
        }
      ]
    }
  }),

  // ==================== POST-DISCHARGE CASES (2 cases) ====================
  createCase({
    id: 'postd-001',
    title: 'Post-Op Wound Infection',
    category: 'post-discharge',
    subcategory: 'post-surgical',
    priority: 'moderate',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    dispatchInfo: {
      callReason: 'Surgical wound red and draining pus, fever',
      timeOfDay: 'afternoon',
      location: 'House in Ajman',
      callerInfo: 'Patient',
      dispatchCode: 'Alpha-2'
    },
    patientInfo: {
      age: 52,
      gender: 'male',
      weight: 82,
      occupation: 'Driver',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Living room, patient on sofa',
      hazards: [],
      bystanders: 'Wife',
      environment: 'Normal home',
      sceneImagePath: '/scene-assets/postd-001-post-op-wound-infection-ajman.png',
      sceneImageCaption: 'Living room — home, middle-aged male on sofa'
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, uncomfortable, feverish',
      position: 'Semi-recumbent',
      appearance: 'Flushed, diaphoretic',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 97,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 105,
        pulseQuality: 'Bounding',
        bp: { systolic: 130, diastolic: 80 },
        capillaryRefill: 2,
        skin: 'Warm, flushed',
        findings: ['Tachycardic', 'Feverish'],
        interventions: ['IV access']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: [],
        interventions: []
      },
      exposure: {
        temperature: 38.5,
        findings: ['Abdominal surgical wound', 'Erythema around wound', 'Purulent drainage', 'Swelling'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Midline incision', 'Cellulitis 5cm around wound', 'Seropurulent drainage'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Amoxicillin-clavulanate', dose: '625mg', frequency: 'Three times daily', indication: 'Post-op prophylaxis' },
        { name: 'Paracetamol', dose: '1g', frequency: 'PRN', indication: 'Pain' },
        { name: 'Ibuprofen', dose: '400mg', frequency: 'PRN', indication: 'Pain' }
      ],
      allergies: ['None'],
      medicalConditions: ['Type 2 Diabetes', 'Obesity'],
      surgicalHistory: ['Laparoscopic cholecystectomy 5 days ago'],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Wound increasingly painful over 2 days, noticed drainage and fever today'
    },
    vitalSignsProgression: {
      initial: { bp: '130/80', pulse: 105, respiration: 20, spo2: 97, temperature: 38.5, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Surgical site infection', 'Post-discharge complication', 'Diabetes risk factor'],
      redFlags: ['Sepsis risk', 'Necrotizing fasciitis must be excluded'],
      differentialDiagnoses: ['Surgical site infection', 'Cellulitis', 'Abscess formation', 'Necrotizing fasciitis'],
      mostLikelyDiagnosis: 'Surgical Site Infection'
    },
    managementPathway: {
      immediate: [
        'Full sepsis screen — assess qSOFA (RR, BP, GCS): any ≥2 = sepsis, activate sepsis pathway',
        'Full vital signs including temperature — fever >38°C or hypothermia <36°C both indicate systemic response',
        'IV access (18G) — for antibiotics and fluids',
        'IV fluid bolus 500mL NS if signs of sepsis-induced hypotension (SBP <100)',
        'Blood glucose check — diabetes impairs wound healing and immune response; high BGL common',
        'Assess wound: erythema, warmth, swelling, discharge, wound dehiscence, crepitus (gas in tissues = necrotising fasciitis)',
        'Sterile dressing — cover wound to prevent further contamination',
        'Analgesia — Paracetamol 1g IV or Morphine for severe pain'
      ],
      definitive: [
        'IV broad-spectrum antibiotics within 1 hour if sepsis criteria met — Piperacillin/Tazobactam or Cefazolin per DCAS protocol',
        'Urgent surgical review — necrotising fasciitis requires emergency debridement within hours',
        'Hospital admission — Rashid Hospital or American Hospital Dubai surgical team',
        'Wound culture and blood cultures x2 before antibiotics if time permits',
        'Diabetic patients: insulin sliding scale for glucose management'
      ],
      monitoring: [
        'Vital signs every 5-10 minutes — watch for septic shock development',
        'Temperature trend — escalating fever = worsening infection',
        'Mental status — new confusion + infection = septic encephalopathy',
        'Wound appearance — rapidly expanding erythema, crepitus, necrosis = surgical emergency',
        'Urine output if catheterised — <0.5mL/kg/hr = poor perfusion'
      ],
      transportConsiderations: [
        'Pre-alert surgical team — "post-op day 5, wound infection with sepsis features, temperature 39.0°C"',
        'Maintain IV antibiotics during transport if initiated on scene',
        'Keep wound covered with sterile dressing',
        'Reassess vital signs every 5-10 minutes during transport',
        'Document time of antibiotic administration — Sepsis Six hour 1 target: antibiotics within 60 minutes'
      ]
    },
    studentChecklist: [
      { id: 'pd1-1', category: 'abcde', description: 'Assess for sepsis', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'pd1-2', category: 'intervention', description: 'IV access', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'pd1-3', category: 'intervention', description: 'Take wound swab if draining', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'pd1-4', category: 'intervention', description: 'Cover with sterile dressing', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'pd1-5', category: 'history', description: 'Check antibiotic compliance', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Post-discharge complications common',
      'Diabetes increases infection risk',
      'Check for sepsis signs',
      'Document wound appearance carefully'
    ],
    commonPitfalls: [
      'Not screening for sepsis using structured tools (NEWS2/qSOFA) - wound infections can rapidly progress to septic shock',
      'Failing to fully expose and inspect the surgical site - superficial assessment misses deep or tracking infections',
      'Missing early signs of necrotising fasciitis: pain out of proportion, crepitus, rapidly spreading erythema, or systemic toxicity',
      'Delaying antibiotic administration - in suspected sepsis, antibiotics should be given within one hour',
      'Not involving the surgical team early - post-operative wound complications often require surgical review or return to theatre',
      'Underestimating severity in immunocompromised or diabetic patients who may not mount a typical inflammatory response'
    ],
    visualResources: {
      images: [
        {
          id: 'img-ssi-001',
          type: 'image',
          title: 'Surgical Site Infection Classification',
          url: 'https://www.nice.org.uk/guidance/ng125',
          source: 'NICE',
          caption: 'CDC criteria for surgical site infection classification',
          relevance: 'essential',
          tags: ['surgical site infection', 'SSI', 'wound infection', 'post-op']
        }
      ],
      articles: [
        {
          id: 'art-ssi-001',
          type: 'article',
          title: 'Surgical Site Infection - Management',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK557433/',
          source: 'StatPearls',
          caption: 'Assessment and management of surgical site infections',
          relevance: 'essential',
          tags: ['surgical site infection', 'SSI', 'wound', 'post-operative']
        },
        {
          id: 'art-sepsis-001',
          type: 'article',
          title: 'Sepsis Recognition and Management',
          url: 'https://www.nice.org.uk/guidance/ng51',
          source: 'NICE',
          caption: 'UK national guideline on sepsis recognition, diagnosis and early management',
          relevance: 'essential',
          tags: ['sepsis', 'NICE', 'guidelines', 'qSOFA']
        },
        {
          id: 'art-sepsis-wikem',
          type: 'article',
          title: 'Sepsis - Emergency Management',
          url: 'https://wikem.org/wiki/Sepsis',
          source: 'WikEM',
          caption: 'Quick reference for sepsis recognition and emergency management',
          relevance: 'important',
          tags: ['sepsis', 'WikEM', 'emergency', 'management']
        }
      ],
      videos: [
        {
          id: 'vid-wound-001',
          type: 'video',
          title: 'Wound Assessment and Dressing',
          url: 'https://www.youtube.com/watch?v=gIHUJs2eTHA',
          source: 'Osmosis from Elsevier',
          caption: 'Proper wound assessment and sterile dressing technique',
          duration: '15:20',
          relevance: 'important',
          tags: ['wound care', 'dressing', 'sterile technique', 'assessment']
        }
      ]
    }
  }),

  // ==================== RULE-OUT CASES (2 cases) ====================
  createCase({
    id: 'ruleout-001',
    title: 'Chest Pain - Rule Out ACS',
    category: 'rule-out',
    subcategory: 'rule-out',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
    dispatchInfo: {
      callReason: 'Chest pain, worried it might be heart attack',
      timeOfDay: 'evening',
      location: 'Apartment in Dubai Marina',
      callerInfo: 'Patient',
      dispatchCode: 'Charlie-1'
    },
    patientInfo: {
      age: 38,
      gender: 'male',
      weight: 75,
      occupation: 'IT consultant',
      language: 'English'
    },
    sceneInfo: {
      description: 'Modern apartment, patient at desk',
      hazards: [],
      bystanders: 'None',
      environment: 'Well-lit, air-conditioned'
    },
    initialPresentation: {
      generalImpression: 'Young male, anxious, no acute distress',
      position: 'Sitting at desk',
      appearance: 'Well, no diaphoresis',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 16,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 99,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 85,
        pulseQuality: 'Regular',
        bp: { systolic: 125, diastolic: 75 },
        capillaryRefill: 2,
        skin: 'Warm, dry',
        findings: ['Normal'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: [],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['No abnormalities'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Tender chest wall', 'No reproducible pain on palpation'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Dinner 3 hours ago',
      eventsLeading: 'Sharp chest pain after working long hours at computer, worse with movement, patient anxious about family history of heart disease'
    },
    vitalSignsProgression: {
      initial: { bp: '125/75', pulse: 85, respiration: 16, spo2: 99, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Atypical chest pain', 'Low cardiovascular risk', 'Musculoskeletal features'],
      redFlags: ['Must still rule out ACS', 'Atypical MI can present this way'],
      differentialDiagnoses: ['Musculoskeletal chest pain', 'Anxiety', 'GERD', 'Atypical ACS', 'Pericarditis'],
      mostLikelyDiagnosis: 'Musculoskeletal Chest Pain'
    },
    managementPathway: {
      immediate: [
        'Full vital signs — BP, HR, RR, SpO2, BGL',
        '12-lead ECG immediately — mandatory for all chest pain regardless of age or presentation',
        'Detailed OPQRST pain history — onset, quality, radiation, severity, timing',
        'Cardiovascular risk factor assessment — family history, smoking, diabetes, hypertension',
        'Aspirin 300mg PO if not contraindicated — low threshold in first presentations',
        'IV access if ECG abnormal or high-risk features identified',
        'Serial 12-lead ECG at 15 minutes if initial ECG normal'
      ],
      definitive: [
        'Hospital evaluation for serial troponins (high-sensitivity at 0 and 3 hours)',
        'Risk stratification using HEART or TIMI score',
        'Musculoskeletal cause can only be confirmed after cardiac exclusion'
      ],
      monitoring: [
        'Continuous ECG monitoring if any ECG abnormality detected',
        'BP and SpO2 continuous',
        'Reassess pain score and clinical status every 5 minutes'
      ],
      transportConsiderations: [
        'Transport all chest pain patients to ED — do not rely on normal ECG alone to exclude ACS',
        'Pre-alert if ECG changes develop, increasing pain, or haemodynamic instability',
        'American Hospital Dubai or Dubai Hospital for chest pain assessment unit',
        'Patient education: never self-dismiss chest pain — always seek assessment'
      ]
    },
    studentChecklist: [
      { id: 'ro1-1', category: 'abcde', description: 'Complete vital signs', points: 5, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'ro1-2', category: 'abcde', description: '12-lead ECG', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'ro1-3', category: 'history', description: 'Detailed pain history (OPQRST)', points: 10, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'ro1-4', category: 'history', description: 'Cardiovascular risk assessment', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'ro1-5', category: 'intervention', description: 'Aspirin if not contraindicated', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'ro1-6', category: 'communication', description: 'Transport for troponins', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Never dismiss chest pain without ECG',
      'Atypical presentations common in women, diabetics, elderly',
      'Troponins needed to exclude MI',
      'Document thorough assessment'
    ],
    commonPitfalls: [
      'Premature reassurance from a single normal ECG - NSTEMI can present with a completely normal initial ECG',
      'Not performing serial 12-lead ECGs at 15-minute intervals to capture evolving ST changes',
      'Missing atypical ACS presentations in women, diabetics, and elderly patients who may present with dyspnoea, nausea, or fatigue rather than classic chest pain',
      'Anchoring on one diagnosis (e.g., GORD or musculoskeletal) and failing to systematically exclude ACS',
      'Not administering aspirin early due to uncertainty - aspirin should be given unless true allergy or active bleeding',
      'Failing to obtain a pre-hospital 12-lead ECG which delays cath lab activation for STEMI patients'
    ],
    visualResources: {
      images: [
        {
          id: 'img-acstogo-001',
          type: 'image',
          title: 'ACS Assessment Algorithm',
          url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/acute-coronary-syndromes',
          source: 'American Heart Association',
          caption: 'Systematic approach to chest pain assessment based on AHA guidelines',
          relevance: 'essential',
          tags: ['ACS', 'chest pain', 'algorithm', 'AHA']
        }
      ],
      articles: [
        {
          id: 'art-acs-001',
          type: 'article',
          title: 'Acute Coronary Syndrome - Emergency Management',
          url: 'https://wikem.org/wiki/Acute_coronary_syndrome',
          source: 'WikEM',
          caption: 'Quick reference for ACS assessment and emergency management',
          relevance: 'essential',
          tags: ['ACS', 'chest pain', 'MI', 'STEMI', 'NSTEMI']
        },
        {
          id: 'art-acs-nice',
          type: 'article',
          title: 'NICE Guideline: Acute Coronary Syndromes',
          url: 'https://www.nice.org.uk/guidance/ng185',
          source: 'NICE',
          caption: 'UK national guideline on ACS assessment and early management',
          relevance: 'important',
          tags: ['ACS', 'NICE', 'guidelines', 'chest-pain']
        },
        {
          id: 'art-acs-statpearls',
          type: 'article',
          title: 'Acute Coronary Syndrome - Overview',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK459157/',
          source: 'StatPearls',
          caption: 'Comprehensive review of ACS pathophysiology and management',
          relevance: 'important',
          tags: ['ACS', 'StatPearls', 'pathophysiology']
        }
      ],
      videos: [
        {
          id: 'vid-chestpain-001',
          type: 'video',
          title: 'Chest Pain Assessment in EMS',
          url: 'https://www.youtube.com/watch?v=uqNQvKxAiuo',
          source: 'Armando Hasudungan',
          caption: 'Differentiating cardiac from non-cardiac chest pain',
          duration: '14:30',
          relevance: 'essential',
          tags: ['chest pain', 'assessment', 'EMS', 'ACS']
        }
      ]
    }
  }),

  // ==================== GENERAL CASES (3 cases) ====================
  createCase({
    id: 'general-001',
    title: 'Syncope - First Episode',
    category: 'general',
    subcategory: 'first-episode-syncope',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
    dispatchInfo: {
      callReason: 'Employee fainted at work, now awake but confused',
      timeOfDay: 'morning',
      location: 'Office building in Business Bay, Dubai',
      callerInfo: 'Colleague',
      dispatchCode: 'Alpha-2'
    },
    patientInfo: {
      age: 29,
      gender: 'female',
      weight: 58,
      occupation: 'Architect',
      language: 'English'
    },
    sceneInfo: {
      description: 'Office floor, patient on chair',
      hazards: [],
      bystanders: 'Several colleagues',
      environment: 'Air-conditioned office',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/office-female-palpitations-syncope-dubai.png',
      sceneImageCaption: 'Scene — Air-conditioned office',
    },
    initialPresentation: {
      generalImpression: 'Young female, pale, recovering from syncope',
      position: 'Sitting with legs elevated',
      appearance: 'Pale, slightly diaphoretic',
      consciousness: 'Alert, oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 16,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 75,
        pulseQuality: 'Regular',
        bp: { systolic: 110, diastolic: 70 },
        capillaryRefill: 2,
        skin: 'Pale, warm',
        findings: ['Recovered'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: [],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['No injuries'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Oral contraceptive', dose: 'Combined', frequency: 'Daily', indication: 'Contraception' }
      ],
      allergies: ['None'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Skipped breakfast',
      eventsLeading: 'Standing in meeting for 30 minutes, felt lightheaded, then collapsed'
    },
    vitalSignsProgression: {
      initial: { bp: '110/70', pulse: 75, respiration: 16, spo2: 98, gcs: 15, bloodGlucose: 5.4 },
      afterIntervention: { bp: '120/75', pulse: 72, respiration: 14, spo2: 99, gcs: 15, bloodGlucose: 5.4 },
      deterioration: { bp: '90/60', pulse: 110, respiration: 20, spo2: 96, gcs: 13, bloodGlucose: 5.2 }
    },
    expectedFindings: {
      keyObservations: ['Vasovagal syncope likely', 'Orthostatic precipitant', 'No red flags', 'Recovering consciousness'],
      redFlags: ['Chest pain with syncope', 'Syncope during exertion', 'Family history of sudden death', 'Abnormal ECG', 'Persistent hypotension'],
      differentialDiagnoses: ['Vasovagal syncope', 'Orthostatic hypotension', 'Arrhythmia', 'PE', 'Hypoglycemia', 'Seizure'],
      mostLikelyDiagnosis: 'Vasovagal Syncope'
    },
    managementPathway: {
      immediate: ['Scene safety', 'Supine positioning with legs elevated', 'Assess for injuries from fall', 'Blood glucose check'],
      definitive: ['12-lead ECG (mandatory for all first-episode syncope)', 'Orthostatic vital signs (lying and standing BP/HR)', 'Detailed history including prodromal symptoms and witness account', 'Transport to ED for full cardiac workup and risk stratification'],
      monitoring: ['Continuous cardiac monitoring', 'Serial vital signs including orthostatic measurements', 'Neurological observations'],
      transportConsiderations: ['All first-episode syncope requires ED evaluation', 'Monitor for recurrence during transport', 'Document time of event and recovery time']
    },
    studentChecklist: [
      { id: 'g1-1', category: 'abcde', description: 'Assess for injury from fall (FAST assessment)', points: 15, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'g1-2', category: 'abcde', description: 'Perform neurological assessment (GCS, pupils, power)', points: 15, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'g1-3', category: 'intervention', description: 'Blood glucose check', points: 10, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'g1-4', category: 'intervention', description: 'Obtain 12-lead ECG', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'g1-5', category: 'history', description: 'Detailed history of prodrome and circumstances', points: 10, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'g1-6', category: 'intervention', description: 'Check orthostatic vital signs (lying and standing BP/HR)', points: 15, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'g1-7', category: 'intervention', description: 'Position patient supine with legs elevated', points: 5, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'g1-8', category: 'intervention', description: 'Administer oral fluids if conscious and no contraindications', points: 5, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'g1-9', category: 'abcde', description: 'Screen for red flags (cardiac symptoms, family history)', points: 10, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'g1-10', category: 'communication', description: 'Transport to hospital for evaluation (all first-time syncope)', points: 10, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'g1-11', category: 'documentation', description: 'Document detailed circumstances and witness accounts', points: 5, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Vasovagal syncope: Most common cause in young adults, often triggered by prolonged standing, heat, emotional stress',
      'First syncope episode always requires medical evaluation to rule out cardiac causes',
      'Red flags requiring urgent referral: Chest pain, palpitations, syncope during exertion, family history of sudden death, abnormal ECG',
      'Essential assessment: Head injury assessment (FAST), neurological exam, glucose, 12-lead ECG, orthostatic vitals',
      'All syncope patients need 12-lead ECG to rule out arrhythmias (QT prolongation, WPW, Brugada, Long QT)',
      'Orthostatic vital signs: Measure BP/HR lying and standing - drop >20mmHg systolic or >10mmHg diastolic suggests orthostatic hypotension',
      'Immediate management: Supine position with legs elevated, oral fluids if conscious, continuous monitoring',
      'Document prodromal symptoms (nausea, lightheadedness, sweating, visual changes) - suggests vasovagal cause',
      'Witness account crucial: Duration of LOC, movements during event, post-ictal confusion, tongue biting',
      'Differentiate syncope from seizure: Syncope - brief LOC, no post-ictal confusion, pale; Seizure - tonic-clonic movements, post-ictal confusion, tongue biting, incontinence',
      'Syncope in pregnancy: Consider PE, ectopic pregnancy, hypovolemia - higher risk',
      'Return to play/work: All syncope patients need medical clearance before returning to work/driving'
    ],
    commonPitfalls: [
      'Assuming vasovagal syncope without systematically ruling out dangerous cardiac causes (arrhythmia, structural heart disease, PE)',
      'Not performing a 12-lead ECG on all first-episode syncope patients to screen for long QT, Brugada, WPW, or heart block',
      'Failing to measure orthostatic vital signs - lying and standing BP/HR to detect orthostatic hypotension',
      'Discharging without adequate safety-netting advice including when to call back, driving restrictions, and follow-up plan',
      'Not obtaining a detailed witness account of the event - crucial for differentiating syncope from seizure',
      'Missing syncope during exertion which is a red flag for hypertrophic cardiomyopathy or aortic stenosis'
    ],
    visualResources: {
      images: [],
      articles: [
        {
          id: 'art-syncope-001',
          type: 'article',
          title: 'Syncope - Emergency Management',
          url: 'https://wikem.org/wiki/Syncope',
          source: 'WikEM',
          caption: 'Quick reference for syncope causes, assessment, and emergency management',
          relevance: 'essential',
          tags: ['syncope', 'assessment', 'WikEM', 'management']
        },
        {
          id: 'art-syncope-nice',
          type: 'article',
          title: 'NICE Guidelines - Transient Loss of Consciousness',
          url: 'https://www.nice.org.uk/guidance/cg109',
          source: 'NICE UK',
          caption: 'NICE clinical guidelines for assessment and referral of transient loss of consciousness',
          relevance: 'essential',
          tags: ['syncope', 'guidelines', 'NICE', 'TLOC']
        },
        {
          id: 'art-syncope-esc',
          type: 'article',
          title: 'ESC Guidelines on Cardiac Pacing and CRT',
          url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Syncope-Guidelines',
          source: 'European Society of Cardiology',
          caption: 'ESC guidelines for diagnosis and management of syncope',
          relevance: 'important',
          tags: ['syncope', 'ESC', 'guidelines', 'cardiac']
        }
      ],
      videos: [
        {
          id: 'vid-syncope-ems',
          type: 'video',
          title: 'Understanding Syncope and Near-Syncope for EMS Providers',
          url: 'https://www.youtube.com/watch?v=69-GmO4GmEY',
          source: 'Armando Hasudungan',
          caption: 'Common causes of syncope, warning signs, and EMS assessment strategies',
          duration: '18:30',
          relevance: 'essential',
          tags: ['syncope', 'EMS', 'assessment', 'vasovagal']
        },
        {
          id: 'vid-syncope-mchd',
          type: 'video',
          title: 'MCHD Paramedic Podcast - Syncope Episode',
          url: 'https://www.youtube.com/watch?v=bHWOBtfvFOY',
          source: 'Osmosis from Elsevier',
          caption: 'In-depth discussion of syncope management in EMS medicine',
          duration: '42:15',
          relevance: 'essential',
          tags: ['syncope', 'paramedic', 'EMS', 'management']
        },
        {
          id: 'vid-syncope-ecg',
          type: 'video',
          title: 'Seven Significant Syncope Searches on ECG',
          url: 'https://www.youtube.com/watch?v=6FLE6HWiImM',
          source: 'MedCram',
          caption: 'Critical ECG findings every paramedic must check in syncope patients',
          duration: '15:20',
          relevance: 'essential',
          tags: ['syncope', 'ECG', 'cardiac', 'emergency']
        }
      ],
      procedures: [
        {
          id: 'proc-orthostatic',
          type: 'video',
          title: 'Syncope: Why People Faint - Practical Field Management',
          url: 'https://www.youtube.com/watch?v=n0OHzSfmYII',
          source: 'Ninja Nerd',
          caption: 'Real-world assessment and management strategies for paramedics and ED staff',
          duration: '28:45',
          relevance: 'essential',
          tags: ['syncope', 'assessment', 'field-management', 'paramedic']
        }
      ]
    }
  }),

  // ==================== ENVIRONMENTAL CASES (2 cases) ====================
  createCase({
    id: 'env-001',
    title: 'Heat Exhaustion',
    category: 'environmental',
    subcategory: 'heat-exhaustion',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
    dispatchInfo: {
      callReason: 'Worker dizzy and nauseated at construction site',
      timeOfDay: 'afternoon',
      location: 'Construction site in Dubai',
      callerInfo: 'Supervisor',
      dispatchCode: 'Alpha-2'
    },
    patientInfo: {
      age: 35,
      gender: 'male',
      weight: 70,
      occupation: 'Construction worker',
      language: 'Hindi, Basic English'
    },
    sceneInfo: {
      description: 'Outdoor construction site, direct sun',
      hazards: ['Construction equipment', 'Heat'],
      bystanders: 'Coworkers',
      environment: 'Outdoor, 42°C, high humidity',
      environmentVariant: 'heat',
      sceneImagePath: '/scene-assets/env-002-heat-stroke-jebel-ali.png',
      sceneImageCaption: 'Construction site in summer heat — Dubai',
    },
    initialPresentation: {
      generalImpression: 'Young male, profuse sweating, weak',
      position: 'Sitting in shade',
      appearance: 'Pale, profuse sweating, fatigued',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 97,
        findings: ['Mild tachypnea'],
        interventions: ['Move to cool environment']
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Weak',
        bp: { systolic: 100, diastolic: 65 },
        capillaryRefill: 2,
        skin: 'Pale, profuse sweating',
        findings: ['Tachycardic', 'Mild hypotension'],
        interventions: ['IV access', 'Cool fluids']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Alert but mildly fatigued'],
        interventions: []
      },
      exposure: {
        temperature: 38.2,
        findings: ['Hot skin but sweating', 'No CNS dysfunction'],
        interventions: ['Active cooling']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Alert, mildly fatigued']
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Breakfast 6 hours ago, limited water intake',
      eventsLeading: 'Working outdoors since 6 AM, limited breaks, started feeling unwell after lunch'
    },
    vitalSignsProgression: {
      initial: { bp: '100/65', pulse: 110, respiration: 22, spo2: 97, temperature: 38.2, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Heat exhaustion', 'Volume depletion', 'Normal mental status'],
      redFlags: ['Can progress to heat stroke', 'Rhabdomyolysis risk'],
      differentialDiagnoses: ['Heat exhaustion', 'Heat stroke', 'Hypoglycemia', 'Viral illness'],
      mostLikelyDiagnosis: 'Heat Exhaustion'
    },
    managementPathway: {
      immediate: [
        'Remove from hot environment — move to shaded or air-conditioned area immediately',
        'Remove excess clothing to maximise surface cooling',
        'Active cooling — cool wet cloths to skin, fan, ice packs to axillae and groin',
        'Oral rehydration if conscious and tolerating — cool water or sports drink',
        'IV access — Normal Saline 0.9% 500mL over 30 minutes if unable to tolerate oral fluids',
        'Core temperature measurement — tympanic or axillary (rectal preferred if available)',
        'Check blood glucose',
        'Vital signs — assess for progression to heat stroke'
      ],
      definitive: [
        'Hospital evaluation if temperature >39°C, persistent symptoms, or altered mental status develops',
        'Labs: electrolytes, renal function, CK (rhabdomyolysis screening)',
        'Heat exhaustion with normal mental status can be managed on scene after cooling'
      ],
      monitoring: [
        'Temperature every 5 minutes — target reduction to <38°C',
        'Mental status continuously — any confusion = treat as heat stroke',
        'BP and pulse — tachycardia and mild hypotension expected, should improve with cooling',
        'SpO2 continuous'
      ],
      transportConsiderations: [
        'Transport if temperature does not fall within 30 minutes, mental status changes, or signs of heat stroke',
        'Maintain cool environment in ambulance — maximise AC',
        'Pre-alert for hospital if suspecting heat stroke: "Possible heat stroke, temp 38+°C, altered MS"',
        'Dubai Hospital or Rashid Hospital for heat emergencies in summer'
      ]
    },
    studentChecklist: [
      { id: 'e1-1', category: 'abcde', description: 'Move to cool/shaded area', points: 5, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'e1-2', category: 'intervention', description: 'Remove excess clothing', points: 5, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'e1-3', category: 'intervention', description: 'Active cooling measures', points: 10, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'e1-4', category: 'intervention', description: 'Oral/IV fluids', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'e1-5', category: 'abcde', description: 'Distinguish from heat stroke', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Heat exhaustion: sweating present, normal CNS',
      'Heat stroke: hot dry skin, altered mental status - EMERGENCY',
      'Early cooling prevents progression',
      'Hydration crucial in UAE climate'
    ],
    commonPitfalls: [
      'Not recognising progression from heat exhaustion to heat stroke - altered mental status, cessation of sweating, and core temp >40C are critical warning signs',
      'Inadequate cooling measures - passive cooling alone is insufficient; active cooling with ice packs to axillae, groin, and neck should be initiated early',
      'Not measuring core temperature (rectal or oesophageal) - axillary and tympanic readings are unreliable in heat illness',
      'Missing exercise-associated hyponatraemia from excessive hypotonic fluid intake, which can cause seizures and cerebral oedema',
      'Not monitoring for rhabdomyolysis - dark urine, muscle pain, and elevated CK require aggressive IV fluid resuscitation and renal monitoring',
      'Allowing the patient to return to work or activity too soon without adequate recovery, rehydration, and acclimatisation'
    ],
    visualResources: {
      images: [
        {
          id: 'img-heat-001',
          type: 'image',
          title: 'Heat Exhaustion vs Heat Stroke',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK537135/',
          source: 'StatPearls',
          caption: 'Clinical differences between heat exhaustion and heat stroke',
          relevance: 'essential',
          tags: ['heat exhaustion', 'heat stroke', 'hyperthermia', 'environmental']
        }
      ],
      articles: [
        {
          id: 'art-heat-001',
          type: 'article',
          title: 'Heat Stroke - Emergency Management',
          url: 'https://wikem.org/wiki/Heat_stroke',
          source: 'WikEM',
          caption: 'Quick reference for heat stroke recognition and emergency management',
          relevance: 'essential',
          tags: ['heat stroke', 'WikEM', 'emergency', 'cooling']
        },
        {
          id: 'art-heat-emcrit',
          type: 'article',
          title: 'Heat Stroke: Cooling Strategies and Resuscitation',
          url: 'https://emcrit.org/ibcc/heat-stroke/',
          source: 'EMCrit',
          caption: 'Evidence-based approach to heat stroke cooling and critical care management',
          relevance: 'essential',
          tags: ['heat stroke', 'EMCrit', 'cooling', 'critical-care']
        },
        {
          id: 'art-heat-statpearls',
          type: 'article',
          title: 'Heat Stroke - Pathophysiology and Treatment',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK537135/',
          source: 'StatPearls',
          caption: 'Comprehensive review of heat stroke pathophysiology, diagnosis and treatment',
          relevance: 'important',
          tags: ['heat stroke', 'StatPearls', 'pathophysiology']
        }
      ],
      videos: [
        {
          id: 'vid-heat-001',
          type: 'video',
          title: 'Heat Stroke Management in EMS',
          url: 'https://www.youtube.com/watch?v=jvGC_dQJUtE',
          source: 'MedCram',
          caption: 'Prehospital cooling techniques and management',
          duration: '10:15',
          relevance: 'essential',
          tags: ['heat stroke', 'cooling', 'EMS', 'hyperthermia']
        },
        {
          id: 'vid-heat-medcram',
          type: 'video',
          title: 'Heat Stroke: Pathophysiology and Emergency Treatment',
          url: 'https://www.youtube.com/watch?v=R6VdoV8dZRc',
          source: 'Osmosis from Elsevier',
          caption: 'Understanding heat stroke pathophysiology and evidence-based treatment',
          duration: '14:20',
          relevance: 'important',
          tags: ['heat stroke', 'pathophysiology', 'treatment', 'emergency']
        }
      ]
    }
  }),

  // ==================== OBSTETRIC CASES (5 cases) ====================
  createCase({
    id: 'obs-001',
    title: 'Pregnancy - Third Trimester Bleeding (Placenta Previa)',
    category: 'obstetric',
    subcategory: 'obstetric-haemorrhage',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Pregnant woman, heavy vaginal bleeding, 34 weeks pregnant',
      timeOfDay: 'morning',
      location: 'Apartment in Al Nahda, Dubai',
      callerInfo: 'Husband (concerned)',
      dispatchCode: 'Echo-3',
      additionalInfo: ['Patient lying on bed', 'Blood soaking through mattress']
    },
    patientInfo: {
      age: 28,
      gender: 'female',
      weight: 72,
      occupation: 'Teacher',
      language: 'Arabic, English',
      culturalConsiderations: ['Female-only provider preferred', 'Husband as translator acceptable', 'Prayer considerations']
    },
    sceneInfo: {
      description: 'Master bedroom, patient lying on left side on bed',
      hazards: [],
      bystanders: 'Husband present, mother-in-law in other room',
      environment: 'Air-conditioned apartment',
      accessIssues: ['Elevator access only'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Pregnant female, pale, anxious, gripping abdomen',
      position: 'Lying on left lateral side',
      appearance: 'Pale, diaphoretic, visible blood on bedding',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking in full sentences'],
        interventions: []
      },
      breathing: {
        rate: 24,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['Mild tachypnea due to anxiety/pain', 'Clear bilateral air entry'],
        interventions: ['High-flow oxygen 12L/min']
      },
      circulation: {
        pulseRate: 118,
        pulseQuality: 'Weak but palpable',
        bp: { systolic: 95, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Pale, cool peripheries',
        findings: ['Tachycardic', 'Mild hypotension', 'Signs of hypovolemia'],
        interventions: ['IV access x2 large bore', 'Normal saline bolus 500mL']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious but appropriate'],
        interventions: ['Reassure patient', 'Fetal heart rate assessment if equipment available']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Active vaginal bleeding - moderate', 'Abdomen soft, non-tender (painless bleeding — hallmark of previa)'],
        interventions: ['DO NOT perform vaginal examination', 'Place in left lateral position', 'Absorbent pads']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Uterus soft, non-tender, fundal height consistent with 34 weeks', 'No contractions felt (painless bleeding suggests previa, not abruption)'],
      pelvis: ['Avoid examination'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Prenatal vitamins', dose: 'Daily', frequency: 'Once daily', indication: 'Pregnancy support' },
        { name: 'Iron supplements', dose: 'Varies', frequency: 'Once daily', indication: 'Pregnancy anemia prevention' }
      ],
      allergies: ['Penicillin'],
      medicalConditions: ['Gestational diabetes (diet controlled)', 'Previous cesarean x2'],
      surgicalHistory: ['Cesarean sections x2', 'Appendectomy'],
      lastMeal: 'Light breakfast 3 hours ago',
      eventsLeading: 'Woke up to use bathroom, noticed blood soaking through pad. Called husband immediately. No pain contractions reported.'
    },
    vitalSignsProgression: {
      initial: { bp: '95/60', pulse: 118, respiration: 24, spo2: 96, temperature: 36.8, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Painless vaginal bleeding in 3rd trimester', 'Placenta previa likely', 'No contractions', 'Stable vital signs with mild tachycardia'],
      redFlags: ['Potential placental abruption if bleeding increases', 'Hemodynamic instability', 'Fetal distress risk'],
      differentialDiagnoses: ['Placenta previa', 'Placental abruption', 'Uterine rupture', 'Bloody show (labor)', 'Vasa previa'],
      mostLikelyDiagnosis: 'Placenta Previa'
    },
    managementPathway: {
      immediate: [
        'Place patient in left lateral position to prevent aortocaval compression',
        'High-flow oxygen 12-15 L/min via non-rebreather mask',
        'IV access x2 with large-bore catheters (14-16G)',
        'Fluid resuscitation: Normal Saline or Plasma-Lyte 500-1000ml bolus',
        'Monitor vital signs and fetal heart rate if equipment available',
        'NPO status - prepare for potential emergency surgery',
        'Reassure patient and family'
      ],
      definitive: [
        'Hospital admission for monitoring',
        'Ultrasound to confirm placenta previa location',
        'Blood type and crossmatch (prepare 2-4 units PRBCs)',
        'Corticosteroids if <34 weeks gestation for fetal lung maturity',
        'Emergency cesarean section if uncontrolled bleeding, fetal distress, or maternal hemodynamic instability',
        'Conservative management if preterm gestation (<37 weeks) with minimal bleeding and no fetal distress'
      ],
      monitoring: [
        'Continuous maternal vital signs (BP, HR, SpO2)',
        'Fetal heart rate monitoring (target 110-160 bpm)',
        'Vaginal bleeding amount (pad count)',
        'Uterine activity/contractions',
        'Fetal movements reported by mother',
        'Signs of hemodynamic compromise (pallor, tachycardia, hypotension)',
        'Laboratory: CBC, coagulation profile, type & crossmatch'
      ],
      transportConsiderations: [
        'Transport to hospital with obstetric and NICU capabilities (Level III)',
        'Do NOT transport to facility without obstetric services',
        'Left lateral tilt position throughout transport',
        'Continuous monitoring during transport',
        'Pre-alert receiving hospital with gestational age, amount of bleeding, vital signs and fetal status',
        'Prepare for emergency delivery en route if deterioration',
        'Rh-negative mothers: ensure Rhogam availability within 72 hours'
      ]
    },
    studentChecklist: [
      { id: 'obs1-1', category: 'abcde', description: 'Place patient in left lateral position', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true, rationale: 'Reduces pressure on vena cava, prevents supine hypotension' },
      { id: 'obs1-2', category: 'intervention', description: 'Assess vaginal bleeding - observe only, DO NOT examine', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true, rationale: 'Vaginal examination can worsen placenta previa or trigger hemorrhage' },
      { id: 'obs1-3', category: 'communication', description: 'Ask about pain, contractions, fetal movements', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'obs1-4', category: 'intervention', description: 'IV access with large-bore catheters (14-16G)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'obs1-5', category: 'intervention', description: 'Fluid resuscitation with Normal Saline or Plasma-Lyte', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'obs1-6', category: 'communication', description: 'Transport to obstetric hospital with NICU', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true, rationale: 'Placenta previa requires hospital with obstetric and neonatal intensive care' },
      { id: 'obs1-7', category: 'documentation', description: 'Document EDC (expected date of delivery)', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Painless vaginal bleeding in 3rd trimester = placenta previa until proven otherwise',
      'DO NOT perform vaginal examination - can cause massive hemorrhage',
      'Left lateral position prevents caval compression and improves placental perfusion',
      'Prepare for potential emergency delivery if en route',
      'UAE hospitals: Latifa, Al Wasl, Mediclinic City have NICU facilities'
    ],
    commonPitfalls: [
      'Performing vaginal examination - can trigger life-threatening hemorrhage in placenta previa',
      'Placing patient supine - causes aortocaval compression and worsens fetal perfusion',
      'Delaying transport to appropriate facility - time-critical for both mother and fetus',
      'Not asking about fetal movements - crucial indicator of fetal wellbeing',
      'Failing to establish large-bore IV access early - hemorrhage can escalate rapidly',
      'Not recognizing concealed hemorrhage - blood may be retained internally',
      'Inadequate fluid resuscitation - target SBP >90 mmHg and HR <120',
      'Transporting to facility without obstetric and NICU capabilities',
      'Not documenting EDC/gravida/parity accurately - affects risk stratification',
      'Ignoring cultural preferences for female providers when available',
      'Not preparing for emergency delivery en route if bleeding becomes catastrophic',
      'Forgetting to check Rh status - Rh-negative mothers need Rhogam within 72 hours'
    ],
    equipmentNeeded: [
      'Large-bore IV cannula (14-16G) x2 for rapid fluid/blood administration',
      '0.9% Normal Saline or Plasma-Lyte 1000ml bags (multiple)',
      'Blood administration set and filters',
      'O-negative blood (if available for emergency transfusion)',
      'High-flow oxygen (15L/min) with non-rebreather mask',
      'Pulse oximeter',
      'Cardiac monitor',
      'Blood pressure cuff (appropriate size)',
      'Fetal Doppler or stethoscope for fetal heart rate monitoring',
      'Absorbent pads and sanitary towels',
      'Sterile gloves',
      'Emergency delivery kit (forceps, scissors, cord clamps)',
      'Neonatal resuscitation equipment (bag-valve-mask, suction, warming)',
      'Temperature monitoring device',
      'Transport stretcher with left lateral tilt capability',
      'IV pressure bags for rapid fluid infusion'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Obstetric Emergency Protocol v4.0',
        'DCAS Antepartum Hemorrhage Management Guidelines',
        'RCOG Green-top Guideline No. 63: Antepartum Haemorrhage',
        'SMFM Consult Series #44: Management of Antepartum Hemorrhage',
        'ACOG Practice Bulletin: Antepartum Hemorrhage'
      ],
      receivingFacilities: [
        {
          name: 'Latifa Hospital',
          location: 'Oud Metha, Dubai',
          capabilities: ['Level III NICU', '24/7 Obstetric Surgery', 'Maternal-Fetal Medicine', 'Blood Bank', 'Neonatal Resuscitation Team'],
          contact: '04 219 3000',
          distance: '20 minutes from Al Nahda'
        },
        {
          name: 'Al Jalila Children\'s Specialty Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Level III NICU', 'Pediatric Emergency', 'Neonatal Intensive Care', '24/7 Pediatric Specialists'],
          contact: '04 203 1000',
          distance: '25 minutes from Al Nahda'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['NICU Level II', '24/7 Obstetrics', 'Emergency C-section', 'Neonatal Care'],
          contact: '04 435 9999',
          distance: '25 minutes from Al Nahda'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['Level II NICU', 'Obstetric Emergency Services', 'Neonatal Care', 'Blood Bank'],
          contact: '04 377 5500',
          distance: '15 minutes from Al Nahda'
        }
      ],
      localConsiderations: [
        'Cultural sensitivity paramount: Emirati and conservative Muslim families may strongly prefer female healthcare providers for obstetric cases',
        'Latifa Hospital is the primary government maternity hospital with the highest-level NICU - preferred for severe cases',
        'During Ramadan, pregnant women may delay seeking care - reassure them immediate attention is appropriate',
        'Family decision-making: husband or senior female relative typically makes medical decisions - communicate with them',
        'Privacy is crucial - ensure curtains/doors closed during assessment and transport',
        'Religious considerations: some families may request prayer time before transport if situation allows',
        'Documentation: note gravida, parity, EDC, Rh status, and any previous cesarean deliveries',
        'Many Emirati families have strong preferences for specific hospitals - accommodate if clinically appropriate',
        'Prepare for potential emergency delivery en route - have delivery kit and neonatal equipment ready'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-placenta-previa',
          type: 'image',
          title: 'Placenta Previa Anatomy',
          url: 'https://radiopaedia.org/cases/placenta-previa',
          source: 'Radiopaedia',
          caption: 'Diagram showing placenta covering the cervical os',
          relevance: 'essential',
          tags: ['placenta-previa', 'anatomy', 'obstetric', 'third-trimester']
        },
        {
          id: 'img-supine-hypotension',
          type: 'image',
          title: 'Supine Hypotensive Syndrome in Pregnancy',
          url: 'https://www.rcog.org.uk/guidance/browse-all-guidance/',
          source: 'Royal College of Obstetricians',
          caption: 'Illustration of aortocaval compression by gravid uterus',
          relevance: 'essential',
          tags: ['pregnancy', 'aortocaval-compression', 'supine-hypotension', 'positioning']
        }
      ],
      videos: [
        {
          id: 'vid-aph-management',
          type: 'video',
          title: 'Antepartum Hemorrhage Management in Emergency Care',
          url: 'https://www.youtube.com/watch?v=CRhGx8A7Dqg',
          source: 'Osmosis from Elsevier',
          duration: '18:45',
          relevance: 'essential',
          tags: ['antepartum-hemorrhage', 'placenta-previa', 'emergency', 'management']
        },
        {
          id: 'vid-obstetric-emergency',
          type: 'video',
          title: 'Prehospital Obstetric Emergencies',
          url: 'https://www.youtube.com/watch?v=pnGyENcL2j0',
          source: 'RegisteredNurseRN',
          duration: '22:30',
          relevance: 'essential',
          tags: ['obstetric-emergency', 'prehospital', 'hemorrhage', 'pregnancy']
        },
        {
          id: 'vid-left-lateral',
          type: 'video',
          title: 'Left Lateral Tilt in Pregnancy',
          url: 'https://www.youtube.com/watch?v=833v2Tm-Rr4',
          source: 'Wards Made Easy (WME)',
          duration: '8:15',
          relevance: 'important',
          tags: ['left-lateral-tilt', 'pregnancy', 'positioning', 'obstetric']
        }
      ],
      articles: [
        {
          id: 'art-aph-rcog',
          type: 'article',
          title: 'RCOG Green-top Guideline: Antepartum Haemorrhage',
          url: 'https://www.rcog.org.uk/guidance/browse-all-guidance/green-top-guidelines/antepartum-haemorrhage-green-top-guideline-no-63/',
          source: 'Royal College of Obstetricians',
          caption: 'Evidence-based guideline on antepartum hemorrhage management',
          relevance: 'essential',
          tags: ['antepartum-hemorrhage', 'guideline', 'RCOG', 'placenta-previa']
        },
        {
          id: 'art-obstetric-trauma',
          type: 'article',
          title: 'Prehospital Management of Obstetric Emergencies',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4662123/',
          source: 'Emergency Medicine Journal',
          caption: 'Comprehensive review of prehospital obstetric emergency management',
          relevance: 'essential',
          tags: ['obstetric-emergency', 'prehospital', 'management', 'hemorrhage']
        },
        {
          id: 'art-maternal-resuscitation',
          type: 'article',
          title: 'Maternal Cardiac Arrest and Perimortem Cesarean Section',
          url: 'https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2019/03/cardiac-arrest-in-pregnancy',
          source: 'ACOG',
          caption: 'ACOG guidelines for cardiac arrest in pregnancy and perimortem cesarean delivery',
          relevance: 'important',
          tags: ['maternal-resuscitation', 'cardiac-arrest', 'perimortem-cesarean', 'obstetric']
        }
      ]
    }
  }),

  createCase({
    id: 'ped-001',
    title: 'Pediatric - 3-Year-Old with Fever and Seizure',
    category: 'pediatric',
    subcategory: 'febrile-seizure',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Child having seizure, very hot, mother screaming',
      timeOfDay: 'afternoon',
      location: 'Villa in Meadows, Dubai',
      callerInfo: 'Mother (distressed)',
      dispatchCode: 'Delta-3',
      additionalInfo: ['Child has been sick for 2 days', 'Very hot weather']
    },
    patientInfo: {
      age: 3,
      gender: 'female',
      weight: 14,
      occupation: 'None',
      language: 'Arabic, English',
      culturalConsiderations: ['Mother very anxious', 'Family nearby during Ramadan']
    },
    sceneInfo: {
      description: 'Living room, child on carpet, grandmother trying to help',
      hazards: [],
      bystanders: 'Mother, grandmother, 2 siblings watching',
      environment: 'Air-conditioned but warm (AC set to 24°C)',
      environmentVariant: 'home',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Small child, post-ictal, hot to touch',
      position: 'Lying on left side (recovery position)',
      appearance: 'Flushed, hot skin, eyes closed, twitching',
      consciousness: 'Responding to pain, post-ictal'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but noisy breathing', 'Secretions present'],
        interventions: ['Suction secretions if needed', 'Recovery position']
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 94,
        findings: ['Tachypneic', 'Good air entry bilaterally'],
        interventions: ['High-flow oxygen 12L/min via non-rebreather with pediatric mask']
      },
      circulation: {
        pulseRate: 150,
        pulseQuality: 'Strong, bounding',
        bp: { systolic: 85, diastolic: 50 },
        capillaryRefill: 2,
        skin: 'Hot, flushed, dry',
        findings: ['Tachycardic from fever and post-ictal sympathetic surge', 'Brisk capillary refill (2s) and flushed peripheries — vasodilation from high fever, not shock', 'Mild dehydration signs on mucous membranes'],
        interventions: ['IV access if possible (challenge in distressed child — consider IO if shocked)', 'Fluid bolus 20 mL/kg only if true signs of shock develop (poor perfusion, prolonged cap refill, mottling)']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 2, verbal: 3, motor: 5, total: 10 },
        pupils: 'Equal but sluggish',
        bloodGlucose: 5.8,
        findings: ['Post-ictal state', 'Lethargic', 'Glucose measured — confirmed not hypoglycaemic mimic'],
        interventions: ['Monitor GCS', 'Protect from injury during seizure activity', 'Measure glucose to exclude hypoglycaemia as cause of seizure']
      },
      exposure: {
        temperature: 40.2,
        findings: ['Very hot skin', 'No rash noted', 'No signs of trauma'],
        interventions: ['Start cooling measures immediately', 'Remove excess clothing', 'Tepid sponging']
      }
    },
    secondarySurvey: {
      head: ['No trauma', 'Fontanelle closed (normal for age)'],
      neck: ['Normal'],
      chest: ['Clear bilateral', 'No retractions'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: ['Normal', 'No peripheral oedema'],
      posterior: ['Normal'],
      neurological: ['Post-ictal, improving']
    },
    history: {
      medications: [
        { name: 'Paracetamol', dose: 'Syrup 4 hours ago', frequency: 'PRN', indication: 'Fever' }
      ],
      allergies: ['None known'],
      medicalConditions: ['No significant past history', 'Up to date on vaccinations'],
      surgicalHistory: ['None'],
      lastMeal: 'Lunch 2 hours ago (rice and chicken)',
      eventsLeading: 'Fever started 2 days ago, mother gave paracetamol. Today became very lethargic then had seizure lasting ~3 minutes. Outside playing in heat.'
    },
    vitalSignsProgression: {
      initial: { bp: '85/50', pulse: 150, respiration: 28, spo2: 94, temperature: 40.2, gcs: 10, bloodGlucose: 5.8 },
      afterIntervention: { bp: '80/48', pulse: 135, respiration: 20, spo2: 99, temperature: 39.1, gcs: 12 }
    },
    expectedFindings: {
      keyObservations: ['High fever (40.2°C)', 'Seizure (likely febrile)', 'Signs of dehydration', 'Hot environment', 'Recent febrile illness'],
      redFlags: ['Meningitis must be ruled out', 'Heat stroke vs heat exhaustion', 'Status epilepticus if seizure recurs'],
      differentialDiagnoses: ['Febrile seizure', 'Meningitis/encephalitis', 'Heat stroke', 'Urinary tract infection', 'Pneumonia'],
      mostLikelyDiagnosis: 'Febrile Seizure secondary to viral illness'
    },
    managementPathway: {
      immediate: [
        'Airway management — place in lateral (recovery) position if post-ictal; do NOT insert objects in mouth',
        'Do NOT restrain during seizure — protect from environmental hazards only',
        'Time the seizure — if >5 minutes, administer midazolam',
        'Temperature check immediately — rectal or axillary; 40.2°C is dangerously high',
        'Active cooling — remove clothing; tepid sponge with lukewarm water (NOT ice); fan; cool environment',
        'Oxygen via face mask or blow-by if SpO2 <94% or cyanosis',
        'Blood glucose check — exclude hypoglycaemia as contributing factor',
        'If seizure >5 minutes: Midazolam 0.2mg/kg intranasal (max 10mg) or 0.1mg/kg IM',
        'Paracetamol 15mg/kg orally or rectally — antipyresis; does NOT prevent seizure recurrence'
      ],
      definitive: [
        'All children with first febrile seizure require ED evaluation — meningitis must be excluded',
        'Latifa Hospital Dubai or Al Wasl Hospital Paediatric ED',
        'Lumbar puncture if <18 months, prolonged seizure, focal features, or meningism signs',
        'Investigations: FBC, CRP, blood culture, urine culture, electrolytes',
        'Parental education: seizure first aid, when to call 998 (ambulance), prognosis'
      ],
      monitoring: [
        'Temperature every 5-10 minutes — cooling effectiveness',
        'SpO2 continuous — post-ictal apnoea is rare but possible',
        'GCS/AVPU — child should recover towards baseline within 10-20 minutes post-ictally',
        'Watch for second seizure — 30% recurrence risk within 24 hours',
        'Watch for signs of meningitis: worsening headache, photophobia, bulging fontanelle, non-blanching rash'
      ],
      transportConsiderations: [
        'Pre-alert paediatric ED — "3-year-old, febrile seizure, temperature 40.2°C, post-ictal, parents present"',
        'Transport lateral to maintain airway patency',
        'Continue cooling during transport — fan and remove blankets; do not over-cool',
        'Paediatric BVM and correct mask size at hand throughout',
        'Have weight-based midazolam dose ready in case of second seizure'
      ]
    },
    studentChecklist: [
      { id: 'ped1-1', category: 'abcde', description: 'Check temperature immediately', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'ped1-2', category: 'abcde', description: 'Maintain airway during seizure (recovery position)', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'ped1-3', category: 'intervention', description: 'Administer oxygen if SpO2 < 94%', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'ped1-4', category: 'intervention', description: 'Start active cooling measures', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'ped1-5', category: 'intervention', description: 'Calculate fluid deficit and consider IV fluids', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'ped1-6', category: 'communication', description: 'Ask about vaccination history', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'ped1-7', category: 'communication', description: 'Assess for signs of meningitis (bulging fontanelle, neck stiffness, photophobia)', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true, rationale: 'Missed meningitis is life-threatening' }
    ],
    teachingPoints: [
      'Febrile seizures are common in children 6 months to 5 years',
      'Most febrile seizures are brief (<5 minutes) and self-limiting',
      'Red flags: prolonged seizure (>15 min), focal features, multiple seizures, signs of increased intracranial pressure',
      'Cooling: remove clothing, tepid sponge (NOT ice water), fan',
      'Pediatric dose: Midazolam 0.2mg/kg IN or 0.1mg/kg IM for seizures'
    ],
    commonPitfalls: [
      'Over-aggressive cooling can cause shivering which increases temperature',
      'Not checking blood glucose (hypoglycemia can mimic febrile illness)',
      'Missing signs of meningitis',
      'Forgetting to ask about vaccination history (Hib, pneumococcal)',
      'Attempting to restrain the child during seizure - can cause injury',
      'Placing objects in the child\'s mouth during seizure - aspiration risk',
      'Not timing the seizure accurately - status epilepticus defined as >5 minutes',
      'Failing to differentiate febrile seizure from epilepsy or other causes',
      'Not preparing for airway compromise if seizure is prolonged',
      'Forgetting to assess for dehydration and provide fluid resuscitation if needed',
      'Not obtaining weight-based dosing for medications before administration',
      'Separating child from parents unnecessarily - increases anxiety',
      'Missing subtle signs of meningitis (bulging fontanelle, neck stiffness, photophobia)',
      'Not considering heat stroke in hot UAE climate as alternative diagnosis'
    ],
    equipmentNeeded: [
      'Pediatric blood pressure cuff (appropriate size for age)',
      'Pediatric stethoscope',
      'Pediatric pulse oximeter probe',
      'Digital thermometer (tympanic or temporal preferred)',
      'Blood glucose meter',
      'Pediatric oxygen masks and nasal cannulas',
      'Pediatric bag-valve-mask (appropriate size)',
      'Pediatric oropharyngeal airways (various sizes)',
      'Pediatric suction catheter (Yankauer and flexible catheters)',
      'Midazolam 5mg/ml (buccal/intranasal/IM for prolonged seizures)',
      'IV cannulation kit (pediatric sizes 24G-22G)',
      'Normal saline 0.9% 250ml bags',
      'Cooling supplies (tepid water, washcloths, fan)',
      'Paracetamol suspension (antipyretic)',
      'Emergency airway equipment (pediatric LMA, ET tubes)',
      'Cardiac monitor with pediatric electrodes',
      'Pediatric emergency drug dosing reference (Broselow tape or app)',
      'Toys/distraction items for post-ictal comfort',
      'Weight scale or length-based resuscitation tape'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Pediatric Seizure Protocol v3.5',
        'DCAS Febrile Seizure Management Guidelines',
        'NICE Guideline CG137: Epilepsies in Children',
        'AAP Clinical Practice Guideline: Febrile Seizures',
        'International League Against Epilepsy Guidelines'
      ],
      receivingFacilities: [
        {
          name: 'Al Jalila Children\'s Specialty Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Level III Pediatric ICU', '24/7 Pediatric Neurology', 'Pediatric Emergency', 'EEG Services', 'Child Life Specialists'],
          contact: '04 203 1000',
          distance: '25 minutes from Meadows'
        },
        {
          name: 'Latifa Hospital',
          location: 'Oud Metha, Dubai',
          capabilities: ['Pediatric Emergency', 'Pediatric Ward', 'Pediatric Specialists', 'Neonatal ICU'],
          contact: '04 219 3000',
          distance: '20 minutes from Meadows'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Pediatric Emergency', 'Pediatric ICU', 'Pediatric Specialists'],
          contact: '04 435 9999',
          distance: '25 minutes from Meadows'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['Pediatric Emergency', 'Pediatric Specialists', 'Child-friendly Facilities'],
          contact: '04 377 5500',
          distance: '20 minutes from Meadows'
        }
      ],
      localConsiderations: [
        'Al Jalila Children\'s Hospital is Dubai\'s dedicated pediatric facility - preferred for complex pediatric cases',
        'Latifa Hospital is the government maternity and pediatric hospital - excellent for pediatric emergencies',
        'High temperatures in UAE (40-50°C in summer) increase risk of heat-related illness - differentiate from febrile seizure',
        'Cultural considerations: families may be very anxious - provide calm reassurance and clear explanations',
        'Many expatriate families from South Asia - vaccination schedules may differ from UAE schedule',
        'Emirati families often prefer same-gender providers when possible for cultural reasons',
        'During Ramadan, children are exempt from fasting - no dietary restrictions to consider',
        'Nannies or housekeepers may be primary caregivers - ensure clear communication with parents',
        'Document vaccination history carefully - Hib and pneumococcal vaccines prevent common causes of meningitis',
        'Language barriers may exist - use simple terms and consider translation apps for non-English speakers'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-febrile-seizure',
          type: 'image',
          title: 'Febrile Seizure Types and Presentation',
          url: 'https://radiopaedia.org/cases/febrile-seizure',
          source: 'Radiopaedia',
          caption: 'Clinical presentation and types of febrile seizures',
          relevance: 'essential',
          tags: ['febrile-seizure', 'pediatric', 'presentation', 'types']
        },
        {
          id: 'img-meningitis-signs',
          type: 'image',
          title: 'Meningitis Signs in Children',
          url: 'https://www.meningitisnow.org/meningitis-explained/symptoms/',
          source: 'Meningitis Now',
          caption: 'Clinical signs of meningitis in pediatric patients',
          relevance: 'essential',
          tags: ['meningitis', 'pediatric', 'clinical-signs', 'red-flags']
        }
      ],
      videos: [
        {
          id: 'vid-febrile-seizure',
          type: 'video',
          title: 'Febrile Seizures: Recognition and Management',
          url: 'https://www.youtube.com/watch?v=LDvPlEi2DwE',
          source: 'Osmosis from Elsevier',
          duration: '14:30',
          relevance: 'essential',
          tags: ['febrile-seizure', 'pediatric', 'recognition', 'management']
        },
        {
          id: 'vid-pediatric-seizure',
          type: 'video',
          title: 'Pediatric Seizure Management in Emergency Care',
          url: 'https://www.youtube.com/watch?v=woTdJmpY0F8',
          source: 'MedCram',
          duration: '18:20',
          relevance: 'essential',
          tags: ['pediatric', 'seizure', 'emergency', 'management']
        },
        {
          id: 'vid-meningitis-peds',
          type: 'video',
          title: 'Pediatric Meningitis: Early Recognition',
          url: 'https://www.youtube.com/watch?v=DuIX25F1VF8',
          source: 'Ninja Nerd',
          duration: '12:15',
          relevance: 'essential',
          tags: ['meningitis', 'pediatric', 'recognition', 'red-flags']
        }
      ],
      articles: [
        {
          id: 'art-febrile-seizure-aap',
          type: 'article',
          title: 'Febrile Seizures: AAP Clinical Practice Guideline',
          url: 'https://pediatrics.aappublications.org/content/127/3/489',
          source: 'American Academy of Pediatrics',
          caption: 'Comprehensive guideline on febrile seizure management',
          relevance: 'essential',
          tags: ['febrile-seizure', 'AAP', 'guideline', 'pediatric']
        },
        {
          id: 'art-seizure-management',
          type: 'article',
          title: 'Prehospital Management of Pediatric Seizures',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4662123/',
          source: 'Prehospital Emergency Care',
          caption: 'Evidence-based approach to pediatric seizure management',
          relevance: 'essential',
          tags: ['seizure', 'pediatric', 'prehospital', 'management']
        },
        {
          id: 'art-status-epilepticus',
          type: 'article',
          title: 'Status Epilepticus in Children: Management Algorithm',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4392193/',
          source: 'International League Against Epilepsy',
          caption: 'Step-by-step management of pediatric status epilepticus',
          relevance: 'important',
          tags: ['status-epilepticus', 'pediatric', 'algorithm', 'management']
        }
      ]
    }
  }),

  createCase({
    id: 'psych-002',
    title: 'Psychiatric - Acute Psychosis with Aggression',
    category: 'psychiatric',
    subcategory: 'psychosis',
    priority: 'moderate',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 35,
    dispatchInfo: {
      callReason: 'Son behaving erratically, breaking things, threatening family',
      timeOfDay: 'evening',
      location: 'Apartment in Deira, Dubai',
      callerInfo: 'Father (stressed)',
      dispatchCode: 'Charlie-2',
      additionalInfo: ['Patient is 24 years old', 'History of stopping medication', 'Family unable to approach him']
    },
    patientInfo: {
      age: 24,
      gender: 'male',
      weight: 78,
      occupation: 'Unemployed',
      language: 'Arabic, English',
      culturalConsiderations: ['Family concerned about stigma', 'Religious beliefs about mental health', 'Extended family living nearby']
    },
    sceneInfo: {
      description: 'Apartment living room with broken furniture, male patient pacing and shouting',
      hazards: ['Broken glass', 'Potential weapons in room'],
      bystanders: 'Father, mother, younger sister (frightened)',
      environment: 'Crowded apartment',
      accessIssues: ['Family needs to exit room safely'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Young adult male, agitated, shouting incoherently',
      position: 'Pacing room, clenched fists',
      appearance: 'Disheveled, sweaty, eyes wide',
      consciousness: 'Alert but confused, paranoid'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but shouting', 'Talking rapidly'],
        interventions: ['Maintain safe distance', 'Verbal de-escalation']
      },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Deep and rapid',
        spo2: 98,
        findings: ['Anxiety-related tachypnea'],
        interventions: ['Calm reassurance', 'No intervention needed']
      },
      circulation: {
        pulseRate: 125,
        pulseQuality: 'Strong',
        bp: { systolic: 145, diastolic: 95 },
        capillaryRefill: 2,
        skin: 'Flushed, sweaty',
        findings: ['Tachycardic due to agitation', 'Hypertensive'],
        interventions: ['Monitor for deterioration']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Dilated but reactive',
        bloodGlucose: 5.4,
        findings: ['Disorganized thoughts', 'Paranoid ideation', 'Poor insight'],
        interventions: ['Do not argue with delusions', 'Ensure scene safety']
      },
      exposure: {
        temperature: 36.8,
        findings: ['No obvious trauma', 'No signs of drug use (fresh needle marks)'],
        interventions: ['Check for medical alert bracelet', 'Look for medication bottles']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['No trauma'],
      chest: ['No trauma'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: ['No trauma', 'No needle marks', 'No peripheral oedema'],
      posterior: ['Normal'],
      neurological: ['Agitated', 'Paranoid']
    },
    history: {
      medications: [
        { name: 'Antipsychotic medication', dose: 'Unknown', frequency: 'Stopped 2 weeks ago', indication: 'Bipolar disorder' }
      ],
      allergies: ['No known allergies'],
      medicalConditions: ['Diagnosed with bipolar disorder 2 years ago', 'Previous hospitalization 1 year ago'],
      surgicalHistory: ['None'],
      lastMeal: 'Unknown',
      eventsLeading: 'Parents report patient stopped taking his medication about 2 weeks ago. Started becoming more withdrawn, then yesterday began talking about "people watching him" and became aggressive this evening.'
    },
    vitalSignsProgression: {
      initial: { bp: '145/95', pulse: 125, respiration: 22, spo2: 98, gcs: 14, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Acute psychotic episode', 'Paranoid delusions', 'Medication non-adherence', 'Agitated but not violent at present', 'No medical cause apparent'],
      redFlags: ['Risk of violence escalation', 'Potential for self-harm', 'Could be drug-induced psychosis', 'Could be medical emergency (head trauma, infection)'],
      differentialDiagnoses: ['Acute psychosis (bipolar/schizophrenia)', 'Drug-induced psychosis', 'Delirium from medical cause', 'Alcohol withdrawal'],
      mostLikelyDiagnosis: 'Acute Psychotic Episode - Bipolar Disorder'
    },
    managementPathway: {
      immediate: [
        'Scene safety assessment BEFORE entry — identify exit routes, remove breakable objects if possible, request police backup if violence risk',
        'Verbal de-escalation — calm voice, respectful tone, stand at an angle (not face-on), do not crowd patient; allow time — most escalation resolves with skilled communication',
        'Maintain safe distance — remain beyond arm\'s reach until patient is calmer',
        'Organic screen: blood glucose, SpO2, temperature, GCS — "behavioural change is organic until proven otherwise". Hyperthermia + diaphoresis + superhuman strength + bizarre speech + sudden tranquillity = Acute Behavioural Disturbance (ABD): medical emergency with risk of sudden cardiac death — continuous cardiac + temperature monitoring, NEVER prone restraint (positional asphyxia).',
        'Structured suicide risk screen (Columbia-SSRS principles): document ideation, plan, means, intent, prior attempts, protective factors — all six domains.',
        'Capacity assessment per UAE Federal Law 10/2023 (Mental Health Law) — 4-part test: can the patient understand, retain, weigh, and communicate the decision? Document. Least-restrictive principle.',
        'Gather collateral history from family — medication history, previous episodes, recent drug/alcohol use',
        'Chemical sedation only after verbal de-escalation fails AND organic causes excluded. Per NICE NG10: (1) IM lorazepam 1-2mg first-line if benzo-naive, (2) IM olanzapine 10mg, OR (3) IM haloperidol 5mg + PROMETHAZINE 25-50mg (never haloperidol alone — QT prolongation + EPSE risk; obtain 12-lead ECG before if possible). Avoid benzos in elderly delirium (paradoxical agitation).',
        'If physical restraint required: supine/lateral ONLY (never prone — positional asphyxia), max 10 minutes, continuous cardiorespiratory + temperature monitoring, debrief afterwards per NICE NG10.',
        'Document baseline GCS before any sedation'
      ],
      definitive: [
        'Transfer to Al Amal Hospital (Dubai psychiatric facility) or Rashid Hospital emergency psychiatric unit',
        'Mental health team assessment and involuntary admission if risk to self or others',
        'Antipsychotic optimisation and compliance support'
      ],
      monitoring: [
        'GCS continuously after sedation — risk of respiratory depression',
        'SpO2 after any chemical restraint',
        'Behavioural response to de-escalation — document what worked',
        'Physical observation every 5 minutes minimum throughout care'
      ],
      transportConsiderations: [
        'Police escort may be required if patient is violent or refuses transport',
        'Keep patient calm — avoid sirens if possible, dim lights, minimal stimulation',
        'Pre-alert: "Acute psychosis, verbal de-escalation, chemical restraint given — needs psychiatric assessment"',
        'Al Amal Hospital Dubai (specialised psychiatric) or Rashid Hospital'
      ]
    },
    studentChecklist: [
      { id: 'psych2-1', category: 'safety', description: 'Scene safety assessment before approaching', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'psych2-2', category: 'communication', description: 'Use verbal de-escalation techniques', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'psych2-3', category: 'communication', description: 'Show empathy without agreeing with delusions', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'psych2-4', category: 'abcde', description: 'Rule out medical causes (head trauma, hypoglycemia, infection)', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'psych2-5', category: 'communication', description: 'Gather collateral history from family', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'psych2-6', category: 'communication', description: 'Transport to psychiatric emergency facility', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Scene safety is paramount - never enter an unsafe scene',
      'Verbal de-escalation: calm voice, respectful, stand at angle, don\'t crowd',
      'Medical causes must be ruled out (head injury, hypoglycemia, drugs, infection)',
      'UAE psychiatric emergency facilities: Al Amal Hospital, Rashid Hospital (Dubai)',
      'If patient becomes violent: retreat, call police, maintain observation'
    ],
    commonPitfalls: [
      'Entering scene without safety assessment',
      'Agreeing with delusions or arguing with them',
      'Missing medical causes (especially hypoglycemia, head trauma)',
      'Using physical restraint unnecessarily (can escalate)',
      'Not gathering collateral history from family'
    ],
    visualResources: {
      images: [],
      articles: [
        {
          id: 'art-psych-crisis',
          type: 'article',
          title: 'Acute Behavioural Disturbance - Emergency Management',
          url: 'https://wikem.org/wiki/Acute_psychosis',
          source: 'WikEM',
          caption: 'Quick reference for acute psychosis and behavioural disturbance management',
          relevance: 'essential',
          tags: ['psychiatric', 'crisis', 'WikEM', 'psychosis']
        },
        {
          id: 'art-psych-nice',
          type: 'article',
          title: 'NICE Guideline: Violence and Aggression - Short-Term Management',
          url: 'https://www.nice.org.uk/guidance/ng10',
          source: 'NICE',
          caption: 'UK national guideline on managing violence, aggression and acute behavioural disturbance',
          relevance: 'essential',
          tags: ['psychiatric', 'NICE', 'violence', 'guidelines']
        },
        {
          id: 'art-psych-bmj',
          type: 'article',
          title: 'Acute Psychosis - Clinical Assessment',
          url: 'https://bestpractice.bmj.com/topics/en-gb/282',
          source: 'BMJ Best Practice',
          caption: 'Evidence-based approach to acute psychosis assessment and management',
          relevance: 'important',
          tags: ['psychosis', 'BMJ', 'assessment', 'management']
        }
      ],
      videos: [
        {
          id: 'vid-psych-safety',
          type: 'video',
          title: 'Psychiatric Emergency Scene Safety',
          url: 'https://www.youtube.com/watch?v=sKxBQNABVws',
          source: 'Ninja Nerd',
          caption: 'Scene safety and de-escalation in psychiatric emergencies',
          duration: '14:30',
          relevance: 'essential',
          tags: ['psychiatric', 'safety', 'de-escalation', 'EMS']
        },
        {
          id: 'vid-psych-osmosis',
          type: 'video',
          title: 'Psychosis: Signs, Symptoms and Treatment',
          url: 'https://www.youtube.com/watch?v=bgczmh4Rc6o',
          source: 'Osmosis from Elsevier',
          caption: 'Understanding acute psychosis pathophysiology and treatment approaches',
          duration: '11:45',
          relevance: 'important',
          tags: ['psychosis', 'pathophysiology', 'treatment', 'psychiatric']
        }
      ]
    }
  }),

  createCase({
    id: 'tox-001',
    title: 'Toxicology - Organophosphate Poisoning',
    category: 'toxicology',
    subcategory: 'organophosphate',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 40,
    dispatchInfo: {
      callReason: 'Worker collapsed after spraying pesticides, difficult breathing, vomiting',
      timeOfDay: 'morning',
      location: 'Farm in Al Awir, Dubai',
      callerInfo: 'Farm supervisor',
      dispatchCode: 'Echo-3',
      additionalInfo: ['Multiple workers affected', 'Unknown chemical spilled', 'No PPE worn']
    },
    patientInfo: {
      age: 35,
      gender: 'male',
      weight: 70,
      occupation: 'Farm worker',
      language: 'Urdu, Arabic, English',
      culturalConsiderations: ['Worker visa status concerns', 'Family overseas']
    },
    sceneInfo: {
      description: 'Agricultural farm, patient found near pesticide spraying equipment',
      hazards: ['CHEMICAL CONTAMINATION - PPE required', 'Other workers potentially affected'],
      bystanders: '3 other workers with symptoms, farm supervisor',
      environment: 'Outdoor farm, hot sun, chemical smell in air',
      environmentVariant: 'agricultural',
      sceneImagePath: '/scene-assets/farm-toxicology-male-35-alawir.png',
      sceneImageCaption: 'Scene — Outdoor farm, hot sun, chemical smell in air',
      accessIssues: ['Remote location', 'Decontamination needed'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Critically ill male, vomiting, profuse sweating, difficulty breathing',
      position: 'Semi-conscious, slumped on ground',
      appearance: 'Diaphoretic, cyanotic, chemical odor on clothes',
      consciousness: 'Responding to voice, confused'
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Noisy respirations', 'Vomiting', 'Secretions', 'Possible bronchorrhea'],
        interventions: ['Suction airway', 'Position to lateral if vomiting', 'Consider airway adjuncts']
      },
      breathing: {
        rate: 32,
        rhythm: 'Irregular',
        depth: 'Shallow, labored',
        spo2: 88,
        findings: ['Severe respiratory distress', 'Wheezing throughout', 'Increased secretions'],
        interventions: ['High-flow oxygen 15L/min', 'Assist ventilation with BVM if needed']
      },
      circulation: {
        pulseRate: 45,
        pulseQuality: 'Weak',
        bp: { systolic: 75, diastolic: 45 },
        capillaryRefill: 4,
        skin: 'Diaphoretic, cyanotic, clammy',
        findings: ['Bradycardic', 'Hypotensive', 'Poor perfusion', 'Signs of cholinergic crisis'],
        interventions: ['IV access', 'Atropine 1-3mg IV initial (adult cholinergic crisis — NOT 0.5mg which is bradycardia dose), then DOUBLE every 3-5 min titrated to drying of tracheobronchial secretions (NOT heart rate, NOT pupils). Total dose may reach grams.', 'Pralidoxime 1-2g IV over 30 min alongside', 'Remove contaminated clothing (PPE for responders — nitrile gloves, eye protection, avoid contact with secretions)']
      },
      disability: {
        avpu: 'P',
        gcs: { eye: 2, verbal: 2, motor: 4, total: 8 },
        pupils: 'Pinpoint (miosis) - characteristic sign',
        bloodGlucose: 5.4,
        findings: ['Confused', 'Pinpoint pupils', 'Muscle fasciculations'],
        interventions: ['Monitor GCS', 'Prepare for intubation']
      },
      exposure: {
        temperature: 37.8,
        findings: ['Profuse sweating (diaphoresis)', 'Salivation', 'Urine incontinence', 'Chemical smell on clothes/skin'],
        interventions: ['REMOVE ALL CONTAMINATED CLOTHING', 'DECONTAMINATE SKIN', 'Provider PPE critical']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['No trauma'],
      chest: ['Increased secretions', 'Wheezing'],
      abdomen: ['Hyperactive bowel sounds', 'Vomitus'],
      pelvis: ['Urine incontinence'],
      extremities: ['Muscle fasciculations', 'Weakness'],
      posterior: ['Normal'],
      neurological: ['Agitated then lethargic', 'Pinpoint pupils']
    },
    history: {
      medications: [
        { name: 'Unknown medications', dose: 'Unknown', frequency: 'Unknown', indication: 'Unknown' }
      ],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown history'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Unknown',
      eventsLeading: 'Worker was spraying pesticide crops without proper PPE. Wind blew spray back onto him. About 30 minutes later he started feeling sick, collapsed, vomited multiple times.'
    },
    investigations: [
      { name: '12-lead ECG', indication: 'Assess for arrhythmias', findings: 'Sinus bradycardia with PVCs', urgency: 'urgent' }
    ],
    vitalSignsProgression: {
      initial: { bp: '75/45', pulse: 45, respiration: 32, spo2: 88, temperature: 37.8, gcs: 8, bloodGlucose: 5.4 },
      afterIntervention: { bp: '95/60', pulse: 80, respiration: 28, spo2: 94, gcs: 10 }
    },
    expectedFindings: {
      keyObservations: ['Pinpoint pupils (miosis) - hallmark sign', 'Profuse sweating and salivation', 'Bradycardia', 'Vomiting and diarrhea', 'Muscle fasciculations', 'Respiratory distress with wheezing'],
      redFlags: ['Life-threatening cholinergic crisis', 'Respiratory failure imminent', 'Cardiovascular collapse', 'Multiple casualties - potential MCI'],
      differentialDiagnoses: ['Organophosphate poisoning', 'Carbamate poisoning', 'Other pesticide poisoning', 'Heat stroke', 'Acute pulmonary edema'],
      mostLikelyDiagnosis: 'Organophosphate Poisoning (Cholinergic Crisis)'
    },
    managementPathway: {
      immediate: [
        'Scene safety - don full PPE before approaching patient',
        'Remove contaminated clothing immediately',
        'Decontaminate skin with soap and water (wet wipe if water unavailable)',
        'Atropine 2mg IV/IM bolus — DOUBLE the dose every 3-5 minutes until secretions dry up (clear chest on auscultation, no bronchorrhoea). Titrate to DRYING of secretions ONLY — do NOT target heart rate or pupil size (mydriasis lags and is unreliable; tachycardia is expected from hypoxia/agitation). Total dose often exceeds 50mg in severe OP poisoning.',
        'Pralidoxime (2-PAM) 1-2g IV over 30 minutes (if available)',
        'High-flow oxygen and suction for secretions',
        'IV access and fluid resuscitation',
        'Prepare for airway compromise and respiratory failure'
      ],
      definitive: [
        'Continuous atropine infusion titrated to effect',
        'Pralidoxime infusion (500mg/hr) for 24-48 hours',
        'ICU admission for respiratory support',
        'Mechanical ventilation if respiratory failure',
        'Seizure management with benzodiazepines if needed',
        'Contact Poison Control Centre (UAE: 80042426)',
        'Skin decontamination with thorough washing'
      ],
      monitoring: [
        'Airway patency and respiratory effort',
        'Oxygen saturation and auscultation for bronchospasm',
        'Secretions (dry skin/mouth is goal)',
        'Heart rate and rhythm',
        'Pupil size (dilation indicates adequate atropinization)',
        'Blood pressure',
        'Level of consciousness',
        'Muscle strength and fasciculations'
      ],
      transportConsiderations: [
        'Request HazMat team for scene decontamination',
        'Alert hospital for potential multiple casualties',
        'Do NOT transport contaminated patient - decontaminate first',
        'Pre-alert receiving hospital: "Organophosphate poisoning - atropine given"',
        'Transport to facility with ICU and toxicology support',
        'Notify Poison Control Center en route',
        'Consider decontamination corridor at receiving hospital'
      ]
    },
    studentChecklist: [
      { id: 'tox1-1', category: 'safety', description: 'SCENE SAFETY - Don PPE before approaching', points: 20, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true, timeframe: 'Before patient contact' },
      { id: 'tox1-2', category: 'intervention', description: 'Remove contaminated clothing immediately', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true, rationale: 'Continues absorption until clothing removed' },
      { id: 'tox1-3', category: 'intervention', description: 'Administer Atropine 1-3mg IV initial (adult cholinergic crisis), then DOUBLE every 3-5 min titrated to drying of tracheobronchial secretions — NOT 0.5mg (bradycardia dose), NOT titrated to HR/pupils. Total dose may reach grams.', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true, timeframe: 'As soon as IV established' },
      { id: 'tox1-4', category: 'intervention', description: 'Prepare for advanced airway (RSI equipment)', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'tox1-5', category: 'abcde', description: 'Recognize SLUDGE-BBB mnemonic signs', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'tox1-6', category: 'communication', description: 'Request HazMat support and additional ambulances', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'tox1-7', category: 'communication', description: 'Alert receiving hospital of organophosphate poisoning', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'tox1-airway-y3', category: 'intervention', description: 'Manage compromised airway with LMA/i-gel for GCS ≤8', points: 5, yearLevel: ['3rd-year'], complexity: ['advanced'], critical: true }
    ],
    teachingPoints: [
      'SLUDGE-BBB mnemonic: Salivation, Lacrimation, Urination, Defecation, GI upset, Emesis, Bronchorrhea, Bronchospasm, Bradycardia, Bradypnea',
      'Atropine reverses muscarinic effects (secretions, bronchoconstriction, bradycardia) but NOT nicotinic effects (muscle weakness)',
      'Pralidoxime (2-PAM) regenerates acetylcholinesterase - ACP level',
      'Decontamination: remove clothing, wash skin with soap and water, protect self',
      'Antidote: Atropine 1-3mg IV initial, then DOUBLE the dose every 3-5 min titrated to drying tracheobronchial secretions (not HR, not pupils — pupils are unreliable). Total dose may reach grams in severe poisoning. Pralidoxime 1-2g IV over 30 min alongside (then infusion) — reactivates acetylcholinesterase. Call Poison Control early.',
      'Contact Poison Control Center: 800-4111 (UAE)'
    ],
    commonPitfalls: [
      'Entering scene without PPE - provider becomes second victim',
      'Not requesting additional resources early',
      'Failing to recognize cholinergic crisis signs',
      'Inadequate decontamination',
      'Atropine underdosing - may need repeated doses',
      'Not preparing for impending respiratory failure',
      'Delaying decontamination to establish IV access - remove clothing first',
      'Not recognizing SLUDGE-BBB mnemonic for cholinergic toxidrome',
      'Failure to contact Poison Control Centre for guidance on specific agent',
      'Not monitoring for intermediate syndrome (delayed muscle weakness)',
      'Forgetting that atropine treats muscarinic but NOT nicotinic effects',
      'Not preparing for potential multiple casualties from same exposure',
      'Inadequate airway suctioning - secretions can rapidly occlude airway',
      'Not documenting chemical name/agent for hospital toxicology consultation'
    ],
    equipmentNeeded: [
      'Personal Protective Equipment (PPE): Chemical-resistant gloves, goggles, face shield, chemical-resistant gown',
      'Self-contained breathing apparatus (SCBA) if available for HazMat situations',
      'Decontamination supplies: Soap, water, towels, plastic bags for contaminated clothing',
      'Portable suction unit with large-bore catheters',
      'Bag-valve-mask with oxygen reservoir',
      'Oropharyngeal airways (various sizes)',
      'Endotracheal tubes and laryngoscope',
      'IV cannulation kit',
      'Atropine 0.5-1mg ampoules (multiple doses needed)',
      'Pralidoxime (2-PAM) 1g ampoules (if available)',
      'Normal saline 0.9% 1000ml bags',
      'High-flow oxygen (15L/min)',
      'Cardiac monitor',
      'Pulse oximeter',
      'Blood pressure cuff',
      'Blood glucose meter',
      'Temperature monitoring device',
      'Wound irrigation supplies',
      'Sharps container',
      'Biohazard bags',
      'Patient warming blankets',
      'HazMat identification/reference materials'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Toxicology and Hazardous Materials Protocol v4.0',
        'DCAS Organophosphate/Carbamate Poisoning Guidelines',
        'Dubai Civil Defense HazMat Response Standards',
        'WHO Guidelines: Organophosphate Insecticide Poisoning',
        'Dubai Poison Control Centre Protocols'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Emergency Department',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Toxicology Consultation', 'Critical Care', 'Decontamination Facilities', 'Poison Control Centre liaison'],
          contact: '04 219 3000',
          distance: '45 minutes from Al Awir'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Emergency Department', 'Internal Medicine', 'Toxicology Services', 'ICU'],
          contact: '04 222 1211',
          distance: '40 minutes from Al Awir'
        },
        {
          name: 'Latifa Hospital',
          location: 'Oud Metha, Dubai',
          capabilities: ['Emergency Department', 'Medical Toxicology', 'Pediatric Emergency'],
          contact: '04 219 3000',
          distance: '50 minutes from Al Awir'
        }
      ],
      localConsiderations: [
        'Dubai Poison Control Centre: 800 424 (toll-free, 24/7) - call for specific antidote guidance and management advice',
        'Agricultural areas in Al Awir and surrounding Emirates have frequent pesticide use - maintain high index of suspicion',
        'Many farm workers are expatriates with limited English/Arabic - use translation services or pictorial communication',
        'Cultural considerations: worker may fear job loss or visa issues - emphasize medical confidentiality',
        'UAE law requires notification of Ministry of Health for occupational chemical exposures',
        'Documentation: photograph chemical container labels if safe to do so, note lot numbers and concentrations',
        'PPE mandatory before patient contact - no exceptions',
        'Multiple casualties require incident command activation and HazMat protocols',
        'Summer heat increases dermal absorption and toxicity - prioritize cooling and decontamination',
        'Employer liability issues may arise - document scene thoroughly including safety equipment availability'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-sludge-mnemonic',
          type: 'image',
          title: 'SLUDGE-BBB Mnemonic for Cholinergic Crisis',
          url: 'https://wikem.org/wiki/Cholinergic_toxidrome',
          source: 'WikEM',
          caption: 'Visual guide to cholinergic crisis signs and symptoms using SLUDGE-BBB mnemonic',
          relevance: 'essential',
          tags: ['cholinergic', 'toxidrome', 'SLUDGE', 'organophosphate']
        },
        {
          id: 'img-pupil-miosis',
          type: 'image',
          title: 'Pinpoint Pupils in Organophosphate Poisoning',
          url: 'https://radiopaedia.org/cases/organophosphate-poisoning',
          source: 'Radiopaedia',
          caption: 'Clinical photograph showing miosis in cholinergic crisis',
          relevance: 'essential',
          tags: ['organophosphate', 'miosis', 'pupils', 'toxidrome']
        }
      ],
      videos: [
        {
          id: 'vid-cholinergic-crisis',
          type: 'video',
          title: 'Cholinergic Crisis: Recognition and Management',
          url: 'https://www.youtube.com/watch?v=8eUUf5ssH_4',
          source: 'Osmosis from Elsevier',
          duration: '16:30',
          relevance: 'essential',
          tags: ['cholinergic-crisis', 'organophosphate', 'recognition', 'management']
        },
        {
          id: 'vid-atropine-therapy',
          type: 'video',
          title: 'Atropine Therapy in Organophosphate Poisoning',
          url: 'https://www.youtube.com/watch?v=cssRZEI9ujY',
          source: 'MedCram',
          duration: '14:20',
          relevance: 'essential',
          tags: ['atropine', 'organophosphate', 'poisoning', 'treatment']
        },
        {
          id: 'vid-hazmat-decon',
          type: 'video',
          title: 'HazMat Decontamination Procedures',
          url: 'https://www.youtube.com/watch?v=zWe_lPniEq4',
          source: 'Khan Academy',
          duration: '22:45',
          relevance: 'important',
          tags: ['HazMat', 'decontamination', 'safety', 'PPE']
        }
      ],
      articles: [
        {
          id: 'art-organophosphate-who',
          type: 'article',
          title: 'WHO Guidelines: Organophosphate Insecticide Poisoning',
          url: 'https://www.who.int/publications/i/item/9789241558030',
          source: 'World Health Organization',
          caption: 'Comprehensive WHO guidelines on organophosphate poisoning management',
          relevance: 'essential',
          tags: ['organophosphate', 'WHO', 'guidelines', 'poisoning']
        },
        {
          id: 'art-cholinergic-toxidrome',
          type: 'article',
          title: 'Organophosphate Poisoning - Emergency Management',
          url: 'https://emcrit.org/ibcc/organophosphate/',
          source: 'EMCrit',
          caption: 'Evidence-based approach to organophosphate poisoning recognition and treatment',
          relevance: 'essential',
          tags: ['organophosphate', 'toxidrome', 'EMCrit', 'treatment']
        },
        {
          id: 'art-cholinergic-wikem',
          type: 'article',
          title: 'Cholinergic Toxidrome',
          url: 'https://wikem.org/wiki/Cholinergic_toxidrome',
          source: 'WikEM',
          caption: 'Quick reference for cholinergic toxidrome recognition and management',
          relevance: 'important',
          tags: ['cholinergic', 'toxidrome', 'WikEM', 'recognition']
        },
        {
          id: 'art-atropine-dosing',
          type: 'article',
          title: 'Atropine Dosing in Organophosphate Poisoning',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4662123/',
          source: 'Clinical Toxicology',
          caption: 'Evidence-based dosing strategies for atropine in cholinergic crisis',
          relevance: 'important',
          tags: ['atropine', 'dosing', 'organophosphate', 'clinical']
        }
      ]
    }
  }),

  createCase({
    id: 'burn-001',
    title: 'Burns - Industrial Fire with Inhalation Injury',
    category: 'burns',
    subcategory: 'thermal-burns',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 35,
    dispatchInfo: {
      callReason: 'Factory fire, multiple people trapped, one with severe burns',
      timeOfDay: 'afternoon',
      location: 'Industrial area in Jebel Ali, Dubai',
      callerInfo: 'Security guard (panic)',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Chemical factory', 'Explosion reported', 'Multiple casualties expected']
    },
    patientInfo: {
      age: 42,
      gender: 'male',
      weight: 82,
      occupation: 'Factory worker',
      language: 'Hindi, Arabic, English',
      culturalConsiderations: ['Concerned about family finances', 'Visa worker']
    },
    sceneInfo: {
      description: 'Industrial factory with active fire, smoke throughout building, patient found near exit',
      hazards: ['ACTIVE FIRE', 'Smoke-filled environment', 'Structural collapse risk', 'Chemical exposure risk'],
      bystanders: 'Other workers being evacuated',
      environment: 'Smoke-filled, hot, chaotic',
      environmentVariant: 'fire',
      sceneImagePath: '/scene-assets/burn-001-jebel-ali-industrial-fire-burns.png',
      sceneImageCaption: 'Industrial fire — Jebel Ali',
      accessIssues: ['Fire department needed for access'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Adult male with extensive burns, conscious but in pain, coughing',
      position: 'Sitting on ground outside building',
      appearance: 'Burns to face/neck/chest/arms, soot marks around nose/mouth',
      consciousness: 'Alert and oriented but anxious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Hoarse voice', 'Soot in sputum', 'Stridor possible'],
        interventions: ['Prepare for advanced airway', '100% humidified oxygen'],
        difficulty: 'Airway may deteriorate rapidly - intubation may be needed'
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Labored',
        spo2: 91,
        findings: ['Tachypneic', 'Possible inhalation injury', 'Coughing with carbonaceous sputum'],
        interventions: ['High-flow oxygen 15L/min via non-rebreather', 'Consider CPAP']
      },
      circulation: {
        pulseRate: 135,
        pulseQuality: 'Rapid, weak',
        bp: { systolic: 85, diastolic: 55 },
        capillaryRefill: 4,
        skin: 'Burned areas, pale elsewhere',
        findings: ['Tachycardic', 'Hypotensive', 'Signs of hypovolemic shock'],
        interventions: ['IV access x2 large bore', 'Hartmann\'s (Ringer\'s Lactate) 250mL titrated — NOT 0.9% NaCl (causes hyperchloraemic acidosis)', 'Burn fluid resuscitation using Parkland formula']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious but appropriate', 'Pain management needed'],
        interventions: ['Morphine 5-10mg IV for pain', 'Monitor mental status']
      },
      exposure: {
        temperature: 37.2,
        findings: ['Full-thickness burns to face, neck, chest, both arms', 'Partial-thickness burns to hands', 'Soot around nose and mouth', 'Singed facial hair'],
        interventions: ['Cover burns with sterile, non-adhesive dressing', 'Keep patient warm', 'DO NOT break blisters or apply ice', 'Remove jewelry and constricting items']
      }
    },
    secondarySurvey: {
      head: ['Singed facial hair', 'No direct trauma'],
      neck: ['Burned circumferentially - may need escharotomy'],
      chest: ['Full-thickness circumferential burns — escharotomy may be needed to allow chest wall excursion', 'Breath sounds equal bilaterally at this stage'],
      abdomen: ['Partial-thickness burns', 'Soft, non-tender'],
      pelvis: ['No burns'],
      extremities: ['Full-thickness burns to both arms', 'Partial-thickness to hands', 'Edema developing'],
      posterior: ['Partial-thickness burns to back'],
      neurological: ['Anxious but appropriate']
    },
    history: {
      medications: [],
      allergies: ['None known'],
      medicalConditions: ['Hypertension', 'Type 2 diabetes'],
      surgicalHistory: ['Appendectomy'],
      lastMeal: 'Lunch 1 hour ago',
      eventsLeading: 'Chemical reaction and explosion in factory where he works. He was near the source when it happened. Clothes caught fire, he ran out, others helped put out flames with fire extinguisher but he\'s badly burned.'
    },
    vitalSignsProgression: {
      initial: { bp: '85/55', pulse: 135, respiration: 28, spo2: 91, temperature: 37.2, gcs: 14, bloodGlucose: 5.4 },
      afterIntervention: { bp: '105/68', pulse: 88, respiration: 12, spo2: 98, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: ['Extensive burns (>30% TBSA)', 'Face/neck/chest burns - high risk for airway', 'Soot around airway - inhalation likely', 'Signs of hypovolemic shock', 'Possible circumferential burns to extremities'],
      redFlags: ['Inhalation injury - may need intubation', 'Circumferential burns may require escharotomy', 'TBSA >40% - major burn', 'Facial burns - airway at risk', 'Potential carbon monoxide/cyanide exposure'],
      differentialDiagnoses: ['Thermal burns with inhalation injury', 'Carbon monoxide poisoning', 'Chemical burns', 'Trauma from explosion'],
      mostLikelyDiagnosis: 'Major Thermal Burns with Inhalation Injury'
    },
    managementPathway: {
      immediate: [
        'Stop the burning process — remove from heat source, remove smouldering clothing and jewellery (will continue to burn and become constricting as oedema forms)',
        'Cool the burn with cool (NOT cold) running water for 20 minutes if within 3 hours of injury — cooling limited to burn site only; actively WARM the rest of the patient (hypothermia + large TBSA = lethal triad)',
        'Dress with loose cling film applied lengthwise (never circumferential — constricts as oedema forms). Do NOT use wet dressings on large TBSA (hypothermia risk)',
        'Assess airway - early intubation if soot around mouth/nose, hoarseness/stridor, facial burns, or singed nasal hairs',
        '100% oxygen via non-rebreather (treat CO/CN poisoning)',
        'IV access x2 with large-bore catheters',
        'Fluid resuscitation: Parkland formula (4ml x weight(kg) x %TBSA, half in first 8 hours, half in next 16 hours)',
        'Cover burns with sterile, dry, non-adherent dressing',
        'Keep patient warm (prevent hypothermia)',
        'Pain management: IV morphine'
      ],
      definitive: [
        'Burn center transfer for >20% TBSA or significant facial/hand burns',
        'Mechanical ventilation if inhalation injury',
        'Bronchoscopy to assess airway',
        'Carboxyhemoglobin and cyanide levels',
        'Tetanus prophylaxis',
        'Escharotomy for circumferential burns compromising circulation',
        'Surgical debridement and grafting',
        'Infection prevention and nutrition support'
      ],
      monitoring: [
        'Airway patency and respiratory status',
        'Oxygen saturation (goal >94%)',
        'Vital signs and urine output (goal 0.5-1ml/kg/hr)',
        'Burn depth and circumferential areas',
        'Peripheral pulses in burned extremities',
        'Level of consciousness (CO/CN poisoning)',
        'Fluid balance and electrolytes',
        'Body temperature (prevent hypothermia)'
      ],
      transportConsiderations: [
        'Rapid transport to burn center',
        'Pre-alert: "Major burn, %TBSA, inhalation injury suspected"',
        'Keep patient warm during transport',
        'Continue fluid resuscitation en route',
        '100% oxygen throughout transport',
        'Monitor airway closely - be ready to intubate',
        'Do NOT apply ointments/creams',
        'Elevate burned extremities if possible'
      ]
    },
    studentChecklist: [
      { id: 'burn1-1', category: 'abcde', description: 'Assess airway - look for soot, stridor, hoarseness', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'burn1-2', category: 'intervention', description: 'Calculate TBSA (Total Body Surface Area) burned', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true, rationale: 'Rule of 9s: head 9%, each arm 9%, each leg 18%, anterior torso 18%, posterior torso 18%, genitalia 1%' },
      { id: 'burn1-3', category: 'intervention', description: 'Remove jewelry and constricting items immediately', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'burn1-4', category: 'intervention', description: 'IV access through burned skin if necessary', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'burn1-5', category: 'intervention', description: 'Parkland formula: 4 mL × kg × %TBSA of Hartmann\'s / Ringer\'s Lactate over 24h (half in first 8h from time of burn). Exclude superficial burns from TBSA (erythema only, like sunburn — do NOT count).', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true, rationale: 'EBA 2023 / JRCALC 2024 / ABA consensus: adult Parkland is 4 mL × kg × %TBSA with Hartmann\'s (balanced crystalloid). Over-inclusion of superficial burns drives over-resuscitation → abdominal compartment syndrome, ARDS.' },
      { id: 'burn1-6', category: 'intervention', description: 'Pain management (Morphine)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'burn1-7', category: 'intervention', description: 'Cover burns with sterile non-adhesive dressing', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'burn1-8', category: 'communication', description: 'Transport to burn center', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'burn1-9', category: 'documentation', description: 'Document TBSA, burn depth, circumferential burns', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Rule of 9s for TBSA estimation: Head 9%, Arms 9% each, Legs 18% each, Anterior trunk 18%, Posterior trunk 18%, Genitalia 1%',
      'Parkland formula (adult): 4 mL × kg × %TBSA of Hartmann\'s / Ringer\'s Lactate in first 24h, half in first 8h from time of burn. Include only partial-thickness and full-thickness burns in %TBSA — EXCLUDE superficial (erythema only, sunburn-like) burns; over-inclusion drives over-resuscitation (abdominal compartment syndrome, ARDS).',
      'Burn depth: Superficial (like sunburn), Partial-thickness (blisters, painful), Full-thickness (white/charred, painless)',
      'Inhalation injury signs: facial burns, soot in sputum, hoarseness, stridor, cough',
      'Circumferential burns (around limb/body) require escharotomy to restore circulation',
      'UAE burn centers: Rashid Hospital (Dubai), Saif Bin Ghobash Hospital',
      'DO NOT break blisters, apply ice, or apply ointments/preparations'
    ],
    commonPitfalls: [
      'Underestimating TBSA or depth',
      'Removing clothing that is stuck to burns - leave it, cut around it',
      'Applying ice directly to burns (causes more tissue damage)',
      'Not recognizing inhalation injury early',
      'Inadequate fluid resuscitation',
      'Not removing jewelry/constricting items before edema develops',
      'Transporting to non-burn center facility'
    ],
    visualResources: {
      images: [
        {
          id: 'img-burns-001',
          type: 'image',
          title: 'Rule of Nines for TBSA',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK513129/',
          source: 'StatPearls',
          caption: 'Body surface area calculation using rule of nines',
          relevance: 'essential',
          tags: ['burns', 'TBSA', 'rule of nines', 'assessment']
        }
      ],
      articles: [
        {
          id: 'art-burns-001',
          type: 'article',
          title: 'Burns - Emergency Management',
          url: 'https://wikem.org/wiki/Burns',
          source: 'WikEM',
          caption: 'Quick reference for burn assessment and emergency management',
          relevance: 'essential',
          tags: ['burns', 'WikEM', 'emergency', 'assessment']
        },
        {
          id: 'art-burns-emcrit',
          type: 'article',
          title: 'Burn Resuscitation and Critical Care',
          url: 'https://emcrit.org/ibcc/burns/',
          source: 'EMCrit',
          caption: 'Evidence-based approach to burn resuscitation and critical care management',
          relevance: 'essential',
          tags: ['burns', 'EMCrit', 'resuscitation', 'critical-care']
        },
        {
          id: 'art-burns-facs',
          type: 'article',
          title: 'ACS/ABA Guidelines for Burn Care',
          url: 'https://www.facs.org/quality-programs/trauma/quality/verification-review-and-consultation-program/burn-center-verification/',
          source: 'American College of Surgeons',
          caption: 'National burn care guidelines including criteria for burn center referral',
          relevance: 'important',
          tags: ['burns', 'ACS', 'ABA', 'guidelines']
        },
        {
          id: 'art-parkland-001',
          type: 'article',
          title: 'Parkland Formula Calculator',
          url: 'https://www.mdcalc.com/parkland-formula-burns',
          source: 'MDCalc',
          caption: 'Fluid resuscitation calculator for burn patients',
          relevance: 'essential',
          tags: ['burns', 'parkland formula', 'fluid resuscitation', 'calculator']
        }
      ],
      videos: [
        {
          id: 'vid-burns-001',
          type: 'video',
          title: 'Burn Assessment and Management',
          url: 'https://www.youtube.com/watch?v=Ug4AKrwa0K8',
          source: 'The Paramedic Coach',
          caption: 'Complete burn assessment from scene to hospital',
          duration: '18:20',
          relevance: 'essential',
          tags: ['burns', 'assessment', 'management', 'EMS']
        }
      ]
    }
  }),

  createCase({
    id: 'multi-001',
    title: 'Mass Casualty Incident - Bus vs Car Collision (8 Patients)',
    category: 'multiple-patients',
    subcategory: 'mass-casualty',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 60,
    dispatchInfo: {
      callReason: 'Bus vs car collision, multiple injuries, road blocked, MCI declared',
      timeOfDay: 'morning',
      location: 'Sheikh Zayed Road, near Mall of Emirates, Dubai',
      callerInfo: 'Police Control Room (999)',
      dispatchCode: 'Echo-1',
      additionalInfo: [
        'Bus carrying 28 passengers overturned',
        'Car with 3 occupants - severe front-end damage',
        'Estimated 8-12 patients requiring medical attention',
        'Dubai Police on scene, traffic blocked both directions',
        'Fire and Rescue dispatched for extrication',
        'Weather: Hot, 38°C, clear skies'
      ]
    },
    patientInfo: {
      age: 0,
      gender: 'male',
      weight: 0,
      occupation: 'N/A - Multiple Patients',
      language: 'Multiple languages',
      culturalConsiderations: ['Mixed nationalities expected', 'Some may not speak English/Arabic']
    },
    sceneInfo: {
      description: 'Major RTC: Bus on side with significant damage, car severely damaged, debris scattered 50m across highway. Multiple victims visible. One patient trapped in car. Strong smell of fuel.',
      hazards: [
        'Fuel leak from bus tank - fire risk',
        'Downed street light with exposed wires',
        'Glass and metal debris across road',
        'Traffic hazard - vehicles still passing on hard shoulder',
        'Hot sun - risk of heat exhaustion for patients and responders',
        'Unstable vehicle wreckage'
      ],
      bystanders: 'Approximately 40 people: uninjured bus passengers, passing motorists, mall security',
      environment: 'Highway, exposed to sun, high ambient noise, chaotic',
      environmentVariant: 'roadside',
      sceneImagePath: '/scene-assets/mci-highway-uae.png',
      sceneImageCaption: 'Major RTC — bus vs car collision on highway',
      accessIssues: ['Limited ambulance access due to wreckage', 'Need helicopter landing zone', 'Traffic management required'],
      extricationNeeded: true
    },
    initialPresentation: {
      generalImpression: 'MCI Scene - 8 patients visible requiring triage. Mixed injury severity. One patient unconscious. One patient trapped.',
      position: 'Various - some ambulatory, some seated, some supine',
      appearance: 'Variable - from walking wounded to critical trauma',
      consciousness: 'Range from alert (GCS 15) to unconscious (GCS 3)'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Multiple patients with airway concerns', 'Patient 3 requires immediate airway intervention'],
        interventions: ['Triage prioritization required', 'Airway management for RED priority patients']
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 97,
        findings: ['Multiple patients with respiratory distress', 'One patient with flail chest requiring ventilatory support'],
        interventions: ['Oxygen for hypoxic patients', 'BVM ventilation for critical RED patients']
      },
      circulation: {
        pulseRate: 95,
        pulseQuality: 'Normal',
        bp: { systolic: 120, diastolic: 75 },
        capillaryRefill: 2,
        skin: 'Normal',
        findings: ['Several patients with significant bleeding', 'Signs of shock in multiple RED priority patients'],
        interventions: ['Massive hemorrhage control', 'IV access for RED and YELLOW patients', 'Blood products if available']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Range of GCS from 3 to 15 across multiple patients', 'Suspected spinal injuries in 2 patients'],
        interventions: ['Rapid neuro assessment during triage', 'Spinal precautions as indicated']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Various traumatic injuries across multiple body regions', 'Risk of heat exhaustion in hot weather'],
        interventions: ['Exposure control per patient', 'Shade and cooling measures', 'Maintain normothermia']
      }
    },
    secondarySurvey: {
      head: ['Variable across patients - see individual patient profiles'],
      neck: ['C-spine precautions needed for high-risk patients'],
      chest: ['Chest injuries in 3 patients including one flail chest'],
      abdomen: ['Abdominal injuries suspected in 2 patients'],
      pelvis: ['Pelvic fracture in Patient 4'],
      extremities: ['Multiple fractures, lacerations, amputations across patient group'],
      posterior: ['Back injuries from ejection in 2 patients'],
      neurological: ['Variable findings across patients - see individual profiles']
    },
    history: {
      medications: [
        { name: 'Unknown - multiple patients', dose: 'Unknown', frequency: 'Unknown', indication: 'Unknown' }
      ],
      allergies: ['Unknown for most patients'],
      medicalConditions: ['Unknown for most patients'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Unknown for most patients',
      eventsLeading: 'Bus travelling on SZR toward Abu Dhabi. Car reportedly changed lanes suddenly, side-swiped bus. Bus driver lost control, bus overturned onto side. Car spun into barrier. Incident occurred approximately 20 minutes ago. Multiple 999 calls received.'
    },
    vitalSignsProgression: {
      initial: { bp: 'Various', pulse: 95, respiration: 20, spo2: 97, gcs: 15, bloodGlucose: 5.4 },
      afterIntervention: { bp: 'Various - depending on patient', pulse: 95, respiration: 20, spo2: 97, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'MCI with 8 distinct patients requiring individual assessment',
        'START triage system must be implemented',
        'RED (Immediate): 2 patients - airway compromise and severe hemorrhage',
        'YELLOW (Delayed): 3 patients - significant but stable injuries',
        'GREEN (Minor): 2 patients - walking wounded',
        'BLACK (Expectant): 1 patient - cardiac arrest',
        'Scene requires Incident Command structure',
        'Multiple agencies needed: Ambulance, Fire, Police',
        'Hospital notification critical - distribute patients across facilities'
      ],
      redFlags: [
        'More RED priority patients than immediate transport capacity',
        'Fuel leak presents fire and explosion risk',
        'Exposed electrical wires downed',
        'Hot weather causing heat stress',
        'One patient trapped requiring prolonged extrication'
      ],
      differentialDiagnoses: ['Multiple traumatic injuries across 8 patients - see individual profiles'],
      mostLikelyDiagnosis: 'Mass Casualty Incident - Multiple Trauma Patients'
    },
    managementPathway: {
      immediate: [
        'Scene safety assessment — fuel leak, downed wires, unstable vehicles; do NOT enter until safe',
        'Declare MCI immediately — call dispatch, request additional ambulances, fire, police, HEMS',
        'Establish Incident Command Structure — designate Incident Commander, Triage Officer, Treatment Officer, Transport Officer',
        'START triage — assess all 8 patients within 60 seconds each: Respiration, Perfusion, Mental Status',
        'Apply colour-coded triage tags: RED (immediate), YELLOW (delayed), GREEN (minor), BLACK (expectant)',
        'Life-saving interventions for RED patients only: airway adjuncts, haemorrhage control, chest decompression',
        'Do NOT perform full ABCDE on each patient during triage — triage first, treat second',
        'Establish helicopter landing zone if HEMS required'
      ],
      definitive: [
        'Coordinate hospital distribution — 2 RED to Rashid Hospital, 1 RED to Dubai Hospital, distribute YELLOW across facilities',
        'Pre-alert all receiving hospitals with patient count, priority, and ETA',
        'Request Disaster Medical Assistance Team (DMAT) activation if resource gap',
        'Document all patient destinations with triage tag numbers'
      ],
      monitoring: [
        'Continuous reassessment of triage categories as interventions change status',
        'Monitor GREEN patients for delayed deterioration',
        'Track all patient destinations for accountability',
        'Manage responder welfare — rotate crews every 30 minutes in 40°C heat'
      ],
      transportConsiderations: [
        'Distribute patients across Rashid Hospital, Dubai Hospital, and Mediclinic City to avoid overwhelming single facility',
        'RED patients first, but transport must be coordinated not sequential',
        'HEMS for critical patients if road traffic delays are >20 minutes to nearest trauma centre',
        'Police escort for RED priority transports on Sheikh Zayed Road'
      ]
    },
    studentChecklist: [
      { id: 'mci-1', category: 'safety', description: 'Scene safety assessment - identify all hazards before entry', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'mci-2', category: 'communication', description: 'Declare MCI and request additional resources (multiple ambulances, fire, police)', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'mci-3', category: 'communication', description: 'Establish Incident Command with clear roles: Incident Commander, Triage Officer, Treatment Officer, Transport Officer', points: 20, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'mci-4', category: 'abcde', description: 'Perform START triage on all 8 patients within 60 seconds each', points: 25, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'mci-5', category: 'intervention', description: 'Apply triage tags (RED/YELLOW/GREEN/BLACK) to all patients', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'mci-6', category: 'intervention', description: 'Immediate life-saving interventions for RED patients only', points: 20, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'mci-7', category: 'communication', description: 'Coordinate with Dubai Police for traffic control and scene management', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'mci-8', category: 'communication', description: 'Coordinate with Fire and Rescue for extrication of trapped patient', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'mci-9', category: 'communication', description: 'Notify receiving hospitals of MCI and patient numbers/categories', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'mci-10', category: 'intervention', description: 'Establish treatment area and casualty collection point', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'mci-11', category: 'communication', description: 'Coordinate helicopter evacuation for critical patient if available', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'mci-12', category: 'documentation', description: 'Document all triage decisions and patient destinations', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'mci-13', category: 'team-lead', description: 'Manage responder safety and welfare in hot conditions', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'MCI Definition: Any incident where the number of patients and/or severity exceeds normal response capabilities',
      'START Triage: Simple Triage and Rapid Treatment - designed for completion in 60 seconds per patient',
      'START Criteria: Respiratory rate (>30 = RED), Perfusion (capillary refill >2 sec = RED), Mental status (unable to follow commands = RED)',
      'RED (Immediate): Life-threatening but salvageable - airway compromise, severe respiratory distress, hemorrhagic shock',
      'YELLOW (Delayed): Significant injuries but stable for 30-60 minutes - fractures, spinal precautions, non-critical wounds',
      'GREEN (Minimal/Walking Wounded): Can wait hours - minor lacerations, abrasions, stable',
      'BLACK (Expectant/Deceased): Unsalvageable with current resources - cardiac arrest in field, unsurvivable injuries',
      'Command Structure: Incident Commander (overall), Triage Officer (sorting), Treatment Officer (medical care), Transport Officer (evacuation)',
      'MCI Principles: Do the MOST GOOD for the MOST PEOPLE - this may mean not treating everyone immediately',
      'Scene Safety First: Never enter unsafe scene - hazards include fire, fuel, electricity, traffic, unstable vehicles',
      'Documentation Critical: Track all patients with triage tags, document destinations, maintain chain of custody',
      'Resource Management: Request resources early, distribute patients across hospitals, avoid overwhelming single facility',
      'Responder Welfare: Rotate crews, hydrate, prevent heat exhaustion - cannot help patients if responders become casualties',
      'UAE-Specific: Dubai Police (999) coordinate scene, DCAS protocols, trauma centers at Rashid Hospital, Dubai Hospital, SKMC',
      'Communication: Clear radio discipline, designated channels, regular updates to dispatch and hospitals'
    ],
    commonPitfalls: [
      'Failure to declare MCI early - delays resource mobilization',
      'No scene safety assessment - responders injured by fuel fire or downed wires',
      'Starting treatment before triage - wastes resources on minor injuries',
      'Poor command structure - chaos, duplicated efforts, missed patients',
      'Inadequate resource requests - not enough ambulances, no fire/rescue',
      'Tunnel vision on one patient - missing other critical patients',
      'Forgetting documentation - lost patients, no destination tracking',
      'Overwhelming closest hospital - should distribute across facilities',
      'Responder exhaustion - heat stroke in 40°C weather',
      'No helicopter coordination - when air evacuation could save lives',
      'Language barriers - not using interpreters for non-English speakers',
      'Cultural issues - gender-specific care requirements'
    ],
    mci: {
      isMCI: true,
      totalPatients: 8,
      triageCategories: {
        red: 2,
        yellow: 3,
        green: 2,
        black: 1
      },
      patients: [
        {
          id: 'PT-001-RED',
          priority: 'red',
          age: 34,
          gender: 'male',
          name: 'Bus Driver',
          patientInfo: {
            age: 34,
            gender: 'male',
            weight: 82,
            occupation: 'Bus Driver',
            language: 'Hindi, Basic English',
            medicalConditions: ['Hypertension'],
            medications: ['Amlodipine'],
            allergies: ['None known']
          },
          presentation: {
            generalImpression: 'Severe chest trauma, unconscious',
            position: 'Supine, extricated from bus',
            appearance: 'Pale, diaphoretic, significant chest bruising',
            consciousness: 'Unconscious (GCS 8)',
            complaints: ['None - unconscious']
          },
          vitals: {
            time: 'T0',
            bp: '85/50',
            pulse: 128,
            respiration: 32,
            spo2: 88,
            gcs: 8,
            bloodGlucose: 6.2,
            temperature: 37.1
          },
          abcde: {
            airway: { patent: true, findings: ['Patent but high risk'], interventions: ['C-spine precautions', 'Prepare for airway compromise'] },
            breathing: { rate: 32, rhythm: 'Labored', depth: 'Shallow', spo2: 88, findings: ['Bilateral chest bruising', 'Suspected flail chest', 'Respiratory distress'], interventions: ['High-flow O2', 'Support ventilation'] },
            circulation: { pulseRate: 128, pulseQuality: 'Weak', bp: { systolic: 85, diastolic: 50 }, capillaryRefill: 4, skin: 'Pale, cold, clammy', findings: ['Hypotensive', 'Tachycardic', 'Shock'], interventions: ['IV access x2', 'Fluid resuscitation', 'Control bleeding'] },
            disability: { avpu: 'P', gcs: { eye: 2, verbal: 2, motor: 4, total: 8 }, pupils: 'Equal, sluggish', bloodGlucose: 6.2, findings: ['GCS 8', 'Unconscious'], interventions: ['Spinal precautions'] },
            exposure: { temperature: 37.1, findings: ['Chest: Severe bruising, possible flail segment', 'Abdomen: Tender, distended', 'Pelvis: Stable', 'Extremities: Multiple abrasions'], interventions: ['Expose to assess', 'Prevent hypothermia'] }
          },
          secondarySurvey: {
            head: ['No obvious trauma', 'Pupils equal sluggish'],
            neck: ['C-spine tenderness', 'Trachea midline'],
            chest: ['Bilateral chest bruising', 'Paradoxical movement right chest', 'Decreased air entry right base'],
            abdomen: ['Tender diffusely', 'Distended', 'Seat belt sign'],
            pelvis: ['Stable', 'No tenderness'],
            extremities: ['Multiple abrasions', 'Deformity right forearm'],
            posterior: ['Thoracic spine tenderness'],
            neurological: ['GCS 8', 'No focal deficits', 'Spinal cord intact']
          },
          injuries: {
            head: [],
            neck: ['C-spine injury suspected'],
            chest: ['Flail chest', 'Pulmonary contusion', 'Possible cardiac contusion'],
            abdomen: ['Intra-abdominal bleeding suspected'],
            pelvis: [],
            extremities: ['Right radius/ulna fracture']
          },
          interventions: ['C-spine immobilization', 'High-flow O2', 'IV access x2', 'Fluid resuscitation', 'Analgesia', 'Rapid transport'],
          transportPriority: 'immediate',
          destination: 'Rashid Hospital Trauma Center',
          specialConsiderations: ['Police will need statement when conscious', 'Employer notification required']
        },
        {
          id: 'PT-002-RED',
          priority: 'red',
          age: 28,
          gender: 'female',
          name: 'Car Driver',
          patientInfo: {
            age: 28,
            gender: 'female',
            weight: 65,
            occupation: 'Marketing Executive',
            language: 'English, Arabic',
            medicalConditions: [],
            medications: ['Oral contraceptive'],
            allergies: ['Penicillin']
          },
          presentation: {
            generalImpression: 'Trapped in car, severe leg injury, hemorrhaging',
            position: 'Seated, trapped by steering column and dashboard',
            appearance: 'Pale, anxious, severe pain, active bleeding from legs',
            consciousness: 'Alert but distressed (GCS 14)',
            complaints: ['Severe leg pain', 'Cannot feel left foot', 'Chest hurts']
          },
          vitals: {
            time: 'T0',
            bp: '75/40',
            pulse: 135,
            respiration: 28,
            spo2: 92,
            gcs: 14,
            bloodGlucose: 5.8,
            temperature: 37.0
          },
          abcde: {
            airway: { patent: true, findings: ['Patent'], interventions: ['C-spine precautions'] },
            breathing: { rate: 28, rhythm: 'Regular', depth: 'Normal', spo2: 92, findings: ['Tachypneic', 'Chest bruising from seatbelt'], interventions: ['High-flow O2'] },
            circulation: { pulseRate: 135, pulseQuality: 'Weak', bp: { systolic: 75, diastolic: 40 }, capillaryRefill: 5, skin: 'Pale, cold, sweaty', findings: ['Severe hemorrhagic shock', 'Active bleeding from both legs'], interventions: ['Tourniquets x2', 'IV access', 'Blood products'] },
            disability: { avpu: 'A', gcs: { eye: 4, verbal: 4, motor: 6, total: 14 }, pupils: 'Equal, reactive', bloodGlucose: 5.8, findings: ['Oriented but distressed'], interventions: [] },
            exposure: { temperature: 37.0, findings: ['Bilateral open femur fractures with active bleeding', 'Seatbelt sign across chest and abdomen', 'Left foot cold, no pulse'], interventions: ['Control hemorrhage', 'Prevent hypothermia'] }
          },
          secondarySurvey: {
            head: ['Minor facial abrasions'],
            neck: ['C-spine precautions maintained'],
            chest: ['Seatbelt sign', 'Tender sternum', 'Clear air entry'],
            abdomen: ['Seatbelt sign', 'Mild tenderness'],
            pelvis: ['Stable'],
            extremities: ['Right leg: Open femur fracture, active bleeding', 'Left leg: Open femur fracture, no distal pulse', 'Both legs require tourniquets'],
            posterior: ['No significant injuries'],
            neurological: ['GCS 14', 'Oriented', 'Moving all extremities except compromised left leg']
          },
          injuries: {
            head: ['Minor facial abrasions'],
            neck: [],
            chest: ['Sternal fracture suspected'],
            abdomen: [],
            pelvis: [],
            extremities: ['Bilateral open femur fractures', 'Left leg vascular compromise', 'Significant blood loss']
          },
          interventions: ['Tourniquet application x2', 'C-spine immobilization', 'IV access x2', 'Blood products', 'Analgesia', 'Rapid extrication needed', 'Immediate transport'],
          transportPriority: 'immediate',
          destination: 'Rashid Hospital Trauma Center',
          specialConsiderations: ['Allergic to penicillin - document clearly', 'Prolonged extrication expected (30+ minutes)', 'Will need massive transfusion protocol']
        }
      ],
      resources: {
        ambulancesNeeded: 6,
        helicopters: 1,
        fireRescue: true,
        police: true,
        additionalParamedics: 8
      },
      commandStructure: {
        incidentCommander: 'Senior Paramedic (Command 1)',
        triageOfficer: 'Designated paramedic for triage',
        treatmentOfficer: 'Paramedic to oversee treatment area',
        transportOfficer: 'Paramedic to coordinate evacuations'
      }
    },
    visualResources: {
      images: [],
      videos: [
        {
          id: 'vid-mci-triage',
          type: 'video',
          title: 'START Triage System for Mass Casualty Incidents',
          url: 'https://www.youtube.com/watch?v=h2SIN7Mn0YA',
          source: 'Brainbook',
          caption: 'Comprehensive guide to START triage system for MCI management',
          duration: '18:30',
          relevance: 'essential',
          tags: ['MCI', 'triage', 'START', 'mass-casualty']
        },
        {
          id: 'vid-mci-management',
          type: 'video',
          title: 'Mass Casualty Incident Command and Management',
          url: 'https://www.youtube.com/watch?v=a33Hq89sELc',
          source: 'RegisteredNurseRN',
          caption: 'Incident command system and prehospital MCI management strategies',
          duration: '22:15',
          relevance: 'important',
          tags: ['MCI', 'incident-command', 'management', 'EMS']
        }
      ],
      articles: [
        {
          id: 'art-mci-uae-001',
          type: 'article',
          title: 'DCAS Mass Casualty Incident Protocols',
          url: 'https://www.dcas.gov.ae/emergency-protocols/mci',
          source: 'Dubai Corporation for Ambulance Services',
          caption: 'Official UAE protocols for mass casualty incident management',
          relevance: 'essential',
          tags: ['MCI', 'UAE', 'DCAS', 'protocols']
        },
        {
          id: 'art-mci-who',
          type: 'article',
          title: 'WHO Mass Casualty Management Guidelines',
          url: 'https://www.who.int/publications/i/item/9789241513007',
          source: 'World Health Organization',
          caption: 'International guidelines for mass casualty management',
          relevance: 'essential',
          tags: ['MCI', 'WHO', 'guidelines', 'international']
        },
        {
          id: 'art-mci-facs',
          type: 'article',
          title: 'ACS Mass Casualty Triage Guidelines',
          url: 'https://www.facs.org/quality-programs/trauma/',
          source: 'American College of Surgeons',
          caption: 'ACS guidelines for mass casualty triage and trauma systems',
          relevance: 'important',
          tags: ['MCI', 'ACS', 'triage', 'trauma']
        }
      ]
    }
  }),

  // ==================== ADDITIONAL CARDIAC CASES FOR ALL YEAR LEVELS ====================

  // CARDIAC CASE 005 - Stable Angina (Basic/Diploma)
  createCase({
    id: 'cardiac-005',
    title: 'Stable Angina - Exertional Chest Pain',
    category: 'cardiac',
    subcategory: 'stable-angina',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: 'Chest pain, not severe',
      timeOfDay: 'afternoon',
      location: 'Shopping mall in Dubai',
      callerInfo: 'Patient (65-year-old male)',
      dispatchCode: 'Delta-1',
      additionalInfo: ['Patient resting in chair', 'Pain described as pressure']
    },
    patientInfo: {
      age: 65,
      gender: 'male',
      weight: 80,
      occupation: 'Retired teacher',
      language: 'English, Arabic',
      culturalConsiderations: ['Prefers to sit upright']
    },
    sceneInfo: {
      description: 'Shopping mall food court, air-conditioned',
      hazards: [],
      bystanders: 'Security guard present',
      environment: 'Safe, public area',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Elderly male, appears comfortable',
      position: 'Sitting upright',
      appearance: 'No distress, calm',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent'],
        interventions: [],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 97,
        findings: ['Clear bilateral air entry', 'No respiratory distress'],
        interventions: [],
        auscultation: ['Clear air entry bilaterally']
      },
      circulation: {
        pulseRate: 82,
        pulseQuality: 'Strong',
        bp: { systolic: 145, diastolic: 85 },
        capillaryRefill: 2,
        skin: 'Warm, dry, pink',
        findings: ['No signs of shock', 'Regular rhythm'],
        interventions: [],
        ecgFindings: ['Normal sinus rhythm', 'No ST changes']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['No neurological deficits'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['No obvious signs of distress'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['No JVD'],
      chest: ['Equal expansion', 'Heart sounds normal'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['No edema'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Aspirin', dose: '81mg', frequency: 'Daily', indication: 'Cardiac' },
        { name: 'Atenolol', dose: '50mg', frequency: 'Daily', indication: 'Blood pressure' }
      ],
      allergies: ['Penicillin'],
      medicalConditions: ['Hypertension', 'Hyperlipidemia', 'History of angina'],
      surgicalHistory: ['Coronary stent placement - 3 years ago'],
      lastMeal: 'Light lunch 1 hour ago',
      eventsLeading: 'Developed chest pressure while walking in mall, sat down to rest, pain improved'
    },
    vitalSignsProgression: {
      initial: { bp: '145/85', pulse: 82, respiration: 18, spo2: 97, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Chest pain improved with rest', 'No acute distress', 'Vital signs stable'],
      redFlags: ['History of cardiac disease', 'Chest pain always needs assessment'],
      differentialDiagnoses: ['Stable angina', 'Unstable angina', 'GERD', 'Musculoskeletal pain'],
      mostLikelyDiagnosis: 'Stable Angina'
    },
    managementPathway: {
      immediate: [
        'Obtain 12-lead ECG — within 10 minutes of arrival',
        'Measure vital signs including blood pressure bilaterally',
        'Detailed chest pain history using SOCRATES',
        'Aspirin 300mg PO (crushed/chewed) if not already on daily aspirin and no contraindication',
        'GTN spray 400mcg sublingual if SBP >90 mmHg and no PDE5 inhibitor use in last 48 hours',
        'IV access if pain persists or ECG changes present',
        'Check blood glucose'
      ],
      definitive: [
        'Hospital evaluation for serial troponins and risk stratification',
        'Repeat ECG at 15 minutes to detect evolving changes',
        'Cardiology follow-up for optimisation of anti-anginal therapy'
      ],
      monitoring: [
        'Continuous ECG monitoring',
        'SpO2 and BP every 5 minutes',
        'Reassess pain score after each intervention'
      ],
      transportConsiderations: [
        'Transport to facility with chest pain assessment unit — American Hospital Dubai or Dubai Hospital',
        'Do not delay transport waiting for pain relief',
        'Pre-alert if ECG changes or haemodynamic instability develop en route'
      ]
    },
    studentChecklist: [
      { id: 'c5-1', category: 'history', description: 'Characterize chest pain (SOCRATES)', points: 15, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic', 'intermediate'], critical: true },
      { id: 'c5-2', category: 'abcde', description: 'Assess vital signs including blood pressure', points: 10, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic', 'intermediate'], critical: true },
      { id: 'c5-3', category: 'intervention', description: 'Obtain 12-lead ECG if available', points: 15, yearLevel: ['2nd-year', '3rd-year', 'diploma'], complexity: ['basic', 'intermediate'] },
      { id: 'c5-4', category: 'history', description: 'Ask about cardiac history and medications', points: 10, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic', 'intermediate'], critical: true },
      { id: 'c5-5', category: 'communication', description: 'Reassure patient while assessing', points: 5, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'c5-6', category: 'intervention', description: 'Administer aspirin if not contraindicated', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'c5-7', category: 'communication', description: 'Transport to hospital for evaluation', points: 10, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic', 'intermediate'] }
    ],
    teachingPoints: [
      'Stable angina: Chest pain precipitated by exertion, relieved by rest or nitroglycerin',
      'Characteristics: Pressure/squeezing, substernal, may radiate to arms/jaw',
      'All chest pain patients require 12-lead ECG and hospital evaluation',
      'Risk factors: Age, male, hypertension, hyperlipidemia, smoking, diabetes, family history',
      'Aspirin 300mg chewed is standard for suspected cardiac chest pain unless contraindicated',
      'Nitroglycerin can be given if BP is adequate (SBP > 90 mmHg)'
    ],
    commonPitfalls: [
      'Dismissing chest pain as "just angina" without full assessment - always evaluate thoroughly',
      'Not obtaining ECG - all chest pain requires 12-lead ECG regardless of severity',
      'Forgetting to ask about medications that may affect presentation',
      'Not checking for contraindications to nitroglycerin (PDE5 inhibitors, low BP)',
      'Failing to recognize unstable angina - pain at rest is concerning',
      'Not asking about risk factors and cardiac history',
      'Delaying transport waiting for pain relief',
      'Poor documentation of pain characteristics and timing'
    ],
    equipmentNeeded: [
      '12-lead ECG machine',
      'Blood pressure monitor',
      'Pulse oximeter',
      'Aspirin 300mg chewable',
      'Nitroglycerin spray or sublingual tablets',
      'IV cannulation kit (18G)',
      'Normal saline 0.9% 500ml bags',
      'Transport stretcher with monitoring',
      'Defibrillator/monitor (backup)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Acute Coronary Syndrome Protocol v4.2',
        'DCAS Chest Pain Assessment Guidelines',
        'ESC Guidelines on Cardiovascular Disease Prevention'
      ],
      receivingFacilities: [
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['24/7 Cardiac Unit', 'Chest Pain Center'],
          contact: '04 377 5500',
          distance: '15 minutes from major malls'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Emergency Department', 'Cardiology Consultation'],
          contact: '04 222 1211',
          distance: '20 minutes'
        },
        {
          name: 'Rashid Hospital',
          location: 'Bur Dubai',
          capabilities: ['Emergency Department', 'Cardiac Catheterization'],
          contact: '04 219 3000',
          distance: '25 minutes'
        }
      ],
      localConsiderations: [
        'Dubai malls can be crowded - allow extra time for scene access',
        'Security guards are trained in basic first aid - may have already assisted patient',
        'Many malls have AEDs - security may have used them',
        'Cultural consideration: Elderly male patients may prefer male providers',
        'Mall locations require coordination with security for ambulance access',
        'Document exact location within mall for receiving hospital communication',
        'Air-conditioning in malls can be cold - provide blanket for patient comfort',
        'Peak shopping times (weekends, evenings) mean heavy foot traffic',
        'Some malls have medical clinics - patient may have already been assessed',
        'Transport to nearest appropriate facility - avoid long transfers for stable patients'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-angina-ecg',
          type: 'image',
          title: 'Stable Angina vs ACS ECG Changes',
          url: 'https://radiopaedia.org/cases/normal-ecg',
          source: 'Radiopaedia',
          caption: 'ECG differences between stable angina and acute coronary syndrome',
          relevance: 'essential',
          tags: ['angina', 'ECG', 'ACS', 'chest-pain']
        }
      ],
      videos: [
        {
          id: 'vid-chest-pain-assessment',
          type: 'video',
          title: 'Chest Pain Assessment in Prehospital Care',
          url: 'https://www.youtube.com/watch?v=uqNQvKxAiuo',
          source: 'Armando Hasudungan',
          caption: 'Comprehensive approach to chest pain assessment and initial management',
          duration: '16:30',
          relevance: 'essential',
          tags: ['chest-pain', 'assessment', 'prehospital', 'cardiac']
        },
        {
          id: 'vid-angina-vs-acs',
          type: 'video',
          title: 'Differentiating Stable Angina from ACS',
          url: 'https://www.youtube.com/watch?v=D2ZpsgfhQUU',
          source: 'MedCram',
          caption: 'Clinical features that distinguish stable angina from acute coronary syndrome',
          duration: '12:45',
          relevance: 'important',
          tags: ['angina', 'ACS', 'differentiation', 'cardiac']
        }
      ],
      articles: [
        {
          id: 'art-stable-angina',
          type: 'article',
          title: 'Stable Angina: Diagnosis and Management',
          url: 'https://www.nice.org.uk/guidance/cg126',
          source: 'NICE',
          caption: 'UK national guideline on stable angina management',
          relevance: 'essential',
          tags: ['angina', 'stable', 'NICE', 'guidelines']
        },
        {
          id: 'art-angina-aha',
          type: 'article',
          title: 'AHA Guidelines on Chronic Coronary Disease',
          url: 'https://www.heart.org/en/health-topics/heart-attack/angina-chest-pain',
          source: 'American Heart Association',
          caption: 'AHA guidance on angina diagnosis, risk stratification and treatment',
          relevance: 'important',
          tags: ['angina', 'AHA', 'chronic-coronary', 'management']
        },
        {
          id: 'art-chest-pain-hearts',
          type: 'article',
          title: 'HEARTS Score for Chest Pain Risk Stratification',
          url: 'https://www.mdcalc.com/heart-score-major-cardiac-events',
          source: 'MDCalc',
          caption: 'Risk stratification tool for chest pain patients in emergency settings',
          relevance: 'important',
          tags: ['chest-pain', 'HEARTS-score', 'risk-stratification']
        }
      ]
    }
  }),

  // CARDIAC CASE 006 - Supraventricular Tachycardia (SVT)
  createCase({
    id: 'cardiac-006',
    title: 'Supraventricular Tachycardia (SVT) - Young Adult',
    category: 'cardiac',
    subcategory: 'svt',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Heart racing, feels like going to pass out',
      timeOfDay: 'evening',
      location: 'Apartment in Dubai Marina',
      callerInfo: 'Patient (28-year-old female)',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Episodes before', 'Drinking coffee when started']
    },
    patientInfo: {
      age: 28,
      gender: 'female',
      weight: 55,
      occupation: 'Marketing executive',
      language: 'English, Hindi',
      culturalConsiderations: ['Prefers female provider if possible']
    },
    sceneInfo: {
      description: 'Modern apartment, patient sitting on sofa',
      hazards: [],
      bystanders: 'Roommate present, anxious',
      environment: 'Air-conditioned',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Young female, anxious but stable',
      position: 'Sitting up, leaning forward',
      appearance: 'Mildly diaphoretic',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent'],
        interventions: [],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Tachypneic but not distressed', 'Clear lungs'],
        interventions: [],
        auscultation: ['Clear air entry bilaterally']
      },
      circulation: {
        pulseRate: 185,
        pulseQuality: 'Strong, regular',
        bp: { systolic: 110, diastolic: 70 },
        capillaryRefill: 2,
        skin: 'Warm, slightly pale',
        findings: ['Tachycardic, regular rhythm', 'No signs of shock'],
        interventions: ['IV access', 'Cardiac monitor'],
        ecgFindings: ['Narrow complex tachycardia', 'Rate ~185', 'Regular rhythm', 'No P waves visible']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Mild lightheadedness reported'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['No rash'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['No JVD'],
      chest: ['Clear lungs bilaterally'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['No edema'],
      posterior: ['Normal'],
      neurological: ['Normal except mild dizziness']
    },
    history: {
      medications: [
        { name: 'Birth control pills', dose: 'Daily', frequency: 'Daily', indication: 'Contraception' }
      ],
      allergies: ['None'],
      medicalConditions: ['History of SVT - 2 previous episodes'],
      surgicalHistory: ['None'],
      lastMeal: 'Coffee and pastry 2 hours ago',
      eventsLeading: 'Was drinking coffee at work when heart started racing, felt lightheaded, came home and called ambulance'
    },
    vitalSignsProgression: {
      initial: { bp: '110/70', pulse: 185, respiration: 22, spo2: 98, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Narrow complex tachycardia ~185 bpm', 'Regular rhythm', 'Hemodynamically stable', 'History of SVT'],
      redFlags: ['Pulse >180, needs vagal maneuvers or treatment', 'Young adult with SVT - common presentation'],
      differentialDiagnoses: ['SVT (AVNRT most likely)', 'Atrial flutter with 2:1 block', 'Atrial tachycardia', 'Sinus tachycardia'],
      mostLikelyDiagnosis: 'Supraventricular Tachycardia (SVT)'
    },
    managementPathway: {
      immediate: [
        'Assess haemodynamic stability — BP, GCS, chest pain',
        'Obtain 12-lead ECG to confirm narrow complex tachycardia',
        'IV access (18G antecubital fossa)',
        'If STABLE: Modified Valsalva manoeuvre — strain for 15 seconds supine, then raise legs to 45° for 15 seconds',
        'If vagal fails: Adenosine 6mg rapid IV push with 20mL NS flush, monitor rhythm continuously',
        'If no conversion after 1-2 minutes: Adenosine 12mg rapid IV push',
        'If UNSTABLE (SBP <90, chest pain, GCS <14): Synchronized cardioversion 50-100J biphasic with sedation'
      ],
      definitive: [
        'Hospital admission for observation and electrophysiology review',
        'Consider EP study and ablation for recurrent SVT',
        'Identify and avoid triggers (caffeine, stress, alcohol)'
      ],
      monitoring: [
        'Continuous ECG monitoring throughout adenosine administration',
        'BP and SpO2 continuous',
        'Document rhythm before, during and after each intervention',
        'Monitor for reversion to SR or deterioration'
      ],
      transportConsiderations: [
        'Transport to cardiac monitoring capable facility — American Hospital or Al Zahra Hospital',
        'Pre-alert with rate, rhythm, haemodynamic status, and interventions performed',
        'Continuous monitoring — SVT can recur after successful cardioversion'
      ]
    },
    studentChecklist: [
      { id: 'c6-1', category: 'abcde', description: 'Assess hemodynamic stability (BP, level of consciousness)', points: 20, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c6-2', category: 'intervention', description: 'Obtain 12-lead ECG', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'c6-3', category: 'history', description: 'Ask about previous SVT episodes and triggers', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate'] },
      { id: 'c6-4', category: 'intervention', description: 'Attempt vagal maneuvers (modified Valsalva)', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'c6-5', category: 'intervention', description: 'Consider adenosine if vagal maneuvers fail (6mg, 12mg)', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c6-6', category: 'communication', description: 'Reassure patient - SVT is rarely life-threatening if stable', points: 5, yearLevel: ['2nd-year', '3rd-year', 'diploma'], complexity: ['basic', 'intermediate'] }
    ],
    teachingPoints: [
      'SVT typically presents with narrow complex tachycardia (>140 bpm), regular rhythm',
      'AVNRT is most common mechanism in young healthy adults',
      'Vagal maneuvers: Modified Valsalva (forceful blowing against resistance for 15 sec then supine with legs elevated) has 40% success rate',
      'Adenosine: 6mg rapid IV push followed by 20ml saline flush, if no response 12mg, then another 12mg',
      'Contraindications to adenosine: Asthma, heart transplant, 2nd/3rd degree heart block, sick sinus',
      'Unstable SVT (hypotension, chest pain, altered mental status) requires immediate synchronized cardioversion'
    ],
    commonPitfalls: [
      'Not recognizing narrow vs wide complex tachycardia - ECG essential',
      'Attempting vagal maneuvers without explaining to patient - causes anxiety',
      'Giving adenosine slowly (must be rapid IV push with immediate flush)',
      'Forgetting to warn patient about transient "feeling of impending doom" with adenosine',
      'Not having IV access ready before administering adenosine - causes delay',
      'Not assessing hemodynamic stability first - unstable patients need cardioversion',
      'Attempting carotid sinus massage without ruling out carotid bruit/stenosis',
      'Not monitoring for bradycardia/asystole after adenosine',
      'Confusing SVT with atrial flutter - atrial flutter may require different treatment',
      'Not preparing for potential deterioration - always have resuscitation equipment ready'
    ],
    equipmentNeeded: [
      '12-lead ECG machine',
      'Cardiac monitor/defibrillator',
      'IV cannulation kit (18G)',
      'Adenosine 6mg/2ml ampoules',
      'Normal saline 0.9% 500ml bags',
      '20ml syringes for rapid flush',
      'Oxygen with nasal cannula',
      'Blood pressure monitor',
      'Suction equipment',
      'Transport stretcher with monitoring'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Tachyarrhythmia Management Protocol v3.1',
        'DCAS Adenosine Administration Guidelines',
        'ACC/AHA Guidelines for Supraventricular Arrhythmias'
      ],
      receivingFacilities: [
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Electrophysiology Services', 'Cardiology Unit'],
          contact: '04 435 9999',
          distance: '20 minutes from Dubai Marina'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha',
          capabilities: ['24/7 Cardiac Unit', 'Arrhythmia Management'],
          contact: '04 377 5500',
          distance: '25 minutes'
        },
        {
          name: 'Rashid Hospital',
          location: 'Bur Dubai',
          capabilities: ['Emergency Department', 'Cardiology Consultation'],
          contact: '04 219 3000',
          distance: '30 minutes'
        }
      ],
      localConsiderations: [
        'Dubai Marina apartments have good elevator access - bring all equipment',
        'Young professionals common in Dubai Marina - SVT often first presentation',
        'Stress and caffeine common triggers in busy professionals',
        'Many residents are expats - may not have established cardiac care',
        'Cultural consideration: Female patients may prefer female providers',
        'Language diversity in Dubai Marina - English widely spoken but confirm understanding',
        'Document episode frequency - helps receiving hospital with management plan',
        'Transport to facility with electrophysiology if recurrent SVT',
        'Consider referral for ablation therapy if recurrent episodes',
        'Educate patient about trigger avoidance (caffeine, stress, alcohol)'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-svt-ecg',
          type: 'image',
          title: 'SVT on 12-Lead ECG',
          url: 'https://radiopaedia.org/cases/supraventricular-tachycardia-ecg',
          source: 'Radiopaedia',
          caption: 'Narrow complex tachycardia with regular rhythm and rate ~180 bpm',
          relevance: 'essential',
          tags: ['SVT', 'ECG', 'tachycardia', 'arrhythmia']
        }
      ],
      videos: [
        {
          id: 'vid-svt-management',
          type: 'video',
          title: 'SVT Management: From Vagal Maneuvers to Adenosine',
          url: 'https://www.youtube.com/watch?v=8fpJXPSC7w8',
          source: 'Larry B. Mellick, MD',
          caption: 'Step-by-step management of stable SVT in prehospital setting',
          duration: '14:20',
          relevance: 'essential',
          tags: ['SVT', 'vagal-maneuvers', 'adenosine', 'management']
        },
        {
          id: 'vid-valsalva-modified',
          type: 'video',
          title: 'Modified Valsalva Maneuver for SVT',
          url: 'https://www.youtube.com/watch?v=8DIRiOA_OsA',
          source: 'The Lancet',
          caption: 'Proper technique for modified Valsalva maneuver showing positioning',
          duration: '5:30',
          relevance: 'essential',
          tags: ['SVT', 'vagal-maneuvers', 'valsalva', 'technique']
        }
      ],
      articles: [
        {
          id: 'art-svt-wikem',
          type: 'article',
          title: 'Supraventricular Tachycardia (SVT)',
          url: 'https://wikem.org/wiki/Supraventricular_tachycardia',
          source: 'WikEM',
          caption: 'Quick reference for SVT diagnosis and emergency management',
          relevance: 'essential',
          tags: ['SVT', 'tachycardia', 'WikEM', 'ECG']
        },
        {
          id: 'art-svt-emcrit',
          type: 'article',
          title: 'SVT Management in Emergency Medicine',
          url: 'https://emcrit.org/ibcc/svt/',
          source: 'EMCrit',
          caption: 'Evidence-based approach to SVT management including adenosine and vagal maneuvers',
          relevance: 'important',
          tags: ['SVT', 'EMCrit', 'management', 'adenosine']
        },
        {
          id: 'art-revert-trial',
          type: 'article',
          title: 'REVERT Trial: Modified Valsalva Maneuver',
          url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1514072',
          source: 'New England Journal of Medicine',
          caption: 'Landmark study showing effectiveness of modified Valsalva',
          relevance: 'important',
          tags: ['SVT', 'valsalva', 'evidence', 'trial']
        }
      ]
    }
  }),

  // CARDIAC CASE 007 - Inferior STEMI (Advanced)
  createCase({
    id: 'cardiac-007',
    title: 'Acute Inferior STEMI with Right Ventricular Involvement',
    category: 'cardiac',
    subcategory: 'stem-inferior',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Severe chest pain, sweating, vomiting',
      timeOfDay: 'early-morning',
      location: 'Hotel room in Downtown Dubai',
      callerInfo: 'Hotel reception (guest called front desk)',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Guest from overseas', 'Language barrier possible']
    },
    patientInfo: {
      age: 58,
      gender: 'male',
      weight: 90,
      occupation: 'Business traveler',
      language: 'Russian, limited English',
      culturalConsiderations: ['May be stoic about pain', 'Interpreter may be needed']
    },
    sceneInfo: {
      description: 'Hotel room, patient lying in bed',
      hazards: [],
      bystanders: 'Hotel receptionist',
      environment: 'Air-conditioned hotel room',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/hotel-room-medical-uae.png',
      sceneImageCaption: 'Scene — Air-conditioned hotel room',
      accessIssues: ['Need key card access'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, visibly distressed, diaphoretic',
      position: 'Lying in bed, clutching chest',
      appearance: 'Pale, diaphoretic, nauseated',
      consciousness: 'Alert but uncomfortable'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Gagging/vomiting sounds'],
        interventions: ['Position on side', 'Emesis basin ready'],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 26,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 94,
        findings: ['Tachypneic', 'Clear bilateral air entry'],
        interventions: ['High-flow oxygen if SpO2 <94%'],
        auscultation: ['Clear air entry bilaterally']
      },
      circulation: {
        pulseRate: 58,
        pulseQuality: 'Weak',
        bp: { systolic: 85, diastolic: 55 },
        capillaryRefill: 4,
        skin: 'Pale, cool, diaphoretic',
        findings: ['Bradycardic', 'Hypotensive', 'Signs of shock', 'JVD present'],
        interventions: ['IV access x2', 'Aspirin 300mg chewed', 'ECG - Right-sided leads (V4R)'],
        ecgFindings: ['ST elevation II, III, aVF', 'Reciprocal ST depression in I, aVL', 'ST depression V1-V3 (posterior extension)', 'ST elevation greater in III than II = RCA', 'Right-sided ECG shows V4R elevation = RV infarction']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious, nauseated'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Diaphoresis', 'Pale'],
        interventions: ['Keep warm']
      }
    },
    secondarySurvey: {
      head: ['Diaphoretic', 'No trauma'],
      neck: ['JVD present', 'Trachea central'],
      chest: ['Clear lungs', 'Heart sounds present — possible S3/S4 from RV strain'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['Cool extremities'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Unknown', dose: 'Unknown', frequency: 'Unknown', indication: 'Unknown' }
      ],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown - no medical history available'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Dinner 6 hours ago, vomited once',
      eventsLeading: 'Woke up with severe chest pain, nausea, sweating. Called hotel desk who called ambulance'
    },
    vitalSignsProgression: {
      initial: { bp: '85/55', pulse: 58, respiration: 26, spo2: 94, gcs: 14, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Inferior STEMI (II, III, aVF ST elevation)', 'Hypotension, bradycardia', 'Right ventricular infarction suspected', 'CRITICAL: Preload dependent - avoid nitrates!'],
      redFlags: ['Vomiting with inferior MI = large infarct', 'Hypotension with bradycardia = RV infarction', 'NO NITRATES in RV infarction!'],
      differentialDiagnoses: ['Inferior STEMI with RV infarction', 'Inferior STEMI without RV involvement', 'Pericarditis', 'Peptic ulcer disease'],
      mostLikelyDiagnosis: 'Acute Inferior STEMI with Right Ventricular Infarction'
    },
    managementPathway: {
      immediate: [
        '12-lead ECG immediately — identify inferior STE (II, III, aVF)',
        'Right-sided ECG (V4R) — confirm RV infarction',
        'DO NOT give nitrates — absolute contraindication in RV infarction',
        'Keep patient SUPINE — do not sit up (preload dependent)',
        'AVOID morphine / use fentanyl or very small titrated morphine (1-2mg) — morphine venodilates and can precipitate catastrophic hypotension in preload-dependent RV infarct; analgesia only if BP stable, reassess after each dose',
        'Titrate oxygen to SpO2 94-98% (supplement only if <94%)',
        'IV access x2 (14-16G)',
        'Aspirin 300mg PO (crushed/chewed)',
        'Cautious IV fluid bolus 250mL NS titrated to BP — RV needs preload but avoid overload',
        'Atropine 0.5-1mg IV for symptomatic bradycardia',
        'Pre-alert cardiac centre — STEMI code with RV involvement'
      ],
      definitive: [
        'Emergency PCI at cardiac catheterisation lab — target door-to-balloon <90 minutes',
        'Rashid Hospital or American Hospital Dubai for 24/7 PCI capability',
        'Prepare for AV block — have transcutaneous pacing pads applied'
      ],
      monitoring: [
        'Continuous ECG — watch for progression to complete heart block',
        'BP every 3 minutes — hypotension may worsen rapidly',
        'SpO2 continuous',
        'Repeat ECG if clinical change'
      ],
      transportConsiderations: [
        'Keep supine throughout transport — NO sitting position',
        'Pre-alert Rashid Hospital STEMI code with RVI confirmed on V4R',
        'Prepare transcutaneous pacing in case of complete heart block en route',
        'Rapid transport — do not delay on scene beyond essential interventions'
      ]
    },
    studentChecklist: [
      { id: 'c7-1', category: 'abcde', description: 'Recognize inferior STEMI pattern (II, III, aVF)', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'c7-2', category: 'abcde', description: 'Check ST elevation greater in III than II = RCA occlusion', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c7-3', category: 'intervention', description: 'Obtain right-sided ECG (V4R) for RV involvement', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'c7-4', category: 'intervention', description: 'DO NOT give nitrates in RV infarction (preload dependent)', points: 25, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'c7-5', category: 'intervention', description: 'Aspirin 300mg chewed immediately', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c7-6', category: 'intervention', description: 'Cautious fluid bolus for hypotension (RV infarction)', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c7-7', category: 'communication', description: 'Pre-alert receiving hospital of STEMI', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true }
    ],
    teachingPoints: [
      'Inferior STEMI: ST elevation in leads II, III, aVF',
      'If ST elevation greater in III than II = RCA occlusion (if greater in II = circumflex)',
      'RCA occlusion often involves right ventricle - obtain right-sided ECG (V4R)',
      'RV infarction is preload dependent - AVOID nitrates and diuretics!',
      'Hypotension in RV infarction: Cautious fluid bolus 250-500ml, may need repeat',
      'Right-sided ECG: Place V4 lead on right side of chest at same position as V4',
      'Inferior MI with RV involvement: Bradycardia (AV block) common, may need atropine or pacing'
    ],
    commonPitfalls: [
      'Giving nitrates to inferior MI patient without checking for RV involvement - can cause catastrophic hypotension',
      'Not obtaining right-sided ECG in inferior STEMI - misses RV infarction diagnosis',
      'Missing the significance of ST elevation greater in III than II - indicates RCA occlusion',
      'Aggressively treating hypotension without recognizing RV infarction - needs fluids not pressors initially',
      'Not pre-alerting hospital for STEMI patient - delays reperfusion therapy',
      'Forgetting that inferior MI can present with GI symptoms (nausea, vomiting)',
      'Not recognizing that bradycardia is common in inferior MI due to RCA supplying AV node',
      'Delaying aspirin administration - should be given immediately',
      'Not monitoring for complete heart block - may need pacing',
      'Failing to document right-sided ECG findings'
    ],
    equipmentNeeded: [
      '12-lead ECG machine with capability for right-sided leads',
      'ECG electrodes for right-sided placement (V4R)',
      'IV cannulation kit (14G or 16G) x2',
      'Aspirin 300mg chewable',
      'Atropine 1mg ampoules (for bradycardia)',
      'Normal saline 0.9% 1000ml bags',
      'Blood pressure monitor',
      'Cardiac monitor/defibrillator',
      'Oxygen with high-flow mask',
      'Emesis basin and suction',
      'Transport stretcher with Trendelenburg capability',
      'Defibrillation pads (in case of deterioration)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Acute Coronary Syndrome Protocol v4.2',
        'DCAS Right Ventricular Infarction Management Guidelines',
        'ESC Guidelines for STEMI Management'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital',
          location: 'Bur Dubai',
          capabilities: ['24/7 Primary PCI', 'Cardiac Surgery', 'ICU'],
          contact: '04 219 3000',
          distance: '15 minutes from Downtown Dubai'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Cardiac Catheterization', 'Emergency Department'],
          contact: '04 222 1211',
          distance: '12 minutes from Downtown'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha',
          capabilities: ['24/7 PCI', 'Cardiac ICU'],
          contact: '04 377 5500',
          distance: '18 minutes'
        }
      ],
      localConsiderations: [
        'Downtown Dubai hotels - many international tourists, language barriers common',
        'Hotel staff can assist with access and language interpretation',
        'Tourists may not have travel insurance information readily available',
        'Document passport/nationality for hospital admission purposes',
        'Dubai has excellent cardiac facilities - emphasize rapid transport',
        'Many hotels have AEDs and trained staff - check if used',
        'Cultural sensitivity: Some nationalities prefer same-gender providers',
        'Jet lag and travel stress can precipitate cardiac events',
        'Hotel rooms may be locked - coordinate with security',
        'Emergency contact information may be at hotel reception'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-inferior-stemi',
          type: 'image',
          title: 'Inferior STEMI with RV Infarction',
          url: 'https://radiopaedia.org/cases/inferior-stemi-ecg',
          source: 'Radiopaedia',
          caption: 'ST elevation in II, III, aVF with right-sided lead showing RV involvement',
          relevance: 'essential',
          tags: ['inferior-STEMI', 'RV-infarction', 'ECG', 'right-sided-leads']
        }
      ],
      videos: [
        {
          id: 'vid-inferior-stemi-rv',
          type: 'video',
          title: 'Inferior STEMI and Right Ventricular Infarction',
          url: 'https://www.youtube.com/watch?v=uqNQvKxAiuo',
          source: 'Armando Hasudungan',
          caption: 'Recognition and critical management differences in inferior MI with RV involvement',
          duration: '13:45',
          relevance: 'essential',
          tags: ['inferior-STEMI', 'RV-infarction', 'ECG', 'management']
        },
        {
          id: 'vid-right-sided-ecg',
          type: 'video',
          title: 'How to Perform Right-Sided ECG',
          url: 'https://www.youtube.com/watch?v=D2ZpsgfhQUU',
          source: 'MedCram',
          caption: 'Proper technique for obtaining right-sided ECG leads including V4R',
          duration: '8:20',
          relevance: 'essential',
          tags: ['ECG', 'right-sided', 'V4R', 'technique']
        }
      ],
      articles: [
        {
          id: 'art-inferior-stemi',
          type: 'article',
          title: 'Inferior STEMI and Right Ventricular Infarction',
          url: 'https://emcrit.org/ibcc/stemi/',
          source: 'EMCrit',
          caption: 'Evidence-based guide to recognition and management of inferior MI with RV involvement',
          relevance: 'essential',
          tags: ['inferior-STEMI', 'RV-infarction', 'EMCrit', 'management']
        },
        {
          id: 'art-inferior-stemi-aha',
          type: 'article',
          title: 'AHA STEMI Guidelines - Focus on Inferior MI',
          url: 'https://www.heart.org/en/health-topics/heart-attack/about-heart-attacks/silent-ischemia-and-ischemic-heart-disease',
          source: 'American Heart Association',
          caption: 'AHA guidance on STEMI management including inferior and right ventricular involvement',
          relevance: 'important',
          tags: ['inferior-STEMI', 'AHA', 'guidelines', 'RV-infarction']
        },
        {
          id: 'art-rv-infarction',
          type: 'article',
          title: 'Right Ventricular Infarction - Why Nitrates are Contraindicated',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3222833/',
          source: 'Journal of Cardiology',
          caption: 'Pathophysiology of RV infarction and rationale for avoiding nitrates',
          relevance: 'important',
          tags: ['RV-infarction', 'nitrates', 'contraindications', 'pathophysiology']
        }
      ]
    }
  }),

  // CARDIAC CASE 008 - Left Bundle Branch Block with Chest Pain
  createCase({
    id: 'cardiac-008',
    title: 'Chest Pain with Known LBBB - Possible Occlusion MI',
    category: 'cardiac',
    subcategory: 'lbbb-stemi',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Chest pain, shortness of breath',
      timeOfDay: 'evening',
      location: 'Apartment in Sharjah',
      callerInfo: 'Wife of patient',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient has heart condition', 'Uses oxygen at home']
    },
    patientInfo: {
      age: 72,
      gender: 'male',
      weight: 75,
      occupation: 'Retired engineer',
      language: 'Arabic, limited English',
      culturalConsiderations: ['Family very involved in care']
    },
    sceneInfo: {
      description: 'Apartment, patient in armchair with oxygen',
      hazards: ['Oxygen cylinder nearby'],
      bystanders: 'Wife and daughter present',
      environment: 'Well-maintained home',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Elderly male, respiratory distress, clutching chest',
      position: 'Sitting forward in armchair',
      appearance: 'Anxious, diaphoretic, using accessory muscles',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent'],
        interventions: ['Keep in upright position'],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Shallow',
        spo2: 91,
        findings: ['Tachypneic', 'Bilateral crackles at bases'],
        interventions: ['High-flow oxygen 15L/min', 'Assisted ventilation if needed'],
        auscultation: ['Crackles at both bases', 'Decreased air entry at bases']
      },
      circulation: {
        pulseRate: 105,
        pulseQuality: 'Thready',
        bp: { systolic: 95, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Pale, cool, diaphoretic',
        findings: ['Tachycardic', 'Hypotensive', 'Signs of heart failure'],
        interventions: ['IV access x2', 'Aspirin 300mg', 'Nitrates if BP permits'],
        ecgFindings: ['LBBB pattern', 'Wide QRS >120ms', 'Concordant ST elevation in V5-V6', 'Concordant ST depression in V1-V3', 'Sgarbossa criteria positive']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious but oriented'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Ankle edema', 'JVD present'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Diaphoretic'],
      neck: ['JVD present'],
      chest: ['Bibasilar crackles'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['Bilateral pitting oedema to ankles', 'Cool extremities'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Furosemide', dose: '40mg', frequency: 'Daily', indication: 'Heart failure' },
        { name: 'Aspirin', dose: '81mg', frequency: 'Daily', indication: 'Cardiac' },
        { name: 'ACE inhibitor', dose: 'Unknown', frequency: 'Daily', indication: 'Heart failure' }
      ],
      allergies: ['None known'],
      medicalConditions: ['Ischemic cardiomyopathy', 'Heart failure (EF 35%)', 'Known LBBB', 'Diabetes type 2'],
      surgicalHistory: ['Coronary artery bypass graft - 5 years ago'],
      lastMeal: 'Light dinner 4 hours ago',
      eventsLeading: 'Chest pain started 1 hour ago, similar to previous heart attack, took nitro without relief'
    },
    vitalSignsProgression: {
      initial: { bp: '95/60', pulse: 105, respiration: 28, spo2: 91, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['LBBB with chest pain', 'Sgarbossa criteria positive', 'Acute heart failure', 'Possible MI'],
      redFlags: ['New or presumed new LBBB with chest pain = STEMI equivalent', 'Sgarbossa criteria = MI until proven otherwise', 'Patient has cardiac history'],
      differentialDiagnoses: ['MI with LBBB (Sgarbossa positive)', 'Acute heart failure', 'Pulmonary embolism', 'Unstable angina'],
      mostLikelyDiagnosis: 'Myocardial Infarction with LBBB (Sgarbossa Criteria Positive)'
    },
    managementPathway: {
      immediate: [
        '12-lead ECG immediately — identify LBBB pattern (wide QRS, dominant S in V1, broad R in V5-V6)',
        'Apply Sgarbossa criteria to assess for MI: concordant ST elevation ≥1mm, concordant ST depression V1-V3, or excessively discordant STE ≥5mm',
        'Treat as STEMI equivalent if Sgarbossa positive or new/presumed new LBBB with chest pain',
        'High-flow oxygen 15L/min if SpO2 <94%',
        'IV access x2 (14-16G)',
        'Aspirin 300mg PO',
        'GTN only if SBP >90 mmHg — may help acute heart failure',
        'Patient upright to assist breathing',
        'Pre-alert cardiac centre — STEMI code with LBBB and Sgarbossa status'
      ],
      definitive: [
        'Emergency PCI — treat as STEMI if criteria met',
        'Rashid Hospital or Mediclinic City Hospital for 24/7 PCI',
        'Obtain prior ECGs at hospital for comparison'
      ],
      monitoring: [
        'Continuous ECG monitoring',
        'BP every 5 minutes — haemodynamic instability indicates severity',
        'SpO2 continuous',
        'Monitor respiratory status — pulmonary oedema can worsen rapidly'
      ],
      transportConsiderations: [
        'Rapid transport to PCI-capable facility — do not transport to non-cardiac centre',
        'Pre-alert: "LBBB with Sgarbossa positive, treating as STEMI equivalent"',
        'Keep upright during transport — acute heart failure component present',
        'Have defibrillation pads applied — high risk of VF'
      ]
    },
    studentChecklist: [
      { id: 'c8-1', category: 'abcde', description: 'Recognize LBBB pattern on ECG', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c8-2', category: 'abcde', description: 'Apply Sgarbossa criteria to LBBB', points: 25, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'c8-3', category: 'intervention', description: 'Treat as STEMI if Sgarbossa criteria positive', points: 25, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'c8-4', category: 'intervention', description: 'Manage acute heart failure (oxygen, nitrates if BP permits)', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c8-5', category: 'communication', description: 'Pre-alert hospital for possible STEMI', points: 10, yearLevel: ['4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c8-6', category: 'history', description: 'Compare with prior ECG if available', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'LBBB makes STEMI diagnosis difficult - use Sgarbossa criteria',
      'Sgarbossa criteria: (1) Concordant ST elevation ≥1mm, (2) Concordant ST depression ≥1mm in V1-V3, (3) Excessively discordant ST elevation ≥5mm',
      'Modified Sgarbossa: ST elevation/S wave ratio ≥0.25 in any lead',
      'New or presumed new LBBB with chest pain = STEMI equivalent',
      'LBBB: Wide QRS >120ms, dominant S in V1, broad/notched R in V5-V6, absent Q in lateral leads',
      'If patient has known LBBB, compare with prior ECG - any changes concerning'
    ],
    commonPitfalls: [
      'Not recognizing Sgarbossa criteria in LBBB - leads to missed MI diagnosis',
      'Dismissing chest pain in patient with known LBBB as "just their baseline"',
      'Not obtaining prior ECGs for comparison - changes from baseline are key',
      'Missing concordant ST changes (same direction as QRS) - most specific sign',
      'Failing to treat as STEMI equivalent when Sgarbossa criteria positive',
      'Not managing acute heart failure - nitrates contraindicated if hypotensive',
      'Delaying transport waiting for detailed history',
      'Not pre-alerting receiving hospital about LBBB with positive Sgarbossa',
      'Forgetting that LBBB with chest pain is a STEMI equivalent until proven otherwise',
      'Inadequate documentation of ECG findings and Sgarbossa criteria'
    ],
    equipmentNeeded: [
      '12-lead ECG machine',
      'Defibrillator/monitor',
      'Oxygen with high-flow mask',
      'IV cannulation kit (18G) x2',
      'Aspirin 300mg chewable',
      'Nitroglycerin spray (if BP permits)',
      'Furosemide 40mg (for heart failure)',
      'Morphine 5mg (for pain relief if needed)',
      'Normal saline 0.9% 500ml bags',
      'Blood pressure monitor',
      'Pulse oximeter',
      'Transport stretcher with cardiac monitoring'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Acute Coronary Syndrome Protocol v4.2',
        'DCAS LBBB and Sgarbossa Criteria Guidelines',
        'AHA/ACC Guidelines for Management of STEMI'
      ],
      receivingFacilities: [
        {
          name: 'Al Zahra Hospital Sharjah',
          location: 'Sharjah',
          capabilities: ['24/7 Emergency Department', 'Cardiology Unit', 'ICU'],
          contact: '06 561 3333',
          distance: '10 minutes from most Sharjah locations'
        },
        {
          name: 'Kuwait Hospital',
          location: 'Sharjah',
          capabilities: ['Emergency Department', 'Cardiology Services'],
          contact: '06 543 1111',
          distance: '15 minutes'
        },
        {
          name: 'University Hospital Sharjah',
          location: 'Sharjah University City',
          capabilities: ['Emergency Department', 'Cardiology', 'Cardiac Catheterization'],
          contact: '06 505 8555',
          distance: '20 minutes'
        }
      ],
      localConsiderations: [
        'Sharjah apartments may have stairs only - plan for stair carry',
        'Family involvement in care decisions is culturally important in UAE',
        'Home oxygen common in elderly cardiac patients - ensure safe handling',
        'Document oxygen flow rate and patient baseline status',
        'Many elderly patients in Sharjah live with extended family',
        'Language barriers less common in Sharjah but confirm understanding',
        'Cultural sensitivity: Elderly patients command respect - involve family in decisions',
        'Traffic between Dubai and Sharjah can be heavy - plan route carefully',
        'Some patients may prefer transport to Dubai hospitals - discuss with family',
        'Document all cardiac medications carefully - polypharmacy common'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-lbbb-sgarbossa',
          type: 'image',
          title: 'LBBB with Sgarbossa Criteria Positive',
          url: 'https://radiopaedia.org/cases/left-bundle-branch-block-ecg',
          source: 'Radiopaedia',
          caption: 'LBBB pattern with concordant ST elevation indicating acute MI',
          relevance: 'essential',
          tags: ['LBBB', 'Sgarbossa', 'ECG', 'STEMI']
        }
      ],
      videos: [
        {
          id: 'vid-lbbb-sgarbossa',
          type: 'video',
          title: 'Sgarbossa Criteria in LBBB - Identifying Occlusion MI',
          url: 'https://www.youtube.com/watch?v=uqNQvKxAiuo',
          source: 'Armando Hasudungan',
          caption: 'How to identify STEMI in the presence of LBBB using Sgarbossa criteria',
          duration: '11:30',
          relevance: 'essential',
          tags: ['LBBB', 'Sgarbossa', 'STEMI', 'ECG']
        },
        {
          id: 'vid-modified-sgarbossa',
          type: 'video',
          title: 'Modified Sgarbossa Criteria',
          url: 'https://www.youtube.com/watch?v=D2ZpsgfhQUU',
          source: 'MedCram',
          caption: 'Updated Sgarbossa criteria using ST/S ratio',
          duration: '9:15',
          relevance: 'important',
          tags: ['Sgarbossa', 'modified', 'LBBB', 'criteria']
        }
      ],
      articles: [
        {
          id: 'art-sgarbossa',
          type: 'article',
          title: 'Sgarbossa Criteria for STEMI in LBBB',
          url: 'https://litfl.com/sgarbossa-criteria/',
          source: 'Life in the Fast Lane',
          caption: 'Complete guide to Sgarbossa criteria and modified Sgarbossa',
          relevance: 'essential',
          tags: ['Sgarbossa', 'LBBB', 'STEMI', 'ECG']
        },
        {
          id: 'art-lbbb-ecg',
          type: 'article',
          title: 'Left Bundle Branch Block - Significance and Management',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK482167/',
          source: 'StatPearls',
          caption: 'Recognition of LBBB pattern and clinical significance in MI',
          relevance: 'essential',
          tags: ['LBBB', 'ECG', 'StatPearls', 'bundle-branch-block']
        }
      ]
    }
  }),

  // CARDIAC CASE 009 - Atrial Flutter with 2:1 Block
  createCase({
    id: 'cardiac-009',
    title: 'Atrial Flutter with 2:1 Block - Elderly Patient',
    category: 'cardiac',
    subcategory: 'aflutter',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Heart racing, feeling weak',
      timeOfDay: 'morning',
      location: 'Retirement home in Dubai',
      callerInfo: 'Nurse at facility',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient has history of atrial flutter', 'BP is stable']
    },
    patientInfo: {
      age: 76,
      gender: 'female',
      weight: 60,
      occupation: 'Retired nurse',
      language: 'English',
      culturalConsiderations: ['Very knowledgeable about medical care']
    },
    sceneInfo: {
      description: 'Nursing home room, patient in bed',
      hazards: [],
      bystanders: 'Nurse present',
      environment: 'Well-equipped medical room',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Elderly female, slightly anxious but stable',
      position: 'Semi-reclined in bed',
      appearance: 'Comfortable, not in acute distress',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent'],
        interventions: [],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['No respiratory distress'],
        interventions: [],
        auscultation: ['Clear air entry bilaterally']
      },
      circulation: {
        pulseRate: 148,
        pulseQuality: 'Good',
        bp: { systolic: 135, diastolic: 80 },
        capillaryRefill: 2,
        skin: 'Warm, dry, pink',
        findings: ['Tachycardic, regular', 'No signs of shock', 'Palpitations noted'],
        interventions: ['IV access', 'Cardiac monitor'],
        ecgFindings: ['Sawtooth flutter waves', 'Atrial rate ~300', 'Ventricular rate ~150 (2:1 block)', 'Narrow complex tachycardia']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['No neurological deficits'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['No abnormal findings'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['No JVD'],
      chest: ['Clear'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['No edema'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Warfarin', dose: '5mg', frequency: 'Daily', indication: 'Anticoagulation' },
        { name: 'Diltiazem', dose: '120mg', frequency: 'Daily', indication: 'Rate control' },
        { name: 'Digoxin', dose: '0.125mg', frequency: 'Daily', indication: 'Rate control' }
      ],
      allergies: ['Sulfa'],
      medicalConditions: ['Atrial flutter', 'Hypertension', 'Previous stroke'],
      surgicalHistory: ['None'],
      lastMeal: 'Breakfast 2 hours ago',
      eventsLeading: 'Missed dose of diltiazem yesterday, heart started racing this morning'
    },
    vitalSignsProgression: {
      initial: { bp: '135/80', pulse: 148, respiration: 20, spo2: 96, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Atrial flutter with 2:1 block', 'Rate ~150', 'Hemodynamically stable', 'History of atrial flutter'],
      redFlags: ['Atrial flutter can degenerate into atrial fibrillation', 'Risk of stroke (already on warfarin)'],
      differentialDiagnoses: ['Atrial flutter with variable block', 'Atrial fibrillation with rapid response', 'SVT', 'Sinus tachycardia'],
      mostLikelyDiagnosis: 'Atrial Flutter with 2:1 Block'
    },
    managementPathway: {
      immediate: [
        'Assess haemodynamic stability — BP, GCS, chest pain',
        'Obtain 12-lead ECG — identify sawtooth flutter waves in II, III, aVF at ~300 bpm',
        'IV access (18G)',
        'If STABLE: prehospital focus is continuous monitoring, IV access, identifying precipitants. Rate-control agents (metoprolol 5mg IV or diltiazem 0.25mg/kg IV) are ED-administered — not within UK JRCALC / UAE DCAS paramedic scope. Transport under monitoring.',
        'Check anticoagulation status — warfarin INR range?',
        'Identify precipitant — missed medication dose confirmed; check electrolytes if available',
        'If UNSTABLE (SBP <90 or haemodynamic compromise): Synchronized cardioversion 50-100J biphasic'
      ],
      definitive: [
        'Hospital admission for rate or rhythm control and anticoagulation optimisation',
        'Electrophysiology review — catheter ablation has >90% cure rate for typical flutter',
        'Anticoagulation essential — stroke risk equivalent to AF'
      ],
      monitoring: [
        'Continuous ECG monitoring',
        'BP every 5-10 minutes after rate-control medications',
        'Monitor for degeneration into AF or other arrhythmias',
        'SpO2 continuous'
      ],
      transportConsiderations: [
        'Transport to facility with cardiology and electrophysiology services — Al Zahra Hospital or American Hospital Dubai',
        'Pre-alert with rate, rhythm, anticoagulation status, and current medications',
        'Continue monitoring during transport — be prepared for cardioversion if deterioration'
      ]
    },
    studentChecklist: [
      { id: 'c9-1', category: 'abcde', description: 'Identify sawtooth flutter waves on ECG', points: 20, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced'] },
      { id: 'c9-2', category: 'abcde', description: 'Assess hemodynamic stability', points: 15, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['intermediate'], critical: true },
      { id: 'c9-3', category: 'history', description: 'Ask about medication compliance', points: 10, yearLevel: ['2nd-year', '3rd-year', 'diploma'], complexity: ['basic', 'intermediate'] },
      { id: 'c9-4', category: 'intervention', description: 'Consider rate control if unstable', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c9-5', category: 'communication', description: 'Reassure patient - stable atrial flutter is not immediately life-threatening', points: 5, yearLevel: ['2nd-year', '3rd-year', 'diploma'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'Atrial flutter: Macro-reentrant circuit in right atrium, typical rate ~300 bpm',
      '2:1 block most common = ventricular rate ~150 bpm',
      'Sawtooth flutter waves best seen in leads II, III, aVF',
      'Treatment: Rate control (beta blockers, calcium channel blockers) or rhythm control (cardioversion)',
      'Atrial flutter carries similar stroke risk to atrial fibrillation - anticoagulation important',
      'Can be cured with catheter ablation (high success rate)'
    ],
    commonPitfalls: [
      'Mistaking atrial flutter for sinus tachycardia or SVT - look for flutter waves',
      'Not recognizing sawtooth flutter waves in inferior leads (II, III, aVF)',
      'Missing the variable block pattern - can masquerade as irregular rhythm',
      'Not assessing hemodynamic stability before initiating treatment',
      'Forgetting that atrial flutter carries same stroke risk as AF - anticoagulation crucial',
      'Not asking about medication compliance - common cause of breakthrough flutter',
      'Attempting chemical cardioversion without adequate anticoagulation assessment',
      'Not documenting baseline rate and rhythm for comparison',
      'Missing electrolyte disturbances as precipitating factor',
      'Transporting without continuous monitoring - can degenerate into AF'
    ],
    equipmentNeeded: [
      '12-lead ECG machine',
      'Cardiac monitor/defibrillator',
      'IV cannulation kit (18G)',
      'Metoprolol 5mg ampoules (for rate control)',
      'Diltiazem 25mg ampoules (alternative rate control)',
      'Adenosine 6mg/2ml ampoules (for diagnosis if uncertain)',
      'Normal saline 0.9% 500ml bags',
      'Blood glucose testing kit',
      'Transport stretcher with monitoring',
      'Defibrillation pads (if cardioversion needed)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Tachyarrhythmia Management Protocol v3.1',
        'DCAS Atrial Flutter Guidelines',
        'ACC/AHA/HRS Guidelines for Atrial Arrhythmias'
      ],
      receivingFacilities: [
        {
          name: 'Al Zahra Hospital Dubai',
          location: 'Dubai',
          capabilities: ['Electrophysiology Services', 'Cardiology Unit', 'Catheter Ablation'],
          contact: '04 379 2222',
          distance: '20 minutes from most Dubai locations'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha',
          capabilities: ['Cardiology Services', 'Arrhythmia Management'],
          contact: '04 377 5500',
          distance: '25 minutes'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Electrophysiology Lab', 'Cardiology Unit'],
          contact: '04 435 9999',
          distance: '30 minutes'
        }
      ],
      localConsiderations: [
        'Retirement homes in Dubai vary in medical capabilities - some have nursing staff',
        'Many elderly expats in Dubai - may not have family locally',
        'Document power of attorney or emergency contact information',
        'Retirement facilities often have previous ECGs - request for comparison',
        'Medication compliance issues common in elderly - check pill organizers',
        'Dubai heat can exacerbate cardiac conditions - assess hydration status',
        'Many elderly on multiple medications - check for drug interactions',
        'Transport to facility with cardiology follow-up availability',
        'Cultural sensitivity: Elderly patients deserve extra patience and respect',
        'Document baseline functional status - helps hospital with disposition planning'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-atrial-flutter',
          type: 'image',
          title: 'Atrial Flutter ECG',
          url: 'https://radiopaedia.org/cases/atrial-flutter-ecg',
          source: 'Radiopaedia',
          caption: 'Sawtooth flutter waves in inferior leads with 2:1 AV block',
          relevance: 'essential',
          tags: ['atrial-flutter', 'ECG', 'flutter-waves', 'arrhythmia']
        }
      ],
      videos: [
        {
          id: 'vid-atrial-flutter',
          type: 'video',
          title: 'Atrial Flutter Recognition and Management',
          url: 'https://www.youtube.com/watch?v=69-GmO4GmEY',
          source: 'Armando Hasudungan',
          caption: 'ECG recognition of atrial flutter and prehospital management',
          duration: '12:40',
          relevance: 'essential',
          tags: ['atrial-flutter', 'ECG', 'management', 'arrhythmia']
        },
        {
          id: 'vid-flutter-vs-afib',
          type: 'video',
          title: 'Atrial Flutter vs Atrial Fibrillation',
          url: 'https://www.youtube.com/watch?v=bHWOBtfvFOY',
          source: 'Osmosis from Elsevier',
          caption: 'Differentiating atrial flutter from AF and management differences',
          duration: '10:25',
          relevance: 'important',
          tags: ['atrial-flutter', 'AF', 'differentiation', 'ECG']
        }
      ],
      articles: [
        {
          id: 'art-atrial-flutter',
          type: 'article',
          title: 'Atrial Flutter: ECG Features and Management',
          url: 'https://wikem.org/wiki/Atrial_flutter',
          source: 'WikEM',
          caption: 'Quick reference for atrial flutter recognition and emergency management',
          relevance: 'essential',
          tags: ['atrial-flutter', 'WikEM', 'management', 'arrhythmia']
        },
        {
          id: 'art-flutter-statpearls',
          type: 'article',
          title: 'Atrial Flutter - Pathophysiology and Treatment',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK540985/',
          source: 'StatPearls',
          caption: 'Comprehensive review of atrial flutter pathophysiology and management',
          relevance: 'important',
          tags: ['atrial-flutter', 'StatPearls', 'pathophysiology']
        },
        {
          id: 'art-flutter-anticoagulation',
          type: 'article',
          title: 'Stroke Prevention in Atrial Flutter',
          url: 'https://www.ahajournals.org/doi/10.1161/CIRCULATIONAHA.118.035225',
          source: 'Circulation',
          caption: 'Evidence for anticoagulation in atrial flutter',
          relevance: 'important',
          tags: ['atrial-flutter', 'stroke-prevention', 'anticoagulation']
        }
      ]
    }
  }),

  // CARDIAC CASE 010 - Cardiac Syncope (Vasovagal vs Cardiac)
  createCase({
    id: 'cardiac-010',
    title: 'Syncope - Rule Out Cardiac Cause',
    category: 'cardiac',
    subcategory: 'syncope',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Passed out, woke up confused',
      timeOfDay: 'afternoon',
      location: 'Supermarket in Dubai',
      callerInfo: 'Store manager',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient standing in checkout line', 'Brief loss of consciousness']
    },
    patientInfo: {
      age: 42,
      gender: 'female',
      weight: 65,
      occupation: 'Accountant',
      language: 'English',
      culturalConsiderations: []
    },
    sceneInfo: {
      description: 'Supermarket, patient seated on chair provided by staff',
      hazards: [],
      bystanders: 'Store manager and several customers',
      environment: 'Public area, safe',
      sceneImagePath: '/scene-assets/cardiac-010-supermarket-syncope-female.png',
      sceneImageCaption: 'Supermarket aisle — syncope',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Adult female, alert, slightly pale',
      position: 'Seated',
      appearance: 'Recovered, alert',
      consciousness: 'Alert and oriented x3'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent'],
        interventions: [],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Normal breathing'],
        interventions: [],
        auscultation: ['Clear air entry']
      },
      circulation: {
        pulseRate: 88,
        pulseQuality: 'Good',
        bp: { systolic: 125, diastolic: 75 },
        capillaryRefill: 2,
        skin: 'Slightly pale, now warm',
        findings: ['Normal vital signs', 'No signs of shock'],
        interventions: ['IV access', 'Cardiac monitor', '12-lead ECG'],
        ecgFindings: ['Normal sinus rhythm', 'No acute changes', 'Normal intervals']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Brief post-ictal confusion resolved', 'Normal neurological exam'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['No signs of trauma', 'No evidence of incontinence'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['No signs of head trauma'],
      neck: ['No JVD', 'Supple'],
      chest: ['Clear'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['No edema'],
      posterior: ['Normal'],
      neurological: ['Normal exam', 'No focal deficits']
    },
    history: {
      medications: [
        { name: 'Oral contraceptive', dose: 'Daily', frequency: 'Daily', indication: 'Contraception' }
      ],
      allergies: ['None'],
      medicalConditions: ['None'],
      surgicalHistory: ['None'],
      lastMeal: 'Lunch 1 hour ago',
      eventsLeading: 'Standing in long checkout line, felt lightheaded and nauseous, then passed out briefly. Woke up on floor within 30 seconds.'
    },
    vitalSignsProgression: {
      initial: { bp: '125/75', pulse: 88, respiration: 18, spo2: 98, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Brief syncope (<1 min)', 'Standing for long time', 'Prodromal symptoms (nausea, lightheaded)', 'Normal ECG', 'No signs of trauma'],
      redFlags: ['All syncope needs cardiac workup to rule out dangerous causes', 'Need to check for orthostatic changes', 'Pregnancy test indicated (on oral contraceptives)'],
      differentialDiagnoses: ['Vasovagal syncope (most likely)', 'Orthostatic syncope', 'Cardiac syncope (arrhythmia)', 'Neurological (seizure)'],
      mostLikelyDiagnosis: 'Vasovagal Syncope (but must rule out cardiac causes)'
    },
    managementPathway: {
      immediate: [
        'Assess consciousness and airway — patient alert and recovered',
        'Full vital signs including orthostatic BP (lying, sitting, standing with 1-2 min between positions)',
        'Check blood glucose — hypoglycaemia is a reversible cause',
        'Obtain 12-lead ECG — mandatory in all syncope presentations',
        'IV access if ongoing symptoms or abnormal ECG',
        'Detailed history of syncopal event: prodrome, position, duration, post-ictal state, witnesses',
        'Family history of sudden cardiac death'
      ],
      definitive: [
        'All syncope patients require hospital evaluation for risk stratification',
        'Serial troponins to exclude ACS',
        'Holter monitoring or implantable loop recorder if recurrent',
        'Consider tilt table test for suspected vasovagal if investigations negative'
      ],
      monitoring: [
        'Continuous ECG monitoring',
        'BP and SpO2 continuous',
        'Reassess GCS serially — post-ictal confusion should resolve within 5 minutes in syncope',
        'Document and monitor any new symptoms'
      ],
      transportConsiderations: [
        'Transport all syncope patients to ED — even apparent vasovagal requires ED risk stratification',
        'Pre-alert if ECG changes, ongoing symptoms, or exertional syncope detected',
        'Supine or semi-reclined during transport',
        'American Hospital Dubai or Dubai Hospital for cardiology access'
      ]
    },
    studentChecklist: [
      { id: 'c10-1', category: 'history', description: 'Detailed history of syncopal event (witnesses, duration, preceding symptoms)', points: 20, yearLevel: ['1st-year', '2nd-year', '3rd-year', 'diploma', '4th-year'], complexity: ['basic', 'intermediate'], critical: true },
      { id: 'c10-2', category: 'intervention', description: 'Obtain 12-lead ECG to rule out cardiac cause', points: 20, yearLevel: ['2nd-year', '3rd-year', 'diploma', '4th-year'], complexity: ['intermediate'], critical: true },
      { id: 'c10-3', category: 'abcde', description: 'Check orthostatic vital signs (lying, sitting, standing)', points: 15, yearLevel: ['1st-year', '2nd-year', '3rd-year', 'diploma', '4th-year'], complexity: ['basic', 'intermediate'] },
      { id: 'c10-4', category: 'history', description: 'Ask about family history of sudden death, cardiac disease', points: 15, yearLevel: ['1st-year', '2nd-year', '3rd-year', 'diploma', '4th-year'], complexity: ['basic', 'intermediate'] },
      { id: 'c10-5', category: 'intervention', description: 'Check blood glucose (hypoglycemia can cause syncope)', points: 10, yearLevel: ['1st-year', '2nd-year', 'diploma', '4th-year'], complexity: ['basic'] },
      { id: 'c10-6', category: 'communication', description: 'Transport to hospital for evaluation (all syncope needs ED workup)', points: 10, yearLevel: ['1st-year', '2nd-year', '3rd-year', 'diploma', '4th-year'], complexity: ['basic', 'intermediate'] }
    ],
    teachingPoints: [
      'Syncope: Transient loss of consciousness due to cerebral hypoperfusion',
      'Red flags in syncope: Chest pain, palpitations, family history of sudden death, abnormal ECG, exertional syncope',
      'Vasovagal syncope: Most common type, often has prodrome, triggered by standing, pain, emotion',
      'Cardiac syncope: Arrhythmia, structural heart disease - more dangerous, often no prodrome, occurs during exertion',
      'All syncope patients need cardiac workup (ECG at minimum)',
      'Orthostatic vital signs: Check BP and pulse lying, sitting, standing - wait 1-2 minutes between positions'
    ],
    commonPitfalls: [
      'Assuming "just fainted" without proper assessment - Syncope is a symptom requiring thorough workup including ECG. Missing cardiac causes can lead to recurrent episodes and sudden death.',
      'Not obtaining ECG in all syncope patients - Mandatory regardless of age; identifies WPW, HCM, long QT, Brugada, and arrhythmias requiring immediate intervention.',
      'Missing red flags suggesting cardiac cause - Exertional syncope, no prodrome, family history of sudden death, palpitations, or abnormal ECG all require urgent cardiac evaluation.',
      'Not checking orthostatic vital signs properly - Measure BP/pulse supine, at 1 minute standing, and at 3 minutes standing; drop >20mmHg systolic or >10mmHg diastolic is positive.',
      'Dismissing syncope in younger patients - Cardiac causes like HCM, long QT, and arrhythmias occur at any age; exertional syncope in youth is especially concerning.',
      'Failing to ask about prodromal symptoms - Nausea/warmth suggests vasovagal; palpitations suggest arrhythmia; chest pain suggests ischemia; headache suggests SAH.',
      'Not considering medication causes - Antihypertensives, diuretics, vasodilators, and diabetic meds commonly cause syncope; ask about recent changes and missed meals.',
      'Confusing seizure with syncope - Seizures have prolonged activity, tongue biting, post-ictal confusion >5 min; syncope is brief (<1 min), rapid recovery, pallor during event.',
      'Not transporting all syncope patients - All require ED risk stratification; even vasovagal may indicate underlying conditions; document refusal thoroughly.',
      'Neglecting trauma assessment - Patients often fall; assess for head injury, fractures, internal injuries; elderly especially at risk for subdural hematomas and hip fractures.'
    ],
    equipmentNeeded: [
      '12-lead ECG machine',
      'Cardiac monitor/defibrillator',
      'BP cuff and stethoscope',
      'IV cannulation kit (18G-20G)',
      'Normal saline 0.9% 500ml bags',
      'Blood glucose meter',
      'Glucometer test strips',
      'Pulse oximeter',
      'Thermometer',
      'Transport stretcher',
      'Oxygen delivery devices',
      'Patient identification band'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Syncope and Near-Syncope Management Protocol v4.2',
        'DCAS 12-Lead ECG Acquisition Standards',
        'Dubai Health Authority - Emergency Cardiac Care Guidelines',
        'UAE National Ambulance Service Clinical Guidelines - Neurological Emergencies'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Emergency Department',
          location: 'Dubai Healthcare City, Oud Metha Road',
          capabilities: ['24/7 Emergency Care', 'Cardiac Monitoring', 'Syncope Workup', 'Tilt Table Testing'],
          contact: '04 219 3000',
          distance: '12 minutes from Dubai Marina area'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Emergency Care', 'Cardiac Catheterization', 'Neurology Consultation'],
          contact: '04 222 1211',
          distance: '15 minutes from Deira area'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha',
          capabilities: ['24/7 Emergency Care', 'Advanced Cardiac Monitoring', 'Syncope Clinic'],
          contact: '04 377 5500',
          distance: '10 minutes from Downtown Dubai'
        }
      ],
      localConsiderations: [
        'Dubai supermarkets and malls have security personnel who can assist with crowd control',
        'Many expatriate workers may be fasting during Ramadan - consider dehydration/hypoglycemia',
        'Heat-related syncope common in UAE summer - assess for heat exhaustion',
        'Language barriers common in multicultural Dubai - use translation apps when needed',
        'Shopping malls have first aid rooms that can be used for initial assessment',
        'Dubai Police non-emergency (901) can assist with crowd management if needed',
        'Cultural sensitivity: female patients may prefer female caregivers when available',
        'Document exact time of syncope - important for hospital risk stratification',
        'Many facilities in Dubai have rapid syncope protocols - coordinate with receiving hospital',
        'Ambulance response times in Dubai average 8-10 minutes in urban areas'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-syncope-ecg-001',
          type: 'image',
          title: 'Normal ECG in Vasovagal Syncope',
          url: 'https://radiopaedia.org/cases/normal-sinus-rhythm-ecg',
          source: 'Radiopaedia',
          caption: 'Normal sinus rhythm without abnormalities - typical in vasovagal syncope',
          relevance: 'essential',
          tags: ['syncope', 'ECG', 'vasovagal', 'normal']
        },
        {
          id: 'img-syncope-hcm-001',
          type: 'image',
          title: 'Hypertrophic Cardiomyopathy ECG',
          url: 'https://radiopaedia.org/cases/hypertrophic-cardiomyopathy-ecg',
          source: 'Radiopaedia',
          caption: 'LVH with ST-T changes - red flag for HCM in syncope patient',
          relevance: 'essential',
          tags: ['syncope', 'ECG', 'HCM', 'cardiac']
        }
      ],
      videos: [
        {
          id: 'vid-syncope-001',
          type: 'video',
          title: 'Syncope: Cardiac vs Vasovagal',
          url: 'https://www.youtube.com/watch?v=69-GmO4GmEY',
          source: 'Armando Hasudungan',
          caption: 'Differential diagnosis and management of syncope in emergency settings',
          duration: '15:20',
          relevance: 'essential',
          tags: ['syncope', 'cardiac', 'vasovagal', 'differential']
        },
        {
          id: 'vid-syncope-002',
          type: 'video',
          title: 'EMS Approach to Syncope',
          url: 'https://www.youtube.com/watch?v=bHWOBtfvFOY',
          source: 'Osmosis from Elsevier',
          caption: 'Prehospital assessment and management of syncope',
          duration: '12:45',
          relevance: 'essential',
          tags: ['syncope', 'EMS', 'assessment', 'prehospital']
        }
      ],
      articles: [
        {
          id: 'art-syncope-001',
          type: 'article',
          title: 'Syncope Evaluation in the Emergency Department',
          url: 'https://wikem.org/wiki/Syncope',
          source: 'WikEM',
          caption: 'Quick reference for syncope evaluation and risk stratification',
          relevance: 'essential',
          tags: ['syncope', 'evaluation', 'WikEM', 'risk-stratification']
        },
        {
          id: 'art-syncope-002',
          type: 'article',
          title: 'ESC Guidelines on Syncope Management',
          url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Syncope-Guidelines',
          source: 'European Society of Cardiology',
          caption: 'International guidelines on syncope diagnosis and management',
          relevance: 'important',
          tags: ['syncope', 'guidelines', 'ESC', 'management']
        }
      ],
      procedures: [
        {
          id: 'proc-orthostatic-001',
          type: 'video',
          title: 'How to Check Orthostatic Vital Signs',
          url: 'https://www.youtube.com/watch?v=6FLE6HWiImM',
          source: 'MedCram',
          caption: 'Proper technique for measuring orthostatic vital signs',
          duration: '8:30',
          relevance: 'essential',
          tags: ['orthostatic', 'vitals', 'technique', 'assessment']
        }
      ]
    }
  }),

  // CARDIAC CASE 011 - Acute Decompensated Heart Failure
  createCase({
    id: 'cardiac-011',
    title: 'Acute Decompensated Heart Failure - "Crashing Asthma"',
    category: 'cardiac',
    subcategory: 'heart-failure',
    priority: 'high',
    complexity: 'advanced',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Cannot breathe, asthma attack',
      timeOfDay: 'evening',
      location: 'Apartment in Al Ain',
      callerInfo: 'Patient\'s son',
      dispatchCode: 'Echo-1',
      additionalInfo: ['History of asthma', 'Using inhaler without relief']
    },
    patientInfo: {
      age: 68,
      gender: 'male',
      weight: 85,
      occupation: 'Retired',
      language: 'Arabic',
      culturalConsiderations: ['Family very involved']
    },
    sceneInfo: {
      description: 'Apartment, patient sitting on edge of bed leaning forward',
      hazards: [],
      bystanders: 'Son and daughter-in-law',
      environment: 'Crowded room',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Elderly male, severe respiratory distress',
      position: 'Tripod position, sitting forward',
      appearance: 'Diaphoretic, cyanotic lips, using accessory muscles',
      consciousness: 'Alert but anxious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but working hard'],
        interventions: ['Keep upright'],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 34,
        rhythm: 'Regular',
        depth: 'Shallow',
        spo2: 87,
        findings: ['Severe dyspnea', 'Bibasilar crackles to mid-thorax', 'Wheezing (actually cardiac wheeze)'],
        interventions: ['High-flow oxygen 15L/min non-rebreather', 'CPAP if available', 'Nitrates'],
        auscultation: ['Bibasilar crackles', 'Wheezing throughout', 'Decreased air entry at bases']
      },
      circulation: {
        pulseRate: 125,
        pulseQuality: 'Thready',
        bp: { systolic: 165, diastolic: 100 },
        capillaryRefill: 4,
        skin: 'Cold, clammy, diaphoretic, cyanotic',
        findings: ['Hypertensive', 'Tachycardic', 'Poor perfusion', 'JVD present', 'Ankle edema'],
        interventions: ['IV access', 'Nitroglycerin', 'Furosemide if protocols allow'],
        ecgFindings: ['Sinus tachycardia', 'LVH pattern', 'Possible ischemic changes']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious, air hunger'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Ankle edema 2+', 'JVD present'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Diaphoretic'],
      neck: ['JVD present — elevated jugular venous pressure to angle of jaw'],
      chest: ['Bilateral basal crackles (pulmonary oedema)', 'Possible S3 gallop'],
      abdomen: ['Possible hepatomegaly'],
      pelvis: ['Stable'],
      extremities: ['Bilateral pitting oedema to mid-calf (2+)', 'Cool extremities'],
      posterior: ['Sacral oedema present'],
      neurological: ['Normal except anxiety']
    },
    history: {
      medications: [
        { name: 'Furosemide', dose: '40mg', frequency: 'Daily', indication: 'Heart failure' },
        { name: 'Lisinopril', dose: '20mg', frequency: 'Daily', indication: 'Blood pressure' },
        { name: 'Albuterol inhaler', dose: '2 puffs', frequency: 'PRN', indication: 'Breathlessness' }
      ],
      allergies: ['None'],
      medicalConditions: ['Heart failure', 'Hypertension', 'Previous "COPD" label by GP (note — likely mislabelled cardiac asthma)'],
      surgicalHistory: ['Coronary stent x3 - 3 years ago'],
      lastMeal: 'Dinner 4 hours ago',
      eventsLeading: 'Progressive shortness of breath over 3 days, worse tonight, been sleeping in recliner for a week'
    },
    vitalSignsProgression: {
      initial: { bp: '165/100', pulse: 125, respiration: 34, spo2: 87, gcs: 14, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Acute pulmonary edema', "Cardiac asthma (wheezing from heart failure not asthma)", 'Hypertensive', 'Signs of fluid overload', 'History of heart failure'],
      redFlags: ["'Crashing asthma' in elderly = think heart failure until proven otherwise", 'Requires aggressive diuresis and BP control', 'CPAP very helpful'],
      differentialDiagnoses: ['Acute decompensated heart failure', 'Acute pulmonary edema', 'COPD exacerbation', 'Pneumonia'],
      mostLikelyDiagnosis: 'Acute Decompensated Heart Failure with Pulmonary Edema'
    },
    managementPathway: {
      immediate: [
        'Position UPRIGHT — tripod position significantly reduces venous return and work of breathing',
        'High-flow oxygen 15L/min via non-rebreather mask — titrate to maintain SpO2 92-96%',
        'CPAP 5-10 cmH2O if available — start early, do not wait for hospital',
        'IV access (18G)',
        'GTN spray 400mcg sublingual if SBP >90 mmHg — repeat every 5 minutes x3',
        'GTN infusion if SBP allows (per DCAS protocol)',
        'Furosemide 40mg IV ONLY if confirmed fluid overload and protocols allow — NOT front-line. GTN + CPAP are the priority for acute pulmonary oedema; furosemide onset of diuresis is 15-30 min, too slow for acute relief (ESC 2023 HF guideline, DOSE-AHF).',
        'Obtain 12-lead ECG — identify ischaemia, LVH, arrhythmia',
        'Do NOT give IV fluids unless hypotensive — these patients are fluid overloaded'
      ],
      definitive: [
        'ICU or high-dependency unit admission',
        'IV diuresis and vasodilator therapy',
        'Echo for EF assessment and cause identification',
        'Treat underlying cause — ischaemia, infection, medication non-compliance'
      ],
      monitoring: [
        'SpO2 continuous — most sensitive indicator of response',
        'BP every 3-5 minutes — GTN can cause hypotension',
        'Respiratory rate — key indicator of improvement',
        'GCS — worsening indicates critical deterioration',
        'Monitor for intubation trigger: SpO2 <90% despite CPAP, GCS deterioration'
      ],
      transportConsiderations: [
        'Keep UPRIGHT throughout transport — do not lay flat',
        'Pre-alert: "Acute pulmonary oedema, CPAP in progress, SBP X, SpO2 X%"',
        'Transport to Al Ain Hospital or Tawam Hospital with cardiology and ICU',
        'Be prepared to escalate to intubation if CPAP fails en route'
      ]
    },
    studentChecklist: [
      { id: 'c11-1', category: 'abcde', description: 'Recognize pulmonary edema (crackles, wheezing, JVD, edema)', points: 20, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'c11-2', category: 'intervention', description: 'High-flow oxygen, consider CPAP', points: 20, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'c11-3', category: 'intervention', description: 'Nitroglycerin for preload/afterload reduction', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c11-4', category: 'history', description: 'Ask about history of heart failure, recent medication changes', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate'] },
      { id: 'c11-5', category: 'intervention', description: 'Position upright (improves breathing)', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic'] },
      { id: 'c11-6', category: 'communication', description: 'Rapid transport to hospital', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate'], critical: true }
    ],
    teachingPoints: [
      "Cardiac asthma: Wheezing from pulmonary edema, easily confused with asthma/ COPD",
      "Key differentiators: History of heart failure, JVD, edema, orthopnea, PND (paroxysmal nocturnal dyspnea)",
      "Treatment: Oxygen (high flow), CPAP (very effective), Nitrates (preload/afterload), Diuretics (if protocols allow)",
      "Position patient upright - significantly improves breathing",
      "Avoid high positive pressure ventilation without caution in pulmonary edema (CPAP preferred)",
      "Always consider heart failure in elderly patient with 'asthma' - may be cardiac asthma"
    ],
    commonPitfalls: [
      "Treating as asthma without considering heart failure - 'Cardiac asthma' from pulmonary edema mimics bronchospasm; look for JVD, peripheral edema, orthopnea, and history of heart failure to differentiate.",
      "Not recognizing crackles as sign of pulmonary edema - Bilateral crackles suggest fluid overload; unilateral crackles suggest pneumonia. Listen for crackles up to mid-thorax or higher in severe cases.",
      "Missing JVD and peripheral edema - These are pathognomonic for fluid overload. JVD should be assessed at 45-degree angle; peripheral edema should be checked by pressing firmly on shins for 5 seconds.",
      "Not asking about orthopnea and PND (specific for heart failure) - Orthopnea (dyspnea when lying flat) and paroxysmal nocturnal dyspnea (waking breathless at night) are highly specific for decompensated heart failure.",
      "Aggressively fluid resuscitating pulmonary edema patient - These patients are fluid overloaded, not dehydrated. Additional fluids worsen pulmonary edema and respiratory distress. Exception: hypotensive shock requires careful fluid administration.",
      "Delaying CPAP initiation - CPAP provides immediate benefit in acute cardiogenic pulmonary edema by reducing preload and improving oxygenation. Don't wait for hospital; start CPAP early if available.",
      "Not positioning patient upright - Sitting upright or in tripod position significantly improves breathing by reducing venous return to the heart and allowing better diaphragmatic excursion.",
      "Missing the three triggers of decompensation - Always ask about: medication non-compliance (diuretics), dietary indiscretion (high salt intake), and infection (pneumonia, UTI) as common precipitants.",
      "Giving excessive oxygen without monitoring - While oxygen is essential, monitor for CO2 retention in COPD patients who also have heart failure. Titrate to maintain SpO2 92-96%.",
      "Not considering hypertensive emergency - SBP >180 with acute pulmonary edema is a hypertensive emergency; aggressive BP reduction with nitrates is indicated alongside diuresis."
    ],
    equipmentNeeded: [
      '12-lead ECG machine',
      'Cardiac monitor/defibrillator',
      'CPAP/BiPAP machine with mask (full face or nasal)',
      'High-flow oxygen delivery system (15L/min non-rebreather)',
      'BP cuff (appropriate size for arm)',
      'Stethoscope',
      'IV cannulation kit (14G-18G)',
      'Normal saline 0.9% 500ml bags',
      'Nitroglycerin spray or sublingual tablets',
      'Furosemide (if protocol allows)',
      'Pulse oximeter',
      'Blood glucose meter',
      'Transport stretcher capable of upright positioning',
      'Suction unit with Yankauer catheter',
      'Emergency airway kit (OPA, BVM)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Acute Pulmonary Edema and Heart Failure Protocol v5.0',
        'DCAS Non-Invasive Ventilation (CPAP/BiPAP) Guidelines',
        'Dubai Health Authority - Emergency Cardiac Care Guidelines',
        'UAE National Ambulance Service Clinical Guidelines - Respiratory Emergencies'
      ],
      receivingFacilities: [
        {
          name: 'Tawam Hospital Emergency Department',
          location: 'Al Ain',
          capabilities: ['24/7 Cardiac Care', 'CPAP/BiPAP', 'Cardiac Catheterization', 'ICU'],
          contact: '03 707 3000',
          distance: '10 minutes from central Al Ain'
        },
        {
          name: 'Al Ain Hospital',
          location: 'Al Ain',
          capabilities: ['24/7 Emergency Care', 'Cardiac Monitoring', 'Respiratory Support'],
          contact: '03 702 2000',
          distance: '8 minutes from central Al Ain'
        },
        {
          name: 'Sheikh Khalifa Medical City',
          location: 'Al Ain',
          capabilities: ['Advanced Cardiac Care', 'Heart Failure Clinic', 'ICU'],
          contact: '03 702 2000',
          distance: '12 minutes from Al Ain city center'
        }
      ],
      localConsiderations: [
        'Al Ain is inland and can have extreme heat in summer - heat exacerbates heart failure; assess fluid status carefully',
        'Many elderly patients in Al Ain are Bedouin or traditional Emirati families - involve family in care decisions',
        'Arabic-speaking patients may describe symptoms differently; use interpreters when needed',
        'CPAP may not be available on all ambulances; know your equipment capabilities',
        'Rapid transport to appropriate facility is essential - heart failure patients can deteriorate quickly',
        'Document medication compliance carefully - many patients in UAE run out of medications or cannot afford refills',
        'Dietary habits in UAE include high salt foods; ask about recent large meals or salty foods',
        'Ramadan fasting can affect medication schedules - ask about timing of last diuretic dose',
        'Some patients may have traveled recently; consider PE in differential for acute dyspnea',
        'Al Ain has a mix of urban and rural areas; transport times may vary significantly'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-chf-cxr',
          type: 'image',
          title: 'Pulmonary Edema on Chest X-ray',
          url: 'https://radiopaedia.org/cases/pulmonary-oedema',
          source: 'Radiopaedia',
          caption: 'Bilateral perihilar infiltrates (bat wing appearance) characteristic of cardiogenic pulmonary edema',
          relevance: 'essential',
          tags: ['pulmonary-edema', 'CHF', 'chest-xray', 'heart-failure']
        },
        {
          id: 'img-jvd',
          type: 'image',
          title: 'Jugular Venous Distension',
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Sinus_tachycardia_ecg.jpg/640px-Sinus_tachycardia_ecg.jpg',
          source: 'Wikimedia Commons',
          caption: 'JVD visible at 45 degrees indicating elevated right atrial pressure and fluid overload',
          relevance: 'essential',
          tags: ['JVD', 'physical-exam', 'heart-failure', 'fluid-overload']
        }
      ],
      videos: [
        {
          id: 'vid-chf-001',
          type: 'video',
          title: 'Acute Decompensated Heart Failure - Diagnosis and Management',
          url: 'https://www.youtube.com/watch?v=q7aN10XUhvI',
          source: 'JAMA Network',
          caption: 'Comprehensive review of ADHF including cardiac asthma and pulmonary edema management',
          duration: '18:45',
          relevance: 'essential',
          tags: ['ADHF', 'heart-failure', 'pulmonary-edema', 'management']
        },
        {
          id: 'vid-cpap-001',
          type: 'video',
          title: 'CPAP in Acute Pulmonary Edema',
          url: 'https://www.youtube.com/watch?v=dxFOYVUlY2U',
          source: 'Strong Medicine',
          caption: 'Prehospital use of CPAP for cardiogenic pulmonary edema',
          duration: '14:20',
          relevance: 'essential',
          tags: ['CPAP', 'pulmonary-edema', 'prehospital', 'NIV']
        }
      ],
      articles: [
        {
          id: 'art-chf-001',
          type: 'article',
          title: 'Acute Decompensated Heart Failure - Emergency Management',
          url: 'https://emcrit.org/ibcc/acute-heart-failure/',
          source: 'EMCrit',
          caption: 'Evidence-based management of ADHF including cardiac asthma vs bronchial asthma',
          relevance: 'essential',
          tags: ['ADHF', 'heart-failure', 'EMCrit', 'management']
        },
        {
          id: 'art-chf-wikem',
          type: 'article',
          title: 'Acute Heart Failure',
          url: 'https://wikem.org/wiki/Acute_heart_failure',
          source: 'WikEM',
          caption: 'Quick reference for acute heart failure diagnosis and emergency management',
          relevance: 'important',
          tags: ['heart-failure', 'WikEM', 'emergency', 'management']
        },
        {
          id: 'art-esc-hf',
          type: 'article',
          title: 'ESC Guidelines for Heart Failure',
          url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Acute-and-Chronic-Heart-Failure-Guidelines',
          source: 'European Society of Cardiology',
          caption: 'International guidelines on acute and chronic heart failure management',
          relevance: 'important',
          tags: ['heart-failure', 'ESC', 'guidelines', 'CHF']
        }
      ],
      procedures: [
        {
          id: 'proc-cpap-001',
          type: 'video',
          title: 'CPAP Application in Pulmonary Edema',
          url: 'https://www.youtube.com/watch?v=yCzkks51CfQ',
          source: 'Armando Hasudungan',
          caption: 'Step-by-step guide to CPAP application for prehospital providers',
          duration: '10:15',
          relevance: 'essential',
          tags: ['CPAP', 'procedure', 'pulmonary-edema', 'prehospital']
        }
      ]
    }
  }),

  // CARDIAC CASE 012 - Pacemaker Malfunction
  createCase({
    id: 'cardiac-012',
    title: 'Possible Pacemaker Malfunction - Dizziness and Fatigue',
    category: 'cardiac',
    subcategory: 'junctional',
    priority: 'high',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Very dizzy, weak, tired for 2 days',
      timeOfDay: 'afternoon',
      location: 'Rehabilitation center in Dubai',
      callerInfo: 'Nurse at facility',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient has pacemaker', 'BP is low']
    },
    patientInfo: {
      age: 79,
      gender: 'male',
      weight: 70,
      occupation: 'Retired',
      language: 'English',
      culturalConsiderations: []
    },
    sceneInfo: {
      description: 'Rehabilitation center room, patient in bed',
      hazards: [],
      bystanders: 'Nurse present',
      environment: 'Medical facility',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Elderly male, appears fatigued but stable',
      position: 'Lying in bed',
      appearance: 'Pale but not in acute distress',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent'],
        interventions: [],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 16,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['No respiratory distress'],
        interventions: [],
        auscultation: ['Clear']
      },
      circulation: {
        pulseRate: 42,
        pulseQuality: 'Weak but regular',
        bp: { systolic: 88, diastolic: 55 },
        capillaryRefill: 3,
        skin: 'Cool, pale',
        findings: ['Bradycardic', 'Mildly hypotensive', 'Pacemaker visible in left chest'],
        interventions: ['IV access', 'Cardiac monitor', 'Atropine if symptomatic', 'Consider pacemaker magnet'],
        ecgFindings: ['Bradycardia ~42 bpm', 'Pacemaker spikes not capturing', 'Native rhythm appears to be junctional', 'Possible pacemaker malfunction']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Mild fatigue reported', 'No focal deficits'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Pacemaker generator visible in left pectoral region'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['No JVD'],
      chest: ['Pacemaker visible in left chest', 'Clear lungs'],
      abdomen: ['Soft'],
      pelvis: ['Stable'],
      extremities: ['No edema'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Unknown cardiac medications', dose: 'Unknown', frequency: 'Unknown', indication: 'Unknown' }
      ],
      allergies: ['None'],
      medicalConditions: ['Complete heart block', 'Pacemaker placed 3 years ago', 'Dementia (mild)'],
      surgicalHistory: ['Pacemaker implantation', 'Cataract surgery'],
      lastMeal: 'Breakfast 4 hours ago',
      eventsLeading: 'Progressively more tired and weak over 2 days, fell yesterday due to dizziness'
    },
    vitalSignsProgression: {
      initial: { bp: '88/55', pulse: 42, respiration: 16, spo2: 96, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Bradycardia 42 bpm', 'Hypotension', 'Pacemaker visible but not capturing', 'Possible pacemaker malfunction'],
      redFlags: ['Pacemaker not capturing is a medical emergency', 'May need to place magnet over pacemaker', 'Need to identify type of pacemaker'],
      differentialDiagnoses: ['Pacemaker failure (lead dislodgement/battery depletion)', 'Oversensing (pacemaker inhibiting inappropriately)', 'Electrolyte abnormality (hyperkalemia)', 'Native junctional rhythm'],
      mostLikelyDiagnosis: 'Pacemaker Malfunction - Failure to Capture'
    },
    managementPathway: {
      immediate: [
        'Obtain 12-lead ECG — assess pacemaker spikes, capture, and native rhythm',
        'Identify pacemaker type from identification card or wound pocket inspection',
        'IV access (18G) — do not use pacemaker-side limb if ICD leads visible on chest',
        'Atropine 0.5mg IV for symptomatic bradycardia — may not work in pacemaker-dependent patients',
        'Apply transcutaneous pacing pads — be prepared to pace if haemodynamic compromise',
        'Consider pacemaker magnet to convert to asynchronous (fixed-rate) mode if oversensing suspected',
        'Check blood glucose — electrolyte abnormalities (hyperkalaemia) can cause failure to capture'
      ],
      definitive: [
        'Hospital admission for urgent pacemaker programmer assessment',
        'Cardiology/electrophysiology team review',
        'Lead revision, battery replacement, or reprogramming as indicated'
      ],
      monitoring: [
        'Continuous ECG monitoring — pacemaker spikes, capture, and native rate',
        'BP every 3-5 minutes',
        'GCS — bradycardia-induced cerebral hypoperfusion',
        'Transcutaneous pacing threshold monitoring if TCP initiated'
      ],
      transportConsiderations: [
        'Transport to hospital with electrophysiology capabilities — American Hospital Dubai or Dubai Heart Centre',
        'Pre-alert: "Pacemaker malfunction, failure to capture, symptomatic bradycardia, TCP in progress"',
        'Have TCP running or immediately available throughout transport',
        'Contact hospital to have pacemaker programmer team on standby'
      ]
    },
    studentChecklist: [
      { id: 'c12-1', category: 'intervention', description: 'Identify pacemaker and check for pocket infection/erosion', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c12-2', category: 'intervention', description: 'Obtain 12-lead ECG to assess pacemaker function', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'c12-3', category: 'intervention', description: 'Check pacemaker identification card', points: 15, yearLevel: ['4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'c12-4', category: 'intervention', description: 'Consider transcutaneous pacing if patient deteriorates', points: 20, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'c12-5', category: 'intervention', description: 'Atropine for symptomatic bradycardia', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c12-6', category: 'communication', description: 'Contact pacemaker clinic if possible', points: 10, yearLevel: ['4th-year'], complexity: ['intermediate'] }
    ],
    teachingPoints: [
      'Pacemaker malfunction types: Failure to pace, failure to capture, oversensing, inappropriate rate',
      'Pacemaker magnet: Can convert some pacemakers to fixed-rate (asynchronous) mode',
      'Pacemaker spikes should be followed by QRS complex (capture)',
      'If no capture: May be lead problem, battery depletion, or electrolyte abnormality',
      'Transcutaneous pacing may be needed while awaiting permanent pacemaker evaluation',
      'Always look for pacemaker identification card or device information'
    ],
    commonPitfalls: [
      'Not recognizing pacemaker spikes on ECG - Pacemaker spikes are small vertical deflections immediately before the QRS (ventricular pacemaker) or P wave (atrial pacemaker). Learn to identify them; they indicate where the pacemaker is trying to fire.',
      'Assuming bradycardia is normal without checking pacemaker function - In a patient with a pacemaker, bradycardia often indicates pacemaker malfunction. Always obtain ECG to assess pacemaker capture and sensing.',
      'Not considering transcutaneous pacing in symptomatic patients - If the patient has symptomatic bradycardia and the permanent pacemaker is malfunctioning, be prepared to initiate transcutaneous pacing immediately. Do not delay while troubleshooting the permanent pacemaker.',
      'Forgetting to check pacemaker pocket for infection/erosion - Inspect the pacemaker pocket site for erythema, warmth, swelling, tenderness, or visible leads. Infection or erosion can cause lead dysfunction and pacemaker failure.',
      'Not asking about pacemaker type and programming - Try to obtain the pacemaker identification card or device information. Knowing if it is VVI, DDD, or other mode helps understand expected behavior.',
      'Missing failure to capture vs failure to pace - Failure to capture: pacemaker spikes present but no following QRS. Failure to pace: no spikes when expected (oversensing or battery failure). Treatment differs.',
      'Not identifying pacemaker-dependent patients - Some patients have no underlying escape rhythm (pacemaker-dependent). These patients will become asystolic if the pacemaker fails completely.',
      'Delaying magnet placement when indicated - A pacemaker magnet can convert many pacemakers to asynchronous (fixed-rate) mode, which may restore capture if the problem is oversensing. Know your protocol.',
      'Forgetting electrolyte abnormalities - Hyperkalemia (K+ >6.0) can cause failure to capture. Check blood glucose and consider electrolyte panel if available.',
      'Not communicating with receiving hospital about pacemaker - Alert the receiving facility about the suspected pacemaker malfunction so they can contact the pacemaker clinic and have a programmer available.'
    ],
    equipmentNeeded: [
      '12-lead ECG machine',
      'Cardiac monitor/defibrillator with pacing capability',
      'Transcutaneous pacing pads (adult)',
      'Pacemaker magnet (ring magnet)',
      'BP cuff and stethoscope',
      'IV cannulation kit (14G-18G)',
      'Normal saline 0.9% 500ml bags',
      'Atropine 1mg prefilled syringes',
      'Adrenaline (epinephrine) 1:10,000 prefilled syringes',
      'Blood glucose meter',
      'Pulse oximeter',
      'Thermometer',
      'Transport stretcher',
      'Suction unit with Yankauer catheter',
      'Emergency airway kit (OPA, BVM)',
      'Magnifying glass (for reading small pacemaker labels)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Bradycardia and Pacemaker Emergency Protocol v4.5',
        'DCAS Transcutaneous Pacing Guidelines',
        'Dubai Health Authority - Device Management in Emergencies',
        'UAE National Ambulance Service Clinical Guidelines - Cardiac Emergencies'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Emergency Department',
          location: 'Dubai Healthcare City, Oud Metha Road',
          capabilities: ['24/7 Emergency Care', 'Cardiac Catheterization', 'Pacemaker Clinic', 'Electrophysiology Lab'],
          contact: '04 219 3000',
          distance: '15 minutes from central Dubai'
        },
        {
          name: 'Cleveland Clinic Abu Dhabi',
          location: 'Al Maryah Island, Abu Dhabi',
          capabilities: ['Advanced Cardiac Care', 'Electrophysiology', 'Pacemaker Interrogation', 'Device Programming'],
          contact: '02 501 8000',
          distance: '90 minutes from Dubai (transfer for complex cases)'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha',
          capabilities: ['24/7 Emergency Care', 'Cardiac Monitoring', 'Cardiology Consultation'],
          contact: '04 377 5500',
          distance: '10 minutes from Oud Metha area'
        }
      ],
      localConsiderations: [
        'Rehabilitation centers and nursing homes in Dubai should have pacemaker identification cards on file - ask the nurse for the device card',
        'Many expatriate patients in UAE have pacemakers implanted in their home countries - device information may be in foreign languages',
        'Dubai has several specialized pacemaker clinics (Cleveland Clinic, Mediclinic, American Hospital) - consider direct transfer for device emergencies',
        'Language barriers may make it difficult to obtain device history; use translation services when needed',
        'Some facilities have remote monitoring capabilities - the device may have sent alerts to the clinic already',
        'Document pacemaker model and serial number if visible on the device - helpful for the receiving hospital',
        'UAE has a high prevalence of cardiac devices among elderly expatriate population - familiarize yourself with common device types',
        'Summer heat in UAE can affect elderly patients with cardiac devices - ensure proper hydration and cooling',
        'Dubai Police non-emergency (901) can assist with traffic management for urgent transfers',
        'Coordination with receiving hospital is crucial - they need to contact the electrophysiology team before arrival'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-pm-ecg-001',
          type: 'image',
          title: 'Pacemaker Rhythm on ECG',
          url: 'https://radiopaedia.org/cases/pacemaker-ecg',
          source: 'Radiopaedia',
          caption: 'Normal paced rhythm with pacemaker spikes preceding each QRS complex',
          relevance: 'essential',
          tags: ['pacemaker', 'ECG', 'paced-rhythm', 'device']
        },
        {
          id: 'img-pm-fail-capture',
          type: 'image',
          title: 'Pacemaker Failure to Capture',
          url: 'https://radiopaedia.org/cases/pacemaker-malfunction-failure-to-capture',
          source: 'Radiopaedia',
          caption: 'Pacemaker spikes present but no following QRS complexes - indicates failure to capture',
          relevance: 'essential',
          tags: ['pacemaker', 'failure-to-capture', 'ECG', 'malfunction']
        }
      ],
      videos: [
        {
          id: 'vid-pm-001',
          type: 'video',
          title: 'Pacemaker Malfunction - EMS Approach',
          url: 'https://www.youtube.com/watch?v=69-GmO4GmEY',
          source: 'Armando Hasudungan',
          caption: 'Recognition and management of pacemaker malfunction in the emergency setting',
          duration: '16:30',
          relevance: 'essential',
          tags: ['pacemaker', 'malfunction', 'EMS', 'emergency']
        },
        {
          id: 'vid-tcp-001',
          type: 'video',
          title: 'Transcutaneous Pacing - Procedure Guide',
          url: 'https://www.youtube.com/watch?v=bHWOBtfvFOY',
          source: 'Osmosis from Elsevier',
          caption: 'Step-by-step guide to transcutaneous pacing for symptomatic bradycardia',
          duration: '13:45',
          relevance: 'essential',
          tags: ['transcutaneous-pacing', 'TCP', 'procedure', 'bradycardia']
        }
      ],
      articles: [
        {
          id: 'art-pm-001',
          type: 'article',
          title: 'Pacemaker Malfunction - Emergency Management',
          url: 'https://wikem.org/wiki/Pacemaker_malfunction',
          source: 'WikEM',
          caption: 'Quick reference for recognizing and managing pacemaker malfunctions',
          relevance: 'essential',
          tags: ['pacemaker', 'malfunction', 'WikEM', 'management']
        },
        {
          id: 'art-pm-statpearls',
          type: 'article',
          title: 'Pacemaker Malfunction - Pathophysiology',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK553149/',
          source: 'StatPearls',
          caption: 'Comprehensive review of pacemaker malfunction types and management',
          relevance: 'important',
          tags: ['pacemaker', 'StatPearls', 'malfunction', 'pathophysiology']
        },
        {
          id: 'art-pm-hr',
          type: 'article',
          title: 'Heart Rhythm Society - Device Troubleshooting',
          url: 'https://www.hrsonline.org/news/blog/detail/blog/2018/02/15/troubleshooting-pacemakers-and-icds',
          source: 'Heart Rhythm Society',
          caption: 'Professional guidance on troubleshooting pacemaker and ICD issues',
          relevance: 'important',
          tags: ['pacemaker', 'ICD', 'troubleshooting', 'HRS']
        }
      ],
      procedures: [
        {
          id: 'proc-magnet-001',
          type: 'video',
          title: 'Pacemaker Magnet Application',
          url: 'https://www.youtube.com/watch?v=6FLE6HWiImM',
          source: 'MedCram',
          caption: 'How and when to apply a magnet to a malfunctioning pacemaker',
          duration: '8:20',
          relevance: 'essential',
          tags: ['pacemaker', 'magnet', 'procedure', 'device']
        }
      ]
    }
  }),

  // ==================== ADVANCED CARDIAC ARREST CASES ====================

  // CARDIAC CASE 013 - Refractory VF Cardiac Arrest (4th Year)
  createCase({
    id: 'cardiac-013',
    title: 'Refractory VF Cardiac Arrest',
    category: 'cardiac',
    subcategory: 'cardiac-arrest',
    initialRhythm: 'Ventricular Fibrillation',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Male collapsed at gym, bystander CPR in progress, AED has shocked twice — still in cardiac arrest',
      timeOfDay: 'evening',
      location: 'FitLife Gym, Al Quoz Industrial Area, Dubai',
      callerInfo: 'Gym staff member (trained first aider)',
      dispatchCode: 'Echo-1',
      additionalInfo: [
        'Patient collapsed during heavy deadlift session',
        'Witnessed arrest — bystander CPR started immediately',
        'AED applied — 2 shocks delivered, patient remains in VF',
        'Patient is a regular gym member, approximately 48 years old'
      ]
    },
    patientInfo: {
      age: 48,
      gender: 'male',
      weight: 95,
      occupation: 'Construction project manager',
      language: 'English',
      culturalConsiderations: ['Gym bag contains supplements — check for clues']
    },
    sceneInfo: {
      description: 'Large commercial gym, weights area. Patient supine on rubber flooring between squat rack and deadlift platform. AED pads attached. Gym staff performing CPR.',
      hazards: ['Heavy weights and barbells around patient — clear area', 'Loud music — communication difficult'],
      bystanders: 'Gym staff (2 performing CPR rotation), several gym members watching',
      environment: 'Air-conditioned indoor gym, well-lit, 22°C',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/gym-cardiac-arrest-male-dubai.png',
      sceneImageCaption: 'Scene — Air-conditioned indoor gym, well-lit, 22°C',
      accessIssues: ['Stretcher access through main entrance — wide enough', 'Equipment may need moving to create space for mechanical CPR device'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Large muscular male, unresponsive, AED pads in situ, bystander performing chest compressions',
      position: 'Supine on gym floor',
      appearance: 'Cyanotic, diaphoretic, no signs of life',
      consciousness: 'Unresponsive',
      sounds: ['AED voice prompts', 'Bystander counting compressions']
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Airway not maintained — no adjunct in place', 'Vomitus present in oropharynx', 'Clenched jaw'],
        interventions: ['Suction oropharynx', 'OPA size 4 inserted', 'BVM ventilation 2 breaths every 30 compressions', 'Consider supraglottic airway (i-gel size 4) or ETT for definitive airway'],
        adjunctsNeeded: ['OPA', 'Suction', 'BVM', 'i-gel or ETT']
      },
      breathing: {
        rate: 0,
        rhythm: 'Absent',
        depth: 'Absent',
        spo2: 0,
        findings: ['Apnoeic', 'No respiratory effort', 'Bilateral air entry absent without ventilation'],
        interventions: ['BVM ventilation with high-flow O2 at 15L/min', 'Aim for 10 breaths/min once advanced airway placed', 'Waveform capnography — attach immediately for CPR quality monitoring'],
        auscultation: ['No breath sounds without ventilation', 'Bilateral air entry with BVM ventilation confirmed']
      },
      circulation: {
        pulseRate: 0,
        pulseQuality: 'Absent — no carotid or femoral pulse',
        bp: { systolic: 0, diastolic: 0 },
        capillaryRefill: 0,
        skin: 'Cyanotic, cool, diaphoretic',
        findings: [
          'Cardiac arrest — VF on monitor',
          'Refractory VF — persisting after AED shocks x2 plus additional defibrillation attempts',
          'No pulse with CPR pause',
          'ETCO2 reading 15 mmHg with good quality CPR'
        ],
        interventions: [
          'High-quality CPR — rate 100-120/min, depth 5-6cm, full recoil, minimise interruptions',
          'Defibrillation 200J biphasic — shock 3 (first crew shock)',
          'IV access — 18G right EJ or antecubital (AHA 2025: IV preferred over IO in adult arrest)',
          'IO access if IV not achievable — right proximal tibia (second-line per AHA 2025)',
          'Adrenaline 1mg IV after 3rd shock, then every 3-5 minutes',
          'Amiodarone 300mg IV after 3rd shock',
          'If still refractory after 5th shock: consider double sequential defibrillation (DSED) — AHA 2025: Class 2b, usefulness NOT established, investigational only',
          'If still refractory: Esmolol 500mcg/kg IV bolus (emerging evidence)',
          'Alternative: Lignocaine 1mg/kg IV if amiodarone ineffective',
          'Amiodarone 150mg IV after 5th shock (second dose)',
          'Consider mechanical CPR device (LUCAS) for prolonged resuscitation and transport'
        ],
        ecgFindings: ['Coarse ventricular fibrillation persisting through multiple shocks', 'No organised rhythm between shocks'],
        ivAccess: ['18G right antecubital fossa (AHA 2025: IV preferred over IO in adult arrest)', 'IO right proximal tibia as second-line if IV not achievable']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 1, total: 3 },
        pupils: 'Fixed and dilated bilaterally (8mm) — expected in arrest',
        bloodGlucose: 12.8,
        findings: ['Unresponsive', 'GCS 3', 'Fixed dilated pupils', 'BGL 12.8 mmol/L (stress response)'],
        interventions: ['Monitor pupil response — may improve with ROSC', 'Blood glucose noted — no intervention needed in arrest']
      },
      exposure: {
        temperature: 37.2,
        findings: ['No external trauma', 'Gym clothing removed for defibrillation', 'Multiple supplement containers in gym bag', 'Muscular build — possible anabolic steroid use', 'No medical alert jewellery'],
        interventions: ['Maintain dignity — cover when possible', 'Check gym bag for medications or substances', 'Note any injection sites on arms/glutes']
      }
    },
    secondarySurvey: {
      head: ['No trauma', 'No bleeding from ears or nose'],
      neck: ['No JVD assessable during CPR', 'Trachea central', 'No medical alert necklace'],
      chest: ['AED/defibrillation pads in situ', 'Good chest wall compliance with compressions', 'No chest wall deformity'],
      abdomen: ['Muscular, unable to fully assess during CPR', 'No obvious distension'],
      pelvis: ['Stable — not priority during arrest'],
      extremities: ['Large bore IV in right AC fossa', 'No track marks', 'Possible injection sites on deltoids (steroid use?)'],
      posterior: ['Log roll briefly — no spinal injury suspected', 'No posterior bleeding'],
      neurological: ['GCS 3', 'Fixed dilated pupils', 'No lateralising signs assessable']
    },
    history: {
      medications: [
        { name: 'Pre-workout supplement', dose: 'Double scoop', frequency: 'Before gym sessions', indication: 'Energy/performance', route: 'PO' },
        { name: 'Protein powder', dose: '2 scoops', frequency: 'Twice daily', indication: 'Muscle building', route: 'PO' },
        { name: 'Creatine', dose: '5g', frequency: 'Daily', indication: 'Performance', route: 'PO' }
      ],
      allergies: ['Unknown — patient unresponsive, no medical alert'],
      medicalConditions: ['Unknown — gym staff report he seemed healthy', 'Possible undisclosed cardiac history'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Gym staff say he had a protein shake approximately 1 hour before session',
      eventsLeading: 'Patient was performing heavy deadlifts (reportedly 200kg+). Completed a set, stood up, said "I feel weird," grabbed his chest, and collapsed. Gym staff witnessed the collapse, called for help, started CPR within 30 seconds. AED retrieved within 2 minutes — advised shock x2. Patient remains in VF.',
      socialHistory: {
        smoking: 'Unknown — gym environment suggests health-conscious but not conclusive',
        alcohol: 'Unknown',
        drugs: 'Gym bag contains various supplements including pre-workout with high caffeine content. Possible anabolic steroid use based on physique — not confirmed',
        occupation: 'Construction project manager — physically demanding, high stress'
      },
      familyHistory: {
        conditions: ['Unknown — unable to obtain from patient'],
        relevantToPresentation: ['Sudden cardiac death in young/middle-aged male during exertion raises concern for: hypertrophic cardiomyopathy, coronary artery disease, channelopathies (Brugada, Long QT)']
      }
    },
    investigations: [
      { name: 'Cardiac monitor', indication: 'Cardiac arrest', findings: 'Coarse VF persisting through multiple defibrillation attempts', interpretation: 'Refractory ventricular fibrillation', urgency: 'immediate' },
      { name: 'Waveform capnography', indication: 'CPR quality and ROSC detection', findings: 'ETCO2 15-22 mmHg during CPR', interpretation: 'Adequate CPR quality (>10 mmHg). Sudden rise >40 mmHg would indicate ROSC', urgency: 'immediate' },
      { name: 'Blood glucose', indication: 'Reversible cause screen', findings: '12.8 mmol/L', interpretation: 'Stress hyperglycaemia — expected in arrest', urgency: 'immediate' },
      { name: '12-lead ECG (post-ROSC)', indication: 'Identify cause of arrest', findings: 'ST elevation V1-V4, reciprocal depression II, III, aVF', interpretation: 'Acute anterior STEMI — likely cause of refractory VF. Activate cath lab.', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '0/0', pulse: 0, respiration: 0, spo2: 0, gcs: 3, etco2: 15, bloodGlucose: 12.8 },
      afterIntervention: { bp: '75/50', pulse: 120, respiration: 12, spo2: 90, gcs: 3, etco2: 38, bloodGlucose: 12.8 },
      enRoute: { bp: '85/55', pulse: 115, respiration: 14, spo2: 93, gcs: 3, etco2: 35 },
      deterioration: { bp: '0/0', pulse: 0, respiration: 0, spo2: 0, gcs: 3, etco2: 8 }
    },
    expectedFindings: {
      keyObservations: [
        'Witnessed cardiac arrest during heavy exertion',
        'Refractory VF — persisting despite multiple standard defibrillation attempts',
        'Bystander CPR and AED use — good prognostic sign',
        'Young-ish male with possible risk factors (supplements, steroids, family history unknown)',
        'ETCO2 monitoring shows adequate CPR quality'
      ],
      redFlags: [
        'Refractory VF — standard ACLS algorithm not converting rhythm',
        'Potential underlying acute MI as cause',
        'Unknown medication/substance history — possible steroid or stimulant use',
        'Prolonged resuscitation — need to consider ceiling of care and eCPR eligibility'
      ],
      differentialDiagnoses: [
        'Acute myocardial infarction (most likely — exertional chest pain preceding collapse)',
        'Hypertrophic cardiomyopathy (sudden death during exertion in middle-aged male)',
        'Drug-induced arrhythmia (pre-workout stimulants, anabolic steroids)',
        'Electrolyte abnormality (hypomagnesaemia, hypokalaemia from supplements/dehydration)',
        'Commotio cordis (unlikely — no direct chest impact)',
        'Channelopathy — Brugada syndrome, Long QT (less likely at age 48)',
        'Aortic dissection with VF (heavy Valsalva manoeuvre during deadlift)'
      ],
      mostLikelyDiagnosis: 'Acute MI causing refractory ventricular fibrillation',
      supportingEvidence: [
        'Age 48 with cardiovascular risk factors',
        'Collapse during heavy exertion (deadlift)',
        'Post-ROSC ECG showing STEMI',
        'Refractory VF consistent with acute coronary occlusion'
      ]
    },
    managementPathway: {
      immediate: [
        'Confirm cardiac arrest — check for signs of life, pulse check <10 seconds',
        'Take over CPR from bystanders — ensure high-quality compressions (100-120/min, 5-6cm depth)',
        'Apply defibrillator/monitor — confirm VF',
        'Defibrillate 200J biphasic — this is shock 3 (AED gave 2)',
        'Resume CPR immediately — 2-minute cycle',
        'Establish IV access (AHA 2025: IV preferred over IO in adult arrest)',
        'Suction airway, insert OPA, BVM ventilation',
        'Attach waveform capnography',
        'Adrenaline 1mg IV after 3rd shock',
        'Amiodarone 300mg IV after 3rd shock'
      ],
      definitive: [
        'If VF persists after 5th shock: consider double sequential defibrillation (DSED, anterior-posterior pad placement) — AHA 2025 Class 2b: usefulness NOT established, emerging/investigational evidence only',
        'Esmolol 500mcg/kg IV bolus for refractory VF (emerging evidence — consider after 5+ shocks)',
        'Alternative: Lignocaine 1mg/kg IV if amiodarone has failed',
        'Amiodarone 150mg IV (second dose) after 5th shock',
        'Mechanical CPR device (LUCAS) for transport with ongoing CPR',
        'Early cath lab activation — eCPR pathway if available',
        'Consider reversible causes: 4Hs and 4Ts — Hyper/hypokalaemia likely given supplements',
        'Magnesium 2g IV (8mmol) if hypomagnesaemia suspected or as empiric therapy in refractory VF'
      ],
      monitoring: [
        'Continuous waveform capnography — target ETCO2 >10 mmHg (>20 good prognosis)',
        'Sudden ETCO2 rise >40 mmHg suggests ROSC',
        'CPR quality feedback — rate, depth, recoil',
        'Time tracking — drug intervals, total arrest time',
        'Post-ROSC: continuous ECG, BP, SpO2, ETCO2, temperature'
      ],
      transportConsiderations: [
        'Transport with mechanical CPR (LUCAS) if available — do NOT stop CPR for transport',
        'Pre-alert cardiac catheterisation lab for eCPR/emergent PCI',
        'Nearest PCI-capable centre: Rashid Hospital or American Hospital Dubai',
        'Consider HEMS for direct cath lab transfer if ground transport prolonged',
        'Continue resuscitation en route — do not terminate on scene if young patient with witnessed arrest and shockable rhythm',
        'If ROSC achieved: temperature control 32-36°C for at least 36 hours if unresponsive (AHA 2025), post-ROSC care bundle'
      ]
    },
    studentChecklist: [
      { id: 'c13-1', category: 'safety', description: 'Scene safety — clear heavy weights around patient, ensure safe working space', points: 3, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'c13-2', category: 'abcde', description: 'Confirm cardiac arrest — pulse check <10 seconds', points: 5, yearLevel: ['4th-year'], complexity: ['advanced'], critical: true, timeframe: 'Immediate' },
      { id: 'c13-3', category: 'intervention', description: 'Take over high-quality CPR — correct rate (100-120/min), depth (5-6cm), full recoil', points: 10, yearLevel: ['4th-year'], complexity: ['advanced'], critical: true, rationale: 'CPR quality directly affects survival' },
      { id: 'c13-4', category: 'intervention', description: 'Defibrillate VF — 200J biphasic, minimise peri-shock pause (<5 seconds)', points: 10, yearLevel: ['4th-year'], complexity: ['advanced'], critical: true, timeframe: 'Within 1 minute of arrival' },
      { id: 'c13-5', category: 'abcde', description: 'Airway management — suction, OPA, BVM, consider advanced airway', points: 5, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'c13-6', category: 'intervention', description: 'Establish IV access for drug delivery (AHA 2025: IV preferred over IO in adult arrest)', points: 5, yearLevel: ['4th-year'], complexity: ['advanced'], timeframe: 'Within 2 minutes' },
      { id: 'c13-7', category: 'medication', description: 'Adrenaline 1mg IV after 3rd shock, then every 3-5 minutes', points: 10, yearLevel: ['4th-year'], complexity: ['advanced'], critical: true },
      { id: 'c13-8', category: 'medication', description: 'Amiodarone 300mg IV after 3rd shock', points: 10, yearLevel: ['4th-year'], complexity: ['advanced'], critical: true },
      { id: 'c13-9', category: 'equipment', description: 'Attach waveform capnography and use ETCO2 to monitor CPR quality', points: 10, yearLevel: ['4th-year'], complexity: ['advanced'], rationale: 'ETCO2 >10mmHg indicates adequate CPR, >20mmHg good prognosis, sudden rise >40mmHg suggests ROSC' },
      { id: 'c13-10', category: 'clinical-reasoning', description: 'Recognise refractory VF and escalate management beyond standard ALS algorithm', points: 15, yearLevel: ['4th-year'], complexity: ['advanced'], critical: true, rationale: 'Refractory VF requires advanced strategies — DSED (Class 2b, investigational), esmolol, lignocaine' },
      { id: 'c13-11', category: 'intervention', description: 'Consider double sequential defibrillation (DSED) after 5+ failed shocks — AHA 2025 Class 2b: not established, discuss as investigational', points: 10, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'c13-12', category: 'medication', description: 'Consider Esmolol 500mcg/kg IV or Lignocaine 1mg/kg IV for refractory VF', points: 10, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'c13-13', category: 'clinical-reasoning', description: 'Systematically consider reversible causes (4Hs and 4Ts) — especially acute MI and electrolyte abnormalities', points: 10, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'c13-14', category: 'communication', description: 'Early activation of cardiac catheterisation lab / eCPR pathway', points: 10, yearLevel: ['4th-year'], complexity: ['advanced'], critical: true },
      { id: 'c13-15', category: 'equipment', description: 'Request and deploy mechanical CPR device (LUCAS) for transport', points: 5, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'c13-16', category: 'team-lead', description: 'Effective team leadership — assign roles, closed-loop communication, time management', points: 10, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'c13-17', category: 'documentation', description: 'Accurate documentation — shock times, drug times, CPR quality metrics, total arrest time', points: 5, yearLevel: ['4th-year'], complexity: ['advanced'] }
    ],
    teachingPoints: [
      'Refractory VF is defined as VF persisting after 3 or more defibrillation attempts with appropriate energy and CPR',
      'Double sequential defibrillation (DSED) involves two defibrillators with pads in different vectors (anterior-lateral AND anterior-posterior). AHA 2025 rates DSED as Class 2b — usefulness is NOT established. While some observational studies suggest improved conversion rates, this remains investigational and should not be treated as standard practice. Discuss as an emerging option only.',
      'Esmolol 500mcg/kg IV bolus is emerging as a treatment for refractory VF — acts by reducing myocardial oxygen demand and may facilitate defibrillation',
      'Lignocaine 1mg/kg IV is an alternative antiarrhythmic to amiodarone — some evidence suggests superiority in refractory VF, particularly from cardiac aetiology',
      'ETCO2 monitoring is essential — values >10mmHg indicate adequate CPR quality, >20mmHg associated with better outcomes, sudden rise >40mmHg is earliest sign of ROSC',
      'Mechanical CPR devices (LUCAS) provide consistent compressions and allow safe transport with ongoing CPR — essential for refractory arrest requiring cath lab transfer',
      'eCPR (extracorporeal CPR) pathway: young patient + witnessed arrest + shockable rhythm + no ROSC after 10-15 minutes = candidate for emergency cardiac catheterisation with ongoing mechanical CPR',
      'Pre-workout supplements with high caffeine content (300-600mg per dose) can precipitate arrhythmias, especially combined with intense exercise and dehydration',
      'Anabolic steroid use is associated with left ventricular hypertrophy, coronary artery disease, and increased risk of sudden cardiac death during exertion',
      'In the gym setting — always check for supplements, syringes, and medications in the patient\'s bag. This information changes differential diagnosis and management',
      'AHA 2025: IV access is preferred over IO in adult cardiac arrest. IO is second-line when IV is not achievable',
      'Transport decisions in refractory VF: do NOT terminate on scene if patient is young, arrest was witnessed, rhythm is shockable. Transport with mechanical CPR to PCI-capable centre',
      'Magnesium 2g IV can be given empirically in refractory VF — may be particularly useful if hypomagnesaemia from exercise/dehydration/supplements',
      'Post-ROSC care (AHA 2025): temperature control at 32-36°C for at least 36 hours in adults who remain unresponsive. Maintain MAP >65mmHg, emergent coronary angiography, avoid hyperoxia (target SpO2 94-98%)'
    ],
    commonPitfalls: [
      'Failing to recognise refractory VF and continuing standard ALS without escalation',
      'Poor CPR quality — inadequate depth, rate, or incomplete recoil reduce survival to near zero',
      'Long peri-shock pauses (>5 seconds) — compressions should resume immediately after shock',
      'Delaying adrenaline and amiodarone — both should be given after the 3rd shock',
      'Not attaching waveform capnography — losing valuable CPR quality and ROSC detection data',
      'Terminating resuscitation too early in a young patient with witnessed arrest and shockable rhythm',
      'Failing to consider reversible causes — especially acute MI which is treatable even during CPR',
      'Not requesting mechanical CPR device early enough — delays transport to cath lab',
      'Ignoring the gym bag contents — supplements and steroids are critical history',
      'Hyperventilating the patient with BVM — aim for 10 breaths/min with advanced airway, excessive ventilation reduces venous return',
      'Forgetting to check the AED event log for shock times and rhythm analysis from bystander use',
      'Not pre-alerting the receiving hospital with specific STEMI + refractory VF information'
    ],
    equipmentNeeded: [
      'Monitor/defibrillator with manual and advisory modes',
      'Second defibrillator for double sequential defibrillation',
      'Anterior-posterior defibrillation pads',
      'Waveform capnography',
      'BVM with reservoir (adult)',
      'Oropharyngeal airways (sizes 3, 4)',
      'Supraglottic airway (i-gel size 4) or ETT kit',
      'Suction unit with yankauer and flexible catheters',
      'IV cannulation kit (16G, 18G)',
      'IO drill and needles (proximal tibia, humeral head)',
      'Adrenaline 1mg prefilled syringes (x5)',
      'Amiodarone 300mg (x2)',
      'Esmolol 100mg/10ml',
      'Lignocaine 1% (100mg/10ml)',
      'Magnesium sulfate 50% (2g/4ml)',
      'Normal saline 250ml bags (x2)',
      'Mechanical CPR device (LUCAS)',
      'CPR feedback device (metronome/accelerometer)',
      'Transport stretcher'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Cardiac Arrest Protocol v5.1',
        'DCAS Advanced Life Support — Adult Cardiac Arrest Algorithm',
        'DCAS Refractory VF/VT Pathway',
        'Dubai eCPR Activation Criteria (Rashid Hospital)',
        'UAE National Ambulance ALS Protocol'
      ],
      receivingFacilities: [
        { name: 'Rashid Hospital', location: 'Dubai', capabilities: ['24/7 PCI', 'eCPR Programme', 'Cardiac Surgery', 'ECMO'], contact: '04 219 3000', distance: '15km from Al Quoz' },
        { name: 'American Hospital Dubai', location: 'Oud Metha', capabilities: ['24/7 PCI', 'Cardiac ICU'], contact: '04 377 5500', distance: '12km from Al Quoz' },
        { name: 'Cleveland Clinic Abu Dhabi', location: 'Abu Dhabi', capabilities: ['24/7 PCI', 'eCPR', 'ECMO', 'Cardiac Surgery'], contact: '02 501 9000', distance: '130km — HEMS transfer only' }
      ],
      localConsiderations: [
        'Al Quoz Industrial Area — evening traffic usually light but route planning essential',
        'Mechanical CPR device allows safe transport on Sheikh Zayed Road',
        'Rashid Hospital is the primary eCPR centre for Dubai — pre-alert interventional cardiology on-call',
        'Gym environments in UAE — check for unregistered supplements common in bodybuilding culture',
        'Dubai summer temperatures can cause dehydration and electrolyte imbalances compounding arrest risk'
      ]
    }
  }),

  // CARDIAC CASE 014 - Hypothermic Drowning Cardiac Arrest (3rd/4th Year)
  createCase({
    id: 'cardiac-014',
    title: 'Hypothermic Drowning - Cardiac Arrest',
    category: 'environmental',
    subcategory: 'drowning',
    // Primary rhythm is asystole — VF mention in ecgFindings is a
    // downstream contingency during rewarming, not the presenting strip.
    initialRhythm: 'Asystole',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Child pulled from swimming pool, not breathing, no pulse — bystander CPR attempted then stopped',
      timeOfDay: 'morning',
      location: 'Grand Palms Hotel, Jumeirah Beach Road, Dubai',
      callerInfo: 'Hotel duty manager (panicked, limited first aid knowledge)',
      dispatchCode: 'Echo-1',
      additionalInfo: [
        '8-year-old boy found face-down in unheated hotel pool',
        'Estimated submersion time 5-8 minutes',
        'Hotel staff pulled him out and started CPR but stopped — believe he has been under too long',
        'Pool is outdoor, unheated — winter season',
        'Mother is on scene, extremely distressed'
      ]
    },
    patientInfo: {
      age: 8,
      gender: 'male',
      weight: 28,
      occupation: 'School student (tourist)',
      language: 'English, Arabic',
      culturalConsiderations: ['Family are tourists from UK', 'Mother on scene — will need support and information']
    },
    sceneInfo: {
      description: 'Hotel poolside, outdoor unheated pool. Child lying on pool deck, wet, cold. Hotel towels placed over him. Pool water temperature approximately 18°C (winter in Dubai). No lifeguard on duty.',
      hazards: ['Wet pool deck — slip risk', 'Child is soaking wet and cold — risk of hypothermia to rescuers unlikely but note'],
      bystanders: 'Mother (hysterical, being comforted by hotel staff), hotel duty manager, two housekeeping staff',
      environment: 'Outdoor poolside, morning, air temperature 20°C, breezy. Child soaking wet, estimated core temperature significantly below normal.',
      environmentVariant: 'water',
      sceneImagePath: '/scene-assets/paediatric-pool-rescue-environment.png',
      sceneImageCaption: 'Paediatric drowning — hotel poolside, Dubai',
      accessIssues: ['Pool area accessible through hotel lobby', 'Stretcher access via service entrance — hotel staff to guide'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Small child, cold and pale, lying on pool deck wrapped in wet towels, not moving, no signs of life',
      position: 'Supine on pool deck',
      appearance: 'Pale/grey, cyanotic lips, cold and wet, motionless',
      consciousness: 'Unresponsive',
      sounds: ['Mother crying', 'No sounds from patient']
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Airway not maintained', 'Water and possible vomit in oropharynx', 'No gag reflex', 'Tongue occluding airway — head tilt chin lift'],
        interventions: [
          'Head tilt, chin lift — open airway',
          'Suction oropharynx — clear water and vomit',
          'OPA size 2 (pediatric)',
          '5 rescue breaths FIRST (drowning protocol — ventilation priority)',
          'BVM ventilation with pediatric mask and appropriate bag',
          'Consider supraglottic airway or ETT — high aspiration risk, definitive airway preferred early'
        ],
        adjunctsNeeded: ['Pediatric OPA', 'Suction', 'Pediatric BVM with reservoir', 'Pediatric i-gel or cuffed ETT (5.5mm)']
      },
      breathing: {
        rate: 0,
        rhythm: 'Absent',
        depth: 'Absent',
        spo2: 0,
        findings: ['Apnoeic', 'No respiratory effort', 'Bilateral coarse crackles heard after initial BVM ventilation (aspirated water)', 'Significant gastric distension from swallowed water'],
        interventions: [
          '5 initial rescue breaths (drowning resuscitation — ventilation is priority)',
          'BVM ventilation with 100% O2 at 15L/min',
          'Aim 12-20 breaths/min (age appropriate)',
          'Gastric distension expected — NG tube if available to decompress',
          'Expect poor compliance initially due to water in lungs — may need higher pressures',
          'Waveform capnography — attach once advanced airway placed'
        ],
        auscultation: ['Bilateral coarse crackles (aspirated water)', 'Reduced air entry bilaterally initially']
      },
      circulation: {
        pulseRate: 0,
        pulseQuality: 'Absent — no carotid or brachial pulse',
        bp: { systolic: 0, diastolic: 0 },
        capillaryRefill: 0,
        skin: 'Cold (core temp 28°C), pale/grey, cyanotic, mottled',
        findings: [
          'Cardiac arrest — asystole on monitor (hypothermic arrest)',
          'Core temperature 28°C (severe hypothermia)',
          'No palpable pulses — check for 30-60 seconds in hypothermia (may be very slow/weak)',
          'ETCO2 very low (8 mmHg) — expected in hypothermic arrest'
        ],
        interventions: [
          'CPR — pediatric ratio 15:2 (two rescuers), depth 1/3 anterior-posterior chest diameter (~4-5cm)',
          'Remove wet clothing immediately — replace with dry blankets, space blanket',
          'IV access — 22G dorsal hand or antecubital (may be very difficult — cold vasoconstriction)',
          'IO access — left proximal tibia (preferred in pediatric arrest)',
          'Adrenaline 10mcg/kg (0.28mg for 28kg) IV/IO — BUT withhold adrenaline until core temp >30°C, then give at DOUBLE intervals',
          'Warm IV fluids — 20ml/kg bolus (560ml) warmed to 40°C if available',
          'Active rewarming measures (see exposure)',
          'Defibrillation: if VF/VT develops — give up to 3 shocks, if unsuccessful withhold further shocks until core temp >30°C',
          'Asystole in hypothermia: continue CPR — asystole may convert to VF then sinus rhythm as patient rewarms'
        ],
        ecgFindings: ['Asystole initially', 'May see Osborn (J) waves if any electrical activity returns during rewarming', 'VF may develop during rewarming — be prepared to defibrillate'],
        ivAccess: ['22G left hand (difficult — cold vasoconstriction)', 'IO left proximal tibia 15mm needle — preferred route']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 1, total: 3 },
        pupils: 'Fixed and dilated (6mm) — DO NOT use as prognostic indicator in hypothermia',
        bloodGlucose: 2.1,
        findings: [
          'Unresponsive, GCS 3',
          'Fixed dilated pupils — EXPECTED in hypothermia, NOT a sign of death',
          'Blood glucose 2.1 mmol/L — CRITICAL HYPOGLYCAEMIA (children deplete glycogen rapidly in hypothermia)',
          'No assessable reflexes'
        ],
        interventions: [
          'Dextrose 10% 2ml/kg IV/IO (0.2g/kg = 56ml for a 28kg child) for hypoglycaemia — per APLS; may repeat if BGL remains <4.0 mmol/L',
          'If 10% unavailable: Dextrose 25% 2ml/kg (56ml)',
          'Recheck BGL every 5-10 minutes',
          'Do NOT use pupil response as prognostic indicator in hypothermia'
        ]
      },
      exposure: {
        temperature: 28,
        findings: [
          'Core temperature 28°C (severe hypothermia — measured via tympanic as initial estimate, need oesophageal/rectal for accuracy)',
          'Soaking wet in swim shorts only',
          'Cold to touch throughout',
          'Skin mottled, pale/grey',
          'No external injuries visible',
          'No signs of non-accidental injury'
        ],
        interventions: [
          'REMOVE ALL WET CLOTHING immediately',
          'Dry the patient thoroughly',
          'Wrap in dry blankets + space blanket (foil blanket)',
          'Warm IV fluids (40°C) — 20ml/kg bolus',
          'Chemical heat packs to axillae and groin (avoid direct skin contact — use cloth barrier)',
          'Warm the ambulance to maximum temperature',
          'Handle gently — rough handling can precipitate VF in hypothermic patients',
          'Active rewarming target: 1°C per hour until 32°C, then slower',
          'Post-ROSC target temperature 36°C (NOT therapeutic hypothermia in drowning — they are already cold). AHA 2025: once rewarmed, maintain temperature control 32-36°C for at least 36 hours if patient remains unresponsive',
          'Continuous core temperature monitoring'
        ]
      }
    },
    secondarySurvey: {
      head: ['No trauma', 'No signs of head injury pre-submersion'],
      neck: ['C-spine considered — no mechanism for spinal injury (pool, not diving)', 'Trachea central'],
      chest: ['Bilateral crackles (aspirated water)', 'Equal chest rise with ventilation', 'Gastric distension present'],
      abdomen: ['Distended — swallowed water', 'NG decompression if available'],
      pelvis: ['Normal — no concerns'],
      extremities: ['Cold peripherally', 'IO in situ left tibia', 'No injuries'],
      posterior: ['No bruising or injuries', 'No signs of non-accidental injury'],
      neurological: ['GCS 3', 'Fixed dilated pupils (expected in hypothermia — NOT prognostic)', 'No lateralising signs assessable']
    },
    history: {
      medications: [
        { name: 'Salbutamol inhaler', dose: '100mcg', frequency: 'As needed', indication: 'Mild asthma', route: 'Inhaled' }
      ],
      allergies: ['Penicillin (rash)'],
      medicalConditions: ['Mild asthma (exercise-induced)', 'Otherwise healthy child'],
      surgicalHistory: ['None'],
      lastMeal: 'Breakfast at hotel approximately 1.5 hours ago (cereal and toast — mother confirms)',
      eventsLeading: 'Family staying at hotel on holiday from UK. Mother was in hotel room, child went to pool area alone approximately 8:15am. Hotel housekeeper found child face-down in deep end of unheated outdoor pool at approximately 8:22am. Estimated submersion 5-8 minutes. Staff pulled child from water, placed on pool deck, attempted CPR for approximately 2 minutes then stopped because "he is cold and has been under too long." Ambulance called at 8:25am.',
      socialHistory: {
        occupation: 'Year 3 primary school student',
        livingSituation: 'Lives with parents and younger sister in London, UK — on holiday in Dubai'
      },
      familyHistory: {
        conditions: ['No family history of cardiac disease', 'No epilepsy', 'Mother has asthma'],
        relevantToPresentation: ['No predisposing conditions for drowning identified']
      }
    },
    investigations: [
      { name: 'Cardiac monitor', indication: 'Cardiac arrest', findings: 'Asystole initially; may develop VF during rewarming', interpretation: 'Hypothermic cardiac arrest — asystole common at <28°C', urgency: 'immediate' },
      { name: 'Core temperature', indication: 'Hypothermia assessment', findings: '28°C (tympanic — may underestimate)', interpretation: 'Severe hypothermia (<30°C). Oesophageal or rectal temperature more accurate.', urgency: 'immediate' },
      { name: 'Blood glucose', indication: 'Pediatric arrest — glycogen depletion risk', findings: '2.1 mmol/L', interpretation: 'Critical hypoglycaemia — children deplete glycogen rapidly in cold. Treat immediately with IV dextrose.', urgency: 'immediate' },
      { name: 'Waveform capnography', indication: 'CPR quality and ROSC detection', findings: 'ETCO2 8 mmHg initially, rising to 14 with rewarming', interpretation: 'Low ETCO2 expected in hypothermia — do NOT use for prognostication. Rising values suggest improving perfusion.', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '0/0', pulse: 0, respiration: 0, spo2: 0, gcs: 3, temperature: 28, bloodGlucose: 2.1, etco2: 8 },
      afterIntervention: { bp: '70/40', pulse: 50, respiration: 8, spo2: 88, gcs: 3, temperature: 30, bloodGlucose: 5.2, etco2: 28 },
      enRoute: { bp: '80/50', pulse: 58, respiration: 12, spo2: 92, gcs: 3, temperature: 31, bloodGlucose: 6.0, etco2: 32 }
    },
    expectedFindings: {
      keyObservations: [
        'Pediatric drowning with cardiac arrest',
        'Severe hypothermia (28°C) — neuroprotective potential',
        'Witnessed submersion with relatively short immersion time (5-8 minutes)',
        'Bystander CPR was started but inappropriately stopped',
        'Critical hypoglycaemia requiring urgent treatment',
        'Asystole — typical rhythm in severe hypothermia'
      ],
      redFlags: [
        'Bystander CPR stopped prematurely — "cold and too long" is NOT a reason to stop',
        'Severe hypothermia — drug dosing modifications required',
        'Hypoglycaemia — paediatric emergency within the emergency',
        'High aspiration risk from swallowed/aspirated water',
        'Unwitnessed submersion duration — could be longer than estimated',
        'Safeguarding concern — unsupervised child at pool with no lifeguard'
      ],
      differentialDiagnoses: [
        'Primary drowning (most likely — unsupervised child)',
        'Drowning secondary to seizure (child has asthma — no epilepsy history but consider)',
        'Drowning secondary to trauma (head injury on pool edge — examine head)',
        'Drowning secondary to cardiac event (rare in 8yo but consider Long QT)',
        'Non-accidental injury (always consider in paediatric drowning — examine for marks)'
      ],
      mostLikelyDiagnosis: 'Primary drowning with hypothermic cardiac arrest',
      supportingEvidence: [
        'Found face-down in unheated pool',
        'Unsupervised child — no lifeguard',
        'Severe hypothermia consistent with cold water immersion',
        'Cardiac arrest rhythm (asystole) consistent with hypothermia'
      ]
    },
    managementPathway: {
      immediate: [
        'Confirm cardiac arrest — check pulse for 30-60 seconds (pulses may be very faint in hypothermia)',
        '5 rescue breaths FIRST (drowning protocol — ventilation before compressions)',
        'If no signs of life after rescue breaths: start CPR 15:2 (pediatric)',
        'Remove ALL wet clothing — dry thoroughly',
        'Suction airway — water and vomit likely',
        'Insert OPA and commence BVM ventilation with 100% O2',
        'Apply cardiac monitor — identify rhythm',
        'Obtain core temperature',
        'IO access — preferred in pediatric arrest (left proximal tibia)'
      ],
      definitive: [
        'Active rewarming: dry blankets, space blanket, warm IV fluids, heat packs to axillae/groin',
        'Treat hypoglycaemia immediately — Dextrose 10% 2ml/kg IV (0.2g/kg)/IO',
        'Adrenaline: WITHHOLD entirely while core temperature <30°C (drugs do not work, accumulate → post-rewarming toxicity). Once core >30°C, give 10mcg/kg IV/IO at DOUBLE intervals (every 10 minutes, not the usual 3-5 min) per Resus Council UK Hypothermia 2021.',
        'If rhythm changes to VF: defibrillate at 4J/kg (112J), up to 3 shocks — withhold further shocks until >30°C',
        'Warm IV fluids: Normal saline warmed to 40°C, 20ml/kg bolus',
        'Advanced airway: cuffed ETT 5.5mm or pediatric i-gel for definitive airway and aspiration prevention',
        'NG/OG tube to decompress stomach (swallowed water)',
        'Continue CPR until rewarmed to 32°C minimum — "not dead until warm and dead"',
        'Consider ECMO rewarming at receiving centre if no ROSC despite rewarming to >32°C'
      ],
      monitoring: [
        'Continuous core temperature — serial measurements every 5 minutes',
        'Cardiac monitor — watch for rhythm changes during rewarming',
        'Blood glucose — recheck every 5-10 minutes (children deplete rapidly)',
        'ETCO2 — do not use for prognostication in hypothermia but trend is useful',
        'SpO2 — unreliable in hypothermia/poor perfusion but attach',
        'Handle GENTLY — rough handling precipitates VF in hypothermia'
      ],
      transportConsiderations: [
        'Transport to ECMO-capable paediatric centre if available',
        'Nearest facility: Al Jalila Children\'s Specialty Hospital or Dubai Hospital Pediatric ICU',
        'Pre-alert receiving hospital: pediatric hypothermic cardiac arrest, drowning, current core temp',
        'Warm the ambulance to maximum temperature',
        'Continue aggressive rewarming en route',
        'Do NOT stop CPR — prolonged resuscitation (60+ minutes) indicated in hypothermic arrest',
        'Hypothermic bradycardia after ROSC is NORMAL — do NOT give atropine for HR 40-50 in hypothermia'
      ]
    },
    studentChecklist: [
      { id: 'c14-1', category: 'safety', description: 'Scene safety — wet poolside, ensure safe access', points: 3, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c14-2', category: 'abcde', description: 'Confirm cardiac arrest — extended pulse check (30-60 seconds in hypothermia)', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'Pulses may be very faint or slow in severe hypothermia — do not declare absent too quickly' },
      { id: 'c14-3', category: 'intervention', description: 'Begin with 5 rescue breaths FIRST (drowning protocol) before compressions', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'Drowning is a hypoxic arrest — ventilation is the priority' },
      { id: 'c14-4', category: 'intervention', description: 'Start pediatric CPR at 15:2 ratio with correct depth (1/3 AP diameter). AHA 2025: pauses in compressions must be <10 seconds', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'c14-5', category: 'intervention', description: 'Remove all wet clothing and begin active rewarming immediately', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'c14-6', category: 'abcde', description: 'Suction airway — clear water and vomitus, manage high aspiration risk', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c14-7', category: 'intervention', description: 'Obtain core temperature and recognise severe hypothermia (<30°C)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'c14-8', category: 'clinical-reasoning', description: 'State "nobody is dead until warm and dead" — commit to prolonged resuscitation', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'Hypothermia is neuroprotective — children have survived after >60 minutes of cold water submersion' },
      { id: 'c14-9', category: 'medication', description: 'Withhold adrenaline until core temp >30°C, then give at double intervals', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'c14-10', category: 'clinical-reasoning', description: 'Limit defibrillation to 3 shocks until core temp >30°C', points: 5, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'c14-11', category: 'medication', description: 'Check blood glucose and treat critical hypoglycaemia with Dextrose 10% 5ml/kg', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'Children deplete glycogen rapidly in hypothermia — hypoglycaemia worsens neurological outcome' },
      { id: 'c14-12', category: 'intervention', description: 'Establish IO access (preferred in pediatric arrest) with correct weight-based dosing', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c14-13', category: 'intervention', description: 'Warm IV fluids (40°C) — 20ml/kg bolus for rewarming', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c14-14', category: 'clinical-reasoning', description: 'Recognise hypothermic bradycardia post-ROSC as normal — do NOT give atropine', points: 10, yearLevel: ['4th-year'], complexity: ['advanced'], rationale: 'Bradycardia is a physiological response to hypothermia, not pathological — atropine is ineffective and unnecessary' },
      { id: 'c14-15', category: 'communication', description: 'Pre-alert paediatric centre with hypothermic drowning arrest details', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c14-16', category: 'communication', description: 'Communicate with mother — provide reassurance, explain ongoing resuscitation', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c14-17', category: 'clinical-reasoning', description: 'Consider safeguarding — unsupervised child, document circumstances', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] }
    ],
    teachingPoints: [
      '"Nobody is dead until they are WARM and dead" — hypothermia provides significant neuroprotection, especially in children. Cases of full neurological recovery after >60 minutes cold water submersion are documented.',
      'Drowning resuscitation begins with 5 rescue breaths (not 30:2) — this is a hypoxic arrest where oxygenation is the immediate priority',
      'Core temperature measurement: tympanic thermometers are unreliable in hypothermia and may over-read. Oesophageal probe is gold standard prehospital; rectal is acceptable.',
      'Defibrillation in severe hypothermia (<30°C): the heart may not respond to electrical therapy. Give up to 3 shocks — if unsuccessful, withhold further shocks until rewarmed above 30°C',
      'Drug dosing in hypothermia: below 30°C, hepatic metabolism is severely impaired. Withhold adrenaline until >30°C, then give at double the normal interval (every 6-10 minutes instead of 3-5)',
      'Children deplete glycogen stores rapidly in hypothermia — ALWAYS check blood glucose. Hypoglycaemia worsens neurological outcome and must be treated aggressively',
      'Active rewarming strategy: remove wet clothes, dry thoroughly, warm blankets, space blanket, warm IV fluids (40°C), chemical heat packs to axillae and groin (with cloth barrier)',
      'Handle hypothermic patients GENTLY — rough handling, rapid position changes, and cold stimuli can precipitate ventricular fibrillation in the irritable hypothermic myocardium',
      'Gastric distension is very common in drowning — children swallow large amounts of water. Decompress with NG/OG tube if available to improve ventilation',
      'Post-ROSC hypothermic bradycardia (HR 40-50) is a normal physiological response — do NOT treat with atropine. The heart rate will increase as the patient rewarms.',
      'Post-ROSC temperature target in drowning: 36°C (normothermia). These patients are already hypothermic — aggressive rewarming is the priority, not therapeutic cooling. AHA 2025: for adults who remain unresponsive post-ROSC, maintain temperature control (32-36°C) for at least 36 hours. In pediatric drowning, rewarm to normothermia first.',
      'UAE drowning context: hotel pools (especially unheated winter pools), wadis after rain, and construction site water features are common drowning locations. Many hotels lack lifeguards at all hours.',
      'Safeguarding consideration: always document the circumstances of paediatric drowning — who was supervising, how long was the child unattended, any suspicious circumstances',
      'ECMO rewarming is the gold standard for hypothermic cardiac arrest — transport to an ECMO-capable centre if no ROSC despite rewarming above 32°C',
      'Pediatric weight-based dosing reminders: Adrenaline 10mcg/kg, Defibrillation 4J/kg, Dextrose 10% at 5ml/kg, IV fluid bolus 20ml/kg'
    ],
    commonPitfalls: [
      'Stopping CPR because the patient is cold and "has been too long" — this is the most dangerous misconception in hypothermic arrest',
      'Starting with 30:2 instead of 5 rescue breaths — drowning is a hypoxic arrest, ventilation comes first',
      'Using tympanic temperature and assuming it is accurate — tympanic readings significantly overestimate core temp in hypothermia',
      'Giving adrenaline immediately at standard intervals — drugs accumulate in hypothermia and cause toxicity on rewarming',
      'Repeated defibrillation attempts below 30°C — wastes time and the hypothermic heart will not convert',
      'Declaring death based on fixed dilated pupils in a hypothermic patient — pupils are unreliable in hypothermia',
      'Forgetting to check blood glucose — paediatric hypoglycaemia is a silent killer in hypothermic arrest',
      'Rough patient handling — triggers VF in the irritable hypothermic myocardium',
      'Giving atropine for post-ROSC bradycardia — hypothermic bradycardia is physiological and will resolve with rewarming',
      'Not removing wet clothing — wet clothes accelerate heat loss and prevent rewarming',
      'Placing heat packs directly on skin — causes burns in vasoconstricted, cold skin. Always use cloth barrier.',
      'Using adult drug doses — weight-based dosing is critical in paediatrics (this child is 28kg)',
      'Failing to decompress the stomach — gastric distension from swallowed water impairs ventilation',
      'Terminating resuscitation too early — hypothermic arrest in children warrants at least 60 minutes of resuscitation or until rewarmed to 32°C',
      'Not considering safeguarding — unsupervised child at a pool requires documentation and reporting'
    ],
    equipmentNeeded: [
      'Pediatric monitor/defibrillator with pediatric pads',
      'Pediatric BVM with reservoir and selection of masks',
      'Oropharyngeal airways (sizes 0-3)',
      'Suction unit with pediatric yankauer',
      'Pediatric supraglottic airway or cuffed ETT (5.5mm)',
      'IO drill with 15mm pediatric needles',
      'IV cannulation kit (22G, 24G)',
      'Waveform capnography (pediatric)',
      'Core temperature probe (oesophageal or rectal)',
      'Adrenaline 1:10,000 (10mcg/kg = 0.28mg for 28kg child)',
      'Dextrose 10% solution (5ml/kg = 140ml)',
      'Normal saline 500ml warmed to 40°C',
      'Fluid warming device (if available)',
      'Space blanket (foil blanket)',
      'Dry blankets x4',
      'Chemical heat packs x4',
      'Cloth barriers for heat packs',
      'NG/OG tube (pediatric)',
      'Glucometer',
      'Pediatric drug dose reference chart or calculator'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Pediatric Cardiac Arrest Protocol v4.0',
        'DCAS Drowning/Submersion Injury Protocol',
        'DCAS Hypothermia Management Protocol',
        'ILCOR 2025 Drowning Resuscitation Guidelines',
        'UAE Child Protection Law (Federal Law No. 3 of 2016)'
      ],
      receivingFacilities: [
        { name: 'Al Jalila Children\'s Specialty Hospital', location: 'Dubai', capabilities: ['Pediatric ICU', 'Pediatric Emergency', 'ECMO'], contact: '04 248 6666', distance: '10km from Jumeirah Beach Road' },
        { name: 'Dubai Hospital — Pediatric Emergency', location: 'Dubai', capabilities: ['Pediatric ICU', 'Pediatric Emergency'], contact: '04 219 5000', distance: '8km from Jumeirah Beach Road' },
        { name: 'Latifa Hospital for Women and Children', location: 'Dubai', capabilities: ['Pediatric ICU', 'Pediatric Emergency', 'PICU'], contact: '04 219 3000', distance: '7km from Jumeirah Beach Road' }
      ],
      localConsiderations: [
        'Dubai winter pool temperatures can drop to 16-20°C — significant hypothermia risk especially for children',
        'Many hotel pools do not have full-time lifeguards outside of peak hours',
        'UAE Child Protection Law requires mandatory reporting of child welfare concerns — document circumstances thoroughly',
        'Tourist families may not have UAE health insurance — hospital financial counsellor may be needed',
        'Language considerations — ensure family understands ongoing resuscitation and transport decisions'
      ]
    }
  }),

  // ==================== REFRACTORY ANAPHYLAXIS ====================
  createCase({
    id: 'resp-010',
    title: 'Refractory Anaphylaxis — Bee Sting',
    category: 'respiratory',
    subcategory: 'anaphylaxis',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: '45-year-old male collapsed on construction site after bee sting, severe breathing difficulty',
      timeOfDay: 'afternoon',
      location: 'Construction site, Al Quoz Industrial Area, Dubai',
      callerInfo: 'Site foreman (panicked)',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient stung by bee', 'Face swelling rapidly', 'Difficulty breathing', 'Becoming drowsy']
    },
    patientInfo: {
      age: 45,
      gender: 'male',
      weight: 90,
      occupation: 'Construction worker',
      language: 'Hindi, basic English',
      culturalConsiderations: ['South Asian worker — language barrier possible', 'May be reluctant to remove clothing on site']
    },
    sceneInfo: {
      description: 'Active construction site, patient on ground near scaffolding, co-workers surrounding him',
      hazards: ['Active construction site', 'Overhead hazards', 'Possible further bee exposure', 'Hot environment (40°C+)'],
      bystanders: 'Multiple co-workers, site foreman, first aid officer',
      environment: 'Outdoor, hot (42°C), dusty, limited shade',
      environmentVariant: 'industrial',
      sceneImagePath: '/scene-assets/construction-anaphylaxis-male-uae.png',
      sceneImageCaption: 'Scene — Outdoor, hot (42°C), dusty, limited shade',
      accessIssues: ['Construction site access — security gate', 'Uneven ground for stretcher'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male on ground, severe facial and neck swelling, stridulous breathing, altered consciousness',
      position: 'Semi-recumbent on ground, propped against wall',
      appearance: 'Grossly swollen face and neck, cyanotic lips, widespread urticaria, drenched in sweat',
      consciousness: 'Drowsy, responding to voice only, confused',
      sounds: ['Inspiratory stridor', 'Gurgling', 'Weak moan']
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Airway critically compromised', 'Severe angioedema of face, lips, tongue, and pharynx', 'Inspiratory stridor (high-pitched)', 'Drooling — unable to swallow secretions', 'Voice barely audible', 'Tongue protruding and swollen'],
        interventions: ['IM Adrenaline 0.5mg IMMEDIATELY', 'Suction oropharynx', 'Jaw thrust', 'Nebulised adrenaline 5mg (if available)', 'Prepare for advanced airway — RSI if GCS drops further'],
        adjunctsNeeded: ['Suction', 'Nebuliser', 'RSI equipment on standby']
      },
      breathing: {
        rate: 36,
        rhythm: 'Labored, irregular',
        depth: 'Shallow',
        spo2: 82,
        findings: ['Severe tachypnea', 'Marked accessory muscle use', 'Intercostal and subcostal recession', 'Bilateral wheeze and stridor', 'Minimal air entry bilaterally', 'Cyanosis of lips and fingertips'],
        interventions: ['High-flow oxygen 15L/min via non-rebreather', 'BVM ventilation if respiratory effort inadequate', 'Nebulised adrenaline 5mg'],
        auscultation: ['Inspiratory stridor', 'Widespread expiratory wheeze', 'Markedly reduced air entry bilaterally']
      },
      circulation: {
        pulseRate: 140,
        pulseQuality: 'Rapid, weak, thready — barely palpable radially',
        bp: { systolic: 65, diastolic: 30 },
        capillaryRefill: 6,
        skin: 'Flushed centrally, mottled peripheries, widespread urticaria, profusely diaphoretic',
        findings: ['Severe tachycardia', 'Profound hypotension (cardiovascular collapse)', 'Distributive shock', 'Cap refill >5 seconds', 'Peripheral mottling'],
        interventions: ['IV access x2 (large bore 14-16G)', 'Aggressive IV fluid bolus — 1L normal saline STAT, repeat as needed', 'IO access if IV fails', 'Adrenaline infusion if IM doses fail'],
        ivAccess: ['Attempt 16G bilateral antecubital fossa', 'IO tibial if IV access fails']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 3, verbal: 3, motor: 6, total: 12 },
        pupils: 'Equal 4mm, sluggish reaction',
        bloodGlucose: 7.8,
        findings: ['Altered consciousness — GCS 12, deteriorating', 'Confused and agitated', 'Responds to voice but disoriented', 'GCS likely to drop further without treatment'],
        interventions: ['Continuous GCS monitoring', 'Prepare RSI drugs if GCS drops to 8 or below']
      },
      exposure: {
        temperature: 38.2,
        findings: ['Bee sting site on right forearm — localised swelling and erythema', 'Widespread urticaria over entire torso, arms, and legs', 'Severe angioedema of face and neck', 'No other injuries', 'Hot environment contributing to vasodilation'],
        interventions: ['Remove sting if still present (scrape, do not squeeze)', 'Full exposure', 'Active cooling — move to shade, wet towels']
      }
    },
    secondarySurvey: {
      head: ['Massive periorbital angioedema — eyes swollen shut', 'Lips grossly swollen', 'Tongue swollen and protruding', 'Unable to open mouth fully'],
      neck: ['Neck swollen — angioedema', 'Trachea central but obscured by swelling', 'Cannot assess JVP due to swelling'],
      chest: ['Bilateral wheeze and stridor', 'Accessory muscle use', 'Intercostal recession', 'Reduced air entry'],
      abdomen: ['Soft', 'Patient too drowsy for reliable assessment', 'No obvious distension'],
      pelvis: ['Normal'],
      extremities: ['Widespread urticaria', 'Mottled peripheries', 'Bee sting site right forearm — localised swelling', 'Weak peripheral pulses'],
      posterior: ['Urticaria extending to back', 'No spinal tenderness'],
      neurological: ['GCS 12 (E3V3M6)', 'Confused', 'Moving all limbs', 'Pupils equal but sluggish']
    },
    history: {
      medications: [],
      allergies: ['Bee stings — known allergy (previous local reactions only)', 'No EpiPen prescribed — GP said reactions were "mild"'],
      medicalConditions: ['Previous bee sting reactions (local swelling only — twice before)', 'Hypertension (untreated — does not see doctor regularly)', 'No regular medications'],
      surgicalHistory: [],
      lastMeal: 'Lunch 2 hours ago (rice and curry)',
      eventsLeading: 'Stung by bee on right forearm while working on site 20 minutes ago. Initially had local swelling only, then within 5 minutes developed widespread rash, facial swelling, and difficulty breathing. Collapsed 10 minutes after sting. Co-workers called ambulance. No EpiPen available on site.'
    },
    vitalSignsProgression: {
      initial: { bp: '65/30', pulse: 140, respiration: 36, spo2: 82, gcs: 12, bloodGlucose: 7.8 },
      afterIntervention: { bp: '95/60', pulse: 110, respiration: 22, spo2: 94, gcs: 13 },
      deterioration: { bp: '0/0', pulse: 0, respiration: 0, spo2: 0, gcs: 3 }
    },
    expectedFindings: {
      keyObservations: [
        'Fulminant anaphylaxis with cardiovascular collapse and critical airway compromise',
        'Refractory to initial IM adrenaline — requires escalation',
        'GCS dropping — approaching threshold for RSI',
        'Known bee allergy but never prescribed EpiPen — escalation from local to systemic reaction'
      ],
      redFlags: [
        'Stridor with severe angioedema — impending complete airway obstruction',
        'Profound hypotension (BP 65/30) — cardiovascular collapse',
        'Falling GCS (12→8 if untreated) — cerebral hypoperfusion and airway loss',
        'SpO2 82% — critical hypoxaemia',
        'Refractory to first dose of adrenaline — need escalation strategy'
      ],
      differentialDiagnoses: [
        'Refractory anaphylaxis (most likely)',
        'Anaphylactoid reaction',
        'Angioedema (hereditary — unlikely given bee sting trigger)',
        'Heat stroke with collapse (construction site)',
        'Acute asthma triggered by sting',
        'Cardiogenic shock (less likely given age and context)'
      ],
      mostLikelyDiagnosis: 'Refractory anaphylaxis secondary to Hymenoptera (bee) venom',
      supportingEvidence: [
        'Known bee allergy with escalating reaction pattern',
        'Bee sting 20 minutes prior with rapid multi-system deterioration',
        'Anaphylaxis triad: skin (urticaria/angioedema) + respiratory (stridor/wheeze) + cardiovascular (hypotension/tachycardia)',
        'Failure to respond to initial IM adrenaline defines refractory anaphylaxis',
        'Altered consciousness from cerebral hypoperfusion'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety — move patient from construction hazards, away from bee area',
        'IM Adrenaline 0.5mg (500mcg) anterolateral thigh IMMEDIATELY',
        'High-flow oxygen 15L/min via non-rebreather mask',
        'Lay flat, elevate legs',
        'Suction airway, jaw thrust',
        'Call for backup / critical care support early',
        'Reassess at 5 minutes — give 2nd IM adrenaline 0.5mg if no improvement',
        'Reassess at 10 minutes — give 3rd IM adrenaline 0.5mg if still refractory'
      ],
      definitive: [
        'IV access x2 large bore (14-16G) — IO if IV fails',
        'Aggressive IV fluids: 1L normal saline STAT, may need 2-4L total',
        'START ADRENALINE INFUSION: 1mg in 1L normal saline (1:1,000,000), titrate to BP and HR',
        'Nebulised adrenaline 5mg via oxygen-driven nebuliser (for upper airway oedema)',
        'Hydrocortisone 200mg IV (to prevent biphasic reaction)',
        'Chlorphenamine 10mg IV (adjunct for urticaria — NOT a substitute for adrenaline)',
        'RSI if GCS drops to 8 or airway becomes unmanageable:',
        '  - Ketamine 2mg/kg IV (bronchodilator properties)',
        '  - Suxamethonium 1.5mg/kg IV (or rocuronium 1.2mg/kg)',
        '  - Expect difficult airway — have surgical cricothyrotomy kit ready',
        'Post-intubation: propofol or midazolam infusion for sedation'
      ],
      monitoring: [
        'Continuous airway assessment — stridor, voice, ability to swallow',
        'Continuous SpO2 and waveform capnography (if intubated)',
        'Blood pressure every 1-2 minutes during acute phase',
        'Heart rate and rhythm — continuous cardiac monitoring',
        'GCS every 5 minutes',
        'Urine output if prolonged scene time',
        'Response to each adrenaline dose',
        'Watch for cardiac arrest — have ALS algorithm ready'
      ],
      transportConsiderations: [
        'Pre-alert hospital: refractory anaphylaxis, multiple adrenaline doses given, cardiovascular collapse',
        'Request anaesthetics/ICU standby at receiving hospital',
        'Transport to facility with ICU and difficult airway capability',
        'Adrenaline infusion running during transport',
        'Have surgical airway kit immediately accessible',
        'Continuous monitoring throughout — anticipate cardiac arrest',
        'Do NOT delay transport for full stabilisation — load and go with treatment en route'
      ]
    },
    studentChecklist: [
      { id: 'r10-scene', category: 'safety', description: 'Scene safety — construction site hazards, bee area', points: 2, yearLevel: ['3rd-year'], complexity: ['advanced'], critical: true },
      { id: 'r10-recognise', category: 'abcde', description: 'Recognise severe/refractory anaphylaxis with cardiovascular collapse', points: 5, yearLevel: ['3rd-year'], complexity: ['advanced'], critical: true, rationale: 'Refractory anaphylaxis requires escalation beyond standard IM adrenaline' },
      { id: 'r10-adr1', category: 'intervention', description: 'IM Adrenaline 0.5mg immediately (1st dose)', points: 10, yearLevel: ['3rd-year'], complexity: ['advanced'], critical: true },
      { id: 'r10-oxygen', category: 'intervention', description: 'High-flow oxygen 15L/min via non-rebreather', points: 4, yearLevel: ['3rd-year'], complexity: ['advanced'], critical: true },
      { id: 'r10-position', category: 'intervention', description: 'Flat positioning with leg elevation', points: 3, yearLevel: ['3rd-year'], complexity: ['advanced'], critical: true },
      { id: 'r10-adr2', category: 'intervention', description: 'Repeat IM adrenaline at 5 minutes (2nd dose)', points: 8, yearLevel: ['3rd-year'], complexity: ['advanced'], critical: true, rationale: 'If no response to first dose, repeat — up to 3 IM doses before infusion' },
      { id: 'r10-adr3', category: 'intervention', description: '3rd dose IM adrenaline 0.5mg', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'Refractory = failure of 2-3 IM doses — requires IV adrenaline infusion' },
      { id: 'r10-iv', category: 'intervention', description: 'IV/IO access — large bore, bilateral', points: 5, yearLevel: ['3rd-year'], complexity: ['advanced'], critical: true },
      { id: 'r10-fluids', category: 'intervention', description: 'Aggressive IV fluid resuscitation (1-4L)', points: 5, yearLevel: ['3rd-year'], complexity: ['advanced'], critical: true },
      { id: 'r10-infusion', category: 'intervention', description: 'Adrenaline infusion preparation and titration', points: 8, yearLevel: ['4th-year'], complexity: ['advanced'], critical: true, rationale: 'IV adrenaline infusion is the definitive treatment for refractory anaphylaxis' },
      { id: 'r10-neb-adr', category: 'intervention', description: 'Nebulised adrenaline 5mg for upper airway oedema', points: 5, yearLevel: ['3rd-year'], complexity: ['advanced'] },
      { id: 'r10-steroids', category: 'intervention', description: 'Hydrocortisone 200mg IV', points: 3, yearLevel: ['3rd-year'], complexity: ['advanced'] },
      { id: 'r10-antihistamine', category: 'intervention', description: 'Chlorphenamine 10mg IV (adjunct)', points: 2, yearLevel: ['3rd-year'], complexity: ['advanced'] },
      { id: 'r10-airway-plan', category: 'intervention', description: 'Airway escalation plan: RSI preparation if GCS drops', points: 8, yearLevel: ['4th-year'], complexity: ['advanced'], critical: true, rationale: 'Angioedema makes intubation extremely difficult — prepare for surgical airway' },
      { id: 'r10-rsi', category: 'intervention', description: 'RSI if indicated (ketamine + suxamethonium/rocuronium)', points: 8, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'r10-surgical', category: 'intervention', description: 'Surgical cricothyrotomy kit prepared as backup', points: 5, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'r10-arrest', category: 'intervention', description: 'Recognise and manage cardiac arrest if occurs', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'r10-prealert', category: 'communication', description: 'Pre-alert hospital: refractory anaphylaxis, request ICU/anaesthetics', points: 5, yearLevel: ['3rd-year'], complexity: ['advanced'], critical: true },
      { id: 'r10-document', category: 'documentation', description: 'Document: allergen, sting time, each adrenaline dose time, response, GCS trend', points: 3, yearLevel: ['3rd-year'], complexity: ['advanced'] }
    ],
    teachingPoints: [
      'Refractory anaphylaxis = failure to respond to 2-3 doses of IM adrenaline — requires escalation to IV adrenaline infusion',
      'Escalation ladder: IM adrenaline x3 → adrenaline infusion → RSI → surgical airway',
      'Adrenaline infusion: 1mg in 1L NS (1:1,000,000), start at 0.5-1mcg/kg/min, titrate to response',
      'Nebulised adrenaline (5mg) targets upper airway oedema directly — useful adjunct to IM/IV',
      'Bee sting anaphylaxis can be more severe than food anaphylaxis — venom is injected directly into tissue',
      'Previous local reactions to bee stings can escalate to systemic anaphylaxis — each sting is unpredictable',
      'Angioedema makes intubation extremely difficult — always have surgical airway as Plan C',
      'Ketamine is the RSI induction agent of choice in anaphylaxis — it has bronchodilator properties',
      'Massive fluid shifts occur in anaphylaxis — patients may need 4-6L of crystalloid',
      'Cardiac arrest in anaphylaxis: modified ALS — adrenaline 1mg IV as per standard protocol but consider early high-dose adrenaline',
      'Steroids (hydrocortisone) take 4-6 hours to work — they prevent biphasic reaction, not treat acute phase',
      'Construction workers in UAE/Gulf are high-risk for Hymenoptera stings — often no access to EpiPens',
      'Hot environment worsens vasodilation — move patient to shade, active cooling'
    ],
    commonPitfalls: [
      'Not escalating beyond IM adrenaline when patient is clearly refractory — stuck in a loop of IM doses',
      'Giving adrenaline IV push in a non-arrest patient — can cause fatal arrhythmia (use INFUSION, not bolus)',
      'Delaying RSI when GCS is dropping — once airway is lost in angioedema, bag-mask may be impossible',
      'Not preparing surgical airway kit — intubation through swollen glottis may fail',
      'Insufficient fluid resuscitation — anaphylaxis causes massive capillary leak, need aggressive fluids',
      'Relying on antihistamines and steroids — these do NOT treat acute cardiovascular collapse',
      'Standing the patient up — causes cardiac arrest (empty ventricle syndrome)',
      'Not considering cardiac arrest — anaphylaxis is a reversible cause (4Hs and 4Ts)',
      'Language barrier leading to missed allergy history — use co-workers as interpreters',
      'Not removing the bee sting — scrape off, do not squeeze (squeezing injects more venom)'
    ],
    equipmentNeeded: [
      'Adrenaline 1:1000 ampoules x5 (1mg/mL)',
      'IM needles (21G, 25mm for anterolateral thigh)',
      'High-flow oxygen with non-rebreather mask',
      'Nebuliser setup (oxygen-driven)',
      'IV cannulae (14G and 16G)',
      'IO drill and needles',
      'Normal saline 1L bags x4',
      'Pressure infuser bags',
      'Syringe driver / infusion pump for adrenaline infusion',
      'RSI drugs: ketamine, suxamethonium, rocuronium',
      'Intubation equipment (video laryngoscope preferred)',
      'Bougie and stylet',
      'Surgical cricothyrotomy kit',
      'Suction unit',
      'BVM with PEEP valve',
      'Cardiac monitor/defibrillator',
      'Hydrocortisone 100mg x2',
      'Chlorphenamine 10mg ampoules'
    ],
    references: [
      'Resuscitation Council UK — Refractory Anaphylaxis Guidelines 2021',
      'AANZCA Anaphylaxis Management — Escalation Pathways',
      'NICE Anaphylaxis Guidelines (CG134)',
      'Difficult Airway Society — Airway Management in Anaphylaxis',
      'JRCALC Clinical Guidelines — Anaphylaxis',
      'Pumphrey RS — Fatal Anaphylaxis in the UK (Clin Exp Allergy 2000)',
      'Brown SGA — Clinical Features and Severity Grading of Anaphylaxis (JACI 2004)'
    ]
  }),

  // ==================== BRADYARRHYTHMIA CASES ====================
  createCase({
    id: 'cardiac-015',
    title: 'Symptomatic Bradycardia — Medication Induced',
    category: 'cardiac',
    subcategory: 'bradycardia',
    priority: 'high',
    complexity: 'advanced',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'], // 2nd-year stretch: bradycardia recognition and medication history
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Neighbour reports elderly male confused and unresponsive in chair',
      timeOfDay: 'afternoon',
      location: 'Ground floor flat, residential area',
      callerInfo: 'Neighbour (concerned, found patient through window)',
      dispatchCode: 'Charlie-3',
      additionalInfo: ['Patient lives alone', 'Neighbour has spare key', 'No response to knocking']
    },
    patientInfo: {
      age: 72,
      gender: 'male',
      weight: 78,
      occupation: 'Retired teacher',
      language: 'English',
      culturalConsiderations: []
    },
    sceneInfo: {
      description: 'Small ground floor flat, patient found sitting in armchair in living room, medication packets scattered on side table',
      hazards: [],
      bystanders: 'Neighbour present, concerned but cooperative',
      environment: 'Indoor, adequately heated, cluttered living space',
      accessIssues: ['Narrow hallway to living room'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Elderly male, pale and drowsy, slumped in armchair',
      position: 'Sitting in armchair, slumped to one side',
      appearance: 'Pale, cool skin, appears confused and lethargic',
      consciousness: 'Confused, opens eyes to voice',
      sounds: ['Slow, mumbled speech']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'No obstruction', 'Drowsy but maintaining own airway', 'Speech slurred and slow'],
        interventions: ['Position upright', 'Continuous airway monitoring'],
        adjunctsNeeded: ['OPA on standby if GCS drops']
      },
      breathing: {
        rate: 14,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 94,
        findings: ['Rate normal but SpO2 reduced due to poor cardiac output', 'No respiratory distress', 'Clear chest'],
        interventions: ['High-flow oxygen 15L/min via non-rebreather'],
        auscultation: ['Clear air entry bilaterally', 'No crackles', 'No wheeze']
      },
      circulation: {
        pulseRate: 32,
        pulseQuality: 'Regular but very slow, weak',
        bp: { systolic: 75, diastolic: 45 },
        capillaryRefill: 4,
        skin: 'Pale, cool peripheries, dry',
        findings: ['Severe bradycardia HR 32', 'Hypotension 75/45', 'Poor peripheral perfusion', 'Cap refill 4 seconds'],
        interventions: ['IV access x1 large bore', 'Atropine 500mcg IV', 'Repeat atropine if no response', 'Cautious IV fluid bolus 250ml NS', 'Prepare transcutaneous pacing'],
        ecgFindings: ['Sinus bradycardia 32 bpm', 'No heart block pattern', 'No ST changes', 'Normal QRS width'],
        ivAccess: ['18G cannula left dorsum of hand']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 3, verbal: 4, motor: 6, total: 13 },
        pupils: 'Equal and reactive, 3mm bilaterally',
        bloodGlucose: 6.2,
        findings: ['Confused', 'GCS 13 (E3V4M6)', 'No focal neurological deficits', 'Oriented to person only'],
        interventions: ['Continuous GCS monitoring']
      },
      exposure: {
        temperature: 36.2,
        findings: ['Cool peripheries', 'No rashes', 'No oedema', 'Medication packets on side table: atenolol 100mg and diltiazem 120mg'],
        interventions: ['Keep warm', 'Collect all medication packets for hospital']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['No JVD', 'Trachea central'],
      chest: ['Heart sounds present but slow rate', 'Equal chest expansion', 'Clear lungs'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['Cool peripheries bilaterally', 'Weak peripheral pulses', 'No oedema'],
      posterior: ['No abnormality'],
      neurological: ['GCS 13', 'No focal deficits', 'Confused and disoriented']
    },
    history: {
      medications: [
        { name: 'Atenolol', dose: '100mg', frequency: 'Once daily', indication: 'Hypertension', route: 'PO' },
        { name: 'Diltiazem', dose: '120mg', frequency: 'Once daily', indication: 'Recently added by GP for rate control', route: 'PO' },
        { name: 'Ramipril', dose: '5mg', frequency: 'Once daily', indication: 'Hypertension', route: 'PO' },
        { name: 'Simvastatin', dose: '40mg', frequency: 'Once nightly', indication: 'Hyperlipidaemia', route: 'PO' }
      ],
      allergies: ['Penicillin — rash'],
      medicalConditions: ['Hypertension', 'Hyperlipidaemia', 'Atrial fibrillation (rate control strategy)', 'Type 2 diabetes (diet controlled)'],
      surgicalHistory: ['Right hip replacement 2019'],
      lastMeal: 'Unknown — neighbour unsure when he last ate',
      eventsLeading: 'Neighbour noticed curtains still closed at 2pm, used spare key to check on patient. Found him slumped in chair, confused and barely responsive. Neighbour reports patient had recently visited GP who started a new heart medication (diltiazem).',
      socialHistory: {
        smoking: 'Ex-smoker, quit 10 years ago',
        alcohol: 'Occasional',
        occupation: 'Retired teacher',
        livingSituation: 'Lives alone, wife deceased 3 years ago',
        supportSystem: 'Neighbour checks on him daily, daughter lives 2 hours away'
      }
    },
    investigations: [
      { name: '12-lead ECG', indication: 'Severe bradycardia', findings: 'Sinus bradycardia 32 bpm, no heart block, no ST changes', interpretation: 'Drug-induced sinus bradycardia — beta-blocker + CCB synergistic effect', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '75/45', pulse: 32, respiration: 14, spo2: 94, gcs: 13, temperature: 36.2, bloodGlucose: 6.2 },
      afterIntervention: { bp: '105/66', pulse: 112, respiration: 14, spo2: 98, gcs: 15 },
      enRoute: { bp: '100/65', pulse: 58, respiration: 14, spo2: 98, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Severe bradycardia HR 32', 'Hypotension', 'Confusion/altered GCS', 'Beta-blocker + CCB combination on medication list', 'Recently added diltiazem'],
      redFlags: ['HR <40', 'Systolic BP <90', 'Altered consciousness', 'Poor perfusion'],
      differentialDiagnoses: ['Drug-induced bradycardia (most likely)', 'Sick sinus syndrome', 'Hypothyroidism', 'Inferior MI', 'Hypothermia', 'Raised intracranial pressure'],
      mostLikelyDiagnosis: 'Iatrogenic bradycardia — beta-blocker and calcium channel blocker synergistic toxicity',
      supportingEvidence: ['Atenolol 100mg + diltiazem 120mg (double AV-node blocking agents)', 'Recently added diltiazem by GP', 'Sinus bradycardia on ECG (not heart block)', 'Responds to atropine']
    },
    managementPathway: {
      immediate: ['ABCDE assessment', 'High-flow oxygen', '12-lead ECG', 'IV access', 'Atropine 500mcg IV', 'Identify medications — collect all packets'],
      definitive: ['Repeat atropine 500mcg every 3-5 min (max 3mg total)', 'If atropine fails: transcutaneous pacing', 'Calcium chloride 10% 10ml slow IV for CCB toxicity', 'Glucagon 5mg IV for beta-blocker toxicity', 'Adrenaline infusion 2-10mcg/min if pacing unavailable (4th year)'],
      monitoring: ['Continuous ECG', 'Repeat BP every 3 minutes', 'SpO2', 'GCS monitoring'],
      transportConsiderations: ['Pre-alert: symptomatic bradycardia, medication-induced, may require transvenous pacing', 'Priority 1 transport', 'Bring all medication packets']
    },
    studentChecklist: [
      { id: 'c15-1', category: 'safety', description: 'Scene safety and access assessment', points: 3, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c15-2', category: 'abcde', description: 'Systematic ABCDE assessment', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c15-3', category: 'clinical-reasoning', description: 'Identify and collect all medication packets from scene', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'Medication identification is key to diagnosing iatrogenic bradycardia' },
      { id: 'c15-4', category: 'clinical-reasoning', description: 'Recognise beta-blocker + CCB combination as cause', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'This drug interaction is a common cause of iatrogenic bradycardia' },
      { id: 'c15-5', category: 'intervention', description: 'Obtain 12-lead ECG', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'], timeframe: 'Within 5 minutes' },
      { id: 'c15-6', category: 'intervention', description: 'Establish IV access', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c15-7', category: 'medication', description: 'Administer atropine 500mcg IV (correct dose)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'Atropine 500mcg is first-line for symptomatic bradycardia — NOT 300mcg' },
      { id: 'c15-8', category: 'medication', description: 'Repeat atropine if inadequate response (up to 3mg total)', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c15-9', category: 'intervention', description: 'Prepare transcutaneous pacing equipment', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], rationale: 'TCP is second-line if atropine fails' },
      { id: 'c15-10', category: 'medication', description: 'Consider calcium chloride 10% for CCB toxicity', points: 8, yearLevel: ['4th-year'], complexity: ['advanced'], rationale: 'Calcium chloride directly antagonises CCB effects' },
      { id: 'c15-11', category: 'medication', description: 'Consider glucagon 5mg IV for beta-blocker toxicity', points: 8, yearLevel: ['4th-year'], complexity: ['advanced'], rationale: 'Glucagon bypasses beta-receptors via cAMP pathway' },
      { id: 'c15-12', category: 'intervention', description: 'Cautious IV fluid bolus (250ml NS)', points: 3, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c15-13', category: 'abcde', description: 'Administer high-flow oxygen', points: 3, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c15-14', category: 'intervention', description: 'Continuous cardiac monitoring', points: 3, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c15-15', category: 'communication', description: 'Pre-alert hospital: symptomatic bradycardia, drug-induced', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'c15-16', category: 'communication', description: 'Transport as priority with all medications', points: 3, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'] }
    ],
    teachingPoints: [
      'Beta-blocker + calcium channel blocker (non-dihydropyridine) combination is a common cause of iatrogenic bradycardia — both suppress the SA and AV nodes synergistically',
      'Atropine dose is 500mcg IV — NOT 300mcg (300mcg is the old, sub-therapeutic dose). Maximum total dose is 3mg. Doses below 500mcg can paradoxically worsen bradycardia',
      'Atropine may be ineffective in complete heart block because it works on the AV node — if the block IS at the AV node, increasing vagal tone withdrawal above the block achieves nothing',
      'Transcutaneous pacing: set rate 60-80 bpm, start at low current and increase until electrical capture is seen, then confirm mechanical capture with pulse. Sedate if conscious (midazolam 1-2mg)',
      'Calcium chloride 10% (10ml = 6.8mmol Ca2+) works faster than calcium gluconate for CCB toxicity — it provides 3x more ionised calcium per volume',
      'Glucagon bypasses beta-receptors entirely — it activates adenylate cyclase via glucagon receptors, increasing cAMP and therefore heart rate and contractility, even when beta-blockers are on board',
      'Always check ALL medications including OTC drugs and recently changed prescriptions — the new diltiazem added to existing atenolol is the classic prescribing error',
      '"Treat the patient, not the number" — asymptomatic bradycardia does not always require treatment. Symptoms of haemodynamic compromise (hypotension, confusion, chest pain, heart failure) are the indication',
      'Diltiazem and verapamil are non-dihydropyridine CCBs that affect the heart. Amlodipine and nifedipine are dihydropyridines that primarily affect vessels — combining amlodipine with a beta-blocker is generally safe',
      'In elderly patients living alone, medication compliance errors and polypharmacy are extremely common causes of presentation'
    ],
    commonPitfalls: [
      'Using atropine 300mcg instead of 500mcg — sub-therapeutic doses can cause paradoxical bradycardia',
      'Not looking at medication packets — missing the drug interaction that explains the entire presentation',
      'Giving only one dose of atropine and assuming failure — repeat every 3-5 minutes up to 3mg total',
      'Delaying transcutaneous pacing while repeating ineffective atropine doses',
      'Not considering calcium chloride or glucagon for specific drug toxicity',
      'Aggressive IV fluid bolus in an elderly patient — risk of pulmonary oedema',
      'Failing to bring medication packets to hospital — critical for ongoing management',
      'Not monitoring for deterioration to higher-degree heart block or cardiac arrest'
    ],
    equipmentNeeded: [
      'Cardiac monitor/defibrillator with transcutaneous pacing capability',
      'High-flow oxygen with non-rebreather mask',
      'IV cannulation kit',
      'Atropine 500mcg/5ml ampoules x6 (enough for 3mg total)',
      'Calcium chloride 10% 10ml prefilled syringe',
      'Glucagon 1mg vials x5',
      'Normal saline 250ml bags',
      'Midazolam 5mg/5ml ampoule (for TCP sedation)',
      'Pacing pads',
      'OPA/NPA on standby'
    ],
    references: [
      'Resuscitation Council UK — Bradycardia Algorithm 2021',
      'AHA/ACLS Bradycardia with Pulse Algorithm 2020',
      'JRCALC Clinical Guidelines — Bradycardia',
      'Toxbase — Beta-Blocker and Calcium Channel Blocker Overdose/Toxicity',
      'BNF Interactions — Atenolol + Diltiazem',
      'NICE CKS — Bradycardia'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Bradycardia Management Protocol',
        'DCAS Pharmacological Guidelines — Atropine, Calcium Chloride, Glucagon',
        'DCAS Transcutaneous Pacing Protocol'
      ],
      localConsiderations: [
        'Elderly patients living alone are common in both UK and UAE expatriate populations — welfare checks by neighbours are vital',
        'Polypharmacy is common in elderly patients — always collect all medications from scene',
        'Transcutaneous pacing may be performed by advanced paramedics under protocol'
      ]
    }
  }),

  createCase({
    id: 'cardiac-016',
    title: 'Complete Heart Block — Syncope',
    category: 'cardiac',
    subcategory: 'heart-block',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'], // 2nd-year stretch: ECG pattern recognition of CHB
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Collapse in shopping centre, brief loss of consciousness, now conscious',
      timeOfDay: 'afternoon',
      location: 'Shopping centre food court',
      callerInfo: 'Shopping centre security guard',
      dispatchCode: 'Delta-1',
      additionalInfo: ['Patient collapsed while walking', 'Brief LOC approximately 30 seconds', 'Now conscious but very dizzy', 'First aider on scene']
    },
    patientInfo: {
      age: 68,
      gender: 'female',
      weight: 65,
      occupation: 'Retired nurse',
      language: 'English',
      culturalConsiderations: []
    },
    sceneInfo: {
      description: 'Busy shopping centre food court, patient now lying on floor with security and first aider. Crowd gathering.',
      hazards: ['Crowd management needed'],
      bystanders: 'Security guard and first aider with patient, multiple onlookers',
      environment: 'Indoor, air-conditioned, public space',
      accessIssues: ['Stretcher access through wide corridors', 'Lift access to ground floor if needed'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Elderly female lying on floor, pale and sweaty, conscious but looks very unwell',
      position: 'Supine on floor, coat under head as pillow',
      appearance: 'Pale, diaphoretic, anxious expression',
      consciousness: 'Alert but intermittently confused, reports feeling very dizzy',
      sounds: ['Speaking in short sentences', 'Intermittent groaning']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking in short sentences', 'No stridor or gurgling'],
        interventions: ['Maintain supine position', 'Continuous airway monitoring'],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Slightly shallow',
        spo2: 92,
        findings: ['Mild tachypnoea — compensating for low cardiac output', 'Clear lung fields', 'No respiratory distress'],
        interventions: ['High-flow oxygen 15L/min via non-rebreather'],
        auscultation: ['Clear air entry bilaterally', 'No crackles', 'No wheeze']
      },
      circulation: {
        pulseRate: 28,
        pulseQuality: 'Regular but very slow, moderate volume — note: atrial and ventricular rates dissociated',
        bp: { systolic: 82, diastolic: 50 },
        capillaryRefill: 4,
        skin: 'Pale, diaphoretic, cool peripheries',
        findings: ['Profound bradycardia HR 28', 'Hypotension 82/50', 'Cannon A waves visible in JVP (pathognomonic for CHB)', 'Variable intensity S1 on auscultation', 'Pre-syncopal'],
        interventions: ['IV access x2', 'Atropine 500mcg IV (likely ineffective — prepare for TCP)', 'Transcutaneous pacing: rate 60, increase mA until capture', 'Sedation for conscious pacing: midazolam 1-2mg IV'],
        ecgFindings: ['Complete (3rd degree) heart block', 'P waves marching through at ~75/min', 'Ventricular escape rhythm at 28/min', 'Broad QRS complexes (>120ms)', 'Complete AV dissociation — no relationship between P waves and QRS'],
        ivAccess: ['18G cannula right AC fossa', '20G cannula left hand']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive, 3mm',
        bloodGlucose: 5.8,
        findings: ['Intermittent confusion', 'GCS 14 (E4V4M6)', 'Reports feeling faint and dizzy', 'No focal neurological deficits'],
        interventions: ['Keep supine', 'Continuous monitoring']
      },
      exposure: {
        temperature: 36.5,
        findings: ['No pacemaker box visible or palpable on chest', 'No surgical scars on chest suggesting previous cardiac surgery', 'No peripheral oedema', 'No rashes'],
        interventions: ['Keep warm — blanket from ambulance', 'Maintain dignity — screen from public']
      }
    },
    secondarySurvey: {
      head: ['No trauma from fall — no head strike witnessed by security'],
      neck: ['Cannon A waves in JVP', 'Trachea central', 'No carotid bruit'],
      chest: ['Variable intensity first heart sound (classic CHB sign)', 'No murmurs', 'Clear lung fields'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['Cool peripheries', 'Weak peripheral pulses', 'No oedema', 'No injuries from fall'],
      posterior: ['No spinal tenderness — log roll if mechanism concerns'],
      neurological: ['GCS 14', 'No focal deficits', 'Intermittent pre-syncope']
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '5mg', frequency: 'Once daily', indication: 'Hypertension', route: 'PO' },
        { name: 'Metformin', dose: '500mg', frequency: 'Twice daily', indication: 'Type 2 diabetes', route: 'PO' },
        { name: 'Aspirin', dose: '75mg', frequency: 'Once daily', indication: 'Cardiovascular protection', route: 'PO' }
      ],
      allergies: ['None known'],
      medicalConditions: ['Hypertension', 'Type 2 diabetes', 'Known "heart condition" — told she needs a cardiology appointment', 'Previous episodes of dizziness over past 3 months'],
      surgicalHistory: ['Cholecystectomy 2005', 'Right knee replacement 2018'],
      lastMeal: 'Light lunch 1 hour ago',
      eventsLeading: 'Was walking through the shopping centre when she suddenly felt extremely dizzy and "everything went black." Collapsed to the ground. Security guard witnessed the event — reports patient was unresponsive for approximately 30 seconds then came round confused. Reports similar dizzy spells over past 3 months but never lost consciousness before. Has cardiology appointment scheduled next month.',
      previousSimilarEpisodes: ['Multiple dizzy spells over past 3 months', 'Near-syncope on two occasions', 'Never fully lost consciousness before today'],
      socialHistory: {
        smoking: 'Never smoked',
        alcohol: 'Rare — glass of wine occasionally',
        occupation: 'Retired nurse',
        livingSituation: 'Lives with husband',
        supportSystem: 'Husband (waiting in car park, has been contacted by security)'
      }
    },
    investigations: [
      { name: '12-lead ECG', indication: 'Syncope with profound bradycardia', findings: 'Complete heart block: P waves at ~75/min, ventricular escape rhythm at 28/min, broad QRS complexes, complete AV dissociation', interpretation: 'Complete (3rd degree) AV block with broad complex escape rhythm — high risk of cardiac arrest', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '82/50', pulse: 28, respiration: 20, spo2: 92, gcs: 14, bloodGlucose: 5.8 },
      afterIntervention: { bp: '104/66', pulse: 108, respiration: 15, spo2: 98, gcs: 14 },
      deterioration: { bp: '60/35', pulse: 20, respiration: 24, spo2: 85, gcs: 10 }
    },
    expectedFindings: {
      keyObservations: ['Syncope with brief LOC', 'Profound bradycardia HR 28', 'Cannon A waves in JVP', 'Variable S1 intensity', 'Complete AV dissociation on ECG', 'Broad QRS escape rhythm'],
      redFlags: ['Complete heart block — medical emergency', 'HR <30', 'Syncope', 'Haemodynamic compromise', 'High risk of cardiac arrest — ventricular standstill or VF'],
      differentialDiagnoses: ['Complete heart block (confirmed on ECG)', 'Inferior STEMI with heart block', 'Digoxin toxicity', 'Degenerative conduction disease (Lenegre/Lev disease)', 'Post-cardiac surgery AV block'],
      mostLikelyDiagnosis: 'Complete (3rd degree) heart block — likely degenerative conduction disease',
      supportingEvidence: ['ECG confirms complete AV dissociation', 'Progressive symptoms over 3 months (dizzy spells)', 'Known "heart condition" with pending cardiology review', 'No AV-node blocking drugs', 'Broad QRS escape rhythm suggests infra-nodal block']
    },
    managementPathway: {
      immediate: ['ABCDE assessment', 'High-flow oxygen', '12-lead ECG — confirm CHB', 'IV access x2', 'Atropine 500mcg IV (trial — likely ineffective in CHB)'],
      definitive: ['Transcutaneous pacing — rate 60-80, increase mA until capture', 'Confirm mechanical capture with pulse palpation', 'Sedation for conscious pacing: midazolam 1-2mg IV or fentanyl 25-50mcg IV (4th year)', 'If pacing fails: adrenaline infusion 2-10mcg/min (4th year)', 'Hospital: transvenous pacing then permanent pacemaker'],
      monitoring: ['Continuous ECG — watch for deterioration to ventricular standstill', 'BP every 2 minutes', 'SpO2', 'GCS', 'Confirm continued pacing capture throughout transport'],
      transportConsiderations: ['Pre-alert: complete heart block, rate 28, transcutaneous pacing initiated, require cardiology and transvenous pacing capability', 'Priority 1 transport', 'Avoid bumpy roads — can lose pacing capture', 'Defib pads on and charged throughout transport']
    },
    studentChecklist: [
      { id: 'c16-1', category: 'safety', description: 'Scene management — crowd control, screen patient', points: 3, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c16-2', category: 'abcde', description: 'Systematic ABCDE assessment', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c16-3', category: 'intervention', description: 'Obtain 12-lead ECG and recognise complete heart block', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'CHB recognition is essential — drives management decisions' },
      { id: 'c16-4', category: 'clinical-reasoning', description: 'Identify cannon A waves in JVP', points: 5, yearLevel: ['4th-year'], complexity: ['advanced'], rationale: 'Pathognomonic sign of AV dissociation' },
      { id: 'c16-5', category: 'clinical-reasoning', description: 'Identify variable S1 intensity', points: 3, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'c16-6', category: 'intervention', description: 'Establish IV access x2', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c16-7', category: 'medication', description: 'Trial atropine 500mcg IV', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c16-8', category: 'clinical-reasoning', description: 'Recognise atropine is likely ineffective in CHB and prepare TCP immediately', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'Do not delay TCP waiting for atropine to work in confirmed CHB' },
      { id: 'c16-9', category: 'procedural', description: 'Initiate transcutaneous pacing — correct pad placement', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'c16-10', category: 'procedural', description: 'Achieve electrical AND mechanical capture', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'Electrical capture on monitor does not guarantee mechanical output — must check pulse' },
      { id: 'c16-11', category: 'medication', description: 'Provide sedation for conscious pacing (midazolam or fentanyl)', points: 5, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'c16-12', category: 'medication', description: 'Consider adrenaline infusion if pacing fails', points: 8, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'c16-13', category: 'abcde', description: 'Administer high-flow oxygen', points: 3, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c16-14', category: 'intervention', description: 'Continuous cardiac monitoring with defibrillator on standby', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'c16-15', category: 'communication', description: 'Pre-alert: CHB with pacing, require transvenous pacing', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'c16-16', category: 'documentation', description: 'Document syncope duration, ECG findings, pacing settings, capture confirmation', points: 3, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'] }
    ],
    teachingPoints: [
      'Complete heart block is a medical emergency with HIGH risk of cardiac arrest — the escape rhythm can fail at any time, causing ventricular standstill',
      'Atropine works by reducing vagal tone at the AV node — if the block IS at or below the AV node (which it is in CHB), atropine cannot improve conduction. It may increase the atrial rate without improving ventricular rate',
      'Cannon A waves occur when the atria contract against closed AV valves — this is pathognomonic for AV dissociation (seen in CHB and VT)',
      'Variable S1 intensity is another classic sign — the AV valves are in different positions when the ventricle contracts depending on timing relative to atrial contraction',
      'Do NOT rely on atropine alone for complete heart block — prepare for transcutaneous pacing IMMEDIATELY while trialling atropine',
      'Transcutaneous pacing technique: anterior-posterior pad placement, set rate 60-80, start current low and increase until electrical capture (consistent pacing spike followed by wide QRS), then confirm MECHANICAL capture with pulse palpation',
      'Electrical capture does NOT guarantee mechanical capture — you MUST check for a pulse with each paced complex. Pulseless electrical activity can occur with pacing',
      'Pre-alert message should be specific: "Complete heart block, ventricular rate 28, transcutaneous pacing initiated at [rate/mA], mechanical capture confirmed, requesting cardiology and transvenous pacing capability"',
      'Causes of CHB to consider: acute MI (especially inferior — RCA supplies AV node in 85% of people), digoxin toxicity, post-cardiac surgery, and degenerative conduction disease (Lenegre or Lev disease) in elderly',
      'A narrow QRS escape rhythm suggests the block is at the AV node (junctional escape, rate 40-60) — better prognosis. A broad QRS escape suggests infra-nodal block (ventricular escape, rate 20-40) — worse prognosis, more unstable',
      'If pacing fails and no adrenaline infusion available, consider isoprenaline infusion (specialist use) or fist pacing (percussive pacing) as a temporising measure'
    ],
    commonPitfalls: [
      'Relying on atropine alone for complete heart block — wasting critical time before initiating TCP',
      'Confirming only electrical capture and not checking for mechanical capture (pulse)',
      'Posterior pad placement errors — pad should be between left scapula and spine, not over the scapula',
      'Not sedating a conscious patient for TCP — transcutaneous pacing is extremely painful',
      'Forgetting to have defibrillator charged and ready — CHB can deteriorate to VF or asystole',
      'Stopping pacing because "the patient looks better" — the underlying block is still present',
      'Aggressive movement during transport causing loss of pad contact and pacing capture',
      'Not recognising this as a time-critical emergency — delaying transport for unnecessary on-scene interventions'
    ],
    equipmentNeeded: [
      'Cardiac monitor/defibrillator with transcutaneous pacing capability',
      'Pacing pads (anterior-posterior placement)',
      'High-flow oxygen with non-rebreather mask',
      'IV cannulation kit (18G and 20G)',
      'Atropine 500mcg/5ml ampoules x6',
      'Midazolam 5mg/5ml ampoule (TCP sedation)',
      'Fentanyl 100mcg/2ml ampoule (TCP sedation alternative)',
      'Adrenaline 1mg/10ml (1:10,000) for infusion preparation',
      'Normal saline 100ml bag (for adrenaline infusion)',
      'Syringe driver / infusion pump',
      'OPA/NPA on standby',
      'Privacy screen for public location'
    ],
    references: [
      'Resuscitation Council UK — Bradycardia Algorithm 2021',
      'AHA/ACLS Bradycardia with Pulse Algorithm 2020',
      'JRCALC Clinical Guidelines — Bradycardia and Heart Blocks',
      'Brignole M et al — ESC Guidelines on Syncope 2018',
      'Kusumoto FM et al — AHA/ACC Guideline on Bradycardia and Cardiac Conduction Delay 2018',
      'Epstein AE et al — ACC/AHA/HRS Guidelines for Device-Based Therapy 2012'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Bradycardia Management Protocol',
        'DCAS Transcutaneous Pacing Protocol',
        'DCAS Syncope Assessment Pathway'
      ],
      localConsiderations: [
        'Shopping centres and malls are common collapse locations in UAE — security teams often have AEDs',
        'Public location requires crowd management and privacy screening',
        'Consider language barriers — patient history may need translator',
        'Transport to facility with cardiology and transvenous pacing capability'
      ]
    }
  }),

  createCase({
    id: 'cardiac-017',
    title: 'Paediatric Bradycardia — Infant with Poor Perfusion',
    category: 'pediatric',
    subcategory: 'sepsis',
    priority: 'critical',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Parents report 8-month-old baby "not breathing properly" and "very floppy"',
      timeOfDay: 'evening',
      location: 'Family home, first floor apartment',
      callerInfo: 'Mother (extremely distressed, crying on phone)',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Baby found floppy in cot', 'Had been unwell for 2 days with fever', 'Not feeding today', 'Dispatcher coaching mother on positioning']
    },
    patientInfo: {
      age: 0.67,
      gender: 'female',
      weight: 8,
      language: 'Parents speak English',
      culturalConsiderations: []
    },
    sceneInfo: {
      description: 'First floor apartment, baby in cot in nursery. Parents extremely anxious. Older sibling (3 years) present.',
      hazards: [],
      bystanders: 'Both parents present — mother holding baby, father at front door to guide crew in',
      environment: 'Indoor, warm nursery, well-equipped home',
      accessIssues: ['Stairs to first floor', 'Narrow doorways'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Critically unwell infant — floppy, mottled, minimal response to handling',
      position: 'Held by mother, head unsupported and lolling',
      appearance: 'Mottled skin, central cyanosis, lethargic, grunting respirations',
      consciousness: 'Responds to pain only — minimal withdrawal',
      sounds: ['Weak grunting', 'No crying']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but at risk — reduced conscious level', 'Grunting respirations', 'Head bobbing', 'No stridor', 'No visible foreign body'],
        interventions: ['Neutral position (sniffing position — use towel under shoulders)', 'Suction if secretions present', 'Prepare BVM with appropriately sized mask'],
        adjunctsNeeded: ['Size 0 OPA on standby', 'Suction with paediatric catheter']
      },
      breathing: {
        rate: 8,
        rhythm: 'Irregular, minimal effort',
        depth: 'Very shallow',
        spo2: 75,
        findings: ['Severe bradypnoea (normal infant RR 30-50)', 'Minimal respiratory effort', 'Grunting', 'Central cyanosis', 'Crackles bilaterally on auscultation', 'Head bobbing', 'Subcostal and intercostal recession'],
        interventions: ['Immediate BVM ventilation with high-flow O2 at rate 20-30/min', 'This is the PRIORITY — bradycardia in infants is almost always secondary to hypoxia', 'Reassess HR after 30 seconds of effective ventilation'],
        auscultation: ['Poor air entry bilaterally', 'Fine crackles bilateral bases', 'Grunting']
      },
      circulation: {
        pulseRate: 55,
        pulseQuality: 'Weak central pulse (brachial), absent peripheral pulses',
        bp: { systolic: 50, diastolic: 30 },
        capillaryRefill: 6,
        skin: 'Mottled, central cyanosis, cool extremities',
        findings: ['Severe bradycardia HR 55 (normal infant 120-160)', 'Profound hypotension', 'Mottled skin — decompensated shock', 'Cap refill >5 seconds', 'Weak brachial pulses only', 'Absent radial and pedal pulses'],
        interventions: ['If HR remains <60 after adequate ventilation and oxygenation — START CPR (15:2)', 'IO access preferred (proximal tibia) — faster and more reliable than IV in sick infants', 'Adrenaline 10mcg/kg (80mcg = 0.8ml of 1:10,000) IV/IO', 'Fluid bolus 20ml/kg (160ml) normal saline IV/IO'],
        ecgFindings: ['Sinus bradycardia 55 bpm', 'No heart block', 'Normal QRS morphology for age'],
        ivAccess: ['IO access right proximal tibia']
      },
      disability: {
        avpu: 'P',
        gcs: { eye: 2, verbal: 2, motor: 4, total: 8 },
        pupils: 'Sluggish but equal, 4mm',
        bloodGlucose: 2.8,
        findings: ['Responds to pain only (P on AVPU)', 'Hypoglycaemia — BGL 2.8 (treat immediately)', 'Floppy — reduced muscle tone', 'Anterior fontanelle — full but not bulging'],
        interventions: ['Dextrose 10% 2ml/kg (16ml) IV/IO for hypoglycaemia', 'Continuous monitoring']
      },
      exposure: {
        temperature: 38.8,
        findings: ['Febrile 38.8°C', 'Mottled skin throughout', 'Petechial rash developing on trunk and abdomen — non-blanching', 'Nappy dry — no urine output (sign of poor perfusion)'],
        interventions: ['Expose fully — assess for rash', 'Paracetamol NOT priority — treat underlying cause', 'Do NOT actively cool — prevent heat loss after assessment']
      }
    },
    secondarySurvey: {
      head: ['Anterior fontanelle full but not bulging', 'No trauma'],
      neck: ['No neck stiffness assessable in this age group'],
      chest: ['Poor air entry bilaterally', 'Fine crackles', 'Heart sounds present but slow'],
      abdomen: ['Soft', 'No hepatosplenomegaly'],
      pelvis: ['Nappy dry — no recent urine output'],
      extremities: ['Mottled', 'Cool', 'Absent peripheral pulses', 'No oedema'],
      posterior: ['No rash on back — petechiae confined to trunk so far'],
      neurological: ['P on AVPU', 'Floppy', 'Weak response to pain', 'Fontanelle full']
    },
    history: {
      medications: [
        { name: 'Paracetamol', dose: '120mg/5ml', frequency: 'Given by parents intermittently over past 2 days', indication: 'Fever', route: 'PO' }
      ],
      allergies: ['None known'],
      medicalConditions: ['Previously well', 'Up to date with immunisations', 'Born at term, no neonatal problems'],
      surgicalHistory: ['None'],
      lastMeal: 'Refused feeds all day — last fed small amount yesterday evening',
      eventsLeading: 'Baby developed fever 2 days ago with mild coryzal symptoms — parents assumed viral illness. Today became increasingly lethargic, stopped feeding, became very floppy. Parents noticed mottled skin and baby stopped crying. When placed in cot this evening, parents noticed grunting breathing and baby barely responsive. Called emergency services.',
      socialHistory: {
        livingSituation: 'Lives with both parents and 3-year-old sibling',
        supportSystem: 'Both parents present, grandparents nearby'
      }
    },
    investigations: [
      { name: 'Blood glucose', indication: 'Altered consciousness in infant', findings: '2.8 mmol/L', interpretation: 'Hypoglycaemia — requires immediate treatment with dextrose 10%', urgency: 'immediate' },
      { name: 'Temperature', indication: 'Febrile illness', findings: '38.8°C', interpretation: 'Febrile — likely underlying infection (meningococcal sepsis suspected given petechiae)', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '50/30', pulse: 55, respiration: 8, spo2: 75, gcs: 8, temperature: 38.8, bloodGlucose: 2.8 },
      afterIntervention: { bp: '65/40', pulse: 130, respiration: 30, spo2: 94, gcs: 10 },
      deterioration: { bp: '40/20', pulse: 40, respiration: 4, spo2: 60, gcs: 3 }
    },
    expectedFindings: {
      keyObservations: ['Critically unwell infant', 'Severe bradycardia (HR 55 — normal 120-160)', 'Bradypnoea (RR 8 — normal 30-50)', 'Central cyanosis', 'Mottled skin', 'Petechial rash', 'Hypoglycaemia', 'Absent peripheral pulses'],
      redFlags: ['Bradycardia in infant = pre-arrest rhythm', 'Petechial rash + fever = meningococcal sepsis until proven otherwise', 'Decompensated shock', 'Hypoglycaemia', 'Minimal response to pain'],
      differentialDiagnoses: ['Meningococcal sepsis (most likely given petechiae + fever + shock)', 'Severe pneumonia with sepsis', 'Viral myocarditis', 'Congenital heart disease (undiagnosed)', 'Non-accidental injury (always consider)'],
      mostLikelyDiagnosis: 'Meningococcal sepsis causing hypoxia-driven bradycardia and decompensated shock',
      supportingEvidence: ['Petechial rash + fever + shocked infant', 'Bradycardia secondary to hypoxia (not primary cardiac)', 'Preceding febrile illness with rapid deterioration', 'Decompensated shock pattern — mottled, absent peripheral pulses, poor perfusion']
    },
    managementPathway: {
      immediate: ['BVM ventilation with high-flow O2 — PRIORITY (treat the hypoxia)', 'Reassess HR after 30 seconds of effective ventilation', 'If HR <60 despite ventilation — start CPR 15:2', 'IO access (proximal tibia)', 'Adrenaline 10mcg/kg IV/IO if HR <60 with CPR'],
      definitive: ['Fluid bolus 20ml/kg NS (160ml) — repeat as needed', 'Dextrose 10% 2ml/kg (16ml) IV/IO for hypoglycaemia', 'Weight estimation: Broselow tape or formula (0.5 + age in months / 2 = ~8kg)', 'Hospital: IV antibiotics (ceftriaxone), blood cultures, full sepsis workup'],
      monitoring: ['Continuous ECG and SpO2', 'HR response to ventilation (should increase if hypoxia-driven)', 'Cap refill and perfusion after fluid bolus', 'Blood glucose recheck after dextrose'],
      transportConsiderations: ['Pre-alert: critically unwell 8-month-old, bradycardia secondary to suspected meningococcal sepsis, ventilated, IO access, requesting paediatric resus team', 'Priority 1 — lights and sirens', 'Transport to paediatric-capable facility', 'Continue BVM ventilation en route', 'Parent to travel in ambulance — keep informed']
    },
    studentChecklist: [
      { id: 'c17-1', category: 'safety', description: 'Scene safety and introduce self to parents', points: 2, yearLevel: ['2nd-year', '3rd-year'], complexity: ['intermediate'] },
      { id: 'c17-2', category: 'abcde', description: 'Rapid ABCDE assessment with paediatric approach', points: 5, yearLevel: ['2nd-year', '3rd-year'], complexity: ['intermediate'] },
      { id: 'c17-3', category: 'clinical-reasoning', description: 'Recognise bradycardia as secondary to hypoxia (NOT primary cardiac)', points: 10, yearLevel: ['2nd-year', '3rd-year'], complexity: ['intermediate'], critical: true, rationale: 'In children, bradycardia is almost always hypoxia-driven — treat the cause' },
      { id: 'c17-4', category: 'intervention', description: 'Immediate BVM ventilation with high-flow oxygen', points: 10, yearLevel: ['2nd-year', '3rd-year'], complexity: ['intermediate'], critical: true, timeframe: 'Within 60 seconds', rationale: 'Ventilation is the single most important intervention for paediatric bradycardia' },
      { id: 'c17-5', category: 'intervention', description: 'Correct BVM technique — neutral position, two-person technique, rate 20-30/min', points: 5, yearLevel: ['2nd-year', '3rd-year'], complexity: ['intermediate'] },
      { id: 'c17-6', category: 'clinical-reasoning', description: 'Reassess HR after 30 seconds of effective ventilation', points: 5, yearLevel: ['2nd-year', '3rd-year'], complexity: ['intermediate'], critical: true },
      { id: 'c17-7', category: 'intervention', description: 'Start CPR if HR remains <60 despite adequate ventilation', points: 10, yearLevel: ['2nd-year', '3rd-year'], complexity: ['intermediate'], critical: true, rationale: 'AHA/Resuscitation Council: HR <60 with poor perfusion in child = start CPR' },
      { id: 'c17-8', category: 'procedural', description: 'Obtain IO access (proximal tibia)', points: 8, yearLevel: ['3rd-year'], complexity: ['intermediate'], rationale: 'IO is preferred over IV in critically unwell infants — faster and more reliable' },
      { id: 'c17-9', category: 'medication', description: 'Adrenaline 10mcg/kg IV/IO (correct dose calculation)', points: 8, yearLevel: ['3rd-year'], complexity: ['intermediate'], critical: true, rationale: '10mcg/kg = 0.1ml/kg of 1:10,000 — dose errors are a major risk in paediatrics' },
      { id: 'c17-10', category: 'medication', description: 'Fluid bolus 20ml/kg normal saline', points: 5, yearLevel: ['2nd-year', '3rd-year'], complexity: ['intermediate'] },
      { id: 'c17-11', category: 'intervention', description: 'Check blood glucose and treat hypoglycaemia', points: 5, yearLevel: ['2nd-year', '3rd-year'], complexity: ['intermediate'], critical: true, rationale: 'Hypoglycaemia is common and easily treatable in sick children' },
      { id: 'c17-12', category: 'medication', description: 'Dextrose 10% 2ml/kg IV/IO for hypoglycaemia', points: 5, yearLevel: ['3rd-year'], complexity: ['intermediate'] },
      { id: 'c17-13', category: 'clinical-reasoning', description: 'Identify petechial rash and suspect meningococcal sepsis', points: 8, yearLevel: ['2nd-year', '3rd-year'], complexity: ['intermediate'], critical: true, rationale: 'Petechiae + fever + sick child = meningococcal sepsis until proven otherwise' },
      { id: 'c17-14', category: 'clinical-reasoning', description: 'Weight estimation using Broselow tape or age-based formula', points: 5, yearLevel: ['2nd-year', '3rd-year'], complexity: ['intermediate'], rationale: 'Accurate weight is critical for all paediatric drug doses' },
      { id: 'c17-15', category: 'communication', description: 'Pre-alert: critically unwell infant, suspected meningococcal sepsis, request paediatric resus team', points: 5, yearLevel: ['2nd-year', '3rd-year'], complexity: ['intermediate'], critical: true },
      { id: 'c17-16', category: 'communication', description: 'Keep parents informed — calm, clear communication', points: 3, yearLevel: ['2nd-year', '3rd-year'], complexity: ['intermediate'] },
      { id: 'c17-17', category: 'intervention', description: 'Continuous monitoring including HR, SpO2, and perfusion assessment', points: 3, yearLevel: ['2nd-year', '3rd-year'], complexity: ['intermediate'] }
    ],
    teachingPoints: [
      'CRITICAL CONCEPT: Paediatric bradycardia = HYPOXIA until proven otherwise. Children almost never have primary cardiac bradycardia like adults — their bradycardia is a response to oxygen deprivation',
      'Never give atropine as first-line treatment for paediatric bradycardia — FIX THE OXYGENATION FIRST with BVM ventilation. If the bradycardia is hypoxia-driven (which it almost always is), the heart rate will improve with effective ventilation',
      'HR <60 with poor perfusion in a child = START CPR. This is per AHA/Resuscitation Council guidelines. Do not wait for the heart to stop — a rate of <60 in a child produces inadequate cardiac output',
      'Adrenaline dose in children: 10mcg/kg (0.01mg/kg) = 0.1ml/kg of 1:10,000. This is the IV/IO dose. Medication errors in paediatrics are common and potentially fatal — always double-check calculations',
      'IO access is preferred over IV in critically unwell children — the proximal tibia is the standard site in infants. IO provides rapid, reliable vascular access when peripheral veins are collapsed from shock',
      'Petechial rash + fever + sick child = meningococcal sepsis until proven otherwise. This is a time-critical diagnosis. Glass test: petechiae do NOT blanch with pressure',
      '"Children don\'t have heart attacks — they have hypoxia." This teaching pearl reminds clinicians that the paediatric cardiac arrest pathway is fundamentally different from adults. Respiratory failure leads to bradycardia leads to cardiac arrest',
      'Weight estimation is CRITICAL for all drug doses in children. Use Broselow tape for rapid estimation, or the formula: weight (kg) = (age in months + 9) / 2 for infants. For this 8-month-old: (8+9)/2 = 8.5kg',
      'Mottled skin + absent peripheral pulses = decompensated shock. This is a LATE sign in children — they compensate remarkably well until they suddenly crash. By the time a child is hypotensive, they have lost ~25% of blood volume or are in severe distributive shock',
      'Dextrose 10% is used in children (NOT 50% as in adults). Dose is 2ml/kg. Dextrose 50% can cause tissue necrosis and dangerous hyperglycaemia in children',
      'Always consider non-accidental injury in any sick or injured child — maintain clinical suspicion while treating the immediate emergency'
    ],
    commonPitfalls: [
      'Giving atropine first instead of ventilating — the bradycardia is hypoxia-driven, not vagal',
      'Failing to start CPR when HR <60 — waiting for asystole is too late',
      'Using adult drug doses — paediatric doses must be calculated by weight',
      'Attempting peripheral IV access for too long in a shut-down infant — go to IO early',
      'Using dextrose 50% instead of dextrose 10% — can cause tissue necrosis and dangerous hyperglycaemia',
      'Not checking blood glucose — hypoglycaemia is a common and easily reversible cause of reduced consciousness in children',
      'Forgetting to expose the child fully — the petechial rash is a critical diagnostic clue',
      'Not reassessing HR after ventilation — the response to ventilation tells you whether the cause is hypoxia',
      'Failing to estimate weight before drug administration — guessing doses is dangerous',
      'Not communicating with parents — they are terrified and need clear, honest updates'
    ],
    equipmentNeeded: [
      'Paediatric BVM (infant size, 500ml bag)',
      'Infant face masks (sizes 0 and 1)',
      'High-flow oxygen',
      'Paediatric suction catheter (size 8F)',
      'OPA size 0 and 000',
      'IO needle and drill (paediatric — 15mm)',
      'Adrenaline 1:10,000 (100mcg/ml)',
      '1ml and 5ml syringes for drug preparation',
      'Dextrose 10% ampoules',
      'Normal saline 250ml bags',
      'Broselow tape or paediatric drug reference',
      'Cardiac monitor with paediatric leads',
      'Infant warming blanket',
      'Paediatric blood glucose meter'
    ],
    references: [
      'Resuscitation Council UK — Paediatric Bradycardia Algorithm 2021',
      'AHA PALS Bradycardia with Pulse Algorithm 2020',
      'JRCALC Clinical Guidelines — Paediatric Emergencies',
      'NICE CG102 — Bacterial Meningitis and Meningococcal Septicaemia in Children',
      'APLS Course Manual — Recognition of the Seriously Ill Child',
      'EPALS Course Manual — Paediatric Bradycardia Management'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Paediatric Emergency Protocol',
        'DCAS Paediatric Drug Dose Reference',
        'DCAS Paediatric Sepsis Pathway'
      ],
      localConsiderations: [
        'Paediatric-capable facilities must be identified in advance — not all EDs have paediatric resuscitation teams',
        'Language barriers with parents may require interpreter — clear simple communication essential',
        'IO access may be performed by paramedics under protocol for critically unwell children',
        'Meningococcal disease has global distribution — maintain suspicion regardless of geography'
      ]
    }
  }),
];

// ============================================================================
// MERGE WITH ENHANCED CASE DATABASE
// ============================================================================

// Combine original cases with enhanced and additional cases
// This allows for backward compatibility while adding new detailed cases
export const allCases: CaseScenario[] = [...caseDatabase, ...enhancedCaseDatabase, ...additionalCaseDatabase, ...firstYearCases, ...secondYearCases, ...litflCaseDatabase, ...severityVariantCases];

// Re-export the cohort rule so existing importers of '@/data/cases' keep working.
export { isCaseAvailableForCohort, isStudentYear, type CohortMode };

export const getCasesForCohort = (
  yearLevel: string | undefined,
  options?: { mode?: CohortMode },
): CaseScenario[] => {
  if (!yearLevel || !isStudentYear(yearLevel)) return allCases;
  return allCases.filter(c => isCaseAvailableForCohort(c.yearLevels, yearLevel, options?.mode ?? 'progressive'));
};

// Export function to get cases by filter
export const getCasesByFilter = (filter: { yearLevel?: string; category?: string; priority?: string; complexity?: string; subcategory?: string; cohortMode?: CohortMode }) => {
  const source = filter.yearLevel ? getCasesForCohort(filter.yearLevel, { mode: filter.cohortMode ?? 'exact' }) : allCases;
  return source.filter(c => {
    if (filter.category && c.category !== filter.category) return false;
    if (filter.priority && c.priority !== filter.priority) return false;
    if (filter.complexity && c.complexity !== filter.complexity) return false;
    if (filter.subcategory && !c.title.toLowerCase().includes(filter.subcategory.toLowerCase()) && !c.id.includes(filter.subcategory)) return false;
    return true;
  });
};

// Export function to get random case with better fallback logic
export const getRandomCase = (filters?: { yearLevel?: string; category?: string; complexity?: string; subcategory?: string; cohortMode?: CohortMode }) => {
  let cases = allCases;

  // Filter by year level first
  if (filters?.yearLevel) {
    cases = getCasesForCohort(filters.yearLevel, { mode: filters.cohortMode ?? 'exact' });
  }

  // Filter by category
  if (filters?.category) {
    const categoryFilter = filters.category;
    const categoryMatches = cases.filter(c => c.category === categoryFilter);

    // If category filter results in no cases for this year level, return null
    // Do NOT fall back to other year levels — that gives inappropriate complexity
    if (categoryMatches.length === 0) {
      return null as unknown as typeof cases[0];
    }
    cases = categoryMatches;
  }

  // Filter by complexity (optional - don't fail if no match)
  if (filters?.complexity) {
    const complexityFilter = filters.complexity;
    const complexityMatches = cases.filter(c => c.complexity === complexityFilter);
    if (complexityMatches.length > 0) {
      cases = complexityMatches;
    }
  }

  // Filter by subcategory if specified
  if (filters?.subcategory) {
    const subcategoryFilter = filters.subcategory;
    const subcategoryMatches = cases.filter(c =>
      c.title.toLowerCase().includes(subcategoryFilter.toLowerCase()) ||
      c.id.includes(subcategoryFilter) ||
      c.category === subcategoryFilter
    );
    if (subcategoryMatches.length > 0) {
      cases = subcategoryMatches;
    }
  }

  // Final fallback - no cases match all filters
  if (cases.length === 0) {
    return null as unknown as typeof allCases[0];
  }

  return cases[Math.floor(Math.random() * cases.length)];
};

// Get categories that actually exist in the database
const existingCategories = [...new Set(allCases.map(c => c.category))];

// Category display mapping - Enhanced with new categories
const CATEGORY_INFO: Record<string, { label: string; color: string; icon?: string }> = {
  'cardiac': { label: 'Cardiac', color: 'bg-red-500', icon: 'heart' },
  'cardiac-ecg': { label: 'Cardiac ECG', color: 'bg-red-600', icon: 'activity' },
  'respiratory': { label: 'Respiratory', color: 'bg-blue-500', icon: 'wind' },
  'trauma': { label: 'Trauma', color: 'bg-orange-500', icon: 'alert-triangle' },
  'thoracic': { label: 'Thoracic/Critical Care', color: 'bg-rose-600', icon: 'lungs' },
  'critical-care': { label: 'Critical Care', color: 'bg-red-700', icon: 'monitor' },
  'neurological': { label: 'Neurological', color: 'bg-purple-500', icon: 'brain' },
  'metabolic': { label: 'Metabolic', color: 'bg-green-500', icon: 'droplet' },
  'environmental': { label: 'Environmental', color: 'bg-amber-500', icon: 'sun' },
  'psychiatric': { label: 'Psychiatric', color: 'bg-pink-500', icon: 'smile' },
  'anxiety-related': { label: 'Anxiety Related', color: 'bg-teal-500', icon: 'frown' },
  'elderly-fall': { label: 'Elderly Fall', color: 'bg-indigo-500', icon: 'user' },
  'post-discharge': { label: 'Post-Discharge', color: 'bg-cyan-500', icon: 'home' },
  'rule-out': { label: 'Rule-Out', color: 'bg-lime-500', icon: 'search' },
  'general': { label: 'General', color: 'bg-gray-500', icon: 'stethoscope' },
  'toxicology': { label: 'Toxicology', color: 'bg-violet-500', icon: 'flask' },
  'toxicological': { label: 'Toxicological', color: 'bg-violet-500', icon: 'flask' },
  'multiple-patients': { label: 'Multiple Patients', color: 'bg-slate-500', icon: 'users' },
  'disaster': { label: 'Disaster/MCI', color: 'bg-stone-700', icon: 'alert-octagon' },
  'clinical-procedures': { label: 'Clinical Procedures', color: 'bg-sky-500', icon: 'wrench' },
  'procedural': { label: 'Procedural', color: 'bg-sky-500', icon: 'wrench' },
  'obstetrics-gynecology': { label: 'Obstetrics/Gynecology', color: 'bg-pink-600', icon: 'baby' },
  'obstetric': { label: 'Obstetric', color: 'bg-pink-600', icon: 'baby' },
  'pediatric': { label: 'Pediatric', color: 'bg-yellow-500', icon: 'child' },
  'burns': { label: 'Burns', color: 'bg-orange-600', icon: 'flame' }
};

// Export only the categories that actually have cases
export const caseCategories = existingCategories.map(cat => ({
  value: cat,
  label: CATEGORY_INFO[cat]?.label || cat.charAt(0).toUpperCase() + cat.slice(1),
  color: CATEGORY_INFO[cat]?.color || 'bg-gray-500'
})).sort((a, b) => a.label.localeCompare(b.label));

// Get year levels
// Cohort order — Diploma first (primary UAE paramedic cohort), then the
// four-year degree pathway in ascending order.
export const yearLevels = [
  { value: 'diploma', label: 'Diploma' },
  { value: '1st-year', label: '1st Year' },
  { value: '2nd-year', label: '2nd Year' },
  { value: '3rd-year', label: '3rd Year' },
  { value: '4th-year', label: '4th Year' },
];

// Get complexity levels
export const complexityLevels = [
  { value: 'basic', label: 'Basic', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  { value: 'intermediate', label: 'Intermediate', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  { value: 'advanced', label: 'Advanced', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
  { value: 'expert', label: 'Expert', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
];

// Priority labels
export const priorities = [
  { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
  { value: 'moderate', label: 'Moderate', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
];

// ============================================================================
// CONDITIONS INDEX — maps condition names to case IDs for fast lookup
// Built from mostLikelyDiagnosis and differentialDiagnoses across all cases
// ============================================================================

export const conditionsIndex: Map<string, string[]> = (() => {
  const index = new Map<string, string[]>();
  for (const c of allCases) {
    const diagnoses: string[] = [];
    if (c.expectedFindings?.mostLikelyDiagnosis) {
      diagnoses.push(c.expectedFindings.mostLikelyDiagnosis);
    }
    if (c.expectedFindings?.differentialDiagnoses) {
      diagnoses.push(...c.expectedFindings.differentialDiagnoses);
    }
    for (const dx of diagnoses) {
      const normalized = dx.trim();
      if (!normalized) continue;
      const existing = index.get(normalized) || [];
      if (!existing.includes(c.id)) {
        existing.push(c.id);
      }
      index.set(normalized, existing);
    }
  }
  return index;
})();

/** Sorted list of all unique condition names for the search dropdown */
export const allConditionNames: string[] = [...conditionsIndex.keys()].sort((a, b) =>
  a.localeCompare(b, undefined, { sensitivity: 'base' })
);

/** Get cases matching a specific condition (as primary or differential) filtered by year */
export const getCasesByCondition = (
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
};

// Get case statistics
export const getCaseStatistics = () => {
  return {
    totalCases: allCases.length,
    byCategory: caseCategories.map(cat => ({
      ...cat,
      count: allCases.filter(c => c.category === cat.value).length
    })),
    byPriority: priorities.map(pri => ({
      ...pri,
      count: allCases.filter(c => c.priority === pri.value).length
    })),
    byComplexity: complexityLevels.map(comp => ({
      ...comp,
      count: allCases.filter(c => c.complexity === comp.value).length
    }))
  };
};
