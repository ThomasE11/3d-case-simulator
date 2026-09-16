import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Plugin } from "vite"

import { requestGatewaySpeech } from "./api/tts/gatewaySpeech"

type VoiceRole = 'dispatcher' | 'patient' | 'narrator'
type PatientVoiceProfile = { gender?: 'male' | 'female' }

function envValue(env: Record<string, string>, name: string, fallback: string): string {
  return env[name] || process.env[name] || fallback
}

export function resolveProxyVoice(
  env: Record<string, string>,
  provider: 'elevenlabs' | 'ai-gateway',
  role: VoiceRole,
  patientVoice?: PatientVoiceProfile,
): string {
  if (provider === 'elevenlabs') {
    if (role === 'patient' && patientVoice?.gender === 'male') {
      return envValue(env, 'ELEVENLABS_VOICE_PATIENT_MALE', 'pNInz6obpgDQGcFmaJgB')
    }
    const name = `ELEVENLABS_VOICE_${role.toUpperCase()}`
    const fallback = role === 'dispatcher'
      ? 'pNInz6obpgDQGcFmaJgB'
      : role === 'patient'
        ? '21m00Tcm4TlvDq8ikWAM'
        : 'EXAVITQu4vr4xnSDxMaL'
    return envValue(env, name, fallback)
  }

  if (role === 'patient' && patientVoice?.gender === 'male') {
    return envValue(env, 'AI_GATEWAY_VOICE_PATIENT_MALE', 'onyx')
  }
  const name = `AI_GATEWAY_VOICE_${role.toUpperCase()}`
  const fallback = role === 'dispatcher' ? 'alloy' : role === 'patient' ? 'shimmer' : 'nova'
  return envValue(env, name, fallback)
}

/**
 * Dev-only TTS proxy with the same fall-through as production:
 *   ElevenLabs (primary) → Vercel AI Gateway OpenAI speech (mid-tier) →
 *   non-2xx so the client falls back to Supertonic → Web Speech.
 *
 * API keys live ONLY in the dev server's environment (read from .env via
 * loadEnv) and are NEVER bundled into the client. The browser calls the local
 * `/api/tts` endpoint; this middleware attaches the key server-side and
 * streams the MP3 back. Production uses the matching Vercel Functions in
 * `api/tts/`.
 *
 * Configure by adding to `.env.local` (gitignored):
 *   ELEVENLABS_API_KEY=sk-...
 *   AI_GATEWAY_API_KEY=<vercel-ai-gateway-key>   (mid-tier fallback)
 * Optional overrides:
 *   ELEVENLABS_MODEL=eleven_turbo_v2_5
 *   ELEVENLABS_VOICE_DISPATCHER / _PATIENT / _NARRATOR=<voiceId>
 *   ELEVENLABS_VOICE_PATIENT_MALE=<voiceId>
 *   AI_GATEWAY_TTS_MODEL=openai/tts-1
 *   AI_GATEWAY_VOICE_PATIENT_MALE=<voiceName>
 */
