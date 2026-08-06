"use client";

import type { CatalogKind } from "@/lib/types/catalog";

const kindOptions: {
  id: CatalogKind;
  label: string;
  description: string;
  activeTextClass: string;
}[] = [
  {
    id: "departments",
    label: "Departments",
    description: "Manage departments used in the faculty form dropdown.",
    activeTextClass: "text-violet-800",
  },
  {
    id: "subjects",
    label: "Subjects",
    description: "Manage subjects used when assigning faculty.",
    activeTextClass: "text-emerald-800",
  },
];

interface CatalogKindSwitchProps {
  kind: CatalogKind;
  onChange: (kind: CatalogKind) => void;
}

export function CatalogKindSwitch({ kind, onChange }: CatalogKindSwitchProps) {
  const activeOption =
    kindOptions.find((option) => option.id === kind) ?? kindOptions[0];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Manage</p>
          <p className="mt-1 text-sm text-slate-500">{activeOption.description}</p>
        </div>

        <div className="relative grid w-full max-w-xs grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 sm:shrink-0">
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-1 top-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out ${
              kind === "departments"
                ? "left-1 right-[calc(50%+2px)]"
                : "left-[calc(50%+2px)] right-1"
            }`}
          />

          {kindOptions.map((option) => {
            const isActive = kind === option.id;

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
