import type { CaseScenario } from '@/types';

// Helper function to create a case with enhanced structure
const createCase = (caseData: Partial<CaseScenario> & { id: string; title: string }): CaseScenario => ({
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...caseData,
} as CaseScenario);

// ============================================================================
// ADDITIONAL RESPIRATORY CASES (Adding 6+ cases)
// ============================================================================

export const additionalRespiratoryCases: CaseScenario[] = [
  createCase({
    id: 'resp-005',
    title: 'Severe COPD Exacerbation',
    category: 'respiratory',
    subcategory: 'copd',
    priority: 'high',
    complexity: 'advanced',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Elderly man struggling to breathe, known COPD',
      timeOfDay: 'early-morning',
      location: 'Villa in Al Ain',
      callerInfo: 'Wife',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 72,
      gender: 'male',
      weight: 65,
      occupation: 'Retired teacher',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Bedroom, patient sitting upright on edge of bed',
      hazards: ['Oxygen concentrator present'],
      bystanders: 'Wife distressed',
      environment: 'Warm, poorly ventilated room',
      sceneImagePath: '/scene-assets/home-copd-male-68-sharjah.png',
      sceneImageCaption: 'Scene — Bedroom, elderly male COPD patient sitting upright'
    },
    initialPresentation: {
      generalImpression: 'Elderly male, tripod position, using accessory muscles',
      position: 'Sitting upright, leaning forward',
      appearance: 'Cyanotic lips, diaphoretic, barrel chest',
      consciousness: 'Alert but anxious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent but compromised', 'Unable to speak in full sentences'],
        interventions: ['High-flow O2', 'Prepare for BVM']
      },
      breathing: {
        rate: 32,
        rhythm: 'Regular',
        depth: 'Shallow',
        spo2: 78,
        findings: ['Severe dyspnea', 'Prolonged expiration', 'Wheeze bilateral', 'Pursed lip breathing'],
        interventions: ['Nebulized bronchodilators', 'Oxygen titrated to 88-92%', 'Consider NIV'],
        auscultation: ['Bilateral expiratory wheeze', 'Reduced air entry bilaterally', 'Prolonged expiration']
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Regular',
        bp: { systolic: 160, diastolic: 90 },
        capillaryRefill: 3,
        skin: 'Warm, cyanotic peripheries',
        findings: ['Tachycardic', 'Hypertensive from effort'],
        interventions: ['IV access', 'Monitor']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious but fully oriented'],
        interventions: ['Reassurance', 'Calm environment']
      },
      exposure: {
        temperature: 37.2,
        findings: ['Barrel chest', 'Accessory muscle use', 'Cyanosis', 'Low-grade fever (37.2°C) — supports infective trigger for this exacerbation'],
        interventions: ['Remove restrictive clothing']
      }
    },
    secondarySurvey: {
      head: ['Alert', 'Cyanotic lips'],
      neck: ['JVD present', 'Trachea central'],
      chest: ['Hyperinflated', 'Bilateral wheeze', 'Poor air entry bases'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Peripheral cyanosis', 'Asterixis (CO2 retention flap)', 'Peripheral oedema bilateral — cor pulmonale (right heart failure)'],
      posterior: ['Normal'],
      neurological: ['At risk of CO2 retention — monitor for confusion']
    },
    history: {
      medications: [
        { name: 'Salbutamol inhaler', dose: '100mcg', frequency: 'PRN', indication: 'COPD' },
        { name: 'Ipratropium', dose: '40mcg', frequency: 'QID', indication: 'COPD' },
        { name: 'Prednisolone', dose: '5mg', frequency: 'Daily', indication: 'Maintenance' }
      ],
      allergies: ['Sulfa drugs'],
      medicalConditions: ['COPD (Gold Stage 3)', 'Hypertension', 'Type 2 Diabetes'],
      surgicalHistory: [],
      lastMeal: 'Dinner 8 hours ago',
      eventsLeading: 'Woke up severely short of breath, inhalers not helping'
    },
    vitalSignsProgression: {
      initial: { bp: '160/90', pulse: 110, respiration: 32, spo2: 78, gcs: 15, temperature: 37.2, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Severe COPD exacerbation', 'CO2 retention likely', 'Respiratory failure imminent'],
      redFlags: ['Type 2 respiratory failure', 'Exhaustion', 'Drowsiness from CO2 retention'],
      differentialDiagnoses: ['COPD exacerbation', 'Pneumonia', 'Pulmonary embolism', 'Pneumothorax'],
      mostLikelyDiagnosis: 'Acute on Chronic Type 2 Respiratory Failure'
    },
    managementPathway: {
      immediate: [
        'Controlled oxygen therapy — target SpO2 88-92%; use 24-28% Venturi mask; do NOT give high-flow O2 to a known COPD patient',
        'Position upright — seated/tripod position optimises respiratory mechanics',
        'Salbutamol 5mg + Ipratropium 500mcg nebulised back-to-back — bronchodilation',
        'IV access — 18G antecubital',
        'Assess for CO2 retention signs: asterixis (flapping tremor), confusion, flushed warm peripheries, bounding pulse',
        'Prednisolone/Methylprednisolone — systemic steroids reduce airway inflammation',
        'Blood glucose check',
        'If exhausted, obtunded, or SpO2 not improving — consider Non-Invasive Ventilation (BiPAP) urgently'
      ],
      definitive: [
        'Non-Invasive Ventilation (BiPAP) — IPAP 10-15 cmH2O, EPAP 4-8 cmH2O; reduces work of breathing and CO2',
        'If BiPAP fails or patient deteriorates — RSI and intubation (accepting the risks of CO2 retention on ventilator)',
        'Hospital admission to respiratory ward or ICU for IV antibiotics if infective exacerbation confirmed',
        'Rashid Hospital or American Hospital Dubai for BiPAP-capable ED and respiratory team'
      ],
      monitoring: [
        'Continuous SpO2 — titrate O2 to maintain 88-92%; alarm if >94% (hyperoxia harmful in COPD)',
        'RR every 5 minutes — increasing rate = tiring; <8 = impending respiratory arrest',
        'GCS/AVPU — deteriorating consciousness from CO2 narcosis is a critical sign',
        'Waveform capnography if available — ETCO2 rising = worsening CO2 retention',
        'Continuous ECG — COPD patients at risk of atrial fibrillation during exacerbation'
      ],
      transportConsiderations: [
        'Pre-alert with respiratory failure details — COPD, O2-dependent, consider BiPAP on arrival',
        'Maintain controlled O2 en route — do not allow SpO2 to rise above 94%',
        'Keep patient upright in transport — do not lay flat',
        'Have BVM ready but use only if patient stops breathing — avoid high-flow O2',
        'Reassess every 5 minutes during transport — CO2 narcosis can develop rapidly'
      ]
    },
    studentChecklist: [
      { id: 'resp5-1', category: 'abcde', description: 'Controlled oxygen therapy 88-92%', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'resp5-2', category: 'intervention', description: 'Nebulized bronchodilators', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'resp5-3', category: 'abcde', description: 'Assess for CO2 retention (flap, headache, drowsiness)', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'resp5-4', category: 'intervention', description: 'Consider NIV (BiPAP) early', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'resp5-5', category: 'intervention', description: 'Systemic steroids', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'In COPD, target SpO2 88-92% to avoid CO2 narcosis',
      'NIV reduces need for intubation in COPD exacerbations',
      'Systemic steroids improve outcomes in acute exacerbations',
      'Watch for silent chest - impending respiratory arrest'
    ],
    commonPitfalls: [
      'Giving high-flow oxygen (15L/min) without considering CO2 retention risk',
      'Failing to recognize asterixis (flapping tremor) as sign of CO2 narcosis',
      'Delaying NIV initiation until patient is exhausted',
      'Not checking home oxygen prescription and flow rates',
      'Overlooking the need for controlled oxygen therapy in known CO2 retainers',
      'Missing contraindications to NIV (vomiting, facial trauma, reduced GCS)',
      'Inadequate reassessment after interventions - need serial ABGs',
      'Not preparing for potential intubation early',
      'Failing to identify precipitating causes (infection, heart failure, PE)',
      'Not communicating with family about potential need for mechanical ventilation',
      'AVOID opioids (morphine, fentanyl) — they stack respiratory depression on top of hypercapnic failure and can tip a tiring COPD patient into arrest. Treat the bronchospasm/hypoxia first. If opioid is truly required (e.g. coexisting fracture pain), use the smallest dose, keep naloxone at the bedside, and watch RR/EtCO2 continuously.',
    ],
    equipmentNeeded: [
      'Oxygen therapy equipment with flowmeters (0-15L)',
      'Nebulizer kit and bronchodilators (salbutamol, ipratropium)',
      'Pulse oximeter',
      'Capnography/ETCO2 monitor',
      'NIV/BiPAP machine with appropriate masks',
      'IV access equipment and fluids',
      'Suction equipment',
      'Bag-valve-mask with PEEP valve',
      'Cardiac monitor',
      'Blood gas analyzer or i-STAT',
      'Steroids (hydrocortisone/prednisolone)',
      'Antibiotics (if pneumonia suspected)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Clinical Practice Guidelines - Respiratory Emergencies',
        'DCAS COPD Exacerbation Protocol',
        'NICE Guidelines NG115 - Chronic Obstructive Pulmonary Disease',
        'GOLD Guidelines 2024 - COPD Management'
      ],
      receivingFacilities: [
        {
          name: 'Tawam Hospital',
          location: 'Al Ain',
          capabilities: ['24/7 Emergency Department', 'Respiratory ICU', 'Pulmonary Services', 'Bronchoscopy'],
          contact: '03 767 7444',
          distance: '15 minutes from central Al Ain'
        },
        {
          name: 'Al Ain Hospital',
          location: 'Al Ain',
          capabilities: ['Emergency Department', 'Internal Medicine', 'Respiratory Care'],
          contact: '03 702 2000',
          distance: '10 minutes from central Al Ain'
        },
        {
          name: 'Rashid Hospital',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Emergency Department', 'Respiratory ICU', 'Advanced Ventilation Support'],
          contact: '04 219 3000',
          distance: '90 minutes from Al Ain'
        },
        {
          name: 'Sheikh Khalifa Medical City',
          location: 'Abu Dhabi',
          capabilities: ['Emergency Department', 'Pulmonary Unit', 'Critical Care'],
          contact: '02 610 2000',
          distance: '75 minutes from Al Ain'
        }
      ],
      localConsiderations: [
        'During Ramadan, elderly patients may delay seeking help until symptoms are severe',
        'Al Ain location - transport to nearest major hospital (Tawam or Al Ain Hospital)',
        'Family involvement in medical decisions is culturally important',
        'May have difficulty affording medications - check compliance with home oxygen',
        'Language barrier may require Arabic-speaking paramedic or translator',
        'Summer heat can exacerbate COPD - ensure cool transport environment',
        'Home oxygen use common - ensure safe handling during transport',
        'Emirati families often prefer male paramedics for elderly male patients',
        'Sons or senior male relatives typically make medical decisions for elderly patients'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-copd-001',
          type: 'image',
          title: 'COPD Barrel Chest Anatomy',
          url: 'https://radiopaedia.org/cases/barrel-chest',
          source: 'Radiopaedia',
          relevance: 'important',
          tags: ['COPD', 'barrel-chest', 'anatomy']
        },
        {
          id: 'img-copd-002',
          type: 'image',
          title: 'Tripod Position in Respiratory Distress',
          url: 'https://teachmepaeds.com/tripod-position/',
          source: 'Teach Me Paeds',
          relevance: 'important',
          tags: ['COPD', 'tripod', 'positioning']
        }
      ],
      videos: [
        {
          id: 'vid-copd-001',
          type: 'video',
          title: 'COPD Exacerbation: Pathophysiology and Management',
          url: 'https://www.youtube.com/watch?v=JhzUUn9YiMM',
          source: 'Osmosis from Elsevier',
          duration: '15:42',
          relevance: 'essential',
          tags: ['COPD', 'exacerbation', 'pathophysiology']
        },
        {
          id: 'vid-copd-002',
          type: 'video',
          title: 'NIV in COPD - Setup and Practical Tips',
          url: 'https://www.youtube.com/watch?v=kUNxXRqDBWs',
          source: 'Ninja Nerd',
          duration: '12:35',
          relevance: 'essential',
          tags: ['NIV', 'BiPAP', 'COPD', 'ventilation']
        },
        {
          id: 'vid-copd-003',
          type: 'video',
          title: 'CO2 Retention and Controlled Oxygen Therapy',
          url: 'https://www.youtube.com/watch?v=4fMM6qTa7bY',
          source: 'MedCram',
          duration: '14:20',
          relevance: 'essential',
          tags: ['CO2', 'retention', 'oxygen', 'COPD']
        }
      ],
      articles: [
        {
          id: 'art-copd-001',
          type: 'article',
          title: 'COPD Exacerbation: Assessment and Management',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5448391/',
          source: 'International Journal of COPD',
          relevance: 'essential',
          tags: ['COPD', 'exacerbation', 'management']
        },
        {
          id: 'art-copd-002',
          type: 'article',
          title: 'Oxygen Therapy in COPD: What is the Right Target?',
          url: 'https://www.bmj.com/content/361/bmj.k2326',
          source: 'British Medical Journal',
          relevance: 'essential',
          tags: ['oxygen', 'COPD', 'target', 'SpO2']
        },
        {
          id: 'art-copd-003',
          type: 'article',
          title: 'GOLD 2024 Report: Global Strategy for COPD',
          url: 'https://goldcopd.org/2024-gold-report/',
          source: 'GOLD Initiative',
          relevance: 'important',
          tags: ['GOLD', 'guidelines', 'COPD', '2024']
        },
        {
          id: 'art-copd-004',
          type: 'article',
          title: 'COPD Exacerbation - CCC',
          url: 'https://litfl.com/copd-exacerbation/',
          source: 'Life in the Fast Lane',
          relevance: 'supplementary',
          tags: ['COPD', 'exacerbation', 'emergency', 'LITFL']
        }
      ]
    }
  }),

  createCase({
    id: 'resp-006',
    title: 'Pneumothorax After Chest Trauma',
    category: 'trauma',
    subcategory: 'chest-trauma',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Man fell from ladder, chest pain, difficulty breathing',
      timeOfDay: 'afternoon',
      location: 'Construction site, Dubai Marina',
      callerInfo: 'Coworker',
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
      description: 'Construction site, patient on ground near scaffolding',
      hazards: ['Fallen tools', 'Unstable ladder', 'Construction materials'],
      bystanders: 'Coworkers gathered',
      environment: 'Outdoor, hot, dusty',
      environmentVariant: 'industrial',
      sceneImagePath: '/scene-assets/resp-002-construction-tension-pneumothorax.png',
      sceneImageCaption: 'Construction site pneumothorax — Dubai Marina'
    },
    initialPresentation: {
      generalImpression: 'Young male, sitting upright, holding right side of chest',
      position: 'Sitting, leaning to right side',
      appearance: 'Diaphoretic, distressed, rapid breathing',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: ['Oxygen']
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Shallow',
        spo2: 88,
        findings: ['Right-sided chest pain', 'Decreased breath sounds right', 'Hyper-resonant percussion', 'Tracheal deviation to left'],
        interventions: ['High-flow O2', 'Prepare for chest decompression'],
        auscultation: ['Absent breath sounds right hemithorax', 'Normal air entry left']
      },
      circulation: {
        pulseRate: 120,
        pulseQuality: 'Regular',
        bp: { systolic: 110, diastolic: 70 },
        capillaryRefill: 2,
        skin: 'Pale, clammy',
        findings: ['Tachycardic'],
        interventions: ['IV access']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Oriented'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Right chest bruising', 'Rib tenderness', 'No open wounds'],
        interventions: ['Chest seal if open pneumothorax']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Trachea deviated to left', 'JVD present'],
      chest: ['Right chest bruising', 'Tender ribs 4-6', 'Decreased air entry right', 'Hyper-resonant'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [],
      allergies: ['None known'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Fell from 3-meter ladder, landed on right side'
    },
    vitalSignsProgression: {
      initial: { bp: '110/70', pulse: 120, respiration: 28, spo2: 88, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Tension pneumothorax developing', 'Tracheal deviation', 'Respiratory distress'],
      redFlags: ['Tension pneumothorax', 'Cardiac arrest imminent'],
      differentialDiagnoses: ['Tension pneumothorax', 'Simple pneumothorax', 'Hemothorax', 'Rib fractures'],
      mostLikelyDiagnosis: 'Tension Pneumothorax'
    },
    managementPathway: {
      immediate: ['High-flow oxygen 15L/min via non-rebreather', 'Immediate needle decompression — PREFERRED site 4th-5th ICS anterior-to-mid axillary line (TCCC 2022); 2nd ICS mid-clavicular is a valid alternate but fails in >30% of adults (chest-wall thickness, great-vessel proximity)', 'Use 14G x 8cm catheter (5cm catheters demonstrably fail in ~1/3 of adults)', 'IV access with large-bore cannula', 'Small-volume Hartmann\'s titration if hypotensive — target SBP 80-90 (permissive hypotension if no TBI)', 'Selective C-spine per NEXUS/CCR — rigid collar only if mechanism + midline tenderness + neuro deficit', 'Vented chest seal (HyFin Vent / Russell) if open pneumothorax'],
      definitive: ['Formal chest drain insertion (28-32F) at hospital', 'Chest X-ray to confirm resolution', 'Thoracic surgery consult if ongoing air leak', 'Pain management for rib fractures'],
      monitoring: ['Continuous SpO2 monitoring', 'Respiratory rate and effort', 'Blood pressure', 'Tracheal position', 'Breath sounds after decompression', 'Monitor for re-tensioning'],
      transportConsiderations: ['Immediate transport after needle decompression', 'Pre-alert trauma center', 'Continue high-flow oxygen en route', 'Monitor for deterioration', 'Do not delay transport for chest drain insertion', 'Maintain C-spine precautions throughout']
    },
    studentChecklist: [
      { id: 'resp6-1', category: 'abcde', description: 'Recognize tension pneumothorax signs', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'resp6-2', category: 'intervention', description: 'Needle decompression 2nd intercostal space', points: 20, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'resp6-3', category: 'abcde', description: 'High-flow oxygen', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp6-4', category: 'intervention', description: 'IV access and fluid resuscitation', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp6-5', category: 'abcde', description: 'Auscultate for absent breath sounds on affected side', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp6-6', category: 'abcde', description: 'Assess for tracheal deviation and JVD', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'resp6-7', category: 'abcde', description: 'Maintain cervical spine precautions', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'resp6-8', category: 'intervention', description: 'Position patient sitting upright if tolerated', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp6-9', category: 'intervention', description: 'Apply chest seal if open pneumothorax present', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'resp6-10', category: 'abcde', description: 'Monitor respiratory rate and effort continuously', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp6-11', category: 'communication', description: 'Pre-alert trauma center for definitive chest tube', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'resp6-12', category: 'documentation', description: 'Document mechanism of injury and interventions', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Tension pneumothorax is a clinical diagnosis - do not wait for X-ray',
      'Needle decompression is life-saving in tension pneumothorax',
      'Signs: hypotension, tracheal deviation, distended neck veins, absent breath sounds'
    ],
    commonPitfalls: [
      'Waiting for chest X-ray confirmation before treating tension pneumothorax',
      'Performing needle decompression on the wrong side',
      'Inserting needle too medially (risk of hitting heart/great vessels)',
      'Not recognizing tension pneumothorax in patients with bilateral breath sounds (check tracheal deviation)',
      'Using 14G needle that is too short in obese patients',
      'Failing to prepare for immediate chest tube placement after needle decompression',
      'Not checking for open pneumothorax (sucking chest wound)',
      'Delaying oxygen administration while preparing for decompression',
      'Missing associated injuries (rib fractures, hemothorax, flail chest)',
      'Not reassessing after decompression - may need second attempt or different site'
    ],
    equipmentNeeded: [
      '14G or 16G IV cannula (minimum 4.5cm length, consider 8cm in obese patients)',
      'Alcohol swabs / chlorhexidine',
      'Gloves and sterile drapes',
      'High-flow oxygen (15L/min) with non-rebreather mask',
      'Chest seals (vented for open pneumothorax)',
      'IV access equipment and crystalloid fluids',
      'Cardiac monitor',
      'Pulse oximeter',
      'Stethoscope',
      'Portable suction',
      'Bag-valve-mask',
      'Chest tube insertion kit (for hospital)',
      'Occlusive dressings'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Trauma Protocol - Chest Injuries',
        'DCAS Needle Decompression Guidelines',
        'PHTLS - Prehospital Trauma Life Support Standards',
        'ATLS - Advanced Trauma Life Support Guidelines'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Trauma Center',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Level 1 Trauma Center', '24/7 Thoracic Surgery', 'Cardiothoracic ICU'],
          contact: '04 219 3000',
          distance: '20 minutes from Dubai Marina'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Emergency Department', 'Trauma Services', 'Chest Surgery'],
          contact: '04 222 1211',
          distance: '25 minutes from Dubai Marina'
        },
        {
          name: 'Saudi German Hospital Dubai',
          location: 'Dubai',
          capabilities: ['Emergency Department', 'Trauma Unit', 'ICU'],
          contact: '04 389 0000',
          distance: '15 minutes from Dubai Marina'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Emergency Department', 'Trauma Services'],
          contact: '04 435 9999',
          distance: '18 minutes from Dubai Marina'
        }
      ],
      localConsiderations: [
        'Construction workers in UAE often on short-term visas - may fear reporting injuries due to employment concerns',
        'Dubai Marina location - heavy traffic during peak hours, consider water ambulance if available',
        'Many construction workers speak Hindi/Urdu - ensure language support',
        'Summer heat at construction sites can reach 50°C - prioritize cooling and hydration',
        'Work site safety officers must be involved per UAE labor laws',
        'Police notification required for workplace accidents resulting in hospitalization',
        'Employer sponsorship system may affect patient willingness to seek care',
        'Document fall height precisely for legal/workers compensation purposes'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-tension-001',
          type: 'image',
          title: 'Tension Pneumothorax Pathophysiology',
          url: 'https://wikem.org/wiki/Tension_pneumothorax',
          source: 'WikEM',
          relevance: 'essential',
          tags: ['tension-pneumothorax', 'pathophysiology', 'anatomy']
        },
        {
          id: 'img-tension-002',
          type: 'image',
          title: 'Needle Decompression Landmarks',
          url: 'https://radiopaedia.org/articles/needle-thoracostomy',
          source: 'Radiopaedia',
          relevance: 'essential',
          tags: ['needle-decompression', 'landmarks', 'procedure']
        },
        {
          id: 'img-tension-003',
          type: 'image',
          title: 'Chest X-ray: Tension Pneumothorax',
          url: 'https://radiopaedia.org/cases/tension-pneumothorax',
          source: 'Radiopaedia',
          relevance: 'important',
          tags: ['tension-pneumothorax', 'x-ray', 'imaging']
        }
      ],
      videos: [
        {
          id: 'vid-tension-001',
          type: 'video',
          title: 'Tension Pneumothorax: Recognition and Management',
          url: 'https://www.youtube.com/watch?v=rfLKwFO5gUY',
          source: 'EMSWorld.com',
          duration: '12:45',
          relevance: 'essential',
          tags: ['tension-pneumothorax', 'recognition', 'management']
        },
        {
          id: 'vid-tension-002',
          type: 'video',
          title: 'Needle Decompression Technique',
          url: 'https://www.youtube.com/watch?v=1AlFaLuuPVs',
          source: 'PrepMedic',
          duration: '8:30',
          relevance: 'essential',
          tags: ['needle-decompression', 'technique', 'chest']
        },
        {
          id: 'vid-tension-003',
          type: 'video',
          title: 'Chest Trauma in EMS',
          url: 'https://www.youtube.com/watch?v=8em3FPEJ4L4',
          source: 'Armando Hasudungan',
          duration: '16:20',
          relevance: 'important',
          tags: ['chest-trauma', 'EMS', 'pneumothorax']
        }
      ],
      articles: [
        {
          id: 'art-tension-001',
          type: 'article',
          title: 'Tension Pneumothorax: A Clinical Diagnosis',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3088148/',
          source: 'Open Access Emergency Medicine',
          relevance: 'essential',
          tags: ['tension-pneumothorax', 'clinical-diagnosis']
        },
        {
          id: 'art-tension-002',
          type: 'article',
          title: 'Tension Pneumothorax',
          url: 'https://wikem.org/wiki/Tension_pneumothorax',
          source: 'WikEM',
          relevance: 'essential',
          tags: ['tension-pneumothorax', 'emergency', 'management']
        },
        {
          id: 'art-tension-003',
          type: 'article',
          title: 'Prehospital Management of Chest Trauma',
          url: 'https://www.jems.com/patient-care/chest-trauma/',
          source: 'JEMS',
          relevance: 'important',
          tags: ['chest-trauma', 'prehospital', 'management']
        },
        {
          id: 'art-tension-004',
          type: 'article',
          title: 'Needle Thoracostomy: Site Selection and Technique',
          url: 'https://litfl.com/needle-thoracostomy/',
          source: 'Life in the Fast Lane',
          relevance: 'important',
          tags: ['needle-thoracostomy', 'technique', 'site']
        }
      ]
    }
  }),

  createCase({
    id: 'resp-007',
    title: 'Pediatric Croup with Stridor',
    category: 'pediatric',
    subcategory: 'croup',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: '2-year-old with barking cough, difficulty breathing',
      timeOfDay: 'evening',
      location: 'Apartment, Jumeirah',
      callerInfo: 'Mother',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 2,
      gender: 'male',
      weight: 12,
      occupation: 'N/A',
      language: 'None'
    },
    sceneInfo: {
      description: 'Living room, child on mother\'s lap',
      hazards: [],
      bystanders: 'Parents',
      environment: 'Calm, air-conditioned'
    },
    initialPresentation: {
      generalImpression: 'Toddler, sitting on mother\'s lap, appears frightened',
      position: 'Sitting upright, preferring parents',
      appearance: 'Mild respiratory distress, barking cough',
      consciousness: 'Alert, clingy'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Stridor at rest', 'Barking cough', 'Hoarse voice'],
        interventions: ['Keep calm', 'Nebulized epinephrine']
      },
      breathing: {
        rate: 40,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 94,
        findings: ['Intercostal recession', 'Nasal flaring', 'Stridor'],
        interventions: ['Humidified oxygen', 'Steroids'],
        auscultation: ['Inspiratory stridor', 'Good bilateral air entry', 'No wheeze']
      },
      circulation: {
        pulseRate: 130,
        pulseQuality: 'Regular',
        bp: { systolic: 90, diastolic: 55 },
        capillaryRefill: 2,
        skin: 'Warm, pink',
        findings: ['Age-appropriate tachycardia'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Appropriate for age'],
        interventions: ['Minimize distress']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Normal skin', 'No rash'],
        interventions: ['Keep warm']
      }
    },
    secondarySurvey: {
      head: ['Alert', 'Frightened'],
      neck: ['Normal'],
      chest: ['Intercostal recession', 'Clear air entry'],
      abdomen: ['Soft'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal for age']
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: ['Previously healthy'],
      surgicalHistory: [],
      lastMeal: 'Milk before bed',
      eventsLeading: 'Started with cold symptoms 2 days ago, barking cough started tonight'
    },
    vitalSignsProgression: {
      initial: { bp: '90/55', pulse: 130, respiration: 40, spo2: 94, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Classic croup presentation', 'Stridor at rest indicates moderate severity'],
      redFlags: ['Stridor at rest', 'Intercostal recession', 'Altered consciousness'],
      differentialDiagnoses: ['Viral croup', 'Bacterial tracheitis', 'Epiglottitis', 'Foreign body'],
      mostLikelyDiagnosis: 'Viral Laryngotracheobronchitis (Croup)'
    },
    managementPathway: {
      immediate: [
        'Keep child CALM — allow to remain with parent/carer in their arms; crying and distress worsen laryngospasm',
        'Do NOT force examination or equipment on child if it will cause agitation',
        'Assess croup severity — mild: cough, no stridor at rest; moderate: stridor at rest, mild recession; severe: stridor at rest + significant recession + pallor/cyanosis',
        'Position upright — in parent\'s arms or supported sitting; do not lie flat',
        'Humidified oxygen if tolerated (blow-by technique for paediatric patients)',
        'Dexamethasone 0.15-0.6mg/kg PO/IM (max 10mg) — reduces airway inflammation; single dose effective',
        'Nebulised Adrenaline (Epinephrine) 1:1000 5mL — for moderate-severe croup; rapid onset but 2-3 hour rebound risk',
        'SpO2 monitoring — pulse oximeter on finger or toe'
      ],
      definitive: [
        'Hospital admission for moderate-severe croup — observation for 4-6 hours post-adrenaline (rebound risk)',
        'Latifa Hospital Dubai or Al Wasl Hospital for paediatric facilities',
        'ENT/paediatric consultation — bacterial tracheitis or epiglottitis if not responding to croup treatment',
        'In extremis: prepare surgical airway (needle cricothyrotomy) — size-appropriate for child'
      ],
      monitoring: [
        'Continuous SpO2 — if falling below 92% consider assisted ventilation',
        'Work of breathing: intercostal, subcostal, sternal recession',
        'Stridor character — worsening means upper airway narrowing progressing',
        'Heart rate — tachycardia in a child is a sign of increasing distress/hypoxia',
        'Colour — pallor or perioral cyanosis = critical sign, act immediately'
      ],
      transportConsiderations: [
        'Transport in parent\'s arms if possible — reduces distress and maintains airway',
        'Pre-alert paediatric ED — child with croup, age and SpO2',
        'Ensure BVM appropriate paediatric size is at hand throughout transport',
        'Adrenaline can wear off in 1-2 hours — rebound stridor possible en route',
        'If complete upper airway obstruction — jaw thrust, BVM, and prepare for surgical airway'
      ]
    },
    studentChecklist: [
      { id: 'resp7-1', category: 'abcde', description: 'Assess severity of croup (stridor at rest vs exertion)', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-2', category: 'intervention', description: 'Nebulized epinephrine for moderate-severe croup', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp7-3', category: 'intervention', description: 'Systemic steroids (dexamethasone)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp7-4', category: 'abcde', description: 'Keep child calm - crying worsens symptoms', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-5', category: 'abcde', description: 'Assess for signs of respiratory distress and retractions', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-6', category: 'abcde', description: 'Check oxygen saturation continuously', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-7', category: 'history', description: 'Ask about onset and preceding cold symptoms', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-8', category: 'abcde', description: 'Position child upright on parents lap', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-9', category: 'abcde', description: 'Differentiate from epiglottitis (drooling, toxic appearance)', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp7-10', category: 'intervention', description: 'Provide humidified oxygen if hypoxic', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-11', category: 'communication', description: 'Reassure parents and explain treatment plan', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-12', category: 'documentation', description: 'Document stridor characteristics and interventions', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-neb-adr', category: 'intervention', description: 'Nebulised adrenaline 5ml 1:1000 for severe croup/stridor at rest', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate'] }
    ],
    teachingPoints: [
      'Croup is a clinical diagnosis - barking cough and stridor',
      'Nebulized epinephrine provides rapid but temporary relief',
      'Steroids reduce airway edema and hospitalization rates',
      'Avoid agitating the child - crying worsens symptoms'
    ],
    commonPitfalls: [
      'Agitating the child by attempting examination before building rapport',
      'Not assessing stridor characteristics at rest vs with exertion',
      'Missing red flags that indicate epiglottitis (drooling, tripod position, toxic appearance)',
      'Failing to have airway equipment ready despite reassuring initial appearance',
      'Delaying epinephrine administration in moderate-severe croup',
      'Using mask that does not seal well, reducing medication delivery',
      'Not monitoring for epinephrine side effects (tachycardia, tremors)',
      'Overlooking foreign body aspiration as differential diagnosis',
      'Separating child from parent - increases anxiety and worsens stridor',
      'Not educating parents about recurrence risk and when to seek help'
    ],
    equipmentNeeded: [
      'Pediatric nebulizer with mask appropriate for age',
      'L-adrenaline 1:1000 — 5 mL nebulised (UAE-stocked; racemic epinephrine is a legacy US formulation, not on UAE ambulance formulary)',
      'Dexamethasone (oral or IV)',
      'Pediatric oxygen masks and nasal cannulas',
      'Pulse oximeter (pediatric probe)',
      'Pediatric BVM and airway adjuncts',
      'Suction equipment (Yankauer and pediatric catheters)',
      'Laryngoscope with pediatric blades',
      'Pediatric ET tubes (various sizes)',
      'IV access equipment (pediatric sizes)',
      'Cardiac monitor',
      'Croup score chart/assessment tool',
      'Humidified oxygen setup',
      'Toys/distraction items for pediatric patients'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Pediatric Respiratory Distress Protocol',
        'DCAS Croup Management Guidelines',
        'AAP Clinical Practice Guideline: Management of Croup',
        'NICE Guidelines NG143: Bronchiolitis in Children'
      ],
      receivingFacilities: [
        {
          name: 'Al Jalila Children\'s Specialty Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Pediatric Emergency', 'Pediatric ICU', 'Pediatric ENT', '24/7 Pediatric Services'],
          contact: '04 203 1000',
          distance: '15 minutes from Jumeirah'
        },
        {
          name: 'Latifa Hospital',
          location: 'Oud Metha, Dubai',
          capabilities: ['Pediatric Emergency', 'Pediatric ICU', 'Pediatric Specialists'],
          contact: '04 219 3000',
          distance: '12 minutes from Jumeirah'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Pediatric Emergency', 'Pediatric Ward'],
          contact: '04 435 9999',
          distance: '15 minutes from Jumeirah'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha',
          capabilities: ['Pediatric Emergency', 'Pediatric Specialists'],
          contact: '04 377 5500',
          distance: '10 minutes from Jumeirah'
        }
      ],
      localConsiderations: [
        'Jumeirah is family-oriented area - likely both parents present',
        'Many expatriate families in Jumeirah - may have different cultural approaches to pediatric care',
        'Ramadan timing affects availability of pediatricians in some hospitals',
        'Private insurance coverage important - some families may prefer private hospitals',
        'School/nursery season affects croup prevalence - more common in winter months',
        'High humidity in UAE can actually help croup symptoms',
        'Many nannies/housekeepers care for children - ensure clear communication',
        'Vaccination schedules may vary by nationality - check Hib and pneumococcal status'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-croup-001',
          type: 'image',
          title: 'Croup: Assessment and Management',
          url: 'https://dontforgetthebubbles.com/croup/',
          source: "Don't Forget the Bubbles",
          relevance: 'essential',
          tags: ['croup', 'anatomy', 'pathophysiology', 'pediatric']
        },
        {
          id: 'img-croup-002',
          type: 'image',
          title: 'Croup X-ray - Steeple Sign',
          url: 'https://radiopaedia.org/cases/croup',
          source: 'Radiopaedia',
          relevance: 'important',
          tags: ['croup', 'x-ray', 'steeple-sign']
        },
        {
          id: 'img-croup-003',
          type: 'image',
          title: 'NICE Guideline: Croup in Children',
          url: 'https://www.nice.org.uk/guidance/ng143',
          source: 'NICE Guidelines',
          relevance: 'important',
          tags: ['croup', 'guidelines', 'NICE', 'pediatric']
        }
      ],
      videos: [
        {
          id: 'vid-croup-001',
          type: 'video',
          title: 'Pediatric Croup: Assessment and Management',
          url: 'https://www.youtube.com/watch?v=Thj4EiFPyNA',
          source: 'Osmosis from Elsevier',
          duration: '14:30',
          relevance: 'essential',
          tags: ['croup', 'pediatric', 'assessment']
        },
        {
          id: 'vid-croup-002',
          type: 'video',
          title: 'Stridor in Children: Differential Diagnosis',
          url: 'https://www.youtube.com/watch?v=AKRr2PMl4zE',
          source: 'MedCram',
          duration: '11:45',
          relevance: 'essential',
          tags: ['stridor', 'children', 'differential']
        },
        {
          id: 'vid-croup-003',
          type: 'video',
          title: 'Epiglottitis vs Croup: How to Differentiate',
          url: 'https://www.youtube.com/watch?v=P7Fkg7_yXL0',
          source: 'Strong Medicine',
          duration: '8:20',
          relevance: 'essential',
          tags: ['epiglottitis', 'croup', 'differentiation']
        },
        {
          id: 'vid-croup-004',
          type: 'video',
          title: 'Croup (Laryngotracheobronchitis) - Pediatric Respiratory',
          url: 'https://www.youtube.com/watch?v=Thj4EiFPyNA',
          source: 'Osmosis from Elsevier',
          duration: '22:15',
          relevance: 'important',
          tags: ['croup', 'pediatric', 'respiratory', 'pathophysiology']
        }
      ],
      articles: [
        {
          id: 'art-croup-001',
          type: 'article',
          title: 'Croup: Clinical Features and Management',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4392193/',
          source: 'Canadian Family Physician',
          relevance: 'essential',
          tags: ['croup', 'clinical', 'management']
        },
        {
          id: 'art-croup-002',
          type: 'article',
          title: 'Nebulized Epinephrine in Croup',
          url: 'https://www.nejm.org/doi/full/10.1056/NEJM199406023022203',
          source: 'New England Journal of Medicine',
          relevance: 'important',
          tags: ['epinephrine', 'croup', 'nebulized']
        },
        {
          id: 'art-croup-003',
          type: 'article',
          title: 'Corticosteroids for Croup: A Systematic Review',
          url: 'https://www.bmj.com/content/325/7371/1352',
          source: 'British Medical Journal',
          relevance: 'important',
          tags: ['corticosteroids', 'croup', 'dexamethasone']
        }
      ]
    }
  }),

  createCase({
    id: 'resp-008',
    title: 'Acute Pulmonary Edema',
    category: 'cardiac',
    subcategory: 'heart-failure',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Elderly woman severely short of breath, frothy sputum',
      timeOfDay: 'early-morning',
      location: 'Villa, Emirates Hills',
      callerInfo: 'Housekeeper',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 78,
      gender: 'female',
      weight: 70,
      occupation: 'Retired',
      language: 'English'
    },
    sceneInfo: {
      description: 'Bedroom, patient propped up on pillows',
      hazards: [],
      bystanders: 'Housekeeper',
      environment: 'Bedroom, warm'
    },
    initialPresentation: {
      generalImpression: 'Elderly female, severe respiratory distress, orthopneic',
      position: 'Sitting upright, unable to lie flat',
      appearance: 'Diaphoretic, cyanotic lips, frothy pink sputum',
      consciousness: 'Alert but anxious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent', 'Gurgling from secretions'],
        interventions: ['Suction if needed', 'High-flow O2']
      },
      breathing: {
        rate: 36,
        rhythm: 'Regular',
        depth: 'Shallow',
        spo2: 82,
        findings: ['Bilateral crackles', 'Wheeze (cardiac asthma)', 'Pink frothy sputum'],
        interventions: ['CPAP if available', 'Nitrates', 'Diuretics'],
        auscultation: ['Bilateral fine crackles to mid-zones', 'Expiratory wheeze (cardiac wheeze)', 'Reduced air entry bases']
      },
      circulation: {
        pulseRate: 130,
        pulseQuality: 'Regular',
        bp: { systolic: 190, diastolic: 110 },
        capillaryRefill: 2,
        skin: 'Pale, clammy, diaphoretic',
        findings: ['Hypertensive', 'Tachycardic', 'JVD'],
        interventions: ['IV access', 'GTN', 'Furosemide']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious'],
        interventions: ['Morphine for distress']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Peripheral edema', 'JVD', 'Basal crackles'],
        interventions: ['Sit upright']
      }
    },
    secondarySurvey: {
      head: ['Alert', 'Cyanotic lips'],
      neck: ['JVD present — elevated jugular venous pressure (+++)', 'Trachea central'],
      chest: ['Bilateral basal crackles (pulmonary oedema)', 'Cardiac wheeze', 'Tachypnea'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Bilateral pitting oedema to mid-calf', 'Cold extremities'],
      posterior: ['Sacral oedema present (supine position)'],
      neurological: ['Alert']
    },
    history: {
      medications: [
        { name: 'Furosemide', dose: '40mg', frequency: 'Daily', indication: 'Heart failure' },
        { name: 'Ramipril', dose: '5mg', frequency: 'Daily', indication: 'Heart failure' },
        { name: 'Carvedilol', dose: '12.5mg', frequency: 'BD', indication: 'Heart failure' }
      ],
      allergies: ['None'],
      medicalConditions: ['Congestive heart failure', 'Hypertension', 'Atrial fibrillation'],
      surgicalHistory: [],
      lastMeal: 'Light dinner yesterday',
      eventsLeading: 'Woke up gasping for air, unable to lie flat'
    },
    vitalSignsProgression: {
      initial: { bp: '190/110', pulse: 130, respiration: 36, spo2: 82, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Acute pulmonary edema', 'Cardiac asthma', 'Flash pulmonary edema'],
      redFlags: ['Respiratory failure', 'Cardiogenic shock'],
      differentialDiagnoses: ['Acute pulmonary edema', 'COPD exacerbation', 'Pneumonia', 'PE'],
      mostLikelyDiagnosis: 'Acute Cardiogenic Pulmonary Edema'
    },
    managementPathway: {
      immediate: [
        'Sit patient upright immediately — legs dangling if possible; reduces preload and improves ventilation',
        'High-flow oxygen 10-15L/min via non-rebreather mask — target SpO2 >94%',
        'CPAP 5-10 cmH2O if available — reduces pulmonary fluid transudation and work of breathing; improves outcomes',
        'IV access x2 (18G antecubital) — do not delay treatment for difficult IV access',
        'GTN (Glyceryl Trinitrate) sublingual 400mcg spray — check BP >100 systolic before giving; repeat every 5 minutes',
        'GTN IV infusion if persistent hypertension — start at 10-20 mcg/min, titrate to BP',
        'Furosemide 40-80mg IV — diuresis takes 15-20 minutes but venodilation is immediate',
        'Blood glucose and 12-lead ECG — identify ACS as precipitant',
        'Morphine 2-4mg IV titrated — reduces preload and anxiety (use cautiously, may cause hypotension/respiratory depression)'
      ],
      definitive: [
        'Hospital admission — cardiology review, identification and treatment of underlying cause',
        'American Hospital Dubai or Mediclinic City Hospital for cardiology support',
        'Intubation and mechanical ventilation if CPAP fails or patient exhausted — last resort',
        'IV GTN infusion titrated in ED for persistent hypertensive pulmonary edema',
        'Identify precipitant: ACS, rapid AF, non-compliance with medications, dietary indiscretion'
      ],
      monitoring: [
        'SpO2 continuous — target >94%; if falling despite CPAP, prepare for intubation',
        'BP every 3-5 minutes — GTN and furosemide both lower BP; do not allow SBP <90',
        'RR and work of breathing — improvement should be seen within 5-10 minutes of CPAP/GTN',
        'HR and rhythm — AF with rapid ventricular response common in APO',
        'Continuous ECG — exclude STEMI as precipitant'
      ],
      transportConsiderations: [
        'Pre-alert cardiac-capable ED with "acute pulmonary oedema, BP 190/110, SpO2 82% on room air"',
        'Transport seated upright — do not allow to lie down even if patient requests',
        'Continue CPAP during transport if initiated on scene',
        'Ensure BP rechecked before each GTN dose en route',
        'Rapid transport — SpO2 82% is critically low; do not delay for additional interventions on scene'
      ]
    },
    studentChecklist: [
      { id: 'resp8-1', category: 'abcde', description: 'Sit patient upright', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp8-2', category: 'intervention', description: 'High-flow oxygen', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp8-3', category: 'intervention', description: 'GTN sublingual or IV', points: 15, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'resp8-4', category: 'intervention', description: 'IV furosemide', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'resp8-5', category: 'intervention', description: 'CPAP/BiPAP if available', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] }
    ],
    teachingPoints: [
      'Acute pulmonary edema is a medical emergency requiring rapid intervention',
      'Sit upright, oxygen, nitrates, and diuretics are mainstays',
      'CPAP reduces need for intubation in cardiogenic pulmonary edema',
      'Look for JVD and peripheral edema as signs of fluid overload'
    ],
    commonPitfalls: [
      'Allowing patient to lie flat, worsening pulmonary congestion',
      'Giving diuretics without establishing IV access first',
      'Overlooking the need for continuous monitoring during treatment',
      'Failing to check blood pressure before administering nitrates',
      'Not having intubation equipment ready for impending respiratory failure',
      'Delaying CPAP initiation while waiting for hospital arrival',
      'Missing contributing factors (MI, arrhythmia, medication non-compliance)',
      'Inadequate pain relief - morphine reduces catecholamine surge',
      'Not reassuring and calming anxious patient (fear worsens symptoms)',
      'Forgetting to check for signs of cardiogenic shock (cool peripheries, confusion)',
      'AVOID routine IV fluid boluses — pulmonary oedema is a fluid-overload state, not hypovolaemia. Further crystalloid will worsen SpO2 and respiratory distress. Give fluids ONLY for cardiogenic shock with confirmed hypovolaemia, in small (250mL) titrated boluses with close reassessment.',
    ],
    equipmentNeeded: [
      'High-flow oxygen therapy (15L/min non-rebreather or CPAP)',
      'NIV/BiPAP machine with full-face mask',
      'IV access equipment and crystalloid fluids',
      'GTN (sublingual spray or IV infusion)',
      'Furosemide (IV)',
      'Morphine',
      'Cardiac monitor with 12-lead ECG',
      'Pulse oximeter',
      'Blood pressure monitor',
      'Suction equipment',
      'Bag-valve-mask with PEEP valve',
      'Intubation equipment (prepared but not necessarily used)',
      'Nitroglycerin paste (optional)',
      'Blood glucose testing kit'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Cardiac and Respiratory Emergencies Protocol',
        'DCAS Acute Pulmonary Edema Management Guidelines',
        'ESC Guidelines - Acute and Chronic Heart Failure',
        'AHA/ACC Heart Failure Guidelines'
      ],
      receivingFacilities: [
        {
          name: 'Cleveland Clinic Abu Dhabi',
          location: 'Al Maryah Island, Abu Dhabi',
          capabilities: ['Emergency Department', 'Cardiac ICU', 'Heart Failure Unit', '24/7 Cardiac Services'],
          contact: '02 501 8000',
          distance: '90 minutes from Emirates Hills'
        },
        {
          name: 'Sheikh Khalifa Medical City',
          location: 'Abu Dhabi',
          capabilities: ['Emergency Department', 'Cardiac ICU', 'Advanced Heart Failure Management'],
          contact: '02 610 2000',
          distance: '85 minutes from Emirates Hills'
        },
        {
          name: 'Rashid Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['24/7 Emergency Department', 'Cardiac Catheterization', 'Cardiothoracic ICU'],
          contact: '04 219 3000',
          distance: '25 minutes from Emirates Hills'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Emergency Department', 'Cardiac ICU', 'Interventional Cardiology'],
          contact: '04 435 9999',
          distance: '20 minutes from Emirates Hills'
        }
      ],
      localConsiderations: [
        'Emirates Hills is an affluent area - private insurance likely, patients may prefer private hospitals',
        'Household staff (nannies, drivers) may be present - identify key decision maker',
        'Elderly expatriates in Emirates Hills often live alone or with spouse',
        'Hot climate can exacerbate fluid retention - check compliance with fluid restrictions',
        'During Ramadan, elderly may not be fasting but family may be - communication important',
        'Private ambulance services common in area - coordinate with DCAS if private service called',
        'Many residents have personal physicians - patient may want specific hospital preference',
        'Documentation of living will/Advanced Directive may be present in medical records'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-pe-001',
          type: 'image',
          title: 'Pulmonary Edema X-ray - Butterfly Pattern',
          url: 'https://radiopaedia.org/cases/cardiogenic-pulmonary-edema',
          source: 'Radiopaedia',
          relevance: 'essential',
          tags: ['pulmonary-edema', 'x-ray', 'cardiogenic']
        },
        {
          id: 'img-pe-002',
          type: 'image',
          title: 'Jugular Venous Distension Assessment',
          url: 'https://www.statpearls.com/ArticleLibrary/viewarticle/23890',
          source: 'StatPearls',
          relevance: 'important',
          tags: ['JVD', 'examination', 'heart-failure']
        },
        {
          id: 'img-pe-003',
          type: 'image',
          title: 'Heart Failure: Acute Management Algorithm',
          url: 'https://www.heart.org/en/health-topics/heart-failure/treatment-options-for-heart-failure',
          source: 'American Heart Association',
          relevance: 'essential',
          tags: ['heart-failure', 'algorithm', 'management', 'AHA']
        }
      ],
      videos: [
        {
          id: 'vid-pe-001',
          type: 'video',
          title: 'Acute Pulmonary Edema: Pathophysiology and Management',
          url: 'https://www.youtube.com/watch?v=q7aN10XUhvI',
          source: 'JAMA Network',
          duration: '16:20',
          relevance: 'essential',
          tags: ['pulmonary-edema', 'pathophysiology', 'management']
        },
        {
          id: 'vid-pe-002',
          type: 'video',
          title: 'CPAP in Acute Cardiogenic Pulmonary Edema',
          url: 'https://www.youtube.com/watch?v=dxFOYVUlY2U',
          source: 'Strong Medicine',
          duration: '10:15',
          relevance: 'essential',
          tags: ['hemorrhage', 'bleeding-control', 'first-aid']
        },
        {
          id: 'vid-pe-003',
          type: 'video',
          title: 'Heart Failure Management in Emergency Care',
          url: 'https://www.youtube.com/watch?v=yCzkks51CfQ',
          source: 'Armando Hasudungan',
          duration: '16:20',
          relevance: 'essential',
          tags: ['heart-failure', 'emergency', 'management']
        }
      ],
      articles: [
        {
          id: 'art-pe-001',
          type: 'article',
          title: 'Acute Pulmonary Edema: Assessment and Management',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/',
          source: 'New England Journal of Medicine',
          relevance: 'essential',
          tags: ['pulmonary-edema', 'assessment', 'management']
        },
        {
          id: 'art-pe-002',
          type: 'article',
          title: 'NIV in Acute Cardiogenic Pulmonary Edema',
          url: 'https://www.bmj.com/content/335/7630/1112',
          source: 'British Medical Journal',
          relevance: 'essential',
          tags: ['NIV', 'CPAP', 'pulmonary-edema']
        },
        {
          id: 'art-pe-003',
          type: 'article',
          title: 'Diuretics in Acute Heart Failure',
          url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Acute-and-Chronic-Heart-Failure',
          source: 'European Society of Cardiology',
          relevance: 'important',
          tags: ['diuretics', 'heart-failure', 'furosemide']
        }
      ]
    }
  }),

  createCase({
    id: 'resp-009',
    title: 'Foreign Body Aspiration in Adult',
    category: 'respiratory',
    subcategory: 'choking',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: 'Man choking on food, cannot breathe',
      timeOfDay: 'evening',
      location: 'Restaurant, Downtown Dubai',
      callerInfo: 'Restaurant manager',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 45,
      gender: 'male',
      weight: 85,
      occupation: 'Businessman',
      language: 'English'
    },
    sceneInfo: {
      description: 'Restaurant table, patient standing',
      hazards: [],
      bystanders: 'Restaurant patrons and staff',
      environment: 'Public place'
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, clutching throat, universal choking sign',
      position: 'Standing',
      appearance: 'Cyanotic, distressed, unable to speak',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Complete obstruction', 'Unable to speak or cough'],
        interventions: ['Alternate 5 back blows then 5 abdominal thrusts (AHA 2025)', 'If unconscious: CPR and check airway']
      },
      breathing: {
        rate: 0,
        rhythm: 'Absent',
        depth: 'None',
        spo2: 70,
        findings: ['No air movement', 'Cyanosis'],
        interventions: ['Immediate airway clearance'],
        auscultation: ['Stridor', 'Reduced air entry', 'No wheeze']
      },
      circulation: {
        pulseRate: 140,
        pulseQuality: 'Weak',
        bp: { systolic: 100, diastolic: 60 },
        capillaryRefill: 4,
        skin: 'Cyanotic',
        findings: ['Hypoxic tachycardia'],
        interventions: []
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 1, motor: 6, total: 11 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Distressed'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: [],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Universal choking sign'],
      neck: ['Normal'],
      chest: ['No air entry'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Cyanosis', 'No peripheral oedema'],
      posterior: ['Normal'],
      neurological: ['Alert but distressed']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown'],
      surgicalHistory: [],
      lastMeal: 'Currently eating steak',
      eventsLeading: 'Started choking while eating steak'
    },
    vitalSignsProgression: {
      initial: { bp: '100/60', pulse: 140, respiration: 0, spo2: 70, gcs: 11, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Complete airway obstruction', 'Unable to speak or cough'],
      redFlags: ['Imminent cardiac arrest', 'Complete obstruction'],
      differentialDiagnoses: ['Foreign body airway obstruction', 'Anaphylaxis', 'Severe asthma'],
      mostLikelyDiagnosis: 'Complete Foreign Body Airway Obstruction'
    },
    managementPathway: {
      immediate: [
        'CONFIRM complete obstruction — patient cannot speak, cough, or breathe; universal choking sign',
        'Do NOT perform blind finger sweep — do not reach into airway unless foreign body is directly visible',
        'Stand patient upright and lean forward if conscious and standing',
        '5 firm back blows — heel of hand between shoulder blades',
        '5 abdominal thrusts — positioned above umbilicus, below xiphoid; upward and inward; repeat alternating cycles (AHA 2025)',
        'If patient becomes unconscious — lower to ground, begin CPR',
        'Each time airway is opened for rescue breaths — look for visible object and remove ONLY if visible',
        'Laryngoscopy and Magill forceps — if patient unconscious and intubation equipment available'
      ],
      definitive: [
        'If all attempts fail — surgical airway: needle cricothyrotomy (14G cannula through cricothyroid membrane)',
        'RSI and direct laryngoscopy under sedation at hospital if object not expelled prehospital',
        'Rigid bronchoscopy — definitive removal of lower airway foreign body at hospital',
        'All patients successfully relieved still require ED review — risk of airway trauma and aspiration pneumonia'
      ],
      monitoring: [
        'SpO2 continuous once oximeter can be applied — SpO2 70% is critically low',
        'Reassess airway after each cycle of back blows/abdominal thrusts',
        'GCS/AVPU — deteriorating consciousness = hypoxic brain injury developing',
        'Post-relief: auscultate for air entry bilaterally and abnormal breath sounds'
      ],
      transportConsiderations: [
        'If object relieved — transport to ED for assessment regardless of apparent recovery',
        'If object NOT relieved — perform ongoing CPR and transport immediately with pre-alert',
        'Communicate clearly to receiving team: "FBAO, partial/complete, interventions attempted, current patient state"',
        'Do not stop resuscitation efforts en route — continue CPR and airway manoeuvres',
        'Pre-alert Rashid Hospital trauma team if ongoing obstruction'
      ]
    },
    studentChecklist: [
      { id: 'resp9-1', category: 'abcde', description: 'Recognize complete airway obstruction', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'resp9-2', category: 'intervention', description: 'Perform alternating 5 back blows then 5 abdominal thrusts (AHA 2025 protocol)', points: 20, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'resp9-3', category: 'intervention', description: 'Alternate sets of 5 back blows and 5 abdominal thrusts until object expelled or patient becomes unconscious (AHA 2025)', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp9-4', category: 'abcde', description: 'Prepare for CPR if patient becomes unconscious', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'resp9-5', category: 'abcde', description: 'Assess for universal choking sign and inability to speak', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'resp9-6', category: 'intervention', description: 'Position hands correctly for abdominal thrusts', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp9-7', category: 'intervention', description: 'Encourage coughing if partial obstruction', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp9-8', category: 'safety', description: 'Ensure scene safety and crowd control', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp9-9', category: 'intervention', description: 'Check airway visually if patient becomes unconscious', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'resp9-10', category: 'intervention', description: 'Remove visible foreign body if possible', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'resp9-11', category: 'communication', description: 'Instruct bystanders to call emergency services', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp9-12', category: 'documentation', description: 'Document obstruction cause and removal method', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Complete obstruction = unable to speak, cough, or breathe',
      'AHA 2025 FBAO protocol: alternate 5 back blows then 5 abdominal thrusts for conscious adults (not abdominal thrusts alone). Continue cycles until object expelled or patient becomes unconscious',
      'For infants: alternate 5 back blows then 5 chest thrusts (NO abdominal thrusts in infants per AHA 2025)',
      'If patient becomes unconscious, start CPR and check airway',
      'Do not attempt blind finger sweeps in conscious patients'
    ],
    commonPitfalls: [
      'Delaying intervention to ask extensive history questions',
      'Performing finger sweep in conscious patient (can push object deeper)',
      'Not recognizing partial vs complete obstruction',
      'Performing only abdominal thrusts without alternating with back blows (AHA 2025 recommends alternating 5 back blows then 5 abdominal thrusts)',
      'Not positioning hands correctly for abdominal thrusts',
      'Continuing thrusts after object is expelled',
      'Not calling for backup/EMS immediately',
      'Failing to recognize when patient becomes unconscious',
      'Not having suction and airway equipment ready',
      'Not checking for effectiveness after each thrust sequence'
    ],
    equipmentNeeded: [
      'Gloves (universal precautions)',
      'Portable suction unit (Yankauer and flexible catheters)',
      'Magill forceps',
      'Laryngoscope with various blade sizes',
      'Bag-valve-mask with appropriate mask size',
      'Oropharyngeal and nasopharyngeal airways',
      'Endotracheal tubes (various sizes)',
      'Laryngeal mask airway (LMA)',
      'Magill forceps',
      'Pocket mask with one-way valve',
      'AED/defibrillator',
      'Oxygen and delivery devices',
      'Spinal board (if CPR required)',
      'Towel or cloth (for privacy/dignity in public setting)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Airway Obstruction Protocol',
        'DCAS BLS/ALS Choking Management Guidelines',
        'AHA 2025 Guidelines for CPR and ECC - FBAO (back blows + abdominal thrusts)',
        'ERC Guidelines - Adult BLS'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Emergency Department',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['24/7 Emergency Department', 'ENT Services', 'Bronchoscopy', 'Thoracic Surgery'],
          contact: '04 219 3000',
          distance: '10 minutes from Downtown Dubai'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Emergency Department', 'ENT Specialists', 'Intensive Care'],
          contact: '04 222 1211',
          distance: '12 minutes from Downtown Dubai'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['Emergency Department', 'ENT Services'],
          contact: '04 377 5500',
          distance: '15 minutes from Downtown Dubai'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Emergency Department', 'ENT Specialists'],
          contact: '04 435 9999',
          distance: '12 minutes from Downtown Dubai'
        }
      ],
      localConsiderations: [
        'Downtown Dubai restaurants have high turnover - staff may be untrained in choking response',
        'Public place with witnesses - maintain patient dignity while performing intervention',
        'Crowd control important - request restaurant staff to clear area',
        'Multinational crowd in Downtown - language barriers for bystander assistance',
        'Legal considerations - document consent from patient before invasive procedures',
        'Some bystanders may attempt inappropriate interventions - take charge firmly',
        'VIP or business clientele common in area - professional demeanor essential',
        'Police notification not typically required unless death or serious injury',
        'Consider emotional support for witnesses, especially children'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-choking-001',
          type: 'image',
          title: 'Universal Choking Sign',
          url: 'https://redcross.org/content/dam/redcross/training/ansi/Universal-Choking-Sign.jpg',
          source: 'American Red Cross',
          relevance: 'essential',
          tags: ['choking', 'sign', 'recognition']
        },
        {
          id: 'img-choking-002',
          type: 'image',
          title: 'Heimlich Maneuver Hand Position',
          url: 'https://redcross.org/content/dam/redcross/training/ansi/Heimlich-Hand-Position.jpg',
          source: 'American Red Cross',
          relevance: 'essential',
          tags: ['heimlich', 'hand-position', 'technique']
        }
      ],
      videos: [
        {
          id: 'vid-choking-001',
          type: 'video',
          title: 'Adult Choking: Recognition and Response',
          url: 'https://www.youtube.com/watch?v=Thj4EiFPyNA',
          source: 'Osmosis from Elsevier',
          duration: '5:30',
          relevance: 'essential',
          tags: ['choking', 'adult', 'heimlich']
        },
        {
          id: 'vid-choking-002',
          type: 'video',
          title: 'Management of Foreign Body Airway Obstruction',
          url: 'https://www.youtube.com/watch?v=AKRr2PMl4zE',
          source: 'MedCram',
          duration: '5:30',
          relevance: 'essential',
          tags: ['FBAO', 'management', 'airway']
        },
        {
          id: 'vid-choking-003',
          type: 'video',
          title: 'Choking vs Partial Obstruction: How to Differentiate',
          url: 'https://www.youtube.com/watch?v=P7Fkg7_yXL0',
          source: 'Strong Medicine',
          duration: '5:30',
          relevance: 'important',
          tags: ['choking', 'obstruction', 'differentiation']
        }
      ],
      articles: [
        {
          id: 'art-choking-001',
          type: 'article',
          title: 'Foreign Body Airway Obstruction Management',
          url: 'https://www.resuscitationjournal.com/article/S0300-9572(21)00123-4/fulltext',
          source: 'Resuscitation Journal',
          relevance: 'essential',
          tags: ['FBAO', 'management', 'guidelines']
        },
        {
          id: 'art-choking-002',
          type: 'article',
          title: 'Heimlich Maneuver: Evidence and Technique',
          url: 'https://www.acep.org/patient-care/clinical-policies/foreign-body-airway-obstruction/',
          source: 'American College of Emergency Physicians',
          relevance: 'essential',
          tags: ['heimlich', 'evidence', 'technique']
        },
        {
          id: 'art-choking-003',
          type: 'article',
          title: 'Deaths from Choking in Adults: Preventable Tragedies',
          url: 'https://www.bmj.com/content/363/bmj.k4567',
          source: 'British Medical Journal',
          relevance: 'supplementary',
          tags: ['choking', 'deaths', 'prevention']
        }
      ]
    }
  }),

  createCase({
    id: 'resp-011',
    title: 'Community Acquired Pneumonia',
    category: 'respiratory',
    subcategory: 'pneumonia',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Fever and cough for 3 days, now very short of breath',
      timeOfDay: 'afternoon',
      location: 'Apartment, Deira',
      callerInfo: 'Son',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 65,
      gender: 'male',
      weight: 75,
      occupation: 'Retired',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Living room, patient on sofa',
      hazards: [],
      bystanders: 'Family members',
      environment: 'Home'
    },
    initialPresentation: {
      generalImpression: 'Elderly male, appears unwell, tachypneic',
      position: 'Sitting',
      appearance: 'Flushed, diaphoretic',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: ['Oxygen']
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 88,
        findings: ['Crackles right base', 'Bronchial breathing right', 'Pleuritic chest pain'],
        interventions: ['High-flow O2', 'Antibiotics'],
        auscultation: ['Focal crackles right lower lobe', 'Bronchial breathing right base', 'Normal left lung']
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Regular',
        bp: { systolic: 110, diastolic: 70 },
        capillaryRefill: 2,
        skin: 'Warm, flushed',
        findings: ['Tachycardic', 'Fever'],
        interventions: ['IV access', 'Fluids']
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
        temperature: 39.0,
        findings: ['Fever 39°C', 'Rigors'],
        interventions: ['Antipyretics']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Right basal crackles', 'Bronchial breathing', 'Increased tactile fremitus'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '5mg', frequency: 'Daily', indication: 'Hypertension' }
      ],
      allergies: ['None'],
      medicalConditions: ['Hypertension', 'Type 2 Diabetes'],
      surgicalHistory: [],
      lastMeal: 'Light breakfast',
      eventsLeading: '3 days of fever, productive cough, pleuritic chest pain'
    },
    vitalSignsProgression: {
      initial: { bp: '110/70', pulse: 110, respiration: 28, spo2: 88, gcs: 15, temperature: 39.0, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Consolidation right lower lobe', 'CURB-65 score 2'],
      redFlags: ['Severe pneumonia', 'Sepsis risk'],
      differentialDiagnoses: ['Community acquired pneumonia', 'Pleural effusion', 'Lung cancer', 'Pulmonary embolism'],
      mostLikelyDiagnosis: 'Community Acquired Pneumonia (Right Lower Lobe)'
    },
    managementPathway: {
      immediate: [
        'Oxygen via non-rebreather mask — target SpO2 >94% (or 88-92% if known COPD)',
        'Position upright — maximises ventilation and reduces work of breathing',
        'IV access x1-2 (18G) — for fluids and antibiotics',
        'IV fluids 500mL NS bolus if signs of sepsis (qSOFA ≥2: RR >22, altered mentation, SBP ≤100)',
        'Calculate CURB-65 (Confusion, Urea, RR>30, BP<90/60, age≥65) — score 2 = consider hospital admission',
        'Blood glucose check',
        'Temperature and full vital signs — fever, tachycardia, tachypnoea = sepsis screen',
        'Antipyretics if temperature >38.5°C — Paracetamol 1g IV or oral'
      ],
      definitive: [
        'Broad-spectrum IV antibiotics within 1 hour of recognition — Amoxicillin/Clavulanic acid + Azithromycin (or Ceftriaxone 1-2g IV for hospitalised patients)',
        'Hospital admission for CURB-65 ≥2 — respiratory ward or HDU',
        'Rashid Hospital, American Hospital Dubai, or Mediclinic City Hospital',
        'Chest X-ray — confirms consolidation, identifies complications (effusion, abscess)',
        'Blood cultures x2 before antibiotics if hospital permits',
        'Consider ICU if septic shock, SpO2 <90% despite O2, or respiratory failure'
      ],
      monitoring: [
        'SpO2 continuous — monitor response to oxygen therapy',
        'RR every 5-10 minutes — >30 breaths/min = severe, consider intubation',
        'BP every 10-15 minutes — sepsis hypotension may develop',
        'Mental status — new confusion in an elderly patient with pneumonia = severe disease',
        'Temperature trend — persistent fever despite antibiotics = complications'
      ],
      transportConsiderations: [
        'Pre-alert with "elderly male, CAP with sepsis features, SpO2 88%, CURB-65 score 2"',
        'Maintain upright position in transport — do not allow supine',
        'Oxygen must be maintained en route — portable cylinder with non-rebreather',
        'IV antibiotics should be commenced before or during transport if available',
        'Reassess BP and mental status every 5-10 minutes during transport'
      ]
    },
    studentChecklist: [
      { id: 'resp10-1', category: 'abcde', description: 'Assess severity using CURB-65', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp10-2', category: 'intervention', description: 'Oxygen to maintain SpO2 > 94%', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp10-3', category: 'intervention', description: 'IV antibiotics within 1 hour', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'resp10-4', category: 'intervention', description: 'IV fluids for sepsis', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp10-5', category: 'abcde', description: 'Assess for sepsis criteria (qSOFA)', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'resp10-6', category: 'abcde', description: 'Auscultate for crackles and bronchial breathing', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp10-7', category: 'history', description: 'Ask about fever duration and sputum production', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp10-8', category: 'abcde', description: 'Monitor temperature and vital signs', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp10-9', category: 'intervention', description: 'Position patient upright for optimal ventilation', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp10-10', category: 'intervention', description: 'Antipyretics for fever management', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp10-11', category: 'communication', description: 'Pre-alert hospital for sepsis protocol activation', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp10-12', category: 'documentation', description: 'Document CURB-65 score and antibiotic timing', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'CURB-65 helps determine severity and need for hospitalization',
      'Antibiotics within 1 hour improves outcomes in severe pneumonia',
      'Check for sepsis - fever, tachycardia, tachypnea, altered mental status',
      'Consider atypical coverage if risk factors present'
    ],
    commonPitfalls: [
      'Delaying antibiotic administration while waiting for hospital arrival',
      'Not calculating CURB-65 score to guide disposition decisions',
      'Failing to recognize sepsis early (qSOFA criteria)',
      'Inadequate fluid resuscitation for sepsis',
      'Missing contraindications to aggressive fluid administration (heart failure, renal failure)',
      'Not obtaining blood cultures before antibiotics when possible',
      'Overlooking atypical pathogens (Legionella, Mycoplasma) in UAE expatriate population',
      'Not monitoring lactate levels as marker of tissue perfusion',
      'Failing to reassess after interventions (vitals, urine output, mental status)',
      'Not preparing for potential deterioration to septic shock'
    ],
    equipmentNeeded: [
      'Oxygen therapy equipment (nasal cannula, simple mask, non-rebreather)',
      'IV access equipment (14G-18G catheters)',
      'Crystalloid fluids (normal saline or lactated Ringer\'s)',
      'Broad-spectrum antibiotics (per DCAS protocol)',
      'Cardiac monitor',
      'Pulse oximeter',
      'Blood pressure monitor',
      'Thermometer',
      'Blood glucose testing kit',
      'Blood culture bottles (if time permits)',
      'Lactate testing (i-STAT or equivalent)',
      'Suction equipment',
      'Bag-valve-mask',
      'Urinary catheter kit (for output monitoring)',
      'Portable ventilator (if respiratory failure develops)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Sepsis Management Protocol',
        'DCAS Community Acquired Pneumonia Guidelines',
        'Surviving Sepsis Campaign Guidelines',
        'NICE Guidelines NG138: Pneumonia in Adults'
      ],
      receivingFacilities: [
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Emergency Department', 'Medical ICU', 'Infectious Disease Specialists', 'Microbiology Lab'],
          contact: '04 222 1211',
          distance: '5 minutes from Deira'
        },
        {
          name: 'Rashid Hospital',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Emergency Department', 'ICU', 'Respiratory Services'],
          contact: '04 219 3000',
          distance: '8 minutes from Deira'
        },
        {
          name: 'Al Zahra Hospital Dubai',
          location: 'Sheikh Zayed Road, Dubai',
          capabilities: ['Emergency Department', 'ICU', 'Internal Medicine'],
          contact: '04 377 5500',
          distance: '12 minutes from Deira'
        },
        {
          name: 'Latifa Hospital',
          location: 'Oud Metha, Dubai',
          capabilities: ['Emergency Department', 'Medical Wards'],
          contact: '04 219 3000',
          distance: '10 minutes from Deira'
        }
      ],
      localConsiderations: [
        'Deira is densely populated with many older residential buildings',
        'Large South Asian and Filipino expatriate population - consider TB if risk factors',
        'Hajj and Umrah returnees may have atypical infections',
        'Close living quarters in Deira increase transmission risk',
        'Elderly residents may live with extended family - multiple generations present',
        'During winter months (Nov-Feb), respiratory infections peak in UAE',
        'Air conditioning systems can harbor Legionella - ask about system maintenance',
        'Diabetes prevalence high in UAE - check blood sugar as part of assessment',
        'Pilgrims returning from Hajj/Umrah at risk for MERS-CoV - use PPE',
        'Family may want religious leader present - accommodate if possible'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-pneumonia-001',
          type: 'image',
          title: 'Right Lower Lobe Consolidation - Chest X-ray',
          url: 'https://radiopaedia.org/cases/right-lower-lobe-pneumonia',
          source: 'Radiopaedia',
          relevance: 'essential',
          tags: ['pneumonia', 'consolidation', 'x-ray']
        },
        {
          id: 'img-pneumonia-002',
          type: 'image',
          title: 'CURB-65 Score Assessment Tool',
          url: 'https://www.nice.org.uk/guidance/ng138/chapter/recommendations',
          source: 'NICE Guidelines',
          relevance: 'essential',
          tags: ['CURB-65', 'score', 'pneumonia', 'NICE']
        },
        {
          id: 'img-pneumonia-003',
          type: 'image',
          title: 'Pneumonia: Diagnosis and Management',
          url: 'https://bestpractice.bmj.com/topics/en-gb/3000017',
          source: 'BMJ Best Practice',
          relevance: 'important',
          tags: ['pneumonia', 'diagnosis', 'management']
        }
      ],
      videos: [
        {
          id: 'vid-pneumonia-001',
          type: 'video',
          title: 'Community Acquired Pneumonia: Assessment and Management',
          url: 'https://www.youtube.com/watch?v=JhzUUn9YiMM',
          source: 'Osmosis from Elsevier',
          duration: '17:30',
          relevance: 'essential',
          tags: ['pneumonia', 'community', 'management']
        },
        {
          id: 'vid-pneumonia-002',
          type: 'video',
          title: 'Sepsis Recognition and Hour-1 Bundle',
          url: 'https://www.youtube.com/watch?v=kUNxXRqDBWs',
          source: 'Ninja Nerd',
          duration: '14:15',
          relevance: 'essential',
          tags: ['sepsis', 'bundle', 'recognition']
        },
        {
          id: 'vid-pneumonia-003',
          type: 'video',
          title: 'Chest X-ray Interpretation in Pneumonia',
          url: 'https://www.youtube.com/watch?v=4fMM6qTa7bY',
          source: 'MedCram',
          duration: '15:30',
          relevance: 'important',
          tags: ['chest-xray', 'pneumonia', 'interpretation']
        }
      ],
      articles: [
        {
          id: 'art-pneumonia-001',
          type: 'article',
          title: 'Diagnosis and Treatment of Adults with Community-acquired Pneumonia',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5812454/',
          source: 'American Journal of Respiratory and Critical Care Medicine',
          relevance: 'essential',
          tags: ['pneumonia', 'diagnosis', 'treatment']
        },
        {
          id: 'art-pneumonia-002',
          type: 'article',
          title: 'CURB-65: A Useful Tool for Pneumonia Severity Assessment',
          url: 'https://www.bmj.com/content/322/7292/1310',
          source: 'British Medical Journal',
          relevance: 'essential',
          tags: ['CURB-65', 'severity', 'assessment']
        },
        {
          id: 'art-pneumonia-003',
          type: 'article',
          title: 'Surviving Sepsis Campaign: International Guidelines 2021',
          url: 'https://www.sccm.org/Guidelines/Guidelines/Surviving-Sepsis-Campaign-Guidelines',
          source: 'Society of Critical Care Medicine',
          relevance: 'important',
          tags: ['sepsis', 'guidelines', 'bundle']
        },
        {
          id: 'art-pneumonia-004',
          type: 'article',
          title: 'Community Acquired Pneumonia - CCC',
          url: 'https://litfl.com/community-acquired-pneumonia/',
          source: 'Life in the Fast Lane',
          relevance: 'supplementary',
          tags: ['pneumonia', 'LITFL', 'emergency', 'review']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL NEUROLOGICAL CASES (Adding 7+ cases)
// ============================================================================

export const additionalNeurologicalCases: CaseScenario[] = [
  createCase({
    id: 'neuro-004',
    title: 'Bacterial Meningitis',
    category: 'neurological',
    subcategory: 'meningitis',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Severe headache, fever, stiff neck, confused',
      timeOfDay: 'morning',
      location: 'University dorm, Dubai',
      callerInfo: 'Roommate',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 20,
      gender: 'female',
      weight: 55,
      occupation: 'University student',
      language: 'English'
    },
    sceneInfo: {
      description: 'Dorm room, patient in bed',
      hazards: [],
      bystanders: 'Roommate',
      environment: 'Dimly lit room'
    },
    initialPresentation: {
      generalImpression: 'Young female, photophobia, neck stiffness',
      position: 'Lying still',
      appearance: 'Flushed, distressed by light',
      consciousness: 'Confused'
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
        findings: ['Tachypneic from pain/fever'],
        interventions: [],
        auscultation: ['Clear bilaterally', 'Good air entry']
      },
      circulation: {
        pulseRate: 120,
        pulseQuality: 'Regular',
        bp: { systolic: 90, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Warm, flushed',
        findings: ['Tachycardic', 'Low-normal BP', 'Early shock'],
        interventions: ['IV access', 'Fluids']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Confused', 'Photophobia', 'Neck stiffness', 'Kernig sign positive'],
        interventions: ['Protect from light']
      },
      exposure: {
        temperature: 40.0,
        findings: ['Fever 40°C', 'Non-blanching rash on legs'],
        interventions: ['Cooling measures']
      }
    },
    secondarySurvey: {
      head: ['Severe headache', 'Photophobia'],
      neck: ['Stiff neck', 'Meningismus'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Non-blanching petechial rash', 'No peripheral oedema'],
      posterior: ['Normal'],
      neurological: ['Confused', 'Positive Kernig and Brudzinski']
    },
    history: {
      medications: [{ name: 'Oral contraceptive', dose: 'Unknown', frequency: 'Daily', indication: 'Contraception' }],
      allergies: ['None'],
      medicalConditions: ['Previously healthy'],
      surgicalHistory: [],
      lastMeal: 'Skipped meals yesterday',
      eventsLeading: '2-day history of headache, fever, now confused with neck stiffness'
    },
    vitalSignsProgression: {
      initial: { bp: '90/60', pulse: 120, respiration: 22, spo2: 96, gcs: 14, temperature: 40.0, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Triad: fever, headache, neck stiffness', 'Altered consciousness', 'Possible meningococcemia'],
      redFlags: ['Septic shock', 'Death within hours if untreated'],
      differentialDiagnoses: ['Bacterial meningitis', 'Viral meningitis', 'Meningococcal sepsis', 'SAH'],
      mostLikelyDiagnosis: 'Acute Bacterial Meningitis (Meningococcal)'
    },
    managementPathway: {
      immediate: [
        'Droplet precautions IMMEDIATELY — N95 mask, gloves, gown, eye protection before patient contact',
        'ABC assessment — airway at risk with GCS 14; be prepared to escalate to advanced airway',
        'IV access x2 (large bore 16G)',
        'IV fluid resuscitation — 500mL NS bolus for septic shock (SBP 90/60)',
        'Benzylpenicillin 1.2g IM/IV (adult) — UK JRCALC / NICE CG102 prehospital first-line for suspected meningococcal disease with non-blanching rash (ceftriaxone 2g IV is hospital-initiated; benzylpenicillin is in every UK ambulance drug bag). Use ceftriaxone 2g IV only if penicillin-allergic alternative required or benzylpenicillin unavailable — do NOT delay transport to give antibiotics.',
        'Dexamethasone 10mg IV with or before first antibiotic dose (reduces inflammation)',
        'Blood glucose check',
        'Assess for non-blanching rash — glass test; positive rash = meningococcal septicaemia'
      ],
      definitive: [
        'ICU admission for monitoring and ongoing IV antibiotics',
        'CT head if raised ICP suspected before LP',
        'Lumbar puncture for CSF analysis (after CT and haemodynamic stability)',
        'Public health notification — contact tracing and prophylaxis for close contacts'
      ],
      monitoring: [
        'GCS every 5 minutes — deterioration indicates raised ICP or septic shock',
        'BP every 3 minutes — septic shock can develop rapidly',
        'SpO2 continuous',
        'Monitor for seizures — have midazolam drawn up and ready',
        'Pupil response — unequal pupils = herniation risk'
      ],
      transportConsiderations: [
        'Rapid transport — every minute of antibiotic delay increases mortality',
        'Pre-alert: "Suspected bacterial meningitis, septic shock, antibiotics given — need ICU"',
        'Maintain droplet precautions throughout transport',
        'Rashid Hospital or Dubai Hospital (ICU and infectious disease capabilities)'
      ]
    },
    studentChecklist: [
      { id: 'neuro4-1', category: 'abcde', description: 'Recognize meningitis triad and rash', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'neuro4-2', category: 'intervention', description: 'IV antibiotics within 30 minutes', points: 20, yearLevel: ['3rd-year', '4th-year'], complexity: ['expert'], critical: true },
      { id: 'neuro4-3', category: 'intervention', description: 'IV fluids for sepsis', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'neuro4-4', category: 'safety', description: 'Infection control - droplet precautions', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'neuro4-5', category: 'abcde', description: 'Assess for photophobia and neck stiffness', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'neuro4-6', category: 'abcde', description: 'Check for non-blanching rash (glass test)', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'neuro4-7', category: 'abcde', description: 'Monitor GCS and level of consciousness', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'neuro4-8', category: 'intervention', description: 'Administer dexamethasone with first antibiotic dose', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'neuro4-9', category: 'history', description: 'Ask about sick contacts and vaccination status', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'neuro4-10', category: 'abcde', description: 'Assess vital signs for septic shock indicators', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'neuro4-11', category: 'communication', description: 'Notify infection control and public health', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'neuro4-12', category: 'documentation', description: 'Document rash characteristics and antibiotic timing', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Bacterial meningitis is a medical emergency - time-critical antibiotics',
      'Classic triad: fever, headache, neck stiffness (may be absent in 20%)',
      'Non-blanching rash suggests meningococcal disease',
      'Do not delay antibiotics for CT scan'
    ],
    commonPitfalls: [
      'Waiting for CT scan before administering antibiotics - imaging must not delay treatment',
      'Failing to recognize early septic shock signs - hypotension may be a late finding',
      'Not using droplet precautions immediately - exposes healthcare workers to infection',
      'Missing subtle rash on dark skin - examine carefully in good lighting',
      'Delaying lumbar puncture argument - LP is contraindicated in sepsis/severe ICP only',
      'Not asking about sick contacts or recent travel - crucial for contact tracing',
      'Giving steroids AFTER antibiotics — dexamethasone must be given WITH or IMMEDIATELY BEFORE the first antibiotic dose to blunt the inflammatory cascade triggered by bacterial lysis (NICE NG240, IDSA). Delayed dex loses its benefit.',
      'Overlooking that triad is absent in up to 20% of bacterial meningitis cases',
      'Not monitoring for cerebral herniation signs - papilledema, unequal pupils',
      'Attributing confusion solely to fever - may indicate developing encephalitis'
    ],
    equipmentNeeded: [
      'Glucometer with strips',
      'Thermometer (tympanic/temporal)',
      'Pulse oximeter',
      'BP cuff',
      '12-lead ECG machine',
      'IV cannulation kit (14G-18G)',
      'Normal saline 0.9% 1000ml bags',
      'Wide-bore giving sets',
      'Ceftriaxone 2g vials',
      'Vancomycin 1g vials',
      'Dexamethasone 10mg vials',
      'Oxygen delivery devices',
      'Personal protective equipment (N95 masks, gloves, gowns, eye protection)',
      'Suction equipment',
      'Glass slide or clear object for blanching test',
      'Glasgow Coma Scale chart',
      'Transport monitor with BP cuff'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'Antibiotics must be given within 1 hour of hospital arrival - DO NOT wait for CT',
        'Prehospital antibiotics indicated if transport time exceeds 30 minutes',
        'Ceftriaxone 2g IV is first-line (Cefotaxime 2g IV acceptable alternative)',
        'Add Vancomycin 1g IV if penicillin resistance or healthcare-associated suspected',
        'Dexamethasone 10mg IV with or after first antibiotic dose',
        'Aggressive fluid resuscitation: 30ml/kg crystalloid for septic shock',
        'Droplet precautions mandatory until 24 hours of appropriate antibiotics',
        'Immediate notification of infection control for suspected meningococcal',
        'Contact prophylaxis required for household and close contacts',
        'Document GCS trends - deterioration suggests complications'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital',
          location: 'Dubai',
          capabilities: ['24/7 infectious disease', 'ICU', 'CT/MRI', 'Isolation facilities'],
          contact: 'Emergency: 800 424',
          distance: '20-25 minutes from University area'
        },
        {
          name: 'Dubai Hospital',
          location: 'Dubai',
          capabilities: ['Infectious disease', 'ICU', 'Neurology', 'Isolation units'],
          contact: 'Emergency: 800 424',
          distance: '25-30 minutes from University area'
        },
        {
          name: 'Sheikh Khalifa Medical City',
          location: 'Abu Dhabi',
          capabilities: ['Infectious disease', 'ICU', 'Advanced isolation', 'Research center'],
          contact: 'Emergency: 800 555',
          distance: '25-30 minutes'
        },
        {
          name: 'Al Zahra Hospital Dubai',
          location: 'Dubai',
          capabilities: ['Infectious disease', 'ICU', 'Modern isolation facilities'],
          contact: 'Emergency: 04 377 5500',
          distance: '20-25 minutes from University area'
        }
      ],
      localConsiderations: [
        'UAE mandatory meningococcal vaccination for Hajj/Umrah pilgrims since 2002',
        'Notifiable disease - immediate reporting to Dubai Health Authority required',
        'Close contact prophylaxis: Ciprofloxacin 500mg single dose or Rifampicin 600mg BD x 2 days',
        'University dormitories are high-risk settings - screening of contacts essential',
        'High expatriate population increases importation risk of exotic pathogens',
        'Extreme summer heat increases dehydration - aggressive fluid resuscitation critical',
        'Healthcare worker exposure requires immediate prophylaxis and monitoring',
        'Infection control hotline: Dubai 800 342, Abu Dhabi 800 555',
        'Cultural sensitivity required when discussing close contacts',
        'Insurance authorization NOT required for emergency meningitis treatment'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-meningitis-rash-neuro4',
          type: 'image',
          title: 'Meningococcal Septicemia Rash Progression',
          url: 'https://www.meningitis.org/sites/default/files/2020-05/meningococcal-rash-progression.jpg',
          source: 'Meningitis Research Foundation',
          caption: 'Progression from petechiae to purpura fulminans in meningococcal disease',
          relevance: 'essential',
          tags: ['meningitis', 'meningococcal', 'rash', 'septicemia', 'petechiae']
        },
        {
          id: 'img-meningitis-signs-neuro4',
          type: 'image',
          title: 'Meningeal Signs - Brudzinski and Kernig',
          url: 'https://www.statpearls.com/ArticleLibrary/viewarticle/24027',
          source: 'StatPearls',
          caption: 'Physical examination findings in meningeal irritation',
          relevance: 'essential',
          tags: ['meningitis', 'Brudzinski', 'Kernig', 'meningismus', 'physical-exam']
        },
        {
          id: 'img-meningitis-nice-neuro4',
          type: 'image',
          title: 'NICE Guideline: Meningitis Recognition',
          url: 'https://www.nice.org.uk/guidance/cg102',
          source: 'NICE Guidelines',
          caption: 'NICE recommendations for recognition and management of bacterial meningitis',
          relevance: 'important',
          tags: ['meningitis', 'NICE', 'guidelines', 'recognition']
        }
      ],
      videos: [
        {
          id: 'vid-meningitis-emergency-neuro4',
          type: 'video',
          title: 'Meningitis: Emergency Recognition and Management',
          url: 'https://www.youtube.com/watch?v=gIHUJs2eTHA',
          source: 'Osmosis from Elsevier',
          caption: 'Comprehensive emergency management of bacterial meningitis',
          duration: '14:25',
          relevance: 'essential',
          tags: ['meningitis', 'emergency', 'recognition', 'management', 'antibiotics']
        },
        {
          id: 'vid-meningococcal-early-neuro4',
          type: 'video',
          title: 'Early Recognition of Meningococcal Disease',
          url: 'https://www.youtube.com/watch?v=IaQdv_dBDqM',
          source: 'MedCram',
          caption: 'Critical early signs and symptoms of meningococcal infection',
          duration: '6:30',
          relevance: 'essential',
          tags: ['meningococcal', 'early-signs', 'recognition', 'rash', 'emergency']
        },
        {
          id: 'vid-glass-test-neuro4',
          type: 'video',
          title: 'The Glass Test - Identifying Meningococcal Rash',
          url: 'https://www.youtube.com/watch?v=ZEQNx4BZk_k',
          source: 'Ninja Nerd',
          caption: 'How to perform and interpret the glass test for non-blanching rash',
          duration: '2:15',
          relevance: 'important',
          tags: ['glass-test', 'rash', 'meningococcal', 'diagnosis', 'demonstration']
        },
        {
          id: 'vid-meningitis-ninja-neuro4',
          type: 'video',
          title: 'Bacterial Meningitis - Pathophysiology, Diagnosis, Treatment',
          url: 'https://www.youtube.com/watch?v=ONfpm6v2IqA',
          source: 'Strong Medicine',
          caption: 'Detailed lecture on bacterial meningitis pathophysiology and management',
          duration: '32:10',
          relevance: 'important',
          tags: ['meningitis', 'bacterial', 'pathophysiology', 'treatment']
        }
      ],
      articles: [
        {
          id: 'art-meningitis-litfl-neuro4',
          type: 'article',
          title: 'Meningitis - Life in the Fast Lane',
          url: 'https://litfl.com/meningitis/',
          source: 'Life in the Fast Lane',
          caption: 'Comprehensive guide to meningitis diagnosis and emergency management',
          relevance: 'essential',
          tags: ['meningitis', 'LITFL', 'emergency', 'diagnosis', 'management']
        },
        {
          id: 'art-meningococcal-bmj-neuro4',
          type: 'article',
          title: 'Meningococcal Disease: Diagnosis and Management',
          url: 'https://bestpractice.bmj.com/topics/en-gb/543',
          source: 'BMJ Best Practice',
          caption: 'Comprehensive guide to meningococcal disease recognition and treatment',
          relevance: 'essential',
          tags: ['meningococcal', 'sepsis', 'BMJ', 'emergency', 'diagnosis']
        },
        {
          id: 'art-meningitis-idsa-neuro4',
          type: 'article',
          title: 'IDSA Clinical Practice Guidelines for Bacterial Meningitis',
          url: 'https://www.idsociety.org/practice-guideline/bacterial-meningitis/',
          source: 'Infectious Diseases Society of America',
          caption: 'Evidence-based guidelines for diagnosis and treatment',
          relevance: 'important',
          tags: ['meningitis', 'IDSA', 'guidelines', 'bacterial', 'evidence-based']
        },
        {
          id: 'art-meningitis-rash-neuro4',
          type: 'article',
          title: 'The Glass Test for Meningococcal Rash',
          url: 'https://www.meningitisnow.org/meningitis-explained/symptoms/glass-test/',
          source: 'Meningitis Now',
          caption: 'Step-by-step guide to performing the glass test',
          relevance: 'essential',
          tags: ['glass-test', 'rash', 'meningococcal', 'diagnosis']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL METABOLIC CASES (Adding 6+ cases)
// ============================================================================

export const additionalMetabolicCases: CaseScenario[] = [
  createCase({
    id: 'metab-003',
    title: 'Severe Hyperkalemia with ECG Changes',
    category: 'metabolic',
    subcategory: 'electrolyte-emergency',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Weakness, palpitations, known kidney disease',
      timeOfDay: 'afternoon',
      location: 'Clinic, transferred by ambulance',
      callerInfo: 'Clinic nurse',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 58,
      gender: 'male',
      weight: 70,
      occupation: 'Teacher',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Clinic room',
      hazards: [],
      bystanders: 'Clinic staff',
      environment: 'Clinical setting'
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, appears weak, muscle weakness',
      position: 'Sitting on examination table',
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
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 38,
        pulseQuality: 'Irregular',
        bp: { systolic: 90, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Pale, cool',
        findings: ['Bradycardia', 'Irregular rhythm', 'Wide QRS on ECG'],
        interventions: ['IV calcium', 'Insulin/Glucose'],
        ecgFindings: ['Severe bradycardia 38 bpm', 'Peaked tented T waves V2-V5', 'Broadened QRS complexes >160ms', 'Loss of P waves', 'Developing sine wave pattern']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Muscle weakness', 'Paresthesias'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['AVF on left arm for dialysis'],
        interventions: ['12-lead ECG']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['JVD'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['AVF', 'Muscle weakness', 'Flaccid paralysis ascending'],
      posterior: ['Normal'],
      neurological: ['Flaccid paralysis', 'Diminished reflexes']
    },
    history: {
      medications: [
        { name: 'Metoprolol', dose: '50mg', frequency: 'BD', indication: 'Hypertension' },
        { name: 'Spironolactone', dose: '25mg', frequency: 'Daily', indication: 'Heart failure' }
      ],
      allergies: ['None'],
      medicalConditions: ['End-stage renal disease on hemodialysis', 'Hypertension'],
      surgicalHistory: [],
      lastMeal: 'Lunch',
      eventsLeading: 'Missed dialysis session yesterday, now weak with palpitations'
    },
    vitalSignsProgression: {
      initial: { bp: '90/60', pulse: 38, respiration: 18, spo2: 96, gcs: 15, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['ECG: peaked T waves, wide QRS, sine wave pattern', 'Muscle weakness', 'Missed dialysis'],
      redFlags: ['Cardiac arrest imminent', 'Sine wave pattern = pre-arrest'],
      differentialDiagnoses: ['Hyperkalemia', 'Hypermagnesemia', 'Digoxin toxicity', 'AV block'],
      mostLikelyDiagnosis: 'Life-Threatening Hyperkalemia'
    },
    managementPathway: {
      immediate: [
        '12-lead ECG immediately — identify hyperkalemia pattern: peaked T waves, wide QRS, loss of P waves, sine wave',
        'IV access x2 (large bore 16-18G) — avoid the arm with AVF',
        'Cardiac monitoring continuous — sine wave = pre-arrest, prepare for immediate intervention',
        'Calcium gluconate 10% 10mL (1g) IV over 2-3 minutes — cardioprotection, stabilises myocardial membrane',
        'Or Calcium chloride 10% 5-10mL IV via central line if available — 3x more ionised calcium',
        'Actrapid (regular insulin) 10 units IV with 50mL 50% dextrose — shifts K+ into cells over 15-30 min',
        'Salbutamol 10-20mg nebulised — additional K+ shift into cells via beta-2 stimulation',
        'Sodium bicarbonate 50mL of 8.4% IV if metabolic acidosis confirmed — shifts K+ intracellularly',
        'Check blood glucose after insulin administration — monitor for hypoglycaemia',
        'Pre-alert receiving hospital — life-threatening hyperkalemia, dialysis patient, ECG changes'
      ],
      definitive: [
        'Emergency haemodialysis — definitive treatment to remove potassium from body',
        'Rashid Hospital or American Hospital Dubai for nephrology and dialysis access',
        'Kayexalate (sodium polystyrene sulphonate) — GI potassium binder if stable; UAE-stocked. Patiromer not on UAE formulary as of 2026',
        'ICU admission for continuous cardiac monitoring post-treatment',
        'Repeat ECG after each intervention to assess response'
      ],
      monitoring: [
        'Continuous cardiac monitoring — watch for VF/pulseless VT; have defibrillator ready',
        'BP every 3-5 minutes — hypotension may be present',
        'Blood glucose every 15 minutes post-insulin',
        'SpO2 continuous',
        'Mental status — muscle weakness may progress to respiratory muscle paralysis'
      ],
      transportConsiderations: [
        'Rapid transport — life-threatening dysrhythmia may develop at any moment',
        'Pre-alert Rashid Hospital with dialysis access capability for emergency dialysis',
        'Defibrillator pads applied and charged before departing scene',
        'Have arrest drugs drawn up — CPR may be needed en route',
        'Do NOT delay on scene — calcium and insulin given, now transport immediately'
      ]
    },
    studentChecklist: [
      { id: 'met3-1', category: 'abcde', description: 'Recognize ECG changes of hyperkalemia', points: 15, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'met3-2', category: 'intervention', description: 'Calcium gluconate/chloride for cardioprotection', points: 20, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'met3-3', category: 'intervention', description: 'Insulin and glucose to shift potassium', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'met3-4', category: 'intervention', description: 'Salbutamol nebulizer', points: 5, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'met3-5', category: 'abcde', description: 'Identify sine wave pattern as pre-arrest rhythm', points: 20, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'met3-6', category: 'intervention', description: 'Establish large-bore IV access for medication administration', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'met3-7', category: 'intervention', description: 'Monitor glucose after insulin administration', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'met3-8', category: 'history', description: 'Check for missed dialysis and nephrotoxic medications', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'met3-9', category: 'intervention', description: 'Sodium bicarbonate if metabolic acidosis present', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'met3-10', category: 'abcde', description: 'Continuous cardiac monitoring during treatment', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'met3-11', category: 'communication', description: 'Pre-alert receiving facility for urgent dialysis', points: 15, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'met3-12', category: 'documentation', description: 'Document ECG findings and medication administration times', points: 5, yearLevel: ['4th-year'], complexity: ['expert'] }
    ],
    teachingPoints: [
      'ECG progression: peaked T → wide QRS → sine wave → VF/asystole',
      'Calcium stabilizes myocardium but does not lower potassium',
      'Insulin/glucose and salbutamol shift K+ intracellularly',
      'Definitive treatment: dialysis or potassium binders'
    ],
    commonPitfalls: [
      'Delaying calcium administration in presence of ECG changes - calcium is cardioprotective and should be given immediately',
      'Failing to recognize sine wave pattern as pre-arrest rhythm requiring immediate intervention',
      'Not establishing large-bore IV access early for medication administration',
      'Giving insulin without ensuring adequate glucose administration - causes hypoglycemia',
      'Forgetting that calcium chloride has more elemental calcium than gluconate but requires central line',
      'Not monitoring glucose frequently after insulin administration',
      'Failing to check for precipitating causes (missed dialysis, ACE inhibitors, potassium-sparing diuretics, tissue breakdown)',
      'Not communicating with receiving facility about need for urgent dialysis',
      'Over-relying on medications without planning for definitive dialysis treatment',
      'Missing associated metabolic abnormalities (metabolic acidosis, hypocalcemia, hyperphosphatemia)',
      'Not obtaining pre-treatment ECG for comparison',
      'Inadequate cardiac monitoring during treatment'
    ],
    equipmentNeeded: [
      'IV cannulation kit (14-18G large bore)',
      'Calcium gluconate 10% 10ml ampoules (first-line for cardioprotection)',
      'Calcium chloride 10% 10ml ampoules (if central access available)',
      'Regular insulin (short-acting)',
      'Dextrose 50% 50ml ampoules',
      'Salbutamol nebulizer solution (beta-agonist)',
      'Sodium bicarbonate 8.4% (for acidosis)',
      '0.9% Normal Saline 500ml bags',
      'Cardiac monitor with 12-lead ECG capability',
      'Defibrillator (prepared for cardiac arrest)',
      'Blood glucose meter',
      'Pulse oximeter',
      'Blood pressure monitor',
      'Blood gas analyzer or i-STAT',
      'IV infusion pumps',
      'Suction equipment',
      'Airway management equipment',
      'Emergency resuscitation drugs (adrenaline, atropine)',
      'Transport stretcher with monitoring capabilities'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Hyperkalemia Management Protocol v3.5',
        'DCAS Acute Electrolyte Emergency Guidelines',
        'KDIGO Clinical Practice Guideline for CKD Evaluation and Management',
        'UK Renal Association Guidelines for Hyperkalemia'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Emergency Department', 'Nephrology Consultation', 'Dialysis Services', 'Critical Care'],
          contact: '04 219 3000',
          distance: '20 minutes from clinic area'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Emergency Department', 'Nephrology', 'Dialysis Unit', 'Internal Medicine'],
          contact: '04 222 1211',
          distance: '18 minutes from clinic area'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['Emergency Department', 'Nephrology', 'Dialysis', 'Cardiac Monitoring'],
          contact: '04 377 5500',
          distance: '25 minutes from clinic area'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Emergency Department', 'Nephrology Services', 'ICU', 'Dialysis'],
          contact: '04 435 9999',
          distance: '22 minutes from clinic area'
        }
      ],
      localConsiderations: [
        'High prevalence of chronic kidney disease and diabetes in UAE - hyperkalemia common in dialysis patients',
        'Many patients on dialysis may miss sessions during Ramadan or holidays - check recent compliance',
        'Dialysis units may have waiting lists - urgent cases need emergency department evaluation first',
        'Cultural considerations: elderly patients may not be aware of medication interactions causing hyperkalemia',
        'Language barriers common - ensure family members understand importance of dialysis compliance',
        'Document all medications patient is taking - ACE inhibitors, ARBs, and potassium-sparing diuretics are common causes',
        'Hot climate increases risk of missed dialysis sessions - educate patients on hydration vs. fluid restriction',
        'Nephrology consultation available 24/7 at major hospitals - call early for admission planning'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-hyperkalemia-ecg',
          type: 'image',
          title: 'Hyperkalemia ECG Changes Progression',
          url: 'https://wikem.org/wiki/Hyperkalemia',
          source: 'WikEM',
          caption: 'Progressive ECG changes from peaked T waves to sine wave pattern',
          relevance: 'essential',
          tags: ['hyperkalemia', 'ECG', 'cardiac', 'electrolyte']
        },
        {
          id: 'img-sine-wave',
          type: 'image',
          title: 'Sine Wave Pattern in Severe Hyperkalemia',
          url: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Hyperkalaemia-sine-wave.jpg',
          source: 'Life in the Fast Lane',
          caption: 'Pre-arrest sine wave pattern indicating imminent cardiac arrest',
          relevance: 'essential',
          tags: ['hyperkalemia', 'sine-wave', 'cardiac-arrest', 'ECG']
        },
        {
          id: 'img-hyperkalemia-ada',
          type: 'image',
          title: 'Hyperkalemia Management Algorithm',
          url: 'https://www.diabetes.org/healthy-living/medication-treatments/kidney-disease-treatments',
          source: 'American Diabetes Association',
          relevance: 'important',
          tags: ['hyperkalemia', 'algorithm', 'management', 'CKD']
        }
      ],
      videos: [
        {
          id: 'vid-hyperkalemia-ecg',
          type: 'video',
          title: 'Hyperkalemia ECG Recognition and Treatment',
          url: 'https://www.youtube.com/watch?v=xmafdsADGi0',
          source: 'Osmosis from Elsevier',
          duration: '15:20',
          relevance: 'essential',
          tags: ['hyperkalemia', 'ECG', 'recognition', 'treatment']
        },
        {
          id: 'vid-hyperkalemia-management',
          type: 'video',
          title: 'Acute Hyperkalemia Management Algorithm',
          url: 'https://www.youtube.com/watch?v=EVbaPfHx_3I',
          source: 'MedCram',
          duration: '18:45',
          relevance: 'essential',
          tags: ['hyperkalemia', 'management', 'algorithm', 'electrolyte']
        },
        {
          id: 'vid-calcium-cardioprotection',
          type: 'video',
          title: 'Calcium for Cardioprotection in Hyperkalemia',
          url: 'https://www.youtube.com/watch?v=-32U9eU1hdM',
          source: 'Strong Medicine',
          duration: '10:30',
          relevance: 'important',
          tags: ['hyperkalemia', 'calcium', 'cardioprotection', 'treatment']
        },
        {
          id: 'vid-hyperkalemia-osmosis',
          type: 'video',
          title: 'Hyperkalemia: Causes, Symptoms, ECG, and Treatment',
          url: 'https://www.youtube.com/watch?v=P13WEPJg8Fc',
          source: 'ICU Advantage',
          duration: '11:45',
          relevance: 'important',
          tags: ['hyperkalemia', 'pathophysiology', 'ECG', 'treatment']
        }
      ],
      articles: [
        {
          id: 'art-hyperkalemia-lancet',
          type: 'article',
          title: 'Hyperkalemia in Chronic Kidney Disease',
          url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(14)61908-5/fulltext',
          source: 'The Lancet',
          caption: 'Comprehensive review of hyperkalemia management in CKD patients',
          relevance: 'essential',
          tags: ['hyperkalemia', 'CKD', 'management', 'review']
        },
        {
          id: 'art-hyperkalemia-ecg',
          type: 'article',
          title: 'ECG Manifestations of Hyperkalemia',
          url: 'https://emcrit.org/ibcc/hyperkalemia/',
          source: 'EMCrit',
          caption: 'Internet Book of Critical Care chapter on hyperkalemia ECG findings and management',
          relevance: 'essential',
          tags: ['hyperkalemia', 'ECG', 'manifestations', 'critical-care']
        },
        {
          id: 'art-hyperkalemia-treatment',
          type: 'article',
          title: 'Treatment of Acute Hyperkalemia: A Systematic Review',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4662123/',
          source: 'American Journal of Kidney Diseases',
          caption: 'Evidence-based review of hyperkalemia treatment strategies',
          relevance: 'important',
          tags: ['hyperkalemia', 'treatment', 'evidence', 'review']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL TOXICOLOGY CASES (Adding 7+ cases)
// ============================================================================

export const additionalToxicologyCases: CaseScenario[] = [
  createCase({
    id: 'tox-002',
    title: 'Opioid Overdose with Severe Respiratory Depression',
    category: 'toxicology',
    subcategory: 'opioid-overdose',
    priority: 'critical',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: 'Found unconscious, not breathing properly, needle nearby',
      timeOfDay: 'evening',
      location: 'Parking garage, Downtown',
      callerInfo: 'Security guard',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 32,
      gender: 'male',
      weight: 70,
      occupation: 'Unknown',
      language: 'Unknown'
    },
    sceneInfo: {
      description: 'Parking garage, patient on ground',
      hazards: ['Needle present', 'Unknown substances'],
      bystanders: 'Security guard',
      environment: 'Dimly lit, confined space'
    },
    initialPresentation: {
      generalImpression: 'Young male, supine, respiratory depression',
      position: 'Supine',
      appearance: 'Cyanotic lips, track marks visible',
      consciousness: 'Unresponsive'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Gurgling', 'Snoring respirations'],
        interventions: ['Airway positioning', 'Suction']
      },
      breathing: {
        rate: 6,
        rhythm: 'Irregular',
        depth: 'Shallow',
        spo2: 70,
        findings: ['Severe respiratory depression', 'Agonal respirations'],
        interventions: ['BVM ventilation', 'Naloxone'],
        auscultation: ['Shallow breath sounds', 'Reduced air entry bilaterally', 'Possible aspiration sounds right base']
      },
      circulation: {
        pulseRate: 50,
        pulseQuality: 'Weak',
        bp: { systolic: 80, diastolic: 50 },
        capillaryRefill: 4,
        skin: 'Cool, cyanotic',
        findings: ['Bradycardic', 'Hypotensive'],
        interventions: ['IV access', 'Fluids']
      },
      disability: {
        avpu: 'P',
        gcs: { eye: 1, verbal: 1, motor: 4, total: 6 },
        pupils: 'Bilateral pinpoint pupils',
        bloodGlucose: 5.4,
        findings: ['Pinpoint pupils', 'Decreased reflexes'],
        interventions: ['Naloxone']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Track marks on arms', 'Needle nearby', 'Small pupils'],
        interventions: ['Scene safety', 'PPE']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['Normal'],
      chest: ['Bilateral air entry'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Track marks', 'Cool peripheries'],
      posterior: ['Normal'],
      neurological: ['Unresponsive', 'Pinpoint pupils']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown - likely IVDU'],
      surgicalHistory: [],
      lastMeal: 'Unknown',
      eventsLeading: 'Found by security guard in parking garage'
    },
    vitalSignsProgression: {
      initial: { bp: '80/50', pulse: 50, respiration: 6, spo2: 70, gcs: 6, bloodGlucose: 5.4 },
      afterIntervention: { bp: '120/80', pulse: 90, respiration: 16, spo2: 96, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Opioid toxidrome: respiratory depression + pinpoint pupils', 'Risk of withdrawal with naloxone'],
      redFlags: ['Respiratory arrest', 'Cardiac arrest risk'],
      differentialDiagnoses: ['Opioid overdose', 'Head injury', 'Hypoglycemia', 'Stroke'],
      mostLikelyDiagnosis: 'Acute Opioid Overdose'
    },
    managementPathway: {
      immediate: ['Airway opening maneuver', 'High-flow oxygen via BVM if respiratory rate <8 or SpO2 <90%', 'Naloxone 0.4-0.8mg IV/IM/IN (titrate to respiratory effort)', 'Repeat naloxone every 2-3 minutes as needed', 'Check blood glucose', 'IV access', 'Position in recovery position'],
      definitive: ['Emergency department observation for 4-6 hours minimum', 'Continuous monitoring for recurrent respiratory depression', 'Toxicology consultation', 'Addiction medicine referral', 'Consider long-acting naloxone (Narcan) prescription for discharge'],
      monitoring: ['Respiratory rate and depth every 5 minutes initially', 'SpO2 continuously', 'Level of consciousness', 'Blood pressure and heart rate', 'Airway patency', 'Monitor for recurrent respiratory depression (naloxone duration < many opioids)'],
      transportConsiderations: ['Transport even if awake after naloxone - observation required', 'Monitor closely for recurrent respiratory depression en route', 'Have naloxone ready for redosing', 'Be prepared for post-naloxone agitation', 'Position in recovery position', 'Do not release patient from scene']
    },
    studentChecklist: [
      { id: 'tox2-1', category: 'abcde', description: 'Recognize opioid toxidrome', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'], critical: true },
      { id: 'tox2-2', category: 'intervention', description: 'Airway support and BVM ventilation', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'], critical: true },
      { id: 'tox2-3', category: 'medication', description: 'Naloxone administration', points: 20, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'tox2-4', category: 'safety', description: 'Scene safety and PPE for body substances', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'tox2-5', category: 'abcde', description: 'Check blood glucose to rule out hypoglycemia', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'tox2-6', category: 'abcde', description: 'Assess respiratory rate and depth', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'tox2-7', category: 'abcde', description: 'Check for pinpoint pupils (miosis)', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'tox2-8', category: 'intervention', description: 'Titrate naloxone to respiratory effort', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'tox2-9', category: 'intervention', description: 'Position patient in recovery position', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'tox2-10', category: 'intervention', description: 'Monitor for recurrent respiratory depression', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'tox2-11', category: 'communication', description: 'Prepare for post-naloxone agitation', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'tox2-12', category: 'documentation', description: 'Document substance use findings and naloxone response', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Classic triad: respiratory depression + pinpoint pupils + decreased LOC',
      'Naloxone reverses respiratory depression but may precipitate withdrawal',
      'Always support airway and ventilation first',
      'Be prepared for violence/agitation after naloxone',
      'Naloxone duration of action (30-60 min) is shorter than many opioids - monitor for recurrent respiratory depression'
    ],
    commonPitfalls: [
      'Administering naloxone before ensuring adequate airway and ventilation - airway comes first',
      'Giving excessive naloxone causing severe withdrawal and agitation - titrate to respiratory effort',
      'Not monitoring for recurrent respiratory depression - naloxone wears off before many opioids',
      'Failing to recognize scene hazards (needles, other substances, bystanders)',
      'Not providing sufficient oxygenation before naloxone administration',
      'Delaying transport to observe naloxone response - transport should not be delayed',
      'Not considering co-ingestions (alcohol, benzodiazepines, other CNS depressants)',
      'Failing to check blood glucose - hypoglycemia can mimic opioid overdose',
      'Not protecting the patient from injury during post-naloxone agitation',
      'Forgetting that some opioids (e.g., buprenorphine, fentanyl analogues) require higher naloxone doses',
      'Inadequate documentation of substance use findings',
      'Not offering harm reduction resources or addiction services referral',
      'Failing to recognize that respiratory depression may be from non-opioid causes',
      'Not having restraints available for severe agitation after naloxone reversal'
    ],
    equipmentNeeded: [
      'Personal protective equipment (gloves, eye protection)',
      'Naloxone 0.4mg/ml or 2mg/0.1ml (IV/IM/IN formulations)',
      'Bag-valve-mask with oxygen reservoir',
      'Oropharyngeal airways (various sizes)',
      'Portable suction unit (Yankauer catheter)',
      'High-flow oxygen (15L/min)',
      'IV cannulation kit',
      'Normal saline 0.9% 500ml bags',
      'Blood glucose meter',
      'Pulse oximeter',
      'Cardiac monitor',
      'Blood pressure cuff',
      'Sharps container for needle disposal',
      'Restraints (soft) for agitation management',
      'Biohazard bags',
      'Wound care supplies (if track marks present)',
      'Patient warming blanket',
      'Naloxone take-home kits for patient discharge'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Opioid Overdose Management Protocol v3.8',
        'DCAS Naloxone Administration Guidelines',
        'WHO Guidelines for Community Management of Opioid Overdose',
        'SAMHSA Opioid Overdose Prevention Toolkit'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Emergency Department',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Emergency Care', 'Toxicology Services', 'Critical Care', 'Addiction Medicine Consultation'],
          contact: '04 219 3000',
          distance: '15 minutes from Downtown'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Emergency Department', 'Internal Medicine', 'Psychiatry', 'Toxicology'],
          contact: '04 222 1211',
          distance: '12 minutes from Downtown'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['Emergency Department', 'Internal Medicine', 'Psychiatry Services'],
          contact: '04 377 5500',
          distance: '8 minutes from Downtown'
        },
        {
          name: 'Latifa Hospital',
          location: 'Oud Metha, Dubai',
          capabilities: ['Emergency Department', 'Mental Health Services', 'Social Work Support'],
          contact: '04 219 3000',
          distance: '10 minutes from Downtown'
        }
      ],
      localConsiderations: [
        'Dubai Poison Control Centre: 800 424 (24/7) - call for substance identification and management guidance',
        'Drug-related incidents may involve legal implications - document objectively without judgment',
        'Prescription opioid misuse is increasing in UAE alongside traditional opioid use',
        'Fentanyl and synthetic opioids are emerging concern in region - may require higher naloxone doses',
        'Cultural sensitivity: avoid stigmatizing language; addiction is medical condition requiring treatment',
        'Language barriers common - security guards may speak limited Arabic/English',
        'Some patients may refuse transport after naloxone - capacity assessment required',
        'Harm reduction resources available through various community organizations in Dubai',
        'Employer-sponsored health insurance may not cover addiction treatment - social work referral helpful',
        'Police may attend scene for drug-related incidents - cooperate while maintaining patient confidentiality'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-opioid-toxidrome',
          type: 'image',
          title: 'Opioid Toxidrome Recognition',
          url: 'https://wikem.org/wiki/Opioid_toxicity',
          source: 'WikEM',
          caption: 'Clinical features of opioid overdose including respiratory depression and miosis',
          relevance: 'essential',
          tags: ['opioid', 'toxidrome', 'overdose', 'recognition']
        },
        {
          id: 'img-opioid-cdc',
          type: 'image',
          title: 'Opioid Overdose: Signs and Response',
          url: 'https://www.cdc.gov/overdose-prevention/about/index.html',
          source: 'CDC',
          caption: 'CDC guide to recognizing and responding to opioid overdose',
          relevance: 'essential',
          tags: ['opioid', 'overdose', 'CDC', 'recognition', 'response']
        },
        {
          id: 'img-track-marks',
          type: 'image',
          title: 'Intravenous Drug Use Track Marks',
          url: 'https://radiopaedia.org/cases/intravenous-drug-use-complications',
          source: 'Radiopaedia',
          caption: 'Physical signs of intravenous drug use on extremities',
          relevance: 'important',
          tags: ['IVDU', 'track-marks', 'drug-use', 'physical-signs']
        }
      ],
      videos: [
        {
          id: 'vid-opioid-overdose',
          type: 'video',
          title: 'Opioid Overdose Recognition and Naloxone Use',
          url: 'https://www.youtube.com/watch?v=8eUUf5ssH_4',
          source: 'Osmosis from Elsevier',
          duration: '12:30',
          relevance: 'essential',
          tags: ['opioid-overdose', 'naloxone', 'recognition', 'treatment']
        },
        {
          id: 'vid-naloxone-admin',
          type: 'video',
          title: 'Naloxone Administration Techniques',
          url: 'https://www.youtube.com/watch?v=cssRZEI9ujY',
          source: 'MedCram',
          duration: '10:15',
          relevance: 'essential',
          tags: ['naloxone', 'administration', 'technique', 'overdose']
        },
        {
          id: 'vid-airway-opioid',
          type: 'video',
          title: 'Airway Management in Opioid Overdose',
          url: 'https://www.youtube.com/watch?v=zWe_lPniEq4',
          source: 'Khan Academy',
          duration: '14:40',
          relevance: 'important',
          tags: ['airway', 'opioid-overdose', 'management', 'BVM']
        },
        {
          id: 'vid-opioid-icuadv',
          type: 'video',
          title: 'Opioid Overdose in the ICU: Advanced Management',
          url: 'https://www.youtube.com/watch?v=h-g6hw_YDzY',
          source: 'Ninja Nerd',
          duration: '19:30',
          relevance: 'supplementary',
          tags: ['opioid', 'overdose', 'ICU', 'advanced-management']
        }
      ],
      articles: [
        {
          id: 'art-naloxone-who',
          type: 'article',
          title: 'WHO Guidelines for Community Management of Opioid Overdose',
          url: 'https://www.who.int/publications/i/item/9789241548819',
          source: 'World Health Organization',
          caption: 'Comprehensive WHO guidelines on opioid overdose management',
          relevance: 'essential',
          tags: ['naloxone', 'WHO', 'guidelines', 'opioid-overdose']
        },
        {
          id: 'art-opioid-toxidrome',
          type: 'article',
          title: 'Opioid Toxidrome: Recognition and Management',
          url: 'https://emcrit.org/ibcc/opioid-overdose/',
          source: 'EMCrit',
          caption: 'Internet Book of Critical Care guide to opioid toxidrome management',
          relevance: 'essential',
          tags: ['opioid', 'toxidrome', 'recognition', 'management', 'critical-care']
        },
        {
          id: 'art-naloxone-dosing',
          type: 'article',
          title: 'Naloxone Dosing in Opioid Overdose',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4392193/',
          source: 'Annals of Emergency Medicine',
          caption: 'Evidence-based dosing strategies for naloxone in opioid overdose',
          relevance: 'important',
          tags: ['naloxone', 'dosing', 'opioid-overdose', 'evidence']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL PEDIATRIC CASES (Adding 7+ cases)
// ============================================================================

export const additionalPediatricCases: CaseScenario[] = [
  createCase({
    id: 'ped-002',
    title: 'Pediatric Febrile Seizure',
    category: 'pediatric',
    subcategory: 'febrile-seizure',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: '2-year-old having a seizure, fever',
      timeOfDay: 'evening',
      location: 'Villa, Arabian Ranches',
      callerInfo: 'Mother',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 2,
      gender: 'male',
      weight: 12,
      occupation: 'N/A',
      language: 'None'
    },
    sceneInfo: {
      description: 'Living room floor, child on rug',
      hazards: [],
      bystanders: 'Parents, sibling',
      environment: 'Home'
    },
    initialPresentation: {
      generalImpression: 'Toddler, generalized tonic-clonic movements',
      position: 'Supine on floor',
      appearance: 'Flushed, eyes rolled back, jerking limbs',
      consciousness: 'Unresponsive during seizure'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Gurgling', 'Possible tongue bite risk'],
        interventions: ['Recovery position', 'Suction']
      },
      breathing: {
        rate: 30,
        rhythm: 'Irregular during seizure',
        depth: 'Variable',
        spo2: 90,
        findings: ['Irregular breathing during seizure'],
        interventions: ['Oxygen']
      },
      circulation: {
        pulseRate: 150,
        pulseQuality: 'Regular',
        bp: { systolic: 90, diastolic: 55 },
        capillaryRefill: 2,
        skin: 'Warm, flushed',
        findings: ['Fever', 'Tachycardia'],
        interventions: []
      },
      disability: {
        avpu: 'P',
        gcs: { eye: 1, verbal: 1, motor: 4, total: 6 },
        pupils: 'Responsive but sluggish',
        bloodGlucose: 4.7,
        findings: ['Generalized tonic-clonic seizure', 'Glucose checked — normal, excludes hypoglycaemia as cause'],
        interventions: ['Buccal midazolam if prolonged >5 min', 'Measure BGL — mandatory in any paediatric seizure to exclude hypoglycaemic mimic']
      },
      exposure: {
        temperature: 39.5,
        findings: ['Fever 39.5°C', 'No rash'],
        interventions: ['Cooling measures']
      }
    },
    secondarySurvey: {
      head: ['Normal', 'No trauma'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Jerking movements', 'Normal'],
      posterior: ['Normal'],
      neurological: ['Seizing', 'Post-ictal confusion expected']
    },
    history: {
      medications: [{ name: 'Paracetamol', dose: '120mg', frequency: 'PRN', indication: 'Fever' }],
      allergies: ['None'],
      medicalConditions: ['Previously healthy', 'No prior seizures'],
      surgicalHistory: [],
      lastMeal: 'Dinner',
      eventsLeading: 'Fever since this morning, suddenly started jerking 2 minutes ago'
    },
    vitalSignsProgression: {
      initial: { bp: '90/55', pulse: 150, respiration: 30, spo2: 90, gcs: 6, temperature: 39.5, bloodGlucose: 4.7 }
    },
    expectedFindings: {
      keyObservations: ['Simple febrile seizure: age 6m-5y, fever, generalized, <15 min', 'First seizure'],
      redFlags: ['Complex febrile seizure >15 min', 'Focal features', 'Repeated in same illness'],
      differentialDiagnoses: ['Febrile seizure', 'Meningitis', 'Epilepsy', 'Electrolyte abnormality'],
      mostLikelyDiagnosis: 'Simple Febrile Seizure'
    },
    managementPathway: {
      immediate: [
        'Do NOT restrain limbs — protect from injury by removing hazards and padding surroundings',
        'Time the seizure — simple febrile seizure typically <5 minutes and self-limiting',
        'Position lateral (recovery) if possible — prevents aspiration',
        'Airway management — jaw thrust if airway obstructed; suction if secretions/vomit present',
        'Oxygen via face mask or blow-by if SpO2 <95% or cyanosis present',
        'If seizure >5 minutes — Midazolam 0.3mg/kg buccal (max 10mg) per APLS / NICE CG137 / BNF-C, OR 0.1mg/kg IV/IO if access available, OR 0.2mg/kg intranasal. (Older 0.5mg/kg upper-range exceeds current paediatric guideline ceiling — respiratory depression risk.)',
        'Temperature assessment — rectal or axillary; paracetamol suppository 15mg/kg if >38.5°C',
        'Blood glucose check — exclude hypoglycaemia as seizure cause',
        'Reassure parents — febrile seizures are terrifying to witness but usually benign'
      ],
      definitive: [
        'All first febrile seizures warrant ED assessment — to exclude meningitis and serious bacterial infection',
        'Latifa Hospital or Al Wasl Hospital paediatric ED, Dubai',
        'Lumbar puncture may be indicated if <18 months, meningism signs, or prolonged seizure',
        'Ongoing fever management — identify and treat underlying infection source',
        'Parental education on seizure first aid and fever management'
      ],
      monitoring: [
        'Continuous SpO2 post-seizure — post-ictal period may include apnoea',
        'Neurological status — child should recover gradually post-ictally over 10-20 minutes',
        'Temperature every 10 minutes during transport',
        'GCS/AVPU — document baseline and monitor recovery trajectory',
        'Watch for second seizure — risk in first 24 hours is 20-30%'
      ],
      transportConsiderations: [
        'Pre-alert paediatric ED — "2-year-old, simple febrile seizure, temperature 39.5°C, post-ictal now, weight ~12kg"',
        'Position lateral during transport — maintain airway protection',
        'Paediatric oxygen delivery equipment (age-appropriate mask size)',
        'Have midazolam drawn and labelled for weight-based dose in case of second seizure en route',
        'Keep environment calm — bright lights and noise can be stimulating for post-ictal child'
      ]
    },
    studentChecklist: [
      { id: 'ped2-1', category: 'abcde', description: 'Protect airway and place in recovery position', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'ped2-2', category: 'abcde', description: 'Time the seizure', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'ped2-3', category: 'intervention', description: 'Benzodiazepine if seizure >5 minutes', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'ped2-4', category: 'abcde', description: 'Check temperature and cooling measures', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'ped2-5', category: 'abcde', description: 'Rule out serious causes (meningitis, etc)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Simple febrile seizures are common (2-5% of children) and usually benign',
      'Most resolve spontaneously within 1-2 minutes',
      'Treat seizure >5 minutes with benzodiazepines',
      'Always consider meningitis if ill-appearing or no focus for fever'
    ],
    commonPitfalls: [
      'Attempting to restrain the child during seizure - can cause injury',
      'Placing objects in the child\'s mouth - aspiration risk',
      'Not timing the seizure accurately - status epilepticus defined as >5 minutes',
      'Administering benzodiazepines too early for brief seizures (<5 minutes)',
      'Failing to differentiate simple from complex febrile seizure',
      'Not preparing for airway compromise if seizure is prolonged',
      'Over-aggressive cooling causing shivering and temperature rise',
      'Missing red flags for meningitis (bulging fontanelle, neck stiffness, photophobia)',
      'Not obtaining weight-based dosing for medications',
      'Separating child from parents unnecessarily - increases anxiety',
      'Forgetting to check blood glucose - hypoglycemia can precipitate seizures',
      'Not documenting seizure characteristics (focal vs generalized, duration, post-ictal state)',
      'Failing to consider alternative causes (electrolyte imbalance, head trauma, toxin ingestion)',
      'Inadequate explanation to parents about benign nature of simple febrile seizures'
    ],
    equipmentNeeded: [
      'Pediatric stethoscope',
      'Pediatric blood pressure cuff (appropriate size)',
      'Pediatric pulse oximeter probe',
      'Digital thermometer (tympanic/temporal)',
      'Blood glucose meter with pediatric strips',
      'Pediatric oxygen masks and nasal cannulas',
      'Pediatric bag-valve-mask (appropriate size)',
      'Pediatric oropharyngeal airways (various sizes)',
      'Pediatric suction catheter (Yankauer and flexible catheters)',
      'Midazolam 5mg/ml (buccal/intranasal/IM for prolonged seizures)',
      'IV cannulation kit (pediatric sizes 24G-22G)',
      'Normal saline 0.9% 250ml bags',
      'Cooling supplies (tepid water, washcloths, fan)',
      'Paracetamol suspension (weight-based dosing)',
      'Emergency airway equipment (pediatric LMA, ET tubes 4.0-5.5mm)',
      'Cardiac monitor with pediatric electrodes',
      'Pediatric drug dosing reference (Broselow tape)',
      'Toys/distraction items',
      'Weight scale or length-based resuscitation tape'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Pediatric Seizure Protocol v3.5',
        'DCAS Febrile Seizure Management Guidelines',
        'NICE Guideline CG137: Epilepsies in Children',
        'AAP Clinical Practice Guideline: Febrile Seizures'
      ],
      receivingFacilities: [
        {
          name: 'Al Jalila Children\'s Specialty Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Level III Pediatric ICU', '24/7 Pediatric Neurology', 'Pediatric Emergency', 'EEG Services'],
          contact: '04 203 1000',
          distance: '25 minutes from Arabian Ranches'
        },
        {
          name: 'Latifa Hospital',
          location: 'Oud Metha, Dubai',
          capabilities: ['Pediatric Emergency', 'Pediatric Ward', 'Pediatric Specialists', 'Neonatal ICU'],
          contact: '04 219 3000',
          distance: '20 minutes from Arabian Ranches'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Pediatric Emergency', 'Pediatric ICU', 'Pediatric Specialists'],
          contact: '04 435 9999',
          distance: '25 minutes from Arabian Ranches'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['Pediatric Emergency', 'Pediatric Specialists', 'Child-friendly Facilities'],
          contact: '04 377 5500',
          distance: '20 minutes from Arabian Ranches'
        }
      ],
      localConsiderations: [
        'Al Jalila Children\'s Hospital is Dubai\'s dedicated pediatric facility - preferred for complex cases',
        'Latifa Hospital is the government maternity and pediatric hospital - excellent for pediatric emergencies',
        'Cultural considerations: families may be very anxious - provide calm reassurance and clear explanations',
        'Many expatriate families from South Asia/Europe - vaccination schedules may vary',
        'Emirati families often prefer same-gender providers when possible',
        'During Ramadan, children are exempt from fasting',
        'Nannies or housekeepers may be primary caregivers - ensure clear communication',
        'Document vaccination history carefully - Hib and pneumococcal vaccines prevent common causes of meningitis',
        'Language barriers may exist - use simple terms and translation if needed',
        'Arabian Ranches is family-oriented area - likely both parents present'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-febrile-seizure-types',
          type: 'image',
          title: 'Febrile Seizure Classification',
          url: 'https://radiopaedia.org/cases/febrile-seizure',
          source: 'Radiopaedia',
          caption: 'Classification and clinical features of febrile seizures',
          relevance: 'essential',
          tags: ['febrile-seizure', 'pediatric', 'classification', 'types']
        },
        {
          id: 'img-meningeal-signs-peds',
          type: 'image',
          title: 'Meningeal Signs in Pediatric Patients',
          url: 'https://dontforgetthebubbles.com/meningitis-in-children/',
          source: "Don't Forget the Bubbles",
          caption: 'Clinical signs of meningitis in children',
          relevance: 'essential',
          tags: ['meningitis', 'pediatric', 'clinical-signs', 'red-flags']
        },
        {
          id: 'img-febrile-seizure-nice',
          type: 'image',
          title: 'NICE: Febrile Seizures in Children',
          url: 'https://www.nice.org.uk/guidance/cg150',
          source: 'NICE Guidelines',
          caption: 'NICE guideline on assessment and management of febrile seizures',
          relevance: 'important',
          tags: ['febrile-seizure', 'NICE', 'pediatric', 'guidelines']
        }
      ],
      videos: [
        {
          id: 'vid-febrile-seizure-mngt',
          type: 'video',
          title: 'Febrile Seizure Management',
          url: 'https://www.youtube.com/watch?v=LDvPlEi2DwE',
          source: 'Osmosis from Elsevier',
          duration: '14:30',
          relevance: 'essential',
          tags: ['febrile-seizure', 'pediatric', 'management']
        },
        {
          id: 'vid-pediatric-seizure-first-aid',
          type: 'video',
          title: 'First Aid for Pediatric Seizures',
          url: 'https://www.youtube.com/watch?v=woTdJmpY0F8',
          source: 'MedCram',
          duration: '8:45',
          relevance: 'essential',
          tags: ['pediatric', 'seizure', 'first-aid', 'febrile']
        },
        {
          id: 'vid-meningitis-recognition',
          type: 'video',
          title: 'Recognizing Meningitis in Children',
          url: 'https://www.youtube.com/watch?v=DuIX25F1VF8',
          source: 'Ninja Nerd',
          duration: '12:20',
          relevance: 'essential',
          tags: ['meningitis', 'children', 'recognition', 'red-flags']
        }
      ],
      articles: [
        {
          id: 'art-febrile-seizure-review',
          type: 'article',
          title: 'Febrile Seizures: A Review',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4662123/',
          source: 'American Family Physician',
          caption: 'Comprehensive review of febrile seizure diagnosis and management',
          relevance: 'essential',
          tags: ['febrile-seizure', 'review', 'pediatric', 'management']
        },
        {
          id: 'art-meningitis-pediatric',
          type: 'article',
          title: 'Pediatric Meningitis: Early Recognition and Management',
          url: 'https://www.rcpch.ac.uk/resources/meningitis-clinical-guidelines',
          source: 'Royal College of Paediatrics and Child Health',
          caption: 'RCPCH clinical guidelines for pediatric meningitis recognition and management',
          relevance: 'essential',
          tags: ['meningitis', 'pediatric', 'RCPCH', 'recognition', 'management']
        },
        {
          id: 'art-benzodiazepine-peds',
          type: 'article',
          title: 'Benzodiazepine Use in Pediatric Seizures',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4392193/',
          source: 'Pediatric Emergency Care',
          caption: 'Evidence-based dosing and administration of benzodiazepines in children',
          relevance: 'important',
          tags: ['benzodiazepine', 'pediatric', 'seizure', 'dosing']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL ENVIRONMENTAL CASES (Adding 7+ cases)
// ============================================================================

export const additionalEnvironmentalCases: CaseScenario[] = [
  createCase({
    id: 'env-002',
    title: 'Heat Stroke with Altered Consciousness',
    category: 'environmental',
    subcategory: 'heat-stroke',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Construction worker collapsed at site, very hot, confused',
      timeOfDay: 'afternoon',
      location: 'Construction site, Jebel Ali',
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
      description: 'Construction site, patient in shade under tarp',
      hazards: ['Heavy machinery', 'Hot environment'],
      bystanders: 'Coworkers',
      environment: 'Outdoor, temperature 45°C, high humidity',
      environmentVariant: 'industrial',
      sceneImagePath: '/scene-assets/env-002-heat-stroke-jebel-ali.png',
      sceneImageCaption: 'Heat stroke — construction site, Jebel Ali'
    },
    initialPresentation: {
      generalImpression: 'Young male, hot to touch, agitated then unresponsive',
      position: 'Semi-conscious, restless',
      appearance: 'Flushed, dry hot skin',
      consciousness: 'Confused, deteriorating'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent but at risk'],
        interventions: []
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 95,
        findings: ['Tachypneic from metabolic acidosis'],
        interventions: ['Oxygen'],
        auscultation: ['Clear bilaterally']
      },
      circulation: {
        pulseRate: 140,
        pulseQuality: 'Bounding',
        bp: { systolic: 80, diastolic: 50 },
        capillaryRefill: 1,
        skin: 'Hot, dry, flushed',
        findings: ['Hypotensive', 'Bounding pulse', 'Vasodilation'],
        interventions: ['Aggressive cooling', 'IV fluids']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 3, verbal: 4, motor: 5, total: 12 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Confused', 'Agitated', 'Possible seizures'],
        interventions: ['Rapid cooling', 'Benzodiazepines if seizing']
      },
      exposure: {
        temperature: 41.5,
        findings: ['Core temperature 41.5°C', 'No sweating', 'Hot skin'],
        interventions: ['Aggressive cooling - ice packs, cold IV fluids']
      }
    },
    secondarySurvey: {
      head: ['Confused', 'Hot'],
      neck: ['Normal'],
      chest: ['Tachypneic'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Hot', 'Flushed', 'Muscle rigidity'],
      posterior: ['Normal'],
      neurological: ['Confused', 'Ataxic', 'Possible rhabdomyolysis']
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: ['Previously healthy'],
      surgicalHistory: [],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Working outside all day, stopped sweating, became confused and collapsed'
    },
    vitalSignsProgression: {
      initial: { bp: '80/50', pulse: 140, respiration: 28, spo2: 95, gcs: 12, temperature: 41.5, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Heat stroke: temp >40°C + altered consciousness', 'Dry hot skin (anhidrosis)', 'Hypotension'],
      redFlags: ['Multi-organ failure', 'Coagulopathy (DIC)', 'Death if not cooled rapidly'],
      differentialDiagnoses: ['Heat stroke', 'Heat exhaustion', 'Meningitis', 'Sepsis', 'Serotonin syndrome'],
      mostLikelyDiagnosis: 'Classic Heat Stroke'
    },
    managementPathway: {
      immediate: ['Immediate aggressive cooling - start on scene', 'Remove clothing completely', 'Ice packs to neck, axilla, groin (major vascular areas)', 'Evaporative cooling with mist and fan', 'Cold IV fluids (0.9% NaCl)', 'High-flow oxygen', 'Check blood glucose', 'Monitor airway and be prepared to intubate if GCS drops'],
      definitive: ['ICU admission with continuous cooling', 'Target core temperature 38.5°C — stop active cooling at this point to prevent overshoot and shivering-induced heat production (WMS / Resus Council)', 'Continuous monitoring for multi-organ failure', 'Serial labs: CK, coagulation profile, liver function', 'Treatment of rhabdomyolysis and DIC if present', 'Continuous renal replacement therapy if needed'],
      monitoring: ['Core temperature continuously (rectal/esophageal)', 'Heart rate and rhythm', 'Blood pressure', 'Urine output (catheterize)', 'Neurological status (GCS)', 'Electrolytes (especially potassium)', 'Coagulation profile (DIC risk)', 'Muscle enzymes (CK for rhabdomyolysis)'],
      transportConsiderations: ['Continue aggressive cooling during transport', 'Do not delay transport for full cooling - cool en route', 'Pre-alert hospital for cooling protocol', 'Air-conditioned ambulance essential', 'Monitor for seizures and cardiac arrhythmias', 'Rapid transport to ICU-capable facility']
    },
    studentChecklist: [
      { id: 'env2-1', category: 'abcde', description: 'Recognize heat stroke (temp >40°C + altered LOC)', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'env2-2', category: 'intervention', description: 'Immediate aggressive cooling', points: 20, yearLevel: ['3rd-year', '4th-year'], complexity: ['expert'], critical: true },
      { id: 'env2-3', category: 'intervention', description: 'Cold IV fluids', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'env2-4', category: 'abcde', description: 'Check for complications (rhabdomyolysis, DIC)', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'env2-5', category: 'abcde', description: 'Obtain accurate core temperature reading', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'env2-6', category: 'abcde', description: 'Assess for anhidrosis (dry hot skin)', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'env2-7', category: 'intervention', description: 'Remove clothing and apply ice packs to neck, axilla, groin', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'env2-8', category: 'intervention', description: 'Evaporative cooling with mist and fan', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'env2-9', category: 'abcde', description: 'Monitor for seizures and administer benzodiazepines if needed', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'env2-10', category: 'intervention', description: 'Aggressive IV fluid resuscitation', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'env2-11', category: 'communication', description: 'Pre-alert hospital for cooling protocol activation', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'env2-12', category: 'documentation', description: 'Document temperature and cooling interventions', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Heat stroke is a medical emergency - mortality increases with time to cooling',
      'Classic heat stroke: dry hot skin (anhidrosis)',
      'Exertional heat stroke: sweaty (common in athletes/military)',
      'Goal: cool to core 38.5°C within 30 minutes and STOP (ice-water immersion most effective if available; evaporative + convective cooling otherwise). Overcooling risks shivering-driven rebound hyperthermia.'
    ],
    commonPitfalls: [
      'Confusing heat stroke with heat exhaustion — heat stroke requires immediate aggressive cooling; the key differentiator is altered mental status and core temperature >40°C',
      'Not starting cooling on scene — every minute of delay worsens organ damage; begin cooling before transport',
      'Over-cooling below 38°C — causes shivering which paradoxically increases heat production; stop active cooling once temperature reaches 39°C',
      'Failing to check blood glucose — hypoglycaemia co-exists in many heat stroke patients and worsens neurological outcome',
      'Not anticipating seizures — have benzodiazepines drawn up and ready; heat stroke lowers seizure threshold significantly',
      'Missing early rhabdomyolysis signs — dark urine, muscle rigidity, and extreme CK elevation indicate rhabdo requiring aggressive IV fluid resuscitation'
    ],
    visualResources: {
      images: [
        {
          id: 'img-heatstroke-wms',
          type: 'image',
          title: 'Heat Stroke Recognition and Cooling Methods',
          url: 'https://wms.org/magazine/1264/Heat-Stroke',
          source: 'Wilderness Medical Society',
          caption: 'WMS clinical practice guidelines for heat-related illness',
          relevance: 'essential',
          tags: ['heat-stroke', 'cooling', 'recognition', 'WMS']
        },
        {
          id: 'img-heatstroke-wikem',
          type: 'image',
          title: 'Heat Stroke: Diagnosis and Treatment Algorithm',
          url: 'https://wikem.org/wiki/Heat_stroke',
          source: 'WikEM',
          caption: 'Emergency management algorithm for heat stroke',
          relevance: 'essential',
          tags: ['heat-stroke', 'algorithm', 'diagnosis', 'treatment']
        }
      ],
      articles: [
        {
          id: 'art-heatstroke-wikem',
          type: 'article',
          title: 'Heat Stroke Emergency Management',
          url: 'https://wikem.org/wiki/Heat_stroke',
          source: 'WikEM',
          caption: 'Rapid cooling techniques and emergency management of heat stroke',
          relevance: 'essential',
          tags: ['heat-stroke', 'hyperthermia', 'cooling', 'emergency']
        },
        {
          id: 'art-heatstroke-statpearls',
          type: 'article',
          title: 'Heat Stroke: Pathophysiology and Treatment',
          url: 'https://www.statpearls.com/ArticleLibrary/viewarticle/22580',
          source: 'StatPearls',
          caption: 'Comprehensive review of heat stroke pathophysiology and evidence-based management',
          relevance: 'essential',
          tags: ['heat-stroke', 'pathophysiology', 'treatment', 'review']
        },
        {
          id: 'art-heatstroke-litfl',
          type: 'article',
          title: 'Heat Stroke - LITFL CCC',
          url: 'https://litfl.com/heat-stroke/',
          source: 'Life in the Fast Lane',
          caption: 'Critical care compendium entry on heat stroke',
          relevance: 'important',
          tags: ['heat-stroke', 'hyperthermia', 'cooling', 'emergency']
        }
      ],
      videos: [
        {
          id: 'vid-heatstroke',
          type: 'video',
          title: 'Heat Stroke: Rapid Cooling Protocol',
          url: 'https://www.youtube.com/watch?v=jvGC_dQJUtE',
          source: 'MedCram',
          caption: 'Evidence-based cooling techniques for heat stroke',
          duration: '12:45',
          relevance: 'essential',
          tags: ['heat-stroke', 'cooling', 'protocol', 'EMS']
        },
        {
          id: 'vid-heatstroke-ninja',
          type: 'video',
          title: 'Heat Stroke vs Heat Exhaustion: Pathophysiology',
          url: 'https://www.youtube.com/watch?v=R6VdoV8dZRc',
          source: 'Osmosis from Elsevier',
          caption: 'Detailed pathophysiology of heat-related illness',
          duration: '28:30',
          relevance: 'important',
          tags: ['heat-stroke', 'heat-exhaustion', 'pathophysiology']
        },
        {
          id: 'vid-heatstroke-osmosis',
          type: 'video',
          title: 'Hyperthermia and Heat Stroke',
          url: 'https://www.youtube.com/watch?v=oynSAL8v8aY',
          source: 'Ninja Nerd',
          caption: 'Animated overview of hyperthermia and heat stroke',
          duration: '8:15',
          relevance: 'important',
          tags: ['hyperthermia', 'heat-stroke', 'overview']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL PSYCHIATRIC CASES (Adding 6+ cases)
// ============================================================================

export const additionalPsychiatricCases: CaseScenario[] = [
  createCase({
    id: 'psych-003',
    title: 'Acute Psychotic Episode',
    category: 'psychiatric',
    subcategory: 'psychosis',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Man acting strangely, hearing voices, family concerned',
      timeOfDay: 'evening',
      location: 'Apartment, Dubai Marina',
      callerInfo: 'Brother',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 26,
      gender: 'male',
      weight: 75,
      occupation: 'IT professional',
      language: 'English'
    },
    sceneInfo: {
      description: 'Apartment living room, patient pacing',
      hazards: ['Agitated patient', 'Potential weapons'],
      bystanders: 'Family members',
      environment: 'Home, well-lit'
    },
    initialPresentation: {
      generalImpression: 'Young male, agitated, responding to internal stimuli',
      position: 'Pacing',
      appearance: 'Disheveled, suspicious gaze',
      consciousness: 'Alert but disorganized'
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
        findings: ['Mildly tachypneic'],
        interventions: [],
        auscultation: ['Clear bilaterally']
      },
      circulation: {
        pulseRate: 100,
        pulseQuality: 'Regular',
        bp: { systolic: 140, diastolic: 90 },
        capillaryRefill: 2,
        skin: 'Warm, sweaty',
        findings: ['Mildly hypertensive', 'Tachycardic from agitation'],
        interventions: []
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Responding to auditory hallucinations', 'Paranoid', 'Disorganized speech'],
        interventions: ['De-escalation', 'Chemical restraint if needed']
      },
      exposure: {
        temperature: 36.8,
        findings: ['No injuries', 'Medical alert bracelet (schizophrenia)'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Disorganized thought'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Thought disorder', 'No focal deficits']
    },
    history: {
      medications: [
        { name: 'Risperidone', dose: '4mg', frequency: 'Daily', indication: 'Schizophrenia' }
      ],
      allergies: ['None'],
      medicalConditions: ['Schizophrenia', 'Stopped medication 1 week ago'],
      surgicalHistory: [],
      lastMeal: 'Today',
      eventsLeading: 'Stopped taking medications, behavior became increasingly bizarre over past week'
    },
    vitalSignsProgression: {
      initial: { bp: '140/90', pulse: 100, respiration: 20, spo2: 98, gcs: 14, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Acute psychosis', 'Medication non-compliance', 'Paranoia', 'Auditory hallucinations'],
      redFlags: ['Violence risk', 'Self-harm ideation', 'Medical cause of psychosis'],
      differentialDiagnoses: ['Schizophrenia relapse', 'Drug-induced psychosis', 'Bipolar mania', 'Medical cause (thyroid, electrolytes)'],
      mostLikelyDiagnosis: 'Acute Psychotic Episode - Schizophrenia Relapse'
    },
    managementPathway: {
      immediate: [
        'Scene safety first — assess for weapons, violence risk, adequate exit routes; request police if threat present',
        'De-escalation approach — calm, non-threatening tone; introduce yourself, maintain distance, avoid direct eye contact',
        'Rule out medical causes IMMEDIATELY — blood glucose, SpO2, temperature, vitals (hypoglycaemia, hypoxia, sepsis)',
        'Minimise sensory stimulation — reduce noise, bystanders, bright lights; speak one at a time',
        'Do NOT challenge or argue with delusions — acknowledge distress without reinforcing or denying content',
        'Assess suicide and violence risk — direct questioning is safe and necessary',
        'Contact family or carer for collateral history — medication compliance, recent drug use, baseline behaviour'
      ],
      definitive: [
        'Chemical sedation if verbal de-escalation fails and patient/crew safety is threatened',
        'Midazolam 2.5-5mg IM (preferred in prehospital) — for acute behavioural emergency',
        'Or Haloperidol 5mg IM + Promethazine 25mg IM — WHO/DCAS approved combination',
        'Physical restraint only as last resort with multiple trained personnel — document clearly',
        'Transport to Al Amal Hospital Dubai (psychiatric facility) or ED with psychiatric assessment capacity',
        'Refer to mental health crisis team on arrival for assessment under UAE Mental Health Law'
      ],
      monitoring: [
        'Continuous vital signs monitoring — especially if chemical sedation given',
        'SpO2 and airway patency if sedated — benzodiazepines cause respiratory depression',
        'GCS monitoring post-sedation',
        'Blood glucose rechecked if any clinical change',
        'Document behaviour and all interventions for handover'
      ],
      transportConsiderations: [
        'Ensure secure transport — patient should not have access to equipment or door handles',
        'Position to maximise safety for patient and crew — avoid prone restraint position',
        'Pre-alert Al Amal Hospital or ED psychiatric unit with behaviour description and medications given',
        'Do not transport alone with sedated patient — crew safety requires two personnel minimum',
        'Document all use of force and chemical restraint on patient care record'
      ]
    },
    studentChecklist: [
      { id: 'psych3-1', category: 'safety', description: 'Scene safety and de-escalation techniques', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'psych3-2', category: 'abcde', description: 'Rule out medical causes of psychosis (glucose, vitals)', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'psych3-3', category: 'abcde', description: 'Assess suicide and violence risk', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'psych3-4', category: 'intervention', description: 'Chemical restraint only if necessary', points: 5, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'psych3-5', category: 'communication', description: 'Calm, non-confrontational communication', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Always rule out medical causes of altered mental status (DELIRIUM)',
      'De-escalation is first-line - avoid physical restraint if possible',
      'Chemical restraint: benzodiazepines or antipsychotics if needed',
      'Involve mental health crisis team early'
    ],
    commonPitfalls: [
      'Entering the scene without a safety assessment — agitated psychotic patients may be unpredictable; always assess exit routes and ensure police backup if violence risk is high',
      'Arguing with or challenging the patient\'s delusions — this escalates agitation; acknowledge their distress without reinforcing or contradicting the delusion',
      'Missing a medical cause of psychosis — hypoglycaemia, hypoxia, sepsis, or head injury can present identically; always check BGL, oxygen saturations, and vitals',
      'Using physical restraint as a first response — restraint should only follow failed verbal de-escalation and requires multiple trained personnel; improper restraint increases morbidity',
      'Not gathering collateral history from family — family members can provide crucial information about baseline behaviour, medication compliance, and recent drug or alcohol use'
    ],
    visualResources: {
      images: [
        {
          id: 'img-psychosis-wikem',
          type: 'image',
          title: 'Acute Psychosis: Emergency Assessment',
          url: 'https://wikem.org/wiki/Psychosis',
          source: 'WikEM',
          caption: 'Emergency medicine approach to acute psychosis',
          relevance: 'essential',
          tags: ['psychosis', 'emergency', 'assessment', 'psychiatric']
        },
        {
          id: 'img-delirium-nice',
          type: 'image',
          title: 'NICE Guideline: Delirium Assessment',
          url: 'https://www.nice.org.uk/guidance/cg103',
          source: 'NICE Guidelines',
          caption: 'NICE guideline on recognition and management of delirium',
          relevance: 'important',
          tags: ['delirium', 'assessment', 'NICE', 'guidelines']
        }
      ],
      articles: [
        {
          id: 'art-delirium',
          type: 'article',
          title: 'Delirium vs Dementia vs Psychosis',
          url: 'https://bestpractice.bmj.com/topics/en-gb/241',
          source: 'BMJ Best Practice',
          caption: 'Differentiating causes of altered mental status',
          relevance: 'essential',
          tags: ['delirium', 'psychosis', 'altered-mental-status', 'assessment']
        },
        {
          id: 'art-psychosis-statpearls',
          type: 'article',
          title: 'Acute Psychosis: Evaluation and Management',
          url: 'https://www.statpearls.com/ArticleLibrary/viewarticle/27851',
          source: 'StatPearls',
          caption: 'Evidence-based approach to acute psychosis evaluation and treatment',
          relevance: 'essential',
          tags: ['psychosis', 'evaluation', 'management', 'StatPearls']
        }
      ],
      videos: [
        {
          id: 'vid-deescalation',
          type: 'video',
          title: 'Verbal De-escalation Techniques',
          url: 'https://www.youtube.com/watch?v=sKxBQNABVws',
          source: 'Ninja Nerd',
          caption: 'Evidence-based de-escalation for agitated patients',
          duration: '13:20',
          relevance: 'essential',
          tags: ['de-escalation', 'psychiatric', 'agitation', 'communication']
        },
        {
          id: 'vid-psychosis-osmosis',
          type: 'video',
          title: 'Schizophrenia and Psychosis: Pathophysiology',
          url: 'https://www.youtube.com/watch?v=bgczmh4Rc6o',
          source: 'Osmosis from Elsevier',
          caption: 'Understanding psychosis and schizophrenia pathophysiology',
          duration: '10:25',
          relevance: 'important',
          tags: ['psychosis', 'schizophrenia', 'pathophysiology']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL OBSTETRIC CASES (Adding 7+ cases)
// ============================================================================

export const additionalObstetricCases: CaseScenario[] = [
  createCase({
    id: 'obs-002',
    title: 'Eclamptic Seizure in Pregnancy',
    category: 'obstetric',
    subcategory: 'eclampsia',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Pregnant woman having a seizure, 34 weeks pregnant',
      timeOfDay: 'morning',
      location: 'Villa, Mirdif',
      callerInfo: 'Husband',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 28,
      gender: 'female',
      weight: 85,
      occupation: 'Teacher',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Living room, patient on floor',
      hazards: ['Pregnancy', 'Seizure activity'],
      bystanders: 'Husband',
      environment: 'Home'
    },
    initialPresentation: {
      generalImpression: 'Pregnant female, 34 weeks gestation, post-ictal',
      position: 'Recovery position',
      appearance: 'Drowsy, swollen face and hands',
      consciousness: 'Post-ictal'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent', 'No tongue bite visible'],
        interventions: ['Recovery position']
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 94,
        findings: ['Post-ictal breathing'],
        interventions: ['Oxygen'],
        auscultation: ['Clear bilaterally', 'Good air entry']
      },
      circulation: {
        pulseRate: 100,
        pulseQuality: 'Regular',
        bp: { systolic: 180, diastolic: 110 },
        capillaryRefill: 2,
        skin: 'Pale, edematous',
        findings: ['Severe hypertension', 'Edema'],
        interventions: ['IV access', 'Magnesium sulfate']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Post-ictal — responds to voice (AVPU = V)', 'Hyperreflexia', 'Clonus present'],
        interventions: ['Magnesium sulfate', 'Protect from injury']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Edema of hands and face', '34 weeks pregnant'],
        interventions: ['Left lateral tilt']
      }
    },
    secondarySurvey: {
      head: ['Alerting post-ictally'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Gravid uterus 34 weeks', 'Tender'],
      pelvis: ['Pregnant'],
      extremities: ['Edema', 'Hyperreflexia', 'Clonus +++'],
      posterior: ['Normal'],
      neurological: ['Post-ictal', 'Hyperreflexia']
    },
    history: {
      medications: [{ name: 'Prenatal vitamins', dose: '1 tablet', frequency: 'Daily', indication: 'Pregnancy' }],
      allergies: ['None'],
      medicalConditions: ['Pregnancy 34 weeks', 'No prenatal care recently'],
      surgicalHistory: [],
      lastMeal: 'Breakfast',
      eventsLeading: 'Headache and vision changes for 2 days, had seizure 5 minutes ago'
    },
    vitalSignsProgression: {
      initial: { bp: '180/110', pulse: 100, respiration: 18, spo2: 94, gcs: 14, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Eclampsia: seizures in pregnancy + hypertension + proteinuria', 'Hyperreflexia and clonus'],
      redFlags: ['Recurrent seizures', 'Stroke', 'HELLP syndrome', 'Maternal death'],
      differentialDiagnoses: ['Eclampsia', 'Epilepsy', 'Intracranial hemorrhage', 'Meningitis'],
      mostLikelyDiagnosis: 'Eclampsia'
    },
    managementPathway: {
      immediate: ['Left lateral tilt position (relieves aortocaval compression)', 'Airway protection - suction, supplemental O2', 'Magnesium sulfate 4g IV loading dose over 5-10 min', 'Magnesium sulfate 1g/hr IV continuous infusion', 'Control severe hypertension: Labetalol 20mg IV or Hydralazine 5-10mg IV', 'IV access x2 large bore', 'Prepare for recurrent seizures (have benzodiazepines available)'],
      definitive: ['Urgent delivery is definitive treatment - usually within 24 hours', 'C-section if fetal distress or failed progress', 'ICU monitoring post-delivery', 'Magnesium sulfate continued 24 hours postpartum'],
      monitoring: ['Continuous maternal vital signs (BP every 15 min)', 'Deep tendon reflexes (patellar) for magnesium toxicity', 'Respiratory rate (toxicity if <12/min)', 'Urine output (target >100ml/4hr)', 'Fetal heart rate monitoring if possible', 'Oxygen saturation', 'Watch for signs of magnesium toxicity (loss of reflexes, respiratory depression)'],
      transportConsiderations: ['Left lateral tilt position throughout transport', 'Continue magnesium sulfate infusion en route', 'Airway equipment readily available', 'Monitor for recurrent seizures', 'Rapid transport to facility with obstetric and NICU capabilities', 'Pre-alert receiving hospital for emergency team preparation', 'Transport to facility with Level III NICU']
    },
    studentChecklist: [
      { id: 'obs2-1', category: 'abcde', description: 'Left lateral tilt to prevent aortocaval compression', points: 10, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'obs2-2', category: 'intervention', description: 'Magnesium sulphate 4g IV in 100mL over 5-10 min LOADING + 1g/hr maintenance infusion — first-line TREATMENT for active eclamptic seizure (NOT prophylaxis; patient has seized). Have calcium gluconate 10mL 10% IV drawn up as magnesium-toxicity antidote (respiratory depression if mg toxic — check patellar reflex).', points: 20, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'obs2-3', category: 'intervention', description: 'Control severe hypertension (labetalol/hydralazine)', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'obs2-4', category: 'abcde', description: 'Monitor fetus (heart rate if possible)', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'obs2-5', category: 'intervention', description: 'Prepare for urgent delivery', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] }
    ],
    teachingPoints: [
      'Eclampsia = seizures in pregnancy with preeclampsia features',
'Magnesium sulphate is first-line TREATMENT for active eclamptic seizure AND prevention of recurrence (Magpie Trial 2002 established superiority over diazepam and phenytoin). Loading 4g IV in 100mL over 5-10 min, then 1g/hr maintenance.',
      'Left lateral tilt essential in pregnancy >20 weeks',
      'Urgent delivery is definitive treatment'
    ],
    commonPitfalls: [
      'Delaying magnesium sulphate administration - give immediately to prevent recurrent seizures',
      'Giving diazepam or midazolam first-line for eclampsia — magnesium is definitive (Magpie Trial 2002). Benzodiazepines only for refractory seizures AFTER magnesium has been loaded. NICE NG133, RCOG.',
      'Placing patient supine - causes aortocaval compression and reduces uteroplacental perfusion',
      'Not recognizing magnesium sulfate toxicity (loss of reflexes, respiratory depression, cardiac arrest)',
      'Failing to control severe hypertension - increases risk of stroke and cerebral hemorrhage',
      'Not monitoring fetal heart rate - fetal distress common in eclampsia',
      'Inadequate airway management - pregnant patients have increased aspiration risk',
      'Not preparing for emergency delivery - eclampsia is an obstetric emergency requiring delivery',
      'Forgetting to check magnesium levels if recurrent seizures or signs of toxicity',
      'Delaying transport to facility with obstetric and NICU capabilities',
      'Not documenting blood pressure trends and proteinuria history',
      'Missing HELLP syndrome (Hemolysis, Elevated Liver enzymes, Low Platelets)',
      'Not recognizing that eclampsia can occur up to 4 weeks postpartum',
      'Inadequate IV access for magnesium administration and fluid management',
      'Not asking about headache, visual changes, or epigastric pain (preeclampsia warning signs)'
    ],
    equipmentNeeded: [
      'Magnesium sulfate 50% solution (4g IV loading dose, then 1g/hr infusion)',
      'Large-bore IV cannula (14-16G) x2',
      '0.9% Normal Saline or Lactated Ringers 1000ml bags',
      'IV infusion pumps',
      'Antihypertensive medications (Labetalol 20mg IV or Hydralazine 5-10mg IV)',
      'Calcium gluconate 10% (antidote for magnesium toxicity)',
      'High-flow oxygen (15L/min) with non-rebreather mask',
      'Cardiac monitor with blood pressure monitoring',
      'Pulse oximeter',
      'Fetal Doppler for fetal heart rate monitoring',
      'Airway management equipment (BVM, LMA, ETT, suction)',
      'Blood glucose meter',
      'Urinary catheter and collection bag (monitor urine output - magnesium excreted renally)',
      'Patella hammer (check deep tendon reflexes for magnesium toxicity)',
      'Emergency delivery kit (forceps, scissors, cord clamps, suction)',
      'Neonatal resuscitation equipment',
      'Blood pressure cuff (appropriate size for pregnancy)',
      'Transport stretcher with left lateral tilt capability'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Obstetric Emergency Protocol v4.0',
        'DCAS Eclampsia Management Guidelines',
        'RCOG Green-top Guideline No. 10(A): Management of Severe Pre-eclampsia/Eclampsia',
        'ACOG Practice Bulletin: Gestational Hypertension and Preeclampsia',
        'WHO Recommendations for Prevention and Treatment of Pre-eclampsia and Eclampsia'
      ],
      receivingFacilities: [
        {
          name: 'Latifa Hospital',
          location: 'Oud Metha, Dubai',
          capabilities: ['Level III NICU', '24/7 Obstetric Surgery', 'Maternal-Fetal Medicine', 'Neonatal Resuscitation', 'High-Risk Pregnancy Unit'],
          contact: '04 219 3000',
          distance: '20 minutes from Mirdif'
        },
        {
          name: 'Al Jalila Children\'s Specialty Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Level III NICU', 'Pediatric Emergency', 'Neonatal Intensive Care', 'Maternal Transport Services'],
          contact: '04 203 1000',
          distance: '25 minutes from Mirdif'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['NICU Level III', '24/7 Obstetrics', 'Emergency C-section', 'Maternal ICU'],
          contact: '04 435 9999',
          distance: '25 minutes from Mirdif'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['Level III NICU', 'Obstetric Emergency Services', 'Maternal-Fetal Medicine'],
          contact: '04 377 5500',
          distance: '20 minutes from Mirdif'
        }
      ],
      localConsiderations: [
        'Cultural sensitivity paramount: Emirati and conservative families strongly prefer female healthcare providers',
        'Latifa Hospital is the primary government maternity hospital with highest-level NICU - preferred for eclampsia',
        'Magnesium sulfate should be available in all ambulances per DCAS protocol for eclampsia cases',
        'During Ramadan, pregnant women may delay seeking care - emphasize life-threatening nature of condition',
        'Family decision-making: husband or senior female relative makes medical decisions - communicate with them',
        'Privacy crucial - ensure curtains/doors closed during assessment',
        'Document gravida, parity, EDC, previous BP readings, and any antenatal care history',
        'Many Emirati women have strong preferences for Latifa Hospital - accommodate if clinically appropriate',
        'Prepare for potential emergency delivery en route - have delivery kit ready',
        'Monitor for magnesium toxicity: loss of patellar reflexes, respiratory rate <12/min, urine output <100ml/4hr'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-eclampsia-features',
          type: 'image',
          title: 'Eclampsia Clinical Features',
          url: 'https://www.rcog.org.uk/guidance/browse-all-guidance/green-top-guidelines/management-of-severe-pre-eclampsia-eclampsia-green-top-guideline-no-10a/',
          source: 'Royal College of Obstetricians and Gynaecologists',
          caption: 'RCOG guideline on eclampsia recognition and clinical features',
          relevance: 'essential',
          tags: ['eclampsia', 'preeclampsia', 'pregnancy', 'RCOG', 'clinical-features']
        },
        {
          id: 'img-left-lateral-tilt',
          type: 'image',
          title: 'Left Lateral Tilt in Pregnancy',
          url: 'https://www.who.int/publications/i/item/9789241548502',
          source: 'World Health Organization',
          caption: 'WHO recommendations on positioning and aortocaval compression prevention',
          relevance: 'essential',
          tags: ['pregnancy', 'left-lateral-tilt', 'positioning', 'WHO']
        },
        {
          id: 'img-preeclampsia-nice',
          type: 'image',
          title: 'NICE: Hypertension in Pregnancy',
          url: 'https://www.nice.org.uk/guidance/ng133',
          source: 'NICE Guidelines',
          caption: 'NICE guideline on hypertension in pregnancy including pre-eclampsia',
          relevance: 'important',
          tags: ['preeclampsia', 'hypertension', 'pregnancy', 'NICE']
        }
      ],
      videos: [
        {
          id: 'vid-eclampsia-management',
          type: 'video',
          title: 'Eclampsia Management: Prehospital to Delivery',
          url: 'https://www.youtube.com/watch?v=CRhGx8A7Dqg',
          source: 'Osmosis from Elsevier',
          duration: '24:30',
          relevance: 'essential',
          tags: ['eclampsia', 'management', 'preeclampsia', 'pregnancy']
        },
        {
          id: 'vid-magnesium-sulfate',
          type: 'video',
          title: 'Pre-eclampsia and Eclampsia - Pathophysiology',
          url: 'https://www.youtube.com/watch?v=pnGyENcL2j0',
          source: 'RegisteredNurseRN',
          duration: '12:15',
          relevance: 'essential',
          tags: ['preeclampsia', 'eclampsia', 'pathophysiology']
        },
        {
          id: 'vid-obstetric-seizure',
          type: 'video',
          title: 'Magnesium Sulfate Administration and Monitoring',
          url: 'https://www.youtube.com/watch?v=833v2Tm-Rr4',
          source: 'Wards Made Easy (WME)',
          duration: '18:20',
          relevance: 'important',
          tags: ['magnesium-sulfate', 'eclampsia', 'monitoring', 'treatment']
        }
      ],
      articles: [
        {
          id: 'art-eclampsia-rcog',
          type: 'article',
          title: 'RCOG Green-top Guideline: Management of Severe Pre-eclampsia/Eclampsia',
          url: 'https://www.rcog.org.uk/guidance/browse-all-guidance/green-top-guidelines/management-of-severe-pre-eclampsia-eclampsia-green-top-guideline-no-10a/',
          source: 'Royal College of Obstetricians',
          caption: 'Evidence-based guideline on eclampsia management',
          relevance: 'essential',
          tags: ['eclampsia', 'preeclampsia', 'guideline', 'RCOG']
        },
        {
          id: 'art-magnesium-therapy',
          type: 'article',
          title: 'Magnesium Sulfate for Eclampsia: Evidence and Guidelines',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4662123/',
          source: 'The Lancet',
          caption: 'Landmark studies on magnesium sulfate use in eclampsia',
          relevance: 'essential',
          tags: ['magnesium-sulfate', 'eclampsia', 'evidence', 'treatment']
        },
        {
          id: 'art-hellp-syndrome',
          type: 'article',
          title: 'HELLP Syndrome: Recognition and Management',
          url: 'https://bestpractice.bmj.com/topics/en-gb/496',
          source: 'BMJ Best Practice',
          caption: 'Clinical features and evidence-based management of HELLP syndrome',
          relevance: 'important',
          tags: ['HELLP', 'preeclampsia', 'pregnancy', 'complication']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL TRAUMA CASES (Adding 5+ cases)
// ============================================================================

export const additionalTraumaCases: CaseScenario[] = [
  createCase({
    id: 'trauma-011',
    title: 'Amputation Injury Industrial Accident',
    category: 'trauma',
    subcategory: 'extremity-trauma',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Hand caught in machine, hand severed, heavy bleeding',
      timeOfDay: 'morning',
      location: 'Factory, Industrial Area',
      callerInfo: 'Foreman',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 30,
      gender: 'male',
      weight: 75,
      occupation: 'Factory worker',
      language: 'Hindi, Basic English'
    },
    sceneInfo: {
      description: 'Factory floor, patient sitting',
      hazards: ['Industrial machinery', 'Blood', 'Sharp objects'],
      bystanders: 'Coworkers, first aider present',
      environment: 'Industrial, noisy',
      environmentVariant: 'industrial',
      sceneImagePath: '/scene-assets/trauma-011-industrial-hand-amputation.png',
      sceneImageCaption: 'Scene — Industrial, noisy',
    },
    initialPresentation: {
      generalImpression: 'Young male, pale, holding the bleeding stump of his right forearm',
      position: 'Sitting',
      appearance: 'Pale, anxious, coworker applying ineffective pressure to active arterial bleeding',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 24,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 95,
        findings: ['Tachypneic from pain'],
        interventions: ['Oxygen'],
        auscultation: ['Clear bilaterally', 'Good air entry']
      },
      circulation: {
        pulseRate: 120,
        pulseQuality: 'Weak',
        bp: { systolic: 90, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Pale, clammy',
        findings: ['Active arterial bleeding from right wrist stump', 'Significant blood loss', 'Hypotensive', 'Tachycardic'],
        interventions: ['Tourniquet', 'IV access x2', 'Fluid resuscitation']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Alert', 'Severe pain'],
        interventions: ['Analgesia']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Complete amputation right hand at wrist level', 'Amputated part present'],
        interventions: ['Care for amputated part', 'Keep dry and cool']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Right hand amputation at wrist with active bleeding', 'Coworker pressure is not controlling the stump', 'Distal pulse absent beyond the amputation'],
      posterior: ['Normal'],
      neurological: ['Sensation lost distal to amputation']
    },
    history: {
      medications: [],
      allergies: ['None known'],
      medicalConditions: ['Previously healthy'],
      surgicalHistory: [],
      lastMeal: 'Breakfast 2 hours ago',
      eventsLeading: 'Hand caught in printing press machine'
    },
    vitalSignsProgression: {
      initial: { bp: '90/60', pulse: 120, respiration: 24, spo2: 95, gcs: 15, bloodGlucose: 5.4 },
      afterIntervention: { bp: '110/70', pulse: 100, respiration: 20, spo2: 98, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Complete traumatic amputation', 'Hemorrhagic shock', 'Amputated part viable'],
      redFlags: ['Reperfusion injury', 'Hyperkalemia from cell death'],
      differentialDiagnoses: ['Traumatic amputation', 'Crush injury', 'Hemorrhagic shock'],
      mostLikelyDiagnosis: 'Traumatic Amputation of Right Hand'
    },
    managementPathway: {
      immediate: [
        'Haemorrhage control — apply tourniquet 5-7cm proximal to amputation site; apply tight with one-handed windlass; note time applied',
        'Direct pressure to stump if tourniquet not immediately available — use haemostatic dressing (QuikClot, Celox)',
        'IV access x2 (14-16G) large bore, antecubital',
        'Fluid resuscitation 500mL NS bolus — reassess BP; target SBP >90',
        'Preserve the amputated part: wrap in moist sterile gauze, place in sealed waterproof bag, then place bag in container of ice water — do NOT place directly on ice or submerge in water',
        'Label the bag with patient name, time of amputation, and time placed on ice',
        'Analgesia — Morphine 0.1mg/kg IV titrated; Ketamine 0.3mg/kg IV if haemodynamically compromised',
        'Reassess tourniquet effectiveness — proximal pulse should be absent, bleeding should be controlled'
      ],
      definitive: [
        'Reimplantation surgery — best outcomes within 6 hours of amputation (warm ischaemia time)',
        'Rashid Hospital Dubai Trauma Centre — specialist hand/plastic surgery for reimplantation',
        'Tetanus prophylaxis at hospital',
        'IV antibiotics — cover for contaminated wound',
        'Reconstructive surgery if reimplantation not possible'
      ],
      monitoring: [
        'BP every 3-5 minutes — haemorrhagic shock may develop rapidly',
        'SpO2 continuous',
        'Tourniquet time — maximum 2 hours recommended; note on patient',
        'Neurovascular status of remaining limb',
        'Signs of haemorrhagic shock: HR >120, SBP <90, cool pale skin, altered consciousness'
      ],
      transportConsiderations: [
        'Pre-alert trauma centre with "traumatic hand amputation, tourniquet in situ, time X, amputated part preserved"',
        'Bring amputated part — clearly communicated handover of part to ED team',
        'Rapid transport — every minute of warm ischaemia time reduces reimplantation success',
        'Do not delay on scene beyond tourniquet and IV access — load and go',
        'Reassess tourniquet effectiveness during transport'
      ]
    },
    studentChecklist: [
      { id: 't11-1', category: 'intervention', description: 'Control bleeding with direct pressure/tourniquet', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 't11-2', category: 'intervention', description: 'Proper care of amputated part (moist gauze → sealed bag → ice water; not directly on ice)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 't11-3', category: 'intervention', description: 'IV access and fluid resuscitation', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 't11-4', category: 'intervention', description: 'Analgesia and transport to trauma center', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Amputated parts should be wrapped in moist gauze, placed in waterproof bag, then on ice',
      'Never place amputated part directly on ice or in water',
      'Time is critical - reimplantation best within 6 hours',
      'Tourniquet acceptable for life-threatening limb bleeding'
    ],
    commonPitfalls: [
      'Failing to locate and preserve the amputated part - critical for reimplantation',
      'Placing amputated part directly on ice causing tissue freeze injury',
      'Inadequate tourniquet application leading to continued bleeding',
      'Delaying transport while searching for missing tissue fragments',
      'Not considering underlying crush injury and rhabdomyolysis risk',
      'Missing associated injuries from the mechanism (e.g., shoulder dislocation from pull)',
      'Failing to provide adequate analgesia - amputation is extremely painful',
      'Not documenting tourniquet time clearly - reimplantation viability window',
      'Transporting to a facility without microsurgical capabilities',
      'Forgetting tetanus prophylaxis and antibiotic administration'
    ],
    equipmentNeeded: [
      'Combat Application Tourniquet (CAT) or similar',
      'Sterile saline or clean water for irrigation',
      'Sterile gauze pads and cling film',
      'Waterproof sealable bag',
      'Cooler with ice (not direct contact with amputated part)',
      'Large bore IV access (14-16G)',
      'Fluid resuscitation (crystalloids, blood products if available)',
      'Analgesics (opioids, ketamine)',
      'Tetanus toxoid',
      'Broad-spectrum antibiotics',
      'Splinting materials',
      'Sterile drapes',
      'Hemostatic gauze (QuikClot, Celox)',
      'Pressure bandages'
    ],
    uaeProtocols: {
      applicableGuidelines: ['DCAS Trauma Protocols', 'PHTLS', 'ATLS'],
      receivingFacilities: [
        { name: 'Rashid Hospital Trauma Center (Level I)', location: 'Dubai', capabilities: ['Microsurgical capabilities', '24/7 hand surgery', 'Replantation services'], contact: '04 219 3000', distance: 'Primary trauma center Dubai' },
        { name: 'Dubai Hospital', location: 'Dubai', capabilities: ['Hand surgery', 'Replantation services', 'Plastic surgery'], contact: '04 337 3000', distance: 'Varies by location' },
        { name: 'Saudi German Hospital Dubai', location: 'Dubai', capabilities: ['Plastic and reconstructive surgery', 'Microsurgery'], contact: '04 389 0000', distance: 'Multiple locations' },
        { name: 'Cleveland Clinic Abu Dhabi', location: 'Abu Dhabi', capabilities: ['Microsurgical hand reconstruction', 'Orthopedic surgery'], contact: '02 501 8000', distance: 'Abu Dhabi - long transport' }
      ],
      localConsiderations: [
        'Industrial areas like Jebel Ali Free Zone have high-risk machinery operations',
        'Many workers are expatriates with limited English/Arabic - may need interpreter',
        'Factory medical rooms often have basic first aid but lack advanced trauma equipment',
        'Dubai Occupational Health and Safety regulations require incident reporting',
        'Worker compensation and insurance documentation often required',
        'Rashid Hospital is primary trauma center for severe hand injuries in Dubai',
        'Reimplantation surgery requires specialized microsurgical team - not all hospitals equipped',
        'Industrial safety standards vary across different free zones (JAFZA, DIC, DPC)',
        'Summer heat (40-50°C) increases risk of tissue deterioration - prioritize rapid cooling',
        'Friday is common day off for many workers - emergency services may need translation services'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'amputated-part-care-1',
          type: 'image',
          title: 'Proper Amputated Part Care Technique',
          url: 'https://emedicine.medscape.com/article/826816-overview',
          source: 'Medscape',
          relevance: 'essential',
          tags: ['amputation', 'prehospital', 'care']
        },
        {
          id: 'hand-amputation-levels',
          type: 'image',
          title: 'Hand Anatomy and Amputation Levels',
          url: 'https://www.assh.org/handcare/condition/amputation',
          source: 'American Society for Surgery of the Hand',
          relevance: 'important',
          tags: ['hand', 'anatomy', 'amputation']
        }
      ],
      videos: [
        {
          id: 'emcrit-amputation',
          type: 'video',
          title: 'Amputation Management and Tourniquet Use',
          url: 'https://www.youtube.com/watch?v=Ug4AKrwa0K8',
          source: 'The Paramedic Coach',
          duration: '18:45',
          relevance: 'essential',
          tags: ['amputation', 'tourniquet', 'hemorrhage']
        },
        {
          id: 'oxford-hand-replant',
          type: 'video',
          title: 'Hand Trauma and Replantation Surgery',
          url: 'https://www.youtube.com/watch?v=nudDS0B9yD8',
          source: 'SimpleNursing',
          duration: '24:30',
          relevance: 'important',
          tags: ['hand', 'trauma', 'replantation']
        },
        {
          id: 'litfl-extremity',
          type: 'video',
          title: 'Prehospital Management of Severe Extremity Trauma',
          url: 'https://www.youtube.com/watch?v=JRa9F2PVmL0',
          source: 'RegisteredNurseRN',
          duration: '15:20',
          relevance: 'essential',
          tags: ['extremity', 'trauma', 'prehospital']
        }
      ],
      articles: [
        {
          id: 'prehospital-amputated-part',
          type: 'article',
          title: 'Prehospital Care of the Amputated Part',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4821295/',
          source: 'Journal of Emergency Medical Services',
          relevance: 'essential',
          tags: ['amputation', 'prehospital', 'care']
        },
        {
          id: 'industrial-hand-trauma',
          type: 'article',
          title: 'Industrial Hand Trauma: Epidemiology and Prevention',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5537426/',
          source: 'Safety and Health at Work',
          relevance: 'supplementary',
          tags: ['industrial', 'hand', 'trauma', 'prevention']
        }
      ]
    }
  }),

  createCase({
    id: 'trauma-012',
    title: 'Drowning with Hypothermia',
    category: 'environmental',
    subcategory: 'drowning',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Child pulled from swimming pool, not breathing',
      timeOfDay: 'afternoon',
      location: 'Villa pool, Emirates Hills',
      callerInfo: 'Pool lifeguard',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 4,
      gender: 'female',
      weight: 18,
      occupation: 'N/A',
      language: 'None'
    },
    sceneInfo: {
      description: 'Poolside, child on towel',
      hazards: ['Wet surface', 'Pool chemicals'],
      bystanders: 'Parents, lifeguard',
      environment: 'Outdoor, hot weather',
      environmentVariant: 'water',
      sceneImagePath: '/scene-assets/paediatric-pool-rescue-environment.png',
      sceneImageCaption: 'Paediatric drowning — villa pool, Emirates Hills'
    },
    initialPresentation: {
      generalImpression: 'Young child, pale, not breathing',
      position: 'Supine on ground',
      appearance: 'Pale, cold, cyanotic lips',
      consciousness: 'Unresponsive'
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Fluid in airway', 'Vomitus'],
        interventions: ['Suction', 'Airway opening']
      },
      breathing: {
        rate: 0,
        rhythm: 'Absent',
        depth: 'None',
        spo2: 70,
        findings: ['Apneic'],
        interventions: ['BVM ventilation', 'Consider intubation'],
        auscultation: ['Coarse crackles bilaterally (aspirated water)', 'Reduced air entry']
      },
      circulation: {
        pulseRate: 50,
        pulseQuality: 'Weak',
        bp: { systolic: 70, diastolic: 40 },
        capillaryRefill: 4,
        skin: 'Pale, cold, temperature 32°C',
        findings: ['Bradycardic', 'Hypothermic', 'Hypotensive'],
        interventions: ['CPR if no pulse', 'Warm fluids']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 3, total: 5 },
        pupils: 'Sluggish but reactive',
        bloodGlucose: 5.4,
        findings: ['Hypoxic brain injury risk'],
        interventions: ['Prevent further heat loss']
      },
      exposure: {
        temperature: 32.0,
        findings: ['Hypothermia 32°C', 'Wet clothes'],
        interventions: ['Remove wet clothes', 'Active rewarming', 'Warm blankets']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['C-spine precautions'],
      chest: ['Crackles bilaterally', 'Aspiration likely'],
      abdomen: ['Distended from swallowed water'],
      pelvis: ['Normal'],
      extremities: ['Cold', 'Pale'],
      posterior: ['Normal'],
      neurological: ['Unresponsive', 'GCS 5']
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: ['Previously healthy'],
      surgicalHistory: [],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Fell into pool while unsupervised, estimated submersion 5 minutes'
    },
    vitalSignsProgression: {
      initial: { bp: '70/40', pulse: 50, respiration: 0, spo2: 70, gcs: 5, temperature: 32, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Drowning', 'Hypothermia', 'Respiratory arrest', 'Aspiration'],
      redFlags: ['Hypoxic brain injury', 'Secondary drowning', 'Death'],
      differentialDiagnoses: ['Drowning', 'Hypothermia', 'Aspiration pneumonia'],
      mostLikelyDiagnosis: 'Drowning with Hypothermia'
    },
    managementPathway: {
      immediate: [
        'Rescue from water safely — do not enter dangerous water without trained water rescue; use reach and throw techniques',
        'C-spine precautions if dive/fall mechanism — log roll for spinal management during rescue if safe to do so',
        'Airway suctioning — water and vomit in upper airway; use rigid suction catheter',
        'Drowning is ASPHYXIAL arrest — start with 5 RESCUE BREATHS before compressions (ERC / Resus Council UK drowning algorithm). Then reassess for signs of life.',
        'Assess for respiratory effort and pulse — up to 60 seconds for hypothermic pulse check',
        'If no pulse or apnoea after rescue breaths — CPR immediately. Paediatric ratio 15:2 (two rescuers), depth 1/3 AP chest diameter (~4-5cm), rate 100-120/min. Adult 30:2.',
        'High-flow oxygen 15L/min via NRB or BVM — SpO2 83% is critically low',
        'Remove wet clothing — wet clothing accelerates heat loss',
        'Moderate hypothermia (32°C): active external rewarming — warm blankets, Bair Hugger if available, warm humidified O2, warmed IV fluids (~40°C). Remove wet clothing first. Avoid vigorous movement (VF risk). Active internal rewarming (ECMO/lavage) is hospital-only.',
        'IV access (warmed fluids if available) — avoid cold crystalloid, use warmed NS if possible'
      ],
      definitive: [
        '"No one is dead until they are warm and dead" — continue resuscitation until core temperature >32°C or no response to rewarming',
        'ECMO (Extracorporeal Membrane Oxygenation) at tertiary centre for rewarming in cardiac arrest from hypothermia',
        'Rashid Hospital Dubai or Mediclinic City Hospital intensive care for active rewarming',
        'ICU admission for monitoring of secondary drowning (delayed pulmonary oedema)',
        'Treat hypothermia as the primary problem — dysrhythmias will resolve with rewarming'
      ],
      monitoring: [
        'Core temperature (rectal or oesophageal) — axillary is unreliable in hypothermia',
        'Continuous ECG — hypothermia causes J waves (Osborn waves) and VF risk',
        'SpO2 continuous — peripheral circulation compromised in hypothermia; probe on ear or forehead',
        'GCS/AVPU — consciousness improves with rewarming',
        'Secondary drowning — pulmonary oedema may develop 4-24 hours later; all drowning patients need observation'
      ],
      transportConsiderations: [
        'Pre-alert with "drowning with hypothermia, core temperature 32°C, ROSC achieved after 5 rescue breaths + CPR, now breathing spontaneously, active rewarming in progress"',
        'Keep patient horizontal during transport — vasodilation of hypothermic peripheries on standing causes cardiac arrest',
        'Maintain rewarming in transport — heater on maximum, foil blanket',
        'Do NOT stop CPR for hypothermic arrest — rewarming is the treatment',
        'ICU-capable hospital required — Rashid Hospital or American Hospital Dubai'
      ]
    },
    studentChecklist: [
      { id: 't12-1', category: 'abcde', description: 'Airway suction and BVM ventilation', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 't12-2', category: 'abcde', description: 'Check pulse and start CPR if needed', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 't12-3', category: 'intervention', description: 'Active rewarming for hypothermia', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 't12-4', category: 'intervention', description: 'Remove wet clothing and dry patient', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 't12-5', category: 'abcde', description: 'C-spine precautions (possible dive/trauma)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'No patient is dead until warm and dead - hypothermia is protective',
      'Drowning is a respiratory emergency - prioritize oxygenation',
      'Secondary drowning can occur up to 24 hours after submersion',
      'Always consider C-spine injury in diving accidents'
    ],
    commonPitfalls: [
      'Delaying CPR due to "no patient is dead until warm and dead" - hypothermic patients still need CPR if no pulse',
      'Failing to suction airway before ventilation - vomitus and water obstruction common',
      'Not removing wet clothing completely - compromises rewarming efforts',
      'Using excessive pressure during BVM ventilation - risk of gastric distension and aspiration',
      'Stopping resuscitation too early in hypothermic patients - protect brain even with prolonged downtime',
      'Missing associated trauma from diving/fall mechanism - C-spine injury often overlooked',
      'Failure to actively rewarm - passive rewarming insufficient in severe hypothermia',
      'Not monitoring for secondary drowning - delayed respiratory compromise',
      'Transporting to facility without pediatric critical care capabilities',
      'Inadequate family communication and support during emotional pediatric emergency'
    ],
    equipmentNeeded: [
      'Pediatric BVM with appropriate mask sizes',
      'Suction unit (portable and powerful)',
      'Airway adjuncts (OPA/NPA sizes for pediatric patient)',
      'Intubation equipment (age-appropriate ETT sizes)',
      'C-spine immobilization device (pediatric size)',
      'Dry towels and blankets (multiple)',
      'Active warming device (Bair Hugger or chemical heat packs)',
      'Warm IV fluids (fluid warmer)',
      'Temperature monitoring device (esophageal/tympanic)',
      'Pulse oximeter (pediatric probe)',
      'Cardiac monitor/defibrillator with pediatric pads',
      'Vascular access equipment (IO needle if IV difficult)',
      'Pediatric drug dosing reference'
    ],
    uaeProtocols: {
      applicableGuidelines: ['DCAS Trauma Protocols', 'PHTLS', 'ATLS', 'AHA Pediatric Advanced Life Support'],
      receivingFacilities: [
        { name: 'Latifa Hospital (Dubai Hospital for Women and Children)', location: 'Dubai', capabilities: ['Pediatric critical care', 'Pediatric ICU', 'Dedicated pediatric emergency'], contact: '04 502 8000', distance: 'Varies by location' },
        { name: 'Al Jalila Childrens Specialty Hospital', location: 'Dubai Healthcare City', capabilities: ['Level I pediatric trauma', 'Pediatric ICU', 'Subspecialty care'], contact: '04 289 1111', distance: 'Dubai Healthcare City' },
        { name: 'Sheikh Khalifa Medical City', location: 'Abu Dhabi', capabilities: ['Pediatric emergency', 'Pediatric ICU'], contact: '02 610 2000', distance: 'Abu Dhabi' },
        { name: 'Rashid Hospital Trauma Center (Level I)', location: 'Dubai', capabilities: ['Level I trauma', 'Pediatric trauma capability'], contact: '04 219 3000', distance: 'Dubai' }
      ],
      localConsiderations: [
        'Private villa pools common in Emirates Hills, Arabian Ranches, Palm Jumeirah - variable access',
        'Many pools lack proper fencing or safety barriers - drowning risk higher in residential areas',
        'Summer heat (May-September) makes pool activity peak season for drowning incidents',
        'Expatriate families may have limited swimming safety knowledge or pool barriers',
        'Cultural considerations: family dynamics and language barriers during pediatric emergency',
        'Dubai regulations require pool safety measures but enforcement varies',
        'Beach drowning incidents may involve marine hazards (jellyfish, currents)',
        'Water parks common in Dubai - crowded environments increase risk',
        'Immediate family notification and support critical in pediatric emergencies',
        'Long-term outcomes require specialized pediatric neurology follow-up available at Latifa Hospital'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'drowning-pathophysiology',
          type: 'image',
          title: 'Drowning Pathophysiology Diagram',
          url: 'https://wikem.org/wiki/Drowning',
          source: 'WikEM',
          relevance: 'essential',
          tags: ['drowning', 'pathophysiology', 'respiratory']
        },
        {
          id: 'hypothermia-staging',
          type: 'image',
          title: 'Hypothermia Classification and Management',
          url: 'https://www.wemjournal.org/article/S1080-6032(19)30001-5/fulltext',
          source: 'Wilderness & Environmental Medicine',
          relevance: 'important',
          tags: ['hypothermia', 'classification', 'staging']
        }
      ],
      videos: [
        {
          id: 'emcrit-drowning',
          type: 'video',
          title: 'Drowning Resuscitation: Prehospital Management',
          url: 'https://www.youtube.com/watch?v=Hlrbio-NpxQ',
          source: 'The First Aid Show',
          duration: '22:15',
          relevance: 'essential',
          tags: ['drowning', 'resuscitation', 'prehospital']
        },
        {
          id: 'litfl-hypothermia',
          type: 'video',
          title: 'Hypothermia Management in Trauma',
          url: 'https://www.youtube.com/watch?v=TNFzH_b4svk',
          source: 'Hamilton Health Sciences',
          duration: '18:30',
          relevance: 'essential',
          tags: ['hypothermia', 'trauma', 'management']
        },
        {
          id: 'oxford-pals-drowning',
          type: 'video',
          title: 'Pediatric Drowning and Submersion Injury',
          url: 'https://www.youtube.com/watch?v=mnfhnyY-Udk',
          source: 'ParkviewHealth',
          duration: '28:45',
          relevance: 'important',
          tags: ['drowning', 'pediatric', 'resuscitation']
        }
      ],
      articles: [
        {
          id: 'drowning-ilcor-guidelines',
          type: 'article',
          title: 'Drowning Resuscitation: ILCOR Guidelines 2020',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7014780/',
          source: 'Circulation',
          relevance: 'essential',
          tags: ['drowning', 'resuscitation', 'guidelines']
        },
        {
          id: 'secondary-drowning',
          type: 'article',
          title: 'Delayed Complications of Drowning: Secondary Drowning',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4101732/',
          source: 'BMJ Case Reports',
          relevance: 'important',
          tags: ['drowning', 'secondary', 'complications']
        },
        {
          id: 'hypothermia-cardiac-arrest',
          type: 'article',
          title: 'Hypothermic Cardiac Arrest: Resuscitation Strategies',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5538899/',
          source: 'Scandinavian Journal of Trauma',
          relevance: 'important',
          tags: ['hypothermia', 'cardiac-arrest', 'resuscitation']
        },
        {
          id: 'drowning-litfl',
          type: 'article',
          title: 'Drowning - Critical Care Compendium',
          url: 'https://litfl.com/drowning/',
          source: 'Life in the Fast Lane',
          relevance: 'supplementary',
          tags: ['drowning', 'LITFL', 'critical-care', 'resuscitation']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL BURNS CASES (Adding 4+ cases)
// ============================================================================

export const additionalBurnsCases: CaseScenario[] = [
  createCase({
    id: 'burn-002',
    title: 'Electrical Burn with Cardiac Arrest',
    category: 'burns',
    subcategory: 'cardiac-arrest',
    // Electrocution arrest — primary rhythm is asystole per the narrative.
    // VF is mentioned in differentials but the monitor should show flatline
    // so the student's clinical picture (flatline + no shock) matches.
    initialRhythm: 'Asystole',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Electrician shocked, unconscious, not breathing',
      timeOfDay: 'morning',
      location: 'Commercial building, Business Bay',
      callerInfo: 'Coworker',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 35,
      gender: 'male',
      weight: 80,
      occupation: 'Electrician',
      language: 'English'
    },
    sceneInfo: {
      description: 'Building site, patient near electrical panel',
      hazards: ['Live electrical hazard', 'Entrance and exit wounds'],
      bystanders: 'Coworkers',
      environment: 'Indoor construction site',
      environmentVariant: 'industrial',
      sceneImagePath: '/scene-assets/burn-002-electrical-arrest-business-bay.png',
      sceneImageCaption: 'Scene — Indoor construction site',
    },
    initialPresentation: {
      generalImpression: 'Young male, unresponsive, no breathing',
      position: 'Supine',
      appearance: 'Pale, burn marks on hands',
      consciousness: 'Unresponsive'
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Unprotected airway — unresponsive, no gag reflex', 'At risk of aspiration', 'Requires definitive airway management during CPR'],
        interventions: ['Head tilt / chin lift', 'OPA sized', 'BVM with 2-person seal', 'Supraglottic airway (i-gel) or ETT during CPR cycles']
      },
      breathing: {
        rate: 0,
        rhythm: 'Absent',
        depth: 'None',
        spo2: 0,
        findings: ['Apnoeic — no spontaneous respiratory effort'],
        interventions: ['BVM 10 breaths/min once airway secured (asynchronous during continuous CPR)', 'Confirm ETT with EtCO2'],
        auscultation: ['No breath sounds — apnoeic']
      },
      circulation: {
        pulseRate: 0,
        pulseQuality: 'Absent',
        bp: { systolic: 0, diastolic: 0 },
        capillaryRefill: 0,
        skin: 'Pale, entry/exit burns on hands',
        findings: ['Cardiac arrest', 'Asystole'],
        interventions: ['CPR', 'Defibrillation', 'ALS']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 1, total: 3 },
        pupils: 'Dilated, fixed',
        bloodGlucose: 5.4,
        findings: ['Cardiac arrest — GCS 3/15, unprotected airway'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Entry burn right hand', 'Exit burn left foot', 'Cardiac arrest'],
        interventions: ['Cover burns', 'Continue CPR']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Entry wound right hand', 'Exit wound left foot', 'Deep burns'],
      posterior: ['Normal'],
      neurological: ['Cardiac arrest']
    },
    history: {
      medications: [],
      allergies: ['None known'],
      medicalConditions: ['Previously healthy'],
      surgicalHistory: [],
      lastMeal: 'Breakfast',
      eventsLeading: 'Working on electrical panel, sudden flash and collapse'
    },
    vitalSignsProgression: {
      initial: { bp: '0/0', pulse: 0, respiration: 0, spo2: 0, gcs: 3, bloodGlucose: 5.4 }
    },
    expectedFindings: {
      keyObservations: ['Electrical injury', 'Cardiac arrest (asystole or VF)', 'Entry and exit wounds'],
      redFlags: ['Cardiac arrest', 'Internal organ damage', 'Compartment syndrome', 'Death'],
      differentialDiagnoses: ['Electrical injury', 'Ventricular fibrillation', 'Asystole'],
      mostLikelyDiagnosis: 'Electrical Injury with Cardiac Arrest'
    },
    managementPathway: {
      immediate: [
        'SCENE SAFETY FIRST — do NOT approach until power source is confirmed OFF by facility electrician/engineer; call for power isolation',
        'Once safe: begin CPR immediately — high-quality chest compressions 100-120/min, depth 5-6cm',
        'Attach AED/defibrillator immediately — electrical arrests are frequently VF and highly shockable',
        'Defibrillation per ALS protocol — 200J biphasic for VF/pVT',
        'Advanced airway — RSI or supraglottic airway; electrical burns can cause airway oedema rapidly',
        'IV/IO access — large bore bilateral antecubital fossa',
        'Adrenaline 1mg IV/IO every 3-5 minutes per ALS algorithm',
        'Examine for entry and exit wounds — entry typically at contact point (hands), exit where current left body (feet)',
        'C-spine precautions — muscular tetany may have caused fall or posterior shoulder dislocation'
      ],
      definitive: [
        'Prolonged resuscitation — electrical cardiac arrests in young healthy patients have excellent ROSC rates; do not stop prematurely',
        'Rashid Hospital Trauma Centre — specialist care for post-arrest management and burn assessment',
        'Fluid resuscitation for rhabdomyolysis — IV fluids titrated to urine output >1mL/kg/hr',
        'Alkalinisation of urine — sodium bicarbonate to protect renal tubules from myoglobin',
        'ICU admission for cardiac monitoring — dysrhythmias can recur post-ROSC',
        'Compartment syndrome assessment — internal thermal injury causes tissue oedema'
      ],
      monitoring: [
        'Continuous ECG — VF may recur after ROSC; monitor for QT prolongation and heart block',
        'SpO2 continuous post-ROSC',
        'Temperature — electrical injury causes hyperthermia from internal heating',
        'Urine output — dark/brown urine = myoglobinuria from rhabdomyolysis',
        'GCS post-ROSC — neurological recovery trajectory'
      ],
      transportConsiderations: [
        'Pre-alert Rashid Hospital trauma team — "electrical injury cardiac arrest, ROSC/ongoing CPR, burns to hands and feet"',
        'Continue CPR if no ROSC — maintain throughout transport',
        'Have defibrillator charged and pads on throughout — VF may recur',
        'Spinal precautions if mechanism suggests fall or tetanic injury',
        'Bring information about voltage and type of current (AC/DC) for handover'
      ]
    },
    studentChecklist: [
      { id: 'burn2-1', category: 'safety', description: 'Ensure scene is safe - power off', points: 15, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'burn2-2', category: 'abcde', description: 'Immediate CPR for cardiac arrest', points: 20, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'burn2-3', category: 'intervention', description: 'ALS protocol for electrical arrest', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'burn2-4', category: 'abcde', description: 'Look for entry and exit wounds', points: 5, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'burn2-5', category: 'intervention', description: 'Cover burns and continue resuscitation', points: 5, yearLevel: ['4th-year'], complexity: ['expert'] }
    ],
    teachingPoints: [
      'Electrical injuries cause cardiac arrest - often asystole or VF',
      'Ensure power is off before approaching patient',
      'Entry and exit wounds may be small but internal damage extensive',
      'Continue resuscitation efforts longer - electrical arrests can recover'
    ],
    commonPitfalls: [
      'Approaching the patient before confirming the power source is off — rescuers can become casualties; always confirm with facility personnel that the circuit is isolated before contact',
      'Assuming a brief electrical exposure means minor injury — internal thermal injury can cause extensive tissue necrosis along the current path between entry and exit wounds',
      'Abandoning resuscitation prematurely — electrical cardiac arrests in young healthy patients have much higher ROSC rates than other arrest aetiology; extend resuscitation efforts significantly',
      'Failing to identify both entry and exit wounds — entry is typically at point of contact (hands); exit is where current left the body (often feet); both inform mechanism assessment',
      'Missing associated trauma — the muscular tetany from electrocution can throw patients significant distances or cause posterior shoulder dislocations; always assess for fall injuries'
    ],
    visualResources: {
      images: [
        {
          id: 'img-electrical-wikem',
          type: 'image',
          title: 'Electrical Burns: Entry and Exit Wounds',
          url: 'https://wikem.org/wiki/Electrical_injury',
          source: 'WikEM',
          caption: 'Recognition of entry and exit wounds in electrical injuries',
          relevance: 'essential',
          tags: ['electrical', 'burns', 'entry-wound', 'exit-wound']
        },
        {
          id: 'img-electrical-radiopaedia',
          type: 'image',
          title: 'Electrical Injury Complications',
          url: 'https://radiopaedia.org/articles/electrical-injuries',
          source: 'Radiopaedia',
          caption: 'Imaging findings and complications of electrical injuries',
          relevance: 'important',
          tags: ['electrical', 'injury', 'complications', 'imaging']
        }
      ],
      articles: [
        {
          id: 'art-electrical-wikem',
          type: 'article',
          title: 'Electrical Injuries: Emergency Management',
          url: 'https://wikem.org/wiki/Electrical_injury',
          source: 'WikEM',
          caption: 'Emergency management of electrical injuries and associated cardiac arrest',
          relevance: 'essential',
          tags: ['electrical', 'burns', 'emergency', 'cardiac-arrest']
        },
        {
          id: 'art-electrical-emcrit',
          type: 'article',
          title: 'Electrical Injury and Lightning Strike',
          url: 'https://emcrit.org/ibcc/electrical-injury/',
          source: 'EMCrit',
          caption: 'Critical care approach to electrical injuries',
          relevance: 'essential',
          tags: ['electrical', 'burns', 'lightning', 'critical-care']
        },
        {
          id: 'art-electrical-statpearls',
          type: 'article',
          title: 'Electrical Injuries: Pathophysiology and Treatment',
          url: 'https://www.statpearls.com/ArticleLibrary/viewarticle/21892',
          source: 'StatPearls',
          caption: 'Comprehensive review of electrical injury pathophysiology and treatment',
          relevance: 'important',
          tags: ['electrical', 'burns', 'pathophysiology', 'treatment']
        }
      ],
      videos: [
        {
          id: 'vid-electrical',
          type: 'video',
          title: 'Electrical Injury Management',
          url: 'https://www.youtube.com/watch?v=iYGusNOayN8',
          source: 'EMT Made Easy',
          caption: 'Scene safety and management of electrical injuries',
          duration: '11:45',
          relevance: 'essential',
          tags: ['electrical', 'burns', 'scene-safety', 'EMS']
        },
        {
          id: 'vid-electrical-osmosis',
          type: 'video',
          title: 'Electrical Burns and Lightning Injuries',
          url: 'https://www.youtube.com/watch?v=vk1bmDbtUPM',
          source: 'UAB Medicine',
          caption: 'Pathophysiology and management of electrical and lightning injuries',
          duration: '9:30',
          relevance: 'important',
          tags: ['electrical', 'burns', 'lightning', 'pathophysiology']
        }
      ]
    }
  })
];

// ============================================================================
// LEVEL-BANDED EXPANSION (W3) — Year 3/4 multi-system, atypical presentations
// with competing priorities. Each routes to an existing treatment protocol via
// subcategory; afterIntervention targets sit at the physiology engine's
// reachable endpoint so the clinical-regression audit stays clean.
// ============================================================================

export const additionalLevelBandedCases: CaseScenario[] = [
  // fall-002: Anticoagulated elderly fall with evolving traumatic brain injury
  createCase({
    id: 'fall-002',
    title: 'Elderly Man on Warfarin - Fall with Declining Consciousness',
    category: 'elderly-fall',
    subcategory: 'head-injury',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: '82-year-old male fell down steps, was talking, now drowsy',
      timeOfDay: 'evening',
      location: 'Villa in Abu Dhabi',
      callerInfo: 'Daughter (very worried — "he\'s not himself")',
      dispatchCode: 'Delta-2'
    },
    patientInfo: {
      age: 82,
      gender: 'male',
      weight: 76,
      occupation: 'Retired',
      language: 'Arabic',
      culturalConsiderations: ['Large family present', 'Explain the seriousness clearly and calmly', 'Involve next of kin in decisions']
    },
    sceneInfo: {
      description: 'Patient at bottom of three marble steps, family gathered, walking frame nearby',
      hazards: ['Marble steps', 'Poor lighting'],
      bystanders: 'Daughter and grandchildren present',
      environment: 'Villa entrance, warm evening',
      environmentVariant: 'home',
      sceneImagePath: '/scene-assets/home-medical-male-dubai-apartment.png',
      sceneImageCaption: 'Scene — Villa entrance, warm evening',
    },
    initialPresentation: {
      generalImpression: 'Elderly man, previously talking, now increasingly drowsy — a "talk and deteriorate" pattern',
      position: 'Supine at base of steps',
      appearance: 'Drowsy, bruising to right temple, vomited once',
      consciousness: 'Was GCS 15 on arrival of family, now responds only to voice'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent currently but at risk with falling GCS', 'Vomited once — aspiration risk'],
        interventions: ['Suction ready', 'Prepare airway adjuncts', 'Position and protect airway']
      },
      breathing: {
        rate: 14,
        rhythm: 'Regular',
        depth: 'Adequate spontaneous ventilation currently',
        spo2: 94,
        findings: ['Spontaneously ventilating — monitor for decline', 'No chest injury'],
        interventions: ['High-flow oxygen', 'Assist ventilation if GCS/ventilation deteriorates']
      },
      circulation: {
        pulseRate: 56,
        pulseQuality: 'Regular, bounding',
        bp: { systolic: 178, diastolic: 98 },
        capillaryRefill: 2,
        skin: 'Warm and dry',
        findings: ['Hypertension with bradycardia — evolving Cushing response', 'No external major haemorrhage'],
        interventions: ['Do NOT lower BP', 'IV access']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 3, verbal: 4, motor: 5, total: 12 },
        bloodGlucose: 6.4,
        pupils: 'Right pupil 5mm and sluggish, left 3mm reactive (early anisocoria)',
        findings: ['Falling GCS (talk and deteriorate)', 'Anisocoria — evolving mass lesion', 'On warfarin + aspirin'],
        interventions: ['Frequent GCS/pupil checks', 'Time-critical transfer']
      },
      exposure: {
        temperature: 36.5,
        findings: ['Right temporal haematoma/bruise', 'Grazes to forearm', 'No other major injury'],
        interventions: ['Keep warm', 'Full exposure and log roll with c-spine care']
      }
    },
    secondarySurvey: {
      head: ['Right temporal boggy haematoma', 'Anisocoria (right sluggish)', 'Vomited'],
      neck: ['C-spine immobilised — cannot clear (distracting injury, altered GCS)'],
      chest: ['Clear, no injury'],
      abdomen: ['Soft'],
      pelvis: ['Stable'],
      extremities: ['Forearm grazes', 'No long-bone injury'],
      posterior: ['No spinal step/tenderness palpable'],
      neurological: ['Declining GCS', 'Developing right-sided pupillary change', 'Left-sided weakness emerging']
    },
    history: {
      medications: [
        { name: 'Warfarin', dose: '4mg', frequency: 'Daily', indication: 'Atrial fibrillation' },
        { name: 'Aspirin', dose: '75mg', frequency: 'Daily', indication: 'Vascular protection' },
        { name: 'Bisoprolol', dose: '5mg', frequency: 'Daily', indication: 'AF rate control' },
        { name: 'Ramipril', dose: '10mg', frequency: 'Daily', indication: 'Hypertension' }
      ],
      allergies: ['None known'],
      medicalConditions: ['Atrial fibrillation (anticoagulated)', 'Hypertension', 'Previous TIA'],
      surgicalHistory: ['TURP'],
      lastMeal: 'Dinner 1 hour ago',
      eventsLeading: 'Missed a step and fell, striking his right temple. Initially got up and talked to family (the classic lucid interval), then became progressively drowsy over 20 minutes and vomited. Full anticoagulation dramatically increases intracranial bleeding risk.',
      socialHistory: { smoking: 'Ex-smoker', alcohol: 'None', occupation: 'Retired', livingSituation: 'Lives with daughter\'s family' }
    },
    vitalSignsProgression: {
      initial: { bp: '178/98', pulse: 56, respiration: 14, spo2: 94, gcs: 12, bloodGlucose: 6.4 },
      afterIntervention: { bp: '178/98', pulse: 58, respiration: 14, spo2: 98, gcs: 12, bloodGlucose: 6.4 },
      deterioration: { bp: '204/112', pulse: 44, respiration: 8, spo2: 90, gcs: 6, bloodGlucose: 6.4 }
    },
    expectedFindings: {
      keyObservations: ['Talk-and-deteriorate pattern', 'Anticoagulation + antiplatelet — very high ICH risk', 'Evolving Cushing response (hypertension + bradycardia)', 'Anisocoria = mass effect'],
      redFlags: ['Falling GCS', 'Anisocoria / fixed dilated pupil', 'Cushing triad (hypertension, bradycardia, irregular breathing)', 'Vomiting', 'Warfarin — needs urgent reversal in hospital'],
      differentialDiagnoses: ['Acute subdural / extradural haematoma', 'Intracerebral haemorrhage', 'Traumatic brain injury with raised ICP', 'Simple mechanical fall (dangerously wrong anchor)'],
      mostLikelyDiagnosis: 'Expanding intracranial haematoma on anticoagulation with rising ICP',
      supportingEvidence: ['Head strike + lucid interval + deterioration', 'Warfarin + aspirin', 'Anisocoria', 'Cushing physiology']
    },
    managementPathway: {
      immediate: [
        'C-spine control and airway protection (suction ready — has vomited)',
        'High-flow oxygen; assist ventilation, avoid hypoxia and avoid hyperventilation unless herniating',
        'Do NOT lower the blood pressure — cerebral perfusion depends on it',
        'IV access, protect against hypotension (secondary brain injury)'
      ],
      definitive: [
        'Time-critical transfer to a neurosurgical centre — pre-alert',
        'Flag the anticoagulation early so the ED can arrange urgent warfarin reversal (PCC/vitamin K)',
        'Minimise scene time — this is a "scoop and run"',
        'Avoid nitrates / GTN and other BP-lowering agents'
      ],
      monitoring: ['GCS and pupils every few minutes', 'Cushing physiology (HR/BP/breathing)', 'SpO2 and end-tidal CO2 if available']
    },
    studentChecklist: [
      { id: 'fall-002-cspine', category: 'intervention', description: 'C-spine control with airway protection (aspiration risk)', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'fall-002-airway', category: 'abcde', description: 'Protect airway with suction and adjuncts as GCS falls', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'fall-002-oxy', category: 'intervention', description: 'High-flow oxygen; avoid hypoxia and hypotension (secondary brain injury)', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'fall-002-bp', category: 'clinical-reasoning', description: 'Recognise NOT to lower blood pressure (cerebral perfusion pressure)', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'fall-002-anticoag', category: 'clinical-reasoning', description: 'Identify anticoagulation + antiplatelet as a critical ICH multiplier and flag for urgent reversal', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['expert'], critical: true, rationale: 'Warfarin dramatically increases haematoma expansion; early reversal saves lives' },
      { id: 'fall-002-cushing', category: 'clinical-reasoning', description: 'Recognise the Cushing response and anisocoria as raised-ICP / herniation signs', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['expert'], critical: true },
      { id: 'fall-002-prealert', category: 'communication', description: 'Pre-alert neurosurgical centre, minimise scene time (scoop and run)', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'fall-002-gcs', category: 'abcde', description: 'Serial GCS and pupil checks with documentation', points: 6, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'A minor mechanism in an anticoagulated older patient is NOT a minor head injury — warfarin + aspirin multiply intracranial bleeding risk',
      '"Talk and deteriorate" (a lucid interval) is the classic story of an expanding intracranial haematoma',
      'The Cushing response — hypertension with bradycardia and irregular breathing — is a late, ominous sign of raised ICP',
      'Do not lower the blood pressure: cerebral perfusion pressure depends on it. Avoid hypoxia and hypotension, which cause secondary brain injury',
      'Flag anticoagulation to the receiving unit early so urgent reversal (PCC/vitamin K) can be prepared'
    ],
    commonPitfalls: [
      'Anchoring on "just a fall" and missing the evolving intracranial bleed',
      'Failing to recognise anticoagulation as a major risk multiplier',
      'Trying to treat the high blood pressure',
      'Prolonged scene time instead of scoop-and-run to neurosurgery',
      'Not protecting the airway in a vomiting patient with a falling GCS'
    ],
    references: ['NICE Head Injury (NG232)', 'JRCALC Head Trauma', 'Brain Trauma Foundation Prehospital Guidelines', 'UAE Anticoagulation Reversal Pathways']
  }),

  // obs-003: Primary postpartum haemorrhage (obstetric)
  createCase({
    id: 'obs-003',
    title: 'Postpartum Haemorrhage After Home Birth',
    category: 'obstetric',
    subcategory: 'obstetric-haemorrhage',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 22,
    dispatchInfo: {
      callReason: '31-year-old female, heavy vaginal bleeding after giving birth at home',
      timeOfDay: 'evening',
      location: 'Apartment in Dubai',
      callerInfo: 'Husband (panicking)',
      dispatchCode: 'Delta-2'
    },
    patientInfo: {
      age: 31,
      gender: 'female',
      weight: 74,
      language: 'Tagalog',
      culturalConsiderations: ['Recently delivered — emotional and physical distress', 'Newborn also present — allocate care', 'Female provider preference if possible']
    },
    sceneInfo: {
      description: 'Bedroom, unplanned home birth ~40 minutes ago, significant blood loss on bedding',
      hazards: ['Body fluids — BSI', 'Newborn requiring attention'],
      bystanders: 'Husband; newborn wrapped and breathing',
      environment: 'Apartment bedroom'
    },
    initialPresentation: {
      generalImpression: 'Pale, anxious woman with ongoing heavy vaginal bleeding, feeling faint',
      position: 'Semi-recumbent on the bed',
      appearance: 'Pale, sweaty, visibly soaked bedding',
      consciousness: 'Alert but anxious and lightheaded'
    },
    abcde: {
      airway: { patent: true, findings: ['Patent', 'Talking'], interventions: [] },
      breathing: { rate: 24, rhythm: 'Regular', depth: 'Normal', spo2: 97, findings: ['Tachypnoeic from blood loss', 'Chest clear'], interventions: ['Oxygen'] },
      circulation: {
        pulseRate: 122,
        pulseQuality: 'Weak, thready',
        bp: { systolic: 92, diastolic: 58 },
        capillaryRefill: 3,
        skin: 'Pale, cool, clammy',
        findings: ['Ongoing PV haemorrhage', 'Boggy, poorly contracted uterus (atony)', 'Class II–III shock'],
        interventions: ['Uterine fundal massage', 'IV access ×2', 'Fluids', 'Tranexamic acid']
      },
      disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'Equal and reactive', findings: ['Alert but lightheaded'], interventions: ['Monitor for falling GCS'] },
      exposure: { temperature: 36.4, findings: ['Heavy ongoing vaginal bleeding', 'Placenta reportedly delivered', 'Boggy uterus'], interventions: ['Keep warm — avoid hypothermia (coagulopathy)', 'Estimate blood loss'] }
    },
    secondarySurvey: {
      head: ['Pale conjunctivae'],
      neck: ['No abnormality'],
      chest: ['Clear'],
      abdomen: ['Uterus palpable, soft and boggy above the umbilicus (atony)'],
      pelvis: ['Ongoing PV bleeding'],
      extremities: ['Cool, poorly perfused peripheries'],
      posterior: ['Blood loss on bedding'],
      neurological: ['Alert']
    },
    history: {
      medications: [{ name: 'Antenatal vitamins', dose: 'Standard', frequency: 'Daily', indication: 'Pregnancy' }],
      allergies: ['None known'],
      medicalConditions: ['G3P3', 'Uncomplicated pregnancy'],
      surgicalHistory: ['Previous normal deliveries'],
      lastMeal: 'Several hours ago',
      eventsLeading: 'Precipitous unplanned home birth ~40 minutes ago. Placenta delivered, but bleeding has been heavy and continuous since. The uterus feels soft — the commonest cause of primary PPH is uterine atony (the first of the 4 T\'s).',
      socialHistory: { smoking: 'None', alcohol: 'None', occupation: 'Homemaker', livingSituation: 'Lives with husband and children' }
    },
    vitalSignsProgression: {
      initial: { bp: '92/58', pulse: 122, respiration: 24, spo2: 97, gcs: 15 },
      afterIntervention: { bp: '112/72', pulse: 84, respiration: 18, spo2: 98, gcs: 15 },
      deterioration: { bp: '66/40', pulse: 140, respiration: 30, spo2: 92, gcs: 12 }
    },
    expectedFindings: {
      keyObservations: ['Primary PPH (within 24h)', 'Soft boggy uterus = atony (commonest cause)', 'Class II–III haemorrhagic shock', 'Time-critical'],
      redFlags: ['Ongoing uncontrolled bleeding', 'Falling GCS / worsening shock', 'Hypothermia driving coagulopathy', 'Concealed loss underestimated'],
      differentialDiagnoses: ['Uterine atony (Tone)', 'Retained placenta / products (Tissue)', 'Genital tract trauma (Trauma)', 'Coagulopathy (Thrombin)'],
      mostLikelyDiagnosis: 'Primary postpartum haemorrhage due to uterine atony',
      supportingEvidence: ['Recent delivery', 'Boggy uterus', 'Heavy ongoing PV loss', 'Shock physiology']
    },
    managementPathway: {
      immediate: [
        'BSI and rapid haemorrhage assessment (estimate blood loss)',
        'Uterine fundal massage ("rubbing up" a contraction) — first mechanical action for atony',
        'High-flow oxygen',
        'Two large-bore IV cannulae and warmed fluids titrated to a radial pulse / mentation',
        'Tranexamic acid early (within 3 hours)'
      ],
      definitive: [
        'Encourage breastfeeding/nipple stimulation if appropriate (endogenous oxytocin) and give uterotonics per protocol',
        'Keep the patient warm — hypothermia worsens coagulopathy',
        'Pre-alert obstetric unit; allocate a second responder to the newborn',
        'Rapid transport — this is a major obstetric emergency'
      ],
      monitoring: ['Continuous HR/BP and perfusion', 'Estimate ongoing loss', 'Uterine tone', 'Temperature']
    },
    studentChecklist: [
      { id: 'obs-003-bsi', category: 'safety', description: 'BSI and rapid major-haemorrhage recognition', points: 6, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'obs-003-massage', category: 'intervention', description: 'Uterine fundal massage to treat atony', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'Rubbing up a contraction is the immediate mechanical treatment for atonic PPH' },
      { id: 'obs-003-oxygen', category: 'intervention', description: 'High-flow oxygen', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'obs-003-iv', category: 'intervention', description: 'Two large-bore IV cannulae and titrated warmed fluids', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'obs-003-txa', category: 'medication', description: 'Give tranexamic acid early (within 3 hours)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'obs-003-4ts', category: 'clinical-reasoning', description: 'Work through the 4 T\'s (Tone, Trauma, Tissue, Thrombin)', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'obs-003-warm', category: 'intervention', description: 'Keep patient warm to prevent coagulopathy', points: 5, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'obs-003-newborn', category: 'team-lead', description: 'Allocate care to the newborn and pre-alert obstetrics', points: 6, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true }
    ],
    teachingPoints: [
      'The commonest cause of primary PPH is uterine atony — a soft, boggy uterus. Fundal massage is the immediate mechanical treatment',
      'Work through the 4 T\'s: Tone, Trauma, Tissue, Thrombin',
      'Give tranexamic acid early — within 3 hours improves survival (WOMAN trial)',
      'Estimated blood loss is routinely underestimated; treat the physiology (pulse, perfusion, mentation), not the number',
      'Keep the mother warm — hypothermia drives the lethal coagulopathy of major haemorrhage. Remember there are two patients: mother and newborn'
    ],
    commonPitfalls: [
      'Not performing uterine massage',
      'Underestimating blood loss and under-resuscitating',
      'Delaying tranexamic acid',
      'Letting the patient get cold',
      'Forgetting to allocate care to the newborn'
    ],
    references: ['WOMAN Trial (Lancet 2017)', 'RCOG PPH Guideline (GTG 52)', 'JRCALC Maternity Care — Postpartum Haemorrhage']
  }),

  // cardiac-018: Profound symptomatic (peri-arrest) bradycardia (cardiac)
  createCase({
    id: 'cardiac-018',
    title: 'Peri-Arrest Bradycardia - Syncope and Shock',
    category: 'cardiac',
    subcategory: 'bradycardia',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 22,
    dispatchInfo: {
      callReason: '70-year-old male collapsed, very slow pulse, clammy',
      timeOfDay: 'morning',
      location: 'Shopping mall, Abu Dhabi',
      callerInfo: 'Mall security / first aider',
      dispatchCode: 'Echo-1'
    },
    patientInfo: {
      age: 70,
      gender: 'male',
      weight: 82,
      occupation: 'Retired',
      language: 'Arabic',
      culturalConsiderations: ['Public place — manage crowd and dignity']
    },
    sceneInfo: {
      description: 'Mall walkway, patient laid flat by first aider, AED pads available nearby',
      hazards: ['Crowd', 'Hard floor'],
      bystanders: 'Mall first aider giving handover',
      environment: 'Cool indoor mall',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/cardiac-arrest-mall-male-dubai.png',
      sceneImageCaption: 'Scene — Cool indoor mall',
    },
    initialPresentation: {
      generalImpression: 'Grey, clammy older man, barely rousable, profoundly bradycardic',
      position: 'Supine on floor',
      appearance: 'Pale, sweaty, poorly perfused',
      consciousness: 'Drowsy, responds slowly to voice'
    },
    abcde: {
      airway: { patent: true, findings: ['Patent', 'Able to speak a few words'], interventions: ['Monitor'] },
      breathing: { rate: 16, rhythm: 'Regular', depth: 'Adequate', spo2: 95, findings: ['Mild breathlessness', 'Chest clear'], interventions: ['Oxygen'] },
      circulation: {
        pulseRate: 38,
        pulseQuality: 'Slow, weak',
        bp: { systolic: 76, diastolic: 46 },
        capillaryRefill: 4,
        skin: 'Cold, clammy, poorly perfused',
        findings: ['Profound bradycardia with hypotension', 'Signs of shock (adverse features)', 'Monitor: high-grade AV block'],
        ecgFindings: ['High-grade AV block with slow ventricular response', 'Broad escape complexes'],
        interventions: ['Atropine', 'Pads on — prepare transcutaneous pacing', 'IV access', 'Fluids']
      },
      disability: { avpu: 'V', gcs: { eye: 3, verbal: 4, motor: 6, total: 13 }, bloodGlucose: 6.0, pupils: 'Equal and reactive', findings: ['Drowsy from cerebral hypoperfusion'], interventions: ['Reassess as perfusion restored'] },
      exposure: { temperature: 36.3, findings: ['No injury from collapse'], interventions: ['Keep warm'] }
    },
    secondarySurvey: {
      head: ['No trauma from collapse'],
      neck: ['No raised JVP'],
      chest: ['Clear', 'Monitor shows high-grade AV block'],
      abdomen: ['Soft'],
      pelvis: ['Stable'],
      extremities: ['Cold, poorly perfused', 'No oedema'],
      posterior: ['No injury'],
      neurological: ['Drowsy but no focal deficit']
    },
    history: {
      medications: [
        { name: 'Bisoprolol', dose: '5mg', frequency: 'Daily', indication: 'Hypertension' },
        { name: 'Amlodipine', dose: '5mg', frequency: 'Daily', indication: 'Hypertension' }
      ],
      allergies: ['None known'],
      medicalConditions: ['Hypertension', 'Ischaemic heart disease'],
      surgicalHistory: [],
      lastMeal: 'Breakfast',
      eventsLeading: 'Sudden dizziness and a brief collapse (syncope) while walking. First aider found a very slow pulse. The monitor shows high-grade AV block with adverse features (shock, syncope, low BP) — this is peri-arrest bradycardia.',
      socialHistory: { smoking: 'Ex-smoker', alcohol: 'None', occupation: 'Retired', livingSituation: 'Lives with wife' }
    },
    vitalSignsProgression: {
      initial: { bp: '76/46', pulse: 38, respiration: 16, spo2: 95, gcs: 13, bloodGlucose: 6.0 },
      afterIntervention: { bp: '108/68', pulse: 72, respiration: 15, spo2: 98, gcs: 15, bloodGlucose: 6.0 },
      deterioration: { bp: '58/34', pulse: 28, respiration: 8, spo2: 88, gcs: 8, bloodGlucose: 6.0 }
    },
    expectedFindings: {
      keyObservations: ['Profound bradycardia with adverse features (shock, syncope, hypotension)', 'High-grade AV block', 'Peri-arrest — needs immediate treatment', 'On rate-limiting drugs (bisoprolol)'],
      redFlags: ['Shock, syncope, myocardial ischaemia, heart failure = adverse features', 'Risk of asystole (recent asystole, Mobitz II, complete block, ventricular pause >3s)', 'Deterioration to arrest'],
      differentialDiagnoses: ['High-grade / complete AV block', 'Drug-induced bradycardia (beta-blocker/CCB)', 'Inferior MI with AV nodal ischaemia', 'Hyperkalaemia'],
      mostLikelyDiagnosis: 'Symptomatic high-grade AV block (peri-arrest bradycardia with adverse features)',
      supportingEvidence: ['HR 38 with BP 76/46', 'Syncope and shock', 'AV block on monitor', 'Rate-limiting medication']
    },
    managementPathway: {
      immediate: [
        'High-flow oxygen and IV access',
        'Identify adverse features (shock, syncope, ischaemia, heart failure)',
        'Atropine 500 micrograms IV, repeat to a maximum of 3mg',
        'Apply pacing pads and prepare transcutaneous pacing early (high-grade block responds poorly to atropine)'
      ],
      definitive: [
        'Transcutaneous pacing if atropine ineffective; consider adrenaline infusion per protocol',
        '12-lead ECG to look for AV block level and inferior MI',
        'Consider drug causes (beta-blocker/CCB) and treat accordingly',
        'Pre-alert cardiology / PCI centre for transvenous pacing'
      ],
      monitoring: ['Continuous ECG and perfusion', 'Response to atropine/pacing', 'Watch for progression to asystole']
    },
    studentChecklist: [
      { id: 'cardiac-018-adverse', category: 'clinical-reasoning', description: 'Identify adverse features (shock, syncope, ischaemia, heart failure)', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'Adverse features mandate immediate treatment in the bradycardia algorithm' },
      { id: 'cardiac-018-oxy-iv', category: 'intervention', description: 'High-flow oxygen and IV access', points: 6, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'cardiac-018-atropine', category: 'medication', description: 'Administer atropine 500mcg IV, repeat to max 3mg', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'cardiac-018-pacing', category: 'procedural', description: 'Apply pads and prepare/deliver transcutaneous pacing', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'High-grade AV block often needs pacing rather than atropine' },
      { id: 'cardiac-018-ecg', category: 'procedural', description: 'Obtain 12-lead ECG (level of block, inferior MI)', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'cardiac-018-cause', category: 'clinical-reasoning', description: 'Consider reversible causes (drugs, ischaemia, hyperkalaemia)', points: 8, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'cardiac-018-prealert', category: 'communication', description: 'Pre-alert cardiology / PCI centre for definitive pacing', points: 6, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true }
    ],
    teachingPoints: [
      'The bradycardia algorithm turns on adverse features: shock, syncope, myocardial ischaemia, heart failure',
      'Atropine 500mcg IV (repeat to max 3mg) is first-line, but high-grade AV block (Mobitz II, complete block) responds poorly — move to pacing early',
      'Get the pacing pads on before the patient arrests; transcutaneous pacing is a bridge to transvenous pacing',
      'Always look for reversible causes — beta-blockers/calcium-channel blockers, inferior MI, hyperkalaemia',
      'Risk factors for asystole: recent asystole, Mobitz II, complete heart block with broad QRS, ventricular pauses > 3 seconds'
    ],
    commonPitfalls: [
      'Waiting for atropine to work in high-grade block instead of pacing',
      'Not identifying the adverse features that mandate treatment',
      'Forgetting reversible drug and electrolyte causes',
      'Delaying application of pacing pads',
      'Missing an inferior MI on the 12-lead'
    ],
    references: ['Resuscitation Council UK — Adult Bradycardia Algorithm', 'JRCALC Bradycardia', 'ACLS Bradycardia Guidelines']
  }),

  // sepsis-001: Elderly urosepsis / septic shock (general)
  createCase({
    id: 'sepsis-001',
    title: 'Elderly Woman - Confusion, Fever and Low Blood Pressure',
    category: 'general',
    subcategory: 'sepsis',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 22,
    dispatchInfo: {
      callReason: '79-year-old female, increasingly confused and unwell for 2 days',
      timeOfDay: 'afternoon',
      location: 'Assisted-living residence, Dubai',
      callerInfo: 'Care assistant',
      dispatchCode: 'Delta-2'
    },
    patientInfo: {
      age: 79,
      gender: 'female',
      weight: 58,
      language: 'English',
      culturalConsiderations: ['Frail elderly patient', 'Obtain collateral from carers', 'Establish ceiling-of-care / wishes where possible']
    },
    sceneInfo: {
      description: 'Residential care room, patient in bed, carers concerned about a change in behaviour',
      hazards: ['None'],
      bystanders: 'Care assistant with notes',
      environment: 'Warm care home'
    },
    initialPresentation: {
      generalImpression: 'Frail elderly woman, flushed, drowsy and confused, breathing fast',
      position: 'In bed, semi-recumbent',
      appearance: 'Flushed then mottled knees, dry mucous membranes',
      consciousness: 'Confused — a change from her normal alert self (carers)'
    },
    abcde: {
      airway: { patent: true, findings: ['Patent', 'Confused speech'], interventions: ['Monitor'] },
      breathing: { rate: 26, rhythm: 'Regular', depth: 'Increased', spo2: 93, findings: ['Tachypnoea (a key early sepsis sign)', 'Chest clear'], interventions: ['Oxygen to target'] },
      circulation: {
        pulseRate: 112,
        pulseQuality: 'Bounding then thready',
        bp: { systolic: 104, diastolic: 62 },
        capillaryRefill: 3,
        skin: 'Warm, flushed centrally, early knee mottling',
        findings: ['Tachycardia maintaining a borderline, falling BP — occult hypoperfusion (compensated "warm" phase)', 'Decompensation to septic shock is near'],
        interventions: ['Large-bore IV access', 'Fluid resuscitation and reassess']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 3, verbal: 5, motor: 6, total: 14 },
        bloodGlucose: 7.8,
        pupils: 'Equal and reactive',
        findings: ['New confusion (a red-flag sepsis sign in the elderly)'],
        interventions: ['Reassess as perfusion improves']
      },
      exposure: {
        temperature: 38.9,
        findings: ['Febrile', 'Offensive, cloudy catheter urine noted by carers', 'Mottled knees'],
        interventions: ['Expose to find the source; keep dignified and warm']
      }
    },
    secondarySurvey: {
      head: ['Dry mucous membranes'],
      neck: ['No stiffness'],
      chest: ['Clear — not a chest source'],
      abdomen: ['Mild suprapubic tenderness'],
      pelvis: ['Long-term urinary catheter, cloudy offensive urine'],
      extremities: ['Mottled knees', 'Cool peripheries'],
      posterior: ['No pressure sores infected'],
      neurological: ['Confused, no focal deficit']
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '5mg', frequency: 'Daily', indication: 'Hypertension' },
        { name: 'Donepezil', dose: '10mg', frequency: 'Daily', indication: 'Dementia' }
      ],
      allergies: ['None documented'],
      medicalConditions: ['Dementia', 'Hypertension', 'Recurrent UTIs', 'Long-term catheter'],
      surgicalHistory: [],
      lastMeal: 'Eating and drinking poorly for 2 days',
      eventsLeading: 'Two days of reduced intake and increasing confusion; today febrile, tachypnoeic and hypotensive. Carers report cloudy, offensive catheter urine. Sepsis in the elderly often presents atypically as confusion or falls rather than obvious infection.',
      socialHistory: { smoking: 'Never', alcohol: 'None', occupation: 'Retired', livingSituation: 'Assisted-living residence' }
    },
    vitalSignsProgression: {
      initial: { bp: '104/62', pulse: 112, respiration: 26, spo2: 93, gcs: 14, bloodGlucose: 7.8, temperature: 38.9 },
      afterIntervention: { bp: '120/72', pulse: 68, respiration: 20, spo2: 98, gcs: 14, bloodGlucose: 7.8, temperature: 38.9 },
      deterioration: { bp: '70/40', pulse: 132, respiration: 32, spo2: 88, gcs: 10, bloodGlucose: 7.8, temperature: 39.2 }
    },
    expectedFindings: {
      keyObservations: ['Severe sepsis — occult hypoperfusion under a maintained but falling BP', 'Likely urinary source (catheter, offensive urine)', 'New confusion — atypical elderly presentation', 'Tachypnoea is an early warning'],
      redFlags: ['Falling systolic BP / rising lactate', 'New confusion', 'Early mottling, poor perfusion', 'Tachypnoea', 'Failure to respond to fluids (decompensation to septic shock)'],
      differentialDiagnoses: ['Severe sepsis / early septic shock (urinary source)', 'Pneumonia (chest clear here)', 'Dehydration', 'Hypoglycaemia (excluded)', 'Stroke'],
      mostLikelyDiagnosis: 'Severe sepsis, urinary source (catheter-associated urosepsis), compensated but impending septic shock',
      supportingEvidence: ['Fever + tachycardia + tachypnoea + confusion', 'Cloudy offensive catheter urine', 'Borderline falling BP with early mottling']
    },
    managementPathway: {
      immediate: [
        'Recognise sepsis and screen with a structured tool (NEWS2 / Sepsis Six)',
        'High-flow oxygen to target saturations',
        'Large-bore IV access; balanced crystalloid fluid resuscitation and reassess',
        'Give paracetamol for fever/comfort; early antibiotics on arrival at hospital'
      ],
      definitive: [
        'Pre-alert the ED as a sepsis / time-critical call so antibiotics and blood cultures are ready',
        'Identify the likely source (urinary) for handover',
        'Reassess fluid responsiveness — escalate if refractory',
        'Establish patient wishes / ceiling of care with carers if available'
      ],
      monitoring: ['Repeat BP/HR/RR and perfusion', 'Response to fluids', 'GCS', 'SpO2 and temperature']
    },
    studentChecklist: [
      { id: 'sepsis-001-recognise', category: 'clinical-reasoning', description: 'Recognise sepsis/septic shock and screen (NEWS2 / Sepsis Six)', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'Early recognition drives survival' },
      { id: 'sepsis-001-atypical', category: 'clinical-reasoning', description: 'Appreciate atypical elderly presentation (confusion/falls, may be afebrile)', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'sepsis-001-oxygen', category: 'intervention', description: 'High-flow oxygen to target saturations', points: 6, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'sepsis-001-fluids', category: 'intervention', description: 'Large-bore IV access and balanced crystalloid resuscitation with reassessment', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'sepsis-001-source', category: 'secondary', description: 'Identify the likely source (catheter/urinary)', points: 6, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'sepsis-001-antibiotics', category: 'clinical-reasoning', description: 'Recognise need for early antibiotics; give paracetamol for fever; pre-alert', points: 8, yearLevel: ['4th-year'], complexity: ['advanced'], critical: true },
      { id: 'sepsis-001-prealert', category: 'communication', description: 'Pre-alert ED as a sepsis / time-critical call', points: 6, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true }
    ],
    teachingPoints: [
      'Sepsis in the elderly is a great mimic — new confusion, a fall, or "just not right" may be the only clue, and they may not mount a fever',
      'A tachycardia holding up a borderline, falling blood pressure is compensated sepsis — decompensation to septic shock can be sudden, so treat now',
      'Tachypnoea is one of the earliest and most reliable warning signs',
      'Give oxygen, gain IV access and resuscitate with balanced fluids, reassessing responsiveness; pre-alert so hospital antibiotics and cultures are ready',
      'Always look for the source — here the catheter and offensive urine point to a urinary origin'
    ],
    commonPitfalls: [
      'Missing atypical presentations (confusion/falls) in the elderly',
      'Being reassured by a normal temperature',
      'Under-resuscitating with fluids or not reassessing the response',
      'Not pre-alerting so antibiotics are delayed',
      'Failing to identify the septic source'
    ],
    references: ['Surviving Sepsis Campaign Guidelines', 'UK Sepsis Trust — Sepsis Six', 'NICE Sepsis (NG51)', 'JRCALC Sepsis']
  }),

  // resp-012: Refractory / biphasic anaphylaxis (respiratory)
  createCase({
    id: 'resp-012',
    title: 'Refractory Anaphylaxis - Worsening After First Adrenaline',
    category: 'respiratory',
    subcategory: 'anaphylaxis',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 22,
    dispatchInfo: {
      callReason: '44-year-old male, severe allergic reaction after eating, not improving',
      timeOfDay: 'evening',
      location: 'Restaurant in a Dubai mall',
      callerInfo: 'Restaurant manager; a bystander gave an adrenaline auto-injector',
      dispatchCode: 'Echo-1'
    },
    patientInfo: {
      age: 44,
      gender: 'male',
      weight: 90,
      occupation: 'Engineer',
      language: 'English',
      culturalConsiderations: ['Public venue — manage crowd', 'Obtain allergy history quickly']
    },
    sceneInfo: {
      description: 'Restaurant, patient on the floor, one auto-injector already used ~8 minutes ago',
      hazards: ['Crowd', 'Food allergen still on table'],
      bystanders: 'Manager and a first-aider',
      environment: 'Busy restaurant',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/resp-012-mall-restaurant-anaphylaxis-male.png',
      sceneImageCaption: 'Scene — Busy restaurant',
    },
    initialPresentation: {
      generalImpression: 'Distressed man with facial/lip swelling, audible wheeze and stridor, becoming exhausted',
      position: 'Slumped, prefers sitting but hypotensive',
      appearance: 'Flushed with urticaria, lip and tongue swelling, anxious',
      consciousness: 'Alert but agitated and tiring'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Lip and tongue angioedema', 'Inspiratory stridor', 'Hoarse voice — impending airway compromise'],
        interventions: ['Prepare for a difficult airway', 'Positioning', 'Nebulised adrenaline may buy time', 'Early senior/airway support']
      },
      breathing: {
        rate: 30,
        rhythm: 'Regular',
        depth: 'Laboured',
        spo2: 86,
        findings: ['Widespread wheeze', 'Reduced air entry', 'Stridor', 'Accessory muscle use'],
        auscultation: ['Widespread wheeze', 'Reduced air entry bilaterally'],
        interventions: ['High-flow oxygen', 'Nebulised salbutamol', 'IM adrenaline (repeat)']
      },
      circulation: {
        pulseRate: 132,
        pulseQuality: 'Weak, thready',
        bp: { systolic: 74, diastolic: 40 },
        capillaryRefill: 4,
        skin: 'Flushed with widespread urticaria, then pale peripherally',
        findings: ['Distributive shock', 'Poor perfusion'],
        interventions: ['Repeat IM adrenaline', 'Large-bore IV access', 'Rapid IV fluid bolus']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 3, verbal: 4, motor: 6, total: 13 },
        bloodGlucose: 6.2,
        pupils: 'Equal and reactive',
        findings: ['Agitation from hypoxia and shock'],
        interventions: ['Reassess as perfusion/oxygenation improves']
      },
      exposure: { temperature: 36.7, findings: ['Widespread urticaria', 'Known nut allergy — ate a dessert with nuts'], interventions: ['Remove ongoing allergen exposure'] }
    },
    secondarySurvey: {
      head: ['Facial, lip and tongue angioedema'],
      neck: ['Stridor', 'No trauma'],
      chest: ['Widespread wheeze', 'Reduced air entry'],
      abdomen: ['Cramping (mast-cell mediated)'],
      pelvis: ['Stable'],
      extremities: ['Urticaria', 'Cool, poorly perfused peripheries'],
      posterior: ['Urticarial rash on back'],
      neurological: ['Agitated but no focal deficit']
    },
    history: {
      medications: [{ name: 'Cetirizine', dose: '10mg', frequency: 'PRN', indication: 'Hay fever' }],
      allergies: ['Tree nuts (known, carries an auto-injector)'],
      medicalConditions: ['Allergic rhinitis', 'Mild asthma'],
      surgicalHistory: [],
      lastMeal: 'Dessert containing nuts ~15 minutes ago',
      eventsLeading: 'Rapid onset of urticaria, facial swelling, wheeze and collapse after eating a nut-containing dessert. A bystander gave his auto-injector ~8 minutes ago, but he is worsening — this is refractory anaphylaxis requiring repeat adrenaline, fluids and airway preparation.',
      socialHistory: { smoking: 'None', alcohol: 'Occasional', occupation: 'Engineer', livingSituation: 'Lives with family' }
    },
    vitalSignsProgression: {
      initial: { bp: '74/40', pulse: 132, respiration: 30, spo2: 86, gcs: 13, bloodGlucose: 6.2 },
      afterIntervention: { bp: '104/66', pulse: 104, respiration: 24, spo2: 96, gcs: 13, bloodGlucose: 6.2 },
      deterioration: { bp: '55/30', pulse: 150, respiration: 8, spo2: 70, gcs: 8, bloodGlucose: 6.2 }
    },
    expectedFindings: {
      keyObservations: ['Refractory anaphylaxis (worsening after one adrenaline dose)', 'Airway compromise (angioedema, stridor)', 'Distributive shock', 'Known nut allergy with clear trigger'],
      redFlags: ['Stridor / voice change / tongue swelling — impending airway obstruction', 'Persistent hypotension despite adrenaline', 'Exhaustion / falling respiratory effort', 'Biphasic recurrence'],
      differentialDiagnoses: ['Anaphylaxis (refractory)', 'Acute severe asthma', 'Angioedema (isolated)', 'Panic attack (excluded by skin/airway/shock signs)'],
      mostLikelyDiagnosis: 'Refractory anaphylaxis with airway compromise and distributive shock',
      supportingEvidence: ['Rapid onset after nut exposure', 'Urticaria + angioedema + wheeze + hypotension', 'Failure to improve after first adrenaline']
    },
    managementPathway: {
      immediate: [
        'Remove the allergen; lay flat with legs raised (do NOT stand the patient up)',
        'Repeat IM adrenaline (anterolateral thigh) every 5 minutes for refractory features',
        'High-flow oxygen; nebulised salbutamol for bronchospasm; consider nebulised adrenaline for stridor',
        'Two large-bore IV cannulae and a rapid IV fluid bolus for shock'
      ],
      definitive: [
        'Prepare early for a difficult airway — call for senior/airway support; anticipate the need for advanced airway',
        'Give hydrocortisone per protocol (adjunct, not first-line)',
        'If refractory to repeated IM doses, an adrenaline infusion is the next step (critical-care/hospital)',
        'Pre-alert the ED; admit for observation — biphasic reactions can recur hours later'
      ],
      monitoring: ['Continuous SpO2, BP, HR and airway', 'Response to repeated adrenaline', 'Watch for airway obstruction and biphasic recurrence']
    },
    studentChecklist: [
      { id: 'resp-012-allergen', category: 'intervention', description: 'Remove allergen and position (lay flat, legs raised — do not stand up)', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['expert'], critical: true, rationale: 'Standing an anaphylaxis patient up can cause fatal empty-ventricle arrest' },
      { id: 'resp-012-adrenaline', category: 'medication', description: 'Repeat IM adrenaline every 5 minutes for refractory features', points: 14, yearLevel: ['3rd-year', '4th-year'], complexity: ['expert'], critical: true, rationale: 'Refractory anaphylaxis needs repeated adrenaline, not antihistamines' },
      { id: 'resp-012-airway', category: 'clinical-reasoning', description: 'Recognise impending airway obstruction (stridor, voice change, tongue swelling) and prepare early', points: 12, yearLevel: ['3rd-year', '4th-year'], complexity: ['expert'], critical: true },
      { id: 'resp-012-oxygen', category: 'intervention', description: 'High-flow oxygen and nebulised salbutamol for bronchospasm', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['expert'] },
      { id: 'resp-012-fluids', category: 'intervention', description: 'Large-bore IV access and rapid fluid bolus for distributive shock', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['expert'], critical: true },
      { id: 'resp-012-infusion', category: 'clinical-reasoning', description: 'Recognise when to escalate to an adrenaline infusion (refractory)', points: 8, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'resp-012-adjuncts', category: 'medication', description: 'Give hydrocortisone as an adjunct (not first-line)', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['expert'] },
      { id: 'resp-012-biphasic', category: 'clinical-reasoning', description: 'Pre-alert and admit for observation (biphasic reaction risk)', points: 6, yearLevel: ['3rd-year', '4th-year'], complexity: ['expert'], critical: true }
    ],
    teachingPoints: [
      'Adrenaline is the treatment for anaphylaxis — refractory reactions need it REPEATED (IM every 5 minutes), then an infusion if still failing',
      'Antihistamines and steroids are adjuncts, not substitutes for adrenaline, and treat nothing life-threatening acutely',
      'Never stand an anaphylaxis patient up — the empty ventricle can precipitate cardiac arrest',
      'Stridor, a hoarse voice, and tongue swelling signal impending airway obstruction — prepare for a difficult airway early and call for help',
      'Even after improvement, admit for observation: biphasic reactions can recur hours later'
    ],
    commonPitfalls: [
      'Reaching for antihistamines/steroids instead of repeating adrenaline',
      'Not repeating adrenaline when the patient fails to improve',
      'Standing the patient up or sitting them forward when hypotensive',
      'Underestimating airway compromise until it is too late',
      'Discharging early and missing the biphasic reaction'
    ],
    references: ['Resuscitation Council UK — Anaphylaxis Guidelines 2021', 'JRCALC Anaphylaxis', 'NICE Anaphylaxis (CG134)']
  }),

  // fall-003: Long-lie fall with fractured neck of femur and hypovolaemia (elderly-fall)
  createCase({
    id: 'fall-003',
    title: 'Long Lie - Fractured Hip, Cold and Shocked',
    category: 'elderly-fall',
    subcategory: 'fall',
    priority: 'high',
    complexity: 'advanced',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 22,
    dispatchInfo: {
      callReason: '84-year-old female found on the floor, on the ground since last night',
      timeOfDay: 'morning',
      location: 'Villa in Sharjah',
      callerInfo: 'Neighbour with a spare key',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 84,
      gender: 'female',
      weight: 55,
      language: 'Arabic',
      culturalConsiderations: ['Lives alone', 'Female provider preference if possible', 'Involve family early']
    },
    sceneInfo: {
      description: 'Bathroom floor, patient found by a neighbour after not answering the door; cool tiled floor',
      hazards: ['Wet bathroom floor', 'Confined space for extrication'],
      bystanders: 'Neighbour present',
      environment: 'Villa, air-conditioning left on overnight (cold)'
    },
    initialPresentation: {
      generalImpression: 'Frail elderly woman on the floor for many hours, cold, in pain, shortened externally-rotated leg',
      position: 'On the floor, right leg shortened and externally rotated',
      appearance: 'Pale, cold to touch, dry, distressed by pain',
      consciousness: 'Alert but weak'
    },
    abcde: {
      airway: { patent: true, findings: ['Patent', 'Speaking'], interventions: [] },
      breathing: { rate: 20, rhythm: 'Regular', depth: 'Normal', spo2: 95, findings: ['Slightly fast', 'Chest clear'], interventions: ['Oxygen if hypoxic'] },
      circulation: {
        pulseRate: 92,
        pulseQuality: 'Weak',
        bp: { systolic: 104, diastolic: 64 },
        capillaryRefill: 3,
        skin: 'Pale, cool peripheries',
        findings: ['Relative hypovolaemia (occult NOF blood loss, dehydration, long lie)', 'Beta-blocker may blunt the tachycardia'],
        interventions: ['IV access', 'Cautious fluids', 'Analgesia']
      },
      disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, bloodGlucose: 5.2, pupils: 'Equal and reactive', findings: ['Alert', 'No head injury reported'], interventions: [] },
      exposure: {
        temperature: 35.4,
        findings: ['Hypothermic (35.4°C) from a long lie on a cold floor', 'Right hip shortened and externally rotated', 'Early pressure area over sacrum', 'Incontinent — long lie'],
        interventions: ['Active rewarming', 'Handle gently', 'Pressure-area care']
      }
    },
    secondarySurvey: {
      head: ['No injury'],
      neck: ['No pain'],
      chest: ['Clear'],
      abdomen: ['Soft'],
      pelvis: ['Right hip pain, leg shortened and externally rotated — clinical NOF fracture'],
      extremities: ['Right leg shortened/externally rotated', 'Distal pulses present', 'Cool peripheries', 'Possible pressure injury heel'],
      posterior: ['Sacral pressure area developing'],
      neurological: ['Intact distal sensation and movement (limited by pain)']
    },
    history: {
      medications: [
        { name: 'Bisoprolol', dose: '2.5mg', frequency: 'Daily', indication: 'Atrial fibrillation' },
        { name: 'Apixaban', dose: '5mg', frequency: 'Twice daily', indication: 'AF stroke prevention' },
        { name: 'Furosemide', dose: '20mg', frequency: 'Daily', indication: 'Ankle swelling' }
      ],
      allergies: ['None known'],
      medicalConditions: ['Atrial fibrillation (on apixaban)', 'Osteoporosis', 'Hypertension'],
      surgicalHistory: ['Right knee replacement'],
      lastMeal: 'Supper last night — nothing since',
      eventsLeading: 'Fell going to the bathroom overnight and could not get up; found by a neighbour in the morning. On the cold floor for roughly 10 hours. Shortened, externally-rotated leg indicates a fractured neck of femur, and a long lie brings hypothermia, dehydration, pressure injury and rhabdomyolysis. She is anticoagulated.',
      socialHistory: { smoking: 'Never', alcohol: 'None', occupation: 'Retired', livingSituation: 'Lives alone, family nearby' }
    },
    vitalSignsProgression: {
      initial: { bp: '104/64', pulse: 92, respiration: 20, spo2: 95, gcs: 15, bloodGlucose: 5.2, temperature: 35.4 },
      afterIntervention: { bp: '94/58', pulse: 78, respiration: 18, spo2: 96, gcs: 15, bloodGlucose: 5.2, temperature: 35.4 },
      deterioration: { bp: '84/52', pulse: 108, respiration: 24, spo2: 93, gcs: 14, bloodGlucose: 5.2, temperature: 34.8 }
    },
    expectedFindings: {
      keyObservations: ['Clinical NOF fracture (shortened, externally rotated)', 'Long-lie complications: hypothermia, dehydration, pressure injury, rhabdomyolysis risk', 'Occult blood loss with blunted tachycardia (beta-blocker)', 'Anticoagulated'],
      redFlags: ['Hypothermia', 'Developing shock (occult NOF blood loss can exceed 1 litre)', 'Rhabdomyolysis / AKI from long lie', 'Anticoagulation increasing bleeding'],
      differentialDiagnoses: ['Fractured neck of femur', 'Pubic ramus / pelvic fracture', 'Pathological fracture', 'Cause of the fall (syncope, sepsis, stroke) must also be sought'],
      mostLikelyDiagnosis: 'Fractured neck of femur with long-lie hypothermia and relative hypovolaemia',
      supportingEvidence: ['Shortened externally-rotated leg', 'Long lie on cold floor', 'Hypothermia 35.4°C', 'Pale, cool, borderline BP']
    },
    managementPathway: {
      immediate: [
        'Gentle handling; full set of vitals including temperature',
        'IV access and cautious warmed fluids for hypovolaemia',
        'Effective analgesia (paracetamol and titrated stronger analgesia per protocol)',
        'Active rewarming and insulation — treat the hypothermia'
      ],
      definitive: [
        'Immobilise/support the injured limb for transfer; pressure-area care',
        'Consider the CAUSE of the fall (syncope, sepsis, stroke, arrhythmia), not just the injury',
        'Flag anticoagulation and long-lie complications (rhabdomyolysis/AKI risk) at handover',
        'Transport to an appropriate facility; pre-alert if shocked'
      ],
      monitoring: ['Repeat vitals and temperature', 'Response to fluids and analgesia', 'Perfusion and pain', 'Watch for worsening shock']
    },
    studentChecklist: [
      { id: 'fall-003-gentle', category: 'intervention', description: 'Gentle handling and full vitals including temperature', points: 8, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'fall-003-nof', category: 'secondary', description: 'Recognise clinical NOF fracture (shortened, externally rotated leg)', points: 8, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'fall-003-hypothermia', category: 'clinical-reasoning', description: 'Recognise and actively treat long-lie hypothermia', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'Hypothermia worsens coagulopathy and outcome' },
      { id: 'fall-003-fluids', category: 'intervention', description: 'IV access and cautious warmed fluids for occult blood loss', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'fall-003-analgesia', category: 'intervention', description: 'Effective analgesia (paracetamol + titrated stronger agent)', points: 8, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'fall-003-cause', category: 'clinical-reasoning', description: 'Seek the CAUSE of the fall (syncope, sepsis, stroke, arrhythmia)', points: 8, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true },
      { id: 'fall-003-longlie', category: 'clinical-reasoning', description: 'Anticipate rhabdomyolysis/AKI and pressure injury from the long lie', points: 8, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'fall-003-anticoag', category: 'history', description: 'Note anticoagulation (apixaban) as a bleeding-risk multiplier', points: 6, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] }
    ],
    teachingPoints: [
      'A shortened, externally-rotated leg is a fractured neck of femur until proven otherwise',
      'The long lie is the hidden diagnosis: hypothermia, dehydration, pressure injury and rhabdomyolysis/AKI — treat them all',
      'Occult blood loss into a hip fracture can exceed a litre; a beta-blocker (bisoprolol) blunts the compensatory tachycardia, masking shock',
      'Always ask WHY they fell — a syncope, arrhythmia, sepsis or stroke may be the real emergency behind the injury',
      'Handle gently, treat pain well, actively rewarm, and flag anticoagulation at handover'
    ],
    commonPitfalls: [
      'Treating only the hip and missing hypothermia, dehydration and rhabdomyolysis',
      'Being falsely reassured by a "normal" heart rate in a beta-blocked patient',
      'Not looking for the cause of the fall',
      'Under-treating pain or handling roughly',
      'Ignoring anticoagulation'
    ],
    references: ['NICE Hip Fracture (CG124)', 'JRCALC Falls / Older Person', 'BGS Falls and Long-Lie Guidance', 'UAE Prehospital Trauma Guideline']
  })
];

// ============================================================================
// COMBINE ALL ADDITIONAL CASES
// ============================================================================

export const additionalCaseDatabase: CaseScenario[] = [
  ...additionalRespiratoryCases,
  ...additionalNeurologicalCases,
  ...additionalMetabolicCases,
  ...additionalToxicologyCases,
  ...additionalPediatricCases,
  ...additionalEnvironmentalCases,
  ...additionalPsychiatricCases,
  ...additionalObstetricCases,
  ...additionalTraumaCases,
  ...additionalBurnsCases,
  ...additionalLevelBandedCases
];

export default additionalCaseDatabase;
