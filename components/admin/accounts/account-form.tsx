"use client";

import { useState } from "react";

interface AccountFormProps {
  onCreated: (data: { title: string; name: string; loginId: string; password: string; loginLabel: string }) => void;
  embedded?: boolean;
}

export function AccountForm({ onCreated, embedded = false }: AccountFormProps) {
  const [name, setName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !idNumber.trim() || !department.trim()) {
      setError("All fields are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/school-heads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_number: idNumber.trim(),
          full_name: name.trim(),
          department: department.trim(),
        }),
      });

      const data = (await res.json()) as { success?: boolean; message?: string; generatedPassword?: string };

      if (!res.ok || !data.success) {
        setError(data.message ?? "Failed to create account.");
        return;
      }

      setName("");
      setIdNumber("");
      setConfirmPassword("");
      setDepartment("");
      onCreated({
        title: "School Head Account Created!",
        name: name.trim(),
        loginId: idNumber.trim(),
        password: data.generatedPassword ?? "",
        loginLabel: "ID#",
      });
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
        onSubmit={handleSubmit}
        className={embedded ? "" : "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"}
      >
        {!embedded ? (
          <>
            <h2 className="text-lg font-semibold text-slate-900">Create School Head Account</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create a new school head login with name, ID#, and department. Password is auto-generated.
            </p>
          </>
        ) : null}

        <div className={embedded ? "grid gap-4 sm:grid-cols-2" : "mt-5 grid gap-4 sm:grid-cols-2"}>
          <div className="space-y-2">
            <label htmlFor="account-name" className="block text-sm font-medium text-slate-700">Full Name</label>
            <input id="account-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Juan dela Cruz"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              required />
          </div>

          <div className="space-y-2">
            <label htmlFor="account-id" className="block text-sm font-medium text-slate-700">ID#</label>
            <input id="account-id" type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)}
              placeholder="e.g. SH-2024-001"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              required />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="account-department" className="block text-sm font-medium text-slate-700">Department</label>
            <select id="account-department" value={department} onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              required>
              <option value="">Select department...</option>
              <option value="Elementary-Junior High School">Elementary-Junior High School</option>
              <option value="Senior High School">Senior High School</option>
              <option value="College">College</option>
            </select>
          </div>

          {/* Password auto-generated notice */}
          <div className="sm:col-span-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
            <p className="text-xs text-brand-700">
              🔐 A secure password will be automatically generated and shown to you after saving.
            </p>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        <button type="submit" disabled={isSubmitting}
          className="mt-5 flex w-full shrink-0 items-center justify-center rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </form>
  );
}
