import { describe, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { caseDatabase, allCases } from '@/data/cases';
import { enhancedCaseDatabase } from '@/data/enhancedCases';
import { additionalCaseDatabase } from '@/data/additionalCases';
import { firstYearCases } from '@/data/firstYearCases';
import { secondYearCases } from '@/data/secondYearCases';
import { litflCaseDatabase } from '@/data/litflCases';
import { severityVariantCases } from '@/data/severityVariantCases';

describe('count', () => {
  it('writes counts', () => {
    const counts = {
      caseDatabase: caseDatabase.length,
      enhancedCaseDatabase: enhancedCaseDatabase.length,
      additionalCaseDatabase: additionalCaseDatabase.length,
      firstYearCases: firstYearCases.length,
      secondYearCases: secondYearCases.length,
      litflCaseDatabase: litflCaseDatabase.length,
      severityVariantCases: severityVariantCases.length,
      allCases: allCases.length,
      uniqueIds: new Set(allCases.map((c) => c.id)).size,
    };
    writeFileSync('/tmp/case-counts.json', JSON.stringify(counts, null, 2));
  });
});
