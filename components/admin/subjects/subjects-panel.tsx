"use client";

import { useEffect, useState, useCallback } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"] as const;
const COURSES = ["BSIT", "BSCS", "BSHM", "BSBA", "BSED", "BSCRIM", "BSN", "BSECE"] as const;
const GRADES_JH = ["7", "8", "9", "10"] as const;
const GRADES_SHS = ["11", "12"] as const;
const STRANDS = ["STEM", "HUMSS", "ABM", "GAS", "TVL", "ICT", "HE", "IA"] as const;

type Department = "junior-high" | "senior-high" | "college";

const DEPT_LABELS: Record<Department, string> = {
  "junior-high": "Junior High School",
  "senior-high": "Senior High School",
  "college": "College",
};

const DEPT_FACULTY_FILTER: Record<Department, string> = {
  "junior-high": "Elementary-Junior High School",
  "senior-high": "Senior High School",
  "college": "College",
};

interface Subject {
  id: number;
  name: string;
  department: Department;
  yearLevel: string | null;
  course: string | null;
  grade: string | null;
  strand: string | null;
  section: string | null;
  roomNo: string | null;
  scheduleDay: string | null;
  scheduleTime: string | null;
  facultyId: number | null;
  facultyName: string | null;
  createdAt: string;
}

interface FacultyOption {
  id: number;
  name: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toggleArr(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

const inputCls = "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

// ── Multi-select chips ────────────────────────────────────────────────────────
function MultiChips({
  label,
  options,
  selected,
  onToggle,
  formatLabel,
  required,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
  formatLabel?: (v: string) => string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              selected.includes(opt)
                ? "border-brand-500 bg-brand-700 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            {formatLabel ? formatLabel(opt) : opt}
          </button>
        ))}
      </div>
      {selected.length === 0 && <p className="text-xs text-slate-400">Select at least one option.</p>}
    </div>
  );
}

// ── Tag chips display ─────────────────────────────────────────────────────────
function Tags({ value, color = "slate" }: { value: string | null; color?: string }) {
  if (!value) return <span className="text-slate-400 italic text-xs">—</span>;
  const items = value.split(",").map((v) => v.trim()).filter(Boolean);
  const cls: Record<string, string> = {
    brand: "bg-brand-50 border-brand-100 text-brand-700",
    violet: "bg-violet-50 border-violet-100 text-violet-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    slate: "bg-slate-100 border-slate-200 text-slate-700",
  };
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span key={item} className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls[color] ?? cls.slate}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

