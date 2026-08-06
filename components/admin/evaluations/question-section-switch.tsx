"use client";

import type { QuestionSection } from "@/lib/types/survey-question";
import { questionSectionLabels } from "@/lib/types/survey-question";

const sectionOptions: {
  id: QuestionSection;
  label: string;
  description: string;
  activeTextClass: string;
}[] = [
  {
    id: "scoring",
    label: "Scoring scale",
    description: "Part 1 questions rated from 5 (highest) to 0 (lowest).",
    activeTextClass: "text-brand-800",
  },
  {
    id: "personal",
    label: "Personal questionnaire",
    description: "Part 2 questions also rated from 5 (highest) to 0 (lowest).",
    activeTextClass: "text-emerald-800",
  },
];

interface QuestionSectionSwitchProps {
  section: QuestionSection;
  onChange: (section: QuestionSection) => void;
}

export function QuestionSectionSwitch({
  section,
  onChange,
}: QuestionSectionSwitchProps) {
  const activeOption =
    sectionOptions.find((option) => option.id === section) ?? sectionOptions[0];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {questionSectionLabels[section]}
          </p>
          <p className="mt-1 text-sm text-slate-500">{activeOption.description}</p>
        </div>

        <div className="relative grid w-full max-w-md grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 sm:shrink-0">
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-1 top-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out ${
              section === "scoring"
                ? "left-1 right-[calc(50%+2px)]"
                : "left-[calc(50%+2px)] right-1"
            }`}
          />

          {sectionOptions.map((option) => {
            const isActive = section === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option.id)}
                className={`relative z-10 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                  isActive
                    ? option.activeTextClass
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
