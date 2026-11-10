"use client";

import { useEffect, useState } from "react";
import { AdminAnalytics } from "@/components/admin/admin-analytics";
import { RecentEvaluationsTicker } from "@/components/admin/recent-evaluations-ticker";
import { PermissionGate } from "@/components/admin/permission-gate";

export default function EODashboardPage() {
  const [permissions, setPermissions] = useState<Record<string, boolean> | undefined>(undefined);

  useEffect(() => {
    fetch("/api/admins/me/permissions", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { success?: boolean; permissions?: Record<string, boolean>; isSuperAdmin?: boolean }) => {
        if (d.isSuperAdmin) {
          setPermissions(undefined); // undefined = show all
        } else {
          setPermissions(d.permissions ?? {});
        }
      })
      .catch(() => setPermissions({}));
  }, []);

  return (
    <PermissionGate requiredKeys={["dashboard"]}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Overview of evaluation activity, faculty performance, and system stats.</p>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8 space-y-8">
          <AdminAnalytics permissions={permissions} />
          <RecentEvaluationsTicker />
        </main>
      </div>
    </PermissionGate>
  );
}
