import type { CatalogItem, NewCatalogItem } from "@/lib/types/catalog";

const DEPARTMENTS_KEY = "eval_admin_departments";
const SUBJECTS_KEY = "eval_admin_subjects";

const defaultDepartments: CatalogItem[] = [
  { id: "dept-1", name: "Computer Science", createdAt: "2026-01-10T00:00:00.000Z" },
  { id: "dept-2", name: "Mathematics", createdAt: "2026-01-10T00:00:00.000Z" },
  { id: "dept-3", name: "English", createdAt: "2026-01-10T00:00:00.000Z" },
  { id: "dept-4", name: "Business", createdAt: "2026-01-10T00:00:00.000Z" },
  { id: "dept-5", name: "Nursing", createdAt: "2026-01-10T00:00:00.000Z" },
  { id: "dept-6", name: "Engineering", createdAt: "2026-01-10T00:00:00.000Z" },
];

const defaultSubjects: CatalogItem[] = [
  { id: "subj-1", name: "Programming 1", createdAt: "2026-01-10T00:00:00.000Z" },
  { id: "subj-2", name: "Data Structures", createdAt: "2026-01-10T00:00:00.000Z" },
  { id: "subj-3", name: "Web Development", createdAt: "2026-01-10T00:00:00.000Z" },
  { id: "subj-4", name: "Calculus I", createdAt: "2026-01-10T00:00:00.000Z" },
  { id: "subj-5", name: "English Composition", createdAt: "2026-01-10T00:00:00.000Z" },
  { id: "subj-6", name: "World Literature", createdAt: "2026-01-10T00:00:00.000Z" },
  { id: "subj-7", name: "Business Management", createdAt: "2026-01-10T00:00:00.000Z" },
  { id: "subj-8", name: "Fundamentals of Nursing", createdAt: "2026-01-10T00:00:00.000Z" },
  { id: "subj-9", name: "Clinical Practice", createdAt: "2026-01-10T00:00:00.000Z" },
  { id: "subj-10", name: "Engineering Mechanics", createdAt: "2026-01-10T00:00:00.000Z" },
];

function normalizeItems(records: unknown[]): CatalogItem[] {
  return records.map((record) => {
    const item = record as Partial<CatalogItem>;

    return {
      id: item.id ?? crypto.randomUUID(),
      name: (item.name ?? "").trim() || "Untitled",
      createdAt: item.createdAt ?? new Date().toISOString(),
    };
  });
}

function readItems(key: string, defaults: CatalogItem[]): CatalogItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    writeItems(key, defaults);
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw) as unknown[];
    const normalized = normalizeItems(parsed);
    writeItems(key, normalized);
    return normalized;
  } catch {
    return [];
  }
}

function writeItems(key: string, items: CatalogItem[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
}

function sortByName(items: CatalogItem[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

function nameExists(items: CatalogItem[], name: string) {
  const normalized = name.trim().toLowerCase();
  return items.some((item) => item.name.trim().toLowerCase() === normalized);
}

export function getDepartments(): CatalogItem[] {
  return sortByName(readItems(DEPARTMENTS_KEY, defaultDepartments));
}

export function getSubjects(): CatalogItem[] {
  return sortByName(readItems(SUBJECTS_KEY, defaultSubjects));
}

export function addDepartment(input: NewCatalogItem): CatalogItem | null {
  const name = input.name.trim();
  const current = readItems(DEPARTMENTS_KEY, defaultDepartments);

  if (!name || nameExists(current, name)) {
    return null;
  }

  const item: CatalogItem = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  };

  writeItems(DEPARTMENTS_KEY, [...current, item]);
  return item;
}

export function addSubject(input: NewCatalogItem): CatalogItem | null {
  const name = input.name.trim();
  const current = readItems(SUBJECTS_KEY, defaultSubjects);

  if (!name || nameExists(current, name)) {
    return null;
  }

  const item: CatalogItem = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  };

  writeItems(SUBJECTS_KEY, [...current, item]);
  return item;
}

export function deleteDepartment(id: string) {
  const current = readItems(DEPARTMENTS_KEY, defaultDepartments);
  writeItems(
    DEPARTMENTS_KEY,
    current.filter((item) => item.id !== id),
  );
}

export function deleteSubject(id: string) {
  const current = readItems(SUBJECTS_KEY, defaultSubjects);
  writeItems(
    SUBJECTS_KEY,
    current.filter((item) => item.id !== id),
  );
}

export function formatCatalogDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
