"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AddTeacherModal } from "@/components/faculty-portal/add-teacher-modal";
import { getSchoolHeadSubmissionsAsync } from "@/lib/faculty-portal/coordinator-submissions";
import { onEvaluationsUpdated } from "@/lib/admin/evaluation-events";

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

// One row = one teacher × one subject
interface FacultyRow {
  member: FacultyMember;
  subject: string;
  rowKey: string;
}

interface CoordinatorFacultyListProps {
  department: string;
  schoolHeadId?: string;
  schoolHeadName?: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function CoordinatorFacultyList({
  department,
  schoolHeadId = "",
}: CoordinatorFacultyListProps) {
  const [faculty, setFaculty]             = useState<FacultyMember[]>([]);
  const [evaluatedKeys, setEvaluatedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [search, setSearch]               = useState("");
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);

  // ── Load evaluated submissions ────────────────────────────────────────────
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

  function loadFaculty() {
    if (!department) return;
    setLoading(true);
    fetch(`/api/faculty?department=${encodeURIComponent(department)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { faculty?: FacultyMember[] }) => {
        setFaculty(d.faculty ?? []);
        setError("");
        refreshEvaluated();
      })
      .catch(() => setError("Failed to load teachers."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadFaculty();
    const unsub = onEvaluationsUpdated(refreshEvaluated);
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department]);

  // ── Build rows (one per teacher × subject) ────────────────────────────────
  const allRows = useMemo<FacultyRow[]>(() => {
    const rows: FacultyRow[] = [];
    for (const member of faculty) {
      const list = member.subjects
        ? member.subjects.split(",").map((s) => s.trim()).filter(Boolean)
        : ["—"];
      list.forEach((subject, idx) => {
        rows.push({ member, subject, rowKey: `${member.id}::${subject}::${idx}` });
      });
    }
    return rows;
  }, [faculty]);

  function isComplete(row: FacultyRow): boolean {
    return (
      evaluatedKeys.has(`${row.member.id}::${row.subject}`) ||
      evaluatedKeys.has(`name::${row.member.name.trim().toLowerCase()}::${row.subject}`)
    );
  }

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((r) =>
      r.member.name.toLowerCase().includes(q) ||
      (r.member.position ?? "").toLowerCase().includes(q) ||
      r.subject.toLowerCase().includes(q) ||
      (r.member.email ?? "").toLowerCase().includes(q)
    );
  }, [allRows, search]);

  const completeCount = useMemo(
    () => allRows.filter((r) => isComplete(r)).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allRows, evaluatedKeys]
  );

  return (
    <>
      {addTeacherOpen && (
        <AddTeacherModal
          department={department}
          onClose={() => setAddTeacherOpen(false)}
          onCreated={() => { setAddTeacherOpen(false); loadFaculty(); }}
        />
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Teachers List</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {faculty.length} teacher{faculty.length !== 1 ? "s" : ""} in{" "}
              <span className="font-medium text-brand-700">{department}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Progress summary */}
            {!loading && allRows.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Complete: {completeCount}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Pending: {allRows.length - completeCount}
                </span>
              </div>
            )}
            {/* Search */}
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teachers…"
                className="w-48 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100" />
            </div>
            {/* Add Teacher */}
            <button type="button" onClick={() => setAddTeacherOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
              Add Teacher
            </button>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
            <p className="mt-3 text-sm text-slate-400">Loading…</p>
          </div>
        ) : error ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : faculty.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="mt-3 text-sm font-medium text-slate-600">No teachers yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Click <span className="font-semibold text-brand-700">Add Teacher</span> to get started.
            </p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-slate-500">No teachers match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3 text-left">Teacher</th>
                  <th className="px-6 py-3 text-left">Position</th>
                  <th className="px-6 py-3 text-left">Subject</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Added</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((row) => {
                  const done = isComplete(row);
                  return (
                    <tr key={row.rowKey}
                      className={`transition-colors hover:bg-slate-50 ${done ? "border-l-4 border-l-emerald-400" : "border-l-4 border-l-amber-400"}`}>

                      {/* Teacher — show avatar + name only on first subject row */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {row.member.profile_image ? (
                            <img src={row.member.profile_image} alt={row.member.name}
                              className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                              {row.member.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                          <span className="font-medium text-slate-900">{row.member.name}</span>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="px-6 py-3.5 text-slate-500">{row.member.position ?? "—"}</td>

                      {/* Subject — one per row */}
                      <td className="px-6 py-3.5">
                        <span className="rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700">
                          {row.subject}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-3.5 text-slate-500">{row.member.email ?? "—"}</td>

                      {/* Added */}
                      <td className="px-6 py-3.5 text-slate-500">{formatDate(row.member.created_at)}</td>

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        {done ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
