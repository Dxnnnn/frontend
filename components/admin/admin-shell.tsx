"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarEdgeToggle } from "@/components/admin/sidebar-edge-toggle";
import { useSessionGuard } from "@/hooks/use-session-guard";
import type { AdminSubRole } from "@/lib/types/auth";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  useSessionGuard("/admin/login");
  const [collapsed, setCollapsed] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminSubRole | undefined>(undefined);
  const [adminName, setAdminName] = useState<string>("");
  const handleToggle = useCallback(() => setCollapsed((prev) => !prev), []);
  
  const router = useRouter();

  // Read adminRole + name from session API (httpOnly cookie not readable via document.cookie)
  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { user?: { adminRole?: AdminSubRole; name?: string } }) => {
        if (!d.user) return;
        setAdminRole(d.user.adminRole);
        setAdminName(d.user.name ?? "");
        // Redirect EO → /eo portal, Data Center → /dc portal
        if (d.user.adminRole === "Executive Office") { router.replace("/eo"); return; }
        if (d.user.adminRole === "Data Center") { router.replace("/dc"); return; }
      })
      .catch(() => {});
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 print:h-auto print:overflow-visible print:bg-white">
      <div className="group/sidebar relative shrink-0 print:hidden">
        <AdminSidebar collapsed={collapsed} adminRole={adminRole} adminName={adminName} />
        <SidebarEdgeToggle collapsed={collapsed} onToggle={handleToggle} />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden print:min-h-0 print:overflow-visible">
        {children}
      </div>
    </div>
  );
}
