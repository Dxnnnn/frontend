"use client";

import { useEffect, useState } from "react";

import {
  formatStudentDetails,
  getStudentLevelLabel,
  COLLEGE_COURSES,
  COLLEGE_YEAR_LEVELS,
  SENIOR_HIGH_STRANDS,
  STUDENT_SECTIONS,
  getGradesForLevel,
} from "@/lib/accounts/student-options";
import type { AccountRole } from "@/lib/types/account";

interface AccountsListProps {
  role: AccountRole;
  refreshKey: number;
}

interface SchoolHead {
  id: number;
  id_number: string;
  full_name: string;
  department: string;
  is_active: number;
  created_at: string;
}

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_level: string;
  grade: string | null;
  year_level: string | null;
  section: string | null;
  strand: string | null;
  course: string | null;
  is_active: number;
  created_at: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
      active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
      <p className="text-sm text-red-600">{message}</p>
    </div>
  );
}

function EmptyState({ label, filtered }: { label: string; filtered: boolean }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm font-medium text-slate-600">
        {filtered ? "No results found" : `No ${label} accounts yet`}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {filtered ? "Try adjusting your search." : `Add your first ${label} account using the form.`}
      </p>
    </div>
  );
}

// ── Edit modal for School Head ────────────────────────────────────────────────
function EditSchoolHeadModal({
  schoolHead,
  onClose,
  onSaved,
}: {
  schoolHead: SchoolHead;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [idNumber, setIdNumber] = useState(schoolHead.id_number);
  const [fullName, setFullName] = useState(schoolHead.full_name);
  const [department, setDepartment] = useState(schoolHead.department);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!idNumber.trim() || !fullName.trim() || !department.trim()) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/school-heads/${schoolHead.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_number: idNumber, full_name: fullName, department }),
    });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); }
    else {
      const data = await res.json() as { message?: string };
      setError(data.message ?? "Failed to update.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="mb-4 text-base font-semibold text-slate-900">Edit School Head</h3>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">ID#</label>
            <input value={idNumber} onChange={e => setIdNumber(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              required
            >
              <option value="">Select department...</option>
              <option value="Elementary-Junior High School">Elementary-Junior High School</option>
              <option value="Senior High School">Senior High School</option>
              <option value="College">College</option>
            </select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-brand-700 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70">{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit modal for Student ────────────────────────────────────────────────────
function EditStudentModal({
  student,
  onClose,
  onSaved,
}: {
  student: Student;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [studentId, setStudentId] = useState(student.student_id);
  const [firstName, setFirstName] = useState(student.first_name);
  const [lastName, setLastName] = useState(student.last_name);
  const [email, setEmail] = useState(student.email);
  const [level] = useState(student.student_level);
  const [grade, setGrade] = useState(student.grade ?? "");
  const [yearLevel, setYearLevel] = useState(student.year_level ?? COLLEGE_YEAR_LEVELS[0]);
  const [section, setSection] = useState(student.section ?? STUDENT_SECTIONS[0]);
  const [strand, setStrand] = useState(student.strand ?? SENIOR_HIGH_STRANDS[0]);
  const [course, setCourse] = useState(student.course ?? COLLEGE_COURSES[0]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const gradeOptions = getGradesForLevel(level as Parameters<typeof getGradesForLevel>[0]);
  const isCollege = level === "college";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId.trim() || !firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("ID, name, and email are required.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/students/${student.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: studentId,
        first_name: firstName, last_name: lastName, email,
        student_level: level,
        grade: isCollege ? null : grade,
        year_level: isCollege ? yearLevel : null,
        section, strand: level === "senior-high" ? strand : null,
        course: isCollege ? course : null,
      }),
    });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); }
    else setError("Failed to update.");
  }

  const inputCls = "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="mb-4 text-base font-semibold text-slate-900">Edit Student</h3>
        <form onSubmit={handleSave} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Student ID</label>
            <input value={studentId} onChange={e => setStudentId(e.target.value)} className={inputCls} placeholder="e.g. 2024-00123" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">First Name</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Last Name</label>
            <input value={lastName} onChange={e => setLastName(e.target.value)} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
          </div>
          {isCollege ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Year Level</label>
                <select value={yearLevel} onChange={e => setYearLevel(e.target.value)} className={inputCls}>
                  {COLLEGE_YEAR_LEVELS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Course</label>
                <select value={course} onChange={e => setCourse(e.target.value)} className={inputCls}>
                  {COLLEGE_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Grade</label>
              <select value={grade} onChange={e => setGrade(e.target.value)} className={inputCls}>
                {gradeOptions.map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
          )}
          {level === "senior-high" && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Strand</label>
              <select value={strand} onChange={e => setStrand(e.target.value)} className={inputCls}>
                {SENIOR_HIGH_STRANDS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Section</label>
            <select value={section} onChange={e => setSection(e.target.value)} className={inputCls}>
              {STUDENT_SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
          {error && <p className="sm:col-span-2 text-xs text-red-600">{error}</p>}
          <div className="sm:col-span-2 flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-brand-700 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70">{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── School Head list ──────────────────────────────────────────────────────────
function SchoolHeadList({ refreshKey }: { refreshKey: number }) {
  const [schoolHeads, setSchoolHeads] = useState<SchoolHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<SchoolHead | null>(null);

  function loadData() {
    setLoading(true);
    fetch("/api/school-heads")
      .then(r => r.json())
      .then((data: { success?: boolean; schoolHeads?: SchoolHead[] }) => {
        setSchoolHeads(data.schoolHeads ?? []);
        setError("");
      })
      .catch(() => setError("Failed to load school head accounts."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch("/api/school-heads");
        const data = (await r.json()) as { success?: boolean; schoolHeads?: SchoolHead[] };
        if (!cancelled) {
          setSchoolHeads(data.schoolHeads ?? []);
          setError("");
        }
      } catch {
        if (!cancelled) setError("Failed to load school head accounts.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function handleToggle(id: number) {
    const res = await fetch(`/api/school-heads/${id}`, { method: "PATCH" });
    if (res.ok) setSchoolHeads(prev => prev.map(sh => sh.id === id ? { ...sh, is_active: sh.is_active ? 0 : 1 } : sh));
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete this school head account?\n\n${name}\n\nThis cannot be undone.`)) return;
    const res = await fetch(`/api/school-heads/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSchoolHeads(prev => prev.filter(sh => sh.id !== id));
    } else {
      window.alert("Failed to delete account.");
    }
  }

  const filtered = schoolHeads.filter(sh =>
    search === "" ||
    sh.full_name.toLowerCase().includes(search.toLowerCase()) ||
    sh.id_number.toLowerCase().includes(search.toLowerCase()) ||
    sh.department.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <>
      {editTarget && (
        <EditSchoolHeadModal schoolHead={editTarget} onClose={() => setEditTarget(null)} onSaved={loadData} />
      )}
      <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {filtered.length} of {schoolHeads.length} account{schoolHeads.length === 1 ? "" : "s"}
          </p>
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, ID#, department..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 sm:w-60"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState label="school head" filtered={search !== ""} />
        ) : (
          <div className="max-h-96 overflow-y-auto overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">ID#</th>
                  <th className="px-6 py-3 font-medium">Department</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Added</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(sh => (
                  <tr key={sh.id} className="text-slate-700 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{sh.full_name}</td>
                    <td className="px-6 py-4">{sh.id_number}</td>
                    <td className="px-6 py-4">{sh.department}</td>
                    <td className="px-6 py-4"><StatusBadge active={!!sh.is_active} /></td>
                    <td className="px-6 py-4">{formatDate(sh.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setEditTarget(sh)}
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleToggle(sh.id)}
                          className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                            sh.is_active
                              ? "border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}>
                          {sh.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button type="button" onClick={() => handleDelete(sh.id, sh.full_name)}
                          className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100">
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
      </section>
    </>
  );
}

// ── Student list ──────────────────────────────────────────────────────────────
function StudentList({ refreshKey }: { refreshKey: number }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<Student | null>(null);

  function loadData() {
    setLoading(true);
    fetch("/api/students")
      .then(r => r.json())
      .then((data: { success?: boolean; students?: Student[] }) => {
        setStudents(data.students ?? []);
        setError("");
      })
      .catch(() => setError("Failed to load student accounts."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch("/api/students");
        const data = (await r.json()) as { success?: boolean; students?: Student[] };
        if (!cancelled) {
          setStudents(data.students ?? []);
          setError("");
        }
      } catch {
        if (!cancelled) setError("Failed to load student accounts.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function handleToggle(id: number) {
    const res = await fetch(`/api/students/${id}`, { method: "PATCH" });
    if (res.ok) setStudents(prev => prev.map(s => s.id === id ? { ...s, is_active: s.is_active ? 0 : 1 } : s));
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete this student account?\n\n${name}\n\nThis cannot be undone.`)) return;
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    if (res.ok) {
      setStudents(prev => prev.filter(s => s.id !== id));
    } else {
      window.alert("Failed to delete student.");
    }
  }

  const filtered = students.filter(s =>
    search === "" ||
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.student_level.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <>
      {editTarget && (
        <EditStudentModal student={editTarget} onClose={() => setEditTarget(null)} onSaved={loadData} />
      )}
      <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {filtered.length} of {students.length} account{students.length === 1 ? "" : "s"}
          </p>
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, ID, email..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 sm:w-60"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState label="student" filtered={search !== ""} />
        ) : (
          <div className="max-h-96 overflow-y-auto overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Student ID</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Level</th>
                  <th className="px-6 py-3 font-medium">Details</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Added</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(s => (
                  <tr key={s.id} className="text-slate-700 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{s.first_name} {s.last_name}</td>
                    <td className="px-6 py-4">{s.student_id}</td>
                    <td className="px-6 py-4">{s.email}</td>
                    <td className="px-6 py-4">{getStudentLevelLabel(s.student_level as Parameters<typeof getStudentLevelLabel>[0])}</td>
                    <td className="px-6 py-4">{formatStudentDetails({
                      studentLevel: s.student_level as Parameters<typeof formatStudentDetails>[0]["studentLevel"],
                      grade: s.grade ?? undefined, yearLevel: s.year_level ?? undefined,
                      section: s.section ?? undefined, strand: s.strand ?? undefined, course: s.course ?? undefined,
                    })}</td>
                    <td className="px-6 py-4"><StatusBadge active={!!s.is_active} /></td>
                    <td className="px-6 py-4">{formatDate(s.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setEditTarget(s)}
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleToggle(s.id)}
                          className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                            s.is_active
                              ? "border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}>
                          {s.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button type="button" onClick={() => handleDelete(s.id, `${s.first_name} ${s.last_name}`)}
                          className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100">
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
      </section>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function AccountsList({ role, refreshKey }: AccountsListProps) {
  if (role === "faculty") return <SchoolHeadList refreshKey={refreshKey} />;
  return <StudentList refreshKey={refreshKey} />;
}
