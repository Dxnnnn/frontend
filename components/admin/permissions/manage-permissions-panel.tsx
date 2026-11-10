"use client";

import { useEffect, useRef, useState } from "react";
import {
  PERMISSION_MODULES,
  ALL_PERMISSION_KEYS,
  emptyPermissions,
  type PermissionMap,
  type PermissionKey,
} from "@/lib/types/permissions";

interface AdminAccount {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: number;
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }: {
  checked: boolean; onChange: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-blue-500" : "bg-slate-200"
      }`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
        checked ? "translate-x-5" : "translate-x-0.5"
      }`} />
    </button>
  );
}

// ── Indeterminate parent toggle (3-state) ─────────────────────────────────────
function ParentToggle({ state, onChange, disabled }: {
  state: "all" | "some" | "none"; onChange: () => void; disabled?: boolean;
}) {
  const checked = state === "all";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
        state === "all" ? "bg-blue-500" : state === "some" ? "bg-blue-300" : "bg-slate-200"
      }`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
        state !== "none" ? "translate-x-5" : "translate-x-0.5"
      }`} />
    </button>
  );
}

// ── Module icon ────────────────────────────────────────────────────────────────
function ModuleIcon({ label }: { label: string }) {
  const cls = "h-4 w-4 shrink-0 text-slate-500";
  switch (label) {
    case "Dashboard":       return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case "Accounts":        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls}><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
    case "Faculty":         return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12 12 0 0120 17.5C20 19 16.42 21 12 21S4 19 4 17.5c0-1.12.52-2.76 1.84-3.922L12 14z"/></svg>;
    case "Create Questionnaire": return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 104 0M9 12h6M9 16h6"/></svg>;
    case "Evaluation Status": return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
    case "Semester":        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls}><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18"/></svg>;
    case "Subjects":        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>;
    case "Reports":         return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v8H3zM8 9h2v12H8zM13 5h2v16h-2zM18 1h2v20h-2z"/></svg>;
    default:                return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls}><circle cx="12" cy="12" r="9"/></svg>;
  }
}