function ttsProxy(env: Record<string, string>): Plugin {
  const KEY = (env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY || '').trim()
  // ElevenLabs account/key IDs are easy to paste into .env by mistake. They
  // are non-empty but cannot authenticate; advertising them as healthy makes
  // every narration generate a noisy 400 before falling back. Real secret
  // keys use the documented sk_ prefix and are substantially longer.
  const HAS_PLAUSIBLE_KEY = /^sk_[A-Za-z0-9_-]{20,}$/.test(KEY)
  const MODEL = env.ELEVENLABS_MODEL || process.env.ELEVENLABS_MODEL || 'eleven_turbo_v2_5'
  // Vercel AI Gateway (OpenAI speech) mid-tier.
  const GATEWAY_KEY = (env.AI_GATEWAY_API_KEY || process.env.AI_GATEWAY_API_KEY || '').trim()
  const GATEWAY_MODEL = env.AI_GATEWAY_TTS_MODEL || process.env.AI_GATEWAY_TTS_MODEL || 'openai/tts-1'
  const GATEWAY_BASE = (env.AI_GATEWAY_BASE_URL || process.env.AI_GATEWAY_BASE_URL || 'https://ai-gateway.vercel.sh/v4/ai').replace(/\/$/, '')
  const HAS_GATEWAY = GATEWAY_KEY.length > 0

  async function elevenLabsAudio(
    text: string,
    role: VoiceRole,
    patientVoice?: PatientVoiceProfile,
  ): Promise<Buffer | null> {
    if (!HAS_PLAUSIBLE_KEY) return null
    try {
      const upstream = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${resolveProxyVoice(env, 'elevenlabs', role, patientVoice)}/stream?optimize_streaming_latency=2`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': KEY,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify({
            text,
            model_id: MODEL,
            voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0, use_speaker_boost: true },
          }),
        },
      )
      if (!upstream.ok) return null
      const audio = Buffer.from(await upstream.arrayBuffer())
      return audio.byteLength >= 64 ? audio : null
    } catch {
      return null
    }
  }

  async function gatewayAudio(
    text: string,
    role: VoiceRole,
    patientVoice?: PatientVoiceProfile,
  ): Promise<Buffer | null> {
    if (!HAS_GATEWAY) return null
    return requestGatewaySpeech({
      baseUrl: GATEWAY_BASE,
      apiKey: GATEWAY_KEY,
      model: GATEWAY_MODEL,
      voice: resolveProxyVoice(env, 'ai-gateway', role, patientVoice),
      text,
    })
  }

  return {
    name: 'tts-proxy',
    configureServer(server) {
      // Browser probes to a missing localhost service produce an unavoidable
      // ERR_CONNECTION_REFUSED console entry even when fetch() is caught. Do
      // the optional Supertonic health check from the Vite process instead and
      // return a clean same-origin result; actual synthesis remains direct once
      // the service has been confirmed reachable.
      server.middlewares.use('/api/supertonic/health', async (_req, res) => {
        try {
          const upstream = await fetch('http://127.0.0.1:7788/v1/health', {
            signal: AbortSignal.timeout(800),
          })
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: upstream.ok, provider: 'supertonic' }))
        } catch {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false, provider: 'supertonic' }))
        }
      })

      // Patient-history LLM. Dev reuses the same handlers the Vercel
      // functions export, so local and production behave identically. Those
      // handlers read process.env (as they do on Vercel), but in dev the keys
      // live in .env.local and only reach us through loadEnv — so mirror them
      // across once. Never overwrites a real process.env value.
      for (const key of [
        'OLLAMA_URL', 'OLLAMA_MODEL', 'OLLAMA_API_KEY',
        'AI_GATEWAY_API_KEY', 'AI_GATEWAY_CHAT_URL', 'AI_GATEWAY_HISTORY_MODEL',
      ]) {
        if (!process.env[key] && env[key]) process.env[key] = env[key]
      }

      // More specific health path registered first.
      server.middlewares.use('/api/history/health', async (req, res) => {
        const { default: health } = await import('./api/history/health')
        health(req, res)
      })
      server.middlewares.use('/api/history', async (req, res) => {
        const { default: history } = await import('./api/history/index')
        await history(req, res)
      })

      // Health/config probe — the client uses this to decide whether to route
      // narration through /api/tts. Reflects BOTH engines without exposing any
      // secret material. Registered before /api/tts so the more specific path
      // wins.
      server.middlewares.use('/api/tts/health', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          ok: HAS_PLAUSIBLE_KEY || HAS_GATEWAY,
          provider: HAS_PLAUSIBLE_KEY ? 'elevenlabs' : HAS_GATEWAY ? 'ai-gateway' : 'none',
          model: MODEL,
          engines: { elevenlabs: HAS_PLAUSIBLE_KEY, 'ai-gateway': HAS_GATEWAY },
          gatewayModel: HAS_GATEWAY ? GATEWAY_MODEL : undefined,
        }))
      })

      server.middlewares.use('/api/tts', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method Not Allowed'); return }
        if (!HAS_PLAUSIBLE_KEY && !HAS_GATEWAY) { res.statusCode = 503; res.end('No TTS provider configured'); return }
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', async () => {
          try {
            const { text, role, patientVoice } = JSON.parse(body || '{}') as {
              text?: string
              role?: string
              patientVoice?: PatientVoiceProfile
            }
            if (!text || !text.trim()) { res.statusCode = 400; res.end('no text'); return }
            const safeRole: VoiceRole = role === 'dispatcher' || role === 'patient' || role === 'narrator'
              ? role
              : 'narrator'
            const safePatientVoice = patientVoice?.gender === 'male'
              ? { gender: 'male' as const }
              : undefined

            // Fall-through: ElevenLabs → Vercel AI Gateway → 502 (client Web Speech).
            const elevenLabs = await elevenLabsAudio(text, safeRole, safePatientVoice)
            if (elevenLabs) {
              res.statusCode = 200
              res.setHeader('Content-Type', 'audio/mpeg')
              res.setHeader('Cache-Control', 'no-store')
              res.setHeader('X-TTS-Provider', 'elevenlabs')
              res.end(elevenLabs)
              return
            }
            const gateway = await gatewayAudio(text, safeRole, safePatientVoice)
            if (gateway) {
              res.statusCode = 200
              res.setHeader('Content-Type', 'audio/mpeg')
              res.setHeader('Cache-Control', 'no-store')
              res.setHeader('X-TTS-Provider', 'ai-gateway')
              res.end(gateway)
              return
            }
            res.statusCode = 502
            res.end('TTS upstream failed')
          } catch (e) {
            res.statusCode = 500
            res.end(`tts proxy error: ${(e as Error).message}`)
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars (incl. non-VITE_ secrets like ELEVENLABS_API_KEY) for
  // server-side use only — they are not exposed to the client bundle.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: process.env.GITHUB_PAGES ? '/paramedic-app/' : '/',
    plugins: [react(), ttsProxy(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: ['react-i18next', 'html-parse-stringify', 'void-elements'],
    },
    build: {
      // Bump the warning threshold — the big chunk is intentional (case data
      // bundle + engine) and the split below already peels off the obvious
      // vendor wins. Keep the warning enabled but at a less noisy level.
      chunkSizeWarningLimit: 750,
      // Filter modulepreload: Vite's default preloads the *entire* lazy
      // dependency graph into the initial HTML — so even though StudentPanel
      // / pdf-export / three.js are lazy at runtime, the browser still
      // downloads them on first paint. For students on 4G joining a
      // classroom, we want the truly lazy chunks to stay lazy. Strip
      // heavy vendor/lazy chunks from the preload list; React / Supabase
      // / Radix still preload because every route needs them.
      modulePreload: {
        resolveDependencies: (_filename: string, deps: string[]) => deps.filter((dep) => {
          return !/vendor-(three|pdf)|cases-|StudentPanel|ClassroomHost|ClassroomVideoTiles|pdf-export|ClinicalReferenceDialog|CaseDisplay|SessionSummary|InstructorNotesPanel/.test(dep)
        }),
      },
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            // Vite's dynamic-import preload helper is needed by EVERY chunk
            // that has a dynamic import — including the entry. Left to rollup
            // it landed inside vendor-pdf, which made the entry statically
            // import the whole 588KB PDF bundle just to reach a ~1KB helper.
            // Pin it to its own tiny chunk so the entry stays lean.
            if (id.includes('vite/preload-helper')) return 'preload-helper'
            // Split the case bundle per source file so each streams as its
            // own lazy chunk (kept out of modulePreload above). The core
            // aggregator (cases.ts) still pulls them all in via loadAllCases,
            // but the browser fetches them in parallel instead of one 1.2 MB blob.
            if (id.includes('/src/data/cases.ts')) return 'cases-core'
            if (id.includes('/src/data/firstYearCases.ts')) return 'cases-year1'
            if (id.includes('/src/data/secondYearCases.ts')) return 'cases-year2'
            if (id.includes('/src/data/enhancedCases.ts')
              || id.includes('/src/data/additionalCases.ts')) {
              return 'cases-enhanced'
            }
            if (id.includes('/src/data/litflCases.ts')) return 'cases-litfl'
            if (id.includes('/src/data/severityVariantCases.ts')) return 'cases-variants'
            if (!id.includes('node_modules')) return undefined
            if (id.includes('/three/') || id.includes('node_modules/three')) return 'vendor-three'
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf'
            return undefined
          },
        },
      },
    },
  }
})
