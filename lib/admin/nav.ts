export interface AdminNavItem {
  label: string;
  href: string;
  icon:
    | "dashboard"
    | "evaluations"
    | "status"
    | "faculty"
    | "semester"
    | "accounts"
    | "reports";
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Accounts", href: "/admin/accounts", icon: "accounts" },
  { label: "Faculty", href: "/admin/faculty", icon: "faculty" },
  { label: "Evaluations", href: "/admin/evaluations", icon: "evaluations" },
  { label: "Evaluation Status", href: "/admin/evaluation-status", icon: "status" },
  { label: "Semester", href: "/admin/semester", icon: "semester" },
  { label: "Reports", href: "/admin/reports", icon: "reports" },
];

export const dashboardStats: { label: string; value: string; change: string }[] = [];
