import { lazy, Suspense, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Stethoscope,
  HeartPulse, Bone, Wind, Brain, Baby,
  HeartHandshake, Flame, FlaskConical, ArrowRight,
  Search, SlidersHorizontal,
  Timer, ShieldCheck,
  Waves, PersonStanding, Thermometer, Droplets, UsersRound, House, ScanSearch
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { caseCategories } from '@/data/caseFilters';
import { LandingHeroScene } from '@/components/LandingHeroScene';

const ClinicalReferenceDialog = lazy(() =>
  import('@/components/ClinicalReferenceDialog').then(m => ({ default: m.ClinicalReferenceDialog })),
);

interface LandingPageProps {
  onRoleSelect: (role: 'educator' | 'student' | 'classroom-host' | 'classroom-join', category?: string) => void;
  caseCount: number;
  /** Real per-category case counts. Empty until the case library finishes loading. */
  caseCountsByCategory: Record<string, number>;
}

type CategoryFilter = 'all' | 'high-acuity' | 'assessment' | 'procedures';
type CategoryTone = 'red' | 'orange' | 'sky' | 'indigo' | 'teal' | 'rose' | 'amber' | 'emerald';

interface CategoryMeta {
  /** Matches a `caseCategories` value — this is what the student filter receives. */
  slug: string;
  name: string;
  count: number;
  icon: typeof HeartPulse;
  tone: CategoryTone;
  track: string;
  summary: string;
  signal: string;
  focus: string[];
  filters: CategoryFilter[];
}

const categoryFilters: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'high-acuity', label: 'High acuity' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'procedures', label: 'Procedures' },
];

/**
 * Editorial copy per category slug. Counts are NOT stored here — they come from
 * the live case library, so the library grid can never drift from the data again.
 * Every key must exist in `caseCategories`; a missing key just falls back below.
 */
