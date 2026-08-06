import type { NewSemester, Semester } from "@/lib/types/semester";

// ── Async API calls ───────────────────────────────────────────────────────────

export async function getSemestersAsync(): Promise<Semester[]> {
  try {
    const res = await fetch("/api/semesters", { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { success?: boolean; semesters?: Semester[] };
    return data.semesters ?? [];
  } catch {
    return [];
  }
}

/** Only active semesters — for student/school head evaluation form */
export async function getActiveSemestersAsync(): Promise<Semester[]> {
  try {
    const res = await fetch("/api/semesters/active", { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { success?: boolean; semesters?: Semester[] };
    return data.semesters ?? [];
  } catch {
    return [];
  }
}

export async function toggleSemesterAsync(id: string): Promise<boolean | null> {
  try {
    const res = await fetch(`/api/semesters/${id}`, { method: "PATCH" });
    if (!res.ok) return null;
    const data = (await res.json()) as { success?: boolean; isActive?: boolean };
    return data.isActive ?? null;
  } catch {
    return null;
  }
}

export async function addSemesterAsync(input: NewSemester): Promise<Semester | null> {
  const res = await fetch("/api/semesters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      schoolYear: input.schoolYear,
      term: input.term,
      subjects: input.subjects,
    }),
  });
  const data = (await res.json()) as { success?: boolean; semester?: Semester; message?: string };
  if (!res.ok || !data.semester) {
    throw new Error(data.message ?? "Failed to save semester.");
  }
  return data.semester;
}

export async function deleteSemesterAsync(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/semesters/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Sync bridges for legacy callers ──────────────────────────────────────────

let _cache: Semester[] = [];
let _syncing = false;

export function getSemesters(): Semester[] {
  if (typeof window !== "undefined" && !_syncing) {
    _syncing = true;
    void getSemestersAsync().then((list) => {
      _cache = list;
      _syncing = false;
    });
  }
  return _cache;
}

export function addSemester(input: NewSemester): Semester | null {
  void addSemesterAsync(input).then((sem) => {
    if (sem) _cache = [sem, ..._cache];
  });
  return null;
}

export function deleteSemester(id: string): void {
  void deleteSemesterAsync(id).then((ok) => {
    if (ok) _cache = _cache.filter((s) => s.id !== id);
  });
}

export function formatSemesterDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
