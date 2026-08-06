"use client";

import type { SurveyAudience } from "@/lib/types/survey-question";

const audienceOptions: {
  id: SurveyAudience;
  label: string;
  description: string;
  activeTextClass: string;
}[] = [
  {
    id: "student",
    label: "Student",
    description: "Questions shown on the student evaluation form.",
    activeTextClass: "text-emerald-800",
  },
  {
    id: "school_head",
    label: "School Head",
    description: "Questions shown on the coordinator evaluation form.",
    activeTextClass: "text-brand-800",
  },
];

interface QuestionnaireAudienceSwitchProps {
  audience: SurveyAudience;
  onChange: (audience: SurveyAudience) => void;
}

export function QuestionnaireAudienceSwitch({
  audience,
  onChange,
}: QuestionnaireAudienceSwitchProps) {
  const activeOption =
    audienceOptions.find((option) => option.id === audience) ??
    audienceOptions[0];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Questionnaire for</p>
          <p className="mt-1 text-sm text-slate-500">{activeOption.description}</p>
        </div>

        <div className="relative grid w-full max-w-xs grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 sm:shrink-0">
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-1 top-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out ${
              audience === "student"
                ? "left-1 right-[calc(50%+2px)]"
                : "left-[calc(50%+2px)] right-1"
            }`}
          />

          {audienceOptions.map((option) => {
            const isActive = audience === option.id;

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
