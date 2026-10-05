"use client";

import { useCallback, useState } from "react";
import { FacultyPortalSidebar } from "@/components/faculty-portal/faculty-portal-sidebar";
import { SidebarEdgeToggle } from "@/components/admin/sidebar-edge-toggle";
import { useSessionGuard } from "@/hooks/use-session-guard";

interface FacultyPortalShellProps {
  children: React.ReactNode;
  userName?: string;
  department?: string;
}

export function FacultyPortalShell({
  children,
  userName,
  department,
}: FacultyPortalShellProps) {
  useSessionGuard("/login");
  const [collapsed, setCollapsed] = useState(false);
  const handleToggle = useCallback(() => setCollapsed((prev) => !prev), []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <div className="group/sidebar relative shrink-0 print:hidden">
        <FacultyPortalSidebar
          collapsed={collapsed}
          userName={userName}
          department={department}
        />
        <SidebarEdgeToggle collapsed={collapsed} onToggle={handleToggle} />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
