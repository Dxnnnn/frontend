"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getSchoolHeadSubmissionsAsync,
} from "@/lib/faculty-portal/coordinator-submissions";
import { onEvaluationsUpdated } from "@/lib/admin/evaluation-events";
import type { EvaluationSubmission } from "@/lib/types/evaluation-submission";

interface FacultyMember {
  id: number;
  name: string;
  department: string;
  subjects: string;
  is_active?: number;
}

interface SchoolHeadDashboardProps {
  department: string;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function scoreOf(sub: EvaluationSubmission): number {
  const scores = Object.values(sub.scoringAnswers);
  return avg(scores);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** True if two department labels refer to the same school head scope. */
function departmentMatches(submissionDept: string, schoolHeadDept: string): boolean {
  const a = submissionDept.trim().toLowerCase();
  const b = schoolHeadDept.trim().toLowerCase();
  if (!a || !b) return true;
  return a.includes(b) || b.includes(a);
}

export function SchoolHeadDashboard({ department }: SchoolHeadDashboardProps) {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [submissions, setSubmissions] = useState<EvaluationSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSubmissions = useCallback(() => {
    void getSchoolHeadSubmissionsAsync().then((subs) => setSubmissions(subs));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/faculty/by-department/${encodeURIComponent(department)}`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as {
          success?: boolean;
          faculty?: FacultyMember[];
        };
        if (!cancelled) {
          setFaculty((data.faculty ?? []).filter((f) => f.is_active !== 0));
        }
      } catch {
        if (!cancelled) setFaculty([]);
      } finally {
        if (!cancelled) {
          refreshSubmissions();
          setLoading(false);
        }
      }
    }

    if (department) {
      void load();
    }

    const unsub = onEvaluationsUpdated(() => {
      refreshSubmissions();
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [department, refreshSubmissions]);

  const stats = useMemo(() => {
    const effectiveFaculty = department ? faculty : [];
    const effectiveSubmissions = department ? submissions : [];
    const assigned = effectiveFaculty.length;
    const assignedIds = new Set(effectiveFaculty.map((f) => String(f.id)));
    const assignedNames = new Set(
      effectiveFaculty.map((f) => f.name.trim().toLowerCase()).filter(Boolean),
    );

    // A teacher counts as evaluated if any school-head submission matches their id
    // (or name as fallback). Optional soft department filter only when ids differ.
    const evaluatedIds = new Set<string>();

    for (const s of effectiveSubmissions) {
      const id = String(s.facultyId);
      const name = (s.facultyName ?? "").trim().toLowerCase();

      if (assignedIds.has(id)) {
        evaluatedIds.add(id);
        continue;
      }

      // Fallback: name match within assigned list (handles id type quirks)
      if (name && assignedNames.has(name)) {
        const match = effectiveFaculty.find((f) => f.name.trim().toLowerCase() === name);
        if (match) evaluatedIds.add(String(match.id));
      }
    }

    const evaluated = evaluatedIds.size;
    const pending = Math.max(0, assigned - evaluated);

    // Average from submissions linked to this department / assigned teachers
    const relevant = effectiveSubmissions.filter((s) => {
      const id = String(s.facultyId);
      if (assignedIds.has(id)) return true;
      const name = (s.facultyName ?? "").trim().toLowerCase();
      if (name && assignedNames.has(name)) return true;
      return departmentMatches(s.department, department);
    });
    const allScores = relevant.flatMap((s) => Object.values(s.scoringAnswers));
    const average = avg(allScores);
    const progress = assigned > 0 ? Math.round((evaluated / assigned) * 100) : 0;

    return { assigned, evaluated, pending, average, progress, relevant };
  }, [faculty, submissions, department]);

  // Latest score per faculty for the table below
  const recentRows = useMemo(() => {
    const byFaculty = new Map<string, EvaluationSubmission>();
    for (const sub of stats.relevant) {
      const key = String(sub.facultyId);
      const existing = byFaculty.get(key);
      if (!existing || sub.submittedAt > existing.submittedAt) {
        byFaculty.set(key, sub);
      }
    }
    return [...byFaculty.values()]
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
      .map((s) => ({
        id: s.id,
        name: s.facultyName,
        subject: s.subject,
        score: scoreOf(s),
        count: stats.relevant.filter((x) => String(x.facultyId) === String(s.facultyId)).length,
        date: fmtDate(s.submittedAt),
      }));
  }, [stats]);

  if (department && loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
        <div className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      </div>
    );
  }

  const cards = [
    {
      label: "Assigned Teachers",
      value: String(stats.assigned),
      color: "text-blue-700",
    },
    {
      label: "Evaluated",
      value: String(stats.evaluated),
      color: "text-emerald-700",
    },
    {
      label: "Pending",
      value: String(stats.pending),
      color: "text-amber-700",
    },
    {
      label: "Average",
      value: stats.average > 0 ? stats.average.toFixed(2) : "—",
      color: "text-brand-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Summary stats */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-2 divide-y divide-slate-100 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {cards.map((card) => (
            <article key={card.label} className="px-5 py-5 text-center sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
              <p className={`mt-2 text-3xl font-bold tabular-nums ${card.color}`}>
                {card.value}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Evaluation Progress */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Evaluation Progress
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {stats.evaluated} of {stats.assigned} assigned teacher
              {stats.assigned === 1 ? "" : "s"} evaluated
              {department ? ` in ${department}` : ""}.
            </p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-brand-700">
            {stats.progress}%
          </p>
        </div>

        <div
          className="mt-4 h-4 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={stats.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Evaluation progress"
        >
          <div
            className="h-full rounded-full bg-brand-700 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, stats.progress))}%` }}
          />
        </div>

        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>0%</span>
          <span>Pending: {stats.pending}</span>
          <span>100%</span>
        </div>
      </section>

      {/* Recent evaluations table */}
      <section className="flex max-h-96 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="shrink-0 border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Faculty evaluation scores
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Scores from evaluations you have submitted.
          </p>
        </div>

        {recentRows.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6 py-12 text-center">
            <div>
              <p className="text-sm font-medium text-slate-600">No evaluations yet</p>
              <p className="mt-1 text-sm text-slate-400">
                Completed school head evaluations will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Teacher</th>
                  <th className="px-6 py-3 font-medium">Subject</th>
                  <th className="px-6 py-3 font-medium">Score</th>
                  <th className="px-6 py-3 font-medium">Evaluations</th>
                  <th className="px-6 py-3 font-medium">Last updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRows.map((row) => (
                  <tr key={row.id} className="text-slate-700">
                    <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                    <td className="px-6 py-4">{row.subject}</td>
                    <td className="px-6 py-4 font-semibold text-brand-700">
                      {row.score.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">{row.count}</td>
                    <td className="px-6 py-4">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
