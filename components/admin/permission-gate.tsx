"use client";

import { useEffect, useState } from "react";

interface PermissionGateProps {
  /** One or more permission keys — if ANY is granted the content renders */
  requiredKeys: string[];
  children: React.ReactNode;
}

/**
 * Fetches live permissions from the API so changes take effect immediately
 * without requiring a re-login.
 *
 * Super Admins (adminRole === "Super Admin") bypass all checks via cookie check only.
 */
export function PermissionGate({ requiredKeys, children }: PermissionGateProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    // Fetch session + permissions from API (httpOnly cookie not readable via document.cookie)
    fetch("/api/admins/me/permissions", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { success?: boolean; permissions?: Record<string, boolean>; isSuperAdmin?: boolean }) => {
        if (d.isSuperAdmin) { setAllowed(true); return; }
        if (!d.success || !d.permissions) { setAllowed(false); return; }
        const ok = requiredKeys.some((k) => d.permissions![k] === true);
        setAllowed(ok);
      })
      .catch(() => setAllowed(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiredKeys.join(",")]);

  if (allowed === null) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <svg className="h-6 w-6 animate-spin text-slate-300" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden bg-slate-50 px-6 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8 text-red-500" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">Access Denied</h2>
        <p className="mt-1 text-sm text-slate-500 text-center max-w-xs">
          You do not have permission to access this module. Contact your Super Admin to request access.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
