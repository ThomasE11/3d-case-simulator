import type { CaseScenario } from '@/types';

// ============================================================================
// LITFL-INSPIRED REAL-LIFE ECG CASES
// Based on Life in the Fast Lane ECG Library clinical scenarios
// Each case features detailed clinical context, realistic vitals, and
// comprehensive teaching points for UAE paramedic training
// ============================================================================

const createCase = (caseData: Partial<CaseScenario> & { id: string; title: string }): CaseScenario => ({
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...caseData,
} as CaseScenario);

export const litflCaseDatabase: CaseScenario[] = [

  // =========================================================================
  // CASE 1: Inferior STEMI with RV Involvement (LITFL ECG Case 001)
  // =========================================================================
  createCase({
    id: 'litfl-001',
    title: 'Inferior STEMI with Right Ventricular Infarction',
    category: 'cardiac',
    subcategory: 'stem-inferior',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Male, 58, severe chest pain radiating to jaw, feeling faint',
      timeOfDay: 'morning',
      location: 'Construction site office, Al Quoz Industrial Area, Dubai',
      callerInfo: 'Colleague called 998 — patient became pale and nearly collapsed',
      dispatchCode: 'Echo-1',
      additionalInfo: [
        'Patient was given GTN sublingual by site first-aider before ambulance arrival',
        'Patient now lying on floor, very pale, sweaty',
        'Security will meet at gate'
      ]
    },
    patientInfo: {
      age: 58,
      gender: 'male',
      weight: 92,
      occupation: 'Construction project manager',
      language: 'English, Hindi',
      culturalConsiderations: ['Indian national', 'Vegetarian diet']
    },
    sceneInfo: {
      description: 'Air-conditioned portacabin office on construction site. Patient lying supine on floor, colleague supporting his head. GTN spray on desk.',
      hazards: ['Active construction site — hard hat zone'],
      bystanders: '3 colleagues present, one is a trained first-aider',
      environment: 'Indoor air-conditioned office, ambient 22°C',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/y2-009-construction-office-arrest.png',
      sceneImageCaption: 'Scene — Indoor air-conditioned office, ambient 22°C',
      accessIssues: ['Security gate requires badge', 'Narrow corridors in portacabin'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, supine, ashen/grey, profusely diaphoretic, looks critically unwell',
      position: 'Supine on floor, legs slightly elevated by colleague',
      appearance: 'Ashen grey complexion, cold clammy skin, distressed expression',
      consciousness: 'Alert but lightheaded, speaks in short sentences',
      sounds: ['Groaning intermittently', 'Verbally responsive']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent and self-maintaining', 'No stridor or gurgling', 'Able to speak'],
        interventions: ['Maintain supine position — do NOT sit up (RV infarct risk)'],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 93,
        findings: ['Mildly tachypneic', 'Clear bilateral air entry', 'No crackles (important — no pulmonary edema despite low BP)'],
        interventions: ['High-flow oxygen 15L/min via non-rebreather mask'],
        auscultation: ['Clear air entry bilaterally', 'No added sounds']
      },
      circulation: {
        pulseRate: 84,
        pulseQuality: 'Weak, thready, regular',
        bp: { systolic: 78, diastolic: 48 },
        capillaryRefill: 4,
        skin: 'Ashen, cold, clammy, diaphoretic',
        findings: [
          'Significant hypotension (BP 78/48 — dropped from 130/80 after GTN)',
          'No JVD despite right heart failure (volume-depleted)',
          'Poor peripheral perfusion',
          'First-degree AV block on monitor'
        ],
        interventions: [
          'IV access x2 — 16G bilateral antecubital fossa',
          '250mL normal saline bolus (careful — preload dependent)',
          'DO NOT give further nitrates',
          'Aspirin 300mg PO (crushed/chewed)',
          'Consider right-sided V4R lead'
        ],
        ecgFindings: [
          'Sinus rhythm 84 bpm',
          'First-degree AV block (PR interval 220ms)',
          'ST elevation leads II, III, aVF (inferior)',
          'ST elevation III > II (suggests RV involvement)',
          'ST elevation V1 (direct RV view)',
          'Reciprocal ST depression I, aVL, V6',
          'V4R shows ST elevation confirming RV infarct'
        ],
        ivAccess: ['16G right AC fossa', '16G left AC fossa']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive, 3mm bilaterally',
        bloodGlucose: 7.8,
        findings: ['Alert, oriented x3', 'No focal deficits', 'Anxiety appropriate to situation'],
        interventions: ['Reassurance', 'Keep patient informed']
      },
      exposure: {
        temperature: 36.2,
        findings: ['Cool peripheries', 'No rashes', 'No pedal edema'],
        interventions: ['Keep warm with blanket — avoid hypothermia in shock']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['Elevated JVP when reassessed after 250mL fluid bolus', 'Trachea central'],
      chest: ['Equal expansion', 'Heart sounds — S1S2, no murmurs', 'Clear lungs'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['Cool peripheries bilaterally', 'Weak radial pulses', 'No peripheral oedema'],
      posterior: ['No abnormalities'],
      neurological: ['GCS 15', 'No focal deficits']
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '10mg', frequency: 'Once daily', indication: 'Hypertension', route: 'PO' },
        { name: 'Metformin', dose: '500mg', frequency: 'Twice daily', indication: 'Type 2 diabetes', route: 'PO' }
      ],
      allergies: ['Penicillin — causes rash'],
      medicalConditions: ['Hypertension (10 years)', 'Type 2 diabetes (5 years)', 'Smoker (25 pack-years)', 'Dyslipidemia'],
      surgicalHistory: ['None'],
      lastMeal: 'Tea and toast 2 hours ago',
      eventsLeading: 'Sudden onset crushing central chest pain 45 minutes ago while sitting at desk. Pain radiates to jaw and both arms. Colleague administered 2 puffs of GTN spray — patient became very pale and nearly lost consciousness immediately after. No vomiting. No previous episodes.',
      socialHistory: {
        smoking: '25 pack-years, currently smoking 15/day',
        alcohol: 'Occasional — social',
        occupation: 'Construction project manager — high stress, sedentary'
      }
    },
    investigations: [
      { name: '12-lead ECG', indication: 'Chest pain with hemodynamic compromise', findings: 'Inferior STEMI with RV involvement', interpretation: 'ST elevation II, III, aVF with III>II, STE in V1, reciprocal changes I, aVL', urgency: 'immediate' },
      { name: 'V4R', indication: 'Suspected RV infarct', findings: 'ST elevation V4R', interpretation: 'Confirms right ventricular infarction — explains hypotension post-GTN', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '78/48', pulse: 84, respiration: 22, spo2: 93, gcs: 15, temperature: 36.2, bloodGlucose: 7.8, etco2: 30 },
      afterIntervention: { bp: '95/62', pulse: 80, respiration: 18, spo2: 97, gcs: 15, temperature: 36.4, etco2: 34 },
      deterioration: { bp: '60/35', pulse: 48, respiration: 28, spo2: 85, gcs: 12, etco2: 22 }
    },
    expectedFindings: {
      keyObservations: [
        'Hypotension post-GTN administration (nitrate-sensitive = RV infarct)',
        'Inferior STEMI with ST elevation III > II',
        'ST elevation in V1 suggesting RV involvement',
        'Clear lungs despite significant hypotension (RV failure, not LV)',
        'First-degree AV block (common in inferior MI)'
      ],
      redFlags: [
        'Cardiogenic shock from RV infarction',
        'GTN-induced severe hypotension',
        'Risk of complete heart block (inferior MI can progress)',
        'Bradycardia with potential for hemodynamic collapse'
      ],
      differentialDiagnoses: ['Inferior STEMI', 'Aortic dissection', 'Pulmonary embolism', 'Tension pneumothorax'],
      mostLikelyDiagnosis: 'Inferior STEMI with right ventricular infarction complicated by cardiogenic shock',
      supportingEvidence: [
        'Classic ECG findings — inferior STE with III > II',
        'Preload sensitivity demonstrated by nitrate-induced hypotension',
        'Clear lungs (no LV failure)',
        'Improvement with cautious IV fluids'
      ]
    },
    managementPathway: {
      immediate: [
        'STOP all nitrates — absolutely contraindicated in RV infarct',
        'Keep SUPINE — do NOT sit patient up',
        'High-flow oxygen 15L/min',
        'IV access x2',
        'Cautious 250mL NS bolus — monitor for fluid overload',
        'Aspirin 300mg PO',
        '12-lead ECG + V4R',
        'Morphine 2.5mg IV titrated for pain (avoid large doses — may worsen hypotension)',
        'Prepare for AV block — have atropine and transcutaneous pacing ready'
      ],
      definitive: [
        'Emergency PCI at cardiac catheterization lab',
        'Pre-alert receiving hospital with STEMI code',
        'Target door-to-balloon <90 minutes'
      ],
      monitoring: [
        'Continuous ECG monitoring (watch for complete heart block)',
        'Repeat BP every 3 minutes',
        'SpO2 continuous',
        'Reassess after each fluid bolus'
      ],
      transportConsiderations: [
        'Nearest PCI-capable facility: Rashid Hospital or Dubai Heart Centre',
        'Pre-alert with STEMI code and RV involvement notification',
        'Keep supine during transport — NO sitting position',
        'Prepare transcutaneous pacing in case of complete heart block'
      ]
    },
    studentChecklist: [
      { id: 'litfl001-1', description: 'Recognized inferior STEMI on ECG', category: 'clinical-reasoning', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl001-2', description: 'Identified RV involvement (III > II, V1 STE)', category: 'clinical-reasoning', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl001-3', description: 'Performed V4R to confirm RV infarct', category: 'procedural', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl001-4', description: 'Stopped nitrates and understood contraindication', category: 'intervention', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl001-5', description: 'Kept patient supine (not sitting)', category: 'intervention', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl001-6', description: 'Administered cautious IV fluid bolus', category: 'intervention', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl001-7', description: 'Administered aspirin', category: 'intervention', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl001-8', description: 'Pre-alerted PCI centre with STEMI code', category: 'communication', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl001-9', description: 'Prepared for AV block / pacing', category: 'clinical-reasoning', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] }
    ],
    teachingPoints: [
      'RV infarction complicates ~40% of inferior STEMIs — always check V4R',
      'ST elevation III > II is a strong clue for RV involvement',
      'Nitrates are CONTRAINDICATED in RV infarct — they reduce preload causing severe hypotension',
      'These patients are preload-dependent: treat with cautious IV fluids, NOT vasodilators',
      'First-degree AV block is common in inferior MI (AV node supplied by RCA)',
      'Risk of progression to complete heart block — have pacing ready',
      'Clear lungs with hypotension = think RV failure, not LV failure',
      'The hypotensive response to GTN is essentially diagnostic of RV involvement'
    ],
    commonPitfalls: [
      'Giving more GTN when BP drops (worsens preload-dependent shock)',
      'Sitting the patient up (reduces venous return, worsens RV failure)',
      'Aggressive fluid loading without monitoring (can cause RV overload)',
      'Failing to perform V4R (misses RV involvement)',
      'Not recognizing the significance of III > II ST elevation pattern'
    ],
    references: [
      'LITFL ECG Case 001: Inferior STEMI with RV infarction',
      'LITFL: Right Ventricular Infarction',
      'AHA/ACC STEMI Guidelines 2013',
      'Tintinalli Emergency Medicine 9th Ed, Chapter 48'
    ],
    equipmentNeeded: [
      'Cardiac monitor/defibrillator with 12-lead + V4R capability',
      'IV access equipment (16G cannulae x2)',
      'Normal saline 500mL bags x2',
      'Aspirin 300mg',
      'Morphine (titrated doses)',
      'Transcutaneous pacing pads',
      'Atropine 600mcg pre-drawn'
    ]
  }),

  // =========================================================================
  // CASE 2: Severe Hyperkalemia (LITFL ECG Case 003)
  // =========================================================================
  createCase({
    id: 'litfl-003',
    title: 'Life-Threatening Hyperkalemia — Renal Failure',
    category: 'metabolic',
    subcategory: 'electrolyte-emergency',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Male, 64, difficulty breathing, very weak, dialysis patient',
      timeOfDay: 'evening',
      location: 'Apartment in Bur Dubai, 7th floor',
      callerInfo: 'Wife called — husband missed dialysis twice this week, now very unwell',
      dispatchCode: 'Delta-2',
      additionalInfo: [
        'Patient is a known dialysis patient',
        'Missed last two dialysis sessions',
        'Becoming increasingly weak over past 24 hours'
      ]
    },
    patientInfo: {
      age: 64,
      gender: 'male',
      weight: 78,
      occupation: 'Retired teacher',
      language: 'Arabic, English (limited)',
      culturalConsiderations: ['Emirati national', 'Prefers Arabic communication']
    },
    sceneInfo: {
      description: 'Clean apartment, patient in armchair appearing drowsy. AV fistula visible in left arm. Peritoneal dialysis equipment visible but not in use.',
      hazards: [],
      bystanders: 'Wife present, speaks English and Arabic',
      environment: 'Air-conditioned apartment, clean',
      sceneImagePath: '/scene-assets/litfl-003-renal-failure-hyperkalemia-apartment.png',
      sceneImageCaption: 'Scene — Air-conditioned apartment, clean',
      accessIssues: ['Elevator access to 7th floor', 'Carry chair may be needed'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Elderly male, appears drowsy and weak, mild respiratory distress, generalized edema',
      position: 'Sitting in armchair, too weak to stand',
      appearance: 'Pale, mild periorbital edema, bilateral ankle edema, AV fistula left forearm',
      consciousness: 'Drowsy but rousable, responds to voice',
      sounds: ['Speaking in short phrases', 'Mild bibasilar crackles audible']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'No stridor', 'Speaking in short phrases'],
        interventions: ['Position upright', 'Suction available'],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 28,
        rhythm: 'Irregular',
        depth: 'Shallow',
        spo2: 89,
        findings: ['Tachypneic', 'Kussmaul-type respirations', 'Bilateral basal crackles (fluid overload)', 'Increased work of breathing'],
        interventions: ['High-flow oxygen 15L/min NRB', 'Upright positioning', 'Consider CPAP if worsening'],
        auscultation: ['Bilateral basal crackles', 'Diminished bases', 'No wheeze']
      },
      circulation: {
        pulseRate: 36,
        pulseQuality: 'Slow, weak, irregular',
        bp: { systolic: 95, diastolic: 55 },
        capillaryRefill: 4,
        skin: 'Pale, cool peripheries, bilateral pitting edema',
        findings: [
          'Severe bradycardia 36 bpm — potentially cardiac arrest rhythm',
          'Irregular pulse',
          'AV fistula left arm — DO NOT use for IV access or BP',
          'Bilateral pitting edema to knees',
          'JVP elevated'
        ],
        interventions: [
          'IV access RIGHT arm only (not fistula arm)',
          'Calcium gluconate 10% 10mL IV over 2 minutes (cardioprotection)',
          'Sodium bicarbonate 50mEq IV (shifts K+ intracellularly)',
          'Salbutamol nebulizer 10mg (shifts K+ intracellularly)',
          'DO NOT give potassium-containing fluids'
        ],
        ecgFindings: [
          'Severe bradycardia 36 bpm',
          'Broadened QRS complexes',
          'Peaked "tented" T waves in V2-V5',
          'Loss of P waves (atrial standstill)',
          'Sine wave pattern developing',
          'AV conduction delay'
        ],
        ivAccess: ['18G right hand dorsum']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 3, verbal: 4, motor: 5, total: 12 },
        pupils: 'Equal and reactive, 3mm',
        bloodGlucose: 6.2,
        findings: ['Drowsy, rousable to voice', 'Generalized weakness', 'Muscle fasciculations noted'],
        interventions: ['Monitor GCS closely']
      },
      exposure: {
        temperature: 36.0,
        findings: ['Bilateral pitting edema', 'AV fistula left forearm — thrill present', 'No rashes', 'Cool peripheries'],
        interventions: ['Keep warm']
      }
    },
    secondarySurvey: {
      head: ['Periorbital edema', 'No trauma'],
      neck: ['Elevated JVP', 'No lymphadenopathy'],
      chest: ['Bilateral basal crackles', 'Heart sounds distant'],
      abdomen: ['Mild distension', 'Non-tender', 'Peritoneal dialysis catheter in situ'],
      pelvis: ['Stable'],
      extremities: ['Bilateral pitting oedema to knees', 'AV fistula left forearm with thrill', 'Periorbital oedema', 'Generalized weakness'],
      posterior: ['No abnormalities'],
      neurological: ['GCS 12 (E3V4M5)', 'Generalized weakness', 'Hyporeflexia']
    },
    history: {
      medications: [
        { name: 'Calcium acetate', dose: '667mg', frequency: 'With meals', indication: 'Phosphate binder', route: 'PO' },
        { name: 'Erythropoietin', dose: '4000 IU', frequency: 'Weekly', indication: 'Renal anemia', route: 'SC' },
        { name: 'Amlodipine', dose: '10mg', frequency: 'Daily', indication: 'Hypertension', route: 'PO' },
        { name: 'Furosemide', dose: '80mg', frequency: 'Daily', indication: 'Fluid overload', route: 'PO' }
      ],
      allergies: ['None known'],
      medicalConditions: ['End-stage renal disease (dialysis 3x/week)', 'Hypertension', 'Type 2 diabetes (nephropathy)', 'Secondary hyperparathyroidism'],
      surgicalHistory: ['AV fistula creation 2019', 'Peritoneal dialysis catheter insertion 2022'],
      lastMeal: 'Dates and rice 3 hours ago',
      eventsLeading: 'Missed dialysis Tuesday and Thursday due to transport issues. Progressively weaker over 48 hours. Wife noticed he became confused this evening and had difficulty breathing. No chest pain. No vomiting.',
      socialHistory: {
        smoking: 'Never',
        alcohol: 'Never',
        occupation: 'Retired teacher'
      }
    },
    investigations: [
      { name: '12-lead ECG', indication: 'Bradycardia in renal failure patient', findings: 'Severe hyperkalemia pattern', interpretation: 'Peaked T waves, broad QRS, loss of P waves — K+ likely >7.5', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '95/55', pulse: 36, respiration: 28, spo2: 89, gcs: 12, temperature: 36.0, bloodGlucose: 6.2, etco2: 28 },
      afterIntervention: { bp: '110/70', pulse: 68, respiration: 20, spo2: 95, gcs: 14, temperature: 36.2, etco2: 33 },
      deterioration: { bp: '70/40', pulse: 22, respiration: 8, spo2: 75, gcs: 6, etco2: 18 }
    },
    expectedFindings: {
      keyObservations: [
        'Dialysis patient who missed sessions — hyperkalemia is likely',
        'Severe bradycardia with broad QRS complexes',
        'Peaked tented T waves — pathognomonic for hyperkalemia',
        'Fluid overload signs (edema, crackles, JVP elevation)',
        'AV fistula — avoid for access and BP'
      ],
      redFlags: [
        'Sine wave ECG pattern — imminent cardiac arrest',
        'Loss of P waves — atrial standstill',
        'GCS deterioration',
        'Respiratory failure from muscle weakness'
      ],
      differentialDiagnoses: ['Hyperkalemia', 'Complete heart block', 'Hypothermia', 'Drug toxicity (beta-blocker/CCB)'],
      mostLikelyDiagnosis: 'Life-threatening hyperkalemia secondary to missed dialysis in ESRD',
      supportingEvidence: ['Known ESRD', 'Missed dialysis x2', 'Classic ECG changes', 'Weakness and drowsiness']
    },
    managementPathway: {
      immediate: [
        'Calcium gluconate 10% 10mL IV over 2 minutes — FIRST priority (cardioprotection)',
        'High-flow oxygen 15L/min',
        'Sodium bicarbonate 50mEq (8.4%) IV — shifts K+ intracellularly',
        'Salbutamol 10mg nebulized — shifts K+ intracellularly',
        'Insulin 10 units + Glucose 50mL of 50% IV (if available) — shifts K+',
        'Avoid potassium-containing fluids (Hartmann/Ringer)',
        'Have defibrillator ready'
      ],
      definitive: [
        'Emergency dialysis at hospital',
        'Nephrology consultation',
        'Continuous cardiac monitoring in resus'
      ],
      monitoring: [
        'Continuous ECG — watch for VF/asystole',
        'Repeat ECG every 5 minutes to assess response',
        'BP every 2 minutes',
        'GCS every 5 minutes'
      ],
      transportConsiderations: [
        'Pre-alert with "hyperkalemia emergency — need urgent dialysis"',
        'Nearest facility with dialysis: Rashid Hospital or DHA facility',
        'Have defibrillator pads applied during transport',
        'Be prepared for cardiac arrest'
      ]
    },
    studentChecklist: [
      { id: 'litfl003-1', description: 'Identified hyperkalemia from history (missed dialysis)', category: 'clinical-reasoning', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl003-2', description: 'Recognized hyperkalemic ECG changes', category: 'clinical-reasoning', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl003-3', description: 'Administered calcium gluconate as first-line treatment', category: 'intervention', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl003-4', description: 'Avoided AV fistula arm for access/BP', category: 'intervention', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl003-5', description: 'Used potassium-shifting agents (salbutamol, bicarb)', category: 'intervention', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl003-6', description: 'Avoided potassium-containing fluids', category: 'intervention', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl003-7', description: 'Pre-alerted for emergency dialysis', category: 'communication', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] }
    ],
    teachingPoints: [
      'Hyperkalemia causes progressive ECG changes: peaked T → loss of P → wide QRS → sine wave → VF/asystole',
      'Calcium gluconate does NOT lower potassium — it stabilizes the myocardium (buys time)',
      'Potassium-shifting agents: insulin+glucose, salbutamol, sodium bicarbonate',
      'Dialysis is the only definitive treatment for hyperkalemia in ESRD',
      'Never use AV fistula limb for IV access, BP measurement, or tourniquets',
      'The 3 Bs of hyperkalemia ECG: Bradycardia, Blocks, Bizarre QRS',
      'Missed dialysis is a common precipitant — always ask about adherence'
    ],
    commonPitfalls: [
      'Treating bradycardia with atropine alone (ineffective in hyperkalemia)',
      'Using Hartmann solution (contains potassium)',
      'Measuring BP on fistula arm (damages access)',
      'Not giving calcium gluconate urgently enough',
      'Failing to recognize the ECG pattern as hyperkalemia'
    ],
    references: [
      'LITFL ECG Case 003: Hyperkalemia',
      'LITFL: Hyperkalemia',
      'UK Renal Association Guidelines: Acute Hyperkalemia',
      'Tintinalli Emergency Medicine 9th Ed, Chapter 16'
    ]
  }),

  // =========================================================================
  // CASE 3: Massive Pulmonary Embolism (LITFL ECG Case 007)
  // =========================================================================
  createCase({
    id: 'litfl-007',
    title: 'Massive Pulmonary Embolism with RV Strain',
    category: 'respiratory',
    subcategory: 'pulmonary-embolism',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Female, 42, sudden severe breathing difficulty and chest pain after long flight',
      timeOfDay: 'afternoon',
      location: 'Arrivals hall, Dubai International Airport Terminal 3',
      callerInfo: 'Airport medical staff called — passenger collapsed upon standing at baggage carousel',
      dispatchCode: 'Echo-1',
      additionalInfo: [
        'Patient arrived on 14-hour flight from London',
        'Collapsed after standing up from wheelchair at baggage claim',
        'Airport medical team providing oxygen'
      ]
    },
    patientInfo: {
      age: 42,
      gender: 'female',
      weight: 95,
      occupation: 'Marketing executive',
      language: 'English',
      culturalConsiderations: ['British national']
    },
    sceneInfo: {
      description: 'Airport arrivals hall, patient lying on floor near baggage carousel, airport medical team with basic equipment present. Wheelchair nearby.',
      hazards: ['Crowded public space', 'Moving baggage carousel nearby'],
      bystanders: 'Airport medical staff x2, multiple public bystanders, husband present',
      environment: 'Indoor air-conditioned terminal, well-lit',
      sceneImagePath: '/scene-assets/airport-pe-female-uae.png',
      sceneImageCaption: 'Dubai International Airport Terminal 3 Arrivals Hall',
      accessIssues: ['Need to clear crowd', 'Long distance to ambulance bay'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Middle-aged obese female, severe respiratory distress, cyanotic, tachycardic, looks critically unwell',
      position: 'Supine on floor, unable to sit up without severe dyspnea',
      appearance: 'Central cyanosis, diaphoretic, distressed, tachypneic',
      consciousness: 'Alert but anxious, speaks only 2-3 words at a time',
      sounds: ['Gasping', 'Cannot complete sentences', 'Tachycardic pulse audible']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent airway', 'No stridor', 'Speaking 2-3 words only'],
        interventions: ['High-flow oxygen 15L/min NRB', 'Position of comfort'],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 32,
        rhythm: 'Regular but rapid',
        depth: 'Shallow',
        spo2: 83,
        findings: [
          'Severe tachypnea',
          'Clear lungs on auscultation (important — no crackles/wheeze)',
          'Significant hypoxia resistant to oxygen (shunt physiology)',
          'Pleuritic chest pain right side'
        ],
        interventions: ['High-flow oxygen 15L/min NRB', 'BVM assist if SpO2 remains critical'],
        auscultation: ['Clear air entry bilaterally', 'No crackles', 'No wheeze', 'Accentuated P2']
      },
      circulation: {
        pulseRate: 128,
        pulseQuality: 'Rapid, thready',
        bp: { systolic: 88, diastolic: 52 },
        capillaryRefill: 5,
        skin: 'Cyanotic centrally, cool peripheries, diaphoretic',
        findings: [
          'Sinus tachycardia',
          'Hypotension — sign of massive PE with RV failure',
          'Elevated JVP (RV back-pressure)',
          'Unilateral left calf swelling and tenderness (DVT source)',
          'Central cyanosis despite high-flow O2'
        ],
        interventions: [
          'IV access x2',
          '500mL NS bolus (cautious — RV already failing)',
          'Consider thrombolysis if available (massive PE protocol)',
          'Prepare for cardiac arrest — PEA most likely arrest rhythm'
        ],
        ecgFindings: [
          'Sinus tachycardia ~128 bpm',
          'Right axis deviation',
          'S1Q3T3 pattern (S wave in I, Q wave in III, T inversion in III)',
          'T wave inversions V1-V4 (RV strain pattern)',
          'Inferior T wave inversions III, aVF',
          'Incomplete RBBB',
          'Dominant R wave in V1'
        ],
        ivAccess: ['18G right AC fossa', '18G left hand']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        bloodGlucose: 6.8,
        findings: ['Alert but confused at times', 'Severe anxiety', 'Agitated'],
        interventions: ['Reassurance']
      },
      exposure: {
        temperature: 37.1,
        findings: [
          'Left calf swollen, tender, warm compared to right',
          'Positive Homans sign (calf pain on dorsiflexion)',
          'No rashes',
          'Obesity'
        ],
        interventions: ['Full exposure', 'Keep warm']
      }
    },
    secondarySurvey: {
      head: ['No trauma', 'Central cyanosis'],
      neck: ['Elevated JVP', 'No lymphadenopathy'],
      chest: ['Clear lungs bilaterally', 'Accentuated P2', 'RV heave palpable'],
      abdomen: ['Soft', 'Mild hepatomegaly (RV back-pressure)'],
      pelvis: ['Stable'],
      extremities: ['Left calf swollen, tender, warm — DVT', 'Pitting oedema unilateral left leg', 'Right leg normal — no oedema', 'Cool peripheries both feet'],
      posterior: ['No abnormalities'],
      neurological: ['GCS 14 (E4V4M6)', 'Anxious and agitated']
    },
    history: {
      medications: [
        { name: 'Combined oral contraceptive', dose: 'Standard', frequency: 'Daily', indication: 'Contraception', route: 'PO' }
      ],
      allergies: ['None known'],
      medicalConditions: ['Obesity (BMI 34)', 'On combined OCP', 'Varicose veins'],
      surgicalHistory: ['None'],
      lastMeal: 'Airline meal 4 hours ago',
      eventsLeading: 'Flew London to Dubai (14-hour flight, economy class). Noticed left calf pain and swelling during flight. Upon standing at baggage carousel, experienced sudden severe shortness of breath, right-sided chest pain, and nearly lost consciousness. Husband caught her as she collapsed.',
      socialHistory: {
        smoking: 'Non-smoker',
        alcohol: 'Occasional wine',
        occupation: 'Marketing executive — desk-based, sedentary'
      }
    },
    investigations: [
      { name: '12-lead ECG', indication: 'Collapse with dyspnea post-flight', findings: 'RV strain pattern consistent with massive PE', interpretation: 'Sinus tachy, S1Q3T3, T inversions V1-V4, right axis deviation', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '88/52', pulse: 128, respiration: 32, spo2: 83, gcs: 14, temperature: 37.1, etco2: 22, bloodGlucose: 6.8 },
      afterIntervention: { bp: '92/56', pulse: 115, respiration: 16, spo2: 94, gcs: 14, etco2: 28 },
      deterioration: { bp: '65/35', pulse: 140, respiration: 40, spo2: 70, gcs: 8, etco2: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'Post-long-haul flight with DVT risk factors (OCP, obesity, immobility)',
        'Unilateral calf swelling — DVT source',
        'Severe hypoxia with CLEAR lungs (shunt physiology)',
        'Low EtCO2 despite tachypnea (dead-space ventilation)',
        'S1Q3T3 pattern on ECG — classic but not sensitive for PE'
      ],
      redFlags: [
        'Massive PE with hemodynamic compromise (systolic <90)',
        'Refractory hypoxia despite high-flow O2',
        'Risk of PEA cardiac arrest',
        'Signs of acute RV failure (elevated JVP, RV heave)'
      ],
      differentialDiagnoses: ['Massive pulmonary embolism', 'Acute MI', 'Tension pneumothorax', 'Cardiac tamponade', 'Anaphylaxis'],
      mostLikelyDiagnosis: 'Massive pulmonary embolism with hemodynamic compromise',
      supportingEvidence: [
        'Wells score: high (DVT symptoms, tachycardia, immobilization, PE most likely)',
        'DVT in left calf',
        'Post-long-haul flight',
        'Multiple risk factors (OCP, obesity)',
        'ECG showing RV strain'
      ]
    },
    managementPathway: {
      immediate: [
        'High-flow oxygen 15L/min — BVM assist if needed',
        'IV access x2',
        'Cautious 250-500mL NS bolus (avoid overloading failing RV)',
        'Consider IV heparin 5000 IU if massive PE confirmed clinically',
        'Prepare for cardiac arrest — thrombolysis during CPR if PEA arrest',
        'Continuous ECG monitoring'
      ],
      definitive: [
        'CT pulmonary angiography at hospital',
        'Systemic thrombolysis if massive PE with shock',
        'Catheter-directed therapy or surgical embolectomy',
        'ICU admission'
      ],
      monitoring: [
        'SpO2 continuous',
        'ECG continuous — watch for PEA',
        'BP every 2 minutes',
        'EtCO2 — rising may indicate improving perfusion'
      ],
      transportConsiderations: [
        'Nearest facility: DXB Airport Clinic for stabilization, then Rashid Hospital',
        'Pre-alert with "suspected massive PE with hemodynamic compromise"',
        'Position: semi-recumbent if tolerated',
        'Have thrombolytic agent ready if cardiac arrest occurs during transport'
      ]
    },
    studentChecklist: [
      { id: 'litfl007-1', description: 'Identified PE risk factors (flight, DVT, OCP, obesity)', category: 'clinical-reasoning', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl007-2', description: 'Recognized DVT as source (unilateral calf swelling)', category: 'clinical-reasoning', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl007-3', description: 'Noted clear lungs with severe hypoxia (shunt)', category: 'clinical-reasoning', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl007-4', description: 'Recognized RV strain pattern on ECG', category: 'clinical-reasoning', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl007-5', description: 'Noted low EtCO2 (dead-space ventilation)', category: 'clinical-reasoning', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl007-6', description: 'Cautious fluid resuscitation', category: 'intervention', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl007-7', description: 'Prepared for PEA cardiac arrest', category: 'clinical-reasoning', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl007-8', description: 'Pre-alerted receiving facility', category: 'communication', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] }
    ],
    teachingPoints: [
      'Massive PE = PE with hemodynamic compromise (systolic <90 or requiring vasopressors)',
      'Clear lungs with severe hypoxia = think PE (V/Q mismatch and shunt)',
      'Low EtCO2 in PE reflects dead-space ventilation (ventilated but not perfused)',
      'S1Q3T3 is specific but NOT sensitive — absence does not exclude PE',
      'RV strain pattern (T inversions V1-4) is more reliable than S1Q3T3',
      'Fluid resuscitation must be cautious — the RV is already failing and volume-overloaded',
      'In PEA arrest from PE: consider thrombolysis during CPR (alteplase 50mg IV)',
      'Virchow triad: stasis (long flight), endothelial injury, hypercoagulability (OCP)'
    ],
    commonPitfalls: [
      'Diagnosing as pneumonia or asthma (lungs are clear!)',
      'Aggressive IV fluids in RV failure (worsens dilation)',
      'Not recognizing low EtCO2 as significant',
      'Not preparing for cardiac arrest (high risk)',
      'Missing the DVT (not examining calves)'
    ],
    references: [
      'LITFL ECG Case 007: Pulmonary Embolism',
      'LITFL: Pulmonary Embolism ECG Changes',
      'ESC Guidelines: Acute Pulmonary Embolism 2019',
      'Tintinalli Emergency Medicine 9th Ed, Chapter 56'
    ]
  }),

  // =========================================================================
  // CASE 4: Hypothermia with Osborn Waves (LITFL ECG Case 010)
  // =========================================================================
  createCase({
    id: 'litfl-010',
    title: 'Severe Hypothermia with Osborn Waves',
    category: 'environmental',
    subcategory: 'hypothermia',
    // ROUTING NOTE: explicit rhythm override — the circulation findings contain
    // the safety phrase "DO NOT defibrillate below 30°C — VF is refractory…",
    // and the keyword rhythm detector was picking the stray "VF" out of it,
    // forcing this NON-arrest case (pulse 35, GCS 8) into arrest vitals. The
    // authored rhythm is severe sinus bradycardia with Osborn waves.
    initialRhythm: 'Sinus Bradycardia',
    priority: 'critical',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Elderly person found unresponsive on balcony, very cold',
      timeOfDay: 'early-morning',
      location: 'Apartment in Fujairah, ground floor',
      callerInfo: 'Neighbor found patient on open balcony, appears unconscious',
      dispatchCode: 'Delta-1',
      additionalInfo: [
        'Patient appears to have been outside all night',
        'Temperature dropped to 12°C overnight (winter, mountainous area)',
        'Patient found in nightclothes, no blanket'
      ]
    },
    patientInfo: {
      age: 82,
      gender: 'female',
      weight: 55,
      occupation: 'Retired',
      language: 'Arabic',
      culturalConsiderations: ['Emirati national', 'Lives alone since husband passed']
    },
    sceneInfo: {
      description: 'Ground floor apartment, patient found on open balcony in nightgown. Cold to touch, minimally responsive. Empty glass nearby — appears to have fallen asleep on balcony.',
      hazards: ['Hypothermia risk to crew in prolonged assessment'],
      bystanders: 'Neighbor who discovered patient',
      environment: 'Outdoor balcony, ambient 14°C, windy. Move patient indoors immediately.',
      sceneImagePath: '/scene-assets/litfl-010-balcony-hypothermia-fujairah.png',
      sceneImageCaption: 'Fujairah apartment balcony — early morning hypothermia case',
      accessIssues: ['Ground floor, easy access'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Elderly female, profoundly cold, bradycardic, minimally responsive — critical hypothermia',
      position: 'Semi-recumbent in balcony chair',
      appearance: 'Pale/grey, cold to touch, mild cyanosis, bradycardic',
      consciousness: 'Responds to pain only — eyes open briefly',
      sounds: ['No verbalizations', 'Slow irregular breathing audible']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'No obstruction', 'Weak gag reflex present'],
        interventions: ['Head tilt chin lift', 'Oropharyngeal airway if tolerated', 'Suction available'],
        adjunctsNeeded: ['OPA size 2']
      },
      breathing: {
        rate: 8,
        rhythm: 'Irregular, shallow',
        depth: 'Shallow',
        spo2: 88,
        findings: [
          'Profoundly bradypneic (8/min)',
          'Shallow respirations',
          'SpO2 may be unreliable (peripheral vasoconstriction)',
          'No added sounds'
        ],
        interventions: ['Warmed humidified oxygen if available', 'BVM assist ventilations if rate <8'],
        auscultation: ['Diminished but clear bilaterally', 'No added sounds']
      },
      circulation: {
        pulseRate: 35,
        pulseQuality: 'Very slow, weak, difficult to palpate',
        bp: { systolic: 80, diastolic: 50 },
        capillaryRefill: 8,
        skin: 'Cold (core temp 28°C by tympanic), pale, mottled',
        findings: [
          'Severe bradycardia 35 bpm',
          'Check pulse for 60 seconds (may be extremely slow but present)',
          'Core temperature 28°C (severe hypothermia)',
          'Peripheral pulses barely palpable',
          'Osborn waves on ECG',
          'DO NOT defibrillate below 30°C — VF is refractory until rewarmed'
        ],
        interventions: [
          'IV access — warmed fluids if available (avoid cold fluid boluses)',
          'GENTLE handling — rough movement can trigger VF',
          'Passive rewarming: remove wet clothes, warm blankets, insulate from ground',
          'Active rewarming: warm IV fluids 40°C, warm packs to axillae/groin/neck',
          'Avoid medications until core temp >30°C (ineffective when cold)'
        ],
        ecgFindings: [
          'Severe sinus bradycardia 35 bpm',
          'Osborn waves (J waves) — pathognomonic for hypothermia',
          'Osborn waves prominent in V2-V6',
          'Prolonged QT interval (~600ms)',
          'Baseline artifact from shivering (fine tremor)',
          'Prolonged PR interval'
        ],
        ivAccess: ['20G right hand — difficult access, vasoconstricted']
      },
      disability: {
        avpu: 'P',
        gcs: { eye: 2, verbal: 2, motor: 4, total: 8 },
        pupils: 'Sluggish, 4mm bilaterally (hypothermia causes mydriasis)',
        bloodGlucose: 4.2,
        findings: ['Responds to pain only', 'Sluggish pupil response (expected in hypothermia)', 'No focal deficits discernible'],
        interventions: ['Monitor GCS', 'Consider other causes of collapse (stroke, fall)']
      },
      exposure: {
        temperature: 28.0,
        findings: [
          'Core temperature 28°C — severe hypothermia',
          'No obvious trauma (but elderly fall risk)',
          'Cold, mottled extremities',
          'No shivering (below shivering threshold at <30°C)'
        ],
        interventions: [
          'Remove wet/cold clothing',
          'Wrap in warm blankets and space blanket',
          'Insulate from ground (carry sheet/blankets underneath)',
          'Protect from wind'
        ]
      }
    },
    secondarySurvey: {
      head: ['No trauma detected', 'Tympanic temp 28°C'],
      neck: ['C-spine precautions if fall suspected'],
      chest: ['Heart sounds distant', 'Clear lungs'],
      abdomen: ['Soft, non-tender (difficult to assess — patient barely responsive)'],
      pelvis: ['Stable'],
      extremities: ['Cold, mottled', 'No obvious fractures', 'Very poor peripheral perfusion', 'No peripheral oedema'],
      posterior: ['Log roll carefully — avoid triggering VF', 'No deformity'],
      neurological: ['GCS 8 (E2V2M4)', 'Pupils sluggish (expected)']
    },
    history: {
      medications: [
        { name: 'Donepezil', dose: '5mg', frequency: 'Daily', indication: 'Mild dementia', route: 'PO' },
        { name: 'Lisinopril', dose: '10mg', frequency: 'Daily', indication: 'Hypertension', route: 'PO' },
        { name: 'Aspirin', dose: '75mg', frequency: 'Daily', indication: 'Cardiovascular prophylaxis', route: 'PO' }
      ],
      allergies: ['None known'],
      medicalConditions: ['Mild Alzheimer dementia', 'Hypertension', 'Osteoarthritis'],
      surgicalHistory: ['Right knee replacement 2018'],
      lastMeal: 'Unknown — possibly dinner last evening',
      eventsLeading: 'Lives alone. Neighbor noticed apartment lights on all night. Found patient on open balcony at 6am in nightgown. Appears to have sat on balcony and fallen asleep — possibly confused due to dementia. Overnight temperatures dropped to 12°C.',
      socialHistory: {
        smoking: 'Never',
        alcohol: 'None',
        occupation: 'Retired'
      }
    },
    investigations: [
      { name: '12-lead ECG', indication: 'Severe bradycardia, hypothermia', findings: 'Osborn waves, prolonged QT', interpretation: 'Classic hypothermia ECG with J waves', urgency: 'immediate' },
      { name: 'Core temperature', indication: 'Environmental exposure', findings: '28°C tympanic', interpretation: 'Severe hypothermia (Stage III)', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '80/50', pulse: 35, respiration: 8, spo2: 88, gcs: 8, temperature: 28.0, bloodGlucose: 4.2, etco2: 25 },
      afterIntervention: { bp: '95/60', pulse: 55, respiration: 14, spo2: 94, gcs: 11, temperature: 31.0, etco2: 32 },
      deterioration: { bp: '60/30', pulse: 20, respiration: 4, spo2: 70, gcs: 3, temperature: 26.0, etco2: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'Elderly, dementia, found outdoors — classic accidental hypothermia scenario',
        'Osborn (J) waves on ECG — pathognomonic for hypothermia',
        'No shivering — indicates severe hypothermia (<30°C)',
        'Dilated sluggish pupils — normal in hypothermia (not a sign of brain death)',
        'Prolonged QT — risk of arrhythmias'
      ],
      redFlags: [
        'Core temp <30°C — refractory to defibrillation',
        'Risk of VF from rough handling or cold IV fluids',
        'Hypoglycemia possible (check BGL)',
        'Cannot declare death until patient is warm and dead'
      ],
      differentialDiagnoses: ['Accidental hypothermia', 'Stroke with collapse', 'Hypoglycemia', 'Drug overdose', 'Sepsis'],
      mostLikelyDiagnosis: 'Severe accidental hypothermia (Stage III, core 28°C)',
      supportingEvidence: ['Environmental exposure overnight', 'Core temperature 28°C', 'Classic ECG with Osborn waves', 'Absent shivering']
    },
    managementPathway: {
      immediate: [
        'GENTLE handling at all times — rough movement triggers VF',
        'Move indoors immediately',
        'Remove cold/wet clothing, apply warm blankets',
        'Insulate from ground',
        'Warm humidified oxygen if available',
        'Warm IV fluids (40°C) if possible — small boluses',
        'Avoid medications until core >30°C',
        'Check BGL — treat hypoglycemia',
        'If VF occurs at <30°C: single shock, then rewarm before further attempts'
      ],
      definitive: [
        'Hospital-based active rewarming (warm bladder lavage, warm IV fluids)',
        'ECMO/cardiopulmonary bypass in refractory cases',
        'ICU admission for monitoring during rewarming'
      ],
      monitoring: [
        'Continuous ECG — VF risk during rewarming',
        'Core temperature serial monitoring',
        'BP every 5 minutes',
        'Watch for rewarming dysrhythmias'
      ],
      transportConsiderations: [
        'Handle patient extremely gently — horizontal position',
        'Pre-alert: "Severe hypothermia, core 28°C, need active rewarming capability"',
        'Keep warm during transport — ambulance heating on maximum',
        'Be prepared for cardiac arrest — VF is common during rewarming'
      ]
    },
    studentChecklist: [
      { id: 'litfl010-1', description: 'Measured core temperature', category: 'abcde', points: 8, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate'] },
      { id: 'litfl010-2', description: 'Recognized Osborn waves on ECG', category: 'clinical-reasoning', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate'] },
      { id: 'litfl010-3', description: 'Handled patient gently (VF prevention)', category: 'intervention', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate'] },
      { id: 'litfl010-4', description: 'Passive rewarming initiated', category: 'intervention', points: 8, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate'] },
      { id: 'litfl010-5', description: 'Checked blood glucose', category: 'abcde', points: 7, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate'] },
      { id: 'litfl010-6', description: 'Avoided medications below 30°C', category: 'intervention', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate'] },
      { id: 'litfl010-7', description: 'Used warmed IV fluids', category: 'intervention', points: 8, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate'] },
      { id: 'litfl010-8', description: 'Understood defibrillation limitations below 30°C', category: 'clinical-reasoning', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate'] }
    ],
    teachingPoints: [
      'Osborn (J) waves are pathognomonic for hypothermia — positive deflection at the J point',
      '"You\'re not dead until you\'re warm and dead" — no patient should be declared dead while hypothermic',
      'Below 30°C: shivering stops, defibrillation is usually ineffective, drugs are not metabolized',
      'Handle GENTLY — rough movement can precipitate VF in hypothermia',
      'Pupil dilation and areflexia are NORMAL in severe hypothermia — not indicators of death',
      'Rewarming dysrhythmias are common — monitor closely during rewarming',
      'Always consider WHY they became hypothermic (stroke, fall, overdose, sepsis)'
    ],
    commonPitfalls: [
      'Declaring patient dead based on unresponsive pupils (normal in hypothermia)',
      'Rough handling or vigorous stimulation (triggers VF)',
      'Repeated defibrillation below 30°C (futile until rewarmed)',
      'Giving medications below 30°C (accumulate, then toxicity on rewarming)',
      'Cold IV fluid boluses (worsen hypothermia)',
      'Not measuring core temperature'
    ],
    references: [
      'LITFL ECG Case 010: Hypothermia',
      'LITFL: Osborn Wave (J Wave)',
      'ERC Guidelines: Hypothermia',
      'Wilderness Medical Society Guidelines: Accidental Hypothermia'
    ]
  }),

  // =========================================================================
  // CASE 5: De Winter T-Wave Pattern — STEMI Equivalent (LITFL ECG Case 019)
  // =========================================================================
  createCase({
    id: 'litfl-019',
    title: 'De Winter T-Wave Pattern — LAD Occlusion STEMI Equivalent',
    category: 'cardiac',
    subcategory: 'acute-coronary-syndrome',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Male, 51, crushing chest pain for 30 minutes, diaphoretic',
      timeOfDay: 'morning',
      location: 'Office building, DIFC, Dubai',
      callerInfo: 'Reception staff — executive collapsed at desk',
      dispatchCode: 'Echo-1',
      additionalInfo: [
        'Patient is a known smoker',
        'Crushing chest pain, described as "elephant sitting on chest"',
        'Sweating profusely'
      ]
    },
    patientInfo: {
      age: 51,
      gender: 'male',
      weight: 88,
      occupation: 'Finance director',
      language: 'English, Arabic',
      culturalConsiderations: ['Lebanese national']
    },
    sceneInfo: {
      description: 'Modern office building, patient sitting in desk chair, grey and sweating. Papers scattered on floor. Colleagues hovering anxiously.',
      hazards: [
        'Scattered papers on the office floor — trip hazard',
        'Four anxious colleagues crowding the patient — clear a working space',
      ],
      bystanders: '4 colleagues, office first-aider with AED',
      environment: 'Air-conditioned office, 5th floor',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/office-medical-dubai.png',
      sceneImageCaption: 'Scene — Air-conditioned office, 5th floor',
      accessIssues: ['Elevator access', 'Narrow office corridors'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, diaphoretic, grey complexion, clutching chest, severe pain',
      position: 'Sitting in office chair, leaning forward',
      appearance: 'Grey, diaphoretic, distressed, nauseated',
      consciousness: 'Alert and oriented',
      sounds: ['Groaning with pain', 'Occasional retching']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking full sentences', 'Occasional retching'],
        interventions: ['Vomit bowl ready'],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 24,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 95,
        findings: ['Mildly tachypneic', 'Clear bilateral air entry'],
        interventions: ['Oxygen 15L/min NRB'],
        auscultation: ['Clear bilaterally', 'No added sounds']
      },
      circulation: {
        pulseRate: 95,
        pulseQuality: 'Regular, moderate volume',
        bp: { systolic: 145, diastolic: 90 },
        capillaryRefill: 2,
        skin: 'Grey, diaphoretic, warm centrally',
        findings: [
          'Pain 10/10 crushing substernal',
          'Radiates to left arm and jaw',
          'Nausea, one episode vomiting',
          'De Winter T-wave pattern on ECG — STEMI equivalent!'
        ],
        interventions: [
          'IV access x2',
          'Aspirin 300mg PO (crushed/chewed)',
          'Morphine 2.5-5mg IV titrated for pain',
          'Ondansetron 4mg IV for nausea',
          'GTN spray 400mcg SL IF systolic >100',
          'TREAT AS STEMI — activate cath lab'
        ],
        ecgFindings: [
          'Sinus rhythm 95 bpm',
          'NO classic ST elevation',
          'Upsloping ST depression in V2-V5 merging with tall, prominent T waves',
          'This is the De Winter T-wave pattern — a STEMI EQUIVALENT',
          'Represents ~2% of LAD occlusions',
          'Subtle ST elevation in aVR',
          'Normal axis, no bundle branch block'
        ],
        ivAccess: ['18G right AC fossa', '18G left hand']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 8.2,
        findings: ['Alert, oriented', 'Anxious', 'No focal deficits'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Diaphoretic', 'No rashes', 'No edema'],
        interventions: ['Loosen clothing']
      }
    },
    secondarySurvey: {
      head: ['No trauma', 'Diaphoretic'],
      neck: ['Normal JVP', 'No carotid bruits'],
      chest: ['Equal expansion', 'S1S2 normal', 'Clear lungs'],
      abdomen: ['Soft', 'Mild epigastric tenderness (referred pain)'],
      pelvis: ['Stable'],
      extremities: ['No peripheral oedema', 'Good perfusion'],
      posterior: ['No abnormalities'],
      neurological: ['GCS 15']
    },
    history: {
      medications: [
        { name: 'Atorvastatin', dose: '20mg', frequency: 'Daily', indication: 'Hyperlipidemia', route: 'PO' }
      ],
      allergies: ['None known'],
      medicalConditions: ['Hyperlipidemia', 'Family history of MI (father died age 52)', 'Smoker (30 pack-years)', 'Stress'],
      surgicalHistory: ['None'],
      lastMeal: 'Coffee 1 hour ago',
      eventsLeading: 'Sudden onset crushing central chest pain 30 minutes ago during morning meeting. Described as worst pain ever — "like an elephant sitting on my chest." Radiating to left arm, jaw, and back. Associated with nausea, vomiting x1, and profuse sweating. No relief from rest. No previous episodes.',
      socialHistory: {
        smoking: '30 pack-years, currently 20/day',
        alcohol: 'Moderate — wine most evenings',
        occupation: 'Finance director — extremely high stress'
      }
    },
    investigations: [
      { name: '12-lead ECG', indication: 'Acute chest pain', findings: 'De Winter T-wave pattern', interpretation: 'STEMI equivalent — LAD occlusion in ~2% of cases presents this way', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '145/90', pulse: 95, respiration: 24, spo2: 95, gcs: 15, temperature: 36.8, bloodGlucose: 8.2, etco2: 34 },
      afterIntervention: { bp: '100/64', pulse: 74, respiration: 14, spo2: 99, gcs: 15, etco2: 36 },
      deterioration: { bp: '85/55', pulse: 130, respiration: 30, spo2: 88, gcs: 13, etco2: 25 }
    },
    expectedFindings: {
      keyObservations: [
        'Classic ACS presentation — crushing chest pain, diaphoresis, nausea',
        'ECG shows NO classic ST elevation — could be missed!',
        'De Winter pattern: upsloping ST depression + tall T waves in V2-V5',
        'This pattern indicates acute LAD occlusion — treat as STEMI',
        'Multiple cardiovascular risk factors'
      ],
      redFlags: [
        'STEMI equivalent that can be MISSED if only looking for ST elevation',
        'Family history of sudden cardiac death at age 52',
        'Risk of VF — acute LAD occlusion',
        'Pattern may evolve into classic STEMI or VF at any moment'
      ],
      differentialDiagnoses: ['Acute MI (De Winter pattern)', 'NSTEMI', 'Aortic dissection', 'Pericarditis'],
      mostLikelyDiagnosis: 'Acute anterior STEMI equivalent (De Winter T-wave pattern) — LAD occlusion',
      supportingEvidence: [
        'Classic ACS presentation',
        'De Winter ECG pattern in V2-V5',
        'Multiple cardiovascular risk factors',
        'Family history of premature CAD'
      ]
    },
    managementPathway: {
      immediate: [
        'TREAT AS STEMI — activate cath lab / STEMI code',
        'Aspirin 300mg PO',
        'GTN spray if systolic >100',
        'Morphine titrated for pain',
        'Ondansetron for nausea',
        'High-flow oxygen if SpO2 <94%',
        'Serial ECGs every 10 minutes — may evolve into classic STEMI'
      ],
      definitive: [
        'Emergency PCI — LAD intervention',
        'Pre-alert with "STEMI equivalent — De Winter pattern"',
        'Target door-to-balloon <90 minutes'
      ],
      monitoring: [
        'Continuous ECG — VF risk',
        'BP every 3 minutes',
        'Defibrillator pads applied',
        'Serial 12-lead ECGs'
      ],
      transportConsiderations: [
        'Nearest PCI-capable facility',
        'Communicate "De Winter pattern" explicitly — some receiving teams may not know this pattern',
        'Provide 12-lead ECG strip to receiving team'
      ]
    },
    studentChecklist: [
      { id: 'litfl019-1', description: 'Recognized De Winter pattern as STEMI equivalent', category: 'clinical-reasoning', points: 25, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'litfl019-2', description: 'Activated STEMI code despite no classic STE', category: 'communication', points: 25, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'litfl019-3', description: 'Administered aspirin', category: 'intervention', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'litfl019-4', description: 'Appropriate pain management', category: 'intervention', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'litfl019-5', description: 'Serial ECGs performed', category: 'procedural', points: 20, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'litfl019-6', description: 'Defibrillator ready for VF', category: 'clinical-reasoning', points: 20, yearLevel: ['4th-year'], complexity: ['expert'] }
    ],
    teachingPoints: [
      'De Winter T-wave pattern: upsloping ST depression in V2-V5 merging with tall, prominent, symmetric T waves',
      'This represents ~2% of all LAD occlusions — must be recognized as a STEMI equivalent',
      'The pattern can evolve into classic STEMI or the other way around',
      'Absence of ST elevation does NOT mean there is no acute coronary occlusion',
      'Subtle ST elevation in aVR may be present (significant when combined)',
      'Treat identically to anterior STEMI — immediate PCI',
      'Always communicate the specific pattern name — receiving team may need to look it up'
    ],
    commonPitfalls: [
      'Dismissing as NSTEMI because there is no ST elevation',
      'Not recognizing the De Winter pattern (not widely taught)',
      'Delayed cath lab activation',
      'Not performing serial ECGs (pattern may evolve)',
      'Failing to communicate specific findings to receiving hospital'
    ],
    references: [
      'LITFL ECG Case 019: De Winter T-wave Pattern',
      'De Winter et al. (2008) N Engl J Med 359:2071-3',
      'LITFL: De Winter T-wave Pattern',
      'AHA/ACC STEMI Guidelines'
    ]
  }),

  // =========================================================================
  // CASE 6: Subarachnoid Hemorrhage with Cerebral T Waves (LITFL ECG 012)
  // =========================================================================
  createCase({
    id: 'litfl-012',
    title: 'Subarachnoid Hemorrhage with Cerebral T Waves',
    category: 'neurological',
    subcategory: 'cerebrovascular-emergency',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Male, 35, found collapsed at home, unresponsive',
      timeOfDay: 'afternoon',
      location: 'Staff accommodation, Al Nahda, Sharjah',
      callerInfo: 'Roommate found patient collapsed on bathroom floor — called 998',
      dispatchCode: 'Delta-1',
      additionalInfo: [
        'Patient found unconscious on bathroom floor',
        'May have been there for several hours',
        'Roommate heard a loud thud earlier but assumed patient dropped something'
      ]
    },
    patientInfo: {
      age: 35,
      gender: 'male',
      weight: 75,
      occupation: 'IT engineer',
      language: 'English, Tagalog',
      culturalConsiderations: ['Filipino national']
    },
    sceneInfo: {
      description: 'Shared staff accommodation. Patient found supine on bathroom floor. No evidence of trauma mechanism, no blood visible. Vomitus on floor near head.',
      hazards: ['Slippery bathroom floor'],
      bystanders: 'Roommate present, anxious',
      environment: 'Indoor, small bathroom, warm',
      environmentVariant: 'home',
      sceneImagePath: '/scene-assets/staff-accommodation-collapse-sharjah.png',
      sceneImageCaption: 'Scene — Shared staff accommodation bathroom, Al Nahda, Sharjah',
      accessIssues: ['Small bathroom — limited working space', 'Need to move patient to larger area'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Young male, unresponsive, vomitus around mouth, decerebrate posturing to painful stimuli',
      position: 'Supine on bathroom floor',
      appearance: 'Unresponsive, vomitus around mouth, no external trauma visible',
      consciousness: 'Unresponsive — responds to pain with extensor posturing',
      sounds: ['Snoring respirations', 'No verbalization']
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Partial obstruction — snoring', 'Vomitus in oropharynx', 'No gag reflex'],
        interventions: ['Suction oropharynx', 'Head tilt chin lift', 'Insert OPA size 4', 'Recovery position if not protecting own airway'],
        adjunctsNeeded: ['OPA size 4', 'Suction unit', 'Consider iGel/supraglottic if GCS remains <8']
      },
      breathing: {
        rate: 10,
        rhythm: 'Irregular — Cheyne-Stokes pattern',
        depth: 'Variable — alternating deep and shallow',
        spo2: 91,
        findings: [
          'Cheyne-Stokes respiration (crescendo-decrescendo pattern)',
          'Irregular rate',
          'SpO2 variable with breathing pattern'
        ],
        interventions: ['High-flow oxygen 15L/min NRB', 'BVM assist if apneic phases >10 seconds', 'Prepare for intubation/iGel'],
        auscultation: ['Transmitted upper airway sounds', 'Clear bases']
      },
      circulation: {
        pulseRate: 55,
        pulseQuality: 'Slow, bounding (Cushing response)',
        bp: { systolic: 210, diastolic: 115 },
        capillaryRefill: 2,
        skin: 'Warm, flushed face, normal color',
        findings: [
          'Cushing triad: hypertension + bradycardia + irregular respirations',
          'This indicates raised intracranial pressure',
          'Cerebral T waves on ECG — may mimic cardiac event',
          'DO NOT lower BP aggressively in the field'
        ],
        interventions: [
          'IV access',
          'DO NOT treat the hypertension (Cushing response = protective)',
          'Avoid excessive IV fluids',
          'Position: head up 30° if spinal injury excluded'
        ],
        ecgFindings: [
          'Sinus bradycardia 55 bpm',
          'Giant T wave inversions in multiple leads (V2-V6, I, II, aVL)',
          'Markedly prolonged QT interval (~620ms)',
          'Cerebral T waves — NOT cardiac ischemia',
          'These changes reflect massive sympathetic surge from raised ICP',
          'May see U waves'
        ],
        ivAccess: ['18G right AC fossa']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 3, total: 5 },
        pupils: 'Left pupil 6mm fixed, right 3mm reactive — UNEQUAL (uncal herniation)',
        bloodGlucose: 9.5,
        findings: [
          'GCS 5 (E1V1M3)',
          'Decerebrate posturing to pain (extension)',
          'Unilateral dilated fixed pupil — LEFT 6mm (uncal herniation)',
          'Right pupil 3mm, sluggishly reactive',
          'No localizing signs in limbs',
          'Hyperglycemia (stress response)'
        ],
        interventions: [
          'Airway protection — GCS <8 requires definitive airway',
          'Head up 30° to reduce ICP',
          'Avoid hypoxia (maintain SpO2 >94%)',
          'Avoid hypotension (maintain MAP >80)',
          'Avoid hyperventilation (target EtCO2 35-40)'
        ],
        focalDeficits: ['Left pupil fixed and dilated — ipsilateral to herniation']
      },
      exposure: {
        temperature: 37.3,
        findings: ['No external trauma visible', 'No rashes', 'No neck stiffness (cannot fully assess in unresponsive patient)'],
        interventions: ['Full exposure', 'Log roll with C-spine precautions']
      }
    },
    secondarySurvey: {
      head: ['No external trauma', 'Left pupil blown', 'No mastoid bruising', 'No CSF leak'],
      neck: ['C-spine protected', 'Cannot assess neck stiffness reliably'],
      chest: ['Clear', 'Normal heart sounds'],
      abdomen: ['Soft'],
      pelvis: ['Stable'],
      extremities: ['Decerebrate posturing bilaterally to pain', 'No fractures', 'No peripheral oedema'],
      posterior: ['No abnormalities on log roll'],
      neurological: ['GCS 5 E1V1M3', 'Left blown pupil', 'Decerebrate posturing', 'Cushing triad present']
    },
    history: {
      medications: [],
      allergies: ['None known per roommate'],
      medicalConditions: ['Previously well per roommate', 'Occasional headaches'],
      surgicalHistory: ['None known'],
      lastMeal: 'Lunch approximately 3 hours ago per roommate',
      eventsLeading: 'Roommate heard a loud thud from bathroom approximately 2 hours ago. When patient did not emerge, roommate checked and found him collapsed on floor. No known head injury mechanism. Patient had complained of "the worst headache of my life" earlier today. No drug use. No alcohol.',
      socialHistory: {
        smoking: 'Non-smoker',
        alcohol: 'Social — occasional beer',
        occupation: 'IT engineer'
      }
    },
    investigations: [
      { name: '12-lead ECG', indication: 'Unresponsive patient with bradycardia', findings: 'Cerebral T waves, prolonged QT', interpretation: 'Raised ICP — NOT cardiac ischemia. Giant T inversions from catecholamine surge.', urgency: 'immediate' },
      { name: 'Blood glucose', indication: 'Altered consciousness', findings: '9.5 mmol/L', interpretation: 'Stress hyperglycemia — consistent with severe neurological event', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '210/115', pulse: 55, respiration: 10, spo2: 91, gcs: 5, temperature: 37.3, bloodGlucose: 9.5, etco2: 38 },
      afterIntervention: { bp: '190/100', pulse: 60, respiration: 14, spo2: 97, gcs: 5, temperature: 37.3, etco2: 36 },
      deterioration: { bp: '240/130', pulse: 40, respiration: 6, spo2: 80, gcs: 3, etco2: 50 }
    },
    expectedFindings: {
      keyObservations: [
        '"Worst headache of my life" — classic thunderclap headache of SAH',
        'Cushing triad (hypertension, bradycardia, irregular breathing) — raised ICP',
        'Unilateral blown pupil — uncal herniation in progress',
        'Cerebral T waves on ECG — easily mistaken for cardiac event',
        'GCS 5 — needs definitive airway management'
      ],
      redFlags: [
        'Uncal herniation (blown pupil) — neurosurgical emergency',
        'Cushing triad — brainstem compression',
        'GCS <8 without airway protection',
        'Giant T wave inversions may trigger inappropriate cardiac workup'
      ],
      differentialDiagnoses: ['Subarachnoid hemorrhage', 'Intracerebral hemorrhage', 'Acute MI', 'Drug overdose', 'Status epilepticus', 'Meningitis'],
      mostLikelyDiagnosis: 'Aneurysmal subarachnoid hemorrhage with raised ICP and uncal herniation',
      supportingEvidence: [
        'Thunderclap headache preceding collapse',
        'Cushing triad',
        'Unilateral blown pupil',
        'Young patient with no cardiac history',
        'Cerebral T waves on ECG'
      ]
    },
    managementPathway: {
      immediate: [
        'Secure airway — GCS <8, insert iGel or prepare RSI',
        'High-flow oxygen — maintain SpO2 >94%',
        'Do NOT lower blood pressure (Cushing response is protective)',
        'Head up 30° (if C-spine cleared)',
        'Maintain normocapnia — target EtCO2 35-40 (avoid hyperventilation)',
        'IV access — avoid excessive fluids',
        'Do NOT sedate without airway control'
      ],
      definitive: [
        'Urgent CT head at neurosurgical centre',
        'Neurosurgical consultation — aneurysm coiling or clipping',
        'EVD (external ventricular drain) if hydrocephalus',
        'Neurocritical care admission'
      ],
      monitoring: [
        'Pupil response every 5 minutes',
        'GCS serial assessments',
        'EtCO2 continuous — critical to avoid hypo/hypercapnia',
        'Continuous ECG (cerebral T waves, not cardiac)'
      ],
      transportConsiderations: [
        'Nearest neurosurgical centre (not just nearest hospital)',
        'Pre-alert: "SAH with raised ICP, blown pupil, GCS 5, needs neurosurgery"',
        'Time-critical — minimize scene time',
        'Transport head-up 30°'
      ]
    },
    studentChecklist: [
      { id: 'litfl012-1', description: 'Recognized Cushing triad', category: 'clinical-reasoning', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl012-2', description: 'Identified unilateral blown pupil (herniation)', category: 'clinical-reasoning', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl012-3', description: 'Recognized cerebral T waves (not cardiac)', category: 'clinical-reasoning', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl012-4', description: 'Secure airway for GCS <8 (LMA/i-gel for 3rd-year; RSI for 4th-year)', category: 'intervention', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl012-5', description: 'Did NOT lower blood pressure', category: 'intervention', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl012-6', description: 'Maintained normocapnia (EtCO2 35-40)', category: 'intervention', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl012-7', description: 'Head-up 30° positioning', category: 'intervention', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'litfl012-8', description: 'Transported to neurosurgical centre', category: 'communication', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] }
    ],
    teachingPoints: [
      'Cerebral T waves (giant T inversions + QT prolongation) mimic cardiac ischemia but are caused by massive catecholamine surge from raised ICP',
      '"Worst headache of my life" = thunderclap headache until proven otherwise = SAH',
      'Cushing triad: hypertension + bradycardia + irregular breathing = raised ICP',
      'Unilateral dilated fixed pupil = uncal herniation — neurosurgical emergency',
      'Do NOT lower BP in acute stroke/SAH — hypertension is the brain\'s attempt to perfuse past the obstruction',
      'Avoid hyperventilation — transient ICP reduction but causes cerebral vasoconstriction and worsens outcomes',
      'ECG in SAH can show ST changes, T inversions, QT prolongation — do not confuse with ACS'
    ],
    commonPitfalls: [
      'Treating ECG changes as cardiac event (cerebral T waves are neurological)',
      'Aggressively lowering blood pressure (removes cerebral perfusion pressure)',
      'Hyperventilating the patient (causes cerebral vasoconstriction)',
      'Not checking pupils serially (miss herniation progression)',
      'Transporting to nearest hospital instead of neurosurgical centre',
      'Not securing airway in GCS <8'
    ],
    references: [
      'LITFL ECG Case 012: Subarachnoid Hemorrhage',
      'LITFL: Raised Intracranial Pressure',
      'AHA/ASA Guidelines: SAH Management 2012',
      'Brain Trauma Foundation Guidelines'
    ]
  }),
];
