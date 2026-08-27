"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { AuthUser } from "@/lib/types/auth";
import { getRoleDestination } from "@/lib/types/auth";
import { PasswordToggle } from "@/components/auth/password-toggle";

const MAX_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 180;
const LOCKOUT_KEY = "login_lockout_admin";

function getLockoutState(): { cooldownLeft: number; attempts: number } {
  if (typeof window === "undefined") return { cooldownLeft: 0, attempts: 0 };
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    if (!raw) return { cooldownLeft: 0, attempts: 0 };
    const { lockedUntil, attempts } = JSON.parse(raw) as { lockedUntil: number; attempts: number };
    const now = Date.now();
    const cooldownLeft = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;
    return { cooldownLeft, attempts: cooldownLeft > 0 ? attempts : 0 };
  } catch {
    return { cooldownLeft: 0, attempts: 0 };
  }
}

function saveLockout(attempts: number, lockNow: boolean) {
  if (typeof window === "undefined") return;
  const lockedUntil = lockNow ? Date.now() + COOLDOWN_SECONDS * 1000 : 0;
  localStorage.setItem(LOCKOUT_KEY, JSON.stringify({ lockedUntil, attempts }));
}

function clearLockout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCKOUT_KEY);
}

export function AdminLoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore lockout from localStorage on mount
  useEffect(() => {
    const { cooldownLeft: saved, attempts: savedAttempts } = getLockoutState();
    setAttempts(savedAttempts);
    if (saved > 0) {
      setCooldownLeft(saved);
      setError(`Too many failed attempts. Please wait 3 minutes before trying again.`);
    }
  }, []);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setCooldownLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setAttempts(0);
          setError("");
          clearLockout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [cooldownLeft]);

  const isLocked = cooldownLeft > 0;

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
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
          saveLockout(newAttempts, true);
          setError(`Too many failed attempts. Please wait 3 minutes before trying again.`);
        } else {
          saveLockout(newAttempts, false);
          setError(`${data.error ?? data.message ?? "Invalid email or password."} (${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? "" : "s"} remaining)`);
        }
        setIsSubmitting(false);
        return;
      }

      if (data.user.role !== "admin") {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          setCooldownLeft(COOLDOWN_SECONDS);
          saveLockout(newAttempts, true);
          setError(`Too many failed attempts. Please wait 3 minutes before trying again.`);
        } else {
          saveLockout(newAttempts, false);
          setError(`This account does not have admin access. (${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? "" : "s"} remaining)`);
        }
        setIsSubmitting(false);
        return;
      }

      router.push(getRoleDestination(data.user.role));
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Make sure the backend is running.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1.5">
        <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700">
          Email address
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-slate-400" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isLocked}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. admin@benedicto.edu.ph"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-800 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700">
          Password
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-slate-400" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={isLocked}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-800 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
          />
          <PasswordToggle showPassword={showPassword} onToggle={() => setShowPassword((c) => !c)} />
        </div>
      </div>

      {error ? (
        <div role="alert" className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${isLocked ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`mt-0.5 h-4 w-4 shrink-0 ${isLocked ? "text-amber-500" : "text-red-500"}`} aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01" />
          </svg>
          <div>
            <p className={`text-sm ${isLocked ? "text-amber-700" : "text-red-700"}`}>{error}</p>
            {isLocked && (
              <p className="mt-1 text-sm font-semibold text-amber-700">
                Try again in: {formatTime(cooldownLeft)}
              </p>
            )}
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || isLocked}
        className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70"
        style={{ background: "linear-gradient(135deg, #0d2254 0%, #0a1a3a 100%)" }}
      >
        {isLocked ? `Locked — ${formatTime(cooldownLeft)}` : isSubmitting ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Signing in...
          </>
        ) : (
          <>
            Sign in
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
