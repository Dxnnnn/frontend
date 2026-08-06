import Link from "next/link";

import { DashboardStats } from "@/components/admin/dashboard-stats";
import { RecentEvaluationsTicker } from "@/components/admin/recent-evaluations-ticker";

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Teacher Evaluation Summary
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Overview of all teacher evaluation activity and progress.
            </p>
          </div>

          <Link
            href="/admin/reports"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5V5.5h16v14" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 15.5v-4M12 15.5V8.5M16 15.5v-2" />
            </svg>
            View reports
          </Link>
        </div>
      </header>

      <main className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-8 sm:px-8">
        <DashboardStats />
        <RecentEvaluationsTicker />
      </main>
    </div>
  );
}
