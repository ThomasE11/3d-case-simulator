/**
 * VoiceHistoryPanel
 *
 * Replaces the old click-through SAMPLE form with a real-time spoken
 * conversation between the student and the patient. The student presses
 * the mic, asks any history question, the system transcribes the question
 * live, classifies what was asked, and the patient (or a bystander, if
 * unconscious) answers in voice via Supertonic.
 *
 * Realism beats the previous SAMPLE list because:
 *   1. Students must phrase the question themselves (boards demand verbal skill).
 *   2. The patient sometimes can't answer ("I... I don't remember") — that's
 *      the real clinical experience and forces the student to escalate.
 *   3. Unconscious patients shift the burden to collateral history from
 *      bystanders, with explicit attribution ("His wife says...").
 *   4. Coverage chips show which SAMPLE categories were obtained — replaces
 *      checkbox UX without losing the scoring signal.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useBedsideConversation } from '@/hooks/useBedsideConversation';
import './bedsideConversation.css';
import type { CaseScenario, VitalSigns } from '@/types';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { usePatientVoice } from '@/hooks/usePatientVoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mic, MicOff, MessageCircle, AlertCircle, User, Users, Stethoscope,
  CheckCircle2, History, Volume2, Send,
} from 'lucide-react';
import {
  classifyQuestion,
  generatePatientResponse,
  generateCollateralResponse,
  sceneHasAskableBystander,
  historyAnswerCanBeObtained,
  pickCollateralVoice,
  CATEGORY_LABELS,
  SAMPLE_CATEGORIES,
  type HistoryCategory,
  type HistoryTurn,
} from '@/lib/historyTaking';
import { askPatientModel } from '@/lib/historyLlm';

export interface VoiceHistoryFooterApi {
  /** Speak a line as the patient (no-ops if they cannot vocalise). */
  say: (text: string) => void;
  /** Run the full history ask pipeline (classify → answer bubble → speak). */
  askQuestion: (text: string) => void;
  canVocalize: boolean;
  isSpeaking: boolean;
  /** Same severity/breathless context used for SAMPLE answers. */
  responseContext: {
    severity: "mild" | "severe";
    altered: boolean;
    breathless: boolean;
  };
}

interface VoiceHistoryPanelProps {
  caseData: CaseScenario;
  currentVitals?: VitalSigns | null;
  isInArrest?: boolean;
  appliedTreatmentIds?: string[];
  /** Retain the conversation between tabs, but stop the microphone and voice. */
  isActive?: boolean;
  /** Called whenever a new category is successfully obtained. Lets the
   *  parent feed this into debrief scoring. */
  onCategoryObtained?: (category: HistoryCategory) => void;
  /** Optional content rendered inside the history card's footer — used to fold
   *  the pain-severity (OPQRST "S") control into history-taking rather than a
   *  separate card. May be a node or a render prop that receives patient-voice
   *  helpers so the parent can drive jaw-synced speech (e.g. pain scale ask). */
  footer?: ReactNode | ((api: VoiceHistoryFooterApi) => ReactNode);
}

