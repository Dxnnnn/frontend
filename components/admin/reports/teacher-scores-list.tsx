"use client";

import { useEffect, useState } from "react";
import { getLiveTeacherScores } from "@/lib/reports/live-teacher-scores";
import { maxOverallScore, type TeacherScore } from "@/lib/types/teacher-score";

function scoreBarClass(score: number) {
  if (score >= 4.5) return "bg-emerald-500";
  if (score >= 4) return "bg-brand-500";
  if (score >= 3) return "bg-amber-500";
  return "bg-slate-400";
}

export function TeacherScoresList() {
  const [scores, setScores] = useState<TeacherScore[]>([]);

  useEffect(() => {
    function refresh() {
      setScores(getLiveTeacherScores());
    }
    refresh();
    // Re-compute whenever a new evaluation is submitted
    window.addEventListener("eval-submissions-updated", refresh);
    return () => window.removeEventListener("eval-submissions-updated", refresh);
  }, []);

  return (
    <section className="flex max-h-96 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="shrink-0 border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Overall scores by teacher
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Individual average scores based on completed evaluations.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto">
        {scores.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10 text-slate-300" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
            <p className="text-sm text-slate-500">No evaluations submitted yet.</p>
            <p className="text-xs text-slate-400">Scores will appear here once students complete their evaluations.</p>
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Teacher</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Overall score</th>
                <th className="px-6 py-3 font-medium">Evaluations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scores.map((teacher) => {
                const scorePercent = (teacher.overallScore / maxOverallScore) * 100;
                return (
                  <tr key={teacher.id} className="text-slate-700">
                    <td className="px-6 py-4 font-medium text-slate-900">{teacher.name}</td>
                    <td className="px-6 py-4">{teacher.department}</td>
                    <td className="px-6 py-4">
                      <div className="flex min-w-[180px] items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${scoreBarClass(teacher.overallScore)}`}
                            style={{ width: `${scorePercent}%` }}
                          />
                        </div>
                        <span className="w-14 text-right font-semibold text-slate-900">
                          {teacher.overallScore.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{teacher.evaluationCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
