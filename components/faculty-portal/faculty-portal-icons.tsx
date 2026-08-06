import type { FacultyPortalNavItem } from "@/lib/faculty-portal/nav";

const iconClass = "h-5 w-5 shrink-0";

export function FacultyPortalNavIcon({
  icon,
}: {
  icon: FacultyPortalNavItem["icon"];
}) {
  switch (icon) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5h6v6H4zM14 5.5h6v6h-6zM4 14.5h6v6H4zM14 14.5h6v6h-6z" />
        </svg>
      );
    case "evaluations":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5a2 2 0 104 0M9 5a2 2 0 014 0M9 12h6M9 16h6" />
        </svg>
      );
    case "faculty":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H2v-2a4 4 0 014-4h1a4 4 0 014 0v2z" />
          <circle cx="9" cy="7" r="3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M22 20v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    case "reports":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5V5.5h16v14" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 15.5v-4M12 15.5V8.5M16 15.5v-2" />
        </svg>
      );
  }
}
