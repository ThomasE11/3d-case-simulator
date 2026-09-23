/**
 * Case Library — the page you land on from "Library".
 * Browse every case by category / year, with a one-click practice launch.
 */
import { useMemo, useState } from 'react';
import { BookOpen, GraduationCap, Play, Search, ArrowLeft, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { CaseScenario, StudentYear } from '@/types';

export function CaseLibraryPage({
  cases,
  onLaunch,
  onBack,
  onCoursePractice,
}: {
  cases: CaseScenario[];
  onLaunch: (c: CaseScenario) => void;
  onBack: () => void;
  onCoursePractice?: () => void;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [year, setYear] = useState<StudentYear | 'all'>('all');

  const categories = useMemo(() => {
    const set = new Set(cases.map(c => c.category));
    return ['all', ...Array.from(set).sort()];
  }, [cases]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases.filter(c => {
      if (category !== 'all' && c.category !== category) return false;
      if (year !== 'all' && !(c.yearLevels ?? []).includes(year)) return false;
      if (!q) return true;
      return [c.title, c.subcategory, c.dispatchInfo?.callReason, c.expectedFindings?.mostLikelyDiagnosis]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [cases, category, year, query]);

  return (
    <div className="animate-fade-in mx-auto max-w-6xl space-y-4 px-4 py-6">
      <style>{`@keyframes library-in { from { opacity: 0; transform: translateY(6px);} to { opacity:1; transform:none;} }`}</style>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-5 w-5 text-primary" /> Case Library
            <Badge variant="secondary" className="text-[10px]">{filtered.length}</Badge>
          </h1>
        </div>
        {onCoursePractice && (
          <Button variant="outline" size="sm" onClick={onCoursePractice} className="gap-1.5">
            <GraduationCap className="h-4 w-4" /> Course practice
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search condition, call reason…"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none ring-primary/40 focus:ring-2"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.slice(0, 10).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
        <select
          value={year}
          onChange={e => setYear(e.target.value as StudentYear | 'all')}
          className="rounded-xl border border-border bg-card px-3 py-2 text-xs"
        >
          <option value="all">All years</option>
          <option value="diploma">Diploma</option>
          <option value="1st-year">1st year</option>
          <option value="2nd-year">2nd year</option>
          <option value="3rd-year">3rd year</option>
          <option value="4th-year">4th year</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => (
          <Card
            key={c.id}
            className="group cursor-pointer border-border/60 transition hover:border-primary/50 hover:shadow-md"
            style={{ animation: `library-in 0.35s ease ${Math.min(i * 0.02, 0.4)}s both` }}
            onClick={() => onLaunch(c)}
          >
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-snug">{c.title}</p>
                <Badge variant="outline" className="shrink-0 text-[10px]">{c.category}</Badge>
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">{c.dispatchInfo?.callReason}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Layers className="h-3 w-3" /> {(c.yearLevels ?? []).join(' / ') || 'All years'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition group-hover:opacity-100">
                  <Play className="h-3 w-3" /> Practice
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">No cases match.</p>
        )}
      </div>
    </div>
  );
}

export default CaseLibraryPage;
