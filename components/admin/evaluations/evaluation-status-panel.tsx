"use client";

import { useEffect, useState } from "react";
import type { EvaluationSubmission } from "@/lib/types/evaluation-submission";

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_level: string;
  grade: string | null;
  year_level: string | null;
  section: string | null;
  strand: string | null;
  course: string | null;
}

interface SchoolHead {
  id: number;
  id_number: string;
  full_name: string;
  department: string;
  is_active: number;
}

interface Faculty {
  id: number;
  name: string;
  department: string;
  subjects: string;
  semester: string | null;
  is_active: number;
}

interface StudentStatusRow {
  student: Student;
  evaluatedCount: number;
  totalFaculty: number;
  isDone: boolean;
  semester: string;
  lastSubmittedAt: string | null;
  department: string;
}

interface SchoolHeadStatusRow {
  schoolHead: SchoolHead;
  evaluatedCount: number;
  totalFaculty: number;
  isDone: boolean;
  semester: string;
  lastSubmittedAt: string | null;
}

type ViewMode = "student" | "school_head";

export function EvaluationStatusPanel() {
  const [viewMode, setViewMode] = useState<ViewMode>("student");
  const [studentRows, setStudentRows] = useState<StudentStatusRow[]>([]);
  const [schoolHeadRows, setSchoolHeadRows] = useState<SchoolHeadStatusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "done" | "pending">("all");
  const [deptFilter, setDeptFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const [subRes, shSubRes, studentRes, schoolHeadRes, facultyRes] = await Promise.all([
          fetch("/api/evaluations", { cache: "no-store" }),
          fetch("/api/evaluations?source=school_head", { cache: "no-store" }),
          fetch("/api/students", { cache: "no-store" }),
          fetch("/api/school-heads", { cache: "no-store" }),
          fetch("/api/faculty", { cache: "no-store" }),
        ]);

        const subData = (await subRes.json()) as { submissions?: EvaluationSubmission[] };
        const shSubData = (await shSubRes.json()) as { submissions?: EvaluationSubmission[] };
        const studentData = (await studentRes.json()) as { students?: Student[] };
        const schoolHeadData = (await schoolHeadRes.json()) as { schoolHeads?: SchoolHead[] };
        const facultyData = (await facultyRes.json()) as { faculty?: Faculty[] };

        const submissions = subData.submissions ?? [];
        const shSubmissions = shSubData.submissions ?? [];
        const students = studentData.students ?? [];
        const schoolHeads = (schoolHeadData.schoolHeads ?? []).filter((sh) => sh.is_active !== 0);
        const allFaculty = (facultyData.faculty ?? []).filter((f) => f.is_active !== 0);

        // ── Build Student rows ──────────────────────────────────────────────
        const builtStudents: StudentStatusRow[] = [];
        for (const student of students) {
          const studentSubs = submissions.filter(
            (s) => s.studentId === student.student_id || s.studentId === String(student.id)
          );
          if (studentSubs.length === 0) continue;

          const semesterGroups = new Map<string, EvaluationSubmission[]>();
          for (const sub of studentSubs) {
            const sem = sub.semester ?? "Unknown";
            const existing = semesterGroups.get(sem) ?? [];
            existing.push(sub);
            semesterGroups.set(sem, existing);
          }

          for (const [semester, subs] of semesterGroups) {
            const semesterFaculty = allFaculty.filter((f) => {
              if (!f.semester) return false;
              return f.semester.includes(semester) || semester.includes(f.semester);
            });

            const studentLevel = student.student_level ?? "";
            const relevantFaculty = semesterFaculty.filter((f) => {
              const dept = f.department.trim().toLowerCase();
              if (studentLevel === "college") return dept.includes("college");
              if (studentLevel === "senior-high") return dept.includes("senior high");
              if (studentLevel === "junior-high") return dept.includes("junior") || dept.includes("elementary");
              return true;
            });

            const totalRows = relevantFaculty.reduce((acc, f) => {
              const subjects = f.subjects ? f.subjects.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
              return acc + (subjects.length > 0 ? subjects.length : 1);
            }, 0);
            const totalFaculty = totalRows > 0 ? totalRows : subs.length;
            const evaluatedCount = subs.length;
            const isDone = evaluatedCount >= totalFaculty && totalFaculty > 0;
            const lastSubmittedAt = subs.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0]?.submittedAt ?? null;

            // Department label
            const deptLabel = studentLevel === "college" ? "College"
              : studentLevel === "senior-high" ? "Senior High School"
              : studentLevel === "junior-high" ? "Junior High School"
              : "Elementary";

            builtStudents.push({ student, evaluatedCount, totalFaculty, isDone, semester, lastSubmittedAt, department: deptLabel });
          }
        }

        // ── Build School Head rows ──────────────────────────────────────────
        const builtSchoolHeads: SchoolHeadStatusRow[] = [];
        for (const sh of schoolHeads) {
          // Match submissions by full_name (case-insensitive) OR id_number OR school_head_id FK
          const shSubs = shSubmissions.filter((s) => {
            const nameMatch =
              typeof s.studentName === "string" &&
              s.studentName.trim().toLowerCase() === sh.full_name.trim().toLowerCase();
            const idMatch =
              typeof s.studentId === "string" &&
              s.studentId.trim().toLowerCase() === sh.id_number.trim().toLowerCase();
            return nameMatch || idMatch;
          });

          // Count faculty in this school head's department
          const deptFaculty = allFaculty.filter((f) =>
            f.department.toLowerCase().includes(sh.department.toLowerCase()) ||
            sh.department.toLowerCase().includes(f.department.toLowerCase())
          );
          const totalFaculty = deptFaculty.length > 0 ? deptFaculty.length : 0;
          const evaluatedCount = shSubs.length;
          const isDone = totalFaculty > 0 && evaluatedCount >= totalFaculty;

          // Use most recent submission semester, or "Pending" if none yet
          const lastSub = shSubs.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
          const semester = lastSub?.semester ?? "—";
          const lastSubmittedAt = lastSub?.submittedAt ?? null;

          // Always include every active school head — pending ones show 0/total
          builtSchoolHeads.push({
            schoolHead: sh,
            evaluatedCount,
            totalFaculty: totalFaculty > 0 ? totalFaculty : evaluatedCount,
            isDone,
            semester,
            lastSubmittedAt,
          });
        }

        setStudentRows(builtStudents);
        setSchoolHeadRows(builtSchoolHeads);
      } catch {
        setError("Failed to load evaluation data. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const rows = viewMode === "student" ? studentRows : schoolHeadRows;
  const semesters = ["all", ...Array.from(new Set(rows.map((r) => r.semester))).sort()];
  const departments = viewMode === "student"
    ? ["all", ...Array.from(new Set((studentRows).map((r) => r.department))).sort()]
    : ["all", ...Array.from(new Set(schoolHeadRows.map((r) => r.schoolHead.department))).sort()];

  const filtered = rows.filter((r) => {
    const isStudent = viewMode === "student";
    const row = r as StudentStatusRow & SchoolHeadStatusRow;
    const name = isStudent
      ? `${row.student.first_name} ${row.student.last_name}`.toLowerCase()
      : row.schoolHead.full_name.toLowerCase();
    const sid = isStudent ? row.student.student_id.toLowerCase() : row.schoolHead.id_number.toLowerCase();
    const dept = isStudent ? row.department : row.schoolHead.department;

    const matchSearch = search === "" || name.includes(search.toLowerCase()) || sid.includes(search.toLowerCase());
    const matchSemester = semesterFilter === "all" || r.semester === semesterFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "done" ? r.isDone : !r.isDone);
    const matchDept = deptFilter === "all" || dept === deptFilter;
    return matchSearch && matchSemester && matchStatus && matchDept;
  });

  const doneCount = rows.filter((r) => r.isDone).length;
  const pendingCount = rows.filter((r) => !r.isDone).length;
  const completionRate = rows.length > 0 ? Math.round((doneCount / rows.length) * 100) : 0;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="space-y-6">

      {/* ── Student / School Head Toggle ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Evaluation Status for</p>
            <p className="mt-1 text-sm text-slate-500">
              {viewMode === "student"
                ? ""
                : ""}
            </p>
          </div>
          <div className="relative grid w-full max-w-xs grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 sm:shrink-0">
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute bottom-1 top-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out ${
                viewMode === "student"
                  ? "left-1 right-[calc(50%+2px)]"
                  : "left-[calc(50%+2px)] right-1"
              }`}
            />
            <button type="button" onClick={() => { setViewMode("student"); setSearch(""); setDeptFilter("all"); }}
              className={`relative z-10 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                viewMode === "student" ? "text-emerald-800" : "text-slate-500 hover:text-slate-800"
              }`}>
              Student
            </button>
            <button type="button" onClick={() => { setViewMode("school_head"); setSearch(""); setDeptFilter("all"); }}
              className={`relative z-10 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                viewMode === "school_head" ? "text-brand-800" : "text-slate-500 hover:text-slate-800"
              }`}>
              School Head
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total {viewMode === "student" ? "Students" : "School Heads"}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{rows.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-600">Completed</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{doneCount}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-600">Completion Rate</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{completionRate}%</p>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      {rows.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">Overall Progress</p>
            <p className="text-sm font-bold text-slate-900">{doneCount} / {rows.length} completed</p>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">{completionRate}% of {viewMode === "student" ? "students" : "school heads"} have submitted all evaluations</p>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search by name or ${viewMode === "student" ? "student" : "school head"} ID...`}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
        </div>
        <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500">
          {semesters.map((s) => <option key={s} value={s}>{s === "all" ? "All semesters" : s}</option>)}
        </select>        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500">
          {departments.map((d) => <option key={d} value={d}>{d === "all" ? "All departments" : d}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500">
          <option value="all">All status</option>
          <option value="done">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
          <p className="mt-3 text-sm text-slate-500">Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-600">No submissions found</p>
          <p className="mt-1 text-sm text-slate-500">
            {rows.length === 0 ? "No evaluations have been submitted yet." : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-3">
            <p className="text-sm text-slate-500">{filtered.length} {viewMode === "student" ? "student" : "school head"}{filtered.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Name</th>
                  {viewMode === "student" && <th className="px-6 py-3">Department</th>}
                  {viewMode === "school_head" && <th className="px-6 py-3">Department</th>}
                  {viewMode === "student" && <th className="px-6 py-3">Semester</th>}
                  <th className="px-6 py-3">Progress</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Last Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => {
                  const row = r as StudentStatusRow & SchoolHeadStatusRow;
                  const isStudent = viewMode === "student";
                  const id = isStudent ? row.student.student_id : row.schoolHead.id_number;
                  const name = isStudent ? `${row.student.first_name} ${row.student.last_name}` : row.schoolHead.full_name;
                  const dept = isStudent ? row.department : row.schoolHead.department;
                  const pct = row.totalFaculty > 0 ? Math.min((row.evaluatedCount / row.totalFaculty) * 100, 100) : 0;

                  return (
                    <tr key={`${id}-${row.semester}`}
                      className={`transition-colors hover:bg-slate-50 ${row.isDone ? "border-l-4 border-l-emerald-400" : "border-l-4 border-l-amber-400"}`}>
                      <td className="px-6 py-4 font-mono text-sm text-slate-700">{id}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          {dept}
                        </span>
                      </td>
                      {viewMode === "student" && (
                        <td className="px-6 py-4 text-slate-600">{row.semester}</td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${row.isDone ? "bg-emerald-500" : "bg-amber-400"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-600">{row.evaluatedCount}/{row.totalFaculty}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {row.isDone ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01" />
                            </svg>
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {row.lastSubmittedAt ? formatDate(row.lastSubmittedAt) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
