"use client";

import { useState } from "react";

import { addSurveyQuestion } from "@/lib/evaluations/storage";
import {
  questionCategories,
  questionSectionLabels,
  type EvaluationType,
  type QuestionCategory,
  type QuestionSection,
  type SurveyAudience,
} from "@/lib/types/survey-question";

interface SurveyQuestionFormProps {
  audience: SurveyAudience;
  section: QuestionSection;
  onCreated: () => void;
  embedded?: boolean;
}

const inputCls =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export function SurveyQuestionForm({
  audience,
  section,
  onCreated,
  embedded = false,
}: SurveyQuestionFormProps) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<QuestionCategory>("Instructional Competence");
  const [evaluationType, setEvaluationType] = useState<EvaluationType>("rating");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!text.trim()) {
      setError("Question text is required.");
      return;
    }

    void (async () => {
      const created = await addSurveyQuestion({
        text,
        audience,
        section,
        category,
        evaluationType,
        required: true,
        isActive,
      });
      if (!created) {
        setError("Failed to save question. Make sure the backend is running.");
        return;
      }
      setText("");
      setError("");
      onCreated();
    })();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={embedded ? "space-y-4" : "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"}
    >
      {!embedded ? (
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Add question</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create a {audience === "student" ? "student" : "school head"}{" "}
            {questionSectionLabels[section].toLowerCase()} question.
          </p>
        </div>
      ) : null}

      {/* Question text */}
      <div className="space-y-1.5">
        <label htmlFor="question-text" className="block text-sm font-medium text-slate-700">
          Question Text <span className="text-red-500">*</span>
        </label>
        <textarea
          id="question-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. The instructor explains lessons clearly and effectively."
          rows={3}
          className={`${inputCls} resize-none`}
          required
        />
      </div>

      {/* Category + Type */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="question-category" className="block text-sm font-medium text-slate-700">Category</label>
          <select id="question-category" value={category} onChange={(e) => setCategory(e.target.value as QuestionCategory)} className={inputCls}>
            {questionCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="question-type" className="block text-sm font-medium text-slate-700">Evaluation Type</label>
          <select id="question-type" value={evaluationType} onChange={(e) => setEvaluationType(e.target.value as EvaluationType)} className={inputCls}>
            <option value="rating">Rating (0–5)</option>
            <option value="essay">Essay</option>
            <option value="yes_no">Yes / No</option>
          </select>
        </div>
      </div>

      {/* Open/Close toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">Question status:</span>
        <button
          type="button"
          onClick={() => setIsActive((v) => !v)}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
            isActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
          {isActive ? "Open" : "Closed"}
        </button>
        <span className="text-xs text-slate-400">
          {isActive ? "Visible to students & school heads" : "Hidden from evaluators"}
        </span>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        className="flex w-full items-center justify-center rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
      >
        Add question
      </button>
    </form>
  );
}
