import Link from "next/link";

import { UserDashboardPanel } from "@/components/user/dashboard/user-dashboard-panel";

export default function UserDashboardPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Student Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Overview of your teacher evaluation activity and progress.
            </p>
          </div>

          <Link
            href="/user/evaluations"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5a2 2 0 104 0M9 5a2 2 0 014 0M9 12h6M9 16h6"
              />
            </svg>
            Start evaluation
          </Link>
        </div>
      </header>

      <main className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-8 sm:px-8">
        <UserDashboardPanel />
      </main>
    </div>
  );
}
