interface SidebarEdgeToggleProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarEdgeToggle({
  collapsed,
  onToggle,
}: SidebarEdgeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={
        collapsed
          ? "Expand sidebar"
          : "Collapse sidebar to see the full page"
      }
      className="group/toggle absolute top-1/2 right-0 z-20 -translate-y-1/2 translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100 focus-visible:opacity-100"
    >
      <span className="relative block h-14 w-7">
        <svg
          viewBox="0 0 28 56"
          className={`absolute inset-0 h-full w-full drop-shadow-sm transition group-hover/toggle:drop-shadow-md ${
            collapsed ? "" : "rotate-180"
          }`}
          aria-hidden="true"
        >
          <path
            d="M0 4 Q0 0 4 0 L24 24 Q28 28 24 32 L4 56 Q0 56 0 52 Z"
            className="fill-orange-500 stroke-slate-200 transition group-hover/toggle:fill-orange-400 group-hover/toggle:stroke-orange-300"
            strokeWidth="1.5"
          />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          className={
            collapsed
              ? "absolute top-1/2 left-1/2 h-3.5 w-3.5 -translate-x-40% -translate-y-1/2 text-orange-500 transition group-hover/toggle:text-orange-400"
              : "absolute top-1/2 left-1/2 h-3.5 w-3.5 -translate-x-60% -translate-y-1/2 text-orange-500 transition group-hover/toggle:text-orange-400"
          }
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={collapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"}
          />
        </svg>
      </span>
    </button>
  );
}
