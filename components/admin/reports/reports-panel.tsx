"use client";

import { useEffect, useMemo, useState } from "react";
import { getEvaluationSubmissionsAsync } from "@/lib/user/evaluation-submissions";
import { loadQuestions } from "@/lib/evaluations/storage";
import { useIsClient } from "@/lib/hooks/use-is-client";
import { getLiveTeacherScoresAsync, getLiveCombinedDistributionAsync } from "@/lib/reports/live-teacher-scores";
import { getScoreSlices, getTotalResponses } from "@/lib/reports/teacher-scores";
import type { EvaluationSubmission } from "@/lib/types/evaluation-submission";
import type { TeacherScore } from "@/lib/types/teacher-score";

// ── helpers ──────────────────────────────────────────────────────────────────

function scoreColor(s: number) {
  if (s >= 4.5) return "text-emerald-600";
  if (s >= 4) return "text-blue-600";
  if (s >= 3) return "text-amber-600";
  return "text-red-500";
}
function scoreBarBg(s: number) {
  if (s >= 4.5) return "bg-emerald-500";
  if (s >= 4) return "bg-blue-500";
  if (s >= 3) return "bg-amber-500";
  return "bg-red-400";
}
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
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, subtitle, children, id }: { title: string; subtitle?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10 text-slate-300" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}


// ── 1. Dashboard Summary ──────────────────────────────────────────────────────
function DashboardSummary({ submissions, teachers }: { submissions: EvaluationSubmission[]; teachers: TeacherScore[] }) {
  const avgScore = teachers.length > 0
    ? teachers.reduce((s, t) => s + t.overallScore, 0) / teachers.length
    : 0;
  const depts = new Set(submissions.map((s) => s.department)).size;
  const uniqueStudents = new Set(submissions.map((s) => s.studentId ?? s.studentName ?? "")).size;

  const stats = [
    { label: "Total Evaluations", value: submissions.length, icon: "📋", color: "bg-blue-50 text-blue-700" },
    { label: "Faculty Evaluated", value: teachers.length, icon: "👨‍🏫", color: "bg-emerald-50 text-emerald-700" },
    { label: "Avg Overall Score", value: avgScore > 0 ? avgScore.toFixed(2) : "—", icon: "⭐", color: "bg-amber-50 text-amber-700" },
    { label: "Departments", value: depts, icon: "🏫", color: "bg-violet-50 text-violet-700" },
    { label: "Students Participated", value: uniqueStudents, icon: "🎓", color: "bg-pink-50 text-pink-700" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) => (
        <div key={s.label} className={`flex flex-col items-center gap-2 rounded-2xl border border-slate-100 p-4 text-center ${s.color}`}>
          <span className="text-2xl">{s.icon}</span>
          <span className="text-2xl font-extrabold">{s.value}</span>
          <span className="text-xs font-medium leading-tight">{s.label}</span>
        </div>
      ))}
    </div>
  );
}


