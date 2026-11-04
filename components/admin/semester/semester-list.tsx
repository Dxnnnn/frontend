"use client";

import { useEffect, useState } from "react";
import { deleteSemesterAsync, formatSemesterDate, getSemestersAsync, toggleSemesterAsync } from "@/lib/semester/storage";
import type { Semester } from "@/lib/types/semester";

interface FacultyMember {
  id: number;
  name: string;
  department: string;
  subjects: string;
  semester: string | null;
}

interface SemesterListProps {
  refreshKey: number;
}

function getSubjectsForSemester(faculty: FacultyMember[], semesterTerm: string): string[] {
  const subjects = new Set<string>();
  for (const f of faculty) {
    if (!f.semester) continue;
    const fSem = f.semester.toLowerCase();
    const term = semesterTerm.toLowerCase();
    if (fSem === term || fSem.includes(term) || term.includes(fSem)) {
      const list = f.subjects ? f.subjects.split(",").map((s) => s.trim()).filter(Boolean) : [];
      for (const s of list) subjects.add(s);
    }
  }
  return [...subjects].sort();
}

function getFacultyCountForSemester(faculty: FacultyMember[], semesterTerm: string): number {
  return faculty.filter((f) => {
    if (!f.semester) return false;
    const fSem = f.semester.toLowerCase();
    const term = semesterTerm.toLowerCase();
    return fSem === term || fSem.includes(term) || term.includes(fSem);
  }).length;
}

