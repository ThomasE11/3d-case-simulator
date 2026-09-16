import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
import { allCases } from '../src/data/cases';
import {
  exportSessionToPDF,
  getPdfCaseIdentity,
  normalizePdfText,
} from '../src/lib/pdf-export';
import type { CaseScenario, CaseSession } from '../src/types';

const run = promisify(execFile);
const projectRoot = process.cwd();
const auditRoot = resolve(projectRoot, 'tmp/pdfs');

function compact(value: string): string {
  return normalizePdfText(value).replace(/\s+/g, ' ').trim();
}

function assertReportContains(reportText: string, label: string, value: string, caseId: string): void {
  const expected = `${label} ${compact(value)}`;
  if (!reportText.includes(expected)) {
    throw new Error(`${caseId}: report is missing its canonical ${label.toLowerCase()} (${compact(value)}).`);
  }
}

function auditSession(caseData: CaseScenario): CaseSession {
  return {
    id: `pdf-identity-${caseData.id}`,
    caseId: caseData.id,
    studentYear: caseData.yearLevels[0],
    generatedAt: '2026-09-16T00:00:00.000Z',
    completedItems: [],
    notes: '',
    score: 0,
    totalPossible: 0,
  };
}

async function textFromPdf(path: string): Promise<string> {
  const { stdout } = await run('pdftotext', ['-layout', path, '-']);
  return compact(stdout);
}

async function main(): Promise<void> {
  const tempDirectory = await mkdtemp(`${auditRoot}/pdf-case-identity-`);
  let verified = 0;

  try {
    for (const caseData of allCases) {
      const session = auditSession(caseData);
      const blob = await exportSessionToPDF({ session, caseData, download: false });
      const outputPath = resolve(tempDirectory, `${caseData.id}.pdf`);
      await writeFile(outputPath, Buffer.from(await blob.arrayBuffer()));

      const reportText = await textFromPdf(outputPath);
      const identity = getPdfCaseIdentity(caseData);
      assertReportContains(reportText, 'Case ID:', identity.caseId, caseData.id);
      assertReportContains(reportText, 'Case Title:', identity.title, caseData.id);
      assertReportContains(reportText, 'Patient:', identity.patient, caseData.id);
      assertReportContains(reportText, 'Location:', identity.location, caseData.id);
      assertReportContains(reportText, 'Call Reason:', identity.callReason, caseData.id);
      verified += 1;
    }

    const canonicalCase = allCases[0];
    try {
      await exportSessionToPDF({
        session: { ...auditSession(canonicalCase), caseId: 'stale-case-id' },
        caseData: canonicalCase,
        download: false,
      });
      throw new Error('The stale-session guard did not reject a mismatched export.');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.startsWith('Report case mismatch:')) throw error;
    }

    console.log(`PDF case identity audit passed: ${verified}/${allCases.length} reports verified; stale-session guard verified.`);
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
