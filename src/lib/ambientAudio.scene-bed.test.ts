import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const audioMocks = vi.hoisted(() => {
  class FakeVector3 {
    x = 0;
    y = 0;
    z = 0;

    set(x: number, y: number, z: number) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }

    toArray() {
      return [this.x, this.y, this.z];
    }
  }

  class FakeAudio {
    buffer: unknown = null;
    isPlaying = false;
    position = new FakeVector3();
    name = '';
    userData: Record<string, unknown> = {};
    volume = 1;
    disconnected = false;
    removed = false;

    setBuffer(buffer: unknown) { this.buffer = buffer; return this; }
    setLoop() { return this; }
    setVolume(volume: number) { this.volume = volume; return this; }
    getVolume() { return this.volume; }
    setRefDistance() { return this; }
    setRolloffFactor() { return this; }
    setDistanceModel() { return this; }
    setMaxDistance() { return this; }
    play() { this.isPlaying = true; return this; }
    stop() { this.isPlaying = false; return this; }
    disconnect() { this.disconnected = true; return this; }
    removeFromParent() { this.removed = true; return this; }
  }

  const makeContext = () => ({
    // Real WebAudio runs at 44100 Hz. The mock must match so the Goertzel
    // probes in the test resolve the variant-specific partials (a 0.35 Hz
    // water lap needs ~1260 samples per cycle — at sr=100 the DFT bin
    // resolution is 0.125 Hz and the probe lands between bins).
    sampleRate: 44100,
    state: 'running',
    createBuffer: (_channels: number, length: number) => {
      // Real AudioBuffer hands out the SAME underlying storage on every
      // getChannelData call. The mock must do the same, otherwise
      // makeSceneBedBuffer writes into one array and a later read gets a
      // fresh zeroed one — which is exactly how a passing buffer looks
      // silent in a test.
      const data = new Float32Array(length);
      return {
        numberOfChannels: _channels,
        sampleRate: 44100,
        length,
        getChannelData: () => data,
      };
    },
    suspend: vi.fn().mockResolvedValue(undefined),
    resume: vi.fn().mockResolvedValue(undefined),
  });

  class FakeAudioListener {
    context = makeContext();
    removed = false;
    removeFromParent() { this.removed = true; }
  }

  return { FakeAudio, FakeAudioListener };
});

vi.mock('three', () => ({
  Audio: audioMocks.FakeAudio,
  PositionalAudio: audioMocks.FakeAudio,
  AudioListener: audioMocks.FakeAudioListener,
}));

vi.mock('@/data/clinicalSounds', () => ({
  registerAudioContextForUnlock: vi.fn(),
}));

import { createAmbientAudio, makeSceneBedBuffer } from './ambientAudio';
import type { EnvironmentVariant } from '@/lib/sceneEnvironment';

/** Fingerprint a buffer: peak + mean absolute amplitude + Goertzel magnitude
 *  probes at the characteristic frequencies each variant layers in.
 *  `normalise` caps the peak of every variant at the same value, so peak
 *  alone cannot distinguish them — the spectral probes can. */
function fingerprint(buffer: { getChannelData(ch: number): Float32Array; sampleRate?: number }) {
  const full = buffer.getChannelData(0);
  const sr = (buffer as { sampleRate?: number }).sampleRate ?? 44100;
  // Decimate to keep the Goertzel probes cheap. The buffer is periodic (8 s
  // at a fixed loop length), so every 16th sample is a faithful
  // representation — and at sr/16 ≈ 2756 Hz the bin resolution is still
  // ~0.125 Hz, enough to resolve the 0.35 Hz water-lap partial.
  const decimate = 16;
  const data = new Float32Array(Math.ceil(full.length / decimate));
  for (let i = 0, j = 0; i < full.length; i += decimate) {
    data[j++] = full[i];
  }
  const decimatedSr = sr / decimate;
  let peak = 0;
  let energy = 0;
  for (let i = 0; i < full.length; i++) {
    peak = Math.max(peak, Math.abs(full[i]));
    energy += Math.abs(full[i]);
  }
  const goertzel = (freq: number): number => {
    const N = data.length;
    const k = Math.round((freq * N) / decimatedSr);
    const omega = (2 * Math.PI * k) / N;
    const coeff = 2 * Math.cos(omega);
    let s0 = 0;
    let s1 = 0;
    let s2 = 0;
    for (let i = 0; i < N; i++) {
      s0 = data[i] + coeff * s1 - s2;
      s2 = s1;
      s1 = s0;
    }
    return Math.sqrt(s1 * s1 + s2 * s2 - coeff * s1 * s2);
  };
  return {
    peak,
    energy: energy / full.length,
    whine180: goertzel(180),
    waterLap: goertzel(0.35),
  };
}

