"use client";

import { useEffect, useState } from "react";
import { getSemestersAsync } from "@/lib/semester/storage";
import type { Semester } from "@/lib/types/semester";

interface FacultyFormProps {
  onCreated: () => void;
  embedded?: boolean;
}

const DEPARTMENTS = ["Elementary-Junior High School", "Senior High School", "College"] as const;
type Department = (typeof DEPARTMENTS)[number];

const GRADES_ELEM_JH = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const GRADES_SHS = ["11", "12"];
const SHS_STRANDS = ["STEM", "HUMSS", "ABM", "GAS", "TVL", "ICT", "HE", "IA"];
const COLLEGE_YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const COLLEGE_COURSES = ["BSIT", "BSCS", "BSHM", "BSBA", "BSED", "BSCRIM", "BSN", "BSECE"];
const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const inputCls =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

// ── Multi-select chip component ───────────────────────────────────────────────
function MultiSelect({
  label,
  options,
  selected,
  onToggle,
  formatLabel,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  formatLabel?: (value: string) => string;
}) {
  return (
    <div className="space-y-2">
      <p className="block text-sm font-medium text-slate-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                isSelected
                  ? "border-brand-500 bg-brand-700 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {formatLabel ? formatLabel(opt) : opt}
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-slate-400">Select at least one option.</p>
      )}
    </div>
  );
}

function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
}

