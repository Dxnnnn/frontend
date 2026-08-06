"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 print:h-auto print:overflow-visible print:bg-white">
      <div className="shrink-0 print:hidden">
        <AdminSidebar collapsed={false} />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden print:min-h-0 print:overflow-visible">
        {children}
      </div>
    </div>
  );
}
