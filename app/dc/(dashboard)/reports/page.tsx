"use client";

import { useEffect, useState } from "react";
import { FacultyPerformanceTable } from "@/components/admin/reports/faculty-performance-table";
import { PermissionGate } from "@/components/admin/permission-gate";

export default function DCReportsPage() {
  const [allowStudent, setAllowStudent]       = useState(false);
  const [allowSchoolHead, setAllowSchoolHead] = useState(false);
  const [ready, setReady]                     = useState(false);

  useEffect(() => {
    fetch("/api/admins/me/permissions", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { success?: boolean; permissions?: Record<string, boolean>; isSuperAdmin?: boolean }) => {
        if (d.isSuperAdmin) { setAllowStudent(true); setAllowSchoolHead(true); }
        else if (d.success && d.permissions) {
          setAllowStudent(d.permissions["reports.student"] === true);
          setAllowSchoolHead(d.permissions["reports.school_head"] === true);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  // Determine props for the table based on which permissions are granted
  const bothAllowed   = allowStudent && allowSchoolHead;
  const onlySchoolHead = !allowStudent && allowSchoolHead;

  return (
    <PermissionGate requiredKeys={["reports.student", "reports.school_head"]}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Faculty performance overview. Click &ldquo;View Report&rdquo; to see a full detailed evaluation report.
          </p>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
          {ready && (
            <FacultyPerformanceTable
              reportBasePath="/dc/reports"
              /* Hide the toggle when only one source is allowed */
              hideSourceToggle={!bothAllowed}
              /* If only school head is allowed, start on school_head tab */
              schoolHeadOnly={onlySchoolHead}
              /* If only student is allowed, includeSchoolHead stays false (default) */
              includeSchoolHead={onlySchoolHead || bothAllowed}
            />
          )}
        </main>
      </div>
    </PermissionGate>
  );
}