const categoryCopy: Record<string, Omit<CategoryMeta, 'slug' | 'name' | 'count'>> = {
  cardiac: {
    icon: HeartPulse,
    tone: 'red',
    track: 'High acuity',
    summary: 'MI, arrhythmias, cardiac arrest',
    signal: 'Rhythm recognition, defib timing, perfusion checks',
    focus: ['ECG', 'Defib', 'Perfusion'],
    filters: ['high-acuity', 'assessment', 'procedures'],
  },
  'cardiac-ecg': {
    icon: Activity,
    tone: 'red',
    track: 'Interpretation',
    summary: '12-lead interpretation and rhythm drills',
    signal: 'Axis, blocks, ischaemic patterns, STEMI mimics',
    focus: ['12-lead', 'Rhythm', 'STEMI'],
    filters: ['assessment'],
  },
  trauma: {
    icon: Bone,
    tone: 'orange',
    track: 'Scene control',
    summary: 'Blunt, penetrating, multi-system injury',
    signal: 'Catastrophic bleed, spinal motion, rapid transport decisions',
    focus: ['MARCH', 'Splints', 'Transport'],
    filters: ['high-acuity', 'assessment', 'procedures'],
  },
  respiratory: {
    icon: Wind,
    tone: 'sky',
    track: 'Airway focus',
    summary: 'Asthma, COPD, pneumothorax',
    signal: 'Work of breathing, oxygen choice, escalation to ventilation',
    focus: ['Oxygen', 'BVM', 'CPAP'],
    filters: ['high-acuity', 'assessment', 'procedures'],
  },
  neurological: {
    icon: Brain,
    tone: 'indigo',
    track: 'Assessment',
    summary: 'Stroke, seizure, altered LOC',
    signal: 'GCS, pupils, glucose, time-last-known-well',
    focus: ['FAST', 'GCS', 'Pupils'],
    filters: ['assessment', 'high-acuity'],
  },
  pediatric: {
    icon: Baby,
    tone: 'teal',
    track: 'Expert',
    summary: 'Age-specific emergencies',
    signal: 'Weight-based dosing, family communication, pediatric triangle',
    focus: ['Dosing', 'PALS', 'Family'],
    filters: ['assessment', 'procedures'],
  },
  obstetric: {
    icon: HeartHandshake,
    tone: 'rose',
    track: 'Expert',
    summary: 'Pregnancy and delivery complications',
    signal: 'Maternal assessment, fetal context, rapid escalation triggers',
    focus: ['Delivery', 'Bleeding', 'Shock'],
    filters: ['high-acuity', 'assessment', 'procedures'],
  },
  burns: {
    icon: Flame,
    tone: 'amber',
    track: 'Advanced',
    summary: 'Thermal, chemical, electrical burns',
    signal: 'Airway risk, TBSA estimate, cooling and analgesia sequencing',
    focus: ['TBSA', 'Airway', 'Analgesia'],
    filters: ['assessment', 'procedures'],
  },
  toxicology: {
    icon: FlaskConical,
    tone: 'emerald',
    track: 'Advanced',
    summary: 'Overdose and poisoning',
    signal: 'Toxidrome recognition, naloxone timing, airway protection',
    focus: ['Toxidrome', 'Antidote', 'Airway'],
    filters: ['assessment', 'procedures'],
  },
  metabolic: {
    icon: Droplets,
    tone: 'emerald',
    track: 'Assessment',
    summary: 'Hypoglycaemia, DKA, electrolyte crises',
    signal: 'BGL trends, dextrose vs glucagon, fluid and insulin context',
    focus: ['BGL', 'Dextrose', 'Fluids'],
    filters: ['assessment', 'procedures'],
  },
  environmental: {
    icon: Thermometer,
    tone: 'amber',
    track: 'Scene control',
    summary: 'Heat illness, hypothermia, drowning, envenomation',
    signal: 'Core temperature, active rewarming or cooling, scene hazards',
    focus: ['Temp', 'Rewarm', 'Hazards'],
    filters: ['high-acuity', 'assessment'],
  },
  psychiatric: {
    icon: Brain,
    tone: 'rose',
    track: 'Communication',
    summary: 'Acute behavioural disturbance and crisis presentations',
    signal: 'De-escalation first, capacity, restraint as a last resort',
    focus: ['De-escalation', 'Capacity', 'Safety'],
    filters: ['assessment'],
  },
  'anxiety-related': {
    icon: Waves,
    tone: 'teal',
    track: 'Communication',
    summary: 'Panic, hyperventilation, somatic presentations',
    signal: 'Excluding organic causes before reassurance and coaching',
    focus: ['Rule-out', 'Coaching', 'Rapport'],
    filters: ['assessment'],
  },
  'elderly-fall': {
    icon: PersonStanding,
    tone: 'indigo',
    track: 'Assessment',
    summary: 'Falls, frailty, and silent injury in older patients',
    signal: 'Cause of the fall, occult fracture, polypharmacy, non-conveyance risk',
    focus: ['Frailty', 'Silver trauma', 'Meds'],
    filters: ['assessment'],
  },
  'multiple-patients': {
    icon: UsersRound,
    tone: 'orange',
    track: 'Scene control',
    summary: 'Multi-casualty scenes and triage under pressure',
    signal: 'Triage sieve, resource requests, command and communication',
    focus: ['Triage', 'Command', 'Resources'],
    filters: ['high-acuity', 'procedures'],
  },
  'post-discharge': {
    icon: House,
    tone: 'sky',
    track: 'Continuity',
    summary: 'Deterioration and complications after hospital discharge',
    signal: 'Recent history, medication changes, re-presentation red flags',
    focus: ['History', 'Meds', 'Red flags'],
    filters: ['assessment'],
  },
  'rule-out': {
    icon: ScanSearch,
    tone: 'sky',
    track: 'Assessment',
    summary: 'Undifferentiated presentations needing exclusion',
    signal: 'Working through differentials without anchoring too early',
    focus: ['Differentials', 'Red flags', 'Safety net'],
    filters: ['assessment'],
  },
  general: {
    icon: Stethoscope,
    tone: 'teal',
    track: 'Foundations',
    summary: 'Core assessment and everyday callouts',
    signal: 'Clean ABCDE, history taking, and appropriate disposition',
    focus: ['ABCDE', 'History', 'Disposition'],
    filters: ['assessment'],
  },
};

const fallbackCopy: Omit<CategoryMeta, 'slug' | 'name' | 'count'> = {
  icon: Stethoscope,
  tone: 'teal',
  track: 'Assessment',
  summary: 'Clinical scenarios from the case library',
  signal: 'Structured assessment and treatment decisions',
  focus: ['ABCDE'],
  filters: ['assessment'],
};

