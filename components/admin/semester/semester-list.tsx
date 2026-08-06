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

export function SemesterList({ refreshKey }: SemesterListProps) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      getSemestersAsync(),
      fetch("/api/faculty", { cache: "no-store" })
        .then((r) => r.json())
        .then((d: { faculty?: FacultyMember[] }) => d.faculty ?? [])
        .catch(() => [] as FacultyMember[]),
    ])
      .then(([sems, fac]) => {
        if (!cancelled) {
          setSemesters(sems);
          setFaculty(fac);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function handleToggle(id: string) {
    setToggling(id);
    const newState = await toggleSemesterAsync(id);
    setToggling(null);
    if (newState !== null) {
      setSemesters((prev) =>
        prev.map((s) => s.id === id ? { ...s, isActive: newState } : s)
      );
    }
  }

  async function handleDelete(id: string, label: string) {
    if (!window.confirm(`Delete this semester?\n\n${label}\n\nThis cannot be undone.`)) return;
    const ok = await deleteSemesterAsync(id);
    if (ok) setSemesters((prev) => prev.filter((s) => s.id !== id));
    else window.alert("Failed to delete semester.");
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
    <div className="space-y-4">
      {semesters.map((semester) => {
        const label = `${semester.schoolYear} · ${semester.term}`;
        const subjects = getSubjectsForSemester(faculty, semester.term);
        const facultyCount = getFacultyCountForSemester(faculty, semester.term);
        const isToggling = toggling === semester.id;

        return (
          <section
            key={semester.id}
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-opacity ${
              semester.isActive ? "border-slate-200" : "border-slate-200 opacity-60"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${
                  semester.term === "1st Semester" ? "bg-brand-700" :
                  semester.term === "2nd Semester" ? "bg-emerald-600" : "bg-orange-500"
                }`}>
                  {semester.term === "1st Semester" ? "1st" :
                   semester.term === "2nd Semester" ? "2nd" : "Sum"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">{semester.term}</h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      semester.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
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

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {facultyCount} faculty
                </span>

                {/* ON/OFF toggle */}
                <button
                  type="button"
                  disabled={isToggling}
                  onClick={() => void handleToggle(semester.id)}
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
                  onClick={() => void handleDelete(semester.id, label)}
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
  );
}
