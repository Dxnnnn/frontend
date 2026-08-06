"use client";

import { FacultyPortalSidebar } from "@/components/faculty-portal/faculty-portal-sidebar";

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
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <div className="shrink-0 print:hidden">
        <FacultyPortalSidebar
          collapsed={false}
          userName={userName}
          department={department}
        />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
