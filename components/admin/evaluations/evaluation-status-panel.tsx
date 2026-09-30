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
}

export function EvaluationStatusPanel() {
  const [rows, setRows] = useState<StudentStatusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "done" | "pending">("all");

  useEffect(() => {
    async function load() {
      try {
        const [subRes, studentRes, facultyRes] = await Promise.all([
          fetch("/api/evaluations", { cache: "no-store" }),
          fetch("/api/students", { cache: "no-store" }),
          fetch("/api/faculty", { cache: "no-store" }),
        ]);

        const subData = (await subRes.json()) as { success?: boolean; submissions?: EvaluationSubmission[] };
        const studentData = (await studentRes.json()) as { success?: boolean; students?: Student[] };
        const facultyData = (await facultyRes.json()) as { success?: boolean; faculty?: Faculty[] };

        const submissions = subData.submissions ?? [];
        const students = studentData.students ?? [];
        const allFaculty = (facultyData.faculty ?? []).filter((f) => f.is_active !== 0);

        // Get unique semesters from submissions
        const uniqueSemesters = [...new Set(submissions.map((s) => s.semester).filter(Boolean) as string[])];

        const built: StudentStatusRow[] = [];

        for (const student of students) {
          // Get all submissions by this student
          const studentSubs = submissions.filter(
            (s) => s.studentId === student.student_id || s.studentId === String(student.id)
          );

          if (studentSubs.length === 0) continue;

          // Group by semester
          const semesterGroups = new Map<string, EvaluationSubmission[]>();
          for (const sub of studentSubs) {
            const sem = sub.semester ?? "Unknown";
            const existing = semesterGroups.get(sem) ?? [];
            existing.push(sub);
            semesterGroups.set(sem, existing);
          }

          for (const [semester, subs] of semesterGroups) {
            // Count faculty assigned to this semester
            const semesterFaculty = allFaculty.filter((f) => {
              if (!f.semester) return false;
              return f.semester.includes(semester) || semester.includes(f.semester);
            });

            // Filter faculty to only those the student can actually see (same dept/level filtering)
            const studentLevel = student.student_level ?? "";
            const studentDept = [
              student.year_level,
              student.course,
              student.section ? `Section ${student.section}` : null,
              student.grade ? `Grade ${student.grade}` : null,
              student.strand,
            ].filter(Boolean).join(" ").toLowerCase();

            const relevantFaculty = semesterFaculty.filter((f) => {
              const dept = f.department.trim().toLowerCase();
              if (studentLevel === "college") {
                if (!dept.includes("college")) return false;
                if (student.year_level && !dept.includes(student.year_level.toLowerCase())) return false;
                if (student.course && !dept.includes(student.course.toLowerCase())) return false;
                if (student.section && !dept.includes(`section ${student.section.toLowerCase()}`)) return false;
                return true;
              }
              if (studentLevel === "senior-high") {
                if (!dept.includes("senior high")) return false;
                if (student.grade && !dept.includes(`grade ${student.grade.toLowerCase()}`)) return false;
                return true;
              }
              if (studentLevel === "junior-high") {
                if (!dept.includes("junior") && !dept.includes("elementary")) return false;
                if (student.grade && !dept.includes(`grade ${student.grade.toLowerCase()}`)) return false;
                if (student.section && !dept.includes(`section ${student.section.toLowerCase()}`)) return false;
                return true;
              }
              return true;
            });

            // Count total rows (faculty × subject) for relevant faculty only
            const totalRows = relevantFaculty.reduce((acc, f) => {
              const subjects = f.subjects
                ? f.subjects.split(",").map((s: string) => s.trim()).filter(Boolean)
                : [];
              return acc + (subjects.length > 0 ? subjects.length : 1);
            }, 0);
            const totalFaculty = totalRows > 0 ? totalRows : subs.length;
            const evaluatedCount = subs.length;
            const isDone = evaluatedCount >= totalFaculty && totalFaculty > 0;
            const lastSubmittedAt = subs.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0]?.submittedAt ?? null;

            built.push({
              student,
              evaluatedCount,
              totalFaculty,
              isDone,
              semester,
              lastSubmittedAt,
            });
          }
        }

        setRows(built);
      } catch {
        setError("Failed to load evaluation data. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const semesters = ["all", ...Array.from(new Set(rows.map((r) => r.semester))).sort()];

  const filtered = rows.filter((r) => {
    const name = `${r.student.first_name} ${r.student.last_name}`.toLowerCase();
    const sid = r.student.student_id.toLowerCase();
    const matchSearch = search === "" || name.includes(search.toLowerCase()) || sid.includes(search.toLowerCase());
    const matchSemester = semesterFilter === "all" || r.semester === semesterFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "done" ? r.isDone : !r.isDone);
    return matchSearch && matchSemester && matchStatus;
  });

  const doneCount = rows.filter((r) => r.isDone).length;
  const pendingCount = rows.filter((r) => !r.isDone).length;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Students</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{rows.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-600">Fully Done</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{doneCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-medium text-amber-600">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{pendingCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or student ID..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </div>
        <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500">
          {semesters.map((s) => <option key={s} value={s}>{s === "all" ? "All semesters" : s}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500">
          <option value="all">All status</option>
          <option value="done">Done</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

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
          <div className="border-b border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-500">{filtered.length} student{filtered.length === 1 ? "" : "s"}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Student ID</th>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Semester</th>
                  <th className="px-6 py-3">Progress</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Last Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => (
                  <tr key={`${row.student.student_id}-${row.semester}`} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-sm text-slate-700">{row.student.student_id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {row.student.first_name} {row.student.last_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{row.semester}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${row.isDone ? "bg-emerald-500" : "bg-amber-400"}`}
                            style={{ width: `${Math.min((row.evaluatedCount / row.totalFaculty) * 100, 100)}%` }}
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
                          Done
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
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