// ── 2. Faculty Performance Ranking ────────────────────────────────────────────
function FacultyRanking({ teachers, activeFacultyIds }: { teachers: TeacherScore[]; activeFacultyIds: Set<string> }) {
  if (teachers.length === 0) return <EmptyState message="No evaluations submitted yet." />;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
            <th className="pb-3 pr-4 text-left">Rank</th>
            <th className="pb-3 pr-4 text-left">Faculty</th>
            <th className="pb-3 pr-4 text-left">Department</th>
            <th className="pb-3 pr-4 text-left">Score</th>
            <th className="pb-3 pr-4 text-left">Evals</th>
            <th className="pb-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {teachers.map((t, i) => {
            const isDeleted = !activeFacultyIds.has(t.id);
            return (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="py-3 pr-4">
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-100 text-slate-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-500"}`}>
                    {i + 1}
                  </span>
                </td>
                <td className="py-3 pr-4 font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    {t.name}
                    {isDeleted && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">Deleted</span>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4 text-slate-500">{t.department}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${scoreBarBg(t.overallScore)}`} style={{ width: `${(t.overallScore / 5) * 100}%` }} />
                    </div>
                    <span className={`font-semibold ${scoreColor(t.overallScore)}`}>{t.overallScore.toFixed(2)}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-slate-600">{t.evaluationCount}</td>
                <td className="py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${scoreBadge(t.overallScore)}`}>{scoreLabel(t.overallScore)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


// ── 3. Overall Average Rating + Rating Distribution ───────────────────────────
const PIE_SIZE = 180, PIE_R = 72, PIE_C = 90;
function polar(angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: PIE_C + PIE_R * Math.cos(rad), y: PIE_C + PIE_R * Math.sin(rad) };
}
function slicePath(start: number, end: number) {
  const s = polar(end), e = polar(start);
  return [`M ${PIE_C} ${PIE_C}`, `L ${s.x} ${s.y}`, `A ${PIE_R} ${PIE_R} 0 ${end - start > 180 ? 1 : 0} 0 ${e.x} ${e.y}`, "Z"].join(" ");
}

import type { ScoreDistribution } from "@/lib/types/teacher-score";

const EMPTY_DIST: ScoreDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };

function OverallRatingAndDistribution({ submissions }: { submissions: EvaluationSubmission[] }) {
  const mounted = useIsClient();
  const [dist, setDist] = useState<ScoreDistribution>(EMPTY_DIST);

  useEffect(() => {
    void getLiveCombinedDistributionAsync().then((d) => setDist(d));
  }, [submissions]);

  const total = getTotalResponses(dist);
  const slices = getScoreSlices(dist);
  const avg = total === 0 ? 0 : (dist[5]*5 + dist[4]*4 + dist[3]*3 + dist[2]*2 + dist[1]*1) / total;

  const paths: { slice: typeof slices[0]; path: string }[] = [];
  let cur = 0;
  for (const s of slices.filter((x) => x.count > 0)) {
    const sweep = (s.percentage / 100) * 360;
    paths.push({ slice: s, path: slicePath(cur, cur + sweep) });
    cur += sweep;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Pie */}
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-sm font-semibold text-slate-700">Overall Average Rating</h3>
        <div className="relative">
          <svg viewBox={`0 0 ${PIE_SIZE} ${PIE_SIZE}`} className="h-44 w-44">
            {mounted && paths.length > 0 ? paths.map(({ slice, path }) => (
              <path key={slice.value} d={path} fill={slice.color} stroke="#fff" strokeWidth="2" />
            )) : <circle cx={PIE_C} cy={PIE_C} r={PIE_R} fill="#e2e8f0" />}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-slate-900" style={{ textShadow: "0 0 4px #fff" }}>{mounted && total > 0 ? avg.toFixed(2) : "—"}</span>
            <span className="text-xs text-slate-500">out of 5</span>
          </div>
        </div>
        {mounted && total > 0 && <span className={`rounded-full px-3 py-1 text-sm font-semibold ${scoreBadge(avg)}`}>{scoreLabel(avg)}</span>}
      </div>
      {/* Distribution bars */}
      <div className="flex flex-col justify-center gap-3">
        <h3 className="text-sm font-semibold text-slate-700">Rating Distribution</h3>
        {slices.map((s) => (
          <div key={s.value} className="flex items-center gap-3 text-sm">
            <span className="w-16 shrink-0 text-right font-medium text-slate-700">{s.value} – {s.label}</span>
            <div className="flex-1 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full transition-all" style={{ width: mounted ? `${s.percentage}%` : "0%", backgroundColor: s.color }} />
            </div>
            <span className="w-12 text-right text-slate-500">{mounted ? s.count : 0}</span>
            <span className="w-12 text-right text-slate-400 text-xs">{mounted ? s.percentage.toFixed(1) : "0.0"}%</span>
          </div>
        ))}
        {mounted && total === 0 && <p className="text-sm text-slate-400">No responses yet.</p>}
      </div>
    </div>
  );
}


