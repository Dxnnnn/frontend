import { CoordinatorFacultyList } from "@/components/faculty-portal/coordinator-faculty-list";
import { getSessionUser } from "@/lib/auth/session";

export default async function CoordinatorFacultyPage() {
  const user = await getSessionUser();
  const department = user?.department ?? "Unassigned";
  const schoolHeadId = user?.username ?? "";
  const schoolHeadName = user?.name ?? "";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold text-slate-900">Teachers</h1>
        <p className="mt-1 text-sm text-slate-500">
          Teachers assigned to the <span className="font-medium text-brand-700">{department}</span> department.{" "}
          <span className="text-brand-600">Click a row to start the evaluation.</span>
        </p>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
        <CoordinatorFacultyList
          department={department}
          schoolHeadId={schoolHeadId}
          schoolHeadName={schoolHeadName}
        />
      </main>
    </div>
  );
}
