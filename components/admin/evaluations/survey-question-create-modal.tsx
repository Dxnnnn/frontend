"use client";

import { useEffect } from "react";

import { SurveyQuestionForm } from "@/components/admin/evaluations/survey-question-form";
import type { QuestionSection, SurveyAudience } from "@/lib/types/survey-question";
import { questionSectionLabels } from "@/lib/types/survey-question";

interface SurveyQuestionCreateModalProps {
  open: boolean;
  audience: SurveyAudience;
  section: QuestionSection;
  onClose: () => void;
  onCreated: () => void;
}

export function SurveyQuestionCreateModal({
  open,
  audience,
  section,
  onClose,
  onCreated,
}: SurveyQuestionCreateModalProps) {
  const audienceLabel = audience === "student" ? "student" : "school head";
  const sectionLabel = questionSectionLabels[section].toLowerCase();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function handleCreated() {
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close add question dialog"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-question-dialog-title"
        className="portal-content-enter relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl"
      >
        <div className="shrink-0 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="create-question-dialog-title"
                className="text-xl font-semibold text-slate-900"
              >
                Add question
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Create a {audienceLabel} {sectionLabel} question rated from 0 to
                5.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8">
          <SurveyQuestionForm
            key={`${audience}-${section}`}
            audience={audience}
            section={section}
            embedded
            onCreated={handleCreated}
          />
        </div>
      </div>
    </div>
  );
}
