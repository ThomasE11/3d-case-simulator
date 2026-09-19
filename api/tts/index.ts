import type { IncomingMessage, ServerResponse } from 'node:http';

import { requestGatewaySpeech } from './gatewaySpeech.js';

type VoiceRole = 'dispatcher' | 'patient' | 'narrator';
type PatientVoiceProfile = { gender?: 'male' | 'female' };

type TtsRequestBody = {
  text?: string;
  role?: VoiceRole;
  patientVoice?: PatientVoiceProfile;
};

const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_turbo_v2_5';
const MAX_TEXT_CHARS = 1800;
const VOICES: Record<VoiceRole, string> = {
  dispatcher: process.env.ELEVENLABS_VOICE_DISPATCHER || 'pNInz6obpgDQGcFmaJgB',
  patient: process.env.ELEVENLABS_VOICE_PATIENT || '21m00Tcm4TlvDq8ikWAM',
  narrator: process.env.ELEVENLABS_VOICE_NARRATOR || 'EXAVITQu4vr4xnSDxMaL',
};
const ELEVENLABS_PATIENT_MALE_VOICE =
  process.env.ELEVENLABS_VOICE_PATIENT_MALE || 'pNInz6obpgDQGcFmaJgB';

// ---------------------------------------------------------------------------
// Vercel AI Gateway (OpenAI speech) — the mid-tier between ElevenLabs and the
// client-side fallbacks. Auth uses AI_GATEWAY_API_KEY; on Vercel the OIDC
// token can also authenticate automatically when the Gateway is attached.
// https://vercel.com/docs/ai-gateway — native speech protocol for the
// official host, with OpenAI-compatible /audio/speech retained for custom
// gateways.
// ---------------------------------------------------------------------------
const GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY?.trim() || '';
const GATEWAY_TTS_MODEL = process.env.AI_GATEWAY_TTS_MODEL || 'openai/tts-1';
const GATEWAY_BASE_URL =
  (process.env.AI_GATEWAY_BASE_URL || 'https://ai-gateway.vercel.sh/v4/ai').replace(/\/$/, '');
// OpenAI speech voices — kept distinct so the role→voice mapping survives the
// fall-through. 'alloy'/'verse' read neutral-male; 'shimmer'/'nova' female.
const GATEWAY_VOICES: Record<VoiceRole, string> = {
  dispatcher: process.env.AI_GATEWAY_VOICE_DISPATCHER || 'alloy',
  patient: process.env.AI_GATEWAY_VOICE_PATIENT || 'shimmer',
  narrator: process.env.AI_GATEWAY_VOICE_NARRATOR || 'nova',
};
const GATEWAY_PATIENT_MALE_VOICE = process.env.AI_GATEWAY_VOICE_PATIENT_MALE || 'onyx';

export function resolveTtsVoice(
  provider: 'elevenlabs' | 'ai-gateway',
  role: VoiceRole,
  patientVoice?: PatientVoiceProfile,
): string {
  if (role === 'patient' && patientVoice?.gender === 'male') {
    return provider === 'elevenlabs'
      ? ELEVENLABS_PATIENT_MALE_VOICE
      : GATEWAY_PATIENT_MALE_VOICE;
  }
  return provider === 'elevenlabs' ? VOICES[role] : GATEWAY_VOICES[role];
}

type BodyCarrier = IncomingMessage & {
  body?: unknown;
};

function sendText(res: ServerResponse, statusCode: number, text: string) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(text);
}

function normaliseRole(role: unknown): VoiceRole {
  return role === 'dispatcher' || role === 'patient' || role === 'narrator'
    ? role
    : 'narrator';
}

async function readBody(req: BodyCarrier): Promise<TtsRequestBody> {
  if (req.body && typeof req.body === 'object') return req.body as TtsRequestBody;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}') as TtsRequestBody;

  let raw = '';
  for await (const chunk of req) {
    raw += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
    if (raw.length > MAX_TEXT_CHARS + 500) break;
  }
  return JSON.parse(raw || '{}') as TtsRequestBody;
}

