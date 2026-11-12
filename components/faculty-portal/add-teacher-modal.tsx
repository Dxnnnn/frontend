"use client";

import { useEffect, useState } from "react";

interface AddTeacherModalProps {
  /** The school head's department — locked, cannot be changed */
  department: string;
  onClose: () => void;
  onCreated: () => void;
}

// Determine quarter vs semester based on department
function isJuniorHigh(dept: string): boolean {
  const d = dept.toLowerCase();
  return d.includes("junior") || d.includes("elementary") || d.includes("elem");
}

const inputCls =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export function AddTeacherModal({ department, onClose, onCreated }: AddTeacherModalProps) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [position, setPosition] = useState("");
  const [profileImage, setProfileImage]       = useState<string | null>(null);
  const [imageUploading, setImageUploading]   = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [semester, setSemester] = useState("");
  const [dbSubjects, setDbSubjects] = useState<string[]>([]);
  const [dbSubjectObjects, setDbSubjectObjects] = useState<Array<{ id: number; name: string; grade: string | null }>>([]);
  const [dbSemesters, setDbSemesters] = useState<string[]>([]);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const isJH = isJuniorHigh(department);

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  // Load subjects from DB for this department — fetch full objects with IDs and grade
  useEffect(() => {
    const deptKey = isJH ? "junior-high"
      : department.toLowerCase().includes("senior") ? "senior-high"
      : "college";

    fetch(`/api/subjects?department=${encodeURIComponent(deptKey)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { subjects?: Array<{ id: number; name: string; grade?: string | null }> }) => {
        // Build unique display labels: "Math (Grade 7)", "Math (Grade 9)"
        // Key = display label, so duplicates across same name+grade collapse but different grades stay separate
        const seen = new Set<string>();
        const unique = (d.subjects ?? [])
          .map((s) => ({ id: s.id, name: s.name, grade: s.grade ?? null }))
          .filter((s) => {
            const label = s.grade ? `${s.name} (Grade ${s.grade})` : s.name;
            if (seen.has(label)) return false;
            seen.add(label);
            return true;
          })
          .sort((a, b) => {
            const la = a.grade ? `${a.name} ${a.grade}` : a.name;
            const lb = b.grade ? `${b.name} ${b.grade}` : b.name;
            return la.localeCompare(lb);
          });
        setDbSubjectObjects(unique);
        setDbSubjects(unique.map((s) => s.grade ? `${s.name} (Grade ${s.grade})` : s.name));
      })
      .catch(() => { setDbSubjectObjects([]); setDbSubjects([]); });
  }, [department, isJH]);

  // Load active semesters / quarters from DB
  useEffect(() => {
    fetch("/api/semesters/active", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { semesters?: Array<{ schoolYear: string; term: string }> }) => {
        const options = (d.semesters ?? [])
          .map((s) => `SY-${s.schoolYear} ${s.term}`)
          .filter((label) => {
            if (isJH) {
              // Only show combined quarters for teacher assignment
              // Individual quarters (Q1, Q2, Q3, Q4) are for school head evaluation tracking only
              return label.includes("Quarter 1 & 2") || label.includes("Quarter 3 & 4");
            }
            return !label.includes("Quarter");
          });
        setDbSemesters(options);
        if (options.length > 0) setSemester(options[0]);
      })
      .catch(() => {
        // Fallback options if DB is empty
        const fallback = isJH
          ? ["Quarter 1 & 2", "Quarter 3 & 4"]
          : ["1st Semester", "2nd Semester"];
        setDbSemesters(fallback);
        setSemester(fallback[0]);
      });
  }, [isJH]);

  function removeSubject(s: string) {
    setSubjects((prev) => prev.filter((x) => x !== s));
  }

  function pickDbSubject(s: string) {
    if (!subjects.includes(s)) setSubjects((prev) => [...prev, s]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Full name is required."); return; }
    if (subjects.length === 0) { setError("At least one subject is required."); return; }

    setSaving(true);
    try {
      // Step 1 — Create the faculty record (store plain subject names, not grade-labelled ones)
      const plainSubjectNames = subjects.map((label) => {
        // Strip " (Grade X)" suffix added for display — store just the subject name
        const obj = dbSubjectObjects.find((s) =>
          (s.grade ? `${s.name} (Grade ${s.grade})` : s.name) === label
        );
        return obj ? obj.name : label.replace(/\s*\(Grade [^)]+\)$/, "").trim();
      });

      const res = await fetch("/api/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          position: position.trim() || null,
          department: department,
          subjects: plainSubjectNames,
          semester: semester || null,
          profile_image: profileImage ?? null,
        }),
      });
      const data = await res.json() as { success?: boolean; message?: string; faculty?: { id: number; name: string } };
      if (!res.ok || !data.success) {
        setError(data.message ?? "Failed to add teacher.");
        return;
      }

      // Step 2 — Assign the faculty to each matching subject row in the subjects table
      const newFacultyId   = data.faculty?.id;
      const newFacultyName = data.faculty?.name ?? name.trim();

      if (newFacultyId) {
        const deptKey = isJH ? "junior-high"
          : department.toLowerCase().includes("senior") ? "senior-high"
          : "college";

        // Use by-name endpoint — updates ALL rows with that subject name in this department
        // This handles cases where the same subject appears across multiple grade levels
        await Promise.allSettled(
          plainSubjectNames.map((subjectName) =>
            fetch("/api/subjects/assign-teacher-by-name", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subjectName,
                facultyId: newFacultyId,
                facultyName: newFacultyName,
                department: deptKey,
              }),
            })
          )
        );
      }

      onCreated();
      onClose();
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-label="Close" />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add Teacher</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Fill in the teacher details below, then save the record.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 mt-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">

            {/* Profile Photo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Profile Photo</label>
              <div className="flex items-center gap-5">
                {profileImage ? (
                  <img src={profileImage} alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-2 border-slate-200 shadow-sm shrink-0" />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                    <input type="file" accept="image/*" className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setImageUploading(true);
                        try {
                          const formData = new FormData();
                          formData.append("file", file);
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/image`, { method: "POST", body: formData });
                          const data = await res.json() as { success?: boolean; url?: string; message?: string };
                          if (data.success && data.url) setProfileImage(data.url);
                          else setError(data.message ?? "Failed to upload image.");
                        } catch { setError("Failed to upload image."); }
                        finally { setImageUploading(false); }
                      }}
                    />
                    {imageUploading ? "Uploading…" : "Upload Photo"}
                  </label>
                  {profileImage && (
                    <button type="button" onClick={() => setProfileImage(null)}
                      className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name — full width */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Maria Santos" className={inputCls} required />
            </div>

            {/* Email + Position — side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. m.santos@bc.edu.ph" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Position</label>
                <input type="text" value={position} onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Professor, Instructor" className={inputCls} />
              </div>
            </div>

            {/* Department — read-only */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Department</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12 12 0 0120 17.5C20 19 16.42 21 12 21S4 19 4 17.5c0-1.12.52-2.76 1.84-3.922L12 14z"/>
                </svg>
                <span className="text-sm text-slate-700 truncate">{department}</span>
                <span className="ml-auto shrink-0 text-[11px] text-slate-400">Auto-assigned</span>
              </div>
            </div>

            {/* Quarter / Semester */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                {isJH ? "Quarter" : "Semester"} <span className="text-red-500">*</span>
              </label>
              {dbSemesters.length > 0 ? (
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className={inputCls} required>
                  {dbSemesters.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <p className="text-xs text-slate-400 italic border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50">
                  No active {isJH ? "quarters" : "semesters"} found. Ask the admin to set one up.
                </p>
              )}
            </div>

            {/* Subjects */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Subjects <span className="text-red-500">*</span>
              </label>
              {subjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {subjects.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white shadow-sm">
                      {s}
                      <button type="button" onClick={() => removeSubject(s)} className="rounded-full text-brand-200 hover:text-white">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {dbSubjects.length > 0 ? (
                <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Select subjects:</p>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {dbSubjects.map((s) => (
                      <button
                        key={s} type="button" onClick={() => pickDbSubject(s)} disabled={subjects.includes(s)}
                        className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                          subjects.includes(s)
                            ? "border-brand-600 bg-brand-700 text-white cursor-default shadow-sm"
                            : "border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50"
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                  <p className="text-sm text-slate-400">No subjects found for this department.</p>
                  <p className="text-xs text-slate-400 mt-0.5">Ask the admin to add subjects first.</p>
                </div>
              )}
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            {/* Save button — full width like the reference */}
            <button type="submit" disabled={saving}
              className="w-full rounded-xl bg-brand-700 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-70">
              {saving ? "Adding…" : "Add Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
