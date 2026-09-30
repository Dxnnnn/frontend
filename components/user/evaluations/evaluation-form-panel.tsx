"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { getSurveyQuestionsAsync } from "@/lib/evaluations/storage";
import { getActiveSemestersAsync } from "@/lib/semester/storage";
import type { Faculty } from "@/lib/types/faculty";
import type { SurveyAudience, SurveyQuestion } from "@/lib/types/survey-question";
import { scoringScale } from "@/lib/types/survey-question";

interface EvaluationFormPanelProps {
  audience?: SurveyAudience;
  departmentFilter?: string;
}

// ── Instructor table row ──────────────────────────────────────────────────────
function InstructorRow({
  member,
  subject,
  isSelected,
  isAlreadyDone,
  onSelect,
}: {
  member: Faculty;
  subject: string;
  isSelected: boolean;
  isAlreadyDone: boolean;
  onSelect: () => void;
}) {
  return (
    <tr
      className={`transition-colors ${
        isAlreadyDone
          ? "cursor-not-allowed bg-slate-50 opacity-60"
          : isSelected
          ? "cursor-pointer bg-brand-50"
          : "cursor-pointer hover:bg-slate-50"
      }`}
      onClick={() => { if (!isAlreadyDone) onSelect(); }}
    >
      <td className="px-4 py-3">
        <div className="flex flex-col items-center gap-1.5 w-20 text-center">
          {/* Avatar — shows uploaded photo or initial fallback */}
          {member.profile_image ? (
            <img
              src={member.profile_image}
              alt={member.name}
              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 border-2 border-white shadow-sm">
              {member.name.charAt(0).toUpperCase()}
            </span>
          )}
          {/* Name below the avatar */}
          <span className="text-xs font-medium text-slate-900 leading-tight break-words w-full">
            {member.name}
          </span>
          {isAlreadyDone && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Evaluated
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{subject}</td>
      <td className="px-4 py-3 text-sm text-slate-500">{displayDepartment(member.department)}</td>
      <td className="px-4 py-3 text-center">
        <input
          type="radio"
          readOnly
          checked={isSelected}
          disabled={isAlreadyDone}
          className="h-4 w-4 border-slate-300 text-brand-700"
          aria-label={`Select ${member.name}`}
        />
      </td>
    </tr>
  );
}

// ── Question section ──────────────────────────────────────────────────────────
function QuestionSection({
  title,
  description,
  children,
  emptyMessage,
  isEmpty,
}: {
  title: string;
  description: string;
  children: ReactNode;
  emptyMessage: string;
  isEmpty: boolean;
}) {
  return (
    <section className="flex max-h-[600px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="shrink-0 border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {isEmpty ? (
        <div className="px-6 py-12 text-center text-sm text-slate-500">{emptyMessage}</div>
      ) : (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">{children}</div>
      )}
    </section>
  );
}

// ── Display helper ────────────────────────────────────────────────────────────
function displayDepartment(dept: string): string {
  return dept.replace(/Elementary[-–]Junior High School/gi, "Junior High School");
}

// ── Terms of Agreement Modal ──────────────────────────────────────────────────
function TermsModal({
  onAgree,
  onCancel,
  isSubmitting,
}: {
  onAgree: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} aria-label="Cancel" />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6 text-blue-600" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900">Terms of Agreement</h3>
        <p className="mt-2 text-sm text-slate-500">Please read and agree to the following before submitting your evaluation.</p>

        <div className="mt-4 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed">
          <p className="font-semibold text-slate-700 mb-2">Faculty Evaluation Terms</p>
          <p>By submitting this evaluation, I hereby certify that:</p>
          <ul className="mt-2 space-y-1 list-disc pl-4">
            <li>The information I provided is truthful and based on my personal experience with the faculty member.</li>
            <li>I understand that this evaluation is confidential and will be used solely for academic improvement purposes.</li>
            <li>I have answered all questions honestly and without bias or external influence.</li>
            <li>I understand that once submitted, my evaluation cannot be modified or retracted.</li>
            <li>I agree that my responses will be used to improve the quality of education at Benedicto College.</li>
          </ul>
        </div>

        <label className="mt-4 flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-sm text-slate-700">
            I have read and agree to the Terms of Agreement above.
          </span>
        </label>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={onAgree} disabled={!agreed || isSubmitting}
            className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? "Submitting..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
interface FacultyRow {
  faculty: Faculty;
  subject: string;
  rowKey: string;
}

function buildRows(facultyList: Faculty[]): FacultyRow[] {
  const rows: FacultyRow[] = [];
  for (const member of facultyList) {
    const subjects = member.subjects ?? [];
    if (subjects.length === 0) {
      rows.push({ faculty: member, subject: "—", rowKey: `${member.id}-` });
    } else {
      for (const subject of subjects) {
        rows.push({ faculty: member, subject, rowKey: `${member.id}-${subject}` });
      }
    }
  }
  return rows;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getDepartmentKeyword(studentLevel: string): string {
  switch (studentLevel.toLowerCase()) {
    case "college": return "college";
    case "senior-high": return "senior high";
    case "elementary": return "elementary";
    case "junior-high": return "elementary-junior";
    default: return "";
  }
}

interface StudentInfo {
  student_level: string;
  grade: string;
  strand: string;
  section: string;
  course: string;
  year_level: string;
}

function getStudentInfo(): StudentInfo {
  if (typeof document === "undefined") return { student_level: "", grade: "", strand: "", section: "", course: "", year_level: "" };
  try {
    const raw = document.cookie.split("; ").find((c) => c.startsWith("eval_user_info="))?.split("=").slice(1).join("=");
    if (!raw) return { student_level: "", grade: "", strand: "", section: "", course: "", year_level: "" };
    const info = JSON.parse(decodeURIComponent(raw)) as { student_level?: string; grade?: string; strand?: string; year_level?: string; section?: string; course?: string };
    return {
      student_level: info.student_level ?? "",
      grade: info.grade ?? info.year_level ?? "",
      strand: info.strand ?? "",
      section: info.section ?? "",
      course: info.course ?? "",
      year_level: info.year_level ?? "",
    };
  } catch {
    return { student_level: "", grade: "", strand: "", section: "", course: "", year_level: "" };
  }
}

// ── Main panel ────────────────────────────────────────────────────────────────
export function EvaluationFormPanel({
  audience = "student",
  departmentFilter,
}: EvaluationFormPanelProps) {
  const isSchoolHeadForm = audience === "school_head";

  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [scoringQuestions, setScoringQuestions] = useState<SurveyQuestion[]>([]);
  const [semesterChoice, setSemesterChoice] = useState("");
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
  const [selectedRowKey, setSelectedRowKey] = useState("");
  const [scoringAnswers, setScoringAnswers] = useState<Record<string, number>>({});
  const [finalRemarks, setFinalRemarks] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Answers stored in memory — only saved to DB when Submit is clicked
  const [pendingAnswers, setPendingAnswers] = useState<Map<string, {
    scoringAnswers: Record<string, number>;
    facultyId: string;
    facultyName: string;
    department: string;
    subject: string;
  }>>(new Map());
  const [localDoneKeys, setLocalDoneKeys] = useState<Set<string>>(new Set());
  const [evaluatedKeys, setEvaluatedKeys] = useState<Set<string>>(new Set());

  // Load already-submitted evaluations from DB
  useEffect(() => {
    void (async () => {
      try {
        const { getEvaluationSubmissionsAsync } = await import("@/lib/user/evaluation-submissions");
        const { getSchoolHeadSubmissionsAsync } = await import("@/lib/faculty-portal/coordinator-submissions");
        let currentUserId: string | undefined;
        try {
          const raw = document.cookie.split("; ").find((c) => c.startsWith("eval_user_info="))?.split("=").slice(1).join("=")
            ?? document.cookie.split("; ").find((c) => c.startsWith("eval_session="))?.split("=").slice(1).join("=");
          if (raw) {
            const info = JSON.parse(decodeURIComponent(raw)) as { id?: string; username?: string };
            currentUserId = info.username ?? info.id;
          }
        } catch { /* ignore */ }
        const subs = isSchoolHeadForm ? await getSchoolHeadSubmissionsAsync() : await getEvaluationSubmissionsAsync();
        const mySubs = currentUserId ? subs.filter((s) => s.studentId === currentUserId) : subs;
        setEvaluatedKeys(new Set(mySubs.map((s) => `${String(s.facultyId)}-${s.subject}-${s.semester ?? ""}`)));
      } catch { /* keep empty */ }
    })();
  }, [isSchoolHeadForm]);

  const hasQuestions = useMemo(() => scoringQuestions.length > 0, [scoringQuestions.length]);

  const [studentInfo] = useState<StudentInfo>(() =>
    typeof window !== "undefined" ? getStudentInfo() : { student_level: "", grade: "", strand: "", section: "", course: "", year_level: "" }
  );
  const studentLevel = studentInfo.student_level;
  const isElemOrJH = studentLevel === "elementary";

  useEffect(() => {
    void getActiveSemestersAsync().then((sems) => {
      setAvailableSemesters([...new Set(sems.map((s) => `SY-${s.schoolYear} ${s.term}`))]);
    });
  }, []);

  const allowsSummer = useMemo(() => {
    if (isElemOrJH || studentLevel === "junior-high" || studentLevel === "senior-high") return false;
    if (studentLevel === "college") return true;
    if (departmentFilter) {
      const dep = departmentFilter.toLowerCase();
      if (dep.includes("college")) return true;
      if (dep.includes("senior high") || dep.includes("junior") || dep.includes("elementary")) return false;
    }
    return false;
  }, [studentLevel, isElemOrJH, departmentFilter]);

  const semesterOptions = useMemo(() => {
    const base = availableSemesters;
    if (isElemOrJH) return [] as string[];
    if (studentLevel === "junior-high") return base.filter((s) => s.includes("Quarter"));
    if (departmentFilter && (departmentFilter.toLowerCase().includes("junior") || departmentFilter.toLowerCase().includes("elementary"))) {
      return base.filter((s) => s.includes("Quarter"));
    }
    return allowsSummer ? base.filter((s) => !s.includes("Quarter")) : base.filter((s) => !s.includes("Summer") && !s.includes("Quarter"));
  }, [availableSemesters, allowsSummer, isElemOrJH, studentLevel, departmentFilter]);

  const semester = isElemOrJH ? "All" : (!allowsSummer && semesterChoice === "Summer" ? "" : semesterChoice);
  const rows = useMemo(() => buildRows(faculty), [faculty]);
  const selectedRow = rows.find((r) => r.rowKey === selectedRowKey) ?? null;

  function isRowEvaluated(row: FacultyRow): boolean {
    const id = String(row.faculty.id);
    return evaluatedKeys.has(`${id}-${row.subject}-${semester}`) || evaluatedKeys.has(`${id}-${row.subject}-`) || localDoneKeys.has(row.rowKey);
  }

  const allRowsEvaluated = rows.length > 0 && rows.every((r) => isRowEvaluated(r));

  useEffect(() => {
    async function load() {
      if (!semester) { setFaculty([]); return; }
      try {
        const isJH = studentLevel === "junior-high";
        const isJHSchoolHead = departmentFilter && (departmentFilter.toLowerCase().includes("junior") || departmentFilter.toLowerCase().includes("elementary"));
        const url = (isElemOrJH || isJH || isJHSchoolHead)
          ? `/api/faculty?semester=All`
          : `/api/faculty?semester=${encodeURIComponent(semester)}`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json() as { success?: boolean; faculty?: Array<{ id: number; name: string; department: string; subjects: string; semester: string | null; is_active: number; created_at: string; profile_image?: string | null }> };
        const backendFaculty: Faculty[] = (data.faculty ?? []).filter((f) => f.is_active !== 0).map((f) => ({
          id: String(f.id), name: f.name, department: f.department,
          subjects: f.subjects ? f.subjects.split(",").map((s) => s.trim()).filter(Boolean) : [],
          semester: f.semester ?? undefined, createdAt: f.created_at,
          profile_image: f.profile_image ?? null,
        }));

        let levelFiltered: Faculty[];
        if (studentLevel === "senior-high" && studentInfo.grade) {
          levelFiltered = backendFaculty.filter((m) => m.department.toLowerCase().includes("senior high") && m.department.toLowerCase().includes(studentInfo.grade.toLowerCase()));
        } else if (studentLevel === "college") {
          levelFiltered = backendFaculty.filter((m) => {
            const dept = m.department.toLowerCase();
            if (!dept.includes("college")) return false;
            if (studentInfo.year_level && !dept.includes(studentInfo.year_level.toLowerCase())) return false;
            if (studentInfo.course && !dept.includes(studentInfo.course.toLowerCase())) return false;
            if (studentInfo.section && !dept.includes(`section ${studentInfo.section.toLowerCase()}`)) return false;
            return true;
          });
        } else if (studentLevel === "junior-high") {
          levelFiltered = backendFaculty.filter((m) => {
            const dept = m.department.toLowerCase();
            if (!dept.includes("junior") && !dept.includes("elementary")) return false;
            if (studentInfo.grade && !dept.includes(studentInfo.grade.toLowerCase())) return false;
            if (studentInfo.section && !dept.includes(`section ${studentInfo.section.toLowerCase()}`)) return false;
            return true;
          });
        } else if (studentLevel === "elementary") {
          levelFiltered = backendFaculty.filter((m) => {
            const dept = m.department.toLowerCase();
            if (!dept.includes("elementary")) return false;
            if (studentInfo.grade && !dept.includes(studentInfo.grade.toLowerCase())) return false;
            if (studentInfo.section && !dept.includes(`section ${studentInfo.section.toLowerCase()}`)) return false;
            return true;
          });
        } else {
          const kw = getDepartmentKeyword(studentLevel);
          levelFiltered = kw ? backendFaculty.filter((m) => m.department.toLowerCase().includes(kw)) : backendFaculty;
        }

        setFaculty(departmentFilter ? levelFiltered.filter((m) => m.department.toLowerCase().includes(departmentFilter.toLowerCase())) : levelFiltered);
      } catch { setFaculty([]); }
      const fetched = await getSurveyQuestionsAsync(audience, "scoring");
      setScoringQuestions(fetched.filter((q) => q.isActive));
    }
    void load();
  }, [audience, departmentFilter, semester, studentLevel, isElemOrJH, studentInfo.grade]);

  // "Done" — saves answers to memory only, marks row as locally done
  function handleSubmitClick(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!semester) { setError("Please select a semester."); return; }
    if (!selectedRow) { setError("Please select an instructor to evaluate."); return; }
    if (!hasQuestions) { setError("No evaluation questions available yet."); return; }
    if (scoringQuestions.some((q) => scoringAnswers[q.id] === undefined)) { setError("Please answer all questions."); return; }

    const rowKey = selectedRow.rowKey;
    setPendingAnswers((prev) => {
      const next = new Map(prev);
      next.set(rowKey, {
        scoringAnswers: Object.fromEntries(scoringQuestions.map((q) => [q.id, scoringAnswers[q.id]])),
        facultyId: selectedRow.faculty.id,
        facultyName: selectedRow.faculty.name,
        department: selectedRow.faculty.department,
        subject: selectedRow.subject,
      });
      return next;
    });
    setLocalDoneKeys((prev) => new Set([...prev, rowKey]));
    setSelectedRowKey("");
    setScoringAnswers({});
    setError("");
  }

  // "Submit" — saves all pending answers to DB at once
  async function handleFinalSubmit() {
    setIsSubmitting(true);
    setError("");
    try {
      const { addEvaluationSubmissionAsync } = await import("@/lib/user/evaluation-submissions");
      const { addSchoolHeadSubmission } = await import("@/lib/faculty-portal/coordinator-submissions");

      let studentId: string | undefined;
      let studentName: string | undefined;
      try {
        const raw = document.cookie.split("; ").find((c) => c.startsWith("eval_user_info="))?.split("=").slice(1).join("=");
        if (raw) {
          const user = JSON.parse(decodeURIComponent(raw)) as { id?: string; name?: string; username?: string };
          studentId = user.username ?? user.id;
          studentName = user.name;
        }
      } catch { /* ignore */ }

      await Promise.all([...pendingAnswers.entries()].map(([, ans]) => {
        const input = {
          studentId, studentName,
          facultyId: ans.facultyId, facultyName: ans.facultyName,
          department: ans.department, subject: ans.subject, semester,
          remarks: finalRemarks.trim() || undefined,
          scoringAnswers: ans.scoringAnswers, personalAnswers: {},
        };
        return isSchoolHeadForm ? addSchoolHeadSubmission(input) : addEvaluationSubmissionAsync(input);
      }));

      const newKeys = new Set(evaluatedKeys);
      for (const [, ans] of pendingAnswers) newKeys.add(`${String(ans.facultyId)}-${ans.subject}-${semester}`);
      setEvaluatedKeys(newKeys);
      setPendingAnswers(new Map());
      setLocalDoneKeys(new Set());
      setFinalRemarks("");
      setSemesterChoice("");
      setSuccess("✅ All evaluations submitted successfully. Thank you!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isJHDept = departmentFilter && (departmentFilter.toLowerCase().includes("junior") || departmentFilter.toLowerCase().includes("elementary"));

  return (
    <form onSubmit={handleSubmitClick} className="space-y-6">

      {/* Step 1: Semester */}
      {!isElemOrJH && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Step 1 — {studentLevel === "junior-high" || isJHDept ? "Select Quarter" : "Select Semester"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {studentLevel === "junior-high" || isJHDept ? "Choose the quarter period." : "Choose the semester."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {semesterOptions.map((s) => (
              <button key={s} type="button" onClick={() => { setSemesterChoice(s); setSelectedRowKey(""); setScoringAnswers({}); setSuccess(""); }}
                className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${semester === s ? "border-brand-500 bg-brand-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"}`}>
                {s}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Step 2: Instructor table */}
      {semester && (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                {isElemOrJH ? "Step 1" : "Step 2"} — Select the Instructor to Evaluate
              </h2>
              {rows.length > 0 && (() => {
                const total = rows.length;
                const done = rows.filter((r) => isRowEvaluated(r)).length;
                return (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${done >= total ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {done} / {total} evaluated
                  </span>
                );
              })()}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Click a row to select. <span className="font-medium text-brand-700">{semester}</span>
              {" · "}
              <span className="text-slate-400">Rows marked ✓ are done.</span>
            </p>
          </div>
          {rows.length === 0 ? (
            <div className="px-6 py-12 text-center"><p className="text-sm text-slate-500">No instructors available. Contact your administrator.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Instructor Name</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3 text-center">Select</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <InstructorRow
                      key={row.rowKey}
                      member={row.faculty}
                      subject={row.subject}
                      isSelected={selectedRowKey === row.rowKey}
                      isAlreadyDone={isRowEvaluated(row)}
                      onSelect={() => { setSelectedRowKey((prev) => prev === row.rowKey ? "" : row.rowKey); setScoringAnswers({}); setError(""); }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Step 3: Questions */}
      {selectedRow && (
        <>
          <div className="rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4">
            <p className="text-sm font-semibold text-brand-800">
              Evaluating: <span className="text-brand-700">{selectedRow.faculty.name}</span>
              {selectedRow.subject !== "—" && <> — <span className="text-brand-700">{selectedRow.subject}</span></>}
            </p>
            <p className="mt-0.5 text-xs text-brand-600">{displayDepartment(selectedRow.faculty.department)} · {semester}</p>
          </div>

          <QuestionSection
            title={`${isElemOrJH ? "Step 2" : "Step 3"} — Scoring Scale`}
            description="Rate each question from 5 (Excellent) to 1 (Poor)."
            isEmpty={scoringQuestions.length === 0}
            emptyMessage="No evaluation questions yet. Contact the administrator."
          >
            {(() => {
              const grouped: Record<string, SurveyQuestion[]> = {};
              for (const q of scoringQuestions) {
                const cat = (q as SurveyQuestion & { category?: string }).category ?? "General";
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(q);
              }
              const numberMap = new Map<string, number>();
              [...scoringQuestions].sort((a, b) => a.order - b.order).forEach((q, i) => numberMap.set(q.id, i + 1));
              let globalIndex = 0;
              return Object.entries(grouped).map(([category, questions]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-700">{category}</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  {questions.map((question) => {
                    globalIndex += 1;
                    const idx = numberMap.get(question.id) ?? globalIndex;
                    return (
                      <article key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-start gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-600">{idx}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900">{question.text}</p>
                            <div className="mt-4 flex flex-wrap gap-3">
                              {scoringScale.map((level) => (
                                <label key={level.value} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:border-brand-300">
                                  <input type="radio" name={`question-${question.id}`} value={level.value}
                                    checked={scoringAnswers[question.id] === level.value}
                                    onChange={() => setScoringAnswers((cur) => ({ ...cur, [question.id]: level.value }))}
                                    className="h-4 w-4 border-slate-300 text-brand-700" required />
                                  <span className="text-sm font-medium text-slate-700">{level.value}</span>
                                  <span className="text-xs text-slate-500">{level.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ));
            })()}
          </QuestionSection>
        </>
      )}

      {/* Remarks — only after ALL faculty evaluated */}
      {allRowsEvaluated && pendingAnswers.size > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Remarks <span className="text-slate-400 font-normal text-sm">(optional)</span></h2>
          <p className="mt-1 text-sm text-slate-500">Add any additional comments or feedback.</p>
          <textarea
            value={finalRemarks}
            onChange={(e) => setFinalRemarks(e.target.value)}
            rows={4}
            placeholder="e.g. Overall the instructors explain lessons very clearly..."
            className="mt-4 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </section>
      )}

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

      {/* Done button — only when all questions answered for selected faculty */}
      {selectedRow && hasQuestions && scoringQuestions.every((q) => scoringAnswers[q.id] !== undefined) && (
        <button type="submit"
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition ${
            isSchoolHeadForm ? "bg-brand-700 hover:bg-brand-800" : "bg-emerald-600 hover:bg-emerald-700"
          }`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Done
        </button>
      )}

      {/* Submit — only when ALL faculty evaluated and pending answers exist */}
      {!selectedRow && allRowsEvaluated && pendingAnswers.size > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <p className="text-sm font-semibold text-emerald-800 mb-3">
            🎉 You have evaluated all assigned instructors!
          </p>
          <button type="button" onClick={() => setShowTerms(true)} disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      )}

      {/* Terms of Agreement Modal */}
      {showTerms && (
        <TermsModal
          isSubmitting={isSubmitting}
          onCancel={() => setShowTerms(false)}
          onAgree={() => {
            setShowTerms(false);
            void handleFinalSubmit();
          }}
        />
      )}
    </form>
  );
}
