"use client";

import { useState } from "react";

import { LoginForm } from "@/components/auth/login-form";
import type { LoginPortal } from "@/lib/types/auth";

const portalOptions: {
  id: LoginPortal;
  label: string;
  title: string;
  description: string;
  accentClass: string;
  activeTextClass: string;
}[] = [
  {
    id: "student",
    label: "Student",
    title: "Student login",
    description: "Sign in to submit teacher evaluation forms.",
    accentClass: "text-emerald-700",
    activeTextClass: "text-emerald-800",
  },
  {
    id: "staff",
    label: "School Head",
    title: "School Head login",
    description: "Sign in as a school head or administrator.",
    accentClass: "text-brand-700",
    activeTextClass: "text-brand-800",
  },
];

function PortalSwitcher({
  portal,
  onChange,
}: {
  portal: LoginPortal;
  onChange: (portal: LoginPortal) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-center text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        Sign in as
      </p>
      <div className="relative grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-1 top-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out ${
            portal === "student"
              ? "left-1 right-[calc(50%+2px)]"
              : "left-[calc(50%+2px)] right-1"
          }`}
        />
        {portalOptions.map((option) => {
          const isActive = portal === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`relative z-10 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                isActive
                  ? option.activeTextClass
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AuthPanel() {
  const [portal, setPortal] = useState<LoginPortal>("student");
  const activePortal = portalOptions.find((o) => o.id === portal)!;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${activePortal.accentClass}`}>
          {activePortal.label} portal
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">
          {activePortal.title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{activePortal.description}</p>
      </div>

      <PortalSwitcher portal={portal} onChange={setPortal} />

      <LoginForm key={portal} portal={portal} />
    </div>
  );
}
