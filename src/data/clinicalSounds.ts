/**
 * Clinical Sounds System
 *
 * Generates and manages clinical audio (respiratory sounds, heart sounds)
 * using the Web Audio API. Sounds change dynamically based on patient condition
 * and treatment responses.
 *
 * Sound Categories:
 * - Respiratory: wheeze, crackles, stridor, diminished, clear
 * - Cardiac: normal S1S2, murmur, irregular, gallop
 * - Patient: groaning, distressed breathing, snoring airway
 */

// ============================================================================
// TYPES
// ============================================================================

import { getBreathPhase01, getBreathRpm } from '@/lib/breathClock';

export type BreathSoundType =
  | 'clear'           // Normal vesicular breath sounds
  | 'wheeze'          // High-pitched musical sound (asthma/COPD)
  | 'crackles-fine'   // Fine inspiratory crackles (pulmonary edema, pneumonia)
  | 'crackles-coarse' // Coarse crackles (secretions, bronchitis)
  | 'stridor'         // Harsh inspiratory sound (upper airway obstruction)
  | 'diminished'      // Reduced air entry (pneumothorax, effusion)
  | 'absent'          // No breath sounds (tension pneumothorax, arrest)
  | 'rhonchi'         // Low-pitched rumbling (mucus in large airways)
  | 'pleural-rub'     // Creaking sound (pleurisy)
  | 'snoring'         // Sonorous - partial upper airway obstruction
  ;

export type HeartSoundType =
  | 'normal'          // Regular S1S2
  | 'tachycardic'     // Fast regular
  | 'bradycardic'     // Slow regular
  | 'irregular'       // AF, ectopics
  | 'muffled'         // Cardiac tamponade
  | 'gallop'          // S3/S4 heart failure
  | 'murmur-systolic' // Systolic murmur
  | 'absent'          // Cardiac arrest
  ;

export type BowelSoundType =
  | 'normal'           // Regular intermittent gurgling (normoactive)
  | 'hyperactive'      // Frequent, loud, high-pitched (gastroenteritis, early obstruction, diarrhoea)
  | 'hypoactive'       // Infrequent, quiet (post-operative ileus, peritonitis, constipation)
  | 'absent'           // No bowel sounds after 3+ minutes (paralytic ileus, advanced peritonitis)
  | 'tinkling'         // High-pitched metallic sounds (mechanical bowel obstruction)
  | 'borborygmi'       // Loud prolonged gurgling (hunger, incomplete obstruction)
  | 'bruit'            // Vascular whooshing sound (aortic aneurysm, renal artery stenosis)
  ;

export interface ClinicalSoundState {
  leftLung: BreathSoundType;
  rightLung: BreathSoundType;
  // Optional per-zone refinement of the breath sounds. When a zone is left
  // undefined the per-side value (leftLung / rightLung) is heard there. This
  // lets basal-predominant pathology — pneumonia over a consolidated base,
  // cardiogenic oedema crackling at the bases — sound distinct from the
  // apices, which the four chest zones on the 3D body auscultate
  // independently. Uniform pathology (pneumothorax, bronchospasm, transmitted
  // stridor) leaves these undefined and is correctly heard the same
  // top-to-bottom via the per-side fallback.
  leftUpperLung?: BreathSoundType;
  leftLowerLung?: BreathSoundType;
  rightUpperLung?: BreathSoundType;
  rightLowerLung?: BreathSoundType;
  heartSound: HeartSoundType;
  bowelSounds?: BowelSoundType;  // Abdominal auscultation
  additionalSounds: string[];  // e.g., "audible wheeze", "gurgling", "stridor heard without stethoscope"
  description: string;         // Human-readable description for display
}

/** A single auscultation zone on the chest — the four lung fields the 3D body
 *  exposes as separate listening points (right/left × upper/lower). */
export type LungZone = 'right-upper' | 'right-lower' | 'left-upper' | 'left-lower';

/**
 * Resolve the breath sound for one chest zone, falling back to the per-side
 * value (leftLung / rightLung) when no zone-specific sound is set. Callers
 * always get a concrete sound to play, and cases only specify zones when the
 * upper and lower fields genuinely differ.
 */
export function getZoneBreathSound(sounds: ClinicalSoundState, zone: LungZone): BreathSoundType {
  switch (zone) {
    case 'right-upper': return sounds.rightUpperLung ?? sounds.rightLung;
    case 'right-lower': return sounds.rightLowerLung ?? sounds.rightLung;
    case 'left-upper':  return sounds.leftUpperLung  ?? sounds.leftLung;
    case 'left-lower':  return sounds.leftLowerLung  ?? sounds.leftLung;
  }
}

/**
 * Map the engine's `currentRhythm` string to the most clinically-accurate
 * auscultation heart sound. Lets the sound library stay in sync with what
 * the LIFEPAK monitor is drawing — e.g. atrial fibrillation produces an
 * irregularly-irregular S1, arrest rhythms produce no audible heart sound,
 * VT/SVT produce tachycardic sounds, bradyarrhythmias produce bradycardic.
 *
 * Returns `null` when the rhythm doesn't dictate a specific sound (so
 * severity/category defaults win — e.g. "Normal Sinus Rhythm" doesn't
 * force normal if the case has tamponade and should sound muffled).
 */
export function rhythmToHeartSound(rhythm: string | undefined): HeartSoundType | null {
  if (!rhythm) return null;
  const r = rhythm.toLowerCase();

  // Arrest — no mechanical cardiac activity = no audible sound.
  if (r.includes('asystole') || r.includes('ventricular fibrillation')
    || r.includes('pea') || r.includes('pulseless electrical')) {
    return 'absent';
  }
  // Pulseless VT — also no audible sound.
  if (r.includes('pulseless vt') || r.includes('pulseless ventricular')) {
    return 'absent';
  }

  // Irregularly-irregular rhythms.
  if (r.includes('atrial fibrillation') || r.includes('atrial flutter') || r === 'af') {
    return 'irregular';
  }

  // Tachyarrhythmias.
  if (r.includes('ventricular tachycardia') || r.includes('svt')
    || r.includes('supraventricular tachycardia') || r.includes('sinus tachycardia')) {
    return 'tachycardic';
  }

  // Bradyarrhythmias & AV blocks.
  if (r.includes('sinus bradycardia') || r.includes('bradycardia')
    || r.includes('complete heart block') || r.includes('mobitz')
    || r.includes('junctional') || r.includes('first degree')) {
    return 'bradycardic';
  }

  // Normal sinus — let severity-based logic choose (gallop, muffled, etc.).
  if (r.includes('normal sinus') || r === 'sinus rhythm') return null;

  return null;
}

export interface AuscultationFinding {
  location: 'left-upper' | 'left-lower' | 'right-upper' | 'right-lower' | 'anterior' | 'posterior';
  sound: BreathSoundType;
  description: string;
}

// ============================================================================
// SOUND DESCRIPTIONS - What the student "hears" (text-based for now)
// ============================================================================

export const BREATH_SOUND_DESCRIPTIONS: Record<BreathSoundType, {
  name: string;
  description: string;
  clinicalSignificance: string;
  audioDescription: string;
}> = {
  'clear': {
    name: 'Clear Breath Sounds',
    description: 'Normal vesicular breath sounds bilaterally. Good air entry throughout all lung fields.',
    clinicalSignificance: 'Normal finding — adequate ventilation',
    audioDescription: 'Soft rustling sound, louder on inspiration'
  },
  'wheeze': {
    name: 'Bilateral Wheeze',
    description: 'High-pitched musical expiratory wheeze heard bilaterally. Polyphonic wheeze throughout all lung fields.',
    clinicalSignificance: 'Bronchospasm — consider asthma, COPD exacerbation, anaphylaxis',
    audioDescription: 'Musical whistling on expiration, may be heard without stethoscope in severe cases'
  },
  'crackles-fine': {
    name: 'Fine Inspiratory Crackles',
    description: 'Fine, late-inspiratory crackles heard at both lung bases. Velcro-like quality.',
    clinicalSignificance: 'Fluid in alveoli — pulmonary edema, pneumonia, fibrosis',
    audioDescription: 'Like rubbing hair near your ear, or separating Velcro slowly'
  },
  'crackles-coarse': {
    name: 'Coarse Crackles',
    description: 'Coarse, bubbly crackles heard throughout inspiration and expiration. Suggests fluid/secretions in larger airways.',
    clinicalSignificance: 'Secretions in large airways — bronchitis, aspiration, pulmonary edema',
    audioDescription: 'Bubbling or gurgling sound, like blowing through a straw in water'
  },
  'stridor': {
    name: 'Stridor',
    description: 'Harsh, high-pitched inspiratory stridor. Suggests significant upper airway narrowing.',
    clinicalSignificance: 'EMERGENCY — upper airway obstruction. Consider foreign body, epiglottitis, anaphylaxis, croup',
    audioDescription: 'Harsh crowing sound on inspiration, often audible without stethoscope'
  },
  'diminished': {
    name: 'Diminished Breath Sounds',
    description: 'Markedly reduced air entry. Breath sounds barely audible.',
    clinicalSignificance: 'Reduced ventilation — pneumothorax, large effusion, severe bronchospasm, splinting from pain',
    audioDescription: 'Very faint or distant breath sounds, significantly quieter than expected'
  },
  'absent': {
    name: 'Absent Breath Sounds',
    description: 'No breath sounds detected on auscultation. Silent chest.',
    clinicalSignificance: 'CRITICAL — tension pneumothorax, massive effusion, near-fatal asthma, cardiac arrest',
    audioDescription: 'Complete silence on the affected side'
  },
  'rhonchi': {
    name: 'Rhonchi',
    description: 'Low-pitched, continuous rumbling sounds. Heard on expiration, may clear with coughing.',
    clinicalSignificance: 'Mucus/secretions in large airways — bronchitis, COPD, aspiration',
    audioDescription: 'Low-pitched snoring or rumbling sound, like a low moan'
  },
  'pleural-rub': {
    name: 'Pleural Friction Rub',
    description: 'Creaking, grating sound heard during both inspiration and expiration.',
    clinicalSignificance: 'Inflamed pleural surfaces rubbing — pleurisy, PE, pneumonia',
    audioDescription: 'Like leather creaking or walking on fresh snow'
  },
  'snoring': {
    name: 'Sonorous/Snoring Respiration',
    description: 'Loud snoring-type breathing indicating partial upper airway obstruction by the tongue.',
    clinicalSignificance: 'Partial airway obstruction — reduced consciousness, needs airway management',
    audioDescription: 'Loud snoring sound synchronous with breathing'
  },
};

export const BOWEL_SOUND_DESCRIPTIONS: Record<BowelSoundType, {
  name: string;
  description: string;
  clinicalSignificance: string;
  audioDescription: string;
  conditions: string[];
}> = {
  'normal': {
    name: 'Normal Bowel Sounds',
    description: 'Intermittent gurgling sounds heard every 5-15 seconds. Normoactive bowel sounds in all four quadrants.',
    clinicalSignificance: 'Normal peristalsis — functional gastrointestinal tract',
    audioDescription: 'Soft intermittent gurgling or clicking sounds, irregular rhythm',
    conditions: ['Healthy abdomen', 'Non-abdominal presentations'],
  },
  'hyperactive': {
    name: 'Hyperactive Bowel Sounds',
    description: 'Frequent, loud, high-pitched gurgling heard continuously. Sounds occur every 1-3 seconds.',
    clinicalSignificance: 'Increased peristalsis — gastroenteritis, early mechanical obstruction, diarrhoeal illness, post-laxative',
    audioDescription: 'Loud, frequent, rushing gurgling sounds like water flowing through pipes',
    conditions: ['Gastroenteritis', 'Early bowel obstruction', 'Diarrhoea', 'Food poisoning', 'Crohn\'s flare'],
  },
  'hypoactive': {
    name: 'Hypoactive Bowel Sounds',
    description: 'Infrequent, quiet bowel sounds. Only 1-2 sounds heard per minute. Sluggish peristalsis.',
    clinicalSignificance: 'Reduced peristalsis — post-operative ileus, peritonitis onset, opiate use, electrolyte imbalance',
    audioDescription: 'Rare, faint gurgling sounds with long silent intervals between them',
    conditions: ['Post-operative ileus', 'Early peritonitis', 'Opioid use', 'Constipation', 'Hypokalaemia'],
  },
  'absent': {
    name: 'Absent Bowel Sounds',
    description: 'No bowel sounds detected after auscultating for a full 3 minutes in all four quadrants.',
    clinicalSignificance: 'CRITICAL — paralytic ileus, advanced peritonitis, mesenteric ischaemia. Must auscultate for minimum 3 minutes before declaring absent.',
    audioDescription: 'Complete silence — no gurgling, clicking, or movement sounds',
    conditions: ['Paralytic ileus', 'Generalised peritonitis', 'Mesenteric ischaemia', 'Post-operative (early)'],
  },
  'tinkling': {
    name: 'High-Pitched Tinkling',
    description: 'High-pitched, metallic tinkling sounds. Suggests fluid and air under pressure in a distended bowel loop.',
    clinicalSignificance: 'Mechanical bowel obstruction — fluid sloshing in distended obstructed bowel. Requires surgical review.',
    audioDescription: 'Like small bells or metallic pinging sounds, high-pitched and musical',
    conditions: ['Mechanical bowel obstruction', 'Adhesive small bowel obstruction', 'Volvulus'],
  },
  'borborygmi': {
    name: 'Borborygmi',
    description: 'Loud, prolonged gurgling rumbles. Often audible without a stethoscope.',
    clinicalSignificance: 'Vigorous peristalsis — hunger, incomplete obstruction, irritable bowel, anxiety',
    audioDescription: 'Loud stomach rumbling or growling, prolonged and echoing',
    conditions: ['Hunger', 'Incomplete bowel obstruction', 'IBS', 'Anxiety', 'Fasting'],
  },
  'bruit': {
    name: 'Abdominal Bruit',
    description: 'Vascular whooshing sound heard over aorta or renal arteries. Indicates turbulent blood flow.',
    clinicalSignificance: 'VASCULAR — aortic aneurysm (epigastric bruit), renal artery stenosis (flank bruit). Do NOT palpate deeply if AAA suspected.',
    audioDescription: 'Blowing or whooshing sound synchronous with pulse, similar to a cardiac murmur but heard over the abdomen',
    conditions: ['Abdominal aortic aneurysm', 'Renal artery stenosis', 'Hepatic artery stenosis'],
  },
};

// ============================================================================
// CONDITION-TO-SOUND MAPPING
// ============================================================================

