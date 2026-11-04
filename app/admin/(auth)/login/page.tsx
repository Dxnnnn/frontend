import Image from "next/image";
import { AdminLoginForm } from "@/components/auth/admin-login-form";

const features = [
  {
    title: "Evaluation Management",
    desc: "Create and manage faculty evaluation questionnaires for all levels.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
      </svg>
    ),
  },
  {
    title: "Account Management",
    desc: "Manage student and school head accounts across all departments.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H2v-2a4 4 0 014-4h1a4 4 0 014 0v2zm4-10a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: "Evaluation Status",
    desc: "Monitor real-time submission progress from students and school heads.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Reports & Analytics",
    desc: "Generate faculty performance reports with scores and rankings.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2M3 20h18" />
      </svg>
    ),
  },
];

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">

      {/* ── LEFT PANEL ── */}
      <div
        className="relative hidden w-[52%] flex-col overflow-hidden lg:flex"
        style={{ background: "linear-gradient(160deg, #0a1730 0%, #0e2158 60%, #0f2d7a 100%)" }}
      >
        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow orbs */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-1 flex-col justify-between px-12 py-12">

          {/* Top status badge */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Secure Faculty Evaluation Portal
            </span>
          </div>

          {/* Center block */}
          <div className="space-y-3">
            {/* Logo + school name */}
            <div className="flex items-center gap-5">
              <Image
                  src="/icons/sidebar-logo.png"
                  alt="Benedicto College"
                  width={160}
                  height={160}
                  unoptimized
                  className="h-40 w-40 object-contain drop-shadow-lg"
                />
              <div>
                <p className="text-3xl font-bold leading-tight text-white">Benedicto College</p>
                <p className="text-base font-medium text-blue-300">Faculty Evaluation System</p>
              </div>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl font-bold leading-snug text-white">
                Centralized evaluation<br />management for every role.
              </h1>
              <p className="mt-4 text-base leading-8 text-blue-200/80">
                One platform for students, school heads, and administrators
                to manage, monitor, and report on faculty evaluations.
              </p>
            </div>

            {/* Feature list */}
            <ul className="space-y-5">
              {features.map((item) => (
                <li key={item.title} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/8 text-blue-300 ring-1 ring-white/10">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-base font-semibold text-white">{item.title}</p>
                    <p className="text-sm leading-6 text-blue-300/70">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="border-t border-white/8 pt-6">
            <p className="text-xs text-blue-300/50">
              © {new Date().getFullYear()} Benedicto College · All rights reserved
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex w-full flex-col bg-slate-50 lg:w-[48%]">

        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-4 lg:hidden">
          <div className="h-9 w-9 overflow-hidden rounded-xl shadow">
            <Image src="/icons/sidebar-logo.png" alt="BC logo" width={36} height={36} unoptimized className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Benedicto College</p>
            <p className="text-xs font-semibold text-blue-700">Admin Portal</p>
          </div>
        </div>

        {/* Centered form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            {/* Logo — desktop only */}
            <div className="mb-2 hidden flex-col items-center gap-1 lg:flex">
              <Image src="/icons/sidebar-logo.png" alt="BC logo" width={160} height={160} unoptimized className="h-40 w-40 object-contain drop-shadow-md" />
            </div>

            {/* Header text */}
            <div className="mb-5 text-center">
              <span
                className="mb-2 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white"
                style={{ background: "linear-gradient(135deg,#0a1730,#0e2158)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Admin Portal
              </span>
              <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
              <p className="mt-1 text-base text-slate-500">Sign in to access the admin dashboard</p>
            </div>

            {/* Form card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-9 shadow-sm">
              <AdminLoginForm />
            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
              Authorized personnel only · Benedicto College
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
