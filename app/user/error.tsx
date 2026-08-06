"use client";

import { useEffect } from "react";

export default function UserError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("User portal error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6">
      <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm text-center max-w-md w-full">
        <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-500">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
