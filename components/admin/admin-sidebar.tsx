"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminNavIcon } from "@/components/admin/admin-icons";
import { LogoutButton } from "@/components/auth/logout-button";
import { getAdminNavItems, getAdminPortalLabel } from "@/lib/admin/nav";
import type { AdminSubRole } from "@/lib/types/auth";

interface AdminSidebarProps {
  collapsed: boolean;
  adminRole?: AdminSubRole;
  adminName?: string;
  permissions?: Record<string, boolean>;
}

export function AdminSidebar({ collapsed, adminRole, adminName, permissions }: AdminSidebarProps) {
  const pathname = usePathname();
  const navItems = getAdminNavItems(adminRole, permissions);
  const portalLabel = getAdminPortalLabel(adminRole);

  // Badge color per role
  const badgeColor =
    adminRole === "Executive Office" ? "text-violet-300" : "text-yellow-400"; // Super Admin

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col text-white transition-[width] duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{ background: "linear-gradient(180deg, #0a1a3a 0%, #0d2254 60%, #0a1a3a 100%)" }}
    >
      {/* ── Logo + title ── */}
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
            <p className="text-sm font-bold tracking-wide text-white">Benedicto College</p>
            <p className={`mt-0.5 text-xs font-medium ${badgeColor}`}>{portalLabel}</p>
          </div>
        ) : null}
      </div>

      {/* ── Nav links ── */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin" || item.href === "/eo" || item.href === "/dc"
              ? pathname === item.href
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
              <AdminNavIcon icon={item.icon} />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      {/* ── User info + Logout ── */}
      <div className="border-t border-white/10 px-3 py-4 space-y-1">
        {/* Name card — only for EO and DC, not Super Admin */}
        {adminName && adminRole !== "Super Admin" && !collapsed && (
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 mb-1">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
              adminRole === "Executive Office"
                ? "bg-violet-400/30 text-violet-200"
                : "bg-blue-400/30 text-blue-200"
            }`}>
              {adminName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white/90">
                Admin — {adminName}
              </p>
              <p className={`text-[11px] font-medium truncate ${
                adminRole === "Executive Office" ? "text-violet-300" : "text-blue-300"
              }`}>
                {adminRole}
              </p>
            </div>
          </div>
        )}
        {/* Collapsed state — just the avatar */}
        {adminName && adminRole !== "Super Admin" && collapsed && (
          <div className="flex justify-center mb-1">
            <span
              title={`Admin — ${adminName}`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                adminRole === "Executive Office"
                  ? "bg-violet-400/30 text-violet-200"
                  : "bg-blue-400/30 text-blue-200"
              }`}
            >
              {adminName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <LogoutButton
          redirectTo="/admin/login"
          collapsed={collapsed}
          className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        />
      </div>
    </aside>
  );
}
