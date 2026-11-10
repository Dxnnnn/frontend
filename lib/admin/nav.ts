import type { AdminSubRole } from "@/lib/types/auth";

export interface AdminNavItem {
  label: string;
  href: string;
  icon:
    | "home"
    | "dashboard"
    | "evaluations"
    | "status"
    | "faculty"
    | "semester"
    | "accounts"
    | "reports"
    | "settings"
    | "permissions";
  permissionKeys?: string[];
}

// ── Executive Office nav (/eo routes) ────────────────────────────────────────
const eoNavItemsBase: AdminNavItem[] = [
  { label: "Dashboard",            href: "/eo",                   icon: "dashboard",   permissionKeys: ["dashboard"] },
  { label: "Accounts",             href: "/eo/accounts",          icon: "accounts",    permissionKeys: ["accounts.student", "accounts.school_head"] },
  { label: "Faculty",              href: "/eo/faculty",           icon: "faculty",     permissionKeys: ["faculty"] },
  { label: "Create Questionnaire", href: "/eo/evaluations",       icon: "evaluations", permissionKeys: ["questionnaire.student", "questionnaire.school_head"] },
  { label: "Evaluation Status",    href: "/eo/evaluation-status", icon: "status",      permissionKeys: ["evaluation_status.student", "evaluation_status.school_head"] },
  { label: "Semester",             href: "/eo/semester",          icon: "semester",    permissionKeys: ["semester"] },
  { label: "Subjects",             href: "/eo/subjects",          icon: "faculty",     permissionKeys: ["subjects"] },
  { label: "Reports",              href: "/eo/reports",           icon: "reports",     permissionKeys: ["reports.student", "reports.school_head"] },
];

// ── Data Center nav (/dc routes) ─────────────────────────────────────────────
const dcNavItemsBase: AdminNavItem[] = [
  { label: "Dashboard",            href: "/dc",                   icon: "dashboard",   permissionKeys: ["dashboard"] },
  { label: "Accounts",             href: "/dc/accounts",          icon: "accounts",    permissionKeys: ["accounts.student", "accounts.school_head"] },
  { label: "Faculty",              href: "/dc/faculty",           icon: "faculty",     permissionKeys: ["faculty"] },
  { label: "Create Questionnaire", href: "/dc/evaluations",       icon: "evaluations", permissionKeys: ["questionnaire.student", "questionnaire.school_head"] },
  { label: "Evaluation Status",    href: "/dc/evaluation-status", icon: "status",      permissionKeys: ["evaluation_status.student", "evaluation_status.school_head"] },
  { label: "Semester",             href: "/dc/semester",          icon: "semester",    permissionKeys: ["semester"] },
  { label: "Subjects",             href: "/dc/subjects",          icon: "faculty",     permissionKeys: ["subjects"] },
  { label: "Reports",              href: "/dc/reports",           icon: "reports",     permissionKeys: ["reports.student", "reports.school_head"] },
];

// ── Super Admin nav — Overview, Manage Permissions, Settings ─────────────────
const superAdminNavItems: AdminNavItem[] = [
  { label: "Overview",            href: "/admin",             icon: "home"        },
  { label: "Manage Permissions",  href: "/admin/permissions", icon: "permissions" },
  { label: "Settings",            href: "/admin/settings",    icon: "settings"    },
];

/** Filter a nav array based on the user's permission map */
function filterByPermissions(
  items: AdminNavItem[],
  permissions?: Record<string, boolean>
): AdminNavItem[] {
  if (!permissions) return items; // no permissions loaded yet — show all
  return items.filter((item) => {
    if (!item.permissionKeys || item.permissionKeys.length === 0) return true;
    return item.permissionKeys.some((k) => permissions[k] === true);
  });
}

export function getAdminNavItems(
  adminRole?: AdminSubRole,
  permissions?: Record<string, boolean>
): AdminNavItem[] {
  if (adminRole === "Executive Office") return filterByPermissions(eoNavItemsBase, permissions);
  if (adminRole === "Data Center") return filterByPermissions(dcNavItemsBase, permissions);
  return superAdminNavItems;
}

export function getAdminPortalLabel(adminRole?: AdminSubRole): string {
  if (adminRole === "Executive Office") return "Executive Office";
  if (adminRole === "Data Center") return "Data Center Portal";
  return "Super Admin Portal";
}

export const dashboardStats: { label: string; value: string; change: string }[] = [];
