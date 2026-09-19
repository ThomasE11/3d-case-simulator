import { describe, expect, it } from 'vitest';

import { resolveTtsVoice } from '../../api/tts/index';
import { resolveProxyVoice } from '../../vite.config';

describe('server TTS patient voice profile', () => {
  it('keeps the existing female defaults and opts into male voices explicitly', () => {
    expect(resolveTtsVoice('elevenlabs', 'patient')).toBe('21m00Tcm4TlvDq8ikWAM');
    expect(resolveTtsVoice('elevenlabs', 'patient', { gender: 'female' })).toBe('21m00Tcm4TlvDq8ikWAM');
    expect(resolveTtsVoice('elevenlabs', 'patient', { gender: 'male' })).toBe('pNInz6obpgDQGcFmaJgB');
    expect(resolveTtsVoice('ai-gateway', 'patient')).toBe('shimmer');
    expect(resolveTtsVoice('ai-gateway', 'patient', { gender: 'female' })).toBe('shimmer');
    expect(resolveTtsVoice('ai-gateway', 'patient', { gender: 'male' })).toBe('onyx');
  });

  it('keeps development and production defaults aligned and honours dev overrides', () => {
    expect(resolveProxyVoice({}, 'elevenlabs', 'patient')).toBe('21m00Tcm4TlvDq8ikWAM');
    expect(resolveProxyVoice({}, 'elevenlabs', 'patient', { gender: 'male' })).toBe('pNInz6obpgDQGcFmaJgB');
    expect(resolveProxyVoice({}, 'ai-gateway', 'patient')).toBe('shimmer');
    expect(resolveProxyVoice({}, 'ai-gateway', 'patient', { gender: 'male' })).toBe('onyx');
    expect(resolveProxyVoice(
      { ELEVENLABS_VOICE_PATIENT_MALE: 'custom-male' },
      'elevenlabs',
      'patient',
      { gender: 'male' },
    )).toBe('custom-male');
  });
});
