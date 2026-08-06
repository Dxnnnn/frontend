import { EvaluationFormPanel } from "@/components/user/evaluations/evaluation-form-panel";
import { getSessionUser } from "@/lib/auth/session";

export default async function FacultyEvaluationsPage() {
  const user = await getSessionUser();
  const department = user?.department ?? "Unassigned";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold text-slate-900">Evaluation Form</h1>
        <p className="mt-1 text-sm text-slate-500">
          Evaluate teachers in the {department} department using the school head
          questionnaire.
        </p>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
        <EvaluationFormPanel
          audience="school_head"
          departmentFilter={department}
        />
      </main>
    </div>
  );
}
