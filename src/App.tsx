import { lazy, Suspense, useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CaseScenario, StudentYear, VitalSigns } from '@/types';
import { yearLevels, caseCategories, priorities } from '@/data/caseFilters';
import { getDeteriorationStatus } from '@/data/deteriorationSystem';
import { useEducatorPanel } from '@/hooks/useEducatorPanel';
import { useSimulationTimer } from '@/hooks/useSimulationTimer';
import { useTreatmentEngine } from '@/hooks/useTreatmentEngine';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {Stethoscope, GraduationCap, ClipboardCheck, RotateCcw,
  FileText, Sparkles, Home, ChevronRight, ArrowLeft,
  History, BarChart3, Loader2, Activity, Target, Users, BookOpen } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// ── Lazy Imports (each wrapped with ErrorBoundary) ──

const StudentPanel = lazy(() => import('@/components/StudentPanel'));
const ClassroomHost = lazy(() => import('@/components/classroom/ClassroomHost'));
const ClassroomJoin = lazy(() => import('@/components/classroom/ClassroomJoin'));
const CaseLibraryPage = lazy(() => import('@/components/CaseLibraryPage'));
const ClinicalReferenceDialog = lazy(() => import('@/components/ClinicalReferenceDialog').then(m => ({ default: m.ClinicalReferenceDialog })));
const AttributionsDialog = lazy(() => import('@/components/AttributionsDialog').then(m => ({ default: m.AttributionsDialog })));
const ObjectiveSetupPanel = lazy(() => import('@/components/ObjectiveSetupPanel').then(m => ({ default: m.ObjectiveSetupPanel })));
const WorkspaceLayout = lazy(() => import('@/components/Workspace').then(m => ({ default: m.WorkspaceLayout })));

import { useComplicationManager } from '@/components/ComplicationManager';
import { CommandPalette } from '@/components/CommandPalette';
import { CaseSkeleton } from '@/components/CaseSkeleton';
import { LandingPage } from '@/components/LandingPage';
import { AmbientBackground } from '@/components/AmbientBackground';
import { AuthGate } from '@/components/AuthGate';

// ── Helpers ──

/** Structured skeleton (not a lonely spinner) — perceived-performance win. */
const suspenseFallback = <CaseSkeleton />;

