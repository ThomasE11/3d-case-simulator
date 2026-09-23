export type PatientAgeBand = 'neonate' | 'infant' | 'toddler' | 'child' | 'adolescent' | 'adult';

export type PatientModelGender = 'male' | 'female';

/**
 * Format the numeric case age without exposing storage decimals to students.
 * Case data stores age in years, so infants use a decimal (for example 0.67).
 * Present those patients in whole months, as clinicians and dispatchers do.
 * Neonates (under ~1 month) are presented in days.
 */
export function patientAgeShortLabel(age?: number | null): string {
  if (age == null || !Number.isFinite(age) || age < 0) return 'Age not stated';
  if (age < 0.08) return `${Math.max(0, Math.round(age * 365))}d`;
  if (age < 1) return `${Math.max(1, Math.round(age * 12))}mo`;
  return `${Math.round(age)}yo`;
}

/** Sentence-form age for dispatch, radio and clinical handover prose. */
export function patientAgeLongLabel(age?: number | null): string {
  if (age == null || !Number.isFinite(age) || age < 0) return 'age not stated';
  if (age < 0.08) {
    const days = Math.max(0, Math.round(age * 365));
    return days <= 1 ? 'newborn' : `${days}-day-old newborn`;
  }
  if (age < 1) return `${Math.max(1, Math.round(age * 12))}-month-old`;
  return `${Math.round(age)}-year-old`;
}

export function patientAgeBand(age?: number | null): PatientAgeBand {
  if (age == null || !Number.isFinite(age) || age >= 18) return 'adult';
  // Under ~1 month is a neonate — flexed fetal posture, not a small infant.
  if (age < 0.08) return 'neonate';
  if (age < 1) return 'infant';
  if (age < 5) return 'toddler';
  if (age < 13) return 'child';
  return 'adolescent';
}

/** Approximate standing-height ratio used by lightweight scene figures. */
export function patientAgeScale(age?: number | null): number {
  switch (patientAgeBand(age)) {
    case 'neonate': return 0.28;
    case 'infant': return 0.38;
    case 'toddler': return 0.56;
    case 'child': return 0.72;
    case 'adolescent': return 0.86;
    case 'adult': return 1;
  }
}

/**
 * Approximate physical standing height used to keep the live 3D patient,
 * assessment landmarks and attached equipment in the same scale. Values are
 * deliberately interpolated between broad developmental anchors rather than
 * snapping every child in an age band to one height.
 */
export function patientExpectedHeightMetres(age?: number | null): number {
  if (age == null || !Number.isFinite(age) || age >= 18) return 1.8;
  const safeAge = Math.max(0, age);
  // Term newborn ~0.5 m crown-heel; grows quickly through the first year.
  if (safeAge < 0.08) return 0.48 + safeAge * 0.25;
  if (safeAge < 1) return 0.5 + safeAge * 0.28;
  if (safeAge < 5) return 0.75 + (safeAge - 1) * 0.0825;
  if (safeAge < 13) return 1.08 + (safeAge - 5) * 0.065;
  return 1.6 + (safeAge - 13) * 0.03;
}

/**
 * Select an age- and sex-proportioned rigged patient. Every developmental band
 * has both male and female validated assets, so the simulator never substitutes
 * an adult body merely because the patient is young. Neonates reuse the infant
 * shell (smallest MPFB macro) and take a fetal flexion overlay at runtime.
 */
export function patientModelPath(
  gender?: PatientModelGender,
  age?: number | null,
): string {
  const band = patientAgeBand(age);
  const meshBand = band === 'neonate' ? 'infant' : band;
  if (meshBand !== 'adult' && gender) return `/models/patient-${meshBand}-${gender}.glb`;
  if (gender === 'male') return '/models/patient-male.glb';
  if (gender === 'female') return '/models/patient-female.glb';
  return '/models/patient.glb';
}
