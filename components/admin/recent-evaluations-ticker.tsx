"use client";

import { useEffect, useState, type ReactNode } from "react";

import { EVAL_SUBMISSIONS_UPDATED_EVENT } from "@/lib/admin/evaluation-events";
import {
  getRecentEvaluationsAsync,
  type RecentEvaluationItem,
} from "@/lib/admin/recent-evaluations";
import { useIsClient } from "@/lib/hooks/use-is-client";

function EvaluationTickerItems({
  items,
  suffix = "",
}: {
  items: RecentEvaluationItem[];
  suffix?: string;
}) {
  return (
    <>
      {items.map((row) => (
        <p
          key={`${row.id}${suffix}`}
          className="flex shrink-0 items-center gap-3 whitespace-nowrap px-4 text-sm text-white"
        >
          <span className="font-semibold">{row.facultyName}</span>
          <span className="text-white/90">{row.subject}</span>
          <span className="text-white/85">{row.department}</span>
          <span className="text-white/85">{row.source}</span>
          <span className="text-white/80">{row.dateLabel}</span>
          <span aria-hidden="true">•</span>
        </p>
      ))}
    </>
  );
}

function TickerShell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          Recent Evaluations
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Latest completed student and school head questionnaires.
        </p>
      </div>
      <section
        aria-label="Recent evaluations"
        className="evaluation-ticker-shine overflow-hidden rounded-xl bg-orange-400 shadow-sm"
      >
        {children}
      </section>
    </div>
  );
}

export function RecentEvaluationsTicker() {
  const isClient = useIsClient();
  const [items, setItems] = useState<RecentEvaluationItem[]>([]);

  useEffect(() => {
    if (!isClient) {
      return;
    }

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

  if (!isClient) {
    return (
      <TickerShell>
        <div className="px-4 py-3 text-sm text-white/90">
          Loading recent evaluations...
        </div>
      </TickerShell>
    );
  }

  if (items.length === 0) {
    return (
      <TickerShell>
        <div className="px-4 py-3 text-sm text-white/90">
          No recent evaluations yet. Completed student and school head
          questionnaires will appear here.
        </div>
      </TickerShell>
    );
  }

  return (
    <TickerShell>
      <div className="overflow-hidden py-3">
        <div className="evaluation-ticker-track">
          <EvaluationTickerItems items={items} />
          <EvaluationTickerItems items={items} suffix="-dup" />
        </div>
      </div>
    </TickerShell>
  );
}