// CommonJS `require` used for the lazy circular-dep-safe import below.
// In pure-ESM browser builds it throws ReferenceError, which the try/catch handles.
declare const require: (id: './treatmentProtocols') => typeof import('./treatmentProtocols');

/**
 * Reconcile derived lung sounds with the AUTHORED findings text. The category
 * and severity-protocol branches return early, so a case whose findings
 * explicitly say "wheeze" could derive 'diminished' (field bug: "if it's a
 * wheeze it needs to SOUND like a wheeze"). What the case text tells the
 * student must match what the stethoscope plays — authored findings win.
 * Mixed findings (cardiac asthma: wheeze + basal crackles; inhalation burn:
 * stridor + crackles) split across zones the way they present clinically.
 */
export function reconcileLungsWithFindings(state: ClinicalSoundState, findingsStr: string): ClinicalSoundState {
  const f = findingsStr.toLowerCase();
  const positive = (term: string) => !new RegExp(`\\b(?:no|without|nil|denies|negative for)\\s+(?:[\\w/]+\\s+){0,2}${term}`, 'i').test(f)
    && new RegExp(term, 'i').test(f);

  const wantsSilent = positive('silent chest') || positive('absent breath');
  const wantsStridor = positive('stridor');
  const wantsWheeze = positive('wheez');
  const wantsCrackles = positive('crackle') || positive('rales');
  const crackleType: BreathSoundType = f.includes('coarse') ? 'crackles-coarse' : 'crackles-fine';

  const lungs = [state.leftLung, state.rightLung, state.leftUpperLung, state.leftLowerLung, state.rightUpperLung, state.rightLowerLung]
    .filter(Boolean) as BreathSoundType[];
  const has = (t: (s: BreathSoundType) => boolean) => lungs.some(t);

  // Silent chest is the extremis override — authored silence beats everything.
  if (wantsSilent) {
    if (has(s => s === 'absent' || s === 'diminished')) return state;
    return { ...state, leftLung: 'absent', rightLung: 'absent', leftUpperLung: undefined, leftLowerLung: undefined, rightUpperLung: undefined, rightLowerLung: undefined };
  }

  const next: ClinicalSoundState = { ...state };
  let changed = false;

  // Primary adventitious sound for the main fields: stridor > wheeze > crackles.
  const primary: BreathSoundType | null = wantsStridor ? 'stridor' : wantsWheeze ? 'wheeze' : wantsCrackles ? crackleType : null;
  if (primary && !has(s => s === primary || (primary.startsWith('crackles') && s.startsWith('crackles')))) {
    next.leftLung = primary;
    next.rightLung = primary;
    next.leftUpperLung = undefined; next.leftLowerLung = undefined;
    next.rightUpperLung = undefined; next.rightLowerLung = undefined;
    changed = true;
  }

  // Mixed presentations get zone splits: the secondary sound sits where it
  // lives clinically — crackles at the bases (cardiac asthma, inhalation
  // injury); wheeze in the upper fields when crackles took the mains.
  if (wantsCrackles && (wantsStridor || wantsWheeze)) {
    next.leftLowerLung = crackleType;
    next.rightLowerLung = crackleType;
    next.leftUpperLung = next.leftLung;
    next.rightUpperLung = next.rightLung;
    changed = true;
  } else if (wantsStridor && wantsWheeze) {
    // Croup/anaphylaxis pattern: upper-airway stridor over lower-field wheeze.
    next.leftLowerLung = 'wheeze';
    next.rightLowerLung = 'wheeze';
    next.leftUpperLung = next.leftLung;
    next.rightUpperLung = next.rightLung;
    changed = true;
  }

  return changed ? next : state;
}

/**
 * Determine initial clinical sounds based on case category, presentation,
 * and — when available — the severity-aware treatment protocol system.
 * The authored-findings reconciliation (above) runs as a final pass.
 */
export function getInitialSounds(
  caseCategory: string,
  subcategory?: string,
  findings?: string[],
  initialVitals?: { spo2?: number; pulse?: number; respiration?: number; gcs?: number },
): ClinicalSoundState {
  const base = computeBaseSounds(caseCategory, subcategory, findings, initialVitals);
  return reconcileLungsWithFindings(base, (findings || []).join(' '));
}

