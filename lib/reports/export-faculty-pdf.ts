import { jsPDF } from "jspdf";

export interface FacultyPdfReportData {
  facultyName: string;
  department: string;
  subject: string;
  position: string;
  schoolYear: string;
  semester: string;
  dateGenerated: string;
  overallRating: number;
  performance: string;
  categories: Array<{ label: string; score: number }>;
  strengths: string[];
  areasForImprovement: string[];
  overallComment: string;
  /** Official title e.g. Dean, School Head of Senior High School */
  preparerTitle?: string;
  /** Full name of the school head / dean who prepared the report */
  preparerName?: string;
}

function rule(doc: jsPDF, y: number, left: number, right: number): number {
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(left, y, right, y);
  return y + 6;
}

function sectionTitle(doc: jsPDF, title: string, y: number, left: number, right: number): number {
  y = rule(doc, y, left, right);
  doc.setFont("times", "bold");
  doc.setFontSize(11.5);
  doc.text(title, (left + right) / 2, y, { align: "center" });
  y += 5;
  y = rule(doc, y, left, right);
  return y + 2;
}

function ensurePage(doc: jsPDF, y: number, needed: number, bottom: number, left: number, right: number): number {
  if (y + needed <= bottom) return y;
  doc.addPage();
  return 18;
}

function wrapBullet(doc: jsPDF, text: string, x: number, y: number, maxWidth: number): number {
  const lines = doc.splitTextToSize(`•  ${text}`, maxWidth) as string[];
  doc.text(lines, x, y);
  return y + lines.length * 5.2 + 1.5;
}

/**
 * Builds the official Faculty Evaluation Report and downloads it as a PDF file.
 */
