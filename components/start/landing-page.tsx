"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { AuthPanel } from "@/components/auth/auth-panel";

interface LandingPageProps {
  logoSrc: string;
}

const features = [
  // ── Student Features ──
  {
    badge: "Student",
    title: "Student Dashboard",
    description: "View your evaluation activity — see how many evaluations you've submitted, your average score given, and the teachers you've already evaluated.",
  },
  {
    badge: "Student",
    title: "Evaluation Form",
    description: "Rate your assigned faculty members each semester using a structured scoring questionnaire. Submit evaluations for each subject and teacher.",
  },

  // ── School Head Features ──
  {
    badge: "School Head",
    title: "School Head Dashboard",
    description: "Track evaluation progress for your department — see how many teachers have been evaluated, how many are pending, and your overall completion rate.",
  },
  {
    badge: "School Head",
    title: "Teachers",
    description: "View all faculty members assigned to your department. See their profile, subjects, and evaluation status at a glance.",
  },
  {
    badge: "School Head",
    title: "Reports",
    description: "Access detailed faculty performance reports for your department. View scores, rankings, and evaluation summaries based on submitted evaluations.",
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
  
          </div>
        </section>

        <section id="features" className="bg-slate-50 px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-700">Features</span>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">Built for every user</h2>
              <p className="mt-3 text-sm text-slate-500 max-w-xl mx-auto">Each portal is designed around what the user actually needs — no clutter, no confusion.</p>
            </div>

            {/* Student features */}
            <div className="mb-14">
              <div className="mb-6 flex items-center gap-4">
                <span className="text-lg font-bold text-slate-900">Student Portal</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {features.filter((f) => f.badge === "Student").map((f) => (
                  <article key={f.title} className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50/30">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{f.title}</h3>
                    <p className="mt-3 text-base leading-7 text-slate-500">{f.description}</p>
                  </article>
                ))}
              </div>
            </div>

            {/* School Head features */}
            <div>
              <div className="mb-6 flex items-center gap-4">
                <span className="text-lg font-bold text-slate-900">School Head Portal</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                {features.filter((f) => f.badge === "School Head").map((f) => (
                  <article key={f.title} className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-orange-300 hover:bg-orange-50/30">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-700 transition-colors">{f.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{f.description}</p>
                  </article>
                ))}
              </div>
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