describe('makeSceneBedBuffer', () => {
  beforeEach(() => {
    vi.stubGlobal('document', {
      hidden: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a finite, non-silent buffer for every variant', () => {
    const ctx = (new (audioMocks.FakeAudioListener)()).context as unknown as AudioContext;
    const variants: EnvironmentVariant[] = [
      'clinic', 'home', 'roadside', 'public', 'industrial', 'fire', 'water', 'heat', 'agricultural',
    ];
    for (const variant of variants) {
      const buffer = makeSceneBedBuffer(ctx, variant);
      expect(buffer.numberOfChannels).toBe(1);
      const data = buffer.getChannelData(0);
      expect(data.length).toBeGreaterThan(0);
      let peak = 0;
      for (let i = 0; i < data.length; i++) {
        peak = Math.max(peak, Math.abs(data[i]));
        expect(Number.isFinite(data[i])).toBe(true);
      }
      expect(peak).toBeGreaterThan(0);
    }
  }, 60000);

  it('produces a distinct spectral fingerprint per variant', () => {
    const ctx = (new (audioMocks.FakeAudioListener)()).context as unknown as AudioContext;
    const variants: EnvironmentVariant[] = [
      'clinic', 'home', 'roadside', 'public', 'industrial', 'fire', 'water', 'heat', 'agricultural',
    ];
    const fps = variants.map((v) => ({ variant: v, fp: fingerprint(makeSceneBedBuffer(ctx, v)) }));
    // Every variant must be non-silent.
    for (const { fp } of fps) {
      expect(fp.peak).toBeGreaterThan(0);
    }
    // The industrial variant layers a 180 Hz generator/compressor whine; its
    // Goertzel magnitude at 180 Hz must dominate every other variant.
    const industrial = fps.find((f) => f.variant === 'industrial')!.fp;
    for (const { variant, fp } of fps) {
      if (variant === 'industrial') continue;
      expect(industrial.whine180).toBeGreaterThan(fp.whine180);
    }
    // The water variant layers a slow 0.35 Hz lap partial; its Goertzel
    // magnitude at 0.35 Hz must dominate every other variant.
    const water = fps.find((f) => f.variant === 'water')!.fp;
    for (const { variant, fp } of fps) {
      if (variant === 'water') continue;
      expect(water.waterLap).toBeGreaterThan(fp.waterLap);
    }
  }, 60000);
});

describe('createAmbientAudio scene bed wiring', () => {
  beforeEach(() => {
    vi.stubGlobal('document', {
      hidden: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exposes a scene-bed emitter named after the variant', () => {
    const state = createAmbientAudio({ variant: 'roadside' });
    expect(state.bed.name).toBe('scene-bed-roadside');
    expect(state.bed.userData.audioRole).toBe('scene-bed');
    expect(state.bed.isPlaying).toBe(true);
    expect(state.bed.getVolume()).toBeGreaterThan(0);
  });

  it('mutes the scene bed when the voice preference is disabled', () => {
    const state = createAmbientAudio({ enabled: false, variant: 'industrial' });
    expect(state.bed.getVolume()).toBe(0);
    state.setEnabled(true);
    expect(state.bed.getVolume()).toBeGreaterThan(0);
    state.setEnabled(false);
    expect(state.bed.getVolume()).toBe(0);
  });

  it('tears the scene bed down on dispose', () => {
    const state = createAmbientAudio({ variant: 'fire' });
    const bed = state.bed as unknown as { removed: boolean; disconnected: boolean };
    expect(bed.removed).toBe(false);
    state.dispose();
    expect(bed.removed).toBe(true);
    expect(bed.disconnected).toBe(true);
  });
});