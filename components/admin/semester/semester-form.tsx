"use client";

import { useState, type FormEvent } from "react";
import { addSemesterAsync } from "@/lib/semester/storage";
import { SEMESTER_TERMS, type SemesterTerm } from "@/lib/types/semester";

interface SemesterFormProps {
  onCreated: () => void;
  embedded?: boolean;
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export function SemesterForm({ onCreated, embedded = false }: SemesterFormProps) {
  const [schoolYear, setSchoolYear] = useState("");
  const [term, setTerm] = useState<SemesterTerm>(SEMESTER_TERMS[0]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!schoolYear.trim()) { setError("School year is required."); return; }

    setSaving(true);
    try {
      const created = await addSemesterAsync({ schoolYear: schoolYear.trim(), term, subjects: [] });
      setSaving(false);
      if (!created) {
        setError("Failed to save semester.");
        return;
      }
      setSchoolYear("");
      setTerm(SEMESTER_TERMS[0]);
      onCreated();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Failed to save semester.");
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={embedded ? "" : "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"}
    >
      {!embedded && (
        <>
          <h2 className="text-lg font-semibold text-slate-900">Add new semester</h2>
          <p className="mt-1 text-sm text-slate-500">
            Set the school year and semester. Subjects will be pulled automatically from faculty.
          </p>
        </>
      )}

      <div className={embedded ? "grid gap-4 sm:grid-cols-2" : "mt-5 grid gap-4 sm:grid-cols-2"}>
        <div className="space-y-2">
          <label htmlFor="semester-school-year" className="block text-sm font-medium text-slate-700">
            School year
          </label>
          <input
            id="semester-school-year"
            type="text"
            value={schoolYear}
            onChange={(e) => setSchoolYear(e.target.value)}
            placeholder="e.g. 2025-2026"
            className={inputClassName}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="semester-term" className="block text-sm font-medium text-slate-700">
            Semester
          </label>
          <select
            id="semester-term"
            value={term}
            onChange={(e) => setTerm(e.target.value as SemesterTerm)}
            className={inputClassName}
            required
          >
            {SEMESTER_TERMS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-5 flex w-full shrink-0 items-center justify-center rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
