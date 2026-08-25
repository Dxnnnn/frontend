"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { AuthUser, LoginPortal } from "@/lib/types/auth";
import { getRoleDestination } from "@/lib/types/auth";
import { PasswordToggle } from "@/components/auth/password-toggle";

const MAX_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 180; // 3 minutes

export function LoginForm({ portal }: { portal: LoginPortal }) {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setCooldownLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setAttempts(0);
          setError("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [cooldownLeft]);

  const isLocked = cooldownLeft > 0;
  const remainingAttempts = MAX_ATTEMPTS - attempts;

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLocked) return;
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
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          if (newAttempts >= MAX_ATTEMPTS) {
            setCooldownLeft(COOLDOWN_SECONDS);
            setError(`Too many failed attempts. Please wait 3 minutes before trying again.`);
          } else {
            setError(`${data.error ?? data.message ?? "Invalid ID number or password."} (${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? "" : "s"} remaining)`);
          }
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
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          setCooldownLeft(COOLDOWN_SECONDS);
          setError(`Too many failed attempts. Please wait 3 minutes before trying again.`);
        } else {
          setError(`${data.error ?? data.message ?? "Invalid Student ID or password."} (${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? "" : "s"} remaining)`);
        }
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

  const fieldLabel = isStaffPortal ? "SchoolHead ID" : "Student ID";
  const fieldPlaceholder = isStaffPortal ? "e.g. SH-2024-001" : "e.g. 2024-00123";

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
          disabled={isLocked}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={fieldPlaceholder}
          className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-300 focus:ring-4 disabled:opacity-50 ${focusFieldClass}`}
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
            disabled={isLocked}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition-all duration-300 focus:ring-4 disabled:opacity-50 ${focusFieldClass}`}
          />
          <PasswordToggle showPassword={showPassword} onToggle={() => setShowPassword((c) => !c)} />
        </div>
      </div>

      {error ? (
        <div role="alert" className={`rounded-xl border px-4 py-3 text-sm ${isLocked ? "border-amber-200 bg-amber-50 text-amber-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {error}
          {isLocked && (
            <p className="mt-1 font-semibold">
              Try again in: {formatTime(cooldownLeft)}
            </p>
          )}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || isLocked}
        className={`flex w-full shrink-0 items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 ${submitButtonClass}`}
      >
        {isLocked ? `Locked — ${formatTime(cooldownLeft)}` : isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
