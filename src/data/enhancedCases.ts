/**
 * Enhanced Medical Case Database
 *
 * Comprehensive cases focusing on:
 * - Thoracic trauma (cardiac tamponade, tension pneumothorax, hemothorax)
 * - Critical care scenarios
 * - Detailed clinical guideline-based assessments
 * - ECG integration
 * - Advanced checklist items with clinical reasoning
 */

import type { CaseScenario } from '@/types';

// Helper function to create a case
const createCase = (caseData: Partial<CaseScenario> & { id: string; title: string }): CaseScenario => ({
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...caseData,
} as CaseScenario);

// ============================================================================
// THORACIC TRAUMA CASES
// ============================================================================

export const moreTraumaCases: CaseScenario[] = [
  // Cardiac Tamponade (Beck's Triad)
  createCase({
    id: 'trauma-004',
    title: 'Penetrating Chest Trauma - Cardiac Tamponade',
    category: 'trauma',
    subcategory: 'tamponade',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Stabbing to chest, patient unresponsive',
      timeOfDay: 'evening',
      location: 'Public park in Downtown Dubai',
      callerInfo: 'Bystander (distressed)',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient collapsed', 'Assailant fled the scene', 'Police en route']
    },
    patientInfo: {
      age: 32,
      gender: 'male',
      weight: 75,
      occupation: 'Unknown',
      language: 'Unknown',
      culturalConsiderations: ['Possible language barrier']
    },
    sceneInfo: {
      description: 'Patient supine on ground, blood visible on chest',
      hazards: ['Assailant may still be nearby', 'Broken glass'],
      bystanders: 'Multiple bystanders, one applying pressure',
      environment: 'Outdoor, nighttime, poor lighting',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/trauma-004-park-stabbing-tamponade.png',
      sceneImageCaption: 'Scene — Outdoor, nighttime, poor lighting',
      accessIssues: ['Crowd control needed'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Young male, pale, diaphoretic, unresponsive',
      position: 'Supine',
      appearance: 'Pale, cyanotic lips, mottled skin',
      consciousness: 'Unresponsive to verbal, responds only to painful stimulus',
      sounds: ['Weak heart sounds', 'Diminished breath sounds']
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Airway compromised by decreased consciousness', 'Requires airway adjunct'],
        interventions: ['Jaw thrust', 'Insert OPA', 'Prepare for advanced airway'],
        adjunctsNeeded: ['OPA size 90mm', 'Suction'],
        difficulty: 'Moderate'
      },
      breathing: {
        rate: 32,
        rhythm: 'Labored and shallow',
        depth: 'Shallow',
        spo2: 88,
        findings: ['Tachypneic', 'Labored breathing', 'Equal but diminished breath sounds bilaterally'],
        interventions: ['High-flow oxygen 15L/min', 'Assist ventilation if needed'],
        auscultation: ['Diminished but equal air entry', 'No wheeze', 'No crackles']
      },
      circulation: {
        pulseRate: 140,
        pulseQuality: 'Weak and thready',
        bp: { systolic: 70, diastolic: 50 },
        capillaryRefill: 5,
        skin: 'Pale, cold, clammy, mottled',
        findings: ['Severe tachycardia', 'Severe hypotension', 'Poor perfusion', 'JVD present'],
        interventions: ['IV access x2 large bore', 'Permissive hypotension (SBP 80-90 mmHg if no TBI) via small-volume fluid titration + early blood products', 'Small-volume Hartmann\'s aliquots (250mL) titrated to radial pulse (avoid large crystalloid volumes — dilutional coagulopathy, worse mortality in penetrating / haemorrhagic trauma)'],
        ecgFindings: ['Sinus tachycardia', 'Possible electrical alternans', 'Low voltage QRS'],
        ivAccess: ['14G left AC fossa', '14G right AC fossa']
      },
      disability: {
        avpu: 'P',
        gcs: { eye: 2, verbal: 2, motor: 4, total: 8 },
        pupils: 'Equal but sluggish 4mm',
        bloodGlucose: 5.4,
        findings: ['Hypoxic brain injury', 'Poor perfusion'],
        interventions: ['Monitor GCS', 'Treat hypoxia', 'Improve perfusion']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Small stab wound left parasternal, 3rd intercostal space', 'Minimal external bleeding', 'No exit wound', 'Muffled heart sounds'],
        interventions: ['Cover wound with vented chest seal (HyFin Vent / Russell / SAM) — TCCC 2022 / PHTLS 10', 'Full exposure while maintaining temperature (hypothermia prevention)', 'Log roll for spine assessment ONLY if no pelvic instability']
      }
    },
    secondarySurvey: {
      head: ['No trauma', 'Pale conjunctiva'],
      neck: ['JVD present bilaterally', 'Trachea midline', 'No subcutaneous emphysema'],
      chest: ['Muffled heart sounds', 'Equal but diminished breath sounds', 'Small entry wound 3rd ICS left parasternal'],
      abdomen: ['Soft, non-tender', 'No distension'],
      pelvis: ['Stable'],
      extremities: ['Delayed capillary refill', 'Cool to touch', 'Equal pulses but weak', 'No peripheral oedema'],
      posterior: ['No posterior chest wounds', 'Spine non-tender'],
      neurological: ['GCS 8 (E2, V2, M4)', 'No focal deficits prior to hypoxic injury']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Unknown',
      eventsLeading: 'Police report indicates patient was stabbed during altercation. Weapon believed to be small knife.',
      socialHistory: {
        smoking: 'Unknown',
        alcohol: 'Unknown',
        occupation: 'Unknown'
      }
    },
    investigations: [
      { name: '12-lead ECG', indication: 'Cardiac tamponade suspicion', findings: 'Sinus tachycardia, low voltage QRS, possible electrical alternans', interpretation: 'Cardiac tamponade until proven otherwise', urgency: 'immediate' },
      { name: 'Portable CXR', indication: 'Rule out pneumothorax/hemothorax', findings: 'Possible enlarged cardiac silhouette, clear lung fields (if obtainable)', interpretation: 'Supports tamponade diagnosis', urgency: 'urgent' },
      { name: 'FAST scan', indication: 'Assess for pericardial fluid', findings: 'Pericardial effusion present with right ventricular collapse during diastole', interpretation: 'Cardiac tamponade confirmed', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '70/50', pulse: 140, respiration: 32, spo2: 88, gcs: 8, bloodGlucose: 5.4 },
      afterIntervention: { bp: '100/68', pulse: 100, respiration: 24, spo2: 98, gcs: 9 },
      deterioration: { bp: '50/30', pulse: 160, respiration: 8, spo2: 75, gcs: 3 }
    },
    expectedFindings: {
      keyObservations: [
        'Beck\'s Triad: Hypotension, JVD, Muffled heart sounds',
        'Penetrating wound near heart (precordial region)',
        'Signs of shock: tachycardia, poor perfusion, altered mental status',
        'Pulsus paradoxus: >10mmHg drop in BP during inspiration'
      ],
      redFlags: [
        'Cardiac tamponade - clinical diagnosis, DO NOT wait for confirmation',
        'Patient rapidly deteriorating toward cardiac arrest',
        'Possible cardiac injury based on wound location',
        'Pulsus paradoxus present'
      ],
      differentialDiagnoses: [
        'Cardiac tamponade',
        'Tension pneumothorax',
        'Massive hemothorax',
        'Combined cardiac and pulmonary injury',
        'Vasovagal response with minor injury'
      ],
      mostLikelyDiagnosis: 'Cardiac Tamponade secondary to penetrating chest trauma',
      supportingEvidence: [
        'Precordial stab wound',
        'Classic Beck\'s triad (hypotension, JVD, muffled heart sounds)',
        'Severe hemodynamic compromise',
        'Poor response to initial fluid resuscitation'
      ]
    },
    managementPathway: {
      immediate: [
        'ABC approach with cervical spine protection',
        'High-flow oxygen',
        '2x large-bore IV access',
        'Aggressive fluid resuscitation (NS or blood products)',
        'Consider pericardiocentesis if patient deteriorating',
        'Prepare for emergency thoracotomy',
        'Rapid transport to trauma center'
      ],
      definitive: [
        'Emergency department thoracotomy',
        'Pericardial window',
        'Repair of cardiac injury',
        'Blood product resuscitation',
        'Exploratory surgery for associated injuries'
      ],
      monitoring: [
        'Continuous ECG monitoring',
        'Frequent vital signs (every 2-3 minutes)',
        'GCS monitoring',
        'Urine output if catheterized'
      ],
      transportConsiderations: [
        'Pre-alert trauma center',
        'Consider HEMS if prolonged transport',
        'Have blood products available',
        'Prepare for en route deterioration'
      ]
    },
    studentChecklist: [
      // ABCDE Assessment
      {
        id: 't1-1',
        category: 'abcde',
        description: 'Recognize Beck\'s triad (hypotension, JVD, muffled heart sounds)',
        points: 25,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        timeframe: 'Within 2 minutes',
        rationale: 'Beck\'s triad is the classic presentation of cardiac tamponade. Recognition is lifesaving.',
        commonErrors: ['Not listening for heart sounds', 'Missing JVD in hypotensive patient', 'Forgetting that all three signs may not be present'],
        hints: ['Muffled heart sounds are difficult to hear in noisy environments - listen carefully', 'JVD may be absent with hypovolemia'],
      },
      {
        id: 't1-2',
        category: 'abcde',
        description: 'Assess for pulsus paradoxus (>10mmHg drop on inspiration)',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        timeframe: 'During circulation assessment',
        rationale: 'Pulsus paradoxus is highly specific for cardiac tamponade and helps confirm diagnosis.',
        commonErrors: ['Not checking for pulsus paradoxus', 'Incorrect measurement technique', 'Not using manual BP if automated not available'],
        details: ['Take BP manually', 'Note pressure on expiration', 'Note pressure on inspiration', 'Difference >10mmHg is significant'],
      },
      {
        id: 't1-3',
        category: 'abcde',
        description: 'Establish cervical spine protection in penetrating trauma',
        points: 10,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Penetrating trauma can cause spinal injury. C-spine protection is mandatory.',
        commonErrors: ['Forgetting C-spine in penetrating trauma', 'Improper collar placement'],
      },
      {
        id: 't1-4',
        category: 'intervention',
        description: 'Small-volume fluid challenge (250mL warmed Hartmann\'s or blood) titrated to radial pulse — permissive hypotension target SBP 80-90 mmHg (no TBI)',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        timeframe: 'Immediately',
        rationale: 'Penetrating trauma with tamponade physiology: small aliquots titrated to perfusion temporarily improve preload while arranging definitive care. Large crystalloid volumes (1L+ boluses) worsen tamponade, cause dilutional coagulopathy, and increase mortality (CRASH-2, NICE NG39, JRCALC 2024). Blood products preferred as soon as available via MHP.',
        commonErrors: ['Large crystalloid boluses (1L+) without perfusion reassessment', 'Chasing normal BP instead of permissive target', 'Using 0.9% NaCl in volume (hyperchloraemic acidosis) — Hartmann\'s preferred', 'Not activating Major Haemorrhage Protocol for blood'],
        details: ['14G or 16G x2 catheters', '250mL Hartmann\'s aliquots — reassess after each', 'Target SBP 80-90 / palpable radial pulse / preserved mentation', 'Activate MHP for 1:1:1 FFP:plt:RBC early', 'TXA 1g IV slow push over 10 min within 3h of injury (CRASH-2)'],
      },
      {
        id: 't1-5',
        category: 'intervention',
        description: 'Consider needle pericardiocentesis if patient deteriorating',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        timeframe: 'If signs of cardiac tamponade with deterioration',
        rationale: 'Pericardiocentesis can be lifesaving when transport is delayed or patient is rapidly deteriorating.',
        commonErrors: ['Incorrect needle placement (too medial)', 'Using needle too short', 'Not using ECG guidance if available', 'Delaying too long'],
        details: ['Insert at left xiphocostal angle', 'Aim toward left shoulder', 'Use 18G 7cm spinal needle minimum', 'Aspirate while advancing', 'Listen for rush of air'],
      },
      {
        id: 't1-6',
        category: 'procedural',
        description: 'Apply vented chest seal (HyFin Vent / Russell / SAM) for open chest wound',
        points: 10,
        yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Current TCCC 2022 / PHTLS 10 standard is a commercial VENTED chest seal, which reliably vents air out while preventing re-entry. The improvised 3-sided taped dressing is no longer first-line (fails in wet/bloody environments, frequently becomes fully occlusive in practice). If only non-vented seal is available, monitor for tension and be ready to burp or needle-decompress.',
        commonErrors: ['Applying a fully occlusive non-vented seal without monitoring for tension', 'Not cleaning/drying skin before adhesion', 'Missing the exit wound (always look for second hole)'],
        details: ['Preferred: commercial vented chest seal (HyFin Vent, Russell, SAM)', 'Clean and dry skin before application', 'Cover both entry AND exit wounds', 'Reassess for tension pneumothorax every 5 min — be ready to burp the seal or needle-decompress'],
      },
      {
        id: 't1-7',
        category: 'communication',
        description: 'Pre-alert trauma center for possible emergency thoracotomy',
        points: 15,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Early notification allows trauma team to prepare for emergency department thoracotomy, saving critical time.',
        commonErrors: ['Not pre-alerting', 'Not providing sufficient detail', 'Underestimating severity'],
        details: ['Communicate suspected cardiac tamponade', 'Mention penetrating mechanism', 'Give current vitals', 'Provide ETA'],
      },
      {
        id: 't1-8',
        category: 'documentation',
        description: 'Document mechanism of injury and wound characteristics',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'],
        complexity: ['basic', 'intermediate', 'advanced', 'expert'],
        rationale: 'Accurate documentation helps trauma team understand injury and plan interventions.',
        commonErrors: ['Not documenting wound location', 'Not describing weapon if known', 'Not estimating time of injury']
      },
      { id: 't1-airway', category: 'intervention', description: 'Secure airway for GCS ≤8 (LMA/i-gel for 3rd-year; RSI for 4th-year)', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true }
    ],
    teachingPoints: [
      'Cardiac tamponade is a clinical diagnosis - DO NOT wait for imaging confirmation',
      'Beck\'s Triad: Hypotension, JVD, Muffled heart sounds - remember that all three may not be present!',
      'Pulsus paradoxus >10mmHg is highly specific for cardiac tamponade',
      'Electrical alternans on ECG is pathognomonic but not always present',
      'Fluid resuscitation increases preload to compensate for reduced cardiac output',
      'Needle pericardiocentesis is temporizing - definitive treatment is surgical drainage',
      'Consider ALL stabs in the "cardiac box" (sternal borders to nipples, below clavicles) as potential cardiac injuries',
      'Cardiac box: superior border = clavicles, inferior = costal margins, lateral = nipples',
      'Patients with tamponade may deteriorate rapidly - be prepared for cardiac arrest',
      'Emergency department thoracotomy may be indicated for penetrating trauma with loss of vital signs'
    ],
    commonPitfalls: [
      'Delaying treatment while waiting for imaging confirmation',
      'Missing the diagnosis because Beck\'s triad is incomplete',
      'Not recognizing that muffled heart sounds are difficult to hear in noisy environments',
      'Forgetting that JVD may be absent if patient is also hypovolemic',
      'Using under-resuscitation (small volumes slowly)',
      'Placing occlusive dressing on all sides (can cause tension pneumothorax)',
      'Not considering emergency department thoracotomy in deteriorating patients',
      'Missing that "normal" FAST does NOT rule out cardiac injury (may be clotted hematoma)',
      'Not pre-alerting receiving hospital appropriately',
      'Focusing on the wound and missing the hemodynamic assessment'
    ],
    references: [
      'ATLS 10th Edition - Chest Trauma',
      'ACS Trauma Guidelines',
      'Eastern Association for the Surgery of Trauma (EAST) Guidelines',
      'Life in the Fast Lane - Cardiac Tamponade'
    ],
    equipmentNeeded: [
      '14G or 16G IV catheters x4 (large bore access)',
      'Normal saline 1L bags x4 (aggressive resuscitation)',
      'Oxygen 15L/min via non-rebreather mask',
      'OPA/NPA airway adjuncts',
      'Suction unit with Yankauer catheter',
      'Vaseline gauze or occlusive dressing (3-sided)',
      '18G 7cm spinal needle (for pericardiocentesis)',
      '10-20mL syringe',
      'ECG monitor with 12-lead capability',
      'Blood pressure cuff (manual for pulsus paradoxus)',
      'Rigid cervical collar and spinal board',
      'Thermal blanket',
      'Blood products if available (O-negative emergency release)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Trauma Protocols - Penetrating Chest Trauma',
        'PHTLS 9th Edition - Thoracic Trauma',
        'ATLS 10th Edition - Chest Trauma',
        'American College of Surgeons Committee on Trauma Guidelines'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Trauma Center',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Level I Trauma Center', '24/7 Cardiothoracic Surgery', 'Emergency Department Thoracotomy', 'Blood Bank', 'CT/MRI'],
          contact: 'Emergency: 800 342',
          distance: '15-20 minutes from Downtown Dubai'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Trauma Center', 'General Surgery', 'ICU'],
          contact: 'Emergency: 800 342',
          distance: '20-25 minutes'
        },
        {
          name: 'Cleveland Clinic Abu Dhabi',
          location: 'Al Maryah Island, Abu Dhabi',
          capabilities: ['Level I Trauma Center', 'Cardiothoracic Surgery', 'Advanced Imaging'],
          contact: 'Emergency: 800 8 2223',
          distance: '90-120 minutes from Dubai'
        }
      ],
      localConsiderations: [
        'Dubai Police must secure scene before EMS entry - expect scene delays',
        'High incidence of penetrating trauma in urban areas during evening/night hours',
        'Language barriers common with diverse expatriate population',
        'Hot climate requires aggressive temperature management',
        'Ambulance transport times may be affected by traffic congestion on Sheikh Zayed Road',
        'Cultural considerations: may need same-gender providers for some patients',
        'Ramadan considerations: altered eating schedules may affect gastric emptying',
        'Construction worker populations have higher trauma exposure'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-tamponade-001',
          type: 'image',
          title: 'Beck\'s Triad Clinical Presentation',
          url: 'https://radiopaedia.org/cases/beck-triad-cardiac-tamponade',
          source: 'Radiopaedia',
          caption: 'Classic Beck\'s Triad: Hypotension, JVD, and muffled heart sounds in cardiac tamponade',
          relevance: 'essential',
          tags: ['cardiac tamponade', 'Becks triad', 'clinical signs']
        },
        {
          id: 'img-tamponade-002',
          type: 'image',
          title: 'Cardiac Tamponade ECG Findings',
          url: 'https://www.wikiem.org/wiki/Cardiac_tamponade',
          source: 'WikEM',
          caption: 'ECG findings in pericardial effusion with tamponade including low voltage and electrical alternans',
          relevance: 'essential',
          tags: ['cardiac tamponade', 'pathophysiology', 'ECG']
        },
        {
          id: 'img-tamponade-003',
          type: 'image',
          title: 'Pericardiocentesis Procedure',
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Pericardiocentesis.jpg/640px-Pericardiocentesis.jpg',
          source: 'Wikimedia Commons',
          caption: 'Subxiphoid approach for emergency pericardiocentesis',
          relevance: 'important',
          tags: ['pericardiocentesis', 'procedure', 'subxiphoid']
        }
      ],
      videos: [
        {
          id: 'video-tamponade-001',
          type: 'video',
          title: 'Cardiac Tamponade - Recognition and Management',
          url: 'https://www.youtube.com/watch?v=d-ALzW6NcW0',
          source: 'The Center for Medical Education',
          caption: 'Scott Weingart discusses cardiac tamponade recognition and emergency management',
          duration: '18:45',
          relevance: 'essential',
          tags: ['cardiac tamponade', 'emergency', 'pericardiocentesis']
        },
        {
          id: 'video-tamponade-002',
          type: 'video',
          title: 'Pericardiocentesis - Bedside Ultrasound Guided',
          url: 'https://www.youtube.com/watch?v=co9_RLN78IY',
          source: 'Larry B. Mellick, MD',
          caption: 'Ultrasound-guided pericardiocentesis technique',
          duration: '6:32',
          relevance: 'essential',
          tags: ['pericardiocentesis', 'ultrasound', 'POCUS']
        },
        {
          id: 'video-tamponade-003',
          type: 'video',
          title: 'Cardiac Tamponade - Pathophysiology and Treatment',
          url: 'https://www.youtube.com/watch?v=1AlFaLuuPVs',
          source: 'PrepMedic',
          caption: 'Detailed pathophysiology of cardiac tamponade with clinical correlations',
          duration: '22:10',
          relevance: 'important',
          tags: ['cardiac tamponade', 'pathophysiology', 'treatment']
        },
        {
          id: 'video-tamponade-004',
          type: 'video',
          title: 'Electrical Alternans in Cardiac Tamponade',
          url: 'https://www.youtube.com/watch?v=1KLRv_YGNMI',
          source: 'CU Basic Emergency Care',
          caption: 'ECG findings in pericardial effusion and tamponade explained clearly',
          duration: '4:15',
          relevance: 'important',
          tags: ['ECG', 'electrical alternans', 'tamponade']
        }
      ],
      articles: [
        {
          id: 'art-tamponade-001',
          type: 'article',
          title: 'Cardiac Tamponade - Life in the Fast Lane',
          url: 'https://litfl.com/cardiac-tamponade/',
          source: 'LITFL',
          caption: 'Comprehensive review of cardiac tamponade pathophysiology and management',
          relevance: 'essential',
          tags: ['cardiac tamponade', 'review', 'ATLS']
        },
        {
          id: 'art-tamponade-002',
          type: 'article',
          title: 'Pericardial Effusion and Tamponade - AHA Guidelines',
          url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000611',
          source: 'American Heart Association',
          caption: 'AHA scientific statement on pericardial diseases including tamponade management',
          relevance: 'essential',
          tags: ['tamponade', 'pericardial effusion', 'AHA', 'guidelines']
        },
        {
          id: 'art-tamponade-003',
          type: 'article',
          title: 'Emergency Pericardiocentesis',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK470382/',
          source: 'StatPearls',
          caption: 'Emergency pericardiocentesis procedure and indications',
          relevance: 'essential',
          tags: ['pericardiocentesis', 'procedure', 'emergency']
        }
      ],
      procedures: [
        {
          id: 'proc-tamponade-001',
          type: 'case-study',
          title: 'Emergency Pericardiocentesis - Subxiphoid Approach',
          url: 'https://www.resus.org.uk/library/additional-guidance/pericardiocentesis',
          source: 'Resuscitation Council UK',
          caption: 'Step-by-step guide to emergency pericardiocentesis with ultrasound guidance',
          relevance: 'essential',
          tags: ['pericardiocentesis', 'procedure', 'subxiphoid', 'RCUK']
        }
      ]
    }
  }),

  // Tension Pneumothorax with Flail Chest
  createCase({
    id: 'trauma-005',
    title: 'Blunt Chest Trauma - Tension Pneumothorax with Flail Chest',
    category: 'trauma',
    subcategory: 'chest-trauma',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 35,
    dispatchInfo: {
      callReason: 'MVC - driver trapped, chest injury, difficulty breathing',
      timeOfDay: 'afternoon',
      location: 'Sheikh Zayed Road, Dubai',
      callerInfo: 'Police on scene',
      dispatchCode: 'Echo-1',
      additionalInfo: ['High-speed collision', 'Car vs barrier at ~100km/h', 'Driver trapped', 'Fire department en route for extrication']
    },
    patientInfo: {
      age: 28,
      gender: 'male',
      weight: 80,
      occupation: 'Delivery driver',
      language: 'English, Hindi'
    },
    sceneInfo: {
      description: 'Vehicle with significant front-end damage, driver pinned by steering wheel',
      hazards: ['Fuel leak', 'Risk of vehicle fire', 'Unstable vehicle', 'Glass and debris'],
      bystanders: 'Police and fire personnel on scene',
      environment: 'Hot day, asphalt road',
      environmentVariant: 'roadside',
      sceneImagePath: '/scene-assets/trauma-005-trapped-driver-flail-chest.png',
      sceneImageCaption: 'Scene — Hot day, asphalt road',
      accessIssues: ['Patient trapped', 'Extrication required'],
      extricationNeeded: true
    },
    initialPresentation: {
      generalImpression: 'Young male, in respiratory distress, chest wall deformity visible',
      position: 'Sitting (leaning forward)',
      appearance: 'Diaphoretic, cyanotic, anxious, using accessory muscles',
      consciousness: 'Alert but distressed',
      sounds: ['Diminished breath sounds on right', 'Stridor audible']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but compromised by respiratory distress', 'Patient able to speak in 1-2 word sentences'],
        interventions: ['Keep patient in sitting position', 'Prepare for possible intubation'],
        adjunctsNeeded: ['Have suction ready', 'Prepare advanced airway']
      },
      breathing: {
        rate: 36,
        rhythm: 'Labored',
        depth: 'Shallow',
        spo2: 85,
        findings: [
          'Severe tachypnea',
          'Absent breath sounds on right side',
          'Tracheal deviation to left',
          'Hyperresonance to percussion on right',
          'Flail segment visible on right anterior chest (ribs 3-5)',
          'Paradoxical chest wall movement'
        ],
        interventions: [
          'IMMEDIATE needle decompression right side 2nd ICS midclavicular',
          'High-flow oxygen 15L/min non-rebreather',
          'Consider finger thoracostomy if trained',
          'Prepare chest tube after decompression'
        ],
        auscultation: ['Absent breath sounds right lung', 'Diminished but present left lung'],
        percussion: ['Hyperresonant right side', 'Resonant left side']
      },
      circulation: {
        pulseRate: 145,
        pulseQuality: 'Thready but palpable radially',
        bp: { systolic: 85, diastolic: 60 },
        capillaryRefill: 4,
        skin: 'Pale, cool, diaphoretic',
        findings: [
          'Severe tachycardia',
          'Hypotensive',
          'JVD bilaterally elevated (impaired RV filling from rising intrathoracic pressure)',
          'Delayed capillary refill'
        ],
        interventions: [
          'IV access x2 large bore',
          'Fluid bolus NS 500mL',
          'Prepare blood products',
          'Continue fluids judiciously (avoid overload)'
        ],
        ecgFindings: ['Sinus tachycardia', 'Possible ST depression from hypoxia'],
        ivAccess: ['16G left AC fossa', '16G right AC fossa']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal 4mm, reactive',
        findings: ['Anxious', 'Verbal responses limited due to dyspnea'],
        interventions: ['Monitor GCS for deterioration', 'Consider head injury']
      },
      exposure: {
        temperature: 36.8,
        findings: [
          'Flail segment right anterior chest ribs 3-5 (fractured in ≥2 places)',
          'Paradoxical movement of flail segment',
          'Chest wall abrasion from seatbelt',
          'No obvious external bleeding',
          'Possible steering wheel imprint on chest'
        ],
        interventions: [
          'Stabilize flail segment with padding or hand',
          'Full spinal precautions',
          'Maintain body temperature',
          'Log roll when possible for full assessment'
        ],
        deformities: ['Flail segment right chest 3-5th ribs', 'Possible sternum fracture']
      }
    },
    secondarySurvey: {
      head: ['No obvious trauma', 'Helmet not worn (not applicable)'],
      neck: ['Bilateral JVD elevated (impaired venous return from rising intrathoracic pressure)', 'Trachea deviated to LEFT (mediastinal shift away from right tension)', 'C-spine tenderness - cannot fully assess until extricated'],
      chest: [
        'Flail segment right anterior ribs 3-5',
        'Paradoxical movement',
        'Chest wall crepitus',
        'Seatbelt sign across chest',
        'Absent breath sounds right',
        'Possible sternum fracture'
      ],
      abdomen: ['Difficult to assess due to position', 'No obvious distension', 'Seatbelt across abdomen - high risk for injury'],
      pelvis: ['Stable', 'No tenderness'],
      extremities: ['Possible fractured right femur (pain on movement)', 'Left ankle swollen — traumatic swelling', 'No peripheral oedema'],
      posterior: ['Unable to fully assess until extricated'],
      neurological: ['GCS 14 (E4, V4, M6)', 'No obvious focal deficits', 'Moving all extremities (painful right femur)']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Lunch approximately 2 hours ago',
      eventsLeading: 'High-speed MVC. Patient was restrained driver. Vehicle collided with concrete barrier at approximately 100km/h. Airbag deployed. Patient remained conscious throughout.',
      socialHistory: {
        smoking: 'Unknown',
        alcohol: 'Unknown',
        occupation: 'Delivery driver'
      }
    },
    investigations: [
      { name: 'Chest X-ray', indication: 'After stabilization', findings: 'Large right pneumothorax with mediastinal shift to left, multiple rib fractures right 3-5', interpretation: 'Tension pneumothorax', urgency: 'routine' },
      { name: 'FAST scan', indication: 'During primary survey', findings: 'Cannot assess adequately due to subcutaneous air and pneumothorax', interpretation: 'Limited study - proceed with clinical diagnosis', urgency: 'urgent' },
      { name: 'Pelvis X-ray', indication: 'Rule out pelvic fracture', findings: 'To be obtained', interpretation: 'Pending', urgency: 'routine' }
    ],
    vitalSignsProgression: {
      initial: { bp: '85/60', pulse: 145, respiration: 36, spo2: 85, gcs: 14 },
      afterIntervention: { bp: '100/70', pulse: 125, respiration: 28, spo2: 94, gcs: 15 },
      deterioration: { bp: '60/40', pulse: 160, respiration: 8, spo2: 70, gcs: 8 }
    },
    expectedFindings: {
      keyObservations: [
        'Absent breath sounds on right side',
        'Tracheal deviation to LEFT (away from affected side)',
        'Hyperresonance on right percussion',
        'JVD bilaterally elevated (impaired RV filling from rising intrathoracic pressure — both jugulars distend, not just the contralateral one)',
        'Flail segment right anterior chest ribs 3-5',
        'Paradoxical chest wall movement',
        'Severe respiratory distress',
        'Hemodynamic compromise'
      ],
      redFlags: [
        'Tension pneumothorax - clinical diagnosis, decompress immediately!',
        'Tracheal deviation is LATE sign - do not wait for it!',
        'Flail chest indicates severe chest wall trauma',
        'Possible underlying pulmonary contusion',
        'High risk of deterioration during extrication'
      ],
      differentialDiagnoses: [
        'Tension pneumothorax',
        'Massive hemothorax',
        'Cardiac tamponade (also possible with blunt trauma)',
        'Flail chest without tension pneumothorax',
        'Combined injuries'
      ],
      mostLikelyDiagnosis: 'Right-sided Tension Pneumothorax with Flail Chest',
      supportingEvidence: [
        'Absent breath sounds right side',
        'Tracheal deviation to left',
        'Hyperresonance right side',
        'Hemodynamic compromise',
        'Flail segment visible on right chest',
        'Mechanism consistent with severe blunt trauma'
      ]
    },
    managementPathway: {
      immediate: [
        'IMMEDIATE needle decompression right 2nd ICS midclavicular',
        'High-flow oxygen 15L/min',
        'IV access x2',
        'Fluid resuscitation',
        'Consider finger thoracostomy if needle fails',
        'Coordinate with fire department for safe extrication'
      ],
      definitive: [
        'Chest tube insertion (36-40F) after decompression',
        'Analgesia for flail chest (consider regional blocks)',
        'Possible surgical rib fixation for severe flail',
        'Mechanical ventilation if respiratory failure develops',
        'Treat associated injuries (possible femur fracture)'
      ],
      monitoring: [
        'Continuous SpO2 monitoring',
        'Frequent vital signs',
        'Breath sounds bilaterally after interventions',
        'GCS monitoring',
        'Watch for re-tension pneumothorax'
      ],
      transportConsiderations: [
        'Pre-alert trauma center',
        'Consider HEMS given severity and distance',
        'Have chest tube equipment available',
        'Be prepared for deterioration during transport'
      ]
    },
    studentChecklist: [
      {
        id: 't2-1',
        category: 'abcde',
        description: 'Recognize tension pneumothorax - CLINICAL DIAGNOSIS',
        points: 30,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        timeframe: 'Within 1 minute of assessment',
        rationale: 'Tension pneumothorax kills within minutes. DO NOT wait for imaging. Clinical diagnosis is sufficient.',
        commonErrors: ['Waiting for X-ray confirmation', 'Missing the diagnosis in noisy environments', 'Confusing with simple pneumothorax'],
        details: [
          'Absent or decreased breath sounds on affected side',
          'Hyperresonance to percussion',
          'Tracheal deviation AWAY from affected side (LATE sign)',
          'JVD may be present',
          'Hemodynamic compromise'
        ],
      },
      {
        id: 't2-2',
        category: 'intervention',
        description: 'Perform immediate needle decompression (2nd ICS, midclavicular)',
        points: 30,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        timeframe: 'IMMEDIATELY upon recognition',
        rationale: 'Needle decompression is lifesaving. Delay can result in cardiac arrest and death.',
        commonErrors: [
          'Wrong location (too medial - can hit great vessels!',
          'Needle too short (must reach pleural space)',
          'Not advancing needle far enough',
          'Not listening for rush of air'
        ],
        details: [
          'PREFERRED location: 4th-5th intercostal space, anterior-to-mid axillary line on affected side (TCCC 2022). 2nd ICS midclavicular is a valid alternate but fails in >30% of adults due to chest-wall thickness and carries higher great-vessel injury risk.',
          'Use 14G x 8cm catheter (5cm catheters fail in ~1/3 of adults)',
          'Insert perpendicular to chest wall',
          'Aim toward lateral aspect of rib (avoid neurovascular bundle)',
          'Listen for rush of air',
          'Leave catheter in place'
        ],
      },
      {
        id: 't2-3',
        category: 'intervention',
        description: 'Consider finger thoracostomy if needle decompression unsuccessful',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Finger thoracostomy is more reliable than needle decompression and should be considered if trained and needle fails.',
        commonErrors: ['Not knowing this technique', 'Insertion in wrong location', 'Inadequate incision'],
        details: [
          'Alternative location: 4th-5th ICS, anterior axillary line',
          'Make 2-3cm incision',
          'Blunt dissect to pleura',
          'Insert finger to confirm position',
          'More reliable than needle'
        ],
      },
      {
        id: 't2-4',
        category: 'abcde',
        description: 'Assess for flail chest and paradoxical movement',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Flail chest indicates severe trauma and is associated with underlying pulmonary contusion.',
        commonErrors: ['Missing the diagnosis', 'Confusing with simple rib fractures'],
        details: [
          'Flail = 3+ ribs fractured in 2+ places',
          'Look for paradoxical movement (moves in during inspiration)',
          'Stabilize segment with manual pressure or pillow',
          'Assess for underlying lung injury'
        ],
      },
      {
        id: 't2-5',
        category: 'intervention',
        description: 'Provide appropriate analgesia for flail chest',
        points: 10,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        rationale: 'Pain control is essential for adequate ventilation and prevents atelectasis.',
        commonErrors: ['Under-treating pain', 'Fear of respiratory depression', 'Not considering regional techniques'],
        details: [
          'Multimodal analgesia preferred',
          'Consider nerve blocks if available',
          'Avoid excessive sedation that compromises respiratory drive',
          'Goal: adequate ventilation with pain control'
        ],
      },
      {
        id: 't2-6',
        category: 'abcde',
        description: 'Assess for associated injuries (abdominal, pelvic, long bones)',
        points: 10,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'High-energy trauma often causes multiple injuries. Don\'t get distracted by the obvious chest injury.',
        commonErrors: ['Focusing only on chest injury', 'Missing abdominal injuries from seatbelt', 'Not checking for long bone fractures'],
        details: [
          'Seatbelt sign = high risk for abdominal injury',
          'Check for pelvic instability',
          'Assess all long bones for fractures',
          'Log roll when possible for full assessment'
        ],
      },
      {
        id: 't2-7',
        category: 'communication',
        description: 'Coordinate with fire department for safe extrication',
        points: 10,
        yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Unsafe extrication can worsen injuries, especially spinal. Coordination is essential.',
        commonErrors: ['Rushing extrication', 'Not maintaining spinal precautions', 'Not communicating medical needs to extraction team']
      },
      {
        id: 't2-8',
        category: 'documentation',
        description: 'Document mechanism of injury and time to decompression',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'],
        complexity: ['basic', 'intermediate', 'advanced', 'expert'],
        rationale: 'Documentation helps trauma team understand timing and severity.',
        commonErrors: ['Not documenting exact time of decompression', 'Vague mechanism description']
      }
    ],
    teachingPoints: [
      'Tension pneumothorax is a clinical diagnosis - DO NOT wait for imaging!',
      'Classic signs: absent breath sounds, hyperresonance, tracheal deviation AWAY from affected side',
      'Tracheal deviation is a LATE sign - do not wait for it to appear!',
      'Needle decompression location: 2nd ICS, midclavicular line on affected side',
      'Use large bore needle (14-16G) at least 5cm long - standard angiocatheters may be too short!',
      'Alternative site: 4th-5th ICS anterior axillary line (may be easier in some patients)',
      'Listen for rush of air after decompression - confirms successful decompression',
      'Flail chest: 3+ ribs fractured in 2+ places creates free-floating segment',
      'Paradoxical movement: flail segment moves IN during inspiration (opposite normal)',
      'Pain control for flail chest is essential - prevents atelectasis and improves ventilation',
      'Pulmonary contusion is the main cause of mortality in flail chest, not the rib fractures themselves',
      'Consider bilateral tension pneumothorax in blunt trauma, especially if patient was intubated/ventilated',
      'Watch for re-tension pneumothorax after needle decompression - chest tube is definitive treatment',
      'Seatbelt sign = high risk for serious intra-abdominal injury (hollow organ rupture, bowel/mesenteric injury)'
    ],
    commonPitfalls: [
      'Waiting for X-ray confirmation before decompressing',
      'Using needle that is too short (doesn\'t reach pleural space)',
      'Placing needle too medially (risk of great vessel injury)',
      'Not listening for rush of air (how do you know it worked?)',
      'Missing associated injuries while focusing on chest',
      'Forgetting that tracheal deviation is LATE',
      'Not recognizing flail chest as an indicator of severe trauma',
      'Under-treating pain in flail chest',
      'Failing to reassess after interventions',
      'Not considering bilateral tension pneumothorax',
      'Missing that seatbelt sign equals abdominal injury until proven otherwise'
    ],
    references: [
      'ATLS 10th Edition - Chest Trauma',
      'Eastern Association for the Surgery of Trauma (EAST) Guidelines',
      'Life in the Fast Lane - Tension Pneumothorax',
      'JRCALC Clinical Guidelines 2019'
    ],
    equipmentNeeded: [
      '14G 7cm angiocatheter or needle decompression kit (tension pneumothorax)',
      'Chest tube 36-40F with drainage system',
      'Occlusive dressing/Vaseline gauze (3-sided)',
      'Oxygen 15L/min via non-rebreather or BVM',
      'IV access 14-16G x2',
      'Normal saline 1L bags x4',
      'Suction unit with Yankauer catheter',
      'Rigid cervical collar and spinal board',
      'Pillow/blanket for flail segment stabilization',
      'Analgesics (morphine/fentanyl/ketamine)',
      'Intubation equipment (RSI kit) (4th-year only)',
      'ECG monitor',
      'Blood pressure cuff',
      'Thoracostomy tray (if trained)',
      'Chest seal (vented or non-vented)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Trauma Protocols - Chest Trauma',
        'PHTLS 9th Edition - Thoracic Trauma',
        'ATLS 10th Edition - Chest Trauma',
        'TCCC Guidelines - Thoracic Trauma'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Trauma Center',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Level I Trauma Center', '24/7 Thoracic Surgery', 'Chest Tube Insertion', 'OR Available', 'ICU'],
          contact: 'Emergency: 800 342',
          distance: '15-20 minutes from Sheikh Zayed Road incidents'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Trauma Center', 'General Surgery', 'ICU'],
          contact: 'Emergency: 800 1999',
          distance: '10-15 minutes'
        }
      ],
      localConsiderations: [
        'Sheikh Zayed Road has high-speed MVCs with severe mechanisms',
        'Extrication delays common - may need early needle decompression while trapped',
        'Summer temperatures >45°C cause rapid heat stress - aggressive cooling needed',
        'Dubai has high proportion of construction workers - MVC injuries common',
        'Ambulance response times may be delayed during rush hour (7-9am, 5-8pm)',
        'Helicopter EMS available from Rashid Hospital for remote locations',
        'Language barriers with South Asian construction workforce common',
        'Seatbelt use increasing but still variable among certain populations'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-tension-001',
          type: 'image',
          title: 'Tension Pneumothorax Clinical Signs',
          url: 'https://radiopaedia.org/articles/tension-pneumothorax',
          source: 'Radiopaedia',
          caption: 'Progressive respiratory and hemodynamic compromise in tension pneumothorax with imaging',
          relevance: 'essential',
          tags: ['tension pneumothorax', 'clinical signs', 'thoracic trauma']
        },
        {
          id: 'img-flail-001',
          type: 'image',
          title: 'Flail Chest with Paradoxical Movement',
          url: 'https://radiopaedia.org/cases/flail-chest',
          source: 'Radiopaedia',
          caption: 'Flail chest showing paradoxical inward movement during inspiration',
          relevance: 'essential',
          tags: ['flail chest', 'rib fractures', 'paradoxical movement']
        },
        {
          id: 'img-needle-001',
          type: 'image',
          title: 'Needle Decompression Landmarks',
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Needle_decompression_sites.jpg/640px-Needle_decompression_sites.jpg',
          source: 'Wikimedia Commons',
          caption: 'Anatomical landmarks for needle decompression - 2nd ICS midclavicular and 4th-5th ICS anterior axillary',
          relevance: 'essential',
          tags: ['needle decompression', 'anatomy', 'thoracostomy']
        }
      ],
      videos: [
        {
          id: 'video-tension-001',
          type: 'video',
          title: 'Needle Decompression - Emergency Procedure',
          url: 'https://www.youtube.com/watch?v=d-ALzW6NcW0',
          source: 'The Center for Medical Education',
          caption: 'Scott Weingart demonstrates proper needle decompression technique',
          duration: '12:30',
          relevance: 'essential',
          tags: ['needle decompression', 'tension pneumothorax', 'emergency']
        },
        {
          id: 'video-tension-002',
          type: 'video',
          title: 'Tension Pneumothorax - Pathophysiology Explained',
          url: 'https://www.youtube.com/watch?v=co9_RLN78IY',
          source: 'Larry B. Mellick, MD',
          caption: 'Comprehensive pathophysiology of tension pneumothorax with animations',
          duration: '18:45',
          relevance: 'essential',
          tags: ['tension pneumothorax', 'pathophysiology', 'management']
        },
        {
          id: 'video-flail-001',
          type: 'video',
          title: 'Flail Chest Management',
          url: 'https://www.youtube.com/watch?v=1AlFaLuuPVs',
          source: 'PrepMedic',
          caption: 'Management of flail chest including pain control and ventilation strategies',
          duration: '11:20',
          relevance: 'important',
          tags: ['flail chest', 'pain management', 'ventilation']
        },
        {
          id: 'video-chesttube-001',
          type: 'video',
          title: 'Chest Tube Insertion Technique',
          url: 'https://www.youtube.com/watch?v=1KLRv_YGNMI',
          source: 'CU Basic Emergency Care',
          caption: 'Step-by-step chest tube insertion for trauma',
          duration: '7:15',
          relevance: 'essential',
          tags: ['chest tube', 'thoracostomy', 'procedure']
        }
      ],
      articles: [
        {
          id: 'art-tension-001',
          type: 'article',
          title: 'Tension Pneumothorax - Life in the Fast Lane',
          url: 'https://litfl.com/tension-pneumothorax/',
          source: 'LITFL',
          caption: 'Comprehensive review of tension pneumothorax pathophysiology and management',
          relevance: 'essential',
          tags: ['tension pneumothorax', 'review', 'ATLS']
        },
        {
          id: 'art-flail-001',
          type: 'article',
          title: 'Flail Chest - StatPearls',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK534295/',
          source: 'StatPearls',
          caption: 'Evidence-based review of flail chest pathophysiology and management',
          relevance: 'essential',
          tags: ['flail chest', 'pulmonary contusion', 'management']
        },
        {
          id: 'art-chest-001',
          type: 'article',
          title: 'BTS Pleural Disease Guideline - Pneumothorax',
          url: 'https://www.brit-thoracic.org.uk/quality-improvement/guidelines/pleural-disease/',
          source: 'British Thoracic Society',
          caption: 'British Thoracic Society guidelines on pneumothorax management',
          relevance: 'important',
          tags: ['pneumothorax', 'BTS', 'guidelines', 'chest injury']
        },
        {
          id: 'art-chest-002',
          type: 'article',
          title: 'Tension Pneumothorax - WikEM',
          url: 'https://www.wikiem.org/wiki/Tension_pneumothorax',
          source: 'WikEM',
          caption: 'Quick reference for tension pneumothorax diagnosis and management',
          relevance: 'important',
          tags: ['tension pneumothorax', 'emergency', 'quick reference']
        }
      ],
      procedures: [
        {
          id: 'proc-needle-001',
          type: 'case-study',
          title: 'Needle Decompression Procedure',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK441885/',
          source: 'StatPearls',
          caption: 'Detailed procedural guide for needle thoracostomy decompression',
          relevance: 'essential',
          tags: ['needle decompression', 'procedure', 'thorax']
        },
        {
          id: 'proc-chesttube-001',
          type: 'case-study',
          title: 'Chest Tube Thoracostomy',
          url: 'https://litfl.com/chest-tube-thoracostomy/',
          source: 'LITFL',
          caption: 'Step-by-step guide to chest tube insertion',
          relevance: 'essential',
          tags: ['chest tube', 'thoracostomy', 'procedure']
        }
      ]
    }
  }),

  // Massive Hemothorax
  createCase({
    id: 'trauma-006',
    title: 'Massive Hemothorax - Penetrating Trauma',
    category: 'trauma',
    subcategory: 'chest-trauma',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Multiple GSW victims, one with chest wounds',
      timeOfDay: 'evening',
      location: 'Nightclub in Dubai Marina',
      callerInfo: 'Security staff',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Multiple patients', 'Scene not secure', 'Police en route', 'At least 3 victims']
    },
    patientInfo: {
      age: 26,
      gender: 'male',
      weight: 72,
      occupation: 'Unknown',
      language: 'Unknown'
    },
    sceneInfo: {
      description: 'Chaotic scene, multiple casualties',
      hazards: ['ACTIVE SHOOTER SCENE - unsafe!', 'Multiple weapons', 'Panic'],
      bystanders: 'Multiple casualties and bystanders',
      environment: 'Indoor nightclub, loud music, flashing lights',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/nightclub-stabbing-male-dubai.png',
      sceneImageCaption: 'Scene — Indoor nightclub, loud music, flashing lights',
      accessIssues: ['Scene safety - must wait for police'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Young male lying supine, rapid shallow breathing, pale',
      position: 'Supine',
      appearance: 'Pale, diaphoretic, in obvious distress',
      consciousness: 'Alert but anxious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Able to speak in full sentences initially'],
        interventions: ['Maintain airway']
      },
      breathing: {
        rate: 28,
        rhythm: 'Rapid, shallow',
        depth: 'Shallow',
        spo2: 91,
        findings: [
          'Tachypneic',
          'Diminished breath sounds on right',
          'Dullness to percussion on right',
          'Visible chest wound right lateral chest'
        ],
        interventions: [
          'Occlusive dressing for chest wound',
          'High-flow oxygen',
          'Prepare for chest tube',
          'IV access, fluid resuscitation'
        ],
        auscultation: ['Diminished right lung', 'Present left lung']
      },
      circulation: {
        pulseRate: 130,
        pulseQuality: 'Weak',
        bp: { systolic: 90, diastolic: 65 },
        capillaryRefill: 4,
        skin: 'Pale, cool, clammy',
        findings: [
          'Tachycardic',
          'Hypotensive',
          'Signs of shock',
          'Visible blood on chest'
        ],
        interventions: [
          '2x large bore IV',
          'Permissive hypotension (SBP 80-90 mmHg if no TBI) via small-volume fluid titration + early blood products',
          'Blood products if available',
          'Prepare for massive transfusion protocol'
        ],
        ecgFindings: ['Sinus tachycardia']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        findings: ['Anxious but fully oriented'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: [
          'GSW entrance wound right lateral chest, 5th intercostal space, midaxillary line',
          'No exit wound visible',
          'Moderate external bleeding',
          'No other visible wounds'
        ],
        interventions: [
          'Cover wound with occlusive dressing',
          'Full spinal precautions',
          'Log roll when safe'
        ]
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['No JVD (hypovolemic)', 'Trachea midline'],
      chest: [
        'GSW right lateral chest 5th ICS midaxillary',
        'Dullness to percussion right base',
        'Diminished breath sounds right base',
        'No chest wall crepitus'
      ],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['No obvious fractures'],
      posterior: ['No exit wound posteriorly'],
      neurological: ['Normal', 'GCS 15']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Unknown',
      eventsLeading: 'Patient was in nightclub when shooting occurred. Multiple shots fired. Patient felt impact to right chest.'
    },
    investigations: [
      { name: 'Chest tube output', indication: 'Place chest tube', findings: 'Initial output 1800mL blood', interpretation: 'MASSIVE hemothorax - requires thoracotomy', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '90/65', pulse: 130, respiration: 28, spo2: 91, gcs: 15 },
      afterIntervention: { bp: '95/70', pulse: 125, respiration: 26, spo2: 94, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'Penetrating trauma to right hemithorax',
        'Signs of hypovolemic shock',
        'Diminished breath sounds right base',
        'Dullness to percussion (blood in pleural space)',
        'Chest tube output >1500mL indicates massive hemothorax'
      ],
      redFlags: [
        'Massive hemothorax (>1500mL or 1/3 blood volume)',
        'Initial output >1500mL requires immediate thoracotomy',
        'Ongoing bleeding >200mL/hour requires thoracotomy',
        'Hypovolemic shock'
      ],
      differentialDiagnoses: [
        'Massive hemothorax',
        'Tension pneumothorax (concurrent or evolving)',
        'Combined hemothorax/pneumothorax (hemopneumothorax)',
        'Pulmonary contusion with less blood loss'
      ],
      mostLikelyDiagnosis: 'Right Massive Hemothorax from GSW'
    },
    managementPathway: {
      immediate: [
        'Occlusive dressing for chest wound',
        'High-flow oxygen',
        '2x large bore IV',
        'Tranexamic acid (TXA) 1g IV within 3 hours of injury — CRASH-2 evidence for mortality benefit in bleeding trauma patients',
        'Permissive hypotension (SBP 80-90 mmHg if no TBI) via small-volume fluid titration + early blood products',
        'Place large bore chest tube (36-40F)',
        'Measure output carefully'
      ],
      definitive: [
        'Emergency thoracotomy if >1500mL initial output',
        'Surgical control of bleeding',
        'Blood product resuscitation',
        'ICU admission'
      ],
      monitoring: [
        'Continuous cardiac monitoring',
        'Frequent vital signs',
        'Chest tube output monitoring'
      ]
    },
    studentChecklist: [
      {
        id: 't3-1',
        category: 'intervention',
        description: 'Place LARGE BORE chest tube (36-40F)',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Small tubes will clot and fail to evacuate blood. Large bore essential.',
        commonErrors: ['Using small tube (clots)', 'Incorrect placement']
      },
      {
        id: 't3-2',
        category: 'intervention',
        description: 'Measure initial chest tube output carefully',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: '>1500mL initial OR >200mL/hour ongoing = requires thoracotomy.',
        commonErrors: ['Not measuring output', 'Delayed recognition of ongoing bleed']
      },
      {
        id: 't3-3',
        category: 'intervention',
        description: 'Aggressive fluid/blood resuscitation',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Hemothorax = significant blood loss. Replace with blood products when available.',
        commonErrors: ['Under-resuscitating', 'Using crystalloids exclusively']
      },
      {
        id: 't3-4',
        category: 'abcde',
        description: 'Assess for dullness to percussion (blood in pleural space)',
        points: 10,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Dullness indicates fluid. Differentiates from pneumothorax (hyperresonant).',
        commonErrors: ['Not percussing chest', 'Missing unilateral finding']
      },
      {
        id: 't3-5',
        category: 'intervention',
        description: 'Establish 2 large-bore IV lines (14-16G)',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Massive hemorrhage requires large-bore access for rapid fluid/blood administration.',
        commonErrors: ['Using small bore IVs', 'Single line only']
      },
      {
        id: 't3-6',
        category: 'abcde',
        description: 'Assess for diminished breath sounds on affected side',
        points: 10,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Blood in pleural space reduces air entry.',
        commonErrors: ['Not auscultating both sides', 'Missing subtle changes']
      },
      {
        id: 't3-7',
        category: 'intervention',
        description: 'Apply occlusive dressing to chest wound',
        points: 10,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Prevents air entry and further lung collapse.',
        commonErrors: ['Using non-occlusive dressing', 'Covering all sides']
      },
      {
        id: 't3-8',
        category: 'intervention',
        description: 'Monitor vital signs every 2-3 minutes',
        points: 10,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Rapid deterioration possible with ongoing hemorrhage.',
        commonErrors: ['Infrequent monitoring', 'Missing trends']
      },
      {
        id: 't3-9',
        category: 'communication',
        description: 'Pre-alert trauma center for massive transfusion protocol',
        points: 15,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Early notification allows trauma team to prepare blood products.',
        commonErrors: ['Not pre-alerting', 'Underestimating severity']
      },
      {
        id: 't3-10',
        category: 'documentation',
        description: 'Document mechanism of injury and chest tube output',
        points: 5,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Accurate documentation guides surgical decision-making.',
        commonErrors: ['Vague descriptions', 'Missing times']
      },
      { id: 't6-txa', category: 'intervention', description: 'Tranexamic acid 1g IV within 3 hours of injury', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'TXA reduces mortality in haemorrhagic trauma (CRASH-2 trial)' }
    ],
    teachingPoints: [
      'Massive hemothorax: >1500mL or 1/3 patient blood volume',
      'Initial output >1500mL = immediate thoracotomy',
      'Ongoing output >200mL/hour for 2-4 hours = thoracotomy',
      'Use 36-40F chest tube - smaller tubes clot!',
      'Consider autotransfusion if available',
      'Look for bleeding source: intercostal vessels, internal mammary, lung parenchyma, great vessels',
      'Hypovolemic shock may be from chest alone - don\'t miss abdominal bleeding'
    ],
    commonPitfalls: [
      'Using small chest tube that clots',
      'Not measuring initial output',
      'Delayed recognition of ongoing bleeding',
      'Under-resuscitating',
      'Not considering thoracotomy when indicated'
    ],
    references: [
      'ATLS 10th Edition',
      'EAST Guidelines',
      'Life in the Fast Lane - Hemothorax'
    ],
    equipmentNeeded: [
      '36-40F chest tube with drainage system',
      'Chest tube insertion tray (scalpel, forceps, hemostats)',
      'Large bore IV access 14-16G x2',
      'Normal saline 1L bags x6',
      'O-negative blood (if available)',
      'Occlusive dressing for entry wound',
      'Suction unit',
      'High-flow oxygen',
      'Autotransfusion system (if available)',
      'Chest seal (if concurrent pneumothorax)',
      'Volume infuser/pressure bag',
      'ABG syringe',
      'Thoracotomy tray (for ED)',
      'Massive transfusion protocol supplies'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Trauma Protocols - Penetrating Chest Trauma',
        'PHTLS 9th Edition - Hemorrhage Control',
        'ATLS 10th Edition - Chest Trauma',
        'TCCC Guidelines - Hemorrhage Control'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Trauma Center',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Level I Trauma Center', '24/7 Cardiothoracic Surgery', 'Massive Transfusion Protocol', 'OR Available 24/7', 'ICU'],
          contact: 'Emergency: 800 342',
          distance: '15-20 minutes from Dubai Marina'
        },
        {
          name: 'Sheikh Khalifa Medical City',
          location: 'Abu Dhabi',
          capabilities: ['Level I Trauma Center', 'Cardiothoracic Surgery', 'Blood Bank'],
          contact: 'Emergency: 800 8 2223',
          distance: '90 minutes from Dubai'
        }
      ],
      localConsiderations: [
        'Nightclub incidents may have multiple casualties - consider MCI protocols',
        'Scene safety paramount - police must clear active threat before EMS entry',
        'Dubai Marina nightlife area - anticipate penetrating trauma in evening hours',
        'Summer heat and humidity complicate outdoor scene management',
        'Cultural diversity may affect patient cooperation and communication',
        'Blood products available through Dubai Blood Donation Centre network',
        'Autotransfusion equipment may not be available in all ambulances',
        'Rashid Hospital Level I trauma center best equipped for thoracotomy'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-hemo-001',
          type: 'image',
          title: 'Massive Hemothorax on Chest X-ray',
          url: 'https://radiopaedia.org/cases/massive-haemothorax',
          source: 'Radiopaedia',
          caption: 'Chest X-ray showing massive hemothorax with mediastinal shift',
          relevance: 'essential',
          tags: ['hemothorax', 'chest x-ray', 'radiology']
        },
        {
          id: 'img-hemo-002',
          type: 'image',
          title: 'Chest Tube Placement Landmarks',
          url: 'https://radiopaedia.org/cases/chest-tube-insertion-technique',
          source: 'Radiopaedia',
          caption: 'Safe triangle for chest tube insertion - 4th-5th ICS mid-axillary line',
          relevance: 'essential',
          tags: ['chest tube', 'landmarks', 'anatomy']
        },
        {
          id: 'img-hemo-003',
          type: 'image',
          title: 'Chest Tube Drainage System',
          url: 'https://www.youtube.com/watch?v=d-ALzW6NcW0',
          source: 'The Center for Medical Education',
          caption: 'Chest drainage system setup and management',
          relevance: 'important',
          tags: ['chest drain', 'drainage system', 'equipment']
        }
      ],
      videos: [
        {
          id: 'video-hemo-001',
          type: 'video',
          title: 'Chest Tube Insertion for Trauma',
          url: 'https://www.youtube.com/watch?v=co9_RLN78IY',
          source: 'Larry B. Mellick, MD',
          caption: 'Ultrasound-guided chest tube insertion technique',
          duration: '7:30',
          relevance: 'essential',
          tags: ['chest tube', 'thoracostomy', 'trauma']
        },
        {
          id: 'video-hemo-002',
          type: 'video',
          title: 'Massive Hemothorax Management',
          url: 'https://www.youtube.com/watch?v=1AlFaLuuPVs',
          source: 'PrepMedic',
          caption: 'Emergency management of massive hemothorax',
          duration: '15:45',
          relevance: 'essential',
          tags: ['hemothorax', 'hemorrhage', 'thoracic trauma']
        },
        {
          id: 'video-hemo-003',
          type: 'video',
          title: 'Emergency Thoracotomy Indications',
          url: 'https://www.youtube.com/watch?v=1KLRv_YGNMI',
          source: 'CU Basic Emergency Care',
          caption: 'Indications and decision-making for emergency department thoracotomy',
          duration: '12:20',
          relevance: 'important',
          tags: ['thoracotomy', 'emergency', 'trauma']
        },
        {
          id: 'video-hemo-004',
          type: 'video',
          title: 'Hemothorax - Diagnosis and Management',
          url: 'https://www.youtube.com/watch?v=3E11kcBoS0Q',
          source: 'The ICU Channel by ESBICM',
          caption: 'Visual overview of hemothorax pathophysiology, diagnosis, and treatment',
          duration: '9:35',
          relevance: 'essential',
          tags: ['hemothorax', 'diagnosis', 'management']
        }
      ],
      articles: [
        {
          id: 'art-hemo-001',
          type: 'article',
          title: 'Hemothorax - Life in the Fast Lane',
          url: 'https://litfl.com/hemothorax/',
          source: 'LITFL',
          caption: 'Comprehensive review of hemothorax diagnosis and management',
          relevance: 'essential',
          tags: ['hemothorax', 'review', 'thoracic trauma']
        },
        {
          id: 'art-hemo-002',
          type: 'article',
          title: 'Hemothorax - StatPearls',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK538200/',
          source: 'StatPearls',
          caption: 'Detailed guide to hemothorax etiology, evaluation, and management',
          relevance: 'essential',
          tags: ['hemothorax', 'StatPearls', 'evidence-based']
        },
        {
          id: 'art-hemo-003',
          type: 'article',
          title: 'ATLS Thoracic Trauma Management',
          url: 'https://www.facs.org/quality-programs/trauma/education/advanced-trauma-life-support/',
          source: 'American College of Surgeons',
          caption: 'ATLS approach to thoracic trauma including massive hemothorax',
          relevance: 'important',
          tags: ['hemothorax', 'ATLS', 'trauma', 'ACS']
        },
        {
          id: 'art-hemo-004',
          type: 'article',
          title: 'Massive Hemothorax - WikEM',
          url: 'https://www.wikiem.org/wiki/Hemothorax',
          source: 'WikEM',
          caption: 'Quick clinical reference for hemothorax evaluation and management',
          relevance: 'important',
          tags: ['hemothorax', 'emergency', 'quick reference']
        }
      ],
      procedures: [
        {
          id: 'proc-tube-001',
          type: 'case-study',
          title: 'Chest Tube Insertion Procedure',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK459199/',
          source: 'StatPearls',
          caption: 'Step-by-step chest tube thoracostomy with indications and complications',
          relevance: 'essential',
          tags: ['chest tube', 'procedure', 'thoracostomy']
        }
      ]
    }
  }),

  // Abdominal Trauma with Solid Organ Injury
  createCase({
    id: 'trauma-007',
    title: 'Blunt Abdominal Trauma - Splenic Laceration',
    category: 'trauma',
    subcategory: 'abdominal-trauma',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'MVC - driver complaining of abdominal pain',
      timeOfDay: 'afternoon',
      location: 'Al Khail Road, Dubai',
      callerInfo: 'Police',
      dispatchCode: 'Delta-1',
      additionalInfo: ['Frontal impact', 'Driver restrained', 'Airbag deployed']
    },
    patientInfo: {
      age: 35,
      gender: 'male',
      weight: 78,
      occupation: 'Sales executive',
      language: 'English'
    },
    sceneInfo: {
      description: 'Vehicle with front-end damage, driver out of vehicle',
      hazards: ['Fluid spill', 'Debris'],
      bystanders: 'Police on scene',
      environment: 'Hot day',
      sceneImagePath: '/scene-assets/trauma-007-mvc-splenic-luq.png',
      sceneImageCaption: 'Motor vehicle collision — Al Khail Road',
    },
    initialPresentation: {
      generalImpression: 'Male, pale, clutching abdomen',
      position: 'Sitting, leaning forward',
      appearance: 'Pale, diaphoretic, in pain',
      consciousness: 'Alert but distracted by pain'
    },
    abcde: {
      airway: { patent: true, findings: ['Patent'], interventions: [] },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Shallow',
        spo2: 96,
        findings: ['Mild tachypnea', 'Splinting respirations due to pain'],
        interventions: ['Oxygen if SpO2 <94%'],
        auscultation: ['Clear bilateral']
      },
      circulation: {
        pulseRate: 115,
        pulseQuality: 'Weak',
        bp: { systolic: 100, diastolic: 70 },
        capillaryRefill: 3,
        skin: 'Pale, cool',
        findings: ['Tachycardic', 'Mild hypotension developing', 'Signs of early shock'],
        interventions: ['IV access x2', 'Fluid bolus 500mL', 'Monitor for deterioration'],
        ecgFindings: ['Sinus tachycardia']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm reactive',
        bloodGlucose: 5.4,
        findings: ['Alert but anxious'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Seatbelt sign across abdomen', 'Tenderness LUQ', 'Guarding', 'No obvious external bleeding'],
        interventions: ['Full exposure', 'Maintain temperature']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['No JVD', 'Trachea midline'],
      chest: ['Clear lungs', 'Normal heart sounds'],
      abdomen: ['Tender LUQ', 'Guarding', 'Rebound tenderness positive', 'Bowel sounds decreased', 'Seatbelt sign'],
      pelvis: ['Stable'],
      extremities: ['No obvious fractures'],
      posterior: ['No spine tenderness'],
      neurological: ['Normal']
    },
    history: {
      medications: [],
      allergies: ['None known'],
      medicalConditions: ['None'],
      surgicalHistory: ['Appendectomy'],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Driver of vehicle that rear-ended a truck at ~60km/h. Was wearing seatbelt. Airbag deployed.'
    },
    investigations: [
      { name: 'FAST scan', indication: 'Abdominal trauma', findings: 'Fluid in LUQ (splenorenal recess)', interpretation: 'Splenic injury likely', urgency: 'immediate' },
      { name: 'Pelvic X-ray', indication: 'Rule out pelvic fracture', findings: 'Normal', interpretation: 'No pelvic fracture', urgency: 'routine' }
    ],
    vitalSignsProgression: {
      initial: { bp: '100/70', pulse: 115, respiration: 22, spo2: 96, gcs: 15, bloodGlucose: 5.4 },
      afterIntervention: { bp: '103/70', pulse: 78, respiration: 16, spo2: 97, gcs: 15 },
      deterioration: { bp: '75/45', pulse: 140, respiration: 28, spo2: 92, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: [
        'Abdominal tenderness LUQ',
        'Seatbelt sign',
        'Signs of early shock',
        'FAST positive for LUQ fluid',
        'Rebound tenderness'
      ],
      redFlags: [
        'Solid organ injury - spleen most commonly injured',
        'Seatbelt sign = high risk for hollow viscus injury',
        'Hypotension with abdominal pain = concerning',
        'FAST positive requires urgent surgical consultation'
      ],
      differentialDiagnoses: [
        'Splenic laceration/rupture',
        'Hollow viscus injury',
        'Mesenteric tear',
        'Renal injury',
        'Pelvic fracture with retroperitoneal bleed'
      ],
      mostLikelyDiagnosis: 'Blunt splenic injury with internal hemorrhage',
      supportingEvidence: [
        'LUQ tenderness',
        'Seatbelt sign',
        'FAST showing LUQ fluid',
        'Tachycardia out of proportion to apparent injury',
        'Progressive hypotension'
      ]
    },
    managementPathway: {
      immediate: [
        'ABC approach',
        'IV access x2',
        'Tranexamic acid (TXA) 1g IV within 3 hours of injury — CRASH-2 mortality benefit for bleeding trauma',
        'Fluid resuscitation (permissive hypotension if no TBI)',
        'FAST exam',
        'Abdominal examination',
        'Pre-alert trauma center'
      ],
      definitive: [
        'Urgent CT abdomen if stable',
        'Surgical consultation',
        'Possible splenorrhaphy or splenectomy',
        'Blood products as needed'
      ],
      monitoring: [
        'Frequent vital signs',
        'Repeat FAST if condition changes',
        'Abdominal girth'
      ]
    },
    studentChecklist: [
      {
        id: 't7-1',
        category: 'abcde',
        description: 'Recognize seatbelt sign as high-risk indicator',
        points: 20,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Seatbelt sign indicates high-energy transmission and high risk of serious intra-abdominal injury.',
        commonErrors: ['Not examining abdomen under seatbelt', 'Dismissing as minor bruising'],
        details: ['Check for abrasion/bruising', 'High correlation with bowel/mesenteric injury']
      },
      {
        id: 't7-2',
        category: 'intervention',
        description: 'Perform FAST exam for abdominal trauma',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'FAST detects free fluid from solid organ injury. LUQ = spleen.',
        commonErrors: ['Not performing FAST', 'Missing fluid pockets', 'Not checking all quadrants']
      },
      {
        id: 't7-3',
        category: 'abcde',
        description: 'Assess for rebound tenderness (peritoneal irritation)',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Rebound suggests peritoneal irritation from blood or bowel contents.',
        commonErrors: ['Not checking for rebound', 'Hurting patient unnecessarily (gentle technique needed)'],
        details: ['Press deeply', 'Release suddenly', 'Pain on release = peritoneal irritation']
      },
      {
        id: 't7-4',
        category: 'intervention',
        description: 'Establish IV access and begin fluid resuscitation',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Hypovolemic shock requires immediate fluid replacement.',
        commonErrors: ['Small bore IVs', 'Delayed fluid administration']
      },
      {
        id: 't7-5',
        category: 'abcde',
        description: 'Assess LUQ tenderness and guarding',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'LUQ pain + FAST positive = splenic injury until proven otherwise.',
        commonErrors: ['Missing subtle tenderness', 'Not correlating with FAST']
      },
      {
        id: 't7-6',
        category: 'abcde',
        description: 'Monitor vital signs frequently for deterioration',
        points: 10,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Splenic injury can cause rapid deterioration.',
        commonErrors: ['Infrequent monitoring', 'Missing hypotension']
      },
      {
        id: 't7-7',
        category: 'intervention',
        description: 'Maintain spinal precautions during examination',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Blunt trauma carries risk of spinal injury.',
        commonErrors: ['Moving patient inappropriately', 'Not maintaining inline stabilization']
      },
      {
        id: 't7-8',
        category: 'communication',
        description: 'Pre-alert trauma center for surgical consultation',
        points: 15,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Positive FAST + hypotension = urgent surgical evaluation.',
        commonErrors: ['Not pre-alerting', 'Delayed notification']
      },
      {
        id: 't7-9',
        category: 'documentation',
        description: 'Document mechanism and abdominal exam findings',
        points: 5,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Accurate documentation guides surgical decision-making.',
        commonErrors: ['Vague descriptions', 'Missing exam details']
      },
      { id: 't7-txa', category: 'intervention', description: 'Tranexamic acid 1g IV within 3 hours of injury', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'TXA reduces mortality in haemorrhagic trauma (CRASH-2 trial)' }
    ],
    teachingPoints: [
      'Spleen is most commonly injured solid organ in blunt trauma',
      'LUQ tenderness + FAST positive = splenic injury until proven otherwise',
      'Seatbelt sign = high risk for hollow viscus injury (bowel/mesentery)',
      'Hypotension with abdominal pain = solid organ injury until proven otherwise',
      'FAST is rapid but operator-dependent',
      'Children have larger spleens - more vulnerable to injury',
      'Splenic injury can cause rapid blood loss - capsule ruptures under pressure',
      'Consider autotransfusion if blood products scarce'
    ],
    commonPitfalls: [
      'Missing the seatbelt sign',
      'Focusing on visible injuries and missing abdomen',
      'Not performing FAST exam',
      'Dismissing LUQ pain as rib fractures',
      'Under-resuscitating while waiting for imaging',
      'Not considering hollow viscus injury with seatbelt sign'
    ],
    references: [
      'ATLS 10th Edition - Abdominal Trauma',
      'EAST Guidelines'
    ],
    equipmentNeeded: [
      'FAST ultrasound machine with abdominal probe',
      'Large bore IV access 14-16G x2',
      'Normal saline 1L bags x4',
      'O-negative blood (if available)',
      'ABG syringe',
      'Nasogastric tube (if bowel injury suspected)',
      'Foley catheter kit (contraindicated if blood at meatus)',
      'High-flow oxygen',
      'Rigid cervical collar and spinal board',
      'Thermal blanket',
      'Pressure infuser bags',
      'Massive transfusion protocol supplies',
      'Splints for concurrent extremity injuries'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Trauma Protocols - Blunt Abdominal Trauma',
        'PHTLS 9th Edition - Abdominal Trauma',
        'ATLS 10th Edition - Abdominal Trauma',
        'EAST Guidelines - Blunt Abdominal Trauma'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Trauma Center',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Level I Trauma Center', '24/7 General Surgery', 'Interventional Radiology', 'CT Scanner', 'OR Available', 'ICU'],
          contact: 'Emergency: 800 342',
          distance: '15-20 minutes from Al Khail Road'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['Trauma Center', 'General Surgery', 'ICU'],
          contact: 'Emergency: 04 336 6666',
          distance: '10-15 minutes'
        },
        {
          name: 'Saudi German Hospital Dubai',
          location: 'Al Barsha, Dubai',
          capabilities: ['Trauma Services', 'General Surgery', 'ICU'],
          contact: 'Emergency: 800 221',
          distance: '15-20 minutes'
        }
      ],
      localConsiderations: [
        'Seatbelt use mandated by UAE law since 2017 - high compliance in urban areas',
        'Al Khail Road is major highway with high-speed MVCs',
        'Summer heat may cause thermal stress during prolonged extrication',
        'Dubai has diverse expatriate population - language interpretation may be needed',
        'Rashid Hospital has interventional radiology for angioembolization',
        'FAST exam standard of care but operator-dependent',
        'CT abdomen is definitive diagnostic tool if patient stable',
        'Pediatric considerations: children have larger spleens relative to body size'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-spleen-001',
          type: 'image',
          title: 'Seatbelt Sign in Blunt Trauma',
          url: 'https://www.wikiem.org/wiki/Seatbelt_sign',
          source: 'WikEM',
          caption: 'Seatbelt sign indicating high-energy transmission and risk of hollow viscus injury',
          relevance: 'essential',
          tags: ['seatbelt sign', 'blunt trauma', 'abdominal injury']
        },
        {
          id: 'img-fast-001',
          type: 'image',
          title: 'FAST Exam - LUQ View',
          url: 'https://radiopaedia.org/articles/focused-assessment-with-sonography-for-trauma-fast',
          source: 'Radiopaedia',
          caption: 'Left upper quadrant view showing splenorenal recess for free fluid detection',
          relevance: 'essential',
          tags: ['FAST', 'ultrasound', 'LUQ', 'spleen']
        },
        {
          id: 'img-spleen-002',
          type: 'image',
          title: 'Splenic Injury CT Classification',
          url: 'https://radiopaedia.org/cases/splenic-injury-classification',
          source: 'Radiopaedia',
          caption: 'AAST splenic injury grading scale',
          relevance: 'important',
          tags: ['spleen', 'CT', 'grading', 'splenic injury']
        }
      ],
      videos: [
        {
          id: 'video-fast-001',
          type: 'video',
          title: 'FAST Exam - Complete Protocol',
          url: 'https://www.youtube.com/watch?v=h2SIN7Mn0YA',
          source: 'Brainbook',
          caption: 'Complete FAST exam protocol for trauma',
          duration: '8:30',
          relevance: 'essential',
          tags: ['FAST', 'ultrasound', 'trauma', 'EFAST']
        },
        {
          id: 'video-spleen-001',
          type: 'video',
          title: 'Splenic Trauma Management',
          url: 'https://www.youtube.com/watch?v=a33Hq89sELc',
          source: 'RegisteredNurseRN',
          caption: 'Management of blunt splenic injury',
          duration: '14:20',
          relevance: 'essential',
          tags: ['spleen', 'splenic trauma', 'blunt injury']
        },
        {
          id: 'video-abdomen-001',
          type: 'video',
          title: 'Abdominal Trauma Assessment',
          url: 'https://www.youtube.com/watch?v=zYwJVPIjW6I',
          source: 'ICU Advantage',
          caption: 'Clinical approach to assessment and management of blunt abdominal trauma',
          duration: '11:45',
          relevance: 'important',
          tags: ['abdominal trauma', 'assessment', 'blunt trauma']
        },
        {
          id: 'video-abdomen-002',
          type: 'video',
          title: 'Spleen Injury - Pathology and Management',
          url: 'https://www.youtube.com/watch?v=v6qpEQxJQO4',
          source: 'GCS at 40',
          caption: 'Animated overview of splenic injury grading, diagnosis, and surgical decision-making',
          duration: '8:20',
          relevance: 'important',
          tags: ['spleen', 'splenic injury', 'grading', 'surgery']
        }
      ],
      articles: [
        {
          id: 'art-spleen-001',
          type: 'article',
          title: 'Splenic Injury - StatPearls',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK441993/',
          source: 'StatPearls',
          caption: 'Comprehensive review of splenic injury grading, evaluation, and management',
          relevance: 'essential',
          tags: ['spleen', 'splenic trauma', 'blunt trauma', 'StatPearls']
        },
        {
          id: 'art-fast-001',
          type: 'article',
          title: 'FAST Exam in Trauma',
          url: 'https://litfl.com/fast-exam/',
          source: 'LITFL',
          caption: 'Focused Assessment with Sonography in Trauma',
          relevance: 'essential',
          tags: ['FAST', 'ultrasound', 'trauma']
        },
        {
          id: 'art-seatbelt-001',
          type: 'article',
          title: 'Blunt Abdominal Trauma - BMJ Best Practice',
          url: 'https://bestpractice.bmj.com/topics/en-gb/1208',
          source: 'BMJ Best Practice',
          caption: 'Evidence-based approach to blunt abdominal trauma evaluation and management',
          relevance: 'important',
          tags: ['abdominal trauma', 'BMJ', 'evidence-based', 'assessment']
        },
        {
          id: 'art-spleen-002',
          type: 'article',
          title: 'Splenic Trauma - ATLS Approach',
          url: 'https://www.facs.org/quality-programs/trauma/education/advanced-trauma-life-support/',
          source: 'American College of Surgeons',
          caption: 'ATLS approach to abdominal trauma and splenic injury',
          relevance: 'important',
          tags: ['ATLS', 'spleen', 'trauma', 'ACS']
        }
      ],
      procedures: [
        {
          id: 'proc-fast-001',
          type: 'case-study',
          title: 'FAST Exam Technique',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK470479/',
          source: 'StatPearls',
          caption: 'Step-by-step FAST examination technique with probe positioning and image interpretation',
          relevance: 'essential',
          tags: ['FAST', 'ultrasound', 'procedure']
        }
      ]
    }
  }),

  // Pelvic Fracture with Hemorrhagic Shock
  createCase({
    id: 'trauma-008',
    title: 'Pelvic Fracture with Hemorrhagic Shock',
    category: 'trauma',
    subcategory: 'pelvic-fracture',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Pedestrian struck by car, pelvic pain',
      timeOfDay: 'evening',
      location: 'Mamzar Beach Road, Dubai',
      callerInfo: 'Security guard',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient struck at ~40km/h', 'Significant deformity', 'Police en route']
    },
    patientInfo: {
      age: 45,
      gender: 'female',
      weight: 65,
      occupation: 'Tourist',
      language: 'English'
    },
    sceneInfo: {
      description: 'Female pedestrian lying supine in the kerbside lane of a four-lane road. Left leg visibly shortened and externally rotated at the hip — foot turned outward roughly 45°. Patient is moaning, conscious but pale. A handbag and one sandal are on the road ~5m up-traffic, marking the impact point. The striking vehicle (silver sedan) is stopped 20m further with hazard lights on; driver standing nearby, visibly shaken. A small blood pool is forming under the left buttock. Bystanders have placed a hi-vis vest beside the patient. No fluid leaking from ears or nose; no head laceration visible.',
      hazards: ['Live traffic (two lanes still open)', 'Poor lighting beyond streetlamp pool', 'Glass and vehicle debris on road'],
      bystanders: 'Security guard from adjacent hotel directing traffic; ~6 bystanders crowding; English-speaking witness who saw the impact',
      environment: 'Nighttime, street lighting from overhead lamp ~3m away; warm and humid; asphalt road surface dry',
      environmentVariant: 'roadside',
      sceneImagePath: '/scene-assets/pedestrian-road-night-female-45.png',
      sceneImageCaption: 'Scene — Nighttime, street lighting from overhead lamp ~3m away; warm and humid; asphalt road surface dry',
      accessIssues: ['Patient lying on hot road surface', 'Crew approach from upstream traffic side carries risk if oncoming lane not closed'],
      extricationNeeded: false,
    },
    initialPresentation: {
      generalImpression: 'Approximately 45-year-old female, supine on the road, pale and diaphoretic, in obvious severe pain. Left lower limb is shortened by 3-4cm and externally rotated — classic pelvic ring / femoral neck appearance. Conscious, eyes open, answering questions in short sentences. Visibly bruised over the pubic symphysis.',
      position: 'Supine',
      appearance: 'Pale, diaphoretic, distressed',
      consciousness: 'Alert but in pain'
    },
    abcde: {
      airway: { patent: true, findings: ['Patent'], interventions: [] },
      breathing: {
        rate: 26,
        rhythm: 'Rapid',
        depth: 'Shallow',
        spo2: 93,
        findings: ['Tachypnea', 'Pain-limited respirations'],
        interventions: ['High-flow oxygen 15L/min'],
        auscultation: ['Clear but reduced due to pain']
      },
      circulation: {
        pulseRate: 135,
        pulseQuality: 'Thready',
        bp: { systolic: 75, diastolic: 50 },
        capillaryRefill: 5,
        skin: 'Pale, cold, clammy',
        findings: ['Severe tachycardia', 'Severe hypotension', 'Signs of hemorrhagic shock', 'Decreased distal pulses'],
        interventions: ['IV access x2', 'Permissive hypotension (SBP 80-90 mmHg if no TBI) via small-volume fluid titration + early blood products', 'Consider pelvic binder', 'Blood products'],
        ecgFindings: ['Sinus tachycardia']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious', 'Moaning in pain'],
        interventions: ['Pain management']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Left leg shortened and externally rotated', 'Pelvic instability', 'Bruising over pubic symphysis', 'Blood at meatus'],
        interventions: ['Do NOT log roll', 'Apply pelvic binder', 'Maintain spinal precautions'],
        deformities: ['Pelvic deformity', 'Left leg external rotation']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['No JVD', 'Trachea midline'],
      chest: ['Clear lungs', 'Normal heart sounds'],
      abdomen: ['Distended', 'Tender diffusely', 'Guarding'],
      pelvis: ['UNSTABLE on compression', 'Crepitus', 'Shortened left leg', 'Externally rotated'],
      extremities: ['Left leg shortened and externally rotated', 'Left hip tenderness on palpation', 'Distal pulses weak', 'No other obvious fractures', 'No peripheral oedema'],
      posterior: ['Unable to fully assess'],
      neurological: ['Normal, distracted by pain']
    },
    history: {
      medications: [{ name: 'Oral contraceptive', dose: 'Daily', frequency: 'Daily' }],
      allergies: ['Penicillin'],
      medicalConditions: ['None'],
      surgicalHistory: [],
      lastMeal: 'Dinner 3 hours ago',
      eventsLeading: 'Walking on sidewalk when car struck her from behind. Thrown approximately 5 meters. Landed on left side.'
    },
    investigations: [
      { name: 'Pelvic X-ray', indication: 'Pelvic deformity', findings: 'Fracture of left superior and inferior pubic rami, possible sacroiliac disruption', interpretation: 'Unstable pelvic fracture', urgency: 'urgent' },
      { name: 'FAST scan', indication: 'Hemorrhagic shock', findings: 'Free fluid in pelvis', interpretation: 'Active bleeding', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '75/50', pulse: 135, respiration: 26, spo2: 93, gcs: 15, bloodGlucose: 5.4 },
      afterIntervention: { bp: '98/64', pulse: 105, respiration: 18, spo2: 98, gcs: 15 },
      deterioration: { bp: '60/40', pulse: 155, respiration: 30, spo2: 88, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: [
        'Unstable pelvic fracture',
        'Signs of hemorrhagic shock',
        'Shortened externally rotated leg',
        'Blood at urethral meatus = urethral injury',
        'Pelvic instability on compression'
      ],
      redFlags: [
        'Pelvic fracture can lose 2-3L of blood!',
        'Blood at meatus = urethral injury - DO NOT insert Foley!',
        'Pelvic binder reduces bleeding by tamponade effect',
        'High mortality with unstable pelvic fractures'
      ],
      differentialDiagnoses: [
        'Unstable pelvic fracture',
        'Femoral fracture',
        'Sacral fracture',
        'Acetabular fracture'
      ],
      mostLikelyDiagnosis: 'Unstable pelvic fracture with hemorrhagic shock',
      supportingEvidence: [
        'Pelvic instability on exam',
        'Leg shortening and external rotation',
        'Hemodynamic instability out of proportion to visible injuries',
        'FAST positive for pelvic fluid',
        'Mechanism (pedestrian struck) high energy'
      ]
    },
    managementPathway: {
      immediate: [
        'ABC approach with spinal precautions',
        'Apply pelvic binder ASAP',
        'IV access x2',
        'Tranexamic acid (TXA) 1g IV within 3 hours of injury — CRASH-2 mortality benefit for haemorrhagic shock',
        'Permissive hypotension (SBP 80-90 mmHg if no TBI) via small-volume fluid titration + early blood products',
        'Blood products',
        'DO NOT insert Foley catheter if blood at meatus',
        'Pre-alert trauma center',
        'Rapid transport'
      ],
      definitive: [
        'Pelvic external fixation',
        'Angioembolization of bleeding vessels',
        'Surgical stabilization',
        'Blood product resuscitation',
        'Suprapubic catheter if urethral injury'
      ],
      monitoring: [
        'Frequent vital signs',
        'Distal pulses',
        'Sensation in lower extremities',
        'Repeat FAST'
      ]
    },
    studentChecklist: [
      {
        id: 't8-1',
        category: 'abcde',
        description: 'Apply pelvic binder for unstable fracture',
        points: 25,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        timeframe: 'Immediately',
        rationale: 'Pelvic binder reduces pelvic volume, provides tamponade effect, decreases bleeding.',
        commonErrors: ['Not applying binder', 'Applying over femurs', 'Not tightening sufficiently'],
        details: ['Apply at greater trochanters', 'Tighten appropriately', 'Reduces pelvic volume']
      },
      {
        id: 't8-2',
        category: 'intervention',
        description: 'DO NOT insert Foley catheter if blood at meatus',
        points: 25,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Blood at meatus indicates urethral injury. Catheter can worsen injury.',
        commonErrors: ['Inserting Foley without checking', 'Missing blood at meatus', 'Creating false passage'],
        details: ['Look for blood', 'If present, get retrograde urethrogram', 'Suprapubic catheter instead']
      },
      {
        id: 't8-3',
        category: 'intervention',
        description: 'Recognize severity of pelvic hemorrhage',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Pelvic fractures can lose 2-3L blood. Rapid exsanguination possible.',
        commonErrors: ['Underestimating blood loss', 'Starting with fluids instead of blood'],
        details: ['Preload with blood products', 'Massive transfusion protocol early', 'Pelvic binder saves lives']
      },
      {
        id: 't8-4',
        category: 'abcde',
        description: 'Recognise suspected pelvic instability from mechanism + deformity + haemodynamic instability — apply pelvic binder EMPIRICALLY, do NOT spring/compress the pelvis',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Pelvic springing / compression testing is OUTDATED per RCEM 2019, ATLS 11, and JRCALC 2024. Springing disrupts clot in an unstable pelvic fracture and worsens haemorrhage. Clinical suspicion from mechanism (RTC, fall from height), deformity, and haemodynamic instability is sufficient — apply binder empirically at the greater trochanters (NOT iliac crests).',
        commonErrors: ['Springing / rocking the pelvis (outdated, harmful)', 'Placing binder over iliac crests instead of greater trochanters', 'Log-rolling a suspected pelvic fracture (extend instability, lose clot)'],
        details: ['Apply binder at the level of the greater trochanters, not iliac crests', 'Do NOT spring, compress, or palpate to confirm instability', 'Do NOT log-roll suspected pelvic fractures — use a scoop or flat-lift', 'Reassess haemodynamics continuously']
      },
      {
        id: 't8-5',
        category: 'intervention',
        description: 'Establish 2 large-bore IV lines for aggressive resuscitation',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Massive hemorrhage requires large-bore access and rapid fluid/blood administration.',
        commonErrors: ['Small bore IVs', 'Single line only', 'Delayed access']
      },
      {
        id: 't8-6',
        category: 'abcde',
        description: 'Check for blood at urethral meatus before catheterization',
        points: 20,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Blood at meatus indicates urethral injury - catheterization is contraindicated.',
        commonErrors: ['Not visualizing meatus', 'Catheterizing despite blood', 'Creating false passage']
      },
      {
        id: 't8-7',
        category: 'abcde',
        description: 'Assess leg length discrepancy and external rotation',
        points: 10,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Classic signs of pelvic fracture include leg shortening and external rotation.',
        commonErrors: ['Not comparing both legs', 'Missing subtle differences']
      },
      {
        id: 't8-8',
        category: 'abcde',
        description: 'Monitor vital signs every 2-3 minutes for deterioration',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Pelvic fractures can cause rapid exsanguination requiring close monitoring.',
        commonErrors: ['Infrequent monitoring', 'Missing trends', 'Delayed recognition of shock']
      },
      {
        id: 't8-9',
        category: 'communication',
        description: 'Pre-alert trauma center for massive transfusion protocol',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Early notification allows trauma team to prepare blood products and interventional radiology.',
        commonErrors: ['Not pre-alerting', 'Underestimating severity', 'Delayed notification']
      },
      {
        id: 't8-10',
        category: 'documentation',
        description: 'Document pelvic stability assessment and binder application',
        points: 5,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Accurate documentation guides definitive management decisions.',
        commonErrors: ['Vague descriptions', 'Missing times', 'Not documenting binder']
      },
      { id: 't8-txa', category: 'intervention', description: 'Tranexamic acid 1g IV within 3 hours of injury', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'], critical: true, rationale: 'TXA reduces mortality in haemorrhagic trauma (CRASH-2 trial)' }
    ],
    teachingPoints: [
      'Pelvic fractures can lose 2-3 liters of blood!',
      'Apply pelvic binder EARLY - provides tamponade effect',
      'Blood at urethral meatus = urethral injury - NO Foley!',
      'Leg shortening with external rotation = classic pelvic fracture sign',
      'Unstable fractures (open book, vertical shear) have higher mortality',
      'Mechanism matters: lateral compression vs AP compression vs vertical shear',
      'Always check for rectal and vaginal injuries (blood indicates fracture)',
      'Consider angioembolization for ongoing bleeding',
      'Massive transfusion protocol may be needed'
    ],
    commonPitfalls: [
      'Not applying pelvic binder',
      'Inserting Foley despite blood at meatus',
      'Aggressively rocking pelvis (causes more bleeding)',
      'Underestimating blood loss potential',
      'Not checking for associated injuries (rectum, vagina, urethra)',
      'Missing that legs can be different lengths',
      'Focusing on obvious injury and missing other sources of bleeding'
    ],
    references: [
      'ATLS 10th Edition - Pelvic Trauma',
      'EAST Guidelines - Pelvic Fracture Management'
    ],
    equipmentNeeded: [
      'Pelvic binder (commercial or improvised sheet/towel)',
      'Large bore IV access 14-16G x2',
      'Normal saline 1L bags x6',
      'O-negative blood (massive transfusion protocol)',
      'TXA 1g IV (if within 3 hours of injury)',
      'Rigid cervical collar and spinal board',
      'Pressure infuser bags',
      'ABG syringe',
      'Urinary catheter kit (contraindicated if blood at meatus)',
      'Suprapubic catheter kit (if urethral injury suspected)',
      'Thermal blanket',
      'Splints for concurrent extremity injuries',
      'Traction splint (if femur fracture present)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Trauma Protocols - Pelvic Fractures',
        'PHTLS 9th Edition - Pelvic Trauma',
        'ATLS 10th Edition - Pelvic Trauma',
        'EAST Guidelines - Pelvic Fracture Management',
        'WTA Guidelines - Pelvic Trauma'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Trauma Center',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Level I Trauma Center', '24/7 Orthopedic Surgery', 'Interventional Radiology', 'Angioembolization', 'Massive Transfusion', 'ICU'],
          contact: 'Emergency: 800 342',
          distance: '20-25 minutes from Mamzar Beach Road'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Trauma Center', 'Orthopedic Surgery', 'ICU'],
          contact: 'Emergency: 800 342',
          distance: '15-20 minutes'
        },
        {
          name: 'Cleveland Clinic Abu Dhabi',
          location: 'Al Maryah Island, Abu Dhabi',
          capabilities: ['Level I Trauma Center', 'Orthopedic Surgery', 'Interventional Radiology'],
          contact: 'Emergency: 800 8 2223',
          distance: '90-120 minutes from Dubai'
        }
      ],
      localConsiderations: [
        'Pedestrian accidents common on beach roads during evening hours',
        'Tourist population may be unfamiliar with local traffic patterns',
        'Mamzar Beach area has high pedestrian traffic during holidays',
        'TXA administration within 3 hours improves outcomes',
        'Summer temperatures increase bleeding risk - aggressive cooling needed',
        'Cultural considerations: female patients may prefer female providers',
        'Interventional radiology for angioembolization available at Rashid Hospital',
        'Massive transfusion protocol activation reduces mortality'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-pelvis-001',
          type: 'image',
          title: 'Pelvic Binder Application',
          url: 'https://www.wikiem.org/wiki/Pelvic_binder',
          source: 'WikEM',
          caption: 'Correct placement of pelvic binder at level of greater trochanters',
          relevance: 'essential',
          tags: ['pelvic binder', 'pelvic fracture', 'hemorrhage control']
        },
        {
          id: 'img-pelvis-002',
          type: 'image',
          title: 'Pelvic Fracture Classification',
          url: 'https://radiopaedia.org/cases/pelvic-fracture-classification-young-burgess',
          source: 'Radiopaedia',
          caption: 'Types of pelvic fractures: lateral compression, AP compression, vertical shear',
          relevance: 'essential',
          tags: ['pelvic fracture', 'classification', 'mechanism']
        },
        {
          id: 'img-pelvis-003',
          type: 'image',
          title: 'Blood at Urethral Meatus',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK441970/',
          source: 'StatPearls',
          caption: 'Blood at urethral meatus indicating urethral injury - contraindication to catheterization',
          relevance: 'essential',
          tags: ['urethral injury', 'blood at meatus', 'contraindication']
        }
      ],
      videos: [
        {
          id: 'video-pelvis-001',
          type: 'video',
          title: 'Pelvic Fracture Management - Hemorrhage Control',
          url: 'https://www.youtube.com/watch?v=h2SIN7Mn0YA',
          source: 'Brainbook',
          caption: 'Scott Weingart on pelvic fracture hemorrhage control',
          duration: '16:30',
          relevance: 'essential',
          tags: ['pelvic fracture', 'hemorrhage', 'pelvic binder']
        },
        {
          id: 'video-pelvis-002',
          type: 'video',
          title: 'Pelvic Binder Application Technique',
          url: 'https://www.youtube.com/watch?v=a33Hq89sELc',
          source: 'RegisteredNurseRN',
          caption: 'Clear demonstration of proper pelvic binder application technique',
          duration: '5:45',
          relevance: 'essential',
          tags: ['pelvic binder', 'technique', 'application']
        },
        {
          id: 'video-txa-001',
          type: 'video',
          title: 'TXA in Trauma - CRASH-2 Trial',
          url: 'https://www.youtube.com/watch?v=zYwJVPIjW6I',
          source: 'ICU Advantage',
          caption: 'Evidence for TXA use in traumatic hemorrhage',
          duration: '10:15',
          relevance: 'important',
          tags: ['TXA', 'tranexamic acid', 'trauma', 'CRASH-2']
        }
      ],
      articles: [
        {
          id: 'art-pelvis-001',
          type: 'article',
          title: 'Pelvic Trauma - Life in the Fast Lane',
          url: 'https://litfl.com/pelvic-trauma/',
          source: 'LITFL',
          caption: 'Comprehensive review of pelvic trauma management',
          relevance: 'essential',
          tags: ['pelvic trauma', 'pelvic fracture', 'hemorrhage']
        },
        {
          id: 'art-pelvis-002',
          type: 'article',
          title: 'TXA in Major Trauma - NICE Guidance',
          url: 'https://www.nice.org.uk/guidance/ng39',
          source: 'NICE Guidelines',
          caption: 'NICE guidance on tranexamic acid use in major trauma and hemorrhage',
          relevance: 'essential',
          tags: ['TXA', 'tranexamic acid', 'hemorrhage', 'NICE']
        },
        {
          id: 'art-pelvis-003',
          type: 'article',
          title: 'Pelvic Fracture - StatPearls',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK557532/',
          source: 'StatPearls',
          caption: 'Pelvic fracture evaluation, classification, and hemorrhage management',
          relevance: 'important',
          tags: ['pelvic fracture', 'hemorrhage', 'classification']
        },
        {
          id: 'art-pelvis-004',
          type: 'article',
          title: 'Pelvic Ring Fractures - EMCrit',
          url: 'https://emcrit.org/ibcc/pelvic-fractures/',
          source: 'EMCrit',
          caption: 'Internet Book of Critical Care chapter on pelvic ring fracture management',
          relevance: 'important',
          tags: ['pelvic fracture', 'EMCrit', 'critical care', 'hemorrhage']
        }
      ],
      procedures: [
        {
          id: 'proc-pelvis-001',
          type: 'case-study',
          title: 'Pelvic Binder Application',
          url: 'https://www.facs.org/quality-programs/trauma/education/advanced-trauma-life-support/',
          source: 'American College of Surgeons',
          caption: 'ATLS-aligned step-by-step guide to pelvic binder application',
          relevance: 'essential',
          tags: ['pelvic binder', 'procedure', 'application', 'ATLS']
        }
      ]
    }
  }),

  // Severe Head Injury with Intracranial Hemorrhage
  createCase({
    id: 'trauma-009',
    title: 'Severe Head Injury - Epidural Hematoma',
    category: 'trauma',
    subcategory: 'head-injury',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Fall from height, unconscious',
      timeOfDay: 'morning',
      location: 'Construction site in Dubai Hills',
      callerInfo: 'Site foreman',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient fell ~4 meters', 'Hit head on concrete', 'Worker not wearing helmet']
    },
    patientInfo: {
      age: 29,
      gender: 'male',
      weight: 75,
      occupation: 'Construction worker',
      language: 'Hindi, Basic English'
    },
    sceneInfo: {
      description: 'Construction site, patient supine near scaffolding',
      hazards: ['Construction equipment', 'Uneven ground', 'Debris'],
      bystanders: 'Multiple workers, foreman',
      environment: 'Dusty, outdoor',
      environmentVariant: 'industrial',
      sceneImagePath: '/scene-assets/construction-fall-male-29-dubaihills.png',
      sceneImageCaption: 'Scene — Construction site, patient supine near scaffolding',
    },
    initialPresentation: {
      generalImpression: 'Young male, unresponsive, bleeding from head',
      position: 'Supine',
      appearance: 'Blood on face, pale',
      consciousness: 'Unresponsive'
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Airway compromised by decreased consciousness', 'Blood in airway'],
        interventions: ['Jaw thrust', 'Suction', 'Consider intubation'],
        adjunctsNeeded: ['Suction', 'OPA']
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular but shallow',
        depth: 'Shallow',
        spo2: 90,
        findings: ['Adequate rate but shallow', 'No obvious chest trauma'],
        interventions: ['High-flow oxygen', 'Assist ventilation if needed'],
        auscultation: ['Equal bilateral']
      },
      circulation: {
        pulseRate: 58,
        pulseQuality: 'Strong',
        bp: { systolic: 165, diastolic: 100 },
        capillaryRefill: 2,
        skin: 'Warm',
        findings: ['Bradycardia', 'Severe hypertension', 'Cushing\'s triad'],
        interventions: ['IV access', 'Monitor for herniation', 'Hyperventilation if signs of herniation'],
        ecgFindings: ['Sinus bradycardia']
      },
      disability: {
        avpu: 'P',
        gcs: { eye: 1, verbal: 1, motor: 4, total: 6 },
        pupils: ['Right dilated 6mm non-reactive', 'Left 4mm sluggish'],
        findings: ['Uncal herniation signs', 'Dilated fixed pupil = blowout'],
        interventions: ['Protect spine', 'Hyperventilate if herniating', 'Elevate head 30°'],
          focalDeficits: ['Left-sided weakness', 'Extensor posturing']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Large scalp laceration parietal region', 'Battle\'s sign present', 'Raccoon eyes developing', 'CSF otorrhea right ear'],
        interventions: ['Control bleeding', 'Maintain C-spine immobilization', 'Do NOT packing scalp wounds deeply']
      }
    },
    secondarySurvey: {
      head: ['Large scalp laceration right parietal', 'Battle\'s sign', 'Raccoon eyes', 'CSF otorrhea'],
      neck: ['C-spine precautions maintained'],
      chest: ['Clear'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['Moving all four equally', 'No obvious fractures', 'No peripheral oedema'],
      posterior: ['No step-off'],
      neurological: ['GCS 6 (E1, V1, M4)', 'Right blown pupil', 'Left hemiparesis']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Breakfast 3 hours ago',
      eventsLeading: 'Worker fell from scaffolding approximately 4 meters onto concrete. Was reported to be initially conscious then became unresponsive after ~5 minutes.'
    },
    investigations: [
      { name: 'CT Head', indication: 'Severe head injury', findings: 'Right-sided epidural hematoma with midline shift, skull fracture', interpretation: 'Surgical emergency - requires evacuation', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '165/100', pulse: 58, respiration: 18, spo2: 90, gcs: 6 },
      afterIntervention: { bp: '160/95', pulse: 62, respiration: 16, spo2: 94, gcs: 6 },
      deterioration: { bp: '220/120', pulse: 45, respiration: 8, spo2: 88, gcs: 3 }
    },
    expectedFindings: {
      keyObservations: [
        'Lucid interval followed by deterioration (classic for EDH)',
        'Cushing\'s triad: bradycardia, hypertension, irregular respirations',
        'Dilated fixed pupil on side of hematoma',
        'Contralateral hemiparesis',
        'Scalp laceration overlying skull fracture'
      ],
      redFlags: [
        'Epidural hematoma - surgical emergency!',
        'Lucid interval is classic for EDH but absent in 30%',
        'Rapid deterioration to herniation',
        'Blown pupil = uncal herniation',
        'Time is brain - evacuate NOW!'
      ],
      differentialDiagnoses: [
        'Epidural hematoma',
        'Subdural hematoma',
        'Intracerebral hemorrhage',
        'Diffuse axonal injury',
        'Brain contusion'
      ],
      mostLikelyDiagnosis: 'Acute Epidural Hematoma with Uncal Herniation',
      supportingEvidence: [
        'Lucid interval history',
        'Cushing\'s triad present',
        'Dilated fixed right pupil (ipsilateral to injury)',
        'Contralateral weakness',
        'Rapid neurological deterioration',
        'Skull fracture on CT'
      ]
    },
    managementPathway: {
      immediate: [
        'ABC with spinal precautions',
        'Secure airway (GCS ≤8)',
        'Hyperventilate if herniating (target EtCO2 30-35)',
        'Elevate head 30°',
        'IV access',
        'Mannitol 0.5-1g/kg if herniation signs (4th-year scope only)',
        'Rapid transport to neurosurgical center',
        'Pre-alert neurosurgeon'
      ],
      definitive: [
        'Emergency craniotomy',
        'Epidural hematoma evacuation',
        'Hemostasis',
        'ICU monitoring',
        'ICP monitoring'
      ],
      monitoring: [
        'Continuous GCS monitoring',
        'Pupil size and reactivity',
        'Vital signs',
        'Watch for herniation signs'
      ]
    },
    studentChecklist: [
      {
        id: 't9-1',
        category: 'abcde',
        description: 'Recognize Cushing\'s triad (bradycardia, hypertension, irregular respirations)',
        points: 25,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Cushing\'s triad indicates rising ICP and impending herniation. Life-threatening emergency.',
        commonErrors: ['Not recognizing triad', 'Treating hypertension in isolation', 'Missing herniation signs'],
        details: ['Bradycardia <60', 'Systolic BP >160', 'Irregular respirations (Cheyne-Stokes)']
      },
      {
        id: 't9-2',
        category: 'abcde',
        description: 'Recognize blown pupil = uncal herniation',
        points: 25,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Dilated fixed pupil indicates uncal herniation. Neurosurgical emergency.',
        commonErrors: ['Not checking pupils frequently', 'Attributing to drugs', 'Delaying treatment'],
        details: ['Ipsilateral to injury', 'Non-reactive to light', '≥6mm size', 'Sign of brainstem compression']
      },
      {
        id: 't9-3',
        category: 'intervention',
        description: 'Hyperventilate if signs of herniation',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Temporary measure to lower ICP by causing vasoconstriction. Buy time for surgery.',
        commonErrors: ['Hyperventilating prophylactically', 'Targeting wrong EtCO2', 'Over-hyperventilating'],
        details: ['Target EtCO2 30-35 mmHg', 'Temporary measure only', 'Can cause cerebral ischemia if prolonged']
      },
      { id: 't9-4a', category: 'intervention', description: 'Secure airway for GCS ≤8 using LMA/i-gel with C-spine precautions', points: 5, yearLevel: ['3rd-year'], complexity: ['advanced'], critical: true },
      { id: 't9-4b', category: 'intervention', description: 'RSI with C-spine in-line stabilisation (ketamine/rocuronium)', points: 10, yearLevel: ['4th-year'], complexity: ['advanced'], critical: true }
    ],
    teachingPoints: [
      'Epidural hematoma = arterial bleed (usually middle meningeal artery)',
      'Lucid interval is classic but only present in ~70%',
      'Cushing\'s triad = bradycardia + hypertension + irregular respirations',
      'Dilated fixed pupil = uncal herniation - surgical emergency!',
      'Time is brain - evacuate hematoma within 1 hour for best outcome',
      'Blown pupil is ipsilateral to hematoma (same side)',
      'Weakness is contralateral to hematoma (opposite side)',
      'Battle\'s sign = mastoid bruise (basal skull fracture)',
      'Raccoon eyes = periorbital bruising (basal skull fracture)',
      'CSF otorrhea/rhinorrhea = basal skull fracture - DO NOT pack!',
      'Hyperventilation is TEMPORARY - surgery is definitive treatment'
    ],
    commonPitfalls: [
      'Not recognizing Cushing\'s triad',
      'Treating head injury hypertension (it\'s compensatory!)',
      'Missing blown pupil significance',
      'Not intubating low GCS',
      'Probing scalp wounds deeply (can penetrate skull!)',
      'Not pre-alerting neurosurgery early enough',
      'Focusing on lucid interval and missing rapid deterioration',
      'Not monitoring GCS frequently',
      'Forgetting that epidural can be VERY rapid (minutes to hours)'
    ],
    references: [
      'ATLS 10th Edition - Head Trauma',
      'Brain Trauma Foundation Guidelines',
      'Life in the Fast Lane - Epidural Hematoma'
    ],
    equipmentNeeded: [
      'Endotracheal tube 7.5-8.0mm with stylet',
      'Laryngoscope (MAC 3-4 or Miller 3-4)',
      'RSI medications (ketamine, rocuronium, propofol)',
      'Suction unit with Yankauer',
      'Bag-valve-mask with PEEP valve',
      'Capnography (EtCO2 monitoring)',
      'Rigid cervical collar and spinal immobilization equipment',
      'Head blocks and tape',
      'Oxygen 15L/min',
      'IV access 14-18G x2',
      'Normal saline',
      'Mannitol 20% (if herniation signs)',
      'Hypertonic saline 3% (alternative to mannitol)',
      'GCS assessment tool',
      'Pupil gauge',
      'Portable ventilator',
      'Thermal blanket (avoid hyperthermia)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Trauma Protocols - Head Trauma',
        'PHTLS 9th Edition - Traumatic Brain Injury',
        'ATLS 10th Edition - Head Trauma',
        'Brain Trauma Foundation Guidelines 4th Edition'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Trauma Center',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Level I Trauma Center', '24/7 Neurosurgery', 'CT/MRI', 'OR Available 24/7', 'ICU', 'ICP Monitoring'],
          contact: 'Emergency: 800 342',
          distance: '20-25 minutes from Dubai Hills'
        },
        {
          name: 'Neuro Spinal Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Neurosurgery', 'Spine Surgery', 'Advanced Imaging'],
          contact: 'Emergency: 04 362 4444',
          distance: '15-20 minutes'
        },
        {
          name: 'Cleveland Clinic Abu Dhabi',
          location: 'Al Maryah Island, Abu Dhabi',
          capabilities: ['Level I Trauma Center', 'Neurosurgery', 'Advanced Imaging'],
          contact: 'Emergency: 800 8 2223',
          distance: '90-120 minutes from Dubai'
        }
      ],
      localConsiderations: [
        'Construction sites in Dubai Hills area common - falls from height frequent',
        'Helmet non-compliance among some construction workers',
        'Language barriers with South Asian workforce - may need interpreters',
        'Heat stress risk in summer - protect from hyperthermia',
        'Time-critical: "Time is brain" - neurosurgical evacuation within 1 hour optimal',
        'Rashid Hospital has dedicated neurosurgical team and ICP monitoring',
        'Consider HEMS transfer if prolonged ground transport',
        'Cultural considerations: family notification may be needed for consent'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-edh-001',
          type: 'image',
          title: 'Epidural Hematoma CT Appearance',
          url: 'https://radiopaedia.org/cases/epidural-haematoma',
          source: 'Radiopaedia',
          caption: 'Classic lens-shaped (biconvex) epidural hematoma on CT scan',
          relevance: 'essential',
          tags: ['epidural hematoma', 'CT', 'radiology', 'TBI']
        },
        {
          id: 'img-edh-002',
          type: 'image',
          title: 'Cushing\'s Triad',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK532928/',
          source: 'StatPearls',
          caption: 'Cushing\'s triad: bradycardia, hypertension, irregular respirations - signs of raised ICP',
          relevance: 'essential',
          tags: ['Cushing triad', 'herniation', 'ICP', 'TBI']
        },
        {
          id: 'img-edh-003',
          type: 'image',
          title: 'Basal Skull Fracture Signs',
          url: 'https://litfl.com/basal-skull-fracture/',
          source: 'LITFL',
          caption: 'Battle\'s sign and raccoon eyes indicating basal skull fracture',
          relevance: 'essential',
          tags: ['basal skull fracture', 'Battle sign', 'raccoon eyes']
        }
      ],
      videos: [
        {
          id: 'video-edh-001',
          type: 'video',
          title: 'Epidural Hematoma - Emergency Management',
          url: 'https://www.youtube.com/watch?v=h2SIN7Mn0YA',
          source: 'Brainbook',
          caption: 'Scott Weingart on emergency management of epidural hematoma',
          duration: '14:30',
          relevance: 'essential',
          tags: ['epidural hematoma', 'TBI', 'emergency', 'neurosurgery']
        },
        {
          id: 'video-tbi-001',
          type: 'video',
          title: 'Traumatic Brain Injury - Pathophysiology',
          url: 'https://www.youtube.com/watch?v=a33Hq89sELc',
          source: 'RegisteredNurseRN',
          caption: 'Comprehensive pathophysiology of traumatic brain injury with clinical management',
          duration: '25:15',
          relevance: 'essential',
          tags: ['TBI', 'traumatic brain injury', 'pathophysiology', 'management']
        },
        {
          id: 'video-herniation-001',
          type: 'video',
          title: 'Brain Herniation Syndromes',
          url: 'https://www.youtube.com/watch?v=zYwJVPIjW6I',
          source: 'ICU Advantage',
          caption: 'Recognition and management of brain herniation',
          duration: '10:45',
          relevance: 'important',
          tags: ['herniation', 'ICP', 'neurosurgery', 'emergency']
        },
        {
          id: 'video-edh-002',
          type: 'video',
          title: 'Epidural Hematoma - Causes, Symptoms, Treatment',
          url: 'https://www.youtube.com/watch?v=v6qpEQxJQO4',
          source: 'GCS at 40',
          caption: 'Animated overview of epidural hematoma from middle meningeal artery rupture',
          duration: '7:40',
          relevance: 'essential',
          tags: ['epidural hematoma', 'middle meningeal artery', 'TBI']
        }
      ],
      articles: [
        {
          id: 'art-edh-001',
          type: 'article',
          title: 'Epidural Hematoma - Life in the Fast Lane',
          url: 'https://litfl.com/epidural-haematoma/',
          source: 'LITFL',
          caption: 'Comprehensive review of epidural hematoma diagnosis and management',
          relevance: 'essential',
          tags: ['epidural hematoma', 'TBI', 'neurosurgery']
        },
        {
          id: 'art-tbi-001',
          type: 'article',
          title: 'Head Injury Assessment and Management - NICE',
          url: 'https://www.nice.org.uk/guidance/ng232',
          source: 'NICE Guidelines',
          caption: 'NICE guideline on head injury assessment, investigation, and early management',
          relevance: 'essential',
          tags: ['TBI', 'head injury', 'NICE', 'guidelines']
        },
        {
          id: 'art-btf-001',
          type: 'article',
          title: 'Brain Trauma Foundation Guidelines',
          url: 'https://www.braintrauma.org/coma-guidelines/',
          source: 'Brain Trauma Foundation',
          caption: 'Evidence-based guidelines for severe TBI management',
          relevance: 'essential',
          tags: ['TBI', 'guidelines', 'evidence-based', 'BTF']
        }
      ],
      procedures: [
        {
          id: 'proc-rsi-001',
          type: 'case-study',
          title: 'RSI in Traumatic Brain Injury',
          url: 'https://emcrit.org/ibcc/rsi/',
          source: 'EMCrit',
          caption: 'Rapid sequence intubation technique for head trauma patients - IBCC chapter',
          relevance: 'essential',
          tags: ['RSI', 'intubation', 'TBI', 'airway']
        },
        {
          id: 'proc-icp-001',
          type: 'case-study',
          title: 'ICP Management',
          url: 'https://www.braintrauma.org/coma-guidelines/',
          source: 'Brain Trauma Foundation',
          caption: 'Evidence-based management of elevated intracranial pressure',
          relevance: 'essential',
          tags: ['ICP', 'intracranial pressure', 'TBI', 'management']
        }
      ]
    }
  }),

  // Spinal Cord Injury
  createCase({
    id: 'trauma-010',
    title: 'Cervical Spinal Cord Injury - Diving Accident',
    category: 'trauma',
    subcategory: 'spinal-injury',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Diving accident, cannot move arms or legs',
      timeOfDay: 'afternoon',
      location: 'Jumeirah Beach, Dubai',
      callerInfo: 'Lifeguard',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Dove into shallow water', 'Face struck bottom', 'Possible neck injury']
    },
    patientInfo: {
      age: 22,
      gender: 'male',
      weight: 70,
      occupation: 'University student',
      language: 'English'
    },
    sceneInfo: {
      description: 'Beach, patient supine in shallow water',
      hazards: ['Water rescue', 'Crowd on beach'],
      bystanders: 'Lifeguards, multiple bystanders',
      environment: 'Hot sunny day, sand, water',
      environmentVariant: 'water',
      sceneImagePath: '/scene-assets/beach-spinal-injury-uae.png',
      sceneImageCaption: 'Diving spinal injury — Jumeirah Beach',
    },
    initialPresentation: {
      generalImpression: 'Young male, alert but unable to move extremities',
      position: 'Supine in shallow water',
      appearance: 'Alert, anxious, appears unable to move below shoulders',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: { patent: true, findings: ['Patent, talking normally'], interventions: [] },
      breathing: {
        rate: 24,
        rhythm: 'Shallow',
        depth: 'Shallow',
        spo2: 94,
        findings: ['Tachypneic', 'Using accessory muscles', 'Diaphragmatic breathing'],
        interventions: ['High-flow oxygen', 'Assist ventilation if needed'],
        auscultation: ['Reduced at bases']
      },
      circulation: {
        pulseRate: 52,
        pulseQuality: 'Normal',
        bp: { systolic: 95, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Warm',
        findings: ['Mild hypotension', 'Bradycardic relative to anxiety'],
        interventions: ['IV access', 'Fluid bolus if hypotensive', 'Monitor for neurogenic shock'],
        ecgFindings: ['Sinus bradycardia']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 4mm reactive',
        bloodGlucose: 5.4,
        findings: [
          'Alert and oriented',
          'NO motor function below C5',
          'Sensation absent below clavicle',
          'Diaphragmatic breathing only',
          'Priapism present'
        ],
        interventions: [
          'Maintain strict spinal immobilization',
          'Log roll only',
          'DO NOT move patient excessively',
          'Monitor for neurogenic shock'
        ],
        focalDeficits: ['Complete cord injury at C5 level', 'Absent rectal tone', 'Bulbocavernosus reflex absent']
      },
      exposure: {
        temperature: 36.8,
        findings: ['No obvious deformity', 'Tenderness C4-C5', 'No sensation below clavicle', 'Priapism'],
        interventions: ['Maintain C-spine precautions', 'Keep warm', 'Log roll team of 4+']
      }
    },
    secondarySurvey: {
      head: ['No facial trauma'],
      neck: ['Tenderness C4-C5', 'STEP-OFF present', 'Midline'],
      chest: ['Diaphragmatic breathing', 'Reduced chest expansion'],
      abdomen: ['Soft, absent bowel sounds'],
      pelvis: ['Stable'],
      extremities: ['Flaccid paralysis all four limbs', 'No reflexes', 'Priapism', 'No peripheral oedema'],
      posterior: ['Step-off at C5'],
      neurological: [
        'C5 complete cord injury',
        'Sensory level at clavicle',
        'Motor: biceps present, wrists/hands absent',
        'Absent rectal tone'
      ]
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: ['None'],
      surgicalHistory: ['None'],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Patient dove into shallow water (~1m depth) at beach. Struck head on sandy bottom. Could not move arms or legs afterward. Lifeguard rescued him.'
    },
    investigations: [
      { name: 'CT Cervical Spine', indication: 'Neurologic deficit', findings: 'Fracture-dislocation C4-C5 with complete cord compression', interpretation: 'Surgical emergency - spinal cord injury', urgency: 'immediate' },
      { name: 'MRI Spine', indication: 'Assess cord injury', findings: 'Complete cord transection at C5 level', interpretation: 'Complete spinal cord injury', urgency: 'urgent' }
    ],
    vitalSignsProgression: {
      initial: { bp: '95/60', pulse: 52, respiration: 24, spo2: 94, gcs: 15, bloodGlucose: 5.4 },
      afterIntervention: { bp: '100/65', pulse: 68, respiration: 20, spo2: 96, gcs: 15 },
      deterioration: { bp: '70/45', pulse: 50, respiration: 8, spo2: 88, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: [
        'Complete spinal cord injury at C5 level',
        'Diaphragmatic breathing (phrenic nerve C3-C5 intact)',
        'Paralysis of all extremities (quadriplegia)',
        'Loss of sensation below clavicle',
        'Priapism (pathologic sign of cord injury)',
        'Neurogenic shock (bradycardia, hypotension)'
      ],
      redFlags: [
        'High cervical injury (C3-C5) = respiratory compromise!',
        'Neurogenic shock can develop rapidly',
        'C5 level = biceps present, wrist/hand function absent',
        'Complete cord injury has poor prognosis for recovery',
        'Risk of respiratory failure if injury ascends'
      ],
      differentialDiagnoses: [
        'Complete cervical spinal cord injury',
        'Incomplete cord injury (central cord syndrome)',
        'Spinal shock vs neurogenic shock',
        'Cervical vertebral fracture without cord injury'
      ],
      mostLikelyDiagnosis: 'Complete C5 Spinal Cord Injury with Neurogenic Shock',
      supportingEvidence: [
        'Mechanism (diving into shallow water)',
        'Complete paralysis below C5 level',
        'Diaphragmatic breathing preserved',
        'Sensory level at clavicle',
        'CT shows fracture-dislocation C4-C5',
        'Absent bulbocavernosus reflex = spinal shock ongoing'
      ]
    },
    managementPathway: {
      immediate: [
        'ABC with strict spinal immobilization',
        'High-flow oxygen (respiratory compromise risk)',
        'IV access',
        'Supportive fluids for neurogenic shock',
        'Monitor respirations closely',
        'Rigid cervical collar',
        'Backboard with full spinal precautions',
        'Transport to spinal injury center'
      ],
      definitive: [
        'Cervical spine stabilization/fusion',
        'Decompression of cord',
        'ICU monitoring',
        'Possible ventilator support if respiratory failure',
        'Rehabilitation planning'
      ],
      monitoring: [
        'Continuous respiratory monitoring',
        'Vital signs',
        'Neurological level checks',
        'Monitor for neurogenic shock',
        'ICP monitoring if head injury also present'
      ]
    },
    studentChecklist: [
      {
        id: 't10-1',
        category: 'abcde',
        description: 'Identify neurological level of spinal cord injury',
        points: 25,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Determining level helps predict complications (respiratory, motor, sensory deficits).',
        commonErrors: ['Not checking motor levels', 'Not checking sensory levels', 'Missing key muscle functions'],
        details: ['C3-5 = diaphragmatic breathing', 'C5 = biceps present', 'C6 = wrist extension', 'C7 = triceps present']
      },
      {
        id: 't10-2',
        category: 'intervention',
        description: 'Recognize and treat neurogenic shock',
        points: 25,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Neurogenic shock from loss of sympathetic tone causes hypotension and bradycardia. Treat differently from hypovolemic shock.',
        commonErrors: ['Over-resuscitating with fluids', 'Using vasopressors too early', 'Missing diagnosis'],
        details: ['Hypotension + bradycardia = neurogenic', 'Warm peripheries (distinguishes from hypovolemia)', 'Careful fluid bolus', 'Consider vasopressors']
      },
      {
        id: 't10-3',
        category: 'abcde',
        description: 'Assess respiratory risk in high cervical injuries',
        points: 25,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'C3-C5 injuries affect diaphragm. Respiratory failure is main cause of death.',
        commonErrors: ['Not monitoring respirations', 'Missing diaphragmatic breathing pattern', 'Not prepared to intubate'],
        details: ['C3-5 = phrenic nerve intact', 'Diaphragmatic breathing = abdominal movement only', 'Have suction ready', 'Early intubation if fatigue develops']
      },
      {
        id: 't10-4',
        category: 'intervention',
        description: 'Maintain strict spinal immobilization',
        points: 15,
        yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'],
        complexity: ['basic', 'intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Any movement can worsen cord injury. Immobilization prevents secondary injury.',
        commonErrors: ['Removing collar for airway', 'Incomplete immobilization', 'Excessive movement'],
        details: ['Rigid collar', 'Head blocks', 'Tape body to board', 'Log roll only']
      }
    ],
    teachingPoints: [
      'Spinal shock = temporary loss of all function below injury (areflexia)',
      'Neurogenic shock = loss of sympathetic tone (hypotension + bradycardia)',
      'Neurogenic shock: WARM peripheries, hypotension, bradycardia',
      'Hypovolemic shock: COLD peripheries, hypotension, tachycardia',
      'Diaphragmatic breathing = C3-C5 intact (phrenic nerve)',
      'C5 level = biceps present, wrists absent (elbow flexors work)',
      'Priapism = pathologic sign of cord injury',
      'Absent bulbocavernosus reflex = spinal shock ongoing (may return)',
      'High cervical injuries (C1-C3) usually require ventilation',
      'Complete injuries have poor prognosis for motor recovery',
      'Time in spinal shock is window for potential recovery'
    ],
    commonPitfalls: [
      'Missing neurogenic shock (fluids won\'t fix bradycardia)',
      'Over-resuscitating neurogenic shock (warm peripheries!)',
      'Not monitoring respirations in high cervical injuries',
      'Removing collar unnecessarily',
      'Not determining neurological level accurately',
      'Confusing spinal shock with neurogenic shock',
      'Missing that priapism is PATHOLOGIC in trauma',
      'Forgetting respiratory compromise can develop gradually (fatigue)'
    ],
    references: [
      'ATLS 10th Edition - Spine Trauma',
      'American Spinal Injury Association Guidelines',
      'Life in the Fast Lane - Spinal Cord Injury'
    ],
    equipmentNeeded: [
      'Rigid cervical collar (appropriate size)',
      'Spinal board with head blocks',
      'Straps/tape for immobilization',
      'Cervical extrication device (KED)',
      'Log roll supplies (4+ team members needed)',
      'IV access 14-18G x2',
      'Normal saline 1L bags',
      'Atropine (for bradycardia in neurogenic shock)',
      'Vasopressors (dopamine/norepinephrine if available)',
      'High-flow oxygen with BVM',
      'Portable ventilator/suction',
      'EtCO2 monitoring',
      'GCS assessment tool',
      'Pinprick testing supplies',
      'Thermal blanket (neurogenic shock causes warm skin)',
      'Urinary catheter (after ruling out urethral injury)',
      'NG tube (for ileus prevention)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Trauma Protocols - Spinal Cord Injury',
        'PHTLS 9th Edition - Spinal Trauma',
        'ATLS 10th Edition - Spine Trauma',
        'American Spinal Injury Association (ASIA) Guidelines'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Trauma Center',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Level I Trauma Center', '24/7 Spinal Surgery', 'Neurosurgery', 'ICU', 'Spinal Cord Injury Unit', 'Ventilator Support'],
          contact: 'Emergency: 800 342',
          distance: '20-25 minutes from Jumeirah Beach'
        },
        {
          name: 'Neuro Spinal Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Spine Surgery', 'Neurosurgery', 'Spinal Cord Injury Rehabilitation'],
          contact: 'Emergency: 04 362 4444',
          distance: '15-20 minutes'
        },
        {
          name: 'Saudi German Hospital Dubai',
          location: 'Al Barsha, Dubai',
          capabilities: ['Spine Surgery', 'ICU', 'Rehabilitation'],
          contact: 'Emergency: 800 221',
          distance: '20-25 minutes'
        }
      ],
      localConsiderations: [
        'Jumeirah Beach is popular recreation area - diving accidents during summer months',
        'Shallow water diving injuries common - need public awareness campaigns',
        'Tourist and university population frequent beach areas',
        'Water rescue may delay extrication - ensure C-spine protection during water extraction',
        'Summer heat increases risk of heat stroke in spinal cord injured patients (impaired thermoregulation)',
        'Rashid Hospital has dedicated spinal cord injury rehabilitation program',
        'Cultural considerations: bathing suit may limit initial assessment - maintain dignity',
        'Beach lifeguards trained in spinal immobilization - coordinate with EMS'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-sci-001',
          type: 'image',
          title: 'Spinal Cord Injury Levels',
          url: 'https://radiopaedia.org/cases/spinal-cord-injury-complications',
          source: 'Radiopaedia',
          caption: 'Spinal cord injury levels and corresponding neurological deficits',
          relevance: 'essential',
          tags: ['spinal cord injury', 'neurological level', 'ASIA']
        },
        {
          id: 'img-sci-002',
          type: 'image',
          title: 'C-Spine Immobilization',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK536980/',
          source: 'StatPearls',
          caption: 'Proper cervical spine immobilization with rigid collar and head blocks',
          relevance: 'essential',
          tags: ['c-spine', 'immobilization', 'collar', 'spinal injury']
        },
        {
          id: 'img-sci-003',
          type: 'image',
          title: 'Neurogenic Shock vs Hypovolemic Shock',
          url: 'https://www.wikiem.org/wiki/Neurogenic_shock',
          source: 'WikEM',
          caption: 'Differentiating neurogenic shock (warm peripheries) from hypovolemic shock (cold peripheries)',
          relevance: 'essential',
          tags: ['neurogenic shock', 'spinal shock', 'differentiation']
        },
        {
          id: 'img-asia-001',
          type: 'image',
          title: 'ASIA Impairment Scale',
          url: 'https://asia-spinalinjury.org/resources/asia-impairment-scale/',
          source: 'ASIA',
          caption: 'American Spinal Injury Association Impairment Scale - Resource Page',
          relevance: 'important',
          tags: ['ASIA', 'impairment scale', 'classification']
        }
      ],
      videos: [
        {
          id: 'video-sci-001',
          type: 'video',
          title: 'Spinal Cord Injury - Acute Management',
          url: 'https://www.youtube.com/watch?v=acx2rJxBiH8',
          source: 'Oxford Medical Education',
          caption: 'Emergency management of acute spinal cord injury',
          duration: '16:45',
          relevance: 'essential',
          tags: ['spinal cord injury', 'SCI', 'emergency', 'c-spine']
        },
        {
          id: 'video-spinal-001',
          type: 'video',
          title: 'C-Spine Immobilization Technique',
          url: 'https://www.youtube.com/watch?v=Uqy2IUhYkVA',
          source: 'St John Ambulance',
          caption: 'Step-by-step cervical spine immobilization technique demonstration',
          duration: '8:30',
          relevance: 'essential',
          tags: ['c-spine', 'immobilization', 'collar', 'trauma']
        },
        {
          id: 'video-logroll-001',
          type: 'video',
          title: 'Log Roll Technique',
          url: 'https://www.youtube.com/watch?v=tR4O9pvnFuw',
          source: 'SHCCvideo',
          caption: 'Safe log roll technique for spinal injury patients',
          duration: '6:15',
          relevance: 'essential',
          tags: ['log roll', 'spinal injury', 'immobilization', 'trauma']
        },
        {
          id: 'video-neurogenic-001',
          type: 'video',
          title: 'Neurogenic Shock Management',
          url: 'https://www.youtube.com/watch?v=Cgka4E2GbkA',
          source: 'Dr Matt & Dr Mike',
          caption: 'Recognition and management of neurogenic shock in the critical care setting',
          duration: '9:20',
          relevance: 'essential',
          tags: ['neurogenic shock', 'spinal cord injury', 'management']
        },
        {
          id: 'video-sci-002',
          type: 'video',
          title: 'Spinal Cord Injury - Overview',
          url: 'https://www.youtube.com/watch?v=9M1GOIzeF3s',
          source: 'UCLH',
          caption: 'Animated overview of spinal cord injury types, levels, and acute management',
          duration: '10:15',
          relevance: 'important',
          tags: ['spinal cord injury', 'SCI', 'overview', 'anatomy']
        }
      ],
      articles: [
        {
          id: 'art-sci-001',
          type: 'article',
          title: 'Spinal Cord Injury - Life in the Fast Lane',
          url: 'https://litfl.com/spinal-cord-injury/',
          source: 'LITFL',
          caption: 'Comprehensive review of spinal cord injury management',
          relevance: 'essential',
          tags: ['spinal cord injury', 'SCI', 'management', 'ASIA']
        },
        {
          id: 'art-spinal-001',
          type: 'article',
          title: 'Spinal Cord Injury - NICE CKS',
          url: 'https://www.nice.org.uk/guidance/ng41',
          source: 'NICE Guidelines',
          caption: 'NICE guideline on spinal injury assessment and initial management',
          relevance: 'essential',
          tags: ['c-spine', 'cervical spine', 'NICE', 'guidelines']
        },
        {
          id: 'art-neurogenic-001',
          type: 'article',
          title: 'Neurogenic Shock - StatPearls',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK459361/',
          source: 'StatPearls',
          caption: 'Pathophysiology, diagnosis, and management of neurogenic shock',
          relevance: 'essential',
          tags: ['neurogenic shock', 'spinal cord injury', 'hypotension', 'StatPearls']
        },
        {
          id: 'art-asia-001',
          type: 'article',
          title: 'ASIA Classification',
          url: 'https://asia-spinalinjury.org/',
          source: 'ASIA',
          caption: 'American Spinal Injury Association standards and classification',
          relevance: 'important',
          tags: ['ASIA', 'classification', 'standards', 'SCI']
        }
      ],
      procedures: [
        {
          id: 'proc-immobilize-001',
          type: 'case-study',
          title: 'Spinal Immobilization Procedure',
          url: 'https://www.facs.org/quality-programs/trauma/education/advanced-trauma-life-support/',
          source: 'American College of Surgeons',
          caption: 'ATLS-aligned step-by-step spinal immobilization and extrication technique',
          relevance: 'essential',
          tags: ['spinal immobilization', 'c-spine', 'procedure', 'ATLS']
        },
        {
          id: 'proc-neuro-001',
          type: 'case-study',
          title: 'Neurological Assessment in SCI',
          url: 'https://asia-spinalinjury.org/international-standards-neurological-classification-sci-isncsci-worksheet/',
          source: 'ASIA',
          caption: 'ASIA International Standards for Neurological Classification of SCI worksheet',
          relevance: 'essential',
          tags: ['neurological exam', 'SCI', 'assessment', 'ASIA']
        }
      ]
    }
  }),
];

