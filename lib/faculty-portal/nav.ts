export interface FacultyPortalNavItem {
  label: string;
  href: string;
  icon: "dashboard" | "evaluations" | "faculty" | "reports" | "evaluate";
}

export const facultyPortalNavItems: FacultyPortalNavItem[] = [
  { label: "Dashboard",         href: "/faculty",          icon: "dashboard"   },
  { label: "Evaluate Teacher",  href: "/faculty/evaluate", icon: "evaluate"    },
  { label: "Teachers",          href: "/faculty/faculty",  icon: "faculty"     },
  { label: "Reports",           href: "/faculty/reports",  icon: "reports"     },
];
