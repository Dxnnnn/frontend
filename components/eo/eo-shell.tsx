"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionGuard } from "@/hooks/use-session-guard";
import type { AdminSubRole, AuthUser } from "@/lib/types/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarEdgeToggle } from "@/components/admin/sidebar-edge-toggle";

interface EOShellProps {
  children: React.ReactNode;
}

export function EOShell({ children }: EOShellProps) {
  useSessionGuard("/admin/login");
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [adminName, setAdminName] = useState<string>("");
  const [permissions, setPermissions] = useState<Record<string, boolean> | undefined>(undefined);
  const handleToggle = useCallback(() => setCollapsed((prev) => !prev), []);

  useEffect(() => {
    // Fetch session from API (httpOnly cookie is readable server-side)
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { user?: AuthUser }) => {
        if (!d.user) return;
        setAdminName(d.user.name ?? "");
        // Redirect Super Admin away
        if (d.user.adminRole === "Super Admin") {
          router.replace("/admin/settings");
        }
      })
      .catch(() => {});

    // Fetch live permissions
    fetch("/api/admins/me/permissions", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { success?: boolean; permissions?: Record<string, boolean>; isSuperAdmin?: boolean }) => {
        if (d.isSuperAdmin || !d.success) { setPermissions({}); return; }
        setPermissions(d.permissions ?? {});
      })
      .catch(() => setPermissions({}));
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 print:h-auto print:overflow-visible print:bg-white">
      <div className="group/sidebar relative shrink-0 print:hidden">
        <AdminSidebar
          collapsed={collapsed}
          adminRole="Executive Office"
          adminName={adminName}
          permissions={permissions}
        />
        <SidebarEdgeToggle collapsed={collapsed} onToggle={handleToggle} />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden print:min-h-0 print:overflow-visible">
        {children}
      </div>
    </div>
  );
}