export function downloadFacultyEvaluationPdf(data: FacultyPdfReportData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const left = 18;
  const right = pageW - 18;
  const bottom = pageH - 16;
  const fieldW = 40;
  let y = 16;

  // ── Title ──────────────────────────────────────────────────────────────────
  y = rule(doc, y, left, right);
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("FACULTY EVALUATION REPORT", pageW / 2, y, { align: "center" });
  y += 5;
  y = rule(doc, y, left, right);
  y += 3;

  // ── Meta ───────────────────────────────────────────────────────────────────
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  const meta: Array<[string, string]> = [
    ["School", "Benedicto College"],
    ["School Year", data.schoolYear],
    ["Semester", data.semester],
    ["Date Generated", data.dateGenerated],
  ];
  for (const [label, value] of meta) {
    doc.setFont("times", "bold");
    doc.text(`${label}:`, left, y);
    doc.setFont("times", "normal");
    doc.text(value, left + fieldW, y);
    y += 6;
  }
  y += 2;

  // ── Faculty Information ────────────────────────────────────────────────────
  y = sectionTitle(doc, "FACULTY INFORMATION", y, left, right);
  doc.setFontSize(11);
  const info: Array<[string, string]> = [
    ["Faculty Name", data.facultyName || "__________________________"],
    ["Department", data.department || "__________________________"],
    ["Subject", data.subject || "__________________________"],
    ["Position", data.position || "__________________________"],
  ];
  for (const [label, value] of info) {
    y = ensurePage(doc, y, 8, bottom, left, right);
    doc.setFont("times", "bold");
    doc.text(`${label.padEnd(14, " ")} :`, left, y);
    doc.setFont("times", "normal");
    const lines = doc.splitTextToSize(value, right - left - 48) as string[];
    doc.text(lines, left + 48, y);
    y += Math.max(6, lines.length * 5.2);
  }
  y += 2;

  // ── Evaluation Summary ─────────────────────────────────────────────────────
  y = ensurePage(doc, y, 28, bottom, left, right);
  y = sectionTitle(doc, "EVALUATION SUMMARY", y, left, right);
  doc.setFontSize(11);
  doc.setFont("times", "bold");
  doc.text("Overall Rating :", left, y);
  doc.setFont("times", "normal");
  doc.text(`${data.overallRating.toFixed(2)} / 5.00`, left + 48, y);
  y += 6;
  doc.setFont("times", "bold");
  doc.text("Performance    :", left, y);
  doc.text(data.performance, left + 48, y);
  y += 4;

  // ── Category Results ───────────────────────────────────────────────────────
  y = ensurePage(doc, y, 20 + data.categories.length * 6, bottom, left, right);
  y = sectionTitle(doc, "CATEGORY RESULTS", y, left, right);
  doc.setFontSize(11);
  if (data.categories.length === 0) {
    doc.setFont("times", "italic");
    doc.text("No category scores available.", left, y);
    y += 6;
  } else {
    for (const cat of data.categories) {
      y = ensurePage(doc, y, 8, bottom, left, right);
      doc.setFont("times", "normal");
      doc.text(cat.label, left, y);
      doc.setFont("times", "bold");
      doc.text(cat.score.toFixed(2), right, y, { align: "right" });
      y += 6;
    }
  }
  y += 2;

  // ── Strengths ──────────────────────────────────────────────────────────────
  y = ensurePage(doc, y, 24, bottom, left, right);
  y = sectionTitle(doc, "STRENGTHS", y, left, right);
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  for (const s of data.strengths) {
    const text = s.endsWith(".") ? s : `${s}.`;
    y = ensurePage(doc, y, 12, bottom, left, right);
    y = wrapBullet(doc, text, left + 2, y, right - left - 4);
  }
  y += 2;

  // ── Areas for Improvement ──────────────────────────────────────────────────
  y = ensurePage(doc, y, 24, bottom, left, right);
  y = sectionTitle(doc, "AREAS FOR IMPROVEMENT", y, left, right);
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  for (const s of data.areasForImprovement) {
    const text = s.endsWith(".") ? s : `${s}.`;
    y = ensurePage(doc, y, 12, bottom, left, right);
    y = wrapBullet(doc, text, left + 2, y, right - left - 4);
  }
  y += 2;

  // ── Overall Comment ────────────────────────────────────────────────────────
  y = ensurePage(doc, y, 30, bottom, left, right);
  y = sectionTitle(doc, "OVERALL COMMENT", y, left, right);
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  const commentLines = doc.splitTextToSize(data.overallComment, right - left) as string[];
  for (const line of commentLines) {
    y = ensurePage(doc, y, 8, bottom, left, right);
    doc.text(line, left, y);
    y += 5.2;
  }
  y += 4;
  y = rule(doc, y, left, right);
  y += 10;

  // ── Signatures ─────────────────────────────────────────────────────────────
  y = ensurePage(doc, y, 52, bottom, left, right);
  const col1 = left;
  const col2 = left + (right - left) / 2 + 8;
  const colW = (right - left) / 2 - 12;
  const preparerTitle = data.preparerTitle?.trim() || "School Head";
  const preparerName = data.preparerName?.trim() || "";

  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("Prepared by:", col1, y);
  doc.text("Received by:", col2, y);
  y += 18;

  doc.setDrawColor(0);
  doc.setLineWidth(0.35);
  doc.line(col1, y, col1 + colW, y);
  doc.line(col2, y, col2 + colW, y);
  y += 6;

  // Preparer name (school head / dean)
  if (preparerName) {
    doc.setFont("times", "bold");
    doc.setFontSize(10.5);
    doc.text(preparerName, col1 + colW / 2, y, { align: "center" });
  } else {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.text("________________________", col1 + colW / 2, y, { align: "center" });
  }
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text("________________________", col2 + colW / 2, y, { align: "center" });
  y += 5.5;

  doc.setFont("times", "bold");
  doc.setFontSize(10);
  const titleLines = doc.splitTextToSize(preparerTitle, colW) as string[];
  doc.text(titleLines, col1 + colW / 2, y, { align: "center" });
  doc.text("Faculty Member", col2 + colW / 2, y, { align: "center" });
  y += Math.max(titleLines.length * 4.5, 5) + 4;

  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.text("Date: ____________", col1 + colW / 2, y, { align: "center" });
  doc.text("Date: ____________", col2 + colW / 2, y, { align: "center" });
  y += 10;
  rule(doc, y, left, right);

  const safeName = data.facultyName.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "Faculty";
  doc.save(`${safeName}_Faculty_Evaluation_Report.pdf`);
}