export function LandingPage({ onRoleSelect, caseCount, caseCountsByCategory }: LandingPageProps) {
  const { t } = useTranslation();
  const [categoryQuery, setCategoryQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // The library is lazy-loaded, so counts arrive after first paint. Until they
  // do, show every category rather than an empty grid.
  const countsLoaded = caseCount > 0;

  const categories = useMemo<CategoryMeta[]>(() => (
    caseCategories
      .map(cat => ({
        slug: cat.value,
        name: cat.label,
        count: caseCountsByCategory[cat.value] ?? 0,
        ...(categoryCopy[cat.value] ?? fallbackCopy),
      }))
      // Never advertise a track with nothing behind it.
      .filter(cat => !countsLoaded || cat.count > 0)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  ), [caseCountsByCategory, countsLoaded]);

  const visibleCategories = useMemo(() => {
    const query = categoryQuery.trim().toLowerCase();

    return categories.filter((cat) => {
      const matchesFilter = categoryFilter === 'all' || cat.filters.includes(categoryFilter);
      const matchesQuery = !query || [
        cat.name,
        cat.summary,
        cat.signal,
        cat.track,
        ...cat.focus,
      ].join(' ').toLowerCase().includes(query);

      return matchesFilter && matchesQuery;
    });
  }, [categories, categoryFilter, categoryQuery]);

  const visibleCaseCount = visibleCategories.reduce((total, cat) => total + cat.count, 0);

  return (
    <div className="clinical-shell training-landing min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-blur border-b border-white/45 dark:border-white/10 safe-top">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">
              Paramedic<span className="text-cyan-700 dark:text-cyan-300">Studio</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => document.getElementById('case-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/45 dark:hover:bg-white/10 transition-colors"
            >
              Library
            </button>
            <button
              onClick={() => onRoleSelect('student')}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/45 dark:hover:bg-white/10 transition-colors"
            >
              {t('landing.practice', 'Practice')}
            </button>
            {/* Guidelines opens the in-app clinical reference (drug + guideline
                library) via its dialog — the trigger is this nav button. */}
            <Suspense
              fallback={(
                <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground rounded-lg" disabled>
                  Guidelines
                </button>
              )}
            >
              <ClinicalReferenceDialog
                trigger={(
                  <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/45 dark:hover:bg-white/10 transition-colors">
                    Guidelines
                  </button>
                )}
              />
            </Suspense>
            <div className="w-px h-4 bg-border/80 mx-1" />
            <button
              onClick={() => onRoleSelect('educator')}
              className="px-3 py-1.5 text-xs font-medium text-white btn-primary rounded-lg"
            >
              {t('landing.educatorShort', 'For educators')}
            </button>
          </div>
        </div>
      </nav>

      <main>
      <section className="training-hero" aria-labelledby="training-title">
        <div className="training-hero-copy">
          <motion.p
            className="training-eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            {t('landing.eyebrow', 'Practice for the moments that matter')}
          </motion.p>
          <motion.h1
            id="training-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {t('landing.title', 'Your next patient. Your next decision.')}
          </motion.h1>
          <motion.p
            className="training-hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
          >
            {t('landing.description', 'Enter the scene. Listen to your patient, find the signs, and practise the care they need. Then review your decisions before the next call.')}
          </motion.p>
          <motion.div
            className="training-hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}
          >
            <button className="training-start" onClick={() => onRoleSelect('student')}>
              {t('landing.start', 'Start training')} <ArrowRight aria-hidden="true" className="rtl:rotate-180 h-5 w-5" />
            </button>
            <button className="training-join" onClick={() => onRoleSelect('classroom-join')}>
              {t('landing.join', 'Join a classroom')}
            </button>
          </motion.div>
          <motion.p
            className="training-hero-note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.56 }}
          >
            {t('landing.note', 'From your first assessment to advanced clinical practice.')}
          </motion.p>
        </div>
        <motion.figure
          className="training-hero-scene"
          initial={{ opacity: 0, scale: 0.97, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Living 3D pulse layer behind the scene photo */}
          <div className="training-hero-scene-live" aria-hidden="true">
            <LandingHeroScene />
          </div>
          <img src="/scene-assets/asthma-villa-male-uae.png" alt={t('landing.sceneAlt', 'Paramedics approaching a patient in a home scenario')} fetchPriority="high" />
          <figcaption>
            <span>{t('landing.preview', 'A scene from the case library')}</span>
            <strong>{t('landing.sceneCaption', 'Every encounter starts with a patient, not a diagnosis.')}</strong>
          </figcaption>
        </motion.figure>
      </section>
      <section className="training-path" aria-label={t('landing.path', 'Your learning journey')}>
        {[
          ['01', t('landing.assess', 'Assess'), t('landing.assessDetail', 'Read the scene. Ask, look, listen and feel.')],
          ['02', t('landing.treat', 'Treat'), t('landing.treatDetail', 'Choose your equipment and deliver care.')],
          ['03', t('landing.review', 'Reassess & reflect'), t('landing.reviewDetail', 'Follow the response. Learn from your decisions.')],
        ].map(([number, title, detail], index) => (
          <motion.div
            key={number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="training-step-number">{number}</span><div><h2>{title}</h2><p>{detail}</p></div>
          </motion.div>
        ))}
      </section>
      <div className="training-teaching">
        <p>{t('landing.teaching', 'Teaching a group?')}</p>
        <button onClick={() => onRoleSelect('educator')}>{t('landing.educator', 'Open educator panel')} <ArrowRight aria-hidden="true" className="rtl:rotate-180 h-4 w-4" /></button>
        <button onClick={() => onRoleSelect('classroom-host')}>{t('landing.host', 'Host a classroom')} <ArrowRight aria-hidden="true" className="rtl:rotate-180 h-4 w-4" /></button>
      </div>
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent max-w-6xl mx-auto" />

      {/* Categories Section — scroll target for the "Library" nav item */}
      <section id="case-library" className="py-14 sm:py-16 relative z-10 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Case library
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Browse by clinical presentation</h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                Search by presentation, decision point, or treatment focus before entering the simulator.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-xs font-medium text-muted-foreground dark:border-white/10 dark:bg-white/[0.06]">
                <Timer className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-300" />
                {visibleCaseCount} cases shown
              </span>
              <button
                onClick={() => onRoleSelect('student')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200/70 bg-cyan-50/70 px-3 py-2 text-xs font-semibold text-cyan-800 transition-colors hover:bg-cyan-100 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200 dark:hover:bg-cyan-400/15"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <label className="glass-control flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2">
              <Search className="w-4 h-4 text-cyan-700 dark:text-cyan-300 shrink-0" />
              <span className="sr-only">Search case library</span>
              <input
                value={categoryQuery}
                onChange={(event) => setCategoryQuery(event.target.value)}
                placeholder="Search cardiac, oxygen, GCS, defib..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter
              </span>
              {categoryFilters.map((filter) => {
                const isActive = categoryFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setCategoryFilter(filter.value)}
                    aria-pressed={isActive}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? 'border-slate-900 bg-slate-950 text-white shadow-sm dark:border-cyan-300/40 dark:bg-cyan-300 dark:text-slate-950'
                        : 'glass-control text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="training-library">
            {visibleCategories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.slug}
                  onClick={() => onRoleSelect('student', cat.slug)}
                  aria-label={`Start ${cat.name} training cases`}
                  className="training-library-row"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.45, delay: (index % 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ x: 4 }}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                  <span><strong>{cat.name}</strong><span>{cat.summary}</span></span>
                  <span className="training-library-count">{countsLoaded ? cat.count : '…'}</span>
                  <ArrowRight aria-hidden="true" className="rtl:rotate-180 h-4 w-4" />
                </motion.button>
              );
            })}
          </div>

          {visibleCategories.length === 0 && (
            <div className="glass mt-4 rounded-xl border p-5 text-center">
              <p className="text-sm font-semibold">No matching case track found</p>
              <p className="mt-1 text-xs text-muted-foreground">Try a different keyword or clear the active filter.</p>
              <button
                onClick={() => {
                  setCategoryQuery('');
                  setCategoryFilter('all');
                }}
                className="mt-3 rounded-lg border border-cyan-200/70 bg-cyan-50/70 px-3 py-2 text-xs font-semibold text-cyan-800 transition-colors hover:bg-cyan-100 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200"
              >
                Reset library
              </button>
            </div>
          )}
        </div>
      </section>

      </main>
      {/* Footer */}
      <footer className="py-8 relative z-10 border-t border-white/45 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground">
            For educational purposes only | Evidence-based paramedic training
          </p>
        </div>
      </footer>
    </div>
  );
}
