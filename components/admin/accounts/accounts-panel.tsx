"use client";

import { useEffect, useState } from "react";

import { AccountAudienceSwitch } from "@/components/admin/accounts/account-audience-switch";
import { AccountCreateModal } from "@/components/admin/accounts/account-create-modal";
import { AccountsList } from "@/components/admin/accounts/accounts-list";
import { PasswordSuccessModal } from "@/components/admin/accounts/password-success-modal";
import type { StudentLevel } from "@/lib/accounts/student-options";
import type { AccountRole } from "@/lib/types/account";

interface AccountsPanelProps {
  /** When true, only show Student tab (for permission-restricted access) */
  allowStudent?: boolean;
  /** When true, only show School Head tab (for permission-restricted access) */
  allowSchoolHead?: boolean;
}

export function AccountsPanel({ allowStudent, allowSchoolHead }: AccountsPanelProps) {
  // Determine which tabs are visible — if neither prop is passed, show both (Super Admin / unrestricted)
  const showStudent    = allowStudent    !== false;
  const showSchoolHead = allowSchoolHead !== false;

  // Pick the correct default tab based on what's allowed
  const defaultRole: AccountRole = showStudent ? "user" : "faculty";

  const [role, setRole]             = useState<AccountRole>(defaultRole);
  const [studentLevel, setStudentLevel] = useState<StudentLevel>("elementary");
  const [refreshKey, setRefreshKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [successData, setSuccessData] = useState<{
    title: string;
    name: string;
    loginId: string;
    password: string;
    loginLabel: string;
  } | null>(null);

  // If permissions change (e.g. Super Admin revokes access while user is on the page),
  // snap to an allowed tab
  useEffect(() => {
    if (role === "user"    && !showStudent)    setRole("faculty");
    if (role === "faculty" && !showSchoolHead) setRole("user");
  }, [showStudent, showSchoolHead, role]);

  const isStudent = role === "user";

  // Filter audience options to only the ones the user can access
  const filteredAudiences: AccountRole[] = [
    ...(showStudent    ? (["user"]    as AccountRole[]) : []),
    ...(showSchoolHead ? (["faculty"] as AccountRole[]) : []),
  ];

  return (
    <>
      {successData && (
        <PasswordSuccessModal
          title={successData.title}
          name={successData.name}
          loginId={successData.loginId}
          password={successData.password}
          loginLabel={successData.loginLabel}
          onClose={() => setSuccessData(null)}
        />
      )}

      <div className="space-y-6">
        {/* Only render the switcher when the user can see both tabs */}
        {showStudent && showSchoolHead ? (
          <AccountAudienceSwitch audience={role} onChange={setRole} />
        ) : (
          /* Single-tab header — no switcher needed */
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Accounts for</p>
            <p className="mt-1 text-sm text-slate-500">
              {showStudent
                ? "Manage student login accounts with ID# and password."
                : "Manage school head login accounts for each department."}
            </p>
          </div>
        )}

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
        onCreated={(data) => {
          setRefreshKey((current) => current + 1);
          setCreateOpen(false);
          setSuccessData(data);
        }}
      />
    </>
  );
}
