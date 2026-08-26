"use client";

import { useEffect, useRef, useState } from "react";

import {
  deleteSurveyQuestion,
  duplicateSurveyQuestion,
  loadQuestions,
  reorderQuestions,
  updateSurveyQuestion,
} from "@/lib/evaluations/storage";
import {
  categoryColors,
  evaluationTypeLabels,
  questionCategories,
  questionSectionLabels,
  scoringScale,
  type QuestionCategory,
  type QuestionSection,
  type SurveyAudience,
  type SurveyQuestion,
} from "@/lib/types/survey-question";

interface SurveyQuestionsListProps {
  audience: SurveyAudience;
  section: QuestionSection;
  refreshKey: number;
  onRefresh: () => void;
  onToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const PAGE_SIZE = 10;

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({
  question,
  onConfirm,
  onCancel,
}: {
  question: SurveyQuestion;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} aria-label="Cancel" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6 text-red-600" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M10 11v6M14 11v6M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-9 0h10l-1 12a1 1 0 01-1 1H9a1 1 0 01-1-1L7 7z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900">Delete question?</h3>
        <p className="mt-2 text-sm text-slate-500 line-clamp-3">&ldquo;{question.text}&rdquo;</p>
        <p className="mt-2 text-xs text-red-600">This action cannot be undone.</p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit modal ────────────────────────────────────────────────────────────────
function EditQuestionModal({
  question,
  onSave,
  onClose,
}: {
  question: SurveyQuestion;
  onSave: (updates: Partial<SurveyQuestion>) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(question.text);
  const [category, setCategory] = useState<QuestionCategory>(question.category);
  const [evaluationType, setEvaluationType] = useState(question.evaluationType);
  const [required, setRequired] = useState(question.required);
  const [isActive, setIsActive] = useState(question.isActive);
  const [error, setError] = useState("");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) { setError("Question text is required."); return; }
    onSave({ text: text.trim(), category, evaluationType, required, isActive });
    onClose();
  }

  const inputCls = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Edit question</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Question Text <span className="text-red-500">*</span></label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="e.g. The instructor explains lessons clearly." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value as QuestionCategory)} className={inputCls}>
                {questionCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Evaluation Type</label>
              <select value={evaluationType} onChange={e => setEvaluationType(e.target.value as typeof evaluationType)} className={inputCls}>
                <option value="rating">Rating (0–5)</option>
                <option value="essay">Essay</option>
                <option value="yes_no">Yes / No</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-700" />
              <span className="text-sm text-slate-700">Required</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
              <span className="text-sm text-slate-700">Active</span>
            </label>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="flex-1 rounded-xl bg-brand-700 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Question card ─────────────────────────────────────────────────────────────
function QuestionCard({
  question,
  index,
  onEdit,
  onToggle,
  onDelete,
  dragHandleProps,
}: {
  question: SurveyQuestion;
  index: number;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>;
}) {
  return (
    <article className={`rounded-2xl border bg-white p-4 shadow-sm transition ${question.isActive ? "border-slate-200" : "border-slate-200 opacity-60"}`}>
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div {...dragHandleProps} className="mt-0.5 cursor-grab touch-none select-none text-slate-300 hover:text-slate-500 active:cursor-grabbing">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" />
          </svg>
        </div>

        {/* Number */}
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
          {index + 1}
        </span>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[question.category]}`}>
              {question.category}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {evaluationTypeLabels[question.evaluationType]}
            </span>
            {question.required && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">Required</span>
            )}
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              question.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${question.status === "published" ? "bg-emerald-500" : "bg-amber-500"}`} />
              {question.status === "published" ? "Published" : "Draft"}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-900">{question.text}</p>

          {/* Preview */}
          {question.evaluationType === "rating" && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {scoringScale.map((l) => (
                <span key={l.value} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                  <span className="font-bold">{l.value}</span>
                  <span className="text-slate-400">{l.label}</span>
                </span>
              ))}
            </div>
          )}
          {question.evaluationType === "yes_no" && (
            <div className="mt-2 flex gap-1.5">
              {["Yes", "No"].map(v => (
                <span key={v} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">{v}</span>
              ))}
            </div>
          )}
          {question.evaluationType === "essay" && (
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-400 italic">Essay response...</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onEdit} title="Edit"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Delete"
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M10 11v6M14 11v6M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-9 0h10l-1 12a1 1 0 01-1 1H9a1 1 0 01-1-1L7 7z" />
            </svg>
            Delete
          </button>
          <button
            type="button"
            onClick={onToggle}
            title={question.isActive ? "Set Closed" : "Set Open"}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              question.isActive
                ? "border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100"
                : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            }`}
          >
            {question.isActive ? "Close" : "Open"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Main list ─────────────────────────────────────────────────────────────────
export function SurveyQuestionsList({
  audience,
  section,
  refreshKey,
  onRefresh,
  onToast,
}: SurveyQuestionsListProps) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "newest" | "oldest">("all");
  const [categoryFilter, setCategoryFilter] = useState<QuestionCategory | "all">("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<SurveyQuestion | null>(null);
  const [editTarget, setEditTarget] = useState<SurveyQuestion | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const all = await loadQuestions();
      if (cancelled) return;
      setQuestions(all.filter((q) => q.audience === audience && q.section === section));
      setPage(1);
    })();
    return () => {
      cancelled = true;
    };
  }, [audience, section, refreshKey]);

  // Filter + search
  let filtered = questions.filter((q) => {
    const matchSearch = search === "" || q.text.toLowerCase().includes(search.toLowerCase()) || q.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || q.category === categoryFilter;
    return matchSearch && matchCat;
  });

  if (filter === "active") filtered = filtered.filter((q) => q.isActive);
  else if (filter === "inactive") filtered = filtered.filter((q) => !q.isActive);
  else if (filter === "newest") filtered = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else if (filter === "oldest") filtered = [...filtered].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Drag and drop
  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOver.current = index;
  }

  function handleDrop() {
    if (dragItem.current === null || dragOver.current === null) return;
    const reordered = [...questions];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOver.current, 0, moved);
    setQuestions(reordered);
    void reorderQuestions(reordered.map((q) => q.id));
    dragItem.current = null;
    dragOver.current = null;
    onToast("Questions reordered.", "info");
  }

  function handleEdit(updates: Partial<SurveyQuestion>, id: string) {
    void (async () => {
      const ok = await updateSurveyQuestion(id, updates);
      onRefresh();
      onToast(ok ? "Question updated." : "Failed to update question.", ok ? "success" : "error");
    })();
  }

  function handleDuplicate(id: string) {
    void (async () => {
      const copy = await duplicateSurveyQuestion(id);
      onRefresh();
      onToast(copy ? "Question duplicated." : "Failed to duplicate question.", copy ? "success" : "error");
    })();
  }

  function handleDelete(question: SurveyQuestion) {
    setDeleteTarget(question);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    void (async () => {
      const ok = await deleteSurveyQuestion(deleteTarget.id);
      setDeleteTarget(null);
      onRefresh();
      onToast(ok ? "Question deleted." : "Failed to delete question.", ok ? "error" : "error");
    })();
  }

  function handleToggle(question: SurveyQuestion) {
    void (async () => {
      const ok = await updateSurveyQuestion(question.id, { isActive: !question.isActive });
      onRefresh();
      onToast(
        ok
          ? question.isActive
            ? "Question disabled."
            : "Question enabled."
          : "Failed to update question.",
        ok ? "info" : "error",
      );
    })();
  }

  const filterBtnCls = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-xs font-medium transition ${active ? "bg-brand-700 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`;

  return (
    <>
      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search questions..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value as typeof categoryFilter); setPage(1); }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          >
            <option value="all">All categories</option>
            {questionCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Status/sort filters */}
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "inactive", "newest", "oldest"] as const).map((f) => (
            <button key={f} type="button" onClick={() => { setFilter(f); setPage(1); }} className={filterBtnCls(filter === f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500 self-center">
            {filtered.length} question{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-600">No questions found</p>
          <p className="mt-1 text-sm text-slate-500">
            {search || filter !== "all" ? "Try adjusting your search or filters." : `Add your first ${audience === "student" ? "student" : "school head"} ${questionSectionLabels[section].toLowerCase()} question.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((question, idx) => {
            const globalIdx = (page - 1) * PAGE_SIZE + idx;
            return (
              <div
                key={question.id}
                draggable
                onDragStart={() => handleDragStart(globalIdx)}
                onDragEnter={() => handleDragEnter(globalIdx)}
                onDragEnd={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <QuestionCard
                  question={question}
                  index={globalIdx}
                  onEdit={() => setEditTarget(question)}
                  onToggle={() => handleToggle(question)}
                  onDelete={() => handleDelete(question)}
                  dragHandleProps={{}}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          question={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <EditQuestionModal
          question={editTarget}
          onSave={(updates) => handleEdit(updates, editTarget.id)}
          onClose={() => setEditTarget(null)}
        />
      )}
    </>
  );
}
