"use client";

import type { StudentLevel } from "@/lib/accounts/student-options";
import { STUDENT_LEVEL_OPTIONS } from "@/lib/accounts/student-options";

interface StudentLevelSwitchProps {
  level: StudentLevel;
  onChange: (level: StudentLevel) => void;
  compact?: boolean;
}

export function StudentLevelSwitch({
  level,
  onChange,
  compact = false,
}: StudentLevelSwitchProps) {
  const activeOption =
    STUDENT_LEVEL_OPTIONS.find((option) => option.id === level) ??
    STUDENT_LEVEL_OPTIONS[0];

  return (
    <section
      className={
        compact
          ? "rounded-2xl border border-slate-200 bg-slate-50 p-4"
          : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      }
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Student level</p>
          {!compact ? (
            <p className="mt-1 text-sm text-slate-500">
              Choose which type of student account to create.
            </p>
          ) : null}
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-2 lg:max-w-2xl lg:grid-cols-4">
          {STUDENT_LEVEL_OPTIONS.map((option) => {
            const isActive = level === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option.id)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {!compact ? (
        <p className="mt-4 text-sm font-medium text-emerald-800">
          {activeOption.createLabel}
        </p>
      ) : null}
    </section>
  );
}
