// lib/faculty/storage.ts
// Faculty is fully managed via the backend API (/api/faculty).
// This file exists only to provide utility helpers used by legacy components.
// Do NOT add localStorage reads/writes here.

import type { Faculty } from "@/lib/types/faculty";

export async function getFacultyAsync(): Promise<Faculty[]> {
  try {
    const res = await fetch("/api/faculty", { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      success?: boolean;
      faculty?: Array<{
        id: number;
        name: string;
        department: string;
        subjects: string;
        created_at: string;
      }>;
    };
    return (data.faculty ?? []).map((f) => ({
      id: String(f.id),
      name: f.name,
      department: f.department,
      subjects: f.subjects ? f.subjects.split(",").map((s) => s.trim()).filter(Boolean) : [],
      createdAt: f.created_at,
    }));
  } catch {
    return [];
  }
}

/** Sync bridge — returns empty array and triggers background fetch. */
let _cache: Faculty[] = [];
let _syncing = false;

export function getFaculty(): Faculty[] {
  if (typeof window !== "undefined" && !_syncing) {
    _syncing = true;
    void getFacultyAsync().then((list) => {
      _cache = list;
      _syncing = false;
    });
  }
  return _cache;
}

export function getFacultyByDepartment(department: string): Faculty[] {
  const normalized = department.trim().toLowerCase();
  return getFaculty().filter(
    (m) => m.department.trim().toLowerCase() === normalized,
  );
}

export function formatFacultyDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function parseSubjectsInput(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