export function VoiceHistoryPanel({ caseData, currentVitals, isInArrest, appliedTreatmentIds, isActive = true, onCategoryObtained, footer }: VoiceHistoryPanelProps) {
  const { t } = useTranslation();
  const { target, setActive } = useBedsideConversation(caseData.id);
  const bedside = Boolean(target && isActive);
  useEffect(() => {
    setActive(bedside);
    // Wait for the scene's dock layout to commit before measuring its top.
    // A smooth scroll races input focus and can scroll the patient away.
    const frame = bedside ? window.requestAnimationFrame(() => {
      target?.closest('.patient-model-canvas-shell')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }) : null;
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      setActive(false);
    };
  }, [bedside, setActive, target]);
  const patientVoice = usePatientVoice(caseData, { vitals: currentVitals, isInArrest, appliedTreatmentIds });
  const [turns, setTurns] = useState<HistoryTurn[]>([]);
  const [obtained, setObtained] = useState<Set<HistoryCategory>>(new Set());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const canAskBystander = sceneHasAskableBystander(caseData);
  const [preferredTarget, setAskTarget] = useState<'patient' | 'bystander'>('patient');
  const askTarget = !patientVoice.canVocalize && canAskBystander ? 'bystander' : preferredTarget;
  const askingBystander = askTarget === 'bystander' && canAskBystander;
  const responseContext = patientVoice.communication.responseContext;
  const answerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestVoice = useRef(patientVoice);
  const stopListening = useRef<() => void>(() => {});
  // A free-text model reply can take longer than the next student question.
  // Keep a monotonically increasing turn token so an old request cannot speak
  // over, or rewrite, a newer part of the interview.
  const questionSequence = useRef(0);
  useEffect(() => { latestVoice.current = patientVoice; }, [patientVoice]);

  // Process an incoming question once — classify, fetch response, push to
  // the conversation, speak via patient voice.
  const processQuestion = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !isActive) return;
    const questionId = ++questionSequence.current;
    stopListening.current();
    if (answerTimer.current) clearTimeout(answerTimer.current);
    patientVoice.stop();
    const category = classifyQuestion(trimmed);
    const studentTurn: HistoryTurn = {
      id: `${Date.now()}-s`,
      role: 'student',
      text: trimmed,
      category,
      timestamp: Date.now(),
    };

    let answer: string | null;
    let attribution: 'patient' | 'system' = 'patient';
    // WHO is answering — shown as a label on the bubble so the student can see
    // at a glance whether the line came from the patient or which bystander.
    const collateralSpeaker = canAskBystander
      ? pickCollateralVoice(caseData.sceneInfo?.bystanders ?? '')
      : 'Bystander';
    let speaker = 'Patient';
    if (askingBystander) {
      answer = generateCollateralResponse(caseData, category);
      attribution = 'system';
      speaker = collateralSpeaker;
    } else if (patientVoice.canVocalize) {
      answer = generatePatientResponse(caseData, category, responseContext);
      speaker = 'Patient';
    } else {
      answer = generateCollateralResponse(caseData, category);
      attribution = 'system';
      speaker = collateralSpeaker;
    }

    const answerTurn: HistoryTurn = {
      id: `${Date.now()}-a`,
      role: attribution,
      text: answer ?? 'No response available.',
      category,
      timestamp: Date.now() + 1,
      speaker,
    };
    setTurns(prev => [...prev, { ...studentTurn, speaker: 'You' }, answerTurn]);

    // Track coverage — only count classified (non-unknown) questions. Functional
    // update so rapid back-to-back questions can't clobber each other. The
    // onCategoryObtained side-effect is fired from an effect (below), NOT here,
    // to avoid setState-in-render warnings in the parent.
    if (historyAnswerCanBeObtained(caseData, category, attribution === 'patient' ? 'patient' : 'bystander')) {
      setObtained(prev => {
        if (prev.has(category)) return prev;
        const next = new Set(prev);
        next.add(category);
        return next;
      });
    }

    const shouldAskHistoryModel = category === 'unknown'
      && attribution === 'patient'
      && patientVoice.canVocalize;

    // Voice the deterministic answers aloud. An unknown question waits for
    // the context-grounded model below: speaking the generic re-prompt first
    // and then interrupting it with the actual answer sounded like two people
    // talking at once.
    if (answer && attribution === 'patient' && !shouldAskHistoryModel) {
      // Small delay so the student sees their bubble appear before the
      // voice starts — feels like the patient pausing to think.
      answerTimer.current = setTimeout(() => {
        answerTimer.current = null;
        latestVoice.current.say(answer!);
      }, 400);
    }

    // The keyword classifier didn't recognise the phrasing, so the patient is
    // about to give a generic re-prompt. Ask the model instead — grounded in
    // this case's own authored facts. Deliberately scoped to 'unknown': every
    // recognised category keeps its deterministic, test-covered answer.
    if (shouldAskHistoryModel) {
      const turnId = answerTurn.id;
      void askPatientModel(caseData, trimmed).then(modelAnswer => {
        // A later question, tab change, or case change makes this response
        // stale. Keep the transcript and mouth animation tied to the current
        // turn only.
        if (questionSequence.current !== questionId) return;
        const spokenAnswer = modelAnswer ?? answer;
        if (!spokenAnswer) return;
        if (modelAnswer) {
          setTurns(prev => prev.map(t => (t.id === turnId ? { ...t, text: modelAnswer } : t)));
        }
        latestVoice.current.stop();
        latestVoice.current.say(spokenAnswer);
      });
    }
    // For collateral / system messages we deliberately don't speak — the
    // attribution makes more sense as a written note than a synthesised
    // bystander voice (we don't have a voice per bystander).
  }, [askingBystander, canAskBystander, caseData, responseContext, patientVoice, isActive]);

  // Report newly-obtained categories to the parent from an EFFECT (not during
  // render). A ref tracks what's already been reported so each fires once.
  const reportedRef = useRef<Set<HistoryCategory>>(new Set());
  useEffect(() => {
    obtained.forEach(cat => {
      if (!reportedRef.current.has(cat)) {
        reportedRef.current.add(cat);
        onCategoryObtained?.(cat);
      }
    });
  }, [obtained, onCategoryObtained]);

  // Free-text dictation: onFinalTranscript fires for EVERY finalised utterance
  // (including a question asked twice) — the old finalTranscript-value effect
  // silently dropped repeats.
  const voice = useVoiceInput({
    commands: [],
    onFinalTranscript: processQuestion,
  });
  useEffect(() => { stopListening.current = voice.stop; }, [voice.stop]);

  // Typed fallback — works when the mic is unavailable / denied, or the room
  // is too noisy. History-taking must never become unusable.
  const [typed, setTyped] = useState('');
  const submitTyped = useCallback(() => {
    const q = typed.trim();
    if (!q) return;
    processQuestion(q);
    setTyped('');
  }, [typed, processQuestion]);

  // Auto-scroll to newest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns.length, voice.interimTranscript]);

  // Tabs retain the interview, but no delayed answer or microphone may remain
  // active while the student is examining the patient or applying equipment.
  useEffect(() => {
    if (!isActive) return;
    return () => {
      questionSequence.current += 1;
      if (answerTimer.current) clearTimeout(answerTimer.current);
      answerTimer.current = null;
      latestVoice.current.stop();
      stopListening.current();
    };
  }, [isActive]);

  // When the patient cannot answer but a bystander is present, surface a
  // one-shot system note so the auto-switch to collateral history is visible
  // rather than silently redirecting answers to "A bystander".
  const autoSwitchNoteShown = useRef(false);
  useEffect(() => {
    if (autoSwitchNoteShown.current) return;
    if (!patientVoice.canVocalize && canAskBystander && turns.length === 0) {
      autoSwitchNoteShown.current = true;
      setTurns([{
        id: `${Date.now()}-auto`,
        role: 'system',
        text: 'Patient cannot answer — asking the bystander for collateral history.',
        timestamp: Date.now(),
        speaker: canAskBystander ? pickCollateralVoice(caseData.sceneInfo?.bystanders ?? '') : 'Bystander',
      }]);
    }
  }, [patientVoice.canVocalize, canAskBystander, turns.length, caseData]);

  const sampleCovered = SAMPLE_CATEGORIES.filter(c => obtained.has(c));
  const lastPatientAnswer = [...turns].reverse().find(turn => turn.role === 'patient');
  const playbackLabel = !patientVoice.enabled ? 'muted'
    : patientVoice.playbackStatus === 'loading' ? 'loading'
    : patientVoice.playbackStatus === 'error' ? 'error'
    : patientVoice.isSpeaking ? 'speaking' : 'ready';

  const panel = (
    <Card className={`min-w-0 w-full border border-border/60 bg-card overflow-hidden ${bedside ? 'bedside-history-panel' : ''}`} data-history-panel="true">
      <CardHeader className="p-3 border-b border-border/40">
        <div className="flex min-w-0 flex-col items-start gap-3">
          <CardTitle className="flex min-w-0 items-center gap-2 text-sm leading-snug">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
              <MessageCircle className="h-4 w-4 text-blue-500" />
            </div>
            {bedside ? t('bedside.title') : <>History Taking — {askTarget === 'bystander' && canAskBystander ? 'Ask a Bystander' : 'Ask the Patient'}</>}
          </CardTitle>
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            {canAskBystander && (
              <div className="flex rounded-full border border-slate-600/80 p-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                <button
                  type="button"
                  onClick={() => setAskTarget('patient')}
                  disabled={!patientVoice.canVocalize}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${askTarget === 'patient' ? 'bg-blue-500/25 text-blue-100' : 'text-slate-400'}`}
                  title={patientVoice.canVocalize ? 'Ask the patient' : 'Patient cannot answer'}
                >
                  <User className="h-3 w-3" />
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setAskTarget('bystander')}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${askTarget === 'bystander' ? 'bg-amber-500/25 text-amber-100' : 'text-slate-400'}`}
                  title="Ask a bystander for collateral history"
                >
                  <Users className="h-3 w-3" />
                  Bystander
                </button>
              </div>
            )}
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-300 dark:text-slate-200">
              SAMPLE {sampleCovered.length}/6
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-b border-border/40 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300" role="status">
          <p>{patientVoice.communication.status}</p>
          <p className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-slate-400">
            {askTarget === 'bystander' && canAskBystander ? t('bedside.written') : t(`bedside.${playbackLabel}`)}
          </p>
        </div>
        {/* Coverage chips */}
        <div className="px-4 pt-3 pb-2 border-b border-border/40 flex flex-wrap gap-1.5">
          {SAMPLE_CATEGORIES.map(cat => {
            const got = obtained.has(cat);
            return (
              <Badge
                key={cat}
                variant={got ? 'default' : 'outline'}
                className={`text-[10px] ${got ? 'bg-emerald-500/25 text-emerald-200 dark:text-emerald-100 border-emerald-400/40 hover:bg-emerald-500/25' : 'text-slate-300 dark:text-slate-200 border-slate-600'}`}
              >
                {got && <CheckCircle2 className="h-2.5 w-2.5 mr-1 text-emerald-400" />}
                {CATEGORY_LABELS[cat]}
              </Badge>
            );
          })}
        </div>

        {/* Conversation thread */}
        <div
          ref={scrollRef}
          role="log"
          aria-label="Patient history conversation"
          aria-live="polite"
          className={`history-transcript px-4 py-4 overflow-y-auto space-y-3 bg-slate-900/40 ${bedside ? 'min-h-0' : 'min-h-[260px] max-h-[420px]'}`}
        >
          {turns.length === 0 && !voice.isListening && !voice.interimTranscript && (
            <div className={`flex flex-col items-center justify-center text-center ${bedside ? 'py-1' : 'py-8'}`}>
              <History className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-200 dark:text-slate-100 max-w-md leading-relaxed">
                {askTarget === 'bystander' && canAskBystander
                  ? 'Ask the bystander what they saw, when it started, and what they know about the patient.'
                  : bedside ? t('bedside.prompt') : "Press the mic and ask the patient a history question — anything you'd ask in real practice. The patient will answer in their own voice."}
              </p>
              <p className={`text-[11px] text-slate-300 mt-3 ${bedside ? 'hidden' : ''}`}>
                Try: <em>"What medications do you take?"</em> · <em>"Any allergies?"</em> ·
                <em>"What were you doing when this started?"</em>
              </p>
            </div>
          )}
          {turns.map(turn => (
            <div
              key={turn.id}
              className={`flex gap-2 ${turn.role === 'student' ? 'justify-end' : 'justify-start'}`}
            >
              {turn.role !== 'student' && (
                <div className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 ${turn.role === 'system' ? 'bg-amber-500/15' : 'bg-blue-500/15'}`}>
                  {turn.role === 'system'
                    ? <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    : <User className="h-3.5 w-3.5 text-blue-500" />}
                </div>
              )}
              <div
                className={`rounded-2xl px-3 py-2 max-w-[78%] text-sm leading-relaxed ${
                  turn.role === 'student'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : turn.role === 'system'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-foreground rounded-tl-sm'
                      : 'bg-card border border-border rounded-tl-sm'
                }`}
              >
                {/* Speaker identity — the student must always know WHO is
                    talking: themselves, the Patient, or which collateral voice. */}
                <p className={`text-[9px] uppercase tracking-[0.16em] mb-0.5 font-semibold ${
                  turn.role === 'student'
                    ? 'opacity-70'
                    : turn.role === 'system'
                      ? 'text-amber-500'
                      : 'text-blue-500'
                }`}>
                  {turn.speaker ?? (turn.role === 'student' ? 'You' : turn.role === 'system' ? 'Bystander' : 'Patient')}
                  {turn.role === 'student' && turn.category && turn.category !== 'unknown' && (
                    <span className="opacity-70 font-normal"> · {CATEGORY_LABELS[turn.category]}</span>
                  )}
                </p>
                <p>{turn.text}</p>
              </div>
              {turn.role === 'student' && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 shrink-0">
                  <Stethoscope className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
            </div>
          ))}
          {/* Live interim transcript while student is speaking */}
          {voice.interimTranscript && (
            <div className="flex gap-2 justify-end opacity-60 animate-pulse">
              <div className="rounded-2xl px-3 py-2 max-w-[78%] text-sm leading-relaxed bg-primary/70 text-primary-foreground rounded-tr-sm italic">
                {voice.interimTranscript}…
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 shrink-0">
                <Mic className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Status line */}
        <div className="border-t border-border/40 px-4 pt-2.5 flex items-center gap-3 min-h-[24px]">
          {voice.isListening ? (
            <span className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Listening…
            </span>
          ) : !voice.isSupported ? (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Mic unavailable — type your question below
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Speak or type — ask the {askingBystander ? 'bystander' : 'patient'} anything you'd ask in real practice
            </span>
          )}
          {patientVoice.isSpeaking && (
            <span className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
              <Volume2 className="h-3 w-3" />
              Patient answering…
            </span>
          )}
        </div>

        {/* Mic + typed-input bar */}
        <div className="px-3 py-3 flex min-w-0 flex-col items-stretch gap-2 bg-card">
          {bedside && <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={patientVoice.toggleEnabled} className="h-9 text-xs">
              <Volume2 className="mr-1 h-3 w-3" />{t(patientVoice.enabled ? 'bedside.mute' : 'bedside.enable')}
            </Button>
            <Button size="sm" variant="outline" className="h-9 text-xs"
              disabled={!lastPatientAnswer || !patientVoice.enabled || !patientVoice.canVocalize || askTarget !== 'patient'}
              onClick={() => { if (lastPatientAnswer) patientVoice.say(lastPatientAnswer.text); }}>
              {t('bedside.replay')}
            </Button>
          </div>}
          <Button
            onClick={() => {
              if (answerTimer.current) clearTimeout(answerTimer.current);
              answerTimer.current = null;
              patientVoice.stop();
              voice.toggle();
            }}
            disabled={!voice.isSupported}
            size="sm"
            variant={voice.isListening ? 'destructive' : 'default'}
            className="rounded-full shrink-0 h-9 gap-2"
            title={voice.isSupported ? (voice.isListening ? 'Stop listening' : 'Ask by voice') : 'Mic not supported — type instead'}
          >
            {voice.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {voice.isListening ? 'Stop listening' : 'Ask by voice'}
          </Button>
          <form
            className="order-first flex min-w-0 w-full items-center gap-2"
            onSubmit={(e) => { e.preventDefault(); submitTyped(); }}
          >
            <input
              type="text"
              aria-label={askingBystander ? 'Your question to the bystander' : t('bedside.question')}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder='e.g. "Any allergies?" · "Where is the pain?" · "What happened?"'
              className="glass-control flex-1 min-w-0 rounded-full border border-border/60 px-3.5 py-2 text-sm text-foreground caret-slate-100 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <Button type="submit" size="icon" variant="outline" disabled={!typed.trim()} className="rounded-full shrink-0 h-9 w-9" title="Send question">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {voice.error && (
          <div className="px-4 py-2 text-xs text-rose-600 bg-rose-500/5 border-t border-rose-500/20">
            Voice error: {voice.error}
          </div>
        )}

        {typeof footer === 'function'
          ? footer({
              say: patientVoice.say,
              askQuestion: processQuestion,
              canVocalize: patientVoice.canVocalize,
              isSpeaking: patientVoice.isSpeaking,
              responseContext: { ...responseContext, breathless: Boolean(responseContext.breathless) },
            })
          : footer}
      </CardContent>
    </Card>
  );
  return bedside && target ? createPortal(panel, target) : panel;
}
