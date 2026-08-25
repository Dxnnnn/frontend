"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { UserNavIcon } from "@/components/user/user-icons";
import { userNavItems } from "@/lib/user/nav";

interface UserSidebarProps {
  collapsed: boolean;
}

interface StudentInfo {
  name: string;
  username: string;
  course: string | null;
  year_level: string | null;
  student_level: string | null;
  grade: string | null;
  section: string | null;
}

const EMPTY_INFO: StudentInfo = {
  name: "",
  username: "",
  course: null,
  year_level: null,
  student_level: null,
  grade: null,
  section: null,
};

function getStudentInfo(): StudentInfo {
  if (typeof document === "undefined") return EMPTY_INFO;
  try {
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith("eval_user_info="))
      ?.split("=")
      .slice(1)
      .join("=");
    if (!raw) return EMPTY_INFO;
    return JSON.parse(decodeURIComponent(raw)) as StudentInfo;
  } catch {
    return EMPTY_INFO;
  }
}

function subscribeStudentInfo() {
  return () => {};
}

export function UserSidebar({ collapsed }: UserSidebarProps) {
  const pathname = usePathname();
  const [info, setInfo] = useState<StudentInfo>(EMPTY_INFO);

  useEffect(() => {
    setInfo(getStudentInfo());
  }, []);

  const displayName = info.name || info.username || "Student";
  const initial = displayName.charAt(0).toUpperCase();

  // Build subtitle: show level + grade + section properly
  function buildSubtitle(): string {
    const level = info.student_level;
    if (level === "college") {
      return [info.course, info.year_level, info.section ? `Section ${info.section}` : ""].filter(Boolean).join(" · ");
    }
    if (level === "senior-high" || level === "junior-high" || level === "elementary") {
      const levelLabel = level === "senior-high" ? "Senior High" : level === "junior-high" ? "Junior High" : "Elementary";
      return [levelLabel, info.grade ? `Grade ${info.grade}` : "", info.section ? `Section ${info.section}` : ""].filter(Boolean).join(" · ");
    }
    return info.student_level ?? "Student Portal";
  }

  const subtitle = buildSubtitle();

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col text-white transition-[width] duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{ background: "linear-gradient(180deg, #0a1a3a 0%, #0d2254 60%, #0a1a3a 100%)" }}
    >
      {/* ── Top: Logo only ── */}
      <div className={`flex flex-col items-center border-b border-white/10 py-6 ${collapsed ? "px-2" : "px-5"}`}>
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
        {!collapsed && (
          <div className="mt-3 text-center">
            <p className="text-sm font-bold tracking-wide text-white">Benedicto College</p>
            <p className="mt-0.5 text-xs font-medium text-yellow-400">Student Portal</p>
          </div>
        )}
      </div>

      {/* ── Nav links ── */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {userNavItems.map((item) => {
          const isActive =
            item.href === "/user"
              ? pathname === "/user"
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
              <UserNavIcon icon={item.icon} />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom: Student info + logout ── */}
      <div className="border-t border-white/10 px-3 py-4 space-y-3">
        {/* Student card */}
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-blue-900">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              {subtitle && (
                <p className="truncate text-xs text-yellow-300">{subtitle}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-blue-900"
              title={displayName}
            >
              {initial}
            </span>
          </div>
        )}

        {/* Logout */}
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
