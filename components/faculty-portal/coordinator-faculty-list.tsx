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

// One row = one teacher + one subject
interface FacultyRow {
  member: FacultyMember;
  subject: string;
  rowKey: string; // `${member.id}::${subject}`
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
  schoolHeadName = "",
}: CoordinatorFacultyListProps) {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  // Evaluated keys: "facultyId::subject"
  const [evaluatedKeys, setEvaluatedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [evaluating, setEvaluating] = useState<FacultyRow | null>(null);

  const refreshEvaluated = useCallback(() => {
    void getSchoolHeadSubmissionsAsync().then((subs) => {
      const keys = new Set<string>();
      for (const s of subs) {
        const subj = (s.subject ?? "").trim();
        keys.add(`${s.facultyId}::${subj}`);
        // also add by name fallback
        keys.add(`name::${(s.facultyName ?? "").trim().toLowerCase()}::${subj}`);
      }
      setEvaluatedKeys(keys);
    });
  }, []);

  useEffect(() => {
    if (!department) return;
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch(`/api/faculty?department=${encodeURIComponent(department)}`);
        const data = (await r.json()) as { success?: boolean; faculty?: FacultyMember[] };
        if (!cancelled) {
          setFaculty(data.faculty ?? []);
          setError("");
          refreshEvaluated();
        }
      } catch {
        if (!cancelled) setError("Failed to load faculty records.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    const unsub = onEvaluationsUpdated(() => refreshEvaluated());
    return () => { cancelled = true; unsub(); };
  }, [department, refreshEvaluated]);

  // Expand each teacher into one row per subject
  const allRows = useMemo<FacultyRow[]>(() => {
    const rows: FacultyRow[] = [];
    for (const member of faculty) {
      const subjectList = member.subjects
        ? member.subjects.split(",").map((s) => s.trim()).filter(Boolean)
        : ["General"];
      for (const subject of subjectList) {
        rows.push({
          member,
          subject,
          rowKey: `${member.id}::${subject}`,
        });
      }
    }
    return rows;
  }, [faculty]);

  function isRowComplete(row: FacultyRow): boolean {
    if (evaluatedKeys.has(`${row.member.id}::${row.subject}`)) return true;
    if (evaluatedKeys.has(`name::${row.member.name.trim().toLowerCase()}::${row.subject}`)) return true;
    return false;
  }

  const counts = useMemo(() => {
    const complete = allRows.filter((r) => isRowComplete(r)).length;
    return { complete, pending: allRows.length - complete, total: allRows.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRows, evaluatedKeys]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((r) =>
      r.member.name.toLowerCase().includes(q) ||
      r.subject.toLowerCase().includes(q) ||
      (r.member.position ?? "").toLowerCase().includes(q) ||
      (r.member.email ?? "").toLowerCase().includes(q) ||
      (isRowComplete(r) ? "complete" : "pending").includes(q)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRows, search, evaluatedKeys]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm text-slate-500">Loading...</p>
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
  if (faculty.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-600">No faculty in this department</p>
        <p className="mt-1 text-sm text-slate-500">
          Teachers assigned to {department} will appear here once added by admin.
        </p>
      </div>
    );
  }

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
              setEvaluatedKeys((prev) => new Set([
                ...prev,
                `${evaluating.member.id}::${evaluating.subject}`,
              ]));
            }
            setEvaluating(null);
            refreshEvaluated();
          }}
        />
      )}

      <section className="flex max-h-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="shrink-0 space-y-4 border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Faculty list</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {counts.total} evaluation{counts.total !== 1 ? "s" : ""} in {department}.{" "}
                <span className="text-brand-600 font-medium">Click a row to evaluate.</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                Complete: {counts.complete}
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                Pending: {counts.pending}
              </span>
            </div>
          </div>

          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, subject, position, or status…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              aria-label="Search" />
            {search && (
              <button type="button" onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-slate-600"
                aria-label="Clear search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-600">No results match your search</p>
              <p className="mt-1 text-sm text-slate-400">Try a different name, subject, or status.</p>
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Instructor Name</th>
                  <th className="px-6 py-3 font-medium">Subject</th>
                  <th className="px-6 py-3 font-medium">Department</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => {
                  const complete = isRowComplete(row);
                  return (
                    <tr
                      key={row.rowKey}
                      onClick={() => { if (!complete) setEvaluating(row); }}
                      title={complete ? "Already evaluated" : "Click to evaluate"}
                      className={`text-slate-700 transition-colors ${
                        complete
                          ? "opacity-60 cursor-default bg-slate-50/50"
                          : "cursor-pointer hover:bg-brand-50"
                      }`}
                    >
                      {/* Instructor Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {row.member.profile_image ? (
                            <img src={row.member.profile_image} alt={row.member.name}
                              className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0" />
                          ) : (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 border border-slate-200 shadow-sm">
                              {row.member.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{row.member.name}</p>
                            {row.member.position && (
                              <p className="text-xs text-slate-400">{row.member.position}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-800">{row.subject}</span>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4 text-slate-500">{row.member.department}</td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {complete ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                            Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Added */}
                      <td className="px-6 py-4 text-slate-500">{formatDate(row.member.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
