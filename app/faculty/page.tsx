import Link from "next/link";

import { SchoolHeadDashboard } from "@/components/faculty-portal/school-head-dashboard";
import { getSessionUser } from "@/lib/auth/session";

export default async function FacultyPortalDashboardPage() {
  const user = await getSessionUser();
  const department = user?.department ?? "Unassigned";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">School Head Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track evaluation progress for teachers in {department}.
            </p>
          </div>

          <Link
            href="/faculty/evaluations"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Evaluate teachers
          </Link>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
        <SchoolHeadDashboard department={department} />
      </main>
    </div>
  );
}
