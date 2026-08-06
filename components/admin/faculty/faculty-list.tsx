"use client";

import { useEffect, useState } from "react";

interface FacultyMember {
  id: number;
  name: string;
  email: string | null;
  position: string | null;
  department: string;
  subjects: string;
  semester: string | null;
  is_active: number;
  created_at: string;
}

interface FacultyListProps {
  refreshKey: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Edit modal ────────────────────────────────────────────────────────────────
function EditFacultyModal({
  member,
  onClose,
  onSaved,
}: {
  member: FacultyMember;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email ?? "");
  const [position, setPosition] = useState(member.position ?? "");
  const [department, setDepartment] = useState(member.department);
  const [subjectInput, setSubjectInput] = useState("");
  const [subjects, setSubjects] = useState<string[]>(
    member.subjects ? member.subjects.split(",").map((s) => s.trim()).filter(Boolean) : []
  );
  const [semester, setSemester] = useState(member.semester ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const inputCls = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

  function addSubject() {
    const trimmed = subjectInput.trim();
    if (!trimmed || subjects.includes(trimmed)) { setSubjectInput(""); return; }
    setSubjects((prev) => [...prev, trimmed]);
    setSubjectInput("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !department.trim()) {
      setError("Name and department are required.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/faculty/${member.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim() || null,
        position: position.trim() || null,
        department: department.trim(),
        subjects,
        semester: semester.trim() || null,
      }),
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
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Edit Faculty</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Full Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} className={inputCls} required />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. m.santos@bc.edu.ph" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Position</label>
              <input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Professor" className={inputCls} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Department *</label>
              <input value={department} onChange={e => setDepartment(e.target.value)} className={inputCls} required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Subjects</label>
              <div className="flex gap-2">
                <input
                  value={subjectInput}
                  onChange={e => setSubjectInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSubject(); } }}
                  placeholder="Type a subject and press Enter"
                  className={inputCls}
                />
                <button type="button" onClick={addSubject}
                  className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  Add
                </button>
              </div>
              {subjects.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {subjects.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-lg border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                      {s}
                      <button type="button" onClick={() => setSubjects(prev => prev.filter(x => x !== s))} className="text-brand-400 hover:text-brand-700">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Semester — only for SHS and College (Summer = College only) */}
            {!department.toLowerCase().includes("elementary") && (
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Semester</label>
              <p className="text-xs text-slate-400">Leave blank if this faculty teaches all semesters.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {(department.toLowerCase().includes("college")
                  ? ["1st Semester", "2nd Semester", "Summer"]
                  : ["1st Semester", "2nd Semester"]
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSemester((prev) => prev === s ? "" : s)}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      semester === s
                        ? "border-brand-500 bg-brand-700 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                {semester && (
                  <button
                    type="button"
                    onClick={() => setSemester("")}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            )}
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-brand-700 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70">
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main list ─────────────────────────────────────────────────────────────────
export function FacultyList({ refreshKey }: FacultyListProps) {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [editTarget, setEditTarget] = useState<FacultyMember | null>(null);

  function loadData() {
    setLoading(true);
    fetch("/api/faculty")
      .then((r) => r.json())
      .then((data: { success?: boolean; faculty?: FacultyMember[] }) => {
        setFaculty(data.faculty ?? []);
        setError("");
      })
      .catch(() => setError("Failed to load faculty records."))
      .finally(() => setLoading(false));
  }

  useEffect(loadData, [refreshKey]);

  async function handleToggle(id: number) {
    const res = await fetch(`/api/faculty/${id}`, { method: "PATCH" });
    if (res.ok) {
      setFaculty(prev => prev.map(f => f.id === id ? { ...f, is_active: f.is_active ? 0 : 1 } : f));
    } else {
      window.alert("Failed to update status.");
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete this faculty member?\n\n${name}\n\nThis cannot be undone.`)) return;
    const res = await fetch(`/api/faculty/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFaculty(prev => prev.filter(f => f.id !== id));
    } else {
      window.alert("Failed to delete faculty.");
    }
  }

  const departments = [...new Set(faculty.map((f) => f.department))].sort();

  const filtered = faculty.filter((f) => {
    const matchSearch =
      search === "" ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (f.position ?? "").toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase()) ||
      f.subjects.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "" || f.department === filterDept;
    return matchSearch && matchDept;
  });

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <>
      {editTarget && (
        <EditFacultyModal member={editTarget} onClose={() => setEditTarget(null)} onSaved={loadData} />
      )}

      <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Search + Filter */}
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Faculty list</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {filtered.length} of {faculty.length} faculty member{faculty.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name, dept, subject..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 sm:w-56" />
            </div>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
              <option value="">All departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-600">{faculty.length === 0 ? "No faculty yet" : "No results found"}</p>
            <p className="mt-1 text-sm text-slate-500">
              {faculty.length === 0 ? "Add a faculty member using the button above." : "Try adjusting your search or filter."}
            </p>
          </div>
        ) : (
          <div className="min-h-0 max-h-[480px] overflow-y-auto overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Position</th>
                  <th className="px-6 py-3 font-medium">Department</th>
                  <th className="px-6 py-3 font-medium">Subjects</th>
                  <th className="px-6 py-3 font-medium">Semester</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Added</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((member) => (
                  <tr key={member.id} className="text-slate-700 hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">{member.name}</td>
                    <td className="px-6 py-4 text-slate-500">{member.position ?? "—"}</td>
                    <td className="px-6 py-4">{member.department}</td>
                    <td className="px-6 py-4 max-w-xs">
                      {member.subjects ? (
                        <div className="flex flex-wrap gap-1">
                          {member.subjects.split(",").map(s => s.trim()).filter(Boolean).map(s => (
                            <span key={s} className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{s}</span>
                          ))}
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {member.semester ? (
                        <span className="inline-block rounded-full bg-brand-50 border border-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                          {member.semester}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">All semesters</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{member.email ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        member.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${member.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(member.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setEditTarget(member)}
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleToggle(member.id)}
                          className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                            member.is_active
                              ? "border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}>
                          {member.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button type="button" onClick={() => handleDelete(member.id, member.name)}
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
