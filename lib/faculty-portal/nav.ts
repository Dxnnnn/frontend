export interface FacultyPortalNavItem {
  label: string;
  href: string;
  icon: "dashboard" | "evaluations" | "faculty" | "reports";
}

export const facultyPortalNavItems: FacultyPortalNavItem[] = [
  { label: "Dashboard", href: "/faculty", icon: "dashboard" },
  {
    label: "Evaluation Form",
    href: "/faculty/evaluations",
    icon: "evaluations",
  },
  { label: "Teachers", href: "/faculty/faculty", icon: "faculty" },
  { label: "Reports", href: "/faculty/reports", icon: "reports" },
];
