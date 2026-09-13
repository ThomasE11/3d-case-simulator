/**
 * 1st and 2nd Year Focused Cases
 *
 * These cases emphasize:
 * - Scene safety and BSI
 * - Patient introduction and consent
 * - Comprehensive SAMPLE history taking
 * - OPQRS pain assessment
 * - Systematic ABCDE assessment
 * - Complete vital signs
 * - Documentation skills
 *
 * Critical interventions are minimized to focus on assessment fundamentals.
 */

import type { CaseScenario } from '@/types';

const createCase = (caseData: Partial<CaseScenario> & { id: string; title: string }): CaseScenario => ({
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...caseData,
} as CaseScenario);

// ============================================================================
// 1ST YEAR CASES - Focus on Basics: Safety, Communication, History, Basic Assessment
// ============================================================================

export const firstYearCases: CaseScenario[] = [
  // Case 1: Simple fall - focus on scene safety, introduction, basic assessment
  createCase({
    id: 'y1-001',
    title: 'Elderly Female - Fall at Home',
    category: 'general',
    subcategory: 'fall',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', '2nd-year', 'diploma'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: '78-year-old female fallen, unable to get up',
      timeOfDay: 'morning',
      location: 'Apartment in Al Ain',
      callerInfo: 'Daughter (distressed)',
      dispatchCode: 'Alpha'
    },
    patientInfo: {
      age: 78,
      gender: 'female',
      weight: 60,
      language: 'Arabic',
      culturalConsiderations: ['Female patient may prefer female provider', 'Family presence important']
    },
    sceneInfo: {
      description: 'Ground floor apartment, patient on living room floor',
      hazards: ['Cluttered pathway', 'Rug beside patient', 'Limited space'],
      bystanders: 'Daughter present and anxious',
      environment: 'Warm apartment, air conditioning running',
      environmentVariant: 'home',
      sceneImagePath: '/scene-assets/home-fall-female-livingroom-alain.png',
      sceneImageCaption: 'Scene — Home, ground floor apartment'
    },
    initialPresentation: {
      generalImpression: 'Elderly female sitting on floor, alert and oriented',
      position: 'Sitting on floor, leaning against sofa',
      appearance: 'Calm, no visible distress',
      consciousness: 'Alert, responding appropriately'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking clearly', 'No stridor'],
        interventions: ['No intervention needed']
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Breathing comfortably', 'No increased work of breathing', 'Good air entry bilaterally'],
        interventions: ['No intervention needed']
      },
      circulation: {
        pulseRate: 82,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 138, diastolic: 82 },
        capillaryRefill: 2,
        skin: 'Warm and dry, pink',
        findings: ['Good peripheral perfusion', 'No signs of shock'],
        interventions: ['No intervention needed']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive to light',
        findings: ['Fully oriented', 'No focal neurological deficits'],
        interventions: ['No intervention needed']
      },
      exposure: {
        temperature: 36.5,
        findings: ['No obvious injuries', 'Possible bruise on right hip'],
        interventions: ['Check for injuries while maintaining dignity']
      }
    },
    secondarySurvey: {
      head: ['No trauma', 'Pupils equal and reactive'],
      neck: ['No pain on palpation', 'Full range of motion'],
      chest: ['Clear bilaterally', 'No tenderness'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable, no tenderness'],
      extremities: ['Right hip pain', 'No obvious deformity', 'Distal pulses present bilateral', 'No peripheral oedema'],
      posterior: ['Patient reports back pain'],
      neurological: ['Sensation intact', 'Movement possible but painful at right hip']
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '5mg', frequency: 'Daily', indication: 'Blood pressure' },
        { name: 'Metformin', dose: '500mg', frequency: 'Twice daily', indication: 'Diabetes' },
        { name: 'Alendronate', dose: '70mg', frequency: 'Weekly', indication: 'Osteoporosis' }
      ],
      allergies: ['Penicillin - rash'],
      medicalConditions: ['Hypertension', 'Type 2 Diabetes', 'Osteoporosis', 'Glaucoma'],
      surgicalHistory: ['Cataract surgery (both eyes)', 'Hysterectomy'],
      lastMeal: 'Breakfast 2 hours ago - tea and bread',
      eventsLeading: 'Patient got up to go to bathroom, tripped on rug, fell onto carpet. Unable to get up due to hip pain. Daughter found her and called ambulance.',
      socialHistory: {
        smoking: 'Never smoked',
        alcohol: 'None',
        occupation: 'Retired teacher',
        livingSituation: 'Lives alone, daughter visits daily'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '138/82', pulse: 82, respiration: 18, spo2: 98, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'Patient calm and cooperative',
        'No immediate life threats',
        'Possible hip injury from fall',
        'Good support from family'
      ],
      redFlags: [
        'Mechanism of fall (tripped vs collapsed)',
        'Possibility of prolonged time on floor',
        'Medication effects on fall risk'
      ],
      differentialDiagnoses: [
        'Hip fracture',
        'Soft tissue injury/bruising',
        'Pelvic fracture'
      ],
      mostLikelyDiagnosis: 'Possible hip fracture secondary to mechanical fall',
      supportingEvidence: [
        'Mechanical fall (tripped)',
        'Hip pain unable to bear weight',
        'Age and osteoporosis risk factors'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety - check for hazards',
        'Introduce self and role to patient',
        'Obtain consent for assessment',
        'Full set of vital signs',
        'SAMPLE history',
        'Check for time down on floor'
      ],
      definitive: [
        'Gentle examination focusing on painful areas',
        'Consider orthopedic padding vs full immobilization',
        'Transport to hospital for X-rays',
        'Pain management if needed and within protocols'
      ],
      monitoring: [
        'Repeat vital signs en route',
        'Monitor for changes in pain level',
        'Reassess distal circulation'
      ]
    },
    studentChecklist: [
      // 1st Year Emphasis - Safety and Communication (30%)
      {
        id: 'y1-scene-safety',
        category: 'safety',
        description: 'Assess scene safety before approaching patient',
        points: 5,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        critical: true,
        rationale: 'Scene safety is always the first priority'
      },
      {
        id: 'y1-bsi',
        category: 'safety',
        description: 'Apply appropriate PPE (gloves at minimum)',
        points: 5,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        critical: true,
        rationale: 'BSI protects both provider and patient'
      },
      {
        id: 'y1-introduction',
        category: 'communication',
        description: 'Introduce self, name, and role to patient',
        points: 3,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Professional introduction builds trust'
      },
      {
        id: 'y1-consent',
        category: 'communication',
        description: 'Ask permission before touching/examining patient',
        points: 3,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Respect patient autonomy and dignity'
      },
      {
        id: 'y1-level',
        category: 'communication',
        description: 'Get to patient\'s level (kneel/sit) when speaking',
        points: 2,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Eye level communication shows respect and improves connection'
      },

      // 1st Year Emphasis - History Taking (30%)
      {
        id: 'y1-sample-signs',
        category: 'history',
        description: 'SAMPLE: Signs/Symptoms - What prompted the call?',
        points: 3,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Understanding chief complaint guides assessment'
      },
      {
        id: 'y1-sample-allergies',
        category: 'history',
        description: 'SAMPLE: Allergies - Ask about allergies to meds/food/environment',
        points: 3,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Allergy information is critical for safety'
      },
      {
        id: 'y1-sample-medications',
        category: 'history',
        description: 'SAMPLE: Medications - Current medications and compliance',
        points: 3,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Medications help understand medical history and interactions'
      },
      {
        id: 'y1-sample-past',
        category: 'history',
        description: 'SAMPLE: Past medical history - Relevant conditions',
        points: 3,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Past history provides context for current presentation'
      },
      {
        id: 'y1-sample-lastmeal',
        category: 'history',
        description: 'SAMPLE: Last oral intake - When did patient last eat/drink?',
        points: 2,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Important if procedures or anesthesia might be needed'
      },
      {
        id: 'y1-sample-events',
        category: 'history',
        description: 'SAMPLE: Events leading - Detailed history of what happened',
        points: 3,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Understanding mechanism provides clues to injuries'
      },
      {
        id: 'y1-opqrs',
        category: 'history',
        description: 'OPQRS assessment for pain - Onset, Provokes, Quality, Region, Severity',
        points: 5,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Thorough pain assessment is essential for understanding complaints'
      },

      // 1st Year Emphasis - Systematic Assessment (25%)
      {
        id: 'y1-avpu',
        category: 'abcde',
        description: 'Assess AVPU (Alert, Voice, Pain, Unresponsive)',
        points: 3,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'AVPU is fundamental level of consciousness assessment'
      },
      {
        id: 'y1-breathing-assess',
        category: 'abcde',
        description: 'Breathing assessment - rate, effort, sounds',
        points: 3,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Basic breathing assessment identifies problems early'
      },
      {
        id: 'y1-circulation-check',
        category: 'abcde',
        description: 'Circulation check - pulse rate, skin color, temperature',
        points: 3,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Basic circulation assessment identifies shock'
      },
      {
        id: 'y1-vitals-bp',
        category: 'abcde',
        description: 'Obtain blood pressure',
        points: 4,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        critical: true,
        rationale: 'Blood pressure is a vital sign that must be measured'
      },
      {
        id: 'y1-vitals-pulse',
        category: 'abcde',
        description: 'Obtain pulse rate and quality',
        points: 2,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Pulse provides information about circulation'
      },
      {
        id: 'y1-vitals-rr',
        category: 'abcde',
        description: 'Obtain respiratory rate',
        points: 2,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Respiratory rate is an important vital sign'
      },
      {
        id: 'y1-vitals-spo2',
        category: 'abcde',
        description: 'Obtain SpO2 reading',
        points: 2,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Oxygen saturation assesses oxygenation'
      },
      {
        id: 'y1-head-to-toe',
        category: 'secondary',
        description: 'Perform basic head-to-toe examination',
        points: 4,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Systematic exam ensures nothing is missed'
      },

      // 1st Year Emphasis - Documentation (15%)
      {
        id: 'y1-document-vitals',
        category: 'documentation',
        description: 'Document all vital signs obtained',
        points: 2,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Documentation creates permanent record of assessment'
      },
      {
        id: 'y1-document-history',
        category: 'documentation',
        description: 'Document SAMPLE history findings',
        points: 2,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'History documentation is essential for continuity of care'
      },
      {
        id: 'y1-document-times',
        category: 'documentation',
        description: 'Document assessment time',
        points: 1,
        yearLevel: ['1st-year', '2nd-year', 'diploma'],
        complexity: ['basic'],
        rationale: 'Time documentation is important for tracking'
      }
    ],
    teachingPoints: [
      'Always start with scene safety and BSI - these are non-negotiable',
      'Introduction and consent show respect and build trust',
      'SAMPLE is a framework - don\'t just recite letters, actually get the information',
      'OPQRS should be used for ANY pain or discomfort complaint',
      'Get to the patient\'s level - this improves communication and examination',
      'Don\'t rush - thorough assessment is more important than speed in 1st year',
      'Document as you go - don\'t rely on memory'
    ],
    commonPitfalls: [
      'Rushing introduction or skipping consent',
      'Missing SAMPLE components - especially medications and allergies',
      'Forgetting to ask OPQRS for pain',
      'Not documenting vital signs immediately',
      'Standing over patient instead of getting to their level',
      'Being task-focused instead of patient-focused'
    ],
    references: [
      'Patient Assessment Chapter - Fundamentals of Paramedic Practice',
      'Communication and Documentation Standards'
    ]
  }),

  // Case 2: Abdominal pain - focus on history taking, SAMPLE, OPQRS
  createCase({
    id: 'y1-002',
    title: 'Young Adult - Abdominal Pain',
    category: 'general',
    subcategory: 'abdominal-pain',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', '2nd-year', 'diploma'],
    estimatedDuration: 18,
    dispatchInfo: {
      callReason: '25-year-old male with abdominal pain',
      timeOfDay: 'afternoon',
      location: 'Office building in Dubai',
      callerInfo: 'Receptionist',
      dispatchCode: 'Alpha'
    },
    patientInfo: {
      age: 25,
      gender: 'male',
      weight: 75,
      language: 'English',
      culturalConsiderations: ['Professional setting, maintain privacy']
    },
    sceneInfo: {
      description: 'Private office, patient sitting in chair holding abdomen',
      hazards: ['None identified'],
      bystanders: 'Receptionist nearby',
      environment: 'Air conditioned office',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/office-abdominal-male-uae.png',
      sceneImageCaption: 'Scene — Air conditioned office',
    },
    initialPresentation: {
      generalImpression: 'Young male, appears uncomfortable but not distressed',
      position: 'Sitting forward, holding right lower quadrant',
      appearance: 'Pale, guarding abdomen',
      consciousness: 'Alert, responding appropriately'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking full sentences'],
        interventions: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Slightly shallow due to pain',
        spo2: 99,
        findings: ['Mild tachypnea possibly due to pain', 'Clear lung sounds'],
        interventions: []
      },
      circulation: {
        pulseRate: 88,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 125, diastolic: 78 },
        capillaryRefill: 2,
        skin: 'Warm, slightly pale',
        findings: ['Mild tachycardia likely pain related'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        findings: ['Alert and oriented x4'],
        interventions: []
      },
      exposure: {
        temperature: 37.8,
        findings: ['Guarding right lower quadrant', 'No obvious external signs of trauma'],
        interventions: ['Expose abdomen for examination while maintaining modesty']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Supple, no meningismus'],
      chest: ['Clear bilaterally'],
      abdomen: ['Guarding RLQ', 'Rebound tenderness present', "McBurney's point tender", 'Bowel sounds diminished'],
      pelvis: ['Normal — genitourinary exam with chaperone: testes descended bilaterally, no swelling, no tenderness (testicular torsion excluded — mandatory differential in males with abdominal pain; 6h window for salvage)'],
      extremities: ['No peripheral oedema', 'Peripheral pulses present'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [],
      allergies: ['No known allergies'],
      medicalConditions: ['None reported'],
      surgicalHistory: ['Appendectomy age 12 (per patient)'],
      lastMeal: 'Lunch 4 hours ago',
      eventsLeading: 'Pain started around 10am this morning, initially around umbilicus, now localized to RLQ. Nausea but no vomiting. One episode of diarrhea.',
      socialHistory: {
        smoking: 'Social smoker',
        alcohol: 'Occasional',
        occupation: 'Accountant',
        livingSituation: 'Lives alone in apartment'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '125/78', pulse: 88, respiration: 20, spo2: 99, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'RLQ abdominal pain with rebound tenderness',
        'History of pain migration (periumbilical to RLQ)',
        'Previous appendectomy reported (may be unreliable)',
        'Nausea and one episode of diarrhea'
      ],
      redFlags: [
        'Rebound tenderness suggests peritoneal irritation',
        'Previous appendectomy vs current presentation',
        'Pain progression over several hours'
      ],
      differentialDiagnoses: [
        'Appendicitis (if previous surgery incorrect)',
        'Mesenteric adenitis',
        'Gastroenteritis',
        'Ovarian pathology if gender misidentified',
        'Renal colic'
      ],
      mostLikelyDiagnosis: 'Appendicitis (or other surgical abdomen)',
      supportingEvidence: [
        'Migratory pain pattern',
        'Rebound tenderness',
        'Anorexia, nausea',
        'Guarding behavior'
      ]
    },
    managementPathway: {
      immediate: [
        'Introduction and consent',
        'Thorough SAMPLE and OPQRS history',
        'Full set of vital signs',
        'Avoid oral intake (NPO)',
        'Position of comfort',
        'Monitor for changes'
      ],
      definitive: [
        'IV access if protocols allow',
        'Transport to emergency department',
        'Pain management if within protocols'
      ],
      monitoring: [
        'Vital signs every 5-10 minutes',
        'Pain assessment',
        'Monitor for perfusion changes'
      ]
    },
    studentChecklist: [
      // Safety and Communication
      { id: 'y1-002-scene', category: 'safety', description: 'Assess scene safety', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-002-intro', category: 'communication', description: 'Introduce self and obtain consent', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-002-privacy', category: 'communication', description: 'Maintain patient privacy during exam', points: 2, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },

      // History - KEY EMPHASIS for abdominal pain case
      { id: 'y1-002-sample-full', category: 'history', description: 'Complete SAMPLE history', points: 5, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-002-opqrs-onset', category: 'history', description: 'OPQRS: Onset - When did pain start?', points: 2, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-002-opqrs-provokes', category: 'history', description: 'OPQRS: Provokes - What makes it better/worse?', points: 2, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-002-opqrs-quality', category: 'history', description: 'OPQRS: Quality - Describe the pain', points: 2, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-002-opqrs-region', category: 'history', description: 'OPQRS: Region/Radiation - Where does pain go?', points: 2, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-002-opqrs-severity', category: 'history', description: 'OPQRS: Severity - Pain scale 1-10', points: 2, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-002-last-meal', category: 'history', description: 'Determine last oral intake', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-002-surgical', category: 'history', description: 'Surgical history - especially abdominal', points: 2, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },

      // Assessment
      { id: 'y1-002-vitals', category: 'abcde', description: 'Full set of vital signs', points: 5, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-002-abdomen-assess', category: 'secondary', description: 'Abdominal assessment - inspection, auscultation', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-002-npo', category: 'intervention', description: 'Keep patient NPO (nothing by mouth)', points: 2, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },

      // Documentation
      { id: 'y1-002-document', category: 'documentation', description: 'Document history and findings', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'Abdominal pain requires thorough history - physical exam has limitations',
      'OPQRS is essential for any pain complaint',
      'SAMPLE medications must include prescription, OTC, and herbal',
      'Always ask about last meal for abdominal pain cases',
      'Surgical history is crucial - patient reports can be unreliable',
      'Maintain patient modesty during abdominal examination',
      'Nothing by mouth (NPO) for potential surgical cases'
    ],
    commonPitfalls: [
      'Not completing OPQRS for pain',
      'Forgetting to ask about surgical history',
      'Missing last oral intake',
      'Not maintaining patient privacy',
      'Making assumptions without thorough history'
    ],
    references: [
      'Abdominal Emergencies Chapter',
      'Patient Assessment - History Taking Section'
    ]
  }),

  // Case 3: Diabetic patient - focus on SAMPLE, blood glucose, communication
  createCase({
    id: 'y1-003',
    title: 'Middle-Aged Male - Feeling Unwell (Diabetic)',
    category: 'metabolic',
    subcategory: 'hypoglycemia',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', '2nd-year', 'diploma'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: '45-year-old diabetic feeling "not right"',
      timeOfDay: 'evening',
      location: 'Residential home in Dubai',
      callerInfo: 'Wife',
      dispatchCode: 'Alpha'
    },
    patientInfo: {
      age: 45,
      gender: 'male',
      weight: 85,
      language: 'Arabic',
      culturalConsiderations: ['Wife very involved in care', 'Family presence desired']
    },
    sceneInfo: {
      description: 'Family home, patient in bedroom',
      hazards: ['None'],
      bystanders: 'Wife present and helpful',
      environment: 'Comfortable home environment'
    },
    initialPresentation: {
      generalImpression: 'Adult male, alert but appears tired and slightly confused',
      position: 'Lying in bed',
      appearance: 'Slightly diaphoretic, pale',
      consciousness: 'Alert but responds slowly'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent'],
        interventions: []
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Breathing normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 92,
        pulseQuality: 'Regular, slightly weak',
        bp: { systolic: 118, diastolic: 72 },
        capillaryRefill: 3,
        skin: 'Cool, diaphoretic',
        findings: ['Mild tachycardia', 'Delayed capillary refill'],
        interventions: []
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal 3mm, reactive',
        bloodGlucose: 3.2,
        findings: ['Slightly confused', 'Blood glucose low'],
        interventions: ['Consider oral glucose if patient able to swallow safely']
      },
      exposure: {
        temperature: 36.5,
        findings: ['Diaphoresis present', 'No signs of trauma'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: ['Cool to touch', 'Peripheral pulses present but weak', 'No peripheral oedema'],
      posterior: ['Normal'],
      neurological: ['Mild confusion present', 'No focal deficits']
    },
    history: {
      medications: [
        { name: 'Metformin', dose: '1000mg', frequency: 'Twice daily', indication: 'Diabetes' },
        { name: 'Sitagliptin', dose: '100mg', frequency: 'Daily', indication: 'Diabetes' }
      ],
      allergies: ['No known allergies'],
      medicalConditions: ['Type 2 Diabetes (5 years)', 'Hypertension'],
      surgicalHistory: ['None'],
      lastMeal: 'Dinner 3 hours ago - ate normally',
      eventsLeading: 'Patient missed lunch today. Wife found him confused around 7pm. He has been "feeling off" since mid-afternoon.',
      socialHistory: {
        smoking: 'Ex-smoker',
        alcohol: 'Social',
        occupation: 'Office worker',
        livingSituation: 'Lives with wife and children'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '118/72', pulse: 92, respiration: 18, spo2: 98, gcs: 14, bloodGlucose: 3.2 },
      afterIntervention: { bp: '112/68', pulse: 82, respiration: 16, spo2: 98, gcs: 15, bloodGlucose: 5.8 }
    },
    expectedFindings: {
      keyObservations: [
        'Diabetic patient with altered mental status',
        'Blood glucose 3.2 mmol/L (hypoglycemic)',
        'History of missed meal',
        'Diaphoresis and confusion'
      ],
      redFlags: [
        'Hypoglycemia in diabetic patient',
        'Altered mental status',
        'Potential for rapid deterioration'
      ],
      differentialDiagnoses: [
        'Hypoglycemia',
        'Hyperglycemia (DKA early)',
        'Stroke',
        'Sepsis'
      ],
      mostLikelyDiagnosis: 'Hypoglycemia secondary to missed meals and diabetes medications',
      supportingEvidence: [
        'Low blood glucose reading',
        'Missed meal',
        'Diaphoresis, confusion',
        'Diabetic on medications'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety, introduction, consent',
        'ABC assessment',
        'Check blood glucose',
        'SAMPLE history with emphasis on diabetes management',
        'Consider oral glucose if able to swallow'
      ],
      definitive: [
        'Reassess blood glucose',
        'Transport if unable to raise glucose or if symptoms persist',
        'Consider IV glucose if protocols allow and patient condition warrants'
      ],
      monitoring: [
        'Repeat blood glucose',
        'Monitor mental status',
        'Monitor vital signs'
      ]
    },
    studentChecklist: [
      // Safety and Communication
      { id: 'y1-003-scene', category: 'safety', description: 'Scene safety assessment', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-003-bsi', category: 'safety', description: 'BSI - gloves at minimum', points: 2, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-003-intro', category: 'communication', description: 'Introduction and consent', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-003-family', category: 'communication', description: 'Include family in information gathering', points: 2, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },

      // History - DIABETES FOCUS
      { id: 'y1-003-sample', category: 'history', description: 'Complete SAMPLE history', points: 5, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-003-diabetes-meds', category: 'history', description: 'Specific diabetes medications and timing', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-003-meal-times', category: 'history', description: 'Last meal and eating pattern', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-003-symptoms', category: 'history', description: 'Current symptoms and onset', points: 2, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },

      // Assessment - GLUCOSE FOCUS
      { id: 'y1-003-avpu', category: 'abcde', description: 'AVPU assessment', points: 2, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-003-glucose', category: 'abcde', description: 'Check blood glucose', points: 5, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-003-vitals', category: 'abcde', description: 'Full set of vital signs', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-003-skin', category: 'abcde', description: 'Skin assessment (diaphoresis)', points: 2, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },

      // Documentation
      { id: 'y1-003-document-glucose', category: 'documentation', description: 'Document glucose reading and time', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true }
    ],
    teachingPoints: [
      'Always check blood glucose in altered mental status',
      'SAMPLE for diabetic patients MUST include medication timing and meals',
      'Hypoglycemia can cause rapid deterioration - act quickly',
      'Skin assessment (diaphoresis) provides important clues',
      'Family members are valuable information sources',
      'Never assume altered mental status is "just diabetes"'
    ],
    commonPitfalls: [
      'Not checking blood glucose in confused patient',
      'Incomplete medication history',
      'Not asking about meal timing',
      'Focusing only on blood sugar and missing other causes',
      'Forgetting to document glucose reading with time'
    ],
    references: [
      'Diabetic Emergencies Chapter',
      'Blood Glucose Monitoring Guidelines'
    ]
  }),

  // Case 4: Basic Burns - Kitchen scald burn
  createCase({
    id: 'y1-004',
    title: 'Young Female - Kitchen Scald Burn',
    category: 'burns',
    subcategory: 'scald',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', 'diploma'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: '25-year-old female, boiling water spill on arm',
      timeOfDay: 'evening',
      location: 'Residential kitchen',
      callerInfo: 'Patient (distressed)',
      dispatchCode: 'Alpha'
    },
    patientInfo: {
      age: 25,
      gender: 'female',
      weight: 62,
      language: 'English',
      culturalConsiderations: ['Female patient - offer female provider if available']
    },
    sceneInfo: {
      description: 'Small kitchen, boiling pot on floor, water spilled',
      hazards: ['Hot water on floor', 'Hot pot nearby', 'Slippery surface'],
      bystanders: 'Flatmate present',
      environment: 'Warm kitchen, stove still on'
    },
    initialPresentation: {
      generalImpression: 'Young female standing, holding left forearm, crying',
      position: 'Standing near kitchen sink',
      appearance: 'Distressed, tearful, holding burned arm away from body',
      consciousness: 'Alert, oriented, very anxious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking clearly through tears'],
        interventions: []
      },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Slightly fast due to pain and anxiety',
        spo2: 99,
        findings: ['Mild tachypnea from pain', 'Clear lung sounds bilateral'],
        interventions: []
      },
      circulation: {
        pulseRate: 100,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 132, diastolic: 80 },
        capillaryRefill: 2,
        skin: 'Warm, flushed (unburned areas)',
        findings: ['Tachycardia likely pain-related', 'Good peripheral perfusion'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        findings: ['Alert and oriented', 'Pain score 8/10'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: [
          'Left forearm: partial thickness burn, erythema with blistering',
          'Burn area approximately 5% TBSA (anterior forearm and dorsum of hand)',
          'Blisters intact, surrounding skin red and painful to light touch',
          'No circumferential burn',
          'No burns to face, airway, or chest'
        ],
        interventions: ['Cool running water for 20 minutes', 'Remove rings/watch from affected hand']
      }
    },
    secondarySurvey: {
      head: ['Normal, no burns'],
      neck: ['Normal'],
      chest: ['Clear bilaterally'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: ['Left forearm partial thickness burn ~5% TBSA', 'Blisters intact', 'Localised swelling at burn site', 'Distal pulses present', 'Sensation intact distally', 'Can wiggle fingers'],
      posterior: ['Normal'],
      neurological: ['Normal, intact sensation distal to burn']
    },
    history: {
      medications: [
        { name: 'Oral contraceptive pill', dose: 'Standard', frequency: 'Daily' }
      ],
      allergies: ['No known allergies'],
      medicalConditions: ['None'],
      surgicalHistory: ['None'],
      lastMeal: 'Was preparing dinner at time of injury',
      eventsLeading: 'Patient was cooking pasta, reached across stove to get spice, knocked boiling pot off stove onto left forearm. Immediately ran to sink and started running cold water. Flatmate called ambulance.',
      socialHistory: {
        smoking: 'Non-smoker',
        alcohol: 'Social',
        occupation: 'Marketing assistant',
        livingSituation: 'Shares flat with friend'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '132/80', pulse: 100, respiration: 22, spo2: 99, gcs: 15, painScore: 8 },
      afterIntervention: { bp: '122/75', pulse: 70, respiration: 15, spo2: 99, gcs: 15, painScore: 2 },
      deterioration: { bp: '140/88', pulse: 112, respiration: 24, spo2: 99, gcs: 15, painScore: 9 }
    },
    expectedFindings: {
      keyObservations: [
        'Partial thickness scald burn to left forearm',
        'Approximately 5% TBSA',
        'Blisters intact, no circumferential burn',
        'Distal neurovascular status intact',
        'Patient already initiated cooling'
      ],
      redFlags: [
        'Any signs of inhalation injury (not expected here but always check)',
        'Circumferential burns compromising circulation',
        'Full thickness areas within the burn'
      ],
      differentialDiagnoses: [
        'Superficial partial thickness burn',
        'Deep partial thickness burn',
        'Full thickness burn (unlikely with scald mechanism)'
      ],
      mostLikelyDiagnosis: 'Superficial partial thickness scald burn, ~5% TBSA, left forearm',
      supportingEvidence: [
        'Blistering with erythema',
        'Pain present (partial thickness)',
        'Consistent mechanism (boiling water)',
        'Limited body surface area involvement'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety - ensure stove is off, hot water hazard managed',
        'Introduction and consent',
        'Continue cool running water for 20 minutes total from time of burn',
        'Remove jewellery from affected limb',
        'Assess burn depth and TBSA using Rule of Nines'
      ],
      definitive: [
        'Cover with cling film (lengthways, not circumferential)',
        'Pain management - paracetamol 1g oral',
        'Keep patient warm (hypothermia risk from cooling)',
        'Transport to ED for wound assessment and dressing'
      ],
      monitoring: [
        'Pain score reassessment after analgesia',
        'Distal circulation checks (cap refill, pulses, sensation)',
        'Monitor for signs of shock (unlikely with 5% TBSA)',
        'Vital signs en route'
      ]
    },
    studentChecklist: [
      { id: 'y1-004-scene', category: 'safety', description: 'Scene safety - manage hot water and stove hazards', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Burns scenes often have ongoing hazards' },
      { id: 'y1-004-bsi', category: 'safety', description: 'BSI - gloves (sterile if available for burn)', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-004-intro', category: 'communication', description: 'Introduce self, calm and reassure patient', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-004-cool', category: 'intervention', description: 'Cool running water for 20 minutes from time of burn', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Cooling reduces burn depth progression' },
      { id: 'y1-004-jewellery', category: 'intervention', description: 'Remove jewellery and watches from affected limb', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], rationale: 'Swelling may make removal difficult later' },
      { id: 'y1-004-tbsa', category: 'abcde', description: 'Estimate burn TBSA using Rule of Nines', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-004-depth', category: 'abcde', description: 'Assess burn depth (superficial/partial/full)', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-004-distal', category: 'abcde', description: 'Check distal neurovascular status', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-004-vitals', category: 'abcde', description: 'Full set of vital signs including pain score', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-004-cling', category: 'intervention', description: 'Apply cling film lengthways (not circumferentially)', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-004-analgesia', category: 'intervention', description: 'Pain management - paracetamol', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-004-warmth', category: 'intervention', description: 'Maintain patient warmth during and after cooling', points: 2, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], rationale: 'Hypothermia risk from prolonged cooling' },
      { id: 'y1-004-sample', category: 'history', description: 'Complete SAMPLE history', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-004-document', category: 'documentation', description: 'Document burn size, depth, location, and time of injury', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'Cool running water for 20 minutes is the single most important first aid for burns',
      'Never use ice, butter, toothpaste, or other home remedies on burns',
      'Cling film should be applied lengthways, never wrapped circumferentially',
      'Rule of Nines: each arm is 9% TBSA - forearm alone is roughly 4-5%',
      'Partial thickness burns are painful because nerve endings are intact',
      'Always remove jewellery early before oedema develops',
      'Keep the patient warm - hypothermia is a real risk with cooling'
    ],
    commonPitfalls: [
      'Not cooling for the full 20 minutes',
      'Using ice or ice water instead of cool running water',
      'Wrapping cling film circumferentially which can act as a tourniquet',
      'Bursting blisters - leave intact to reduce infection risk',
      'Forgetting to check distal neurovascular status',
      'Not managing the scene hazards (hot water, stove)'
    ],
    references: [
      'Burns Management - JRCALC Guidelines',
      'Rule of Nines and TBSA Estimation',
      'Pre-hospital Burns First Aid - EMT Fundamentals'
    ]
  }),

  // Case 5: Basic Neurological - Simple febrile seizure
  createCase({
    id: 'y1-005',
    title: 'Toddler - Simple Febrile Seizure',
    category: 'pediatric',
    subcategory: 'febrile-seizure',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', 'diploma'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: '3-year-old child had a seizure, now stopped',
      timeOfDay: 'afternoon',
      location: 'Family home',
      callerInfo: 'Mother (very distressed, crying)',
      dispatchCode: 'Bravo'
    },
    patientInfo: {
      age: 3,
      gender: 'female',
      weight: 14,
      language: 'English',
      culturalConsiderations: ['Parents extremely anxious', 'First seizure - very frightening for family']
    },
    sceneInfo: {
      description: 'Living room, child lying on sofa with blanket, mother holding her',
      hazards: ['None identified'],
      bystanders: 'Mother and older sibling (age 6)',
      environment: 'Warm home, heating on high'
    },
    initialPresentation: {
      generalImpression: 'Toddler post-ictal, drowsy but rousable, flushed and hot to touch',
      position: 'Lying on sofa in recovery position',
      appearance: 'Flushed, drowsy, mildly limp',
      consciousness: 'Drowsy but rousable to voice'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'No secretions', 'No vomit'],
        interventions: ['Maintain recovery position', 'Suction available if needed']
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Normal for age',
        spo2: 97,
        findings: ['Respiratory rate slightly elevated (normal for age 20-30)', 'Clear lung sounds', 'No increased work of breathing'],
        interventions: []
      },
      circulation: {
        pulseRate: 130,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 95, diastolic: 58 },
        capillaryRefill: 2,
        skin: 'Hot, flushed, dry',
        findings: ['Tachycardia appropriate for age and fever', 'Good perfusion'],
        interventions: []
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 3, verbal: 4, motor: 5, total: 12 },
        pupils: 'Equal 3mm, reactive to light',
        findings: ['Post-ictal drowsiness', 'Responds to voice', 'No focal neurological deficit', 'Moving all limbs equally'],
        interventions: ['Monitor for further seizure activity']
      },
      exposure: {
        temperature: 39.5,
        findings: ['Temperature 39.5°C', 'No rash', 'No signs of meningism', 'No bruising or signs of non-accidental injury'],
        interventions: ['Remove excess clothing and blankets', 'Do not sponge with cold water']
      }
    },
    secondarySurvey: {
      head: ['No trauma', 'Anterior fontanelle closed (age appropriate)', 'No bulging'],
      neck: ['Supple, no stiffness', 'No meningism'],
      chest: ['Clear bilaterally', 'No increased work of breathing'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: ['Normal tone returning', 'Moving all four limbs', 'No rash', 'No peripheral oedema'],
      posterior: ['Normal'],
      neurological: ['Post-ictal state', 'GCS improving', 'No focal deficits', 'Pupils equal and reactive']
    },
    history: {
      medications: [
        { name: 'Paracetamol', dose: '5ml (120mg)', frequency: 'Given once today, 4 hours ago', indication: 'Fever' }
      ],
      allergies: ['No known allergies'],
      medicalConditions: ['Nil significant', 'Immunisations up to date'],
      surgicalHistory: ['None'],
      lastMeal: 'Small lunch 3 hours ago, drinking less today',
      eventsLeading: 'Child has had a cold for 2 days with runny nose and cough. Temperature noticed this morning. Paracetamol given at lunchtime. Mother found child shaking on the floor about 15 minutes ago - arms and legs stiff then jerking, eyes rolled back. Lasted approximately 2-3 minutes then stopped on its own. First seizure ever.',
      socialHistory: {
        livingSituation: 'Lives with both parents and older sibling',
        supportSystem: 'Grandparents nearby'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '95/58', pulse: 130, respiration: 28, spo2: 97, gcs: 12, temperature: 39.5 },
      afterIntervention: { bp: '88/54', pulse: 115, respiration: 20, spo2: 99, gcs: 12, temperature: 38.8 },
      deterioration: { bp: '90/55', pulse: 140, respiration: 32, spo2: 94, gcs: 8, temperature: 40.2 }
    },
    expectedFindings: {
      keyObservations: [
        'Post-ictal child after generalised tonic-clonic seizure',
        'Febrile (39.5°C) with upper respiratory tract infection',
        'Seizure self-terminated after 2-3 minutes',
        'First seizure - no epilepsy history',
        'No signs of meningism or rash'
      ],
      redFlags: [
        'Prolonged seizure (>5 minutes) would require medication',
        'Non-blanching rash suggesting meningococcal disease',
        'Neck stiffness or bulging fontanelle',
        'Focal seizure suggesting structural cause',
        'Recurrent seizures within same illness'
      ],
      differentialDiagnoses: [
        'Simple febrile seizure',
        'Meningitis/encephalitis',
        'Epilepsy (first presentation)',
        'Electrolyte imbalance'
      ],
      mostLikelyDiagnosis: 'Simple febrile seizure secondary to viral upper respiratory infection',
      supportingEvidence: [
        'Age 6 months to 5 years (typical range)',
        'Generalised seizure (not focal)',
        'Brief duration (<5 minutes)',
        'Self-terminating',
        'Clear source of fever (URTI)',
        'No prior seizure history'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety, introduction to parents',
        'Maintain recovery position',
        'Assess airway, breathing, circulation',
        'Check temperature',
        'Time any further seizure activity',
        'Reassure parents - febrile seizures are common and usually harmless'
      ],
      definitive: [
        'Temperature management - remove excess clothing',
        'Paracetamol if due (weight-based dosing)',
        'Transport to ED for assessment (first seizure)',
        'Do NOT sponge with cold water or use fans directly'
      ],
      monitoring: [
        'Ongoing seizure watch',
        'GCS and consciousness level - should improve over 15-30 minutes',
        'Temperature monitoring',
        'Vital signs every 5 minutes'
      ]
    },
    studentChecklist: [
      { id: 'y1-005-scene', category: 'safety', description: 'Scene safety assessment', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-005-bsi', category: 'safety', description: 'BSI - gloves', points: 2, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-005-intro', category: 'communication', description: 'Introduce self to parents, calm and reassure', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], rationale: 'Parents are extremely anxious during paediatric seizures' },
      { id: 'y1-005-recovery', category: 'intervention', description: 'Ensure recovery position maintained', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-005-airway', category: 'abcde', description: 'Airway assessment - patent, no obstruction', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-005-temp', category: 'abcde', description: 'Check temperature', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-005-vitals', category: 'abcde', description: 'Full vital signs (age-appropriate normals)', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-005-seizure-hx', category: 'history', description: 'Seizure history: duration, type, first ever?', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-005-sample', category: 'history', description: 'SAMPLE history from parents', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-005-meningism', category: 'abcde', description: 'Check for rash (non-blanching) and neck stiffness', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], rationale: 'Must rule out meningitis in febrile child with seizure' },
      { id: 'y1-005-clothing', category: 'intervention', description: 'Remove excess clothing to aid temperature reduction', points: 2, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-005-reassure', category: 'communication', description: 'Explain febrile seizures to parents in simple terms', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-005-document', category: 'documentation', description: 'Document seizure details, duration, and presentation', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'Febrile seizures occur in 2-5% of children aged 6 months to 5 years',
      'Simple febrile seizures are generalised, last <5 minutes, and do not recur within 24 hours',
      'Recovery position and airway management are the key interventions',
      'Do NOT put anything in the mouth during or after a seizure',
      'Parents need significant reassurance - this is terrifying for them',
      'Always check for non-blanching rash to rule out meningococcal disease',
      'Know normal paediatric vital sign ranges for age'
    ],
    commonPitfalls: [
      'Trying to restrain the child during a seizure',
      'Putting objects in the mouth',
      'Sponging with cold water (causes shivering which raises temperature)',
      'Not timing seizure activity',
      'Forgetting to check for meningism signs',
      'Not reassuring parents adequately',
      'Using adult vital sign normals for a 3-year-old'
    ],
    references: [
      'Paediatric Emergencies - Febrile Seizures',
      'APLS Guidelines - Seizure Management',
      'Paediatric Vital Signs by Age'
    ]
  }),

  // Case 6: Basic Obstetric - Normal labour, imminent delivery
  createCase({
    id: 'y1-006',
    title: 'Pregnant Female - Imminent Delivery',
    category: 'obstetric',
    subcategory: 'normal-delivery',
    priority: 'high',
    complexity: 'basic',
    yearLevels: ['1st-year', 'diploma'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: '28-year-old female, 39 weeks pregnant, contractions very close together, feels need to push',
      timeOfDay: 'early-morning',
      location: 'Residential home',
      callerInfo: 'Partner (panicking)',
      dispatchCode: 'Bravo'
    },
    patientInfo: {
      age: 28,
      gender: 'female',
      weight: 78,
      language: 'English',
      culturalConsiderations: ['Partner wishes to be present', 'Birth plan prefers minimal intervention']
    },
    sceneInfo: {
      description: 'Bedroom, patient on bed with towels laid out',
      hazards: ['None - clean home environment'],
      bystanders: 'Partner present and anxious',
      environment: 'Warm bedroom'
    },
    initialPresentation: {
      generalImpression: 'Full-term pregnant female, contracting regularly, appears to be in active labour',
      position: 'Semi-recumbent on bed, knees drawn up',
      appearance: 'Flushed, sweating, bearing down with contractions',
      consciousness: 'Alert, focused on contractions'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Vocalising with contractions'],
        interventions: []
      },
      breathing: {
        rate: 24,
        rhythm: 'Variable with contractions',
        depth: 'Deep breathing between contractions',
        spo2: 98,
        findings: ['Respiratory rate elevated during contractions', 'Normal between contractions'],
        interventions: ['Encourage controlled breathing']
      },
      circulation: {
        pulseRate: 96,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 128, diastolic: 78 },
        capillaryRefill: 2,
        skin: 'Warm, flushed, diaphoretic',
        findings: ['Mild tachycardia normal in active labour', 'Blood pressure normal'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        findings: ['Alert and oriented', 'Appropriately communicative between contractions'],
        interventions: []
      },
      exposure: {
        temperature: 37.0,
        findings: [
          'Contractions every 2 minutes, lasting 60 seconds',
          'Urge to push present',
          'Gravid abdomen consistent with term pregnancy',
          'No vaginal bleeding noted',
          'Perineum: crowning visible on inspection'
        ],
        interventions: ['Prepare delivery equipment', 'Warm towels ready for newborn']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Clear bilaterally'],
      abdomen: ['Gravid uterus, term pregnancy', 'Contractions palpable every 2 minutes'],
      pelvis: ['Crowning visible - delivery imminent'],
      extremities: ['Mild ankle oedema bilateral (normal in pregnancy)', 'Reflexes normal'],
      posterior: ['Not assessed - patient position'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Prenatal vitamins', dose: 'Standard', frequency: 'Daily' },
        { name: 'Iron supplement', dose: '65mg', frequency: 'Daily', indication: 'Mild anaemia in pregnancy' }
      ],
      allergies: ['No known allergies'],
      medicalConditions: ['G2P1 - second pregnancy, one previous normal vaginal delivery'],
      surgicalHistory: ['None'],
      lastMeal: 'Light snack 3 hours ago',
      eventsLeading: 'Contractions started at midnight, initially every 10 minutes. Progressively closer. Waters broke 1 hour ago - clear fluid. Now feels strong urge to push. First baby was normal delivery at hospital, 6-hour labour.',
      socialHistory: {
        smoking: 'Non-smoker',
        alcohol: 'None during pregnancy',
        occupation: 'Primary school teacher',
        livingSituation: 'Lives with partner and 3-year-old son'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '128/78', pulse: 96, respiration: 24, spo2: 98, gcs: 15 },
      afterIntervention: { bp: '125/76', pulse: 90, respiration: 20, spo2: 99, gcs: 15 },
      deterioration: { bp: '90/55', pulse: 130, respiration: 28, spo2: 96, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'Term pregnancy (39 weeks) in active second stage of labour',
        'Crowning - delivery imminent',
        'G2P1 - previous normal delivery',
        'Membranes ruptured 1 hour ago, clear liquor',
        'Regular strong contractions every 2 minutes'
      ],
      redFlags: [
        'Meconium-stained liquor (would indicate foetal distress)',
        'Cord prolapse',
        'Excessive vaginal bleeding',
        'Abnormal presentation (breech, shoulder)',
        'Pre-eclampsia signs (BP >140/90, visual disturbance, headache)'
      ],
      differentialDiagnoses: [
        'Normal term labour - imminent delivery',
        'Precipitous labour'
      ],
      mostLikelyDiagnosis: 'Normal term labour, second stage, imminent vaginal delivery',
      supportingEvidence: [
        'Term pregnancy at 39 weeks',
        'Progressive contractions',
        'Spontaneous rupture of membranes with clear liquor',
        'Crowning visible',
        'Previous normal delivery'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety, introduction, consent',
        'Determine if transport is possible or delivery is imminent',
        'If crowning - prepare for delivery on scene',
        'Prepare clean delivery area and warm towels',
        'BSI - sterile gloves',
        'Call for backup if available'
      ],
      definitive: [
        'Support natural delivery - do NOT pull the baby',
        'Guide head delivery with gentle pressure',
        'Check for nuchal cord',
        'Support delivery of shoulders (anterior then posterior)',
        'Dry and stimulate newborn immediately',
        'Keep newborn warm - skin to skin with mother',
        'DELAYED cord clamping: wait 1-3 minutes after delivery if term and vigorous infant (WHO / ILCOR 2020 / NICE CG190 / RCOG). Keep baby at or below level of placenta, dry and stimulate during the delay. Clamp early only if resuscitation required or heavy maternal bleeding. Then two clamps 15-20cm from umbilicus, cut between.',
        'Await placental delivery (do NOT pull on cord)',
        'Monitor for postpartum haemorrhage'
      ],
      monitoring: [
        'Newborn: colour, breathing, tone, heart rate',
        'Mother: vaginal bleeding, uterine tone, vital signs',
        'APGAR score at 1 and 5 minutes',
        'Monitor for postpartum haemorrhage'
      ]
    },
    studentChecklist: [
      { id: 'y1-006-scene', category: 'safety', description: 'Scene safety and BSI (sterile gloves)', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-006-intro', category: 'communication', description: 'Introduce self, calm patient and partner', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-006-assess-stage', category: 'abcde', description: 'Determine stage of labour (crowning = deliver on scene)', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-006-ob-hx', category: 'history', description: 'Brief obstetric history: gravida, para, gestation, membranes', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-006-prepare', category: 'equipment', description: 'Prepare delivery equipment and warm towels', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-006-vitals', category: 'abcde', description: 'Maternal vital signs', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-006-delivery', category: 'intervention', description: 'Support natural delivery - guide, do not pull', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-006-nuchal', category: 'intervention', description: 'Check for nuchal cord after head delivery', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-006-newborn', category: 'intervention', description: 'Dry, stimulate and warm newborn immediately', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-006-apgar', category: 'abcde', description: 'APGAR assessment at 1 and 5 minutes', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-006-placenta', category: 'intervention', description: 'Await placenta - do NOT pull on cord', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-006-bleeding', category: 'abcde', description: 'Monitor for postpartum haemorrhage', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-006-document', category: 'documentation', description: 'Document delivery time, APGAR scores, placenta delivery', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'If crowning is visible, prepare for delivery on scene - do NOT attempt transport',
      'Normal delivery is a natural process - your role is to support, not intervene',
      'Never pull on the baby or the cord',
      'The most critical newborn intervention is drying, stimulating, and keeping warm',
      'Check for nuchal cord after the head delivers',
      'Skin-to-skin contact is the best way to warm a newborn',
      'Postpartum haemorrhage is the most dangerous complication - monitor closely'
    ],
    commonPitfalls: [
      'Attempting to transport when delivery is imminent',
      'Pulling on the baby during delivery',
      'Not checking for nuchal cord',
      'Forgetting to keep the newborn warm',
      'Pulling on the umbilical cord to deliver placenta',
      'Not monitoring for postpartum haemorrhage',
      'Neglecting the mother while focusing on the baby'
    ],
    references: [
      'Pre-hospital Obstetric Emergencies',
      'Normal Delivery Management - EMT Protocols',
      'Newborn Resuscitation Guidelines'
    ]
  }),

  // Case 7: Basic Pediatric - Child with croup
  createCase({
    id: 'y1-007',
    title: 'Toddler - Barking Cough (Croup)',
    category: 'pediatric',
    subcategory: 'croup',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', 'diploma'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: '2-year-old with barking cough and noisy breathing',
      timeOfDay: 'evening',
      location: 'Family home',
      callerInfo: 'Father (worried)',
      dispatchCode: 'Alpha'
    },
    patientInfo: {
      age: 2,
      gender: 'male',
      weight: 12,
      language: 'English',
      culturalConsiderations: ['Parents anxious about breathing difficulty', 'Older sibling present']
    },
    sceneInfo: {
      description: 'Child\'s bedroom, toddler sitting on father\'s lap',
      hazards: ['None identified'],
      bystanders: 'Father holding child, mother with older sibling',
      environment: 'Warm, dry centrally heated house'
    },
    initialPresentation: {
      generalImpression: 'Toddler sitting upright on father\'s lap, intermittent barking cough, mild inspiratory stridor at rest',
      position: 'Sitting upright on father\'s lap',
      appearance: 'Mildly distressed, clingy, intermittent barking cough',
      consciousness: 'Alert, clingy, intermittently crying',
      sounds: ['Barking/seal-like cough', 'Mild inspiratory stridor at rest']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but narrowed', 'Inspiratory stridor at rest (mild)', 'Barking cough', 'No drooling'],
        interventions: ['Keep child calm and upright', 'Do NOT examine throat']
      },
      breathing: {
        rate: 32,
        rhythm: 'Regular',
        depth: 'Adequate',
        spo2: 95,
        findings: ['Mild subcostal recession', 'Stridor worsens when child cries', 'Good air entry bilaterally', 'No wheeze'],
        interventions: ['Humidified oxygen if tolerated', 'Keep child calm - agitation worsens stridor']
      },
      circulation: {
        pulseRate: 120,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 90, diastolic: 55 },
        capillaryRefill: 2,
        skin: 'Warm, pink',
        findings: ['Heart rate normal for age and mild distress', 'Good perfusion'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        findings: ['Alert, age-appropriate responses', 'Clingy but consolable'],
        interventions: []
      },
      exposure: {
        temperature: 38.2,
        findings: ['Temperature 38.2°C', 'No rash', 'Well-nourished child'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal, no trauma'],
      neck: ['Tracheal tug visible with inspiration'],
      chest: ['Mild subcostal recession', 'Good air entry bilateral', 'No wheeze', 'Stridor mainly inspiratory'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: ['Normal, warm, well-perfused', 'No peripheral oedema'],
      posterior: ['Normal'],
      neurological: ['Age-appropriate development', 'Alert and interactive']
    },
    history: {
      medications: [
        { name: 'Paracetamol', dose: '5ml (120mg)', frequency: 'Given 2 hours ago', indication: 'Fever' }
      ],
      allergies: ['No known allergies'],
      medicalConditions: ['None', 'Immunisations up to date', 'Born at term, no neonatal issues'],
      surgicalHistory: ['None'],
      lastMeal: 'Dinner at 6pm, drinking well today',
      eventsLeading: 'Runny nose for 2 days. Developed barking cough this evening around 7pm. Cough getting worse. Father noticed noisy breathing. No previous episodes. No choking episode or foreign body possibility.',
      socialHistory: {
        livingSituation: 'Lives with both parents and older sibling (age 5)',
        supportSystem: 'Attends nursery'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '90/55', pulse: 120, respiration: 32, spo2: 95, gcs: 15, temperature: 38.2 },
      afterIntervention: { bp: '80/50', pulse: 95, respiration: 18, spo2: 99, gcs: 15, temperature: 38.0 },
      deterioration: { bp: '85/50', pulse: 145, respiration: 40, spo2: 90, gcs: 14, temperature: 38.5 }
    },
    expectedFindings: {
      keyObservations: [
        'Classic barking cough with inspiratory stridor',
        'Preceded by viral upper respiratory symptoms',
        'Mild to moderate severity (stridor at rest but not severe distress)',
        'Age 2 - peak age for croup',
        'Worse in evening (typical pattern)'
      ],
      redFlags: [
        'Drooling (suggests epiglottitis - do NOT examine throat)',
        'Severe respiratory distress with poor air entry',
        'Cyanosis or SpO2 <92%',
        'Exhaustion or decreasing consciousness',
        'Sudden onset without prodrome (consider foreign body)'
      ],
      differentialDiagnoses: [
        'Viral croup (laryngotracheobronchitis)',
        'Epiglottitis (toxic-appearing, drooling)',
        'Foreign body aspiration',
        'Bacterial tracheitis',
        'Retropharyngeal abscess'
      ],
      mostLikelyDiagnosis: 'Viral croup (laryngotracheobronchitis) - mild to moderate severity',
      supportingEvidence: [
        'Age 2 years (peak incidence)',
        'Viral prodrome (2 days of coryzal symptoms)',
        'Barking cough with inspiratory stridor',
        'Evening onset and worsening',
        'Mild fever',
        'No drooling, no toxic appearance'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety, introduction to parents',
        'Keep the child calm - sit on parent\'s lap',
        'Do NOT examine the throat',
        'Minimal handling approach',
        'Assess severity: mild/moderate/severe',
        'Humidified oxygen if tolerated (blow-by if needed)'
      ],
      definitive: [
        'Transport in position of comfort (upright on parent\'s lap)',
        'Avoid upsetting the child - agitation worsens obstruction',
        'Transport to ED for assessment and possible nebulised adrenaline/steroids',
        'Be prepared for deterioration'
      ],
      monitoring: [
        'Continuous SpO2 monitoring',
        'Work of breathing assessment',
        'Stridor severity (at rest vs with agitation only)',
        'Level of consciousness'
      ]
    },
    studentChecklist: [
      { id: 'y1-007-scene', category: 'safety', description: 'Scene safety and BSI', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-007-calm', category: 'communication', description: 'Keep child calm - minimal handling, stay with parent', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Agitation worsens upper airway obstruction in croup' },
      { id: 'y1-007-no-throat', category: 'safety', description: 'Do NOT examine the throat', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Throat examination can precipitate complete obstruction' },
      { id: 'y1-007-airway', category: 'abcde', description: 'Assess airway: stridor, barking cough, drooling', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-007-breathing', category: 'abcde', description: 'Assess work of breathing: recession, rate, SpO2', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-007-severity', category: 'abcde', description: 'Grade croup severity (mild/moderate/severe)', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-007-vitals', category: 'abcde', description: 'Age-appropriate vital signs', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-007-hx', category: 'history', description: 'History: onset, prodrome, foreign body risk, previous episodes', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-007-o2', category: 'intervention', description: 'Humidified oxygen if tolerated (blow-by)', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-007-position', category: 'intervention', description: 'Transport upright on parent\'s lap', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-007-reassure', category: 'communication', description: 'Reassure parents and explain condition', points: 2, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-007-document', category: 'documentation', description: 'Document severity, stridor characteristics, SpO2', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'Croup is most common in children 6 months to 3 years, peak at age 2',
      'The hallmark is a barking/seal-like cough with inspiratory stridor',
      'Keep the child calm - agitation dramatically worsens symptoms',
      'NEVER examine the throat - risk of precipitating complete obstruction',
      'Mild croup: barking cough, no stridor at rest. Moderate: stridor at rest, mild recession. Severe: stridor at rest, significant recession, distress',
      'Cool night air often temporarily improves symptoms',
      'Know the difference between croup and epiglottitis (toxic, drooling, no barking cough)'
    ],
    commonPitfalls: [
      'Examining the throat (risk of complete obstruction)',
      'Separating child from parent (causes agitation)',
      'Forcing oxygen mask on distressed child',
      'Laying child flat (worsens obstruction)',
      'Not differentiating croup from epiglottitis',
      'Using adult vital sign normals for a 2-year-old',
      'Not considering foreign body in differential'
    ],
    references: [
      'Paediatric Upper Airway Emergencies',
      'Croup Severity Assessment - APLS',
      'Paediatric Vital Signs by Age'
    ]
  }),

  // Case 8: Basic Psychiatric - Acute anxiety/panic attack
  createCase({
    id: 'y1-008',
    title: 'Young Adult - Panic Attack',
    category: 'psychiatric',
    subcategory: 'panic-attack',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', 'diploma'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: '22-year-old female, difficulty breathing, thinks she is having a heart attack',
      timeOfDay: 'afternoon',
      location: 'University library',
      callerInfo: 'Friend of patient',
      dispatchCode: 'Bravo'
    },
    patientInfo: {
      age: 22,
      gender: 'female',
      weight: 58,
      language: 'English',
      culturalConsiderations: ['University student under exam pressure', 'Embarrassed by public scene']
    },
    sceneInfo: {
      description: 'Quiet area of university library, patient sitting on floor against wall',
      hazards: ['None identified'],
      bystanders: 'Friend present, several students watching from distance',
      environment: 'Quiet, air-conditioned library'
    },
    initialPresentation: {
      generalImpression: 'Young female, visibly distressed, breathing rapidly, clutching chest',
      position: 'Sitting on floor against wall, knees drawn up',
      appearance: 'Anxious, tearful, hyperventilating',
      consciousness: 'Alert but highly anxious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking in short phrases between rapid breaths'],
        interventions: []
      },
      breathing: {
        rate: 32,
        rhythm: 'Rapid and shallow',
        depth: 'Shallow',
        spo2: 99,
        findings: ['Hyperventilating', 'No wheeze', 'Clear lung sounds bilaterally', 'No increased work of breathing', 'SpO2 99% - well-oxygenated'],
        interventions: ['Coaching slow, controlled breathing']
      },
      circulation: {
        pulseRate: 115,
        pulseQuality: 'Regular, strong, bounding',
        bp: { systolic: 138, diastolic: 85 },
        capillaryRefill: 2,
        skin: 'Warm, flushed, slightly diaphoretic',
        findings: ['Sinus tachycardia', 'No irregular rhythm', 'Good perfusion throughout'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        findings: ['Alert and oriented', 'Very anxious', 'Reports tingling in hands and around mouth', 'Lightheaded and dizzy'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['No rash', 'No oedema', 'Hands in carpopedal spasm posture', 'No signs of anaphylaxis'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal, no trauma'],
      neck: ['No JVD', 'No accessory muscle use beyond anxiety'],
      chest: ['Clear bilaterally', 'No pain on palpation', 'Normal heart sounds'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: ['Tingling fingers bilateral', 'Mild carpopedal spasm', 'No calf swelling or tenderness', 'No peripheral oedema'],
      posterior: ['Normal'],
      neurological: ['Alert, oriented', 'Tingling perioral and fingers (hyperventilation)', 'No focal deficits']
    },
    history: {
      medications: [
        { name: 'Oral contraceptive pill', dose: 'Standard', frequency: 'Daily' }
      ],
      allergies: ['No known allergies'],
      medicalConditions: ['Anxiety disorder (diagnosed 1 year ago)', 'Previously prescribed sertraline but stopped taking it'],
      surgicalHistory: ['None'],
      lastMeal: 'Skipped lunch, had coffee only',
      eventsLeading: 'Final exams this week. Patient has been studying for 12 hours straight, drinking multiple coffees, not eating properly, sleeping poorly for a week. Suddenly felt chest tightness, heart racing, could not catch breath. Convinced she was having a heart attack. Friend called ambulance.',
      socialHistory: {
        smoking: 'Non-smoker',
        alcohol: 'Social - not recently',
        occupation: 'University student (psychology)',
        livingSituation: 'University halls of residence'
      },
      previousSimilarEpisodes: ['Two previous episodes in past year, both during exam periods']
    },
    vitalSignsProgression: {
      initial: { bp: '138/85', pulse: 115, respiration: 32, spo2: 99, gcs: 15, painScore: 5 },
      afterIntervention: { bp: '120/75', pulse: 82, respiration: 16, spo2: 99, gcs: 15, painScore: 0 },
      deterioration: { bp: '145/90', pulse: 130, respiration: 38, spo2: 100, gcs: 15, painScore: 7 }
    },
    expectedFindings: {
      keyObservations: [
        'Classic panic attack presentation: hyperventilation, chest tightness, tachycardia',
        'Perioral and extremity tingling (respiratory alkalosis from hyperventilation)',
        'SpO2 99% - not a primary respiratory problem',
        'Known history of anxiety disorder',
        'Clear precipitant (exam stress, caffeine, sleep deprivation)',
        'Previous similar episodes'
      ],
      redFlags: [
        'Must rule out: pulmonary embolism (OCP use is a risk factor)',
        'Must rule out: pneumothorax',
        'Must rule out: cardiac arrhythmia',
        'Unilateral leg swelling (DVT/PE)',
        'True cardiac chest pain vs anxiety chest tightness'
      ],
      differentialDiagnoses: [
        'Panic attack / acute anxiety',
        'Pulmonary embolism (OCP risk factor)',
        'Supraventricular tachycardia',
        'Hypoglycaemia (missed meals)',
        'Caffeine toxicity',
        'Asthma attack'
      ],
      mostLikelyDiagnosis: 'Acute panic attack with hyperventilation syndrome',
      supportingEvidence: [
        'Known anxiety disorder with previous episodes',
        'Clear precipitants (stress, caffeine, sleep deprivation)',
        'SpO2 99% with clear lungs (not primary respiratory)',
        'Tingling and carpopedal spasm (hyperventilation)',
        'Symptoms improving with reassurance and breathing coaching'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety, move to quieter area if possible',
        'Introduction - calm, slow, reassuring manner',
        'Validate feelings - "I can see you are very frightened"',
        'Rule out organic causes (check SpO2, ECG if available, blood glucose)',
        'Breathing coaching: "Breathe with me - in for 4, out for 6"'
      ],
      definitive: [
        'Continue breathing coaching',
        'Provide calm, quiet environment',
        'Offer transport to ED if symptoms do not improve or for reassurance',
        'Safety-net advice if patient declines transport',
        'Encourage follow-up with GP regarding anxiety management'
      ],
      monitoring: [
        'Respiratory rate - should decrease with coaching',
        'Heart rate - should settle as anxiety reduces',
        'SpO2 monitoring',
        'Symptom reassessment'
      ]
    },
    studentChecklist: [
      { id: 'y1-008-scene', category: 'safety', description: 'Scene safety, create quiet private environment', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-008-intro', category: 'communication', description: 'Calm, slow introduction. Validate patient\'s feelings', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Therapeutic communication is the primary intervention' },
      { id: 'y1-008-vitals', category: 'abcde', description: 'Full vital signs including SpO2 and blood glucose', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-008-rule-out', category: 'abcde', description: 'Rule out organic causes (PE, pneumothorax, cardiac)', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Panic attack is a diagnosis of exclusion' },
      { id: 'y1-008-breathing', category: 'intervention', description: 'Breathing coaching: slow controlled breathing', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-008-sample', category: 'history', description: 'SAMPLE history including psychiatric history and medications', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-008-previous', category: 'history', description: 'Ask about previous similar episodes', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-008-precipitant', category: 'history', description: 'Identify precipitants (stress, caffeine, sleep)', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-008-reassure', category: 'communication', description: 'Explain what is happening in simple terms', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-008-safety-net', category: 'communication', description: 'Provide safety-netting advice and encourage GP follow-up', points: 2, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-008-document', category: 'documentation', description: 'Document assessment, vital signs, and outcome', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'Panic attack is a diagnosis of EXCLUSION - always rule out organic causes first',
      'SpO2 of 99-100% with hyperventilation is reassuring (not a primary respiratory problem)',
      'Tingling and carpopedal spasm are caused by respiratory alkalosis from hyperventilation',
      'Therapeutic communication IS the treatment - be calm, slow, and validating',
      'Never dismiss the patient\'s symptoms - they genuinely feel they are dying',
      'OCP use is a risk factor for PE - always consider in young females with chest tightness',
      'Do NOT use a paper bag for rebreathing - this is outdated and potentially dangerous'
    ],
    commonPitfalls: [
      'Dismissing symptoms as "just anxiety" without ruling out organic causes',
      'Being dismissive or telling patient to "just calm down"',
      'Using a paper bag for rebreathing (outdated, can worsen hypoxia if true respiratory cause)',
      'Not checking blood glucose (hypoglycaemia mimics panic)',
      'Not considering PE in young female on OCP',
      'Speaking too fast or using medical jargon with anxious patient',
      'Not asking about previous psychiatric history and medications'
    ],
    references: [
      'Psychiatric Emergencies - Anxiety Disorders',
      'Hyperventilation Syndrome Assessment',
      'Therapeutic Communication in Pre-hospital Care'
    ]
  }),

  // Case 9: Basic Toxicology - Accidental ingestion
  createCase({
    id: 'y1-009',
    title: 'Toddler - Accidental Ingestion of Household Cleaner',
    category: 'toxicology',
    subcategory: 'accidental-ingestion',
    priority: 'high',
    complexity: 'basic',
    yearLevels: ['1st-year', 'diploma'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: '3-year-old found with open bottle of household cleaner, drooling and crying',
      timeOfDay: 'morning',
      location: 'Family home - kitchen',
      callerInfo: 'Mother (frantic)',
      dispatchCode: 'Bravo'
    },
    patientInfo: {
      age: 3,
      gender: 'male',
      weight: 15,
      language: 'English',
      culturalConsiderations: ['Mother extremely distressed and feeling guilty', 'Younger sibling also present']
    },
    sceneInfo: {
      description: 'Kitchen floor, open bottle of bleach-based cleaner nearby, small amount spilled',
      hazards: ['Open chemical container', 'Chemical spill on floor', 'Younger sibling nearby'],
      bystanders: 'Mother holding child, younger sibling (1 year) in playpen',
      environment: 'Domestic kitchen',
      environmentVariant: 'home',
      sceneImagePath: '/scene-assets/home-pediatric-uae-family.png',
      sceneImageCaption: 'Scene — Domestic kitchen, toddler ingestion',
    },
    initialPresentation: {
      generalImpression: 'Toddler crying, drooling excessively, mother holding him',
      position: 'Being held by mother',
      appearance: 'Crying, drooling, rubbing mouth',
      consciousness: 'Alert, crying, distressed'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Crying (airway open)', 'Excessive drooling', 'No stridor', 'Mild redness around lips'],
        interventions: ['Monitor airway closely for swelling', 'Suction available']
      },
      breathing: {
        rate: 30,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 97,
        findings: ['Respiratory rate elevated (crying)', 'No wheeze or stridor', 'Clear lung sounds', 'No cough'],
        interventions: []
      },
      circulation: {
        pulseRate: 130,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 92, diastolic: 56 },
        capillaryRefill: 2,
        skin: 'Warm, pink, slightly tearful',
        findings: ['Tachycardia appropriate for age and distress', 'Well-perfused'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        findings: ['Alert, crying but consolable', 'No neurological deficit', 'Moving all limbs'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Redness around lips and chin', 'Drooling - possible oral irritation', 'No burns visible on skin elsewhere', 'Nappy area dry'],
        interventions: ['Examine oral cavity gently if child allows - look for burns']
      }
    },
    secondarySurvey: {
      head: ['Redness around lips', 'Oral mucosa appears red and irritated', 'No visible burns to tongue'],
      neck: ['Normal, no swelling'],
      chest: ['Clear bilaterally'],
      abdomen: ['Soft, mild tenderness uncertain (child crying)'],
      pelvis: ['Normal'],
      extremities: ['Normal, no chemical contact burns', 'No peripheral oedema'],
      posterior: ['Normal'],
      neurological: ['Alert, age-appropriate crying response', 'No focal deficits']
    },
    history: {
      medications: [],
      allergies: ['No known allergies'],
      medicalConditions: ['None', 'Immunisations up to date'],
      surgicalHistory: ['None'],
      lastMeal: 'Breakfast 1 hour ago',
      eventsLeading: 'Mother was cleaning kitchen. Turned away briefly to attend to younger sibling. Found 3-year-old with open bottle of bleach-based household cleaner (sodium hypochlorite). Cap was off, small amount spilled on floor and child\'s shirt. Child drooling and crying. Mother unsure if child swallowed any. Approximately 5 minutes ago.',
      socialHistory: {
        livingSituation: 'Lives with both parents and 1-year-old sibling'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '92/56', pulse: 130, respiration: 30, spo2: 97, gcs: 15 },
      afterIntervention: { bp: '90/55', pulse: 118, respiration: 26, spo2: 98, gcs: 15 },
      deterioration: { bp: '85/50', pulse: 150, respiration: 36, spo2: 93, gcs: 13 }
    },
    expectedFindings: {
      keyObservations: [
        'Toddler with possible ingestion of bleach-based cleaner',
        'Drooling and oral irritation present',
        'Airway currently patent but at risk of swelling',
        'Amount ingested uncertain',
        'Product identified: sodium hypochlorite (household bleach)'
      ],
      redFlags: [
        'Stridor or voice change (laryngeal oedema)',
        'Difficulty swallowing or refusing to swallow',
        'Vomiting (risk of re-exposure to caustic)',
        'Drooling increasing (worsening oropharyngeal burns)',
        'Respiratory distress (aspiration or chemical pneumonitis)'
      ],
      differentialDiagnoses: [
        'Caustic ingestion with oropharyngeal burns',
        'Caustic ingestion with oesophageal involvement',
        'Topical exposure only (no ingestion)',
        'Minor taste/sip without significant ingestion'
      ],
      mostLikelyDiagnosis: 'Possible caustic ingestion (sodium hypochlorite) - amount uncertain, mild oropharyngeal irritation present',
      supportingEvidence: [
        'Found with open container',
        'Drooling and oral redness',
        'Age consistent with exploratory ingestion',
        'Product identified as sodium hypochlorite'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety - secure chemical container, ventilate room if fumes',
        'Introduction, calm the mother',
        'Do NOT induce vomiting (re-exposure to caustic)',
        'Do NOT give anything by mouth',
        'Assess and monitor airway',
        'Identify the product - bring container to hospital',
        'Call Poison Control Centre'
      ],
      definitive: [
        'Urgent transport to ED',
        'Monitor airway continuously for swelling',
        'Bring the product container to hospital',
        'Be prepared for airway deterioration',
        'Consider gentle mouth rinse with water if child cooperative (spit, not swallow)'
      ],
      monitoring: [
        'Airway patency - stridor, voice changes, increasing drooling',
        'SpO2 continuous',
        'Level of consciousness',
        'Vital signs every 5 minutes'
      ]
    },
    studentChecklist: [
      { id: 'y1-009-scene', category: 'safety', description: 'Scene safety - secure chemical, manage hazards', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Chemical containers must be secured to prevent further exposure' },
      { id: 'y1-009-bsi', category: 'safety', description: 'BSI - gloves (chemical exposure risk)', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-009-intro', category: 'communication', description: 'Calm introduction, reassure panicking mother', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-009-no-vomit', category: 'intervention', description: 'Do NOT induce vomiting', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Vomiting re-exposes oesophagus to caustic substance' },
      { id: 'y1-009-airway', category: 'abcde', description: 'Assess and continuously monitor airway', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-009-identify', category: 'history', description: 'Identify the product - read label, bring container', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-009-amount', category: 'history', description: 'Estimate amount potentially ingested and time', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-009-poison', category: 'intervention', description: 'Call Poison Control Centre for advice', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-009-vitals', category: 'abcde', description: 'Full vital signs', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-009-oral', category: 'abcde', description: 'Gentle oral cavity inspection for chemical burns', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-009-sample', category: 'history', description: 'SAMPLE history from mother', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-009-transport', category: 'intervention', description: 'Urgent transport to ED with product container', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-009-document', category: 'documentation', description: 'Document product name, estimated amount, time, and findings', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'NEVER induce vomiting with caustic or corrosive ingestions',
      'NEVER give activated charcoal for caustic ingestions',
      'Always identify the product - bring the container to hospital',
      'Airway swelling can be delayed - continuous monitoring is essential',
      'Absence of oral burns does NOT exclude oesophageal injury',
      'Call Poison Control early - they provide specific guidance',
      'Prevention is key - childproof locks, high storage of chemicals'
    ],
    commonPitfalls: [
      'Inducing vomiting (causes re-exposure and further damage)',
      'Not identifying the specific product ingested',
      'Not bringing the container to hospital',
      'Assuming no oral burns means no significant ingestion',
      'Not monitoring airway for delayed swelling',
      'Giving milk or water to drink (controversial - follow local guidelines)',
      'Being judgmental toward the parent (accidents happen)'
    ],
    references: [
      'Paediatric Toxicology - Caustic Ingestions',
      'Poison Control Centre Guidelines',
      'Pre-hospital Poisoning Management - EMT Protocols'
    ]
  }),

  // Case 10: Basic Trauma - Simple wrist fracture
  createCase({
    id: 'y1-010',
    title: 'Adolescent - Wrist Fracture from Bicycle Fall',
    category: 'trauma',
    subcategory: 'long-bone-fracture',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', 'diploma'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: '14-year-old fell off bicycle, wrist injury',
      timeOfDay: 'afternoon',
      location: 'Local park pathway',
      callerInfo: 'Passing adult',
      dispatchCode: 'Alpha'
    },
    patientInfo: {
      age: 14,
      gender: 'male',
      weight: 52,
      language: 'English',
      culturalConsiderations: ['Adolescent patient - address directly, not just parents', 'May be embarrassed in front of friends']
    },
    sceneInfo: {
      description: 'Park pathway, patient sitting on grass verge beside bicycle, holding left wrist',
      hazards: ['Bicycle on path', 'Passing cyclists/pedestrians'],
      bystanders: 'Two friends (same age) and a passing adult who called ambulance',
      environment: 'Outdoor park, dry weather, warm afternoon'
    },
    initialPresentation: {
      generalImpression: 'Adolescent male sitting on grass, alert, holding left wrist with visible deformity',
      position: 'Sitting on grass, supporting left wrist with right hand',
      appearance: 'Pale, guarding injured wrist, some tears but trying to be brave',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking clearly'],
        interventions: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 99,
        findings: ['Normal respiratory rate', 'Clear lung sounds', 'No chest injury'],
        interventions: []
      },
      circulation: {
        pulseRate: 96,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 118, diastolic: 72 },
        capillaryRefill: 2,
        skin: 'Warm, slightly pale (pain/anxiety)',
        findings: ['Mild tachycardia from pain', 'Good perfusion', 'Radial pulse present in injured arm'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        findings: ['Alert and oriented', 'Pain score 7/10', 'No head injury'],
        interventions: []
      },
      exposure: {
        temperature: 36.5,
        findings: [
          'Left wrist: obvious dorsal deformity ("dinner fork" appearance)',
          'Mild swelling over distal radius',
          'No open wound (closed fracture)',
          'Skin intact, no bruising yet',
          'Minor abrasions on left palm and elbow',
          'Helmet worn (no head injury)',
          'No other injuries identified'
        ],
        interventions: ['Remove watch from injured wrist if present']
      }
    },
    secondarySurvey: {
      head: ['Helmet worn at time of fall', 'No head injury', 'No LOC'],
      neck: ['No pain', 'Full range of motion', 'No C-spine concern (low mechanism)'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: [
        'Left wrist: dorsal deformity at distal radius',
        'Swelling moderate',
        'Tender on palpation over distal radius',
        'Radial pulse present distally',
        'Cap refill <2s in fingers',
        'Sensation intact all fingers',
        'Can wiggle fingers (painfully)',
        'Right palm: minor abrasion',
        'Left elbow: superficial graze'
      ],
      posterior: ['Not assessed (seated, low mechanism)'],
      neurological: ['Normal', 'Intact sensation and motor to fingers of injured hand']
    },
    history: {
      medications: [],
      allergies: ['No known allergies'],
      medicalConditions: ['None'],
      surgicalHistory: ['None'],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Riding bicycle in park with friends. Hit a pothole, went over handlebars. Landed on outstretched left hand (FOOSH mechanism). Did not hit head (was wearing helmet). No LOC. Immediate pain in left wrist. Did not land on any other body part. Able to get up and walk to grass verge.',
      socialHistory: {
        occupation: 'School student, Year 9',
        livingSituation: 'Lives with parents and younger sister'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '118/72', pulse: 96, respiration: 20, spo2: 99, gcs: 15, painScore: 7 },
      afterIntervention: { bp: '115/70', pulse: 82, respiration: 16, spo2: 99, gcs: 15, painScore: 4 },
      deterioration: { bp: '120/75', pulse: 105, respiration: 22, spo2: 99, gcs: 15, painScore: 9 }
    },
    expectedFindings: {
      keyObservations: [
        'Isolated distal radius fracture (likely Colles-type)',
        'Closed fracture with dorsal deformity',
        'FOOSH (Fall On Outstretched Hand) mechanism',
        'Neurovascularly intact distally',
        'Low energy mechanism, helmet worn, no other injuries'
      ],
      redFlags: [
        'Loss of distal pulses (vascular compromise)',
        'Loss of sensation (nerve injury)',
        'Open fracture (skin broken over fracture site)',
        'Compartment syndrome signs (pain out of proportion, pain with passive stretch)'
      ],
      differentialDiagnoses: [
        'Distal radius fracture (Colles fracture)',
        'Scaphoid fracture',
        'Distal radius and ulna fracture',
        'Wrist dislocation',
        'Greenstick fracture (possible in adolescent)'
      ],
      mostLikelyDiagnosis: 'Closed distal radius fracture (Colles-type) from FOOSH mechanism',
      supportingEvidence: [
        'FOOSH mechanism',
        'Dorsal deformity ("dinner fork")',
        'Tenderness over distal radius',
        'Swelling at injury site',
        'Age-appropriate mechanism'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety - move bicycle off path',
        'Introduction and consent',
        'Assess for other injuries (full body check)',
        'Neurovascular assessment of injured hand: pulses, sensation, movement',
        'OPQRS pain assessment'
      ],
      definitive: [
        'Splint in position of comfort (do not attempt to realign)',
        'Apply ice pack wrapped in cloth over splint',
        'Elevation in sling',
        'Pain management - paracetamol',
        'Transport to ED for X-ray and orthopaedic assessment',
        'Dress minor abrasions on palm and elbow'
      ],
      monitoring: [
        'Distal neurovascular checks before and after splinting',
        'Pain reassessment after analgesia',
        'Vital signs en route',
        'Check splint not too tight'
      ]
    },
    studentChecklist: [
      { id: 'y1-010-scene', category: 'safety', description: 'Scene safety - move hazards (bicycle)', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-010-bsi', category: 'safety', description: 'BSI - gloves', points: 2, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-010-intro', category: 'communication', description: 'Introduce self, address patient directly (not just bystanders)', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-010-mechanism', category: 'history', description: 'Establish mechanism of injury (FOOSH)', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-010-helmet', category: 'history', description: 'Confirm helmet worn, no head injury, no LOC', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-010-other', category: 'secondary', description: 'Check for other injuries (not just the obvious one)', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], rationale: 'Distracting injury can mask other injuries' },
      { id: 'y1-010-nv-pre', category: 'abcde', description: 'Neurovascular check BEFORE splinting: pulse, sensation, movement', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-010-opqrs', category: 'history', description: 'OPQRS pain assessment', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-010-splint', category: 'intervention', description: 'Splint in position found (do not realign)', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-010-ice', category: 'intervention', description: 'Ice pack wrapped in cloth over splint', points: 2, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-010-sling', category: 'intervention', description: 'Elevation with sling', points: 2, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-010-nv-post', category: 'abcde', description: 'Neurovascular check AFTER splinting', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-010-analgesia', category: 'intervention', description: 'Pain management - paracetamol', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-010-vitals', category: 'abcde', description: 'Full vital signs', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-010-sample', category: 'history', description: 'SAMPLE history', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-010-document', category: 'documentation', description: 'Document injury, NV status pre/post splint, pain score', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'FOOSH (Fall On Outstretched Hand) is the classic mechanism for distal radius fractures',
      'Always check neurovascular status BEFORE and AFTER splinting',
      'Splint in position found - do NOT try to straighten or realign',
      'The 5 Ps of neurovascular assessment: Pain, Pulse, Pallor, Paraesthesia, Paralysis',
      'Ice reduces swelling - always wrap in cloth, never apply directly to skin',
      'Do not be distracted by the obvious injury - always check for other injuries',
      'Adolescent patients should be addressed directly, not just through bystanders'
    ],
    commonPitfalls: [
      'Attempting to realign the fracture in the field',
      'Not checking neurovascular status before splinting',
      'Not rechecking neurovascular status after splinting',
      'Forgetting to check for other injuries (distraction injury)',
      'Applying ice directly to skin',
      'Splint too tight causing neurovascular compromise',
      'Not asking about mechanism to rule out other injuries',
      'Talking only to bystanders and ignoring the adolescent patient'
    ],
    references: [
      'Musculoskeletal Injuries - Fracture Management',
      'Splinting Techniques - EMT Fundamentals',
      'Neurovascular Assessment Guidelines'
    ]
  }),

  // Case 11: Basic Trauma 2 - Minor RTC with whiplash
  createCase({
    id: 'y1-011',
    title: 'Adult - Minor Road Traffic Collision with Neck Pain',
    category: 'trauma',
    subcategory: 'whiplash',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', 'diploma'],
    estimatedDuration: 18,
    dispatchInfo: {
      callReason: '30-year-old male, rear-ended at low speed, complaining of neck pain',
      timeOfDay: 'morning',
      location: 'Main road, vehicles pulled over to hard shoulder',
      callerInfo: 'Patient (from vehicle)',
      dispatchCode: 'Alpha'
    },
    patientInfo: {
      age: 30,
      gender: 'male',
      weight: 80,
      language: 'English',
      culturalConsiderations: ['Concerned about work and vehicle', 'Wants to leave scene quickly']
    },
    sceneInfo: {
      description: 'Two-vehicle rear-end collision on main road, minor vehicle damage, patient still in driver seat',
      hazards: ['Moving traffic nearby', 'Broken glass on road', 'Risk of further collision'],
      bystanders: 'Other driver standing by their vehicle, uninjured',
      environment: 'Roadside, dry conditions, good visibility',
      environmentVariant: 'roadside',
      sceneImagePath: '/scene-assets/road-traffic-male-dubai.png',
      sceneImageCaption: 'Scene — Roadside, dry conditions, good visibility',
    },
    initialPresentation: {
      generalImpression: 'Adult male sitting in driver seat, holding back of neck, alert and talking',
      position: 'Seated in driver seat with seatbelt on',
      appearance: 'Anxious but not distressed, holding posterior neck',
      consciousness: 'Alert and fully oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking normally'],
        interventions: ['Manual in-line stabilisation of C-spine']
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 99,
        findings: ['Normal breathing', 'Clear lung sounds bilaterally', 'No chest wall tenderness'],
        interventions: []
      },
      circulation: {
        pulseRate: 88,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 135, diastolic: 82 },
        capillaryRefill: 2,
        skin: 'Warm, dry, pink',
        findings: ['Mild tachycardia (anxiety/pain)', 'BP mildly elevated (stress response)', 'Good perfusion'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        findings: ['Fully alert and oriented', 'No neurological deficit', 'Full power in all limbs', 'Sensation intact throughout', 'No numbness or tingling'],
        interventions: []
      },
      exposure: {
        temperature: 36.5,
        findings: [
          'Posterior neck midline tenderness on palpation',
          'No step deformity',
          'Paraspinal muscle spasm',
          'No bruising visible yet',
          'Seatbelt mark across chest (seatbelt worn)',
          'No other injuries found'
        ],
        interventions: ['Maintain C-spine precautions']
      }
    },
    secondarySurvey: {
      head: ['No trauma', 'No LOC reported'],
      neck: ['Midline posterior tenderness', 'Paraspinal muscle spasm bilateral', 'No step deformity', 'Trachea midline'],
      chest: ['Seatbelt mark across chest (diagonal)', 'No tenderness on palpation', 'Clear bilaterally'],
      abdomen: ['Soft, non-tender', 'Lap belt mark visible'],
      pelvis: ['Stable, non-tender'],
      extremities: ['Full range of motion in all limbs', 'Normal power bilaterally', 'Normal sensation', 'Reflexes normal', 'No peripheral oedema'],
      posterior: ['Midline cervical tenderness C4-C6 area', 'No thoracic or lumbar tenderness'],
      neurological: ['GCS 15', 'No focal deficits', 'Sensation intact', 'Power 5/5 all limbs', 'No numbness or tingling']
    },
    history: {
      medications: [],
      allergies: ['No known allergies'],
      medicalConditions: ['None'],
      surgicalHistory: ['None'],
      lastMeal: 'Breakfast 1 hour ago',
      eventsLeading: 'Driving to work, stopped at traffic lights. Rear-ended by vehicle behind at estimated 15-20 mph. Seatbelt worn, airbag did NOT deploy (low speed). Immediate onset neck pain after impact. No LOC, no amnesia. Did not hit head. Able to move all limbs. Got out of car initially then sat back down due to neck pain.',
      socialHistory: {
        smoking: 'Non-smoker',
        alcohol: 'None today',
        occupation: 'IT consultant',
        livingSituation: 'Lives with partner'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '135/82', pulse: 88, respiration: 18, spo2: 99, gcs: 15, painScore: 5 },
      afterIntervention: { bp: '128/78', pulse: 78, respiration: 16, spo2: 99, gcs: 15, painScore: 4 },
      deterioration: { bp: '140/85', pulse: 95, respiration: 20, spo2: 99, gcs: 15, painScore: 7 }
    },
    expectedFindings: {
      keyObservations: [
        'Low-speed rear-end collision',
        'Neck pain with midline tenderness',
        'No neurological deficit',
        'Seatbelt worn, no head impact',
        'No loss of consciousness',
        'Mobile at scene'
      ],
      redFlags: [
        'Any neurological deficit (weakness, numbness, tingling)',
        'Loss of consciousness or amnesia',
        'Severe mechanism or high-speed impact',
        'Intoxication (unreliable assessment)',
        'Distracting injuries',
        'Age >65 (Canadian C-Spine Rules)'
      ],
      differentialDiagnoses: [
        'Cervical muscle strain (whiplash)',
        'Cervical ligament injury',
        'Cervical vertebral fracture',
        'Cervical disc injury'
      ],
      mostLikelyDiagnosis: 'Cervical muscle strain / whiplash injury',
      supportingEvidence: [
        'Low-speed mechanism',
        'Midline tenderness without step deformity',
        'No neurological deficit',
        'Full range of motion (though painful)',
        'Paraspinal muscle spasm'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety - protect from traffic, hi-vis, cones',
        'Introduction and consent',
        'Manual in-line stabilisation of C-spine',
        'Full neurological assessment: power, sensation, reflexes',
        'Canadian C-Spine Rules or NEXUS criteria assessment'
      ],
      definitive: [
        'Apply cervical collar if C-spine cannot be cleared',
        'Full spinal immobilisation if any red flags',
        'Analgesia - paracetamol',
        'Transport to ED for assessment and imaging if required',
        'If C-spine clearable by protocol: advise self-care and follow-up'
      ],
      monitoring: [
        'Repeated neurological assessment',
        'Pain reassessment',
        'Vital signs',
        'Watch for delayed neurological symptoms'
      ]
    },
    studentChecklist: [
      { id: 'y1-011-scene', category: 'safety', description: 'Scene safety - traffic management, hi-vis, positioning', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'RTC scenes are high-risk for rescuer injury' },
      { id: 'y1-011-bsi', category: 'safety', description: 'BSI - gloves', points: 2, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-011-cspine', category: 'intervention', description: 'Manual in-line stabilisation of C-spine', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-011-intro', category: 'communication', description: 'Introduction, consent, instruct patient not to move', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-011-mechanism', category: 'history', description: 'Detailed mechanism: speed, seatbelt, airbag, LOC', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-011-neuro', category: 'abcde', description: 'Full neurological exam: power, sensation all limbs', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-011-palpate', category: 'secondary', description: 'Palpate cervical spine: midline tenderness, step deformity', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-011-red-flags', category: 'abcde', description: 'Assess for C-spine red flags (neuro deficit, LOC, intoxication)', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-011-vitals', category: 'abcde', description: 'Full vital signs', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-011-collar', category: 'intervention', description: 'Apply cervical collar if indicated', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-011-sample', category: 'history', description: 'SAMPLE history', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-011-secondary', category: 'secondary', description: 'Full secondary survey for other injuries', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-011-analgesia', category: 'intervention', description: 'Analgesia - paracetamol', points: 2, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-011-document', category: 'documentation', description: 'Document mechanism, neuro exam findings, C-spine status', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'Scene safety at RTCs is paramount - always manage traffic hazards first',
      'Manual in-line stabilisation should begin immediately with any neck pain after RTC',
      'Neurological assessment must include power and sensation in all four limbs',
      'Know the Canadian C-Spine Rules: age, mechanism, neurological deficit, midline tenderness',
      'Low speed does not mean no injury - always assess thoroughly',
      'Seatbelt signs indicate energy transfer - check chest and abdomen',
      'Patient wanting to leave is not a reason to skip assessment'
    ],
    commonPitfalls: [
      'Not managing scene safety before patient care',
      'Forgetting manual in-line C-spine stabilisation',
      'Incomplete neurological exam (checking only arms, not legs)',
      'Not asking about LOC or amnesia',
      'Assuming low speed means no injury',
      'Allowing patient to self-extricate without C-spine precautions',
      'Not checking for seatbelt injuries to chest and abdomen',
      'Rushing assessment because patient wants to leave'
    ],
    references: [
      'Spinal Injury Assessment - Pre-hospital Guidelines',
      'Canadian C-Spine Rules',
      'RTC Scene Management - EMT Protocols'
    ]
  }),

  // Case 12: Basic Respiratory 2 - Hyperventilation
  createCase({
    id: 'y1-012',
    title: 'Student - Hyperventilation Syndrome',
    category: 'respiratory',
    subcategory: 'hyperventilation-syndrome',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', 'diploma'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: '18-year-old male, difficulty breathing, tingling, dizzy',
      timeOfDay: 'morning',
      location: 'School examination hall',
      callerInfo: 'School nurse',
      dispatchCode: 'Bravo'
    },
    patientInfo: {
      age: 18,
      gender: 'male',
      weight: 68,
      language: 'English',
      culturalConsiderations: ['In front of peers during exam', 'Embarrassed about situation']
    },
    sceneInfo: {
      description: 'School medical room, patient brought from exam hall by nurse',
      hazards: ['None identified'],
      bystanders: 'School nurse present',
      environment: 'Quiet medical room, comfortable temperature',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/campus-student-uae.png',
      sceneImageCaption: 'Scene — Quiet medical room, comfortable temperature',
    },
    initialPresentation: {
      generalImpression: 'Young male, breathing very rapidly, anxious, complaining of tingling and dizziness',
      position: 'Sitting on examination couch, leaning forward',
      appearance: 'Anxious, breathing rapidly, hands trembling',
      consciousness: 'Alert, anxious, lightheaded'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking in short phrases'],
        interventions: []
      },
      breathing: {
        rate: 34,
        rhythm: 'Rapid, regular',
        depth: 'Shallow',
        spo2: 100,
        findings: ['Hyperventilating', 'SpO2 100% - over-breathing, not hypoxic', 'No wheeze', 'Clear lung sounds bilaterally', 'No increased work of breathing (no recession, no accessory muscle use)', 'Good air entry throughout'],
        interventions: ['Coaching slow breathing']
      },
      circulation: {
        pulseRate: 108,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 130, diastolic: 80 },
        capillaryRefill: 2,
        skin: 'Warm, flushed, mildly diaphoretic',
        findings: ['Tachycardia from anxiety and hyperventilation', 'Good perfusion'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        findings: ['Alert, oriented', 'Lightheaded and dizzy', 'Tingling in both hands and perioral area', 'No focal neurological deficit'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Mild carpopedal spasm in both hands', 'No rash', 'No chest wall deformity', 'No signs of anaphylaxis'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['No JVD', 'Trachea midline', 'No subcutaneous emphysema'],
      chest: ['Clear bilaterally', 'Equal expansion', 'No chest pain on palpation', 'No tenderness'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: ['Carpopedal spasm bilateral', 'Tingling in fingers', 'No calf swelling', 'No unilateral leg symptoms', 'No peripheral oedema'],
      posterior: ['Normal'],
      neurological: ['Alert', 'Perioral tingling', 'Bilateral hand tingling', 'No focal deficits', 'No weakness']
    },
    history: {
      medications: [],
      allergies: ['Mild hayfever - seasonal only'],
      medicalConditions: ['No asthma', 'No cardiac history', 'No previous similar episodes'],
      surgicalHistory: ['None'],
      lastMeal: 'Skipped breakfast due to exam nerves, had energy drink only',
      eventsLeading: 'Patient was 30 minutes into A-level exam when suddenly felt he could not breathe. Heart started racing. Felt dizzy and tingling in hands. Left exam hall. School nurse brought to medical room. No chest pain, no cough, no fever. No history of asthma or breathing problems. Had 2 energy drinks this morning and no food.',
      socialHistory: {
        smoking: 'Vapes occasionally',
        alcohol: 'None',
        occupation: 'A-level student',
        livingSituation: 'Lives with parents'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '130/80', pulse: 108, respiration: 34, spo2: 100, gcs: 15 },
      afterIntervention: { bp: '118/72', pulse: 78, respiration: 14, spo2: 99, gcs: 15 },
      deterioration: { bp: '135/85', pulse: 120, respiration: 40, spo2: 100, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'Hyperventilation with SpO2 100% (over-breathing)',
        'Clear lungs, no wheeze, no respiratory pathology',
        'Bilateral tingling and carpopedal spasm (respiratory alkalosis)',
        'Clear trigger (exam stress, caffeine, fasting)',
        'No history of respiratory disease'
      ],
      redFlags: [
        'Unilateral symptoms (consider PE, pneumothorax)',
        'True respiratory distress with low SpO2',
        'Chest pain with cardiac features',
        'Wheeze or reduced air entry',
        'History of asthma or COPD',
        'Recent surgery or immobilisation (PE risk)'
      ],
      differentialDiagnoses: [
        'Hyperventilation syndrome (most likely)',
        'Pneumothorax',
        'Pulmonary embolism',
        'Asthma attack',
        'Caffeine toxicity',
        'Hypoglycaemia'
      ],
      mostLikelyDiagnosis: 'Hyperventilation syndrome secondary to acute stress response',
      supportingEvidence: [
        'SpO2 100% with clear lungs (not hypoxic)',
        'Bilateral tingling and carpopedal spasm (respiratory alkalosis)',
        'Clear precipitant (exam stress)',
        'Caffeine intake and fasting',
        'No history of respiratory disease',
        'Normal chest examination'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety, move to quiet area',
        'Introduction, calm reassurance',
        'Rule out serious causes: SpO2, chest auscultation, symmetry',
        'Check blood glucose (fasting)',
        'Breathing coaching: "Breathe in for 4, hold for 2, out for 6"'
      ],
      definitive: [
        'Continue breathing coaching until rate normalises',
        'If symptoms resolve fully: safety-net advice, encourage GP follow-up',
        'If symptoms persist or concern remains: transport to ED',
        'Advise about eating, hydration, and caffeine reduction'
      ],
      monitoring: [
        'Respiratory rate trending down',
        'Heart rate normalising',
        'Resolution of tingling and carpopedal spasm',
        'SpO2 monitoring'
      ]
    },
    studentChecklist: [
      { id: 'y1-012-scene', category: 'safety', description: 'Scene safety, create calm environment', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-012-intro', category: 'communication', description: 'Calm introduction, reassuring manner', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-012-spo2', category: 'abcde', description: 'Check SpO2 (key: should be 99-100% in hyperventilation)', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-012-chest', category: 'abcde', description: 'Auscultate chest - rule out wheeze, reduced air entry', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-012-equal', category: 'abcde', description: 'Check for symmetry (unilateral = concern)', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-012-glucose', category: 'abcde', description: 'Check blood glucose (patient fasting)', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-012-vitals', category: 'abcde', description: 'Full vital signs', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-012-rule-out', category: 'abcde', description: 'Systematically rule out PE, pneumothorax, asthma', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-012-breathing-coach', category: 'intervention', description: 'Breathing coaching: slow, controlled technique', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-012-hx', category: 'history', description: 'History: respiratory disease, triggers, caffeine intake', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-012-sample', category: 'history', description: 'SAMPLE history', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-012-document', category: 'documentation', description: 'Document assessment, SpO2, and response to treatment', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'SpO2 of 100% in a "short of breath" patient is a key indicator of hyperventilation, not hypoxia',
      'Always rule out serious causes before assuming hyperventilation: PE, pneumothorax, asthma',
      'Bilateral tingling is reassuring (respiratory alkalosis); unilateral symptoms are concerning',
      'Do NOT use a paper bag for rebreathing - outdated and potentially dangerous',
      'Breathing coaching is the primary treatment: slow, controlled, diaphragmatic breathing',
      'Caffeine, fasting, and sleep deprivation lower the threshold for anxiety episodes',
      'Hyperventilation is a diagnosis of exclusion - document your reasoning'
    ],
    commonPitfalls: [
      'Assuming hyperventilation without ruling out serious causes',
      'Using a paper bag for rebreathing (outdated, potentially dangerous)',
      'Not checking SpO2 (the key discriminating finding)',
      'Not auscultating the chest',
      'Dismissing the patient - hyperventilation is distressing and real',
      'Not checking blood glucose in a fasting patient',
      'Ignoring caffeine intake as a contributing factor'
    ],
    references: [
      'Respiratory Emergencies - Hyperventilation Syndrome',
      'Differential Diagnosis of Dyspnoea',
      'Breathing Coaching Techniques'
    ]
  }),

  // Case 13: Basic Cardiac 2 - Palpitations
  createCase({
    id: 'y1-013',
    title: 'Middle-Aged Adult - Palpitations',
    category: 'cardiac',
    subcategory: 'sinus-tachycardia',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', 'diploma'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: '45-year-old male, heart racing, anxious',
      timeOfDay: 'evening',
      location: 'Office building',
      callerInfo: 'Patient (from desk phone)',
      dispatchCode: 'Bravo'
    },
    patientInfo: {
      age: 45,
      gender: 'male',
      weight: 88,
      language: 'English',
      culturalConsiderations: ['Professional environment', 'Working late, stressed about deadlines']
    },
    sceneInfo: {
      description: 'Private office, patient sitting at desk, looks uncomfortable',
      hazards: ['None identified'],
      bystanders: 'Security guard who let ambulance in',
      environment: 'Air-conditioned office, quiet evening',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/office-medical-dubai.png',
      sceneImageCaption: 'Scene — Air-conditioned office, quiet evening',
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male at desk, alert, anxious, hand on chest feeling pulse',
      position: 'Sitting in office chair',
      appearance: 'Anxious, mildly flushed, no acute distress',
      consciousness: 'Alert, oriented, anxious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking full sentences'],
        interventions: []
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Normal respiratory rate', 'Clear lung sounds bilaterally', 'No orthopnea'],
        interventions: []
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Regular, strong',
        bp: { systolic: 140, diastolic: 88 },
        capillaryRefill: 2,
        skin: 'Warm, mildly flushed, dry',
        findings: ['Regular tachycardia ~110 bpm', 'No irregularity detected on palpation', 'BP mildly elevated', 'Good peripheral perfusion', 'No peripheral oedema'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        findings: ['Alert and oriented', 'Anxious', 'No dizziness or lightheadedness', 'No syncope or near-syncope'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['No oedema', 'No rash', 'Slightly overweight', 'No JVD'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['No JVD', 'No thyroid enlargement palpable'],
      chest: ['Clear bilaterally', 'Heart sounds: regular, no murmurs appreciated', 'No chest wall tenderness'],
      abdomen: ['Soft, non-tender', 'Mild central obesity'],
      pelvis: ['Normal'],
      extremities: ['No peripheral oedema', 'Peripheral pulses present and equal', 'No calf tenderness'],
      posterior: ['Normal'],
      neurological: ['Alert, oriented', 'No focal deficits']
    },
    history: {
      medications: [
        { name: 'Losartan', dose: '50mg', frequency: 'Daily', indication: 'Hypertension' },
        { name: 'Atorvastatin', dose: '20mg', frequency: 'Daily', indication: 'Cholesterol' }
      ],
      allergies: ['No known allergies'],
      medicalConditions: ['Hypertension (diagnosed 3 years ago)', 'Hypercholesterolaemia'],
      surgicalHistory: ['Appendectomy age 20'],
      lastMeal: 'Late lunch 5 hours ago, several coffees since',
      eventsLeading: 'Working late on deadline. Multiple coffees today (estimates 5-6 cups). Noticed heart racing about 30 minutes ago. Initially tried to ignore it. No chest pain, no shortness of breath, no dizziness, no syncope. Has had occasional brief palpitations before (seconds) but never this sustained. No exercise or exertion at onset.',
      socialHistory: {
        smoking: 'Ex-smoker (quit 5 years ago, 10/day for 15 years)',
        alcohol: 'Social - 2-3 drinks on weekends',
        occupation: 'Project manager',
        livingSituation: 'Lives with wife and two children'
      },
      previousSimilarEpisodes: ['Brief palpitations lasting seconds, 2-3 times in past year, self-resolving']
    },
    vitalSignsProgression: {
      initial: { bp: '140/88', pulse: 110, respiration: 18, spo2: 98, gcs: 15 },
      afterIntervention: { bp: '130/80', pulse: 82, respiration: 16, spo2: 99, gcs: 15 },
      deterioration: { bp: '95/60', pulse: 160, respiration: 24, spo2: 95, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: [
        'Regular tachycardia at ~110 bpm',
        'No chest pain, no syncope, no dyspnoea',
        'Haemodynamically stable (BP adequate, well-perfused)',
        'Known hypertension on medication',
        'Excessive caffeine intake today',
        'Stressful work situation'
      ],
      redFlags: [
        'Chest pain (ACS)',
        'Syncope or near-syncope (haemodynamic compromise)',
        'Irregular pulse (atrial fibrillation)',
        'Very fast rate >150 (SVT or other tachyarrhythmia)',
        'Signs of heart failure (oedema, JVD, crackles)',
        'Hypotension with tachycardia'
      ],
      differentialDiagnoses: [
        'Sinus tachycardia (stress, caffeine)',
        'Supraventricular tachycardia (SVT)',
        'Atrial fibrillation/flutter',
        'Anxiety-driven tachycardia',
        'Thyrotoxicosis',
        'Caffeine excess'
      ],
      mostLikelyDiagnosis: 'Sinus tachycardia likely secondary to caffeine excess and stress',
      supportingEvidence: [
        'Regular rhythm (not irregular)',
        'Rate 110 bpm (within sinus range)',
        'Clear precipitants (caffeine, stress)',
        'Haemodynamically stable',
        'No red flag symptoms',
        'Previous brief self-resolving episodes'
      ]
    },
    managementPathway: {
      immediate: [
        'Introduction and consent',
        'Full vital signs',
        'Assess pulse: rate, rhythm, regularity',
        'History: chest pain, syncope, dyspnoea (red flags)',
        'SAMPLE history with cardiac focus',
        'ECG if available'
      ],
      definitive: [
        'Vagal manoeuvres if appropriate (Valsalva, carotid sinus massage)',
        'Calm reassurance',
        'Reduce stimulant intake (advise re caffeine)',
        'Transport to ED for ECG and monitoring',
        'Position of comfort'
      ],
      monitoring: [
        'Continuous pulse rate and rhythm',
        'Blood pressure monitoring',
        'SpO2 monitoring',
        'Watch for deterioration: chest pain, syncope, hypotension'
      ]
    },
    studentChecklist: [
      { id: 'y1-013-scene', category: 'safety', description: 'Scene safety', points: 2, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-013-intro', category: 'communication', description: 'Introduction and reassurance', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-013-pulse', category: 'abcde', description: 'Assess pulse: rate, rhythm, regularity', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Distinguishing regular from irregular tachycardia guides management' },
      { id: 'y1-013-red-flags', category: 'history', description: 'Ask about cardiac red flags: chest pain, syncope, dyspnoea', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-013-vitals', category: 'abcde', description: 'Full vital signs including BP', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-013-sample', category: 'history', description: 'SAMPLE history with cardiac and medication focus', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-013-cardiac-hx', category: 'history', description: 'Cardiac history: previous episodes, family history', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-013-caffeine', category: 'history', description: 'Ask about stimulant intake (caffeine, energy drinks)', points: 2, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-013-chest', category: 'abcde', description: 'Chest auscultation: heart sounds and lung fields', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-013-jvd', category: 'abcde', description: 'Check JVD and peripheral oedema', points: 2, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-013-vagal', category: 'intervention', description: 'Consider vagal manoeuvres (Valsalva)', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-013-reassure', category: 'communication', description: 'Reassure patient and explain findings', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-013-document', category: 'documentation', description: 'Document pulse characteristics, red flag screen, and assessment', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'Always assess pulse for rate, rhythm, and regularity - this guides differential',
      'Regular tachycardia: sinus, SVT, atrial flutter. Irregular: AF, ectopics',
      'Screen for cardiac red flags: chest pain, syncope, dyspnoea, and haemodynamic instability',
      'Sinus tachycardia usually has a cause: pain, fever, anxiety, caffeine, dehydration',
      'Vagal manoeuvres (Valsalva, bearing down) can terminate SVT but not sinus tachycardia',
      'ECG is the definitive tool for rhythm identification - transport for this if in doubt',
      'Stable palpitations (no red flags) are managed differently from unstable tachycardia'
    ],
    commonPitfalls: [
      'Not assessing pulse regularity (regular vs irregular is critical)',
      'Not asking about syncope and chest pain (red flags)',
      'Assuming palpitations are always benign',
      'Not checking blood pressure (need to confirm haemodynamic stability)',
      'Forgetting caffeine and stimulant history',
      'Not considering thyrotoxicosis in differential',
      'Performing carotid sinus massage without listening for bruits first'
    ],
    references: [
      'Cardiac Emergencies - Tachycardia Assessment',
      'Vagal Manoeuvres - Indications and Technique',
      'Pre-hospital Arrhythmia Recognition - EMT Fundamentals'
    ]
  }),

  // Case 14: Witnessed Cardiac Arrest - BLS focus for 1st year
  createCase({
    id: 'y1-014',
    title: 'Witnessed Cardiac Arrest - Shopping Mall',
    category: 'cardiac',
    subcategory: 'cardiac-arrest',
    // Witnessed OHCA in an adult — VF is the expected initial rhythm.
    initialRhythm: 'Ventricular Fibrillation',
    priority: 'critical',
    complexity: 'basic',
    yearLevels: ['1st-year', 'diploma'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: '55-year-old male collapsed in shopping mall food court, bystander CPR in progress',
      timeOfDay: 'afternoon',
      location: 'Mall of the Emirates, Dubai',
      callerInfo: 'Security guard (trained first aider, performing CPR)',
      dispatchCode: 'Echo'
    },
    patientInfo: {
      age: 55,
      gender: 'male',
      weight: 85,
      language: 'English',
      culturalConsiderations: ['Public setting - manage crowd', 'Maintain patient dignity in public area']
    },
    sceneInfo: {
      description: 'Food court area of shopping mall, patient supine on floor, security guard performing CPR, AED retrieved from wall mount nearby',
      hazards: ['Crowd of onlookers', 'Wet floor near food court', 'Limited space between tables'],
      bystanders: 'Security guard performing CPR, multiple bystanders watching, mall staff managing crowd',
      environment: 'Air-conditioned mall, well-lit food court area',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/cardiac-arrest-mall-male-dubai.png',
      sceneImageCaption: 'Scene — Air-conditioned mall, well-lit food court area',
    },
    initialPresentation: {
      generalImpression: 'Adult male supine on floor, unresponsive, security guard performing chest compressions',
      position: 'Supine on hard floor',
      appearance: 'Cyanotic, no signs of life, no spontaneous movement',
      consciousness: 'Unresponsive - no response to any stimulus'
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Unresponsive', 'No gag reflex', 'Airway unprotected', 'Needs OPA and BVM'],
        interventions: ['Head tilt chin lift', 'OPA insertion (size by measuring corner of mouth to angle of jaw)', 'BVM ventilation']
      },
      breathing: {
        rate: 0,
        rhythm: 'Absent',
        depth: 'Absent',
        spo2: 0,
        findings: ['Apnoeic', 'No chest rise', 'No breath sounds', 'Requires BVM ventilation'],
        interventions: ['BVM ventilation - 2 breaths every 30 compressions', 'Ensure visible chest rise with each ventilation']
      },
      circulation: {
        pulseRate: 0,
        pulseQuality: 'Absent - pulseless',
        bp: { systolic: 0, diastolic: 0 },
        capillaryRefill: 0,
        skin: 'Cyanotic, cool, mottled',
        findings: ['No carotid pulse', 'No signs of life', 'Bystander CPR in progress'],
        interventions: ['Take over CPR', 'High-quality compressions 30:2 at 100-120/min', 'Apply AED', 'Shock if advised', 'Rotate compressors every 2 minutes']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 1, total: 3 },
        pupils: 'Fixed and dilated bilaterally',
        findings: ['GCS 3 (E1V1M1)', 'Pupils fixed and dilated', 'No response to stimuli'],
        interventions: ['Continue resuscitation', 'Reassess pupils after ROSC']
      },
      exposure: {
        temperature: 36.2,
        findings: ['No obvious trauma', 'No medical alert bracelet', 'No obvious needle marks or medication patches'],
        interventions: ['Expose chest for AED pad placement', 'Check for medication patches before AED', 'Maintain dignity with crowd management']
      }
    },
    history: {
      medications: [
        { name: 'Unknown', dose: 'Unknown', frequency: 'Unknown', indication: 'Unknown - patient unresponsive, no family present' }
      ],
      allergies: ['Unknown - patient unresponsive'],
      medicalConditions: ['Unknown - gather from family/bystanders if possible'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Was eating at food court when collapsed',
      eventsLeading: 'Patient was eating lunch at food court, suddenly clutched his chest, slumped forward, then fell to the floor. Security guard witnessed collapse, confirmed unresponsive and not breathing, started CPR within 2 minutes. Another staff member retrieved AED from wall mount.',
      socialHistory: {
        smoking: 'Unknown',
        alcohol: 'Unknown',
        occupation: 'Unknown',
        livingSituation: 'Unknown'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '0/0', pulse: 0, respiration: 0, spo2: 0, gcs: 3 },
      afterIntervention: { bp: '90/60', pulse: 100, respiration: 12, spo2: 94, gcs: 6 },
      deterioration: { bp: '0/0', pulse: 0, respiration: 0, spo2: 0, gcs: 3 }
    },
    expectedFindings: {
      keyObservations: [
        'Witnessed cardiac arrest with bystander CPR in progress',
        'AED available on scene',
        'No signs of life',
        'Collapsed while eating - possible cardiac cause'
      ],
      redFlags: [
        'Cardiac arrest - immediate life threat',
        'Unknown medical history',
        'Possible choking vs cardiac arrest (collapsed while eating)',
        'Re-arrest after initial ROSC'
      ],
      differentialDiagnoses: [
        'Sudden cardiac arrest (VF/VT)',
        'Massive myocardial infarction',
        'Foreign body airway obstruction (was eating)',
        'Pulmonary embolism',
        'Aortic dissection/rupture'
      ],
      mostLikelyDiagnosis: 'Sudden cardiac arrest - presumed cardiac cause (witnessed collapse, clutched chest)',
      supportingEvidence: [
        'Witnessed sudden collapse',
        'Clutched chest before collapse (cardiac symptom)',
        'Age 55 male (high risk demographic)',
        'No signs of choking prior to collapse',
        'Was eating (not exerting) - suggests cardiac event'
      ]
    },
    managementPathway: {
      immediate: [
        'Confirm cardiac arrest: unresponsive + not breathing normally + no pulse',
        'Take over CPR from bystander - assess CPR quality',
        'Ensure patient is on a firm surface (AHA 2025: optimize hand position, body position, patient positioning)',
        'Apply AED immediately - shock if advised',
        'High-quality CPR: 30:2 with breaths (AHA 2025 recommends ventilations with compressions), rate 100-120/min, depth 5-6cm, full recoil',
        'Insert OPA and ventilate with BVM',
        'Minimise interruptions to compressions (<10 seconds for rhythm check)'
      ],
      definitive: [
        'Continue CPR cycles (2 minutes between rhythm checks)',
        'Rotate compressors every 2 minutes to maintain quality',
        'Handover to ALS team when they arrive',
        'If ROSC: recovery position, monitor closely, prepare for re-arrest',
        'Provide detailed handover: arrest time, bystander CPR, shocks delivered, any ROSC'
      ],
      monitoring: [
        'CPR quality: rate, depth, recoil, minimising interruptions',
        'AED rhythm analysis every 2 minutes',
        'Signs of ROSC: spontaneous breathing, movement, pulse',
        'If ROSC: continuous pulse, BP, SpO2, GCS monitoring',
        'Watch for re-arrest after ROSC'
      ]
    },
    studentChecklist: [
      { id: 'y1-014-scene', category: 'safety', description: 'Scene safety and BSI', points: 2, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-014-confirm', category: 'abcde', description: 'Confirm cardiac arrest (danger, response, send for help, no breathing, no pulse)', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Systematic confirmation prevents starting CPR on a breathing patient' },
      { id: 'y1-014-cpr-start', category: 'intervention', description: 'Start/take over CPR within 10 seconds of confirming arrest', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Every second without compressions reduces survival' },
      { id: 'y1-014-aed', category: 'intervention', description: 'Apply AED within 2 minutes, deliver shock if advised', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Early defibrillation is the single most important intervention in VF/VT arrest' },
      { id: 'y1-014-quality', category: 'intervention', description: 'High-quality compressions: rate 100-120/min, depth 5-6cm, full recoil', points: 5, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Poor quality CPR significantly reduces survival' },
      { id: 'y1-014-bvm', category: 'intervention', description: 'Effective BVM ventilation with visible chest rise', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Adequate ventilation is essential for oxygenation during CPR' },
      { id: 'y1-014-interruptions', category: 'intervention', description: 'Minimise interruptions to compressions (<10 seconds for rhythm check)', points: 4, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Pauses in compressions allow coronary perfusion pressure to drop' },
      { id: 'y1-014-rotate', category: 'intervention', description: 'Rotate compressors every 2 minutes', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Compressor fatigue degrades CPR quality after 2 minutes' },
      { id: 'y1-014-opa', category: 'intervention', description: 'OPA sizing and insertion', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-014-rosc', category: 'abcde', description: 'Recognise signs of ROSC and manage accordingly', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-014-handover', category: 'communication', description: 'Structured handover to ALS team (arrest time, CPR details, shocks, ROSC)', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-014-document', category: 'documentation', description: 'Document arrest time, CPR timeline, shocks delivered, and outcomes', points: 3, yearLevel: ['1st-year', 'diploma'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'Confirm cardiac arrest: unresponsive + not breathing normally + no pulse (take no more than 10 seconds)',
      'High-quality CPR saves lives: 30:2 ratio, rate 100-120/min, depth 5-6cm, full recoil, minimise interruptions. AHA 2025 emphasizes CPR on a firm surface, optimizing hand position, body position, and patient positioning',
      'AHA 2025: Breaths WITH compressions (30:2) recommended for both HCPs and lay rescuers who are willing and capable',
      'AHA 2025: Single unified Chain of Survival for all ages and settings (replaces separate IHCA/OHCA chains)',
      'Early defibrillation: AED application, shock if advised, resume CPR immediately after shock',
      'Airway adjuncts: OPA sizing (corner of mouth to angle of jaw) and insertion',
      'BVM ventilation: 2 ventilations every 30 compressions, watch for chest rise',
      'Team CPR: rotate compressors every 2 minutes to maintain compression quality',
      'AHA 2025: Children aged 12+ can be taught to perform effective CPR',
      'Handover to advanced care team: provide arrest time, CPR duration, number of shocks, any ROSC'
    ],
    commonPitfalls: [
      'Delaying CPR to perform a full assessment - start compressions immediately',
      'Poor compression depth or rate - practice with feedback devices',
      'Excessive ventilation causing gastric insufflation - gentle breaths with visible chest rise only',
      'Long pauses for rhythm checks - keep interruptions under 10 seconds',
      'Not rotating compressors - fatigue leads to poor quality CPR after 2 minutes',
      'Forgetting to tilt head for airway before ventilating',
      'Not using OPA with BVM - tongue is the most common airway obstruction in unconscious patients'
    ],
    references: [
      'Basic Life Support - AHA 2025 Guidelines for CPR and ECC',
      'AED Use in Public Access Defibrillation',
      'High-Quality CPR - Pre-hospital BLS Standards (AHA 2025 update)'
    ]
  }),

  // Case 15: Severe Allergic Reaction (Anaphylaxis) — Restaurant
  createCase({
    id: 'y1-015',
    title: 'Severe Allergic Reaction — Restaurant',
    category: 'respiratory',
    subcategory: 'anaphylaxis',
    priority: 'critical',
    complexity: 'basic',
    yearLevels: ['1st-year', '2nd-year', 'diploma'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: '32-year-old female difficulty breathing after eating at restaurant, swollen face',
      timeOfDay: 'evening',
      location: 'Seafood restaurant, Al Maryah Island, Abu Dhabi',
      callerInfo: 'Restaurant manager (anxious)',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient ate prawns', 'Face and throat swelling', 'Rash visible']
    },
    patientInfo: {
      age: 32,
      gender: 'female',
      weight: 65,
      occupation: 'Marketing executive',
      language: 'English',
      culturalConsiderations: ['Female patient — offer same-gender provider if available']
    },
    sceneInfo: {
      description: 'Busy restaurant, patient seated at table, other diners watching',
      hazards: ['Crowded environment', 'Limited space around table'],
      bystanders: 'Partner and restaurant staff present, other diners observing',
      environment: 'Air-conditioned restaurant, allergen exposure from prawns',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/restaurant-anaphylaxis-female-abu-dhabi.png',
      sceneImageCaption: 'Scene — Air-conditioned restaurant, allergen exposure from prawns',
    },
    initialPresentation: {
      generalImpression: 'Young female, visibly distressed, urticarial rash on face and arms, audible wheeze',
      position: 'Sitting upright, leaning forward',
      appearance: 'Flushed, swollen lips and eyes, raised red welts on arms and torso',
      consciousness: 'Alert, anxious, speaking in short sentences',
      sounds: ['Audible wheeze', 'Hoarse voice']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but threatened', 'Swollen lips and tongue', 'Hoarse voice', 'Reports throat tightness', 'No stridor yet'],
        interventions: ['Monitor closely for deterioration', 'Prepare suction', 'IM Adrenaline 0.5mg (anterolateral thigh)']
      },
      breathing: {
        rate: 28,
        rhythm: 'Labored',
        depth: 'Shallow',
        spo2: 93,
        findings: ['Tachypnea', 'Audible expiratory wheeze', 'Mild accessory muscle use', 'Bilateral wheeze on auscultation'],
        interventions: ['High-flow oxygen 15L/min via non-rebreather mask'],
        auscultation: ['Bilateral widespread wheeze', 'Reduced air entry bilaterally']
      },
      circulation: {
        pulseRate: 125,
        pulseQuality: 'Rapid, thready',
        bp: { systolic: 85, diastolic: 50 },
        capillaryRefill: 4,
        skin: 'Flushed, warm, widespread urticarial rash',
        findings: ['Tachycardia', 'Hypotension', 'Prolonged cap refill', 'Distributive shock'],
        interventions: ['Elevate legs (if no respiratory distress worsening)', 'IV access if competent', 'IV fluid bolus 500ml-1L normal saline']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive to light',
        bloodGlucose: 6.2,
        findings: ['Alert and oriented', 'Anxious but cooperative'],
        interventions: ['Reassurance']
      },
      exposure: {
        temperature: 37.1,
        findings: ['Widespread urticarial rash (raised red welts) on face, arms, torso', 'Angioedema of lips and periorbital area', 'No rash on legs'],
        interventions: ['Full exposure to assess extent of rash', 'Maintain dignity — use blanket screening']
      }
    },
    secondarySurvey: {
      head: ['Periorbital angioedema bilaterally', 'Lip swelling', 'Tongue mildly swollen'],
      neck: ['Trachea central', 'No lymphadenopathy', 'Patient reports throat tightness'],
      chest: ['Bilateral wheeze', 'No crackles', 'Equal air entry (reduced)'],
      abdomen: ['Soft', 'Mild nausea', 'No vomiting yet'],
      pelvis: ['Normal'],
      extremities: ['Urticarial rash on arms', 'Warm peripheries', 'Cap refill 4 seconds', 'No peripheral oedema'],
      posterior: ['Rash extending to upper back'],
      neurological: ['Alert', 'Oriented', 'Anxious']
    },
    history: {
      medications: [
        { name: 'EpiPen (auto-injector)', dose: '0.3mg', frequency: 'PRN', indication: 'Anaphylaxis — left at home today' },
        { name: 'Cetirizine', dose: '10mg', frequency: 'Daily', indication: 'Allergies' }
      ],
      allergies: ['Shellfish (known severe allergy)', 'Penicillin (mild rash)'],
      medicalConditions: ['Shellfish allergy diagnosed age 12', 'Previous anaphylaxis to crab aged 18 (required A&E treatment)', 'Asthma (mild, well-controlled)'],
      surgicalHistory: [],
      lastMeal: 'Prawn dish at restaurant 15 minutes ago — did not realise dish contained prawns',
      eventsLeading: 'Ordered a salad at restaurant, unaware it contained prawns. Within 10 minutes developed tingling lips, then rapid onset of facial swelling, rash, and difficulty breathing. EpiPen was left at home.'
    },
    vitalSignsProgression: {
      initial: { bp: '85/50', pulse: 125, respiration: 28, spo2: 93, gcs: 15, bloodGlucose: 6.2 },
      afterIntervention: { bp: '110/70', pulse: 100, respiration: 18, spo2: 97, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'Classic anaphylaxis triad: skin (urticaria/angioedema), respiratory (wheeze/stridor), cardiovascular (hypotension/tachycardia)',
        'Known shellfish allergy with previous anaphylaxis',
        'Rapid onset after allergen ingestion',
        'EpiPen not available — requires IM adrenaline from drug kit'
      ],
      redFlags: [
        'Airway swelling (angioedema, hoarse voice) — may progress to complete obstruction',
        'Hypotension (BP 85/50) — anaphylactic shock',
        'Previous severe reaction — high risk of severe recurrence',
        'Stridor if develops = critical airway compromise'
      ],
      differentialDiagnoses: [
        'Anaphylaxis (most likely)',
        'Severe allergic reaction without anaphylaxis',
        'Angioedema (hereditary or ACE-inhibitor related)',
        'Acute asthma exacerbation',
        'Vasovagal episode',
        'Panic attack'
      ],
      mostLikelyDiagnosis: 'Anaphylaxis secondary to shellfish (prawn) ingestion',
      supportingEvidence: [
        'Known shellfish allergy with previous anaphylaxis',
        'Ingestion of prawns 15 minutes prior',
        'Multi-system involvement: skin + respiratory + cardiovascular',
        'Rapid onset consistent with IgE-mediated reaction',
        'Hypotension confirms anaphylaxis (not just allergic reaction)'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety and BSI',
        'Remove allergen exposure (move patient away from food)',
        'Call for help early',
        'IM Adrenaline 0.5mg (500mcg) into anterolateral thigh — THIS IS THE PRIORITY',
        'High-flow oxygen 15L/min via non-rebreather mask',
        'Lay patient flat with legs elevated (if tolerated — may need to sit up if severe wheeze)',
        'Monitor airway continuously for deterioration'
      ],
      definitive: [
        'Reassess after 5 minutes — repeat IM adrenaline if no improvement',
        'IV access and IV fluid bolus (500ml-1L normal saline)',
        'Transport to hospital — all anaphylaxis patients need observation (biphasic risk)',
        'Antihistamine (chlorphenamine 10mg IM) — adjunct only, NOT a substitute for adrenaline',
        'Hydrocortisone 200mg IV — prevents biphasic reaction (takes hours to work)',
        'Minimum 6-hour observation in hospital post-anaphylaxis'
      ],
      monitoring: [
        'Continuous airway assessment — listen for stridor development',
        'SpO2 continuous monitoring',
        'Blood pressure every 2-3 minutes initially',
        'Heart rate and rhythm',
        'Respiratory rate and work of breathing',
        'Level of consciousness',
        'Rash progression or resolution',
        'Watch for biphasic reaction (can occur up to 72 hours later)'
      ],
      transportConsiderations: [
        'Pre-alert hospital: anaphylaxis, adrenaline given, vital signs',
        'Transport with ongoing monitoring',
        'Have second dose of adrenaline ready',
        'Position: flat with legs elevated OR sitting up if respiratory distress predominates',
        'Rapid transport — do not delay on scene'
      ]
    },
    studentChecklist: [
      { id: 'y1-015-scene', category: 'safety', description: 'Scene safety and BSI', points: 2, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-015-recognise', category: 'abcde', description: 'Recognise anaphylaxis: skin + airway/breathing + circulation involvement', points: 5, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Anaphylaxis requires multi-system involvement — skin alone is allergic reaction, not anaphylaxis' },
      { id: 'y1-015-adrenaline', category: 'intervention', description: 'Administer IM adrenaline 0.5mg (anterolateral thigh) promptly', points: 10, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'IM adrenaline is the ONLY life-saving treatment in anaphylaxis — delays cost lives' },
      { id: 'y1-015-oxygen', category: 'intervention', description: 'High-flow oxygen 15L/min via non-rebreather', points: 4, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-015-position', category: 'intervention', description: 'Appropriate positioning — flat with legs elevated (or sitting if respiratory distress)', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Laying flat improves venous return in distributive shock — but respiratory distress may require sitting' },
      { id: 'y1-015-help', category: 'communication', description: 'Call for help / backup early', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-015-abcde', category: 'abcde', description: 'Systematic ABCDE assessment', points: 4, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true },
      { id: 'y1-015-vitals', category: 'abcde', description: 'Full vital signs including BP', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-015-history', category: 'history', description: 'Allergy history: known allergens, previous reactions, EpiPen availability', points: 4, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-015-sample', category: 'history', description: 'SAMPLE history', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-015-reassess', category: 'abcde', description: 'Reassess after adrenaline — repeat at 5 minutes if no improvement', points: 4, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'], critical: true, rationale: 'Adrenaline may need repeating — always reassess response' },
      { id: 'y1-015-fluids', category: 'intervention', description: 'IV access and fluid bolus if trained', points: 3, yearLevel: ['2nd-year'], complexity: ['basic'] },
      { id: 'y1-015-monitor', category: 'abcde', description: 'Continuous monitoring of airway, breathing, and circulation', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-015-transport', category: 'communication', description: 'Pre-alert hospital and rapid transport', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'y1-015-document', category: 'documentation', description: 'Document allergen, time of exposure, time of adrenaline, response', points: 3, yearLevel: ['1st-year', '2nd-year', 'diploma'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'Anaphylaxis = acute multi-system allergic reaction involving airway/breathing AND/OR circulation — skin signs alone are NOT anaphylaxis',
      'IM adrenaline (0.5mg / 500mcg for adults) is the ONLY first-line life-saving treatment — give it IMMEDIATELY',
      'Inject into the anterolateral thigh (vastus lateralis) — NOT the deltoid, NOT subcutaneously',
      'Adrenaline works within minutes: vasoconstriction (raises BP), bronchodilation (relieves wheeze), reduces oedema',
      'Can repeat IM adrenaline every 5 minutes if no improvement — there is no maximum dose in anaphylaxis',
      'Antihistamines (chlorphenamine) treat itch and urticaria only — they do NOT treat airway or cardiovascular collapse',
      'Positioning matters: flat + legs up for shock; sitting up if respiratory distress predominates',
      'ALL anaphylaxis patients MUST go to hospital — risk of biphasic reaction (recurrence hours later)',
      'Common triggers in UAE: shellfish, nuts, bee/wasp stings, medications (antibiotics, NSAIDs)',
      'Always ask: has the patient used their EpiPen? Do they have one? (This patient left it at home)',
      'Anaphylaxis vs allergic reaction: if any airway compromise, breathing difficulty, or hypotension → it is anaphylaxis'
    ],
    commonPitfalls: [
      'DELAYING adrenaline — this is the #1 error. Give adrenaline FIRST, not antihistamines',
      'Giving antihistamines instead of adrenaline — antihistamines do NOT treat anaphylaxis',
      'Wrong route: giving adrenaline IV instead of IM (IV adrenaline can cause fatal arrhythmias in non-arrest patients)',
      'Wrong site: injecting into deltoid or buttock instead of anterolateral thigh',
      'Not repeating adrenaline if first dose does not work within 5 minutes',
      'Standing the patient up — this can cause cardiac arrest in anaphylaxis (empty ventricle syndrome)',
      'Not monitoring the airway — angioedema can progress to complete airway obstruction',
      'Forgetting to remove the allergen (move patient away from the prawns)',
      'Not transporting to hospital — biphasic reactions can be fatal',
      'Confusing anaphylaxis with panic attack — always check for skin signs, wheeze, and hypotension'
    ],
    references: [
      'Resuscitation Council UK — Anaphylaxis Guidelines 2021',
      'AANZCA Anaphylaxis Management',
      'WHO Anaphylaxis Recognition and Treatment',
      'UK NICE Anaphylaxis Guidelines (CG134)',
      'Pre-hospital Anaphylaxis Management — JRCALC'
    ]
  }),

  // ==========================================================================
  // LEVEL-BANDED EXPANSION (W3) — diploma / 1st / 2nd year single-system
  // classics. Each routes to an existing treatment protocol via subcategory
  // and its afterIntervention target sits at the physiology engine's reachable
  // endpoint so the clinical-regression audit stays clean.
  // ==========================================================================

  // y1-016: Acute ischaemic stroke — FAST-positive recognition (neurological)
  createCase({
    id: 'y1-016',
    title: 'Elderly Male - Sudden Facial Droop and Arm Weakness',
    category: 'neurological',
    subcategory: 'stroke',
    priority: 'high',
    complexity: 'basic',
    yearLevels: ['diploma', '1st-year', '2nd-year'],
    estimatedDuration: 18,
    dispatchInfo: {
      callReason: '68-year-old male, sudden weakness one side, slurred speech',
      timeOfDay: 'morning',
      location: 'Villa in Sharjah',
      callerInfo: 'Wife (calm but worried)',
      dispatchCode: 'Charlie-1'
    },
    patientInfo: {
      age: 68,
      gender: 'male',
      weight: 84,
      occupation: 'Retired civil servant',
      language: 'Arabic',
      culturalConsiderations: ['Emirati family; extended family gathering', 'Explain time-critical transport clearly']
    },
    sceneInfo: {
      description: 'Ground-floor majlis, patient seated in armchair, family around him',
      hazards: ['None identified'],
      bystanders: 'Wife and adult son present',
      environment: 'Cool air-conditioned villa'
    },
    initialPresentation: {
      generalImpression: 'Elderly man alert but with an obvious right-sided facial droop and slurred speech',
      position: 'Seated upright in armchair',
      appearance: 'Alert, frustrated, unable to lift right arm',
      consciousness: 'Alert and oriented, speech dysarthric'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speech slurred but words intelligible', 'No pooling of secretions'],
        interventions: ['Monitor airway — risk rises if consciousness falls']
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['Breathing unlaboured', 'Good air entry bilaterally', 'Chest clear'],
        interventions: ['Oxygen only if SpO2 < 94%']
      },
      circulation: {
        pulseRate: 84,
        pulseQuality: 'Regular',
        bp: { systolic: 176, diastolic: 98 },
        capillaryRefill: 2,
        skin: 'Warm and dry',
        findings: ['Hypertensive', 'No signs of shock'],
        interventions: ['Do NOT actively lower BP prehospital']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        bloodGlucose: 6.2,
        pupils: 'Equal 3mm, reactive',
        findings: ['Right facial droop', 'Right arm drift', 'Dysarthria', 'No sensory neglect tested'],
        interventions: ['Blood glucose measured to exclude hypoglycaemic mimic']
      },
      exposure: {
        temperature: 36.7,
        findings: ['No incontinence', 'No injuries from any fall'],
        interventions: ['Maintain dignity and warmth']
      }
    },
    secondarySurvey: {
      head: ['Right facial droop', 'No trauma'],
      neck: ['Supple', 'No bruit auscultated'],
      chest: ['Clear bilaterally'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['Right arm 2/5 power', 'Right leg mild weakness 4/5', 'Left side normal'],
      posterior: ['No injuries'],
      neurological: ['FAST positive: Face, Arm, Speech', 'Onset witnessed 40 minutes ago']
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '10mg', frequency: 'Daily', indication: 'Hypertension' },
        { name: 'Atorvastatin', dose: '20mg', frequency: 'Nightly', indication: 'Cholesterol' }
      ],
      allergies: ['None known'],
      medicalConditions: ['Hypertension', 'Hyperlipidaemia'],
      surgicalHistory: [],
      lastMeal: 'Breakfast 1 hour ago',
      eventsLeading: 'Sudden onset while reading the newspaper — right arm dropped and speech slurred. Witnessed by wife, onset time known precisely.',
      socialHistory: { smoking: 'Ex-smoker (quit 10 years)', alcohol: 'None', occupation: 'Retired', livingSituation: 'Lives with wife' }
    },
    vitalSignsProgression: {
      initial: { bp: '176/98', pulse: 84, respiration: 18, spo2: 96, gcs: 15, bloodGlucose: 6.2 },
      afterIntervention: { bp: '170/94', pulse: 68, respiration: 14, spo2: 97, gcs: 15, bloodGlucose: 6.2 },
      deterioration: { bp: '198/112', pulse: 60, respiration: 12, spo2: 93, gcs: 11, bloodGlucose: 6.2 }
    },
    expectedFindings: {
      keyObservations: ['FAST positive', 'Precise onset time known', 'Hypertensive but not in extremis', 'Glucose normal — not a mimic'],
      redFlags: ['Falling GCS', 'Rising BP with bradycardia (Cushing)', 'New vomiting or headache', 'Loss of airway protection'],
      differentialDiagnoses: ['Acute ischaemic stroke', 'Intracerebral haemorrhage', 'Hypoglycaemia (excluded)', 'Todd\'s paresis / seizure', 'Bell\'s palsy (forehead spared here — not Bell\'s)'],
      mostLikelyDiagnosis: 'Acute ischaemic stroke (right MCA territory)',
      supportingEvidence: ['FAST positive', 'Sudden onset', 'Normal glucose', 'Unilateral weakness with forehead-sparing droop']
    },
    managementPathway: {
      immediate: [
        'Scene safety and BSI',
        'Confirm onset time — the single most important number',
        'FAST / positive limb assessment',
        'Measure blood glucose to exclude hypoglycaemic mimic',
        'Oxygen only if SpO2 < 94% (avoid routine hyperoxia)',
        'Keep patient NBM (nil by mouth) — aspiration and dysphagia risk'
      ],
      definitive: [
        'Pre-alert the stroke centre with onset time',
        'Rapid but gentle transport, head-neutral',
        'Do NOT give aspirin prehospital — haemorrhage not yet excluded on CT',
        'Do NOT actively lower blood pressure prehospital'
      ],
      monitoring: ['Repeat GCS and FAST en route', 'Monitor for deterioration / airway compromise', 'Recheck BP and glucose']
    },
    studentChecklist: [
      { id: 'y1-016-safety', category: 'safety', description: 'Scene safety and BSI', points: 4, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-016-fast', category: 'abcde', description: 'Perform FAST assessment (Face, Arm, Speech, Time)', points: 10, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true, rationale: 'FAST is the core prehospital stroke screen' },
      { id: 'y1-016-onset', category: 'history', description: 'Establish precise time of symptom onset / last known well', points: 10, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true, rationale: 'Onset time determines thrombolysis / thrombectomy eligibility' },
      { id: 'y1-016-glucose', category: 'abcde', description: 'Measure blood glucose to exclude a hypoglycaemic mimic', points: 6, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true, rationale: 'Hypoglycaemia mimics stroke and is instantly reversible' },
      { id: 'y1-016-o2', category: 'intervention', description: 'Titrate oxygen only to keep SpO2 94–98%', points: 4, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'] },
      { id: 'y1-016-nbm', category: 'intervention', description: 'Keep patient nil by mouth (swallow unsafe)', points: 4, yearLevel: ['1st-year', '2nd-year'], complexity: ['basic'] },
      { id: 'y1-016-prealert', category: 'communication', description: 'Pre-alert the stroke centre with onset time', points: 8, yearLevel: ['1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-016-noaspirin', category: 'clinical-reasoning', description: 'Recognise aspirin is withheld until haemorrhage excluded on CT', points: 6, yearLevel: ['2nd-year'], complexity: ['basic'], rationale: 'Antiplatelet before CT can be catastrophic in haemorrhagic stroke' },
      { id: 'y1-016-transport', category: 'intervention', description: 'Rapid gentle transport, reassess GCS/FAST en route', points: 5, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'FAST + precise onset time is the whole prehospital stroke job — everything else supports transport',
      'Always check glucose: hypoglycaemia is the great stroke mimic and is reversible in seconds',
      'Do not treat the blood pressure prehospital — permissive hypertension protects the penumbra',
      'Aspirin is NOT given until CT excludes haemorrhage',
      'Forehead-sparing droop points to a central (stroke) lesion; forehead involvement suggests Bell\'s palsy'
    ],
    commonPitfalls: [
      'Failing to establish onset time',
      'Giving aspirin prehospital',
      'Trying to lower the blood pressure',
      'Missing hypoglycaemia as a mimic',
      'Allowing oral intake with an unsafe swallow'
    ],
    references: ['UAE MOH Stroke Pathway', 'JRCALC Stroke Guideline', 'AHA/ASA Acute Ischaemic Stroke Guidelines']
  }),

  // y1-017: Self-terminating tonic-clonic seizure, post-ictal (neurological)
  createCase({
    id: 'y1-017',
    title: 'Young Adult - Witnessed Seizure, Now Post-Ictal',
    category: 'neurological',
    subcategory: 'seizure',
    priority: 'high',
    complexity: 'basic',
    yearLevels: ['diploma', '1st-year', '2nd-year'],
    estimatedDuration: 16,
    dispatchInfo: {
      callReason: '24-year-old male collapsed, shaking, now confused',
      timeOfDay: 'afternoon',
      location: 'Office building in Dubai',
      callerInfo: 'Colleague',
      dispatchCode: 'Charlie-1'
    },
    patientInfo: {
      age: 24,
      gender: 'male',
      weight: 78,
      occupation: 'Accountant',
      language: 'English',
      culturalConsiderations: ['Professional workplace — maintain privacy and dignity']
    },
    sceneInfo: {
      description: 'Open-plan office, patient on floor beside desk, colleagues cleared space',
      hazards: ['Desk corners nearby', 'Chair moved aside'],
      bystanders: 'Colleague witnessed the event',
      environment: 'Air-conditioned office',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/office-medical-dubai.png',
      sceneImageCaption: 'Scene — Air-conditioned office',
    },
    initialPresentation: {
      generalImpression: 'Young man on the floor, drowsy and confused, post-ictal',
      position: 'Supine, being rolled to recovery position',
      appearance: 'Drowsy, some oral trauma (bitten tongue), incontinent of urine',
      consciousness: 'Confused, responds to voice, gradually improving'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent once positioned', 'Some saliva — cleared', 'Tongue laceration noted'],
        interventions: ['Recovery position', 'Suction available if needed']
      },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 95,
        findings: ['Breathing spontaneously', 'No cyanosis'],
        interventions: ['Oxygen if SpO2 < 94%']
      },
      circulation: {
        pulseRate: 104,
        pulseQuality: 'Regular',
        bp: { systolic: 128, diastolic: 78 },
        capillaryRefill: 2,
        skin: 'Warm, flushed',
        findings: ['Post-ictal tachycardia'],
        interventions: ['Monitor']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 3, verbal: 4, motor: 5, total: 12 },
        bloodGlucose: 6.1,
        pupils: 'Equal 4mm, reactive',
        findings: ['Post-ictal confusion', 'No focal deficit', 'Gradually orienting'],
        interventions: ['Reassess GCS every few minutes — should improve']
      },
      exposure: {
        temperature: 37.2,
        findings: ['Urinary incontinence (typical of generalised seizure)', 'Bitten tongue'],
        interventions: ['Preserve dignity']
      }
    },
    secondarySurvey: {
      head: ['Tongue laceration', 'No external head trauma'],
      neck: ['No pain'],
      chest: ['Clear'],
      abdomen: ['Soft'],
      pelvis: ['Stable'],
      extremities: ['No injury from convulsion', 'Full movement returning'],
      posterior: ['No injury'],
      neurological: ['Post-ictal, no lateralising deficit', 'Witnessed generalised tonic-clonic ~90 seconds']
    },
    history: {
      medications: [{ name: 'Levetiracetam', dose: '500mg', frequency: 'Twice daily', indication: 'Epilepsy' }],
      allergies: ['None known'],
      medicalConditions: ['Known epilepsy (diagnosed age 19)'],
      surgicalHistory: [],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Admits missing his morning medication for two days due to a work deadline. Colleague saw him stiffen then convulse for about 90 seconds, followed by confusion.',
      socialHistory: { smoking: 'None', alcohol: 'Occasional', occupation: 'Accountant', livingSituation: 'Shares apartment with friends' }
    },
    vitalSignsProgression: {
      initial: { bp: '128/78', pulse: 104, respiration: 22, spo2: 95, gcs: 12, bloodGlucose: 6.1 },
      afterIntervention: { bp: '122/76', pulse: 90, respiration: 16, spo2: 99, gcs: 12, bloodGlucose: 6.1 },
      deterioration: { bp: '140/88', pulse: 132, respiration: 8, spo2: 88, gcs: 3, bloodGlucose: 6.1 }
    },
    expectedFindings: {
      keyObservations: ['Self-terminated seizure', 'Post-ictal state improving', 'Known epileptic with medication non-compliance', 'Glucose normal'],
      redFlags: ['Second seizure / no recovery between (status epilepticus)', 'Prolonged low GCS', 'Hypoxia during a recurrence', 'First-ever seizure would need different work-up'],
      differentialDiagnoses: ['Breakthrough epileptic seizure (missed medication)', 'Hypoglycaemic seizure (excluded)', 'Syncope with anoxic jerks', 'Intracranial event'],
      mostLikelyDiagnosis: 'Breakthrough generalised seizure due to missed anti-epileptic medication',
      supportingEvidence: ['Known epilepsy', 'Missed levetiracetam ×2 days', 'Witnessed generalised convulsion', 'Typical post-ictal state']
    },
    managementPathway: {
      immediate: [
        'Scene safety — protect from injury, do not restrain',
        'Recovery position and airway protection',
        'Time the seizure — treat as status if > 5 minutes or recurrent',
        'Blood glucose measurement',
        'Oxygen if hypoxic'
      ],
      definitive: [
        'Supportive care and reassurance during post-ictal recovery',
        'Transport for review (medication compliance, possible level change)',
        'Escalate to benzodiazepine per protocol only if seizure recurs / becomes status'
      ],
      monitoring: ['Serial GCS (expect improvement)', 'SpO2 and respiratory rate', 'Watch for recurrence']
    },
    studentChecklist: [
      { id: 'y1-017-safety', category: 'safety', description: 'Protect patient from injury without restraining', points: 5, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-017-recovery', category: 'intervention', description: 'Place in recovery position and protect airway', points: 8, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-017-time', category: 'clinical-reasoning', description: 'Establish seizure duration — recognise status epilepticus threshold (>5 min)', points: 8, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-017-glucose', category: 'abcde', description: 'Measure blood glucose', points: 6, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], rationale: 'Hypoglycaemia is a reversible seizure cause' },
      { id: 'y1-017-sample', category: 'history', description: 'SAMPLE including medication compliance and seizure history', points: 6, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'] },
      { id: 'y1-017-gcs', category: 'abcde', description: 'Serial GCS documenting improving post-ictal state', points: 5, yearLevel: ['1st-year', '2nd-year'], complexity: ['basic'] },
      { id: 'y1-017-o2', category: 'intervention', description: 'Oxygen if SpO2 < 94%', points: 3, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'] },
      { id: 'y1-017-transport', category: 'communication', description: 'Transport decision and safety-netting for recurrence', points: 5, yearLevel: ['2nd-year'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'A single self-terminating seizure in a known epileptic is common — the job is airway protection, glucose, and watching for recurrence',
      'Time the seizure: > 5 minutes or repeated seizures without recovery = status epilepticus and needs benzodiazepines',
      'The post-ictal GCS should improve — a GCS that does not recover is a red flag',
      'Always check glucose in any seizure',
      'Do not restrain a convulsing patient or force anything into the mouth'
    ],
    commonPitfalls: [
      'Restraining the patient or putting objects in the mouth',
      'Not timing the seizure',
      'Forgetting to check glucose',
      'Missing a developing status epilepticus',
      'Discharging on scene without safety-netting'
    ],
    references: ['JRCALC Convulsions Guideline', 'NICE Epilepsy (CG137)', 'UAE Prehospital Seizure Protocol']
  }),

  // y1-018: Ramadan-fasting hypoglycaemia in T2DM (metabolic)
  createCase({
    id: 'y1-018',
    title: 'Fasting Diabetic - Drowsy and Sweating',
    category: 'metabolic',
    subcategory: 'hypoglycemia',
    priority: 'high',
    complexity: 'basic',
    yearLevels: ['diploma', '1st-year', '2nd-year'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: '52-year-old male diabetic, drowsy and sweating, fasting',
      timeOfDay: 'afternoon',
      location: 'Taxi rank in Deira, Dubai',
      callerInfo: 'Fellow driver',
      dispatchCode: 'Charlie-1'
    },
    patientInfo: {
      age: 52,
      gender: 'male',
      weight: 80,
      occupation: 'Taxi driver',
      language: 'Urdu',
      culturalConsiderations: ['Fasting during Ramadan', 'May be reluctant to break fast — explain medical necessity', 'Consider interpreter']
    },
    sceneInfo: {
      description: 'Driver slumped in the seat of his parked taxi, colleagues gathered',
      hazards: ['Roadside — traffic', 'Vehicle to be secured'],
      bystanders: 'Other drivers, helpful',
      environment: 'Hot afternoon, parked in shade',
      environmentVariant: 'roadside',
      sceneImagePath: '/scene-assets/road-traffic-male-dubai.png',
      sceneImageCaption: 'Scene — Hot afternoon, parked in shade',
    },
    initialPresentation: {
      generalImpression: 'Middle-aged man, clammy and drowsy, confused speech',
      position: 'Slumped in driver seat',
      appearance: 'Profuse sweating, pale, trembling',
      consciousness: 'Confused, responds to voice, not oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Able to protect own airway currently'],
        interventions: ['Monitor — will deteriorate if glucose falls further']
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 97,
        findings: ['Breathing normally'],
        interventions: ['None needed']
      },
      circulation: {
        pulseRate: 96,
        pulseQuality: 'Regular',
        bp: { systolic: 132, diastolic: 80 },
        capillaryRefill: 2,
        skin: 'Cold, clammy, diaphoretic',
        findings: ['Sympathetic response to hypoglycaemia'],
        interventions: ['Monitor']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 3, verbal: 4, motor: 6, total: 13 },
        bloodGlucose: 2.4,
        pupils: 'Equal, reactive',
        findings: ['Neuroglycopenia — confusion, drowsiness', 'Blood glucose 2.4 mmol/L'],
        interventions: ['Treat hypoglycaemia urgently']
      },
      exposure: {
        temperature: 36.6,
        findings: ['Diaphoretic', 'No injuries'],
        interventions: ['Keep warm']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['No abnormality'],
      chest: ['Clear'],
      abdomen: ['Soft'],
      pelvis: ['Stable'],
      extremities: ['Fine tremor', 'No injury'],
      posterior: ['No injury'],
      neurological: ['Confused but no focal deficit', 'Should resolve fully with glucose']
    },
    history: {
      medications: [
        { name: 'Gliclazide', dose: '80mg', frequency: 'Twice daily', indication: 'Type 2 diabetes' },
        { name: 'Metformin', dose: '1g', frequency: 'Twice daily', indication: 'Type 2 diabetes' }
      ],
      allergies: ['None known'],
      medicalConditions: ['Type 2 diabetes mellitus', 'Hypertension'],
      surgicalHistory: [],
      lastMeal: 'Suhoor before dawn (~10 hours ago) — fasting for Ramadan',
      eventsLeading: 'Took his usual morning gliclazide but has been fasting all day and working. Became progressively sweaty, tremulous and confused over the last hour.',
      socialHistory: { smoking: 'None', alcohol: 'None', occupation: 'Taxi driver', livingSituation: 'Shared accommodation' }
    },
    vitalSignsProgression: {
      initial: { bp: '132/80', pulse: 96, respiration: 18, spo2: 97, gcs: 13, bloodGlucose: 2.4 },
      afterIntervention: { bp: '132/80', pulse: 88, respiration: 15, spo2: 98, gcs: 15, bloodGlucose: 6.0 },
      deterioration: { bp: '124/76', pulse: 112, respiration: 20, spo2: 96, gcs: 6, bloodGlucose: 1.6 }
    },
    expectedFindings: {
      keyObservations: ['Blood glucose 2.4 mmol/L', 'Sulfonylurea (gliclazide) + fasting = classic hypoglycaemia', 'Sympathetic + neuroglycopenic signs', 'Reversible'],
      redFlags: ['Falling GCS / seizure', 'Loss of airway protection', 'Sulfonylurea hypoglycaemia can relapse — needs observation/transport', 'Recurrent hypoglycaemia'],
      differentialDiagnoses: ['Sulfonylurea-induced hypoglycaemia', 'Stroke (excluded — glucose explains it)', 'Sepsis', 'Intoxication'],
      mostLikelyDiagnosis: 'Sulfonylurea-induced hypoglycaemia precipitated by Ramadan fasting',
      supportingEvidence: ['Glucose 2.4', 'On gliclazide', 'Fasting all day', 'Classic adrenergic + neuroglycopenic picture']
    },
    managementPathway: {
      immediate: [
        'Scene safety (roadside / vehicle)',
        'Confirm hypoglycaemia with a glucometer',
        'If unsafe swallow: IV access and IV dextrose, or IM glucagon if no access',
        'Recovery position and airway monitoring'
      ],
      definitive: [
        'Recheck glucose after treatment — aim to restore consciousness and normoglycaemia',
        'Give complex carbohydrate once safe swallow returns',
        'Strongly advise transport — sulfonylurea hypoglycaemia relapses, and glucagon is only a temporary bridge'
      ],
      monitoring: ['Serial glucose and GCS', 'Watch for relapse', 'Cardiac monitoring']
    },
    studentChecklist: [
      { id: 'y1-018-safety', category: 'safety', description: 'Roadside scene safety and vehicle control', points: 4, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-018-glucose', category: 'abcde', description: 'Measure blood glucose and recognise hypoglycaemia', points: 10, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-018-treat', category: 'intervention', description: 'Treat hypoglycaemia: IV dextrose or IM glucagon when swallow unsafe', points: 12, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true, rationale: 'Rapid glucose restoration reverses neuroglycopenia' },
      { id: 'y1-018-recheck', category: 'intervention', description: 'Recheck glucose and conscious level after treatment', points: 8, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-018-sample', category: 'history', description: 'SAMPLE: identify gliclazide + fasting as the cause', points: 6, yearLevel: ['1st-year', '2nd-year'], complexity: ['basic'] },
      { id: 'y1-018-relapse', category: 'clinical-reasoning', description: 'Recognise sulfonylurea hypoglycaemia relapses — advise transport, not on-scene discharge', points: 8, yearLevel: ['2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-018-carb', category: 'intervention', description: 'Give long-acting carbohydrate once safe to swallow', points: 4, yearLevel: ['1st-year', '2nd-year'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'Check glucose in every drowsy or confused patient — it is fast, cheap, and reversible',
      'A sulfonylurea (gliclazide) plus fasting is a classic recipe for prolonged, relapsing hypoglycaemia',
      'IM glucagon is a bridge, not a fix — it needs hepatic glycogen and wears off; still give oral carbohydrate and transport',
      'Ramadan fasting is a common UAE precipitant — patients on sulfonylureas or insulin are highest risk',
      'Sulfonylurea hypoglycaemia can recur for hours; on-scene discharge is unsafe'
    ],
    commonPitfalls: [
      'Not measuring glucose in a confused patient',
      'Giving oral glucose to someone with an unsafe swallow',
      'Discharging on scene after glucagon (relapse risk)',
      'Attributing the confusion to heat or fasting without confirming glucose'
    ],
    references: ['JRCALC Glycaemic Emergencies', 'Diabetes UK Ramadan Guidance', 'UAE Prehospital Hypoglycaemia Protocol']
  }),

  // y1-019: Simple low-risk mechanical fall in an older adult (elderly-fall)
  createCase({
    id: 'y1-019',
    title: 'Older Adult - Simple Mechanical Fall, Low Risk',
    category: 'elderly-fall',
    subcategory: 'fall',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['diploma', '1st-year', '2nd-year'],
    estimatedDuration: 16,
    dispatchInfo: {
      callReason: '74-year-old female tripped and fell, hip pain',
      timeOfDay: 'morning',
      location: 'Villa in Al Ain',
      callerInfo: 'Husband',
      dispatchCode: 'Alpha-1'
    },
    patientInfo: {
      age: 74,
      gender: 'female',
      weight: 62,
      language: 'Arabic',
      culturalConsiderations: ['Female patient may prefer female provider', 'Family present and supportive']
    },
    sceneInfo: {
      description: 'Sitting room, patient on floor beside a prayer mat she tripped over',
      hazards: ['Prayer mat', 'Polished floor'],
      bystanders: 'Husband present, calm',
      environment: 'Cool villa'
    },
    initialPresentation: {
      generalImpression: 'Alert older woman sitting on the floor, uncomfortable but composed',
      position: 'On floor, leaning against sofa',
      appearance: 'Calm, guarding left hip',
      consciousness: 'Alert and fully oriented'
    },
    abcde: {
      airway: { patent: true, findings: ['Patent', 'Speaking clearly'], interventions: [] },
      breathing: { rate: 18, rhythm: 'Regular', depth: 'Normal', spo2: 97, findings: ['Unlaboured', 'Chest clear'], interventions: [] },
      circulation: { pulseRate: 84, pulseQuality: 'Regular', bp: { systolic: 142, diastolic: 84 }, capillaryRefill: 2, skin: 'Warm and dry', findings: ['No signs of shock'], interventions: [] },
      disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'Equal and reactive', findings: ['Oriented', 'No head strike, no LOC'], interventions: [] },
      exposure: { temperature: 36.6, findings: ['Bruise over left hip', 'No open wound', 'No obvious limb shortening/rotation'], interventions: ['Preserve dignity and warmth'] }
    },
    secondarySurvey: {
      head: ['No trauma', 'No head strike reported or witnessed'],
      neck: ['No midline tenderness', 'Full pain-free range'],
      chest: ['Non-tender', 'Clear'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable, no tenderness on gentle assessment'],
      extremities: ['Left hip tender, bruised', 'Able to weight-bear a little with pain', 'Distal pulses and sensation intact', 'No deformity'],
      posterior: ['Mild lower back ache'],
      neurological: ['No deficit']
    },
    history: {
      medications: [{ name: 'Amlodipine', dose: '5mg', frequency: 'Daily', indication: 'Hypertension' }],
      allergies: ['None'],
      medicalConditions: ['Hypertension'],
      surgicalHistory: ['Cataract surgery'],
      lastMeal: 'Breakfast 1 hour ago',
      eventsLeading: 'Tripped over the edge of a prayer mat, sat down heavily on her left hip. No dizziness, chest pain or blackout before the fall (mechanical, not collapse). No head strike.',
      socialHistory: { smoking: 'Never', alcohol: 'None', occupation: 'Homemaker', livingSituation: 'Lives with husband, independent' }
    },
    vitalSignsProgression: {
      initial: { bp: '142/84', pulse: 84, respiration: 18, spo2: 97, gcs: 15 },
      afterIntervention: { bp: '132/78', pulse: 66, respiration: 16, spo2: 97, gcs: 15 },
      deterioration: { bp: '108/68', pulse: 108, respiration: 22, spo2: 96, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: ['Clear mechanical trip (not a collapse)', 'No head strike / no LOC', 'Isolated hip soft-tissue injury likely', 'Haemodynamically stable'],
      redFlags: ['Any suggestion the fall was a syncope/collapse', 'Occult hip fracture with rising HR / falling BP', 'Long lie', 'Anticoagulation (none here)'],
      differentialDiagnoses: ['Soft-tissue hip contusion', 'Occult neck-of-femur fracture', 'Mechanical fall vs syncopal collapse'],
      mostLikelyDiagnosis: 'Low-risk mechanical fall with hip contusion',
      supportingEvidence: ['Witnessed trip', 'No pre-fall symptoms', 'Stable vitals', 'Able to partially weight-bear']
    },
    managementPathway: {
      immediate: ['Scene safety', 'Establish mechanism — mechanical trip vs collapse', 'Full set of vitals', 'Check for head strike / LOC / long lie', 'Simple analgesia (paracetamol) for hip pain'],
      definitive: ['Gentle assessment of hip and ability to weight-bear', 'Transport for X-ray if pain or reduced weight-bearing', 'Consider safe discharge pathway only if truly low-risk and mobile'],
      monitoring: ['Repeat vitals', 'Watch for signs of occult fracture / bleeding', 'Reassess pain']
    },
    studentChecklist: [
      { id: 'y1-019-safety', category: 'safety', description: 'Scene safety and hazard removal (prayer mat / floor)', points: 4, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-019-mechanism', category: 'history', description: 'Distinguish mechanical trip from syncopal collapse', points: 10, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true, rationale: 'A "fall" that is really a collapse changes everything' },
      { id: 'y1-019-headinjury', category: 'history', description: 'Ask about head strike, loss of consciousness, and time on floor', points: 6, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'] },
      { id: 'y1-019-vitals', category: 'abcde', description: 'Full set of vital signs', points: 6, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'] },
      { id: 'y1-019-exam', category: 'secondary', description: 'Examine hip/pelvis and check distal neurovascular status', points: 6, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'] },
      { id: 'y1-019-analgesia', category: 'intervention', description: 'Provide simple analgesia (paracetamol) for pain', points: 5, yearLevel: ['1st-year', '2nd-year'], complexity: ['basic'] },
      { id: 'y1-019-meds', category: 'history', description: 'Check for anticoagulants / antiplatelets (bleed risk)', points: 5, yearLevel: ['2nd-year'], complexity: ['basic'] },
      { id: 'y1-019-transport', category: 'communication', description: 'Appropriate transport / referral decision with safety-netting', points: 5, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'The first question in any elderly fall: did they trip, or did they collapse? The answer drives the whole assessment',
      'Always ask about head strike, LOC, anticoagulation, and time on the floor',
      'A patient who can partially weight-bear may still have an occult fracture — image if in doubt',
      'Simple paracetamol is effective and safe first-line analgesia',
      'Reassess vitals — a slowly bleeding occult hip fracture reveals itself as rising pulse and falling BP'
    ],
    commonPitfalls: [
      'Assuming "mechanical fall" without excluding a syncopal cause',
      'Missing anticoagulation as a bleeding-risk multiplier',
      'Over-analgesing or immobilising unnecessarily',
      'Not safety-netting for delayed presentation of injury'
    ],
    references: ['JRCALC Falls in the Older Person', 'NICE Falls Assessment (CG161)', 'UAE Prehospital Trauma Guideline']
  }),

  // y1-020: Isolated closed tibial fracture, sports injury (trauma)
  createCase({
    id: 'y1-020',
    title: 'Teenager - Deformed Lower Leg After Football Tackle',
    category: 'trauma',
    subcategory: 'long-bone-fracture',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['diploma', '1st-year', '2nd-year'],
    estimatedDuration: 16,
    dispatchInfo: {
      callReason: '17-year-old, twisted leg in football, obvious deformity, severe pain',
      timeOfDay: 'evening',
      location: 'School sports field, Dubai',
      callerInfo: 'PE teacher',
      dispatchCode: 'Bravo-1'
    },
    patientInfo: {
      age: 17,
      gender: 'male',
      weight: 68,
      occupation: 'Student',
      language: 'English',
      culturalConsiderations: ['Minor — involve school and parents/guardian for consent']
    },
    sceneInfo: {
      description: 'Astroturf pitch, patient on the ground holding right lower leg, teammates around',
      hazards: ['Other players', 'Evening floodlights'],
      bystanders: 'PE teacher and teammates',
      environment: 'Outdoor pitch, warm evening',
      environmentVariant: 'roadside',
      sceneImagePath: '/scene-assets/y1-020-school-football-tibial-fracture-male.png',
      sceneImageCaption: 'Scene — Outdoor pitch, warm evening',
    },
    initialPresentation: {
      generalImpression: 'Distressed teenager in severe pain, holding a visibly deformed right lower leg',
      position: 'Supine, guarding right leg',
      appearance: 'Pale, sweating with pain, obvious mid-shaft deformity',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: { patent: true, findings: ['Patent', 'Speaking in full sentences'], interventions: [] },
      breathing: { rate: 20, rhythm: 'Regular', depth: 'Normal', spo2: 99, findings: ['Slightly fast from pain', 'Chest clear'], interventions: [] },
      circulation: { pulseRate: 104, pulseQuality: 'Regular', bp: { systolic: 128, diastolic: 78 }, capillaryRefill: 2, skin: 'Warm, sweaty from pain', findings: ['Pain-driven tachycardia', 'No signs of significant blood loss'], interventions: ['Monitor'] },
      disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'Equal and reactive', findings: ['Alert', 'Severe pain'], interventions: [] },
      exposure: { temperature: 36.8, findings: ['Closed mid-shaft right tibial deformity', 'No wound / no bone exposed', 'Intact skin'], interventions: ['Expose and inspect, keep warm'] }
    },
    secondarySurvey: {
      head: ['No injury'],
      neck: ['No injury'],
      chest: ['Non-tender'],
      abdomen: ['Soft'],
      pelvis: ['Stable'],
      extremities: ['Right mid-tibia deformity and swelling', 'Dorsalis pedis and posterior tibial pulses PRESENT', 'Sensation and capillary refill intact distally', 'No other limb injury'],
      posterior: ['No injury'],
      neurological: ['Distal neurovascular status intact']
    },
    history: {
      medications: [],
      allergies: ['None known'],
      medicalConditions: ['Fit and well'],
      surgicalHistory: [],
      lastMeal: 'Dinner 3 hours ago',
      eventsLeading: 'Caught studs in the turf during a tackle and twisted, felt and heard a snap, immediate deformity and severe pain. No head or other injury.',
      socialHistory: { smoking: 'None', alcohol: 'None', occupation: 'Student', livingSituation: 'Lives with parents' }
    },
    vitalSignsProgression: {
      initial: { bp: '128/78', pulse: 104, respiration: 20, spo2: 99, gcs: 15, painScore: 8 },
      afterIntervention: { bp: '124/76', pulse: 84, respiration: 18, spo2: 99, gcs: 15, painScore: 4 },
      deterioration: { bp: '110/70', pulse: 118, respiration: 24, spo2: 98, gcs: 15, painScore: 9 }
    },
    expectedFindings: {
      keyObservations: ['Isolated closed long-bone fracture', 'Distal neurovascular status intact', 'Severe pain', 'Otherwise well teenager'],
      redFlags: ['Loss of distal pulse (vascular compromise)', 'Increasing pain out of proportion (compartment syndrome)', 'Open fracture', 'Signs of significant blood loss'],
      differentialDiagnoses: ['Closed tibial shaft fracture', 'Tibial plateau fracture', 'Severe sprain/dislocation'],
      mostLikelyDiagnosis: 'Isolated closed tibial shaft fracture',
      supportingEvidence: ['Clear mechanism', 'Obvious deformity', 'Intact distal neurovascular status', 'Normal haemodynamics']
    },
    managementPathway: {
      immediate: ['Scene safety', 'Expose and assess the limb', 'Check and document distal pulses, sensation, capillary refill BEFORE and AFTER any movement', 'Analgesia (paracetamol and titrated stronger analgesia per protocol)', 'Align and splint in position of comfort'],
      definitive: ['Immobilise with a box/SAM splint', 'Elevate and apply cold pack', 'Transport for X-ray and orthopaedic care', 'Involve guardian for consent (minor)'],
      monitoring: ['Reassess distal neurovascular status after splinting', 'Reassess pain', 'Watch for compartment syndrome']
    },
    studentChecklist: [
      { id: 'y1-020-safety', category: 'safety', description: 'Scene safety and control of the sports environment', points: 4, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-020-nvbefore', category: 'secondary', description: 'Assess and document distal pulses/sensation BEFORE splinting', points: 10, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true, rationale: 'Baseline neurovascular status must precede any manipulation' },
      { id: 'y1-020-analgesia', category: 'intervention', description: 'Provide effective analgesia (paracetamol +/- titrated stronger agent)', points: 8, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-020-splint', category: 'intervention', description: 'Align and immobilise the limb with a splint', points: 8, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-020-nvafter', category: 'secondary', description: 'Reassess distal neurovascular status AFTER splinting', points: 8, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-020-consent', category: 'communication', description: 'Involve school/guardian for consent (minor)', points: 4, yearLevel: ['1st-year', '2nd-year'], complexity: ['basic'] },
      { id: 'y1-020-compartment', category: 'clinical-reasoning', description: 'Recognise compartment syndrome warning signs', points: 6, yearLevel: ['2nd-year'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'Always check and document distal pulses, sensation and capillary refill BEFORE and AFTER splinting',
      'Splint the limb in a position of comfort and re-check the neurovascular status',
      'Pain out of proportion to the injury is the earliest sign of compartment syndrome',
      'An isolated closed tibial fracture rarely causes shock — if the patient is shocked, look elsewhere',
      'This is a minor — involve the school and guardian for consent'
    ],
    commonPitfalls: [
      'Splinting without checking neurovascular status first',
      'Under-treating pain',
      'Missing a developing compartment syndrome',
      'Forgetting consent processes for a minor'
    ],
    references: ['JRCALC Limb Trauma', 'ATLS Musculoskeletal Trauma', 'UAE Prehospital Trauma Guideline']
  }),

  // y1-021: Infective COPD exacerbation (respiratory)
  createCase({
    id: 'y1-021',
    title: 'Older Smoker - Worsening Breathlessness with Green Sputum',
    category: 'respiratory',
    subcategory: 'copd',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['1st-year', '2nd-year'],
    estimatedDuration: 18,
    dispatchInfo: {
      callReason: '66-year-old male, known COPD, increasing breathlessness for 3 days',
      timeOfDay: 'evening',
      location: 'Apartment in Sharjah',
      callerInfo: 'Son',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 66,
      gender: 'male',
      weight: 70,
      occupation: 'Retired mechanic',
      language: 'Arabic',
      culturalConsiderations: ['Family present and involved in decisions']
    },
    sceneInfo: {
      description: 'Bedroom, patient sitting upright on edge of bed, tripod position',
      hazards: ['None'],
      bystanders: 'Son present',
      environment: 'Warm apartment'
    },
    initialPresentation: {
      generalImpression: 'Breathless older man sitting forward, pursed-lip breathing, unable to speak full sentences',
      position: 'Tripod, leaning on knees',
      appearance: 'Using accessory muscles, mild central cyanosis',
      consciousness: 'Alert but distracted by breathlessness'
    },
    abcde: {
      airway: { patent: true, findings: ['Patent', 'Speaking in short phrases only'], interventions: ['Position of comfort'] },
      breathing: {
        rate: 26,
        rhythm: 'Regular',
        depth: 'Shallow, prolonged expiration',
        spo2: 90,
        findings: ['Widespread expiratory wheeze', 'Prolonged expiratory phase', 'Accessory muscle use', 'Green sputum'],
        auscultation: ['Widespread polyphonic wheeze', 'Reduced air entry at bases'],
        interventions: ['Controlled oxygen targeting SpO2 88–92%', 'Nebulised bronchodilators']
      },
      circulation: { pulseRate: 104, pulseQuality: 'Regular', bp: { systolic: 148, diastolic: 86 }, capillaryRefill: 2, skin: 'Warm, mildly cyanosed lips', findings: ['Sinus tachycardia'], interventions: ['Monitor'] },
      disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'Equal and reactive', findings: ['Alert', 'Anxious'], interventions: ['Watch for drowsiness (CO2 retention)'] },
      exposure: { temperature: 37.9, findings: ['Febrile', 'No peripheral oedema of note'], interventions: ['Keep comfortable'] }
    },
    secondarySurvey: {
      head: ['Pursed-lip breathing'],
      neck: ['Accessory muscle use', 'No raised JVP'],
      chest: ['Hyperinflated', 'Widespread wheeze', 'Reduced basal air entry'],
      abdomen: ['Soft'],
      pelvis: ['Stable'],
      extremities: ['Nicotine staining', 'No peripheral oedema', 'Warm peripheries'],
      posterior: ['No sacral oedema'],
      neurological: ['Alert, no focal deficit']
    },
    history: {
      medications: [
        { name: 'Salbutamol inhaler', dose: '100mcg', frequency: 'PRN', indication: 'COPD' },
        { name: 'Tiotropium', dose: '18mcg', frequency: 'Daily', indication: 'COPD' },
        { name: 'Seretide', dose: '250/25', frequency: 'Twice daily', indication: 'COPD' }
      ],
      allergies: ['None known'],
      medicalConditions: ['COPD (GOLD stage 3)', 'Ex-heavy smoker'],
      surgicalHistory: [],
      lastMeal: 'Dinner, ate little',
      eventsLeading: '3 days of increasing breathlessness, wheeze and green sputum with fever. Using his reliever inhaler far more than usual with little relief.',
      socialHistory: { smoking: 'Ex-smoker, 45 pack-years', alcohol: 'None', occupation: 'Retired mechanic', livingSituation: 'Lives with son' }
    },
    vitalSignsProgression: {
      initial: { bp: '148/86', pulse: 104, respiration: 26, spo2: 90, gcs: 15, temperature: 37.9 },
      afterIntervention: { bp: '142/82', pulse: 108, respiration: 18, spo2: 92, gcs: 15, temperature: 37.9 },
      deterioration: { bp: '160/94', pulse: 122, respiration: 8, spo2: 84, gcs: 12, temperature: 37.9 }
    },
    expectedFindings: {
      keyObservations: ['Infective COPD exacerbation', 'Wheeze with prolonged expiration', 'Target SpO2 88–92%', 'Febrile with purulent sputum'],
      redFlags: ['Falling respiratory rate with drowsiness (CO2 narcosis / tiring)', 'Silent chest', 'Exhaustion', 'Rising CO2'],
      differentialDiagnoses: ['Infective COPD exacerbation', 'Community-acquired pneumonia', 'Heart failure (no oedema/JVP here)', 'Pulmonary embolism'],
      mostLikelyDiagnosis: 'Infective exacerbation of COPD',
      supportingEvidence: ['Known COPD', '3 days sputum/fever', 'Wheeze', 'Controlled-oxygen target applies']
    },
    managementPathway: {
      immediate: [
        'Sit upright, position of comfort',
        'Controlled oxygen titrated to SpO2 88–92% (Venturi 28%)',
        'Nebulised salbutamol and nebulised ipratropium',
        'Consider hydrocortisone / steroid per protocol'
      ],
      definitive: [
        'Reassess response to nebulised bronchodilators',
        'Transport for antibiotics, steroids and possible NIV',
        'Avoid or minimise opioids — they depress respiratory drive in CO2-retaining COPD'
      ],
      monitoring: ['Continuous SpO2 with target range', 'Respiratory rate and level of consciousness', 'Watch for CO2 narcosis / tiring']
    },
    studentChecklist: [
      { id: 'y1-021-position', category: 'intervention', description: 'Sit the patient upright in position of comfort', points: 5, yearLevel: ['1st-year', '2nd-year'], complexity: ['basic', 'intermediate'], critical: true },
      { id: 'y1-021-o2target', category: 'intervention', description: 'Apply CONTROLLED oxygen to target SpO2 88–92%', points: 10, yearLevel: ['1st-year', '2nd-year'], complexity: ['intermediate'], critical: true, rationale: 'Uncontrolled high-flow O2 can worsen CO2 retention in COPD' },
      { id: 'y1-021-neb', category: 'medication', description: 'Administer nebulised salbutamol and ipratropium', points: 10, yearLevel: ['1st-year', '2nd-year'], complexity: ['intermediate'], critical: true },
      { id: 'y1-021-steroid', category: 'medication', description: 'Consider hydrocortisone / steroid per protocol', points: 6, yearLevel: ['2nd-year'], complexity: ['intermediate'] },
      { id: 'y1-021-assess', category: 'abcde', description: 'Full respiratory assessment including auscultation', points: 6, yearLevel: ['1st-year', '2nd-year'], complexity: ['basic', 'intermediate'] },
      { id: 'y1-021-opioid', category: 'clinical-reasoning', description: 'Recognise that opioids/sedatives are hazardous (respiratory depression) in COPD', points: 6, yearLevel: ['2nd-year'], complexity: ['intermediate'], rationale: 'CO2-retaining COPD patients are sensitive to respiratory depressants' },
      { id: 'y1-021-monitor', category: 'abcde', description: 'Monitor for tiring / CO2 narcosis (falling RR, drowsiness)', points: 6, yearLevel: ['1st-year', '2nd-year'], complexity: ['intermediate'], critical: true }
    ],
    teachingPoints: [
      'Target SpO2 88–92% in COPD — controlled oxygen, not routine high-flow',
      'Nebulised salbutamol and ipratropium are the first-line bronchodilators',
      'Opioids and sedatives are hazardous in CO2-retaining COPD because they depress respiratory drive — avoid or use with extreme caution',
      'A falling respiratory rate with drowsiness in a tiring COPD patient is pre-arrest, not improvement',
      'A silent chest means severe airflow limitation — an emergency'
    ],
    commonPitfalls: [
      'Giving uncontrolled high-flow oxygen and worsening CO2 retention',
      'Missing the tiring patient whose RR is falling',
      'Giving opioids without recognising the respiratory-depression risk',
      'Not reassessing after nebulisers'
    ],
    references: ['GOLD COPD Strategy', 'BTS Emergency Oxygen Guideline', 'JRCALC COPD / Dyspnoea']
  }),

  // y1-022: Undifferentiated abdominal pain with dehydration (general)
  createCase({
    id: 'y1-022',
    title: 'Young Adult - Vomiting, Diarrhoea and Cramping Abdominal Pain',
    category: 'general',
    subcategory: 'abdominal-pain',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['diploma', '1st-year', '2nd-year'],
    estimatedDuration: 18,
    dispatchInfo: {
      callReason: '28-year-old female, 2 days vomiting and diarrhoea, abdominal pain',
      timeOfDay: 'morning',
      location: 'Apartment in Dubai Marina',
      callerInfo: 'Flatmate',
      dispatchCode: 'Alpha-1'
    },
    patientInfo: {
      age: 28,
      gender: 'female',
      weight: 60,
      occupation: 'Teacher',
      language: 'English',
      culturalConsiderations: ['Maintain privacy for a young female patient', 'Offer chaperone']
    },
    sceneInfo: { description: 'Bedroom, patient curled on the bed clutching her abdomen', hazards: ['None'], bystanders: 'Flatmate present', environment: 'Air-conditioned flat' },
    initialPresentation: {
      generalImpression: 'Young woman looking unwell and dehydrated, cramping abdominal pain',
      position: 'Curled on side, knees drawn up',
      appearance: 'Pale, dry lips, tired',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: { patent: true, findings: ['Patent', 'Speaking in full sentences'], interventions: [] },
      breathing: { rate: 18, rhythm: 'Regular', depth: 'Normal', spo2: 99, findings: ['Chest clear'], interventions: [] },
      circulation: { pulseRate: 104, pulseQuality: 'Regular, slightly thready', bp: { systolic: 108, diastolic: 68 }, capillaryRefill: 3, skin: 'Warm, reduced turgor, dry mucous membranes', findings: ['Mild dehydration', 'Compensating tachycardia'], interventions: ['IV access, consider fluids'] },
      disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, bloodGlucose: 5.6, pupils: 'Equal and reactive', findings: ['Alert', 'No focal deficit'], interventions: [] },
      exposure: { temperature: 37.6, findings: ['Generalised soft abdominal tenderness, no guarding/rigidity', 'No rebound'], interventions: ['Examine abdomen, preserve dignity'] }
    },
    secondarySurvey: {
      head: ['Dry mucous membranes'],
      neck: ['No abnormality'],
      chest: ['Clear'],
      abdomen: ['Generalised mild tenderness', 'Active bowel sounds', 'No guarding, rigidity or rebound', 'No pulsatile mass'],
      pelvis: ['No PV symptoms reported'],
      extremities: ['Cool peripheries', 'Reduced skin turgor'],
      posterior: ['No abnormality'],
      neurological: ['No deficit']
    },
    history: {
      medications: [{ name: 'Combined oral contraceptive pill', dose: 'Standard', frequency: 'Daily', indication: 'Contraception' }],
      allergies: ['None known'],
      medicalConditions: ['Otherwise well'],
      surgicalHistory: ['Appendicectomy age 12'],
      lastMeal: 'Sips of water only — vomiting everything for 2 days',
      eventsLeading: '2 days of vomiting and watery diarrhoea after a restaurant meal; a flatmate was similarly unwell. Cramping generalised abdominal pain, now feeling faint on standing.',
      socialHistory: { smoking: 'None', alcohol: 'Occasional', occupation: 'Teacher', livingSituation: 'Shares flat' }
    },
    vitalSignsProgression: {
      initial: { bp: '108/68', pulse: 104, respiration: 18, spo2: 99, gcs: 15, bloodGlucose: 5.6, temperature: 37.6 },
      afterIntervention: { bp: '100/62', pulse: 78, respiration: 16, spo2: 99, gcs: 15, bloodGlucose: 5.6, temperature: 37.6 },
      deterioration: { bp: '92/58', pulse: 122, respiration: 22, spo2: 98, gcs: 14, bloodGlucose: 5.6, temperature: 37.6 }
    },
    expectedFindings: {
      keyObservations: ['Gastroenteritis with mild-moderate dehydration', 'Soft abdomen without peritonism', 'Compensating tachycardia', 'Contact history (flatmate unwell)'],
      redFlags: ['Peritonitis (guarding/rigidity/rebound)', 'Pregnancy — always consider in a woman of childbearing age', 'Progression to hypovolaemic shock', 'Blood in vomit or stool'],
      differentialDiagnoses: ['Viral/bacterial gastroenteritis', 'Ectopic pregnancy (must exclude)', 'Appendicitis (prior appendicectomy)', 'Urinary tract infection', 'Ovarian pathology'],
      mostLikelyDiagnosis: 'Acute gastroenteritis with dehydration',
      supportingEvidence: ['2-day vomiting/diarrhoea', 'Contact history', 'Soft non-peritonitic abdomen', 'Dehydration signs']
    },
    managementPathway: {
      immediate: ['Scene safety and dignity/chaperone', 'ABCDE and full vital signs', 'IV access; cautious fluid resuscitation if hypovolaemic', 'Analgesia (paracetamol) and antiemetic (ondansetron) per protocol'],
      definitive: ['Assess hydration and reassess after fluids', 'Consider pregnancy in any woman of childbearing age', 'Transport for assessment if unable to tolerate oral intake or red flags present'],
      monitoring: ['Repeat vitals — response to fluids', 'Reassess abdomen for developing peritonism', 'Fluid balance']
    },
    studentChecklist: [
      { id: 'y1-022-dignity', category: 'communication', description: 'Offer chaperone and preserve dignity', points: 4, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'] },
      { id: 'y1-022-opqrst', category: 'history', description: 'OPQRST pain assessment and full SAMPLE', points: 8, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-022-hydration', category: 'abcde', description: 'Assess hydration status (turgor, mucous membranes, cap refill, HR/BP)', points: 8, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-022-abdo', category: 'secondary', description: 'Examine abdomen for peritonism (guarding/rigidity/rebound)', points: 8, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'], critical: true },
      { id: 'y1-022-preg', category: 'clinical-reasoning', description: 'Consider pregnancy/ectopic in a woman of childbearing age', points: 8, yearLevel: ['2nd-year'], complexity: ['basic'], critical: true, rationale: 'Ectopic pregnancy is a lethal must-not-miss' },
      { id: 'y1-022-fluids', category: 'intervention', description: 'IV access and cautious fluids; paracetamol and ondansetron per protocol', points: 8, yearLevel: ['1st-year', '2nd-year'], complexity: ['basic'] },
      { id: 'y1-022-transport', category: 'communication', description: 'Transport / safety-net decision', points: 4, yearLevel: ['diploma', '1st-year', '2nd-year'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'Undifferentiated abdominal pain is a "must-not-miss" screen: peritonitis, ectopic pregnancy, AAA, bowel ischaemia',
      'Always consider pregnancy in a woman of childbearing age — ectopic can masquerade as gastroenteritis',
      'A soft, non-peritonitic abdomen with a contact history points to gastroenteritis, but reassess for change',
      'Treat dehydration with cautious fluids and reassess the response',
      'Paracetamol and an antiemetic (ondansetron) improve comfort and rehydration tolerance'
    ],
    commonPitfalls: [
      'Anchoring on "gastro" and missing ectopic pregnancy or appendicitis',
      'Not assessing hydration or fluid response',
      'Under-recognising compensated shock in a young patient',
      'Skipping a proper abdominal examination'
    ],
    references: ['JRCALC Abdominal Pain', 'NICE Gastroenteritis Guidance', 'UAE Prehospital Assessment Standards']
  }),

  // y1-023: Opioid overdose with respiratory depression (toxicology)
  createCase({
    id: 'y1-023',
    title: 'Unresponsive Man - Pinpoint Pupils and Slow Breathing',
    category: 'toxicology',
    subcategory: 'opioid-overdose',
    priority: 'critical',
    complexity: 'intermediate',
    yearLevels: ['1st-year', '2nd-year'],
    estimatedDuration: 18,
    dispatchInfo: {
      callReason: '30-year-old male found unresponsive, barely breathing',
      timeOfDay: 'evening',
      location: 'Labour accommodation, Sharjah',
      callerInfo: 'Roommate (frightened)',
      dispatchCode: 'Echo-1'
    },
    patientInfo: {
      age: 30,
      gender: 'male',
      weight: 72,
      occupation: 'Construction worker',
      language: 'Hindi',
      culturalConsiderations: ['Consider interpreter for collateral history', 'Non-judgemental approach', 'Confidentiality']
    },
    sceneInfo: {
      description: 'Shared dormitory room, patient on a bunk, roommate found him',
      hazards: ['Check for needles/sharps before kneeling', 'Cramped space'],
      bystanders: 'Roommate present',
      environment: 'Warm dormitory'
    },
    initialPresentation: {
      generalImpression: 'Unresponsive man, cyanosed, breathing very slowly and shallowly',
      position: 'Supine on bunk',
      appearance: 'Cyanosed lips, pinpoint pupils, snoring respirations',
      consciousness: 'Responds only to pain'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Snoring respirations', 'At risk without support', 'No foreign body seen'],
        interventions: ['Head-tilt chin-lift / jaw thrust', 'OPA insertion', 'Suction ready', 'BVM ventilation']
      },
      breathing: {
        rate: 6,
        rhythm: 'Irregular, shallow',
        depth: 'Very shallow',
        spo2: 82,
        findings: ['Hypoventilation', 'Cyanosis', 'Reduced air entry from poor effort'],
        interventions: ['Assist ventilation with BVM and high-flow oxygen']
      },
      circulation: { pulseRate: 52, pulseQuality: 'Regular but slow', bp: { systolic: 108, diastolic: 68 }, capillaryRefill: 3, skin: 'Cool, cyanosed peripheries', findings: ['Bradycardia secondary to hypoxia/opioid'], interventions: ['Monitor'] },
      disability: {
        avpu: 'P',
        gcs: { eye: 1, verbal: 2, motor: 3, total: 6 },
        bloodGlucose: 5.8,
        pupils: 'Pinpoint (miosis) bilaterally',
        findings: ['Reduced consciousness (GCS 6)', 'Pinpoint pupils — opioid toxidrome', 'Airway at risk'],
        interventions: ['Airway support', 'Naloxone', 'Glucose checked to exclude hypoglycaemia']
      },
      exposure: { temperature: 36.2, findings: ['Possible injection marks in antecubital fossae'], interventions: ['Examine for sharps safely, keep warm'] }
    },
    secondarySurvey: {
      head: ['Pinpoint pupils', 'No head trauma seen'],
      neck: ['No abnormality'],
      chest: ['Poor air entry from hypoventilation'],
      abdomen: ['Soft'],
      pelvis: ['Stable'],
      extremities: ['Track/injection marks', 'Cyanosed peripheries'],
      posterior: ['No injury'],
      neurological: ['GCS 6, responds to pain, no lateralising signs']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown — collateral from roommate'],
      surgicalHistory: [],
      lastMeal: 'Unknown',
      eventsLeading: 'Roommate found him unresponsive after he had been out with friends. Empty tablet strips (tramadol) and drug paraphernalia noted nearby. Progressive slow breathing.',
      socialHistory: { smoking: 'Yes', alcohol: 'Occasional', occupation: 'Construction worker', livingSituation: 'Shared labour accommodation' }
    },
    vitalSignsProgression: {
      initial: { bp: '108/68', pulse: 52, respiration: 6, spo2: 82, gcs: 6, bloodGlucose: 5.8 },
      afterIntervention: { bp: '112/72', pulse: 78, respiration: 14, spo2: 98, gcs: 11, bloodGlucose: 5.8 },
      deterioration: { bp: '80/40', pulse: 38, respiration: 2, spo2: 60, gcs: 3, bloodGlucose: 5.8 }
    },
    expectedFindings: {
      keyObservations: ['Opioid toxidrome: reduced consciousness, pinpoint pupils, respiratory depression', 'Hypoxia driving bradycardia', 'Airway at risk', 'Reversible with ventilation + naloxone'],
      redFlags: ['Apnoea / arrest', 'Aspiration', 'Re-sedation as naloxone wears off (shorter than most opioids)', 'Mixed overdose'],
      differentialDiagnoses: ['Opioid overdose', 'Hypoglycaemia (excluded)', 'Head injury', 'Other sedative overdose', 'CNS infection'],
      mostLikelyDiagnosis: 'Opioid (tramadol/heroin) overdose with respiratory depression',
      supportingEvidence: ['Toxidrome triad', 'Paraphernalia at scene', 'Response to ventilation and naloxone', 'Normal glucose']
    },
    managementPathway: {
      immediate: [
        'Scene safety — check for sharps before kneeling',
        'Open and support the airway (adjunct + suction)',
        'Assist ventilation with BVM and high-flow oxygen — THIS reverses the hypoxia first',
        'Titrate naloxone to restore adequate ventilation (not full arousal)'
      ],
      definitive: [
        'Reassess after naloxone — repeat/titrate as it wears off',
        'IV access and monitoring',
        'Transport ALL opioid overdoses — naloxone is shorter-acting than most opioids and re-sedation is common'
      ],
      monitoring: ['Respiratory rate, SpO2 and GCS', 'Watch for re-sedation', 'Cardiac monitoring']
    },
    studentChecklist: [
      { id: 'y1-023-safety', category: 'safety', description: 'Scene safety — inspect for sharps before approaching', points: 6, yearLevel: ['1st-year', '2nd-year'], complexity: ['intermediate'], critical: true },
      { id: 'y1-023-airway', category: 'abcde', description: 'Open and support the airway with adjunct and suction', points: 10, yearLevel: ['1st-year', '2nd-year'], complexity: ['intermediate'], critical: true },
      { id: 'y1-023-ventilate', category: 'intervention', description: 'Assist ventilation with BVM and high-flow oxygen', points: 12, yearLevel: ['1st-year', '2nd-year'], complexity: ['intermediate'], critical: true, rationale: 'Oxygenation/ventilation reverses the lethal hypoxia before naloxone acts' },
      { id: 'y1-023-naloxone', category: 'medication', description: 'Titrate naloxone to adequate ventilation (avoid precipitating acute withdrawal)', points: 12, yearLevel: ['1st-year', '2nd-year'], complexity: ['intermediate'], critical: true },
      { id: 'y1-023-glucose', category: 'abcde', description: 'Check blood glucose (exclude hypoglycaemia)', points: 5, yearLevel: ['1st-year', '2nd-year'], complexity: ['intermediate'] },
      { id: 'y1-023-resedation', category: 'clinical-reasoning', description: 'Recognise re-sedation risk — transport all opioid overdoses', points: 8, yearLevel: ['2nd-year'], complexity: ['intermediate'], critical: true },
      { id: 'y1-023-toxidrome', category: 'clinical-reasoning', description: 'Identify the opioid toxidrome (miosis, hypoventilation, reduced GCS)', points: 6, yearLevel: ['1st-year', '2nd-year'], complexity: ['intermediate'] }
    ],
    teachingPoints: [
      'Oxygenate and ventilate FIRST — hypoxia, not the drug itself, is what kills in opioid overdose',
      'Titrate naloxone to restore adequate breathing, not to fully wake the patient (avoid violent withdrawal)',
      'Naloxone is shorter-acting than most opioids — re-sedation is common, so transport every patient',
      'The opioid toxidrome is miosis + hypoventilation + reduced consciousness',
      'Check the scene for sharps before kneeling, and check glucose in every unresponsive patient'
    ],
    commonPitfalls: [
      'Giving naloxone before oxygenating/ventilating',
      'Large naloxone boluses causing acute withdrawal, vomiting and aspiration',
      'Allowing on-scene discharge after naloxone (re-sedation risk)',
      'Missing hypoglycaemia or a mixed overdose',
      'Needlestick injury from unsafe scene approach'
    ],
    references: ['JRCALC Overdose and Poisoning', 'Resuscitation Council UK — Toxicological Emergencies', 'UAE Prehospital Naloxone Protocol']
  })
];

export default firstYearCases;
