/**
 * Cross-case posture/presentation audit.
 *
 * Runs the real derivation functions over the entire case library and flags
 * every contradiction where the authored free-text presentation cannot be
 * honoured by the renderer. This is a diagnostic (console.log), not a gate:
 * run with `npx vitest run src/lib/presentation-audit.test.ts`.
 *
 * Findings:
 *  1. GUARD-NOT-RENDERED — a case authors a guarding/clutching presentation
 *     (deriveHandGuardRegion != null) but its mobility is NOT seated/standing,
 *     so the hand-guard pose never fires and the patient renders arms-down.
 *  2. MOBILITY-AMBIGUOUS — position prose maps to the recumbent fallback
 *     without any explicit keyword (the catch-all); likely wrong for many.
 *  3. GUARD-VS-RECUMBENT — patient is recumbent AND guards a region (clinically
 *     contradictory: a supine patient clutching their chest is possible, but
 *     the renderer can't show it — flag for a recumbent guard pose).
 */
import { describe, it, expect } from 'vitest';
import { writeFileSync } from 'node:fs';
import { allCases } from '@/data/cases';
import {
  derivePatientMobility,
  derivePatientPosture,
  deriveHandGuardRegion,
} from '@/lib/patientStaging';

interface Finding {
  kind: string;
  id: string;
  mobility: string;
  posture: string;
  guard: string | null;
  position: string;
  title: string;
}

describe('presentation audit (diagnostic)', () => {
  it('scans all cases for posture/presentation contradictions', () => {
    const guardNotRendered: Finding[] = [];
    const guardRecumbent: Finding[] = [];
    const ambigMobility: Finding[] = [];

    for (const c of allCases) {
      const mobility = derivePatientMobility(c, false);
      const posture = derivePatientPosture(c, { mobility, isInArrest: false, unconscious: false, respiration: null });
      const guard = deriveHandGuardRegion(c);
      const position = (c.initialPresentation?.position ?? '').toLowerCase();

      if (guard) {
        if (mobility !== 'seated' && mobility !== 'standing') {
          guardNotRendered.push({
            kind: 'GUARD-NOT-RENDERED', id: c.id, mobility, posture: posture ?? '', guard,
            position: c.initialPresentation?.position ?? '', title: c.title,
          });
        }
        if (mobility === 'recumbent') {
          guardRecumbent.push({
            kind: 'GUARD-RECUMBENT', id: c.id, mobility, posture: posture ?? '', guard,
            position: c.initialPresentation?.position ?? '', title: c.title,
          });
        }
      }

      // Recumbent fallback with no explicit keyword = likely an authored seat
      // or standing case that slipped the matchers.
      const hasExplicit =
        /\bpacing\b|\bwalking\b|\bwandering\b|\bambulatory\b|\bstanding\b|\bst\bood\b|on (?:their|his|her) feet|\bsitting\b|\bseated\b|semi[- ]recumbent|semi[- ]reclined|\bchair\b|driver(?:'s)? seat|\blap\b|\bbeing held\b|\btripod\b|\bleaning against\b|\blying\b|\bsupine\b|\brecovery position\b|on (?:the )?floor|on (?:the )?ground|\bcollapsed\b|\bfound down\b/.test(position);
      if (mobility === 'recumbent' && !hasExplicit && position) {
        ambigMobility.push({
          kind: 'MOBILITY-AMBIGUOUS', id: c.id, mobility, posture: posture ?? '', guard,
          position: c.initialPresentation?.position ?? '', title: c.title,
        });
      }
    }

    console.log(`\n=== TOTAL CASES: ${allCases.length} ===`);
    console.log(`\n=== GUARD-NOT-RENDERED (guard authored but mobility != seated/standing): ${guardNotRendered.length} ===`);
    for (const f of guardNotRendered) {
      console.log(`  ${f.id.padEnd(16)} ${f.mobility.padEnd(10)} guard=${f.guard} pos="${f.position}"`);
    }

    console.log(`\n=== GUARD-RECUMBENT (recumbent + guarding): ${guardRecumbent.length} ===`);
    for (const f of guardRecumbent) {
      console.log(`  ${f.id.padEnd(16)} guard=${f.guard} pos="${f.position}" title="${f.title}"`);
    }

    console.log(`\n=== MOBILITY-AMBIGUOUS (recumbent fallback, no explicit keyword): ${ambigMobility.length} ===`);
    for (const f of ambigMobility.slice(0, 60)) {
      console.log(`  ${f.id.padEnd(16)} pos="${f.position}"`);
    }
    if (ambigMobility.length > 60) console.log(`  ... and ${ambigMobility.length - 60} more`);

    writeFileSync('/tmp/presentation-audit.json', JSON.stringify({ guardNotRendered, guardRecumbent, ambigMobility }, null, 2));

    // Non-failing: this is a diagnostic scan. Assert the scan ran.
    expect(allCases.length).toBeGreaterThan(100);
  });
});