function computeBaseSounds(
  caseCategory: string,
  subcategory?: string,
  findings?: string[],
  initialVitals?: { spo2?: number; pulse?: number; respiration?: number; gcs?: number },
): ClinicalSoundState {
  const cat = caseCategory.toLowerCase();
  const sub = (subcategory || '').toLowerCase();
  const findingsStr = (findings || []).join(' ').toLowerCase();
  // Negation-aware finder. "No signs of anaphylaxis" and "No wheeze" must NOT
  // light the anaphylaxis / asthma sound branches — that is how a panic
  // attack ended up playing a wheeze and teaching the wrong treatment.
  const says = (term: string) => {
    const negated = new RegExp(
      `\\b(?:no|without|nil|denies|negative for|absent|rule out|r/o)\\s+(?:[\\w/]+\\s+){0,3}${term}`,
      'i',
    ).test(findingsStr);
    return !negated && new RegExp(term, 'i').test(findingsStr);
  };

  // ----- TRY SEVERITY-AWARE PROTOCOL SOUNDS FIRST -----
  // Lazily import to avoid circular deps
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { findProtocol, determineSeverityFromVitals } = require('./treatmentProtocols');
    const protocol = findProtocol(subcategory || '', caseCategory);
    if (protocol && initialVitals) {
      const vitals = {
        pulse: initialVitals.pulse ?? 80,
        spo2: initialVitals.spo2 ?? 98,
        respiration: initialVitals.respiration ?? 16,
        bp: '120/80',
        gcs: initialVitals.gcs ?? 15,
      };
      const severityLevel = determineSeverityFromVitals(protocol, vitals);
      if (severityLevel?.initialSounds) {
        const s = severityLevel.initialSounds;
        return {
          leftLung: s.leftLung,
          rightLung: s.rightLung,
          // Carry through per-zone overrides when a protocol defines them.
          ...(s.leftUpperLung ? { leftUpperLung: s.leftUpperLung } : {}),
          ...(s.leftLowerLung ? { leftLowerLung: s.leftLowerLung } : {}),
          ...(s.rightUpperLung ? { rightUpperLung: s.rightUpperLung } : {}),
          ...(s.rightLowerLung ? { rightLowerLung: s.rightLowerLung } : {}),
          heartSound: s.heartSound,
          additionalSounds: s.additionalSounds,
          description: s.description,
        };
      }
    }
  } catch {
    // Protocol system not available — fall through to legacy mapping
  }

  // ----- LEGACY CATEGORY-BASED MAPPING (fallback) -----

  // Upper airway obstruction — stridor-dominant conditions
  // (croup, epiglottitis, bacterial tracheitis, severe anaphylaxis with angioedema,
  // foreign-body upper airway, post-extubation stridor)
  const hasStridorFeatures =
    sub.includes('croup') ||
    sub.includes('epiglottitis') ||
    sub.includes('tracheitis') ||
    sub.includes('upper-airway') ||
    sub.includes('laryng') ||
    says('stridor') ||
    findingsStr.includes('barking cough') ||
    findingsStr.includes('laryngospasm') ||
    says('angioedema');
  if (hasStridorFeatures) {
    const spo2 = initialVitals?.spo2 ?? 95;
    // Critical — silent chest with exhaustion (pre-arrest)
    if (spo2 < 85) {
      return {
        leftLung: 'diminished',
        rightLung: 'diminished',
        heartSound: 'tachycardic',
        additionalSounds: ['Stridor audible without stethoscope', 'Severe tracheal tug', 'Near-complete upper airway obstruction'],
        description: 'Critical upper airway obstruction — diminished air entry with loud inspiratory stridor transmitted over trachea and chest.',
      };
    }
    return {
      leftLung: 'stridor',
      rightLung: 'stridor',
      heartSound: spo2 < 94 ? 'tachycardic' : 'normal',
      additionalSounds: [
        'Harsh inspiratory stridor (transmitted over chest)',
        'Worse with agitation/crying',
        ...(findingsStr.includes('barking') ? ['Barking/seal-like cough'] : []),
      ],
      description: 'Inspiratory stridor transmitted over the upper chest from upper airway narrowing. Lung fields otherwise clear — stridor is an upper airway sound.',
    };
  }

  // Anaphylaxis — combination of stridor (upper airway) and wheeze (lower airway)
  if (
    sub.includes('anaphyla') ||
    says('anaphyla') ||
    (cat === 'metabolic' && sub.includes('allerg'))
  ) {
    const spo2 = initialVitals?.spo2 ?? 94;
    // Severe anaphylaxis — stridor from laryngeal angioedema + tachycardia
    if (spo2 < 90 || says('angioedema') || says('throat swelling')) {
      return {
        leftLung: 'stridor',
        rightLung: 'wheeze',
        heartSound: 'tachycardic',
        additionalSounds: ['Stridor from laryngeal oedema', 'Expiratory wheeze (lower airway)', 'Urticaria', 'Hypotension'],
        description: 'Mixed stridor (upper airway oedema) and wheeze (bronchospasm). Severe anaphylactic airway compromise.',
      };
    }
    // Typical anaphylaxis — bronchospasm
    return {
      leftLung: 'wheeze',
      rightLung: 'wheeze',
      heartSound: 'tachycardic',
      additionalSounds: ['Bilateral wheeze', 'Urticaria / flushing', 'Tachycardia'],
      description: 'Bilateral expiratory wheeze from bronchospasm. Anaphylaxis.',
    };
  }

  // Opioid overdose / unconscious with depressed respiration — snoring respirations
  if (
    sub.includes('opioid') ||
    sub.includes('heroin') ||
    sub.includes('fentanyl') ||
    findingsStr.includes('pinpoint pupils') ||
    ((cat === 'toxicology' || cat === 'toxicological') &&
      initialVitals?.respiration !== undefined && initialVitals.respiration < 10)
  ) {
    const rr = initialVitals?.respiration ?? 8;
    if (rr === 0 || findingsStr.includes('apnea') || findingsStr.includes('respiratory arrest')) {
      return {
        leftLung: 'absent',
        rightLung: 'absent',
        heartSound: 'bradycardic',
        additionalSounds: ['Apnea — no air movement', 'Pinpoint pupils', 'Requires immediate BVM'],
        description: 'No breath sounds — respiratory arrest. Bradycardia. Opioid toxidrome.',
      };
    }
    return {
      leftLung: 'snoring',
      rightLung: 'snoring',
      heartSound: 'bradycardic',
      additionalSounds: ['Sonorous respirations', 'Pinpoint pupils', 'Shallow, slow breathing'],
      description: 'Snoring respirations from opioid-induced CNS depression. Shallow rate. Requires airway support.',
    };
  }

  // Cardiac arrest — catch all subcategories (asystole, PEA, VF, VT arrest, drowning arrest, etc.)
  if (
    sub.includes('asystole') ||
    sub.includes('pea') ||
    sub === 'cardiac-arrest' ||
    sub === 'vf-arrest' ||
    sub === 'vt-arrest' ||
    (findingsStr.includes('pulseless') && findingsStr.includes('apneic')) ||
    (sub.includes('arrest') && (cat === 'cardiac' || cat === 'environmental' || cat === 'burns' || cat === 'trauma'))
  ) {
    return {
      leftLung: 'absent',
      rightLung: 'absent',
      heartSound: 'absent',
      additionalSounds: ['No pulse palpable', 'Agonal gasps may be present'],
      description: 'No breath sounds. No heart sounds. Cardiac arrest.',
    };
  }

  // Respiratory cases
  if (cat === 'respiratory') {
    if (sub.includes('asthma') || says('wheez') || says('bronchospasm')) {
      // Severity-based asthma sounds (fallback when protocol not matched)
      const spo2 = initialVitals?.spo2 ?? 94;
      const rr = initialVitals?.respiration ?? 24;

      if (spo2 < 85 || rr < 12) {
        // Life-threatening — silent chest
        return {
          leftLung: 'absent',
          rightLung: 'absent',
          heartSound: 'tachycardic',
          additionalSounds: ['SILENT CHEST — no air movement', 'Exhaustion', 'Cyanosis'],
          description: 'SILENT CHEST — no breath sounds despite respiratory effort. CRITICAL — near-complete airway obstruction.',
        };
      }
      if (spo2 < 90) {
        // Severe — diminished
        return {
          leftLung: 'diminished',
          rightLung: 'diminished',
          heartSound: 'tachycardic',
          additionalSounds: ['Severely diminished air entry', 'Severe accessory muscle use', 'Unable to complete sentences'],
          description: 'Severely diminished air entry bilaterally — poor air movement due to critical bronchospasm.',
        };
      }
      return {
        leftLung: 'wheeze',
        rightLung: 'wheeze',
        heartSound: 'tachycardic',
        additionalSounds: ['Audible wheeze on expiration', 'Use of accessory muscles'],
        description: 'Bilateral expiratory wheeze with prolonged expiratory phase. Tachycardic heart sounds.'
      };
    }
    if (sub.includes('copd') || findingsStr.includes('copd')) {
      return {
        leftLung: 'rhonchi',
        rightLung: 'rhonchi',
        heartSound: 'tachycardic',
        additionalSounds: ['Pursed-lip breathing', 'Barrel chest'],
        description: 'Mixed wheeze and rhonchi bilaterally. Prolonged expiration. Poor air entry at bases.'
      };
    }
    if (sub.includes('pneumothorax') || findingsStr.includes('pneumothorax')) {
      const isTension = sub.includes('tension') || findingsStr.includes('tension');
      // Determine which side is affected from findings
      const rightSided = findingsStr.includes('right');
      const leftSided = findingsStr.includes('left') && !findingsStr.includes('right');
      // Default to left if no laterality specified
      const affectedRight = rightSided && !leftSided;

      if (isTension) {
        // Tension pneumothorax — absent on affected side
        return {
          leftLung: affectedRight ? 'clear' : 'absent',
          rightLung: affectedRight ? 'absent' : 'clear',
          heartSound: 'tachycardic',
          additionalSounds: [
            `Tracheal deviation to ${affectedRight ? 'left' : 'right'}`,
            'Distended neck veins',
            `Hyper-resonant ${affectedRight ? 'right' : 'left'} chest`,
          ],
          description: `ABSENT breath sounds ${affectedRight ? 'right' : 'left'} hemithorax. Tension pneumothorax.`,
        };
      } else {
        // Simple pneumothorax — diminished on affected side
        return {
          leftLung: affectedRight ? 'clear' : 'diminished',
          rightLung: affectedRight ? 'diminished' : 'clear',
          heartSound: 'normal',
          additionalSounds: [`Reduced chest expansion on ${affectedRight ? 'right' : 'left'}`],
          description: `Diminished breath sounds ${affectedRight ? 'right' : 'left'} hemithorax.`,
        };
      }
    }
    if (sub.includes('pneumonia') || findingsStr.includes('pneumonia') || findingsStr.includes('consolidation')) {
      // Determine which side is affected from findings
      const rightPneumonia = findingsStr.includes('right') || findingsStr.includes('rll') || findingsStr.includes('right lower');
      const leftPneumonia = findingsStr.includes('left') && !rightPneumonia;
      // Default to left if no laterality specified
      const affectedRight = rightPneumonia && !leftPneumonia;
      return {
        leftLung: affectedRight ? 'clear' : 'crackles-fine',
        rightLung: affectedRight ? 'crackles-fine' : 'clear',
        // Lobar pneumonia is basal-predominant — fine crackles and bronchial
        // breathing over the consolidated base, a clearer apex above it.
        ...(affectedRight
          ? { rightUpperLung: 'clear' as const, rightLowerLung: 'crackles-fine' as const }
          : { leftUpperLung: 'clear' as const, leftLowerLung: 'crackles-fine' as const }),
        heartSound: 'tachycardic',
        additionalSounds: ['Productive cough', 'Fever'],
        description: affectedRight
          ? 'Fine inspiratory crackles at right base with bronchial breathing. Clear left lung.'
          : 'Fine inspiratory crackles at left base with bronchial breathing. Clear right lung.',
      };
    }
    if (sub.includes('pulmonary-embolism') || findingsStr.includes('embolism')) {
      return {
        leftLung: 'clear',
        rightLung: 'clear',
        heartSound: 'tachycardic',
        additionalSounds: ['Clear lungs despite significant hypoxia', 'Pleuritic chest pain'],
        description: 'Lungs surprisingly clear despite hypoxia. Tachycardic. Consider PE if hypoxic with clear lungs.'
      };
    }
    // Default respiratory. A hyperventilation / PE / clear-lung presentation
    // must NOT inherit the asthma wheeze — that is how students were taught
    // to reach for salbutamol on a panic attack.
    if (says('clear lung') || says('no wheeze') || says('clear bilaterally') || says('good air entry') || says('lungs clear') || says('clear lungs')) {
      return {
        leftLung: 'clear',
        rightLung: 'clear',
        heartSound: 'tachycardic',
        additionalSounds: ['Fast, deep breathing', 'Clear chest'],
        description: 'Clear lungs bilaterally with good air entry. Tachycardic from distress, not bronchospasm.',
      };
    }
    return {
      leftLung: 'wheeze',
      rightLung: 'wheeze',
      heartSound: 'tachycardic',
      additionalSounds: ['Increased work of breathing'],
      description: 'Bilateral wheeze with increased work of breathing.'
    };
  }

  // Cardiac cases
  if (cat === 'cardiac' || cat === 'cardiac-ecg') {
    if (sub.includes('arrest') || findingsStr.includes('arrest') || findingsStr.includes('pulseless')) {
      return {
        leftLung: 'absent',
        rightLung: 'absent',
        heartSound: 'absent',
        additionalSounds: ['No pulse palpable', 'Agonal gasps may be present'],
        description: 'No breath sounds. No heart sounds. Cardiac arrest.'
      };
    }
    if (sub.includes('heart-failure') || findingsStr.includes('heart failure') || findingsStr.includes('pulmonary edema') || findingsStr.includes('pulmonary oedema')) {
      return {
        leftLung: 'crackles-fine',
        rightLung: 'crackles-fine',
        // Cardiogenic pulmonary oedema fills the bases first — fine crackles
        // bibasally to the mid-zones, with relatively clear apices above.
        leftUpperLung: 'clear',
        rightUpperLung: 'clear',
        leftLowerLung: 'crackles-fine',
        rightLowerLung: 'crackles-fine',
        heartSound: 'gallop',
        additionalSounds: ['Peripheral edema', 'JVP elevated', 'Pink frothy sputum'],
        description: 'Bilateral fine crackles to mid-zones. S3 gallop rhythm. Signs of fluid overload.'
      };
    }
    if (findingsStr.includes('tamponade')) {
      return {
        leftLung: 'clear',
        rightLung: 'clear',
        heartSound: 'muffled',
        additionalSounds: ['Muffled heart sounds', 'Distended neck veins', 'Hypotension (Beck\'s triad)'],
        description: 'Clear lungs. Muffled heart sounds. Consider cardiac tamponade.'
      };
    }
    // Default cardiac (MI, ACS)
    return {
      leftLung: 'clear',
      rightLung: 'clear',
      heartSound: 'tachycardic',
      additionalSounds: ['Diaphoresis', 'Chest pain'],
      description: 'Clear lungs bilaterally. Tachycardic heart sounds. Regular rhythm.'
    };
  }

  // Trauma cases
  if (cat === 'trauma') {
    // Head injury with low GCS — airway compromise, not chest pathology
    if ((findingsStr.includes('head injury') || findingsStr.includes('tbi') || findingsStr.includes('gcs'))
        && initialVitals?.gcs !== undefined && initialVitals.gcs <= 8) {
      return {
        leftLung: 'snoring',
        rightLung: 'snoring',
        heartSound: 'tachycardic',
        additionalSounds: ['Sonorous breathing', 'Airway compromise from reduced consciousness', 'Potential aspiration risk'],
        description: 'Snoring respirations bilaterally — partial airway obstruction. Tachycardic. Needs airway management.'
      };
    }
    // Chest trauma specifically (NOT just any mention of chest in findings)
    if (sub.includes('chest') || sub.includes('thorax') || sub.includes('pneumothorax') || sub.includes('flail')
        || findingsStr.includes('pneumothorax') || findingsStr.includes('flail segment') || findingsStr.includes('haemothorax')) {
      return {
        leftLung: 'diminished',
        rightLung: 'clear',
        heartSound: 'tachycardic',
        additionalSounds: ['Chest wall tenderness', 'Guarding on affected side'],
        description: 'Diminished breath sounds on the injured side. Clear contralateral lung.'
      };
    }
    // Default trauma — clear lungs bilaterally
    return {
      leftLung: 'clear',
      rightLung: 'clear',
      heartSound: 'tachycardic',
      additionalSounds: ['Tachycardic — likely compensating for blood loss'],
      description: 'Clear lungs bilaterally. Tachycardic.'
    };
  }

  // Neurological — may have airway compromise
  if (cat === 'neurological') {
    if (findingsStr.includes('unconscious') || findingsStr.includes('unresponsive') || findingsStr.includes('gcs')) {
      return {
        leftLung: 'snoring',
        rightLung: 'snoring',
        heartSound: 'normal',
        additionalSounds: ['Sonorous breathing', 'Partial airway obstruction by tongue'],
        description: 'Snoring respirations indicating partial airway obstruction. Needs airway management.'
      };
    }
    return {
      leftLung: 'clear',
      rightLung: 'clear',
      heartSound: 'normal',
      additionalSounds: [],
      description: 'Clear lungs bilaterally. Normal heart sounds.'
    };
  }

  // Determine bowel sounds based on findings (applied to ALL cases, not just default path)
  let bowelSounds: BowelSoundType = 'normal';
  if (findingsStr.includes('ileus') || findingsStr.includes('paralytic')) bowelSounds = 'absent';
  else if (findingsStr.includes('peritonit') || findingsStr.includes('rigid abdomen')) bowelSounds = 'absent';
  else if (findingsStr.includes('bowel obstruct') || findingsStr.includes('vomiting') && findingsStr.includes('distend')) bowelSounds = 'tinkling';
  else if (findingsStr.includes('gastroenter') || findingsStr.includes('diarrh') || findingsStr.includes('food poison')) bowelSounds = 'hyperactive';
  else if (findingsStr.includes('constipat') || findingsStr.includes('post-op') || findingsStr.includes('opioid')) bowelSounds = 'hypoactive';
  else if (findingsStr.includes('aortic aneurysm') || findingsStr.includes('aaa')) bowelSounds = 'bruit';
  else if (findingsStr.includes('hunger') || findingsStr.includes('fasting') || findingsStr.includes('borborygmi')) bowelSounds = 'borborygmi';

  // Findings-driven lung-sound override for any case that the category
  // branches above didn't match. If the case notes say crackles /
  // wheeze / stridor / diminished, we should play those — otherwise a
  // metabolic case with "bibasilar crackles" as a fluid-overload finding
  // ended up silently returning 'clear'.
  // Negation-aware: "No wheeze" must NOT play a wheeze. The old
  // `includes('wheeze')` routed panic-attack (clear lungs) students onto an
  // asthma track — a case that says "No wheeze / Clear lung sounds" sounded
  // like bronchospasm.
  // NOTE: the strip MUST be a RegExp built from a string. A regex literal
  // cannot interpolate ${term}, so "No wheeze" never got stripped and the
  // lookbehind still saw a positive "wheez".
  const hasPositive = (term: string) => {
    const stripped = findingsStr.replace(
      new RegExp(`\\b(?:no|without|nil|denies|negative for|absent)\\s+(?:[\\w/]+\\s+){0,2}${term}[^,.;]*`, 'gi'),
      '',
    );
    return new RegExp(`(?<![\\w-])${term}`, 'i').test(stripped);
  };
  const mapLungFromFindings = (): BreathSoundType | null => {
    if (hasPositive('crackle') || hasPositive('rales') || hasPositive('pulmonary oedema') || hasPositive('pulmonary edema')) {
      return /coarse/i.test(findingsStr) ? 'crackles-coarse' : 'crackles-fine';
    }
    if (hasPositive('wheez')) return 'wheeze';
    if (hasPositive('rhonchi')) return 'rhonchi';
    if (hasPositive('stridor')) return 'stridor';
    if (hasPositive('absent breath') || hasPositive('silent chest')) return 'absent';
    if (hasPositive('diminished') || hasPositive('reduced air entry')) return 'diminished';
    return null;
  };
  const findingsLung = mapLungFromFindings();
  if (findingsLung) {
    // Basal-predominant crackle findings (bibasilar / "at the bases") crackle
    // at the lower zones with clearer apices; any other pattern stays uniform.
    const isBasalCrackle =
      (findingsLung === 'crackles-fine' || findingsLung === 'crackles-coarse') &&
      (findingsStr.includes('bibasilar') || findingsStr.includes('bibasal') ||
        findingsStr.includes('bases') || findingsStr.includes('basal'));
    return {
      leftLung: findingsLung,
      rightLung: findingsLung,
      ...(isBasalCrackle
        ? {
            leftUpperLung: 'clear' as const,
            rightUpperLung: 'clear' as const,
            leftLowerLung: findingsLung,
            rightLowerLung: findingsLung,
          }
        : {}),
      heartSound: 'normal',
      bowelSounds,
      additionalSounds: [],
      description: findingsStr.includes('bibasilar') || findingsStr.includes('bases')
        ? 'Bilateral basal crackles on auscultation.'
        : `${findingsLung.replace('-', ' ')} on auscultation.`,
    };
  }

  // Default for all other cases
  return {
    leftLung: 'clear',
    rightLung: 'clear',
    heartSound: 'normal',
    bowelSounds,
    additionalSounds: [],
    description: 'Clear lungs bilaterally. Normal heart sounds.'
  };
}

/**
 * Update clinical sounds after treatment.
 * Returns new sound state based on what treatment was applied, how many times,
 * and what other treatments are also active (for combination synergy effects).
 */
