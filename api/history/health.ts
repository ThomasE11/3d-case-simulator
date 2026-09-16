import type { IncomingMessage, ServerResponse } from 'node:http';

// See index.ts: Vercel's NodeNext function compiler requires .js here.
import { resolveProvider } from './chat.js';

/**
 * Health probe for /api/history. The client uses `ok` to decide whether to
 * even attempt an LLM answer, so an unconfigured install never pays a failed
 * round-trip per question. Reports the provider and model, never the key.
 */
export default function handler(_req: IncomingMessage, res: ServerResponse) {
  const provider = resolveProvider();
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({
    ok: Boolean(provider),
    provider: provider?.kind ?? 'none',
    model: provider?.model,
  }));
}
