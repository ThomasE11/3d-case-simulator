/**
 * SceneSensoryStrip — one quiet line of who is already on scene.
 * The dispatcher voiceover carries the full sensory story; this chip is only
 * for operational presence (police, lifeguard, crew) so the student is not
 * forced to read a wall of text before entering.
 */
import type { CaseScenario } from '@/types';
import { sceneIntroductionFor } from '@/lib/sceneIntroductions';
import { Users, Shield } from 'lucide-react';

interface SceneSensoryStripProps {
  caseData: CaseScenario;
}

function whoIsOnScene(caseData: CaseScenario): string | null {
  const intro = sceneIntroductionFor(caseData);
  const raw = intro?.bystanderDetail || caseData.sceneInfo?.bystanders || '';
  if (!raw) return null;
  const text = raw.toLowerCase();
  if (/police|officer/.test(text)) return 'Police on scene';
  if (/lifeguard/.test(text)) return 'Lifeguard on scene';
  if (/security/.test(text)) return 'Security on scene';
  if (/staff|nurse|doctor|colleague|crew/.test(text)) {
    const m = raw.match(/(?:staff|nurse|doctor|colleague|crew)/i);
    return m ? `${m[0]} present` : 'Staff present';
  }
  if (/none|nobody|alone|unattended/.test(text)) return 'No bystanders';
  return 'Bystanders present';
}

export function SceneSensoryStrip({ caseData }: SceneSensoryStripProps) {
  const line = whoIsOnScene(caseData);
  if (!line) return null;
  const isPolice = /police|officer/i.test(line);
  return (
    <div className="mb-2">
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/8 px-2.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
        {isPolice ? (
          <Shield className="h-3.5 w-3.5 shrink-0 text-sky-300" />
        ) : (
          <Users className="h-3.5 w-3.5 shrink-0 text-white/60" />
        )}
        {line}
      </span>
    </div>
  );
}