function hasPlausibleElevenLabsKey(): boolean {
  const key = process.env.ELEVENLABS_API_KEY?.trim() || '';
  return /^sk_[A-Za-z0-9_-]{20,}$/.test(key);
}

/** Primary engine. Returns the MP3 buffer, or throws/returns null on failure. */
async function synthesiseWithElevenLabs(
  text: string,
  role: VoiceRole,
  patientVoice?: PatientVoiceProfile,
): Promise<Buffer | null> {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key || !/^sk_[A-Za-z0-9_-]{20,}$/.test(key)) return null;

  const voiceId = resolveTtsVoice('elevenlabs', role, patientVoice);
  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=2`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': key,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        voice_settings: {
          stability: role === 'dispatcher' ? 0.52 : 0.44,
          similarity_boost: 0.82,
          style: role === 'patient' ? 0.18 : 0.08,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!upstream.ok) return null;
  const audio = Buffer.from(await upstream.arrayBuffer());
  return audio.byteLength >= 64 ? audio : null;
}

/** Mid-tier engine: Vercel AI Gateway OpenAI speech. Null when unconfigured/failed. */
async function synthesiseWithGateway(
  text: string,
  role: VoiceRole,
  patientVoice?: PatientVoiceProfile,
): Promise<Buffer | null> {
  if (!GATEWAY_API_KEY) return null;
  return requestGatewaySpeech({
    baseUrl: GATEWAY_BASE_URL,
    apiKey: GATEWAY_API_KEY,
    model: GATEWAY_TTS_MODEL,
    voice: resolveTtsVoice('ai-gateway', role, patientVoice),
    text,
  });
}

export default async function handler(req: BodyCarrier, res: ServerResponse) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendText(res, 405, 'Method Not Allowed');
    return;
  }

  let body: TtsRequestBody;
  try {
    body = await readBody(req);
  } catch {
    sendText(res, 400, 'Invalid JSON body');
    return;
  }

  const text = String(body.text || '').trim();
  if (!text) {
    sendText(res, 400, 'No text provided');
    return;
  }

  if (text.length > MAX_TEXT_CHARS) {
    sendText(res, 413, `Text too long. Maximum is ${MAX_TEXT_CHARS} characters.`);
    return;
  }

  const role = normaliseRole(body.role);
  const requestedPatientGender = body.patientVoice?.gender;
  const patientVoice = requestedPatientGender === 'male' || requestedPatientGender === 'female'
    ? { gender: requestedPatientGender }
    : undefined;

  // Fall-through order: ElevenLabs (primary) → Vercel AI Gateway (mid-tier) →
  // non-2xx so the client reaches Web Speech. Each engine returns null on any
  // miss (missing/invalid key, 401/429/503, empty audio, hard upstream fail).
  try {
    const elevenLabs = await synthesiseWithElevenLabs(text, role, patientVoice).catch(() => null);
    if (elevenLabs) {
      res.setHeader('X-TTS-Provider', 'elevenlabs');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Length', String(elevenLabs.byteLength));
      res.end(elevenLabs);
      return;
    }

    const gateway = await synthesiseWithGateway(text, role, patientVoice).catch(() => null);
    if (gateway) {
      res.setHeader('X-TTS-Provider', 'ai-gateway');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Length', String(gateway.byteLength));
      res.end(gateway);
      return;
    }
  } catch (error) {
    sendText(res, 500, `tts proxy error: ${(error as Error).message}`);
    return;
  }

  // Neither engine configured/reachable — signal the client to fall through to
  // Supertonic / Web Speech. Keep the message secret-free.
  const elevenLabsConfigured = hasPlausibleElevenLabsKey();
  const gatewayConfigured = Boolean(GATEWAY_API_KEY);
  if (!elevenLabsConfigured && !gatewayConfigured) {
    sendText(res, 503, 'No TTS provider configured');
  } else {
    sendText(res, 502, 'TTS upstream failed');
  }
}
