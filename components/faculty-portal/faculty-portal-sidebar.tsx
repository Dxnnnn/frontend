"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { FacultyPortalNavIcon } from "@/components/faculty-portal/faculty-portal-icons";
import { facultyPortalNavItems } from "@/lib/faculty-portal/nav";

interface FacultyPortalSidebarProps {
  collapsed: boolean;
  /** Logged-in school head full name */
  userName?: string;
  /** Logged-in school head department */
  department?: string;
}

function formatProfileSubtitle(department?: string): string {
  const d = (department ?? "").trim().toLowerCase();
  if (!d) return "School Head";

  if (d.includes("college")) {
    return "Dean — College";
  }
  if (d.includes("senior high") || d.includes("senior-high") || d.includes("shs")) {
    return "School Head — Senior High School";
  }
  if (d.includes("elementary") || d.includes("junior")) {
    return "School Head — Elementary & Junior High";
  }
  return department!.trim();
}

export function FacultyPortalSidebar({
  collapsed,
  userName = "",
  department = "",
}: FacultyPortalSidebarProps) {
  const pathname = usePathname();

  const displayName = userName.trim() || "School Head";
  const initial = displayName.charAt(0).toUpperCase();
  const subtitle = formatProfileSubtitle(department);

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col text-white transition-[width] duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{ background: "linear-gradient(180deg, #0a1a3a 0%, #0d2254 60%, #0a1a3a 100%)" }}
    >
      {/* ── Top: Logo ── */}
      <div
        className={`flex flex-col items-center border-b border-white/10 py-6 ${
          collapsed ? "px-2" : "px-5"
        }`}
      >
        <div className="h-24 w-24 overflow-hidden rounded-full shadow-lg">
          <Image
            src="/icons/sidebar-logo.png"
            alt="Benedicto College logo"
            width={96}
            height={96}
            unoptimized
            className="h-full w-full object-cover"
          />
        </div>
        {!collapsed ? (
          <div className="mt-3 text-center">
            <p className="truncate text-sm font-bold tracking-wide text-white">Benedicto College</p>
            <p className="mt-0.5 text-xs font-medium text-yellow-400">School Head Portal</p>
          </div>
        ) : null}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {facultyPortalNavItems.map((item) => {
          const isActive =
            item.href === "/faculty"
              ? pathname === "/faculty"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                collapsed ? "justify-center" : "gap-3"
              } ${
                isActive
                  ? "bg-yellow-400/20 text-yellow-300 shadow-sm"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FacultyPortalNavIcon icon={item.icon} />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom: profile card + logout ── */}
      <div className="space-y-3 border-t border-white/10 px-3 py-4">
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-blue-900">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white" title={displayName}>
                {displayName}
              </p>
              <p className="truncate text-xs text-yellow-300" title={subtitle}>
                {subtitle}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-blue-900"
              title={`${displayName} — ${subtitle}`}
            >
              {initial}
            </span>
          </div>
        )}

        <LogoutButton
          collapsed={collapsed}
          className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        />
      </div>
    </aside>
  );
}