export function updateSoundsAfterTreatment(
  currentSounds: ClinicalSoundState,
  treatmentId: string,
  applicationCount: number, // How many times this treatment has been applied
  caseCategory: string,
  allAppliedTreatments?: string[], // All treatments that have been given so far
  caseSubcategory?: string,
): ClinicalSoundState {
  const sounds = { ...currentSounds };
  const cat = caseCategory.toLowerCase();
  const sub = (caseSubcategory || '').toLowerCase();
  const applied = new Set(allAppliedTreatments || []);

  // Helper: check if ipratropium has also been given (for combination bronchodilator therapy)
  const hasIpratropium = applied.has('nebulizer_ipratropium');
  const hasSteroid = applied.has('hydrocortisone_200mg');
  const hasAdrenaline = applied.has('adrenaline_im') || applied.has('adrenaline_1mg');
  const hasMagnesium = applied.has('magnesium_2g');
  const isAsthmaOrCopd = sub.includes('asthma') || sub.includes('copd') || cat === 'respiratory';

  switch (treatmentId) {
    case 'nebulizer_salbutamol': {
      // Salbutamol: Progressive improvement in bronchospasm
      // Response depends on severity (sound state) AND what other treatments are active
      const hasRespiratoryFindings = sounds.leftLung === 'wheeze' || sounds.rightLung === 'wheeze' ||
        sounds.leftLung === 'diminished' || sounds.rightLung === 'diminished' ||
        sounds.leftLung === 'rhonchi' || sounds.rightLung === 'rhonchi' ||
        sounds.leftLung === 'crackles-coarse' || sounds.rightLung === 'crackles-coarse' ||
        sounds.leftLung === 'absent' || sounds.rightLung === 'absent';

      if (hasRespiratoryFindings && isAsthmaOrCopd) {
        // Life-threatening / silent chest — salbutamol alone has minimal effect
        if (sounds.leftLung === 'absent' || sounds.rightLung === 'absent') {
          if (hasAdrenaline && hasIpratropium) {
            // With adrenaline + ipratropium, may start hearing some wheeze (improvement from silent!)
            sounds.leftLung = sounds.leftLung === 'absent' ? 'diminished' : sounds.leftLung;
            sounds.rightLung = sounds.rightLung === 'absent' ? 'diminished' : sounds.rightLung;
            sounds.description = 'Some air movement returning after combined bronchodilator therapy. Still critically limited.';
            sounds.additionalSounds = ['Faint wheeze now audible — air starting to move', 'Still in significant distress'];
          } else if (hasIpratropium) {
            // With ipratropium, very slight improvement
            sounds.description = 'Minimal response to salbutamol in near-fatal bronchospasm. Consider IM adrenaline and IV magnesium.';
            sounds.additionalSounds = ['Minimal air movement', 'Near-silent chest persists', 'Escalate treatment urgently'];
          } else {
            // Salbutamol alone in silent chest — very limited effect
            sounds.description = 'Salbutamol nebulized but minimal drug delivery to obstructed airways. Silent chest persists. Escalate immediately — add ipratropium, IM adrenaline, steroids.';
            sounds.additionalSounds = ['No significant improvement', 'Silent chest persists', 'Needs combination therapy urgently'];
          }
          break;
        }

        // Severe (diminished) — response depends on combination therapy
        if (sounds.leftLung === 'diminished' || sounds.rightLung === 'diminished') {
          if (hasIpratropium && (hasSteroid || hasAdrenaline)) {
            // Good combination → meaningful improvement
            sounds.leftLung = sounds.leftLung === 'diminished' ? 'wheeze' : sounds.leftLung;
            sounds.rightLung = sounds.rightLung === 'diminished' ? 'wheeze' : sounds.rightLung;
            sounds.description = 'Air entry improving with combination therapy. Wheeze now audible (positive sign — air is moving). Continue treatment.';
            sounds.additionalSounds = ['Wheeze returning — indicates improving air movement', 'Work of breathing reducing'];
          } else if (hasIpratropium) {
            sounds.description = 'Slight improvement with dual bronchodilation. Air entry still significantly reduced. Consider steroids and adrenaline.';
            sounds.additionalSounds = ['Marginal improvement', 'Still significant bronchospasm'];
          } else {
            // Salbutamol alone — partial at best
            if (applicationCount >= 2) {
              sounds.description = 'Second salbutamol given. Limited improvement with salbutamol alone in severe bronchospasm. Add ipratropium and systemic treatments.';
            } else {
              sounds.description = 'First salbutamol given. Limited response expected in severe bronchospasm with single agent. Prepare ipratropium, steroids.';
            }
            sounds.additionalSounds = ['Limited response to salbutamol alone', 'Combination therapy needed'];
          }
          break;
        }

        // Moderate (wheeze) — standard dose-dependent response, enhanced by combinations
        if (sounds.leftLung === 'wheeze' || sounds.rightLung === 'wheeze') {
          const combinationBonus = (hasIpratropium ? 1 : 0) + (hasSteroid ? 1 : 0) + (hasAdrenaline ? 1 : 0) + (hasMagnesium ? 1 : 0);
          const effectiveDose = applicationCount + combinationBonus;

          if (effectiveDose >= 4) {
            // Full protocol or multiple doses — near-complete resolution
            sounds.leftLung = 'clear';
            sounds.rightLung = 'clear';
            sounds.description = 'Lungs now clear with comprehensive bronchodilator therapy. Good bilateral air entry. Excellent response to combination treatment.';
            sounds.additionalSounds = ['Air entry now equal bilaterally', 'No residual wheeze', 'Work of breathing normalised'];
          } else if (effectiveDose >= 2) {
            // Significant improvement — wheeze resolving toward clear
            sounds.leftLung = sounds.leftLung === 'wheeze' ? 'clear' : sounds.leftLung;
            sounds.rightLung = sounds.rightLung === 'wheeze' ? 'clear' : sounds.rightLung;
            sounds.description = hasIpratropium
              ? 'Significant improvement with combined salbutamol and ipratropium. Wheeze resolved. Good bilateral air entry.'
              : 'Wheeze resolved after repeat salbutamol. Consider adding ipratropium if symptoms recur.';
            sounds.additionalSounds = hasIpratropium
              ? ['Lungs clear with dual bronchodilation', 'Good air entry bilaterally']
              : ['Wheeze resolved', 'Good air entry returning', 'Monitor for recurrence'];
          } else {
            // First salbutamol on MODERATE wheeze — moderate asthma responds
            // well to a single nebuliser, so give a perceptible improvement
            // (audible wheeze → clear) rather than no change. Severe/silent
            // chest still requires escalation (handled above).
            sounds.leftLung = sounds.leftLung === 'wheeze' ? 'clear' : sounds.leftLung;
            sounds.rightLung = sounds.rightLung === 'wheeze' ? 'clear' : sounds.rightLung;
            sounds.description = 'Good response to salbutamol — wheeze largely resolved, air entry improved. Reassess; repeat if it recurs and add ipratropium if the response is incomplete.';
            sounds.additionalSounds = ['Wheeze resolving — air entry improving', 'Work of breathing reducing', 'Reassess and repeat as needed'];
          }
          break;
        }

        // Coarse crackles (secretions) — modest response to bronchodilator +
        // anticholinergic (ipratropium dries secretions). NOTE: fine crackles
        // (pulmonary oedema) are deliberately NOT eased by bronchodilators —
        // they need CPAP / GTN / diuresis, handled elsewhere.
        if (sounds.leftLung === 'crackles-coarse' || sounds.rightLung === 'crackles-coarse') {
          if (applicationCount >= 2 || hasIpratropium) {
            sounds.leftLung = sounds.leftLung === 'crackles-coarse' ? 'clear' : sounds.leftLung;
            sounds.rightLung = sounds.rightLung === 'crackles-coarse' ? 'clear' : sounds.rightLung;
            sounds.description = 'Coarse crackles clearing with bronchodilator + anticholinergic therapy. Air entry improving.';
            sounds.additionalSounds = ['Secretions clearing', 'Improving air entry'];
          } else {
            sounds.description = 'Partial response. Coarse crackles persist — add ipratropium to dry secretions and repeat salbutamol.';
            sounds.additionalSounds = ['Some improvement', 'Coarse crackles persisting'];
          }
          break;
        }

        // Rhonchi (COPD pattern)
        if (sounds.leftLung === 'rhonchi' || sounds.rightLung === 'rhonchi') {
          if (applicationCount >= 2 || hasIpratropium) {
            sounds.leftLung = sounds.leftLung === 'rhonchi' ? 'diminished' : sounds.leftLung;
            sounds.rightLung = sounds.rightLung === 'rhonchi' ? 'diminished' : sounds.rightLung;
            sounds.description = 'Rhonchi clearing with bronchodilator therapy. Air entry improving.';
            sounds.additionalSounds = ['Secretions clearing', 'Improving air entry'];
          } else {
            sounds.description = 'Partial response after salbutamol. Rhonchi still present. Consider ipratropium.';
            sounds.additionalSounds = ['Slight improvement in air movement', 'Rhonchi persisting'];
          }
          break;
        }
      } else if (hasRespiratoryFindings) {
        // Non-respiratory case — original basic logic
        if (applicationCount === 1) {
          sounds.description = 'Wheeze slightly improved after salbutamol. Still present.';
          sounds.additionalSounds = ['Wheeze improving but still present'];
        } else if (applicationCount >= 2) {
          sounds.leftLung = sounds.leftLung === 'wheeze' ? 'clear' : sounds.leftLung;
          sounds.rightLung = sounds.rightLung === 'wheeze' ? 'clear' : sounds.rightLung;
          sounds.description = 'Wheeze resolved after repeat salbutamol.';
          sounds.additionalSounds = ['Air entry now clear bilaterally'];
        }
      }
      break;
    }

    case 'nebulizer_ipratropium': {
      // Ipratropium: Complementary bronchodilation — works via different mechanism to salbutamol
      const hasSalbutamol = applied.has('nebulizer_salbutamol');
      const hasRespiratoryIssues = sounds.leftLung === 'wheeze' || sounds.rightLung === 'wheeze' ||
        sounds.leftLung === 'rhonchi' || sounds.rightLung === 'rhonchi' ||
        sounds.leftLung === 'crackles-coarse' || sounds.rightLung === 'crackles-coarse' ||
        sounds.leftLung === 'diminished' || sounds.rightLung === 'diminished' ||
        sounds.leftLung === 'absent' || sounds.rightLung === 'absent';

      if (hasRespiratoryIssues) {
        if (sounds.leftLung === 'absent' || sounds.rightLung === 'absent') {
          // Silent chest — ipratropium alone not enough, but note it's been given
          sounds.description = hasSalbutamol
            ? 'Dual bronchodilation in progress for severe bronchospasm. Minimal change yet — consider IM adrenaline.'
            : 'Ipratropium given. Very limited drug delivery to obstructed airways. Give salbutamol concurrently.';
          sounds.additionalSounds = hasSalbutamol
            ? ['Dual bronchodilation initiated', 'Awaiting response', 'Consider systemic adrenaline']
            : ['Ipratropium alone insufficient', 'Add salbutamol urgently'];
        } else if (hasSalbutamol) {
          // Combined with salbutamol — enhanced effect
          if (sounds.leftLung === 'diminished' || sounds.rightLung === 'diminished') {
            sounds.leftLung = sounds.leftLung === 'diminished' ? 'wheeze' : sounds.leftLung;
            sounds.rightLung = sounds.rightLung === 'diminished' ? 'wheeze' : sounds.rightLung;
            sounds.description = 'Dual bronchodilation showing effect — air movement improving. Wheeze now audible (positive sign). Continue treatment.';
            sounds.additionalSounds = ['Air entry improving with combination therapy', 'Wheeze returning as airways open'];
          } else {
            sounds.leftLung = (sounds.leftLung === 'wheeze' || sounds.leftLung === 'rhonchi' || sounds.leftLung === 'crackles-coarse') ? 'clear' : sounds.leftLung;
            sounds.rightLung = (sounds.rightLung === 'wheeze' || sounds.rightLung === 'rhonchi' || sounds.rightLung === 'crackles-coarse') ? 'clear' : sounds.rightLung;
            sounds.description = 'Good response to combined salbutamol and ipratropium. Bronchospasm resolved.';
            sounds.additionalSounds = ['Dual bronchodilation effective', 'Lungs clearing', 'Air entry normalising'];
          }
        } else {
          // Ipratropium alone — slower, partial effect
          sounds.leftLung = sounds.leftLung === 'rhonchi' ? 'diminished' : sounds.leftLung;
          sounds.rightLung = sounds.rightLung === 'rhonchi' ? 'diminished' : sounds.rightLung;
          sounds.description = 'Some improvement with ipratropium. For optimal effect, combine with salbutamol.';
          sounds.additionalSounds = ['Partial bronchodilation', 'Consider adding salbutamol'];
        }
      }
      break;
    }

    case 'oxygen_nonrebreather':
    case 'oxygen_mask':
    case 'oxygen_venturi':
    case 'oxygen_nasal': {
      // Oxygen doesn't change lung sounds directly, but update description
      sounds.description = `${sounds.description} Supplemental oxygen applied.`;
      sounds.additionalSounds = [...sounds.additionalSounds.filter(s => !s.includes('oxygen')), 'Oxygen therapy in progress'];
      break;
    }

    case 'suction': {
      // Suctioning clears secretions
      if (sounds.leftLung === 'crackles-coarse' || sounds.rightLung === 'crackles-coarse') {
        sounds.leftLung = sounds.leftLung === 'crackles-coarse' ? 'clear' : sounds.leftLung;
        sounds.rightLung = sounds.rightLung === 'crackles-coarse' ? 'clear' : sounds.rightLung;
        sounds.description = 'Secretions cleared by suction. Improved air entry.';
        sounds.additionalSounds = ['Secretions suctioned', 'Improved air entry'];
      }
      if (sounds.leftLung === 'snoring' || sounds.rightLung === 'snoring') {
        sounds.leftLung = sounds.leftLung === 'snoring' ? 'clear' : sounds.leftLung;
        sounds.rightLung = sounds.rightLung === 'snoring' ? 'clear' : sounds.rightLung;
        sounds.description = 'Airway cleared by suction. Snoring respirations resolved.';
      }
      break;
    }

    case 'airway_open':
    case 'opa_insert': {
      // Airway management resolves snoring/obstruction
      if (sounds.leftLung === 'snoring' || sounds.rightLung === 'snoring') {
        sounds.leftLung = 'clear';
        sounds.rightLung = 'clear';
        sounds.description = 'Airway opened — snoring respirations resolved. Clear air entry bilaterally.';
        sounds.additionalSounds = ['Airway patent', 'Good tidal volume'];
      }
      break;
    }

    case 'intubation': {
      // Definitive airway — clears any obstruction sounds
      sounds.leftLung = 'clear';
      sounds.rightLung = 'clear';
      sounds.description = 'Endotracheal tube in place. Bilateral clear air entry confirmed. Good chest rise.';
      sounds.additionalSounds = ['ETT secured', 'ETCO2 confirmed', 'Bilateral air entry confirmed'];
      break;
    }

    case 'needle_decompression': {
      // Tension pneumothorax decompressed
      if (sounds.leftLung === 'absent') {
        sounds.leftLung = 'diminished';
        sounds.description = 'Rush of air on needle insertion. Breath sounds partially returning on left. Chest expansion improving.';
        sounds.additionalSounds = ['Rush of air on decompression', 'Partial breath sounds returning', 'JVP reducing'];
      } else if (sounds.rightLung === 'absent') {
        sounds.rightLung = 'diminished';
        sounds.description = 'Rush of air on needle insertion. Breath sounds partially returning on right.';
        sounds.additionalSounds = ['Rush of air on decompression', 'Partial breath sounds returning'];
      }
      break;
    }

    case 'cpr': {
      // CPR generates some sound changes
      sounds.description = 'CPR in progress. Auscultation limited during compressions.';
      sounds.additionalSounds = ['Compressions in progress', 'Check rhythm at 2-minute intervals'];
      break;
    }

    case 'defibrillation': {
      // After successful defib
      if (sounds.heartSound === 'absent') {
        sounds.heartSound = 'tachycardic';
        sounds.description = 'Post-defibrillation: Heart sounds returning. Monitor rhythm closely.';
        sounds.additionalSounds = ['ROSC achieved', 'Monitor for re-arrest'];
      }
      break;
    }

    case 'fowlers_position': {
      // Upright positioning helps respiratory patients — significantly in asthma/COPD
      if (cat === 'respiratory' || cat === 'cardiac') {
        if (isAsthmaOrCopd) {
          sounds.description = `${sounds.description} Positioned upright — optimises diaphragm excursion and improves ventilation.`;
          sounds.additionalSounds = [
            ...sounds.additionalSounds.filter(s => !s.includes('position')),
            'Upright position — improved ventilation',
            'Reduced work of breathing',
          ];
        } else {
          sounds.description = `${sounds.description} Positioned upright — may improve ventilation.`;
          sounds.additionalSounds = [...sounds.additionalSounds.filter(s => !s.includes('position')), 'Positioned semi-upright'];
        }
      }
      break;
    }

    case 'supine_position': {
      // Lying flat is harmful for respiratory distress patients
      if (isAsthmaOrCopd && (sounds.leftLung === 'wheeze' || sounds.leftLung === 'diminished' || sounds.leftLung === 'absent')) {
        sounds.description = `${sounds.description} WARNING: Supine position worsens respiratory distress — diaphragm splinted by abdominal contents.`;
        sounds.additionalSounds = [
          ...sounds.additionalSounds.filter(s => !s.includes('position')),
          'CAUTION: Supine position worsening dyspnoea',
          'Patient struggling more — sit upright',
        ];
      }
      break;
    }

    case 'adrenaline_im':
    case 'adrenaline_1mg': {
      // Adrenaline: potent systemic bronchodilator + vasopressor
      if (isAsthmaOrCopd) {
        // Severe/life-threatening asthma — adrenaline can be transformative
        if (sounds.leftLung === 'absent' || sounds.rightLung === 'absent') {
          sounds.leftLung = sounds.leftLung === 'absent' ? 'diminished' : sounds.leftLung;
          sounds.rightLung = sounds.rightLung === 'absent' ? 'diminished' : sounds.rightLung;
          sounds.description = 'IM adrenaline providing systemic bronchodilation. Faint air movement returning. Continue aggressive treatment.';
          sounds.additionalSounds = ['Some air entry detected', 'Adrenaline providing systemic bronchodilation', 'Continue nebulised treatment'];
        } else if (sounds.leftLung === 'diminished' || sounds.rightLung === 'diminished') {
          sounds.leftLung = sounds.leftLung === 'diminished' ? 'wheeze' : sounds.leftLung;
          sounds.rightLung = sounds.rightLung === 'diminished' ? 'wheeze' : sounds.rightLung;
          sounds.description = 'Improved air entry after adrenaline. Wheeze now audible — airways opening. Good systemic effect.';
          sounds.additionalSounds = ['Airways opening with systemic bronchodilation', 'Wheeze audible — positive sign'];
        }
      }
      // Anaphylaxis — resolves stridor and wheeze
      if (sub.includes('anaphylaxis')) {
        if (sounds.leftLung === 'stridor' || sounds.rightLung === 'stridor') {
          sounds.leftLung = sounds.leftLung === 'stridor' ? 'wheeze' : sounds.leftLung;
          sounds.rightLung = sounds.rightLung === 'stridor' ? 'wheeze' : sounds.rightLung;
          sounds.description = 'Stridor reducing after adrenaline. Airway oedema improving. Monitor for recurrence.';
          sounds.additionalSounds = ['Upper airway obstruction reducing', 'Mild residual wheeze', 'Monitor for biphasic reaction'];
        }
      }
      break;
    }

    case 'hydrocortisone_200mg': {
      // Steroids: delayed effect but prevents recurrence
      if (isAsthmaOrCopd) {
        sounds.description = `${sounds.description} Steroid given — will reduce airway inflammation over 4-6 hours.`;
        sounds.additionalSounds = [
          ...sounds.additionalSounds.filter(s => !s.includes('steroid')),
          'Corticosteroid administered — addresses airway inflammation',
        ];
      }
      break;
    }

    case 'magnesium_2g': {
      // IV Magnesium: smooth muscle relaxation in severe asthma
      if (isAsthmaOrCopd) {
        if (sounds.leftLung === 'diminished' || sounds.rightLung === 'diminished') {
          sounds.description = `${sounds.description} IV magnesium providing additional bronchodilation.`;
          sounds.additionalSounds = [
            ...sounds.additionalSounds.filter(s => !s.includes('magnesium')),
            'IV magnesium — smooth muscle relaxation',
            'Complementing bronchodilator therapy',
          ];
        }
      }
      break;
    }

    case 'recovery_position': {
      // Recovery position — helps post-ictal, stroke, unconscious patients
      if (sounds.leftLung === 'snoring' || sounds.rightLung === 'snoring') {
        sounds.leftLung = sounds.leftLung === 'snoring' ? 'clear' : sounds.leftLung;
        sounds.rightLung = sounds.rightLung === 'snoring' ? 'clear' : sounds.rightLung;
        sounds.description = 'Recovery position applied — airway opening. Snoring respirations resolved. Drainage of secretions facilitated.';
        sounds.additionalSounds = ['Airway patent in recovery position', 'Secretions draining', 'Good tidal volume'];
      }
      break;
    }
  }

  // Per-zone overrides describe the *initial* presentation (e.g. basal
  // crackles with clear apices). Once a treatment changes a side's overall
  // breath sound, that lung is evolving as a whole — drop the side's zone
  // overrides so the new per-side value is heard across both of its zones,
  // rather than leaving a stale basal crackle behind after the lung clears.
  if (sounds.leftLung !== currentSounds.leftLung) {
    delete sounds.leftUpperLung;
    delete sounds.leftLowerLung;
  }
  if (sounds.rightLung !== currentSounds.rightLung) {
    delete sounds.rightUpperLung;
    delete sounds.rightLowerLung;
  }

  return sounds;
}

