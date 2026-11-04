"use client";

import { useEffect, useState } from "react";
import { getSurveyQuestionsAsync } from "@/lib/evaluations/storage";
import { addSchoolHeadSubmission } from "@/lib/faculty-portal/coordinator-submissions";
import { getActiveSemestersAsync } from "@/lib/semester/storage";
import type { SurveyQuestion } from "@/lib/types/survey-question";
import { scoringScale } from "@/lib/types/survey-question";

interface FacultyMember {
  id: number;
  name: string;
  email: string | null;
  position: string | null;
  department: string;
  subjects: string;
  profile_image?: string | null;
}

interface FacultyEvaluationModalProps {
  faculty: FacultyMember;
  schoolHeadId: string;
  schoolHeadName: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export function FacultyEvaluationModal({
  faculty,
  schoolHeadId,
  schoolHeadName,
  onClose,
  onSubmitted,
}: FacultyEvaluationModalProps) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState("");
  const [semester, setSemester] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const grouped = questions.reduce<Record<string, SurveyQuestion[]>>((acc, q) => {
    const cat = q.category ?? "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(q);
    return acc;
  }, {});

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = totalQuestions > 0 && answeredCount >= totalQuestions;

  const avgScore = answeredCount > 0
    ? Object.values(answers).reduce((a, b) => a + b, 0) / answeredCount
    : 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    async function load() {
      try {
        const [sems, qs] = await Promise.all([
          getActiveSemestersAsync(),
          getSurveyQuestionsAsync("school_head", "scoring"),
        ]);
        const activeSem = sems[0];
        if (activeSem) setSemester(`SY-${activeSem.schoolYear} ${activeSem.term}`);
        setQuestions(qs.filter((q) => q.isActive));
      } catch {
        setError("Failed to load evaluation questions.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function handleSubmit() {
    if (!allAnswered) { setError("Please answer all questions before submitting."); return; }
    if (!agreed) { setError("Please agree to the certification before submitting."); return; }
    if (!semester) { setError("No active semester found. Please contact the administrator."); return; }

    setSubmitting(true);
    setError("");

    // Guard — schoolHeadId must not be empty
    if (!schoolHeadId) {
      setError("School head session not found. Please log out and log in again.");
      setSubmitting(false);
      return;
    }

    try {
      await addSchoolHeadSubmission({
        studentId: schoolHeadId,
        studentName: schoolHeadName,
        facultyId: String(faculty.id),
        facultyName: faculty.name,
        department: faculty.department,
        subject: faculty.subjects ? faculty.subjects.split(",")[0].trim() : "General",
        semester,
        remarks: remarks.trim() || undefined,
        scoringAnswers: answers,
        personalAnswers: {},
      });
      onSubmitted();
      onClose();
    } catch {
      setError("Failed to submit evaluation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* ── Faculty Header ── */}
        <div className="shrink-0 bg-gradient-to-br from-brand-700 to-brand-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {faculty.profile_image ? (
                <img src={faculty.profile_image} alt={faculty.name}
                  className="h-14 w-14 rounded-full object-cover border-2 border-white/40 shadow-md" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white border-2 border-white/40">
                  {faculty.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-white">{faculty.name}</h2>
                {faculty.position && <p className="text-sm text-brand-100">{faculty.position}</p>}
                <p className="text-xs text-brand-200 mt-0.5">{faculty.department}</p>
              </div>
            </div>
            <button type="button" onClick={onClose}
              className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          {totalQuestions > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-brand-100">{answeredCount} of {totalQuestions} answered</span>
                {answeredCount > 0 && (
                  <span className="text-xs font-bold text-white">Avg: {avgScore.toFixed(2)}</span>
                )}
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
              <p className="mt-3 text-sm text-slate-500">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-20 text-center px-6">
              <p className="text-sm font-medium text-slate-600">No evaluation questions available.</p>
              <p className="mt-1 text-xs text-slate-400">Contact the administrator to set up the questionnaire.</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Active semester */}
              {semester && (
                <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-brand-600 shrink-0" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                  </svg>
                  <span className="text-xs font-semibold text-brand-700">{semester}</span>
                </div>
              )}

              {/* Questions grouped by category */}
              {Object.entries(grouped).map(([category, qs]) => (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{category}</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  <div className="space-y-4">
                    {qs.map((q, idx) => (
                      <div key={q.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600">
                            {idx + 1}
                          </span>
                          <p className="text-sm font-medium text-slate-900">{q.text}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {scoringScale.map((level) => (
                            <label key={level.value}
                              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                                answers[q.id] === level.value
                                  ? "border-brand-500 bg-brand-700 text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"
                              }`}>
                              <input type="radio" name={`q-${q.id}`} value={level.value}
                                checked={answers[q.id] === level.value}
                                onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: level.value }))}
                                className="sr-only" />
                              <span className="font-bold">{level.value}</span>
                              <span className={`text-xs ${answers[q.id] === level.value ? "text-brand-100" : "text-slate-400"}`}>
                                {level.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Remarks <span className="text-slate-400 font-normal text-xs">(optional)</span>
                </label>
                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder={`Write your professional assessment of ${faculty.name}...`}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
              </div>

              {/* Professional Certification */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-700 mb-2">Professional Certification</p>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  I certify that this evaluation is my honest and professional assessment of{" "}
                  <span className="font-semibold text-slate-700">{faculty.name}</span>. The ratings I have provided are based on my direct observations and are free from personal bias or external influence.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500" />
                  <span className="text-xs text-slate-700 font-medium">
                    I agree to the above certification and confirm my evaluation is accurate.
                  </span>
                </label>
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {!loading && questions.length > 0 && (
          <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {allAnswered
                ? <span className="text-emerald-600 font-medium">✓ All questions answered</span>
                : <span>{totalQuestions - answeredCount} question{totalQuestions - answeredCount !== 1 ? "s" : ""} remaining</span>
              }
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button type="button" onClick={handleSubmit}
                disabled={!allAnswered || !agreed || submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Evaluation
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
