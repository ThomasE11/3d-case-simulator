/**
 * ambientAudio.ts — procedural ambience for the villa treatment bay.
 *
 * Phase C3 of the realism overhaul: the scene should SOUND like a living
 * room, not a void. Everything here is synthesized in an AudioBuffer at
 * startup — no audio assets to ship or license.
 *
 * Three emitters:
 *   1. roomTone — global bed: pink-noise air + faint 55/110 Hz mains hum +
 *      slow "distant street" swell. Non-positional, very quiet.
 *   2. ac — positional hum mounted at the AC unit (x≈1.5, y≈2.2, back wall):
 *      fan band noise + 60/120 Hz hum with a slow flutter.
 *   3. patient — positional breath loop at the chest. Derived from the same
 *      respiratory rate that drives the chest-rise morph and from the case's
 *      auscultation findings (wheeze / stridor / clear), so the audible
 *      distress matches what the student sees and later hears on the
 *      stethoscope.
 *
 * Unlock: THREE.AudioListener owns its own AudioContext. We register it with
 * the shared clinical-sounds unlock registry so the first user gesture
 * resumes everything together (iOS Safari autoplay policy).
 */

import * as THREE from 'three';
import { registerAudioContextForUnlock } from '@/data/clinicalSounds';
import type { EnvironmentVariant } from '@/lib/sceneEnvironment';

export type AmbientBreathKind = 'wheeze' | 'stridor' | 'clear' | 'none';
export type AmbientAudioPosition = readonly [number, number, number];

export interface AmbientAudioOptions {
  enabled?: boolean;
  variant?: EnvironmentVariant;
  patientPosition?: AmbientAudioPosition;
}

export interface AmbientAudioState {
  listener: THREE.AudioListener;
  roomTone: THREE.Audio;
  ac: THREE.PositionalAudio;
  bed: THREE.Audio;
  patient: THREE.PositionalAudio;
  setPatientBreath(kind: AmbientBreathKind, rpm: number): void;
  setPatientPosition(position: AmbientAudioPosition): void;
  setEnabled(on: boolean): void;
  dispose(): void;
}

export const DEFAULT_AMBIENT_PATIENT_POSITION: AmbientAudioPosition = [0, 1.05, 0.05];

const ROOM_TONE_SECONDS = 7;
const AC_HUM_SECONDS = 4;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Procedural ambient bed for the non-villa scene variants.
 *
 * Phase C3 of the realism overhaul: every rendered environment should sound
 * like the place it draws. The villa already has room tone + AC hum + patient
 * breath; the outdoor variants were silent. Each of these is synthesized in
 * an AudioBuffer at startup — no audio assets to ship or license.
 *
 * The bed is intentionally simple: a low-passed pink-noise air layer plus one
 * or two characteristic tones (traffic, water, wind, fire crackle, worksite
 * clang). It never competes with the patient breath emitter or the
 * auscultation sounds — it sits under them, and the volume is set so the
 * student can hear it without it ever being the loudest thing in the scene.
 */
