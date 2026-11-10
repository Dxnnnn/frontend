import { SubjectsPanel } from "@/components/admin/subjects/subjects-panel";
import { PermissionGate } from "@/components/admin/permission-gate";

export default function EOSubjectsPage() {
  return (
    <PermissionGate requiredKeys={["subjects"]}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
          <h1 className="text-2xl font-semibold text-slate-900">Subjects</h1>
          <p className="mt-1 text-sm text-slate-500">Manage college subjects, assign them to year levels, courses, and faculty.</p>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
          <SubjectsPanel />
        </main>
      </div>
    </PermissionGate>
  );
}
