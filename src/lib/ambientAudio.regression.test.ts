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
    sampleRate: 100,
    state: 'running',
    createBuffer: (_channels: number, length: number) => {
      const data = new Float32Array(length);
      return { getChannelData: () => data };
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

import { createAmbientAudio } from './ambientAudio';
import { deriveSceneEnvironment, sceneEnvironmentLabel } from './sceneEnvironment';
import type { CaseScenario } from '@/types';

describe('ambient WebAudio state', () => {
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

  it('creates muted nodes that become audible when enabled later', () => {
    const state = createAmbientAudio({ enabled: false });
    state.setPatientBreath('wheeze', 32);

    expect(state.roomTone.isPlaying).toBe(true);
    expect(state.ac.isPlaying).toBe(true);
    expect(state.patient.isPlaying).toBe(true);
    expect(state.roomTone.getVolume()).toBe(0);
    expect(state.ac.getVolume()).toBe(0);
    expect(state.patient.getVolume()).toBe(0);

    state.setEnabled(true);
    expect(state.roomTone.getVolume()).toBeGreaterThan(0);
    expect(state.ac.getVolume()).toBeGreaterThan(0);
    expect(state.patient.getVolume()).toBeGreaterThan(0);

    state.setEnabled(false);
    expect(state.roomTone.getVolume()).toBe(0);
    expect(state.ac.getVolume()).toBe(0);
    expect(state.patient.getVolume()).toBe(0);
  });

  it('positions the patient emitter at the supplied chest coordinate and updates it live', () => {
    const state = createAmbientAudio({ patientPosition: [0, 0.99, 0.78] });

    expect(state.patient.position.toArray()).toEqual([0, 0.99, 0.78]);

    state.setPatientPosition([0.1, 0.82, 0.44]);
    expect(state.patient.position.toArray()).toEqual([0.1, 0.82, 0.44]);
  });
});

describe('ambient scene-awareness', () => {
  it('classifies a villa living room as the home variant', () => {
    const c = {
      id: 'resp-001',
      sceneInfo: { description: 'Villa living room', environment: 'home' },
    } as unknown as CaseScenario;
    expect(deriveSceneEnvironment(c)).toBe('home');
  });

  it('classifies an RTA on Al Khail Road as roadside, not water', () => {
    const c = {
      id: 'trauma-003',
      dispatchInfo: { location: 'Al Khail Road, Deira', callReason: 'RTA' },
      sceneInfo: { description: 'Roadside pavement', environment: 'roadside' },
    } as unknown as CaseScenario;
    expect(deriveSceneEnvironment(c)).toBe('roadside');
  });

  it('classifies a warehouse fire as fire, not industrial', () => {
    const c = {
      id: 'fire-001',
      sceneInfo: { description: 'Warehouse fire', environment: 'fire' },
    } as unknown as CaseScenario;
    expect(deriveSceneEnvironment(c)).toBe('fire');
  });

  it('returns the operational context label for a worksite office', () => {
    const c = {
      id: 'ind-001',
      dispatchInfo: { location: 'Construction site office' },
      sceneInfo: { description: 'Portacabin', environment: 'public' },
    } as unknown as CaseScenario;
    expect(sceneEnvironmentLabel(c, 'industrial')).toBe('worksite office');
  });
});
