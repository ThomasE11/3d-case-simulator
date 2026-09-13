/**
 * SceneSensoryStrip.tsx
 *
 * Additive "you are standing in it" readout for the On Arrival panel.
 * Renders the enriched first-person arrival layer (sensory cues, access /
 * extrication, bystander detail) when a case has a generated scene
 * introduction — and renders nothing when it doesn't, so every existing case
 * keeps its current minimal arrival view untouched.
 */

import type { CaseScenario } from '@/types';
import { sceneIntroductionFor } from '@/lib/sceneIntroductions';
import { Ear, Thermometer, SunMedium, Wind, AlertTriangle, Hand } from 'lucide-react';

interface SceneSensoryStripProps {
  caseData: CaseScenario;
}

export function SceneSensoryStrip({ caseData }: SceneSensoryStripProps) {
  const intro = sceneIntroductionFor(caseData);
  if (!intro) return null;

  const cues = intro.sensoryCues;
  const access = intro.accessExtrication;
  const hasAccess = Boolean(access?.accessIssues?.length || access?.note);
  const hasCues = Boolean(
    cues?.sounds?.length || cues?.smells?.length || cues?.temperature || cues?.light || cues?.air,
  );

  if (!hasCues && !hasAccess && !intro.bystanderDetail) return null;

  const chip = 'flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/8 px-2.5 py-1.5 text-[10px] leading-tight text-white/85 backdrop-blur-sm';

  return (
    <div className="space-y-2">
      {cues?.sounds && cues.sounds.length > 0 && (
        <div className={chip}>
          <Ear className="h-3 w-3 shrink-0 text-white/55" />
          <span>{cues.sounds.join(' · ')}</span>
        </div>
      )}
      {cues?.smells && cues.smells.length > 0 && (
        <div className={chip}>
          <Wind className="h-3 w-3 shrink-0 text-white/55" />
          <span>{cues.smells.join(' · ')}</span>
        </div>
      )}
      {cues?.temperature && (
        <div className={chip}>
          <Thermometer className="h-3 w-3 shrink-0 text-white/55" />
          <span>{cues.temperature}</span>
        </div>
      )}
      {cues?.light && (
        <div className={chip}>
          <SunMedium className="h-3 w-3 shrink-0 text-white/55" />
          <span>{cues.light}</span>
        </div>
      )}
      {cues?.air && (
        <div className={chip}>
          <Wind className="h-3 w-3 shrink-0 text-white/55" />
          <span>{cues.air}</span>
        </div>
      )}
      {hasAccess && (
        <div className={chip}>
          <AlertTriangle className="h-3 w-3 shrink-0 text-amber-300/80" />
          <span>
            {access?.accessIssues?.join(' · ') || ''}
            {access?.accessIssues?.length && access?.note ? ' — ' : ''}
            {access?.note || ''}
          </span>
        </div>
      )}
      {intro.bystanderDetail && (
        <div className={chip}>
          <Hand className="h-3 w-3 shrink-0 text-white/55" />
          <span>{intro.bystanderDetail}</span>
        </div>
      )}
    </div>
  );
}