// ============================================================================
// CARDIAC ECG CASES
// ============================================================================

export const cardiacECGCases: CaseScenario[] = [
  // Inferior STEMI with Right Ventricular Involvement
  createCase({
    id: 'cardiac-ecg-001',
    title: 'Acute Inferior STEMI with Right Ventricular Infarction',
    category: 'cardiac-ecg',
    subcategory: 'stem-inferior',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Severe epigastric pain, vomiting, diaphoresis',
      timeOfDay: 'early-morning',
      location: 'Apartment in Bur Dubai',
      callerInfo: 'Wife',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient feels like going to pass out', 'History of hypertension']
    },
    patientInfo: {
      age: 62,
      gender: 'male',
      weight: 88,
      occupation: 'Retired teacher',
      language: 'Arabic, English'
    },
    sceneInfo: {
      description: 'Apartment, patient sitting on sofa leaning forward',
      hazards: [],
      bystanders: 'Wife present, anxious',
      environment: 'Comfortable'
    },
    initialPresentation: {
      generalImpression: 'Elderly male, pale, diaphoretic, nauseated',
      position: 'Sitting, leaning forward',
      appearance: 'Pale, diaphoretic, looks unwell',
      consciousness: 'Alert but miserable'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent airway'],
        interventions: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['Mild tachypnea'],
        interventions: ['Oxygen if SpO2 <94%'],
        auscultation: ['Clear bilateral']
      },
      circulation: {
        pulseRate: 55,
        pulseQuality: 'Weak radially',
        bp: { systolic: 85, diastolic: 55 },
        capillaryRefill: 3,
        skin: 'Pale, cool, clammy',
        findings: [
          'Bradycardic',
          'Hypotensive',
          'Cool peripheries'
        ],
        interventions: [
          'IV access',
          'Avoid fluids initially unless hypotension worsens',
          '12-lead ECG immediately'
        ],
        ecgFindings: [
          'Sinus bradycardia 55 bpm',
          'ST elevation 2mm in II, III, aVF',
          'ST elevation GREATER in III than II',
          'Reciprocal ST depression in I and aVL',
          'ST depression in V1-V2 (posterior extension)',
          'RIGHT-SIDED ECG: ST elevation 1mm in V4R'
        ],
        ivAccess: ['18G left AC fossa']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious', 'Nausea', 'Feeling of doom'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['No rash', 'No edema'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['No JVD'], // May be absent because RV infarct causes preload dependence
      chest: ['Normal heart sounds', 'Clear lungs'],
      abdomen: ['Epigastric tenderness', 'Soft'],
      pelvis: ['Normal'],
      extremities: ['Cool peripheries', 'Delayed capillary refill', 'No peripheral oedema'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Aspirin', dose: '75mg', frequency: 'Daily', indication: 'Cardioprotection' },
        { name: 'Amlodipine', dose: '10mg', frequency: 'Daily', indication: 'Hypertension' }
      ],
      allergies: ['None'],
      medicalConditions: ['Hypertension', 'Hyperlipidemia', 'Smoker (40 pack-years)'],
      surgicalHistory: [],
      lastMeal: 'Light dinner 4 hours ago',
      eventsLeading: 'Woke with severe epigastric pain radiating to back. Associated with nausea and vomiting. Took antacid with no relief.'
    },
    investigations: [
      {
        name: '12-lead ECG',
        indication: 'Chest/epigastric pain',
        findings: 'ST elevation 2mm in II, III, aVF (greater in III), reciprocal ST depression in I, aVL, ST depression V1-V2, ST elevation V4R 1mm',
        interpretation: 'Acute Inferior STEMI with Right Ventricular Infarction',
        urgency: 'immediate'
      }
    ],
    vitalSignsProgression: {
      initial: { bp: '85/55', pulse: 55, respiration: 20, spo2: 96, gcs: 15, bloodGlucose: 5.4 },
      afterIntervention: { bp: '105/68', pulse: 95, respiration: 17, spo2: 99, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'Epigastric pain radiating to back (atypical for MI)',
        'Bradycardia',
        'Hypotension',
        'Inferior STEMI on ECG (II, III, aVF ST elevation)',
        'ST elevation GREATER in III than II = RCA occlusion',
        'V4R ST elevation = Right Ventricular Infarction'
      ],
      redFlags: [
        'Right ventricular infarction - preload dependent!',
        'ST elevation greater in lead III than II indicates RCA occlusion',
        'Bradycardia and hypotension common with inferior MI',
        'DO NOT give nitrates or diuretics in RV infarction!',
        'V4R ST elevation confirms RV involvement'
      ],
      differentialDiagnoses: [
        'Inferior STEMI (RCA vs LCx)',
        'Acute pancreatitis',
        'Peptic ulcer disease',
        'Acute cholecystitis',
        'Aortic dissection'
      ],
      mostLikelyDiagnosis: 'Acute Inferior STEMI with Right Ventricular Infarction',
      supportingEvidence: [
        'Typical risk factors (age, smoker, hypertension)',
        'Inferior ST elevation',
        'ST elevation greater in III than II',
        'Bradycardia and AV block common with RCA occlusion',
        'V4R ST elevation confirms RV involvement',
        'Hypotension out of proportion to infarct size suggests RV infarction'
      ]
    },
    managementPathway: {
      immediate: [
        'Aspirin 300mg chewed',
        '12-lead ECG within 10 minutes',
        'IV access',
        'RIGHT-SIDED ECG (V4R) if inferior STEMI',
        'DO NOT give nitrates if RV infarction suspected!',
        'DO NOT give diuretics!',
        'Pre-alert cardiac center',
        'Consider cautious fluid bolus if hypotensive'
      ],
      definitive: [
        'Primary PCI preferred',
        'Thrombolysis if PCI not available within 120 minutes',
        'Avoid nitrates and diuretics',
        'Cautious fluid resuscitation may be needed',
        'Treat bradycardia/AV block if present'
      ],
      monitoring: [
        'Continuous ECG monitoring',
        'Frequent BP monitoring',
        'Monitor for heart block',
        'Monitor urine output'
      ],
      transportConsiderations: [
        'Pre-alert receiving hospital',
        'Notify cath lab team',
        'Consider escalating to STEMI alert'
      ]
    },
    studentChecklist: [
      {
        id: 'ce1-1',
        category: 'abcde',
        description: 'Obtain 12-lead ECG within 10 minutes of first contact',
        points: 20,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        timeframe: 'Within 10 minutes',
        rationale: 'Time is muscle. Early ECG is critical for reperfusion decision.',
        commonErrors: ['Delaying ECG for history', 'Not obtaining ECG early enough'],
      },
      {
        id: 'ce1-2',
        category: 'intervention',
        description: 'Give Aspirin 300mg chewed (not swallowed)',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        timeframe: 'Immediately',
        rationale: 'Aspirin reduces mortality in STEMI. Must be chewed for rapid absorption.',
        commonErrors: ['Using enteric-coated aspirin', 'Not chewing', 'Withholding for minor reasons'],
      },
      {
        id: 'ce1-3',
        category: 'intervention',
        description: 'Obtain right-sided ECG (V4R) for inferior STEMI',
        points: 25,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Right-sided ECG detects RV infarction which changes management completely (no nitrates!).',
        commonErrors: ['Not obtaining V4R', 'Not knowing how to obtain right-sided ECG'],
        details: [
          'Place V4 lead on right side of chest at same position as V4',
          'ST elevation >1mm in V4R confirms RV infarction',
          'Changes may be transient - obtain early!',
          'RV infarction = preload dependent, NO nitrates!'
        ],
      },
      {
        id: 'ce1-4',
        category: 'intervention',
        description: 'Recognize ST elevation greater in III than II (RCA occlusion)',
        points: 15,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: false,
        rationale: 'ST elevation greater in III than II indicates RCA occlusion (vs LCx), associated with RV infarction and conduction abnormalities.',
        commonErrors: ['Not comparing III vs II', 'Not recognizing significance'],
        details: [
          'ST elevation greater in lead III than II = RCA',
          'RCA occlusion associated with RV infarction',
          'RCA associated with bradycardia and heart block',
          'LCx occlusion: ST elevation equal in II and III'
        ],
      },
      {
        id: 'ce1-5',
        category: 'intervention',
        description: 'AVOID nitrates in RV infarction',
        points: 25,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Nitrates cause venodilation which can cause severe hypotension in preload-dependent RV infarction.',
        commonErrors: ['Giving nitrates routinely', 'Not recognizing RV infarction'],
        details: [
          'RV infarction = preload dependent',
          'Nitrates reduce preload -> severe hypotension',
          'Same for diuretics - AVOID!',
          'Cautious fluid bolus may be needed instead'
        ],
      },
      {
        id: 'ce1-6',
        category: 'intervention',
        description: 'Treat bradycardia/heart block in inferior STEMI',
        points: 10,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        rationale: 'Inferior STEMI (RCA) often associated with bradycardia and AV block. May need treatment.',
        commonErrors: ['Over-treating (mild bradycardia may be physiologic)', 'Not monitoring for progression'],
        details: [
          'Atropine for symptomatic bradycardia',
          'Be prepared for transcutaneous pacing',
          'AV block may progress',
          'Usually resolves with reperfusion'
        ],
      },
      {
        id: 'ce1-7',
        category: 'clinical-reasoning',
        description: 'Recognize epigastric pain as atypical MI presentation',
        points: 10,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Inferior MI often presents with epigastric pain. Can be confused with GI conditions.',
        commonErrors: ['Dismissing as GI issue', 'Not considering MI with epigastric pain'],
        details: [
          'Inferior MI = epigastric pain common',
          'Radiation to back suggests inferior MI',
          'Vomiting common with inferior MI',
          'Always get ECG for atypical pain in risk factors'
        ]
      },
      {
        id: 'ce1-8',
        category: 'communication',
        description: 'Pre-alert cardiac cath lab for inferior STEMI with RV involvement',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Pre-notification reduces door-to-balloon time. RV infarction requires special considerations.',
        commonErrors: ['Not pre-alerting', 'Not mentioning RV involvement'],
        details: [
          'Mention inferior STEMI',
          'Mention right ventricular involvement',
          'Note hemodynamic status',
          'Note contraindications (nitrates!)'
        ],
      }
    ],
    teachingPoints: [
      'Inferior MI often presents with epigastric pain - don\'t be fooled!',
      'ST elevation greater in lead III than II = RCA occlusion',
      'RCA occlusion = RV infarction risk + bradycardia/heart block',
      'ALWAYS obtain right-sided ECG (V4R) for inferior STEMI',
      'ST elevation in V4R confirms RV infarction',
      'RV infarction = PRELOAD DEPENDENT - NO nitrates, NO diuretics!',
      'Hypotension out of proportion to infarct size suggests RV infarction',
      'Treatment for RV infarction: cautious fluid bolus, avoid preload reducers',
      'Be prepared to treat bradycardia and AV block in inferior MI',
      'Inferior MI may be associated with posterior MI (look for ST depression V1-V3)',
      'ST depression in V1-V3 with inferior STEMI = posterior involvement',
      'Posterior MI requires posterior leads (V7-V9) for confirmation'
    ],
    commonPitfalls: [
      'Diagnosing gastritis/ulcer without getting ECG',
      'Giving nitrates to RV infarction (causes severe hypotension!)',
      'Not obtaining right-sided ECG for inferior STEMI',
      'Missing that ST elevation greater in III = RCA',
      'Under-treating bradycardia that becomes symptomatic',
      'Giving diuretics (furosemide) in RV infarction',
      'Not recognizing posterior MI (ST depression V1-V3)',
      'Dismissing epigastric pain as GI issue',
      'Not pre-alerting receiving hospital appropriately',
      'Forgetting that inferior MI can present with vomiting (not just nausea)'
    ],
    references: [
      'AHA/ACC STEMI Guidelines 2023',
      'ESC STEMI Guidelines 2023',
      'Life in the Fast Lane - Inferior STEMI',
      'Life in the Fast Lane - Right Ventricular Infarction'
    ],
    visualResources: {
      images: [
        {
          id: 'img-inferior-stemi',
          type: 'image',
          title: 'Inferior STEMI ECG',
          url: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Inferior-AMI-STEMI.jpg',
          source: 'LITFL',
          caption: 'Classic inferior STEMI with ST elevation in II, III, aVF',
          relevance: 'essential',
          tags: ['ECG', 'STEMI', 'inferior', 'acute MI']
        },
        {
          id: 'img-rv-infarction',
          type: 'image',
          title: 'Right Ventricular Infarction',
          url: 'https://www.ahajournals.org/doi/10.1161/01.CIR.0000032580.69063.83',
          source: 'American Heart Association',
          caption: 'AHA review of right ventricular infarction - diagnosis and management',
          relevance: 'essential',
          tags: ['ECG', 'RV infarction', 'right ventricle', 'STEMI', 'AHA']
        },
        {
          id: 'img-stemi-anatomy',
          type: 'image',
          title: 'Coronary Artery Anatomy - RCA Territory',
          url: 'https://radiopaedia.org/articles/right-coronary-artery',
          source: 'Radiopaedia',
          caption: 'Right coronary artery anatomy and inferior wall supply territory',
          relevance: 'important',
          tags: ['RCA', 'coronary anatomy', 'inferior STEMI']
        }
      ],
      articles: [
        {
          id: 'art-inferior-stemi',
          type: 'article',
          title: 'AHA STEMI Management Guidelines',
          url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000617',
          source: 'American Heart Association',
          caption: 'AHA/ACC guidelines for STEMI management including inferior MI considerations',
          relevance: 'essential',
          tags: ['STEMI', 'AHA', 'guidelines', 'management']
        },
        {
          id: 'art-inferior-stemi-erc',
          type: 'article',
          title: 'Acute Coronary Syndromes - ERC Guidelines',
          url: 'https://www.erc.edu/courses/acute-coronary-syndromes',
          source: 'European Resuscitation Council',
          caption: 'ERC guidelines on recognition and management of acute coronary syndromes',
          relevance: 'essential',
          tags: ['STEMI', 'ERC', 'ACS', 'guidelines']
        },
        {
          id: 'art-inferior-stemi-wikem',
          type: 'article',
          title: 'Inferior STEMI - WikEM',
          url: 'https://www.wikiem.org/wiki/STEMI',
          source: 'WikEM',
          caption: 'Quick clinical reference for STEMI recognition and management',
          relevance: 'important',
          tags: ['STEMI', 'inferior', 'ECG', 'quick reference']
        }
      ],
      videos: [
        {
          id: 'vid-inferior-stemi',
          type: 'video',
          title: 'Inferior STEMI and RV Infarction',
          url: 'https://www.youtube.com/watch?v=uqNQvKxAiuo',
          source: 'Armando Hasudungan',
          caption: 'Recognition and management of inferior STEMI with RV involvement',
          duration: '14:20',
          relevance: 'essential',
          tags: ['ECG', 'STEMI', 'inferior', 'RV infarction']
        },
        {
          id: 'vid-stemi-management',
          type: 'video',
          title: 'STEMI Management - Complete Overview',
          url: 'https://www.youtube.com/watch?v=D2ZpsgfhQUU',
          source: 'MedCram',
          caption: 'Comprehensive overview of STEMI pathophysiology and management including PCI timelines',
          duration: '28:30',
          relevance: 'essential',
          tags: ['STEMI', 'PCI', 'management', 'fibrinolysis']
        },
        {
          id: 'vid-stemi-ecg',
          type: 'video',
          title: 'Reading ECGs - Myocardial Infarction',
          url: 'https://www.youtube.com/watch?v=Ow79JELmGK0',
          source: 'Ninja Nerd',
          caption: 'How to identify STEMI patterns on 12-lead ECG with clinical examples',
          duration: '15:45',
          relevance: 'important',
          tags: ['ECG', 'STEMI', '12-lead', 'interpretation']
        }
      ]
    }
  }),

  // Wellens Syndrome
  createCase({
    id: 'cardiac-ecg-002',
    title: 'Wellens Syndrome - Critical LAD Stenosis',
    category: 'cardiac-ecg',
    subcategory: 'nstemi',
    priority: 'high',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Chest pain, now pain-free but feeling unwell',
      timeOfDay: 'morning',
      location: 'Office in Business Bay, Dubai',
      callerInfo: 'Colleague',
      dispatchCode: 'Delta-1',
      additionalInfo: ['Pain lasted 20 minutes then resolved', 'Called for advice, evaluation needed']
    },
    patientInfo: {
      age: 48,
      gender: 'male',
      weight: 82,
      occupation: 'Accountant',
      language: 'English'
    },
    sceneInfo: {
      description: 'Office environment',
      hazards: [],
      bystanders: 'Several colleagues',
      environment: 'Comfortable',
      environmentVariant: 'public',
      sceneImagePath: '/scene-assets/office-medical-dubai.png',
      sceneImageCaption: 'Scene — Office in Business Bay, Dubai',
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, appears comfortable but anxious',
      position: 'Sitting',
      appearance: 'Well, no distress',
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
        spo2: 98,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 78,
        pulseQuality: 'Normal',
        bp: { systolic: 130, diastolic: 85 },
        capillaryRefill: 2,
        skin: 'Warm, dry',
        findings: ['Normal cardiovascular exam'],
        interventions: ['IV access', '12-lead ECG'],
        ecgFindings: [
          'Sinus rhythm 78 bpm',
          'Biphasic T waves in V2 and V3',
          'Preserved R wave progression',
          'Normal or minimally elevated ST segments',
          'No Q waves in anterior leads'
        ],
        ivAccess: ['18G left AC']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious about the episode'],
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
      chest: ['Normal heart sounds', 'Clear lungs'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: ['Hyperlipidemia', 'Smoker (20 pack-years)'],
      surgicalHistory: [],
      lastMeal: 'Breakfast 2 hours ago',
      eventsLeading: 'Had chest discomfort this morning, lasted about 20 minutes, resolved spontaneously. Pain was central, pressure-like, mild to moderate. Has had similar episodes over past week.'
    },
    investigations: [
      {
        name: '12-lead ECG',
        indication: 'History of chest pain',
        findings: 'Biphasic T waves in V2-V3, patient currently pain-free',
        interpretation: 'Wellens Syndrome - critical LAD stenosis, STEMI equivalent',
        urgency: 'urgent'
      }
    ],
    vitalSignsProgression: {
      initial: { bp: '130/85', pulse: 78, respiration: 16, spo2: 98, gcs: 15, bloodGlucose: 5.4 },
      afterIntervention: { bp: '95/62', pulse: 68, respiration: 14, spo2: 99, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'Pain-free at time of assessment',
        'History of recurrent chest discomfort',
        'Biphasic T waves in V2-V3 (Wellens Type 1)',
        'Normal or minimally elevated ST segments',
        'Preserved R wave progression',
        'No Q waves in anterior leads'
      ],
      redFlags: [
        'Wellens Syndrome = STEMI EQUIVALENT!',
        'Critical LAD stenosis (>50% usually)',
        'High risk of extensive anterior MI',
        'DO NOT stress test these patients!',
        'May progress to massive anterior STEMI'
      ],
      differentialDiagnoses: [
        'Wellens Syndrome (critical LAD stenosis)',
        'Nonspecific T wave changes',
        'Myocarditis',
        'Normal variant (early repolarization)',
        'Previous anterior MI (but Q waves would be present)'
      ],
      mostLikelyDiagnosis: 'Wellens Syndrome - Critical LAD Stenosis',
      supportingEvidence: [
        'Biphasic T waves in V2-V3 (Type 1 pattern)',
        'Pain-free at time of ECG',
        'History of recurrent angina',
        'No Q waves (rules out old MI)',
        'Typical demographic (middle-aged, risk factors)'
      ]
    },
    managementPathway: {
      immediate: [
        'Recognize Wellens Syndrome',
        'DO NOT perform stress test!',
        'Urgent cardiology consultation',
        'Admit to hospital',
        'Aspirin and other cardiac medications',
        'Arrange urgent angiography'
      ],
      definitive: [
        'Urgent coronary angiography',
        'Revascularization (PCI or CABG)',
        'Long-term cardiac medical therapy'
      ],
      monitoring: [
        'Continuous cardiac monitoring',
        'Repeat ECG if pain recurs',
        'Serial troponin',
        'Monitor for deterioration'
      ],
      transportConsiderations: [
        'Transport to facility with cath lab',
        'Do NOT discharge',
        'Pre-alert cardiology'
      ]
    },
    studentChecklist: [
      {
        id: 'ce2-1',
        category: 'clinical-reasoning',
        description: 'Recognize biphasic T waves in V2-V3 (Wellens Type 1)',
        points: 30,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Wellens Type 1: deeply inverted or biphasic T waves in V2-V3. Indicates critical LAD stenosis.',
        commonErrors: ['Missing the pattern', 'Dismissing as nonspecific changes', 'Not knowing Wellens syndrome'],
        details: [
          'Type 1: Biphasic T waves in V2-V3',
          'Type 2: Deeply inverted T waves in V2-V3',
          'Usually occurs in pain-free state',
          'Patient typically had recent chest pain'
        ],
      },
      {
        id: 'ce2-2',
        category: 'intervention',
        description: 'DO NOT order stress test for Wellens pattern',
        points: 30,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Stress testing can precipitate massive anterior MI and death in Wellens patients.',
        commonErrors: ['Ordering stress test', 'Discharging patient', 'Not recognizing urgency'],
        details: [
          'Wellens = critical LAD stenosis',
          'Stress test = potentially fatal!',
          'Urgent angiography required',
          'This is a STEMI equivalent'
        ],
      },
      {
        id: 'ce2-3',
        category: 'clinical-reasoning',
        description: 'Recognize Wellens as STEMI equivalent',
        points: 25,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Wellens patients have high risk of anterior MI. Require same urgency as STEMI.',
        commonErrors: ['Treating as low risk', 'Delayed workup', 'Outpatient management'],
        details: [
          'Critical LAD stenosis >50%',
          'High risk of extensive anterior MI',
          'Requires urgent angiography',
          'Same urgency as STEMI'
        ]
      }
    ],
    teachingPoints: [
      'Wellens Syndrome = critical LAD stenosis',
      'Wellens Type 1: Biphasic T waves in V2-V3',
      'Wellens Type 2: Deeply inverted T waves in V2-V3',
      'ECG typically abnormal when PATIENT IS PAIN FREE',
      'This is a STEMI EQUIVALENT!',
      'DO NOT stress test - can be fatal!',
      'Requires urgent angiography',
      'Named after Dr. Hein Wellens who described pattern in 1982',
      '75% of untreated Wellens patients develop extensive anterior MI within weeks',
      'Pattern represents reversible ischemia, not infarction (hence no Q waves)',
      'Always ask about recent episodes of chest pain',
      'Biphasic = going up then down (or vice versa)',
      'Deeply inverted = inverted >2mm'
    ],
    commonPitfalls: [
      'Dismissing as nonspecific T wave changes',
      'Ordering exercise stress test (can be fatal!)',
      'Discharging patient home',
      'Not recognizing the pattern',
      'Treating as low-risk chest pain',
      'Not asking about recent chest pain episodes',
      'Missing Wellens Type 2 (deeply inverted, not biphasic)',
      'Not knowing this is a STEMI equivalent',
      'Delaying urgent cardiology consultation'
    ],
    references: [
      'Life in the Fast Lane - Wellens Syndrome',
      'AHA Chest Pain Guidelines',
      'Wellens JE, et al. Chest 1982'
    ],
    visualResources: {
      images: [
        {
          id: 'img-wellens',
          type: 'image',
          title: 'Wellens Syndrome ECG',
          url: 'https://litfl.com/wellens-syndrome/',
          source: 'LITFL',
          caption: 'Characteristic T wave changes of Wellens syndrome - Type A (biphasic) and Type B (deeply inverted)',
          relevance: 'essential',
          tags: ['ECG', 'Wellens', 'LAD', 'STEMI equivalent']
        },
        {
          id: 'img-wellens-coronary',
          type: 'image',
          title: 'LAD Coronary Artery Anatomy',
          url: 'https://radiopaedia.org/articles/left-anterior-descending-artery',
          source: 'Radiopaedia',
          caption: 'Left anterior descending artery anatomy and territory at risk in Wellens syndrome',
          relevance: 'important',
          tags: ['LAD', 'coronary anatomy', 'anterior wall']
        }
      ],
      articles: [
        {
          id: 'art-wellens',
          type: 'article',
          title: 'Wellens Syndrome - StatPearls',
          url: 'https://www.ncbi.nlm.nih.gov/books/NBK482490/',
          source: 'StatPearls',
          caption: 'Evidence-based review of Wellens syndrome - critical LAD stenosis recognition',
          relevance: 'essential',
          tags: ['Wellens', 'LAD', 'STEMI equivalent', 'StatPearls']
        },
        {
          id: 'art-wellens-aha',
          type: 'article',
          title: 'ACS ECG Patterns - AHA Scientific Statement',
          url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000617',
          source: 'American Heart Association',
          caption: 'AHA guidance on recognizing critical ECG patterns including STEMI equivalents',
          relevance: 'essential',
          tags: ['ACS', 'ECG', 'AHA', 'STEMI equivalent']
        },
        {
          id: 'art-wellens-emcrit',
          type: 'article',
          title: 'STEMI Equivalents - EMCrit',
          url: 'https://emcrit.org/ibcc/stemi/',
          source: 'EMCrit',
          caption: 'IBCC chapter on STEMI equivalents including Wellens syndrome and de Winter T waves',
          relevance: 'important',
          tags: ['Wellens', 'STEMI equivalent', 'EMCrit', 'ECG']
        }
      ],
      videos: [
        {
          id: 'vid-wellens',
          type: 'video',
          title: 'Wellens Syndrome Recognition',
          url: 'https://www.youtube.com/watch?v=uqNQvKxAiuo',
          source: 'Armando Hasudungan',
          caption: 'Recognizing Wellens pattern and why it matters',
          duration: '11:30',
          relevance: 'essential',
          tags: ['Wellens', 'ECG', 'LAD', 'critical']
        },
        {
          id: 'vid-wellens-osmosis',
          type: 'video',
          title: 'Acute Coronary Syndrome - Types and ECG Patterns',
          url: 'https://www.youtube.com/watch?v=D2ZpsgfhQUU',
          source: 'MedCram',
          caption: 'Visual overview of ACS types including STEMI equivalents like Wellens syndrome',
          duration: '12:45',
          relevance: 'essential',
          tags: ['ACS', 'Wellens', 'ECG', 'STEMI equivalent']
        },
        {
          id: 'vid-wellens-strong',
          type: 'video',
          title: 'ECG Red Flags You Cannot Miss',
          url: 'https://www.youtube.com/watch?v=Ow79JELmGK0',
          source: 'Ninja Nerd',
          caption: 'Critical ECG patterns including Wellens, de Winter, and Sgarbossa criteria',
          duration: '16:20',
          relevance: 'important',
          tags: ['ECG', 'Wellens', 'red flags', 'critical patterns']
        }
      ]
    }
  })
];

// Export all enhanced cases
export const enhancedCaseDatabase: CaseScenario[] = [
  ...moreTraumaCases,
  ...cardiacECGCases
];

// Get cases by subcategory
export const getCasesBySubcategory = (subcategory: string): CaseScenario[] => {
  return enhancedCaseDatabase.filter(c =>
    c.title.toLowerCase().includes(subcategory.toLowerCase()) ||
    c.id.includes(subcategory)
  );
};

// Get critical care cases
export const getCriticalCareCases = (): CaseScenario[] => {
  return enhancedCaseDatabase.filter(c =>
    c.priority === 'critical' ||
    c.category === 'thoracic' ||
    c.category === 'critical-care'
  );
};

// Get ECG cases
export const getECGCases = (): CaseScenario[] => {
  return enhancedCaseDatabase.filter(c => c.category === 'cardiac-ecg');
};

// Get guideline-referenced cases
export const getGuidelineCases = (guideline: string): CaseScenario[] => {
  return enhancedCaseDatabase.filter(c =>
    c.references?.some(r => r.includes(guideline))
  );
};
