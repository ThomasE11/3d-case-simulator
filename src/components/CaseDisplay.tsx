import { useMemo, useState, Component, type ErrorInfo, type ReactNode } from 'react';
import type { CaseScenario, StudentYear, ComplexityLevel } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Phone, MapPin, Clock, User, Users, AlertTriangle,
  Activity, Eye, Stethoscope,
  Pill, History, Utensils, FileText, Thermometer,
  Droplets, Wind, Heart, Brain, Zap,
} from 'lucide-react';
import { getECGForCase } from '@/data/litflECGs';
import { ECGDisplayComponent, EmergencyECGQuickRef } from './ECGDisplay';
import { ClinicalResources } from './ClinicalResources';
import { getScenePresentationDescription } from '@/lib/sceneNarrative';

// Error boundary to prevent ClinicalResources crashes from taking down the whole app
class ResourcesErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  state = { hasError: false, error: undefined as Error | undefined };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('ClinicalResources error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-yellow-500/30 bg-yellow-950/10">
          <CardContent className="p-4 text-center text-sm text-yellow-600">
            Clinical resources temporarily unavailable.
            <button onClick={() => this.setState({ hasError: false })} className="ml-2 underline">Retry</button>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}

interface CaseDisplayProps {
  caseData: CaseScenario;
  studentYear?: StudentYear;
  isStudentView?: boolean;
  showAllContent?: boolean;
}

/**
 * Click-to-reveal field for student view.
 * Shows a clickable label that expands to reveal content underneath.
 */
