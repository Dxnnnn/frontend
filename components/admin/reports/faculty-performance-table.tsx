"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvaluationSubmissionsAsync } from "@/lib/user/evaluation-submissions";
import { getSchoolHeadSubmissionsAsync } from "@/lib/faculty-portal/coordinator-submissions";
import { onEvaluationsUpdated } from "@/lib/admin/evaluation-events";
import { useIsClient } from "@/lib/hooks/use-is-client";
import type { EvaluationSubmission } from "@/lib/types/evaluation-submission";
import type { TeacherScore } from "@/lib/types/teacher-score";
import type { ScoreDistribution, ScoreLevelKey } from "@/lib/types/teacher-score";

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
  name: string;
  department: string;
  subjects: string[];
  avgRating: number;
  totalResponses: number;
  evaluationCount: number;
}

function buildTeacherScores(submissions: EvaluationSubmission[]): TeacherScore[] {
  if (submissions.length === 0) return [];

  const grouped = new Map<string, EvaluationSubmission[]>();
  for (const sub of submissions) {
    const key = String(sub.facultyId);
    const existing = grouped.get(key) ?? [];
    existing.push(sub);
    grouped.set(key, existing);
  }

  const scores: TeacherScore[] = [];

  for (const [facultyId, subs] of grouped) {
    const first = subs[0];
    const distribution: ScoreDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };

    let totalScore = 0;
    let totalAnswers = 0;

    for (const sub of subs) {
      for (const v of Object.values(sub.scoringAnswers)) {
        const rounded = Math.round(v) as ScoreLevelKey;
        const key = (rounded >= 0 && rounded <= 5 ? rounded : 0) as ScoreLevelKey;
        distribution[key] = (distribution[key] ?? 0) + 1;
        totalScore += v;
        totalAnswers += 1;
      }
    }

    scores.push({
      id: facultyId,
      name: first.facultyName,
      department: first.department,
      overallScore: totalAnswers > 0 ? totalScore / totalAnswers : 0,
      evaluationCount: subs.length,
      scoreDistribution: distribution,
    });
  }

  return scores.sort((a, b) => b.overallScore - a.overallScore);
}

function buildRows(submissions: EvaluationSubmission[], teachers: TeacherScore[]): FacultyRow[] {
  return teachers.map((t) => {
    const subs = submissions.filter((s) => String(s.facultyId) === String(t.id));
    const subjects = [...new Set(subs.map((s) => s.subject).filter((s) => s && s !== "—"))];
    const totalResponses = subs.reduce((acc, s) => acc + Object.keys(s.scoringAnswers).length, 0);
    return {
      id: t.id,
      name: t.name,
      department: t.department,
      subjects,
      avgRating: t.overallScore,
      totalResponses,
      evaluationCount: t.evaluationCount,
    };
  });
}

export interface FacultyPerformanceTableProps {
  /** Limit rows to a school head department (e.g. "College") */
  departmentFilter?: string;
  /** Where "View Report" navigates (default admin path) */
  reportBasePath?: string;
  /**
   * When true, merges school-head submissions with student evaluations.
   * Useful for school head portal; leave false for pure admin student view.
   */
  includeSchoolHead?: boolean;
}

export function FacultyPerformanceTable({
  departmentFilter,
  reportBasePath = "/admin/reports",
  includeSchoolHead = false,
}: FacultyPerformanceTableProps) {
  const router = useRouter();
  const [rows, setRows] = useState<FacultyRow[]>([]);
  const [search, setSearch] = useState("");
  const mounted = useIsClient();

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const [studentSubs, shSubs] = await Promise.all([
        getEvaluationSubmissionsAsync(),
        includeSchoolHead ? getSchoolHeadSubmissionsAsync() : Promise.resolve([]),
      ]);
      if (cancelled) return;
      let all = [...studentSubs, ...shSubs];

      if (departmentFilter) {
        all = all.filter((s) => departmentMatches(s.department, departmentFilter));
      }

      const teachers = buildTeacherScores(all);
      setRows(buildRows(all, teachers));
    }

    void refresh();
    const unsub = onEvaluationsUpdated(() => void refresh());
    return () => {
      cancelled = true;
      unsub();
    };
  }, [departmentFilter, includeSchoolHead]);

  const filtered = rows.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.department.toLowerCase().includes(search.toLowerCase())
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
                  <th className="px-6 py-4 text-left">Subject(s)</th>
                  <th className="px-6 py-4 text-left">Avg Rating</th>
                  <th className="px-6 py-4 text-left">Responses</th>
                  <th className="px-6 py-4 text-left">Evaluations</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((row, i) => (
                  <tr key={row.id} className="transition-colors hover:bg-slate-50">
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
                      <div className="flex flex-wrap gap-1">
                        {row.subjects.length === 0 ? (
                          <span className="text-slate-400">—</span>
                        ) : row.subjects.slice(0, 2).map((s) => (
                          <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{s}</span>
                        ))}
                        {row.subjects.length > 2 && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">+{row.subjects.length - 2}</span>
                        )}
                      </div>
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
                        onClick={() => router.push(`${reportBasePath}/${row.id}`)}
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
