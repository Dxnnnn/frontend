"use client";

import { useEffect } from "react";

const MARKER = "bc_session_active";

/**
 * Enforces browser-session-scoped login.
 * sessionStorage is cleared when the browser (all tabs) is closed.
 * On first mount after browser close, clears the server cookies and
 * redirects to the login page using a hard navigation (window.location)
 * so proxy.ts re-evaluates with the cleared cookies.
 */
export function useSessionGuard(loginPath: string) {
  useEffect(() => {
    const hasMarker = sessionStorage.getItem(MARKER);

    if (!hasMarker) {
      // Browser was closed — clear cookies then hard-redirect to login
      void fetch("/api/auth/logout", { method: "POST" }).finally(() => {
        window.location.replace(loginPath);
      });
    }
    // Keep the marker alive for this browser session
    sessionStorage.setItem(MARKER, "1");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Call this right after a successful login to mark the session as active.
 * Must be called before navigating to the dashboard.
 */
export function markSessionActive() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(MARKER, "1");
  }
}
