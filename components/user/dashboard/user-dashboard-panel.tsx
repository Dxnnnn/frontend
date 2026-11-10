"use client";

import { useEffect, useMemo, useState } from "react";

import { getFacultyAsync } from "@/lib/faculty/storage";
import {
  formatSubmissionDate,
  getEvaluationSubmissionsAsync,
  getOverallScore,
} from "@/lib/user/evaluation-submissions";
import type { EvaluationSubmission } from "@/lib/types/evaluation-submission";
import { maxOverallScore } from "@/lib/types/teacher-score";

// ── Score helpers ─────────────────────────────────────────────────────────────
function scoreBarClass(score: number) {
  if (score >= 4.5) return "bg-emerald-500";
  if (score >= 4)   return "bg-brand-500";
  if (score >= 3)   return "bg-amber-500";
  return "bg-slate-400";
}

function scoreBadgeClass(score: number) {
  if (score >= 4.5) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 4)   return "bg-blue-50 text-blue-700 border-blue-200";
  if (score >= 3)   return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

// ── Student info from cookie ──────────────────────────────────────────────────
interface StudentInfo {
  name?: string;
  username?: string;
  student_level?: string | null;
  year_level?: string | null;
  course?: string | null;
  grade?: string | null;
  section?: string | null;
}

function getStudentInfo(): StudentInfo {
  if (typeof document === "undefined") return {};
  try {
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith("eval_user_info="))
      ?.split("=").slice(1).join("=");
    if (!raw) return {};
    return JSON.parse(decodeURIComponent(raw)) as StudentInfo;
  } catch { return {}; }
}

function buildSubtitle(info: StudentInfo): string {
  const level = info.student_level;
  if (level === "college") {
    return [info.course, info.year_level, info.section ? `Sec ${info.section}` : ""].filter(Boolean).join(" · ");
  }
  if (level === "senior-high" || level === "junior-high" || level === "elementary") {
    const label = level === "senior-high" ? "Senior High" : level === "junior-high" ? "Junior High" : "Elementary";
    return [label, info.grade ? `Grade ${info.grade}` : "", info.section ? `Sec ${info.section}` : ""].filter(Boolean).join(" · ");
  }
  return "Student";
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function UserDashboardPanel() {
  const [submissions, setSubmissions] = useState<EvaluationSubmission[]>([]);
  const [availableFaculty, setAvailableFaculty] = useState(0);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStudentInfo(getStudentInfo());
    void (async () => {
      let currentStudentId: string | undefined;
      try {
        const raw = document.cookie.split("; ")
          .find((c) => c.startsWith("eval_user_info="))?.split("=").slice(1).join("=");
        if (raw) {
          const info = JSON.parse(decodeURIComponent(raw)) as { username?: string; id?: string };
          currentStudentId = info.username ?? info.id;
        }
      } catch { /* ignore */ }

      const [allSubs, faculty] = await Promise.all([
        getEvaluationSubmissionsAsync(),
        getFacultyAsync(),
      ]);
      const mySubs = currentStudentId
        ? allSubs.filter((s) => s.studentId === currentStudentId)
        : allSubs;
      setSubmissions(mySubs);
      setAvailableFaculty(faculty.length);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => ({
    teachersEvaluated: submissions.length,
    submitted: submissions.length,
  }), [submissions]);

  const progressPct = availableFaculty > 0
    ? Math.min(100, Math.round((stats.teachersEvaluated / availableFaculty) * 100))
    : 0;

  const displayName = studentInfo.name || studentInfo.username || "Student";
  const subtitle = buildSubtitle(studentInfo);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">

      {/* ── Welcome card ── */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-6 text-white"
        style={{ background: "linear-gradient(135deg, #0d2254 0%, #0a1a3a 100%)" }}
      >
        {/* decorative circles */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 right-20 h-24 w-24 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-lg font-extrabold text-blue-900">
              {initial}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
                Student Portal
              </p>
              <h2 className="mt-0.5 text-xl font-bold text-white">
                Welcome back, {displayName}!
              </h2>
              {subtitle && (
                <p className="mt-0.5 text-sm text-blue-200/80">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2 stat cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Teachers Evaluated */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                className="h-5 w-5 text-emerald-600" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Teachers Evaluated</p>
              <p className="mt-0.5 text-3xl font-extrabold text-slate-900">{stats.teachersEvaluated}</p>
              <p className="mt-0.5 text-xs text-slate-400">Unique faculty evaluated</p>
            </div>
          </div>

          {/* Submitted Evaluations */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                className="h-5 w-5 text-blue-600" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 104 0M9 5a2 2 0 014 0M9 12h6M9 16h4"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Submitted Evaluations</p>
              <p className="mt-0.5 text-3xl font-extrabold text-slate-900">{stats.submitted}</p>
              <p className="mt-0.5 text-xs text-slate-400">Total submissions</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Evaluation progress bar ── */}
      {!loading && availableFaculty > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Evaluation Progress</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {stats.teachersEvaluated} of {availableFaculty} teacher{availableFaculty !== 1 ? "s" : ""} evaluated
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              progressPct === 100
                ? "bg-emerald-100 text-emerald-700"
                : progressPct > 0
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-500"
            }`}>
              {progressPct}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                progressPct === 100 ? "bg-emerald-500"
                : progressPct > 0 ? "bg-brand-500"
                : "bg-slate-300"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {progressPct === 100 && (
            <p className="mt-2 text-xs font-medium text-emerald-600">
              ✓ You have completed all evaluations!
            </p>
          )}
        </div>
      )}

      {/* ── Recent evaluations table ── */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="shrink-0 border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Recent Evaluations</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Your latest teacher evaluation submissions.
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
            <p className="mt-3 text-xs text-slate-400">Loading…</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="h-8 w-8 text-slate-400" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 104 0M9 5a2 2 0 014 0M9 12h6M9 16h4"/>
              </svg>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">No evaluations yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Complete your first evaluation to see it here.
            </p>
          </div>
        ) : (
          <div className="min-h-0 max-h-80 overflow-y-auto overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Faculty</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => {
                  const score = getOverallScore(sub.scoringAnswers);
                  const hasScore = Object.keys(sub.scoringAnswers).length > 0;
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {sub.facultyName}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{sub.subject}</td>
                      <td className="px-6 py-4">
                        {!hasScore ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <div className="flex items-center gap-3 min-w-[160px]">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${scoreBarClass(score)}`}
                                style={{ width: `${(score / maxOverallScore) * 100}%` }}
                              />
                            </div>
                            <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${scoreBadgeClass(score)}`}>
                              {score.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatSubmissionDate(sub.submittedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
