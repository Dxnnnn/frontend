import { FacultyPerformanceTable } from "@/components/admin/reports/faculty-performance-table";
import { getSessionUser } from "@/lib/auth/session";

export default async function FacultyReportsPage() {
  const user = await getSessionUser();
  const department = user?.department ?? "Unassigned";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Faculty performance overview for {department}. Click &quot;View Report&quot; to
          see a full detailed evaluation report.
        </p>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
        <FacultyPerformanceTable
          departmentFilter={department}
          reportBasePath="/faculty/reports"
          includeSchoolHead
        />
      </main>
    </div>
  );
}