// ── 4. Highest & Lowest Rated Questions ──────────────────────────────────────
function QuestionRatings({ submissions }: { submissions: EvaluationSubmission[] }) {
  const [questions, setQuestions] = useState<import("@/lib/types/survey-question").SurveyQuestion[]>([]);

  useEffect(() => {
    void loadQuestions().then((qs) =>
      setQuestions(qs.filter((q) => q.audience === "student" && q.evaluationType === "rating")),
    );
  }, []);

  const questionScores = useMemo(() => {
    const qMap = new Map(questions.map((q) => [q.id, q]));
    const totals = new Map<string, { sum: number; count: number }>();
    for (const sub of submissions) {
      for (const [qId, score] of Object.entries(sub.scoringAnswers)) {
        const cur = totals.get(qId) ?? { sum: 0, count: 0 };
        totals.set(qId, { sum: cur.sum + score, count: cur.count + 1 });
      }
    }
    return [...totals.entries()]
      .map(([qId, { sum, count }]) => ({
        id: qId,
        text: qMap.get(qId)?.text ?? "Unknown question",
        avg: sum / count,
        count,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [submissions, questions]);

  if (questionScores.length === 0) return <EmptyState message="No question data yet." />;

  const top3 = questionScores.slice(0, 3);
  const bottom3 = [...questionScores].reverse().slice(0, 3);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-emerald-700">🏆 Highest Rated Questions</h3>
        <ul className="space-y-3">
          {top3.map((q, i) => (
            <li key={q.id} className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-800 leading-snug">{i + 1}. {q.text}</p>
                <span className="shrink-0 text-sm font-bold text-emerald-700">{q.avg.toFixed(2)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{q.count} response{q.count !== 1 ? "s" : ""}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-red-600">⚠ Lowest Rated Questions</h3>
        <ul className="space-y-3">
          {bottom3.map((q, i) => (
            <li key={q.id} className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-800 leading-snug">{i + 1}. {q.text}</p>
                <span className="shrink-0 text-sm font-bold text-red-600">{q.avg.toFixed(2)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{q.count} response{q.count !== 1 ? "s" : ""}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


// ── 5. Student Evaluation Completion ─────────────────────────────────────────
function StudentCompletion({ submissions }: { submissions: EvaluationSubmission[] }) {
  const byStudent = useMemo(() => {
    const map = new Map<string, { name: string; count: number; lastAt: string }>();
    for (const s of submissions) {
      const key = s.studentId ?? s.studentName ?? "Unknown";
      const cur = map.get(key) ?? { name: s.studentName ?? s.studentId ?? "Unknown", count: 0, lastAt: s.submittedAt };
      map.set(key, { name: cur.name, count: cur.count + 1, lastAt: s.submittedAt > cur.lastAt ? s.submittedAt : cur.lastAt });
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [submissions]);

  if (byStudent.length === 0) return <EmptyState message="No student submissions yet." />;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
            <th className="pb-3 pr-4 text-left">Student</th>
            <th className="pb-3 pr-4 text-left">Evaluations Submitted</th>
            <th className="pb-3 text-left">Last Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {byStudent.map((s) => (
            <tr key={s.name} className="hover:bg-slate-50">
              <td className="py-3 pr-4 font-medium text-slate-900">{s.name}</td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min((s.count / 10) * 100, 100)}%` }} />
                  </div>
                  <span className="font-semibold text-slate-700">{s.count}</span>
                </div>
              </td>
              <td className="py-3 text-slate-500">{fmtDate(s.lastAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// ── 6. Faculty Detailed Report ────────────────────────────────────────────────
function FacultyDetailedReport({ submissions, teachers, search, activeFacultyIds }: { submissions: EvaluationSubmission[]; teachers: TeacherScore[]; search: string; activeFacultyIds: Set<string> }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.department.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) return <EmptyState message="No faculty data matches your search." />;

  return (
    <div className="space-y-3">
      {filtered.map((t) => {
        const subs = submissions.filter((s) => s.facultyId === t.id);
        const isOpen = expanded === t.id;
        const isDeleted = !activeFacultyIds.has(t.id);
        return (
          <div key={t.id} className="rounded-xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : t.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{t.name}</p>
                    {isDeleted && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">Deleted</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{t.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${scoreBadge(t.overallScore)}`}>{t.overallScore.toFixed(2)}</span>
                <span className="text-xs text-slate-400">{t.evaluationCount} eval{t.evaluationCount !== 1 ? "s" : ""}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Score distribution */}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Score Distribution</p>
                    {([5,4,3,2,1] as const).map((v) => {
                      const cnt = t.scoreDistribution[v];
                      const total = Object.values(t.scoreDistribution).reduce((a,b) => a+b, 0);
                      const pct = total > 0 ? (cnt / total) * 100 : 0;
                      return (
                        <div key={v} className="mb-1.5 flex items-center gap-2 text-xs">
                          <span className="w-4 text-right text-slate-500">{v}</span>
                          <div className="flex-1 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div className={`h-full rounded-full ${scoreBarBg(v)}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-6 text-right text-slate-500">{cnt}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Per-subject breakdown */}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase text-slate-500">By Subject</p>
                    {(() => {
                      const bySubject = new Map<string, { sum: number; count: number }>();
                      for (const s of subs) {
                        const cur = bySubject.get(s.subject) ?? { sum: 0, count: 0 };
                        const scores = Object.values(s.scoringAnswers);
                        const avg = scores.length > 0 ? scores.reduce((a,b) => a+b,0) / scores.length : 0;
                        bySubject.set(s.subject, { sum: cur.sum + avg, count: cur.count + 1 });
                      }
                      return [...bySubject.entries()].map(([subj, { sum, count }]) => (
                        <div key={subj} className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="truncate text-slate-700">{subj}</span>
                          <span className={`ml-2 font-semibold ${scoreColor(sum/count)}`}>{(sum/count).toFixed(2)}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
                {/* Remarks */}
                {subs.some((s) => s.remarks) && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Student Remarks</p>
                    <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                      {subs.filter((s) => s.remarks).map((s) => (
                        <li key={s.id} className="rounded-lg bg-white border border-slate-100 px-3 py-2 text-xs text-slate-600">
                          &ldquo;{s.remarks}&rdquo;
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ── 7. Recent Evaluation Activity ─────────────────────────────────────────────
function RecentActivity({ submissions }: { submissions: EvaluationSubmission[] }) {
  const recent = submissions.slice(0, 15);
  if (recent.length === 0) return <EmptyState message="No activity yet." />;
  return (
    <ul className="divide-y divide-slate-100">
      {recent.map((s) => {
        const scores = Object.values(s.scoringAnswers);
        const avg = scores.length > 0 ? scores.reduce((a,b) => a+b,0) / scores.length : 0;
        return (
          <li key={s.id} className="flex items-center gap-3 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {s.facultyName.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{s.facultyName}</p>
              <p className="truncate text-xs text-slate-500">{s.subject} · {s.department}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className={`text-sm font-semibold ${scoreColor(avg)}`}>{avg.toFixed(2)}</p>
              <p className="text-xs text-slate-400">{fmtDate(s.submittedAt)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}


// ── Export helpers ─────────────────────────────────────────────────────────────
function buildCSV(submissions: EvaluationSubmission[], teachers: TeacherScore[]): string {
  const header = ["Faculty", "Department", "Subject", "Semester", "Student", "Avg Score", "Date", "Remarks"];
  const rows = submissions.map((s) => {
    const scores = Object.values(s.scoringAnswers);
    const avg = scores.length > 0 ? (scores.reduce((a,b) => a+b,0) / scores.length).toFixed(2) : "0";
    return [
      s.facultyName,
      s.department,
      s.subject,
      s.semester ?? "",
      s.studentName ?? s.studentId ?? "",
      avg,
      fmtDate(s.submittedAt),
      (s.remarks ?? "").replace(/,/g, ";"),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Export Buttons ─────────────────────────────────────────────────────────────
function ExportButtons({ submissions, teachers }: { submissions: EvaluationSubmission[]; teachers: TeacherScore[] }) {
  function handleExcelCSV() {
    downloadFile(buildCSV(submissions, teachers), "evaluation-report.csv", "text/csv");
  }

  function handlePrint() {
    window.print();
  }

  function handlePDF() {
    window.print(); // browser print → Save as PDF
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={handlePDF}
        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Export PDF
      </button>
      <button type="button" onClick={handleExcelCSV}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6M4 20h16a1 1 0 001-1V6l-5-5H4a1 1 0 00-1 1v17a1 1 0 001 1z" />
        </svg>
        Export Excel
      </button>
      <button type="button" onClick={handlePrint}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print Report
      </button>
    </div>
  );
}


// ── Main ReportsPanel ──────────────────────────────────────────────────────────
export function ReportsPanel() {
  const [submissions, setSubmissions] = useState<EvaluationSubmission[]>([]);
  const [teachers, setTeachers] = useState<TeacherScore[]>([]);
  const [activeFacultyIds, setActiveFacultyIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [semFilter, setSemFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const [subs, teacherList, facultyRes] = await Promise.all([
        getEvaluationSubmissionsAsync(),
        getLiveTeacherScoresAsync(),
        fetch("/api/faculty", { cache: "no-store" }).then((r) => r.json() as Promise<{ faculty?: Array<{ id: number }> }>),
      ]);
      if (cancelled) return;
      setSubmissions(subs);
      setTeachers(teacherList);
      setActiveFacultyIds(new Set((facultyRes.faculty ?? []).map((f) => String(f.id))));
    }

    void loadQuestions();
    void refresh();

    const onUpdate = () => {
      void refresh();
    };
    window.addEventListener("eval-submissions-updated", onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("eval-submissions-updated", onUpdate);
    };
  }, []);

  // Apply filters
  const filteredSubs = useMemo(() => {
    return submissions.filter((s) => {
      const matchSem = semFilter === "all" || s.semester === semFilter;
      const matchDept = deptFilter === "all" || s.department.toLowerCase().includes(deptFilter.toLowerCase());
      const matchSearch = search === "" ||
        s.facultyName.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase()) ||
        (s.studentName ?? "").toLowerCase().includes(search.toLowerCase());
      return matchSem && matchDept && matchSearch;
    });
  }, [submissions, semFilter, deptFilter, search]);

  const filteredTeachers = useMemo(() => {
    if (semFilter === "all" && deptFilter === "all" && search === "") return teachers;
    // Re-compute teachers from filteredSubs
    const grouped = new Map<string, EvaluationSubmission[]>();
    for (const s of filteredSubs) {
      const ex = grouped.get(s.facultyId) ?? [];
      ex.push(s);
      grouped.set(s.facultyId, ex);
    }
    return [...grouped.entries()].map(([id, subs]) => {
      const first = subs[0];
      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 } as TeacherScore["scoreDistribution"];
      let total = 0, count = 0;
      for (const sub of subs) for (const v of Object.values(sub.scoringAnswers)) {
        const k = Math.min(5, Math.max(0, Math.round(v))) as keyof typeof dist;
        dist[k]++; total += v; count++;
      }
      return { id, name: first.facultyName, department: first.department,
        overallScore: count > 0 ? total / count : 0, evaluationCount: subs.length, scoreDistribution: dist };
    }).sort((a,b) => b.overallScore - a.overallScore);
  }, [filteredSubs, teachers, semFilter, deptFilter, search]);

  const departments = useMemo(() => [...new Set(submissions.map((s) => s.department))].sort(), [submissions]);
  const semesters = useMemo(() => [...new Set(submissions.map((s) => s.semester ?? "").filter(Boolean))].sort(), [submissions]);

  return (
    <div className="space-y-6">
      {/* ── Search & Filters + Export ── */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            placeholder="Search faculty, dept, student…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-56"
          />
          <select value={semFilter} onChange={(e) => setSemFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400">
            <option value="all">All Semesters</option>
            {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400">
            <option value="all">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <ExportButtons submissions={filteredSubs} teachers={filteredTeachers} />
      </div>

      {/* ── Dashboard Summary ── */}
      <Section title="Dashboard Summary" subtitle="Overview of all evaluation activity.">
        <DashboardSummary submissions={filteredSubs} teachers={filteredTeachers} />
      </Section>

      {/* ── Faculty Performance Ranking ── */}
      <Section title="Faculty Performance Ranking" subtitle="Sorted by average score, highest first.">
        <FacultyRanking teachers={filteredTeachers} activeFacultyIds={activeFacultyIds} />
      </Section>

      {/* ── Overall Average Rating + Distribution ── */}
      <Section title="Overall Average Rating & Rating Distribution" subtitle="Combined scores across all evaluated faculty.">
        <OverallRatingAndDistribution submissions={filteredSubs} />
      </Section>

      {/* ── Highest & Lowest Rated Questions ── */}
      <Section title="Question Analysis" subtitle="Questions ranked by average score from student responses.">
        <QuestionRatings submissions={filteredSubs} />
      </Section>

      {/* ── Student Evaluation Completion ── */}
      <Section title="Student Evaluation Completion" subtitle="Number of evaluations submitted per student.">
        <StudentCompletion submissions={filteredSubs} />
      </Section>

      {/* ── Faculty Detailed Report ── */}
      <Section title="Faculty Detailed Report" subtitle="Click a faculty row to expand their full report.">
        <FacultyDetailedReport submissions={filteredSubs} teachers={filteredTeachers} search={search} activeFacultyIds={activeFacultyIds} />
      </Section>

      {/* ── Recent Evaluation Activity ── */}
      <Section title="Recent Evaluation Activity" subtitle="The 15 most recent submissions.">
        <RecentActivity submissions={filteredSubs} />
      </Section>
    </div>
  );
}
