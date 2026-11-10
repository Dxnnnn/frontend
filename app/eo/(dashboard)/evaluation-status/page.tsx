"use client";

import { useEffect, useState } from "react";
import { EvaluationStatusPanel } from "@/components/admin/evaluations/evaluation-status-panel";
import { PermissionGate } from "@/components/admin/permission-gate";

export default function EOEvaluationStatusPage() {
  const [allowStudent, setAllowStudent]       = useState(false);
  const [allowSchoolHead, setAllowSchoolHead] = useState(false);
  const [ready, setReady]                     = useState(false);

  useEffect(() => {
    fetch("/api/admins/me/permissions", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { success?: boolean; permissions?: Record<string, boolean>; isSuperAdmin?: boolean }) => {
        if (d.isSuperAdmin) { setAllowStudent(true); setAllowSchoolHead(true); }
        else if (d.success && d.permissions) {
          setAllowStudent(d.permissions["evaluation_status.student"] === true);
          setAllowSchoolHead(d.permissions["evaluation_status.school_head"] === true);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  return (
    <PermissionGate requiredKeys={["evaluation_status.student", "evaluation_status.school_head"]}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
          <h1 className="text-2xl font-semibold text-slate-900">Evaluation Status</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor who has submitted evaluations.</p>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
          {ready && (
            <EvaluationStatusPanel allowStudent={allowStudent} allowSchoolHead={allowSchoolHead} />
          )}
        </main>
      </div>
    </PermissionGate>
  );
}