// ── Section Picker ────────────────────────────────────────────────────────────
function SectionPicker({
  sections,
  selected,
  loading,
  onToggle,
  emptyMsg,
  required,
}: {
  sections: string[];
  selected: string[];
  loading: boolean;
  onToggle: (s: string) => void;
  emptyMsg: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="block text-sm font-medium text-slate-700">
        Section{" "}
        {required ? (
          <span className="text-red-500">*</span>
        ) : (
          <span className="text-xs font-normal text-slate-400">(optional)</span>
        )}
        {selected.length > 0 && (
          <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
            {selected.length} selected
          </span>
        )}
      </p>
      {loading ? (
        <p className="text-xs text-slate-400">Loading sections…</p>
      ) : sections.length === 0 ? (
        <p className="text-xs text-slate-400 italic">{emptyMsg}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onToggle(s)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                selected.includes(s)
                  ? "border-brand-500 bg-brand-700 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Create / Edit Modal ───────────────────────────────────────────────────────
function SubjectModal({
  subject,
  activeDept,
  onClose,
  onSaved,
}: {
  subject?: Subject;
  activeDept: Department;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!subject;
  const dept = subject?.department ?? activeDept;

  const [name, setName] = useState(subject?.name ?? "");
  const [yearLevel, setYearLevel] = useState(subject?.yearLevel ?? "1st Year");
  const [courses, setCourses] = useState<string[]>(
    subject?.course ? subject.course.split(",").map((v) => v.trim()).filter(Boolean) : []
  );
  const [grades, setGrades] = useState<string[]>(
    subject?.grade ? subject.grade.split(",").map((v) => v.trim()).filter(Boolean) : []
  );
  const [strands, setStrands] = useState<string[]>(
    subject?.strand ? subject.strand.split(",").map((v) => v.trim()).filter(Boolean) : []
  );
  const [facultyId, setFacultyId] = useState<number | null>(subject?.facultyId ?? null);
  const [facultyName, setFacultyName] = useState(subject?.facultyName ?? "");
  const [faculty, setFaculty] = useState<FacultyOption[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>(
    subject?.section ? subject.section.split(",").map((s) => s.trim()).filter(Boolean) : []
  );
  const [loadingSections, setLoadingSections] = useState(false);
  // Room & schedule — college only
  const [roomNo, setRoomNo] = useState(subject?.roomNo ?? "");
  const [scheduleDay, setScheduleDay] = useState(subject?.scheduleDay ?? "");
  const [scheduleTime, setScheduleTime] = useState(subject?.scheduleTime ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/faculty?department=${encodeURIComponent(DEPT_FACULTY_FILTER[dept])}&include_empty_subjects=1`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { faculty?: Array<{ id: number; name: string }> }) => setFaculty(d.faculty ?? []))
      .catch(() => setFaculty([]));
  }, [dept]);

  // Fetch available sections from students matching selected grade/year level
  useEffect(() => {
    const fetchSections = async () => {
      setLoadingSections(true);
      try {
        const allSections = new Set<string>();

        if (dept === "junior-high" && grades.length > 0) {
          // Fetch sections for each selected grade
          await Promise.all(
            grades.map(async (g) => {
              const res = await fetch(`/api/students?student_level=junior-high&grade=${g}`, { cache: "no-store" });
              const data = await res.json() as { students?: Array<{ section: string | null }> };
              (data.students ?? []).forEach((s) => {
                if (s.section?.trim()) allSections.add(s.section.trim());
              });
            })
          );
        } else if (dept === "senior-high" && grades.length > 0) {
          await Promise.all(
            grades.map(async (g) => {
              const res = await fetch(`/api/students?student_level=senior-high&grade=${g}`, { cache: "no-store" });
              const data = await res.json() as { students?: Array<{ section: string | null }> };
              (data.students ?? []).forEach((s) => {
                if (s.section?.trim()) allSections.add(s.section.trim());
              });
            })
          );
        } else if (dept === "college") {
          const params = new URLSearchParams({ student_level: "college" });
          if (yearLevel) params.set("year_level", yearLevel);
          if (courses.length === 1) params.set("course", courses[0]);
          const res = await fetch(`/api/students?${params}`, { cache: "no-store" });
          const data = await res.json() as { students?: Array<{ section: string | null }> };
          (data.students ?? []).forEach((s) => {
            if (s.section?.trim()) allSections.add(s.section.trim());
          });
        }

        const sorted = [...allSections].sort();
        setAvailableSections(sorted);
        // Remove any selected sections that no longer exist for the new grade
        setSelectedSections((prev) => prev.filter((s) => sorted.includes(s)));
      } catch {
        setAvailableSections([]);
      } finally {
        setLoadingSections(false);
      }
    };

    void fetchSections();
  }, [dept, grades, yearLevel, courses]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Subject name is required."); return; }
    if (dept === "college" && courses.length === 0) { setError("Select at least one course."); return; }
    if (dept === "college" && selectedSections.length === 0) { setError("Section is required for college subjects."); return; }
    if (dept === "college" && !roomNo.trim()) { setError("Room No. is required for college subjects."); return; }
    if (dept === "college" && !scheduleDay.trim()) { setError("Schedule Day is required for college subjects."); return; }
    if (dept === "college" && !scheduleTime.trim()) { setError("Schedule Time is required for college subjects."); return; }
    if ((dept === "junior-high" || dept === "senior-high") && grades.length === 0) { setError("Select at least one grade."); return; }
    if (dept === "senior-high" && strands.length === 0) { setError("Select at least one strand."); return; }

    setSaving(true);
    try {
      const url = isEdit ? `/api/subjects/${subject!.id}` : "/api/subjects";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          department: dept,
          yearLevel: dept === "college" ? yearLevel : null,
          course: dept === "college" ? courses.join(",") : null,
          grade: dept !== "college" ? grades.join(",") : null,
          strand: dept === "senior-high" ? strands.join(",") : null,
          section: selectedSections.length > 0 ? selectedSections.join(",") : null,
          roomNo: dept === "college" ? (roomNo.trim() || null) : null,
          scheduleDay: dept === "college" ? (scheduleDay.trim() || null) : null,
          scheduleTime: dept === "college" ? (scheduleTime.trim() || null) : null,
          facultyId,
          facultyName: facultyName || null,
        }),
      });
      const data = await res.json() as { success?: boolean; message?: string };
      if (!res.ok || !data.success) { setError(data.message ?? "Failed to save subject."); return; }
      
      onSaved();
      onClose();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{isEdit ? "Edit Subject" : "Create Subject"}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{DEPT_LABELS[dept]}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Subject Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mathematics, English" className={inputCls} required />
          </div>

          {/* College fields */}
          {dept === "college" && (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Year Level <span className="text-red-500">*</span></label>
                <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} className={inputCls}>
                  {YEAR_LEVELS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <MultiChips label="Course" options={COURSES} selected={courses}
                onToggle={(v) => setCourses((prev) => toggleArr(prev, v))} required />
              <SectionPicker
                sections={availableSections}
                selected={selectedSections}
                loading={loadingSections}
                onToggle={(s) => setSelectedSections((prev) => toggleArr(prev, s))}
                emptyMsg="No sections found for this year level / course."
                required
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Room No. <span className="text-red-500">*</span></label>
                <input type="text" value={roomNo} onChange={(e) => setRoomNo(e.target.value)}
                  placeholder="e.g. Room 301, Lab 2" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Schedule Day <span className="text-red-500">*</span></label>
                  <input type="text" value={scheduleDay} onChange={(e) => setScheduleDay(e.target.value)}
                    placeholder="e.g. MWF, TTh" className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Schedule Time <span className="text-red-500">*</span></label>
                  <input type="text" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)}
                    placeholder="e.g. 8:00–9:30 AM" className={inputCls} />
                </div>
              </div>
            </>
          )}

          {/* SHS fields */}
          {dept === "senior-high" && (
            <>
              <MultiChips label="Grade" options={GRADES_SHS} selected={grades}
                onToggle={(v) => setGrades((prev) => toggleArr(prev, v))}
                formatLabel={(v) => `Grade ${v}`} required />
              <MultiChips label="Strand" options={STRANDS} selected={strands}
                onToggle={(v) => setStrands((prev) => toggleArr(prev, v))} required />
              <SectionPicker
                sections={availableSections}
                selected={selectedSections}
                loading={loadingSections}
                onToggle={(s) => setSelectedSections((prev) => toggleArr(prev, s))}
                emptyMsg="No sections found for the selected grade(s)."
              />
            </>
          )}

          {/* JHS fields */}
          {dept === "junior-high" && (
            <>
              <MultiChips label="Grade" options={GRADES_JH} selected={grades}
                onToggle={(v) => setGrades((prev) => toggleArr(prev, v))}
                formatLabel={(v) => `Grade ${v}`} required />
              <SectionPicker
                sections={availableSections}
                selected={selectedSections}
                loading={loadingSections}
                onToggle={(s) => setSelectedSections((prev) => toggleArr(prev, s))}
                emptyMsg="No sections found for the selected grade(s)."
              />
            </>
          )}

          {/* Assign Teacher */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Assign Teacher</label>
            <select value={facultyId ?? ""} onChange={(e) => {
              const sel = faculty.find((f) => f.id === Number(e.target.value));
              setFacultyId(sel ? sel.id : null);
              setFacultyName(sel ? sel.name : "");
            }} className={inputCls}>
              <option value="">— No teacher assigned —</option>
              {faculty.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            {faculty.length === 0 && (
              <p className="text-xs text-slate-400">No {DEPT_LABELS[dept]} faculty found.</p>
            )}
          </div>

          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-xl bg-brand-700 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70">
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export function SubjectsPanel() {
  const [activeDept, setActiveDept] = useState<Department>("junior-high");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterStrand, setFilterStrand] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Subject | null>(null);

  const loadSubjects = useCallback(() => {
    setLoading(true);
    fetch(`/api/subjects?department=${activeDept}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { success?: boolean; subjects?: Subject[] }) => {
        setSubjects(d.subjects ?? []);
        setError("");
      })
      .catch(() => setError("Failed to load subjects."))
      .finally(() => setLoading(false));
  }, [activeDept]);

  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete subject "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
    if (res.ok) setSubjects((prev) => prev.filter((s) => s.id !== id));
    else window.alert("Failed to delete subject.");
  }

  const filtered = subjects.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.name.toLowerCase().includes(q) ||
      (s.facultyName ?? "").toLowerCase().includes(q) ||
      (s.course ?? "").toLowerCase().includes(q) ||
      (s.grade ?? "").toLowerCase().includes(q) ||
      (s.strand ?? "").toLowerCase().includes(q) ||
      (s.yearLevel ?? "").toLowerCase().includes(q);
    const matchCourse = !filterCourse ||
      (s.course ?? "").split(",").map((c) => c.trim()).includes(filterCourse);
    const matchStrand = !filterStrand ||
      (s.strand ?? "").split(",").map((v) => v.trim()).includes(filterStrand);
    return matchSearch && matchCourse && matchStrand;
  });

  // Table columns per department
  const extraCols = activeDept === "college"
    ? ["Year Level", "Course", "Section", "Room No.", "Schedule"]
    : activeDept === "senior-high"
    ? ["Grade", "Strand", "Section"]
    : ["Grade", "Section"];

  return (
    <>
      {createOpen && (
        <SubjectModal activeDept={activeDept} onClose={() => setCreateOpen(false)} onSaved={loadSubjects} />
      )}
      {editTarget && (
        <SubjectModal subject={editTarget} activeDept={activeDept} onClose={() => setEditTarget(null)} onSaved={loadSubjects} />
      )}

      <section className="space-y-5">
        {/* Department Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["junior-high", "senior-high", "college"] as Department[]).map((dept) => (
            <button key={dept} type="button"
              onClick={() => { setActiveDept(dept); setSearch(""); setFilterCourse(""); setFilterStrand(""); }}
              className={`rounded-2xl border px-5 py-2.5 text-sm font-semibold transition ${
                activeDept === dept
                  ? "border-brand-500 bg-brand-700 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-slate-50"
              }`}>
              {DEPT_LABELS[dept]}
            </button>
          ))}
        </div>

        {/* Toolbar + Table card */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Subject list</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {filtered.length} of {subjects.length} subject{subjects.length === 1 ? "" : "s"} · {DEPT_LABELS[activeDept]}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                </svg>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search subject or teacher..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 sm:w-48" />
              </div>

              {/* Course filter — College only, shows only used courses */}
              {activeDept === "college" && (
                <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
                  <option value="">All Courses</option>
                  {[...new Set(
                    subjects.flatMap((s) =>
                      (s.course ?? "").split(",").map((c) => c.trim()).filter(Boolean)
                    )
                  )].sort().map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}

              {/* Strand filter — SHS only, shows only used strands */}
              {activeDept === "senior-high" && (
                <select value={filterStrand} onChange={(e) => setFilterStrand(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
                  <option value="">All Strands</option>
                  {[...new Set(
                    subjects.flatMap((s) =>
                      (s.strand ?? "").split(",").map((v) => v.trim()).filter(Boolean)
                    )
                  )].sort().map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              )}

              {/* Create button */}
              <button type="button" onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
                Create Subject
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">Loading...</div>
          ) : error ? (
            <div className="px-6 py-12 text-center text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-600">
                {subjects.length === 0 ? `No ${DEPT_LABELS[activeDept]} subjects yet` : "No results found"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {subjects.length === 0 ? `Click "Create Subject" to add the first one.` : "Try adjusting your search or filter."}
              </p>
            </div>
          ) : (
            <div className="min-h-0 max-h-[480px] overflow-y-auto overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5 font-medium">Subject Name</th>
                    {extraCols.map((col) => <th key={col} className="px-6 py-3.5 font-medium">{col}</th>)}
                    <th className="px-6 py-3.5 font-medium">Assigned Teacher</th>
                    <th className="px-6 py-3.5 font-medium">Added</th>
                    <th className="px-6 py-3.5 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s) => (
                    <tr key={s.id} className="text-slate-700 hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{s.name}</td>

                      {/* College */}
                      {activeDept === "college" && (
                        <>
                          <td className="px-6 py-4">
                            <span className="inline-block rounded-full bg-brand-50 border border-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                              {s.yearLevel ?? "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4"><Tags value={s.course} color="slate" /></td>
                          <td className="px-6 py-4"><Tags value={s.section} color="brand" /></td>
                          <td className="px-6 py-4">
                            {s.roomNo ? (
                              <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{s.roomNo}</span>
                            ) : <span className="text-xs text-slate-400">—</span>}
                          </td>
                          <td className="px-6 py-4">
                            {s.scheduleDay || s.scheduleTime ? (
                              <div className="flex flex-col gap-0.5">
                                {s.scheduleDay && <span className="text-xs font-semibold text-slate-700">{s.scheduleDay}</span>}
                                {s.scheduleTime && <span className="text-xs text-slate-500">{s.scheduleTime}</span>}
                              </div>
                            ) : <span className="text-xs text-slate-400">—</span>}
                          </td>
                        </>
                      )}

                      {/* SHS */}
                      {activeDept === "senior-high" && (
                        <>
                          <td className="px-6 py-4">
                            <Tags value={s.grade ? s.grade.split(",").map((g) => `Grade ${g.trim()}`).join(",") : null} color="brand" />
                          </td>
                          <td className="px-6 py-4"><Tags value={s.strand} color="violet" /></td>
                          <td className="px-6 py-4"><Tags value={s.section} color="brand" /></td>
                        </>
                      )}

                      {/* JHS */}
                      {activeDept === "junior-high" && (
                        <>
                          <td className="px-6 py-4">
                            <Tags value={s.grade ? s.grade.split(",").map((g) => `Grade ${g.trim()}`).join(",") : null} color="emerald" />
                          </td>
                          <td className="px-6 py-4"><Tags value={s.section} color="emerald" /></td>
                        </>
                      )}

                      <td className="px-6 py-4">
                        {s.facultyName ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                              {s.facultyName.charAt(0).toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-slate-800">{s.facultyName}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(s.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setEditTarget(s)}
                            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDelete(s.id, s.name)}
                            className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
