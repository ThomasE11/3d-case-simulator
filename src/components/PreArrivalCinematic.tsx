/**
 * Pre-arrival story beat — “this is what you are walking into.”
 *
 * Every case should open the way a real call does: dispatch reads the job,
 * you hear what happened before you got there (lifeguards pulled the child
 * out, a colleague started CPR…), THEN you size up and enter.
 *
 * Media:
 *   1. Authored arrival video when the case has one (mp4 in scene-assets)
 *   2. Scene plate still with a slow Ken Burns drift (game cinematic)
 *   3. Captioned story beats over the still
 * Voice:
 *   Dispatcher reads the call reason; narrator reads the pre-arrival story.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Volume2, VolumeX, Radio, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CaseScenario } from '@/types';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';
import { inferSceneImage, hasSceneVideoAsset, inferSceneVideo } from '@/lib/sceneImageSelection';
import { sceneIntroductionFor } from '@/lib/sceneIntroductions';
import { buildSceneSizeUp } from './SceneSurveyPanel';

export interface PreArrivalBeat {
  /** Short caption over the cinematic. */
  label: string;
  text: string;
}

/** What happened before the crew arrived — dispatch + case story, condensed. */
export function buildPreArrivalBeats(caseData: CaseScenario): PreArrivalBeat[] {
  const intro = sceneIntroductionFor(caseData);
  const events = caseData.history?.eventsLeading?.trim();
  const call = caseData.dispatchInfo?.callReason?.trim();
  const additional = (caseData.dispatchInfo?.additionalInfo ?? []).filter(Boolean).slice(0, 3);
  const beats: PreArrivalBeat[] = [];

  if (call) {
    beats.push({ label: 'Dispatch', text: call.replace(/\.$/, '') + '.' });
  }
  // Prior actions: witnesses / staff already did something. Pull from
  // events + intro bystander line + additionalInfo (e.g. "staff started CPR").
  const prior: string[] = [];
  if (events) prior.push(events.replace(/\.$/, '') + '.');
  if (intro?.bystanderDetail) prior.push(intro.bystanderDetail.replace(/\.$/, '') + '.');
  for (const line of additional) {
    if (/pulled|rescued|started|administered|found|collapsed|called|stopped|attempted/i.test(line)) {
      prior.push(line.replace(/\.$/, '') + '.');
    }
  }
  if (prior.length) {
    beats.push({ label: 'Before you arrive', text: prior.slice(0, 2).join(' ') });
  }

  const size = buildSceneSizeUp(caseData);
  beats.push({ label: 'On scene', text: [size.headline, ...size.bullets].join(' · ') });
  return beats.slice(0, 4);
}

/** Dispatcher voice line — the actual job card, not a story. */
export function buildDispatchCallLine(caseData: CaseScenario): string {
  const call = caseData.dispatchInfo?.callReason?.replace(/\.$/, '') ?? caseData.title;
  const where = caseData.dispatchInfo?.location;
  return where
    ? `Dispatch: ${call}. ${where}.`
    : `Dispatch: ${call}.`;
}

function mediaFor(caseData: CaseScenario): { kind: 'video' | 'image'; src: string } | null {
  const video = inferSceneVideo(caseData);
  if (video && hasSceneVideoAsset(video)) return { kind: 'video', src: video };
  const image = inferSceneImage(caseData);
  if (image) return { kind: 'image', src: image };
  return null;
}

export function PreArrivalCinematic({
  caseData,
  onReady,
}: {
  caseData: CaseScenario;
  onReady?: () => void;
}) {
  const media = useMemo(() => mediaFor(caseData), [caseData]);
  const beats = useMemo(() => buildPreArrivalBeats(caseData), [caseData]);
  const dispatchLine = useMemo(() => buildDispatchCallLine(caseData), [caseData]);
  const { speak, stop, enabled, toggleEnabled, isSpeaking } = useVoiceNarration();
  const [beatIndex, setBeatIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Auto-advance captions ~4.5 s each while playing.
  useEffect(() => {
    if (!playing) return;
    if (beatIndex >= beats.length - 1) return;
    timerRef.current = window.setTimeout(() => setBeatIndex(i => i + 1), 4500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, beatIndex, beats.length]);

  const play = () => {
    setPlaying(true);
    setBeatIndex(0);
    if (enabled) {
      speak(dispatchLine, { role: 'dispatcher' });
      // Story after the call line.
      window.setTimeout(() => {
        speak(beats.map(b => b.text).join(' '), { role: 'narrator' });
      }, 2800);
    }
    onReady?.();
  };

  useEffect(() => () => { stop(); }, [stop]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl">
      {/* Ken Burns plate / video */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
        {media?.kind === 'video' ? (
          <video
            className="h-full w-full object-cover"
            src={media.src}
            autoPlay={playing}
            muted={!enabled}
            loop
            playsInline
          />
        ) : media?.kind === 'image' ? (
          <img
            src={media.src}
            alt=""
            className="h-full w-full object-cover"
            style={{
              transform: playing ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 12s linear',
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
            <Film className="h-10 w-10 text-white/30" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />

        {/* Dispatch chip */}
        <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] backdrop-blur">
          <Radio className="h-3.5 w-3.5 text-amber-300" />
          Pre-arrival
        </div>

        {/* Caption */}
        {playing && beats[beatIndex] && (
          <div className="absolute inset-x-4 bottom-4 z-10 rounded-xl border border-white/15 bg-black/65 px-4 py-3 backdrop-blur-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200/90">
              {beats[beatIndex].label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/95 sm:text-base">
              {beats[beatIndex].text}
            </p>
          </div>
        )}

        {!playing && (
          <button
            type="button"
            onClick={play}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/35 transition hover:bg-black/45"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-xl">
              <Play className="h-7 w-7 translate-x-0.5" />
            </span>
            <span className="text-sm font-medium text-white/90">Play what happened before you arrived</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-slate-950/80 px-3 py-2">
        <p className="truncate text-[12px] text-white/70">{dispatchLine}</p>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-[11px] text-white/80"
            onClick={() => { if (isSpeaking) stop(); toggleEnabled(); }}
            aria-pressed={enabled}
          >
            {enabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            Voice
          </Button>
        </div>
      </div>
    </div>
  );
}
