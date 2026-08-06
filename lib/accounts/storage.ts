import type { AuthUser } from "@/lib/types/auth";
import type {
  Account,
  AccountRole,
  NewSchoolHeadAccount,
  NewStudentAccount,
} from "@/lib/types/account";

const STORAGE_KEY = "eval_admin_accounts";

const defaultAccounts: Account[] = [
  {
    id: "seed-student-1",
    username: "user",
    name: "Student Evaluator",
    firstName: "Student",
    lastName: "Evaluator",
    email: "student@example.com",
    studentLevel: "college",
    yearLevel: "4th Year",
    course: "BSIT",
    section: "A",
    role: "user",
    password: "user123",
    createdAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "seed-school-head-1",
    username: "faculty",
    name: "School Head",
    role: "faculty",
    department: "Computer Science",
    password: "faculty123",
    createdAt: "2026-01-10T00:00:00.000Z",
  },
];

const defaultAccountsById = new Map(
  defaultAccounts.map((account) => [account.id, account]),
);

function normalizeAccount(record: unknown): Account {
  const account = record as Partial<Account>;
  const fallback = account.id ? defaultAccountsById.get(account.id) : undefined;
  const firstName = account.firstName ?? fallback?.firstName;
  const lastName = account.lastName ?? fallback?.lastName;
  const derivedName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    account.name ||
    "Unknown Account";

  return {
    id: account.id ?? crypto.randomUUID(),
    name: derivedName,
    username: account.username ?? "",
    password: account.password ?? fallback?.password ?? "",
    role: account.role ?? "user",
    department: account.department ?? fallback?.department,
    firstName,
    lastName,
    email: account.email ?? fallback?.email,
    studentLevel: account.studentLevel ?? fallback?.studentLevel,
    grade: account.grade ?? fallback?.grade,
    yearLevel: account.yearLevel ?? fallback?.yearLevel,
    section: account.section ?? fallback?.section,
    strand: account.strand ?? fallback?.strand,
    course: account.course ?? fallback?.course,
    createdAt: account.createdAt ?? new Date().toISOString(),
  };
}

function readAccounts(): Account[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    writeAccounts(defaultAccounts);
    return defaultAccounts;
  }

  try {
    const parsed = JSON.parse(raw) as unknown[];
    const normalized = parsed.map(normalizeAccount);
    writeAccounts(normalized);
    return normalized;
  } catch {
    return [];
  }
}

function writeAccounts(accounts: Account[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function getAccounts(role?: AccountRole): Account[] {
  const accounts = readAccounts().sort((a, b) => a.name.localeCompare(b.name));

  if (!role) {
    return accounts;
  }

  return accounts.filter((account) => account.role === role);
}

export function addStudentAccount(input: NewStudentAccount): Account {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  const account: Account = {
    id: crypto.randomUUID(),
    name: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    username: input.username.trim(),
    email: input.email.trim(),
    password: input.password,
    role: "user",
    studentLevel: input.studentLevel,
    section: input.section.trim(),
    grade:
      input.studentLevel === "college" ? undefined : input.grade?.trim(),
    yearLevel:
      input.studentLevel === "college" ? input.yearLevel?.trim() : undefined,
    strand:
      input.studentLevel === "senior-high" ? input.strand : undefined,
    course: input.studentLevel === "college" ? input.course : undefined,
    createdAt: new Date().toISOString(),
  };

  writeAccounts([...readAccounts(), account]);
  return account;
}

export function addSchoolHeadAccount(input: NewSchoolHeadAccount): Account {
  const account: Account = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    username: input.username.trim(),
    password: input.password,
    role: "faculty",
    department: input.department.trim(),
    createdAt: new Date().toISOString(),
  };

  writeAccounts([...readAccounts(), account]);
  return account;
}

export function deleteAccount(id: string) {
  writeAccounts(readAccounts().filter((account) => account.id !== id));
}

export function usernameExists(username: string): boolean {
  const normalized = username.trim().toLowerCase();
  return readAccounts().some(
    (account) => account.username.toLowerCase() === normalized,
  );
}

export function findAccountByCredentials(
  username: string,
  password: string,
): Account | null {
  const normalized = username.trim().toLowerCase();

  return (
    readAccounts().find(
      (account) =>
        account.username.toLowerCase() === normalized &&
        account.password === password,
    ) ?? null
  );
}

export function accountToAuthUser(account: Account): AuthUser {
  return {
    id: account.id,
    username: account.username,
    name: account.name,
    role: account.role,
    ...(account.department ? { department: account.department } : {}),
  };
}

export function formatAccountDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function maskPassword(password: string) {
  return "•".repeat(Math.max(password.length, 8));
}
