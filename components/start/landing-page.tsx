"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { AuthPanel } from "@/components/auth/auth-panel";

interface LandingPageProps {
  logoSrc: string;
}

const features = [
  {
    color: "bg-blue-50 text-blue-700",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5a2 2 0 104 0M9 5a2 2 0 014 0M9 12h6M9 16h4" />
      </svg>
    ),
    title: "Student Evaluations",
    description: "Students submit structured feedback and personal responses for their faculty members each semester.",
  },
  {
    color: "bg-emerald-50 text-emerald-700",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H2v-2a4 4 0 014-4h1a4 4 0 014 0v2z" />
        <circle cx="9" cy="7" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 20v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "School Head Oversight",
    description: "School heads review faculty in their department, complete evaluations, and monitor performance.",
  },
  {
    color: "bg-orange-50 text-orange-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5h6v6H4zM14 5.5h6v6h-6zM4 14.5h6v6H4zM14 14.5h6v6h-6z" />
      </svg>
    ),
    title: "Admin Management",
    description: "Administrators manage accounts, configure questionnaires, maintain faculty records, and generate reports.",
  },
  {
    color: "bg-blue-50 text-blue-700",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Real-time Reports",
    description: "Generate detailed evaluation reports by department, faculty, or semester with live data insights.",
  },
  {
    color: "bg-emerald-50 text-emerald-700",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
      </svg>
    ),
    title: "Semester Control",
    description: "Admins open and close evaluation periods per semester, ensuring evaluations run on schedule.",
  },
  {
    color: "bg-orange-50 text-orange-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    title: "Secure Access",
    description: "Role-based login for students, school heads, and administrators keeps your data safe and private.",
  },
];

const steps = [
  { num: "1", title: "Admin sets up", desc: "Creates accounts, adds faculty, and opens the evaluation period." },
  { num: "2", title: "Students evaluate", desc: "Students submit evaluation forms for their faculty during the active semester." },
  { num: "3", title: "School Heads review", desc: "School heads evaluate faculty in their department and monitor performance." },
  { num: "4", title: "Reports generated", desc: "Admin reviews results and generates performance reports." },
];

export function LandingPage({ logoSrc }: LandingPageProps) {
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!loginOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setLoginOpen(false);
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [loginOpen]);

  return (
    <>
      <div className="overflow-x-hidden bg-white text-slate-800">

        {/* ── NAVBAR ── */}
        <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-2">
              <Image src={logoSrc} alt="Benedicto College" width={56} height={56} priority unoptimized className="h-14 w-14 object-contain drop-shadow-sm" />
              <div className="-ml-1">
                <p className="text-sm font-bold text-slate-900 leading-tight">Benedicto College</p>
                <p className="text-xs text-slate-500 leading-tight">Teacher Evaluation System</p>
              </div>
            </div>
            <nav className="hidden items-center gap-3 text-sm font-medium sm:flex">
              <a
                href="#features"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-blue-700 hover:border-blue-200"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-blue-700 hover:border-blue-200"
              >
                How it works
              </a>
            </nav>
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              Login
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50 px-4 py-24 sm:px-6 sm:py-32">
          {/* Soft blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-100/60 blur-3xl" />
            <div className="absolute -right-40 -bottom-40 h-[600px] w-[600px] rounded-full bg-orange-100/60 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-5 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold text-blue-700 uppercase tracking-widest">Benedicto College</span>
            </div>

            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Evaluate teaching.<br />
              <span className="text-blue-700">Improve learning.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              A centralized system for students, school heads, and administrators to manage teacher evaluations, review performance, and support academic quality across departments.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-8 py-4 text-base font-bold text-white shadow-md transition hover:bg-blue-800"
              >
                Get started
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Learn more
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
              {[
                { icon: "🎓", label: "For Students" },
                { icon: "🏫", label: "For School Heads" },
                { icon: "⚙️", label: "For Admins" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2 text-base text-slate-500">
                  <span className="text-xl">{b.icon}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="bg-slate-50 px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-700">Features</span>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">Everything you need in one place</h2>
              <p className="mt-3 text-sm text-slate-500 max-w-xl mx-auto">Built specifically for Benedicto College to streamline the teacher evaluation process from end to end.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <article key={f.title} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{f.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="bg-white px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="inline-block rounded-full bg-orange-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-orange-600">How it works</span>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">Simple process, powerful results</h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div key={step.num} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-lg font-extrabold text-white shadow-md">
                    {step.num}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-blue-700 px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Ready to get started?</h2>
            <p className="mt-4 text-sm leading-7 text-blue-100">
              Sign in with your assigned credentials to access your portal. Contact your administrator if you need an account.
            </p>
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-blue-700 shadow-lg transition hover:bg-blue-50"
            >
              Sign in now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-slate-100 bg-slate-50 px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <Image src={logoSrc} alt="Benedicto College" width={44} height={44} unoptimized className="h-11 w-11 object-contain" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Benedicto College</p>
                  <p className="text-xs text-slate-500">Teacher Evaluation System</p>
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-3">
                <div>
                  <p className="mb-2 font-semibold text-slate-700">Portals</p>
                  <ul className="space-y-1.5 text-slate-500">
                    <li>Student Portal</li>
                    <li>School Head Portal</li>
                    <li>
                      <button type="button" onClick={() => setLoginOpen(true)} className="transition hover:text-blue-700">
                        Admin Portal
                      </button>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="mb-2 font-semibold text-slate-700">Features</p>
                  <ul className="space-y-1.5 text-slate-500">
                    <li>Evaluations</li>
                    <li>Faculty Records</li>
                    <li>Reports</li>
                  </ul>
                </div>
                <div>
                  <p className="mb-2 font-semibold text-slate-700">System</p>
                  <ul className="space-y-1.5 text-slate-500">
                    <li>Semester Control</li>
                    <li>Account Management</li>
                    <li>Secure Login</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
              <p className="text-xs text-slate-400">© {new Date().getFullYear()} Benedicto College. All rights reserved.</p>
              <p className="text-xs text-slate-400">Teacher Evaluation System · Powered by Benedicto College IT</p>
            </div>
          </div>
        </footer>
      </div>

      {/* ── LOGIN MODAL ── */}
      {loginOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close login dialog"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setLoginOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-dialog-title"
            className="portal-content-enter relative z-10 w-full max-w-md rounded-3xl border border-white/70 bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 id="login-dialog-title" className="text-xl font-bold text-slate-900">Sign in</h2>
                <p className="mt-1 text-sm text-slate-500">Select your role and enter your credentials.</p>
              </div>
              <button
                type="button"
                onClick={() => setLoginOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <AuthPanel />
          </div>
        </div>
      ) : null}
    </>
  );
}
