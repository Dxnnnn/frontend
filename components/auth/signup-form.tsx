"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { AuthUser } from "@/lib/types/auth";
import { getRoleDestination } from "@/lib/types/auth";
import { PasswordToggle } from "@/components/auth/password-toggle";
import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  function resetLoadingState() {
    setShowLoadingScreen(false);
    setLoadingComplete(false);
    setRedirectTo(null);
    setIsSubmitting(false);
  }

  function handleLoadingComplete() {
    if (redirectTo) {
      router.push(redirectTo);
      router.refresh();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setShowLoadingScreen(true);
    setLoadingComplete(false);
    setRedirectTo(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });

      const data = (await response.json()) as {
        user?: AuthUser;
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Unable to create account. Please try again.");
        resetLoadingState();
        return;
      }

      if (!data.user) {
        setError("Unable to create account. Please try again.");
        resetLoadingState();
        return;
      }

      setRedirectTo(getRoleDestination(data.user.role));
      setLoadingComplete(true);
    } catch {
      setError("Something went wrong. Please try again.");
      resetLoadingState();
    }
  }

  return (
    <>
      {showLoadingScreen ? (
        <AuthLoadingScreen
          label="Creating your account..."
          complete={loadingComplete}
          onComplete={handleLoadingComplete}
        />
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700"
        >
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter your full name"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="signup-username"
          className="block text-sm font-medium text-slate-700"
        >
          Username
        </label>
        <input
          id="signup-username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Choose a username"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="signup-password"
          className="block text-sm font-medium text-slate-700"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
          <PasswordToggle
            showPassword={showPassword}
            onToggle={() => setShowPassword((current) => !current)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirm-password"
          className="block text-sm font-medium text-slate-700"
        >
          Confirm password
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your password"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
          <PasswordToggle
            showPassword={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((current) => !current)}
          />
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full shrink-0 items-center justify-center rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
    </>
  );
}
