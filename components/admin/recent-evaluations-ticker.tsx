"use client";

import { useEffect, useState } from "react";

import { EVAL_SUBMISSIONS_UPDATED_EVENT } from "@/lib/admin/evaluation-events";
import {
  getRecentEvaluationsAsync,
  type RecentEvaluationItem,
} from "@/lib/admin/recent-evaluations";
import { useIsClient } from "@/lib/hooks/use-is-client";

// Initials avatar from faculty name
function Avatar({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
      {initials}
    </span>
  );
}

// Source badge — Student vs School Head
function SourceBadge({ source }: { source: RecentEvaluationItem["source"] }) {
  return source === "School Head" ? (
    <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
      School Head
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
      Student
    </span>
  );
}

export function RecentEvaluationsTicker() {
  const isClient = useIsClient();
  const [items, setItems] = useState<RecentEvaluationItem[]>([]);

  useEffect(() => {
    if (!isClient) return;

    function refresh() {
      void getRecentEvaluationsAsync().then(setItems);
    }

    refresh();
    window.addEventListener(EVAL_SUBMISSIONS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(EVAL_SUBMISSIONS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [isClient]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Recent Evaluations</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Latest completed student and school head questionnaires.
          </p>
        </div>
        {items.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            {items.length}
          </span>
        )}
      </div>

      {/* Body */}
      {!isClient || items.length === 0 ? (
        <div className="px-6 py-10 text-center">
          {!isClient ? (
            // Skeleton rows while loading
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 rounded bg-slate-100" />
                    <div className="h-2.5 w-48 rounded bg-slate-100" />
                  </div>
                  <div className="h-5 w-16 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12h6m-3-3v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-slate-500">No evaluations yet</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Completed student and school head questionnaires will appear here.
              </p>
            </>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-y-auto" style={{ maxHeight: "18rem" }}>
          {items.map((row, idx) => (
            <li key={row.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors">
              {/* Rank number */}
              <span className="w-5 shrink-0 text-xs font-semibold text-slate-400 tabular-nums">
                {idx + 1}
              </span>

              {/* Avatar */}
              <Avatar name={row.facultyName} />

              {/* Main info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{row.facultyName}</p>
                <p className="truncate text-xs text-slate-500">
                  {row.subject}
                  {row.department && (
                    <span className="text-slate-400"> · {row.department}</span>
                  )}
                </p>
              </div>

              {/* Source badge */}
              <SourceBadge source={row.source} />

              {/* Date */}
              <span className="shrink-0 text-xs text-slate-400">{row.dateLabel}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
