import { scoringScale } from "@/lib/types/survey-question";

export function ScoringGuide() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Part 1: Scoring scale
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Questions use a 0–5 scale (5 highest, 0 lowest).
          </p>
        </div>

        <ul className="flex flex-wrap gap-2 sm:justify-end">
          {scoringScale.map((level) => (
            <li
              key={level.value}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5"
              title={level.description}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
                {level.value}
              </span>
              <span className="text-xs font-medium text-slate-700">
                {level.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