// ============================================================================
// WEB AUDIO API - Sound Generation
// ============================================================================

let audioContext: AudioContext | null = null;
let currentOscillators: OscillatorNode[] = [];
let currentGainNode: GainNode | null = null;

// ============================================================================
// Real recordings layer — when a CC-licensed recording exists for a sound
// type, we play that instead of the WebAudio synthesis. Synthesis stays as
// the fallback for any type without a recording, so coverage can grow file
// by file. Files live in /public/sounds/auscultation/ and are listed in
// public/sounds/auscultation/CREDITS.md with their source + licence.
//
// To add a recording: drop the file in that folder and add its path here.
// A `null`/absent entry means "synthesise this one".
// ============================================================================
const BREATH_RECORDINGS: Partial<Record<BreathSoundType, string>> = {
  'clear': '/sounds/auscultation/breath-clear.mp3',                // CC BY 4.0, SPRSound (normal vesicular, paediatric)
  'wheeze': '/sounds/auscultation/breath-wheeze.mp3',               // CC BY-SA 3.0, James Heilman MD
  'crackles-fine': '/sounds/auscultation/breath-crackles-fine.mp3', // CC BY-SA 3.0, James Heilman MD
  'crackles-coarse': '/sounds/auscultation/breath-crackles-coarse.mp3', // CC BY 4.0, SPRSound
  'rhonchi': '/sounds/auscultation/breath-rhonchi.mp3',            // CC BY 4.0, SPRSound
  'stridor': '/sounds/auscultation/breath-stridor.mp3',            // CC BY-SA 3.0, James Heilman MD
  'diminished': '/sounds/auscultation/breath-diminished.mp3',      // CC BY 4.0, SPRSound (real vesicular, attenuated)
  'snoring': '/sounds/auscultation/breath-snoring.mp3',            // CC0, Daxter31/Freesound
  // absent: synthesised (it is silence by definition).
};
const HEART_RECORDINGS: Partial<Record<HeartSoundType, string>> = {
  'normal': '/sounds/auscultation/heart-normal.mp3',               // CC BY 3.0, Benboncan/Freesound
  'murmur-systolic': '/sounds/auscultation/heart-murmur.mp3',      // CC BY-SA 4.0, EmilyHopeS (systolic MVP)
  'irregular': '/sounds/auscultation/heart-irregular.mp3',         // CC BY-SA 3.0, James Heilman MD (AF)
  // gallop (S3/S4) / muffled: synthesised (no labelled CC recording exists).
};
const BOWEL_RECORDINGS: Partial<Record<BowelSoundType, string>> = {
  'normal': '/sounds/auscultation/bowel-normal.mp3',               // CC BY 4.0, Z. Mansour/Figshare (active bowel sounds)
  'hyperactive': '/sounds/auscultation/bowel-hyperactive.mp3',     // CC BY-SA 3.0, James Heilman MD (SBO borborygmi)
  'hypoactive': '/sounds/auscultation/bowel-hypoactive.mp3',       // CC BY 4.0, Z. Mansour/Figshare (sparse window)
  // absent: synthesised (it is silence by definition).
};

// Respiratory-cycle length (seconds) of each breath recording, measured from
// the source files (duration / cycle count). Used to phase-lock and
// rate-match the loop to the on-screen chest rise.
const BREATH_CYCLE_SEC: Partial<Record<BreathSoundType, number>> = {
  'clear': 3.5,            // 7.0s / 2 cycles
  'wheeze': 4.23,          // 8.46s / 2
  'crackles-fine': 4.65,   // 13.95s / 3
  'crackles-coarse': 3.15, // 6.3s / 2
  'rhonchi': 4.05,         // 8.1s / 2
  'stridor': 3.84,         // 15.37s / 4
  'diminished': 3.5,       // 7.0s / 2
  'snoring': 3.9,          // 46.8s / 12
};

// Active recorded-audio elements, tracked so stopAllSounds() can halt them.
const activeRecordings = new Set<HTMLAudioElement>();

/**
 * Play a recorded clinical sound, looping it to fill `durationMs` (real
 * auscultation clips are short; the student listens for several seconds).
 * Returns true if playback started, false on any failure so the caller can
 * fall back to synthesis. Honours the same gesture-unlock as the rest of the
 * audio — by the time a student auscultates, audio is already unlocked.
 */
function playRecordedSound(
  url: string,
  durationMs: number,
  breathSync?: { cycleSec: number },
): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.9;
    if (breathSync) {
      // Match the recording's respiratory cycle to the on-screen chest rise:
      // rate-match (clamped so it still sounds like breathing), then seek to
      // the body's current point in the breath so inhale lines up.
      const rpm = getBreathRpm();
      if (rpm > 0) {
        const targetCycleSec = 60 / rpm;
        const rate = Math.max(0.55, Math.min(2.0, breathSync.cycleSec / targetCycleSec));
        audio.playbackRate = rate;
        audio.preservesPitch = false;
        const seek = getBreathPhase01() * breathSync.cycleSec;
        audio.addEventListener('loadedmetadata', () => {
          try {
            if (Number.isFinite(audio.duration) && audio.duration > 0) {
              audio.currentTime = seek % audio.duration;
            }
          } catch { /* seek is best-effort */ }
        }, { once: true });
      }
    }
    activeRecordings.add(audio);
    const stopAt = window.setTimeout(() => {
      try { audio.pause(); } catch { /* noop */ }
      activeRecordings.delete(audio);
    }, durationMs);
    audio.addEventListener('error', () => {
      window.clearTimeout(stopAt);
      activeRecordings.delete(audio);
    });
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        window.clearTimeout(stopAt);
        activeRecordings.delete(audio);
      });
    }
    return true;
  } catch {
    return false;
  }
}

/** Stop any recorded sounds currently playing (called by stopAllSounds). */
function stopRecordedSounds(): void {
  activeRecordings.forEach((a) => { try { a.pause(); } catch { /* noop */ } });
  activeRecordings.clear();
}

// Mobile browsers (iOS Safari especially) create AudioContexts in a suspended
// state and refuse to resume unless the resume() call originates inside a
// user gesture. Track contexts that need unlocking so we can resume them
// on the first touch/click anywhere in the app.
const pendingContexts = new Set<AudioContext>();
let unlockListenerAttached = false;

function attachUnlockListener() {
  if (unlockListenerAttached || typeof window === 'undefined') return;
  unlockListenerAttached = true;
  const unlock = () => {
    pendingContexts.forEach(ctx => {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => { /* iOS may still refuse; next gesture will retry */ });
      }
    });
    pendingContexts.clear();
  };
  // Use capture + passive so we don't interfere with other handlers, and listen
  // for both pointer and touch events because iOS is finicky.
  const opts = { capture: true, passive: true } as AddEventListenerOptions;
  window.addEventListener('touchstart', unlock, opts);
  window.addEventListener('touchend', unlock, opts);
  window.addEventListener('mousedown', unlock, opts);
  window.addEventListener('click', unlock, opts);
  window.addEventListener('keydown', unlock, opts);
}

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === 'closed') {
    const Ctor: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    audioContext = new Ctor();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => { /* needs user gesture */ });
    pendingContexts.add(audioContext);
    attachUnlockListener();
  }
  return audioContext;
}

/**
 * Register an external AudioContext so it will be resumed on the next user
 * gesture. Used by the VitalSignsMonitor audio engine to share the unlock
 * mechanism with the clinical sounds system.
 */
export function registerAudioContextForUnlock(ctx: AudioContext): void {
  if (ctx.state === 'suspended') {
    pendingContexts.add(ctx);
    attachUnlockListener();
  }
}

/**
 * Stop all currently playing sounds
 */
export function stopAllSounds(): void {
  currentOscillators.forEach(osc => {
    try { osc.stop(); } catch { /* already stopped */ }
  });
  currentOscillators = [];
  if (currentGainNode) {
    currentGainNode.disconnect();
    currentGainNode = null;
  }
  stopRecordedSounds();
}

/**
 * Helper: create a shaped noise buffer (pink-ish noise for more natural breath sounds)
 * Pink noise has more energy at low frequencies — closer to real biological sounds.
 */
function createPinkNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const bufferSize = Math.floor(ctx.sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Voss-McCartney approximation of pink noise using multiple white noise sources at octave rates
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

/**
 * Helper: apply a cyclic breathing envelope to a buffer
 * breathRate: breaths per second (e.g., 0.25 = 15/min, 0.33 = 20/min)
 * ieRatio: inspiration:expiration ratio (< 1 means longer expiration, normal ~0.5)
 * inspirationEmphasis: how much louder inspiration is vs expiration (1.0 = equal)
 */
function applyBreathingEnvelope(
  data: Float32Array,
  sampleRate: number,
  breathRate: number = 0.3,
  ieRatio: number = 0.45,
  inspirationEmphasis: number = 1.0,
  baseVolume: number = 0.05,
): void {
  const cycleSamples = Math.floor(sampleRate / breathRate);
  const inspirationLen = Math.floor(cycleSamples * ieRatio);

  for (let i = 0; i < data.length; i++) {
    const posInCycle = i % cycleSamples;
    let envelope: number;

    if (posInCycle < inspirationLen) {
      // Inspiration phase: gradual rise then fall
      const t = posInCycle / inspirationLen;
      // Smooth bell curve for inspiration
      envelope = Math.sin(Math.PI * t) * inspirationEmphasis;
    } else {
      // Expiration phase: gradual rise then fall
      const t = (posInCycle - inspirationLen) / (cycleSamples - inspirationLen);
      envelope = Math.sin(Math.PI * t);
    }

    // Add a brief quiet gap between breaths (at transitions)
    const transitionWidth = 0.05 * cycleSamples;
    if (posInCycle < transitionWidth) {
      envelope *= posInCycle / transitionWidth;
    }
    if (posInCycle > cycleSamples - transitionWidth) {
      envelope *= (cycleSamples - posInCycle) / transitionWidth;
    }

    data[i] *= (envelope * (1 - baseVolume) + baseVolume);
  }
}

/**
 * Play a breath sound for the specified duration.
 * Uses Web Audio API with clinically accurate sound synthesis:
 * - Pink noise base for natural biological sound character
 * - Proper breathing envelopes with inspiration/expiration phases
 * - Characteristic spectral shaping per pathology
 * - Layered sound design for complex sounds (wheeze, crackles)
 */
export function playBreathSound(soundType: BreathSoundType, durationMs: number = 4000): void {
  stopAllSounds();

  // Apnoea: no airflow means no breath sounds — an accurate, important
  // "finding" in itself. Don't loop a breathing recording over a still chest.
  if (getBreathRpm() <= 0 && soundType !== 'absent') {
    return;
  }

  // Prefer a real recording when one exists for this sound type — phase- and
  // rate-locked to the visible chest rise so inhale/exhale match what the
  // student sees.
  const rec = BREATH_RECORDINGS[soundType];
  const cycleSec = BREATH_CYCLE_SEC[soundType];
  if (rec && playRecordedSound(rec, durationMs, cycleSec ? { cycleSec } : undefined)) return;

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.55, ctx.currentTime);
  masterGain.connect(ctx.destination);
  currentGainNode = masterGain;

  const duration = durationMs / 1000;

  switch (soundType) {
    case 'clear': {
      // VESICULAR BREATH SOUNDS
      // Soft, low-pitched rustling heard throughout inspiration and early expiration.
      // Inspiration is longer and louder than expiration (~3:1).
      // Frequency range: 100-1000 Hz, peak around 200-400 Hz.
      const noiseBuffer = createPinkNoiseBuffer(ctx, duration);
      const data = noiseBuffer.getChannelData(0);

      // Apply vesicular breathing envelope: inspiration louder, expiration softer
      applyBreathingEnvelope(data, ctx.sampleRate, 0.28, 0.55, 1.4, 0.08);

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;

      // Bandpass filter: vesicular sounds live in 100-800 Hz
      const bpFilter = ctx.createBiquadFilter();
      bpFilter.type = 'bandpass';
      bpFilter.frequency.value = 350;
      bpFilter.Q.value = 0.5; // wide band

      // Gentle low-pass rolloff for body-transmitted character
      const lpFilter = ctx.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.frequency.value = 900;
      lpFilter.Q.value = 0.7;

      source.connect(bpFilter);
      bpFilter.connect(lpFilter);
      lpFilter.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'wheeze': {
      // EXPIRATORY WHEEZE
      //
      // Physics: turbulent airflow through narrowed bronchi creates a
      // whistle whose pitch depends on the narrowed airway's resonant
      // frequency. The ACOUSTIC truth is "noise forced through a narrow
      // resonance" — not an oscillator. So we synthesise it the same way:
      //
      //   pink noise  ─►  narrow bandpass (Q≈18)  ─►  expiratory envelope
      //
      // That alone produces the characteristic breathy whistle without any
      // oscillator artefacts. We layer two such resonances at slightly
      // different pitches for the faint "polyphonic" colouring real wheeze
      // has, and glide the centre frequency up through each expiration
      // (classic rising wheeze as airways narrow with the outbreath). The
      // result is breathy, musical, organic — no sawtooth buzz.

      const breathRate = 0.3; // ~18 /min
      const cycleSamples = Math.floor(ctx.sampleRate / breathRate);
      const inspirationLen = Math.floor(cycleSamples * 0.38);

      // ---- Underlying vesicular breath sounds (quiet bed) -----------------
      const bedBuffer = createPinkNoiseBuffer(ctx, duration);
      const bedData = bedBuffer.getChannelData(0);
      applyBreathingEnvelope(bedData, ctx.sampleRate, breathRate, 0.38, 1.0, 0.03);
      for (let i = 0; i < bedData.length; i++) bedData[i] *= 0.35;
      const bedSrc = ctx.createBufferSource();
      bedSrc.buffer = bedBuffer;
      const bedLp = ctx.createBiquadFilter();
      bedLp.type = 'lowpass';
      bedLp.frequency.value = 900;
      bedSrc.connect(bedLp);
      bedLp.connect(masterGain);
      bedSrc.start();
      bedSrc.stop(ctx.currentTime + duration);

      // ---- The wheeze itself: two resonant noise streams ------------------
      // Fundamental resonance ~350 Hz + a weaker "buddy" a minor-3rd up.
      // This double-band is what makes a wheeze sound *musical* rather than
      // whistled — real wheezes often have 2-3 audible tones.
      const resonances: Array<{ base: number; gain: number; q: number }> = [
        { base: 360, gain: 0.42, q: 18 },
        { base: 430, gain: 0.22, q: 22 },
      ];

      resonances.forEach(({ base, gain: bandGain, q }) => {
        // Fresh pink noise for each resonance so they're uncorrelated.
        const noiseBuf = createPinkNoiseBuffer(ctx, duration);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(base, ctx.currentTime);
        bp.Q.value = q;

        // Per-expiration glissando: pitch climbs ~80 Hz through each
        // outbreath. Restarts on the next cycle. Smooth, not stepped.
        for (let t = 0; t < duration; t += 1 / breathRate) {
          const expStart = t + inspirationLen / ctx.sampleRate;
          const cycleEnd = t + cycleSamples / ctx.sampleRate;
          // Reset to base at start of cycle
          bp.frequency.setValueAtTime(base, ctx.currentTime + t);
          // Hold through inspiration
          bp.frequency.setValueAtTime(base, ctx.currentTime + expStart);
          // Glide up through expiration
          bp.frequency.linearRampToValueAtTime(base + 85, ctx.currentTime + cycleEnd - 0.1);
        }

        // Per-expiration volume envelope — quiet during inspiration,
        // crescendos through expiration, decays into next cycle.
        const env = ctx.createGain();
        for (let t = 0; t < duration; t += 1 / breathRate) {
          const expStart = t + inspirationLen / ctx.sampleRate;
          const cycleEnd = t + cycleSamples / ctx.sampleRate;
          env.gain.setValueAtTime(0.01, ctx.currentTime + t);
          env.gain.linearRampToValueAtTime(0.02, ctx.currentTime + expStart);
          env.gain.linearRampToValueAtTime(bandGain * 0.7, ctx.currentTime + expStart + 0.12);
          env.gain.linearRampToValueAtTime(bandGain, ctx.currentTime + expStart + 0.35);
          env.gain.setValueAtTime(bandGain * 0.95, ctx.currentTime + cycleEnd - 0.35);
          env.gain.linearRampToValueAtTime(bandGain * 0.25, ctx.currentTime + cycleEnd - 0.08);
          env.gain.linearRampToValueAtTime(0.01, ctx.currentTime + cycleEnd);
        }

        // Faint 4-6 Hz tremolo so the whistle has a natural flutter.
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 4 + Math.random() * 2;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = bandGain * 0.12;
        lfo.connect(lfoGain);
        lfoGain.connect(env.gain);

        noiseSrc.connect(bp);
        bp.connect(env);
        env.connect(masterGain);
        noiseSrc.start();
        noiseSrc.stop(ctx.currentTime + duration);
        lfo.start();
        lfo.stop(ctx.currentTime + duration);
      });
      break;
    }

    case 'crackles-fine': {
      // FINE INSPIRATORY CRACKLES (Rales)
      //
      // Brief, high-pitched popping sounds heard during late inspiration
      // from sudden opening of collapsed alveoli (pulmonary oedema, CHF,
      // pneumonia, fibrosis). Each crackle is a tiny pressure transient:
      // 3-6 ms, broadband content 400-1500 Hz, sharp attack + exponential
      // decay. You hear them as **discrete pops** — not a hiss.
      //
      // Previous implementation used Math.random() < 0.015 per SAMPLE,
      // which at 44.1 kHz produced ~660 events/sec — they merged into a
      // continuous wash that sounded like normal air entry. Rewritten to
      // schedule a fixed number of discrete pop events per inspiration
      // (~12-18) with proper exponential-decay impulses.
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      const breathRate = 0.28; // ~17 /min
      const cycleSamples = Math.floor(ctx.sampleRate / breathRate);
      const inspirationLen = Math.floor(cycleSamples * 0.48);
      const cycles = Math.floor(duration * breathRate) + 1;

      // ----- Background vesicular bed (quiet, so the crackles pop) -----
      const pinkBuf = createPinkNoiseBuffer(ctx, duration);
      const pinkData = pinkBuf.getChannelData(0);
      applyBreathingEnvelope(pinkData, ctx.sampleRate, breathRate, 0.48, 1.0, 0.04);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = pinkData[i] * 0.18; // Quiet; crackles must dominate
      }

      // ----- Single-crackle impulse stamp ------------------------------
      // Proper crackle waveform: sharp transient attack + short noise
      // tail with exponential decay. Biphasic (small negative dip before
      // the positive spike) for that distinctive "tick" character.
      const stampCrackle = (startSample: number) => {
        const len = Math.floor(ctx.sampleRate * (0.004 + Math.random() * 0.004)); // 4-8 ms
        const centreFreq = 900 + Math.random() * 600; // 900-1500 Hz per crackle
        for (let j = 0; j < len && startSample + j < bufferSize; j++) {
          const t = j / ctx.sampleRate;
          // Exponential decay with 2 ms time-constant — gives the "tick"
          const decay = Math.exp(-t / 0.002);
          // Filtered noise burst at the crackle's centre frequency.
          // We approximate a bandpass by multiplying a sine carrier by
          // broadband noise — result is energy concentrated around the
          // carrier with enough spectral spread to sound like a pop,
          // not a beep.
          const carrier = Math.sin(2 * Math.PI * centreFreq * t);
          const noise = Math.random() * 2 - 1;
          const sample = (carrier * 0.65 + noise * 0.85) * decay;
          // Biphasic shape — small negative pre-tick for the sharpness.
          const shape = j < 2 ? -0.4 : 1.0;
          data[startSample + j] += sample * shape * 0.55;
        }
      };

      // ----- Schedule 12-18 crackles per late-inspiration -------------
      for (let c = 0; c < cycles; c++) {
        const cycleStart = c * cycleSamples;
        // Crackle window: 55-98% of inspiration (late-inspiratory zone)
        const windowStart = cycleStart + Math.floor(inspirationLen * 0.55);
        const windowEnd = cycleStart + Math.floor(inspirationLen * 0.98);
        const windowLen = windowEnd - windowStart;
        const crackleCount = 12 + Math.floor(Math.random() * 7); // 12-18

        for (let k = 0; k < crackleCount; k++) {
          const pos = windowStart + Math.floor(Math.random() * windowLen);
          if (pos < bufferSize) stampCrackle(pos);
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      // Gentle high-pass to clear rumble, light lowpass to keep the tops
      // from sounding shrill. Narrow overall bandpass would smother the
      // crackles — let them breathe.
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 350;
      hp.Q.value = 0.4;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2200;
      lp.Q.value = 0.5;
      source.connect(hp);
      hp.connect(lp);
      lp.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'crackles-coarse': {
      // COARSE CRACKLES
      // Louder, lower-pitched, longer-duration pops heard throughout the breath cycle.
      // Caused by air bubbling through fluid in larger airways (bronchitis, CHF).
      // Characteristics: each crackle ~10-25ms, frequency 150-600 Hz,
      // heard on both inspiration and expiration, may clear with coughing.
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      const breathCycleSamples = Math.floor(ctx.sampleRate / 0.3);

      // Background breathing
      const pinkBuf = createPinkNoiseBuffer(ctx, duration);
      const pinkData = pinkBuf.getChannelData(0);
      applyBreathingEnvelope(pinkData, ctx.sampleRate, 0.3, 0.45, 1.0, 0.06);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = pinkData[i] * 0.2;
      }

      // Coarse crackles throughout the breath cycle
      for (let i = 0; i < bufferSize; i++) {
        const posInCycle = i % breathCycleSamples;
        const cycleProgress = posInCycle / breathCycleSamples;
        // Active during breathing phases (not the quiet gaps)
        const isActive = Math.sin(Math.PI * cycleProgress) > 0.15;

        if (isActive && Math.random() < 0.01) {
          // Each coarse crackle: 10-25ms, lower frequency, bubbling character
          const crackleLen = Math.floor(ctx.sampleRate * (0.010 + Math.random() * 0.015));
          const crackleFreq = 150 + Math.random() * 400; // 150-550 Hz
          const subFreq = crackleFreq * 0.5; // Sub-harmonic for bubbling
          for (let j = 0; j < crackleLen && (i + j) < bufferSize; j++) {
            const decay = Math.exp(-j / (crackleLen * 0.4));
            const t1 = Math.sin(2 * Math.PI * crackleFreq * j / ctx.sampleRate);
            const t2 = Math.sin(2 * Math.PI * subFreq * j / ctx.sampleRate);
            const noise = (Math.random() * 2 - 1) * 0.2;
            data[i + j] += (t1 * 0.4 + t2 * 0.3 + noise) * decay * 0.6;
          }
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1000;
      source.connect(lp);
      lp.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'stridor': {
      // STRIDOR
      //
      // Harsh, high-pitched, predominantly INSPIRATORY noise from turbulent
      // airflow through a narrowed extra-thoracic airway (larynx/trachea).
      // Often audible without a stethoscope in severe obstruction.
      //
      // Acoustically it's a more chaotic cousin of wheeze — higher pitch
      // (~700-1200 Hz), broader spectral content, harsh/raspy rather than
      // musical. Synthesised the same physically-correct way: noise through
      // resonant bandpass, but with a wider Q (less pure tone) and a
      // heavier broadband noise bed to preserve the "rush" character.
      const breathRate = 0.35; // ~21/min — distressed
      const cycleSamples = Math.floor(ctx.sampleRate / breathRate);
      const inspirationLen = Math.floor(cycleSamples * 0.55);

      // ---- Broadband turbulent-air bed, inspiratory dominant --------------
      const bedBuffer = createPinkNoiseBuffer(ctx, duration);
      const bedData = bedBuffer.getChannelData(0);
      applyBreathingEnvelope(bedData, ctx.sampleRate, breathRate, 0.55, 2.2, 0.02);
      const bedSrc = ctx.createBufferSource();
      bedSrc.buffer = bedBuffer;
      const bedBp = ctx.createBiquadFilter();
      bedBp.type = 'bandpass';
      bedBp.frequency.value = 900;
      bedBp.Q.value = 0.7;
      const bedGain = ctx.createGain();
      bedGain.gain.value = 0.55;
      bedSrc.connect(bedBp);
      bedBp.connect(bedGain);
      bedGain.connect(masterGain);
      bedSrc.start();
      bedSrc.stop(ctx.currentTime + duration);

      // ---- Harsh resonant noise whistle (noise → narrow BP → envelope) ----
      // Wider Q than wheeze (8 instead of 18) for rougher, less musical
      // character. Slight pitch fluctuation on each breath to sound organic.
      const noiseBuf = createPinkNoiseBuffer(ctx, duration);
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 8;

      for (let t = 0; t < duration; t += 1 / breathRate) {
        const inspStart = t;
        const inspEnd = t + inspirationLen / ctx.sampleRate;
        const cycleEnd = t + cycleSamples / ctx.sampleRate;
        // Centre frequency jitters between breaths (650-900 Hz)
        const f = 700 + (Math.random() - 0.5) * 120;
        bp.frequency.setValueAtTime(f, ctx.currentTime + inspStart);
        // Drop pitch slightly through inspiration as the patient runs out
        // of pressure (mild "sigh" effect at the end).
        bp.frequency.linearRampToValueAtTime(f - 40, ctx.currentTime + inspEnd);
        bp.frequency.setValueAtTime(f, ctx.currentTime + cycleEnd);
      }

      const env = ctx.createGain();
      for (let t = 0; t < duration; t += 1 / breathRate) {
        const inspEnd = t + inspirationLen / ctx.sampleRate;
        const cycleEnd = t + cycleSamples / ctx.sampleRate;
        // Quiet at cycle start
        env.gain.setValueAtTime(0.015, ctx.currentTime + t);
        // Inspiration: harsh crescendo
        env.gain.linearRampToValueAtTime(0.45, ctx.currentTime + t + 0.18);
        env.gain.setValueAtTime(0.55, ctx.currentTime + inspEnd - 0.12);
        // Expiration: much quieter, tapering
        env.gain.linearRampToValueAtTime(0.12, ctx.currentTime + inspEnd + 0.12);
        env.gain.linearRampToValueAtTime(0.03, ctx.currentTime + cycleEnd - 0.08);
        env.gain.linearRampToValueAtTime(0.015, ctx.currentTime + cycleEnd);
      }

      noiseSrc.connect(bp);
      bp.connect(env);
      env.connect(masterGain);
      noiseSrc.start();
      noiseSrc.stop(ctx.currentTime + duration);
      break;
    }

    case 'rhonchi': {
      // RHONCHI
      // Low-pitched, continuous rumbling/rattling caused by airway secretions
      // or mucus in larger airways. 80-300 Hz. May clear with coughing.
      // Heard throughout the breath cycle with expiratory emphasis.
      // Think of air bubbling through thick mucus in a pipe.
      const breathRate = 0.27;

      // Layer 1: Underlying breath sounds
      const noiseBuffer = createPinkNoiseBuffer(ctx, duration);
      const noiseData = noiseBuffer.getChannelData(0);
      applyBreathingEnvelope(noiseData, ctx.sampleRate, breathRate, 0.4, 0.8, 0.04);
      for (let i = 0; i < noiseData.length; i++) noiseData[i] *= 0.2;

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseLp = ctx.createBiquadFilter();
      noiseLp.type = 'lowpass';
      noiseLp.frequency.value = 500;
      noiseSource.connect(noiseLp);
      noiseLp.connect(masterGain);
      noiseSource.start();
      noiseSource.stop(ctx.currentTime + duration);

      // Layer 2: Low-frequency rumble — noise through two low resonances.
      // Sounds like air bubbling through thick secretions in a pipe, not an
      // electronic buzz. Two resonances (~130 Hz + 210 Hz) with wide Q give
      // the "rattle" character without oscillator harshness.
      const rumbleBands: Array<{ f: number; q: number; gain: number }> = [
        { f: 130, q: 6, gain: 0.42 },
        { f: 210, q: 8, gain: 0.28 },
      ];
      rumbleBands.forEach(({ f, q, gain: bandGain }) => {
        const noiseBuf = createPinkNoiseBuffer(ctx, duration);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = f;
        bp.Q.value = q;

        // Slow, organic wobble of the centre frequency (the secretions
        // shift as air passes them).
        for (let t = 0.4; t < duration; t += 0.4) {
          bp.frequency.linearRampToValueAtTime(
            f * (0.88 + Math.random() * 0.24),
            ctx.currentTime + t,
          );
        }

        const env = ctx.createGain();
        const cycleSamples = Math.floor(ctx.sampleRate / breathRate);
        const inspLen = Math.floor(cycleSamples * 0.4);
        for (let t = 0; t < duration; t += 1 / breathRate) {
          const inspEnd = t + inspLen / ctx.sampleRate;
          const cycleEnd = t + cycleSamples / ctx.sampleRate;
          env.gain.setValueAtTime(0.03, ctx.currentTime + t);
          env.gain.linearRampToValueAtTime(bandGain * 0.55, ctx.currentTime + t + 0.2);
          env.gain.setValueAtTime(bandGain * 0.45, ctx.currentTime + inspEnd);
          env.gain.linearRampToValueAtTime(bandGain, ctx.currentTime + inspEnd + 0.2);
          env.gain.setValueAtTime(bandGain * 0.9, ctx.currentTime + cycleEnd - 0.2);
          env.gain.linearRampToValueAtTime(0.03, ctx.currentTime + cycleEnd);
        }

        noiseSrc.connect(bp);
        bp.connect(env);
        env.connect(masterGain);
        noiseSrc.start();
        noiseSrc.stop(ctx.currentTime + duration);
      });
      break;
    }

    case 'pleural-rub': {
      // PLEURAL FRICTION RUB
      // Creaking, grating, leather-on-leather sound caused by inflamed
      // pleural surfaces rubbing. Heard on BOTH inspiration and expiration.
      // Stops with breath-holding (unlike pericardial rub).
      // Frequency: 300-600 Hz, intermittent, coarse, may be localized.
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      const breathCycleSamples = Math.floor(ctx.sampleRate / 0.28);

      // Background breathing
      const pinkBuf = createPinkNoiseBuffer(ctx, duration);
      const pinkData = pinkBuf.getChannelData(0);
      applyBreathingEnvelope(pinkData, ctx.sampleRate, 0.28, 0.5, 1.0, 0.04);
      for (let i = 0; i < bufferSize; i++) data[i] = pinkData[i] * 0.15;

      // Creaking/grating during active breathing
      for (let i = 0; i < bufferSize; i++) {
        const posInCycle = i % breathCycleSamples;
        const cycleProgress = posInCycle / breathCycleSamples;
        const breathActive = Math.sin(Math.PI * cycleProgress);

        if (breathActive > 0.25) {
          // Irregular creaking bursts
          const creakBase = 350 + Math.sin(i * 0.002) * 100; // Slowly varying creak freq
          const creak = Math.sin(2 * Math.PI * creakBase * i / ctx.sampleRate);
          // Add gritty harmonics
          const creak2 = Math.sin(2 * Math.PI * creakBase * 1.5 * i / ctx.sampleRate);
          const grit = (Math.random() * 2 - 1);

          // Intermittent: the rub comes and goes within each breath
          const burstPattern = Math.sin(i * 0.01 + Math.sin(i * 0.003) * 2);
          const isBurst = burstPattern > 0.3;

          if (isBurst) {
            data[i] += (creak * 0.3 + creak2 * 0.15 + grit * 0.08) * breathActive * 0.5;
          }
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 400;
      bp.Q.value = 0.8;
      source.connect(bp);
      bp.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'snoring': {
      // SONOROUS / SNORING RESPIRATION
      // Low-frequency vibration from partial upper airway obstruction
      // (tongue falling back, soft palate). 40-120 Hz fundamental with harmonics.
      // Predominantly inspiratory with characteristic intermittent pattern.
      const breathRate = 0.22; // Slower due to obstruction (~13/min)
      const cycleSamples = Math.floor(ctx.sampleRate / breathRate);
      const inspirationLen = Math.floor(cycleSamples * 0.45);

      // Layer 1: Throat vibration (fundamental + harmonics)
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const posInCycle = i % cycleSamples;
        let envelope: number;

        if (posInCycle < inspirationLen) {
          // Inspiration: loud snoring with characteristic flutter
          const t = posInCycle / inspirationLen;
          envelope = Math.sin(Math.PI * t);
          // Add irregular flutter (soft palate vibrating)
          envelope *= 0.7 + 0.3 * Math.sin(2 * Math.PI * 25 * i / ctx.sampleRate);
        } else if (posInCycle < inspirationLen * 1.6) {
          // Expiration: quieter, may have mild snoring
          const t = (posInCycle - inspirationLen) / (inspirationLen * 0.6);
          envelope = Math.sin(Math.PI * t) * 0.25;
        } else {
          // Brief pause
          envelope = 0.01;
        }

        // Fundamental vibration (~65 Hz) + harmonics
        const f0 = 65 + Math.sin(i * 0.0003) * 8; // Slight pitch drift
        const vibration =
          Math.sin(2 * Math.PI * f0 * i / ctx.sampleRate) * 0.5 +
          Math.sin(2 * Math.PI * f0 * 2 * i / ctx.sampleRate) * 0.25 +
          Math.sin(2 * Math.PI * f0 * 3 * i / ctx.sampleRate) * 0.1 +
          (Math.random() * 2 - 1) * 0.15; // Turbulence noise

        data[i] = vibration * envelope * 0.6;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 350;
      lp.Q.value = 1.5;
      source.connect(lp);
      lp.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'diminished': {
      // DIMINISHED BREATH SOUNDS
      // Same character as vesicular breathing but markedly reduced in volume.
      // Still has the characteristic inspiration > expiration pattern.
      // Causes: pneumothorax, effusion, obesity, splinting, hyperinflation.
      const noiseBuffer = createPinkNoiseBuffer(ctx, duration);
      const data = noiseBuffer.getChannelData(0);
      applyBreathingEnvelope(data, ctx.sampleRate, 0.25, 0.5, 1.2, 0.02);

      // Very low volume — barely audible
      for (let i = 0; i < data.length; i++) data[i] *= 0.12;

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 300;
      bp.Q.value = 0.5;
      source.connect(bp);
      bp.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'absent': {
      // ABSENT BREATH SOUNDS
      // Complete silence on the affected side.
      // Causes: tension pneumothorax, massive effusion, cardiac arrest, near-fatal asthma.
      // Play very faint ambient noise (stethoscope-on-skin sound) to show it's working.
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.008; // Barely perceptible contact noise
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 200;
      source.connect(lp);
      lp.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }
  }
}

/**
 * Helper: generate a single heart sound thump (S1 or S2) into a buffer
 * Heart sounds are brief (~40-100ms) low-frequency thuds composed of
 * valve closure vibrations transmitted through the chest wall.
 * S1 (mitral/tricuspid closure): ~25-45 Hz, ~100ms, louder
 * S2 (aortic/pulmonic closure): ~50-70 Hz, ~80ms, slightly higher and shorter
 */
function writeHeartThump(
  data: Float32Array,
  startSample: number,
  sampleRate: number,
  freq: number,
  durationMs: number,
  volume: number,
  harmonics: number = 3,
): void {
  const len = Math.floor(sampleRate * durationMs / 1000);
  for (let j = 0; j < len && (startSample + j) < data.length; j++) {
    const t = j / sampleRate;
    // Rapid exponential decay
    const env = Math.exp(-t / (durationMs / 1000 * 0.28));
    // Initial sharp attack
    const attack = j < sampleRate * 0.003 ? j / (sampleRate * 0.003) : 1.0;
    let sample = 0;
    // Fundamental + harmonics (each progressively quieter)
    for (let h = 1; h <= harmonics; h++) {
      sample += Math.sin(2 * Math.PI * freq * h * t) / (h * h);
    }
    // Add a thump transient (body resonance)
    sample += Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.3 * Math.exp(-t / 0.015);
    data[startSample + j] += sample * env * attack * volume;
  }
}

/**
 * Play a heart sound for the specified duration.
 * Realistic S1-S2 pattern with appropriate rate, character, and pathology.
 */
export function playHeartSound(soundType: HeartSoundType, durationMs: number = 5000): void {
  stopAllSounds();

  // Prefer a real recording when one exists for this sound type.
  const rec = HEART_RECORDINGS[soundType];
  if (rec && playRecordedSound(rec, durationMs)) return;

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.85, ctx.currentTime);
  masterGain.connect(ctx.destination);
  currentGainNode = masterGain;

  const duration = durationMs / 1000;

  // Heart rate in BPM
  const bpmMap: Record<HeartSoundType, number> = {
    'normal': 72,
    'tachycardic': 125,
    'bradycardic': 42,
    'irregular': 88,
    'muffled': 68,
    'gallop': 90,
    'murmur-systolic': 78,
    'absent': 0,
  };

  const bpm = bpmMap[soundType];
  if (bpm === 0) {
    // Absent — flat silence with faint contact noise
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.005;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(masterGain);
    source.start();
    source.stop(ctx.currentTime + duration);
    return;
  }

  const beatInterval = 60 / bpm;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Add very faint background noise (body sounds / stethoscope contact)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.008;
  }

  const isMuffled = soundType === 'muffled';
  // Raised base frequencies so they're audible on laptop/phone speakers
  const s1Freq = isMuffled ? 40 : 60;      // S1: thump (was 35Hz, now 60Hz)
  const s2Freq = isMuffled ? 55 : 90;      // S2: slightly higher (was 55Hz, now 90Hz)
  const s1Duration = isMuffled ? 120 : 100; // ms
  const s2Duration = isMuffled ? 90 : 70;   // ms
  const s1Vol = isMuffled ? 0.35 : 0.9;
  const s2Vol = isMuffled ? 0.2 : 0.65;
  const harmonicCount = isMuffled ? 2 : 4;

  let t = 0;
  while (t < duration) {
    const actualInterval = soundType === 'irregular'
      ? beatInterval * (0.65 + Math.random() * 0.7) // AF: irregularly irregular
      : beatInterval + (Math.random() - 0.5) * 0.02; // Tiny natural variation

    const beatSample = Math.floor(t * ctx.sampleRate);

    // S1 — mitral/tricuspid valve closure (start of systole)
    writeHeartThump(data, beatSample, ctx.sampleRate, s1Freq, s1Duration, s1Vol, harmonicCount);

    // S2 — aortic/pulmonic valve closure (end of systole)
    // Systolic interval is ~0.3-0.35 of the cardiac cycle
    const systolicInterval = actualInterval * 0.33;
    const s2Sample = beatSample + Math.floor(systolicInterval * ctx.sampleRate);
    writeHeartThump(data, s2Sample, ctx.sampleRate, s2Freq, s2Duration, s2Vol, harmonicCount);

    // S3 gallop — pathological ventricular filling sound after S2
    if (soundType === 'gallop') {
      const s3Delay = systolicInterval + 0.12; // ~120ms after S2
      const s3Sample = beatSample + Math.floor(s3Delay * ctx.sampleRate);
      writeHeartThump(data, s3Sample, ctx.sampleRate, 28, 60, 0.25, 2);
    }

    // Systolic murmur — turbulent flow between S1 and S2
    if (soundType === 'murmur-systolic') {
      const murmurStart = beatSample + Math.floor(ctx.sampleRate * 0.06);
      const murmurEnd = s2Sample - Math.floor(ctx.sampleRate * 0.02);
      const murmurLen = murmurEnd - murmurStart;
      if (murmurLen > 0) {
        for (let j = 0; j < murmurLen && (murmurStart + j) < bufferSize; j++) {
          const pos = j / murmurLen;
          // Diamond-shaped: crescendo-decrescendo
          const env = Math.sin(Math.PI * pos) * 0.2;
          // Filtered noise with slight tonal quality
          const noise = (Math.random() * 2 - 1);
          const tone = Math.sin(2 * Math.PI * 180 * j / ctx.sampleRate) * 0.3;
          data[murmurStart + j] += (noise * 0.7 + tone) * env;
        }
      }
    }

    t += actualInterval;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Low-pass filter: body-transmitted sound character through stethoscope
  // Raised cutoff for audibility on typical device speakers
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = isMuffled ? 120 : 280;
  filter.Q.value = 0.8;

  source.connect(filter);
  filter.connect(masterGain);
  source.start();
  source.stop(ctx.currentTime + duration);
}

// ============================================================================
// BOWEL SOUND SYNTHESIS
// ============================================================================

/**
 * Play synthesised bowel/abdominal sounds.
 * Uses filtered noise bursts and tonal elements to simulate peristaltic gurgling.
 */
export function playBowelSound(soundType: BowelSoundType, durationMs: number = 6000): void {
  // Always auscultate to a REAL recording. We only have clips for normal /
  // hyperactive / hypoactive, so the rarer types fall back to the closest
  // recorded sound rather than thin synthesis (which sounded "broken"):
  //   borborygmi / tinkling → hyperactive (loud, rushing rushes)
  //   bruit                 → normal (a bruit is a whoosh over otherwise
  //                           normal bowel; we have no dedicated clip)
  //   absent                → no recording on purpose; it is near-silence.
  const RECORDING_FALLBACK: Record<BowelSoundType, BowelSoundType | null> = {
    normal: 'normal',
    hyperactive: 'hyperactive',
    hypoactive: 'hypoactive',
    borborygmi: 'hyperactive',
    tinkling: 'hyperactive',
    bruit: 'normal',
    absent: null,
  };
  const recType = RECORDING_FALLBACK[soundType];
  const rec = recType ? BOWEL_RECORDINGS[recType] : undefined;
  if (rec && playRecordedSound(rec, durationMs)) return;

  const ctx = getAudioContext();
  const dur = durationMs / 1000;

  // Pink noise buffer for base texture
  const sampleRate = ctx.sampleRate;
  const bufferLength = Math.ceil(sampleRate * dur);
  const noiseBuffer = ctx.createBuffer(1, bufferLength, sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);

  // Simple pink noise approximation
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferLength; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    noiseData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
    b6 = white * 0.115926;
  }

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.55, ctx.currentTime);
  masterGain.connect(ctx.destination);

  switch (soundType) {
    case 'normal': {
      // Intermittent gurgling every 2-4 seconds
      const gurgleCount = Math.floor(dur / 3);
      for (let g = 0; g < gurgleCount; g++) {
        const startTime = ctx.currentTime + g * (2 + Math.random() * 2);
        const gurgleDur = 0.3 + Math.random() * 0.5;

        // Filtered noise burst
        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 200 + Math.random() * 300; // 200-500 Hz
        bp.Q.value = 2;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, startTime);
        env.gain.linearRampToValueAtTime(0.15 + Math.random() * 0.1, startTime + 0.05);
        env.gain.exponentialRampToValueAtTime(0.001, startTime + gurgleDur);
        source.connect(bp).connect(env).connect(masterGain);
        source.start(startTime);
        source.stop(startTime + gurgleDur + 0.1);

        // Low tonal element for body
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80 + Math.random() * 60, startTime);
        osc.frequency.exponentialRampToValueAtTime(120 + Math.random() * 80, startTime + gurgleDur);
        const oscEnv = ctx.createGain();
        oscEnv.gain.setValueAtTime(0, startTime);
        oscEnv.gain.linearRampToValueAtTime(0.04, startTime + 0.03);
        oscEnv.gain.exponentialRampToValueAtTime(0.001, startTime + gurgleDur);
        osc.connect(oscEnv).connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + gurgleDur + 0.1);
      }
      break;
    }

    case 'hyperactive': {
      // Frequent, loud, rushing gurgles every 0.5-1.5 seconds
      const gurgleCount = Math.floor(dur / 0.8);
      for (let g = 0; g < gurgleCount; g++) {
        const startTime = ctx.currentTime + g * (0.5 + Math.random() * 1.0);
        const gurgleDur = 0.4 + Math.random() * 0.8;

        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 250 + Math.random() * 400;
        bp.Q.value = 1.5;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, startTime);
        env.gain.linearRampToValueAtTime(0.25 + Math.random() * 0.15, startTime + 0.03);
        env.gain.exponentialRampToValueAtTime(0.001, startTime + gurgleDur);
        source.connect(bp).connect(env).connect(masterGain);
        source.start(startTime);
        source.stop(startTime + gurgleDur + 0.1);

        // Higher pitched tonal — rushing fluid sound
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150 + Math.random() * 200, startTime);
        osc.frequency.linearRampToValueAtTime(100 + Math.random() * 100, startTime + gurgleDur);
        const oscEnv = ctx.createGain();
        oscEnv.gain.setValueAtTime(0, startTime);
        oscEnv.gain.linearRampToValueAtTime(0.06, startTime + 0.02);
        oscEnv.gain.exponentialRampToValueAtTime(0.001, startTime + gurgleDur);
        osc.connect(oscEnv).connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + gurgleDur + 0.1);
      }
      break;
    }

    case 'hypoactive': {
      // Very rare, faint sounds — one every 5-8 seconds
      const gurgleCount = Math.max(1, Math.floor(dur / 6));
      for (let g = 0; g < gurgleCount; g++) {
        const startTime = ctx.currentTime + 2 + g * (5 + Math.random() * 3);
        if (startTime > ctx.currentTime + dur) break;
        const gurgleDur = 0.2 + Math.random() * 0.3;

        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 150 + Math.random() * 200;
        bp.Q.value = 3;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 400;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, startTime);
        env.gain.linearRampToValueAtTime(0.06, startTime + 0.05);
        env.gain.exponentialRampToValueAtTime(0.001, startTime + gurgleDur);
        source.connect(bp).connect(lp).connect(env).connect(masterGain);
        source.start(startTime);
        source.stop(startTime + gurgleDur + 0.1);
      }
      break;
    }

    case 'absent': {
      // Near silence — very faint room ambience only
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 100;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.005, ctx.currentTime);
      source.connect(lp).connect(env).connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + dur);
      break;
    }

    case 'tinkling': {
      // High-pitched metallic pings — obstructed bowel
      const pingCount = Math.floor(dur / 1.5);
      for (let p = 0; p < pingCount; p++) {
        const startTime = ctx.currentTime + p * (1.0 + Math.random() * 1.5);
        if (startTime > ctx.currentTime + dur) break;

        // High-pitched metallic ping
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800 + Math.random() * 600, startTime); // 800-1400 Hz
        osc.frequency.exponentialRampToValueAtTime(400 + Math.random() * 200, startTime + 0.3);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, startTime);
        env.gain.linearRampToValueAtTime(0.12, startTime + 0.005); // Sharp attack
        env.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15 + Math.random() * 0.2);
        osc.connect(env).connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + 0.5);

        // Harmonic for metallic quality
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(osc.frequency.value * 2.7, startTime);
        const env2 = ctx.createGain();
        env2.gain.setValueAtTime(0, startTime);
        env2.gain.linearRampToValueAtTime(0.03, startTime + 0.005);
        env2.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
        osc2.connect(env2).connect(masterGain);
        osc2.start(startTime);
        osc2.stop(startTime + 0.3);
      }
      break;
    }

    case 'borborygmi': {
      // Loud, prolonged rumbling
      const rumbleCount = Math.max(1, Math.floor(dur / 3));
      for (let r = 0; r < rumbleCount; r++) {
        const startTime = ctx.currentTime + r * (2 + Math.random() * 2);
        const rumbleDur = 1.0 + Math.random() * 1.5;

        // Deep rumbling noise
        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 100 + Math.random() * 150;
        bp.Q.value = 1;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, startTime);
        env.gain.linearRampToValueAtTime(0.3, startTime + 0.1);
        env.gain.setValueAtTime(0.3, startTime + rumbleDur * 0.7);
        env.gain.exponentialRampToValueAtTime(0.001, startTime + rumbleDur);
        source.connect(bp).connect(env).connect(masterGain);
        source.start(startTime);
        source.stop(startTime + rumbleDur + 0.1);

        // Tonal rumble — low frequency wobble
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50 + Math.random() * 40, startTime);
        const wobble = ctx.createOscillator();
        wobble.frequency.value = 4 + Math.random() * 3;
        const wobbleGain = ctx.createGain();
        wobbleGain.gain.value = 15;
        wobble.connect(wobbleGain).connect(osc.frequency);
        wobble.start(startTime);
        wobble.stop(startTime + rumbleDur + 0.1);
        const oscLp = ctx.createBiquadFilter();
        oscLp.type = 'lowpass';
        oscLp.frequency.value = 200;
        const oscEnv = ctx.createGain();
        oscEnv.gain.setValueAtTime(0, startTime);
        oscEnv.gain.linearRampToValueAtTime(0.08, startTime + 0.1);
        oscEnv.gain.exponentialRampToValueAtTime(0.001, startTime + rumbleDur);
        osc.connect(oscLp).connect(oscEnv).connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + rumbleDur + 0.1);
      }
      break;
    }

    case 'bruit': {
      // Vascular whooshing synchronous with heartbeat (~70bpm = ~0.86s cycle)
      const heartInterval = 0.86;
      const beats = Math.floor(dur / heartInterval);
      for (let b = 0; b < beats; b++) {
        const startTime = ctx.currentTime + b * heartInterval;
        const whooshDur = 0.3;

        // Filtered noise whoosh
        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 200;
        bp.Q.value = 0.8;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, startTime);
        env.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
        env.gain.linearRampToValueAtTime(0.18, startTime + whooshDur * 0.4); // Diamond shape
        env.gain.exponentialRampToValueAtTime(0.001, startTime + whooshDur);
        source.connect(bp).connect(env).connect(masterGain);
        source.start(startTime);
        source.stop(startTime + whooshDur + 0.1);
      }
      break;
    }
  }

}

