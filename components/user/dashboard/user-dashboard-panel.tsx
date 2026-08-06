"use client";

import { useEffect, useMemo, useState } from "react";

import { getFacultyAsync } from "@/lib/faculty/storage";
import {
  countPersonalAnswers,
  formatSubmissionDate,
  getEvaluationSubmissionsAsync,
  getOverallScore,
} from "@/lib/user/evaluation-submissions";
import type { EvaluationSubmission } from "@/lib/types/evaluation-submission";
import { maxOverallScore } from "@/lib/types/teacher-score";

function scoreBarClass(score: number) {
  if (score >= 4.5) {
    return "bg-emerald-500";
  }

  if (score >= 4) {
    return "bg-brand-500";
  }

  if (score >= 3) {
    return "bg-amber-500";
  }

  return "bg-slate-400";
}

export function UserDashboardPanel() {
  const [submissions, setSubmissions] = useState<EvaluationSubmission[]>([]);
  const [availableFaculty, setAvailableFaculty] = useState(0);

  useEffect(() => {
    void (async () => {
      // Get current student's ID from cookie
      let currentStudentId: string | undefined;
      try {
        const raw = document.cookie.split("; ").find((c) => c.startsWith("eval_user_info="))?.split("=").slice(1).join("=");
        if (raw) {
          const info = JSON.parse(decodeURIComponent(raw)) as { username?: string; id?: string };
          currentStudentId = info.username ?? info.id;
        }
      } catch { /* ignore */ }

      const [allSubs, faculty] = await Promise.all([
        getEvaluationSubmissionsAsync(),
        getFacultyAsync(),
      ]);

      // Only show THIS student's submissions
      const mySubs = currentStudentId
        ? allSubs.filter((s) => s.studentId === currentStudentId)
        : allSubs;

      setSubmissions(mySubs);
      setAvailableFaculty(faculty.length);
    })();
  }, []);

  const stats = useMemo(() => {
    const overallScores = submissions.map((submission) =>
      getOverallScore(submission.scoringAnswers),
    );
    const averageScore =
      overallScores.length === 0
        ? 0
        : overallScores.reduce((sum, score) => sum + score, 0) /
          overallScores.length;
    const teachersEvaluated = new Set(
      submissions.map((submission) => submission.facultyId),
    ).size;
    const personalResponses = submissions.reduce(
      (sum, submission) =>
        sum + countPersonalAnswers(submission.personalAnswers),
      0,
    );

    return [
      {
        label: "Submitted Evaluations",
        value: String(submissions.length),
        change:
          submissions.length === 0
            ? "No evaluations submitted yet"
            : `${submissions.length} total submission${submissions.length === 1 ? "" : "s"}`,
      },
      {
        label: "Average Score Given",
        value: averageScore === 0 ? "—" : averageScore.toFixed(2),
        change: `From scoring scale, out of ${maxOverallScore}`,
      },
      {
        label: "Personal Responses",
        value: String(personalResponses),
        change: "Written answers submitted",
      },
      {
        label: "Teachers Evaluated",
        value: String(teachersEvaluated),
        change: "Unique faculty you have evaluated",
      },
    ];
  }, [submissions]);

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {stat.value}
            </p>
            <p className="mt-2 text-xs text-slate-500">{stat.change}</p>
          </article>
        ))}
      </section>

      <section className="flex max-h-96 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="shrink-0 border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Overall Scores
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your latest scoring results and personal responses for each
            evaluation.
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No evaluations submitted yet. Complete the evaluation form to see
            your results here.
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Faculty</th>
                  <th className="px-6 py-3 font-medium">Subject</th>
                  <th className="px-6 py-3 font-medium">Overall score</th>
                  <th className="px-6 py-3 font-medium">Personal responses</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((submission) => {
                  const overallScore = getOverallScore(submission.scoringAnswers);
                  const scorePercent = (overallScore / maxOverallScore) * 100;

                  return (
                    <tr key={submission.id} className="text-slate-700">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {submission.facultyName}
                      </td>
                      <td className="px-6 py-4">{submission.subject}</td>
                      <td className="px-6 py-4">
                        {Object.keys(submission.scoringAnswers).length === 0 ? (
                          "—"
                        ) : (
                          <div className="flex min-w-[180px] items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${scoreBarClass(overallScore)}`}
                                style={{ width: `${scorePercent}%` }}
                              />
                            </div>
                            <span className="w-14 text-right font-semibold text-slate-900">
                              {overallScore.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {countPersonalAnswers(submission.personalAnswers)} answered
                      </td>
                      <td className="px-6 py-4">
                        {formatSubmissionDate(submission.submittedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
