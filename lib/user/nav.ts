export interface UserNavItem {
  label: string;
  href: string;
  icon: "dashboard" | "evaluation-form" | "settings";
}

export const userNavItems: UserNavItem[] = [
  { label: "Dashboard",       href: "/user",             icon: "dashboard"       },
  { label: "Evaluation Form", href: "/user/evaluations", icon: "evaluation-form" },
  { label: "Settings",        href: "/user/settings",    icon: "settings"        },
];
