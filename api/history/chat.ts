/**
 * Patient-history chat completion.
 *
 * Shared by the Vercel function (api/history/index.ts) and the Vite dev
 * middleware, so local dev and production hit identical logic.
 *
 * Two providers, both OpenAI-compatible so they share one request shape:
 *   - Ollama      — when OLLAMA_URL is set. Local or Ollama Cloud. No cost.
 *   - AI Gateway  — Vercel's, using the AI_GATEWAY_API_KEY already provisioned
 *                   for TTS. Default model is a small/cheap one.
 *
 * Ollama wins when configured, because it is free. Any failure returns null
 * so the caller falls back to the deterministic history engine.
 *
 * ponytail: one fetch, no SDK. Both providers speak /chat/completions.
 */

type Fetch = typeof fetch;

export type HistoryChatOptions = {
  systemPrompt: string;
  question: string;
  fetchImpl?: Fetch;
};

/** Patient answers are one or two sentences — this caps a runaway model. */
const MAX_TOKENS = 120;
const TIMEOUT_MS = 12_000;

export function resolveProvider(env: NodeJS.ProcessEnv = process.env): {
  kind: 'ollama' | 'ai-gateway';
  url: string;
  model: string;
  apiKey: string;
} | null {
  const ollamaUrl = env.OLLAMA_URL?.trim();
  if (ollamaUrl) {
    return {
      kind: 'ollama',
      // Ollama's NATIVE chat route, not its OpenAI-compatible one. The compat
      // route ignores `think:false`, so a reasoning model (qwen3.5, the local
      // default) spends the whole token budget on hidden reasoning and returns
      // an empty `content`. Native + think:false answers in ~2s instead.
      url: `${ollamaUrl.replace(/\/$/, '')}/api/chat`,
      model: env.OLLAMA_MODEL?.trim() || 'hermes-qwen3.5:9b',
      // Ollama Cloud needs a key; a local server ignores the header.
      apiKey: env.OLLAMA_API_KEY?.trim() || '',
    };
  }

  const gatewayKey = env.AI_GATEWAY_API_KEY?.trim();
  if (gatewayKey) {
    // Deliberately NOT AI_GATEWAY_BASE_URL — that one points at the gateway's
    // v4 speech root for TTS. Chat lives on the OpenAI-compatible v1 route.
    const url = env.AI_GATEWAY_CHAT_URL?.trim()
      || 'https://ai-gateway.vercel.sh/v1/chat/completions';
    return {
      kind: 'ai-gateway',
      url,
      // Small + cheap by default: patient answers are two sentences of
      // paraphrase over a brief we already wrote. Override per deployment.
      model: env.AI_GATEWAY_HISTORY_MODEL?.trim() || 'openai/gpt-4o-mini',
      apiKey: gatewayKey,
    };
  }

  return null;
}

/** Strip anything that breaks the illusion of a person talking. */
export function sanitiseAnswer(raw: string): string {
  const cleaned = raw
    .replace(/^\s*(?:patient|answer|response)\s*:\s*/i, '')
    .replace(/\*+/g, '')
    .replace(/^\s*[-•]\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["'“”](.*)["'“”]$/s, '$1')
    .trim();
  // A model that ignored the brevity rule gets cut to its first two sentences
  // rather than monologuing at a student mid-assessment.
  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [cleaned];
  return sentences.slice(0, 2).map(s => s.trim()).filter(Boolean).join(' ');
}

/**
 * Ask the configured model for the patient's reply. Returns null on any
 * miss — unconfigured, unreachable, timed out, empty, or refused — so the
 * caller keeps its existing deterministic answer.
 */
export async function requestPatientAnswer({
  systemPrompt,
  question,
  fetchImpl = fetch,
}: HistoryChatOptions): Promise<{ answer: string; provider: string } | null> {
  const provider = resolveProvider();
  if (!provider) return null;

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (provider.apiKey) headers.Authorization = `Bearer ${provider.apiKey}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ];
    const body = provider.kind === 'ollama'
      ? {
        model: provider.model,
        messages,
        stream: false,
        think: false,
        options: { temperature: 0.7, num_predict: MAX_TOKENS },
      }
      : {
        model: provider.model,
        messages,
        temperature: 0.7,
        max_tokens: MAX_TOKENS,
      };

    const upstream = await fetchImpl(provider.url, {
      method: 'POST',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers,
      body: JSON.stringify(body),
    });

    if (!upstream.ok) return null;
    const payload = await upstream.json() as {
      message?: { content?: string };
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = provider.kind === 'ollama'
      ? payload.message?.content
      : payload.choices?.[0]?.message?.content;
    if (typeof content !== 'string') return null;
    const answer = sanitiseAnswer(content);
    if (!answer) return null;
    return { answer, provider: provider.kind };
  } catch {
    return null;
  }
}
