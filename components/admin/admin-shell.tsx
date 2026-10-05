"use client";

import { useCallback, useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarEdgeToggle } from "@/components/admin/sidebar-edge-toggle";
import { useSessionGuard } from "@/hooks/use-session-guard";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  useSessionGuard("/admin/login");
  const [collapsed, setCollapsed] = useState(false);
  const handleToggle = useCallback(() => setCollapsed((prev) => !prev), []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 print:h-auto print:overflow-visible print:bg-white">
      <div className="group/sidebar relative shrink-0 print:hidden">
        <AdminSidebar collapsed={collapsed} />
        <SidebarEdgeToggle collapsed={collapsed} onToggle={handleToggle} />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden print:min-h-0 print:overflow-visible">
        {children}
      </div>
    </div>
  );
}
