import { EvaluationStatusPanel } from "@/components/admin/evaluations/evaluation-status-panel";

export default function EvaluationStatusPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold text-slate-900">Evaluation Status</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor who has submitted evaluations — students and school heads.
        </p>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
        <EvaluationStatusPanel />
      </main>
    </div>
  );
}
