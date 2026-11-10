"use client";

import { useEffect, useState } from "react";
import {
  PERMISSION_MODULES,
  ALL_PERMISSION_KEYS,
  emptyPermissions,
  type PermissionMap,
  type PermissionKey,
} from "@/lib/types/permissions";

interface Props {
  adminId: number;
  adminName: string;
  adminRole: string;
  onClose: () => void;
}

export function ManagePermissionsModal({ adminId, adminName, adminRole, onClose }: Props) {
  const [perms, setPerms] = useState<PermissionMap>(emptyPermissions());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load existing permissions on open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);

    fetch(`/api/admins/${adminId}/permissions`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { success?: boolean; permissions?: Record<string, boolean> }) => {
        if (d.success && d.permissions) {
          const map = emptyPermissions();
          for (const key of ALL_PERMISSION_KEYS) {
            map[key] = d.permissions[key] === true;
          }
          setPerms(map);
        }
      })
      .catch(() => setError("Failed to load permissions."))
      .finally(() => setLoading(false));

    return () => document.removeEventListener("keydown", onKey);
  }, [adminId, onClose]);

  function toggle(key: PermissionKey) {
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }));
    setSuccess("");
  }

  /** Toggle all submodules of a parent module */
  function toggleParent(keys: PermissionKey[]) {
    const anyOn = keys.some((k) => perms[k]);
    setPerms((prev) => {
      const next = { ...prev };
      for (const k of keys) next[k] = !anyOn;
      return next;
    });
    setSuccess("");
  }

  /** Determine parent state for a group of submodule keys */
  function parentState(keys: PermissionKey[]): "all" | "some" | "none" {
    const on = keys.filter((k) => perms[k]).length;
    if (on === keys.length) return "all";
    if (on > 0) return "some";
    return "none";
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admins/${adminId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: perms }),
      });
      const data = await res.json() as { success?: boolean; message?: string };
      if (!res.ok || !data.success) { setError(data.message ?? "Failed to save."); return; }
      setSuccess("Permissions saved successfully.");
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setSaving(false);
    }
  }

  const badgeColor = adminRole === "Executive Office"
    ? "bg-violet-100 text-violet-700"
    : "bg-blue-100 text-blue-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Manage Permissions</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-slate-600">Admin — {adminName}</span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${badgeColor}`}>{adminRole}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <p className="text-center text-sm text-slate-500 py-8">Loading permissions…</p>
          ) : (
            <div className="space-y-3">
              {PERMISSION_MODULES.map((mod) => {
                if (mod.submodules && mod.submodules.length > 0) {
                  const subKeys = mod.submodules.map((s) => s.key);
                  const state = parentState(subKeys);
                  return (
                    <div key={mod.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      {/* Parent row */}
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={state === "all"}
                          ref={(el) => { if (el) el.indeterminate = state === "some"; }}
                          onChange={() => toggleParent(subKeys)}
                          className="h-4 w-4 rounded border-slate-300 accent-brand-700"
                        />
                        <span className="text-sm font-semibold text-slate-800">{mod.label}</span>
                        {state === "some" && (
                          <span className="ml-auto text-xs text-slate-400">partial</span>
                        )}
                      </label>
                      {/* Submodule rows */}
                      <div className="mt-3 space-y-2 pl-7">
                        {mod.submodules.map((sub) => (
                          <label key={sub.key} className="flex cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              checked={perms[sub.key]}
                              onChange={() => toggle(sub.key)}
                              className="h-4 w-4 rounded border-slate-300 accent-brand-700"
                            />
                            <span className="text-sm text-slate-700">{sub.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Single module (no submodules)
                const key = mod.key!;
                return (
                  <div key={mod.label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={perms[key]}
                        onChange={() => toggle(key)}
                        className="h-4 w-4 rounded border-slate-300 accent-brand-700"
                      />
                      <span className="text-sm font-semibold text-slate-800">{mod.label}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}
          {success && (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Close
          </button>
          <button type="button" onClick={handleSave} disabled={saving || loading}
            className="flex-1 rounded-xl bg-brand-700 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70">
            {saving ? "Saving…" : "Save Permissions"}
          </button>
        </div>
      </div>
    </div>
  );
}
