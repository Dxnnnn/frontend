"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface AuthLoadingScreenProps {
  label: string;
  complete?: boolean;
  completeHint?: string;
  onComplete?: () => void;
}

export function AuthLoadingScreen({
  label,
  complete = false,
  completeHint = "Loading your portal...",
  onComplete,
}: AuthLoadingScreenProps) {
  const [progress, setProgress] = useState(8);
  const displayProgress = complete ? 100 : progress;

  useEffect(() => {
    if (complete) {
      const timeout = window.setTimeout(() => {
        onComplete?.();
      }, 450);

      return () => window.clearTimeout(timeout);
    }

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 90) {
          return current;
        }

        const step = current < 50 ? 6 : current < 80 ? 3 : 1;
        return Math.min(current + step, 90);
      });
    }, 180);

    return () => window.clearInterval(interval);
  }, [complete, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-100 px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(30,64,175,0.14),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(243,109,33,0.12),transparent_38%)]" />

      <div className="relative w-full max-w-sm rounded-3xl border border-white/70 bg-white/95 p-8 text-center shadow-xl shadow-slate-200/70 backdrop-blur">
        <Image
          src="/benedicto-college-logo.png"
          alt="Benedicto College logo"
          width={120}
          height={120}
          priority
          unoptimized
          className="mx-auto h-28 w-28 object-contain drop-shadow-md"
        />

        <p className="mt-6 text-sm font-medium text-slate-700">
          {complete ? "Redirecting..." : label}
        </p>

        <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-700 transition-[width] duration-500 ease-out"
            style={{ width: `${displayProgress}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {complete ? completeHint : "Please wait..."}
        </p>
      </div>
    </div>
  );
}
