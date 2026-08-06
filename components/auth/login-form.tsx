"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { AuthUser, LoginPortal } from "@/lib/types/auth";
import { getRoleDestination } from "@/lib/types/auth";
import { PasswordToggle } from "@/components/auth/password-toggle";

export function LoginForm({ portal }: { portal: LoginPortal }) {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const isStaffPortal = portal === "staff";

      if (isStaffPortal) {
        const response = await fetch("/api/auth/school-head-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_number: identifier, password }),
        });

        const data = (await response.json()) as {
          user?: AuthUser;
          error?: string;
          message?: string;
        };

        if (!response.ok || !data.user) {
          setError(data.error ?? data.message ?? "Invalid ID number or password.");
          setIsSubmitting(false);
          return;
        }

        router.push(getRoleDestination(data.user.role));
        router.refresh();
        return;
      }

      // Student
      const response = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: identifier, password }),
      });

      const data = (await response.json()) as {
        user?: AuthUser;
        error?: string;
        message?: string;
      };

      if (!response.ok || !data.user) {
        setError(data.error ?? data.message ?? "Invalid Student ID or password.");
        setIsSubmitting(false);
        return;
      }

      router.push(getRoleDestination(data.user.role));
      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
      setIsSubmitting(false);
    }
  }

  const isStaffPortal = portal === "staff";

  const submitButtonClass = isStaffPortal
    ? "bg-brand-700 hover:bg-brand-800 focus:ring-brand-100"
    : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-100";

  const focusFieldClass = isStaffPortal
    ? "focus:border-brand-500 focus:ring-brand-100"
    : "focus:border-emerald-500 focus:ring-emerald-100";

  const fieldLabel = isStaffPortal ? "ID#" : "Student ID";
  const fieldPlaceholder = isStaffPortal ? "e.g. SHS-2024-001" : "e.g. 2024-00123";

  return (
    <form className="space-y-5 transition-colors duration-300" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <label htmlFor="login-identifier" className="block text-sm font-medium text-slate-700">
          {fieldLabel}
        </label>
        <input
          id="login-identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={fieldPlaceholder}
          className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-300 focus:ring-4 ${focusFieldClass}`}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition-all duration-300 focus:ring-4 ${focusFieldClass}`}
          />
          <PasswordToggle showPassword={showPassword} onToggle={() => setShowPassword((c) => !c)} />
        </div>
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`flex w-full shrink-0 items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 ${submitButtonClass}`}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