export function makeSceneBedBuffer(ctx: AudioContext, variant: EnvironmentVariant): AudioBuffer {
  const sr = ctx.sampleRate;
  const seconds = 8;
  const length = Math.max(1, Math.floor(sr * seconds));
  const buffer = ctx.createBuffer(1, length, sr);
  const data = buffer.getChannelData(0);
  const noise = pinkNoise(length);

  let air = 0;
  let rumble = 0;
  let bed = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sr;
    // Shared air bed: low-passed pink noise, the common denominator of every
    // outdoor scene. The variant-specific content layers on top.
    air += 0.012 * (noise[i] - air);
    const swell = 0.55 + 0.45 * Math.sin((2 * Math.PI * t) / 7 + noise[i] * 0.4);

    switch (variant) {
      case 'clinic': {
        // Quiet. The treatment bay already carries its own ambience; this
        // buffer is unused for the clinic variant but exported for symmetry.
        bed = air * swell * 0.04;
        break;
      }
      case 'home': {
        // Villa room tone is handled by the dedicated roomTone buffer; this
        // path is not taken for the home variant either.
        bed = air * swell * 0.06;
        break;
      }
      case 'roadside': {
        // Distant traffic: a slow low-frequency swell plus a faint
        // high-frequency hiss of tyres on asphalt.
        rumble += 0.02 * (noise[i] - rumble);
        const tyre = air * 0.4;
        bed = rumble * swell * 0.5 + tyre * 0.18;
        break;
      }
      case 'public': {
        // Indoor public venue — distant murmur of voices, modelled as a
        // soft pink-noise swell with a gentle low-frequency room tone.
        rumble += 0.015 * (noise[i] - rumble);
        bed = rumble * swell * 0.32 + air * 0.1;
        break;
      }
      case 'industrial': {
        // Worksites carry a constant distant machinery rumble plus a faint
        // high-pitched whine from a generator or compressor.
        rumble += 0.025 * (noise[i] - rumble);
        const whine = Math.sin(2 * Math.PI * 180 * t) * 0.03
          + Math.sin(2 * Math.PI * 360 * t) * 0.012;
        bed = rumble * swell * 0.45 + whine;
        break;
      }
      case 'fire': {
        // Residual fire: low rumble from the smouldering structure plus a
        // soft crackle band. The scene already renders animated smoke; the
        // audio gives the embers a voice without needing a flame prop.
        rumble += 0.02 * (noise[i] - rumble);
        const crackle = Math.max(0, noise[i]) * 0.12;
        bed = rumble * swell * 0.5 + crackle;
        break;
      }
      case 'water': {
        // Water rescue — gentle lapping against the shore / apron, with a
        // faint distant surf swell. The scene renders the water surface; the
        // audio gives it motion.
        rumble += 0.018 * (noise[i] - rumble);
        const lap = Math.sin(2 * Math.PI * 0.35 * t + noise[i] * 1.5) * 0.05
          + Math.sin(2 * Math.PI * 0.7 * t) * 0.025;
        bed = rumble * swell * 0.4 + lap;
        break;
      }
      case 'heat': {
        // Heat exposure — hot shimmer: a low rumble plus a faint high hiss
        // of hot air. The scene renders the shimmer; the audio adds the
        // oppressive stillness.
        rumble += 0.015 * (noise[i] - rumble);
        const shimmer = air * 0.3;
        bed = rumble * swell * 0.4 + shimmer;
        break;
      }
      case 'agricultural': {
        // Farm field — wind across open ground plus distant livestock.
        rumble += 0.018 * (noise[i] - rumble);
        const wind = air * 0.35;
        bed = rumble * swell * 0.38 + wind;
        break;
      }
    }
    data[i] = bed;
  }
  normalize(data, 0.35);
  return buffer;
}

/** Paul Kellet-style pink noise, roughly -3 dB/octave. */
function pinkNoise(length: number): Float32Array {
  const out = new Float32Array(length);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return out;
}

function normalize(data: Float32Array, peak: number): void {
  let max = 0;
  for (let i = 0; i < data.length; i++) max = Math.max(max, Math.abs(data[i]));
  if (max < 1e-6) return;
  const gain = peak / max;
  for (let i = 0; i < data.length; i++) data[i] *= gain;
}

function makeBuffer(ctx: AudioContext, seconds: number): { buffer: AudioBuffer; data: Float32Array; sr: number } {
  const sr = ctx.sampleRate;
  const length = Math.max(1, Math.floor(sr * seconds));
  const buffer = ctx.createBuffer(1, length, sr);
  return { buffer, data: buffer.getChannelData(0), sr };
}

function makeRoomToneBuffer(ctx: AudioContext): AudioBuffer {
  const { buffer, data, sr } = makeBuffer(ctx, ROOM_TONE_SECONDS);
  const noise = pinkNoise(data.length);
  let low = 0;
  let street = 0;
  for (let i = 0; i < data.length; i++) {
    const t = i / sr;
    // Heavy low-pass on the air bed.
    low += 0.018 * (noise[i] - low);
    // "Distant street": a second, even slower noise stage swelling gently.
    street += 0.006 * (noise[i] - street);
    const swell = 0.6 + 0.4 * Math.sin((2 * Math.PI * t) / 11 + noise[i] * 0.5);
    // 55 Hz hum + first harmonic, period divides the loop length exactly.
    const hum = 0.055 * Math.sin(2 * Math.PI * 55 * t) + 0.02 * Math.sin(2 * Math.PI * 110 * t);
    data[i] = low * 0.85 + street * swell * 0.3 + hum;
  }
  normalize(data, 0.4);
  return buffer;
}

