"use client";

import { useCallback, useState } from "react";

import { SidebarEdgeToggle } from "@/components/admin/sidebar-edge-toggle";
import { UserSidebar } from "@/components/user/user-sidebar";
import { useSessionGuard } from "@/hooks/use-session-guard";

interface UserShellProps {
  children: React.ReactNode;
}

export function UserShell({ children }: UserShellProps) {
  useSessionGuard("/login");
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <div className="group/sidebar relative shrink-0">
        <UserSidebar collapsed={collapsed} />
        <SidebarEdgeToggle collapsed={collapsed} onToggle={handleToggle} />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
