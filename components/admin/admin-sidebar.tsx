"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminNavIcon } from "@/components/admin/admin-icons";
import { LogoutButton } from "@/components/auth/logout-button";
import { adminNavItems } from "@/lib/admin/nav";

interface AdminSidebarProps {
  collapsed: boolean;
}

export function AdminSidebar({ collapsed }: AdminSidebarProps) {
  const pathname = usePathname();

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
            <p className="mt-0.5 text-xs font-medium text-yellow-400">Admin Portal</p>
          </div>
        ) : null}
      </div>

      {/* ── Nav links ── */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {adminNavItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
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

      {/* ── Logout ── */}
      <div className="border-t border-white/10 px-3 py-4">
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
