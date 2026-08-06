import Image from "next/image";

import { AdminLoginForm } from "@/components/auth/admin-login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">

      {/* ── LEFT PANEL ── */}
      <div
        className="relative hidden w-[55%] flex-col overflow-hidden lg:flex"
        style={{ background: "linear-gradient(160deg, #0a1a3a 0%, #0d2254 55%, #122b6e 100%)" }}
      >
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-yellow-400/5" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-[500px] w-[500px] rounded-full bg-blue-400/5" />
        <div className="pointer-events-none absolute left-1/3 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-white/3" />

        <div className="relative flex flex-1 flex-col justify-between px-14 py-12">
          {/* Top badge */}
          <div>
            <span className="inline-flex items-center gap-3 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-7 py-3 text-sm font-semibold text-yellow-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
              Secure Faculty Evaluation Portal
            </span>
          </div>

          {/* Center content */}
          <div className="space-y-10">
            {/* Logo + name */}
            <div className="flex items-center gap-6 pt-6">
              <div className="h-28 w-28 overflow-hidden rounded-2xl bg-white p-1 shadow-2xl ring-4 ring-yellow-400/60">
                <Image
                  src="/icons/sidebar-logo.png"
                  alt="Benedicto College logo"
                  width={160}
                  height={160}
                  unoptimized
                  className="h-full w-full scale-110 object-contain"
                />
              </div>
              <div>
                <p className="text-5xl font-extrabold leading-tight text-white">Benedicto</p>
                <p className="text-5xl font-extrabold leading-tight text-yellow-400">College</p>
              </div>
            </div>

            {/* Tagline */}
            <div>
              <h2 className="text-3xl font-bold text-white">Faculty Evaluation System</h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-blue-200">
                A comprehensive platform for managing faculty performance evaluations, student accounts, and academic reporting — all in one place.
              </p>
            </div>

            {/* Feature list */}
            <ul className="space-y-5">
              {[
                { icon: "📋", text: "Manage faculty evaluation forms & questionnaires" },
                { icon: "👥", text: "Student & school head account management" },
                { icon: "📊", text: "Real-time evaluation status monitoring" },
                { icon: "📈", text: "Comprehensive reports and analytics" },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">
                    {item.icon}
                  </span>
                  <span className="pt-2 text-lg text-blue-100">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 pt-8 mt-4">
            <p className="text-base font-medium text-blue-200">Benedicto College — Faculty Evaluation System</p>
            <p className="mt-1 text-sm text-blue-300/50">© 2026 All rights reserved · Version 1.0.0</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex w-full flex-col bg-white lg:w-[45%]">
        {/* Mobile header */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-4 lg:hidden">
          <div className="h-10 w-10 overflow-hidden rounded-full shadow">
            <Image src="/icons/sidebar-logo.png" alt="BC logo" width={40} height={40} unoptimized className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Benedicto College</p>
            <p className="text-xs text-yellow-600 font-semibold">Admin Portal</p>
          </div>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            {/* Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/80">
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="mx-auto mb-5 hidden h-20 w-20 overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg ring-2 ring-yellow-400/50 lg:block">
                  <Image src="/icons/sidebar-logo.png" alt="BC logo" width={80} height={80} unoptimized className="h-full w-full object-contain" />
                </div>
                <div
                  className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white"
                  style={{ background: "linear-gradient(135deg, #0a1a3a, #0d2254)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Admin Portal
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900">Welcome back</h1>
                <p className="mt-2 text-lg text-slate-500">Sign in to access the admin dashboard</p>
              </div>

              <AdminLoginForm />

              {/* Divider note */}
              <p className="mt-6 text-center text-xs text-slate-400">
                Authorized personnel only · Benedicto College
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
