"use client";

import { useEffect, useState } from "react";
import { getActiveSemestersAsync } from "@/lib/semester/storage";
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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

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
    void getActiveSemestersAsync().then(setDbSemesters);
  }, []);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasElem = departments.includes("Elementary-Junior High School");
  const hasSHS = departments.includes("Senior High School");
  const hasCollege = departments.includes("College");
  // Semester applies to SHS and College; Quarter applies to JH
  const showSemester = hasSHS || hasCollege || hasElem;

  // Build semester options from DB — filter based on department
  const semesterOptions: string[] = (() => {
    if (dbSemesters.length > 0) {
      return dbSemesters
        .filter((s) => {
          const isIndividualQuarter = ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"].includes(s.term);
          // Never show individual quarters in the faculty form — they are for school head evaluation only
          if (isIndividualQuarter) return false;
          const isQuarter = s.term.includes("Quarter");
          if (hasElem && !hasSHS && !hasCollege) return isQuarter; // JH only → combined quarters only
          if (!hasElem && (hasSHS || hasCollege)) {
            if (!hasCollege && s.term === "Summer") return false;
            return !isQuarter; // SHS/College → semesters only
          }
          return true;
        })
        .map((s) => `SY-${s.schoolYear} ${s.term}`);
    }
    if (hasElem && !hasSHS && !hasCollege) return ["Quarter 1 & 2", "Quarter 3 & 4"];
    return hasCollege ? ["1st Semester", "2nd Semester", "Summer"] : ["1st Semester", "2nd Semester"];
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

    if (hasElem) {
      parts.push(`Elementary-Junior High School`);
    }

    if (hasSHS) {
      parts.push(`Senior High School`);
    }

    if (hasCollege) {
      parts.push(`College`);
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
          profile_image: profileImage ?? null,
        }),
      });

      const data = (await res.json()) as { success?: boolean; message?: string };

      if (!res.ok || !data.success) {
        setError(data.message ?? "Failed to add faculty.");
        return;
      }

      setName(""); setEmail(""); setPosition("");
      setProfileImage(null);
      setDepartments([]);
      setGrades([]); setSections([]);
      setShsGrades([]); setStrands([]); setShsSections([]);
      setYearLevels([]); setCourses([]); setCollegeSections([]);
      setSubjects([]); setSubjectInput("");
      setSemesters([]);      onCreated();
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

        {/* Profile Photo */}
        <div className="space-y-2 sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Profile Photo</label>
          <div className="flex items-center gap-4">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="h-32 w-32 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-16 w-16" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setImageUploading(true);
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/upload/image`,
                        { method: "POST", body: formData }
                      );
                      const data = await res.json() as { success?: boolean; url?: string; message?: string };
                      if (data.success && data.url) {
                        setProfileImage(data.url);
                      } else {
                        setError(data.message ?? "Failed to upload image.");
                      }
                    } catch {
                      setError("Failed to upload image. Please try again.");
                    } finally {
                      setImageUploading(false);
                    }
                  }}
                />
                {imageUploading ? "Uploading..." : "Upload Photo"}
              </label>
              {profileImage && (
                <button type="button" onClick={() => setProfileImage(null)}
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100">
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </div>

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
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Elementary-Junior High School ✓</p>
          </div>
        )}

        {/* Senior High School fields */}
        {hasSHS && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Senior High School ✓</p>
          </div>
        )}


        {/* Semester multi-select — only for SHS and College (Summer = College only) */}
        {showSemester && (
          <MultiSelect
            label={hasElem && !hasSHS && !hasCollege ? "Quarter (which quarters does this faculty teach?)" : "Semester (which semesters does this faculty teach?)"}
            options={semesterOptions.filter((s) => semesterOptions.includes(s))}
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
