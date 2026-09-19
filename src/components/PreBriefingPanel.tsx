/**
 * PreBriefingPanel
 *
 * INACSL Standards-aligned pre-briefing screen.
 * Shown before simulation begins to orient students and set expectations.
 *
 * Sections:
 * 1. Learning Objectives
 * 2. Key Concepts Review (matched resources)
 * 3. Orientation (fiction contract, psychological safety)
 * 4. Begin Simulation button
 */

import { useMemo } from 'react';
import type { CaseScenario, SimulationObjective } from '@/types';
import { getResourcesForPreBriefing } from '@/data/diversifiedResources';
import { buildSceneDispatchPreview } from '@/lib/sceneDispatchPreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen, Target, Shield, ExternalLink, Play,
  Lightbulb, AlertTriangle, CheckCircle, GraduationCap, Eye,
  Ear, Thermometer, SunMedium, Wind, Users,
} from 'lucide-react';

interface PreBriefingPanelProps {
  caseData: CaseScenario;
  objective?: SimulationObjective;
  onStartSimulation: () => void;
  onSkip: () => void;
}

const SOURCE_COLORS: Record<string, string> = {
  'NICE': 'bg-blue-100 text-blue-700',
  'Resuscitation Council UK': 'bg-red-100 text-red-700',
  'EMDocs': 'bg-green-100 text-green-700',
  'REBEL EM': 'bg-purple-100 text-purple-700',
  'EMCrit': 'bg-orange-100 text-orange-700',
  'Radiopaedia': 'bg-cyan-100 text-cyan-700',
  'LITFL': 'bg-yellow-100 text-yellow-700',
  'ALiEM': 'bg-pink-100 text-pink-700',
  'EM Cases': 'bg-indigo-100 text-indigo-700',
};

export function PreBriefingPanel({
  caseData,
  objective,
  onStartSimulation,
  onSkip,
}: PreBriefingPanelProps) {
  // Generate pre-briefing content
  const preBriefingResources = useMemo(() =>
    getResourcesForPreBriefing(caseData, objective || undefined),
    [caseData, objective]
  );

  const preview = useMemo(() => buildSceneDispatchPreview(caseData), [caseData]);

  const learningObjectives = useMemo(() => {
    if (objective) {
      return [
        objective.primaryObjective,
        ...objective.skillsFocus.map(s => `Demonstrate: ${s}`),
      ];
    }
    // Auto-derive from case
    return [
      `Assess and manage: ${caseData.expectedFindings?.mostLikelyDiagnosis || caseData.title}`,
      ...caseData.teachingPoints.slice(0, 3),
    ];
  }, [objective, caseData]);

  const keySkills = useMemo(() => {
    if (objective) return objective.skillsFocus;
    return caseData.criticalActions?.map(a => a.description) || [];
  }, [objective, caseData]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Card */}
      <Card className="border-primary/20 bg-blue-50 dark:bg-blue-950/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-primary/20">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Pre-Briefing</h2>
              <p className="text-sm text-muted-foreground">
                Review objectives and key concepts before beginning the simulation
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            INACSL Standards of Best Practice
          </Badge>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-blue-500" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{obj}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Key Skills to Practise */}
      {keySkills.length > 0 && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Key Skills Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keySkills.map((skill, i) => (
                <Badge key={i} variant="outline" className="bg-green-50 dark:bg-green-900/20 border-green-200 text-green-700 dark:text-green-300">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pre-Briefing Resources */}
      {preBriefingResources.length > 0 && (
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-amber-500" />
              Key Concepts & Reference Material
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">
              Review these resources to prepare for the simulation scenario:
            </p>
            {preBriefingResources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-start gap-3 flex-1">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {resource.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${SOURCE_COLORS[resource.source] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {resource.source}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {resource.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Orientation & Fiction Contract */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-purple-500" />
            Simulation Orientation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
              Fiction Contract
            </p>
            <p className="text-sm text-muted-foreground">
              This is a simulated clinical scenario. Please treat it as you would a real patient encounter.
              The scenario is designed for learning — mistakes are expected and valuable.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
              Psychological Safety
            </p>
            <p className="text-sm text-muted-foreground">
              This is a safe learning environment. There are no &quot;wrong&quot; answers —
              the goal is to think through the clinical situation systematically.
              All observations stay within the simulation.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> What to Expect
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• You will receive a dispatch call and scene description</li>
              <li>• Perform a systematic assessment (ABCDE approach)</li>
              <li>• Manage the patient based on your findings</li>
              <li>• The scenario will be followed by a structured debriefing</li>
              {caseData.estimatedDuration && (
                <li>• Estimated duration: {caseData.estimatedDuration} minutes</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Scene preview — what the student will walk into.
          Renders the same first-person arrival layer the On Arrival panel
          shows, but here BEFORE the student presses Enter Scene, so they
          form a scene expectation from the briefing rather than discovering
          it on approach. Cases with no generated introduction keep the
          existing minimal scene-description line. */}
      {preview && (
        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5 text-cyan-500" />
              Scene Preview
              {!preview.hasEnrichment && (
                <Badge variant="secondary" className="text-[10px] font-normal">
                  basic
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed text-foreground">
              {preview.sceneDescription}
            </p>
            {preview.arrivalNarrative && (
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                {preview.arrivalNarrative}
              </p>
            )}
            {(preview.sensory.sounds.length > 0 ||
              preview.sensory.smells.length > 0 ||
              preview.sensory.temperature ||
              preview.sensory.light ||
              preview.sensory.air) && (
              <div className="flex flex-wrap gap-1.5">
                {preview.sensory.sounds.map((s, i) => (
                  <span key={`s${i}`} className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-700 dark:text-cyan-300">
                    <Ear className="h-3 w-3" />{s}
                  </span>
                ))}
                {preview.sensory.smells.map((s, i) => (
                  <span key={`m${i}`} className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-700 dark:text-cyan-300">
                    <Wind className="h-3 w-3" />{s}
                  </span>
                ))}
                {preview.sensory.temperature && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-700 dark:text-cyan-300">
                    <Thermometer className="h-3 w-3" />{preview.sensory.temperature}
                  </span>
                )}
                {preview.sensory.light && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-700 dark:text-cyan-300">
                    <SunMedium className="h-3 w-3" />{preview.sensory.light}
                  </span>
                )}
                {preview.sensory.air && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-700 dark:text-cyan-300">
                    <Wind className="h-3 w-3" />{preview.sensory.air}
                  </span>
                )}
              </div>
            )}
            {preview.bystanderDetail && (
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <Users className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{preview.bystanderDetail}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onSkip}
          className="flex-1"
        >
          Skip Pre-Briefing
        </Button>
        <Button
          onClick={onStartSimulation}
          className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white"
        >
          <Play className="w-5 h-5 mr-2" />
          Begin Simulation
        </Button>
      </div>
    </div>
  );
}

export default PreBriefingPanel;
