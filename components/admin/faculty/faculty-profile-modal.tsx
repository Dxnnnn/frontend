"use client";

import { useEffect } from "react";

export interface FacultyProfileData {
  name: string;
  email?: string | null;
  position?: string | null;
  department: string;
  subjects: string[] | string;
  semester?: string | null;
  profile_image?: string | null;
}

interface FacultyProfileModalProps {
  faculty: FacultyProfileData;
  onClose: () => void;
}

function displayDepartment(dept: string): string {
  return dept.replace(/Elementary[-–]Junior High School/gi, "Junior High School");
}

function parseSubjects(subjects: string[] | string): string[] {
  if (Array.isArray(subjects)) return subjects.filter(Boolean);
  return subjects ? subjects.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

export function FacultyProfileModal({ faculty, onClose }: FacultyProfileModalProps) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const subjectList = parseSubjects(faculty.subjects);
  const dept = displayDepartment(faculty.department);
  const initials = faculty.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close profile"
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header band */}
        <div className="h-24 bg-gradient-to-br from-brand-700 to-brand-500" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/20 p-1.5 text-white backdrop-blur-sm transition hover:bg-white/40"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* Avatar — overlaps the header band */}
        <div className="flex flex-col items-center px-6 pb-6">
          <div className="-mt-14 mb-4">
            {faculty.profile_image ? (
              <img
                src={faculty.profile_image}
                alt={faculty.name}
                className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-brand-100 shadow-lg">
                <span className="text-3xl font-bold text-brand-700">{initials}</span>
              </div>
            )}
          </div>

          {/* Name + position */}
          <h2 className="text-xl font-bold text-slate-900 text-center">{faculty.name}</h2>
          {faculty.position && (
            <p className="mt-0.5 text-sm font-medium text-brand-600">{faculty.position}</p>
          )}

          {/* Divider */}
          <div className="my-4 h-px w-full bg-slate-100" />

          {/* Info rows */}
          <dl className="w-full space-y-3 text-sm">
            {faculty.email && (
              <div className="flex items-start gap-3">
                <dt className="shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4 mt-0.5 text-slate-400" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
                  </svg>
                </dt>
                <dd className="text-slate-700 break-all">{faculty.email}</dd>
              </div>
            )}

            <div className="flex items-start gap-3">
              <dt className="shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4 mt-0.5 text-slate-400" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </dt>
              <dd className="text-slate-700">{dept}</dd>
            </div>

            {subjectList.length > 0 && (
              <div className="flex items-start gap-3">
                <dt className="shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4 mt-0.5 text-slate-400" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </dt>
                <dd>
                  <div className="flex flex-wrap gap-1.5">
                    {subjectList.map((s) => (
                      <span key={s} className="rounded-lg bg-brand-50 border border-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
            )}

            {faculty.semester && (
              <div className="flex items-start gap-3">
                <dt className="shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4 mt-0.5 text-slate-400" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </dt>
                <dd>
                  <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    {faculty.semester}
                  </span>
                </dd>
              </div>
            )}
          </dl>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-brand-700 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
