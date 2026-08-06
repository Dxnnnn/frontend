"use client";

import { useState } from "react";

import { AccountAudienceSwitch } from "@/components/admin/accounts/account-audience-switch";
import { AccountCreateModal } from "@/components/admin/accounts/account-create-modal";
import { AccountsList } from "@/components/admin/accounts/accounts-list";
import type { StudentLevel } from "@/lib/accounts/student-options";
import type { AccountRole } from "@/lib/types/account";

export function AccountsPanel() {
  const [role, setRole] = useState<AccountRole>("user");
  const [studentLevel, setStudentLevel] = useState<StudentLevel>("elementary");
  const [refreshKey, setRefreshKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  const isStudent = role === "user";

  return (
    <>
      <div className="space-y-6">
        <AccountAudienceSwitch audience={role} onChange={setRole} />

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {isStudent ? "Student accounts" : "School Head accounts"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isStudent
                  ? "View and manage student login accounts by level."
                  : "View and manage school head login accounts by department."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
            >
              {isStudent ? "Create student" : "Create school head"}
            </button>
          </div>

          <AccountsList role={role} refreshKey={refreshKey} />
        </section>
      </div>

      <AccountCreateModal
        open={createOpen}
        role={role}
        studentLevel={studentLevel}
        onStudentLevelChange={setStudentLevel}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setRefreshKey((current) => current + 1)}
      />
    </>
  );
}
