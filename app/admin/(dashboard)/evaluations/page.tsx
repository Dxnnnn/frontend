import { SurveyQuestionsPanel } from "@/components/admin/evaluations/survey-questions-panel";

export default function EvaluationsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold text-slate-900">Evaluations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage scoring-scale questions for student and coordinator evaluation
          forms, including scoring and personal questionnaire sections.
        </p>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
        <SurveyQuestionsPanel />
      </main>
    </div>
  );
}
