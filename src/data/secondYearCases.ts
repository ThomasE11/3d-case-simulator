/**
 * 2nd Year Focused Cases
 *
 * These cases emphasize:
 * - Systematic ABCDE assessment
 * - Complete vital signs including GCS
 * - Blood glucose assessment
 * - Secondary survey technique
 * - Documentation accuracy and timing
 * - Basic clinical reasoning (recognizing patterns)
 * - Identifying red flags
 * - Basic procedural skills
 */

import type { CaseScenario } from '@/types';

const createCase = (caseData: Partial<CaseScenario> & { id: string; title: string }): CaseScenario => ({
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...caseData,
} as CaseScenario);

// ============================================================================
// 2ND YEAR CASES - Focus on Systematic Assessment & Clinical Reasoning
// ============================================================================

export const secondYearCases: CaseScenario[] = [
  // Case 1: Respiratory Distress - Systematic ABCDE, complete vitals, GCS
  createCase({
    id: 'y2-001',
    title: 'Asthma Exacerbation - Systematic Assessment Required',
    category: 'respiratory',
    subcategory: 'asthma',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: '22-year-old female with asthma attack, difficulty breathing',
      timeOfDay: 'evening',
      location: 'University campus in Sharjah',
      callerInfo: 'Friend (patient unable to speak)',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 22,
      gender: 'female',
      weight: 55,
      language: 'English',
      culturalConsiderations: ['Young adult, anxious', 'Friends present for support']
    },
    sceneInfo: {
      description: 'University common room, patient sitting on chair leaning forward',
      hazards: ['None identified'],
      bystanders: '3 friends present, one appears to know patient well',
      environment: 'Indoor, air conditioned',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/female-asthma-student-sharjah.png',
      sceneImageCaption: 'University campus in Sharjah — Student common room'
    },
    initialPresentation: {
      generalImpression: 'Young female, tripod position, using accessory muscles, audible wheeze',
      position: 'Sitting upright, leaning forward with arms supporting',
      appearance: 'Anxious, cyanotic lips, diaphoretic',
      consciousness: 'Alert but anxious, able to nod/shake head only'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but compromised by respiratory effort', 'Speaking in 1-2 word sentences', 'Able to manage secretions but increased work of breathing'],
        interventions: ['Encourage calm environment', 'Prepare for airway adjuncts if needed']
      },
      breathing: {
        rate: 32,
        rhythm: 'Regular but rapid',
        depth: 'Shallow with prolonged expiration',
        spo2: 88,
        findings: [
          'Tachypneic (32/min)',
          'Bilateral expiratory wheeze',
          'Accessory muscle use visible',
          'Prolonged expiratory phase',
          'Tripod positioning',
          'SpO2 88% on room air'
        ],
        interventions: [
          'High-flow oxygen 15L/min via non-rebreather',
          'Assess lung sounds before and after interventions',
          'Prepare for nebulized bronchodilator',
          'Calm patient and encourage controlled breathing'
        ],
        auscultation: [
          'Bilateral expiratory wheeze (upper and lower fields)',
          'Reduced air entry at bases',
          'No crackles',
          'Wheeze louder on expiration'
        ]
      },
      circulation: {
        pulseRate: 125,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 145, diastolic: 85 },
        capillaryRefill: 2,
        skin: 'Warm, diaphoretic, cyanotic periorally',
        findings: [
          'Tachycardia (125/min) - likely respiratory driven',
          'Good peripheral perfusion',
          'Mild hypertension likely anxiety/pain related'
        ],
        interventions: ['Monitor cardiac status', 'IV access if protocols allow'],
        ivAccess: ['Consider 18G or 20G in AC if protocols allow']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal 3mm, reactive',
        bloodGlucose: 5.4,
        findings: [
          'Alert but anxious',
          'Speech limited to 1-2 words at a time',
          'Follows commands appropriately',
          'Blood glucose normal'
        ],
        interventions: [
          'Reassess GCS after improving respiratory status',
          'Monitor for deterioration due to hypoxia'
        ]
      },
      exposure: {
        temperature: 37.2,
        findings: [
          'Diaphoresis present',
          'Cyanosis of lips and nail beds',
          'Medicalert bracelet visible - Asthma',
          'No signs of trauma',
          'Using respiratory accessory muscles (sternocleidomastoid, intercostals)'
        ],
        interventions: [
          'Loosen tight clothing',
          'Maintain patient dignity while assessing',
          'Keep patient calm'
        ]
      }
    },
    secondarySurvey: {
      head: ['Normal', 'No trauma', 'Cyanosis of oral mucosa'],
      neck: ['Trachea midline', 'No lymphadenopathy', 'Accessory muscle use visible'],
      chest: [
        'Hyperinflated on percussion',
        'Bilateral wheeze',
        'Use of accessory muscles',
        'Chest hyperresonant to percussion',
        'Equal expansion bilaterally'
      ],
      abdomen: ['Soft, non-tender', 'Moving with respiration'],
      pelvis: ['Normal'],
      extremities: ['Warm and dry', 'No peripheral oedema', 'Good peripheral pulses'],
      posterior: ['Spine non-tender', 'No posterior abnormalities'],
      neurological: ['Anxious but appropriate', 'No focal deficits', 'Moving all extremities']
    },
    history: {
      medications: [
        { name: 'Salbutamol (Albuterol) inhaler', dose: '100mcg', frequency: 'PRN', indication: 'Asthma' },
        { name: 'Fluticasone/Salmeterol', dose: '250/25', frequency: 'Twice daily', indication: 'Asthma maintenance' },
        { name: 'Montelukast', dose: '10mg', frequency: 'Evening', indication: 'Asthma' }
      ],
      allergies: [
        'Penicillin - rash',
        'Aspirin - wheeze (patient notes she avoids aspirin)'
      ],
      medicalConditions: [
        'Asthma since childhood',
        'Previous hospitalizations for asthma (2 in past year)',
        'Eczema'
      ],
      surgicalHistory: ['None'],
      lastMeal: 'Light lunch 4 hours ago - sandwich and juice',
      eventsLeading: 'Patient reports symptoms started 2 hours ago while studying. Used her rescue inhaler 3 times in the past hour with no relief. Symptoms progressively worsening. No specific trigger identified. Friend called ambulance when patient became too short of breath to speak.',
      socialHistory: {
        smoking: 'Non-smoker',
        alcohol: 'Social (1-2 drinks per week)',
        occupation: 'University student',
        livingSituation: 'Lives in campus dormitory'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '145/85', pulse: 125, respiration: 32, spo2: 88, gcs: 14, temperature: 37.2, bloodGlucose: 5.4 },
      afterIntervention: { bp: '150/90', pulse: 128, respiration: 15, spo2: 98, gcs: 14 },
      deterioration: { bp: '155/95', pulse: 145, respiration: 40, spo2: 82, gcs: 12 }
    },
    expectedFindings: {
      keyObservations: [
        'Classic asthma exacerbation presentation',
        'Tripod positioning and accessory muscle use',
        'Audible wheeze',
        'History of multiple rescue inhaler use without relief',
        'Hypoxia present (SpO2 88%)',
        'Tachycardia and tachypnea'
      ],
      redFlags: [
        'Multiple inhaler use without relief - SEVERE attack',
        'Unable to speak in full sentences',
        'SpO2 below 90%',
        'History of previous hospitalizations',
        'Aspirin allergy (ASA-sensitive asthma possibility)'
      ],
      differentialDiagnoses: [
        'Acute asthma exacerbation',
        'Anaphylaxis (less likely - no rash or swelling noted)',
        'Pneumothorax (consider if unilateral symptoms)',
        'Pulmonary embolism',
        'Foreign body aspiration'
      ],
      mostLikelyDiagnosis: 'Acute severe asthma exacerbation',
      supportingEvidence: [
        'History of asthma with poor response to rescue inhaler',
        'Classic wheeze and tripod positioning',
        'Accessory muscle use',
        'Progressive worsening over hours',
        'No other obvious causes identified'
      ]
    },
    managementPathway: {
      immediate: [
        'ABC approach with emphasis on Airway and Breathing',
        'High-flow oxygen (15L/min via non-rebreather)',
        'Position of comfort (usually upright)',
        'Systematic ABCDE assessment',
        'Complete vital signs including SpO2',
        'Auscultate lung sounds',
        'Check blood glucose'
      ],
      definitive: [
        'Nebulized bronchodilators (Salbutamol/Ipratropium) per protocol',
        'Consider IV access for medications if severe',
        'Consider systemic steroids if within protocols',
        'Continuous monitoring',
        'Transport to emergency department',
        'Pre-alert receiving hospital'
      ],
      monitoring: [
        'Reassess lung sounds after bronchodilators',
        'SpO2 monitoring continuously',
        'Repeat vital signs every 5 minutes',
        'Reassess GCS and mental status',
        'Monitor for fatigue/respiratory failure'
      ],
      transportConsiderations: [
        'Position patient for comfort (usually upright)',
        'Keep environment calm',
        'Continuously reassess en route',
        'Consider lights/sirens based on patient condition'
      ]
    },
    studentChecklist: [
      // 2nd Year Emphasis - Systematic ABCDE (35%)
      {
        id: 'y2-001-abcde-systematic',
        category: 'abcde',
        description: 'Perform systematic ABCDE assessment without skipping sections',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Systematic approach ensures nothing is missed'
      },
      {
        id: 'y2-001-airway-assess',
        category: 'abcde',
        description: 'Airway assessment including ability to speak and secretions',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Airway status can change rapidly in respiratory distress'
      },
      {
        id: 'y2-001-breathing-comprehensive',
        category: 'abcde',
        description: 'Breathing: rate, rhythm, depth, SpO2, effort, sounds',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Comprehensive breathing assessment identifies severity and response'
      },
      {
        id: 'y2-001-auscultation',
        category: 'abcde',
        description: 'Auscultate lung sounds bilaterally',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Lung sounds provide crucial diagnostic information'
      },
      {
        id: 'y2-001-gcs-full',
        category: 'abcde',
        description: 'Calculate and document full GCS (E/V/M)',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'GCS provides objective measure of consciousness'
      },
      {
        id: 'y2-001-glucose',
        category: 'abcde',
        description: 'Check blood glucose level',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Hypoglycemia can mimic respiratory distress symptoms'
      },
      {
        id: 'y2-001-vitals-complete',
        category: 'abcde',
        description: 'Complete set of vital signs with manual BP',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Complete vitals establish baseline and show trends'
      },

      // 2nd Year Emphasis - Secondary Survey (20%)
      {
        id: 'y2-001-secondary-systematic',
        category: 'secondary',
        description: 'Systematic head-to-toe secondary survey',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Secondary survey identifies additional findings'
      },
      {
        id: 'y2-001-chest-assess',
        category: 'secondary',
        description: 'Detailed chest assessment - inspection, palpation, auscultation',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Chest assessment identifies respiratory conditions'
      },
      {
        id: 'y2-001-compare-bilateral',
        category: 'secondary',
        description: 'Compare bilateral findings during secondary survey',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Bilateral comparison helps identify asymmetry'
      },

      // 2nd Year Emphasis - Clinical Reasoning (20%)
      {
        id: 'y2-001-recognize-severity',
        category: 'clinical-reasoning',
        description: 'Recognize severity based on failed rescue inhaler use',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Failed home treatment indicates severe exacerbation'
      },
      {
        id: 'y2-001-recognize-red-flags',
        category: 'clinical-reasoning',
        description: 'Identify red flags: unable to speak, SpO2 <90%, multiple inhaler use',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Red flags indicate need for rapid transport'
      },
      {
        id: 'y2-001-consider-differentials',
        category: 'clinical-reasoning',
        description: 'Consider differential diagnoses beyond asthma',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Thinking broadly prevents missing other conditions'
      },

      // 2nd Year Emphasis - Documentation (15%)
      {
        id: 'y2-001-document-times',
        category: 'documentation',
        description: 'Document all times (assessment, interventions, changes)',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Time documentation shows progression'
      },
      {
        id: 'y2-001-document-vitals-trend',
        category: 'documentation',
        description: 'Document vital signs with trend notes',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Trends show improvement or deterioration'
      },
      {
        id: 'y2-001-document-findings',
        category: 'documentation',
        description: 'Document key assessment findings (wheeze, accessory muscles)',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Specific findings support diagnosis and treatment'
      },

      // 2nd Year Emphasis - Communication (10%)
      {
        id: 'y2-001-communicate-patient',
        category: 'communication',
        description: 'Communicate with patient considering their distress',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Patient communication is challenging in respiratory distress'
      },
      {
        id: 'y2-001-reassure',
        category: 'communication',
        description: 'Provide reassurance and calm environment',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Anxiety worsens respiratory distress'
      },
      {
        id: 'y2-001-salb',
        category: 'intervention',
        description: 'Administer salbutamol 5mg via nebuliser',
        points: 10,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Salbutamol is the first-line bronchodilator for acute asthma'
      },
      {
        id: 'y2-001-ipra',
        category: 'intervention',
        description: 'Add ipratropium 500mcg to nebuliser (if severe)',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate']
      },
      {
        id: 'y2-001-o2',
        category: 'intervention',
        description: 'High-flow oxygen (target SpO2 94-98%)',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true
      }
    ],
    teachingPoints: [
      'Systematic ABCDE is critical - don\'t get distracted and skip sections',
      'Always auscultate lung sounds - don\'t assume wheeze based on history alone',
      'GCS must be calculated properly: Eye (1-4) + Verbal (1-5) + Motor (1-6)',
      'Blood glucose can cause altered mental status - always check in respiratory distress',
      'Failed rescue inhaler use is a critical red flag',
      'SpO2 < 90% is concerning and requires oxygen and consideration of escalation',
      'Document times - trends show patient trajectory',
      'Bilateral comparison is essential in respiratory assessment'
    ],
    commonPitfalls: [
      'Skipping auscultation due to audible wheeze',
      'Not checking blood glucose in altered patient',
      'Inaccurate GCS calculation',
      'Not documenting times and trends',
      'Getting distracted and not completing systematic ABCDE',
      'Missing that failed rescue inhaler indicates severity',
      'Forgetting to reassess after interventions'
    ],
    references: [
      'Respiratory Emergencies - Asthma Chapter',
      'ABCDE Assessment Guidelines',
      'GCS Assessment Reference'
    ],
    visualResources: {
      images: [

      ],
      videos: []
    }
  }),

  // Case 2: Chest Pain - Systematic assessment, ECG, clinical reasoning
  createCase({
    id: 'y2-002',
    title: 'Cardiac Chest Pain - Assessment Focus',
    category: 'cardiac',
    subcategory: 'acute-coronary-syndrome',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: '55-year-old male with chest pain',
      timeOfDay: 'early-morning',
      location: 'Home in Dubai Marina',
      callerInfo: 'Wife (worried)',
      dispatchCode: 'Bravo-1'
    },
    patientInfo: {
      age: 55,
      gender: 'male',
      weight: 82,
      language: 'English',
      culturalConsiderations: ['Family present and anxious', 'Patient apprehensive']
    },
    sceneInfo: {
      description: 'Apartment, patient sitting on sofa holding chest',
      hazards: ['None identified'],
      bystanders: 'Wife and adult daughter present',
      environment: 'Comfortable home environment',
      environmentVariant: 'home',
      patientSupportSurface: 'sofa',
      sceneImagePath: '/scene-assets/home-medical-male-dubai-apartment.png',
      sceneImageCaption: 'Home apartment — Dubai Marina'
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, appears unwell, clutching chest',
      position: 'Sitting forward, leaning left',
      appearance: 'Pale, diaphoretic, anxious',
      consciousness: 'Alert and appropriate'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking clearly but with effort'],
        interventions: ['Monitor airway status']
      },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Slightly shallow',
        spo2: 95,
        findings: [
          'Mild tachypnea (22/min) likely pain/anxiety related',
          'Clear lung sounds bilaterally',
          'No increased work of breathing aside from rate'
        ],
        interventions: ['Apply oxygen if SpO2 drops below 94%']
      },
      circulation: {
        pulseRate: 95,
        pulseQuality: 'Regular, slightly weak',
        bp: { systolic: 155, diastolic: 95 },
        capillaryRefill: 2,
        skin: 'Pale, cool, diaphoretic',
        findings: [
          'Mild tachycardia (95/min)',
          'Hypertension',
          'Skin changes suggesting sympathetic activation',
          'No peripheral edema'
        ],
        interventions: [
          'IV access if protocols allow',
          'Cardiac monitor',
          '12-lead ECG'
        ],
        ecgFindings: ['12-lead ECG required', 'Monitor for arrhythmias'],
        ivAccess: ['Consider 2x large bore IVs if protocols allow']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        bloodGlucose: 6.1,
        findings: [
          'Alert and oriented',
          'Anxious but appropriate',
          'Blood glucose normal'
        ],
        interventions: ['Reassess mental status if condition changes']
      },
      exposure: {
        temperature: 36.5,
        findings: ['Diaphoresis generalized', 'No signs of trauma', 'Medicalert visible but unreadable at distance'],
        interventions: ['Full exposure while maintaining dignity', 'Check Medicalert']
      }
    },
    secondarySurvey: {
      head: ['Normal', 'No trauma'],
      neck: ['No JVD', 'Trachea midline', 'Carotids equal'],
      chest: [
        'No visible chest wall deformity',
        'Chest wall tender to palpation at left sternal border',
        'Clear lung sounds bilaterally',
        'No crepitus'
      ],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: ['No peripheral oedema', 'Pulses equal bilaterally', 'Skin cool and pale'],
      posterior: ['No posterior chest tenderness'],
      neurological: ['Normal', 'No focal deficits']
    },
    history: {
      medications: [
        { name: 'Atorvastatin', dose: '20mg', frequency: 'Nightly', indication: 'Cholesterol' },
        { name: 'Lisinopril', dose: '10mg', frequency: 'Daily', indication: 'Blood pressure' },
        { name: 'Aspirin', dose: '81mg', frequency: 'Daily', indication: 'Heart protection' }
      ],
      allergies: ['No known drug allergies'],
      medicalConditions: [
        'Hypertension (5 years)',
        'Hyperlipidemia',
        'Type 2 Diabetes (diet-controlled)',
        'Family history of heart disease'
      ],
      surgicalHistory: ['Appendectomy age 20'],
      lastMeal: 'Light dinner 4 hours ago',
      eventsLeading: 'Patient woke at 5 AM with central chest pain, pressure-like, 7/10 severity. Pain radiates to left jaw and arm. No prior episodes. Wife called ambulance when pain didn\'t resolve with rest. Patient took one aspirin when pain started. Diaphoresis developed within 30 minutes of pain onset.',
      socialHistory: {
        smoking: 'Ex-smoker (quit 5 years ago, 20 pack-year history)',
        alcohol: 'Occasional',
        occupation: 'Bank manager',
        livingSituation: 'Lives with wife and children'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '155/95', pulse: 95, respiration: 22, spo2: 95, gcs: 15, temperature: 37.0, bloodGlucose: 6.1 },
      afterIntervention: { bp: '112/70', pulse: 75, respiration: 15, spo2: 98, gcs: 15 },
      deterioration: { bp: '135/80', pulse: 60, respiration: 14, spo2: 92, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: [
        'Classic cardiac chest pain description',
        'Radiation to jaw and arm',
        'Diaphoresis present',
        'Risk factors: age, gender, hypertension, hyperlipidemia, smoking history',
        'Patient already took aspirin',
        'Multiple cardiac risk factors'
      ],
      redFlags: [
        'Chest pain with diaphoresis',
        'Radiation to jaw/arm',
        'Multiple cardiovascular risk factors',
        'Pain woke patient from sleep',
        'Hypertensive and diabetic'
      ],
      differentialDiagnoses: [
        'Acute Coronary Syndrome (ACS/MI)',
        'Unstable angina',
        'Gastroesophageal reflux (GERD)',
        'Costochondritis',
        'Pulmonary embolism',
        'Aortic dissection'
      ],
      mostLikelyDiagnosis: 'Acute Coronary Syndrome until proven otherwise',
      supportingEvidence: [
        'Central chest pressure with radiation',
        'Diaphoresis present',
        'Multiple risk factors',
        'Pain characteristics concerning',
        'Age and gender appropriate'
      ]
    },
    managementPathway: {
      immediate: [
        'Systematic ABCDE assessment',
        'Complete vital signs with manual BP (both arms)',
        '12-lead ECG within 10 minutes',
        'Cardiac monitor',
        'IV access if protocols allow',
        'Oxygen if SpO2 <94%',
        'SAMPLE history with cardiac emphasis',
        'OPQRS for pain assessment'
      ],
      definitive: [
        'Aspirin if not already taken and within protocols',
        'Transport to cardiac-capable hospital',
        'Pre-alert for possible STEMI',
        'Consider GTN (nitroglycerin / glyceryl trinitrate) spray sublingually if SBP ≥ 90 and no contraindications (PDE-5 inhibitor use, RV infarct)',
        'Monitor for arrhythmias',
        'Reassess after interventions'
      ],
      monitoring: [
        'Continuous cardiac monitoring',
        'Vital signs every 5 minutes',
        'Reassess pain level',
        'Monitor for changes in level of consciousness',
        '12-lead ECG repeated if symptoms change'
      ]
    },
    studentChecklist: [
      // 2nd Year Emphasis - Systematic Assessment (35%)
      {
        id: 'y2-002-abcde',
        category: 'abcde',
        description: 'Complete systematic ABCDE assessment',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Systematic approach ensures comprehensive assessment'
      },
      {
        id: 'y2-002-gcs',
        category: 'abcde',
        description: 'Calculate and document GCS (E/V/M)',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'GCS provides baseline for neurological monitoring'
      },
      {
        id: 'y2-002-glucose',
        category: 'abcde',
        description: 'Check blood glucose',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Hypoglycemia and hyperglycemia can mimic cardiac symptoms'
      },
      {
        id: 'y2-002-vitals-12-lead',
        category: 'abcde',
        description: '12-lead ECG obtained within 10 minutes',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: '12-lead ECG is essential for cardiac chest pain'
      },
      {
        id: 'y2-002-ecg-interpret',
        category: 'abcde',
        description: 'Basic ECG interpretation - normal vs abnormal',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Recognizing major ECG abnormalities is essential'
      },
      {
        id: 'y2-002-bp-both-arms',
        category: 'abcde',
        description: 'BP in both arms if dissection suspected',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'BP difference >20mmHg suggests aortic dissection'
      },
      {
        id: 'y2-002-lung-sounds',
        category: 'abcde',
        description: 'Auscultate lung sounds',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Lung sounds help differentiate cardiac vs respiratory cause'
      },

      // 2nd Year Emphasis - History Taking for Cardiac (25%)
      {
        id: 'y2-002-sample-full',
        category: 'history',
        description: 'Complete SAMPLE with cardiac emphasis',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Cardiac history is crucial for assessment'
      },
      {
        id: 'y2-002-opqrs-cardiac',
        category: 'history',
        description: 'OPQRS: Onset, Provokes, Quality, Region/Radiation, Severity, Time',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Detailed pain assessment differentiates cardiac causes'
      },
      {
        id: 'y2-002-risk-factors',
        category: 'history',
        description: 'Identify cardiac risk factors',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Risk factors help determine pre-test probability'
      },
      {
        id: 'y2-002-medications',
        category: 'history',
        description: 'Detailed medication history including compliance',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Current medications indicate known conditions'
      },

      // 2nd Year Emphasis - Clinical Reasoning (20%)
      {
        id: 'y2-002-recognize-red-flags',
        category: 'clinical-reasoning',
        description: 'Recognize cardiac red flags (diaphoresis, radiation, etc.)',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Red flags identify high-risk patients'
      },
      {
        id: 'y2-002-differentials',
        category: 'clinical-reasoning',
        description: 'Consider non-cardiac differentials',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Not all chest pain is cardiac - think broadly'
      },
      {
        id: 'y2-002-ecg-normal-vs-abnormal',
        category: 'clinical-reasoning',
        description: 'Recognize whether ECG is normal or shows concerning changes',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'ECG interpretation is a core 2nd year skill'
      },

      // Documentation (15%)
      {
        id: 'y2-002-document-all',
        category: 'documentation',
        description: 'Complete documentation with times',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Documentation creates record of assessment and findings'
      },
      {
        id: 'y2-002-document-ecg-time',
        category: 'documentation',
        description: 'Document ECG time and interpretation',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'ECG timing is important for cardiac care'
      },
      {
        id: 'y2-002-aspirin',
        category: 'intervention',
        description: 'Aspirin 300mg if no allergy/contraindication',
        points: 10,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true
      },
      {
        id: 'y2-002-gtn',
        category: 'intervention',
        description: 'GTN spray if SBP > 90 and no contraindications',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate']
      },
      {
        id: 'y2-002-morphine',
        category: 'intervention',
        description: 'Morphine 5mg IV titrated for pain (if severe)',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate']
      },
      {
        id: 'y2-002-iv',
        category: 'intervention',
        description: 'IV access — large bore',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true
      }
    ],
    teachingPoints: [
      'Systematic ABCDE prevents missing critical findings',
      'GCS must be calculated and documented correctly',
      'Blood glucose is essential - never assume "cardiac" without checking',
      '12-lead ECG within 10 minutes is the standard of care',
      'OPQRS should include Time (OPQRST) and remember Sample',
      'BP in both arms when dissection is a consideration',
      'Document times - cardiac care is time-sensitive',
      'Think about differentials but treat as cardiac until proven otherwise'
    ],
    commonPitfalls: [
      'Not checking blood glucose',
      'Inaccurate GCS calculation',
      'Missing ECG or delayed ECG',
      'Not getting complete SAMPLE history',
      'Forgetting to document times',
      'Not auscultating lung sounds',
      'Only thinking cardiac and missing differentials'
    ],
    references: [
      'Cardiac Emergencies Chapter',
      '12-Lead ECG Acquisition and Interpretation',
      'Chest Pain Differential Diagnosis'
    ]
  }),

  // Case 3: Stroke Assessment - GCS, pupils, secondary survey focus
  createCase({
    id: 'y2-003',
    title: 'Acute Stroke - Neurological Assessment Focus',
    category: 'neurological',
    subcategory: 'stroke',
    priority: 'critical',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year'],
    estimatedDuration: 18,
    dispatchInfo: {
      callReason: '67-year-old male slurred speech, weak arm',
      timeOfDay: 'afternoon',
      location: 'Home in Abu Dhabi',
      callerInfo: 'Wife',
      dispatchCode: 'Bravo-1'
    },
    patientInfo: {
      age: 67,
      gender: 'male',
      weight: 78,
      language: 'Arabic',
      culturalConsiderations: ['Family very involved', 'Religious considerations']
    },
    sceneInfo: {
      description: 'Home, living room sofa, patient sitting sideways, wife present',
      hazards: ['None identified'],
      bystanders: 'Wife present and cooperative',
      environment: 'Safe home environment',
      environmentVariant: 'home',
      patientSupportSurface: 'sofa',
      sceneImagePath: '/scene-assets/home-stroke-elderly-male-uae.png',
      sceneImageCaption: 'Living room — home, elderly male on sofa'
    },
    initialPresentation: {
      generalImpression: 'Elderly male, alert but with obvious left-sided weakness',
      position: 'Sitting on sofa, leaning to left',
      appearance: 'Facial droop on left side, clothes disheveled',
      consciousness: 'Alert but has difficulty speaking'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but secretions may pool', 'Patient able to manage secretions'],
        interventions: ['Have suction ready', 'Position to maintain airway if needed']
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 97,
        findings: ['Breathing adequately', 'No increased work of breathing'],
        interventions: ['Monitor respiratory status', 'Oxygen if SpO2 drops']
      },
      circulation: {
        pulseRate: 88,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 175, diastolic: 100 },
        capillaryRefill: 2,
        skin: 'Warm and dry, pink',
        findings: ['Hypertensive', 'Good perfusion', 'No signs of shock'],
        interventions: ['Monitor BP', 'Establish IV if protocols allow']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 3, motor: 5, total: 12 },
        pupils: ['Right: 3mm reactive', 'Left: 4mm sluggish'],
        bloodGlucose: 8.2,
        findings: [
          'Alert but aphasic (difficulty speaking)',
          'GCS 12 (E4, V3, M5) - verbal component affected by aphasia, not consciousness',
          'Left pupil sluggish - possible uncal herniation sign',
          'Hyperglycemic (BSL 8.2) - may be stress response or diabetes',
          'Left-sided weakness (hemiparesis)',
          'Facial droop on left'
        ],
        interventions: [
          'Immediate blood glucose check',
          'Complete neurological assessment',
          'FAST assessment complete',
          'Protect weak side from injury',
          'Consider stroke team activation'
        ]
      },
      exposure: {
        temperature: 36.8,
        findings: ['No signs of trauma', 'Incontinence present'],
        interventions: ['Full exposure while maintaining dignity', 'Check for rash signs of infection']
      }
    },
    secondarySurvey: {
      head: ['Facial asymmetry — left-sided droop', 'Left nasolabial fold flattened', 'No trauma signs', 'No tongue bite'],
      neck: ['Supple, no meningismus', 'Carotids equal without bruit'],
      chest: ['Clear bilaterally', 'Regular heart rate and rhythm'],
      abdomen: ['Soft, non-tender', 'No guarding'],
      pelvis: ['Normal'],
      extremities: [
        'Left arm: decreased tone, weak grip (0/5 strength), pronator drift on outstretched arms',
        'Left leg: decreased tone, weak hip flexion (2/5 strength)',
        'Right side: normal strength (5/5), normal tone',
        'No deformities',
        'No peripheral oedema'
      ],
      posterior: ['Normal spine, no tenderness'],
      neurological: [
        'FAST positive — Face droop left, Arm drift left, Speech slurred (dysarthria), Time critical',
        'Left facial droop',
        'Dysarthria (slurred speech)',
        'Left hemiparesis — upper limb > lower limb weakness (MCA territory pattern)',
        'Left-sided hyperreflexia',
        'Babinski sign present on the left',
        'Conjugate gaze deviation to the RIGHT (patient looks toward the side of the lesion)'
      ]
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '10mg', frequency: 'Daily', indication: 'Blood pressure' },
        { name: 'Metformin', dose: '1000mg', frequency: 'Twice daily', indication: 'Diabetes' }
      ],
      allergies: ['No known allergies'],
      medicalConditions: [
        'Hypertension (15 years)',
        'Type 2 Diabetes (10 years)',
        'Hyperlipidemia'
      ],
      surgicalHistory: ['Cataract surgery'],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Patient was fine, talking to wife, then suddenly developed slurred speech and left arm weakness. Wife noticed difficulty speaking immediately and called for ambulance. Patient denies headache. Wife reports no trauma. Patient was last seen normal 30 minutes before onset.',
      socialHistory: {
        smoking: 'Ex-smoker (quit 10 years ago)',
        alcohol: 'None',
        occupation: 'Retired teacher',
        livingSituation: 'Lives with wife'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '175/100', pulse: 88, respiration: 18, spo2: 97, gcs: 12, bloodGlucose: 8.2 }
    },
    expectedFindings: {
      keyObservations: [
        'Sudden onset neurological deficits',
        'Left hemiparesis',
        'Facial droop',
        'Dysarthria',
        'Left pupil sluggish',
        'Multiple stroke risk factors',
        'Hyperglycemia'
      ],
      redFlags: [
        'Sluggish pupil - possible sign of increased ICP',
        'Hyperglycemia - could indicate diabetes or stroke',
        'Hypertensive - may need BP management',
        'Sudden onset (time of onset critical for thrombolysis window)'
      ],
      differentialDiagnoses: [
        'Ischemic stroke (MCA distribution)',
        'Hemorrhagic stroke',
        'Hypoglycemia/hyperglycemia mimicking stroke',
        'Todd paralysis (post-seizure)',
        'Space-occupying lesion'
      ],
      mostLikelyDiagnosis: 'Acute Ischemic Stroke - Right MCA distribution until proven otherwise',
      supportingEvidence: [
        'Sudden onset focal deficits',
        'Left hemiparesis and facial droop',
        'Dysarthria',
        'Multiple cardiovascular risk factors',
        'Time course consistent with stroke'
      ]
    },
    managementPathway: {
      immediate: [
        'Systematic ABCDE',
        'Complete vital signs including blood glucose',
        'FAST assessment complete',
        'Determine exact time of onset',
        'Protect weak side',
        'Establish IV if protocols allow',
        'Cardiac monitor',
        'Consider stroke team activation'
      ],
      definitive: [
        'Rapid transport to stroke center',
        'Pre-alert hospital with FAST findings and time of onset',
        'Position to maintain airway and protect weak side',
        'Monitor GCS and pupil status',
        'Consider blood glucose management if protocols allow',
        'Do not give food or drink by mouth (NPO)'
      ],
      monitoring: [
        'Reassess GCS every 5-10 minutes',
        'Monitor pupil size and reactivity',
        'Monitor for deterioration (pupil changes, decreasing GCS)',
        'Monitor for seizure activity',
        'Repeat blood glucose if improving or worsening'
      ]
    },
    studentChecklist: [
      // 2nd Year Emphasis - Neurological Assessment (35%)
      {
        id: 'y2-003-gcs-accurate',
        category: 'abcde',
        description: 'Accurate GCS calculation including verbal score',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Accurate GCS requires testing each component, not assuming'
      },
      {
        id: 'y2-003-pupils',
        category: 'abcde',
        description: 'Pupil assessment - size, equality, reactivity',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Pupil changes are critical neurological signs'
      },
      {
        id: 'y2-003-glucose',
        category: 'abcde',
        description: 'Blood glucose check (stroke mimics)',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Hypo/hyperglycemia can mimic stroke - treatable causes'
      },
      {
        id: 'y2-003-fasting',
        category: 'abcde',
        description: 'FAST assessment - Face, Arms, Speech, Time',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'FAST identifies stroke quickly and accurately'
      },
      {
        id: 'y2-003-time-onset',
        category: 'history',
        description: 'Determine exact time of onset',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Time of onset determines treatment eligibility (thrombolysis window)'
      },
      {
        id: 'y2-003-secondary-neuro',
        category: 'secondary',
        description: 'Complete neurological secondary survey',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Secondary survey identifies all neurological deficits'
      },
      {
        id: 'y2-003-limb-comparison',
        category: 'secondary',
        description: 'Compare bilateral limb strength',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Bilateral comparison highlights asymmetry'
      },

      // 2nd Year Emphasis - Clinical Reasoning (25%)
      {
        id: 'y2-003-pupil-significance',
        category: 'clinical-reasoning',
        description: 'Recognize significance of sluggish pupil',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Sluggish pupil suggests increased ICP - critical finding'
      },
      {
        id: 'y2-003-stroke-mimics',
        category: 'clinical-reasoning',
        description: 'Consider stroke mimics (hypo/hyperglycemia)',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Stroke mimics are treatable - don\'t anchor on stroke'
      },
      {
        id: 'y2-003-risk-factors',
        category: 'clinical-reasoning',
        description: 'Identify relevant stroke risk factors',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Risk factors support diagnosis and guide management'
      },

      // Documentation (20%)
      {
        id: 'y2-003-document-time',
        category: 'documentation',
        description: 'Document time of onset and last known normal',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Time documentation is critical for stroke care'
      },
      {
        id: 'y2-003-document-gcs',
        category: 'documentation',
        description: 'Document GCS with breakdown (E/V/M)',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'GCS breakdown allows tracking changes'
      },
      {
        id: 'y2-003-document-neuro',
        category: 'documentation',
        description: 'Document neurological findings (pupils, limbs)',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Neuro documentation provides baseline'
      },
      {
        id: 'y2-003-bgl',
        category: 'intervention',
        description: 'Blood glucose check — exclude hypoglycaemia',
        points: 10,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Hypoglycaemia mimics stroke and is immediately treatable'
      },
      {
        id: 'y2-003-time',
        category: 'history',
        description: 'Document exact time of symptom onset (for thrombolysis window)',
        points: 10,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true
      },
      {
        id: 'y2-003-position',
        category: 'intervention',
        description: 'Position supine or 30-degree head elevation',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate']
      }
    ],
    teachingPoints: [
      'Blood glucose is MANDATORY for all neurological presentations',
      'GCS must be calculated: Eye (1-4), Verbal (1-5), Motor (1-6)',
      'Pupil changes are late but critical signs of herniation',
      'Time of onset is the most important information',
      'Last known normal time determines treatment window',
      'FAST assessment: Face drooping, Arm weakness, Speech difficulties, Time',
      'Protect the weak side from injury during transport',
      'Document pupil findings with size and reactivity for EACH eye separately',
      'Stroke mimics exist - always consider alternatives'
    ],
    commonPitfalls: [
      'Not checking blood glucose',
      'Assuming GCS without testing each component',
      'Not documenting pupil findings separately',
      'Missing last known normal time',
      'Focusing only on obvious deficits and completing full assessment',
      'Forgetting to check blood sugar in diabetics',
      'Not protecting weak side'
    ],
    references: [
      'Neurological Emergencies - Stroke Chapter',
      'GCS Assessment Guide',
      'FAST Assessment Reference',
      'Blood Glucose in Neurological Emergencies'
    ]
  }),

  // Case 4: Burns - Systematic assessment, airway monitoring, fluid resuscitation
  createCase({
    id: 'y2-004',
    title: 'Workshop Flash Burn - Burns Assessment',
    category: 'burns',
    subcategory: 'flash-burn',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 22,
    dispatchInfo: {
      callReason: '35-year-old male, flash burn to face and chest from welding accident',
      timeOfDay: 'morning',
      location: 'Industrial workshop in Al Quoz, Dubai',
      callerInfo: 'Colleague (witnessed incident)',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 35,
      gender: 'male',
      weight: 80,
      language: 'English',
      culturalConsiderations: ['Workplace incident - employer present', 'Colleagues anxious']
    },
    sceneInfo: {
      description: 'Industrial workshop, welding equipment present, patient sitting on floor against wall',
      hazards: ['Hot surfaces', 'Welding equipment still powered', 'Chemical solvents nearby'],
      bystanders: '4 colleagues present, one first-aider applying wet towels',
      environment: 'Indoor workshop, warm ambient temperature, well ventilated',
      environmentVariant: 'industrial',
      sceneImagePath: '/scene-assets/y2-004-workshop-flash-burn.png',
      sceneImageCaption: 'Scene — Indoor workshop, warm ambient temperature, well ventilated',
    },
    initialPresentation: {
      generalImpression: 'Adult male, alert, in significant pain, visible burns to face and anterior chest',
      position: 'Sitting upright against wall, holding hands away from body',
      appearance: 'Singed eyebrows and nasal hairs, erythema and blistering to face and chest, soot around nostrils',
      consciousness: 'Alert, distressed, speaking in short sentences due to pain'
    },
    abcde: {
      airway: {
        patent: true,
        findings: [
          'Airway currently patent',
          'Singed nasal hairs - RED FLAG for airway burns',
          'Soot deposits around nostrils and in oropharynx',
          'Voice slightly hoarse compared to baseline (colleague confirms)',
          'No stridor at present'
        ],
        interventions: [
          'High-flow oxygen 15L/min via non-rebreather immediately',
          'Continuous monitoring for airway compromise',
          'Prepare advanced airway equipment (anticipate deterioration)',
          'DO NOT delay transport - airway can deteriorate rapidly'
        ]
      },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Slightly shallow due to chest wall pain',
        spo2: 96,
        findings: [
          'Tachypneic (22/min) - pain and anxiety related',
          'SpO2 96% on room air',
          'Chest expansion slightly reduced due to pain',
          'No wheeze or stridor currently'
        ],
        interventions: [
          'High-flow oxygen 15L/min via non-rebreather',
          'Monitor for signs of inhalation injury (wheeze, stridor)',
          'Reassess respiratory rate and effort frequently',
          'Consider SpO2 may be falsely reassuring if CO exposure'
        ],
        auscultation: [
          'Clear bilaterally at present',
          'No wheeze or crackles',
          'Good air entry throughout'
        ]
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Regular and bounding',
        bp: { systolic: 130, diastolic: 85 },
        capillaryRefill: 2,
        skin: 'Non-burned areas warm and pink, burned areas erythematous with blistering',
        findings: [
          'Tachycardia (110/min) - pain, stress response, and fluid shift',
          'Blood pressure maintained at 130/85',
          'Good perfusion to non-burned areas',
          'Burns estimated ~15% TBSA (anterior chest 9%, face/head 4.5%, partial arms 1.5%)'
        ],
        interventions: [
          'IV access x2 large bore (18G) in non-burned areas',
          'Commence IV fluid resuscitation - Hartmann solution',
          'Parkland formula awareness: 4ml x weight(kg) x %TBSA = 4 x 80 x 15 = 4800ml in 24hrs',
          'First half (2400ml) in first 8 hours from TIME OF BURN',
          'Monitor urine output if catheter available'
        ],
        ivAccess: ['18G left antecubital fossa', '18G right forearm - both in non-burned skin']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        bloodGlucose: 7.8,
        findings: [
          'Alert and oriented',
          'GCS 15',
          'Significant pain (8/10)',
          'Blood glucose 7.8 - mildly elevated (stress response)',
          'Anxious but cooperative'
        ],
        interventions: [
          'Pain management is priority - IV morphine titrated',
          'Reassess GCS regularly',
          'Monitor for signs of CO poisoning (confusion, headache)'
        ]
      },
      exposure: {
        findings: [
          'Face: Superficial to partial thickness burns - erythema, blistering, singed eyebrows',
          'Anterior chest: Mixed depth burns - areas of erythema and blistering',
          'Upper arms: Superficial erythema',
          'Estimated ~15% TBSA using Rule of Nines',
          'No circumferential burns',
          'No other injuries identified',
          'Core temperature 37.4C'
        ],
        interventions: [
          'Remove clothing and jewellery from burned areas (rings, watch, necklace)',
          'Cool burns with running tepid water for 20 minutes (if <3 hours since burn)',
          'Apply cling film loosely over cooled burns (do NOT wrap circumferentially)',
          'Prevent hypothermia - cover non-burned areas',
          'Do NOT apply creams, lotions, or ice',
          'Do NOT burst blisters'
        ],
        temperature: 37.4
      }
    },
    secondarySurvey: {
      head: [
        'Singed eyebrows bilaterally',
        'Superficial facial burns with blistering to forehead and cheeks',
        'Singed nasal hairs',
        'Soot in nostrils and around mouth',
        'No corneal burns apparent (patient able to open eyes)',
        'Ears: erythema to helices bilaterally'
      ],
      neck: ['No burns to neck', 'Trachea midline', 'No lymphadenopathy', 'No crepitus'],
      chest: [
        'Anterior chest: mixed depth burns approximately 9% TBSA',
        'Areas of erythema (superficial) and blistering (partial thickness)',
        'No full thickness areas identified',
        'Chest expansion symmetrical but guarded',
        'Clear lung sounds bilaterally'
      ],
      abdomen: ['No burns below nipple line', 'Soft, non-tender'],
      pelvis: ['Normal, no burns'],
      extremities: [
        'Superficial erythema to dorsal aspects of both upper arms',
        'Hands: minor erythema only, no blistering',
        'Lower extremities unaffected',
        'Good peripheral pulses throughout',
        'Localised swelling at burn sites'
      ],
      posterior: ['No posterior burns', 'Spine non-tender'],
      neurological: ['Alert and oriented', 'No focal deficits', 'Pain response appropriate']
    },
    history: {
      medications: [
        { name: 'None regular', dose: '', frequency: '', indication: '' }
      ],
      allergies: ['No known drug allergies'],
      medicalConditions: ['Generally fit and well', 'No significant past medical history'],
      surgicalHistory: ['Knee arthroscopy 5 years ago'],
      lastMeal: 'Breakfast 3 hours ago - coffee and toast',
      eventsLeading: 'Patient was welding a metal frame when a flashback occurred from the welding torch. Colleagues report a brief flash of flame that engulfed the patient\'s upper body. Patient was wearing a welding helmet but had lifted the visor moments before. Colleagues used fire extinguisher and applied wet towels. Incident occurred approximately 20 minutes ago.',
      socialHistory: {
        smoking: 'Smoker (10/day for 15 years)',
        alcohol: 'Social drinker on weekends',
        occupation: 'Welder/metalworker (12 years experience)',
        livingSituation: 'Lives with wife and 2 children'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '130/85', pulse: 110, respiration: 22, spo2: 96, gcs: 15, temperature: 37.4, bloodGlucose: 7.8 },
      afterIntervention: { bp: '123/80', pulse: 72, respiration: 15, spo2: 99, gcs: 15 },
      deterioration: { bp: '100/60', pulse: 130, respiration: 28, spo2: 92, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: [
        'Flash burn with ~15% TBSA mixed depth',
        'Singed nasal hairs and soot - potential inhalation injury',
        'Hoarse voice - possible early airway oedema',
        'Tachycardia from pain and stress response',
        'Currently haemodynamically stable',
        'Face involvement increases complexity'
      ],
      redFlags: [
        'Singed nasal hairs - inhalation injury until proven otherwise',
        'Soot in oropharynx - confirms exposure to hot gases',
        'Hoarse voice - may indicate early laryngeal oedema',
        'Facial burns - airway can swell rapidly and become unmanageable',
        'SpO2 may be falsely normal with carbon monoxide exposure',
        '>15% TBSA requires IV fluid resuscitation'
      ],
      differentialDiagnoses: [
        'Thermal flash burn with inhalation injury',
        'Chemical exposure burn (solvents in workshop)',
        'Electrical burn component (welding equipment)',
        'Carbon monoxide poisoning',
        'Blast injury (if pressure wave involved)'
      ],
      mostLikelyDiagnosis: 'Mixed depth thermal flash burn (~15% TBSA) with potential inhalation injury',
      supportingEvidence: [
        'Witnessed mechanism - welding flashback',
        'Distribution pattern consistent with flash burn',
        'Singed nasal hairs and soot suggest inhalation exposure',
        'Mixed depth burns with erythema and blistering',
        'Voice change suggests airway involvement'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety - ensure welding equipment isolated',
        'Systematic ABCDE with airway emphasis',
        'High-flow oxygen 15L/min (treat potential CO exposure)',
        'Assess and monitor airway for inhalation injury signs',
        'Cool burns with tepid running water for 20 minutes',
        'Remove clothing and jewellery from burned areas',
        'Complete vital signs including blood glucose',
        'Estimate %TBSA using Rule of Nines'
      ],
      definitive: [
        'IV access x2 large bore in non-burned areas',
        'IV fluid resuscitation commenced (Parkland formula awareness)',
        'IV morphine for pain management (titrate to effect)',
        'Apply cling film loosely to cooled burns',
        'Prevent hypothermia',
        'Rapid transport to burns centre',
        'Pre-alert receiving hospital with burn details',
        'Consider early intubation if airway deteriorating'
      ],
      monitoring: [
        'Airway reassessment every 2-3 minutes (priority)',
        'SpO2 continuous monitoring (consider CO-oximetry)',
        'Vital signs every 5 minutes',
        'Pain score reassessment after analgesia',
        'Monitor for circumferential burn complications',
        'Urine output if catheterised'
      ],
      transportConsiderations: [
        'Transport to burns centre (not nearest ED if possible)',
        'Position upright if airway concerns',
        'Keep patient warm - prevent hypothermia',
        'Prepare advanced airway equipment for transport',
        'Time-critical transfer - do not delay on scene'
      ]
    },
    studentChecklist: [
      {
        id: 'y2-004-scene-safety',
        category: 'safety',
        description: 'Assess scene safety including industrial hazards',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Industrial scenes have multiple hazards that must be identified'
      },
      {
        id: 'y2-004-airway-burns',
        category: 'abcde',
        description: 'Identify signs of inhalation injury (singed nasal hairs, soot, hoarse voice)',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Inhalation injury is the primary killer in burn patients'
      },
      {
        id: 'y2-004-high-flow-o2',
        category: 'intervention',
        description: 'Apply high-flow oxygen immediately',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'High-flow O2 treats potential CO poisoning and supports oxygenation'
      },
      {
        id: 'y2-004-cooling',
        category: 'intervention',
        description: 'Cool burns with tepid water for 20 minutes',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Cooling within 3 hours reduces burn depth and improves outcomes'
      },
      {
        id: 'y2-004-tbsa',
        category: 'abcde',
        description: 'Estimate %TBSA using Rule of Nines',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'TBSA estimation guides fluid resuscitation requirements'
      },
      {
        id: 'y2-004-iv-access',
        category: 'intervention',
        description: 'Establish IV access x2 in non-burned areas',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Burns >15% TBSA require IV fluid resuscitation'
      },
      {
        id: 'y2-004-parkland',
        category: 'clinical-reasoning',
        description: 'Awareness of Parkland formula for fluid calculation',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Understanding fluid resuscitation principles prevents shock'
      },
      {
        id: 'y2-004-pain-management',
        category: 'intervention',
        description: 'Administer adequate analgesia (IV morphine)',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Burns are extremely painful - adequate analgesia is essential'
      },
      {
        id: 'y2-004-cling-film',
        category: 'intervention',
        description: 'Apply cling film loosely to cooled burns',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Cling film protects wounds, reduces pain, and allows ongoing assessment'
      },
      {
        id: 'y2-004-hypothermia',
        category: 'intervention',
        description: 'Prevent hypothermia during cooling and transport',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Burn patients lose thermoregulation and hypothermia worsens outcomes'
      },
      {
        id: 'y2-004-remove-jewellery',
        category: 'intervention',
        description: 'Remove jewellery and clothing from burned areas',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Retained heat and swelling can worsen injury and cause constriction'
      },
      {
        id: 'y2-004-gcs-glucose',
        category: 'abcde',
        description: 'Check GCS and blood glucose',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Altered consciousness may indicate CO poisoning or shock'
      },
      {
        id: 'y2-004-document',
        category: 'documentation',
        description: 'Document burn depth, distribution, %TBSA, and time of injury',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Accurate documentation guides hospital treatment and fluid timing'
      },
      {
        id: 'y2-004-transport-decision',
        category: 'clinical-reasoning',
        description: 'Recognise need for burns centre rather than nearest ED',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Burns with inhalation injury require specialist burns care'
      }
    ],
    teachingPoints: [
      'Singed nasal hairs, soot in airway, and hoarse voice are RED FLAGS for inhalation injury',
      'Airway burns can progress rapidly - a patent airway now may obstruct within minutes',
      'High-flow oxygen is mandatory for all enclosed-space or flash burns (treat CO exposure)',
      'SpO2 can be falsely normal with carbon monoxide - it reads carboxyhaemoglobin as oxyhaemoglobin',
      'Rule of Nines: Head 9%, each arm 9%, anterior trunk 18%, posterior trunk 18%, each leg 18%, perineum 1%',
      'Burns >15% TBSA in adults require IV fluid resuscitation',
      'Parkland formula: 4ml x weight(kg) x %TBSA over 24 hours, half in first 8 hours from TIME OF BURN',
      'Cool burns with tepid water for 20 minutes if within 3 hours of injury',
      'Never apply ice, butter, toothpaste, or home remedies to burns',
      'Cling film applied loosely (not circumferentially) is the ideal pre-hospital dressing',
      'Pain management is critical - burns are among the most painful injuries'
    ],
    commonPitfalls: [
      'Failing to recognise signs of inhalation injury',
      'Not applying high-flow oxygen immediately',
      'Cooling with ice or very cold water (causes vasoconstriction and hypothermia)',
      'Overestimating or underestimating %TBSA',
      'Placing IV lines through burned skin',
      'Wrapping cling film circumferentially (acts as tourniquet with swelling)',
      'Inadequate pain management',
      'Spending too long on scene with airway concerns',
      'Forgetting to prevent hypothermia while cooling burns',
      'Trusting SpO2 in potential CO exposure'
    ],
    references: [
      'Burns Assessment and Management',
      'Inhalation Injury Recognition',
      'Parkland Formula and Fluid Resuscitation',
      'Rule of Nines - TBSA Estimation'
    ]
  }),

  // Case 5: Obstetric Emergency - Ectopic pregnancy
  createCase({
    id: 'y2-005',
    title: 'Ectopic Pregnancy - Obstetric Emergency',
    category: 'obstetric',
    subcategory: 'ectopic-pregnancy',
    priority: 'critical',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 18,
    dispatchInfo: {
      callReason: '26-year-old female with sudden severe lower abdominal pain',
      timeOfDay: 'afternoon',
      location: 'Office in DIFC, Dubai',
      callerInfo: 'Work colleague (concerned about patient collapsing)',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 26,
      gender: 'female',
      weight: 62,
      language: 'English',
      culturalConsiderations: ['Sensitive gynaecological history', 'Privacy important - workplace setting', 'May be reluctant to disclose pregnancy details in front of colleagues']
    },
    sceneInfo: {
      description: 'Modern office, patient lying on the floor of the break room, colleagues have placed a blanket over her',
      hazards: ['None identified'],
      bystanders: '3 colleagues present, concerned and willing to help',
      environment: 'Indoor, air conditioned office environment',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/y2-005-office-ectopic-lower-abdo.png',
      sceneImageCaption: 'Scene — Indoor, air conditioned office environment',
    },
    initialPresentation: {
      generalImpression: 'Young female, pale, diaphoretic, guarding lower abdomen, appears in significant pain',
      position: 'Lying on floor, knees drawn up, guarding abdomen',
      appearance: 'Pale, sweaty, anxious, in obvious distress',
      consciousness: 'Alert but distressed, answering questions between pain'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking clearly between episodes of pain'],
        interventions: ['Monitor airway']
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Slightly shallow due to abdominal guarding',
        spo2: 98,
        findings: [
          'Mildly tachypneic (20/min) - pain related',
          'SpO2 98% on room air',
          'Clear lung sounds bilaterally',
          'No increased work of breathing'
        ],
        interventions: [
          'Supplemental oxygen if SpO2 drops',
          'Monitor respiratory rate for early signs of shock'
        ],
        auscultation: [
          'Clear bilaterally',
          'No adventitious sounds'
        ]
      },
      circulation: {
        pulseRate: 105,
        pulseQuality: 'Regular, thready',
        bp: { systolic: 95, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Pale, cool, diaphoretic',
        findings: [
          'Tachycardia (105/min) - concerning for compensated shock',
          'Hypotension (95/60) - below expected for age',
          'Delayed capillary refill (3 seconds)',
          'Pale, cool, diaphoretic skin - shock signs',
          'Thready peripheral pulses'
        ],
        interventions: [
          'IV access x2 large bore immediately',
          'IV fluid bolus - Hartmann solution 250ml bolus, reassess',
          'Monitor BP closely for further deterioration',
          'Position supine with legs elevated if tolerated'
        ],
        ivAccess: ['18G right antecubital fossa', '18G left hand']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        bloodGlucose: 5.2,
        findings: [
          'Alert and oriented',
          'GCS 15',
          'Pain score 9/10 - severe lower abdominal pain',
          'Blood glucose normal',
          'Anxious and frightened'
        ],
        interventions: [
          'Pain management - IV morphine or fentanyl',
          'Reassure patient',
          'Monitor GCS for deterioration (shock)'
        ]
      },
      exposure: {
        findings: [
          'Abdomen: guarding and tenderness in lower abdomen, particularly right iliac fossa',
          'Mild abdominal distension',
          'Patient reports light vaginal spotting (dark blood) for 2 days',
          'No external bleeding visible',
          'No rash or bruising',
          'Temperature 37.1C'
        ],
        interventions: [
          'Maintain privacy and dignity',
          'Ask colleagues to leave the room for assessment',
          'Keep patient warm - blanket',
          'Do NOT perform vaginal examination'
        ],
        temperature: 37.1
      }
    },
    secondarySurvey: {
      head: ['Pale conjunctivae', 'Dry mucous membranes'],
      neck: ['No JVD', 'Trachea midline'],
      chest: ['Clear bilaterally', 'No chest tenderness'],
      abdomen: [
        'Lower abdominal tenderness, worse on right',
        'Guarding present in lower quadrants',
        'Mild distension',
        'Rebound tenderness present (peritonism)',
        'Bowel sounds present but reduced'
      ],
      pelvis: ['Tenderness on gentle palpation of suprapubic region', 'Patient reports vaginal spotting'],
      extremities: ['Cool peripheries', 'Thready radial pulses', 'No peripheral oedema'],
      posterior: ['Not assessed - patient in pain, minimise movement'],
      neurological: ['Alert and oriented', 'Anxious but appropriate', 'No focal deficits']
    },
    history: {
      medications: [
        { name: 'Combined oral contraceptive pill', dose: 'Standard dose', frequency: 'Daily', indication: 'Contraception - reports missed pills last month' }
      ],
      allergies: ['Codeine - nausea and vomiting'],
      medicalConditions: [
        'Previous chlamydia infection (treated 2 years ago)',
        'Otherwise fit and well'
      ],
      surgicalHistory: ['None'],
      lastMeal: 'Light lunch 2 hours ago',
      eventsLeading: 'Patient reports 8 weeks since last normal menstrual period. Has had intermittent lower abdominal pain for 3 days, worsening today. Dark vaginal spotting for 2 days. Today at work, experienced sudden onset severe right lower abdominal pain causing her to collapse. Denies trauma. Reports feeling dizzy and lightheaded when standing.',
      socialHistory: {
        smoking: 'Non-smoker',
        alcohol: 'Social (occasional)',
        occupation: 'Marketing executive',
        livingSituation: 'Lives with partner'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '95/60', pulse: 105, respiration: 20, spo2: 98, gcs: 15, temperature: 37.1, bloodGlucose: 5.2 },
      afterIntervention: { bp: '100/65', pulse: 98, respiration: 18, spo2: 99, gcs: 15 },
      deterioration: { bp: '80/50', pulse: 125, respiration: 26, spo2: 96, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: [
        'Young female with amenorrhoea and acute abdominal pain',
        'Haemodynamic instability - tachycardia and hypotension',
        'Signs of peritonism (rebound tenderness)',
        'Vaginal spotting with missed period',
        'Risk factors for ectopic: previous PID/chlamydia, missed OCP pills',
        'Signs of compensated shock'
      ],
      redFlags: [
        'Hypotension in a young female - significant blood loss before BP drops',
        'Tachycardia with thready pulse - early shock',
        'Peritonism - suggests intra-abdominal blood',
        'Amenorrhoea + abdominal pain = ectopic until proven otherwise',
        'Delayed capillary refill with cool peripheries',
        'Previous STI is risk factor for ectopic pregnancy'
      ],
      differentialDiagnoses: [
        'Ruptured ectopic pregnancy',
        'Ovarian cyst rupture or torsion',
        'Threatened miscarriage',
        'Appendicitis',
        'Pelvic inflammatory disease',
        'Urinary tract infection/renal colic'
      ],
      mostLikelyDiagnosis: 'Ruptured ectopic pregnancy until proven otherwise',
      supportingEvidence: [
        'Amenorrhoea of 8 weeks',
        'Sudden onset severe unilateral lower abdominal pain',
        'Vaginal spotting (dark blood)',
        'Signs of haemodynamic compromise',
        'Peritonism suggesting intraperitoneal blood',
        'Risk factors: previous chlamydia, missed OCP pills'
      ]
    },
    managementPathway: {
      immediate: [
        'Systematic ABCDE assessment',
        'Recognise haemodynamic instability immediately',
        'IV access x2 large bore',
        'IV fluid resuscitation - bolus and reassess',
        'High-flow oxygen',
        'Complete vital signs including blood glucose',
        'Sensitive history taking in private'
      ],
      definitive: [
        'TIME-CRITICAL - DO NOT delay transport',
        'Rapid transport to hospital with surgical capability',
        'Pre-alert receiving hospital: suspected ruptured ectopic',
        'Ongoing fluid resuscitation en route',
        'Position supine with legs elevated',
        'Pain management (IV opioid - avoid codeine per allergy)',
        'Keep nil by mouth',
        'Emotional support and reassurance'
      ],
      monitoring: [
        'Vital signs every 3-5 minutes',
        'Monitor for signs of worsening shock',
        'Reassess pain and abdominal examination',
        'Monitor GCS',
        'Track fluid volumes administered',
        'Monitor for vaginal bleeding changes'
      ],
      transportConsiderations: [
        'Time-critical transfer',
        'Surgical hospital required (not minor injuries unit)',
        'Pre-alert with suspected ruptured ectopic',
        'Lights and sirens appropriate',
        'Maintain IV access and fluids during transport'
      ]
    },
    studentChecklist: [
      {
        id: 'y2-005-abcde',
        category: 'abcde',
        description: 'Systematic ABCDE assessment identifying shock signs',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Systematic approach identifies haemodynamic compromise'
      },
      {
        id: 'y2-005-recognise-shock',
        category: 'clinical-reasoning',
        description: 'Recognise signs of compensated shock (tachycardia, hypotension, cool peripheries)',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Young patients compensate well - BP drops late'
      },
      {
        id: 'y2-005-suspect-ectopic',
        category: 'clinical-reasoning',
        description: 'Consider ectopic pregnancy in female of childbearing age with abdominal pain',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Any female of childbearing age with abdominal pain could have ectopic pregnancy'
      },
      {
        id: 'y2-005-sensitive-history',
        category: 'communication',
        description: 'Sensitively obtain gynaecological history in private',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Privacy and sensitivity are essential for accurate history'
      },
      {
        id: 'y2-005-iv-fluids',
        category: 'intervention',
        description: 'Establish IV access x2 and commence fluid resuscitation',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'IV access and fluids are essential for haemorrhagic shock'
      },
      {
        id: 'y2-005-analgesia',
        category: 'intervention',
        description: 'Provide appropriate analgesia (avoiding codeine per allergy)',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Pain management improves patient comfort and compliance'
      },
      {
        id: 'y2-005-rapid-transport',
        category: 'clinical-reasoning',
        description: 'Recognise time-critical nature and minimise on-scene time',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Ruptured ectopic requires urgent surgical intervention'
      },
      {
        id: 'y2-005-nil-by-mouth',
        category: 'intervention',
        description: 'Keep patient nil by mouth (potential surgery)',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Patient may need emergency surgery'
      },
      {
        id: 'y2-005-privacy',
        category: 'communication',
        description: 'Ensure privacy and dignity throughout assessment',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Sensitive presentation requires appropriate privacy measures'
      },
      {
        id: 'y2-005-gcs-glucose',
        category: 'abcde',
        description: 'Check GCS and blood glucose',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Altered consciousness may occur with significant blood loss'
      },
      {
        id: 'y2-005-document',
        category: 'documentation',
        description: 'Document vital signs, LMP, fluid volumes, and times',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Accurate documentation guides hospital management'
      },
      {
        id: 'y2-005-pre-alert',
        category: 'communication',
        description: 'Pre-alert hospital with suspected ruptured ectopic',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Pre-alerting allows surgical team preparation'
      },
      {
        id: 'y2-005-fluid',
        category: 'intervention',
        description: 'IV fluid resuscitation — NaCl bolus for hypotension',
        points: 10,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true
      },
      {
        id: 'y2-005-iv',
        category: 'intervention',
        description: 'Two large-bore IV access',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true
      },
      {
        id: 'y2-005-position',
        category: 'intervention',
        description: 'Left lateral position',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate']
      }
    ],
    teachingPoints: [
      'ANY female of childbearing age with abdominal pain could have an ectopic pregnancy - always ask about LMP',
      'Ectopic pregnancy is a surgical emergency - do NOT delay transport',
      'Young patients compensate well for blood loss - tachycardia appears before hypotension',
      'Risk factors for ectopic: previous PID/STIs, previous ectopic, IUD, tubal surgery, missed OCP',
      'Vaginal spotting with amenorrhoea and pain = ectopic until proven otherwise',
      'Peritonism (rebound tenderness) suggests free blood in the peritoneum',
      'Do NOT perform vaginal examination in the pre-hospital setting',
      'Sensitivity and privacy are essential when taking gynaecological history',
      'Fluid resuscitation: bolus and reassess, do not just run fluids wide open',
      'Pre-alert the hospital - the patient may need immediate surgery'
    ],
    commonPitfalls: [
      'Failing to consider pregnancy in female of childbearing age',
      'Not asking about last menstrual period',
      'Attributing symptoms to gastroenteritis or UTI without considering ectopic',
      'Delaying transport for excessive on-scene assessment',
      'Not establishing adequate IV access',
      'Forgetting to keep nil by mouth',
      'Failing to provide privacy for sensitive history taking',
      'Underestimating blood loss in young patients who compensate well',
      'Not recognising thready pulse and delayed cap refill as shock signs'
    ],
    references: [
      'Obstetric and Gynaecological Emergencies',
      'Ectopic Pregnancy Recognition and Management',
      'Haemorrhagic Shock Management',
      'Abdominal Pain Assessment in Females'
    ]
  }),

  // Case 6: Neurological - TIA (Transient Ischaemic Attack)
  createCase({
    id: 'y2-006',
    title: 'TIA (Transient Ischaemic Attack) - Neurological Assessment',
    category: 'neurological',
    subcategory: 'tia',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 18,
    dispatchInfo: {
      callReason: '62-year-old male, episode of facial droop and slurred speech, now resolved',
      timeOfDay: 'morning',
      location: 'Golf club in Jumeirah, Dubai',
      callerInfo: 'Golf partner (witnessed episode)',
      dispatchCode: 'Bravo-1'
    },
    patientInfo: {
      age: 62,
      gender: 'male',
      weight: 88,
      language: 'English',
      culturalConsiderations: ['Patient may minimise symptoms as they resolved', 'Golf partners present and supportive']
    },
    sceneInfo: {
      description: 'Golf clubhouse lounge, patient sitting in a club chair beside his golf bag',
      hazards: ['None identified'],
      bystanders: '2 golf partners present, both witnessed the episode',
      environment: 'Comfortable indoor golf clubhouse lounge, air conditioned',
      environmentVariant: 'public',
      patientSupportSurface: 'seat',
      sceneImagePath: '/scene-assets/hotel-room-medical-uae.png',
      sceneImageCaption: 'Golf clubhouse lounge — Dubai, seated in club chair'
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, currently appears well, no obvious neurological deficit on initial glance',
      position: 'Sitting comfortably in chair',
      appearance: 'Well-dressed, colour normal, no obvious distress',
      consciousness: 'Alert and oriented, speaking clearly'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking clearly', 'No secretion issues'],
        interventions: ['Monitor airway status']
      },
      breathing: {
        rate: 16,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 97,
        findings: [
          'Respiratory rate normal (16/min)',
          'SpO2 97% on room air',
          'No respiratory distress',
          'Clear lung sounds bilaterally'
        ],
        interventions: ['Monitor respiratory status'],
        auscultation: ['Clear bilaterally', 'No adventitious sounds']
      },
      circulation: {
        pulseRate: 82,
        pulseQuality: 'Regular, good volume',
        bp: { systolic: 165, diastolic: 95 },
        capillaryRefill: 2,
        skin: 'Warm, dry, pink',
        findings: [
          'Heart rate 82/min - normal rate',
          'Hypertensive (165/95) - significant finding',
          'Good perfusion',
          'Regular rhythm - no atrial fibrillation detected on palpation'
        ],
        interventions: [
          'Cardiac monitor if available',
          'IV access if protocols allow',
          'Monitor BP - do NOT treat hypertension acutely'
        ],
        ivAccess: ['Consider 20G for precautionary access']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, briskly reactive',
        bloodGlucose: 6.8,
        findings: [
          'Currently GCS 15 - fully alert and oriented',
          'Pupils equal and reactive',
          'Blood glucose 6.8 - normal',
          'NO current focal neurological deficit',
          'FAST assessment currently normal',
          'Patient reports episode lasted approximately 15 minutes then fully resolved'
        ],
        interventions: [
          'Document current neurological status as baseline',
          'Perform thorough FAST assessment',
          'Assess limb strength bilaterally',
          'Check coordination and gait if safe',
          'Monitor for recurrence of symptoms'
        ]
      },
      exposure: {
        findings: [
          'No signs of trauma (did not fall during episode)',
          'No rash or skin changes',
          'Well-nourished appearance',
          'Temperature 36.8C'
        ],
        interventions: ['Complete examination while maintaining dignity'],
        temperature: 36.8
      }
    },
    secondarySurvey: {
      head: ['Normal examination', 'No facial asymmetry currently', 'No signs of trauma'],
      neck: ['No carotid bruit audible', 'Trachea midline', 'No JVD'],
      chest: ['Clear lung sounds bilaterally', 'Heart sounds normal, regular rhythm'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: [
        'Equal strength bilaterally (5/5 all limbs)',
        'Equal grip strength',
        'No pronator drift',
        'Good peripheral pulses',
        'No peripheral oedema'
      ],
      posterior: ['Not examined - patient ambulant'],
      neurological: [
        'Currently normal neurological examination',
        'FAST: Face symmetrical, Arms equal, Speech normal',
        'No dysphasia or dysarthria currently',
        'Cranial nerves grossly normal',
        'Finger-nose test normal bilaterally',
        'Gait normal'
      ]
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '5mg', frequency: 'Daily', indication: 'Hypertension' },
        { name: 'Atorvastatin', dose: '20mg', frequency: 'Nightly', indication: 'Cholesterol' },
        { name: 'Metformin', dose: '500mg', frequency: 'Twice daily', indication: 'Type 2 Diabetes' }
      ],
      allergies: ['Penicillin - anaphylaxis as a child'],
      medicalConditions: [
        'Hypertension (10 years)',
        'Type 2 Diabetes (5 years, well controlled)',
        'Hyperlipidemia',
        'Overweight (BMI 30)'
      ],
      surgicalHistory: ['Cholecystectomy (10 years ago)', 'Right knee replacement (3 years ago)'],
      lastMeal: 'Light breakfast 2 hours ago - toast and coffee',
      eventsLeading: 'Patient was playing golf with friends. During the 9th hole, his partners noticed his face drooped on the right side and his speech became slurred. Patient also reports his right hand felt "clumsy" and he dropped his golf club. Episode lasted approximately 15 minutes then completely resolved. Patient now feels "completely normal" and wants to continue playing golf. Partners insisted on calling ambulance. No headache, no loss of consciousness, no seizure activity. Episode occurred approximately 45 minutes ago.',
      socialHistory: {
        smoking: 'Ex-smoker (quit 5 years ago, 30 pack-year history)',
        alcohol: 'Moderate (2-3 glasses of wine most evenings)',
        occupation: 'Semi-retired business consultant',
        livingSituation: 'Lives with wife'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '165/95', pulse: 82, respiration: 16, spo2: 97, gcs: 15, temperature: 36.8, bloodGlucose: 6.8 },
      afterIntervention: { bp: '160/90', pulse: 78, respiration: 16, spo2: 98, gcs: 15 },
      deterioration: { bp: '180/105', pulse: 90, respiration: 18, spo2: 95, gcs: 13 }
    },
    expectedFindings: {
      keyObservations: [
        'Witnessed episode of transient focal neurological deficit',
        'Symptoms completely resolved within 15 minutes',
        'Multiple cerebrovascular risk factors',
        'Currently neurologically intact',
        'Patient minimising the event',
        'Hypertension on assessment'
      ],
      redFlags: [
        'Transient neurological deficit = TIA = medical emergency',
        'TIA is a WARNING of impending stroke (up to 20% have stroke within 90 days)',
        'Multiple modifiable risk factors present',
        'Patient wanting to dismiss event because symptoms resolved',
        'Hypertension at 165/95',
        'Recent episode (45 minutes ago) - could recur or progress to stroke'
      ],
      differentialDiagnoses: [
        'Transient Ischaemic Attack (TIA)',
        'Resolved stroke',
        'Hypoglycemia episode (diabetic patient)',
        'Seizure with Todd paralysis',
        'Migraine with aura',
        'Cervical artery dissection',
        'Cardiac arrhythmia causing transient cerebral hypoperfusion'
      ],
      mostLikelyDiagnosis: 'Transient Ischaemic Attack requiring urgent hospital assessment',
      supportingEvidence: [
        'Sudden onset focal neurological deficit (facial droop, dysarthria, hand weakness)',
        'Complete resolution within minutes',
        'Multiple vascular risk factors (HTN, DM, hyperlipidemia, ex-smoker)',
        'Episode consistent with anterior circulation TIA',
        'No alternative cause identified'
      ]
    },
    managementPathway: {
      immediate: [
        'Systematic ABCDE assessment',
        'Complete vital signs including blood glucose (rule out hypoglycemia)',
        'Full FAST assessment (even though symptoms resolved)',
        'Document EXACT time of onset and duration',
        'Thorough neurological examination as baseline',
        'Cardiac monitor (looking for AF)',
        '12-lead ECG if available'
      ],
      definitive: [
        'Transport to hospital - URGENT (this is a medical emergency)',
        'Pre-alert receiving hospital with TIA details',
        'Patient MUST go to hospital even though symptoms resolved',
        'Explain to patient that TIA is a warning sign of stroke',
        'Do NOT treat the hypertension in pre-hospital setting',
        'Monitor for symptom recurrence during transport'
      ],
      monitoring: [
        'Continuous neurological monitoring (FAST repeated)',
        'Monitor for new symptoms or recurrence',
        'Vital signs every 5-10 minutes',
        'GCS monitoring',
        'Cardiac rhythm monitoring if available',
        'Blood glucose monitoring'
      ],
      transportConsiderations: [
        'Urgent transport to stroke-capable hospital',
        'Patient may resist transport - requires clear explanation',
        'Monitor for deterioration en route',
        'Position comfortably',
        'Have airway equipment ready in case symptoms recur'
      ]
    },
    studentChecklist: [
      {
        id: 'y2-006-abcde',
        category: 'abcde',
        description: 'Complete systematic ABCDE assessment despite patient appearing well',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Systematic approach is essential even when patient looks well'
      },
      {
        id: 'y2-006-fast',
        category: 'abcde',
        description: 'Perform FAST assessment even though symptoms have resolved',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'FAST documents current baseline and identifies any residual deficits'
      },
      {
        id: 'y2-006-glucose',
        category: 'abcde',
        description: 'Check blood glucose (diabetic patient with neurological symptoms)',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Hypoglycemia can mimic TIA/stroke and is a treatable cause'
      },
      {
        id: 'y2-006-time-onset',
        category: 'history',
        description: 'Document exact time of symptom onset and duration',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Time of onset is critical for stroke/TIA management decisions'
      },
      {
        id: 'y2-006-witness-history',
        category: 'history',
        description: 'Obtain detailed witness account of the episode',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Witnesses provide objective account of symptoms patient may minimise'
      },
      {
        id: 'y2-006-not-dismiss',
        category: 'clinical-reasoning',
        description: 'Do NOT dismiss because symptoms have resolved - recognise TIA as emergency',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'TIA is a warning sign of impending stroke - 20% have stroke within 90 days'
      },
      {
        id: 'y2-006-risk-factors',
        category: 'clinical-reasoning',
        description: 'Identify cerebrovascular risk factors from history',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Risk factors support diagnosis and demonstrate clinical reasoning'
      },
      {
        id: 'y2-006-convince-transport',
        category: 'communication',
        description: 'Explain importance of hospital assessment to reluctant patient',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Patient education is crucial when patient wants to refuse transport'
      },
      {
        id: 'y2-006-neuro-exam',
        category: 'secondary',
        description: 'Complete neurological examination including limb strength comparison',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Thorough exam may reveal subtle residual deficits'
      },
      {
        id: 'y2-006-gcs',
        category: 'abcde',
        description: 'Calculate and document full GCS',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'GCS provides baseline for monitoring'
      },
      {
        id: 'y2-006-bp-document',
        category: 'abcde',
        description: 'Document hypertension but do NOT treat acutely',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Hypertension in TIA/stroke should not be treated pre-hospital'
      },
      {
        id: 'y2-006-documentation',
        category: 'documentation',
        description: 'Document onset time, duration, symptoms, and current neurological status',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Detailed documentation guides hospital investigation and management'
      }
    ],
    teachingPoints: [
      'TIA is a MEDICAL EMERGENCY - not a benign event',
      'Up to 20% of TIA patients will have a stroke within 90 days, highest risk in first 48 hours',
      'NEVER dismiss resolved neurological symptoms - they are a warning',
      'Always check blood glucose in neurological presentations - hypoglycemia is treatable',
      'FAST assessment should be performed even when symptoms have resolved',
      'Time of onset and duration must be accurately documented',
      'Witness accounts are invaluable when patient minimises symptoms',
      'Hypertension should be documented but NOT treated in the pre-hospital setting for TIA/stroke',
      'Patient education is critical when the patient appears well and wants to refuse transport',
      'Cardiac monitoring may reveal atrial fibrillation - a major cause of stroke/TIA',
      'Risk factors: hypertension, diabetes, smoking history, hyperlipidemia, AF, obesity, alcohol'
    ],
    commonPitfalls: [
      'Dismissing the event because symptoms have resolved',
      'Not checking blood glucose in a diabetic patient',
      'Allowing the patient to refuse transport because they "feel fine"',
      'Not documenting exact time of onset and duration',
      'Not performing FAST assessment because patient appears normal',
      'Treating hypertension pre-hospital',
      'Not obtaining witness history',
      'Failing to recognise TIA as a stroke warning',
      'Not completing a full systematic assessment because patient looks well'
    ],
    references: [
      'Neurological Emergencies - TIA and Stroke Chapter',
      'FAST Assessment Guide',
      'TIA Risk Stratification',
      'Blood Glucose in Neurological Presentations'
    ]
  }),

  // Case 7: Toxicology - Paracetamol overdose
  createCase({
    id: 'y2-007',
    title: 'Paracetamol Overdose - Toxicological Emergency',
    category: 'toxicology',
    subcategory: 'paracetamol-overdose',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: '19-year-old female, taken overdose of paracetamol tablets',
      timeOfDay: 'evening',
      location: 'Student accommodation in Academic City, Dubai',
      callerInfo: 'Flatmate (found empty packets, patient disclosed)',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 19,
      gender: 'female',
      weight: 58,
      language: 'English',
      culturalConsiderations: ['Young adult in distress', 'Flatmate as support person', 'Sensitive mental health situation', 'University exams stress context']
    },
    sceneInfo: {
      description: 'Student flat, patient sitting on bed, appears calm. Two empty blister packs of paracetamol 500mg on bedside table',
      hazards: ['Check for other medications or substances', 'Assess mental state and self-harm risk'],
      bystanders: 'Flatmate present and supportive, visibly upset',
      environment: 'Small student bedroom, tidy, no other concerning items visible',
      environmentVariant: 'home',
      sceneImagePath: '/scene-assets/y2-007-student-bedroom-overdose-female.png',
      sceneImageCaption: 'Student flat — bedroom, young female on bed'
    },
    initialPresentation: {
      generalImpression: 'Young female, alert, calm, appears physically well. Empty medication packets visible.',
      position: 'Sitting on edge of bed',
      appearance: 'Appears well, no obvious distress, may appear detached or withdrawn',
      consciousness: 'Alert and oriented, cooperative but quiet'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking normally', 'No vomiting'],
        interventions: ['Monitor airway', 'Have suction available in case of vomiting']
      },
      breathing: {
        rate: 16,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 99,
        findings: [
          'Respiratory rate normal (16/min)',
          'SpO2 99% on room air',
          'No respiratory distress',
          'Normal breath sounds'
        ],
        interventions: ['Monitor respiratory rate - Kussmaul breathing indicates metabolic acidosis'],
        auscultation: ['Clear bilaterally', 'Normal breath sounds throughout']
      },
      circulation: {
        pulseRate: 85,
        pulseQuality: 'Regular, good volume',
        bp: { systolic: 115, diastolic: 70 },
        capillaryRefill: 2,
        skin: 'Warm, dry, pink, well perfused',
        findings: [
          'Heart rate 85/min - normal',
          'Blood pressure 115/70 - normal',
          'Good perfusion',
          'Patient appears haemodynamically stable',
          'NOTE: Normal vitals do NOT exclude significant poisoning'
        ],
        interventions: [
          'IV access (anticipating N-acetylcysteine in hospital)',
          'Monitor vital signs closely despite normal presentation'
        ],
        ivAccess: ['20G right hand']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        bloodGlucose: 4.8,
        findings: [
          'GCS 15 - fully alert',
          'Pupils normal',
          'Blood glucose 4.8 - normal (monitor for hypoglycemia with liver damage)',
          'Patient emotionally flat but cooperative',
          'No signs of other substance ingestion'
        ],
        interventions: [
          'Mental health assessment - risk assessment',
          'Compassionate, non-judgmental communication',
          'Monitor GCS',
          'Repeat blood glucose (paracetamol hepatotoxicity can cause hypoglycemia later)'
        ]
      },
      exposure: {
        findings: [
          'No signs of self-harm (no cutting marks)',
          'No signs of other ingestion (no pill residue in mouth)',
          'Empty blister packs: 2x 16 tablets of Paracetamol 500mg = 30 tablets claimed (15g total)',
          'Temperature 36.9C',
          'Mild nausea reported but no vomiting'
        ],
        interventions: [
          'Count remaining tablets and empty packets',
          'Search for other medications or substances',
          'Document exact preparation, quantity, and timing',
          'Check for suicide note or messages'
        ],
        temperature: 36.9
      }
    },
    secondarySurvey: {
      head: ['Normal examination', 'No signs of trauma'],
      neck: ['Normal'],
      chest: ['Clear bilaterally', 'Normal heart sounds'],
      abdomen: [
        'Soft, mild right upper quadrant tenderness on deep palpation',
        'No guarding or rigidity',
        'Bowel sounds present',
        'Mild nausea but no vomiting'
      ],
      pelvis: ['Normal'],
      extremities: ['Normal, no track marks', 'No self-harm scars visible', 'No peripheral oedema'],
      posterior: ['Not examined'],
      neurological: ['Alert and oriented', 'No focal deficits', 'Emotionally flat']
    },

    history: {
      medications: [
        { name: 'Combined oral contraceptive pill', dose: 'Standard', frequency: 'Daily', indication: 'Contraception' }
      ],
      allergies: ['No known allergies'],
      medicalConditions: [
        'Anxiety (diagnosed 1 year ago, no current treatment)',
        'Otherwise fit and well'
      ],
      surgicalHistory: ['None'],
      lastMeal: 'Small lunch approximately 6 hours ago, no dinner',
      eventsLeading: 'Patient reports taking approximately 30 tablets of Paracetamol 500mg (15g total) approximately 4 hours ago. Took them all at once with water. Reports feeling overwhelmed with university exams and a recent relationship breakdown. Flatmate became suspicious when patient was unusually quiet and found empty blister packs in the bin. Patient disclosed when asked directly. Patient reports mild nausea but otherwise feels "fine" and now regrets taking them. No other substances taken. No alcohol consumed. No prior attempts.',
      socialHistory: {
        smoking: 'Non-smoker',
        alcohol: 'Occasional social drinking',
        occupation: 'University student (2nd year nursing)',
        livingSituation: 'Lives in shared student flat with 2 flatmates'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '115/70', pulse: 85, respiration: 16, spo2: 99, gcs: 15, temperature: 36.9, bloodGlucose: 4.8 },
      afterIntervention: { bp: '125/76', pulse: 70, respiration: 16, spo2: 99, gcs: 15 },
      deterioration: { bp: '105/65', pulse: 95, respiration: 20, spo2: 98, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: [
        'Patient currently appears well - this is EXPECTED and DANGEROUS',
        'Paracetamol toxicity has a delayed presentation (24-72 hours)',
        '15g ingestion is well above toxic threshold (150mg/kg = ~8.7g for this patient)',
        'Ingestion 4 hours ago - within treatment window',
        'Patient cooperative and now regretful',
        'Mild RUQ tenderness may indicate early hepatic effects'
      ],
      redFlags: [
        'Patient looks well NOW but liver failure can develop in 24-72 hours',
        'Dose of 15g (259mg/kg) is significantly above toxic threshold (150mg/kg)',
        'Time of ingestion critical - activated charcoal effective only within 1-2 hours',
        'N-acetylcysteine most effective within 8 hours - DO NOT DELAY',
        'Single large ingestion (staggered dosing is more dangerous)',
        'Mental health crisis requires assessment and support'
      ],
      differentialDiagnoses: [
        'Paracetamol overdose (isolated)',
        'Mixed overdose (always consider co-ingestion)',
        'Paracetamol + alcohol interaction',
        'Patient may have taken more than reported',
        'Consider other tablets may have been taken'
      ],
      mostLikelyDiagnosis: 'Significant paracetamol overdose requiring urgent N-acetylcysteine',
      supportingEvidence: [
        'Empty blister packs support reported quantity',
        'Time of ingestion clearly established',
        'Single substance confirmed by patient and scene assessment',
        'Dose calculation: 30 x 500mg = 15g (259mg/kg) - significantly toxic',
        'Currently asymptomatic as expected at 4 hours post-ingestion'
      ]
    },
    managementPathway: {
      immediate: [
        'Systematic ABCDE assessment',
        'Complete vital signs including blood glucose',
        'Establish exact: WHAT was taken, HOW MUCH, WHEN, WHY',
        'Count tablets/packets to verify amount',
        'Search for other medications or substances',
        'IV access',
        'Compassionate, non-judgmental approach',
        'Mental health risk assessment'
      ],
      definitive: [
        'URGENT transport to hospital - do NOT delay',
        'N-acetylcysteine required in hospital (most effective <8 hours)',
        'Activated charcoal NOT indicated (>2 hours since ingestion)',
        'Pre-alert hospital with: substance, quantity, time of ingestion, patient weight',
        'Do NOT dismiss because patient looks well',
        'Bring medication packets to hospital',
        'Ensure mental health team involvement at hospital'
      ],
      monitoring: [
        'Monitor vital signs every 10 minutes',
        'Monitor for vomiting (aspiration risk)',
        'Repeat blood glucose (hepatotoxicity causes hypoglycemia)',
        'Monitor GCS',
        'Continuous emotional support',
        'Monitor for signs of co-ingestion (changed GCS, respiratory depression)'
      ],
      transportConsiderations: [
        'Urgent transport - time-critical for N-acetylcysteine',
        'Compassionate environment during transport',
        'Bring all medication packets and any suicide note',
        'Do NOT leave patient unattended',
        'Consider mental health escort if available',
        'Handover must include exact time of ingestion and quantity'
      ]
    },
    studentChecklist: [
      {
        id: 'y2-007-abcde',
        category: 'abcde',
        description: 'Systematic ABCDE assessment despite patient appearing well',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Systematic approach identifies baseline before delayed toxicity'
      },
      {
        id: 'y2-007-history-toxicology',
        category: 'history',
        description: 'Establish WHAT, HOW MUCH, WHEN, and WHY (toxicological history)',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Accurate toxicological history determines treatment pathway'
      },
      {
        id: 'y2-007-tablet-count',
        category: 'history',
        description: 'Count tablets/packets to verify ingested amount',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Physical evidence helps verify patient report'
      },
      {
        id: 'y2-007-co-ingestion',
        category: 'clinical-reasoning',
        description: 'Ask about and search for other substances taken',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Mixed overdoses are common and change management'
      },
      {
        id: 'y2-007-not-dismiss',
        category: 'clinical-reasoning',
        description: 'Recognise that looking well does NOT mean safe with paracetamol',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Paracetamol toxicity is delayed 24-72 hours - patient dies looking well initially'
      },
      {
        id: 'y2-007-time-critical',
        category: 'clinical-reasoning',
        description: 'Recognise time-critical nature for N-acetylcysteine treatment',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'N-acetylcysteine is most effective within 8 hours of ingestion'
      },
      {
        id: 'y2-007-glucose',
        category: 'abcde',
        description: 'Check blood glucose (liver damage causes hypoglycemia)',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Blood glucose monitoring important for hepatotoxicity detection'
      },
      {
        id: 'y2-007-compassionate',
        category: 'communication',
        description: 'Non-judgmental, compassionate communication',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Patient in mental health crisis requires sensitive approach'
      },
      {
        id: 'y2-007-mental-health',
        category: 'clinical-reasoning',
        description: 'Conduct basic mental health risk assessment',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Mental health assessment identifies ongoing risk and informs handover'
      },
      {
        id: 'y2-007-bring-packets',
        category: 'intervention',
        description: 'Collect and bring medication packets to hospital',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Packets confirm substance and help calculate dose'
      },
      {
        id: 'y2-007-no-charcoal',
        category: 'clinical-reasoning',
        description: 'Recognise activated charcoal NOT indicated (>2 hours since ingestion)',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Charcoal is only effective within 1-2 hours of ingestion'
      },
      {
        id: 'y2-007-document',
        category: 'documentation',
        description: 'Document exact substance, quantity, time, and circumstances',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Accurate documentation is essential for toxicology management'
      },
      {
        id: 'y2-007-do-not-leave',
        category: 'safety',
        description: 'Do not leave patient unattended at any time',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Patient at risk of further self-harm must not be left alone'
      }
    ],
    teachingPoints: [
      'Paracetamol is the most common drug taken in overdose in many countries',
      'Paracetamol toxicity is DELAYED - patients look well for 24-72 hours then develop liver failure',
      'NEVER dismiss a paracetamol overdose because the patient looks well',
      'Toxic dose threshold: 150mg/kg as single ingestion, lower with risk factors',
      'N-acetylcysteine (NAC) is the antidote - most effective within 8 hours',
      'Activated charcoal only useful within 1-2 hours of ingestion',
      'The 4 key toxicological questions: WHAT, HOW MUCH, WHEN, WHY',
      'Always consider co-ingestion - patients may not report everything',
      'Blood glucose monitoring is important - liver failure causes hypoglycemia',
      'Mental health assessment is as important as medical management',
      'Non-judgmental, compassionate approach improves patient disclosure and cooperation',
      'Bring all medication packets and evidence to hospital'
    ],
    commonPitfalls: [
      'Dismissing the patient because they look well and vitals are normal',
      'Not establishing exact time of ingestion',
      'Not counting tablets to verify the dose',
      'Forgetting to search for co-ingestants',
      'Being judgmental or dismissive of the patient',
      'Not recognising time-critical nature for NAC treatment',
      'Attempting to give activated charcoal when >2 hours since ingestion',
      'Not checking blood glucose',
      'Leaving the patient unattended',
      'Not bringing medication packets to hospital',
      'Failing to conduct mental health risk assessment'
    ],
    references: [
      'Toxicological Emergencies - Paracetamol Overdose',
      'Overdose and Poisoning Management',
      'Mental Health Crisis Assessment',
      'N-Acetylcysteine Protocol'
    ]
  }),

  // Case 8: Psychiatric - Acute psychosis
  createCase({
    id: 'y2-008',
    title: 'Acute Psychosis - Psychiatric Emergency',
    category: 'psychiatric',
    subcategory: 'acute-psychosis',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 22,
    dispatchInfo: {
      callReason: '28-year-old male, bizarre behaviour, aggressive, talking to unseen people',
      timeOfDay: 'evening',
      location: 'Apartment in JLT, Dubai',
      callerInfo: 'Neighbour (heard shouting, concerned)',
      dispatchCode: 'Bravo-3',
      additionalInfo: ['Police also dispatched', 'Unknown if patient has weapons']
    },
    patientInfo: {
      age: 28,
      gender: 'male',
      weight: 75,
      language: 'English',
      culturalConsiderations: ['Patient may be unable to provide coherent history', 'Cultural stigma around mental health', 'Requires sensitive approach']
    },
    sceneInfo: {
      description: 'Ground floor apartment, door ajar, patient pacing in living room, furniture overturned',
      hazards: ['Patient agitated and potentially aggressive', 'Overturned furniture', 'Unknown if weapons present', 'Kitchen knives accessible'],
      bystanders: 'Neighbour outside the apartment, no family present',
      environment: 'Indoor apartment, cluttered, curtains drawn, lights off'
    },
    initialPresentation: {
      generalImpression: 'Young male, agitated, pacing, talking rapidly to unseen entities, appears fearful',
      position: 'Standing, pacing back and forth, will not sit',
      appearance: 'Disheveled, unwashed appearance, clothes inappropriate (wearing winter jacket indoors in warm room), barefoot',
      consciousness: 'Alert but disoriented to situation, responding to internal stimuli (hallucinations)'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking continuously (pressured speech)', 'No airway compromise'],
        interventions: ['Monitor airway - agitation could lead to vomiting']
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: [
          'Mildly tachypneic (20/min) - agitation related',
          'SpO2 98%',
          'No respiratory distress',
          'Speaking in long rapid sentences'
        ],
        interventions: ['Monitor respiratory status'],
        auscultation: ['Defer if patient will not tolerate - safety priority']
      },
      circulation: {
        pulseRate: 100,
        pulseQuality: 'Regular, bounding',
        bp: { systolic: 140, diastolic: 85 },
        capillaryRefill: 2,
        skin: 'Warm, diaphoretic, flushed',
        findings: [
          'Tachycardia (100/min) - agitation, potential substance use',
          'Mild hypertension (140/85) - agitation related',
          'Diaphoretic - consider organic causes or substances',
          'Well perfused'
        ],
        interventions: [
          'Defer IV access if patient too agitated (safety first)',
          'Attempt access when patient calmer or with assistance'
        ]
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal 5mm, reactive (dilated)',
        bloodGlucose: 5.6,
        findings: [
          'Alert but confused and disoriented',
          'GCS 14 (E4, V4, M6) - confused verbal responses',
          'Pupils dilated (5mm) bilaterally - consider substance use',
          'Blood glucose 5.6 - normal (rules out hypoglycemia)',
          'Responding to auditory hallucinations (talking to voices)',
          'Paranoid - believes people are watching/following him',
          'Thought content disorganised',
          'No insight into condition'
        ],
        interventions: [
          'Check blood glucose IMMEDIATELY (rule out organic cause)',
          'Assess pupils carefully (substance indicator)',
          'De-escalation techniques as priority',
          'Do NOT confront or challenge delusions',
          'Assess for organic causes'
        ]
      },
      exposure: {
        findings: [
          'Wearing inappropriate clothing for environment (winter jacket in warm room)',
          'Appears unwashed (days without personal care)',
          'No obvious injuries or signs of self-harm',
          'No injection marks visible on exposed skin',
          'Diaphoretic',
          'Temperature 37.6C - mildly elevated'
        ],
        interventions: [
          'Assess for signs of substance use (injection sites, paraphernalia)',
          'Look for medical alert jewellery',
          'Check for injuries from overturning furniture',
          'Defer full exposure if patient too agitated'
        ],
        temperature: 37.6
      }
    },
    secondarySurvey: {
      head: ['No signs of head trauma', 'Pupils dilated 5mm bilaterally', 'No battle signs or raccoon eyes'],
      neck: ['Defer if patient agitated', 'No obvious neck injuries'],
      chest: ['Defer auscultation if patient agitated', 'No visible chest injuries'],
      abdomen: ['Defer if patient will not allow assessment'],
      pelvis: ['Defer'],
      extremities: [
        'Minor scratches on forearms (likely from overturning furniture)',
        'No injection marks visible',
        'No restraint injuries'
      ],
      posterior: ['Defer'],
      neurological: [
        'Disoriented to time and situation',
        'Oriented to place (knows he is at home)',
        'Pressured speech, flight of ideas',
        'Responding to auditory hallucinations',
        'Paranoid ideation',
        'Motor agitation - pacing',
        'No focal neurological deficits identified',
        'Pupils dilated bilaterally'
      ]
    },
    history: {
      medications: [
        { name: 'Unknown', dose: '', frequency: '', indication: 'Patient unable to provide medication history - may have ceased psychiatric medications' }
      ],
      allergies: ['Unable to obtain - patient not cooperative for detailed history'],
      medicalConditions: [
        'Unable to confirm - neighbour reports patient mentioned "mental health problems" previously',
        'Possible previous psychiatric history (unconfirmed)'
      ],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Unknown - neighbour reports not seeing patient for 3 days',
      eventsLeading: 'Neighbour reports hearing increasingly loud shouting from apartment over the past 2 days. Today, shouting became very loud with banging and crashing sounds. Neighbour knocked on door but patient shouted "they are coming to get me" and would not open. Neighbour called ambulance when shouting continued for over an hour. Patient has lived alone in the apartment for approximately 6 months. Neighbour reports patient has become increasingly reclusive over past month.',
      socialHistory: {
        smoking: 'Unknown',
        alcohol: 'Unknown - no empty bottles visible',
        drugs: 'Unknown - no drug paraphernalia visible but dilated pupils noted',
        occupation: 'Unknown - neighbour thinks IT related',
        livingSituation: 'Lives alone in apartment'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '140/85', pulse: 100, respiration: 20, spo2: 98, gcs: 14, temperature: 37.6, bloodGlucose: 5.6 },
      afterIntervention: { bp: '130/80', pulse: 90, respiration: 18, spo2: 98, gcs: 14 },
      deterioration: { bp: '155/95', pulse: 120, respiration: 24, spo2: 97, gcs: 12 }
    },
    expectedFindings: {
      keyObservations: [
        'Acute behavioural disturbance with psychotic features',
        'Auditory hallucinations and paranoid delusions',
        'Dilated pupils - consider substance use',
        'Social withdrawal over preceding weeks (prodromal phase)',
        'Self-neglect evident',
        'No confirmed psychiatric history but probable',
        'Currently agitated but not violent'
      ],
      redFlags: [
        'Must rule out organic causes: hypoglycemia, infection, head injury, substance intoxication',
        'Dilated pupils suggest possible substance use (stimulants)',
        'Mild pyrexia - could indicate infection (encephalitis, meningitis)',
        'Patient has been increasingly reclusive - possible medication non-compliance',
        'Living alone with no support network visible',
        'Potential for violence due to paranoid beliefs'
      ],
      differentialDiagnoses: [
        'Acute psychotic episode (first episode or relapse)',
        'Substance-induced psychosis (stimulants, cannabis, synthetic drugs)',
        'Acute confusional state / delirium (infection, metabolic)',
        'Encephalitis or meningitis',
        'Hypoglycemia (ruled out with BGL)',
        'Head injury / intracranial pathology',
        'Thyroid storm or other endocrine emergency',
        'Serotonin syndrome or medication reaction'
      ],
      mostLikelyDiagnosis: 'Acute psychotic episode - must exclude organic causes',
      supportingEvidence: [
        'Auditory hallucinations and paranoid delusions',
        'Progressive social withdrawal (prodromal phase)',
        'Age of onset consistent with first-episode psychosis (late 20s)',
        'Self-neglect and disorganised behaviour',
        'No clear organic cause identified (BGL normal, no trauma signs)',
        'However, dilated pupils and mild pyrexia require further investigation'
      ]
    },
    managementPathway: {
      immediate: [
        'SCENE SAFETY is absolute priority',
        'Wait for police if scene not safe',
        'Maintain safe distance, identify exits',
        'Approach calmly, introduce yourself, explain you are here to help',
        'De-escalation: calm voice, open body language, no sudden movements',
        'Do NOT confront or argue with delusions',
        'Check blood glucose IMMEDIATELY (rule out hypoglycemia)',
        'Assess pupils (substance indicator)',
        'Basic observations from a safe distance initially'
      ],
      definitive: [
        'Transport to hospital for medical assessment and psychiatric evaluation',
        'Attempt to build rapport before suggesting transport',
        'If patient refuses and presents risk - Mental Health Act considerations',
        'Consider chemical sedation only if patient is a danger to self/others',
        'Pre-alert hospital: psychiatric presentation, query organic cause',
        'Do NOT use physical restraint unless absolutely necessary for safety',
        'If restraint required - monitor for positional asphyxia',
        'Bring any medications found in apartment'
      ],
      monitoring: [
        'Continuous behavioural monitoring',
        'Monitor for escalation of agitation',
        'Monitor respiratory status (especially if sedation given)',
        'Repeat vital signs when safe to do so',
        'Monitor temperature (infection screening)',
        'GCS monitoring for deterioration'
      ],
      transportConsiderations: [
        'Consider if patient will cooperate with transport',
        'Mental Health Act provisions if patient refuses and meets criteria',
        'Adequate personnel for safe transport',
        'Remove potential weapons from patient area before transport',
        'Monitor for positional asphyxia if restrained',
        'Calming environment during transport (lights low, reduce stimuli)',
        'Continuous observation during transport'
      ]
    },
    studentChecklist: [
      {
        id: 'y2-008-scene-safety',
        category: 'safety',
        description: 'Prioritise scene safety - maintain distance, identify exits, wait for police if needed',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Paranoid patient may become violent - personal safety is paramount'
      },
      {
        id: 'y2-008-de-escalation',
        category: 'communication',
        description: 'Use de-escalation techniques: calm voice, open body language, empathic approach',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'De-escalation is the primary management tool for acute behavioural disturbance'
      },
      {
        id: 'y2-008-not-confront',
        category: 'communication',
        description: 'Do NOT confront, challenge, or argue with delusions',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Confronting delusions increases agitation and risk of violence'
      },
      {
        id: 'y2-008-glucose',
        category: 'abcde',
        description: 'Check blood glucose to rule out organic cause',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Hypoglycemia can present as psychosis and is immediately treatable'
      },
      {
        id: 'y2-008-pupils',
        category: 'abcde',
        description: 'Assess pupils (dilated pupils suggest substance use)',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Pupil assessment helps differentiate organic from psychiatric cause'
      },
      {
        id: 'y2-008-organic-causes',
        category: 'clinical-reasoning',
        description: 'Consider organic causes: substances, infection, metabolic, head injury',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Organic causes of psychosis require different treatment and may be life-threatening'
      },
      {
        id: 'y2-008-temperature',
        category: 'abcde',
        description: 'Check temperature (infection screening)',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Pyrexia may indicate infection (encephalitis, meningitis, sepsis)'
      },
      {
        id: 'y2-008-abcde',
        category: 'abcde',
        description: 'Attempt ABCDE assessment when safe (may need to adapt approach)',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Medical assessment identifies organic causes even when psychiatric presentation dominant'
      },
      {
        id: 'y2-008-mental-health-act',
        category: 'clinical-reasoning',
        description: 'Awareness of Mental Health Act provisions for involuntary assessment',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Legal framework may be needed if patient refuses transport'
      },
      {
        id: 'y2-008-no-restraint',
        category: 'safety',
        description: 'Avoid physical restraint unless absolutely necessary; if used, monitor for positional asphyxia',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Restraint carries risk of positional asphyxia and worsens agitation'
      },
      {
        id: 'y2-008-search-meds',
        category: 'history',
        description: 'Search for medications in apartment (may indicate psychiatric history)',
        points: 2,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Ceased medications may explain relapse; found medications inform hospital team'
      },
      {
        id: 'y2-008-documentation',
        category: 'documentation',
        description: 'Document behaviour, mental state, and vital signs objectively',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'Objective documentation supports psychiatric assessment and legal requirements'
      },
      {
        id: 'y2-008-gcs',
        category: 'abcde',
        description: 'Assess and document GCS',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        rationale: 'GCS monitors for organic deterioration alongside psychiatric presentation'
      },
      {
        id: 'y2-008-bgl',
        category: 'intervention',
        description: 'Blood glucose — exclude organic cause',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate'],
        critical: true
      },
      {
        id: 'y2-008-temp',
        category: 'intervention',
        description: 'Temperature check — exclude infection/NMS',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year', '4th-year'],
        complexity: ['intermediate']
      }
    ],
    teachingPoints: [
      'Scene safety is the FIRST priority in psychiatric emergencies',
      'De-escalation is more effective and safer than physical intervention',
      'NEVER confront, argue with, or dismiss delusional beliefs',
      'Always rule out organic causes of psychosis: hypoglycemia, infection, head injury, drugs, metabolic',
      'Blood glucose is MANDATORY - hypoglycemia can present as psychosis',
      'Dilated pupils, tachycardia, and pyrexia suggest organic or substance-related cause',
      'First-episode psychosis typically presents in late teens to late twenties',
      'Prodromal phase: social withdrawal, declining function, unusual beliefs precede acute psychosis',
      'Mental Health Act awareness: patients can be assessed involuntarily if risk to self or others',
      'Physical restraint is a last resort - positional asphyxia is a real risk',
      'Reduce stimulation: calm environment, low lights, minimal staff, quiet approach',
      'Document behaviour and mental state objectively (what you observe, not interpretations)'
    ],
    commonPitfalls: [
      'Not ensuring scene safety before approaching',
      'Confronting or arguing with delusional beliefs',
      'Not checking blood glucose (organic cause)',
      'Assuming psychiatric cause without ruling out organic causes',
      'Using excessive force or restraint',
      'Being dismissive or judgmental',
      'Not monitoring for positional asphyxia if restrained',
      'Missing dilated pupils as substance indicator',
      'Not checking temperature (infection)',
      'Rushing the encounter instead of using time as a de-escalation tool',
      'Failing to document objective behavioural observations'
    ],
    references: [
      'Psychiatric Emergencies - Acute Psychosis',
      'De-escalation Techniques in Pre-Hospital Care',
      'Mental Health Act and Pre-Hospital Practice',
      'Organic Causes of Psychosis - Differential Diagnosis'
    ]
  }),

  // Case 9: Cardiac Arrest - ACLS with Drug Administration
  createCase({
    id: 'y2-009',
    title: 'Cardiac Arrest - Workplace Collapse',
    category: 'cardiac',
    subcategory: 'cardiac-arrest',
    initialRhythm: 'Ventricular Fibrillation',
    priority: 'critical',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: '62-year-old male collapsed at work, not breathing',
      timeOfDay: 'morning',
      location: 'Construction site office, Al Quoz Industrial, Dubai',
      callerInfo: 'Co-worker (panicking, no first aid training)',
      dispatchCode: 'Echo-1'
    },
    patientInfo: {
      age: 62,
      gender: 'male',
      weight: 95,
      language: 'English',
      culturalConsiderations: ['Workplace setting - multiple bystanders', 'Construction site - potential environmental hazards']
    },
    sceneInfo: {
      description: 'Patient found on floor of site office, morning briefing was in progress. Hot day, patient had been outside supervising prior to coming inside.',
      hazards: ['Construction site environment', 'No AED on site', 'Limited space in office'],
      bystanders: '8 co-workers present, no one trained in CPR',
      environment: 'Indoor office on construction site, air conditioned but patient was outside in heat prior',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/y2-009-construction-office-arrest.png',
      sceneImageCaption: 'Scene — Indoor office on construction site, air conditioned but patient was outside in heat prior',
    },
    initialPresentation: {
      generalImpression: 'Elderly male, unresponsive, on floor, no signs of life',
      position: 'Supine on office floor',
      appearance: 'Cyanotic, no chest rise, vomit visible around mouth',
      consciousness: 'Unresponsive to all stimuli'
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Unresponsive - no gag reflex', 'Vomit present in mouth and around lips', 'Airway obstructed by emesis'],
        interventions: ['Suction oropharynx immediately', 'Log roll to clear vomit if no suction available', 'Insert OPA after suctioning', 'BVM ventilation with OPA in situ']
      },
      breathing: {
        rate: 0,
        rhythm: 'Absent',
        depth: 'Absent',
        spo2: 0,
        findings: [
          'Apnoeic - no respiratory effort',
          'No chest rise',
          'SpO2 unreadable',
          'Previous smoker (30 pack-year history per co-workers)'
        ],
        interventions: [
          'BVM ventilation with high-flow oxygen after airway cleared',
          'Ventilate at 10 breaths/min during CPR (1 breath every 6 seconds)',
          'Consider iGel/LMA for definitive airway',
          'Avoid hyperventilation'
        ],
        auscultation: [
          'No breath sounds bilaterally (apnoeic)',
          'After BVM: bilateral air entry confirmed'
        ]
      },
      circulation: {
        pulseRate: 0,
        pulseQuality: 'Absent',
        bp: { systolic: 0, diastolic: 0 },
        capillaryRefill: 0,
        skin: 'Cyanotic, cool peripherally, diaphoretic (per witnesses prior to collapse)',
        findings: [
          'No carotid pulse palpable',
          'No radial pulse',
          'Cardiac monitor/AED shows Ventricular Fibrillation (VF)',
          'VF persists after 1st shock',
          '2nd shock delivered - ROSC achieved',
          'Post-ROSC: HR 110, BP 85/55, weak thready pulse'
        ],
        interventions: [
          'Immediate high-quality CPR (100-120/min, 5-6cm depth)',
          'Apply defibrillator pads',
          'Shock 1: Defibrillate VF (biphasic 150-200J)',
          'Resume CPR immediately after shock for 2 minutes',
          'Shock 2: Defibrillate persistent VF',
          'IV access during CPR — AHA 2025: IV preferred over IO in adult arrest (do not stop compressions)',
          'Adrenaline 1mg IV after 3rd shock (repeat every 3-5 min)',
          'If VF persists after 3rd shock: Amiodarone 300mg IV',
          'Post-ROSC: 12-lead ECG, maintain SpO2 94-98%'
        ],
        ivAccess: ['18G IV in right AC during CPR (AHA 2025: IV preferred over IO in adult arrest)', 'IO as second-line if IV not achievable within 2 minutes']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 1, total: 3 },
        pupils: 'Bilaterally dilated 6mm, fixed during arrest. After ROSC: dilated but reactive',
        bloodGlucose: 8.2,
        findings: [
          'Unresponsive - GCS 3 during arrest',
          'Post-ROSC: GCS 4 (E1 V1 M2)',
          'Pupils dilated but become reactive after ROSC',
          'Blood glucose 8.2 mmol/L (mildly elevated - stress response)'
        ],
        interventions: [
          'Monitor GCS continuously post-ROSC',
          'Reassess pupils every 2 minutes',
          'Monitor blood glucose',
          'Targeted temperature management awareness'
        ]
      },
      exposure: {
        temperature: 36.0,
        findings: [
          'Overweight male (95kg estimated)',
          'Witnesses report he was sweating heavily before collapse (had been outside in heat)',
          'No obvious trauma or injuries from fall',
          'No medical alert jewellery',
          'Work clothes - high-vis vest, boots'
        ],
        interventions: [
          'Remove high-vis vest and loosen clothing for defibrillation',
          'Expose chest for pad placement',
          'Maintain dignity where possible',
          'Protect from environmental temperature post-ROSC'
        ]
      }
    },
    secondarySurvey: {
      head: ['No trauma from collapse', 'Vomit around mouth (suctioned)', 'Cyanosis resolving post-ROSC'],
      neck: ['Trachea midline', 'No JVD noted', 'Carotid pulse weak post-ROSC'],
      chest: [
        'Defibrillation pads in situ',
        'Chest wall intact - no crepitus',
        'Post-ROSC: bilateral air entry with BVM',
        'No chest wall tenderness from CPR'
      ],
      abdomen: ['Soft, distended', 'Obese habitus'],
      pelvis: ['Stable, no abnormalities'],
      extremities: ['Cool peripherally', 'Weak radial pulse post-ROSC', 'No peripheral oedema'],
      posterior: ['Log rolled during airway clearance - no spinal tenderness', 'No posterior injuries'],
      neurological: ['GCS 3 during arrest, GCS 4 post-ROSC', 'No purposeful movement', 'Pupils reactive post-ROSC']
    },
    history: {
      medications: [
        { name: 'Metoprolol', dose: '50mg', frequency: 'Twice daily', indication: 'Hypertension' },
        { name: 'Atorvastatin', dose: '40mg', frequency: 'Evening', indication: 'Hypercholesterolaemia' },
        { name: 'Aspirin', dose: '81mg', frequency: 'Daily', indication: 'Cardiovascular prophylaxis' },
        { name: 'Metformin', dose: '500mg', frequency: 'Twice daily', indication: 'Type 2 Diabetes' }
      ],
      allergies: [
        'No known drug allergies (per co-worker who knows him well)'
      ],
      medicalConditions: [
        'Hypertension (diagnosed 10 years ago)',
        'Type 2 Diabetes',
        'Hypercholesterolaemia',
        'Previous smoker (quit 5 years ago, 30 pack-year history)',
        'Family history of MI (father died age 58)'
      ],
      surgicalHistory: ['Appendectomy (age 30)', 'Right knee arthroscopy (2019)'],
      lastMeal: 'Breakfast at 6am - tea and toast (per co-worker)',
      eventsLeading: 'Patient was supervising outdoor construction work in the heat since 6am. Came inside for morning briefing at 8am. Co-workers noticed he looked pale and was sweating excessively. During the briefing he suddenly clutched his chest, said "I don\'t feel right", then collapsed to the floor. Co-workers called ambulance immediately but did not start CPR as none were trained.',
      socialHistory: {
        smoking: 'Ex-smoker (quit 5 years ago, 30 pack-year history)',
        alcohol: 'Social (occasional beer on weekends)',
        occupation: 'Construction site supervisor (physically demanding role)',
        livingSituation: 'Lives with wife in Dubai, adult children in UK'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '0/0', pulse: 0, respiration: 0, spo2: 0, gcs: 3, bloodGlucose: 8.2 },
      afterIntervention: { bp: '85/55', pulse: 110, respiration: 14, spo2: 92, gcs: 4 },
      deterioration: { bp: '60/30', pulse: 40, respiration: 6, spo2: 82, gcs: 3 }
    },
    expectedFindings: {
      keyObservations: [
        'Witnessed cardiac arrest - VF rhythm',
        'Delayed CPR (bystanders untrained)',
        'Airway compromised by vomit - suction required',
        'Multiple cardiovascular risk factors',
        'ROSC achieved after 2nd shock',
        'Post-ROSC hypotension and reduced consciousness'
      ],
      redFlags: [
        'Cardiac arrest - immediate life threat',
        'Vomit in airway - aspiration risk',
        'No bystander CPR - prolonged downtime',
        'Post-ROSC instability (hypotension, low GCS)',
        'Risk of re-arrest (PEA)',
        'Multiple comorbidities complicating resuscitation'
      ],
      differentialDiagnoses: [
        'Acute myocardial infarction (STEMI) with VF arrest',
        'Heat-related cardiac event',
        'Massive pulmonary embolism',
        'Aortic dissection',
        'Hyperkalaemia (diabetic patient)'
      ],
      mostLikelyDiagnosis: 'Acute MI with ventricular fibrillation cardiac arrest',
      supportingEvidence: [
        'Witnessed chest pain prior to collapse',
        'VF rhythm on monitor (shockable - typical of cardiac cause)',
        'Multiple cardiovascular risk factors (HTN, DM, smoking hx, FHx)',
        'Age and gender consistent with acute coronary syndrome',
        'Heat exposure may have been additional stressor'
      ]
    },
    managementPathway: {
      immediate: [
        'Confirm cardiac arrest (unresponsive, not breathing normally, no pulse)',
        'Call for help and request ALS backup',
        'Suction airway - clear vomit before ventilation',
        'Begin high-quality CPR immediately (30:2 until advanced airway)',
        'Apply defibrillator pads',
        'Analyse rhythm - identify VF',
        'Defibrillate (Shock 1)',
        'Resume CPR for 2 minutes',
        'Reanalyse - persistent VF - Shock 2',
        'IV access during CPR (AHA 2025: IV preferred over IO in adult arrest; IO is second-line)',
        'Adrenaline 1mg IV after 3rd shock'
      ],
      definitive: [
        'Continue 2-minute CPR cycles with rhythm checks',
        'Amiodarone 300mg IV after 3rd shock if still VF',
        'Consider advanced airway (iGel/LMA)',
        'Post-ROSC: 12-lead ECG immediately',
        'Maintain SpO2 94-98% (avoid hyperoxia)',
        'IV fluid bolus for post-ROSC hypotension',
        'If the patient remains comatose after ROSC: continuously monitor core temperature, prevent fever at ≤37.5°C for 36-72 hours, avoid routine large-volume ice-cold IV fluid and do not actively warm mild 32-36°C hypothermia (RCUK 2025)',
        'Rapid transport to cardiac catheterisation facility',
        'Pre-alert receiving hospital: ROSC post VF arrest, ?STEMI'
      ],
      monitoring: [
        'Continuous cardiac monitoring',
        'SpO2 monitoring (target 94-98%)',
        'Repeat vital signs every 2 minutes post-ROSC',
        'Monitor for re-arrest (deterioration: PEA)',
        'Reassess GCS and pupils',
        'End-tidal CO2 monitoring if available',
        'Blood glucose monitoring'
      ],
      transportConsiderations: [
        'Rapid transport to cardiac catheterisation centre',
        'Pre-alert hospital with ROSC details and ECG findings',
        'Continue monitoring en route',
        'Be prepared for re-arrest during transport',
        'Ensure defibrillator charged and ready',
        'IV fluids running for hypotension'
      ]
    },
    studentChecklist: [
      {
        id: 'y2-009-confirm-arrest',
        category: 'abcde',
        description: 'Confirm cardiac arrest (unresponsive, no normal breathing, no pulse)',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Rapid confirmation of cardiac arrest initiates the chain of survival'
      },
      {
        id: 'y2-009-suction-airway',
        category: 'abcde',
        description: 'Suction airway to clear vomit before ventilation',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Ventilating without clearing vomit causes aspiration and worsens outcome'
      },
      {
        id: 'y2-009-high-quality-cpr',
        category: 'abcde',
        description: 'Initiate high-quality CPR (rate, depth, recoil, minimal interruptions)',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'High-quality CPR is the foundation of cardiac arrest management'
      },
      {
        id: 'y2-009-apply-defib',
        category: 'abcde',
        description: 'Apply defibrillator/AED pads correctly',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Early defibrillation is the definitive treatment for VF'
      },
      {
        id: 'y2-009-defibrillate-vf',
        category: 'intervention',
        description: 'Recognise VF and defibrillate — single biphasic shock (150-200J) followed by 2 min of uninterrupted CPR, then rhythm check. Repeat cycle (NOT stacked shocks — stacked 3-shock sequence is only for witnessed monitored arrest in cath-lab/ICU).',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'VF is a shockable rhythm - defibrillation is the only definitive treatment'
      },
      {
        id: 'y2-009-iv-io-access',
        category: 'intervention',
        description: 'Establish IV access during CPR without stopping compressions (AHA 2025: IV preferred over IO in adult arrest)',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Vascular access enables drug administration during resuscitation'
      },
      {
        id: 'y2-009-adrenaline-timing',
        category: 'intervention',
        description: 'Administer adrenaline 1mg IV after 3rd shock (ERC 2021 / AHA 2020 — shockable rhythm) (every 3-5 min)',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Correct adrenaline timing improves coronary perfusion pressure'
      },
      {
        id: 'y2-009-amiodarone',
        category: 'intervention',
        description: 'Administer amiodarone 300mg IV after 3rd shock if still VF (bonus — ALS skill)',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Amiodarone is indicated for refractory VF after 3rd shock — 2nd-year bonus item, core skill at 3rd-year'
      },
      {
        id: 'y2-009-reversible-causes',
        category: 'clinical-reasoning',
        description: 'Consider reversible causes (4H\'s and 4T\'s)',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Identifying and treating reversible causes improves ROSC rates'
      },
      {
        id: 'y2-009-post-rosc',
        category: 'intervention',
        description: 'Post-ROSC monitoring: 12-lead ECG, SpO2 94-98%, avoid hyperventilation',
        points: 4,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Structured post-ROSC care reduces secondary brain injury and re-arrest risk'
      },
      {
        id: 'y2-009-team-leadership',
        category: 'communication',
        description: 'Demonstrate team leadership and clear communication during resuscitation',
        points: 3,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        rationale: 'Effective team dynamics improve resuscitation performance and outcomes'
      },
      {
        id: 'y2-009-adr-timing',
        category: 'intervention',
        description: 'Adrenaline 1mg IV after 3rd shock (then every 3-5 min)',
        points: 10,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate'],
        critical: true
      },
      {
        id: 'y2-009-amio',
        category: 'intervention',
        description: 'Amiodarone 300mg IV after 3rd shock for refractory VF',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year'],
        complexity: ['intermediate']
      }
    ],
    teachingPoints: [
      'BLS foundation remains critical - high-quality CPR saves lives. AHA 2025: optimize hand position, body position, patient positioning on firm surface',
      'AHA 2025: Breaths WITH compressions (30:2) recommended for both HCPs and lay rescuers who are willing and capable',
      'Rhythm recognition: VF is shockable - defibrillate early and defibrillate often',
      'AHA 2025: IV access preferred over IO in adult cardiac arrest. IO is second-line when IV is not achievable. Never stop compressions to gain access.',
      'Adrenaline 1mg IV after 3rd shock in shockable rhythms (every 3-5 minutes thereafter)',
      'Amiodarone 300mg IV after 3rd shock for refractory VF (150mg can be repeated)',
      'Reversible causes (4H\'s: Hypoxia, Hypovolaemia, Hypo/Hyperkalaemia, Hypothermia; 4T\'s: Tension pneumothorax, Tamponade, Toxins, Thrombosis)',
      'Post-ROSC care: obtain a 12-lead ECG immediately, maintain SpO2 94-98% and avoid hyperventilation. If the adult remains comatose, continuously monitor core temperature and prevent fever at ≤37.5°C for 36-72 hours (RCUK 2025)',
      'AHA 2025: Single unified Chain of Survival for all ages and settings (replaces separate IHCA/OHCA chains)',
      'Airway management in arrest: suction first, OPA, consider iGel/LMA - do not delay CPR for intubation',
      'Rotate compressors every 2 minutes to maintain CPR quality',
      'Minimise interruptions to chest compressions - aim for <10 seconds for rhythm checks',
      'In witnessed VF arrest, early defibrillation is the single most important intervention',
      'Post-ROSC hypotension is common - IV fluid bolus and consider vasopressors'
    ],
    commonPitfalls: [
      'Not suctioning airway before ventilation (aspiration risk)',
      'Delaying defibrillation while performing other tasks',
      'Poor CPR quality due to fatigue - not rotating compressors',
      'Adrenaline given too early (before 2nd shock in shockable rhythm)',
      'Stopping CPR to gain IV access or perform other interventions',
      'Hyperventilating the patient post-ROSC (causes hypocapnia and cerebral vasoconstriction)',
      'Not considering reversible causes (4H\'s and 4T\'s)',
      'Forgetting amiodarone for refractory VF after 3rd shock',
      'Prolonged rhythm check pauses (>10 seconds)',
      'Not performing 12-lead ECG immediately post-ROSC',
      'Over-oxygenating post-ROSC (target 94-98%, not 100%)'
    ],
    references: [
      'ACLS Cardiac Arrest Algorithm - AHA 2025 Guidelines for CPR and ECC',
      'Resuscitation Council UK - Adult Advanced Life Support',
      'Resuscitation Council UK 2025 Post-resuscitation Care Guidelines',
      'Defibrillation and Cardioversion in Pre-Hospital Care'
    ]
  })
];

export default secondYearCases;
