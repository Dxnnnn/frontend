"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadQuestions } from "@/lib/evaluations/storage";
import { downloadFacultyEvaluationPdf } from "@/lib/reports/export-faculty-pdf";
import { getPreparerTitle } from "@/lib/reports/preparer-title";
import type { EvaluationSubmission } from "@/lib/types/evaluation-submission";
import type { SurveyQuestion } from "@/lib/types/survey-question";
import type { QuestionCategory } from "@/lib/types/survey-question";

// ── Helpers ───────────────────────────────────────────────────────────────────
function avg(vals: number[]): number {
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
function scoreColor(s: number) {
  if (s >= 4.5) return "text-emerald-600";
  if (s >= 4) return "text-blue-600";
  if (s >= 3) return "text-amber-600";
  return "text-red-500";
}
function scoreBarBg(s: number) {
  if (s >= 4.5) return "bg-emerald-500";
  if (s >= 4) return "bg-blue-500";
  if (s >= 3) return "bg-amber-500";
  return "bg-red-400";
}
function scoreBadge(s: number) {
  if (s >= 4.5) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (s >= 4) return "bg-blue-100 text-blue-700 border-blue-200";
  if (s >= 3) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-red-100 text-red-700 border-red-200";
}
function scoreLabel(s: number) {
  if (s >= 4.5) return "Outstanding";
  if (s >= 4) return "Very Good";
  if (s >= 3) return "Satisfactory";
  return "Needs Improvement";
}
/** Official report performance label (print document) */
function performanceLabel(s: number) {
  if (s >= 4.5) return "EXCELLENT";
  if (s >= 4) return "VERY GOOD";
  if (s >= 3) return "SATISFACTORY";
  if (s >= 2) return "FAIR";
  return "NEEDS IMPROVEMENT";
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function recommendation(s: number): string {
  if (s >= 4.5) return "Continue exemplary performance. Consider mentoring junior faculty and sharing best practices.";
  if (s >= 4) return "Maintain strong performance. Minor improvements in lower-scored areas will push toward excellence.";
  if (s >= 3) return "Satisfactory but improvement needed. Recommend professional development training in areas with lower scores.";
  return "Significant improvement required. Immediate coaching, training, and closer supervision are recommended.";
}
function overallComment(s: number): string {
  if (s >= 4.5) {
    return "The faculty consistently demonstrates excellent teaching performance and professionalism. Continued improvement in student engagement is encouraged.";
  }
  if (s >= 4) {
    return "The faculty demonstrates very good teaching performance and professionalism. Focused refinement in identified areas will further strengthen effectiveness.";
  }
  if (s >= 3) {
    return "The faculty shows satisfactory teaching performance. Continuous professional development and attention to lower-rated areas are recommended.";
  }
  return "The faculty requires significant improvement in instructional performance. Immediate coaching, closer supervision, and targeted professional development are recommended.";
}

/** Display names for the official printed report */
const CATEGORY_PRINT_LABELS: Partial<Record<QuestionCategory, string>> = {
  "Instructional Competence": "Instructional Competence",
  Professionalism: "Professionalism",
  Communication: "Communication Skills",
  "Classroom Management": "Classroom Management",
  Assessment: "Assessment Practices",
};

const PRINT_CATEGORY_ORDER: QuestionCategory[] = [
  "Instructional Competence",
  "Professionalism",
  "Communication",
  "Classroom Management",
  "Assessment",
];

// ── CSV Export ─────────────────────────────────────────────────────────────────
function exportCSV(subs: EvaluationSubmission[], questions: SurveyQuestion[], name: string) {
  const header = ["Student", "Subject", "Semester", "Question", "Score", "Date"];
  const rows: string[][] = [];
  for (const s of subs) {
    for (const q of questions) {
      const score = s.scoringAnswers[q.id];
      if (score !== undefined) {
        rows.push([
          s.studentName ?? s.studentId ?? "Anonymous",
          s.subject,
          s.semester ?? "",
          q.text,
          String(score),
          fmtDate(s.submittedAt),
        ]);
      }
    }
  }
  const csv = [header, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/\s+/g, "_")}_evaluation_report.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main component ────────────────────────────────────────────────────────────
export function FacultyDetailReport({
  facultyId,
  includeSchoolHead = false,
  backHref,
  preparerName: preparerNameProp,
  preparerDepartment: preparerDepartmentProp,
}: {
  facultyId: string;
  /** Include school-head evaluations alongside student submissions */
  includeSchoolHead?: boolean;
  /** Prefer explicit path over browser history (portal-safe back navigation) */
  backHref?: string;
  /** Logged-in school head / dean full name for Prepared by */
  preparerName?: string;
  /** Logged-in school head department (used to resolve Dean / School Head title) */
  preparerDepartment?: string;
}) {
  const router = useRouter();
  const [subs, setSubs] = useState<EvaluationSubmission[]>([]);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [position, setPosition] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  function goBack() {
    if (backHref) router.push(backHref);
    else router.back();
  }

  useEffect(() => {
    setMounted(true);

    void (async () => {
      const [studentSubs, shSubs] = await Promise.all([
        fetch("/api/evaluations", { cache: "no-store" })
          .then((r) => r.json())
          .then((d: { submissions?: EvaluationSubmission[] }) => d.submissions ?? [])
          .catch(() => [] as EvaluationSubmission[]),
        includeSchoolHead
          ? fetch("/api/evaluations?source=school_head", { cache: "no-store" })
              .then((r) => r.json())
              .then((d: { submissions?: EvaluationSubmission[] }) => d.submissions ?? [])
              .catch(() => [] as EvaluationSubmission[])
          : Promise.resolve([] as EvaluationSubmission[]),
      ]);
      const all = [...studentSubs, ...(includeSchoolHead ? shSubs : [])];
      setSubs(all.filter((s) => String(s.facultyId) === String(facultyId)));

      const qs = await loadQuestions();
      setQuestions(
        qs.filter(
          (q) =>
            q.evaluationType === "rating" &&
            (q.audience === "student" || (includeSchoolHead && q.audience === "school_head")),
        ),
      );
    })();

    // Load position from faculty API (used on the printed handover document)
    fetch("/api/faculty")
      .then((res) => res.json())
      .then((data: {
        success?: boolean;
        faculty?: Array<{ id: number | string; position?: string | null }>;
        data?: Array<{ id: number | string; position?: string | null }>;
      }) => {
        const list = Array.isArray(data?.faculty)
          ? data.faculty
          : Array.isArray(data?.data)
            ? data.data
            : [];
        const member = list.find((f) => String(f.id) === String(facultyId));
        setPosition((member?.position ?? "").trim());
      })
      .catch(() => {
        /* position stays blank on the printed form */
      });
  }, [facultyId, includeSchoolHead]);

  if (!mounted) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
          <div className="h-6 w-48 animate-pulse rounded-lg bg-slate-200" />
        </header>
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="text-sm text-slate-500">Loading report…</p>
          </div>
        </main>
      </div>
    );
  }

  if (subs.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5">
          <button type="button" onClick={goBack} className="mb-2 inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Reports
          </button>
          <h1 className="text-2xl font-semibold text-slate-900">Faculty Report</h1>
        </header>
        <main className="flex flex-1 items-center justify-center">
          <p className="text-slate-500">No evaluations found for this faculty member.</p>
        </main>
      </div>
    );
  }

  // ── Compute stats ────────────────────────────────────────────────────────────
  const facultyName = subs[0].facultyName;
  const department = subs[0].department;
  const semesters = [...new Set(subs.map((s) => s.semester ?? "N/A"))];
  const subjects = [...new Set(subs.map((s) => s.subject).filter((s) => s && s !== "—"))];
  const uniqueStudents = new Set(subs.map((s) => s.studentId ?? s.studentName ?? "")).size;
  const totalResponses = subs.reduce((a, s) => a + Object.keys(s.scoringAnswers).length, 0);

  const allScores = subs.flatMap((s) => Object.values(s.scoringAnswers));
  const overallAvg = avg(allScores);

  // Distribution
  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const v of allScores) {
    const k = Math.min(5, Math.max(1, Math.round(v)));
    dist[k] = (dist[k] ?? 0) + 1;
  }

  // Per-question stats
  const qStats = questions.map((q) => {
    const scores = subs.map((s) => s.scoringAnswers[q.id]).filter((v) => v !== undefined) as number[];
    return { id: q.id, text: q.text, category: q.category, avg: avg(scores), count: scores.length };
  }).filter((q) => q.count > 0).sort((a, b) => b.avg - a.avg);

  const highest = qStats.slice(0, 3);
  const lowest = [...qStats].reverse().slice(0, 3);

  // Per-category averages (for official print report)
  const categoryStats = PRINT_CATEGORY_ORDER.map((cat) => {
    const catQs = qStats.filter((q) => q.category === cat);
    if (catQs.length === 0) return null;
    return {
      category: cat,
      label: CATEGORY_PRINT_LABELS[cat] ?? cat,
      avg: avg(catQs.map((q) => q.avg)),
    };
  }).filter((c): c is NonNullable<typeof c> => c !== null);

  // Strengths / areas for improvement (from highest / lowest criteria)
  const strengths = highest.length > 0
    ? highest.map((q) => q.text)
    : ["Demonstrates solid instructional performance."];
  const improvements = lowest.length > 0
    ? lowest.filter((q) => q.avg < overallAvg || q.avg < 4.5).map((q) => q.text).slice(0, 3)
    : [];
  const areasForImprovement = improvements.length > 0
    ? improvements
    : ["Continue building on current strengths and student engagement strategies."];

  // Per-semester trend
  const semTrend = semesters.map((sem) => {
    const semSubs = subs.filter((s) => (s.semester ?? "N/A") === sem);
    const scores = semSubs.flatMap((s) => Object.values(s.scoringAnswers));
    return { sem, avg: avg(scores), count: semSubs.length };
  });

  // Comments
  const comments = subs.filter((s) => s.remarks && s.remarks.trim()).map((s) => s.remarks!.trim());

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const primarySemester = semesters[0] ?? "1st Semester";
  // Extract school year if present in semester string; otherwise default
  const schoolYearMatch = primarySemester.match(/20\d{2}\s*[–\-]\s*20\d{2}/);
  const schoolYear = schoolYearMatch ? schoolYearMatch[0].replace(/-/g, "–") : "2025–2026";
  const semesterDisplay = primarySemester
    .replace(/A\.?Y\.?\s*20\d{2}\s*[–\-]\s*20\d{2}/i, "")
    .replace(/School\s*Year\s*20\d{2}\s*[–\-]\s*20\d{2}/i, "")
    .trim() || primarySemester;
  const subjectsDisplay = subjects.join(", ") || "__________________________";
  const positionDisplay = position || "__________________________";

  // Prepared-by: prefer logged-in school head dept; fallback to faculty department on report
  const preparerDeptForTitle = preparerDepartmentProp?.trim() || department || "";
  const preparerTitle = getPreparerTitle(preparerDeptForTitle);
  const preparerName = (preparerNameProp ?? "").trim();

  function handleExportPdf() {
    if (exportingPdf) return;
    setExportingPdf(true);
    try {
      downloadFacultyEvaluationPdf({
        facultyName,
        department: department || "",
        subject: subjectsDisplay,
        position: positionDisplay,
        schoolYear,
        semester: semesterDisplay,
        dateGenerated: today,
        overallRating: overallAvg,
        performance: performanceLabel(overallAvg),
        categories: categoryStats.map((c) => ({ label: c.label, score: c.avg })),
        strengths,
        areasForImprovement,
        overallComment: overallComment(overallAvg),
        preparerTitle,
        preparerName,
      });
    } finally {
      // Brief delay so the button shows feedback even if save is instant
      window.setTimeout(() => setExportingPdf(false), 400);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Page header — screen only */}
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-4 sm:px-8 print:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <button type="button" onClick={goBack} className="mb-1 inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Reports
            </button>
            <h1 className="text-xl font-semibold text-slate-900">Faculty Detailed Report</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Print for paper copy, or Export PDF to download the official evaluation document.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {exportingPdf ? "Downloading…" : "Export PDF"}
            </button>
            <button type="button" onClick={() => exportCSV(subs, questions, facultyName)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6M4 20h16a1 1 0 001-1V6l-5-5H4a1 1 0 00-1 1v17a1 1 0 001 1z" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          OFFICIAL PRINT DOCUMENT — only this is visible when printing
          ═══════════════════════════════════════════════════════════════════════ */}
      <div id="faculty-print-report" className="hidden print:block" aria-hidden="true">
        <div className="print-doc">
          <div className="print-rule" />
          <h1 className="print-title">FACULTY EVALUATION REPORT</h1>
          <div className="print-rule" />

          <div className="print-meta">
            <p><span className="print-label">School:</span> Benedicto College</p>
            <p><span className="print-label">School Year:</span> {schoolYear}</p>
            <p><span className="print-label">Semester:</span> {semesterDisplay}</p>
            <p><span className="print-label">Date Generated:</span> {today}</p>
          </div>

          <div className="print-rule" />
          <h2 className="print-section">FACULTY INFORMATION</h2>
          <div className="print-rule" />

          <div className="print-info-grid">
            <p><span className="print-field">Faculty Name</span> : <span className="print-value">{facultyName}</span></p>
            <p><span className="print-field">Department</span>   : <span className="print-value">{department || "__________________________"}</span></p>
            <p><span className="print-field">Subject</span>      : <span className="print-value">{subjectsDisplay}</span></p>
            <p><span className="print-field">Position</span>     : <span className="print-value">{positionDisplay}</span></p>
          </div>

          <div className="print-rule" />
          <h2 className="print-section">EVALUATION SUMMARY</h2>
          <div className="print-rule" />

          <div className="print-summary">
            <p><span className="print-field">Overall Rating</span> : <strong>{overallAvg.toFixed(2)} / 5.00</strong></p>
            <p><span className="print-field">Performance</span>    : <strong>{performanceLabel(overallAvg)}</strong></p>
          </div>

          <div className="print-rule" />
          <h2 className="print-section">CATEGORY RESULTS</h2>
          <div className="print-rule" />

          {categoryStats.length === 0 ? (
            <p className="print-empty">No category scores available.</p>
          ) : (
            <table className="print-cat-table">
              <tbody>
                {categoryStats.map((c) => (
                  <tr key={c.category}>
                    <td className="print-cat-name">{c.label}</td>
                    <td className="print-cat-score">{c.avg.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="print-rule" />
          <h2 className="print-section">STRENGTHS</h2>
          <div className="print-rule" />

          <ul className="print-bullets">
            {strengths.map((s, i) => (
              <li key={i}>{s.endsWith(".") ? s : `${s}.`}</li>
            ))}
          </ul>

          <div className="print-rule" />
          <h2 className="print-section">AREAS FOR IMPROVEMENT</h2>
          <div className="print-rule" />

          <ul className="print-bullets">
            {areasForImprovement.map((s, i) => (
              <li key={i}>{s.endsWith(".") ? s : `${s}.`}</li>
            ))}
          </ul>

          <div className="print-rule" />
          <h2 className="print-section">OVERALL COMMENT</h2>
          <div className="print-rule" />

          <p className="print-comment">{overallComment(overallAvg)}</p>

          <div className="print-rule" />

          <div className="print-signatures">
            <div className="print-sig-col">
              <p className="print-sig-label">Prepared by:</p>
              <div className="print-sig-line" />
              {preparerName ? (
                <p className="print-sig-name">{preparerName}</p>
              ) : (
                <p className="print-sig-name print-sig-blank">________________________</p>
              )}
              <p className="print-sig-role">{preparerTitle}</p>
              <p className="print-sig-date">Date: ____________</p>
            </div>
            <div className="print-sig-col">
              <p className="print-sig-label">Received by:</p>
              <div className="print-sig-line" />
              <p className="print-sig-name print-sig-blank">________________________</p>
              <p className="print-sig-role">Faculty Member</p>
              <p className="print-sig-date">Date: ____________</p>
            </div>
          </div>

          <div className="print-rule print-footer-rule" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SCREEN-ONLY detailed report (hidden when printing)
          ═══════════════════════════════════════════════════════════════════════ */}
      <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-8 sm:px-8 print:hidden">
        <div className="mx-auto max-w-4xl space-y-6">

          {/* ── 1. Faculty Information ── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Faculty Information</h2>
            <div className="flex items-start gap-5">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-extrabold text-blue-700">
                {facultyName.charAt(0).toUpperCase()}
              </span>
              <div className="grid gap-2 sm:grid-cols-2 flex-1 text-sm">
                <div><span className="text-slate-500">Full Name:</span> <span className="font-semibold text-slate-900 ml-1">{facultyName}</span></div>
                <div><span className="text-slate-500">Department:</span> <span className="font-semibold text-slate-900 ml-1">{department}</span></div>
                <div><span className="text-slate-500">Subjects Handled:</span> <span className="font-semibold text-slate-900 ml-1">{subjects.join(", ") || "—"}</span></div>
                <div><span className="text-slate-500">Total Students Evaluated:</span> <span className="font-semibold text-slate-900 ml-1">{uniqueStudents}</span></div>
              </div>
            </div>
          </section>

          {/* ── 2. School Year & Semester ── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">School Year &amp; Semester</h2>
            <div className="flex flex-wrap gap-3">
              {semesters.map((s) => (
                <span key={s} className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">{s}</span>
              ))}
            </div>
          </section>

          {/* ── 3. Overall Performance Summary ── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Overall Performance Summary</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Overall Avg Rating", value: overallAvg.toFixed(2), sub: `/ 5.00`, color: "text-blue-700 bg-blue-50 border-blue-200" },
                { label: "Total Evaluations", value: subs.length, sub: "submissions", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                { label: "Total Responses", value: totalResponses, sub: "question answers", color: "text-violet-700 bg-violet-50 border-violet-200" },
                { label: "Performance Level", value: scoreLabel(overallAvg), sub: "", color: scoreBadge(overallAvg) },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
                  <p className="text-2xl font-extrabold">{s.value}</p>
                  {s.sub && <p className="text-xs mt-0.5 opacity-70">{s.sub}</p>}
                  <p className="mt-1 text-xs font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── 4. Rating Distribution ── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Rating Distribution</h2>
            <div className="space-y-3">
              {([5,4,3,2,1] as const).map((v) => {
                const cnt = dist[v] ?? 0;
                const pct = allScores.length > 0 ? (cnt / allScores.length) * 100 : 0;
                const labels: Record<number,string> = {5:"Excellent",4:"Very Good",3:"Good",2:"Fair",1:"Poor"};
                return (
                  <div key={v} className="flex items-center gap-3 text-sm">
                    <span className="w-8 text-right font-bold text-slate-700">{v}</span>
                    <span className="w-20 text-xs text-slate-500">{labels[v]}</span>
                    <div className="flex-1 h-4 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${scoreBarBg(v)}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-slate-600 font-medium">{cnt}</span>
                    <span className="w-14 text-right text-slate-400 text-xs">{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── 5. Question-by-Question Statistics ── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Question-by-Question Statistics</h2>
            {qStats.length === 0 ? (
              <p className="text-sm text-slate-400">No question data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
                      <th className="pb-3 pr-4 text-left">#</th>
                      <th className="pb-3 pr-4 text-left">Question</th>
                      <th className="pb-3 pr-4 text-left">Category</th>
                      <th className="pb-3 pr-4 text-left">Avg Score</th>
                      <th className="pb-3 text-left">Responses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {qStats.map((q, i) => (
                      <tr key={q.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-4 text-slate-400">{i+1}</td>
                        <td className="py-3 pr-4 text-slate-800 max-w-xs">{q.text}</td>
                        <td className="py-3 pr-4 text-slate-500 text-xs">{q.category}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
                              <div className={`h-full rounded-full ${scoreBarBg(q.avg)}`} style={{ width: `${(q.avg/5)*100}%` }} />
                            </div>
                            <span className={`font-semibold ${scoreColor(q.avg)}`}>{q.avg.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-600">{q.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ── 6. Highest & Lowest Rated Criteria ── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Highest &amp; Lowest Rated Criteria</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold text-emerald-700">Highest Rated</p>
                <ul className="space-y-2">
                  {highest.map((q, i) => (
                    <li key={q.id} className="flex items-start justify-between gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                      <p className="text-sm text-slate-800">{i+1}. {q.text}</p>
                      <span className="shrink-0 text-sm font-bold text-emerald-700">{q.avg.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold text-red-600">Lowest Rated</p>
                <ul className="space-y-2">
                  {lowest.map((q, i) => (
                    <li key={q.id} className="flex items-start justify-between gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                      <p className="text-sm text-slate-800">{i+1}. {q.text}</p>
                      <span className="shrink-0 text-sm font-bold text-red-600">{q.avg.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ── 7. Anonymous Student Comments ── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Anonymous Student Comments</h2>
            {comments.length === 0 ? (
              <p className="text-sm text-slate-400">No comments submitted.</p>
            ) : (
              <ul className="space-y-3 max-h-64 overflow-y-auto">
                {comments.map((c, i) => (
                  <li key={i} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 italic">
                    &ldquo;{c}&rdquo;
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── 8. Performance Trend per Semester ── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Performance Trend per Semester</h2>
            {semTrend.length <= 1 ? (
              <p className="text-sm text-slate-400">Not enough semester data to show a trend.</p>
            ) : (
              <div className="space-y-3">
                {semTrend.map((t) => (
                  <div key={t.sem} className="flex items-center gap-4 text-sm">
                    <span className="w-32 shrink-0 font-medium text-slate-700">{t.sem}</span>
                    <div className="flex-1 h-4 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full transition-all ${scoreBarBg(t.avg)}`} style={{ width: `${(t.avg/5)*100}%` }} />
                    </div>
                    <span className={`w-12 text-right font-semibold ${scoreColor(t.avg)}`}>{t.avg.toFixed(2)}</span>
                    <span className="w-20 text-right text-xs text-slate-400">{t.count} eval{t.count !== 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── 9. Subjects Handled ── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Subjects Handled</h2>
            {subjects.length === 0 ? (
              <p className="text-sm text-slate-400">No subject data.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
                      <th className="pb-3 pr-4 text-left">Subject</th>
                      <th className="pb-3 pr-4 text-left">Evaluations</th>
                      <th className="pb-3 text-left">Avg Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {subjects.map((subj) => {
                      const subjSubs = subs.filter((s) => s.subject === subj);
                      const scores = subjSubs.flatMap((s) => Object.values(s.scoringAnswers));
                      const subjAvg = avg(scores);
                      return (
                        <tr key={subj} className="hover:bg-slate-50">
                          <td className="py-3 pr-4 font-medium text-slate-900">{subj}</td>
                          <td className="py-3 pr-4 text-slate-600">{subjSubs.length}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                                <div className={`h-full rounded-full ${scoreBarBg(subjAvg)}`} style={{ width: `${(subjAvg/5)*100}%` }} />
                              </div>
                              <span className={`font-semibold ${scoreColor(subjAvg)}`}>{subjAvg.toFixed(2)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ── 10. Recommendations ── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Recommendations</h2>
            <div className={`rounded-xl border p-5 ${scoreBadge(overallAvg)}`}>
              <p className="font-semibold mb-1">Performance Level: {scoreLabel(overallAvg)} ({overallAvg.toFixed(2)} / 5.00)</p>
              <p className="text-sm leading-relaxed">{recommendation(overallAvg)}</p>
            </div>
            {lowest.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800 mb-2">Areas for Improvement:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
                  {lowest.map((q) => <li key={q.id}>{q.text} (avg: {q.avg.toFixed(2)})</li>)}
                </ul>
              </div>
            )}
          </section>

        </div>
      </main>

      {/* Print styles — hide all chrome; only formal report remains */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: letter portrait;
            margin: 1.6cm 1.8cm;
          }

          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            color: #000 !important;
            font-family: "Times New Roman", Times, serif !important;
            font-size: 12pt !important;
          }

          /* Hide app chrome: sidebar, headers, screen UI */
          aside,
          nav,
          header,
          .print\\:hidden,
          [class*="print:hidden"] {
            display: none !important;
          }

          /* Expand layout containers */
          body, body * {
            overflow: visible !important;
          }
          body {
            height: auto !important;
          }

          /* Show only the official document */
          #faculty-print-report,
          #faculty-print-report * {
            visibility: visible !important;
          }
          #faculty-print-report {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: #000 !important;
          }

          .print-doc {
            max-width: 100%;
            color: #000;
            font-family: "Times New Roman", Times, serif;
            font-size: 11.5pt;
            line-height: 1.45;
          }

          .print-rule {
            border: none;
            border-top: 1.5pt solid #000;
            margin: 10pt 0 8pt;
          }

          .print-footer-rule {
            margin-top: 18pt;
          }

          .print-title {
            text-align: center;
            font-size: 14pt;
            font-weight: 700;
            letter-spacing: 0.08em;
            margin: 4pt 0;
            text-transform: uppercase;
          }

          .print-section {
            text-align: center;
            font-size: 11.5pt;
            font-weight: 700;
            letter-spacing: 0.06em;
            margin: 2pt 0;
            text-transform: uppercase;
          }

          .print-meta,
          .print-info-grid,
          .print-summary {
            margin: 6pt 0 4pt;
          }

          .print-meta p,
          .print-info-grid p,
          .print-summary p {
            margin: 3pt 0;
          }

          .print-label,
          .print-field {
            font-weight: 600;
            min-width: 9.5em;
            display: inline-block;
          }

          .print-value {
            font-weight: 400;
          }

          .print-cat-table {
            width: 100%;
            border-collapse: collapse;
            margin: 6pt 0 4pt;
          }

          .print-cat-name {
            padding: 3pt 0;
            text-align: left;
          }

          .print-cat-score {
            padding: 3pt 0;
            text-align: right;
            font-weight: 700;
            width: 4em;
            font-variant-numeric: tabular-nums;
          }

          .print-bullets {
            margin: 6pt 0 4pt 1.2em;
            padding: 0;
            list-style: disc;
          }

          .print-bullets li {
            margin: 3pt 0;
          }

          .print-comment {
            margin: 8pt 0 4pt;
            text-align: justify;
            line-height: 1.55;
          }

          .print-empty {
            margin: 6pt 0;
            font-style: italic;
          }

          .print-signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 48pt;
            margin-top: 28pt;
          }

          .print-sig-col {
            text-align: center;
          }

          .print-sig-label {
            text-align: left;
            margin: 0 0 28pt;
            font-weight: 600;
          }

          .print-sig-line {
            border-bottom: 1pt solid #000;
            height: 28pt;
            margin: 0 8pt 6pt;
          }

          .print-sig-name {
            margin: 0 0 2pt;
            font-size: 10.5pt;
            font-weight: 700;
          }

          .print-sig-blank {
            font-weight: 400;
            letter-spacing: 0.02em;
          }

          .print-sig-role {
            margin: 0;
            font-size: 10pt;
            font-weight: 600;
          }

          .print-sig-date {
            margin: 10pt 0 0;
            font-size: 10.5pt;
          }
        }
      `}</style>
    </div>
  );
}
