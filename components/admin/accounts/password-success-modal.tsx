"use client";

import { useState } from "react";

interface PasswordSuccessModalProps {
  title: string;
  name: string;
  loginId: string;
  password: string;
  loginLabel?: string;
  onClose: () => void;
}

export function PasswordSuccessModal({
  title,
  name,
  loginId,
  password,
  loginLabel = "ID",
  onClose,
}: PasswordSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const text = `Name: ${name}\n${loginLabel}: ${loginId}\nPassword: ${password}`;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Green header */}
        <div className="bg-emerald-600 px-6 py-5 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-7 w-7 text-white" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-emerald-100">Share these credentials with the user</p>
        </div>

        {/* Credentials */}
        <div className="p-6 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Name</span>
              <span className="text-sm font-semibold text-slate-900">{name}</span>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{loginLabel}</span>
              <span className="text-sm font-mono font-semibold text-slate-900">{loginId}</span>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Password</span>
              <span className="text-sm font-mono font-bold text-brand-700 bg-brand-50 border border-brand-100 px-2.5 py-0.5 rounded-lg">
                {password}
              </span>
            </div>
          </div>

          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            ⚠ This password will not be shown again. Copy it now and share with the user.
          </p>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleCopy}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition ${
                copied
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}>
              {copied ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Credentials
                </>
              )}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl bg-brand-700 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 transition">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
