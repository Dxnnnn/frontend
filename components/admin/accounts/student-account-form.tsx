"use client";

import { useState } from "react";

import { PasswordToggle } from "@/components/auth/password-toggle";
import {
  COLLEGE_COURSES,
  COLLEGE_YEAR_LEVELS,
  SENIOR_HIGH_STRANDS,
  STUDENT_LEVEL_OPTIONS,
  STUDENT_SECTIONS,
  getGradesForLevel,
  type StudentLevel,
} from "@/lib/accounts/student-options";

interface StudentAccountFormProps {
  level: StudentLevel;
  onCreated: () => void;
  embedded?: boolean;
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

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
  const [grade, setGrade] = useState(gradeOptions[0] ?? "");
  const [yearLevel, setYearLevel] = useState<(typeof COLLEGE_YEAR_LEVELS)[number]>(
    COLLEGE_YEAR_LEVELS[0],
  );
  const [section, setSection] = useState<(typeof STUDENT_SECTIONS)[number]>(
    STUDENT_SECTIONS[0],
  );
  const [strand, setStrand] = useState<(typeof SENIOR_HIGH_STRANDS)[number]>(
    SENIOR_HIGH_STRANDS[0],
  );
  const [course, setCourse] = useState<(typeof COLLEGE_COURSES)[number]>(
    COLLEGE_COURSES[0],
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createLabel =
    STUDENT_LEVEL_OPTIONS.find((option) => option.id === level)?.createLabel ??
    "Create Student";

  function resetForm() {
    setFirstName("");
    setLastName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setGrade(gradeOptions[0] ?? "");
    setYearLevel(COLLEGE_YEAR_LEVELS[0]);
    setSection(STUDENT_SECTIONS[0]);
    setStrand(SENIOR_HIGH_STRANDS[0]);
    setCourse(COLLEGE_COURSES[0]);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !password || !section) {
      setError("Student ID, name, email, password, and section are required.");
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
          password,
          student_level: level,
          grade: level === "college" ? null : grade,
          year_level: level === "college" ? yearLevel : null,
          section,
          strand: level === "senior-high" ? strand : null,
          course: level === "college" ? course : null,
        }),
      });

      const data = (await res.json()) as { success?: boolean; message?: string };

      if (!res.ok || !data.success) {
        setError(data.message ?? "Failed to create student.");
        return;
      }

      resetForm();
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

        <div className="space-y-2 sm:col-span-2">
          <label
            htmlFor="student-password"
            className="block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="student-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              className={`${inputClassName} pr-12`}
              required
            />
            <PasswordToggle
              showPassword={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
            />
          </div>
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
          <select
            id="student-section"
            value={section}
            onChange={(event) =>
              setSection(event.target.value as (typeof STUDENT_SECTIONS)[number])
            }
            className={inputClassName}
            required
          >
            {STUDENT_SECTIONS.map((option) => (
              <option key={option} value={option}>
                Section {option}
              </option>
            ))}
          </select>
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
  );
}
