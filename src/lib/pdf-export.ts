import { jsPDF } from 'jspdf';
import type { CaseScenario, CaseSession, AppliedTreatment, VitalSigns, SimulationObjective, DebriefingResource, InstructorAssessmentNote } from '@/types';
import { getVideosByFindings, getVideosByCategory, referenceArticles, getYouTubeWatchUrl } from '@/data/localClinicalResources';
import { getRelevantEvidence } from '@/data/evidenceLibrary';
import type { AssessmentDebriefItem } from '@/data/assessmentFramework';
import type { ClinicalManagementDebrief } from '@/lib/caseManagementRealism';
import { patientAgeShortLabel } from '@/lib/patientAgePresentation';

interface ExportOptions {
  session: CaseSession;
  caseData: CaseScenario;
  elapsedTime?: string;
  appliedTreatments?: AppliedTreatment[];
  vitalsHistory?: VitalSigns[];
  instructorNotes?: string;
  instructorAssessmentNotes?: InstructorAssessmentNote[];
  simulationObjective?: SimulationObjective;
  debriefingResources?: DebriefingResource[];
  scoreSummary?: {
    basePercentage: number;
    percentage: number;
    penaltyReasons: { label: string; amount: number }[];
  };
  assessmentItems?: AssessmentDebriefItem[];
  managementDebrief?: ClinicalManagementDebrief;
  /** SmartGrade breakdown — mirrors the on-screen summary so the PDF matches the preview. */
  smartGrade?: {
    overall: number;
    band: { label: string; tone: string };
    dimensions: { key: string; label: string; score: number; summary: string }[];
    strengths: string[];
    improvements: string[];
    narrative: string;
  };
  /** The student's ACTUAL transport/handover decisions (not the case template). */
  transport?: {
    priority: string;
    position: string;
    preAlert: boolean;
    destination: string;
    provisionalDiagnosis: string;
  };
  /** Encounter times — mirrors the on-screen Response Timing block. */
  times?: {
    arrival?: string | null;
    departed?: string | null;
    onScene?: string | null;
    firstIntervention?: string | null;
  };
  /** Skip the browser download when generating a PDF for automated verification. */
  download?: boolean;
}

export interface PdfCaseIdentity {
  caseId: string;
  title: string;
  patient: string;
  location: string;
  callReason: string;
}

/**
 * Convert clinical text to the conservative character set embedded by jsPDF.
 *
 * The earlier implementation removed unsupported punctuation outright. That
 * made a report factually less clear: "Yes — Emergency Department" became
 * "Yes Emergency Department", while inequality signs and microgram units
 * could lose their meaning. Keep the PDF ASCII-safe without discarding the
 * clinical relationship expressed by the source text.
 */
export function normalizePdfText(text: string | undefined | null): string {
  if (!text) return '';
  return String(text)
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/\u2192/g, '->')
    .replace(/\u2190/g, '<-')
    .replace(/\u2264/g, '<=')
    .replace(/\u2265/g, '>=')
    .replace(/[\u00B5\u03BC](?=g\b)/gi, 'mc')
    .replace(/\u00B0/g, ' deg')
    .replace(/[^\x20-\x7E\n]/g, '');
}

/** The canonical case facts used in every report and the identity audit. */
export function getPdfCaseIdentity(caseData: CaseScenario): PdfCaseIdentity {
  return {
    caseId: caseData.id,
    title: caseData.title,
    patient: `${patientAgeShortLabel(caseData.patientInfo.age)} ${caseData.patientInfo.gender}`,
    location: caseData.dispatchInfo.location,
    callReason: caseData.dispatchInfo.callReason,
  };
}

export function createPdfReportFilename(caseData: CaseScenario, generatedAt = new Date()): string {
  const date = generatedAt.toISOString().split('T')[0];
  return `Paramedic-Case-${caseData.id}-${date}.pdf`;
}

// ==========================================================================
// DESIGN CONSTANTS - Three font sizes only, consistent spacing
// ==========================================================================
const FONT = {
  HEADER: 12,       // Section headers - bold
  BODY: 9,          // Body text - normal
  LABEL: 8,         // Labels, metadata, small text - normal
} as const;

const LINE_HEIGHT = {
  HEADER: 5.5,      // Line height for 12pt
  BODY: 4.2,        // Line height for 9pt
  LABEL: 3.8,       // Line height for 8pt
} as const;

const SECTION_GAP = 10;       // Consistent 10mm gap before every section
const PAGE_BORDER_INSET = 8;  // Inset for the subtle gray page border

const COLOR = {
  PRIMARY: [59, 130, 246] as [number, number, number],
  BLACK: [0, 0, 0] as [number, number, number],
  BODY_TEXT: [50, 50, 50] as [number, number, number],
  MUTED: [100, 100, 100] as [number, number, number],
  LIGHT_MUTED: [150, 150, 150] as [number, number, number],
  GREEN: [34, 197, 94] as [number, number, number],
  RED: [220, 38, 38] as [number, number, number],
  ORANGE: [234, 146, 60] as [number, number, number],
  YELLOW: [234, 179, 8] as [number, number, number],
  PURPLE: [139, 92, 246] as [number, number, number],
  WHITE: [255, 255, 255] as [number, number, number],
  BG_LIGHT: [248, 250, 252] as [number, number, number],
  BG_GREEN: [240, 253, 244] as [number, number, number],
  BG_RED: [254, 242, 242] as [number, number, number],
  BG_YELLOW: [255, 251, 235] as [number, number, number],
  BG_BLUE: [239, 246, 255] as [number, number, number],
  BORDER_GRAY: [210, 210, 210] as [number, number, number],
  ROW_ALT: [245, 245, 245] as [number, number, number],
};

/**
 * Generate a PDF export of the session summary
 */