function makeAcHumBuffer(ctx: AudioContext): AudioBuffer {
  const { buffer, data, sr } = makeBuffer(ctx, AC_HUM_SECONDS);
  const noise = pinkNoise(data.length);
  let low = 0;
  let bandLow = 0;
  let bandHigh = 0;
  for (let i = 0; i < data.length; i++) {
    const t = i / sr;
    low += 0.05 * (noise[i] - low);
    // Cheap band-pass for the fan rush: difference of two one-pole LPFs.
    bandLow += 0.09 * (noise[i] - bandLow);
    bandHigh += 0.012 * (noise[i] - bandHigh);
    const fan = (bandLow - bandHigh) * 1.6;
    const flutter = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.6 * t);
    const hum = 0.14 * Math.sin(2 * Math.PI * 60 * t) + 0.06 * Math.sin(2 * Math.PI * 120 * t);
    data[i] = (fan * 0.7 + hum) * flutter + low * 0.25;
  }
  normalize(data, 0.5);
  return buffer;
}

function makeBreathBuffer(ctx: AudioContext, kind: Exclude<AmbientBreathKind, 'none'>, rpm: number): AudioBuffer {
  const cycleSec = clamp(60 / clamp(rpm, 6, 50), 1.2, 8);
  const cycles = clamp(Math.round(10 / cycleSec), 2, 6);
  const { buffer, data, sr } = makeBuffer(ctx, cycleSec * cycles);
  const noise = pinkNoise(data.length);
  let bed = 0;
  for (let i = 0; i < data.length; i++) {
    const t = i / sr;
    const local = t % cycleSec;
    const phase = local / cycleSec;
    const inspiratory = phase < 0.38;
    const phaseIn = inspiratory ? phase / 0.38 : 0;
    const phaseOut = inspiratory ? 0 : (phase - 0.38) / 0.62;
    // Breathing bed noise — low-passed so it sits under the musical sounds.
    bed += 0.04 * (noise[i] - bed);
    const inEnv = inspiratory ? Math.sin(Math.PI * phaseIn) : 0;
    const outEnv = inspiratory ? 0 : Math.sin(Math.PI * Math.min(1, phaseOut));

    if (kind === 'wheeze') {
      // Expiratory polyphonic whistle: base pitch glides up through
      // expiration, two detuned partials, noise-modulated so it doesn't
      // sound like a test tone.
      const baseHz = clamp(500 + rpm * 2, 380, 700);
      const f = baseHz + 150 * phaseOut;
      const mod = noise[i];
      const w1 = Math.sin(2 * Math.PI * f * t + mod * 2.2) * (0.8 + 0.25 * mod);
      const w2 = Math.sin(2 * Math.PI * f * 1.5 * t + mod * 1.3) * (0.7 + 0.2 * mod);
      data[i] = bed * (0.25 + 0.45 * inEnv) + outEnv * (w1 * 0.3 + w2 * 0.16);
    } else if (kind === 'stridor') {
      // Harsh inspiratory crow — louder on inspiration than expiration.
      const f = 620 + 80 * Math.sin(2 * Math.PI * 0.7 * t);
      const harsh = Math.sin(2 * Math.PI * f * t + noise[i] * 3.0) * (0.7 + 0.3 * Math.abs(noise[i]));
      const formant = Math.sin(2 * Math.PI * f * 0.5 * t);
      data[i] = bed * (0.25 + 0.35 * outEnv) + inEnv * (harsh * 0.3 + formant * 0.12);
    } else {
      // Clear: quiet vesicular rustle, inspiration slightly louder.
      const env = inspiratory ? inEnv : outEnv * 0.75;
      data[i] = bed * env;
    }
  }
  normalize(data, kind === 'clear' ? 0.32 : 0.45);
  return buffer;
}

const VOLUME = {
  roomTone: 0.045,
  ac: 0.11,
  bed: 0.05,
  wheeze: 0.34,
  stridor: 0.34,
  clear: 0.16,
} as const;