// ── Main form ─────────────────────────────────────────────────────────────────
export function FacultyForm({ onCreated, embedded = false }: FacultyFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");

  // Multi-select department
  const [departments, setDepartments] = useState<Department[]>([]);

  // Elem/JH
  const [grades, setGrades] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);

  // SHS
  const [shsGrades, setShsGrades] = useState<string[]>([]);
  const [strands, setStrands] = useState<string[]>([]);
  const [shsSections, setShsSections] = useState<string[]>([]);

  // College
  const [yearLevels, setYearLevels] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [collegeSections, setCollegeSections] = useState<string[]>([]);

  const [subjectInput, setSubjectInput] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [dbSemesters, setDbSemesters] = useState<Semester[]>([]);

  // Load semesters from DB on mount
  useEffect(() => {
    void getSemestersAsync().then(setDbSemesters);
  }, []);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasElem = departments.includes("Elementary-Junior High School");
  const hasSHS = departments.includes("Senior High School");
  const hasCollege = departments.includes("College");
  // Semester only applies to SHS and College (Elementary/JH use quarters, not semesters)
  const showSemester = hasSHS || hasCollege;

  // Build semester options from DB — filter Summer for non-College
  const semesterOptions: string[] = (() => {
    const base = dbSemesters.length > 0
      ? dbSemesters
          .filter((s) => hasCollege || s.term !== "Summer")
          .map((s) => `${s.schoolYear} · ${s.term}`)
      : hasCollege
        ? ["1st Semester", "2nd Semester", "Summer"]
        : ["1st Semester", "2nd Semester"];
    return base;
  })();

  function addSubject() {
    const trimmed = subjectInput.trim();
    if (!trimmed || subjects.includes(trimmed)) { setSubjectInput(""); return; }
    setSubjects((prev) => [...prev, trimmed]);
    setSubjectInput("");
  }

  function removeSubject(s: string) {
    setSubjects((prev) => prev.filter((x) => x !== s));
  }

  function buildDepartmentLabel(): string {
    const parts: string[] = [];

    if (hasElem && grades.length > 0 && sections.length > 0) {
      parts.push(
        `Elementary-Junior High School (Grade ${grades.join(", ")} - Section ${sections.join(", ")})`
      );
    }

    if (hasSHS && shsGrades.length > 0 && strands.length > 0 && shsSections.length > 0) {
      parts.push(
        `Senior High School (Grade ${shsGrades.join(", ")} - ${strands.join(", ")} - Section ${shsSections.join(", ")})`
      );
    }

    if (hasCollege && yearLevels.length > 0 && courses.length > 0 && collegeSections.length > 0) {
      parts.push(
        `College (${yearLevels.join(", ")} - ${courses.join(", ")} - Section ${collegeSections.join(", ")})`
      );
    }

    return parts.join(" | ");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim() || departments.length === 0) {
      setError("Name and at least one department are required.");
      return;
    }

    if (hasElem && (grades.length === 0 || sections.length === 0)) {
      setError("Select grade and section for Elementary-Junior High School.");
      return;
    }
    if (hasSHS && (shsGrades.length === 0 || strands.length === 0 || shsSections.length === 0)) {
      setError("Select grade, strand, and section for Senior High School.");
      return;
    }
    if (hasCollege && (yearLevels.length === 0 || courses.length === 0 || collegeSections.length === 0)) {
      setError("Select year level, course, and section for College.");
      return;
    }

    setIsSubmitting(true);

    try {
      const allowedSemesters = hasCollege
        ? semesters
        : semesters.filter((s) => !s.includes("Summer"));

      const res = await fetch("/api/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          position: position.trim() || null,
          department: buildDepartmentLabel(),
          subjects,
          semester: allowedSemesters.length > 0 ? allowedSemesters.join(", ") : null,
        }),
      });

      const data = (await res.json()) as { success?: boolean; message?: string };

      if (!res.ok || !data.success) {
        setError(data.message ?? "Failed to add faculty.");
        return;
      }

      setName(""); setEmail(""); setPosition("");
      setDepartments([]);
      setGrades([]); setSections([]);
      setShsGrades([]); setStrands([]); setShsSections([]);
      setYearLevels([]); setCourses([]); setCollegeSections([]);
      setSubjects([]); setSubjectInput("");
      setSemesters([]);
      onCreated();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={embedded ? "" : "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"}
    >
      {!embedded ? (
        <>
          <h2 className="text-lg font-semibold text-slate-900">Add new faculty</h2>
          <p className="mt-1 text-sm text-slate-500">Fill in the faculty member details below.</p>
        </>
      ) : null}

      <div className={embedded ? "space-y-4" : "mt-5 space-y-4"}>

        {/* Full Name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="faculty-name" className="block text-sm font-medium text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input id="faculty-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Maria Santos" className={inputCls} required />
          </div>

          {/* Email + Position */}
          <div className="space-y-2">
            <label htmlFor="faculty-email" className="block text-sm font-medium text-slate-700">Email</label>
            <input id="faculty-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. m.santos@bc.edu.ph" className={inputCls} />
          </div>
          <div className="space-y-2">
            <label htmlFor="faculty-position" className="block text-sm font-medium text-slate-700">Position</label>
            <input id="faculty-position" type="text" value={position} onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Professor, Instructor" className={inputCls} />
          </div>
        </div>

        {/* Department multi-select */}
        <MultiSelect
          label="Department *"
          options={DEPARTMENTS}
          selected={departments}
          onToggle={(v) => setDepartments((prev) => toggle(prev, v as Department) as Department[])}
        />

        {/* Elementary / Junior High fields */}
        {hasElem && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Elementary-Junior High School</p>
            <MultiSelect
              label="Grade"
              options={GRADES_ELEM_JH}
              selected={grades}
              onToggle={(v) => setGrades((prev) => toggle(prev, v))}
              formatLabel={(v) => `Grade ${v}`}
            />
            <MultiSelect
              label="Section"
              options={SECTIONS}
              selected={sections}
              onToggle={(v) => setSections((prev) => toggle(prev, v))}
              formatLabel={(v) => `Section ${v}`}
            />
          </div>
        )}

        {/* Senior High School fields */}
        {hasSHS && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Senior High School</p>
            <MultiSelect
              label="Grade"
              options={GRADES_SHS}
              selected={shsGrades}
              onToggle={(v) => setShsGrades((prev) => toggle(prev, v))}
              formatLabel={(v) => `Grade ${v}`}
            />
            <MultiSelect
              label="Strand"
              options={SHS_STRANDS}
              selected={strands}
              onToggle={(v) => setStrands((prev) => toggle(prev, v))}
            />
            <MultiSelect
              label="Section"
              options={SECTIONS}
              selected={shsSections}
              onToggle={(v) => setShsSections((prev) => toggle(prev, v))}
              formatLabel={(v) => `Section ${v}`}
            />
          </div>
        )}

        {/* College fields */}
        {hasCollege && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">College</p>
            <MultiSelect
              label="Year Level"
              options={COLLEGE_YEAR_LEVELS}
              selected={yearLevels}
              onToggle={(v) => setYearLevels((prev) => toggle(prev, v))}
            />
            <MultiSelect
              label="Course"
              options={COLLEGE_COURSES}
              selected={courses}
              onToggle={(v) => setCourses((prev) => toggle(prev, v))}
            />
            <MultiSelect
              label="Section"
              options={SECTIONS}
              selected={collegeSections}
              onToggle={(v) => setCollegeSections((prev) => toggle(prev, v))}
              formatLabel={(v) => `Section ${v}`}
            />
          </div>
        )}

        {/* Subjects */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Subjects</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(); } }}
              placeholder="Type a subject and press Enter or Add"
              className={inputCls}
            />
            <button type="button" onClick={addSubject}
              className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              Add
            </button>
          </div>
          {subjects.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {subjects.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                  {s}
                  <button type="button" onClick={() => removeSubject(s)} className="text-brand-400 transition hover:text-brand-700" aria-label={`Remove ${s}`}>×</button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No subjects added yet.</p>
          )}
        </div>

        {/* Semester multi-select — only for SHS and College (Summer = College only) */}
        {showSemester && (
          <MultiSelect
            label="Semester (which semesters does this faculty teach?)"
            options={semesterOptions}
            selected={semesters.filter((s) => semesterOptions.includes(s))}
            onToggle={(v) => setSemesters((prev) => toggle(prev, v))}
          />
        )}
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button type="submit" disabled={isSubmitting}
        className="mt-5 flex w-full items-center justify-center rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70">
        {isSubmitting ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