function RevealableField({
  label,
  icon,
  children,
  isStudentView = false,
  className = '',
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  isStudentView?: boolean;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(!isStudentView);

  if (!isStudentView) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      <button
        onClick={() => setRevealed(!revealed)}
        className="flex items-center gap-2 w-full text-left group py-1 px-1 -ml-1 rounded-md hover:bg-muted/60 transition-colors"
      >
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-sm font-medium flex-1">{label}</span>
        <span className={`text-xs text-muted-foreground transition-transform duration-200 ${revealed ? 'rotate-90' : ''}`}>
          &#9654;
        </span>
      </button>
      {revealed && (
        <div className="pl-6 pt-1 pb-1 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

// Detail visibility levels mapping - avoid recreating on every render
const YEAR_LEVEL_MAP: Record<StudentYear, number> = {
  '1st-year': 0,
  '2nd-year': 1,
  '3rd-year': 2,
  '4th-year': 3,
  'diploma': 2
} as const;

const COMPLEXITY_MAP: Record<ComplexityLevel, number> = {
  'basic': 1,
  'intermediate': 2,
  'advanced': 3,
  'expert': 4
} as const;

// Helper function to determine if specific detail should be shown
function shouldShowDetail(
  complexity: ComplexityLevel,
  year: StudentYear,
  type: 'findings' | 'interventions' | 'rationale',
  showAllContent = false
): boolean {
  if (showAllContent) return true; // Instructor override — show everything

  const yearLevel = YEAR_LEVEL_MAP[year];
  const complexityLevel = COMPLEXITY_MAP[complexity];

  switch (type) {
    case 'findings':
      return yearLevel >= 2 || yearLevel >= complexityLevel - 1;
    case 'interventions':
      return yearLevel >= 2 && complexityLevel >= 2;
    case 'rationale':
      return yearLevel >= 3 || complexityLevel >= 4;
    default:
      return false;
  }
}

export function CaseDisplay({ caseData, studentYear = '3rd-year', isStudentView: isStudentViewProp = false, showAllContent = false }: CaseDisplayProps) {
  // When showAllContent is true (instructor override), force all content visible
  const isStudentView = showAllContent ? false : isStudentViewProp;

  // ECG Display state
  const [showECGModal, setShowECGModal] = useState(false);

  // Collapsible sections state — collapsed by default in student view, expanded for instructor override
  const [showABCDE, setShowABCDE] = useState(!isStudentView || showAllContent);
  const [showSecondarySurvey, setShowSecondarySurvey] = useState(!isStudentView || showAllContent);
  const [showPatientHistory, setShowPatientHistory] = useState(!isStudentView || showAllContent);

  // Memoize detail visibility checks
  const showDetailedFindings = useMemo(() =>
    shouldShowDetail(caseData.complexity, studentYear, 'findings', showAllContent),
    [caseData.complexity, studentYear, showAllContent]
  );

  const showInterventions = useMemo(() =>
    shouldShowDetail(caseData.complexity, studentYear, 'interventions', showAllContent),
    [caseData.complexity, studentYear, showAllContent]
  );

  // Check if this case has an associated ECG
  const associatedECG = useMemo(() => {
    const cardiacCategories = ['cardiac', 'cardiac-ecg', 'thoracic', 'respiratory'];
    const isCardiacCase = cardiacCategories.includes(caseData.category.toLowerCase());
    if (isCardiacCase) {
      return getECGForCase(caseData.category, caseData.title);
    }
    return undefined;
  }, [caseData.category, caseData.title]);

  // Memoize timeOfDay replacement to avoid creating new strings
  const formattedTimeOfDay = useMemo(() =>
    caseData.dispatchInfo.timeOfDay.replace('-', ' '),
    [caseData.dispatchInfo.timeOfDay]
  );

  // Memoize access issues join
  const accessIssues = useMemo(() =>
    caseData.sceneInfo.accessIssues?.join(', ') ?? null,
    [caseData.sceneInfo.accessIssues]
  );

  // Memoize odor join
  const odors = useMemo(() =>
    caseData.initialPresentation.odor?.join(', ') ?? null,
    [caseData.initialPresentation.odor]
  );

  // Memoize sounds join
  const sounds = useMemo(() =>
    caseData.initialPresentation.sounds?.join(', ') ?? null,
    [caseData.initialPresentation.sounds]
  );

  // Memoize case findings for ClinicalResources to prevent unnecessary re-renders
  // In student view, exclude diagnosis-revealing data (title, diagnosis, differentials)
  const caseFindings = useMemo(() => {
    if (isStudentView) {
      return [
        caseData.category,
        caseData.dispatchInfo?.callReason,
        caseData.initialPresentation?.generalImpression,
        ...(caseData.abcde?.exposure?.findings || []),
        ...(caseData.abcde?.airway?.findings || []),
      ].filter(Boolean) as string[];
    }
    return [
      caseData.title,
      caseData.category,
      caseData.expectedFindings?.mostLikelyDiagnosis,
      caseData.dispatchInfo?.callReason,
      caseData.initialPresentation?.generalImpression,
      ...(caseData.initialPresentation?.sounds || []),
      ...(caseData.expectedFindings?.keyObservations || []),
      ...(caseData.expectedFindings?.differentialDiagnoses || []),
      ...(caseData.abcde?.exposure?.findings || []),
      ...(caseData.secondarySurvey?.head || []),
      ...(caseData.secondarySurvey?.neck || []),
      ...(caseData.secondarySurvey?.chest || []),
      ...(caseData.abcde?.airway?.findings || []),
      ...(caseData.abcde?.breathing?.findings || []),
      ...(caseData.abcde?.circulation?.findings || []),
    ].filter(Boolean) as string[];
  }, [
    isStudentView,
    caseData.title,
    caseData.category,
    caseData.expectedFindings?.mostLikelyDiagnosis,
    caseData.dispatchInfo?.callReason,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.sounds,
    caseData.expectedFindings?.keyObservations,
    caseData.expectedFindings?.differentialDiagnoses,
    caseData.abcde?.exposure?.findings,
    caseData.secondarySurvey?.head,
    caseData.secondarySurvey?.neck,
    caseData.secondarySurvey?.chest,
    caseData.abcde?.airway?.findings,
    caseData.abcde?.breathing?.findings,
    caseData.abcde?.circulation?.findings,
  ]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Dispatch Information */}
      <Card className="border-l-4 border-l-blue-500 abcde-airway-bg animate-fade-in-up stagger-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Dispatch Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Call Reason</p>
                <p className="text-sm text-muted-foreground">{caseData.dispatchInfo.callReason}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Time of Day</p>
                <p className="text-sm text-muted-foreground capitalize">{formattedTimeOfDay}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{caseData.dispatchInfo.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Caller</p>
                <p className="text-sm text-muted-foreground">{caseData.dispatchInfo.callerInfo}</p>
              </div>
            </div>
          </div>
          {caseData.dispatchInfo.dispatchCode && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                Code: {caseData.dispatchInfo.dispatchCode}
              </Badge>
            </div>
          )}
          {showDetailedFindings && caseData.dispatchInfo.additionalInfo && (
            <div className="mt-2 p-2 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-1">Additional Information</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {caseData.dispatchInfo.additionalInfo.map((info, i) => (
                  <li key={i}>• {info}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scene Information */}
      <Card className="border-l-4 border-l-cyan-500 abcde-breathing-bg animate-fade-in-up stagger-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
              <MapPin className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            Scene Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <RevealableField label="Scene Description" icon={<FileText className="h-4 w-4" />} isStudentView={isStudentView}>
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Scene Description</p>
                <p className="text-sm text-muted-foreground">{getScenePresentationDescription(caseData)}</p>
              </div>
            </div>
          </RevealableField>
          <RevealableField label="Bystanders" icon={<Users className="h-4 w-4" />} isStudentView={isStudentView}>
            <div className="flex items-start gap-2">
              <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Bystanders</p>
                <p className="text-sm text-muted-foreground">{caseData.sceneInfo.bystanders}</p>
              </div>
            </div>
          </RevealableField>
          <RevealableField label="Environment" icon={<AlertTriangle className="h-4 w-4" />} isStudentView={isStudentView}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Environment</p>
                <p className="text-sm text-muted-foreground">{caseData.sceneInfo.environment}</p>
              </div>
            </div>
          </RevealableField>
          {showDetailedFindings && accessIssues && (
            <RevealableField label="Access Issues" icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} isStudentView={isStudentView}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-amber-600">Access Issues</p>
                  <p className="text-sm text-muted-foreground">{accessIssues}</p>
                </div>
              </div>
            </RevealableField>
          )}
          {caseData.sceneInfo.hazards.length > 0 && (
            <RevealableField label="Hazards" icon={<AlertTriangle className="h-4 w-4 text-red-500" />} isStudentView={isStudentView}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-600">Hazards</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {caseData.sceneInfo.hazards.map((hazard, i) => (
                      <Badge key={i} variant="destructive" className="text-xs">
                        {hazard}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </RevealableField>
          )}
        </CardContent>
      </Card>

      {/* Initial Presentation */}
      <Card className="border-l-4 border-l-red-500 abcde-circulation-bg animate-fade-in-up stagger-3">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
              <Eye className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            Initial Presentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <RevealableField label="General Impression" isStudentView={isStudentView}>
              <div>
                <p className="text-sm font-medium">General Impression</p>
                <p className="text-sm text-muted-foreground">{caseData.initialPresentation.generalImpression}</p>
              </div>
            </RevealableField>
            <RevealableField label="Position" isStudentView={isStudentView}>
              <div>
                <p className="text-sm font-medium">Position</p>
                <p className="text-sm text-muted-foreground">{caseData.initialPresentation.position}</p>
              </div>
            </RevealableField>
            <RevealableField label="Appearance" isStudentView={isStudentView}>
              <div>
                <p className="text-sm font-medium">Appearance</p>
                <p className="text-sm text-muted-foreground">{caseData.initialPresentation.appearance}</p>
              </div>
            </RevealableField>
            <RevealableField label="Consciousness" isStudentView={isStudentView}>
              <div>
                <p className="text-sm font-medium">Consciousness</p>
                <p className="text-sm text-muted-foreground">{caseData.initialPresentation.consciousness}</p>
              </div>
            </RevealableField>
          </div>
          {showDetailedFindings && odors && (
            <RevealableField label="Odor" isStudentView={isStudentView} className="mt-3">
              <div className="p-2 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground">Odor</p>
                <p className="text-sm text-muted-foreground">{odors}</p>
              </div>
            </RevealableField>
          )}
          {showDetailedFindings && sounds && (
            <RevealableField label="Sounds" isStudentView={isStudentView} className="mt-3">
              <div className="p-2 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground">Sounds</p>
                <p className="text-sm text-muted-foreground">{sounds}</p>
              </div>
            </RevealableField>
          )}
        </CardContent>
      </Card>

      {/* ABCDE Assessment */}
      <Card className="border-l-4 border-l-purple-500 abcde-disability-bg animate-fade-in-up stagger-4">
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowABCDE(!showABCDE)}>
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              ABCDE Assessment Findings
            </div>
            <Button variant="ghost" size="sm">
              {showABCDE ? '−' : '+'}
            </Button>
          </CardTitle>
        </CardHeader>
        {showABCDE && (
          <CardContent className="space-y-4">
          {/* Airway */}
          <div className="rounded-lg border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20 p-3">
            <h4 className="mb-2 font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30">
                <Wind className="h-4 w-4" />
              </div>
              A - Airway
            </h4>
            <div className="space-y-1 text-sm">
              <RevealableField label="Airway Status" isStudentView={isStudentView}>
                <p><span className="text-muted-foreground">Patent:</span> {caseData.abcde.airway.patent ? 'Yes' : 'No'}</p>
              </RevealableField>
              <RevealableField label="Findings" isStudentView={isStudentView}>
                <div>
                  <span className="text-muted-foreground">Findings:</span>
                  <ul className="ml-4 mt-1 list-disc text-muted-foreground">
                    {caseData.abcde.airway.findings.map((finding: string, idx: number) => <li key={idx}>{finding}</li>)}
                  </ul>
                </div>
              </RevealableField>
              {showInterventions && caseData.abcde.airway.interventions.length > 0 && !isStudentView && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Interventions:</span>
                  <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                    {caseData.abcde.airway.interventions.map((intervention: string, idx: number) => <li key={idx}>{intervention}</li>)}
                  </ul>
                </div>
              )}
              {showDetailedFindings && caseData.abcde.airway.adjunctsNeeded && !isStudentView && (
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Adjuncts:</span> {caseData.abcde.airway.adjunctsNeeded.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Breathing */}
          <div className="rounded-lg border-l-4 border-l-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 p-3">
            <h4 className="mb-2 font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
              <div className="p-1 rounded bg-cyan-100 dark:bg-cyan-900/30">
                <Droplets className="h-4 w-4" />
              </div>
              B - Breathing
            </h4>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              {/* RR and SpO2: on the monitor in student view, shown here in instructor view */}
              {isStudentView ? (
                <div className="col-span-2 p-2 rounded-lg bg-cyan-50/50 dark:bg-cyan-900/10 border border-cyan-200/30">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-cyan-500" />
                    Assess respiratory rate and SpO2 using the patient monitor
                  </p>
                </div>
              ) : (
                <>
                  <p><span className="text-muted-foreground">Rate:</span> {caseData.abcde.breathing.rate} /min</p>
                  <p><span className="text-muted-foreground">SpO2:</span> {caseData.abcde.breathing.spo2}%</p>
                </>
              )}
              <RevealableField label="Rhythm" isStudentView={isStudentView}>
                <p><span className="text-muted-foreground">Rhythm:</span> {caseData.abcde.breathing.rhythm}</p>
              </RevealableField>
              <RevealableField label="Depth" isStudentView={isStudentView}>
                <p><span className="text-muted-foreground">Depth:</span> {caseData.abcde.breathing.depth}</p>
              </RevealableField>
              {/* Breathing findings & auscultation: hidden in student view — student discovers these by listening */}
              {!isStudentView && (
                <>
                  {caseData.abcde.breathing.findings.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground text-xs">Findings:</span>
                      <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                        {caseData.abcde.breathing.findings.map((f: string, i: number) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                  {showDetailedFindings && caseData.abcde.breathing.auscultation && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground text-xs">Auscultation:</span>
                      <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                        {caseData.abcde.breathing.auscultation.map((f: string, i: number) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              )}
              {isStudentView && (
                <div className="col-span-2 p-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/30">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5 text-blue-500" />
                    Auscultate the patient using the Chest Auscultation panel to assess lung sounds
                  </p>
                </div>
              )}
              {showInterventions && caseData.abcde.breathing.interventions.length > 0 && !isStudentView && (
                <div className="col-span-2 mt-2 p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded">
                  <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">Interventions:</span>
                  <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                    {caseData.abcde.breathing.interventions.map((intervention: string, idx: number) => <li key={idx}>{intervention}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Circulation */}
          <div className="rounded-lg border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20 p-3">
            <h4 className="mb-2 font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
              <div className="p-1 rounded bg-red-100 dark:bg-red-900/30">
                <Heart className="h-4 w-4" />
              </div>
              C - Circulation
            </h4>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              {isStudentView ? (
                <div className="col-span-2 p-2 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-200/30">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-red-500" />
                    Pulse and blood pressure are displayed on the patient monitor
                  </p>
                </div>
              ) : (
                <>
                  <p><span className="text-muted-foreground">Pulse:</span> {caseData.abcde.circulation.pulseRate} bpm ({caseData.abcde.circulation.pulseQuality})</p>
                  <p><span className="text-muted-foreground">BP:</span> {caseData.abcde.circulation.bp.systolic}/{caseData.abcde.circulation.bp.diastolic} mmHg</p>
                </>
              )}
              <RevealableField label="Capillary Refill" isStudentView={isStudentView}>
                <p><span className="text-muted-foreground">Cap Refill:</span> {caseData.abcde.circulation.capillaryRefill} sec</p>
              </RevealableField>
              <RevealableField label="Skin" isStudentView={isStudentView}>
                <p><span className="text-muted-foreground">Skin:</span> {caseData.abcde.circulation.skin}</p>
              </RevealableField>
              {showDetailedFindings && caseData.abcde.circulation.ecgFindings && !isStudentView && (
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs">ECG Findings:</span>
                  <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                    {caseData.abcde.circulation.ecgFindings.map((f: string, i: number) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
              {isStudentView && caseData.abcde.circulation.ecgFindings && (
                <div className="col-span-2 p-2 rounded-lg bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200/30">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-rose-500" />
                    Obtain and interpret the ECG from the patient monitor
                  </p>
                </div>
              )}
              {showInterventions && caseData.abcde.circulation.interventions.length > 0 && !isStudentView && (
                <div className="col-span-2 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">Interventions:</span>
                  <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                    {caseData.abcde.circulation.interventions.map((intervention: string, idx: number) => <li key={idx}>{intervention}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Disability */}
          <div className="rounded-lg border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20 p-3">
            <h4 className="mb-2 font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
              <div className="p-1 rounded bg-purple-100 dark:bg-purple-900/30">
                <Brain className="h-4 w-4" />
              </div>
              D - Disability
            </h4>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <RevealableField label="AVPU" isStudentView={isStudentView}>
                <p><span className="text-muted-foreground">AVPU:</span> <Badge variant="outline">{caseData.abcde.disability.avpu}</Badge></p>
              </RevealableField>
              <RevealableField label="GCS" isStudentView={isStudentView}>
                <p><span className="text-muted-foreground">GCS:</span> {caseData.abcde.disability.gcs.total}/15 (E{caseData.abcde.disability.gcs.eye}V{caseData.abcde.disability.gcs.verbal}M{caseData.abcde.disability.gcs.motor})</p>
              </RevealableField>
              <RevealableField label="Pupils" isStudentView={isStudentView}>
                <p><span className="text-muted-foreground">Pupils:</span> {caseData.abcde.disability.pupils}</p>
              </RevealableField>
              {caseData.abcde.disability.bloodGlucose && (
                <RevealableField label="Blood Glucose" isStudentView={isStudentView}>
                  <p><span className="text-muted-foreground">Glucose:</span> {caseData.abcde.disability.bloodGlucose} mmol/L</p>
                </RevealableField>
              )}
              {showDetailedFindings && caseData.abcde.disability.focalDeficits && (
                <RevealableField label="Focal Deficits" isStudentView={isStudentView} className="col-span-2">
                  <div>
                    <span className="text-muted-foreground text-xs">Focal Deficits:</span>
                    <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                      {caseData.abcde.disability.focalDeficits.map((f: string, i: number) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                </RevealableField>
              )}
              {showInterventions && caseData.abcde.disability.interventions.length > 0 && !isStudentView && (
                <div className="col-span-2 mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Interventions:</span>
                  <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                    {caseData.abcde.disability.interventions.map((intervention: string, idx: number) => <li key={idx}>{intervention}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Exposure */}
          <div className="rounded-lg border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20 p-3">
            <h4 className="mb-2 font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <div className="p-1 rounded bg-amber-100 dark:bg-amber-900/30">
                <Thermometer className="h-4 w-4" />
              </div>
              E - Exposure
            </h4>
            {caseData.abcde.exposure.temperature && (
              <RevealableField label="Temperature" isStudentView={isStudentView}>
                <p className="text-sm"><span className="text-muted-foreground">Temperature:</span> {caseData.abcde.exposure.temperature}°C</p>
              </RevealableField>
            )}
            <RevealableField label="Findings" isStudentView={isStudentView}>
              <div className="text-sm">
                <span className="text-muted-foreground">Findings:</span>
                <ul className="ml-4 mt-1 list-disc text-muted-foreground">
                  {caseData.abcde.exposure.findings.map((f: string, i: number) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            </RevealableField>
            {showDetailedFindings && caseData.abcde.exposure.wounds && (
              <RevealableField label="Wounds" isStudentView={isStudentView} className="mt-2">
                <div>
                  <span className="text-muted-foreground text-xs">Wounds:</span>
                  <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                    {caseData.abcde.exposure.wounds.map((f: string, i: number) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              </RevealableField>
            )}
            {showInterventions && caseData.abcde.exposure.interventions.length > 0 && !isStudentView && (
              <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Interventions:</span>
                <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                  {caseData.abcde.exposure.interventions.map((intervention: string, idx: number) => <li key={idx}>{intervention}</li>)}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
        )}
      </Card>

      {/* Secondary Survey */}
      <Card className="border-l-4 border-l-amber-500 abcde-exposure-bg animate-fade-in-up stagger-5">
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowSecondarySurvey(!showSecondarySurvey)}>
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-amber-500" />
              Secondary Survey
            </div>
            <Button variant="ghost" size="sm">
              {showSecondarySurvey ? '−' : '+'}
            </Button>
          </CardTitle>
        </CardHeader>
        {showSecondarySurvey && (
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(caseData.secondarySurvey)
                .filter((entry): entry is [string, string[]] => Array.isArray(entry[1]) && entry[1].length > 0)
                .map(([region, findings]) => (
                <RevealableField key={region} label={region.charAt(0).toUpperCase() + region.slice(1)} isStudentView={isStudentView}>
                  <div className="rounded-lg border p-3">
                    <p className="mb-1 text-sm font-medium capitalize">{region}</p>
                    <ul className="ml-3 list-disc text-sm text-muted-foreground">
                      {findings.map((finding, idx) => <li key={idx}>{finding}</li>)}
                    </ul>
                  </div>
                </RevealableField>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* History */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowPatientHistory(!showPatientHistory)}>
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-green-500" />
              Patient History
            </div>
            <Button variant="ghost" size="sm">
              {showPatientHistory ? '−' : '+'}
            </Button>
          </CardTitle>
        </CardHeader>
        {showPatientHistory && (
          <CardContent className="space-y-4">
          {/* Medications */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Pill className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Medications</p>
            </div>
            <div className="space-y-2">
              {caseData.history.medications.map((med, i) => (
                <div key={i} className="rounded-lg border p-2 text-sm">
                  <p className="font-medium">{med.name} {med.dose}</p>
                  <p className="text-xs text-muted-foreground">{med.frequency} - {med.indication}</p>
                  {showDetailedFindings && med.route && (
                    <p className="text-xs text-muted-foreground">Route: {med.route}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Allergies & Conditions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium">Allergies</p>
              <div className="flex flex-wrap gap-1">
                {caseData.history.allergies.map((allergy, i) => (
                  <Badge key={i} variant="destructive" className="text-xs">{allergy}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium">Medical Conditions</p>
              <ul className="ml-3 list-disc text-sm text-muted-foreground">
                {caseData.history.medicalConditions.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>

          <Separator />

          {/* Events & Last Meal */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <Utensils className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last Meal</p>
                <p className="text-sm text-muted-foreground">{caseData.history.lastMeal}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Events Leading</p>
                <p className="text-sm text-muted-foreground">{caseData.history.eventsLeading}</p>
              </div>
            </div>
          </div>

          {showDetailedFindings && caseData.history.socialHistory && (
            <>
              <Separator />
              <div>
                <p className="mb-1 text-sm font-medium">Social History</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  {caseData.history.socialHistory.smoking && <p>Smoking: {caseData.history.socialHistory.smoking}</p>}
                  {caseData.history.socialHistory.alcohol && <p>Alcohol: {caseData.history.socialHistory.alcohol}</p>}
                  {caseData.history.socialHistory.occupation && <p>Occupation: {caseData.history.socialHistory.occupation}</p>}
                </div>
              </div>
            </>
          )}
        </CardContent>
        )}
      </Card>

      {/* Management Pathway - Only for advanced/expert cases or higher year levels, instructor only */}
      {showInterventions && caseData.managementPathway && !isStudentView && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-green-500" />
              Management Pathway
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {caseData.managementPathway.immediate && (
              <div>
                <p className="text-sm font-medium text-green-600">Immediate Actions</p>
                <ul className="ml-4 mt-1 list-disc text-sm text-muted-foreground">
                  {caseData.managementPathway.immediate.map((action, i) => <li key={i}>{action}</li>)}
                </ul>
              </div>
            )}
            {caseData.managementPathway.definitive && (
              <div>
                <p className="text-sm font-medium text-blue-600">Definitive Treatment</p>
                <ul className="ml-4 mt-1 list-disc text-sm text-muted-foreground">
                  {caseData.managementPathway.definitive.map((action, i) => <li key={i}>{action}</li>)}
                </ul>
              </div>
            )}
            {caseData.managementPathway.monitoring && (
              <div>
                <p className="text-sm font-medium text-purple-600">Monitoring</p>
                <ul className="ml-4 mt-1 list-disc text-sm text-muted-foreground">
                  {caseData.managementPathway.monitoring.map((action, i) => <li key={i}>{action}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ECG Display - For cardiac emergencies */}
      {associatedECG && (
        <Card className="border-l-4 border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg text-rose-600 dark:text-rose-400">
                <Activity className="h-5 w-5" />
                {isStudentView ? '12-Lead ECG Available' : `Associated ECG - ${associatedECG.title}`}
              </CardTitle>
              {!isStudentView && (
                <Badge className={associatedECG.urgency === 'critical' ? 'bg-red-600' : 'bg-orange-500'}>
                  {associatedECG.urgency.toUpperCase()}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!isStudentView && <EmergencyECGQuickRef ecg={associatedECG} />}
            <Button
              onClick={() => setShowECGModal(true)}
              className="mt-3 w-full sm:w-auto bg-rose-600 hover:bg-rose-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              {isStudentView ? 'View ECG' : 'View Full ECG Details'}
            </Button>
            {isStudentView && (
              <p className="text-xs text-muted-foreground mt-2">
                Interpret the ECG rhythm, rate, and morphology to support your clinical assessment.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ECG Modal */}
      {showECGModal && associatedECG && (
        <ECGDisplayComponent
          ecg={associatedECG}
          show={showECGModal}
          onClose={() => setShowECGModal(false)}
        />
      )}

      {/* Clinical Resources - Images, Videos, Sounds for Clinical Findings */}
      <ResourcesErrorBoundary>
        <ClinicalResources caseCategory={caseData.category} caseFindings={caseFindings} />
      </ResourcesErrorBoundary>
    </div>
  );
}
