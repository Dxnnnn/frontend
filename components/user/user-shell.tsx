"use client";

import { useCallback, useSyncExternalStore } from "react";

import { SidebarEdgeToggle } from "@/components/admin/sidebar-edge-toggle";
import { UserSidebar } from "@/components/user/user-sidebar";

interface UserShellProps {
  children: React.ReactNode;
}

const STORAGE_KEY = "user-sidebar-collapsed";
const COLLAPSED_EVENT = "user-sidebar-collapsed-change";

function subscribeCollapsed(onStoreChange: () => void) {
  window.addEventListener(COLLAPSED_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(COLLAPSED_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getCollapsedSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

function getCollapsedServerSnapshot() {
  return false;
}

export function UserShell({ children }: UserShellProps) {
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot,
  );

  const handleToggle = useCallback(() => {
    const next = !getCollapsedSnapshot();
    window.localStorage.setItem(STORAGE_KEY, String(next));
    window.dispatchEvent(new Event(COLLAPSED_EVENT));
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
