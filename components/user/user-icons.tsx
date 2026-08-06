import type { UserNavItem } from "@/lib/user/nav";

const iconClass = "h-5 w-5 shrink-0";

export function UserNavIcon({
  icon,
}: {
  icon: UserNavItem["icon"];
}) {
  switch (icon) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5h6v6H4zM14 5.5h6v6h-6zM4 14.5h6v6H4zM14 14.5h6v6h-6z" />
        </svg>
      );
    case "evaluation-form":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5a2 2 0 104 0M9 5a2 2 0 014 0M9 12h6M9 16h6" />
        </svg>
      );
  }
}
