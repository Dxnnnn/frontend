"use client";

import { useEffect, useState } from "react";

interface DashboardData {
  totalStudents: number;
  totalFaculty: number;
  totalSchoolHeads: number;
  totalSubjects: number;
  totalEvaluations: number;
  studentSubmissions: number;
  schoolHeadSubmissions: number;
  activeSemester: string | null;
  studentsByLevel: Record<string, number>;
  evaluationsByDept: Record<string, number>;
  topFaculty: Array<{ name: string; avgScore: number; evaluationCount: number }>;
}

// ── helpers ───────────────────────────────────────────────────────────────────
function safePct(v: number, total: number) {
  return total === 0 ? 0 : Math.min(100, Math.round((v / total) * 100));
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  stripColor?: string; // kept for API compat but no longer rendered
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
      {icon && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-3xl font-extrabold text-slate-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const p = safePct(value, Math.max(max, 1));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-xs font-semibold text-slate-900">{value} <span className="font-normal text-slate-400">/ {max}</span></span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${p}%` }} />
      </div>
      <p className="text-right text-xs text-slate-400">{p}%</p>
    </div>
  );
}

// ── Dept bar chart ────────────────────────────────────────────────────────────
const DEPT_COLORS: Record<string, string> = {
  "College": "bg-[#0d2254]",
  "Senior High School": "bg-violet-500",
  "Elementary-Junior High School": "bg-emerald-500",
  "Junior High School": "bg-emerald-500",
};