// ── Confirm Turn Off Modal ────────────────────────────────────────────────────
function ConfirmTurnOffModal({
  semesterLabel,
  onConfirm,
  onCancel,
}: {
  semesterLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} aria-label="Cancel" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6 text-orange-600" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900">Turn off this semester?</h3>
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-medium">{semesterLabel}</span> will be hidden from students and school heads. They will no longer be able to submit evaluations for this semester.
        </p>
        <p className="mt-2 text-xs text-orange-600 font-medium">You can turn it back on at any time.</p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm}
            className="flex-1 rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-700">
            Turn Off
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Delete Modal ──────────────────────────────────────────────────────
function ConfirmDeleteModal({
  semesterLabel,
  evalCount,
  onConfirm,
  onCancel,
}: {
  semesterLabel: string;
  evalCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const hasEvals = evalCount > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} aria-label="Cancel" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${hasEvals ? "bg-amber-100" : "bg-red-100"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-6 w-6 ${hasEvals ? "text-amber-600" : "text-red-600"}`} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M10 11v6M14 11v6M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-9 0h10l-1 12a1 1 0 01-1 1H9a1 1 0 01-1-1L7 7z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900">Delete this semester?</h3>
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-medium">{semesterLabel}</span>
        </p>
        {hasEvals ? (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-800">⚠ Warning: {evalCount} evaluation{evalCount !== 1 ? "s" : ""} exist for this semester.</p>
            <p className="mt-1 text-xs text-amber-700">Deleting this semester will permanently remove all associated evaluation data. This cannot be undone.</p>
          </div>
        ) : (
          <p className="mt-2 text-xs text-red-600 font-medium">This cannot be undone.</p>
        )}
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white ${hasEvals ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700"}`}>
            {hasEvals ? "Delete Anyway" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SemesterList({ refreshKey }: SemesterListProps) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [evalCounts, setEvalCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [confirmTurnOff, setConfirmTurnOff] = useState<Semester | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Semester | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      getSemestersAsync(),
      fetch("/api/faculty", { cache: "no-store" })
        .then((r) => r.json())
        .then((d: { faculty?: FacultyMember[] }) => d.faculty ?? [])
        .catch(() => [] as FacultyMember[]),
      fetch("/api/evaluations", { cache: "no-store" })
        .then((r) => r.json())
        .then((d: { submissions?: Array<{ semester?: string | null }> }) => {
          const counts: Record<string, number> = {};
          for (const sub of d.submissions ?? []) {
            const sem = sub.semester ?? "Unknown";
            counts[sem] = (counts[sem] ?? 0) + 1;
          }
          return counts;
        })
        .catch(() => ({} as Record<string, number>)),
    ])
      .then(([sems, fac, counts]) => {
        if (!cancelled) {
          setSemesters(sems);
          setFaculty(fac);
          setEvalCounts(counts);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [refreshKey]);

  async function doToggle(id: string) {
    setToggling(id);
    const newState = await toggleSemesterAsync(id);
    setToggling(null);
    if (newState !== null) {
      setSemesters((prev) => prev.map((s) => s.id === id ? { ...s, isActive: newState } : s));
    }
    setConfirmTurnOff(null);
  }

  function handleToggleClick(semester: Semester) {
    if (semester.isActive) {
      setConfirmTurnOff(semester);
    } else {
      void doToggle(semester.id);
    }
  }

  async function doDelete(id: string) {
    const ok = await deleteSemesterAsync(id);
    if (ok) setSemesters((prev) => prev.filter((s) => s.id !== id));
    else window.alert("Failed to delete semester.");
    setConfirmDelete(null);
  }

  function getEvalCount(semester: Semester): number {
    let count = 0;
    for (const [key, val] of Object.entries(evalCounts)) {
      if (key.includes(semester.term) || key.includes(semester.schoolYear)) {
        count += val;
      }
    }
    return count;
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
        <p className="mt-3 text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (semesters.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-600">No semesters yet</p>
        <p className="mt-1 text-sm text-slate-500">Add a school year and semester using the button above.</p>
      </div>
    );
  }

  return (
    <>
      {/* Confirm Turn Off modal */}
      {confirmTurnOff && (
        <ConfirmTurnOffModal
          semesterLabel={`${confirmTurnOff.schoolYear} · ${confirmTurnOff.term}`}
          onConfirm={() => void doToggle(confirmTurnOff.id)}
          onCancel={() => setConfirmTurnOff(null)}
        />
      )}

      {/* Confirm Delete modal */}
      {confirmDelete && (
        <ConfirmDeleteModal
          semesterLabel={`${confirmDelete.schoolYear} · ${confirmDelete.term}`}
          evalCount={getEvalCount(confirmDelete)}
          onConfirm={() => void doDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div className="space-y-4">
        {semesters.map((semester) => {
          const subjects = getSubjectsForSemester(faculty, semester.term);
          const facultyCount = getFacultyCountForSemester(faculty, semester.term);
          const evalCount = getEvalCount(semester);
          const isToggling = toggling === semester.id;
          const termShort = semester.term === "1st Semester" ? "1st"
            : semester.term === "2nd Semester" ? "2nd"
            : semester.term.includes("Quarter") ? semester.term.split(" ")[0]
            : "Sum";
          const termColor = semester.term === "1st Semester" ? "bg-brand-700"
            : semester.term === "2nd Semester" ? "bg-emerald-600"
            : "bg-orange-500";

          return (
            <section
              key={semester.id}
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
                semester.isActive
                  ? "border-emerald-300 ring-2 ring-emerald-100"
                  : "border-slate-200 opacity-75"
              }`}
            >
              {/* Active banner */}
              {semester.isActive && (
                <div className="flex items-center gap-2 bg-emerald-600 px-6 py-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  <p className="text-xs font-semibold text-white">Currently Active — Students and school heads can submit evaluations</p>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${termColor}`}>
                    {termShort}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900">{semester.term}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        semester.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${semester.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {semester.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      School Year {semester.schoolYear} · Added {formatSemesterDate(semester.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {/* Faculty count */}
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {facultyCount} faculty
                  </span>

                  {/* Eval count */}
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    evalCount > 0 ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {evalCount} evaluation{evalCount !== 1 ? "s" : ""}
                  </span>

                  {/* ON/OFF toggle */}
                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => handleToggleClick(semester)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                      semester.isActive
                        ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {isToggling ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : semester.isActive ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                        </svg>
                        Turn Off
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Turn On
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmDelete(semester)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Subjects */}
              <div className="px-6 py-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Subjects being taught this semester
                </p>
                {!semester.isActive && (
                  <p className="mb-2 text-xs text-orange-600 font-medium">
                    ⚠ This semester is turned off — students and school heads cannot see it.
                  </p>
                )}
                {subjects.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">
                    No subjects yet. Add faculty and assign them to this semester.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s) => (
                      <span key={s} className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