export async function exportSessionToPDF(options: ExportOptions): Promise<Blob> {
  const { session, caseData, elapsedTime } = options;
  if (session.caseId !== caseData.id) {
    throw new Error(
      `Report case mismatch: session is for ${session.caseId}, but the active case is ${caseData.id}. Restart the encounter before exporting.`,
    );
  }
  const completedItemIds = Array.isArray(session.completedItems) ? session.completedItems : [];
  const caseIdentity = getPdfCaseIdentity(caseData);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper: check if we need a new page
  const checkPageBreak = (requiredSpace: number): boolean => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = margin + 5; // Leave room for page border top
      return true;
    }
    return false;
  };

  const sanitizeText = normalizePdfText;

  // Helper: add wrapped text at current yPosition, auto page-breaking
  const addWrappedText = (
    text: string,
    fontSize: number,
    lineHeight: number,
    fontStyle: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'normal',
    rgbColor: [number, number, number] = COLOR.BODY_TEXT,
    xOffset = 0,
  ): void => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(rgbColor[0], rgbColor[1], rgbColor[2]);

    const lines = doc.splitTextToSize(text, contentWidth - xOffset) as string[];
    for (const line of lines) {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = margin + 5;
      }
      doc.text(line, margin + xOffset, yPosition);
      yPosition += lineHeight;
    }
  };

  // Helper: add a section header with consistent spacing
  const addSectionHeader = (text: string): void => {
    yPosition += SECTION_GAP;
    // Reserve enough room for the heading and the first meaningful content
    // row so section titles are not stranded at the bottom of a page.
    checkPageBreak(28);
    // Draw blue accent line
    doc.setDrawColor(COLOR.PRIMARY[0], COLOR.PRIMARY[1], COLOR.PRIMARY[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6; // Fixed gap below line before text
    // Header text
    doc.setFontSize(FONT.HEADER);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLOR.PRIMARY[0], COLOR.PRIMARY[1], COLOR.PRIMARY[2]);
    doc.text(sanitizeText(text), margin, yPosition);
    yPosition += LINE_HEIGHT.HEADER + 2; // Fixed gap after header text
  };

  // Helper: add a filled rounded rect
  const addFilledRoundedRect = (x: number, y: number, w: number, h: number, r: number, rgbColor: [number, number, number]): void => {
    doc.setFillColor(rgbColor[0], rgbColor[1], rgbColor[2]);
    doc.roundedRect(x, y, w, h, r, r, 'F');
  };

  // Helper: add a stroked rounded rect
  const addStrokeRoundedRect = (x: number, y: number, w: number, h: number, r: number, rgbColor: [number, number, number]): void => {
    doc.setDrawColor(rgbColor[0], rgbColor[1], rgbColor[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, r, r, 'S');
  };

  // Helper: add text at a specific position (no yPosition mutation)
  const addTextAt = (
    text: string,
    x: number,
    y: number,
    fontSize: number,
    fontStyle: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'normal',
    rgbColor: [number, number, number] = COLOR.BLACK,
  ): void => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(rgbColor[0], rgbColor[1], rgbColor[2]);
    doc.text(text, x, y);
  };

  // Helper: add centered text at a specific y
  const addCenteredText = (
    text: string,
    y: number,
    fontSize: number,
    fontStyle: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'normal',
    rgbColor: [number, number, number] = COLOR.BLACK,
  ): void => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(rgbColor[0], rgbColor[1], rgbColor[2]);
    doc.text(text, pageWidth / 2, y, { align: 'center' } as never);
  };

  // Helper: add a clickable link
  const addClickableLink = (text: string, url: string, x: number, y: number): void => {
    doc.setFontSize(FONT.BODY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLOR.PRIMARY[0], COLOR.PRIMARY[1], COLOR.PRIMARY[2]);
    const maxWidth = contentWidth - (x - margin) - 2;
    const truncated = (doc.splitTextToSize(text, maxWidth) as string[])[0];
    doc.textWithLink(truncated, x, y, { url });
  };

  // ========== HEADER BANNER ==========
  addFilledRoundedRect(0, 0, pageWidth, 32, 0, COLOR.PRIMARY);

  doc.setTextColor(255, 255, 255);
  addCenteredText('UAE Paramedic Case Generator', 13, 18, 'bold', COLOR.WHITE);
  addCenteredText('Session Summary Report', 21, FONT.BODY, 'normal', COLOR.WHITE);
  addCenteredText(`Generated: ${new Date().toLocaleString('en-GB')}`, 28, FONT.LABEL, 'normal', COLOR.WHITE);

  yPosition = 40;

  // ========== CASE INFORMATION ==========
  addSectionHeader('Case Information');

  const caseInfo = [
    ['Case ID:', sanitizeText(caseIdentity.caseId)],
    ['Case Title:', sanitizeText(caseIdentity.title)],
    ['Category:', sanitizeText(caseData.category)],
    ['Priority:', caseData.priority.toUpperCase()],
    ['Complexity:', caseData.complexity.toUpperCase()],
    ['Year Level:', session.studentYear],
    ['Patient:', sanitizeText(caseIdentity.patient)],
    ['Location:', sanitizeText(caseIdentity.location)],
  ];

  caseInfo.forEach(([label, value]) => {
    // Wrap long values (e.g. long case titles, verbose locations). Previously
    // overflowed the right margin because addTextAt doesn't wrap.
    const valueLines = doc.splitTextToSize(value, contentWidth - 32) as string[];
    checkPageBreak(Math.max(6, valueLines.length * LINE_HEIGHT.BODY + 1));
    addTextAt(label, margin, yPosition, FONT.BODY, 'bold', COLOR.BLACK);
    valueLines.forEach((line: string, i: number) => {
      addTextAt(line, margin + 30, yPosition + i * LINE_HEIGHT.BODY, FONT.BODY, 'normal', COLOR.BODY_TEXT);
    });
    yPosition += valueLines.length * LINE_HEIGHT.BODY + 1;
  });

  // ========== SIMULATION OBJECTIVE ==========
  if (options.simulationObjective) {
    addSectionHeader('Simulation Objective');

    const objLines = doc.splitTextToSize(sanitizeText(options.simulationObjective.primaryObjective), contentWidth - 30) as string[];
    const skillsText = sanitizeText(options.simulationObjective.skillsFocus.join(', '));
    const skillLines = doc.splitTextToSize(skillsText, contentWidth - 30) as string[];
    const objectiveHeight = Math.max(
      16,
      7 + objLines.length * LINE_HEIGHT.BODY + skillLines.length * LINE_HEIGHT.LABEL + 4,
    );
    checkPageBreak(objectiveHeight + 4);
    addFilledRoundedRect(margin, yPosition, contentWidth, objectiveHeight, 2, COLOR.BG_BLUE);
    addStrokeRoundedRect(margin, yPosition, contentWidth, objectiveHeight, 2, COLOR.PRIMARY);

    addTextAt('Objective:', margin + 3, yPosition + 5, FONT.BODY, 'bold', COLOR.PRIMARY);
    objLines.forEach((line: string, index: number) => {
      addTextAt(line, margin + 25, yPosition + 5 + index * LINE_HEIGHT.BODY, FONT.BODY, 'normal', COLOR.BODY_TEXT);
    });

    const skillsY = yPosition + 7 + objLines.length * LINE_HEIGHT.BODY;
    addTextAt('Skills Focus:', margin + 3, skillsY, FONT.LABEL, 'bold', COLOR.MUTED);
    skillLines.forEach((line: string, index: number) => {
      addTextAt(line, margin + 25, skillsY + index * LINE_HEIGHT.LABEL, FONT.LABEL, 'normal', COLOR.MUTED);
    });

    yPosition += objectiveHeight + 4;
  }

  // ========== DISPATCH INFORMATION ==========
  addSectionHeader('Dispatch Information');

  const dispatchLines = [
    `Call Reason: ${sanitizeText(caseIdentity.callReason)}`,
    `Time of Day: ${sanitizeText(caseData.dispatchInfo.timeOfDay)}`,
    `Caller Info: ${sanitizeText(caseData.dispatchInfo.callerInfo)}`,
  ];

  dispatchLines.forEach((line) => {
    checkPageBreak(6);
    const lines = doc.splitTextToSize(line, contentWidth) as string[];
    for (const l of lines) {
      addTextAt(l, margin, yPosition, FONT.BODY, 'normal', COLOR.BODY_TEXT);
      yPosition += LINE_HEIGHT.BODY + 0.5;
    }
  });

  // ========== VITAL SIGNS ==========
  addSectionHeader('Initial Vital Signs');

  const vitals = caseData.vitalSignsProgression.initial;
  const vitalSignsParts: string[] = [
    `BP: ${vitals.bp}`,
    `Pulse: ${vitals.pulse} bpm`,
    `RR: ${vitals.respiration}/min`,
    `SpO2: ${vitals.spo2}%`,
  ];
  if (vitals.gcs !== undefined) vitalSignsParts.push(`GCS: ${vitals.gcs}/15`);
  if (vitals.temperature !== undefined) vitalSignsParts.push(`Temp: ${vitals.temperature}C`);
  if (vitals.bloodGlucose !== undefined) vitalSignsParts.push(`Glucose: ${vitals.bloodGlucose} mmol/L`);

  addWrappedText(vitalSignsParts.join('   |   '), FONT.BODY, LINE_HEIGHT.BODY);

  // ========== PERFORMANCE SUMMARY ==========
  // Keep the heading attached to the score card. The earlier generic section
  // reserve left just enough room for the heading, then moved the card to the
  // next page, creating an orphaned "Performance Summary" at page bottom.
  checkPageBreak(SECTION_GAP + 48);
  addSectionHeader('Performance Summary');

  const basePercentage = options.scoreSummary?.basePercentage
    ?? (session.totalPossible > 0 ? Math.round((session.score / session.totalPossible) * 100) : 0);

  // Use the live session's authoritative score summary when supplied. Older
  // callers still fall back to checklist-based penalty calculation.
  const pdfMissedItems = (caseData.studentChecklist || []).filter(item =>
    !completedItemIds.includes(item.id) && item.yearLevel?.includes(session.studentYear)
  );
  const pdfCriticalMissed = pdfMissedItems.filter(item => item.critical);
  const penaltyReasons: { label: string; amount: number }[] = options.scoreSummary
    ? [...options.scoreSummary.penaltyReasons]
    : [];
  let penaltyTotal = penaltyReasons.reduce((sum, reason) => sum + reason.amount, 0);

  if (!options.scoreSummary && pdfCriticalMissed.length > 0) {
    const amt = Math.min(pdfCriticalMissed.length * 5, 25);
    penaltyReasons.push({ label: `${pdfCriticalMissed.length} critical action${pdfCriticalMissed.length > 1 ? 's' : ''} missed`, amount: amt });
    penaltyTotal += amt;
  }

  const pdfFinalVitals = options.vitalsHistory && options.vitalsHistory.length > 0 ? options.vitalsHistory[options.vitalsHistory.length - 1] : null;
  if (!options.scoreSummary && pdfFinalVitals) {
    if (pdfFinalVitals.spo2 !== undefined && pdfFinalVitals.spo2 < 90) {
      penaltyReasons.push({ label: `SpO2 critically low at ${pdfFinalVitals.spo2}%`, amount: 10 });
      penaltyTotal += 10;
    } else if (pdfFinalVitals.spo2 !== undefined && pdfFinalVitals.spo2 < 94) {
      penaltyReasons.push({ label: `SpO2 below target at ${pdfFinalVitals.spo2}%`, amount: 5 });
      penaltyTotal += 5;
    }
    if (pdfFinalVitals.respiration !== undefined && (pdfFinalVitals.respiration > 30 || pdfFinalVitals.respiration < 8)) {
      penaltyReasons.push({ label: `Respiratory rate dangerous at ${pdfFinalVitals.respiration}/min`, amount: 5 });
      penaltyTotal += 5;
    }
    if (pdfFinalVitals.pulse !== undefined && (pdfFinalVitals.pulse > 150 || pdfFinalVitals.pulse < 40)) {
      penaltyReasons.push({ label: `Heart rate dangerous at ${pdfFinalVitals.pulse} bpm`, amount: 5 });
      penaltyTotal += 5;
    }
  }

  const percentage = options.scoreSummary?.percentage ?? Math.max(0, basePercentage - penaltyTotal);

  let grade = 'Needs Improvement';
  let gradeColor: [number, number, number] = COLOR.RED;
  if (percentage >= 90) {
    grade = 'Excellent';
    gradeColor = COLOR.GREEN;
  } else if (percentage >= 75) {
    grade = 'Good';
    gradeColor = COLOR.PRIMARY;
  } else if (percentage >= 60) {
    grade = 'Satisfactory';
    gradeColor = COLOR.YELLOW;
  }

  checkPageBreak(32);

  const scoreBoxY = yPosition;
  const scoreBoxHeight = 28;

  // Score card background
  addFilledRoundedRect(margin, scoreBoxY, contentWidth, scoreBoxHeight, 3, COLOR.BG_LIGHT);
  addStrokeRoundedRect(margin, scoreBoxY, contentWidth, scoreBoxHeight, 3, COLOR.BORDER_GRAY);

  // Score circle (centered vertically in box)
  const circleY = scoreBoxY + scoreBoxHeight / 2 - 10;
  addFilledRoundedRect(margin + 4, circleY, 20, 20, 10, gradeColor);

  // Percentage text centered in circle
  const pctText = `${percentage}%`;
  addTextAt(pctText, margin + 14, circleY + 12, FONT.HEADER, 'bold', COLOR.WHITE);

  // Grade info to the right of circle
  addTextAt(grade, margin + 30, scoreBoxY + 10, FONT.HEADER, 'bold', gradeColor);
  addTextAt(
    `${session.score} / ${session.totalPossible} points`,
    margin + 30, scoreBoxY + 16, FONT.BODY, 'normal', COLOR.MUTED,
  );

  if (elapsedTime) {
    addTextAt(`Time: ${elapsedTime}`, margin + 30, scoreBoxY + 22, FONT.BODY, 'normal', COLOR.MUTED);
  }

  yPosition = scoreBoxY + scoreBoxHeight + 3;

  // Penalty breakdown (if any)
  if (penaltyTotal > 0) {
    const penaltyBoxHeight = 14 + penaltyReasons.length * 5;
    checkPageBreak(penaltyBoxHeight + 4);
    const penaltyBoxTop = yPosition;
    addFilledRoundedRect(margin, penaltyBoxTop, contentWidth, penaltyBoxHeight, 2, [255, 243, 224] as unknown as [number, number, number]);
    addStrokeRoundedRect(margin, penaltyBoxTop, contentWidth, penaltyBoxHeight, 2, COLOR.YELLOW);
    addTextAt(`Base score: ${basePercentage}%`, margin + 4, penaltyBoxTop + 6, FONT.LABEL, 'normal', COLOR.MUTED);
    let penaltyRowY = penaltyBoxTop + 11;
    penaltyReasons.forEach(reason => {
      addTextAt(`-${reason.amount}%`, margin + 4, penaltyRowY, FONT.LABEL, 'bold', COLOR.RED);
      addTextAt(reason.label, margin + 18, penaltyRowY, FONT.LABEL, 'normal', COLOR.RED);
      penaltyRowY += 5;
    });
    addTextAt(`Adjusted score: ${percentage}%`, margin + 4, penaltyBoxTop + penaltyBoxHeight - 3, FONT.LABEL, 'bold', COLOR.BODY_TEXT);
    yPosition = penaltyBoxTop + penaltyBoxHeight + 3;
  }

  // ========== PERFORMANCE BREAKDOWN (mirrors the on-screen SmartGrade) ==========
  if (options.smartGrade) {
    const sg = options.smartGrade;
    const dimColor = (s: number): [number, number, number] =>
      s >= 80 ? COLOR.GREEN : s >= 60 ? COLOR.PRIMARY : s >= 40 ? COLOR.YELLOW : COLOR.RED;
    checkPageBreak(SECTION_GAP + 40);
    addSectionHeader('Performance Breakdown');

    addTextAt(`Overall: ${sg.band.label} (${sg.overall}%)`, margin, yPosition, FONT.BODY, 'bold', COLOR.PRIMARY);
    yPosition += LINE_HEIGHT.BODY + 1;
    (doc.splitTextToSize(sanitizeText(sg.narrative), contentWidth) as string[]).forEach(line => {
      addTextAt(line, margin, yPosition, FONT.LABEL, 'normal', COLOR.MUTED);
      yPosition += LINE_HEIGHT.LABEL;
    });
    yPosition += 2;

    sg.dimensions.forEach(d => {
      checkPageBreak(14);
      addTextAt(d.label, margin, yPosition, FONT.BODY, 'bold', COLOR.BODY_TEXT);
      addTextAt(`${d.score}%`, margin + contentWidth - 12, yPosition, FONT.BODY, 'bold', dimColor(d.score));
      yPosition += LINE_HEIGHT.BODY - 1;
      addFilledRoundedRect(margin, yPosition, contentWidth, 2, 1, COLOR.BORDER_GRAY);
      addFilledRoundedRect(margin, yPosition, Math.max(0.5, (contentWidth * d.score) / 100), 2, 1, dimColor(d.score));
      yPosition += 4;
      (doc.splitTextToSize(sanitizeText(d.summary), contentWidth) as string[]).slice(0, 2).forEach(line => {
        addTextAt(line, margin, yPosition, FONT.LABEL, 'normal', COLOR.MUTED);
        yPosition += LINE_HEIGHT.LABEL;
      });
      yPosition += 2;
    });

    if (sg.strengths.length > 0) {
      checkPageBreak(8 + sg.strengths.length * 4);
      addTextAt('Strengths', margin, yPosition, FONT.LABEL, 'bold', COLOR.GREEN);
      yPosition += LINE_HEIGHT.LABEL + 1;
      sg.strengths.forEach(s => {
        (doc.splitTextToSize(`+ ${sanitizeText(s)}`, contentWidth - 4) as string[]).forEach(line => {
          addTextAt(line, margin + 2, yPosition, FONT.LABEL, 'normal', COLOR.BODY_TEXT);
          yPosition += LINE_HEIGHT.LABEL;
        });
      });
      yPosition += 1;
    }
    if (sg.improvements.length > 0) {
      checkPageBreak(8 + sg.improvements.length * 4);
      addTextAt('Focus Next', margin, yPosition, FONT.LABEL, 'bold', COLOR.ORANGE);
      yPosition += LINE_HEIGHT.LABEL + 1;
      sg.improvements.forEach(s => {
        (doc.splitTextToSize(`> ${sanitizeText(s)}`, contentWidth - 4) as string[]).forEach(line => {
          addTextAt(line, margin + 2, yPosition, FONT.LABEL, 'normal', COLOR.BODY_TEXT);
          yPosition += LINE_HEIGHT.LABEL;
        });
      });
      yPosition += 3;
    }
  }

  // ========== TRANSPORT & HANDOVER (the student's actual decisions) ==========
  if (options.transport) {
    const t = options.transport;
    const prio = t.priority === 'lights' ? 'Lights & Sirens'
      : t.priority === 'urgent' ? 'Urgent (no L&S)'
        : t.priority === 'routine' ? 'Routine' : t.priority;
    const tm = options.times || {};
    const rows: [string, string][] = [
      ['Priority', prio],
      ['Position', t.position],
      ['Pre-alert', t.preAlert ? `Yes — ${t.destination || 'receiving hospital'}` : 'No pre-alert'],
      ['Working Dx', t.provisionalDiagnosis],
      ['Arrival on scene', tm.arrival || ''],
      ['Departed (handover)', tm.departed || ''],
      ['On-scene time', tm.onScene || options.elapsedTime || '—'],
      ['Time to first Rx', tm.firstIntervention || ''],
    ];
    const visible = rows.filter(([, v]) => v && String(v).trim());
    checkPageBreak(SECTION_GAP + visible.length * 6 + 6);
    addSectionHeader('Transport & Handover');
    visible.forEach(([label, val]) => {
      addTextAt(label, margin, yPosition, FONT.BODY, 'bold', COLOR.BODY_TEXT);
      const vLines = doc.splitTextToSize(sanitizeText(String(val)), contentWidth - 42) as string[];
      vLines.forEach((line, i) => addTextAt(line, margin + 42, yPosition + i * LINE_HEIGHT.BODY, FONT.BODY, 'normal', COLOR.MUTED));
      yPosition += Math.max(LINE_HEIGHT.BODY, vLines.length * LINE_HEIGHT.BODY) + 1.5;
    });
    yPosition += 3;
  }

  // ========== COMPLETED ACTIONS ==========
  const completedItems = options.assessmentItems?.length
    ? options.assessmentItems
        .filter(item => item.status === 'completed' || item.status === 'bonus')
        .map(item => ({ description: item.label, critical: item.critical }))
    : (caseData.studentChecklist || []).filter(item => completedItemIds.includes(item.id));
  const missedItems = options.assessmentItems?.length
    ? options.assessmentItems
        .filter(item => item.status === 'missed-required' || item.status === 'missed-recommended')
        .map(item => ({ description: item.label, critical: item.critical }))
    : (caseData.studentChecklist || []).filter(item =>
        !completedItemIds.includes(item.id) && item.yearLevel?.includes(session.studentYear)
      );
  const criticalMissedItems = missedItems.filter(item => item.critical);

  if (completedItems.length > 0) {
    checkPageBreak(SECTION_GAP + 24);
    addSectionHeader('Completed Actions');

    completedItems.forEach((item) => {
      const text = sanitizeText(item.description) + (item.critical ? ' (Critical)' : '');
      const lines = doc.splitTextToSize(text, contentWidth - 12) as string[];
      // Grow the box to fit every wrapped line — previously only lines[0] was
      // rendered into a fixed 6mm pill, which silently truncated long items
      // and overflowed visually.
      const boxH = Math.max(6, lines.length * LINE_HEIGHT.BODY + 2);
      checkPageBreak(boxH + 3);

      addFilledRoundedRect(margin, yPosition - 1, contentWidth, boxH, 1, COLOR.BG_GREEN);
      addStrokeRoundedRect(margin, yPosition - 1, contentWidth, boxH, 1, COLOR.GREEN);

      addTextAt('+', margin + 3, yPosition + 3, FONT.BODY, 'bold', COLOR.GREEN);
      lines.forEach((line: string, i: number) => {
        addTextAt(line, margin + 8, yPosition + 3 + (i * LINE_HEIGHT.BODY), FONT.BODY, 'normal', COLOR.BODY_TEXT);
      });

      yPosition += boxH + 2;
    });
  }

  // ========== CRITICAL MISSED ACTIONS ==========
  if (criticalMissedItems.length > 0) {
    addSectionHeader('CRITICAL - Missed Actions');

    addFilledRoundedRect(margin, yPosition - 1, contentWidth, 6, 0, COLOR.BG_RED);
    addTextAt('(!) The following critical actions were missed:', margin + 3, yPosition + 3, FONT.BODY, 'bold', COLOR.RED);
    yPosition += 9;

    criticalMissedItems.forEach((item) => {
      checkPageBreak(12);

      const descLines = doc.splitTextToSize(sanitizeText(item.description), contentWidth - 12) as string[];
      const boxH = Math.max(8, descLines.length * LINE_HEIGHT.BODY + 3);

      addStrokeRoundedRect(margin, yPosition, contentWidth, boxH, 2, COLOR.RED);
      addTextAt('x', margin + 3, yPosition + 5, FONT.BODY, 'bold', COLOR.RED);

      descLines.forEach((line: string, i: number) => {
        addTextAt(line, margin + 8, yPosition + 5 + (i * LINE_HEIGHT.BODY), FONT.BODY, 'normal', COLOR.BODY_TEXT);
      });

      yPosition += boxH + 3;
    });
  }

  // ========== OTHER MISSED ITEMS ==========
  const nonCriticalMissed = missedItems.filter(item => !item.critical);
  if (nonCriticalMissed.length > 0) {
    addSectionHeader('Other Items to Review');

    nonCriticalMissed.forEach((item) => {
      // Wrap and grow instead of silently truncating at 90 chars — some of
      // the audited checklist items (paramedic scope clarifications, etc.)
      // run 150+ chars and were getting "..." in the middle of a clinical
      // fact.
      const lines = doc.splitTextToSize(sanitizeText(item.description), contentWidth - 12) as string[];
      const boxH = Math.max(6, lines.length * LINE_HEIGHT.BODY + 2);
      checkPageBreak(boxH + 3);

      addStrokeRoundedRect(margin, yPosition - 1, contentWidth, boxH, 1, COLOR.ORANGE);
      addTextAt('-', margin + 3, yPosition + 3, FONT.BODY, 'bold', COLOR.ORANGE);
      lines.forEach((line: string, i: number) => {
        addTextAt(line, margin + 8, yPosition + 3 + (i * LINE_HEIGHT.BODY), FONT.BODY, 'normal', COLOR.MUTED);
      });

      yPosition += boxH + 2;
    });
  }

  // ========== KEY LEARNING POINTS ==========
  if (caseData.teachingPoints && caseData.teachingPoints.length > 0) {
    addSectionHeader('Key Learning Points');

    caseData.teachingPoints.forEach((point, i) => {
      checkPageBreak(10);

      addFilledRoundedRect(margin, yPosition - 1, 6, 6, 1, COLOR.BG_BLUE);
      addTextAt(`${i + 1}`, margin + 2.5, yPosition + 3, FONT.BODY, 'bold', COLOR.PRIMARY);

      const lines = doc.splitTextToSize(sanitizeText(point), contentWidth - 12) as string[];
      lines.forEach((line: string, idx: number) => {
        addTextAt(line, margin + 10, yPosition + 3 + (idx * LINE_HEIGHT.BODY), FONT.BODY, 'normal', COLOR.BODY_TEXT);
      });

      yPosition += lines.length * LINE_HEIGHT.BODY + 4;
    });
  }

  // ========== APPLIED TREATMENTS ==========
  if (options.appliedTreatments && options.appliedTreatments.length > 0) {
    addSectionHeader('Applied Treatments & Interventions');

    options.appliedTreatments.forEach((treatment, index) => {
      const treatmentSearchText = `${treatment.name || ''} ${treatment.id}`.toLowerCase();
      const flaggedPenalty = penaltyReasons.find(reason => {
        const penaltyText = reason.label.toLowerCase();
        return treatmentSearchText
          .split(/\s+/)
          .some(term => term.length >= 5 && penaltyText.includes(term));
      });
      const treatmentFill = flaggedPenalty ? COLOR.BG_YELLOW : COLOR.BG_GREEN;
      const treatmentAccent = flaggedPenalty ? COLOR.ORANGE : COLOR.GREEN;

      // Clean description: strip vital-change suffixes like "-- SpO2: 85% -> 92%, HR: 120 -> 105."
      const cleanDesc = sanitizeText(treatment.description || treatment.name)
        // Strip "-- VitalSign: old -> new, VitalSign: old -> new." patterns
        .replace(/\s*[-—]{1,3}\s*(?:[A-Za-z][A-Za-z\d /]*:\s*[\d./%]+\s*(?:->|->)\s*[\d./%]+(?:\s*,\s*)?)+\.?/g, '')
        // Fallback: strip individual vital change mentions
        .replace(/\s*(?:HR|SpO2|BP|RR|GCS|Temp|Temperature|EtCO2):\s*[\d./%]+\s*->\s*[\d./%]+\.?/gi, '')
        // Clean up trailing/double punctuation
        .replace(/\.{2,}/g, '.')
        .replace(/\.\s*$/, '')
        .replace(/,\s*$/, '')
        .trim();

      // Wrap the description within the box width; grow the box around the
      // number of wrapped lines instead of fixed 14mm (which clipped long
      // treatment names — e.g. "IM Adrenaline 500mcg 1:1000 anterolateral
      // thigh" wraps to two lines).
      const descLines = doc.splitTextToSize(cleanDesc, contentWidth - 18) as string[];
      const boxH = Math.max(14, descLines.length * LINE_HEIGHT.BODY + 9); // +9 for time line + padding
      checkPageBreak(boxH + 4);

      addFilledRoundedRect(margin, yPosition, contentWidth, boxH, 2, treatmentFill);
      addStrokeRoundedRect(margin, yPosition, contentWidth, boxH, 2, treatmentAccent);

      addTextAt(`${index + 1}.`, margin + 3, yPosition + 5, FONT.BODY, 'bold', treatmentAccent);
      descLines.forEach((line: string, i: number) => {
        addTextAt(line, margin + 10, yPosition + 5 + (i * LINE_HEIGHT.BODY), FONT.BODY, 'bold', COLOR.BLACK);
      });

      const timeStr = new Date(treatment.appliedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      addTextAt(
        `Applied at: ${timeStr}`,
        margin + 10,
        yPosition + 5 + descLines.length * LINE_HEIGHT.BODY + 3,
        FONT.LABEL, 'normal', COLOR.MUTED,
      );

      yPosition += boxH + 3;

      // Treatment effects
      const treatmentEffects = Array.isArray(treatment.effects) ? treatment.effects : [];
      if (treatmentEffects.length > 0) {
        treatmentEffects.forEach((effect) => {
          checkPageBreak(6);

          addTextAt('>', margin + 6, yPosition, FONT.LABEL, 'normal', COLOR.MUTED);
          addTextAt(sanitizeText(`${effect.vitalSign}:`), margin + 12, yPosition, FONT.BODY, 'bold', COLOR.BODY_TEXT);
          addTextAt(sanitizeText(String(effect.oldValue)), margin + 45, yPosition, FONT.BODY, 'normal', COLOR.RED);
          addTextAt('->', margin + 65, yPosition, FONT.BODY, 'bold', COLOR.MUTED);
          addTextAt(sanitizeText(String(effect.newValue)), margin + 72, yPosition, FONT.BODY, 'bold', COLOR.GREEN);

          yPosition += LINE_HEIGHT.BODY + 1;
        });
        yPosition += 2;
      }
    });
  }

  // ========== CLINICAL MANAGEMENT LOOP ==========
  if (options.managementDebrief && options.managementDebrief.totalCount > 0) {
    addSectionHeader('Clinical Management Loop');

    const loop = options.managementDebrief;
    const loopTone = loop.pendingCount > 0 ? COLOR.ORANGE : COLOR.GREEN;
    checkPageBreak(18);
    addFilledRoundedRect(margin, yPosition, contentWidth, 14, 2, loop.pendingCount > 0 ? COLOR.BG_YELLOW : COLOR.BG_GREEN);
    addStrokeRoundedRect(margin, yPosition, contentWidth, 14, 2, loopTone);
    addTextAt(
      sanitizeText(loop.summary),
      margin + 4,
      yPosition + 6,
      FONT.BODY,
      'bold',
      loopTone,
    );
    addTextAt(
      `Closed: ${loop.reassessedCount}  |  Pending: ${loop.pendingCount}`,
      margin + 4,
      yPosition + 11,
      FONT.LABEL,
      'normal',
      COLOR.MUTED,
    );
    yPosition += 18;

    if (loop.pendingItems.length > 0) {
      checkPageBreak(8);
      addTextAt('Pending follow-up', margin, yPosition, FONT.BODY, 'bold', COLOR.ORANGE);
      yPosition += LINE_HEIGHT.BODY + 2;
      loop.pendingItems.forEach(item => {
        const lines = doc.splitTextToSize(
          sanitizeText(`${item.label}: ${item.reassessmentPrompt}`),
          contentWidth - 12,
        ) as string[];
        const boxH = Math.max(7, lines.length * LINE_HEIGHT.BODY + 3);
        checkPageBreak(boxH + 3);
        addStrokeRoundedRect(margin, yPosition - 1, contentWidth, boxH, 1, COLOR.ORANGE);
        addTextAt('!', margin + 3, yPosition + 3, FONT.BODY, 'bold', COLOR.ORANGE);
        lines.forEach((line: string, i: number) => {
          addTextAt(line, margin + 9, yPosition + 3 + i * LINE_HEIGHT.BODY, FONT.BODY, 'normal', COLOR.BODY_TEXT);
        });
        yPosition += boxH + 2;
      });
    }

    if (loop.reassessedItems.length > 0) {
      yPosition += 1;
      checkPageBreak(8);
      addTextAt('Closed treatment loops', margin, yPosition, FONT.BODY, 'bold', COLOR.GREEN);
      yPosition += LINE_HEIGHT.BODY + 2;
      loop.reassessedItems.slice(0, 8).forEach(item => {
        const lines = doc.splitTextToSize(
          sanitizeText(`${item.label}: follow-up documented`),
          contentWidth - 12,
        ) as string[];
        const boxH = Math.max(7, lines.length * LINE_HEIGHT.BODY + 3);
        checkPageBreak(boxH + 3);
        addStrokeRoundedRect(margin, yPosition - 1, contentWidth, boxH, 1, COLOR.GREEN);
        addTextAt('+', margin + 3, yPosition + 3, FONT.BODY, 'bold', COLOR.GREEN);
        lines.forEach((line: string, i: number) => {
          addTextAt(line, margin + 9, yPosition + 3 + i * LINE_HEIGHT.BODY, FONT.BODY, 'normal', COLOR.BODY_TEXT);
        });
        yPosition += boxH + 2;
      });
    }
  }

  // ========== MANAGEMENT SUMMARY ==========
  const mgmt = caseData.managementPathway;
  if (mgmt && (mgmt.immediate.length > 0 || mgmt.definitive.length > 0 || mgmt.monitoring.length > 0)) {
    addSectionHeader('Management Summary');

    const sections: { label: string; items: string[]; color: [number, number, number] }[] = [];
    if (mgmt.immediate.length > 0) sections.push({ label: 'Immediate', items: mgmt.immediate, color: COLOR.RED });
    if (mgmt.definitive.length > 0) sections.push({ label: 'Definitive', items: mgmt.definitive, color: COLOR.PRIMARY });
    if (mgmt.monitoring.length > 0) sections.push({ label: 'Monitoring', items: mgmt.monitoring, color: COLOR.GREEN });
    if (mgmt.transportConsiderations && mgmt.transportConsiderations.length > 0) {
      sections.push({ label: 'Transport', items: mgmt.transportConsiderations, color: COLOR.YELLOW });
    }

    sections.forEach(({ label, items, color }) => {
      checkPageBreak(6 + items.length * 5);
      addTextAt(label, margin + 2, yPosition + 3, FONT.BODY, 'bold', color);
      yPosition += 5;
      items.forEach(item => {
        checkPageBreak(6);
        const lines = doc.splitTextToSize(sanitizeText(item), contentWidth - 12) as string[];
        addTextAt('•', margin + 4, yPosition + 3, FONT.BODY, 'normal', COLOR.MUTED);
        lines.forEach((line: string, idx: number) => {
          addTextAt(line, margin + 10, yPosition + 3 + (idx * LINE_HEIGHT.BODY), FONT.BODY, 'normal', COLOR.BODY_TEXT);
        });
        yPosition += lines.length * LINE_HEIGHT.BODY + 2;
      });
      yPosition += 2;
    });
  }

  // ========== VITAL SIGNS SUMMARY ==========
  if (options.vitalsHistory && options.vitalsHistory.length > 1) {
    addSectionHeader('Vital Signs Summary');

    const initial = options.vitalsHistory[0];
    const final = options.vitalsHistory[options.vitalsHistory.length - 1];

    checkPageBreak(28);

    // Table header row
    addFilledRoundedRect(margin, yPosition, contentWidth, 7, 1, [230, 230, 230]);
    const colPositions = [margin + 20, margin + 50, margin + 75, margin + 100, margin + 125];
    addTextAt('', margin + 2, yPosition + 5, FONT.LABEL, 'bold', COLOR.BODY_TEXT);
    addTextAt('BP', colPositions[0], yPosition + 5, FONT.LABEL, 'bold', COLOR.BODY_TEXT);
    addTextAt('HR', colPositions[1], yPosition + 5, FONT.LABEL, 'bold', COLOR.BODY_TEXT);
    addTextAt('SpO2', colPositions[2], yPosition + 5, FONT.LABEL, 'bold', COLOR.BODY_TEXT);
    addTextAt('RR', colPositions[3], yPosition + 5, FONT.LABEL, 'bold', COLOR.BODY_TEXT);
    yPosition += 8;

    // Initial row
    addTextAt('Initial', margin + 2, yPosition + 5, FONT.LABEL, 'bold', COLOR.MUTED);
    addTextAt(String(initial.bp), colPositions[0], yPosition + 5, FONT.LABEL, 'normal', COLOR.BODY_TEXT);
    addTextAt(String(Math.round(Number(initial.pulse))), colPositions[1], yPosition + 5, FONT.LABEL, 'normal', COLOR.BODY_TEXT);
    addTextAt(String(Math.round(Number(initial.spo2))) + '%', colPositions[2], yPosition + 5, FONT.LABEL, 'normal', COLOR.BODY_TEXT);
    addTextAt(String(Math.round(Number(initial.respiration))), colPositions[3], yPosition + 5, FONT.LABEL, 'normal', COLOR.BODY_TEXT);
    yPosition += 7;

    // Final row
    const hrBetter = Number(final.pulse) < Number(initial.pulse);
    const spo2Better = Number(final.spo2) > Number(initial.spo2);
    addFilledRoundedRect(margin, yPosition, contentWidth, 7, 0, COLOR.ROW_ALT);
    addTextAt('Final', margin + 2, yPosition + 5, FONT.LABEL, 'bold', COLOR.MUTED);
    addTextAt(String(final.bp), colPositions[0], yPosition + 5, FONT.LABEL, 'normal', COLOR.BODY_TEXT);
    addTextAt(String(Math.round(Number(final.pulse))), colPositions[1], yPosition + 5, FONT.LABEL, 'normal', hrBetter ? COLOR.GREEN : COLOR.RED);
    addTextAt(String(Math.round(Number(final.spo2))) + '%', colPositions[2], yPosition + 5, FONT.LABEL, 'normal', spo2Better ? COLOR.GREEN : COLOR.RED);
    addTextAt(String(Math.round(Number(final.respiration))), colPositions[3], yPosition + 5, FONT.LABEL, 'normal', COLOR.BODY_TEXT);
    yPosition += 9;

    addTextAt(`Snapshots recorded: ${options.vitalsHistory.length}`, margin, yPosition, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED);
    yPosition += 5;
  }

  // ========== CLINICAL GUIDELINES & REFERENCES ==========
  if (caseData.uaeProtocols?.applicableGuidelines && caseData.uaeProtocols.applicableGuidelines.length > 0) {
    addSectionHeader('Clinical Guidelines & References');

    // Map well-known guideline names to their authoritative URLs
    const guidelineUrlMap: Record<string, string> = {
      'uae national ambulance': 'https://www.doh.gov.ae/en/resources/Ede/Policies',
      'dubai health authority': 'https://www.dha.gov.ae',
      'haad': 'https://www.doh.gov.ae',
      'department of health abu dhabi': 'https://www.doh.gov.ae',
      'european resuscitation council': 'https://www.erc.edu/guidelines',
      'erc guidelines': 'https://www.erc.edu/guidelines',
      'ilcor': 'https://www.ilcor.org/documents/consensus-on-science-with-treatment-recommendations',
      'american heart association': 'https://www.heart.org/en/professional/quality-improvement/guidelines',
      'aha guidelines': 'https://www.heart.org/en/professional/quality-improvement/guidelines',
      'resuscitation council uk': 'https://www.resus.org.uk/library/2021-resuscitation-guidelines',
      'rcuk': 'https://www.resus.org.uk/library/2021-resuscitation-guidelines',
      'jrcalc': 'https://jrcalc.org.uk',
      'nice guidelines': 'https://www.nice.org.uk/guidance',
      'nice': 'https://www.nice.org.uk/guidance',
      'atls': 'https://www.facs.org/quality-programs/trauma/education/advanced-trauma-life-support/',
      'advanced trauma life support': 'https://www.facs.org/quality-programs/trauma/education/advanced-trauma-life-support/',
      'acls': 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines',
      'pals': 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines',
      'btls': 'https://www.naemt.org/education/phtls',
      'phtls': 'https://www.naemt.org/education/phtls',
      'who': 'https://www.who.int/publications/guidelines',
    };

    const findGuidelineUrl = (guidelineText: string): string | null => {
      const lower = guidelineText.toLowerCase();
      // Check if the guideline text already contains a URL
      const urlMatch = guidelineText.match(/https?:\/\/[^\s)]+/);
      if (urlMatch) return urlMatch[0];
      // Check against known guideline name patterns
      for (const [pattern, url] of Object.entries(guidelineUrlMap)) {
        if (lower.includes(pattern)) return url;
      }
      return null;
    };

    caseData.uaeProtocols.applicableGuidelines.forEach((guideline) => {
      checkPageBreak(8);

      addFilledRoundedRect(margin, yPosition - 1, 5, 5, 1, COLOR.BG_BLUE);
      addTextAt('>', margin + 1.5, yPosition + 3, FONT.LABEL, 'normal', COLOR.PRIMARY);

      const guidelineUrl = findGuidelineUrl(guideline);
      if (guidelineUrl) {
        // Render as clickable link
        addClickableLink(sanitizeText(guideline), guidelineUrl, margin + 8, yPosition + 3);
        yPosition += LINE_HEIGHT.BODY + 3;
      } else {
        // Render as plain text
        const lines = doc.splitTextToSize(sanitizeText(guideline), contentWidth - 10) as string[];
        lines.forEach((line: string, idx: number) => {
          addTextAt(line, margin + 8, yPosition + 3 + (idx * LINE_HEIGHT.BODY), FONT.BODY, 'normal', COLOR.BODY_TEXT);
        });
        yPosition += lines.length * LINE_HEIGHT.BODY + 3;
      }
    });

    // Add a note pointing to full guideline sources
    checkPageBreak(8);
    addTextAt(
      'Full clinical practice guidelines available at: doh.gov.ae | erc.edu | resus.org.uk | jrcalc.org.uk',
      margin,
      yPosition + 2,
      FONT.LABEL,
      'italic',
      COLOR.LIGHT_MUTED
    );
    yPosition += 7;
  }

  // ========== COMMON PITFALLS ==========
  if (caseData.commonPitfalls && caseData.commonPitfalls.length > 0) {
    addSectionHeader('Common Pitfalls to Avoid');

    caseData.commonPitfalls.forEach((pitfall) => {
      checkPageBreak(8);

      addTextAt('(!)', margin, yPosition, FONT.BODY, 'normal', COLOR.ORANGE);

      const lines = doc.splitTextToSize(sanitizeText(pitfall), contentWidth - 8) as string[];
      lines.forEach((line: string, idx: number) => {
        addTextAt(line, margin + 7, yPosition + (idx * LINE_HEIGHT.BODY), FONT.BODY, 'normal', COLOR.MUTED);
      });

      yPosition += lines.length * LINE_HEIGHT.BODY + 3;
    });
  }

  // ========== INSTRUCTOR NOTES ==========
  if (session.notes) {
    addSectionHeader('Instructor Notes');

    const noteLines = doc.splitTextToSize(sanitizeText(session.notes), contentWidth) as string[];
    for (const line of noteLines) {
      checkPageBreak(6);
      addTextAt(line, margin, yPosition, FONT.BODY, 'normal', COLOR.BODY_TEXT);
      yPosition += LINE_HEIGHT.BODY + 0.5;
    }
  }

  // ========== INSTRUCTOR ASSESSMENT FEEDBACK ==========
  if (options.instructorAssessmentNotes && options.instructorAssessmentNotes.length > 0) {
    addSectionHeader('Instructor Assessment Feedback');

    const severityColors: Record<string, [number, number, number]> = {
      critical: COLOR.RED,
      important: COLOR.ORANGE,
      'learning-point': COLOR.PRIMARY,
    };

    const categoryColors: Record<string, [number, number, number]> = {
      excellent: COLOR.GREEN,
      'critical-miss': COLOR.RED,
      omitted: COLOR.ORANGE,
      incomplete: COLOR.YELLOW,
      communication: COLOR.PURPLE,
      safety: COLOR.RED,
      'clinical-reasoning': COLOR.PRIMARY,
    };

    for (const note of options.instructorAssessmentNotes) {
      const findingLines = doc.splitTextToSize(sanitizeText(note.finding), contentWidth - 10) as string[];
      const missedLines = note.whatWasMissed && note.whatWasMissed !== 'Not specified'
        ? doc.splitTextToSize(`Missed: ${sanitizeText(note.whatWasMissed)}`, contentWidth - 10) as string[]
        : [];
      const actionLines = note.improvementAction
        ? doc.splitTextToSize(`Action: ${sanitizeText(note.improvementAction)}`, contentWidth - 10) as string[]
        : [];
      const cardHeight = Math.max(
        22,
        9 + findingLines.length * LINE_HEIGHT.BODY + missedLines.length * LINE_HEIGHT.LABEL + actionLines.length * LINE_HEIGHT.LABEL + 4,
      );
      checkPageBreak(cardHeight + 4);

      const catColor = categoryColors[note.category] || COLOR.MUTED;
      const severityColor = severityColors[note.severity] || COLOR.MUTED;

      // Note card background
      const bgColor: [number, number, number] = note.category === 'excellent'
        ? COLOR.BG_GREEN : note.category === 'critical-miss'
        ? COLOR.BG_RED : COLOR.BG_YELLOW;
      addFilledRoundedRect(margin, yPosition, contentWidth, cardHeight, 2, bgColor);

      // Left border accent
      doc.setFillColor(catColor[0], catColor[1], catColor[2]);
      doc.rect(margin, yPosition, 2, cardHeight, 'F');

      // Severity badge
      addTextAt(`[${note.severity.toUpperCase()}]`, margin + 5, yPosition + 5, FONT.LABEL, 'bold', severityColor);

      // Phase
      addTextAt(`Phase: ${note.phase}`, margin + 35, yPosition + 5, FONT.LABEL, 'normal', COLOR.MUTED);

      // Timestamp
      const noteTime = new Date(note.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      addTextAt(noteTime, pageWidth - margin - 12, yPosition + 5, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED);

      let contentY = yPosition + 11;
      findingLines.forEach((line: string) => {
        addTextAt(line, margin + 5, contentY, FONT.BODY, 'bold', COLOR.BLACK);
        contentY += LINE_HEIGHT.BODY;
      });
      missedLines.forEach((line: string) => {
        addTextAt(line, margin + 5, contentY, FONT.LABEL, 'normal', COLOR.MUTED);
        contentY += LINE_HEIGHT.LABEL;
      });
      actionLines.forEach((line: string) => {
        addTextAt(line, margin + 5, contentY, FONT.LABEL, 'normal', COLOR.PRIMARY);
        contentY += LINE_HEIGHT.LABEL;
      });

      yPosition += cardHeight + 3;
    }

    // Summary counts
    checkPageBreak(12);
    yPosition += 2;
    const critCount = options.instructorAssessmentNotes.filter(n => n.severity === 'critical').length;
    const strengthCount = options.instructorAssessmentNotes.filter(n => n.category === 'excellent').length;
    const improvCount = options.instructorAssessmentNotes.filter(n => n.category === 'omitted' || n.category === 'incomplete').length;

    addFilledRoundedRect(margin, yPosition, contentWidth, 8, 2, COLOR.BG_LIGHT);
    addTextAt(
      `Summary: ${critCount} critical  |  ${improvCount} areas for improvement  |  ${strengthCount} strengths noted`,
      margin + 5, yPosition + 5, FONT.LABEL, 'bold', COLOR.MUTED,
    );
    yPosition += 12;
  }

  // ========== FURTHER STUDY RESOURCES ==========
  if (options.debriefingResources && options.debriefingResources.length > 0) {
    addSectionHeader('Further Study Resources');

    const typeOrder = ['guideline', 'article', 'image', 'video', 'podcast', 'case-study'];
    const grouped: Record<string, typeof options.debriefingResources> = {};
    for (const r of options.debriefingResources) {
      if (!grouped[r.type]) grouped[r.type] = [];
      grouped[r.type]!.push(r);
    }

    for (const type of typeOrder) {
      const resources = grouped[type];
      if (!resources || resources.length === 0) continue;

      checkPageBreak(12);

      const typeLabel = type === 'case-study' ? 'Case Studies' : `${type.charAt(0).toUpperCase() + type.slice(1)}s`;
      addTextAt(typeLabel, margin, yPosition, FONT.BODY, 'bold', COLOR.MUTED);
      yPosition += LINE_HEIGHT.BODY + 2;

      const sorted = [...resources].sort((a, b) => {
        const order: Record<string, number> = { essential: 0, important: 1, supplementary: 2 };
        return (order[a.relevance] || 2) - (order[b.relevance] || 2);
      });

      for (const resource of sorted) {
        checkPageBreak(8);

        addTextAt(`[${resource.source}]`, margin + 2, yPosition, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED);
        addClickableLink(sanitizeText(resource.title), resource.url, margin + 40, yPosition);

        if (resource.relevance === 'essential') {
          addTextAt('*', pageWidth - margin - 5, yPosition, FONT.LABEL, 'normal', COLOR.YELLOW);
        }

        yPosition += LINE_HEIGHT.BODY + 3;
      }

      yPosition += 2;
    }

    // Source attribution
    checkPageBreak(8);
    addTextAt(
      'Resources from: NICE, Resuscitation Council UK, Radiopaedia, EMDocs, REBEL EM, ALiEM, EM Cases, EMCrit.',
      margin, yPosition, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED,
    );
    yPosition += 5;
  }

  // ========== CONDITION-SPECIFIC LEARNING RESOURCES ==========
  {
    const caseFindings = [
      caseData.subcategory,
      caseData.title,
      caseData.category,
      caseData.dispatchInfo?.callReason,
      ...(caseData.expectedFindings?.keyObservations || []),
      ...(caseData.expectedFindings?.differentialDiagnoses || []),
      caseData.expectedFindings?.mostLikelyDiagnosis,
    ].filter(Boolean) as string[];

    const diagnosisStr = caseData.expectedFindings?.mostLikelyDiagnosis || '';
    const subcategoryStr = caseData.subcategory || '';
    const subcategoryReadable = subcategoryStr.replace(/-/g, ' ').toLowerCase();
    const genericConditionWords = new Set(['acute', 'severe', 'likely', 'most', 'with', 'without', 'secondary']);
    const conditionTerms = [...new Set(
      `${subcategoryReadable} ${diagnosisStr.toLowerCase()}`
        .split(/[^a-z0-9]+/)
        .filter(term => term.length >= 5 && !genericConditionWords.has(term))
    )];
    const matchesSpecificCondition = (text: string): boolean =>
      !subcategoryStr || conditionTerms.some(term => text.toLowerCase().includes(term));

    // Exclusion map: conditions that should NOT appear in video results
    const videoExclusions: Record<string, string[]> = {
      'aflutter': ['tamponade', 'heart failure', 'cpap', 'pulmonary edema', 'chest pain', 'stemi'],
      'afib': ['tamponade', 'heart failure', 'cpap', 'pulmonary edema', 'stemi'],
      'svt': ['tamponade', 'heart failure', 'cpap', 'pulmonary edema', 'stemi'],
      'asystole': ['tamponade', 'flutter', 'afib', 'svt'],
      'vfib': ['tamponade', 'flutter', 'afib', 'svt'],
      'stem-anterior': ['tamponade', 'flutter', 'afib', 'svt', 'heart failure', 'cpap'],
      'stem-inferior': ['tamponade', 'flutter', 'afib', 'svt', 'heart failure', 'cpap'],
      'nstemi': ['tamponade', 'flutter', 'afib', 'svt', 'heart failure', 'cpap'],
      'asthma': ['copd', 'pneumothorax', 'chest drain'],
      'copd': ['asthma', 'pneumothorax', 'chest drain'],
      'pneumothorax-tension': ['asthma', 'copd', 'nebulizer'],
    };
    const exclusions = videoExclusions[subcategoryStr] || [];

    const matchedVideos = [
      ...getVideosByFindings(caseFindings, {
        diagnosis: diagnosisStr,
        subcategory: subcategoryStr,
        category: caseData.category,
      }),
      ...(!subcategoryStr ? getVideosByCategory(caseData.category) : []),
    ]
      .filter((v, i, arr) => arr.findIndex(x => x.id === v.id) === i)
      .filter(v => {
        // Filter out videos for excluded conditions
        const searchText = [v.name, v.description || '', ...(v.tags || [])].join(' ').toLowerCase();
        return matchesSpecificCondition(searchText) && !exclusions.some(ex => searchText.includes(ex));
      })
      .sort((a, b) => {
        const scoreVideo = (v: typeof a) => {
          let s = 0;
          const nameLower = v.name.toLowerCase();
          const descLower = (v.description || '').toLowerCase();
          const tagsLower = (v.tags || []).join(' ').toLowerCase();
          const searchText = `${nameLower} ${descLower} ${tagsLower}`;

          // Strong: video title matches the actual diagnosis (+25)
          if (diagnosisStr && nameLower.includes(diagnosisStr.toLowerCase())) s += 25;
          // Strong: video title matches subcategory (+20)
          if (subcategoryReadable && nameLower.includes(subcategoryReadable)) s += 20;
          // Medium: video tags/description match diagnosis (+12)
          if (diagnosisStr && searchText.includes(diagnosisStr.toLowerCase())) s += 12;
          // Medium: case findings match video title (+5 each)
          for (const f of caseFindings) {
            if (f && nameLower.includes(f.toLowerCase())) s += 5;
          }
          // Weak: same category only (+1)
          if (v.category === caseData.category && s === 0) s += 1;

          return s;
        };
        return scoreVideo(b) - scoreVideo(a);
      })
      .slice(0, 4);

    const matchedArticles = referenceArticles
      .filter(a => matchesSpecificCondition(a.title))
      .sort((a, b) => {
        const scoreMatch = (article: typeof a): number => {
          let score = 0;
          const titleLower = article.title.toLowerCase();
          if (caseData.subcategory && titleLower.includes(caseData.subcategory.toLowerCase())) score += 10;
          if (caseData.title && titleLower.includes(caseData.title.toLowerCase())) score += 8;
          if (caseData.expectedFindings?.mostLikelyDiagnosis && titleLower.includes(caseData.expectedFindings.mostLikelyDiagnosis.toLowerCase())) score += 6;
          if (caseFindings.some(f => titleLower.includes(f.toLowerCase()))) score += 3;
          if (article.category === caseData.category) score += 1;
          return score;
        };
        return scoreMatch(b) - scoreMatch(a);
      })
      .filter(a => {
        const titleLower = a.title.toLowerCase();
        if (caseData.subcategory) {
          const sub = caseData.subcategory.toLowerCase().replace(/-/g, ' ');
          if (titleLower.includes('heart failure') && !sub.includes('heart failure')) return false;
          if (titleLower.includes('pulmonary edema') && !sub.includes('pulmonary') && !sub.includes('edema')) return false;
          if (titleLower.includes('pulmonary embolism') && !sub.includes('embolism') && !sub.includes('pe')) return false;
        }
        return true;
      })
      .slice(0, 6);

    if (matchedVideos.length > 0 || matchedArticles.length > 0) {
      addSectionHeader('Condition-Specific Learning Resources');

      addTextAt(
        'The following resources are directly relevant to this case condition.',
        margin, yPosition, FONT.LABEL, 'normal', COLOR.MUTED,
      );
      yPosition += 6;

      // Videos
      if (matchedVideos.length > 0) {
        checkPageBreak(10);
        addTextAt('Educational Videos:', margin, yPosition, FONT.BODY, 'bold', COLOR.RED);
        yPosition += LINE_HEIGHT.BODY + 2;

        for (const video of matchedVideos) {
          checkPageBreak(10);

          addTextAt(`[${video.duration}]`, margin + 2, yPosition, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED);

          const videoUrl = getYouTubeWatchUrl(video.youtubeId);
          addClickableLink(sanitizeText(video.name), videoUrl, margin + 18, yPosition);

          addTextAt(video.source, margin + 18, yPosition + LINE_HEIGHT.BODY, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED);

          yPosition += LINE_HEIGHT.BODY * 2 + 2;
        }
        yPosition += 2;
      }

      // Articles
      if (matchedArticles.length > 0) {
        checkPageBreak(10);
        addTextAt('Reference Articles & Guidelines:', margin, yPosition, FONT.BODY, 'bold', COLOR.PRIMARY);
        yPosition += LINE_HEIGHT.BODY + 2;

        for (const article of matchedArticles) {
          checkPageBreak(8);

          addTextAt(`[${article.source}]`, margin + 2, yPosition, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED);
          addClickableLink(sanitizeText(article.title), article.url, margin + 40, yPosition);

          yPosition += LINE_HEIGHT.BODY + 3;
        }
        yPosition += 2;
      }
    }
  }

  // ========== EVIDENCE-BASED PRACTICE APPENDIX (Y3/Y4 ONLY) ==========
  // For 3rd-year and above, append the landmark trials that inform the
  // protocols they followed — so the downloadable PDF can keep teaching
  // after the session. Each topic shows: the "why do we do this?"
  // question, the protocol statement, and a list of citations with DOIs
  // the student can follow up on.
  const evidenceTopics = getRelevantEvidence(
    caseData.category,
    caseData.subcategory || '',
    (options.appliedTreatments ?? []).map(t => t.id),
    session.studentYear,
  );
  if (evidenceTopics.length > 0) {
    doc.addPage();
    yPosition = margin + 5;
    addSectionHeader('Evidence-Based Practice Appendix');
    addWrappedText(
      'The landmark trials informing the protocols you followed in this case. For 3rd-year and above — use these for continued reading after the session.',
      FONT.LABEL, LINE_HEIGHT.LABEL, 'normal', COLOR.MUTED,
    );
    yPosition += 2;

    for (const topic of evidenceTopics) {
      checkPageBreak(30);
      // Question headline
      doc.setFontSize(FONT.BODY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLOR.BLACK[0], COLOR.BLACK[1], COLOR.BLACK[2]);
      const qLines = doc.splitTextToSize(`Clinical question: ${topic.question}`, contentWidth) as string[];
      for (const line of qLines) {
        checkPageBreak(6);
        doc.text(line, margin, yPosition);
        yPosition += LINE_HEIGHT.BODY;
      }
      // Protocol statement
      addWrappedText(
        `Protocol: ${topic.practiceStatement}`,
        FONT.LABEL, LINE_HEIGHT.LABEL, 'normal', COLOR.MUTED,
      );
      yPosition += 1;

      // Papers — each as one line: [short · year] title (clickable DOI)
      for (const paper of topic.papers) {
        checkPageBreak(10);
        const tag = `[${paper.shortName} · ${paper.year}]`;
        addTextAt(tag, margin + 2, yPosition, FONT.LABEL, 'bold', COLOR.PRIMARY);
        const titleX = margin + 38;
        const titleWidth = contentWidth - 36;
        const titleLines = doc.splitTextToSize(paper.title, titleWidth) as string[];
        if (paper.url) {
          // First line clickable; subsequent lines plain.
          addClickableLink(titleLines[0], paper.url, titleX, yPosition);
          for (let li = 1; li < titleLines.length; li++) {
            yPosition += LINE_HEIGHT.BODY;
            checkPageBreak(6);
            addTextAt(titleLines[li], titleX, yPosition, FONT.BODY, 'normal', COLOR.BODY_TEXT);
          }
        } else {
          addTextAt(titleLines[0], titleX, yPosition, FONT.BODY, 'normal', COLOR.BODY_TEXT);
          for (let li = 1; li < titleLines.length; li++) {
            yPosition += LINE_HEIGHT.BODY;
            checkPageBreak(6);
            addTextAt(titleLines[li], titleX, yPosition, FONT.BODY, 'normal', COLOR.BODY_TEXT);
          }
        }
        yPosition += LINE_HEIGHT.BODY;
        // Authors + journal
        const cite = `${paper.authors} · ${paper.journal}`;
        const citeLines = doc.splitTextToSize(cite, contentWidth - 36) as string[];
        for (const line of citeLines) {
          checkPageBreak(5);
          addTextAt(line, titleX, yPosition, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED);
          yPosition += LINE_HEIGHT.LABEL;
        }
        // Meaning (what it means for practice)
        const meaningLines = doc.splitTextToSize(`Meaning: ${paper.meaning}`, contentWidth - 36) as string[];
        for (const line of meaningLines) {
          checkPageBreak(5);
          addTextAt(line, titleX, yPosition, FONT.LABEL, 'normal', COLOR.MUTED);
          yPosition += LINE_HEIGHT.LABEL;
        }
        yPosition += 2;
      }
      yPosition += 3;
    }
  }

  // ========== PAGE BORDERS + FOOTER ON EVERY PAGE ==========
  const totalPages = (doc.internal.pages.length - 1) as number;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Subtle gray border around the content area of each page
    doc.setDrawColor(COLOR.BORDER_GRAY[0], COLOR.BORDER_GRAY[1], COLOR.BORDER_GRAY[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(
      PAGE_BORDER_INSET,
      PAGE_BORDER_INSET,
      pageWidth - 2 * PAGE_BORDER_INSET,
      pageHeight - 2 * PAGE_BORDER_INSET,
      2, 2, 'S',
    );

    // Footer separator line
    doc.setDrawColor(COLOR.BORDER_GRAY[0], COLOR.BORDER_GRAY[1], COLOR.BORDER_GRAY[2]);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    // Footer text
    addCenteredText(
      `Page ${i} of ${totalPages}  |  UAE Paramedic Case Generator  |  Session: ${session.id}`,
      pageHeight - 9,
      FONT.LABEL,
      'normal',
      COLOR.LIGHT_MUTED,
    );
  }

  // Save the PDF. Returning the Blob keeps the browser behavior unchanged
  // while allowing automated checks to inspect the real generated artifact.
  const pdfBlob = doc.output('blob');
  if (options.download !== false) {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = createPdfReportFilename(caseData);
    document.body.appendChild(link);
    link.click();
    // Delay cleanup so the browser can initiate the download
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
  }
  return pdfBlob;
}