function DeptBars({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  if (!entries.length) return <p className="py-8 text-center text-sm text-slate-400">No data yet.</p>;
  return (
    <div className="space-y-3">
      {entries.map(([dept, count]) => (
        <div key={dept} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="truncate max-w-[70%] font-medium text-slate-700">
              {dept.replace("Elementary-Junior High School", "JHS").replace("Senior High School", "SHS")}
            </span>
            <span className="font-bold text-slate-900">{count}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${DEPT_COLORS[dept] ?? "bg-slate-400"} transition-all duration-700`}
              style={{ width: `${Math.round((count / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Pie chart ─────────────────────────────────────────────────────────────────
const LEVEL_COLORS: Record<string, string> = {
  college: "#3b48df",
  "senior-high": "#7c3aed",
  "junior-high": "#059669",
  elementary: "#f59e0b",
};
const LEVEL_LABELS: Record<string, string> = {
  college: "College",
  "senior-high": "Senior High",
  "junior-high": "Junior High",
  elementary: "Elementary",
};

function PieChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total = entries.reduce((a, [, v]) => a + v, 0);
  if (!total) return <p className="py-8 text-center text-sm text-slate-400">No student data yet.</p>;
  const cx = 90; const cy = 90; const r = 78;
  const toRad = (d: number) => (d * Math.PI) / 180;
  let cum = -90;
  const slices = entries.map(([key, val]) => {
    const angle = (val / total) * 360;
    const s = cum; cum += angle;
    const x1 = cx + r * Math.cos(toRad(s));
    const y1 = cy + r * Math.sin(toRad(s));
    const x2 = cx + r * Math.cos(toRad(cum));
    const y2 = cy + r * Math.sin(toRad(cum));
    const mid = s + angle / 2;
    const p = Math.round((val / total) * 100);
    return {
      key, val, p,
      color: LEVEL_COLORS[key] ?? "#94a3b8",
      label: LEVEL_LABELS[key] ?? key,
      d: `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2}Z`,
      lx: cx + r * 0.62 * Math.cos(toRad(mid)),
      ly: cy + r * 0.62 * Math.sin(toRad(mid)),
    };
  });
  return (
    <div className="flex flex-col items-center gap-5">
      <svg viewBox="0 0 180 180" className="w-52 h-52">
        {slices.map((s) => (
          <g key={s.key}>
            <path d={s.d} fill={s.color} stroke="white" strokeWidth="2" />
            {s.p > 5 && (
              <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle"
                fontSize="11" fontWeight="700" fill="white">{s.p}%</text>
            )}
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        {slices.map((s) => (
          <div key={s.key} className="flex items-center gap-2 text-xs">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="text-slate-600">{s.label}</span>
            <span className="font-bold text-slate-800">({s.val})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stars + score badge ───────────────────────────────────────────────────────
function Stars({ score }: { score: number }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} viewBox="0 0 24 24"
          className={`h-3 w-3 ${i <= Math.round(score) ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcoStudents  = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H2v-2a4 4 0 014-4h1a4 4 0 014 0v2z"/><circle cx="9" cy="7" r="3"/></svg>;
const IcoFaculty   = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12 12 0 0120 17.5C20 19 16.42 21 12 21S4 19 4 17.5c0-1.12.52-2.76 1.84-3.922L12 14z"/></svg>;
const IcoSchHead   = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H2v-2a4 4 0 014-4h1a4 4 0 014 0v2z"/><circle cx="9" cy="7" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M22 20v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const IcoSubjects  = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>;
const IcoStudSub   = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 104 0M9 5a2 2 0 014 0M9 12h6M9 16h4"/></svg>;
const IcoSHSub     = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

// ── Main ──────────────────────────────────────────────────────────────────────
export interface AdminAnalyticsProps {
  permissions?: Record<string, boolean>;
}

export function AdminAnalytics({ permissions }: AdminAnalyticsProps = {}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  function can(key: string) { return !permissions || permissions[key] === true; }

  const showStudent    = can("accounts.student") || can("evaluation_status.student") || can("reports.student");
  const showSchoolHead = can("accounts.school_head") || can("evaluation_status.school_head") || can("reports.school_head");
  const showFaculty    = can("faculty") || can("reports.student") || can("reports.school_head");
  const showSubjects   = can("subjects");
  const showEval       = can("evaluation_status.student") || can("evaluation_status.school_head") || can("reports.student") || can("reports.school_head");

  useEffect(() => {
    fetch("/api/dashboard-stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setData(d as DashboardData))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-24 rounded-2xl bg-slate-100 border border-slate-200" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-52 rounded-2xl bg-slate-100 border border-slate-200" />
          <div className="h-52 rounded-2xl bg-slate-100 border border-slate-200" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Build the cards list based on permissions
  const cards: Array<{ key: string; node: React.ReactNode }> = [];
  if (showStudent)    cards.push({ key: "students",   node: <StatCard label="Total Students"          value={data.totalStudents}         sub="Registered accounts"   stripColor="bg-blue-500"    icon={IcoStudents} /> });
  if (showFaculty)    cards.push({ key: "faculty",    node: <StatCard label="Total Faculty"           value={data.totalFaculty}          sub="Active instructors"    stripColor="bg-violet-500"  icon={IcoFaculty}  /> });
  if (showSchoolHead) cards.push({ key: "schoolhead", node: <StatCard label="Total School Heads"      value={data.totalSchoolHeads}      sub="Department heads"      stripColor="bg-orange-500"  icon={IcoSchHead}  /> });
  if (showSubjects)   cards.push({ key: "subjects",   node: <StatCard label="Total Subjects"          value={data.totalSubjects}         sub="All departments"       stripColor="bg-[#0d2254]"   /> });
  if (showStudent)    cards.push({ key: "studsub",    node: <StatCard label="Student Submissions"     value={data.studentSubmissions}    sub="Evaluations submitted" stripColor="bg-cyan-500"    icon={IcoStudSub}  /> });
  if (showSchoolHead) cards.push({ key: "shsub",      node: <StatCard label="School Head Submissions" value={data.schoolHeadSubmissions} sub="Evaluations submitted" stripColor="bg-amber-500"   icon={IcoSHSub}    /> });

  // Grid class: always 3 columns — cards fill left-to-right naturally
  // With 6 cards → 3+3; with 2 cards → 2 full-width cards stretched via col-span
  const is2Cards = cards.length <= 2;

  return (
    <div className="space-y-6">

      {/* ── Active semester ── */}
      {data.activeSemester && (
        <div className="flex items-center gap-3 rounded-xl border border-[#0d2254]/20 bg-[#0d2254]/5 px-4 py-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
            className="h-4 w-4 shrink-0 text-[#0d2254]" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          <span className="text-sm font-semibold text-[#0d2254]">{data.activeSemester}</span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Active
          </span>
        </div>
      )}

      {/* ── Stat cards ── */}
      {cards.length > 0 && (
        is2Cards ? (
          /* 2 cards → each fills half the row equally */
          <div className="grid grid-cols-2 gap-4">
            {cards.map((c) => <div key={c.key}>{c.node}</div>)}
          </div>
        ) : (
          /* 3-6 cards → always 3 per row */
          <div className="grid grid-cols-3 gap-4">
            {cards.map((c) => <div key={c.key}>{c.node}</div>)}
          </div>
        )
      )}

      {/* ── Charts ── */}
      {showEval && (
        <div className="grid gap-4 md:grid-cols-2 items-start">

          {/* LEFT — Eval Progress + Dept bars stacked */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Evaluation Progress</h2>
              <p className="mt-0.5 text-xs text-slate-500 mb-5">Submission rate by evaluator type.</p>
              <div className="space-y-4">
                {showStudent && (
                  <ProgressBar
                    label="Student Evaluations"
                    value={data.studentSubmissions}
                    max={Math.max(data.totalStudents, data.studentSubmissions)}
                    color="bg-blue-500"
                  />
                )}
                {showSchoolHead && (
                  <ProgressBar
                    label="School Head Evaluations"
                    value={data.schoolHeadSubmissions}
                    max={Math.max(data.totalSchoolHeads, data.schoolHeadSubmissions)}
                    color="bg-orange-500"
                  />
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Evaluations by Department</h2>
              <p className="mt-0.5 text-xs text-slate-500 mb-5">Distribution across departments.</p>
              <DeptBars data={data.evaluationsByDept} />
            </div>
          </div>

          {/* RIGHT — Students by Level filling full height */}
          {showStudent && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-full flex flex-col">
              <h2 className="text-base font-semibold text-slate-900">Students by Level</h2>
              <p className="mt-0.5 text-xs text-slate-500 mb-4">Account breakdown per education level.</p>
              <div className="flex flex-1 items-center justify-center">
                <PieChart data={data.studentsByLevel} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Top Faculty ── */}
      {showFaculty && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Top Rated Faculty</h2>
          <p className="mt-0.5 text-xs text-slate-500 mb-4">Based on average evaluation scores.</p>
          {data.topFaculty.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No evaluation scores yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topFaculty.map((f, i) => (
                <div key={f.name} className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    i === 0 ? "bg-amber-100 text-amber-700"
                    : i === 1 ? "bg-slate-200 text-slate-600"
                    : "bg-orange-100 text-orange-700"
                  }`}>{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{f.name}</p>
                    <Stars score={f.avgScore} />
                  </div>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                    {f.avgScore.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
