"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvaluationSubmissionsAsync } from "@/lib/user/evaluation-submissions";
import { getSchoolHeadSubmissionsAsync } from "@/lib/faculty-portal/coordinator-submissions";
import { onEvaluationsUpdated } from "@/lib/admin/evaluation-events";
import { useIsClient } from "@/lib/hooks/use-is-client";
import type { EvaluationSubmission } from "@/lib/types/evaluation-submission";

function scoreBadge(s: number) {
  if (s >= 4.5) return "bg-emerald-100 text-emerald-700";
  if (s >= 4) return "bg-blue-100 text-blue-700";
  if (s >= 3) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}
function scoreLabel(s: number) {
  if (s >= 4.5) return "Outstanding";
  if (s >= 4) return "Very Good";
  if (s >= 3) return "Satisfactory";
  return "Needs Improvement";
}
function scoreBarBg(s: number) {
  if (s >= 4.5) return "bg-emerald-500";
  if (s >= 4) return "bg-blue-500";
  if (s >= 3) return "bg-amber-500";
  return "bg-red-400";
}

function departmentMatches(facultyDept: string, filter: string): boolean {
  const a = facultyDept.trim().toLowerCase();
  const b = filter.trim().toLowerCase();
  if (!b) return true;
  return a.includes(b) || b.includes(a);
}

interface FacultyRow {
  id: string;
  rowKey: string; // facultyId::subject
  name: string;
  department: string;
  subject: string;
  avgRating: number;
  totalResponses: number;
  evaluationCount: number;
}

function buildRows(submissions: EvaluationSubmission[]): FacultyRow[] {
  if (submissions.length === 0) return [];

  // Group by facultyId + subject
  const grouped = new Map<string, EvaluationSubmission[]>();
  for (const sub of submissions) {
    const key = `${String(sub.facultyId)}::${sub.subject ?? "—"}`;
    const existing = grouped.get(key) ?? [];
    existing.push(sub);
    grouped.set(key, existing);
  }

  const rows: FacultyRow[] = [];
  for (const [key, subs] of grouped) {
    const first = subs[0];
    let totalScore = 0;
    let totalAnswers = 0;
    for (const sub of subs) {
      for (const v of Object.values(sub.scoringAnswers)) {
        totalScore += v;
        totalAnswers += 1;
      }
    }
    const avgRating = totalAnswers > 0 ? totalScore / totalAnswers : 0;
    const totalResponses = subs.reduce((acc, s) => acc + Object.keys(s.scoringAnswers).length, 0);
    rows.push({
      id: String(first.facultyId),
      rowKey: key,
      name: first.facultyName,
      department: first.department,
      subject: first.subject ?? "—",
      avgRating,
      totalResponses,
      evaluationCount: subs.length,
    });
  }

  return rows.sort((a, b) => b.avgRating - a.avgRating);
}

export interface FacultyPerformanceTableProps {
  /** Limit rows to a school head department (e.g. "College") */
  departmentFilter?: string;
  /** Where "View Report" navigates (default admin path) */
  reportBasePath?: string;
  /**
   * When true, merges school-head submissions with student evaluations.
   */
  includeSchoolHead?: boolean;
  /**
   * When true, only shows school head submissions (hides student evaluations).
   */
  schoolHeadOnly?: boolean;
  /**
   * When true, hides the Student/School Head source toggle.
   */
  hideSourceToggle?: boolean;
}

export function FacultyPerformanceTable({
  departmentFilter,
  reportBasePath = "/admin/reports",
  includeSchoolHead = false,
  schoolHeadOnly = false,
  hideSourceToggle = false,
}: FacultyPerformanceTableProps) {
  const router = useRouter();
  const [rows, setRows] = useState<FacultyRow[]>([]);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<"student" | "school_head">(
    schoolHeadOnly ? "school_head" : "student"
  );
  const mounted = useIsClient();

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const isStudent = source === "student";
      const [studentSubs, shSubs] = await Promise.all([
        (!schoolHeadOnly && isStudent) ? getEvaluationSubmissionsAsync() : Promise.resolve([]),
        (includeSchoolHead || !isStudent) ? getSchoolHeadSubmissionsAsync() : Promise.resolve([]),
      ]);
      if (cancelled) return;

      // Filter by selected source
      let all = isStudent ? studentSubs : shSubs;

      if (departmentFilter) {
        all = all.filter((s) => departmentMatches(s.department, departmentFilter));
      }

      setRows(buildRows(all));
    }

    void refresh();
    const unsub = onEvaluationsUpdated(() => void refresh());
    return () => {
      cancelled = true;
      unsub();
    };
  }, [departmentFilter, includeSchoolHead, schoolHeadOnly, source]);

  const filtered = rows.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.department.toLowerCase().includes(search.toLowerCase()) ||
    r.subject.toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="text-sm text-slate-500">Loading reports…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Source Toggle — only shown when not hideSourceToggle */}
      {!hideSourceToggle && (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Reports for</p>
            <p className="mt-1 text-sm text-slate-500">
              {source === "student"
                ? "Showing faculty performance based on student evaluations."
                : "Showing faculty performance based on school head evaluations."}
            </p>
          </div>

          <div className="relative grid w-full max-w-xs grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 sm:shrink-0">
            {/* sliding pill */}
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute bottom-1 top-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out ${
                source === "student"
                  ? "left-1 right-[calc(50%+2px)]"
                  : "left-[calc(50%+2px)] right-1"
              }`}
            />
            {(["student", "school_head"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSource(s)}
                className={`relative z-10 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                  source === s
                    ? s === "student" ? "text-emerald-800" : "text-brand-800"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {s === "student" ? "Student" : "School Head"}
              </button>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search faculty or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-64"
          aria-label="Search faculty"
        />
        <span className="text-sm text-slate-500">
          {filtered.length} faculty member{filtered.length !== 1 ? "s" : ""}
          {departmentFilter ? ` in ${departmentFilter}` : ""}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-20 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 text-slate-300" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
          <p className="text-base font-medium text-slate-500">No evaluations yet</p>
          <p className="text-sm text-slate-400">
            {departmentFilter
              ? "Scores will appear here once evaluations are submitted for your department."
              : "Scores will appear here once students submit evaluations."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4 text-left">Faculty</th>
                  <th className="px-6 py-4 text-left">Department</th>
                  <th className="px-6 py-4 text-left">Subject</th>
                  <th className="px-6 py-4 text-left">Avg Rating</th>
                  <th className="px-6 py-4 text-left">Responses</th>
                  <th className="px-6 py-4 text-left">Evaluations</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((row, i) => (
                  <tr key={row.rowKey} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                          {row.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{row.name}</p>
                          <p className="text-xs text-slate-400">Rank #{i + 1}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{row.department}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {row.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full ${scoreBarBg(row.avgRating)}`} style={{ width: `${(row.avgRating / 5) * 100}%` }} />
                        </div>
                        <span className="font-semibold text-slate-900">{row.avgRating.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{row.totalResponses}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{row.evaluationCount}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${scoreBadge(row.avgRating)}`}>
                        {scoreLabel(row.avgRating)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => router.push(`${reportBasePath}/${row.id}?subject=${encodeURIComponent(row.subject)}${source === "school_head" ? "&source=school_head" : ""}`)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-800"
                      >
                        View Report
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