// ============================================================================
// PERCUSSION SOUNDS
// ============================================================================

/**
 * Play synthesised percussion tap sounds.
 * Generates short tapping sounds with different resonance characteristics
 * based on clinical percussion findings.
 */
export function playPercussionSound(type: 'resonant' | 'hyper-resonant' | 'dull' | 'tympanic', count: number = 2): void {
  const ctx = getAudioContext();

  // A real percussion note is a sharp finger STRIKE exciting a damped body
  // resonance — not a tonal beep. We model two layers per tap:
  //   (1) impact   — a few-ms broadband click (the pleximeter strike), and
  //   (2) body     — band-passed noise that RINGS at the note's pitch.
  // The clinical note is encoded by the body's centre frequency, its Q (how
  // musically it rings) and its decay (how long it rings):
  //   resonant       normal lung — hollow, medium ring
  //   hyper-resonant pneumothorax/COPD — lower, boomy, long ring
  //   dull           consolidation/fluid/liver — short high thud, almost no ring
  //   tympanic       gas/distended bowel — drum-like, musical, sustained
  const profile: { freq: number; q: number; decay: number; gain: number } = (() => {
    switch (type) {
      case 'resonant':       return { freq: 180, q: 6,   decay: 0.18, gain: 0.5 };
      case 'hyper-resonant': return { freq: 130, q: 9,   decay: 0.34, gain: 0.6 };
      case 'dull':           return { freq: 340, q: 2.5, decay: 0.07, gain: 0.42 };
      case 'tympanic':       return { freq: 240, q: 12,  decay: 0.26, gain: 0.55 };
    }
  })();

  // One short shared white-noise buffer drives both the click and the body.
  const sr = ctx.sampleRate;
  const noiseLen = Math.ceil(sr * 0.5);
  const noiseBuf = ctx.createBuffer(1, noiseLen, sr);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) nd[i] = Math.random() * 2 - 1;

  const master = ctx.createGain();
  master.gain.setValueAtTime(1, ctx.currentTime);
  master.connect(ctx.destination);

  for (let i = 0; i < count; i++) {
    const t0 = ctx.currentTime + i * 0.28; // ~280ms between the paired taps

    // (1) Impact click — very short, high-passed broadband transient.
    const click = ctx.createBufferSource();
    click.buffer = noiseBuf;
    const clickHP = ctx.createBiquadFilter();
    clickHP.type = 'highpass';
    clickHP.frequency.value = 1600;
    const clickEnv = ctx.createGain();
    clickEnv.gain.setValueAtTime(0.0001, t0);
    clickEnv.gain.exponentialRampToValueAtTime(profile.gain * 0.45, t0 + 0.002);
    clickEnv.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.022);
    click.connect(clickHP).connect(clickEnv).connect(master);
    click.start(t0);
    click.stop(t0 + 0.05);

    // (2) Resonant body — band-passed noise ringing at the note's pitch.
    const body = ctx.createBufferSource();
    body.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = profile.freq;
    bp.Q.value = profile.q;
    const bodyEnv = ctx.createGain();
    bodyEnv.gain.setValueAtTime(0.0001, t0);
    bodyEnv.gain.exponentialRampToValueAtTime(profile.gain, t0 + 0.006);
    bodyEnv.gain.exponentialRampToValueAtTime(0.0001, t0 + profile.decay);
    body.connect(bp).connect(bodyEnv).connect(master);
    body.start(t0);
    body.stop(t0 + profile.decay + 0.06);
  }
}

/**
 * Check if Web Audio API is available
 */
export function isAudioAvailable(): boolean {
  return typeof window !== 'undefined' &&
    (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined');
}
