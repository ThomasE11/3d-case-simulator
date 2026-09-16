import type { IncomingMessage, ServerResponse } from 'node:http';

// Vercel type-checks functions with NodeNext resolution, which requires the
// emitted JavaScript extension even though Vite resolves the TypeScript source
// in local development.
import { requestPatientAnswer, resolveProvider } from './chat.js';

/**
 * POST /api/history — the patient's free-text answer to a history question.
 *
 * The CLIENT sends the system prompt (built from the authored case by
 * src/lib/patientBrief.ts) plus the student's question. No secret material
 * crosses the wire; the provider key stays here.
 *
 * A 503/502 is a normal outcome, not an error: the client keeps the
 * deterministic answer from src/lib/historyTaking.ts whenever this misses.
 */

type BodyCarrier = IncomingMessage & { body?: unknown };

type HistoryRequestBody = {
  systemPrompt?: string;
  question?: string;
};

const MAX_PROMPT_CHARS = 8000;
const MAX_QUESTION_CHARS = 400;

function sendText(res: ServerResponse, statusCode: number, text: string) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(text);
}

async function readBody(req: BodyCarrier): Promise<HistoryRequestBody> {
  if (req.body && typeof req.body === 'object') return req.body as HistoryRequestBody;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}') as HistoryRequestBody;

  let raw = '';
  for await (const chunk of req) {
    raw += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
    if (raw.length > MAX_PROMPT_CHARS + MAX_QUESTION_CHARS + 500) break;
  }
  return JSON.parse(raw || '{}') as HistoryRequestBody;
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

  let body: HistoryRequestBody;
  try {
    body = await readBody(req);
  } catch {
    sendText(res, 400, 'Invalid JSON body');
    return;
  }

  const systemPrompt = String(body.systemPrompt || '').trim();
  const question = String(body.question || '').trim();
  if (!systemPrompt || !question) {
    sendText(res, 400, 'systemPrompt and question are required');
    return;
  }
  if (systemPrompt.length > MAX_PROMPT_CHARS || question.length > MAX_QUESTION_CHARS) {
    sendText(res, 413, 'Prompt too long');
    return;
  }

  if (!resolveProvider()) {
    sendText(res, 503, 'No history model configured');
    return;
  }

  const result = await requestPatientAnswer({ systemPrompt, question }).catch(() => null);
  if (!result) {
    sendText(res, 502, 'History model upstream failed');
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ answer: result.answer, provider: result.provider }));
}
