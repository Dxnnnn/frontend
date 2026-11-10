"use client";

import { useEffect, useState } from "react";
import { ManagePermissionsModal } from "@/components/admin/settings/manage-permissions-modal";

interface AdminAccount {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: number;
  created_at: string;
}

interface SettingsPanelProps {
  currentAdminName: string;
  currentAdminEmail: string;
}

type Tab = "accounts" | "profile";

const inputCls = "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

// ── Create Admin Modal ────────────────────────────────────────────────────────
function CreateAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Data Center");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!fullName.trim() || !email.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName.trim(), email: email.trim(), password, role }),
      });
      const data = await res.json() as { success?: boolean; message?: string };
      if (!res.ok || !data.success) { setError(data.message ?? "Failed to create admin."); return; }
      onCreated();
      onClose();
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Create Admin Account</h2>
            <p className="text-xs text-slate-500 mt-0.5">New admin will be displayed as "Admin — {fullName || "Name"}"</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Eduardo Reyes" className={inputCls} required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Role <span className="text-red-500">*</span></label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls} required>
              <option value="Data Center">Data Center</option>
              <option value="Executive Office">Executive Office (EO)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Email <span className="text-red-500">*</span></label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. eduardo@bc.edu.ph" className={inputCls} required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters" className={`${inputCls} pr-12`} required />
              <button type="button" onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Confirm Password <span className="text-red-500">*</span></label>
            <input type={showPassword ? "text" : "password"} value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password" className={inputCls} required />
          </div>
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-xl bg-brand-700 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70">
              {saving ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Settings Panel ───────────────────────────────────────────────────────
export function SettingsPanel({ currentAdminName, currentAdminEmail }: SettingsPanelProps) {
  const [tab, setTab] = useState<Tab>("accounts");
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [permAdmin, setPermAdmin] = useState<AdminAccount | null>(null);

  // Profile / password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  function loadAdmins() {
    setLoading(true);
    fetch("/api/admins", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { admins?: AdminAccount[] }) => setAdmins(d.admins ?? []))
      .catch(() => setAdmins([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadAdmins(); }, []);

  async function handleToggle(id: number) {
    const res = await fetch(`/api/admins/${id}`, { method: "PATCH" });
    if (res.ok) setAdmins((prev) => prev.map((a) => a.id === id ? { ...a, is_active: a.is_active ? 0 : 1 } : a));
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete admin "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
    if (res.ok) setAdmins((prev) => prev.filter((a) => a.id !== id));
    else {
      const data = await res.json() as { message?: string };
      window.alert(data.message ?? "Failed to delete admin.");
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(""); setPwSuccess("");
    if (!currentPassword || !newPassword || !confirmNew) { setPwError("All fields are required."); return; }
    if (newPassword !== confirmNew) { setPwError("New passwords do not match."); return; }
    if (newPassword.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    setPwSaving(true);
    try {
      const res = await fetch("/api/admins/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json() as { success?: boolean; message?: string };
      if (!res.ok || !data.success) { setPwError(data.message ?? "Failed to update password."); return; }
      setPwSuccess("Password updated successfully.");
      setCurrentPassword(""); setNewPassword(""); setConfirmNew("");
    } catch {
      setPwError("Unable to connect to server.");
    } finally {
      setPwSaving(false);
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <>
      {createOpen && <CreateAdminModal onClose={() => setCreateOpen(false)} onCreated={loadAdmins} />}
      {permAdmin && (
        <ManagePermissionsModal
          adminId={permAdmin.id}
          adminName={permAdmin.full_name || permAdmin.username}
          adminRole={permAdmin.role}
          onClose={() => setPermAdmin(null)}
        />
      )}

      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          {(["accounts", "profile"] as Tab[]).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`pb-3 px-1 text-sm font-semibold border-b-2 transition ${
                tab === t
                  ? "border-brand-700 text-brand-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}>
              {t === "accounts" ? "Admin Staff" : "My Profile"}
            </button>
          ))}
        </div>

        {/* ── Admin Accounts Tab ── */}
        {tab === "accounts" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Admin Staff</h2>
                <p className="text-sm text-slate-500 mt-0.5">{admins.length} staff admin{admins.length !== 1 ? "s" : ""} — displayed as "Admin — Name"</p>
              </div>
              <button type="button" onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
                Create Admin
              </button>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                <p className="text-sm text-slate-500">Loading...</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Admin</th>
                      <th className="px-6 py-3 font-medium">Role</th>
                      <th className="px-6 py-3 font-medium">Email</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Added</th>
                      <th className="px-6 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                              {(admin.full_name || admin.username).charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-900">
                                Admin — {admin.full_name || admin.username}
                              </p>
                              <p className="text-xs text-slate-400">@{admin.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            admin.role === "Executive Office"
                              ? "bg-violet-100 text-violet-700"
                              : admin.role === "Data Center"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{admin.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            admin.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${admin.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                            {admin.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{formatDate(admin.created_at)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => handleToggle(admin.id)}
                              className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                admin.is_active
                                  ? "border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              }`}>
                              {admin.is_active ? "Deactivate" : "Activate"}
                            </button>
                            <button type="button" onClick={() => handleDelete(admin.id, admin.full_name || admin.username)}
                              className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── My Profile Tab ── */}
        {tab === "profile" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Profile Info</h2>
              <div className="flex items-center gap-4 mb-5">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
                  {currentAdminName.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Admin — {currentAdminName}</p>
                  <p className="text-sm text-slate-500">{currentAdminEmail}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 mt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Your role is <span className="font-semibold text-slate-700">Administrator</span>. You have full access to all system features.</p>
              </div>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password" className={inputCls} required />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters" className={inputCls} required />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                  <input type="password" value={confirmNew} onChange={(e) => setConfirmNew(e.target.value)}
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
        )}
      </div>
    </>
  );
}