/** Wraps a lazy-loaded component in Suspense + ErrorBoundary. */
function LazyLoad({ children, name }: { children: React.ReactNode; name: string }) {
  return (
    <ErrorBoundary component={name}>
      <Suspense fallback={suspenseFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// ── App ──

function App() {
  const ep = useEducatorPanel();
  const [pendingStudentCategory, setPendingStudentCategory] = useState('all');
  const devLiveCaseId = import.meta.env.DEV && typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('devLiveCase')
    : null;
  const devLiveCase = devLiveCaseId
    ? ep.allCases.find(caseItem => caseItem.id === devLiveCaseId)
    : null;

  const exitDevLiveCase = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('devLiveCase');
    url.searchParams.delete('capture');
    // The diagnostic route can be entered while userRole is already `none`, so
    // handleRoleExit may be a React no-op and leave the overridden case mounted.
    // A clean replacement guarantees the override is torn down and cannot
    // immediately restart the same case.
    window.location.replace(`${url.pathname}${url.search}${url.hash}`);
  };

  if (devLiveCaseId && import.meta.env.DEV) {
    if (!devLiveCase) return suspenseFallback;
    return (
      <LazyLoad name="StudentPanel">
        <StudentPanel onExit={exitDevLiveCase} preloadedCase={devLiveCase} />
        <CommandPalette onSwitchRole={exitDevLiveCase} />
        <Toaster position="top-right" richColors closeButton />
      </LazyLoad>
    );
  }

  // Landing page
  if (ep.userRole === 'none') {
    return (
      <>
        <LandingPage
          onRoleSelect={(role, category) => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            setPendingStudentCategory(category ?? 'all');
            ep.setUserRole(role);
          }}
          caseCount={ep.allCases.length}
          caseCountsByCategory={ep.caseCountsByCategory}
        />
        <CommandPalette onCaseSelect={() => ep.setUserRole('educator')} />
      </>
    );
  }

  // Classroom instructor host (gated by magic-link sign-in when Supabase
  // auth is configured; otherwise AuthGate passes straight through).
  if (ep.userRole === 'classroom-host') {
    return (
      <AuthGate blurb="Sign in to host a classroom session." onExit={ep.handleRoleExit}>
        <LazyLoad name="ClassroomHost">
          <ClassroomHost onExit={ep.handleRoleExit} />
          <Toaster position="top-right" richColors closeButton />
        </LazyLoad>
      </AuthGate>
    );
  }

  // Classroom student join stays PIN-first. A learner should never need to
  // leave the classroom flow for an email magic link; the six-digit room code
  // is the access credential. Signed-in learners can still save results once
  // they are inside the case, but authentication is not a join prerequisite.
  if (ep.userRole === 'classroom-join') {
    return (
      <LazyLoad name="ClassroomJoin">
        <ClassroomJoin onExit={ep.handleRoleExit} />
        <Toaster position="top-right" richColors closeButton />
      </LazyLoad>
    );
  }

  // Student panel
  if (ep.userRole === 'student') {
    return (
      <LazyLoad name="StudentPanel">
        <StudentPanel onExit={ep.handleRoleExit} initialCategory={pendingStudentCategory} />
        <CommandPalette onSwitchRole={ep.handleRoleExit} />
        <Toaster position="top-right" richColors closeButton />
      </LazyLoad>
    );
  }

  // Educator panel
  return <EducatorPanel {...ep} />;
}

// ── EducatorPanel ──

type EducatorPanelProps = ReturnType<typeof useEducatorPanel>;

function EducatorPanel(ep: EducatorPanelProps) {
  const { t } = useTranslation();
  const [showCaseLibrary, setShowCaseLibrary] = useState(false);

  // Complication manager (local, not persisted)
  const {
    activeComplications,
    resolveComplication,
    ignoreComplication,
  } = useComplicationManager();

  // Callback for simulation timer — updates vitals + history inline
  const handleDeteriorationTick = useCallback((newVitals: VitalSigns) => {
    ep.setCurrentVitals(newVitals);
    ep.setVitalsHistory(prev => [...prev, newVitals]);
    ep.setPreviousVitals(ep.currentVitals);
  }, [ep.currentVitals]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCritical = useCallback((changes: string[]) => {
    toast.warning('Patient deteriorating!', {
      description: changes.slice(0, 2).join(', '),
      icon: <Activity className="h-4 w-4 text-red-500" />,
    });
  }, []);

  // Simulation/deterioration timer
  const simTimer = useSimulationTimer(
    ep.currentCase ? { category: ep.currentCase.category } : null,
    ep.currentVitals,
    ep.appliedTreatments,
    handleDeteriorationTick,
    handleCritical,
  );

  // Treatment engine
  const treat = useTreatmentEngine(
    ep.currentCase,
    ep.currentVitals,
    ep.session,
    ep.setSession,
    (vitals) => ep.setCurrentVitals(vitals),
    (vitals) => ep.setVitalsHistory(prev => [...prev, vitals]),
    (vitals) => ep.setPreviousVitals(vitals),
    ep.appliedTreatments,
    ep.setAppliedTreatments,
    ep.addTimelineEvent,
  );

  useEffect(() => {
    if (!ep.currentCase || !ep.currentVitals) return;
    simTimer.resetDeterioration(ep.currentCase.category, ep.currentVitals);
  }, [ep.currentCase?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync animated vitals when animation finishes
  useEffect(() => {
    if (treat.animatedVitals && !treat.isVitalsAnimating) {
      ep.setCurrentVitals(treat.animatedVitals);
    }
  }, [treat.animatedVitals, treat.isVitalsAnimating]); // eslint-disable-line react-hooks/exhaustive-deps

  if (showCaseLibrary && !ep.currentCase) {
    return (
      <div className="clinical-shell min-h-screen relative overflow-x-hidden">
        <AmbientBackground />
        <div className="relative z-10">
          <CaseLibraryPage
            cases={ep.allCases}
            onLaunch={(c) => { setShowCaseLibrary(false); ep.loadCaseFromHistory(c); }}
            onBack={() => setShowCaseLibrary(false)}
            onCoursePractice={() => { setShowCaseLibrary(false); ep.setShowObjectiveSetup(true); }}
          />
        </div>
      </div>
    );
  }

  if (showCaseLibrary && !ep.currentCase) {
    return (
      <div className="clinical-shell min-h-screen relative overflow-x-hidden">
        <AmbientBackground />
        <div className="relative z-10">
          <CaseLibraryPage
            cases={ep.allCases}
            onLaunch={(c) => { setShowCaseLibrary(false); ep.loadCaseFromHistory(c); }}
            onBack={() => setShowCaseLibrary(false)}
            onCoursePractice={() => { setShowCaseLibrary(false); ep.setShowObjectiveSetup(true); }}
          />
        </div>
      </div>
    );
  }

  if (showCaseLibrary && !ep.currentCase) {
    return (
      <div className="clinical-shell min-h-screen relative overflow-x-hidden">
        <AmbientBackground />
        <div className="relative z-10">
          <CaseLibraryPage
            cases={ep.allCases}
            onLaunch={(c) => { setShowCaseLibrary(false); ep.loadCaseFromHistory(c); }}
            onBack={() => setShowCaseLibrary(false)}
            onCoursePractice={() => { setShowCaseLibrary(false); ep.setShowObjectiveSetup(true); }}
          />
        </div>
      </div>
    );
  }

  if (showCaseLibrary && !ep.currentCase) {
    return (
      <div className="clinical-shell min-h-screen relative overflow-x-hidden">
        <AmbientBackground />
        <div className="relative z-10">
          <CaseLibraryPage
            cases={ep.allCases}
            onLaunch={(c) => { setShowCaseLibrary(false); ep.loadCaseFromHistory(c); }}
            onBack={() => setShowCaseLibrary(false)}
            onCoursePractice={() => { setShowCaseLibrary(false); ep.setShowObjectiveSetup(true); }}
          />
        </div>
      </div>
    );
  }

  // ── Render: no case (home / objective setup) ──
  if (!ep.currentCase) {
    return (
      <div className="clinical-shell min-h-screen relative overflow-x-hidden">
        <AmbientBackground />
        <div className="relative z-10">
        <ShowHeader
          currentCase={null}
          goHome={ep.goHome}
          generateCase={ep.generateCase}
          isGenerating={ep.isGenerating}
          onExit={ep.handleRoleExit}
        />
        <main className="container mx-auto px-4 py-6">
          {ep.showObjectiveSetup ? (
            <div className="animate-fade-in max-w-3xl mx-auto">
              <div className="mb-4">
                <Button variant="ghost" size="sm" onClick={() => ep.setShowObjectiveSetup(false)}
                  className="gap-1 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" /> Back to Home
                </Button>
              </div>
              <LazyLoad name="ObjectiveSetupPanel">
                <ObjectiveSetupPanel
                  selectedYear={ep.selectedYear}
                  selectedCategory={ep.selectedCategory}
                  onObjectiveSet={ep.handleObjectiveSet}
                  onSkip={ep.handleSkipObjective}
                />
              </LazyLoad>
            </div>
          ) : (
            /* Home / Case Generator Screen */
            <HomeScreen
              selectedYear={ep.selectedYear}
              setSelectedYear={ep.setSelectedYear}
              selectedCategory={ep.selectedCategory}
              setSelectedCategory={ep.setSelectedCategory}
              allCases={ep.allCases}
              caseHistory={ep.caseHistory}
              caseCountsByCategory={ep.caseCountsByCategory}
              categoryLookup={ep.categoryLookup}
              isGenerating={ep.isGenerating}
              generateCase={ep.generateCase}
              setShowObjectiveSetup={ep.setShowObjectiveSetup}
              loadCaseFromHistory={ep.loadCaseFromHistory}
              onHostClassroom={() => ep.setUserRole('classroom-host')}
              onOpenLibrary={() => setShowCaseLibrary(true)}
            />
          )}
        </main>
        <Footer currentCase={null} />
        <Toaster position="top-right" richColors closeButton />
        </div>{/* /relative z-10 — ambient-bg wrapper */}
      </div>
    );
  }

  // ── Render: active case ──
  return (
    <div className="clinical-shell min-h-screen">
      <CommandPalette onCaseSelect={ep.loadCaseFromHistory} onSwitchRole={ep.handleRoleExit} />
      <ShowHeader
        currentCase={ep.currentCase}
        goHome={ep.goHome}
        generateCase={ep.generateCase}
        isGenerating={ep.isGenerating}
        onExit={ep.handleRoleExit}
      />
      <main className="px-0 py-0">
        <div className="animate-fade-in">
          {/* Action Bar */}
          <div className="container mx-auto flex items-center justify-between px-4 py-3">
            <Button variant="ghost" size="sm" onClick={ep.goHome}
              className="gap-1 text-muted-foreground hover:text-foreground -ml-2 h-8 text-xs sm:text-sm sm:h-9">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 rtl:rotate-180" />
              <span className="hidden sm:inline">{t('header.backToHome')}</span>
              <span className="sm:hidden">{t('header.back')}</span>
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {t('header.pressEscForHome')} <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">ESC</kbd>
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">N</kbd> {t('header.pressNForNewCase')}
              </span>
            </div>
          </div>

          {/* Workspace */}
          <LazyLoad name="WorkspaceLayout">
            <WorkspaceLayout
              caseData={ep.currentCase}
              vitals={ep.currentVitals}
              previousVitals={ep.previousVitals}
              activeComplications={activeComplications}
              onResolveComplication={resolveComplication}
              onIgnoreComplication={ignoreComplication}
              deteriorationStatus={getDeteriorationStatus(simTimer.deteriorationSeverity, simTimer.deteriorationMinutes)}
              session={ep.session}
              timelineEvents={ep.timelineEvents}
              onAction={(actionId) => {
                if (actionId === 'defibrillate') {
                  toast.info('Use the transport monitor', {
                    description: 'Attach pads, select DEFIB, analyse the rhythm, choose energy, charge, clear, then shock.',
                  });
                  return;
                }
                const msgs: Record<string, { title: string; description: string }> = {
                  drug: { title: 'Medication', description: 'Protocol medication administered' },
                  airway: { title: 'Airway Management', description: 'Airway secured and managed' },
                  iv: { title: 'IV Access', description: 'Intravenous access established' },
                  cardiac: { title: 'Monitoring', description: '12-lead ECG acquired and monitoring initiated' },
                  transport: { title: 'Transport', description: 'Patient packaged for transport' },
                  backup: { title: 'Backup Requested', description: 'Additional resources requested' },
                };
                const msg = msgs[actionId] || { title: 'Action', description: actionId };
                toast.success(msg.title, { description: msg.description });
                ep.addTimelineEvent({
                  id: `action-${Date.now()}`,
                  type: 'intervention',
                  title: msg.title,
                  description: msg.description,
                  tags: [{ label: 'Action', variant: 'success' }],
                });
              }}
              onDecision={(itemId, optionId) => {
                const ci = ep.currentCase!.studentChecklist?.find(i => i.id === itemId || i.id === optionId);
                if (ci && ep.session) {
                  treat.toggleChecklistItem(ci.id, !ep.session.completedItems.includes(ci.id));
                } else {
                  toast.success('Decision recorded', { description: `Option ${optionId} selected` });
                }
              }}
              onVitalChange={(vitals) => {
                ep.setCurrentVitals(vitals);
                ep.setVitalsHistory(prev => [...prev, vitals]);
              }}
              appliedTreatments={treat.appliedTreatmentIds}
            />
          </LazyLoad>
        </div>
      </main>
      <Footer currentCase={ep.currentCase} />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

// ── Sub-Components ──

function ShowHeader({
  currentCase, goHome, generateCase, isGenerating, onExit,
}: {
  currentCase: CaseScenario | null;
  goHome: () => void;
  generateCase: (objective?: any) => Promise<void>;
  isGenerating: boolean;
  onExit: () => void;
}) {
  const { t } = useTranslation();
  const catLookup = Object.fromEntries(caseCategories.map(c => [c.value, c]));

  return (
    <header className="sticky top-0 z-50 nav-blur border-b border-white/45 dark:border-white/10 transition-all duration-300 safe-top">
      <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-4">
        <div className="flex items-center justify-between">
          <button onClick={goHome} className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 shadow-lg shadow-cyan-500/20 transition-all duration-300">
              <Stethoscope className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="heading-premium text-base sm:text-lg group-hover:text-primary transition-colors leading-tight truncate">
                  {t('app.name')}
                </h1>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 shrink-0">
                  {t('role.educatorBadge')}
                </Badge>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t('header.caseGeneration')}</p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <LazyLoad name="ClinicalReferenceDialog">
              <ClinicalReferenceDialog />
            </LazyLoad>
            {currentCase && (
              <>
                <Button variant="ghost" size="sm" onClick={goHome}
                  className="hidden sm:flex gap-1 hover:bg-muted/80 transition-colors">
                  <Home className="h-4 w-4" /> <span>{t('header.home')}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={generateCase} disabled={isGenerating} className="gap-1">
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                  <span className="hidden sm:inline">{isGenerating ? t('header.generating') : t('header.newCase')}</span>
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={onExit}
              className="gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              <span className="hidden sm:inline">{t('header.switchRole')}</span>
            </Button>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        {currentCase && (
          <div className="hidden sm:flex items-center gap-2 mt-3 text-sm text-muted-foreground border-t border-white/35 dark:border-white/10 pt-3 animate-fade-in">
            <button onClick={goHome} className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="h-3 w-3" /> Home
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium truncate max-w-[300px]">{currentCase.title}</span>
            <Badge variant="outline" className="text-[10px] ml-2">
              {catLookup[currentCase.category]?.label}
            </Badge>
          </div>
        )}
      </div>
    </header>
  );
}

function HomeScreen({
  selectedYear, setSelectedYear, selectedCategory, setSelectedCategory,
  allCases, caseHistory, caseCountsByCategory, categoryLookup,
  isGenerating, generateCase, setShowObjectiveSetup, loadCaseFromHistory,
  onHostClassroom,
  onOpenLibrary,
}: {
  selectedYear: StudentYear;
  setSelectedYear: (y: StudentYear) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  allCases: CaseScenario[];
  caseHistory: CaseScenario[];
  caseCountsByCategory: Record<string, number>;
  categoryLookup: Record<string, any>;
  isGenerating: boolean;
  generateCase: (objective?: any) => Promise<void>;
  setShowObjectiveSetup: (v: boolean) => void;
  loadCaseFromHistory: (c: CaseScenario) => void;
  onHostClassroom: () => void;
  onOpenLibrary: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="animate-fade-in space-y-8">
      {/* Hero */}
      <div className="mx-auto max-w-3xl">
        <Card className="glass-strong overflow-hidden relative border border-white/55 dark:border-white/10 shadow-sm">
          <CardHeader className="text-center relative pb-2">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-600 shadow-lg shadow-cyan-500/20">
              <Stethoscope className="h-10 w-10 text-primary-foreground" />
            </div>
            <CardTitle className="heading-clean text-3xl">{t('generator.title')}</CardTitle>
            <p className="text-base text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">{t('generator.subtitle')}</p>
          </CardHeader>
          <CardContent className="space-y-8 relative">
            {/* Year Level */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <GraduationCap className="h-4 w-4 text-primary" /> {t('generator.selectYear')}
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {yearLevels.map((year, i) => (
                  <button
                    key={year.value}
                    onClick={() => setSelectedYear(year.value as StudentYear)}
                    className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-300 ${
                      selectedYear === year.value
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border/50 bg-white/35 hover:border-primary/40 hover:bg-white/55 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]'
                    }`}
                    style={{ animationDelay: `${i * 75}ms` }}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${selectedYear === year.value ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'}`}>
                      <GraduationCap className={`h-5 w-5 transition-colors duration-300 ${selectedYear === year.value ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'}`} />
                    </div>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${selectedYear === year.value ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      {year.label}
                    </span>
                    {selectedYear === year.value && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            {/* Category */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <BarChart3 className="h-4 w-4 text-primary" /> {t('generator.selectCategory')}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border/50 hover:border-primary/30 hover:bg-muted/30 text-muted-foreground'
                  }`}
                >
                  <Sparkles className="h-4 w-4 shrink-0" /> {t('generator.allCases')}
                </button>
                {caseCategories.slice(0, 7).map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm whitespace-nowrap ${
                      selectedCategory === cat.value
                        ? 'border-primary bg-primary/10 text-primary font-medium shadow-sm'
                        : 'border-border/50 hover:border-primary/30 hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${cat.color}`} /> {cat.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Generate Buttons */}
            <div className="space-y-3">
              <Button onClick={() => generateCase()} disabled={isGenerating}
                size="lg" className="w-full gap-3 text-lg py-7 font-semibold shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-200">
                {isGenerating ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> {t('generator.generatingCase')}</>
                ) : (
                  <><Sparkles className="h-5 w-5" /> {t('generator.quickGenerate')}</>
                )}
              </Button>
              <Button onClick={() => setShowObjectiveSetup(true)} disabled={isGenerating}
                variant="outline" size="lg" className="w-full gap-3 text-base py-6 font-medium border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-200">
                <Target className="h-5 w-5 text-primary" /> {t('generator.guidedSetup')}
                <Badge variant="secondary" className="ml-2 text-[10px]">INACSL</Badge>
              </Button>
              <Button onClick={onHostClassroom} disabled={isGenerating}
                variant="secondary" size="lg" className="w-full gap-3 text-base py-6 font-medium">
                <Users className="h-5 w-5" /> Open classroom discussion
              </Button>
              <Button onClick={onOpenLibrary} disabled={isGenerating}
                variant="ghost" size="lg" className="w-full gap-3 text-base py-5 font-medium">
                <BookOpen className="h-5 w-5" /> Library — browse all cases
              </Button>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
              <StatBox icon={<FileText className="h-4 w-4 text-primary/70" />} value={allCases.length > 0 ? allCases.length : 100} suffix="+" label={t('generator.caseScenarios')} />
              <StatBox icon={<BarChart3 className="h-4 w-4 text-primary/70" />} value={caseCategories.length} label={t('generator.categoriesLabel')} />
              <StatBox icon={<GraduationCap className="h-4 w-4 text-primary/70" />} value={4} label={t('generator.yearLevels')} />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Categories + Quick Guide */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground/90">
            <BarChart3 className="h-5 w-5 text-primary" /> Browse by Category
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {caseCategories.map((cat, i) => (
              <Card key={cat.value} style={{ animationDelay: `${i * 50}ms` }}
                className={`group cursor-pointer border transition-all duration-200 hover:shadow-sm ${
                  selectedCategory === cat.value
                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                    : 'border-border/50 bg-white/35 hover:border-primary/40 hover:bg-white/55 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]'
                }`}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  toast.success(`${cat.label} cases selected`, { description: 'Click Generate to start training', duration: 2000 });
                }}>
                <CardContent className="p-4 space-y-3">
                  <div className={`h-1.5 w-12 rounded-full ${cat.color} shadow-sm group-hover:w-16 transition-all duration-300`} />
                  <div>
                    <p className={`text-sm font-semibold transition-colors ${selectedCategory === cat.value ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>{cat.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{caseCountsByCategory[cat.value]} {caseCountsByCategory[cat.value] === 1 ? 'case' : 'cases'}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/90">
            <ClipboardCheck className="h-5 w-5 text-primary" /> Quick Guide
          </h3>
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-4">
              <GuideStep num={1} title="Select your year" desc="Choose based on your training level" />
              <GuideStep num={2} title="Pick a category" desc="Focus on specific case types or mix it up" />
              <GuideStep num={3} title="Generate & train" desc="Work through the case and track your progress" />
            </CardContent>
          </Card>
          {/* Recent Cases */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground/80">
              <History className="h-4 w-4 text-muted-foreground" /> Recent Cases
            </h4>
            {caseHistory.length > 0 ? (
              <div className="space-y-2">
                {caseHistory.slice(0, 5).map((item, i) => (
                  <Card key={`${item.id}-${i}`} className="cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
                    onClick={() => loadCaseFromHistory(item)}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{categoryLookup[item.category]?.label}</p>
                        </div>
                        <Badge variant={item.priority === 'critical' ? 'destructive' : item.priority === 'high' ? 'default' : 'secondary'}
                          className="text-[10px] shrink-0">
                          {priorities.find(p => p.value === item.priority)?.label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-border/50 bg-muted/20">
                <CardContent className="p-4 text-center text-muted-foreground">
                  <History className="h-6 w-6 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No recent cases</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, value, suffix, label }: { icon: React.ReactNode; value: number | string; suffix?: string; label: string }) {
  return (
    <div className="text-center p-4 rounded-xl glass-control transition-colors duration-200 group">
      <div className="flex items-center justify-center gap-2 mb-1">
        {icon}
        <div className="text-2xl font-bold text-foreground">{value}{suffix || ''}</div>
      </div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function GuideStep({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{num}</div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function Footer({ currentCase }: { currentCase: CaseScenario | null }) {
  return (
    <footer className="border-t border-white/45 dark:border-white/10 mt-auto nav-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-1">
            <Stethoscope className="h-3 w-3" />
            UAE Paramedic Case Generator • For educational purposes
          </p>
          {currentCase && (
            <div className="hidden sm:flex items-center gap-3">
              <span>Shortcuts:</span>
              <span className="flex items-center gap-1"><kbd className="px-1 bg-background rounded border font-mono">ESC</kbd> Home</span>
              <span className="flex items-center gap-1"><kbd className="px-1 bg-background rounded border font-mono">N</kbd> New Case</span>
            </div>
          )}
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground/70">
          <Suspense fallback={null}>
            <AttributionsDialog />
          </Suspense>
        </div>
      </div>
    </footer>
  );
}

export default App;
