"use client";

import { useEffect, useState } from "react";
import { formatSubmissionDate } from "@/lib/user/evaluation-submissions";
import type { EvaluationSubmission } from "@/lib/types/evaluation-submission";

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_level: string;
}

type SubmitterType = "student" | "unknown";

interface StatusRow {
  submission: EvaluationSubmission;
  student: Student | null;
  type: SubmitterType;
}

// ── main component ────────────────────────────────────────────────────────────

export function EvaluationStatusPanel() {
  const [rows, setRows] = useState<StatusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "student">("all");

  useEffect(() => {
    async function load() {
      try {
        // Fetch student submissions only + students list in parallel
        const [subRes, studentRes] = await Promise.all([
          fetch("/api/evaluations", { cache: "no-store" }), // defaults to student source only
          fetch("/api/students", { cache: "no-store" }),
        ]);

        const subData = (await subRes.json()) as {
          success?: boolean;
          submissions?: EvaluationSubmission[];
        };
        const studentData = (await studentRes.json()) as {
          success?: boolean;
          students?: Student[];
        };

        const submissions = subData.submissions ?? [];
        const students = studentData.students ?? [];

        // Build a map of student records by student_id
        const studentMap = new Map<string, Student>();
        for (const s of students) {
          studentMap.set(s.student_id, s);
          studentMap.set(String(s.id), s);
        }

        const built: StatusRow[] = submissions.map((sub) => ({
          submission: sub,
          student: sub.studentId ? (studentMap.get(sub.studentId) ?? null) : null,
          type: "student" as SubmitterType,
        }));

        setRows(built);
      } catch {
        setError("Failed to load evaluation data. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  // Unique semesters from submissions
  const semesters = [
    "all",
    ...Array.from(
      new Set(rows.map((r) => r.submission.semester).filter(Boolean) as string[]),
    ).sort(),
  ];

  const filtered = rows.filter((r) => {
    const name = r.student
      ? `${r.student.first_name} ${r.student.last_name}`.toLowerCase()
      : (r.submission.studentName ?? "").toLowerCase();
    const sid = r.student?.student_id ?? r.submission.studentId ?? "";

    const matchSearch =
      search === "" ||
      name.includes(search.toLowerCase()) ||
      sid.toLowerCase().includes(search.toLowerCase()) ||
      r.submission.facultyName.toLowerCase().includes(search.toLowerCase()) ||
      r.submission.subject.toLowerCase().includes(search.toLowerCase());

    const matchSemester =
      semesterFilter === "all" || r.submission.semester === semesterFilter;

    const matchType = typeFilter === "all" || r.type === "student";

    return matchSearch && matchSemester && matchType;
  });

  const studentCount = rows.length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Submissions</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{rows.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-600">Completed</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{rows.length}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-600">By Students</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{studentCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
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
            placeholder="Search by name, ID, faculty, or subject..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </div>

        {/* Semester */}
        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        >
          {semesters.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All semesters" : s}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
          <p className="mt-3 text-sm text-slate-500">Loading submissions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-600">No submissions found</p>
          <p className="mt-1 text-sm text-slate-500">
            {rows.length === 0
              ? "No evaluations have been submitted yet."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-500">
              {filtered.length} submission{filtered.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Evaluator ID</th>
                  <th className="px-6 py-3">Evaluator Name</th>
                  <th className="px-6 py-3">Faculty Evaluated</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Semester</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => {
                  const evalId =
                    row.student?.student_id ?? row.submission.studentId ?? "—";
                  const evalName = row.student
                    ? `${row.student.first_name} ${row.student.last_name}`
                    : row.submission.studentName ?? "—";

                  return (
                    <tr key={row.submission.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-sm text-slate-700">{evalId}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{evalName}</td>
                      <td className="px-6 py-4 text-slate-700">{row.submission.facultyName}</td>
                      <td className="px-6 py-4 text-slate-600">{row.submission.subject}</td>
                      <td className="px-6 py-4 text-slate-600">{row.submission.semester ?? "—"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatSubmissionDate(row.submission.submittedAt)}
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
