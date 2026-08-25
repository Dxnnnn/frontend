"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { getSurveyQuestionsAsync } from "@/lib/evaluations/storage";
import { addSchoolHeadSubmission } from "@/lib/faculty-portal/coordinator-submissions";
import { addEvaluationSubmissionAsync } from "@/lib/user/evaluation-submissions";
import { getActiveSemestersAsync } from "@/lib/semester/storage";
import type { Faculty } from "@/lib/types/faculty";
import type { SurveyAudience, SurveyQuestion } from "@/lib/types/survey-question";
import { scoringScale } from "@/lib/types/survey-question";

interface EvaluationFormPanelProps {
  audience?: SurveyAudience;
  departmentFilter?: string;
}

// ── Confirm submit modal ──────────────────────────────────────────────────────
function ConfirmModal({
  facultyName,
  subject,
  semester,
  onConfirm,
  onCancel,
}: {
  facultyName: string;
  subject: string;
  semester: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} aria-label="Cancel" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6 text-emerald-600" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900">Submit evaluation?</h3>
        <p className="mt-2 text-sm text-slate-500">
          You are about to submit an evaluation for:
        </p>
        <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm">
          <p className="font-medium text-slate-900">{facultyName}</p>
          <p className="text-slate-500">{subject} · {semester}</p>
        </div>
        <p className="mt-3 text-xs text-amber-600 font-medium">
          ⚠ This cannot be undone. You will not be able to evaluate this instructor again for this semester.
        </p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            Yes, submit
          </button>
        </div>
      </div>
    </div>
  );
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
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
            {member.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <span className="font-medium text-slate-900 text-sm">{member.name}</span>
            {isAlreadyDone && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Evaluated
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{subject}</td>
      <td className="px-4 py-3 text-sm text-slate-500">{member.department}</td>
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

// ── Flatten faculty × subjects into rows ──────────────────────────────────────
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

// ── Main panel ────────────────────────────────────────────────────────────────

// Map student_level to the department keyword used in faculty records
function getDepartmentKeyword(studentLevel: string): string {
  switch (studentLevel.toLowerCase()) {
    case "college": return "college";
    case "senior-high": return "senior high";
    case "elementary": return "elementary";
    case "junior-high": return "elementary-junior"; // stored as "Elementary-Junior High School"
    default: return "";
  }
}

interface StudentInfo {
  student_level: string;
  /** e.g. "Grade 11", "Grade 12" — for Senior High filtering */
  grade: string;
  /** e.g. "TVL", "HUMSS", "STEM" — for Senior High filtering */
  strand: string;
  /** e.g. "A", "B", "C" — for section filtering */
  section: string;
  /** e.g. "BSIT", "BSCS" — for college course filtering */
  course: string;
  /** e.g. "1st Year", "4th Year" — for college year level filtering */
  year_level: string;
}

function getStudentInfo(): StudentInfo {
  if (typeof document === "undefined") return { student_level: "", grade: "", strand: "", section: "", course: "", year_level: "" };
  try {
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith("eval_user_info="))
      ?.split("=")
      .slice(1)
      .join("=");
    if (!raw) return { student_level: "", grade: "", strand: "", section: "", course: "", year_level: "" };
    const info = JSON.parse(decodeURIComponent(raw)) as {
      student_level?: string;
      grade?: string;
      strand?: string;
      year_level?: string;
      section?: string;
      course?: string;
    };
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
  const [remarks, setRemarks] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Track which instructor+subject+semester combos are already evaluated
  const [evaluatedKeys, setEvaluatedKeys] = useState<Set<string>>(new Set());

  // Load evaluated keys from backend on mount — filter to current user only
  useEffect(() => {
    void (async () => {
      try {
        const { getEvaluationSubmissionsAsync } = await import("@/lib/user/evaluation-submissions");
        const { getSchoolHeadSubmissionsAsync } = await import("@/lib/faculty-portal/coordinator-submissions");

        // Get current user's ID from cookie
        let currentUserId: string | undefined;
        try {
          const raw = document.cookie.split("; ").find((c) => c.startsWith("eval_user_info="))?.split("=").slice(1).join("=")
            ?? document.cookie.split("; ").find((c) => c.startsWith("eval_session="))?.split("=").slice(1).join("=");
          if (raw) {
            const info = JSON.parse(decodeURIComponent(raw)) as { id?: string; username?: string; id_number?: string };
            currentUserId = info.username ?? info.id;
          }
        } catch { /* ignore */ }

        const subs = isSchoolHeadForm
          ? await getSchoolHeadSubmissionsAsync()
          : await getEvaluationSubmissionsAsync();

        // Filter to only THIS user's submissions
        const mySubs = currentUserId
          ? subs.filter((s) => s.studentId === currentUserId)
          : subs;

        setEvaluatedKeys(
          new Set(mySubs.map((s) => `${String(s.facultyId)}-${s.subject}-${s.semester ?? ""}`)),
        );
      } catch {
        // keep empty set
      }
    })();
  }, [isSchoolHeadForm]);

  const hasQuestions = useMemo(() => scoringQuestions.length > 0, [scoringQuestions.length]);

  // Get student's level, grade and strand from cookie to filter faculty by department
  const [studentInfo] = useState<StudentInfo>(() =>
    typeof window !== "undefined" ? getStudentInfo() : { student_level: "", grade: "", strand: "", section: "", course: "", year_level: "" }
  );
  const studentLevel = studentInfo.student_level;

  // Elementary/JH don't use semesters — auto-set a fixed value so the semester step is skipped
  const isElemOrJH = studentLevel === "elementary" || studentLevel === "junior-high";

  // Load available semesters from DB on mount — only active ones
  useEffect(() => {
    void getActiveSemestersAsync().then((sems) => {
      const terms = [...new Set(sems.map((s) => s.term))];
      setAvailableSemesters(terms);
    });
  }, []);

  // Summer term is College-only (not Senior High)
  const allowsSummer = useMemo(() => {
    if (isElemOrJH) return false;
    if (studentLevel === "college") return true;
    if (studentLevel === "senior-high") return false;
    // School head: based on their department
    if (departmentFilter) {
      const dep = departmentFilter.toLowerCase();
      if (dep.includes("college")) return true;
      if (dep.includes("senior high") || dep.includes("senior-high")) return false;
    }
    return true; // default (e.g. unspecified staff): keep Summer available
  }, [studentLevel, isElemOrJH, departmentFilter]);

  const semesterOptions = useMemo(() => {
    // Base options: from DB if available, otherwise fall back to defaults
    const base = availableSemesters.length > 0
      ? availableSemesters
      : ["1st Semester", "2nd Semester", "Summer"];

    // Filter: Elem/JH get no semesters (auto-set to "All")
    if (isElemOrJH) return [] as string[];

    // Filter Summer out for non-College levels
    return allowsSummer ? base : base.filter((s) => s !== "Summer");
  }, [availableSemesters, allowsSummer, isElemOrJH]);

  // Derived semester — avoids setState-in-effect for auto defaults / invalid values
  const semester = isElemOrJH
    ? "All"
    : !allowsSummer && semesterChoice === "Summer"
      ? ""
      : semesterChoice;

  const rows = useMemo(() => buildRows(faculty), [faculty]);
  const selectedRow = rows.find((r) => r.rowKey === selectedRowKey) ?? null;

  function resetFormAnswers() {
    setScoringAnswers({});
    setRemarks("");
    setError("");
  }

  function handleSemesterSelect(value: string) {
    setSemesterChoice(value);
    setSelectedRowKey("");
    resetFormAnswers();
    setSuccess("");
  }

  function handleInstructorSelect(rowKey: string) {
    setSelectedRowKey(rowKey);
    resetFormAnswers();
  }

  // Load faculty + questions — re-runs when semester changes
  useEffect(() => {
    async function load() {
      if (!semester) {
        const empty = await Promise.resolve([] as Faculty[]);
        setFaculty(empty);
        return;
      }
      try {
        // Elem/JH don't have semesters — fetch all active faculty without semester filter
        const url = isElemOrJH
          ? `/api/faculty?semester=All`
          : `/api/faculty?semester=${encodeURIComponent(semester)}`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json() as { success?: boolean; faculty?: Array<{ id: number; name: string; department: string; subjects: string; semester: string | null; is_active: number; created_at: string }> };
        const backendFaculty: Faculty[] = (data.faculty ?? [])
          .filter((f) => f.is_active !== 0)
          .map((f) => ({
            id: String(f.id),
            name: f.name,
            department: f.department,
            subjects: f.subjects ? f.subjects.split(",").map((s) => s.trim()).filter(Boolean) : [],
            semester: f.semester ?? undefined,
            createdAt: f.created_at,
          }));

        // Filter by student level — match faculty department precisely
        const levelKeyword = getDepartmentKeyword(studentLevel);

        let levelFiltered: Faculty[];
        if (studentLevel === "senior-high" && studentInfo.grade) {
          const gradeKeyword = studentInfo.grade.trim().toLowerCase();
          levelFiltered = backendFaculty.filter((m) => {
            const dept = m.department.trim().toLowerCase();
            return dept.includes("senior high") && dept.includes(gradeKeyword);
          });
        } else if (studentLevel === "college") {
          // College: filter by year level, course, AND section
          levelFiltered = backendFaculty.filter((m) => {
            const dept = m.department.trim().toLowerCase();
            if (!dept.includes("college")) return false;
            // Filter by year level if available
            if (studentInfo.year_level) {
              const yearKeyword = studentInfo.year_level.trim().toLowerCase();
              if (!dept.includes(yearKeyword)) return false;
            }
            // Filter by course if available (e.g. "bsit", "bscs")
            if (studentInfo.course) {
              const courseKeyword = studentInfo.course.trim().toLowerCase();
              if (!dept.includes(courseKeyword)) return false;
            }
            // Filter by section if available (e.g. "section a", "section b")
            if (studentInfo.section) {
              const sectionKeyword = `section ${studentInfo.section.trim().toLowerCase()}`;
              if (!dept.includes(sectionKeyword)) return false;
            }
            return true;
          });
        } else if (studentLevel === "junior-high") {
          // Junior High: filter by grade AND section
          levelFiltered = backendFaculty.filter((m) => {
            const dept = m.department.trim().toLowerCase();
            if (!dept.includes("junior") && !dept.includes("elementary")) return false;
            // Filter by grade if available (e.g. "grade 7", "grade 8")
            if (studentInfo.grade) {
              const gradeKeyword = studentInfo.grade.trim().toLowerCase();
              if (!dept.includes(gradeKeyword)) return false;
            }
            // Filter by section if available
            if (studentInfo.section) {
              const sectionKeyword = `section ${studentInfo.section.trim().toLowerCase()}`;
              if (!dept.includes(sectionKeyword)) return false;
            }
            return true;
          });
        } else if (studentLevel === "elementary") {
          // Elementary: filter by grade AND section
          levelFiltered = backendFaculty.filter((m) => {
            const dept = m.department.trim().toLowerCase();
            if (!dept.includes("elementary")) return false;
            if (studentInfo.grade) {
              const gradeKeyword = studentInfo.grade.trim().toLowerCase();
              if (!dept.includes(gradeKeyword)) return false;
            }
            if (studentInfo.section) {
              const sectionKeyword = `section ${studentInfo.section.trim().toLowerCase()}`;
              if (!dept.includes(sectionKeyword)) return false;
            }
            return true;
          });
        } else if (levelKeyword) {
          levelFiltered = backendFaculty.filter((m) =>
            m.department.trim().toLowerCase().includes(levelKeyword)
          );
        } else {
          levelFiltered = backendFaculty;
        }

        setFaculty(
          departmentFilter
            ? levelFiltered.filter((m) => m.department.trim().toLowerCase().includes(departmentFilter.trim().toLowerCase()))
            : levelFiltered,
        );
      } catch {
        setFaculty([]);
      }
      const fetched = await getSurveyQuestionsAsync(audience, "scoring");
      setScoringQuestions(fetched.filter((q) => q.isActive));
    }

    void load();
  }, [audience, departmentFilter, semester, studentLevel, isElemOrJH, studentInfo.grade]);

  function handleScoreChange(questionId: string, score: number) {
    setScoringAnswers((cur) => ({ ...cur, [questionId]: score }));
  }

  function handleSubmitClick(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!semester) { setError("Please select a semester."); return; }
    if (!selectedRow) { setError("Please select an instructor to evaluate."); return; }
    if (!hasQuestions) { setError("No evaluation questions available yet. Contact the administrator."); return; }

    const unanswered = scoringQuestions.filter((q) => scoringAnswers[q.id] === undefined);
    if (unanswered.length > 0) { setError("Please answer all questions before submitting."); return; }

    // Show confirm modal
    setShowConfirm(true);
  }

  function confirmSubmit() {
    if (!selectedRow) return;
    setShowConfirm(false);

    const submissionInput = {
      studentId: undefined as string | undefined,
      studentName: undefined as string | undefined,
      facultyId: selectedRow.faculty.id,
      facultyName: selectedRow.faculty.name,
      department: selectedRow.faculty.department,
      subject: selectedRow.subject,
      semester,
      remarks: remarks.trim() || undefined,
      scoringAnswers: Object.fromEntries(scoringQuestions.map((q) => [q.id, scoringAnswers[q.id]])),
      personalAnswers: {},
    };

    try {
      const raw = document.cookie.split("; ").find((c) => c.startsWith("eval_user_info="))?.split("=").slice(1).join("=");
      if (raw) {
        const user = JSON.parse(decodeURIComponent(raw)) as { id?: string; name?: string; username?: string };
        submissionInput.studentId = user.username ?? user.id;
        submissionInput.studentName = user.name;
      }
    } catch { /* ignore */ }

    if (isSchoolHeadForm) {
      const row = selectedRow;
      void (async () => {
        try {
          await addSchoolHeadSubmission(submissionInput);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to submit evaluation. Please try again.");
          return;
        }
        const evalKey = `${String(row.faculty.id)}-${row.subject}-${semester}`;
        setEvaluatedKeys((prev) => new Set([...prev, evalKey]));
        setSelectedRowKey("");
        setSemesterChoice("");
        setScoringAnswers({});
        setRemarks("");
        setSuccess(`✅ Evaluation for ${row.faculty.name} — ${row.subject} submitted successfully.`);
      })();
      return;
    } else {
      const row = selectedRow;
      void (async () => {
        try {
          await addEvaluationSubmissionAsync(submissionInput);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to submit evaluation. Please try again.");
          return;
        }
        const evalKey = `${String(row.faculty.id)}-${row.subject}-${semester}`;
        setEvaluatedKeys((prev) => new Set([...prev, evalKey]));
        setSelectedRowKey("");
        setSemesterChoice("");
        setScoringAnswers({});
        setRemarks("");
        setSuccess(`✅ Evaluation for ${row.faculty.name} — ${row.subject} submitted successfully.`);
      })();
      return;
    }
  }

  // Check if a row has been evaluated already
  function isRowEvaluated(row: FacultyRow): boolean {
    const id = String(row.faculty.id);
    const withSem = `${id}-${row.subject}-${semester}`;
    const withoutSem = `${id}-${row.subject}-`;
    // withSem: normal key; withoutSem: legacy school-head records that missed semester
    return evaluatedKeys.has(withSem) || evaluatedKeys.has(withoutSem);
  }

  return (
    <>
      {showConfirm && selectedRow && (
        <ConfirmModal
          facultyName={selectedRow.faculty.name}
          subject={selectedRow.subject}
          semester={semester}
          onConfirm={confirmSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <form onSubmit={handleSubmitClick} className="space-y-6">

        {/* Step 1: Semester — hidden for Elementary/Junior High students */}
        {!isElemOrJH && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Step 1 — Select Semester</h2>
          <p className="mt-1 text-sm text-slate-500">Choose the semester for this evaluation.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {semesterOptions.map((s) => (
              <button key={s} type="button" onClick={() => handleSemesterSelect(s)}
                className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                  semester === s
                    ? "border-brand-500 bg-brand-700 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700"
                }`}>
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
              <h2 className="text-base font-semibold text-slate-900">{isElemOrJH ? "Step 1" : "Step 2"} — Select the Instructor to Evaluate</h2>
              <p className="mt-1 text-sm text-slate-500">
                Click a row to select. <span className="font-medium text-brand-700">{semester}</span>
                {" · "}
                <span className="text-slate-400">Rows marked ✓ Evaluated are already submitted.</span>
              </p>
            </div>
            {rows.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-slate-500">No instructors available. Contact your administrator.</p>
              </div>
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
                        onSelect={() => handleInstructorSelect(row.rowKey)}
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
              <p className="mt-0.5 text-xs text-brand-600">{selectedRow.faculty.department} · {semester}</p>
            </div>

            <QuestionSection
              title={`${isElemOrJH ? "Step 2" : "Step 3"} — Scoring Scale`}
              description="Rate each question from 5 (Excellent) to 1 (Poor)."
              isEmpty={scoringQuestions.length === 0}
              emptyMessage="No evaluation questions have been added yet. Contact the administrator."
            >
              {(() => {
                const grouped: Record<string, SurveyQuestion[]> = {};
                for (const q of scoringQuestions) {
                  const cat = (q as SurveyQuestion & { category?: string }).category ?? "General";
                  if (!grouped[cat]) grouped[cat] = [];
                  grouped[cat].push(q);
                }
                let globalIndex = 0;
                const numberMap = new Map<string, number>();
                [...scoringQuestions].sort((a, b) => a.order - b.order).forEach((q, i) => {
                  numberMap.set(q.id, i + 1);
                });
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
                                      onChange={() => handleScoreChange(question.id, level.value)}
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

            {/* Remarks */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Remarks <span className="text-slate-400 font-normal text-sm">(optional)</span></h2>
              <p className="mt-1 text-sm text-slate-500">Add any additional comments or feedback about this instructor.</p>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                placeholder="e.g. The instructor explains lessons very clearly and is always available for questions..."
                className="mt-4 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </section>
          </>
        )}

        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

        {selectedRow && (
          <button type="submit" disabled={!hasQuestions}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isSchoolHeadForm ? "bg-brand-700 hover:bg-brand-800" : "bg-emerald-600 hover:bg-emerald-700"
            }`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Submit evaluation
          </button>
        )}
      </form>
    </>
  );
}
