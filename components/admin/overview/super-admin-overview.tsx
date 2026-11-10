"use client";

import { useEffect, useState } from "react";

interface AdminAccount {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  is_active: number;
  created_at: string;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function IcoUsers()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>; }
function IcoCheck()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>; }
function IcoWarn()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>; }
function IcoShield()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>; }
function IcoDatabase() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 1.657-4.03 3-9 3S3 13.657 3 12"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/></svg>; }
function IcoAccount()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4"><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-1a7 7 0 0114 0v1"/></svg>; }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Skeleton pulse row ────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-slate-200" />
        <div className="h-3.5 w-28 rounded bg-slate-200" />
      </div>
      <div className="h-5 w-14 rounded-full bg-slate-200" />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function SuperAdminOverview() {
  const [admins, setAdmins]   = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow]         = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch("/api/admins", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { admins?: AdminAccount[] }) => setAdmins(d.admins ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total    = admins.length;
  const active   = admins.filter((a) => a.is_active).length;
  const inactive = admins.filter((a) => !a.is_active).length;
  const eoList   = admins.filter((a) => a.role === "Executive Office");
  const dcList   = admins.filter((a) => a.role === "Data Center");

  const recent = [...admins]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Benedicto College Faculty Evaluation System
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Super Admin Dashboard</h1>
            <p className="mt-0.5 text-sm text-slate-500">System Administration &amp; Account Management</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active System
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {now.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-6 py-6 sm:px-8">
        <div className="mx-auto max-w-5xl space-y-6">



          {/* ── 3 stat cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d2254]/10 text-[#0d2254]">
                  <IcoUsers />
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">Total</span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {loading ? <span className="text-slate-200">—</span> : total}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">Admin Accounts</p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <IcoCheck />
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">Active</span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {loading ? <span className="text-slate-200">—</span> : active}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">Active Accounts</p>
            </div>

            <div className={`rounded-2xl border bg-white p-5 shadow-sm ${inactive > 0 ? "border-amber-200" : "border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${inactive > 0 ? "bg-amber-50 text-amber-500" : "bg-slate-100 text-slate-400"}`}>
                  <IcoWarn />
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${inactive > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400"}`}>
                  Inactive
                </span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {loading ? <span className="text-slate-200">—</span> : inactive}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">Inactive Accounts</p>
            </div>
          </div>

          {/* ── Administrative Offices ───────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2">

            {/* Executive Office */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <IcoShield />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Executive Office</p>
                  <p className="text-xs text-slate-500">Evaluation oversight &amp; operations</p>
                </div>
                <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {loading ? "—" : `${eoList.length} account${eoList.length !== 1 ? "s" : ""}`}
                </span>
              </div>
              <div className="p-4 space-y-2">
                {loading ? (
                  <><SkeletonRow /><SkeletonRow /></>
                ) : eoList.length === 0 ? (
                  <p className="px-1 py-2 text-xs text-slate-400 italic">No Executive Office accounts yet.</p>
                ) : (
                  eoList.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-700">
                          {a.full_name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{a.full_name}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{a.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        a.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${a.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {a.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Data Center */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <IcoDatabase />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Data Center</p>
                  <p className="text-xs text-slate-500">Data administration &amp; system ops</p>
                </div>
                <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {loading ? "—" : `${dcList.length} account${dcList.length !== 1 ? "s" : ""}`}
                </span>
              </div>
              <div className="p-4 space-y-2">
                {loading ? (
                  <><SkeletonRow /><SkeletonRow /></>
                ) : dcList.length === 0 ? (
                  <p className="px-1 py-2 text-xs text-slate-400 italic">No Data Center accounts yet.</p>
                ) : (
                  dcList.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                          {a.full_name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{a.full_name}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{a.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        a.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${a.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {a.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Recent Admin Accounts table ──────────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2 text-slate-500">
                <IcoAccount />
                <p className="font-semibold text-slate-900">Recent Admin Accounts</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                {loading ? "…" : `${total} total`}
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-[#0d2254]" />
                <p className="text-xs text-slate-400">Loading…</p>
              </div>
            ) : recent.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-slate-400">No admin accounts found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Role</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recent.map((a) => (
                      <tr key={a.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                              a.role === "Executive Office" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {a.full_name.charAt(0).toUpperCase()}
                            </span>
                            <span className="font-medium text-slate-900">{a.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            a.role === "Executive Office"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {a.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{a.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            a.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${a.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                            {a.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{formatDate(a.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
