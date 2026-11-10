"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSchoolHeadSubmissionsAsync } from "@/lib/faculty-portal/coordinator-submissions";
import { onEvaluationsUpdated } from "@/lib/admin/evaluation-events";
import { FacultyEvaluationModal } from "@/components/faculty-portal/faculty-evaluation-modal";

interface FacultyMember {
  id: number;
  name: string;
  email: string | null;
  position: string | null;
  department: string;
  subjects: string;
  created_at: string;
  profile_image?: string | null;
}

interface FacultyCard {
  member: FacultyMember;
  subject: string;
  rowKey: string;
}

interface SemesterOption {
  id: string;
  schoolYear: string;
  term: string;
  label: string;
}

interface EvaluateTeacherPanelProps {
  department: string;
  schoolHeadId: string;
  schoolHeadName: string;
}

export function EvaluateTeacherPanel({
  department,
  schoolHeadId,
  schoolHeadName,
}: EvaluateTeacherPanelProps) {
  const [faculty, setFaculty]                   = useState<FacultyMember[]>([]);
  const [evaluatedKeys, setEvaluatedKeys]       = useState<Set<string>>(new Set());
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState("");
  const [semesterOptions, setSemesterOptions]   = useState<SemesterOption[]>([]);
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedSubject, setSelectedSubject]   = useState("all");
  const [evaluating, setEvaluating]             = useState<FacultyCard | null>(null);

  // ── Refresh evaluated set ────────────────────────────────────────────────────
  const refreshEvaluated = useCallback(() => {
    void getSchoolHeadSubmissionsAsync().then((subs) => {
      const keys = new Set<string>();
      for (const s of subs) {
        const subj = (s.subject ?? "").trim();
        keys.add(`${s.facultyId}::${subj}`);
        keys.add(`name::${(s.facultyName ?? "").trim().toLowerCase()}::${subj}`);
      }
      setEvaluatedKeys(keys);
    });
  }, []);

  // ── Load faculty list — always filtered by active semester ──────────────────
  function loadFaculty(semLabel: string) {
    if (!department) return;
    // If no active semesters at all, show empty
    if (semLabel === "none" || semLabel === "all") {
      setFaculty([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const url = `/api/faculty?department=${encodeURIComponent(department)}&semester=${encodeURIComponent(semLabel)}`;
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { faculty?: FacultyMember[] }) => {
        setFaculty(d.faculty ?? []);
        setError("");
        refreshEvaluated();
      })
      .catch(() => setError("Failed to load teachers."))
      .finally(() => setLoading(false));
  }

  // ── Load active semesters ────────────────────────────────────────────────────
  useEffect(() => {
    if (!department) return;
    const isJH = /junior|elementary|elem/i.test(department);
    fetch("/api/semesters/active", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { semesters?: Array<{ id: string; schoolYear: string; term: string }> }) => {
        const opts: SemesterOption[] = (d.semesters ?? [])
          .filter((s) => (isJH ? s.term.includes("Quarter") : !s.term.includes("Quarter")))
          .map((s) => ({ ...s, label: `SY-${s.schoolYear} ${s.term}` }));
        setSemesterOptions(opts);
        // Auto-select the first active semester — never show "All" by default
        if (opts.length > 0) {
          setSelectedSemester(opts[0].label);
        } else {
          // No active semesters at all — show empty state
          setSelectedSemester("none");
        }
      })
      .catch(() => { setSemesterOptions([]); setSelectedSemester("none"); });
  }, [department]);

  // ── Load on mount + semester filter change ───────────────────────────────────
  useEffect(() => {
    if (!department) return;
    loadFaculty(selectedSemester);
    const unsub = onEvaluationsUpdated(refreshEvaluated);
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, selectedSemester]);

  // ── Build cards (one per teacher × subject) ──────────────────────────────────
  const allCards = useMemo<FacultyCard[]>(() => {
    const cards: FacultyCard[] = [];
    for (const member of faculty) {
      const list = member.subjects
        ? member.subjects.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      // Skip faculty with no assigned subjects entirely
      if (list.length === 0) continue;
      list.forEach((subject, idx) => {
        cards.push({ member, subject, rowKey: `${member.id}::${subject}::${idx}` });
      });
    }
    return cards;
  }, [faculty]);

  // ── Subject options from loaded teachers ─────────────────────────────────────
  const subjectOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of allCards) set.add(c.subject);
    return ["all", ...Array.from(set).sort()];
  }, [allCards]);

  function isDone(card: FacultyCard): boolean {
    return (
      evaluatedKeys.has(`${card.member.id}::${card.subject}`) ||
      evaluatedKeys.has(`name::${card.member.name.trim().toLowerCase()}::${card.subject}`)
    );
  }

  // ── Apply subject filter ─────────────────────────────────────────────────────
  const visibleCards = useMemo(
    () =>
      selectedSubject === "all"
        ? allCards
        : allCards.filter((c) => c.subject === selectedSubject),
    [allCards, selectedSubject]
  );

  const counts = useMemo(() => {
    const complete = allCards.filter((c) => isDone(c)).length;
    return { complete, pending: allCards.length - complete, total: allCards.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCards, evaluatedKeys]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {evaluating && (
        <FacultyEvaluationModal
          faculty={evaluating.member}
          subject={evaluating.subject}
          schoolHeadId={schoolHeadId}
          schoolHeadName={schoolHeadName}
          onClose={() => setEvaluating(null)}
          onSubmitted={() => {
            if (evaluating) {
              setEvaluatedKeys((prev) =>
                new Set([...prev, `${evaluating.member.id}::${evaluating.subject}`])
              );
            }
            setEvaluating(null);
            refreshEvaluated();
          }}
        />
      )}

      <div className="space-y-5">

        {/* ── Filter bar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div>
            <p className="text-sm text-slate-500">
              Department: <span className="font-semibold text-brand-700">{department}</span>
            </p>
            {!loading && (
              <p className="mt-0.5 text-xs text-slate-400">
                {counts.complete} of {counts.total} teacher{counts.total !== 1 ? "s" : ""} evaluated
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* School Year / Quarter — only active ones */}
            <select
              value={selectedSemester}
              onChange={(e) => { setSelectedSemester(e.target.value); setSelectedSubject("all"); }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              {semesterOptions.length === 0 ? (
                <option value="none">No active semesters</option>
              ) : (
                semesterOptions.map((s) => (
                  <option key={s.id} value={s.label}>{s.label}</option>
                ))
              )}
            </select>

            {/* Subject dropdown */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="all">All Subjects</option>
              {subjectOptions.filter((s) => s !== "all").map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Cards ─────────────────────────────────────────────────────────── */}
        {selectedSemester === "none" ? (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-8 py-16 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="mx-auto h-10 w-10 text-amber-400" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="mt-3 text-sm font-semibold text-amber-800">No active semester</p>
            <p className="mt-1 text-xs text-amber-600">
              There is no active quarter or semester right now.<br />
              Ask the admin to activate one in the Semester module.
            </p>
          </div>
        ) : loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1,2,3,4,5,6,7,8].map((i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : allCards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="mt-3 text-sm font-semibold text-slate-600">No teachers found</p>
            <p className="mt-1 text-xs text-slate-400">
              No teachers are assigned to your department yet.
            </p>
          </div>
        ) : visibleCards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No teachers teach <span className="text-brand-700">{selectedSubject}</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">Select a different subject.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleCards.map((card) => {
              const done = isDone(card);
              return (
                <div
                  key={card.rowKey}
                  onClick={() => { if (!done) setEvaluating(card); }}
                  title={done ? "Already evaluated" : "Click to start evaluation"}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 ${
                    done
                      ? "border-emerald-300 bg-gradient-to-b from-emerald-50 to-emerald-100/50 cursor-default"
                      : "border-slate-200 bg-white cursor-pointer hover:border-brand-400 hover:shadow-lg hover:-translate-y-1"
                  }`}
                >
                  {/* Evaluated badge */}
                  {done && (
                    <div className="absolute right-0 top-0 z-10">
                      <div className="flex items-center gap-1 rounded-bl-xl bg-emerald-500 px-2.5 py-1.5 shadow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                          className="h-3 w-3 text-white" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-[11px] font-bold text-white">Done</span>
                      </div>
                    </div>
                  )}

                  {/* Photo + info */}
                  <div className="flex flex-col items-center gap-3 px-5 pb-4 pt-7">
                    {card.member.profile_image ? (
                      <img
                        src={card.member.profile_image}
                        alt={card.member.name}
                        className={`h-20 w-20 rounded-full object-cover shadow-md border-4 ${
                          done ? "border-emerald-300" : "border-white group-hover:border-brand-200"
                        } transition`}
                      />
                    ) : (
                      <span className={`flex h-20 w-20 items-center justify-center rounded-full border-4 text-2xl font-extrabold shadow-md transition ${
                        done
                          ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                          : "border-white bg-brand-100 text-brand-700 group-hover:border-brand-200"
                      }`}>
                        {card.member.name.charAt(0).toUpperCase()}
                      </span>
                    )}

                    <div className="text-center">
                      <p className={`text-sm font-bold leading-snug ${done ? "text-emerald-800" : "text-slate-900"}`}>
                        {card.member.name}
                      </p>
                      {card.member.position && (
                        <p className="mt-0.5 text-xs text-slate-400">{card.member.position}</p>
                      )}
                    </div>

                    {/* Subject chip */}
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      done
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-brand-100 text-brand-700"
                    }`}>
                      {card.subject}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className={`mt-auto border-t px-5 py-3 text-center ${
                    done ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50 group-hover:bg-brand-50 group-hover:border-brand-100 transition"
                  }`}>
                    {done ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Evaluation Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 group-hover:text-brand-800 transition">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Click to Evaluate
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