// ── Submodule icon ─────────────────────────────────────────────────────────────
function SubModuleIcon({ label }: { label: string }) {
  const cls = "h-4 w-4 shrink-0 text-slate-400";
  if (label.toLowerCase().includes("student"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
  if (label.toLowerCase().includes("school head"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H2v-2a4 4 0 014-4h1a4 4 0 014 0v2z"/><circle cx="9" cy="7" r="3"/></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls}><circle cx="12" cy="12" r="3"/></svg>;
}

function countGranted(perms: PermissionMap) {
  return ALL_PERMISSION_KEYS.filter((k) => perms[k]).length;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ManagePermissionsPanel() {
  const [admins, setAdmins]               = useState<AdminAccount[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [selectedId, setSelectedId]       = useState<number | null>(null);
  const [perms, setPerms]                 = useState<PermissionMap>(emptyPermissions());
  const [savedPerms, setSavedPerms]       = useState<PermissionMap>(emptyPermissions());
  const [loadingPerms, setLoadingPerms]   = useState(false);
  const [saving, setSaving]               = useState(false);
  const [saveMsg, setSaveMsg]             = useState("");

  useEffect(() => {
    fetch("/api/admins", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { admins?: AdminAccount[] }) => {
        setAdmins((d.admins ?? []).filter((a) => a.role === "Executive Office" || a.role === "Data Center"));
      })
      .catch(() => setAdmins([]))
      .finally(() => setLoadingAdmins(false));
  }, []);

  function loadPerms(id: number) {
    setLoadingPerms(true); setSaveMsg("");
    fetch(`/api/admins/${id}/permissions`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { success?: boolean; permissions?: Record<string, boolean> }) => {
        const map = emptyPermissions();
        if (d.success && d.permissions) {
          for (const key of ALL_PERMISSION_KEYS) map[key] = d.permissions[key] === true;
        }
        setPerms(map); setSavedPerms(map);
      })
      .catch(() => {})
      .finally(() => setLoadingPerms(false));
  }

  function handleSelectAdmin(id: number) { setSelectedId(id); loadPerms(id); }

  // Auto-save after every toggle
  async function savePerms(newPerms: PermissionMap) {
    if (selectedId === null) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admins/${selectedId}/permissions`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: newPerms }),
      });
      const data = await res.json() as { success?: boolean };
      if (res.ok && data.success) {
        setSavedPerms(newPerms);
        setSaveMsg("Changes are saved automatically.");
      }
    } catch {}
    finally { setSaving(false); }
  }

  function toggle(key: PermissionKey) {
    const next = { ...perms, [key]: !perms[key] };
    setPerms(next);
    void savePerms(next);
  }

  function toggleParent(keys: PermissionKey[]) {
    const anyOn = keys.some((k) => perms[k]);
    const next = { ...perms };
    for (const k of keys) next[k] = !anyOn;
    setPerms(next);
    void savePerms(next);
  }

  function parentState(keys: PermissionKey[]): "all" | "some" | "none" {
    const on = keys.filter((k) => perms[k]).length;
    return on === keys.length ? "all" : on > 0 ? "some" : "none";
  }

  const selectedAdmin = admins.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* ── Page header ── */}
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-blue-600" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Manage Permissions</h1>
            <p className="text-sm text-slate-500">Configure module access independently for each EO and Data Center account.</p>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        <div className="mx-auto max-w-4xl space-y-5">

          {/* ── Account cards (horizontal) ── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Admin Accounts</p>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                {admins.length} Account{admins.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loadingAdmins ? (
              <div className="flex gap-3">
                {[1,2].map((i) => <div key={i} className="h-16 flex-1 animate-pulse rounded-2xl bg-slate-100 border border-slate-200" />)}
              </div>
            ) : admins.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-6 text-center">
                <p className="text-sm text-slate-400">No EO or Data Center accounts. Create one in Settings.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {admins.map((admin) => {
                  const isSelected = selectedId === admin.id;
                  const isEO = admin.role === "Executive Office";
                  return (
                    <button key={admin.id} type="button" onClick={() => handleSelectAdmin(admin.id)}
                      className={`relative flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-all ${
                        isSelected
                          ? "border-blue-400 bg-blue-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      {/* Avatar */}
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isEO ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {(admin.full_name || admin.username).charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{admin.full_name || admin.username}</p>
                        <p className={`text-xs font-medium ${isEO ? "text-violet-600" : "text-blue-600"}`}>{admin.role}</p>
                      </div>
                      {/* Selected check */}
                      {isSelected && (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500">
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="h-3.5 w-3.5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Module Permissions ── */}
          {selectedId === null ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
              <p className="mt-3 text-sm font-semibold text-slate-600">Select an account</p>
              <p className="mt-1 text-xs text-slate-400">Choose an account above to configure its permissions.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Panel header */}
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-slate-500" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">Module Permissions</p>
                  <p className="text-xs text-slate-400">Choose which features this account can access.</p>
                </div>
                {/* Active badge */}
                {selectedAdmin?.is_active ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    Inactive
                  </span>
                )}
              </div>

              {/* Module rows */}
              {loadingPerms ? (
                <div className="space-y-0 divide-y divide-slate-100">
                  {[1,2,3,4,5,6,7,8].map((i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
                        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                      </div>
                      <div className="h-6 w-11 animate-pulse rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {PERMISSION_MODULES.map((mod) => {
                    if (mod.submodules && mod.submodules.length > 0) {
                      const subKeys = mod.submodules.map((s) => s.key);
                      const state   = parentState(subKeys);
                      const isOn    = state !== "none";
                      return (
                        <div key={mod.label}>
                          {/* Parent row */}
                          <div className="flex items-center justify-between px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <ModuleIcon label={mod.label} />
                              <span className="text-sm font-medium text-slate-800">{mod.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                state === "all"  ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                                state === "some" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                                "bg-slate-100 text-slate-400"
                              }`}>
                                {state === "all" ? "Enabled" : state === "some" ? "Partial" : "Disabled"}
                              </span>
                              <ParentToggle state={state} onChange={() => toggleParent(subKeys)} />
                            </div>
                          </div>
                          {/* Submodule rows — indented */}
                          {mod.submodules.map((sub) => (
                            <div key={sub.key} className="flex items-center justify-between bg-slate-50/60 px-5 py-3 pl-12 border-t border-slate-100">
                              <div className="flex items-center gap-3">
                                <SubModuleIcon label={sub.label} />
                                <span className="text-sm text-slate-600">{sub.label}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  perms[sub.key] ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-400"
                                }`}>
                                  {perms[sub.key] ? "Enabled" : "Disabled"}
                                </span>
                                <Toggle checked={perms[sub.key]} onChange={() => toggle(sub.key)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    // Single module
                    const key = mod.key!;
                    const isOn = perms[key];
                    return (
                      <div key={mod.label} className="flex items-center justify-between px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <ModuleIcon label={mod.label} />
                          <span className="text-sm font-medium text-slate-800">{mod.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isOn ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-400"
                          }`}>
                            {isOn ? "Enabled" : "Disabled"}
                          </span>
                          <Toggle checked={isOn} onChange={() => toggle(key)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Auto-save note */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
                {saving ? (
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                    Saving…
                  </span>
                ) : saveMsg ? (
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-blue-400" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01"/>
                    </svg>
                    {saveMsg}
                  </span>
                ) : (
                  <span className="text-xs text-slate-300">Changes are saved automatically.</span>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
