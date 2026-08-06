"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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
}

interface CoordinatorFacultyListProps {
  department: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ complete }: { complete: boolean }) {
  if (complete) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
        Complete
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
      Pending
    </span>
  );
}

export function CoordinatorFacultyList({ department }: CoordinatorFacultyListProps) {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [evaluatedIds, setEvaluatedIds] = useState<Set<string>>(new Set());
  const [evaluatedNames, setEvaluatedNames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const refreshEvaluated = useCallback(() => {
    void getSchoolHeadSubmissionsAsync().then((subs) => {
      const ids = new Set<string>();
      const names = new Set<string>();
      for (const s of subs) {
        ids.add(String(s.facultyId));
        const name = (s.facultyName ?? "").trim().toLowerCase();
        if (name) names.add(name);
      }
      setEvaluatedIds(ids);
      setEvaluatedNames(names);
    });
  }, []);

  useEffect(() => {
    if (!department) return;

    setLoading(true);
    fetch(`/api/faculty/by-department/${encodeURIComponent(department)}`)
      .then((r) => r.json())
      .then((data: { success?: boolean; faculty?: FacultyMember[] }) => {
        setFaculty(data.faculty ?? []);
        setError("");
        refreshEvaluated();
      })
      .catch(() => setError("Failed to load faculty records."))
      .finally(() => setLoading(false));

    const unsub = onEvaluationsUpdated(() => {
      refreshEvaluated();
    });

    return unsub;
  }, [department, refreshEvaluated]);

  function isComplete(member: FacultyMember): boolean {
    if (evaluatedIds.has(String(member.id))) return true;
    const name = member.name.trim().toLowerCase();
    return Boolean(name && evaluatedNames.has(name));
  }

  const counts = useMemo(() => {
    let complete = 0;
    for (const m of faculty) {
      if (isComplete(m)) complete += 1;
    }
    return { complete, pending: faculty.length - complete };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isComplete uses evaluated sets
  }, [faculty, evaluatedIds, evaluatedNames]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faculty;

    return faculty.filter((m) => {
      const statusLabel = isComplete(m) ? "complete" : "pending";
      return (
        m.name.toLowerCase().includes(q) ||
        (m.position ?? "").toLowerCase().includes(q) ||
        (m.subjects ?? "").toLowerCase().includes(q) ||
        (m.email ?? "").toLowerCase().includes(q) ||
        statusLabel.includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isComplete uses evaluated sets
  }, [faculty, search, evaluatedIds, evaluatedNames]);

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
    <section className="flex max-h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="shrink-0 space-y-4 border-b border-slate-200 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Faculty list</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {search.trim()
                ? `${filtered.length} of ${faculty.length} teacher${faculty.length === 1 ? "" : "s"}`
                : `${faculty.length} teacher${faculty.length === 1 ? "" : "s"}`}{" "}
              in {department}.
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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, position, subject, email, or status…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
            aria-label="Search teachers"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition hover:text-slate-600"
              aria-label="Clear search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-600">No teachers match your search</p>
            <p className="mt-1 text-sm text-slate-400">Try a different name, subject, or status.</p>
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Position</th>
                <th className="px-6 py-3 font-medium">Subjects</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((member) => {
                const complete = isComplete(member);
                return (
                  <tr key={member.id} className="text-slate-700">
                    <td className="px-6 py-4 font-medium text-slate-900">{member.name}</td>
                    <td className="px-6 py-4 text-slate-500">{member.position ?? "—"}</td>
                    <td className="px-6 py-4">
                      {member.subjects ? (
                        <div className="flex flex-wrap gap-1">
                          {member.subjects
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((s) => (
                              <span
                                key={s}
                                className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                              >
                                {s}
                              </span>
                            ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge complete={complete} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">{member.email ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(member.created_at)}</td>
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
