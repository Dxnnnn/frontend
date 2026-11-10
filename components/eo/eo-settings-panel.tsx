"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

interface EOSettingsPanelProps {
  currentAdminName: string;
  currentAdminEmail: string;
  currentAdminRole: string;
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

export function EOSettingsPanel({
  currentAdminName,
  currentAdminEmail,
  currentAdminRole,
}: EOSettingsPanelProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (!newPassword || !confirmNew) { setPwError("All fields are required."); return; }
    if (newPassword !== confirmNew) { setPwError("New passwords do not match."); return; }
    if (newPassword.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    setPwSaving(true);
    try {
      const res = await fetch("/api/admins/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) { setPwError(data.message ?? "Failed to update password."); return; }
      setPwSuccess("Password updated successfully.");
      setNewPassword(""); setConfirmNew("");
    } catch {
      setPwError("Unable to connect to server.");
    } finally {
      setPwSaving(false);
    }
  }

  const roleColor =
    currentAdminRole === "Executive Office"
      ? "bg-violet-100 text-violet-700"
      : "bg-blue-100 text-blue-700";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

      {/* ── My Profile ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-5">My Profile</h2>

        <div className="flex items-center gap-4 mb-6">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
            {currentAdminName.charAt(0).toUpperCase()}
          </span>
          <div className="space-y-1">
            <p className="font-semibold text-slate-900">Admin — {currentAdminName}</p>
            <p className="text-sm text-slate-500">{currentAdminEmail}</p>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleColor}`}>
              {currentAdminRole}
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs font-medium text-slate-500">Full Name</span>
            <span className="text-sm font-semibold text-slate-900">{currentAdminName}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs font-medium text-slate-500">Email</span>
            <span className="text-sm text-slate-700">{currentAdminEmail}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs font-medium text-slate-500">Role</span>
            <span className="text-sm text-slate-700">{currentAdminRole}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs font-medium text-slate-500">Status</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          To update your name or email, contact the Super Admin.
        </p>
      </div>

      {/* ── Change Password ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Change Password</h2>
        <p className="text-sm text-slate-500 mb-5">
          Set a new password for your account.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters" className={`${inputCls} pr-11`} required />
              <button type="button" onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Toggle visibility">
                {showNew ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input type={showNew ? "text" : "password"} value={confirmNew}
              onChange={(e) => setConfirmNew(e.target.value)}
              placeholder="Re-enter new password" className={inputCls} required />
          </div>

          {pwError && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pwError}</p>}
          {pwSuccess && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{pwSuccess}</p>}

          <button type="submit" disabled={pwSaving}
            className="w-full rounded-xl bg-brand-700 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70 transition">
            {pwSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

    </div>
  );
}
