"use client";

import { useEffect, useState } from "react";

import {
  COLLEGE_COURSES,
  COLLEGE_YEAR_LEVELS,
  SENIOR_HIGH_STRANDS,
  STUDENT_LEVEL_OPTIONS,
  getGradesForLevel,
  type StudentLevel,
} from "@/lib/accounts/student-options";

interface StudentAccountFormProps {
  level: StudentLevel;
  onCreated: (data: { title: string; name: string; loginId: string; password: string; loginLabel: string }) => void;
  embedded?: boolean;
}

interface SubjectOption {
  id: number;
  name: string;
  facultyName: string | null;
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

// Map student level to subjects department
function subjectDept(level: StudentLevel): string {
  if (level === "college") return "college";
  if (level === "senior-high") return "senior-high";
  return "junior-high";
}

export function StudentAccountForm({
  level,
  onCreated,
  embedded = false,
}: StudentAccountFormProps) {
  const gradeOptions = getGradesForLevel(level);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [grade, setGrade] = useState(gradeOptions[0] ?? "");
  const [yearLevel, setYearLevel] = useState<(typeof COLLEGE_YEAR_LEVELS)[number]>(
    COLLEGE_YEAR_LEVELS[0],
  );
  const [section, setSection] = useState("");
  const [strand, setStrand] = useState<(typeof SENIOR_HIGH_STRANDS)[number]>(
    SENIOR_HIGH_STRANDS[0],
  );
  const [course, setCourse] = useState<(typeof COLLEGE_COURSES)[number]>(
    COLLEGE_COURSES[0],
  );
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Load subjects with assigned teachers for this student level
  useEffect(() => {
    fetch(`/api/subjects?department=${subjectDept(level)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { subjects?: Array<{ id: number; name: string; facultyName: string | null }> }) => {
        // Only show subjects that have an assigned teacher
        const withTeacher = (d.subjects ?? []).filter((s) => !!s.facultyName);
        setSubjectOptions(withTeacher);
      })
      .catch(() => setSubjectOptions([]));
  }, [level]);

  const createLabel =
    STUDENT_LEVEL_OPTIONS.find((option) => option.id === level)?.createLabel ??
    "Create Student";

  function resetForm() {
    setFirstName("");
    setLastName("");
    setUsername("");
    setEmail("");
    setGrade(gradeOptions[0] ?? "");
    setYearLevel(COLLEGE_YEAR_LEVELS[0]);
    setSection("");
    setStrand(SENIOR_HIGH_STRANDS[0]);
    setCourse(COLLEGE_COURSES[0]);
    setSubjects([]);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !section) {
      setError("Student ID, name, email, and section are required.");
      return;
    }

    if (level === "college" && !yearLevel) {
      setError("Year level is required for college students.");
      return;
    }

    if (level !== "college" && !grade) {
      setError("Grade is required for this student level.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: username.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          student_level: level,
          grade: level === "college" ? null : grade,
          year_level: level === "college" ? yearLevel : null,
          section,
          strand: level === "senior-high" ? strand : null,
          course: level === "college" ? course : null,
          subjects: subjects.length > 0 ? subjects : null,
        }),
      });

      const data = (await res.json()) as { success?: boolean; message?: string; generatedPassword?: string; student?: { first_name: string; last_name: string; student_id: string } };

      if (!res.ok || !data.success) {
        setError(data.message ?? "Failed to create student.");
        return;
      }

      // Pass generated password up so it shows in the panel-level modal
      resetForm();
      onCreated({
        title: "Student Account Created!",
        name: `${firstName.trim()} ${lastName.trim()}`,
        loginId: username.trim(),
        password: data.generatedPassword ?? "",
        loginLabel: "Student ID",
      });
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
    <form
      onSubmit={handleSubmit}
      className={
        embedded
          ? ""
          : "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      }
    >
      {!embedded ? (
        <h2 className="text-lg font-semibold text-slate-900">{createLabel}</h2>
      ) : null}

      <div className={embedded ? "grid gap-4 sm:grid-cols-2" : "mt-5 grid gap-4 sm:grid-cols-2"}>
        <div className="space-y-2 sm:col-span-2">
          <label
            htmlFor="student-id"
            className="block text-sm font-medium text-slate-700"
          >
            Student ID
          </label>
          <input
            id="student-id"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="e.g. 2024-00123"
            className={inputClassName}
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="student-first-name"
            className="block text-sm font-medium text-slate-700"
          >
            First Name
          </label>
          <input
            id="student-first-name"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="e.g. Juan"
            className={inputClassName}
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="student-last-name"
            className="block text-sm font-medium text-slate-700"
          >
            Last Name
          </label>
          <input
            id="student-last-name"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="e.g. Dela Cruz"
            className={inputClassName}
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label
            htmlFor="student-email"
            className="block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            id="student-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="e.g. juan.delacruz@school.edu"
            className={inputClassName}
            required
          />
        </div>

        {level === "college" ? (
          <>
            <div className="space-y-2">
              <label
                htmlFor="student-year-level"
                className="block text-sm font-medium text-slate-700"
              >
                Year Level
              </label>
              <select
                id="student-year-level"
                value={yearLevel}
                onChange={(event) =>
                  setYearLevel(
                    event.target.value as (typeof COLLEGE_YEAR_LEVELS)[number],
                  )
                }
                className={inputClassName}
                required
              >
                {COLLEGE_YEAR_LEVELS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="student-course"
                className="block text-sm font-medium text-slate-700"
              >
                Course
              </label>
              <select
                id="student-course"
                value={course}
                onChange={(event) =>
                  setCourse(event.target.value as (typeof COLLEGE_COURSES)[number])
                }
                className={inputClassName}
                required
              >
                {COLLEGE_COURSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <label
              htmlFor="student-grade"
              className="block text-sm font-medium text-slate-700"
            >
              Grade
            </label>
            <select
              id="student-grade"
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
              className={inputClassName}
              required
            >
              {gradeOptions.map((option) => (
                <option key={option} value={option}>
                  Grade {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {level === "senior-high" ? (
          <div className="space-y-2">
            <label
              htmlFor="student-strand"
              className="block text-sm font-medium text-slate-700"
            >
              Strand
            </label>
            <select
              id="student-strand"
              value={strand}
              onChange={(event) =>
                setStrand(event.target.value as (typeof SENIOR_HIGH_STRANDS)[number])
              }
              className={inputClassName}
              required
            >
              {SENIOR_HIGH_STRANDS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="student-section"
            className="block text-sm font-medium text-slate-700"
          >
            Section
          </label>
          <input
            id="student-section"
            type="text"
            value={section}
            onChange={(event) => setSection(event.target.value)}
            placeholder="e.g. A, B, Rizal, Bonifacio"
            className={inputClassName}
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Subjects
          </label>
          {subjectOptions.length === 0 ? (
            <p className="text-xs text-slate-400">
              No subjects with assigned teachers found. Add subjects in the Subjects page first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subjectOptions.map((s) => {
                const isSelected = subjects.includes(s.name);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setSubjects((prev) =>
                        prev.includes(s.name)
                          ? prev.filter((x) => x !== s.name)
                          : [...prev, s.name]
                      )
                    }
                    className={`flex flex-col rounded-xl border px-3 py-2 text-left text-xs transition ${
                      isSelected
                        ? "border-brand-500 bg-brand-700 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-semibold">{s.name}</span>
                    {s.facultyName && (
                      <span className={`mt-0.5 ${isSelected ? "text-brand-200" : "text-slate-400"}`}>
                        {s.facultyName}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {subjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {subjects.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-lg border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                  {s}
                  <button
                    type="button"
                    onClick={() => setSubjects((prev) => prev.filter((x) => x !== s))}
                    className="text-brand-400 hover:text-brand-700"
                    aria-label={`Remove ${s}`}
                  >×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 flex w-full shrink-0 items-center justify-center rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Saving..." : "Save"}
      </button>
    </form>
    </>
  );
}