export function createAmbientAudio({
  enabled: initiallyEnabled = true,
  variant = 'home',
  patientPosition = DEFAULT_AMBIENT_PATIENT_POSITION,
}: AmbientAudioOptions = {}): AmbientAudioState {
  const listener = new THREE.AudioListener();
  const ctx = listener.context;
  // Share the clinical-sounds unlock registry: first pointer/key gesture
  // resumes this context alongside the auscultation/voice contexts.
  registerAudioContextForUnlock(ctx);

  const roomTone = new THREE.Audio(listener);
  roomTone.setBuffer(makeRoomToneBuffer(ctx));
  roomTone.setLoop(true);
  roomTone.setVolume(initiallyEnabled ? VOLUME.roomTone : 0);
  roomTone.play();

  const ac = new THREE.PositionalAudio(listener);
  ac.name = 'villa-ac-hum';
  ac.userData.audioRole = 'environment-ac';
  ac.setBuffer(makeAcHumBuffer(ctx));
  ac.setLoop(true);
  ac.setRefDistance(0.9);
  ac.setRolloffFactor(1.6);
  ac.setDistanceModel('inverse');
  ac.setMaxDistance(8);
  // AC unit on the back wall (matches the villa AC prop placement).
  ac.position.set(1.5, 2.2, -1.8);
  ac.setVolume(initiallyEnabled ? VOLUME.ac : 0);
  ac.play();

  // Scene bed: the variant-specific ambient layer. The villa keeps its own
  // roomTone+AC stack; every outdoor variant gets a synthesized bed so the
  // scene sounds like the place it draws instead of being silent.
  const bed = new THREE.Audio(listener);
  bed.name = `scene-bed-${variant}`;
  bed.userData.audioRole = 'scene-bed';
  bed.setBuffer(makeSceneBedBuffer(ctx, variant));
  bed.setLoop(true);
  bed.setVolume(initiallyEnabled ? VOLUME.bed : 0);
  bed.play();

  const patient = new THREE.PositionalAudio(listener);
  patient.name = 'patient-breath';
  patient.userData.audioRole = 'patient-breath';
  patient.setRefDistance(0.55);
  patient.setRolloffFactor(1.8);
  patient.setDistanceModel('inverse');
  patient.setMaxDistance(7);
  patient.position.set(...patientPosition);

  let enabled = initiallyEnabled;
  let currentKind: AmbientBreathKind = 'none';
  let currentRpm = 0;

  const patientVolumeFor = (kind: AmbientBreathKind): number =>
    kind === 'none' ? 0 : VOLUME[kind];

  const setEnabled = (on: boolean): void => {
    enabled = on;
    roomTone.setVolume(on ? VOLUME.roomTone : 0);
    ac.setVolume(on ? VOLUME.ac : 0);
    bed.setVolume(on ? VOLUME.bed : 0);
    if (patient.buffer) patient.setVolume(on ? patientVolumeFor(currentKind) : 0);
  };

  const setPatientPosition = (position: AmbientAudioPosition): void => {
    patient.position.set(...position);
  };

  const setPatientBreath = (kind: AmbientBreathKind, rpm: number): void => {
    const nextKind: AmbientBreathKind = kind === 'none' || rpm <= 0 ? 'none' : kind;
    if (nextKind === currentKind && Math.abs(rpm - currentRpm) < 2) return;
    currentKind = nextKind;
    currentRpm = rpm;
    if (patient.isPlaying) patient.stop();
    if (nextKind === 'none') return;
    patient.setBuffer(makeBreathBuffer(ctx, nextKind, clamp(rpm, 6, 50)));
    patient.setLoop(true);
    patient.setVolume(enabled ? patientVolumeFor(nextKind) : 0);
    patient.play();
  };

  const onVisibility = (): void => {
    if (document.hidden) {
      ctx.suspend().catch(() => {});
    } else if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  const dispose = (): void => {
    document.removeEventListener('visibilitychange', onVisibility);
    for (const audio of [roomTone, ac, bed, patient] as const) {
      try {
        if (audio.isPlaying) audio.stop();
        audio.disconnect();
        // React Strict Mode mounts effects twice in development. Detach each
        // emitter as well as disconnecting its WebAudio nodes, otherwise the
        // stopped first pair remains in the R3F scene beside the live pair.
        audio.removeFromParent();
      } catch {
        // Best-effort teardown — a never-played node may have nothing to
        // disconnect; that is fine.
      }
    }
    listener.removeFromParent();
  };

  return {
    listener,
    roomTone,
    ac,
    bed,
    patient,
    setPatientBreath,
    setPatientPosition,
    setEnabled,
    dispose,
  };
}
