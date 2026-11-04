"use client";

import { useEffect, useState } from "react";

interface DashboardData {
  totalStudents: number;
  totalFaculty: number;
  totalSubjects: number;
  totalEvaluations: number;
  studentSubmissions: number;
  schoolHeadSubmissions: number;
  activeSemester: string | null;
  studentsByLevel: Record<string, number>;
  evaluationsByDept: Record<string, number>;
  topFaculty: Array<{ name: string; avgScore: number; evaluationCount: number }>;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, color, icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}) {
  const bgColor = color
    .replace("text-blue", "bg-blue").replace("text-emerald", "bg-emerald")
    .replace("text-orange", "bg-orange").replace("text-violet", "bg-violet")
    .replace("text-brand", "bg-brand").replace("-700", "-100").replace("-600", "-100");

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
          {sub && <p className="mt-1.5 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgColor}`}>
          {icon}
        </div>
      </div>
    </article>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-900">{value} <span className="font-normal text-slate-400">/ {max}</span></span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 text-right">{pct}%</p>
    </div>
  );
}

// ── Dept Bar Chart ────────────────────────────────────────────────────────────
const DEPT_COLORS: Record<string, string> = {
  "College": "bg-brand-500",
  "Senior High School": "bg-violet-500",
  "Elementary-Junior High School": "bg-emerald-500",
  "Junior High School": "bg-emerald-500",
};

function DeptBarChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No evaluation data yet.</p>;
  }

  return (
    <div className="space-y-3">
      {entries.map(([dept, count]) => {
        const pct = Math.round((count / max) * 100);
        const label = dept.replace("Elementary-Junior High School", "JHS").replace("Senior High School", "SHS");
        const barColor = DEPT_COLORS[dept] ?? "bg-slate-400";
        return (
          <div key={dept} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 truncate max-w-[70%]">{label}</span>
              <span className="font-bold text-slate-900">{count}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Score Badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 4.5 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : score >= 4 ? "bg-blue-50 text-blue-700 border-blue-200"
    : score >= 3 ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-red-50 text-red-600 border-red-200";
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${cls}`}>
      {score.toFixed(2)}
    </span>
  );
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ score }: { score: number }) {
  const filled = Math.round(score);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${i <= filled ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// ── Quick Action ──────────────────────────────────────────────────────────────
// ── Main ──────────────────────────────────────────────────────────────────────
export function AdminAnalytics() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard-stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setData(d as DashboardData))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const evalProgress = data.totalStudents > 0
    ? Math.round((data.studentSubmissions / data.totalStudents) * 100)
    : 0;

  return (
    <div className="space-y-8">

      {/* ── Active Semester Banner ── */}
      {data.activeSemester && (
        <div className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0 text-brand-600" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <div>
            <span className="text-sm font-semibold text-brand-800">Active Semester:</span>
            <span className="ml-2 text-sm text-brand-700">{data.activeSemester}</span>
          </div>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Active
          </span>
        </div>
      )}

      {/* ── Stats Row ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Total Students" value={data.totalStudents} sub="Registered accounts"
          color="text-blue-700"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-blue-700" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H2v-2a4 4 0 014-4h1a4 4 0 014 0v2z" /><circle cx="9" cy="7" r="3" /></svg>} />
        <StatCard label="Total Faculty" value={data.totalFaculty} sub="Instructors"
          color="text-violet-700"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-violet-700" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
        <StatCard label="Total Subjects" value={data.totalSubjects} sub="All departments"
          color="text-brand-700"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-brand-700" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>} />
        <StatCard label="Total Evaluations" value={data.totalEvaluations} sub="All submissions"
          color="text-emerald-700"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-emerald-700" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard label="Student Submissions" value={data.studentSubmissions} sub="From students"
          color="text-blue-600"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-blue-600" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 104 0M9 5a2 2 0 014 0" /></svg>} />
        <StatCard label="School Head Submissions" value={data.schoolHeadSubmissions} sub="From school heads"
          color="text-orange-600"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-orange-600" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>} />
      </div>

      {/* ── 2-Column Layout ── */}
      <div className="grid gap-6 md:grid-cols-2 items-stretch">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6 h-full">

          {/* Evaluation Progress */}
          <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Evaluation Progress</h2>
            <p className="mt-0.5 text-xs text-slate-500 mb-5">How many students and school heads have submitted evaluations.</p>

            <div className="mb-6 flex items-center gap-5">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-8 border-brand-100">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#3b48df ${evalProgress * 3.6}deg, #e8eaff ${evalProgress * 3.6}deg)`,
                  }}
                />
                <span className="relative z-10 text-lg font-bold text-brand-700 bg-white rounded-full flex items-center justify-center h-14 w-14">
                  {evalProgress}%
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{data.studentSubmissions}</p>
                <p className="text-sm text-slate-500">of {data.totalStudents} students submitted</p>
              </div>
            </div>

            <div className="space-y-4">
              <ProgressBar
                value={data.studentSubmissions}
                max={Math.max(data.totalStudents, data.studentSubmissions)}
                color="bg-blue-500"
                label="Student Evaluations"
              />
              <ProgressBar
                value={data.schoolHeadSubmissions}
                max={Math.max(data.totalFaculty, data.schoolHeadSubmissions)}
                color="bg-orange-500"
                label="School Head Evaluations"
              />
            </div>
          </div>

          {/* Evaluations by Department */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex-1">
            <h2 className="text-base font-semibold text-slate-900">Evaluations by Department</h2>
            <p className="mt-0.5 text-xs text-slate-500 mb-5">Distribution of submitted evaluations across departments.</p>
            <DeptBarChart data={data.evaluationsByDept} />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6 h-full">

          {/* Students by Level — Pie Chart */}
          <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Students by Level</h2>
            <p className="mt-0.5 text-xs text-slate-500 mb-6">Breakdown of student accounts per education level.</p>

            {(() => {
              const levels = [
                { key: "college", label: "College", color: "#3b48df" },
                { key: "senior-high", label: "Senior High", color: "#7c3aed" },
                { key: "junior-high", label: "Junior High", color: "#059669" },
              ];
              const values = levels.map((l) => data.studentsByLevel[l.key] ?? 0);
              const total = values.reduce((a, b) => a + b, 0);

              if (total === 0) {
                return <p className="py-8 text-center text-sm text-slate-400">No student data yet.</p>;
              }

              const cx = 80; const cy = 80; const r = 70;
              let cumAngle = -90;
              const slices = levels.map((level, i) => {
                const val = values[i];
                const pct = val / total;
                const angle = pct * 360;
                const startAngle = cumAngle;
                cumAngle += angle;
                const endAngle = cumAngle;
                const toRad = (deg: number) => (deg * Math.PI) / 180;
                const x1 = cx + r * Math.cos(toRad(startAngle));
                const y1 = cy + r * Math.sin(toRad(startAngle));
                const x2 = cx + r * Math.cos(toRad(endAngle));
                const y2 = cy + r * Math.sin(toRad(endAngle));
                const largeArc = angle > 180 ? 1 : 0;
                const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                const midAngle = startAngle + angle / 2;
                const lx = cx + (r * 0.65) * Math.cos(toRad(midAngle));
                const ly = cy + (r * 0.65) * Math.sin(toRad(midAngle));
                return { ...level, val, pct, d, lx, ly };
              });

              return (
                <div className="flex flex-col items-center gap-4">
                  <svg viewBox="0 0 160 160" className="w-56 h-56" aria-label="Students by level pie chart">
                    {slices.map((s) => (
                      <g key={s.key}>
                        <path d={s.d} fill={s.color} opacity={0.9} stroke="white" strokeWidth="2" />
                        {s.pct > 0.05 && (
                          <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle"
                            fontSize="11" fontWeight="700" fill="white">
                            {Math.round(s.pct * 100)}%
                          </text>
                        )}
                      </g>
                    ))}
                  </svg>
                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                    {slices.map((s) => (
                      <div key={s.key} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span>{s.label}</span>
                        <span className="font-semibold text-slate-800">({s.val})</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Top Rated Faculty */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex-1">
            <h2 className="text-base font-semibold text-slate-900">Top Rated Faculty</h2>
            <p className="mt-0.5 text-xs text-slate-500 mb-4">Based on average evaluation scores.</p>
            {data.topFaculty.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No evaluation scores yet.</p>
            ) : (
              <div className="space-y-3">
                {data.topFaculty.map((f, i) => (
                  <div key={f.name} className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      i === 0 ? "bg-amber-100 text-amber-700" :
                      i === 1 ? "bg-slate-200 text-slate-600" :
                      i === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{f.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Stars score={f.avgScore} />
                        <span className="text-xs text-slate-400">{f.evaluationCount} eval{f.evaluationCount !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <ScoreBadge score={f.avgScore} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
