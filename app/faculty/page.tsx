import { SchoolHeadDashboard } from "@/components/faculty-portal/school-head-dashboard";
import { getSessionUser } from "@/lib/auth/session";

export default async function FacultyPortalDashboardPage() {
  const user = await getSessionUser();
  const department = user?.department ?? "Unassigned";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">School Head Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track evaluation progress for teachers in {department}.
          </p>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
        <SchoolHeadDashboard department={department} />
      </main>
    </div>
  );
}
