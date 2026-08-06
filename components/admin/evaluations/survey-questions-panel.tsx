"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { QuestionnaireAudienceSwitch } from "@/components/admin/evaluations/questionnaire-audience-switch";
import { SurveyQuestionCreateModal } from "@/components/admin/evaluations/survey-question-create-modal";
import { SurveyQuestionsList } from "@/components/admin/evaluations/survey-questions-list";
import {
  exportQuestionsCSV,
  getQuestionStats,
  importQuestionsCSV,
  loadQuestions,
  publishQuestions,
  saveAsDraft,
} from "@/lib/evaluations/storage";
import type { QuestionSection, SurveyAudience } from "@/lib/types/survey-question";
import { questionSectionLabels } from "@/lib/types/survey-question";

// ── Toast ─────────────────────────────────────────────────────────────────────
interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition-all ${
            t.type === "success" ? "bg-emerald-600" : t.type === "error" ? "bg-red-600" : "bg-brand-700"
          }`}
        >
          {t.type === "success" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span>{t.message}</span>
          <button type="button" onClick={() => onRemove(t.id)} className="ml-1 opacity-70 hover:opacity-100">×</button>
        </div>
      ))}
    </div>
  );
}

// ── Stats card ────────────────────────────────────────────────────────────────
function StatsCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ── Preview modal ─────────────────────────────────────────────────────────────
function PreviewModal({
  audience,
  section,
  onClose,
}: {
  audience: SurveyAudience;
  section: QuestionSection;
  onClose: () => void;
}) {
  const [questions, setQuestions] = useState<import("@/lib/types/survey-question").SurveyQuestion[]>([]);

  useEffect(() => {
    void (async () => {
      const all = await loadQuestions();
      setQuestions(all.filter((q) => q.audience === audience && q.section === section));
    })();
  }, [audience, section]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Preview — {questionSectionLabels[section]}</h2>
            <p className="text-xs text-slate-500 mt-0.5">This is what evaluators will see</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {questions.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No questions to preview.</p>
          ) : (
            questions.map((q, i) => (
              <div key={q.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900"><span className="mr-2 font-bold text-brand-700">{i + 1}.</span>{q.text}</p>
                {q.evaluationType === "rating" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[5, 4, 3, 2, 1, 0].map((v) => (
                      <span key={v} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">{v}</span>
                    ))}
                  </div>
                )}
                {q.evaluationType === "yes_no" && (
                  <div className="mt-3 flex gap-2">
                    {["Yes", "No"].map((v) => (
                      <span key={v} className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs text-slate-600">{v}</span>
                    ))}
                  </div>
                )}
                {q.evaluationType === "essay" && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-400 italic">Write your answer here...</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export function SurveyQuestionsPanel() {
  const [audience, setAudience] = useState<SurveyAudience>("student");
  const [section] = useState<QuestionSection>("scoring");
  const [refreshKey, setRefreshKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, categories: 0, lastUpdated: null as string | null });
  const importRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    void (async () => {
      const stats = await getQuestionStats(audience);
      setStats(stats);
    })();
  }, [audience, refreshKey]);

  function handlePublish() {
    void (async () => {
      const ok = await publishQuestions(audience);
      refresh();
      addToast(
        ok
          ? "All questions opened — now visible to evaluators."
          : "Failed to open questions. Is the backend running?",
        ok ? "success" : "error",
      );
    })();
  }

  function handleSaveDraft() {
    void (async () => {
      const ok = await saveAsDraft(audience);
      refresh();
      addToast(
        ok
          ? "All questions closed — hidden from evaluators."
          : "Failed to close questions. Is the backend running?",
        ok ? "info" : "error",
      );
    })();
  }

  function handleExport() {
    void (async () => {
      const csv = await exportQuestionsCSV(audience);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `evaluation-questions-${audience}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      addToast("Questions exported as CSV.", "success");
    })();
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const csv = ev.target?.result as string;
      void (async () => {
        const count = await importQuestionsCSV(csv, audience);
        refresh();
        addToast(
          count > 0
            ? `${count} question${count === 1 ? "" : "s"} imported successfully.`
            : "Import failed or no rows found.",
          count > 0 ? "success" : "error",
        );
      })();
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function formatLastUpdated(iso: string | null) {
    if (!iso) return "Never";
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <>
      <div className="space-y-6">
        {/* Audience switch only */}
        <QuestionnaireAudienceSwitch audience={audience} onChange={(a) => { setAudience(a); }} />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatsCard label="Total Questions" value={stats.total} />
          <StatsCard label="Active" value={stats.active} sub="visible to evaluators" />
          <StatsCard label="Inactive" value={stats.inactive} sub="hidden from evaluators" />
          <StatsCard label="Categories" value={stats.categories} />
          <StatsCard label="Last Updated" value={formatLastUpdated(stats.lastUpdated)} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add */}
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
            Add question
          </button>

          {/* Preview */}
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </button>

          {/* Export */}
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4 4-4-4M12 4v12" />
            </svg>
            Export CSV
          </button>

          {/* Import */}
          <button
            type="button"
            onClick={() => importRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M8 12l4-4 4 4M12 4v12" />
            </svg>
            Import CSV
          </button>
          <input ref={importRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />

          <div className="ml-auto flex gap-2">
            {/* Close All */}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" />
              </svg>
              Close All
            </button>

            {/* Open All */}
            <button
              type="button"
              onClick={handlePublish}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Open All
            </button>
          </div>
        </div>

        {/* Questions list */}
        <SurveyQuestionsList
          audience={audience}
          section={section}
          refreshKey={refreshKey}
          onRefresh={refresh}
          onToast={addToast}
        />
      </div>

      {createOpen && (
        <SurveyQuestionCreateModal
          open={createOpen}
          audience={audience}
          section={section}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            refresh();
            addToast("Question added successfully.", "success");
          }}
        />
      )}

      {previewOpen && (
        <PreviewModal
          audience={audience}
          section={section}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
