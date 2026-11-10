export const ALL_PERMISSION_KEYS = [
  "dashboard",
  "accounts.student",
  "accounts.school_head",
  "faculty",
  "questionnaire.student",
  "questionnaire.school_head",
  "evaluation_status.student",
  "evaluation_status.school_head",
  "semester",
  "subjects",
  "reports.student",
  "reports.school_head",
] as const;

export type PermissionKey = (typeof ALL_PERMISSION_KEYS)[number];

export type PermissionMap = Record<PermissionKey, boolean>;

/** Returns a PermissionMap with all permissions set to false */
export function emptyPermissions(): PermissionMap {
  return Object.fromEntries(ALL_PERMISSION_KEYS.map((k) => [k, false])) as PermissionMap;
}

/** Returns a PermissionMap with all permissions set to true */
export function fullPermissions(): PermissionMap {
  return Object.fromEntries(ALL_PERMISSION_KEYS.map((k) => [k, true])) as PermissionMap;
}

/**
 * Module definitions for rendering the permission UI.
 * Each module may have submodules (student / school_head).
 */
export interface PermissionModule {
  label: string;
  key: PermissionKey | null;          // null = parent-only (uses submodules)
  submodules?: { label: string; key: PermissionKey }[];
}

export const PERMISSION_MODULES: PermissionModule[] = [
  { label: "Dashboard", key: "dashboard" },
  {
    label: "Accounts",
    key: null,
    submodules: [
      { label: "Student Accounts", key: "accounts.student" },
      { label: "School Head Accounts", key: "accounts.school_head" },
    ],
  },
  { label: "Faculty", key: "faculty" },
  {
    label: "Create Questionnaire",
    key: null,
    submodules: [
      { label: "Student Questionnaire", key: "questionnaire.student" },
      { label: "School Head Questionnaire", key: "questionnaire.school_head" },
    ],
  },
  {
    label: "Evaluation Status",
    key: null,
    submodules: [
      { label: "Student Evaluation Status", key: "evaluation_status.student" },
      { label: "School Head Evaluation Status", key: "evaluation_status.school_head" },
    ],
  },
  { label: "Semester", key: "semester" },
  { label: "Subjects", key: "subjects" },
  {
    label: "Reports",
    key: null,
    submodules: [
      { label: "Student Reports", key: "reports.student" },
      { label: "School Head Reports", key: "reports.school_head" },
    ],
  },
];
